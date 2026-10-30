import {parseSourceFixtureJSON} from '../../../tests/helpers/source-refs-fixtures.mjs';
import {sourceSnapshot} from '../../shared/source-refs-v2/source-refs.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createAdMechRosterImport,loadRosterImport} from './roster-import.mjs';
import {selections} from '../../shared/roster-v2/context.mjs';

const read=name=>parseSourceFixtureJSON(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const book=read('./generated/effective.json'),metadata=read('./roster-import-aliases.json');
const fixtures=read('./roster-import-fixtures.json').fixtures,original=structuredClone(book);
const records=new Map(book.entities.map(entity=>[entity.id,entity]));
const make=()=>createAdMechRosterImport(book,metadata);
const ready=(text,service=make())=>{const result=service.import(text);assert.equal(result.status,'READY',JSON.stringify(result));assert.equal(result.needsBindings.length,0);return result;};
const signature=selection=>JSON.stringify([selection.canonicalProfileIds,selection.canonicalEquipmentIds,selection.canonicalFieldPaths]);
const totals=items=>{
  const map=new Map();
  for (const item of items) {const key=signature(item);map.set(key,(map.get(key)||0)+item.physicalQuantity);}
  return [...map].sort(([a],[b])=>a.localeCompare(b));
};
let positive=0,negative=0,entries=0;
for (const fixture of fixtures) {
  for (const evidence of fixture.sourceEvidence) {
    const entity=records.get(evidence.entityId);assert(entity,fixture.id);
    assert.deepEqual(sourceSnapshot(entity),sourceSnapshot(evidence),fixture.id);
    const sourceText=fs.readFileSync(new URL('../../../'+sourceSnapshot(evidence).sourcePath,import.meta.url),'utf8');
    if (!sourceSnapshot(evidence).sourcePath.endsWith('.json')) {assert(sourceText.length>0);continue;}
    const source=JSON.parse(sourceText);
    let value=source;
    for (const part of sourceSnapshot(evidence).pointer.slice(1).split('/').map(part=>part.replaceAll('~1','/').replaceAll('~0','~'))) value=value?.[part];
    assert.notEqual(value,undefined,'Severed accepted source '+fixture.id);
  }
  const service=make(),result=service.import(fixture.text),expected=fixture.expected;
  if (expected.mustFailClosed) {
    assert.notEqual(result.status,'READY',fixture.id);assert.equal(result.roster,null);assert.equal(service.state,null);
    for (const label of expected.unresolvedLabels) assert(result.needsBindings.some(item=>item.rawLabel===label),fixture.id);
    negative++;continue;
  }
  assert.equal(result.status,'READY',fixture.id+JSON.stringify(result));assert.equal(result.needsBindings.length,0);
  const state=service.state;
  assert.deepEqual(state.detachmentIds,expected.selectedDetachmentIds,fixture.id);
  assert.equal(state.units.length,expected.units.length);
  assert.equal(new Set(state.units.map(unit=>unit.instanceId)).size,state.units.length);
  assert.deepEqual(state.attachments,[]);
  assert.equal(service.projection,undefined);assert.equal(service.effective,undefined);assert.equal(service.attach,undefined);
  assert.equal(result.draft.sourceText,fixture.text);
  for (const [i,want] of expected.units.entries()) {
    const unit=state.units[i];
    assert.equal(unit.canonicalUnitId,want.canonicalId);assert.equal(unit.raw.quantity,want.modelCount);
    assert.equal(unit.startingStrength,want.startingStrength);assert.equal(unit.warlord,want.isWarlord);
    assert.deepEqual(unit.enhancementIds,want.enhancementIds);
    if (want.composition) assert.deepEqual(unit.modelRows.map(row=>({label:row.presentationLabel,quantity:row.quantity,canonicalProfileId:row.canonicalProfileId})),want.composition);
    if (want.profileQuantities) {
      const quantities={};for (const row of unit.modelRows) quantities[row.canonicalProfileId]=(quantities[row.canonicalProfileId]||0)+row.quantity;
      assert.deepEqual(quantities,want.profileQuantities);
    }
    const gear=selections(unit),expectedGear=[...(want.weapons||[]),...(want.optionalWargear||[])].map(item=>({canonicalProfileIds:item.canonicalProfileIds||[],
      canonicalEquipmentIds:item.canonicalEquipmentIds||[],canonicalFieldPaths:item.canonicalFieldPaths||{},physicalQuantity:item.quantity}));
    assert.deepEqual(totals(gear),totals(expectedGear),fixture.id+' gear ownership/count');
    for (const item of want.optionalWargear||[]) assert(records.get(item.sourceOptionId).data.text.toLowerCase().includes(item.label.toLowerCase()));
    for (const row of unit.modelRows) {
      assert.equal(records.get(row.canonicalProfileId).parentId,unit.canonicalUnitId);
      assert.equal(row.modelInstanceId,undefined);
      for (const selected of [...row.selections,...row.loadouts.flatMap(loadout=>loadout.selections)]) {
        assert(selected.selectionKey.startsWith(row.rowId+'/'));assert(selected.quantityEvidence.scope!=='UNIT');
      }
    }
    for (const selected of gear) {
      assert(selected.selectionKey.startsWith(unit.instanceId+'/'));
      for (const id of [...selected.canonicalProfileIds,...selected.canonicalEquipmentIds]) assert.equal(records.get(id).parentId,unit.canonicalUnitId);
    }
    entries++;
  }
  const backup=JSON.parse(JSON.stringify(service.snapshot())),restored=make();restored.load(backup);
  assert.deepEqual(restored.state,state);assert.deepEqual(ready(fixture.text).roster,state);
  backup.units[0].startingStrength=999;assert.deepEqual(service.state,state);assert.deepEqual(restored.state,state);
  const leaked=service.state;leaked.units[0].modelRows[0].quantity=77;leaked.units[0].enhancementIds.push('poison');
  assert.deepEqual(service.state,state);
  assert.notEqual(service.import('+ DETACHMENT: Missing\n1x Missing (5 pts)').status,'READY');assert.deepEqual(service.state,state);
  positive++;
}

// Independently enumerate exact boundary names from canonical owners, not a
// legacy ID catalog. Counts are not army-legality decisions by this importer.
const header='+ DETACHMENT: Rad-Zone Corps\n';
let canonicalNames=0;
for (const unit of book.entities.filter(entity=>entity.kind==='DATASHEET')) {
  const detailed=unit.data.profileIds.length>1?'\n• 1x Servitor Underseer\n• 2x Gun Servitor\n• 6x Combat Servitor':'';
  const result=ready(header+`${detailed?9:1}x ${unit.data.title} (50 pts)${detailed}`);
  assert.equal(result.roster.units[0].canonicalUnitId,unit.id);canonicalNames++;
  for (const weaponId of unit.data.weaponIds) {
    const weapon=records.get(weaponId),result=ready(header+`${detailed?9:1}x ${unit.data.title} (50 pts): 2x ${weapon.data.name}${detailed}`);
    const group=metadata.weaponSelections.find(binding=>binding.ownerId===unit.id&&binding.label===weapon.data.name);
    assert.deepEqual(result.roster.units[0].selections[0].canonicalProfileIds,group?.canonicalProfileIds||[weaponId]);assert.equal(result.roster.units[0].selections[0].physicalQuantity,2);canonicalNames++;
  }
}
for (const detachment of book.entities.filter(entity=>entity.kind==='DETACHMENT')) {
  assert.deepEqual(ready(`+ DETACHMENT: ${detachment.data.title}\n1x Tech-Priest Dominus (50 pts)`).roster.detachmentIds,[detachment.id]);canonicalNames++;
}
for (const enhancement of book.entities.filter(entity=>entity.kind==='ENHANCEMENT')) {
  const result=ready(`+ DETACHMENT: ${records.get(enhancement.parentId).data.title}\nChar1: 1x Tech-Priest Dominus (50 pts)\nEnhancement: ${enhancement.data.title}`);
  assert.deepEqual(result.roster.units[0].enhancementIds,[enhancement.id]);canonicalNames++;
}
const mustFail=text=>{const result=make().import(text);assert.notEqual(result.status,'READY',text);assert.equal(result.roster,null);negative++;return result;};
assert(mustFail(header+'10x Skitarii Rangers (100 pts)\n• 1x Skitarii Ranger Alpha\n• 8x Skitarii Ranger').errors.some(error=>error.code==='CONTRADICTORY_COMPOSITION'));
mustFail(header+'9x Servitor Battleclade (100 pts)');
mustFail(header+'10x Skitarii Rangers (100 pts): Galvanic rifle');
mustFail('+ DETACHMENT: Rad-Zone Corps\n1x Tech-Priest Dominus (50 pts)\nEnhancement: Cognitive Reinforcement');
mustFail(header+'+ WARLORD: Char9: Tech-Priest Dominus\nChar1: 1x Tech-Priest Dominus (50 pts)');
// Supported one-unit header convention retains the detailed model composition.
assert.equal(ready(header+'1x Skitarii Rangers (100 pts)\n• 1x Skitarii Ranger Alpha\n• 9x Skitarii Ranger').roster.units[0].startingStrength,10);
// The canonical Enhancement weapon must NOT enter selected inventory merely
// because the Enhancement is imported. This task has no effect projection.
const weaponOwner=ready('+ DETACHMENT: Lords of the Forge\nChar1: 1x Tech-Priest Dominus (50 pts): Macrostubber\nEnhancement: TL-4Ø9');
assert.equal(selections(weaponOwner.roster.units[0]).length,1);
assert.deepEqual(selections(weaponOwner.roster.units[0])[0].canonicalProfileIds,['datasheet-tech-priest-dominus:weapon:3']);
const aliases=metadata.aliases[0],evidence=records.get(aliases.evidence.entityId).data.blocks[0].text;
assert(evidence.includes('2 Gun Servitors')&&evidence.includes('6 Combat Servitors'));
const gauntlets=ready(header+'5x Corpuscarii Electro-priests (60 pts): 5x Electrostatic gauntlets').roster.units[0].selections[0];
assert.deepEqual(gauntlets.canonicalProfileIds,['datasheet-corpuscarii-electro-priests:weapon:1','datasheet-corpuscarii-electro-priests:weapon:2']);
assert.equal(gauntlets.physicalQuantity,5);
assert(records.get('datasheet-corpuscarii-electro-priests:section:2').data.blocks[0].text.includes('Every model is equipped with: electrostatic gauntlets.'));
assert.deepEqual(gauntlets.canonicalProfileIds.map(id=>records.get(id).data.mode),['ranged','melee']);
assert.throws(()=>createAdMechRosterImport(book,{...metadata,aliases:[{...aliases,canonicalId:'missing'}]}),/alias target/);
assert.throws(()=>createAdMechRosterImport(book,{...metadata,aliases:[{...aliases,evidence:{...aliases.evidence,path:'/missing'}}]}),/import evidence/);
const loads=[];const loaded=await loadRosterImport({fetch:async url=>{loads.push(url.pathname);return {ok:true,json:async()=>read(url.pathname.endsWith('effective.json')?'./generated/effective.json':'./roster-import-aliases.json')};}});
assert.equal(loads.length,2);assert.equal(loaded.import(fixtures[0].text).status,'READY');
assert.deepEqual(book,original);
assert.equal(fs.existsSync(new URL('./app.html',import.meta.url)),false,'Retired per-book compatibility entry must not be recreated');
console.log(JSON.stringify({status:'PASS',sourceFixtures:fixtures.length,positive,negative,physicalEntries:entries,canonicalNameControls:canonicalNames,
  mixedProfiles:'PASS',selectionOwnership:'PASS',explicitWarlordOnly:'PASS',roundtrip:'PASS',noEffectProjection:'PASS',canonicalFactsImmutable:'PASS'}));
