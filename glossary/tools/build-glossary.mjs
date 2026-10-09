import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {recordText} from '../../books/core-rules/content/record-content.mjs';
import {createCoreFactProjection,canonicalCoreRuleId,CORE_GLOSSARY_EXCLUDED_CODES} from '../../books/core-rules/content/core-fact-projection.mjs';
import {sourceConflictNotice} from '../../books/shared/canonical-content-v2/effective-content.mjs';
import {writeCacheRevision} from '../../tools/cache-revision.mjs';
import {createCanonicalBuildContext} from '../../books/shared/tools/canonical-build-contract.mjs';
import {buildCanonicalBook} from '../../books/shared/tools/build-army-book.mjs';
import {projectDeathGuardGlossaryFacts} from '../../books/death-guard/tools/canonical-source-adapter.mjs';
import {loadEditorialContract} from './editorial-contract.mjs';
import {projectEffectiveEnhancementSources} from './effective-enhancement-sources.mjs';
import {applyDeterministicRelatedPolicies,buildKeywordIdentity,deriveKeywordCompatibilityAliases,derivePresentation,keywordRelationsFromEligibility,validateGlossaryGraph} from './glossary-policies.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
const glossaryRoot=path.join(root,'glossary');
const readJson=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const writeJson=(file,value)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');};
const slug=value=>String(value).toLowerCase().replace(/[‘’']/g,'').replace(/\[[^\]]+\]/g,m=>m.slice(1,-1)).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const normalTitle=value=>slug(value).replace(/-+/g,'-');
const clean=value=>String(value||'').replace(/\be\.g\./gi,match=>match[0][0]==='E'?'For example':'for example').replace(/\r/g,'').replace(/\n-\n/g,'-').replace(/[ \t]*\n[ \t]*/g,' ').replace(/([A-Za-z])\s+-\s+([A-Za-z])/g,'$1-$2').replace(/\s*▪\s*/g,'\n• ').replace(/[ \t]{2,}/g,' ').trim();
const cleanRuleText=value=>String(value||'')
  .replace(/\be\.g\./gi,match=>match[0][0]==='E'?'For example':'for example')
  .replace(/\r/g,'')
  .split('\n')
  .map(line=>line.replace(/[ \t]{2,}/g,' ').trim())
  .filter(Boolean)
  .join('\n');
const semanticAnomalies=value=>{
  const text=String(value||''),issues=[];
  const known=[
    ['joined keyword and unit',/\b(?:Monsteror|Vehicleunit)\b/i],
    ['split word',/\b(?:warrior s|fight ing|target s|r eactions|unt il)\b/i],
    ['broken numeric modifier',/\b(?:bearer|wearer) of 1\b/i],
    ['page header or footer fragment',/(?:\bCORE ABILITIES\s*\+\+|\+\+[^+\n]{3,}\+\+\s*\d{1,3}\s*$)/i],
    ['mojibake or replacement character',/\uFFFD|\u00C3|\u00C2|\u00E2\u20AC/],
    ['duplicated word',/\b([A-Za-z]{3,})\s+\1\b/]
  ];
  for(const [issue,pattern] of known)if(pattern.test(text))issues.push(issue);
  for(const match of text.matchAll(/\b([A-Z]{2,})\s+([a-z]{2,})\b/g))if(match[1].toLowerCase()===match[2])issues.push('duplicated keyword noun');
  if(!text.trimEnd().endsWith('…'))for(const [open,close] of [['(',')'],['[',']'],['{','}']]){
    if([...text].filter(char=>char===open).length!==[...text].filter(char=>char===close).length)issues.push(`unbalanced ${open}${close}`);
  }
  return issues;
};
const concise=(value,max=280)=>{
  const text=clean(value).replace(/\s+/g,' ').trim();
  if(text.length<=max)return text;
  const slice=text.slice(0,max-1);
  const sentence=Math.max(slice.lastIndexOf('. '),slice.lastIndexOf('; '),slice.lastIndexOf(': '));
  const end=sentence>=120?sentence+1:slice.lastIndexOf(' ');
  return `${slice.slice(0,end>0?end:max-1).trim()}…`;
};
const hash=value=>createHash('sha256').update(value).digest('hex');
function weaponProfile(summary){
  const parts=clean(summary).split(/\s*[·•]\s*/).filter(Boolean);
  if(parts.length<6)return null;
  const profile={},mode=/^(Ranged|Melee)$/i.test(parts[0])?parts.shift():'';
  if(mode&&parts.length&&!/^(?:Range|A|BS|WS|S|AP|D|Abilities?)\s+/i.test(parts[0]))profile.Range=parts.shift();
  // Army Book summaries append one unlabelled abilities field after the stats.
  // Only that producer shape qualifies; arbitrary unmatched body text does not.
  const abilityTail=mode&&parts.length===6&&['A',/^Ranged$/i.test(mode)?'BS':'WS','S','AP','D'].every((key,index)=>parts[index].startsWith(key+' '))
    &&!/^(?:Range|A|BS|WS|S|AP|D|Abilities?)\s+/i.test(parts[5])?parts[5]:'';
  for(const part of parts){
    const match=part.match(/^(Range|A|BS|WS|S|AP|D|Abilities?)\s+(.+)$/i);if(!match)continue;
    profile[match[1].replace(/^Abilities?$/i,'Abilities')]=match[2].trim();
  }
  if(!profile.Range&&mode==='Melee')profile.Range='Melee';
  if(abilityTail)profile.Abilities=abilityTail;
  return profile.Range&&profile.A&&(profile.BS||profile.WS)&&profile.S&&profile.AP&&profile.D?profile:null;
}

const publicBookIds=['death-guard','adeptus-mechanicus','tyranids','tau-empire','emperors-children','chaos-space-marines','space-marines','blood-angels','dark-angels'];
const effectiveBookModels=new Map();
for(const id of publicBookIds){
  const configPath=path.join(root,'books',id,'book.config.json');
  const context=createCanonicalBuildContext({args:[],configPath,repo:root});
  const {effectiveBookModel}=await buildCanonicalBook(context,{projectionOnly:true});
  effectiveBookModels.set(id,effectiveBookModel);
}
const runtimeFromGlossary=glossary=>Object.fromEntries(glossary.map(term=>[term.id,{title:term.title,summary:term.summary,full:term.full,glossary:`glossary-${term.id}`,...(term.sectionId?{rule:term.sectionId}:{}),...(term.fullRulePath?{fullRulePath:term.fullRulePath}:{}),...(term.unitIds?.length?{units:term.unitIds,datasheet:term.unitIds[0],statline:`${term.unitIds[0].replace('unit-','')}-profile`}:{})}]));

const dgSource=readJson(path.join(root,'books','death-guard','content','death-guard-rules.en.json'));
const dgOfficialUpdates=readJson(path.join(root,'books','death-guard','content','official-update-ledger.en.json'));
const dgModel=effectiveBookModels.get('death-guard'),dgProjection=projectDeathGuardGlossaryFacts(dgModel,{label:'Death Guard global glossary projection'}),dgRuntime=dgProjection.runtime;
const dgUnitsById=new Map(dgModel.units.map(unit=>[unit.id,unit]));
const dgEnhancementById=new Map(dgModel.enhancements.flatMap(item=>[item.id,item.sourceId,item.ruleId,...(item.canonicalEffectRecordIds||[])].filter(Boolean).map(id=>[id,item])));
const amModel=effectiveBookModels.get('adeptus-mechanicus'),amRuntime=runtimeFromGlossary(amModel.glossary);
const amBookRoot=path.join(root,'books','adeptus-mechanicus'),amBookConfig=readJson(path.join(amBookRoot,'book.config.json'));
const amDatasheets=readJson(path.join(amBookRoot,amBookConfig.sources.codexDatasheets));
const amEffectiveDetachmentSources=projectEffectiveEnhancementSources(amModel,{label:'Adeptus Mechanicus glossary Enhancement'});
const amDetachmentSources=[...new Set(amEffectiveDetachmentSources.map(item=>item.glossarySourceRevision))].map(revision=>({revision,detachments:amEffectiveDetachmentSources.filter(item=>item.glossarySourceRevision===revision).sort((left,right)=>left.glossarySourceOrder-right.glossarySourceOrder)}));
const allGenericArmyBooks=publicBookIds.filter(id=>!['death-guard','adeptus-mechanicus'].includes(id)).map(id=>{
  const bookRoot=path.join(root,'books',id),config=readJson(path.join(bookRoot,'book.config.json')),model=effectiveBookModels.get(id),packFile=path.join(bookRoot,config.sources.factionPack);
  return {id,title:config.title,root:bookRoot,config,model,runtime:Object.fromEntries(model.glossary.map(term=>[term.id,term])),pack:readJson(packFile)};
});
// Registration publishes source-backed runtime concepts, not arbitrary reader targets.
// Dependency owners must be registered before their overlay contexts.
const reverseBookAdapters=process.argv.includes('--reverse-book-adapters');
const genericArmyBooks=allGenericArmyBooks.filter(book=>['tyranids','tau-empire','emperors-children','chaos-space-marines','space-marines','blood-angels','dark-angels'].includes(book.id)).sort((a,b)=>
  (a.config.dependencies?.length||0)-(b.config.dependencies?.length||0)||(reverseBookAdapters?b.id.localeCompare(a.id):a.id.localeCompare(b.id))
);
const coreFactProjection=createCoreFactProjection({repoRoot:root});
const {coreData,coreSource,coreDigital,coreRules,coreByTitle,coreIdByCode,digitalCoreId,digitalTitle,coreSectionByNumber}=coreFactProjection;
const coreCurated=coreData.terms;
const resolutions=readJson(path.join(glossaryRoot,'resolutions.en.json'));
const keywordLinks=readJson(path.join(glossaryRoot,'keyword-links.en.json'));
const coreQuickReferences=readJson(path.join(glossaryRoot,'core-quick-reference.en.json'));
const supplemental=readJson(path.join(glossaryRoot,'supplemental-terms.en.json'));
const contextIds=['core-rules','death-guard','adeptus-mechanicus',...genericArmyBooks.map(book=>book.id)];

const registry=new Map();
const aliases={};
const contexts=Object.fromEntries(contextIds.map(bookId=>[bookId,{}]));
const structuredRelationInputs=[];
const variants=[];
const summaryVariants=[];
const titleIndex=new Map();

function addTerm(term,sourceId,localId){
  const existing=registry.get(term.id);
  if(existing){
    if(clean(existing.definition.en)!==clean(term.definition.en))variants.push({
      termId:term.id,
      selectedSource:existing.canonicalSource.documentId,
      selectedCandidateDefinition:existing.definition.en,
      rejectedSource:sourceId,
      rejectedCandidateDefinition:term.definition.en
    });
    existing.sourceRefs=[...new Set([...(existing.sourceRefs||[]),sourceId])];
  }else{
    registry.set(term.id,{...term,sourceRefs:[sourceId]});
    const titleKey=normalTitle(term.title.en);
    if(!titleIndex.has(titleKey))titleIndex.set(titleKey,[]);
    titleIndex.get(titleKey).push(term.id);
  }
  if(localId&&localId!==term.id)aliases[localId]=term.id;
}

function navigationOf(record={}){
  const result={};
  for(const key of ['glossary','rule','datasheet','statline','units'])if(record[key]!=null)result[key]=record[key];
  return result;
}

function addContext(bookId,localId,termId,record={},extra={}){
  contexts[bookId][localId]={termId,navigation:navigationOf(record),...extra};
}

const coreId=canonicalCoreRuleId;
const glossaryExcludedCodes=CORE_GLOSSARY_EXCLUDED_CODES;

for(const rule of coreRules){
  const id=coreId(rule);
  addTerm({
    id,
    kind:rule.code.startsWith('24.')?'core-ability':'core-rule',
    scope:'global',
    edition:'11e',
    language:'en',
    title:{en:rule.title.replace(/^\[|\]$/g,'')},
    summary:{en:concise(recordText(rule))},
    definition:{en:clean(recordText(rule))},
    aliases:[],
    related:[],
    canonicalSource:{documentId:'core-rules',revision:'11e',locator:`${rule.code}; page ${rule.page}`},
    status:'verified'
  },'core-rules');
  addContext('core-rules',id,id,{rule:`${rule.sectionId}-rule-${rule.code.replace('.','-')}`});
}

// The digital 11E reference is a strict superset of the PDF rules above.
// Add its clarifications to the same canonical registry instead of keeping a
// second Core-only glossary that can drift out of sync with the routed reader.
for(const rule of coreDigital.records){
  if(glossaryExcludedCodes.has(rule.code))continue;
  const id=digitalCoreId(rule);
  if(registry.has(id))continue;
  addTerm({
    id,
    kind:rule.kind==='stratagem'?'stratagem':rule.code.startsWith('24.')?'core-ability':'core-rule',
    scope:'global',
    edition:'11e',
    language:'en',
    title:{en:digitalTitle(rule)},
    summary:{en:concise(recordText(rule))},
    definition:{en:clean(recordText(rule))},
    aliases:[],
    related:[],
    canonicalSource:{documentId:'core-rules',revision:'11e',locator:rule.code},
    status:'verified'
  },'core-rules');
}

for(const faq of coreFactProjection.catalog.faqs){
  const related=[...new Set([faq.relationships.primaryRuleId,...(faq.relationships.relatedRuleIds||[])].filter(Boolean))];
  addTerm({
    id:faq.id,
    kind:'core-faq',
    scope:'global',
    edition:'11e',
    language:'en',
    title:{en:faq.question},
    summary:{en:faq.answer},
    definition:{en:`Q: ${faq.question}\nA: ${faq.answer}`},
    aliases:[],
    related,
    canonicalSource:{documentId:'core-rules',revision:'11e',locator:faq.provenance.sourceLocator||faq.provenance.sourceUnitId},
    provenance:structuredClone(faq.provenance),
    fullRulePath:faq.fullRulePath,
    status:'verified'
  },'core-rules');
  addContext('core-rules',faq.id,faq.id,{fullRulePath:faq.fullRulePath});
}

for(const [localId,entry] of Object.entries(coreCurated)){
  const match=coreByTitle.get(normalTitle(entry.title));
  const id=match?coreId(match):`core-${slug(entry.title)}`;
  if(!registry.has(id))addTerm({id,kind:'core-concept',scope:'global',edition:'11e',language:'en',title:{en:entry.title},summary:{en:entry.summary},definition:{en:entry.summary},aliases:[localId],related:(entry.related||[]).map(value=>aliases[value]||`core-${slug(coreCurated[value]?.title||value)}`),canonicalSource:{documentId:'core-rules',revision:'11e',locator:entry.rule},status:'provisional'},'core-rules',localId);
  else{
    aliases[localId]=id;
    registry.get(id).summary={en:concise(entry.summary)};
    registry.get(id).summarySource={documentId:'core-rules',kind:'curated-reference'};
  }
  addContext('core-rules',localId,id,entry);
}

// Fill any accepted Core concepts not present in the legacy PDF-shaped loops
// from the one-way Core fact projection. Existing public IDs are preserved.
for(const projected of coreFactProjection.terms){
  if(registry.has(projected.id))continue;
  addTerm({
    id:projected.id,kind:projected.kind,scope:'global',edition:'11e',language:'en',title:{en:projected.title},
    summary:{en:projected.summary},definition:{en:projected.definition},aliases:projected.aliases||[],related:[],
    canonicalSource:projected.canonicalSource,fullRulePath:projected.fullRulePath,status:'verified'
  },'core-rules',projected.id);
}

for(const [alias,target] of Object.entries(coreFactProjection.aliases||{})){
  if(!registry.has(target))continue;
  if(aliases[alias]&&aliases[alias]!==target)throw new Error(`Conflicting Core compatibility alias: ${alias}`);
  aliases[alias]=target;
}
const grenadeTarget=coreFactProjection.aliases['grenade-stratagem'];
if(grenadeTarget)aliases.grenade=grenadeTarget;
for(const update of coreFactProjection.coreUniversalUpdates||[]){
  addTerm({
    id:update.id,kind:'universal-rules-update',scope:'global',edition:'11e',language:'en',title:{en:update.title},
    summary:{en:concise(update.text)},definition:{en:cleanRuleText(update.text)},aliases:[],related:[],
    canonicalSource:{documentId:update.sourceId,revision:update.sourceDate,locator:update.sourceLocator},
    fullRulePath:`books/core-rules/reader/stratagems.html#${update.id}`,status:'verified'
  },'core-rules',update.id);
  addContext('core-rules',update.id,update.id,{fullRulePath:`books/core-rules/reader/stratagems.html#${update.id}`});
}

function dgStableId(entry){
  if(entry.id.startsWith('core-')||entry.id.startsWith('keyword-'))return entry.id;
  const owner=(entry.unitIds||[]).map(value=>value.replace(/^unit-/,''));
  const kind=entry.kind||slug(entry.group||'term');
  const base=`death-guard-${slug(kind)}-${slug(entry.title)}`;
  return owner.length?`${base}-${owner.join('-')}`:base;
}

const dgNurglesGiftSection=dgSource.sections.find(section=>section.id==='army-rule-nurgles-gift');
if(!dgNurglesGiftSection)throw new Error('Missing canonical Death Guard Nurgle’s Gift section');
const dgContagionRangeText=(dgNurglesGiftSection.blocks||[]).map(block=>{
  if(block.type==='p')return block.id==='contagion-range-cap'?block.text:'';
  if(block.type!=='table')return'';
  const columns=(block.columns||[]).join(' | ');
  const rows=(block.rows||[]).map(row=>row.join(' | ')).join('; ');
  return `${columns}: ${rows}.`;
}).filter(Boolean).join(' ');
if(!dgContagionRangeText)throw new Error('Incomplete canonical Death Guard Contagion Range source');

for(const entry of dgProjection.glossary){
  const enhancement=dgEnhancementById.get(entry.sectionId),upgrade=enhancement?.tags?.includes('UPGRADE');
  let id=dgStableId(entry);
  if(entry.id.startsWith('core-')){
    const match=coreByTitle.get(normalTitle(entry.title));
    if(match)id=coreId(match);
  }
  let suffix=2;
  const initial=id;
  while(registry.has(id)&&normalTitle(registry.get(id).title.en)!==normalTitle(entry.title))id=`${initial}-${suffix++}`;
  const runtime=dgRuntime[entry.id]||{};
  const effectivePoints=entry.kind==='unit'&&entry.sectionId?dgUnitsById.get(entry.sectionId)?.points:entry.points;
  const related=(runtime.related||[]).map(value=>aliases[value]||value);
  const sourceSummary=entry.id==='nurgles-gift'?entry.full:(entry.short||runtime.summary||entry.full);
  const sourceDefinition=entry.id==='contagion-range'?dgContagionRangeText:(entry.full||entry.short||runtime.summary);
  addTerm({
    id,
    kind:entry.kind||slug(entry.group),
    scope:entry.id.startsWith('core-')||entry.id.startsWith('keyword-')?'global':'death-guard',
    edition:'11e',
    language:'en',
    title:{en:entry.title},
    summary:{en:concise(`${upgrade?'UPGRADE. ':''}${(entry.weapon||entry.statline)?runtime.summary:sourceSummary}`)},
    definition:{en:clean(`${upgrade?'UPGRADE. ':''}${entry.weapon?`${entry.title} profile: ${Object.entries(entry.weapon).map(([key,value])=>`${key} ${value}`).join('; ')}.`:sourceDefinition}`)},
    structured:{...(entry.weapon?{weapon:entry.weapon}:{}),...(entry.statline?{statline:entry.statline}:{}),...(effectivePoints?{points:effectivePoints}:{}),...(upgrade?{tags:['UPGRADE']}:{})},
    aliases:[entry.id],
    related:[],
    mentions:related,
    canonicalSource:{documentId:entry.id.startsWith('core-')?'core-rules':'death-guard',revision:dgSource.version||'11e',locator:entry.sectionId||entry.group},
    status:entry.id.startsWith('core-')&&registry.has(id)?'verified':'provisional'
  },entry.id.startsWith('core-')?'death-guard':'death-guard',entry.id);
  if(entry.id.startsWith('core-')&&entry.short){
    registry.get(id).summary={en:concise(entry.short)};
    registry.get(id).summarySource={documentId:'death-guard',kind:'curated-reference'};
  }
  addContext('death-guard',entry.id,id,runtime,{owners:entry.unitIds||[],visible:entry.showGlossary!==false});
}
const pactSection=dgNurglesGiftSection.subsections?.find(section=>section.id==='pact-of-decay');
if(!pactSection)throw new Error('Missing canonical Death Guard Pact of Decay section');
const pactText=(pactSection.blocks||[]).filter(block=>block.type==='p').map(block=>block.text).join('\n');
const pactId='death-guard-army-rules-pact-of-decay';
addTerm({
  id:pactId,kind:'army-rules',scope:'death-guard',edition:'11e',language:'en',title:{en:pactSection.title},
  summary:{en:concise(pactText)},definition:{en:cleanRuleText(pactText)},aliases:['pact-of-decay'],related:[],mentions:['keyword-plague-legions'],
  canonicalSource:{documentId:'death-guard',revision:dgSource.version||'11e',locator:'Army Rules — Pact of Decay'},status:'verified'
},'death-guard','pact-of-decay');
addContext('death-guard','pact-of-decay',pactId,{}, {owners:[],visible:true});
for(const entry of dgProjection.glossary){
  if(!dgEnhancementById.get(entry.sectionId)?.tags?.includes('UPGRADE'))continue;
  const term=registry.get(dgStableId(entry));if(!term)throw new Error(`Missing Death Guard Upgrade term: ${entry.id}`);
  term.structured={...(term.structured||{}),tags:['UPGRADE']};
  if(!/^UPGRADE\./i.test(term.summary.en))term.summary.en=`UPGRADE. ${term.summary.en}`;
  if(!/^UPGRADE\./i.test(term.definition.en))term.definition.en=`UPGRADE. ${term.definition.en}`;
}

for(const [localId,entry] of Object.entries(amRuntime)){
  let id;
  const resolved=resolutions.aliases[localId];
  if(resolved)id=resolved.target;
  else if(localId.startsWith('core-')){
    const match=coreByTitle.get(normalTitle(entry.title));
    id=match?coreId(match):localId;
  }else id=`adeptus-mechanicus-${localId}`;
  if(!registry.has(id)){
    const profile=localId.startsWith('weapon-')?weaponProfile(entry.summary):null;
    const kind=localId.startsWith('weapon-')?'weapon':localId.startsWith('stratagem-')?'stratagem':'faction-term';
    addTerm({id,kind,scope:localId.startsWith('core-')?'global':'adeptus-mechanicus',edition:'11e',language:'en',title:{en:entry.title},summary:{en:concise(entry.summary)},definition:{en:clean(entry.full||entry.summary)},structured:profile?{weapon:profile}:{},presentation:profile?'profile':undefined,aliases:[localId],related:[],canonicalSource:{documentId:'adeptus-mechanicus',revision:'v1.1 + pinned 11e catalogue',locator:entry.rule||entry.datasheet||localId},status:'provisional'},'adeptus-mechanicus',localId);
  }
  else{
    if(localId!==id)aliases[localId]=id;
    if(clean(registry.get(id).summary.en)!==clean(entry.summary))summaryVariants.push({
      termId:id,
      selectedSource:registry.get(id).canonicalSource.documentId,
      selectedCandidateSummary:registry.get(id).summary.en,
      rejectedSource:'adeptus-mechanicus',
      rejectedCandidateSummary:entry.summary
    });
  }
  addContext('adeptus-mechanicus',localId,id,entry,resolved?{parameters:resolved.parameters}:{});
}

function addMechanicusDetachments(source,revision){
  for(const detachment of source.detachments||[]){
    const detachmentSlug=slug(detachment.title);
    const detachmentId=`adeptus-mechanicus-detachment-${detachmentSlug}`;
    addTerm({
      id:detachmentId,kind:'detachment',scope:'adeptus-mechanicus',edition:'11e',language:'en',
      title:{en:detachment.title},summary:{en:concise(detachment.tagline||detachment.rule?.text)},
      definition:{en:clean(detachment.tagline||detachment.rule?.text)},aliases:[detachment.id].filter(Boolean),related:[],
      canonicalSource:{documentId:'adeptus-mechanicus',revision,locator:detachment.id||detachment.title},status:'verified'
    },'adeptus-mechanicus',detachment.id);
    addContext('adeptus-mechanicus',detachment.id,detachmentId,{rule:detachment.id});

    if(detachment.rule){
      const ruleId=`adeptus-mechanicus-detachment-rule-${slug(detachment.rule.title)}`;
      addTerm({
        id:ruleId,kind:'detachment-rule',scope:'adeptus-mechanicus',edition:'11e',language:'en',
        title:{en:detachment.rule.title},summary:{en:concise(detachment.rule.text)},definition:{en:clean(detachment.rule.text)},
        aliases:[detachment.rule.id].filter(Boolean),related:[detachmentId],
        canonicalSource:{documentId:'adeptus-mechanicus',revision,locator:detachment.rule.id||detachment.id},status:'verified'
      },'adeptus-mechanicus',detachment.rule.id);
      if(detachment.rule.eligibility)structuredRelationInputs.push({termId:ruleId,eligibility:detachment.rule.eligibility});
      addContext('adeptus-mechanicus',detachment.rule.id,ruleId,{rule:detachment.rule.id});
    }

    for(const enhancement of detachment.enhancements||[]){
      const id=`adeptus-mechanicus-${enhancement.canonicalEnhancementId}`;
      const upgrade=(enhancement.tags||[]).includes('UPGRADE'),text=upgrade?`UPGRADE. ${enhancement.text}`:enhancement.text;
      addTerm({
        id,kind:'enhancement',scope:'adeptus-mechanicus',edition:'11e',language:'en',title:{en:enhancement.title},
        summary:{en:concise(text)},definition:{en:clean(text)},structured:upgrade?{tags:['UPGRADE']}:{},aliases:[],related:[detachmentId],
        canonicalSource:{documentId:'adeptus-mechanicus',revision,locator:`${detachment.id}; Enhancements`},status:'verified'
      },'adeptus-mechanicus');
      if(enhancement.eligibility)structuredRelationInputs.push({termId:id,eligibility:enhancement.eligibility});
    }

    for(const stratagem of detachment.stratagems||[]){
      const id=`adeptus-mechanicus-stratagem-${slug(stratagem.title)}`;
      const definition=[stratagem.category,stratagem.when&&`WHEN: ${stratagem.when}`,stratagem.target&&`TARGET: ${stratagem.target}`,stratagem.effect&&`EFFECT: ${stratagem.effect}`,stratagem.restrictions&&`RESTRICTIONS: ${stratagem.restrictions}`].filter(Boolean).join('\n');
      addTerm({
        id,kind:'stratagem',scope:'adeptus-mechanicus',edition:'11e',language:'en',title:{en:stratagem.title},
        summary:{en:concise(stratagem.effect||definition)},definition:{en:clean(definition)},structured:{cp:stratagem.cp||''},aliases:[],related:[detachmentId],
        canonicalSource:{documentId:'adeptus-mechanicus',revision,locator:`${detachment.id}; Stratagems`},status:'verified'
      },'adeptus-mechanicus',stratagem.id);
      if(stratagem.eligibility)structuredRelationInputs.push({termId:id,eligibility:stratagem.eligibility});
      addContext('adeptus-mechanicus',stratagem.id,id,{rule:stratagem.id});
    }
  }
}

for(const source of amDetachmentSources)addMechanicusDetachments(source,source.revision);

for(const datasheet of amDatasheets.datasheets||[]){
  const id=`adeptus-mechanicus-unit-${slug(datasheet.title)}`;
  const stats=datasheet.stats||datasheet.profiles?.[0]?.stats||{};
  const summary=Object.entries(stats).map(([key,value])=>`${key} ${value}`).join(' · ')+(datasheet.invulnerable?` · Inv ${datasheet.invulnerable}`:'');
  addTerm({
    id,kind:'unit',scope:'adeptus-mechanicus',edition:'11e',language:'en',title:{en:datasheet.title},
    summary:{en:summary||`${datasheet.category||'Adeptus Mechanicus'} datasheet.`},
    definition:{en:`${datasheet.category||'Adeptus Mechanicus'} datasheet.${datasheet.status?` ${datasheet.status}.`:''}`},
    structured:{statline:stats,points:datasheet.points||[]},aliases:[datasheet.id].filter(Boolean),related:[],
    canonicalSource:{documentId:'adeptus-mechanicus',revision:amDatasheets.source?.revision||'Codex carry-forward for 11e',locator:datasheet.id},status:'provisional'
  },'adeptus-mechanicus',datasheet.id);
  addContext('adeptus-mechanicus',datasheet.id,id,{datasheet:datasheet.id,statline:`${datasheet.id.replace(/^unit-/,'')}-profile`});
}

const coreAbilityForLocalId=(bookId,localId)=>{
  const prefix=`${bookId}-ability-`;
  if(!localId.startsWith(prefix))return null;
  const stem=localId.slice(prefix.length).replace(/-\d+$/,'');
  const term=registry.get(`core-${stem}`);
  return term?.kind==='core-ability'?term:null;
};
const confirmedCanonicalAliases={
  'space-marines-weapon-grav-cannon-3':'space-marines-weapon-grav-cannon-2',
  'tau-empire-ability-for-the-greater-good':'tau-empire-army-rule-for-the-greater-good',
  'tyranids-ability-shadow-in-the-warp':'tyranids-army-rule-shadow-in-the-warp'
};
const confirmedCoreSingularAliases=['saving-throw','leadership-test','battle-shock-test'];
const contextOnlyTermIds=new Set([
  'space-marines-ability-invulnerable-save',
  'space-marines-ability-invulnerable-save-2',
  'space-marines-ability-transport',
  'space-marines-ability-transport-2',
  'space-marines-ability-transport-3',
  'space-marines-ability-transport-4',
  'space-marines-ability-transport-5',
  'space-marines-ability-transport-6',
  'space-marines-ability-transport-7',
  'space-marines-ability-transport-8',
  'space-marines-ability-transport-9',
  'space-marines-ability-transport-10',
  'adeptus-mechanicus-datasheet-damaged-1-4-wounds-remaining',
  'emperors-children-ability-damaged-1-5-wounds-remaining',
  'emperors-children-ability-damaged-1-6-wounds-remaining',
  'emperors-children-ability-damaged-1-7-wounds-remaining',
  'space-marines-ability-damaged-1-4-wounds-remaining',
  'space-marines-ability-damaged-1-5-wounds-remaining',
  'tau-empire-ability-damaged-1-4-wounds-remaining',
  'tau-empire-ability-damaged-1-5-wounds-remaining',
  'tau-empire-ability-damaged-1-5-wounds-remaining-2',
  'tyranids-ability-damaged-1-4-wounds-remaining',
  'tyranids-ability-damaged-1-5-wounds-remaining'
]);

for(const book of genericArmyBooks){
  const officialTitles=new Set(book.pack.detachments.flatMap(detachment=>[
    detachment.rule?.title,
    ...(detachment.enhancements||[]).map(item=>item.title),
    ...(detachment.stratagems||[]).map(item=>item.title)
  ]).filter(Boolean).map(normalTitle));
  for(const [localId,entry] of Object.entries(book.runtime)){
    if((book.config.dependencies||[]).some(id=>localId.startsWith(`${id}-`))){
      const canonicalId=confirmedCanonicalAliases[localId]||localId;
      if(!registry.has(canonicalId))throw new Error(`${book.title} shared glossary target is absent: ${localId}`);
      if(canonicalId!==localId)aliases[localId]=canonicalId;
      addContext(book.id,localId,canonicalId,entry);
      continue;
    }
    const official=officialTitles.has(normalTitle(entry.title));
    const prefix=`${book.id}-`,isWeapon=localId.startsWith(`${prefix}weapon-`);
    const profile=isWeapon?weaponProfile(entry.summary):null;
    const kind=isWeapon?'weapon':localId.startsWith(`${prefix}stratagem-`)?'stratagem':localId.startsWith(`${prefix}enhancement-`)?'enhancement':localId.startsWith(`${prefix}detachment-rule-`)?'detachment-rule':'datasheet-ability';
    const upgrade=kind==='enhancement'&&/^UPGRADE\./i.test(entry.full||entry.summary||'');
    const coreAbility=kind==='datasheet-ability'?coreAbilityForLocalId(book.id,localId):null;
    if(coreAbility){
      aliases[localId]=coreAbility.id;
      coreAbility.sourceRefs=[...new Set([...(coreAbility.sourceRefs||[]),book.id])];
      addContext(book.id,localId,coreAbility.id,entry);
      continue;
    }
    const canonicalId=confirmedCanonicalAliases[localId];
    if(canonicalId){
      aliases[localId]=canonicalId;
      addContext(book.id,localId,canonicalId,entry);
      if(entry.rule)contexts[book.id][localId].navigation.fullRulePath=`books/${book.id}/reader.html#${entry.rule}`;
      continue;
    }
    addTerm({
      id:localId,
      kind,
      scope:book.id,edition:'11e',language:'en',title:{en:entry.title},summary:{en:concise(entry.summary)},definition:{en:clean(entry.full||entry.summary)},
      structured:profile?{weapon:profile}:upgrade?{tags:['UPGRADE']}:{},presentation:profile?'profile':undefined,aliases:[],related:[],
      canonicalSource:{documentId:official?(book.pack.meta?.sourceId||`${book.id}-faction-pack`):`${book.id}-codex-transcription`,revision:official?(book.pack.meta?.version||'current'):'pinned BSData',locator:entry.rule||entry.datasheet||localId},
      fullRulePath:entry.rule?`books/${book.id}/reader.html#${entry.rule}`:undefined,
      status:official?'verified':'provisional'
    },book.id,localId);
    addContext(book.id,localId,localId,entry);
  }
}
for(const [alias,target] of Object.entries(confirmedCanonicalAliases))if(!registry.has(target))throw new Error(`Unknown confirmed canonical alias target: ${alias} -> ${target}`);

for(const entry of supplemental.terms||[]){
  if(registry.has(entry.id))continue;
  const scope=entry.scope||'global';
  addTerm({
    id:entry.id,kind:entry.kind,scope,edition:'11e',language:'en',title:{en:entry.title},
    summary:{en:entry.summary},definition:{en:entry.definition||entry.summary},aliases:[],related:entry.related||[],
    canonicalSource:{documentId:'glossary-native',revision:'1',locator:entry.locator||`glossary/supplemental-terms.en.json#${entry.id}`},
    entryClass:'GLOSSARY_NATIVE',ownerType:'GLOSSARY_NATIVE',ownerId:entry.id,
    status:'provisional'
  },scope==='death-guard'?'death-guard':'core-rules');
}
for(const [alias,target] of Object.entries(supplemental.aliases||{})){
  if(!registry.has(target))throw new Error(`Unknown supplemental alias target: ${alias} -> ${target}`);
  aliases[alias]=target;
}
for(const [alias,resolution] of Object.entries(resolutions.aliases||{})){
  if(!registry.has(resolution.target))throw new Error(`Unknown exact resolution target: ${alias} -> ${resolution.target}`);
  if(aliases[alias]&&aliases[alias]!==resolution.target)throw new Error(`Conflicting exact resolution for ${alias}`);
  aliases[alias]=resolution.target;
}
for(const [alias,target] of Object.entries(deriveKeywordCompatibilityAliases({registry,keywordLinks}))){
  if(aliases[alias]&&aliases[alias]!==target)throw new Error(`Conflicting keyword-form alias for ${alias}`);
  aliases[alias]=target;
}
for(const [target,labels] of Object.entries(supplemental.matchLabels||{})){
  if(!registry.has(target))throw new Error(`Unknown supplemental match-label target: ${target}`);
  const term=registry.get(target);
  term.matchLabels=[...new Set([...(term.matchLabels||[]),...labels])];
}

for(const [alias,target] of Object.entries({...aliases}))if(aliases[target])aliases[alias]=aliases[target];
const orderedAliases=Object.fromEntries(Object.entries(aliases).sort(([a],[b])=>a.localeCompare(b)));
for(const alias of Object.keys(aliases))delete aliases[alias];
Object.assign(aliases,orderedAliases);
for(const term of registry.values()){
  term.aliases=[...new Set([...(term.aliases||[]),...Object.entries(aliases).filter(([,target])=>target===term.id).map(([alias])=>alias)])].filter(alias=>alias!==term.id).sort();
  term.mentions=[...new Set((term.mentions||[]).map(value=>aliases[value]||value).filter(value=>registry.has(value)))];
}

for(const rule of coreDigital.records){
  if(glossaryExcludedCodes.has(rule.code))continue;
  const section=coreSectionByNumber.get(rule.code.slice(0,2));
  const term=registry.get(digitalCoreId(rule));
  if(section&&term)term.fullRulePath=`books/core-rules/reader/${section}.html#rule-${slug(rule.code)}`;
}
const escapeRegExp=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function keywordPattern(title){
  const words=title.trim().split(/\s+/);
  const last=words.pop();
  const plural=last.endsWith('S')?last:`${last}S?`;
  return new RegExp(`\\b${words.map(escapeRegExp).join('\\s+')}${words.length?'\\s+':''}${plural}\\b`,'i');
}
function readableList(values,limit=4){
  const selected=values.slice(0,limit);
  if(!selected.length)return '';
  if(selected.length===1)return selected[0];
  return `${selected.slice(0,-1).join(', ')} and ${selected.at(-1)}${values.length>limit?` (+${values.length-limit} more)`:''}`;
}

const keywordCandidates=[];
for(const alias of confirmedCoreSingularAliases){
  const target=aliases[alias];
  for(const term of registry.values())if(term.id!==target&&term.matchLabels)term.matchLabels=term.matchLabels.filter(label=>slug(label)!==alias);
}
const battleShockStep=registry.get('core-rule-08-03-battle-shock');
if(battleShockStep)battleShockStep.matchLabels=[];

// Curated source files, not the generated registry, own these editorial fields.
for(const entry of supplemental.terms||[]){
  const term=registry.get(entry.id);
  if(!term)continue;
  if(term.entryClass==='GLOSSARY_NATIVE'){
    term.summary={en:concise(entry.summary)};
    term.definition={en:clean(entry.definition||entry.summary)};
  }
  term.related=entry.related||term.related||[];
  if(entry.locator&&term.entryClass==='GLOSSARY_NATIVE')term.canonicalSource={documentId:'glossary-native',revision:'1',locator:entry.locator};
}
for(const [id,reference] of Object.entries(coreQuickReferences)){
  const term=registry.get(id);
  if(!term)throw new Error(`Unknown Core quick-reference term: ${id}`);
  term.summary={en:concise(reference.summary)};
  term.summarySource={documentId:'core-rules',kind:'curated-operational-reference'};
  term.canonicalSource={...term.canonicalSource,locator:reference.sourceLocator||term.canonicalSource.locator};
}

// Keep every Core Rules article aligned with the same digital records rendered
// by the routed reader. Hand-written operational summaries remain intentionally
// concise, while the full definition always mirrors the current rule text.
for(const rule of coreDigital.records){
  if(glossaryExcludedCodes.has(rule.code))continue;
  const term=registry.get(digitalCoreId(rule));
  if(!term)throw new Error(`Missing digital Core Rules term: ${rule.code} ${rule.title}`);
  term.title={en:digitalTitle(rule)};
  term.kind=rule.kind==='stratagem'?'stratagem':rule.code.startsWith('24.')?'core-ability':'core-rule';
  const text=sourceConflictNotice(rule)||recordText(rule);
  const definition=rule.code==='03.03'?text.split('\nWHAT IS COHERENCY?')[0]:text;
  term.definition={en:cleanRuleText(definition)};
  if(rule.sourceConflict||term.summarySource?.kind!=='curated-operational-reference')term.summary={en:concise(text)};
  term.canonicalSource={documentId:'core-rules',revision:'11e',locator:rule.code};
  term.matchLabels=[...new Set([...(term.matchLabels||[]),rule.code])];
  term.status='verified';
  term.presentation=clean(term.summary.en)===clean(term.definition.en)?'atomic':'article';
}
const coreTermsByCode=new Map(coreDigital.records.filter(rule=>!glossaryExcludedCodes.has(rule.code)).map(rule=>[rule.code,registry.get(digitalCoreId(rule))]).filter(([,term])=>term));
const coreCodes=[...coreTermsByCode.keys()].sort((a,b)=>b.length-a.length);
const chapterLabels=new Map([
  ['03.01','Moving'],['04.01','Making Attacks'],['05.01','Attack Sequence'],['15.01','Stratagems'],['16.01','Actions']
]);
for(const [code,label] of chapterLabels){
  const term=coreTermsByCode.get(code);
  if(term)term.matchLabels=[...new Set([...(term.matchLabels||[]),label])];
}
const sectionReferences=new Map([
  ['16.00',{label:'Actions',term:coreTermsByCode.get('16.01')}],
  ['23.00',{label:'Aircraft',term:registry.get('keyword-aircraft')}],
  ['17.00',{label:'Monsters and Vehicles',term:coreTermsByCode.get('17.01')}],
  ['20.00',{label:'Strategic Reserves',term:registry.get('core-strategic-reserves')}],
  ['18.00',{label:'Transports',term:coreTermsByCode.get('18.01')}]
]);
for(const {label,term} of sectionReferences.values())if(term)term.matchLabels=[...new Set([...(term.matchLabels||[]),label])];
function humanizeCoreReferences(value){
  let text=clean(value);
  for(const code of coreCodes){
    const title=coreTermsByCode.get(code)?.title?.en;
    if(!title)continue;
    const codePattern=escapeRegExp(code),titlePattern=escapeRegExp(title);
    text=text
      .replace(new RegExp(`\\[?(${titlePattern})\\]?(\\s+rule)?\\s*\\(${codePattern}\\)`,'gi'),'$1$2')
      .replace(new RegExp(`\\[?(${titlePattern})\\]?\\s+${codePattern}(?=$|[^0-9])`,'gi'),'$1')
      .replace(new RegExp(`\\(${codePattern}\\)`,'g'),title)
      .replace(new RegExp(`(^|[^0-9.])${codePattern}(?=$|[^0-9.])`,'g'),(_,prefix)=>`${prefix}${title}`);
  }
  for(const [code,{label}] of sectionReferences){
    const codePattern=escapeRegExp(code),labelPattern=escapeRegExp(label);
    text=text
      .replace(new RegExp(`(${labelPattern})\\s+${codePattern}(?=$|[^0-9])`,'gi'),'$1')
      .replace(new RegExp(`(^|[^0-9.])${codePattern}(?=$|[^0-9.])`,'g'),(_,prefix)=>`${prefix}${label}`);
  }
  return text
    .replace(/\s*\((?:03|04|05|15|16|24)\)/g,'')
    .replace(/\bRevived Revived and Adding Models to a Unit\b/g,'Revived and Adding Models to a Unit');
}
for(const term of registry.values()){
  if(term.summary?.en)term.summary.en=concise(humanizeCoreReferences(term.summary.en));
  if(term.definition?.en)term.definition.en=humanizeCoreReferences(term.definition.en);
}
const pactTerm=registry.get(pactId);
pactTerm.summary={en:concise(pactText)};
pactTerm.definition={en:cleanRuleText(pactText)};
pactTerm.canonicalSource={documentId:'death-guard',revision:dgSource.version||'11e',locator:'Army Rules — Pact of Decay'};
pactTerm.status='verified';
delete pactTerm.curated;
for(const update of dgOfficialUpdates.updates||[])for(const target of update.targets||[]){
  if(!target.glossaryTermId)continue;
  const term=registry.get(target.glossaryTermId);
  if(!term)throw new Error(`Official update references unknown glossary term ${target.glossaryTermId}`);
  term.canonicalSource={documentId:'death-guard',revision:update.source.documentId,locator:`Rules Updates · ${target.title}`};
  term.status='verified';
}
const editorialContract=loadEditorialContract({knownTerms:registry});
for(const record of editorialContract.summaries){
  const term=registry.get(record.termId);
  if(term.canonicalSource.documentId!==record.semanticSource.documentId)throw new Error(`Editorial summary ${record.termId} conflicts with its canonical semantic owner`);
  term.summary={en:record.summary};
  term.summarySource={documentId:'global-glossary-editorial-contracts',revision:editorialContract.revision,locator:record.termId};
}
const keywordByForm=buildKeywordIdentity({registry,keywordLinks});
const amUnitKeywordsById=new Map((amDatasheets.datasheets||[]).map(unit=>[unit.id,unit.keywords||[]]));
const relationClaims=structuredRelationInputs.map(input=>({
  termId:input.termId,
  keywordIds:keywordRelationsFromEligibility({eligibility:input.eligibility,unitKeywordsById:amUnitKeywordsById,keywordByForm})
}));
for(const term of registry.values()){
  if(term.kind!=='keyword'&&!term.id.startsWith('keyword-'))continue;
  const profile=keywordLinks.keywords[term.id]||{forms:[term.title.en],intrinsicRules:[],referencedByRules:[],relatedKeywords:[]};
  const intrinsicRules=[...new Set(profile.intrinsicRules||[])];
  const referencedByRules=[...new Set(profile.referencedByRules||[])].filter(id=>!intrinsicRules.includes(id));
  const commonRules=[...new Set(keywordLinks.commonRules||[])].filter(id=>!intrinsicRules.includes(id)&&!referencedByRules.includes(id));
  const relatedKeywords=[...new Set(profile.relatedKeywords||[])];
  for(const id of [...intrinsicRules,...referencedByRules,...commonRules,...relatedKeywords])if(!registry.has(id))throw new Error(`Keyword owner ${term.id} references unknown canonical ID ${id}`);
  term.references={intrinsicRules,referencedByRules,commonRules,factionTerms:[],relatedKeywords};
  const intrinsicLabels=intrinsicRules.map(id=>registry.get(id).title.en);
  const referencedLabels=referencedByRules.map(id=>registry.get(id).title.en);
  if(intrinsicLabels.length)term.summary={en:concise(`${term.title.en} units use ${readableList(intrinsicLabels)}.`)};
  else if(referencedLabels.length)term.summary={en:concise(`${term.title.en} is used as a condition by ${readableList(referencedLabels)}.`)};
  else term.summary={en:`${term.title.en} identifies models and units for rules interactions.`};
  const sentences=[`The ${term.title.en} keyword identifies models and units for rules interactions.`];
  if(intrinsicLabels.length)sentences.push(`It applies the following Core Rules: ${readableList(intrinsicLabels,intrinsicLabels.length)}.`);
  if(referencedLabels.length)sentences.push(`It is also used as a condition by ${readableList(referencedLabels,referencedLabels.length)}.`);
  sentences.push('Singular and plural forms of the same keyword are treated identically.');
  term.definition={en:sentences.join(' ')};
  term.canonicalSource={documentId:'core-rules',revision:'11e',locator:[...commonRules,...intrinsicRules,...referencedByRules].map(id=>registry.get(id).canonicalSource.locator.split(';')[0]).join(', ')};
  term.status='verified';
  const pattern=keywordPattern(term.title.en),linked=new Set([...intrinsicRules,...referencedByRules]);
  const candidates=coreRules.filter(rule=>rule.code!=='02.05'&&pattern.test(clean(rule.text))).map(coreId).filter(id=>registry.has(id)&&!linked.has(id));
  if(candidates.length)keywordCandidates.push({termId:term.id,candidateRuleIds:[...new Set(candidates)],status:'review-required'});
}
applyDeterministicRelatedPolicies({registry,keywordLinks,relationClaims});
for(const term of registry.values())term.aliases=[...new Set([...(term.aliases||[]),...Object.entries(aliases).filter(([,target])=>target===term.id).map(([alias])=>alias)])].filter(alias=>alias!==term.id).sort();
for(const id of contextOnlyTermIds)if(!registry.has(id))throw new Error(`Missing confirmed context-only term: ${id}`);
for(const term of registry.values()){
  term.presentation=derivePresentation(term,{contextOnly:contextOnlyTermIds.has(term.id)});
  if(term.entryClass==='GLOSSARY_NATIVE'&&term.canonicalSource?.documentId!=='glossary-native'){
    term.entryClass='UPSTREAM_PROJECTED';
    term.ownerType=term.scope==='global'?'CORE_FACT':'ARMY_BOOK_FACT';
    term.ownerId=term.id;
  }
  if(!term.entryClass)term.entryClass=term.presentation==='metadata'?'PRESENTATION_ONLY':'UPSTREAM_PROJECTED';
  if(!term.ownerType)term.ownerType=term.entryClass==='PRESENTATION_ONLY'?'PRESENTATION_METADATA':term.scope==='global'?'CORE_FACT':'ARMY_BOOK_FACT';
  if(!term.ownerId)term.ownerId=term.id;
  term.sourceRef={...term.canonicalSource};
}

const dgPublishedRuleIds=new Set([
  ...dgModel.units.map(unit=>unit.id),
  ...dgModel.detachments.map(detachment=>`${detachment.id.replace(/^detachment-/,'')}-rule`)
]);
for(const [bookId,records] of Object.entries(contexts))for(const record of Object.values(records)){
  const rule=record.navigation?.rule;
  if(!rule)continue;
  if(bookId==='death-guard'&&dgPublishedRuleIds.has(rule))record.navigation.fullRulePath=`books/death-guard/reader.html#${rule}`;
}
const stableRecordOrder=(a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b));
const aliasCandidates=[...titleIndex.entries()].filter(([,ids])=>new Set(ids).size>1).map(([normalizedTitle,ids])=>({normalizedTitle,termIds:[...new Set(ids)].sort(),status:'review-required'})).sort(stableRecordOrder);
const duplicateIndex=new Map();
for(const term of registry.values()){
  const marker=`${normalTitle(term.title.en)}\n${clean(term.definition.en).toLowerCase()}`;
  if(!duplicateIndex.has(marker))duplicateIndex.set(marker,[]);
  duplicateIndex.get(marker).push(term.id);
}
const duplicateCandidates=[...duplicateIndex.values()].filter(termIds=>termIds.length>1).map(termIds=>({termIds:[...termIds].sort(),status:'review-required'})).sort(stableRecordOrder);
const termIds=new Set(registry.keys());
for(const term of registry.values()){
  term.related=(term.related||[]).filter(id=>termIds.has(id));
  term.mentions=(term.mentions||[]).filter(id=>termIds.has(id));
}
const bookDependencies=Object.fromEntries(genericArmyBooks.map(book=>[book.id,book.config.dependencies||[]]));
validateGlossaryGraph({registry,aliases,contexts,bookDependencies});
const registryDocument={schema:1,language:'en',terms:Object.fromEntries([...registry].sort(([a],[b])=>a.localeCompare(b)))};
const contextDocuments={};
for(const bookId of Object.keys(contexts).sort())contextDocuments[bookId]={schema:1,bookId,terms:contexts[bookId]};
const definitionCandidates=variants.flatMap(variant=>[
  {termId:variant.termId,candidateSource:variant.selectedSource,candidateDefinition:variant.selectedCandidateDefinition},
  {termId:variant.termId,candidateSource:variant.rejectedSource,candidateDefinition:variant.rejectedCandidateDefinition}
]).filter((candidate,index,items)=>items.findIndex(other=>other.termId===candidate.termId&&other.candidateSource===candidate.candidateSource&&clean(other.candidateDefinition)===clean(candidate.candidateDefinition))===index)
  .map(candidate=>{
    const term=registry.get(candidate.termId),finalDefinition=term.definition.en;
    const resolution=clean(candidate.candidateDefinition)===clean(finalDefinition)
      ?'selected'
      :candidate.candidateSource===term.canonicalSource.documentId?'normalized':'rejected';
    return {...candidate,finalDefinition,resolution};
  });
const summaryCandidates=summaryVariants.flatMap(variant=>[
  {termId:variant.termId,candidateSource:variant.selectedSource,candidateSummary:variant.selectedCandidateSummary},
  {termId:variant.termId,candidateSource:variant.rejectedSource,candidateSummary:variant.rejectedCandidateSummary}
]).filter((candidate,index,items)=>items.findIndex(other=>other.termId===candidate.termId&&other.candidateSource===candidate.candidateSource&&clean(other.candidateSummary)===clean(candidate.candidateSummary))===index)
  .map(candidate=>{
    const term=registry.get(candidate.termId),finalSummary=term.summary.en;
    const resolution=clean(candidate.candidateSummary)===clean(finalSummary)
      ?'selected'
      :candidate.candidateSource===term.summarySource?.documentId||candidate.candidateSource===term.canonicalSource.documentId?'normalized':'rejected';
    return {...candidate,finalSummary,resolution};
  });
const semanticWarnings=[
  ...definitionCandidates.flatMap(candidate=>semanticAnomalies(candidate.candidateDefinition).map(issue=>({termId:candidate.termId,field:'definition',candidateSource:candidate.candidateSource,issue,fragment:concise(candidate.candidateDefinition,180)}))),
  ...summaryCandidates.flatMap(candidate=>semanticAnomalies(candidate.candidateSummary).map(issue=>({termId:candidate.termId,field:'summary',candidateSource:candidate.candidateSource,issue,fragment:concise(candidate.candidateSummary,180)})))
];
const report={schema:2,counts:{terms:registry.size,aliases:Object.keys(aliases).length,definitionCandidates:definitionCandidates.length,summaryCandidates:summaryCandidates.length,semanticWarnings:semanticWarnings.length,aliasCandidates:aliasCandidates.length,duplicateCandidates:duplicateCandidates.length,keywordCandidates:keywordCandidates.length},definitionCandidates:definitionCandidates.sort(stableRecordOrder),summaryCandidates:summaryCandidates.sort(stableRecordOrder),semanticWarnings:semanticWarnings.sort(stableRecordOrder),aliasCandidates,duplicateCandidates,keywordCandidates:keywordCandidates.sort(stableRecordOrder)};

writeJson(path.join(glossaryRoot,'registry.en.json'),registryDocument);
const aliasEntries=Object.entries(aliases).map(([id,targetTermId])=>({id,targetTermId,entryClass:'ALIAS_ONLY',ownerType:'GLOSSARY_ALIAS',ownerId:targetTermId}));
writeJson(path.join(glossaryRoot,'aliases.en.json'),{schema:2,language:'en',aliases,entries:aliasEntries});
for(const [bookId,document] of Object.entries(contextDocuments))writeJson(path.join(glossaryRoot,'contexts',`${bookId}.json`),document);
writeJson(path.join(glossaryRoot,'generated','conflict-report.json'),report);

const preferredMatches=Object.fromEntries(Object.entries(supplemental.preferredMatches||{}).map(([label,id])=>{if(!registry.has(id))throw new Error(`Unknown preferred match target: ${label} -> ${id}`);return [label.toLowerCase(),id];}));
const runtimePayload={schema:1,language:'en',contentHash:hash(JSON.stringify({registryDocument,contexts:contextDocuments,aliases,preferredMatches})),terms:registryDocument.terms,aliases,preferredMatches,contexts:Object.fromEntries(Object.entries(contextDocuments).map(([id,value])=>[id,value.terms]))};
const runtime=`(function(){'use strict';\nconst data=${JSON.stringify(runtimePayload)};\nfunction resolve(id){return data.aliases[id]||id;}\nfunction view(term,nav){return Object.freeze({id:term.id,kind:term.kind,title:term.title.en,summary:(term.summary&&term.summary.en)||term.definition.en,definition:term.definition.en,presentation:term.presentation,structured:term.structured||{},related:term.related||[],mentions:term.mentions||[],source:term.canonicalSource,sourceRef:term.sourceRef,entryClass:term.entryClass,ownerType:term.ownerType,ownerId:term.ownerId,status:term.status,fullRulePath:nav?.fullRulePath||term.fullRulePath||'',...(nav||{})});}\nfunction forBook(bookId){const result={};const local=data.contexts[bookId]||{};for(const [id,term] of Object.entries(data.terms))result[id]=view(term,local[id]&&local[id].navigation);for(const [localId,context] of Object.entries(local)){const id=resolve(context.termId);if(data.terms[id])result[localId]=view(data.terms[id],{...(context.navigation||{}),parameters:context.parameters||{}});}return Object.freeze(result);}\nfunction linkables(bookId){const local=data.contexts[bookId]||{},result=[],seenLocal=new Set(),seenCanonical=new Set();for(const [localId,context] of Object.entries(local)){const id=resolve(context.termId),term=data.terms[id];if(!term||seenLocal.has(localId))continue;const owners=[...(context.owners||[]),...(context.navigation?.units||[])];result.push({id:localId,termId:id,title:term.title.en,aliases:term.aliases||[],matchLabels:term.matchLabels||[],owners:[...new Set(owners)]});seenLocal.add(localId);seenCanonical.add(id);}for(const [id,term] of Object.entries(data.terms)){if(seenCanonical.has(id)||(term.scope!=='global'&&term.scope!==bookId))continue;result.push({id,termId:id,title:term.title.en,aliases:term.aliases||[],matchLabels:term.matchLabels||[],owners:[]});seenCanonical.add(id);}return Object.freeze(result.map(entry=>Object.freeze({...entry,owners:Object.freeze(entry.owners),matchLabels:Object.freeze(entry.matchLabels)})));}\nwindow.WH40K_GLOSSARY=Object.freeze({schema:data.schema,language:data.language,contentHash:data.contentHash,resolve,get(id){return data.terms[resolve(id)]||null;},resolveView(bookId,id){const canonical=resolve(id),term=data.terms[canonical];if(!term)return null;const context=(data.contexts[bookId]||{})[id]||(data.contexts[bookId]||{})[canonical];return view(term,{...(context?.navigation||{}),parameters:context?.parameters||{}});},entries(){return Object.freeze(Object.values(data.terms));},forBook,linkables,counts:Object.freeze({terms:Object.keys(data.terms).length,aliases:Object.keys(data.aliases).length})});\n}());\n`;
const runtimePreferences=`window.WH40K_GLOSSARY_MATCHES=Object.freeze(${JSON.stringify(preferredMatches)});\n`;
fs.writeFileSync(path.join(glossaryRoot,'generated','glossary.en.js'),runtime+runtimePreferences);
if(!process.argv.includes('--no-cache-write'))writeCacheRevision({root});
console.log(`Mega Glossary: ${registry.size} terms, ${Object.keys(aliases).length} aliases, ${definitionCandidates.length} definition candidates, ${aliasCandidates.length} title collisions.`);
