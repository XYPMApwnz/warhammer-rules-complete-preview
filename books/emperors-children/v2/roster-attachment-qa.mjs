import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {buildECRosterAttachmentBook} from './roster-attachment-build.mjs';
import {createECRosterAttachments} from './roster-attachments.mjs';
import {resolveOwnedFact} from './mfm-boundary.mjs';

const clone=structuredClone,{book,schema,contracts}=buildECRosterAttachmentBook(),before=clone(book);
const records=new Map(book.entities.map(e=>[e.id,e]));
const fixtures=JSON.parse(fs.readFileSync(new URL('./roster-import-fixtures.json',import.meta.url))).fixtures;
const fixture=id=>fixtures.find(f=>f.id===id).text;
const header='+ FACTION KEYWORD: Chaos - Emperor\'s Children\n+ DETACHMENT: Court of the Phoenician\n';
const block=(id,weapons=[])=>{
  const u=records.get(id),members=u.data.compositionMemberIds.map(id=>records.get(id)),quantity=members.reduce((n,m)=>n+m.data.quantity.min,0);
  return `${quantity}x ${u.data.title} (100 pts)\n`+members.map(m=>`• ${m.data.quantity.min}x ${m.data.name}`+
    (weapons.length?': '+weapons.map(id=>records.get(id).data.name).join(', '):'')).join('\n')+'\n';
};
const make=(input=book)=>createECRosterAttachments(input,schema);
const imported=(text,bindings={})=>{const s=make(),r=s.import(text,bindings);assert.equal(r.status,'READY',JSON.stringify(r));return {s,r};};
const unit=(s,id)=>s.projection.units.find(u=>u.instanceId===id);
const has=(s,id,ability)=>unit(s,id).profiles.some(m=>m.abilities.some(a=>a.canonicalId===ability));
const weapons=(s,id)=>[...unit(s,id).weapons,...unit(s,id).profiles.flatMap(m=>m.weapons)];
const weaponAbility=(s,id,ability)=>{const rows=weapons(s,id);assert.ok(rows.length);return rows.every(w=>w.data.abilities.some(a=>a.toUpperCase()===ability));};
const rangedIgnoreCover=(s,id)=>{const rows=weapons(s,id).filter(w=>w.data.mode==='ranged');assert.ok(rows.length);assert.ok(rows.every(w=>w.data.abilities.some(a=>a.toUpperCase()==='IGNORES COVER')));};
const pairs=[['lucius-the-eternal','flawless-blades'],['lord-exultant','infractors'],['lord-exultant','tormentors'],
  ['lord-kakophonist','chaos-terminators'],['lord-kakophonist','noise-marines'],['sorcerer','infractors'],['sorcerer','noise-marines'],['sorcerer','tormentors']];
const inventory=rows=>assert.deepEqual(rows.map(p=>[p.sourceId,p.targetId]).sort(),pairs.map(p=>p.map(id=>'unit-'+id)).sort());
let checks=0,negative=0,mutations=0;
const check=fn=>{fn();checks++;};
check(()=>{
  inventory(book.rosterAttachmentPolicies);
  const raw=JSON.parse(fs.readFileSync(new URL('../../../mfm/sources/v1.6/emperors-children.json',import.meta.url)));
  const rawPairs=raw.units.flatMap(u=>(u.relations?.leader||[]).map(target=>[u.title,target]));
  assert.deepEqual(rawPairs.sort(),pairs.map(pair=>pair.map(id=>records.get('unit-'+id).data.title.toUpperCase())).sort());
  for(const p of book.rosterAttachmentPolicies){assert.equal(p.role,'LEADER');assert.equal(p.additionalLeaders,0);assert.equal(p.availability,undefined);
    const binding=book.mfmImportReferences.leaderEligibilityBindings.find(b=>b.mfmRecordId===p.mfmReferenceId);
    assert.ok(binding.targetUnitIds.includes(p.targetId));assert.deepEqual(p.sourceIds,[binding.sourceEntityId]);
    assert.equal(resolveOwnedFact(p.mfmReferenceId).provenance.sourceVersion,'v1.6');}
  const a=book.rosterAttachmentAdjudications[0];assert.equal(a.classification,'D_UNDERDETERMINED');assert.equal(a.applied,false);
  assert.equal(a.qualifier.label,'LEADER: FLAWLESS BLADES');assert.equal(a.qualifier.mfmReferenceId,'mfm-qualifier-2c135ed536a65870');
  for(const e of a.evidence.filter(e=>e.sha256))assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../../../'+e.document,import.meta.url))).digest('hex').toUpperCase(),e.sha256);
});
check(()=>{
  for(const leader of [...new Set(pairs.map(p=>p[0]))])for(const target of book.entities.filter(e=>e.kind==='DATASHEET')){
    const {s}=imported(header+block('unit-'+leader)+block(target.id)),allowed=pairs.some(([l,t])=>l===leader&&'unit-'+t===target.id);
    assert.equal(s.candidates('parsed-unit-2').some(c=>c.instanceId==='parsed-unit-1'),allowed);
    const original=s.snapshot();
    if(allowed){s.attach('parsed-unit-2','parsed-unit-1');assert.deepEqual(s.groups[0].memberInstanceIds,['parsed-unit-2','parsed-unit-1']);
      s.detach('parsed-unit-1');assert.deepEqual(s.snapshot(),original);s.reattach('parsed-unit-2','parsed-unit-1');
      const saved=s.snapshot();s.load(saved);assert.deepEqual(s.snapshot(),saved);}
    else {assert.throws(()=>s.attach('parsed-unit-2','parsed-unit-1'));assert.deepEqual(s.snapshot(),original);negative++;}
  }
});
check(()=>{
  const text=fixture('character-bodyguard')+block('unit-lord-exultant',['datasheet-lord-exultant:weapon:1','datasheet-lord-exultant:weapon:3','datasheet-lord-exultant:weapon:7','datasheet-lord-exultant:weapon:5'])+
    block('unit-infractors',['datasheet-infractors:weapon:1','datasheet-infractors:weapon:4'])+block('unit-flawless-blades');
  const {s,r}=imported(text),original=clone(r.roster);assert.equal(s.state.units.length,5);
  s.attach('parsed-unit-2','parsed-unit-1');assert.ok(weaponAbility(s,'parsed-unit-1','LETHAL HITS'));assert.ok(weaponAbility(s,'parsed-unit-2','LETHAL HITS'));
  assert.ok(!weaponAbility(s,'parsed-unit-3','LETHAL HITS'));assert.ok(!weaponAbility(s,'parsed-unit-4','LETHAL HITS'));
  assert.equal(unit(s,'parsed-unit-1').profiles[0].profile.stats.M,'8"');assert.equal(unit(s,'parsed-unit-3').profiles[0].profile.stats.M,'7"');
  const saved=s.snapshot(),projection=s.projection;
  assert.throws(()=>s.reattach('parsed-unit-5','parsed-unit-1'),/canonical attachment relation/);negative++;
  assert.deepEqual(s.snapshot(),saved);assert.deepEqual(s.projection,projection);
  assert.throws(()=>s.attach('parsed-unit-2','parsed-unit-3'),/capacity/);negative++;
  s.detach('parsed-unit-1');assert.ok(!weaponAbility(s,'parsed-unit-2','LETHAL HITS'));
  s.reattach('parsed-unit-4','parsed-unit-1');assert.ok(weaponAbility(s,'parsed-unit-4','LETHAL HITS'));assert.ok(!weaponAbility(s,'parsed-unit-2','LETHAL HITS'));
  assert.deepEqual(s.state.units,original.units,'Attachments preserve all physical identities, equipment and raw import');
  assert.deepEqual(r.roster,original,'Import result is not mutated');
  const snapshot=s.snapshot(),effective=s.projection;s.load(snapshot);assert.deepEqual(s.projection,effective);
  assert.equal(s.effective('parsed-unit-1').formedUnit.bodyguardInstanceId,'parsed-unit-4');
  assert.equal(r.legality,'NOT_ASSESSED');assert.equal(r.attachmentAdjudications[0].status,'UNRESOLVED');
});
check(()=>{
  const text=fixture('unit-upgrades')+block('unit-lucius-the-eternal',['datasheet-lucius-the-eternal:weapon:1'])+
    block('unit-lord-kakophonist',['datasheet-lord-kakophonist:weapon:1','datasheet-lord-kakophonist:weapon:3'])+'Enhancement: Cacophonic Accompaniment\n'+
    fixture('bsdata-model-variants').split('6x Noise Marines')[1].split('5x Tormentors')[0].replace(/^/,'6x Noise Marines');
  const {s}=imported(text);assert.equal(s.state.units.length,6);
  const luciusMove=Number(records.get('datasheet-lucius-the-eternal:profile:1').data.stats.M.replace('"',''));
  s.attach('parsed-unit-2','parsed-unit-4');assert.equal(unit(s,'parsed-unit-4').profiles[0].profile.stats.M,`${luciusMove+2}"`);
  assert.equal(unit(s,'parsed-unit-3').profiles[0].profile.stats.M,'8"');
  s.detach('parsed-unit-4');assert.equal(unit(s,'parsed-unit-4').profiles[0].profile.stats.M,`${luciusMove}"`);
  s.reattach('parsed-unit-2','parsed-unit-4');assert.equal(unit(s,'parsed-unit-4').profiles[0].profile.stats.M,`${luciusMove+2}"`);
  s.attach('parsed-unit-1','parsed-unit-5');assert.ok(has(s,'parsed-unit-5','core-deep-strike'));
  assert.ok(!has(s,'parsed-unit-1','core-deep-strike'),'MODEL Deep Strike cannot leak to Bodyguard');
  rangedIgnoreCover(s,'parsed-unit-1');assert.ok(weaponAbility(s,'parsed-unit-5','SUSTAINED HITS 1'));
  s.reattach('parsed-unit-6','parsed-unit-5');rangedIgnoreCover(s,'parsed-unit-6');
  assert.ok(weapons(s,'parsed-unit-1').every(w=>!w.data.abilities.some(a=>a.toUpperCase()==='IGNORES COVER')));
  const melee=weapons(s,'parsed-unit-5').filter(w=>w.data.mode==='melee');assert.ok(melee.length);
  assert.ok(melee.every(w=>!w.data.abilities.includes('SUSTAINED HITS 1')),'Terminator Upgrade does not follow the detached Character');
  assert.deepEqual(s.state.units.slice(0,3).map(u=>u.enhancementAssignments),[[],[],[]]);
});
check(()=>{
  const {s}=imported(fixture('character-bodyguard'));s.attach('parsed-unit-2','parsed-unit-1');
  assert.equal(has(s,'parsed-unit-1','core-scouts'),false);assert.equal(has(s,'parsed-unit-1','core-infiltrators'),false);
  assert.equal(s.state.initialAttachmentStep,undefined,'Current attachment never fabricates historical evidence');
  const undated=s.snapshot();undated.initialAttachments=clone(undated.attachments);s.load(undated);assert.equal(has(s,'parsed-unit-1','core-scouts'),false);
  const confirmed=s.snapshot();confirmed.initialAttachmentStep='DECLARE_BATTLE_FORMATIONS';s.load(confirmed);
  assert.ok(has(s,'parsed-unit-1','core-scouts'));assert.ok(has(s,'parsed-unit-1','core-infiltrators'));
  assert.ok(unit(s,'parsed-unit-2').profiles.every(m=>!m.abilities.some(a=>['core-scouts','core-infiltrators'].includes(a.canonicalId))));
  assert.deepEqual(unit(s,'parsed-unit-1').profiles[0].abilities.find(a=>a.canonicalId==='core-scouts').parameters,{distance:6});
  s.detach('parsed-unit-1');assert.ok(has(s,'parsed-unit-1','core-scouts'),'Explicit historical qualification is not replaced by current attachment');
  const prior=s.snapshot(),priorProjection=s.projection;
  for(const change of [s=>s.initialAttachmentStep='SHOOTING_PHASE',s=>s.initialAttachments[0].bodyguardInstanceId='foreign',
    s=>s.initialAttachments.push(clone(s.initialAttachments[0])),s=>delete s.initialAttachments]){
    const bad=clone(prior);change(bad);assert.throws(()=>s.load(bad));assert.deepEqual(s.snapshot(),prior);assert.deepEqual(s.projection,priorProjection);negative++;}
});
check(()=>{
  const {s}=imported(fixture('character-bodyguard'));const original=s.snapshot();
  for(const text of [fixture('possessed-blade-missing-decision')]){
    assert.equal(s.import(text).status,'NEEDS_BINDINGS');assert.deepEqual(s.snapshot(),original);negative++;}
  const result=s.import(fixture('aggregate-equipment-unresolved'));assert.equal(result.status,'READY');
  assert.equal(s.effective('parsed-unit-1').unitMetrics.chargeRoll.modifier,1);
  assert.ok(s.state.units[0].modelRows.every(row=>row.selections.every(selection=>selection.canonicalEquipmentIds.length===0)));
  assert.equal(contracts.length,26);assert.deepEqual(book,before);
});
for(const mutate of [p=>p.pop(),p=>p.push(clone(p[0])),p=>p[0].targetId='unit-keeper-of-secrets',
  p=>p.push({sourceId:'unit-lord-exultant',targetId:'unit-flawless-blades',role:'LEADER',additionalLeaders:0,sourceIds:['detachment-court-of-the-phoenician:enhancement:2']}),
  p=>p[0].additionalLeaders=1,p=>p[0].mfmReferenceId='foreign']) {
  const bad=clone(book);mutate(bad.rosterAttachmentPolicies);assert.throws(()=>make(bad),/Unconfirmed EC attachment relation/);mutations++;
}
console.log(JSON.stringify({status:'PASS',relations:8,adjudication:'D_UNDERDETERMINED_UNAPPLIED',checks,negative,mutations,
  previousContracts:contracts.length,armyLegality:'NOT_ASSESSED',browserUserFlow:'NOT_RUN_NO_UI',sharedRuntimeChanged:false}));
