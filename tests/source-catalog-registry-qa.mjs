/** Real-checkout controls for append-only, validate-before-write source maintenance. */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createQaTempDir,cleanupQaTempDir,qaTempEnvironment,createQaEvidenceDir} from './helpers/qa-temp.mjs';

const root=fs.realpathSync(process.env.SOURCE_CATALOG_TEST_ROOT||fileURLToPath(new URL('../',import.meta.url)));
const cli='tools/audit/build-source-catalog.mjs',registry='books/shared/source-refs-v2/source-catalog.json';
const {sourceCatalogFiles}=await import(pathToFileURL(path.join(root,cli)));
const {sourceContentId}=await import(pathToFileURL(path.join(root,'books/shared/source-refs-v2/source-refs.mjs')));
const files=sourceCatalogFiles(root),head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const snapshot=folder=>new Map(files.map(file=>[file,sha(fs.readFileSync(path.join(folder,file)))]));
const sourceBefore=snapshot(root),seedBytes=fs.readFileSync(path.join(root,registry)),seed=JSON.parse(seedBytes);
const code=fs.readFileSync(path.join(root,cli)),used=new Map();
for(const file of files){
  const seen=new Set();
  function visit(value){
    if(!value||typeof value!=='object')return;
    if(typeof value.sourceBindings==='string'&&/^bindings-[0-9a-f]{16}$/.test(value.sourceBindings))seen.add(value.sourceBindings);
    for(const child of Object.values(value))visit(child);
  }
  visit(JSON.parse(fs.readFileSync(path.join(root,file))));
  for(const id of seen){const owners=used.get(id)||[];owners.push(file);used.set(id,owners);}
}
const usedId=[...used.keys()].find(id=>Object.hasOwn(seed.bindings,id));
const unusedId=Object.keys(seed.bindings).find(id=>!used.has(id));
assert(usedId,'The actual artifacts must use a registered binding');
assert(unusedId,'The accepted registry must contain a retained historical binding for the unused-entry control');
const contextId=Object.keys(seed.contexts).find(id=>Object.keys(seed.contexts[id]).length>1);
assert(contextId,'A real multi-field context is required for exact-byte controls');
const work=createQaTempDir('wh-source-registry-controls-'),evidence=createQaEvidenceDir('wh-source-registry-controls-');
const clone=path.join(work,'checkout'),rows=[];
let completed=false;
function outputsUnchanged(label){
  for(const [file,digest]of sourceBefore)assert.equal(sha(fs.readFileSync(path.join(clone,file))),digest,label+': output changed before successful validation: '+file);
}
function preserveEntries(previous,next){
  assert.deepEqual(Object.keys(next),Object.keys(previous),'Registry section order changed');
  const preserve=(before,after,label)=>{
    const keys=Object.keys(before);
    assert.deepEqual(Object.keys(after).slice(0,keys.length),keys,label+': old key prefix changed');
    for(const id of keys)assert.equal(JSON.stringify(after[id]),JSON.stringify(before[id]),label+'/'+id+': old entry JSON bytes changed');
  };
  const oldBooks=Object.keys(previous.documents);
  assert.deepEqual(Object.keys(next.documents).slice(0,oldBooks.length),oldBooks,'documents: old book prefix changed');
  for(const book of Object.keys(previous.documents))preserve(previous.documents[book],next.documents[book],'documents/'+book);
  for(const kind of ['layouts','contexts','bindings'])preserve(previous[kind],next[kind],kind);
}
function run(name,{mutate,merge,expectError,inputRoot}={}){
  fs.writeFileSync(path.join(clone,registry),seedBytes);
  const candidate=structuredClone(seed);
  if(mutate){mutate(candidate);fs.writeFileSync(path.join(clone,registry),JSON.stringify(candidate)+'\n');}
  const before=fs.readFileSync(path.join(clone,registry)),args=[cli,'--write'];
  if(inputRoot)args.push('--inputs='+inputRoot);
  if(merge){const mergeFile=path.join(work,'addition.json');fs.writeFileSync(mergeFile,JSON.stringify(merge)+'\n');args.push('--merge='+mergeFile);}
  const started=Date.now(),result=spawnSync(process.execPath,args,{cwd:clone,encoding:'utf8',env:qaTempEnvironment(),maxBuffer:16*1024*1024});
  const log=path.join(evidence,String(rows.length+1).padStart(2,'0')+'-'+name+'.log');fs.writeFileSync(log,result.stdout+result.stderr);
  assert.equal(result.status,expectError?1:0,name+': unexpected exit\n'+result.stdout+result.stderr);
  outputsUnchanged(name);
  let report;
  if(expectError){
    assert.match(result.stderr,expectError,name+': failure did not identify the violated guard');
    assert(fs.readFileSync(path.join(clone,registry)).equals(before),name+': registry was changed on failure');
  }else{
    report=JSON.parse(result.stdout.trim());
    assert.equal(report.status,'PASS');assert.equal(report.artifacts,97);assert.equal(report.checkedBeforeWrite,97);
    assert.equal(report.writes,merge?1:0,'Only a successful new registry entry may be written');
    preserveEntries(seed,JSON.parse(fs.readFileSync(path.join(clone,registry))));
  }
  rows.push({name,status:'PASS',expectedCliExit:expectError?1:0,actualCliExit:result.status,elapsedMs:Date.now()-started,unchangedOutputs:97,log,...(report?{report}:{message:result.stderr.trim()})});
}
try{
  const fd=fs.openSync(path.join(evidence,'clone.log'),'w');
  try{execFileSync('git',['clone','--local','--no-hardlinks','--config','core.autocrlf=false',root,clone],{stdio:['ignore',fd,fd]});}
  finally{fs.closeSync(fd);}
  execFileSync('git',['checkout','--detach',head],{cwd:clone,stdio:'pipe'});
  // Before the feature is committed, exercise the exact proposed CLI in a real
  // accepted HEAD checkout. No scratch commit or substitute registry is created.
  fs.writeFileSync(path.join(clone,cli),code);
  assert(fs.readFileSync(path.join(clone,registry)).equals(seedBytes),'Test root registry must match its accepted HEAD');
  outputsUnchanged('clone');
  run('accepted-head-no-op');
  run('used-binding-removed',{mutate:value=>{delete value.bindings[usedId];},expectError:/Missing source bindings: books\/[\w-]+\/v2\/generated\/[^\n]+\([1-9]\d* unique:/});
  run('historical-unused-binding-removed',{mutate:value=>{delete value.bindings[unusedId];},expectError:new RegExp('Removed registry entry: bindings/'+unusedId)});
  run('old-context-value-changed',{mutate:value=>{value.contexts[contextId]={...value.contexts[contextId],value:'UNACCEPTED_REGISTRY_MUTATION'};},expectError:/Invalid contexts identity|Changed registry entry bytes/});
  run('old-entry-order-changed',{mutate:value=>{const entries=Object.entries(value.bindings);[entries[0],entries[1]]=[entries[1],entries[0]];value.bindings=Object.fromEntries(entries);},expectError:/Reordered registry entries: bindings/});
  run('old-context-field-order-changed',{mutate:value=>{value.contexts[contextId]=Object.fromEntries(Object.entries(value.contexts[contextId]).reverse());},expectError:/Changed registry entry bytes: contexts\//});
  const orphanTuple=structuredClone(seed.bindings[unusedId]);
  assert(orphanTuple[1].length,'A retained binding must have a slot for its dependency control');
  orphanTuple[1][0][1]='layouts-0000000000000000';
  const orphanExpanded=Object.fromEntries(orphanTuple[1].map(([slot,layout,refs,contexts,fields])=>[slot,{layout,refs,contexts,...(fields?{fields}:{})}]));
  orphanExpanded.$schema='source-refs/v1';orphanExpanded.$order=orphanTuple[0];
  const orphanId=sourceContentId('bindings',orphanExpanded);
  assert(!Object.hasOwn(seed.bindings,orphanId));
  run('unused-new-binding-missing-layout',{merge:{bindings:{[orphanId]:orphanTuple}},expectError:/Registry binding bindings-[0-9a-f]{16} has missing layout layouts-0000000000000000/});
  const added={kind:'ATTRIBUTE',field:'sourceArtifact',value:'qa://source-catalog-registry/accepted-new-context'};
  const addedId=sourceContentId('contexts',added);assert(!Object.hasOwn(seed.contexts,addedId));
  const shadow=path.join(work,'shadow-inputs');
  for(const file of files){const target=path.join(shadow,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(clone,file),target);}
  fs.appendFileSync(path.join(shadow,files[0]),' ');
  const lastFile=files.at(-1),lastPath=path.join(shadow,lastFile),late=JSON.parse(fs.readFileSync(lastPath));
  const missingBinding='bindings-0000000000000000';assert(!Object.hasOwn(seed.bindings,missingBinding));
  let changed=false;
  function poisonLastBinding(value){
    if(!value||typeof value!=='object'||changed)return;
    if(typeof value.sourceBindings==='string'&&Object.hasOwn(seed.bindings,value.sourceBindings)){value.sourceBindings=missingBinding;changed=true;return;}
    for(const child of Object.values(value))poisonLastBinding(child);
  }
  poisonLastBinding(late);assert(changed,lastFile+': the late control needs an existing shared binding');
  fs.writeFileSync(lastPath,JSON.stringify(late)+'\n');
  assert.notEqual(sha(fs.readFileSync(path.join(shadow,files[0]))),sourceBefore.get(files[0]),'The early output must have a pending byte change');
  const escapedLast=lastFile.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  run('late-input-failure-is-atomic',{inputRoot:shadow,merge:{contexts:{[addedId]:added}},expectError:new RegExp('Missing source bindings: '+escapedLast+' \\(1 unique: '+missingBinding+'\\)')});
  run('valid-context-appended',{merge:{contexts:{[addedId]:added}}});
  const appended=JSON.parse(fs.readFileSync(path.join(clone,registry)));
  assert.equal(Object.keys(appended.contexts).length,Object.keys(seed.contexts).length+1);
  assert.deepEqual(appended.contexts[addedId],added);
  assert.deepEqual(rows.at(-1).report.appended,{documents:0,layouts:0,contexts:1,bindings:0});
  completed=true;
  console.log(JSON.stringify({status:'PASS',controls:rows.length,unchangedOutputsPerControl:97,head,cliSha256:sha(code),evidence}));
}finally{
  for(const [file,digest]of sourceBefore)assert.equal(sha(fs.readFileSync(path.join(root,file))),digest,'The original source output was modified: '+file);
  assert(fs.readFileSync(path.join(root,registry)).equals(seedBytes),'The original source registry was modified');
  fs.writeFileSync(path.join(evidence,'RESULTS.json'),JSON.stringify({status:completed?'PASS':'FAIL',head,cliSha256:sha(code),usedId,usedBy:used.get(usedId),unusedId,contextId,outputs:files,rows},null,2)+'\n');
  cleanupQaTempDir(work);
}
