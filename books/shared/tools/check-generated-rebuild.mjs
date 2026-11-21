/** Rebuild committed outputs in an owned Git checkout; compare exact bytes. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn,execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createQaTempDir,createQaEvidenceDir,cleanupQaTempDir,qaTempEnvironment,registerQaCleanup} from '../../../tests/helpers/qa-temp.mjs';
import {resolveQaPython} from '../../../tests/helpers/qa-python.cjs';
import {BOOKS,generatedRebuildPlan} from './generated-rebuild-plan.mjs';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const relativeFile=(root,file)=>{
  if(!file||file.includes('\\')||path.posix.isAbsolute(file)||file.split('/').some(part=>!part||part==='.'||part==='..'))throw Error('Unsafe rebuild path: '+file);
  return path.join(root,...file.split('/'));
};
export function compareGeneratedBytes(expected,actual,file,rebuild){
  if(expected.equals(actual))return null;
  let firstByte=0;while(firstByte<Math.min(expected.length,actual.length)&&expected[firstByte]===actual[firstByte])firstByte++;
  return {file,rebuild,expectedSha256:hash(expected),rebuiltSha256:hash(actual),expectedBytes:expected.length,rebuiltBytes:actual.length,firstByte,
    message:`Stale generated file ${file}; rebuild with: ${rebuild}`};
}

export function committedRebuildInput(root){
  const git=args=>execFileSync('git',['-C',root,...args],{encoding:'utf8',maxBuffer:16*1024*1024});
  const top=fs.realpathSync(git(['rev-parse','--show-toplevel']).trim()),actual=fs.realpathSync(root);
  if((process.platform==='win32'?top.toLowerCase():top)!==(process.platform==='win32'?actual.toLowerCase():actual))throw Error('Generated rebuild root must be the Git checkout root');
  const dirty=git(['status','--porcelain=v1','--untracked-files=all']);
  if(dirty.trim())throw Error('Generated rebuild requires a clean working tree; commit or remove pending changes first:\n'+dirty);
  return {head:git(['rev-parse','HEAD']).trim(),tracked:git(['ls-tree','-r','--name-only','-z','HEAD']).split('\0').filter(Boolean)};
}

export async function checkGeneratedRebuild({root,out,plan}={}){
  root=path.resolve(root);out=path.resolve(out);
  if(out===root||out.startsWith(root+path.sep))throw Error('Rebuild evidence must be outside the checkout');
  // Authentication must see an actual, clean commit, never a synthetic index.
  const {head,tracked}=committedRebuildInput(root);
  plan??=generatedRebuildPlan(tracked);
  fs.mkdirSync(out,{recursive:true});
  if(fs.existsSync(path.join(out,'RESULTS.json')))throw Error('Use a fresh generated-rebuild evidence directory');
  const scratch=createQaTempDir('wh-generated-rebuild-'),copy=path.join(scratch,'checkout');
  const started=Date.now(),results=[],report={schema:'generated-rebuild-check/v1',root,head,files:plan.files,excluded:plan.excluded,steps:results};
  const env={...qaTempEnvironment(),PYTHONUTF8:'1',PYTHONDONTWRITEBYTECODE:'1'};
  const python=resolveQaPython();env.PYTHON=python;
  const save=()=>{report.elapsedMs=Date.now()-started;fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify(report,null,2)+'\n');};
  try{
    console.log('[generated:check] Tracked output inventory ('+plan.files.length+')');
    for(const file of plan.files)console.log('[generated:check] FILE '+file);
    for(const row of plan.excluded)console.log('[generated:check] RETIRED '+row.file+' — '+row.reason);
    const cloneLog=path.join(out,'checkout.log'),cloneFd=fs.openSync(cloneLog,'w'),cloneStarted=Date.now();
    try{
      execFileSync('git',['clone','--local','--no-hardlinks','--no-checkout','--config','core.autocrlf=false',root,copy],{env,stdio:['ignore',cloneFd,cloneFd]});
      execFileSync('git',['-C',copy,'checkout','--detach',head],{env,stdio:['ignore',cloneFd,cloneFd]});
    }finally{fs.closeSync(cloneFd);}
    const cloned=committedRebuildInput(copy);
    if(cloned.head!==head)throw Error('Generated rebuild clone does not match the pinned HEAD');
    report.checkout={head:cloned.head,log:cloneLog,elapsedMs:Date.now()-cloneStarted};
    const expectedBytes=new Map(plan.files.map(file=>[file,fs.readFileSync(relativeFile(copy,file))]));
    const modules=path.join(root,'node_modules');
    if(fs.existsSync(modules))fs.symlinkSync(fs.realpathSync(modules),path.join(copy,'node_modules'),process.platform==='win32'?'junction':'dir');
    for(const [i,step]of plan.steps.entries()){
      const command=step.runtime==='python'?python:process.execPath,args=[step.producer,...step.args];
      const rebuild=(step.runtime==='python'?'python':'node')+' '+args.join(' '),begin=Date.now();
      console.log(`[generated:check] ${i+1}/${plan.steps.length} BUILD ${rebuild}`);
      const expected=new Map(step.outputs.map(file=>[file,expectedBytes.get(file)]));
      // Missing/forgotten writes must not pass by leaving the copied output in place.
      if(!step.preserveOutputSeeds)for(const file of step.outputs)fs.unlinkSync(relativeFile(copy,file));
      const log=path.join(out,String(i+1).padStart(2,'0')+'-'+step.book+'-'+path.basename(step.producer)+'.log');
      const fd=fs.openSync(log,'w'),child=spawn(command,args,{cwd:copy,env,stdio:['ignore','pipe','pipe']});
      const unregister=registerQaCleanup(()=>{if(child.exitCode===null)child.kill('SIGTERM');});
      for(const stream of [child.stdout,child.stderr])stream.on('data',chunk=>{fs.writeSync(fd,chunk);process.stdout.write(chunk);});
      const execution=await new Promise(resolve=>{child.on('error',error=>resolve({exitCode:null,error:error.message}));child.on('close',(exitCode,signal)=>resolve({exitCode,signal}));});
      unregister();fs.closeSync(fd);
      const result={...step,command:[command,...args],rebuild,elapsedMs:Date.now()-begin,log,...execution,status:'PASS',differences:[]};results.push(result);
      if(execution.exitCode!==0){result.status='BUILD_FAILED';report.status='BLOCKED';save();throw Error('Generated producer failed: '+rebuild+'; see '+log);}
      for(const file of step.outputs){
        const output=relativeFile(copy,file);
        const difference=fs.existsSync(output)?compareGeneratedBytes(expected.get(file),fs.readFileSync(output),file,rebuild):
          {file,rebuild,message:'Generated output was not emitted: '+file+'; rebuild with: '+rebuild};
        if(difference){result.differences.push(difference);console.error(difference.message);const evidence=path.join(out,'differences',file);fs.mkdirSync(path.dirname(evidence),{recursive:true});fs.writeFileSync(evidence+'.expected',expected.get(file));if(fs.existsSync(output))fs.copyFileSync(output,evidence+'.rebuilt');}
      }
      if(result.differences.length){result.status='STALE';report.status='BLOCKED';save();throw Error('Generated rebuild differs from tracked outputs; no source files were changed.');}
      save();
    }
    if(committedRebuildInput(root).head!==head)throw Error('Source HEAD changed during generated rebuild');
    report.status='PASS';save();console.log(`[generated:check] PASS ${plan.files.length} files, ${report.elapsedMs}ms`);return report;
  }catch(error){report.status='BLOCKED';report.error=error.message;save();throw error;}
  finally{cleanupQaTempDir(scratch);}
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const value=name=>process.argv.find(arg=>arg.startsWith(name+'='))?.slice(name.length+1);
  const root=path.resolve(value('--root')||fileURLToPath(new URL('../../../',import.meta.url)));
  const tracked=execFileSync('git',['ls-tree','-r','--name-only','-z','HEAD'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean),plan=generatedRebuildPlan(tracked);
  if(process.argv.includes('--list'))console.log(JSON.stringify({...plan,counts:Object.fromEntries(BOOKS.map(book=>[book,plan.files.filter(file=>file.startsWith('books/'+book+'/')).length]))},null,2));
  else try{await checkGeneratedRebuild({root,plan,out:value('--out')||createQaEvidenceDir('wh-generated-rebuild-evidence-')});}
  catch(error){console.error(error.stack||error);process.exitCode=1;}
}
