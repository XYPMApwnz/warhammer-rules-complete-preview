/** Bounded source/engine controls for the ten-rule EC foundation. No EC import
 * or UI is provided here; physical fixtures enter the existing shared service. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {buildECContracts} from './rule-contract-build.mjs';
import {resolveOwnedFact} from './mfm-boundary.mjs';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {validateRosterEffects} from '../../shared/roster-v2/effects.mjs';

const directory=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(directory,'../../..');
const facts=JSON.parse(fs.readFileSync(path.join(directory,'generated/effective.json'),'utf8'));
const original=JSON.stringify(facts),built=buildECContracts({facts}),{book,schema}=built;
const records=new Map(facts.entities.map(e=>[e.id,e]));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex').toUpperCase();
const corpus=JSON.parse(fs.readFileSync(path.join(root,'books/emperors-children/sources/waha-11e-current-2026-09-28/corpus.json'),'utf8'));
const pointer=(value,p)=>p.slice(1).split('/').reduce((v,k)=>v[k.replaceAll('~1','/').replaceAll('~0','~')],value);
const normalize=value=>value.replace(/\s/g,'');
let controls=0,mutations=0;
const check=fn=>{fn();controls++;};
const poison=(value,mutate,compare)=>{const bad=structuredClone(value);mutate(bad);assert.throws(()=>compare(bad));mutations++;};

// Fixed reviewed source identities/recipients and signed values, independent of
// the producer's declarations. Source text is independently read below.
const expected=[
  ['datasheet-lord-exultant:section:1','unit-lord-exultant','SOURCE_FORMED_MODELS',[['GRANT_WEAPON_ABILITY','LETHAL HITS']]],
  ['datasheet-lord-kakophonist:section:1','unit-lord-kakophonist','SOURCE_FORMED_MODELS',[['GRANT_WEAPON_ABILITY','SUSTAINED HITS 1','ranged']]],
  ['detachment-spectacle-of-slaughter:rule','detachment-spectacle-of-slaughter','ROSTER_UNITS',[['GRANT_ABILITY','core-fights-first','FORMED']]],
  ['detachment-court-of-the-phoenician:enhancement:2','detachment-court-of-the-phoenician','SOURCE_MODEL',[['MODIFY_STAT','M',1]]],
  ['detachment-court-of-the-phoenician:enhancement:4','detachment-court-of-the-phoenician','SOURCE_MODEL',[['MODIFY_STAT','strength',1,'melee'],['MODIFY_STAT','attacks',1,'melee']]],
  ['detachment-frenzied-host:enhancement:1','detachment-frenzied-host','SOURCE_MODEL',[['MODIFY_STAT','strength',1,'melee']]],
  ['detachment-frenzied-host:enhancement:2','detachment-frenzied-host','SOURCE_UNIT',[['MODIFY_STAT','ap',-1,'ranged']]],
  ['detachment-peerless-bladesmen:enhancement:3','detachment-peerless-bladesmen','SOURCE_MODEL',[['MODIFY_STAT','attacks',1,'melee'],['MODIFY_STAT','damage',1,'melee']]],
  ['detachment-coterie-of-the-conceited:enhancement:2','detachment-coterie-of-the-conceited','SOURCE_FORMED_MODELS',[['MODIFY_STAT','LD',-1],['MODIFY_STAT','OC',1]]],
  ['detachment-slaaneshs-chosen:enhancement:4','detachment-slaaneshs-chosen','SOURCE_MODEL',[['GRANT_WEAPON_ABILITY','PRECISION','melee']]]
];
const signature=effect=>effect.operation==='MODIFY_STAT'?[effect.operation,effect.field,effect.value,...(effect.weaponMode?[effect.weaponMode]:[])]:
  effect.operation==='GRANT_ABILITY'?[effect.operation,effect.ability.canonicalId,effect.unitScope]:
  [effect.operation,effect.ability,...(effect.weaponMode?[effect.weaponMode]:[])];
const leadingRules=new Set(['datasheet-lord-exultant:section:1','datasheet-lord-kakophonist:section:1',
  'detachment-coterie-of-the-conceited:enhancement:2']);
function inventory(contracts) {
  assert.deepEqual(contracts.map(c=>c.ruleId).sort(),expected.map(e=>e[0]).sort(),'Missing/extra/duplicate contract');
  for(const [id,owner,binding,operations] of expected) {
    const contract=contracts.find(c=>c.ruleId===id),clause=contract.clauses[0];
    assert.equal(contract.ownerId,owner,'Wrong physical/source owner');
    assert.deepEqual(clause.rosterEffects.map(signature),operations,'Wrong operation/value/weapon scope');
    assert.ok(clause.rosterEffects.every(e=>e.targetBinding===binding),'Wrong recipient binding');
    assert.equal(clause.rosterEffects[0].targetSubject,['ROSTER_UNITS','SOURCE_UNIT'].includes(binding)?'UNIT':'MODEL');
    const canonical=records.get(id),field=clause.evidence.field;
    assert.equal(contract.sourceId,canonical.provenance.sourceId);
    assert.ok(field.reduce((v,k)=>v[k],canonical.data).includes(clause.evidence.quote));
    assert.deepEqual(contract.currentness.factualOwner,canonical.provenance);
    for(const effect of clause.rosterEffects) {
      assert.deepEqual(effect.conditions.filter(c=>c.predicate.predicate==='LEADING').map(c=>[
        c.binding,c.predicate.subject,c.predicate.contextLevel,c.predicate.arguments]),
      leadingRules.has(id)?[['SOURCE','MODEL','ROSTER',{value:true}]]:[],'Lost or invented leading restriction');
      assert.equal(effect.provenance.canonicalRuleId,id);assert.equal(effect.provenance.canonicalOwnerId,owner);
      assert.deepEqual(effect.provenance.sourceEvidence,canonical.provenance);
    }
  }
}
const directContracts=built.contracts.slice(0,10);
check(()=>inventory(directContracts));

// Verify actual raw captures and corpus occurrences, rather than treating
// generated text or legacy effect contracts as an independent source oracle.
const sourceFiles=[...new Set(expected.map(([id])=>records.get(id).provenance.document))];
const python=process.env.PYTHON||'python';
const rawText=JSON.parse(execFileSync(python,['-B','-c',
  'import json,sys; from lxml import html; sys.stdout.reconfigure(encoding="utf-8"); print(json.dumps({p:" ".join(html.parse(p).getroot().itertext()) for p in sys.argv[1:]},ensure_ascii=False))',
  ...sourceFiles.map(file=>path.join(root,file))],{encoding:'utf8',maxBuffer:8*1024*1024}));
for(const [id] of expected)check(()=>{
  const entity=records.get(id),contract=built.contracts.find(c=>c.ruleId===id),field=contract.clauses[0].evidence.field;
  assert.equal(sha(fs.readFileSync(path.join(root,entity.provenance.document))),entity.provenance.sha256);
  assert.equal(sha(fs.readFileSync(path.join(root,entity.provenance.corpusDocument))),entity.provenance.corpusSha256);
  const actual=field.reduce((v,k)=>v[k],entity.data),source=field.reduce((v,k)=>v[k],pointer(corpus,entity.provenance.pointer));
  assert.equal(actual,source,'Factual source occurrence drift');
  assert.ok(normalize(rawText[path.join(root,entity.provenance.document)]).includes(normalize(source)),'Raw accepted source differs');
});
check(()=>{
  const core=JSON.parse(fs.readFileSync(path.join(root,'books/core-rules/content/core-identities.v1.json'),'utf8'));
  assert.equal(core.rules['24.13'],'core-fights-first','Canonical Core ability identity');
  assert.equal(book.rosterAbilityReferences['core-fights-first'].provenance.base.sourceId,
    'waha-core-corpus-2026-09-25','Core remains the ability definition owner');
});
for(const contract of built.contracts.filter(c=>c.kind==='ENHANCEMENT'))check(()=>{
  const reference=contract.mfmReferences,record=resolveOwnedFact(reference.enhancementId);
  assert.equal(record.detachmentId,reference.detachmentId);assert.deepEqual(record.qualifierIds,reference.qualifierIds);
  assert.equal(record.provenance.sourceVersion,'v1.6');assert.equal(record.provenance.effectiveDate,null);
  assert.equal(contract.detachmentId,records.get(contract.ruleId).parentId);
});

const selections=(ids,quantity)=>ids.map(id=>({selectionKey:id,physicalQuantity:quantity,perModelQuantity:1,
  canonicalProfileIds:[id],canonicalEquipmentIds:[]}));
const loadouts={
  'lord-exultant':[1,6], 'lord-kakophonist':[1,3],infractors:[1,4],tormentors:[2,8],
  'noise-marines':[4,5],'flawless-blades':[1,2],'daemon-prince-of-slaanesh':[1,2,3],
  'daemon-prince-of-slaanesh-with-wings':[1,2,3],sorcerer:[3,4],daemonettes:[1]
};
function unit(instanceId,name,quantity=1,enhancementIds=[]) {
  return {instanceId,canonicalUnitId:'unit-'+name,startingStrength:quantity,warlord:false,enhancementIds,
    selections:[],modelRows:[{rowId:'models',quantity,canonicalProfileId:`datasheet-${name}:profile:1`,
      compositionScope:quantity===1?'MODEL_ROW':'UNIT',selections:selections(loadouts[name].map(n=>`datasheet-${name}:weapon:${n}`),quantity),loadouts:[]}]};
}
const state=(detachments,units)=>({schema:'roster-v2/roster',bookId:'emperors-children',rosterId:'qa/ec-direct',
  detachments:detachments.map((id,i)=>({instanceId:`detachment/${i}`,canonicalDetachmentId:'detachment-'+id})),units,attachments:[],warlordInstanceId:null});
const service=()=>createRosterRuntime(book,schema);
const physical=(s,id)=>s.projection.units.find(u=>u.instanceId===id);
const weapons=(s,id)=>physical(s,id).profiles.flatMap(m=>m.weapons);
const has=(weapon,ability)=>weapon.data.abilities.some(value=>value.toUpperCase()===ability);
const effectRows=(s,id,ruleId)=>physical(s,id).applied.filter(e=>e.ruleId===ruleId);
const noEffect=(s,id,ruleId)=>assert.equal(effectRows(s,id,ruleId).length,0);
const statValue=(s,id,key)=>physical(s,id).profiles.map(m=>m.profile.stats[key]);

// Perfectionists: leading only, own leader + correct bodyguard, no duplicate
// contribution or keyword transfer, detach and reattach to another instance.
check(()=>{
  const s=service(),rule=expected[0][0];s.load(state(['peerless-bladesmen'],[
    unit('lord','lord-exultant'),unit('other-lord','lord-exultant'),unit('a','infractors',10),unit('b','infractors',10)]));
  noEffect(s,'lord',rule);s.attach('lord','a');
  for(const id of ['lord','a'])assert.ok(weapons(s,id).every(w=>has(w,'LETHAL HITS')));
  for(const id of ['b','other-lord'])noEffect(s,id,rule);
  assert.ok(!physical(s,'a').keywords.includes('CHARACTER'));
  s.detach('lord');for(const id of ['lord','a'])noEffect(s,id,rule);
  s.reattach('lord','b');noEffect(s,'a',rule);assert.ok(weapons(s,'b').every(w=>has(w,'LETHAL HITS')));
  const projected=s.projection;s.load(s.snapshot());assert.deepEqual(s.projection,projected,'Recompute accumulates effects');
});
check(()=>{
  const s=service(),rule=expected[1][0];s.load(state(['peerless-bladesmen'],[
    unit('k','lord-kakophonist'),unit('n','noise-marines',6),unit('other','noise-marines',6)]));
  noEffect(s,'k',rule);s.attach('k','n');
  for(const id of ['k','n'])for(const w of weapons(s,id))assert.equal(has(w,'SUSTAINED HITS 1'),w.data.mode==='ranged');
  noEffect(s,'other',rule);s.detach('k');noEffect(s,'n',rule);s.attach('k','n');
  assert.ok(weapons(s,'n').filter(w=>w.data.mode==='ranged').every(w=>has(w,'SUSTAINED HITS 1')));
});
const exalted=expected[3][0];
check(()=>{
  const s=service();s.load(state(['court-of-the-phoenician'],[unit('l','lord-exultant',1,[exalted]),
    unit('l2','lord-exultant'),unit('f','flawless-blades',3),unit('f2','flawless-blades',3)]));
  assert.deepEqual(statValue(s,'l','M'),['8"']);assert.deepEqual(statValue(s,'l2','M'),['7"']);
  assert.ok(!s.candidates('l2').some(c=>c.instanceId==='f'));
  s.attach('l','f');assert.deepEqual(statValue(s,'f','M'),['8"']);
  s.detach('l');assert.deepEqual(statValue(s,'l','M'),['8"']);s.reattach('l','f2');
  noEffect(s,'f',exalted);noEffect(s,'f2',exalted);
  const backup=s.snapshot();backup.units.find(u=>u.instanceId==='l').enhancementIds=[];
  assert.throws(()=>s.load(backup),/prerequisite/,'Cannot retain Enhancement-only attachment after unassignment');
  s.detach('l');const unassigned=s.snapshot();unassigned.units.find(u=>u.instanceId==='l').enhancementIds=[];s.load(unassigned);
  assert.deepEqual(statValue(s,'l','M'),['7"']);assert.throws(()=>s.attach('l','f'),/prerequisite/);
});
check(()=>{
  const s=service(),rule=expected[2][0];s.load(state(['spectacle-of-slaughter','court-of-the-phoenician'],[
    unit('l','lord-exultant',1,[exalted]),unit('f','flawless-blades',3),unit('f2','flawless-blades',3),unit('x','infractors',10)]));
  for(const id of ['f','f2'])assert.equal(physical(s,id).abilities[0].canonicalId,'core-fights-first');
  noEffect(s,'l',rule);noEffect(s,'x',rule);
  s.attach('l','f');assert.equal(physical(s,'l').abilities[0].canonicalId,'core-fights-first');
  assert.ok(!physical(s,'l').keywords.includes('FLAWLESS BLADES'));s.detach('l');noEffect(s,'l',rule);
  const off=s.snapshot();off.detachments=off.detachments.filter(d=>!d.canonicalDetachmentId.endsWith('spectacle-of-slaughter'));delete off.detachmentIds;s.load(off);
  noEffect(s,'f',rule);noEffect(s,'f2',rule);
});

// Bearer-only melee modifiers, with independently fixed expected outputs.
for(const [rule,name,detachment,values] of [
  [expected[4][0],'daemon-prince-of-slaanesh','court-of-the-phoenician',{attacks:['7','15'],strength:['9','7']}],
  [expected[5][0],'lord-exultant','frenzied-host',{attacks:['5'],strength:['6']}],
  [expected[7][0],'lord-exultant','peerless-bladesmen',{attacks:['6'],damage:['3']}]
])check(()=>{
  const s=service();s.load(state([detachment],[unit('bearer',name,1,[rule]),unit('other',name)]));
  const melee=weapons(s,'bearer').filter(w=>w.data.mode==='melee');
  for(const [field,expectedValues] of Object.entries(values))assert.deepEqual(melee.map(w=>w.data[field]),expectedValues);
  for(const w of weapons(s,'bearer').filter(w=>w.data.mode==='ranged'))assert.deepEqual(w.data,records.get(w.canonicalProfileId).data);
  noEffect(s,'other',rule);
  if(name==='lord-exultant') {
    const snapshot=s.snapshot();snapshot.units.push(unit('bodyguard','infractors',10));s.load(snapshot);s.attach('bearer','bodyguard');
    noEffect(s,'bodyguard',rule);s.detach('bearer');s.attach('bearer','bodyguard');noEffect(s,'bodyguard',rule);
  }
  const snapshot=s.snapshot();snapshot.units.find(u=>u.instanceId==='bearer').enhancementIds=[];s.load(snapshot);noEffect(s,'bearer',rule);
});
check(()=>{
  const rule=expected[6][0],s=service();s.load(state(['frenzied-host'],[
    unit('l','lord-exultant',1,[rule]),unit('a','infractors',10),unit('b','infractors',10)]));
  assert.equal(weapons(s,'l').find(w=>w.data.mode==='ranged').data.ap,'-2');noEffect(s,'a',rule);
  s.attach('l','a');for(const id of ['l','a']) {
    assert.equal(weapons(s,id).find(w=>w.data.mode==='ranged').data.ap,'-2');
    for(const w of weapons(s,id).filter(w=>w.data.mode==='melee'))assert.equal(w.data.ap,records.get(w.canonicalProfileId).data.ap);
  }
  noEffect(s,'b',rule);s.detach('l');noEffect(s,'a',rule);s.reattach('l','b');noEffect(s,'a',rule);
  assert.equal(weapons(s,'b').find(w=>w.data.mode==='ranged').data.ap,'-2');
});
check(()=>{
  const rule=expected[8][0],s=service();s.load(state(['coterie-of-the-conceited'],[
    unit('l','lord-exultant',1,[rule]),unit('a','infractors',10),unit('b','infractors',10)]));
  noEffect(s,'l',rule);s.attach('l','a');
  assert.deepEqual(statValue(s,'l','LD'),['5+']);assert.deepEqual(statValue(s,'a','LD'),['5+']);
  assert.deepEqual(statValue(s,'l','OC'),['2']);assert.deepEqual(statValue(s,'a','OC'),['3']);noEffect(s,'b',rule);
  s.detach('l');assert.deepEqual(statValue(s,'l','LD'),['6+']);assert.deepEqual(statValue(s,'a','OC'),['2']);
  s.reattach('l','b');noEffect(s,'a',rule);assert.deepEqual(statValue(s,'b','OC'),['3']);
});
check(()=>{
  const rule=expected[9][0],s=service(),bearer=unit('l','lord-exultant',1,[rule]);
  // Power fist has no native PRECISION; this must prove the contract adds it.
  bearer.modelRows[0].selections=selections(['datasheet-lord-exultant:weapon:1','datasheet-lord-exultant:weapon:8'],1);
  s.load(state(['slaaneshs-chosen'],[bearer,unit('a','infractors',10),unit('other','lord-exultant')]));
  const verify=()=>{
    for(const w of weapons(s,'l')) {
      assert.equal(has(w,'PRECISION'),w.data.mode==='melee');
      for(const field of ['strength','ap'])assert.equal(w.data[field],records.get(w.canonicalProfileId).data[field]);
    }
    assert.ok(physical(s,'l').conditional.some(c=>c.ruleId===rule&&c.clauseId==='character-attack'&&c.state==='UNKNOWN'));
    noEffect(s,'a',rule);noEffect(s,'other',rule);
  };
  verify();s.attach('l','a');verify();s.detach('l');verify();s.reattach('l','a');verify();s.load(s.snapshot());verify();
  const conditional=book.entities.find(e=>e.id===rule).ruleContract.clauses[1];
  assert.equal(schema.evaluatePredicate(conditional.conditions[0],s.context('l','MODEL')),'UNKNOWN');
  assert.equal(conditional.rosterEffects.length,0);
});

// Wrong owner/selection/Detachment and ambiguous MODEL assignment fail closed.
for(const [rule,wrongName,detachment] of [
  [exalted,'lord-kakophonist','court-of-the-phoenician'],[expected[4][0],'daemon-prince-of-slaanesh-with-wings','court-of-the-phoenician'],
  [expected[5][0],'sorcerer','frenzied-host'],[expected[6][0],'sorcerer','frenzied-host'],
  [expected[7][0],'daemonettes','peerless-bladesmen'],[expected[8][0],'daemonettes','coterie-of-the-conceited'],
  [expected[9][0],'daemonettes','slaaneshs-chosen']
])check(()=>{const s=service();s.load(state([detachment],[unit('wrong',wrongName,1,[rule])]));noEffect(s,'wrong',rule);});
check(()=>assert.throws(()=>service().load(state(['peerless-bladesmen'],[unit('l','lord-exultant',1,[exalted])])),/Enhancement context/));
check(()=>assert.throws(()=>service().load(state(['peerless-bladesmen'],[unit('l','lord-exultant',2,[expected[7][0]])])),/Ambiguous physical Enhancement bearer/));
check(()=>{
  const rule=expected[7][0],s=service(),models=unit('i','infractors',10,[rule]);
  models.modelRows=[{...models.modelRows[0],rowId:'bearer',quantity:1,compositionScope:'MODEL_ROW',
    selections:selections(['datasheet-infractors:weapon:1','datasheet-infractors:weapon:4'],1)},
    {...models.modelRows[0],rowId:'others',quantity:9,selections:selections(['datasheet-infractors:weapon:1','datasheet-infractors:weapon:4'],9)}];
  models.enhancementAssignments=[{enhancementId:rule,modelScopeId:'i/bearer/PROFILE/bearer'}];s.load(state(['peerless-bladesmen'],[models]));
  const projected=physical(s,'i').profiles;
  assert.equal(projected[0].weapons.find(w=>w.data.mode==='melee').data.attacks,'5');
  assert.equal(projected[1].weapons.find(w=>w.data.mode==='melee').data.attacks,'4');
});

// Mutations run the real inventory comparator/engine validators. Exceptions
// are consequences of changed data, never manufactured as a test result.
poison(directContracts,x=>x.pop(),inventory);
poison(directContracts,x=>x.push(structuredClone(x[0])),inventory);
poison(directContracts,x=>x[3].ownerId='unit-infractors',inventory);
poison(directContracts,x=>x[3].clauses[0].rosterEffects[0].value=2,inventory);
poison(directContracts,x=>x[6].clauses[0].rosterEffects[0].targetBinding='SOURCE_MODEL',inventory);
poison(directContracts,x=>delete x[1].clauses[0].rosterEffects[0].weaponMode,inventory);
poison(book,x=>x.entities.find(e=>e.id===expected[9][0]).ruleContract.clauses[1].rosterEffects.push(
  structuredClone(x.entities.find(e=>e.id===expected[9][0]).ruleContract.clauses[0].rosterEffects[0])),
  x=>validateRosterEffects(x,schema.validatePredicate,schema.evaluatePredicate));
poison(directContracts,x=>x[0].clauses[0].rosterEffects[0].conditions=[],inventory);
poison(facts,x=>x.entities.find(e=>e.id===exalted).parentId='detachment-peerless-bladesmen',x=>buildECContracts({facts:x}));
poison(facts,x=>x.entities.find(e=>e.id==='datasheet-lord-exultant:profile:1').data.stats.T='4',x=>{
  assert.deepEqual(buildECContracts({facts:x}).artifact,built.artifact,'Stale factual dependency must invalidate the saved overlay');
});
poison(book,x=>delete x.rosterAttachmentPolicies.find(p=>p.mfmReferenceId==='mfm-qualifier-2c135ed536a65870').availability,x=>{
  const s=createRosterRuntime(x,schema);s.load(state(['court-of-the-phoenician'],[unit('l','lord-exultant'),unit('f','flawless-blades',3)]));
  assert.equal(s.candidates('l').length,0,'Lost Enhancement prerequisite');
});
check(()=>{
  assert.equal(book.ruleContractsStarted,true);assert.equal(book.rosterRuntimeStarted,false,'No EC service wiring');
  assert.deepEqual(book.entities.map(e=>[e.id,e.parentId,e.data,e.provenance,e.fieldProvenance]),
    facts.entities.map(e=>[e.id,e.parentId,e.data,e.provenance,e.fieldProvenance]),'Canonical facts or identities changed');
  assert.deepEqual(book.entities.filter(e=>e.ruleContract).map(e=>e.id).sort(),built.contracts.map(c=>c.ruleId).sort());
  const host=book.entities.find(e=>e.id==='datasheet-lord-exultant:section:4').ruleContract;
  assert.equal(host.ownerId,'unit-lord-exultant');assert.equal(host.roles[0].subject,'MODEL');
});
assert.equal(JSON.stringify(facts),original,'Canonical factual input changed');
console.log(JSON.stringify({status:'PASS',sourceBindings:10,executableOperations:13,conditionalClauses:1,
  controls,mutations,sharedEngine:'UNCHANGED',uiImportRegistration:'NOT_CREATED'}));
