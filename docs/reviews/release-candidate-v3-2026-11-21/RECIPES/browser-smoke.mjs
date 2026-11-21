/** Candidate-only observations. No repository edits or live preview changes. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {createResponder} from 'file:///E:/Warhammer/qa-evidence/preview-v1-2026-11-14/RECIPES/runtime-server.mjs';
const out='E:/Warhammer/qa-evidence/release-candidate-v3-2026-11-21/browser';
const source='E:/Warhammer/qa-tmp/release-candidate/candidate',root='E:/Warhammer/qa-tmp/release-candidate/runtime-e3db1b34';
const temporary='E:/Warhammer/qa-tmp/release-candidate/smoke-profiles';
const sha='e3db1b345eca989436eea7af758900eee7795203',prefix='/warhammer-rules-complete-preview/';
const manifest=JSON.parse(fs.readFileSync(root+'/PAGES_RUNTIME_MANIFEST.json'));
const hash=b=>createHash('sha256').update(b).digest('hex');
assert.equal(execFileSync('git',['rev-parse','HEAD'],{cwd:source,encoding:'utf8'}).trim(),sha);
assert.equal(execFileSync('git',['status','--porcelain'],{cwd:source,encoding:'utf8'}).trim(),'');
assert(!fs.existsSync(out));assert(!fs.existsSync(temporary));fs.mkdirSync(out,{recursive:true});fs.mkdirSync(temporary,{recursive:true});
const owner=JSON.parse(fs.readFileSync(source+'/v2/fixtures/new-recruit-plain-header-v37.25.json')).owner;
const fixture='v2/fixtures/'+owner.file,fixtureBytes=fs.readFileSync(source+'/'+fixture);
assert.equal(hash(fixtureBytes),owner.sha256);assert(fixtureBytes.toString('utf8').includes('v37.25'));
const books=['death-guard','adeptus-mechanicus','chaos-space-marines','emperors-children','tyranids','tau-empire','space-marines','dark-angels','blood-angels'];
const {chromium}=createRequire(source+'/package.json')('playwright');
const report={schema:'release-candidate-browser-smoke/v3',status:'RUNNING',candidate:sha,started:new Date().toISOString(),
 package:{aggregateSha256:manifest.contentSha256,cacheRevision:manifest.cacheRevision,prefix},fixture:{path:fixture,sha256:owner.sha256,encoding:owner.encoding},cases:[]};
const save=()=>fs.writeFileSync(out+'/RESULTS.json',JSON.stringify(report,null,2)+'\n');save();
const requests=[],app=createResponder(()=>({root,label:sha}),{prefix,records:requests}),server=app.http();
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
const origin='http://127.0.0.1:'+server.address().port,entry=origin+prefix+'v2/app.html';
assert(![8765,8443].includes(server.address().port));
async function ready(page){await page.waitForFunction(()=>window.WarhammerAppV2&&!document.querySelector('[data-v2-loading]')&&!document.body.hasAttribute('data-pwa-bootstrap-state'));await page.evaluate(()=>WarhammerAppV2.ready);}
async function home(page){await page.goto(origin+prefix,{waitUntil:'domcontentloaded'});await ready(page);await page.waitForFunction(()=>document.querySelectorAll('main.v2-library-home [data-v2-book]').length===9);}
async function native(page,book){await page.waitForFunction(id=>window.ArmyBookAppV2?.payload?.book?.id===id,book);await page.evaluate(async()=>{await WarhammerAppV2.ready;await ArmyBookAppV2.rosterPanel?.ready;await document.fonts.ready;});}
async function worker(page){return page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();const w=navigator.serviceWorker.controller;if(!w)return null;return new Promise(resolve=>{const c=new MessageChannel(),t=setTimeout(()=>resolve({timeout:true}),3000);c.port1.onmessage=e=>{clearTimeout(t);c.port1.close();resolve(e.data);};w.postMessage({type:'GET_VERSION'},[c.port2]);});});}
async function shot(page,row,name){const file=row.width+'-'+name+'.jpg';await page.screenshot({path:path.join(out,file),type:'jpeg',quality:72,fullPage:false});row.screenshots.push(file);}
function watch(page,row,phase){page.setDefaultTimeout(30000);page.setDefaultNavigationTimeout(30000);page.on('pageerror',e=>row.errors.push({phase,message:e.message}));page.on('console',m=>{if(m.type()==='error')row.console.push({phase,text:m.text()});});page.on('requestfailed',r=>row.failedRequests.push({phase,url:r.url(),failure:r.failure()}));}
try{for(const width of [390,1440]){
 const row={width,status:'RUNNING',steps:[],books:[],screenshots:[],errors:[],console:[],failedRequests:[]};report.cases.push(row);let context,page;
 const launch=()=>chromium.launchPersistentContext(path.join(temporary,String(width)),{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,viewport:{width,height:width===390?844:1000},isMobile:width===390,hasTouch:width===390,serviceWorkers:'allow'});
 const step=async(name,fn)=>{console.log('SMOKE '+width+' '+name);const t=performance.now();const result=await fn();row.steps.push({name,status:'PASS',elapsedMs:Math.round(performance.now()-t),result});save();return result;};
 try{
  context=await launch();page=context.pages()[0]||await context.newPage();watch(page,row,'online');
  await step('fresh-home-and-install',async()=>{await home(page);const ids=await page.locator('main [data-v2-book]').evaluateAll(nodes=>nodes.map(n=>n.dataset.v2Book));assert.deepEqual(ids.slice().sort(),books.slice().sort());await page.waitForFunction(async()=>{const r=await navigator.serviceWorker.getRegistration();return!!(r?.active&&navigator.serviceWorker.controller&&!r.installing&&!r.waiting);});const state=await worker(page);assert.equal(state.revision,manifest.cacheRevision);await shot(page,row,'home');return{books:ids,worker:state};});
  for(const book of books)await step('open-'+book,async()=>{await home(page);await page.locator('[data-v2-book="'+book+'"]').click();await native(page,book);await page.locator('main .v2-hero h1').waitFor();const view=await page.evaluate(()=>({book:ArmyBookAppV2.payload.book.id,title:document.querySelector('main .v2-hero h1').textContent,expected:ArmyBookAppV2.payload.groups.reduce((n,g)=>n+g.itemIds.length,0),shown:document.querySelectorAll('main .v2-library-card').length}));assert.equal(view.book,book);assert(view.title);assert(view.expected>0);assert.equal(view.shown,view.expected);row.books.push(view);await shot(page,row,book);return view;});
  let saved,snapshot;
  await step('import-owner-DG-v37.25',async()=>{await page.goto(entry+'?v2=ROSTER&book=death-guard',{waitUntil:'domcontentloaded'});await ready(page);await native(page,'death-guard');const panel=page.locator('details[data-roster-import]');if(!await panel.evaluate(n=>n.open))await panel.locator(':scope > summary').click();await page.locator('[data-roster-input="raw-text"]').fill(fixtureBytes.toString('utf8'));await page.locator('[data-roster-action="review-import"]').click();await page.waitForFunction(()=>document.querySelector('.v2-roster-status')?.textContent==='Roster imported.');await page.waitForFunction(()=>window.ArmyBookAppV2?.roster?.state?.units?.length===8&&!document.querySelector('[data-roster-view][aria-busy="true"]'));const value=await page.evaluate(()=>({saved:localStorage.getItem('army-book-app-v2:roster:death-guard'),snapshot:ArmyBookAppV2.roster.snapshot(),points:ArmyBookAppV2.roster.points}));saved=value.saved;snapshot=value.snapshot;assert(saved);assert.deepEqual(JSON.parse(saved),snapshot);await shot(page,row,'owner-DG-import');row.ownerImport={status:'READY',units:snapshot.units.length,points:value.points,savedBytes:Buffer.byteLength(saved),savedSha256:hash(saved)};return row.ownerImport;});
  await context.close();context=null;
  context=await launch();await context.setOffline(true);page=context.pages()[0]||await context.newPage();watch(page,row,'offline-fresh-process');
  await step('fresh-process-offline-home',async()=>{await home(page);assert.equal((await worker(page)).revision,manifest.cacheRevision);await shot(page,row,'offline-home');return{offline:true,freshBrowserProcess:true};});
  await step('offline-saved-DG',async()=>{await page.goto(entry+'?v2=ROSTER&book=death-guard',{waitUntil:'domcontentloaded'});await ready(page);await native(page,'death-guard');await page.waitForFunction(()=>window.ArmyBookAppV2?.roster?.state?.units?.length===8);const after=await page.evaluate(()=>({saved:localStorage.getItem('army-book-app-v2:roster:death-guard'),snapshot:ArmyBookAppV2.roster.snapshot()}));assert.equal(after.saved,saved);assert.deepEqual(after.snapshot,snapshot);await shot(page,row,'offline-DG');return{units:8,savedByteIdentical:true,snapshotDeepEqual:true};});
  assert.deepEqual(row.errors,[]);row.status='PASS';
 }catch(error){row.status='FAIL';row.error=error.stack||error.message;if(page&&!page.isClosed())await page.screenshot({path:path.join(out,width+'-failure.jpg'),type:'jpeg',quality:72}).catch(()=>{});}
 finally{await context?.close();save();}
 if(row.status!=='PASS')break;
}
 report.status=report.cases.length===2&&report.cases.every(row=>row.status==='PASS')?'PASS':'FAIL';
}catch(error){report.status='ERROR';report.error=error.stack||error.message;}
finally{app.close();server.closeAllConnections?.();await new Promise(resolve=>server.close(resolve));report.finished=new Date().toISOString();report.network={requests:requests.length,httpErrors:requests.filter(r=>r.status>=400)};save();}
console.log(JSON.stringify({status:report.status,candidate:sha,cases:report.cases.map(r=>({width:r.width,status:r.status,books:r.books.length,ownerUnits:r.ownerImport?.units,error:r.error||null}))}));
if(report.status!=='PASS')process.exitCode=1;
