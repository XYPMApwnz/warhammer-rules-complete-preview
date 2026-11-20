import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const out='E:/Warhammer/qa-evidence/browser-compat-v1-2026-11-20',tmp='E:/Warhammer/qa-tmp/browser-compat';
const recipe='E:/Warhammer/qa-evidence/card-polish-2-v1-2026-11-14/RECIPES/capture-native.mjs';
const lanes={base:'E:/Warhammer/worktrees/polish-6-v1',head:'E:/Warhammer/worktrees/browser-compat-v1'};
const results={schema:'browser-compat-exact-native-ab/v1',status:'RUNNING',started:new Date().toISOString(),lanes:{}};
const save=()=>fs.writeFileSync(out+'/AB_FINAL.json',JSON.stringify(results,null,2)+'\n');save();
for(const [lane,root]of Object.entries(lanes)){
 const target=tmp+'/ab-final-'+lane,started=Date.now();
 const r=spawnSync(process.execPath,[recipe,'--root='+root,'--out='+target],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024,
  env:{...process.env,QA_TMP_ROOT:tmp,QA_SKIP_TMP_SWEEP:'1',PYTHONUTF8:'1',PYTHONDONTWRITEBYTECODE:'1'}});
 fs.writeFileSync(out+'/AB-final-'+lane+'.log',(r.stdout||'')+(r.stderr||''));
 assert.equal(r.status,0,'Native capture '+lane+': '+(r.stderr||'').slice(-2000));
 const manifest=JSON.parse(fs.readFileSync(target+'/MANIFEST.json'));
 assert.equal(manifest.status,'PASS');assert.equal(manifest.counts.cases,199);assert.equal(manifest.counts.frames,507);
 results.lanes[lane]={root,elapsedMs:Date.now()-started,manifest};save();console.log(lane+' '+JSON.stringify(manifest.counts));
}
results.books=[];
for(const row of results.lanes.base.manifest.books){
 const a=fs.readFileSync(path.join(tmp,'ab-final-base',row.file)),b=fs.readFileSync(path.join(tmp,'ab-final-head',row.file));
 assert(a.equals(b),'Every full serialized native import, snapshot, projection, effective, related and points value must match: '+row.bookId);
 results.books.push({book:row.bookId,rosters:row.cases,states:results.lanes.base.manifest.cases.filter(item=>item.bookId===row.bookId).reduce((n,item)=>n+item.frames.length,0),
 bytes:a.length,sha256:createHash('sha256').update(a).digest('hex'),identical:true,differences:0});
}
results.status='PASS';results.finished=new Date().toISOString();results.differences=0;save();
console.log(JSON.stringify({status:results.status,rosters:199,states:507,differences:0}));
