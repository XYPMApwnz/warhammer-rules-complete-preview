/** CI-only deadlines and public metadata; child output never enters this API's progress. */
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {normalizeJob} from './qa-pre-ff-ci.mjs';

export const baselineSha='6156836b7841d2c4f4c429834013598b3484058e';
export const policySchema='qa-pre-ff-job-timeouts/v1';
// Fixed reviewed 6156836b PC evidence, independent of the mutable policy table.
export const reviewedTimingsSha256='608330bb13c2441d4dfa1e8894c4d815c0faab42d97da5810ab4818e3d6df0a7';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const integer=n=>Number.isSafeInteger(n)&&n>=0;
const keys=(value,expected)=>value&&typeof value==='object'&&!Array.isArray(value)&&same(Object.keys(value).sort(),[...expected].sort());
const safeId=id=>typeof id==='string'&&id.length<=240&&/^[A-Za-z0-9_./ -]+$/.test(id)&&!id.includes('..');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));

export function jobDeadlineMs(lastPcElapsedMs){
 if(!integer(lastPcElapsedMs)||!Number.isSafeInteger(lastPcElapsedMs*3))throw Error('INVALID_PC_ELAPSED');
 return Math.max(3*lastPcElapsedMs,300000);
}

export function baselineTimingsFingerprint(policy){
 // Explicit field order makes this projection independent of input object key order.
 const value={baselineSha:policy.baselineSha,jobs:policy.jobs.map(row=>({index:row.index,command:row.command,
  id:row.id,args:row.args,lastPcElapsedMs:row.lastPcElapsedMs}))};
 return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export function validateTimeoutPolicy(policy,jobs,root){
 if(!keys(policy,['schema','baselineSha','jobCount','jobs'])||policy.schema!==policySchema||policy.baselineSha!==baselineSha||
  policy.jobCount!==213||!Array.isArray(policy.jobs)||policy.jobs.length!==policy.jobCount||jobs.length!==policy.jobCount)throw Error('INVALID_TIMEOUT_POLICY');
 const canonical=jobs.map(job=>normalizeJob(job,root)),seen=new Set();
 for(const [i,row]of policy.jobs.entries()){
  if(!keys(row,['index','command','id','args','lastPcElapsedMs','timeoutMs'])||row.index!==i+1||
   !same({command:row.command,id:row.id,args:row.args},canonical[i])||row.timeoutMs!==jobDeadlineMs(row.lastPcElapsedMs))throw Error('TIMEOUT_POLICY_PLAN_MISMATCH');
  const id=JSON.stringify(canonical[i]);if(seen.has(id))throw Error('DUPLICATE_TIMEOUT_POLICY_JOB');seen.add(id);
 }
 if(baselineTimingsFingerprint(policy)!==reviewedTimingsSha256)throw Error('REVIEWED_PC_BASELINE_CHANGED');
 return policy;
}

export function selectJobPlan(jobs,filter){
 const all=jobs.map((job,index)=>({job,index}));
 if(filter===undefined)return all;
 if(typeof filter!=='string'||!filter.length)throw Error('INVALID_JOB_FILTER');
 const matches=/^[1-9][0-9]*$/.test(filter)?all.filter(row=>row.index+1===Number(filter)):all.filter(row=>row.job.id===filter);
 if(matches.length!==1)throw Error(matches.length?'AMBIGUOUS_JOB_FILTER':'UNKNOWN_JOB_FILTER');
 return matches;
}

export function atomicJobMarker(out,record){
 const target=path.join(out,'CURRENT_JOB.json'),temporary=target+'.'+process.pid+'.tmp';
 fs.writeFileSync(temporary,JSON.stringify(record)+'\n');fs.renameSync(temporary,target);
}

export function createJobProgress({file,out,total,selectedTotal}){
 const absolute=path.resolve(file);
 if(fs.existsSync(absolute))throw Error('PROGRESS_DESTINATION_NOT_FRESH');
 fs.mkdirSync(path.dirname(absolute),{recursive:true});
 const fd=fs.openSync(absolute,'wx');
 const approvedPhases=new Set(['beforeSpawn','afterSpawn','processExit','streamsClosed','cleanup','completed']);
 const base=(entry,elapsedMs)=>{
  if(!safeId(entry.job.id)||!integer(entry.index)||entry.index>=total||!integer(entry.ordinal)||entry.ordinal>=selectedTotal||!integer(elapsedMs))throw Error('INVALID_PROGRESS_METADATA');
  return {schema:'qa-job-progress/v1',index:entry.index+1,ordinal:entry.ordinal+1,total,selectedTotal,id:entry.job.id,elapsedMs,elapsedSeconds:Math.round(elapsedMs/1000)};
 };
 return {
  event(entry,event,elapsedMs,status){
   if(!['START','END'].includes(event)||event==='END'&&!['PASS','FAIL','TIMEOUT'].includes(status))throw Error('INVALID_PROGRESS_EVENT');
   fs.writeSync(fd,JSON.stringify({...base(entry,elapsedMs),event,...(event==='END'?{status}:{})})+'\n');
  },
  phase(entry,phase,elapsedMs,details={}){
   if(!approvedPhases.has(phase))throw Error('INVALID_JOB_PHASE');
   const approved={};
   for(const key of ['childPid','timeoutMs','processExitCode'])if(details[key]!==undefined){
    if(details[key]!==null&&!(key==='processExitCode'?Number.isSafeInteger(details[key]):integer(details[key])))throw Error('INVALID_PHASE_METADATA');approved[key]=details[key];
   }
   if(details.timedOut!==undefined){if(typeof details.timedOut!=='boolean')throw Error('INVALID_PHASE_METADATA');approved.timedOut=details.timedOut;}
   if(details.status!==undefined){if(!['PASS','FAIL','TIMEOUT'].includes(details.status))throw Error('INVALID_PHASE_METADATA');approved.status=details.status;}
   atomicJobMarker(out,{...base(entry,elapsedMs),phase,...approved});
  },
  close(){fs.closeSync(fd);}
 };
}

function linuxProcesses(){
 const result=new Map();
 for(const name of fs.readdirSync('/proc')){
  if(!/^[1-9][0-9]*$/.test(name))continue;
  try{
   const text=fs.readFileSync('/proc/'+name+'/stat','utf8'),fields=text.slice(text.lastIndexOf(')')+2).split(' ');
   result.set(Number(name),{pid:Number(name),state:fields[0],parent:Number(fields[1]),group:Number(fields[2]),start:fields[19]});
  }catch(error){if(!['ENOENT','ESRCH'].includes(error.code))throw Error('PROCESS_OWNERSHIP_SCAN_FAILED');}
 }
 return result;
}

/** Own a Linux session, retaining PID/start identities for detached descendants. */
function ownedProcesses(pid){
 const known=new Map();
 return ()=>{
  const processes=linuxProcesses();let changed=true;
  while(changed){
   changed=false;
   for(const process of processes.values()){
    const parent=known.get(process.parent),actualParent=processes.get(process.parent);
    if(process.group===pid||process.pid===pid||parent&&actualParent?.start===parent){
     if(known.get(process.pid)!==process.start){known.set(process.pid,process.start);changed=true;}
    }
   }
  }
  return [...processes.values()].filter(process=>process.state!=='Z'&&process.state!=='X'&&known.get(process.pid)===process.start);
 };
}

export async function runJobProcess({job,cwd,env,timeoutMs,onChunk=()=>{},onPhase=()=>{},registerCleanup=()=>()=>{},termGraceMs=1000,killGraceMs=1000}){
 if(!Number.isSafeInteger(timeoutMs)||timeoutMs<=0)throw Error('INVALID_JOB_DEADLINE');
 const linux=process.platform==='linux',start=Date.now();
 onPhase('beforeSpawn',{timeoutMs});
 const supervisor=fileURLToPath(new URL('./qa-job-supervisor.py',import.meta.url));
 const child=spawn(linux?(env?.QA_PYTHON||env?.PYTHON||'python3'):job.command,
  linux?['-I','-B',supervisor]:job.args,{cwd,env,detached:linux,stdio:linux?['ignore','pipe','pipe','pipe','pipe']:['ignore','pipe','pipe']});
 const sample=linux&&child.pid?ownedProcesses(child.pid):null;
 let scanError=false,exitCode=null,signal=null,spawnError=null,timedOut=false,closed=false,settled=false,teardownPromise;
 let leafPid=null,leafExited=false,subreaperComplete=false,protocolInvalid=false,supervisorExitCode=null,reapedChildren=0;
 const observe=()=>{try{return sample?sample():[];}catch{scanError=true;return [];}};
 // The live subreaper retains orphan ownership, so no continuous /proc polling is needed.
 if(sample)observe();
 onPhase('afterSpawn',{...(child.pid?{childPid:child.pid}:{}),timeoutMs});
 if(linux){
  let buffer='';
  const invalid=()=>{protocolInvalid=true;spawnError='SUPERVISOR_PROTOCOL_FAILURE';child.kill('SIGTERM');};
  child.stdio[3]?.on('data',chunk=>{
   buffer+=chunk.toString('utf8');if(buffer.length>16384){buffer='';invalid();return;}
   while(buffer.includes('\n')){
    const end=buffer.indexOf('\n'),line=buffer.slice(0,end);buffer=buffer.slice(end+1);
    try{
     const message=JSON.parse(line);
     if(message.event==='leafSpawn'&&keys(message,['event','pid'])&&Number.isSafeInteger(message.pid)&&message.pid>0&&!leafPid){leafPid=message.pid;}
     else if(message.event==='leafExit'&&keys(message,['event','pid','exitCode','signal'])&&message.pid===leafPid&&!leafExited&&
      (message.exitCode===null||Number.isInteger(message.exitCode)&&message.exitCode>=0&&message.exitCode<=255)&&
      (message.signal===null||typeof message.signal==='string'&&/^(?:SIG[A-Z0-9]+|SIGNAL_[0-9]+)$/.test(message.signal))){
      leafExited=true;exitCode=message.exitCode;signal=message.signal;
      onPhase('processExit',{childPid:leafPid,processExitCode:exitCode,timedOut});
     }else if(message.event==='complete'&&keys(message,['event','reaped'])&&leafExited&&Number.isSafeInteger(message.reaped)&&message.reaped>=1){subreaperComplete=true;reapedChildren=message.reaped;}
     else if(message.event==='supervisorError'&&keys(message,['event','code'])&&
      ['SUBREAPER_UNAVAILABLE','SUPERVISOR_CONFIG_INVALID','SUPERVISOR_INTERNAL_FAILURE'].includes(message.code)){protocolInvalid=true;spawnError=message.code;}
     else invalid();
    }catch{invalid();}
   }
  });
  child.stdio[3]?.on('error',()=>{protocolInvalid=true;spawnError='SUPERVISOR_PROTOCOL_FAILURE';});
  child.stdio[4]?.on('error',()=>{protocolInvalid=true;spawnError='SUPERVISOR_CONFIG_FAILURE';});
  const originalEnvironment=Object.fromEntries(Object.entries(env||process.env).filter(([,value])=>value!==undefined).map(([key,value])=>[key,String(value)]));
  child.stdio[4]?.end(JSON.stringify({argv:[job.command,...job.args],env:originalEnvironment,termGraceMs}));
 }
 const kill=(pid,signal)=>{try{process.kill(pid,signal);}catch(error){if(error.code!=='ESRCH')scanError=true;}};
 const terminate=()=>teardownPromise??=(async()=>{
  if(!linux){
   if(child.exitCode!==null||child.signalCode!==null)return {method:'direct-process',confirmed:true};
   if(child.exitCode===null&&child.signalCode===null)child.kill('SIGTERM');
   await pause(termGraceMs);
   if(child.exitCode===null&&child.signalCode===null)child.kill('SIGKILL');
   return {method:'direct-process',confirmed:child.exitCode!==null||child.signalCode!==null};
  }
  // Never kill the subreaper first: it must adopt and reap even instantaneous setsid orphans.
  if(!closed&&child.pid)kill(child.pid,'SIGTERM');
  let until=Date.now()+termGraceMs+killGraceMs+500;
  while(Date.now()<until&&!closed)await pause(20);
  if(!closed){
   // Last-resort cleanup; without the ECHILD acknowledgement the queue must stop.
   for(const process of observe())if(process.pid!==child.pid)kill(process.pid,'SIGKILL');
   await pause(50);if(child.pid)kill(child.pid,'SIGKILL');
   until=Date.now()+killGraceMs;
   while(Date.now()<until&&!closed)await pause(20);
  }
  return {method:'linux-subreaper',confirmed:subreaperComplete&&!protocolInvalid&&closed&&!scanError&&!observe().length,reapedChildren};
 })();
 const unregister=registerCleanup(async()=>{await terminate();child.stdout?.destroy();child.stderr?.destroy();});
 for(const stream of [child.stdout,child.stderr])stream?.on('data',onChunk);
 return await new Promise(resolve=>{
  let timer;
  const finish=async()=>{
   if(settled)return;settled=true;
   const teardown=await terminate();
   clearTimeout(timer);unregister();
   child.stdout?.destroy();child.stderr?.destroy();
   if(!closed)await Promise.race([new Promise(done=>child.once('close',done)),pause(100)]);
   child.removeAllListeners('exit');child.removeAllListeners('close');
   if(linux){child.stdio[3]?.destroy();child.stdio[4]?.destroy();if(!closed)child.unref();}
   resolve({exitCode:timedOut?124:exitCode,signal,originalExitCode:exitCode,timedOut,teardown,...(linux?{supervisorExitCode}:{}),
    ...(timedOut?{error:'TIMEOUT'}:spawnError?{error:spawnError}:{}),elapsedMs:Date.now()-start});
  };
  child.on('error',error=>{spawnError=error.message;});
  child.on('exit',(code,terminated)=>{supervisorExitCode=code;if(!linux||!leafExited){exitCode=code;signal=terminated;onPhase('processExit',{childPid:child.pid,processExitCode:code,timedOut});}});
  child.on('close',(code,terminated)=>{if(!linux||!leafExited){exitCode=code;signal=terminated;}closed=true;onPhase('streamsClosed',{...((leafPid||child.pid)?{childPid:leafPid||child.pid}:{}),processExitCode:exitCode,timedOut});void finish();});
  timer=setTimeout(()=>{
   if(closed)return;
   timedOut=true;
   // Deadline applies until streams close, including an exited leader with inherited pipes.
   void finish();
  },timeoutMs);
 });
}
