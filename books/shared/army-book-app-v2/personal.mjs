/** Disposable presentation views. Roster services own eligibility and effects. */
const clone = value => structuredClone(value);
const assert = (value, message) => { if (!value) throw new TypeError(message); };
export const instanceRoute = id => `roster-unit/${encodeURIComponent(id)}`;
/** Book-owned canonical profile bindings apply only to physical views. The
 * normal book map and every factual field/address remain unchanged. */
export function prepareRosterPresentationCards(cards,presentation) {
  if(!presentation)return cards;
  assert(presentation.schema==='army-book-app-v2/roster-presentation/v1','Invalid roster presentation bindings');
  const result=new Map(cards),seen=new Set();
  for(const profile of presentation.profileCards){
    assert(profile.kind==='PROFILE'&&cards.has(profile.id)&&!seen.has(profile.id),'Invalid canonical roster profile');
    assert(cards.get(profile.parentId)?.kind==='DATASHEET','Invalid roster profile owner');
    seen.add(profile.id);result.set(profile.id,clone(profile));
  }
  for(const [id,profileIds]of Object.entries(presentation.unitProfileIds)){
    const unit=clone(cards.get(id));assert(unit?.kind==='DATASHEET','Invalid roster datasheet binding');
    assert(new Set(profileIds).size===profileIds.length&&profileIds.every(profileId=>seen.has(profileId)&&result.get(profileId).parentId===id),'Foreign roster profile binding');
    unit.children=unit.children.filter(child=>cards.get(child)?.kind!=='PROFILE'&&!profileIds.includes(child));
    unit.children.push(...profileIds);result.set(id,unit);
  }
  return result;
}
/** A formed datasheet is a collection of independently owned presentations,
 * never a synthetic roster unit. Resolve membership anew on every render. */
export function projectFormedUnitCards(cards, roster, instanceId) {
  const state=roster.state, effective=roster.effective(instanceId), group=effective.formedUnit;
  assert(!group||group.memberInstanceIds.includes(instanceId),'Requested physical component is outside its formed unit');
  const ids=group?[group.bodyguardInstanceId,...state.units.filter(unit=>
    group.memberInstanceIds.includes(unit.instanceId)&&unit.instanceId!==group.bodyguardInstanceId).map(unit=>unit.instanceId)]:[instanceId];
  assert(new Set(ids).size===ids.length&&(!group||ids.length===group.memberInstanceIds.length),'Invalid formed presentation membership');
  const components=ids.map(id=>{
    const unit=state.units.find(unit=>unit.instanceId===id);
    assert(unit,'Missing physical presentation component');
    const current=id===instanceId?effective:roster.effective(id);
    assert(!group||current.formedUnit?.formedUnitId===group.formedUnitId,'Inconsistent formed presentation component');
    const variants=projectInstanceCards(cards,unit,current);
    return {unit,variants,card:variants.get(unit.canonicalUnitId)[0]};
  });
  // A formed UNIT modifier is shown once only when every physical component
  // has the same final value and exact source contributions. Equal numbers
  // alone cannot merge independently owned PHYSICAL effects.
  if(group&&components.length>1)for(const key of new Set(components.flatMap(component=>(component.card.rosterUnitMetrics||[]).map(metric=>metric.key)))){
    const metric=components[0].card.rosterUnitMetrics?.find(metric=>metric.key===key);
    const identity=value=>JSON.stringify([value.key,value.value,value.recipientInstanceIds,value.sources.map(source=>[
      source.ruleId,source.clauseId,source.effectId,source.sourceInstanceId,source.sourceProfileId,
      source.sourceCompositionId,source.sourceModelInstanceId,source.sourceFields,source.lifetime,source.unitScope])]);
    const expected=metric&&identity(metric);
    if(!metric||metric.unitScope!=='FORMED'||!components.every(component=>(component.card.rosterUnitMetrics||[]).filter(value=>
      value.unitScope==='FORMED'&&identity(value)===expected).length===1)){
      // Mixed PHYSICAL/FORMED contributions can produce different final
      // totals. Keep each executor total on its component; never display a
      // partial group value as if it were every member's complete result.
      for(const component of components)for(const value of component.card.rosterUnitMetrics||[])if(value.key===key){
        value.unitScope='PHYSICAL';value.recipientInstanceIds=[component.unit.instanceId];
      }
      continue;
    }
    for(const component of components.slice(1))component.card.rosterUnitMetrics=component.card.rosterUnitMetrics.filter(value=>
      value.unitScope!=='FORMED'||identity(value)!==expected);
  }
  return {formedUnitId:group?.formedUnitId||null,components};
}
export function projectPersonalBook(payload, state) {
  assert(state?.units?.length && state.detachmentIds?.length, 'No imported roster');
  const cards = new Map(payload.cards.map(card => [card.id,card]));
  const detachments = new Set(state.detachmentIds), enhancements = new Set(state.units.flatMap(unit=>unit.enhancementIds));
  const units = new Set(state.units.map(unit=>unit.canonicalUnitId)), allowedIds = new Set();
  const permitted = card => card && (card.kind!=='DETACHMENT' || detachments.has(card.id)) &&
    (card.kind!=='ENHANCEMENT' || enhancements.has(card.id)) &&
    (card.kind!=='DATASHEET' || units.has(card.id)) &&
    (!['STRATAGEM','DETACHMENT_RULE'].includes(card.kind) || detachments.has(card.parentId));
  const visit = id => { const card=cards.get(id); if (!permitted(card) || allowedIds.has(id)) return;
    allowedIds.add(id); (card.children || []).forEach(visit); };
  const roots = payload.cards.filter(card=>card.kind==='ARMY_RULE').map(card=>card.id);
  [...roots,...detachments,...units].forEach(visit);
  // A selected equipment permission can cite a separate canonical rule.
  // Keep that exact, provenance-confirmed source readable in Personal mode;
  // this adds a reference, never an equipment selection or an effect.
  for(const unit of state.units)for(const selection of [...(unit.selections||[]),
    ...(unit.modelRows||[]).flatMap(row=>[...(row.selections||[]),...(row.loadouts||[]).flatMap(loadout=>loadout.selections||[])])]){
    const origin=cards.get(selection.sourceEquipmentIdentity),proof=selection.sourceEquipmentProvenance;
    if(selection.physicalQuantity>0&&origin&&proof&&
        selection.canonicalEquipmentIds?.some(id=>allowedIds.has(id)&&cards.get(id)?.contextId===unit.canonicalUnitId)&&
        ['sourceId','sourceEntityId','document','sha256','pointer'].every(key=>typeof proof[key]==='string'&&proof[key]===origin.provenance?.[key]))visit(origin.id);
  }
  for (const id of [...detachments,...enhancements,...units]) assert(allowedIds.has(id),'Unresolved personal book identity: '+id);
  const copies = new Map();
  state.units.forEach(unit=>{const list=copies.get(unit.canonicalUnitId)||[];list.push(unit.instanceId);copies.set(unit.canonicalUnitId,list);});
  const instances=state.units.map(unit=>({id:unit.canonicalUnitId,instanceId:unit.instanceId,route:instanceRoute(unit.instanceId),
    title:cards.get(unit.canonicalUnitId).title+(copies.get(unit.canonicalUnitId).length>1?` #${copies.get(unit.canonicalUnitId).indexOf(unit.instanceId)+1}`:'')}));
  const entries = ids => [...ids].map(id=>({id,title:cards.get(id).title,route:id}));
  return {allowedIds,instances,groups:[
    {id:'army-rules',label:'Army Rules',entries:entries(roots)},
    {id:'detachments',label:'Detachments',entries:entries(detachments)},
    {id:'enhancements',label:'Enhancements',entries:entries(enhancements)},
    {id:'datasheets',label:'Datasheets',entries:instances}
  ].filter(group=>group.entries.length)};
}
/** Overlay values by canonical field address, never display title. Multiple
 * composition scopes retain separate variants of the SAME canonical profile. */
export function projectInstanceCards(cards, unit, effective) {
  assert(effective.instanceId===unit.instanceId && effective.canonicalUnitId===unit.canonicalUnitId,'Wrong physical projection');
  const variants=new Map(), root=clone(cards.get(unit.canonicalUnitId));
  assert(root?.kind==='DATASHEET','Unresolved canonical datasheet');
  root.rosterEnhancementIds=[...(unit.enhancementIds||[])];
  root.rosterEnhancements=clone(effective.enhancements||[]);
  for(const id of root.rosterEnhancementIds){
    const enhancement=cards.get(id);
    assert(enhancement?.kind==='ENHANCEMENT','Unresolved canonical selected Enhancement');
    variants.set(id,[{...clone(enhancement),instanceId:unit.instanceId}]);
  }
  for(const enhancement of root.rosterEnhancements){
    assert(root.rosterEnhancementIds.includes(enhancement.canonicalId)&&enhancement.ownerInstanceId===unit.instanceId,
      'Wrong physical Enhancement presentation owner');
    for(const reference of enhancement.grantedRules){
      assert(cards.has(reference.canonicalId)&&reference.sourceRuleId===enhancement.canonicalId&&
        reference.sourceInstanceId===unit.instanceId&&reference.recipientInstanceIds.includes(unit.instanceId),
        'Wrong granted canonical rule presentation');
    }
  }
  const scopeCaptions=new Map();
  const profileName=id=>{
    const profile=cards.get(id);
    return profile?.fields.find(field=>(field.presentationPath||field.source?.path)==='/name')?.value || root.title;
  };
  // Imported composition rows are display groups, never inferred equipment
  // owners. Aggregate imports retain their canonical profile and total only.
  root.rosterComposition=unit.modelRows.map(row=>({rowId:row.rowId,
    profileId:row.canonicalProfileId,quantity:row.quantity,
    label:row.compositionScope==='MODEL_ROW'&&row.presentationLabel?.trim()
      ?row.presentationLabel:profileName(row.canonicalProfileId)}));
  unit.modelRows.forEach((row,index)=>{
    if(row.compositionScope!=='MODEL_ROW')return;
    const label=typeof row.presentationLabel==='string'&&row.presentationLabel.trim()
      ?row.presentationLabel:'Composition group '+(index+1);
    const profileScope=`${unit.instanceId}/${row.rowId}/PROFILE/${row.rowId}`;
    const profile=effective.profiles.find(item=>item.scopeId===profileScope);
    if(profile)scopeCaptions.set(profileScope,{label,quantity:profile.quantity});
    (row.loadouts||[]).forEach((loadout,loadoutIndex)=>{
      const scopeId=`${unit.instanceId}/${row.rowId}/LOADOUT/${loadout.loadoutId}`;
      const profile=effective.profiles.find(item=>item.scopeId===scopeId);
      if(profile)scopeCaptions.set(scopeId,{
        label:row.loadouts.length>1||scopeCaptions.has(profileScope)?`${label} · Loadout ${loadoutIndex+1}`:label,quantity:profile.quantity
      });
    });
  });
  // Some imports establish distinct loadout scopes without a named model row.
  // Label those existing groups, without assigning weapons to invented models.
  const counts=new Map(),ordinals=new Map();
  effective.profiles.forEach(profile=>counts.set(profile.id,(counts.get(profile.id)||0)+1));
  effective.profiles.forEach(profile=>{
    const ordinal=(ordinals.get(profile.id)||0)+1;ordinals.set(profile.id,ordinal);
    if(counts.get(profile.id)>1&&!scopeCaptions.has(profile.scopeId))scopeCaptions.set(profile.scopeId,{
      label:`${profileName(profile.id)} · Group ${ordinal}`,quantity:profile.quantity,canonicalLabelIncluded:true});
  });
  const annotate = (card, scope) => ({...clone(card),instanceId:unit.instanceId,scopeId:scope || null});
  const overlay = (record, source) => {
    const base=cards.get(record.id);assert(base,'Unresolved effective profile: '+record.id);
    const card=annotate(base,record.scopeId), values=new Map(record.fields.map(field=>[field.label,field.value]));
    if(source==='WEAPON_PROFILE'&&record.selectionKey!==undefined)card.selectionKey=record.selectionKey;
    if(scopeCaptions.has(record.scopeId))card.presentationScope=clone(scopeCaptions.get(record.scopeId));
    card.fields=card.fields.flatMap(field=> {
      const path=field.source?.path || '', parts=path.slice(1).split('/');
      if (!values.has(parts[0])) return [field];
      const value=values.get(parts[0]);
      if (Array.isArray(value)) return []; // Reproject the entire typed array below.
      const effectiveValue=parts.slice(1).reduce((child,key)=>child?.[key],value);
      if(effectiveValue===undefined)return [field];
      return [{...field,value:clone(effectiveValue),displayValue:undefined,runtimeDerived:true}];
    });
    if (source==='WEAPON_PROFILE' && values.has('mode') && !card.fields.some(field=>field.source?.path==='/mode')) {
      card.fields.push({id:`${base.id}::/mode`,label:'mode',type:'text',value:values.get('mode'),
        contextId:base.contextId,source:{entityId:base.id,path:'/mode'},runtimeDerived:true});
    }
    if(source==='WEAPON_PROFILE' && values.has('criticalHitThreshold')) {
      const threshold=values.get('criticalHitThreshold'),sources=record.criticalHitSources;
      assert(Number.isSafeInteger(threshold)&&threshold>=2&&threshold<=6&&sources?.length&&
        sources.every(row=>row.targetInstanceId===unit.instanceId&&row.targetWeaponProfileId===record.id&&
          (row.targetCompositionId??null)===(record.scopeId??null)&&
          (Object.hasOwn(row,'targetWeaponSelectionKey')||Object.hasOwn(row,'targetWeaponScopeId')
            ? typeof record.selectionKey==='string'&&record.selectionKey.length>0&&row.targetWeaponSelectionKey===record.selectionKey&&
              Object.hasOwn(row,'targetWeaponScopeId')&&row.targetWeaponScopeId===(record.scopeId??null)
            : effective.weapons.filter(other=>other.id===record.id&&(other.scopeId??null)===(record.scopeId??null)).length===1)),
        'Unresolved Critical Hit presentation recipient');
      card.criticalHitThreshold=threshold;card.criticalHitSources=clone(sources);
    }
    for (const [key,value] of values) if (Array.isArray(value)) {
      const template=base.fields.find(field=>field.source?.path.startsWith('/'+key+'/'));
      if (!value.length) card.fields.push({...(base.fields.find(field=>field.source?.path==='/'+key) || {label:key,type:'text'}),
        id:`${base.id}::/${key}`,value:[],displayValue:'None',contextId:base.contextId,
        source:{entityId:base.id,path:`/${key}`},runtimeDerived:true});
      value.forEach((item,index)=>card.fields.push({...(template || {label:key,type:'tokens'}),
        id:`${base.id}::/${key}/${index}`,value:clone(item),displayValue:undefined,
        contextId:base.contextId,source:{entityId:base.id,path:`/${key}/${index}`},runtimeDerived:true}));
    }
    if(source==='WEAPON_PROFILE'&&record.abilitySources?.length) {
      for(const origin of record.abilitySources)assert(origin.targetInstanceId===unit.instanceId&&origin.targetWeaponProfileId===record.id&&
        (origin.targetCompositionId??null)===(record.scopeId??null)&&origin.canonicalRuleId,'Wrong weapon grant presentation recipient');
      card.fields=card.fields.map(field=>{
        if(!field.source?.path.startsWith('/abilities/'))return field;
        const origins=record.abilitySources.filter(origin=>typeof field.value==='string'&&field.value.toUpperCase()===origin.ability.toUpperCase());
        return origins.length?{...field,weaponGrantSources:clone(origins)}:field;
      });
    }
    if (source==='PROFILE') {
      card.effectiveAbilities=clone(record.abilities||[]);
      if(record.suppressedAbilityIds)card.suppressedAbilityIds=clone(record.suppressedAbilityIds);
      // Intrinsic reference memberships already have their canonical location.
      // Only granted abilities add a new effective presentation row.
      card.rosterAbilities=clone((record.abilities || []).filter(ability=>ability.canonicalId || ability.value!==undefined));card.rosterMetrics=clone(record.metrics || {});card.rosterQuantity=record.quantity;
      if(values.has('INSV')) {
        const canonicalField=(card.profileFieldIds||[]).flatMap(id=>[...cards.values()].flatMap(value=>value.fields.filter(field=>field.id===id))).find(field=>field.presentationPath==='/INSV');
        card.profileFieldIds=(card.profileFieldIds||[]).filter(id=>id!==canonicalField?.id);
        if(!card.fields.some(field=>(field.presentationPath??field.source?.path)==='/INSV'))card.fields.push({...(canonicalField||{}),
          id:`${base.id}::/INSV`,label:'Invulnerable Save',type:'text',value:values.get('INSV'),presentationPath:'/INSV',
          contextId:base.contextId,source:canonicalField?.source||{entityId:base.id,path:'/INSV'},runtimeDerived:true});
      }
      const derivedField=(path,label,value,displayValue)=>({id:`${base.id}::/${path}`,label,type:'text',value:clone(value),displayValue,
        contextId:base.contextId,source:{entityId:base.id,path:`/${path}`},runtimeDerived:true});
      card.rosterAbilities.forEach((ability,index)=>card.fields.push(derivedField(`rosterAbilities/${index}`,`${ability.name}: `,ability,
        ability.value===undefined?ability.name+Object.values(ability.parameters||{}).map(value=>` ${value}"`).join(''):`${ability.value}+`)));
      const metricLabels={contagionRange:'Contagion Range',detectionRange:'Detection Range'};
      for (const [key,metric] of Object.entries(card.rosterMetrics)) {
        assert(Object.hasOwn(metricLabels,key),'Unsupported effective metric presentation: '+key);
        card.fields.push(derivedField(`rosterMetrics/${key}`,metricLabels[key],metric,
          `${metric.modifier>=0?'+':''}${metric.modifier}"${metric.max===undefined?'':` (maximum ${metric.max}")`}`));
      }
    }
    else card.rosterQuantity=record.physicalQuantity;
    return card;
  };
  for (const kind of ['PROFILE','WEAPON_PROFILE']) {
    const records=kind==='PROFILE'?effective.profiles:effective.weapons;
    for (const id of root.children.filter(id=>cards.get(id)?.kind===kind)) variants.set(id,[]);
    for (const record of records) {
      const list=variants.get(record.id)||[];list.push(overlay(record,kind));variants.set(record.id,list);
      if(kind==='WEAPON_PROFILE' && !root.children.includes(record.id))root.children.push(record.id);
    }
  }
  // Effective ability text is supplied by the runtime at a canonical field
  // address and exact MODEL scope. Never locate a range by parsing prose.
  const abilityEntries=(effective.abilities||[]).filter(record=>record.abilityRangeField&&root.children.includes(record.id));
  for(const id of new Set(abilityEntries.map(record=>record.id))){
    const base=cards.get(id);assert(base,'Unresolved effective canonical ability');
    variants.set(id,abilityEntries.filter(record=>record.id===id).map(record=>{
      const card=annotate(base,record.scopeId),path=record.abilityRangeField;
      const value=path.slice(1).split('/').reduce((value,key)=>value?.[key],record.text);
      assert(typeof value==='string'&&card.fields.some(field=>field.source?.entityId===id&&field.source.path===path),'Unresolved effective ability source field');
      card.fields=card.fields.map(field=>field.source?.entityId===id&&field.source.path===path?
        {...field,value,displayValue:undefined,runtimeDerived:true}:field);
      card.effectiveAbilityId=id;
      const profile=effective.profiles.find(profile=>profile.scopeId===record.scopeId&&profile.id===record.profileId);
      assert(profile,'Unresolved effective ability MODEL scope');
      card.presentationScope=clone(scopeCaptions.get(record.scopeId)||{
        label:profileName(record.profileId),quantity:profile.quantity,canonicalLabelIncluded:true});
      return card;
    }));
  }
  // Selection instructions are canonical options in book mode. Personal views
  // retain only references present in this exact effective inventory/scope.
  for(const id of root.children) {
    const selection=cards.get(id);if(selection?.kind!=='WEAPON_PROFILE_SELECTION')continue;
    const references=selection.fields.filter(field=>field.targetIds?.some(target=>cards.get(target)?.kind==='WEAPON_PROFILE'));
    const referenceIds=new Set(references.map(field=>field.id));
    const scopes=[...new Set(effective.weapons.filter(weapon=>references.some(field=>field.targetIds.includes(weapon.id)))
      .map(weapon=>weapon.scopeId||null))];
    variants.set(id,scopes.map(scope=>{
      const inventory=new Set(effective.weapons.filter(weapon=>(weapon.scopeId||null)===scope).map(weapon=>weapon.id));
      const included=references.filter(field=>field.targetIds.some(target=>inventory.has(target)));
      const includedIds=new Set(included.map(field=>field.id));
      const groups=new Set(included.map(field=>field.source.path.replace(/\/(?:weaponProfileIds|profileIds)\/\d+$/,'')));
      const indices=new Set(included.map(field=>field.source.path.replace(/\/(?:weaponProfileIds|profileIds)\//,'/sourceProfileLabels/')));
      const projected=annotate(selection,scope);
      if(scopeCaptions.has(scope))projected.presentationScope=clone(scopeCaptions.get(scope));
      projected.fields=projected.fields.filter(field=>{
        if(referenceIds.has(field.id))return includedIds.has(field.id);
        const group=field.source?.path?.match(/^(\/(?:groups|profileGroups)\/\d+)(?:\/|$)/)?.[1];
        if(group&&!groups.has(group))return false;
        if(/\/sourceProfileLabels\/\d+$/.test(field.source?.path||''))return indices.has(field.source.path);
        return true;
      });
      return projected;
    }));
  }
  const selections=[...(unit.selections || []),...unit.modelRows.flatMap(row=>[...(row.selections||[]),...(row.loadouts||[]).flatMap(loadout=>loadout.selections||[])])];
  const selectedEquipment=new Set(selections.filter(selection=>selection.physicalQuantity>0).flatMap(selection=>selection.canonicalEquipmentIds));
  root.rosterEquipmentIds=[...selectedEquipment];
  const optionIds=new Set([unit.selectedMarkId,...(unit.selectedUpgradeIds||[]),...unit.modelRows.flatMap(row=>row.selectedUpgradeIds||[])].filter(Boolean));
  root.rosterOptionIds=[...optionIds];
  for(const id of root.children){
    const section=cards.get(id);
    if(!section?.fields.some(field=>cards.get(field.source?.entityId)?.kind==='UPGRADE_OPTION'))continue;
    const projected=clone(variants.get(id)?.[0]||annotate(section));
    projected.fields=projected.fields.filter(field=>cards.get(field.source?.entityId)?.kind!=='UPGRADE_OPTION'||optionIds.has(field.source.entityId));
    variants.set(id,projected.fields.some(field=>field.presentation!=='heading')?[projected]:[]);
  }
  const selectedSourceFields=new Set(selections.filter(selection=>selection.physicalQuantity>0)
    .flatMap(selection=>(selection.sourceReferences || []).map(ref=>JSON.stringify([ref.entityId,ref.path]))));
  for (const id of root.children) {
    const section=cards.get(id);if (section?.kind!=='DATASHEET_SECTION') continue;
    const optionalBlocks=(section.fields || []).filter(field=>field.value===true && /^\/blocks\/\d+\/wargearAbility$/.test(field.source?.path || ''));
    if (!optionalBlocks.length) continue;
    const omitted=optionalBlocks.filter(field=>!selectedSourceFields.has(JSON.stringify([id,field.source.path.replace(/wargearAbility$/,'text')]))).map(field=>field.source.path.replace(/wargearAbility$/,''));
    const projected=annotate(section);projected.fields=projected.fields.filter(field=>!omitted.some(prefix=>field.source?.path.startsWith(prefix)));
    variants.set(id,projected.fields.some(field=>field.presentation!=='heading')?[projected]:[]);
  }
  root.children=root.children.filter(id=>!variants.has(id)||variants.get(id).length)
    .filter(id=>cards.get(id)?.kind!=='WARGEAR_OPTION'||selectedEquipment.has(id));
  const firstKeyword=root.fields.find(field=>field.source?.path.startsWith('/keywords/'));
  const keywordAttribution=(keyword,profile)=>{
    const sources=(effective.keywordSources||[]).filter(source=>source.keyword===keyword&&(!profile||
      source.subject==='MODEL'&&source.targetInstanceId===unit.instanceId&&source.targetCompositionId===profile.scopeId));
    assert(sources.every(source=>cards.has(source.canonicalRuleId)&&
      (source.targetInstanceId===unit.instanceId||effective.formedUnit?.memberInstanceIds.includes(source.targetInstanceId))),
      'Unresolved keyword grant presentation source');
    return sources.length?{keywordSources:clone(sources)}:{};
  };
  root.fields=root.fields.filter(field=>!field.source?.path.startsWith('/keywords/'));
  effective.keywords.forEach((keyword,index)=>root.fields.push({...firstKeyword,id:`${root.id}::/keywords/${index}`,
    label:'Keywords',type:'tokens',value:keyword,contextId:root.contextId,
    source:{entityId:root.id,path:`/keywords/${index}`},runtimeDerived:true,...keywordAttribution(keyword)}));
  if(root.keywordGroups) {
    const factionFields=root.fields.filter(field=>field.presentationPath?.startsWith('/factionKeywords/'));
    const faction=new Set(factionFields.map(field=>field.value));
    // Nested keyword storage uses the same effective interface as flat storage.
    // MODEL scopes retain independent bags; the formed UNIT union is separate.
    root.fields=root.fields.filter(field=>!field.presentationPath?.startsWith('/keywords/'));
    const groups=[];
    const add=(label,keywords,key,profile)=>{
      const labelId=`${root.id}::/rosterKeywordGroups/${key}/label`,fieldIds=[];
      root.fields.push({id:labelId,label:'',type:'text',value:label,contextId:root.contextId,runtimeDerived:true});
      keywords.forEach((keyword,index)=>{const id=`${root.id}::/rosterKeywordGroups/${key}/${index}`;fieldIds.push(id);
        root.fields.push({id,label:'',type:'tokens',value:keyword,contextId:root.contextId,runtimeDerived:true,...keywordAttribution(keyword,profile)});});
      groups.push({labelFieldId:labelId,fieldIds});
    };
    // Replace, rather than repeat, the temporary flat UNIT keyword overlay.
    root.fields=root.fields.filter(field=>!field.source?.path.startsWith('/keywords/'));
    add('Keywords',effective.keywords.filter(keyword=>!faction.has(keyword)),'unit');
    if(effective.profiles.length>1)for(const [index,profile]of effective.profiles.entries()) {
      const canonicalName=profileName(profile.id),scope=scopeCaptions.get(profile.scopeId);
      const name=scope?.canonicalLabelIncluded?scope.label:
        scope?.label && scope.label!==canonicalName ? `${scope.label} (${canonicalName})` : canonicalName;
      add(`${name} · Model keywords`,(profile.keywords||[]).filter(keyword=>!faction.has(keyword)),`profile-${index}`,profile);
    }
    const factionGroup=root.keywordGroups.find(group=>group.fieldIds.some(id=>factionFields.some(field=>field.id===id)));
    if(factionGroup)groups.push(clone(factionGroup));
    root.keywordGroups=groups;
  }
  const policies=(effective.conditional||[]).filter(row=>row.policy);
  if(policies.length){
    const hasSource=row=>{
      if(row.sourceInstanceId)return true;
      const rule=cards.get(row.ruleId),owner=cards.get(rule?.parentId);
      return row.sourceInstanceId===null&&row.sourceModelScopeId===null&&row.policy.recipientScope==='ROSTER_UNITS'&&
        rule?.kind==='DETACHMENT_RULE'&&owner?.kind==='DETACHMENT'&&rule.identity?.canonicalId===row.ruleId&&owner.identity?.canonicalId===rule.parentId&&typeof rule.identity?.registryId==='string'&&rule.identity.registryId===owner.identity?.registryId&&
        JSON.stringify(row.sourceProvenance)===JSON.stringify(rule.provenance)&&row.recipientInstanceIds?.includes(unit.instanceId);
    };
    assert(policies.every(row=>row.execution==='CONDITIONAL_TEXT_ONLY'&&row.state==='UNKNOWN'&&hasSource(row)&&row.sourceProvenance?.sourceId&&Array.isArray(row.recipientInstanceIds)),'Unresolved conditional policy presentation');
    root.rosterConditionalPolicies=clone(policies);
  }
  root.rosterUnitAbilities=clone(effective.unitAbilities||[]);
  root.rosterUnitMetrics=Object.entries(effective.unitMetrics||{}).flatMap(([key,value])=>{
    assert(['chargeRoll','advanceRoll','detectionRange'].includes(key)&&Number.isSafeInteger(value.modifier),'Unsupported effective UNIT metric');
    const sources=(effective.unitMetricSources||[]).filter(source=>source.field===key);
    assert(sources.length&&sources.every(source=>source.operation==='MODIFY_RULE_METRIC'&&
      source.targetInstanceId===unit.instanceId&&!source.targetModelInstanceId&&
      (['PHYSICAL','FORMED'].includes(source.unitScope)||key==='detectionRange'&&source.unitScope===undefined)),
      'Unresolved effective UNIT metric sources');
    // Legacy unscoped range contracts keep their existing MODEL presentation.
    // One explicit UNIT source migrates the recipient's complete UNIT total,
    // including other legacy UNIT contributions, without repeating them.
    if(key==='detectionRange'&&!sources.some(source=>['PHYSICAL','FORMED'].includes(source.unitScope)))return [];
    const unitScope=sources.every(source=>source.unitScope==='FORMED'||source.unitScope===undefined)?'FORMED':'PHYSICAL';
    return [{key,label:key==='chargeRoll'?'Charge-roll modifier':key==='advanceRoll'?'Advance-roll modifier':'Detection Range modifier',value:clone(value),displayValue:`${value.modifier>=0?'+':''}${value.modifier}${key==='detectionRange'?'"':''}`,
      unitScope,recipientInstanceIds:unitScope==='FORMED'&&effective.formedUnit?[...effective.formedUnit.memberInstanceIds]:[unit.instanceId],
      formedUnitId:effective.formedUnit?.formedUnitId||null,sources:clone(sources)}];
  });
  variants.set(root.id,[annotate(root)]);
  return variants;
}
