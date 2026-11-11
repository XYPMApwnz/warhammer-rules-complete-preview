import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

export const WAHA_CORE_FINGERPRINT='2E39280BEB3D0C92F87F4F3DB231CA3BC40192C12575AF998E5D2A2DB684C14A';
export const WAHA_CORE_CAPTURE_DATE='2026-11-11';
export const WAHA_CORE_SOURCE_ID='waha-core-corpus-'+WAHA_CORE_CAPTURE_DATE;
export const WAHA_CORE_SOURCE_DIRECTORY='waha-core-'+WAHA_CORE_CAPTURE_DATE;
const normalize=value=>String(value||'').normalize('NFKC').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-').replace(/\s+/g,' ').trim();
const slug=value=>normalize(value).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const cleanLeading=(text,...prefixes)=>{let value=normalize(text);for(const prefix of prefixes.filter(Boolean)){const p=normalize(prefix);if(value.toLowerCase().startsWith(p.toLowerCase())){value=value.slice(p.length).trim();break;}}return value;};

export function loadWahaCoreCorpus(contentRoot){
  const file=path.join(contentRoot,'..','sources',WAHA_CORE_SOURCE_DIRECTORY,'waha-core-corpus.v1.json');
  const corpus=JSON.parse(fs.readFileSync(file,'utf8'));
  if(corpus.schema!=='waha-11e-core-corpus/v1'||corpus.fingerprint!==WAHA_CORE_FINGERPRINT||corpus.effective?.counts?.total!==368)throw new Error('Unexpected accepted Waha Core corpus');
  return corpus;
}

export function loadWahaCoreSourceIdentities(contentRoot){
  const directory=path.join(contentRoot,'..','sources',WAHA_CORE_SOURCE_DIRECTORY);
  const manifest=JSON.parse(fs.readFileSync(path.join(directory,'waha-core-corpus.manifest.json'),'utf8'));
  const bytes=fs.readFileSync(path.join(directory,'source-identities.v1.json'));
  const actual=createHash('sha256').update(bytes).digest('hex').toUpperCase();
  if(manifest.identityMapFile!=='source-identities.v1.json'||actual!==manifest.identityMapSha256)throw new Error('Changed accepted Core source identity map');
  const map=JSON.parse(bytes);
  if(map.schema!=='waha-core-source-identities/v1')throw new Error('Unknown Core source identity map');
  for(const key of ['faqs','errata','universalRulesUpdates']){
    if(!Array.isArray(map[key])||new Set(map[key].map(row=>row.sourceId)).size!==map[key].length||new Set(map[key].map(row=>row.canonicalId)).size!==map[key].length)throw new Error('Duplicate or missing Core source identities: '+key);
  }
  return map;
}

export function loadAcceptedCoreCandidate(contentRoot,binding){
  if(binding?.file!=='../sources/waha-core-2026-11-11/core-rules.candidate.v1.json'||!binding.sha256)throw new Error('Missing accepted Core candidate binding');
  const bytes=fs.readFileSync(path.resolve(contentRoot,binding.file));
  if(createHash('sha256').update(bytes).digest('hex')!==binding.sha256)throw new Error('Changed accepted Core candidate');
  const candidate=JSON.parse(bytes);
  if(candidate.schema!=='core-rules-candidate/v1'||candidate.corpusFingerprint!==WAHA_CORE_FINGERPRINT||candidate.records.length!==385)throw new Error('Unexpected accepted Core candidate');
  return candidate;
}

export function loadWahaKnownSourceDefects(contentRoot,corpus){
  const file=path.join(contentRoot,'..','sources',WAHA_CORE_SOURCE_DIRECTORY,'known-source-defects.v1.json');
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

// Book-owned occurrence bindings recover independently headed nodes from the
// accepted capture. Displayed codes are citations, not source-node identities.
export function bindWahaSourceNodes(records,bindings,unitById){
  const bound=[];
  const seen=new Set();
  const recordCode=binding=>binding.code||binding.sourceCode;
  for(const binding of bindings){
    const unit=unitById.get(binding.sourceUnitId);
    const matches=unit?.occurrences?.filter(item=>item.stableDomId===binding.anchor)||[];
    const occurrence=matches[0];
    const key=`${binding.sourceUnitId}#${binding.anchor}`;
    if(matches.length!==1||seen.has(key)||(unit.sourceCode||unit.code)!==binding.sourceCode||unit.code!==recordCode(binding)||occurrence.sourceOrder!==binding.sourceOrder||occurrence.content.contentHash!==binding.contentHash)throw new Error(`Invalid source-node binding: ${key}`);
    seen.add(key);
    const {start,end}=binding.textRange;
    if(!Number.isInteger(start)||!Number.isInteger(end)||start<0||end<=start||end>occurrence.content.text.length)throw new Error(`Invalid source-node content range: ${key}`);
    if(binding.acceptedCandidateId){
      const label=occurrence.ownerHeading?.label;
      const references=occurrence.content.references||[];
      if(typeof label!=='string'||!occurrence.content.text.startsWith(label)||start!==label.length||end!==occurrence.content.text.length||JSON.stringify(binding.referenceIndexes)!==JSON.stringify(references.map((_,index)=>index)))throw new Error(`Changed accepted source-node body range: ${key}`);
    }
    const body=occurrence.content.text.slice(start,end);
    const lists=(occurrence.content.lists||[]).filter(list=>list.items.every(item=>body.includes(item)));
    let text=body;
    for(const item of new Set(lists.flatMap(list=>list.items)))text=text.replace(item,`\n• ${item}\n`);
    text=text.replace(/([.!?])(?=[A-Z])/g,'$1\n').replace(/\n{3,}/g,'\n\n').trim();
    const sourceNode={sourceUnitId:unit.id,anchor:binding.anchor,sourceOrder:binding.sourceOrder,contentHash:binding.contentHash};
    const sourceStructure={...structuredClone(occurrence.content),text:body,lists:structuredClone(lists),notes:(occurrence.content.notes||[]).filter(item=>body.includes(item)),examples:(occurrence.content.examples||[]).filter(item=>body.includes(item)),references:binding.referenceIndexes.map(index=>{
      const reference=occurrence.content.references[index];
      if(!reference)throw new Error(`Invalid source-node reference: ${key}`);
      return structuredClone(reference);
    })};
    bound.push({code:unit.code,sourceCode:unit.sourceCode||unit.code,title:occurrence.title,text,kind:'rule',sourceNode,sourceStructure});
  }
  const boundCodes=new Set(bindings.map(recordCode));
  for(const record of records){
    if(boundCodes.has(record.code)&&record.sourceNode?.anchor&&!bindings.some(binding=>recordCode(binding)===record.code&&binding.anchor===record.sourceNode.anchor&&(!record.sourceNode.sourceUnitId||binding.sourceUnitId===record.sourceNode.sourceUnitId)))throw new Error(`Unbound source node: ${record.sourceNode.anchor}`);
  }
  for(const sourceUnitId of new Set(bindings.map(binding=>binding.sourceUnitId))){
    for(const occurrence of unitById.get(sourceUnitId).occurrences){
      if(!bindings.some(binding=>binding.sourceUnitId===sourceUnitId&&binding.anchor===occurrence.stableDomId))throw new Error(`Unbound source node: ${occurrence.stableDomId}`);
    }
  }
  // Source order controls presentation order only; anchor identity selects owners.
  return [...records.filter(record=>!boundCodes.has(record.code)),...bound].sort((a,b)=>a.code.localeCompare(b.code)||(a.sourceNode?.sourceOrder??0)-(b.sourceNode?.sourceOrder??0)||String(a.sourceNode?.anchor||'').localeCompare(String(b.sourceNode?.anchor||'')));
}

function sourceProvenance(unit,sourceId=WAHA_CORE_SOURCE_ID){
  return {sourceId,sourceClass:'ACCEPTED_OPERATIONAL_SECONDARY',sourceArtifact:unit.pageUrl,sourceDate:WAHA_CORE_CAPTURE_DATE,sourceScope:'GLOBAL_CORE',authorityLevel:'OPERATIONAL_CONTENT_BASELINE',sourceLocator:unit.id,sourceUnitId:unit.id,sourceContentHash:unit.contentHash,corpusFingerprint:WAHA_CORE_FINGERPRINT};
}

function faqParts(unit){
  const questions=unit.content.tables.filter(row=>row[0]==='Q:').map(row=>row.slice(1).join(' '));
  const answers=unit.content.tables.filter(row=>row[0]==='A:').map(row=>row.slice(1).join(' '));
  return {question:questions.join(' ').trim()||`FAQ for ${unit.ownerCode}`,answer:answers.join(' ').trim()||cleanLeading(unit.content.text,'Q:')};
}

export function createWahaFaqRecords(corpus,identities,sourceIdentities){
  const mappings=new Map(sourceIdentities.faqs.map(row=>[row.sourceId,row]));
  const units=corpus.pages.flatMap(page=>page.faqs);
  if(units.length!==mappings.size)throw new Error('Incomplete explicit Core FAQ identity map');
  return units.map(unit=>{
    const mapping=mappings.get(unit.id);
    if(!mapping||mapping.ownerCode!==unit.ownerCode)throw new Error('Unbound Core FAQ identity: '+unit.id);
    const {question,answer}=faqParts(unit);
    const id=mapping.canonicalId;
    const relatedRuleIds=(mapping.relatedCodes||[]).map(code=>identities.rules[code]);
    if(!identities.rules[mapping.ownerCode]||relatedRuleIds.some(id=>!id))throw new Error('Unbound Core FAQ owner: '+unit.id);
    return {id,recordType:'FAQ_CLARIFICATION',title:question,semanticContent:answer,provenance:sourceProvenance(unit),relationships:{primaryRuleId:identities.rules[mapping.ownerCode],...(relatedRuleIds.length?{relatedRuleIds}:{})},state:'FULL_CONTENT',question,answer,primaryRule:mapping.ownerCode,relatedRules:structuredClone(mapping.relatedCodes||[]),sourceStructure:structuredClone(unit.content),sourceUnitIds:[unit.id]};
  });
}

export function createWahaErrataRecords(corpus,identities,sourceIdentities){
  const mappings=new Map(sourceIdentities.errata.map(row=>[row.sourceId,row]));
  if(corpus.pages.flatMap(page=>page.errata).length!==mappings.size)throw new Error('Incomplete explicit Core erratum identity map');
  return corpus.pages.flatMap(page=>page.errata).map(unit=>{
    const mapping=mappings.get(unit.id);
    if(!mapping||mapping.ownerCode!==unit.ownerCode)throw new Error('Unbound Core erratum identity: '+unit.id);
    const aliases=unit.id==='waha-core-erratum-003'?['Grenade Stratagem','Grenades Stratagem']:unit.id==='waha-core-erratum-004'?['Tank Shock']:[];
    const operation=aliases.length?'compatibility-alias':'source-erratum';
    const semanticContent=aliases.length?null:cleanLeading(unit.content.text,'Change to:','Add:');
    return {id:mapping.canonicalId,code:unit.ownerCode,recordType:'ERRATA',title:unit.label||`Update to ${unit.ownerCode}`,semanticContent,operation,parameters:{aliases,sourceLabel:unit.label},provenance:sourceProvenance(unit),relationships:{targetRuleId:identities.rules[unit.ownerCode]},state:'FULL_CONTENT',sourceStructure:structuredClone(unit.content),sourceUnitIds:[unit.id]};
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

export function sourceMappingSkeleton(corpus,identities,sourceIdentities){
  const {unitById,effectiveNumbered}=indexWahaCoreCorpus(corpus);
  const mappings=[];
  for(const item of effectiveNumbered){
    const canonicalIds=[];
    if(identities.rules[item.code])canonicalIds.push(identities.rules[item.code]);
    for(const entry of Object.values(identities.sourceNodes||{}))if(entry.code===item.code)canonicalIds.push(entry.id);
    if(!effectiveNumbered.some(record=>record.code==='24.34')&&(item.code==='24.22'||item.code==='24.23'))canonicalIds.push(identities.rules['24.34']);
    mappings.push({sourceEffectiveId:item.id,partition:'NUMBERED_RULE',sourceUnitIds:item.sourceUnitIds,canonicalIds:[...new Set(canonicalIds)],mappingStatus:canonicalIds.length>1?'SOURCE_SPLIT_ACROSS_CANONICAL':'EXACT_ONE_TO_ONE'});
  }
  for(const [key,partition] of [['faqs','FAQ'],['errata','ERRATA']]){
    const explicit=new Map(sourceIdentities[key].map(row=>[row.sourceId,row.canonicalId]));
    const units=corpus.pages.flatMap(page=>page[key]);
    if(units.length!==explicit.size)throw new Error('Incomplete explicit source mapping: '+partition);
    for(const unit of units)mappings.push({sourceEffectiveId:unit.id,partition,sourceUnitIds:[unit.id],canonicalIds:[explicit.get(unit.id)],mappingStatus:'EXACT_ONE_TO_ONE'});
  }
  corpus.pages.flatMap(page=>page.universalRulesUpdates).forEach(unit=>mappings.push({sourceEffectiveId:unit.id,partition:'UNIVERSAL_RULE_UPDATE',sourceUnitIds:[unit.id],canonicalIds:[URU_IDS[unit.id]],mappingStatus:'EXACT_ONE_TO_ONE'}));
  if(mappings.length!==corpus.effective.counts.total||mappings.some(item=>!item.canonicalIds.length||item.canonicalIds.some(id=>!id)))throw new Error('Incomplete Waha Core source mapping');
  return mappings;
}

export {normalize as normalizeWahaText,sourceProvenance};
