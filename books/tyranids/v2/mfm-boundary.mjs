import fs from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';

const reviewed=JSON.parse(fs.readFileSync(new URL('./mfm-bindings.json',import.meta.url),'utf8'));
const declarations=JSON.parse(fs.readFileSync(new URL('./identity-bindings.json',import.meta.url),'utf8')).bindings;
const sourceIds=new Map(declarations.map(row=>[row.sourceEntityId,row]));
const requireFact=(condition,message)=>{if(!condition)throw new Error(`Tyranids V2 MFM boundary: ${message}`);};
const owner=createEffectiveMfmCatalog({asOf:'2026-10-14'});
const partitions={unitBindings:['unitPointRecords','DATASHEET'],detachmentBindings:['detachments','DETACHMENT'],
  enhancementBindings:['enhancementCosts','ENHANCEMENT'],leaderBindings:['leaderEligibilityRecords','DATASHEET_SECTION'],
  paidOptionBindings:['paidUpgradeRecords','WEAPON_PROFILE']};

/** Return the central immutable fact. No Army-owned copy of any numeric value. */
export function resolveOwnedFact(id){
  const fact=owner.getById(id);
  requireFact(fact?.factionId==='tyranids'&&fact.provenance.sourceId==='tyranids-mfm-v1.6'&&
    fact.provenance.sourceVersion==='v1.6'&&Object.isFrozen(fact),'wrong/stale MFM owner');
  return fact;
}

/** Validate persistent bridges, including source-declared Leader recipients. */
export function consumeMfm(entities,{bindings=reviewed}={}){
  requireFact(isDeepStrictEqual(bindings,reviewed),'reviewed source bridges changed');
  const forbidden=new Set(['points','pointSchedules','wahaPoints','paidOptions','enhancementPoints','detachmentPoints','forceDispositions','forceDisposition']);
  const checkValues=value=>{
    if(!value||typeof value!=='object')return;
    for(const [key,child] of Object.entries(value)){
      requireFact(!forbidden.has(key),'Army-owned copy of MFM values');checkValues(child);
    }
  };
  for(const row of entities)checkValues(row.data);
  const byId=new Map(entities.map(row=>[row.id,row]));
  requireFact(byId.size===entities.length,'duplicate canonical identity');
  const refs=new Map(owner.catalog.unitReferences.filter(r=>r.factionId==='tyranids').map(r=>[r.id,r]));
  const unitId=ref=>{const value=refs.get(ref);requireFact(value?.armyBinding?.bindingStatus==='BOUND','unbound central unit');return value.armyBinding.armyUnitId;};
  const result={owner:'CENTRALIZED_MFM',sourceVersion:'v1.6',effectiveDate:null,partitions:{},leaderRelations:[]};
  for(const [part,[centralPart,kind]] of Object.entries(partitions)){
    const central=owner.catalog[centralPart].filter(row=>row.factionId==='tyranids');
    const ids=bindings[part].map(row=>row.mfmRecordId);
    requireFact(ids.length===new Set(ids).size&&ids.length===central.length&&central.every(row=>ids.includes(row.id)),`missing/extra ${part}`);
    result.partitions[part]=bindings[part].map(binding=>{
      const fact=resolveOwnedFact(binding.mfmRecordId),declaration=sourceIds.get(binding.sourceEntityId);
      const record=byId.get(declaration?.id);
      requireFact(record?.kind===kind&&record.sourceEntityId===binding.sourceEntityId,'wrong canonical source/kind');
      requireFact(isDeepStrictEqual(fact.provenance.sourceLocator,binding.sourceLocator)&&fact.recordType===binding.recordType,'wrong source occurrence');
      if(part==='unitBindings')requireFact(unitId(fact.unitReferenceId)===record.id&&record.id===binding.entityId,'wrong unit identity');
      if(part==='enhancementBindings')requireFact(fact.detachmentId===binding.mfmDetachmentId&&record.parentId===binding.ownerEntityId,'wrong Enhancement owner');
      if(part==='paidOptionBindings')requireFact(unitId(fact.unitReferenceId)===record.parentId&&record.parentId===binding.ownerEntityId,'wrong paid option owner');
      if(part==='leaderBindings'){
        const source=unitId(fact.sourceUnitReferenceId),targets=fact.targetUnitReferenceIds.map(unitId);
        requireFact(record.parentId===source&&source===binding.entityId,'wrong Leader owner');
        requireFact(isDeepStrictEqual(targets,binding.targetUnitIds),'wrong central Leader recipients');
        const text=record.data.blocks.map(row=>row.text).join('\n');
        const labels=text.split('\n').filter(line=>line.startsWith('- ')).map(line=>line.slice(2));
        const expected=targets.map(id=>{requireFact(byId.get(id)?.kind==='DATASHEET','missing Bodyguard');return byId.get(id).data.title.toUpperCase();});
        requireFact(labels.length===expected.length&&new Set(labels).size===labels.length&&expected.every(label=>labels.includes(label)),'raw/MFM Leader relation mismatch');
        for(const target of targets)result.leaderRelations.push({sourceId:source,targetId:target,
          declarationId:record.id,mfmRecordId:fact.id,provenance:fact.provenance});
      }
      return {entityId:record.id,mfmRecordId:fact.id,provenance:fact.provenance};
    });
  }
  for(const [kind,part] of [['DATASHEET','unitBindings'],['DETACHMENT','detachmentBindings'],['ENHANCEMENT','enhancementBindings']]){
    const bound=new Set(bindings[part].map(row=>row.entityId));
    const actual=entities.filter(row=>row.kind===kind);
    requireFact(actual.length===bound.size&&actual.every(row=>bound.has(row.id)),`incomplete ${kind} MFM bridge`);
  }
  return result;
}
