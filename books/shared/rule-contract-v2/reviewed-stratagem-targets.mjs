/** Source-reviewed Stratagem TARGET declarations. No battle payload is lowered. */
import assert from 'node:assert/strict';
import {bindCanonicalContract} from './bindings.mjs';
const clone=structuredClone;
const at=(data,path)=>path.reduce((value,key)=>value?.[key],data);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

/** Append TARGET roles to real contracts, preserving every prior clause/role. */
export function recordReviewedStratagemTargets(book,declarations,{contracts=[]}={}){
 const index=new Map(book.entities.map(e=>[e.id,e])),seen=new Set();
 assert.equal(index.size,book.entities.length,'Duplicate canonical entity');
 for(const row of declarations){
  const {ruleId,field,quote,role}=row,entity=index.get(ruleId);
  assert(!seen.has(ruleId),'Duplicate Stratagem TARGET declaration');seen.add(ruleId);
  assert(entity?.kind==='STRATAGEM'&&(!entity.bookId||entity.bookId===book.bookId)&&!entity.factOwnerId,
   'Expected one book-owned Stratagem');
  assert.equal(index.get(entity.parentId)?.kind,'DETACHMENT','TARGET Detachment missing');
  assert.equal(entity.data.title,row.title,'TARGET source title changed');
  assert(Array.isArray(field)&&field.length&&typeof quote==='string'&&quote.trim(),'Malformed TARGET proof');
  const source=at(entity.data,field);
  // Both accepted factual forms: an explicitly labelled line, or a literal
  // TARGET line within the native SM-family text. Never borrow WHEN/EFFECT.
  if(same(field,['text']))assert(source?.split('\n').includes(quote)&&quote.startsWith('TARGET: '),'Expected exact TARGET line');
  else assert(field.length===3&&field[0]==='lines'&&field[2]==='text'&&
   entity.data.lines[field[1]]?.label.replace(/:$/,'')==='TARGET'&&source===quote,'Expected labelled TARGET field');
  assert.equal(role?.id,'compatibility-target');assert.equal(role.purpose,'TARGET');
  assert(['UNIT','MODEL'].includes(role.subject)&&['FRIENDLY','ENEMY'].includes(role.allegiance));
  assert(same(role.evidence,{field,quote}),'TARGET role evidence differs');
  const visit=node=>{
   if(node.op){assert(['ALL','ANY','NOT'].includes(node.op)&&Array.isArray(node.args)&&node.args.length&&
    (node.op!=='NOT'||node.args.length===1),'Invalid target Boolean');node.args.forEach(visit);return;}
   assert.equal(node.subject,role.subject,'TARGET predicate subject differs');
   assert(same(node.evidence,{field,quote}),'TARGET selector lacks exact source proof');
   assert(['UNIT_KEYWORD','MODEL_KEYWORD','UNIT_ID','MODEL_ID','FIELD'].includes(node.predicate),'Unsupported target predicate');
   if(node.predicate==='FIELD')assert(node.contextLevel==='BATTLE'&&same(node.arguments,{key:'battleConditionSatisfied',equals:true}),'Invented battle evaluator');
   else{assert.equal(node.contextLevel,'STATIC');
    if(node.predicate.endsWith('_ID'))assert.equal(index.get(node.arguments.id)?.kind,node.predicate==='UNIT_ID'?'DATASHEET':'PROFILE','Unresolved canonical TARGET');}
  };
  visit(role.selector);assert.equal(role.conditions.length,1,'Explicit battle applicability required');visit(role.conditions[0]);
  const before=JSON.stringify(entity.data),existing=entity.ruleContract;
  if(existing){
   assert.equal(existing.kind,'STRATAGEM');assert.equal(existing.ruleId,ruleId);
   assert(!existing.compatibilityRoleIds?.length&&!existing.roles.some(r=>['TARGET','PRIMARY_TARGET'].includes(r.purpose)||r.id===role.id),'Existing target authority');
   existing.roles.push(clone(role));existing.compatibilityRoleIds=[role.id];
   if(!existing.sourceFields.some(path=>same(path,field)))existing.sourceFields.push(clone(field));
  }else{
   assert(Array.isArray(entity.data.lines),'New Stratagem requires structured accepted source');
   const declaration={kind:'STRATAGEM',executionMode:'BATTLE_ACTION',contextLevel:'BATTLE',detachmentId:entity.parentId,
    cp:entity.data.cp,timing:clone(entity.data.lines.filter(line=>line.label.replace(/:$/,'')==='WHEN')),
    duration:[],restrictions:clone(entity.data.lines.filter(line=>line.label.replace(/:$/,'')==='RESTRICTIONS')),
    sourceFields:[clone(field)],roles:[clone(role)],compatibilityRoleIds:[role.id],conditions:[],clauses:[]};
   assert(declaration.timing.length,'Missing accepted WHEN');
   entity.ruleContract=bindCanonicalContract({entity,bookId:book.bookId,schema:'rule-contract/v2',index,declaration,
    currentness:{acceptedBaseHead:'427796be5d29766acedc59338537f04667c0ba67',factualOwner:clone(entity.provenance)}});
   contracts.push(entity.ruleContract);
  }
  assert.equal(JSON.stringify(entity.data),before,'TARGET enrollment mutated factual payload');
 }
 return {recorded:seen.size};
}
