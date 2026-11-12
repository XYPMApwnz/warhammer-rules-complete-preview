/** Build-time book capabilities. These descriptors route existing producers;
 * they do not own or transform gameplay facts. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const BOOK_PASSPORT_IDS=Object.freeze(['space-marines','blood-angels','dark-angels',
  'adeptus-mechanicus','chaos-space-marines','death-guard','tau-empire','tyranids','emperors-children']);
const defaultRoot=fileURLToPath(new URL('../../../',import.meta.url));
const object=fields=>({type:'object',fields}),array=items=>({type:'array',items});
const enumeration=(...values)=>({type:'enum',values});
const nullable=rule=>({type:'nullable',rule});
const file={type:'path'},producer={type:'producer'},text={type:'string'},boolean={type:'boolean'};
const step=object({book:text,producer,args:array(text),runtime:enumeration('node','python'),outputs:array(file)});
export const bookPassportSchema=object({
  schema:enumeration('army-book-passport/v1'),edition:text,
  sources:object({enrollment:file,effective:file,manifest:file,inputs:array(object({role:text,path:file}))}),
  build:object({steps:array(step),postBuildSteps:array(object({phase:enumeration('model-aliases','retained-source'),step}))}),
  qa:object({script:text}),
  mfm:object({capture:file,identityRegistry:file,bindingPath:nullable(file),scope:text}),
  runtime:object({executionArtifact:file,conditionArtifact:file}),
  canonical:object({enhancementIdentity:object({strategy:enumeration('item-id','source-id','owner-record'),builtInExact:boolean})}),
  modelNames:object({enabled:boolean,artifact:file,metadata:object({mode:enumeration('embedded','aliases-file','module-export'),path:nullable(file),exportName:nullable(text)}),sourceDocument:nullable(file),joins:nullable(file)}),
  official:object({input:nullable(file),stage:enumeration('canonical-facts','source-corpus')}),
  inheritance:object({owners:array(text)}),publication:object({manifest:file}),
  audit:object({conditionSchemas:array(file),originalSchema:object({mode:enumeration('embedded-only','literal','frozen-json','state-factory','upgrade-and-events','source-choice'),sourcePath:nullable(file),auxiliaryPath:nullable(file),constantName:nullable(text)}),fieldExports:array(object({path:file,exportName:text,anchor:text})),dynamicPhysicalChoices:boolean})
});
// Existing consumer-specific config fields remain in place during this routing
// migration. Unknown top-level fields are rejected rather than silently ignored.
const configFields=new Set(['armyRuleBindings','armyRuleTermIds','assetVersions','classifiedAbilityPresentation','codexSourceLabel','compactSharedAbilities','compatibleRulesEnhancementAliases','coverImage','currentDatasheetsOnly','customApp','datasheetCategoryLabels','datasheetTransportProfileIds','dedicatedMobile','dependencies','dependencyDatasheets','dependencyDetachments','detachmentChapterRestrictionsById','detachmentOrder','detachmentQualifiedEnhancementPoints','edition','effectiveModel','enhancementOwnerAliases','entryCoverImage','entryRoute','expected','factionKeyword','generatedMobile','generatedOutputs','glossaryV2CompatibilityTerms','id','includeCoreStratagems','legacyRelatedRuleAttributes','localAssetVersions','mark','mobileRelatedRulesSource','pointEnhancementAliases','relatedRulesOwnership','relationTargetDispositions','renderSupportRelations','renderTransportRelations','reviewEntry','rosterCatalog','rosterSupport','schema','sharedArmyBookApp','shortTitle','sources','title','unitCompatibleChapterKeywords','passport']);

export function readBookPassport(bookId,{root=defaultRoot,config}={}) {
  const fail=(field,message)=>{throw Error(`Book passport ${bookId}: ${field}: ${message}`);};
  if(!BOOK_PASSPORT_IDS.includes(bookId))fail('id','unregistered public Army Book');
  root=path.resolve(root);
  config??=JSON.parse(fs.readFileSync(path.join(root,'books',bookId,'book.config.json'),'utf8'));
  for(const key of Object.keys(config))if(!configFields.has(key))fail(key,'unknown field');
  for(const key of ['schema','id','title','factionKeyword','rosterCatalog','expected','sources','generatedOutputs','passport'])
    if(!Object.hasOwn(config,key))fail(key,'required field is missing');
  if(config.id!==bookId)fail('id','config owner does not match requested book');
  const validate=(value,rule,field)=>{
    if(rule.type==='nullable'){if(value!==null)validate(value,rule.rule,field);return;}
    if(rule.type==='object'){
      if(!value||typeof value!=='object'||Array.isArray(value))fail(field,'expected object');
      for(const key of Object.keys(value))if(!Object.hasOwn(rule.fields,key))fail(field+'.'+key,'unknown field');
      for(const [key,child]of Object.entries(rule.fields)){if(!Object.hasOwn(value,key))fail(field+'.'+key,'required field is missing');validate(value[key],child,field+'.'+key);}return;
    }
    if(rule.type==='array'){if(!Array.isArray(value))fail(field,'expected array');value.forEach((item,index)=>validate(item,rule.items,`${field}[${index}]`));return;}
    if(rule.type==='enum'){if(!rule.values.includes(value))fail(field,'unknown value '+JSON.stringify(value));return;}
    if(rule.type==='boolean'){if(typeof value!=='boolean')fail(field,'expected boolean');return;}
    if(typeof value!=='string'||!value.trim())fail(field,'expected non-empty string');
    if(rule.type==='path'||rule.type==='producer'){
      if(path.posix.isAbsolute(value)||value.includes('\\')||value.split('/').some(x=>!x||x==='.'||x==='..')||!/^(books|tools|mfm|glossary)\//.test(value))fail(field,'unsafe repository path');
      if(rule.type==='producer'){
        if(!/\.(mjs|py)$/.test(value)||!fs.existsSync(path.join(root,value))||!fs.statSync(path.join(root,value)).isFile())fail(field,'unknown build path '+value);
      }
    }
  };
  validate(config.passport,bookPassportSchema,'passport');
  const p=config.passport;
  const scripts=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).scripts;
  if(!Object.hasOwn(scripts,p.qa.script))fail('passport.qa.script','unknown QA script '+p.qa.script);
  if(!p.build.steps.length)fail('passport.build.steps','at least one producer is required');
  const owned=new Set();
  for(const s of [...p.build.steps,...p.build.postBuildSteps.map(x=>x.step)]){
    if(s.book!==bookId)fail('passport.build.steps.book','producer belongs to another book');
    if(!s.producer.startsWith(`books/${bookId}/`)&&!s.producer.startsWith('books/shared/tools/'))fail('passport.build.steps.producer','producer belongs to another book');
    if(!s.outputs.length)fail('passport.build.steps.outputs','at least one output is required');
    if((s.runtime==='python')!==s.producer.endsWith('.py'))fail('passport.build.steps.runtime','runtime does not match producer');
    for(const output of s.outputs){if(!output.startsWith(`books/${bookId}/`))fail('passport.build.steps.outputs','output belongs to another book');if(owned.has(output))fail('passport.build.steps.outputs','duplicate output '+output);owned.add(output);}
  }
  if(p.modelNames.enabled){
    if(p.modelNames.sourceDocument===null||p.modelNames.joins===null)fail('passport.modelNames','enabled aliases require sourceDocument and joins');
  }
  const metadata=p.modelNames.metadata;
  if(metadata.mode==='embedded'?(metadata.path!==null||metadata.exportName!==null):metadata.path===null)
    fail('passport.modelNames.metadata','metadata mode and path disagree');
  if(metadata.mode==='module-export'&&metadata.exportName===null)fail('passport.modelNames.metadata.exportName','module export is required');
  return structuredClone(p);
}
