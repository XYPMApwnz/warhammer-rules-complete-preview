import fs from 'node:fs';
import assert from 'node:assert/strict';
import {buildECImportBook} from './roster-import-build.mjs';
import {createECRosterImport,loadRosterImport,withECImportBindings} from './roster-import.mjs';
import {buildECContracts} from './rule-contract-build.mjs';
import {createFormationContext} from './rule-contract-formation-context.mjs';
import {validateRoster,formRoster,selections,changeAttachment} from '../../shared/roster-v2/context.mjs';
import {executeRosterEffects} from '../../shared/roster-v2/effects.mjs';
import {resolveOwnedFact,assertNoMfmValues} from './mfm-boundary.mjs';
const clone=structuredClone,book=buildECImportBook(),original=clone(book),index=new Map(book.entities.map(e=>[e.id,e]));
const facts=JSON.parse(fs.readFileSync(new URL('./generated/effective.json',import.meta.url)));
const fixtures=JSON.parse(fs.readFileSync(new URL('./roster-import-fixtures.json',import.meta.url))).fixtures;
const fixture=id=>fixtures.find(f=>f.id===id).text,header=name=>'+ FACTION KEYWORD: Chaos - Emperor\'s Children\n+ DETACHMENT: '+name+'\n';
const make=()=>createECRosterImport(book);let checks=0,negative=0,mutations=0;
const nativeContracts=()=>{const n=buildECContracts();return {...n,book:withECImportBindings(n.book,book)};};
const check=fn=>{fn();checks++;},ready=(text,bindings={},s=make())=>{
  const r=s.import(text,bindings);assert.equal(r.status,'READY',JSON.stringify({needs:r.needsBindings,errors:r.errors}));return r;};
const members=u=>book.importBindings.compositions.filter(c=>c.ownerId===u.id);
const block=u=>`${members(u).reduce((n,c)=>n+c.quantity.min,0)}x ${u.data.title} (100 pts)\n`+
  members(u).map(c=>`• ${c.quantity.min}x ${index.get(c.id).data.name}`).join('\n');
const units=book.entities.filter(e=>e.kind==='DATASHEET'),detachments=book.entities.filter(e=>e.kind==='DETACHMENT'),enhancements=book.entities.filter(e=>e.kind==='ENHANCEMENT');
check(()=>{
  assert.equal(units.length,23);assert.equal(detachments.length,10);assert.equal(enhancements.length,34);
  assert.equal(book.importBindings.compositions.length,30);assert.equal(book.importBindings.equipmentSelections.length,7);
  for(const u of units){const r=ready(header('Carnival of Excess')+block(u)),out=r.roster.units[0];
    assert.equal(out.canonicalUnitId,u.id);assert.deepEqual(out.modelRows.map(m=>m.compositionMemberId),members(u).map(c=>c.id));
    assert.deepEqual(out.modelRows.map(m=>m.canonicalProfileId),members(u).map(c=>c.profileId));
    assert.ok(r.unresolvedEquipmentScopes.length===1,'Missing export loadout stays explicitly unknown');
    for(const id of u.data.weaponIds){const w=index.get(id),state=ready(header('Carnival of Excess')+block(u).replace('(100 pts)',`(100 pts): 1x ${w.data.name}`)).roster;
      assert.ok(selections(state.units[0]).some(s=>s.canonicalProfileIds.includes(id)),id);
    }
  }
  for(const d of detachments)assert.deepEqual(ready(header(d.data.title)+block(index.get('unit-sorcerer'))).roster.detachmentIds,[d.id]);
});
check(()=>{
  const native=nativeContracts();
  for(const e of enhancements){const binding=book.importBindings.enhancements.find(x=>x.id===e.id),selector=binding.assignmentReference?.selector;
    const candidate=binding.scope==='UNIT'?index.get(binding.unitId):units.find(u=>members(u).length===1&&members(u)[0].quantity.min===1&&
      (!selector||native.schema.evaluatePredicate(selector,{subject:'MODEL',unitId:u.id,modelId:u.data.profileIds[0],keywords:new Set([...u.data.keywords,...u.data.factionKeywords]),roster:{},battle:{}})!=='FALSE'));
    assert.ok(candidate,e.id);const result=make().import(header(index.get(e.parentId).data.title)+block(candidate)+'\nEnhancement: '+e.data.title);
    assert.ok(result.resolutions.some(r=>r.kind==='ENHANCEMENT'&&r.canonicalIds.includes(e.id)),e.id);
    if(e.id==='detachment-carnival-of-excess:enhancement:3')assert.equal(result.status,'NEEDS_BINDINGS');
    else assert.equal(result.status,'READY',JSON.stringify({id:e.id,needs:result.needsBindings,errors:result.errors}));
    const state=result.roster||result.candidateRoster;assert.ok(state.units[0].enhancementIds.includes(e.id));
    assert.equal(state.units[0].enhancementAssignments.length,binding.scope==='UNIT'?0:1);
    assert.equal(resolveOwnedFact(state.units[0].mfmEnhancementRecordIds[0]).provenance.sourceVersion,'v1.6');
  }
  const alias=ready(header('Rapid Evisceration')+block(index.get('unit-sorcerer'))+'\nEnhancement: Sublime Presence');
  assert.deepEqual(alias.roster.units[0].enhancementIds,['detachment-rapid-evisceration:enhancement:1']);
});
check(()=>{
  const service=make(),result=ready(fixture('character-bodyguard'),{},service),state=result.roster;
  assert.equal(state.units.length,2);assert.equal(state.warlordInstanceId,'parsed-unit-1');assert.equal(state.units[0].enhancementAssignments.length,1);
  assert.equal(state.units[0].raw.points,95);assert.equal(resolveOwnedFact(state.units[0].mfmUnitRecordId).pointSchedules[0].entries[0].value,95);
  assert.equal(resolveOwnedFact(state.units[0].mfmEnhancementRecordIds[0]).value,15);
  assert.deepEqual(make().load(service.snapshot()),state);assert.deepEqual(ready(fixture('character-bodyguard')).roster,state);
  const native=nativeContracts(),validated=validateRoster(native.book,state,native.book.rosterAttachmentPolicies);
  const attached=changeAttachment(native.book,validated,native.book.rosterAttachmentPolicies,'ATTACH','parsed-unit-1','parsed-unit-2');
  const effective=executeRosterEffects(native.book,attached,createFormationContext(native.book,attached,native.schema));
  assert.equal(effective.units[0].profiles[0].profile.stats.M,'8"');assert.equal(effective.units[1].profiles[0].profile.stats.M,'7"');
});
check(()=>{
  const state=ready(fixture('legions-physical-equipment')).roster;assert.equal(state.units.length,5);
  for(const u of state.units){assert.deepEqual(index.get(u.canonicalUnitId).data.factionKeywords,['LEGIONS OF EXCESS']);assert.ok(u.mfmUnitRecordId);}
  const native=nativeContracts(),s=validateRoster(native.book,state,native.book.rosterAttachmentPolicies),r=executeRosterEffects(native.book,s,createFormationContext(native.book,s,native.schema));
  assert.equal(r.units[0].profiles[0].profile.stats.SV,'3+');assert.equal(r.units[0].profiles[0].profile.stats.INSV,'4+');
  for(const u of r.units.slice(1,3)){assert.equal(u.metrics.chargeRoll.modifier,1);assert.ok(u.profiles.every(m=>m.profile.stats.LD==='6+'));}
  assert.equal(r.units[3].metrics.chargeRoll,undefined);assert.deepEqual(make().load(state),state);
  const independent=ready(fixture('legions-physical-equipment')+'1x Keeper of Secrets (265 pts): Phantasmagoria, Snapping claws, Witstealer sword, Living whip\n').roster;
  const isolated=validateRoster(native.book,independent,native.book.rosterAttachmentPolicies);
  const isolatedEffects=executeRosterEffects(native.book,isolated,createFormationContext(native.book,isolated,native.schema));
  assert.equal(isolatedEffects.units[0].profiles[0].profile.stats.SV,'3+');
  assert.equal(isolatedEffects.units[5].profiles[0].profile.stats.SV,'5+','Unselected independent Keeper retains its ordinary Save');
  assert.equal(ready(fixture('legions-physical-equipment')).legality,'NOT_ASSESSED','Recognition does not certify allied legality');
});
check(()=>{
  const state=ready(fixture('unit-upgrades')).roster;
  assert.ok(state.units.every(u=>u.enhancementAssignments.length===0));
  const native=nativeContracts(),s=validateRoster(native.book,state,native.book.rosterAttachmentPolicies),r=executeRosterEffects(native.book,s,createFormationContext(native.book,s,native.schema));
  assert.equal(index.get('datasheet-flawless-blades:profile:1').data.stats.M,'8"');
  assert.equal(r.units[1].profiles[0].profile.stats.M,'10"');
  const variants=ready(fixture('bsdata-model-variants')).roster;
  assert.deepEqual(variants.units[0].modelRows.map(r=>r.compositionMemberId),['datasheet-noise-marines:section:2:member:1','datasheet-noise-marines:section:2:member:2','datasheet-noise-marines:section:2:member:2']);
  assert.ok(formRoster(book,variants).units[0].profiles.every(p=>p.profile.stats.W==='3'));
  for(const [name,weapon]of [['tormentors','Boltgun, Close combat weapon'],['infractors','Bolt pistol, Duelling sabre']]){
    const count=members(index.get('unit-'+name))[1].quantity.min;
    const text=header('Carnival of Excess')+`${count+1}x ${index.get('unit-'+name).data.title} (100 pts)\n• 1x Obsessionist: Bolt pistol, Power sword\n`+
      `• 1x ${name==='tormentors'?'Tormentor':'Infractor'}: ${weapon}, Icon of excess\n• ${count-1}x ${name==='tormentors'?'Tormentor':'Infractor'}: ${weapon}`;
    const state=ready(text).roster;assert.equal(selections(state.units[0]).filter(s=>s.canonicalEquipmentIds.length).length,1);
  }
});
const bladeId='detachment-carnival-of-excess:enhancement:3',optionId=bladeId+'::choice::datasheet-lord-exultant:weapon:7';
check(()=>{
  const text=fixture('possessed-blade-missing-decision'),missing=make().import(text);assert.equal(missing.status,'NEEDS_BINDINGS');
  assert.ok(missing.needsBindings.some(n=>n.kind==='POSSESSED_BLADE_WEAPON'));assert.equal(make().state,null);
  const service=make(),state=ready(text,{weaponChoices:{'parsed-unit-1':optionId}},service).roster;
  assert.deepEqual(state.units[0].selectedUpgradeIds,[optionId]);assert.equal(selections(state.units[0]).filter(s=>s.canonicalOptionIds?.length).length,1);
  assert.deepEqual(make().load(state),state);
  const native=nativeContracts(),s=validateRoster(native.book,state,native.book.rosterAttachmentPolicies),result=executeRosterEffects(native.book,s,createFormationContext(native.book,s,native.schema));
  const weapons=[...result.units[0].weapons,...result.units[0].profiles.flatMap(m=>m.weapons)];
  for(const w of weapons){const original=index.get(w.canonicalProfileId).data;assert.equal(w.data.attacks,w.canonicalProfileId==='datasheet-lord-exultant:weapon:7'?String(Number(original.attacks)+1):original.attacks);}
  const independent=ready(text+'\nChar2: 1x Lord Exultant (95 pts): Bolt pistol, Plasma pistol, Phoenix power spear, Close combat weapon',
    {weaponChoices:{'parsed-unit-1':optionId}}).roster;
  const independentValidated=validateRoster(native.book,independent,native.book.rosterAttachmentPolicies);
  const independentEffects=executeRosterEffects(native.book,independentValidated,createFormationContext(native.book,independentValidated,native.schema));
  for(const [i,unit]of independentEffects.units.entries())for(const weapon of [...unit.weapons,...unit.profiles.flatMap(p=>p.weapons)])
    if(weapon.canonicalProfileId==='datasheet-lord-exultant:weapon:7')assert.equal(weapon.data.attacks,
      i===0?String(Number(index.get(weapon.canonicalProfileId).data.attacks)+1):index.get(weapon.canonicalProfileId).data.attacks);
  assert.deepEqual(independent.units[1].enhancementAssignments,[],'A second Character never receives the first bearer assignment');
  for(const change of [s=>s.units[0].selectedUpgradeIds.push(bladeId+'::choice::datasheet-lord-exultant:weapon:5'),
    s=>selections(s.units[0]).find(x=>x.canonicalOptionIds?.length).physicalQuantity=2,
    s=>selections(s.units[0]).find(x=>x.canonicalOptionIds?.length).canonicalProfileIds.push('datasheet-lord-exultant:weapon:5')]){
    const bad=clone(state);change(bad);assert.throws(()=>make().load(bad));negative++;
  }
  for(const choice of ['wrong-option',bladeId+'::choice::datasheet-lucius-the-eternal:weapon:1',bladeId+'::choice::datasheet-lord-exultant:weapon:8']){
    assert.equal(make().import(text,{weaponChoices:{'parsed-unit-1':choice}}).status,'INVALID');negative++;
  }
  const bodyguardText=header('Carnival of Excess')+'5x Infractors (95 pts)\n• 1x Obsessionist: Bolt pistol, Power sword\n• 1x Infractor: Bolt pistol, Duelling sabre\n• 3x Infractor: Bolt pistol, Duelling sabre\nEnhancement: Possessed Blade';
  const missingOwner=make().import(bodyguardText);assert.equal(missingOwner.status,'NEEDS_BINDINGS');negative++;
  const exactScope='parsed-unit-1/parsed-unit-1/model-row/2/PROFILE/parsed-unit-1/model-row/2',selectedId=bladeId+'::choice::datasheet-infractors:weapon:4';
  const assigned=ready(bodyguardText,{modelBearers:{'parsed-unit-1':{[bladeId]:exactScope}},weaponChoices:{'parsed-unit-1':selectedId}}).roster;
  const misplaced=clone(assigned),decision=misplaced.units[0].modelRows[1].selections.pop();misplaced.units[0].modelRows[2].selections.push(decision);
  assert.throws(()=>make().load(misplaced));negative++;
  const nativeMixed=nativeContracts(),mixed=validateRoster(nativeMixed.book,assigned,nativeMixed.book.rosterAttachmentPolicies);
  const effectMixed=executeRosterEffects(nativeMixed.book,mixed,createFormationContext(nativeMixed.book,mixed,nativeMixed.schema));
  assert.equal(effectMixed.units[0].profiles[1].weapons.find(w=>w.canonicalProfileId==='datasheet-infractors:weapon:4').data.attacks,'5');
  assert.equal(effectMixed.units[0].profiles[2].weapons.find(w=>w.canonicalProfileId==='datasheet-infractors:weapon:4').data.attacks,'4');
  for(const scopes of [{[bladeId]:'foreign-model'}, {[bladeId]:''}, {'not-selected':'scope'}]){
    assert.equal(make().import(text,{modelBearers:{'parsed-unit-1':scopes},weaponChoices:{'parsed-unit-1':optionId}}).status,'INVALID');negative++;
  }
});
check(()=>{
  for(const [text,status]of [[fixture('aggregate-equipment-unresolved'),'NEEDS_BINDINGS'],
    [fixture('legions-physical-equipment').replace('• 1x Daemonette: Slashing claws, Instrument of Chaos','• 1x Daemonette: Slashing claws').replace('• 1x Alluress: Slashing claws','• 1x Alluress: Slashing claws, Instrument of Chaos'),'INVALID'],
    [header('Carnival of Excess')+'1x Keeper of Secrets (265 pts): Shining aegis, Living whip','INVALID'],
    [fixture('character-bodyguard').replaceAll('Lord Exultant','Lord Exultantt'),'NEEDS_BINDINGS'],
    [fixture('character-bodyguard').replace('• 4x Infractor:','• 4x Unidentified model:'),'NEEDS_BINDINGS'],
    [fixture('character-bodyguard').replace('Court of the Phoenician','Carnival of Excess'),'NEEDS_BINDINGS'],
    [fixture('character-bodyguard').replace('Chaos - Emperor\'s Children','Chaos - Chaos Space Marines'),'INVALID']]){
    const result=make().import(text);assert.equal(result.status,status,JSON.stringify({text,needs:result.needsBindings,errors:result.errors}));negative++;
  }
  const unknown=make().import(header('Carnival of Excess')+'10x Daemonettes (100 pts): Slashing claws');assert.equal(unknown.status,'NEEDS_BINDINGS');negative++;
  const s=make(),r=ready(fixture('character-bodyguard'),{},s),bad=clone(r.roster);bad.units[0].mfmUnitRecordId='foreign';assert.throws(()=>s.load(bad));assert.deepEqual(s.snapshot(),r.roster);negative++;
});
check(()=>{
  const expected=book.entities.map(e=>[e.id,e.data,e.parentId,e.provenance]);
  for(const e of facts.entities)assert.deepEqual(expected.find(r=>r[0]===e.id),[e.id,e.data,e.parentId,e.provenance]);
  assertNoMfmValues(book.entities);assert.deepEqual(book,original);
  assert.equal(book.mfmImportReferences.unitBindings.length,23);assert.equal(book.mfmImportReferences.detachmentBindings.length,10);assert.equal(book.mfmImportReferences.enhancementBindings.length,34);
  for(const part of ['unitBindings','enhancementBindings','detachmentBindings'])for(const b of book.mfmImportReferences[part])assert.equal(resolveOwnedFact(b.mfmRecordId).provenance.sourceVersion,'v1.6');
});
for(const mutate of [b=>b.importBindings.compositions[0].profileId='datasheet-sorcerer:profile:1',
  b=>b.importBindings.equipmentSelections.find(e=>e.label==='shining aegis').canonicalFieldPaths={'datasheet-keeper-of-secrets:section:1':['/blocks/0/text']},
  b=>b.importBindings.enhancements.find(e=>e.id==='detachment-spectacle-of-slaughter:enhancement:1').scope='MODEL']){
  const bad=clone(book);mutate(bad);assert.throws(()=>{
    const s=createECRosterImport(bad);for(const f of ['bsdata-model-variants','legions-physical-equipment','unit-upgrades'])ready(fixture(f),{},s);
  });mutations++;
}
const loaded=await loadRosterImport({fetch:async()=>({ok:true,json:async()=>clone(book)})});assert.equal(loaded.import(fixture('character-bodyguard')).status,'READY');
console.log(JSON.stringify({status:'PASS',datasheets:23,detachments:10,enhancements:34,compositionMembers:30,weaponProfiles:104,equipmentBindings:7,checks,negative,mutations,
  possessedBlade:'Explicit canonical binding; missing export decision NEEDS_BINDINGS',legality:'NOT_ASSESSED',browserUserFlow:'NOT_RUN_NO_UI'}));
