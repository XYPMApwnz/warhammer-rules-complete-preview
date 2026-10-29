import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {enhancementOwnerFixture} from './enhancement-owner-fixture.mjs';
import {compileRecipientFixture} from './recipient-fixture.mjs';
import {rangeId as id} from './ability-range-fixture.mjs';
import {createRosterRuntime} from './runtime.mjs';
import {buildAttachmentFeasibility} from './compatibility-feasibility.mjs';
import {formRoster} from './context.mjs';
import {createRuleContractSchema} from '../rule-contract-v2/schema.mjs';

const clone=structuredClone,checks=[];
const check=(name,run)=>{run();checks.push(name);};
const wounds=(runtime,instance='a',profile='eligible')=>runtime.effective(instance).profiles.find(row=>row.id===id(profile))
  .fields.find(row=>row.label==='W').value;
function verify(f=enhancementOwnerFixture()) {
  const canonical=JSON.stringify(f.book),raw=JSON.stringify(f.state),runtime=f.runtime();
  assert.equal(wounds(runtime),'4','Exact eligible bearer Wounds must be 4');
  assert.equal(wounds(runtime,'a','sibling'),'3','Sibling must retain base Wounds');
  assert.equal(wounds(runtime,'b'),'3','Duplicate physical unit must retain base Wounds');
  const proof=runtime.effective('a').applied[0];
  assert.equal(proof.sourceInstanceId,'a');assert.equal(proof.sourceProfileId,id('eligible'));
  assert.equal(proof.sourceCompositionId,f.scope('a'));assert.equal(proof.targetCompositionId,f.scope('a'));
  assert.equal(JSON.stringify(f.book),canonical);assert.equal(JSON.stringify(f.state),raw);
  return runtime;
}
check('unique eligible singleton profile resolves without inventing a selection',()=>verify());
check('explicit physical MODEL assignment preserves canonical identity despite duplicate captions',()=>{
  const f=enhancementOwnerFixture();f.assign();verify(f);
});
check('bearer-only source and target MODEL predicates use the exact resolved profile',()=>{
  const f=enhancementOwnerFixture();f.effect.conditions=[{binding:'SOURCE',predicate:clone(f.rule.ruleContract.assignment.selector)}];
  verify(f);
});
check('attach/detach/reattach keep the bearer separate from attached components',()=>{
  const f=enhancementOwnerFixture();f.assign();const r=verify(f),before=r.effective('a');
  r.attach('leader','a');assert.equal(wounds(r),'4');assert.equal(wounds(r,'leader','leader-model'),'3');
  r.reattach('leader','b');assert.equal(wounds(r),'4');assert.equal(wounds(r,'b'),'3');
  r.detach('leader');assert.deepEqual(r.effective('a'),before);
});
check('bearer-unit effects use existing formed/unformed bindings and preserve exact SOURCE MODEL context',()=>{
  const f=enhancementOwnerFixture();f.assign();const sourcePredicate=clone(f.rule.ruleContract.assignment.selector);
  f.effect.targetBinding='SOURCE_UNIT_MODELS';f.effect.conditions=[{binding:'SOURCE',predicate:sourcePredicate},
    {binding:'SOURCE',predicate:{predicate:'FIELD',subject:'MODEL',contextLevel:'ROSTER',arguments:{key:'leading',equals:false},evidence:clone(f.effect.evidence)}}];
  // Attachment selection is deliberately test-owned, never inferred from prose.
  f.book.rosterAttachmentPolicies=[{sourceId:id('mixed'),targetId:id('leader'),role:'LEADER',additionalLeaders:0,sourceIds:[id('relation')]}];
  f.book.compatibilityFeasibility=buildAttachmentFeasibility(f.book,f.book.rosterProfileBindings.map(row=>({...row,maxModels:1})));
  const formed=clone(f.effect);formed.id+='-formed';formed.targetBinding='SOURCE_FORMED_MODELS';
  formed.conditions[1].predicate.arguments.equals=true;
  f.rule.ruleContract.clauses[0].rosterEffects.push(formed);
  const r=f.runtime();assert.equal(wounds(r),'4');assert.equal(wounds(r,'a','sibling'),'4');
  r.attach('a','leader');assert.equal(wounds(r,'leader','leader-model'),'4');assert.equal(wounds(r,'b'),'3');
  r.detach('a');assert.equal(wounds(r,'leader','leader-model'),'3');assert.equal(wounds(r),'4');
});
check('removal and restoration preserve exact owned effect and deterministic rebuild',()=>{
  const f=enhancementOwnerFixture();f.assign();const r=verify(f),before=r.effective('a'),snapshot=r.snapshot();
  snapshot.units[0].enhancementIds=[];snapshot.units[0].enhancementAssignments=[];r.load(snapshot);assert.equal(wounds(r),'3');
  r.load(f.state);assert.deepEqual(r.effective('a'),before);
  const restored=createRosterRuntime(compileRecipientFixture(f.book,f.api,{validateContracts:false}),f.api);restored.load(JSON.parse(JSON.stringify(r.snapshot())));
  assert.deepEqual(restored.projection,r.projection);
});
check('multiple independently owned Enhancements bind separate MODEL profiles in one physical unit',()=>{
  const f=enhancementOwnerFixture();f.assign();const second=clone(f.rule);second.id=id('second');
  second.ruleContract.ruleId=second.id;second.ruleContract.assignment.selector={...second.ruleContract.assignment.selector,
    predicate:'MODEL_ID',arguments:{id:id('sibling')}};second.ruleContract.roles[0].selector=clone(second.ruleContract.assignment.selector);
  second.ruleContract.clauses[0].rosterEffects[0].id=id('second-effect');
  second.ruleContract.clauses[0].rosterEffects[0].value=2;f.book.entities.push(second);f.assign('a','sibling',second.id);
  const r=f.runtime();assert.equal(wounds(r),'4');assert.equal(wounds(r,'a','sibling'),'5');assert.equal(wounds(r,'b'),'3');
});
check('ambiguous eligible profiles and grouped quantities fail closed',()=>{
  for(const mutate of [f=>f.book.rosterProfileBindings.find(row=>row.profileId===id('sibling')).intrinsicKeywords.push('ELIGIBLE'),
    f=>{f.state.units[0].modelRows[0].quantity=2;f.state.units[0].startingStrength=3;}]){
    const f=enhancementOwnerFixture();mutate(f);assert.throws(()=>f.runtime(),/Ambiguous physical Enhancement bearer/);
  }
});
check('foreign, missing, duplicate and unowned bearer assignments are rejected',()=>{
  for(const mutate of [f=>f.state.units[0].enhancementAssignments[0].modelScopeId=f.scope('b'),
    f=>f.state.units[0].enhancementAssignments[0].modelScopeId='missing',
    f=>f.state.units[0].enhancementAssignments.push(clone(f.state.units[0].enhancementAssignments[0])),
    f=>f.state.units[0].enhancementIds=[]]){
    const f=enhancementOwnerFixture();f.assign();mutate(f);assert.throws(()=>f.runtime(),/Enhancement bearer/);
  }
});
check('ineligible explicit bearer does not receive the effect',()=>{
  const f=enhancementOwnerFixture();f.assign('a','sibling');const r=f.runtime();assert.equal(wounds(r),'3');assert.equal(wounds(r,'a','sibling'),'3');
});
check('mutation of exact bearer binding fails positive focused QA',()=>{
  const f=enhancementOwnerFixture();f.assign('a','sibling');assert.throws(()=>verify(f),/Exact eligible bearer Wounds/);
});
check('single-profile MODEL owners retain established behaviour',()=>{
  const f=enhancementOwnerFixture();for(const unit of f.state.units.filter(unit=>unit.canonicalUnitId===id('mixed'))){
    unit.modelRows=unit.modelRows.slice(0,1);unit.startingStrength=1;
  }
  const r=f.runtime();assert.equal(wounds(r),'4');assert.equal(wounds(r,'b'),'3');
});
check('same canonical profile in separate physical groups requires and respects an exact assignment',()=>{
  const f=enhancementOwnerFixture();
  f.state.units[0].modelRows[1].canonicalProfileId=id('eligible');
  assert.throws(()=>f.runtime(),/Ambiguous physical Enhancement bearer/);
  const scopes=formRoster(f.book,f.state).units[0].profiles;
  f.state.units[0].enhancementAssignments=[{enhancementId:f.rule.id,modelScopeId:scopes[1].scopeId}];
  const result=f.runtime().projection.units[0];
  assert.equal(result.profiles[0].profile.W,'3');assert.equal(result.profiles[1].profile.W,'4');
  assert.equal(result.applied[0].targetCompositionId,scopes[1].scopeId);
});
check('unknown MODEL owner eligibility stays conditional without selecting a bearer',()=>{
  const f=enhancementOwnerFixture();f.rule.ruleContract.assignment.selector={predicate:'FIELD',subject:'MODEL',
    contextLevel:'BATTLE',arguments:{key:'eligibleNow',equals:true},evidence:clone(f.effect.evidence)};
  const evaluator=createRuleContractSchema({stateFields:{eligibleNow:{contextLevel:'BATTLE',valueType:'boolean'}}});
  const r=createRosterRuntime(compileRecipientFixture(f.book,evaluator,{validateContracts:false}),evaluator);
  r.load(f.state);const result=r.projection.units[0];assert.equal(result.applied.length,0);
  assert.ok(result.conditional.some(row=>row.state==='UNKNOWN'));
});
check('established UNIT ownership and unit-model recipients remain unchanged',()=>{
  const f=enhancementOwnerFixture();f.rule.ruleContract.roles[0].subject='UNIT';
  f.rule.ruleContract.assignment.selector={predicate:'UNIT_ID',subject:'UNIT',contextLevel:'STATIC',arguments:{id:id('mixed')},evidence:clone(f.effect.evidence)};
  f.effect.targetBinding='SOURCE_UNIT_MODELS';const r=f.runtime();
  assert.equal(wounds(r),'4');assert.equal(wounds(r,'a','sibling'),'4');assert.equal(wounds(r,'b'),'3');
});
check('bearer weapon grants do not infer ownership from mixed-profile aggregate weapons',()=>{
  const f=enhancementOwnerFixture();f.assign();
  f.book.entities.push({id:id('gun'),kind:'WEAPON_PROFILE',parentId:id('mixed'),data:{name:'Same weapon caption',mode:'ranged',abilities:[]}});
  f.book.entities.find(row=>row.id===id('mixed')).data.weaponIds=[id('gun')];
  const selection={selectionKey:'gun',canonicalProfileIds:[id('gun')],canonicalEquipmentIds:[],physicalQuantity:1};
  f.state.units[0].selections=[{...clone(selection),physicalQuantity:2}];
  for(const row of f.state.units[0].modelRows)row.selections=[clone(selection)];
  Object.assign(f.effect,{operation:'GRANT_WEAPON_ABILITY',ability:'PRECISION'});
  delete f.effect.field;delete f.effect.mode;delete f.effect.value;
  const result=f.runtime().projection.units[0];
  assert.deepEqual(result.weapons[0].data.abilities,[]);
  assert.deepEqual(result.profiles[0].weapons[0].data.abilities,['PRECISION']);
  assert.deepEqual(result.profiles[1].weapons[0].data.abilities,[]);
  assert.ok(result.applied.every(row=>row.targetCompositionId===f.scope('a')));
});
check('G1 global Army Rule dispatch remains unresolved while existing Detachment dispatch works',()=>{
  const f=enhancementOwnerFixture();f.rule.kind='ARMY_RULE';f.rule.parentId=f.book.bookId;
  f.state.units[0].enhancementIds=[];
  delete f.rule.ruleContract.assignment;f.effect.targetBinding='ROSTER_MODELS';
  f.effect.containingUnitScope='PHYSICAL';f.effect.recipientSelectors={
    unit:{predicate:'UNIT_ID',subject:'UNIT',contextLevel:'STATIC',arguments:{id:id('mixed')},evidence:clone(f.effect.evidence)},
    model:clone(f.rule.ruleContract.roles[0].selector)};
  f.effect.conditions=[{binding:'TARGET',predicate:clone(f.rule.ruleContract.roles[0].selector)}];
  const inactive=f.runtime();assert.equal(wounds(inactive),'3');assert.equal(wounds(inactive,'b'),'3');
  f.rule.kind='DETACHMENT_RULE';const active=f.runtime();assert.equal(wounds(active),'4');assert.equal(wounds(active,'b'),'4');
});
check('runtime mutation broadening exact bearer binding is killed by focused QA',()=>{
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'model-owner-mutation-'));
  try {
    const root=path.dirname(fileURLToPath(import.meta.url));
    for(const directory of ['roster-v2','rule-contract-v2'])
      fs.cpSync(path.resolve(root,'..',directory),path.join(temporary,directory),{recursive:true});
    const target=path.join(temporary,'roster-v2','effects.mjs'),source=fs.readFileSync(target,'utf8');
    const exact='return [{unit:source,model:ownerModel}];';assert.ok(source.includes(exact));
    fs.writeFileSync(target,source.replace(exact,'return source.profiles.map(model=>({unit:source,model}));'));
    const mutant=spawnSync(process.execPath,[path.join(temporary,'roster-v2','enhancement-owner-qa.mjs')],{encoding:'utf8',timeout:10000});
    assert.notEqual(mutant.status,0);assert.match(mutant.stderr,/Sibling must retain base Wounds/);
  } finally {
    assert.equal(path.dirname(fs.realpathSync(temporary)),fs.realpathSync(os.tmpdir()));
    fs.rmSync(temporary,{recursive:true,force:true});
  }
});
console.log(JSON.stringify({status:'PASS',checks:checks.length,names:checks,armyFactualReads:0,mutationRejected:true}));
