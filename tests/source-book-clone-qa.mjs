/** Real nine-book byte equivalence, mutation isolation and a production mutant. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath,pathToFileURL} from 'node:url';
const args=process.argv.slice(2),option=name=>args.find(value=>value.startsWith(name+'='))?.slice(name.length+1);
const root=path.resolve(option('--root')||fileURLToPath(new URL('../',import.meta.url)));
const moduleFile=path.join(root,'books/shared/source-refs-v2/source-refs.mjs');
const {cloneSourceBook}=await import(pathToFileURL(moduleFile));
const artifacts={'adeptus-mechanicus':'roster-runtime','blood-angels':'roster-import','chaos-space-marines':'roster-runtime',
 'dark-angels':'roster-import','death-guard':'rule-contract-effective','emperors-children':'roster-attachments',
 'space-marines':'roster-import','tau-empire':'roster-import','tyranids':'roster-runtime'};
const bytes=value=>Buffer.from(JSON.stringify(value));
function isolation(cloner,input){
 const before=bytes(input),first=cloner(input),second=cloner(input);
 assert.ok(bytes(first).equals(before),'Clone bytes differ');assert.ok(bytes(second).equals(before),'Second clone bytes differ');
 first.entities.find(entity=>entity.kind==='DATASHEET').data.qaCloneMutation='changed';
 assert.ok(bytes(input).equals(before),'Clone leaked into source book');
 assert.ok(bytes(second).equals(before),'Clone leaked into independent copy');
 assert.ok(bytes(cloner(input)).equals(before),'Clone changed repeated input');
}
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'wh-source-clone-'));
try{
 const source=fs.readFileSync(moduleFile,'utf8'),target=':copy(node[key]);';
 assert.equal(source.split(target).length,2,'Production clone mutation target changed');
 const mutant=source.replace("'./source-catalog.mjs'",JSON.stringify(pathToFileURL(path.join(path.dirname(moduleFile),'source-catalog.mjs')).href)).replace(target,':node[key];');
 const mutantFile=path.join(temporary,'shared-data-mutant.mjs');fs.writeFileSync(mutantFile,mutant);
 const {cloneSourceBook:leakingClone}=await import(pathToFileURL(mutantFile));
 const results=[];
 for(const [bookId,artifact]of Object.entries(artifacts)){
  const input=JSON.parse(fs.readFileSync(path.join(root,`books/${bookId}/v2/generated/${artifact}.json`)));
  isolation(cloneSourceBook,input);
  assert.throws(()=>isolation(leakingClone,structuredClone(input)),error=>error instanceof assert.AssertionError&&error.message==='Clone leaked into source book',bookId+' intentional leak escaped');
  results.push({bookId,bytes:'IDENTICAL',mutationIsolation:'PASS',intentionalLeak:'REJECTED'});
 }
 console.log(JSON.stringify({status:'PASS',books:results.length,results}));
}finally{fs.rmSync(temporary,{recursive:true,force:true});}
