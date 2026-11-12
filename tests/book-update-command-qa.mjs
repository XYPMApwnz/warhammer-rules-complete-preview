/** A fresh book is read-only; invalid input cannot publish partial outputs. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {updateBook,publishOutputs} from '../books/shared/tools/book-update.mjs';
import {createQaTempDir,cleanupQaTempDir,createQaEvidenceDir,qaTempEnvironment} from './helpers/qa-temp.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),evidence=createQaEvidenceDir('book-update-command-qa-');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const files=execFileSync('git',['ls-tree','-r','--name-only','HEAD'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(f=>f.startsWith('books/death-guard/v2/generated/'));
const fingerprints=base=>Object.fromEntries(files.map(f=>[f,hash(fs.readFileSync(path.join(base,f)))]));
const initial=fingerprints(root),before=execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'});
const result=await updateBook({root,books:['death-guard'],check:true,out:path.join(evidence,'fresh')});
assert.equal(result.status,'PASS');assert.deepEqual(result.written,[]);assert.deepEqual(result.generatedChanges,[]);
assert(result.books.every(b=>b.gameplayChanges===0&&b.metadataChanges===0));
assert(result.steps.some(s=>s.label.startsWith('OUT_OF_SCOPE')),'Single-book freshness must not rebuild the global publication');
assert.match(result.scope,/Selected book outputs only/);
assert.deepEqual(fingerprints(root),initial);assert.equal(execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}),before);
const scratch=createQaTempDir('wh-book-update-invalid-'),copy=path.join(scratch,'checkout');
try{
 execFileSync('git',['clone','--local','--no-hardlinks','--config','core.autocrlf=false',root,copy],{env:qaTempEnvironment(),stdio:'pipe'});
 if(fs.existsSync(path.join(root,'node_modules')))fs.symlinkSync(fs.realpathSync(path.join(root,'node_modules')),path.join(copy,'node_modules'),process.platform==='win32'?'junction':'dir');
 const input='books/death-guard/content/official-update-ledger.en.json',invalid='{ INVALID BOOK UPDATE QA';
 fs.writeFileSync(path.join(copy,input),invalid);const old=fingerprints(copy);
 await assert.rejects(updateBook({root:copy,books:['death-guard'],out:path.join(evidence,'invalid')}),/death-guard:.*failed/);
 assert.deepEqual(fingerprints(copy),old,'Failed source input must not publish partial generated outputs');
 assert.equal(fs.readFileSync(path.join(copy,input),'utf8'),invalid,'The command must not repair or overwrite authored input');
 const failed=JSON.parse(fs.readFileSync(path.join(evidence,'invalid/RESULTS.json'),'utf8'));
 assert.equal(failed.status,'FAIL');assert.deepEqual(failed.written,[]);assert(failed.changedInputs.includes(input));
 execFileSync('git',['restore','--',input],{cwd:copy});const renamed=input+'.renamed.json';
 execFileSync('git',['mv','--',input,renamed],{cwd:copy});
 await assert.rejects(updateBook({root:copy,books:['death-guard'],out:path.join(evidence,'renamed')}),/death-guard:.*failed/);
 const moved=JSON.parse(fs.readFileSync(path.join(evidence,'renamed/RESULTS.json'),'utf8'));
 assert(moved.changedInputs.includes(input)&&moved.changedInputs.includes(renamed),'A staged rename must carry both deletion and addition into scratch');
 assert.deepEqual(moved.written,[]);assert.deepEqual(fingerprints(copy),old);assert(!fs.existsSync(path.join(copy,input)));
 const target=path.join(scratch,'publish-target'),source=path.join(scratch,'publish-source'),work=path.join(scratch,'publish-work');
 for(const dir of[target,source,work])fs.mkdirSync(dir,{recursive:true});
 const outputs=['one.json','two.json'];for(const file of outputs){fs.writeFileSync(path.join(target,file),'old '+file);fs.writeFileSync(path.join(source,file),'new '+file);}
 const rename=fs.renameSync,copyFile=fs.copyFileSync;
 try{
  fs.renameSync=()=>{throw Object.assign(Error('Synthetic cross-device rename'),{code:'EXDEV'});};
  assert.deepEqual(publishOutputs(target,source,outputs,work,evidence),outputs);
  for(const file of outputs)assert.equal(fs.readFileSync(path.join(target,file),'utf8'),'new '+file);
  for(const file of outputs)fs.writeFileSync(path.join(target,file),'old '+file);
  fs.copyFileSync=(from,to,...args)=>{if(to===path.join(target,'two.json')){fs.writeFileSync(to,'partial');throw Error('Synthetic interrupted publication');}return copyFile(from,to,...args);};
  assert.throws(()=>publishOutputs(target,source,outputs,work,evidence),/Synthetic interrupted publication/);
  for(const file of outputs)assert.equal(fs.readFileSync(path.join(target,file),'utf8'),'old '+file,'An interrupted cross-device publication must restore every old byte');
 }finally{fs.renameSync=rename;fs.copyFileSync=copyFile;}
 console.log(JSON.stringify({status:'PASS',freshness:'read-only',invalidInput:input,stagedRename:'missing old source rejected',crossDevicePublication:'PASS',interruptedPublicationRollback:'PASS',partialWrites:0,evidence}));
}finally{cleanupQaTempDir(scratch);}
