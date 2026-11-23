/** Synthetic runner controls; this file is deliberately outside the 213 leaf jobs. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {baselineSha,jobDeadlineMs,validateTimeoutPolicy,selectJobPlan,createJobProgress,runJobProcess} from '../tools/qa-job-policy.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const policy=JSON.parse(fs.readFileSync(new URL('../tools/qa-pre-ff-timeouts.json',import.meta.url),'utf8'));
const listed=spawnSync(process.execPath,['tools/qa-queue.mjs','pre-ff','--list'],{cwd:root,encoding:'utf8',maxBuffer:4*1024*1024});
assert.equal(listed.status,0,'The frozen leaf plan must remain available without executing checks');
const jobs=JSON.parse(listed.stdout),clone=value=>structuredClone(value);
const synthetic={command:process.execPath,id:'tests/synthetic-job.mjs'};
const run=(code,options={})=>runJobProcess({job:{...synthetic,args:['-e',code]},cwd:root,env:{...process.env},timeoutMs:1000,termGraceMs:100,killGraceMs:300,...options});
const temp=()=>fs.mkdtempSync(path.join(process.env.QA_TMP_ROOT||os.tmpdir(),'qa-job-policy-'));

test('policy retains exactly the ordered 213 jobs and the reviewed baseline',()=>{
 assert.equal(jobs.length,213);assert.equal(policy.baselineSha,baselineSha);validateTimeoutPolicy(policy,jobs,root);
 assert.equal(policy.jobs.every(row=>row.timeoutMs===Math.max(3*row.lastPcElapsedMs,300000)),true);
});

test('deadline formula and numeric refusals',()=>{
 assert.equal(jobDeadlineMs(39),300000);assert.equal(jobDeadlineMs(119000),357000);
 for(const value of [-1,1.2,NaN,Infinity,Number.MAX_SAFE_INTEGER])assert.throws(()=>jobDeadlineMs(value));
});

test('coverage order identity arguments command and exact formula fail closed',()=>{
 for(const mutate of [p=>p.jobs.pop(),p=>p.jobs.reverse(),p=>p.jobs[1].id='tests/other.mjs',
  p=>p.jobs[1].args.push('--other'),p=>p.jobs[1].command='other',p=>p.jobs[1].timeoutMs++,
  p=>p.baselineSha='0'.repeat(40),p=>p.extra=true]){
  const changed=clone(policy);mutate(changed);assert.throws(()=>validateTimeoutPolicy(changed,jobs,root));
 }
});

test('single job selection preserves the full-plan index and refuses ambiguity',()=>{
 assert.equal(selectJobPlan(jobs).length,213);assert.equal(selectJobPlan(jobs,'119')[0].index,118);
 assert.equal(selectJobPlan(jobs,'git diff --check')[0].index,0);
 assert.throws(()=>selectJobPlan(jobs,'0'));assert.throws(()=>selectJobPlan(jobs,'214'));assert.throws(()=>selectJobPlan(jobs,'unknown'));
 const duplicate=jobs.find(job=>jobs.filter(other=>other.id===job.id).length>1);
 assert(duplicate);assert.throws(()=>selectJobPlan(jobs,duplicate.id),/AMBIGUOUS_JOB_FILTER/);
});

test('CLI validates all deadlines before exposing a diagnostic slice',()=>{
 const dir=temp(),file=path.join(dir,'policy.json'),progress=path.join(dir,'public.jsonl');
 try{
  fs.writeFileSync(file,JSON.stringify(policy));
  const invoke=()=>spawnSync(process.execPath,['tools/qa-queue.mjs','pre-ff','--list','--ci-timeout-policy='+file,
   '--progress-file='+progress,'--job=119'],{cwd:root,env:{...process.env,CI:'true'},encoding:'utf8',maxBuffer:4*1024*1024});
  const valid=invoke();assert.equal(valid.status,0);assert.deepEqual(JSON.parse(valid.stdout),[jobs[118]]);
  const altered=clone(policy);altered.jobs.at(-1).timeoutMs++;fs.writeFileSync(file,JSON.stringify(altered));
  const invalid=invoke();assert.notEqual(invalid.status,0);assert.equal(fs.existsSync(progress),false);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('successful and failed children preserve output privately',async()=>{
 const raw=[];const passed=await run('process.stdout.write("PRIVATE_SENTINEL");process.stderr.write("PRIVATE_ERROR");',{onChunk:chunk=>raw.push(chunk.toString())});
 assert.equal(passed.exitCode,0);assert.equal(passed.timedOut,false);assert.equal(passed.teardown.confirmed,true);
 assert(raw.join('').includes('PRIVATE_SENTINEL'));assert(raw.join('').includes('PRIVATE_ERROR'));
 const failed=await run('process.exit(7)');assert.equal(failed.exitCode,7);assert.equal(failed.timedOut,false);
});

test('hung child becomes TIMEOUT and later work can still execute',async()=>{
 const timed=await run('setInterval(()=>{},1000)',{timeoutMs:250});
 assert.equal(timed.timedOut,true);assert.equal(timed.exitCode,124);assert.equal(timed.error,'TIMEOUT');assert.equal(timed.teardown.confirmed,true);
 const next=await run('process.exit(0)');assert.equal(next.exitCode,0);
});

test('exited-zero leader with inherited open stdout is still bounded',{skip:process.platform!=='linux'},async()=>{
 const phases=[];
 const result=await run('require("node:child_process").spawn(process.execPath,["-e","setInterval(()=>{},1000)"],{stdio:["ignore",1,2]});process.exit(0)',
  {timeoutMs:350,onPhase:(phase,details)=>phases.push({phase,...details})});
 assert.equal(result.originalExitCode,0);assert.equal(result.exitCode,124);assert.equal(result.timedOut,true);assert.equal(result.teardown.confirmed,true);
 assert(phases.some(row=>row.phase==='processExit'&&row.processExitCode===0));assert(phases.some(row=>row.phase==='streamsClosed'));
});

test('detached Chromium-like descendant is terminated with its owning job',{skip:process.platform!=='linux'},async()=>{
 const dir=temp(),pidFile=path.join(dir,'detached-child.pid');
 try{
  const childCode='setInterval(()=>{},1000)';
  const code='const p=require("node:child_process").spawn(process.execPath,["-e",'+JSON.stringify(childCode)+'],{detached:true,stdio:"ignore"});require("node:fs").writeFileSync('+JSON.stringify(pidFile)+',String(p.pid));setInterval(()=>{},1000)';
  const result=await run(code,{timeoutMs:600});assert.equal(result.timedOut,true);assert.equal(result.teardown.confirmed,true);
  const pid=Number(fs.readFileSync(pidFile,'utf8'));let live=false;
  try{const stat=fs.readFileSync('/proc/'+pid+'/stat','utf8');live=!['Z','X'].includes(stat.slice(stat.lastIndexOf(')')+2).split(' ')[0]);}catch(error){if(error.code!=='ENOENT')throw error;}
  assert.equal(live,false,'A detached browser process must not survive the next-job boundary');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('public progress and atomic marker never contain child output',async()=>{
 const dir=temp(),file=path.join(dir,'progress.jsonl'),entry={job:synthetic,index:0,ordinal:0};
 const progress=createJobProgress({file,out:dir,total:213,selectedTotal:1});const raw=[];
 try{
  progress.event(entry,'START',0);
  const result=await run('process.stdout.write("PRIVATE_SENTINEL owner@example.invalid");',{onChunk:chunk=>raw.push(chunk.toString()),onPhase:(phase,details)=>{
   progress.phase(entry,phase,0,details);JSON.parse(fs.readFileSync(path.join(dir,'CURRENT_JOB.json'),'utf8'));
  }});
  progress.phase(entry,'cleanup',result.elapsedMs);progress.phase(entry,'completed',result.elapsedMs,{status:'PASS'});progress.event(entry,'END',result.elapsedMs,'PASS');progress.close();
  const text=fs.readFileSync(file,'utf8')+fs.readFileSync(path.join(dir,'CURRENT_JOB.json'),'utf8');
  assert(!text.includes('PRIVATE_SENTINEL'));assert(!text.includes('owner@'));assert(raw.join('').includes('PRIVATE_SENTINEL'));
  const events=fs.readFileSync(file,'utf8').trim().split('\n').map(line=>JSON.parse(line));assert.deepEqual(events.map(row=>row.event),['START','END']);assert.equal(events[1].status,'PASS');
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'CURRENT_JOB.json'),'utf8')).phase,'completed');
  assert.throws(()=>createJobProgress({file,out:dir,total:213,selectedTotal:1}),/NOT_FRESH/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
