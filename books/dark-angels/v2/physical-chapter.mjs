/** Browser-native projection of reviewed source facts onto validated UNITs.
 * This accepts no Chapter selector, import header or snapshot proof field. */
import {validateRoster} from '../../shared/roster-v2/context.mjs';
const clone=structuredClone;
const requireValue=(condition,message)=>{if(!condition)throw new TypeError(message);};
export function resolvePhysicalChapterContexts(book,input){
 const metadata=book.rosterChapterBindings;
 requireValue(metadata?.definition?.canonicalId==='army-rule-sm-0fc8f686c793466d'&&
  metadata.definition.sourceOwner==='space-marines','Missing reviewed Chapter definition');
 const state=validateRoster(book,clone(input),book.rosterAttachmentPolicies),records=new Map(book.entities.map(entity=>[entity.id,entity]));
 const bindings=new Map();
 for(const [known,rows]of [[true,metadata.known],[false,metadata.unresolved]]){
  requireValue(Array.isArray(rows),'Missing Chapter source membership');
  for(const binding of rows){
   const entity=records.get(binding.canonicalUnitId);
   requireValue(entity?.kind==='DATASHEET'&&!bindings.has(entity.id)&&entity.bookId===binding.sourceOwner&&
    entity.sourceEntityId===binding.sourceEntityId&&JSON.stringify(entity.provenance)===JSON.stringify(binding.provenance),'Invalid Chapter source owner or identity');
   const expected=known?['ADEPTUS ASTARTES','DARK ANGELS']:['ADEPTUS ASTARTES'];
   requireValue(JSON.stringify(entity.data.factionKeywords)===JSON.stringify(expected)&&
    (!known||binding.chapter==='DARK ANGELS'&&binding.keywordIndex===1),'Unreviewed Chapter faction field');
   bindings.set(entity.id,{binding,known});
  }
 }
 requireValue(bindings.size===book.entities.filter(entity=>entity.kind==='DATASHEET').length,'Incomplete Chapter source membership');
 return state.units.map(unit=>{
  const entity=records.get(unit.canonicalUnitId),entry=bindings.get(entity.id);
  requireValue(entry,'Unresolved physical UNIT Chapter membership');
  const references=[{canonicalId:entity.id,sourceOwner:entity.bookId,sourceEntityId:entity.sourceEntityId,
   path:entry.known?'/factionKeywords/1':'/factionKeywords',provenance:clone(entity.provenance)}];
  if(entry.known)references.push({canonicalId:metadata.definition.canonicalId,sourceOwner:metadata.definition.sourceOwner,
   sourceEntityId:metadata.definition.sourceEntityId,path:'/text',provenance:clone(metadata.definition.provenance)});
  return {rosterId:state.rosterId,instanceId:unit.instanceId,canonicalUnitId:entity.id,sourceOwner:entity.bookId,
   status:entry.known?'CHAPTER_CONTEXT_PROVEN':'CHAPTER_CONTEXT_NOT_PROVEN',
   chapter:entry.known?entry.binding.chapter:null,sourceReferences:references,
   reason:entry.known?'EXPLICIT_SECOND_DATASHEET_FACTION_KEYWORD':entry.binding.reason};
 });
}
