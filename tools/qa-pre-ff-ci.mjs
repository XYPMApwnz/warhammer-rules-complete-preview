/** Public CI evidence is a strict projection, never a copy of raw QA evidence. */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const integer=value=>Number.isSafeInteger(value)&&value>=0;
const safeJob=value=>typeof value==='string'&&value.length<=240&&/^[A-Za-z0-9_./ -]+$/.test(value)&&!value.includes('..');
const same=(left,right)=>JSON.stringify(left)===JSON.stringify(right);
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
export function projectResults({plan,raw,root,sha,outcome,platform=process.platform}){
 if(!/^[0-9a-f]{40}$/.test(sha))throw Error('INVALID_SHA');
 if(!['linux','win32','darwin'].includes(platform))throw Error('INVALID_PLATFORM');
 if(!['success','failure','cancelled','skipped',''].includes(outcome))throw Error('INVALID_OUTCOME');
 const canonical=plan.map(job=>normalizeJob(job,root));
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
  return {index:index+1,...canonical[index],status:row.status,exitCode:row.exitCode,elapsedMs:row.elapsedMs};
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
  '## Failed jobs\n\n'+(failed.length?failed.map(job=>`- ${job.index}. \`${job.id}\` ${job.args.slice(1).map(a=>'`'+a+'`').join(' ')}`).join('\n'):'None.')+'\n\n'+
  'Report conditions: '+(result.problems.join(', ')||'none')+'.\n\n'+
  'Privacy: raw logs, captures, DOM, traces, browser profiles, source text and arbitrary error messages are not published.\n';
}
function run(args,cwd){const r=spawnSync(process.execPath,args,{cwd,encoding:'utf8',maxBuffer:16*1024*1024});if(r.status!==0)throw Error('PLAN_UNAVAILABLE');return r.stdout;}
export function exportReport({source,raw,out,summary,outcome}){
 const root=path.resolve(source),destination=path.resolve(out);
 if(fs.existsSync(destination))throw Error('REPORT_DESTINATION_NOT_FRESH');
 if(destination===root||destination.startsWith(root+path.sep))throw Error('REPORT_INSIDE_SOURCE');
 const git=spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'});
 if(git.status!==0)throw Error('CHECKOUT_SHA_UNAVAILABLE');
 const plan=JSON.parse(run(['tools/qa-queue.mjs','pre-ff','--list'],root));
 const file=path.join(path.resolve(raw),'RESULTS.json');
 const input=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):null;
 const projected=projectResults({plan,raw:input,root,sha:git.stdout.trim(),outcome});
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
  for(const arg of args){const match=/^--(source|raw|out|summary|outcome)=(.*)$/.exec(arg);if(!match||Object.hasOwn(options,match[1]))throw Error('INVALID_REPORT_OPTION');options[match[1]]=match[2];}
  if(command!=='report'||['source','raw','out','outcome'].some(key=>!Object.hasOwn(options,key)))throw Error('INVALID_REPORT_COMMAND');
  const report=exportReport(options);console.log(`Public pre-FF report: ${report.status}; ${report.passed}/${report.total} PASS`);process.exitCode=report.status==='PASS'?0:1;
 }catch{
  // Even checkout/setup failure gets a fixed public artifact, without echoing
  // an exception whose message might contain source text or private paths.
  const option=name=>process.argv.find(arg=>arg.startsWith('--'+name+'='))?.slice(name.length+3);
  const destination=option('out'),summary=option('summary');
  if(destination&&!fs.existsSync(destination)){
   const report={schema:'pre-ff-public-report/v1',sha:null,status:'FAIL',total:0,completed:0,passed:0,failed:0,missing:0,elapsedMs:0,problems:['REPORT_UNAVAILABLE'],jobs:[]};
   const body='# Pre-FF verification\n\nFAIL: checkout or report preparation failed. Tested SHA and job results are unavailable. Raw diagnostics remain private.\n';
   fs.mkdirSync(destination,{recursive:true});fs.writeFileSync(path.join(destination,'RESULTS.json'),JSON.stringify(report,null,2)+'\n');fs.writeFileSync(path.join(destination,'JOB_PLAN.json'),'[]\n');fs.writeFileSync(path.join(destination,'REPORT.md'),body);
   if(summary)fs.appendFileSync(summary,body);
  }
  console.error('Safe pre-FF report could not be generated; raw diagnostics remain private.');process.exitCode=1;
 }
}
