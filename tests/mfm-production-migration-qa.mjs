import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createPointsCatalog} from '../roster-guides/effective-points-catalog.mjs';
import {createEffectiveMfmArmyProjection} from '../books/shared/tools/effective-mfm-army-projection.mjs';
import {createEffectiveMfmCatalog} from '../mfm/content/effective-mfm-catalog.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const bookIds=['death-guard','adeptus-mechanicus','tyranids','tau-empire','emperors-children','chaos-space-marines'];
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const config=id=>JSON.parse(read(`books/${id}/book.config.json`));
const comparablePoints=records=>(records||[]).map(({label,value})=>({label:String(label).replace(/\s*(?::|·)\s*/g,' | ').replace(/\s+to\s+/gi,'–').replace(/\s*\+\s*/g,'+'),value}));
const comparableWargear=records=>(records||[]).map(({name,label,value,sourceLabel})=>({label:String(name||sourceLabel||label).replace(/^per\s+/i,''),value})).sort((left,right)=>left.label.localeCompare(right.label));
const byId=records=>new Map(records.map(record=>[record.id,record]));
const edgeKey=edge=>`${edge.role}\0${edge.sourceId}\0${edge.targetId}`;

const {projections}=await createPointsCatalog(root);
for(const bookId of bookIds){
  const effective=projections.get(bookId),mfm=createEffectiveMfmArmyProjection(bookId),owners=[bookId,...(config(bookId).dependencies||[])];
  const centralUnits=byId(owners.flatMap(owner=>mfm.pointsForArmyBook(owner).units));
  const centralDetachments=byId(owners.flatMap(owner=>mfm.pointsForArmyBook(owner).detachments));
  const centralEnhancements=new Map(owners.flatMap(owner=>mfm.pointsForArmyBook(owner).enhancements).map(record=>[`${record.canonicalDetachmentId}\0${record.canonicalEnhancementId}`,record]));
  assert.equal(effective.units.length,centralUnits.size,`${bookId}: bound unit inventory diverges from centralized MFM`);
  for(const unit of effective.units){
    const current=centralUnits.get(unit.id);
    assert(current,`${bookId}: ${unit.id} has no centralized MFM binding`);
    assert.deepEqual(comparablePoints(unit.points),comparablePoints(current.points),`${bookId}: ${unit.id} points/model schedule diverges`);
    assert.deepEqual(comparableWargear(unit.paidWargear),comparableWargear(current.paidWargear),`${bookId}: ${unit.id} paid upgrades diverge`);
  }
  assert.equal(effective.detachments.length,centralDetachments.size,`${bookId}: Detachment inventory diverges from centralized MFM`);
  for(const detachment of effective.detachments){
    const current=centralDetachments.get(detachment.id);
    assert(current,`${bookId}: ${detachment.id} has no centralized MFM binding`);
    assert.equal(detachment.detachmentPoints,current.detachmentPoints,`${bookId}: ${detachment.id} DP diverges`);
    assert.deepEqual(detachment.forceDispositions,current.forceDispositions,`${bookId}: ${detachment.id} Force Disposition membership diverges`);
    assert.deepEqual(detachment.missionForceDispositionIds,current.missionForceDispositionIds,`${bookId}: ${detachment.id} Mission bindings diverge`);
    assert.deepEqual(detachment.mfmQualifiers||[],current.mfmQualifiers||[],`${bookId}: ${detachment.id} qualifiers diverge`);
  }
  assert.equal(effective.enhancements.length,centralEnhancements.size,`${bookId}: Enhancement inventory diverges from centralized MFM`);
  for(const enhancement of effective.enhancements){
    const current=centralEnhancements.get(`${enhancement.detachmentId}\0${enhancement.id}`);
    assert(current,`${bookId}: ${enhancement.detachmentId}/${enhancement.id} has no centralized MFM binding`);
    assert.equal(enhancement.value,current.value,`${bookId}: ${enhancement.id} cost diverges`);
    assert.deepEqual(enhancement.mfmQualifiers||[],current.mfmQualifiers||[],`${bookId}: ${enhancement.id} qualifiers diverge`);
  }
}

const expectedDgOverlays=new Set([
  'support\0unit-biologus-putrifier\0unit-plague-marines','support\0unit-foul-blightspawn\0unit-plague-marines',
  'support\0unit-icon-bearer\0unit-plague-marines','support\0unit-noxious-blightbringer\0unit-plague-marines',
  'support\0unit-noxious-blightbringer\0unit-poxwalkers','support\0unit-plague-surgeon\0unit-plague-marines',
  'support\0unit-tallyman\0unit-plague-marines'
]);
const expectedAmOverlays=new Set([
  'leader\0unit-tech-priest-enginseer\0unit-hastarii-exterminators',
  'leader\0unit-tech-priest-enginseer\0unit-hastarii-fusiliers',
  'leader\0unit-tech-priest-enginseer\0unit-servitor-battleclade'
]);
for(const [bookId,expected] of [['death-guard',expectedDgOverlays],['adeptus-mechanicus',expectedAmOverlays]]){
  const effective=projections.get(bookId),unitIds=effective.units.map(unit=>unit.id),armyEdges=effective.units.flatMap(unit=>[
    ...(unit.ruleProfile?.relations?.canLead||[]).map(target=>({role:'leader',sourceId:unit.id,targetId:target.unitId})),
    ...(unit.ruleProfile?.relations?.canSupport||[]).map(target=>({role:'support',sourceId:unit.id,targetId:target.unitId}))
  ]),resolved=createEffectiveMfmArmyProjection(bookId).relationEdges({effectiveUnitIds:unitIds,armyEdges}),overlays=new Set(resolved.filter(edge=>edge.overlaySource==='ARMY_EFFECTIVE_MODEL').map(edgeKey));
  assert.deepEqual(overlays,expected,`${bookId}: Army-domain relation overlays changed`);
}

const tauReferenceOnly=createEffectiveMfmArmyProjection('tau-empire').referenceOnlyUnitRecords;
assert.deepEqual(tauReferenceOnly,[],'all current T’au Imperial Armour MFM records must bind to canonical units');

const tyranids=byId(createEffectiveMfmArmyProjection('tyranids').pointsForArmyBook('tyranids').units);
for(const [id,min,max] of [['unit-hormagaunts',11,20],['unit-termagants',11,20],['unit-von-ryans-leapers',4,6]]){
  const tiers=tyranids.get(id)?.points||[];
  assert(tiers.some(tier=>tier.minModels===min&&tier.maxModels===max),`Tyranids: ${id} Army schedule overlay is absent`);
}

const ecUpgrades=[
  ['enhancement-eager-patrons','Eager Patrons'],
  ['enhancement-frenzied-ferocity','Frenzied Ferocity'],
  ['enhancement-beguiling-grotesquerie','Beguiling Grotesquerie']
];
const ecEnhancements=projections.get('emperors-children').enhancements;
for(const [id,armyTitle] of ecUpgrades){
  const matches=ecEnhancements.filter(item=>item.id===id);
  assert.equal(matches.length,1,`Emperor's Children: ${id} must remain one canonical Enhancement identity`);
  assert(matches[0].aliases.includes(armyTitle),`Emperor's Children: ${armyTitle} Army-source compatibility alias is absent`);
  assert(matches[0].aliases.includes(`${armyTitle} (Upgrade)`),`Emperor's Children: ${armyTitle} MFM title is absent`);
}
assert.equal(new Set(ecUpgrades.map(([id])=>id)).size,ecUpgrades.length,"Emperor's Children: Upgrade aliases created a duplicate canonical identity");

const amSandbox={window:{}};
amSandbox.window.window=amSandbox.window;
for(const file of ['roster-guides/points-data.js','books/adeptus-mechanicus/scripts/roster-data.js','books/adeptus-mechanicus/scripts/roster-enhancements.js'])vm.runInNewContext(read(file),amSandbox,{filename:file});
const amEnhancements=amSandbox.window.AMRosterEnhancements;
const currentAmEnhancement=(id,detachmentId,name)=>amEnhancements.enriched({enhancements:[{id,ruleId:id,canonicalEnhancementId:id,detachmentId,canonicalDetachmentId:detachmentId,name,ownerStatus:'resolved'}]})[0];
assert.equal(currentAmEnhancement('enhancement-necromechanic','detachment-cohort-cybernetica','Renamed display').value,20,'Adeptus Mechanicus: Necromechanic current points did not resolve by canonical ID');
assert.equal(currentAmEnhancement('enhancement-artisan','detachment-explorator-maniple','Arbitrary display').value,10,'Adeptus Mechanicus: representative current Enhancement points did not resolve by canonical ID');
const unknownAm=currentAmEnhancement('enhancement-unknown','detachment-cohort-cybernetica','Necromechanic');
assert.equal(unknownAm.id,'enhancement-unknown','Adeptus Mechanicus: an unknown Enhancement ID was replaced by a title match');
assert.equal(unknownAm.value,undefined,'Adeptus Mechanicus: an unknown Enhancement ID acquired current points');

const producerSources=['books/shared/tools/build-army-book.mjs','books/death-guard/tools/canonical-source-adapter.mjs','books/adeptus-mechanicus/tools/canonical-source-adapter.mjs'].map(read);
assert(producerSources.every(source=>source.includes('effective-mfm-army-projection.mjs')),'all Army producers must use the shared centralized MFM projection');
assert(!producerSources.some(source=>/official-mfm-v1\.3|readJson\(config\.sources\.points/.test(source)),'a migrated Army producer still reads a v1.3/per-book MFM fact source');

console.log('MFM production migration QA passed: 6 scoped v1.5 books, DG 7 overlays, AM 3 overlays, 0 T’au reference-only records.');
