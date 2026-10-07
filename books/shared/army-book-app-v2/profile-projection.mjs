/** One presentation interface for flat and nested canonical MODEL profiles.
 * Addresses/values stay with their factual owner. Layout aliases never evaluate
 * selectors, grant keywords or compute effective gameplay state.
 */
export function normalizeProfilePresentation(model,payload) {
  const entities=new Map(model.entities.map(entity=>[entity.id,entity]));
  const cards=new Map(payload.cards.map(card=>[card.id,card]));
  const move=(field,from,to)=>{from.fields=from.fields.filter(item=>item!==field);to.fields.push(field);};
  for(const unit of model.entities.filter(entity=>entity.kind==='DATASHEET')) {
    const card=cards.get(unit.id);
    for(const profileId of unit.data.profileIds) {
      const profile=entities.get(profileId),view=cards.get(profileId);
      if(profile?.kind!=='PROFILE'||profile.parentId!==unit.id)throw new TypeError('Invalid canonical MODEL profile');
      if(unit.data.profileIds.length>1)for(const field of view.fields)
        if(field.source.path==='/name')field.presentation='heading';
      for(const field of view.fields)if(/^\/stats\/(?:M|T|SV|W|LD|OC)$/.test(field.source.path))
        field.presentationPath=field.source.path.slice('/stats'.length);
      if(profile.data.invulnerableSaveId) {
        const owner=entities.get(profile.data.invulnerableSaveId),ownerCard=cards.get(owner?.id);
        if(owner?.kind!=='INVULNERABLE_SAVE'||!owner.data.profileIds.includes(profileId))throw new TypeError('Invalid profile-scoped save');
        const field=ownerCard.fields.find(field=>field.source.path==='/value');
        if(!field)throw new TypeError('Missing profile save value');
        field.presentationPath='/INSV';view.profileFieldIds=[field.id];
      }
    }
    if(unit.data.keywordScopesId) {
      const scope=entities.get(unit.data.keywordScopesId),scopeCard=cards.get(scope?.id);
      if(scope?.kind!=='KEYWORD_SCOPES'||scope.parentId!==unit.id)throw new TypeError('Invalid canonical keyword scope');
      card.keywordGroups=[];let keywordIndex=0;
      scope.data.scopes.forEach((group,index)=>{
        const label=scopeCard.fields.find(field=>field.source.path===`/scopes/${index}/label`);
        const fields=scopeCard.fields.filter(field=>field.source.path.startsWith(`/scopes/${index}/keywords/`));
        if(!label)throw new TypeError('Missing keyword scope label');
        card.keywordGroups.push({scopeId:group.id,
          profileIds:unit.data.profileIds.filter(id=>entities.get(id).data.keywordScopeIds?.includes(group.id)),
          labelFieldId:label.id,fieldIds:fields.map(field=>field.id)});
        // Navigation consumes intrinsic UNIT presentation categories; MODEL
        // predicates continue to use their separate canonical scope bindings.
        for(const field of fields){field.presentationPath=`/${group.label==='FACTION KEYWORDS'?'factionKeywords':'keywords'}/${keywordIndex++}`;move(field,scopeCard,card);}
        move(label,scopeCard,card);
      });
    }
  }
  return payload;
}
