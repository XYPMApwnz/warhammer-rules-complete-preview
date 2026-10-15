/** Current canonical source -> typed target declaration -> existing runtime.
 * This capability probe does not wire CSM roster import, UI or other effects. */
import assert from 'node:assert/strict';
import {buildCSMContracts} from './rule-contract-build.mjs';
import {changeAttachment,validateRoster,withRosterDetachments} from '../../shared/roster-v2/context.mjs';
import {executeRosterEffects,validateRosterEffects} from '../../shared/roster-v2/effects.mjs';

const ruleId='detachment-renegade-warband:rule',detachmentId='detachment-renegade-warband';
const abilityId='army-rule-dark-pacts',clone=value=>structuredClone(value),built=buildCSMContracts();
const source=built.facts.entities.find(entity=>entity.id===ruleId);
const exact='HERETIC ASTARTES models from your army lose the Dark Pacts ability.';
assert.ok(source.data.content[0].text.startsWith(exact));assert.ok(source.provenance);
const declaration=built.declarations.get(ruleId),clause=declaration.clauses[0],role=declaration.roles.find(role=>role.id==='recipient');
assert.equal(declaration.detachmentId,detachmentId);assert.equal(role.subject,'MODEL');assert.equal(role.binding,'ROSTER_MODELS');
assert.equal(role.selector.predicate,'MODEL_KEYWORD');assert.deepEqual(role.selector.arguments,{keyword:'HERETIC ASTARTES'});
assert.deepEqual(role.conditions,[]);assert.equal(clause.productClassification,'ROSTER_KNOWN');
assert.equal(clause.operation,'REMOVE_ABILITY');assert.deepEqual(clause.effect.parameters,{ability:{canonicalId:abilityId}});
assert.equal(clause.evidence.quote,exact);assert.deepEqual(clause.evidence.field,['content',0,'text']);
assert.ok(built.facts.entities.some(entity=>entity.id===abilityId&&entity.kind==='ARMY_RULE'));
assert.equal(built.declarations.size,315);assert.equal([...built.classifications.values()].filter(row=>row.status==='BUILT').length,68);
assert.equal([...built.classifications.values()].filter(row=>row.blockers).length,0);

function verify(removedId=abilityId) {
  const book=clone(built.book);book.rosterProfileBindings=clone(built.profileBindings);
  for(const entity of book.entities)if(entity.id!==ruleId)delete entity.ruleContract;
  const rule=book.entities.find(entity=>entity.id===ruleId),contract=rule.ruleContract;
  // Canonical membership owns the link; its display label is never an identity.
  book.rosterAbilityReferences=Object.fromEntries(book.entities.filter(entity=>entity.kind==='ARMY_RULE')
    .map(entity=>[entity.id,{id:entity.id,title:entity.displayName,parameters:{}}]));
  book.rosterReferenceSemantics=Object.fromEntries(book.entities.filter(entity=>entity.kind==='RULE_REFERENCE'&&entity.data.armyRuleId)
    .map(entity=>[entity.id,{abilities:[{canonicalId:entity.data.armyRuleId,name:entity.data.label,parameters:{}}]}]));
  contract.clauses.forEach((bound,index)=>{
    bound.rosterClassification=index===0?'ROSTER_EXECUTABLE':bound.productClassification==='BATTLE_ONLY'?'BATTLE_ONLY':'DISPLAY_ONLY';
    bound.rosterClassificationNote={reason:'Canonical text retained; only the source-proven suppression is executed by this probe.'};
    bound.rosterEffects=index===0?[{id:bound.id+'/effect',operation:bound.operation,ability:{canonicalId:removedId},
      targetSubject:role.subject,targetBinding:role.binding,containingUnitScope:'PHYSICAL',
      recipientSelectors:{unit:{predicate:'ALWAYS',subject:'UNIT',contextLevel:'STATIC',arguments:{},evidence:clone(bound.evidence)},model:clone(role.selector)},
      conditions:[],sourceFields:clone(bound.sourceFields),evidence:clone(bound.evidence),lifetime:'WHILE_DETACHMENT_SELECTED'}]:[];
  });
  const records=new Map(book.entities.map(entity=>[entity.id,entity]));
  const unit=(instanceId,canonicalUnitId)=>{
    const rows=records.get(canonicalUnitId).data.profileIds.map(profileId=>({rowId:profileId,canonicalProfileId:profileId,
      quantity:records.get(profileId).data.composition.quantity.min,selections:[],loadouts:[]}));
    return {instanceId,canonicalUnitId,startingStrength:rows.reduce((n,row)=>n+row.quantity,0),modelRows:rows,
      selections:[],enhancementIds:[],warlord:null};
  };
  const state={schema:'roster-v2/roster',bookId:book.bookId,rosterId:'canonical-suppression-current-source',
    detachments:[{instanceId:'detachment/1',canonicalDetachmentId:detachmentId}],detachmentIds:[detachmentId],
    units:[unit('a','unit-chaos-lord'),unit('b','unit-chaos-lord'),unit('bodyguard','unit-chosen'),unit('other-bodyguard','unit-chosen')],
    attachments:[],warlordInstanceId:null};
  const api=withRosterDetachments(built.schema.evaluator),snapshot=JSON.stringify(book);
  validateRosterEffects(book,api.validatePredicate,api.evaluatePredicate);
  const run=state=>executeRosterEffects(book,validateRoster(book,state,book.rosterAttachmentPolicies),api);
  const has=model=>model.abilities.some(ability=>ability.canonicalId===abilityId);
  const actual=run(state);
  for(const unit of actual.units)for(const model of unit.profiles){
    assert.ok(model.intrinsicKeywords.includes('HERETIC ASTARTES'));
    assert.equal(has(model),false,'Slaves to None must suppress the exact Dark Pacts canonical ID');
    assert.deepEqual(model.suppressedAbilityIds,[abilityId]);
    const proof=unit.applied.find(row=>row.targetCompositionId===model.scopeId);
    assert.equal(proof.ruleId,ruleId);assert.equal(proof.sourceInstanceId,null);assert.equal(proof.targetInstanceId,unit.instanceId);
    assert.equal(proof.targetAbilityId,abilityId);assert.equal(proof.targetProfileId,model.canonicalProfileId);
    assert.ok(proof.before.some(ability=>ability.canonicalId===abilityId));assert.ok(!proof.after.some(ability=>ability.canonicalId===abilityId));
  }
  const removed=clone(state);removed.detachmentIds=['detachment-creations-of-bile'];
  removed.detachments=[{instanceId:'detachment/1',canonicalDetachmentId:removed.detachmentIds[0]}];
  assert.ok(run(removed).units.every(unit=>unit.profiles.every(has)));
  assert.deepEqual(run(clone(state)),actual);
  const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','a','bodyguard');
  const attachedResult=run(attached);assert.ok(attachedResult.units.every(unit=>unit.profiles.every(model=>!has(model))));
  assert.deepEqual(run(changeAttachment(book,attached,book.rosterAttachmentPolicies,'DETACH','a')),actual);
  const reattached=changeAttachment(book,attached,book.rosterAttachmentPolicies,'REATTACH','a','other-bodyguard');
  assert.ok(run(reattached).units.every(unit=>unit.profiles.every(model=>!has(model))));
  // Alter only one explicit MODEL selector input; a sibling scope must stay suppressed.
  const profileId=book.entities.find(entity=>entity.id==='unit-chosen').data.profileIds[0];
  const binding=book.rosterProfileBindings.find(binding=>binding.profileId===profileId);
  binding.intrinsicKeywords=binding.intrinsicKeywords.filter(keyword=>keyword!=='HERETIC ASTARTES');
  const isolated=run(state).units.find(unit=>unit.instanceId==='bodyguard');
  assert.ok(isolated.profiles.filter(model=>model.canonicalProfileId===profileId).every(has));
  assert.ok(isolated.profiles.filter(model=>model.canonicalProfileId!==profileId).every(model=>!has(model)));
  binding.intrinsicKeywords.push('HERETIC ASTARTES');binding.intrinsicKeywords=clone(built.profileBindings.find(binding=>binding.profileId===profileId).intrinsicKeywords);
  assert.equal(JSON.stringify(book),snapshot);assert.deepEqual(run(state),actual);
  return {globalModelScopes:actual.units.flatMap(unit=>unit.profiles).length,canonicalId:abilityId,attachedComponents:true,removeRestore:true};
}
const facts=JSON.stringify(built.facts),result=verify();
assert.throws(()=>verify('army-rule-cult-of-the-dark-gods'),/exact Dark Pacts canonical ID/,'Wrong canonical identity passed focused source QA');
assert.equal(JSON.stringify(built.facts),facts);
console.log(JSON.stringify({status:'PASS',...result,validContracts:315,builtOwners:68,blockedOwners:0,mutationRejected:true,
  productionRosterIntegration:false,legacyReads:0,canonicalFactsChanged:0}));
