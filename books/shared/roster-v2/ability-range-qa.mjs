/** Shared synthetic source, physical/profile scope and effective text controls. */
import assert from 'node:assert/strict';
import {createAbilityRangeFixture,rangeId as id} from './ability-range-fixture.mjs';
import {projectAbilityPresentation} from '../army-book-app-v2/ability-presentation.mjs';
const clone=structuredClone;
const range=(unit,profile='eligible',ability='ability-a')=>unit.profiles.find(row=>row.id===id(profile)).abilities.find(row=>row.canonicalId===id(ability))?.parameters.range;
function verify(options){
  const f=createAbilityRangeFixture(options),snapshot=JSON.stringify(f.book),r=f.runtime(),a=r.effective('a'),b=r.effective('b');
  assert.equal(range(a),6,'Intended canonical range must be 6');assert.equal(range(a,'sibling'),4);
  assert.equal(range(a,'eligible','ability-b'),4);assert.equal(range(b),4);
  const entries=a.abilities.filter(row=>row.id===id('ability-a'));
  assert.equal(entries.length,2);assert.equal(new Set(entries.map(row=>row.scopeId)).size,2);
  assert.equal(entries[0].text.text,'Select within 6". Roll D3; other rules and values remain unchanged.');
  assert.equal(entries[1].text.text,f.canonicalText);assert.ok(b.abilities.every(row=>row.text.text===f.canonicalText));
  const proof=a.applied[0];assert.equal(proof.targetAbilityId,id('ability-a'));assert.equal(proof.sourceInstanceId,'a');
  assert.equal(proof.targetInstanceId,'a');assert.equal(proof.targetProfileId,id('eligible'));
  assert.deepEqual([proof.before,proof.after,proof.baseValue],[4,6,4]);
  assert.deepEqual(proof.targetAbilitySource,{entityId:id('ability-a'),field:['text']});
  r.attach('leader','a');assert.equal(range(r.effective('a')),6);assert.equal(range(r.effective('leader'),'leader-model'),4);
  r.reattach('leader','b');assert.equal(range(r.effective('a')),6);assert.equal(range(r.effective('b')),4);
  r.detach('leader');assert.deepEqual(r.effective('a'),a);
  const state=r.snapshot();state.units[0].enhancementIds=[];r.load(state);
  assert.equal(range(r.effective('a')),4);assert.ok(r.effective('a').abilities.every(row=>!row.abilityRangeField));
  state.units[0].enhancementIds=[id('enhancement')];r.load(state);assert.deepEqual(r.effective('a'),a);
  assert.equal(JSON.stringify(f.book),snapshot);return f;
}
const f=verify();
const effective=f.runtime().effective('a'),references=[{canonicalId:id('ability-a'),parameters:{range:4},group:'CORE ABILITIES',label:'Same caption'}];
const plan=projectAbilityPresentation({instanceId:'a',profiles:effective.profiles,references,sourceAbilityIds:[id('ability-a')],
  unitAbilities:[{canonicalId:id('ability-a'),parameters:{range:4},name:'Independently owned UNIT ability'}]});
assert.ok(plan.profiles.every(profile=>profile.abilities.every(ability=>ability.canonicalId!==id('ability-a'))));
assert.equal(plan.core.filter(ability=>ability.canonicalId===id('ability-a')).length,1);
assert.equal(plan.core.find(ability=>ability.canonicalId===id('ability-a')).subject,'UNIT');
assert.throws(()=>verify({value:3}),/Intended canonical range/);
assert.throws(()=>verify({targetId:id('ability-b')}),/Intended canonical range/);
for(const mutate of [f=>f.effect.ability.canonicalId='missing',f=>f.effect.value=0,
  f=>f.book.rosterAbilityReferences[id('ability-a')].rangeBinding.start=0,
  f=>{f.effect.targetSubject='UNIT';f.effect.targetBinding='SOURCE_UNIT';}]){
  const broken=createAbilityRangeFixture();mutate(broken);assert.throws(()=>broken.runtime(),/canonical MODEL ability range/);
}
const absent=createAbilityRangeFixture();delete absent.book.rosterReferenceSemantics[id('ability-a')];
assert.equal(range(absent.runtime().effective('a')),undefined,'A range effect cannot grant an absent ability');
const composed=createAbilityRangeFixture(),second=clone(composed.effect);second.id=id('second');second.value=3;
composed.book.entities.find(row=>row.id===id('enhancement')).ruleContract.clauses[0].rosterEffects.push(second);
const composedRuntime=composed.runtime(),actual=composedRuntime.effective('a');assert.equal(range(actual),9);
assert.equal(actual.abilities.find(row=>row.id===id('ability-a')).text.text,'Select within 9". Roll D3; other rules and values remain unchanged.');
composed.book.entities.reverse();assert.deepEqual(composed.runtime().effective('a'),actual);
console.log(JSON.stringify({status:'PASS',armyFactualReads:0,canonicalIdentity:true,mixedProfileScope:true,physicalIsolation:true,
  removeRestore:true,attachDetach:true,canonicalFactsImmutable:true,effectiveText:true,modifierComposition:true,mutationGuards:2}));
