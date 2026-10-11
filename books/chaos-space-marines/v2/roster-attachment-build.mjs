const requireValue=(condition,message)=>{if(!condition)throw new TypeError(message);};

/** Disposable attachment adapter. Canonical relation facts supply pairs/roles;
 * book-owned typed bindings supply source grammar and roster prerequisites. */
export function buildCSMAttachmentInputs(canonical,bindings) {
  const book=structuredClone(canonical),records=new Map(book.entities.map(entity=>[entity.id,entity]));
  requireValue(records.size===book.entities.length&&bindings?.schema==='roster-v2/attachment-bindings','Invalid attachment inputs');
  const evidence=id=>{
    const entity=records.get(id);
    requireValue(entity?.provenance?.sourceId&&entity.provenance.sourceEvidence?.length,'Unbound attachment evidence: '+id);
    return entity;
  };
  book.rosterProfileBindings=[];book.rosterReferenceSemantics={};
  for(const unit of book.entities.filter(entity=>entity.kind==='DATASHEET')) {
    const memberships=book.entities.filter(entity=>entity.parentId===unit.id&&['KEYWORD_MEMBERSHIP','FACTION_KEYWORD'].includes(entity.kind));
    for(const profileId of unit.data.profileIds) {
      const profile=records.get(profileId);
      requireValue(profile?.parentId===unit.id&&profile.kind==='PROFILE','Unresolved composition profile');
      book.rosterProfileBindings.push({unitId:unit.id,profileId,intrinsicKeywords:[...new Set(memberships
        .filter(entity=>entity.data.compositionMemberSourceIds.includes(profileId)).map(entity=>entity.data.keyword))]});
    }
    for(const id of unit.data.ruleReferenceIds) {
      const reference=records.get(id);
      requireValue(reference?.kind==='RULE_REFERENCE'&&reference.parentId===unit.id,'Invalid canonical reference');
      book.rosterReferenceSemantics[id]={abilities:[{id:reference.data.armyRuleId||reference.id,name:reference.data.label}]};
    }
  }
  const declarations=book.entities.filter(entity=>entity.kind==='ATTACHMENT_DECLARATION');
  const declarationBindings=[...bindings.declarations,...bindings.redirects];
  requireValue(declarationBindings.length===declarations.length&&new Set(declarationBindings.map(binding=>binding.declarationId)).size===declarations.length&&
    declarationBindings.every(binding=>records.get(binding.declarationId)?.kind==='ATTACHMENT_DECLARATION'),'Incomplete attachment declarations');
  const policies=book.entities.filter(entity=>entity.kind==='ATTACHMENT_RELATION').map(relation=>{
    evidence(relation.id);
    const binding=bindings.declarations.find(binding=>records.get(binding.declarationId).parentId===relation.parentId);
    requireValue(binding&&binding.role===relation.data.role.toUpperCase(),'Conflicting attachment role');
    const declaration=evidence(binding.declarationId);
    requireValue(typeof declaration.data.blocks?.[0]?.text==='string','Missing declaration clause');
    requireValue(records.get(relation.data.recipientId)?.kind==='DATASHEET','Unresolved Bodyguard');
    return {sourceId:relation.parentId,targetId:relation.data.recipientId,role:binding.role,additionalLeaders:0,sourceIds:[relation.id,declaration.id]};
  });
  // Redirects add supporting evidence to the canonical pairs already enrolled
  // by the source foundation. They do not invent absent/foreign datasheets.
  for(const binding of bindings.redirects) {
    const declaration=evidence(binding.declarationId);
    const base=policies.filter(policy=>policy.targetId===binding.baseRecipientId&&policy.role===binding.role);
    for(const policy of base) {
      const keywords=records.get(policy.sourceId).data.keywords;
      if(!binding.requiredKeywords.every(keyword=>keywords.includes(keyword))||binding.excludedKeywords.some(keyword=>keywords.includes(keyword)))continue;
      const redirected=policies.find(candidate=>candidate.sourceId===policy.sourceId&&candidate.targetId===declaration.parentId);
      requireValue(redirected?.role===binding.role,'Missing source-backed redirect relation');
      redirected.sourceIds.push(declaration.id);
    }
  }
  book.rosterAttachmentConstraints=structuredClone(bindings.constraints);
  for(const constraint of book.rosterAttachmentConstraints) {
    constraint.sourceIds.forEach(evidence);
    for(const [id,keyword] of Object.entries(constraint.optionKeywords)) {
      const option=evidence(id);
      requireValue(option.kind==='UPGRADE_OPTION'&&option.data.keyword===keyword&&
        records.get(option.parentId)?.parentId===constraint.detachmentId,'Attachment option must retain canonical keyword/Detachment ownership');
    }
  }
  for(const relation of bindings.conditionalRelations) {
    requireValue(records.get(relation.sourceId)?.kind==='DATASHEET'&&records.get(relation.targetId)?.kind==='DATASHEET','Unresolved conditional attachment');
    const sourceIds=relation.availability.map(requirement=>evidence(requirement.enhancementId).id);
    policies.push({...structuredClone(relation),additionalLeaders:0,sourceIds});
  }
  requireValue(new Set(policies.map(policy=>policy.sourceId+'/'+policy.targetId)).size===policies.length,'Duplicate canonical attachment pair');
  return {book,policies:policies.sort((a,b)=>(a.sourceId+'/'+a.targetId).localeCompare(b.sourceId+'/'+b.targetId))};
}
