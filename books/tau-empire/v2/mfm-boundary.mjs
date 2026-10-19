import fs from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';

const reviewed=JSON.parse(fs.readFileSync(new URL('./mfm-bindings.json',import.meta.url),'utf8'));
const requireFact=(condition,message)=>{if(!condition)throw new Error(`T'au Empire V2 MFM boundary: ${message}`);};
const owner=createEffectiveMfmCatalog({asOf:'2026-10-14'});
const partitions={unitBindings:['unitPointRecords','DATASHEET'],detachmentBindings:['detachments','DETACHMENT'],
  enhancementBindings:['enhancementCosts','ENHANCEMENT'],leaderBindings:['leaderEligibilityRecords','DATASHEET_SECTION'],
  paidOptionBindings:['paidUpgradeRecords',null]};
const label=value=>value.replace(/[‘’]/g,"'").replace(/\s*\(Upgrade\)$/i,'').toUpperCase();

/** Resolve the immutable central fact; Army Book entities hold references only. */
export function resolveOwnedFact(id){
  const fact=owner.getById(id);
  requireFact(fact?.factionId==='tau-empire'&&fact.provenance.sourceId==='tau-empire-mfm-v1.6'&&
    fact.provenance.sourceVersion==='v1.6'&&fact.provenance.currentnessCutoff==='2026-10-14'&&
    fact.provenance.effectiveDate===null&&Object.isFrozen(fact),'wrong/stale MFM owner');
  return fact;
}

/** Validate explicit bridges and independently compare current raw Leader recipients. */
export function consumeMfm(entities,{bindings=reviewed}={}){
  requireFact(isDeepStrictEqual(bindings,reviewed),'reviewed source bridges changed');
  const forbidden=new Set(['points','pointSchedules','wahaPoints','paidOptions','paidWargear','wargearCosts','enhancementCost','enhancementPoints','detachmentPoints',
    'forceDispositions','forceDisposition','forceDispositionIds','missionForceDispositionIds','mfmForceDispositionIds']);
  const checkValues=value=>{
    if(!value||typeof value!=='object')return;
    for(const [key,child] of Object.entries(value)){
      requireFact(!forbidden.has(key),'Army-owned copy of MFM values');checkValues(child);
    }
  };
  for(const row of entities)checkValues(row.data);
  const byId=new Map(entities.map(row=>[row.id,row]));
  requireFact(byId.size===entities.length,'duplicate canonical identity');
  const refs=new Map(owner.catalog.unitReferences.filter(r=>r.factionId==='tau-empire').map(r=>[r.id,r]));
  const unitId=ref=>{const value=refs.get(ref);requireFact(value?.armyBinding?.bindingStatus==='BOUND'&&
    value.armyBinding.armyBookId==='tau-empire','unbound central unit');return value.armyBinding.armyUnitId;};
  const result={owner:'CENTRALIZED_MFM',sourceVersion:'v1.6',effectiveDate:null,partitions:{},leaderRelations:[]};
  for(const [part,[centralPart,kind]] of Object.entries(partitions)){
    const central=owner.catalog[centralPart].filter(row=>row.factionId==='tau-empire');
    const ids=bindings[part].map(row=>row.mfmRecordId);
    requireFact(ids.length===new Set(ids).size&&ids.length===central.length&&central.every(row=>ids.includes(row.id)),`missing/extra ${part}`);
    result.partitions[part]=bindings[part].map(binding=>{
      const fact=resolveOwnedFact(binding.mfmRecordId);
      // A Leader is a named source section under an explicit owner. Its position is not identity.
      const matches=part==='leaderBindings'?entities.filter(row=>row.parentId===binding.entityId&&
        row.kind==='DATASHEET_SECTION'&&row.data.title.toUpperCase()==='LEADER'):[];
      if(part==='leaderBindings')requireFact(matches.length===1,'missing/duplicate source Leader declaration');
      const record=part==='leaderBindings'?matches[0]:byId.get(binding.entityId);
      requireFact(record?.kind===(kind??binding.entityKind)&&record.sourceEntityId===binding.sourceEntityId,'wrong canonical source/kind');
      requireFact(isDeepStrictEqual(fact.provenance.sourceLocator,binding.sourceLocator)&&fact.recordType===binding.recordType&&
        fact.provenance.sourceId===binding.sourceId,'wrong source occurrence');
      if(part==='unitBindings')requireFact(unitId(fact.unitReferenceId)===record.id&&
        fact.unitReferenceId===binding.unitReferenceId&&label(record.data.title)===label(fact.label),'wrong unit identity');
      if(part==='detachmentBindings')requireFact(record.id===binding.sourceEntityId&&fact.armyBookId==='tau-empire'&&
        fact.armyDetachmentId===binding.mfmArmyDetachmentId&&label(record.data.title)===label(fact.label),'wrong Detachment owner');
      if(part==='enhancementBindings'){
        const detachment=bindings.detachmentBindings.find(row=>row.mfmRecordId===fact.detachmentId);
        requireFact(fact.detachmentId===binding.mfmDetachmentId&&record.parentId===binding.ownerEntityId&&
          record.parentId===detachment?.entityId&&fact.armyEnhancementId===binding.mfmArmyEnhancementId&&
          label(record.data.title)===label(fact.label),'wrong Enhancement owner');
      }
      if(part==='paidOptionBindings'){
        requireFact(unitId(fact.unitReferenceId)===record.parentId&&record.parentId===binding.ownerEntityId,'wrong paid option owner');
        requireFact(binding.relatedEntityIds.length>0&&binding.relatedEntityIds[0]===record.id&&
          new Set(binding.relatedEntityIds).size===binding.relatedEntityIds.length,'wrong paid option profiles');
        for(const id of binding.relatedEntityIds){
          const profile=byId.get(id);
          requireFact(profile?.kind===binding.entityKind&&profile.parentId===binding.ownerEntityId&&profile.sourceEntityId===id,'wrong paid option profiles');
          const sourceLabel=binding.entityKind==='WEAPON_PROFILE'?(profile.data.name??profile.data.title).split(' – ')[0]:profile.data.text;
          requireFact(binding.entityKind==='WEAPON_PROFILE'?label(sourceLabel)===label(fact.label):
            label(sourceLabel).includes(label(fact.label)),'wrong paid option source label');
        }
      }
      if(part==='leaderBindings'){
        const source=unitId(fact.sourceUnitReferenceId),targets=fact.targetUnitReferenceIds.map(unitId);
        requireFact(record.parentId===source&&source===binding.entityId,'wrong Leader owner');
        requireFact(isDeepStrictEqual(targets,binding.targetUnitIds),'wrong central Leader recipients');
        const labels=record.data.blocks.flatMap(row=>row.text.split('\n')).filter(line=>line.startsWith('- ')).map(line=>label(line.slice(2)));
        const expected=targets.map(id=>{requireFact(byId.get(id)?.kind==='DATASHEET','missing Bodyguard');return label(byId.get(id).data.title);});
        // Three raw declarations also name the excluded Legends Crisis Battlesuits. Keep that
        // source text intact and classify it explicitly; it cannot enter the current relation set.
        for(const excluded of binding.excludedRawRecipients){
          requireFact(excluded.reason==='EXCLUDED_LEGENDS_DATASHEET'&&excluded.sourceEntityId==='datasheet-crisis-battlesuits'&&
            excluded.sourceLabel==='CRISIS BATTLESUITS'&&!entities.some(row=>row.sourceEntityId===excluded.sourceEntityId),'wrong excluded raw recipient');
          expected.push(label(excluded.sourceLabel));
        }
        requireFact(labels.length===expected.length&&new Set(labels).size===labels.length&&expected.every(value=>labels.includes(value)),
          'raw/MFM Leader relation mismatch');
        for(const target of targets)result.leaderRelations.push({sourceId:source,targetId:target,
          declarationId:record.id,mfmRecordId:fact.id,provenance:fact.provenance});
      }
      return {entityId:record.id,mfmRecordId:fact.id,provenance:fact.provenance};
    });
  }
  for(const [kind,part] of [['DATASHEET','unitBindings'],['DETACHMENT','detachmentBindings'],['ENHANCEMENT','enhancementBindings']]){
    const bound=new Set(bindings[part].map(row=>row.entityId)),actual=entities.filter(row=>row.kind===kind);
    requireFact(actual.length===bound.size&&actual.every(row=>bound.has(row.id)),`incomplete ${kind} MFM bridge`);
  }
  const rawLeaders=entities.filter(row=>row.kind==='DATASHEET_SECTION'&&row.data.title.toUpperCase()==='LEADER');
  requireFact(rawLeaders.length===result.partitions.leaderBindings.length,'incomplete raw Leader coverage');
  return result;
}
