/** All nine generated trees, or every JSON input in a published package.
 * node books/shared/source-refs-v2/source-closure-qa.mjs [--package PATH]
 * A deleted document row must fail without help from warm reader/compiler pools. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {assertSourceReferenceClosure} from './source-closure.mjs';
export const sourceBookIds=['adeptus-mechanicus','blood-angels','chaos-space-marines','dark-angels','death-guard','emperors-children','space-marines','tau-empire','tyranids'];
export function checkSourceClosureTree(root,{packaged=false,negative=true}={}){
 const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
 const catalog=read('books/shared/source-refs-v2/source-catalog.json');
 const generated=sourceBookIds.flatMap(id=>{
  const dir=`books/${id}/v2/generated`;
  if(!fs.existsSync(path.join(root,dir)))return [];
  return fs.readdirSync(path.join(root,dir),{recursive:true}).filter(file=>file.endsWith('.json')).map(file=>dir+'/'+file.replaceAll('\\','/'));
 }).sort();
 assert.deepEqual([...new Set(generated.map(file=>file.split('/')[1]))].sort(),sourceBookIds.slice().sort(),'All nine source trees must be present');
 if(!packaged)assert.equal(generated.length,97,'Exact generated JSON inventory');
 const files=packaged?read('PAGES_RUNTIME_MANIFEST.json').files.map(row=>row.path).filter(file=>file.endsWith('.json')&&file!=='books/shared/source-refs-v2/source-catalog.json').sort():generated;
 const artifacts=[],samples=new Map();
 for(const file of files){
  const document=read(file),bookId=/^books\/([^/]+)\/v2\/generated\//.exec(file)?.[1];
  const counts=assertSourceReferenceClosure(document,{catalog,bookId,label:file});
  artifacts.push({path:file,bookId:bookId||null,...counts});
  if(bookId&&!samples.has(bookId)){
   function find(node){if(!node||typeof node!=='object'||samples.has(bookId))return;if(node.sourceRefs?.some(ref=>ref.documentId)){samples.set(bookId,node);return;}for(const child of Object.values(node))find(child);}
   find(document);
  }
 }
 const controls=[];
 if(negative)for(const bookId of sourceBookIds){
  const record=samples.get(bookId);assert.ok(record,bookId+': actual document-bound record');
  const ref=record.sourceRefs.find(ref=>ref.documentId),broken={...catalog,documents:{...catalog.documents,[bookId]:{...catalog.documents[bookId]}}};
  delete broken.documents[bookId][ref.documentId];
  assert.throws(()=>assertSourceReferenceClosure(record,{catalog:broken,bookId,label:bookId}),/Missing source documents entry/,bookId+': removed own-table document must fail');
  controls.push({bookId,mutation:'delete referenced document from its own table',status:'REJECTED'});
 }
 return {status:'PASS',scope:packaged?'PUBLISHED_PACKAGE':'ALL_GENERATED',books:sourceBookIds.length,files:files.length,generatedFiles:generated.length,records:artifacts.reduce((n,row)=>n+row.records,0),references:artifacts.reduce((n,row)=>n+row.references,0),controls,artifacts};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const at=process.argv.indexOf('--package'),root=at<0?fileURLToPath(new URL('../../../',import.meta.url)):path.resolve(process.argv[at+1]);
 const report=checkSourceClosureTree(root,{packaged:at>=0});
 const out=process.argv.indexOf('--out');if(out>=0)fs.writeFileSync(process.argv[out+1],JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({...report,artifacts:undefined}));
}
