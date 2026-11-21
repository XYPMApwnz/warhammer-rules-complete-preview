import fs from 'node:fs';
import assert from 'node:assert/strict';
import {parseOriginNetLog} from '../measurement-recipes/parse-netlog-requests.mjs';
const out='E:/Warhammer/qa-evidence/fast-first-load-v1-2026-11-21',tmp='E:/Warhammer/qa-tmp/fast-first-load',results=[];
for(const n of [1,2]){
 const t=JSON.parse(fs.readFileSync(out+'/measurements-after/after-fast4g-dg-book-'+n+'-warm.json'));
 const raw=JSON.parse(fs.readFileSync(tmp+'/'+t.profileName+'/netlog.json'));
 const origin=new URL(t.requests.find(x=>/^https?:/.test(x.url)).url).origin;
 const parsed=parseOriginNetLog(raw,{origin,startEpoch:t.startedEpoch,endEpoch:t.finishedEpoch});
 const names=Object.fromEntries(Object.entries(raw.constants.logEventTypes).map(([k,v])=>[v,k])),offset=Number(raw.constants.timeTickOffset);
 for(const r of parsed.rows.filter(r=>r.status===null&&new URL(r.url).pathname.endsWith('/service-worker.js'))){
  const errors=raw.events.filter(e=>e.source.id===r.sourceId&&(e.params?.net_error!==undefined||names[e.type]==='CANCELLED')).map(e=>({event:names[e.type],epoch:Number(e.time)+offset,netError:e.params?.net_error??null,afterMeasurementMs:Number(e.time)+offset-t.finishedEpoch}));
  assert(errors.some(e=>e.event==='CANCELLED'&&e.afterMeasurementMs>0));assert(r.requestStartEpoch>t.startedEpoch+t.readyMs);assert.equal(r.networkBodyBytes,0);
  results.push({observation:t.id,request:'service-worker.js',readyMs:t.readyMs,requestStartMs:r.requestStartEpoch-t.startedEpoch,requestSendMs:r.sendEpoch-t.startedEpoch,measurementEndMs:t.finishedEpoch-t.startedEpoch,requestEndMs:r.endEpoch-t.startedEpoch,status:r.status,encodedBytes:r.networkBodyBytes,requestStartsAfterInteractive:r.requestStartEpoch>t.startedEpoch+t.readyMs,errors,classification:'Post-interactive background SW update check canceled by measurement profile teardown; original transaction and delta retained'});
 }
}
const report={status:'EXPLAINED_NOT_REMOVED',observedCancellation:'CANCELLED after measurement window; no numeric net_error recorded',results,boundary:'No observation was discarded, resampled or numerically corrected. Original reduced validation arrays keep two failures/deltas; no application/asset failure, page exception or lost response body.'};
fs.writeFileSync(out+'/TEARDOWN_REQUEST_ANNOTATION.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
