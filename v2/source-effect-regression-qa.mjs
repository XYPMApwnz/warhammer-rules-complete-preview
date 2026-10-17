/** Existing independent source guard: seven Charge, one AdMech FNP and seven
 * Tyranids obligations. The historical census is unchanged. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chargeSourceGuardResult} from './charge-effects-qa.mjs';
import {nativeFnpExpectation,nativeFnpGuardResult} from '../books/adeptus-mechanicus/v2/native-fnp-qa.mjs';
import {sevenEffectsExpectations,sevenEffectsGuardResult} from '../books/tyranids/v2/seven-effects-qa.mjs';
import {assessEffectCoverage} from '../books/shared/roster-v2/source-effect-expectations-qa.mjs';
const read=file=>JSON.parse(fs.readFileSync(new URL(file,import.meta.url),'utf8'));
const ledger=read('../books/shared/roster-v2/source-effect-coverage-baseline.json'),
  charge=read('../books/shared/roster-v2/charge-source-expectations.json').cases,
  expectations=[...charge,nativeFnpExpectation,...sevenEffectsExpectations],
  verified=[...chargeSourceGuardResult.results.map(r=>r.id),nativeFnpGuardResult.id,...sevenEffectsGuardResult.scenarios.map(r=>r.id)];
assert.equal(chargeSourceGuardResult.status,'PASS');assert.equal(nativeFnpGuardResult.status,'PASS');
assert.equal(sevenEffectsGuardResult.status,'PASS');assert.equal(sevenEffectsExpectations.length,7);
const coverage=assessEffectCoverage(ledger,expectations,verified);
assert.equal(coverage.freshlyVerified,15);assert.equal(coverage.historicalRequired,397);assert.equal(coverage.allRequirementsPassed,false);
assert.equal(coverage.statuses.EXECUTABLE_MISSING||0,0);assert.equal(coverage.statuses.EXECUTABLE_BROKEN||0,0);
for(const expectation of [nativeFnpExpectation,...sevenEffectsExpectations])
  assert.throws(()=>assessEffectCoverage(ledger,expectations,verified.filter(id=>id!==expectation.id)),/Unverified current obligation/);
console.log(JSON.stringify({status:'PASS',obligations:15,coverage,remainingConfirmedDefects:0,
  scope:'Only seven Charge, one AdMech FNP and seven Tyranids obligations were freshly verified; other historical classifications and capability gaps are not fresh PASS.'}));
