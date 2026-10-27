import {execFileSync as runNativeBuild} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import ruleFactsApi from '../rule-facts.js';
import {buildRelationGraphs} from './build-relation-graph.mjs';
import {canonicalDetachmentRuleSet,canonicalRosterModelsFor,createRosterCatalog,persistCanonicalWeaponProfileIdentities} from './build-roster-catalog.mjs';
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
import {projectAcceptedInvulnerableSaves} from './accepted-invulnerable-projection.mjs';

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
const alliedMusterUnitIds=[...new Set((effectContractSet.rosterLegality?.alliedMusters||[]).flatMap(record=>record.unitIds||[]))];
const alliedMfmUnits=alliedMusterUnitIds.length?mfmProjection.alliedUnitsForArmyBook(config.id,alliedMusterUnitIds):[];
const wargearLegalitySet=config.sources.wargearOptionContracts?readJson(config.sources.wargearOptionContracts):{schema:'wh40k-wargear-option-contracts/v1',bookId:config.id,units:[]};
if(wargearLegalitySet?.schema!=='wh40k-wargear-option-contracts/v1'||wargearLegalitySet.bookId!==config.id||!Array.isArray(wargearLegalitySet.units))throw new Error(`${config.id}: wargear-option contract is invalid`);
const wargearLegalityByUnit=new Map();for(const record of wargearLegalitySet.units){if(!record?.unitId||wargearLegalityByUnit.has(record.unitId))throw new Error(`${config.id}: duplicate or missing wargear-option unit identity ${record?.unitId||'<missing>'}`);wargearLegalityByUnit.set(record.unitId,record);}
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
const sourceUnits=config.currentDatasheetLayers?config.currentDatasheetLayers.flatMap(layer=>codex[layer]||[]):config.currentDatasheetsOnly?codex.datasheets||[]:unitInventory(codex);
const ownUnits=config.sources.wahaCurrentCorpus?projectAcceptedInvulnerableSaves(sourceUnits,readJson(config.sources.wahaCurrentCorpus)):sourceUnits;
const pointsById=indexCanonicalById(points.units,{label:`${config.id} points unit`});
const boundWargear=bindRowsToCanonicalIds(codexWargear?.units||[],ownUnits,{label:`${config.id} wargear unit`,rowId:sourceUnitId});
const wargearByUnitId=new Map(boundWargear.map(item=>[item.canonicalId,item]));
const ownUnitIds=new Set(ownUnits.map(unit=>unit.id));for(const unitId of wargearLegalityByUnit.keys())if(!ownUnitIds.has(unitId))throw new Error(`${config.id}: wargear-option contract references unknown canonical unit ${unitId}`);
const mergedUnits=new Map();
if(dependencyScope.render!==false)for(const unit of dependencyUnits)mergedUnits.set(unit.id,unit);
for(const unit of ownUnits){
  const point=pointsById.get(unit.id),exact=wargearByUnitId.get(unit.id);
  const rosterWargearLegality=wargearLegalityByUnit.get(unit.id);
  mergedUnits.set(unit.id,{...unit,...(point?{points:point.points,paidWargear:point.paidWargear,pointsSource:point.pointsSource}:{}),...(exact?{wargear:exact.wargear,compositionText:exact.composition,wargearSource:{label:codexWargear.source?.label||'Current 11e reference',url:exact.url}}:{}),...(rosterWargearLegality?{rosterWargearLegality:structuredClone(rosterWargearLegality)}:{})});
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
const detachmentRulePresentationById=new Map(detachments.flatMap(det=>detachmentRuleEntries(det).map(({rule})=>rule.id&&rule.presentationTermId?[rule.id,rule.presentationTermId]:null)).filter(Boolean));
const canonicalDetachmentRules=canonicalDetachmentRuleSet(detachments,{...config.rosterCatalog,bookId:config.id}).map(rule=>detachmentRulePresentationById.has(rule.id)?{...rule,presentationTermId:detachmentRulePresentationById.get(rule.id)}:rule);
let rosterCatalog=createRosterCatalog({config,units,alliedUnits:alliedMfmUnits,detachments,relationGraphs,legacyEnhancements:rosterEnhancements,enhancementContracts:canonicalRosterEnhancements,keywordGrants:relatedRules?.keywordGrants||[],effectContracts});
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
const multiForceBooks=new Set(['death-guard','adeptus-mechanicus','tyranids','tau-empire','emperors-children','chaos-space-marines']);
const projectDetachment=det=>{
  const publication=pointsPublicationByDetachment.get(det),common={id:det.id,title:det.title,sourceBookId:det.dependencyBook||config.id,detachmentPoints:Number(String(det.detachmentPoints??det.dp??0).match(/\d+/)?.[0]||0),forceDisposition:publication?.forceDisposition||det.forceDisposition||det.disposition||'',mfmRecordId:publication?.mfmRecordId||det.mfmRecordId||null,mfmQualifiers:publication?.mfmQualifiers||det.mfmQualifiers||[]};
  if(!multiForceBooks.has(config.id))return{id:det.id,title:det.title,sourceBookId:det.dependencyBook||config.id,detachmentPoints:Number(String(det.detachmentPoints??det.dp??0).match(/\d+/)?.[0]||0),forceDisposition:det.forceDisposition||det.disposition||'',mfmRecordId:det.mfmRecordId||null,mfmForceDispositionId:det.mfmForceDispositionId||null,missionForceDispositionId:det.missionForceDispositionId||null,forceDispositionId:det.forceDispositionId||det.missionForceDispositionId||null,mfmQualifiers:det.mfmQualifiers||[],publicationRecord:publication||{title:det.title,detachmentPoints:det.detachmentPoints,forceDisposition:det.forceDisposition}};
  return{...common,forceDispositions:publication?.forceDispositions||det.forceDispositions||[det.forceDisposition||det.disposition].filter(Boolean),mfmForceDispositionIds:publication?.mfmForceDispositionIds||det.mfmForceDispositionIds||[det.mfmForceDispositionId].filter(Boolean),missionForceDispositionIds:publication?.missionForceDispositionIds||det.missionForceDispositionIds||[det.missionForceDispositionId].filter(Boolean),forceDispositionIds:publication?.forceDispositionIds||det.forceDispositionIds||[det.forceDispositionId||det.missionForceDispositionId].filter(Boolean),publicationRecord:publication||{title:det.title,detachmentPoints:det.detachmentPoints,forceDispositions:det.forceDispositions||[det.forceDisposition].filter(Boolean),forceDisposition:det.forceDisposition}};
};
let effectivePointsProjection=createEffectivePointsProjection({
  book:{id:config.id,title:config.title,parentBookId:config.dependencies?.[0]||null},
  dependencies:(config.dependencies||[]).map(id=>({bookId:id,kind:'effective-book-dependency'})),
  units:pointOrderedUnits.map(unit=>{const compatibleChapterKeywords=unit.dependencyBook?[]:config.unitCompatibleChapterKeywords?.[unit.id]||unit.compatibleChapterKeywords||[];return{id:unit.id,title:unit.title,sourceBookId:unit.dependencyBook||config.id,publicationState:unit.status||'Current',points:unit.points||[],paidWargear:unit.paidWargear||[],...(unit.pointsSource?{pointsSource:unit.pointsSource}:{}),...(compatibleChapterKeywords.length?{compatibleChapterKeywords}:{}),ruleProfile:unitRuleProfiles.get(unit.id),publicationRecord:unitPointsPublication(unit)||{id:unit.id,title:unit.title,status:unit.status,sourceLayer:unit.sourceLayer,points:unit.points,paidWargear:unit.paidWargear,pointsSource:unit.pointsSource}};}),
  alliedUnits:alliedMfmUnits,
  detachments:pointOrderedDetachments.map(projectDetachment),
  enhancements:pointEnhancementPublications.map(({publication,sourceBookId,contracts,det,source})=>{const officialIdentity=sourceBookId===config.id?officialEnhancementIdentityByPublication.get(publication.id):null,sourceConfig=sourceBookId===config.id?config:dependencyById.get(sourceBookId)?.config||config,pointAliasKey=Object.entries(sourceConfig.pointEnhancementAliases||{}).find(([,id])=>id===publication.id)?.[0],ownerIdentity=pointAliasKey&&sourceConfig.enhancementOwnerAliases?.[pointAliasKey],sourceIdentity=source?.item?.sourceId||source?.item?.id||dependencyEnhancementIdentityByPublication.get([sourceBookId,det.id,publication.id].join('\0')),contractIdentity=sourceBookId!==config.id?resolveEffectiveEnhancementContractId(publication.id,det.id,contracts):null,identityId=sourceBookId!==config.id?contractIdentity||sourceIdentity||publication.id:publishedEnhancementContracts.has(config.id)&&source?enhancementRuleId(source.item,det):officialIdentity?.id||ownerIdentity||publication.id,identityInput={...publication,id:identityId,detachmentId:det.id},resolvedIdentity=resolveEffectiveEnhancementIdentity(identityInput,rosterCatalog,contracts),compatibilityIdentity=contractIdentity?{...resolvedIdentity,canonicalEnhancementId:contractIdentity}:resolvedIdentity,id=compatibilityIdentity.canonicalEnhancementId||identityId,rawPublication=rawPointEnhancementByBound.get(publication)||publication,canonicalEffectRecordIds=[...new Set([source?.item?.id,source?.item?.ruleId,sourceIdentity].filter(Boolean))],aliases=[...new Set([officialIdentity?.sourceTitle,source?.item?.title,ownerIdentity&&source?.item?.title].filter(Boolean))];return{id,sourceId:publication.sourceId||null,ruleId:id,legacyKey:publication.legacyKey||null,detachmentId:det.id,detachmentTitle:det.title,sourceBookId,title:publication.title,value:Number(publication.value),owner:compatibilityIdentity.owner||publication.owner||null,assignment:compatibilityIdentity.assignment||publication.assignment||null,tags:compatibilityIdentity.tags||publication.tags||[],text:publication.text||'',mfmRecordId:publication.mfmRecordId||null,mfmQualifiers:publication.mfmQualifiers||[],...(publication.profile?{profile:publication.profile}:{}),...(compatibilityIdentity.sourceLimited?{sourceLimited:true}:{}),...(canonicalEffectRecordIds.length?{canonicalEffectRecordIds}:{}),aliases,publicationRecord:officialIdentity?{...rawPublication,id:officialIdentity.id}:rawPublication,compatibilityIdentity};})
});
let effectiveEnhancements=effectivePointsProjection.enhancements.map(item=>{const mapped=canonicalRosterEnhancementByEffectiveId.get(`${item.detachmentId}\0${item.id}`),direct=projectionEnhancementSources.filter(({det,item:source})=>det.id===item.detachmentId&&[source.id,source.ruleId,source.sourceId].filter(Boolean).includes(item.id));if(direct.length>1)throw new Error(`${config.id}: ${item.detachmentId}/${item.id} has duplicate canonical Enhancement text owners`);const source=mapped?.text?mapped:direct[0]?.item||mapped,sourceIds=[source?.id,source?.ruleId,source?.sourceId].filter(Boolean),sourceConfig=item.sourceBookId===config.id?config:dependencyById.get(item.sourceBookId)?.config||config,aliasKey=Object.entries(sourceConfig.pointEnhancementAliases||{}).find(([,id])=>id===item.id)?.[0],effectId=aliasKey&&sourceConfig.enhancementOwnerAliases?.[aliasKey],compatibilityIds=Object.entries(sourceConfig.compatibleRulesEnhancementAliases||{}).filter(([key,id])=>key.startsWith(`${item.detachmentId}|`)&&id===item.id).map(([key])=>key.slice(key.indexOf('|')+1));return{...item,...(glossaryV2CompatibilityTerms&&source?.termId?{termId:source.termId}:{}),...(source?.text?{text:source.text}:{}),...(!item.owner&&source?.owner?{owner:source.owner}:{}),...(!item.assignment&&source?.assignment?{assignment:source.assignment}:{}),...(!(item.tags||[]).length&&source?.tags?.length?{tags:source.tags}:{}),canonicalEffectRecordIds:[...new Set([...(item.canonicalEffectRecordIds||[]),...sourceIds,effectId,...compatibilityIds].filter(Boolean))]};});
const rosterEnhancementProjections=canonicalRosterEnhancements.map(source=>{const sourceIds=new Set([source.id,source.ruleId,source.sourceId,source.legacyKey].filter(Boolean)),matches=effectiveEnhancements.filter(candidate=>candidate.detachmentId===source.detachmentId&&[candidate.id,candidate.ruleId,candidate.sourceId,candidate.legacyKey,...(candidate.canonicalEffectRecordIds||[])].some(id=>sourceIds.has(id)));if(matches.length!==1)throw new Error(`${config.id}: ${source.detachmentId}/${source.id} must resolve to one canonical Enhancement text owner; got ${matches.length}`);const needsQualifier=(effectContractSet.rosterLegality?.enhancementQualifiers||[]).some(record=>record.enhancementId===source.id);return{...source,text:matches[0].text,...(needsQualifier&&!source.owner&&matches[0].owner?{owner:matches[0].owner}:{}),...(needsQualifier&&!source.assignment&&matches[0].assignment?{assignment:matches[0].assignment}:{}),...(needsQualifier?{mfmQualifiers:matches[0].mfmQualifiers||[]}:{})};});
rosterCatalog=createRosterCatalog({config,units,alliedUnits:alliedMfmUnits,detachments,relationGraphs,legacyEnhancements:rosterEnhancements,enhancementContracts:rosterEnhancementProjections,keywordGrants:relatedRules?.keywordGrants||[],effectContracts,rosterLegality:effectContractSet.rosterLegality||null});
const rosterLegalityEnhancementIds=new Set((effectContractSet.rosterLegality?.enhancementQualifiers||[]).map(item=>item.enhancementId)),rosterEnhancementByScope=new Map(rosterCatalog.enhancements.filter(item=>rosterLegalityEnhancementIds.has(item.id)).map(item=>[`${item.detachmentId}\0${item.id}`,item]));
effectiveEnhancements=effectiveEnhancements.map(item=>{const rosterItem=rosterEnhancementByScope.get(`${item.detachmentId}\0${item.id}`);return rosterItem?{...item,owner:rosterItem.owner,assignment:rosterItem.assignment}:item;});
effectivePointsProjection={...effectivePointsProjection,enhancements:effectivePointsProjection.enhancements.map(item=>{const rosterItem=rosterEnhancementByScope.get(`${item.detachmentId}\0${item.id}`);return rosterItem?{...item,owner:rosterItem.owner,assignment:rosterItem.assignment}:item;})};
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

throw new Error('V1 reader output is retired; use v2/app-build.mjs');

}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const context=createCanonicalBuildContext(),native=path.join(context.root,'v2/app-build.mjs');
  if(!fs.existsSync(native))throw new Error(context.config.id+': native V2 publication is not enrolled; canonical source tools remain available');
  runNativeBuild(process.execPath,[native,...(context.check?['--check']:[])],{cwd:context.repo,stdio:'inherit'});
}
