import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createEffectiveMfmArmyProjection} from '../books/shared/tools/effective-mfm-army-projection.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const generatedInputPattern=/[\\/](?:scripts[\\/](?:roster-data|target-data)\.js|reader\.html|mobile[\\/](?:generated|scripts)[\\/])/i;
const originalReadFileSync=fs.readFileSync;
const generatedReads=[];
fs.readFileSync=function guardedRead(file,...args){
  const resolved=path.resolve(String(file));
  if(generatedInputPattern.test(resolved)){
    generatedReads.push(resolved);
    throw new Error(`points projection attempted to read generated input: ${resolved}`);
  }
  return originalReadFileSync.call(this,file,...args);
};

let pointsApi,projectionApi,first,second;
try{
  pointsApi=await import('../roster-guides/effective-points-catalog.mjs');
  projectionApi=await import('../books/shared/tools/effective-points-projection.mjs');
  first=await pointsApi.createPointsCatalog(root);
  second=await pointsApi.createPointsCatalog(root);
}finally{
  fs.readFileSync=originalReadFileSync;
}

const catalogKeys={'death-guard':'death guard','adeptus-mechanicus':'adeptus mechanicus','tyranids':'tyranids','tau-empire':'t au empire','emperors-children':'emperor s children','chaos-space-marines':'chaos space marines','space-marines':'space marines','blood-angels':'blood angels','dark-angels':'dark angels'};
const sorted=values=>[...values].sort();
const scopedEnhancementId=item=>`${item.detachmentId}\0${item.id}`;
const clone=value=>structuredClone(value);
const projectionMapClone=source=>new Map([...source].map(([id,projection])=>[id,clone(projection)]));
const values=(projection,unitId)=>projection.units.find(unit=>unit.id===unitId)?.points.map(tier=>tier.value);

function readPublishedCatalog(){
  const source=originalReadFileSync(path.join(root,'roster-guides','points-data.js'),'utf8'),context={};
  context.window=context;
  vm.runInNewContext(source,context);
  return {source,catalog:JSON.parse(JSON.stringify(context.WH_POINTS_CATALOG))};
}

function assertProjectionCatalogIdentity(projections,catalog){
  for(const [bookId,projection] of projections){
    const published=catalog[catalogKeys[bookId]];
    assert(published,`${bookId}: points publication missing`);
    assert.deepEqual(sorted(projection.units.map(unit=>unit.id)),sorted(Object.values(published.units).map(unit=>unit.id)),`${bookId}: unit identity set differs`);
    assert.deepEqual(sorted(projection.detachments.map(item=>item.title.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim())),sorted(Object.keys(published.detachments)),`${bookId}: Detachment identity set differs`);
  }
}

function assertTauMfmPublicationCoverage(projections,catalog){
  const source=createEffectiveMfmArmyProjection('tau-empire').pointsForArmyBook('tau-empire').units;
  const effective=projections.get('tau-empire').units,published=Object.values(catalog['t au empire'].units),byId=items=>new Map(items.map(item=>[item.id,item]));
  assert.equal(source.length,43,"T'au centralized MFM source unit count");
  assert.equal(effective.length,43,"T'au effective MFM projection unit count");
  assert.equal(published.length,43,"T'au Roster points publication unit count");
  const sourceById=byId(source),effectiveById=byId(effective),publishedById=byId(published);
  assert.deepEqual(sorted(sourceById.keys()),sorted(effectiveById.keys()),"T'au effective projection omits an eligible MFM unit");
  assert.deepEqual(sorted(sourceById.keys()),sorted(publishedById.keys()),"T'au points publication omits an eligible MFM unit");
  for(const [id,record] of sourceById){
    assert.equal(JSON.stringify(effectiveById.get(id)?.points),JSON.stringify(record.points),`${id}: effective schedule differs from centralized MFM`);
    assert.equal(JSON.stringify(publishedById.get(id)?.points),JSON.stringify(record.points),`${id}: published schedule differs from centralized MFM`);
  }
}

function assertInheritedEnhancementCoverage(child,parent){
  const inheritedDetachmentIds=new Set(child.detachments.filter(item=>item.sourceBookId===parent.book.id).map(item=>item.id));
  const expected=parent.enhancements.filter(item=>inheritedDetachmentIds.has(item.detachmentId)).map(scopedEnhancementId);
  const actual=child.enhancements.filter(item=>item.sourceBookId===parent.book.id).map(scopedEnhancementId);
  assert.deepEqual(sorted(actual),sorted(expected),`${child.book.id}: inherited Enhancement coverage differs`);
}

function assertSupplementControls(projections){
  const sm=projections.get('space-marines'),ba=projections.get('blood-angels'),da=projections.get('dark-angels');
  assert.equal(sm.units.length,103);
  assert.equal(ba.units.filter(item=>item.sourceBookId==='blood-angels').length,15);
  assert.equal(ba.units.filter(item=>item.sourceBookId==='space-marines').length,84);
  assert.equal(da.units.filter(item=>item.sourceBookId==='dark-angels').length,16);
  assert.equal(da.units.filter(item=>item.sourceBookId==='space-marines').length,84);
  assert.equal(ba.units.some(item=>item.id==='unit-roboute-guilliman'),false);
  assert.equal(da.units.some(item=>item.id==='unit-roboute-guilliman'),false);
  assert.equal(ba.units.find(item=>item.id==='unit-sanguinary-guard')?.sourceBookId,'blood-angels');
  const sanguinaryTear=ba.enhancements.find(item=>item.id==='enhancement-sanguinary-tear-aura');
  assert.equal(sanguinaryTear?.value,35,'Blood Angels Sanguinary Tear must retain its exact scoped 35-point identity');
  assert.ok(sanguinaryTear?.canonicalEffectRecordIds.includes('sanguinary-tear-aura'),'Blood Angels Sanguinary Tear must retain its source compatibility identity');
  assert.equal(da.units.find(item=>item.id==='unit-deathwing-knights')?.sourceBookId,'dark-angels');
  assert.equal(ba.detachments.find(item=>item.id==='gladius-task-force')?.sourceBookId,'space-marines');
  assert.equal(da.detachments.find(item=>item.id==='gladius-task-force')?.sourceBookId,'space-marines');
  assert.deepEqual(values(sm,'unit-centurion-devastator-squad'),[175,365]);
  assert.deepEqual(values(ba,'unit-centurion-devastator-squad'),[175,350]);
  assert.deepEqual(values(da,'unit-centurion-devastator-squad'),[175,350]);
  assert.deepEqual(values(sm,'unit-assault-intercessor-squad'),[75,150]);
  assert.deepEqual(values(ba,'unit-assault-intercessor-squad'),[80,150]);
  assert.deepEqual(values(sm,'unit-repulsor-executioner'),[255,275]);
  assert.deepEqual(values(ba,'unit-repulsor-executioner'),[230,250]);
  assert.deepEqual(values(da,'unit-repulsor-executioner'),[230,250]);
  assertInheritedEnhancementCoverage(ba,sm);
  assertInheritedEnhancementCoverage(da,sm);
}

function assertEmperorsChildrenUpgradeIdentities(projections,catalog){
  const projection=projections.get('emperors-children'),published=catalog['emperor s children'];
  for(const [id,title] of [
    ['enhancement-frenzied-ferocity','frenzied ferocity'],
    ['enhancement-beguiling-grotesquerie','beguiling grotesquerie'],
    ['enhancement-eager-patrons','eager patrons'],
  ]){
    const canonical=projection.enhancements.find(item=>item.id===id);
    assert.ok(canonical,`emperors-children: missing canonical Upgrade ${id}`);
    assert.equal(canonical.assignment?.maxOwners,3,`emperors-children: ${id} repeatable assignment`);
    assert.ok(canonical.tags.includes('UPGRADE'),`emperors-children: ${id} Upgrade tag`);
    assert.equal(published.enhancements[title]?.canonicalEnhancementId,id,`emperors-children: ${id} canonical points lookup`);
  }
}

function assertCanonicalPointAuthority(projections){
  for(const [bookId,projection] of projections){
    const single=projection.units.find(unit=>unit.points.length===1&&Array.isArray(unit.publicationRecord?.points));
    assert(single,`${bookId}: requires a single-tier canonical authority probe`);
    const mutated=projectionMapClone(projections),unit=mutated.get(bookId).units.find(item=>item.id===single.id),compatibilityValue=unit.publicationRecord.points[0].value;
    unit.points=unit.points.map((tier,index)=>index?{...tier}:{...tier,value:tier.value+1});
    assert.equal(unit.publicationRecord.points[0].value,compatibilityValue,`${bookId}: mutation must leave the compatibility price stale`);
    const published=pointsApi.createPointsCatalogFromProjections(mutated).catalog[catalogKeys[bookId]].units[single.title.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()];
    assert.equal(published.points[0].value,unit.points[0].value,`${bookId}: stale single-tier compatibility price overrode canonical authority`);

    const multi=projection.units.find(unit=>unit.points.length>1&&Array.isArray(unit.publicationRecord?.points));
    assert(multi,`${bookId}: requires a multi-tier canonical authority probe`);
    const multiMutation=projectionMapClone(projections),multiUnit=multiMutation.get(bookId).units.find(item=>item.id===multi.id),multiCompatibilityValue=multiUnit.publicationRecord.points[0].value;
    multiUnit.points=multiUnit.points.map((tier,index)=>index?{...tier}:{...tier,value:tier.value+1});
    assert.equal(multiUnit.publicationRecord.points[0].value,multiCompatibilityValue,`${bookId}: multi-tier mutation must leave the compatibility price stale`);
    const multiPublished=pointsApi.createPointsCatalogFromProjections(multiMutation).catalog[catalogKeys[bookId]].units[multi.title.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()];
    assert.equal(multiPublished.points[0].value,multiUnit.points[0].value,`${bookId}: stale multi-tier compatibility price overrode canonical authority`);
  }

  const staleCompatibility=projectionMapClone(projections),canonical=staleCompatibility.get('death-guard').units.find(unit=>unit.points.length===1&&Array.isArray(unit.publicationRecord?.points));
  canonical.publicationRecord.points=canonical.publicationRecord.points.map((tier,index)=>index?{...tier}:{...tier,value:tier.value+1000});
  const stalePublished=pointsApi.createPointsCatalogFromProjections(staleCompatibility).catalog['death guard'].units[canonical.title.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()];
  assert.equal(stalePublished.points[0].value,canonical.points[0].value,'compatibility-only price controlled emitted points');

  const enhancementMutation=projectionMapClone(projections),enhancement=enhancementMutation.get('death-guard').enhancements.find(item=>item.id==='enhancement-daemon-weapon-of-nurgle'),compatibilityEnhancementValue=enhancement.publicationRecord.value;
  enhancement.value+=1;
  assert.equal(enhancement.publicationRecord.value,compatibilityEnhancementValue,'Enhancement mutation must leave the compatibility price stale');
  const publishedEnhancement=pointsApi.createPointsCatalogFromProjections(enhancementMutation).catalog['death guard'].enhancements[enhancement.title.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()];
  assert.equal(publishedEnhancement.value,enhancement.value,'compatibility-only Enhancement price overrode canonical authority');

  const detachmentMutation=projectionMapClone(projections),detachment=detachmentMutation.get('blood-angels').detachments.find(item=>item.id==='angelic-inheritors'),compatibilityDetachmentValue=detachment.publicationRecord.detachmentPoints;
  detachment.detachmentPoints+=1;
  assert.equal(detachment.publicationRecord.detachmentPoints,compatibilityDetachmentValue,'Detachment mutation must leave the compatibility price stale');
  const publishedDetachment=pointsApi.createPointsCatalogFromProjections(detachmentMutation).catalog['blood angels'].detachments[detachment.title.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()];
  assert.equal(publishedDetachment.detachmentPoints,detachment.detachmentPoints,'compatibility-only Detachment price overrode canonical authority');
}

const {catalog,projections}=first,published=readPublishedCatalog();
assert.equal(generatedReads.length,0,'points projection read a generated consumer artifact');
assert.equal(JSON.stringify(first.catalog),JSON.stringify(second.catalog),'points catalog rebuild is not byte deterministic');
assert.deepEqual(pointsApi.createPointsCatalogFromProjections(new Map([...projections].reverse())).catalog,catalog,'projection construction order changed points output');
assert.deepEqual(JSON.parse(JSON.stringify(catalog)),published.catalog,'effective projection changed published points semantics');
assert.equal(published.source,`window.WH_POINTS_CATALOG=Object.freeze(${JSON.stringify(catalog)});\n`,'points-data.js is not byte-current');
assert.equal(crypto.createHash('sha256').update(published.source).digest('hex'),'3f6f482acf986456bb3be284d8702b78de010e0e3bdd24193d1cef93eaf607ac');
assertProjectionCatalogIdentity(projections,catalog);
assertTauMfmPublicationCoverage(projections,catalog);
assertSupplementControls(projections);
assertEmperorsChildrenUpgradeIdentities(projections,catalog);
assertCanonicalPointAuthority(projections);

const unitRecords=[...projections.values()].reduce((sum,item)=>sum+item.units.length,0);
const pointTiers=[...projections.values()].reduce((sum,item)=>sum+item.units.reduce((bookSum,unit)=>bookSum+unit.points.length,0),0);
const enhancementRecords=[...projections.values()].reduce((sum,item)=>sum+item.enhancements.length,0);
const enhancementLookupKeys=Object.values(catalog).reduce((sum,item)=>sum+Object.keys(item.enhancements).length,0);
const detachmentRecords=[...projections.values()].reduce((sum,item)=>sum+item.detachments.length,0);
assert.deepEqual({books:projections.size,unitRecords,pointTiers,enhancementRecords,enhancementLookupKeys,detachmentRecords},{books:9,unitRecords:544,pointTiers:953,enhancementRecords:474,enhancementLookupKeys:534,detachmentRecords:134});

const base=clone(projections.get('space-marines'));
const recreate=mutate=>{const value=clone(base);mutate(value);return projectionApi.createEffectivePointsProjection(value);};
assert.throws(()=>recreate(value=>value.units.push(clone(value.units[0]))),/duplicate space-marines unit identity/);
assert.throws(()=>recreate(value=>value.enhancements.push(clone(value.enhancements[0]))),/duplicate space-marines scoped Enhancement identity/);
assert.throws(()=>recreate(value=>{value.units[0].points=[];}),/missing a required point schedule/);
assert.throws(()=>recreate(value=>{value.units[0].points[0].value=Number.NaN;}),/requires a finite value/);
assert.throws(()=>recreate(value=>value.units[0].points.push(clone(value.units[0].points[0]))),/duplicate point tier/);
assert.throws(()=>recreate(value=>{value.detachments[0].detachmentPoints=Number.NaN;}),/requires a finite Detachment point value/);

const unknownIdentity=projectionMapClone(projections);
unknownIdentity.get('space-marines').units[0].id='unit-unknown-canonical-identity';
assert.throws(()=>assertProjectionCatalogIdentity(unknownIdentity,catalog),/unit identity set differs/);
const countPreserving=projectionMapClone(projections);
countPreserving.get('tau-empire').units[0].id='unit-count-preserving-substitution';
assert.throws(()=>assertProjectionCatalogIdentity(countPreserving,catalog),/unit identity set differs/);

const tauOmittedUnit=clone(catalog);
delete tauOmittedUnit['t au empire'].units['ax 1 0 tiger shark'];
assert.throws(()=>assertTauMfmPublicationCoverage(projections,tauOmittedUnit),/unit count|omits an eligible MFM unit/);
const tauOmittedRow=clone(catalog);
tauOmittedRow['t au empire'].units['tiger shark'].points.pop();
assert.throws(()=>assertTauMfmPublicationCoverage(projections,tauOmittedRow),/published schedule differs/);
const tauChangedValue=clone(catalog);
tauChangedValue['t au empire'].units.manta.points[0].value++;
assert.throws(()=>assertTauMfmPublicationCoverage(projections,tauChangedValue),/published schedule differs/);
const tauWrongIdentity=clone(catalog),wrong=tauWrongIdentity['t au empire'].units['ta unar supremacy armour'];
wrong.id='unit-wrong-taunar-identity';
assert.throws(()=>assertTauMfmPublicationCoverage(projections,tauWrongIdentity),/omits an eligible MFM unit/);

const exclusionMutation=projectionMapClone(projections);
exclusionMutation.get('blood-angels').units.push(clone(projections.get('space-marines').units.find(item=>item.id==='unit-roboute-guilliman')));
assert.throws(()=>assertSupplementControls(exclusionMutation));
const precedenceMutation=projectionMapClone(projections);
precedenceMutation.get('blood-angels').units.find(item=>item.id==='unit-sanguinary-guard').sourceBookId='space-marines';
assert.throws(()=>assertSupplementControls(precedenceMutation));
const overrideMutation=projectionMapClone(projections);
overrideMutation.get('blood-angels').units.find(item=>item.id==='unit-repulsor-executioner').points[0].value=255;
assert.throws(()=>assertSupplementControls(overrideMutation));
const inheritedMutation=projectionMapClone(projections);
const inheritedIndex=inheritedMutation.get('dark-angels').enhancements.findIndex(item=>item.sourceBookId==='space-marines');
inheritedMutation.get('dark-angels').enhancements.splice(inheritedIndex,1);
assert.throws(()=>assertSupplementControls(inheritedMutation),/inherited Enhancement coverage differs/);

for(const file of ['roster-guides/build-points.mjs','roster-guides/effective-points-catalog.mjs']){
  const source=originalReadFileSync(path.join(root,file),'utf8');
  assert.equal(generatedInputPattern.test(path.resolve(root,file)),false);
  assert.doesNotMatch(source,/scripts[\\/]roster-data\.js|scripts[\\/]target-data\.js|reader\.html|mobile[\\/](?:generated|scripts)[\\/]/i,`${file} retains a generated factual input path`);
}

console.log(`Effective points projection QA: PASS (${projections.size} books, ${unitRecords} units, ${pointTiers} tiers, ${enhancementRecords} Enhancements, ${enhancementLookupKeys} lookup keys, ${detachmentRecords} Detachments; generated reads 0)`);
