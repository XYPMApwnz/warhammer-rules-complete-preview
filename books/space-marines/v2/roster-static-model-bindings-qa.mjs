/** Source-literal expectations for one physical attached-MODEL rule. The
 * fixtures are constructed diagnostics, not New Recruit exports or browser QA.
 */
import assert from 'node:assert/strict';
import {buildSpaceMarinesContracts} from './rule-contract-build.mjs';
import {createSpaceMarinesRuleSchema} from './rule-contract-schema.mjs';
import {bindSpaceMarinesStaticModels,physicalStaticBindings} from './roster-static-model-bindings.mjs';
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
  const derived=bindSpaceMarinesStaticModels(book,snapshot);mutate?.(derived);
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
  }
  assert.equal(fnp(projection,'peer'),undefined,'Independent repeated Datasheet has no foreign FNP');
}
const original=JSON.stringify(book),first=run(state);check(first.projection);assert.equal(JSON.stringify(book),original,'Canonical input mutated');
assert.deepEqual(bindSpaceMarinesStaticModels(first.book,state),first.book,'Recompute accumulates derived clauses');
const reloaded=run(JSON.parse(JSON.stringify(state)));assert.deepEqual(reloaded.projection,first.projection,'Snapshot reload changes physical grant');
const detached=clone(state);detached.attachments=detached.attachments.filter(link=>link.leaderInstanceId!=='kaius-a');
const noSource=run(detached).projection;assert.equal(fnp(noSource,'captain-a'),undefined);assert.equal(fnp(noSource,'captain-b'),4);
assert.deepEqual(run(state).projection,first.projection,'Reattach does not restore exact source grant');
const swapped=clone(state);swapped.attachments=swapped.attachments.map(link=>link.leaderInstanceId.startsWith('kaius-')?
  {...link,bodyguardInstanceId:link.bodyguardInstanceId==='body-a'?'body-b':'body-a'}:link);
const changed=run(swapped).projection;assert.equal(traces(changed,'captain-a')[0].sourceInstanceId,'kaius-b');
assert.equal(traces(changed,'captain-b')[0].sourceInstanceId,'kaius-a');
const grouped=clone(state);grouped.units.find(unit=>unit.instanceId==='kaius-a').startingStrength=2;
grouped.units.find(unit=>unit.instanceId==='kaius-a').modelRows[0].quantity=2;
assert.equal(fnp(run(grouped).projection,'captain-a'),undefined,'Aggregate source quantity must not invent an exact excluded MODEL');
const twoRows=clone(state),ambiguous=twoRows.units.find(unit=>unit.instanceId==='kaius-a');ambiguous.startingStrength=2;
ambiguous.modelRows.push({...clone(ambiguous.modelRows[0]),rowId:'separate-source-row'});
assert.equal(fnp(run(twoRows).projection,'captain-a'),undefined,'Multiple possible source MODELs must not guess a bearer');
const clauseList=model=>model.entities.find(entity=>entity.id===RULE).ruleContract.clauses.filter(clause=>clause.physicalStaticSource);
assert.equal(clauseList(first.book).length,2);
for(const clause of clauseList(first.book)){
  assert.equal(clause.rosterEffects[0].provenance.canonicalClauseId,RULE+'#text:0-116');
  assert.deepEqual(clause.rosterEffects[0].provenance.sourceEvidence,index.get(RULE).provenance);
}
const mutations=[];
function mutation(name,change){let failed=false;try{check(run(state,change).projection);}catch{failed=true;}assert.equal(failed,true,'Undetected mutation '+name);mutations.push(name);}
mutation('source-model-not-excluded',model=>clauseList(model).forEach(clause=>clause.rosterEffects[0].conditions=clause.rosterEffects[0].conditions.filter(condition=>condition.predicate.op!=='NOT')));
mutation('non-character-models-included',model=>clauseList(model).forEach(clause=>clause.rosterEffects[0].conditions=clause.rosterEffects[0].conditions.filter(condition=>condition.predicate.predicate!=='MODEL_KEYWORD')));
mutation('physical-source-unit-gate-removed',model=>clauseList(model).forEach(clause=>clause.rosterEffects[0].conditions=clause.rosterEffects[0].conditions.filter(condition=>condition.predicate.arguments?.key!=='physicalUnitInstanceId')));
mutation('wrong-fnp-threshold',model=>clauseList(model).forEach(clause=>clause.rosterEffects[0].ability.value=3));
mutation('wrong-physical-recipient-binding',model=>clauseList(model).forEach(clause=>clause.rosterEffects[0].targetBinding='SOURCE_UNIT_MODELS'));
const wrongSource=clone(book);wrongSource.entities.find(entity=>entity.id===RULE).parentId=CAPTAIN;
assert.throws(()=>bindSpaceMarinesStaticModels(wrongSource,state),/Unreviewed/);
const staleSource=clone(book);staleSource.entities.find(entity=>entity.id===RULE).provenance.sha256='0'.repeat(64);
assert.throws(()=>bindSpaceMarinesStaticModels(staleSource,state),/Unreviewed/);
console.log(JSON.stringify({status:'PASS',rule:RULE,physicalSources:2,independentFormations:2,
  cases:['attached-character-only','exact-source-model-excluded','physical-source-attribution','repeated-unit-isolation',
    'detach','reattach','source-reattach-to-other-bodyguard','snapshot-reload','recompute-idempotence',
    'unknown-aggregate-source-withheld','multiple-source-model-rows-withheld','canonical-provenance-preserved'],
  mutations,sourceProofNegativeControls:2,realNewRecruitExportTested:false,browserVerified:false},null,2));
