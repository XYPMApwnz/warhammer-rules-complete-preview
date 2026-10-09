import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {recordText} from './record-content.mjs';
import {applyCoreCurrentOfficial,loadCoreCurrentOfficial,loadCoreSourceRegistry} from './core-current-official.mjs';
import {createWahaErrataRecords,createWahaFaqRecords,createWahaUniversalUpdateRecords,indexWahaCoreCorpus,loadWahaCoreCorpus,loadWahaKnownSourceDefects,sourceMappingSkeleton} from './waha-core-source.mjs';
import {applySourceBoundEdits,normalizeFaqOwnership,separateEmbeddedFaqPanels,separateAppliedErrataPanels,applySourceConflicts,validateSourceConflicts,validateFaqOwnership} from '../../shared/canonical-content-v2/effective-content.mjs';

const contentRoot=path.dirname(fileURLToPath(import.meta.url));
const readJson=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const loadWindow=file=>{const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file});return sandbox.window;};
const slug=value=>String(value).toLowerCase().replace(/[‘’']/g,'').replace(/\[[^\]]+\]/g,match=>match.slice(1,-1)).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;};
const clone=value=>structuredClone(value);

export const EFFECTIVE_CORE_SCHEMA='wh40k-effective-core-catalog/v1';
export const CORE_RECORD_TYPES=Object.freeze(['MAIN_RULE','ERRATA','FAQ_CLARIFICATION','UNIVERSAL_RULE_UPDATE','CORE_CONCEPT']);
export const CORE_RECORD_STATES=Object.freeze(['FULL_CONTENT','IDENTITY_ONLY','SOURCE_CONFLICT']);

function baseProvenance(sourceRegistry){
  const source=sourceRegistry.sources.find(item=>item.sourceId==='waha-core-corpus-2026-09-25');
  if(!source)throw new Error('Missing accepted Core base source registration');
  return {sourceId:source.sourceId,sourceClass:source.sourceClass,sourceArtifact:source.urlOrLocalArtifact,sourceDate:source.date,sourceScope:source.scope,authorityLevel:source.authorityLevel};
}

function pdfProvenance(coreSource,sourceRegistry){
  const source=sourceRegistry.sources.find(item=>item.sourceId==='gw-core-launch-faq-2026-06-01');
  if(!source)throw new Error('Missing accepted Core FAQ source registration');
  return {sourceId:source.sourceId,sourceClass:source.sourceClass,sourceArtifact:source.urlOrLocalArtifact,sourceDate:source.date,sourceScope:source.scope,authorityLevel:source.authorityLevel,sourceLocator:'Rules Appendix; page 88',artifactSha256:coreSource.meta.sha256};
}

function overrideProvenance(update,sourceRegistry){
  const source=sourceRegistry.sources.find(item=>item.sourceId===update.sourceId);
  if(!source)throw new Error(`Missing Core source registration: ${update.sourceId}`);
  return {sourceId:update.sourceId,sourceClass:update.sourceClass,sourceArtifact:update.sourceArtifact,sourceDate:update.sourceDate,sourceScope:source.scope,authorityLevel:source.authorityLevel,sourceLocator:update.sourceLocator,confidence:update.confidence,...(update.officialCorroboration?{officialCorroboration:update.officialCorroboration}:{}),...(update.additionalOfficialCorroboration?{additionalOfficialCorroboration:update.additionalOfficialCorroboration}:{})};
}

export function validateCoreIdentityRegistry(identityRegistry,baseRecords){
  if(identityRegistry.schema!=='wh40k-core-identity-registry/v1')throw new Error('Unknown Core identity registry schema');
  const codes=new Set(baseRecords.map(record=>record.code));
  const identityCodes=new Set(Object.keys(identityRegistry.rules||{}));
  if(codes.size!==baseRecords.length)throw new Error('Duplicate base Core rule code');
  if(codes.size!==identityCodes.size||[...codes].some(code=>!identityCodes.has(code)))throw new Error('Core identity registry does not exactly cover accepted base rule codes');
  const ids=[];
  for(const [code,id] of Object.entries(identityRegistry.rules)){
    if(!/^\d{2}\.\d{2}(?:\.\d{2})?$/.test(code)||!id)throw new Error(`Invalid Core rule identity: ${code}`);
    ids.push(id);
  }
  for(const [key,concept] of Object.entries(identityRegistry.concepts||{})){
    if(!concept.id||(concept.ownerCode&&!codes.has(concept.ownerCode)))throw new Error(`Invalid Core concept identity: ${key}`);
    if(!concept.ownerCode)ids.push(concept.id);
  }
  for(const [key,concept] of Object.entries(identityRegistry.derivedConcepts||{})){
    if(!concept.id||!concept.ownerCode||!codes.has(concept.ownerCode)||!concept.title)throw new Error(`Invalid derived Core concept identity: ${key}`);
    ids.push(concept.id);
  }
  for(const [code,pending] of Object.entries(identityRegistry.pending||{})){
    if(codes.has(code)||!pending.id||!pending.title||pending.state!=='IDENTITY_ONLY')throw new Error(`Invalid pending Core identity: ${code}`);
    ids.push(pending.id);
  }
  if(new Set(ids).size!==ids.length)throw new Error('Duplicate Core factual identity');
  return identityRegistry;
}

export function validateEffectiveCoreCatalog(catalog){
  if(catalog.schema!==EFFECTIVE_CORE_SCHEMA)throw new Error('Unknown effective Core catalog schema');
  const byId=new Map();
  for(const record of catalog.records){
    if(!record.id||byId.has(record.id)||!CORE_RECORD_TYPES.includes(record.recordType)||!CORE_RECORD_STATES.includes(record.state))throw new Error(`Invalid or duplicate effective Core record: ${record.id}`);
    if(record.state==='IDENTITY_ONLY'&&record.semanticContent!==null)throw new Error(`Identity-only Core record contains unaccepted semantics: ${record.id}`);
    if(record.state==='FULL_CONTENT'&&record.semanticContent===null&&record.recordType!=='ERRATA')throw new Error(`Full Core record has no semantics: ${record.id}`);
    byId.set(record.id,record);
  }
  const codes=new Set();
  for(const record of catalog.mainRules){
    if(!record.code||codes.has(record.code)||byId.get(record.id)!==record)throw new Error(`Invalid effective Core main rule: ${record.code}`);
    codes.add(record.code);
  }
  for(const record of catalog.records){
    for(const id of Object.values(record.relationships||{}).flat().filter(Boolean))if(!byId.has(id))throw new Error(`Unresolved Core relationship ${record.id} -> ${id}`);
  }
  if(!catalog.contentBindings||!catalog.acceptedSourceRegistry||!catalog.sourceUnits)throw new Error('Missing effective Core source ownership contract');
  validateSourceConflicts(catalog.mainRules,catalog.contentBindings.sourceConflicts,{sourceUnits:new Map(Object.entries(catalog.sourceUnits))});
  validateFaqOwnership(catalog.faqs,catalog.contentBindings.faqRelationships);
  for(const faq of catalog.faqs){
    const source=catalog.acceptedSourceRegistry.sources.find(item=>item.sourceId===faq.provenance.sourceId);
    if(!source||source.sourceClass!==faq.provenance.sourceClass||source.authorityLevel!==faq.provenance.authorityLevel||source.date!==faq.provenance.sourceDate)throw new Error(`Invalid canonical FAQ provenance: ${faq.id}`);
  }
  return catalog;
}

export function createEffectiveCoreCatalog({root=contentRoot,base,coreSource,coreData,currentOfficial,sourceRegistry,identityRegistry,contentBindings}={}){
  const acceptedBase=clone(base||readJson(path.join(root,'core-rules.digital-11e.json')));
  const acceptedSource=clone(coreSource||loadWindow(path.join(root,'core-rules.source.en.js')).CORE_PDF_SOURCE);
  const acceptedData=clone(coreData||loadWindow(path.join(root,'core-rules.en.js')).CORE_RULES);
  const registry=clone(sourceRegistry||loadCoreSourceRegistry(root));
  const current=clone(currentOfficial||loadCoreCurrentOfficial(root));
  const identities=clone(identityRegistry||readJson(path.join(root,'core-identities.v1.json')));
  const wahaCorpus=loadWahaCoreCorpus(root);
  const sourceDefectLedger=loadWahaKnownSourceDefects(root,wahaCorpus);
  const wahaIndex=indexWahaCoreCorpus(wahaCorpus);
  const bindings=clone(contentBindings||readJson(path.join(root,'core-effective-bindings.v1.json')));
  if(bindings.schema!=='canonical-content-bindings/v1'||bindings.corpusFingerprint!==wahaCorpus.fingerprint)throw new Error('Unbound effective Core normalization declarations');
  const sourceMappings=sourceMappingSkeleton(wahaCorpus,identities);
  validateCoreIdentityRegistry(identities,acceptedBase.records);
  const effective=applyCoreCurrentOfficial(acceptedBase,current,registry);
  const baseOwner=baseProvenance(registry);
  const sections=[acceptedData.introduction,...acceptedData.groups.flatMap(group=>group.sections)];
  const sectionByNumber=new Map(sections.filter(section=>section.number).map(section=>[section.number.padStart(2,'0'),section.id]));
  const sourceNumberedByCode=new Map(wahaIndex.effectiveNumbered.map(item=>[item.code,item]));
  const sourceOccurrence=(code,targetCode)=>{
    const effectiveSource=sourceNumberedByCode.get(code);
    if(!effectiveSource)return null;
    const candidates=effectiveSource.sourceUnitIds.flatMap(id=>{
      const unit=wahaIndex.unitById.get(id);return (unit?.occurrences||[]).map(occurrence=>({unit,occurrence}));
    });
    if(targetCode==='24.34')return candidates.find(item=>/support/i.test(item.occurrence.title))||null;
    if(targetCode==='24.23')return candidates.find(item=>/lethal hits/i.test(item.occurrence.title))||null;
    return candidates.find(item=>item.unit.page==='appendix')||candidates[0]||null;
  };
  let mainRules=effective.records.map(sourceRecord=>{
    const record=clone(sourceRecord),id=identities.rules[record.code];
    const parts=record.code.split('.'),parentCode=parts.length===3?parts.slice(0,2).join('.'):null;
    const section=sectionByNumber.get(record.code.slice(0,2));
    const sourceCodes=record.code==='24.34'?['24.22','24.23']:[record.code],sourceUnits=sourceCodes.flatMap(code=>sourceNumberedByCode.get(code)?.sourceUnitIds||[]),selected=sourceOccurrence(record.code==='24.34'?'24.23':record.code,record.code);
    const sourceAdjudications=sourceDefectLedger.defects.filter(defect=>defect.source.code===record.code).map(defect=>({id:defect.id,kind:defect.kind,status:defect.status,disposition:clone(defect.disposition)}));
    return {...record,id,recordType:'MAIN_RULE',semanticContent:recordText(record),provenance:{base:clone(baseOwner),...(record.currentOfficialOverride?{effectiveOverride:clone(record.currentOfficialOverride)}:{}),...(sourceAdjudications.length?{sourceAdjudications}:{})},relationships:{...(parentCode?{parentRuleId:identities.rules[parentCode]}:{}),errataIds:[]},state:'FULL_CONTENT',sourceUnitIds:[...new Set(sourceUnits)],sourceContentHashes:sourceUnits.map(sourceId=>wahaIndex.unitById.get(sourceId)?.contentHash).filter(Boolean),...(selected?{sourceStructure:clone(selected.occurrence.content)}:{}),...(section?{fullRulePath:`books/core-rules/reader/${section}.html#rule-${record.code.replaceAll('.','-')}`}:{})};
  });
  let mainByCode=new Map(mainRules.map(record=>[record.code,record]));
  const wahaErrata=createWahaErrataRecords(wahaCorpus,identities);
  const wahaErrataIds=new Set(wahaErrata.map(record=>record.id));
  const strongerGwOnlyErrata=current.ruleOverrides.filter(update=>!wahaErrataIds.has(update.id)).map(update=>{
    const owner=mainByCode.get(update.code);
    return {id:update.id,code:update.code,recordType:'ERRATA',title:`Update to ${owner.title}`,semanticContent:update.currentLine||null,operation:update.operation,parameters:{previousLine:update.previousLine||null,currentLine:update.currentLine||null,canonicalTitle:update.canonicalTitle||null,aliases:clone(update.aliases||[])},provenance:overrideProvenance(update,registry),relationships:{targetRuleId:owner.id},state:'FULL_CONTENT'};
  });
  const errata=[...wahaErrata,...strongerGwOnlyErrata];
  for(const owner of mainRules)owner.relationships.errataIds=errata.filter(record=>record.code===owner.code).map(record=>record.id);
  const faqOwner=pdfProvenance(acceptedSource,registry);
  const wahaFaqs=createWahaFaqRecords(wahaCorpus,identities);
  const officialFaqs=(acceptedSource.faqs||[]).map(faq=>({id:faq.id,recordType:'FAQ_CLARIFICATION',title:faq.question,semanticContent:faq.answer,provenance:{...clone(faqOwner),sourceLocator:`Rules Appendix; page ${faq.page}`},relationships:{primaryRuleId:identities.rules[faq.primaryRule],relatedRuleIds:faq.relatedRules.map(code=>identities.rules[code])},state:'FULL_CONTENT',question:faq.question,answer:faq.answer,page:faq.page,primaryRule:faq.primaryRule,relatedRules:clone(faq.relatedRules)}));
  const faqs=normalizeFaqOwnership([...wahaFaqs,...officialFaqs],bindings.faqRelationships);
  mainRules=applySourceBoundEdits(mainRules,bindings.effectiveEdits,{sourceRecords:new Map(errata.map(record=>[record.id,record])),sourceUnits:wahaIndex.unitById});
  mainRules=separateAppliedErrataPanels(separateEmbeddedFaqPanels(mainRules,faqs),errata);
  mainRules=applySourceConflicts(mainRules,bindings.sourceConflicts,{sourceUnits:wahaIndex.unitById});
  mainByCode=new Map(mainRules.map(record=>[record.code,record]));
  const mainById=new Map(mainRules.map(record=>[record.id,record]));
  for(const faq of faqs){
    const primary=mainById.get(faq.relationships.primaryRuleId);
    if(primary)faq.primaryRule=primary.code;else delete faq.primaryRule;
    faq.relatedRules=(faq.relationships.relatedRuleIds||[]).map(id=>mainById.get(id)?.code).filter(Boolean);
    faq.fullRulePath=`books/core-rules/reader/index.html#${faq.id}`;
    for(const id of [faq.relationships.primaryRuleId,...(faq.relationships.relatedRuleIds||[])].filter(Boolean)){
      const rule=mainById.get(id);
      if(!rule)throw new Error(`Unknown FAQ rule binding: ${faq.id} -> ${id}`);
      rule.relationships.faqIds=[...new Set([...(rule.relationships.faqIds||[]),faq.id])];
    }
  }
  for(const record of mainRules)if(record.state!=='SOURCE_CONFLICT')record.semanticContent=recordText(record);
  const universalUpdates=createWahaUniversalUpdateRecords(wahaCorpus,identities,current,update=>overrideProvenance(update,registry));
  const identityOnly=[];
  const aliases={};
  const concepts=[];
  for(const [localId,entry] of Object.entries(acceptedData.terms||{})){
    const identity=identities.concepts[localId];
    if(!identity)throw new Error(`Missing explicit Core concept identity: ${localId}`);
    aliases[localId]=identity.id;
    if(identity.ownerCode)continue;
    concepts.push({id:identity.id,recordType:'CORE_CONCEPT',title:entry.title,semanticContent:entry.summary,provenance:{sourceId:'core-reader-curated-concepts',sourceClass:'ACCEPTED_CORE_PRESENTATION',sourceArtifact:'books/core-rules/content/core-rules.en.js',sourceDate:acceptedSource.meta?.file||'11E',sourceScope:'GLOBAL_CORE',derivedFromSourceUnitIds:identity.ownerCode?sourceNumberedByCode.get(identity.ownerCode)?.sourceUnitIds||[]:[]},relationships:{},state:'FULL_CONTENT'});
  }
  for(const concept of Object.values(identities.derivedConcepts||{})){
    const owner=mainByCode.get(concept.ownerCode);
    concepts.push({id:concept.id,code:concept.ownerCode,recordType:'CORE_CONCEPT',title:concept.title,semanticContent:owner.semanticContent,provenance:clone(owner.provenance),relationships:{sourceRuleId:owner.id},state:'FULL_CONTENT'});
  }
  for(const record of mainRules)for(const alias of record.compatibilityAliases||[]){const key=slug(alias);if(key&&key!==record.id)aliases[key]=record.id;}
  const records=[...mainRules,...errata,...faqs,...universalUpdates,...identityOnly,...concepts];
  const byId=new Map(records.map(record=>[record.id,record])),byCode=new Map([...mainRules,...identityOnly].map(record=>[record.code,record]));
  const resolveId=value=>byId.has(value)?value:aliases[value]||null;
  const catalog={schema:EFFECTIVE_CORE_SCHEMA,asOf:'2026-09-25',records,mainRules,errata,faqs,universalUpdates,identityOnly,concepts,aliases,sourceMappings,sourceDefects:clone(sourceDefectLedger.defects),wahaCorpusFingerprint:wahaCorpus.fingerprint,contentBindings:bindings,acceptedSourceRegistry:registry,sourceUnits:Object.fromEntries(wahaIndex.unitById),resolveId,getById:value=>byId.get(resolveId(value))||null,getByCode:code=>byCode.get(code)||null,presentation:{reader:acceptedData,sourceSections:acceptedSource.sections,sourceMeta:acceptedSource.meta,images:effective.images||{},baseMeta:effective.meta},identityRegistry:identities};
  validateEffectiveCoreCatalog(catalog);
  return freeze(catalog);
}
