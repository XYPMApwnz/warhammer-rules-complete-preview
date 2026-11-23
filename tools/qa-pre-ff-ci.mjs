/** Public CI evidence is a strict projection, never a copy of raw QA evidence. */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {selection,readJson,safeCurrentJob,generatedFailureDetails,browserLaunchDetails,browserPhaseDetails} from './qa-ci-progress.mjs';

const integer=value=>Number.isSafeInteger(value)&&value>=0;
const safeJob=value=>typeof value==='string'&&value.length<=240&&/^[A-Za-z0-9_./ -]+$/.test(value)&&!value.includes('..');
const safeCodeFile=value=>typeof value==='string'&&value.length<=240&&/^(?:tests|tools|v2|books|glossary|mfm)\/[A-Za-z0-9_./-]+\.(?:mjs|cjs|js|py)$/.test(value)&&!value.split('/').includes('..');
const same=(left,right)=>JSON.stringify(left)===JSON.stringify(right);
const diagnosticLimit=200,logTailLimit=64*1024;
const errorClasses=new Set(['AssertionError','TypeError','ReferenceError','SyntaxError','RangeError','TimeoutError','Error',
 'Exception','ValueError','KeyError','RuntimeError','ImportError','ModuleNotFoundError','FileNotFoundError','PermissionError','OSError',
 'AttributeError','IndexError','MemoryError','UnicodeDecodeError','UnicodeEncodeError','UnicodeTranslateError','LookupError','NotImplementedError',
 'OverflowError','ZeroDivisionError','EOFError','StopIteration','RecursionError','ConnectionError','BrokenPipeError','ConnectionAbortedError',
 'ConnectionRefusedError','ConnectionResetError','IsADirectoryError','NotADirectoryError','FileExistsError','InterruptedError','BlockingIOError',
 'ProcessLookupError','ChildProcessError','SystemExit','KeyboardInterrupt']);
const errorHeader=new RegExp('^('+[...errorClasses].join('|')+')(?: \\[([A-Z0-9_]+)\\])?:');
const systemCodes=new Set(['ENOENT','EACCES','EPERM','ENOSPC','ENOMEM','EMFILE','ENFILE','ECONNREFUSED','ECONNRESET','ETIMEDOUT']);
const moduleCodes=new Set(['ERR_MODULE_NOT_FOUND','MODULE_NOT_FOUND']);
const signals=new Set(['SIGKILL','SIGTERM','SIGINT','SIGABRT','SIGSEGV','SIGBUS']);
const reportCodes=new Set(['PLAN_UNAVAILABLE','CHECKOUT_SHA_UNAVAILABLE','TRACKED_SOURCES_UNAVAILABLE','INVALID_RESULT_HEADER','INVALID_RESULT_ROWS','JOB_PLAN_MISMATCH','INVALID_JOB_RESULT','INVALID_EXIT_CODE','INVALID_JOB_STATUS','REPORT_DESTINATION_NOT_FRESH','REPORT_INSIDE_SOURCE','INVALID_REPORT_OPTION','INVALID_REPORT_COMMAND','EMAIL_IN_PUBLIC_REPORT']);
function stackLocation(text,root,sourceFiles){
 // Locations alone are useful; never publish a stack function name or line body.
 const traceback=text.lastIndexOf('Traceback (most recent call last):');
 const locate=(match,python)=>{
  if(!match)return null;
  let absolute;
  try{absolute=match[1].startsWith('file:')?fileURLToPath(match[1]):path.resolve(root,match[1]);}catch{return null;}
  const relative=path.relative(path.resolve(root),absolute).replaceAll(path.sep,'/');
  if(!safeCodeFile(relative)||!sourceFiles.has(relative))return null;
  const row=Number(match[2]),column=python?null:Number(match[3]);
  if(Number.isSafeInteger(row)&&(python||Number.isSafeInteger(column)))return {file:relative,line:row,...(python?{}:{column})};
  return null;
 };
 let pythonLocation=null;
 for(const line of (traceback<0?text:text.slice(traceback)).split(/\r?\n/)){
  const location=locate(/^\s*File "([^"\r\n]+)", line ([1-9][0-9]*)(?:, in [^\r\n]*)?$/.exec(line),true);
  // Python prints the innermost origin last, unlike JavaScript stacks.
  if(location)pythonLocation=location;
 }
 if(pythonLocation)return pythonLocation;
 // A child traceback may contain only external frames; retain its trusted JS
 // caller even when that parent stack occurred before the child stderr text.
 for(const line of text.split(/\r?\n/)){
  if(!/^\s+at\s/.test(line))continue;
  const location=locate(/((?:file:\/\/\/|[A-Za-z]:[\\/]|\/)[^()\r\n]*?):([1-9][0-9]*):([1-9][0-9]*)\)?\s*$/.exec(line),false);
  if(location)return location;
 }
 return null;
}
export function collectTrackedCodeFiles(root){
 // Membership comes from the committed source tree, never a log, raw result,
 // untracked file, or arbitrary exception field. Contents are not read.
 const result=spawnSync('git',['ls-tree','-r','--name-only','-z','HEAD'],{cwd:path.resolve(root),encoding:'utf8',maxBuffer:16*1024*1024});
 if(result.status!==0)throw Error('TRACKED_SOURCES_UNAVAILABLE');
 return result.stdout.split('\0').filter(safeCodeFile);
}
export function safeFailureDiagnostic({text='',error='',signal=null,exitCode=null,root,sourceFiles=[]}){
 // Classification sees private text, but every public message is a fixed template.
 // Do not return an original first line, assertion value, source quote or error name.
 const sourceText=String(text),bounded=sourceText.length<=logTailLimit?sourceText:sourceText.slice(0,4096)+'\n'+sourceText.slice(-(logTailLimit-4096));
 const privateText=bounded+'\n'+String(error).slice(0,logTailLimit);
 const lines=privateText.split(/\r?\n/),headers=[];
 for(const line of lines){
  const match=errorHeader.exec(line.trimStart());
  if(match&&errorClasses.has(match[1]))headers.push({errorClass:match[1],code:match[2]||null,line});
 }
 const header=headers.findLast(row=>row.errorClass!=='Error')||headers.at(-1);
 let errorClass=header?.errorClass||'UnknownError',cause='REDACTED',firstLine=errorClass+': failure details redacted.';
 const code=header?.code||(/^spawn [^\r\n]*\b(ENOENT|EACCES|EPERM|ENOSPC|ENOMEM|EMFILE|ENFILE|ECONNREFUSED|ECONNRESET|ETIMEDOUT)\b/.exec(String(error))?.[1])||(/\b(?:spawn|Error:)\s+(ENOENT|EACCES|EPERM|ENOSPC|ENOMEM|EMFILE|ENFILE|ECONNREFUSED|ECONNRESET|ETIMEDOUT)\b/.exec(privateText)?.[1]);
 if(signals.has(signal)){errorClass='ProcessError';cause='PROCESS_SIGNAL';firstLine='ProcessError: process terminated by '+signal+'.';}
 else if(moduleCodes.has(code)){cause='MODULE_UNAVAILABLE';firstLine=errorClass+': module dependency unavailable ('+code+').';}
 else if(errorClass==='ModuleNotFoundError'||errorClass==='ImportError'){cause='MODULE_UNAVAILABLE';firstLine=errorClass+': module dependency unavailable; private module identifier redacted.';}
 else if(systemCodes.has(code)){errorClass='SystemError';cause='SYSTEM_'+code;firstLine='SystemError: operating-system failure ('+code+').';}
 else if(errorClass==='AssertionError'){
  const standard=header.line.replace(/^\s*AssertionError(?: \[[A-Z0-9_]+\])?:\s*/,'').trim();
  if(standard==='Expected values to be strictly deep-equal:'){cause='ASSERTION_DEEP_EQUAL';firstLine='AssertionError: expected values to be strictly deep-equal; private comparison values redacted.';}
  else if(standard==='Expected values to be strictly equal:'){cause='ASSERTION_EQUAL';firstLine='AssertionError: expected values to be strictly equal; private comparison values redacted.';}
  else{cause='ASSERTION_FAILED';firstLine='AssertionError: assertion failed; private comparison values redacted.';}
 }
 else if(errorClass==='TimeoutError'||/^\s*(?:[A-Za-z]+\.)?(?:waitFor|waitForFunction|waitForSelector|waitForURL|click|goto)\b[^\n]*\bTimeout\b/m.test(privateText)){
  errorClass='TimeoutError';cause='TIMEOUT';firstLine='TimeoutError: operation timed out; private selector and message redacted.';
 }else if(errorClass!=='UnknownError'){cause='ERROR_MESSAGE_REDACTED';firstLine=errorClass+': error message redacted.';}
 else if(Number.isInteger(exitCode)){cause='PROCESS_EXIT';firstLine='UnknownError: process exited with code '+exitCode+'; private details redacted.';}
 // A private message cannot invent a new "source" filename for publication.
 // Membership is the trusted committed code inventory plus canonical entries.
 const location=stackLocation(privateText,root,new Set(sourceFiles.filter(safeCodeFile)));
 return {errorClass,cause,firstLine:firstLine.slice(0,diagnosticLimit),messageRedacted:true,...(location?{location}:{})};
}
function readFailureLog(raw,index,id){
 // Never follow row.log, a symlink, or an arbitrary runner path supplied by a test.
 const name=String(index+1).padStart(2,'0')+'-'+path.basename(id).replace(/[^\w.-]/g,'_')+'.log';
 const file=path.join(path.resolve(raw),name);
 let fd;
 try{
  const stat=fs.lstatSync(file);if(!stat.isFile()||stat.isSymbolicLink())return '';
  fd=fs.openSync(file,'r');
  if(stat.size<=logTailLimit){const buffer=Buffer.alloc(stat.size);fs.readSync(fd,buffer,0,buffer.length,0);return buffer.toString('utf8');}
  const head=Buffer.alloc(4096),tail=Buffer.alloc(logTailLimit-head.length);
  fs.readSync(fd,head,0,head.length,0);fs.readSync(fd,tail,0,tail.length,stat.size-tail.length);
  return head.toString('utf8')+'\n'+tail.toString('utf8');
 }catch{return '';}
 finally{if(fd!==undefined)fs.closeSync(fd);}
}
function commandKind(job){
 if(job.id==='git diff --check'&&job.command==='git')return 'git';
 if(job.command===process.execPath)return 'node';
 throw Error('INVALID_COMMAND_KIND');
}
export function normalizeJob(job,root){
 if(!safeJob(job.id)||!Array.isArray(job.args)||job.args.some(a=>typeof a!=='string'))throw Error('INVALID_JOB');
 const args=[...job.args],source=path.resolve(root);
 if(job.id==='git diff --check'){
  if(!same(args,['diff','--check']))throw Error('INVALID_GIT_ARGS');
 }else if(args[0]!==job.id)throw Error('INVALID_NODE_ENTRY');
 if(job.id==='tests/source-book-clone-qa.mjs'){
  if(args.length!==2||args[0]!==job.id||args[1]!=='--root='+source)throw Error('INVALID_CLONE_ARGS');
  args[1]='--root=<REPO>';
 }else if(['tools/pages-runtime-package.mjs','tools/pages-runtime-package-qa.mjs'].includes(job.id)){
  const producer=job.id==='tools/pages-runtime-package.mjs';
  const flags=producer?['--source','--out']:['--source','--published','--work'];
  if(args.length!==1+flags.length*2||args[0]!==job.id)throw Error('INVALID_PACKAGE_ARGS');
  let runtimeParent;
  for(const [i,flag]of flags.entries()){
   const position=i*2+1,value=args[position+1];
   if(args[position]!==flag)throw Error('INVALID_PACKAGE_FLAGS');
   if(flag==='--source'){
    if(path.resolve(value)!==source)throw Error('INVALID_PACKAGE_SOURCE');
    args[position+1]='<REPO>';
   }else{
    const leaf=flag==='--work'?'packaging':'runtime',absolute=path.resolve(value);
    if(path.basename(absolute)!==leaf)throw Error('INVALID_PACKAGE_WORK');
    const parent=path.dirname(absolute);
    if(runtimeParent&&parent!==runtimeParent)throw Error('INVALID_PACKAGE_WORK_ROOT');
    runtimeParent=parent;args[position+1]='<QA_WORK>/'+leaf;
   }
  }
 }else if(job.id!=='git diff --check'&&args.slice(1).some(arg=>!/^--[A-Za-z][A-Za-z0-9-]*(?:=[A-Za-z0-9_./-]+)?$/.test(arg)))throw Error('UNSAFE_PUBLIC_ARG');
 const placeholders=new Set(['<REPO>','--root=<REPO>','<QA_WORK>/runtime','<QA_WORK>/packaging']);
 if(args.some(arg=>arg.length>512||!placeholders.has(arg)&&!/^[A-Za-z0-9_./= -]+$/.test(arg)))throw Error('UNSAFE_PUBLIC_ARG');
 return {command:commandKind(job),id:job.id,args};
}
export function projectResults({plan,raw,root,sha,outcome,platform=process.platform,failureLogs=[],knownSourceFiles=[]}){
 if(!/^[0-9a-f]{40}$/.test(sha))throw Error('INVALID_SHA');
 if(!['linux','win32','darwin'].includes(platform))throw Error('INVALID_PLATFORM');
 if(!['success','failure','cancelled','skipped',''].includes(outcome))throw Error('INVALID_OUTCOME');
 const canonical=plan.map(job=>normalizeJob(job,root));
 if(!Array.isArray(knownSourceFiles)||knownSourceFiles.some(file=>typeof file!=='string'))throw Error('INVALID_KNOWN_SOURCE_FILES');
 const sourceFiles=[...canonical.map(job=>job.id),...knownSourceFiles.filter(safeCodeFile)];
 const rows=raw?.results??[];
 const problems=[];
 if(!raw)problems.push('RESULTS_UNAVAILABLE');
 else if(raw.mode!=='pre-ff'||path.resolve(raw.root)!==path.resolve(root)||!integer(raw.elapsedMs))problems.push('INVALID_RESULT_HEADER');
 if(!Array.isArray(rows)||rows.length>canonical.length)throw Error('INVALID_RESULT_ROWS');
 const jobs=rows.map((row,index)=>{
  if(!same(normalizeJob(row,root),canonical[index]))throw Error('JOB_PLAN_MISMATCH');
  if(!['PASS','FAIL'].includes(row.status)||!integer(row.elapsedMs))throw Error('INVALID_JOB_RESULT');
  if(row.exitCode!==null&&!Number.isInteger(row.exitCode))throw Error('INVALID_EXIT_CODE');
  if((row.exitCode===0)!==(row.status==='PASS'))throw Error('INVALID_JOB_STATUS');
  return {index:index+1,...canonical[index],status:row.status,exitCode:row.exitCode,elapsedMs:row.elapsedMs,
   ...(row.status==='FAIL'?{diagnostic:safeFailureDiagnostic({text:failureLogs[index]||'',error:row.error,signal:row.signal,exitCode:row.exitCode,root,sourceFiles})}:{})};
 });
 if(jobs.length!==canonical.length)problems.push('INCOMPLETE_QUEUE');
 if(outcome!=='success')problems.push('QUEUE_STEP_NOT_SUCCESSFUL');
 const passed=jobs.filter(job=>job.status==='PASS').length,failed=jobs.filter(job=>job.status==='FAIL');
 const result={schema:'pre-ff-public-report/v1',sha,platform,status:problems.length===0&&failed.length===0?'PASS':'FAIL',
  total:canonical.length,completed:jobs.length,passed,failed:failed.length,missing:canonical.length-jobs.length,
  elapsedMs:integer(raw?.elapsedMs)?raw.elapsedMs:0,problems,jobs};
 return {plan:canonical,result};
}
export function markdownReport(result){
 const failed=result.jobs.filter(job=>job.status==='FAIL');
 return '# Pre-FF verification\n\n'+
  `SHA: \`${result.sha}\`\n\n`+
  `Result: **${result.status}**; platform: ${result.platform}.\n\n`+
  `Jobs: ${result.total}; completed: ${result.completed}; PASS: ${result.passed}; FAIL: ${result.failed}; missing: ${result.missing}.\n\n`+
  `Elapsed: ${(result.elapsedMs/60000).toFixed(2)} minutes (${result.elapsedMs} ms).\n\n`+
  (result.schema==='pre-ff-diagnostic-report/v1'?`Scope: single-job diagnosis, not a full ${result.fullPlanTotal}-job verification.\n\n`:'')+
  '## Failed jobs\n\n'+(failed.length?failed.map(job=>`- ${job.index}. \`${job.id}\` ${job.args.slice(1).map(a=>'`'+a+'`').join(' ')}\n  ${job.diagnostic.firstLine}${job.diagnostic.location?' (`'+job.diagnostic.location.file+':'+job.diagnostic.location.line+(Number.isSafeInteger(job.diagnostic.location.column)?':'+job.diagnostic.location.column:'')+'`)':''}`).join('\n'):'None.')+'\n\n'+
  'Report conditions: '+(result.problems.join(', ')||'none')+'.\n\n'+
  (result.currentJob?`Last recorded job: ${result.currentJob.index}, \`${result.currentJob.id}\`; phase: ${result.currentJob.phase}.\n\n`:'')+
  'Privacy: raw logs, captures, DOM, traces, browser profiles, source text and arbitrary error messages are not published.\n';
}
function run(args,cwd){const r=spawnSync(process.execPath,args,{cwd,encoding:'utf8',maxBuffer:16*1024*1024});if(r.status!==0)throw Error('PLAN_UNAVAILABLE');return r.stdout;}
export function exportReport({source,raw,out,summary,outcome,job}){
 const root=path.resolve(source),destination=path.resolve(out);
 if(fs.existsSync(destination))throw Error('REPORT_DESTINATION_NOT_FRESH');
 if(destination===root||destination.startsWith(root+path.sep))throw Error('REPORT_INSIDE_SOURCE');
 const git=spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'});
 if(git.status!==0)throw Error('CHECKOUT_SHA_UNAVAILABLE');
 const plan=JSON.parse(run(['tools/qa-queue.mjs','pre-ff','--list'],root));
 const file=path.join(path.resolve(raw),'RESULTS.json');
 const input=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):null;
 const canonical=plan.map(entry=>normalizeJob(entry,root)),indices=selection(canonical,job);
 const diagnostic=job!==undefined&&job!=='';
 if(diagnostic&&input&&JSON.stringify(input.selectedFullIndices)!==JSON.stringify(indices))throw Error('JOB_PLAN_MISMATCH');
 const selectedPlan=indices.map(index=>plan[index-1]);
 const failureLogs=selectedPlan.map((entry,index)=>input?.results?.[index]?.status==='FAIL'?readFailureLog(raw,indices[index]-1,entry.id):'');
 const knownSourceFiles=collectTrackedCodeFiles(root);
 const projected=projectResults({plan:selectedPlan,raw:input,root,sha:git.stdout.trim(),outcome,failureLogs,knownSourceFiles});
 if(diagnostic){projected.result.schema='pre-ff-diagnostic-report/v1';projected.result.fullPlanTotal=plan.length;projected.result.selectedFullIndices=indices;}
 for(const [i,row]of projected.result.jobs.entries()){
  if(diagnostic)row.index=indices[i];
  const privateRow=input.results[i];
  if(Object.hasOwn(privateRow,'originalExitCode')){
   if(privateRow.originalExitCode!==null&&!Number.isSafeInteger(privateRow.originalExitCode))throw Error('INVALID_EXIT_CODE');
   row.processExitCode=privateRow.originalExitCode;
  }
  if(typeof privateRow.teardown?.confirmed==='boolean'){
   row.teardownConfirmed=privateRow.teardown.confirmed;
   if(integer(privateRow.teardown.reapedChildren))row.reapedChildren=privateRow.teardown.reapedChildren;
  }
  const launch=row.status==='FAIL'?browserLaunchDetails(failureLogs[i]):null;
  if(launch)row.browserLaunch=launch;
  const browserPhase=browserPhaseDetails({raw,index:row.index,id:row.id});if(browserPhase)row.browserPhases=browserPhase;
  if(privateRow.timedOut===true){
   if(privateRow.status!=='FAIL'||![124,125].includes(privateRow.exitCode))throw Error('INVALID_JOB_STATUS');
   const confirmed=privateRow.teardown?.confirmed===true;
   row.timedOut=true;row.teardownConfirmed=confirmed;row.diagnostic={errorClass:'TimeoutError',cause:'TIMEOUT',firstLine:confirmed?'TimeoutError: CI job deadline exceeded; owned processes terminated.':'TimeoutError: CI job deadline exceeded; process cleanup not confirmed; queue stopped.',messageRedacted:true};
  }
  if(row.status==='FAIL'&&row.id==='books/shared/tools/check-generated-rebuild.mjs'){
   const detail=generatedFailureDetails({source:root,raw,index:row.index});if(detail)row.generated=detail;
  }
 }
 const current=safeCurrentJob(readJson(path.join(raw,'CURRENT_JOB.json')),canonical,indices);
 if(current)projected.result.currentJob=current;
 const files={'JOB_PLAN.json':JSON.stringify(projected.plan,null,2)+'\n','RESULTS.json':JSON.stringify(projected.result,null,2)+'\n','REPORT.md':markdownReport(projected.result)};
 for(const body of Object.values(files))if(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(body))throw Error('EMAIL_IN_PUBLIC_REPORT');
 fs.mkdirSync(destination,{recursive:true});
 for(const [name,body]of Object.entries(files))fs.writeFileSync(path.join(destination,name),body);
 if(summary)fs.appendFileSync(summary,files['REPORT.md']);
 return projected.result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const [command,...args]=process.argv.slice(2),options={};
  for(const arg of args){const match=/^--(source|raw|out|summary|outcome|job)=(.*)$/.exec(arg);if(!match||Object.hasOwn(options,match[1]))throw Error('INVALID_REPORT_OPTION');options[match[1]]=match[2];}
  if(command!=='report'||['source','raw','out','outcome'].some(key=>!Object.hasOwn(options,key)))throw Error('INVALID_REPORT_COMMAND');
  const report=exportReport(options);console.log(`Public pre-FF report: ${report.status}; ${report.passed}/${report.total} PASS`);process.exitCode=report.status==='PASS'?0:1;
 }catch(error){
  // Even checkout/setup failure gets a fixed public artifact, without echoing
  // an exception whose message might contain source text or private paths.
  const option=name=>process.argv.find(arg=>arg.startsWith('--'+name+'='))?.slice(name.length+3);
  const destination=option('out'),summary=option('summary');
  if(destination&&!fs.existsSync(destination)){
   const code=reportCodes.has(error?.message)?error.message:'REPORT_UNAVAILABLE';
   const diagnostic={errorClass:'ReportError',cause:code,firstLine:'ReportError: report preparation failed ('+code+'); private details redacted.',messageRedacted:true};
   const report={schema:'pre-ff-public-report/v1',sha:null,status:'FAIL',total:0,completed:0,passed:0,failed:0,missing:0,elapsedMs:0,problems:['REPORT_UNAVAILABLE'],diagnostic,jobs:[]};
   const body='# Pre-FF verification\n\nFAIL: checkout or report preparation failed. Tested SHA and job results are unavailable.\n\n'+diagnostic.firstLine+'\n\nRaw diagnostics remain private.\n';
   fs.mkdirSync(destination,{recursive:true});fs.writeFileSync(path.join(destination,'RESULTS.json'),JSON.stringify(report,null,2)+'\n');fs.writeFileSync(path.join(destination,'JOB_PLAN.json'),'[]\n');fs.writeFileSync(path.join(destination,'REPORT.md'),body);
   if(summary)fs.appendFileSync(summary,body);
  }
  console.error('Safe pre-FF report could not be generated; raw diagnostics remain private.');process.exitCode=1;
 }
}
