/** DA-native pricing boundary. Numeric facts remain owned by central MFM.
 * Membership references do not activate a mixed-owner roster or gameplay.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';
import {createEffectiveMfmArmyProjection} from '../../shared/tools/effective-mfm-army-projection.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const rootFile=name=>new URL('../../../'+name,import.meta.url);
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').toUpperCase();
const clone=structuredClone;
const at=(value,pointer)=>pointer.slice(1).split('/').reduce((item,key)=>item?.[key],value);
const kinds={unitBindings:['unitPointRecords','DATASHEET','armyUnitId'],
  detachmentBindings:['detachments','DETACHMENT','armyDetachmentId'],
  enhancementBindings:['enhancementCosts','ENHANCEMENT','armyEnhancementId']};

export function consumeMfm(entities,{canonicalFacts,bindings=read('./mfm-bindings.json')}={}){
  assert.deepEqual(bindings,read('./mfm-bindings.json'),'Unreviewed native DA MFM bridges');
  assert.equal(bindings.sourceId,'dark-angels-mfm-v1.6');
  assert.equal(hash(new URL('./mfm-mapping-review.json',import.meta.url)),bindings.review.mappingReviewSha256,'Mapping review changed');
  const reviewRows=read('./mfm-mapping-review.json').reviewedBindings;
  const reviewed=new Map(reviewRows.map(row=>[row.entityId,row]));assert.equal(reviewed.size,reviewRows.length);
  const owner=createEffectiveMfmCatalog(canonicalFacts?{canonicalFacts}:{}),catalog=owner.catalog;
  const projection=createEffectiveMfmArmyProjection('dark-angels',canonicalFacts?{canonicalFacts}:{});
  assert.equal(projection.sourceMetadata.version,'v1.6','Historical DA pricing rejected');
  assert.equal(projection.sourceMetadata.verifiedAt,'2026-10-21');
  const snapshot=catalog.sourceSnapshots.find(row=>row.sourceId===bindings.sourceId&&!row.historical);
  assert.ok(snapshot,'Missing active DA source');
  assert.equal(snapshot.captureSha256,bindings.sourceCaptureSha256);
  const capture=read('../../../'+snapshot.sourcePath);
  const byId=new Map(entities.map(row=>[row.id,row]));assert.equal(byId.size,entities.length);
  const refs=new Map(catalog.unitReferences.map(row=>[row.id,row]));
  const records=new Map(),partitions={unitBindings:[],detachmentBindings:[],enhancementBindings:[],paidUpgradeBindings:[]};
  const own=id=>{
    if(records.has(id))return records.get(id);
    const fact=owner.getById(id);assert.ok(fact,'Unknown central DA fact');
    assert.equal(fact.factionId,'dark-angels','Foreign price copied into DA ownership');
    assert.equal(fact.provenance.sourceId,bindings.sourceId,'Historical/foreign MFM source');
    assert.ok(Object.isFrozen(fact));records.set(id,fact);
    for(const child of [...fact.enhancementCostIds||[],...fact.qualifierIds||[]])own(child);
    return fact;
  };
  for(const [part,[centralPart,kind,armyKey]]of Object.entries(kinds)){
    const seen=new Set();
    for(const binding of bindings[part]){
      const entity=byId.get(binding.entityId),fact=own(binding.mfmRecordId);
      assert.equal(entity?.kind,kind);assert.equal(entity.bookId,'dark-angels');
      assert.equal(binding.bookId,entity.bookId);
      assert.equal(entity.sourceEntityId,binding.sourceEntityId);
      const review=reviewed.get(entity.id);assert.equal(review?.status,'PROVEN','Mapping lacks independent source proof');
      assert.deepEqual(review.native,entity.provenance);
      assert.equal(binding.proof.mfm.rawHtmlPointer,review.mfm.pointer);
      assert.deepEqual(binding.proof.corroboratedProperties,review.corroboratedProperties);
      assert.ok(!seen.has(entity.id),'Duplicate native pricing recipient');seen.add(entity.id);
      assert.ok(catalog[centralPart].some(row=>row.id===fact.id));
      const army=part==='unitBindings'?refs.get(fact.unitReferenceId)?.armyBinding:fact;
      assert.ok(army&&army.bindingStatus!=='REFERENCE_ONLY','Unresolved mapping cannot price an Army entity');
      assert.equal(army.armyBookId,'dark-angels');assert.equal(army[armyKey],entity.id);
      assert.deepEqual(binding.sourceLocator,fact.provenance.sourceLocator);
      assert.deepEqual(binding.proof.native,entity.provenance);
      assert.equal(hash(rootFile(entity.provenance.document)),entity.provenance.sha256);
      assert.equal(binding.proof.mfm.sourcePath,snapshot.sourcePath);
      assert.equal(binding.proof.mfm.sourceId,snapshot.sourceId);
      assert.equal(binding.proof.mfm.captureSha256,snapshot.captureSha256);
      assert.equal(binding.proof.mfm.rawSha256,capture.rawArtifacts[0].sha256);
      const source=at(capture,binding.proof.mfm.jsonPointer);assert.ok(source,'Invalid reviewed source occurrence');
      assert.equal(hash(rootFile(review.mfm.document)),review.mfm.sha256);
      assert.equal(source.title,fact.provenance.sourceLocator.sourceTitle);
      assert.ok(binding.proof.corroboratedProperties.length>=2,'A label alone cannot establish identity');
      if(part==='unitBindings')assert.deepEqual(fact.pointSchedules,source.pointSchedules,'Source numeric tiers changed');
      else if(part==='detachmentBindings')assert.equal(fact.detachmentPoints,source.detachmentPoints);
      else{
        assert.equal(fact.value,source.value);assert.equal(fact.armyDetachmentId,entity.parentId);
        assert.equal(owner.getById(fact.detachmentId)?.armyDetachmentId,entity.parentId);
      }
      partitions[part].push({entityId:entity.id,bookId:entity.bookId,mfmRecordId:fact.id,provenance:clone(fact.provenance)});
    }
    const boundRecipients=new Set(bindings[part].map(row=>row.entityId));
    assert.deepEqual([...seen].sort(),[...boundRecipients].sort());
  }
  // The unit owns the official option price. No MODEL bearer, equipment choice,
  // occurrence or physical charge is inferred by this factual boundary.
  for(const binding of bindings.paidUpgradeBindings){
    const fact=own(binding.mfmRecordId),entity=byId.get(binding.entityId);
    assert.equal(entity?.kind,'DATASHEET');
    assert.equal(refs.get(fact.unitReferenceId)?.armyBinding?.armyUnitId,entity.id);
    assert.equal(binding.physicalSelectionStatus,'NOT_PROVEN');assert.equal(binding.chargeEnabled,false);
    partitions.paidUpgradeBindings.push({entityId:entity.id,mfmRecordId:fact.id,
      provenance:clone(fact.provenance),physicalSelectionStatus:'NOT_PROVEN',chargeEnabled:false});
  }
  const points=projection.pointsForArmyBook('dark-angels');
  const ownIds=new Set(partitions.unitBindings.map(row=>row.entityId));
  assert.deepEqual(points.units.map(row=>row.id).sort(),[...ownIds].sort());
  assert.ok(points.units.every(row=>row.status==='Current'&&row.pointsSource.version==='v1.6'));
  return {owner:'CENTRALIZED_MFM',source:clone(projection.sourceMetadata),partitions,records,points,
    referenceOnlyUnits:clone(projection.referenceOnlyUnitRecords),referenceOnlyOwners:clone(projection.referenceOnlyOwnerRecords),
    referenceOnlyRelationTargets:clone(catalog.unitReferences.filter(row=>row.factionId==='dark-angels'&&
      row.armyBinding?.bindingStatus==='REFERENCE_ONLY').map(row=>({mfmUnitReferenceId:row.id,
        sourceLocator:row.provenance.sourceLocator,reason:row.armyBinding.reason}))),
    mixedOwnerRuntimeStatus:'NOT_PROVEN',physicalPricingStatus:'NOT_IMPLEMENTED',relationsActivated:false};
}
