/** Focused review-gate mutations. All inputs are disposable in-memory clones;
 * production sources, canonical data and generated outputs are never edited. */
import assert from 'node:assert/strict';
import {loadSourceCompletenessInputs,assertSourceCompletenessGate,reviewFingerprint} from '../books/shared/roster-v2/source-completeness.mjs';
import {sourceEffectRegressionResult} from './source-effect-regression-qa.mjs';
import {chargeSourceGuardResult} from './charge-effects-qa.mjs';
import {sevenEffectsGuardResult} from '../books/tyranids/v2/seven-effects-qa.mjs';

const inputs=loadSourceCompletenessInputs(),clone=structuredClone,mutations=[];
const verified=sourceEffectRegressionResult.verified;
assert.ok(Array.isArray(verified),'Runtime guard must expose actual verified case identities');
assert.equal(verified.length,18);
const baseline=assertSourceCompletenessGate({...inputs,verifiedIds:verified,requireRuntime:true});
assert.equal(baseline.inventoryStatus,'PROVEN');assert.equal(baseline.semanticCompleteness,'NOT_PROVEN');
assert.equal(baseline.executableVerified,18);assert.equal(baseline.status,'PARTIAL');

const expectation=id=>inputs.expectations.find(item=>item.id===id);
const guardian=expectation('tyr-guardian');assert.ok(guardian,'Independent Guardian source expectation missing');
const charge=inputs.expectations.find(item=>item.expectedOperation?.field==='chargeRoll');
assert.ok(charge,'Independent typed Charge source expectation missing');
const book=(candidate,id)=>candidate.books.find(input=>input.bookId===id);
const rule=(candidate,e)=>book(candidate,e.bookId).executionBook.entities.find(entity=>entity.id===e.source.canonicalId);
const executable=(candidate,e)=>rule(candidate,e).ruleContract.clauses.flatMap(clause=>clause.rosterEffects||[]);
const classification=(candidate,e)=>candidate.review.books[e.bookId].blocks.flatMap(block=>block.clauses)
  .find(clause=>clause.independentExpectation?.caseId===e.id);
function rejected(id,code,mutate){
  const candidate=clone(inputs);mutate(candidate);
  assert.throws(()=>assertSourceCompletenessGate({...candidate,verifiedIds:verified,requireRuntime:true}),
    error=>error.message.startsWith(code+':'),id+' escaped the independent gate or failed for the wrong reason');
  mutations.push({id,detected:code});
}

// M01 retains the accepted canonical fact. Missing executable data cannot shrink
// the independent obligation list, even when the remaining contract count falls.
rejected('M01_GUARDIAN_CONTRACT_REMOVED','EXECUTABLE_MISSING',candidate=>{
  assert.ok(book(candidate,guardian.bookId).facts.entities.some(entity=>entity.id===guardian.source.canonicalId));
  delete rule(candidate,guardian).ruleContract;
});
rejected('M01_GUARDIAN_BINDING_REMOVED','EXECUTABLE_MISSING',candidate=>{
  for(const clause of rule(candidate,guardian).ruleContract.clauses)clause.rosterEffects=[];
});
rejected('M02_NEW_CANONICAL_RULE','UNREVIEWED_SOURCE_RULE',candidate=>{
  const input=book(candidate,guardian.bookId),entity=clone(input.facts.entities.find(entity=>entity.id===guardian.source.canonicalId));
  entity.id='unreviewed-source-rule-mutation';input.facts.entities.push(entity);
});
rejected('M03_SOURCE_BLOCK_TEXT_CHANGED','UNREVIEWED_SOURCE_BLOCK',candidate=>{
  const entity=book(candidate,guardian.bookId).facts.entities.find(entity=>entity.id===guardian.source.canonicalId);
  entity.data.blocks[0].text+=' A newly accepted semantic clause requires source review.';
});
rejected('M03_SOURCE_REVISION_CHANGED','UNREVIEWED_SOURCE_REVISION',candidate=>{
  book(candidate,guardian.bookId).sourceReview.enrollmentFingerprint='unreviewed-official-version';
});
rejected('M04_CHARGE_PLUS_TWO','INDEPENDENT_EFFECT_MISMATCH',candidate=>{
  const operation=executable(candidate,charge).find(effect=>effect.field==='chargeRoll');assert.ok(operation);
  assert.equal(operation.value,1);operation.value=2;
});
rejected('M05_MODEL_CHANGED_TO_UNIT','INDEPENDENT_EFFECT_MISMATCH',candidate=>{
  const operation=executable(candidate,guardian).find(effect=>effect.operation==='GRANT_MODEL_ABILITY');assert.ok(operation);
  assert.equal(operation.targetSubject,'MODEL');operation.targetSubject='UNIT';
});

// The imported adapters really remove the computed metric from the effective
// result used by production projectFormedUnitCards. Its independent comparator
// must fail although the executor's original computed result remains correct.
assert.ok(chargeSourceGuardResult.mutations.includes(charge.id+'/missing-presentation'),
  'M06 requires the executed production-projection mutation, not merely a metadata assertion');
mutations.push({id:'M06_COMPUTED_CHARGE_PRESENTATION_REMOVED',detected:'Independent Charge source -> executor -> presentation',
  evidence:charge.id+'/missing-presentation'});
assert.throws(()=>assertSourceCompletenessGate({...inputs,verifiedIds:verified.filter(id=>id!==charge.id),requireRuntime:true}),
  /RUNTIME_PRESENTATION_NOT_VERIFIED:/,'Readiness must require the passing production presentation proof');
mutations.push({id:'M06_RUNTIME_PRESENTATION_PROOF_MISSING',detected:'RUNTIME_PRESENTATION_NOT_VERIFIED'});
rejected('M07_EXECUTABLE_DOWNGRADED_TO_BATTLE','REQUIRED_CLASSIFICATION_MISMATCH',candidate=>{
  const clause=classification(candidate,guardian);assert.ok(clause);clause.classification='BATTLE_DEPENDENT';
});
rejected('M08_INDEPENDENT_EXPECTATION_REMOVED','INDEPENDENT_EXPECTATION_MISSING',candidate=>{
  candidate.expectations=candidate.expectations.filter(item=>item.id!==guardian.id);
});

// These two existing guard mutants execute actual adapters against independent
// expected results; structural metadata checks above do not replace that proof.
assert.ok(sevenEffectsGuardResult.mutationResults.some(item=>item.id===guardian.id&&item.mutation==='deleted-executable-binding'));
assert.ok(chargeSourceGuardResult.mutations.includes(charge.id+'/wrong-value'));
assert.ok(chargeSourceGuardResult.mutations.includes(charge.id+'/wrong-recipient'));

rejected('NEW_SIXTH_BOOK_WITHOUT_REVIEW','UNREVIEWED_ARMY_BOOK',candidate=>{
  candidate.registeredBookIds.push('unreviewed-sixth-book');
});
rejected('MISSING_CLASSIFICATION_RECORD','UNREVIEWED_SOURCE_RULE',candidate=>{
  candidate.review.books[guardian.bookId].blocks.find(block=>block.canonicalId===guardian.source.canonicalId).clauses=[];
});
rejected('CLASSIFICATION_WITHOUT_EXPLANATION','UNREVIEWED_CLAUSE',candidate=>{
  delete classification(candidate,guardian).explanation;
});
rejected('NEW_CLAUSE_WITHOUT_REVIEW','UNREVIEWED_CLAUSE',candidate=>{
  candidate.review.books[guardian.bookId].blocks.find(block=>block.canonicalId===guardian.source.canonicalId).clauses.push({
    id:'unreviewed-semantic-clause',canonicalId:guardian.source.canonicalId,classification:'BATTLE_DEPENDENT'
  });
});
rejected('HISTORICAL_NON_EXECUTABLE_CLAUSE_REMOVED','HISTORICAL_REVIEW_MISSING',candidate=>{
  const block=candidate.review.books['death-guard'].blocks.find(block=>block.clauses.some(clause=>clause.id==='death-guard:147'));
  assert.ok(block&&block.clauses.length>1,'Historical control must leave its source block and sibling clauses present');
  block.clauses=block.clauses.filter(clause=>clause.id!=='death-guard:147');
});
for(const field of ['owner','kind'])rejected('WRONG_REVIEW_BLOCK_'+field.toUpperCase(),'WRONG_CLASSIFICATION_OWNER',candidate=>{
  candidate.review.books[guardian.bookId].blocks.find(block=>block.canonicalId===guardian.source.canonicalId)[field]='wrong-reviewed-'+field;
});
rejected('EMPTY_INDEPENDENT_OPERATIONS','INDEPENDENT_EXPECTATION_INVALID',candidate=>{
  const independent=candidate.expectations.find(item=>item.id===guardian.id);independent.expectedOperations=[];
  const {expectationPath,...value}=independent;
  classification(candidate,guardian).independentExpectation.sha256=reviewFingerprint(value);
});
rejected('CANONICAL_TOP_LEVEL_METADATA_CHANGED','UNREVIEWED_SOURCE_BLOCK',candidate=>{
  book(candidate,guardian.bookId).facts.entities.find(entity=>entity.id===guardian.source.canonicalId).bookId='wrong-book';
});

// No mutation touched the original loaded inputs or persisted a source change.
assert.deepEqual(assertSourceCompletenessGate({...inputs,verifiedIds:verified,requireRuntime:true}),baseline);
export const sourceCompletenessMutationResult={status:'PASS',requiredMutationsDetected:8,mutations,
  baseline,independentRuntimeCases:verified.length,productionFilesWritten:0,
  boundary:'Structural changes require review; arbitrary English understanding and all historical executable results are NOT_PROVEN.'};
console.log(JSON.stringify(sourceCompletenessMutationResult));
