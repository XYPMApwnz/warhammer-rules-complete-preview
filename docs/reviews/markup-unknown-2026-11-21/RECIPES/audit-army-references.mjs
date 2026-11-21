import fs from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const root='E:/Warhammer/worktrees/markup-unknown-v1',out='E:/Warhammer/qa-evidence/markup-unknown-v1-2026-11-21';
const input=JSON.parse(fs.readFileSync(out+'/analysis-input/ALL_UNKNOWN.json'));
const {parseProducerJSON}=await import(pathToFileURL(root+'/books/shared/source-refs-v2/producer-io.mjs'));
const labels=['Combat Doctrines','Librarius','Transhuman Strategist','Mission Tactics'],books=[];
for(const book of['space-marines','dark-angels','blood-angels']){
 const row=input.rows.find(r=>r.book===book),raw=parseProducerJSON(fs.readFileSync(root+'/'+row.nativeInput,'utf8'));
 const runtime=await import(pathToFileURL(`${root}/books/${book}/v2/roster-runtime.mjs`));
 const native=runtime[row.nativeFactory.templateConstructor](raw).book,index=new Map(native.entities.map(e=>[e.id,e]));
 const refs=native.entities.filter(e=>e.kind==='RULE_REFERENCE'&&labels.includes(e.data?.label)).map(e=>{
  const owner=index.get(e.parentId||e.ownerId);const membership=[...(owner?.ruleReferenceIds||[]),...(owner?.data?.ruleReferenceIds||[])];
  return{id:e.id,sourceEntityId:e.sourceEntityId||null,parentId:e.parentId||e.ownerId,ownerName:owner?.data?.name||owner?.data?.title||null,ownerListsReference:membership.includes(e.id),data:e.data,
   canonicalTarget:e.armyRuleId||e.targetId||e.canonicalRuleId||e.data.armyRuleId||e.data.targetId||e.data.canonicalRuleId||e.data.href||null,
   provenance:e.provenance||null};
 });
 const counts=Object.fromEntries(labels.map(label=>[label,refs.filter(e=>e.data.label===label).length]));
 assert(refs.every(ref=>ref.data.scope==='SOURCE_DECLARATION'&&ref.data.recipientBindingStatus==='NOT_EXECUTABLE'));
 books.push({book,nativeInput:row.nativeInput,counts,canonicalTargetCount:refs.filter(ref=>ref.canonicalTarget!==null).length,refs});
}
const report={status:'PASS',purpose:'Read-only evidence of source-declared reference ownership, not a rule-to-recipient join or new factual mapping',books};
fs.writeFileSync(out+'/ARMY_REFERENCE_AUDIT.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',books:books.map(({book,counts,canonicalTargetCount})=>({book,counts,canonicalTargetCount}))}));
