/** Source-reviewed army applicability over constructed physical snapshots.
 * No real New Recruit format, army legality or browser acceptance is claimed. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildDarkAngelsContracts} from './rule-contract-build.mjs';
import {buildGameplayPresentation} from './gameplay-presentation-build.mjs';
import {createDarkAngelsRosterRuntime} from './roster-runtime.mjs';
import {createDarkAngelsRuleSchema} from './rule-contract-schema.mjs';
import {changeAttachment} from '../../shared/roster-v2/context.mjs';
import {buildAttachmentFeasibility} from '../../shared/roster-v2/compatibility-feasibility.mjs';
import {commitRosterImport} from '../../shared/roster-v2/runtime.mjs';
import {projectInstanceCards} from '../../shared/army-book-app-v2/personal.mjs';
const clone=structuredClone;
const built=buildDarkAngelsContracts(),book=built.book,index=new Map(book.entities.map(row=>[row.id,row]));
// This ledger is independently source-checked by reference-qa.py, including
// exact RAW hrefs, keyword panels, canonical identities and full rule text.
const conditions=JSON.parse(fs.readFileSync(new URL('./chapter-conditions.json',import.meta.url),'utf8')).records;
const anchor='unit-da-f8f0629206e744459a9f',ordinary='unit-sm-59162946fee84360';
const out='unit-sm-0dd92e6d8ad54ee6',captain='unit-sm-99eb03d4f2d448e2';
const cards=new Map(buildGameplayPresentation(built).cards.map(card=>[card.id,card]));
const checks=[],evidence=[];
const check=(id,fn)=>{fn();checks.push({id,status:'PASS'});};
const physical=(instanceId,id)=>({instanceId,canonicalUnitId:id,startingStrength:index.get(id).data.profileIds.length,
 modelRows:index.get(id).data.profileIds.map((profileId,n)=>({rowId:'model-'+n,canonicalProfileId:profileId,
  compositionScope:'MODEL_ROW',quantity:1,selections:[]})),selections:[],enhancementIds:[],warlord:null});
const roster=(units,det=book.entities.find(row=>row.kind==='DETACHMENT'&&row.bookId==='space-marines').id)=>({
 schema:'roster-v2/roster',bookId:'dark-angels',rosterId:'stage3b1-source-reviewed-applicability',
 detachments:[{instanceId:'detachment',canonicalDetachmentId:det}],detachmentIds:[det],units,attachments:[],warlordInstanceId:null});
const grantTraces=unit=>unit.applied.filter(trace=>['army-rule-da-2206dbc19df84c22a190','army-rule-da-c944806a43ff4c999f9e'].includes(trace.ruleId));
const projected=(runtime,id)=>runtime.projection.units.find(row=>row.instanceId===id);
const assertGrant=(runtime,id,keyword,expected)=>{
 const unit=projected(runtime,id);assert.ok(unit);
 assert.equal(unit.keywords.includes(keyword),expected,id+'/'+keyword);
 assert.ok(unit.profiles.every(model=>!model.keywords.includes(keyword)),'UNIT keyword escaped into MODEL');
 const traces=grantTraces(unit);assert.equal(traces.length,expected?1:0);
 if(expected){assert.equal(traces[0].targetInstanceId,id);assert.equal(traces[0].sourceInstanceId,null);
  assert.deepEqual(traces[0].sourceFields,[['text']]);
  const rule=index.get(traces[0].ruleId),effect=rule.ruleContract.clauses.flatMap(clause=>clause.rosterEffects).find(row=>row.id===traces[0].effectId);
  assert.equal(effect.provenance.canonicalOwnerId,'dark-angels');assert.deepEqual(effect.provenance.sourceEvidence,rule.provenance);
  const proof=runtime.chapterContext(id);assert.equal(proof.chapter,null,'Army membership invented a second Faction keyword');
  assert.equal(proof.armyApplicability.status,'DA_ARMY_CONTEXT_PROVEN');
  assert.equal(proof.armyApplicability.member.instanceId,id);
  assert.equal(proof.armyApplicability.physicalAnchors[0].instanceId,'da-source');
  assert.deepEqual(index.get(unit.canonicalUnitId).data.factionKeywords,['ADEPTUS ASTARTES']);
  assert.equal(runtime.context(id,'MODEL',unit.profiles[0].scopeId,{daArmyMembershipProven:true}).roster.daArmyMembershipProven,undefined);
 }
};
for(const condition of conditions)check(condition.recipient.canonicalId+'/source-positive-and-negative',()=>{
 const id=condition.recipient.canonicalId,keyword=condition.grantedKeywords[0],runtime=createDarkAngelsRosterRuntime(built);
 const base=roster([physical('recipient-a',id),physical('recipient-b',id),physical('ordinary',ordinary)]);
 runtime.load(base);for(const instance of ['recipient-a','recipient-b'])assertGrant(runtime,instance,keyword,false);
 const claimed=clone(base);claimed.importEvidence={faction:'DARK ANGELS'};
 for(const unit of claimed.units)Object.assign(unit,{chapter:'DARK ANGELS',chapterConfirmed:true,daArmyMembershipProven:true});
 runtime.load(claimed);for(const instance of ['recipient-a','recipient-b'])assertGrant(runtime,instance,keyword,false);
 const proven=clone(base);proven.units.push(physical('da-source',anchor));runtime.load(proven);
 for(const instance of ['recipient-a','recipient-b']){
  assertGrant(runtime,instance,keyword,true);
  const effective=runtime.effective(instance);assert.ok(effective.keywords.includes(keyword));
  const variants=projectInstanceCards(cards,runtime.state.units.find(row=>row.instanceId===instance),effective);
  assert.ok(variants.get(id).some(card=>card.fields.some(field=>field.value===keyword)),'Personal projection lost granted UNIT keyword');
 }
 assert.equal(grantTraces(projected(runtime,'ordinary')).length,0);
 const before=runtime.projection;runtime.recompute();assert.deepEqual(runtime.projection,before);
 runtime.load(JSON.parse(JSON.stringify(runtime.snapshot())));assert.deepEqual(runtime.projection,before);
 const schema=createDarkAngelsRuleSchema({book,state:base});
 const forged=runtime.context('recipient-a','UNIT',undefined,{daArmyMembershipProven:true});
 const predicate={predicate:'FIELD',subject:'UNIT',arguments:{key:'daArmyMembershipProven',equals:true},contextLevel:'ROSTER'};
 assert.equal(schema.evaluatePredicate(predicate,forged),'FALSE','Caller FIELD bypassed physical evidence');
 runtime.load(base);for(const instance of ['recipient-a','recipient-b'])assertGrant(runtime,instance,keyword,false);
 evidence.push({canonicalId:id,keyword,sourceClause:condition.eligibilityEvidence,ruleSource:condition.rule,
  positive:'PASS',unknownArmy:'PASS_NO_GRANT',forgedClaims:'PASS_NO_GRANT',repeatedUnits:2,
  effectiveAndPersonalProjection:'PASS',recomputeReload:'PASS',removedFinalAnchor:'PASS_NO_GRANT'});
});
check('all-83-membership-and-exact-26-recipients',()=>{
 const entries=book.entities.filter(row=>row.kind==='DATASHEET').map((row,n)=>physical('member-'+n,row.id));
 const runtime=createDarkAngelsRosterRuntime(built);runtime.load(roster(entries));
 const expected=new Map(conditions.map(row=>[row.recipient.canonicalId,row.grantedKeywords[0]]));
 let granted=0;
 for(const unit of runtime.projection.units){
  const traces=grantTraces(unit),keyword=expected.get(unit.canonicalUnitId);
  assert.equal(traces.length,keyword?1:0);
  if(keyword){granted++;assert.ok(unit.keywords.includes(keyword));assert.ok(unit.profiles.every(model=>!model.keywords.includes(keyword)));}
 }
 assert.equal(granted,26);assert.equal(runtime.projection.units.length,83);
 const reversed=runtime.snapshot();reversed.units.reverse();runtime.load(reversed);
 assert.equal(runtime.projection.units.reduce((n,row)=>n+grantTraces(row).length,0),26);
});
check('attachments-do-not-create-transfer-or-remove-army-applicability',()=>{
 for(const role of ['LEADER','SUPPORT']){
  const diagnostic=clone(book);diagnostic.rosterAttachmentPolicies=[{sourceId:captain,targetId:out,role,sourceIds:[index.get(captain).data.relationIds[0]],additionalLeaders:0}];
  diagnostic.compatibilityFeasibility=buildAttachmentFeasibility(diagnostic,diagnostic.rosterProfileBindings.map(binding=>({
   unitId:binding.unitId,profileId:binding.profileId,maxModels:1,intrinsicKeywords:binding.intrinsicKeywords})));
  const runtime=createDarkAngelsRosterRuntime({...built,book:diagnostic});
  const base=roster([physical('da-source',anchor),physical('eligible',out),physical('leader',captain),physical('ordinary',ordinary)]);
  runtime.load(base);assertGrant(runtime,'eligible','RAVENWING',true);
  const attached=changeAttachment(diagnostic,runtime.snapshot(),diagnostic.rosterAttachmentPolicies,'ATTACH','leader','eligible');runtime.load(attached);
  assertGrant(runtime,'eligible','RAVENWING',true);assert.equal(grantTraces(projected(runtime,'leader')).length,0);
  assert.ok(runtime.projection.formedUnits[0].keywords.includes('RAVENWING'));
  assert.ok(!projected(runtime,'leader').keywords.includes('RAVENWING'));
  const before=runtime.projection,candidate=runtime.snapshot();candidate.attachments=[];
  assert.equal(commitRosterImport({status:'READY',roster:candidate},runtime.snapshot(),value=>runtime.load(value)).status,'READY');
  assert.equal(runtime.snapshot().attachments.length,1);assert.deepEqual(runtime.projection,before);
  runtime.load(changeAttachment(diagnostic,runtime.snapshot(),diagnostic.rosterAttachmentPolicies,'DETACH','leader'));
  assertGrant(runtime,'eligible','RAVENWING',true);
  runtime.load(changeAttachment(diagnostic,runtime.snapshot(),diagnostic.rosterAttachmentPolicies,'ATTACH','leader','eligible'));
  runtime.recompute();assert.deepEqual(runtime.projection,before);
 }
});
check('changed-import-replacement-invalid-reference-and-final-anchor-removal',()=>{
 const runtime=createDarkAngelsRosterRuntime(built),state=roster([physical('da-source',anchor),physical('eligible',out)]);
 runtime.load(state);const before=runtime.snapshot(),projection=runtime.projection;
 const changed=clone(before);changed.units=changed.units.filter(row=>row.instanceId!=='da-source');
 const load=value=>runtime.load(value);
 assert.equal(commitRosterImport({status:'READY',roster:changed},runtime.snapshot(),load).status,'REPLACEMENT_REQUIRED');
 assert.deepEqual(runtime.snapshot(),before);assert.deepEqual(runtime.projection,projection);
 assert.equal(commitRosterImport({status:'READY',roster:changed},runtime.snapshot(),load,{replaceExisting:true}).status,'READY');
 assertGrant(runtime,'eligible','RAVENWING',false);
 const saved=runtime.snapshot();
 for(const id of ['unknown-id',JSON.parse(fs.readFileSync(new URL('../../space-marines/v2/generated/effective.json',import.meta.url),'utf8')).entities
  .find(row=>row.kind==='DATASHEET'&&row.data.factionKeywords.includes('ULTRAMARINES')).id]){
  const invalid=clone(saved);invalid.units[0].canonicalUnitId=id;
  assert.throws(()=>runtime.load(invalid));assert.deepEqual(runtime.snapshot(),saved);
 }
 const wrong=clone(saved);wrong.units[0].modelRows[0].canonicalProfileId=index.get(anchor).data.profileIds[0];
 assert.throws(()=>runtime.load(wrong));assert.deepEqual(runtime.snapshot(),saved);
 assert.equal(commitRosterImport({status:'NEEDS_BINDINGS',roster:null},saved,load).status,'NEEDS_BINDINGS');
 assert.deepEqual(runtime.snapshot(),saved);
});
check('mutation-controls-remove-guard-and-broaden-scope-are-detected',()=>{
 const source=built.book.entities.find(row=>row.id==='army-rule-da-c944806a43ff4c999f9e');
 const ungated=clone(book),contract=ungated.entities.find(row=>row.id===source.id).ruleContract;
 for(const clause of contract.clauses)for(const effect of clause.rosterEffects)
  effect.conditions=effect.conditions.filter(condition=>condition.predicate.arguments?.key!=='daArmyMembershipProven');
 const runtime=createDarkAngelsRosterRuntime({...built,book:ungated});runtime.load(roster([physical('eligible',out)]));
 assert.throws(()=>assertGrant(runtime,'eligible','RAVENWING',false),/eligible\/RAVENWING/);
 const wrong=clone(book);wrong.entities.find(row=>row.id===source.id).ruleContract.clauses[0].rosterEffects[0].targetBinding='SOURCE_UNIT';
 assert.throws(()=>createDarkAngelsRosterRuntime({...built,book:wrong}).load(roster([physical('da-source',anchor),physical('eligible',out)])),/Root Army Rule requires global targets/);
 const broadened=clone(book);broadened.rosterAttachmentPolicies=[{sourceId:captain,targetId:out,role:'LEADER',
  sourceIds:[index.get(captain).data.relationIds[0]],additionalLeaders:0}];
 broadened.compatibilityFeasibility=buildAttachmentFeasibility(broadened,broadened.rosterProfileBindings.map(binding=>({
  unitId:binding.unitId,profileId:binding.profileId,maxModels:1,intrinsicKeywords:binding.intrinsicKeywords})));
 for(const clause of broadened.entities.find(row=>row.id===source.id).ruleContract.clauses)
  for(const effect of clause.rosterEffects)effect.unitScope='FORMED';
 const expanded=createDarkAngelsRosterRuntime({...built,book:broadened});
 const state=roster([physical('da-source',anchor),physical('eligible',out),physical('leader',captain)]);
 expanded.load(changeAttachment(broadened,state,broadened.rosterAttachmentPolicies,'ATTACH','leader','eligible'));
 assert.throws(()=>assertGrant(expanded,'leader','RAVENWING',false),/leader\/RAVENWING/);
});
console.log(JSON.stringify({status:'PASS',checks,evidence,counts:{checks:checks.length,sourceConditions:26,
 deathwing:18,ravenwing:8,membership:83,repeatedPositiveRecipients:52,mutationControls:3},
 limitations:{genericOnlyArmyContext:'NOT_PROVEN',intrinsicChapterForCommonUnits:'UNCHANGED_NOT_PROVEN',
  attachmentEligibility:'DIAGNOSTIC_ONLY',reimport:'SHARED_COMMIT_BOUNDARY_ONLY_NOT_DA_IMPORTER',
  realNewRecruitExportTested:false,browserVerified:false}},null,2));
