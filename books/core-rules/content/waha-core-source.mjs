import fs from 'node:fs';
import path from 'node:path';

export const WAHA_CORE_FINGERPRINT='7AD0124845D23DB5CAADEE077732F8BDB6ECD9B2D713E6977F7917BBE0B14D5F';
const normalize=value=>String(value||'').normalize('NFKC').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-').replace(/\s+/g,' ').trim();
const slug=value=>normalize(value).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const cleanLeading=(text,...prefixes)=>{let value=normalize(text);for(const prefix of prefixes.filter(Boolean)){const p=normalize(prefix);if(value.toLowerCase().startsWith(p.toLowerCase())){value=value.slice(p.length).trim();break;}}return value;};

export function loadWahaCoreCorpus(contentRoot){
  const file=path.join(contentRoot,'..','sources','waha-core-2026-09-25','waha-core-corpus.v1.json');
  const corpus=JSON.parse(fs.readFileSync(file,'utf8'));
  if(corpus.schema!=='waha-11e-core-corpus/v1'||corpus.fingerprint!==WAHA_CORE_FINGERPRINT||corpus.effective?.counts?.total!==353)throw new Error('Unexpected accepted Waha Core corpus');
  return corpus;
}

export function loadWahaKnownSourceDefects(contentRoot,corpus){
  const file=path.join(contentRoot,'..','sources','waha-core-2026-09-25','known-source-defects.v1.json');
  const ledger=JSON.parse(fs.readFileSync(file,'utf8'));
  if(ledger.schema!=='waha-core-known-source-defects/v1'||ledger.corpusBinding?.corpusFingerprint!==WAHA_CORE_FINGERPRINT)throw new Error('Unexpected Waha Core source-defect ledger');
  const byUnitId=new Map(corpus.pages.flatMap(page=>[...page.numbered,...page.faqs,...page.errata,...page.universalRulesUpdates]).map(unit=>[unit.id,unit]));
  for(const defect of ledger.defects){
    const unit=byUnitId.get(defect.source?.unitId);
    if(!unit||unit.contentHash!==defect.source.unitContentHash)throw new Error(`Stale Waha defect binding: ${defect.id}`);
    const occurrence=(unit.occurrences||[]).find(item=>item.sourceOrder===defect.source.sourceOrder);
    if(!occurrence||occurrence.content.contentHash!==defect.source.occurrenceContentHash)throw new Error(`Stale Waha defect occurrence binding: ${defect.id}`);
  }
  return ledger;
}

export function indexWahaCoreCorpus(corpus){
  const unitById=new Map();
  for(const page of corpus.pages)for(const key of ['numbered','faqs','errata','universalRulesUpdates'])for(const unit of page[key])unitById.set(unit.id,unit);
  const effectiveNumbered=corpus.effective.numbered.map(entry=>({
    id:`waha-effective-numbered-${entry.code.replaceAll('.','-')}`,kind:'NUMBERED_RULE',code:entry.code,
    sourceUnitIds:entry.sources.map(source=>source.unitId),sourceContentHashes:entry.sources.map(source=>source.contentHash)
  }));
  return {unitById,effectiveNumbered};
}

function sourceProvenance(unit,sourceId='waha-core-corpus-2026-09-25'){
  return {sourceId,sourceClass:'ACCEPTED_OPERATIONAL_SECONDARY',sourceArtifact:unit.pageUrl,sourceDate:'2026-09-25',sourceScope:'GLOBAL_CORE',authorityLevel:'OPERATIONAL_CONTENT_BASELINE',sourceLocator:unit.id,sourceUnitId:unit.id,sourceContentHash:unit.contentHash,corpusFingerprint:WAHA_CORE_FINGERPRINT};
}

function faqParts(unit){
  const questions=unit.content.tables.filter(row=>row[0]==='Q:').map(row=>row.slice(1).join(' '));
  const answers=unit.content.tables.filter(row=>row[0]==='A:').map(row=>row.slice(1).join(' '));
  return {question:questions.join(' ').trim()||`FAQ for ${unit.ownerCode}`,answer:answers.join(' ').trim()||cleanLeading(unit.content.text,'Q:')};
}

export function createWahaFaqRecords(corpus,identities){
  return corpus.pages.flatMap(page=>page.faqs).map((unit,index)=>{
    const {question,answer}=faqParts(unit),id=`core-faq-waha-${String(index+1).padStart(3,'0')}`;
    return {id,recordType:'FAQ_CLARIFICATION',title:question,semanticContent:answer,provenance:sourceProvenance(unit),relationships:{primaryRuleId:identities.rules[unit.ownerCode]},state:'FULL_CONTENT',question,answer,primaryRule:unit.ownerCode,relatedRules:[],sourceStructure:structuredClone(unit.content),sourceUnitIds:[unit.id]};
  });
}

const ERRATA_IDS=Object.freeze({
  'waha-core-erratum-001':'core-waha-errata-12-08','waha-core-erratum-002':'core-waha-errata-13-09',
  'waha-core-erratum-003':'core-errata-15-05','waha-core-erratum-004':'core-errata-15-06',
  'waha-core-erratum-005':'core-errata-17-03','waha-core-erratum-006':'core-waha-errata-18-05',
  'waha-appendix-erratum-001':'core-waha-errata-01-02-06'
});
export function createWahaErrataRecords(corpus,identities){
  return corpus.pages.flatMap(page=>page.errata).map(unit=>{
    const aliases=unit.id==='waha-core-erratum-003'?['Grenade Stratagem','Grenades Stratagem']:unit.id==='waha-core-erratum-004'?['Tank Shock']:[];
    const operation=aliases.length?'compatibility-alias':'source-erratum';
    const semanticContent=aliases.length?null:cleanLeading(unit.content.text,'Change to:','Add:');
    return {id:ERRATA_IDS[unit.id],code:unit.ownerCode,recordType:'ERRATA',title:unit.label||`Update to ${unit.ownerCode}`,semanticContent,operation,parameters:{aliases,sourceLabel:unit.label},provenance:sourceProvenance(unit),relationships:{targetRuleId:identities.rules[unit.ownerCode]},state:'FULL_CONTENT',sourceStructure:structuredClone(unit.content),sourceUnitIds:[unit.id]};
  });
}

const URU_IDS=Object.freeze({
  'waha-appendix-uru-01':'uru-2026-07-22-stratagem-cp-cost','waha-appendix-uru-02':'uru-2026-07-22-stratagem-reuse',
  'waha-appendix-uru-03':'uru-2026-07-22-defensive-stratagem-range','waha-appendix-uru-04':'uru-2026-07-22-identical-destroyed-unit',
  'waha-appendix-uru-05':'uru-2026-08-26-disembark-move-types'
});
export function createWahaUniversalUpdateRecords(corpus,identities,currentOfficial,officialProvenance){
  const officialById=new Map(currentOfficial.universalRulesUpdates.map(item=>[item.id,item]));
  return corpus.pages.flatMap(page=>page.universalRulesUpdates).map(unit=>{
    const id=URU_IDS[unit.id],official=officialById.get(id);
    if(!official)throw new Error(`Missing stronger GW provenance for ${unit.id}`);
    const text=official.text;
    return {id,recordType:'UNIVERSAL_RULE_UPDATE',title:official.title,semanticContent:text,provenance:{operational:sourceProvenance(unit),strongerCurrentGw:officialProvenance(official)},relationships:{canonicalReferenceIds:(official.canonicalReferences||[]).map(code=>identities.rules[code])},state:'FULL_CONTENT',text,partition:official.partition,canonicalReferences:structuredClone(official.canonicalReferences||[]),overrides:official.overrides,sourceStructure:structuredClone(unit.content),sourceUnitIds:[unit.id]};
  });
}

export function sourceMappingSkeleton(corpus,identities){
  const {unitById,effectiveNumbered}=indexWahaCoreCorpus(corpus);
  const mappings=[];
  for(const item of effectiveNumbered){
    const canonicalIds=[];
    if(identities.rules[item.code])canonicalIds.push(identities.rules[item.code]);
    if(item.code==='24.22'||item.code==='24.23')canonicalIds.push(identities.rules['24.34']);
    mappings.push({sourceEffectiveId:item.id,partition:'NUMBERED_RULE',sourceUnitIds:item.sourceUnitIds,canonicalIds:[...new Set(canonicalIds)],mappingStatus:canonicalIds.length>1?'SOURCE_SPLIT_ACROSS_CANONICAL':'EXACT_ONE_TO_ONE'});
  }
  corpus.pages.flatMap(page=>page.faqs).forEach((unit,index)=>mappings.push({sourceEffectiveId:unit.id,partition:'FAQ',sourceUnitIds:[unit.id],canonicalIds:[`core-faq-waha-${String(index+1).padStart(3,'0')}`],mappingStatus:'EXACT_ONE_TO_ONE'}));
  corpus.pages.flatMap(page=>page.errata).forEach(unit=>mappings.push({sourceEffectiveId:unit.id,partition:'ERRATA',sourceUnitIds:[unit.id],canonicalIds:[ERRATA_IDS[unit.id]],mappingStatus:'EXACT_ONE_TO_ONE'}));
  corpus.pages.flatMap(page=>page.universalRulesUpdates).forEach(unit=>mappings.push({sourceEffectiveId:unit.id,partition:'UNIVERSAL_RULE_UPDATE',sourceUnitIds:[unit.id],canonicalIds:[URU_IDS[unit.id]],mappingStatus:'EXACT_ONE_TO_ONE'}));
  if(mappings.length!==353||mappings.some(item=>!item.canonicalIds.length))throw new Error('Incomplete Waha Core source mapping');
  return mappings;
}

export {normalize as normalizeWahaText,sourceProvenance};
