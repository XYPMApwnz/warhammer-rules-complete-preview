/** Presentation snapshot of one physical component from an existing projection.
 * This does not evaluate rules or combine component inventories. */
const clone=value=>structuredClone(value);
const fields=value=>Object.entries(value).map(([label,value])=>({label,value}));
export function projectEffectiveInstance(book,projection,instanceId) {
  const records=new Map(book.entities.map(entity=>[entity.id,entity]));
  const unit = projection?.units.find(u=>u.instanceId === instanceId);
  if (!unit) throw new TypeError('Unresolved physical instance');
  const canonical=records.get(unit.canonicalUnitId),group=projection.formedUnits.find(g=>g.formedUnitId===unit.formedUnitId);
  const name = id=>records.get(id)?.data.title || records.get(id)?.data.name || id;
  const rangedAbilities=new Set(unit.profiles.flatMap(model=>model.abilities.filter(ability=>ability.rangePresentation).map(ability=>ability.canonicalId)));
  return {instanceId,canonicalUnitId:unit.canonicalUnitId,title:canonical.data.title,startingStrength:unit.startingStrength,
    ...(unit.abilities?{unitAbilities:clone(unit.abilities)}:{}),
    formedUnit:group?clone(group):null,keywords:group?[...group.keywords]:[...unit.keywords],intrinsicKeywords:[...unit.intrinsicKeywords],
    profiles:unit.profiles.map(m=>({id:m.canonicalProfileId,scopeId:m.scopeId,ownerInstanceId:instanceId,quantity:m.quantity,modelInstanceId:m.modelInstanceId,title:canonical.data.title,
      fields:[...fields(m.profile),...book.entities.filter(e=>e.kind==='MODEL_BASE'&&e.parentId===m.canonicalProfileId).map(e=>({label:'Base',value:e.data.text,source:{entityId:e.id}}))],keywords:[...m.keywords],intrinsicKeywords:[...(m.intrinsicKeywords||unit.intrinsicKeywords)],metrics:clone(m.metrics),abilities:clone(m.abilities),
      ...(m.suppressedAbilityIds?{suppressedAbilityIds:[...m.suppressedAbilityIds]}:{})})),
    weapons:[...unit.weapons,...unit.profiles.flatMap(m=>m.weapons.map(w=>({...w,modelInstanceId:m.modelInstanceId})))].map(w=>({id:w.canonicalProfileId,title:w.data.name,ownerInstanceId:instanceId,physicalQuantity:w.physicalQuantity,modelInstanceId:w.modelInstanceId,scopeId:w.scopeId || null,selectionKey:w.selectionKey,fields:fields(w.data)})),
    abilities:[...new Set([...canonical.data.sectionIds,...canonical.data.ruleReferenceIds,...canonical.data.wargearOptionIds,...(canonical.data.rawFactIds||[]),
      ...book.entities.filter(e=>e.parentId===canonical.id&&['SUPPLEMENTAL_DATASHEET_RULE','WEAPON_PROFILE_SELECTION','WARGEAR_FOOTNOTE'].includes(e.kind)).map(e=>e.id)])].filter(id=>{
        const abilityIds=[...(book.rosterReferenceSemantics?.[id]?.abilities||[]).flatMap(ability=>ability.canonicalId?[ability.canonicalId]:[]),
          ...(book.rosterAbilityReferences?.[id]?[id]:[]),...(records.get(id)?.data.armyRuleId?[records.get(id).data.armyRuleId]:[])];
        return !abilityIds.length || !abilityIds.every(abilityId=>unit.profiles.length && unit.profiles.every(model=>model.suppressedAbilityIds?.includes(abilityId)));
      }).flatMap(id=>{
        const canonical={id,title:name(id),text:clone(records.get(id).data)};
        if(!rangedAbilities.has(id))return [canonical];
        const binding=book.rosterAbilityReferences[id].rangeBinding;
        return unit.profiles.flatMap(model=>{
          const ability=model.abilities.find(ability=>ability.canonicalId===id);
          if(!ability||model.suppressedAbilityIds?.includes(id))return [];
          const entry=clone(canonical);
          if(ability.rangePresentation){
            const owner=binding.field.slice(0,-1).reduce((value,key)=>value[key],entry.text);
            owner[binding.field.at(-1)]=ability.rangePresentation.text;
          }
          return [{...entry,scopeId:model.scopeId,profileId:model.canonicalProfileId,
            abilityRangeField:'/'+binding.field.join('/'),parameters:clone(ability.parameters),ownerInstanceId:instanceId}];
        });
      }),
    applied:unit.applied.map(row=>({...clone(row),label:name(row.ruleId)})),conditional:unit.conditional.map(row=>({...clone(row),label:name(row.ruleId)}))};
}
