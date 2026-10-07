const requireValue=(condition,message)=>{if(!condition)throw new TypeError(message);};

/** Ephemeral canonical shape/reference adapter, not a factual owner. Source
 * grammar stays book-owned; runtime receives only typed roles and exact IDs. */
export function buildRosterAttachmentInputs(canonical,bindings) {
  const book=structuredClone(canonical),records=new Map(book.entities.map(entity=>[entity.id,entity]));
  requireValue(records.size===book.entities.length&&bindings?.schema==='roster-v2/attachment-bindings','Invalid attachment inputs');
  book.rosterProfileBindings=[];book.rosterReferenceSemantics={};
  for(const unit of book.entities.filter(entity=>entity.kind==='DATASHEET')) {
    const owner=records.get(unit.data.keywordScopesId);
    requireValue(owner?.kind==='KEYWORD_SCOPES'&&owner.parentId===unit.id,'Invalid canonical keyword owner');
    const scopes=new Map(owner.data.scopes.map(scope=>[scope.id,scope]));
    unit.data.keywords=[...new Set(owner.data.scopes.filter(scope=>scope.label!=='FACTION KEYWORDS').flatMap(scope=>scope.keywords))];
    unit.data.factionKeywords=owner.data.scopes.filter(scope=>scope.label==='FACTION KEYWORDS').flatMap(scope=>scope.keywords);
    for(const profileId of unit.data.profileIds) {
      const profile=records.get(profileId),ids=profile?.data.keywordScopeIds;
      requireValue(profile?.kind==='PROFILE'&&profile.parentId===unit.id&&ids?.length&&ids.every(id=>scopes.has(id)),'Invalid intrinsic MODEL keyword scope');
      book.rosterProfileBindings.push({unitId:unit.id,profileId,intrinsicKeywords:[...new Set(ids.flatMap(id=>scopes.get(id).keywords))]});
    }
    for(const id of unit.data.ruleReferenceIds) {
      const reference=records.get(id);requireValue(reference?.kind==='RULE_REFERENCE'&&reference.parentId===unit.id,'Invalid canonical ability reference');
      book.rosterReferenceSemantics[id]={abilities:reference.data.groups.flatMap(group=>group.entries.map(entry=>({id:entry.id,name:entry.label})))};
    }
  }
  const declarations=book.entities.filter(entity=>entity.kind==='ATTACHMENT_DECLARATION'),policies=new Map();
  const source=(declaration)=>{
    const section=records.get(declaration.data.sourceSectionId);
    requireValue(section?.kind==='DATASHEET_SECTION'&&section.parentId===declaration.parentId&&section.provenance?.sourceId&&declaration.provenance?.sourceId,'Unbound attachment evidence');
    return section;
  };
  const add=(sourceId,targetId,role,sourceIds)=>{
    requireValue(records.get(sourceId)?.kind==='DATASHEET'&&records.get(targetId)?.kind==='DATASHEET','Unresolved attachment identity');
    const key=sourceId+'/'+targetId,previous=policies.get(key);
    requireValue(!previous||previous.role===role,'Conflicting canonical attachment role');
    policies.set(key,{sourceId,targetId,role,additionalLeaders:0,sourceIds:[...new Set([...(previous?.sourceIds||[]),...sourceIds])]});
  };
  for(const declaration of declarations.filter(entity=>['LEADER','SUPPORT'].includes(entity.data.roleHeading))) {
    source(declaration);
    for(const reference of declaration.data.references) {
      if(reference.targetId)add(declaration.parentId,reference.targetId,declaration.data.roleHeading,[declaration.id,declaration.data.sourceSectionId]);
      else requireValue(reference.excludedScope==='LEGENDS'||reference.externalDomain,'Unresolved attachment reference');
    }
  }
  const redirects=declarations.filter(entity=>entity.data.roleHeading==='ATTACHED UNIT');
  requireValue(Array.isArray(bindings.redirects)&&bindings.redirects.length===redirects.length&&new Set(bindings.redirects.map(binding=>binding.declarationId)).size===redirects.length,'Incomplete redirect bindings');
  const direct=[...policies.values()];
  for(const binding of bindings.redirects) {
    const declaration=redirects.find(entity=>entity.id===binding.declarationId);requireValue(declaration,'Foreign redirect binding');source(declaration);
    requireValue(Array.isArray(binding.participantKeywords)&&[null,'LEADER','SUPPORT'].includes(binding.participantRole),'Invalid typed redirect');
    const references=declaration.data.references.filter(reference=>reference.targetId);
    requireValue(references.length===1,'Ambiguous canonical redirect');
    for(const relation of direct.filter(relation=>relation.targetId===references[0].targetId)) {
      const participant=records.get(relation.sourceId);
      if(binding.participantRole&&relation.role!==binding.participantRole)continue;
      if(!binding.participantKeywords.every(keyword=>participant.data.keywords.includes(keyword)))continue;
      add(relation.sourceId,declaration.parentId,relation.role,[...relation.sourceIds,declaration.id,declaration.data.sourceSectionId]);
    }
  }
  requireValue(declarations.every(declaration=>['LEADER','SUPPORT','ATTACHED UNIT'].includes(declaration.data.roleHeading)),'Unclassified attachment declaration');
  return {book,policies:[...policies.values()].sort((a,b)=>(a.sourceId+'/'+a.targetId).localeCompare(b.sourceId+'/'+b.targetId))};
}
