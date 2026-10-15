/** Disposable EC presentation. Existing effective facts and central MFM own all values. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {buildECContracts} from './rule-contract-build.mjs';
import {consumeMfm,resolveOwnedFact} from './mfm-boundary.mjs';
import {projectArmyBook} from '../../shared/army-book-app-v2/project.mjs';
import {projectBookPresentation} from '../../shared/army-book-app-v2/book-v1-projection.mjs';
import {buildDatasheetPresentation} from '../../shared/army-book-app-v2/datasheet-v1.mjs';
import {buildGlossary} from '../../shared/army-book-app-v2/glossary.mjs';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';

const clone=structuredClone;
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
// Exact accepted reference labels bind existing owners, never resolve by similarity.
const references={
  'Thrill Seekers':['army-rule-thrill-seekers','ARMY RULES',{}],
  'Pact of Excess':['army-rule-pact-of-excess','ARMY RULES',{}],
  Infiltrators:['core-infiltrators','CORE ABILITIES',{}],
  'Deadly Demise D3':['core-deadly-demise','CORE ABILITIES',{value:'D3'}],
  'Deadly Demise D6':['core-deadly-demise','CORE ABILITIES',{value:'D6'}],
  'Firing Deck 2':['core-firing-deck','CORE ABILITIES',{value:2}],
  'Deep Strike':['core-deep-strike','CORE ABILITIES',{}],
  'Fights First':['core-fights-first','CORE ABILITIES',{}],
  'Scouts 9"':['core-scouts','CORE ABILITIES',{distance:9}],
  'Scouts 6"':['core-scouts','CORE ABILITIES',{distance:6}],
  'Feel No Pain 5+':['core-feel-no-pain','CORE ABILITIES',{value:5}],
  Leader:['core-leader','CORE ABILITIES',{}],
  'Lone Operative':['core-lone-operative','CORE ABILITIES',{}],
  Hover:['core-hover','CORE ABILITIES',{}]
};
const visible={
  DATASHEET:['title','keywords','factionKeywords'],PROFILE:['name','stats'],
  WEAPON_PROFILE:['name','mode','range','attacks','skill','strength','ap','damage','abilities'],
  DATASHEET_SECTION:['title','blocks','equipmentAndRules'],WARGEAR_OPTION:['text'],RULE_REFERENCE:['label'],
  COMPOSITION_MEMBER:['sourceText'],ARMY_RULE:['title'],ARMY_RULE_COMPONENT:['title','text'],
  DETACHMENT:['title'],DETACHMENT_RULE:['title','text'],ENHANCEMENT:['title','text'],STRATAGEM:['title','cp','category','lines'],
  SOURCE_ERRATUM:['title','text'],SOURCE_UPDATE_REFERENCE:['instruction','status','targetIds'],
  STRUCTURED_RULE_TABLE:['rows'],SOURCE_PRESENTATION_NOTE:['text'],UPGRADE_OPTION:['text']
};

export function buildApp(built=buildECContracts(),{coreCatalog=createEffectiveCoreCatalog()}={}) {
  const original=JSON.stringify(built.book),facts=read('./generated/effective.json');
  const mfm=consumeMfm(facts.entities),records=new Map();
  const own=id=>{if(!records.has(id)){const record=resolveOwnedFact(id);records.set(id,record);for(const child of [...record.qualifierIds||[],...record.enhancementCostIds||[]])own(child);}return records.get(id);};
  for(const part of ['unitBindings','detachmentBindings','enhancementBindings','paidUpgradeBindings','leaderEligibilityBindings','qualifierBindings'])for(const binding of mfm[part])own(binding.mfmRecordId);
  const model={...clone(built.book),currentness:{currentness:'CURRENT',lastReconciledSource:'Official EC Faction Pack v1.3 · 30 September 2026'},
    mfm:{...clone(mfm),source:{label:'v1.6'},relations:[],eligibilityEvidenceBindings:[]}};
  for(const entity of model.entities){
    if(['FAQ','ERRATA'].includes(entity.kind))entity.kind='SOURCE_ERRATUM';
    if(entity.kind==='DETACHMENT'){
      assert.equal(entity.data.ruleIds.length,1,'Ambiguous Detachment presentation rule');
      entity.data.ruleId=entity.data.ruleIds[0];
    }
  }
  const payload=projectArmyBook(model,records,{title:"Emperor’s Children",edition:'11th Edition'}),cards=new Map(payload.cards.map(card=>[card.id,card]));
  for(const entity of model.entities){
    const card=cards.get(entity.id),paths=new Set(visible[card.kind]||[]);
    card.provenance=clone(entity.provenance);card.fieldProvenance=clone(entity.fieldProvenance||{});
    card.fields=card.fields.filter(field=>paths.has(field.source.path.split('/')[1]));
    if(entity.kind==='PROFILE')for(const field of card.fields)if(field.source.path==='/stats/INSV')field.presentationPath='/INSV';
    if(entity.kind==='SOURCE_UPDATE_REFERENCE'){
      card.title='Official update · Page '+entity.provenance.page;
      for(const field of card.fields)if(field.source.path==='/instruction')field.presentationPath='/text';
    }
  }
  // Typed table cells retain their exact source identity when displayed with the owning rule.
  for(const entity of model.entities.filter(entity=>entity.kind==='STRUCTURED_RULE_TABLE')){
    const card=cards.get(entity.id),parent=cards.get(entity.parentId);
    assert.ok(parent,'Missing table owner');
    for(const field of card.fields){
      const [,row,column]=field.source.path.slice(1).split('/');
      field.presentation='table-cell';field.table={id:entity.id+'::/rows',row:Number(row),column:Number(column),header:Number(row)===0};
      parent.fields.push({...field});
    }
  }
  for(const section of model.entities.filter(entity=>entity.kind==='DATASHEET_SECTION'&&entity.data.memberIds?.length)){
    const target=cards.get(section.id),memberFields=[];
    for(const [i,id]of section.data.memberIds.entries()){
      const member=model.entities.find(entity=>entity.id===id);assert.equal(member?.parentId,section.parentId,'Foreign composition owner');
      const owner=cards.get(id),field=owner.fields.find(field=>field.source.path==='/sourceText');assert.ok(field,'Missing composition source text');
      memberFields.push({...field,presentationPath:`/blocks/${i}/text`});owner.fields=owner.fields.filter(candidate=>candidate!==field);
    }
    for(const field of target.fields)if(/^\/blocks\/\d+\/text$/.test(field.source.path))field.presentationPath=field.source.path.replace(/\/blocks\/(\d+)\//,(_,i)=>`/blocks/${Number(i)+memberFields.length}/`);
    target.fields.unshift(...memberFields);
  }
  // The central source explicitly labels these three entries as Upgrade.
  // Select that source span for the existing shared classification slot;
  // do not add a new canonical field or reclassify the gameplay contract.
  const upgradeIds=['detachment-spectacle-of-slaughter:enhancement:1','detachment-spectacle-of-slaughter:enhancement:2','detachment-elegant-brutes:enhancement:2'];
  for(const id of upgradeIds){
    const binding=mfm.enhancementBindings.find(binding=>binding.entityId===id),owner=records.get(binding?.mfmRecordId);
    const title=owner?.provenance.sourceLocator.sourceTitle,span=title?.match(/\((Upgrade)\)$/);assert.ok(span,'Missing official Upgrade presentation source');
    const path='/provenance/sourceLocator/sourceTitle',field={id:owner.id+'::'+path,label:'Type',value:title,displayValue:span[1],
      type:'text',contextId:id,source:{entityId:owner.id,path},presentationPath:'/sourceTypeLabel',
      sourceSpan:{start:span.index+1,end:span.index+1+span[1].length}};
    cards.get(id).fields.push(field);
    payload.factManifest.push({id:field.id,entityId:owner.id,path:['provenance','sourceLocator','sourceTitle'],value:title,cardId:id,contextId:id,ownerType:'CENTRALIZED_MFM'});
  }
  payload.groups.find(group=>group.id==='updates').itemIds=model.entities.filter(entity=>['SOURCE_ERRATUM','SOURCE_UPDATE_REFERENCE'].includes(entity.kind)).map(entity=>entity.id);
  payload.groups=payload.groups.filter(group=>group.itemIds.length);
  const optionCosts=mfm.paidUpgradeBindings.flatMap(binding=>(binding.weaponProfileSourceIds||[binding.entityId]).map(itemId=>({
    unitId:binding.scopeOwnerId,itemId,optionIds:binding.optionSourceIds||[],costRecordId:binding.mfmRecordId})));
  payload.datasheetPresentation=buildDatasheetPresentation(model,{units:{}},{bindings:{optionCosts},records});
  Object.assign(payload.datasheetPresentation,{rosterEffectSummary:false,rosterKeywordLabel:'Keywords',basePlacement:'composition',compactPointsLabels:true});
  const glossary=buildGlossary({model,coreCatalog});
  payload.cards.push(...glossary.coreCards);payload.glossary=glossary.index;
  const projected=new Map(payload.cards.map(card=>[card.id,card])),fields={};
  for(const entity of model.entities.filter(entity=>entity.kind==='RULE_REFERENCE')){
    const binding=references[entity.data.label];assert.ok(binding,'Unbound exact rule reference '+entity.data.label);
    const [targetId,group,parameters]=binding;assert.ok(projected.has(targetId),'Unavailable canonical reference '+targetId);
    const card=cards.get(entity.id),field=card.fields.find(field=>field.source.path==='/label');
    assert.ok(field,'Missing rule-reference caption');card.referenceGroupLabel=group;
    fields[field.id]=[{start:0,end:field.value.length,targetId,group,parameters,...(targetId==='core-feel-no-pain'?{legacyValue:true}:{})}];
  }
  payload.datasheetPresentation.referenceBindings={schema:'army-book-app-v2/datasheet-reference-bindings/v1',fields};
  payload.bookPresentation=projectBookPresentation(model,records);
  payload.bookPresentation.coverImage='../assets/emperors-children-cover-800.webp';
  for(const entity of model.entities.filter(entity=>entity.kind==='SOURCE_UPDATE_REFERENCE'))payload.bookPresentation.records[entity.id]={id:entity.id,kind:entity.kind,provenance:clone(entity.provenance),tables:[]};
  payload.ruleContractIds=built.book.entities.filter(entity=>entity.ruleContract).map(entity=>entity.id);
  // A book view lacks physical assignments and battle context. Unbound rules
  // remain visible as conditional, never as a fabricated compatible result.
  const conditional={state:'UNKNOWN',applicability:'CONDITIONAL',roles:[]};
  payload.relatedRules={schema:'army-book-related-rules/v2',authority:'DISPOSABLE_PROJECTION',
    contextPolicy:{roster:'UNKNOWN',battle:'UNKNOWN',formation:'UNKNOWN'},coreStratagemsStatus:'DEFERRED_NEEDS_CONTRACTS',
    rows:model.entities.filter(entity=>entity.kind==='DATASHEET').flatMap(unit=>model.entities.filter(entity=>['ENHANCEMENT','STRATAGEM'].includes(entity.kind)).map(rule=>({
      unitId:unit.id,ruleId:rule.id,kind:rule.kind,detachmentId:rule.parentId,...clone(conditional),selectedDetachment:clone(conditional)})))};
  payload.sourceEnrollment=clone(facts.sources);
  payload.attachmentAdjudications=clone(built.book.rosterAttachmentAdjudications);
  assert.equal(JSON.stringify(built.book),original,'Presentation changed its factual/contract owner');
  return payload;
}
export function writeApp({check=false}={}) {
  const payload=buildApp(),bytes=JSON.stringify(payload,null,2)+'\n',file=new URL('./generated/app-presentation.json',import.meta.url);
  if(check)assert.equal(fs.readFileSync(file,'utf8'),bytes,'Stale EC presentation');else fs.writeFileSync(file,bytes);
  return payload;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const payload=writeApp({check:process.argv.includes('--check')});console.log(JSON.stringify({status:'PASS',cards:payload.cards.length,contracts:payload.ruleContractIds.length}));}
