import {validateEffectContractSet,EFFECT_SCHEMA} from './effect-contract.mjs';
import {assertEffectivePointsProjection} from './effective-points-projection.mjs';
import {pointTierContract} from './point-tier-contract.mjs';
import {assertRosterBaseStatProjection,projectRosterBaseStats} from './canonical-unit-stats.mjs';
import {assertRosterWeaponFactProjection,projectRosterWeaponFacts} from './canonical-weapon-profile-facts.mjs';
import {assertRosterDetachmentRuleProjection,assertRosterEnhancementProjection,assertRosterUnitGameplayProjection,projectRosterDetachmentRuleFacts,projectRosterEnhancementFacts,projectRosterUnitGameplayFacts} from './build-roster-catalog.mjs';

export const EFFECTIVE_BOOK_MODEL_SCHEMA='wh40k-effective-book-model/v1';
export const PUBLICATION_STATES=new Set(['Current','Legends','Warhammer Legends']);

const SEMANTIC_PARTITIONS=new Set([
  'book','dependencies','sources','units','detachments','enhancements','rules','relations','relationGraphs',
  'effectContracts','effectivePointsProjection','ruleFacts','ruleProfiles','compiledRuleProfiles','rosterCatalog',
  'rosterEnhancements','glossary','navigation','targets'
]);
const record=value=>value!==null&&typeof value==='object'&&!Array.isArray(value)&&!(value instanceof Map);
const list=(value,label)=>{if(!Array.isArray(value))throw new Error(`${label} must be an array`);return value;};
const text=(value,label)=>{if(typeof value!=='string'||!value.trim()||value.trim()!==value)throw new Error(`${label} must be a non-empty trimmed string`);return value;};
const canonicalId=(value,label)=>{const id=text(value,label);if(!/^[a-z0-9][a-z0-9-]*$/.test(id))throw new Error(`${label} must be a canonical ID`);return id;};
const finite=(value,label,{optional=false}={})=>{if(optional&&value==null)return;if(typeof value!=='number'||!Number.isFinite(value)||value<0)throw new Error(`${label} must be a non-negative finite number`);};
const identitySet=(items,key,label)=>{
  const seen=new Set();
  for(const [index,item] of items.entries()){
    const id=key(item,index);
    if(seen.has(id))throw new Error(`duplicate ${label} identity: ${id.replaceAll('\0',' / ')}`);
    seen.add(id);
  }
  return seen;
};

function assertDataOnly(value,label,ancestors=new WeakSet()){
  if(value==null||value===undefined||['string','boolean'].includes(typeof value))return;
  if(typeof value==='number'){if(!Number.isFinite(value))throw new Error(`${label} contains a non-finite number`);return;}
  if(typeof value!=='object')throw new Error(`${label} must contain data only`);
  if(ancestors.has(value))throw new Error(`${label} must not contain cycles`);
  ancestors.add(value);
  if(Array.isArray(value))value.forEach((item,index)=>assertDataOnly(item,`${label}[${index}]`,ancestors));
  else if(value instanceof Map){for(const [key,item] of value){if(typeof key!=='string')throw new Error(`${label} Map keys must be strings`);assertDataOnly(item,`${label}.${key}`,ancestors);}}
  else{
    const prototype=Object.getPrototypeOf(value);
    if(prototype!==Object.prototype&&prototype!==null)throw new Error(`${label} must contain plain data objects`);
    for(const [key,item] of Object.entries(value)){
      if(['__proto__','prototype','constructor'].includes(key))throw new Error(`${label} contains a prohibited key`);
      assertDataOnly(item,`${label}.${key}`,ancestors);
    }
  }
  ancestors.delete(value);
}

const dependencyId=item=>typeof item==='string'?item:item?.bookId||item?.id;
function dependencyIds(model,bookId){
  const top=model.dependencies==null?[]:list(model.dependencies,'dependencies');
  const nested=model.book.dependencies==null?[]:list(model.book.dependencies,'book.dependencies');
  const validate=(items,label)=>{
    const ids=identitySet(items,(item,index)=>canonicalId(dependencyId(item),`${label}[${index}].bookId`),`${label} book`);
    for(const item of items)if(typeof item!=='string'){
      if(!record(item))throw new Error(`${label} entries must be strings or objects`);
      const id=dependencyId(item);
      if(item.ownerBookId!=null&&item.ownerBookId!==id)throw new Error(`${id}: dependency provenance owner mismatch`);
      if(item.active===false)throw new Error(`${id}: inactive dependency cannot enter the effective model`);
      const kind=item.kind||item.type;
      if(kind!=null&&!['effective-book-dependency','CANONICAL_SOURCE_DEPENDENCY'].includes(kind))throw new Error(`${id}: unsupported dependency provenance ${kind}`);
    }
    return ids;
  };
  const topIds=validate(top,'dependencies'),nestedIds=validate(nested,'book.dependencies');
  if(top.length&&nested.length&&JSON.stringify([...topIds].sort())!==JSON.stringify([...nestedIds].sort()))throw new Error(`${bookId}: conflicting dependency partitions`);
  const ids=top.length?topIds:nestedIds;
  if(ids.has(bookId))throw new Error(`${bookId}: a book cannot depend on itself`);
  if(model.book.parentBookId!=null&&!ids.has(canonicalId(model.book.parentBookId,'book.parentBookId')))throw new Error(`${bookId}: parentBookId is not a declared dependency`);
  return ids;
}

const sourceOwner=(source,bookId)=>source.ownerBookId||source.bookId||source.sourceBookId||bookId;
function sourceRecords(model,allowedOwners){
  const direct=model.sources==null?null:list(model.sources,'sources');
  const nested=model.provenance?.sources==null?null:list(model.provenance.sources,'provenance.sources');
  if(direct&&nested)throw new Error('source provenance must have one owner partition');
  const sources=direct||nested||[];
  const ids=identitySet(sources,(source,index)=>canonicalId(source?.sourceId||source?.id,`sources[${index}].sourceId`),'source'),owners=new Map();
  for(const source of sources){
    if(!record(source))throw new Error('source provenance entries must be objects');
    const id=source.sourceId||source.id,owner=canonicalId(sourceOwner(source,''),`${id}.ownerBookId`);
    if(!allowedOwners.has(owner))throw new Error(`${id}: unknown source owner ${owner}`);
    owners.set(id,owner);
    if(![source.classification,source.status,source.lifecycle].some(value=>typeof value==='string'&&value.trim()))throw new Error(`${id}: source classification or lifecycle is required`);
    if(![source.locator,source.path,source.url].some(value=>typeof value==='string'&&value.trim())&&!['paths','artifacts'].some(key=>Array.isArray(source[key])&&source[key].length))throw new Error(`${id}: source provenance locator is required`);
  }
  return {sources,ids,owners};
}

function validateDependencySourceBindings(model,sourceOwners){
  if(!sourceOwners.size)return;
  const dependencies=model.dependencies?.length?model.dependencies:model.book.dependencies||[];
  for(const dependency of dependencies){
    if(typeof dependency==='string'||dependency.sourceIds==null)continue;
    const bookId=dependencyId(dependency);
    for(const sourceId of list(dependency.sourceIds,`${bookId}.sourceIds`)){
      canonicalId(sourceId,`${bookId}.sourceIds entry`);
      if(!sourceOwners.has(sourceId))throw new Error(`${bookId}: unknown dependency source ${sourceId}`);
      if(sourceOwners.get(sourceId)!==bookId)throw new Error(`${bookId}: dependency source ${sourceId} belongs to ${sourceOwners.get(sourceId)}`);
    }
  }
}

function validatePointSchedule(unit,bookId){
  const rows=list(unit.points,`${bookId}: ${unit.id}.points`);
  if(!rows.length)throw new Error(`${bookId}: ${unit.id} is missing a required point schedule`);
  const normalized=rows.map((row,index)=>{
    finite(row?.value,`${bookId}: ${unit.id} point tier ${index+1}.value`);
    return pointTierContract.normalizeTier(row);
  });
  identitySet(normalized,row=>pointTierContract.boundsKey(row),`${unit.id} point tier`);
  if(normalized.length>1)pointTierContract.validateStructuredTiers(normalized);
  for(const [index,row] of list(unit.paidWargear??[],`${bookId}: ${unit.id}.paidWargear`).entries()){
    text(row?.label||row?.name,`${bookId}: ${unit.id} paid wargear ${index+1}.label`);
    finite(row?.value,`${bookId}: ${unit.id} paid wargear ${index+1}.value`);
  }
  identitySet(unit.paidWargear??[],row=>row.label||row.name,`${unit.id} paid wargear`);
}

function validateRuleInput(unit,bookId){
  const profile=unit.ruleProfile;
  if(profile!=null){
    if(!record(profile)||profile.id!==unit.id||profile.unitId!==unit.id)throw new Error(`${bookId}: ${unit.id} has a conflicting canonical rule profile`);
    return;
  }
  const fallback=unit.ruleFacts||unit.gameSelections||unit.publicationRecord;
  if(!record(fallback))throw new Error(`${bookId}: ${unit.id} requires canonical rule facts, selections, or a source record`);
  if(unit.ruleFacts?.id&&unit.ruleFacts.id!==unit.id||unit.ruleFacts?.unitId&&unit.ruleFacts.unitId!==unit.id)throw new Error(`${bookId}: ${unit.id} has conflicting rule facts`);
}

function validateRelations(model,unitIds,bookId){
  if(model.relations==null&&model.relationGraphs==null)throw new Error(`${bookId}: relations or relationGraphs is required`);
  if(model.relations!=null){
    const edges=list(model.relations,'relations');
    identitySet(edges,(edge,index)=>`${text(edge?.role,`relations[${index}].role`)}\0${canonicalId(edge?.sourceId,`relations[${index}].sourceId`)}\0${canonicalId(edge?.targetId,`relations[${index}].targetId`)}`,'relation');
    for(const edge of edges)if(!unitIds.has(edge.sourceId)||!unitIds.has(edge.targetId))throw new Error(`${bookId}: unknown relation target ${edge.sourceId} -> ${edge.targetId}`);
  }
  if(model.relationGraphs!=null){
    const entries=model.relationGraphs instanceof Map?[...model.relationGraphs]:Object.entries(model.relationGraphs);
    identitySet(entries,entry=>canonicalId(entry[0],'relationGraphs owner'),'relation graph owner');
    for(const [owner,graph] of entries){
      if(!unitIds.has(owner))throw new Error(`${bookId}: unknown relation graph owner ${owner}`);
      if(!record(graph))throw new Error(`${bookId}: relation graph ${owner} must be an object`);
      for(const [role,targets] of Object.entries(graph)){
        if(!Array.isArray(targets))continue;
        const seen=new Set();
        for(const [index,target] of targets.entries()){
          const targetId=canonicalId(typeof target==='string'?target:target?.unitId,`${owner}.${role}[${index}].unitId`);
          if(!unitIds.has(targetId))throw new Error(`${bookId}: unknown relation target ${owner} -> ${targetId}`);
          if(seen.has(targetId))throw new Error(`${bookId}: duplicate relation graph target ${owner} / ${role} / ${targetId}`);
          seen.add(targetId);
        }
      }
    }
  }
}

function validateEffects(model,allowedOwners,sourceOwners,effectEnhancementIds,detachmentIds,unitIds){
  const contracts=list(model.effectContracts,'effectContracts'),byOwner=new Map();
  for(const contract of contracts){
    const owner=canonicalId(contract?.sourceBookId,'effect contract sourceBookId');
    if(!allowedOwners.has(owner))throw new Error(`${contract?.canonicalRecordId||'<effect>'}: unknown effect source owner ${owner}`);
    if(!contract.effectiveBookIds?.includes(model.book.id))throw new Error(`${contract?.canonicalRecordId||'<effect>'}: contract is not effective for ${model.book.id}`);
    if(!byOwner.has(owner))byOwner.set(owner,[]);byOwner.get(owner).push(contract);
  }
  for(const [owner,owned] of byOwner)validateEffectContractSet({schema:EFFECT_SCHEMA,bookId:owner,contracts:owned},{expectedBookId:owner});
  for(const contract of contracts){
    if(contract.detachmentId&&!detachmentIds.has(contract.detachmentId)&&contract.sourceBookId===model.book.id)throw new Error(`${contract.canonicalRecordId}: unknown Detachment ${contract.detachmentId}`);
    for(const id of [contract.sourceUnitId,...(contract.sourceUnitIds||[])].filter(Boolean))if(!unitIds.has(id)&&contract.sourceBookId===model.book.id)throw new Error(`${contract.canonicalRecordId}: unknown source unit ${id}`);
    if(contract.sourceKind==='enhancement'&&(!contract.detachmentId||detachmentIds.has(contract.detachmentId)||contract.sourceBookId===model.book.id)){
      const scoped=contract.detachmentId&&effectEnhancementIds.has(`${contract.detachmentId}\0${contract.canonicalRecordId}`);
      const unscoped=!contract.detachmentId&&[...effectEnhancementIds].filter(id=>id.endsWith(`\0${contract.canonicalRecordId}`)).length===1;
      if(!scoped&&!unscoped)throw new Error(`${contract.canonicalRecordId}: unknown canonical Enhancement`);
    }
    if(sourceOwners.size){
      const sourceId=contract.source?.sourceId;
      if(!sourceOwners.has(sourceId))throw new Error(`${contract.canonicalRecordId}: unknown source provenance ${sourceId||'<missing>'}`);
      if(sourceOwners.get(sourceId)!==contract.sourceBookId)throw new Error(`${contract.canonicalRecordId}: source provenance belongs to ${sourceOwners.get(sourceId)}`);
    }
  }
}

const sorted=value=>[...value].sort();
const sameIds=(actual,expected,label)=>{if(JSON.stringify(sorted(actual))!==JSON.stringify(sorted(expected)))throw new Error(`conflicting ${label} partitions`);};
function validateProjection(model,dependencyIds,unitIds,detachmentIds,enhancementIds){
  const projection=assertEffectivePointsProjection(model.effectivePointsProjection,model.book.id);
  if(projection.book.title!==model.book.title||projection.book.parentBookId!==model.book.parentBookId)throw new Error('conflicting book identity partitions');
  sameIds(new Set(projection.dependencies.map(dependencyId)),dependencyIds,'dependency');
  sameIds(new Set(projection.units.map(item=>item.id)),unitIds,'unit');
  sameIds(new Set(projection.detachments.map(item=>item.id)),detachmentIds,'Detachment');
  sameIds(new Set(projection.enhancements.map(item=>`${item.detachmentId}\0${item.id}`)),enhancementIds,'Enhancement');
  const unitById=new Map(model.units.map(item=>[item.id,item]));
  for(const item of projection.units){
    const unit=unitById.get(item.id);
    if(item.title!==unit.title||item.sourceBookId!==unit.sourceBookId)throw new Error(`${item.id}: conflicting unit identity partitions`);
    if(JSON.stringify(item.points)!==JSON.stringify(unit.points)||JSON.stringify(item.paidWargear||[])!==JSON.stringify(unit.paidWargear||[]))throw new Error(`${item.id}: conflicting points partitions`);
    if(item.publicationState!==unit.publicationState)throw new Error(`${item.id}: conflicting publication state partitions`);
  }
  const detachmentById=new Map(model.detachments.map(item=>[item.id,item]));
  for(const item of projection.detachments){
    const modelItem=detachmentById.get(item.id);
    if(item.title!==modelItem.title||item.sourceBookId!==modelItem.sourceBookId)throw new Error(`${item.id}: conflicting Detachment identity partitions`);
    if(item.detachmentPoints!==modelItem.detachmentPoints||item.forceDisposition!==modelItem.forceDisposition)throw new Error(`${item.id}: conflicting Detachment facts partitions`);
  }
  const enhancementById=new Map(model.enhancements.map(item=>[`${item.detachmentId}\0${item.id}`,item]));
  for(const item of projection.enhancements){
    const modelItem=enhancementById.get(`${item.detachmentId}\0${item.id}`);
    if(item.title!==modelItem.title||item.sourceBookId!==modelItem.sourceBookId)throw new Error(`${item.id}: conflicting Enhancement identity partitions`);
    if(modelItem.value!=null&&item.value!==modelItem.value)throw new Error(`${item.id}: conflicting Enhancement points partitions`);
  }
}

const sameFact=(left,right)=>JSON.stringify(left)===JSON.stringify(right);
function validateRosterProjection(model,unitIds,detachmentIds,enhancementIds){
  const catalog=model.rosterCatalog;
  if(catalog==null)return;
  if(!record(catalog)||catalog.book?.id!==model.book.id)throw new Error('roster catalog has a conflicting book identity');
  sameIds(new Set(list(catalog.units,'rosterCatalog.units').map(item=>item.id)),unitIds,'roster unit');
  assertRosterBaseStatProjection(model.units,catalog.units,{label:`${model.book.id} effective roster base-stat projection`,effectContracts:model.effectContracts});
  assertRosterWeaponFactProjection(model.units,catalog.units,{label:`${model.book.id} effective roster weapon-fact projection`});
  assertRosterUnitGameplayProjection(model.units,model.relationGraphs,catalog.units,{label:`${model.book.id} effective roster unit-gameplay projection`,enforceCompositionConstraints:catalog.compositionConstraints===true});
  sameIds(new Set(list(catalog.detachments,'rosterCatalog.detachments').map(item=>item.id)),detachmentIds,'roster Detachment');
  assertRosterDetachmentRuleProjection(model.detachments,list(catalog.detachmentRules,'rosterCatalog.detachmentRules'),{bookId:model.book.id,canonicalRules:model.detachmentRules,label:`${model.book.id} effective roster Detachment-rule projection`});
  const canonicalByCandidate=new Map();
  for(const item of model.enhancements){
    for(const id of [item.id,item.ruleId,item.sourceId,item.legacyKey,item.compatibilityIdentity?.canonicalEnhancementId,...(item.canonicalEffectRecordIds||[])].filter(Boolean)){
      const key=`${item.detachmentId}\0${id}`,existing=canonicalByCandidate.get(key);
      if(existing&&existing!==item)throw new Error(`${model.book.id}: ambiguous roster Enhancement compatibility identity ${id}`);
      canonicalByCandidate.set(key,item);
    }
  }
  const rosterEnhancements=list(catalog.enhancements,'rosterCatalog.enhancements'),resolved=new Set();
  for(const item of rosterEnhancements){
    const canonical=canonicalByCandidate.get(`${item.detachmentId}\0${item.id}`);
    if(!canonical)throw new Error(`${model.book.id}: roster Enhancement ${item.detachmentId||'<missing>'}/${item.id||'<missing>'} has no canonical identity`);
    const canonicalKey=`${canonical.detachmentId}\0${canonical.id}`;
    if(resolved.has(canonicalKey))throw new Error(`${model.book.id}: duplicate roster Enhancement projection ${canonicalKey.replace('\0',' / ')}`);
    resolved.add(canonicalKey);
    if(item.value!==canonical.value)throw new Error(`${canonical.id}: conflicting roster Enhancement points`);
    if(item.sourceBookId!==canonical.sourceBookId)throw new Error(`${canonical.id}: conflicting roster Enhancement owner book`);
    if(item.text!==canonical.text)throw new Error(`${canonical.id}: conflicting roster Enhancement gameplay text`);
    for(const field of ['owner','assignment','tags'])if(item[field]!=null&&canonical[field]!=null&&!sameFact(item[field],canonical[field]))throw new Error(`${canonical.id}: conflicting roster Enhancement ${field}`);
  }
  sameIds(resolved,enhancementIds,'roster Enhancement');
  assertRosterEnhancementProjection(model.enhancements,rosterEnhancements,{label:`${model.book.id} effective roster Enhancement projection`});
}

function validatePresentation(presentation){
  if(presentation==null)return;
  if(!record(presentation))throw new Error('presentation must be a data object');
  for(const key of Object.keys(presentation))if(SEMANTIC_PARTITIONS.has(key))throw new Error(`presentation cannot own semantic partition ${key}`);
  assertDataOnly(presentation,'presentation');
}

export function validateEffectiveBookModel(model){
  if(!record(model)||model.schema!==EFFECTIVE_BOOK_MODEL_SCHEMA)throw new Error(`Unsupported effective book model schema: ${model?.schema||'<missing>'}`);
  if(model.glossaryFacts!=null)throw new Error('glossaryFacts must be derived from the final effective model');
  if(!record(model.book))throw new Error('effective book model requires book identity');
  const bookId=canonicalId(model.book.id,'book.id');text(model.book.title,'book.title');
  const dependencies=dependencyIds(model,bookId),allowedOwners=new Set([bookId,...dependencies]);
  const {owners:sourceOwners}=sourceRecords(model,allowedOwners);validateDependencySourceBindings(model,sourceOwners);
  const units=list(model.units,'units'),detachments=list(model.detachments,'detachments'),enhancements=list(model.enhancements,'enhancements');
  const unitIds=identitySet(units,(unit,index)=>canonicalId(unit?.id,`units[${index}].id`),`${bookId} unit`);
  const detachmentIds=identitySet(detachments,(item,index)=>canonicalId(item?.id,`detachments[${index}].id`),`${bookId} Detachment`);
  const enhancementIds=identitySet(enhancements,(item,index)=>`${canonicalId(item?.detachmentId,`enhancements[${index}].detachmentId`)}\0${canonicalId(item?.id,`enhancements[${index}].id`)}`,`${bookId} scoped Enhancement`);
  const effectEnhancementOwners=new Map();
  for(const enhancement of enhancements)for(const candidate of [enhancement.id,enhancement.ruleId,enhancement.sourceId,enhancement.compatibilityIdentity?.canonicalEnhancementId,...(enhancement.canonicalEffectRecordIds||[])].filter(Boolean)){
    canonicalId(candidate,`${enhancement.id} compatibility identity`);
    const scoped=`${enhancement.detachmentId}\0${candidate}`,owner=effectEnhancementOwners.get(scoped);
    if(owner&&owner!==enhancement.id)throw new Error(`${bookId}: ambiguous Enhancement compatibility identity ${candidate}`);
    effectEnhancementOwners.set(scoped,enhancement.id);
  }
  for(const unit of units){
    text(unit.title,`${unit.id}.title`);canonicalId(unit.sourceBookId,`${unit.id}.sourceBookId`);
    if(!allowedOwners.has(unit.sourceBookId))throw new Error(`${unit.id}: unknown source owner ${unit.sourceBookId}`);
    if(!PUBLICATION_STATES.has(unit.publicationState))throw new Error(`${unit.id}: invalid publication state ${unit.publicationState}`);
    const weaponProfiles=(unit.weapons?.length?unit.weapons:(unit.blocks||[]).filter(block=>block?.type==='weapon'));
    identitySet(weaponProfiles,(profile,index)=>{const id=canonicalId(profile?.id,`${unit.id}.weaponProfiles[${index}].id`);if(profile.sourceUnitId!==unit.id)throw new Error(`${id}: weapon profile belongs to wrong parent ${profile.sourceUnitId||'<missing>'}`);return id;},`${unit.id} weapon profile`);
    validatePointSchedule(unit,bookId);validateRuleInput(unit,bookId);
  }
  for(const detachment of detachments){
    text(detachment.title,`${detachment.id}.title`);canonicalId(detachment.sourceBookId,`${detachment.id}.sourceBookId`);
    if(!allowedOwners.has(detachment.sourceBookId))throw new Error(`${detachment.id}: unknown source owner ${detachment.sourceBookId}`);
    finite(detachment.detachmentPoints,`${detachment.id}.detachmentPoints`);
    if(detachment.forceDisposition!=null&&typeof detachment.forceDisposition!=='string')throw new Error(`${detachment.id}.forceDisposition must be a string`);
  }
  for(const enhancement of enhancements){
    text(enhancement.title,`${enhancement.id}.title`);canonicalId(enhancement.sourceBookId,`${enhancement.id}.sourceBookId`);
    text(enhancement.text,`${enhancement.id}.text`);
    if(!allowedOwners.has(enhancement.sourceBookId))throw new Error(`${enhancement.id}: unknown source owner ${enhancement.sourceBookId}`);
    if(!detachmentIds.has(enhancement.detachmentId))throw new Error(`${enhancement.id}: unknown Detachment ${enhancement.detachmentId}`);
    finite(enhancement.value,`${enhancement.id}.value`,{optional:true});
  }
  validateRelations(model,unitIds,bookId);
  validateEffects(model,allowedOwners,sourceOwners,new Set(effectEnhancementOwners.keys()),detachmentIds,unitIds);
  validateProjection(model,dependencies,unitIds,detachmentIds,enhancementIds);
  validateRosterProjection(model,unitIds,detachmentIds,enhancementIds);
  validatePresentation(model.presentation);
  if(model.rules!=null)assertDataOnly(model.rules,'rules');
  assertDataOnly(model,'effective book model');
  return model;
}

export function createEffectiveBookModel(input){
  const model=structuredClone(input);
  if(model.rosterCatalog?.units){
    let units=projectRosterBaseStats(model.units,model.rosterCatalog.units,{label:`${model.book?.id||'book'} effective roster base-stat projection`,effectContracts:model.effectContracts});
    units=projectRosterWeaponFacts(model.units,units,{label:`${model.book?.id||'book'} effective roster weapon-fact projection`});
    units=projectRosterUnitGameplayFacts(model.units,model.relationGraphs,units,{label:`${model.book?.id||'book'} effective roster unit-gameplay projection`,enforceCompositionConstraints:model.rosterCatalog.compositionConstraints===true});
    const detachmentRules=projectRosterDetachmentRuleFacts(model.detachments,model.rosterCatalog.detachmentRules,{bookId:model.book?.id,canonicalRules:model.detachmentRules,label:`${model.book?.id||'book'} effective roster Detachment-rule projection`});
    const enhancements=projectRosterEnhancementFacts(model.enhancements,model.rosterCatalog.enhancements,{label:`${model.book?.id||'book'} effective roster Enhancement projection`});
    model.rosterCatalog={...model.rosterCatalog,units,detachmentRules,enhancements};
  }
  validateEffectiveBookModel(model);
  return model;
}

function deepFreeze(value,seen=new WeakSet()){
  if(value==null||typeof value!=='object'||seen.has(value))return value;
  seen.add(value);
  if(value instanceof Map)for(const item of value.values())deepFreeze(item,seen);
  else for(const item of Object.values(value))deepFreeze(item,seen);
  return Object.freeze(value);
}
const canonical=value=>{
  if(value instanceof Map)return ['Map',[...value].sort(([left],[right])=>left.localeCompare(right)).map(([key,item])=>[key,canonical(item)])];
  if(Array.isArray(value))return value.map(canonical);
  if(record(value))return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])]));
  return value===undefined?'__undefined__':value;
};
const semanticSnapshot=model=>JSON.stringify(canonical(Object.fromEntries(Object.entries(model).filter(([key])=>key!=='presentation'))));

export function applyPresentationHook(model,hook){
  validateEffectiveBookModel(model);
  const present=typeof hook==='function'?hook:hook?.present;
  if(typeof present!=='function')throw new Error('presentation hook must be a function or expose present(model)');
  const readonly=deepFreeze(structuredClone(model)),before=semanticSnapshot(readonly);
  let presentation;
  try{presentation=present(readonly);}
  catch(error){throw new Error(`presentation hook failed without semantic authority: ${error.message}`,{cause:error});}
  if(semanticSnapshot(readonly)!==before)throw new Error('presentation hook attempted semantic mutation');
  if(presentation===undefined)presentation=readonly.presentation||{};
  validatePresentation(presentation);
  const result={...structuredClone(model),presentation:structuredClone(presentation)};
  validateEffectiveBookModel(result);
  if(semanticSnapshot(result)!==semanticSnapshot(model))throw new Error('presentation hook changed the effective semantic model');
  return result;
}

export async function runPresentationHook(model,hook){
  validateEffectiveBookModel(model);
  if(typeof hook!=='function')throw new Error('presentation hook must be a function');
  const readonly=deepFreeze(structuredClone(model)),before=semanticSnapshot(readonly);
  let result;
  try{result=await hook(readonly);}
  catch(error){throw new Error(`presentation hook failed without semantic authority: ${error.message}`,{cause:error});}
  if(semanticSnapshot(readonly)!==before)throw new Error('presentation hook attempted semantic mutation');
  assertDataOnly(result,'presentation result');
  return result;
}
