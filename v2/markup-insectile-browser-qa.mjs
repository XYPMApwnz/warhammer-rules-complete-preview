/** Exact existing O-1 witness, through unchanged strict UI assertions. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const fixture=JSON.parse(fs.readFileSync(new URL('../books/death-guard/v2/recipient-enrollment-qa.json',import.meta.url),'utf8'));
const cases=fixture.browserCases.filter(row=>row.canonical.ruleId==='detachment-flyblown-host:enhancement:1');
assert.equal(cases.length,1);assert.equal(cases[0].expectedAttached,true);
assert.deepEqual(cases[0].clauseIds,['wound-reroll']);
const args=process.argv.slice(2);
assert(args.every(arg=>arg.startsWith('--out=')),'Only the evidence output location is configurable');
execFileSync(process.execPath,[fileURLToPath(new URL('./dg-am-recipient-enrollment-browser-qa.mjs',import.meta.url)),
  '--books=death-guard','--case=Insectile Murmuration',
  '--screenshots=death-guard:detachment-flyblown-host:enhancement:1:28',...args],{stdio:'inherit'});
