/** Trusted, bounded CI telemetry. Never relay child stdout or arbitrary error text. */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {normalizeJob} from './qa-pre-ff-ci.mjs';

const integer=n=>Number.isSafeInteger(n)&&n>=0;
const phases=new Set(['beforeSpawn','afterSpawn','processExit','streamsClosed','cleanup','completed']);
export function readJson(file,limit=4*1024*1024){
 try{const s=fs.lstatSync(file);if(!s.isFile()||s.isSymbolicLink()||s.size>limit)return null;return JSON.parse(fs.readFileSync(file,'utf8'));}catch{return null;}
}
export function canonicalPlan(source){
 const result=spawnSync(process.execPath,['tools/qa-queue.mjs','pre-ff','--list'],{cwd:source,encoding:'utf8',maxBuffer:8*1024*1024});
 if(result.status!==0)throw Error('PLAN_UNAVAILABLE');
 return JSON.parse(result.stdout).map(job=>normalizeJob(job,source));
}
export function selection(plan,filter){
 if(filter===undefined||filter==='')return plan.map((_,i)=>i+1);
 if(!/^[1-9][0-9]*$/.test(filter)||Number(filter)>plan.length)throw Error('INVALID_DIAGNOSTIC_JOB');
 return [Number(filter)];
}
export function publicEvent(row,plan,selected){
 const keys=['schema','index','ordinal','total','selectedTotal','id','elapsedMs','elapsedSeconds','event',...(row?.event==='END'?['status']:[])].sort();
 if(!row||JSON.stringify(Object.keys(row).sort())!==JSON.stringify(keys)||row.schema!=='qa-job-progress/v1'||
  row.total!==plan.length||row.selectedTotal!==selected.length||!integer(row.ordinal)||row.ordinal<1||
  row.index!==selected[row.ordinal-1]||row.id!==plan[row.index-1]?.id||!integer(row.elapsedMs)||
  row.elapsedSeconds!==Math.round(row.elapsedMs/1000)||!['START','END'].includes(row.event)||
  row.event==='END'&&!['PASS','FAIL','TIMEOUT'].includes(row.status))throw Error('INVALID_PROGRESS_EVENT');
 return `${row.event} ${plan[row.index-1].id} ${(row.elapsedMs/1000).toFixed(3)}${row.event==='END'?' '+row.status:''}`;
}
export function safeCurrentJob(row,plan,selected){
 if(!row||row.schema!=='qa-job-progress/v1'||row.total!==plan.length||row.selectedTotal!==selected.length||
  !integer(row.ordinal)||row.ordinal<1||row.index!==selected[row.ordinal-1]||row.id!==plan[row.index-1]?.id||!integer(row.elapsedMs)||!phases.has(row.phase))return null;
 return {index:row.index,id:plan[row.index-1].id,phase:row.phase,elapsedMs:row.elapsedMs,
  ...(integer(row.timeoutMs)?{timeoutMs:row.timeoutMs}:{}),...(typeof row.timedOut==='boolean'?{timedOut:row.timedOut}:{}),
  ...(row.processExitCode===null||Number.isSafeInteger(row.processExitCode)?{processExitCode:row.processExitCode}:{}),
  ...(['PASS','FAIL','TIMEOUT'].includes(row.status)?{status:row.status}:{})};
}
export function browserLaunchDetails(text){
 const causes=new Set(['UNIX_SOCKET_PATH_TOO_LONG','PROFILE_SINGLETON_FAILURE','EXECUTABLE_UNAVAILABLE','SANDBOX_UNAVAILABLE','SHARED_LIBRARY_UNAVAILABLE','LAUNCH_TIMEOUT','LAUNCH_FAILED']);
 for(const line of String(text).split(/\r?\n/).reverse()){
  const offset=line.indexOf('QA_BROWSER_LAUNCH_DIAGNOSTIC ');
  if(offset<0||line.length>2048)continue;
  try{const row=JSON.parse(line.slice(offset+'QA_BROWSER_LAUNCH_DIAGNOSTIC '.length));
   if(row.schema!=='browser-launch-diagnostic/v1'||row.phase!=='browser-launch'||row.status!=='FAIL'||
    !['Error','TimeoutError','TypeError','RangeError','ReferenceError','SyntaxError'].includes(row.errorClass)||
    !causes.has(row.cause)||!integer(row.tempPathBytes)||row.tempPathBytes>1024*1024)continue;
   return {errorClass:row.errorClass,cause:row.cause,tempPathBytes:row.tempPathBytes};
  }catch{}
 }
 return null;
}
export function browserPhaseDetails({raw,index,id}){
 if(id!=='v2/lazy-glossary-browser-qa.mjs')return null;
 const base=path.join(raw,String(index).padStart(2,'0')+'-lazy-glossary-browser-qa.mjs-evidence');
 let directories;try{const s=fs.lstatSync(base);if(!s.isDirectory()||s.isSymbolicLink())return null;
  directories=[base,...fs.readdirSync(base,{withFileTypes:true}).filter(e=>e.isDirectory()&&!e.isSymbolicLink()).map(e=>path.join(base,e.name))];
 }catch{return null;}
 const allowed=new Set(['browser-launch','context-open','page-open','book-open','frame-sync','contents-title','contents-before','contents-navigate','contents-settle','contents-diagnostics','contents-geometry','screenshot','boundary-sweep','snapshot','select-card','dialog-open','dialog-links','dialog-close','failure-state','context-close','browser-close','server-close']);
 const books=new Set(['adeptus-mechanicus','blood-angels','chaos-space-marines','dark-angels','death-guard','emperors-children','space-marines','tau-empire','tyranids']);
 const entry=directories.map(dir=>({dir,body:readJson(path.join(dir,'PHASES.json'))})).find(e=>e.body?.schema==='browser-phases/v1');
 if(!entry||!Array.isArray(entry.body.observations))return null;
 const history=[];
 for(const row of entry.body.observations.slice(-8)){
  if(!allowed.has(row.phase)||!['START','PASS','FAIL','TIMEOUT'].includes(row.status)||!integer(row.elapsedMs))continue;
  const safe={phase:row.phase,status:row.status,elapsedMs:row.elapsedMs};
  if(books.has(row.book))safe.book=row.book;
  if([390,1440].includes(row.width))safe.width=row.width;
  if(integer(row.ordinal)&&row.ordinal<=10000)safe.ordinal=row.ordinal;
  history.push(safe);
 }
 const result={history},state=readJson(path.join(entry.dir,'BROWSER_STATE.json'));
 if(Array.isArray(entry.body.sweeps))result.sweeps=entry.body.sweeps.slice(-36).filter(row=>row.phase==='boundary-sweep'&&books.has(row.book)&&[390,1440].includes(row.width)&&['PASS','FAIL','TIMEOUT'].includes(row.status)&&integer(row.elapsedMs)).map(row=>({book:row.book,width:row.width,status:row.status,elapsedMs:row.elapsedMs}));
 if(state?.schema==='browser-state/v1'){
  const safe={};
  for(const key of ['pageClosed','rendererResponsive','hasFocus'])if(typeof state[key]==='boolean')safe[key]=state[key];
  if(['loading','interactive','complete','unavailable','unknown'].includes(state.readyState))safe.readyState=state.readyState;
  if(['visible','hidden','prerender','unavailable','unknown'].includes(state.visibilityState))safe.visibilityState=state.visibilityState;
  if(['boundary-before','boundary-ready','frame-sync','boundary-after','boundary-complete'].includes(state.boundaryPhase))safe.boundaryPhase=state.boundaryPhase;
  if(integer(state.boundaryOrdinal)&&state.boundaryOrdinal<=10000)safe.boundaryOrdinal=state.boundaryOrdinal;
  result.state=safe;
 }
 return result;
}
export async function followProgress({source,events,job}){
 const plan=canonicalPlan(source),selected=selection(plan,job);
 let stopping=false,seen=0,open=null,ordinal=1;
 process.once('SIGTERM',()=>{stopping=true;});process.once('SIGINT',()=>{stopping=true;});
 fs.writeFileSync(events+'.ready','ready\n',{flag:'wx'});
 const flush=()=>{
  let text='';try{const s=fs.lstatSync(events);if(!s.isFile()||s.isSymbolicLink()||s.size>1024*1024)throw Error('INVALID_PROGRESS_FILE');text=fs.readFileSync(events,'utf8');}catch(e){if(e.code==='ENOENT')return;throw e;}
  const lines=text.split('\n');lines.pop();
  if(lines.length<seen||lines.length>2*selected.length)throw Error('INVALID_PROGRESS_LENGTH');
  while(seen<lines.length){const row=JSON.parse(lines[seen++]);const line=publicEvent(row,plan,selected);
   if(row.ordinal!==ordinal||row.event==='START'&&open!==null||row.event==='END'&&open!==row.index)throw Error('INVALID_PROGRESS_ORDER');
   if(row.event==='START')open=row.index;else{open=null;ordinal++;}
   console.log(line);
  }
 };
 do{flush();if(!stopping)await new Promise(r=>setTimeout(r,250));}while(!stopping);
 flush();
}
const valueType=x=>x===null?'null':Array.isArray(x)?'array':typeof x;
export function jsonDifferencePaths(expected,actual,limit=12){
 const result=[];
 const visit=(a,b,p)=>{if(result.length>=limit||a===b)return;
  if(valueType(a)!==valueType(b)||typeof a!=='object'||a===null){result.push({pointer:p||'/',expectedType:valueType(a),rebuiltType:valueType(b)});return;}
  for(const key of new Set([...Object.keys(a),...Object.keys(b)])){
   // Keys must already belong to the accepted file. Never expose a newly injected key.
   const safe=Object.hasOwn(a,key)&&/^[A-Za-z0-9_-]{1,80}$/.test(key)?key:'<redacted-key>';
   visit(a[key],b[key],p+'/'+safe);if(result.length>=limit)break;
  }
 };visit(expected,actual,'');return result;
}
/** Counts and hashes only: sufficient to diagnose parser newline drift without HTML. */
export function jsonDifferenceSummary(expected,actual){
 const counts={},ownedHtml=[];
 const fixedKeys=new Set(['ownedHtml','contentHash','corpusFingerprint','corpusFileSha256','content','body','title','text','sourceOrder','tail','references','label']);
 const sha=value=>createHash('sha256').update(value).digest('hex');
 const breaks=value=>({cr:(value.match(/\r/g)||[]).length,lf:(value.match(/\n/g)||[]).length,crlf:(value.match(/\r\n/g)||[]).length});
 const visit=(a,b,p,last)=>{
  if(last==='ownedHtml'&&typeof a==='string'&&typeof b==='string')ownedHtml.push({pointer:p,changed:a!==b,expectedChars:a.length,rebuiltChars:b.length,expectedBreaks:breaks(a),rebuiltBreaks:breaks(b),expectedSha256:sha(a),rebuiltSha256:sha(b),crlfNormalizedEqual:a.replace(/\r\n/g,'\n')===b.replace(/\r\n/g,'\n')});
  if(a===b)return;
  if(valueType(a)!==valueType(b)||typeof a!=='object'||a===null){const key=(fixedKeys.has(last)?last:'<other-key>')+':'+valueType(a)+'->'+valueType(b);counts[key]=(counts[key]||0)+1;return;}
  for(const key of new Set([...Object.keys(a),...Object.keys(b)])){
   const safe=Object.hasOwn(a,key)&&/^[A-Za-z0-9_-]{1,80}$/.test(key)?key:'<redacted-key>';
   visit(a[key],b[key],p+'/'+safe,key);
  }
 };
 visit(expected,actual,'','');return {counts,ownedHtml};
}
export function generatedFailureDetails({source,raw,index}){
 const planResult=spawnSync(process.execPath,['books/shared/tools/check-generated-rebuild.mjs','--list'],{cwd:source,encoding:'utf8',maxBuffer:8*1024*1024});
 if(planResult.status!==0)return null;
 const plan=JSON.parse(planResult.stdout),allowed=new Map(plan.steps.map(s=>[s.producer,s]));
 const base=path.join(raw,String(index).padStart(2,'0')+'-check-generated-rebuild.mjs-evidence');
 // The queue sets QA_EVIDENCE_DIR; the owned generated evidence directory is its direct child.
 const candidates=[base];
 try{const stat=fs.lstatSync(base);if(!stat.isDirectory()||stat.isSymbolicLink())return null;
  for(const entry of fs.readdirSync(base,{withFileTypes:true}))if(entry.isDirectory()&&!entry.isSymbolicLink())candidates.push(path.join(base,entry.name));
 }catch{return null;}
 const report=candidates.map(p=>({base:p,body:readJson(path.join(p,'RESULTS.json'))})).find(v=>v.body?.schema==='generated-rebuild-check/v1');
 if(!report||!Array.isArray(report.body.steps))return null;
 const failed=report.body.steps.find(s=>s.status!=='PASS');if(!failed)return null;
 const step=allowed.get(failed.producer);if(!step)return null;
 const differences=[];
 for(const row of (failed.differences||[]).slice(0,20)){
  if(!step.outputs.includes(row.file))continue;
  const projected={file:row.file};
  for(const key of ['expectedSha256','rebuiltSha256'])if(/^[a-f0-9]{64}$/.test(row[key]))projected[key]=row[key];
  for(const key of ['expectedBytes','rebuiltBytes','firstByte'])if(integer(row[key]))projected[key]=row[key];
  // Comparison values and serialized source HTML never leave the runner.
  const prefix=path.join(report.base,'differences',row.file),a=readJson(path.join(source,row.file),128*1024*1024),b=readJson(prefix+'.rebuilt',128*1024*1024);
  if(a&&b){projected.jsonDifferences=jsonDifferencePaths(a,b);projected.jsonDifferenceSummary=jsonDifferenceSummary(a,b);}
  differences.push(projected);
 }
 return {producer:step.producer,status:['STALE','BUILD_FAILED'].includes(failed.status)?failed.status:'BLOCKED',differences};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const options={};for(const arg of process.argv.slice(2)){const m=/^--(source|events|job)=(.*)$/.exec(arg);if(!m||Object.hasOwn(options,m[1]))throw Error('INVALID_OPTION');options[m[1]]=m[2];}
  if(!options.source||!options.events)throw Error('MISSING_OPTION');await followProgress(options);
 }catch{console.error('CI progress metadata rejected; private output was not published.');process.exitCode=1;}
}
