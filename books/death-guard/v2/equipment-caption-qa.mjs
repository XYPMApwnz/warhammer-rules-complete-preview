import assert from 'node:assert/strict';
import './aggregate-equipment-import-qa.mjs';
import fs from 'node:fs';
import {createDGRosterRuntime} from './roster-boot.mjs';
import {buildImportBindings} from './roster-import-bindings.mjs';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {parse} from '../../shared/roster-v2/parser.mjs';
import * as evaluator from './rule-contract-schema.mjs';
import {parseSourceHtml,sourceNodeText} from './raw-source.mjs';
import {equipmentCaptionRoster as text,equipmentCaptionCases as cases,withoutEquipmentCaptions as strip} from './equipment-caption-fixtures.mjs';

const book=JSON.parse(fs.readFileSync(new URL('./generated/rule-contract-effective.json',import.meta.url),'utf8'));
const original=structuredClone(book),records=new Map(book.entities.map(entity=>[entity.id,entity]));
const make=()=>createDGRosterRuntime(book),runtime=make(),baseline=createRosterRuntime(book,{parse,...evaluator});
for(const service of [runtime,baseline])assert.equal(service.import(text).status,'READY');
const equipment=unit=>[...unit.selections,...unit.modelRows.flatMap(row=>[...row.selections,...row.loadouts.flatMap(loadout=>loadout.selections)])]
  .filter(selection=>selection.canonicalEquipmentIds.length);
for(const c of cases){
  const raw=fs.readFileSync(new URL('./sources/accepted-waha-pages/'+c.file,import.meta.url),'utf8');
  const source=sourceNodeText(raw,parseSourceHtml(raw)).replace(/\s+/g,' ');
  assert.ok(source.includes(c.instruction),'Accepted raw source instruction: '+c.file);
  const id=`datasheet-${c.slug}:wargear:${c.option}`,entity=records.get(id);
  assert.equal(entity.data.text.replace(/\s+/g,' ').trim(),c.instruction);
  const unit=runtime.state.units[c.unit-1],row=unit.modelRows[c.row-1];
  const selected=equipment({...unit,selections:[],modelRows:[row]}).filter(selection=>selection.canonicalEquipmentIds.includes(id));
  assert.equal(selected.length,1);assert.equal(selected[0].physicalQuantity,1);
  const references=selected[0].sourceReferences,caption=references.filter(reference=>reference.caption);
  assert.equal(caption.length,1);assert.equal(caption[0].bookId,book.bookId);
  assert.equal(caption[0].entityId,id);assert.equal(caption[0].path,'/text');
  assert.equal(entity.data.text.slice(caption[0].caption.start,caption[0].caption.end),c.label);
  assert.deepEqual(references.filter(reference=>!reference.caption),equipment(baseline.state.units[c.unit-1])
    .find(selection=>selection.canonicalEquipmentIds.includes(id)).sourceReferences);
}
for(const n of [2,4,6,8,9,10])assert.equal(equipment(runtime.state.units[n-1]).length,0);
function compare(){
  assert.deepEqual(strip(runtime.snapshot()),baseline.snapshot(),'Only caption metadata changes imported state');
  assert.deepEqual(strip(runtime.projection),baseline.projection,'No effect/projection delta');
  for(const unit of runtime.state.units){
    assert.deepEqual(strip(runtime.effective(unit.instanceId)),baseline.effective(unit.instanceId));
    assert.deepEqual(runtime.related(unit.instanceId),baseline.related(unit.instanceId));
  }
}
compare();
for(const [leader,bodyguard] of [['parsed-unit-9','parsed-unit-1'],['parsed-unit-10','parsed-unit-3']]){
  for(const action of ['attach','detach','reattach']){
    for(const service of [runtime,baseline])service[action](leader,bodyguard);
    compare();
    assert.equal(equipment(runtime.state.units.find(unit=>unit.instanceId===leader)).length,0);
  }
}
const restored=make();restored.load(runtime.snapshot());assert.deepEqual(restored.projection,runtime.projection);
let rejected=0;
for(const mutate of [ref=>{ref.bookId='chaos-space-marines';},ref=>{ref.entityId='datasheet-plague-marines:wargear:8';},
  ref=>{ref.entityId='datasheet-deathshroud-terminators:wargear:1';},ref=>{ref.path='/blocks/2/text';},
  ref=>{ref.caption.start=-1;},ref=>{delete ref.caption;}]){
  const poisoned=runtime.snapshot(),ref=equipment(poisoned.units[0])[0].sourceReferences.find(reference=>reference.caption);
  mutate(ref);assert.throws(()=>make().load(poisoned),/equipment (caption|source) reference/);rejected++;
}
const drift=structuredClone(book);drift.entities.find(entity=>entity.id==='datasheet-plague-marines:wargear:8').data.text='Unrelated item';
assert.throws(()=>buildImportBindings(drift),/canonical DG equipment caption/);
assert.deepEqual(book,original,'Canonical facts, provenance, ability headings and effects unchanged');
console.log(JSON.stringify({status:'PASS',captions:'6/6',selectedUnselected:'PASS',physicalOwnership:'PASS',instanceIsolation:'PASS',
  attachDetachReattach:'PASS',semanticBaselineEquality:'PASS',foreignReferenceControls:rejected,reload:'PASS',canonicalImmutable:true}));
