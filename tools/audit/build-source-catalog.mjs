/** Append-only source registry maintenance. Local declarations stay local.
 * Every candidate output is validated before any checkout file is replaced. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync,spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {createQaTempDir,cleanupQaTempDir,qaTempEnvironment,createQaEvidenceDir} from '../../tests/helpers/qa-temp.mjs';

const defaultRoot=fileURLToPath(new URL('../../',import.meta.url));
const catalogFile='books/shared/source-refs-v2/source-catalog.json';
const migration='75d322e4e3274f14d7e2a81abace3ba63c784ec5';
const books=['adeptus-mechanicus','blood-angels','chaos-space-marines','dark-angels',
  'death-guard','emperors-children','space-marines','tau-empire','tyranids'];
const kinds=['documents','layouts','contexts','bindings'];
const json=value=>JSON.stringify(value)+'\n';
const git=(root,...args)=>execFileSync('git',args,{cwd:root,maxBuffer:128*1024*1024});
const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
function shape(value){
  assert(object(value)&&JSON.stringify(Object.keys(value))===JSON.stringify(kinds),'Invalid registry sections or section order');
  for(const kind of kinds)assert(object(value[kind]),'Invalid registry table: '+kind);
  for(const table of Object.values(value.documents))assert(object(table),'Invalid document registry table');
}

/** Preserve entry bytes and order, not only content-address equivalence. */
export function assertAppendOnlyRegistry(previous,next){
  shape(previous);shape(next);
  function entries(before,after,label){
    const keys=Object.keys(before);
    for(const id of keys)assert(Object.hasOwn(after,id),'Removed registry entry: '+label+'/'+id);
    assert.deepEqual(Object.keys(after).slice(0,keys.length),keys,'Reordered registry entries: '+label);
    for(const id of keys)assert.equal(JSON.stringify(after[id]),JSON.stringify(before[id]),'Changed registry entry bytes: '+label+'/'+id);
  }
  const oldBooks=Object.keys(previous.documents);
  for(const book of oldBooks)assert(Object.hasOwn(next.documents,book),'Removed document registry book: '+book);
  assert.deepEqual(Object.keys(next.documents).slice(0,oldBooks.length),oldBooks,'Reordered document registry books');
  for(const book of oldBooks)entries(previous.documents[book],next.documents[book],'documents/'+book);
  for(const kind of kinds.slice(1))entries(previous[kind],next[kind],kind);
}

/** Explicit new definitions use the existing registry format. */
export function mergeSourceRegistry(seed,additions={}){
  shape(seed);assert(object(additions),'Registry additions must be an object');
  for(const kind of Object.keys(additions))assert(kinds.includes(kind),'Unknown registry section: '+kind);
  const next=structuredClone(seed);
  function append(target,values,label){
    assert(object(values),'Invalid registry additions: '+label);
    for(const id of Object.keys(values).sort()){
      assert(/^(documents|layouts|contexts|bindings)-[0-9a-f]{16}$/.test(id),'Invalid registry identity: '+id);
      if(Object.hasOwn(target,id))assert.equal(JSON.stringify(target[id]),JSON.stringify(values[id]),'Changed registry entry bytes: '+label+'/'+id);
      else target[id]=structuredClone(values[id]);
    }
  }
  for(const book of Object.keys(additions.documents||{}).sort()){
    assert(/^[a-z][a-z0-9-]*$/.test(book),'Invalid document registry book');
    next.documents[book]||={};append(next.documents[book],additions.documents[book],'documents/'+book);
  }
  for(const kind of kinds.slice(1))append(next[kind],additions[kind]||{},kind);
  assertAppendOnlyRegistry(seed,next);return next;
}

export function sourceCatalogFiles(root){
  const files=git(root,'ls-tree','-r','--name-only',migration,'--','books').toString().trim().split('\n')
    .filter(file=>books.some(book=>file.startsWith('books/'+book+'/v2/generated/'))&&file.endsWith('.json')).sort();
  assert.equal(files.length,97);return files;
}

function validateCandidate(root,inputRoot,files,candidate,temp){
  // The unchanged decoder/guard read the real candidate, without an implicit
  // fallback to another checkout's registry or a process-wide compiler pool.
  for(const name of ['source-catalog.mjs','source-refs.mjs','source-closure.mjs'])
    fs.copyFileSync(path.join(root,'books/shared/source-refs-v2',name),path.join(temp,name));
  fs.writeFileSync(path.join(temp,'source-catalog.json'),json(candidate));
  const resultFile=path.join(temp,'validation.json');
  const worker=`import fs from 'node:fs';import assert from 'node:assert/strict';
import {sourceContentId} from './source-refs.mjs';
import {catalogBinding} from './source-catalog.mjs';
import {assertSourceReferenceClosure} from './source-closure.mjs';
const catalog=JSON.parse(fs.readFileSync(new URL('./source-catalog.json',import.meta.url))),rows=[];
for(const [book,table]of Object.entries(catalog.documents))for(const [id,value]of Object.entries(table))assert.equal(sourceContentId('documents',value),id,'Invalid document identity '+book+'/'+id);
for(const kind of ['layouts','contexts'])for(const [id,value]of Object.entries(catalog[kind]))assert.equal(sourceContentId(kind,value),id,'Invalid '+kind+' identity '+id);
for(const id of Object.keys(catalog.bindings)){
 const binding=catalogBinding(id);assert.equal(sourceContentId('bindings',binding),id,'Invalid binding identity '+id);
 for(const [slot,value]of Object.entries(binding))if(!slot.startsWith('$')){
  assert(Object.hasOwn(catalog.layouts,value.layout),'Registry binding '+id+' has missing layout '+value.layout);
  assert(Array.isArray(value.refs)&&value.refs.every(index=>Number.isInteger(index)&&index>=0),'Invalid reference indexes in registry binding '+id);
  assert(Array.isArray(value.contexts),'Invalid contexts in registry binding '+id);
  for(const context of value.contexts)assert(Object.hasOwn(catalog.contexts,context),'Registry binding '+id+' has missing context '+context);
 }
}
for(const file of ${JSON.stringify(files)}){
 const value=JSON.parse(fs.readFileSync(${JSON.stringify(inputRoot)}+'/'+file)),missing=new Set();
 function visit(node){if(!node||typeof node!=='object')return;if(typeof node.sourceBindings==='string'&&/^bindings-[0-9a-f]{16}$/.test(node.sourceBindings)&&!Object.hasOwn(catalog.bindings,node.sourceBindings))missing.add(node.sourceBindings);for(const child of Object.values(node))visit(child);}
 visit(value);
 try{assert.equal(missing.size,0,'Missing source bindings: '+file+' ('+missing.size+' unique: '+[...missing].join(', ')+')');assertSourceReferenceClosure(value,{catalog,bookId:file.split('/')[1],label:file});rows.push({file,status:'PASS'});}
 catch(error){rows.push({file,status:'FAIL',missingBindings:missing.size,error:error.message});}
}
fs.writeFileSync(${JSON.stringify(resultFile)},JSON.stringify(rows,null,2));
const failed=rows.filter(row=>row.status!=='PASS');if(failed.length)throw Error(failed.map(row=>row.error).join('\\n'));
`;
  const workerFile=path.join(temp,'validate.mjs');fs.writeFileSync(workerFile,worker);
  const run=spawnSync(process.execPath,[workerFile],{encoding:'utf8',env:qaTempEnvironment(),maxBuffer:16*1024*1024});
  if(run.status!==0)throw Error('Registry integrity failed before any checkout writes:\n'+run.stderr);
  const rows=JSON.parse(fs.readFileSync(resultFile));assert.equal(rows.length,97);return rows;
}

function replaceTransaction(root,changes,temp){
  const pending=changes.filter(row=>!row.before.equals(row.after));if(!pending.length)return 0;
  assert.equal(fs.statSync(temp).dev,fs.statSync(root).dev,'QA_TMP_ROOT must be on the checkout volume for atomic writes');
  for(const [i,row]of pending.entries()){
    row.staged=path.join(temp,'new-'+i);row.backup=path.join(temp,'old-'+i);
    fs.writeFileSync(row.staged,row.after);fs.writeFileSync(row.backup,row.before);
  }
  const replaced=[];
  try{
    // An append-only registry supports old and new outputs during replacement.
    for(const row of pending){fs.renameSync(row.staged,path.join(root,row.file));replaced.push(row);}
  }catch(error){
    const failures=[];
    for(const row of replaced.reverse())try{fs.renameSync(row.backup,path.join(root,row.file));}catch(rollback){failures.push(row.file+': '+rollback.message);}
    if(failures.length){
      const recovery=createQaEvidenceDir('source-registry-rollback-');
      for(const row of pending){const target=path.join(recovery,row.file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,row.before);}
      throw Error(error.message+'; rollback failed: '+failures.join('; ')+'; original bytes saved at '+recovery);
    }
    throw Error('Registry transaction rolled back: '+error.message);
  }
  return pending.length;
}

export function maintainSourceCatalog({root=defaultRoot,mode='--check',mergeFile,inputRoot=root,seedFrom}={}){
  root=fs.realpathSync(root);inputRoot=fs.realpathSync(inputRoot);
  assert(['--write','--check'].includes(mode),'Use --write or --check');
  assert(!seedFrom||mode==='--write','--seed-from is explicit write-mode recovery from an accepted Git checkpoint');
  const target=path.join(root,catalogFile),current=fs.readFileSync(target);
  const head=git(root,'rev-parse','HEAD').toString().trim(),accepted=JSON.parse(git(root,'show',head+':'+catalogFile));
  const seedBytes=seedFrom?git(root,'show',seedFrom+':'+catalogFile):current,seed=JSON.parse(seedBytes);shape(seed);
  assert.equal(seedBytes.toString('utf8'),json(seed),'Registry seed bytes are not in their canonical stored format');
  const candidate=mergeSourceRegistry(seed,mergeFile?JSON.parse(fs.readFileSync(mergeFile)):{}),files=sourceCatalogFiles(root);
  const inputs=new Map(files.map(file=>[file,fs.readFileSync(path.join(inputRoot,file))]));
  const before=new Map([catalogFile,...files].map(file=>[file,fs.readFileSync(path.join(root,file))]));
  const temp=createQaTempDir('wh-source-registry-');
  try{
    const validation=validateCandidate(root,inputRoot,files,candidate,temp);
    assertAppendOnlyRegistry(accepted,candidate);assertAppendOnlyRegistry(seed,candidate);
    for(const file of files)assert(inputs.get(file).equals(fs.readFileSync(path.join(inputRoot,file))),'Input changed during validation: '+file);
    assert.equal(git(root,'rev-parse','HEAD').toString().trim(),head,'Source HEAD changed during validation');
    for(const [file,bytes]of before)assert(bytes.equals(fs.readFileSync(path.join(root,file))),'Checkout changed during validation: '+file);
    const catalogBytes=Buffer.from(json(candidate));
    const changes=[{file:catalogFile,before:current,after:catalogBytes},...files.map(file=>({file,before:before.get(file),after:inputs.get(file)}))];
    if(mode==='--check')for(const row of changes)assert(row.before.equals(row.after),'Unapplied registry/input update: '+row.file);
    const writes=mode==='--write'?replaceTransaction(root,changes,temp):0;
    const counts=value=>({documents:Object.values(value.documents).reduce((n,table)=>n+Object.keys(table).length,0),...Object.fromEntries(kinds.slice(1).map(kind=>[kind,Object.keys(value[kind]).length]))});
    const oldCounts=counts(seed),newCounts=counts(candidate);
    const report={status:'PASS',mode,artifacts:validation.length,catalogBytes:catalogBytes.length,bindings:newCounts.bindings,
      documentsByBook:Object.fromEntries(Object.entries(candidate.documents).map(([id,table])=>[id,Object.keys(table).length])),
      appendOnly:true,existingEntryBytesPreserved:true,appended:Object.fromEntries(kinds.map(kind=>[kind,newCounts[kind]-oldCounts[kind]])),
      writes,inputRoot,seedFrom:seedFrom||'working registry',checkedBeforeWrite:validation.length};
    console.log(JSON.stringify(report));return report;
  }finally{cleanupQaTempDir(temp);}
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const args=process.argv.slice(2),mode=args.shift(),value=name=>args.find(arg=>arg.startsWith(name+'='))?.slice(name.length+1);
    for(const arg of args)assert(['--merge=','--inputs=','--seed-from='].some(prefix=>arg.startsWith(prefix)),'Unknown registry option: '+arg);
    maintainSourceCatalog({mode,mergeFile:value('--merge'),inputRoot:value('--inputs')||defaultRoot,seedFrom:value('--seed-from')});
  }catch(error){console.error(error.message);process.exitCode=1;}
}
