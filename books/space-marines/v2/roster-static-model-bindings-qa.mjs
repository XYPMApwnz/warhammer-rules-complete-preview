/** Source-literal expectations for one physical attached-MODEL rule. The
 * fixtures are constructed diagnostics, not New Recruit exports or browser QA.
 */
import assert from 'node:assert/strict';
import {buildSpaceMarinesRuntimeContracts as buildSpaceMarinesContracts} from './rule-contract-build.mjs';
import {createSpaceMarinesRuleSchema} from './rule-contract-schema.mjs';
import {physicalStaticBindings} from './roster-static-model-bindings.mjs';
import {resolvePhysicalStaticModelEffects} from '../../shared/roster-v2/physical-static-model.mjs';
import {sourceSnapshot} from '../../shared/source-refs-v2/source-refs.mjs';
import {sourceFixture} from '../../../tests/helpers/source-refs-fixtures.mjs';
import {formRoster} from '../../shared/roster-v2/context.mjs';
import {buildSpaceMarinesImportBook} from './roster-import-build.mjs';
import {createSpaceMarinesRosterService} from './roster-import.mjs';
import {createSpaceMarinesRosterRuntime} from './roster-runtime.mjs';
import {executeRosterEffects,validateRosterEffects} from '../../shared/roster-v2/effects.mjs';
import {withRosterDetachments} from '../../shared/roster-v2/context.mjs';

const clone=structuredClone,built=buildSpaceMarinesContracts(),book=built.book;
const index=new Map(book.entities.map(entity=>[entity.id,entity]));
const RULE='ability-sm-c4061e257e81492f',KAIUS='unit-sm-3460439c3a774c66';
const CAPTAIN='unit-sm-99eb03d4f2d448e2',BODY='unit-sm-717dd0d07e764a70';
const QUOTE='Veteran Bodyguard: While this model is attached to a unit, other CHARACTER models in this unit have Feel No Pain 4+.';
assert.equal(index.get(RULE).data.text,QUOTE);
assert.deepEqual(physicalStaticBindings.map(row=>[row.ruleId,row.sourceUnitId,row.sourceProfileId]),
  [[RULE,KAIUS,'model-sm-574846fb8e3e4e77']]);
function unit(id,canonicalUnitId,quantity=1){
  const source=index.get(canonicalUnitId),canonicalProfileId=source.data.profileIds[0];
  return {instanceId:id,canonicalUnitId,startingStrength:quantity,
    modelRows:[{rowId:'source-row',canonicalProfileId,compositionScope:'MODEL_ROW',quantity,selections:[]}],
    selections:[],equipmentContextKnown:true,enhancementIds:[],enhancementAssignments:[],warlord:null};
}
const state={schema:'roster-v2/roster',bookId:'space-marines',rosterId:'physical-static-model-diagnostic',
  detachmentIds:['detachment-sm-6341f5a9b9584677'],
  detachments:[{instanceId:'detachment',canonicalDetachmentId:'detachment-sm-6341f5a9b9584677'}],
  units:[unit('kaius-a',KAIUS),unit('captain-a',CAPTAIN),unit('body-a',BODY,5),
    unit('kaius-b',KAIUS),unit('captain-b',CAPTAIN),unit('body-b',BODY,5),unit('peer',CAPTAIN)],
  attachments:[{leaderInstanceId:'kaius-a',bodyguardInstanceId:'body-a',role:'SUPPORT'},
    {leaderInstanceId:'captain-a',bodyguardInstanceId:'body-a',role:'LEADER'},
    {leaderInstanceId:'kaius-b',bodyguardInstanceId:'body-b',role:'SUPPORT'},
    {leaderInstanceId:'captain-b',bodyguardInstanceId:'body-b',role:'LEADER'}],warlordInstanceId:null};
const schema=createSpaceMarinesRuleSchema({book,state,conditionInputs:[
  {key:'equipmentBearerSatisfied',arguments:{quantityProof:'POSITIVE_SELECTION'},clearUnrequestedEquipment:false}]});
const evaluator=withRosterDetachments(schema);
function run(snapshot,mutate){
  const derived=clone(book);mutate?.(derived);
  schema.validateContracts(derived);validateRosterEffects(derived,schema.validatePredicate,evaluator.evaluatePredicate);
  return {book:derived,projection:executeRosterEffects(derived,snapshot,evaluator)};
}
const row=(projection,id)=>projection.units.find(unit=>unit.instanceId===id);
const fnp=(projection,id)=>row(projection,id).profiles.flatMap(model=>model.abilities).find(ability=>ability.name==='Feel No Pain')?.value;
const traces=(projection,id)=>row(projection,id).applied.filter(trace=>trace.ruleId===RULE);
function check(projection){
  for(const suffix of ['a','b']){
    assert.equal(fnp(projection,'captain-'+suffix),4,'Other CHARACTER MODEL requires source-backed FNP4');
    assert.equal(fnp(projection,'kaius-'+suffix),undefined,'Exact physical source MODEL must be excluded');
    assert.equal(fnp(projection,'body-'+suffix),undefined,'Non-CHARACTER bodyguards cannot receive the grant');
    const applied=traces(projection,'captain-'+suffix);assert.equal(applied.length,1,'One independent physical source trace');
    assert.equal(applied[0].sourceInstanceId,'kaius-'+suffix,'Physical source attribution must not cross formations');
    assert.equal(applied[0].ruleId,RULE);
    const source=row(projection,'kaius-'+suffix).profiles[0];
    const clauseId=RULE+'::physical-static/'+JSON.stringify(['kaius-'+suffix,source.scopeId]);
    assert.equal(applied[0].clauseId,clauseId);assert.equal(applied[0].effectId,clauseId+'/feel-no-pain');
  }
  assert.equal(fnp(projection,'peer'),undefined,'Independent repeated Datasheet has no foreign FNP');
}
const original=JSON.stringify(book),first=run(state);check(first.projection);assert.equal(JSON.stringify(book),original,'Canonical input mutated');
assert.deepEqual(run(state).book,first.book,'Recompute changed the static canonical program');
assert.equal(resolvePhysicalStaticModelEffects(book,first.projection).length,2,'Two temporary execution records, no per-instance canonical clauses');
const reloaded=run(JSON.parse(JSON.stringify(state)));assert.deepEqual(reloaded.projection,first.projection,'Snapshot reload changes physical grant');
const detached=clone(state);detached.attachments=detached.attachments.filter(link=>link.leaderInstanceId!=='kaius-a');
const noSource=run(detached).projection;assert.equal(fnp(noSource,'captain-a'),undefined);assert.equal(fnp(noSource,'captain-b'),4);
assert.deepEqual(run(state).projection,first.projection,'Reattach does not restore exact source grant');
const swapped=clone(state);swapped.attachments=swapped.attachments.map(link=>link.leaderInstanceId.startsWith('kaius-')?
  {...link,bodyguardInstanceId:link.bodyguardInstanceId==='body-a'?'body-b':'body-a'}:link);
const changed=run(swapped).projection;assert.equal(traces(changed,'captain-a')[0].sourceInstanceId,'kaius-b');
assert.equal(traces(changed,'captain-b')[0].sourceInstanceId,'kaius-a');
// Executor-only isolation diagnostic, not a claim that MFM permits two SUPPORT
// instances in this formation. The separate native scenario proves real policy
// acceptance. Identical PROFILE IDs must not exclude the other physical MODEL.
const sameGroup=clone(state);sameGroup.attachments.find(edge=>edge.leaderInstanceId==='kaius-b').bodyguardInstanceId='body-a';
const peers=run(sameGroup).projection;
assert.equal(fnp(peers,'kaius-a'),4);assert.equal(fnp(peers,'kaius-b'),4);
assert.deepEqual(traces(peers,'kaius-a').map(row=>row.sourceInstanceId),['kaius-b']);
assert.deepEqual(traces(peers,'kaius-b').map(row=>row.sourceInstanceId),['kaius-a']);
assert.equal(traces(peers,'captain-a').length,1,'The unchanged interpreter records no second trace for an identical no-op FNP grant');
assert.equal(traces(peers,'captain-a')[0].sourceInstanceId,'kaius-a');assert.equal(fnp(peers,'captain-b'),undefined);
const grouped=clone(state);grouped.units.find(unit=>unit.instanceId==='kaius-a').startingStrength=2;
grouped.units.find(unit=>unit.instanceId==='kaius-a').modelRows[0].quantity=2;
assert.equal(fnp(run(grouped).projection,'captain-a'),undefined,'Aggregate source quantity must not invent an exact excluded MODEL');
const twoRows=clone(state),ambiguous=twoRows.units.find(unit=>unit.instanceId==='kaius-a');ambiguous.startingStrength=2;
ambiguous.modelRows.push({...clone(ambiguous.modelRows[0]),rowId:'separate-source-row'});
assert.equal(fnp(run(twoRows).projection,'captain-a'),undefined,'Multiple possible source MODELs must not guess a bearer');
const clauseList=model=>model.entities.find(entity=>entity.id===RULE).ruleContract.clauses.filter(clause=>clause.rosterEffects.some(effect=>effect.physicalSource));
assert.equal(clauseList(first.book).length,1,'One static clause serves both physical sources');
for(const entry of resolvePhysicalStaticModelEffects(book,first.projection)){
  const proof=sourceSnapshot(entry.effect,{book});
  assert.equal(proof.canonicalClauseId,RULE+'#text:0-116');
  assert.deepEqual(proof.sourceEvidence,sourceSnapshot(index.get(RULE),{book}));
}
const mutations=[];
function mutation(name,change,expected){
  assert.throws(()=>check(run(state,change).projection),error=>expected.test(error.message),'Undetected or unrelated mutation '+name);mutations.push(name);
}
mutation('source-model-not-excluded',model=>clauseList(model).forEach(clause=>clause.rosterEffects[0].physicalSource.excludeExactSourceModel=false),/Physical static MODEL binding: invalid descriptor/);
mutation('non-character-models-included',model=>clauseList(model).forEach(clause=>clause.rosterEffects[0].conditions=clause.rosterEffects[0].conditions.filter(condition=>condition.predicate.predicate!=='MODEL_KEYWORD')),/Physical static MODEL binding: invalid attached MODEL operation/);
mutation('physical-source-unit-gate-removed',model=>clauseList(model).forEach(clause=>delete clause.rosterEffects[0].physicalSource),/Exact physical source MODEL must be excluded/);
mutation('wrong-fnp-threshold',model=>clauseList(model).forEach(clause=>clause.rosterEffects[0].ability.value=3),/Other CHARACTER MODEL requires source-backed FNP4/);
mutation('wrong-physical-recipient-binding',model=>clauseList(model).forEach(clause=>clause.recipients.find(recipient=>recipient.id===clause.rosterEffects[0].recipientId).from='SOURCE_UNIT_MODELS'),/Physical static MODEL binding: invalid attached MODEL operation/);
const wrongSource=clone(book);wrongSource.entities.find(entity=>entity.id===RULE).parentId=CAPTAIN;
assert.throws(()=>run(state,model=>model.entities.find(entity=>entity.id===RULE).parentId=CAPTAIN),/Rule Contract V2: source provenance\/owner severed/);
const staleSource=clone(book);sourceFixture(staleSource.entities.find(entity=>entity.id===RULE)).provenance.sha256='0'.repeat(64);
assert.throws(()=>{schema.validateContracts(staleSource);validateRosterEffects(staleSource,schema.validatePredicate,evaluator.evaluatePredicate);},/Physical static MODEL binding: unconfirmed source provenance/);
const forged=formRoster(book,state);forged.units[0].profiles[0].scopeId='forged-source-scope';
assert.throws(()=>resolvePhysicalStaticModelEffects(book,forged),/Physical selection binding: unresolved derived physical MODEL group/);
// Native acceptance uses real source-owned import vocabulary and MFM policies;
// the constructed interpreter graph above never substitutes for this proof.
const nativeBook=buildSpaceMarinesImportBook(),nativeOriginal=JSON.stringify(nativeBook),native=createSpaceMarinesRosterService(nativeBook);
const nativeIndex=new Map(nativeBook.entities.map(entity=>[entity.id,entity]));
const nativeText='+ FACTION KEYWORD: Space Marines\n+ DETACHMENT: '+nativeIndex.get('detachment-sm-6341f5a9b9584677').data.title+'\n'+
  '1x Kaius Konorius (9999 pts)\n• 1x Kaius Konorius\n1x Captain (9999 pts)\n• 1x Captain\n'+
  '5x Assault Intercessor Squad (9999 pts)\n• 4x Assault Intercessor\n• 1x Assault Intercessor Sergeant\n';
assert.equal(native.import(nativeText).status,'READY');
native.attach('parsed-unit-2','parsed-unit-3');native.attach('parsed-unit-1','parsed-unit-3');
assert.deepEqual(Object.fromEntries(native.snapshot().attachments.map(edge=>[edge.leaderInstanceId,edge.role])),
  {'parsed-unit-1':'SUPPORT','parsed-unit-2':'LEADER'});
assert.equal(fnp(native.projection,'parsed-unit-2'),4);assert.equal(fnp(native.projection,'parsed-unit-1'),undefined);
assert.equal(fnp(native.projection,'parsed-unit-3'),undefined);
assert.equal(native.effective('parsed-unit-2').attachedRuleTexts.find(row=>row.ruleId===RULE)?.sourceInstanceId,'parsed-unit-1');
const nativeSaved=native.snapshot();native.detach('parsed-unit-1');assert.equal(fnp(native.projection,'parsed-unit-2'),undefined);
native.reattach('parsed-unit-1','parsed-unit-3');assert.equal(fnp(native.projection,'parsed-unit-2'),4);
native.load(nativeSaved);native.recompute();assert.equal(fnp(native.projection,'parsed-unit-2'),4);
const observed=service=>JSON.stringify({state:service.snapshot(),projection:service.projection,
  contexts:service.state.units.map(unit=>service.context(unit.instanceId)),effective:service.state.units.map(unit=>service.effective(unit.instanceId))},
  (_key,value)=>value instanceof Set?[...value].sort():value);
const nativeRuntime=createSpaceMarinesRosterRuntime(nativeBook);nativeRuntime.load(nativeSaved);const before=observed(nativeRuntime);
const wrongRole=clone(nativeSaved);wrongRole.attachments.find(edge=>edge.leaderInstanceId==='parsed-unit-1').role='LEADER';
assert.throws(()=>nativeRuntime.load(wrongRole),error=>error instanceof TypeError&&error.message==='Invalid attachment role');
assert.equal(observed(nativeRuntime),before,'Rejected MFM attachment role leaves snapshot context projection and effective unchanged');
const wrongProfile=clone(nativeSaved);wrongProfile.units[0].modelRows[0].canonicalProfileId=nativeIndex.get(CAPTAIN).data.profileIds[0];
assert.throws(()=>nativeRuntime.load(wrongProfile),error=>error instanceof TypeError&&error.message==='Invalid MODEL profile/quantity');
assert.equal(observed(nativeRuntime),before);
assert.equal(JSON.stringify(nativeBook),nativeOriginal,'Native operations must not mutate the source book');
console.log(JSON.stringify({status:'PASS',rule:RULE,physicalSources:2,independentFormations:2,
  cases:['attached-character-only','exact-source-model-excluded','physical-source-attribution','repeated-unit-isolation',
    'detach','reattach','source-reattach-to-other-bodyguard','snapshot-reload','recompute-idempotence',
    'unknown-aggregate-source-withheld','multiple-source-model-rows-withheld','canonical-provenance-preserved','same-profile-exact-scope-exclusion'],
  mutations,sourceProofNegativeControls:3,nativeMfmScenario:'PASS',nativeRoles:['LEADER','SUPPORT'],atomicNativeRejections:2,
  realNewRecruitExportTested:false,browserVerified:false},null,2));
