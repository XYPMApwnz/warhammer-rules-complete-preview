import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {buildAdMechContracts,readJson,directory} from './rule-contract-build.mjs';
import {compilerInputs} from './rule-contract-context.mjs';
import {abilityReferences} from './ability-reference-registry.mjs';
import {validateRoster,withRosterDetachments} from '../../shared/roster-v2/context.mjs';
import {executeRosterEffects,validateRosterEffects} from '../../shared/roster-v2/effects.mjs';

// Independent, bounded source conformance: only the seven newly expressible
// current owners are executable here. This does not create an AdMech runtime.
const ids=['detachment-data-psalm-conclave:enhancement:4','detachment-skitarii-hunter-cohort:rule',
  'detachment-skitarii-hunter-cohort:enhancement:2','detachment-rad-zone-corps:enhancement:2',
  'detachment-luminen-auto-choir:enhancement:2','detachment-cohort-acquisitus:enhancement:1',
  'detachment-cohort-acquisitus:enhancement:2'];
const quotes=['The bearer’s unit has the Fights First ability.',
  'Friendly SKITARII INFANTRY, SKITARII MOUNTED and IRONSTRIDER BALLISTARII units have Stealth.',
  'The bearer, and models in any unit they are leading, have the Infiltrators and Scouts 6" abilities.',
  'While the bearer is leading a unit, models in that unit have the Stealth ability.',
  'This unit has Stealth.','This unit has Infiltrators','This unit has Lone Operative 15".'];
const expected=[['core-fights-first|UNIT|FORMED|{}'],['core-stealth|UNIT|FORMED|{}'],
  ['core-infiltrators|MODEL||{}','core-infiltrators|MODEL||{}',
    'core-scouts|MODEL||{"distance":6}','core-scouts|MODEL||{"distance":6}'],
  ['core-stealth|MODEL||{}'],['core-stealth|UNIT|FORMED|{}'],
  ['core-infiltrators|UNIT|FORMED|{}'],['core-lone-operative|UNIT|PHYSICAL|{"distance":15}']];
const built=buildAdMechContracts(),full=compilerInputs(built.book,{abilityReferences:abilityReferences()}).book,book=structuredClone(full);
for(const entity of book.entities)if(!ids.includes(entity.id))delete entity.ruleContract;
const index=new Map(book.entities.map(e=>[e.id,e])),evaluator=withRosterDetachments(built.schema.evaluator);
assert.equal(built.blockedIds.size,1);
assert.equal(evaluator.validateContracts(book).rules,7);
const root=path.resolve(directory,'../../..');
for(const [i,id]of ids.entries()){
  const entity=index.get(id),source=JSON.parse(fs.readFileSync(path.join(root,entity.provenance.sourcePath),'utf8'));
  const raw=entity.provenance.pointer.slice(1).split('/').reduce((v,key)=>v[key],source);
  assert.equal(entity.data.text,raw.text,'Captured source/current canonical text mismatch');
  assert.ok(raw.text.includes(quotes[i]),'Independent source prerequisite missing');
  assert.deepEqual(entity.ruleContract.clauses.flatMap(c=>c.rosterEffects.map(e=>
    [e.ability.canonicalId,e.targetSubject,e.unitScope||'',JSON.stringify(e.ability.parameters)].join('|'))),expected[i]);
  assert.ok(entity.ruleContract.clauses.every(c=>c.rosterClassification==='ROSTER_EXECUTABLE'));
}
const expectedBindings=[['SOURCE_UNIT'],['ROSTER_UNITS'],
  ['SOURCE_MODEL','SOURCE_FORMED_MODELS','SOURCE_MODEL','SOURCE_FORMED_MODELS'],
  ['SOURCE_FORMED_MODELS'],['SOURCE_UNIT'],['SOURCE_UNIT'],['SOURCE_UNIT']];
for(const [i,id]of ids.entries())assert.deepEqual(index.get(id).ruleContract.clauses.flatMap(c=>c.rosterEffects.map(e=>e.targetBinding)),expectedBindings[i]);
for(const [id,values]of [[ids[2],[false,true,false,true]],[ids[3],[true]]]) {
  assert.deepEqual(index.get(id).ruleContract.clauses.map(c=>c.rosterEffects[0].conditions[0].predicate.arguments.value),values);
  assert.ok(index.get(id).ruleContract.clauses.every(c=>c.rosterEffects[0].conditions[0].predicate.predicate==='LEADING'));
}
// These expectations come from the captured source clauses above, independently
// of the generic effect validator. Syntactically valid scope/parameter drift
// must still fail source parity.
function sourceShape(candidate) {
  for(const [i,id]of ids.entries()) {
    const effects=candidate.entities.find(e=>e.id===id).ruleContract.clauses.flatMap(c=>c.rosterEffects);
    assert.deepEqual(effects.map(e=>[e.ability.canonicalId,e.targetSubject,e.unitScope||'',JSON.stringify(e.ability.parameters)].join('|')),expected[i]);
    assert.deepEqual(effects.map(e=>e.targetBinding),expectedBindings[i]);
  }
  const clauses=candidate.entities.find(e=>e.id===ids[3]).ruleContract.clauses;
  assert.ok(clauses.every(c=>c.rosterEffects[0].conditions.some(p=>p.binding==='SOURCE'&&p.predicate.predicate==='LEADING'&&p.predicate.arguments.value===true)));
}
sourceShape(book);
const mutations=[
  [0,e=>e.ruleContract.clauses[0].rosterEffects[0].targetSubject='MODEL'],
  [6,e=>e.ruleContract.clauses[0].rosterEffects[0].unitScope='FORMED'],
  [2,e=>e.ruleContract.clauses[2].rosterEffects[0].ability.parameters.distance=9],
  [6,e=>e.ruleContract.clauses[0].rosterEffects[0].ability.parameters.distance=12],
  [3,e=>e.ruleContract.clauses[0].rosterEffects[0].conditions=[]],
  [2,e=>e.ruleContract.clauses[1].rosterEffects[0].targetBinding='SOURCE_UNIT_MODELS']
];
for(const [i,mutate]of mutations){const changed=structuredClone(book);mutate(changed.entities.find(e=>e.id===ids[i]));assert.throws(()=>sourceShape(changed),'Source scope/parameter mutation was not detected');}
assert.deepEqual(book.rosterAbilityReferences,abilityReferences(),'Canonical registry resolution drift');
validateRosterEffects(book,evaluator.validatePredicate,evaluator.evaluatePredicate);

function unit(instanceId,name,enhancementIds=[],mixed=false){
  const canonicalUnitId='unit-'+name,canonical=index.get(canonicalUnitId);
  const profileIds=mixed?canonical.data.profileIds:[canonical.data.profileIds[0]];
  return {instanceId,canonicalUnitId,startingStrength:mixed?9:1,
    modelRows:profileIds.map((id,i)=>({rowId:'row-'+i,canonicalProfileId:id,quantity:mixed&&i===1?8:1,selections:[],loadouts:[]})),
    selections:[],equipmentContextKnown:true,warlord:false,enhancementIds};
}
function roster(units,detachmentIds,attachments=[]){return {
  schema:'roster-v2/roster',bookId:book.bookId,rosterId:'am-ability-fixture',units,attachments,detachmentIds,
  detachments:detachmentIds.map((id,i)=>({instanceId:'det-'+i,canonicalDetachmentId:id})),warlordInstanceId:null};}
const touched=new Set();let cases=0;
function run(state){
  const before=structuredClone(state),result=executeRosterEffects(book,
    validateRoster(book,state,book.rosterAttachmentPolicies),{evaluatePredicate:evaluator.evaluatePredicate});
  assert.deepEqual(state,before,'Roster state mutated');cases++;
  for(const u of result.units)for(const p of u.applied){
    touched.add(p.ruleId+'/'+p.effectId);
    const rule=index.get(p.ruleId),effect=rule.ruleContract.clauses.find(c=>c.id===p.clauseId).rosterEffects.find(e=>e.id===p.effectId);
    assert.equal(p.targetInstanceId,u.instanceId,'Wrong physical provenance target');
    assert.equal(p.targetAbilityId,effect.ability.canonicalId,'Canonical ability provenance lost');
    assert.deepEqual(p.abilityParameters,effect.ability.parameters,'Ability parameter provenance lost');
    assert.equal(p.operation,'GRANT_ABILITY');
    if(rule.kind==='ENHANCEMENT')assert.ok(state.units.find(x=>x.instanceId===p.sourceInstanceId)?.enhancementIds.includes(rule.id),'Wrong physical Enhancement source');
    else assert.equal(p.sourceInstanceId,null,'Global Detachment effect invented physical source');
    if(effect.targetSubject==='MODEL')assert.ok(u.profiles.some(m=>m.canonicalProfileId===p.targetProfileId&&m.scopeId===p.targetCompositionId),'Wrong MODEL profile provenance');
    else assert.equal(p.targetProfileId,null,'UNIT grant pretended to target MODEL profile');
  }
  return result;
}
const get=(r,id)=>r.units.find(u=>u.instanceId===id);
const has=(abilities,id,parameters={})=>(abilities||[]).some(a=>a.canonicalId===id&&JSON.stringify(a.parameters)===JSON.stringify(parameters));
const modelHas=(r,id,ability,parameters={})=>get(r,id).profiles.every(p=>has(p.abilities,ability,parameters));
const unitHas=(r,id,ability,parameters={})=>has(get(r,id).abilities,ability,parameters);

for(const i of [0,4,5]){
  const id=ids[i],det=index.get(id).parentId,name=i===5?'skitarii-marshal':'tech-priest-dominus',
    ability=i===0?'core-fights-first':i===4?'core-stealth':'core-infiltrators',
    a=unit('owner',name,[id]),b=unit('duplicate',name),body=unit('body','skitarii-vanguard'),
    state=roster([a,b,body],[det]),standalone=run(state);
  assert.ok(unitHas(standalone,'owner',ability)&&!unitHas(standalone,'duplicate',ability));
  assert.ok(!modelHas(standalone,'owner',ability),'UNIT grant rewrote MODEL abilities');
  state.attachments=[{leaderInstanceId:'owner',bodyguardInstanceId:'body',role:i===5?'SUPPORT':'LEADER'}];
  const attached=run(state);assert.ok(unitHas(attached,'owner',ability)&&unitHas(attached,'body',ability));
  assert.ok(!unitHas(attached,'duplicate',ability)&&!modelHas(attached,'body',ability));
  assert.deepEqual(run(JSON.parse(JSON.stringify(state))),attached,'Reload/backup lost UNIT scope');
  state.attachments=[];assert.deepEqual(run(state),standalone,'Detach did not remove formed grant');
}
{
  const id=ids[2],a=unit('owner','skitarii-marshal',[id]),b=unit('duplicate','skitarii-marshal'),
    body=unit('body','skitarii-vanguard'),other=unit('other','skitarii-vanguard'),
    state=roster([a,b,body,other],['detachment-skitarii-hunter-cohort']);
  const standalone=run(state);
  assert.ok(modelHas(standalone,'owner','core-infiltrators')&&modelHas(standalone,'owner','core-scouts',{distance:6}));
  assert.ok(!modelHas(standalone,'body','core-scouts',{distance:6}));
  state.attachments=[{leaderInstanceId:'owner',bodyguardInstanceId:'body',role:'SUPPORT'}];
  const attached=run(state);
  for(const target of ['owner','body'])assert.ok(modelHas(attached,target,'core-infiltrators')&&modelHas(attached,target,'core-scouts',{distance:6}));
  for(const target of ['duplicate','other'])assert.ok(!modelHas(attached,target,'core-scouts',{distance:6}));
  assert.deepEqual(run(state),attached,'Rebuild accumulated ability');
  state.attachments=[];assert.deepEqual(run(state),standalone);
  state.attachments=[{leaderInstanceId:'owner',bodyguardInstanceId:'body',role:'SUPPORT'}];assert.deepEqual(run(state),attached);
}
{
  const id=ids[3],a=unit('owner','tech-priest-dominus',[id]),b=unit('duplicate','tech-priest-dominus'),
    body=unit('body','servitor-battleclade',[],true),other=unit('other','servitor-battleclade',[],true),
    state=roster([a,b,body,other],[index.get(id).parentId]);
  const standalone=run(state);assert.ok(!modelHas(standalone,'owner','core-stealth'));
  state.attachments=[{leaderInstanceId:'owner',bodyguardInstanceId:'body',role:'LEADER'}];
  const attached=run(state);assert.ok(modelHas(attached,'owner','core-stealth')&&modelHas(attached,'body','core-stealth'));
  assert.ok(!modelHas(attached,'duplicate','core-stealth')&&!modelHas(attached,'other','core-stealth'));
  state.attachments=[];assert.deepEqual(run(state),standalone);
  state.attachments=[{leaderInstanceId:'owner',bodyguardInstanceId:'body',role:'LEADER'}];assert.deepEqual(run(state),attached);
}
{
  const id=ids[6],state=roster([unit('owner','serberys-raiders',[id]),unit('duplicate','serberys-raiders'),
    unit('wrong','skitarii-marshal',[id])],[index.get(id).parentId]),result=run(state);
  assert.ok(unitHas(result,'owner','core-lone-operative',{distance:15}));
  assert.ok(!unitHas(result,'duplicate','core-lone-operative',{distance:15})&&!unitHas(result,'wrong','core-lone-operative',{distance:15}));
  assert.ok(!modelHas(result,'owner','core-lone-operative',{distance:15}));
}
{
  const names=['skitarii-vanguard','serberys-raiders','ironstrider-ballistarii','onager-dunecrawler','tech-priest-dominus'];
  const state=roster(names.map((name,i)=>unit('global-'+i,name)),['detachment-skitarii-hunter-cohort']),result=run(state);
  for(let i=0;i<names.length;i++)assert.equal(unitHas(result,'global-'+i,'core-stealth'),i<3,'Source UNIT selector widened/lost');
  const absent=run(roster(state.units,['detachment-data-psalm-conclave']));
  assert.ok(absent.units.every(u=>!has(u.abilities,'core-stealth')),'Unselected Detachment leaked');
}
const wanted=new Set(ids.flatMap(id=>index.get(id).ruleContract.clauses.flatMap(c=>c.rosterEffects.map(e=>id+'/'+e.id))));
assert.deepEqual(touched,wanted,'New grant was never executed');
for(const entity of readJson('generated/effective.json').entities){
  const {ruleContract,...facts}=built.book.entities.find(e=>e.id===entity.id);assert.deepEqual(facts,entity,'Factual source changed');
}
console.log(JSON.stringify({status:'PASS',sourceOwners:7,sourceGrants:wanted.size,cases,blockedOwners:built.blockedIds.size,
  canonicalReferences:5,mutations:mutations.length,unitModelIsolation:true,detachReattach:true,parameters:true,legacyReads:0}));
