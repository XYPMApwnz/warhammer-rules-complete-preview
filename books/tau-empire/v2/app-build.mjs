/** Disposable isolated T’au UI projection. Facts, effects and central MFM keep their existing owners. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {buildTauImportBook} from './roster-import-build.mjs';
import {consumeMfm,resolveOwnedFact} from './mfm-boundary.mjs';
import {assertSourceCompletenessGate,captureSourceReview} from '../../shared/roster-v2/source-completeness.mjs';
import {projectArmyBook} from '../../shared/army-book-app-v2/project.mjs';
import {projectBookPresentation} from '../../shared/army-book-app-v2/book-v1-projection.mjs';
import {buildDatasheetPresentation} from '../../shared/army-book-app-v2/datasheet-v1.mjs';
import {buildGlossary} from '../../shared/army-book-app-v2/glossary.mjs';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';
const clone=structuredClone,read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
// Exact accepted labels select existing canonical definitions; no fuzzy joins.
const references={
  'For the Greater Good':['army-rule-for-the-greater-good','ARMY RULES',{}],
  Leader:['core-leader','CORE ABILITIES',{}], 'Deep Strike':['core-deep-strike','CORE ABILITIES',{}],
  Infiltrators:['core-infiltrators','CORE ABILITIES',{}], 'Lone Operative':['core-lone-operative','CORE ABILITIES',{}],
  Stealth:['core-stealth','CORE ABILITIES',{}], Hover:['core-hover','CORE ABILITIES',{}],
  'Super-heavy Walker':['core-super-heavy-walker','CORE ABILITIES',{}],
  'Scouts 7"':['core-scouts','CORE ABILITIES',{distance:7}],
  'Scouts 8"':['core-scouts','CORE ABILITIES',{distance:8}],
  'Scouts 9"':['core-scouts','CORE ABILITIES',{distance:9}],
  'Deadly Demise 1':['core-deadly-demise','CORE ABILITIES',{value:1}],
  'Deadly Demise D3':['core-deadly-demise','CORE ABILITIES',{value:'D3'}],
  'Deadly Demise D6':['core-deadly-demise','CORE ABILITIES',{value:'D6'}],
  'Deadly Demise D6+2':['core-deadly-demise','CORE ABILITIES',{value:'D6+2'}],
  'Deadly Demise D6+3':['core-deadly-demise','CORE ABILITIES',{value:'D6+3'}],
  'Deadly Demise 3D6':['core-deadly-demise','CORE ABILITIES',{value:'3D6'}],
  'Firing Deck 11':['core-firing-deck','CORE ABILITIES',{value:11}],
  'Firing Deck 20':['core-firing-deck','CORE ABILITIES',{value:20}]
};
const visible={DATASHEET:['title','keywords','factionKeywords'],PROFILE:['name','stats'],
  WEAPON_PROFILE:['name','mode','range','attacks','skill','strength','ap','damage','abilities'],
  DATASHEET_SECTION:['title','blocks','equipmentAndRules'],WARGEAR_OPTION:['text'],RULE_REFERENCE:['label'],
  COMPOSITION_MEMBER:['text'],ARMY_RULE:['title'],ARMY_RULE_COMPONENT:['title','text'],
  DETACHMENT:['title'],DETACHMENT_RULE:['title','text'],ENHANCEMENT:['title','text'],
  STRATAGEM:['title','cp','category','lines'],SOURCE_ERRATUM:['title','text'],
  EQUIPMENT_RULE:['title','text'],UPGRADE_OPTION:['text']};

/** Reuse the existing pure source gate for this unregistered isolated book.
 * Fixed pins never refresh during builds. UNVERIFIED is deliberately not semantic PASS;
 * the independent Stage 2/3 source and clause guards remain authoritative. */
export function assertTauAppSourceReview(executionBook=buildTauImportBook()){
  const facts=read('./generated/effective.json'),review=read('./app-source-review.json');
  return assertSourceCompletenessGate({review,books:[{bookId:'tau-empire',facts,executionBook,
    sourceReview:captureSourceReview('tau-empire',facts)}],expectations:[],registeredBookIds:[],checkAllRegistrations:false});
}
export function buildApp(book=buildTauImportBook(),{coreCatalog=createEffectiveCoreCatalog()}={}){
  const original=JSON.stringify(book),facts=read('./generated/effective.json'),p=consumeMfm(facts.entities).partitions;
  const mfm={unitBindings:p.unitBindings,detachmentBindings:p.detachmentBindings,enhancementBindings:p.enhancementBindings,
    paidUpgradeBindings:p.paidOptionBindings,leaderEligibilityBindings:p.leaderBindings,qualifierBindings:[]},records=new Map();
  const own=id=>{if(!records.has(id)){const row=resolveOwnedFact(id);records.set(id,row);
    for(const child of [...row.qualifierIds||[],...row.enhancementCostIds||[]])own(child);}return records.get(id);};
  for(const rows of Object.values(mfm))for(const row of rows)own(row.mfmRecordId);
  const model={...clone(book),currentness:{currentness:'ACCEPTED_SNAPSHOT',lastReconciledSource:'T’au Faction Pack v1.1 · 22 July 2026; accepted universal v1.1 · 26 August 2026'},
    mfm:{...clone(mfm),source:{label:'v1.6'},relations:[],eligibilityEvidenceBindings:[]}};
  for(const e of model.entities){
    if(['ERRATA','FAQ'].includes(e.kind))e.kind='SOURCE_ERRATUM';
    if(e.kind==='DETACHMENT'){assert.ok(e.data.ruleIds.length&&new Set(e.data.ruleIds).size===e.data.ruleIds.length);e.data.ruleId=e.data.ruleIds[0];}
  }
  const payload=projectArmyBook(model,records,{title:'T’au Empire',edition:'11th Edition'}),cards=new Map(payload.cards.map(c=>[c.id,c]));
  for(const e of model.entities){const card=cards.get(e.id),allowed=new Set(visible[e.kind]||[]);
    card.provenance=clone(e.provenance);card.fieldProvenance=clone(e.fieldProvenance||{});
    card.fields=card.fields.filter(f=>allowed.has(f.source.path.split('/')[1]));
    if(e.kind==='PROFILE')for(const f of card.fields)if(f.source.path==='/stats/INSV')f.presentationPath='/INSV';
  }
  // Tau's accepted composition section already contains its member list. Keep it once.
  payload.groups=payload.groups.filter(group=>group.itemIds.length);
  // Drone definitions are local canonical popups, not new global Glossary registration.
  payload.groups.push({id:'equipment',label:'Drones',itemIds:model.entities.filter(e=>e.kind==='EQUIPMENT_RULE').map(e=>e.id)});
  const paid=read('./mfm-bindings.json').paidOptionBindings;
  const optionCosts=mfm.paidUpgradeBindings.flatMap(b=>{const binding=paid.find(row=>row.mfmRecordId===b.mfmRecordId);assert.ok(binding);return binding.relatedEntityIds.map(itemId=>({unitId:binding.ownerEntityId,itemId,optionIds:[],costRecordId:b.mfmRecordId}));});
  payload.datasheetPresentation=buildDatasheetPresentation(model,{units:{}},{bindings:{optionCosts},records});
  Object.assign(payload.datasheetPresentation,{rosterEffectSummary:false,rosterKeywordLabel:'Keywords',basePlacement:'composition',compactPointsLabels:true});
  const glossary=buildGlossary({model,coreCatalog});payload.cards.push(...glossary.coreCards);payload.glossary=glossary.index;
  const projected=new Map(payload.cards.map(c=>[c.id,c])),fields={};
  for(const e of model.entities.filter(e=>e.kind==='RULE_REFERENCE')){
    const binding=references[e.data.label];assert.ok(binding,'Unbound exact reference '+e.data.label);
    const [targetId,group,parameters]=binding;assert.ok(projected.has(targetId),'Unavailable reference '+targetId);
    const card=cards.get(e.id),field=card.fields.find(f=>f.source.path==='/label');assert.ok(field);card.referenceGroupLabel=group;
    fields[field.id]=[{start:0,end:field.value.length,targetId,group,parameters}];
  }
  payload.datasheetPresentation.referenceBindings={schema:'army-book-app-v2/datasheet-reference-bindings/v1',fields};
  payload.bookPresentation=projectBookPresentation(model,records);
  payload.ruleContractIds=book.entities.filter(e=>e.ruleContract).map(e=>e.id);
  const conditional={state:'UNKNOWN',applicability:'CONDITIONAL',roles:[]};
  payload.relatedRules={schema:'army-book-related-rules/v2',authority:'DISPOSABLE_PROJECTION',contextPolicy:{roster:'UNKNOWN',battle:'UNKNOWN',formation:'UNKNOWN'},coreStratagemsStatus:'DEFERRED_NEEDS_CONTRACTS',rows:model.entities.filter(e=>e.kind==='DATASHEET').flatMap(unit=>model.entities.filter(e=>['ENHANCEMENT','STRATAGEM'].includes(e.kind)).map(rule=>({unitId:unit.id,ruleId:rule.id,kind:rule.kind,detachmentId:rule.parentId,...clone(conditional),selectedDetachment:clone(conditional)})))};
  payload.sourceEnrollment=read('./sources/enrollment.json');
  payload.rulePresentationLimitations={authority:'EXISTING_STAGE_3_REVIEW',review:'books/tau-empire/v2/rule-clause-review.json',capabilityMissing:3,unverifiedExportFormats:['DIRECT_GENERIC_WEAPON_ONLY_IMPORT'],battleState:'NOT_SIMULATED',legality:'NOT_ASSESSED'};
  assert.equal(JSON.stringify(book),original,'Presentation changed factual/contract owner');return payload;
}
export function writeApp({check=false}={}){
  const book=buildTauImportBook(),sourceGate=assertTauAppSourceReview(book),payload=buildApp(book);
  payload.sourceCompleteness=sourceGate;
  const bytes=JSON.stringify(payload,null,2)+'\n',file=new URL('./generated/app-presentation.json',import.meta.url);
  if(check)assert.equal(fs.readFileSync(file,'utf8'),bytes,'Stale T’au app presentation');else fs.writeFileSync(file,bytes);
  return payload;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const p=writeApp({check:process.argv.includes('--check')});console.log(JSON.stringify({status:'PASS',cards:p.cards.length,sourceCompleteness:p.sourceCompleteness}));}
