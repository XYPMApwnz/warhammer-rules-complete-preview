import assert from 'node:assert/strict';
import fs from 'node:fs';
import {assertNoMfmValues,consumeMfm,mfmOwnedFields,resolveOwnedFact} from './mfm-boundary.mjs';
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const bindings=read('./mfm-bindings.json'),effective=read('./generated/effective.json');
const entities=effective.entities,{catalog}=createEffectiveMfmCatalog({asOf:'2026-10-14'});
const beforeEntities=JSON.stringify(entities),beforeCatalog=JSON.stringify(catalog);
const actual=consumeMfm(entities),bookId='emperors-children';
const partitions={unitBindings:'unitPointRecords',detachmentBindings:'detachments',enhancementBindings:'enhancementCosts',paidUpgradeBindings:'paidUpgradeRecords',leaderEligibilityBindings:'leaderEligibilityRecords',qualifierBindings:'qualifierRecords'};
const expectedCounts={unitBindings:23,detachmentBindings:10,enhancementBindings:34,paidUpgradeBindings:2,leaderEligibilityBindings:4,qualifierBindings:1};
let referenceCount=0;
for(const [part,centralPart] of Object.entries(partitions)){
  const owned=catalog[centralPart].filter(item=>item.factionId===bookId);
  assert.equal(actual[part].length,expectedCounts[part]);
  assert.deepEqual(new Set(actual[part].map(item=>item.mfmRecordId)),new Set(owned.map(item=>item.id)),part+' exact central coverage');
  for(const item of actual[part]){
    const record=resolveOwnedFact(item.mfmRecordId);
    assert.equal(record.factionId,bookId);
    assert.equal(record.recordType,item.recordType);
    assert.equal(record.provenance.sourceVersion,'v1.6');
    assert.deepEqual(item.provenance,record.provenance);
    assert.ok(Object.isFrozen(record));
    assert.equal(resolveOwnedFact(item.mfmRecordId),record,'read-only owner access preserves object identity');
    for(const field of ['value','pointSchedules','detachmentPoints','forceDispositionIds','missionForceDispositionIds','qualifierIds','targetUnitReferenceIds'])assert.ok(!Object.hasOwn(item,field),'No central fact copy: '+field);
    referenceCount++;
  }
}
assert.equal(actual.leaderEligibilityBindings.reduce((n,item)=>n+item.targetUnitIds.length,0),8);
assert.equal(catalog.supportEligibilityRecords.filter(item=>item.factionId===bookId).length,0);
assertNoMfmValues(entities);
assert.deepEqual(consumeMfm(entities),actual,'deterministic references');
const renamed=structuredClone(entities);
for(const item of renamed){if(item.data?.title)item.data.title='Renamed';if(item.data?.name)item.data.name='Renamed';}
assert.deepEqual(consumeMfm(renamed),actual,'display labels never join source identities');

// All MFM-owned values remain available through their immutable central owner.
for(const item of actual.unitBindings)assert.ok(resolveOwnedFact(item.mfmRecordId).pointSchedules.length);
for(const item of [...actual.paidUpgradeBindings,...actual.enhancementBindings])assert.equal(typeof resolveOwnedFact(item.mfmRecordId).value,'number');
for(const item of actual.detachmentBindings){const owner=resolveOwnedFact(item.mfmRecordId);assert.equal(typeof owner.detachmentPoints,'number');assert.ok(owner.forceDispositionIds.length);}
for(const item of actual.leaderEligibilityBindings)assert.ok(resolveOwnedFact(item.mfmRecordId).targetUnitReferenceIds.length);
assert.deepEqual(resolveOwnedFact(actual.qualifierBindings[0].mfmRecordId).values,['FLAWLESS BLADES']);
const frozen=resolveOwnedFact(actual.enhancementBindings[0].mfmRecordId);
assert.throws(()=>{frozen.value=999;},TypeError,'central owner is immutable');

let mutations=0;
const negativeEntities=(label,mutate)=>{const changed=structuredClone(entities);mutate(changed);assert.throws(()=>consumeMfm(changed),/EC V2 MFM boundary:/,label);mutations++;};
const negativeBindings=(label,mutate)=>{const changed=structuredClone(bindings);mutate(changed);assert.throws(()=>consumeMfm(entities,{bindings:changed}),/EC V2 MFM boundary:/,label);mutations++;};
negativeEntities('duplicate canonical entity',items=>items.push(structuredClone(items[0])));
negativeEntities('missing canonical unit',items=>items.splice(items.findIndex(item=>item.kind==='DATASHEET'),1));
negativeEntities('unknown canonical unit',items=>{items.find(item=>item.kind==='DATASHEET').id='unit-unknown';});
negativeEntities('wrong unit kind',items=>{items.find(item=>item.kind==='DATASHEET').kind='DETACHMENT';});
negativeEntities('wrong Enhancement owner',items=>{items.find(item=>item.kind==='ENHANCEMENT').parentId='detachment-carnival-of-excess';});
negativeEntities('wrong paid weapon owner',items=>{items.find(item=>item.id==='datasheet-defiler:weapon:6').parentId='unit-chaos-rhino';});
negativeEntities('wrong paid option owner',items=>{items.find(item=>item.id==='datasheet-defiler:wargear:3').parentId='unit-chaos-rhino';});
negativeEntities('paid weapon omitted from unit selection',items=>{const unit=items.find(item=>item.id==='unit-defiler');unit.data.weaponIds=unit.data.weaponIds.filter(id=>id!=='datasheet-defiler:weapon:6');});
negativeEntities('paid option omitted from unit selection',items=>{const unit=items.find(item=>item.id==='unit-defiler');unit.data.wargearOptionIds=unit.data.wargearOptionIds.filter(id=>id!=='datasheet-defiler:wargear:3');});
negativeEntities('missing Leader evidence',items=>items.splice(items.findIndex(item=>item.id==='datasheet-lord-exultant:section:3'),1));
negativeEntities('wrong Leader evidence owner',items=>{items.find(item=>item.id==='datasheet-lord-exultant:section:3').parentId='unit-sorcerer';});
negativeEntities('Leader evidence omitted from unit sections',items=>{const unit=items.find(item=>item.id==='unit-lord-exultant');unit.data.sectionIds=unit.data.sectionIds.filter(id=>id!=='datasheet-lord-exultant:section:3');});
for(const field of mfmOwnedFields)negativeEntities('numeric copy '+field,items=>{items[0].data.nested={copy:{[field]:999}};});
negativeBindings('wrong faction',value=>{value.unitBindings[0].expectedFaction='death-guard';});
negativeBindings('wrong declared type',value=>{value.unitBindings[0].recordType='MFM_DETACHMENT';});
negativeBindings('foreign central owner',value=>{value.unitBindings[0].mfmRecordId=catalog.unitPointRecords.find(item=>item.factionId!==bookId).id;});
negativeBindings('wrong central type',value=>{value.unitBindings[0].mfmRecordId=value.detachmentBindings[0].mfmRecordId;});
negativeBindings('wrong unit scope',value=>{value.unitBindings[0].scopeOwnerId='death-guard';});
negativeBindings('wrong source address',value=>{value.unitBindings[0].sourceEntityId='datasheet-sorcerer';});
negativeBindings('wrong central unit reference',value=>{value.unitBindings[0].mfmUnitReferenceId=value.unitBindings[1].mfmUnitReferenceId;});
negativeBindings('wrong central locator',value=>{value.unitBindings[0].sourceLocator.sourceTitle='POISON';});
negativeBindings('stale v1.5 owner',value=>{value.unitBindings[0].sourceId='emperors-children-mfm-v1.5';});
negativeBindings('stale cutoff',value=>{value.currentnessCutoff='2026-09-30';});
negativeBindings('wrong Enhancement scope',value=>{value.enhancementBindings[0].scopeOwnerId='detachment-carnival-of-excess';});
negativeBindings('wrong Enhancement central parent',value=>{value.enhancementBindings[0].mfmDetachmentRecordId=value.detachmentBindings[1].mfmRecordId;});
negativeBindings('wrong Enhancement Army identity',value=>{value.enhancementBindings[0].armyEnhancementId=value.enhancementBindings[1].armyEnhancementId;});
negativeBindings('wrong paid selection',value=>{value.paidUpgradeBindings[0].weaponProfileSourceIds=['datasheet-defiler:weapon:7'];});
negativeBindings('wrong same-unit paid option',value=>{value.paidUpgradeBindings[0].optionSourceIds=['datasheet-defiler:wargear:1'];});
negativeBindings('wrong Leader target',value=>{value.leaderEligibilityBindings[0].targetUnitIds=['unit-chaos-rhino'];});
negativeBindings('duplicate Leader target',value=>{value.leaderEligibilityBindings[0].targetUnitIds.push(value.leaderEligibilityBindings[0].targetUnitIds[0]);});
negativeBindings('wrong qualifier central owner',value=>{value.qualifierBindings[0].mfmOwnerRecordId=value.enhancementBindings[0].mfmRecordId;});
negativeBindings('wrong qualifier Army owner',value=>{value.qualifierBindings[0].armyOwnerId='enhancement-wrong';});
negativeBindings('wrong qualifier scope',value=>{value.qualifierBindings[0].scopeOwnerId='detachment-carnival-of-excess';});
for(const part of Object.keys(partitions)){
  negativeBindings('missing '+part,value=>value[part].pop());
  negativeBindings('duplicate '+part,value=>value[part].push(structuredClone(value[part][0])));
}
assert.throws(()=>resolveOwnedFact('unknown'),/unknown\/non-EC owned fact/);
assert.throws(()=>resolveOwnedFact(catalog.enhancementCosts.find(item=>item.factionId!==bookId).id),/unknown\/non-EC owned fact/);
assert.throws(()=>resolveOwnedFact(catalog.unitReferences.find(item=>item.factionId===bookId).id),/unknown\/non-EC owned fact/);
assert.equal(JSON.stringify(entities),beforeEntities,'canonical entities unchanged');
assert.equal(JSON.stringify(catalog),beforeCatalog,'central catalog unchanged');
assert.deepEqual(createEffectiveMfmCatalog({asOf:'2026-10-14'}).catalog,catalog,'fresh central owner unchanged');
console.log(`EC V2 MFM boundary PASS: ${referenceCount} references, 23 units / 10 detachments / 34 enhancements / 2 paid / 4 Leader records (8 edges) / 1 qualifier; ${mutations} rejected mutations; central facts remain immutable`);
