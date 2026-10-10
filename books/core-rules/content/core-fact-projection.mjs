import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createEffectiveCoreCatalog} from './effective-core-catalog.mjs';
import {sourceConflictNotice} from '../../shared/canonical-content-v2/effective-content.mjs';

const coreRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const defaultRepoRoot=path.resolve(coreRoot,'..','..');
const defaultContentRoot=path.join(defaultRepoRoot,'books','core-rules','content');
const loadWindow=file=>{const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file});return sandbox.window;};
const readJson=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const slug=value=>String(value).toLowerCase().replace(/[‘’']/g,'').replace(/\[[^\]]+\]/g,match=>match.slice(1,-1)).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const normalTitle=value=>slug(value).replace(/-+/g,'-');
const clean=value=>String(value||'').replace(/\be\.g\./gi,match=>match[0][0]==='E'?'For example':'for example').replace(/\r/g,'').replace(/\n-\n/g,'-').replace(/[ \t]*\n[ \t]*/g,' ').replace(/([A-Za-z])\s+-\s+([A-Za-z])/g,'$1-$2').replace(/\s*▪\s*/g,'\n• ').replace(/[ \t]{2,}/g,' ').trim();
const cleanRuleText=value=>String(value||'').replace(/\be\.g\./gi,match=>match[0][0]==='E'?'For example':'for example').replace(/\r/g,'').split('\n').map(line=>line.replace(/[ \t]{2,}/g,' ').trim()).filter(Boolean).join('\n');
const concise=(value,max=280)=>{const text=clean(value).replace(/\s+/g,' ').trim();if(text.length<=max)return text;const slice=text.slice(0,max-1),sentence=Math.max(slice.lastIndexOf('. '),slice.lastIndexOf('; '),slice.lastIndexOf(': ')),end=sentence>=120?sentence+1:slice.lastIndexOf(' ');return `${slice.slice(0,end>0?end:max-1).trim()}…`;};
const escapeRegExp=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

export const CORE_GLOSSARY_EXCLUDED_CODES=new Set(['03.03.01']);
export const DIGITAL_CORE_TITLE_OVERRIDES=Object.freeze({'24.37.01':'Torrent Restrictions'});
const defaultIdentities=readJson(path.join(defaultContentRoot,'core-identities.v1.json'));
export const DIGITAL_CANONICAL_CORE_IDS=Object.freeze({...defaultIdentities.rules});
export const canonicalCoreRuleId=(rule,identityRegistry=defaultIdentities)=>{
  const id=rule.id||identityRegistry.sourceNodes?.[rule.sourceNode?.anchor]?.id||identityRegistry.rules?.[rule.code];
  if(!id)throw new Error(`Missing stable Core identity for ${rule.code}`);
  return id;
};

// A source citation is not an identity when separate source nodes reuse it.
const uniqueCodeMap=records=>new Map(records.filter(record=>records.filter(other=>other.code===record.code).length===1).map(record=>[record.code,record]));

export function createCoreFactProjection({repoRoot=defaultRepoRoot}={}){
  const contentRoot=path.join(repoRoot,'books','core-rules','content');
  const catalog=createEffectiveCoreCatalog({root:contentRoot});
  const coreData=loadWindow(path.join(contentRoot,'core-rules.en.js')).CORE_RULES;
  const coreSource=loadWindow(path.join(contentRoot,'core-rules.source.en.js')).CORE_PDF_SOURCE;
  const identities=catalog.identityRegistry;
  const coreRules=[];
  for(const [sectionId,rules] of Object.entries(coreSource.rules))for(const rule of rules)coreRules.push({...rule,sectionId});
  const coreByTitle=new Map(coreRules.map(rule=>[normalTitle(rule.title),rule]));
  const coreIdByCode=new Map([...uniqueCodeMap(catalog.mainRules)].map(([code,rule])=>[code,rule.id]));
  const digitalCoreId=rule=>canonicalCoreRuleId(rule,identities);
  const digitalTitle=rule=>DIGITAL_CORE_TITLE_OVERRIDES[rule.code]||rule.title.replace(/^\d+\.\s*/, '');
  const coreSections=[coreData.introduction,...coreData.groups.flatMap(group=>group.sections)];
  const coreSectionByNumber=new Map(coreSections.filter(section=>section.number).map(section=>[section.number.padStart(2,'0'),section.id]));
  const terms=new Map(),aliases={};
  for(const rule of catalog.mainRules){
    if(CORE_GLOSSARY_EXCLUDED_CODES.has(rule.code))continue;
    const text=sourceConflictNotice(rule)||rule.semanticContent;
    terms.set(rule.id,{id:rule.id,code:rule.code,kind:rule.kind==='stratagem'?'stratagem':rule.code.startsWith('24.')?'core-ability':'core-rule',title:digitalTitle(rule),summary:concise(text),definition:cleanRuleText(text),aliases:[],canonicalSource:{documentId:'core-rules',revision:'11e',locator:rule.code},...(rule.fullRulePath?{fullRulePath:rule.fullRulePath}:{})});
  }
  for(const [localId,entry] of Object.entries(coreData.terms)){
    const identity=identities.concepts[localId];
    if(!identity)throw new Error(`Missing explicit Core concept identity: ${localId}`);
    aliases[localId]=identity.id;
    if(identity.ownerCode)continue;
    const owner=catalog.concepts.find(record=>record.id===identity.id);
    terms.set(identity.id,{id:identity.id,kind:'core-concept',title:entry.title,summary:concise(owner.semanticContent),definition:clean(owner.semanticContent),aliases:[],canonicalSource:{documentId:'core-rules',revision:'11e',locator:entry.rule}});
  }
  for(const concept of catalog.concepts.filter(record=>record.relationships.sourceRuleId)){
    const owner=catalog.mainRules.find(record=>record.id===concept.relationships.sourceRuleId);
    terms.set(concept.id,{id:concept.id,code:owner.code,kind:'core-concept',title:concept.title,summary:concise(concept.semanticContent),definition:cleanRuleText(concept.semanticContent),aliases:[],canonicalSource:{documentId:'core-rules',revision:'11e',locator:owner.code}});
  }
  for(const rule of catalog.mainRules){
    if(CORE_GLOSSARY_EXCLUDED_CODES.has(rule.code))continue;
    const term=terms.get(rule.id);if(!term)throw new Error(`Missing canonical Core fact ${rule.code}`);
    term.title=digitalTitle(rule);term.kind=rule.kind==='stratagem'?'stratagem':rule.code.startsWith('24.')?'core-ability':'core-rule';
    const text=sourceConflictNotice(rule)||rule.semanticContent;
    const definition=rule.code==='03.03'?text.split('\nWHAT IS COHERENCY?')[0]:text;
    term.definition=cleanRuleText(definition);term.summary=concise(text);
    term.canonicalSource={documentId:'core-rules',revision:'11e',locator:rule.code};
    if(rule.fullRulePath)term.fullRulePath=rule.fullRulePath;
  }
  for(const [alias,target] of Object.entries(catalog.aliases))if(target&&alias!==target)aliases[alias]=target;
  const coreTermsByCode=new Map([...terms.values()].filter(term=>term.code&&catalog.getByCode(term.code)).map(term=>[term.code,term]));
  const coreCodes=[...coreTermsByCode.keys()].sort((left,right)=>right.length-left.length||left.localeCompare(right));
  const sectionReferences=new Map([
    ['16.00',{label:'Actions',term:coreTermsByCode.get('16.01')}],
    ['23.00',{label:'Aircraft',term:coreTermsByCode.get('23.01')}],
    ['17.00',{label:'Monsters and Vehicles',term:coreTermsByCode.get('17.01')}],
    ['20.00',{label:'Strategic Reserves',term:coreTermsByCode.get('20.01')}],
    ['18.00',{label:'Transports',term:coreTermsByCode.get('18.01')}]
  ]);
  const humanizeCoreReferences=value=>{
    let text=clean(value);
    for(const code of coreCodes){
      const title=coreTermsByCode.get(code)?.title;if(!title)continue;
      const codePattern=escapeRegExp(code),titlePattern=escapeRegExp(title);
      text=text.replace(new RegExp(`\\[?(${titlePattern})\\]?(\\s+rule)?\\s*\\(${codePattern}\\)`,'gi'),'$1$2').replace(new RegExp(`\\[?(${titlePattern})\\]?\\s+${codePattern}(?=$|[^0-9])`,'gi'),'$1').replace(new RegExp(`\\(${codePattern}\\)`,'g'),`(${title})`).replace(new RegExp(`(^|[^0-9.])${codePattern}(?=$|[^0-9.])`,'g'),(_,prefix)=>`${prefix}${title}`);
    }
    for(const [code,{label}] of sectionReferences){
      const codePattern=escapeRegExp(code),labelPattern=escapeRegExp(label);
      text=text.replace(new RegExp(`(${labelPattern})\\s+${codePattern}(?=$|[^0-9])`,'gi'),'$1').replace(new RegExp(`(^|[^0-9.])${codePattern}(?=$|[^0-9.])`,'g'),(_,prefix)=>`${prefix}${label}`);
    }
    return text.replace(/\s*\((?:03|04|05|15|16|24)\)/g,'').replace(/\bRevived Revived and Adding Models to a Unit\b/g,'Revived and Adding Models to a Unit');
  };
  for(const term of terms.values()){
    if(term.summary)term.summary=concise(humanizeCoreReferences(term.summary));
    if(term.definition)term.definition=humanizeCoreReferences(term.definition);
    term.aliases=Object.entries(aliases).filter(([,target])=>target===term.id).map(([alias])=>alias).filter(alias=>alias!==term.id).sort();
  }
  const coreAbilities=[...terms.values()].filter(term=>term.kind==='core-ability').sort((left,right)=>left.id.localeCompare(right.id));
  const abilityIdentityTerms=[...coreAbilities,...['core-attached-unit','core-bodyguard'].map(id=>terms.get(id)).filter(Boolean)].sort((left,right)=>left.id.localeCompare(right.id));
  return Object.freeze({catalog,terms:Object.freeze([...terms.values()].map(term=>Object.freeze(term))),coreAbilities:Object.freeze(coreAbilities),abilityIdentityTerms:Object.freeze(abilityIdentityTerms),aliases:Object.freeze(aliases),coreRules:Object.freeze(coreRules),coreDigital:Object.freeze({meta:catalog.presentation.baseMeta,images:catalog.presentation.images,records:catalog.mainRules,universalRulesUpdates:catalog.universalUpdates}),coreUniversalUpdates:catalog.universalUpdates,coreData,coreSource,coreByTitle,coreIdByCode,digitalCoreId,digitalTitle,coreSectionByNumber});
}
