/** Browser JSON transport stays lazy while Node source validation stays cold. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {loadRuntimeJSON,loadSourceCatalog,catalogValue,catalogBinding} from '../books/shared/source-refs-v2/source-catalog.mjs';
import {createQaTempDir,cleanupQaTempDir,qaTempEnvironment} from './helpers/qa-temp.mjs';

const moduleURL=new URL('../books/shared/source-refs-v2/source-catalog.mjs',import.meta.url);
const catalogURL=new URL('../books/shared/source-refs-v2/source-catalog.json',import.meta.url);
const catalogText=fs.readFileSync(catalogURL,'utf8'),expected=JSON.parse(catalogText);
const materialize=value=>JSON.parse(JSON.stringify(value));
const expanded=raw=>{
 const [order,entries]=raw;
 return {...Object.fromEntries(entries.map(([slot,layout,refs,contexts,fields])=>[slot,{layout,refs,contexts,...(fields?{fields}:{})}])),
  $schema:'source-refs/v1',$order:order};
};
const sampleIds=Object.keys(expected.bindings).filter((_,i,ids)=>i===0||i===Math.floor(ids.length/2)||i===ids.length-1);

if(!process.argv.includes('--browser-worker')){
 let fetches=0;
 const failFetch=()=>{fetches++;throw Error('Node file reads must not fetch');};
 assert.deepEqual(await loadSourceCatalog({fetch:failFetch}),expected);
 const documents=new Map();
 for(const table of Object.values(expected.documents))for(const [id,value]of Object.entries(table))documents.set(id,value);
 for(const [id,value]of documents)assert.deepEqual(catalogValue('documents',id),value);
 for(const kind of ['layouts','contexts'])for(const [id,value]of Object.entries(expected[kind]))assert.deepEqual(catalogValue(kind,id),value);
 for(const id of sampleIds){assert.deepEqual(catalogBinding(id),expanded(expected.bindings[id]));assert.equal(catalogBinding(id),catalogBinding(id));}
 assert.equal(catalogValue('unknown','missing'),undefined);assert.equal(catalogBinding('missing'),undefined);
 const a=loadRuntimeJSON(catalogURL,{fetch:failFetch}),b=loadRuntimeJSON(catalogURL.href,{fetch:failFetch});
 assert.equal(a,b);assert.equal(await a,await loadSourceCatalog());assert.equal(fetches,0);
 const scratch=createQaTempDir('wh-browser-json-node-');let passed=false;
 try{
  const file=path.join(scratch,'retry.json'),url=new URL('file:///'+file.replaceAll('\\','/'));
  await assert.rejects(loadRuntimeJSON(url),/ENOENT/);
  fs.writeFileSync(file,'{"value":"accepted"}\n');
  const value=await loadRuntimeJSON(url,{fetch:failFetch});assert.deepEqual(value,{value:'accepted'});
  assert.equal(await loadRuntimeJSON(url),value);assert.equal(fetches,0);passed=true;
 }finally{if(passed)cleanupQaTempDir(scratch);}
 const worker=spawnSync(process.execPath,['--experimental-vm-modules',fileURLToPath(import.meta.url),'--browser-worker'],
  {encoding:'utf8',env:qaTempEnvironment(),maxBuffer:1024*1024});
 assert.equal(worker.status,0,worker.stdout+'\n'+worker.stderr);
 const result=JSON.parse(worker.stdout.trim().split(/\r?\n/).at(-1));assert.equal(result.status,'PASS');
 console.log(JSON.stringify({status:'PASS',node:{fullCatalogEquality:true,documentIds:documents.size,
  layouts:Object.keys(expected.layouts).length,contexts:Object.keys(expected.contexts).length,
  representativeBindings:sampleIds.length,synchronousReadsPreserved:true,fileReadsFetches:fetches,fileFailureRetry:true},browser:result}));
}else{
 const source=fs.readFileSync(moduleURL,'utf8'),base='https://runtime.invalid/books/shared/source-refs-v2/source-catalog.mjs';
 const open=async fetch=>{
  const context=vm.createContext({URL,fetch});
  assert.equal(vm.runInContext('typeof process',context),'undefined','The browser branch must not inherit Node globals');
  const module=new vm.SourceTextModule(source,{context,identifier:base,initializeImportMeta(meta){meta.url=base;}});
  await module.link(()=>{throw Error('The runtime loader must have no module dependencies');});await module.evaluate();return module.namespace;
 };
 let fetches=0,parses=0;
 const api=await open(async url=>{fetches++;assert.equal(url.href,new URL('./source-catalog.json',base).href);
  return {ok:true,json(){parses++;return JSON.parse(catalogText);}};});
 assert.equal(fetches,0,'Importing the browser module must not load the catalog');
 assert.throws(()=>api.catalogValue('documents','missing'),/Source catalog is not loaded/);
 assert.throws(()=>api.catalogBinding('missing'),/Source catalog is not loaded/);
 const p=api.loadSourceCatalog(),q=api.loadSourceCatalog();assert.equal(p,q);
 const [value]=await Promise.all([p,q,api.loadRuntimeJSON(new URL('./source-catalog.json',base))]);
 assert.deepEqual(materialize(value),expected);assert.equal(fetches,1);assert.equal(parses,1);
 for(const id of sampleIds)assert.deepEqual(materialize(api.catalogBinding(id)),expanded(expected.bindings[id]));
 assert.equal(await api.loadSourceCatalog(),value);assert.equal(fetches,1);assert.equal(parses,1);

 let genericFetches=0,genericParses=0;
 const generic=await open(async url=>{genericFetches++;assert.equal(url.href,'https://runtime.invalid/config.json');
  return {ok:true,json(){genericParses++;return {keywords:['INFANTRY']};}};});
 const first=generic.loadRuntimeJSON('https://runtime.invalid/config.json'),same=generic.loadRuntimeJSON(new URL('https://runtime.invalid/config.json'));
 assert.equal(first,same);const config=await first;assert.equal(config,await same);assert.equal(genericFetches,1);assert.equal(genericParses,1);
 await generic.loadRuntimeJSON('https://runtime.invalid/config.json',{fetch(){throw Error('A warm read cannot fetch');}});
 assert.equal(genericFetches,1);assert.equal(genericParses,1);

 const retries=[];
 for(const mode of ['network','http','json']){
  let calls=0,reads=0;
  const retry=await open(async()=>{
   calls++;
   if(mode==='network'&&calls===1)throw Error('Injected network failure');
   return {ok:!(mode==='http'&&calls===1),json(){reads++;if(mode==='json'&&calls===1)throw new SyntaxError('Injected JSON failure');return {accepted:true};}};
  });
  const url='https://runtime.invalid/'+mode+'.json',bad=retry.loadRuntimeJSON(url),shared=retry.loadRuntimeJSON(url);
  assert.equal(bad,shared);await assert.rejects(bad,mode==='http'?/Runtime JSON unavailable/:/Injected/);
  assert.equal(calls,1);assert.deepEqual(materialize(await retry.loadRuntimeJSON(url)),{accepted:true});assert.equal(calls,2);
  assert.equal(reads,mode==='json'?2:1);retries.push({mode,calls,parses:reads});
 }
 let attempts=0;
 const conflict=await open(async()=>({ok:true,json(){attempts++;return attempts===1?
  {documents:{a:{'documents-same':{document:'first'}},b:{'documents-same':{document:'second'}}},layouts:{},contexts:{},bindings:{}}:JSON.parse(catalogText);}}));
 await assert.rejects(conflict.loadSourceCatalog(),/Conflicting source document identity/);
 assert.throws(()=>conflict.catalogValue('documents','documents-same'),/Source catalog is not loaded/,'A failed install publishes no partial catalog');
 assert.deepEqual(materialize(await conflict.loadSourceCatalog()),expected);assert.equal(attempts,2);
 let raceCalls=0,rejectFirst;
 const race=await open(()=>{
  raceCalls++;if(raceCalls===1)return new Promise((resolve,reject)=>{rejectFirst=reject;});
  return Promise.resolve({ok:true,json(){return JSON.parse(catalogText);}});
 });
 const ready=race.loadSourceCatalog(),rejected=assert.rejects(ready,/Injected retry race/);
 const recovered=race.loadRuntimeJSON(new URL('./source-catalog.json',base))
  .catch(()=>race.loadRuntimeJSON(new URL('./source-catalog.json',base)));
 await Promise.resolve();rejectFirst(new Error('Injected retry race'));
 await Promise.all([rejected,recovered]);await race.loadSourceCatalog();
 assert.equal(raceCalls,2,'An old failure cannot evict a newer successful retry');
 console.log(JSON.stringify({status:'PASS',startupCatalogRequests:0,catalogFetches:fetches,catalogParses:parses,
  genericFetches,genericParses,concurrentReadsSharePromise:true,failedReadsRetry:retries,conflictingDocumentRetry:true,
  partialInstallRejected:true,concurrentRetryPreserved:true}));
}
