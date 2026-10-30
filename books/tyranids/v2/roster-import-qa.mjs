import {parseSourceFixtureJSON,sourceFixture} from '../../../tests/helpers/source-refs-fixtures.mjs';
import {sourceSnapshot,sourceDeclarationView} from '../../shared/source-refs-v2/source-refs.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {buildTyranidsImportBook} from './roster-import-build.mjs';
import {createTyranidsRosterImport,createTyranidsImportAttachments} from './roster-import.mjs';
import {resolveImportedPoints} from './roster-points.mjs';
import {formRoster,selections} from '../../shared/roster-v2/context.mjs';

// Constructed source-backed New Recruit TEXT fixtures, not captured exports.
// The accepted factual owner, not import metadata, supplies the inventory.
const read=name=>parseSourceFixtureJSON(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const facts=read('./generated/effective.json'),source=read('./roster-import-source-bindings.json');
const mfm=read('../../../mfm/sources/v1.6/tyranids.json'),book=buildTyranidsImportBook();
const original=structuredClone(book),records=new Map(facts.entities.map(e=>[e.id,e]));
const units=facts.entities.filter(e=>e.kind==='DATASHEET'),detachments=facts.entities.filter(e=>e.kind==='DETACHMENT');
const enhancements=facts.entities.filter(e=>e.kind==='ENHANCEMENT'),weapons=facts.entities.filter(e=>e.kind==='WEAPON_PROFILE');
const norm=s=>String(s).toUpperCase().replace(/[’']/g,'').replace(/[^A-Z0-9]+/g,' ').trim();
const members=id=>facts.entities.filter(e=>e.kind==='COMPOSITION_MEMBER'&&e.parentId===id);
const header=det=>`+ FACTION KEYWORD: Tyranids\n+ DETACHMENT: ${det}\n`;
const minimum=id=>members(id).reduce((n,e)=>n+e.data.quantity.min,0);
const baseCost=(id,count=minimum(id),copy=1)=>{
  const unit=mfm.units.find(u=>u.status==='CURRENT'&&norm(u.title)===norm(records.get(id).data.title));
  const values=unit.pointSchedules.filter(s=>copy>=(s.minCopies??1)&&copy<=(s.maxCopies??Infinity))
    .flatMap(s=>s.entries.filter(e=>count>=e.minModels&&count<=e.maxModels));
  assert.equal(values.length,1,`Fixture requires one accepted MFM tier: ${id}/${count}/${copy}`);
  return values[0].value;
};
const block=(id,{equipment={},counts={},points,singleEquipment=false}={})=>{
  const parts=members(id),count=parts.reduce((n,m)=>n+(counts[m.id]??m.data.quantity.min),0);
  return `${count}x ${records.get(id).data.title} (${points??baseCost(id,count)} pts)\n`+
    parts.flatMap(m=>{
      const count=counts[m.id]??m.data.quantity.min;
      if(singleEquipment&&equipment[m.id]&&count>1)return [`• 1x ${m.data.name}: ${equipment[m.id]}`,`• ${count-1}x ${m.data.name}`];
      return [`• ${count}x ${m.data.name}${equipment[m.id]?': '+equipment[m.id]:''}`];
    }).join('\n')+'\n';
};
let checks=0,negative=0,mutations=0;
const check=fn=>{fn();checks++;};
const service=()=>createTyranidsRosterImport(book);
const ready=(text,bindings={},consumer=service())=>{
  const r=consumer.import(text,bindings);
  assert.equal(r.status,'READY',JSON.stringify({needs:r.needsBindings,errors:r.errors,text}));
  return r;
};
const rejected=(text,bindings={})=>{const r=service().import(text,bindings);assert.notEqual(r.status,'READY');negative++;return r;};
const basic=id=>header('Invasion Fleet')+block(id);

// T01/T03/T06: exact independently enumerated identities and physical composition.
check(()=>{
  assert.equal(units.length,52);assert.equal(detachments.length,10);assert.equal(enhancements.length,34);assert.equal(weapons.length,133);
  for(const u of units){
    const state=ready(basic(u.id)).roster,out=state.units[0],expected=members(u.id);
    assert.equal(out.canonicalUnitId,u.id);assert.equal(out.startingStrength,minimum(u.id));
    assert.deepEqual(out.modelRows.map(r=>r.compositionMemberId),expected.map(m=>m.id));
    assert.deepEqual(out.modelRows.map(r=>r.canonicalProfileId),expected.map(m=>m.data.modelProfileId));
    assert.deepEqual(out.modelRows.map(r=>r.quantity),expected.map(m=>m.data.quantity.min));
    assert.deepEqual(state.attachments,[],'Import never invents an attachment');
    for(const model of formRoster(book,state).units[0].profiles)
      assert.deepEqual(model.profile,records.get(model.canonicalProfileId).data,'Import does not modify MODEL characteristics');
    for(const row of out.modelRows){
      const expectedRefs=u.data.ruleReferenceIds.filter(id=>{
        const recipient=records.get(id).data.recipient;
        return (!recipient?.modelProfileIds||recipient.modelProfileIds.includes(row.canonicalProfileId))&&
          (!recipient?.compositionMemberIds||recipient.compositionMemberIds.includes(row.compositionMemberId));
      });
      assert.deepEqual(row.sourceRuleReferenceIds,expectedRefs,'Native references retain exact MODEL recipients');
    }
  }
  for(const d of detachments)assert.deepEqual(ready(header(d.data.title)+block('unit-hive-tyrant')).roster.detachmentIds,[d.id]);
  rejected(header('Invasion Fleet')+block('unit-neurogaunts',{counts:{'datasheet-neurogaunts:section:2:member:1':2},points:90}));
  ready(header('Invasion Fleet')+block('unit-neurogaunts',{counts:{'datasheet-neurogaunts:section:2:member:1':2,
    'datasheet-neurogaunts:section:2:member:2':20},points:90}));
});

// T02/T12: canonical facts stay shared; physical occurrences stay independent.
check(()=>{
  const text=header('Invasion Fleet')+block('unit-old-one-eye')+block('unit-old-one-eye');
  const s=service(),a=ready(text,{},s).roster,b=ready(text).roster;
  assert.deepEqual(a,b);assert.deepEqual(s.load(s.snapshot()),a);
  assert.deepEqual(a.units.map(u=>u.instanceId),['parsed-unit-1','parsed-unit-2']);
  assert.deepEqual(a.units.map(u=>u.canonicalUnitId),['unit-old-one-eye','unit-old-one-eye']);
  const formed=formRoster(book,a);assert.notEqual(formed.units[0].profiles[0].scopeId,formed.units[1].profiles[0].scopeId);
  const clone=s.snapshot();clone.units[0].modelRows[0].quantity=9;assert.deepEqual(s.state,a);
});

// Exact aggregate quantities survive for homogeneous units; no MODEL owns
// the weapons until the input identifies one. Different instances stay apart.
check(()=>{
  const selected='10x Termagants (60 pts): 10x Fleshborer, 10x Chitinous claws and teeth\n';
  const other='10x Termagants (60 pts): 10x Termagant spinefists, 10x Chitinous claws and teeth\n';
  const s=service(),state=ready(header('Invasion Fleet')+selected+other,{},s).roster;
  for(const [n,expected]of [[0,['Fleshborer','Chitinous claws and teeth']],[1,['Termagant spinefists','Chitinous claws and teeth']]]){
    const unit=state.units[n];assert.equal(unit.startingStrength,10);
    assert.deepEqual(unit.selections.map(x=>records.get(x.canonicalProfileIds[0]).data.name),expected);
    assert.ok(unit.selections.every(x=>x.physicalQuantity===10&&x.perModelQuantity===null&&x.quantityEvidence.scope==='UNIT'));
    assert.ok(unit.modelRows.every(row=>row.selections.length===0&&row.loadouts.length===0));
  }
  const projected=formRoster(book,state);
  assert.ok(projected.units.every(u=>u.profiles.every(p=>p.weapons.length===0)),'Aggregate weapons do not invent MODEL ownership');
  assert.deepEqual(projected.units.map(u=>u.weapons.map(w=>w.physicalQuantity)),[[10,10],[10,10]]);
  assert.deepEqual(s.load(state),state);assert.deepEqual(ready(header('Invasion Fleet')+selected+other,{},s).roster,state);
  const removed=ready(header('Invasion Fleet')+other+other,{},s).roster;
  assert.ok(!removed.units[0].selections.some(x=>x.canonicalProfileIds.includes('datasheet-termagants:weapon:1')));
});

// T04/T05: exact mixed statlines and three distinct physical loadout groups.
const hyperBlock=`5x Hyperadapted Raveners (165 pts)\n`+
  `• 1x Ravener Prime: Prime claws and talons\n`+
  `• 3x Raveners: Ravener heavy claws and talons\n`+
  `• 1x Raveners: Venom bolt, Ravener heavy claws and talons\n`;
check(()=>{
  const text=header('Invasion Fleet')+hyperBlock,state=ready(text).roster,u=state.units[0],models=formRoster(book,state).units[0].profiles;
  assert.deepEqual(u.modelRows.map(r=>r.quantity),[1,3,1]);
  assert.deepEqual(models.map(m=>m.profile.stats.W),['6','3','3']);
  assert.deepEqual(models.map(m=>m.weapons.map(w=>[w.canonicalProfileId,w.physicalQuantity])),[
    [['datasheet-hyperadapted-raveners:weapon:2',1]],
    [['datasheet-hyperadapted-raveners:weapon:3',3]],
    [['datasheet-hyperadapted-raveners:weapon:1',1],['datasheet-hyperadapted-raveners:weapon:3',1]]]);
  const shadow='datasheet-hyperadapted-raveners:rule-reference:3';
  assert.ok(u.modelRows[0].sourceRuleReferenceIds.includes(shadow));
  assert.ok(u.modelRows.slice(1).every(r=>!r.sourceRuleReferenceIds.includes(shadow)));
  assert.ok(models.every(m=>!m.abilities.some(a=>/shadow|synapse/i.test(a.name))),'No battle-dependent execution');
  assert.ok(models[0].keywords.includes('CHARACTER')&&models[0].keywords.includes('SYNAPSE'));
  assert.ok(models.slice(1).every(m=>!m.keywords.includes('CHARACTER')&&!m.keywords.includes('SYNAPSE')));
  const variants=ready(text.replace('3x Raveners:','3x Ravener:').replace('1x Raveners:','1x Ravener w/ Venom bolt:')).roster;
  assert.deepEqual(variants.units[0].modelRows.map(r=>r.compositionMemberId),u.modelRows.map(r=>r.compositionMemberId));
  rejected(text.replace('• 1x Ravener Prime: Prime claws and talons','• 1x Ravener Prime: Venom bolt'));
  rejected(text.replace('• 3x Raveners: Ravener heavy claws and talons','• 3x Raveners: Prime claws and talons'));
  const aggregate=service().import(header('Invasion Fleet')+hyperBlock.replace('(165 pts)','(165 pts): 1x Venom bolt')
    .replace('• 1x Raveners: Venom bolt,','• 1x Raveners:'));
  assert.equal(aggregate.status,'NEEDS_BINDINGS');assert.ok(aggregate.needsBindings.some(n=>n.kind==='VENOM_BOLT_MODEL_OWNER'));negative++;
});

check(()=>{
  const text=header('Invasion Fleet')+`3x Tyrant Guard (90 pts)\n• 3x Tyrant Guard: Bone cleaver, lash whip and rending claws\n`;
  const s=service(),state=ready(text,{},s).roster,row=state.units[0].modelRows[0];
  assert.equal(row.selections.length,1);assert.equal(row.selections[0].physicalQuantity,3);
  assert.equal(row.selections[0].compoundSourceSelections.length,2);
  assert.equal(formRoster(book,state).units[0].profiles[0].weapons.length,1,'Combined profile is never doubled');
  assert.deepEqual(s.load(state),state);
  for(const mutate of [bad=>bad.units[0].modelRows[0].selections[0].compoundSourceSelections[1].key='parsed-unit-999/selection/2',
    bad=>bad.units[0].modelRows[0].selections[0].compoundSourceSelections[1].rawText='Imaginary weapon']){
    const bad=structuredClone(state);mutate(bad);assert.throws(()=>s.load(bad));assert.deepEqual(s.state,state);mutations++;
  }
  rejected(text.replace('Bone cleaver, lash whip and rending claws','Bone cleaver'));
  rejected(text.replace('Bone cleaver, lash whip and rending claws','lash whip and rending claws'));
  rejected(text+`3x Tyrant Guard (90 pts)\n• 3x Tyrant Guard: Bone cleaver\n`);
  for(const alias of source.weaponAliases){
    const owner=members(alias.ownerId).find(member=>{
      const rule=source.modelWeaponBindings.find(r=>r.memberId===member.id);
      return !rule||alias.canonicalProfileIds.every(id=>rule.allowedProfileIds.includes(id));
    });
    const state=ready(header('Invasion Fleet')+block(alias.ownerId,{equipment:{[owner.id]:alias.label}})).roster;
    const selected=selections(state.units[0]).flatMap(s=>s.canonicalProfileIds);
    assert.ok(alias.canonicalProfileIds.every(id=>selected.includes(id)),alias.label);
  }
});

// Exact source-owned vocabulary covers every profile, including grouped modes.
check(()=>{
  const covered=new Set();
  for(const weapon of weapons){
    const parts=members(weapon.parentId),restricted=source.modelWeaponBindings;
    const member=parts.find(m=>{
      const rule=restricted.find(r=>r.memberId===m.id);
      return !rule||rule.allowedProfileIds.includes(weapon.id);
    });
    assert.ok(member,weapon.id);
    const text=header('Invasion Fleet')+block(weapon.parentId,{equipment:{[member.id]:weapon.data.name},singleEquipment:true});
    const r=service().import(text);
    // Lexically identical mode names can resolve to a source-backed family.
    assert.equal(r.status,'READY',JSON.stringify({weapon:weapon.id,needs:r.needsBindings,errors:r.errors}));
    for(const selected of selections(r.roster.units[0]))for(const id of selected.canonicalProfileIds)covered.add(id);
    assert.ok(covered.has(weapon.id),`Missing exact accepted profile: ${weapon.id}`);
  }
  assert.equal(covered.size,133);
});

// T07: every selected Enhancement resolves, four UNIT Upgrades never get MODEL ownership.
check(()=>{
  const upgradeIds=['detachment-ambush-predators:enhancement:1','detachment-ambush-predators:enhancement:2',
    'detachment-talons-of-the-norn-queen:enhancement:1','detachment-talons-of-the-norn-queen:enhancement:2'];
  assert.deepEqual(enhancements.filter(e=>e.data.scope==='UNIT').map(e=>e.id).sort(),upgradeIds.sort());
  for(const e of enhancements){
    const binding=book.importBindings.enhancements.find(b=>b.id===e.id);assert.ok(binding,e.id);
    const eligible=binding.eligibleUnitIds.map(id=>records.get(id));
    const owner=binding.scope==='UNIT'?eligible[0]:eligible.find(u=>minimum(u.id)===1&&members(u.id).length===1);
    assert.ok(owner,'Source-backed eligible owner required: '+e.id);
    const text=header(records.get(e.parentId).data.title)+block(owner.id)+'Enhancement: '+e.data.title+'\n';
    const u=ready(text).roster.units[0];assert.deepEqual(u.enhancementIds,[e.id]);
    assert.equal(u.enhancementAssignments?.length||0,binding.scope==='UNIT'?0:1);
    assert.ok(u.mfmEnhancementRecordIds?.length===1,'Central Enhancement reference retained');
    if(binding.scope==='UNIT'){
      const bad=units.find(candidate=>!binding.eligibleUnitIds.includes(candidate.id));
      rejected(header(records.get(e.parentId).data.title)+block(bad.id)+'Enhancement: '+e.data.title+'\n');
    }
  }
});

// T08: independent accepted Leader declarations, no keyword-generated edges.
check(()=>{
  const expected=facts.entities.filter(e=>e.kind==='DATASHEET_SECTION'&&e.data.title==='LEADER').flatMap(e=>
    e.data.blocks.flatMap(b=>b.text.split('\n').filter(line=>line.startsWith('- '))).map(line=>{
      const target=units.filter(u=>norm(u.data.title)===norm(line.slice(2)));assert.equal(target.length,1,line);
      return [e.parentId,target[0].id];
    })).sort();
  assert.equal(expected.length,15);
  assert.deepEqual(book.rosterAttachmentPolicies.map(p=>[p.sourceId,p.targetId]).sort(),expected);
  const originalImport=ready(header('Invasion Fleet')+block('unit-broodlord')+block('unit-genestealers')+block('unit-pyrovores')).roster;
  const attachment=createTyranidsImportAttachments(book);attachment.load(originalImport);
  assert.ok(attachment.candidates('parsed-unit-2').some(c=>c.instanceId==='parsed-unit-1'));
  attachment.attach('parsed-unit-2','parsed-unit-1');assert.equal(attachment.groups.length,1);
  assert.deepEqual(originalImport.attachments,[]);attachment.detach('parsed-unit-1');assert.equal(attachment.groups.length,0);
  attachment.reattach('parsed-unit-2','parsed-unit-1');assert.equal(attachment.groups.length,1);
  assert.throws(()=>attachment.reattach('parsed-unit-3','parsed-unit-1'));negative++;
});

// T09: central schedules and paid options; exported prices are evidence, never added twice.
check(()=>{
  const tyr=(weapon,points)=>`1x Tyrannofex (${points} pts)\n• 1x Tyrannofex: ${weapon}, Stinger salvoes, Powerful limbs\n`;
  const text=header('Invasion Fleet')+tyr('Acid spray',180)+tyr('Rupture cannon',190)+tyr('Fleshborer hive',180);
  const state=ready(text).roster,priced=resolveImportedPoints(book,state);
  assert.equal(priced.status,'KNOWN');assert.equal(priced.sourceVersion,'v1.6');assert.equal(priced.total,550);
  assert.deepEqual(priced.units.map(u=>[u.basePoints,u.paidOptionPoints,u.total,u.copyOrdinal]),[[170,10,180,1],[170,20,190,2],[180,0,180,3]]);
  assert.deepEqual(resolveImportedPoints(book,state),priced,'Repeated assessment does not accumulate costs');
  const unknown=resolveImportedPoints(book,ready(basic('unit-tyrannofex')).roster);
  assert.equal(unknown.status,'UNKNOWN','Missing paid-option selection cannot become zero-cost certainty');
  const incomplete=resolveImportedPoints(book,ready(header('Invasion Fleet')+
    `1x Tyrannofex (170 pts)\n• 1x Tyrannofex: Stinger salvoes, Powerful limbs\n`).roster);
  assert.equal(incomplete.status,'UNKNOWN','Ancillary weapons do not establish the omitted paid replacement');
});

// T10/T13: the accepted native bag survives; no rules are lowered or executed.
check(()=>{
  for(const [unitId,reference]of [['unit-old-one-eye','datasheet-old-one-eye:rule-reference:1'],
    ['unit-psychophage','datasheet-psychophage:rule-reference:2']]){
    assert.deepEqual(sourceDeclarationView(book.rosterReferenceSemantics[reference],{book}),sourceDeclarationView(facts.rosterReferenceSemantics[reference],{book:facts}));
    const state=ready(basic(unitId)).roster,out=formRoster(book,state).units[0];
    assert.ok(state.units[0].modelRows[0].sourceRuleReferenceIds.includes(reference));
    assert.deepEqual(out.profiles[0].abilities,[{name:'Feel No Pain',value:5}]);
  }
  const attachment=createTyranidsImportAttachments(book),state=ready(header('Invasion Fleet')+
    block('unit-old-one-eye')+block('unit-carnifexes')+block('unit-old-one-eye')).roster;
  attachment.load(state);attachment.attach('parsed-unit-2','parsed-unit-1');
  const attached=formRoster(book,attachment.state);
  assert.ok(attached.units.filter(u=>u.canonicalUnitId==='unit-old-one-eye').every(u=>
    u.profiles.every(p=>p.abilities.length===1&&p.abilities[0].name==='Feel No Pain'&&p.abilities[0].value===5)));
  assert.ok(attached.units.find(u=>u.canonicalUnitId==='unit-carnifexes').profiles.every(p=>p.abilities.length===0),
    'Attached Bodyguard never receives the Leader native MODEL ability');
  assert.ok(book.entities.every(e=>!e.ruleContract),'Import cannot execute gameplay contracts');
  for(const u of formRoster(book,ready(basic('unit-venomthropes')).roster).units){
    assert.deepEqual(u.applied,[]);assert.deepEqual(u.metrics,{});assert.ok(u.profiles.every(p=>p.abilities.length===0));
  }
  for(const e of facts.entities){const actual=book.entities.find(a=>a.id===e.id);assert.ok(actual,e.id);
    assert.deepEqual(sourceDeclarationView(actual.data,{book}),sourceDeclarationView(e.data,{book:facts}));assert.deepEqual(sourceSnapshot(actual),sourceSnapshot(e));assert.equal(actual.parentId,e.parentId);}
  const sourceMismatch=structuredClone(book.rosterReferenceSemantics['datasheet-old-one-eye:rule-reference:1']);
  sourceFixture(sourceMismatch,{book}).provenance.sha256='changed-source-hash';
  assert.throws(()=>assert.deepEqual(sourceDeclarationView(sourceMismatch,{book}),sourceDeclarationView(facts.rosterReferenceSemantics['datasheet-old-one-eye:rule-reference:1'],{book:facts})),'Import source equality must reject a changed hash');
  const transports=book.entities.filter(e=>e.kind==='DATASHEET_SECTION'&&e.data.title==='TRANSPORT');
  assert.deepEqual(transports.map(e=>e.parentId).sort(),['unit-harridan','unit-hierophant','unit-tyrannocyte']);
  assert.ok(transports.every(e=>e.data.executable===false&&e.data.declaration.conditionalOnly));
});

// T11: errors/ambiguities cannot invent a canonical identity or a physical owner.
check(()=>{
  rejected(header('Invasion Fleet')+'1x Unidentified bioform (100 pts)\n');
  rejected(header('Invasion Fleet')+'1x Tyranid Prime (100 pts)\n');
  rejected(header('Unidentified Fleet')+block('unit-hive-tyrant'));
  rejected(basic('unit-hive-tyrant').replace('• 1x Hive Tyrant','• 1x Hive Tyrant: Imaginary bio-cannon'));
  const ambiguous=service().import(header('Invasion Fleet')+block('unit-barbgaunts')+'Enhancement: Adaptive Biology\n');
  assert.equal(ambiguous.status,'NEEDS_BINDINGS','Grouped MODEL Enhancement assignment cannot guess a bearer');negative++;
  const foreign=header('Invasion Fleet')+block('unit-old-one-eye',{equipment:{'datasheet-old-one-eye:section:2:member:1':'Monstrous crushing claws'}});
  rejected(foreign,{selections:{'parsed-unit-1/model-row/1/selection/1':{
    canonicalProfileIds:['datasheet-psychophage:weapon:1'],canonicalEquipmentIds:[]}}});
  const s=service(),state=ready(basic('unit-old-one-eye'),{},s).roster;
  for(const mutate of [bad=>{bad.units[0].modelRows[0].canonicalProfileId='datasheet-psychophage:profile:1';},
    bad=>{bad.units[0].modelRows[0].compositionMemberId='datasheet-psychophage:section:2:member:1';},
    bad=>{bad.units[0].modelRows[0].quantity=2;},
    bad=>{bad.units[0].modelRows[0].sourceRuleReferenceIds=[];},
    bad=>{bad.units[0].mfmUnitRecordId='foreign-mfm-owner';}]){
    const bad=structuredClone(state);mutate(bad);assert.throws(()=>s.load(bad));assert.deepEqual(s.state,state);mutations++;
  }
  assert.deepEqual(book,original,'No import mutates its source-owned input');
});

console.log(JSON.stringify({status:'PASS',datasheets:52,detachments:10,enhancements:34,unitUpgrades:4,weaponProfiles:133,
  leaderRelations:15,nativeFnpOwners:2,checks,negative,mutations,REAL_NEW_RECRUIT_EXPORT_TESTED:'NO',
  sharedChanges:false,gameplayExecuted:false}));
