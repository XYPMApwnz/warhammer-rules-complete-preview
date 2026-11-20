/** Serve only the exact clean feature whose complete pre-FF passed. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {createResponder} from 'file:///E:/Warhammer/qa-evidence/preview-v1-2026-11-14/RECIPES/runtime-server.mjs';
const out='E:/Warhammer/qa-evidence/polish-6-v1-2026-11-20',repo='E:/Warhammer/worktrees/polish-6-v1';
const temporary='E:/Warhammer/qa-tmp/preview-v1',sha=JSON.parse(fs.readFileSync(out+'/FEATURE.json')).sha;
const gate=JSON.parse(fs.readFileSync(out+'/PRE_FF_RUN.json')),ab=JSON.parse(fs.readFileSync(out+'/AB.json'));
assert.equal(gate.status,'PASS');assert.equal(gate.sha,sha);assert.equal(gate.headAfter,sha);assert.equal(gate.treeAfter,'');
assert.equal(gate.failed,0);assert.equal(gate.passed,197);assert.equal(gate.expectedJobs,197);
assert.equal(ab.status,'PASS');assert.equal(ab.lanes.head.manifest.sha,sha);assert.equal(ab.lanes.head.manifest.counts.cases,199);assert.equal(ab.lanes.head.manifest.counts.frames,507);
const git=(...args)=>execFileSync('git',args,{cwd:repo,encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),sha);assert.equal(git('status','--porcelain'),'');
const root=path.join(temporary,'package-polish-6-'+sha.slice(0,8));
const acceptedBytes=fs.readFileSync(out+'/pre-ff/RUNTIME_MANIFEST.json'),packagedBytes=fs.readFileSync(root+'/PAGES_RUNTIME_MANIFEST.json');
assert(acceptedBytes.equals(packagedBytes),'Preview package differs from the exact pre-FF package');
const manifest=JSON.parse(packagedBytes),stopFile=path.join(temporary,'STOP-polish-6-'+sha.slice(0,8));
assert(!fs.existsSync(stopFile));assert.equal(manifest.precacheUrls,223);assert.equal(manifest.fileCount,457);
const records=[],app=createResponder(()=>({root,label:sha}),{records,publicCA:path.join(temporary,'tls/preview-ca.cer')});
const http=app.http(),https=app.https({key:fs.readFileSync(path.join(temporary,'tls/server.key')),cert:fs.readFileSync(path.join(temporary,'tls/server.pem'))});
await new Promise((resolve,reject)=>{http.once('error',reject);http.listen(8765,'0.0.0.0',resolve);});
await new Promise((resolve,reject)=>{https.once('error',reject);https.listen(8443,'0.0.0.0',resolve);});
const ips=Object.values(os.networkInterfaces()).flat().filter(row=>row?.family==='IPv4'&&!row.internal&&/^192\.168\./.test(row.address)).map(row=>row.address);
const status={status:'RUNNING',pid:process.pid,sha,root,started:new Date().toISOString(),http:'http://localhost:8765/',
 lan:ips[0]?`http://${ips[0]}:8765/`:null,https:ips[0]?`https://${ips[0]}:8443/`:null,stopFile,
 cacheRevision:manifest.cacheRevision,servedContentSha256:manifest.contentSha256,preffPassed:gate.passed};
const save=()=>{fs.writeFileSync(out+'/PREVIEW_STATUS.json',JSON.stringify(status,null,2)+'\n');fs.writeFileSync(temporary+'/CURRENT_PREVIEW.json',JSON.stringify(status,null,2)+'\n');};
save();console.log(JSON.stringify(status));
const timer=setInterval(async()=>{if(!fs.existsSync(stopFile))return;clearInterval(timer);
 await Promise.all([new Promise(resolve=>http.close(resolve)),new Promise(resolve=>https.close(resolve))]);app.close();
 status.status='STOPPED';status.stopped=new Date().toISOString();save();},1000);
