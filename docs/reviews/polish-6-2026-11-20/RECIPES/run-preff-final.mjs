import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync,spawn} from 'node:child_process';
const root='E:/Warhammer/worktrees/polish-6-v1',out='E:/Warhammer/qa-evidence/polish-6-v1-2026-11-20';
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
const read=file=>JSON.parse(fs.readFileSync(out+'/'+file));
const sha=read('FEATURE_FINAL.json').sha;
assert.equal(git('rev-parse','HEAD'),sha);assert.equal(git('status','--porcelain'),'');
for(const file of ['AB_FINAL.json','SCOPE_EQUALITY_FINAL.json','CENSUS_FINAL_METADATA.json','LAZY_PERFORMANCE_corrected.json','HOME_COLD_PERFORMANCE.json'])assert.equal(read(file).status,'PASS',file);
for(const [file,expected]of Object.entries(read('LAZY_PERFORMANCE_corrected.json').runtimeHashes.head))
 assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),expected,'Final measured runtime changed: '+file);
const env={...process.env,WH_PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH:'C:/Program Files/Google/Chrome/Application/chrome.exe',
 PLAYWRIGHT_CHROMIUM_EXECUTABLE:'C:/Program Files/Google/Chrome/Application/chrome.exe',QA_TMP_ROOT:'E:/Warhammer/qa-tmp/polish-6',
 QA_SKIP_TMP_SWEEP:'1',PYTHONUTF8:'1',PYTHONDONTWRITEBYTECODE:'1'};
const jobs=JSON.parse(execFileSync(process.execPath,['tools/qa-queue.mjs','pre-ff','--list'],{cwd:root,encoding:'utf8',env}));
assert.equal(jobs.length,198);
const file=out+'/PRE_FF_FINAL_RUN.json',record={schema:'polish-six-authorized-final-preff/v1',sha,status:'RUNNING',started:new Date().toISOString(),expectedJobs:jobs.length};
fs.writeFileSync(file,JSON.stringify(record,null,2)+'\n',{flag:'wx'});
const fd=fs.openSync(out+'/pre-ff-final-console.log','wx'),started=Date.now();
const child=spawn(process.execPath,['tools/qa-queue.mjs','pre-ff','--out='+out+'/pre-ff-final'],{cwd:root,env,stdio:['ignore',fd,fd]});
console.log('STARTED '+JSON.stringify({sha,pid:child.pid,jobs:jobs.length}));
const result=await new Promise(resolve=>{child.on('error',error=>resolve({exitCode:null,error:error.message}));child.on('close',(exitCode,signal)=>resolve({exitCode,signal}));});
fs.closeSync(fd);Object.assign(record,result,{elapsedMs:Date.now()-started,finished:new Date().toISOString(),headAfter:git('rev-parse','HEAD'),treeAfter:git('status','--porcelain')});
const results=read('pre-ff-final/RESULTS.json');record.passed=results.results.filter(row=>row.status==='PASS').length;record.failed=results.results.filter(row=>row.status==='FAIL').length;
record.status=result.exitCode===0&&record.headAfter===sha&&!record.treeAfter&&record.passed===jobs.length?'PASS':'FAIL';
fs.writeFileSync(file,JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify(record));process.exitCode=record.status==='PASS'?0:1;
