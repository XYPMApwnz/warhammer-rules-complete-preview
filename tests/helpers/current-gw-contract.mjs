/** Current GW text may replace only its exact historical source field. */
import assert from 'node:assert/strict';
import {isDeepStrictEqual} from 'node:util';
import {resolveOfficialUpdateTarget} from '../../books/shared/official-updates-v1/apply.mjs';

const equal=isDeepStrictEqual;
const at=(value,field)=>field.reduce((host,key)=>host?.[key],value);
const object=value=>value!==null&&typeof value==='object';
const textKinds=new Set(['ABILITY_TEXT','ARMY_RULE_TEXT','DETACHMENT_RULE_TEXT','ENHANCEMENT_TEXT','STRATAGEM_TEXT']);

/** No names, substring replacement, logical-field normalization or fixture edits. */
export function currentGwContractExpectation(historicalRows,{historicalBook,currentBook,document}){
 const result=structuredClone(historicalRows),authorized=[];
 if(document.stage!=='canonical-facts')return{rows:result,authorized};
 for(const entry of document.entries){
  if(!textKinds.has(entry.kind)||!['SET','REPLACE_FRAGMENT'].includes(entry.operation)||
     typeof entry.expectedBefore!=='string'||typeof entry.after!=='string'||entry.expectedBefore===entry.after)continue;
  const old=resolveOfficialUpdateTarget(historicalBook,document,entry),current=resolveOfficialUpdateTarget(currentBook,document,entry);
  const before=at(old.data,entry.target.field),after=at(current.data,entry.target.field);
  if(equal(before,after))continue; // Already-applied historical updates grant no new permission.
  if(!equal(before,entry.expectedBefore))continue;
  assert.equal(after,entry.after,`GW contract ${document.bookId} · ${entry.id}: HEAD field differs from declared after`);
  assert.equal(old.entity.id,current.entity.id,'GW contract stable owner changed');
  const rows=result.filter(row=>row.entityId===old.entity.id);
  if(!rows.length)continue;
  assert.equal(rows.length,1,'GW contract stable owner is not unique');
  const field=entry.target.field;
  assert(rows[0].contract.sourceFields.some(path=>equal(path,field)),`GW contract ${entry.id}: target is not an exact contract source field`);
  const paths=[];
  const visit=(node,path=[])=>{
   if(!object(node))return;
   // sourceText is a projection of one explicitly identified complete field.
   if(typeof node.sourceText==='string'&&node.sourceText===before&&
      Array.isArray(node.sourceFields)&&node.sourceFields.length===1&&equal(node.sourceFields[0],field)){
    node.sourceText=entry.after;paths.push([...path,'sourceText']);
   }
   // An evidence quote is covered only when its own field names this target.
   for(const[key,value]of Object.entries(node)){
    if((key==='evidence'||key==='sourceEvidence')&&object(value)&&
       equal(value.field,field)&&value.quote===before){
     value.quote=entry.after;paths.push([...path,key,'quote']);
    }
    if(key!=='sourceText')visit(value,[...path,key]);
   }
  };
  visit(rows[0].contract);
  assert(paths.length,`GW contract ${entry.id}: no exact source projection is covered`);
  authorized.push({id:entry.id,entityId:old.entity.id,field:structuredClone(field),paths});
 }
 return{rows:result,authorized};
}

export function assertCurrentGwContracts(actual,historicalRows,options){
 const expected=currentGwContractExpectation(historicalRows,options);
 assert.deepEqual(actual,expected.rows,'Existing roles/clauses/effects/conditions/CP/timing/duration changed outside exact applied GW fields');
 return expected.authorized;
}
