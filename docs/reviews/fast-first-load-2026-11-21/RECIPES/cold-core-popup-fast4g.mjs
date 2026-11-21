/** Actual cold publication + active SW, shared Fast4G. No production/test edits. */
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import vm from 'node:vm';import {createHash} from 'node:crypto';import {pathToFileURL} from 'node:url';
import {startLocal,startProxy,NETWORKS} from '../measurement-recipes/transport.mjs';
const ROOT='E:/Warhammer/worktrees/fast-first-load-v1',BASE='E:/Warhammer/qa-tmp/fast-first-load/base';
const OUT='E:/Warhammer/qa-evidence/fast-first-load-v1-2026-11-21/cold-core-fast4g-10x';
const TMP='E:/Warhammer/qa-tmp/fast-first-load/cold-core-fast4g-10x';
assert(!fs.existsSync(OUT),'Never overwrite a prior diagnostic series');fs.mkdirSync(OUT,{recursive:true});fs.mkdirSync(TMP,{recursive:true});
process.env.QA_TMP_ROOT=TMP;process.env.WH_PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='C:/Program Files/Google/Chrome/Application/chrome.exe';
const {launchChromium}=await import(pathToFileURL(ROOT+'/tests/helpers/browser-launch.mjs').href);
const sha=b=>createHash('sha256').update(b).digest('hex'),epoch=()=>performance.timeOrigin+performance.now();
const source=fs.readFileSync(ROOT+'/v2/core-reader-browser-qa.mjs','utf8');assert.equal(source,fs.readFileSync(BASE+'/v2/core-reader-browser-qa.mjs','utf8'));
const a=source.indexOf('async function assertCorePopup('),b=source.indexOf('\nconst navigate=',a);assert(a>=0&&b>a);
const exact=source.slice(a,b);assert.equal(exact.split("path:'/v2/app.html'").length,2);
const popupFunction=(entryPath)=>new Function('assert','entryPath','return '+exact.replace("path:'/v2/app.html'",'path:entryPath'))(assert,entryPath);
fs.writeFileSync(OUT+'/ASSERT_CORE_POPUP_ORIGINAL.txt',exact+'\n');
const inputs={base:{root:'E:/Warhammer/qa-tmp/fast-first-load/package-base',sha:'8579a7a77c7f5e8dad291afc11b27aab3cd9d73a',content:'0fab482c0fa7f4132c9bbb60646e880afca25f2b5823ab7fc1bd62322e67b909'},head:{root:'E:/Warhammer/qa-tmp/fast-first-load/package-final-c4',sha:'e08ec20df980d4e6700c32b65069de983b250e03',content:'32efc21a7166f44a2d758ce869139e0191a30195abeccdc22884953cb1668b2b'}};
for(const input of Object.values(inputs)){
 input.manifest=JSON.parse(fs.readFileSync(input.root+'/PAGES_RUNTIME_MANIFEST.json'));assert.equal(input.manifest.contentSha256,input.content);
 input.badFiles=input.manifest.files.filter(f=>{const bytes=fs.readFileSync(path.join(input.root,f.path));return bytes.length!==f.bytes||sha(bytes)!==f.sha256;}).map(f=>f.path);assert.deepEqual(input.badFiles,[]);
 const box={self:{}};vm.runInNewContext(fs.readFileSync(input.root+'/glossary/generated/cache-revision.js','utf8'),box);input.mandatory=Array.from(box.self.WH40K_PRECACHE);assert.equal(input.mandatory.length,221);
 input.server=await startLocal({packageRoot:input.root,label:'cold-Core '+input.sha});input.server.prewarm();
}
const proxy=await startProxy(),rows=[];
const report={schema:'cold-core-fast4g-popup-comparison/v1',status:'RUNNING',started:new Date().toISOString(),network:NETWORKS.fast4g,repetitionsPerSidePerWidth:10,widths:[1440,390],expectedTrials:40,originalTestSha256:sha(Buffer.from(source)),originalPopupFunctionSha256:sha(Buffer.from(exact)),assertionAdaptation:'Only expected entry pathname gains the actual Pages prefix. Predicate, polling(default rAF), deep equality and 15000ms timeout remain exact.',method:'Fresh Chromium process and viewport-only desktop context per trial; active real service worker. Shared HTTPS/H2/gzip6 origin + single aggregate CONNECT link cap includes SW traffic. Original QA browser launch flags. No trace/screencast, no warmup navigation, no offline-ready wait, no forced focus, no artificial delay/hold, no app/test edits. Base cannot show Home until full offline preparation; its natural completed status is the architectural control. Core Home click immediately at first actionable Home, then accepted deep fight-phase route and exact first on-page Ctrl-click target. Unrelated all-chapter/reload warmup is omitted deliberately.',inputs:Object.fromEntries(Object.entries(inputs).map(([s,x])=>[s,{sha:x.sha,contentSha256:x.content,revision:x.manifest.cacheRevision,files:x.manifest.fileCount,verifiedFileHashes:x.manifest.files.length}])),calibration:null,rows};
const save=()=>fs.writeFileSync(OUT+'/RESULTS.json',JSON.stringify(report,null,2)+'\n');save();
const launch=input=>launchChromium({launchOptions:{proxy:{server:proxy.url,bypass:'<-loopback>'},args:['--disable-quic','--ignore-certificate-errors-spki-list='+input.server.spki]}});
async function calibrate(){
 const input=inputs.base;proxy.setCondition(NETWORKS.fast4g);const browser=await launch(input);const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'allow'});
 try{
  const page=await context.newPage();await page.goto(input.server.base+'__audit/calibration.html');await page.evaluate(async()=>{await navigator.serviceWorker.register('calibration-sw.js');await navigator.serviceWorker.ready;});
  const rtt=await page.evaluate(async base=>{const out=[];for(let n=0;n<5;n++){const t=performance.now();await(await fetch(base+'.nojekyll?latency='+n,{cache:'no-store'})).arrayBuffer();out.push(performance.now()-t);}return out;},input.server.base);
  const median=[...rtt].sort((x,y)=>x-y)[2];assert(median>=153&&median<=190,'Fast4G short-request calibration outside same accepted range');
  const begin=epoch(),wire=proxy.snapshot();const decoded=await page.evaluate(async url=>{const worker=(await navigator.serviceWorker.ready).active;const sw=new Promise(resolve=>{const ch=new MessageChannel();ch.port1.onmessage=e=>resolve(e.data.bytes);worker.postMessage({url:url+'?calibration=worker'},[ch.port2]);});return Promise.all([fetch(url+'?calibration=page',{cache:'no-store'}).then(r=>r.arrayBuffer()).then(b=>b.byteLength),sw]);},input.server.base+'books/shared/source-refs-v2/source-catalog.json');
  const elapsedMs=epoch()-begin,wireBytes=proxy.snapshot().downstreamBytes-wire.downstreamBytes;const expected=input.manifest.files.find(f=>f.path==='books/shared/source-refs-v2/source-catalog.json').bytes;assert.deepEqual(decoded,[expected,expected]);const ideal=wireBytes*8/9000000*1000;assert(elapsedMs>=ideal*.9&&elapsedMs<=ideal+700,'Shared page/worker bandwidth calibration failed');
  report.calibration={status:'PASS',rttSamplesMs:rtt,rttMedianMs:median,aggregateElapsedMs:elapsedMs,wireBytes,idealWireMs:ideal,decoded};save();console.log('CALIBRATION '+JSON.stringify(report.calibration));
 }finally{await context.close();await browser.close();}
}
const ready=async p=>{await p.waitForFunction(()=>!!window.WarhammerAppV2);await p.evaluate(()=>window.WarhammerAppV2.ready);};
const child=async p=>(await p.locator('iframe.v2-core-reader').elementHandle()).contentFrame();
async function state(page){return page.evaluate(()=>{const f=document.querySelector('iframe'),d=f?.contentDocument;return{url:location.href,visibility:document.visibilityState,frames:document.querySelectorAll('iframe').length,frameClass:f?.className,frameTitle:f?.title,hostHidden:f?.closest('.v2-core-host')?.hidden,frameURL:d?.URL,frameReady:d?.readyState,frameVisibility:d?.visibilityState,main:!!d?.querySelector('main.main'),glossary:!!f?.contentWindow?.WH40K_GLOSSARY,app:!!window.WarhammerAppV2,body:document.body.innerText.slice(0,500)};}).catch(e=>({error:e.message}));}
async function afterOfflineState(page,input){return page.evaluate(async({mandatory,base,revision})=>{const reg=await navigator.serviceWorker.getRegistration();const worker=reg?.active;let version=null;if(worker)version=await new Promise(resolve=>{const ch=new MessageChannel();const timer=setTimeout(()=>resolve(null),2000);ch.port1.onmessage=e=>{clearTimeout(timer);ch.port1.close();resolve(e.data);};worker.postMessage({type:'GET_VERSION'},[ch.port2]);});const cache=version?.cacheName?await caches.open(version.cacheName):null;const keys=cache?new Set((await cache.keys()).map(x=>x.url)):new Set();return{controlled:!!navigator.serviceWorker.controller,active:worker?.state,version,revisionMatches:version?.revision===revision,present:mandatory.filter(x=>keys.has(new URL(x,new URL('service-worker.js',base)).href)).length,total:mandatory.length};},{mandatory:input.mandatory,base:input.server.base,revision:input.manifest.cacheRevision});}
async function run(side,width,repetition){
 const input=inputs[side];proxy.setCondition(NETWORKS.fast4g);const browser=await launch(input);const context=await browser.newContext({viewport:{width,height:width===390?844:900},serviceWorkers:'allow'});context.setDefaultTimeout(15000);
 const events=[],consoleMessages=[],pageErrors=[],networkFailures=[],pending=new Map();
 const row={side,width,repetition,status:'RUNNING',browserVersion:browser.version(),started:new Date().toISOString(),stage:'initialization',events,consoleMessages,pageErrors,networkFailures};const dir=path.join(OUT,side+'-'+width+'-'+repetition);fs.mkdirSync(dir);rows.push(row);save();
 await context.exposeBinding('__coldCoreEvent',(source,value)=>events.push({...value,pageURL:source.page.url()}));
 await context.addInitScript(()=>{
  window.__coldCoreSW=[];navigator.serviceWorker?.addEventListener('message',e=>{if(e.data?.type==='WH_OFFLINE_PACKAGE_STATUS'){const x=e.data;window.__coldCoreSW.push({epoch:performance.timeOrigin+performance.now(),status:x.status,completed:x.completed,total:x.total,revision:x.revision,sequence:x.sequence});}});
  document.addEventListener('click',e=>{const a=e.target?.closest?.('a[href]');if(!a)return;let type=null;const u=new URL(a.href);if(a.matches('.book')&&u.searchParams.get('v2')==='CORE_RULES')type='home-core-click';if(a.closest('.on-page')&&(e.ctrlKey||e.metaKey))type='section-popup-click';if(!type)return;let topState;try{topState=window.top.__coldCoreSW?.at(-1)||null;}catch{}window.__coldCoreEvent({type,epoch:performance.timeOrigin+performance.now(),href:a.href,target:a.target,visibility:document.visibilityState,offline:topState,expectedRevision:window.top.WHPwaExpectedRevision}).catch(()=>{});},true);
 });
 context.on('page',p=>{p.on('console',m=>{if(m.type()==='error')consoleMessages.push({text:m.text(),url:p.url()});});p.on('pageerror',e=>pageErrors.push({message:e.message,url:p.url()}));});
 context.on('request',r=>pending.set(r,{url:r.url(),method:r.method(),started:epoch()}));context.on('requestfinished',r=>pending.delete(r));context.on('requestfailed',r=>{networkFailures.push({url:r.url(),error:r.failure()?.errorText,epoch:epoch()});pending.delete(r);});
 let page,tab;const start=epoch();
 try{
  page=await context.newPage();assert.equal(context.serviceWorkers().length,0,'Cold context already has workers');assert.equal((await context.cookies()).length,0,'Cold context already has cookies');
  row.stage='home';await page.goto(input.server.base,{waitUntil:'domcontentloaded',timeout:180000});
  const coreLink=page.locator('[data-home-tool="core-rules"],.book[href*="v2=CORE_RULES"]').first();await coreLink.waitFor({state:'visible',timeout:180000});
  await page.waitForFunction(()=>!document.querySelector('[data-v2-loading]'),null,{timeout:180000});row.homeActionableEpoch=epoch();
  // No offline query/readiness wait here: the user acts immediately.
  row.stage='core-home-click';await coreLink.click();await ready(page);assert.equal(await page.locator('[data-core-reader]').count(),1,'Home did not mount Core');let frame=await child(page);assert(await frame.locator('.sidebar').count());row.coreReadyEpoch=epoch();
  row.stage='fight-phase';await page.evaluate(()=>WarhammerAppV2.navigate({destination:'CORE_RULES',registryId:'core-rules',chapterId:'fight-phase',sectionId:'rule-12-08',canonicalId:'core-rule-12-08-consolidation-move'}));await ready(page);frame=await child(page);assert.equal(await frame.locator('#rule-12-08').count(),1);
  const sectionLink=frame.locator('.on-page a').first(),href=await sectionLink.getAttribute('href');const entry=new URL('v2/app.html',input.server.base);assert.equal(new URL(href).pathname,entry.pathname);assert(new URL(href).searchParams.get('section'));
  if(width===390)await frame.locator('#navButton').click();
  row.stage='popup';row.expectedHref=href;row.expectedReaderPath=new URL(frame.url()).pathname;row.nodeClickStartEpoch=epoch();const opening=context.waitForEvent('page');await sectionLink.click({modifiers:['Control']});tab=await opening;row.pageEventEpoch=epoch();
  const observedTab={waitForFunction:async(...args)=>{const result=await tab.waitForFunction(...args);row.predicateReadyEpoch=epoch();return result;}};
  await popupFunction(entry.pathname)(observedTab,href,row.expectedReaderPath);row.assertionCompleteEpoch=epoch();row.windowState=await state(tab);row.status='PASS';
 }catch(error){row.status='FAIL';row.error=error.stack;row.failureEpoch=epoch();if(tab){row.windowState=await state(tab);await tab.screenshot({path:path.join(dir,'failure-popup.png')}).catch(()=>{});}if(page){row.parentState=await state(page);await page.screenshot({path:path.join(dir,'failure-parent.png')}).catch(()=>{});}row.pendingAtFailure=[...pending.values()];row.proxyAtFailure=proxy.snapshot();}
 finally{
  if(page){row.finalOffline=await afterOfflineState(page,input).catch(e=>({error:e.message}));row.passiveOffline=await page.evaluate(()=>window.__coldCoreSW||[]).catch(()=>[]);}
  const click=events.find(x=>x.type==='section-popup-click'),homeClick=events.find(x=>x.type==='home-core-click');row.homeClick=homeClick||null;row.popupClick=click||null;
  row.homeReadyMs=row.homeActionableEpoch?row.homeActionableEpoch-start:null;row.homeToCoreClickMs=homeClick?homeClick.epoch-row.homeActionableEpoch:null;
  row.clickToWindowMs=click&&row.predicateReadyEpoch?row.predicateReadyEpoch-click.epoch:null;row.pageEventToWindowMs=row.predicateReadyEpoch?row.predicateReadyEpoch-row.pageEventEpoch:null;row.clickToFailureMs=click&&row.failureEpoch?row.failureEpoch-click.epoch:null;
  row.backgroundAtCoreClick=homeClick?.offline?homeClick.offline.status!=='ready'&&homeClick.offline.completed<homeClick.offline.total:null;row.backgroundAtPopupClick=click?.offline?click.offline.status!=='ready'&&click.offline.completed<click.offline.total:null;
  row.totalMs=epoch()-start;row.finished=new Date().toISOString();fs.writeFileSync(path.join(dir,'OBSERVATION.json'),JSON.stringify(row,null,2)+'\n');save();
  console.log('RESULT '+JSON.stringify({side,width,repetition,status:row.status,stage:row.stage,homeMs:row.homeReadyMs,clickToWindowMs:row.clickToWindowMs,backgroundAtCoreClick:row.backgroundAtCoreClick,backgroundAtPopupClick:row.backgroundAtPopupClick,error:row.error?.split('\n')[0]}));
  await context.close();await browser.close();
 }
}
function median(values){const sorted=[...values].sort((a,b)=>a-b);return(sorted[4]+sorted[5])/2;}
function summarize(){
 report.summary=[];let worse=false,inconclusive=false;
 for(const width of report.widths){const by={};for(const side of ['base','head']){const r=rows.filter(x=>x.width===width&&x.side===side);assert.equal(r.length,10);const times=r.filter(x=>x.status==='PASS').map(x=>x.clickToWindowMs);by[side]={attempts:r.length,pass:times.length,fail:r.length-times.length,medianMs:times.length===10?median(times):null,maxMs:times.length?Math.max(...times):null,successfulLatenciesMs:times,backgroundAtCoreClick:r.filter(x=>x.backgroundAtCoreClick===true).length,backgroundUnknown:r.filter(x=>x.backgroundAtCoreClick===null).length};}
 const failuresWorse=by.head.fail>by.base.fail;const medianWorse=by.head.medianMs!==null&&by.base.medianMs!==null&&by.head.medianMs>by.base.medianMs;const maxWorse=by.head.maxMs!==null&&by.base.maxMs!==null&&by.head.maxMs>by.base.maxMs;
 const modeIncomplete=by.head.backgroundAtCoreClick!==10;const unresolvedFailures=by.head.fail>0||by.base.fail>0;
 worse ||= failuresWorse||medianWorse||maxWorse;inconclusive ||=modeIncomplete||unresolvedFailures;
 report.summary.push({width,...by,comparison:{failuresWorse,medianWorse,maxWorse,modeIncomplete,unresolvedFailures,deltaMedianMs:by.head.medianMs!==null&&by.base.medianMs!==null?by.head.medianMs-by.base.medianMs:null,deltaMaxMs:by.head.maxMs!==null&&by.base.maxMs!==null?by.head.maxMs-by.base.maxMs:null}});
 }
 report.decision=worse?'STOP_BRANCH_WORSE':inconclusive?'STOP_INCONCLUSIVE_MODE_OR_FAILURES':'PROCEED_AUTHORIZED_FULL_PREFF';report.status='COMPLETE';report.finished=new Date().toISOString();save();
 const csv=['width,side,attempts,pass,fail,medianMs,maxMs,backgroundAtCoreClick'];for(const r of report.summary)for(const side of ['base','head']){const x=r[side];csv.push([r.width,side,x.attempts,x.pass,x.fail,x.medianMs,x.maxMs,x.backgroundAtCoreClick].join(','));}fs.writeFileSync(OUT+'/SUMMARY.csv',csv.join('\n')+'\n');
 console.log('DECISION '+JSON.stringify({decision:report.decision,summary:report.summary}));
}
try{await calibrate();for(const width of report.widths)for(let n=1;n<=10;n++)for(const side of n%2?['base','head']:['head','base']){console.log('START '+side+' '+width+' '+n);await run(side,width,n);}assert.equal(rows.length,40);summarize();}
catch(error){report.status='HARNESS_ERROR';report.error=error.stack;save();throw error;}
finally{await proxy.close();for(const input of Object.values(inputs))await input.server.close();}
