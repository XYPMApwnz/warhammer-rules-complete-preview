import {copySourceEvidence,cloneSourceBook} from '../../shared/source-refs-v2/source-refs.mjs';
/** Book-owned bindings between canonical composition recipients and the shared
 * effective presentation interface. These views own no facts or effects. */
const clone=value=>structuredClone(value);
const requireBinding=(condition,message)=>{if(!condition)throw new TypeError(message);};

export function buildCSMRosterPresentation(facts) {
  const records=new Map(facts.entities.map(entity=>[entity.id,entity]));
  const profileCards=[],unitProfileIds={};
  for(const unit of facts.entities.filter(entity=>entity.kind==='DATASHEET')) {
    const members=unit.data.childIds.map(id=>records.get(id)).filter(entity=>entity?.kind==='COMPOSITION_MEMBER');
    requireBinding(members.length,'Missing canonical composition recipients');
    unitProfileIds[unit.id]=members.map(member=>member.id);
    for(const member of members) {
      const binding=member.data.composition,statline=records.get(binding.modelProfileSourceId);
      requireBinding(statline?.kind==='MODEL_PROFILE'&&statline.ownerId===unit.id,'Invalid canonical composition statline binding');
      requireBinding(unit.data.modelGroups.some(group=>group.modelProfileId===statline.id&&group.compositionMemberIds.includes(member.id)),
        'Canonical composition/statline ownership mismatch');
      const field=(entityId,path,value,presentationPath,label)=>({id:`${member.id}::roster${presentationPath}`,
        label,value:clone(value),type:'text',contextId:unit.id,source:{entityId,path},presentationPath});
      profileCards.push({id:member.id,kind:'PROFILE',title:binding.name,parentId:unit.id,contextId:unit.id,
        source:{entityId:member.id},children:[],links:[],...copySourceEvidence(member,{book:facts}),
        fields:[field(member.id,'/composition/name',binding.name,'/name','name'),
          ...Object.entries(statline.data.stats).map(([name,value])=>field(statline.id,`/stats/${name}`,value,`/${name}`,name))]});
    }
  }
  return {schema:'army-book-app-v2/roster-presentation/v1',profileCards,unitProfileIds};
}

/** The interpreter keeps its existing book unchanged. Only the disposable
 * snapshot reader receives the already-established shared presentation kinds. */
export function normalizeCSMEffectiveBook(book) {
  const result=cloneSourceBook(book);
  const aliases={DATASHEET_ABILITY:'SUPPLEMENTAL_DATASHEET_RULE',EQUIPMENT_ABILITY:'SUPPLEMENTAL_DATASHEET_RULE',
    UNIT_COMPOSITION:'DATASHEET_SECTION',ATTACHMENT_DECLARATION:'DATASHEET_SECTION',TRANSPORT_DECLARATION:'DATASHEET_SECTION',
    SPECIAL_DATASHEET_RULE:'DATASHEET_SECTION',UPGRADE_DECLARATION:'DATASHEET_SECTION'};
  for(const entity of result.entities)entity.kind=aliases[entity.kind]||entity.kind;
  for(const unit of result.entities.filter(entity=>entity.kind==='DATASHEET')) {
    unit.data.title=unit.displayName;
    const children=result.entities.filter(entity=>entity.parentId===unit.id);
    unit.data.sectionIds=children.filter(entity=>['DATASHEET_SECTION','SUPPLEMENTAL_DATASHEET_RULE'].includes(entity.kind)).map(entity=>entity.id);
    unit.data.wargearOptionIds=children.filter(entity=>entity.kind==='WARGEAR_OPTION').map(entity=>entity.id);
  }
  return result;
}
