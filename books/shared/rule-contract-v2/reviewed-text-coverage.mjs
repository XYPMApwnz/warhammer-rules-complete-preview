/** Producer-only, explicitly reviewed text coverage. No source grammar or effects. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {bindCanonicalContract,bindDeclarationClauses} from './bindings.mjs';

const copy=structuredClone;
const at=(value,field)=>field.reduce((node,key)=>node?.[key],value);
export const textFieldPointer=field=>'/'+field.map(key=>String(key).replaceAll('~','~0').replaceAll('/','~1')).join('/');
export const textCoverageClauseId=field=>'text-coverage:'+textFieldPointer(field);
export const textCoverageHash=value=>createHash('sha256').update(value).digest('hex');

/** Canonical source text only. Army roots retain their real component owners. */
export function reviewedTextFields(book){
 const index=new Map(book.entities.map(entity=>[entity.id,entity])),rows=[];
 for(const entity of book.entities){
  const fields=[];
  if(['ENHANCEMENT','DETACHMENT_RULE','ARMY_RULE_COMPONENT'].includes(entity.kind)||entity.kind==='ARMY_RULE'&&typeof entity.data.text==='string'){
   if(typeof entity.data.text==='string'&&entity.data.text.trim())fields.push(['text']);
  }else if(entity.kind==='DATASHEET_SECTION'){
   for(const [i,block]of (entity.data.blocks||[]).entries())if(typeof block.text==='string'&&block.text.trim())fields.push(['blocks',i,'text']);
   if(!fields.length&&typeof entity.data.text==='string'&&entity.data.text.trim())fields.push(['text']);
  }else if(entity.kind==='STRUCTURED_RULE_TABLE'&&index.get(entity.parentId)?.kind==='DETACHMENT_RULE'){
   for(const [i,row]of (entity.data.rows||[]).entries())for(const [j,cell]of row.entries())if(typeof cell==='string'&&cell.trim())fields.push(['rows',i,j]);
  }
  for(const field of fields)rows.push({entity,field,text:at(entity.data,field)});
 }
 return rows;
}

/** New non-executable clauses share the existing typed contract/finalize path.
 * Review data owns classification, literal evidence and static owner eligibility.
 * Existing clauses and participants are never rewritten by this producer. */
export function appendReviewedTextCoverage({book,facts,review,contracts,currentness}){
 assert.equal(review.schema,'reviewed-rule-text-coverage/v1');assert.equal(review.bookId,book.bookId);
 assert.equal(review.factualFingerprint,textCoverageHash(JSON.stringify(facts)),'Unreviewed factual text coverage input');
 const index=new Map(book.entities.map(entity=>[entity.id,entity]));assert.equal(index.size,book.entities.length);
 const fields=reviewedTextFields(book),available=new Map(fields.map(row=>[row.entity.id+'\0'+textFieldPointer(row.field),row]));
 const seen=new Set(),groups=new Map(),existing=new Map(book.entities.filter(e=>e.ruleContract).map(e=>[e.id,copy(e.ruleContract)]));
 for(const row of review.records){
  const key=row.ruleId+'\0'+textFieldPointer(row.field),source=available.get(key);
  assert(source&&!seen.has(key),'Unresolved/duplicate reviewed text field: '+key);seen.add(key);
  assert.equal(row.quote,source.text,'Reviewed source paragraph changed: '+key);
  assert.equal(row.sourceFieldSha256,textCoverageHash(source.text),'Reviewed paragraph fingerprint changed');
  assert(['BATTLE_ONLY','DISPLAY_ONLY','NOT_AN_EFFECT'].includes(row.classification)&&row.reason?.trim(),'Unclassified source text');
  if(row.preserveExisting){
   const prior=existing.get(row.ruleId);assert(prior,'Preserved contract is missing');
   assert(prior.clauses.some(clause=>clause.sourceFields.some(field=>JSON.stringify(field)===JSON.stringify(row.field))),
    'Preserved contract does not cover this source paragraph');continue;
  }
  if(existing.has(row.ruleId))assert.equal(row.appendToExisting,true,'Changing an existing contract requires explicit source review');
  else assert(!row.appendToExisting,'Append target has no existing contract');
  const list=groups.get(row.ruleId)||[];list.push(row);groups.set(row.ruleId,list);
 }
 assert.deepEqual([...seen].sort(),[...available.keys()].sort(),'Source text review coverage incomplete');
 const added=[];
 for(const [id,rows]of groups){
  const entity=index.get(id),old=entity.ruleContract,first=rows[0],enhancement=entity.kind==='ENHANCEMENT';
  assert(entity.kind!=='STRATAGEM'&&!entity.factOwnerId,'Foreign/Stratagem coverage owner');
  const ownerSpec=review.enhancementOwners?.[id];if(enhancement)assert(ownerSpec,'Missing reviewed Enhancement owner eligibility');
  const proof={field:copy(first.field),quote:first.quote};
  const owner=old?copy(old.roles[0]):{id:'owner',subject:ownerSpec?.subject||'UNIT',purpose:'OWNER',allegiance:'FRIENDLY',
   selector:ownerSpec?copy(ownerSpec.selector):{predicate:'ALWAYS',subject:'UNIT',contextLevel:'STATIC',arguments:{},evidence:proof},conditions:[]};
  const clauses=rows.map(row=>{
   const evidence={field:copy(row.field),quote:row.quote};
   const conditions=row.classification==='BATTLE_ONLY'?[{predicate:'FIELD',subject:owner.subject,contextLevel:'BATTLE',
    arguments:{key:'battleConditionSatisfied',equals:true},evidence:copy(evidence)}]:[];
   if(row.leadingEvidence){
    assert(row.quote.includes(row.leadingEvidence),'Unproven leading text condition');
    conditions.push({predicate:'LEADING',subject:owner.subject,contextLevel:'ROSTER',arguments:{value:true},
     evidence:{field:copy(row.field),quote:row.leadingEvidence}});
   }
   return {id:textCoverageClauseId(row.field),roles:[copy(owner)],conditions,sourceFields:[copy(row.field)],evidence,sourceText:row.quote,
    rosterClassification:row.classification,rosterClassificationNote:{reason:row.reason,reviewClassification:'REVIEWED_TEXT_ONLY'},rosterEffects:[]};
  });
  if(old){
   for(const clause of clauses){assert(!old.clauses.some(c=>c.id===clause.id),'Duplicate appended source clause');old.clauses.push(clause);
    for(const field of clause.sourceFields)if(!old.sourceFields.some(p=>JSON.stringify(p)===JSON.stringify(field)))old.sourceFields.push(copy(field));}
   for(const prior of existing.get(id).clauses)assert.deepEqual(old.clauses.find(c=>c.id===prior.id),prior,'Existing clause changed');
  }else{
   const declaration={kind:enhancement?'ENHANCEMENT':entity.kind==='DETACHMENT_RULE'?'DETACHMENT_RULE':entity.kind.startsWith('ARMY_RULE')?'ARMY_RULE':entity.kind==='DATASHEET_SECTION'?'DATASHEET_ABILITY':'OTHER_RULE',
    executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:clauses.some(c=>c.rosterClassification==='BATTLE_ONLY')?'BATTLE':'STATIC',
    roles:[owner],conditions:[],sourceFields:[],clauses};
   if(enhancement||entity.kind==='DETACHMENT_RULE')declaration.detachmentId=entity.parentId;
   // Import already owns all physical Enhancement assignments. Adding an
   // assignment here would change the existing import/eligibility boundary.
   const contract=bindCanonicalContract({entity,bookId:book.bookId,schema:'rule-contract/v2',index,
    declaration:bindDeclarationClauses(declaration),currentness:{...copy(currentness),factualOwner:copy(entity.provenance)}});
   entity.ruleContract=contract;contracts.push(contract);
  }
  added.push({ruleId:id,appendedToExisting:Boolean(old),clauseIds:clauses.map(c=>c.id)});
 }
 return {reviewedFields:fields.length,added};
}
