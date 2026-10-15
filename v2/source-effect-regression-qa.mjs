/** Existing independent source guard: seven Charge obligations plus one
 * AdMech native/granted FNP obligation. The historical census is unchanged. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chargeSourceGuardResult} from './charge-effects-qa.mjs';
import {nativeFnpExpectation,nativeFnpGuardResult} from '../books/adeptus-mechanicus/v2/native-fnp-qa.mjs';
import {assessEffectCoverage} from '../books/shared/roster-v2/source-effect-expectations-qa.mjs';
const read=file=>JSON.parse(fs.readFileSync(new URL(file,import.meta.url),'utf8'));
const ledger=read('../books/shared/roster-v2/source-effect-coverage-baseline.json'),
  charge=read('../books/shared/roster-v2/charge-source-expectations.json').cases,
  expectations=[...charge,nativeFnpExpectation],verified=[...chargeSourceGuardResult.results.map(r=>r.id),nativeFnpGuardResult.id];
assert.equal(chargeSourceGuardResult.status,'PASS');assert.equal(nativeFnpGuardResult.status,'PASS');
const coverage=assessEffectCoverage(ledger,expectations,verified);
assert.equal(coverage.freshlyVerified,8);assert.equal(coverage.historicalRequired,397);assert.equal(coverage.allRequirementsPassed,false);
assert.equal(coverage.statuses.EXECUTABLE_MISSING,7);assert.equal(coverage.statuses.EXECUTABLE_BROKEN||0,0);
assert.throws(()=>assessEffectCoverage(ledger,expectations,verified.filter(id=>id!==nativeFnpExpectation.id)),/Unverified current obligation/);
console.log(JSON.stringify({status:'PASS',obligations:8,coverage,remainingConfirmedDefects:7,
  scope:'Only seven Charge cases and one AdMech FNP case were freshly verified; other historical classifications are not fresh PASS.'}));
