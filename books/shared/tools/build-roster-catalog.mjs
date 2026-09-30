import {assignCanonicalChildIdentities,requireCanonicalChildIdentity} from './canonical-join-contract.mjs';
import {canonicalBaseStatsForUnit,canonicalStatProfilesForUnit} from './canonical-unit-stats.mjs';
import {projectUnitRosterWeaponFacts} from './canonical-weapon-profile-facts.mjs';

const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const slug=value=>String(value||'').toLowerCase().replace(/[\u2019']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const values=value=>Array.isArray(value)?value:[];
const weaponFamilyTitle=value=>{const match=String(value||'').match(/^(.+?)\s+[\u2013\u2014-]\s+(.+)$/);return match?match[1].trim():'';};
const legacyWeaponProfileId=(unit,profile,index=0)=>`${unit.id}-profile-${slug(profile.name)}-${profile.mode||'weapon'}${index?'-'+(index+1):''}`;
const legacyWargearAbilityId=(unit,ability,index=0)=>`${unit.id}-wargear-ability-${slug(ability.title)}${index?'-'+(index+1):''}`;
const weaponIdentityFacts=profile=>({sourceName:profile.name||'',mode:profile.mode||'weapon',range:profile.range||'',a:profile.a||'',skill:profile.skill||'',s:profile.s||'',ap:profile.ap||'',d:profile.d||'',abilities:profile.abilities||''});
const abilityIdentityFacts=ability=>({sourceTitle:ability.title||'',text:ability.text||ability.summary||''});
const structuredWargearLegality=(unit,models,selections)=>{
  const source=unit.rosterWargearLegality;if(!source)return{};
  const modelIds=new Set(models.map(item=>item.id)),selectionIds=new Set(selections.map(item=>item.id)),optionIds=new Set(),sharedCaps=new Map();
  const quantity=(value,label)=>{if(!Number.isInteger(value)||value<1)throw new Error(`${unit.id}: ${label} requires a positive integer quantity`);return value;};
  for(const cap of values(source.sharedCaps)){if(!cap?.id||sharedCaps.has(cap.id))throw new Error(`${unit.id}: duplicate or missing wargear shared cap ${cap?.id||'<missing>'}`);const sourceIds=values(cap.sourceIds),scope=cap.scope||'unit';if(sourceIds.some(id=>typeof id!=='string'||!id.trim())||new Set(sourceIds).size!==sourceIds.length)throw new Error(`${unit.id}: wargear shared cap ${cap.id} has invalid source identities`);if(!['unit','model'].includes(scope))throw new Error(`${unit.id}: wargear shared cap ${cap.id} has invalid scope ${scope}`);sharedCaps.set(cap.id,{max:quantity(cap.max,`wargear shared cap ${cap.id}`),scope,sourceIds:[...sourceIds]});}
  const defaults=values(source.defaults).map(record=>{if(!modelIds.has(record?.modelId))throw new Error(`${unit.id}: wargear default references unknown model ${record?.modelId||'<missing>'}`);const aliases=values(record.aliases);if(aliases.some(alias=>typeof alias!=='string'||!alias.trim())||new Set(aliases.map(normalize)).size!==aliases.length)throw new Error(`${unit.id}: wargear default ${record.modelId} has invalid model aliases`);const seen=new Set(),entries=values(record.selections).map(item=>{if(!selectionIds.has(item?.selectionId))throw new Error(`${unit.id}: wargear default references unknown selection ${item?.selectionId||'<missing>'}`);if(seen.has(item.selectionId))throw new Error(`${unit.id}: duplicate wargear default selection ${record.modelId}/${item.selectionId}`);seen.add(item.selectionId);return{selectionId:item.selectionId,quantity:quantity(item.quantity,`wargear default ${record.modelId}/${item.selectionId}`)};});return{modelId:record.modelId,...(aliases.length?{aliases:[...aliases]}:{}),selections:entries};});
  if(new Set(defaults.map(item=>item.modelId)).size!==defaults.length||defaults.length!==modelIds.size)throw new Error(`${unit.id}: wargear defaults must cover each canonical model exactly once`);
  const references=(items,label)=>values(items).map(item=>{if(!selectionIds.has(item?.selectionId))throw new Error(`${unit.id}: ${label} references unknown selection ${item?.selectionId||'<missing>'}`);return{selectionId:item.selectionId,quantity:quantity(item.quantity,`${label}/${item.selectionId}`)};});
  const optionContracts=values(source.options).map(option=>{
    if(!option?.sourceId||optionIds.has(option.sourceId))throw new Error(`${unit.id}: duplicate or missing wargear option source identity ${option?.sourceId||'<missing>'}`);optionIds.add(option.sourceId);
    const eligibleModelIds=values(option.eligibleModelIds);if(!eligibleModelIds.length||eligibleModelIds.some(id=>!modelIds.has(id))||new Set(eligibleModelIds).size!==eligibleModelIds.length)throw new Error(`${unit.id}: ${option.sourceId} has invalid eligible model identities`);
    const limit={...(option.limit||{})};for(const key of ['perModel','perUnit'])if(limit[key]!==undefined)limit[key]=quantity(limit[key],`${option.sourceId} ${key}`);
    if(limit.perModels){limit.perModels={models:quantity(limit.perModels.models,`${option.sourceId} perModels.models`),uses:quantity(limit.perModels.uses,`${option.sourceId} perModels.uses`)}};
    if(limit.capacitySelectionId&&!selectionIds.has(limit.capacitySelectionId))throw new Error(`${unit.id}: ${option.sourceId} capacity references unknown selection ${limit.capacitySelectionId}`);
    const choices=values(option.choices).map((choice,index)=>{const result={remove:references(choice.remove,`${option.sourceId} choice ${index+1} remove`),add:references(choice.add,`${option.sourceId} choice ${index+1} add`)};if(!result.remove.length&&!result.add.length)throw new Error(`${unit.id}: ${option.sourceId} has an empty choice`);for(const key of ['requiresFinal','forbidsFinal']){result[key]=values(choice[key]);if(result[key].some(id=>!selectionIds.has(id)))throw new Error(`${unit.id}: ${option.sourceId} ${key} references an unknown selection`);}result.sharedUses=values(choice.sharedUses);if(result.sharedUses.some(id=>!sharedCaps.has(id)))throw new Error(`${unit.id}: ${option.sourceId} references unknown shared cap`);const choiceModelIds=values(choice.eligibleModelIds);if(choiceModelIds.length){if(choiceModelIds.some(id=>!eligibleModelIds.includes(id))||new Set(choiceModelIds).size!==choiceModelIds.length)throw new Error(`${unit.id}: ${option.sourceId} choice ${index+1} has invalid eligible model identities`);result.eligibleModelIds=[...choiceModelIds];}if(choice.limit?.perModels)result.limit={perModels:{models:quantity(choice.limit.perModels.models,`${option.sourceId} choice ${index+1} perModels.models`),uses:quantity(choice.limit.perModels.uses,`${option.sourceId} choice ${index+1} perModels.uses`)}};return result;});
    if(!choices.length)throw new Error(`${unit.id}: ${option.sourceId} requires at least one atomic choice`);
    const when=option.when?{...option.when}:null;if(when&&(!Number.isInteger(when.unitModelCountEquals)||when.unitModelCountEquals<1))throw new Error(`${unit.id}: ${option.sourceId} has invalid unit-model condition`);
    return{sourceId:option.sourceId,eligibleModelIds:[...eligibleModelIds],...(when?{when}:{}),limit,choices};
  });
  const declarationIds=new Set(),declarations=values(source.declarations).map(declaration=>{if(!declaration?.sourceRuleId||declarationIds.has(declaration.sourceRuleId))throw new Error(`${unit.id}: duplicate or missing wargear declaration identity ${declaration?.sourceRuleId||'<missing>'}`);declarationIds.add(declaration.sourceRuleId);if(declaration.kind!=='NO_SELECTABLE_OPTION')throw new Error(`${unit.id}: unsupported wargear declaration ${declaration.kind||'<missing>'}`);return{sourceRuleId:declaration.sourceRuleId,kind:declaration.kind};});
  return{wargearDefaults:defaults,wargearOptionContracts:optionContracts,wargearSharedCaps:[...sharedCaps].map(([id,record])=>({id,max:record.max,...(record.scope!=='unit'?{scope:record.scope}:{}),...(record.sourceIds.length?{sourceIds:record.sourceIds}:{})})),...(declarations.length?{wargearDeclarations:declarations}:{})};
};
export const canonicalWeaponProfileId=(unit,profile)=>{
  if(!profile?.id)throw new Error(`${unit?.id||'unit'}: weapon profile has no pre-model canonical ID`);
  if(profile.sourceUnitId!==unit?.id)throw new Error(`${profile.id}: weapon profile belongs to wrong parent ${profile.sourceUnitId||'<missing>'}`);
  return profile.id;
};
export const canonicalWargearAbilityId=(unit,ability,index=0)=>requireCanonicalChildIdentity(unit,ability,{kind:'wargear-ability',title:ability.title,semantic:abilityIdentityFacts(ability),legacyId:legacyWargearAbilityId(unit,ability,index)}).id;
export const persistCanonicalWeaponProfileIdentities=unit=>{
  const assign=records=>assignCanonicalChildIdentities(unit,records,{kind:'profile',titleOf:profile=>profile.name,semanticOf:weaponIdentityFacts,legacyIdOf:legacyWeaponProfileId.bind(null,unit)}).map(profile=>({...profile,sourceUnitId:unit.id}));
  if(values(unit.weapons).length)return {...unit,weapons:assign(unit.weapons)};
  const blocks=values(unit.blocks),weaponIndexes=blocks.map((block,index)=>block?.type==='weapon'?index:-1).filter(index=>index>=0);
  if(!weaponIndexes.length)return unit;
  const assigned=assign(weaponIndexes.map(index=>blocks[index])),byIndex=new Map(weaponIndexes.map((index,offset)=>[index,assigned[offset]]));
  return {...unit,blocks:blocks.map((block,index)=>byIndex.get(index)||block)};
};

export function assertWeaponProfileIdentityProjection(units,catalogUnits,{label='weapon profile projection'}={}){
  const catalogByUnit=new Map(values(catalogUnits).map(unit=>[unit.id,unit]));
  for(const unit of values(units)){
    const profiles=values(unit.weapons).length?values(unit.weapons):values(unit.blocks).filter(block=>block?.type==='weapon');
    const sourceIds=profiles.map(profile=>canonicalWeaponProfileId(unit,profile)),catalog=catalogByUnit.get(unit.id);
    if(!catalog)throw new Error(`${label}: unknown catalog unit ${unit.id}`);
    const projectedIds=values(catalog.gameSelections?.weaponProfiles).map(profile=>profile.id);
    if(JSON.stringify([...sourceIds].sort())!==JSON.stringify([...projectedIds].sort()))throw new Error(`${label}: ${unit.id} has conflicting canonical profile identities`);
  }
}
const relationRecord=record=>({unitId:record?.unitId||record?.id||'',...(Number.isFinite(Number(record?.maxCharacters))?{maxCharacters:Number(record.maxCharacters)}:{}),...(record?.mandatory?{mandatory:true}:{}),...(values(record?.removeKeywords).length?{removeKeywords:[...record.removeKeywords]}:{}),...(record?.attachmentGroupConstraint?{attachmentGroupConstraint:structuredClone(record.attachmentGroupConstraint)}:{})});
const relationsFor=(relations,id)=>{const source=relations instanceof Map?relations.get(id):relations?.[id];return Object.fromEntries(['canLead','canSupport','canBeLedBy','canBeSupportedBy'].map(key=>[key,values(source?.[key]).map(relationRecord)]));};
const blockEnhancements=detachment=>[...values(detachment?.enhancements),...values(detachment?.blocks).filter(block=>block?.type==='enhancement'),...values(detachment?.subsections).flatMap(section=>values(section?.blocks).filter(block=>block?.type==='enhancement'))];
const dependencyRecords=config=>{
  const source=config?.dependencies,records=Array.isArray(source)?source.map(item=>typeof item==='string'?{bookId:item}:item):source&&typeof source==='object'?Object.entries(source).map(([bookId,value])=>({bookId,...(value||{})})):[];
  const normalized=records.map(item=>({...(item||{}),bookId:item?.bookId||item?.id||''}));
  if(normalized.some(item=>typeof item.bookId!=='string'||!item.bookId.trim()))throw new Error(`${config?.id||'book'}: dependency requires an exact canonical book ID`);
  if(new Set(normalized.map(item=>item.bookId)).size!==normalized.length)throw new Error(`${config?.id||'book'}: duplicate dependency ID`);
  return normalized;
};
const singularModelTitle=(value,max)=>{const title=String(value||'').replace(/\s+[\u2013\u2014-]\s+EPIC HERO\s*$/i,'').trim();return Number(max)>1&&/s$/i.test(title)&&!/(ss|us)$/i.test(title)?title.slice(0,-1):title;};
const canonicalCompositionModelsFor=unit=>{
  const structured=values(unit.composition);
  if(structured.length)return structured.map(model=>({name:model.name||'',aliases:values(model.aliases),identityFacts:{sourceModels:values(model.models),min:model.min??null,max:model.max??null},...(model.intrinsicKeywords===undefined?{}:{intrinsicKeywords:model.intrinsicKeywords})})).filter(model=>model.name);
  const section=values(unit.subsections).find(item=>normalize(item?.title)==='unit composition');
  const text=typeof unit.composition==='string'?unit.composition:values(section?.blocks).filter(block=>block?.type==='p').map(block=>block.text||'').join(' ');
  if(!text.trim())return [];
  const records=[];
  const clauses=text.replace(/\r\n?/g,'\n').split(/\n|\s*[.;]\s*/).flatMap(line=>{
    const candidate=line.replace(/^\s*[-\u2022]\s*/,'').trim();
    if(!candidate||/^(?:this|the|every)\b.*\b(?:equipped|armed)\b/i.test(candidate))return [candidate];
    const composition=candidate.replace(/,\s*(?:equipped|armed)\b.*$/i,'').trim();
    return composition.split(/\s+and\s+(?=\d+(?:\s*[-\u2013]\s*\d+)?\s+)/i);
  }).map(item=>item.trim()).filter(Boolean);
  for(const clause of clauses){
    const match=clause.match(/^(\d+)(?:\s*[-\u2013]\s*(\d+))?\s+(.+?)$/);
    if(!match){if(records.length)break;return [];}
    const sourceTitle=match[3].trim(),max=Number(match[2]||match[1]);
    if(!sourceTitle||/\b(?:equipped|armed)\b/i.test(sourceTitle)){if(records.length)break;return [];}
    const name=singularModelTitle(sourceTitle,max);
    if(!name)return [];
    records.push({name,aliases:[sourceTitle],identityFacts:{sourceModels:[sourceTitle],min:Number(match[1]),max}});
  }
  return records;
};
const canonicalAbilityRecord=(unit,ability,id)=>({id,sectionId:ability.id||id,title:ability.title||'',text:ability.text||ability.summary||'',sourceUnitId:unit.id});
const assertMatchingAbilityRecords=(unit,abilities,wargearAbilities)=>{
  const ordinaryById=new Map(abilities.map(ability=>[ability.id,ability]));
  for(const wargearAbility of wargearAbilities){
    const ordinary=ordinaryById.get(wargearAbility.id);
    if(!ordinary)continue;
    for(const field of ['sectionId','title','text','sourceUnitId'])if(ordinary[field]&&wargearAbility[field]&&ordinary[field]!==wargearAbility[field])throw new Error(`${unit.id}: conflicting canonical ability ${wargearAbility.id} field ${field}`);
  }
};
export const canonicalRosterModelsFor=(unit,{enforceCompositionConstraints=false}={})=>assignCanonicalChildIdentities(unit,canonicalCompositionModelsFor(unit),{kind:'model',titleOf:model=>model.name,semanticOf:model=>({...model.identityFacts,sourceName:model.name}),legacyIdOf:(model,index)=>`${unit.id}-model-${slug(model.name)}${index?'-'+(index+1):''}`}).map(model=>{
  const keywords=model.intrinsicKeywords;
  if(keywords!==undefined&&(!Array.isArray(keywords)||keywords.some(keyword=>typeof keyword!=='string'||!keyword.trim())||new Set(keywords.map(normalize)).size!==keywords.length))throw new Error(`${unit.id}: invalid model-scoped intrinsic keywords for ${model.name}`);
  const bounds={};
  if(enforceCompositionConstraints){
    const min=Number(model.identityFacts?.min),max=Number(model.identityFacts?.max);
    if(!Number.isInteger(min)||min<0||!Number.isInteger(max)||max<min)throw new Error(`${unit.id}: invalid canonical model-count bounds for ${model.name}`);
    bounds.min=min;bounds.max=max;
  }
  return {id:model.id,title:model.name||'',aliases:[...new Set([model.name,...values(model.aliases),...values(model.identityFacts?.sourceModels)].filter(Boolean))],...bounds,...(model.legacyIds?.length?{legacyIds:model.legacyIds}:{}),...(keywords===undefined?{}:{intrinsicKeywords:[...keywords]})};
});
const canonicalCompositionRulesFor=(unit,models)=>{
  const modelIds=new Set(models.map(model=>model.id)),seen=new Set();
  return values(unit.rosterCompositionRules).map(rule=>{
    if(!rule?.id||seen.has(rule.id))throw new Error(`${unit.id}: duplicate or missing roster composition rule identity ${rule?.id||'<missing>'}`);seen.add(rule.id);
    if(rule.type!=='MODEL_QUANTITY_REQUIRES')throw new Error(`${unit.id}: ${rule.id} has unsupported roster composition rule type ${rule.type||'<missing>'}`);
    if(!modelIds.has(rule.targetModelId)||!modelIds.has(rule.requires?.modelId))throw new Error(`${unit.id}: ${rule.id} references an unknown canonical model identity`);
    if(!Number.isInteger(rule.targetQuantityAtLeast)||rule.targetQuantityAtLeast<1||!Number.isInteger(rule.requires.quantityEquals)||rule.requires.quantityEquals<0)throw new Error(`${unit.id}: ${rule.id} has invalid model quantities`);
    return{id:rule.id,type:rule.type,targetModelId:rule.targetModelId,targetQuantityAtLeast:rule.targetQuantityAtLeast,requires:{modelId:rule.requires.modelId,quantityEquals:rule.requires.quantityEquals}};
  });
};
const gameSelectionsFor=(unit,options={})=>{
  if(unit.gameSelections&&!options.deriveCanonicalFacts){const models=canonicalRosterModelsFor(unit,options);return {...projectUnitRosterWeaponFacts(unit,unit.gameSelections),stats:canonicalBaseStatsForUnit(unit,{effectContracts:options.effectContracts}),...(options.projectStatProfiles?{statProfiles:canonicalStatProfilesForUnit(unit,{preserveMultipartProfiles:options.preserveMultipartStatProfiles===true})}:{}),models,...(options.enforceCompositionConstraints?{compositionRules:canonicalCompositionRulesFor(unit,models)}:{})};}
  const canonicalWeapons=values(unit.weapons).length?values(unit.weapons):values(unit.blocks).filter(block=>block?.type==='weapon');
  const canonicalWargearAbilities=values(unit.wargearAbilities).length?values(unit.wargearAbilities):values(unit.subsections).filter(section=>normalize(section?.title)==='wargear abilities').flatMap(section=>values(section.blocks).filter(block=>block?.type==='ability'));
  const canonicalAbilities=[...values(unit.abilities),...values(unit.blocks).filter(block=>block?.type==='ability'),...values(unit.subsections).flatMap(section=>values(section?.blocks).filter(block=>block?.type==='ability'))];
  const profileRecords=assignCanonicalChildIdentities(unit,canonicalWeapons,{kind:'profile',titleOf:profile=>profile.name,semanticOf:weaponIdentityFacts,legacyIdOf:legacyWeaponProfileId.bind(null,unit)}).map(profile=>({
    id:profile.id,...(profile.legacyIds?.length?{legacyIds:profile.legacyIds}:{}),
    title:profile.name||'',mode:profile.mode||'',range:profile.range||'',a:profile.a||'',skill:profile.skill||'',s:profile.s||'',ap:profile.ap||'',d:profile.d||'',abilities:profile.abilities||''
  }));
  const profileIds=new Set(profileRecords.map(profile=>profile.id));
  const memberships=(key,label)=>values(options[key]).filter(record=>record.unitId===unit.id).map(record=>{
    if(!record.id||!Array.isArray(record.profileIds)||!record.profileIds.length)throw new Error(`${unit.id}: ${label} membership requires an ID and profile IDs`);
    if(new Set(record.profileIds).size!==record.profileIds.length)throw new Error(`${unit.id}: duplicate ${label} profile identity for ${record.id}`);
    for(const id of record.profileIds)if(!profileIds.has(id))throw new Error(`${unit.id}: ${label} ${record.id} references unknown profile ${id}`);
    return{...record,profileIds:[...record.profileIds]};
  });
  const grouped=new Map();
  for(const profile of profileRecords){const key=normalize(profile.title),group=grouped.get(key)||[];group.push(profile);grouped.set(key,group);}
  const selections=[...grouped.values()].map(group=>({id:`${unit.id}-selection-${slug(group[0].title)}`,title:group[0].title,aliases:[group[0].title],kind:'weapon',profileIds:group.map(profile=>profile.id),wargearAbilityIds:[]}));
  const familyGroups=new Map();
  for(const profile of profileRecords){const title=weaponFamilyTitle(profile.title);if(!title)continue;const key=normalize(title),group=familyGroups.get(key)||{title,profiles:[]};group.profiles.push(profile);familyGroups.set(key,group);}
  const weaponFamilies=[...familyGroups.values()].filter(group=>group.profiles.length>1).map(group=>({id:`${unit.id}-weapon-family-${slug(group.title)}`,title:group.title,aliases:[group.title],profileIds:group.profiles.map(profile=>profile.id),ambiguousAlias:grouped.has(normalize(group.title))}));
  for(const contract of memberships('weaponFamilyMemberships','weapon family')){
    const {unitId,...membership}=contract,existing=weaponFamilies.find(record=>record.id===membership.id),title=membership.title||existing?.title||membership.id;
    const exact={...existing,...membership,title,aliases:[...new Set([title,...values(membership.aliases),...values(existing?.aliases)].filter(Boolean))],ambiguousAlias:existing?.ambiguousAlias||false};
    if(existing)weaponFamilies.splice(weaponFamilies.indexOf(existing),1,exact);else weaponFamilies.push(exact);
  }
  const weaponClasses=memberships('weaponClassMemberships','weapon class').map(({unitId,...record})=>record);
  for(const family of weaponFamilies)selections.push({id:`${family.id}-selection`,title:family.title,aliases:[...family.aliases],kind:'weapon',familyId:family.id,profileIds:[...family.profileIds],wargearAbilityIds:[]});
  const declaredWargearSelections=[];
  const wargearAbilities=assignCanonicalChildIdentities(unit,canonicalWargearAbilities,{kind:'wargear-ability',titleOf:ability=>ability.title,semanticOf:abilityIdentityFacts,legacyIdOf:legacyWargearAbilityId.bind(null,unit)}).map(ability=>{const abilityId=ability.id,declared=values(ability.requiredSelections).map(selection=>{const record=typeof selection==='string'?{title:selection}:selection||{},title=record.title||'',id=record.id||`${unit.id}-selection-${slug(title)}`;declaredWargearSelections.push({id,title,aliases:[...new Set([title,...values(record.aliases)].filter(Boolean))],kind:'wargear',profileIds:[],wargearAbilityIds:[abilityId]});return id;});return{...canonicalAbilityRecord(unit,ability,abilityId),...(ability.legacyIds?.length?{legacyIds:ability.legacyIds}:{}),requiredSelectionIds:[...new Set([...values(ability.requiredSelectionIds),...declared])]};});
  for(const declared of declaredWargearSelections){const existing=selections.find(selection=>selection.id===declared.id);if(existing)existing.wargearAbilityIds=[...new Set([...values(existing.wargearAbilityIds),...declared.wargearAbilityIds])];else selections.push(declared);}
  for(const ability of wargearAbilities)if(!ability.requiredSelectionIds.length){const id=`${unit.id}-selection-${slug(ability.title)}`;if(options.inferExactWargearAbilitySelections){ability.requiredSelectionIds=[id];selections.push({id,title:ability.title,aliases:[ability.title],kind:'wargear',profileIds:[],wargearAbilityIds:[ability.id]});}else selections.push({id,title:ability.title,aliases:[ability.title],kind:'wargear',profileIds:[],wargearAbilityIds:[],candidateWargearAbilityIds:[ability.id]});}
  for(const ability of wargearAbilities)for(const selectionId of ability.requiredSelectionIds){const selection=selections.find(item=>item.id===selectionId);if(selection)selection.wargearAbilityIds=[...new Set([...values(selection.wargearAbilityIds),ability.id])];}
  for(const contract of values(unit.gameSelectionContracts)){
    const title=String(contract?.title||'').trim(),id=contract?.id||`${unit.id}-selection-${slug(title)}`;
    if(!title)throw new Error(`${unit.id}: game selection contract requires a title`);
    const matches=selections.filter(selection=>selection.id===id||normalize(selection.title)===normalize(title));
    if(matches.length>1)throw new Error(`${unit.id}: game selection contract ${title} is ambiguous`);
    const existing=matches[0],kind=contract.kind||existing?.kind||'wargear';
    if(!['weapon','wargear'].includes(kind))throw new Error(`${unit.id}: game selection contract ${title} has invalid kind ${kind}`);
    if(existing&&contract.kind&&existing.kind!==contract.kind)throw new Error(`${unit.id}: game selection contract ${title} conflicts with canonical kind ${existing.kind}`);
    const profileIds=values(contract.profileTitles).flatMap(profileTitle=>{const profiles=profileRecords.filter(profile=>normalize(profile.title)===normalize(profileTitle));if(profiles.length!==1)throw new Error(`${unit.id}: game selection contract ${title} profile ${profileTitle} must resolve exactly once`);return profiles.map(profile=>profile.id);});
    if(contract.maxTotalQuantity!==undefined&&(!Number.isInteger(contract.maxTotalQuantity)||contract.maxTotalQuantity<1))throw new Error(`${unit.id}: game selection contract ${title} has invalid maxTotalQuantity`);
    const selection=existing||{id,title,aliases:[title],kind,profileIds:[],wargearAbilityIds:[]};
    selection.aliases=[...new Set([selection.title,...values(selection.aliases),...values(contract.aliases)].filter(Boolean))];
    selection.profileIds=[...new Set([...values(selection.profileIds),...profileIds])];
    if(contract.maxTotalQuantity!==undefined)selection.maxTotalQuantity=contract.maxTotalQuantity;
    if(!existing)selections.push(selection);
  }
  const stats=canonicalBaseStatsForUnit(unit,{effectContracts:options.effectContracts});
  const explicitCounts=new Map();for(const ability of canonicalAbilities){const id=ability.id||ability.termId;if(id)explicitCounts.set(id,(explicitCounts.get(id)||0)+1);}
  const ordinaryAbilityRecords=assignCanonicalChildIdentities(unit,canonicalAbilities.map(ability=>{const id=ability.id||ability.termId;return id&&explicitCounts.get(id)===1?{...ability,id}:ability;}),{kind:'ability',titleOf:ability=>ability.title,semanticOf:abilityIdentityFacts,legacyIdOf:(ability,index)=>ability.termId||`${unit.id}-ability-${slug(ability.title)}${index?'-'+(index+1):''}`}).map(ability=>({...canonicalAbilityRecord(unit,ability,ability.id),...(ability.legacyIds?.length?{legacyIds:ability.legacyIds}:{})}));
  assertMatchingAbilityRecords(unit,ordinaryAbilityRecords,wargearAbilities);
  const wargearAbilityIds=new Set(wargearAbilities.map(ability=>ability.id)),abilities=ordinaryAbilityRecords.filter(ability=>!wargearAbilityIds.has(ability.id));
  const models=canonicalRosterModelsFor(unit,options),compositionRules=canonicalCompositionRulesFor(unit,models),wargearLegality=structuredWargearLegality(unit,models,selections);
  return {stats:{...stats},...(options.projectStatProfiles?{statProfiles:canonicalStatProfilesForUnit(unit,{preserveMultipartProfiles:options.preserveMultipartStatProfiles===true})}:{}),abilities,models,...(options.enforceCompositionConstraints?{compositionRules}:{}),selections,weaponFamilies,...(weaponClasses.length?{weaponClasses}:{}),weaponProfiles:profileRecords.map(profile=>({...profile,sourceSelectionIds:selections.filter(selection=>selection.profileIds.includes(profile.id)).map(selection=>selection.id)})),wargearAbilities,...wargearLegality};
};

const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
const sameFact=(left,right)=>JSON.stringify(stable(left))===JSON.stringify(stable(right));
const exactProjection=(current,canonical,{unitId,kind,preserve=()=>({})})=>{
  const expectedById=new Map();
  for(const item of canonical){if(expectedById.has(item.id))throw new Error(`${unitId}: duplicate canonical ${kind} ID ${item.id}`);expectedById.set(item.id,item);}
  const seen=new Set(),projected=values(current).map(item=>{
    if(!item?.id||!expectedById.has(item.id))throw new Error(`${unitId}: unknown canonical ${kind} ${item?.id||'<missing>'}`);
    if(seen.has(item.id))throw new Error(`${unitId}: duplicate roster ${kind} ID ${item.id}`);
    seen.add(item.id);return {...expectedById.get(item.id),...preserve(item)};
  });
  if(seen.size!==expectedById.size){const missing=[...expectedById.keys()].find(id=>!seen.has(id));throw new Error(`${unitId}: missing roster ${kind} ${missing}`);}
  return projected;
};
const validateSelectionProjection=(unitId,gameSelections)=>{
  const profiles=new Set(values(gameSelections.weaponProfiles).map(item=>item.id)),wargearAbilities=new Set(values(gameSelections.wargearAbilities).map(item=>item.id)),selectionIds=new Set();
  for(const selection of values(gameSelections.selections)){
    if(!selection?.id)throw new Error(`${unitId}: roster selection requires a canonical ID`);
    if(selectionIds.has(selection.id))throw new Error(`${unitId}: duplicate roster selection ID ${selection.id}`);
    selectionIds.add(selection.id);
    for(const id of values(selection.profileIds))if(!profiles.has(id))throw new Error(`${unitId}: selection ${selection.id} references unknown canonical weapon profile ${id}`);
    for(const id of [...values(selection.wargearAbilityIds),...values(selection.candidateWargearAbilityIds)])if(!wargearAbilities.has(id))throw new Error(`${unitId}: selection ${selection.id} references unknown canonical wargear ability ${id}`);
  }
  for(const ability of values(gameSelections.wargearAbilities))for(const id of values(ability.requiredSelectionIds)){
    if(!selectionIds.has(id))throw new Error(`${unitId}: wargear ability ${ability.id} references unknown canonical selection ${id}`);
    const selection=gameSelections.selections.find(item=>item.id===id);
    if(!values(selection.wargearAbilityIds).includes(ability.id))throw new Error(`${unitId}: wargear ability ${ability.id} has conflicting selection scope ${id}`);
  }
  for(const partition of ['weaponFamilies','weaponClasses']){
    const ids=new Set();for(const item of values(gameSelections[partition])){
      if(!item?.id||ids.has(item.id))throw new Error(`${unitId}: duplicate or missing canonical ${partition} identity ${item?.id||'<missing>'}`);
      ids.add(item.id);for(const id of values(item.profileIds))if(!profiles.has(id))throw new Error(`${unitId}: ${partition} ${item.id} references unknown canonical weapon profile ${id}`);
    }
  }
};
const canonicalIntrinsicKeywords=unit=>[...new Set(values(unit.intrinsicKeywords).length?unit.intrinsicKeywords:values(unit.keywords).length?unit.keywords:values((unit.ruleFacts||unit.facts||{}).intrinsicKeywords).length?(unit.ruleFacts||unit.facts).intrinsicKeywords:values((unit.ruleFacts||unit.facts||{}).keywords))];

export function projectRosterUnitGameplayFacts(units,relationGraphs,catalogUnits,{label='roster unit gameplay projection',enforceCompositionConstraints=false,projectStatProfiles=false,preserveMultipartStatProfiles=false}={}){
  const sourceById=new Map(values(units).map(unit=>[unit.id,unit])),seen=new Set();
  if(sourceById.size!==values(units).length)throw new Error(`${label}: duplicate canonical unit identity`);
  const projected=values(catalogUnits).map(item=>{
    const unit=sourceById.get(item?.id);if(!unit)throw new Error(`${label}: unknown canonical unit ${item?.id||'<missing>'}`);
    if(seen.has(item.id))throw new Error(`${label}: duplicate roster unit identity ${item.id}`);seen.add(item.id);
    const canonicalGame=gameSelectionsFor(unit,{deriveCanonicalFacts:true,enforceCompositionConstraints,projectStatProfiles,preserveMultipartStatProfiles}),currentGame=item.gameSelections||{};
    const abilities=exactProjection(currentGame.abilities,canonicalGame.abilities,{unitId:unit.id,kind:'ability'});
    const wargearAbilities=exactProjection(currentGame.wargearAbilities,canonicalGame.wargearAbilities,{unitId:unit.id,kind:'wargear ability',preserve:current=>({requiredSelectionIds:[...values(current.requiredSelectionIds)]})});
    const models=exactProjection(currentGame.models,canonicalGame.models,{unitId:unit.id,kind:'model'});
    const gameSelections={...currentGame,...(projectStatProfiles?{statProfiles:structuredClone(canonicalGame.statProfiles||[])}:{}),abilities,wargearAbilities,models,compositionRules:structuredClone(canonicalGame.compositionRules||[]),wargearDefaults:structuredClone(canonicalGame.wargearDefaults||[]),wargearOptionContracts:structuredClone(canonicalGame.wargearOptionContracts||[]),wargearSharedCaps:structuredClone(canonicalGame.wargearSharedCaps||[]),...(canonicalGame.wargearDeclarations?.length?{wargearDeclarations:structuredClone(canonicalGame.wargearDeclarations)}:{})};validateSelectionProjection(unit.id,gameSelections);
    const relations=relationsFor(relationGraphs,unit.id);
    return {...item,intrinsicKeywords:canonicalIntrinsicKeywords(unit),relations,gameSelections};
  });
  if(seen.size!==sourceById.size){const missing=[...sourceById.keys()].find(id=>!seen.has(id));throw new Error(`${label}: missing roster unit ${missing}`);}
  return projected;
}

export function assertRosterUnitGameplayProjection(units,relationGraphs,catalogUnits,{label='roster unit gameplay projection',enforceCompositionConstraints=false,projectStatProfiles=false,preserveMultipartStatProfiles=false}={}){
  const projected=projectRosterUnitGameplayFacts(units,relationGraphs,catalogUnits,{label,enforceCompositionConstraints,projectStatProfiles,preserveMultipartStatProfiles});
  for(let index=0;index<projected.length;index++){
    const expected=projected[index],actual=catalogUnits[index],partitions=[
      ['intrinsicKeywords',expected.intrinsicKeywords,actual?.intrinsicKeywords],['relations',expected.relations,actual?.relations],
      ['statProfiles',expected.gameSelections.statProfiles||[],actual?.gameSelections?.statProfiles||[]],['abilities',expected.gameSelections.abilities,actual?.gameSelections?.abilities],['wargearAbilities',expected.gameSelections.wargearAbilities,actual?.gameSelections?.wargearAbilities],['models',expected.gameSelections.models,actual?.gameSelections?.models],['compositionRules',expected.gameSelections.compositionRules||[],actual?.gameSelections?.compositionRules||[]],['wargearDefaults',expected.gameSelections.wargearDefaults||[],actual?.gameSelections?.wargearDefaults||[]],['wargearOptionContracts',expected.gameSelections.wargearOptionContracts||[],actual?.gameSelections?.wargearOptionContracts||[]],['wargearSharedCaps',expected.gameSelections.wargearSharedCaps||[],actual?.gameSelections?.wargearSharedCaps||[]],['wargearDeclarations',expected.gameSelections.wargearDeclarations||[],actual?.gameSelections?.wargearDeclarations||[]]
    ];
    for(const [partition,left,right] of partitions)if(!sameFact(left,right))throw new Error(`${label}: ${expected.id} has conflicting canonical ${partition} facts`);
  }
  return true;
}

export const canonicalDetachmentRulesFor=(detachment,options={})=>{
  const candidates=[...values(detachment.detachmentRules),...values(detachment.rules)];
  if(detachment.rule)candidates.push(detachment.rule,...values(detachment.rule.additionalRules));
  for(const section of values(detachment.subsections))if(section?.kind==='detachment-rule'||/detachment rule/i.test(section?.title||''))for(const block of values(section.blocks))candidates.push({...block,sectionId:block.sectionId||block.id||section.id});
  const records=new Map();for(const item of candidates){const sectionId=item?.sectionId||item?.sourceId||item?.id||`${detachment.id}-rule`,scopedIds=options.canonicalRuleIdsByScope?.get(`${detachment.id}\0${sectionId}`)||[],scopedId=scopedIds.length===1?scopedIds[0]:null,id=item?.termId||item?.ruleId||item?.id||scopedId||(options.inferCanonicalDetachmentRuleIds&&item?.title?`${options.bookId||'book'}-detachment-rule-${slug(item.title)}`:null);if(!id)continue;const record={...(options.preserveStructuredFields?structuredClone(item):{}),id,title:item.title||'',text:item.text||item.full||item.short||'',sectionId,detachmentId:detachment.id,detachmentTitle:detachment.title,sourceBookId:detachment.dependencyBook||detachment.sourceBookId||null},existing=records.get(id);if(existing&&!sameFact(existing,record))throw new Error(`${detachment.id}: conflicting canonical Detachment rule ${id}`);records.set(id,record);}
  return [...records.values()];
};

export const canonicalDetachmentRuleSet=(detachments,options={})=>values(detachments).flatMap(detachment=>canonicalDetachmentRulesFor(detachment,options).map(rule=>({...rule,sourceBookId:rule.sourceBookId||options.bookId||null})));

export function projectRosterDetachmentRuleFacts(detachments,catalogRules,options={}){
  const label=options.label||'roster Detachment-rule projection',canonicalRuleIdsByScope=new Map();
  for(const item of values(catalogRules)){const key=`${item?.detachmentId}\0${item?.sectionId}`;if(!item?.id)throw new Error(`${label}: missing roster Detachment-rule ID`);const ids=canonicalRuleIdsByScope.get(key)||[];ids.push(item.id);canonicalRuleIdsByScope.set(key,ids);}
  const canonical=options.canonicalRules||canonicalDetachmentRuleSet(detachments,{...options,canonicalRuleIdsByScope}),seenIds=new Set(),seenCanonical=new Set(),projected=values(catalogRules).map(item=>{
    if(!item?.id||seenIds.has(item.id))throw new Error(`${label}: duplicate or missing roster Detachment-rule ID ${item?.id||'<missing>'}`);seenIds.add(item.id);
    const exact=canonical.filter(rule=>rule.id===item.id),matches=exact.length?exact:canonical.filter(rule=>rule.detachmentId===item.detachmentId&&rule.sectionId===item.sectionId);
    if(matches.length!==1)throw new Error(`${label}: ${item.id} must resolve to one canonical Detachment rule; got ${matches.length}`);
    const rule=matches[0],key=`${rule.detachmentId}\0${rule.id}`;if(seenCanonical.has(key))throw new Error(`${label}: duplicate roster Detachment-rule source ${rule.detachmentId}/${rule.id}`);seenCanonical.add(key);
    return{...item,...rule,id:item.id};
  });
  if(seenCanonical.size!==canonical.length){const missing=canonical.find(rule=>!seenCanonical.has(`${rule.detachmentId}\0${rule.id}`));throw new Error(`${label}: missing roster Detachment rule ${missing?.id}`);}
  return projected;
}

export function assertRosterDetachmentRuleProjection(detachments,catalogRules,options={}){
  const projected=projectRosterDetachmentRuleFacts(detachments,catalogRules,options);
  if(!sameFact(projected,catalogRules))throw new Error(`${options.label||'roster Detachment-rule projection'}: conflicting canonical Detachment-rule facts`);
  return true;
}

const enhancementCandidates=item=>[item?.id,item?.ruleId,item?.sourceId,item?.legacyKey,item?.compatibilityIdentity?.canonicalEnhancementId,...values(item?.canonicalEffectRecordIds)].filter(Boolean);
export function projectRosterEnhancementFacts(enhancements,catalogEnhancements,{label='roster Enhancement projection'}={}){
  const byCandidate=new Map();
  for(const enhancement of values(enhancements))for(const id of enhancementCandidates(enhancement)){const key=`${enhancement.detachmentId}\0${id}`,existing=byCandidate.get(key);if(existing&&existing!==enhancement)throw new Error(`${label}: ambiguous canonical Enhancement identity ${enhancement.detachmentId}/${id}`);byCandidate.set(key,enhancement);}
  const seen=new Set(),projected=values(catalogEnhancements).map(item=>{
    const canonical=enhancementCandidates(item).map(id=>byCandidate.get(`${item.detachmentId}\0${id}`)).find(Boolean);
    if(!canonical)throw new Error(`${label}: unknown canonical Enhancement ${item?.detachmentId||'<missing>'}/${item?.id||'<missing>'}`);
    const key=`${canonical.detachmentId}\0${canonical.id}`;if(seen.has(key))throw new Error(`${label}: duplicate roster Enhancement projection ${canonical.detachmentId}/${canonical.id}`);seen.add(key);
    const projected={...item,canonicalEnhancementId:canonical.id,canonicalDetachmentId:canonical.detachmentId,detachmentId:canonical.detachmentId,sourceBookId:canonical.sourceBookId,value:canonical.value,text:canonical.text||'',tags:[...values(canonical.tags)]};
    for(const field of ['owner','assignment','profile']){if(canonical[field]!=null)projected[field]=structuredClone(canonical[field]);else delete projected[field];}
    if(canonical.sourceLimited)projected.sourceLimited=true;else delete projected.sourceLimited;
    return projected;
  });
  const canonicalKeys=new Set(values(enhancements).map(item=>`${item.detachmentId}\0${item.id}`));
  if(seen.size!==canonicalKeys.size){const missing=[...canonicalKeys].find(key=>!seen.has(key));throw new Error(`${label}: missing roster Enhancement ${missing?.replace('\0','/')}`);}
  return projected;
}

export function assertRosterEnhancementProjection(enhancements,catalogEnhancements,options={}){
  const projected=projectRosterEnhancementFacts(enhancements,catalogEnhancements,options);
  if(!sameFact(projected,catalogEnhancements))throw new Error(`${options.label||'roster Enhancement projection'}: conflicting canonical Enhancement facts`);
  return true;
}

const projectRosterLegality=({bookId,contracts,units,alliedUnits,detachments,enhancements})=>{
  if(!contracts)return null;
  if(contracts.schema!=='wh40k-roster-legality-contracts/v1'||contracts.bookId!==bookId)throw new Error(`${bookId}: invalid roster legality contract owner`);
  const unitIds=new Set(units.map(item=>item.id)),alliedUnitIds=new Set(alliedUnits.map(item=>item.id)),detachmentIds=new Set(detachments.map(item=>item.id)),enhancementById=new Map(enhancements.map(item=>[item.id,item]));
  const exactIds=(items,label,known)=>{if(!Array.isArray(items)||!items.length||new Set(items).size!==items.length||items.some(id=>typeof id!=='string'||!known.has(id)))throw new Error(`${bookId}: ${label} requires exact canonical identities`);return [...items];};
  const enhancementQualifiers=(contracts.enhancementQualifiers||[]).map(record=>{
    const enhancement=enhancementById.get(record.enhancementId);if(!enhancement)throw new Error(`${bookId}: unknown roster qualifier Enhancement ${record.enhancementId}`);
    const targetUnitIds=exactIds(record.targetUnitIds,`${record.id} targets`,unitIds),qualifier=values(enhancement.mfmQualifiers).find(item=>item.kind===record.qualifier?.kind&&JSON.stringify(item.values||[])===JSON.stringify(record.qualifier?.values||[]));
    if(!qualifier)throw new Error(`${bookId}: ${record.id} does not match current MFM qualifier metadata`);
    enhancement.owner={...enhancement.owner,selector:{...enhancement.owner?.selector,leadingUnitIds:targetUnitIds}};
    return {...record,targetUnitIds};
  });
  const mandatoryWarlords=(contracts.mandatoryWarlords||[]).map(record=>({...record,unitIds:exactIds(record.unitIds,`${record.id} units`,unitIds)}));
  const pointCaps=(contracts.pointCaps||[]).map(record=>{const selectedDetachments=exactIds(record.detachmentIds,`${record.id} detachments`,detachmentIds),limits=values(record.limits);if(!limits.length||limits.some(item=>!Number.isSafeInteger(item.pointsLimit)||item.pointsLimit<1||!Number.isSafeInteger(item.maxPoints)||item.maxPoints<0))throw new Error(`${bookId}: ${record.id} has invalid point limits`);return{...record,detachmentIds:selectedDetachments,limits};});
  const warlordProhibitions=(contracts.warlordProhibitions||[]).map(record=>({...record,detachmentIds:exactIds(record.detachmentIds,`${record.id} detachments`,detachmentIds)}));
  const alliedMusters=(contracts.alliedMusters||[]).map(record=>{const selectedUnitIds=exactIds(record.unitIds,`${record.id} allied units`,alliedUnitIds),limits=values(record.limits),keywordGrants=values(record.keywordGrants);if(!limits.length||limits.some(item=>!Number.isSafeInteger(item.pointsLimit)||item.pointsLimit<1||!Number.isSafeInteger(item.maxPoints)||item.maxPoints<0))throw new Error(`${bookId}: ${record.id} has invalid allied point limits`);if(!keywordGrants.length||keywordGrants.some(value=>typeof value!=='string'||!value.trim()))throw new Error(`${bookId}: ${record.id} requires exact allied keyword grants`);return{...record,unitIds:selectedUnitIds,keywordGrants:[...new Set(keywordGrants)],limits};});
  const musterChoices=(contracts.musterChoices||[]).map(record=>{const selectedDetachments=exactIds(record.detachmentIds,`${record.id} detachments`,detachmentIds),selectedUnitIds=exactIds(record.unitIds,`${record.id} units`,unitIds),groups=values(record.selectionGroups),abilityGrants=values(record.abilityGrants);if(!groups.length||new Set(groups.map(item=>item.id)).size!==groups.length)throw new Error(`${bookId}: ${record.id} requires unique selection groups`);const covered=[];for(const group of groups){group.unitIds=exactIds(group.unitIds,`${record.id}/${group.id} units`,unitIds);if(group.unitIds.some(id=>!selectedUnitIds.includes(id)))throw new Error(`${bookId}: ${record.id}/${group.id} unit falls outside choice eligibility`);covered.push(...group.unitIds);const limits=values(group.limits);if(!limits.length||limits.some(item=>!Number.isSafeInteger(item.pointsLimit)||item.pointsLimit<1||!Number.isSafeInteger(item.maxSelected)||item.maxSelected<0))throw new Error(`${bookId}: ${record.id}/${group.id} has invalid battle-size limits`);group.limits=limits;}if(new Set(covered).size!==covered.length||new Set(covered).size!==selectedUnitIds.length)throw new Error(`${bookId}: ${record.id} selection groups must partition eligible units`);if(!abilityGrants.length||abilityGrants.some(item=>!item?.id||!item?.title))throw new Error(`${bookId}: ${record.id} requires canonical ability grants`);return{...record,detachmentIds:selectedDetachments,unitIds:selectedUnitIds,selectionGroups:groups,abilityGrants};});
  return{schema:contracts.schema,bookId,enhancementQualifiers,mandatoryWarlords,pointCaps,warlordProhibitions,alliedMusters,musterChoices};
};

export function createRosterCatalog({config,units=[],alliedUnits=[],detachments=[],relationGraphs=new Map(),legacyEnhancements={},enhancementContracts=null,keywordGrants=[],effectContracts=[],rosterLegality=null}){
  const dependencies=dependencyRecords(config);
  const rosterCatalog={bookId:config.id,...config.rosterCatalog};
  const effectiveUnitIds=new Set(units.map(unit=>unit.id));
  for(const [key,label] of [['weaponClassMemberships','weapon class'],['weaponFamilyMemberships','weapon family']]){
    const seen=new Set();
    for(const record of values(rosterCatalog[key])){
      if(!effectiveUnitIds.has(record?.unitId))throw new Error(`${config.id}: ${label} ${record?.id||'<missing>'} references unknown unit ${record?.unitId||'<missing>'}`);
      const identity=`${record.unitId}\0${record.id}`;
      if(seen.has(identity))throw new Error(`${config.id}: duplicate ${label} membership ${record.unitId}/${record.id}`);
      seen.add(identity);
    }
  }
  const compatibilityByUnit=config.unitCompatibleChapterKeywords||{};
  for(const [unitId,keywords] of Object.entries(compatibilityByUnit)){
    if(units.filter(unit=>unit.id===unitId).length!==1)throw new Error(`${config.id}: unit compatibility ${unitId} must resolve exactly once`);
    if(!Array.isArray(keywords)||!keywords.length||keywords.some(value=>typeof value!=='string'||!value.trim()))throw new Error(`${config.id}: unit compatibility ${unitId} requires non-empty chapter keywords`);
    if(new Set(keywords.map(normalize)).size!==keywords.length)throw new Error(`${config.id}: unit compatibility ${unitId} contains duplicate chapter keywords`);
  }
  const catalogUnits=units.map(unit=>{const facts=rosterCatalog.includeRuleFacts===false?{}:unit.ruleFacts||unit.facts||{},compatibleChapterKeywords=compatibilityByUnit[unit.id]||[];return {id:unit.id,title:unit.title,sourceBookId:unit.dependencyBook||unit.sourceBookId||config.id,sourceLayer:unit.sourceLayer||unit.status||'current',intrinsicKeywords:[...new Set(values(unit.intrinsicKeywords).length?unit.intrinsicKeywords:values(unit.keywords).length?unit.keywords:values(facts.intrinsicKeywords).length?facts.intrinsicKeywords:values(facts.keywords))],...(compatibleChapterKeywords.length?{compatibleChapterKeywords:[...compatibleChapterKeywords]}:{}),relations:relationsFor(relationGraphs,unit.id),ruleFacts:{...facts,relations:relationsFor(relationGraphs,unit.id)},gameSelections:gameSelectionsFor(unit,{...rosterCatalog,effectContracts})};});
  const catalogAlliedUnits=alliedUnits.map(unit=>({id:unit.id,title:unit.title,sourceBookId:unit.sourceBookId,sourceLayer:unit.sourceLayer||'centralized-mfm-allied-dependency',intrinsicKeywords:[],relations:{canLead:[],canSupport:[],canBeLedBy:[],canBeSupportedBy:[]},ruleFacts:{relations:{canLead:[],canSupport:[],canBeLedBy:[],canBeSupportedBy:[]}},gameSelections:{musterOnly:true,models:[],compositionRules:[],selections:[],weaponProfiles:[],abilities:[],wargearAbilities:[]},points:unit.points,mfmRecordId:unit.mfmRecordId,unitReferenceId:unit.unitReferenceId}));
  if(new Set([...catalogUnits,...catalogAlliedUnits].map(item=>item.id)).size!==catalogUnits.length+catalogAlliedUnits.length)throw new Error(`${config.id}: allied roster identity collides with published unit`);
  const grantByDetachment=new Map((Array.isArray(keywordGrants)?keywordGrants.map(record=>[record.detachmentId||record.id,record]):Object.entries(keywordGrants).map(([detachmentId,grants])=>[detachmentId,{detachmentId,grants:values(grants)}])));
  const detachmentRules=canonicalDetachmentRuleSet(detachments,{...rosterCatalog,bookId:config.id}),ruleIdsByDetachment=new Map(detachments.map(detachment=>[detachment.id,detachmentRules.filter(rule=>rule.detachmentId===detachment.id).map(rule=>rule.id)]));
  const catalogDetachments=detachments.map(detachment=>({id:detachment.id,title:detachment.title,sourceBookId:detachment.dependencyBook||detachment.sourceBookId||config.id,chapterRestriction:detachment.chapterRestriction||detachment.restriction||null,keywordGrants:values(detachment.keywordGrants).length?detachment.keywordGrants:values(grantByDetachment.get(detachment.id)?.grants||grantByDetachment.get(detachment.id)?.keywordGrants),detachmentRuleIds:ruleIdsByDetachment.get(detachment.id)||[]}));
  const legacyEntries=Object.entries(legacyEnhancements||{}),enhancements=[];
  if(Array.isArray(enhancementContracts)){
    const scoped=new Set();for(const item of enhancementContracts){if(!item.id||!item.detachmentId)throw new Error(`${config.id}: canonical Enhancement requires exact identity and Detachment ID`);const key=`${item.detachmentId}\0${item.id}`;if(scoped.has(key))throw new Error(`${config.id}: duplicate scoped Enhancement identity ${key}`);scoped.add(key);enhancements.push({...item});}
  }else{
    const legacyByCompound=new Map(legacyEntries.flatMap(([legacyKey,item])=>[item?.id,item?.ruleId,item?.sourceId,item?.title].filter(Boolean).map(value=>[`${item?.detachmentId||''}\0${normalize(value)}`,{legacyKey,...item}])));
    for(const detachment of detachments)for(const item of blockEnhancements(detachment)){const legacy=[item.id,item.ruleId,item.sourceId,item.title].filter(Boolean).map(value=>legacyByCompound.get(`${detachment.id}\0${normalize(value)}`)).find(Boolean)||{};enhancements.push({...legacy,...item,id:legacy.ruleId||legacy.id||item.ruleId||item.id,title:item.title||legacy.title,detachmentId:detachment.id,sourceBookId:detachment.dependencyBook||detachment.sourceBookId||config.id,legacyKey:legacy.legacyKey||item.ruleId||item.id});}
    for(const [legacyKey,item] of legacyEntries){if(enhancements.some(record=>record.legacyKey===legacyKey)||rosterCatalog.dedupeLegacyEnhancementsByTitle&&enhancements.some(record=>normalize(record.title)===normalize(item.title)))continue;enhancements.push({...item,id:item.ruleId||item.id||legacyKey,legacyKey,sourceBookId:item.sourceBookId||config.id});}
  }
  const projectedEnhancements=Array.isArray(enhancementContracts)?projectRosterEnhancementFacts(enhancementContracts,enhancements,{label:`${config.id} roster Enhancement projection`}):enhancements,projectedRosterLegality=projectRosterLegality({bookId:config.id,contracts:rosterLegality,units:catalogUnits,alliedUnits:catalogAlliedUnits,detachments:catalogDetachments,enhancements:projectedEnhancements});
  return {schema:'wh40k-army-roster-catalog/v1',book:{id:config.id,title:config.title||config.bookTitle||config.id,factionKeyword:config.factionKeyword||null,parentBookId:dependencies[0]?.bookId||dependencies[0]?.id||null,dependencies:dependencies.map(item=>({bookId:item.bookId||item.id,title:item.title||null}))},...(rosterCatalog.enforceCompositionConstraints===true?{compositionConstraints:true}:{}),...(rosterCatalog.projectStatProfiles===true?{statProfiles:true}:{}),...(rosterCatalog.preserveMultipartStatProfiles===true?{preserveMultipartStatProfiles:true}:{}),units:catalogUnits,...(catalogAlliedUnits.length?{alliedUnits:catalogAlliedUnits}:{}),detachments:catalogDetachments,detachmentRules,enhancements:projectedEnhancements,effectContracts,...(projectedRosterLegality?{rosterLegality:projectedRosterLegality}:{})};
}

export function serializeRosterCatalog(catalog,legacyEnhancements={}){
  return `window.WH_BOOK_ROSTER_CATALOG=Object.freeze(${JSON.stringify(catalog,null,2)});\nwindow.WH_BOOK_ROSTER_ENHANCEMENTS=Object.freeze(${JSON.stringify(legacyEnhancements||{},null,2)});\n`;
}
