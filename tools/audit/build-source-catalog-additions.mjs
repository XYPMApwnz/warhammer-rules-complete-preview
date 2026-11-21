/** Export source definitions from producer outputs; never infer opaque IDs. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {sourceContentId,SOURCE_SCHEMA} from '../../books/shared/source-refs-v2/source-refs.mjs';
import {bindingTuple,documentOf} from '../../books/shared/source-refs-v2/source-serialization.mjs';
import {assertSourceReferenceClosure} from '../../books/shared/source-refs-v2/source-closure.mjs';
import {sourceCatalogFiles,mergeSourceRegistry} from './build-source-catalog.mjs';

const rootDefault=fileURLToPath(new URL('../../',import.meta.url));
const registryFile='books/shared/source-refs-v2/source-catalog.json';
const sections=['documents','layouts','contexts','bindings'];
const catalogKeys=new Set(['sourceRefCatalog','sourceLayoutCatalog','sourceContextCatalog']);
const empty=()=>({documents:{},layouts:{},contexts:{},bindings:{}});
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const sorted=table=>Object.fromEntries(Object.entries(table).sort(([a],[b])=>a<b?-1:a>b?1:0));

function expanded(tuple){
 const [order,entries]=tuple;
 const value=Object.fromEntries(entries.map(([slot,layout,refs,contexts,fields])=>
  [slot,{layout,refs,contexts,...(fields?{fields}:{})}]));
 value.$schema=SOURCE_SCHEMA;value.$order=order;return value;
}

export function exportSourceCatalogAdditions({root=rootDefault,inputRoot=root,catalog,files,baselineRef='HEAD',baselineOutputs}={}){
 root=path.resolve(root);inputRoot=path.resolve(inputRoot);
 catalog??=JSON.parse(fs.readFileSync(path.join(root,registryFile)));
 files??=sourceCatalogFiles(root);
 const delta=empty(),witnesses=[],checked=[],acceptedLocalBindings=new Set();
 // Accepted local declarations stay local. This is an additions exporter, not
 // an implicit migration of every old producer's metadata into shared storage.
 for(const file of files){
  const before=baselineOutputs?.[file]??JSON.parse(execFileSync('git',['show',baselineRef+':'+file],{cwd:root,maxBuffer:64*1024*1024}));
  const visit=node=>{if(!node||typeof node!=='object')return;
   if(node.sourceBindings?.$schema===SOURCE_SCHEMA)acceptedLocalBindings.add(sourceContentId('bindings',node.sourceBindings));
   for(const [key,child]of Object.entries(node))if(!catalogKeys.has(key))visit(child);
  };visit(before);
 }
 function add(kind,id,value,witness,book){
  const identity=kind==='bindings'?expanded(value):value;
  assert.equal(sourceContentId(kind,identity),id,'Invalid producer definition: '+kind+'/'+id);
  const existing=kind==='documents'?catalog.documents[book]?.[id]:catalog[kind][id];
  if(existing){assert(equal(existing,value),'Conflicting existing registry entry: '+kind+'/'+id);return;}
  const target=kind==='documents'?(delta.documents[book]??={}):delta[kind];
  if(Object.hasOwn(target,id))assert(equal(target[id],value),'Conflicting producer definitions: '+kind+'/'+id);
  else target[id]=structuredClone(value);
  witnesses.push({kind,id,...(book?{book}:{}),...witness});
 }
 for(const file of files){
  assert(!path.isAbsolute(file)&&!file.includes('\\')&&!file.split('/').some(p=>!p||p==='..'||p==='.'),'Unsafe producer output path');
  const book=file.split('/')[1],value=JSON.parse(fs.readFileSync(path.join(inputRoot,file)));
  // Validate each file in isolation. Another producer's process-wide pool must
  // never supply a definition absent from this output and the accepted registry.
  const counts=assertSourceReferenceClosure(value,{catalog,bookId:book,label:file});
  function dependency(kind,id,local,pointer){
   const key=kind==='layouts'?'sourceLayoutCatalog':'sourceContextCatalog';
   const definition=local?.[key]?.[id]??catalog[kind][id];
   assert(definition,'Missing producer definition: '+file+' '+kind+'/'+id);
   add(kind,id,definition,{file,pointer});
  }
  function visit(node,local=value,pointer=''){
   if(!node||typeof node!=='object')return;
   if(Array.isArray(node)){node.forEach((child,index)=>visit(child,local,pointer+'/'+index));return;}
   if(node.sourceSchema===SOURCE_SCHEMA)local=node;
   let binding;
   if(node.sourceBindings?.$schema===SOURCE_SCHEMA)binding=node.sourceBindings;
   else if(typeof node.sourceBindings==='string'&&/^bindings-[0-9a-f]{16}$/.test(node.sourceBindings)){
    assert(catalog.bindings[node.sourceBindings],'Opaque binding has no accepted definition: '+file+' '+node.sourceBindings);
    binding=expanded(catalog.bindings[node.sourceBindings]);
   }
   if(binding&&!catalog.bindings[sourceContentId('bindings',binding)]&&!acceptedLocalBindings.has(sourceContentId('bindings',binding))){
    const id=sourceContentId('bindings',binding);
    add('bindings',id,bindingTuple(binding),{file,pointer:pointer+'/sourceBindings'});
    for(const [slot,item]of Object.entries(binding))if(!slot.startsWith('$')){
     dependency('layouts',item.layout,local,pointer+'/sourceBindings/'+slot);
     for(const context of item.contexts)dependency('contexts',context,local,pointer+'/sourceBindings/'+slot);
    }
    for(const [index,ref]of node.sourceRefs.entries()){
     let document;
     if(ref.documentId)document=catalog.documents[book]?.[ref.documentId];
     else{
      const source=local.sourceRefCatalog?.[ref.ref];
      assert(source,'Missing producer reference: '+file+' '+ref.ref);
      document=documentOf(source);
     }
     assert(document,'Missing producer document: '+file+' '+ref.documentId);
     add('documents',sourceContentId('documents',document),document,{file,pointer:pointer+'/sourceRefs/'+index},book);
    }
   }
   for(const [key,child]of Object.entries(node))if(!catalogKeys.has(key)&&!(binding&&['sourceRefs','sourceBindings'].includes(key)))
    visit(child,local,pointer+'/'+key.replaceAll('~','~0').replaceAll('/','~1'));
  }
  visit(value);checked.push({file,...counts});
 }
 for(const book of Object.keys(delta.documents))delta.documents[book]=sorted(delta.documents[book]);
 delta.documents=sorted(delta.documents);
 for(const kind of sections.slice(1))delta[kind]=sorted(delta[kind]);
 // Existing entries cannot be replaced, reordered or silently reserialized.
 const merged=mergeSourceRegistry(catalog,delta);
 for(const [id,tuple]of Object.entries(delta.bindings))for(const [,layout,,contexts]of tuple[1]){
  assert(merged.layouts[layout],'Unresolved exported layout dependency: '+id);
  for(const context of contexts)assert(merged.contexts[context],'Unresolved exported context dependency: '+id);
 }
 const counts={documents:Object.values(delta.documents).reduce((n,table)=>n+Object.keys(table).length,0),
  ...Object.fromEntries(sections.slice(1).map(kind=>[kind,Object.keys(delta[kind]).length]))};
 return {delta,counts,checked,witnesses};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const args=process.argv.slice(2),option=name=>args.find(arg=>arg.startsWith(name+'='))?.slice(name.length+1);
  for(const arg of args)assert(arg==='--check'||['--inputs=','--out=','--report=','--baseline='].some(prefix=>arg.startsWith(prefix)),'Unknown option: '+arg);
  assert(args.includes('--check')||option('--out'),'Use --out=<delta.json> or --check');
  const result=exportSourceCatalogAdditions({inputRoot:option('--inputs')||rootDefault,baselineRef:option('--baseline')||'HEAD'});
  if(args.includes('--check'))assert(Object.values(result.counts).every(n=>n===0),'Unmerged source definitions; export the delta and review it before an explicit registry merge');
  // All producer outputs and definition dependencies have passed before writes.
  if(option('--out'))fs.writeFileSync(option('--out'),JSON.stringify(result.delta)+'\n');
  if(option('--report'))fs.writeFileSync(option('--report'),JSON.stringify({...result,status:'PASS'},null,2)+'\n');
  console.log(JSON.stringify({status:'PASS',files:result.checked.length,additions:result.counts,empty:Object.values(result.counts).every(n=>n===0)}));
 }catch(error){console.error(error.stack||error);process.exitCode=1;}
}
