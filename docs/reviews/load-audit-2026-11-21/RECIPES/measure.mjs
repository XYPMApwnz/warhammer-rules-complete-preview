/** Sequential read-only load audit. No production source, cache policy or tests changed. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {startLocal,startProxy,NETWORKS,ROOT} from './transport.mjs';
import {openObservedBrowser} from './browser-observer.mjs';
const OUT='E:/Warhammer/qa-evidence/load-audit-v1-2026-11-21';
const SOURCE='E:/Warhammer/qa-tmp/load-audit/source';
const option=name=>process.argv.find(arg=>arg.startsWith(name+'='))?.slice(name.length+1);
const pilot=process.argv.includes('--pilot'),legacyControl=process.argv.includes('--legacy-control'),onlyOrigin=option('--origin'),onlyNetwork=option('--network'),onlyScenario=option('--scenario');
const folder=path.join(OUT,option('--folder')||(pilot?'pilot':'measurements'));if(fs.existsSync(folder+'/INDEX.json'))throw Error('Preserve previous observations; choose a new --folder');fs.mkdirSync(folder,{recursive:true});
const manifest=JSON.parse(fs.readFileSync(ROOT+'/PAGES_RUNTIME_MANIFEST.json'));
assert.equal(manifest.contentSha256,'0fab482c0fa7f4132c9bbb60646e880afca25f2b5823ab7fc1bd62322e67b909');
const assets=Object.fromEntries(manifest.files.map(row=>[row.path,row]));assets['PAGES_RUNTIME_MANIFEST.json']={bytes:fs.statSync(ROOT+'/PAGES_RUNTIME_MANIFEST.json').size};
const sandbox={self:{}};vm.runInNewContext(fs.readFileSync(ROOT+'/glossary/generated/cache-revision.js','utf8'),sandbox);
const mandatory=sandbox.self.WH40K_PRECACHE;assert.equal(mandatory.length,221);
const fixtureMeta=JSON.parse(fs.readFileSync(SOURCE+'/v2/fixtures/new-recruit-plain-header-v37.25.json'));
const ownerBytes=fs.readFileSync(SOURCE+'/v2/fixtures/'+fixtureMeta.owner.file);assert.equal(createHash('sha256').update(ownerBytes).digest('hex'),fixtureMeta.owner.sha256);
const fixture=ownerBytes.toString('utf8');
const local=await startLocal();local.prewarm();const proxy=await startProxy();
const origins={local:local.base,live:'https://xypmapwnz.github.io/warhammer-rules-complete-preview/'};
const scenarios=[{id:'home',query:''},{id:'dg-book',book:'death-guard',query:'?v2=ARMY_BOOK&book=death-guard'},
 {id:'sm-book',book:'space-marines',query:'?v2=ARMY_BOOK&book=space-marines'},
 {id:'dg-roster',book:'death-guard',query:'?v2=ROSTER&book=death-guard',import:true}];
const summary={schema:'load-audit-observations/v1',status:'RUNNING',source:'8579a7a77c7f5e8dad291afc11b27aab3cd9d73a',runtimeContentSha256:manifest.contentSha256,
 cacheRevision:manifest.cacheRevision,started:new Date().toISOString(),networks:NETWORKS,method:'Fresh Chromium process/profile per cold trial, same profile/page for paired warm visit. Shared CONNECT shaper, no CDP throttle or CPU throttle. HTTPS end-to-end; local certificate SPKI exception only.',rows:[],calibrations:[]};
const save=()=>fs.writeFileSync(folder+'/INDEX.json',JSON.stringify(summary,null,2)+'\n');save();
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const count=rows=>{const real=rows.filter(row=>row.networkDownload);return{logicalRequests:rows.length,networkRequests:real.length,
 compressedBodyBytes:real.reduce((n,row)=>n+row.compressedBodyBytes,0),decodedBodyBytes:real.reduce((n,row)=>n+row.decodedBodyBytes,0),
 completedNetworkRequests:real.filter(row=>row.complete).length,cacheOrSWResponses:rows.length-real.length,failedNetworkRequests:real.filter(row=>row.failure).length};};
async function offlineProof(observed){
 return observed.page.evaluate(async({mandatory,base,revision})=>{
  const registration=await navigator.serviceWorker.getRegistration();const names=await caches.keys();
  const name=names.find(name=>name.includes(revision)&&!name.includes('v2-data'));const cached=name?await(await caches.open(name)).keys():[];
  const urls=new Set(cached.map(request=>request.url)),expected=mandatory.map(relative=>new URL(relative,new URL('service-worker.js',base)).href);
  return{active:registration?.active?.state,controlled:!!navigator.serviceWorker.controller,cache:name,expected:expected.length,present:expected.filter(url=>urls.has(url)).length,
   missing:expected.filter(url=>!urls.has(url)).map(url=>new URL(url).pathname),cachedKeys:cached.length};
 },{mandatory,base:observed.base,revision:manifest.cacheRevision});
}
async function boot(observed,scenario,{warm=false}={}){
 const {page}=observed;await page.waitForFunction(()=>Boolean(window.WarhammerAppV2),null,{timeout:180000});
 await page.evaluate(()=>WarhammerAppV2.ready);
 await page.waitForFunction(()=>!document.querySelector('[data-v2-loading]'),null,{timeout:180000});
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
 const row={id:label,origin,network,scenario:scenario.id,repetition,cache:warm?'warm':'cold',status:'RUNNING'};
 const priorMetrics=await observed.cdp.send('Performance.getMetrics');const prior=Object.fromEntries(priorMetrics.metrics.map(metric=>[metric.name,metric.value]));
 observed.nodeMonotonicStart=performance.now();const started=Date.now();row.startedEpoch=started;row.profileName=path.basename(observed.profile);let readyEpoch=null;
 try{
  if(warm)await page.reload({waitUntil:'domcontentloaded',timeout:180000});else await page.goto(scenario.id==='home'?observed.base:observed.base+'v2/app.html'+scenario.query,{waitUntil:'domcontentloaded',timeout:180000});
  await boot(observed,scenario,{warm});row.shellReadyMs=Date.now()-started;
  if(scenario.import&&!warm){
   await page.locator('[data-roster-input="raw-text"]').fill(fixture);
   const clicked=Date.now();await page.locator('[data-roster-action="review-import"]').click();
   await page.waitForFunction(()=>!document.querySelector('[data-roster-view][aria-busy="true"]')&&ArmyBookAppV2.roster.state.units.length>0,null,{timeout:90000});
   row.importClickToReadyMs=Date.now()-clicked;
  }
  readyEpoch=Date.now();row.readyMs=readyEpoch-started;const readyWire=proxy.snapshot();row.wireToReady={downstreamTlsBytes:readyWire.downstreamBytes-wireStart.downstreamBytes,upstreamTlsBytes:readyWire.upstreamBytes-wireStart.upstreamBytes};
  row.rosterUnits=scenario.import?await page.evaluate(()=>ArmyBookAppV2.roster.state.units.length):null;
  row.offline=await offlineProof(observed);assert.equal(row.offline.active,'activated');assert.equal(row.offline.present,221);
  const activated=ledger.swEvents.filter(event=>event.epoch>=started&&event.status==='activated'&&event.scriptURL?.startsWith(observed.base)).map(event=>event.epoch);
  row.offlineReadyMs=warm?0:activated.length?Math.min(...activated)-started:null;
  row.offlineReadyTimestampSource=warm?'verified already installed before reload':activated.length?'CDP ServiceWorker.workerVersionUpdated activated':'not available (cache completeness verified at readiness)';
  row.settled=await settle(observed);
  row.totalMs=Date.now()-started;
  row.paintMarks=marks.filter(mark=>mark.epoch>=started-2).map(mark=>({...mark,ms:mark.epoch-started}));
  row.fcpMs=row.paintMarks.filter(mark=>mark.name==='FCP').map(mark=>mark.ms).sort((a,b)=>a-b)[0]??null;
  row.firstUsefulDomMs=row.paintMarks.filter(mark=>mark.name==='first-useful-DOM').map(mark=>mark.ms).sort((a,b)=>a-b)[0]??null;
  row.resources=await page.evaluate(()=>performance.getEntriesByType('resource').map(resource=>({url:resource.name,type:resource.initiatorType,start:resource.startTime,duration:resource.duration,transferSize:resource.transferSize,encodedBodySize:resource.encodedBodySize,decodedBodySize:resource.decodedBodySize})));
  row.longTasks=await page.evaluate(()=>window.__auditLongTasks||[]);
  const metrics=await observed.cdp.send('Performance.getMetrics');row.cpu=Object.fromEntries(metrics.metrics.filter(metric=>['ScriptDuration','TaskDuration','LayoutDuration','RecalcStyleDuration','JSHeapUsedSize'].includes(metric.name)).map(metric=>[metric.name,metric.name.endsWith('Duration')?metric.value-(prior[metric.name]||0):metric.value]));
  row.status='OBSERVED';
 }catch(error){row.status='OBSERVATION_ERROR';row.error=error.message;row.totalMs=Date.now()-started;}
 row.finishedEpoch=Date.now();row.requests=ledger.normalized(started,row.finishedEpoch);row.total=count(row.requests);row.toReady=count(row.requests.filter(request=>request.endEpoch&&request.endEpoch<=readyEpoch));
 const wire=proxy.snapshot();row.wire={downstreamTlsBytes:wire.downstreamBytes-wireStart.downstreamBytes,upstreamTlsBytes:wire.upstreamBytes-wireStart.upstreamBytes};
 row.errors=observed.errors;row.notes=ledger.notes;row.workerSessions=ledger.workerSessions;row.swEvents=ledger.swEvents.filter(event=>event.epoch>=started);
 if(origin==='local'){
  row.server=local.records.slice(serverStart).map(record=>({...record,startMs:record.started-observed.nodeMonotonicStart,finishedMs:record.finished===null?null:record.finished-observed.nodeMonotonicStart}));
  row.serverTotals={networkRequests:row.server.length,compressedBodyBytes:row.server.reduce((n,record)=>n+(record.finished!==null?record.bodyBytes:0),0),decodedBodyBytes:row.server.reduce((n,record)=>n+(record.finished!==null&&record.status!==304?record.rawBytes:0),0)};
 }
 fs.writeFileSync(folder+'/'+label+'.json',JSON.stringify(row,null,2)+'\n');summary.rows.push({id:label,origin,network,scenario:scenario.id,repetition,cache:row.cache,status:row.status,readyMs:row.readyMs,fcpMs:row.fcpMs,offlineReadyMs:row.offlineReadyMs,totalMs:row.totalMs,total:row.total,serverTotals:row.serverTotals,error:row.error});save();
 console.log(JSON.stringify({id:label,status:row.status,readyMs:row.readyMs,fcpMs:row.fcpMs,offlineMs:row.offlineReadyMs,requests:row.total.networkRequests,encoded:row.total.compressedBodyBytes,serverEncoded:row.serverTotals?.compressedBodyBytes,error:row.error}));
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
 if(!option('--skip-calibration'))for(const network of pilot?['fast4g','slow4g']:[])await calibration(network);
 const selectedOrigins=process.argv.includes('--calibration-only')?[]:legacyControl?['local']:onlyOrigin?[onlyOrigin]:pilot?['local','live']:['local','live'];
 const selectedNetworks=legacyControl?['fast4g']:onlyNetwork?[onlyNetwork]:pilot?['unlimited']:Object.keys(NETWORKS);
 const selectedScenarios=legacyControl?scenarios.filter(scenario=>scenario.id==='home'):onlyScenario?scenarios.filter(scenario=>scenario.id===onlyScenario):pilot?scenarios.filter(scenario=>scenario.id==='home'):scenarios;
 const repetitions=pilot?1:3;
 for(const origin of selectedOrigins)for(const network of selectedNetworks)for(let repetition=1;repetition<=repetitions;repetition++)for(const scenario of selectedScenarios){
  const label=[origin,network,scenario.id,repetition].join('-');assert(!fs.existsSync(folder+'/'+label+'-cold.json'),'Never overwrite a prior sample');
  proxy.setCondition(legacyControl?NETWORKS.unlimited:NETWORKS[network]);local.legacy.condition=legacyControl?{downloadBps:9000000/8,latencyMs:170}:null;
  const observed=await openObservedBrowser({proxy,base:origins[origin],spki:local.spki,assets,label,netlog:true});observed.base=origins[origin];observed.nodeMonotonicStart=performance.now();
  try{
   console.log('START '+label);
   const cold=await observe(observed,scenario,{warm:false,origin,network,repetition,label:label+'-cold'});
   if(cold.status!=='OBSERVED'&&pilot)throw Error('Cold observation failed; inspect '+label);
   const warm=await observe(observed,scenario,{warm:true,origin,network,repetition,label:label+'-warm'});
   if(warm.status!=='OBSERVED'&&pilot)throw Error('Warm observation failed; inspect '+label);
  }finally{await observed.close();}
 }
 summary.status=summary.rows.every(row=>row.status==='OBSERVED')?'COMPLETE':'OBSERVED_WITH_ERRORS';
}catch(error){summary.status='HARNESS_ERROR';summary.error=error.stack;throw error;}
finally{summary.finished=new Date().toISOString();save();await proxy.close();await local.close();}
