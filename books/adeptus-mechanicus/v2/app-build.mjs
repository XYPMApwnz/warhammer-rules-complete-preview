import {renderCompatibilityEntry} from '../../shared/application-v2/compatibility.mjs';
import {assertBookSourceReview} from '../../shared/roster-v2/source-completeness.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {buildAdMechContracts} from './rule-contract-build.mjs';
import {createAdMechCompatibilityCompiler} from './rule-contract-context.mjs';
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';
import {projectArmyBook} from '../../shared/army-book-app-v2/project.mjs';
import {projectBookPresentation} from '../../shared/army-book-app-v2/book-v1-projection.mjs';
import {buildDatasheetPresentation} from '../../shared/army-book-app-v2/datasheet-v1.mjs';
import {summarizeCompatibility} from '../../shared/rule-contract-v2/compatibility.mjs';
import {buildPresentationReferences} from './presentation-reference-build.mjs';
import {buildRosterRuntimeBook,writeRosterRuntime} from './roster-build.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
export function readAppInputs() {
  const built=buildAdMechContracts();
  assert.equal(built.blockedIds.size,0,'Incomplete current Rule Contracts');
  const mfmCatalog=createEffectiveMfmCatalog(),mfmBindings=read('./app-mfm-bindings.json');
  return {model:built.book,evaluator:built.schema.evaluator,mfmCatalog,mfmBindings,
    records:bindPoints(built.book,mfmCatalog.catalog,mfmBindings).records,
    datasheetBindings:read('./normal-datasheet-bindings.json'),
    coreCatalog:createEffectiveCoreCatalog(),artwork:read('../presentation/unit-images.json')};
}
function bindPoints(model,catalog,bindings) {
  const index=new Map(model.entities.map(entity=>[entity.id,entity])),records=new Map();
  const own=record=>{assert.ok(record,'Unresolved central MFM identity');records.set(record.id,record);return record;};
  const mfm={source:{label:catalog.sourceVersion},unitBindings:[],detachmentBindings:[],enhancementBindings:[],paidUpgradeBindings:[],relations:[],eligibilityEvidenceBindings:[]};
  for(const reference of catalog.unitReferences.filter(record=>record.armyBinding?.armyBookId===model.bookId)) {
    const entityId=reference.armyBinding.armyUnitId;if(!index.has(entityId))continue;
    const points=catalog.unitPointRecords.filter(record=>record.unitReferenceId===reference.id);
    assert.equal(points.length,1,'Ambiguous central unit points');own(points[0]);mfm.unitBindings.push({entityId,mfmRecordId:points[0].id});
  }
  for(const record of catalog.detachments.filter(record=>record.armyBookId===model.bookId)) {
    assert.equal(index.get(record.armyDetachmentId)?.kind,'DETACHMENT');own(record);
    mfm.detachmentBindings.push({entityId:record.armyDetachmentId,mfmRecordId:record.id});
  }
  for(const binding of bindings.enhancementBindings) {
    const entity=index.get(binding.entityId),record=catalog.enhancementCosts.find(record=>record.id===binding.mfmRecordId);
    assert.equal(entity?.kind,'ENHANCEMENT');assert.equal(record?.armyBookId,model.bookId);
    assert.equal(record.armyDetachmentId,entity.parentId);assert.equal(record.armyEnhancementId,binding.armyEnhancementId);
    own(record);mfm.enhancementBindings.push(structuredClone(binding));
  }
  for(const record of records.values())for(const id of record.qualifierIds||[])own(catalog.qualifierRecords.find(record=>record.id===id));
  assert.equal(mfm.unitBindings.length,model.entities.filter(entity=>entity.kind==='DATASHEET').length);
  assert.equal(mfm.enhancementBindings.length,model.entities.filter(entity=>entity.kind==='ENHANCEMENT').length);
  return {mfm,records};
}
export function buildRelatedRules(model,evaluator) {
  const compiler=createAdMechCompatibilityCompiler(model,evaluator),kinds=['STRATAGEM','ENHANCEMENT'];
  const base=compiler.compileRows({kinds,order:'UNIT_RULE',sort:true});
  const selected=compiler.compileRows({kinds,order:'UNIT_RULE',sort:true,contextForRule:rule=>({detachmentId:rule.ruleContract.detachmentId})});
  const byId=new Map(selected.rows.map(row=>[row.unitId+'\0'+row.ruleId,row]));
  const rules=new Map(model.entities.filter(entity=>entity.ruleContract).map(entity=>[entity.id,entity]));
  const result=row=>({state:row.state,applicability:row.applicability,roles:row.roles});
  const rows=base.rows.map(row=>({unitId:row.unitId,ruleId:row.ruleId,detachmentId:rules.get(row.ruleId).ruleContract.detachmentId,
    kind:rules.get(row.ruleId).kind,...result(row),selectedDetachment:result(byId.get(row.unitId+'\0'+row.ruleId))}));
  const all=summarizeCompatibility(rows),chosen=summarizeCompatibility(rows.map(row=>row.selectedDetachment));assert.equal(all.INVALID+chosen.INVALID,0);
  return {schema:'army-book-related-rules/v2',authority:'DISPOSABLE_PROJECTION',
    contextPolicy:{allDetachments:'UNSPECIFIED_DETACHMENT',selectedDetachment:'EXPLICIT_CANONICAL_ID',roster:'UNKNOWN',battle:'UNKNOWN',formation:'UNKNOWN'},
    coreStratagemsStatus:'DEFERRED_NEEDS_CONTRACTS',summary:{units:model.entities.filter(entity=>entity.kind==='DATASHEET').length,
      stratagems:model.entities.filter(entity=>entity.kind==='STRATAGEM').length,
      enhancements:model.entities.filter(entity=>entity.kind==='ENHANCEMENT').length,rows:rows.length,allDetachments:all,selectedDetachment:chosen},rows};
}
export function buildApp(inputs=readAppInputs()) {
  const {model}=inputs, {mfm,records}=bindPoints(model,inputs.mfmCatalog.catalog,inputs.mfmBindings);
  // This view adds presentation ownership bindings only. Canonical data and
  // Rule Contracts are not flattened, interpreted or changed.
  const view={...model,mfm,currentness:{currentness:'CURRENT',lastReconciledSource:'GW Faction Pack v1.4'}};
  const payload=projectArmyBook(view,records,{title:'Adeptus Mechanicus',edition:'11th Edition'});
  const cards=new Map(payload.cards.map(card=>[card.id,card]));
  payload.groups.find(group=>group.id==='introduction').itemIds=model.entities.filter(entity=>entity.kind==='BOOK_USAGE').map(entity=>entity.id);
  payload.groups.find(group=>group.id==='updates').itemIds.push(...model.entities.filter(entity=>entity.kind==='SOURCE_UPDATE_REFERENCE').map(entity=>entity.id));
  for(const entity of model.entities.filter(entity=>entity.kind==='SOURCE_UPDATE_REFERENCE'))cards.get(entity.id).title=`Official update · Page ${entity.data.page}`;
  for(const entity of model.entities.filter(entity=>entity.kind==='ATTACHMENT_DECLARATION')){
    const section=cards.get(entity.data.sourceSectionId);section.referenceCardIds=[...(section.referenceCardIds||[]),entity.id];
  }
  const presentationRecords=new Map([...records,...inputs.mfmCatalog.catalog.paidUpgradeRecords.map(record=>[record.id,record])]);
  payload.datasheetPresentation=buildDatasheetPresentation(model,inputs.artwork,
    {bindings:inputs.datasheetBindings,records:presentationRecords});
  // Book-owned display choices; canonical/effective facts and calculations
  // remain unchanged, and other books keep their accepted presentation.
  Object.assign(payload.datasheetPresentation,{rosterEffectSummary:false,rosterKeywordLabel:'Keywords',
    basePlacement:'composition',compactPointsLabels:true});
  const reference=buildPresentationReferences({model,cards:payload.cards,coreCatalog:inputs.coreCatalog});
  payload.cards.push(...reference.coreCards);payload.datasheetPresentation.referenceBindings=reference.referenceBindings;
  payload.glossary=reference.glossaryIndex;
  payload.bookPresentation=projectBookPresentation(view,records);
  payload.bookPresentation.coverImage='../assets/mechanicus-cover-800.webp';
  payload.bookPresentation.records['book-introduction']={id:'book-introduction',kind:'BOOK_USAGE',provenance:model.entities.find(entity=>entity.id==='book-introduction').provenance};
  payload.relatedRules=buildRelatedRules(model,inputs.evaluator);
  // Bind existing canonical child weapon classification from its typed source
  // declaration; no weapon facts are duplicated or reconstructed from prose.
  for(const entity of model.entities)for(const clause of entity.ruleContract?.clauses||[])for(const effect of clause.rosterEffects||[]) {
    if(effect.operation==='CONTRIBUTE_WEAPON_PROFILE')cards.get(effect.weaponProfileId).weaponMode=effect.weaponMode;
  }
  payload.ruleContractIds=model.entities.filter(entity=>entity.ruleContract).map(entity=>entity.id);
  return payload;
}
export function writeApp({check=false}={}) {
  assertBookSourceReview('adeptus-mechanicus',{executionBook:buildRosterRuntimeBook()});
  writeRosterRuntime({check});
  const payload=buildApp(),outputs=new Map([
    ['./generated/app-presentation.json',JSON.stringify(payload,null,2)+'\n'],
    ['./app.html',renderCompatibilityEntry({title:'Adeptus Mechanicus',bookId:'adeptus-mechanicus'})]]);
  for(const [name,value]of outputs){const location=new URL(name,import.meta.url);if(check)assert.equal(fs.readFileSync(location,'utf8'),value,'Stale Army Book projection: '+name);else fs.writeFileSync(location,value);}
  return payload;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const payload=writeApp({check:process.argv.includes('--check')});console.log(JSON.stringify({status:'PASS',cards:payload.cards.length,facts:payload.factManifest.length,contracts:payload.ruleContractIds.length}));}
