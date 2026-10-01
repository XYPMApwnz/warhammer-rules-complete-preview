import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createEffectiveMfmArmyProjection} from '../../shared/tools/effective-mfm-army-projection.mjs';
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';

const registry=JSON.parse(fs.readFileSync(new URL('./mfm-bindings.json',import.meta.url),'utf8'));
const bookId='death-guard';
const fail=message=>{throw new Error(`Death Guard V2 MFM boundary: ${message}`);};
const clone=value=>structuredClone(value);
const index=(records,keyOf,label)=>{
  const result=new Map();
  for(const record of records){const key=keyOf(record);if(!key||result.has(key))fail(`missing/duplicate ${label} identity ${key}`);result.set(key,record);}
  return result;
};
const sameIds=(actual,expected,label)=>{
  const missing=[...expected].filter(id=>!actual.has(id)),extra=[...actual].filter(id=>!expected.has(id));
  if(missing.length||extra.length)fail(`${label} binding coverage: missing=${missing.join(',')} extra=${extra.join(',')}`);
};
export const mfmOwnedFields=Object.freeze([
  'points','pointSchedules','wahaPoints','paidOptions','paidWargear','wargearCosts',
  'enhancementCost','enhancementPoints','detachmentPoints','forceDisposition',
  'forceDispositions','forceDispositionIds','mfmForceDispositionIds',
  'missionForceDispositionIds','mfmQualifiers'
]);
const ownedFieldSet=new Set(mfmOwnedFields);
export function assertNoMfmValues(entities){
  const visit=(value,path)=>{
    if(!value||typeof value!=='object')return;
    for(const [field,item] of Object.entries(value)){
      if(ownedFieldSet.has(field))fail(`duplicate MFM value ownership at ${path}.${field}`);
      visit(item,`${path}.${field}`);
    }
  };
  for(const entity of entities)visit(entity.data,entity.id);
  return true;
}

let central;
const centralOwner=()=>central??=createEffectiveMfmCatalog();
const ownedTypes=new Set(['MFM_UNIT_POINTS','MFM_PAID_UPGRADE','MFM_LEADER_ELIGIBILITY','MFM_SUPPORT_ELIGIBILITY','MFM_DETACHMENT','MFM_ENHANCEMENT_COST','MFM_QUALIFIER']);
export function resolveOwnedFact(recordId){
  const record=centralOwner().getById(recordId);
  if(!record||record.factionId!==bookId||!ownedTypes.has(record.recordType))fail(`unknown/non-DG owned fact ${recordId}`);
  return record;
}
const binding=(entityId,recordId,extra={})=>{
  const record=resolveOwnedFact(recordId);
  return {entityId,mfmRecordId:record.id,owner:'CENTRALIZED_MFM',recordType:record.recordType,provenance:clone(record.provenance),...extra};
};

export function consumeMfm(entities){
  if(!Array.isArray(entities))fail('entities must be an array');
  assertNoMfmValues(entities);
  const byId=index(entities,item=>item.id,'canonical entity');
  const projection=createEffectiveMfmArmyProjection(bookId),facts=projection.deathGuardPoints();
  const unitEntities=new Map([...byId].filter(([id])=>id.startsWith('unit-')));
  const detachmentEntities=new Map([...byId].filter(([id])=>/^detachment-[^:]+$/.test(id)));
  const enhancementEntities=new Map([...byId].filter(([id])=>/:enhancement:\d+$/.test(id)));
  sameIds(new Set(unitEntities.keys()),new Set(facts.units.map(item=>item.unitId)),'unit');
  sameIds(new Set(detachmentEntities.keys()),new Set(facts.detachments.map(item=>item.id)),'Detachment');
  const enhancementRegistry=index(registry.enhancements,item=>item.sourceEntityId,'source Enhancement binding');
  sameIds(new Set(enhancementEntities.keys()),new Set(enhancementRegistry.keys()),'source Enhancement');
  const currentEnhancements=index(facts.enhancements,item=>`${item.detachmentId}\0${item.id}`,'central scoped Enhancement');
  const enhancementBindings=[...enhancementEntities].map(([id,entity])=>{
    const declared=enhancementRegistry.get(id),key=`${declared.armyDetachmentId}\0${declared.armyEnhancementId}`,current=currentEnhancements.get(key);
    if(entity.parentId!==declared.armyDetachmentId)fail(`wrong canonical Enhancement parent ${id}`);
    if(!current||current.mfmRecordId!==declared.mfmRecordId)fail(`unknown/wrong scoped Enhancement binding ${id}`);
    return binding(id,current.mfmRecordId,{armyEnhancementId:declared.armyEnhancementId,armyDetachmentId:declared.armyDetachmentId});
  });
  sameIds(new Set(enhancementBindings.map(item=>`${item.armyDetachmentId}\0${item.armyEnhancementId}`)),new Set(currentEnhancements.keys()),'central Enhancement');
  const unitBindings=facts.units.map(item=>binding(item.unitId,item.mfmRecordId,{armyUnitId:item.unitId}));
  const detachmentBindings=facts.detachments.map(item=>binding(item.id,item.mfmRecordId,{armyDetachmentId:item.id}));
  const paidUpgradeBindings=facts.units.flatMap(unit=>unit.paidWargear.map(item=>binding(unit.unitId,item.mfmRecordId,{armyUnitId:unit.unitId,unitPointRecordId:unit.mfmRecordId})));

  const support=index(registry.supportExceptions,item=>`${item.role}\0${item.sourceId}\0${item.targetId}`,'Army Support exception');
  for(const exception of support.values()){
    const source=byId.get(exception.sourceEntityId);
    if(!source||!byId.has(exception.sourceId)||!byId.has(exception.targetId))fail(`unresolved Army Support identity ${exception.sourceEntityId}`);
    const text=(source.data?.blocks||[]).map(item=>item.text).join('\n');
    if(createHash('sha256').update(text).digest('hex')!==exception.acceptedTextSha256)fail(`changed/unreconciled Army Support source ${exception.sourceEntityId}`);
  }
  const edges=projection.relationEdges({effectiveUnitIds:[...unitEntities.keys()],armyEdges:[...support.values()].map(({role,sourceId,targetId})=>({role,sourceId,targetId}))});
  const relations=edges.map(edge=>{
    if(edge.mfmRecordId)return binding(edge.sourceId,edge.mfmRecordId,{role:edge.role,sourceId:edge.sourceId,targetId:edge.targetId});
    const exception=support.get(`${edge.role}\0${edge.sourceId}\0${edge.targetId}`);
    if(!exception)fail(`unbound Army relation ${edge.sourceId}/${edge.targetId}`);
    return {role:edge.role,sourceId:edge.sourceId,targetId:edge.targetId,owner:'ACCEPTED_ARMY_SUPPORT_EXCEPTION',sourceEntityId:exception.sourceEntityId,qualification:exception.qualification,provenance:clone(byId.get(exception.sourceEntityId).provenance),acceptedBindingEvidence:clone(exception.provenance)};
  });
  const eligibilityEvidenceBindings=registry.eligibilityEvidence.map(declared=>{
    const section=byId.get(declared.sourceEntityId);
    if(!section||section.parentId!==declared.sourceId)fail(`unresolved eligibility evidence ${declared.sourceEntityId}`);
    const owned=relations.filter(edge=>edge.sourceId===declared.sourceId&&edge.owner==='CENTRALIZED_MFM');
    if(!owned.length)fail(`missing central eligibility owner ${declared.sourceId}`);
    return {...declared,field:'attachmentEligibility',effectiveOwner:'CENTRALIZED_MFM',mfmRecordIds:[...new Set(owned.map(edge=>edge.mfmRecordId))],
      sourceTextRole:'BASE_EVIDENCE_ONLY_FOR_ELIGIBILITY',effectiveRelationPath:'mfm.relations',
      armyExceptionSourceIds:relations.filter(edge=>edge.sourceId===declared.sourceId&&edge.owner==='ACCEPTED_ARMY_SUPPORT_EXCEPTION').map(edge=>edge.sourceEntityId)};
  });
  return {schema:'death-guard-v2-central-mfm-consumption/v1',source:clone(projection.sourceMetadata),unitBindings,detachmentBindings,enhancementBindings,relations,paidUpgradeBindings,eligibilityEvidenceBindings};
}
