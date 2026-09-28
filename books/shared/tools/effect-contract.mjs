const BOOKS=new Set(['death-guard','adeptus-mechanicus','tyranids','tau-empire','emperors-children','chaos-space-marines','space-marines','dark-angels','blood-angels']);
export const EFFECT_SCHEMA='wh40k-effect-contracts/v1';
export const EFFECT_TYPES=new Set([
  'CHARACTERISTIC_ADD','CHARACTERISTIC_SET','WEAPON_CHARACTERISTIC_ADD','WEAPON_TAG_GRANT','WEAPON_PROFILE_GRANT',
  'ABILITY_GRANT','ABILITY_REMOVE','KEYWORD_GRANT','KEYWORD_REMOVE','CANONICAL_REFERENCE'
]);
export const EFFECT_CONFIDENCE=new Set(['VERIFIED_FROZEN','VERIFIED_CURRENT','SOURCE_LIMITED','LEGACY_UNVERIFIABLE']);
const SOURCE_KINDS=new Set(['enhancement','ability','datasheet-ability','detachment-rule','selected-wargear','wargear-ability']);
const SCOPES=new Set([
  'assigned-enhancement','attached-bodyguard','attached-group','attached-group-excluding-source','attached-leaders','attached-selected-wargear',
  'attached-unit','bearer','bearer-aura','bearer-while-attached','bodyguard','effective-unit','leading','owner','roster-reference',
  'roster-unit-pair','selected-detachment','selected-physical-loadout','selected-wargear','source','source-model','unit','unit-upgrade',
  'owner-or-attached-group','attachment-group','upgraded-unit','physical-support-composition'
]);
const STACKING_POLICIES=new Set(['apply-once-per-source','best-value','dedupe-effect-id','deduplicate-by-effect-id','set-exact']);
const SELECTOR_KEYS=new Set([
  'abilityId','abilityIds','all','allAbilities','allKeywords','allUnitIds','any','anyKeywords','anyOf','attachmentGroup','bodyguardUnitIds','canonicalEquipmentIds',
  'canonicalRecordId','canonicalTargetIds','detachmentId','detachmentIds','distance','enhancementId','equipmentFamilyId','equippedBy',
  'excludeSourceOwner','excludeSourceUnit','excludeUnitIds','groupAbilityIds','kind','minCharacteristics','modelCount','noneKeywords','noneUnitIds','not',
  'on','ownerUnitIds','physicalEquipment','relationship','requiresLeading','scope','selectedProfileIds','selectedWargearAbilityIds',
  'selectors','sourceUnitId','sourceUnitIds','stat','subject','type','unitIds','weaponFamilyId','weaponMode','groupContainsUnitIds',
  'groupExcludesUnitIds','groupHasEnhancementIds','attachmentState','abilityParameters','targetRelation'
]);
const CONDITION_KINDS=new Set([
  'ability-use','after-fight','ATTACHMENT_MEMBER_PRESENT','attachment-state','battle-formation-selection','battle-shock-step','battle-shock-test',
  'below-starting-strength','destroyed-target-keyword','incoming-attack-strength-greater-than-toughness','manual-resolution','nearby-friendly-unit',
  'not-in-engagement-range','objective-controlled-by-owner','once-per-battle','once-per-battle-per-army','once-per-battle-round','phase',
  'phase-start','reserve-state','ROSTER_UNIT_PRESENT','setup-from-reserves','target-status','target-within-friendly-contagion-range',
  'acquisition-objective-state','attachment-group-contains','attachment-group-excludes','battle-imperative','battle-protocol','battle-selection',
  'battle-shock','source-unit-present','unit-keyword','unit-keyword-absent'
]);
const CANONICAL_TARGET_KINDS=new Set(['ability','detachment-rule','enhancement','weapon-class','weapon-family']);
const CHILD_KINDS=new Set(['profile','wargear-ability']);

const record=value=>value&&typeof value==='object'&&!Array.isArray(value);
const scalar=(value,label)=>{if(typeof value!=='string'||!value.trim())throw new Error(`${label} must be a non-empty string`);return value;};
const array=(value,label)=>{if(!Array.isArray(value))throw new Error(`${label} must be an array`);return value;};
const normalize=value=>String(value||'').toLowerCase().replaceAll('_','-');
const dataOnly=(value,label)=>{
  if(value==null||['string','number','boolean'].includes(typeof value))return;
  if(Array.isArray(value)){value.forEach((item,index)=>dataOnly(item,`${label}[${index}]`));return;}
  if(!record(value))throw new Error(`${label} must contain JSON data only`);
  for(const [key,item] of Object.entries(value)){if(['__proto__','prototype','constructor'].includes(key))throw new Error(`${label} contains a prohibited key`);dataOnly(item,`${label}.${key}`);}
};
const targetId=value=>typeof value==='string'?value:record(value)?scalar(value.id,'canonical target id'):'';
export const effectBindingKey=contract=>[contract.sourceKind,contract.canonicalRecordId,contract.sourceUnitId||'',contract.detachmentId||'',contract.sourceUnitIds?.join(',')||''].join('\0');
const validateSelector=(selector,label)=>{
  if(!record(selector))throw new Error(`${label} must be structured`);
  for(const key of Object.keys(selector))if(!SELECTOR_KEYS.has(key))throw new Error(`${label}: unknown selector field ${key}`);
  for(const key of ['all','any','anyOf','selectors'])if(selector[key]!=null)array(selector[key],`${label}.${key}`).forEach((item,index)=>validateSelector(item,`${label}.${key}[${index}]`));
  if(selector.not!=null)validateSelector(selector.not,`${label}.not`);
  dataOnly(selector,label);
};
const validateOperation=(operation,label,operationIds)=>{
  if(!record(operation)||!EFFECT_TYPES.has(operation.type))throw new Error(`${label}: unsupported effect type ${operation?.type}`);
  const id=scalar(operation.id,`${label}.id`);if(operationIds.has(id))throw new Error(`${label}: duplicate effect operation ID ${id}`);operationIds.add(id);
  const target=targetId(operation.canonicalTarget);if(!target)throw new Error(`${id}: canonicalTarget must be a string or {kind,id}`);
  if(record(operation.canonicalTarget)){const kind=scalar(operation.canonicalTarget.kind,`${id}.canonicalTarget.kind`);if(!CANONICAL_TARGET_KINDS.has(kind))throw new Error(`${id}: unsupported canonical target kind ${kind}`);dataOnly(operation.canonicalTarget,`${id}.canonicalTarget`);}
  if(!record(operation.parameters))throw new Error(`${id}: parameters must be an object`);dataOnly(operation.parameters,`${id}.parameters`);
  if(operation.type==='CHARACTERISTIC_ADD'){
    if(typeof operation.parameters.delta!=='number'&&typeof operation.parameters.value!=='number')throw new Error(`${id}: CHARACTERISTIC_ADD requires numeric delta`);
    if(operation.parameters.modifierOnly!==undefined&&operation.parameters.modifierOnly!==true)throw new Error(`${id}: CHARACTERISTIC_ADD modifierOnly must be true when declared`);
    for(const key of ['minimum','maximum'])if(operation.parameters[key]!==undefined&&typeof operation.parameters[key]!=='number')throw new Error(`${id}: CHARACTERISTIC_ADD ${key} must be numeric`);
  }
  if(operation.type==='CHARACTERISTIC_SET'&&!['number','string'].includes(typeof operation.parameters.to)&&!['number','string'].includes(typeof operation.parameters.value))throw new Error(`${id}: CHARACTERISTIC_SET requires a value`);
  if(operation.type==='WEAPON_CHARACTERISTIC_ADD'&&!((typeof operation.parameters.stat==='string'&&typeof operation.parameters.delta==='number')||(typeof operation.parameters.characteristic==='string'&&typeof operation.parameters.value==='number')))throw new Error(`${id}: WEAPON_CHARACTERISTIC_ADD requires a characteristic and numeric modifier`);
  if(operation.type==='WEAPON_TAG_GRANT'&&typeof operation.parameters.tag!=='string')throw new Error(`${id}: WEAPON_TAG_GRANT requires tag`);
  if(operation.type==='WEAPON_PROFILE_GRANT'&&!record(operation.parameters.profile)&&!Array.isArray(operation.parameters.profileIds)&&operation.parameters.profileSource!=='canonical-record')throw new Error(`${id}: WEAPON_PROFILE_GRANT requires a structured profile or canonical profile binding`);
};

export function validateEffectContractSet(input,{expectedBookId=null}={}){
  if(!record(input)||input.schema!==EFFECT_SCHEMA)throw new Error(`Unsupported effect contract schema: ${input?.schema||'<missing>'}`);
  const bookId=scalar(input.bookId,'effect contract bookId');
  if(expectedBookId&&bookId!==expectedBookId)throw new Error(`${expectedBookId}: effect contract owner mismatch ${bookId}`);
  if(!BOOKS.has(bookId))throw new Error(`${bookId}: unsupported effect contract book`);
  const childIdentities=array(input.childIdentities||[],`${bookId}.childIdentities`),seenChildSources=new Set(),seenChildIds=new Set(),seenChildReferences=new Set();
  for(const [index,binding] of childIdentities.entries()){
    const label=`${bookId}.childIdentities[${index}]`;if(!record(binding))throw new Error(`${label} must be an object`);
    for(const key of Object.keys(binding))if(!['parentUnitId','kind','sourceChildId','canonicalId','legacyIds','referenceIds','semanticFamilyIds'].includes(key))throw new Error(`${label}: unknown field ${key}`);
    const parentUnitId=scalar(binding.parentUnitId,`${label}.parentUnitId`),kind=scalar(binding.kind,`${label}.kind`),sourceChildId=scalar(binding.sourceChildId,`${label}.sourceChildId`),canonicalId=scalar(binding.canonicalId,`${label}.canonicalId`);
    if(!CHILD_KINDS.has(kind))throw new Error(`${label}: unsupported child kind ${kind}`);
    if(!canonicalId.startsWith(`${parentUnitId}-${kind}-`))throw new Error(`${label}: canonical child ID must be scoped to ${parentUnitId}/${kind}`);
    for(const [field,items] of [['legacyIds',binding.legacyIds||[]],['referenceIds',binding.referenceIds||[]],['semanticFamilyIds',binding.semanticFamilyIds||[]]]){
      array(items,`${label}.${field}`);if(new Set(items).size!==items.length||items.some(item=>typeof item!=='string'||!item.trim()))throw new Error(`${label}.${field} must contain unique non-empty IDs`);
    }
    const sourceKey=[parentUnitId,kind,sourceChildId].join('\0'),canonicalKey=[parentUnitId,kind,canonicalId].join('\0');
    if(seenChildSources.has(sourceKey))throw new Error(`${bookId}: duplicate child source identity ${parentUnitId}/${kind}/${sourceChildId}`);seenChildSources.add(sourceKey);
    if(seenChildIds.has(canonicalKey))throw new Error(`${bookId}: duplicate child canonical identity ${canonicalId}`);seenChildIds.add(canonicalKey);
    for(const referenceId of binding.referenceIds||[]){const key=[parentUnitId,kind,referenceId].join('\0');if(seenChildReferences.has(key))throw new Error(`${bookId}: duplicate child reference identity ${parentUnitId}/${kind}/${referenceId}`);seenChildReferences.add(key);}
  }
  const seenBindings=new Set(),seenOperationIds=new Set(),contracts=array(input.contracts,`${bookId}.contracts`);
  for(const [index,contract] of contracts.entries()){
    const label=`${bookId}.contracts[${index}]`;
    if(!record(contract))throw new Error(`${label} must be an object`);
    const canonicalRecordId=scalar(contract.canonicalRecordId,`${label}.canonicalRecordId`);
    if(contract.sourceBookId!==bookId)throw new Error(`${canonicalRecordId}: sourceBookId must equal factual owner ${bookId}`);
    if(!SOURCE_KINDS.has(contract.sourceKind))throw new Error(`${canonicalRecordId}: unsupported sourceKind ${contract.sourceKind}`);
    const key=effectBindingKey(contract);if(seenBindings.has(key))throw new Error(`${bookId}: duplicate scoped effect contract ${key.replaceAll('\0',' / ')}`);seenBindings.add(key);
    const effective=array(contract.effectiveBookIds,`${canonicalRecordId}.effectiveBookIds`);
    if(!effective.length||new Set(effective).size!==effective.length||effective.some(id=>!BOOKS.has(id)))throw new Error(`${canonicalRecordId}: invalid effectiveBookIds`);
    if(!effective.includes(bookId))throw new Error(`${canonicalRecordId}: factual owner must be an effective book`);
    const scope=normalize(scalar(contract.scope,`${canonicalRecordId}.scope`));if(!SCOPES.has(scope))throw new Error(`${canonicalRecordId}: unsupported scope ${contract.scope}`);
    validateSelector(contract.selector,`${canonicalRecordId}.selector`);
    const clauses=array(contract.clauses,`${canonicalRecordId}.clauses`);
    for(const [clauseIndex,clause] of clauses.entries()){
      const clauseLabel=`${canonicalRecordId}.clauses[${clauseIndex}]`;if(!record(clause))throw new Error(`${clauseLabel} must be an object`);
      if(clause.selector!=null)validateSelector(clause.selector,`${clauseLabel}.selector`);
      for(const [conditionIndex,condition] of array(clause.conditions||[],`${clauseLabel}.conditions`).entries()){
        if(!record(condition))throw new Error(`${clauseLabel}.conditions[${conditionIndex}] must be structured`);
        if(condition.selector!=null)validateSelector(condition.selector,`${clauseLabel}.conditions[${conditionIndex}].selector`);
        else if(condition.kind&&!CONDITION_KINDS.has(condition.kind))throw new Error(`${canonicalRecordId}: unsupported condition ${condition.kind}`);
        dataOnly(condition,`${clauseLabel}.conditions[${conditionIndex}]`);
      }
      for(const [operationIndex,operation] of array(clause.operations,`${clauseLabel}.operations`).entries())validateOperation(operation,`${clauseLabel}.operations[${operationIndex}]`,seenOperationIds);
    }
    if(typeof contract.timingState==='string')scalar(contract.timingState,`${canonicalRecordId}.timingState`);else if(record(contract.timingState)){scalar(contract.timingState.kind,`${canonicalRecordId}.timingState.kind`);dataOnly(contract.timingState,`${canonicalRecordId}.timingState`);}else throw new Error(`${canonicalRecordId}: timingState must be a string or object`);
    if(!STACKING_POLICIES.has(normalize(contract.stackingPolicy)))throw new Error(`${canonicalRecordId}: unsupported stackingPolicy ${contract.stackingPolicy}`);
    if(!record(contract.source))throw new Error(`${canonicalRecordId}: source binding is required`);
    scalar(contract.source.sourceId,`${canonicalRecordId}.source.sourceId`);scalar(contract.source.locator,`${canonicalRecordId}.source.locator`);
    if(!EFFECT_CONFIDENCE.has(contract.confidence))throw new Error(`${canonicalRecordId}: unsupported confidence ${contract.confidence}`);
  }
  return input;
}

export function applyCanonicalChildIdentityContracts(units,contractSets){
  const bindings=contractSets.flatMap(set=>validateEffectContractSet(set).childIdentities||[]),bySource=new Map(),byCanonical=new Set(),used=new Map();
  for(const binding of bindings){
    const sourceKey=[binding.parentUnitId,binding.kind,binding.sourceChildId].join('\0'),canonicalKey=[binding.parentUnitId,binding.kind,binding.canonicalId].join('\0');
    if(bySource.has(sourceKey))throw new Error(`duplicate effective child source identity ${binding.parentUnitId}/${binding.kind}/${binding.sourceChildId}`);
    if(byCanonical.has(canonicalKey))throw new Error(`duplicate effective child canonical identity ${binding.canonicalId}`);
    bySource.set(sourceKey,binding);byCanonical.add(canonicalKey);used.set(sourceKey,0);
  }
  const project=(unit,kind,items)=>items.map(item=>{
    if(!item?.sourceChildId)return item;
    const sourceKey=[unit.id,kind,item.sourceChildId].join('\0'),binding=bySource.get(sourceKey);if(!binding)return item;
    if(item.id&&item.id!==binding.canonicalId)throw new Error(`${unit.id}: source child ${item.sourceChildId} conflicts with canonical ID ${item.id}`);
    used.set(sourceKey,used.get(sourceKey)+1);
    return {...item,id:binding.canonicalId,legacyIds:[...(binding.legacyIds||[])],semanticFamilyIds:[...(binding.semanticFamilyIds||[])]};
  });
  const output=units.map(unit=>({...unit,weapons:project(unit,'profile',unit.weapons||[]),wargearAbilities:project(unit,'wargear-ability',unit.wargearAbilities||[])}));
  const missing=[...used].filter(([,count])=>count!==1).map(([key,count])=>`${key.replaceAll('\0','/')} (${count})`);
  if(missing.length)throw new Error(`persistent child identity bindings must resolve exactly once: ${missing.join(', ')}`);
  return output;
}

export function effectiveEffectContracts(contractSets,bookId){
  if(!BOOKS.has(bookId))throw new Error(`Unsupported effective effect book ${bookId}`);
  const records=[];for(const set of contractSets){const validated=validateEffectContractSet(set);for(const contract of validated.contracts)if(contract.effectiveBookIds.includes(bookId))records.push(contract);}
  const seen=new Set();for(const contract of records){const key=effectBindingKey(contract);if(seen.has(key))throw new Error(`${bookId}: duplicate effective effect contract ${key.replaceAll('\0',' / ')}`);seen.add(key);}
  return records.sort((a,b)=>effectBindingKey(a).localeCompare(effectBindingKey(b))||a.sourceBookId.localeCompare(b.sourceBookId));
}

const catalogIds=catalog=>{
  const units=new Map((catalog.units||[]).map(item=>[item.id,item]));
  const enhancements=new Set((catalog.enhancements||[]).flatMap(item=>[item.id,item.ruleId,item.sourceId,item.legacyKey,...(item.canonicalEffectRecordIds||[])].filter(Boolean)));
  const detachments=new Set((catalog.detachments||[]).map(item=>item.id));
  const detachmentRules=new Map((catalog.detachmentRules||[]).map(item=>[item.id,item]));
  const abilities=new Map(),children={profile:new Map(),'wargear-ability':new Map()};
  const weaponClasses=new Set(),weaponFamilies=new Set();
  const addChild=(unit,kind,item)=>{if(children[kind].has(item.id))throw new Error(`${catalog.book?.id||catalog.bookId}: duplicate ${kind} canonical child identity ${item.id}`);children[kind].set(item.id,{parentUnitId:unit.id,kind,item});};
  for(const unit of units.values()){
    const unitAbilityIds=new Set();
    for(const item of [...(unit.gameSelections?.abilities||[]),...(unit.gameSelections?.wargearAbilities||[])]){if(!item.id)throw new Error(`${unit.id}: ability requires an exact canonical ID`);if(unitAbilityIds.has(item.id))throw new Error(`${unit.id}: duplicate canonical ability ID ${item.id}`);unitAbilityIds.add(item.id);abilities.set(item.id,item);}
    for(const item of unit.gameSelections?.wargearAbilities||[])addChild(unit,'wargear-ability',item);
    for(const item of unit.gameSelections?.weaponProfiles||[])addChild(unit,'profile',item);
  }
  for(const unit of units.values()){for(const item of unit.gameSelections?.weaponClasses||[])weaponClasses.add(item.id);for(const item of unit.gameSelections?.weaponFamilies||[])weaponFamilies.add(item.id);}
  return {units,enhancements,detachments,detachmentRules,abilities,children,weaponClasses,weaponFamilies};
};
const selectorUnitIds=selector=>['unitIds','excludeUnitIds','noneUnitIds','sourceUnitIds','ownerUnitIds','bodyguardUnitIds','groupContainsUnitIds','groupExcludesUnitIds','allUnitIds'].flatMap(key=>selector?.[key]||[]);
const walkSelectors=selector=>[selector,...(selector?.all||[]).flatMap(walkSelectors),...(selector?.any||[]).flatMap(walkSelectors),...(selector?.anyOf||[]).flatMap(walkSelectors),...(selector?.selectors||[]).flatMap(walkSelectors),...(selector?.not?[...walkSelectors(selector.not)]:[])];

export function validateEffectContractsAgainstCatalog(input,catalog,{effectiveBookId=input.bookId}={}){
  const validated=validateEffectContractSet(input,{expectedBookId:input.bookId}),ids=catalogIds(catalog);
  if(catalog.book?.id!==effectiveBookId)throw new Error(`${input.bookId}: effect catalog owner mismatch ${catalog.book?.id||'<missing>'}`);
  const childReferences={profile:new Map(ids.children.profile),'wargear-ability':new Map(ids.children['wargear-ability'])};
  for(const binding of validated.childIdentities||[]){
    const resolved=ids.children[binding.kind].get(binding.canonicalId);
    if(!resolved)throw new Error(`${binding.canonicalId}: persistent child identity is absent from ${effectiveBookId}`);
    if(resolved.parentUnitId!==binding.parentUnitId)throw new Error(`${binding.canonicalId}: persistent child identity belongs to wrong parent ${resolved.parentUnitId}`);
    childReferences[binding.kind].set(binding.canonicalId,{...resolved,binding});
    for(const referenceId of binding.referenceIds||[]){
      if(childReferences[binding.kind].has(referenceId))throw new Error(`${binding.canonicalId}: child reference alias collides with ${referenceId}`);
      childReferences[binding.kind].set(referenceId,{...resolved,binding});
    }
  }
  const resolveChild=(contract,id,kind,sourceUnits)=>{
    const resolved=childReferences[kind].get(id);if(!resolved)throw new Error(`${contract.canonicalRecordId}: unknown ${kind} reference ${id}`);
    if(resolved.binding&&id!==resolved.binding.canonicalId)throw new Error(`${contract.canonicalRecordId}: ${kind} reference ${id} must use canonical persistent child ${resolved.binding.canonicalId}`);
    if(sourceUnits.length&&!sourceUnits.includes(resolved.parentUnitId))throw new Error(`${contract.canonicalRecordId}: ${kind} reference ${id} belongs to wrong parent ${resolved.parentUnitId}`);
    return resolved;
  };
  for(const contract of validated.contracts){
    const sourceUnits=[contract.sourceUnitId,...(contract.sourceUnitIds||[])].filter(Boolean);
    const dependencyBindingAbsent=input.bookId!==effectiveBookId&&((sourceUnits.length&&!sourceUnits.some(id=>ids.units.has(id)))||(contract.detachmentId&&!ids.detachments.has(contract.detachmentId)));
    if(dependencyBindingAbsent)continue;
    if(contract.detachmentId&&!ids.detachments.has(contract.detachmentId))throw new Error(`${contract.canonicalRecordId}: unknown Detachment ${contract.detachmentId}`);
    for(const id of sourceUnits)if(!ids.units.has(id)&&input.bookId===effectiveBookId)throw new Error(`${contract.canonicalRecordId}: unknown source unit ${id}`);
    if(contract.sourceKind==='enhancement'&&!ids.enhancements.has(contract.canonicalRecordId))throw new Error(`${contract.canonicalRecordId}: unknown canonical Enhancement`);
    if(contract.sourceKind==='detachment-rule'){
      const rule=ids.detachmentRules.get(contract.canonicalRecordId);if(!rule)throw new Error(`${contract.canonicalRecordId}: unknown canonical Detachment rule`);
      if(contract.detachmentId&&rule.detachmentId!==contract.detachmentId)throw new Error(`${contract.canonicalRecordId}: wrong Detachment scope ${contract.detachmentId}`);
    }
    if(['ability','datasheet-ability'].includes(contract.sourceKind)){
      if(!ids.abilities.has(contract.canonicalRecordId))throw new Error(`${contract.canonicalRecordId}: unknown canonical ability`);
      if(sourceUnits.length&&!sourceUnits.some(id=>[...(ids.units.get(id)?.gameSelections?.abilities||[]),...(ids.units.get(id)?.gameSelections?.wargearAbilities||[])].some(item=>item.id===contract.canonicalRecordId)))throw new Error(`${contract.canonicalRecordId}: ability is not owned by its declared source unit`);
    }
    if(contract.sourceKind==='selected-wargear'&&childReferences['wargear-ability'].has(contract.canonicalRecordId))resolveChild(contract,contract.canonicalRecordId,'wargear-ability',sourceUnits);
    for(const clause of contract.clauses){
      for(const selector of [contract.selector,clause.selector,...clause.conditions.flatMap(item=>item.selector?[item.selector]:[])].flatMap(walkSelectors)){
        for(const id of selectorUnitIds(selector))if(!ids.units.has(id))throw new Error(`${contract.canonicalRecordId}: selector references unknown unit ${id}`);
        for(const id of [...(selector?.detachmentIds||[]),selector?.detachmentId].filter(Boolean))if(!ids.detachments.has(id))throw new Error(`${contract.canonicalRecordId}: selector references unknown Detachment ${id}`);
        for(const id of selector?.selectedWargearAbilityIds||[]){const resolved=resolveChild(contract,id,'wargear-ability',sourceUnits);if(selector.equipmentFamilyId&&resolved.binding&&!resolved.binding.semanticFamilyIds?.includes(selector.equipmentFamilyId))throw new Error(`${contract.canonicalRecordId}: child ${id} is outside equipment family ${selector.equipmentFamilyId}`);}
        for(const id of selector?.canonicalTargetIds||[])resolveChild(contract,id,'wargear-ability',sourceUnits);
        for(const id of selector?.selectedProfileIds||[])resolveChild(contract,id,'profile',sourceUnits);
      }
      for(const operation of clause.operations){
        const target=typeof operation.canonicalTarget==='string'?operation.canonicalTarget:operation.canonicalTarget.id,kind=operation.parameters.referenceKind||operation.canonicalTarget?.kind;
        if(operation.type==='ABILITY_REMOVE'&&!ids.abilities.has(target))throw new Error(`${contract.canonicalRecordId}: unknown canonical ability target ${target}`);
        if(kind==='weapon-class'&&!ids.weaponClasses.has(target))throw new Error(`${contract.canonicalRecordId}: unknown canonical weapon class ${target}`);
        if(kind==='weapon-family'&&!ids.weaponFamilies.has(target))throw new Error(`${contract.canonicalRecordId}: unknown canonical weapon family ${target}`);
        for(const id of operation.parameters.profileIds||[])resolveChild(contract,id,'profile',sourceUnits);
        for(const binding of operation.parameters.physicalBearer?.modelProfileBindings||[]){
          const owners=sourceUnits.map(id=>ids.units.get(id)).filter(unit=>unit?.gameSelections?.models?.some(model=>model.id===binding.modelId)&&unit?.gameSelections?.statProfiles?.some(profile=>profile.id===binding.statProfileId));
          if(owners.length!==1)throw new Error(`${contract.canonicalRecordId}: physical bearer binding ${binding.modelId}/${binding.statProfileId} must resolve to one declared source unit`);
        }
        if(operation.type==='CANONICAL_REFERENCE'){
          const resolved=kind==='enhancement'?ids.enhancements.has(target):kind==='detachment-rule'?ids.detachmentRules.has(target):kind==='ability'?ids.abilities.has(target):false;
          if(!resolved)throw new Error(`${contract.canonicalRecordId}: unknown canonical target ${kind||'<missing>'}/${target}`);
        }
      }
    }
  }
  return validated;
}
