import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync,spawn} from 'node:child_process';
const root='E:/Warhammer/worktrees/markup-unknown-v1',out='E:/Warhammer/qa-evidence/markup-unknown-v1-2026-11-21/stage2',sha='8579a7a77c7f5e8dad291afc11b27aab3cd9d73a';
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),sha);assert.equal(git('status','--porcelain'),'');
assert.equal(JSON.parse(fs.readFileSync(out+'/ab/RESULTS.json')).status,'PASS');
assert.equal(JSON.parse(fs.readFileSync(out+'/SCOPE_EQUALITY.json')).status,'PASS');
const plan=JSON.parse(fs.readFileSync(out+'/pre-ff-plan.json','utf8').replace(/^\uFEFF/,''));assert.equal(plan.length,203);
const file=out+'/PRE_FF_RUN.json',record={schema:'markup-unknown-authorized-single-preff/v1',sha,status:'RUNNING',started:new Date().toISOString(),expectedJobs:plan.length,
 command:['node','tools/qa-queue.mjs','pre-ff','--out='+out+'/pre-ff']};
fs.writeFileSync(file,JSON.stringify(record,null,2)+'\n',{flag:'wx'});
const fd=fs.openSync(out+'/pre-ff-console.log','wx'),start=Date.now();
const env={...process.env,WH_PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH:'C:/Program Files/Google/Chrome/Application/chrome.exe',PLAYWRIGHT_CHROMIUM_EXECUTABLE:'C:/Program Files/Google/Chrome/Application/chrome.exe',
 QA_TMP_ROOT:'E:/Warhammer/qa-tmp/markup-unknown',QA_SKIP_TMP_SWEEP:'1',PYTHONUTF8:'1',PYTHONDONTWRITEBYTECODE:'1'};
const child=spawn(process.execPath,['tools/qa-queue.mjs','pre-ff','--out='+out+'/pre-ff'],{cwd:root,env,stdio:['ignore',fd,fd]});
record.pid=child.pid;fs.writeFileSync(file,JSON.stringify(record,null,2)+'\n');console.log('STARTED '+JSON.stringify({sha,pid:child.pid,jobs:plan.length,log:out+'/pre-ff-console.log'}));
const result=await new Promise(resolve=>{child.on('error',error=>resolve({exitCode:null,error:error.message}));child.on('close',(exitCode,signal)=>resolve({exitCode,signal}));});
fs.closeSync(fd);Object.assign(record,result,{finished:new Date().toISOString(),elapsedMs:Date.now()-start,headAfter:git('rev-parse','HEAD'),treeAfter:git('status','--porcelain')});
try{const results=JSON.parse(fs.readFileSync(out+'/pre-ff/RESULTS.json','utf8'));record.passed=results.results.filter(row=>row.status==='PASS').length;record.failed=results.results.filter(row=>row.status==='FAIL').length;record.generated=results.results.find(row=>row.id==='books/shared/tools/check-generated-rebuild.mjs');}catch(error){record.resultsError=error.message;}
record.status=result.exitCode===0&&record.headAfter===sha&&!record.treeAfter&&record.passed===plan.length?'PASS':'FAIL';
fs.writeFileSync(file,JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify(record));process.exitCode=record.status==='PASS'?0:1;
