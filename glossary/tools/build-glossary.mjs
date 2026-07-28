import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
const glossaryRoot=path.join(root,'glossary');
const readJson=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const writeJson=(file,value)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');};
const loadWindow=file=>{const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file});return sandbox.window;};
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
  for(const part of parts){
    const match=part.match(/^(Range|A|BS|WS|S|AP|D|Abilities?)\s+(.+)$/i);if(!match)continue;
    profile[match[1].replace(/^Abilities?$/i,'Abilities')]=match[2].trim();
  }
  if(!profile.Range&&mode==='Melee')profile.Range='Melee';
  return profile.Range&&profile.A&&(profile.BS||profile.WS)&&profile.S&&profile.AP&&profile.D?profile:null;
}

const dgSource=readJson(path.join(root,'books','death-guard','content','death-guard-rules.en.json'));
const dgRuntime=loadWindow(path.join(root,'books','death-guard','scripts','data.js')).DG_TERMS;
const amRuntime=loadWindow(path.join(root,'books','adeptus-mechanicus','scripts','data.js')).DG_TERMS;
const amFaction=readJson(path.join(root,'books','adeptus-mechanicus','content','adeptus-mechanicus-rules.en.json'));
const amCodexDetachments=readJson(path.join(root,'books','adeptus-mechanicus','content','adeptus-mechanicus-codex-detachments.en.json'));
const amDatasheets=readJson(path.join(root,'books','adeptus-mechanicus','content','adeptus-mechanicus-codex-datasheets.en.json'));
const coreData=loadWindow(path.join(root,'books','core-rules','content','core-rules.en.js')).CORE_RULES;
const coreCurated=coreData.terms;
const coreSource=loadWindow(path.join(root,'books','core-rules','content','core-rules.source.en.js')).CORE_PDF_SOURCE;
const coreDigital=readJson(path.join(root,'books','core-rules','content','core-rules.digital-11e.json'));
const resolutions=readJson(path.join(glossaryRoot,'resolutions.en.json'));
const keywordLinks=readJson(path.join(glossaryRoot,'keyword-links.en.json'));
const coreQuickReferences=readJson(path.join(glossaryRoot,'core-quick-reference.en.json'));
const supplemental=readJson(path.join(glossaryRoot,'supplemental-terms.en.json'));
const existingRegistry=fs.existsSync(path.join(glossaryRoot,'registry.en.json'))?readJson(path.join(glossaryRoot,'registry.en.json')).terms:{};
const existingAliases=fs.existsSync(path.join(glossaryRoot,'aliases.en.json'))?readJson(path.join(glossaryRoot,'aliases.en.json')).aliases:{};
const existingContexts=Object.fromEntries(['core-rules','death-guard','adeptus-mechanicus'].map(bookId=>{
  const file=path.join(glossaryRoot,'contexts',`${bookId}.json`);
  return [bookId,fs.existsSync(file)?readJson(file).terms:{}];
}));

const registry=new Map();
const aliases={};
const contexts={"core-rules":{},"death-guard":{},"adeptus-mechanicus":{}};
const variants=[];
const titleIndex=new Map();

function addTerm(term,sourceId,localId){
  const existing=registry.get(term.id);
  if(existing){
    if(clean(existing.definition.en)!==clean(term.definition.en))variants.push({termId:term.id,selectedSource:existing.canonicalSource.documentId,rejectedSource:sourceId,selectedDefinition:existing.definition.en,rejectedDefinition:term.definition.en,status:'resolved-by-policy'});
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

function coreId(rule){
  if(rule.code.startsWith('24.'))return `core-${slug(rule.title)}`;
  return `core-rule-${rule.code.replace('.','-')}-${slug(rule.title)}`;
}

const coreRules=[];
for(const [sectionId,rules] of Object.entries(coreSource.rules))for(const rule of rules)coreRules.push({...rule,sectionId});
const coreByTitle=new Map(coreRules.map(rule=>[normalTitle(rule.title),rule]));
const coreIdByCode=new Map(coreRules.map(rule=>[rule.code,coreId(rule)]));
const digitalCanonicalIds={
  '05.04.04':'core-destroyed',
  '09.02.03':'core-reinforcements-step',
  '15.08':'core-stratagem-fire-overwatch'
};
const digitalCoreId=rule=>digitalCanonicalIds[rule.code]||coreIdByCode.get(rule.code)||`core-rule-${rule.code.replaceAll('.','-')}-${slug(rule.title)}`;
const glossaryExcludedCodes=new Set(['03.03.01']);
const digitalTitleOverrides={'24.37.01':'Torrent Restrictions'};
const digitalTitle=rule=>digitalTitleOverrides[rule.code]||rule.title.replace(/^\d+\.\s*/, '');
const coreSections=[coreData.introduction,...coreData.groups.flatMap(group=>group.sections)];
const coreSectionByNumber=new Map(coreSections.filter(section=>section.number).map(section=>[section.number.padStart(2,'0'),section.id]));

for(const rule of coreRules){
  const id=coreId(rule);
  addTerm({
    id,
    kind:rule.code.startsWith('24.')?'core-ability':'core-rule',
    scope:'global',
    edition:'11e',
    language:'en',
    title:{en:rule.title.replace(/^\[|\]$/g,'')},
    summary:{en:concise(rule.text)},
    definition:{en:clean(rule.text)},
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
    summary:{en:concise(rule.text)},
    definition:{en:clean(rule.text)},
    aliases:[],
    related:[],
    canonicalSource:{documentId:'core-rules',revision:'11e',locator:rule.code},
    status:'verified'
  },'core-rules');
}

for(const faq of coreSource.faqs||[]){
  const section=coreSectionByNumber.get(faq.primaryRule.slice(0,2));
  const related=faq.relatedRules.map(code=>coreDigital.records.find(rule=>rule.code===code)).filter(Boolean).map(digitalCoreId);
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
    canonicalSource:{documentId:'core-rules',revision:'11e',locator:'Rules Appendix; page 88'},
    fullRulePath:`books/core-rules/reader/${section}.html#${faq.id}`,
    status:'verified'
  },'core-rules');
  addContext('core-rules',faq.id,faq.id,{fullRulePath:`books/core-rules/reader/${section}.html#${faq.id}`});
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

function dgStableId(entry){
  if(entry.id.startsWith('core-')||entry.id.startsWith('keyword-'))return entry.id;
  const owner=(entry.unitIds||[]).map(value=>value.replace(/^unit-/,''));
  const kind=entry.kind||slug(entry.group||'term');
  const base=`death-guard-${slug(kind)}-${slug(entry.title)}`;
  return owner.length?`${base}-${owner.join('-')}`:base;
}

for(const entry of dgSource.glossary){
  let id=dgStableId(entry);
  if(entry.id.startsWith('core-')){
    const match=coreByTitle.get(normalTitle(entry.title));
    if(match)id=coreId(match);
  }
  let suffix=2;
  const initial=id;
  while(registry.has(id)&&normalTitle(registry.get(id).title.en)!==normalTitle(entry.title))id=`${initial}-${suffix++}`;
  const runtime=dgRuntime[entry.id]||{};
  const related=(runtime.related||[]).map(value=>aliases[value]||value);
  addTerm({
    id,
    kind:entry.kind||slug(entry.group),
    scope:entry.id.startsWith('core-')||entry.id.startsWith('keyword-')?'global':'death-guard',
    edition:'11e',
    language:'en',
    title:{en:entry.title},
    summary:{en:concise((entry.weapon||entry.statline)?runtime.summary:(entry.short||runtime.summary||entry.full))},
    definition:{en:clean(entry.weapon?`${entry.title} profile: ${Object.entries(entry.weapon).map(([key,value])=>`${key} ${value}`).join('; ')}.`:(entry.full||entry.short||runtime.summary))},
    structured:{...(entry.weapon?{weapon:entry.weapon}:{}),...(entry.statline?{statline:entry.statline}:{}),...(entry.points?{points:entry.points}:{})},
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
    addTerm({id,kind:localId.startsWith('weapon-')?'weapon':'faction-term',scope:localId.startsWith('core-')?'global':'adeptus-mechanicus',edition:'11e',language:'en',title:{en:entry.title},summary:{en:concise(entry.summary)},definition:{en:clean(entry.summary)},structured:profile?{weapon:profile}:{},presentation:profile?'profile':undefined,aliases:[localId],related:[],canonicalSource:{documentId:'adeptus-mechanicus',revision:'prototype',locator:entry.rule||entry.datasheet||localId},status:'provisional'},'adeptus-mechanicus',localId);
  }
  else{
    if(localId!==id)aliases[localId]=id;
    if(clean(registry.get(id).summary.en)!==clean(entry.summary))variants.push({termId:id,selectedSource:registry.get(id).canonicalSource.documentId,rejectedSource:'adeptus-mechanicus',selectedDefinition:registry.get(id).summary.en,rejectedDefinition:entry.summary,status:'resolved-by-policy'});
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
      addContext('adeptus-mechanicus',detachment.rule.id,ruleId,{rule:detachment.rule.id});
    }

    for(const enhancement of detachment.enhancements||[]){
      const id=`adeptus-mechanicus-enhancement-${slug(enhancement.title)}`;
      addTerm({
        id,kind:'enhancement',scope:'adeptus-mechanicus',edition:'11e',language:'en',title:{en:enhancement.title},
        summary:{en:concise(enhancement.text)},definition:{en:clean(enhancement.text)},aliases:[],related:[detachmentId],
        canonicalSource:{documentId:'adeptus-mechanicus',revision,locator:`${detachment.id}; Enhancements`},status:'verified'
      },'adeptus-mechanicus');
    }

    for(const stratagem of detachment.stratagems||[]){
      const id=`adeptus-mechanicus-stratagem-${slug(stratagem.title)}`;
      const definition=[stratagem.category,stratagem.when&&`WHEN: ${stratagem.when}`,stratagem.target&&`TARGET: ${stratagem.target}`,stratagem.effect&&`EFFECT: ${stratagem.effect}`].filter(Boolean).join('\n');
      addTerm({
        id,kind:'stratagem',scope:'adeptus-mechanicus',edition:'11e',language:'en',title:{en:stratagem.title},
        summary:{en:concise(stratagem.effect||definition)},definition:{en:clean(definition)},structured:{cp:stratagem.cp||''},aliases:[],related:[detachmentId],
        canonicalSource:{documentId:'adeptus-mechanicus',revision,locator:`${detachment.id}; Stratagems`},status:'verified'
      },'adeptus-mechanicus');
    }
  }
}

addMechanicusDetachments(amFaction,amFaction.version||'Faction Pack v1.0');
addMechanicusDetachments(amCodexDetachments,'Codex carry-forward for 11e');

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

for(const entry of supplemental.terms||[]){
  if(registry.has(entry.id))continue;
  const scope=entry.scope||'global';
  addTerm({
    id:entry.id,kind:entry.kind,scope,edition:'11e',language:'en',title:{en:entry.title},
    summary:{en:entry.summary},definition:{en:entry.definition||entry.summary},aliases:[],related:entry.related||[],
    canonicalSource:{documentId:scope==='death-guard'?'death-guard':'core-rules',revision:'11e',locator:entry.locator||'curated glossary supplement'},
    status:'provisional'
  },scope==='death-guard'?'death-guard':'core-rules');
}
for(const [alias,target] of Object.entries(supplemental.aliases||{})){
  if(!registry.has(target))throw new Error(`Unknown supplemental alias target: ${alias} -> ${target}`);
  aliases[alias]=target;
}
for(const [target,labels] of Object.entries(supplemental.matchLabels||{})){
  if(!registry.has(target))throw new Error(`Unknown supplemental match-label target: ${target}`);
  const term=registry.get(target);
  term.matchLabels=[...new Set([...(term.matchLabels||[]),...labels])];
}

for(const [alias,target] of Object.entries({...aliases}))if(aliases[target])aliases[alias]=aliases[target];
for(const term of registry.values()){
  term.aliases=[...new Set([...(term.aliases||[]),...Object.entries(aliases).filter(([,target])=>target===term.id).map(([alias])=>alias)])].filter(alias=>alias!==term.id).sort();
  term.mentions=[...new Set((term.mentions||[]).map(value=>aliases[value]||value).filter(value=>registry.has(value)))];
}

function hasAnchor(relativePath){
  const [file,anchor='']=relativePath.split('#'),absolute=path.join(root,...file.split('/'));
  return fs.existsSync(absolute)&&(!anchor||fs.readFileSync(absolute,'utf8').includes(`id="${anchor}"`));
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
for(const term of registry.values()){
  if(term.kind!=='keyword'&&!term.id.startsWith('keyword-'))continue;
  const pattern=keywordPattern(term.title.en);
  const profile=keywordLinks.keywords[term.id]||{forms:[term.title.en],intrinsicRules:[],referencedByRules:[],relatedKeywords:[]};
  const intrinsicRules=[...new Set(profile.intrinsicRules||[])];
  const referencedByRules=[...new Set(profile.referencedByRules||[])].filter(id=>!intrinsicRules.includes(id));
  const commonRules=[...new Set(keywordLinks.commonRules||[])];
  const relatedKeywords=[...new Set(profile.relatedKeywords||[])];
  term.references={intrinsicRules,referencedByRules,commonRules,factionTerms:[],relatedKeywords};
  const intrinsicLabels=intrinsicRules.map(id=>registry.get(id)?.title.en).filter(Boolean);
  const referencedLabels=referencedByRules.map(id=>registry.get(id)?.title.en).filter(Boolean);
  if(intrinsicLabels.length)term.summary={en:concise(`${term.title.en} units use ${readableList(intrinsicLabels)}.`)};
  else if(referencedLabels.length)term.summary={en:concise(`${term.title.en} has no standalone Core Rules effect; it is checked by ${readableList(referencedLabels)}.`)};
  else term.summary={en:`${term.title.en} has no standalone Core Rules effect; it matters only when another rule explicitly references it.`};
  const sentences=[`The ${term.title.en} keyword identifies models and units for rules interactions.`];
  if(intrinsicLabels.length)sentences.push(`It applies the following Core Rules: ${readableList(intrinsicLabels,intrinsicLabels.length)}.`);
  else sentences.push('It does not grant a standalone Core Rules effect.');
  if(referencedLabels.length)sentences.push(`It is also used as a condition by ${readableList(referencedLabels,referencedLabels.length)}.`);
  sentences.push('Singular and plural forms of the same keyword are treated identically.');
  term.definition={en:sentences.join(' ')};
  term.canonicalSource={documentId:'core-rules',revision:'11e',locator:[...commonRules,...intrinsicRules,...referencedByRules].map(id=>registry.get(id)?.canonicalSource?.locator?.split(';')[0]).filter(Boolean).join(', ')};
  term.status='verified';
  const linked=new Set([...intrinsicRules,...referencedByRules]);
  const candidates=coreRules.filter(rule=>rule.code!=='02.05'&&pattern.test(clean(rule.text))).map(coreId).filter(id=>registry.has(id)&&!linked.has(id));
  if(candidates.length)keywordCandidates.push({termId:term.id,candidateRuleIds:[...new Set(candidates)],status:'review-required'});
}

// registry.en.json is the editorial source of truth. Imports discover new
// records and rebuild navigation, but never replace existing canonical text.
for(const [id,existing] of Object.entries(existingRegistry)){
  if(existing.curated===true&&!registry.has(id))registry.set(id,{...existing,sourceRefs:existing.sourceRefs||['curated-glossary']});
  const term=registry.get(id);
  if(!term)continue;
  for(const field of ['kind','scope','edition','language','title','summary','definition','structured','presentation','related','mentions','references','matchLabels','canonicalSource','summarySource','status','curation']){
    if(existing[field]==null)continue;
    if(field==='definition'&&/^(weapon|datasheet) profile\.?$/i.test(existing.definition?.en||''))continue;
    if(field==='structured'&&existing.kind==='weapon'&&!Object.keys(existing.structured||{}).length)continue;
    term[field]=existing[field];
  }
  if(existing.curated===true)term.curated=true;
}
for(const [alias,target] of Object.entries(existingAliases)){
  if(!registry.has(target))continue;
  if(aliases[alias]&&aliases[alias]!==target)continue;
  aliases[alias]=target;
}
for(const [bookId,records] of Object.entries(existingContexts)){
  for(const [localId,record] of Object.entries(records))if(record.curated===true&&registry.has(aliases[record.termId]||record.termId))contexts[bookId][localId]=record;
}
const battleShockStep=registry.get('core-rule-08-03-battle-shock');
if(battleShockStep)battleShockStep.matchLabels=[];

// Curated source files, not the generated registry, own these editorial fields.
for(const entry of supplemental.terms||[]){
  const term=registry.get(entry.id);
  if(!term)continue;
  term.summary={en:concise(entry.summary)};
  term.definition={en:clean(entry.definition||entry.summary)};
  term.related=entry.related||term.related||[];
  if(entry.locator)term.canonicalSource={documentId:term.scope==='death-guard'?'death-guard':'core-rules',revision:'11e',locator:entry.locator};
  if(entry.locator)term.status='verified';
}
for(const [id,reference] of Object.entries(coreQuickReferences)){
  const term=registry.get(id);
  if(!term)throw new Error(`Unknown Core quick-reference term: ${id}`);
  term.summary={en:concise(reference.summary)};
  term.definition={en:clean(reference.definition)};
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
  const definition=rule.code==='03.03'?rule.text.split('\nWHAT IS COHERENCY?')[0]:rule.text;
  term.definition={en:cleanRuleText(definition)};
  if(term.summarySource?.kind!=='curated-operational-reference')term.summary={en:concise(rule.text)};
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
  return text.replace(/\s*\((?:03|04|05|15|16|24)\)/g,'');
}
for(const term of registry.values()){
  if(term.summary?.en)term.summary.en=concise(humanizeCoreReferences(term.summary.en));
  if(term.definition?.en)term.definition.en=humanizeCoreReferences(term.definition.en);
}
for(const term of registry.values())term.aliases=[...new Set([...(term.aliases||[]),...Object.entries(aliases).filter(([,target])=>target===term.id).map(([alias])=>alias)])].filter(alias=>alias!==term.id).sort();
for(const term of registry.values()){
  if(term.kind==='weapon'||term.structured?.weapon)term.presentation='profile';
  else if(!term.presentation||term.presentation==='atomic'||term.presentation==='article')term.presentation=clean(term.summary?.en)===clean(term.definition?.en)?'atomic':'article';
}

for(const [bookId,records] of Object.entries(contexts))for(const record of Object.values(records)){
  const rule=record.navigation?.rule;
  if(!rule)continue;
  const candidate=bookId==='death-guard'?`books/death-guard/reader.html#${rule}`:bookId==='adeptus-mechanicus'?`books/adeptus-mechanicus/index.html#${rule}`:'';
  if(candidate&&hasAnchor(candidate))record.navigation.fullRulePath=candidate;
}
for(const term of registry.values())if(term.fullRulePath&&!hasAnchor(term.fullRulePath))throw new Error(`Broken fullRulePath for ${term.id}: ${term.fullRulePath}`);
const aliasCandidates=[...titleIndex.entries()].filter(([,ids])=>new Set(ids).size>1).map(([normalizedTitle,ids])=>({normalizedTitle,termIds:[...new Set(ids)],status:'review-required'}));
const registryDocument={schema:1,language:'en',terms:Object.fromEntries([...registry].sort(([a],[b])=>a.localeCompare(b)))};
const contextDocuments={};
for(const [bookId,records] of Object.entries(contexts))contextDocuments[bookId]={schema:1,bookId,terms:records};
const report={schema:1,counts:{terms:registry.size,aliases:Object.keys(aliases).length,variants:variants.length,aliasCandidates:aliasCandidates.length,keywordCandidates:keywordCandidates.length},variants,aliasCandidates,keywordCandidates};

writeJson(path.join(glossaryRoot,'registry.en.json'),registryDocument);
writeJson(path.join(glossaryRoot,'aliases.en.json'),{schema:1,language:'en',aliases});
for(const [bookId,document] of Object.entries(contextDocuments))writeJson(path.join(glossaryRoot,'contexts',`${bookId}.json`),document);
writeJson(path.join(glossaryRoot,'generated','conflict-report.json'),report);

const preferredMatches=Object.fromEntries(Object.entries(supplemental.preferredMatches||{}).map(([label,id])=>{if(!registry.has(id))throw new Error(`Unknown preferred match target: ${label} -> ${id}`);return [label.toLowerCase(),id];}));
const runtimePayload={schema:1,language:'en',contentHash:hash(JSON.stringify({registryDocument,contexts:contextDocuments,aliases,preferredMatches})),terms:registryDocument.terms,aliases,preferredMatches,contexts:Object.fromEntries(Object.entries(contextDocuments).map(([id,value])=>[id,value.terms]))};
const runtime=`(function(){'use strict';\nconst data=${JSON.stringify(runtimePayload)};\nfunction resolve(id){return data.aliases[id]||id;}\nfunction view(term,nav){return Object.freeze({id:term.id,title:term.title.en,summary:(term.summary&&term.summary.en)||term.definition.en,definition:term.definition.en,presentation:term.presentation,structured:term.structured||{},related:term.related||[],mentions:term.mentions||[],source:term.canonicalSource,status:term.status,fullRulePath:nav?.fullRulePath||term.fullRulePath||'',...(nav||{})});}\nfunction forBook(bookId){const result={};const local=data.contexts[bookId]||{};for(const [id,term] of Object.entries(data.terms))result[id]=view(term,local[id]&&local[id].navigation);for(const [localId,context] of Object.entries(local)){const id=resolve(context.termId);if(data.terms[id])result[localId]=view(data.terms[id],{...(context.navigation||{}),parameters:context.parameters||{}});}return Object.freeze(result);}\nfunction linkables(bookId){const local=data.contexts[bookId]||{},result=[],seenLocal=new Set(),seenCanonical=new Set();for(const [localId,context] of Object.entries(local)){const id=resolve(context.termId),term=data.terms[id];if(!term||seenLocal.has(localId))continue;const owners=[...(context.owners||[]),...(context.navigation?.units||[])];result.push({id:localId,termId:id,title:term.title.en,aliases:term.aliases||[],matchLabels:term.matchLabels||[],owners:[...new Set(owners)]});seenLocal.add(localId);seenCanonical.add(id);}for(const [id,term] of Object.entries(data.terms)){if(seenCanonical.has(id)||(term.scope!=='global'&&term.scope!==bookId))continue;result.push({id,termId:id,title:term.title.en,aliases:term.aliases||[],matchLabels:term.matchLabels||[],owners:[]});seenCanonical.add(id);}return Object.freeze(result.map(entry=>Object.freeze({...entry,owners:Object.freeze(entry.owners),matchLabels:Object.freeze(entry.matchLabels)})));}\nwindow.WH40K_GLOSSARY=Object.freeze({schema:data.schema,language:data.language,contentHash:data.contentHash,resolve,get(id){return data.terms[resolve(id)]||null;},forBook,linkables,counts:Object.freeze({terms:Object.keys(data.terms).length,aliases:Object.keys(data.aliases).length})});\n}());\n`;
const runtimePreferences=`window.WH40K_GLOSSARY_MATCHES=Object.freeze(${JSON.stringify(preferredMatches)});\n`;
fs.writeFileSync(path.join(glossaryRoot,'generated','glossary.en.js'),runtime+runtimePreferences);
const coreReaderFiles=fs.readdirSync(path.join(root,'books','core-rules','reader'))
  .filter(file=>file.endsWith('.html')||file==='styles.css'||file==='app.js'||file==='search-index.json')
  .map(file=>`books/core-rules/reader/${file}`);
const cacheInputs=[
  'index.html','manifest.webmanifest','service-worker.js','glossary-return.js','roster-guides/index.html','roster-guides/app.js','roster-guides/points-data.js','roster-guides/points-validator.js',
  'books/death-guard/index.html','books/core-rules/index.html','books/adeptus-mechanicus/index.html',
  ...['death-guard','adeptus-mechanicus'].flatMap(book=>['tokens.css','layout.css','navigation.css','content.css','popups.css'].map(file=>`books/${book}/styles/${file}`)),
  'books/shared/navigation-targets.js','books/shared/datasheet-layout.js','books/shared/datasheet-system.css','books/shared/popup-content.js','books/shared/glossary-autolink.js','books/shared/roster-parser.js','books/shared/roster-enhancements.js',
  ...['death-guard','adeptus-mechanicus'].flatMap(book=>['data.js','navigation-controller.js','popup-controller.js','journey-controller.js','ui-controllers.js','app.js'].map(file=>`books/${book}/scripts/${file}`)),
  'books/death-guard/mobile/mobile.css','books/death-guard/mobile/mobile.js','books/death-guard/mobile/related-rules.inc',
  'books/death-guard/scripts/view-router.js','books/death-guard/scripts/roster-filter.js','books/death-guard/scripts/related-rules.js','books/death-guard/scripts/full-entry-controller.js',
  ...coreReaderFiles,
  'glossary/viewer.css','glossary/viewer-profiles.css','glossary/viewer-progressive.css','glossary/viewer.js'
].filter(file=>fs.existsSync(path.join(root,file)));
const cacheRevision=hash(JSON.stringify({glossary:runtimePayload.contentHash,files:cacheInputs.map(file=>[file,hash(fs.readFileSync(path.join(root,file)))])})).slice(0,16);
fs.writeFileSync(path.join(glossaryRoot,'generated','cache-revision.js'),`self.WH40K_CACHE_REVISION='${cacheRevision}';\n`);
console.log(`Mega Glossary: ${registry.size} terms, ${Object.keys(aliases).length} aliases, ${variants.length} resolved variants, ${aliasCandidates.length} title collisions.`);
