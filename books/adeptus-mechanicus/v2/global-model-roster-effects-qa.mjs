import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {buildAdMechContracts,directory} from './rule-contract-build.mjs';
import {compilerInputs} from './rule-contract-context.mjs';
import {validateRoster,withRosterDetachments} from '../../shared/roster-v2/context.mjs';
import {executeRosterEffects,validateRosterEffects} from '../../shared/roster-v2/effects.mjs';

// Current accepted source is the oracle. This bounded conformance consumer is
// not an AdMech roster implementation and does not use legacy rule contracts.
const cyber='detachment-cohort-cybernetica:rule',forge='detachment-lords-of-the-forge:rule',ids=[cyber,forge];
const built=buildAdMechContracts(),book=compilerInputs(built.book).book,index=new Map(book.entities.map(e=>[e.id,e]));
for(const e of book.entities)if(!ids.includes(e.id))delete e.ruleContract;
const initial=structuredClone(book),api=withRosterDetachments(built.schema.evaluator);
assert.deepEqual([...built.blockedIds],[]);
const quotes={
  [cyber]:'Add 2" to the Move characteristic of models in LEGIO CYBERNETICA units from your army.',
  [forge]:'Friendly TECH-PRIEST models have:\n- 4+ InSv.\n- Feel No Pain 5+.'
};
const sourceRoot=path.resolve(directory,'../../..');
for(const id of ids){const e=index.get(id),capture=JSON.parse(fs.readFileSync(path.join(sourceRoot,e.provenance.sourcePath),'utf8')),
  raw=e.provenance.pointer.slice(1).split('/').reduce((v,k)=>v[k],capture);
  assert.equal(e.data.text,raw.text);assert.ok(raw.text.includes(quotes[id]));}
function sourceParity(candidate){
  const c=candidate.entities.find(e=>e.id===cyber),f=candidate.entities.find(e=>e.id===forge);
  const effects=e=>e.ruleContract.clauses.flatMap(c=>c.rosterEffects),ce=effects(c),fe=effects(f);
  assert.equal(ce.length,1);assert.equal(fe.length,2);
  for(const [e,unitKey,modelKey,scope]of [[ce[0],'LEGIO CYBERNETICA',null,'FORMED'],...fe.map(e=>[e,null,'TECH-PRIEST','PHYSICAL'])]){
    assert.equal(e.targetBinding,'ROSTER_MODELS');assert.equal(e.targetSubject,'MODEL');assert.equal(e.containingUnitScope,scope);
    for(const [key,subject,keyword]of [['unit','UNIT',unitKey],['model','MODEL',modelKey]]){
      const p=e.recipientSelectors[key];assert.equal(p.subject,subject);assert.equal(p.contextLevel,'STATIC');
      assert.equal(p.predicate,keyword?subject+'_KEYWORD':'ALWAYS');assert.deepEqual(p.arguments,keyword?{keyword}:{});
    }
    assert.equal(e.conditions.length,0);assert.equal(e.lifetime,'WHILE_SOURCE_SELECTED');
  }
  assert.deepEqual([ce[0].operation,ce[0].field,ce[0].mode,ce[0].value],['MODIFY_STAT','M','ADD',2]);
  assert.deepEqual([fe[0].operation,fe[0].field,fe[0].mode,fe[0].value],['MODIFY_STAT','INSV','SET',4]);
  assert.deepEqual([fe[1].operation,fe[1].ability],['GRANT_MODEL_ABILITY',{name:'Feel No Pain',value:5}]);
  for(const e of [c,f]){
    assert.equal(e.ruleContract.detachmentId,e.parentId);
    const battle=e.ruleContract.clauses.filter(c=>c.rosterClassification==='BATTLE_ONLY');assert.equal(battle.length,1);assert.equal(battle[0].rosterEffects.length,0);
    assert.ok(battle[0].conditions.some(p=>p.contextLevel==='BATTLE'&&p.arguments.key==='battleShocked'));
    assert.equal(battle[0].evidence.quote,candidate.entities.find(x=>x.id===e.id).data.text.slice(e.id===cyber?e.data.text.indexOf('In addition,'):e.data.text.indexOf('Friendly TECH-PRIEST models have the following ability:')));
  }
}
sourceParity(book);validateRosterEffects(book,api.validatePredicate,api.evaluatePredicate);
let mutations=0;
for(const mutate of [
  b=>b.entities.find(e=>e.id===cyber).ruleContract.clauses[0].rosterEffects[0].recipientSelectors.unit.arguments.keyword='TECH-PRIEST',
  b=>b.entities.find(e=>e.id===cyber).ruleContract.clauses[0].rosterEffects[0].containingUnitScope='PHYSICAL',
  b=>b.entities.find(e=>e.id===forge).ruleContract.clauses[0].rosterEffects[0].recipientSelectors.model={predicate:'ALWAYS',subject:'MODEL',contextLevel:'STATIC',arguments:{}},
  b=>b.entities.find(e=>e.id===forge).ruleContract.clauses[0].rosterEffects[0].recipientSelectors.model.subject='UNIT',
  b=>b.entities.find(e=>e.id===forge).ruleContract.clauses[1].rosterEffects[0].ability.value=4,
  b=>b.entities.find(e=>e.id===cyber).ruleContract.clauses[0].rosterEffects[0].value=1,
  b=>b.entities.find(e=>e.id===forge).ruleContract.clauses[2].rosterEffects.push(structuredClone(b.entities.find(e=>e.id===forge).ruleContract.clauses[0].rosterEffects[0])),
  b=>b.entities.find(e=>e.id===forge).ruleContract.detachmentId='detachment-cohort-cybernetica'
]){const changed=structuredClone(book);mutate(changed);assert.throws(()=>sourceParity(changed));mutations++;}
function unit(instanceId,name){const canonicalUnitId='unit-'+name,e=index.get(canonicalUnitId),mixed=e.data.profileIds.length>1;
  return {instanceId,canonicalUnitId,startingStrength:mixed?9:1,modelRows:e.data.profileIds.map((id,i)=>({rowId:'row-'+i,canonicalProfileId:id,quantity:mixed&&i===1?8:1,selections:[],loadouts:[]})),selections:[],equipmentContextKnown:true,warlord:false,enhancementIds:[]};}
const state=(units,detachmentIds,attachments=[])=>({schema:'roster-v2/roster',bookId:book.bookId,rosterId:'source-global-profile-control',units,attachments,
  detachmentIds,detachments:detachmentIds.map((id,i)=>({instanceId:'det-'+i,canonicalDetachmentId:id})),warlordInstanceId:null});
const cyberDet=index.get(cyber).parentId,forgeDet=index.get(forge).parentId;
let cases=0,applied=0;const touched=new Set();
function run(s){const before=structuredClone(s),result=executeRosterEffects(book,validateRoster(book,s,book.rosterAttachmentPolicies),{evaluatePredicate:api.evaluatePredicate});
  assert.deepEqual(s,before);assert.deepEqual(book,initial,'Canonical facts mutated');cases++;
  for(const u of result.units)for(const p of u.applied){
    applied++;touched.add(p.ruleId+'/'+p.effectId);assert.equal(p.sourceInstanceId,null);assert.equal(p.targetInstanceId,u.instanceId);assert.ok(ids.includes(p.ruleId));
    const model=u.profiles.find(m=>m.scopeId===p.targetCompositionId);assert.ok(model,'Wrong target composition scope');assert.equal(p.targetProfileId,model.canonicalProfileId);
    const effect=index.get(p.ruleId).ruleContract.clauses.flatMap(c=>c.rosterEffects).find(e=>e.id===p.effectId);
    assert.equal(p.operation,effect.operation);assert.deepEqual(p.sourceFields,effect.sourceFields);assert.equal(p.lifetime,'WHILE_SOURCE_SELECTED');
    if(p.ruleId===forge)assert.ok(model.keywords.includes('TECH-PRIEST'),'Sibling MODEL inherited another profile keyword');
    if(p.ruleId===cyber){assert.equal(p.field,'M');assert.deepEqual(p.targetFieldPath,['stats','M']);assert.equal(Number(String(p.after).replace('"','')),Number(String(p.before).replace('"',''))+2);}
  }
  return result;
}
function verify(result,selected){for(const u of result.units)for(const m of u.profiles){const base=index.get(m.canonicalProfileId).data.stats;
  const containing=result.formedUnits.find(group=>group.memberInstanceIds.includes(u.instanceId)) || u;
  const c=selected.includes(cyberDet)&&containing.keywords.includes('LEGIO CYBERNETICA');
  assert.equal(m.profile.stats.M,c?String(Number(base.M.replace('"',''))+2)+'"':base.M);
  const f=selected.includes(forgeDet)&&m.keywords.includes('TECH-PRIEST');
  if(f){assert.equal(m.profile.INSV,'4+');assert.ok(m.abilities.some(a=>a.name==='Feel No Pain'&&a.value===5));}
  else{assert.equal(m.profile.INSV,base.INSV);assert.ok(!m.abilities.some(a=>a.name==='Feel No Pain'));}
  assert.equal(m.profile.stats.OC,base.OC,'Unknown battle-shock clause executed');
}}
const units=[unit('battleclade-a','servitor-battleclade'),unit('battleclade-b','servitor-battleclade'),unit('dominus','tech-priest-dominus'),unit('unrelated','skitarii-rangers'),unit('robots-a','kastelan-robots'),unit('robots-b','kastelan-robots'),unit('datasmith','cybernetica-datasmith')];
for(const dets of [["detachment-rad-zone-corps"],[cyberDet],[forgeDet],[cyberDet,forgeDet],[forgeDet,cyberDet]]){
  const s=state(units,dets),alone=run(s);verify(alone,dets);
  const underseer=alone.units.find(u=>u.instanceId==='battleclade-a').profiles;
  assert.ok(underseer[0].keywords.includes('TECH-PRIEST'));assert.ok(!underseer[1].keywords.includes('TECH-PRIEST'));
  s.attachments=[{leaderInstanceId:'dominus',bodyguardInstanceId:'battleclade-a',role:'LEADER'},{leaderInstanceId:'datasmith',bodyguardInstanceId:'robots-a',role:'SUPPORT'}];
  const attached=run(s);verify(attached,dets);
  assert.ok(attached.units.find(u=>u.instanceId==='battleclade-a').keywords.includes('TECH-PRIEST'));
  assert.ok(!attached.units.find(u=>u.instanceId==='battleclade-a').profiles[1].keywords.includes('TECH-PRIEST'));
  assert.deepEqual(run(s),attached);assert.deepEqual(run(JSON.parse(JSON.stringify(s))),attached);
  const reversed=structuredClone(s);reversed.attachments.reverse();assert.deepEqual(run(reversed),attached);
  s.attachments=[];assert.deepEqual(run(s),alone);s.attachments=[{leaderInstanceId:'dominus',bodyguardInstanceId:'battleclade-a',role:'LEADER'},{leaderInstanceId:'datasmith',bodyguardInstanceId:'robots-a',role:'SUPPORT'}];assert.deepEqual(run(s),attached);
  assert.deepEqual(alone.units.find(u=>u.instanceId==='battleclade-b'),attached.units.find(u=>u.instanceId==='battleclade-b'));
  assert.deepEqual(alone.units.find(u=>u.instanceId==='robots-b'),attached.units.find(u=>u.instanceId==='robots-b'));
}
assert.deepEqual(touched,new Set([cyber+'/model-move',forge+'/model-invulnerable',forge+'/model-fnp']));
console.log(JSON.stringify({status:'PASS',sourceOwners:2,sourceEffects:3,blockedOwners:built.blockedIds.size,runtimeCases:cases,appliedProvenanceChecks:applied,mutations,mixedUnderseerServitor:'PASS',canonicalFactsImmutable:'PASS'}));
