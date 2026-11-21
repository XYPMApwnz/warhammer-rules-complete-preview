/** Read-only reduction of accepted Chromium measurements. Raw profiles stay local. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {parseOriginNetLog} from '../methodology/parse-netlog-requests.mjs';
const OUT='E:/Warhammer/qa-evidence/load-audit-v1-2026-11-21';
const TMP='E:/Warhammer/qa-tmp/load-audit';
const folder=process.argv.find(x=>x.startsWith('--folder='))?.slice(9)||'accepted-matrix';
const primary=folder!=='legacy-control';
const base=path.join(OUT,folder),index=JSON.parse(fs.readFileSync(base+'/INDEX.json'));
const inventory=JSON.parse(fs.readFileSync(OUT+'/inventory/INVENTORY.json')),mandatoryPaths=new Set(inventory.mandatory.map(row=>row.path));
assert.equal(index.status,'COMPLETE','Do not summarize an incomplete matrix');
const destination=path.join(OUT,primary?'tables':'legacy-tables');fs.mkdirSync(destination,{recursive:true});
const csv=(rows,columns)=>[columns.join(','),...rows.map(row=>columns.map(key=>'"'+String(row[key]??'').replaceAll('"','""')+'"').join(','))].join('\n')+'\n';
const writeCsv=(name,rows,columns)=>fs.writeFileSync(destination+'/'+name,csv(rows,columns));
const median=values=>{const sorted=values.filter(Number.isFinite).sort((a,b)=>a-b);return sorted.length?sorted[Math.floor(sorted.length/2)]:null;};
const relative=url=>{let u;try{u=new URL(url);}catch{return '(unknown initiator)';}if(!['http:','https:'].includes(u.protocol))return '(non-HTTP initiator)';const safe=new URLSearchParams();for(const [key,value]of u.searchParams)safe.append(key,['v2','book','v','wh-pwa','version-check'].includes(key)?value:'[omitted]');return u.pathname.replace(/^\/warhammer-rules-complete-preview\//,'')+(safe.size?'?'+safe.toString():'');};
const byProfile=new Map();for(const r of index.rows){const trial=JSON.parse(fs.readFileSync(base+'/'+r.id+'.json'));const list=byProfile.get(trial.profileName)||[];list.push(trial);byProfile.set(trial.profileName,list);}
assert.equal(index.rows.length,primary?144:6);assert.equal(byProfile.size,primary?72:3);
assert.equal(new Set(index.rows.map(row=>row.id)).size,index.rows.length);
for(const trials of byProfile.values()){assert.equal(trials.length,2);assert.deepEqual(trials.map(row=>row.cache).sort(),['cold','warm']);for(const field of ['origin','network','scenario','repetition'])assert.equal(trials[0][field],trials[1][field]);}
const observations=[],requests=[],waterfalls=[],duplicates=[],fileRepeats=[],phases=[],failures=[];
for(const [profile,trials] of byProfile){
 const raw=JSON.parse(fs.readFileSync(TMP+'/'+profile+'/netlog.json','utf8'));
 for(const trial of trials){
  assert.equal(trial.status,'OBSERVED');assert.equal(trial.offline.present,221);assert.equal(trial.offline.active,'activated');
  const actualOrigin=new URL(trial.requests.find(row=>row.url?.startsWith('http')).url).origin;
  const parsed=parseOriginNetLog(raw,{origin:actualOrigin,startEpoch:trial.startedEpoch,endEpoch:trial.finishedEpoch});
  parsed.rows.sort((a,b)=>(a.requestStartEpoch??a.sendEpoch)-(b.requestStartEpoch??b.sendEpoch));
  const boundary=trial.startedEpoch+trial.readyMs;
  let byteEventsBeforeReady=0,decodedBeforeReady=0;
  const matching=trial.requests.filter(row=>row.networkDownload),consumed=new Set();
  for(const row of parsed.rows){
   const candidates=matching.filter(item=>!consumed.has(item)&&item.url===row.url&&item.method===row.method&&Math.abs(item.startEpoch-row.requestStartEpoch)<=100&&(item.actualStatus??item.status)===row.status).sort((a,b)=>Math.abs(a.startEpoch-row.requestStartEpoch)-Math.abs(b.startEpoch-row.requestStartEpoch));
   const match=candidates.length===1?candidates[0]:undefined;if(match)consumed.add(match);
   const noBody=['HEAD'].includes(row.method)||[204,205,304].includes(row.status);
   const encodedEvents=noBody?[]:row.h2Stream!==null?row.h2DataEvents:row.rawByteEvents;
   const before=encodedEvents.filter(event=>event.epoch<=boundary).reduce((n,event)=>n+event.bytes,0);
   const decodedEvents=noBody?[]:row.filteredByteEvents.length?row.filteredByteEvents:encodedEvents;
   const decodedPart=decodedEvents.filter(event=>event.epoch<=boundary).reduce((n,event)=>n+event.bytes,0);
   byteEventsBeforeReady+=before;decodedBeforeReady+=decodedPart;
   const end=Math.min(trial.finishedEpoch,row.endEpoch??row.h2DataEvents.at(-1)?.epoch??row.responseEpoch??row.sendEpoch);
   const record={observation:trial.id,origin:trial.origin,network:trial.network,scenario:trial.scenario,cache:trial.cache,repetition:trial.repetition,
    ordinal:parsed.rows.indexOf(row)+1,path:relative(row.url),method:row.method,status:row.status,protocol:row.protocol,
    startedMs:Math.round((row.requestStartEpoch??row.sendEpoch)-trial.startedEpoch),sentMs:Math.round(row.sendEpoch-trial.startedEpoch),
    responseMs:row.responseMs===null?null:Math.round(row.responseMs),finishedMs:Math.round(end-trial.startedEpoch),durationMs:Math.round(end-(row.requestStartEpoch??row.sendEpoch)),
    encodedBytes:row.networkBodyBytes,decodedBytes:row.decodedNetworkBodyBytes,encodedBeforeReady:before,
    contentLength:row.contentLength,contentLengthMatches:row.contentLengthMatches,encoding:row.responseHeaders['content-encoding']||'identity',
    cacheControl:row.responseHeaders['cache-control']||'',age:row.responseHeaders.age||'',actor:match?.actor||'unattributed (CDP match ambiguous or missing)',
    initiator:match?.initiator?.type||'',initiatorFile:match?.initiator?.stack?.[0]?.url?relative(match.initiator.stack[0].url):'',
    cdpFailure:match?.failure?.errorText||match?.failure||'',bodyByteSource:row.bodyByteSource,decodedByteSource:noBody?'no-body status':row.filteredByteEvents.length?'NetLog filtered representation bytes':'identity H2/job bytes fallback',eventsAfterWindow:row.eventsAfterWindow};
   const file=record.path.split('?')[0]||'index.html';
   record.filePath=file;
   record.mandatoryPath=mandatoryPaths.has(file);
   record.firstShowRole=file==='/favicon.ico'?'implicit browser favicon; not an app readiness dependency':trial.cache==='cold'&&row.sendEpoch<trial.startedEpoch+trial.offlineReadyMs&&record.mandatoryPath?'mandatory path before activation; collective install gate (see actor)':/\.(png|webp|jpe?g|avif|svg)$/.test(file)?'visual resource; no explicit image-completion await':file.endsWith('/source-catalog.json')?'lazy book source input, not Home':/\/generated\/(app-presentation|roster-runtime|roster-import|roster-attachments)\.json$/.test(file)?'book/native input; inspect initiator consumer':/\.(mjs|js|css)$/.test(file)?'code/style dependency; inspect route and static graph':'bootstrap/metadata/data; inspect initiator';
   requests.push(record);
   if(row.contentLengthMatches===false)failures.push({observation:trial.id,path:record.path,kind:'incomplete-content-length',received:row.networkBodyBytes,expected:row.contentLength,cdpFailure:record.cdpFailure});
  }
  const own=requests.filter(row=>row.observation===trial.id),byUrl=new Map();for(const row of own){const list=byUrl.get(row.path)||[];list.push(row);byUrl.set(row.path,list);}
  assert(byteEventsBeforeReady>=0&&byteEventsBeforeReady<=parsed.encodedBodyBytes,trial.id+' encoded boundary accounting');assert(decodedBeforeReady>=0&&decodedBeforeReady<=parsed.decodedNetworkBodyBytes,trial.id+' decoded boundary accounting');
  const repeated=[...byUrl].filter(([,list])=>list.length>1);
  for(const [file,list] of repeated)duplicates.push({observation:trial.id,path:file,requests:list.length,bodyTransfers:list.filter(row=>row.encodedBytes>0).length,encodedBytes:list.reduce((n,row)=>n+row.encodedBytes,0),startsMs:list.map(row=>row.startedMs).join(';'),actors:list.map(row=>row.actor).join(';'),statuses:list.map(row=>row.status).join(';')});
  const physical=new Map();for(const row of own){const list=physical.get(row.filePath)||[];list.push(row);physical.set(row.filePath,list);}for(const [file,list]of physical)if(list.length>1)fileRepeats.push({observation:trial.id,filePath:file,requests:list.length,urlKeys:new Set(list.map(row=>row.path)).size,bodyTransfers:list.filter(row=>row.encodedBytes>0).length,encodedBytes:list.reduce((n,row)=>n+row.encodedBytes,0),startsMs:list.map(row=>row.startedMs).join(';')});
  const orderedBytes=[...own].sort((a,b)=>b.encodedBytes-a.encodedBytes).slice(0,20),orderedTime=[...own].sort((a,b)=>b.durationMs-a.durationMs).slice(0,20);
  waterfalls.push({id:trial.id,readyMs:trial.readyMs,fcpMs:trial.fcpMs,offlineReadyMs:trial.offlineReadyMs,totalMs:trial.totalMs,byBytes:orderedBytes,byDuration:orderedTime});
  observations.push({id:trial.id,origin:trial.origin,network:trial.network,scenario:trial.scenario,cache:trial.cache,repetition:trial.repetition,
   fcpMs:trial.fcpMs,firstUsefulDomMs:trial.firstUsefulDomMs,shellReadyMs:trial.shellReadyMs,readyMs:trial.readyMs,importClickToReadyMs:trial.importClickToReadyMs??null,offlineReadyMs:trial.offlineReadyMs,
   totalMs:trial.totalMs,settled:trial.settled.idle,requests:parsed.networkRequests,encodedBytes:parsed.encodedBodyBytes,decodedBytes:parsed.decodedNetworkBodyBytes,
   encodedBeforeReady:byteEventsBeforeReady,decodedBeforeReady,encodedAfterReady:parsed.encodedBodyBytes-byteEventsBeforeReady,
   tlsBeforeReady:trial.wireToReady.downstreamTlsBytes,tlsTotal:trial.wire.downstreamTlsBytes,
   httpCacheOrSwLogicalResponses:trial.total.cacheOrSWResponses,cdpNetworkRequests:trial.total.networkRequests,
   duplicateUrls:repeated.length,incompleteBodies:parsed.bodyContentLengthMismatches.length,consoleErrors:trial.errors.length,
   cpuTaskMs:Math.round(trial.cpu.TaskDuration*1000),cpuScriptMs:Math.round(trial.cpu.ScriptDuration*1000),longTasks:trial.longTasks.length,
   offlineKeys:trial.offline.present,statuses:JSON.stringify(parsed.statuses),localServerRequests:trial.serverTotals?.networkRequests??null,localServerCountDelta:trial.serverTotals?parsed.networkRequests-trial.serverTotals.networkRequests:null});
  const grouped=new Map();for(const row of own){const file=row.path.split('?')[0],k=row.actor+'|'+(/\.(webp|png|jpg|jpeg|avif|gif|svg|ico)$/.test(file)?'images':/\.(woff2?|ttf|otf)$/.test(file)?'fonts':file.endsWith('.json')?'JSON':/\.(mjs|js)$/.test(file)?'JS':/\.css$/.test(file)?'CSS':'other');const data=grouped.get(k)||{observation:trial.id,group:k,requests:0,encodedBytes:0};data.requests++;data.encodedBytes+=row.encodedBytes;grouped.set(k,data);}phases.push(...grouped.values());
 }
 console.log('Reduced '+profile+' / '+trials.length+' observations');
}
const fields=['fcpMs','firstUsefulDomMs','shellReadyMs','readyMs','importClickToReadyMs','offlineReadyMs','totalMs','requests','encodedBytes','decodedBytes','encodedBeforeReady','decodedBeforeReady','encodedAfterReady','tlsBeforeReady','tlsTotal','httpCacheOrSwLogicalResponses','duplicateUrls','cpuTaskMs','cpuScriptMs'];
const groups=new Map();for(const row of observations){const key=[row.origin,row.network,row.scenario,row.cache].join('|'),list=groups.get(key)||[];list.push(row);groups.set(key,list);}
assert.equal(groups.size,primary?48:2);
const medians=[];for(const [key,list] of groups){assert.equal(list.length,3,key);assert.deepEqual(list.map(row=>row.repetition).sort(),[1,2,3]);const first=list[0],result={origin:first.origin,network:first.network,scenario:first.scenario,cache:first.cache,n:list.length,settledAll:list.every(row=>row.settled),incompleteBodies:list.reduce((n,row)=>n+row.incompleteBodies,0),consoleErrors:list.reduce((n,row)=>n+row.consoleErrors,0)};for(const field of fields){const values=list.map(row=>row[field]),valid=values.filter(Number.isFinite);assert([0,3].includes(valid.length),key+' / '+field+' has incomplete metric samples');result[field]=median(values);}result.readyMinMs=Math.min(...list.map(row=>row.readyMs));result.readyMaxMs=Math.max(...list.map(row=>row.readyMs));result.representative=[...list].sort((a,b)=>Math.abs(a.readyMs-result.readyMs)-Math.abs(b.readyMs-result.readyMs))[0].id;medians.push(result);}
const redownloads=[];for(const trials of byProfile.values()){const cold=trials.find(row=>row.cache==='cold'),warm=trials.find(row=>row.cache==='warm'),earlier=requests.filter(row=>row.observation===cold.id&&row.encodedBytes>0);for(const row of requests.filter(row=>row.observation===warm.id&&row.encodedBytes>0)){const matches=earlier.filter(item=>item.path===row.path);if(matches.length)redownloads.push({cold:cold.id,warm:warm.id,path:row.path,warmEncodedBytes:row.encodedBytes,coldEncodedBytes:matches.reduce((n,item)=>n+item.encodedBytes,0),status:row.status,cacheControl:row.cacheControl,actor:row.actor});}}
writeCsv('observations.csv',observations,Object.keys(observations[0]));writeCsv('medians.csv',medians,Object.keys(medians[0]));writeCsv('requests.csv',requests,Object.keys(requests[0]));writeCsv('repeated-requests.csv',duplicates,Object.keys(duplicates[0]||{observation:0,path:0,requests:0}));writeCsv('warm-redownloads.csv',redownloads,Object.keys(redownloads[0]||{cold:0,warm:0,path:0}));writeCsv('traffic-groups.csv',phases,Object.keys(phases[0]));
writeCsv('same-file-requests.csv',fileRepeats,Object.keys(fileRepeats[0]));
fs.writeFileSync(destination+'/SUMMARY.json',JSON.stringify({schema:'load-audit-reduction/v1',source:index.source,method:'Actual HTTP sends and H2 DATA payloads from Chromium NetLog; cache/SW wrapper responses are not counted as network downloads. Medians are calculated independently per metric, not summed across scenarios.',observations:observations.length,profiles:byProfile.size,medians,validation:{incompleteBodies:failures,notSettled:observations.filter(row=>!row.settled).map(row=>row.id),consoleErrors:observations.filter(row=>row.consoleErrors).map(row=>({id:row.id,count:row.consoleErrors}))}},null,2)+'\n');
fs.writeFileSync(destination+'/WATERFALLS.json',JSON.stringify(waterfalls)+'\n');
console.log(JSON.stringify({observations:observations.length,profiles:byProfile.size,groups:medians.length,requests:requests.length,incompleteBodies:failures.length,destination}));
