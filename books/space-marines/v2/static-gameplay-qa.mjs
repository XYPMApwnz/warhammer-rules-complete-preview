/** Independent source-literal Stage 4D expectations. No browser/real export claim. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {buildSpaceMarinesContracts} from './rule-contract-build.mjs';
import {declarations} from './rule-contract-declarations.mjs';
import {createSpaceMarinesRosterRuntime} from './roster-runtime.mjs';
import {buildGameplayPresentation} from './gameplay-presentation-build.mjs';
import {validateClauseReview} from './rule-clause-review-qa.mjs';
import {readSpaceMarinesRosterCorrections} from './roster-source-review.mjs';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';
import {formRoster} from '../../shared/roster-v2/context.mjs';
import {projectInstanceCards,projectPersonalBook,projectFormedUnitCards} from '../../shared/army-book-app-v2/personal.mjs';
import {projectAbilityPresentation} from '../../shared/army-book-app-v2/ability-presentation.mjs';

const clone=structuredClone,read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const sha=value=>createHash('sha256').update(value).digest('hex').toUpperCase();
const review=read('./static-gameplay-review.json'),ledger=read('./rule-clause-review.json'),facts=read('./generated/effective.json');
const sourceIndex=new Map(facts.entities.map(row=>[row.id,row])),built=buildSpaceMarinesContracts(),book=built.book;
const index=new Map(book.entities.map(row=>[row.id,row])),payload=buildGameplayPresentation(built),cards=new Map(payload.cards.map(row=>[row.id,row]));
const DEFAULT='detachment-sm-6341f5a9b9584677',BODY='unit-sm-59162946fee84360',CALGAR='unit-sm-1af70808102d4286';
assert.equal(review.schema,'space-marines-v2-static-gameplay-review/v1');
assert.equal(new Set(review.originalTextClauseIds).size,1082);
assert.deepEqual(Object.keys(review.staticReviewDispositions).sort(),[...review.originalTextClauseIds].sort());
assert.ok(Object.values(review.staticReviewDispositions).every(key=>review.staticDispositionReasons[key]));
for(const pin of review.originalExecutableRecords)assert.equal(sha(JSON.stringify(ledger.records.find(row=>row.id===pin.id))),pin.sha256,'Historical executable source row changed');
for(const pin of review.originalTypedBindings)assert.equal(sha(JSON.stringify(declarations.find(row=>row.ruleId===pin.ruleId&&row.clauseId===pin.clauseId))),pin.sha256,'Existing typed lowering changed');
assert.equal(review.originalExecutableRecords.length,147);assert.equal(review.originalTypedBindings.length,40);
const originalKeys=new Set(review.originalTypedBindings.map(row=>row.ruleId+'::'+row.clauseId));
assert.deepEqual(declarations.filter(row=>!originalKeys.has(row.ruleId+'::'+row.clauseId)).map(row=>row.ruleId+'::'+row.clauseId).sort(),
  review.cases.map(row=>row.ruleId+'::'+row.clauseId).sort(),'A new typed lowering lacks independent expectation');
validateClauseReview(ledger,facts);
readSpaceMarinesRosterCorrections({facts});
for(const test of review.cases){
 const lowering=declarations.find(row=>row.ruleId===test.ruleId&&row.clauseId===test.clauseId);
 if(test.clauseId==='codex-adept-devastator-assault')assert.deepEqual(lowering.sourceDependencies,[{entityId:'army-rule-sm-fcdb8cd8bb5f40dd',field:['text'],quote:'DEVASTATOR DOCTRINE\nThis unit’s ranged attacks have [ASSAULT].'}]);
 if(test.expected.permanentDoctrine)assert.deepEqual(lowering.sourceDependencies.map(row=>row.entityId).sort(),['ability-sm-05682c2acff24bd1','ability-sm-e65fcbf81ce24b79'].sort());
 if(test.expected.modelKeyword)assert.deepEqual(lowering.coreDependencies.map(row=>row.id),['core-rule-01-02-units-and-models','core-rule-13-06-terrain-and-movement']);
}

// Review pins point to accepted RAW, not generated runtime contracts.
const rawProofs=[...new Map([...review.cases,...review.physicalCases].map(row=>[row.ruleId,row.sourceProof]))].map(([,proof])=>proof).filter(proof=>proof.selectedHtmlSha256);
const python=process.env.CODEX_PYTHON||'C:/Users/denis/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const raw=spawnSync(python,['-X','utf8','-c',String.raw`
import json,sys,hashlib
from pathlib import Path
from lxml import html
data=json.load(sys.stdin);root=Path(data['root']);docs={};checks=0
sha=lambda value:hashlib.sha256(value).hexdigest().upper()
norm=lambda text:' '.join(text.split())
for pin in data['pins']:
 source=pin['source'];raw=(root/source['document']).read_bytes();assert sha(raw)==source['sha256']
 tree=docs.setdefault(source['document'],html.fromstring(raw).getroottree());nodes=tree.xpath(source['pointer']);assert len(nodes)==1
 assert sha(html.tostring(nodes[0],encoding='unicode').encode())==pin['selectedHtmlSha256']
 assert norm(nodes[0].text_content())==norm(pin['selectedRawText'])
 assert sha(pin['selectedRawText'].encode())==pin['selectedRawTextSha256'];checks+=1
print(json.dumps({'rawSourceOwners':checks}))
`],{encoding:'utf8',input:JSON.stringify({root:fileURLToPath(new URL('../../../',import.meta.url)),pins:rawProofs})});
assert.equal(raw.status,0,raw.stderr);const rawResult=JSON.parse(raw.stdout);
const core=createEffectiveCoreCatalog();
for(const [id,quote,hash]of [
 ['core-rule-01-02-units-and-models','When an effect or ability applies to a unit, it applies to every model in that unit.','9A3E26E62A76BA37CA60B63BFCD22CB4DD9343FB89A10DD69A047C3D88CCF421'],
 ['core-rule-13-06-terrain-and-movement','INFANTRY/BEASTS/SWARM/MOBILE models can move horizontally through dense terrain features.','7C53E78F2CD965F63AC95D234D8DCD2BDD52903F2DC5EB0179657F27D2BC2A2A']
]){const row=core.getById(id);assert.equal(row.state,'FULL_CONTENT');assert.ok(row.text.includes(quote));assert.ok(row.sourceContentHashes.includes(hash));}

function unit(instanceId,unitId,{enhancementId,secondModel=false}={}){
 const source=index.get(unitId),rows=source.data.profileIds.map((canonicalProfileId,n)=>({rowId:'row-'+n,canonicalProfileId,compositionScope:'MODEL_ROW',quantity:1,
  selections:source.data.weaponIds.map((weaponId,i)=>({selectionKey:instanceId+'/weapon/'+n+'/'+i,canonicalProfileIds:[weaponId],canonicalEquipmentIds:[],physicalQuantity:1,perModelQuantity:1}))}));
 if(secondModel){const row=clone(rows[0]);row.rowId='another-physical-model';for(const item of row.selections)item.selectionKey+='-other';rows.push(row);}
 const modelAssignment=enhancementId&&index.get(enhancementId).ruleContract.assignment.identity==='EXACT_PHYSICAL_INSTANCE_MODEL_PROFILE';
 return {instanceId,canonicalUnitId:unitId,startingStrength:rows.length,modelRows:rows,selections:[],equipmentContextKnown:true,
  enhancementIds:enhancementId?[enhancementId]:[],enhancementAssignments:modelAssignment?[{enhancementId,modelScopeId:instanceId+'/row-0/PROFILE/row-0'}]:[],warlord:null};
}
function fixture(test){
 const source=sourceIndex.get(test.ruleId),enhancementId=source.kind==='ENHANCEMENT'?test.ruleId:null;
 const det=test.expected.detachmentId||(enhancementId?source.parentId:DEFAULT);
 const state={schema:'roster-v2/roster',bookId:'space-marines',rosterId:'static-source-diagnostic',detachmentIds:[det],detachments:[{instanceId:'det',canonicalDetachmentId:det}],
  units:[unit('source',test.unitId,{enhancementId,secondModel:test.expected.modelOnly&&!test.expected.permanentDoctrine}),unit('peer',test.unitId),unit('unrelated',BODY)],attachments:[],warlordInstanceId:null};
 if(test.expected.permanentDoctrine){state.units.push(unit('calgar',CALGAR),unit('body',BODY));state.attachments=[
  {leaderInstanceId:'calgar',bodyguardInstanceId:'body',role:'LEADER'},{leaderInstanceId:'source',bodyguardInstanceId:'body',role:'SUPPORT'}];}
 return state;
}
const allWeapons=u=>[...u.weapons,...u.profiles.flatMap(model=>model.weapons)];
const weaponKey=w=>JSON.stringify([w.scopeId,w.selectionKey,w.canonicalProfileId]);
const deltaValue=(value,delta)=>{const match=String(value).match(/^(-?\d+)(["+]?)$/);assert.ok(match);return String(Number(match[1])+delta)+match[2];};
function assertExpected(service,state,test){
 const result=service.projection.units.find(row=>row.instanceId==='source'),before=formRoster(book,state).units.find(row=>row.instanceId==='source'),expected=test.expected;
 const traces=result.applied.filter(row=>row.ruleId===test.ruleId&&row.clauseId===test.clauseId);
 assert.ok(traces.length,'Missing applied static source '+test.ruleId+'::'+test.clauseId);
 assert.ok(traces.every(row=>row.targetInstanceId==='source'&&row.sourceFields?.length));
 const eligible=allWeapons(result).filter(w=>(!expected.mode||w.data.mode===expected.mode)&&(!expected.modelOnly||w.scopeId===result.profiles[0].scopeId));
 if(expected.weaponAbility||expected.weaponStats)assert.ok(eligible.length);
 for(const weapon of eligible){
  const base=allWeapons(before).find(row=>weaponKey(row)===weaponKey(weapon));assert.ok(base);
  if(expected.weaponAbility)assert.equal(weapon.data.abilities.filter(value=>value.toUpperCase()===expected.weaponAbility.toUpperCase()).length,1,'Qualified grant missing/duplicated');
  for(const [field,delta]of Object.entries(expected.weaponStats||{}))assert.equal(String(weapon.data[field]),deltaValue(base.data[field],delta),'Wrong baseline/replacement amount '+test.ruleId);
 }
 if(expected.weaponStats)for(const model of result.profiles.slice(1)){const original=before.profiles.find(row=>row.scopeId===model.scopeId);assert.deepEqual(model.weapons,original.weapons,'MODEL enhancement leaked');}
 if(expected.modelKeyword)assert.ok(result.profiles.every(model=>model.keywords.includes(expected.modelKeyword)));
 if(expected.unitMetric){
  assert.equal(result.metrics[expected.unitMetric]?.modifier,expected.modifier);
  assert.ok(result.profiles.every(model=>model.metrics[expected.unitMetric]===undefined),'UNIT modifier became MODEL metric');
 }
 assert.deepEqual(allWeapons(result).map(w=>[weaponKey(w),w.physicalQuantity]),allWeapons(before).map(w=>[weaponKey(w),w.physicalQuantity]));
 const effective=service.effective('source'),variants=projectInstanceCards(cards,state.units[0],effective),root=variants.get(test.unitId)[0];
 assert.equal(projectPersonalBook(payload,state).instances.length,state.units.length);
 if(expected.unitMetric){const metric=root.rosterUnitMetrics.find(row=>row.key===expected.unitMetric);assert.equal(metric.value.modifier,expected.modifier);
  assert.ok(metric.sources.some(row=>row.ruleId===test.ruleId&&row.sourceInstanceId===(expected.global?null:'source')));assert.equal(metric.unitScope,'FORMED');}
 for(const weapon of eligible){const card=variants.get(weapon.canonicalProfileId).find(row=>row.scopeId===weapon.scopeId&&row.selectionKey===weapon.selectionKey);assert.ok(card);
  for(const field of Object.keys(expected.weaponStats||{})){const value=card.fields.find(row=>row.source?.path==='/'+field);assert.equal(String(value.displayValue??value.value),String(weapon.data[field]));}
  if(expected.weaponAbility)assert.ok(card.fields.some(field=>String(field.displayValue??field.value).toUpperCase()===expected.weaponAbility.toUpperCase()));
 }
 const sourceCard=cards.get(test.ruleId);assert.ok(sourceCard.fields.some(field=>field.source?.path==='/text'&&field.value===sourceIndex.get(test.ruleId).data.text),'Full conditional text lost');
 return {effective,root};
}
const results=[];let mutations=0,negative=0,formationChecks=0;
for(const test of review.cases){
 assert.equal(sourceIndex.get(test.ruleId).data.text,test.sourceText);assert.deepEqual(sourceIndex.get(test.ruleId).provenance,test.source);
 const state=fixture(test),service=createSpaceMarinesRosterRuntime(built);service.load(state);assertExpected(service,state,test);
 if(!test.expected.global){const selectedEnhancement=sourceIndex.get(test.ruleId).kind==='ENHANCEMENT';
  assert.ok(service.projection.units.filter(row=>row.instanceId==='unrelated'||selectedEnhancement&&row.instanceId==='peer').every(row=>!row.applied.some(change=>change.ruleId===test.ruleId&&change.clauseId===test.clauseId)));negative++;}
 if(test.expected.global){const without=clone(state);without.detachmentIds=[DEFAULT];without.detachments=[{instanceId:'other',canonicalDetachmentId:DEFAULT}];service.load(without);
  assert.ok(service.projection.units.every(row=>!row.applied.some(change=>change.ruleId===test.ruleId&&change.clauseId===test.clauseId)));service.load(state);negative++;}
 if(test.expected.modelOnly)assert.ok(service.projection.units[0].applied.filter(row=>row.ruleId===test.ruleId).every(row=>row.targetCompositionId===service.projection.units[0].profiles[0].scopeId));
 const saved=service.snapshot(),projection=service.projection;service.recompute();assert.deepEqual(service.projection,projection);service.load(JSON.parse(JSON.stringify(saved)));assert.deepEqual(service.projection,projection);
 if(test.expected.permanentDoctrine){service.detach('source');const unformed=service.projection.units.find(row=>row.instanceId==='source');
  const base=formRoster(book,service.state).units.find(row=>row.instanceId==='source');for(const w of allWeapons(unformed).filter(w=>w.data.mode==='melee')){const raw=allWeapons(base).find(row=>weaponKey(row)===weaponKey(w));assert.equal(w.data.strength,deltaValue(raw.data.strength,1));assert.equal(w.data.ap,deltaValue(raw.data.ap,-1));}
  assert.ok(!unformed.applied.some(row=>row.clauseId===test.clauseId));service.reattach('source','body');assertExpected(service,service.state,test);formationChecks++;
 }else if(!test.expected.global){
  const edge=service.book.rosterAttachmentPolicies.find(row=>row.sourceId===test.unitId&&row.role==='LEADER');
  if(edge&&!test.expected.modelOnly){const joined=clone(state);joined.units.push(unit('body',edge.targetId));service.load(joined);service.attach('source','body');
   const body=service.projection.units.find(row=>row.instanceId==='body');
   if(test.expected.modelKeyword)assert.ok(body.profiles.every(row=>row.keywords.includes(test.expected.modelKeyword)));
   if(test.expected.unitMetric)assert.equal(body.metrics[test.expected.unitMetric].modifier,test.expected.modifier);
   if(test.expected.weaponAbility)assert.ok(allWeapons(body).filter(w=>!test.expected.mode||w.data.mode===test.expected.mode).every(w=>w.data.abilities.some(value=>value.toUpperCase()===test.expected.weaponAbility.toUpperCase())));
   const group=projectFormedUnitCards(cards,service,'source');assert.ok(group.components.length);
   service.detach('source');assert.ok(service.projection.units.find(row=>row.instanceId==='body').applied.every(row=>row.ruleId!==test.ruleId));service.reattach('source','body');formationChecks++;
  }
 }
 const broken={book:clone(built.book),consumed:built.consumed};for(const entity of broken.book.entities)if(entity.id===test.ruleId)entity.ruleContract.clauses=entity.ruleContract.clauses.filter(row=>row.id!==test.clauseId);
 assert.throws(()=>{const service=createSpaceMarinesRosterRuntime(broken);service.load(state);assertExpected(service,state,test);},undefined,'Undetected missing static lowering');mutations++;
 results.push({ruleId:test.ruleId,clauseId:test.clauseId,status:'PASS',effective:'PASS',guideProjection:'PASS',expected:test.expected});
}
// A supported detector and a native detector stack exactly once and expose both sources.
const detection=fixture(review.cases.find(row=>row.clauseId==='trifold-detection'));detection.detachmentIds=['detachment-sm-39d8ec1f10c44b7b'];detection.detachments=[{instanceId:'shadow',canonicalDetachmentId:detection.detachmentIds[0]}];
const detecting=createSpaceMarinesRosterRuntime(built);detecting.load(detection);assert.equal(detecting.effective('source').unitMetrics.detectionRange.modifier,-6);
const detectionCard=projectInstanceCards(cards,detection.units[0],detecting.effective('source')).get(detection.units[0].canonicalUnitId)[0];
assert.equal(detectionCard.rosterUnitMetrics.find(row=>row.key==='detectionRange').sources.length,2);
// Wrong assignment and missing Chapter context cannot activate new effects.
const wrong=fixture(review.cases.find(row=>row.expected.modelOnly&&!row.expected.permanentDoctrine));wrong.units[0].enhancementAssignments[0].modelScopeId='peer/row-0/PROFILE/row-0';
assert.throws(()=>createSpaceMarinesRosterRuntime(built).load(wrong));negative++;
assert.equal(built.artifact.nativeKeywords.unresolved.length,26);assert.ok(built.artifact.nativeKeywords.unresolved.every(row=>row.status==='NOT_PROVEN'));
assert.equal(built.consumed.referenceOnlyUnits.length,2);
for(const id of review.scopeCorrections.ids){const card=cards.get(id),field=card.fields.find(row=>row.source?.path==='/scope');assert.equal(field.value,'MODEL');assert.equal(field.displayValue,'UNIT');assert.ok(field.reviewedSourceCorrection);}
// The exact physical Kaius binding is also exercised through the actual SM
// runtime with MFM-validated Leader/Support roles, Effective and Guide cards.
const kaiusState={schema:'roster-v2/roster',bookId:'space-marines',rosterId:'static-kaius-runtime',detachmentIds:[DEFAULT],detachments:[{instanceId:'det',canonicalDetachmentId:DEFAULT}],
 units:[unit('kaius','unit-sm-3460439c3a774c66'),unit('captain','unit-sm-99eb03d4f2d448e2'),unit('body','unit-sm-717dd0d07e764a70'),unit('peer','unit-sm-99eb03d4f2d448e2')],
 attachments:[{leaderInstanceId:'captain',bodyguardInstanceId:'body',role:'LEADER'},{leaderInstanceId:'kaius',bodyguardInstanceId:'body',role:'SUPPORT'}],warlordInstanceId:null};
const kaius=createSpaceMarinesRosterRuntime(built);kaius.load(kaiusState);
const fnp=model=>model.abilities.some(row=>row.name==='Feel No Pain'&&row.value===4);
assert.ok(kaius.projection.units.find(row=>row.instanceId==='captain').profiles.every(fnp));
assert.ok(kaius.projection.units.filter(row=>row.instanceId!=='captain').flatMap(row=>row.profiles).every(model=>!fnp(model)));
const fnpCards=projectInstanceCards(cards,kaiusState.units[1],kaius.effective('captain'));
assert.ok([...fnpCards.values()].flat().some(card=>card.fields.some(field=>field.label.includes('Feel No Pain')&&field.displayValue==='4+')));
const captainEffective=kaius.effective('captain'),abilityView=projectAbilityPresentation({instanceId:'captain',profiles:captainEffective.profiles,unitAbilities:captainEffective.unitAbilities,applied:captainEffective.applied});
assert.ok([...abilityView.core,...abilityView.profiles.flatMap(row=>row.abilities)].some(row=>row.sources?.some(source=>source.ruleId==='ability-sm-c4061e257e81492f'&&source.sourceInstanceId==='kaius')));
assert.ok(kaius.effective('captain').applied.some(row=>row.ruleId==='ability-sm-c4061e257e81492f'&&row.sourceInstanceId==='kaius'));
const kaiusProjection=kaius.projection;kaius.recompute();assert.deepEqual(kaius.projection,kaiusProjection);kaius.detach('kaius');
assert.ok(kaius.projection.units.find(row=>row.instanceId==='captain').profiles.every(model=>!fnp(model)));kaius.reattach('kaius','body');assert.deepEqual(kaius.projection,kaiusProjection);

let permanentChecks=0;
for(const test of review.cases.filter(row=>row.expected.permanentDoctrine)){
 const state=fixture(test),service=createSpaceMarinesRosterRuntime(built);state.units.push(unit('independent-support',test.unitId,{enhancementId:test.ruleId}));service.load(state);
 const verifyIncrement=(id,delta)=>{const result=service.projection.units.find(row=>row.instanceId===id),base=formRoster(book,service.state).units.find(row=>row.instanceId===id);
  for(const weapon of allWeapons(result).filter(row=>row.data.mode==='melee')){const raw=allWeapons(base).find(row=>weaponKey(row)===weaponKey(weapon));assert.equal(weapon.data.strength,deltaValue(raw.data.strength,delta));assert.equal(weapon.data.ap,deltaValue(raw.data.ap,-delta));}};
 verifyIncrement('source',2);verifyIncrement('independent-support',1);
 // Army presence alone is insufficient: a detached Calgar supplies no doctrine.
 service.detach('calgar');verifyIncrement('source',1);service.reattach('calgar','body');verifyIncrement('source',2);
 const without=service.snapshot();without.attachments=without.attachments.filter(row=>row.leaderInstanceId!=='calgar');without.units=without.units.filter(row=>row.instanceId!=='calgar');
 service.load(without);verifyIncrement('source',1);service.load(state);verifyIncrement('source',2);
 const removed=service.snapshot();removed.units[0].enhancementIds=[];removed.units[0].enhancementAssignments=[];service.load(removed);verifyIncrement('source',0);service.load(state);verifyIncrement('source',2);permanentChecks+=6;
}
let targetedMutations=0;
for(const [test,mutate]of [
 [review.cases.find(row=>row.clauseId==='baseline-melee-strength-ap'),effect=>effect.value=2],
 [review.cases.find(row=>row.clauseId==='qualified-lethal-attacks'),effect=>effect.ability='LETHAL HITS'],
 [review.cases.find(row=>row.clauseId==='angels-wrath-charge'),effect=>effect.unitScope='PHYSICAL']
]){const broken={book:clone(built.book),consumed:built.consumed};const clause=broken.book.entities.find(row=>row.id===test.ruleId).ruleContract.clauses.find(row=>row.id===test.clauseId);mutate(clause.rosterEffects[0]);
 assert.throws(()=>{const service=createSpaceMarinesRosterRuntime(broken);const state=fixture(test);service.load(state);assertExpected(service,state,test);});targetedMutations++;}
console.log(JSON.stringify({status:'PASS',originalCensus:review.originalCensus.classifications,updatedCensus:ledger.coverage.classifications,
 originalExecutableRowsPreserved:147,originalTypedBindingsPreserved:40,sourceReviewRows:review.originalTextClauseIds.length,...rawResult,
 newTypedLowerings:results.length,newPhysicalLowerings:review.physicalCases.length,newSourceExecutableRows:14,
 cases:results,negativeControls:negative,missingLoweringMutations:mutations,targetedMutations,formationChecks,stackedDetection:-6,
 physicalKaiusRuntimeAndGuide:'PASS',permanentDoctrineLifecycleChecks:permanentChecks,
 sourceScopesReviewed:2,chapterKeywordsUnresolved:26,constructedFixtures:true,realNewRecruitExportTested:false,browserAcceptance:'NOT_RUN'}));
