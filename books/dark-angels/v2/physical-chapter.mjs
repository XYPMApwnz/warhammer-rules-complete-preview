/** Browser-native projection of reviewed source facts onto validated UNITs.
 * This accepts no Chapter selector, import header or snapshot proof field. */
import {validateRoster} from '../../shared/roster-v2/context.mjs';
import {sameSourceEvidence,copySourceEvidence} from '../../shared/source-refs-v2/source-refs.mjs';
const clone=structuredClone;
const requireValue=(condition,message)=>{if(!condition)throw new TypeError(message);};
export function resolvePhysicalChapterContexts(book,input){
 const metadata=book.rosterChapterBindings;
 requireValue(metadata?.definition?.canonicalId==='army-rule-sm-0fc8f686c793466d'&&
  metadata.definition.sourceOwner==='space-marines','Missing reviewed Chapter definition');
 requireValue(metadata.applicabilityReview?.unitChapterKeywordRequired===false&&
  metadata.applicabilityReview.armyProof==='SOURCE_FIXED_DA_MEMBER_AND_VALIDATED_CLOSED_MEMBERSHIP','Missing reviewed army applicability proof');
 const state=validateRoster(book,clone(input),book.rosterAttachmentPolicies),records=new Map(book.entities.map(entity=>[entity.id,entity]));
 const bindings=new Map();
 for(const [known,rows]of [[true,metadata.known],[false,metadata.unresolved]]){
  requireValue(Array.isArray(rows),'Missing Chapter source membership');
  for(const binding of rows){
   const entity=records.get(binding.canonicalUnitId);
   requireValue(entity?.kind==='DATASHEET'&&!bindings.has(entity.id)&&entity.bookId===binding.sourceOwner&&
    entity.sourceEntityId===binding.sourceEntityId&&sameSourceEvidence(entity,binding,{book}),'Invalid Chapter source owner or identity');
   const expected=known?['ADEPTUS ASTARTES','DARK ANGELS']:['ADEPTUS ASTARTES'];
   requireValue(JSON.stringify(entity.data.factionKeywords)===JSON.stringify(expected)&&
    (!known||binding.chapter==='DARK ANGELS'&&binding.keywordIndex===1),'Unreviewed Chapter faction field');
   bindings.set(entity.id,{binding,known});
  }
 }
 requireValue(bindings.size===book.entities.filter(entity=>entity.kind==='DATASHEET').length,'Incomplete Chapter source membership');
 const anchors=state.units.filter(unit=>bindings.get(unit.canonicalUnitId)?.known).map(unit=>({
  instanceId:unit.instanceId,canonicalUnitId:unit.canonicalUnitId,
  sourceReference:{canonicalId:unit.canonicalUnitId,sourceOwner:records.get(unit.canonicalUnitId).bookId,
   sourceEntityId:records.get(unit.canonicalUnitId).sourceEntityId,path:'/factionKeywords/1',
   ...copySourceEvidence(records.get(unit.canonicalUnitId),{book})}
 }));
 // A source-fixed DA member proves army applicability under the one-Chapter
 // restriction and the closed, validated membership. It does not give generic
 // members a second Faction keyword. A generic-only army remains unproven.
 return state.units.map(unit=>{
  const entity=records.get(unit.canonicalUnitId),entry=bindings.get(entity.id);
  requireValue(entry,'Unresolved physical UNIT Chapter membership');
  const references=[{canonicalId:entity.id,sourceOwner:entity.bookId,sourceEntityId:entity.sourceEntityId,
   path:entry.known?'/factionKeywords/1':'/factionKeywords',...copySourceEvidence(entity,{book})}];
  if(entry.known)references.push({canonicalId:metadata.definition.canonicalId,sourceOwner:metadata.definition.sourceOwner,
   sourceEntityId:metadata.definition.sourceEntityId,path:'/text',...copySourceEvidence(metadata.definition,{book})});
  return {rosterId:state.rosterId,instanceId:unit.instanceId,canonicalUnitId:entity.id,sourceOwner:entity.bookId,
   status:entry.known?'CHAPTER_CONTEXT_PROVEN':'CHAPTER_CONTEXT_NOT_PROVEN',
   chapter:entry.known?entry.binding.chapter:null,sourceReferences:references,
   armyApplicability:{status:anchors.length?'DA_ARMY_CONTEXT_PROVEN':'DA_ARMY_CONTEXT_NOT_PROVEN',
    basis:anchors.length?'SOURCE_FIXED_DA_MEMBER_AND_VALIDATED_CLOSED_MEMBERSHIP':'NO_SOURCE_FIXED_DA_MEMBER_OR_REVIEWED_ARMY_DECLARATION',
    physicalAnchors:clone(anchors),member:{instanceId:unit.instanceId,canonicalUnitId:entity.id,sourceOwner:entity.bookId},
    sourceReferences:[clone(metadata.definition),clone(references[0])]},
   reason:entry.known?'EXPLICIT_SECOND_DATASHEET_FACTION_KEYWORD':entry.binding.reason};
 });
}
