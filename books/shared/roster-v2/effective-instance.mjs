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
  // UNIT roll modifiers stay on the UNIT. Preserve the executor's final value
  // and resolve its exact typed source; presentation must not recalculate it.
  const unitMetrics=unit.metrics?.chargeRoll?{chargeRoll:clone(unit.metrics.chargeRoll)}:{};
  const unitMetricSources=unit.applied.filter(row=>row.operation==='MODIFY_RULE_METRIC'&&row.field==='chargeRoll').map(row=>{
    const rule=records.get(row.ruleId),clause=rule?.ruleContract?.clauses.find(clause=>clause.id===row.clauseId);
    const effect=clause?.rosterEffects.find(effect=>effect.id===row.effectId);
    if(!effect||effect.operation!=='MODIFY_RULE_METRIC'||effect.field!=='chargeRoll'||effect.targetSubject!=='UNIT'||
        !['PHYSICAL','FORMED'].includes(effect.unitScope)||row.targetInstanceId!==instanceId||row.targetModelInstanceId)
      throw new TypeError('Unresolved typed UNIT metric provenance');
    return {...clone(row),unitScope:effect.unitScope,label:rule.displayName||name(row.ruleId),provenance:clone(rule.provenance||{})};
  });
  if(unitMetrics.chargeRoll&&!unitMetricSources.length)throw new TypeError('Missing computed UNIT metric provenance');
  const rangedAbilities=new Set(unit.profiles.flatMap(model=>model.abilities.filter(ability=>ability.rangePresentation).map(ability=>ability.canonicalId)));
  return {instanceId,canonicalUnitId:unit.canonicalUnitId,title:canonical.data.title,startingStrength:unit.startingStrength,
    ...(unit.abilities?{unitAbilities:clone(unit.abilities)}:{}),
    ...(unitMetrics.chargeRoll?{unitMetrics,unitMetricSources}:{}),
    formedUnit:group?clone(group):null,keywords:group?[...group.keywords]:[...unit.keywords],intrinsicKeywords:[...unit.intrinsicKeywords],
    profiles:unit.profiles.map(m=>({id:m.canonicalProfileId,scopeId:m.scopeId,ownerInstanceId:instanceId,quantity:m.quantity,modelInstanceId:m.modelInstanceId,title:canonical.data.title,
      fields:[...fields(m.profile),...book.entities.filter(e=>e.kind==='MODEL_BASE'&&e.parentId===m.canonicalProfileId).map(e=>({label:'Base',value:e.data.text,source:{entityId:e.id}}))],keywords:[...m.keywords],intrinsicKeywords:[...(m.intrinsicKeywords||unit.intrinsicKeywords)],metrics:clone(m.metrics),abilities:clone(m.abilities),
      ...(m.suppressedAbilityIds?{suppressedAbilityIds:[...m.suppressedAbilityIds]}:{})})),
    weapons:[...unit.weapons,...unit.profiles.flatMap(m=>m.weapons.map(w=>({...w,modelInstanceId:m.modelInstanceId})))].map(w=>{
      const sources=unit.applied.filter(row=>row.operation==='MODIFY_RULE_METRIC' && row.field==='criticalHitThreshold' &&
        row.targetWeaponProfileId===w.canonicalProfileId && (row.targetCompositionId||null)===(w.scopeId||null)).map(row=>{
        const rule=records.get(row.ruleId),effect=rule?.ruleContract?.clauses.find(c=>c.id===row.clauseId)?.rosterEffects.find(e=>e.id===row.effectId);
        if(effect?.operation!=='MODIFY_RULE_METRIC'||effect.field!=='criticalHitThreshold'||effect.mode!=='SET'||row.targetInstanceId!==instanceId)
          throw new TypeError('Unresolved Critical Hit threshold provenance');
        return {...clone(row),value:effect.value,label:effect.label||rule.displayName||name(row.ruleId),provenance:clone(rule.provenance||{})};
      });
      if(w.data.criticalHitThreshold!==undefined && (!sources.length||Math.min(6,...sources.map(s=>s.value))!==w.data.criticalHitThreshold))
        throw new TypeError('Missing or inconsistent Critical Hit threshold sources');
      return {id:w.canonicalProfileId,title:w.data.name,ownerInstanceId:instanceId,physicalQuantity:w.physicalQuantity,modelInstanceId:w.modelInstanceId,scopeId:w.scopeId || null,selectionKey:w.selectionKey,fields:fields(w.data),
        ...(sources.length?{criticalHitSources:sources}:{})};
    }),
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
