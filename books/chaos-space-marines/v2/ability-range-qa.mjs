/** Current canonical source -> typed range declarations -> shared runtime.
 * This capability probe does not wire CSM import, presentation UI or unrelated effects. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildCSMContracts} from './rule-contract-build.mjs';
import {assertReviewedBuiltInventory} from './built-contract-inventory-qa.mjs';
import {buildCSMImportBook} from './roster-import-build.mjs';
import {buildCSMAttachmentInputs} from './roster-attachment-build.mjs';
import {changeAttachment,validateRoster,withRosterDetachments} from '../../shared/roster-v2/context.mjs';
import {executeRosterEffects,validateRosterEffects} from '../../shared/roster-v2/effects.mjs';

const ruleId='detachment-cult-of-the-arkifane:enhancement:4',detachmentId='detachment-cult-of-the-arkifane';
const built=buildCSMContracts(),clone=value=>structuredClone(value);
const productionPolicies=buildCSMAttachmentInputs(buildCSMImportBook(built.facts),
  JSON.parse(fs.readFileSync(new URL('./roster-attachment-bindings.json',import.meta.url),'utf8'))).policies;
const abilityIds=[0,1,2].map(index=>`datasheet-warpsmith:section:1:block:${index}:text`),baseRanges=[3,3,12];
const expectedSource='WARPSMITH model only. Add 3" to the range of the bearer’s Warpsmith, Master of Mechanisms and Enrage Machine Spirits abilities.';
const source=built.facts.entities.find(entity=>entity.id===ruleId),factsById=new Map(built.facts.entities.map(entity=>[entity.id,entity]));
assert.equal(source.data.text,expectedSource);assert.ok(source.provenance.length);
const declaration=built.declarations.get(ruleId),role=declaration.roles[0];
assert.equal(declaration.contextLevel,'ROSTER');assert.equal(declaration.detachmentId,detachmentId);
assert.equal(declaration.assignment.identity,'EXACT_PHYSICAL_INSTANCE_MODEL_PROFILE');
assert.equal(role.subject,'MODEL');assert.equal(role.binding,'SOURCE_MODEL');
assert.deepEqual(role.selector.arguments,{keyword:'WARPSMITH'});
assert.deepEqual(declaration.clauses.map(clause=>clause.effect.parameters.ability.canonicalId),abilityIds);
assert.equal(built.declarations.size,315);
const builtInventory=assertReviewedBuiltInventory(built);
assert.equal([...built.classifications.values()].filter(row=>row.blockers).length,0);
for(const [index,clause] of declaration.clauses.entries()) {
  const canonical=factsById.get(abilityIds[index]),binding=clause.abilityRangeBinding;
  assert.equal(canonical.kind,'DATASHEET_ABILITY');assert.equal(canonical.ownerId,'unit-warpsmith');
  assert.equal(clause.productClassification,'ROSTER_KNOWN');assert.equal(clause.operation,'MODIFY_ABILITY_RANGE');
  assert.deepEqual(clause.effect.parameters,{ability:{canonicalId:canonical.id},mode:'ADD',value:3});
  assert.deepEqual(clause.effectRecipientRoleIds,['owner']);assert.deepEqual(binding.field,['text']);
  assert.equal(binding.baseValue,baseRanges[index]);
  assert.equal(canonical.data.text.slice(binding.start,binding.end),`${binding.baseValue}"`);
  assert.deepEqual(binding.evidence,{otherEntityId:canonical.id,field:['text'],quote:canonical.data.text});
  assert.ok(expectedSource.includes(clause.evidence.quote));
}

function verify({value=3,targetId=abilityIds[0]}={}) {
  const book=clone(built.book);book.rosterProfileBindings=clone(built.profileBindings);
  // Keep this capability fixture intact; bind its missing runtime provenance
  // to the same exact source/target/role used by the production adapter.
  for(const edge of book.rosterAttachmentPolicies){
    const matches=productionPolicies.filter(policy=>policy.sourceId===edge.sourceId&&policy.targetId===edge.targetId&&policy.role===edge.role.toUpperCase());
    assert.equal(matches.length,1,'Unresolved production attachment policy');
    const sourceIds=matches[0].sourceIds;
    assert.ok(Array.isArray(sourceIds)&&sourceIds.length>0,'Missing production attachment provenance');
    assert.ok(sourceIds.includes(edge.sourceEntityId),'Original attachment source evidence lost');
    assert.ok(sourceIds.every(id=>book.entities.some(entity=>entity.id===id&&entity.provenance)),'Unbound canonical attachment provenance');
    edge.sourceIds=clone(sourceIds);
  }
  for(const entity of book.entities)if(entity.id!==ruleId)delete entity.ruleContract;
  const rule=book.entities.find(entity=>entity.id===ruleId),contract=rule.ruleContract;
  contract.assignment.selector=clone(role.selector);
  // Own the canonical ability references explicitly; captions never bind identity.
  book.rosterAbilityReferences={};book.rosterReferenceSemantics={};
  const records=new Map(book.entities.map(entity=>[entity.id,entity]));
  const warpsmith=records.get('unit-warpsmith');
  for(const [index,id] of abilityIds.entries()) {
    const canonical=records.get(id),binding=declaration.clauses[index].abilityRangeBinding;
    book.rosterAbilityReferences[id]={id,title:canonical.displayName,parameters:{range:{type:'number',min:0}},
      rangeBinding:{field:clone(binding.field),start:binding.start,end:binding.end,baseValue:binding.baseValue}};
    book.rosterReferenceSemantics[id]={abilities:[{canonicalId:id,name:canonical.displayName,
      parameters:{range:binding.baseValue},group:'DATASHEET ABILITIES'}]};
  }
  // Same caption, separately owned canonical identity must remain unchanged.
  const otherId='synthetic-independent-ability',sameCaption=records.get(abilityIds[0]).displayName;
  const other={id:otherId,kind:'DATASHEET_ABILITY',parentId:warpsmith.id,displayName:sameCaption,data:{text:'Independent range 3".'}};
  book.entities.push(other);book.rosterAbilityReferences[otherId]={id:otherId,title:sameCaption,
    parameters:{range:{type:'number',min:0}},rangeBinding:{field:['text'],start:18,end:20,baseValue:3}};
  book.rosterReferenceSemantics[otherId]={abilities:[{canonicalId:otherId,name:sameCaption,parameters:{range:3},group:'DATASHEET ABILITIES'}]};
  warpsmith.data.ruleReferenceIds.push(...abilityIds,otherId);
  // The runtime profile bridge uses explicit reference identity for every MODEL.
  for(const binding of book.rosterProfileBindings.filter(binding=>binding.unitId===warpsmith.id))
    binding.referenceIds.push(...abilityIds,otherId);
  contract.clauses.forEach((clause,index)=>{
    clause.rosterClassification='ROSTER_EXECUTABLE';
    clause.rosterEffects=[{id:clause.id+'/effect',operation:clause.operation,
      ...clone(clause.effect.parameters),...(index===0?{ability:{canonicalId:targetId},value}:{}),
      targetSubject:'MODEL',targetBinding:'SOURCE_MODEL',conditions:[{binding:'TARGET',predicate:clone(role.selector)}],
      evidence:clone(clause.evidence),sourceFields:clone(clause.sourceFields),lifetime:'WHILE_ASSIGNED'}];
  });
  const unit=(instanceId,canonicalUnitId,assigned=false)=>{
    const rows=records.get(canonicalUnitId).data.profileIds.map(profileId=>({rowId:profileId,canonicalProfileId:profileId,
      quantity:records.get(profileId).data.composition.quantity.min,selections:[],loadouts:[]}));
    return {instanceId,canonicalUnitId,startingStrength:rows.reduce((n,row)=>n+row.quantity,0),modelRows:rows,
      selections:[],enhancementIds:assigned?[ruleId]:[],warlord:null};
  };
  const state={schema:'roster-v2/roster',bookId:book.bookId,rosterId:'canonical-range-current-source',
    detachments:[{instanceId:'detachment/1',canonicalDetachmentId:detachmentId}],detachmentIds:[detachmentId],
    units:[unit('a','unit-warpsmith',true),unit('b','unit-warpsmith'),unit('bodyguard','unit-chosen'),
      unit('other-bodyguard','unit-chosen'),unit('ineligible','unit-chaos-lord',true)],attachments:[],warlordInstanceId:null};
  const api=withRosterDetachments(built.schema.evaluator),snapshot=JSON.stringify(book);
  validateRosterEffects(book,api.validatePredicate,api.evaluatePredicate);
  const run=state=>executeRosterEffects(book,validateRoster(book,state,book.rosterAttachmentPolicies),api);
  const find=(result,id)=>result.units.find(unit=>unit.instanceId===id);
  const ranges=unit=>abilityIds.map(id=>unit.profiles[0].abilities.find(ability=>ability.canonicalId===id)?.parameters.range);
  const actual=run(state);
  assert.deepEqual(ranges(find(actual,'a')),[6,6,15],'Exact source canonical ability ranges must be 6/6/15');
  assert.deepEqual(ranges(find(actual,'b')),baseRanges,'Unenhanced physical instance changed');
  assert.equal(find(actual,'a').profiles[0].abilities.find(ability=>ability.canonicalId===otherId).parameters.range,3);
  const owner=find(actual,'a');assert.equal(owner.applied.length,3);
  for(const [index,id] of abilityIds.entries()) {
    const proof=owner.applied.find(row=>row.targetAbilityId===id);
    assert.ok(proof,'Canonical ability provenance missing');assert.equal(proof.ruleId,ruleId);
    assert.equal(proof.sourceInstanceId,'a');assert.equal(proof.targetInstanceId,'a');
    assert.equal(proof.targetProfileId,'datasheet-warpsmith:section:2:member:1');
  }
  for(const id of ['bodyguard','other-bodyguard','ineligible'])assert.equal(find(actual,id).applied.length,0,'Effect escaped exact bearer');
  const removed=clone(state);removed.units[0].enhancementIds=[];
  assert.deepEqual(ranges(find(run(removed),'a')),baseRanges);assert.equal(find(run(removed),'a').applied.length,0);
  removed.units[0].enhancementIds=[ruleId];assert.deepEqual(run(removed),actual);
  const switched=clone(state);switched.detachmentIds=['detachment-creations-of-bile'];
  switched.detachments=[{instanceId:'detachment/1',canonicalDetachmentId:switched.detachmentIds[0]}];
  assert.throws(()=>run(switched),/Unresolved Enhancement context/,'Enhancement from an unselected Detachment was accepted');
  const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','a','bodyguard');
  assert.deepEqual(ranges(find(run(attached),'a')),[6,6,15]);assert.equal(find(run(attached),'bodyguard').applied.length,0);
  assert.deepEqual(run(changeAttachment(book,attached,book.rosterAttachmentPolicies,'DETACH','a')),actual);
  const reattached=changeAttachment(book,attached,book.rosterAttachmentPolicies,'REATTACH','a','other-bodyguard');
  assert.deepEqual(ranges(find(run(reattached),'a')),[6,6,15]);assert.equal(find(run(reattached),'other-bodyguard').applied.length,0);
  assert.deepEqual(run(clone(state)),actual);assert.equal(JSON.stringify(book),snapshot,'Canonical/source view mutated');
  return {canonicalAbilities:abilityIds,baseRanges,effectiveRanges:[6,6,15],physicalOwner:'a',duplicateIsolation:true,
    attachDetach:true,removeRestore:true,canonicalIdentity:true};
}
const snapshot=JSON.stringify(built.facts),result=verify();
assert.throws(()=>verify({value:4}),/must be 6\/6\/15/,'Mutated range value passed focused source QA');
assert.throws(()=>verify({targetId:'synthetic-independent-ability'}),/must be 6\/6\/15/,'Mutated canonical target passed focused source QA');
assert.equal(JSON.stringify(built.facts),snapshot);
console.log(JSON.stringify({status:'PASS',...result,validContracts:315,builtOwners:69,builtInventory,blockedOwners:0,
  identityMutationRejected:true,rangeMutationRejected:true,productionRosterIntegration:false,legacyReads:0,canonicalFactsChanged:0}));
