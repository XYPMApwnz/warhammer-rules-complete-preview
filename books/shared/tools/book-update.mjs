/** Offline update orchestration. Producers/checks come only from declarations. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {execFileSync,spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {bookUpdateDeclarations,selectBookUpdate,sharedStepAffected,declaredInputFiles} from './book-update-declarations.mjs';
import {compareBookGameplay,renderBookUpdateReport} from './book-update-report.mjs';
import {publishedMfmSnapshot} from './book-update-snapshots.mjs';
import {reviewedMfmMetadataChange,writeReviewedMfmMetadata} from './book-update-metadata.mjs';
import {readCurrentMfmRelease} from '../../../mfm/content/current-mfm-release.mjs';
import {resolveQaPython} from '../../../tests/helpers/qa-python.cjs';
import {createQaTempDir,cleanupQaTempDir,createQaEvidenceDir,qaTempEnvironment,registerQaCleanup} from '../../../tests/helpers/qa-temp.mjs';

const defaultRoot=fileURLToPath(new URL('../../../',import.meta.url));
const sha=value=>createHash('sha256').update(value).digest('hex');
const git=(root,args,encoding='utf8')=>execFileSync('git',['-C',root,...args],{encoding,maxBuffer:192*1024*1024});
const names=text=>text.split('\0').filter(Boolean);
const at=(root,file)=>{
 if(!file||file.includes('\\')||file.includes(':')||path.posix.isAbsolute(file)||file.split('/').some(p=>!p||p==='..'||p==='.'))throw Error('Unsafe update path: '+file);
 return path.join(root,...file.split('/'));
};
const outside=(root,target)=>{if(target===root||target.startsWith(root+path.sep))throw Error('Book update evidence must be outside the checkout');};
function workState(root){
 const status=git(root,['status','--porcelain=v1','--untracked-files=all']);
 const changed=[...new Set([...names(git(root,['diff','--name-only','-z','HEAD'])),...names(git(root,['ls-files','--others','--exclude-standard','-z']))])];
 return{status,changed,fingerprints:Object.fromEntries(changed.map(f=>[f,fs.existsSync(at(root,f))?sha(fs.readFileSync(at(root,f))):null]))};
}
function sameState(a,b){return a.status===b.status&&JSON.stringify(a.fingerprints)===JSON.stringify(b.fingerprints);}
function decode(root,bytes){
 const script=`import fs from 'node:fs';import {parseProducerJSON} from ${JSON.stringify(pathToFileURL(at(root,'books/shared/source-refs-v2/producer-io.mjs')).href)};process.stdout.write(JSON.stringify(parseProducerJSON(fs.readFileSync(0,'utf8'))));`;
 return JSON.parse(execFileSync(process.execPath,['--input-type=module','-e',script],{input:bytes,encoding:'utf8',maxBuffer:192*1024*1024,env:qaTempEnvironment()}));
}
function npmCommand(script){
 const cli=process.env.npm_execpath||path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');
 if(!fs.existsSync(cli))throw Error('Launch through npm run book:update so declared npm checks can run');
 return{command:process.execPath,args:[cli,'run',script]};
}
function inputChanged(root,inputs,outputs,working){
 if(working.changed.some(f=>inputs.includes(f)))return true;
 if(!inputs.length||!outputs.length)return false;
 // Accepted inputs may already be committed before an authenticated build.
 // Compare history to the declared report artifact, not only the dirty diff.
 const inputCommit=git(root,['log','-1','--format=%H','HEAD','--',...inputs]).trim();
 const outputCommit=git(root,['log','-1','--format=%H','HEAD','--',...outputs]).trim();
 if(!inputCommit||!outputCommit)return true;
 try{git(root,['merge-base','--is-ancestor',inputCommit,outputCommit]);return false;}catch{return true;}
}
async function execute({command,args,cwd,env,log,label,book,results}){
 const started=Date.now(),fd=fs.openSync(log,'w');console.log('[book:update] '+label);
 const child=spawn(command,args,{cwd,env,stdio:['ignore','pipe','pipe']});
 const unregister=registerQaCleanup(()=>{if(child.exitCode===null)child.kill('SIGTERM');});
 for(const stream of [child.stdout,child.stderr])stream.on('data',chunk=>fs.writeSync(fd,chunk));
 let result;
 try{result=await new Promise(resolve=>{child.once('error',error=>resolve({exitCode:null,error:error.message}));child.once('close',(exitCode,signal)=>resolve({exitCode,signal}));});}
 finally{unregister();fs.closeSync(fd);}
 const row={book,label,command:[command,...args],log,elapsedMs:Date.now()-started,...result,status:result.exitCode===0?'PASS':'FAIL'};results.push(row);
 if(row.status!=='PASS'){
  const lines=fs.readFileSync(log,'utf8').split(/\r?\n/),detail=lines.findLast(l=>/Error:|AssertionError|ValueError|SyntaxError|ENOENT|FAIL/.test(l))||lines.findLast(l=>l.trim())||result.error||'No diagnostic output';
  throw Error(`${book}: ${label} failed (exit ${result.exitCode}): ${detail}; log: ${log}`);
 }
 return row;
}
function publishOutputs(root,copy,files,work,evidence){
 const pending=files.filter(f=>fs.existsSync(at(copy,f))&&(!fs.existsSync(at(root,f))||!fs.readFileSync(at(root,f)).equals(fs.readFileSync(at(copy,f)))));
 const backups=new Map(pending.map(f=>[f,fs.existsSync(at(root,f))?fs.readFileSync(at(root,f)):null])),done=[];
 try{for(const [i,f]of pending.entries()){
  const staged=path.join(work,'publish-'+i);fs.copyFileSync(at(copy,f),staged);fs.mkdirSync(path.dirname(at(root,f)),{recursive:true});fs.renameSync(staged,at(root,f));done.push(f);
 }}catch(error){
  const failures=[];for(const f of done.reverse())try{const before=backups.get(f);if(before)fs.writeFileSync(at(root,f),before);else fs.unlinkSync(at(root,f));}catch(rollback){failures.push(f+': '+rollback.message);}
  if(failures.length){const recovery=path.join(evidence,'recovery');for(const [f,bytes]of backups)if(bytes){const target=at(recovery,f);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);}throw Error(error.message+'; output rollback failed: '+failures.join('; ')+'; original bytes: '+recovery);}
  throw error;
 }
 return pending;
}
export async function updateBook({root=defaultRoot,books=[],all=false,check=false,out}={}){
 root=fs.realpathSync(root);out=path.resolve(out||createQaEvidenceDir('book-update-'));outside(root,out);
 const head=git(root,['rev-parse','HEAD']).trim(),tracked=names(git(root,['ls-tree','-r','--name-only','-z','HEAD'])),initial=workState(root);
 const declarations=bookUpdateDeclarations({root,tracked});let selection=selectBookUpdate(declarations,{books,all,changed:initial.changed});
 fs.mkdirSync(out,{recursive:true});if(fs.existsSync(path.join(out,'RESULTS.json')))throw Error('Choose a fresh --out directory');
 const started=Date.now(),report={schema:'book-update/v1',baseHead:head,root,mode:check?'check':'update',status:'RUNNING',selection,books:[],generatedChanges:[],metadataPinChanges:[],steps:[],changedInputs:initial.changed};
 const save=()=>{report.elapsedMs=Date.now()-started;fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify(report,null,2)+'\n');fs.writeFileSync(path.join(out,'REPORT.md'),renderBookUpdateReport(report));};
 const scratch=createQaTempDir('wh-book-update-'),copy=path.join(scratch,'checkout'),work=path.join(scratch,'operations');fs.mkdirSync(work,{recursive:true});
 const env={...qaTempEnvironment(),PYTHONDONTWRITEBYTECODE:'1',PYTHONUTF8:'1',PYTHON:resolveQaPython()};
 try{
  console.log('[book:update] '+selection.books.join(', '));if(selection.fallbackReason)console.log('[book:update] '+selection.fallbackReason);
  const cloneLog=path.join(out,'checkout.log'),fd=fs.openSync(cloneLog,'w');
  try{execFileSync('git',['clone','--local','--no-hardlinks','--no-checkout','--config','core.autocrlf=false',root,copy],{env,stdio:['ignore',fd,fd]});execFileSync('git',['-C',copy,'checkout','--detach',head],{env,stdio:['ignore',fd,fd]});}finally{fs.closeSync(fd);}
  for(const file of initial.changed){const source=at(root,file),target=at(copy,file);if(fs.existsSync(source)){fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(source,target);}else if(fs.existsSync(target))fs.unlinkSync(target);}
  if(fs.existsSync(path.join(root,'node_modules')))fs.symlinkSync(fs.realpathSync(path.join(root,'node_modules')),path.join(copy,'node_modules'),process.platform==='win32'?'junction':'dir');
  const before=new Map(),beforeMfm=new Map(),inferredInputs=new Set(),release=readCurrentMfmRelease({repoRoot:copy});report.mfmBaselines={};
  for(const {id,passport}of declarations.books){
   const decoded=decode(copy,git(root,['show',head+':'+passport.update.reportArtifact],null));
   const file=path.join(work,'before-'+id+'.json');fs.writeFileSync(file,JSON.stringify(decoded));before.set(id,file);
   const snapshot=publishedMfmSnapshot({root,head,bookId:id,passport,payload:decoded,sourceRegistryPath:release.sourceRegistryPath});beforeMfm.set(id,snapshot.capture);
   const current=release.factions.find(f=>f.bookId===id),capture=JSON.parse(fs.readFileSync(at(copy,current.capturePath),'utf8'));
   report.mfmBaselines[id]={method:snapshot.method,ref:snapshot.ref,file:snapshot.file,version:snapshot.capture.version};
   if(snapshot.capture.captureSha256!==capture.captureSha256)inferredInputs.add(passport.mfm.currentRelease);
  }
  selection=selectBookUpdate(declarations,{books,all,changed:[...new Set([...initial.changed,...inferredInputs])]});report.selection=selection;
  const metadataPins=declarations.books.filter(b=>selection.books.includes(b.id)).flatMap(b=>b.passport.update.metadataPins.map(operation=>({book:b.id,operation})));
  const affected=new Set([...initial.changed,...inferredInputs]),executedShared=new Set();
  for(const [i,step]of selection.steps.entries()){
   const policy=declarations.shared.find(row=>row.step.producer===step.producer),args=policy?.operations.updateArgs??step.args;
   if(policy&&check&&!selection.fullPlan&&!declarations.checkSharedSteps){
    report.steps.push({book:step.book,label:'OUT_OF_SCOPE '+step.producer,status:'NOT_RUN',elapsedMs:0});continue;
   }
   if(policy&&!selection.fullPlan&&!sharedStepAffected(policy,[...affected],declarations)&&!inputChanged(root,declaredInputFiles(policy,declarations,tracked),policy.freshnessOutputs,initial)){
    report.steps.push({book:step.book,label:'UNCHANGED '+step.producer,status:'SKIPPED',elapsedMs:0});continue;
   }
   if(policy)executedShared.add(step.producer);
   if(!step.preserveOutputSeeds)for(const file of step.outputs)if(fs.existsSync(at(copy,file)))fs.unlinkSync(at(copy,file));
   const expanded=args.map(arg=>arg.replaceAll('{work}',work).replaceAll('{checkout}',copy).replaceAll('{head}',head));
   await execute({command:step.runtime==='python'?env.PYTHON:process.execPath,args:[step.producer,...expanded],cwd:copy,env,log:path.join(out,String(i+1).padStart(2,'0')+'-'+step.book+'-'+path.basename(step.producer)+'.log'),label:'BUILD '+step.producer,book:step.book,results:report.steps});
   for(const file of step.outputs){if(!fs.existsSync(at(copy,file)))throw Error(step.book+': producer did not emit declared file '+file);if(!fs.existsSync(at(root,file))||!fs.readFileSync(at(copy,file)).equals(fs.readFileSync(at(root,file))))affected.add(file);}
   for(const {book,operation}of metadataPins.filter(pin=>pin.operation.afterProducer===step.producer)){
    try{
     const facts=decode(copy,fs.readFileSync(at(copy,operation.factualArtifact))),review=JSON.parse(fs.readFileSync(at(copy,operation.reviewArtifact),'utf8'));
     const change=reviewedMfmMetadataChange({facts,review,beforeVersion:beforeMfm.get(book).version,currentVersion:release.version,operation});
     writeReviewedMfmMetadata(at(copy,operation.reviewArtifact),change,operation);
     if(change.changed){report.metadataPinChanges.push({book,file:operation.reviewArtifact,...change});affected.add(operation.reviewArtifact);console.log('[book:update] METADATA '+book+': MFM version only; old factual fingerprint reconstructed exactly');}
    }catch(error){throw Error(book+': '+operation.reviewArtifact+': '+error.message);}
   }
  }
  for(const row of declarations.shared.filter(r=>executedShared.has(r.step.producer)&&r.operations.checkArgs))await execute({command:process.execPath,args:[row.step.producer,...row.operations.checkArgs],cwd:copy,env,log:path.join(out,'verify-'+path.basename(row.step.producer)+'.log'),label:'VERIFY '+row.step.producer,book:row.step.book,results:report.steps});
  for(const id of selection.books){
   const passport=declarations.books.find(b=>b.id===id).passport;
   const after=decode(copy,fs.readFileSync(at(copy,passport.update.reportArtifact))),release=readCurrentMfmRelease({repoRoot:copy}),capture=release.factions.find(f=>f.bookId===id);
   const comparison=compareBookGameplay({bookId:id,before:JSON.parse(fs.readFileSync(before.get(id),'utf8')),after,mfmBefore:beforeMfm.get(id),mfmAfter:capture?JSON.parse(fs.readFileSync(at(copy,capture.capturePath),'utf8')):undefined});
   comparison.metadataChanges+=report.metadataPinChanges.filter(c=>c.book===id).length;report.books.push(comparison);
  }
  for(const file of declarations.plan.files){const target=at(copy,file),original=at(root,file);if(fs.existsSync(target)&&(!fs.existsSync(original)||!fs.readFileSync(target).equals(fs.readFileSync(original))))report.generatedChanges.push({file,beforeSha256:fs.existsSync(original)?sha(fs.readFileSync(original)):null,afterSha256:sha(fs.readFileSync(target))});}
  if(check&&(report.generatedChanges.length||report.metadataPinChanges.length))throw Error('Stale generated files or reviewed MFM metadata: '+[...report.generatedChanges,...report.metadataPinChanges].map(r=>r.file).join(', ')+'; rebuild with npm run book:update -- '+(all?'--all':books.map(id=>'--book='+id).join(' ')));
  const checks=new Set();
  if(!check)for(const id of selection.books){
   const passport=declarations.books.find(b=>b.id===id).passport;checks.add(passport.qa.script);
   for(const [role,script]of Object.entries(passport.qa.onInputChange)){
    const input=passport.sources.inputs.find(i=>i.role===role).path;
    if(initial.changed.includes(input)||inferredInputs.has(input))checks.add(script);
   }
  }
  for(const [i,script]of [...checks].entries())await execute({...npmCommand(script),cwd:copy,env,log:path.join(out,'qa-'+String(i+1).padStart(2,'0')+'-'+script.replaceAll(':','-')+'.log'),label:'QA '+script,book:declarations.books.find(b=>b.passport.qa.script===script)?.id??'shared',results:report.steps});
  if(git(root,['rev-parse','HEAD']).trim()!==head||!sameState(initial,workState(root)))throw Error('Working inputs changed while the update was running; no outputs were published. Retry from the new state.');
  report.written=check?[]:publishOutputs(root,copy,[...new Set([...declarations.plan.files,...metadataPins.map(p=>p.operation.reviewArtifact)])],work,out);
  report.scope=check&&!selection.fullPlan&&!declarations.checkSharedSteps?'Selected book outputs only; shared publication freshness is covered by generated:check.':'Affected declared outputs and checks';
  report.status='PASS';save();
  console.log(`[book:update] PASS ${report.elapsedMs}ms; ${report.generatedChanges.length} generated files changed; ${report.metadataPinChanges.length} reviewed metadata pins; ${report.books.reduce((n,b)=>n+b.gameplayChanges,0)} gameplay changes. Report: ${path.join(out,'REPORT.md')}`);
  return report;
 }catch(error){report.status='FAIL';report.error=error.message;report.written=[];save();console.error('[book:update] FAIL '+error.message);if(initial.changed.length)console.error('[book:update] Inputs: '+initial.changed.join(', '));throw error;}
 finally{cleanupQaTempDir(scratch);}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),option=name=>args.find(a=>a.startsWith(name+'='))?.slice(name.length+1);
 if(args.includes('--help'))console.log('Update one Army Book offline: npm run book:update -- --book=<id> [--check] [--out=<external-folder>]\nUse --all for all books. Unknown changed inputs run the full declared plan.\n--check rebuilds in scratch and never writes the checkout. Normal updates publish only after declared QA passes.\nAccept and commit source/pin changes first when a source-integrity guard requires it. No commit, push, or network capture is performed.');
 else try{for(const arg of args)if(!['--all','--check'].includes(arg)&&!['--book=','--out=','--root='].some(p=>arg.startsWith(p)))throw Error('Unknown option: '+arg);if(args.includes('--all')&&option('--book'))throw Error('Choose --all or --book, not both');await updateBook({root:option('--root')||defaultRoot,books:args.filter(a=>a.startsWith('--book=')).map(a=>a.slice(7)),all:args.includes('--all'),check:args.includes('--check'),out:option('--out')});}
 catch(error){console.error(error.stack||error);process.exitCode=1;}
}
