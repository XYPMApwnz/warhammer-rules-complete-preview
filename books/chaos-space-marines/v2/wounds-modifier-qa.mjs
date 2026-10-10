import assert from 'node:assert/strict';
import {buildCSMContracts} from './rule-contract-build.mjs';
import {changeAttachment,withRosterDetachments} from '../../shared/roster-v2/context.mjs';
import {runWounds} from '../../shared/roster-v2/wounds-effects-qa.mjs';

const ruleId='detachment-creations-of-bile:enhancement:2',detachmentId='detachment-creations-of-bile';
const built=buildCSMContracts(),clone=value=>structuredClone(value);
const source=built.facts.entities.find(entity=>entity.id===ruleId);
assert.equal(source.data.text,'CHAOS LORD model only. Add 1 to the bearer’s Wounds characteristic and the bearer has the Feel No Pain 5+ ability.');
const declaration=built.declarations.get(ruleId);
assert.equal(declaration.contextLevel,'ROSTER');assert.equal(declaration.assignment.identity,'EXACT_PHYSICAL_INSTANCE_MODEL_PROFILE');
assert.equal(declaration.roles[0].subject,'MODEL');assert.equal(declaration.roles[0].binding,'SOURCE_MODEL');
assert.deepEqual(declaration.roles[0].selector.arguments,{keyword:'CHAOS LORD'});
assert.equal(declaration.clauses.length,2);
assert.deepEqual(declaration.clauses[0].effect.parameters,{field:'W',mode:'ADD',value:1});
assert.deepEqual(declaration.clauses[1].effect.parameters,{ability:{name:'Feel No Pain',value:5}});

function verify(parameters=declaration.clauses[0].effect.parameters) {
  // This bridge executes only the target's typed declarations as a focused
  // capability test. It does not wire CSM import, UI or other roster effects.
  const book=clone(built.book);book.rosterProfileBindings=clone(built.profileBindings);
  for(const entity of book.entities)if(entity.id!==ruleId)delete entity.ruleContract;
  const rule=book.entities.find(entity=>entity.id===ruleId),contract=rule.ruleContract,role=contract.roles[0];
  contract.assignment.selector=clone(role.selector);
  contract.clauses.forEach((clause,i)=>{
    assert.equal(clause.productClassification,'ROSTER_KNOWN');
    clause.rosterClassification='ROSTER_EXECUTABLE';
    clause.rosterEffects=[{id:clause.id+'/effect',operation:clause.operation,
      ...clone(i===0?parameters:clause.effect.parameters),targetSubject:role.subject,targetBinding:role.binding,
      conditions:[{binding:'TARGET',predicate:clone(role.selector)}],evidence:clone(clause.evidence),
      sourceFields:clone(clause.sourceFields),lifetime:'WHILE_ASSIGNED'}];
  });
  const index=new Map(book.entities.map(entity=>[entity.id,entity]));
  const unit=(instanceId,canonicalUnitId,assigned=false)=>{
    const rows=index.get(canonicalUnitId).data.profileIds.map(profileId=>({rowId:profileId,canonicalProfileId:profileId,
      quantity:index.get(profileId).data.composition.quantity.min,selections:[],loadouts:[]}));
    return {instanceId,canonicalUnitId,startingStrength:rows.reduce((sum,row)=>sum+row.quantity,0),modelRows:rows,
      selections:[],enhancementIds:assigned?[ruleId]:[],warlord:null};
  };
  const state={schema:'roster-v2/roster',bookId:book.bookId,rosterId:'living-carapace-scope-test',
    detachments:[{instanceId:'detachment/1',canonicalDetachmentId:detachmentId}],detachmentIds:[detachmentId],
    units:[unit('a','unit-chaos-lord',true),unit('b','unit-chaos-lord'),unit('bodyguard','unit-chosen'),
      unit('other-bodyguard','unit-chosen'),unit('ineligible','unit-warpsmith',true)],attachments:[],warlordInstanceId:null};
  const api=withRosterDetachments(built.schema.evaluator),run=state=>runWounds(book,state,api);
  const actual=run(state),find=(result,id)=>result.units.find(unit=>unit.instanceId===id);
  assert.equal(find(actual,'a').profiles[0].profile.stats.W,'6','Living Carapace must add exactly one Wound');
  assert.ok(find(actual,'a').profiles[0].abilities.some(ability=>ability.name==='Feel No Pain'&&ability.value===5));
  const wounded=find(actual,'a').applied.find(effect=>effect.field==='W');
  assert.equal(wounded.before,'5');assert.equal(wounded.after,'6');assert.equal(wounded.ruleId,ruleId);
  assert.equal(wounded.sourceInstanceId,'a');assert.equal(wounded.targetInstanceId,'a');
  assert.equal(wounded.targetModelInstanceId,'a');
  assert.equal(wounded.targetProfileId,'datasheet-chaos-lord:section:2:member:1');
  assert.deepEqual(wounded.targetFieldPath,['stats','W']);
  for(const name of ['b','bodyguard','other-bodyguard','ineligible']) {
    const entry=find(actual,name);assert.equal(entry.applied.length,0,'Effect escaped exact bearer');
    for(const model of entry.profiles)assert.equal(model.profile.stats.W,index.get(model.canonicalProfileId).data.stats.W);
  }
  const removed=clone(state);removed.units[0].enhancementIds=[];
  assert.equal(find(run(removed),'a').profiles[0].profile.stats.W,'5');assert.equal(find(run(removed),'a').applied.length,0);
  removed.units[0].enhancementIds=[ruleId];assert.deepEqual(run(removed),actual);
  const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','a','bodyguard');
  const attachedResult=run(attached);assert.equal(find(attachedResult,'a').profiles[0].profile.stats.W,'6');
  assert.equal(find(attachedResult,'bodyguard').applied.length,0);assert.equal(find(attachedResult,'b').applied.length,0);
  const detached=changeAttachment(book,attached,book.rosterAttachmentPolicies,'DETACH','a');assert.deepEqual(run(detached),actual);
  const reattached=changeAttachment(book,detached,book.rosterAttachmentPolicies,'ATTACH','a','other-bodyguard');
  assert.equal(find(run(reattached),'other-bodyguard').applied.length,0);assert.equal(find(run(reattached),'a').profiles[0].profile.stats.W,'6');
  assert.deepEqual(run(clone(state)),actual);
  return {owner:'MODEL',recipient:'EXACT_PHYSICAL_BEARER',W:'5 -> 6',FNP:'5+',duplicateIsolation:true,attachDetach:true,removeRestore:true};
}
const snapshot=JSON.stringify(built.facts),result=verify();
assert.throws(()=>verify({field:'W',mode:'ADD',value:2}),/exactly one Wound/,'Mutated source modifier passed focused QA');
assert.equal(JSON.stringify(built.facts),snapshot);
console.log(JSON.stringify({status:'PASS',...result,modifierMutationRejected:true,validContracts:built.declarations.size,
  blockedOwners:[...built.classifications.values()].filter(row=>row.blockers).length,productionRosterIntegration:false}));
