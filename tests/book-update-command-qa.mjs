/** A fresh book is read-only; invalid input cannot publish partial outputs. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {updateBook} from '../books/shared/tools/book-update.mjs';
import {createQaTempDir,cleanupQaTempDir,createQaEvidenceDir,qaTempEnvironment} from './helpers/qa-temp.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),evidence=createQaEvidenceDir('book-update-command-qa-');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const files=execFileSync('git',['ls-tree','-r','--name-only','HEAD'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(f=>f.startsWith('books/death-guard/v2/generated/'));
const fingerprints=base=>Object.fromEntries(files.map(f=>[f,hash(fs.readFileSync(path.join(base,f)))]));
const initial=fingerprints(root),before=execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'});
const result=await updateBook({root,books:['death-guard'],check:true,out:path.join(evidence,'fresh')});
assert.equal(result.status,'PASS');assert.deepEqual(result.written,[]);assert.deepEqual(result.generatedChanges,[]);
assert(result.books.every(b=>b.gameplayChanges===0&&b.metadataChanges===0));
assert(result.steps.filter(s=>s.label.startsWith('UNCHANGED')).length>0,'Unchanged shared outputs should not be rebuilt');
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
 console.log(JSON.stringify({status:'PASS',freshness:'read-only',invalidInput:input,partialWrites:0,evidence}));
}finally{cleanupQaTempDir(scratch);}
