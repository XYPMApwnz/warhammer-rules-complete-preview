import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import ruleFactsApi from '../rule-facts.js';
import {buildRelationGraphs} from './build-relation-graph.mjs';
import {canonicalDetachmentRuleSet,canonicalRosterModelsFor,canonicalWargearAbilityId,canonicalWeaponProfileId,createRosterCatalog,persistCanonicalWeaponProfileIdentities,serializeRosterCatalog} from './build-roster-catalog.mjs';
import {createArmyBookTargetBuild} from './build-army-book-targets.mjs';
import {createCanonicalBuildContext,finishCanonicalBuild} from './canonical-build-contract.mjs';
import {createEffectivePointsProjection,resolveEffectiveEnhancementContractId,resolveEffectiveEnhancementIdentity} from './effective-points-projection.mjs';
import {bindRowsToCanonicalIds,canonicalDisplayKey,canonicalSlug,indexCanonicalById,mergeCanonicalById,mergeExactPointEnhancement,resolveArmyRuleBindings,resolvePointEnhancement} from './canonical-join-contract.mjs';
import {applyCanonicalChildIdentityContracts,effectiveEffectContracts,validateEffectContractSet,validateEffectContractsAgainstCatalog} from './effect-contract.mjs';
import {buildEffectiveBook} from './build-effective-book.mjs';
import {createEffectiveBookModel,EFFECTIVE_BOOK_MODEL_SCHEMA} from './effective-book-model.mjs';
import {createCoreFactProjection} from '../../core-rules/content/core-fact-projection.mjs';
import {createArmyCoreAbilityBindings} from './army-core-ability-binding.mjs';
import {createEffectiveMfmArmyProjection} from './effective-mfm-army-projection.mjs';
import {validateAttachmentGroupConstraintSet} from './attachment-group-constraint.mjs';

export async function buildCanonicalBook(context,{projectionOnly=false}={}){
const {args,check,configPath,root,repo,readJson,config,runtimeVersions}=context;
if(config.effectiveModel){
  const result=await buildEffectiveBook(context,{projectionOnly});
  if(projectionOnly)return result;
  return finishCanonicalBuild(context,result.outputs,{normalizeLineEndings:result.normalizeLineEndings===true,summary:result.summary});
}
const coreFactProjection=createCoreFactProjection({repoRoot:repo});
const coreAbilityBindings=createArmyCoreAbilityBindings({repoRoot:repo,coreFactProjection});
const bindCodexCoreAbilities=layer=>({...layer,datasheets:coreAbilityBindings.bindUnits(layer.datasheets),imperialArmour:coreAbilityBindings.bindUnits(layer.imperialArmour),legends:coreAbilityBindings.bindUnits(layer.legends)});
const bookMark=config.mark||config.title.split(/\s+/).map(word=>word[0]).join('').slice(0,4).toUpperCase();
const validateCanonicalIds=(data,sourceConfig)=>{
  // Each canonical source owns unique definitions; dependency/local overlays remain separate.
  const seen=new Map(),layers=new Set(['datasheets','imperialArmour','legends',...(sourceConfig.currentDatasheetLayers||[])]);
  for(const layer of layers)for(const [index,unit] of (data[layer]||[]).entries()){
    const location=`${sourceConfig.sources.codexDatasheets}:${layer}[${index}] (${unit.title})`;
    if(seen.has(unit.id))throw new Error(`${sourceConfig.id}: duplicate canonical ID "${unit.id}": ${seen.get(unit.id)} conflicts with ${location}`);
    seen.set(unit.id,location);
  }
};
const pack=readJson(config.sources.factionPack),codex=bindCodexCoreAbilities(readJson(config.sources.codexDatasheets));
validateCanonicalIds(codex,config);
const mfmProjection=createEffectiveMfmArmyProjection(config.id);
const points=mfmProjection.pointsForArmyBook(config.id);
const codexWargear=config.sources.codexWargear?readJson(config.sources.codexWargear):null;
const codexParity=config.sources.codexParity?readJson(config.sources.codexParity):null;
const manifest=readJson(config.sources.manifest);
let relatedRules=config.sources.relatedRules?readJson(config.sources.relatedRules):{stratagems:{}};
let enhancementOwners=config.sources.enhancementOwners?readJson(config.sources.enhancementOwners):null;
const effectContractSet=config.sources.effectContracts?validateEffectContractSet(readJson(config.sources.effectContracts),{expectedBookId:config.id}):{schema:'wh40k-effect-contracts/v1',bookId:config.id,contracts:[]};
const esc=value=>String(value??'').replace(/\s+/g,' ').trim().replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const heroMark=config.coverImage?'':`<div class="hero-mark" aria-hidden="true"><span>${esc(config.factionKeyword)}</span></div>`;
const escLines=value=>String(value??'').replace(/\r\n?/g,'\n').split('\n').map(esc).join('\n');
const normalizedEol=value=>String(value).replace(/\r\n?/g,'\n');
const clean=value=>String(value??'').replaceAll('\u00a0',' ').replace(/\s+/g,' ').trim();
const slug=value=>clean(value).toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const unique=(items,keyOf)=>{const seen=new Set();return items.filter(item=>{const key=keyOf(item);if(seen.has(key))return false;seen.add(key);return true;});};
const titleKey=value=>clean(value).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const sourceUnitId=value=>{const raw=String(value?.unitId||value?.canonicalId||value?.id||'');return raw?raw.startsWith('unit-')?raw:`unit-${raw}`:null;};
const coreBaseKey=value=>{const normalized=titleKey(value).replace(/\s+(?:d\d+|\d+)$/,'').trim();return normalized.startsWith('anti ')?'anti':normalized;};
const corePresentationTermsByLabel=new Map();
for(const term of coreFactProjection.abilityIdentityTerms){
  const key=coreBaseKey(String(term.title||'').replace(/^\[|\]$/g,''));
  if(corePresentationTermsByLabel.has(key))throw new Error(`Ambiguous accepted Core ability label: ${term.title}`);
  corePresentationTermsByLabel.set(key,term.id);
}
const unitInventory=layer=>[...(layer.datasheets||[]),...(layer.imperialArmour||[]),...(layer.legends||[])];
const dependencyCodices=(config.dependencies||[]).map(id=>{
  const dependencyRoot=path.join(repo,'books',id),dependencyConfig=JSON.parse(fs.readFileSync(path.join(dependencyRoot,'book.config.json'),'utf8'));
  const dependencyCodex=bindCodexCoreAbilities(JSON.parse(fs.readFileSync(path.join(dependencyRoot,dependencyConfig.sources.codexDatasheets),'utf8')));
  validateCanonicalIds(dependencyCodex,dependencyConfig);
  const dependencyPack=JSON.parse(fs.readFileSync(path.join(dependencyRoot,dependencyConfig.sources.factionPack),'utf8'));
  const dependencyPoints=mfmProjection.pointsForArmyBook(id);
  const dependencyParity=dependencyConfig.sources.codexParity?JSON.parse(fs.readFileSync(path.join(dependencyRoot,dependencyConfig.sources.codexParity),'utf8')):null;
  const dependencyRelatedRules=dependencyConfig.sources.relatedRules?JSON.parse(fs.readFileSync(path.join(dependencyRoot,dependencyConfig.sources.relatedRules),'utf8')):{stratagems:{},enhancements:{},keywordGrants:{}};
  const dependencyWargear=dependencyConfig.sources.codexWargear?JSON.parse(fs.readFileSync(path.join(dependencyRoot,dependencyConfig.sources.codexWargear),'utf8')):null;
  const dependencyEffectContracts=dependencyConfig.sources.effectContracts?validateEffectContractSet(JSON.parse(fs.readFileSync(path.join(dependencyRoot,dependencyConfig.sources.effectContracts),'utf8')),{expectedBookId:dependencyConfig.id}):{schema:'wh40k-effect-contracts/v1',bookId:dependencyConfig.id,contracts:[]};
  const dependencyUnits=unitInventory(dependencyCodex),pointsById=indexCanonicalById(dependencyPoints.units,{label:`${id} points unit`});
  const wargearRows=bindRowsToCanonicalIds(dependencyWargear?.units||[],dependencyUnits,{label:`${id} wargear unit`,rowId:sourceUnitId});
  const officialRows=bindRowsToCanonicalIds(Object.values(dependencyPack.datasheets||{}).flat(),dependencyUnits,{label:`${id} Faction Pack Datasheet`,rowId:sourceUnitId,allowUnbound:true});
  return {id,config:dependencyConfig,codex:dependencyCodex,pack:dependencyPack,parity:dependencyParity,points:dependencyPoints,relatedRules:dependencyRelatedRules,effectContracts:dependencyEffectContracts,pointsById,wargearByUnitId:new Map(wargearRows.map(item=>[item.canonicalId,item])),wargearSource:dependencyWargear?.source,officialByUnitId:new Map(officialRows.map(item=>[item.canonicalId,item]))};
});
const dependencyById=new Map(dependencyCodices.map(item=>[item.id,item]));
const dependencyScope=config.dependencyDatasheets||{};
const dependencyCanonicalPublicationTitleIds=new Set(dependencyScope.canonicalPublicationTitleUnitIds||[]);
const excludedDependencyKeywords=new Set((dependencyScope.excludeAnyKeywords||[]).map(value=>clean(value).toUpperCase()));
const dependencyKeywordOverlays=new Map();
for(const overlay of dependencyScope.keywordOverlays||[])for(const unitId of overlay.unitIds||[]){
  const keywords=dependencyKeywordOverlays.get(unitId)||new Set();
  keywords.add(clean(overlay.keyword).toUpperCase());
  dependencyKeywordOverlays.set(unitId,keywords);
}
const dependencyCompatibilityKeywords=(dependency,unit)=>{
  const declared=dependency.config.unitCompatibleChapterKeywords?.[unit.id];
  if(declared==null)return [];
  if(!Array.isArray(declared)||!declared.length||declared.some(value=>typeof value!=='string'||!clean(value)))throw new Error(`${dependency.id}: unit compatibility ${unit.id} requires non-empty chapter keywords`);
  if(new Set(declared.map(value=>clean(value).toUpperCase())).size!==declared.length)throw new Error(`${dependency.id}: unit compatibility ${unit.id} contains duplicate chapter keywords`);
  return declared;
};
for(const dependency of dependencyCodices){
  const unitIds=new Set((dependency.codex.datasheets||[]).map(unit=>unit.id));
  for(const unitId of Object.keys(dependency.config.unitCompatibleChapterKeywords||{}))if(!unitIds.has(unitId))throw new Error(`${dependency.id}: unit compatibility references unknown unit ${unitId}`);
}
const dependencyUnits=dependencyCodices.flatMap(dependency=>(dependencyScope.currentOnly?[...(dependency.codex.datasheets||[]),...(dependency.codex.imperialArmour||[])]:unitInventory(dependency.codex))
  .filter(unit=>![...(unit.keywords||[]),...dependencyCompatibilityKeywords(dependency,unit)].some(keyword=>excludedDependencyKeywords.has(clean(keyword).toUpperCase())))
  .map(unit=>{
    const point=dependency.pointsById.get(unit.id),exact=dependency.wargearByUnitId.get(unit.id),official=dependency.officialByUnitId.get(unit.id);
    const overlayKeywords=dependencyKeywordOverlays.get(unit.id)||new Set();
    return {...unit,keywords:[...new Set([...(unit.keywords||[]),...overlayKeywords])],...(point?{points:point.points,paidWargear:point.paidWargear,pointsSource:point.pointsSource}:{}),...(exact?{wargear:exact.wargear,compositionText:exact.composition,wargearSource:{label:dependency.wargearSource?.label||'Current 11e reference',url:exact.url}}:{}),...(official?{sourcePages:official.sourcePages,provenance:official.provenance}:{}),dependencyBook:dependency.id,dependencyTitle:dependency.config.title,dependencySourceFile:path.basename(dependency.pack.meta.file),dependencySourceVersion:dependency.pack.meta.version,dependencyCompactSharedAbilities:dependency.config.compactSharedAbilities||[],sourceLayer:`${dependency.id}-${official&&unit.sourceLayer==='codex'?'faction-pack':unit.sourceLayer||'source'}`};
  }));
const dependencyUnitIds=new Set(dependencyUnits.map(unit=>unit.id));
for(const unitId of dependencyCanonicalPublicationTitleIds)if(!dependencyUnitIds.has(unitId))throw new Error(`${config.id}: canonical publication title references unknown dependency unit ${unitId}`);
const ownUnits=config.currentDatasheetLayers?config.currentDatasheetLayers.flatMap(layer=>codex[layer]||[]):config.currentDatasheetsOnly?codex.datasheets||[]:unitInventory(codex);
const pointsById=indexCanonicalById(points.units,{label:`${config.id} points unit`});
const boundWargear=bindRowsToCanonicalIds(codexWargear?.units||[],ownUnits,{label:`${config.id} wargear unit`,rowId:sourceUnitId});
const wargearByUnitId=new Map(boundWargear.map(item=>[item.canonicalId,item]));
const mergedUnits=new Map();
if(dependencyScope.render!==false)for(const unit of dependencyUnits)mergedUnits.set(unit.id,unit);
for(const unit of ownUnits){
  const point=pointsById.get(unit.id),exact=wargearByUnitId.get(unit.id);
  mergedUnits.set(unit.id,{...unit,...(point?{points:point.points,paidWargear:point.paidWargear,pointsSource:point.pointsSource}:{}),...(exact?{wargear:exact.wargear,compositionText:exact.composition,wargearSource:{label:codexWargear.source?.label||'Current 11e reference',url:exact.url}}:{})});
}
const boundOfficialDatasheets=bindRowsToCanonicalIds(Object.values(pack.datasheets||{}).flat(),unitInventory(codex),{label:`${config.id} Faction Pack Datasheet`,rowId:sourceUnitId,allowUnbound:true});
const officialByUnitId=new Map(boundOfficialDatasheets.filter(item=>item.canonicalId).map(item=>[item.canonicalId,item]));
let units=[...mergedUnits.values()].map(unit=>{
  const official=officialByUnitId.get(unit.id);
  return official?{...unit,sourcePages:official.sourcePages,provenance:official.provenance,sourceLayer:unit.sourceLayer==='codex'?'faction-pack':unit.sourceLayer}:unit;
});
const effectiveEffectContractSets=[effectContractSet,...dependencyCodices.map(item=>item.effectContracts)];
units=applyCanonicalChildIdentityContracts(units,effectiveEffectContractSets);
units=units.map(persistCanonicalWeaponProfileIdentities);
const relationUnits=unique([...units,...dependencyUnits],unit=>unit.id);
let unitById=indexCanonicalById(relationUnits,{label:`${config.id} relation unit`});
let presentationUnitByTitle=new Map(relationUnits.map(unit=>[titleKey(unit.title),unit]));

const sourceDetachments=unique([...(pack.detachments||[]),...(codexParity?.detachments||[])],item=>item.id);
const sourceDetachmentById=indexCanonicalById(sourceDetachments,{label:`${config.id} Detachment`});
const boundPointDetachments=bindRowsToCanonicalIds(points.detachments||[],sourceDetachments,{label:`${config.id} points Detachment`,rowId:item=>item.detachmentId||item.canonicalId||item.id});
const pointDetachmentById=new Map(boundPointDetachments.map(item=>[item.canonicalId,item]));
const detachmentIdByDeclaredTitle=new Map(sourceDetachments.map(item=>[titleKey(item.title),item.id]));
const rawPointEnhancementByBound=new WeakMap();
const bindPointEnhancement=record=>{const detachmentId=record.detachmentId||detachmentIdByDeclaredTitle.get(titleKey(record.detachment));if(!detachmentId)throw new Error(`${config.id}: Enhancement points ${record.id} references unknown Detachment ${record.detachment}`);const bound={...record,detachmentId,canonicalId:record.canonicalEnhancementId||record.id};rawPointEnhancementByBound.set(bound,record);return bound;};
const boundPointEnhancements=(points.enhancements||[]).map(bindPointEnhancement);
const codexDetachmentIds=unique(boundPointEnhancements.map(item=>item.detachmentId),value=>value);
const detachmentMetaById=pointDetachmentById;
const enhancementSourceId=item=>item?.sourceId||item?.id||null;
const enhancementDependencyFacts=(...sources)=>Object.fromEntries(['profile','owner','assignment'].flatMap(key=>{const source=sources.find(item=>item?.[key]!=null);return source?[[key,source[key]]]:[];}));
const pointsPublicationByEnhancement=new WeakMap(),pointsPublicationByDetachment=new WeakMap(),dependencyEnhancementIdentityByPublication=new Map();
const pointEnhancementFor=(item,detachment)=>resolvePointEnhancement(item,detachment.id,boundPointEnhancements,{aliases:config.pointEnhancementAliases,label:`${config.id} Enhancement points`});
const enrichEnhancement=(item,detachment)=>{const qualified=Boolean(config.detachmentQualifiedEnhancementPoints),current=pointEnhancementFor(item,detachment);if(!current)return item;const enriched={...mergeExactPointEnhancement(item,current,{qualified}),...enhancementDependencyFacts(item,qualified?current:null)};pointsPublicationByEnhancement.set(enriched,current);return enriched;};
const enrichDetachment=detachment=>{const pointsPublication=detachmentMetaById.get(detachment.id),enriched={...detachment,...pointsPublication,id:detachment.id,enhancements:(detachment.enhancements||[]).map(item=>enrichEnhancement(item,detachment))};if(pointsPublication)pointsPublicationByDetachment.set(enriched,pointsPublication);return enriched;};
const localDetachments=codexDetachmentIds.map(id=>{const source=sourceDetachmentById.get(id);if(!source)throw new Error(`${config.id}: points Detachment ${id} has no accepted canonical owner`);return enrichDetachment(source);});
for(const item of sourceDetachments)if(!localDetachments.some(other=>other.id===item.id))localDetachments.push(enrichDetachment(item));
const dependencyDetachmentScope=config.dependencyDetachments;
const dependencyDetachments=!dependencyDetachmentScope||dependencyDetachmentScope.render===false?[]:dependencyCodices.flatMap(dependency=>{
  const source=unique([...(dependency.pack.detachments||[]),...(dependency.parity?.detachments||[])],item=>item.id);
  const boundDetachmentPoints=bindRowsToCanonicalIds(dependency.points.detachments||[],source,{label:`${dependency.id} points Detachment`,rowId:item=>item.detachmentId||item.canonicalId||item.id});
  const currentIds=new Set(boundDetachmentPoints.map(item=>item.canonicalId)),pointMeta=new Map(boundDetachmentPoints.map(item=>[item.canonicalId,item]));
  const dependencyDetachmentIdByTitle=new Map(source.map(item=>[titleKey(item.title),item.id]));
  const pointEnhancements=new Map((dependency.points.enhancements||[]).map(item=>{const detachmentId=item.detachmentId||dependencyDetachmentIdByTitle.get(titleKey(item.detachment));if(!detachmentId)throw new Error(`${dependency.id}: Enhancement points ${item.id} references unknown Detachment ${item.detachment}`);return[`${detachmentId}\0${item.id}`,{...item,detachmentId}];}));
  const chapterKey=titleKey(dependencyDetachmentScope.chapterKeyword||config.factionKeyword);
  const selected=source.filter(item=>{const restriction=item.restriction||dependency.config.detachmentChapterRestrictionsById?.[item.id]||dependency.config.detachmentChapterRestrictions?.[item.title];return currentIds.has(item.id)&&(!restriction||titleKey(restriction)===chapterKey);}).map(item=>{
    const meta=pointMeta.get(item.id)||{};
    const mark=record=>({...record,dependencyBook:dependency.id});
    const pointsPublication={...meta,id:item.id,title:item.title},enhancements=(item.enhancements||[]).map(enhancement=>{const current=resolvePointEnhancement(enhancement,item.id,[...pointEnhancements.values()],{aliases:dependency.config.pointEnhancementAliases,label:`${dependency.id} dependency Enhancement points`})||{},sourceId=enhancementSourceId(enhancement),enriched=mark({...enhancement,...current,text:enhancement.text,...(sourceId?{sourceId}:{}),...enhancementDependencyFacts(enhancement,current)});pointsPublicationByEnhancement.set(enriched,current);if(current.id&&sourceId)dependencyEnhancementIdentityByPublication.set([dependency.id,item.id,current.id].join('\0'),sourceId);return enriched;}),enriched={...item,...meta,id:item.id,title:item.title,rule:item.rule?mark(item.rule):item.rule,enhancements,stratagems:(item.stratagems||[]).map(mark),dependencyBook:dependency.id,dependencyTitle:dependency.config.title,dependencySourceFile:path.basename(dependency.pack.meta.file),dependencySourceVersion:dependency.pack.meta.version,dependencyCodexSourceLabel:dependency.config.codexSourceLabel||'SECONDARY CODEX'};
    pointsPublicationByDetachment.set(enriched,pointsPublication);return enriched;
  });
  if(dependencyDetachmentScope.expected!=null&&selected.length!==dependencyDetachmentScope.expected)throw new Error(`${config.id}: expected ${dependencyDetachmentScope.expected} compatible ${dependency.config.title} Detachments, got ${selected.length}`);
  return selected;
});
let detachments=unique([...localDetachments,...dependencyDetachments],item=>item.id);

const allKeywords=new Set(units.flatMap(unit=>unit.keywords||[]).map(value=>clean(value).toUpperCase()));
const namedGroups=[
  ['TYRANID WARRIORS',units.filter(unit=>/^Tyranid Warriors/i.test(unit.title)).map(unit=>unit.id)],
  ['DEATHLEAPER',units.filter(unit=>titleKey(unit.title)==='deathleaper').map(unit=>unit.id)],
  ['NEUROLICTOR',units.filter(unit=>titleKey(unit.title)==='neurolictor').map(unit=>unit.id)],
  ['LICTOR',units.filter(unit=>titleKey(unit.title)==='lictor').map(unit=>unit.id)],
  ["VON RYAN'S LEAPERS",units.filter(unit=>titleKey(unit.title)==='von ryans leapers').map(unit=>unit.id)],
  ['NORN ASSIMILATOR',units.filter(unit=>titleKey(unit.title)==='norn assimilator').map(unit=>unit.id)],
  ['NORN EMISSARY',units.filter(unit=>titleKey(unit.title)==='norn emissary').map(unit=>unit.id)],
  ['MAWLOC',units.filter(unit=>titleKey(unit.title)==='mawloc').map(unit=>unit.id)],
  ['TRYGON',units.filter(unit=>titleKey(unit.title)==='trygon').map(unit=>unit.id)]
];
const relatedRulesFor=item=>item.dependencyBook?dependencyById.get(item.dependencyBook)?.relatedRules||relatedRules:relatedRules;
const contractById=(records,...ids)=>{for(const raw of ids){for(const id of [raw,String(raw||'').replace(/^enhancement-/,'')].filter(Boolean))if(records?.[id])return records[id];}return null;};
const enhancementEligibility=item=>contractById(relatedRulesFor(item).enhancements,item.id,item.sourceId);
let enhancementOwnerRecords=Object.entries(enhancementOwners?.enhancements||{}).map(([id,record])=>({id,...record}));
const enhancementRuleId=(item,detachment)=>{const candidates=[item.canonicalId,item.ruleId,item.sourceId,item.id].filter(Boolean);if(config.id==='chaos-space-marines'&&item.id)return item.id;if(['space-marines','dark-angels'].includes(config.id)&&(item.sourceId||item.id))return item.sourceId||item.id;const exact=candidates.find(id=>enhancementOwnerRecords.some(record=>record.id===id));if(exact)return exact;if(enhancementOwnerRecords.length){const alias=config.enhancementOwnerAliases?.[`${detachment?.id}|${item.id}`],record=enhancementOwnerRecords.find(candidate=>candidate.id===alias);if(!record||record.detachmentId!==detachment?.id)throw new Error(`${config.id}: Enhancement ${detachment?.id||'unknown'}/${item.id||item.title} requires one declared exact owner alias`);return record.id;}return item.id||`enhancement-${slug(item.title)}`;};
const enhancementOwnerRecord=(item,detachment)=>enhancementOwnerRecords.find(record=>record.id===enhancementRuleId(item,detachment))||null;
const publishedEnhancementContracts=new Set(['tyranids','tau-empire']);
const publishedRelationContracts=new Set(['tyranids','tau-empire']);
const enhancementContract=(item,detachment)=>{
  const frozen=enhancementOwnerRecord(item,detachment);
  if(frozen){
    if(!frozen.ownerGroup)return null;
    const group=enhancementOwners.ownerGroups?.[frozen.ownerGroup];
    if(!group)throw new Error(`${config.id}: missing Enhancement owner group ${frozen.ownerGroup}`);
    const isUpgrade=(frozen.tags||[]).includes('UPGRADE');
    return {tags:frozen.tags||[],owner:{subject:group.subject,selector:{unitIds:group.unitIds||[],noneKeywords:group.noneKeywords||[]}},assignment:isUpgrade?enhancementOwners.defaults.upgradeAssignment:enhancementOwners.defaults.standardAssignment};
  }
  const contract=enhancementEligibility(item);
  if(!contract||!publishedEnhancementContracts.has(config.id))return contract;
  const tags=contract.tags||[],owner=contract.owner,assignment=contract.assignment;
  if(!Array.isArray(tags)||tags.some(tag=>tag!=='UPGRADE'))throw new Error(`${config.id}: invalid Enhancement tags for ${item.id}`);
  if(!owner||!['model','unit'].includes(owner.subject)||!owner.selector)throw new Error(`${config.id}: invalid Enhancement owner for ${item.id}`);
  const isUpgrade=tags.includes('UPGRADE');
  if(isUpgrade!== (owner.subject==='unit'))throw new Error(`${config.id}: ${item.id} must use ${isUpgrade?'unit':'model'} owner subject`);
  if(!assignment||assignment.maxOwners!==(isUpgrade?3:1)||assignment.enhancementChoices!==1||assignment.payPointsPerOwner!==true)throw new Error(`${config.id}: invalid Enhancement assignment for ${item.id}`);
  return contract;
};
const supportedSubjects=new Set(['unit','model','objective']);
const stratagemEligibility=item=>{
  const source=relatedRulesFor(item),explicit=source.stratagems?.[item.id]||source.stratagems?.[String(item.id||'').replace(/^stratagem-/,'')];
  if(!explicit&&config.legacyRelatedRuleAttributes===false)return null;
  if(!explicit)throw new Error(`${config.id}: missing audited Stratagem eligibility for ${item.id} (${item.title})`);
  const roles=explicit.roles||explicit.targets||[];
  if(!roles.some(role=>role.side==='friendly'||role.side==='either'))throw new Error(`${config.id}: Stratagem ${item.id} has no friendly target role`);
  const inspect=selector=>{
    for(const unitId of selector?.unitIds||selector?.units||[])if(!unitById.has(unitId)&&!item.dependencyBook)throw new Error(`${config.id}: Stratagem ${item.id} references unknown unit ${unitId}`);
    for(const alternative of selector?.alternatives||[])inspect(alternative);
  };
  for(const role of roles){
    const subject=role.subject||'unit';
    if(!supportedSubjects.has(subject))throw new Error(`${config.id}: Stratagem ${item.id} uses unsupported eligibility subject ${subject}`);
    inspect(role.selector||role);
  }
  return explicit;
};

const relationEdges=mfmProjection.relationEdges({effectiveUnitIds:relationUnits.map(unit=>unit.id)});
const mfmRelationKeys=new Set(relationEdges.map(edge=>`${edge.role}\0${edge.sourceId}\0${edge.targetId}`));
const attachmentGroupConstraintSet=validateAttachmentGroupConstraintSet(config.sources.attachmentGroupConstraints?context.readJson(config.sources.attachmentGroupConstraints):{schema:'wh40k-attachment-group-constraints/v1',bookId:config.id,constraints:[]},{bookId:config.id,units:relationUnits});
let relationGraphs=buildRelationGraphs(relationUnits,relationEdges,{
  bookId:config.id,
  inheritedUnits:dependencyUnits,
  effectiveUnits:units,
  adds:(dependencyScope.relationAdds||[]).filter(edge=>!mfmRelationKeys.has(`${edge.role}\0${edge.sourceId}\0${edge.targetId}`)),
  attachmentGroupConstraints:attachmentGroupConstraintSet.constraints
});

const terms=new Map();
const glossaryV2CompatibilityTerms=config.glossaryV2CompatibilityTerms===true;
const sourceAvailabilityMessages=new Map([
  ['verified-rule-body','Known rule identity. Verified rule body is unavailable in this publication.'],
  ['verified-option-definitions','Known choice instruction. Verified option definitions are unavailable in this publication.']
]);
const sourceAvailabilityMessage=item=>{
  const availability=item?.sourceAvailability;
  if(!availability)return'';
  if(availability.status!=='unavailable'||!sourceAvailabilityMessages.has(availability.missing))throw new Error(`Unsupported source availability for ${item.title||'untitled rule'}`);
  return sourceAvailabilityMessages.get(availability.missing);
};
const sourceAwareText=item=>[clean(item?.text),sourceAvailabilityMessage(item)].filter(Boolean).join(' ');
const sourceAvailabilityNote=item=>{const message=sourceAvailabilityMessage(item);return message?`<p class="source-availability source-warning" data-source-availability="${esc(item.sourceAvailability.missing)}">${esc(message)}</p>`:'';};
function addTermTo(target,title,summary,sectionId,kind='faction-term',unitId='',termScope=config.id){
  const base=`${termScope}-${kind}-${slug(title)}`;let id=base,index=2;while(target.has(id)&&target.get(id).summary!==clean(summary))id=`${base}-${index++}`;
  if(!target.has(id))target.set(id,{id,title:clean(title),summary:clean(summary)||`${clean(title)} appears in the ${config.title} reference.`,full:clean(summary),rule:sectionId,glossary:`glossary-${id}`,units:unitId?[unitId]:[]});
  else if(unitId&&!target.get(id).units.includes(unitId))target.get(id).units.push(unitId);
  return id;
}
const addTerm=(...args)=>addTermTo(terms,...args);
const detachmentRuleEntries=det=>{
  if(!det.rule)return [];
  const entries=[{rule:det.rule,anchor:`${det.id}-rule`,additional:false},...(det.rule.additionalRules||[]).map(rule=>({rule,anchor:`${det.id}-rule-${slug(rule.id||rule.title)}`,additional:true}))];
  const anchors=new Set(),titles=new Set();
  for(const entry of entries){
    if(entry.additional&&(!clean(entry.rule.title)||!clean(entry.rule.text)))throw new Error(`${det.id}: additional Detachment rule requires title and full text`);
    if(anchors.has(entry.anchor)||titles.has(titleKey(entry.rule.title)))throw new Error(`${det.id}: duplicate Detachment rule identity`);
    anchors.add(entry.anchor);titles.add(titleKey(entry.rule.title));
  }
  return entries;
};
for(const det of detachments){
  const scope=det.dependencyBook||config.id;
  for(const {rule,anchor,additional} of detachmentRuleEntries(det)){const termId=addTerm(rule.title,sourceAwareText(rule),additional?anchor:`detachment-${det.id}`,'detachment-rule','',scope);if(glossaryV2CompatibilityTerms)rule.presentationTermId=termId;}
  for(const item of det.enhancements){const termId=addTerm(item.title,item.text,`detachment-${det.id}`,'enhancement','',scope);if(glossaryV2CompatibilityTerms)item.termId=termId;}
  for(const item of det.stratagems){const termId=addTerm(item.title,[item.when,item.target,item.effect,item.restrictions].filter(Boolean).join(' '),`detachment-${det.id}`,'stratagem','',scope);if(glossaryV2CompatibilityTerms)item.termId=termId;}
}
const scopedAbilityTerms=new Map();
for(const unit of units){
  const termScope=unit.dependencyBook||config.id;
  for(const ability of unit.abilities||[]){Object.assign(ability,coreAbilityBindings.bindAbility(ability));const key=coreBaseKey(ability.title),canonical=ability.coreAbilityId||null,local=canonical||addTerm(ability.title,sourceAwareText(ability),unit.id,'ability',unit.id,termScope);ability.termId=canonical||config.armyRuleTermIds?.[ability.title]||local;if(!canonical)scopedAbilityTerms.set(`${termScope}\0${key}`,ability.termId);}
  for(const ability of unit.wargearAbilities||[]){Object.assign(ability,coreAbilityBindings.bindAbility(ability));const key=coreBaseKey(ability.title),canonical=ability.coreAbilityId||null,local=canonical||addTerm(ability.title,sourceAwareText(ability),unit.id,'ability',unit.id,termScope);ability.termId=canonical||config.armyRuleTermIds?.[ability.title]||local;if(!canonical)scopedAbilityTerms.set(`${termScope}\0${key}`,ability.termId);}
  for(const weapon of unit.weapons||[])weapon.termId=addTerm(weapon.name,`${weapon.mode==='ranged'?'Ranged':'Melee'} · ${weapon.range} · A ${weapon.a} · ${weapon.mode==='ranged'?'BS':'WS'} ${weapon.skill} · S ${weapon.s} · AP ${weapon.ap} · D ${weapon.d}${weapon.abilities?` · ${weapon.abilities}`:''}`,unit.id,'weapon',unit.id,termScope);
}
const weaponAbilityTokens=(value,termScope=config.id)=>`<div class="weapon-tags">${String(value).split(',').map(rawLabel=>{const label=rawLabel.trim(),key=coreBaseKey(label),termId=corePresentationTermsByLabel.get(key)||scopedAbilityTerms.get(`${termScope}\0${key}`);return termId?`<button class="tag" data-term="${termId}">${esc(label.toUpperCase())}</button>`:`<span class="tag">${esc(label.toUpperCase())}</span>`;}).join('')}</div>`;
const compileUnitRuleFacts=unit=>{
  const sourceAbilities=[...(unit.abilities||[])],relations=relationGraphs.get(unit.id),canAttach=Object.values(relations).some(items=>items.length);
  return {id:unit.id,unitId:unit.id,slug:unit.id.replace(/^unit-/,''),keywords:unit.keywords||[],intrinsicKeywords:unit.keywords||[],abilities:[...new Set(sourceAbilities.map(item=>/^deadly demise\b/i.test(item.title)?'DEADLY DEMISE':item.title))],termIds:[...new Set([...sourceAbilities,...(unit.weapons||[])].map(item=>item.termId).filter(Boolean))],epic:(unit.keywords||[]).some(item=>titleKey(item)==='epic hero'),deadlyDemise:sourceAbilities.some(item=>item.coreAbilityId==='core-deadly-demise'),attached:canAttach?null:false,attachmentKnown:!canAttach,characterCount:(unit.keywords||[]).some(item=>titleKey(item)==='character')?1:0,twoCharacters:null,warlord:null,relations};
};
let unitRuleFacts=new Map(units.map(unit=>[unit.id,compileUnitRuleFacts(unit)]));
let unitRuleProfiles=new Map([...unitRuleFacts].map(([id,facts])=>[id,ruleFactsApi.serializeRuleProfile(ruleFactsApi.profileFromRecord(facts))]));
const projectionEnhancementSources=detachments.flatMap(det=>(det.enhancements||[]).filter(item=>!enhancementOwnerRecord(item,det)||enhancementContract(item,det)).map(item=>({det,item,contract:enhancementContract(item,det),ownerRecord:enhancementOwnerRecord(item,det)})));
const canonicalRosterEnhancements=projectionEnhancementSources.map(({det,item,contract,ownerRecord})=>{const dependencyRecord=Boolean(det.dependencyBook),sourceId=dependencyRecord?item.sourceId:null,facts=dependencyRecord?enhancementDependencyFacts(item):{},record={title:item.title,text:item.text,value:ownerRecord?ownerRecord.points:item.value,detachment:det.title,tags:contract?.tags||item.tags||[],...(sourceId?{sourceId}:{}),...(item.profile?{profile:item.profile}:{}),...facts,owner:contract?.owner||facts.owner||null,assignment:contract?.assignment||facts.assignment||null},configuredExactIdentity=Boolean(config.rosterCatalog?.exactEnhancementIds),builtInExactIdentity=['chaos-space-marines','space-marines','dark-angels','blood-angels'].includes(config.id),exact=configuredExactIdentity||builtInExactIdentity,ruleId=exact?enhancementRuleId(item,det):null;return{...(exact?record:{}),...item,...(ruleId?{ruleId}:{}),id:ruleId||item.ruleId||item.id,title:item.title||record.title,detachmentId:det.id,sourceBookId:det.dependencyBook||det.sourceBookId||config.id,legacyKey:ruleId||item.ruleId||item.id};});
const canonicalRosterEnhancementByEffectiveId=new Map();
for(const item of canonicalRosterEnhancements){
  const sourceConfig=item.sourceBookId===config.id?config:dependencyById.get(item.sourceBookId)?.config||config,qualified=`${item.detachmentId}|${item.id}`,ownerAlias=Object.entries(sourceConfig.enhancementOwnerAliases||{}).find(([key,id])=>key.startsWith(`${item.detachmentId}|`)&&id===item.id)?.[0],effectiveIds=[item.id,sourceConfig.compatibleRulesEnhancementAliases?.[qualified],sourceConfig.pointEnhancementAliases?.[qualified],ownerAlias&&sourceConfig.pointEnhancementAliases?.[ownerAlias]].filter(Boolean);
  for(const effectiveId of new Set(effectiveIds)){const key=`${item.detachmentId}\0${effectiveId}`;if(canonicalRosterEnhancementByEffectiveId.has(key)&&canonicalRosterEnhancementByEffectiveId.get(key)!==item)throw new Error(`${config.id}: duplicate effective roster Enhancement source ${qualified}`);canonicalRosterEnhancementByEffectiveId.set(key,item);}
}
let rosterEnhancements=Object.fromEntries(projectionEnhancementSources.map(({det,item,contract,ownerRecord})=>{const dependencyRecord=Boolean(det.dependencyBook),sourceId=dependencyRecord?item.sourceId:null,facts=dependencyRecord?enhancementDependencyFacts(item):{},record={title:item.title,text:item.text,value:ownerRecord?ownerRecord.points:item.value,detachment:det.title,tags:contract?.tags||item.tags||[],...(sourceId?{sourceId}:{}),...(item.profile?{profile:item.profile}:{}),...facts,owner:contract?.owner||facts.owner||null,assignment:contract?.assignment||facts.assignment||null},configuredExactIdentity=Boolean(config.rosterCatalog?.exactEnhancementIds),builtInExactIdentity=['chaos-space-marines','space-marines','dark-angels','blood-angels'].includes(config.id),exactRecord={...record,ruleId:enhancementRuleId(item,det),detachmentId:det.id};return configuredExactIdentity?[titleKey(item.title),exactRecord]:builtInExactIdentity?[enhancementRuleId(item,det),exactRecord]:[titleKey(item.title),record];}));
let effectContracts=effectiveEffectContracts(effectiveEffectContractSets,config.id);
const canonicalDetachmentRules=canonicalDetachmentRuleSet(detachments,{...config.rosterCatalog,bookId:config.id});
let rosterCatalog=createRosterCatalog({config,units,detachments,relationGraphs,legacyEnhancements:rosterEnhancements,enhancementContracts:canonicalRosterEnhancements,keywordGrants:relatedRules?.keywordGrants||[],effectContracts});
for(const contractSet of effectiveEffectContractSets)validateEffectContractsAgainstCatalog(contractSet,rosterCatalog,{effectiveBookId:config.id});
const unitPointsPublication=unit=>{if(!unit.dependencyBook)return pointsById.get(unit.id);const publication=dependencyById.get(unit.dependencyBook)?.pointsById.get(unit.id);return publication&&dependencyCanonicalPublicationTitleIds.has(unit.id)?{...publication,title:unit.title}:publication;};
const effectiveUnitById=indexCanonicalById(units,{label:`${config.id} effective unit`}),pointOrderedUnits=[...(points.units||[]),...dependencyCodices.flatMap(dependency=>dependency.points.units||[])].map(publication=>effectiveUnitById.get(publication.id)).filter((unit,index,items)=>unit&&items.indexOf(unit)===index);
if(pointOrderedUnits.length!==units.length)throw new Error(`${config.id}: effective points unit ordering did not cover the effective unit inventory`);
const effectiveDetachmentById=indexCanonicalById(detachments,{label:`${config.id} effective Detachment`});
const dependencyPointDetachments=dependencyCodices.flatMap(dependency=>{const sources=unique([...(dependency.pack.detachments||[]),...(dependency.parity?.detachments||[])],item=>item.id);return bindRowsToCanonicalIds(dependency.points.detachments||[],sources,{label:`${dependency.id} points Detachment`,rowId:item=>item.detachmentId||item.canonicalId||item.id}).map(item=>({...item,sourceBookId:dependency.id}));});
const pointOrderedDetachments=[...boundPointDetachments,...dependencyPointDetachments].map(publication=>effectiveDetachmentById.get(publication.canonicalId)).filter((detachment,index,items)=>detachment&&items.indexOf(detachment)===index);
if(pointOrderedDetachments.length!==detachments.length)throw new Error(`${config.id}: effective points Detachment ordering did not cover the effective Detachment inventory`);
const enhancementSourceByPublication=new Map(projectionEnhancementSources.map(source=>{const publication=pointsPublicationByEnhancement.get(source.item)||source.item,sourceBookId=source.det.dependencyBook||config.id;return publication?.id?[[sourceBookId,source.det.id,publication.id].join('\0'),source]:null;}).filter(Boolean));
const officialEnhancementIdentityByPublication=new Map(boundPointEnhancements.map(item=>[item.id,{id:item.id,sourceTitle:item.title}]));
const dependencyPointEnhancements=dependencyCodices.flatMap(dependency=>{const sources=unique([...(dependency.pack.detachments||[]),...(dependency.parity?.detachments||[])],item=>item.id),detachmentIds=new Map(sources.map(item=>[titleKey(item.title),item.id]));return(dependency.points.enhancements||[]).map(publication=>{const detachmentId=publication.detachmentId||detachmentIds.get(titleKey(publication.detachment));if(!detachmentId)throw new Error(`${dependency.id}: Enhancement points ${publication.id} references unknown Detachment ${publication.detachment}`);const bound={...publication,detachmentId};rawPointEnhancementByBound.set(bound,publication);return{publication:bound,sourceBookId:dependency.id,contracts:dependency.relatedRules.enhancements||{}};});});
const pointEnhancementPublications=[...boundPointEnhancements.map(publication=>({publication,sourceBookId:config.id,contracts:relatedRules.enhancements||{}})),...dependencyPointEnhancements].map(record=>{const det=effectiveDetachmentById.get(record.publication.detachmentId);return{...record,det,source:det?enhancementSourceByPublication.get([record.sourceBookId,det.id,record.publication.id].join('\0')):null};}).filter(record=>record.det&&(record.det.dependencyBook===record.sourceBookId||!record.det.dependencyBook&&record.sourceBookId===config.id));
let effectivePointsProjection=createEffectivePointsProjection({
  book:{id:config.id,title:config.title,parentBookId:config.dependencies?.[0]||null},
  dependencies:(config.dependencies||[]).map(id=>({bookId:id,kind:'effective-book-dependency'})),
  units:pointOrderedUnits.map(unit=>{const compatibleChapterKeywords=unit.dependencyBook?[]:config.unitCompatibleChapterKeywords?.[unit.id]||unit.compatibleChapterKeywords||[];return{id:unit.id,title:unit.title,sourceBookId:unit.dependencyBook||config.id,publicationState:unit.status||'Current',points:unit.points||[],paidWargear:unit.paidWargear||[],...(unit.pointsSource?{pointsSource:unit.pointsSource}:{}),...(compatibleChapterKeywords.length?{compatibleChapterKeywords}:{}),ruleProfile:unitRuleProfiles.get(unit.id),publicationRecord:unitPointsPublication(unit)||{id:unit.id,title:unit.title,status:unit.status,sourceLayer:unit.sourceLayer,points:unit.points,paidWargear:unit.paidWargear,pointsSource:unit.pointsSource}};}),
  detachments:pointOrderedDetachments.map(det=>({id:det.id,title:det.title,sourceBookId:det.dependencyBook||config.id,detachmentPoints:Number(String(det.detachmentPoints??det.dp??0).match(/\d+/)?.[0]||0),forceDisposition:det.forceDisposition||det.disposition||'',mfmRecordId:det.mfmRecordId||null,mfmForceDispositionId:det.mfmForceDispositionId||null,missionForceDispositionId:det.missionForceDispositionId||null,forceDispositionId:det.forceDispositionId||det.missionForceDispositionId||null,mfmQualifiers:det.mfmQualifiers||[],publicationRecord:pointsPublicationByDetachment.get(det)||{title:det.title,detachmentPoints:det.detachmentPoints,forceDisposition:det.forceDisposition}})),
  enhancements:pointEnhancementPublications.map(({publication,sourceBookId,contracts,det,source})=>{const officialIdentity=sourceBookId===config.id?officialEnhancementIdentityByPublication.get(publication.id):null,sourceConfig=sourceBookId===config.id?config:dependencyById.get(sourceBookId)?.config||config,pointAliasKey=Object.entries(sourceConfig.pointEnhancementAliases||{}).find(([,id])=>id===publication.id)?.[0],ownerIdentity=pointAliasKey&&sourceConfig.enhancementOwnerAliases?.[pointAliasKey],sourceIdentity=source?.item?.sourceId||source?.item?.id||dependencyEnhancementIdentityByPublication.get([sourceBookId,det.id,publication.id].join('\0')),contractIdentity=sourceBookId!==config.id?resolveEffectiveEnhancementContractId(publication.id,det.id,contracts):null,identityId=sourceBookId!==config.id?contractIdentity||sourceIdentity||publication.id:publishedEnhancementContracts.has(config.id)&&source?enhancementRuleId(source.item,det):officialIdentity?.id||ownerIdentity||publication.id,identityInput={...publication,id:identityId,detachmentId:det.id},resolvedIdentity=resolveEffectiveEnhancementIdentity(identityInput,rosterCatalog,contracts),compatibilityIdentity=contractIdentity?{...resolvedIdentity,canonicalEnhancementId:contractIdentity}:resolvedIdentity,id=compatibilityIdentity.canonicalEnhancementId||identityId,rawPublication=rawPointEnhancementByBound.get(publication)||publication,canonicalEffectRecordIds=[...new Set([source?.item?.id,source?.item?.ruleId,sourceIdentity].filter(Boolean))],aliases=[...new Set([officialIdentity?.sourceTitle,source?.item?.title,ownerIdentity&&source?.item?.title].filter(Boolean))];return{id,sourceId:publication.sourceId||null,ruleId:id,legacyKey:publication.legacyKey||null,detachmentId:det.id,detachmentTitle:det.title,sourceBookId,title:publication.title,value:Number(publication.value),owner:compatibilityIdentity.owner||publication.owner||null,assignment:compatibilityIdentity.assignment||publication.assignment||null,tags:compatibilityIdentity.tags||publication.tags||[],text:publication.text||'',mfmRecordId:publication.mfmRecordId||null,mfmQualifiers:publication.mfmQualifiers||[],...(publication.profile?{profile:publication.profile}:{}),...(compatibilityIdentity.sourceLimited?{sourceLimited:true}:{}),...(canonicalEffectRecordIds.length?{canonicalEffectRecordIds}:{}),aliases,publicationRecord:officialIdentity?{...rawPublication,id:officialIdentity.id}:rawPublication,compatibilityIdentity};})
});
const effectiveEnhancements=effectivePointsProjection.enhancements.map(item=>{const mapped=canonicalRosterEnhancementByEffectiveId.get(`${item.detachmentId}\0${item.id}`),direct=projectionEnhancementSources.filter(({det,item:source})=>det.id===item.detachmentId&&[source.id,source.ruleId,source.sourceId].filter(Boolean).includes(item.id));if(direct.length>1)throw new Error(`${config.id}: ${item.detachmentId}/${item.id} has duplicate canonical Enhancement text owners`);const source=mapped?.text?mapped:direct[0]?.item||mapped,sourceIds=[source?.id,source?.ruleId,source?.sourceId].filter(Boolean),sourceConfig=item.sourceBookId===config.id?config:dependencyById.get(item.sourceBookId)?.config||config,aliasKey=Object.entries(sourceConfig.pointEnhancementAliases||{}).find(([,id])=>id===item.id)?.[0],effectId=aliasKey&&sourceConfig.enhancementOwnerAliases?.[aliasKey],compatibilityIds=Object.entries(sourceConfig.compatibleRulesEnhancementAliases||{}).filter(([key,id])=>key.startsWith(`${item.detachmentId}|`)&&id===item.id).map(([key])=>key.slice(key.indexOf('|')+1));return{...item,...(glossaryV2CompatibilityTerms&&source?.termId?{termId:source.termId}:{}),...(source?.text?{text:source.text}:{}),...(!item.owner&&source?.owner?{owner:source.owner}:{}),...(!item.assignment&&source?.assignment?{assignment:source.assignment}:{}),...(!(item.tags||[]).length&&source?.tags?.length?{tags:source.tags}:{}),canonicalEffectRecordIds:[...new Set([...(item.canonicalEffectRecordIds||[]),...sourceIds,effectId,...compatibilityIds].filter(Boolean))]};});
const rosterEnhancementProjections=canonicalRosterEnhancements.map(source=>{const sourceIds=new Set([source.id,source.ruleId,source.sourceId,source.legacyKey].filter(Boolean)),matches=effectiveEnhancements.filter(candidate=>candidate.detachmentId===source.detachmentId&&[candidate.id,candidate.ruleId,candidate.sourceId,candidate.legacyKey,...(candidate.canonicalEffectRecordIds||[])].some(id=>sourceIds.has(id)));if(matches.length!==1)throw new Error(`${config.id}: ${source.detachmentId}/${source.id} must resolve to one canonical Enhancement text owner; got ${matches.length}`);return{...source,text:matches[0].text};});
rosterCatalog=createRosterCatalog({config,units,detachments,relationGraphs,legacyEnhancements:rosterEnhancements,enhancementContracts:rosterEnhancementProjections,keywordGrants:relatedRules?.keywordGrants||[],effectContracts});
for(const contractSet of effectiveEffectContractSets)validateEffectContractsAgainstCatalog(contractSet,rosterCatalog,{effectiveBookId:config.id});
const dependencyArmyRuleSources=dependencyCodices.flatMap(dependency=>(dependency.pack.updates||[]).map(item=>({...item,sourceBook:dependency.id,sourceFile:dependency.pack.meta.file,sourceVersion:dependency.pack.meta.version})));
const datasheetArmyRuleSources=units.flatMap(unit=>(unit.abilities||[]).map(item=>({...item,subject:item.title,change:item.text,datasheetSource:true})));
const armyRuleSources=[...(pack.updates||[]),...(codexParity?.armyRules||[]),...dependencyArmyRuleSources,...datasheetArmyRuleSources];
const selectedArmyRuleSourceIds=new Set();
const resolvedArmyRules=resolveArmyRuleBindings(config.armyRuleBindings,armyRuleSources,{label:`${config.id} Army rule`}).map(({binding,source:item})=>{const title=item.subject||item.title,text=item.change||item.summary||item.text;selectedArmyRuleSourceIds.add(binding.sourceId);return{id:binding.id,termId:binding.termId,title,text,sourcePages:item.sourcePages,source:item.sourceBook?'dependency':item.sourcePages?'faction-pack':item.datasheetSource?'datasheet':'codex-parity',sourceBook:item.sourceBook,sourceFile:item.sourceFile,sourceVersion:item.sourceVersion};});
const resolvedUpdates=[...pack.updates.filter(item=>!selectedArmyRuleSourceIds.has(item.id)).map(item=>({id:item.id,title:item.title||item.subject,text:item.summary||item.text||item.change,pages:item.sourcePages,type:'Official update'})),...pack.faqs.map(item=>({id:item.id,title:item.question,text:item.answer,pages:item.sourcePages,type:'Official FAQ'}))];
const resolvedCoreRelatedRules=(()=>{if(!config.includeCoreStratagems)return'';const value=fs.readFileSync(path.join(repo,'books','core-rules','content','core-stratagems.related-rules.inc'),'utf8'),start=value.indexOf('<section class="related-detachment related-core"'),next=value.indexOf('<section class="related-detachment',start+1);if(start<0)throw new Error('Core Stratagems source is absent');return next>start?value.slice(start,next):value.slice(start);})();
const relatedRulesByBook=Object.fromEntries([[config.id,relatedRules],...dependencyCodices.map(dependency=>[dependency.id,dependency.relatedRules])]);
const unitSourceById=new Map(units.map(unit=>[unit.id,unit])),detachmentSourceById=new Map(detachments.map(item=>[item.id,item])),projectedUnitById=new Map(effectivePointsProjection.units.map(item=>[item.id,item])),projectedDetachmentById=new Map(effectivePointsProjection.detachments.map(item=>[item.id,item]));
let effectiveModel=createEffectiveBookModel({
  schema:EFFECTIVE_BOOK_MODEL_SCHEMA,
  book:{id:config.id,title:config.title,parentBookId:config.dependencies?.[0]||null,dependencies:(config.dependencies||[]).map(bookId=>({bookId,kind:'effective-book-dependency'}))},
  dependencies:(config.dependencies||[]).map(bookId=>({bookId,kind:'effective-book-dependency'})),
  units:units.map(source=>{const unit=projectedUnitById.get(source.id);return{...unit,...unitSourceById.get(unit.id),sourceBookId:unit.sourceBookId,publicationState:unit.publicationState,points:unit.points,paidWargear:unit.paidWargear,ruleProfile:unit.ruleProfile,ruleFacts:unitRuleFacts.get(unit.id)};}),
  detachments:detachments.map(source=>({...detachmentSourceById.get(source.id),...projectedDetachmentById.get(source.id)})),
  detachmentRules:canonicalDetachmentRules,
  enhancements:effectiveEnhancements,
  rules:{armyRules:resolvedArmyRules,updates:resolvedUpdates,relatedRulesByBook,enhancementOwners,coreRelatedRules:resolvedCoreRelatedRules},
  relationGraphs,
  effectContracts,
  effectivePointsProjection,
  ruleFacts:unitRuleFacts,
  ruleProfiles:unitRuleProfiles,
  rosterCatalog,
  rosterEnhancements,
  glossary:[...terms.values()],
  presentation:{mode:'shared-structured',glossaryV2CompatibilityTerms}
});
units=effectiveModel.units;
detachments=effectiveModel.detachments;
relationGraphs=effectiveModel.relationGraphs;
unitRuleFacts=effectiveModel.ruleFacts;
unitRuleProfiles=effectiveModel.ruleProfiles;
effectContracts=effectiveModel.effectContracts;
effectivePointsProjection=effectiveModel.effectivePointsProjection;
rosterEnhancements=effectiveModel.rosterEnhancements;
relatedRules=effectiveModel.rules.relatedRulesByBook[config.id];
enhancementOwners=effectiveModel.rules.enhancementOwners;
enhancementOwnerRecords=Object.entries(effectiveModel.rules.enhancementOwners?.enhancements||{}).map(([id,record])=>({id,...record}));
for(const dependency of dependencyCodices)dependency.relatedRules=effectiveModel.rules.relatedRulesByBook[dependency.id];
rosterCatalog=effectiveModel.rosterCatalog;
const canonicalEnhancementFor=(item,det)=>{
  const sourceIds=new Set([item?.id,item?.ruleId,item?.sourceId,item?.legacyKey].filter(Boolean));
  const matches=effectiveModel.enhancements.filter(candidate=>candidate.detachmentId===det.id&&[candidate.id,candidate.ruleId,candidate.sourceId,candidate.legacyKey,...(candidate.canonicalEffectRecordIds||[])].some(id=>sourceIds.has(id)));
  if(matches.length!==1)throw new Error(`${config.id}: ${det.id}/${item?.id||'<missing>'} must resolve to one canonical Enhancement; got ${matches.length}`);
  return matches[0];
};
unitById=indexCanonicalById(units,{label:`${config.id} effective relation unit`});
presentationUnitByTitle=new Map(units.map(unit=>[titleKey(unit.title),unit]));
const fixedCategoryOrder=['Epic Heroes','Characters','Battleline','Dedicated Transports','Monsters','Infantry'];
const categoryLabel=category=>config.datasheetCategoryLabels?.[category]||category;
const categoriesFor=(sourceUnits,prefix='')=>[...fixedCategoryOrder,...new Set(sourceUnits.map(unit=>categoryLabel(unit.category)).filter(category=>!fixedCategoryOrder.includes(category)&&category!=='Other'&&category!=='Warhammer Legends')),'Other','Warhammer Legends'].map(title=>({title,id:`datasheets-${prefix?`${prefix}-`:''}${slug(title)}`,units:sourceUnits.filter(unit=>title==='Warhammer Legends'?unit.publicationState==='Warhammer Legends':unit.publicationState!=='Warhammer Legends'&&categoryLabel(unit.category)===title)})).filter(group=>group.units.length);
const groupedDependencyDatasheets=dependencyScope.render!==false&&dependencyScope.groupByBook===true;
let datasheetLayers=groupedDependencyDatasheets?[{id:`datasheets-${config.id}`,title:config.title,kind:'publication-owned',units:units.filter(unit=>!unit.dependencyBook)},...dependencyCodices.map(dependency=>({id:`datasheets-${dependency.id}`,title:dependency.config.title,kind:'shared',units:units.filter(unit=>unit.dependencyBook===dependency.id)}))].map(layer=>({...layer,categories:categoriesFor(layer.units,layer.kind==='shared'?slug(layer.title):'')})):[];
let categories=groupedDependencyDatasheets?datasheetLayers.flatMap(layer=>layer.categories):categoriesFor(units);
const glossaryProjectionTerms=new Map([...terms].map(([id,term])=>[id,structuredClone(term)]));
for(const det of detachments){
  for(const item of det.enhancements||[]){
    const explicit=enhancementContract(item,det);
    if(enhancementOwnerRecord(item,det)&&!explicit)continue;
    const canonical=canonicalEnhancementFor(item,det),tags=canonical.tags||[];
    addTermTo(glossaryProjectionTerms,item.title,tags.includes('UPGRADE')?`UPGRADE. ${canonical.text}`:canonical.text,`detachment-${det.id}`,'enhancement','',det.dependencyBook||config.id);
  }
  for(const item of det.stratagems||[])addTermTo(glossaryProjectionTerms,item.title,[item.when,item.target,item.effect,item.restrictions].filter(Boolean).join(' '),`detachment-${det.id}`,'stratagem','',det.dependencyBook||config.id);
  for(const {rule,anchor,additional} of detachmentRuleEntries(det))addTermTo(glossaryProjectionTerms,rule.title,sourceAwareText(rule),additional?anchor:`detachment-${det.id}`,'detachment-rule','',det.dependencyBook||config.id);
}
for(const unit of categories.flatMap(group=>group.units))for(const model of canonicalRosterModelsFor(unit).filter(model=>model.intrinsicKeywords?.length))addTermTo(glossaryProjectionTerms,model.title,`${model.title} only: ${model.intrinsicKeywords.join(', ')}.`,`${unit.id.replace(/^unit-/,'')}-keywords`,'model-keywords',unit.id,unit.dependencyBook||config.id);
for(const item of effectiveModel.rules.armyRules){const termId=addTermTo(glossaryProjectionTerms,item.title,item.text,item.id,'army-rule','',item.sourceBook||config.id);if(glossaryV2CompatibilityTerms)item.presentationTermId=termId;}
const glossaryProjection=[...glossaryProjectionTerms].map(([id,item])=>({id,title:item.title,summary:item.summary,full:item.full,glossary:item.glossary,...(item.rule?{rule:item.rule}:{}),...(item.units.length?{units:item.units,datasheet:item.units[0],statline:item.units[0].replace(/^unit-/,'')+'-profile'}:{})}));
effectiveModel=createEffectiveBookModel({...effectiveModel,glossary:glossaryProjection});
units=effectiveModel.units;detachments=effectiveModel.detachments;relationGraphs=effectiveModel.relationGraphs;unitRuleFacts=effectiveModel.ruleFacts;unitRuleProfiles=effectiveModel.ruleProfiles;effectContracts=effectiveModel.effectContracts;effectivePointsProjection=effectiveModel.effectivePointsProjection;rosterCatalog=effectiveModel.rosterCatalog;rosterEnhancements=effectiveModel.rosterEnhancements;relatedRules=effectiveModel.rules.relatedRulesByBook[config.id];enhancementOwners=effectiveModel.rules.enhancementOwners;enhancementOwnerRecords=Object.entries(enhancementOwners?.enhancements||{}).map(([id,record])=>({id,...record}));for(const dependency of dependencyCodices)dependency.relatedRules=effectiveModel.rules.relatedRulesByBook[dependency.id];unitById=indexCanonicalById(units,{label:`${config.id} final effective relation unit`});presentationUnitByTitle=new Map(units.map(unit=>[titleKey(unit.title),unit]));
datasheetLayers=groupedDependencyDatasheets?[{id:`datasheets-${config.id}`,title:config.title,kind:'publication-owned',units:units.filter(unit=>!unit.dependencyBook)},...dependencyCodices.map(dependency=>({id:`datasheets-${dependency.id}`,title:dependency.config.title,kind:'shared',units:units.filter(unit=>unit.dependencyBook===dependency.id)}))].map(layer=>({...layer,categories:categoriesFor(layer.units,layer.kind==='shared'?slug(layer.title):'')})):[];categories=groupedDependencyDatasheets?datasheetLayers.flatMap(layer=>layer.categories):categoriesFor(units);
terms.clear();for(const item of effectiveModel.glossary)terms.set(item.id,{...structuredClone(item),units:[...(item.units||[])]});
const armyRules=effectiveModel.rules.armyRules,updates=effectiveModel.rules.updates,sharedCoreInc=effectiveModel.rules.coreRelatedRules;
if(projectionOnly)return {effectivePointsProjection:effectiveModel.effectivePointsProjection,effectiveBookModel:effectiveModel};

const navLeaf=(id,label,depth)=>`<li data-nav-id="${esc(id)}" data-nav-depth="${depth}"><div class="toc-row no-toggle"><button class="toc-label" data-nav-target="${esc(id)}">${esc(label)}</button></div></li>`;
const navBranch=(id,label,depth,children)=>`<li data-nav-id="${esc(id)}" data-nav-depth="${depth}"><div class="toc-row"><button class="toc-label" data-nav-target="${esc(id)}">${esc(label)}</button><button class="toc-toggle" data-nav-toggle aria-label="Toggle ${esc(label)}" aria-expanded="false"></button></div><ul class="toc-branch" hidden>${children}</ul></li>`;
const tracked=(id,title,body,classes='content-group',titleSuffix='')=>`<section class="${classes}" id="${esc(id)}" data-track="${esc(id)}"><h3 class="category-title${titleSuffix?' detachment-title':''}">${esc(title)}${titleSuffix}</h3>${body}</section>`;
const sourceLink=pages=>`<a class="source-link" href="./sources/${esc(path.basename(pack.meta.file))}#page=${pages[0]}">Official Faction Pack v${esc(pack.meta.version)} · p. ${pages.join('–')}</a>`;
const codexSourceLink=()=>`<a class="source-link" href="${esc(codexParity.source.url)}">${esc(codexParity.source.title)}</a>`;
const verificationBuild=manifest.gates?.publishAsComplete===false;
const reviewLabel=config.reviewEntry?manifest.gates?.reviewLabel:'';
const heroReview=reviewLabel?`<div class="eyebrow">${esc(reviewLabel)}</div>`:'';
const entryReview=reviewLabel?`<p><strong>${esc(reviewLabel)}</strong></p><p>${esc(manifest.gates.reason)}</p>`:'';
const unitSourceState=unit=>verificationBuild&&!config.dedicatedMobile?`<div class="unit-source-state">${unit.dependencyBook?`<span>${esc(unit.dependencyTitle)} shared datasheet</span>`:''}<span>Datasheet structure · current 11e catalogue</span><span>${unit.pointsSource?`${esc(unit.pointsSource.label)} · checked ${esc(unit.pointsSource.verifiedAt)}`:'Points · catalogue snapshot'}</span>${unit.wargearSource?'<span>Wargear & composition · current 11e reference</span>':''}${unit.sourcePages?`<span>${unit.dependencyBook?`${esc(unit.dependencyTitle)} `:''}Official Faction Pack overlay · p. ${unit.sourcePages.join('–')}</span>`:''}</div>`:'';
const categoryNav=(group,depth)=>navBranch(group.id,group.title,depth,group.units.map(unit=>navLeaf(unit.id,unit.title,depth+1)).join(''));
const datasheetNav=groupedDependencyDatasheets?datasheetLayers.map(layer=>navBranch(layer.id,layer.title,2,layer.categories.map(group=>categoryNav(group,3)).join(''))).join(''):categories.map(group=>categoryNav(group,2)).join('');
const detachmentNav=detachments.map(det=>navBranch(`detachment-${det.id}`,det.title,2,
  navLeaf(`${det.id}-rule`,'Detachment Rule',3)
  +detachmentRuleEntries(det).filter(entry=>entry.additional).map(entry=>navLeaf(entry.anchor,entry.rule.title,3)).join('')
  +((det.enhancements||[]).length?navLeaf(`${det.id}-enhancements`,'Enhancement',3):'')
  +((det.stratagems||[]).length?navLeaf(`${det.id}-stratagems`,'Stratagems',3):'')
)).join('');
const toc=navLeaf('start','Start',1)
  +(armyRules.length?navBranch('army-rules','Army Rules',1,armyRules.map(item=>navLeaf(item.id,item.title,2)).join('')):'')
  +navBranch('detachments','Detachments',1,detachmentNav)
  +navBranch('datasheets','Datasheets',1,datasheetNav)
  +navBranch('updates','Updates',1,updates.map(item=>navLeaf(`update-${item.id}`,item.title,2)).join(''));

const enhancementCard=(item,det,{related=false}={})=>{
  const explicit=enhancementContract(item,det);
  if(enhancementOwnerRecord(item,det)&&!explicit)return'';
  if(related&&!explicit)return'';
  const canonical=canonicalEnhancementFor(item,det),tags=canonical.tags||[],isUpgrade=tags.includes('UPGRADE');
  const termText=isUpgrade?`UPGRADE. ${canonical.text}`:canonical.text;
  return`<article class="enhancement surface" data-rule-id="${esc(enhancementRuleId(item,det))}" data-enhancement-tags="${esc(tags.join('|'))}" data-owner-subject="${esc(explicit?.owner?.subject||'')}"${config.compatibleRulesMatrix?` data-enhancement-title="${esc(item.title.replace(/\s*\(Aura\)$/i,''))}"`:''}${explicit&&config.legacyRelatedRuleAttributes!==false?` data-eligibility="${esc(JSON.stringify(explicit))}"`:''}><div class="eyebrow">Enhancement${isUpgrade?' · UPGRADE':''}${item.value?` · ${item.value} pts`:''}</div><h4><button class="term-button" data-term="${glossaryV2CompatibilityTerms&&item.termId?item.termId:addTerm(item.title,termText,`detachment-${det.id}`,'enhancement','',det.dependencyBook||config.id)}">${esc(item.title)}</button></h4><p data-source-field="text">${esc(canonical.text)}</p></article>`;
};
const stratagemCard=(item,det)=>{const eligibility=config.legacyRelatedRuleAttributes!==false?stratagemEligibility(item):null,type=item.canonicalType||item.typeStatus||'',typeAttrs=item.typeStatus?` data-stratagem-type="${esc(type)}" data-source-label="${esc(item.sourceLabel||'')}"`:'',typeLabel=item.typeStatus&&item.sourceLabel?`<span class="stratagem-type">${esc(item.sourceLabel)}</span>`:'';return`<article class="stratagem surface" data-rule-id="${esc(item.id)}"${typeAttrs}${config.legacyRelatedRuleAttributes!==false?` data-eligibility="${esc(JSON.stringify(eligibility))}"`:''}><div class="stratagem-head"><div><h3><button class="term-button" data-term="${glossaryV2CompatibilityTerms&&item.termId?item.termId:addTerm(item.title,[item.when,item.target,item.effect,item.restrictions].filter(Boolean).join(' '),`detachment-${det.id}`,'stratagem','',det.dependencyBook||config.id)}">${esc(item.title)}</button></h3>${typeLabel}</div><div class="cp">${esc(item.cp)}CP</div></div><p class="field" data-source-field="when"><b>When</b><br>${esc(item.when)}</p><p class="field" data-source-field="target"><b>Target</b><br>${esc(item.target)}</p><p class="field" data-source-field="effect"><b>Effect</b><br>${esc(item.effect)}</p>${item.restrictions?`<p class="field" data-source-field="restrictions"><b>Restrictions</b><br>${esc(item.restrictions)}</p>`:''}</article>`;};
const dependencyDetachmentSourceLink=det=>`<a class="source-link" href="../${esc(det.dependencyBook)}/sources/${esc(det.dependencySourceFile)}#page=${det.sourcePages[0]}">${esc(det.dependencyTitle)} Faction Pack v${esc(det.dependencySourceVersion)} · p. ${det.sourcePages.join('–')}</a>`;
const detachmentHtml=detachments.map(det=>{
  const official=Boolean(det.sourcePages),enhancements=(det.enhancements||[]).map(item=>enhancementCard(item,det)).join(''),stratagems=(det.stratagems||[]).map(item=>stratagemCard(item,det)).join('');
  const rule=det.rule?detachmentRuleEntries(det).map(({rule,anchor,additional})=>`<article class="rule-card surface"${additional?` id="${esc(anchor)}" data-track="${esc(anchor)}"`:''}><h4><button class="term-button" data-term="${addTerm(rule.title,sourceAwareText(rule),additional?anchor:`detachment-${det.id}`,'detachment-rule','',det.dependencyBook||config.id)}">${esc(rule.title)}</button></h4>${clean(rule.text)?`<p data-source-field="text">${esc(rule.text).replace(/\n/g,'<br>')}</p>`:''}${sourceAvailabilityNote(rule)}</article>`).join(''):`<article class="rule-card surface source-warning"><h4>Codex source required</h4><p>This Detachment is current, but its complete rule and Stratagem text is not present in Faction Pack v${esc(pack.meta.version)}. It is not reproduced here until the Codex layer is verified.</p></article>`;
  const ruleSection=`<section class="detachment-part" id="${esc(det.id)}-rule" data-track="${esc(det.id)}-rule"><h4 class="subheading">Detachment Rule</h4>${rule}</section>`;
  const enhancementSection=enhancements?`<section class="detachment-part" id="${esc(det.id)}-enhancements" data-track="${esc(det.id)}-enhancements"><h4 class="subheading">Enhancements</h4><div class="detachment-grid">${enhancements}</div></section>`:'';
  const stratagemSection=stratagems?`<section class="detachment-part" id="${esc(det.id)}-stratagems" data-track="${esc(det.id)}-stratagems"><h4 class="subheading">Stratagems</h4><div class="detachment-grid stratagem-grid">${stratagems}</div></section>`:'';
  const dp=det.detachmentPoints==null?'':`<span class="detachment-dp">${esc(det.detachmentPoints)}DP</span>`;
  const sourceLabel=det.dependencyBook?`${det.dependencyTitle.toUpperCase()} SHARED · ${official?'OFFICIAL FACTION PACK':esc(det.dependencyCodexSourceLabel)}`:official?'OFFICIAL FACTION PACK':esc(config.codexSourceLabel||'CODEX INDEX');
  const sourceFooter=official?`<p class="source">${det.dependencyBook?dependencyDetachmentSourceLink(det):sourceLink(det.sourcePages)}</p>`:'';
  return tracked(`detachment-${det.id}`,det.title,`<div class="detachment-meta"><span>${sourceLabel}</span>${det.forceDisposition?`<span>${esc(det.forceDisposition)}</span>`:''}</div>${ruleSection}${enhancementSection}${stratagemSection}${sourceFooter}`,'content-group detachment',dp);
}).join('');
const statline=unit=>{const ownerId=`${unit.id.replace(/^unit-/,'')}-profile`;return(unit.profiles||[]).map(profile=>{const stats=Object.entries(profile.stats).filter(([,value])=>value),base=stats.find(([name])=>name==='Base'),combat=stats.filter(([name])=>name!=='Base');return`<div class="model-profile" data-profile="${esc(slug(profile.name))}" data-logical-owner="${esc(ownerId)}">${unit.profiles.length>1?`<h5>${esc(profile.name)}</h5>`:''}<div class="statline" data-logical-owner="${esc(ownerId)}">${combat.map(([name,value])=>`<div class="stat" data-source-field="stats.${esc(name)}"><b>${esc(name)}</b><span>${esc(value)}</span></div>`).join('')}</div>${base?`<p class="profile-base" data-logical-owner="${esc(ownerId)}" data-source-field="stats.Base">Base: ${esc(base[1])}</p>`:''}</div>`;}).join('');};
const weaponTables=unit=>['ranged','melee'].map(mode=>{const rows=(unit.weapons||[]).map((item,index)=>({item,index})).filter(record=>record.item.mode===mode);if(!rows.length)return'';const skill=mode==='ranged'?'BS':'WS';return`<div class="weapon-group"><h5>${mode==='ranged'?'Ranged':'Melee'} weapons</h5><div class="weapon-table" role="table"><div class="weapon-row weapon-head"><div>Weapon</div><div>Range</div><div>A</div><div>${skill}</div><div>S</div><div>AP</div><div>D</div></div>${rows.map(({item,index})=>`<div class="weapon-row" data-roster-profile-id="${esc(canonicalWeaponProfileId(unit,item,index))}" data-source-field="weapons.${esc(slug(item.name))}" data-mode="${mode}"><div data-source-field="name"><button class="weapon-button" data-term="${item.termId}">${esc(item.name)}</button>${item.abilities?weaponAbilityTokens(item.abilities,unit.dependencyBook||config.id):''}</div><div data-label="Range" data-source-field="range">${esc(item.range)}</div><div data-label="A" data-source-field="a">${esc(item.a)}</div><div data-label="${skill}" data-source-field="skill">${esc(item.skill)}</div><div data-label="S" data-source-field="s">${esc(item.s)}</div><div data-label="AP" data-source-field="ap">${esc(item.ap)}</div><div data-label="D" data-source-field="d">${esc(item.d)}</div></div>`).join('')}</div></div>`;}).join('');
const renderedUnitIds=new Set(units.map(unit=>unit.id));
const relationLabel=name=>{const target=presentationUnitByTitle.get(titleKey(name));return target&&renderedUnitIds.has(target.id)?`<button class="term-button" data-journey-target="${esc(target.id)}" data-journey-type="datasheet">${esc(name)}</button>`:esc(name);};
const unitSourceLink=unit=>unit.dependencyBook?`<a class="source-link" href="../${esc(unit.dependencyBook)}/sources/${esc(unit.dependencySourceFile)}#page=${unit.sourcePages[0]}">${esc(unit.dependencyTitle)} Faction Pack v${esc(unit.dependencySourceVersion)} · p. ${unit.sourcePages.join('–')}</a>`:sourceLink(unit.sourcePages);
const unitCard=unit=>{
  const base=unit.id.replace(/^unit-/,''),pointsText=(unit.points||[]).map(item=>{
    const repeated=String(item.label||'').match(/^(\d+)\+ unit:\s*(\d+) models?$/i);
    const label=repeated?`${repeated[1]}+ copy · ${repeated[2]} model${repeated[2]==='1'?'':'s'}`:item.label;
    return `${label}: ${item.value} pts`;
  }).join('\n');
  const pointRows=(unit.points||[]).map(item=>({label:item.label,value:item.value}));
  const pointsSummary=pointRows.length===1?pointsText:pointRows.length>1?'MULTIPLE COSTS':pointsText;
  const pointsPanel=pointRows.length?`<div class="points-panel surface"><div class="eyebrow">Points</div>${pointRows.map(item=>`<div class="points-row"><span>${esc(item.label)}</span><strong>${esc(item.value)} pts</strong></div>`).join('')}</div>`:'';
  const wargearAbilitiesId=`${base}-wargear-abilities`;
  const parts={profile:`${base}-profile`,abilities:`${base}-abilities`,...((unit.wargearAbilities||[]).length?{'wargear abilities':wargearAbilitiesId}:{}),composition:`${base}-composition`,...((unit.relations?.leader||[]).length?{leader:`${base}-leader`}:{}),...(config.renderSupportRelations&&unit.relations?.support?.length?{support:`${base}-support`}:{}),...(config.renderTransportRelations&&unit.relations?.transport?.length?{transport:`${base}-transport`}:{}),keywords:`${base}-keywords`};
  const tabs=Object.entries(parts).map(([label,id])=>`<button class="local-tab" data-journey-target="${id}" data-journey-type="datasheet">${label[0].toUpperCase()+label.slice(1)}</button>`).join('');
  const classified=config.classifiedAbilityPresentation===true;
  const compact=(unit.dependencyCompactSharedAbilities||config.compactSharedAbilities||[]).map(titleKey),presentationClass=item=>item.termId?.startsWith('core-')?'core':item.abilityClass,isCompact=item=>classified?['core','faction'].includes(presentationClass(item)):compact.some(value=>titleKey(item.title)===value||titleKey(item.title).startsWith(`${value} `));
  const shared=unique((unit.abilities||[]).filter(isCompact),item=>titleKey(item.title)),specific=(unit.abilities||[]).filter(item=>!isCompact(item));
  const compactButtons=items=>`<div class="keyword-list shared-abilities">${items.map(item=>`<button class="term-button" data-term="${item.termId}" data-source-field="abilities.${esc(slug(item.title))}" data-source-value="${esc(item.text)}">${esc(item.title)}</button>`).join('')}</div>`;
  const compactAbilities=classified?['core','faction'].map(group=>{const items=shared.filter(item=>presentationClass(item)===group);return items.length?`<div class="ability-compact-group" data-ability-class="${group}"><h5>${group.toUpperCase()}</h5>${compactButtons(items)}</div>`:'';}).join(''):(shared.length?compactButtons(shared):'');
  const wargearAbilitySection=(unit.wargearAbilities||[]).length?`<section class="unit-part" id="${wargearAbilitiesId}"><h4>Wargear Abilities</h4><p class="unit-note">These abilities apply only while the corresponding wargear is equipped.</p><div class="ability-list">${unit.wargearAbilities.map((item,index)=>`<article class="ability" data-roster-wargear-ability-id="${esc(canonicalWargearAbilityId(unit,item,index))}" data-source-field="wargearAbilities.${esc(slug(item.title))}"><h5><button class="term-button" data-term="${item.termId}">${esc(item.title)}</button></h5>${item.text?`<p data-source-field="text">${esc(item.text)}</p>`:''}</article>`).join('')}</div></section>`:'';
  const composition=unit.compositionText?`<p>${esc(unit.compositionText)}</p>`:`<ul>${(unit.composition||[]).map(item=>`<li>${item.min}${item.max!==item.min?`–${item.max}`:''} ${esc(item.name)}</li>`).join('')}</ul>`;
  const wargear=unit.wargear?.length?`<h5>Wargear Options</h5><ul>${unit.wargear.map(item=>`<li class="wargear-option">${escLines(item)}</li>`).join('')}</ul>`:'';
  const leader=(unit.relations?.leader||[]).length?`<section class="unit-part" id="${parts.leader}" data-source-field="relations.leader"><h4>Leader</h4><p>This model can be attached to: ${unit.relations.leader.map(relationLabel).join('; ')}.</p></section>`:'';
  const support=parts.support?`<section class="unit-part" id="${parts.support}" data-source-field="relations.support"><h4>Support</h4><p>This unit can join: ${unit.relations.support.map(relationLabel).join('; ')}.</p></section>`:'';
  const transport=parts.transport?`<section class="unit-part" id="${parts.transport}" data-source-field="relations.transport"><h4>Transport</h4>${unit.relations.transport.map(item=>`<p>${esc(item)}</p>`).join('')}</section>`:'';
  const modelKeywords=canonicalRosterModelsFor(unit).filter(model=>model.intrinsicKeywords?.length).map(model=>`<p class="model-keywords" data-roster-model-id="${esc(model.id)}">${glossaryV2CompatibilityTerms?`<span>${esc(model.title)}</span>`:`<button class="term-button" data-term="${addTerm(model.title,`${model.title} only: ${model.intrinsicKeywords.join(', ')}.`,`${base}-keywords`,'model-keywords',unit.id,unit.dependencyBook||config.id)}">${esc(model.title)}</button>`} only: ${model.intrinsicKeywords.map(keyword=>`<span data-model-keyword="${esc(keyword)}">${esc(keyword)}</span>`).join(', ')}</p>`).join('');
  const ruleFacts=unitRuleFacts.get(unit.id);
  return`<article class="unit-card surface${unit.publicationState==='Warhammer Legends'?' legends-card':''}" id="${unit.id}" data-track="${unit.id}" data-unit-title="${esc(unit.title)}" data-rule-facts="${esc(JSON.stringify(ruleFacts))}"><div class="unit-header"><div><div class="eyebrow">${esc(unit.publicationState)} · ${esc(unit.sourceLayer)}</div><h3>${esc(unit.title)}</h3></div><div class="unit-status">${esc(pointsSummary||'POINTS PENDING')}</div></div>${unitSourceState(unit)}<div class="local-nav">${tabs}</div><section class="unit-part" id="${parts.profile}"><h4>Profile & Weapons</h4>${pointsPanel}${statline(unit)}${weaponTables(unit)}</section><section class="unit-part" id="${parts.abilities}"><h4>Abilities</h4>${compactAbilities}<div class="ability-list">${specific.map(item=>`<article class="ability" data-source-field="abilities.${esc(slug(item.title))}"><h5><button class="term-button" data-term="${item.termId}">${esc(item.title)}</button></h5>${item.text?`<p data-source-field="text">${esc(item.text)}</p>`:''}${sourceAvailabilityNote(item)}</article>`).join('')}</div></section>${wargearAbilitySection}<section class="unit-part" id="${parts.composition}"><h4>Composition & Wargear</h4>${composition}${wargear}${unit.paidWargear?.length?`<h5>Paid wargear</h5><ul>${unit.paidWargear.map(item=>`<li>${esc(item.name)} · +${item.value} pts</li>`).join('')}</ul>`:''}</section>${leader}${support}${transport}<section class="unit-part" id="${parts.keywords}"><h4>Keywords</h4><div class="keyword-list">${(unit.keywords||[]).map(item=>`<span data-source-field="keywords.${esc(slug(item))}">${esc(item)}</span>`).join('')}</div>${modelKeywords}</section>${unit.sourcePages?`<p class="source">${unitSourceLink(unit)}</p>`:''}</article>`;
};
const datasheetHtml=groupedDependencyDatasheets?datasheetLayers.map(layer=>tracked(layer.id,layer.title,`<p class="eyebrow">${layer.kind==='shared'?'Shared Space Marines':'Dark Angels publication-owned'} · ${layer.units.length} datasheets</p>${layer.categories.map(group=>tracked(group.id,group.title,group.units.map(unitCard).join(''))).join('')}`,'datasheet-source-group')).join(''):categories.map(group=>tracked(group.id,group.title,group.units.map(unitCard).join(''))).join('');
const armyRuleSourceLink=item=>item.source==='dependency'?`<a class="source-link" href="../${esc(item.sourceBook)}/${esc(item.sourceFile)}#page=${item.sourcePages[0]}">${esc(item.sourceBook)} Faction Pack v${esc(item.sourceVersion)} · p. ${item.sourcePages.join('–')}</a>`:item.source==='faction-pack'?sourceLink(item.sourcePages):item.source==='datasheet'?'<span class="source-link">Current structured Datasheet evidence</span>':codexSourceLink();
const registerArmyRuleTerm=item=>addTerm(item.title,item.text,item.id,'army-rule','',item.sourceBook||config.id);
const armyRuleTermId=item=>item.termId||registerArmyRuleTerm(item);
for(const item of armyRules)if(item.termId)registerArmyRuleTerm(item);
const armyRulesHtml=armyRules.map(item=>tracked(item.id,item.title,`<article class="rule-card surface"><div class="eyebrow">Army rule</div><h4><button class="term-button" data-term="${armyRuleTermId(item)}">${esc(item.title)}</button></h4><p data-source-field="text">${esc(item.text)}</p><p class="source">${armyRuleSourceLink(item)}</p></article>`)).join('');
const updatesHtml=updates.map(item=>tracked(`update-${item.id}`,item.title,`<article class="rule-card surface"><div class="eyebrow">${item.type}</div><p>${esc(item.text)}</p><p class="source">${sourceLink(item.pages)}</p></article>`)).join('');
const relatedInc=detachments.map(det=>`<section class="related-detachment" data-detachment="${esc(det.id)}"${config.legacyRelatedRuleAttributes!==false?` data-keyword-grants="${esc(JSON.stringify(relatedRules.keywordGrants?.[det.id]||[]))}"`:''}><h2>${esc(det.title)} <span class="detachment-dp">${esc(det.detachmentPoints)}DP</span></h2><div data-related-kind="stratagems">${(det.stratagems||[]).map(item=>stratagemCard(item,det)).join('')}</div><div data-related-kind="enhancements">${(det.enhancements||[]).map(item=>enhancementCard(item,det,{related:true})).join('')}</div></section>`).join('')+sharedCoreInc;
const sourceGate=manifest.gates?.publishAsComplete===false?`<article class="rule-card surface source-warning"><div class="eyebrow">Build status</div><h3>Reference in verification</h3><p>${esc(manifest.gates.reason)}</p></article>`:'';
const html=`<!doctype html><html lang="en" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#0a0b0d"><title>${esc(config.title)} Rules — WH40K Library</title><link rel="manifest" href="../../manifest.webmanifest"><link rel="stylesheet" href="./styles/tokens.css?v=1"><link rel="stylesheet" href="../shared/styles/layout.css?v=${runtimeVersions.shared.readerLayout}"><link rel="stylesheet" href="../shared/styles/navigation.css?v=${runtimeVersions.shared.readerNavigationCss}"><link rel="stylesheet" href="../shared/styles/content.css?v=${runtimeVersions.shared.readerContent}"><link rel="stylesheet" href="../shared/styles/popups.css?v=${runtimeVersions.shared.readerPopups}"><link rel="stylesheet" href="../shared/styles/offline-status.css?v=${runtimeVersions.shared.offlineStatusCss}"><link rel="stylesheet" href="../shared/datasheet-system.css?v=8"><link rel="stylesheet" href="./styles/book.css?v=1"></head><body><header class="app-header"><button class="header-button nav-menu" id="navMenu" type="button" aria-label="Open navigation" aria-controls="tocPanel" aria-expanded="false">☰</button><button class="header-button nav-collapse" id="navCollapse" type="button" aria-label="Collapse navigation" aria-controls="tocPanel" aria-expanded="true">◀</button><div class="app-brand"><strong>${esc(config.shortTitle)}</strong><small>${esc(config.edition)} · ${esc(config.title)} reference</small></div><a class="library-link" href="../../index.html" aria-label="Back to rulebook library"><span aria-hidden="true">←</span><b>Library</b></a><a class="library-link view-switch" href="./mobile/index.html" data-view-switch><span aria-hidden="true">↔</span><b>Phone view</b></a><button class="back-button" id="backButton" type="button" hidden>Back</button><div class="header-spacer"></div></header><button class="toc-scrim" id="tocScrim" type="button" aria-label="Close navigation" aria-hidden="true"></button><nav class="toc-panel" id="tocPanel" aria-label="Rulebook navigation"><h2 class="toc-heading">Contents</h2><div class="toc-shortcuts"><a class="toc-label" href="../../glossary/index.html">Mega Glossary</a><a class="toc-label" href="../../roster-guides/index.html" data-roster-guides hidden>← Roster Guides</a></div><ul class="toc-tree" id="tocTree">${toc}</ul></nav><main class="main"><div class="document"><section class="hero section surface faction-hero" id="start" data-track="start"><div class="hero-content"><div class="eyebrow">${esc(config.edition)} · ${units.length} indexed datasheets · ${detachments.length} detachments</div>${heroReview}<h1>${esc(config.title)}</h1><p>Faction rules, current structured datasheets, Related Rules filtering and source-aware updates.</p></div>${heroMark}</section><section class="section" id="detachments" data-track="detachments"><h2 class="section-title">Detachments</h2>${detachmentHtml}</section><section class="section" id="datasheets" data-track="datasheets"><h2 class="section-title">Datasheets</h2>${datasheetHtml}</section><section class="section" id="updates" data-track="updates"><h2 class="section-title">Updates & Sources</h2>${sourceGate}${updatesHtml}</section><footer class="footer">${esc(config.title)} · source-aware local reference</footer></div></main><div class="popup-layer" id="popupLayer" aria-live="polite"></div><script src="../../glossary/v2/generated/index.en.js?v=1"></script><script src="../../glossary/v2/runtime/glossary-v2-runtime.js?v=1"></script><script src="../shared/navigation-targets.js"></script><script src="../shared/popup-rule-actions.js"></script><script src="../shared/datasheet-layout.js"></script><script src="../shared/popup-content.js"></script><script src="../shared/glossary-autolink.js"></script><script src="../shared/related-rules-matcher.js"></script><script src="./scripts/data.js"></script><script src="../shared/controllers/navigation-controller.js"></script><script src="../shared/controllers/full-entry-controller.js"></script><script src="../shared/controllers/popup-controller.js"></script><script src="../shared/controllers/journey-controller.js"></script><script src="../shared/controllers/ui-controllers.js"></script><script src="../shared/army-related-rules.js"></script><script src="../shared/army-book-app.js"></script><script src="./scripts/app.js"></script></body></html>\n`;
const normalizedHtml=html
  .replace('<link rel="stylesheet" href="./styles/tokens.css?v=1">',`<link rel="stylesheet" href="../shared/styles/tokens.css?v=11"><link rel="stylesheet" href="./styles/tokens.css?v=${config.assetVersions?.tokens||(config.dedicatedMobile?'3':'2')}">`)
  .replace('./styles/book.css?v=1',`./styles/book.css?v=${config.dedicatedMobile?(config.assetVersions?.book||4):(config.assetVersions?.book||2)}`)
  .replace('href="./mobile/index.html" data-view-switch','href="./reader.html?view=mobile" data-view-switch')
  .replace('<header class="app-header">','<header class="app-header" id="appHeader">')
  .replace('<main class="main">','<main class="main" id="main">')
  .replace('<section class="section" id="detachments"',`<section class="section" id="army-rules" data-track="army-rules"><h2 class="section-title">Army Rules</h2>${armyRulesHtml}</section><section class="section" id="detachments"`)
  .replace('<script src="../../glossary/v2/generated/index.en.js?v=1"></script><script src="../../glossary/v2/runtime/glossary-v2-runtime.js?v=1">',`<script src="../../glossary-return.js?v=${runtimeVersions.shared.glossaryReturn}"></script><script src="../../glossary/v2/generated/index.en.js?v=1"></script><script src="../../glossary/v2/runtime/glossary-v2-runtime.js?v=1">`)
  .replace('../shared/navigation-targets.js"',`../shared/navigation-targets.js?v=${runtimeVersions.shared.navigationTargets}"`)
  .replace('../shared/popup-rule-actions.js"','../shared/popup-rule-actions.js?v=1"')
  .replace('../shared/datasheet-layout.js"',`../shared/datasheet-layout.js?v=${runtimeVersions.shared.datasheetLayout}"`)
  .replace('../shared/popup-content.js"','../shared/popup-content.js?v=3"')
  .replace('../shared/glossary-autolink.js"','../shared/glossary-autolink.js?v=9"')
  .replace('<script src="../shared/related-rules-matcher.js">','<script src="../shared/rule-facts.js?v=4"></script><script src="../shared/related-rules-matcher.js">')
  .replace('../shared/related-rules-matcher.js"','../shared/related-rules-matcher.js?v=6"')
  .replace('<script src="./scripts/data.js">',`${config.rosterSupport?`<script src="../shared/roster-parser.js?v=${runtimeVersions.shared.rosterParser}"></script><script src="../shared/roster-entities.js?v=1"></script>`:''}<script src="./scripts/data.js">`)
  .replace('</script><script src="../shared/controllers/navigation-controller.js">',`</script>${config.rosterSupport?`<script src="./scripts/roster-data.js?v=${runtimeVersions.shared.rosterCatalog}"></script><script src="../shared/book-roster-enhancements.js?v=2"></script><script src="../shared/effect-contract-runtime.js?v=${runtimeVersions.shared.effectContractRuntime}"></script><script src="../extensions/book-roster-enhancement-providers.js?v=1"></script>`:''}<script src="../shared/controllers/navigation-controller.js">`)
  .replace('../shared/controllers/navigation-controller.js"',`../shared/controllers/navigation-controller.js?v=${runtimeVersions.shared.navigationController}"`)
  .replace('../shared/controllers/full-entry-controller.js"','../shared/controllers/full-entry-controller.js?v=9"')
  .replace('../shared/controllers/popup-controller.js"','../shared/controllers/popup-controller.js?v=25"')
  .replace('../shared/controllers/journey-controller.js"',`../shared/controllers/journey-controller.js?v=${runtimeVersions.shared.journeyController}"`)
  .replace('../shared/controllers/ui-controllers.js"',`../shared/controllers/ui-controllers.js?v=${runtimeVersions.shared.uiControllers}"`)
  .replace('./scripts/data.js','./scripts/data.js?v=2')
  .replace('<script src="../shared/army-related-rules.js"></script>','<script src="../shared/modal-focus.js?v=1"></script><script src="../shared/army-related-rules.js"></script>')
  .replace('../shared/rule-facts.js?v=4',`../shared/rule-facts.js?v=${runtimeVersions.shared.ruleFacts}`)
  .replace('../shared/army-related-rules.js',`../shared/army-related-rules.js?v=${runtimeVersions.shared.relatedRules}`)
  .replace('../shared/army-book-app.js',`../shared/army-book-app.js?v=${runtimeVersions.shared.armyBook}`)
  .replace('./scripts/app.js',`./scripts/app.js?v=${config.assetVersions?.app||(config.dedicatedMobile?'3':'2')}`);
const coveredHtml=config.coverImage?normalizedHtml.replace('class="hero section surface faction-hero"','class="hero section surface faction-hero faction-hero-cover"'):normalizedHtml;
let finalHtml=config.dedicatedMobile?coveredHtml
  .replace('./styles/book.css?v=2',`./styles/book.css?v=${config.assetVersions?.book||4}`)
  .replace('./scripts/app.js?v=3',`./scripts/app.js?v=${config.assetVersions?.app||4}`):coveredHtml;
if(config.dedicatedMobile&&!config.sharedArmyBookApp)finalHtml=finalHtml.replace(/<script src="\.\.\/shared\/army-book-app\.js\?v=\d+"><\/script>/,'');
if(config.compatibleRulesMatrix){
  finalHtml=finalHtml
    .replace(/<script src="\.\.\/shared\/related-rules-matcher\.js\?v=6"><\/script>/,'');
  if(!config.sharedArmyBookApp){
    finalHtml=finalHtml.replace(/<script src="\.\.\/shared\/army-related-rules\.js(?:\?v=\d+)?"><\/script>/,'');
    finalHtml=finalHtml.replace(/<script src="\.\.\/shared\/army-book-app\.js\?v=\d+"><\/script>/,'');
  }
}
finalHtml=finalHtml.replace(/<script src="\.\.\/shared\/army-book-app\.js\?v=\d+"><\/script>/,match=>`<script src="../shared/roster-context.js?v=${runtimeVersions.shared.rosterContext}"></script><script src="../shared/roster-game-presentation.js?v=${runtimeVersions.shared.rosterGamePresentation}"></script>${match}`);
finalHtml=finalHtml.replace(/<script src="\.\.\/shared\/book-roster-enhancements\.js\?v=\d+"><\/script>/,`<script src="../shared/book-roster-enhancements.js?v=${runtimeVersions.shared.bookRosterEnhancements}"></script>`).replace(/<script src="\.\.\/extensions\/book-roster-enhancement-providers\.js\?v=\d+"><\/script>/,`<script src="../extensions/book-roster-enhancement-providers.js?v=${runtimeVersions.shared.rosterEffectProviders}"></script>`);
finalHtml=finalHtml.replace(/<script src="\.\.\/shared\/army-book-app\.js\?v=\d+"><\/script>/,match=>`<script src="../shared/offline-status.js?v=${runtimeVersions.shared.offlineStatus}" data-service-worker="../../service-worker.js"></script>${match}`);
if(config.rosterSupport)finalHtml=finalHtml.replace('<script src="./scripts/app.js',`<script src="./scripts/roster-filter.js?v=${config.assetVersions?.rosterFilter||1}"></script><script src="./scripts/app.js`);
const targetBuild=createArmyBookTargetBuild(finalHtml,{runtimeVersions});
finalHtml=targetBuild.readerHtml;
const dataJs=`window.DG_TERMS=${JSON.stringify(Object.fromEntries([...terms].map(([id,item])=>[id,{id,title:item.title,summary:item.summary,full:item.full,glossary:item.glossary,...(item.rule?{rule:item.rule}:{}),...(item.units.length?{units:item.units,datasheet:item.units[0],statline:item.units[0].replace(/^unit-/,'')+'-profile'}:{})}])),null,2)};\n`;
const rosterDataJs=serializeRosterCatalog(rosterCatalog,rosterEnhancements);
const appJs=`try{window.WHArmyBook.install(${JSON.stringify({bookId:config.id,readerPath:'./reader.html'})});}catch(error){document.documentElement.dataset.bookError=String(error&&error.stack||error);console.error(error);}\n`;
const bookCss=`.app-brand::before{content:"${esc(bookMark)}"}.toc-heading::before{content:"FACTION REGISTER // ${esc(bookMark)}"}.faction-hero{overflow:hidden;background:radial-gradient(circle at 78% 28%,color-mix(in srgb,var(--faction-primary-bright,var(--green)) 22%,transparent),transparent 26rem),radial-gradient(ellipse at 64% 78%,color-mix(in srgb,var(--faction-secondary,var(--pink)) 15%,transparent),transparent 31rem),linear-gradient(115deg,var(--underhive),var(--panel-2))}.faction-hero::after{content:"${esc(bookMark)}"}.faction-hero .hero-mark{display:grid;place-items:center;min-width:15rem;aspect-ratio:1;border:1px solid var(--line);border-radius:50%;background:repeating-radial-gradient(circle,transparent 0 18px,var(--soft-line) 19px 20px),radial-gradient(circle,var(--panel-2),transparent 68%);color:var(--green);font:800 clamp(1.1rem,2vw,1.8rem)/1 ui-monospace,monospace;letter-spacing:.16em;text-align:center}.faction-hero .hero-cover{display:block;aspect-ratio:4/5;border-radius:0;overflow:hidden;background:#090b0a}.hero-cover img{display:block;width:100%;height:100%;object-fit:cover}.source-warning{border-left:3px solid var(--bronze-bright)}.subheading{margin:2rem 0 1rem;color:var(--bronze-bright);text-transform:uppercase;letter-spacing:.12em}.unit-status{max-width:20rem;text-align:right}.unit-source-state{display:flex;flex-wrap:wrap;gap:6px 16px;padding:0 24px 18px;color:var(--muted);font:700 10px/1.5 var(--ds-data,ui-monospace,monospace);letter-spacing:.06em;text-transform:uppercase}.unit-source-state span+span{border-left:1px solid var(--line);padding-left:16px}.wargear-option{white-space:pre-line;overflow-wrap:anywhere}.wargear-verification{margin:.25rem 0 1rem;padding:.7rem .85rem;border-left:3px solid var(--bronze-bright);background:color-mix(in srgb,var(--bronze-bright) 7%,transparent);color:var(--muted)}.related-rules-layer{z-index:140}.related-rules-open .popup-layer{z-index:160}@media(max-width:800px){.faction-hero .hero-mark{display:none}.faction-hero .hero-cover{display:block;width:100%;min-width:0;aspect-ratio:16/9}.unit-status{max-width:none;text-align:left}.unit-source-state{padding-inline:20px}.unit-source-state span{width:100%}.unit-source-state span+span{border-left:0;padding-left:0}}\n`;
const coverCss=config.coverImage?`.faction-hero-cover{background:linear-gradient(90deg,rgba(12,15,12,.98) 0%,rgba(12,15,12,.91) 43%,rgba(12,15,12,.42) 70%,rgba(12,15,12,.28) 100%),linear-gradient(0deg,rgba(13,15,13,.92),transparent 38%),url("../${esc(config.coverImage)}") center 23% / cover no-repeat}\n`:'';
const heroCoverBase='.faction-hero .hero-cover{display:block;aspect-ratio:4/5;border-radius:0;overflow:hidden;background:#090b0a}.hero-cover img{display:block;width:100%;height:100%;object-fit:cover}';
const heroCoverWide='.faction-hero .hero-cover{display:block;width:100%;min-width:0;aspect-ratio:16/9;border-radius:0;overflow:hidden;background:#090b0a}.hero-cover img{display:block;width:100%;height:100%;object-fit:cover}';
const heroCoverMobile='.faction-hero .hero-cover{display:block;width:100%;min-width:0;aspect-ratio:16/9}';
let normalizedBookCss=(bookCss+coverCss).replace('.unit-status{','.unit-status{white-space:pre-line;');
normalizedBookCss=config.coverImage?normalizedBookCss.replace(heroCoverBase,heroCoverWide):normalizedBookCss.replace(heroCoverBase,'').replace(heroCoverMobile,'');
const generatedBookCss=config.dedicatedMobile?(config.coverImage?(bookCss+coverCss).replace(heroCoverBase,heroCoverWide):bookCss.replace(heroCoverBase,'').replace(heroCoverMobile,'')):normalizedBookCss;
const entryArtwork=config.entryCoverImage?'<picture class="entry-art"><source type="image/webp" srcset="./'+esc(config.entryCoverImage)+' 480w, ./'+esc(config.coverImage||config.entryCoverImage)+' 800w" sizes="240px"><img src="./'+esc(config.entryCoverImage)+'" width="480" height="600" alt="'+esc(config.title)+' cover"></picture>':'<div class="entry-mark">'+esc(bookMark)+'</div>';
const indexHtml='<!doctype html><html lang="en" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#0a0b0d"><title>'+esc(config.title)+' Rules</title><link rel="manifest" href="../../manifest.webmanifest"><link rel="stylesheet" href="../shared/styles/tokens.css?v=11"><link rel="stylesheet" href="./styles/tokens.css?v='+(config.assetVersions?.tokens||(config.dedicatedMobile?'3':'2'))+'"><link rel="stylesheet" href="../shared/styles/entry.css?v=2">'+(config.entryCoverImage?'<style>.entry-art{display:block;width:min(240px,60vw);aspect-ratio:4/5;overflow:hidden;border:1px solid var(--bronze);background:var(--panel-2)}.entry-art img{display:block;width:100%;height:100%;object-fit:cover}</style>':'')+'<script src="../shared/controllers/view-router.js?v=2"><\/script></head><body><main class="entry-card">'+entryArtwork+'<p>'+esc(config.title)+' rules</p>'+entryReview+'<h1>Opening the reader&hellip;</h1><div class="entry-actions"><a href="./reader.html?view=full">Desktop / iPad view</a><a href="./mobile/index.html?view=mobile">Phone view</a>'+(config.reviewEntry?'<a href="../../index.html">Return to Library</a>':'')+'</div><noscript>Automatic selection needs JavaScript. Choose a reader above.</noscript></main></body></html>\n';
const normalizedIndexHtml=indexHtml.replace('../shared/controllers/view-router.js?v=2',`../shared/controllers/view-router.js?v=${runtimeVersions.shared.viewRouter}`).replace('./mobile/index.html?view=mobile','./reader.html?view=mobile');
const canonicalReaderIndexHtml='<!doctype html><html lang="en" data-theme="dark" data-canonical-reader="./reader.html" data-canonical-target="start"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#0a0b0d"><title>'+esc(config.title)+' Rules</title><link rel="manifest" href="../../manifest.webmanifest"></head><body><noscript><a href="./reader.html#start">Open the canonical '+esc(config.title)+' reader</a></noscript><script src="../shared/mobile-route-redirect.js?v='+runtimeVersions.shared.mobileRouteRedirect+'"><\/script></body></html>\n';
if(config.entryRoute&&!['canonical-reader-redirect'].includes(config.entryRoute))throw new Error('Unsupported entryRoute: '+config.entryRoute);
const entryIndexHtml=config.entryRoute==='canonical-reader-redirect'?canonicalReaderIndexHtml:normalizedIndexHtml;
const mobileIndex='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(config.title)+' Phone View</title></head><body><script>const u=new URL("../reader.html",location.href);u.search=location.search;u.searchParams.set("view","mobile");u.hash=location.hash;location.replace(u.href)<\/script><a href="../reader.html?view=mobile">Open phone view</a></body></html>\n';
const outputs=new Map([
  ['reader.html',finalHtml],['index.html',entryIndexHtml],['scripts/data.js',dataJs],['scripts/target-data.js',targetBuild.targetDataJs],...(config.dedicatedMobile?[]:[['styles/book.css',generatedBookCss]]),...(config.rosterSupport?[['scripts/roster-data.js',rosterDataJs]]:[]),...(config.dedicatedMobile||config.customApp?[]:[['scripts/app.js',appJs]]),...(config.dedicatedMobile?(config.mobileRelatedRulesSource===false?[]:[['mobile/related-rules.source.inc',relatedInc+'\n']]):config.generatedMobile?(config.mobileRelatedRulesSource===true?[['mobile/related-rules.inc',relatedInc+'\n']]:[]):[['mobile/index.html',mobileIndex],['mobile/related-rules.inc',relatedInc+'\n']])
]);
const errors=[];
if(detachments.length!==config.expected.matchedDetachments)errors.push(`expected ${config.expected.matchedDetachments} detachments, got ${detachments.length}`);
if(pack.detachments.filter(item=>item.sourceLayer!=='codex-secondary-consensus').length!==config.expected.factionPackDetachments)errors.push('Faction Pack detachment count mismatch');
if((codex.legends||[]).length!==config.expected.legendsDatasheets)errors.push('Legends count mismatch');
if(new Set(units.map(unit=>unit.id)).size!==units.length)errors.push('duplicate unit IDs');
if([...outputs.values()].some(value=>/\uFFFD|вЂ|вњ|в†|В·/.test(value)))errors.push('mojibake in generated output');
if(errors.length)throw new Error(errors.join('\n'));
return finishCanonicalBuild(context,outputs,{normalizeLineEndings:true,summary:`${check?'Checked':'Built'} ${config.title}: ${units.length} datasheets, ${detachments.length} detachments, ${terms.size} local terms`});
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await buildCanonicalBook(createCanonicalBuildContext());
