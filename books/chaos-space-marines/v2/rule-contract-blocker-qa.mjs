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
assert.equal(validateRosterEffects(fixture({...effect,field:'W'}),()=>{}),true);
const removal=fixture({...effect,operation:'REMOVE_ABILITY',ability:{canonicalId:'synthetic-ability'}});
removal.rosterAbilityReferences={'synthetic-ability':{id:'synthetic-ability',title:'Synthetic canonical ability',parameters:{}}};
assert.equal(validateRosterEffects(removal,()=>{}),true);
const rangeFixture=fixture({...effect,operation:'MODIFY_ABILITY_RANGE',ability:{canonicalId:'synthetic-ability'},mode:'ADD',value:3});
rangeFixture.entities.push({id:'synthetic-ability',kind:'DATASHEET_ABILITY',data:{text:'Synthetic range 3".'}});
rangeFixture.rosterAbilityReferences={'synthetic-ability':{id:'synthetic-ability',title:'Synthetic canonical ability',
  parameters:{range:{type:'number',min:0}},rangeBinding:{field:['text'],start:16,end:18,baseValue:3}}};
assert.equal(validateRosterEffects(rangeFixture,()=>{}),true);
assert.throws(()=>validateRosterEffects(fixture({...effect,operation:'MODIFY_RULE_METRIC',
  field:'abilityRange',abilityId:'synthetic-ability'}),()=>{}),/Invalid metric operation/);

const built=buildCSMContracts(),index=new Map(built.facts.entities.map(entity=>[entity.id,entity]));
const blocked=[...built.classifications.values()].filter(row=>row.blockers);
assert.equal(blocked.length,0,'A source-proven roster capability is still blocked');
const range=built.declarations.get('detachment-cult-of-the-arkifane:enhancement:4');
assert.equal(built.classifications.get('detachment-cult-of-the-arkifane:enhancement:4').status,'BUILT');
assert.deepEqual(range.clauses.map(clause=>clause.effect.parameters.ability.canonicalId),[
  'datasheet-warpsmith:section:1:block:0:text',
  'datasheet-warpsmith:section:1:block:1:text',
  'datasheet-warpsmith:section:1:block:2:text']);
for(const clause of range.clauses) {
  const id=clause.effect.parameters.ability.canonicalId;
  assert.equal(index.get(id)?.kind,'DATASHEET_ABILITY');
  assert.equal(clause.operation,'MODIFY_ABILITY_RANGE');
  assert.equal(clause.effect.parameters.mode,'ADD');assert.equal(clause.effect.parameters.value,3);
}
assert.equal(built.classifications.get('detachment-renegade-warband:rule').status,'BUILT');
assert.equal(built.declarations.get('detachment-renegade-warband:rule').clauses[0].effect.parameters.ability.canonicalId,'army-rule-dark-pacts');
// The separately sourced battle-only Wounds increase is not a current
// roster-effective capability consumer.
assert.equal(built.classifications.get('detachment-pactbound-zealots:stratagem:1').status,
  'BATTLE_ONLY_NO_RUNTIME_NEEDED');
assert.equal(built.classifications.get('detachment-creations-of-bile:enhancement:2').status,'BUILT');
assert.equal(built.declarations.size,315);
assert.equal([...built.classifications.values()].filter(row=>row.status==='BUILT').length,68);
console.log(JSON.stringify({status:'PASS',sourceProvenBlockers:blocked.length,
  independentSyntheticCapabilityProbes:5,implementedGenericCapabilities:3}));
