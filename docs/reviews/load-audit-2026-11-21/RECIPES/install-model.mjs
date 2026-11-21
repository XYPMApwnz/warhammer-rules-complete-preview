/** Proposal-only schedule sensitivity. No app build/cache policy is changed. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
const OUT='E:/Warhammer/qa-evidence/load-audit-v1-2026-11-21';
const inventory=JSON.parse(fs.readFileSync(OUT+'/inventory/INVENTORY.json'));
const matrix='accepted-matrix',index=JSON.parse(fs.readFileSync(OUT+'/'+matrix+'/INDEX.json'));
assert.equal(index.status,'COMPLETE');
const median=list=>[...list].sort((a,b)=>a-b)[Math.floor(list.length/2)];
const results=[];
for(const info of index.rows.filter(row=>row.scenario==='home'&&row.cache==='cold')){
 const trial=JSON.parse(fs.readFileSync(OUT+'/'+matrix+'/'+info.id+'.json'));
 const root=new URL('./',trial.requests.find(row=>row.url.endsWith('/service-worker.js')).url);
 const selected=inventory.mandatory.map(item=>{const url=new URL(item.url,root).href;
  const rows=trial.requests.filter(row=>row.url===url&&row.actor==='service-worker'&&row.networkDownload&&row.startMs>=0&&row.endMs<=trial.offlineReadyMs).sort((a,b)=>a.startMs-b.startMs);
  assert.equal(rows.length,1,info.id+' '+item.url);const row=rows[0];return {url,duration:row.endMs-row.startMs,start:row.startMs,end:row.endMs,bytes:row.compressedBodyBytes};
 });
 const first=Math.min(...selected.map(row=>row.start)),last=Math.max(...selected.map(row=>row.end)),gaps=[];
 for(let n=4;n<selected.length;n+=4)gaps.push(Math.max(0,Math.min(...selected.slice(n,n+4).map(row=>row.start))-Math.max(...selected.slice(n-4,n).map(row=>row.end))));
 const typicalGap=median(gaps),bodyBytes=selected.reduce((n,row)=>n+row.bytes,0),bits=index.networks[info.network].bitsPerSecond;
 const floorMs=bits?bodyBytes*8/bits*1000:0;
 const estimate=batch=>{let total=0;for(let n=0;n<selected.length;n+=batch)total+=Math.max(...selected.slice(n,n+batch).map(row=>row.duration))+(n?typicalGap:0);return Math.max(total,floorMs);};
 const current=estimate(4),eight=estimate(8),twelve=estimate(12);
 const rolling=slots=>{const available=Array(slots).fill(0);for(const row of selected){const firstSlot=available.indexOf(Math.min(...available));available[firstSlot]+=row.duration+typicalGap;}return Math.max(...available,floorMs);};
 const rollingFour=rolling(4);
 results.push({observation:info.id,origin:info.origin,network:info.network,repetition:info.repetition,entries:selected.length,bodyBytes,observedInstallSpanMs:Math.round(last-first),medianBetweenBatchGapMs:Math.round(typicalGap),fixedDurationModel4Ms:Math.round(current),fixedDurationRolling4Ms:Math.round(rollingFour),fixedDurationModel8Ms:Math.round(eight),fixedDurationModel12Ms:Math.round(twelve),optimisticSavingRolling4Ms:Math.round(Math.max(0,current-rollingFour)),optimisticSaving8Ms:Math.round(Math.max(0,current-eight)),optimisticSaving12Ms:Math.round(Math.max(0,current-twelve)),wireBodyFloorMs:Math.round(floorMs)});
}
const headers=Object.keys(results[0]);fs.writeFileSync(OUT+'/tables/install-schedule-model.csv',[headers.join(','),...results.map(row=>headers.map(key=>row[key]).join(','))].join('\n')+'\n');
fs.writeFileSync(OUT+'/tables/INSTALL_MODEL.json',JSON.stringify({method:'Counterfactual batch schedule reuses observed per-file request duration at four-way load, median observed between-batch gap and a total body-transfer floor. New-concurrency wire/CPU/hash/storage contention is NOT simulated. This is an optimistic sensitivity model, not an implemented A/B result or promised saving.',results},null,2)+'\n');
console.log(JSON.stringify({homeColdModels:results.length}));
