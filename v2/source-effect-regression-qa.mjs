/** Existing independent source guard: seven Charge, one AdMech FNP and seven
 * Tyranids obligations. The historical census is unchanged. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chargeSourceGuardResult} from './charge-effects-qa.mjs';
import {nativeFnpExpectation,nativeFnpGuardResult} from '../books/adeptus-mechanicus/v2/native-fnp-qa.mjs';
import {sevenEffectsExpectations,sevenEffectsGuardResult} from '../books/tyranids/v2/seven-effects-qa.mjs';
import {criticalHitExpectations,criticalHitGuardResult} from '../books/death-guard/v2/critical-hit-qa.mjs';
import {criticalHitThresholdExpectation,criticalHitThresholdGuardResult} from '../books/chaos-space-marines/v2/critical-hit-threshold-qa.mjs';
import {aggregateInventoryGuardResult} from './aggregate-physical-inventory-qa.mjs';
import {nativeReferencePresentationGuardResult} from './native-reference-presentation-qa.mjs';
import {assessEffectCoverage} from '../books/shared/roster-v2/source-effect-expectations-qa.mjs';
import {assertSourceCompletenessGate,loadSourceCompletenessInputs} from '../books/shared/roster-v2/source-completeness.mjs';
const read=file=>JSON.parse(fs.readFileSync(new URL(file,import.meta.url),'utf8'));
const ledger=read('../books/shared/roster-v2/source-effect-coverage-baseline.json'),
  charge=read('../books/shared/roster-v2/charge-source-expectations.json').cases,
  expectations=[...charge,nativeFnpExpectation,...sevenEffectsExpectations,...criticalHitExpectations,criticalHitThresholdExpectation],
  verified=[...chargeSourceGuardResult.results.map(r=>r.id),nativeFnpGuardResult.id,...sevenEffectsGuardResult.scenarios.map(r=>r.id),...criticalHitGuardResult.ids,criticalHitThresholdGuardResult.id];
assert.equal(chargeSourceGuardResult.status,'PASS');assert.equal(nativeFnpGuardResult.status,'PASS');
assert.equal(sevenEffectsGuardResult.status,'PASS');assert.equal(sevenEffectsExpectations.length,7);
assert.equal(criticalHitGuardResult.status,'PASS');assert.equal(criticalHitThresholdGuardResult.status,'PASS');assert.equal(aggregateInventoryGuardResult.status,'PASS');
assert.equal(nativeReferencePresentationGuardResult.status,'PASS');
const coverage=assessEffectCoverage(ledger,expectations,verified);
assert.equal(coverage.freshlyVerified,18);assert.equal(coverage.historicalRequired,397);assert.equal(coverage.allRequirementsPassed,false);
assert.equal(coverage.statuses.EXECUTABLE_MISSING||0,0);assert.equal(coverage.statuses.EXECUTABLE_BROKEN||0,0);
for(const expectation of [nativeFnpExpectation,...sevenEffectsExpectations])
  assert.throws(()=>assessEffectCoverage(ledger,expectations,verified.filter(id=>id!==expectation.id)),/Unverified current obligation/);
const completeness=assertSourceCompletenessGate({...loadSourceCompletenessInputs(),verifiedIds:verified,requireRuntime:true});
export const sourceEffectRegressionResult={status:'PASS',obligations:18,coverage,completeness,verified,aggregateInventoryGuardResult,nativeReferencePresentationGuardResult,remainingConfirmedDefects:0,
  scope:'Seven Charge, one AdMech FNP, seven Tyranids and three Critical Hit threshold obligations freshly verified; other historical classifications and capability gaps are not fresh PASS.'};
console.log(JSON.stringify(sourceEffectRegressionResult));
