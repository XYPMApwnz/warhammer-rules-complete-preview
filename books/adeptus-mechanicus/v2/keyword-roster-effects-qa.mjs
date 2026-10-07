import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {buildAdMechContracts,readJson,directory} from './rule-contract-build.mjs';
import {compilerInputs} from './rule-contract-context.mjs';
import {executeRosterEffects,validateRosterEffects} from '../../shared/roster-v2/effects.mjs';
import {validateRoster,withRosterDetachments} from '../../shared/roster-v2/context.mjs';

// This is a bounded kernel conformance test of exactly seven whole source
// owners. It is not a general AdMech roster runtime or a legacy adapter.
const ids=[...['archaeopter-fusilave','archaeopter-stratoraptor','archaeopter-transvector',
  'cybernetica-datasmith','onager-dunecrawler'].map(id=>`datasheet-${id}:section:1`),
  'detachment-haloscreed-battle-clade:enhancement:1','detachment-eradication-cohort:enhancement:2'];
const selected=new Set(ids),built=buildAdMechContracts(),full=compilerInputs(built.book).book;
const book=structuredClone(full),index=new Map(book.entities.map(e=>[e.id,e]));
for(const entity of book.entities)if(!selected.has(entity.id))delete entity.ruleContract;
const evaluator=withRosterDetachments(built.schema.evaluator);
assert.equal(built.blockedIds.size,1);
assert.equal(built.schema.evaluator.validateContracts(book).rules,7);
validateRosterEffects(book,evaluator.validatePredicate,evaluator.evaluatePredicate);

// Read the captured source afresh, independently of declarations and generated
// answers, and verify every field of every newly represented owner.
const sourceCache=new Map(),root=path.resolve(directory,'../../..');
for(const id of ids){
  const entity=index.get(id),{sourcePath,pointer}=entity.provenance;
  if(!sourceCache.has(sourcePath))sourceCache.set(sourcePath,JSON.parse(fs.readFileSync(path.join(root,sourcePath),'utf8')));
  const raw=pointer.slice(1).split('/').reduce((v,key)=>v[key],sourceCache.get(sourcePath));
  for(const field of entity.ruleContract.sourceFields)
    assert.deepEqual(field.reduce((v,key)=>v[key],entity.data),field.reduce((v,key)=>v[key],raw),`${id}: captured source field`);
  assert.ok(!built.blockedIds.has(id));
}
const opShape=e=>[e.operation,e.targetBinding,e.targetSubject,e.keyword].join('|');
const expected=[...Array.from({length:3},()=>['GRANT_MODEL_KEYWORD|SOURCE_MODEL|MODEL|SMOKE']),
  ['REMOVE_KEYWORD|SOURCE_UNIT|UNIT|VEHICLE','GRANT_UNIT_KEYWORD|SOURCE_UNIT|UNIT|INFANTRY'],
  ['REMOVE_KEYWORD|SOURCE_MODEL|MODEL|SMOKE'],['GRANT_MODEL_KEYWORD|SOURCE_FORMED_MODELS|MODEL|HALO OVERRIDE'],
  ['GRANT_MODEL_KEYWORD|SOURCE_UNIT_MODELS|MODEL|SKITARII','GRANT_MODEL_KEYWORD|SOURCE_FORMED_MODELS|MODEL|SKITARII']];
for(const [i,id]of ids.entries())assert.deepEqual(index.get(id).ruleContract.clauses.flatMap(c=>c.rosterEffects.map(opShape)),expected[i]);
for(const id of ids.slice(0,3))assert.deepEqual(index.get(id).ruleContract.clauses.map(c=>c.rosterClassification),['BATTLE_ONLY','ROSTER_EXECUTABLE','BATTLE_ONLY']);
assert.equal(index.get(ids[3]).ruleContract.clauses[0].rosterClassification,'BATTLE_ONLY');
assert.equal(index.get(ids[4]).ruleContract.clauses.filter(c=>c.rosterClassification==='BATTLE_ONLY').length,3);
const halo=index.get(ids[5]).ruleContract;
assert.equal(halo.clauses[1].deferredBattleMetadata.kind,'SELECTION_EXCLUSION');
assert.equal(halo.clauses[1].rosterClassification,'BATTLE_ONLY');
assert.equal(halo.clauses[1].rosterEffects.length,0);
assert.equal(halo.clauses[0].lifetimeEvidence.quote,'until the end of the battle');

const detHalo='detachment-haloscreed-battle-clade',detErad='detachment-eradication-cohort';
function unit(instanceId,name,{enhancementIds=[],equipmentContextKnown=true,mixed=false}={}){
  const canonicalUnitId='unit-'+name,canonical=index.get(canonicalUnitId);
  const profileIds=mixed?canonical.data.profileIds:[canonical.data.profileIds[0]];
  const modelRows=profileIds.map((id,i)=>({rowId:'row-'+i,canonicalProfileId:id,quantity:mixed&&i===1?8:1,selections:[],loadouts:[]}));
  return {instanceId,canonicalUnitId,startingStrength:modelRows.reduce((n,r)=>n+r.quantity,0),modelRows,
    selections:[],equipmentContextKnown,warlord:false,enhancementIds};
}
function state(units,attachments=[],detachmentIds=[detErad]){
  return {schema:'roster-v2/roster',bookId:book.bookId,rosterId:'am-keyword-fixture',units,attachments,
    detachmentIds,detachments:detachmentIds.map((id,i)=>({instanceId:'det-'+i,canonicalDetachmentId:id})),warlordInstanceId:null};
}
const allApplied=new Set();
function run(input){
  const before=structuredClone(input),verified=validateRoster(book,input,book.rosterAttachmentPolicies);
  const result=executeRosterEffects(book,verified,{evaluatePredicate:evaluator.evaluatePredicate});
  assert.deepEqual(input,before,'Execution mutated saved roster');
  for(const unit of result.units)for(const entry of unit.applied)allApplied.add(`${entry.ruleId}/${entry.effectId}`);
  return result;
}
const physical=(result,id)=>result.units.find(u=>u.instanceId===id);
const modelHas=(result,id,keyword)=>physical(result,id).profiles.every(m=>m.keywords.includes(keyword));
const unitHas=(result,id,keyword)=>physical(result,id).keywords.includes(keyword);
function equip(unit,sectionId,block,quantity=1){
  unit.selections=[{selectionKey:'selected-equipment',physicalQuantity:quantity,canonicalProfileIds:[],
    canonicalEquipmentIds:[sectionId],canonicalFieldPaths:{[sectionId]:[`/blocks/${block}/text`]}}];
}

for(const name of ['archaeopter-fusilave','archaeopter-stratoraptor','archaeopter-transvector']){
  const a=unit('a',name),b=unit('b',name),id=`datasheet-${name}:section:1`;
  equip(a,id,1);
  const roster=state([a,b]),result=run(roster);
  assert.ok(modelHas(result,'a','SMOKE')&&unitHas(result,'a','SMOKE'));
  assert.ok(!modelHas(result,'b','SMOKE')&&!unitHas(result,'b','SMOKE'));
  assert.ok(!physical(result,'a').intrinsicKeywords.includes('SMOKE'),'Grant rewrote intrinsic source identity');
  assert.ok(physical(result,'a').conditional.some(c=>c.clauseId==='block-1'),'Lost battle clause');
  assert.deepEqual(run(roster),result,'Repeated recomputation accumulated a grant');
  equip(a,id,2);assert.ok(!modelHas(run(roster),'a','SMOKE'),'Command uplink selected as chaff');
  equip(a,id,1,0);assert.ok(!modelHas(run(roster),'a','SMOKE'),'Zero quantity grants keyword');
  a.selections=[];a.equipmentContextKnown=false;
  const unknown=run(roster);assert.ok(!modelHas(unknown,'a','SMOKE'));
  assert.ok(physical(unknown,'a').conditional.some(c=>c.clauseId==='block-2'&&c.state==='UNKNOWN'));
  a.equipmentContextKnown=true;assert.ok(!modelHas(run(roster),'a','SMOKE'));
}
{
  const a=unit('a','onager-dunecrawler'),b=unit('b','onager-dunecrawler'),roster=state([a,b]);
  assert.ok(modelHas(run(roster),'a','SMOKE'));
  equip(a,ids[4],2);const result=run(roster);
  assert.ok(!modelHas(result,'a','SMOKE')&&!unitHas(result,'a','SMOKE'));
  assert.ok(modelHas(result,'b','SMOKE'));
  assert.ok(physical(result,'a').intrinsicKeywords.includes('SMOKE'));
  assert.deepEqual(run(roster),result);
  equip(a,ids[4],1);assert.ok(modelHas(run(roster),'a','SMOKE'),'Wrong source field removed SMOKE');
  a.selections=[];assert.ok(modelHas(run(roster),'a','SMOKE'),'Removing equipment did not restore SMOKE');
  a.equipmentContextKnown=false;const unknown=run(roster);
  assert.ok(modelHas(unknown,'a','SMOKE'));
  assert.ok(physical(unknown,'a').conditional.some(c=>c.clauseId==='data-tether-smoke-removal'&&c.state==='UNKNOWN'));
}
{
  const a=unit('a','cybernetica-datasmith'),b=unit('b','cybernetica-datasmith'),robots=unit('robots','kastelan-robots');
  const roster=state([a,b,robots]),standalone=run(roster);
  assert.ok(!unitHas(standalone,'a','VEHICLE')&&unitHas(standalone,'a','INFANTRY'));
  assert.ok(modelHas(standalone,'a','VEHICLE')&&!modelHas(standalone,'a','INFANTRY'),'UNIT operation changed MODEL scope');
  roster.attachments=[{leaderInstanceId:'a',bodyguardInstanceId:'robots',role:'SUPPORT'}];
  const attached=run(roster);
  assert.ok(unitHas(attached,'a','VEHICLE')&&!unitHas(attached,'a','INFANTRY'));
  assert.ok(!unitHas(attached,'b','VEHICLE')&&unitHas(attached,'b','INFANTRY'));
  assert.ok(unitHas(attached,'robots','VEHICLE')&&!unitHas(attached,'robots','INFANTRY'));
  assert.deepEqual(run(roster),attached);
  roster.attachments=[];assert.deepEqual(run(roster),standalone,'Detach did not restore Data-severed');
}
{
  const a=unit('a','cybernetica-datasmith',{enhancementIds:[ids[5]]}),b=unit('b','cybernetica-datasmith'),robots=unit('robots','kastelan-robots');
  const roster=state([a,b,robots],[],[detHalo]);
  const alone=run(roster);assert.ok(!modelHas(alone,'a','HALO OVERRIDE'));
  roster.attachments=[{leaderInstanceId:'a',bodyguardInstanceId:'robots',role:'SUPPORT'}];
  const attached=run(roster);assert.ok(modelHas(attached,'a','HALO OVERRIDE')&&modelHas(attached,'robots','HALO OVERRIDE'));
  assert.ok(!modelHas(attached,'b','HALO OVERRIDE'));
  assert.ok(attached.formedUnits[0].keywords.includes('HALO OVERRIDE'));
  assert.deepEqual(run(roster),attached);
  roster.attachments=[];assert.deepEqual(run(roster),alone);
  a.enhancementIds=[];assert.ok(!modelHas(run(roster),'a','HALO OVERRIDE'));
}
{
  const a=unit('a','tech-priest-dominus',{enhancementIds:[ids[6]]}),b=unit('b','tech-priest-dominus'),
    mixed=unit('mixed','servitor-battleclade',{mixed:true}),roster=state([a,b,mixed]);
  const standalone=run(roster);assert.ok(modelHas(standalone,'a','SKITARII')&&!modelHas(standalone,'b','SKITARII'));
  const [underseer,servitors]=physical(standalone,'mixed').profiles;
  assert.ok(underseer.keywords.includes('TECH-PRIEST')&&!servitors.keywords.includes('TECH-PRIEST'),'Mixed intrinsic profile isolation');
  roster.attachments=[{leaderInstanceId:'a',bodyguardInstanceId:'mixed',role:'LEADER'}];
  const attached=run(roster);
  assert.ok(modelHas(attached,'a','SKITARII')&&modelHas(attached,'mixed','SKITARII'));
  assert.ok(!modelHas(attached,'b','SKITARII'));
  assert.ok(!physical(attached,'mixed').profiles[1].keywords.includes('TECH-PRIEST'),'UNIT union leaked into MODEL');
  assert.deepEqual(run(roster),attached);
  roster.attachments=[];assert.deepEqual(run(roster),standalone);
  a.enhancementIds=[];assert.ok(!modelHas(run(roster),'a','SKITARII'));
  const marshal=unit('marshal','skitarii-marshal',{enhancementIds:[ids[6]]});
  assert.ok(!physical(run(state([marshal])),'marshal').applied.some(e=>e.ruleId===ids[6]),'Non-TECH-PRIEST owner admitted');
  for(const profile of physical(standalone,'mixed').profiles)
    assert.equal(evaluator.evaluatePredicate(index.get(ids[6]).ruleContract.assignment.selector,
      {subject:'MODEL',modelId:profile.canonicalProfileId,intrinsicKeywords:new Set(profile.keywords),keywords:new Set(profile.keywords),roster:{}}),'FALSE',
      'Non-CHARACTER mixed profile admitted');
}
const wanted=new Set(ids.flatMap(id=>index.get(id).ruleContract.clauses.flatMap(c=>c.rosterEffects.map(e=>`${id}/${e.id}`))));
assert.deepEqual(allApplied,wanted,'New source keyword effect never exercised');
for(const entity of readJson('generated/effective.json').entities){
  const {ruleContract,...facts}=built.book.entities.find(e=>e.id===entity.id);
  assert.deepEqual(facts,entity,'Book-owned lowering changed factual snapshot');
}
console.log(JSON.stringify({status:'PASS',sourceOwners:7,sourceEffects:wanted.size,blockedOwners:built.blockedIds.size,
  actualSharedExecution:true,profileIsolation:true,repeatAttachDetach:true,battleActionsExecuted:false,legacyReads:0}));
