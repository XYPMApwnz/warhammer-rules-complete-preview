/** Source-first permission/recipient controls; no battle action or EC importer. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {buildECContracts} from './rule-contract-build.mjs';
import {resolveOwnedFact} from './mfm-boundary.mjs';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {validateRosterEffects} from '../../shared/roster-v2/effects.mjs';

const directory=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(directory,'../../..');
const facts=JSON.parse(fs.readFileSync(path.join(directory,'generated/effective.json'),'utf8'));
const {book,schema,contracts,artifact}=buildECContracts({facts}),canonical=new Map(facts.entities.map(e=>[e.id,e]));
const permissionContracts=contracts.slice(10,15),original=JSON.stringify(facts);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex').toUpperCase();
const text=value=>value.replace(/[▪•]/g,'-').replace(/[‑−]/g,'-').replace(/[‘’]/g,"'").replace(/\s/g,'');
let checks=0,mutations=0;
const check=fn=>{fn();checks++;};
const mutate=(value,change,compare)=>{compare(value);const bad=structuredClone(value);change(bad);assert.throws(()=>compare(bad),assert.AssertionError);mutations++;};

// Independently reviewed fixed expected source text, identities and timing.
const expected=[
  {id:'detachment-mercurial-host:rule',owner:'detachment-mercurial-host',name:'Quicksilver Grace',binding:'ROSTER_UNITS',
    event:['advance-roll','UNIT','unitAdvanceRoll','recipient'],
    text:'You can re-roll Advance rolls made for EMPEROR’S CHILDREN units from your army.'},
  {id:'detachment-court-of-the-phoenician:enhancement:1',owner:'detachment-court-of-the-phoenician',name:'Tears of the Phoenix',binding:'SOURCE_UNIT',
    event:['melee-attack','MODEL','meleeAttack','acting-model'],mfm:['mfm-enhancement-c61db5138230cb0a',25],
    text:'EMPEROR’S CHILDREN model only. Each time a model in the bearer’s unit makes a melee attack, you can ignore any or all modifiers to that attack’s Weapon Skill characteristic and any or all modifiers to the Hit roll and Wound roll.'},
  {id:'detachment-mercurial-host:enhancement:4',owner:'detachment-mercurial-host',name:'Loathsome Dexterity',binding:'SOURCE_UNIT',
    event:['movement','MODEL','normalAdvanceFallBackMove','acting-model'],mfm:['mfm-enhancement-54ca3b6d0c7e8794',10],
    text:'EMPEROR’S CHILDREN model only. Each time a model in the bearer’s unit makes a Normal, Advance or Fall Back move, it can move through enemy models. When doing so, it can move within Engagement Range of such models but cannot end that move within Engagement Range of them, and any Desperate Escape test is automatically passed.'},
  {id:'detachment-peerless-bladesmen:enhancement:1',owner:'detachment-peerless-bladesmen',name:'Faultless Opportunist',binding:'SOURCE_UNIT',
    event:['heroic-intervention','UNIT','heroicInterventionSelected','recipient'],mfm:['mfm-enhancement-a11b495719fd796a',15],
    text:'You can target this unit with the Heroic Intervention stratagem, regardless of any other uses of that stratagem this phase. If you do:\n- That use is -1 CP.\n- That use does not prevent any uses of that stratagem on other units this phase.'},
  {id:'detachment-carnival-of-excess:enhancement:1',owner:'detachment-carnival-of-excess',name:'Empyric Suffusion',binding:'SOURCE_UNIT',
    event:['heroic-intervention','UNIT','heroicInterventionSelected','recipient'],mfm:['mfm-enhancement-03a251d4e568bb90',15],
    text:'EMPEROR’S CHILDREN model only. When you target this unit with the Heroic Intervention stratagem, that use is -1 CP.'}
];
const requiredRestrictions=[
  ['You can re-roll','EMPEROR’S CHILDREN units from your army'],
  ['melee attack','you can ignore any or all modifiers','Weapon Skill characteristic','Hit roll and Wound roll'],
  ['Normal, Advance or Fall Back move','through enemy models','can move within Engagement Range',
    'cannot end that move within Engagement Range of them','any Desperate Escape test is automatically passed'],
  ['regardless of any other uses of that stratagem this phase','If you do:','That use is -1 CP.',
    'That use does not prevent any uses of that stratagem on other units this phase.'],
  ['When you target this unit','that use is -1 CP.']
];
function inventory(values) {
  assert.deepEqual(values.map(c=>c.ruleId).sort(),expected.map(e=>e.id).sort(),'Permission missing/extra/duplicate');
  for(const [i,e] of expected.entries()) {
    const c=values.find(c=>c.ruleId===e.id),grant=c.clauses[0],event=c.clauses[1],effect=grant.rosterEffects[0];
    assert.equal(c.ownerId,e.owner);assert.equal(c.detachmentId,e.owner);assert.equal(c.contextLevel,'BATTLE');
    assert.equal(c.executionMode,'DECLARATIVE_APPLICABILITY');
    assert.equal(c.roles[0].subject,i===0?'UNIT':'MODEL');
    assert.deepEqual(c.restrictions.map(r=>r.quote),requiredRestrictions[i],'Lost permission restriction');
    assert.equal(c.clauses.length,2);assert.equal(grant.rosterClassification,'ROSTER_EXECUTABLE');assert.equal(grant.rosterEffects.length,1);
    assert.equal(effect.operation,'GRANT_ABILITY');assert.equal(effect.ability.canonicalId,e.id);assert.deepEqual(effect.ability.parameters,{});
    assert.equal(effect.targetSubject,'UNIT');assert.equal(effect.targetBinding,e.binding);assert.equal(effect.unitScope,'FORMED');
    assert.equal(event.rosterClassification,'BATTLE_ONLY');assert.deepEqual(event.rosterEffects,[]);
    assert.equal(event.sourceText,e.text);assert.equal(event.effect.sourceClause,e.text);assert.equal(event.effect.recipientRoleId,'recipient');
    assert.equal(event.id,e.event[0]);assert.equal(event.conditions[0].subject,e.event[1]);
    assert.equal(event.conditions[0].arguments.key,e.event[2]);assert.equal(event.conditions[0].roleId,e.event[3]);
    assert.equal(event.conditions[0].contextLevel,'BATTLE');assert.equal(event.conditions[0].arguments.equals,true);
    assert.equal(event.roles.find(r=>r.id===e.event[3]).binding,e.event[1]==='MODEL'?'SOURCE_FORMED_MODELS':e.binding,
      'Wrong physical event actor scope');
    if(i===0) {
      assert.equal(effect.conditions.length,1);assert.equal(effect.conditions[0].binding,'TARGET');
      assert.equal(effect.conditions[0].predicate.predicate,'UNIT_KEYWORD');
      assert.equal(effect.conditions[0].predicate.arguments.keyword,'EMPEROR’S CHILDREN');
    }
    const source=canonical.get(e.id);assert.equal(source.data.text,e.text);assert.equal(source.parentId,e.owner);
    assert.deepEqual(effect.provenance.sourceEvidence,source.fieldProvenance?.text||source.provenance);
    assert.deepEqual(c.currentness.factualOwner,source.fieldProvenance?.text||source.provenance);
    if(e.mfm) {
      assert.equal(c.assignment.ownerRoleId,'owner');assert.equal(c.mfmReferences.enhancementId,e.mfm[0]);
      const record=resolveOwnedFact(e.mfm[0]);assert.equal(record.value,e.mfm[1]);assert.deepEqual(record.qualifierIds,[]);
      assert.equal(record.detachmentId,c.mfmReferences.detachmentId);assert.equal(record.provenance.sourceVersion,'v1.6');
    }
    if(i===3)assert.equal(c.assignment.selector.predicate,'ALWAYS','Do not restore superseded eligibility prefix');
    if(i>=3)assert.ok(c.canonicalRuleReferences.includes('core-rule-15-11-heroic-intervention'),'Ordinary Heroic rules retained');
  }
}
check(()=>inventory(permissionContracts));

// Independent accepted HTML and two official PDF source occurrences, not legacy
// effects or generated contract metadata as a source oracle.
const raw=path.join(root,'books/emperors-children/sources/waha-11e-current-2026-09-28/emperor-s-children.html');
const pdf=path.join(directory,'sources/emperors-children-faction-pack-v1.3.pdf');
check(()=>assert.equal(sha(fs.readFileSync(raw)),'C668A60432C38E89FD30F8D6C48ECE3199D21355D5DF92272125D2FF62C98239'));
check(()=>assert.equal(sha(fs.readFileSync(pdf)),'18A192A36C22468368D957AAC3EB230A40C8F7BBFAEFA46372D8918422B0B49A'));
const evidence=JSON.parse(execFileSync(process.env.PYTHON||'python',['-B','-c',
  'import sys,json,pdfplumber; from lxml import html; sys.stdout.reconfigure(encoding="utf-8"); p=pdfplumber.open(sys.argv[2]); print(json.dumps({"raw":" ".join(html.parse(sys.argv[1]).getroot().itertext()),"faultless":p.pages[8].crop((40,461,296,535)).extract_text(x_tolerance=2,y_tolerance=3),"empyric":p.pages[8].crop((40,246,296,286)).extract_text(x_tolerance=2,y_tolerance=3)},ensure_ascii=False));p.close()',raw,pdf],{encoding:'utf8',maxBuffer:8*1024*1024}));
for(const [i,e] of expected.entries())check(()=>assert.ok(text(i<3?evidence.raw:i===3?evidence.faultless:evidence.empyric).includes(text(e.text)),'Accepted source text differs: '+e.id));

const units={lord:'lord-exultant',bodyguard:'infractors',nonEC:'daemonettes'};
const unit=(id,name,enhancementIds=[])=>({instanceId:id,canonicalUnitId:'unit-'+name,startingStrength:name==='infractors'?10:1,
  warlord:false,enhancementIds,selections:[],modelRows:[{rowId:'models',quantity:name==='infractors'?10:1,
    canonicalProfileId:`datasheet-${name}:profile:1`,selections:[],loadouts:[]}]});
const state=(detachment,models)=>({schema:'roster-v2/roster',bookId:'emperors-children',rosterId:'ec/permissions',
  detachments:[{instanceId:'detachment/1',canonicalDetachmentId:detachment}],units:models,attachments:[],warlordInstanceId:null,cp:4});
const make=()=>createRosterRuntime(book,schema);
const physical=(s,id)=>s.projection.units.find(u=>u.instanceId===id);
const has=(s,id,rule)=>physical(s,id).abilities?.some(a=>a.canonicalId===rule)||false;
const unchangedModels=(s,id)=>{for(const m of physical(s,id).profiles)assert.deepEqual(m.profile,canonical.get(m.canonicalProfileId).data);};
check(()=>{
  const e=expected[0],s=make();s.load(state(e.owner,[unit('lord',units.lord),unit('a',units.bodyguard),unit('b',units.bodyguard),unit('foreign',units.nonEC)]));
  for(const id of ['lord','a','b'])assert.ok(has(s,id,e.id));assert.equal(has(s,'foreign',e.id),false);
  assert.equal(physical(s,'foreign').applied.filter(row=>row.ruleId===e.id).length,0);
  const role=permissionContracts[0].clauses[1].roles.find(r=>r.id==='recipient'),conditions=permissionContracts[0].clauses[1].conditions;
  assert.equal(schema.evaluateRole(role,conditions,s.context('a','UNIT')),'UNKNOWN');
  for(const [id,result] of [['a','TRUE'],['foreign','FALSE']]) {
    const context=s.context(id,'UNIT');context.battle.unitAdvanceRoll=true;
    assert.equal(schema.evaluateRole(role,conditions,context),result);
  }
  s.attach('lord','a');for(const id of ['lord','a'])assert.ok(has(s,id,e.id));s.detach('lord');s.reattach('lord','b');
  for(const id of ['lord','a','b'])unchangedModels(s,id);
  const snapshot=s.snapshot();snapshot.detachments=[{instanceId:'other',canonicalDetachmentId:'detachment-peerless-bladesmen'}];delete snapshot.detachmentIds;s.load(snapshot);
  for(const id of ['lord','a','b','foreign'])assert.equal(has(s,id,e.id),false);
});

for(const e of expected.slice(1))check(()=>{
  const s=make();s.load(state(e.owner,[unit('bearer',units.lord,[e.id]),unit('other',units.lord),unit('a',units.bodyguard),unit('b',units.bodyguard)]));
  assert.ok(has(s,'bearer',e.id));for(const id of ['other','a','b'])assert.equal(has(s,id,e.id),false);
  s.attach('bearer','a');for(const id of ['bearer','a']) {
    assert.ok(has(s,id,e.id));assert.ok(s.effective(id).unitAbilities.some(a=>a.canonicalId===e.id));
    unchangedModels(s,id);assert.ok(physical(s,id).applied.filter(row=>row.ruleId===e.id).every(row=>row.operation==='GRANT_ABILITY'));
  }
  const event=permissionContracts.find(c=>c.ruleId===e.id).clauses[1],role=event.roles.find(r=>r.id===e.event[3]);
  const context=s.context('a',e.event[1]);assert.equal(schema.evaluateRole(role,event.conditions,context),'UNKNOWN');
  context.battle[e.event[2]]=false;assert.equal(schema.evaluateRole(role,event.conditions,context),'FALSE');
  context.battle[e.event[2]]=true;assert.equal(schema.evaluateRole(role,event.conditions,context),'TRUE');
  for(const id of ['other','b'])assert.equal(has(s,id,e.id),false);
  s.detach('bearer');assert.ok(has(s,'bearer',e.id));assert.equal(has(s,'a',e.id),false);
  s.reattach('bearer','b');assert.ok(has(s,'b',e.id));assert.equal(has(s,'a',e.id),false);
  const before=s.projection;s.load(s.snapshot());assert.deepEqual(s.projection,before,'Permission recompute is not idempotent');
  const snapshot=s.snapshot();snapshot.units.find(u=>u.instanceId==='bearer').enhancementIds=[];s.load(snapshot);
  for(const id of ['bearer','other','a','b'])assert.equal(has(s,id,e.id),false);
  assert.equal(s.snapshot().cp,4,'No CP automatically spent');
});

for(const e of expected.slice(1))check(()=>{
  const s=make();assert.throws(()=>s.load(state('detachment-spectacle-of-slaughter',[unit('wrong',units.lord,[e.id])])),/Enhancement context/);
  if(e!==expected[3]) {
    s.load(state(e.owner,[unit('wrong',units.nonEC,[e.id])]));assert.equal(has(s,'wrong',e.id),false,'Faction cannot be borrowed');
  }
});
check(()=>{
  // Enhancement MODEL ownership remains in its component even when a Character
  // joins an enhanced Bodyguard; permission expands to the whole formed UNIT.
  const e=expected[1],s=make(),bodyguard=unit('a',units.bodyguard,[e.id]);
  bodyguard.modelRows=[{rowId:'bearer',quantity:1,canonicalProfileId:'datasheet-infractors:profile:1',selections:[],loadouts:[]},
    {rowId:'others',quantity:9,canonicalProfileId:'datasheet-infractors:profile:1',selections:[],loadouts:[]}];
  bodyguard.enhancementAssignments=[{enhancementId:e.id,modelScopeId:'a/bearer/PROFILE/bearer'}];
  s.load(state(e.owner,[bodyguard,unit('lord',units.lord),unit('other',units.lord)]));s.attach('lord','a');
  assert.ok(has(s,'lord',e.id));assert.ok(has(s,'a',e.id));assert.equal(has(s,'other',e.id),false);
  assert.deepEqual(physical(s,'lord').enhancementIds,[]);assert.deepEqual(physical(s,'a').enhancementIds,[e.id]);
  assert.ok(physical(s,'lord').applied.find(row=>row.ruleId===e.id&&row.sourceInstanceId==='a'&&row.sourceCompositionId==='a/bearer/PROFILE/bearer'));
  s.detach('lord');assert.equal(has(s,'lord',e.id),false);assert.ok(has(s,'a',e.id));s.reattach('lord','a');assert.ok(has(s,'lord',e.id));
});
check(()=>{
  const e=expected[1],s=make(),ambiguous=unit('a',units.bodyguard,[e.id]);
  assert.throws(()=>s.load(state(e.owner,[ambiguous])),/Ambiguous physical Enhancement bearer/);
});
check(()=>{
  assert.deepEqual(buildECContracts({permissionInputs:[],formationInputs:[],finalInputs:[]}).contracts,contracts.slice(0,10),'Previous ten contracts changed');
  assert.deepEqual(book.entities.filter(e=>e.authority!=='SOURCE_BACKED_SELECTION_BINDING').map(e=>[e.id,e.parentId,e.data,e.provenance,e.fieldProvenance]),
    facts.entities.map(e=>[e.id,e.parentId,e.data,e.provenance,e.fieldProvenance]));
  assert.equal(artifact.scope.directReuseRules,10);assert.equal(artifact.scope.bindingAdaptationRules,5);
});

mutate(permissionContracts,x=>x.pop(),inventory);
mutate(permissionContracts,x=>x.push(structuredClone(x[0])),inventory);
mutate(permissionContracts,x=>x[1].ownerId=expected[2].owner,inventory);
mutate(permissionContracts,x=>x[1].clauses[0].rosterEffects[0].targetBinding='LEADERS_OF_SOURCE',inventory);
mutate(permissionContracts,x=>x[2].restrictions.splice(3,1),inventory);
mutate(permissionContracts,x=>x[3].clauses[1].sourceText=x[3].clauses[1].sourceText.replace('-1 CP','0 CP'),inventory);
mutate(permissionContracts,x=>x[4].clauses[1].conditions[0].contextLevel='ROSTER',inventory);
mutate(permissionContracts,x=>x[0].clauses[0].rosterEffects[0].ability.canonicalId=expected[1].id,inventory);
mutate(permissionContracts,x=>x[2].clauses[1].rosterEffects=[x[2].clauses[0].rosterEffects[0]],inventory);
mutate(permissionContracts,x=>x[1].clauses[0].rosterEffects[0].unitScope='PHYSICAL',inventory);
mutate(permissionContracts,x=>x[1].clauses[1].roles.find(r=>r.id==='acting-model').binding='SOURCE_MODEL',inventory);
mutate(book,x=>x.entities.find(e=>e.id===expected[0].id).ruleContract.clauses[0].rosterEffects[0].conditions=[],x=>{
  const s=createRosterRuntime(x,schema);s.load(state(expected[0].owner,[unit('own',units.bodyguard),unit('foreign',units.nonEC)]));
  assert.equal(has(s,'foreign',expected[0].id),false,'Lost army UNIT selector reaches foreign physical unit');
});
check(()=>validateRosterEffects(book,schema.validatePredicate,schema.evaluatePredicate));
assert.equal(JSON.stringify(facts),original,'Factual owner mutated');
console.log(JSON.stringify({status:'PASS',sourceBindings:5,permissionGrants:5,battlePayloadsExecuted:0,
  mfmEligibility:4,previousTen:'PASS',checks,mutations,sharedRuntimeChanged:false}));
