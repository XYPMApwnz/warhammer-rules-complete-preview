/** Source-span policy QA over native constructed physical snapshots.
 * This is neither battle simulation nor evidence of a real New Recruit export.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildDarkAngelsContracts} from './rule-contract-build.mjs';
import {buildDarkAngelsImportBook} from './roster-import-build.mjs';
import {createDarkAngelsRuleSchema} from './rule-contract-schema.mjs';
import {buildGameplayPresentation} from './gameplay-presentation-build.mjs';
import {conditionalPolicyDeclarations,activeConditionalPolicyKinds} from './conditional-policy-declarations.mjs';
import {validateRoster,changeAttachment,formRoster} from '../../shared/roster-v2/context.mjs';
import {executeRosterEffects,validateRosterEffects} from '../../shared/roster-v2/effects.mjs';
import {projectEffectiveInstance} from '../../shared/roster-v2/effective-instance.mjs';
import {projectInstanceCards} from '../../shared/army-book-app-v2/personal.mjs';
const clone=structuredClone,built=buildDarkAngelsContracts(),book=buildDarkAngelsImportBook({built});
const records=new Map(book.entities.map(row=>[row.id,row]));
const ledger=JSON.parse(fs.readFileSync(new URL('./rule-clause-review.json',import.meta.url),'utf8'));
const sources=new Map(ledger.records.map(row=>[row.id,row]));
const cards=new Map(buildGameplayPresentation(built).cards.map(card=>[card.id,card]));
const active=conditionalPolicyDeclarations.filter(row=>activeConditionalPolicyKinds.includes(row.kind));
const cases=[],checks=[],check=(id,fn)=>{fn();checks.push({id,status:'PASS'});};
const DA={intercessors:'unit-sm-59162946fee84360',sammael:'unit-da-0e189995095847bf9d47',vengeance:'unit-da-48fe8c59ed2449e1a36b',inner:'detachment-da-7e310c5c15914267a0ae',darkflight:'detachment-da-d7c1a2b23f2e443aa22a'};
const ruleFor=spec=>records.get(sources.get(spec.recordId)?.canonicalId);
const unit=(projection,id)=>projection.units.find(row=>row.instanceId===id);
const policies=(projection,id,recordId)=>unit(projection,id).conditional.filter(row=>row.policy&&(!recordId||row.clauseId===recordId));
function physical(instanceId,unitId,{enhancement}={}){
 const canonical=records.get(unitId);assert.equal(canonical?.kind,'DATASHEET');
 const modelRows=canonical.data.profileIds.map((canonicalProfileId,index)=>({rowId:'row-'+index,canonicalProfileId,quantity:1,compositionScope:'MODEL_ROW',
  selections:canonical.data.weaponIds.map((weaponId,weapon)=>({selectionKey:`${instanceId}/${index}/weapon/${weapon}`,canonicalProfileIds:[weaponId],canonicalEquipmentIds:[],physicalQuantity:1,perModelQuantity:1}))}));
 return {instanceId,canonicalUnitId:unitId,startingStrength:modelRows.length,modelRows,selections:[],equipmentContextKnown:true,enhancementIds:enhancement?[enhancement]:[],warlord:null};
}
function stateFor(spec){
 const rule=ruleFor(spec),enhancement=rule.kind==='ENHANCEMENT';
 const owner=enhancement?(spec.recordId.includes('fb83cfb304e74056b819')?DA.vengeance:DA.sammael):rule.parentId;
 const state={schema:'roster-v2/roster',bookId:'dark-angels',rosterId:'da-conditional-policy-diagnostic',
  detachments:[{instanceId:'detachment/diagnostic',canonicalDetachmentId:enhancement?rule.parentId:DA.inner}],
  units:[physical('source',owner,{enhancement:enhancement?rule.id:undefined}),physical('peer',owner),physical('unrelated',DA.intercessors)],attachments:[],warlordInstanceId:null};
 if(enhancement&&rule.ruleContract.roles.find(row=>row.id===rule.ruleContract.assignment.ownerRoleId).subject==='MODEL'){
  const verified=validateRoster(book,state,book.rosterAttachmentPolicies),scope=unit(formRoster(book,verified),'source').profiles[0].scopeId;
  state.units[0].enhancementAssignments=[{enhancementId:rule.id,modelScopeId:scope}];
 }
 return state;
}
function project(state,model=book){
 const beforeBook=clone(model),beforeState=clone(state),verified=validateRoster(model,clone(state),model.rosterAttachmentPolicies);
 const schema=createDarkAngelsRuleSchema({state:verified,book:model});
 schema.validateContracts(model);validateRosterEffects(model,schema.validatePredicate,schema.evaluatePredicate);
 const result=executeRosterEffects(model,verified,schema);assert.deepEqual(model,beforeBook);assert.deepEqual(state,beforeState);return result;
}
function withoutPolicies(){const model=clone(book);for(const rule of model.entities)for(const clause of rule.ruleContract?.clauses||[])delete clause.conditionalPolicy;return model;}
const numerical=projection=>{const value=clone(projection);for(const component of value.units)component.conditional=component.conditional.filter(row=>!row.policy);return value;};
function assertInvariant(state,projection){assert.deepEqual(numerical(projection),project(state,withoutPolicies()),'Conditional policy altered calculated values, inventory, scopes, abilities or applied modifier traces');}
function assertRow(row,spec,sourceId='source'){
 const source=sources.get(spec.recordId),rule=ruleFor(spec);
 assert.equal(row.ruleId,rule.id);assert.equal(row.clauseId,spec.recordId);assert.equal(row.sourceInstanceId,sourceId);
 assert.equal(row.state,'UNKNOWN');assert.equal(row.execution,'CONDITIONAL_TEXT_ONLY');assert.equal(row.policy.kind,spec.kind);
 assert.equal(row.policy.recipientScope,spec.recipientScope);assert.deepEqual(row.policy.payload,spec.payload);
 assert.deepEqual(row.policy.evidence,{field:source.field,quote:source.quote});assert.equal(row.policy.contextQuote,source.contextQuote);
 assert.deepEqual(row.sourceProvenance,rule.provenance);
 if(spec.aura)assert.deepEqual(row.policy.aura,spec.aura);
}
check('source-span-ledger-and-kind-activation',()=>{
 assert.equal(conditionalPolicyDeclarations.length,17);assert.equal(new Set(conditionalPolicyDeclarations.map(row=>row.recordId)).size,17);
 for(const spec of conditionalPolicyDeclarations){const source=sources.get(spec.recordId),rule=ruleFor(spec);assert.ok(source&&rule);
  assert.equal(source.sourceEntityId,rule.sourceEntityId);assert.ok(rule.data.text.includes(source.contextQuote));
  const clause=rule.ruleContract.clauses.find(row=>row.id===spec.recordId);assert.ok(clause);
  assert.equal(Boolean(clause.conditionalPolicy),activeConditionalPolicyKinds.includes(spec.kind),'Unapproved conditional capability activated or approved source span omitted');
  if(clause.conditionalPolicy){assert.equal(clause.rosterEffects.length,0);assert.equal(clause.conditionalPolicy.kind,spec.kind);}
 }
});
for(const spec of active){
 check(spec.recordId+'/physical-source-and-non-numeric',()=>{
  const state=stateFor(spec),projection=project(state);assertInvariant(state,projection);
  const own=policies(projection,'source',spec.recordId);assert.equal(own.length,1);assertRow(own[0],spec);cases.push({recordId:spec.recordId,sourceIdentity:sources.get(spec.recordId).sourceEntityId,sourcePhysicalUnitId:state.units[0].canonicalUnitId,sourceInstanceId:own[0].sourceInstanceId,sourceModelScopeId:own[0].sourceModelScopeId,actualPhysicalRecipientIds:own[0].recipientInstanceIds,recipientScope:spec.recipientScope,kind:spec.kind,payload:spec.payload,fullConditions:sources.get(spec.recordId).contextQuote,sourceProvenance:own[0].sourceProvenance,models:unit(projection,'source').profiles.map(m=>({profileId:m.canonicalProfileId,scopeId:m.scopeId,quantity:m.quantity})),status:'CONDITIONAL_TEXT_ONLY',automaticExecution:false});
  assert.deepEqual(own[0].recipientInstanceIds,spec.recipientScope==='AURA_UNRESOLVED'?[]:['source']);
  assert.equal(policies(projection,'unrelated',spec.recordId).length,0);
  const rule=ruleFor(spec),enhancement=rule.kind==='ENHANCEMENT';
  const peer=policies(projection,'peer',spec.recordId);assert.equal(peer.length,enhancement?0:1);
  if(peer.length)assertRow(peer[0],spec,'peer');
  assert.deepEqual(project(JSON.parse(JSON.stringify(state))),projection);assert.deepEqual(project(state),projection);
  const effective=projectEffectiveInstance(book,projection,'source');const effectiveRow=effective.conditional.find(row=>row.clauseId===spec.recordId&&row.policy);assert.ok(effectiveRow);assertRow(effectiveRow,spec);
  const variants=projectInstanceCards(cards,state.units[0],effective),root=variants.get(state.units[0].canonicalUnitId)?.[0];assert.ok(root);
  assert.ok((root.rosterConditionalPolicies||[]).some(row=>row.clauseId===spec.recordId&&row.sourceInstanceId==='source'),'Personal projection lost exact conditional source');
  if(spec.kind==='QUALIFIED_FNP')for(const model of unit(projection,'source').profiles)assert.ok(!model.abilities.some(ability=>ability.name==='Feel No Pain'&&ability.value===spec.payload.threshold),'Qualified FNP became ordinary FNP');
 });
 if(spec.recipientScope==='AURA_UNRESOLVED')check(spec.recordId+'/aura-unresolved-no-recipient-inference',()=>{
  const state=stateFor(spec);state.units.push(physical('second-friendly',DA.intercessors));const projection=project(state);assertInvariant(state,projection);
  for(const component of projection.units){const own=policies(projection,component.instanceId,spec.recordId);
   if(['source','peer'].includes(component.instanceId)){assert.equal(own.length,1);assert.deepEqual(own[0].recipientInstanceIds,[]);}else assert.equal(own.length,0);
  }
 });
 const rule=ruleFor(spec);
 if(rule.kind==='ENHANCEMENT')check(spec.recordId+'/assignment-remove-reselect-and-bearer',()=>{
  const state=stateFor(spec),projection=project(state),row=policies(projection,'source',spec.recordId)[0];
  if(state.units[0].enhancementAssignments?.length)assert.equal(row.sourceModelScopeId,state.units[0].enhancementAssignments[0].modelScopeId);
  const removed=clone(state);removed.units[0].enhancementIds=[];removed.units[0].enhancementAssignments=[];
  assert.equal(policies(project(removed),'source',spec.recordId).length,0);assert.deepEqual(project(state),projection);
  if(state.units[0].enhancementAssignments?.length){const wrong=clone(state);wrong.units[0].enhancementAssignments[0].modelScopeId='foreign/physical/model';assert.throws(()=>project(wrong));}
 });
 if(spec.recipientScope==='FORMED_UNIT'&&rule.kind!=='ENHANCEMENT'){
  const relation=book.rosterAttachmentPolicies?.find(row=>row.sourceId===rule.parentId&&row.role==='LEADER');
  if(relation)check(spec.recordId+'/accepted-attachment-detach-reattach',()=>{
   let state=stateFor(spec);state.units[2]=physical('unrelated',relation.targetId);state.units.push(physical('second-bodyguard',relation.targetId));
   state=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','source','unrelated');let projection=project(state);assertInvariant(state,projection);
   const row=policies(projection,'unrelated',spec.recordId).find(row=>row.sourceInstanceId==='source');assert.ok(row);assertRow(row,spec);assert.deepEqual(row.recipientInstanceIds.slice().sort(),['source','unrelated']);
   assert.equal(policies(projection,'second-bodyguard',spec.recordId).length,0);
   state=changeAttachment(book,state,book.rosterAttachmentPolicies,'DETACH','source');projection=project(state);assert.equal(policies(projection,'unrelated',spec.recordId).filter(row=>row.sourceInstanceId==='source').length,0);
   state=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','source','second-bodyguard');projection=project(state);assertInvariant(state,projection);
   assert.ok(policies(projection,'second-bodyguard',spec.recordId).some(row=>row.sourceInstanceId==='source'));assert.equal(policies(projection,'unrelated',spec.recordId).filter(row=>row.sourceInstanceId==='source').length,0);
  });
 }
}
console.log(JSON.stringify({status:'PASS',activeKinds:activeConditionalPolicyKinds,activeSourceSpans:active.length,checks:checks.length,results:checks,cases,conditionalOnly:true,realNewRecruitExportTested:false}));
