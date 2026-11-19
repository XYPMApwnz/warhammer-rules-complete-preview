/** Read the actual native roster inputs without building a book or deciding its coverage.
 * Logical source identities are discovered from the current tree. Coverage decisions
 * belong to a separate reviewed registry, never this extractor or a frozen CSV.
 */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';

export const NATIVE_INVENTORY_SCHEMA='native-markup-inventory/v1';
const defaultRoot=fileURLToPath(new URL('../../',import.meta.url));
const copy=structuredClone;
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'
  ?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
export const inventoryFingerprint=value=>createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const at=(value,field)=>field.reduce((node,key)=>node?.[key],value);
const prefix=(a,b)=>a.every((part,index)=>part===b[index]);
const overlap=(a,b)=>prefix(a,b)||prefix(b,a);
const title=entity=>entity?.data?.title||entity?.data?.name||entity?.displayName||entity?.data?.label||entity?.id;
const pointer=field=>'/'+field.map(part=>String(part).replaceAll('~','~0').replaceAll('/','~1')).join('/');
const fail=(book,id,message)=>{throw new TypeError(`Native markup inventory ${book} · ${id}: ${message}`);};
const structuralSections=new Set(['UNIT COMPOSITION','LEADER','TRANSPORT','SUPPORT','ATTACHED UNIT','BODYGUARD','INDEPENDENT POWER']);
const smFactories=Object.freeze({'space-marines':'createSpaceMarinesRosterRuntime','blood-angels':'createBloodAngelsRosterRuntime','dark-angels':'createDarkAngelsRosterRuntime'});
const blockFormats=new Set(['adeptus-mechanicus','death-guard','tau-empire']);
const semanticFormats=new Set(['tyranids','emperors-children','chaos-space-marines']);
// These are source-identified logical child rules, not coverage decisions. Each
// identity and heading is checked against the live source and native clause.
const namedComponents=Object.freeze({
 'detachment-haloscreed-battle-clade:rule':[['electromotive','Electromotive Energisation'],['microactuator','Microactuator Bracing'],['predation','Predation Protocols'],['muted-servomotors','Muted Servomotors']],
 'detachment-data-psalm-conclave:rule':[['panegyric-procession','Panegyric Procession'],['citation-in-savagery','Citation in Savagery']],
 'detachment-lords-of-the-forge:rule':[['baffling-data-screed','Baffling Data Screed']],
 'detachment-cohort-acquisitus:rule':[['enhanced-augurs-selection','Enhanced Augurs']],
 'detachment-auxiliary-cadre:rule':[['detachment-auxiliary-cadre:rule#harnessed-alien-instincts','Harnessed Alien Instincts'],['detachment-auxiliary-cadre:rule#localised-stealth-projectors','Localised Stealth Projectors (Aura)']]
});
// A new native kind requires an explicit denominator decision. In particular it
// cannot disappear merely because an older extractor did not recognize its name.
const knownKinds=new Set(['ALLIED_POINTS_DEPENDENCY','ARMY_RULE','ARMY_RULE_COMPONENT','ATTACHMENT_DECLARATION','ATTACHMENT_RELATION','BOOK_USAGE','BOOK_USAGE_RULES','COMPOSITION_MEMBER','DATASHEET','DATASHEET_ABILITY','DATASHEET_SECTION','DETACHMENT','DETACHMENT_ROSTER_METADATA','DETACHMENT_RULE','ENHANCEMENT','ENHANCEMENT_COST_QUALIFIERS','EQUIPMENT_ABILITY','EQUIPMENT_RULE','ERRATA','FACTION_KEYWORD','FAQ','INVULNERABLE_SAVE','KEYWORD_MEMBERSHIP','KEYWORD_SCOPES','MODEL_BASE','MODEL_BASE_METADATA','NAMED_RULE_COMPONENT','NO_WARGEAR_OPTIONS','OFFICIAL_UPDATE','PAID_WARGEAR_COST','POINTS_SCHEDULE_ROW','PROFILE','RULE_REFERENCE','SOURCE_CONFLICT','SOURCE_ERRATUM','SOURCE_PRESENTATION_NOTE','SOURCE_RELATION','SOURCE_UPDATE_REFERENCE','SPECIAL_DATASHEET_RULE','STRATAGEM','STRUCTURED_RULE_TABLE','SUPPLEMENTAL_DATASHEET_RULE','TRANSPORT_DECLARATION','UNIT_COMPOSITION','UPGRADE_DECLARATION','UPGRADE_OPTION','WARGEAR_FOOTNOTE','WARGEAR_OPTION','WEAPON_ABILITY','WEAPON_PROFILE','WEAPON_PROFILE_SELECTION']);
const ruleBearingKinds=new Set(['ARMY_RULE','ARMY_RULE_COMPONENT','DATASHEET_ABILITY','DATASHEET_SECTION','DETACHMENT_RULE','ENHANCEMENT','EQUIPMENT_ABILITY','EQUIPMENT_RULE','NAMED_RULE_COMPONENT','RULE_REFERENCE','SPECIAL_DATASHEET_RULE','STRATAGEM','STRUCTURED_RULE_TABLE','SUPPLEMENTAL_DATASHEET_RULE','UPGRADE_DECLARATION','UPGRADE_OPTION','WARGEAR_FOOTNOTE','WARGEAR_OPTION','WEAPON_ABILITY']);
const omittedSourceKeys=new Set(['provenance','sourceRefs','sourceBindings','fieldProvenance','sourceEvidence','executable','conditionalOnly']);
const omittedCapabilityKeys=new Set(['evidence','sourceEvidence','sourceRefs','sourceBindings','fieldProvenance','provenance','currentness','sourceText','sourceContent','effectSummary','rosterClassificationNote','reason','note','reviewNote','explanation']);
const capabilityValue=value=>Array.isArray(value)?value.map(capabilityValue):value&&typeof value==='object'
 ?Object.fromEntries(Object.entries(value).filter(([key])=>!omittedCapabilityKeys.has(key)).map(([key,item])=>[key,capabilityValue(item)])):value;
const sourceValue=value=>Array.isArray(value)?value.map(sourceValue):value&&typeof value==='object'
 ?Object.fromEntries(Object.entries(value).filter(([key])=>!omittedSourceKeys.has(key)).map(([key,item])=>[key,sourceValue(item)])):value;
function textualFields(value,field=[],result=[]){
 if(typeof value==='string'){
  const last=field.at(-1),stringsInTable=field[0]==='rows';
  if(value.trim()&&(stringsInTable||['text','title','name','label','semanticContent','eligibilityText','restriction'].includes(last)))result.push(field);
 }else if(Array.isArray(value))value.forEach((item,index)=>textualFields(item,[...field,index],result));
 else if(value&&typeof value==='object')for(const [key,item]of Object.entries(value))if(!omittedSourceKeys.has(key))textualFields(item,[...field,key],result);
 return result;
}
function factualLeaves(value,field=[],result=[]){
 if(value&&typeof value==='object'){
  const entries=Array.isArray(value)?value.map((item,index)=>[index,item]):Object.entries(value).filter(([key])=>!omittedSourceKeys.has(key));
  if(!entries.length)result.push({field,type:Array.isArray(value)?'array':'object',fingerprint:inventoryFingerprint(Array.isArray(value)?[]:{})});
  else for(const [key,item]of entries)factualLeaves(item,[...field,key],result);
 }else result.push({field,type:value===null?'null':typeof value,fingerprint:inventoryFingerprint(value??null)});
 return result;
}
const leaves=value=>{
 if(!value||typeof value!=='object')return [];
 const result=value.predicate?[value]:[];
 for(const child of Object.values(value))if(child&&typeof child==='object')result.push(...(Array.isArray(child)?child.flatMap(leaves):leaves(child)));
 return result;
};
const unique=values=>[...new Map(values.map(value=>[JSON.stringify(stable(value)),value])).values()];

/** Exposes metadata for every current source owner, including excluded containers.
 * A checker can distinguish a removed rule from a lost field on a surviving owner.
 */
export function sourceSnapshot(entity){
 const fields=textualFields(entity.data||{}).map(field=>({field,valueFingerprint:inventoryFingerprint(sourceValue(at(entity.data,field))),type:typeof at(entity.data,field)}));
 const factualData=sourceValue(entity.data||{}),dataFingerprint=inventoryFingerprint(factualData),shape=factualLeaves(factualData);
 return {id:entity.id,kind:entity.kind,parentId:entity.parentId||entity.ownerId||null,name:title(entity),fields,dataFingerprint,shape,
  fingerprint:inventoryFingerprint({kind:entity.kind,parentId:entity.parentId||entity.ownerId||null,name:title(entity),dataFingerprint})};
}

/** No builds, tests, browser or roster scenarios. The SM-family native constructor
 * getter supplies its actual prepared template; other books' browser entrypoints
 * consume the passport's final execution artifact directly. Source/consumer code
 * and all read JSON are separately fingerprinted as binding evidence.
 */
export async function collectNativeInventory({root=defaultRoot}={}){
 root=path.resolve(root);
 const inputs=new Map(),moduleVisited=new Set();
 const record=(relative,role)=>{
  relative=relative.replaceAll('\\','/');
  const absolute=path.resolve(root,relative);
  if(!absolute.startsWith(root+path.sep))throw new TypeError('Native markup inventory path outside root: '+relative);
  const bytes=fs.readFileSync(absolute),previous=inputs.get(relative);
  inputs.set(relative,{path:relative,sha256:sha(bytes),bytes:bytes.length,roles:[...new Set([...(previous?.roles||[]),role])].sort()});return bytes;
 };
 const text=(relative,role='consumer')=>record(relative,role).toString('utf8');
 const json=(relative,role='review')=>JSON.parse(text(relative,role).replace(/^\uFEFF/,''));
 const moduleGraph=relative=>{
  if(moduleVisited.has(relative))return;moduleVisited.add(relative);
  const content=text(relative,'native-module');
  const imports=[...content.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)['"]([^'"]+)['"]/g)].map(match=>match[1]).filter(spec=>spec.startsWith('.'));
  for(const spec of imports){const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(relative),spec));
   if(!fs.existsSync(path.join(root,resolved)))continue;
   if(/\.(?:mjs|js)$/.test(resolved))moduleGraph(resolved);else if(resolved.endsWith('.json'))record(resolved,'native-import');
  }
 };
 const importModule=async relative=>{moduleGraph(relative);return import(pathToFileURL(path.join(root,relative)));};
 const passportModule=await importModule('books/shared/tools/book-passport.mjs');
 const {parseProducerJSON}=await importModule('books/shared/source-refs-v2/producer-io.mjs');
 const recipientModule=await importModule('books/shared/rule-contract-v2/recipients.mjs');
 const {conditionSpec,conditionIdentity}=await importModule('books/shared/rule-contract-v2/conditions.mjs');
 const {findRosterConditionComputation}=await importModule('books/shared/roster-v2/condition-context.mjs');
 const nativeJSON=relative=>parseProducerJSON(text(relative,'native-input'));
 const sharedComputerSource=text('books/shared/roster-v2/condition-computations.mjs');
 const bindingSource=text('books/shared/roster-v2/condition-binding.mjs');
 const operationsSource=text('books/shared/roster-v2/effects.mjs');
 const operationMatch=operationsSource.match(/const operations = new Set\(\[([^\]]+)\]\)/);
 if(!operationMatch)throw new TypeError('Native markup inventory: shared operation vocabulary unavailable');
 const supportedOperations=[...operationMatch[1].matchAll(/'([^']+)'/g)].map(match=>match[1]).sort();
 for(const relative of ['books/shared/source-refs-v2/source-catalog.json','mfm/current.json','package.json'])if(fs.existsSync(path.join(root,relative)))record(relative,'current-registry');
 const rows=[],exclusions=[],books=[],sourceEntities=[],diagnostics=[];
 for(const book of passportModule.BOOK_PASSPORT_IDS){
  const configPath=`books/${book}/book.config.json`,config=json(configPath,'passport');
  const passport=passportModule.readBookPassport(book,{root,config});
  // SM-family browser services load the condition-bearing import product, then
  // their native constructor owns the runtime template. Its passport separately
  // names an execution projection; do not substitute that sibling for the UI input.
  const input=smFactories[book]?passport.runtime.conditionArtifact:passport.runtime.executionArtifact,raw=nativeJSON(input),factoryPath=`books/${book}/v2/${book==='adeptus-mechanicus'?'roster-runtime':'roster-boot'}.mjs`;
  const entrySource=text(factoryPath,'browser-entry');
  if(!entrySource.includes('createBrowserRoster')||!entrySource.includes('./generated/'+path.posix.basename(input)))fail(book,input,'passport execution artifact is not consumed by the native browser entrypoint');
  const entry=await importModule(factoryPath);
  if(typeof entry.createBrowserRoster!=='function')fail(book,factoryPath,'native browser factory is missing');
  let native=raw;
  if(smFactories[book]){
   const runtimePath=`books/${book}/v2/roster-runtime.mjs`,runtime=await importModule(runtimePath);
   if(typeof runtime[smFactories[book]]!=='function')fail(book,runtimePath,'native constructor is missing');
   native=runtime[smFactories[book]](raw).book;
  }
  if(book==='adeptus-mechanicus'){
   const adapter=await importModule('books/adeptus-mechanicus/v2/roster-import.mjs');
   native=adapter.withEquipmentCaptionBindings(raw);
  }
  if(native.bookId!==book||!Array.isArray(native.entities))fail(book,input,'invalid native book');
  const records=new Map(native.entities.map(entity=>[entity.id,entity]));
  if(records.size!==native.entities.length)fail(book,input,'duplicate native source identity');
  const payloadPath=passport.update.reportArtifact,payload=nativeJSON(payloadPath);
  // Exercise only actual input construction, not a fabricated roster or a test
  // service. All requests are fulfilled from this tree and recorded; network,
  // writes and product UI are unavailable to this filesystem transport.
  const nativeReads=new Set();
  const service=await entry.createBrowserRoster({presentation:payload,fetch:async url=>{
   const resource=new URL(url);
   if(resource.protocol!=='file:')fail(book,String(url),'native factory requested a non-local resource');
   const relative=path.relative(root,fileURLToPath(resource)).replaceAll('\\','/');
   if(relative.startsWith('../')||!relative.endsWith('.json'))fail(book,relative,'unexpected native factory resource');
   nativeReads.add(relative);return {ok:true,json:async()=>nativeJSON(relative)};
  }});
  if(!nativeReads.has(input)||typeof service?.import!=='function')fail(book,factoryPath,'native factory did not construct the expected input/service');
  const reviewFiles=['rule-clause-review.json','recipient-enrollment-qa.json','text-rule-review.json','static-gameplay-review.json','contract-datasheet-army-declarations.json','contract-enhancement-detachment-declarations.json','contract-stratagem-declarations.json','contract-construction-declarations.json'];
  const reviewInputs=reviewFiles.map(file=>`books/${book}/v2/${file}`).filter(file=>fs.existsSync(path.join(root,file))).map(file=>({file,value:json(file)}));
  for(const schema of passport.audit.conditionSchemas)moduleGraph(schema);
  const conditionArtifact=passport.runtime.conditionArtifact===input?native:nativeJSON(passport.runtime.conditionArtifact);
  const computations=conditionArtifact.conditionComputations||native.conditionComputations||Object.entries(native.rosterContextBindings||{}).map(([key,value])=>({key,...value}));
  const unitOf=entity=>{let current=entity;const seen=new Set();while(current&&!seen.has(current.id)){if(['DATASHEET','DETACHMENT'].includes(current.kind))return current;seen.add(current.id);current=records.get(current.parentId||current.ownerId);}return null;};
  const exclusion=(entity,reason)=>{
   const snapshot=sourceSnapshot(entity);
   exclusions.push({book,id:entity.id,kind:entity.kind,reason,
    ambiguous:ruleBearingKinds.has(entity.kind),textBearing:snapshot.fields.length>0,
    sourceFingerprint:snapshot.fingerprint,sourceSnapshot:snapshot});
  };
  const descriptors=[];
  const add=(entity,kind,{id=entity.id,name=title(entity),sourceField=[],fields,clauseIds,contractOwner=entity,componentOf=null}={})=>descriptors.push({entity,kind,id,name,sourceField,fields:fields??(sourceField.length?[sourceField]:[]),clauseIds,contractOwner,componentOf});
  for(const entity of native.entities){
   if(!knownKinds.has(entity.kind))fail(book,entity.id,'unknown native entity kind '+entity.kind);
   sourceEntities.push({book,nativeInput:input,...sourceSnapshot(entity)});
   if(smFactories[book]){
    let kind=entity.kind==='DATASHEET_ABILITY'?'ABILITY':entity.kind;
    if(entity.kind==='DATASHEET_SECTION'&&entity.data.wargearAbility)kind='WARGEAR_ABILITY';
    if(entity.kind==='DATASHEET_SECTION'&&String(entity.data.title).toUpperCase()==='SUPREME COMMANDER')kind='ABILITY';
    if(entity.kind==='RULE_REFERENCE'){
     if(entity.data.sourceSection!=='CORE ABILITIES'){exclusion(entity,'Army-reference occurrence; definition counted separately.');continue;}kind='CORE_ABILITY';
    }
    if(['ARMY_RULE','DETACHMENT_RULE','ENHANCEMENT','STRATAGEM','ABILITY','WARGEAR_ABILITY','CORE_ABILITY'].includes(kind))add(entity,kind,{sourceField:textualFields(entity.data||{}),fields:[]});
    else exclusion(entity,'Known structural/factual/source record outside named-rule denominator.');
    continue;
   }
   if(blockFormats.has(book)){
    if(['ARMY_RULE','ARMY_RULE_COMPONENT'].includes(entity.kind)){
     if(entity.kind==='ARMY_RULE'&&entity.data.componentIds?.length)exclusion(entity,'Army aggregate; logical child definitions counted.');else add(entity,'ARMY_RULE',{id:entity.id+(entity.data.text?'#/text':''),sourceField:entity.data.text?['text']:[]});continue;
    }
    if(['DETACHMENT_RULE','ENHANCEMENT','STRATAGEM'].includes(entity.kind)){
     const components=namedComponents[entity.id]||[],ids=components.map(item=>item[0]);
     add(entity,entity.kind,{clauseIds:components.length?(entity.ruleContract?.clauses||[]).filter(clause=>!ids.includes(clause.id)).map(clause=>clause.id):undefined});
     for(const [clauseId,name]of components){
      if(!entity.data.text?.includes(name)||!entity.ruleContract?.clauses.some(clause=>clause.id===clauseId))fail(book,entity.id,'named source component/contract missing: '+name);
      add(entity,entity.kind,{id:entity.id+'#component/'+clauseId,name,sourceField:['text'],fields:[],clauseIds:[clauseId],componentOf:entity.id});
     }continue;
    }
    if(entity.kind==='DATASHEET_SECTION'){
     if(structuralSections.has(entity.data.title)){exclusion(entity,'Structural composition/formation/import declaration.');continue;}
     if(entity.data.blocks?.length)entity.data.blocks.forEach((block,index)=>{
      if(typeof block.text!=='string'||!block.text.trim())return;
      const name=block.text.match(/^([^:\n]{1,150}):\s*/)?.[1]||(entity.data.title==='ABILITIES'?block.text.split('\n')[0].slice(0,150):entity.data.title);
      add(entity,block.wargearAbility?'WARGEAR_ABILITY':'ABILITY',{id:entity.id+'#/blocks/'+index+'/text',name,sourceField:['blocks',index,'text']});
     });else if(entity.data.text)add(entity,'ABILITY',{id:entity.id+'#/text',name:entity.data.title,sourceField:['text']});continue;
    }
    if(entity.kind==='SUPPLEMENTAL_DATASHEET_RULE'){add(entity,'ABILITY');continue;}
    if(entity.kind==='EQUIPMENT_RULE'){add(entity,'WARGEAR_ABILITY');continue;}
    if(entity.kind==='RULE_REFERENCE'){
     if(book==='adeptus-mechanicus')for(const [groupIndex,group]of(entity.data.groups||[]).entries())if(group.label==='CORE ABILITIES')for(const [index,item]of group.entries.entries())add(entity,'CORE_ABILITY',{id:item.id,name:item.label,sourceField:['groups',groupIndex,'entries',index]});
     if(book==='tau-empire')for(const [index,ability]of(native.rosterReferenceSemantics?.[entity.id]?.abilities||[]).entries())if(ability.canonicalId?.startsWith('core-'))add(entity,'CORE_ABILITY',{id:entity.id+'#core/'+index,name:ability.name,sourceField:['label']});
     if(book==='death-guard'){
      const label=entity.data.label||'',start=label.indexOf('CORE ABILITIES'),end=label.indexOf('ARMY RULES',start);
      if(start>=0)for(const [index,name]of label.slice(start+14,end<0?undefined:end).split(',').map(value=>value.trim()).filter(Boolean).entries())add(entity,'CORE_ABILITY',{id:entity.id+'#core/'+index,name,sourceField:['label']});
     }continue;
    }
    exclusion(entity,'Known structural/factual/source record outside named-rule denominator.');continue;
   }
   if(!semanticFormats.has(book))fail(book,input,'unregistered native format adapter');
   let kind;
   if(['ARMY_RULE','ARMY_RULE_COMPONENT'].includes(entity.kind)){
    if(entity.kind==='ARMY_RULE'&&entity.data.componentIds?.length){exclusion(entity,'Army aggregate; logical child definitions counted.');continue;}kind='ARMY_RULE';
   }else if(['DETACHMENT_RULE','ENHANCEMENT','STRATAGEM'].includes(entity.kind))kind=entity.kind;
   else if(entity.kind==='DATASHEET_SECTION'){
    if(structuralSections.has(entity.data.title)){exclusion(entity,'Structural composition/formation/import declaration.');continue;}kind='ABILITY';
   }else if(['DATASHEET_ABILITY','EQUIPMENT_ABILITY','SPECIAL_DATASHEET_RULE','NAMED_RULE_COMPONENT','WEAPON_ABILITY'].includes(entity.kind)){
    if(entity.factOwnerId){exclusion(entity,'Repeated fact occurrence; exact factOwnerId='+entity.factOwnerId);continue;}
    kind=['EQUIPMENT_ABILITY','WEAPON_ABILITY'].includes(entity.kind)||entity.data.wargearAbility?'WARGEAR_ABILITY':'ABILITY';
   }else if(entity.kind==='RULE_REFERENCE'){
    const name=entity.data.label||entity.displayName||entity.id;
    if(entity.data.armyRuleId||native.entities.some(item=>item.kind==='ARMY_RULE'&&(item.data.title||item.displayName)===name)){exclusion(entity,'Army reference occurrence; definition counted separately.');continue;}
    add(entity,'CORE_ABILITY',{name,sourceField:['label']});continue;
   }else {exclusion(entity,'Known structural/factual/source record outside named-rule denominator.');continue;}
   const fields=entity.kind==='DATASHEET_SECTION'?(entity.data.blocks||[]).flatMap((block,index)=>typeof block.text==='string'&&block.text.trim()?[{field:['blocks',index,'text'],text:block.text,wargear:block.wargearAbility,title:block.title}]:[]):
    typeof entity.data.text==='string'?[{field:['text'],text:entity.data.text,wargear:entity.data.wargearAbility}]:
    Array.isArray(entity.data.blocks)?[{field:['blocks'],text:entity.data.blocks.map(block=>block.text||'').join('\n')}]:
    Array.isArray(entity.data.content)?[{field:['content'],text:entity.data.content.map(block=>block.text||'').join('\n')}]:
    Array.isArray(entity.data.lines)?[{field:[],text:entity.data.lines.map(line=>(line.label?line.label+': ':'')+(line.text||'')).join('\n')}]:[];
   if(!fields.length){exclusion(entity,'No independent rule text; logical child source owns the content.');continue;}
   for(const field of fields){
    const name=field.title||((entity.kind==='DATASHEET_SECTION'&&entity.data.title==='ABILITIES')?field.text.match(/^([^:\n]{1,150}):/)?.[1]:null)||title(entity)||field.text.match(/^([^:\n]{1,150}):/)?.[1];
    add(entity,field.wargear?'WARGEAR_ABILITY':kind,{id:entity.kind==='DATASHEET_SECTION'?entity.id+'#'+pointer(field.field):entity.id,name,sourceField:field.field,clauseIds:(entity.ruleContract?.clauses||[]).filter(clause=>!clause.effect?.canonicalTableId&&(!field.field.length||(clause.sourceFields||[]).some(candidate=>overlap(candidate,field.field)))).map(clause=>clause.id)});
   }
  }
  if(semanticFormats.has(book))for(const table of native.entities.filter(entity=>entity.kind==='STRUCTURED_RULE_TABLE'&&records.get(entity.parentId)?.kind==='DETACHMENT_RULE')){
   const parent=records.get(table.parentId),referenced=(parent.ruleContract?.clauses||[]).filter(clause=>clause.effect?.canonicalTableId===table.id);
   if(referenced.length&&referenced.every(clause=>clause.rosterClassification==='NOT_AN_EFFECT')){
    const excluded=exclusions.find(item=>item.book===book&&item.id===table.id);if(excluded)excluded.reason='Native NOT_AN_EFFECT table clauses; parent rule owns this structural lookup table.';continue;
   }
   if(!referenced.length&&!table.ruleContract){
    const excluded=exclusions.find(item=>item.book===book&&item.id===table.id);if(excluded)excluded.reason='Detachment-owned source table has no native contract/reference: ambiguous denominator exclusion requires explicit review.';
    else exclusion(table,'Detachment-owned source table has no native contract/reference: ambiguous denominator exclusion requires explicit review.');continue;
   }
   (table.data.rows||[]).forEach((cells,index)=>{
    if(index===0&&!referenced.length)return;
    const clauses=referenced.length?referenced.filter(clause=>clause.effect.rowIndex===index):(table.ruleContract?.clauses||[]).filter(clause=>clause.sourceFields?.some(field=>field[0]==='rows'&&field[1]===index&&field[2]===1));
    if(!clauses.length)fail(book,table.id,'uncovered non-header table row '+index);
    const text=cells.filter(Boolean).join(' · '),name=text.match(/^([^:\n]{1,100}):/)?.[1]||(cells[0]&&cells[0].length<15?parent.data.title+' — '+cells[0]:parent.data.title+' — table '+table.id.split(':').at(-1)+' / row '+(index+1));
    add(table,'DETACHMENT_RULE',{id:table.id+'#/rows/'+index,name,sourceField:['rows',index],contractOwner:referenced.length?parent:table,clauseIds:clauses.map(clause=>clause.id),componentOf:parent.id});
   });
  }
  for(const descriptor of descriptors){
   const {entity,contractOwner,fields}=descriptor,contract=contractOwner.ruleContract;
   const clauses=(contract?.clauses||[]).filter(clause=>(descriptor.clauseIds===undefined||descriptor.clauseIds.includes(clause.id))&&(!fields.length||clause.sourceFields?.some(field=>fields.some(candidate=>overlap(field,candidate)))));
   // Table clauses point at the parent's canonical table reference, not the row
   // within the independent table entity. Their explicit clause IDs own that join.
   const selectedClauses=contractOwner!==entity?(contract?.clauses||[]).filter(clause=>descriptor.clauseIds.includes(clause.id)):clauses;
   const conditions=unique(leaves({roles:contract?.roles,conditions:contract?.conditions,clauses:selectedClauses}).map(node=>{
    let spec=null,identity=null,computation=null;
    if(node.predicate==='FIELD'){
     spec=conditionSpec(node.arguments);if(spec)identity=conditionIdentity(node.arguments);
     computation=findRosterConditionComputation(conditionArtifact,node)||findRosterConditionComputation(native,node)||null;
    }
    return {predicate:node.predicate,subject:node.subject,contextLevel:node.contextLevel,roleId:node.roleId||null,arguments:copy(node.arguments||{}),evidence:copy(node.evidence||null),identity,spec:copy(spec),declaredComputation:copy(computation),computerImplemented:computation?.kind?sharedComputerSource.includes("case '"+computation.kind+"'"):null};
   }));
   const channels=selectedClauses.flatMap(clause=>['ATTACHED','F1'].flatMap(consumer=>recipientModule.presentationRecipientLinks(contractOwner,clause,{consumer}).map(link=>({consumer,clauseId:clause.id,path:link.path,recipientId:link.recipient.id,recipient:copy(link.recipient),roleId:link.role?.id||null}))));
   const semantic=native.rosterReferenceSemantics?.[entity.id]||null,unit=unitOf(entity);
   const coreBindings=descriptor.kind==='CORE_ABILITY'?(semantic?.abilities||[]).filter(ability=>ability.id===descriptor.id||ability.name===descriptor.name||typeof ability.name==='string'&&descriptor.name.startsWith(ability.name+' ')):[];
   const attachmentPolicies=[...(native.rosterAttachmentPolicies||[]),...(native.mfmImportReferences?.relationDeclarations||[])].filter(policy=>policy.sourceId===unit?.id);
   const equipmentBindings=(native.importBindings?.equipmentSelections||[]).filter(binding=>binding.genericEquipmentId===entity.id||Object.hasOwn(binding.canonicalFieldPaths||{},entity.id));
   const equipmentCaptionBindings=(native.rosterEquipmentCaptionBindings||[]).filter(binding=>(binding.canonicalFieldPaths?.[entity.id]||[]).some(field=>!fields.length||fields.some(candidate=>field===pointer(candidate))));
   const equipmentReferences=native.entities.filter(candidate=>candidate.ruleContract?.canonicalRuleReferences?.includes(entity.id)).map(candidate=>({ruleId:candidate.id,effects:(candidate.ruleContract.clauses||[]).flatMap(clause=>(clause.rosterEffects||[]).filter(effect=>effect.referencedRuleId===entity.id).map(effect=>({clauseId:clause.id,...copy(effect)})))}));
   const relatedRows=(payload.relatedRules?.rows||[]).filter(row=>row.ruleId===entity.id);
   const reviews=reviewInputs.flatMap(({file,value})=>{
    const records=value.records||value.owners||[];
    return records.filter(record=>(record.canonicalId||record.ruleId)===entity.id&&(!record.field||!fields.length||fields.some(field=>overlap(record.field,field)))).map(record=>({file,record:copy(record)}));
   });
   const sourceFields=fields.length?fields:textualFields(entity.data||{}),sourceValues=sourceFields.map(field=>({field,present:at(entity.data,field)!==undefined,value:sourceValue(at(entity.data,field))}));
   const effects=selectedClauses.flatMap(clause=>(clause.rosterEffects||[]).map(effect=>({clauseId:clause.id,...copy(effect),operationSupported:supportedOperations.includes(effect.operation)})));
   const factualSnapshot=sourceSnapshot(entity);
   const snapshot={book,sourceEntityId:entity.id,entityKind:entity.kind,parentId:entity.parentId||entity.ownerId||null,name:descriptor.name,kind:descriptor.kind,logicalBoundary:copy(descriptor.sourceField),factualDataFingerprint:factualSnapshot.dataFingerprint,factualShape:copy(factualSnapshot.shape),fields:sourceValues};
   const binding={contractOwnerId:contractOwner.id,clauses:copy(selectedClauses),roles:copy(contract?.roles||[]),conditions:copy(contract?.conditions||[]),semantic:copy(semantic),attachmentPolicies:copy(attachmentPolicies),equipmentBindings:copy(equipmentBindings),equipmentCaptionBindings:copy(equipmentCaptionBindings),computations:conditions.map(item=>({identity:item.identity,declared:item.declaredComputation,implemented:item.computerImplemented}))};
   const compatibilityTargets=copy((contract?.roles||[]).filter(role=>(contract.compatibilityRoleIds||[]).includes(role.id)));
   const capabilities=capabilityValue({effects,presentationChannels:channels,conditionComputations:conditions.map(condition=>({identity:condition.identity,predicate:condition.predicate,subject:condition.subject,contextLevel:condition.contextLevel,roleId:condition.roleId,arguments:condition.arguments,declaredComputation:condition.declaredComputation})),nativeCoreBindings:coreBindings,attachmentPolicies,providedWeaponImports:equipmentBindings.filter(binding=>binding.providedWeaponProfileIds?.length),equipmentCaptionBindings,equipmentReferences,compatibilityTargets,relatedRuleRows:relatedRows.map(row=>({unitId:row.unitId,ruleId:row.ruleId,kind:row.kind,applicability:row.applicability,state:row.state})),textRosterFacts:selectedClauses.flatMap(clause=>clause.textRosterFacts||[]),annotationFlags:{conditionalOnly:entity.data.conditionalOnly??null,executable:entity.data.executable??null}});
   rows.push({book,id:descriptor.id,kind:descriptor.kind,name:descriptor.name,ownerId:unit?.id||entity.parentId||entity.ownerId||null,sourceEntityId:entity.id,sourceField:copy(descriptor.sourceField),sourceFields:copy(sourceFields),clauseIds:selectedClauses.map(clause=>clause.id),componentOf:descriptor.componentOf,nativeInput:input,nativeFactory:{path:factoryPath,exportName:'createBrowserRoster',templateConstructor:smFactories[book]||null},sourceFingerprint:inventoryFingerprint(snapshot),bindingFingerprint:inventoryFingerprint(binding),capabilityFingerprint:inventoryFingerprint(capabilities),capabilities,sourceSnapshot:{...snapshot,fields:sourceValues.map(({field,present,value})=>({field,present,type:typeof value,fingerprint:inventoryFingerprint(value??null)}))},entityFingerprint:inventoryFingerprint(sourceSnapshot(entity)),clauses:selectedClauses.map(clause=>({id:clause.id,sourceFields:copy(clause.sourceFields||[]),fingerprint:inventoryFingerprint(clause),rosterClassification:clause.rosterClassification,recipientStatus:clause.recipientStatus||null,recipients:copy(clause.recipients||[]),textRosterFacts:copy(clause.textRosterFacts||[]),rosterClassificationNote:copy(clause.rosterClassificationNote||null)})),effects,operations:[...new Set(effects.map(effect=>effect.operation))].sort(),presentationChannels:channels,conditions,nativeCorePresence:copy(semantic),nativeCoreBindings:copy(coreBindings),attachmentPermission:descriptor.kind==='CORE_ABILITY'&&['Leader','Support'].includes(descriptor.name)&&attachmentPolicies.length>0,attachmentPolicies:copy(attachmentPolicies),compatibilityTargets,relatedRuleRows:copy(relatedRows),equipmentBindings:copy(equipmentBindings),providedWeaponImports:copy(equipmentBindings.filter(binding=>binding.providedWeaponProfileIds?.length)),equipmentReferences,referencedEquipmentRules:copy(contract?.canonicalRuleReferences||[]),reviewEvidence:reviews,unresolvedSources:copy(native.unresolvedSources||[]),conditionalOnly:entity.data.conditionalOnly===true});
  }
  books.push({book,nativeInput:input,nativeFactory:factoryPath,nativeReads:[...nativeReads].sort(),conditionArtifact:passport.runtime.conditionArtifact,entityCount:native.entities.length,entityKinds:Object.fromEntries([...new Set(native.entities.map(entity=>entity.kind))].sort().map(kind=>[kind,native.entities.filter(entity=>entity.kind===kind).length])),ruleCount:descriptors.length,computations:copy(computations),conditionBindingOptions:copy(native.conditionBindingOptions||[]),conditionSchema:copy(native.conditionSchema||native.rosterSchema||null),audit:copy(passport.audit)});
 }
 rows.sort((a,b)=>a.book.localeCompare(b.book,'en')||a.id.localeCompare(b.id,'en'));
 const ids=new Set();for(const row of rows){const key=row.book+'\0'+row.id;if(ids.has(key))fail(row.book,row.id,'duplicate logical rule');ids.add(key);}
 return {schema:NATIVE_INVENTORY_SCHEMA,rows,books,sourceEntities:sourceEntities.sort((a,b)=>a.book.localeCompare(b.book,'en')||a.id.localeCompare(b.id,'en')),exclusions:exclusions.sort((a,b)=>a.book.localeCompare(b.book,'en')||a.id.localeCompare(b.id,'en')),inputs:[...inputs.values()].sort((a,b)=>a.path.localeCompare(b.path,'en')),supportedOperations,computerEvidence:{computationModule:'books/shared/roster-v2/condition-computations.mjs',computationModuleFingerprint:sha(sharedComputerSource),bindingModule:'books/shared/roster-v2/condition-binding.mjs',bindingModuleFingerprint:sha(bindingSource)},diagnostics};
}
