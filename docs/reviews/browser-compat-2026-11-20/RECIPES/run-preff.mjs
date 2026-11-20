import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync,spawn} from 'node:child_process';
const root='E:/Warhammer/worktrees/browser-compat-v1',out='E:/Warhammer/qa-evidence/browser-compat-v1-2026-11-20';
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
const read=file=>JSON.parse(fs.readFileSync(out+'/'+file));
const sha=read('FEATURE.json').sha;
assert.equal(git('rev-parse','HEAD'),sha);assert.equal(git('status','--porcelain'),'');
for(const file of ['AB_FINAL.json','SCOPE_EQUALITY.json','CENSUS.json','PERFORMANCE.json','update-path/RESULTS.json'])assert.equal(read(file).status,'PASS',file);
const measured=read('PERFORMANCE.json');
assert.equal(measured.hashes.head,sha);
assert.equal(read('update-path/RESULTS.json').sourceSha,sha);
const env={...process.env,WH_PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH:'C:/Program Files/Google/Chrome/Application/chrome.exe',
 PLAYWRIGHT_CHROMIUM_EXECUTABLE:'C:/Program Files/Google/Chrome/Application/chrome.exe',QA_TMP_ROOT:'E:/Warhammer/qa-tmp/browser-compat',
 QA_SKIP_TMP_SWEEP:'1',PYTHONUTF8:'1',PYTHONDONTWRITEBYTECODE:'1'};
const jobs=JSON.parse(execFileSync(process.execPath,['tools/qa-queue.mjs','pre-ff','--list'],{cwd:root,encoding:'utf8',env}));
assert.equal(jobs.length,202);
const file=out+'/PRE_FF_RUN.json',record={schema:'browser-compat-authorized-single-preff/v1',sha,status:'RUNNING',started:new Date().toISOString(),expectedJobs:jobs.length};
fs.writeFileSync(file,JSON.stringify(record,null,2)+'\n',{flag:'wx'});
const fd=fs.openSync(out+'/pre-ff-console.log','wx'),started=Date.now();
const child=spawn(process.execPath,['tools/qa-queue.mjs','pre-ff','--out='+out+'/pre-ff'],{cwd:root,env,stdio:['ignore',fd,fd]});
console.log('STARTED '+JSON.stringify({sha,pid:child.pid,jobs:jobs.length}));
const result=await new Promise(resolve=>{child.on('error',error=>resolve({exitCode:null,error:error.message}));child.on('close',(exitCode,signal)=>resolve({exitCode,signal}));});
fs.closeSync(fd);Object.assign(record,result,{elapsedMs:Date.now()-started,finished:new Date().toISOString(),headAfter:git('rev-parse','HEAD'),treeAfter:git('status','--porcelain')});
const results=read('pre-ff/RESULTS.json');record.passed=results.results.filter(row=>row.status==='PASS').length;record.failed=results.results.filter(row=>row.status==='FAIL').length;
record.status=result.exitCode===0&&record.headAfter===sha&&!record.treeAfter&&record.passed===jobs.length?'PASS':'FAIL';
fs.writeFileSync(file,JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify(record));process.exitCode=record.status==='PASS'?0:1;
