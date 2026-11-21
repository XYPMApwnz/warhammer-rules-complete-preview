/** Sanitized measurement-origin correction proof. Never export raw NetLog/profile. */
import fs from 'node:fs';
import os from 'node:os';
import {parseOriginNetLog} from '../methodology/parse-netlog-requests.mjs';
const OUT='E:/Warhammer/qa-evidence/load-audit-v1-2026-11-21',TMP='E:/Warhammer/qa-tmp/load-audit';
const source=JSON.parse(fs.readFileSync(OUT+'/measurements-v2/INDEX.json'));
const cases=[];
for(const info of source.rows.filter(row=>row.origin==='local'&&row.scenario==='dg-book'&&row.cache==='cold')){
 const trial=JSON.parse(fs.readFileSync(OUT+'/measurements-v2/'+info.id+'.json'));
 const failures=trial.requests.filter(row=>row.actor==='service-worker'&&row.failure==='net::ERR_HTTP2_PROTOCOL_ERROR');
 if(!failures.length)continue;
 const raw=JSON.parse(fs.readFileSync(TMP+'/'+trial.profileName+'/netlog.json')),names=Object.fromEntries(Object.entries(raw.constants.logEventTypes).map(([name,id])=>[id,name]));
 const origin=new URL(trial.requests[0].url).origin,netlog=parseOriginNetLog(raw,{origin,startEpoch:trial.startedEpoch,endEpoch:trial.finishedEpoch});
 const reset=raw.events.filter(event=>names[event.type]==='HTTP2_SESSION_RECV_RST_STREAM'&&event.params?.error_code==='11 (ENHANCE_YOUR_CALM)').map(event=>({epoch:Number(event.time)+Number(raw.constants.timeTickOffset),sessionId:event.source.id,streamId:event.params.stream_id,error:event.params.error_code}));
 cases.push({id:info.id,failedWorkerStreams:failures.length,failedPaths:failures.map(row=>row.relative),actualHeaderSends:netlog.networkRequests,originHandlerRequests:trial.serverTotals.networkRequests,
  resets:reset.map(event=>({timeMs:event.epoch-trial.startedEpoch,stream:event.sessionId+':'+event.streamId,error:event.error,path:netlog.rows.find(row=>row.h2Stream===event.sessionId+':'+event.streamId)?.url.split('/warhammer-rules-complete-preview/')[1]??null}))});
}
const corrected=JSON.parse(fs.readFileSync(OUT+'/measurements-local-dg-corrected/INDEX.json'));
const correctedFailures=corrected.rows.flatMap(info=>{const trial=JSON.parse(fs.readFileSync(OUT+'/measurements-local-dg-corrected/'+info.id+'.json'));return trial.requests.filter(row=>row.actor==='service-worker'&&row.failure&&new URL(row.url).pathname!=='/favicon.ico').map(row=>({id:info.id,path:row.relative,error:row.failure}));});
fs.writeFileSync(OUT+'/H2_LIMIT_DIAGNOSIS.json',JSON.stringify({schema:'load-audit-local-origin-correction/v1',finding:'Original constrained local DG-book streams hit audit Node origin queued-session memory limit; no corresponding live Pages failures.',officialDocumentation:'https://nodejs.org/api/http2.html#http2createsecureserveroptions-onrequesthandler',defaultMiB:10,correctedAuditOriginMiB:128,runtimeBytesChanged:false,shaperChanged:false,ownerPreviewChanged:false,excludedCases:cases,replacedRows:18,correctedWorkerFailures:correctedFailures},null,2)+'\n');
const trial=JSON.parse(fs.readFileSync(OUT+'/accepted-matrix/local-unlimited-home-1-cold.json'));
const raw=JSON.parse(fs.readFileSync(TMP+'/'+trial.profileName+'/netlog.json')),client=raw.constants.clientInfo;
fs.writeFileSync(OUT+'/ENVIRONMENT.json',JSON.stringify({node:process.version,platform:os.platform(),release:os.release(),arch:os.arch(),cpuModel:os.cpus()[0]?.model,logicalCpus:os.cpus().length,totalMemoryBytes:os.totalmem(),browser:{name:client?.name,version:client?.version,osType:client?.os_type},playwright:'1.61.1',cpuThrottling:false,viewport:{width:390,height:844},deviceProfile:'Pixel 7',privateHostnameUsernamesCommandLineOmitted:true},null,2)+'\n');
console.log(JSON.stringify({failedOriginalCases:cases.length,rejectedStreams:cases.reduce((n,row)=>n+row.failedWorkerStreams,0),correctedWorkerFailures:correctedFailures.length}));
