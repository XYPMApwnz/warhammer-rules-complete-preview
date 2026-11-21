/** Authoritative NetLog reduction after every measurement browser has closed. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {parseOriginNetLog} from './parse-netlog-requests.mjs';
const OUT='E:/Warhammer/qa-evidence/fast-first-load-v1-2026-11-21',TMP='E:/Warhammer/qa-tmp/fast-first-load';
const option=name=>process.argv.find(arg=>arg.startsWith(name+'='))?.slice(name.length+1);
assert(option('--results'),'Pass --results=<measurement folder>');
const source=path.resolve(OUT,option('--results'));assert(source.startsWith(path.resolve(OUT)+path.sep),'Results must be in this task evidence root');
const index=JSON.parse(fs.readFileSync(source+'/INDEX.json'));assert.equal(index.status,'COMPLETE');assert.equal(index.rows.length,index.expectedRows);assert(index.rows.length>0,'No application observations to reduce');
if(process.argv.includes('--require-full')){assert.equal(index.rows.length,72);assert.equal(index.repetitions,3);}
const destination=source+'/reduced';fs.mkdirSync(destination,{recursive:true});
const csv=(rows,headers)=>[headers.join(','),...rows.map(row=>headers.map(key=>'"'+String(row[key]??'').replaceAll('"','""')+'"').join(','))].join('\n')+'\n';
const writeCsv=(file,rows,headers=Object.keys(rows[0]||{}))=>fs.writeFileSync(destination+'/'+file,csv(rows,headers));
const median=values=>{const ordered=values.filter(Number.isFinite).sort((a,b)=>a-b),n=ordered.length;return n?n%2?ordered[(n-1)/2]:(ordered[n/2-1]+ordered[n/2])/2:null;};
const relative=url=>{const item=new URL(url),query=new URLSearchParams();for(const [key,value]of item.searchParams)query.append(key,['v2','book','v','wh-pwa','version-check'].includes(key)?value:'[omitted]');return item.pathname.replace(/^\/warhammer-rules-complete-preview\//,'')+(query.size?'?'+query:'');};
const profiles=new Map();for(const info of index.rows){const trial=JSON.parse(fs.readFileSync(source+'/'+info.id+'.json'));assert.equal(trial.status,'OBSERVED');const list=profiles.get(trial.profileName)||[];list.push(trial);profiles.set(trial.profileName,list);}
assert.equal(profiles.size,index.rows.length/2);
const observations=[],requests=[],duplicates=[],versions=new Set(),validation={contentLengthMismatches:[],afterWindowEvents:[],compressedDecodedFallback:[],runtimeHttpFailures:[],pageExceptions:[],serverCountDeltas:[],readyTimestampUpperBounds:[],missingPassiveReadyMarks:[]};
for(const [profile,trials]of profiles){
 assert.equal(trials.length,2);assert.deepEqual(trials.map(row=>row.cache).sort(),['cold','warm']);for(const field of ['side','network','scenario','repetition'])assert.equal(trials[0][field],trials[1][field]);
 const raw=JSON.parse(fs.readFileSync(TMP+'/'+profile+'/netlog.json'));versions.add(raw.constants.clientInfo?.version||'not-recorded');
 for(const trial of trials){
  assert.equal(trial.offline.present,221);assert.equal(trial.offline.matchesPublication,true);assert.equal(trial.offline.active,'activated');
  const origin=new URL(trial.requests.find(row=>/^https?:/.test(row.url)).url).origin;
  const parsed=parseOriginNetLog(raw,{origin,startEpoch:trial.startedEpoch,endEpoch:trial.finishedEpoch});parsed.rows.sort((a,b)=>(a.requestStartEpoch??a.sendEpoch)-(b.requestStartEpoch??b.sendEpoch));
  let encodedBeforeReady=0,decodedBeforeReady=0;const boundary=trial.startedEpoch+trial.readyMs,own=[];
  const observedBoundaries=Object.fromEntries(['ApplicationReady','BootstrapReady','NativeImportReady'].map(name=>{const field={ApplicationReady:'applicationReadyMs',BootstrapReady:'bootstrapReadyDomMs',NativeImportReady:'nativeImportReadyMs'}[name],value=trial[field];return[name,Number.isFinite(value)?{epoch:trial.startedEpoch+value,encoded:0,decoded:0}:null];}));
  for(const row of parsed.rows){
   const noBody=row.method==='HEAD'||[204,205,304].includes(row.status),encodedEvents=noBody?[]:row.h2Stream!==null?row.h2DataEvents:row.rawByteEvents,decodedEvents=noBody?[]:row.filteredByteEvents.length?row.filteredByteEvents:encodedEvents;
   const before=encodedEvents.filter(event=>event.epoch<=boundary).reduce((n,event)=>n+event.bytes,0);encodedBeforeReady+=before;decodedBeforeReady+=decodedEvents.filter(event=>event.epoch<=boundary).reduce((n,event)=>n+event.bytes,0);
   for(const point of Object.values(observedBoundaries))if(point){point.encoded+=encodedEvents.filter(event=>event.epoch<=point.epoch).reduce((n,event)=>n+event.bytes,0);point.decoded+=decodedEvents.filter(event=>event.epoch<=point.epoch).reduce((n,event)=>n+event.bytes,0);}
   const item={observation:trial.id,side:trial.side,network:trial.network,scenario:trial.scenario,cache:trial.cache,repetition:trial.repetition,ordinal:own.length+1,path:relative(row.url),method:row.method,status:row.status,protocol:row.protocol,
    startMs:Math.round((row.requestStartEpoch??row.sendEpoch)-trial.startedEpoch),responseMs:row.responseMs===null?null:Math.round(row.responseMs),endMs:Math.round(Math.min(trial.finishedEpoch,row.endEpoch??row.h2DataEvents.at(-1)?.epoch??row.responseEpoch??row.sendEpoch)-trial.startedEpoch),
    encodedBytes:row.networkBodyBytes,decodedBytes:row.decodedNetworkBodyBytes,encodedBeforeReady:before,encoding:row.responseHeaders['content-encoding']||'identity',cacheControl:row.responseHeaders['cache-control']||'',contentLength:row.contentLength,contentLengthMatches:row.contentLengthMatches,eventsAfterWindow:row.eventsAfterWindow};
   item.filePath=item.path.split('?')[0]||'index.html';own.push(item);requests.push(item);
   if(row.contentLengthMatches===false)validation.contentLengthMismatches.push({id:trial.id,path:item.path});
   if(row.eventsAfterWindow)validation.afterWindowEvents.push({id:trial.id,path:item.path,count:row.eventsAfterWindow});
   if(item.encoding!=='identity'&&item.encodedBytes>0&&!row.filteredByteEvents.length)validation.compressedDecodedFallback.push({id:trial.id,path:item.path});
   if(item.path!=='/favicon.ico'&&(row.status===null||row.status>=400))validation.runtimeHttpFailures.push({id:trial.id,path:item.path,status:row.status});
  }
  assert(encodedBeforeReady>=0&&encodedBeforeReady<=parsed.encodedBodyBytes);assert(decodedBeforeReady>=0&&decodedBeforeReady<=parsed.decodedNetworkBodyBytes);
  for(const point of Object.values(observedBoundaries))if(point){assert(point.encoded>=0&&point.encoded<=parsed.encodedBodyBytes);assert(point.decoded>=0&&point.decoded<=parsed.decodedNetworkBodyBytes);}
  const expectedMarks=['applicationReadyMs','bootstrapReadyDomMs',...(trial.scenario==='dg-roster'&&trial.cache==='cold'?['nativeImportReadyMs']:[])];for(const field of expectedMarks)if(!Number.isFinite(trial[field]))validation.missingPassiveReadyMarks.push({id:trial.id,field});
  if(trial.errors.length)validation.pageExceptions.push({id:trial.id,count:trial.errors.length});
  const delta=parsed.networkRequests-trial.serverTotals.networkRequests;if(delta)validation.serverCountDeltas.push({id:trial.id,delta});
  if(trial.cache==='cold'&&trial.offlineReadyTimestampSource.includes('upper bound'))validation.readyTimestampUpperBounds.push({id:trial.id,source:trial.offlineReadyTimestampSource});
  const grouped=new Map();for(const row of own){const list=grouped.get(row.filePath)||[];list.push(row);grouped.set(row.filePath,list);}for(const [file,rows]of grouped)if(rows.length>1)duplicates.push({observation:trial.id,filePath:file,requests:rows.length,urlKeys:new Set(rows.map(row=>row.path)).size,positiveBodies:rows.filter(row=>row.encodedBytes>0).length,encodedBytes:rows.reduce((n,row)=>n+row.encodedBytes,0)});
  observations.push({id:trial.id,side:trial.side,network:trial.network,scenario:trial.scenario,cache:trial.cache,repetition:trial.repetition,concurrency:trial.declaredConcurrency,
   fcpMs:trial.fcpMs,firstUsefulDomMs:trial.firstUsefulDomMs,readyMs:trial.readyMs,applicationReadyWatchAttachedMs:trial.applicationReadyWatchAttachedMs??null,applicationReadyMs:trial.applicationReadyMs??null,bootstrapReadyDomMs:trial.bootstrapReadyDomMs??null,
   nativeImportClickMs:trial.nativeImportClickMs??null,nativeImportReadyMs:trial.nativeImportReadyMs??null,nativeImportClickToReadyMs:trial.nativeImportClickToReadyMs??null,
   domContentLoadedMs:trial.domContentLoadedMs??null,loadEventEndMs:trial.loadEventEndMs??null,driverDomContentLoadedReturnMs:trial.driverDomContentLoadedReturnMs??null,driverAppGlobalSeenMs:trial.driverAppGlobalSeenMs??null,driverAppReadyPromiseReturnMs:trial.driverAppReadyPromiseReturnMs??null,driverLoadingMarkerGoneMs:trial.driverLoadingMarkerGoneMs??null,finalVisibilityState:trial.navigationTiming?.visibilityState??null,
   offlineReadyMs:trial.offlineReadyMs,offlineUsableMs:Number.isFinite(trial.offlineReadyMs)&&Number.isFinite(trial.workerActivatedMs)?Math.max(trial.offlineReadyMs,trial.workerActivatedMs):null,offlineReadyTimestampSource:trial.offlineReadyTimestampSource,workerActivatedMs:trial.workerActivatedMs,offlineWaitAfterInteractiveMs:trial.offlineWaitAfterInteractiveMs,importClickToReadyMs:trial.importClickToReadyMs??null,totalMs:trial.totalMs,settled:trial.settled?.idle,
   requests:parsed.networkRequests,encodedBytes:parsed.encodedBodyBytes,decodedBytes:parsed.decodedNetworkBodyBytes,encodedBeforeReady,decodedBeforeReady,encodedAfterReady:parsed.encodedBodyBytes-encodedBeforeReady,
   ...Object.fromEntries(Object.entries(observedBoundaries).flatMap(([name,value])=>[['encodedBefore'+name,value?.encoded??null],['decodedBefore'+name,value?.decoded??null]])),
   tlsBeforeReady:trial.wireToReady.downstreamTlsBytes,tlsTotal:trial.wire.downstreamTlsBytes,cdpDiagnosticRequests:trial.total.networkRequests,serverRequestDelta:delta});
 }
}
const groups=new Map();for(const row of observations){const key=[row.network,row.scenario,row.cache].join('|'),list=groups.get(key)||[];list.push(row);groups.set(key,list);}
const metrics=['fcpMs','firstUsefulDomMs','readyMs','applicationReadyWatchAttachedMs','applicationReadyMs','bootstrapReadyDomMs','nativeImportClickMs','nativeImportReadyMs','nativeImportClickToReadyMs','domContentLoadedMs','loadEventEndMs','driverDomContentLoadedReturnMs','driverAppGlobalSeenMs','driverAppReadyPromiseReturnMs','driverLoadingMarkerGoneMs','offlineReadyMs','offlineUsableMs','workerActivatedMs','offlineWaitAfterInteractiveMs','importClickToReadyMs','totalMs','requests','encodedBytes','decodedBytes','encodedBeforeReady','decodedBeforeReady','encodedAfterReady','encodedBeforeApplicationReady','decodedBeforeApplicationReady','encodedBeforeBootstrapReady','decodedBeforeBootstrapReady','encodedBeforeNativeImportReady','decodedBeforeNativeImportReady','tlsBeforeReady','tlsTotal'];
const medians=[];for(const [key,rows]of groups){assert.equal(rows.length,index.repetitions,key);assert.deepEqual(rows.map(row=>row.repetition).sort(),Array.from({length:index.repetitions},(_,n)=>n+1));const first=rows[0],row={side:first.side,network:first.network,scenario:first.scenario,cache:first.cache,n:rows.length,concurrency:first.concurrency};for(const field of metrics){const values=rows.map(row=>row[field]),valid=values.filter(Number.isFinite);assert([0,rows.length].includes(valid.length),key+' missing '+field);row[field]=median(values);}row.readyMinMs=Math.min(...rows.map(row=>row.readyMs));row.readyMaxMs=Math.max(...rows.map(row=>row.readyMs));row.allSettled=rows.every(row=>row.settled);row.offlineTimestampSources=[...new Set(rows.map(row=>row.offlineReadyTimestampSource))].join(';');medians.push(row);}
if(process.argv.includes('--require-full'))assert.equal(medians.length,24);
writeCsv('observations.csv',observations);writeCsv('medians.csv',medians);writeCsv('requests.csv',requests);writeCsv('same-file-requests.csv',duplicates,['observation','filePath','requests','urlKeys','positiveBodies','encodedBytes']);
fs.writeFileSync(destination+'/SUMMARY.json',JSON.stringify({schema:'fast-first-load-authoritative-reduction/v1',side:index.side,sourceContentSha256:index.runtimeContentSha256,cacheRevision:index.cacheRevision,concurrency:index.declaredConcurrency,networks:index.networks,browserVersions:[...versions],observations:observations.length,profiles:profiles.size,medians,validation,method:'Actual origin HTTP sends and H2 DATA bodies from private NetLog; no CDP wrapper double-count. Independent metric medians, not additive across columns. Offline ready broadcast, activation and exact221keys kept distinct.'},null,2)+'\n');
console.log(JSON.stringify({destination,observations:observations.length,profiles:profiles.size,medianGroups:medians.length,requests:requests.length,validation:Object.fromEntries(Object.entries(validation).map(([name,rows])=>[name,rows.length]))}));
