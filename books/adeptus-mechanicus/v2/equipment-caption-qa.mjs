import assert from 'node:assert/strict';
import fs from 'node:fs';
import {readJson} from './rule-contract-build.mjs';
import {createAdMechRosterRuntime} from './roster-runtime.mjs';
import {createAdMechRosterImport,withEquipmentCaptionBindings} from './roster-import.mjs';
import {createAdMechRosterAttachments} from './roster-attachments.mjs';
import {createRosterImportService} from '../../shared/roster-v2/import-service.mjs';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';
import {parse} from '../../shared/roster-v2/parser.mjs';
import {selections,validateRoster} from '../../shared/roster-v2/context.mjs';

const book=readJson('generated/roster-runtime.json'),before=structuredClone(book),metadata=readJson('roster-import-aliases.json');
const id='datasheet-skitarii-rangers:section:1',optionId='datasheet-skitarii-rangers:wargear:6',path='/blocks/2/text';
const records=new Map(book.entities.map(e=>[e.id,e]));
const source=fs.readFileSync(new URL('../sources/waha-11e-current-2026-09-25/Skitarii-Rangers.html',import.meta.url),'utf8')
  .replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
assert.match(source,/1 omnispex/);
assert.match(source,/That model.s galvanic rifle cannot be replaced/);
const binding=withEquipmentCaptionBindings(book).rosterEquipmentCaptionBindings[0],ref=binding.sourceReferences[0];
assert.equal(records.get(optionId).data.text.slice(ref.caption.start,ref.caption.end),'omnispex');
assert.equal(records.get(optionId).parentId,'unit-skitarii-rangers');
assert.equal(records.get(id).data.blocks[2].text,'Omnispex: Ranged weapons equipped by models in the bearer’s unit have the [IGNORES COVER] ability.');
const header='+ FACTION KEYWORD: Imperium - Adeptus Mechanicus\n+ DETACHMENT: Haloscreed Battle Clade\n';
const character='Char1: 1x Tech-Priest Dominus (60 pts): Macrostubber, Volkite blaster, Omnissian axe\nEnhancement: Cognitive Reinforcement (+30 pts)';
const rangers='10x Skitarii Rangers (85 pts): 10x Galvanic rifle, 10x Close combat weapon';
const text=header+character+'\n'+rangers+', 1x Omnispex\n'+rangers;
const make=()=>createAdMechRosterRuntime(book,metadata),runtime=make();
assert.equal(runtime.import(text).status,'READY');
const initial=runtime.snapshot(),owner=initial.units[1],gear=selections(owner).find(s=>s.canonicalEquipmentIds.includes(id));
assert.deepEqual(gear.canonicalEquipmentIds,[id]);assert.deepEqual(gear.canonicalFieldPaths,{[id]:[path]});
assert.equal(gear.physicalQuantity,1);assert.equal(gear.perModelQuantity,null);
assert.deepEqual(gear.sourceReferences,[{entityId:id,path},ref]);
assert.equal(owner.modelRows.flatMap(r=>r.selections).filter(s=>s.canonicalEquipmentIds.length).length,0,'No invented MODEL assignment');
for(const unit of [initial.units[0],initial.units[2]])assert.equal(selections(unit).filter(s=>s.canonicalEquipmentIds.length).length,0);

// Compare full state, effective projection and related rules with the previous
// importer. Only optional caption references may differ, including attachments.
const strip=value=>Array.isArray(value)?value.map(strip):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).flatMap(([key,item])=>{
  if(key==='sourceReferences'){const kept=item.filter(r=>!r.caption);return kept.length?[[key,strip(kept)]]:[];}
  return [[key,strip(item)]];
})):value;
const oldImport=createRosterImportService(book,{identityAliases:metadata.aliases,weaponSelections:metadata.weaponSelections});
assert.equal(oldImport.import(text).status,'READY');
const baseline=createRosterRuntime(book,{parse,...createRuleContractSchema(book.rosterSchema)});baseline.load(oldImport.snapshot());
function compare(){
  assert.deepEqual(strip(runtime.snapshot()),baseline.snapshot());assert.deepEqual(strip(runtime.projection),baseline.projection);
  for(const unit of runtime.state.units){assert.deepEqual(strip(runtime.effective(unit.instanceId)),baseline.effective(unit.instanceId));
    assert.deepEqual(runtime.related(unit.instanceId),baseline.related(unit.instanceId));}
}
compare();
for(const action of ['attach','detach','reattach']){
  for(const service of [runtime,baseline])service[action]('parsed-unit-1','parsed-unit-2');compare();
  assert.equal(selections(runtime.state.units[0]).filter(s=>s.canonicalEquipmentIds.length).length,0);
}
const restored=make();restored.load(runtime.snapshot());assert.deepEqual(restored.projection,runtime.projection);
const reversed=runtime.snapshot();reversed.units.reverse();restored.load(reversed);
assert.deepEqual(restored.effective('parsed-unit-2'),runtime.effective('parsed-unit-2'));
const absent=structuredClone(initial);absent.units[1].selections=absent.units[1].selections.filter(s=>!s.canonicalEquipmentIds.includes(id));
runtime.load(absent);
assert(!runtime.effective('parsed-unit-2').weapons.some(w=>w.fields.some(f=>f.label==='abilities'&&f.value.includes('IGNORES COVER'))));
runtime.load(initial);
assert(runtime.effective('parsed-unit-2').weapons.some(w=>w.fields.some(f=>f.label==='abilities'&&f.value.includes('IGNORES COVER'))));
const importer=createAdMechRosterImport(book,metadata);assert.equal(importer.import(text).status,'READY');importer.load(initial);
const attachments=createAdMechRosterAttachments(readJson('generated/effective.json'),metadata,readJson('roster-attachment-bindings.json'));
assert.equal(attachments.import(text).status,'READY');attachments.attach('parsed-unit-2','parsed-unit-1');attachments.detach('parsed-unit-1');
attachments.load(initial);

// A detailed import retains the actual Ranger row as equipment owner.
const detailed=createAdMechRosterImport(book,metadata);
assert.equal(detailed.import(header+'10x Skitarii Rangers (85 pts)\n• 1x Skitarii Ranger Alpha: Galvanic rifle, Close combat weapon\n• 1x Skitarii Ranger: Galvanic rifle, Close combat weapon, Omnispex\n• 8x Skitarii Rangers: 8 with Galvanic rifle, Close combat weapon').status,'READY');
assert.equal(detailed.state.units[0].modelRows[1].selections.filter(s=>s.canonicalEquipmentIds.includes(id)).length,1);
assert.equal(detailed.state.units[0].selections.filter(s=>s.canonicalEquipmentIds.length).length,0);

let rejected=0;
for(const mutate of [
  (s,g,r)=>{r.bookId='death-guard';},
  (s,g,r)=>{r.entityId='datasheet-skitarii-vanguard:wargear:6';},
  (s,g,r)=>{r.entityId='datasheet-skitarii-rangers:wargear:7';},
  (s,g,r)=>{r.path='/order';},
  (s,g,r)=>{r.caption.start++;},
  (s,g,r)=>{r.caption.end++;},
  (s,g,r)=>{r.caption.start=-1;},
  (s,g,r)=>{g.canonicalFieldPaths[id]=['/blocks/1/text'];},
  (s,g,r)=>{g.canonicalFieldPaths[id].push('/blocks/1/text');},
  (s,g,r)=>{g.canonicalEquipmentIds=['datasheet-skitarii-rangers:section:2'];g.canonicalFieldPaths={[g.canonicalEquipmentIds[0]]:['/blocks/0/text']};},
  (s,g,r)=>{g.canonicalProfileIds=['datasheet-skitarii-rangers:weapon:3'];},
  (s,g,r)=>{g.sourceReferences.push(structuredClone(r));},
  (s,g,r)=>{delete r.caption;}
]){
  const state=structuredClone(initial),selected=selections(state.units[1]).find(s=>s.canonicalEquipmentIds.includes(id));
  mutate(state,selected,selected.sourceReferences.find(r=>r.caption));
  assert.throws(()=>make().load(state),/equipment (caption|source|field) reference|equipment field/,'Rejected mutation '+rejected);rejected++;
}
// Same-owner arbitrary references and snapshot-supplied declarations cannot
// bypass the trusted, exact selected-block binding.
const forged=structuredClone(initial);forged.rosterEquipmentCaptionBindings=[binding];
assert.throws(()=>validateRoster(book,forged,book.rosterAttachmentPolicies),/Foreign equipment caption reference/);rejected++;
for(const entityId of [id,optionId]){
  const damaged=structuredClone(book);delete damaged.entities.find(e=>e.id===entityId).provenance.sourceId;
  assert.throws(()=>withEquipmentCaptionBindings(damaged),/canonical omnispex caption owner/);rejected++;
}
// Independent input quantities and canonical source addresses for both items.
// Equipment stays UNIT-owned when New Recruit does not identify its MODEL.
let captionCases=0;
for(const [slug,title,weapon] of [
  ['skitarii-rangers','Skitarii Rangers','Galvanic rifle'],
  ['skitarii-vanguard','Skitarii Vanguard','Radium carbine']
]) for(const [label,index] of [['Omnispex',2],['Enhanced data-tether',1]]) {
  const sourceId=`datasheet-${slug}:section:1`,sourcePath=`/blocks/${index}/text`;
  const option=`datasheet-${slug}:wargear:6`,caption=label.toLowerCase();
  const raw=fs.readFileSync(new URL(`../sources/waha-11e-current-2026-09-25/${title.replaceAll(' ','-')}.html`,import.meta.url),'utf8')
    .replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
  assert.ok(raw.toLowerCase().includes(caption),'Accepted raw equipment heading');
  const text=header+`10x ${title} (85 pts): 10x ${weapon}, 10x Close combat weapon, 1x ${label}\n`+
    `10x ${title} (85 pts): 10x ${weapon}, 10x Close combat weapon`;
  const service=make();assert.equal(service.import(text).status,'READY');
  const unit=service.state.units[0],selection=unit.selections.find(s=>s.canonicalFieldPaths[sourceId]?.includes(sourcePath));
  function verifyCaption(value) {
    assert.equal(value.physicalQuantity,1);
    assert.equal(value.perModelQuantity,null);
    const ref=value.sourceReferences.find(ref=>ref.caption);
    assert.ok(ref,'Equipment lost its named caption');
    assert.equal(ref.entityId,option);assert.equal(ref.path,'/text');
    assert.equal(records.get(option).data.text.slice(ref.caption.start,ref.caption.end),caption);
  }
  verifyCaption(selection);
  const missing=structuredClone(selection);missing.sourceReferences=missing.sourceReferences.filter(ref=>!ref.caption);
  assert.throws(()=>verifyCaption(missing),/named caption/);rejected++;
  const wrong=structuredClone(selection);wrong.sourceReferences.find(ref=>ref.caption).caption.start++;
  assert.throws(()=>verifyCaption(wrong),assert.AssertionError);rejected++;
  assert.ok(unit.modelRows.every(row=>row.selections.length===0),'No fictional equipment MODEL');
  assert.equal(selections(service.state.units[1]).filter(s=>s.canonicalEquipmentIds.length).length,0);
  const first=service.snapshot();service.load(first);assert.deepEqual(service.snapshot(),first);
  const legacy=structuredClone(first);
  for(const selected of selections(legacy.units[0]))if(selected.sourceReferences)
    selected.sourceReferences=selected.sourceReferences.filter(ref=>!ref.caption);
  const preserved=structuredClone(legacy),restored=make();restored.load(legacy);
  verifyCaption(restored.state.units[0].selections.find(s=>s.canonicalFieldPaths[sourceId]?.includes(sourcePath)));
  assert.deepEqual(legacy,preserved,'Loading a saved roster must not mutate its input');
  assert.equal(service.import(text).status,'READY');assert.deepEqual(service.snapshot(),first);
  captionCases++;
}
assert.equal(captionCases,4);
assert.deepEqual(book,before,'No canonical identity, rule, effect, source or provenance changes');
console.log(JSON.stringify({status:'PASS',exactCaption:'omnispex',selectedUnselected:true,unitAndModelOwnership:true,
  instanceIsolation:true,attachDetachReattach:true,reload:true,standaloneAttachmentAPI:true,
  semanticBaselineEquality:true,captionCases,rejectedReferences:rejected,canonicalImmutable:true}));
