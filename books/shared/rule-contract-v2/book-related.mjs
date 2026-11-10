/** Build-only Army Book compatibility. Runtime/physical roster contracts are inputs,
 * never mutated; this module neither executes rules nor invents battle state. */
import assert from 'node:assert/strict';
import {prepareSourceProducer} from '../source-refs-v2/producer-io.mjs';
import {createCompatibilityCompiler,summarizeCompatibility} from './compatibility.mjs';
import {buildAttachmentFeasibility} from '../roster-v2/compatibility-feasibility.mjs';

import {enhancementBearerEligible,epicHeroUnitIds,enhancementEligibilityState} from '../roster-v2/compatibility-context.mjs';
const clone=structuredClone;
const unknown={state:'UNKNOWN',applicability:'CONDITIONAL',roles:[]};

/** Reuse explicit physical keyword/composition/reference bindings. The union is
 * only a UNIT's own MODELs; possible attached components remain UNKNOWN. */
export function createBookCompatibilityInputs(source){
 const book=prepareSourceProducer(source),index=new Map(book.entities.map(e=>[e.id,e]));
 // This compiler's domain is rule eligibility, not datasheet effect execution.
 // Preserve every factual entity/evidence owner, but do not submit unrelated
 // physical execution contracts as pairwise compatibility authority.
 for(const entity of book.entities)if(entity.ruleContract&&!['ENHANCEMENT','STRATAGEM'].includes(entity.ruleContract.kind)&&
  !entity.ruleContract.clauses.some(clause=>clause.keywordProjection))delete entity.ruleContract;
 const units=book.entities.filter(e=>e.kind==='DATASHEET');
 for(const e of book.entities)if(e.kind==='MODEL_PROFILE')e.kind='PROFILE';
 const referenceSemantics=Object.fromEntries(book.entities.filter(e=>e.kind==='RULE_REFERENCE').map(e=>[e.id,
  (book.rosterReferenceSemantics?.[e.id]?.abilities||[]).map(ability=>ability.name).filter(Boolean)]));
 const profileBindings=units.flatMap(unit=>unit.data.profileIds.map(profileId=>{
  const explicit=book.rosterProfileBindings?.find(row=>row.unitId===unit.id&&row.profileId===profileId);
  assert(explicit||!unit.data.keywordGroups,'Mixed MODEL keywords require explicit source bindings');
  const intrinsicKeywords=clone(explicit?.intrinsicKeywords||[...unit.data.keywords,...unit.data.factionKeywords]);
  const abilities=unit.data.ruleReferenceIds.flatMap(id=>{
   const ref=book.rosterReferenceSemantics?.[id];
   return ref&&(!ref.modelProfileIds||ref.modelProfileIds.includes(profileId))?(ref.abilities||[]).map(a=>a.name).filter(Boolean):[];
  });
  return {unitId:unit.id,profileId,intrinsicKeywords,abilities};
 }));
 for(const unit of units)unit.data.keywords=[...new Set([...unit.data.keywords,
  ...profileBindings.filter(row=>row.unitId===unit.id).flatMap(row=>row.intrinsicKeywords).filter(k=>!unit.data.factionKeywords.includes(k))])];
 // An Army Book does not know ARMY_UNIT_PRESENT. All source-declared possible
 // relations contribute capability bounds, without claiming any attachment.
 const declarations=book.mfmImportReferences?.relationDeclarations;
 if(!book.rosterAttachmentPolicies?.length&&declarations?.length)book.rosterAttachmentPolicies=declarations
  .filter(row=>index.get(row.sourceId)?.kind==='DATASHEET').flatMap(row=>row.targets
  .filter(target=>target.status==='BOUND'&&index.get(target.entityId)?.kind==='DATASHEET')
  .map(target=>({sourceId:row.sourceId,targetId:target.entityId,role:row.role.toUpperCase(),additionalLeaders:0,
   sourceIds:[row.sourceDeclarationId],mfmReferenceId:row.mfmRecordId})));
 assert(Array.isArray(book.rosterAttachmentPolicies),'Missing source-owned attachment bindings');
 const composition=profileBindings.map(binding=>{
  const rows=book.importBindings?.compositions?.filter(row=>row.ownerId===binding.unitId&&row.profileId===binding.profileId);
  const members=book.entities.filter(e=>e.kind==='COMPOSITION_MEMBER'&&e.parentId===binding.unitId&&e.data.modelProfileId===binding.profileId&&e.data.quantity);
  const maximum=rows?.length?rows.reduce((n,r)=>n+r.quantity.max,0):members.reduce((n,r)=>n+r.data.quantity.max,0);
  // Same conservative bound as the existing physical SM adapter, never a
  // composition/profile identity or a fabricated single MODEL.
  const native=book.mfmImportReferences?.nativePoints?.units?.find(row=>row.id===binding.unitId);
  const maxModels=maximum||(native?Math.max(...native.points.map(row=>row.maxModels)):null);
  assert(Number.isSafeInteger(maxModels)&&maxModels>0,'Unresolved physical composition bound: '+binding.profileId);
  return {...binding,maxModels};
 });
 book.compatibilityFeasibility=buildAttachmentFeasibility(book,composition);
 return {book,profileBindings,referenceSemantics,attachmentRelations:book.rosterAttachmentPolicies};
}

export function createBookCompatibilityCompiler(source,evaluator){
 const inputs=createBookCompatibilityInputs(source),owners=new WeakMap(inputs.book.entities
  .filter(e=>e.ruleContract?.kind==='ENHANCEMENT').map(e=>[e.ruleContract.roles[0],e.ruleContract]));
 // The existing general Enhancement rule: a MODEL bearer must be a CHARACTER.
 // UNIT upgrades keep their explicit UNIT selectors. No contract is rewritten.
 const bookEvaluator={...evaluator,evaluateRole:(role,conditions,context)=>owners.has(role)&&!enhancementBearerEligible(owners.get(role),role,context)?'FALSE':evaluator.evaluateRole(role,conditions,context)};
 return {book:inputs.book,compiler:createCompatibilityCompiler({...inputs,evaluator:bookEvaluator})};
}

export function buildUnboundBookRelatedRules(source,evaluator,{unitIds,ruleIds}={}){
 const {book,compiler}=createBookCompatibilityCompiler(source,evaluator);
 return buildBookRelatedRules({book,compiler,unitIds,ruleIds,format:{sort:false,roleSummary:true},unbound:true,
  deferredRuleIds:book.entities.filter(e=>e.kind==='STRATAGEM'&&!e.ruleContract?.compatibilityRoleIds?.length).map(e=>e.id)});
}

/** One Cartesian builder, preserving declared legacy wire formats. Fact adapters
 * supply compilers, not pairwise answers; no bookId/faction branch lives here. */
export function buildBookRelatedRules({book,compiler,format={},unitIds,ruleIds,unbound=false,deferredRuleIds=[]}){
 const kinds=['STRATAGEM','ENHANCEMENT'],base=compiler.compileRows({kinds,order:'UNIT_RULE',sort:format.sort!==false});
 const selected=compiler.compileRows({kinds,order:'UNIT_RULE',sort:format.sort!==false,
  contextForRule:rule=>({detachmentId:rule.ruleContract.detachmentId})});
 const chosen=new Map(selected.rows.map(row=>[row.unitId+'\0'+row.ruleId,row]));
 const pairs=new Map(base.rows.map(row=>[row.unitId+'\0'+row.ruleId,row]));
 const units=book.entities.filter(e=>e.kind==='DATASHEET'&&(!unitIds||unitIds.includes(e.id)));
 const rules=book.entities.filter(e=>kinds.includes(e.kind)&&(!ruleIds||ruleIds.includes(e.id))&&
  (format.sort===false||kinds.includes(e.ruleContract?.kind)));
 const byId=new Map(book.entities.map(e=>[e.id,e]));
 const epicOwners=epicHeroUnitIds(book);
 const result=value=>{
  if(!value)return clone(unknown);
  const roles=format.roleSummary?value.roles.map(({roleId,subject,state})=>({roleId,subject,state})):value.roles;
  return {state:unbound&&value.state==='TRUE'?'UNKNOWN':value.state,
   applicability:unbound&&value.state==='TRUE'?'CONDITIONAL':value.applicability,roles};
 };
 const domain=format.sort===false?units.flatMap(unit=>rules.map(rule=>[unit.id,rule.id])):
  base.rows.filter(row=>units.some(u=>u.id===row.unitId)&&rules.some(r=>r.id===row.ruleId)).map(row=>[row.unitId,row.ruleId]);
 const rows=domain.map(([unitId,ruleId])=>{
  const rule=byId.get(ruleId),key=unitId+'\0'+ruleId,detachmentId=rule.ruleContract?.detachmentId||rule.parentId;
  assert.equal(byId.get(detachmentId)?.kind,'DETACHMENT','Unresolved parent Detachment: '+ruleId);
  const identity=format.detachmentBeforeKind?{unitId,ruleId,detachmentId,kind:rule.ruleContract?.kind||rule.kind}:
   {unitId,ruleId,kind:rule.kind,detachmentId};
  const deferred=deferredRuleIds.includes(ruleId);
  const row={...identity,...result(deferred?null:pairs.get(key)),selectedDetachment:result(deferred?null:chosen.get(key))};
  // Source roles still report their literal book selectors. The independent
  // Core bearer restriction overrides the final Enhancement eligibility only.
  for(const evaluated of [row,row.selectedDetachment]){
    const restricted=enhancementEligibilityState(row.kind,epicOwners.has(unitId),evaluated.state);
    if(restricted!==evaluated.state){evaluated.state=restricted;evaluated.applicability='NO_MATCH';}
  }
  return row;
 });
 assert(rows.every(row=>row.state!=='INVALID'&&row.selectedDetachment.state!=='INVALID'),'Invalid book applicability');
 const output={schema:'army-book-related-rules/v2',authority:'DISPOSABLE_PROJECTION'};
 if(format.queryPurpose)output.queryPurpose=format.queryPurpose;
 output.contextPolicy=clone(format.contextPolicy||{roster:'UNKNOWN',battle:'UNKNOWN',formation:'UNKNOWN'});
 output.coreStratagemsStatus='DEFERRED_NEEDS_CONTRACTS';
 if(format.summary)output.summary={units:units.length,stratagems:rules.filter(r=>r.kind==='STRATAGEM').length,
  enhancements:rules.filter(r=>r.kind==='ENHANCEMENT').length,rows:rows.length,
  allDetachments:summarizeCompatibility(rows),selectedDetachment:summarizeCompatibility(rows.map(r=>r.selectedDetachment))};
 output.rows=rows;return output;
}
