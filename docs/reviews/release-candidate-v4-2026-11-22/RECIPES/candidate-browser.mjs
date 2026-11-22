/** Dist-only candidate acceptance; no package, source, storage or worker substitution. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {createResponder} from './runtime-server.mjs';
const source='E:/Warhammer/qa-tmp/release-candidate-v4/candidate';
const root='E:/Warhammer/qa-tmp/release-candidate-v4/package';
const out='E:/Warhammer/qa-evidence/release-candidate-v4-2026-11-22/browser-final';
const temporary='E:/Warhammer/qa-tmp/release-candidate-v4/browser-profiles-final';
const candidate='818d3b0c34503a166b58b21810666feafe858bc5';
const manifest=JSON.parse(fs.readFileSync(root+'/PAGES_RUNTIME_MANIFEST.json','utf8'));
const prefix='/warhammer-rules-complete-preview/';
const hash=b=>createHash('sha256').update(b).digest('hex');
assert.equal(execFileSync('git',['rev-parse','HEAD'],{cwd:source,encoding:'utf8'}).trim(),candidate);
assert.equal(execFileSync('git',['status','--porcelain'],{cwd:source,encoding:'utf8'}).trim(),'');
assert(!fs.existsSync(out));assert(!fs.existsSync(temporary));
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(temporary,{recursive:true});
const owner=JSON.parse(fs.readFileSync(source+'/v2/fixtures/new-recruit-plain-header-v37.25.json','utf8')).owner;
const fixture=fs.readFileSync(path.join(source,'v2/fixtures',owner.file));assert.equal(hash(fixture),owner.sha256);
const books=['death-guard','adeptus-mechanicus','chaos-space-marines','emperors-children','tyranids','tau-empire','space-marines','dark-angels','blood-angels'];
const sandbox={self:{}};vm.runInNewContext(fs.readFileSync(root+'/glossary/generated/cache-revision.js','utf8'),sandbox);
const mandatory=Array.from(sandbox.self.WH40K_PRECACHE),integrity=sandbox.self.WH40K_RUNTIME_ASSETS;
assert.equal(mandatory.length,221);
const osTemporary=path.join(temporary,'os-temp');fs.mkdirSync(osTemporary);for(const key of ['TMP','TEMP','TMPDIR'])process.env[key]=osTemporary;
const {chromium}=createRequire(source+'/package.json')('playwright');
const report={schema:'release-candidate-browser/v4',status:'RUNNING',candidate,
  package:{contentSha256:manifest.contentSha256,cacheRevision:manifest.cacheRevision},
  fixture:{file:owner.file,sha256:owner.sha256,encoding:owner.encoding},cases:[],privacy:'No raw roster or localStorage values are written to evidence.',tempEnvironment:{TMP:process.env.TMP,TEMP:process.env.TEMP,TMPDIR:process.env.TMPDIR}};
const save=()=>fs.writeFileSync(out+'/RESULTS.json',JSON.stringify(report,null,2)+'\n');save();
const explicitNavigations=new WeakSet();
const requests=[];let condition=null;
const responder=createResponder(()=>({root,label:candidate}),{prefix,records:requests,shape:()=>condition});
const server=responder.http();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
assert(![8765,8443].includes(server.address().port));
const origin=`http://127.0.0.1:${server.address().port}`,entry=origin+prefix+'v2/app.html';
async function ready(page){await page.waitForFunction(()=>!!window.WarhammerAppV2&&!document.querySelector('[data-v2-loading]'));await page.evaluate(()=>WarhammerAppV2.ready);}
async function go(page,id,roster=false){explicitNavigations.add(page);try{await page.goto(entry+(id?'?v2='+(roster?'ROSTER':'ARMY_BOOK')+'&book='+id:''),{waitUntil:'domcontentloaded'});await ready(page);}finally{explicitNavigations.delete(page);}}
async function native(page,id){
  await page.waitForFunction(id=>window.ArmyBookAppV2?.payload?.book?.id===id,id);
  await page.evaluate(async()=>{await WarhammerAppV2.ready;await ArmyBookAppV2.rosterPanel?.ready;await document.fonts.ready;});
}
async function fullReady(page){
  await page.waitForFunction(async expected=>{
    const worker=navigator.serviceWorker.controller;if(!worker)return false;
    const ask=type=>new Promise(resolve=>{const channel=new MessageChannel(),timer=setTimeout(()=>resolve(null),3000);channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data);};worker.postMessage({type},[channel.port2]);});
    const version=await ask('GET_VERSION'),status=await ask('WH_OFFLINE_PACKAGE_STATUS_QUERY');
    return version?.revision===expected&&status?.revision===expected&&status.status==='ready'&&status.completed===221&&status.total===221;
  },manifest.cacheRevision,{timeout:120000});
}
async function cacheProof(page){return page.evaluate(async({mandatory,integrity,prefix})=>{
  const worker=navigator.serviceWorker.controller;
  const version=await new Promise(resolve=>{const channel=new MessageChannel();channel.port1.onmessage=e=>{channel.port1.close();resolve(e.data);};worker.postMessage({type:'GET_VERSION'},[channel.port2]);});
  const cache=await caches.open(version.cacheName),bad=[];
  for(const relative of mandatory){
    const url=new URL(relative,location.origin+prefix),response=await cache.match(url.href),key=decodeURIComponent(url.pathname.slice(prefix.length))||'index.html',expected=integrity[key];
    if(!response||!expected){bad.push(relative);continue;}
    const body=await response.arrayBuffer(),actual=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',body)),b=>b.toString(16).padStart(2,'0')).join('');
    if(actual!==expected.sha256||body.byteLength!==expected.bytes)bad.push(relative);
  }
  return{revision:version.revision,keys:mandatory.length,bad};
},{mandatory,integrity,prefix});}
async function storage(page){return page.evaluate(()=>JSON.stringify(Object.keys(localStorage).sort().map(key=>[key,localStorage.getItem(key)])));}
function unchanged(actual,expected,label){assert(Buffer.from(actual).equals(Buffer.from(expected)),label+' byte mismatch; expectedSHA '+hash(expected)+', actualSHA '+hash(actual));}
async function shot(page,row,label){const name=row.width+'-'+label+'.jpg';await page.screenshot({path:out+'/'+name,type:'jpeg',quality:74,fullPage:false});row.screenshots.push(name);}
let context;
try{
  for(const width of [390,1440]){
    const row={width,status:'RUNNING',steps:[],screenshots:[],pageErrors:[],consoleErrors:[],failedRequests:[]};report.cases.push(row);
    let phase='cold';
    const launch=()=>chromium.launchPersistentContext(temporary+'/'+width,{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,viewport:{width,height:width===390?844:1000},isMobile:width===390,hasTouch:width===390,serviceWorkers:'allow'});
    const watch=page=>{const phases=new WeakMap();page.on('request',request=>phases.set(request,phase));page.setDefaultTimeout(60000);page.on('pageerror',error=>row.pageErrors.push({phase,message:error.message}));page.on('console',message=>{if(message.type()==='error')row.consoleErrors.push({phase,text:message.text(),location:message.location()});});page.on('requestfailed',request=>row.failedRequests.push({phase,startedPhase:phases.get(request),duringExplicitNavigation:explicitNavigations.has(page),resourceType:request.resourceType(),url:request.url(),failure:request.failure()}));};
    const step=async(name,operation)=>{phase=name;console.log(width+' '+name);const start=performance.now(),result=await operation();row.steps.push({name,status:'PASS',elapsedMs:Math.round(performance.now()-start),result});save();return result;};
    condition={downloadBps:9e6/8,latencyMs:170};context=await launch();let page=context.pages()[0]||await context.newPage();watch(page);
    await step('cold-home-Preparing-to-Ready',async()=>{
      await page.goto(origin+prefix,{waitUntil:'domcontentloaded'});await ready(page);
      assert.equal(await page.locator('[data-v2-book]').count(),9);
      await page.locator('[data-offline-package-status].is-visible:not([hidden]) .offline-package-label').filter({hasText:'Preparing offline access…'}).waitFor();
      assert.equal(await page.locator('.offline-package-label').innerText(),'Preparing offline access…');await shot(page,row,'preparing-offline');
      await page.waitForFunction(()=>document.querySelector('.offline-package-label')?.textContent==='Ready for offline use',null,{timeout:120000});
      await shot(page,row,'ready-offline');await fullReady(page);
      const proof=await cacheProof(page);assert.equal(proof.revision,manifest.cacheRevision);assert.deepEqual(proof.bad,[]);
      condition=null;return{homeBeforeOfflineReady:true,controlled:true,configuredNetwork:'Shared origin Fast4G 9Mbps/170ms for this cold functional scenario only',...proof};
    });
    await step('offline-unseen-books',async()=>{
      const saved=await page.evaluate(async()=>{const rows=[];for(const name of await caches.keys())for(const request of await(await caches.open(name)).keys())if(request.url.includes('/generated/app-presentation.json'))rows.push(request.url);return rows;});assert.deepEqual(saved,[]);
      await context.setOffline(true);
      for(const id of books){
        await go(page,id);
        assert.equal(await page.locator('.v2-home-intro').innerText(),"This Army Book isn't saved for offline use yet. Open it once while online, then it will work offline.");
        assert.equal(await page.locator('.unit-card').count(),0);
        if(id==='death-guard')await shot(page,row,'unseen-book-offline');
        await page.getByRole('link',{name:'Back to Home',exact:true}).click();await ready(page);assert.equal(await page.locator('[data-v2-book]').count(),9);
      }
      await context.setOffline(false);return{books:9,correctHintAndWorkingHomeAction:true};
    });
    const online=[];
    for(const id of books)await step('online-book-'+id,async()=>{
      await go(page,id);await native(page,id);
      const view=await page.evaluate(()=>({book:ArmyBookAppV2.payload.book.id,expected:ArmyBookAppV2.payload.groups.reduce((n,g)=>n+g.itemIds.length,0),shown:document.querySelectorAll('main .v2-library-card').length}));
      assert.equal(view.book,id);assert(view.expected>0);assert.equal(view.shown,view.expected);online.push(view);
      await page.waitForFunction(()=>Array.from(document.images).filter(image=>image.currentSrc).every(image=>image.complete));
      await shot(page,row,id);return view;
    });
    let saved,snapshot;
    await step('authentic-owner-DG-v37.25',async()=>{
      await go(page,'death-guard',true);await native(page,'death-guard');
      const details=page.locator('details[data-roster-import]');if(!await details.evaluate(node=>node.open))await details.locator(':scope > summary').click();
      await page.locator('[data-roster-input="raw-text"]').fill(fixture.toString('utf8'));await page.locator('[data-roster-action="review-import"]').click();
      await page.waitForFunction(()=>document.querySelector('.v2-roster-status')?.textContent==='Roster imported.'&&ArmyBookAppV2.roster.state.units.length===8);
      saved=await storage(page);snapshot=await page.evaluate(()=>JSON.stringify(ArmyBookAppV2.roster.snapshot()));
      await shot(page,row,'owner-DG-import');return{status:'READY',units:8,storageBytes:Buffer.byteLength(saved),storageSha256:hash(saved),snapshotSha256:hash(snapshot)};
    });
    await fullReady(page);await context.close();context=null;
    context=await launch();await context.setOffline(true);page=context.pages()[0]||await context.newPage();watch(page);
    await step('offline-fresh-process-home-nine-books-and-saved-DG',async()=>{
      await go(page);assert.equal(await page.locator('[data-v2-book]').count(),9);
      const offline=[];
      for(const id of books){await go(page,id);await native(page,id);offline.push(await page.evaluate(()=>({book:ArmyBookAppV2.payload.book.id,expected:ArmyBookAppV2.payload.groups.reduce((n,g)=>n+g.itemIds.length,0),shown:document.querySelectorAll('main .v2-library-card').length})));}
      assert.deepEqual(offline,online);
      await go(page,'death-guard',true);await native(page,'death-guard');assert.equal(await page.locator('[data-roster-instance-id]').count(),8);
      unchanged(await storage(page),saved,'All origin localStorage');unchanged(await page.evaluate(()=>JSON.stringify(ArmyBookAppV2.roster.snapshot())),snapshot,'Native DG snapshot');
      await shot(page,row,'offline-saved-DG');return{freshBrowserProcess:true,home:true,books:9,storageByteIdentical:true,nativeDGSnapshotByteIdentical:true};
    });
    const catalogPath=prefix+'books/shared/source-refs-v2/source-catalog.json';
    const expectedConsole=item=>item.phase==='offline-unseen-books'&&((new URL(item.location.url).pathname==='/favicon.ico'&&/net::ERR_FAILED/.test(item.text))||(new URL(item.location.url).pathname===catalogPath&&/status of 503/.test(item.text)));
    const expectedNetwork=item=>new URL(item.url).pathname===catalogPath&&item.startedPhase==='offline-unseen-books'&&item.duringExplicitNavigation===true&&item.failure?.errorText==='net::ERR_ABORTED';
    row.expectedOfflineConsole=row.consoleErrors.filter(expectedConsole);row.unexpectedConsole=row.consoleErrors.filter(item=>!expectedConsole(item));
    row.expectedNavigationCancellation=row.failedRequests.filter(expectedNetwork);row.unexpectedNetwork=row.failedRequests.filter(item=>!expectedNetwork(item));
    assert.deepEqual(row.pageErrors,[]);assert.equal(row.unexpectedConsole.length,0,'Unexpected console error');assert.equal(row.unexpectedNetwork.length,0,'Unexpected failed request');row.status='PASS';await context.close();context=null;save();
  }
  report.status='PASS';
}catch(error){report.status='FAIL';report.error=error.stack;process.exitCode=1;console.error(error.stack);}
finally{
  await context?.close();responder.close();server.closeAllConnections?.();await new Promise(resolve=>server.close(resolve));
  report.network={requests:requests.length,httpFailures:requests.filter(row=>row.status>=400)};save();console.log(JSON.stringify({status:report.status,out}));
}
