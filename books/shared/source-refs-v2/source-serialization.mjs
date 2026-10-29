// Producer-only serialization. No game facts or text are reconstructed here.
import {sourceContentId,getSourceBindings} from './source-refs.mjs';
import {catalogValue} from './source-catalog.mjs';
const catalogKeys=['sourceRefCatalog','sourceLayoutCatalog','sourceContextCatalog'];
const compactKeys=new Set(['sourceRefs','sourceBindings','sourceOwnership','sourceSchema',...catalogKeys]);
const referenceKeys=new Set(['locators','textSha256','documentRole']);
export const documentOf=ref=>Object.fromEntries(Object.entries(ref).filter(([key])=>!referenceKeys.has(key)));
export const bindingTuple=value=>[value.$order,Object.entries(value).filter(([key])=>!key.startsWith('$')).map(([slot,b])=>[slot,b.layout,b.refs,b.contexts,...(b.fields?[b.fields]:[])])];
export function compactSourceJSON(value){
 function write(node,depth=0,key='',parent){
  if(compactKeys.has(key)||key==='fieldProvenance'&&parent?.sourceBindings)return JSON.stringify(node);
  if(!node||typeof node!=='object')return JSON.stringify(node);
  const pad='  '.repeat(depth),inner=pad+'  ';
  if(Array.isArray(node))return node.length?'[\n'+node.map(child=>inner+write(child,depth+1,'',node)).join(',\n')+'\n'+pad+']':'[]';
  const entries=Object.entries(node).filter(([,child])=>child!==undefined);
  return entries.length?'{\n'+entries.map(([name,child])=>inner+JSON.stringify(name)+': '+write(child,depth+1,name,node)).join(',\n')+'\n'+pad+'}':'{}';
 }return write(value)+'\n';
}
export function externalizeSources(value,{tables,bookId=value.bookId||value.book?.id,collect=false,shared=true}={}){
 const refs=value.sourceRefCatalog||{},layouts=value.sourceLayoutCatalog||{},contexts=value.sourceContextCatalog||{};
 const encoded=new Map();
 for(const [id,ref]of Object.entries(refs)){
  const doc=documentOf(ref),documentId=sourceContentId('documents',doc);
  if(collect){tables.documents[bookId]||={};tables.documents[bookId][documentId]=doc;}
  if(collect||tables?.documents?.[bookId]?.[documentId]||catalogValue('documents',documentId))encoded.set(id,{documentId,referenceId:id,...Object.fromEntries(Object.entries(ref).filter(([key])=>referenceKeys.has(key)))});
 }
 if(collect&&shared){Object.assign(tables.layouts,layouts);Object.assign(tables.contexts,contexts);}
 function walk(node){
  if(!node||typeof node!=='object')return;
  const bindings=typeof node.sourceBindings==='string'&&node.sourceBindings.startsWith('bindings-')?undefined:getSourceBindings(node);
  if(bindings){
   node.sourceRefs=node.sourceRefs.map(item=>encoded.get(item.ref)||item);
   const id=sourceContentId('bindings',bindings);
   if(collect&&shared)tables.bindings[id]=bindingTuple(bindings);
   if(collect&&shared||tables?.bindings?.[id]||catalogValue('bindings',id))node.sourceBindings=id;
  }
  for(const [key,child]of Object.entries(node))if(!compactKeys.has(key)&&key!=='fieldProvenance')walk(child);
 }
 walk(value);
 const retained=Object.fromEntries(Object.entries(refs).filter(([id])=>!encoded.has(id)));
 if(Object.keys(retained).length)value.sourceRefCatalog=retained;else delete value.sourceRefCatalog;
 if(collect&&shared){delete value.sourceLayoutCatalog;delete value.sourceContextCatalog;}
 else{
  for(const [key,kind]of [['sourceLayoutCatalog','layouts'],['sourceContextCatalog','contexts']]){
   const remaining=Object.fromEntries(Object.entries(value[key]||{}).filter(([id])=>!tables?.[kind]?.[id]&&!catalogValue(kind,id)));
   if(Object.keys(remaining).length)value[key]=remaining;else delete value[key];
  }
 }
 return value;
}
