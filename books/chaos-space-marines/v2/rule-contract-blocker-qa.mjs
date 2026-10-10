import assert from 'node:assert/strict';
import {validateRosterEffects} from '../../shared/roster-v2/effects.mjs';
import {buildCSMContracts} from './rule-contract-build.mjs';

// Probe the existing validator without publishing or executing any effect.
// The control uses no army facts; failures establish actual capability gaps,
// rather than repeating a legacy adapter's unsupported-operation labels.
const effect={id:'synthetic-effect',operation:'MODIFY_STAT',field:'T',mode:'ADD',value:1,
  targetBinding:'SOURCE_MODEL',targetSubject:'MODEL',lifetime:'WHILE_ASSIGNED',conditions:[],
  evidence:{field:['text'],quote:'Synthetic source-backed effect'}};
const fixture=value=>({entities:[{id:'synthetic-rule',kind:'OTHER_RULE',parentId:'synthetic-unit',
  data:{text:'Synthetic source-backed effect'},ruleContract:{clauses:[{
    rosterClassification:'ROSTER_EXECUTABLE',rosterEffects:[value]}]}}]});
assert.equal(validateRosterEffects(fixture(effect),()=>{}),true);
assert.throws(()=>validateRosterEffects(fixture({...effect,field:'W'}),()=>{}),/Invalid characteristic/);
assert.throws(()=>validateRosterEffects(fixture({...effect,operation:'REMOVE_ABILITY',
  ability:{canonicalId:'synthetic-ability',parameters:{}}}),()=>{}),/Malformed roster effect/);
assert.throws(()=>validateRosterEffects(fixture({...effect,operation:'MODIFY_RULE_METRIC',
  field:'abilityRange',abilityId:'synthetic-ability'}),()=>{}),/Invalid metric operation/);

const built=buildCSMContracts(),index=new Map(built.facts.entities.map(entity=>[entity.id,entity]));
const blocked=[...built.classifications.values()].filter(row=>row.blockers);
const required=new Map([
  ['detachment-creations-of-bile:enhancement:2','WOUNDS_CHARACTERISTIC_MODIFIER'],
  ['detachment-renegade-warband:rule','CANONICAL_ABILITY_REMOVAL'],
  ['detachment-cult-of-the-arkifane:enhancement:4','SPECIFIC_CANONICAL_ABILITY_RANGE_MODIFIER']
]);
assert.deepEqual(new Set(blocked.map(row=>row.ruleId)),new Set(required.keys()));
for(const row of blocked) {
  assert.equal(row.blockers.length,1);
  assert.equal(row.blockers[0].missingCapability,required.get(row.ruleId));
  assert.ok(!row.declaration,'Blocked capability was silently published');
}
const range=blocked.find(row=>row.ruleId==='detachment-cult-of-the-arkifane:enhancement:4').blockers[0];
assert.deepEqual(range.affectedCanonicalAbilityIds,[
  'datasheet-warpsmith:section:1:block:0:text',
  'datasheet-warpsmith:section:1:block:1:text',
  'datasheet-warpsmith:section:1:block:2:text']);
for(const id of range.affectedCanonicalAbilityIds)assert.equal(index.get(id)?.kind,'DATASHEET_ABILITY');
assert.equal(blocked.find(row=>row.ruleId==='detachment-renegade-warband:rule')
  .blockers[0].affectedCanonicalAbilityIds[0],'army-rule-dark-pacts');
// The separately sourced battle-only Wounds increase is not a current
// roster-effective capability consumer.
assert.equal(built.classifications.get('detachment-pactbound-zealots:stratagem:1').status,
  'BATTLE_ONLY_NO_RUNTIME_NEEDED');
console.log(JSON.stringify({status:'PASS',sourceProvenBlockers:blocked.length,
  independentSyntheticCapabilityProbes:4,newCapabilitiesImplemented:0}));
