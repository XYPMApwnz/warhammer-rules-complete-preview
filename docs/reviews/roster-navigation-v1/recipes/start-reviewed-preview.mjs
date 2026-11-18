import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import {createResponder} from 'file:///E:/Warhammer/qa-evidence/preview-v1-2026-11-14/RECIPES/runtime-server.mjs';
const evidence='E:/Warhammer/qa-evidence/roster-navigation-v1-2026-11-17',temporary='E:/Warhammer/qa-tmp/preview-v1',repo='E:/Warhammer/worktrees/roster-navigation-v1';
const sha='5bc1b038437fcac86966f87371760da94d7e9b38',gate=JSON.parse(fs.readFileSync(path.join(evidence,'FINAL_PREFLIGHT_RUN.json'))),acceptance=JSON.parse(fs.readFileSync(path.join(evidence,'FINAL_ACCEPTANCE.json'))),targeted=JSON.parse(fs.readFileSync(path.join(evidence,'POST_PREFLIGHT_TEST_RUN.json')));
assert.equal(acceptance.status,'PASS');assert.equal(acceptance.finalSha,sha);assert.equal(acceptance.completedJobCoverage,179);assert.deepEqual(acceptance.changedAfterPreff,['v2/card-gained-rules-browser-qa.mjs']);
assert.equal(gate.status,'FAIL');assert.equal(gate.sha,acceptance.preffSha);assert.equal(gate.headAfter,acceptance.preffSha);assert.equal(gate.treeAfter,'');assert.equal(gate.failed,1);assert.equal(gate.passed,178);
assert.equal(targeted.status,'PASS');assert.equal(targeted.sha,sha);assert.equal(targeted.exitCode,0);
const git=(...args)=>execFileSync('git',args,{cwd:repo,encoding:'utf8'}).trim();assert.equal(git('rev-parse','HEAD'),sha);assert.equal(git('status','--porcelain'),'');
assert.deepEqual(git('diff','--name-only',gate.sha,sha).split('\n'),['v2/card-gained-rules-browser-qa.mjs']);
const root=path.join(temporary,'package-'+sha.slice(0,8)),stopFile=path.join(temporary,'STOP-roster-navigation-'+sha.slice(0,8));assert(!fs.existsSync(stopFile));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'PAGES_RUNTIME_MANIFEST.json')));assert.equal(manifest.fileCount,453);assert.equal(manifest.cacheRevision,'a4ab4bdc382e9a00');
const records=[],app=createResponder(()=>({root,label:sha}),{records,publicCA:path.join(temporary,'tls/preview-ca.cer')});
const http=app.http(),https=app.https({key:fs.readFileSync(path.join(temporary,'tls/server.key')),cert:fs.readFileSync(path.join(temporary,'tls/server.pem'))});
await new Promise((resolve,reject)=>{http.once('error',reject);http.listen(8765,'0.0.0.0',resolve);});
await new Promise((resolve,reject)=>{https.once('error',reject);https.listen(8443,'0.0.0.0',resolve);});
const status={status:'RUNNING',pid:process.pid,sha,root,started:new Date().toISOString(),http:'http://localhost:8765/',lan:'http://192.168.1.124:8765/',https:'https://192.168.1.124:8443/',stopFile,cacheRevision:manifest.cacheRevision,servedContentSha256:manifest.contentSha256};
const save=()=>{fs.writeFileSync(path.join(evidence,'PREVIEW_STATUS.json'),JSON.stringify(status,null,2)+'\n');fs.writeFileSync(path.join(temporary,'CURRENT_PREVIEW.json'),JSON.stringify(status,null,2)+'\n');};save();console.log(JSON.stringify(status));
let signature='';const timer=setInterval(async()=>{
  const next=records.length+':'+records.filter(row=>row.finished!==null).length;if(next!==signature){signature=next;fs.writeFileSync(path.join(evidence,'preview-requests.json'),JSON.stringify(records,null,2)+'\n');}
  if(!fs.existsSync(stopFile))return;clearInterval(timer);
  await Promise.all([new Promise(resolve=>http.close(resolve)),new Promise(resolve=>https.close(resolve))]);app.close();status.status='STOPPED';status.stopped=new Date().toISOString();save();
},1000);
