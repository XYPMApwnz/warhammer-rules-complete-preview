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
const clean=value=>String(value||'').replace(/\r/g,'').replace(/\n-\n/g,'-').replace(/[ \t]*\n[ \t]*/g,' ').replace(/([A-Za-z])\s+-\s+([A-Za-z])/g,'$1-$2').replace(/\s*▪\s*/g,'\n• ').replace(/[ \t]{2,}/g,' ').trim();
const concise=(value,max=280)=>{
  const text=clean(value).replace(/\s+/g,' ').trim();
  if(text.length<=max)return text;
  const slice=text.slice(0,max+1);
  const sentence=Math.max(slice.lastIndexOf('. '),slice.lastIndexOf('; '),slice.lastIndexOf(': '));
  const end=sentence>=120?sentence+1:slice.lastIndexOf(' ');
  return `${slice.slice(0,end>0?end:max).trim()}…`;
};
const hash=value=>createHash('sha256').update(value).digest('hex');

const dgSource=readJson(path.join(root,'books','death-guard','content','death-guard-rules.en.json'));
const dgRuntime=loadWindow(path.join(root,'books','death-guard','scripts','data.js')).DG_TERMS;
const amRuntime=loadWindow(path.join(root,'books','adeptus-mechanicus','scripts','data.js')).DG_TERMS;
const coreCurated=loadWindow(path.join(root,'books','core-rules','content','core-rules.en.js')).CORE_RULES.terms;
const coreSource=loadWindow(path.join(root,'books','core-rules','content','core-rules.source.en.js')).CORE_PDF_SOURCE;
const resolutions=readJson(path.join(glossaryRoot,'resolutions.en.json'));
const keywordLinks=readJson(path.join(glossaryRoot,'keyword-links.en.json'));
const coreQuickReferences=readJson(path.join(glossaryRoot,'core-quick-reference.en.json'));

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
    definition:{en:clean(entry.full||entry.short||runtime.summary)},
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
  if(!registry.has(id))addTerm({id,kind:localId.startsWith('weapon-')?'weapon':'faction-term',scope:localId.startsWith('core-')?'global':'adeptus-mechanicus',edition:'11e',language:'en',title:{en:entry.title},summary:{en:concise(entry.summary)},definition:{en:clean(entry.summary)},aliases:[localId],related:[],canonicalSource:{documentId:'adeptus-mechanicus',revision:'prototype',locator:entry.rule||entry.datasheet||localId},status:'provisional'},'adeptus-mechanicus',localId);
  else{
    if(localId!==id)aliases[localId]=id;
    if(clean(registry.get(id).summary.en)!==clean(entry.summary))variants.push({termId:id,selectedSource:registry.get(id).canonicalSource.documentId,rejectedSource:'adeptus-mechanicus',selectedDefinition:registry.get(id).summary.en,rejectedDefinition:entry.summary,status:'resolved-by-policy'});
  }
  addContext('adeptus-mechanicus',localId,id,entry,resolved?{parameters:resolved.parameters}:{});
}

// Some Core abilities delegate their actual effect to another numbered rule.
// Their glossary entries must remain useful on their own instead of merely
// repeating that cross-reference (for example, [ASSAULT] -> Assault Shooting).
for(const [id,reference] of Object.entries(coreQuickReferences)){
  const term=registry.get(id);
  if(!term)throw new Error(`Unknown Core quick-reference term: ${id}`);
  term.summary={en:concise(reference.summary)};
  term.definition={en:clean(reference.definition)};
  term.summarySource={documentId:'core-rules',kind:'curated-operational-reference'};
  term.canonicalSource={...term.canonicalSource,locator:reference.sourceLocator||term.canonicalSource.locator};
}

for(const [alias,target] of Object.entries({...aliases}))if(aliases[target])aliases[alias]=aliases[target];
for(const term of registry.values()){
  term.aliases=[...new Set([...(term.aliases||[]),...Object.entries(aliases).filter(([,target])=>target===term.id).map(([alias])=>alias)])].filter(alias=>alias!==term.id).sort();
  term.mentions=[...new Set((term.mentions||[]).map(value=>aliases[value]||value).filter(value=>registry.has(value)))];
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

const aliasCandidates=[...titleIndex.entries()].filter(([,ids])=>new Set(ids).size>1).map(([normalizedTitle,ids])=>({normalizedTitle,termIds:[...new Set(ids)],status:'review-required'}));
const registryDocument={schema:1,language:'en',generatedAt:new Date().toISOString(),terms:Object.fromEntries([...registry].sort(([a],[b])=>a.localeCompare(b)))};
const contextDocuments={};
for(const [bookId,records] of Object.entries(contexts))contextDocuments[bookId]={schema:1,bookId,terms:records};
const report={schema:1,generatedAt:registryDocument.generatedAt,counts:{terms:registry.size,aliases:Object.keys(aliases).length,variants:variants.length,aliasCandidates:aliasCandidates.length,keywordCandidates:keywordCandidates.length},variants,aliasCandidates,keywordCandidates};

writeJson(path.join(glossaryRoot,'registry.en.json'),registryDocument);
writeJson(path.join(glossaryRoot,'aliases.en.json'),{schema:1,language:'en',aliases});
for(const [bookId,document] of Object.entries(contextDocuments))writeJson(path.join(glossaryRoot,'contexts',`${bookId}.json`),document);
writeJson(path.join(glossaryRoot,'generated','conflict-report.json'),report);

const runtimePayload={schema:1,language:'en',contentHash:hash(JSON.stringify({registryDocument,contexts:contextDocuments,aliases})),terms:registryDocument.terms,aliases,contexts:Object.fromEntries(Object.entries(contextDocuments).map(([id,value])=>[id,value.terms]))};
const runtime=`(function(){'use strict';\nconst data=${JSON.stringify(runtimePayload)};\nfunction resolve(id){return data.aliases[id]||id;}\nfunction view(term,nav){return Object.freeze({title:term.title.en,summary:(term.summary&&term.summary.en)||term.definition.en,definition:term.definition.en,related:term.related||[],mentions:term.mentions||[],source:term.canonicalSource,status:term.status,...(nav||{})});}\nfunction forBook(bookId){const result={};const local=data.contexts[bookId]||{};for(const [id,term] of Object.entries(data.terms))result[id]=view(term,local[id]&&local[id].navigation);for(const [localId,context] of Object.entries(local)){const id=resolve(context.termId);if(data.terms[id])result[localId]=view(data.terms[id],context.navigation);}return Object.freeze(result);}\nwindow.WH40K_GLOSSARY=Object.freeze({schema:data.schema,language:data.language,contentHash:data.contentHash,resolve,get(id){return data.terms[resolve(id)]||null;},forBook,counts:Object.freeze({terms:Object.keys(data.terms).length,aliases:Object.keys(data.aliases).length})});\n}());\n`;
fs.writeFileSync(path.join(glossaryRoot,'generated','glossary.en.js'),runtime);
console.log(`Mega Glossary: ${registry.size} terms, ${Object.keys(aliases).length} aliases, ${variants.length} resolved variants, ${aliasCandidates.length} title collisions.`);
