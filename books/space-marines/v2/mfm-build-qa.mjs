/** Focused Stage 4A source-to-central-to-native checks. Numeric expectations
 * come from the accepted capture, not the disposable presentation producer. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanonicalMfmFacts} from '../../../mfm/content/canonical-mfm-facts.mjs';
import {createEffectiveMfmArmyProjection} from '../../shared/tools/effective-mfm-army-projection.mjs';
import {buildNativeBook} from './book-build.mjs';
import {buildNativeMfmBook,writeNativeMfmBook} from './mfm-build.mjs';
import {consumeMfm} from './mfm-boundary.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const facts=read('./generated/effective.json'),base=read('./generated/base.json'),cross=read('./generated/cross-owner-references.json');
const canonicalFacts=createCanonicalMfmFacts(),baseline=buildNativeBook({facts,base,cross});
const byId=rows=>new Map(rows.map(row=>[row.id,row]));
const sorted=items=>[...items].sort();
const field=(card,pointer)=>card?.fields.find(row=>row.source.path===pointer);
const at=(value,pointer)=>pointer.slice(1).split('/').map(key=>key.replaceAll('~1','/').replaceAll('~0','~')).reduce((object,key)=>object?.[key],value);
const source=canonicalFacts.sourceSnapshots.find(row=>row.sourceId==='space-marines-mfm-v1.6');
assert.ok(source,'SM v1.6 is not enrolled in the central factual owner');
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const capture=JSON.parse(fs.readFileSync(path.join(repo,source.sourcePath),'utf8'));
assert.equal(capture.version,'v1.6');
for(const key of ['observedAt','verifiedAt','currentnessCutoff'])assert.equal(capture[key],'2026-10-20','Actual source observation date lost');
assert.equal(capture.effectiveDate,null,'No invented effective/publication date');
const sm=partition=>canonicalFacts[partition].filter(row=>row.factionId==='space-marines'&&row.provenance.sourceId===source.sourceId);
const centralParts=['unitPointRecords','paidUpgradeRecords','leaderEligibilityRecords','supportEligibilityRecords','detachments','enhancementCosts','qualifierRecords'];
const centralById=byId(centralParts.flatMap(sm));
const current=sm('unitPointRecords').filter(row=>row.status==='CURRENT');
assert.equal(current.length,87);assert.equal(current.reduce((n,row)=>n+row.pointSchedules.length,0),123);
assert.equal(current.reduce((n,row)=>n+row.pointSchedules.reduce((sum,schedule)=>sum+schedule.entries.length,0),0),160);
assert.equal(sm('detachments').length,22);assert.equal(sm('enhancementCosts').length,57);
const sourceKey=row=>JSON.stringify(row.provenance.sourceLocator);

/** This checks all numeric source owners, including the two valid MFM-only
 * Forge World units that must never become invented Codex Datasheets. */
function assertCentralParity(){
 assert.equal(current.length,capture.units.length);
 const units=new Map(capture.units.map(row=>[JSON.stringify({partition:'units',factionId:'space-marines',sourceTitle:row.title,sourceGroup:row.sourceGroup,status:row.status}),row]));
 for(const row of current){const expected=units.get(sourceKey(row));assert.ok(expected,'Unproven MFM source occurrence');assert.deepEqual(row.pointSchedules,expected.pointSchedules,'Numeric points/copy/model tiers differ from accepted capture');}
 for(const row of sm('paidUpgradeRecords')){
  const locator=row.provenance.sourceLocator;
  const unit=capture.units.find(unit=>unit.title===locator.sourceTitle);
  const expected=unit?.paidOptions?.find(option=>option.sourceGroup===locator.sourceGroup&&option.sourceLabel===locator.sourceLabel);
  assert.ok(expected,'Unproven paid option occurrence');assert.equal(row.value,expected.value);
 }
 for(const row of sm('detachments')){
  const expected=capture.detachments.find(det=>det.title===row.provenance.sourceLocator.sourceTitle);
  assert.ok(expected);assert.equal(row.detachmentPoints,expected.detachmentPoints);
  for(const id of row.enhancementCostIds){const enhancement=centralById.get(id),sourceEnhancement=expected.enhancements.find(item=>item.title===enhancement?.provenance.sourceLocator.sourceTitle);assert.ok(sourceEnhancement,'Wrong Enhancement owner');assert.equal(enhancement.value,sourceEnhancement.value);assert.equal(enhancement.detachmentId,row.id);}
 }
 const references=byId(canonicalFacts.unitReferences);
 for(const [partition,role]of [['leaderEligibilityRecords','leader'],['supportEligibilityRecords','support']])for(const row of sm(partition)){
  const sourceUnit=capture.units.find(unit=>unit.title===row.provenance.sourceLocator.sourceTitle);
  assert.ok(sourceUnit);assert.deepEqual(row.rawMfmTargetUnitReferenceIds.map(id=>references.get(id)?.label),sourceUnit.relations[role],'Leader/Support source recipients changed');
  assert.deepEqual(row.targetUnitReferenceIds,row.rawMfmTargetUnitReferenceIds,'Unsupported SM relation recipient override');
 }
 for(const row of centralById.values()){
  assert.equal(row.provenance.sourceCaptureSha256,capture.captureSha256);
  assert.equal(row.provenance.sourceVersion,'v1.6');
  for(const key of ['observedAt','verifiedAt','currentnessCutoff'])assert.equal(row.provenance[key],'2026-10-20');
 }
 const historic=canonicalFacts.unitPointRecords.filter(row=>row.factionId==='space-marines'&&row.status==='LEGENDS');
 assert.equal(historic.length,76);assert.ok(historic.every(row=>row.provenance.sourceVersion!=='v1.6'),'Old Legends prices claimed as current v1.6');
 const historicalSnapshot=canonicalFacts.sourceSnapshots.find(row=>row.factionId==='space-marines'&&row.historical);
 assert.equal(historicalSnapshot.version,'v1.4');assert.deepEqual(historicalSnapshot.statusScope,['LEGENDS']);
 const historicalCapture=JSON.parse(fs.readFileSync(path.join(repo,historicalSnapshot.sourcePath),'utf8'));
 for(const row of historic){const expected=historicalCapture.units.find(unit=>unit.title===row.provenance.sourceLocator.sourceTitle&&unit.status==='LEGENDS');assert.ok(expected);assert.deepEqual(row.pointSchedules,expected.pointSchedules,'Historical Legends values were changed');}
}
assertCentralParity();

export function assertNativeMfm(result){
 const owners=[{actual:result,original:baseline,source:facts},{actual:result.deathwatch,original:baseline.deathwatch,source:cross}];
 let values=0,bindings=0;
 for(const {actual,original,source:sourceOwner}of owners){
  assert.deepEqual(sorted(actual.model.entities.map(row=>row.id)),sorted(original.model.entities.map(row=>row.id)),'Native source population changed');
  const entities=byId(actual.model.entities),cards=byId(actual.payload.cards),originalCards=byId(original.payload.cards),originalEntities=byId(original.model.entities);
  assert.equal(cards.size,actual.payload.cards.length,'Duplicate native/MFM cards');
  for(const sourceEntity of sourceOwner.entities){
   const entity=entities.get(sourceEntity.id),card=cards.get(sourceEntity.id);
   assert.ok(entity&&card,'Lost native factual entity');assert.equal(entity.bookId,sourceEntity.bookId);assert.equal(entity.parentId,sourceEntity.parentId);
   assert.deepEqual(entity.provenance,sourceEntity.provenance);assert.deepEqual(card.provenance,sourceEntity.provenance);
   assert.deepEqual(entity.fieldProvenance||{},sourceEntity.fieldProvenance||{});assert.deepEqual(card.fieldProvenance||{},sourceEntity.fieldProvenance||{});
   for(const [key,value]of Object.entries(sourceEntity.data))assert.deepEqual(entity.data[key],value,'MFM integration changed source gameplay field '+entity.id+'/'+key);
   const expectedData=structuredClone(originalEntities.get(entity.id).data);
   if(entity.kind==='DETACHMENT')expectedData.ruleId=expectedData.ruleIds[0];
   assert.deepEqual(entity.data,expectedData,'MFM values copied into native factual entity');
   for(const previous of originalCards.get(entity.id).fields){
    const projected=card.fields.find(row=>row.id===previous.id);assert.ok(projected,'Lost native presentation field '+previous.id);
    assert.deepEqual(projected.value,previous.value,'MFM integration altered native presentation fact '+previous.id);
   }
   assert.equal(entity.ruleContract,undefined,'Unexpected executable effect');
  }
  for(const partition of ['unitBindings','detachmentBindings','enhancementBindings','paidUpgradeBindings'])for(const binding of actual.model.mfm[partition]){
   const entity=entities.get(binding.entityId),central=centralById.get(binding.mfmRecordId);
   assert.ok(entity&&central,'Unresolved native central binding');assert.equal(central.provenance.sourceId,source.sourceId,'Stale v1.4 prices used');
   assert.deepEqual(binding.provenance,central.provenance,'Native binding lost source provenance');
   assert.ok(central.bindingStatus!=='REFERENCE_ONLY','Reference-only owner became active');
   if(partition==='unitBindings'){
    assert.equal(entity.kind,'DATASHEET');const reference=canonicalFacts.unitReferences.find(row=>row.id===central.unitReferenceId);
    assert.equal(reference?.armyBinding?.bindingStatus,'BOUND');assert.equal(reference.armyBinding.armyUnitId,entity.id);
   }else if(partition==='detachmentBindings')assert.equal(central.armyDetachmentId,entity.id);
   else if(partition==='enhancementBindings'){assert.equal(central.armyEnhancementId,entity.id);assert.equal(central.armyDetachmentId,entity.parentId);}
   bindings++;
  }
  for(const card of actual.payload.cards.filter(row=>centralById.has(row.id))){
   const central=centralById.get(card.id);
   for(const projected of card.fields){assert.equal(projected.source.entityId,central.id);assert.deepEqual(projected.value,at(central,projected.source.path),'Wrong projected central numeric/source value');values++;}
   const required=[];
   if(central.recordType==='MFM_UNIT_POINTS')for(const [scheduleIndex,schedule]of central.pointSchedules.entries()){
    required.push(['/pointSchedules/'+scheduleIndex+'/sourceLabel',schedule.sourceLabel]);
    for(const key of ['minCopies','maxCopies'])if(Object.hasOwn(schedule,key))required.push(['/pointSchedules/'+scheduleIndex+'/'+key,schedule[key]]);
    for(const [entryIndex,entry]of schedule.entries.entries())for(const key of ['sourceLabel','minModels','maxModels','value'])required.push(['/pointSchedules/'+scheduleIndex+'/entries/'+entryIndex+'/'+key,entry[key]]);
   }
   if(['MFM_PAID_UPGRADE','MFM_ENHANCEMENT_COST'].includes(central.recordType))required.push(['/value',central.value]);
   if(central.recordType==='MFM_DETACHMENT')required.push(['/detachmentPoints',central.detachmentPoints]);
   for(const [pointer,value]of required)assert.deepEqual(field(card,pointer)?.value,value,'Required point/copy/model fact absent '+central.id+pointer);
  }
  for(const binding of actual.model.mfm.unitBindings){
   const pointCard=cards.get(binding.mfmRecordId),unitCard=cards.get(binding.entityId);
   assert.ok(pointCard,'Point owner not projected');assert.equal(pointCard.parentId,binding.entityId,'Point owner on wrong Datasheet');
   assert.equal(pointCard.contextId,binding.entityId,'Point occurrence in wrong context');assert.ok(unitCard.children.includes(pointCard.id),'Point owner not reachable from Datasheet');
  }
  for(const partition of ['detachmentBindings','enhancementBindings'])for(const binding of actual.model.mfm[partition])assert.equal(actual.payload.bookPresentation.records[binding.entityId]?.pointRecordId,binding.mfmRecordId,'Rule cost layout lost central owner');
  const exposed=actual.payload.cards.filter(row=>row.kind==='MFM_UNIT_POINTS');
  assert.deepEqual(sorted(exposed.map(row=>row.id)),sorted(actual.model.mfm.unitBindings.map(row=>row.mfmRecordId)),'MFM-only or reference-only unit exposed as a Codex card');
 }
 assert.equal(result.model.mfm.unitBindings.length,85);
 assert.equal(result.model.mfm.detachmentBindings.length,21);assert.equal(result.deathwatch.model.mfm.detachmentBindings.length,1);
 assert.equal(result.model.mfm.enhancementBindings.length,56);assert.equal(result.deathwatch.model.mfm.enhancementBindings.length,1);
 const referenceOnly=canonicalFacts.unitReferences.filter(row=>row.factionId==='space-marines'&&row.provenance.sourceId===source.sourceId&&row.armyBinding.bindingStatus==='REFERENCE_ONLY');
 assert.deepEqual(sorted(referenceOnly.filter(row=>row.pricedStatuses.includes('CURRENT')).map(row=>row.label)),['ASTRAEUS','THUNDERHAWK GUNSHIP'],'Two independent priced source populations were force-matched');
 assert.ok(referenceOnly.every(row=>row.armyBinding.reason&&!row.armyBinding.armyUnitId),'Unproven native owner invented');
 assert.deepEqual(result.coverage.provenBindings,{unitBindings:85,detachmentBindings:22,enhancementBindings:57},'Coverage report differs from actual accepted bindings');
 assert.deepEqual(result.coverage.sourceLedger,baseline.coverage,'Source ledger rewritten by points enrollment');
 for(const declaration of result.consumed.relationDeclarations)for(const target of declaration.targets){
  if(target.status==='REFERENCE_ONLY'){assert.equal(target.entityId,null);assert.ok(target.reason,'Unknown recipient silently resolved');}
  else assert.ok(facts.entities.some(row=>row.id===target.entityId&&row.kind==='DATASHEET'),'Active recipient absent from current native source population');
 }
 const sourceOnlyRecipients=[...sm('leaderEligibilityRecords'),...sm('supportEligibilityRecords')].flatMap(row=>row.targetUnitReferenceIds).filter(id=>canonicalFacts.unitReferences.find(ref=>ref.id===id).armyBinding.bindingStatus==='REFERENCE_ONLY').length;
 assert.equal(result.coverage.referenceOnlyRecipientOccurrences,sourceOnlyRecipients,'Unproven recipient denominator changed');
 const candidates=read('./mfm-identity-candidates.json');assert.equal(candidates.candidateBindings.length,164);
 assert.ok(candidates.candidateBindings.every(row=>row.status==='NOT_PROVEN'&&row.active===false&&row.mfmRecordId===null),'Historical candidate ledger was rewritten');
 return {nativeRecords:1714,deathwatchRecords:8,unitPointBindings:85,detachmentBindings:22,enhancementBindings:57,bindings,centralProjectedValues:values};
}

const original=JSON.stringify({facts,base,cross,canonicalFacts});
const result=buildNativeMfmBook({facts,base,cross,canonicalFacts}),census=assertNativeMfm(result);
const conditionalIds={source:'unit-sm-02d5dee4717544ad',trigger:'unit-sm-1af70808102d4286',recipient:'unit-sm-f169827c554c4eee'};
function assertConditional(consumed,expectedRole){
 const edges=consumed.relations.filter(row=>row.sourceId===conditionalIds.source);
 if(expectedRole===null){assert.equal(consumed.relationStatus,'NEEDS_ARMY_CONTEXT');assert.deepEqual(edges,[],'Unknown army context guessed a Cato role');}
 else{assert.equal(consumed.relationStatus,'RESOLVED');assert.equal(edges.length,1);assert.equal(edges[0].role,expectedRole);assert.equal(edges[0].targetId,conditionalIds.recipient);assert.equal(edges[0].roleCondition.armyUnitId,conditionalIds.trigger);}
 const declarations=consumed.conditionalRelations.filter(row=>row.sourceId===conditionalIds.source);
 assert.equal(declarations.length,2,'Lost complementary source-backed role declarations');
 assert.deepEqual(sorted(declarations.map(row=>row.role)),['leader','support']);
 for(const row of declarations){
  assert.deepEqual(row.targets.filter(target=>target.status==='BOUND').map(target=>target.entityId),[conditionalIds.recipient]);
  assert.equal(row.roleConditionProvenance.armyRule.ownerUnitId,conditionalIds.source);
  assert.equal(row.roleConditionProvenance.armyRule.triggerUnitId,conditionalIds.trigger);
  assert.ok(row.roleConditionProvenance.armyRule.sourceText,'Conditional source text missing');
 }
 const references=byId(canonicalFacts.unitReferences),expected=[];
 for(const [partition,role]of [['leaderEligibilityRecords','leader'],['supportEligibilityRecords','support']])for(const row of sm(partition)){
  if(row.roleCondition&&(expectedRole===null||row.roleCondition.expectedPresent!==(expectedRole==='support')))continue;
  const owner=references.get(row.sourceUnitReferenceId).armyBinding;
  if(owner.bindingStatus!=='BOUND'||!facts.entities.some(entity=>entity.id===owner.armyUnitId))continue;
  for(const targetId of row.targetUnitReferenceIds){const target=references.get(targetId).armyBinding;if(target.bindingStatus==='BOUND'&&facts.entities.some(entity=>entity.id===target.armyUnitId))expected.push([role,owner.armyUnitId,target.armyUnitId].join('|'));}
 }
 assert.deepEqual(sorted(consumed.relations.map(row=>[row.role,row.sourceId,row.targetId].join('|'))),sorted(expected),'Native relation edges do not match independently resolved central source declarations');
}
const allEntities=[...facts.entities,...cross.entities];
const unknown=consumeMfm(allEntities,{canonicalFacts}),absent=consumeMfm(allEntities,{canonicalFacts,presentUnitIds:[]}),present=consumeMfm(allEntities,{canonicalFacts,presentUnitIds:[conditionalIds.trigger]});
assertConditional(unknown,null);assertConditional(absent,'leader');assertConditional(present,'support');
assert.throws(()=>consumeMfm(allEntities,{canonicalFacts,presentUnitIds:[null]}),undefined,'Invalid presence context accepted');
assert.throws(()=>createEffectiveMfmArmyProjection('space-marines',{canonicalFacts}).relationEdges({effectiveUnitIds:facts.entities.filter(row=>row.kind==='DATASHEET').map(row=>row.id)}),/require explicit army presence context/,'Existing strict relation consumer was silently weakened');
assert.equal(JSON.stringify({facts,base,cross,canonicalFacts}),original,'Native MFM producer mutates accepted owners');
assert.deepEqual(buildNativeMfmBook({facts,base,cross,canonicalFacts}),result,'Nondeterministic native MFM double build');
assert.deepEqual(buildNativeMfmBook({facts:{...facts,entities:[...facts.entities].reverse()},base:{...base,entities:[...base.entities].reverse()},cross:{...cross,entities:[...cross.entities].reverse()},canonicalFacts}),result,'Native binding depends on record order');
let mutations=0;
for(const [name,change]of [
 ['wrong projected points',r=>{const card=r.payload.cards.find(row=>row.kind==='MFM_UNIT_POINTS');card.fields.find(row=>row.source.path.endsWith('/value')).value+=1;}],
 ['missing point row values',r=>{const card=r.payload.cards.find(row=>row.kind==='MFM_UNIT_POINTS');card.fields=card.fields.filter(row=>!row.source.path.endsWith('/value'));}],
 ['wrong native unit owner',r=>{r.model.mfm.unitBindings[0].entityId=r.model.mfm.unitBindings[1].entityId;}],
 ['lost cost owner',r=>{delete r.payload.bookPresentation.records[r.model.mfm.enhancementBindings[0].entityId].pointRecordId;}],
 ['lost source provenance',r=>{r.payload.cards.find(row=>row.id===facts.entities[0].id).provenance={};}],
 ['wrong source gameplay field',r=>{r.model.entities.find(row=>row.id===facts.entities[0].id).data.title='invented';}],
 ['Army-owned point copy',r=>{r.model.entities.find(row=>row.kind==='DATASHEET').data.points=1;}],
 ['missing points binding',r=>{r.model.mfm.unitBindings.pop();}],
 ['reference-only point owner exposed',r=>{const unbound=current.find(row=>canonicalFacts.unitReferences.find(ref=>ref.id===row.unitReferenceId).armyBinding.bindingStatus==='REFERENCE_ONLY');r.payload.cards.push({id:unbound.id,kind:'MFM_UNIT_POINTS',fields:[],children:[]});}],
 ['phantom Forge World Datasheet',r=>{r.model.entities.push({id:'fabricated-astraeus',kind:'DATASHEET',data:{title:'Astraeus'}});}]
]){const changed=structuredClone(result);change(changed);assert.throws(()=>assertNativeMfm(changed),undefined,'Mutation survived: '+name);mutations++;}
for(const [name,sourceValue,expectedRole,change]of [
 ['conditional role lost',present,'support',row=>{row.relations=row.relations.filter(edge=>edge.sourceId!==conditionalIds.source);}],
 ['wrong conditional recipient',present,'support',row=>{row.relations.find(edge=>edge.sourceId===conditionalIds.source).targetId=conditionalIds.trigger;}],
 ['wrong conditional role',absent,'leader',row=>{row.relations.find(edge=>edge.sourceId===conditionalIds.source).role='support';}],
 ['unknown condition activated',unknown,null,row=>{row.relations.push(structuredClone(present.relations.find(edge=>edge.sourceId===conditionalIds.source)));}],
 ['condition source provenance lost',present,'support',row=>{row.conditionalRelations.find(edge=>edge.sourceId===conditionalIds.source).roleConditionProvenance.armyRule.sourceText='';}]
]){const changed=structuredClone(sourceValue);change(changed);assert.throws(()=>assertConditional(changed,expectedRole),undefined,'Mutation survived: '+name);mutations++;}
const changedCentral=structuredClone(canonicalFacts);
changedCentral.unitPointRecords.find(row=>row.id===current[0].id).pointSchedules[0].entries[0].value+=1;
assert.throws(()=>assertNativeMfm(buildNativeMfmBook({facts,base,cross,canonicalFacts:changedCentral})),undefined,'Numeric expected value was copied from tested central projection');mutations++;
const originalRead=fs.readFileSync,legacyReads=[];
// Central MFM retains the accepted historical Legends capture; that retained
// source evidence is not a dependency on the legacy Army builder or facts.
const historicalArtifacts=new Set(read('../../source-ingestion-contract.json').sources.find(row=>row.sourceId==='space-marines-mfm-v1.4').artifacts.map(row=>path.resolve(repo,row.path).replaceAll('\\','/').toLowerCase()));
fs.readFileSync=function(file,...args){const absolute=path.resolve(file instanceof URL?fileURLToPath(file):String(file)).replaceAll('\\','/').toLowerCase(),bookRoot=path.join(repo,'books/space-marines/').replaceAll('\\','/').toLowerCase();if(absolute.startsWith(bookRoot)&&!absolute.startsWith(bookRoot+'v2/')&&!historicalArtifacts.has(absolute)){legacyReads.push(absolute);throw new Error('Forbidden Space Marines legacy read '+absolute);}return originalRead.call(this,file,...args);};
try{writeNativeMfmBook({check:true});}finally{fs.readFileSync=originalRead;}
assert.deepEqual(legacyReads,[]);
console.log(JSON.stringify({status:'PASS',...census,sourcePointSchedules:123,sourcePointRows:160,historicalLegends:76,conditionalRoles:{absent:'leader',present:'support',unknown:'NEEDS_ARMY_CONTEXT'},nativeRelationsUnknown:unknown.relations.length,nativeRelationsWithContext:present.relations.length,referenceOnlyRecipientOccurrences:result.coverage.referenceOnlyRecipientOccurrences,mutationControls:mutations,deterministic:true,reorderedInputStable:true,freshness:'PASS',legacyReads:0,browserAcceptance:'NOT_RUN'},null,2));
