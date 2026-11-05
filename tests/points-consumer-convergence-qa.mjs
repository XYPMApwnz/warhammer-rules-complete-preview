/** Expected prices come from accepted captures through explicit reviewed bridges.
 * Native V2 is the consumer. The retired V1 catalog and HTML are not oracles. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {verifyFrozenSource} from '../books/shared/tools/source-ingestion-contract.mjs';
import {createEffectiveMfmCatalog} from '../mfm/content/effective-mfm-catalog.mjs';
import {createEffectiveMfmArmyProjection} from '../books/shared/tools/effective-mfm-army-projection.mjs';
import {sourceSnapshot} from '../books/shared/source-refs-v2/source-refs.mjs';
import {parseSourceFixtureJSON} from './helpers/source-refs-fixtures.mjs';

const json=file=>parseSourceFixtureJSON(fs.readFileSync(file,'utf8'));
const at=(value,pointer)=>pointer.slice(1).split('/').reduce((item,key)=>item?.[key],value);
const sorted=values=>[...values].sort();
const central=createEffectiveMfmCatalog();
const registry=json('mfm/content/mfm-v1.6-scoped.identity-registry.json');
const captures=new Map(),bridges=new Map();
for(const bookId of ['space-marines','blood-angels','dark-angels','tau-empire','tyranids']){
  const source=registry.factionBindings.find(row=>row.factionId===bookId);
  assert.ok(source,`${bookId}: accepted v1.6 identity registry`);
  const bytes=fs.readFileSync(source.sourceCapturePath);
  verifyFrozenSource(source.sourceId);
  assert.equal(JSON.parse(bytes).captureSha256,source.sourceCaptureSha256,
    `${bookId}: accepted MFM capture provenance changed`);
  captures.set(bookId,JSON.parse(bytes));
  bridges.set(bookId,json(`books/${bookId}/v2/mfm-bindings.json`));
}

function rawUnit(bookId,binding){
  const capture=captures.get(bookId);
  if(binding.proof?.mfm){
    assert.equal(binding.proof.mfm.sourcePath,`mfm/sources/v1.6/${bookId}.json`);
    const unit=at(capture,binding.proof.mfm.jsonPointer);
    assert.ok(unit?.pointSchedules,`${binding.entityId}: reviewed source pointer`);
    return unit;
  }
  // Exact keys belong to an accepted source occurrence, not a title inference.
  const locator=binding.sourceLocator;
  const matches=capture.units.filter(unit=>unit.title===locator.sourceTitle&&
    unit.sourceGroup===locator.sourceGroup&&unit.status===locator.status);
  assert.equal(matches.length,1,`${binding.entityId}: unique reviewed source occurrence`);
  return matches[0];
}

const tierFields=['value','minModels','maxModels','minCopies','maxCopies','sourceLabel'];
const fields=(row,keys=tierFields)=>Object.fromEntries(keys.filter(key=>row[key]!==undefined).map(key=>[key,row[key]]));
const expectedSchedule=raw=>raw.pointSchedules.flatMap(schedule=>schedule.entries.map(entry=>({
  ...entry,minCopies:schedule.minCopies,maxCopies:schedule.maxCopies
})));
function assertSchedule(current,binding,bookId,keys=tierFields){
  const raw=rawUnit(bookId,binding),fact=central.getUnitPointRecord(binding.mfmRecordId);
  assert.equal(fact?.factionId,bookId,`${binding.entityId}: central price owner`);
  assert.deepEqual(fact.pointSchedules,raw.pointSchedules,`${binding.entityId}: central schedules differ from accepted capture`);
  assert.equal(current.id,binding.entityId,`${binding.entityId}: canonical price identity`);
  assert.equal(current.mfmRecordId,fact.id,`${binding.entityId}: central price reference`);
  assert.equal(current.pointsSource.version,'v1.6');
  assert.deepEqual(current.points.map(row=>fields(row,keys)),expectedSchedule(raw).map(row=>fields(row,keys)),
    `${binding.entityId}: native consumer must retain the accepted schedule`);
  assert.ok(current.points.every(row=>typeof row.label==='string'&&row.label.length),`${binding.entityId}: missing visible tier label`);
}

let inheritedSchedules=0;
for(const bookId of ['blood-angels','dark-angels']){
  const book=json(`books/${bookId}/v2/generated/roster-import.json`);
  const membership=json(`books/${bookId}/v2/inherited-sm-references.json`);
  const admitted=new Set(membership.references.map(row=>row.canonicalId));
  const expected=[...bridges.get(bookId).unitBindings,
    ...bridges.get('space-marines').unitBindings.filter(row=>admitted.has(row.entityId))];
  const records=new Map(book.entities.map(row=>[row.id,row])),consumed=book.mfmImportReferences;
  assert.equal(consumed.owner,'CENTRALIZED_MFM');
  assert.deepEqual(sorted(consumed.nativePoints.units.map(row=>row.id)),sorted(expected.map(row=>row.entityId)),
    `${bookId}: native pricing must cover exactly the admitted own and inherited units`);
  assert.deepEqual(sorted(consumed.partitions.unitBindings.map(row=>row.mfmRecordId)),sorted(expected.map(row=>row.mfmRecordId)),
    `${bookId}: native runtime price bindings changed`);
  for(const binding of expected){
    const unit=records.get(binding.entityId),current=consumed.nativePoints.units.find(row=>row.id===binding.entityId);
    const owner=admitted.has(binding.entityId)?'space-marines':bookId;
    assert.equal(unit?.kind,'DATASHEET');
    assert.equal(unit.bookId,owner,`${bookId}: inherited factual ownership changed`);
    assert.equal(current?.sourceOwner,owner,`${bookId}: inherited pricing ownership changed`);
    assertSchedule(current,binding,owner);
    if(owner==='space-marines')inheritedSchedules++;
  }
}
assert.ok(inheritedSchedules>0,'No inherited native schedules were checked');

// Preserve the secondary observation as a conflict, without a BA price override.
const stormlanceId='detachment-sm-53f689af321a4813';
const stormlanceBinding=bridges.get('space-marines').detachmentBindings.find(row=>row.entityId===stormlanceId);
assert.ok(stormlanceBinding,'Explicit native Stormlance identity');
const rawStormlance=at(captures.get('space-marines'),stormlanceBinding.proof.mfm.jsonPointer);
assert.equal(rawStormlance.detachmentPoints,1,'Accepted official Stormlance remains 1DP');
const ba=json('books/blood-angels/v2/generated/roster-import.json');
const stormlance=ba.mfmImportReferences.nativePoints.detachments.find(row=>row.id===stormlanceId);
assert.equal(stormlance?.mfmRecordId,stormlanceBinding.mfmRecordId);
assert.equal(stormlance.sourceOwner,'space-marines');
assert.equal(stormlance.detachmentPoints,rawStormlance.detachmentPoints,'Native BA must consume official SM-owned Stormlance DP');
const issue=json('books/blood-angels/v2/source-issues.json').issues.find(row=>row.id==='BA-SRC-STORMLANCE-DP');
assert.equal(issue?.status,'SOURCE_CONFLICT');
assert.equal(issue.applied,false,'Secondary Stormlance price must remain unapplied');
const app=json('books/blood-angels/v2/generated/app-presentation.json');
assert.equal(app.cards.find(row=>row.id===stormlanceId)?.identity.registryId,'space-marines');
const pointField=app.bookPresentation.records[stormlanceId]?.detachmentPoints;
assert.equal(pointField?.source.entityId,stormlanceBinding.mfmRecordId);
assert.equal(pointField.source.path,'/detachmentPoints');
assert.equal(pointField.value,rawStormlance.detachmentPoints,'Native BA presentation must retain official Stormlance DP');

let paidOptions=0;
for(const bookId of ['tau-empire','tyranids']){
  const book=json(`books/${bookId}/v2/generated/roster-import.json`),bindings=bridges.get(bookId);
  const runtime=book.mfmImportReferences,records=new Map(book.entities.map(row=>[row.id,row]));
  const projection=createEffectiveMfmArmyProjection(bookId).pointsForArmyBook(bookId);
  assert.equal(runtime.owner,'CENTRALIZED_MFM');
  assert.equal(runtime.sourceVersion,'v1.6');
  assert.deepEqual(sorted(runtime.partitions.unitBindings.map(row=>row.mfmRecordId)),
    sorted(bindings.unitBindings.map(row=>row.mfmRecordId)),`${bookId}: missing/extra native schedule reference`);
  for(const binding of bindings.unitBindings){
    assert.equal(records.get(binding.entityId)?.kind,'DATASHEET');
    const current=projection.units.find(row=>row.id===binding.entityId);
    assert.ok(current,`${binding.entityId}: missing native central schedule`);
    // Tyranids' existing Army composition overlays can widen MODEL bounds. The
    // central record above still preserves every literal RAW bound exactly.
    assertSchedule(current,binding,bookId,['value','minCopies','maxCopies','sourceLabel']);
    const ordered=rows=>[...rows].sort((left,right)=>left.name<right.name?-1:left.name>right.name?1:0);
    const raw=rawUnit(bookId,binding);
    const expectedPaid=(raw.paidOptions||[]).map(option=>({
      // The retained display convention drops only the literal quantity prefix.
      name:option.title.replace(/^1\s+/,''),value:option.value,modifiers:[]
    }));
    assert.deepEqual(ordered(current.paidWargear),ordered(expectedPaid),
      binding.entityId+': exact accepted paid-wargear names and prices');
  }
  assert.ok(bindings.paidOptionBindings.length,`${bookId}: paid-option source inventory`);
  assert.deepEqual(sorted(runtime.partitions.paidOptionBindings.map(row=>row.mfmRecordId)),
    sorted(bindings.paidOptionBindings.map(row=>row.mfmRecordId)),`${bookId}: missing/extra native paid-option reference`);
  for(const binding of bindings.paidOptionBindings){
    const ownerBinding=bindings.unitBindings.find(row=>row.entityId===binding.ownerEntityId);
    assert.ok(ownerBinding,`${binding.entityId}: explicit paid-option UNIT owner`);
    const raw=rawUnit(bookId,ownerBinding);
    const options=(raw.paidOptions||[]).filter(row=>row.sourceLabel===binding.sourceLocator.sourceLabel&&
      row.sourceGroup===binding.sourceLocator.sourceGroup);
    assert.equal(options.length,1,`${binding.entityId}: unique accepted paid-option source occurrence`);
    const fact=central.getById(binding.mfmRecordId);
    assert.equal(fact?.recordType,'MFM_PAID_UPGRADE');
    assert.equal(fact.factionId,bookId);
    assert.equal(fact.unitReferenceId,ownerBinding.unitReferenceId,'Paid option moved to another UNIT');
    assert.equal(fact.value,options[0].value,`${binding.entityId}: native paid-option value changed`);
    const reference=runtime.partitions.paidOptionBindings.find(row=>row.mfmRecordId===binding.mfmRecordId);
    assert.equal(reference.entityId,binding.entityId,'Native paid-option recipient changed');
    assert.deepEqual(sourceSnapshot(reference).sourceLocator,binding.sourceLocator,'Native paid-option source changed');
    for(const id of binding.relatedEntityIds||[binding.entityId]){
      assert.equal(records.get(id)?.parentId,binding.ownerEntityId,'Paid option escaped its physical source owner');
    }
    paidOptions++;
  }
}
const starscythe=bridges.get('tau-empire').unitBindings.find(row=>row.entityId==='unit-crisis-starscythe-battlesuits');
assert.ok(starscythe,'Explicit Starscythe source binding');
assert.deepEqual(expectedSchedule(rawUnit('tau-empire',starscythe)).map(row=>row.value),[100,110],
  'Accepted Starscythe schedule remains 100/110; physical composition resolution stays separate');

const producer=fs.readFileSync('books/shared/points/build.mjs','utf8');
const projectionProducer=fs.readFileSync('books/shared/points/effective-catalog.mjs','utf8');
const dgAdapter=fs.readFileSync('books/death-guard/tools/canonical-source-adapter.mjs','utf8');
const amAdapter=fs.readFileSync('books/adeptus-mechanicus/tools/canonical-source-adapter.mjs','utf8');
assert.match(producer,/createPointsCatalog/,'Retained points catalog must consume the effective projection');
assert.match(projectionProducer,/buildSharedCanonicalBook\(context,\{projectionOnly:true\}\)/,'Retained points producer must use the shared effective-model build');
assert.match(dgAdapter,/buildDeathGuardCanonicalModel/,'Death Guard points must follow its configured canonical model');
assert.match(amAdapter,/createAdeptusMechanicusCanonicalModel/,'Adeptus Mechanicus points must follow its configured canonical model');
assert.match(amAdapter,/createEffectiveMfmArmyProjection\(config\.id\)/,'Adeptus Mechanicus facts must follow the centralized effective MFM owner');
assert.doesNotMatch(amAdapter,/readJson\(sourcePaths\.officialMfm\)/,'Per-book MFM snapshots must not become factual authority');
assert.doesNotMatch(`${producer}\n${projectionProducer}`,/scripts[\\/]roster-data\.js|scripts[\\/]target-data\.js|reader\.html|mobile[\\/](?:generated|scripts)[\\/]/i,
  'Points generation must not read generated consumer artifacts');

console.log(JSON.stringify({status:'PASS',test:'native-points-consumer-convergence',inheritedSchedules,paidOptions}));
