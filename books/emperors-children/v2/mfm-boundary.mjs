import fs from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const reviewed=read('./mfm-bindings.json');
const identities=read('./identity-bindings.json').bindings;
const bookId='emperors-children',sourceId='emperors-children-mfm-v1.6';
const clone=value=>structuredClone(value);
const fail=message=>{throw new Error(`EC V2 MFM boundary: ${message}`);};
const check=(condition,message)=>{if(!condition)fail(message);};
const index=(rows,key,label)=>{
  const result=new Map();
  for(const row of rows){const id=row[key];check(id&&!result.has(id),`missing/duplicate ${label} identity ${id}`);result.set(id,row);}
  return result;
};
const sameIds=(actual,expected,label)=>{
  check(actual.size===expected.size&&[...actual].every(id=>expected.has(id)),`${label} binding coverage differs`);
};
const equal=(actual,expected,label)=>check(isDeepStrictEqual(actual,expected),`${label} differs`);
const sourceIdentities=index(identities,'sourceEntityId','source');
const canonicalIdentities=index(identities,'id','canonical declaration');
const partitions={unitBindings:['unitPointRecords','MFM_UNIT_POINTS'],detachmentBindings:['detachments','MFM_DETACHMENT'],enhancementBindings:['enhancementCosts','MFM_ENHANCEMENT_COST'],paidUpgradeBindings:['paidUpgradeRecords','MFM_PAID_UPGRADE'],leaderEligibilityBindings:['leaderEligibilityRecords','MFM_LEADER_ELIGIBILITY'],qualifierBindings:['qualifierRecords','MFM_QUALIFIER']};
const ownedTypes=new Set([...Object.values(partitions).map(([,type])=>type),'MFM_SUPPORT_ELIGIBILITY']);
let central;
const centralOwner=()=>central??=createEffectiveMfmCatalog({asOf:'2026-10-14'});

export const mfmOwnedFields=Object.freeze(['points','pointSchedules','wahaPoints','paidOptions','paidWargear','wargearCosts','enhancementCost','enhancementPoints','detachmentPoints','forceDisposition','forceDispositions','forceDispositionIds','mfmForceDispositionIds','missionForceDispositionIds','mfmQualifiers']);
const ownedFields=new Set(mfmOwnedFields);
export function assertNoMfmValues(entities){
  const visit=(value,path)=>{
    if(!value||typeof value!=='object')return;
    for(const [field,item] of Object.entries(value)){
      check(!ownedFields.has(field),`duplicate MFM value ownership at ${path}.${field}`);
      visit(item,`${path}.${field}`);
    }
  };
  for(const entity of entities)visit(entity.data,entity.id);
  return true;
}

/** Return the immutable owning record; bindings never persist its values. */
export function resolveOwnedFact(recordId){
  const record=centralOwner().getById(recordId);
  check(record&&record.factionId===bookId&&ownedTypes.has(record.recordType),`unknown/non-EC owned fact ${recordId}`);
  check(record.provenance.sourceId===sourceId&&record.provenance.sourceVersion==='v1.6'&&record.provenance.currentnessCutoff==='2026-10-14',`stale MFM owner ${recordId}`);
  check(Object.isFrozen(record),`mutable central MFM owner ${recordId}`);
  return record;
}

/** Consume reviewed identity bridges, returning references and provenance only.
 * The optional ledger is for isolated validation; it must match enrolled bridges.
 */
export function consumeMfm(entities,{bindings=reviewed}={}){
  check(Array.isArray(entities),'entities must be an array');
  assertNoMfmValues(entities);
  const byId=index(entities,'id','canonical entity'),catalog=centralOwner().catalog;
  equal(bindings.schema,reviewed.schema,'binding schema');
  equal(bindings.authority,reviewed.authority,'binding authority');
  equal(bindings.currentnessCutoff,catalog.currentnessCutoff,'binding cutoff');
  const entity=(id,kind)=>{
    const value=byId.get(id),declaration=canonicalIdentities.get(id);
    check(value&&declaration&&value.kind===kind&&declaration.kind===kind,`unresolved/wrong canonical kind ${id}`);
    const parent=declaration.ownerSourceId?sourceIdentities.get(declaration.ownerSourceId)?.id:undefined;
    equal(value.parentId,parent,`canonical owner ${id}`);
    return value;
  };
  const sourceEntity=(sid,kind)=>{
    const declaration=sourceIdentities.get(sid);
    check(declaration,`unknown source identity ${sid}`);
    return entity(declaration.id,kind);
  };
  const local=index(bindings.unitBindings,'mfmUnitReferenceId','unit reference binding');
  const localUnitId=refId=>{
    const ref=catalog.unitReferences.find(item=>item.id===refId),bound=local.get(refId);
    check(ref&&bound&&ref.factionId===bookId&&ref.armyBinding?.bindingStatus==='BOUND'&&ref.armyBinding.armyBookId===bookId,`unbound central unit reference ${refId}`);
    equal(bound.entityId,ref.armyBinding.armyUnitId,`central Army unit ${refId}`);
    return bound.entityId;
  };
  const result={schema:'ec-v2-central-mfm-consumption/v1',owner:'CENTRALIZED_MFM',sourceId,currentnessCutoff:catalog.currentnessCutoff};
  for(const [part,[centralPart,type]] of Object.entries(partitions)){
    check(Array.isArray(bindings[part]),`missing binding partition ${part}`);
    const declared=index(bindings[part],'mfmRecordId',part);
    const accepted=index(reviewed[part],'mfmRecordId','reviewed '+part);
    const owned=catalog[centralPart].filter(record=>record.factionId===bookId);
    sameIds(new Set(declared.keys()),new Set(owned.map(record=>record.id)),part);
    result[part]=bindings[part].map(binding=>{
      const record=resolveOwnedFact(binding.mfmRecordId);
      equal(binding.expectedFaction,bookId,'expected faction');
      equal(binding.recordType,type,'declared record type');
      equal(record.recordType,type,'central record type');
      equal(binding.sourceId,record.provenance.sourceId,'source identity');
      equal(binding.sourceLocator,record.provenance.sourceLocator,'source locator');
      check(byId.has(binding.entityId),'missing bound canonical entity '+binding.entityId);
      if(part==='unitBindings'){
        const unit=sourceEntity(binding.sourceEntityId,'DATASHEET');
        equal(unit.id,binding.entityId,'unit source identity');
        equal(binding.scopeOwnerId,bookId,'unit scope owner');
        equal(record.unitReferenceId,binding.mfmUnitReferenceId,'unit reference');
        equal(binding.armyUnitId,localUnitId(record.unitReferenceId),'Army unit binding');
      }else if(part==='detachmentBindings'){
        equal(sourceEntity(binding.sourceEntityId,'DETACHMENT').id,binding.entityId,'Detachment source identity');
        equal(binding.scopeOwnerId,bookId,'Detachment scope owner');
        equal(record.armyBookId,bookId,'central Detachment book');
        equal(binding.armyDetachmentId,record.armyDetachmentId,'central Detachment identity');
      }else if(part==='enhancementBindings'){
        const enhancement=sourceEntity(binding.sourceEntityId,'ENHANCEMENT');
        equal(enhancement.id,binding.entityId,'Enhancement source identity');
        equal(enhancement.parentId,binding.scopeOwnerId,'Enhancement scope owner');
        const detachment=bindings.detachmentBindings.find(item=>item.entityId===binding.scopeOwnerId);
        check(detachment,'unbound Enhancement Detachment');
        equal(record.detachmentId,detachment.mfmRecordId,'central Enhancement owner');
        equal(binding.mfmDetachmentRecordId,record.detachmentId,'Enhancement declared central owner');
        equal(binding.armyDetachmentId,record.armyDetachmentId,'Enhancement Army Detachment');
        equal(binding.armyEnhancementId,record.armyEnhancementId,'Enhancement Army identity');
        equal(record.armyBookId,bookId,'Enhancement central book');
      }else if(part==='paidUpgradeBindings'){
        const weapon=sourceEntity(binding.sourceEntityId,'WEAPON_PROFILE');
        equal(weapon.id,binding.entityId,'paid selection source identity');
        equal(weapon.parentId,binding.scopeOwnerId,'paid selection owner');
        equal(localUnitId(record.unitReferenceId),binding.scopeOwnerId,'central paid owner');
        equal(record.unitPointRecordId,local.get(record.unitReferenceId).mfmRecordId,'central paid point owner');
        const unit=entity(binding.scopeOwnerId,'DATASHEET');
        for(const id of binding.weaponProfileSourceIds){
          const profile=sourceEntity(id,'WEAPON_PROFILE');
          equal(profile.parentId,binding.scopeOwnerId,'paid weapon owner');
          check(unit.data.weaponIds.includes(profile.id),'paid weapon missing from canonical unit selection');
        }
        for(const id of binding.optionSourceIds){
          const option=sourceEntity(id,'WARGEAR_OPTION');
          equal(option.parentId,binding.scopeOwnerId,'paid option owner');
          check(unit.data.wargearOptionIds.includes(option.id),'paid option missing from canonical unit selection');
        }
      }else if(part==='leaderEligibilityBindings'){
        const section=sourceEntity(binding.sourceEntityId,'DATASHEET_SECTION');
        equal(section.parentId,binding.scopeOwnerId,'eligibility source owner');
        equal(localUnitId(record.sourceUnitReferenceId),binding.entityId,'central Leader source');
        equal(binding.sourceUnitId,binding.entityId,'Leader source unit');
        equal(binding.scopeOwnerId,binding.entityId,'Leader scope owner');
        check(entity(binding.entityId,'DATASHEET').data.sectionIds.includes(section.id),'Leader evidence missing from canonical unit sections');
        const targetIds=record.targetUnitReferenceIds.map(localUnitId);
        check(new Set(binding.targetUnitIds).size===binding.targetUnitIds.length,'duplicate Leader target');
        sameIds(new Set(binding.targetUnitIds),new Set(targetIds),'Leader targets');
        for(const id of binding.targetUnitIds)entity(id,'DATASHEET');
      }else{
        const enhancement=sourceEntity(binding.sourceEntityId,'ENHANCEMENT');
        equal(enhancement.id,binding.entityId,'qualifier source identity');
        equal(enhancement.parentId,binding.scopeOwnerId,'qualifier scope owner');
        const owner=bindings.enhancementBindings.find(item=>item.entityId===binding.entityId);
        check(owner,'unbound qualifier Enhancement');
        equal(binding.mfmOwnerRecordId,record.ownerId,'qualifier declared central owner');
        equal(record.ownerId,owner.mfmRecordId,'qualifier central owner');
        equal(record.ownerKind,'ENHANCEMENT','qualifier owner kind');
        equal(record.armyBookId,bookId,'qualifier book');
        equal(binding.armyOwnerId,record.armyOwnerId,'qualifier Army owner');
      }
      // The reviewed ledger owns exact source addresses and paid selections.
      // Central MFM alone owns values; display labels never resolve a bridge.
      equal(binding,accepted.get(record.id),'reviewed source/selection bridge '+record.id);
      return {...clone(binding),owner:'CENTRALIZED_MFM',provenance:clone(record.provenance)};
    });
  }
  for(const [kind,part] of [['DATASHEET','unitBindings'],['DETACHMENT','detachmentBindings'],['ENHANCEMENT','enhancementBindings']]){
    sameIds(new Set(entities.filter(item=>item.kind===kind).map(item=>item.id)),new Set(bindings[part].map(item=>item.entityId)),kind);
  }
  sameIds(new Set(catalog.unitReferences.filter(item=>item.factionId===bookId).map(item=>item.id)),new Set(local.keys()),'central EC unit references');
  check(catalog.supportEligibilityRecords.every(item=>item.factionId!==bookId),'unbound EC Support records');
  return result;
}
