import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {buildAdMechContracts,readJson,directory} from './rule-contract-build.mjs';
import {compilerInputs} from './rule-contract-context.mjs';
import {validateRoster,withRosterDetachments} from '../../shared/roster-v2/context.mjs';
import {executeRosterEffects,validateRosterEffects} from '../../shared/roster-v2/effects.mjs';

// Bounded current-source conformance, not an AdMech roster implementation.
const ids=['detachment-haloscreed-battle-clade:enhancement:2','detachment-haloscreed-battle-clade:enhancement:3',
  'detachment-eradication-cohort:enhancement:1','detachment-eradication-cohort:enhancement:3','detachment-eradication-cohort:enhancement:4'];
const sourceQuotes=['The Conqueror Imperative and Protector Imperative are both active for the bearer’s unit.',
  'Add 6" to the range characteristic of ranged weapons equipped by models in the bearer’s unit',
  'The Conqueror Imperative and Protector Imperative are both active for the bearer’s unit.',
  'Add 6" to the Range characteristic of ranged weapons equipped by models in the bearer’s unit, and add 1 to the Strength characteristic of those weapons.',
  'Add 2 to the Attacks characteristic of melee weapons equipped by the bearer, and improve the Armour Penetration and Damage characteristics of those weapons by 1.'];
const expected=[['BS|ADD|-1|ranged|UNIT|SOURCE_UNIT','HEAVY|||ranged|UNIT|SOURCE_UNIT','WS|ADD|-1|melee|UNIT|SOURCE_UNIT','ASSAULT|||ranged|UNIT|SOURCE_UNIT'],
  ['range|ADD|6|ranged|UNIT|SOURCE_UNIT'],
  ['BS|ADD|-1|ranged|UNIT|SOURCE_UNIT','HEAVY|||ranged|UNIT|SOURCE_UNIT','WS|ADD|-1|melee|UNIT|SOURCE_UNIT','ASSAULT|||ranged|UNIT|SOURCE_UNIT'],
  ['range|ADD|6|ranged|UNIT|SOURCE_UNIT','strength|ADD|1|ranged|UNIT|SOURCE_UNIT'],
  ['attacks|ADD|2|melee|MODEL|SOURCE_MODEL','ap|ADD|-1|melee|MODEL|SOURCE_MODEL','damage|ADD|1|melee|MODEL|SOURCE_MODEL']];
const built=buildAdMechContracts(),book=structuredClone(compilerInputs(built.book).book);
for(const entity of book.entities)if(!ids.includes(entity.id)&&!['army-rule-doctrina-imperatives:protector-imperative','army-rule-doctrina-imperatives:conqueror-imperative'].includes(entity.id))delete entity.ruleContract;
const index=new Map(book.entities.map(e=>[e.id,e])),evaluator=withRosterDetachments(built.schema.evaluator),beforeBook=structuredClone(book);
assert.equal(built.blockedIds.size,1);
assert.deepEqual([...built.blockedIds].sort(),['detachment-lords-of-the-forge:enhancement:2']);
const signature=e=>[e.field||e.ability,e.mode||'',e.value??'',e.weaponMode,e.targetSubject,e.targetBinding].join('|');
function sourceParity(candidate){
  for(const [i,id]of ids.entries()){
    const entity=candidate.entities.find(e=>e.id===id),effects=entity.ruleContract.clauses.flatMap(c=>c.rosterEffects);
    assert.deepEqual(effects.map(signature),expected[i],'Source numeric sign/profile/owner scope drift');
    assert.ok(effects.every(e=>e.operation===(e.ability?'GRANT_WEAPON_ABILITY':'MODIFY_STAT')),'Parallel numeric mechanism');
    if(i===0||i===2){
      const refs=['army-rule-doctrina-imperatives:protector-imperative','army-rule-doctrina-imperatives:conqueror-imperative'];
      assert.deepEqual(entity.ruleContract.canonicalRuleReferences,refs);
      for(const [j,e]of effects.entries()){
        const sourceId=refs[j<2?0:1],source=candidate.entities.find(x=>x.id===sourceId);
        assert.equal(e.referencedRuleId,sourceId);assert.equal(e.sourceRuleEvidence.evidence.otherEntityId,sourceId);
        assert.ok(source.data.text.includes(e.sourceRuleEvidence.evidence.quote));
        assert.deepEqual(e.canonicalContribution,{ruleId:sourceId,clauseId:e.operation==='MODIFY_STAT'?'imperative-clause-2':'imperative-clause-1'});
        const original=source.ruleContract.clauses.find(c=>c.id===e.canonicalContribution.clauseId);
        assert.deepEqual(original.sourceFields,[['text']]);assert.equal(original.evidence.quote,e.sourceRuleEvidence.evidence.quote);
        assert.ok(e.sourceRuleEvidence.evidence.quote.includes(j===0?'Ballistic Skill':j===1?'[HEAVY]':j===2?'Weapon Skill':'[ASSAULT]'));
      }
      const battle=entity.ruleContract.clauses.filter(c=>c.rosterClassification==='BATTLE_ONLY');
      assert.equal(battle.length,2);assert.ok(battle.every(c=>c.rosterEffects.length===0));
      assert.ok(battle.every(c=>!JSON.stringify(c).includes('ImperativeActive')),'Enhancement ownership must not require unknown battle activation');
    }
  }
}
sourceParity(book);
const root=path.resolve(directory,'../../..');
for(const [i,id]of ids.entries()){
  const e=index.get(id),capture=JSON.parse(fs.readFileSync(path.join(root,e.provenance.sourcePath),'utf8'));
  const raw=e.provenance.pointer.slice(1).split('/').reduce((v,key)=>v[key],capture);
  assert.equal(e.data.text,raw.text);assert.ok(raw.text.includes(sourceQuotes[i]));
}
const mutations=[
  [0,e=>e.ruleContract.clauses[0].rosterEffects[0].value=1],
  [0,e=>e.ruleContract.clauses[0].rosterEffects[0].weaponMode='melee'],
  [0,e=>e.ruleContract.clauses[2].rosterEffects[0].field='BS'],
  [1,e=>e.ruleContract.clauses[0].rosterEffects[0].value=3],
  [4,e=>e.ruleContract.clauses[0].rosterEffects[1].value=1],
  [4,e=>e.ruleContract.clauses[0].rosterEffects[1].targetBinding='SOURCE_UNIT'],
  [0,e=>e.ruleContract.canonicalRuleReferences=[]],
  [2,e=>e.ruleContract.clauses[0].rosterEffects[0].referencedRuleId='army-rule-doctrina-imperatives'],
  [0,e=>e.ruleContract.clauses[0].rosterEffects.pop()],
  [0,e=>e.ruleContract.clauses[0].rosterEffects[0].canonicalContribution.clauseId='imperative-clause-1']
];
for(const [i,mutate]of mutations){const changed=structuredClone(book);mutate(changed.entities.find(e=>e.id===ids[i]));assert.throws(()=>sourceParity(changed));}
validateRosterEffects(book,evaluator.validatePredicate,evaluator.evaluatePredicate);
function unit(instanceId,name,enhancementIds=[],mixed=false){
  const canonicalUnitId='unit-'+name,canonical=index.get(canonicalUnitId),profiles=mixed?canonical.data.profileIds:[canonical.data.profileIds[0]];
  const selection=(weapon,i)=>({selectionKey:'weapon-'+i,physicalQuantity:1,canonicalProfileIds:[weapon],canonicalEquipmentIds:[]});
  return {instanceId,canonicalUnitId,startingStrength:mixed?9:1,
    modelRows:profiles.map((p,i)=>({rowId:'row-'+i,canonicalProfileId:p,quantity:mixed&&i===1?8:1,selections:[],loadouts:[]})),
    selections:canonical.data.weaponIds.map(selection),equipmentContextKnown:true,warlord:false,enhancementIds};
}
const roster=(units,detachmentIds,attachments=[])=>({schema:'roster-v2/roster',bookId:book.bookId,rosterId:'numeric-source-fixture',units,attachments,
  detachmentIds,detachments:detachmentIds.map((id,i)=>({instanceId:'det-'+i,canonicalDetachmentId:id})),warlordInstanceId:null});
let cases=0;const applied=new Set();
function run(state){
  const before=structuredClone(state),result=executeRosterEffects(book,validateRoster(book,state,book.rosterAttachmentPolicies),{evaluatePredicate:evaluator.evaluatePredicate});
  assert.deepEqual(state,before);assert.deepEqual(book,beforeBook,'Canonical facts mutated');cases++;
  for(const u of result.units)for(const p of u.applied){
    applied.add(p.ruleId+'/'+p.effectId);assert.equal(p.targetInstanceId,u.instanceId);
    assert.ok(state.units.find(x=>x.instanceId===p.sourceInstanceId)?.enhancementIds.includes(p.ruleId),'Wrong Enhancement source owner');
    assert.ok(index.get(p.targetWeaponProfileId)?.kind==='WEAPON_PROFILE','Weapon provenance missing');
    const effect=index.get(p.ruleId).ruleContract.clauses.flatMap(c=>c.rosterEffects).find(e=>e.id===p.effectId);
    assert.equal(p.operation,effect.operation);assert.equal(p.field,effect.field==='BS'||effect.field==='WS'?'skill':effect.field||'abilities');
  }
  return result;
}
const get=(r,id)=>r.units.find(u=>u.instanceId===id);
function assertDelta(result,instanceId,effects){
  const u=get(result,instanceId);for(const w of u.weapons){const base=index.get(w.canonicalProfileId).data,changes=effects.filter(e=>e.weaponMode===base.mode);
    for(const field of ['range','skill','attacks','strength','ap','damage']){
      const delta=changes.filter(e=>(e.field==='BS'||e.field==='WS'?'skill':e.field)===field).reduce((n,e)=>n+e.value,0);
      if(!delta||field==='skill'&&base[field]==='N/A')assert.equal(w.data[field],base[field],'Unmodified/nonapplicable field changed');
      else{const numeric=String(base[field]).match(/^(-?\d+)(["+]?)$/);assert.ok(numeric,'Fixture characteristic must be exact numeric '+w.canonicalProfileId+'/'+field+'/'+base[field]);assert.equal(w.data[field],String(Number(numeric[1])+delta)+numeric[2]);}
    }
    for(const ability of ['HEAVY','ASSAULT'])assert.equal(w.data.abilities.some(a=>a.toUpperCase()===ability),base.abilities.some(a=>a.toUpperCase()===ability)||changes.some(e=>e.ability===ability));
  }
}
for(const [i,id]of ids.entries()){
  const det=index.get(id).parentId,name=(i===2||i===4)?'skitarii-marshal':'tech-priest-dominus',bodyName=(i===2||i===4)?'skitarii-vanguard':'servitor-battleclade';
  const a=unit('owner',name,[id]),b=unit('duplicate',name),body=unit('body',bodyName,[],i!==2&&i!==4),other=unit('other',bodyName,[],i!==2&&i!==4),state=roster([a,b,body,other],[det]);
  const effects=index.get(id).ruleContract.clauses.flatMap(c=>c.rosterEffects),alone=run(state);
  assertDelta(alone,'owner',effects);for(const n of ['duplicate','body','other'])assertDelta(alone,n,[]);
  state.attachments=[{leaderInstanceId:'owner',bodyguardInstanceId:'body',role:i===2||i===4?'SUPPORT':'LEADER'}];
  const attached=run(state);assertDelta(attached,'owner',effects);assertDelta(attached,'body',i===4?[]:effects);for(const n of ['duplicate','other'])assertDelta(attached,n,[]);
  assert.deepEqual(run(state),attached);assert.deepEqual(run(JSON.parse(JSON.stringify(state))),attached);
  state.attachments=[];assert.deepEqual(run(state),alone);
  state.attachments=[{leaderInstanceId:'owner',bodyguardInstanceId:'body',role:i===2||i===4?'SUPPORT':'LEADER'}];assert.deepEqual(run(state),attached);
  if(i===0||i===2)assert.equal(get(attached,'owner').conditional.filter(c=>c.ruleId===id).length,2,'Separate unknown battle clauses lost');
}
// Two independent numeric sources compose through the existing operation, with
// no parallel modifier engine and no dependence on Detachment order.
{
  const owner=unit('owner','tech-priest-dominus',[ids[1],ids[3]]),body=unit('body','servitor-battleclade',[],true),state=roster([owner,body],['detachment-haloscreed-battle-clade','detachment-eradication-cohort'],[{leaderInstanceId:'owner',bodyguardInstanceId:'body',role:'LEADER'}]);
  const result=run(state),effects=[ids[1],ids[3]].flatMap(id=>index.get(id).ruleContract.clauses.flatMap(c=>c.rosterEffects));
  assertDelta(result,'owner',effects);assertDelta(result,'body',effects);
  const reversed=structuredClone(state);reversed.detachmentIds.reverse();reversed.detachments.reverse();const next=run(reversed);
  assert.deepEqual(next.units,result.units,'Detachment-order changed effective numeric result');
}
// Independently owned Enhancements activating the same canonical Imperative
// contribute that rule once to each exact weapon/profile target, not twice.
{
  const dominus=unit('dominus','tech-priest-dominus',[ids[0]]),marshal=unit('marshal','skitarii-marshal',[ids[2]]),
    body=unit('rangers','skitarii-rangers'),duplicate=unit('duplicate','skitarii-rangers'),
    state=roster([dominus,marshal,body,duplicate],['detachment-haloscreed-battle-clade','detachment-eradication-cohort'],
      [{leaderInstanceId:'dominus',bodyguardInstanceId:'rangers',role:'LEADER'},{leaderInstanceId:'marshal',bodyguardInstanceId:'rangers',role:'SUPPORT'}]);
  const result=run(state),once=index.get(ids[0]).ruleContract.clauses.flatMap(c=>c.rosterEffects);
  for(const target of ['dominus','marshal','rangers'])assertDelta(result,target,once);
  assertDelta(result,'duplicate',[]);
  const reverse=structuredClone(state);reverse.attachments.reverse();reverse.detachmentIds.reverse();reverse.detachments.reverse();
  const next=run(reverse);for(const target of ['dominus','marshal','rangers','duplicate'])assert.deepEqual(get(next,target).weapons,get(result,target).weapons,'Order changed canonical contribution');
}
const wanted=new Set(ids.flatMap(id=>index.get(id).ruleContract.clauses.flatMap(c=>c.rosterEffects.map(e=>id+'/'+e.id))));assert.deepEqual(applied,wanted);
for(const entity of readJson('generated/effective.json').entities){const {ruleContract,...facts}=built.book.entities.find(e=>e.id===entity.id);assert.deepEqual(facts,entity);}
console.log(JSON.stringify({status:'PASS',sourceOwners:5,sourceEffects:wanted.size,cases,mutations:mutations.length,blockedOwners:built.blockedIds.size,
  canonicalImperativeReferences:true,ordinaryBattleActivationUnchanged:true,ownerProfileIsolation:true,baseFactsImmutable:true,legacyReads:0}));
