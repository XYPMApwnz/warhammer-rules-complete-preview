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
  // UNIT modifiers stay on the UNIT. Preserve the executor's final value
  // and resolve its exact typed source; presentation must not recalculate it.
  const unitMetrics=Object.fromEntries(['chargeRoll','detectionRange'].filter(field=>unit.metrics?.[field]).map(field=>[field,clone(unit.metrics[field])]));
  const unitMetricSources=unit.applied.filter(row=>row.operation==='MODIFY_RULE_METRIC'&&Object.hasOwn(unitMetrics,row.field)&&
    !row.targetModelInstanceId&&!row.targetProfileId&&!row.targetCompositionId&&!row.targetWeaponProfileId).map(row=>{
    const rule=records.get(row.ruleId),clause=rule?.ruleContract?.clauses.find(clause=>clause.id===row.clauseId);
    const effect=clause?.rosterEffects.find(effect=>effect.id===row.effectId);
    if(!effect||effect.operation!=='MODIFY_RULE_METRIC'||effect.field!==row.field||effect.targetSubject!=='UNIT'||
        !(effect.field==='detectionRange'&&effect.unitScope===undefined||['PHYSICAL','FORMED'].includes(effect.unitScope))||row.targetInstanceId!==instanceId||row.targetModelInstanceId)
      throw new TypeError('Unresolved typed UNIT metric provenance');
    return {...clone(row),unitScope:effect.unitScope,label:rule.displayName||name(row.ruleId),provenance:clone(rule.provenance||{})};
  });
  for(const field of Object.keys(unitMetrics))if(!unitMetricSources.some(source=>source.field===field))throw new TypeError('Missing computed UNIT metric provenance');
  // Check the executor's recorded state transitions, without recalculating a
  // modifier. A missing contribution must not downgrade a mixed UNIT result
  // to legacy presentation or attribute its final total to another source.
  if(unitMetrics.detectionRange){
    let previous=null;
    for(const source of unitMetricSources.filter(source=>source.field==='detectionRange')){
      if(JSON.stringify(source.before)!==JSON.stringify(previous))throw new TypeError('Incomplete UNIT metric provenance chain');
      previous=source.after;
    }
    if(JSON.stringify(previous)!==JSON.stringify(unitMetrics.detectionRange))throw new TypeError('Inconsistent computed UNIT metric provenance');
  }
  const rangedAbilities=new Set(unit.profiles.flatMap(model=>model.abilities.filter(ability=>ability.rangePresentation).map(ability=>ability.canonicalId)));
  // Selected rules remain canonical references, not new abilities or computed
  // battle effects. Resolve their physical presentation scope on every projection.
  const enhancements=(unit.enhancementIds||[]).map(id=>{
    const rule=records.get(id);
    if(rule?.kind!=='ENHANCEMENT')throw new TypeError('Unresolved selected Enhancement');
    const assignment=unit.enhancementAssignments?.find(item=>item.enhancementId===id);
    const subject=rule.ruleContract?.roles.find(role=>role.id===rule.ruleContract.assignment?.ownerRoleId)?.subject;
    const model=assignment?unit.profiles.find(profile=>profile.scopeId===assignment.modelScopeId):
      subject==='MODEL'&&unit.profiles.length===1&&unit.profiles[0].quantity===1?unit.profiles[0]:null;
    const grantedRules=(rule.ruleContract?.clauses||[]).flatMap(clause=>{
      const binding=clause.rosterReferenceBinding;if(!binding)return [];
      if(binding.sourceBinding!=='SOURCE_MODEL'||binding.subject!=='UNIT'||
          binding.standaloneBinding!=='SOURCE_UNIT'||binding.attachedBinding!=='SOURCE_FORMED_MODELS')
        throw new TypeError('Unsupported declarative reference scope');
      if(!model)return []; // An unresolved physical bearer cannot grant a rule.
      return binding.canonicalRuleReferences.map(canonicalId=>{
        if(!records.has(canonicalId))throw new TypeError('Unresolved granted canonical rule');
        return {canonicalId,sourceRuleId:id,clauseId:clause.id,sourceInstanceId:instanceId,
          sourceModelScopeId:model.scopeId,subject:binding.subject,
          recipientInstanceIds:group?[...group.memberInstanceIds]:[instanceId]};
      });
    });
    return {canonicalId:id,ownerInstanceId:instanceId,subject:subject||null,
      modelScopeId:model?.scopeId||null,grantedRules};
  });
  const weapons=[...unit.weapons,...unit.profiles.flatMap(m=>m.weapons.map(w=>({...w,modelInstanceId:m.modelInstanceId})))];
  return {instanceId,canonicalUnitId:unit.canonicalUnitId,title:canonical.data.title,startingStrength:unit.startingStrength,
    enhancements,
    ...(unit.abilities?{unitAbilities:clone(unit.abilities)}:{}),
    ...(Object.keys(unitMetrics).length?{unitMetrics,unitMetricSources}:{}),
    formedUnit:group?clone(group):null,keywords:group?[...group.keywords]:[...unit.keywords],intrinsicKeywords:[...unit.intrinsicKeywords],
    profiles:unit.profiles.map(m=>({id:m.canonicalProfileId,scopeId:m.scopeId,ownerInstanceId:instanceId,quantity:m.quantity,modelInstanceId:m.modelInstanceId,title:canonical.data.title,
      fields:[...fields(m.profile),...book.entities.filter(e=>e.kind==='MODEL_BASE'&&e.parentId===m.canonicalProfileId).map(e=>({label:'Base',value:e.data.text,source:{entityId:e.id}}))],keywords:[...m.keywords],intrinsicKeywords:[...(m.intrinsicKeywords||unit.intrinsicKeywords)],metrics:clone(m.metrics),abilities:clone(m.abilities),
      ...(m.suppressedAbilityIds?{suppressedAbilityIds:[...m.suppressedAbilityIds]}:{})})),
    weapons:weapons.map(w=>{
      const unambiguousLegacy=!w.quantityPartition&&weapons.filter(other=>other.canonicalProfileId===w.canonicalProfileId&&
        (other.scopeId??null)===(w.scopeId??null)).length===1;
      const sources=unit.applied.filter(row=>row.operation==='MODIFY_RULE_METRIC' && row.field==='criticalHitThreshold' &&
        row.targetInstanceId===instanceId&&row.targetWeaponProfileId===w.canonicalProfileId &&
        (row.targetCompositionId??null)===(w.scopeId??null)&&
        (Object.hasOwn(row,'targetWeaponSelectionKey')||Object.hasOwn(row,'targetWeaponScopeId')
          ? typeof w.selectionKey==='string'&&w.selectionKey.length>0&&row.targetWeaponSelectionKey===w.selectionKey&&
            Object.hasOwn(row,'targetWeaponScopeId')&&row.targetWeaponScopeId===(w.scopeId??null)
          : unambiguousLegacy)).map(row=>{
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
