/** Persistent source bridges into the existing central MFM owner.
 * Army facts retain their original values; no copied Army-owned numeric prices.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';
import {createEffectiveMfmArmyProjection} from '../../shared/tools/effective-mfm-army-projection.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const clone=structuredClone;
const sort=values=>[...values].sort((a,b)=>a.id.localeCompare(b.id));
const partitionKinds={unitBindings:['unitPointRecords','DATASHEET','armyUnitId'],
  detachmentBindings:['detachments','DETACHMENT','armyDetachmentId'],
  enhancementBindings:['enhancementCosts','ENHANCEMENT','armyEnhancementId']};

export function consumeMfm(entities,{canonicalFacts,bindings=read('./mfm-bindings.json'),presentUnitIds}={}){
  assert.deepEqual(bindings,read('./mfm-bindings.json'),'Unreviewed native MFM bridges');
  const owner=createEffectiveMfmCatalog(canonicalFacts?{canonicalFacts}:{}),catalog=owner.catalog;
  const projection=createEffectiveMfmArmyProjection('space-marines',canonicalFacts?{canonicalFacts}:{});
  assert.equal(projection.sourceMetadata.version,'v1.6','Stale SM MFM source');
  assert.equal(projection.sourceMetadata.verifiedAt,'2026-10-20','Wrong accepted SM observation');
  const snapshot=catalog.sourceSnapshots.find(record=>record.sourceId==='space-marines-mfm-v1.6');
  const capture=read('../../../'+snapshot.sourcePath);
  const byId=new Map(entities.map(entity=>[entity.id,entity]));assert.equal(byId.size,entities.length);
  const refs=new Map(catalog.unitReferences.filter(record=>record.factionId==='space-marines').map(record=>[record.id,record]));
  const unitBinding=id=>refs.get(id)?.armyBinding;
  const records=new Map(),partitions={unitBindings:[],detachmentBindings:[],enhancementBindings:[],
    paidUpgradeBindings:[],leaderEligibilityBindings:[],qualifierBindings:[]};
  const own=id=>{
    if(records.has(id))return records.get(id);
    const fact=owner.getById(id);
    assert.equal(fact?.factionId,'space-marines','Foreign native MFM record');
    assert.equal(fact.provenance.sourceId,'space-marines-mfm-v1.6','Historical prices must not enter native current book');
    assert.ok(Object.isFrozen(fact),'Mutable MFM owner');records.set(id,fact);
    for(const child of [...fact.qualifierIds||[],...fact.enhancementCostIds||[]])own(child);
    return fact;
  };
  const rawHashes=new Map();
  for(const [part,[centralPart,kind,armyKey]]of Object.entries(partitionKinds)){
    const seen=new Set();
    for(const binding of bindings[part]){
      const entity=byId.get(binding.entityId),fact=own(binding.mfmRecordId);
      assert.equal(entity?.kind,kind,'Wrong native MFM canonical kind');
      assert.equal(entity.bookId,binding.bookId,'Wrong native MFM book owner');
      assert.equal(entity.sourceEntityId,binding.sourceEntityId,'Wrong native source occurrence');
      assert.ok(!seen.has(entity.id),'Duplicate native MFM owner');seen.add(entity.id);
      assert.ok(catalog[centralPart].some(record=>record.id===fact.id),'Wrong central MFM partition');
      assert.deepEqual(fact.provenance.sourceLocator,binding.sourceLocator,'Wrong central source occurrence');
      const army=part==='unitBindings'?unitBinding(fact.unitReferenceId):fact;
      assert.notEqual(army.bindingStatus,'REFERENCE_ONLY','Unresolved MFM binding activated');
      assert.equal(army[armyKey],entity.id,'Wrong central-to-native canonical join');
      assert.equal(army.armyBookId,entity.bookId,'Cross-book MFM owner');
      if(part==='enhancementBindings'){
        const det=owner.getById(fact.detachmentId);
        assert.equal(det.armyDetachmentId,entity.parentId,'Wrong Enhancement Detachment');
      }
      assert.deepEqual(binding.proof.native,entity.provenance,'Native proof provenance drift');
      assert.equal(binding.proof.mfm.sourceId,fact.provenance.sourceId);
      assert.equal(binding.proof.mfm.captureSha256,fact.provenance.sourceCaptureSha256);
      assert.equal(binding.proof.mfm.sourcePath,snapshot.sourcePath,'Wrong accepted MFM capture path');
      assert.equal(binding.proof.mfm.rawSha256.toUpperCase(),capture.rawArtifacts[0].sha256.toUpperCase(),'Wrong MFM raw provenance');
      const pointed=binding.proof.mfm.jsonPointer.slice(1).split('/').reduce((value,key)=>value?.[key],capture);
      assert.equal(pointed?.title,fact.provenance.sourceLocator.sourceTitle,'Wrong reviewed MFM JSON pointer');
      const path=binding.proof.native.document;
      if(!rawHashes.has(path))rawHashes.set(path,crypto.createHash('sha256').update(fs.readFileSync(new URL('../../../'+path,import.meta.url))).digest('hex').toUpperCase());
      assert.equal(rawHashes.get(path),binding.proof.native.sha256,'Unreviewed native source bytes');
      assert.ok(binding.proof.corroboratedProperties.length>=2,'Title-only identity mapping');
      partitions[part].push({entityId:entity.id,bookId:entity.bookId,mfmRecordId:fact.id,provenance:clone(fact.provenance)});
    }
    assert.deepEqual([...seen].sort(),entities.filter(entity=>entity.kind===kind).map(entity=>entity.id).sort(),`Incomplete native ${part}`);
  }
  const boundUnitId=ref=>{const binding=unitBinding(ref);return binding?.bindingStatus==='BOUND'&&byId.has(binding.armyUnitId)?binding.armyUnitId:null;};
  const eligibilityRecords=sort([...catalog.leaderEligibilityRecords,...catalog.supportEligibilityRecords].filter(record=>record.factionId==='space-marines'));
  const declarations=[];
  for(const fact of eligibilityRecords){
    const entityId=boundUnitId(fact.sourceUnitReferenceId);if(!entityId)continue;
    own(fact.id);partitions.leaderEligibilityBindings.push({entityId,mfmRecordId:fact.id,provenance:clone(fact.provenance)});
    const sourceDeclaration=entities.find(entity=>entity.kind==='SOURCE_RELATION'&&entity.parentId===entityId&&
      entity.data.role===(fact.roleCondition?.expectedPresent?'CONDITIONAL_ROLE_REPLACEMENT':fact.recordType==='MFM_LEADER_ELIGIBILITY'?'LEADER':'SUPPORT'));
    assert.ok(sourceDeclaration,`No native declaration for central relation ${fact.id}`);
    const targets=fact.targetUnitReferenceIds.map(id=>({mfmUnitReferenceId:id,entityId:boundUnitId(id),
      status:boundUnitId(id)?'BOUND':'REFERENCE_ONLY',reason:boundUnitId(id)?null:unitBinding(id)?.reason||'NATIVE_TARGET_NOT_ENROLLED'}));
    const nativeAnchors=new Map(entities.filter(entity=>entity.kind==='DATASHEET').map(entity=>[entity.data.sourceAnchor,entity.id]));
    assert.deepEqual(targets.filter(target=>target.entityId).map(target=>target.entityId).sort(),
      sourceDeclaration.data.targetSourceAnchors.filter(anchor=>nativeAnchors.has(anchor)).map(anchor=>nativeAnchors.get(anchor)).sort(),
      `Native/central relation recipient mismatch: ${fact.id}`);
    // Unenrolled Chapter recipients remain central references, not fake Datasheets.
    for(const target of targets.filter(target=>!target.entityId))own(target.mfmUnitReferenceId);
    declarations.push({mfmRecordId:fact.id,sourceId:entityId,sourceDeclarationId:sourceDeclaration.id,
      role:fact.recordType==='MFM_LEADER_ELIGIBILITY'?'leader':'support',targets,
      ...(fact.roleCondition?{roleCondition:clone(fact.roleCondition),roleConditionProvenance:clone(fact.roleConditionProvenance)}:{}),
      provenance:clone(fact.provenance)});
  }
  for(const fact of catalog.paidUpgradeRecords.filter(record=>record.factionId==='space-marines')){
    const entityId=boundUnitId(fact.unitReferenceId);if(!entityId)continue;
    own(fact.id);partitions.paidUpgradeBindings.push({entityId,mfmRecordId:fact.id,provenance:clone(fact.provenance)});
  }
  for(const fact of catalog.qualifierRecords.filter(record=>record.factionId==='space-marines'&&record.bindingStatus!=='REFERENCE_ONLY')){
    assert.ok(byId.has(fact.armyOwnerId),'Foreign qualifier native owner');own(fact.id);
    partitions.qualifierBindings.push({entityId:fact.armyOwnerId,mfmRecordId:fact.id,provenance:clone(fact.provenance)});
  }
  const effectiveUnitIds=entities.filter(entity=>entity.kind==='DATASHEET').map(entity=>entity.id);
  const relations=projection.relationEdges({effectiveUnitIds,presentUnitIds,allowUnresolvedConditions:true});
  const conditional=declarations.filter(record=>record.roleCondition);
  const relationStatus=presentUnitIds===undefined&&conditional.length?'NEEDS_ARMY_CONTEXT':'RESOLVED';
  return {owner:'CENTRALIZED_MFM',source:clone(projection.sourceMetadata),partitions,records,
    relationDeclarations:declarations,relations,relationStatus,conditionalRelations:conditional,
    referenceOnlyUnits:clone(projection.referenceOnlyUnitRecords),referenceOnlyOwners:clone(projection.referenceOnlyOwnerRecords),
    nativePoints:projection.pointsForArmyBook('space-marines'),deathwatchPoints:projection.pointsForArmyBook('deathwatch')};
}
