/** Read-only byte attribution and a bounded source-catalog serialization model. */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const [baseline,feature,out]=process.argv.slice(2);
const read=(root,file)=>fs.readFileSync(path.join(root,file));
const b=JSON.parse(read(baseline,'PAGES_RUNTIME_MANIFEST.json')),f=JSON.parse(read(feature,'PAGES_RUNTIME_MANIFEST.json'));
const before=new Map(b.files.map(row=>[row.path,row]));
const keys=['sourceRefs','sourceBindings','sourceOwnership','sourceSchema','sourceRefCatalog','sourceLayoutCatalog','sourceContextCatalog'];
const bytes=value=>Buffer.byteLength(JSON.stringify(value,null,2)+'\n');
const compact=value=>JSON.stringify(value);
const hash=value=>createHash('sha256').update(compact(value)).digest('hex').slice(0,16);
const tables={documents:{},refs:{},layouts:{},contexts:{},bindings:{}},categories={},byKind={},files=[];
function intern(pool,value){const id=hash(value);if(tables[pool][id]&&compact(tables[pool][id])!==compact(value))throw Error('Collision');tables[pool][id]=value;return id;}
function attrs(value,category,kind){const n=Buffer.byteLength(compact(value));categories[category]=(categories[category]||0)+n;const key=kind+'/'+category;byKind[key]=(byKind[key]||0)+n;}
const compactFields=new Set(['sourceRefs','sourceBindings','sourceOwnership','sourceSchema','fieldProvenance']);
function packedJSON(value){const fragments=[];const text=JSON.stringify(value,(key,child)=>{if(compactFields.has(key)){const i=fragments.push(compact(child))-1;return `__SOURCE_FRAGMENT_${i}__`;}return child;},2);return text.replace(/"__SOURCE_FRAGMENT_(\d+)__"/g,(_,i)=>fragments[Number(i)])+'\n';}
let packedBytes=0;
for(const row of f.files){const old=before.get(row.path),delta=row.bytes-(old?.bytes||0);let proposed=row.bytes;
 if(row.path.endsWith('.json')&&row.path.includes('/v2/generated/')){
  const value=JSON.parse(read(feature,row.path)),book=row.path.split('/')[1];tables.documents[book]||={};
  for(const [id,ref]of Object.entries(value.sourceRefCatalog||{})){
   const doc=Object.fromEntries(Object.entries(ref).filter(([key])=>!['locators','textSha256','documentRole'].includes(key)));
   const did=hash(doc);tables.documents[book][did]=doc;
   tables.refs[id]={documentId:did,bookId:book,...Object.fromEntries(Object.entries(ref).filter(([key])=>['locators','textSha256','documentRole'].includes(key)))};
  }
  Object.assign(tables.layouts,value.sourceLayoutCatalog);Object.assign(tables.contexts,value.sourceContextCatalog);
  function walk(node,kind='OTHER'){
   if(!node||typeof node!=='object')return;kind=node.kind||kind;
   for(const key of keys)if(Object.hasOwn(node,key))attrs(node[key],key,kind);
   if(node.sourceBindings){const id=intern('bindings',node.sourceBindings);node.sourceBindings=id;}
   for(const key of ['sourceRefCatalog','sourceLayoutCatalog','sourceContextCatalog'])delete node[key];
   for(const [key,child]of Object.entries(node))if(!keys.includes(key)&&key!=='fieldProvenance')walk(child,kind);
  }walk(value);
  proposed=Buffer.byteLength(packedJSON(value));
 }
 packedBytes+=proposed;files.push({path:row.path,baselineBytes:old?.bytes||0,currentBytes:row.bytes,delta,modeledBytes:proposed});
}
const externalBytes=Buffer.byteLength(compact(tables)+'\n');
const result={baselineBytes:b.runtimeBytes,currentBytes:f.runtimeBytes,currentDelta:f.runtimeBytes-b.runtimeBytes,modeledBytes:packedBytes+externalBytes,modeledDelta:packedBytes+externalBytes-b.runtimeBytes,externalBytes,externalPools:Object.fromEntries(Object.entries(tables).map(([key,value])=>[key,{entries:Object.keys(value).length,bytes:Buffer.byteLength(compact(value))}])),categories,byKind,files:files.sort((a,b)=>b.delta-a.delta)};
fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');fs.writeFileSync(out+'.prototype-catalog.json',compact(tables)+'\n');
console.log(JSON.stringify({...result,byKind:undefined,files:result.files.slice(0,12)},null,2));
