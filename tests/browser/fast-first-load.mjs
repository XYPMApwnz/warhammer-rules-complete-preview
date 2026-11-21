/** First-use background preparation, interrupted connectivity and native offline views.
 * Real package/worker/native fixture. No production state or DOM substitution.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {buildPagesRuntimePackage} from '../../tools/pages-runtime-package.mjs';
import {armyBooks} from '../../v2/army-books.mjs';
import {launchChromium} from '../helpers/browser-launch.mjs';
import {waitForPreparedOffline} from '../helpers/prepared-offline.mjs';
import {createQaTempDir,createQaEvidenceDir} from '../helpers/qa-temp.mjs';

const args=process.argv.slice(2),rootFlag=args.indexOf('--product-root');
if(args.length&&(rootFlag!==0||args.length!==2||!args[1]))throw Error('Usage: node tests/browser/fast-first-load.mjs [--product-root <checkout>]');
const source=path.resolve(rootFlag<0?fileURLToPath(new URL('../../',import.meta.url)):args[1]);
if(!process.env.QA_TMP_ROOT)process.env.QA_TMP_ROOT=process.platform==='win32'?'E:/Warhammer/qa-tmp/fast-first-load':path.resolve(source,'../qa-tmp/fast-first-load');
const out=path.resolve(process.env.WH_FAST_FIRST_LOAD_OUT||createQaEvidenceDir('wh-fast-first-load-'));
fs.mkdirSync(out,{recursive:true});
const workspace=createQaTempDir('wh-fast-first-load-work-'),runtime=path.join(workspace,'runtime');
const publication=buildPagesRuntimePackage({sourceRoot:source,outRoot:runtime});
const sandbox={self:{}};vm.runInNewContext(fs.readFileSync(path.join(runtime,'glossary/generated/cache-revision.js'),'utf8'),sandbox);
const mandatory=Array.from(sandbox.self.WH40K_PRECACHE||[]),core=Array.from(sandbox.self.WH40K_STARTUP_CORE||[]),integrity=sandbox.self.WH40K_RUNTIME_ASSETS;
const revision=sandbox.self.WH40K_CACHE_REVISION,cacheBytes=sandbox.self.WH40K_CACHE_BYTES;
assert.equal(mandatory.length,221,'The full offline inventory changed');assert(core.length>0&&core.length<mandatory.length,'A smaller declared startup core is required');
const coreSet=new Set(core),heldUrl=mandatory.find(url=>url.startsWith('./books/core-rules/reader/')&&url.split('?')[0].endsWith('.html')&&!coreSet.has(url));
assert(heldUrl,'No actual non-Home Core-reader HTML is available as a noncore fault input');
const heldPath=new URL(heldUrl,'https://runtime.invalid/').pathname.slice(1);
const fixtureMeta=JSON.parse(fs.readFileSync(path.join(source,'v2/fixtures/new-recruit-plain-header-v37.25.json'))).owner;
const ownerBytes=fs.readFileSync(path.join(source,'v2/fixtures',fixtureMeta.file));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
assert.equal(sha(ownerBytes),fixtureMeta.sha256,'The real DGv37.25 fixture changed');
const nextInput=path.join(workspace,'next-input'),nextRuntime=path.join(workspace,'next-runtime');
fs.cpSync(runtime,nextInput,{recursive:true});
fs.appendFileSync(path.join(nextInput,'books/shared/styles/offline-status.css'),'\n/* Synthetic next publication for background preparation QA. */\n');
const nextPublication=buildPagesRuntimePackage({sourceRoot:nextInput,outRoot:nextRuntime,manifestFile:fileURLToPath(new URL('../../tools/pages-runtime-manifest.json',import.meta.url))});
assert.notEqual(nextPublication.cacheRevision,revision,'The next publication must have a distinct revision');
assert.notEqual(sha(fs.readFileSync(path.join(runtime,heldPath))),sha(fs.readFileSync(path.join(nextRuntime,heldPath))),'Held HTML must contain different stamped next-publication bytes');
for(const file of publication.files.filter(file=>file.path.endsWith('.json')))assert.equal(sha(fs.readFileSync(path.join(nextRuntime,file.path))),file.sha256,'Synthetic update changed factual JSON');
const books=armyBooks.map(book=>book.id);assert.equal(books.length,9);assert.equal(new Set(books).size,9);
const report={publication,revision,cacheBytes,nextRevision:nextPublication.cacheRevision,coreUrls:core,mandatoryUrls:mandatory.length,heldPath,fixture:{file:fixtureMeta.file,sha256:fixtureMeta.sha256},results:[],pageExceptions:[],networkFailures:[]};
const prefix='/warhammer-rules-complete-preview/',held=new Set(),heldArt=new Set(),requests=[];
const mime={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.webmanifest':'application/manifest+json'};
let mode='held',generation='A',holdArtPath=null,phase='startup',browser,context,page,traceActive=false,privateImportStarted=false,navigations=0;
function sendFile(request,response,relative,record){
 const selected=generation==='A'?runtime:nextRuntime,file=path.resolve(selected,relative);assert(file.startsWith(selected+path.sep));assert(fs.statSync(file).isFile());
 const body=fs.readFileSync(file),etag='"'+sha(body)+'"';record.servedGeneration=generation;
 const headers={'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':relative==='service-worker.js'?'no-cache':'public, max-age=600','etag':etag};
 if(relative==='service-worker.js')headers['service-worker-allowed']=prefix;
 if(request.headers['if-none-match']===etag){record.status=304;response.writeHead(304,headers).end();return;}
 record.status=200;response.writeHead(200,{...headers,'content-length':body.length});response.end(request.method==='HEAD'?undefined:body);
}
const server=http.createServer((request,response)=>{
 const url=new URL(request.url,'http://localhost'),record={path:url.pathname+url.search,phase,status:null,held:false};requests.push(record);
 try{
  if(url.pathname==='/favicon.ico'){record.status=204;response.writeHead(204).end();return;}
  if(mode==='outage'){record.status=503;response.writeHead(503,{'content-type':'text/plain','cache-control':'no-store'}).end('Injected connectivity outage');return;}
  assert(url.pathname.startsWith(prefix));
  let relative=decodeURIComponent(url.pathname.slice(prefix.length));if(!relative||relative.endsWith('/'))relative+='index.html';
  if(mode==='held'&&relative===heldPath){record.held=true;const item={request,response,relative,record};held.add(item);response.once('close',()=>held.delete(item));return;}
  if(relative===holdArtPath){record.heldArt=true;const item={request,response,relative,record};heldArt.add(item);response.once('close',()=>heldArt.delete(item));return;}
  sendFile(request,response,relative,record);
 }catch{record.status=404;response.writeHead(404,{'content-type':'text/plain'}).end('Missing runtime resource');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}${prefix}`,entry=base+'v2/app.html';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function poll(fn,{arg,timeout=30000,label='browser condition'}={}){
 const until=Date.now()+timeout;while(Date.now()<until){try{const value=await page.evaluate(fn,arg);if(value)return value;}catch(error){if(!/context|navigation|destroyed/i.test(error.message))throw error;}await sleep(50);}throw Error('Timed out: '+label);
}
async function ready(){await poll(()=>Boolean(window.WarhammerAppV2)&&!document.querySelector('[data-v2-loading]'),{label:'interactive application'});await page.evaluate(async()=>{await WarhammerAppV2.ready;});}
async function go(query=''){await page.goto(entry+query,{waitUntil:'domcontentloaded'});await ready();}
async function smallIndicator(text){
 await page.locator('[data-offline-package-status].is-visible:not([hidden]) .offline-package-label').filter({hasText:text}).waitFor();
 assert.equal(await page.locator('.offline-package-label').innerText(),text,'The visible offline copy must be exact');
 const live=page.locator('.offline-package-announcement');assert.equal(await live.getAttribute('aria-live'),'polite');assert.equal(await live.getAttribute('role'),'status');assert.equal(await live.innerText(),text,'The live announcement must match the visible state');
}
async function offlineStatus(){return page.evaluate(()=>WHOfflineStatus.query());}
async function cacheProof(){
 return page.evaluate(async({mandatory,integrity,revision,cacheBytes,base})=>{
  const registration=await navigator.serviceWorker.getRegistration(),worker=registration?.active;if(!worker)throw Error('No active worker');
  const ask=type=>new Promise((resolve,reject)=>{const channel=new MessageChannel(),timer=setTimeout(()=>reject(Error('Worker reply timed out')),3000);channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(event.data);};worker.postMessage({type},[channel.port2]);});
  const version=await ask('GET_VERSION'),status=await ask('WH_OFFLINE_PACKAGE_STATUS_QUERY');
  if(version.revision!==revision||version.cacheBytes!==cacheBytes||!version.cacheName?.includes(cacheBytes))throw Error('Wrong active publication namespace');
  const cache=await caches.open(version.cacheName),missing=[],mismatches=[];
  for(const relative of mandatory){
   const url=new URL(relative,new URL('service-worker.js',base)),response=await cache.match(url.href),key=decodeURIComponent(url.pathname.slice(new URL(base).pathname.length))||'index.html',expected=integrity[key];
   if(!response||!expected){missing.push(relative);continue;}
   const bytes=await response.arrayBuffer(),actual=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),value=>value.toString(16).padStart(2,'0')).join('');
   if(actual!==expected.sha256||bytes.byteLength!==expected.bytes)mismatches.push(relative);
  }
  return{active:worker.state,controlled:!!navigator.serviceWorker.controller,version,status,expected:mandatory.length,missing,mismatches};
 },{mandatory,integrity,revision,cacheBytes,base});
}
async function storage(){return page.evaluate(()=>JSON.stringify(Object.entries(localStorage).sort(([a],[b])=>a.localeCompare(b))));}
function equalPrivateBytes(actual,expected,label){if(actual!==expected)throw Error(label+' changed; expected SHA256 '+sha(expected)+', actual '+sha(actual));}
async function snapshot(){return page.evaluate(()=>JSON.stringify(ArmyBookAppV2.roster.snapshot()));}
async function book(id){
 await go('?v2=ARMY_BOOK&book='+encodeURIComponent(id));
 await poll(()=>Boolean(window.ArmyBookAppV2?.payload?.book?.id),{label:'native book payload'});
 const state=await page.evaluate(()=>({bookId:ArmyBookAppV2.payload.book.id,cards:document.querySelectorAll('main .unit-card').length}));
 assert.equal(state.bookId,id);assert(state.cards>0,'A native Army Book must have datasheets');return state;
}
async function imageProof(){
 const bindings=await page.evaluate(()=>Object.entries(ArmyBookAppV2.payload.datasheetPresentation.artwork).map(([cardId,art])=>({cardId,asset:art.asset})));
 assert(bindings.length>1,'The published DG bindings need more than one artwork case');
 const actualSourceRoot=fileURLToPath(new URL('../../',import.meta.url)),registration=armyBooks.find(book=>book.id==='death-guard');
 const published=new Set(publication.files.map(file=>file.path));
 for(const binding of bindings){const asset=new URL('../'+binding.asset,registration.assetBaseURL);assert.equal(asset.protocol,'file:');binding.relative=path.relative(actualSourceRoot,fileURLToPath(asset)).replaceAll('\\','/');assert(published.has(binding.relative),'Bound artwork is not published');binding.pathname=prefix+binding.relative;}
 const paths=new Set(bindings.map(binding=>binding.pathname));
 const placeholders=await page.locator('.unit-art img,.unit-art-background img').evaluateAll(images=>images.map(image=>({cardId:image.closest('.unit-card').dataset.cardId,deferred:!image.hasAttribute('src')})));
 assert.deepEqual([...new Set(placeholders.map(row=>row.cardId))].sort(),bindings.map(row=>row.cardId).sort(),'All published art-to-card bindings must retain their placeholders');
 const initialRequests=requests.filter(row=>row.phase==='online-death-guard'&&paths.has(row.path.split('?')[0]));
 const alreadyRequested=new Set(requests.map(row=>row.path.split('?')[0]));
 assert(initialRequests.length<paths.size,'Opening DG must not download all offscreen unit art');
 const candidate=bindings.find(binding=>placeholders.some(row=>row.cardId===binding.cardId&&row.deferred)&&!alreadyRequested.has(binding.pathname));assert(candidate,'No uncached deferred bound artwork is available');
 holdArtPath=candidate.relative;
 await page.evaluate(async id=>{await ArmyBookAppV2.open(id);},candidate.cardId);
 const cardSelector='.unit-card[data-card-id='+JSON.stringify(candidate.cardId)+']:visible';
 const selector=cardSelector+' .unit-art img,'+cardSelector+' .unit-art-background img';
 const visible=page.locator(selector).first();await visible.waitFor();
 const artDeadline=Date.now()+10000;while(!heldArt.size&&Date.now()<artDeadline)await sleep(25);assert(heldArt.size>0,'The newly visible artwork was not requested through the held server input');
 const placeholder=await visible.evaluate(image=>{const box=image.closest('.unit-card').querySelector('.unit-header').getBoundingClientRect();return{width:box.width,height:box.height,naturalWidth:image.naturalWidth};});
 assert(placeholder.width>0&&placeholder.height>0,'The placeholder must be measured on a visible card');assert.equal(placeholder.naturalWidth,0,'The held art decoded before the placeholder measurement');
 await page.screenshot({path:path.join(out,'390-dg-deferred-art.png'),fullPage:false});
 holdArtPath=null;for(const item of [...heldArt]){heldArt.delete(item);sendFile(item.request,item.response,item.relative,item.record);}
 await visible.evaluate(async image=>{await image.decode();});
 const loaded=await visible.evaluate(image=>{const box=image.closest('.unit-card').querySelector('.unit-header').getBoundingClientRect();return{width:box.width,height:box.height,src:image.src,naturalWidth:image.naturalWidth};});
 assert.equal(loaded.width,placeholder.width,'Loading art changed header width');assert.equal(loaded.height,placeholder.height,'Loading art shifted header height');assert(loaded.naturalWidth>0);
 assert.equal(new URL(loaded.src).searchParams.get('wh-pwa'),revision,'Visible art must use the current publication tag');
 const observations=await page.evaluate(()=>window.__qaUnitArtObservations||[]);assert(observations.length>0);assert(observations.every(row=>row.visible),'A unit art URL was assigned outside the visible viewport');
 await page.screenshot({path:path.join(out,'390-dg-visible-art.png'),fullPage:false});return{boundCards:bindings.length,boundAssetPaths:paths.size,initialRequests:initialRequests.length,placeholder:{width:placeholder.width,height:placeholder.height},loaded:{width:loaded.width,height:loaded.height},observations};
}

async function openContext(){
 context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'allow'});
 await context.tracing.start({screenshots:true,snapshots:true,sources:false});traceActive=true;
 await context.addInitScript(()=>{
  window.__qaUnitArtObservations=[];window.__qaOfflineStatuses=[];const seen=new WeakSet(),selector='.unit-art img[src],.unit-art-background img[src]';
  navigator.serviceWorker.addEventListener('message',event=>{const value=event.data;if(value?.type==='WH_OFFLINE_PACKAGE_STATUS')window.__qaOfflineStatuses.push({revision:value.revision,status:value.status,completed:value.completed,total:value.total});});
  const inspect=node=>{if(node.nodeType!==1)return;const images=node.matches(selector)?[node]:[...node.querySelectorAll(selector)];for(const image of images){if(seen.has(image))continue;seen.add(image);const rect=image.getBoundingClientRect();window.__qaUnitArtObservations.push({path:new URL(image.src).pathname,visible:image.isConnected&&image.getClientRects().length>0&&rect.width>0&&rect.height>0&&rect.bottom>0&&rect.right>0&&rect.top<innerHeight&&rect.left<innerWidth});}};
  new MutationObserver(records=>{for(const record of records){if(record.type==='attributes')inspect(record.target);else for(const node of record.addedNodes)inspect(node);}}).observe(document,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});
 });
 page=await context.newPage();page.setDefaultTimeout(30000);page.on('framenavigated',frame=>{if(frame===page.mainFrame())navigations++;});
 page.on('pageerror',error=>report.pageExceptions.push({phase,name:error.name,messageSha256:sha(error.message)}));
 page.on('requestfailed',request=>{const url=new URL(request.url());report.networkFailures.push({phase,path:/^https?:$/.test(url.protocol)?url.pathname:'[non-HTTP resource]',error:request.failure()?.errorText});});
}

try{
 browser=await launchChromium();await openContext();
 await go();assert.equal(await page.locator('[data-v2-book]').count(),9);
 const holdDeadline=Date.now()+15000;while(!held.size&&Date.now()<holdDeadline)await sleep(50);assert(held.size>0,'The actual noncore download was not held');
 await smallIndicator('Preparing offline access…');const preparing=await offlineStatus();assert(preparing.coreReady);assert(preparing.completed<221);assert.notEqual(preparing.status,'ready');
 await page.screenshot({path:path.join(out,'390-preparing.png'),fullPage:true});
 report.results.push({case:'interactive Home while actual noncore mandatory response is held',status:'PASS',completed:preparing.completed,total:preparing.total});
 const beforeOutage=await storage(),navigationBeforeOutage=navigations,address=page.url();phase='offline-before-ready';mode='outage';await context.setOffline(true);for(const item of held)item.response.destroy();held.clear();
 await smallIndicator('Offline access not ready — will retry');assert.equal(await page.locator('[data-v2-book]').count(),9);assert.equal(await page.locator('[data-v2-loading]').count(),0);assert.equal(page.url(),address);
 await sleep(750);assert.equal(navigations,navigationBeforeOutage,'Connectivity loss caused a reload loop');equalPrivateBytes(await storage(),beforeOutage,'Storage during interrupted preparation');
 await page.screenshot({path:path.join(out,'390-offline-not-ready.png'),fullPage:true});
 phase='online-recovery';mode='normal';await context.setOffline(false);
 await smallIndicator('Ready for offline use');await page.screenshot({path:path.join(out,'390-ready.png'),fullPage:true});
 await waitForPreparedOffline(page);const proof=await cacheProof();assert.equal(proof.active,'activated');assert.equal(proof.controlled,true);assert.equal(proof.status.status,'ready');assert.equal(proof.status.completed,221);assert.equal(proof.status.total,221);assert.equal(proof.status.coreReady,true);assert.deepEqual(proof.missing,[]);assert.deepEqual(proof.mismatches,[]);
 equalPrivateBytes(await storage(),beforeOutage,'Storage after automatic recovery');assert.equal(navigations,navigationBeforeOutage,'Automatic recovery reloaded the working Home');
 await page.waitForFunction(()=>document.querySelector('[data-offline-package-status]')?.hidden===true,null,{timeout:6000});
 report.results.push({case:'offline beforeReady is actionable and automatically recovers without reload or storage changes',status:'PASS',verifiedKeys:221,verifiedHashes:221,navigationsDuringOutageAndRecovery:navigations-navigationBeforeOutage});
 const online=[];for(const id of books){phase='online-'+id;online.push(await book(id));if(id==='death-guard')report.unitArt=await imageProof();}report.onlineBooks=online;
 // Import action arguments and hidden export text must never enter a public trace.
 await context.tracing.stop();traceActive=false;privateImportStarted=true;
 phase='dg-owner-import';await go('?v2=ROSTER&book=death-guard');const raw=page.locator('[data-roster-input="raw-text"]');await raw.waitFor();await raw.fill(ownerBytes.toString('utf8'));await page.locator('[data-roster-action="review-import"]').click();
 await poll(()=>window.ArmyBookAppV2?.roster?.state?.units?.length>0&&!document.querySelector('[data-roster-view][aria-busy="true"]'),{label:'real owner DGv37.25 import'});
 const savedRoster=await snapshot(),savedStorage=await storage();assert(savedStorage.length>2,'The imported roster was not saved');
 phase='offline-reopen';await context.setOffline(true);await go();assert.equal(await page.locator('[data-v2-book]').count(),9);
 const offline=[];for(const id of books){phase='offline-'+id;offline.push(await book(id));}report.offlineBooks=offline;assert.deepEqual(offline,online,'Offline native books changed their datasource identity or datasheet count');
 phase='offline-saved-dg';await go('?v2=ROSTER&book=death-guard');equalPrivateBytes(await snapshot(),savedRoster,'Saved DG roster');equalPrivateBytes(await storage(),savedStorage,'Raw localStorage/settings bytes');
 await page.reload({waitUntil:'domcontentloaded'});await ready();equalPrivateBytes(await snapshot(),savedRoster,'Saved DG roster on second offline visit');equalPrivateBytes(await storage(),savedStorage,'Raw storage on second offline visit');
 report.results.push({case:'nine warmed native books and real saved DG roster reopen offline, including second visit',status:'PASS',books:9,rosterSha256:sha(savedRoster),storageSha256:sha(savedStorage),storageBytes:Buffer.byteLength(savedStorage)});
 await context.close();

 // Real next-publication bytes replace a held A response on the same origin.
 // This profile has no imported private data, so a failure trace is safe.
 phase='mid-download-version-change';privateImportStarted=false;generation='A';mode='held';await openContext();await go();
 const updateHoldDeadline=Date.now()+15000;while(!held.size&&Date.now()<updateHoldDeadline)await sleep(50);assert(held.size>0,'The A background stream was not held');
 await smallIndicator('Preparing offline access…');const partial=await offlineStatus();assert(partial.completed<221);assert.equal(partial.revision,revision);
 const oldStorage=await storage(),oldMain=await page.locator('[data-v2-mount-root]').innerHTML(),oldAddress=page.url(),oldNavigations=navigations;
 generation='B';mode='normal';for(const item of [...held]){held.delete(item);sendFile(item.request,item.response,item.relative,item.record);}
 await page.locator('[data-pwa-updater][data-state="changed"], [data-pwa-updater][data-state="ready"]').waitFor();
 const rejected=await cacheProof();assert.equal(rejected.version.revision,revision,'A changed its active revision without user confirmation');assert.notEqual(rejected.status.status,'ready');assert(rejected.status.completed<221);assert(rejected.missing.includes(heldUrl),'Foreign B bytes were cached under the partial A publication');assert.deepEqual(rejected.mismatches,[],'A cache contains foreign-publication bytes');
 await page.evaluate(async()=>{await(await navigator.serviceWorker.getRegistration()).update();});
 await poll(()=>navigator.serviceWorker.getRegistration().then(registration=>registration?.waiting?.state==='installed'),{label:'next worker waiting for explicit confirmation'});
 const waiting=await page.evaluate(async()=>{const registration=await navigator.serviceWorker.getRegistration();return new Promise((resolve,reject)=>{const channel=new MessageChannel(),timer=setTimeout(()=>reject(Error('Waiting version reply timed out')),3000);channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(event.data);};registration.waiting.postMessage({type:'GET_VERSION'},[channel.port2]);});});
 assert.equal(waiting.revision,nextPublication.cacheRevision,'The waiting worker must belong to B');
 await sleep(750);const retained=await cacheProof();assert.equal(retained.version.revision,revision);assert.notEqual(retained.status.status,'ready');assert.deepEqual(retained.mismatches,[]);
 assert.equal(navigations,oldNavigations,'A working screen automatically reloaded for B');assert.equal(page.url(),oldAddress);equalPrivateBytes(await storage(),oldStorage,'Storage during mid-download publication change');equalPrivateBytes(await page.locator('[data-v2-mount-root]').innerHTML(),oldMain,'Working Home during mid-download publication change');
 const leakedReady=await page.evaluate(()=>window.__qaOfflineStatuses.filter(row=>row.revision===WHPwaExpectedRevision&&row.status==='ready'));assert.deepEqual(leakedReady,[],'A claimed full readiness after receiving foreign B bytes');
 assert.equal(await page.locator('[data-pwa-update-action]').isVisible(),true);assert.equal(await page.locator('[data-pwa-update-action]').isEnabled(),true);assert((await page.locator('[data-pwa-update-action]').innerText()).trim(),'The manual update button needs an accessible label');
 await page.screenshot({path:path.join(out,'390-mid-download-version-change.png'),fullPage:true});
 report.results.push({case:'publication changes during A background preparation: foreign bytes rejected, A never ready, B waits, working A and storage retained',status:'PASS',activeRevision:retained.version.revision,waitingRevision:waiting.revision,missingInA:retained.missing.length,foreignHashesInA:0,automaticNavigations:0});
 await context.tracing.stop();traceActive=false;
 assert.equal(report.pageExceptions.length,0,'Unexpected uncaught page exceptions');report.status='PASS';console.log('Fast first load browser PASS: interactive background preparation, recovery,221hashes,9offline books, savedDG, lazy art');
}catch(error){
 report.status='FAIL';report.failurePhase=phase;report.error={name:error.name,code:error.code||null,message:error.code==='ERR_ASSERTION'?error.message.split('\n')[0]:'Private diagnostic retained in task scratch',messageSha256:sha(error.message),frames:String(error.stack||'').split('\n').filter(line=>/^\s+at\s/.test(line))};
 const privateDiagnostic=path.join(workspace,'failure.private.txt');fs.writeFileSync(privateDiagnostic,String(error.stack||error));report.privateDiagnostic=privateDiagnostic;
 if(traceActive)await context.tracing.stop({path:path.join(out,'failure-public-flow.trace.zip')}).catch(()=>{});traceActive=false;
 if(page&&!privateImportStarted)await page.screenshot({path:path.join(out,'failure.png'),fullPage:true}).catch(()=>{});else report.failureScreenshotSkippedForImportPrivacy=true;
 console.error('Fast first load browser FAIL at '+phase+'; see '+path.join(out,'REPORT.json'));process.exitCode=1;
}finally{
 for(const item of [...held,...heldArt])item.response.destroy();held.clear();heldArt.clear();if(browser)await browser.close();server.closeAllConnections?.();await new Promise(resolve=>server.close(resolve));
 report.requests=requests;fs.writeFileSync(path.join(out,'REPORT.json'),JSON.stringify(report,null,2)+'\n');console.log('Evidence '+out);
}
