import fs from 'node:fs';
import assert from 'node:assert/strict';
import {buildCSMImportBook} from './roster-import-build.mjs';
import {buildImportBindings} from './roster-import-bindings.mjs';
import {createCSMRosterImport,loadRosterImport} from './roster-import.mjs';
import {selections} from '../../shared/roster-v2/context.mjs';

const book=buildCSMImportBook(),original=structuredClone(book),records=new Map(book.entities.map(e=>[e.id,e]));
const make=()=>createCSMRosterImport(book),header='+ FACTION KEYWORD: Chaos - Chaos Space Marines\n+ DETACHMENT: Veterans of the Long War, Pactbound Zealots\n';
const ready=(text,service=make())=>{const result=service.import(text);assert.equal(result.status,'READY',JSON.stringify({needs:result.needsBindings,errors:result.errors,draft:result.draft}));return result.roster;};
const rows=unit=>unit.data.profileIds.map(id=>{const p=records.get(id);return `• ${p.data.composition.quantity.min}x ${p.data.name}`;}).join('\n');
const block=unit=>`${unit.data.profileIds.reduce((n,id)=>n+records.get(id).data.composition.quantity.min,0)}x ${unit.data.title} (100 pts)\n${rows(unit)}`;
const native=book.entities.filter(e=>e.kind==='DATASHEET');assert.equal(native.length,54);
for(const unit of native) {
  const state=ready(header+block(unit));
  assert.equal(state.units[0].canonicalUnitId,unit.id);
  assert.deepEqual(state.units[0].modelRows.map(r=>r.canonicalProfileId),unit.data.profileIds);
  assert(state.units[0].modelRows.every(r=>r.selections.length===0));
  for(const id of unit.data.weaponIds) {
    const weapon=records.get(id),state=ready(header+block(unit).replace('(100 pts)',`(100 pts): 1x ${weapon.data.name}`));
    assert(selections(state.units[0]).some(s=>s.canonicalProfileIds.includes(id)),id);
    assert.equal(state.units[0].selections[0].physicalQuantity,1);
    assert(state.units[0].modelRows.every(r=>r.selections.length===0),'Aggregate weapon selection must not invent individual ownership');
  }
}

// New Recruit text fixtures use current canonical composition/selection names;
// points here are imported lexical values, not factual/MFM assertions.
const text=JSON.parse(fs.readFileSync(new URL('./roster-import-fixtures.json',import.meta.url),'utf8')).fixtures[0].text;
const service=make(),state=ready(text,service),[lordA,lordB,legionA,legionB,commune,accursed,princeA,princeB]=state.units;
assert.equal(new Set(state.units.map(u=>u.instanceId)).size,8);
assert.deepEqual(state.detachmentIds,['detachment-veterans-of-the-long-war','detachment-pactbound-zealots']);
assert(state.units.every(u=>!Object.hasOwn(u,'detachmentId')));
assert.deepEqual(state.units.map(u=>u.warlord),[true,false,false,false,false,false,false,false]);
assert.deepEqual(lordA.enhancementIds,['detachment-veterans-of-the-long-war:enhancement:1']);
assert.deepEqual(lordB.enhancementIds,['detachment-veterans-of-the-long-war:enhancement:2']);
assert.deepEqual([legionA.startingStrength,legionB.startingStrength],[5,10]);
assert.equal(legionA.modelRows[1].loadouts.length,2);
assert.deepEqual(legionA.modelRows[1].loadouts.map(l=>l.quantity),[3,1]);
assert.equal(legionA.selectedMarkId,'detachment-pactbound-zealots:rule:mark:3');
assert.equal(legionB.selectedMarkId,undefined);
assert.equal(legionA.selections.find(s=>s.canonicalEquipmentIds.length).canonicalEquipmentIds[0],'datasheet-legionaries:wargear:3');
assert(!selections(legionB).some(s=>s.canonicalEquipmentIds.length));
assert.deepEqual(commune.modelRows.map(r=>[r.canonicalProfileId,r.quantity]),[
  ['datasheet-dark-commune:section:2:member:1',1],['datasheet-dark-commune:section:2:member:2',1],
  ['datasheet-dark-commune:section:2:member:3',1],['datasheet-dark-commune:section:2:member:4',2]]);
assert.equal(commune.modelRows[2].selections.find(s=>s.canonicalEquipmentIds.length).canonicalEquipmentIds[0],'datasheet-dark-commune:section:2');
assert.deepEqual(accursed.modelRows.map(r=>records.get(r.canonicalProfileId).data.composition.modelProfileSourceId),
  ['datasheet-accursed-cultists:profile:2','datasheet-accursed-cultists:profile:1']);
assert.deepEqual(princeA.selectedUpgradeIds,['datasheet-heretic-astartes-daemon-prince:section:3:option:1']);
assert.deepEqual(princeB.selectedUpgradeIds,['datasheet-heretic-astartes-daemon-prince:section:3:option:3']);
assert.equal(princeA.selectedMarkId,undefined);assert.equal(princeB.selectedMarkId,undefined);
assert(!selections(lordA).some(s=>s.canonicalProfileIds.includes('datasheet-chaos-lord:weapon:4')));
assert.equal(ready(text.replace('+ WARLORD: Char1: Chaos Lord\n','')).warlordInstanceId,null);

const metadata=buildImportBindings(book);
for(const item of metadata.equipmentSelections) {
  const unit=records.get(item.ownerId),state=ready(header+block(unit).replace('(100 pts)',`(100 pts): 1x ${item.label}`));
  assert.deepEqual(state.units[0].selections[0].canonicalEquipmentIds,item.canonicalEquipmentIds);
  assert.deepEqual(state.units[0].selections[0].canonicalFieldPaths,item.canonicalFieldPaths);
}
for(const item of metadata.optionSelections.filter(item=>item.label.includes(':'))) {
  const unit=records.get(item.ownerId||'unit-legionaries'),state=ready(header+block(unit).replace('(100 pts)',`(100 pts): ${item.label}`));
  const selected=state.units[0][item.selectionField];
  assert(item.selectionField==='selectedMarkId'?selected===item.canonicalOptionId:selected.includes(item.canonicalOptionId));
}
for(const item of metadata.weaponSelections) {
  const unit=records.get(item.ownerId),state=ready(header+block(unit).replace('(100 pts)',`(100 pts): 1x ${item.label}`));
  assert.deepEqual(state.units[0].selections[0].canonicalProfileIds,item.canonicalProfileIds);
}
for(const item of metadata.deferredUnits) {
  const result=make().import(header+`5x ${item.label} (100 pts)`);
  assert.equal(result.status,'NEEDS_BINDINGS');assert.equal(result.roster,null);
  assert(result.needsBindings.some(n=>n.rawLabel===item.label&&n.reason==='DEFERRED_CROSS_REGISTRY_DEPENDENCY'));
}
assert.equal(make().import(header+'1x Heretic Astartes Daemon Prince (100 pts): Khorne').status,'NEEDS_BINDINGS','Bare ambiguous god name must fail closed');
const explicit=make().import(header+'1x Heretic Astartes Daemon Prince (100 pts): Khorne',
  {selections:{'parsed-unit-1/unit/selection/1':{canonicalOptionId:'datasheet-heretic-astartes-daemon-prince:section:3:option:1'}}});
assert.equal(explicit.status,'READY');assert.equal(explicit.roster.units[0].selectedMarkId,undefined);
assert.deepEqual(explicit.roster.units[0].selectedUpgradeIds,['datasheet-heretic-astartes-daemon-prince:section:3:option:1']);
assert.equal(make().import(header+'1x Heretic Astartes Daemon Prince (100 pts): Daemonic Allegiance: Khorne, Daemonic Allegiance: Nurgle').status,'INVALID','Exclusive Allegiance must not contain two choices');
const optionOnly=ready(header+'1x Chaos Lord (100 pts)\nMark: Nurgle').units[0];
assert.equal(optionOnly.equipmentContextKnown,false);assert.equal(optionOnly.selectedUpgradeIds,undefined);
assert.equal(make().import('+ DETACHMENT: Veterans of the Long War\n1x Chaos Lord (100 pts): Mark: Nurgle').status,'NEEDS_BINDINGS','Unselected option context cannot bind');
assert.equal(make().import(header+'5x Dark Commune (100 pts)').status,'NEEDS_BINDINGS','Absent mixed composition cannot be invented');
assert.equal(make().import(header+'5x Legionaries (100 pts): Boltgun\n• 1x Aspiring Champion\n• 4x Legionary').status,'NEEDS_BINDINGS','Aggregate quantity cannot be invented');
assert.equal(make().import(header+'1x Chaos Lord (100 pts): Unknown gun').status,'NEEDS_BINDINGS');
assert.equal(make().import('+ DETACHMENT: Veterans of the Long War\n1x Chaos Lord (100 pts)\nEnhancement: Eye of Tzeentch').status,'NEEDS_BINDINGS');

assert.deepEqual(state.attachments,[]);
for(const method of ['attach','detach','effective','projection','related','guide'])assert.equal(service[method],undefined);
const saved=service.snapshot();saved.units[0].enhancementIds=[];assert.deepEqual(service.state,state);
const restored=make();restored.load(JSON.parse(JSON.stringify(state)));assert.deepEqual(restored.state,state);
assert.deepEqual(ready(text),state);
const removed=ready(text.replace('1x Chaos icon, Mark: Nurgle','Mark: Nurgle'));
assert(!selections(removed.units[2]).some(s=>s.canonicalEquipmentIds.length));
assert.deepEqual(removed.units.filter((u,i)=>i!==2),state.units.filter((u,i)=>i!==2));
assert.deepEqual(ready(text),state);
const poisoned=structuredClone(state);poisoned.units[2].selectedMarkId='datasheet-heretic-astartes-daemon-prince:section:3:option:1';
assert.throws(()=>make().load(poisoned),/option/);
const orphan=structuredClone(state);orphan.units[2].selections=orphan.units[2].selections.filter(s=>!s.canonicalOptionIds);
orphan.units[2].selectedMarkId='does-not-exist';assert.throws(()=>make().load(orphan),/option/);
const foreignChoice=structuredClone(state);foreignChoice.units[2].selectedUpgradeIds=['datasheet-heretic-astartes-daemon-prince:section:3:option:1'];
assert.throws(()=>make().load(foreignChoice),/option/);
const mutated=structuredClone(book);mutated.entities.find(e=>e.id==='datasheet-dark-commune:section:2:member:2').data.name='wrong model';
assert.equal(createCSMRosterImport(mutated).import(text).status,'NEEDS_BINDINGS','Canonical profile identity mutation must be detected');
const browserEntry=await loadRosterImport({fetch:async()=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(new URL('./generated/roster-import.json',import.meta.url),'utf8'))})});
assert.deepEqual(ready(text,browserEntry),state);
assert.deepEqual(book,original);
console.log(JSON.stringify({status:'PASS',nativeDatasheets:54,canonicalWeapons:315,mixedProfiles:'PASS',duplicateInstances:'PASS',selectedOptions:'PASS',enhancementOwners:'PASS',explicitWarlordOnly:'PASS',deferredAllies:4,canonicalMutation:'REJECTED',importOnly:true}));
