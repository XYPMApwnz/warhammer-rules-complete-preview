import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {buildAdMechContracts,directory} from './rule-contract-build.mjs';
import {compilerInputs} from './rule-contract-context.mjs';
import {validateRoster,withRosterDetachments} from '../../shared/roster-v2/context.mjs';
import {executeRosterEffects,validateRosterEffects} from '../../shared/roster-v2/effects.mjs';

// Bounded current-source conformance. The existing weapon is never redefined
// by this declaration and no legacy AdMech answers participate.
const id='detachment-lords-of-the-forge:enhancement:2',weaponId=id+':weapon:1',detachmentId='detachment-lords-of-the-forge';
const built=buildAdMechContracts(),book=compilerInputs(built.book).book,index=new Map(book.entities.map(e=>[e.id,e]));
for(const e of book.entities)if(e.id!==id)delete e.ruleContract;
const canonicalBefore=structuredClone(book),owner=index.get(id),weapon=index.get(weaponId),api=withRosterDetachments(built.schema.evaluator);
assert.equal(built.blockedIds.size,0);assert.equal(weapon.kind,'WEAPON_PROFILE');assert.equal(weapon.parentId,id);
const root=path.resolve(directory,'../../..');
const capture=JSON.parse(fs.readFileSync(path.join(root,owner.provenance.sourcePath),'utf8'));
const raw=owner.provenance.pointer.slice(1).split('/').reduce((v,k)=>v[k],capture);
assert.equal(raw.text,'','The source capture omits this text; use enrolled raw DOM field provenance');
const {sourceId,...sourceWeapon}=raw.weaponProfiles[0];assert.equal(sourceId,weaponId);
assert.deepEqual(weapon.data,sourceWeapon);assert.deepEqual(owner.data.weaponIds,[weaponId]);
const proof=owner.fieldProvenance.text,htmlBytes=fs.readFileSync(path.join(root,proof.sourcePath));
assert.equal(createHash('sha256').update(htmlBytes).digest('hex').toUpperCase(),proof.sha256);
const html=htmlBytes.toString('utf8'),start=html.indexOf('<li><span>TL-4Ø9</span>'),end=html.indexOf('name="Stratagems-11"',start),section=html.slice(start,end);
assert.ok(start>=0&&end>start);assert.ok(section.includes('RANGED WEAPONS'));assert.ok(section.includes('>BS</div>'));
assert.ok(section.includes('This model has the following weapon:'));
const operative=section.slice(section.indexOf('</p>')+4,section.indexOf('<div style="height:8px">')).replace(/<[^>]*>/g,'').trim();
assert.equal(operative,'TECH-PRIEST model only. This model has the following weapon:');assert.equal(owner.data.text,operative);
function sourceParity(candidate){
  const e=candidate.entities.find(e=>e.id===id),effects=e.ruleContract.clauses.flatMap(c=>c.rosterEffects);
  assert.equal(effects.length,1);const effect=effects[0];
  assert.deepEqual([effect.operation,effect.targetBinding,effect.targetSubject,effect.weaponProfileId,effect.weaponMode,effect.lifetime],
    ['CONTRIBUTE_WEAPON_PROFILE','SOURCE_MODEL','MODEL',weaponId,'ranged','WHILE_SOURCE_SELECTED']);
  assert.deepEqual(effect.conditions,[]);assert.equal(effect.evidence.quote,'This model has the following weapon:');
  assert.ok(!Object.hasOwn(effect,'data')&&!Object.hasOwn(effect,'profile')&&!Object.hasOwn(effect,'quantity'),'Inline weapon facts or invented quantity');
  assert.deepEqual(e.data.weaponIds,[weaponId]);
  assert.equal(e.ruleContract.detachmentId,detachmentId);assert.equal(e.ruleContract.assignment.ownerRoleId,'owner');
  const predicates=e.ruleContract.roles.find(r=>r.id==='owner').selector.args;
  assert.deepEqual(predicates.map(p=>[p.predicate,p.subject,p.contextLevel,p.arguments.keyword]),
    [['MODEL_KEYWORD','MODEL','STATIC','CHARACTER'],['MODEL_KEYWORD','MODEL','STATIC','TECH-PRIEST']]);
  assert.deepEqual(candidate.entities.find(e=>e.id===weaponId).data,weapon.data);
}
sourceParity(book);validateRosterEffects(book,api.validatePredicate,api.evaluatePredicate);
let mutations=0;
for(const mutate of [
  e=>e.ruleContract.clauses[0].rosterEffects[0].weaponProfileId='datasheet-tech-priest-dominus:weapon:1',
  e=>e.ruleContract.clauses[0].rosterEffects[0].targetBinding='SOURCE_FORMED_MODELS',
  e=>e.ruleContract.clauses[0].rosterEffects[0].targetSubject='UNIT',
  e=>e.ruleContract.clauses[0].rosterEffects[0].weaponMode='melee',
  e=>e.ruleContract.clauses[0].rosterEffects=[],
  e=>e.ruleContract.roles[0].selector.args.pop(),
  e=>e.ruleContract.detachmentId='detachment-cohort-cybernetica'
]){const b=structuredClone(book);mutate(b.entities.find(e=>e.id===id));assert.throws(()=>sourceParity(b));mutations++;}
function unit(instanceId,name,enhancementIds=[]){const canonicalUnitId='unit-'+name,e=index.get(canonicalUnitId),mixed=e.data.profileIds.length>1;
  return {instanceId,canonicalUnitId,startingStrength:mixed?9:1,modelRows:e.data.profileIds.map((canonicalProfileId,i)=>
    ({rowId:'row-'+i,canonicalProfileId,quantity:mixed&&i===1?8:1,selections:[],loadouts:[]})),
  selections:e.data.weaponIds.map((canonicalProfileId,i)=>({selectionKey:'existing-'+i,physicalQuantity:1,canonicalProfileIds:[canonicalProfileId],canonicalEquipmentIds:[]})),
  equipmentContextKnown:true,warlord:false,enhancementIds};}
const state={schema:'roster-v2/roster',bookId:book.bookId,rosterId:'source-contributed-weapon',
  detachmentIds:[detachmentId],detachments:[{instanceId:'selected',canonicalDetachmentId:detachmentId}],warlordInstanceId:null,attachments:[],
  units:[unit('owner','tech-priest-dominus',[id]),unit('duplicate','tech-priest-dominus'),unit('bodyguard','servitor-battleclade'),unit('unrelated','skitarii-rangers')]};
let cases=0,provenanceChecks=0;
const get=(result,instanceId)=>result.units.find(u=>u.instanceId===instanceId);
function run(s){const before=structuredClone(s),result=executeRosterEffects(book,validateRoster(book,s,book.rosterAttachmentPolicies),{evaluatePredicate:api.evaluatePredicate});
  assert.deepEqual(s,before);assert.deepEqual(book,canonicalBefore);cases++;
  for(const u of result.units){const scoped=u.profiles.flatMap(p=>p.weapons.filter(w=>w.canonicalProfileId===weaponId));
    const expected=u.instanceId==='owner'&&s.units.find(x=>x.instanceId==='owner').enhancementIds.includes(id);
    assert.equal(scoped.length,expected?1:0,'Contributed weapon physical owner/profile leakage');
    for(const w of scoped){const model=u.profiles.find(p=>p.scopeId===w.scopeId);assert.ok(model);assert.equal(w.modelInstanceId,'owner');
      assert.equal(w.physicalQuantity,1);assert.deepEqual(w.data,{...weapon.data,mode:'ranged'});
      // Popup/reference consumers resolve the same existing canonical identity.
      assert.equal(index.get(w.canonicalProfileId),weapon);assert.equal(index.get(w.canonicalProfileId).parentId,id);
      assert.deepEqual(w.contributedBy,{ruleId:id,effectId:'canonical-weapon'});
    }
    const changes=u.applied.filter(p=>p.operation==='CONTRIBUTE_WEAPON_PROFILE');assert.equal(changes.length,expected?1:0);
    for(const p of changes){assert.equal(p.ruleId,id);assert.equal(p.sourceInstanceId,'owner');assert.equal(p.targetInstanceId,'owner');
      assert.equal(p.targetWeaponProfileId,weaponId);assert.equal(p.targetProfileId,index.get(u.canonicalUnitId).data.profileIds[0]);
      assert.equal(p.targetCompositionId,scoped[0].scopeId);assert.equal(p.field,'weapons');assert.equal(p.before,null);
      assert.deepEqual(p.after,{canonicalProfileId:weaponId,physicalQuantity:1});assert.equal(p.lifetime,'WHILE_SOURCE_SELECTED');provenanceChecks++;}
  }
  return result;
}
const alone=run(state);assert.deepEqual(run(state),alone);assert.deepEqual(run(JSON.parse(JSON.stringify(state))),alone);
state.attachments=[{leaderInstanceId:'owner',bodyguardInstanceId:'bodyguard',role:'LEADER'}];
const attached=run(state);assert.deepEqual(get(attached,'owner').profiles,get(alone,'owner').profiles);
assert.deepEqual(get(attached,'duplicate'),get(alone,'duplicate'));assert.deepEqual(get(attached,'unrelated'),get(alone,'unrelated'));
state.attachments=[];assert.deepEqual(run(state),alone);state.attachments=[{leaderInstanceId:'owner',bodyguardInstanceId:'bodyguard',role:'LEADER'}];assert.deepEqual(run(state),attached);
state.units[0].enhancementIds=[];const removed=run(state);assert.ok(!get(removed,'owner').profiles.some(p=>p.weapons.some(w=>w.canonicalProfileId===weaponId)));
state.units[0].enhancementIds=[id];assert.deepEqual(run(state),attached);
const reordered=structuredClone(state);reordered.units.reverse();const reorderedResult=run(reordered);
for(const u of attached.units)assert.deepEqual(get(reorderedResult,u.instanceId),u);
// Replacing the attached leader does not move Enhancement ownership.
state.attachments=[{leaderInstanceId:'duplicate',bodyguardInstanceId:'bodyguard',role:'LEADER'}];run(state);
// Other current eligible non-Epic Hero TECH-PRIEST owners resolve through the
// same physical-owner declaration, without datasheet-specific runtime logic.
for(const name of ['cybernetica-datasmith','tech-priest-enginseer','tech-priest-manipulus','technoarcheologist']){
  const s={...structuredClone(state),attachments:[],units:[unit('owner',name,[id]),unit('duplicate',name)]};
  const result=run(s);assert.deepEqual(run(JSON.parse(JSON.stringify(s))),result);
}
assert.equal(built.schema.evaluator.validateContracts(built.book).rules,204);
console.log(JSON.stringify({status:'PASS',sourceOwners:1,existingCanonicalWeaponProfiles:1,runtimeCases:cases,provenanceChecks,mutations,
  exactOwner:true,referenceIdentity:true,baseFactsImmutable:true,blockedOwners:0,legacyContractReads:0}));
