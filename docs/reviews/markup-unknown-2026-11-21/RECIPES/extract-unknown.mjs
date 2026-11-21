/** Read-only native inputs; no builders, tests, roster mutations or decisions written. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const root='E:/Warhammer/worktrees/markup-unknown-v1';
const out='E:/Warhammer/qa-evidence/markup-unknown-v1-2026-11-21';
const {collectNativeInventory,inventoryFingerprint}=await import(pathToFileURL(root+'/tools/markup-census/native-inventory.mjs'));
const {parseProducerJSON}=await import(pathToFileURL(root+'/books/shared/source-refs-v2/producer-io.mjs'));
const census=JSON.parse(fs.readFileSync(out+'/CENSUS_BEFORE.json'));assert.equal(census.status,'PASS');
const expected=census.rows.filter(row=>row.category==='UNKNOWN'),keys=new Set(expected.map(row=>row.book+'\0'+row.id));
assert.equal(keys.size,171);
const inventory=await collectNativeInventory({root});
const byBook=new Map();
const unknown=inventory.rows.filter(row=>keys.has(row.book+'\0'+row.id));assert.equal(unknown.length,171);
for(const row of unknown){assert.equal(row.sourceFingerprint,expected.find(r=>r.book===row.book&&r.id===row.id).sourceFingerprint);if(!byBook.has(row.book))byBook.set(row.book,[]);byBook.get(row.book).push(row);}
const at=(node,field)=>field.reduce((node,key)=>node?.[key],node);
const omit=new Set(['provenance','sourceRefs','sourceBindings','fieldProvenance','sourceEvidence','executable','conditionalOnly']);
const factual=value=>Array.isArray(value)?value.map(factual):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([key])=>!omit.has(key)).map(([key,v])=>[key,factual(v)])):value;
const title=entity=>entity?.data?.title||entity?.data?.name||entity?.displayName||entity?.data?.label||entity?.id||null;
const rows=[];
for(const[book,list]of byBook){
 const first=list[0],raw=parseProducerJSON(fs.readFileSync(path.join(root,first.nativeInput),'utf8'));
 const runtime=first.nativeFactory.templateConstructor?await import(pathToFileURL(`${root}/books/${book}/v2/roster-runtime.mjs`)):null;
 const native=runtime?runtime[first.nativeFactory.templateConstructor](raw).book:raw;
 const entities=new Map(native.entities.map(entity=>[entity.id,entity]));
 for(const row of list){
  const entity=entities.get(row.sourceEntityId);assert(entity,row.book+' '+row.id);
  const owner=entities.get(row.ownerId),chain=[];let parent=entities.get(entity.parentId||entity.ownerId),seen=new Set();
  while(parent&&!seen.has(parent.id)){seen.add(parent.id);chain.push({id:parent.id,name:title(parent),kind:parent.kind});parent=entities.get(parent.parentId||parent.ownerId);}
  const sourceValues=row.sourceFields.map(field=>{const value=at(entity.data,field),snapshot=row.sourceSnapshot.fields.find(s=>JSON.stringify(s.field)===JSON.stringify(field));assert(snapshot?.present);assert.equal(inventoryFingerprint(factual(value)),snapshot.fingerprint);return{field,value};});
  const current=expected.find(r=>r.book===row.book&&r.id===row.id);
  rows.push({...row,currentDecision:current,owner:{id:row.ownerId,name:title(owner),kind:owner?.kind,data:owner?.data||null},sourceData:entity.data,sourceValues,parentChain:chain,fullRuleContract:entity.ruleContract||null,
   siblingEntities:chain[0]?.id?native.entities.filter(e=>(e.parentId||e.ownerId)===chain[0].id&&['KEYWORD_SCOPES','KEYWORD_MEMBERSHIP','UNIT_COMPOSITION','LEADER','ATTACHMENT_DECLARATION'].includes(e.kind)).map(e=>({id:e.id,kind:e.kind,data:e.data})):[]});
 }
}
rows.sort((a,b)=>a.book.localeCompare(b.book,'en')||a.id.localeCompare(b.id,'en'));
fs.mkdirSync(out+'/analysis-input',{recursive:true});fs.writeFileSync(out+'/analysis-input/ALL_UNKNOWN.json',JSON.stringify({base:'6f2e5fb23643fc0041efcd7006f3e150bd5ce4be',N:171,supportedOperations:inventory.supportedOperations,books:inventory.books,rows},null,2)+'\n');
for(const book of byBook.keys())fs.writeFileSync(out+'/analysis-input/'+book+'.json',JSON.stringify({base:'6f2e5fb23643fc0041efcd7006f3e150bd5ce4be',supportedOperations:inventory.supportedOperations,rows:rows.filter(row=>row.book===book)},null,2)+'\n');
fs.writeFileSync(out+'/NATIVE_EXTRACTION.json',JSON.stringify({status:'PASS',source:'Actual collectNativeInventory, producer JSON decoder and the same SM-family template constructors; no builders or writes to checkout',N:171,sourceFingerprintsMatched:true,sourceFieldFingerprintsMatched:true,inputs:inventory.inputs,counts:Object.fromEntries([...byBook].map(([book,list])=>[book,list.length]))},null,2)+'\n');
console.log(JSON.stringify({status:'PASS',N:171,counts:Object.fromEntries([...byBook].map(([book,list])=>[book,list.length])),output:out+'/analysis-input'}));
