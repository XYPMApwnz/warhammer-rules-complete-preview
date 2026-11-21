/** Sequential matched-origin before/after measurements. No production mutation. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {startLocal,startProxy,NETWORKS} from './transport.mjs';
import {openObservedBrowser} from './browser-observer.mjs';
const OUT='E:/Warhammer/qa-evidence/fast-first-load-v1-2026-11-21';
const TMP='E:/Warhammer/qa-tmp/fast-first-load';
const option=name=>process.argv.find(arg=>arg.startsWith(name+'='))?.slice(name.length+1);
const side=option('--side');if(!['base','after'].includes(side))throw Error('Pass --side=base or --side=after');
const ROOT=path.resolve(option('--package')||TMP+'/packages/'+side),SOURCE=path.resolve(option('--source')||'E:/Warhammer/worktrees/fast-first-load-v1');
const pilot=process.argv.includes('--pilot'),onlyNetwork=option('--network'),onlyScenario=option('--scenario');
const repetitions=Number(option('--repetitions')||(pilot?1:3));assert([1,2,3].includes(repetitions),'Repetitions must be1,2 or3');
if(onlyNetwork)assert(Object.hasOwn(NETWORKS,onlyNetwork),'Unknown network: '+onlyNetwork);
const folder=path.resolve(OUT,option('--folder')||(pilot?'pilot-':'measurements-')+side);if(fs.existsSync(folder+'/INDEX.json'))throw Error('Preserve previous observations; choose a new --folder');fs.mkdirSync(folder,{recursive:true});
const manifest=JSON.parse(fs.readFileSync(ROOT+'/PAGES_RUNTIME_MANIFEST.json'));
if(side==='base')assert.equal(manifest.contentSha256,'0fab482c0fa7f4132c9bbb60646e880afca25f2b5823ab7fc1bd62322e67b909');
if(option('--expected-content-sha'))assert.equal(manifest.contentSha256,option('--expected-content-sha'));
const workerText=fs.readFileSync(ROOT+'/service-worker.js','utf8'),declaredConcurrency=Number(workerText.match(/const\s+APP_SHELL_BATCH_SIZE\s*=\s*(\d+)\s*;/)?.[1]);
assert([4,6,8].includes(declaredConcurrency),'Expected the declared4/6/8 offline queue size');
if(option('--expected-concurrency'))assert.equal(declaredConcurrency,Number(option('--expected-concurrency')));
const assets=Object.fromEntries(manifest.files.map(row=>[row.path,row]));assets['PAGES_RUNTIME_MANIFEST.json']={bytes:fs.statSync(ROOT+'/PAGES_RUNTIME_MANIFEST.json').size};
const sandbox={self:{}};vm.runInNewContext(fs.readFileSync(ROOT+'/glossary/generated/cache-revision.js','utf8'),sandbox);
const mandatory=sandbox.self.WH40K_PRECACHE;assert.equal(mandatory.length,221);
const cacheBytes=sandbox.self.WH40K_CACHE_BYTES;
if(option('--baseline-package')){const before={self:{}};vm.runInNewContext(fs.readFileSync(path.resolve(option('--baseline-package'))+'/glossary/generated/cache-revision.js','utf8'),before);const normalized=urls=>Array.from(urls,url=>url.replace(/([?&]wh-pwa=)[a-f0-9]{16}/g,'$1__REVISION__')).sort();assert.deepEqual(normalized(mandatory),normalized(before.self.WH40K_PRECACHE),'Mandatory URL composition changed');}
const fixtureMeta=JSON.parse(fs.readFileSync(SOURCE+'/v2/fixtures/new-recruit-plain-header-v37.25.json'));
const ownerBytes=fs.readFileSync(SOURCE+'/v2/fixtures/'+fixtureMeta.owner.file);assert.equal(createHash('sha256').update(ownerBytes).digest('hex'),fixtureMeta.owner.sha256);
const fixture=ownerBytes.toString('utf8');
const local=await startLocal({packageRoot:ROOT,label:side+' / queue'+declaredConcurrency});local.prewarm();const proxy=await startProxy();
const scenarios=[{id:'home',query:''},{id:'dg-book',book:'death-guard',query:'?v2=ARMY_BOOK&book=death-guard'},
 {id:'sm-book',book:'space-marines',query:'?v2=ARMY_BOOK&book=space-marines'},
 {id:'dg-roster',book:'death-guard',query:'?v2=ROSTER&book=death-guard',import:true}];
if(onlyScenario)assert(scenarios.some(scenario=>scenario.id===onlyScenario),'Unknown scenario: '+onlyScenario);
const summary={schema:'fast-first-load-measurements/v1',timingObservationModel:'passive-app-ready-observers/v1; legacy driver metric preserved',status:'RUNNING',side,repetitions,sourcePath:SOURCE,packageRoot:ROOT,declaredConcurrency,workerSha256:createHash('sha256').update(workerText).digest('hex'),runtimeContentSha256:manifest.contentSha256,
 cacheRevision:manifest.cacheRevision,cacheBytes,started:new Date().toISOString(),networks:NETWORKS,method:'Fresh Chromium process/profile per cold trial, same process/page for paired immediate warm reload after full offline completion and settlement. Shared calibrated CONNECT shaper; HTTPS/H2/gzip6 matched origin, maxSessionMemory128. No CDP/CPU throttle. Offline readiness is the exact-revision worker ready broadcast, not activation; activation and221cache keys verified separately. CDP totals are preliminary; use NetLog for authoritative bodies/requests.',rows:[],calibrations:[]};
const save=()=>fs.writeFileSync(folder+'/INDEX.json',JSON.stringify(summary,null,2)+'\n');save();
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const count=rows=>{const real=rows.filter(row=>row.networkDownload);return{logicalRequests:rows.length,networkRequests:real.length,
 compressedBodyBytes:real.reduce((n,row)=>n+row.compressedBodyBytes,0),decodedBodyBytes:real.reduce((n,row)=>n+row.decodedBodyBytes,0),
 completedNetworkRequests:real.filter(row=>row.complete).length,cacheOrSWResponses:rows.length-real.length,failedNetworkRequests:real.filter(row=>row.failure).length};};
async function offlineProof(observed){
 return observed.page.evaluate(async({mandatory,base,revision,cacheBytes})=>{
  const registration=await navigator.serviceWorker.getRegistration();const names=await caches.keys();
  const worker=registration?.active;
  const version=worker?await new Promise(resolve=>{const channel=new MessageChannel();let timer;const finish=value=>{clearTimeout(timer);channel.port1.close();resolve(value);};timer=setTimeout(()=>finish(null),2000);channel.port1.onmessage=event=>finish(event.data);try{worker.postMessage({type:'GET_VERSION'},[channel.port2]);}catch{finish(null);}}):null;
  const name=version?.cacheName;
  const matchesPublication=version?.revision===revision&&typeof name==='string'&&name.includes(revision)&&(!cacheBytes||name.includes(cacheBytes));
  const cached=matchesPublication&&names.includes(name)?await(await caches.open(name)).keys():[];
  const urls=new Set(cached.map(request=>request.url)),expected=mandatory.map(relative=>new URL(relative,new URL('service-worker.js',base)).href);
  return{active:registration?.active?.state,controlled:!!navigator.serviceWorker.controller,cache:name,expected:expected.length,present:expected.filter(url=>urls.has(url)).length,
   version,cacheBytesExpected:cacheBytes,matchesPublication,missing:expected.filter(url=>!urls.has(url)).map(url=>new URL(url).pathname),cachedKeys:cached.length};
 },{mandatory,base:observed.base,revision:manifest.cacheRevision,cacheBytes});
}
async function waitForOfflineComplete(observed,{started,warm}){
 const deadline=Date.now()+300000;let firstQueriedReady=null,lastStatus=null;
 while(Date.now()<deadline){
  const result=await observed.page.evaluate(async()=>{
   try{const value=await window.WHOfflineStatus?.query?.();if(!value)return null;return{epoch:Date.now(),status:value.status,revision:value.revision,cacheBytes:value.cacheBytes,coreReady:value.coreReady,completed:value.completed,total:value.total,sequence:value.sequence};}catch{return null;}
  });
  if(result){lastStatus=result;if(result.revision&&result.revision!==manifest.cacheRevision)throw Error('Offline query returned another publication revision');}
  if(result?.status==='ready'&&result.completed===mandatory.length&&result.total===mandatory.length){
   firstQueriedReady??=result.epoch;
   const proof=await offlineProof(observed);
   if(proof.active==='activated'&&proof.matchesPublication&&proof.present===mandatory.length){
    const broadcasts=observed.offlineEvents.filter(event=>event.epoch>=started&&event.revision===manifest.cacheRevision&&event.status==='ready'&&event.completed===mandatory.length&&event.total===mandatory.length).map(event=>event.epoch);
    return{proof,status:lastStatus,readyMs:warm?0:(broadcasts.length?Math.min(...broadcasts):firstQueriedReady)-started,
     timestampSource:warm?'verified fully prepared before immediate reload':broadcasts.length?'exact-revision worker ready-status broadcast received in page':'first queried-ready observation; upper bound, no ready broadcast captured'};
   }
  }
  await sleep(100);
 }
 throw Error('Full offline package did not become ready in300seconds: '+JSON.stringify(lastStatus));
}
async function boot(observed,scenario,{warm=false,progress,started}={}){
 const stamp=key=>{if(progress)progress[key]=Date.now()-started;};
 const {page}=observed;await page.waitForFunction(()=>Boolean(window.WarhammerAppV2),null,{timeout:180000});
 stamp('driverAppGlobalSeenMs');
 await page.evaluate(()=>WarhammerAppV2.ready);
 stamp('driverAppReadyPromiseReturnMs');
 await page.waitForFunction(()=>!document.querySelector('[data-v2-loading]'),null,{timeout:180000});
 stamp('driverLoadingMarkerGoneMs');
 if(scenario.id==='home'){await page.waitForFunction(()=>document.querySelectorAll('[data-v2-book]').length===9);return;}
 await page.waitForFunction(book=>window.ArmyBookAppV2?.payload?.book?.id===book,scenario.book);
 if(scenario.import){await page.evaluate(async()=>await ArmyBookAppV2.rosterPanel.ready);if(warm)await page.waitForFunction(()=>ArmyBookAppV2.roster.state.units.length>0);else await page.locator('[data-roster-input="raw-text"]').waitFor();}
 else await page.waitForFunction(()=>document.querySelector('main')?.innerText.trim().length>150);
}
async function settle(observed,timeout=300000){const deadline=Date.now()+timeout;let idle=null;
 while(Date.now()<deadline){if(!observed.ledger.pending()&&proxy.snapshot().queuedBytes===0){idle??=Date.now();if(Date.now()-idle>=750)return{idle:true};}else idle=null;await sleep(100);}
 return{idle:false,pending:observed.ledger.pending()};
}
async function observe(observed,scenario,{warm,origin,network,repetition,label}){
 const {page,ledger,marks}=observed,serverStart=local.records.length,wireStart=proxy.snapshot();
 const row={id:label,side,origin,network,scenario:scenario.id,repetition,declaredConcurrency,cache:warm?'warm':'cold',status:'RUNNING'};
 const priorMetrics=await observed.cdp.send('Performance.getMetrics');const prior=Object.fromEntries(priorMetrics.metrics.map(metric=>[metric.name,metric.value]));
 observed.nodeMonotonicStart=performance.now();const started=Date.now();row.startedEpoch=started;row.profileName=path.basename(observed.profile);let readyEpoch=null;
 try{
  if(warm)await page.reload({waitUntil:'domcontentloaded',timeout:180000});else await page.goto(scenario.id==='home'?observed.base:observed.base+'v2/app.html'+scenario.query,{waitUntil:'domcontentloaded',timeout:180000});
  row.driverDomContentLoadedReturnMs=Date.now()-started;
  await boot(observed,scenario,{warm,progress:row,started});row.shellReadyMs=Date.now()-started;
  if(scenario.import&&!warm){
   await page.locator('[data-roster-input="raw-text"]').fill(fixture);
   const clicked=Date.now();await page.locator('[data-roster-action="review-import"]').click();
   await page.waitForFunction(()=>!document.querySelector('[data-roster-view][aria-busy="true"]')&&ArmyBookAppV2.roster.state.units.length>0,null,{timeout:90000});
   row.importClickToReadyMs=Date.now()-clicked;
  }
  readyEpoch=Date.now();row.readyMs=readyEpoch-started;const readyWire=proxy.snapshot();row.wireToReady={downstreamTlsBytes:readyWire.downstreamBytes-wireStart.downstreamBytes,upstreamTlsBytes:readyWire.upstreamBytes-wireStart.upstreamBytes};
  row.rosterUnits=scenario.import?await page.evaluate(()=>ArmyBookAppV2.roster.state.units.length):null;
  row.offlineAtInteractive=observed.offlineEvents.filter(event=>event.epoch>=started&&event.epoch<=readyEpoch&&event.revision===manifest.cacheRevision).at(-1)??null;
  const offlineCompletion=await waitForOfflineComplete(observed,{started,warm});
  row.offline=offlineCompletion.proof;row.offlineStatus=offlineCompletion.status;assert.equal(row.offline.active,'activated');assert.equal(row.offline.present,221);assert.equal(row.offline.matchesPublication,true);
  const activated=ledger.swEvents.filter(event=>event.epoch>=started&&event.status==='activated'&&event.scriptURL?.startsWith(observed.base)).map(event=>event.epoch);
  row.workerActivatedMs=warm?0:activated.length?Math.min(...activated)-started:null;
  row.offlineReadyMs=offlineCompletion.readyMs;
  row.offlineReadyTimestampSource=offlineCompletion.timestampSource;
  row.offlineWaitAfterInteractiveMs=Math.max(0,row.offlineReadyMs-row.readyMs);
  row.settled=await settle(observed);
  row.totalMs=Date.now()-started;
  row.paintMarks=marks.filter(mark=>mark.epoch>=started-2).map(mark=>({...mark,ms:mark.epoch-started}));
  row.fcpMs=row.paintMarks.filter(mark=>mark.name==='FCP').map(mark=>mark.ms).sort((a,b)=>a-b)[0]??null;
  row.firstUsefulDomMs=row.paintMarks.filter(mark=>mark.name==='first-useful-DOM').map(mark=>mark.ms).sort((a,b)=>a-b)[0]??null;
  const firstMark=name=>row.paintMarks.filter(mark=>mark.name===name).map(mark=>mark.ms).sort((a,b)=>a-b)[0]??null;
  row.applicationReadyWatchAttachedMs=firstMark('application-ready-watch-attached');row.applicationReadyMs=firstMark('application-ready');row.bootstrapReadyDomMs=firstMark('bootstrap-ready-DOM');
  row.nativeImportClickMs=firstMark('roster-import-click');row.nativeImportReadyMs=firstMark('roster-import-ready-DOM');
  row.nativeImportClickToReadyMs=row.nativeImportClickMs!==null&&row.nativeImportReadyMs!==null?row.nativeImportReadyMs-row.nativeImportClickMs:null;
  row.navigationTiming=await page.evaluate(()=>({timeOrigin:performance.timeOrigin,visibilityState:document.visibilityState,entries:performance.getEntriesByType('navigation').map(entry=>({name:entry.name,startTime:entry.startTime,type:entry.type,domInteractive:entry.domInteractive,domContentLoadedEventStart:entry.domContentLoadedEventStart,domContentLoadedEventEnd:entry.domContentLoadedEventEnd,loadEventStart:entry.loadEventStart,loadEventEnd:entry.loadEventEnd,responseStart:entry.responseStart,responseEnd:entry.responseEnd,duration:entry.duration}))}));
  const navigation=row.navigationTiming.entries[0];
  row.domContentLoadedMs=navigation?.domContentLoadedEventEnd>0?row.navigationTiming.timeOrigin+navigation.domContentLoadedEventEnd-started:null;
  row.loadEventEndMs=navigation?.loadEventEnd>0?row.navigationTiming.timeOrigin+navigation.loadEventEnd-started:null;
  row.resources=await page.evaluate(()=>performance.getEntriesByType('resource').map(resource=>({url:resource.name,type:resource.initiatorType,start:resource.startTime,duration:resource.duration,transferSize:resource.transferSize,encodedBodySize:resource.encodedBodySize,decodedBodySize:resource.decodedBodySize})));
  row.longTasks=await page.evaluate(()=>window.__auditLongTasks||[]);
  const metrics=await observed.cdp.send('Performance.getMetrics');row.cpu=Object.fromEntries(metrics.metrics.filter(metric=>['ScriptDuration','TaskDuration','LayoutDuration','RecalcStyleDuration','JSHeapUsedSize'].includes(metric.name)).map(metric=>[metric.name,metric.name.endsWith('Duration')?metric.value-(prior[metric.name]||0):metric.value]));
  row.status='OBSERVED';
 }catch(error){row.status='OBSERVATION_ERROR';row.error=error.message;row.totalMs=Date.now()-started;}
 row.finishedEpoch=Date.now();row.requests=ledger.normalized(started,row.finishedEpoch);row.total=count(row.requests);row.toReady=count(row.requests.filter(request=>request.endEpoch&&request.endEpoch<=readyEpoch));
 const wire=proxy.snapshot();row.wire={downstreamTlsBytes:wire.downstreamBytes-wireStart.downstreamBytes,upstreamTlsBytes:wire.upstreamBytes-wireStart.upstreamBytes};
 row.errors=observed.errors;row.notes=ledger.notes;row.workerSessions=ledger.workerSessions;row.swEvents=ledger.swEvents.filter(event=>event.epoch>=started);row.offlineEvents=observed.offlineEvents.filter(event=>event.epoch>=started);row.browserVersion=observed.version;
 if(origin==='local'){
  row.server=local.records.slice(serverStart).map(record=>({...record,startMs:record.started-observed.nodeMonotonicStart,finishedMs:record.finished===null?null:record.finished-observed.nodeMonotonicStart}));
  row.serverTotals={networkRequests:row.server.length,compressedBodyBytes:row.server.reduce((n,record)=>n+(record.finished!==null?record.bodyBytes:0),0),decodedBodyBytes:row.server.reduce((n,record)=>n+(record.finished!==null&&record.status!==304?record.rawBytes:0),0)};
 }
 fs.writeFileSync(folder+'/'+label+'.json',JSON.stringify(row,null,2)+'\n');summary.rows.push({id:label,side,origin,network,scenario:scenario.id,repetition,cache:row.cache,status:row.status,readyMs:row.readyMs,applicationReadyMs:row.applicationReadyMs,bootstrapReadyDomMs:row.bootstrapReadyDomMs,nativeImportReadyMs:row.nativeImportReadyMs,domContentLoadedMs:row.domContentLoadedMs,loadEventEndMs:row.loadEventEndMs,fcpMs:row.fcpMs,offlineReadyMs:row.offlineReadyMs,workerActivatedMs:row.workerActivatedMs,offlineReadyTimestampSource:row.offlineReadyTimestampSource,totalMs:row.totalMs,total:row.total,serverTotals:row.serverTotals,error:row.error});save();
 console.log(JSON.stringify({id:label,status:row.status,readyMs:row.readyMs,applicationReadyMs:row.applicationReadyMs,bootstrapReadyDomMs:row.bootstrapReadyDomMs,nativeImportReadyMs:row.nativeImportReadyMs,domContentLoadedMs:row.domContentLoadedMs,fcpMs:row.fcpMs,offlineMs:row.offlineReadyMs,requests:row.total.networkRequests,encoded:row.total.compressedBodyBytes,serverEncoded:row.serverTotals?.compressedBodyBytes,error:row.error}));
 return row;
}
async function calibration(network){
 proxy.setCondition(NETWORKS[network]);const observed=await openObservedBrowser({proxy,base:local.base,spki:local.spki,assets,label:'calibration-'+network});observed.base=local.base;
 try{
  await observed.page.goto(local.base+'__audit/calibration.html');
  await observed.page.evaluate(async()=>{await navigator.serviceWorker.register('calibration-sw.js');await navigator.serviceWorker.ready;});
  const shortFetchMs=await observed.page.evaluate(async base=>{const values=[];for(let n=0;n<5;n++){const start=performance.now();await(await fetch(base+'.nojekyll?audit-latency='+n,{cache:'no-store'})).arrayBuffer();values.push(performance.now()-start);}return values;},local.base);
  const shortMedian=[...shortFetchMs].sort((a,b)=>a-b)[2];assert(shortMedian>=NETWORKS[network].rttMs*.9);assert(shortMedian<=NETWORKS[network].rttMs+20,'Small-request RTT is not calibrated');
  const start=Date.now(),wire=proxy.snapshot();
  const actual=await observed.page.evaluate(async url=>{
   const worker=(await navigator.serviceWorker.ready).active;
   const workerFetch=new Promise(resolve=>{const channel=new MessageChannel();channel.port1.onmessage=event=>resolve(event.data.bytes);worker.postMessage({url:url+'?audit=worker'},[channel.port2]);});
   const pageFetch=fetch(url+'?audit=page',{cache:'no-store'}).then(response=>response.arrayBuffer()).then(bytes=>bytes.byteLength);
   return Promise.all([pageFetch,workerFetch]);
  },local.base+'books/shared/source-refs-v2/source-catalog.json');
  const elapsedMs=Date.now()-start,after=proxy.snapshot(),rows=observed.ledger.normalized(start).filter(row=>row.relative==='books/shared/source-refs-v2/source-catalog.json');
  assert.deepEqual(actual,[6530013,6530013]);assert.equal(rows.filter(row=>row.actor==='page').length,1);assert.equal(rows.filter(row=>row.actor==='service-worker').length,1);
  const bytes=after.downstreamBytes-wire.downstreamBytes,idealMs=NETWORKS[network].bitsPerSecond?bytes*8/NETWORKS[network].bitsPerSecond*1000:0;
  if(idealMs){assert(elapsedMs>=idealMs*.9,'Aggregate proxy cap exceeded');assert(elapsedMs<=idealMs+Math.max(700,NETWORKS[network].rttMs*3),'Proxy transport much slower than configured cap');}
  const result={network,status:'PASS',shortFetchMs,shortMedianMs:shortMedian,decoded:actual,elapsedMs,downstreamTlsBytes:bytes,wireOnlyIdealMs:idealMs,rows:rows.map(row=>({actor:row.actor,compressed:row.compressedBodyBytes,decoded:row.decodedBodyBytes,source:row.bodyByteSource,headers:row.headers}))};
  summary.calibrations.push(result);save();console.log('CALIBRATION '+JSON.stringify(result));
 }finally{await observed.close();}
}
try{
 if(process.argv.includes('--calibrate')||process.argv.includes('--calibration-only'))for(const network of ['fast4g','slow4g'])await calibration(network);
 const selectedNetworks=onlyNetwork?[onlyNetwork]:pilot?['unlimited']:Object.keys(NETWORKS);
 const selectedScenarios=onlyScenario?scenarios.filter(scenario=>scenario.id===onlyScenario):pilot?scenarios.filter(scenario=>scenario.id==='home'):scenarios;
 summary.expectedRows=process.argv.includes('--calibration-only')?0:selectedNetworks.length*selectedScenarios.length*repetitions*2;save();
 if(!process.argv.includes('--calibration-only'))for(const network of selectedNetworks)for(let repetition=1;repetition<=repetitions;repetition++)for(const scenario of selectedScenarios){
  const origin='local',label=[side,network,scenario.id,repetition].join('-');assert(!fs.existsSync(folder+'/'+label+'-cold.json'),'Never overwrite a prior sample');
  proxy.setCondition(NETWORKS[network]);
  const observed=await openObservedBrowser({proxy,base:local.base,spki:local.spki,assets,label,netlog:true});observed.base=local.base;observed.nodeMonotonicStart=performance.now();
  try{
   console.log('START '+label);
   const cold=await observe(observed,scenario,{warm:false,origin,network,repetition,label:label+'-cold'});
   if(cold.status!=='OBSERVED'&&(pilot||process.argv.includes('--fail-fast')))throw Error('Cold observation failed; inspect '+label);
   const warm=await observe(observed,scenario,{warm:true,origin,network,repetition,label:label+'-warm'});
   if(warm.status!=='OBSERVED'&&(pilot||process.argv.includes('--fail-fast')))throw Error('Warm observation failed; inspect '+label);
  }finally{await observed.close();}
 }
 assert.equal(summary.rows.length,summary.expectedRows,'The declared measurement matrix is incomplete');
 summary.status=summary.rows.every(row=>row.status==='OBSERVED')?'COMPLETE':'OBSERVED_WITH_ERRORS';
}catch(error){summary.status='HARNESS_ERROR';summary.error=error.stack;throw error;}
finally{summary.finished=new Date().toISOString();save();await proxy.close();await local.close();}
