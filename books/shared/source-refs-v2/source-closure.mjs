// Static publication closure. Never consult process-wide reader pools: another
// book or a preceding compiler run must not make a dangling reference valid.
import {SOURCE_SCHEMA,sourceContentId} from './source-refs.mjs';

const own=(value,key)=>Object.hasOwn(value||{},key);
const catalogKeys=new Set(['sourceRefCatalog','sourceLayoutCatalog','sourceContextCatalog']);
export function assertSourceReferenceClosure(value,{catalog,bookId,label='source document'}={}){
 const counts={records:0,references:0,fieldReferences:0,bindings:0,layouts:0,contexts:0};
 const fail=message=>{throw Error(label+': '+message);};
 const verified=new Set();
 function entry(kind,id,local){
  const key=kind==='refs'?'sourceRefCatalog':kind==='layouts'?'sourceLayoutCatalog':'sourceContextCatalog';
  const item=local?.[key]?.[id]??catalog?.[kind]?.[id];
  if(!item)fail('Missing source '+kind+' entry: '+id);
  const cacheKey=kind+':'+id;
  if(!verified.has(cacheKey)){if(sourceContentId(kind,item)!==id)fail('Source catalog content changed: '+id);verified.add(cacheKey);}
  return item;
 }
 function bindingOf(node){
  if(node.sourceBindings?.$schema===SOURCE_SCHEMA)return node.sourceBindings;
  if(typeof node.sourceBindings!=='string'||!node.sourceBindings.startsWith('bindings-'))return null;
  const id=node.sourceBindings,raw=catalog?.bindings?.[id];
  if(!raw)fail('Missing source bindings entry: '+id);
  const [order,entries]=raw,binding=Object.fromEntries(entries.map(([slot,layout,refs,contexts,fields])=>[slot,{layout,refs,contexts,...(fields?{fields}:{})}]));
  binding.$schema=SOURCE_SCHEMA;binding.$order=order;
  if(sourceContentId('bindings',binding)!==id)fail('Source catalog content changed: '+id);
  return binding;
 }
 function reference(item,local){
  if(item?.documentId){
   const document=catalog?.documents?.[bookId]?.[item.documentId];
   if(!document)fail('Missing source documents entry in '+bookId+': '+item.documentId);
   if(sourceContentId('documents',document)!==item.documentId)fail('Source catalog content changed: '+item.documentId);
   const ref={...document,...Object.fromEntries(Object.entries(item).filter(([key])=>!['documentId','referenceId'].includes(key)))};
   if(own(item,'ref')||sourceContentId('refs',ref)!==item.referenceId)fail('Source reference content changed: '+item.referenceId);
   return item.referenceId;
  }
  if(typeof item?.ref!=='string'||!/^refs-[0-9a-f]{16}$/.test(item.ref))fail('Invalid source reference');
  entry('refs',item.ref,local);return item.ref;
 }
 function visit(node,local=value,ownerRefs){
  if(!node||typeof node!=='object')return;
  if(Array.isArray(node)){for(const child of node)visit(child,local,ownerRefs);return;}
  if(node.sourceSchema===SOURCE_SCHEMA)local=node;
  const bindings=bindingOf(node);let recordRefs=ownerRefs;
  if(bindings){
   counts.records++;counts.bindings++;if(!Array.isArray(node.sourceRefs))fail('Invalid sourceRefs array');
   const ids=node.sourceRefs.map(item=>reference(item,local));counts.references+=ids.length;recordRefs=new Set(ids);
   for(const [slot,binding]of Object.entries(bindings))if(!slot.startsWith('$')){
    const layout=entry('layouts',binding.layout,local);counts.layouts++;
    function check(part){
     if(part.type==='VALUE'){
      if(part.pool==='refs'){const index=binding.refs[part.index];if(!Number.isInteger(index)||!ids[index])fail('Invalid source reference index');}
      else if(part.pool==='contexts'){entry('contexts',binding.contexts[part.index],local);counts.contexts++;}
      else fail('Invalid source layout pool');
     }else if(part.type==='ARRAY')part.items.forEach(check);
     else if(part.type==='OBJECT')part.entries.forEach(([,child])=>check(child));
     else fail('Invalid source layout');
    }check(layout);
   }
  }
  // Field maps refer to the enclosing record's exact sourceRefs, not to any
  // reference that happened to have been read earlier in this process.
  if(typeof node.ref==='string'&&/^refs-[0-9a-f]{16}$/.test(node.ref)){
   if(!recordRefs?.has(node.ref))entry('refs',node.ref,local);
   counts.fieldReferences++;
  }
  if(/^documents-[0-9a-f]{16}$/.test(node.documentId||'')||/^refs-[0-9a-f]{16}$/.test(node.referenceId||''))reference(node,local);
  for(const [key,child]of Object.entries(node))if(!catalogKeys.has(key)&&
   !(bindings&&(key==='sourceBindings'||key==='sourceRefs')))visit(child,local,recordRefs);
 }
 visit(value);return counts;
}
