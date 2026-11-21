import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const parent='E:/Warhammer/qa-evidence/markup-unknown-v1-2026-11-21',out=parent+'/stage2',root='E:/Warhammer/worktrees/markup-unknown-v1';
const read=file=>JSON.parse(fs.readFileSync(out+'/'+file,'utf8').replace(/^\uFEFF/,''));
const before=JSON.parse(fs.readFileSync(parent+'/CENSUS_BEFORE.json')),after=read('CENSUS_AFTER.json'),migration=read('MIGRATION.json'),scope=read('SCOPE_EQUALITY.json'),ab=read('ab/RESULTS.json'),focused=read('focused/RESULTS.json');
const run=fs.existsSync(out+'/PRE_FF_RUN.json')?read('PRE_FF_RUN.json'):null;
const sha=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();assert.equal(sha,scope.headSha);assert.equal(sha,ab.head);assert.equal(migration.closed,156);
const esc=value=>String(value??'').replaceAll('|','&#124;').replace(/\r?\n/g,' ');
const table=(headers,rows)=>'| '+headers.join(' | ')+' |\n| '+headers.map(()=>'---').join(' | ')+' |\n'+rows.map(row=>'| '+row.map(esc).join(' | ')+' |').join('\n')+'\n';
const categories=['EXECUTED','RECIPIENTS_ONLY','TEXT_ONLY_INTENDED','GAP','UNKNOWN'];
const bookRows=[...new Set(before.summary.map(row=>row.book))].map(book=>{const old=before.rows.filter(row=>row.book===book),current=after.rows.filter(row=>row.book===book);return[book,...categories.map(category=>old.filter(row=>row.category===category).length+' → '+current.filter(row=>row.category===category).length)];});
const counts=categories.map(category=>[category,before.counts[category],after.counts[category]]);
const parseLog=file=>{const lines=fs.readFileSync(out+'/focused/'+file+'.log','utf8').split(/\r?\n/);for(const line of lines.reverse())try{const row=JSON.parse(line);if(row.status==='PASS')return row;}catch{}return null;};
const controls=['unknown-review','existing-census','existing-owner-only'].flatMap(file=>(parseLog(file)?.controls||[]).map(control=>({suite:file,...control})));
fs.writeFileSync(out+'/CONTROLS.json',JSON.stringify({status:'PASS',total:controls.length,controls},null,2)+'\n');
const status=run?.status==='PASS'?'READY_FOR_REVIEW':run?.status==='FAIL'?'STOP: pre-FF requires review':'PENDING: full pre-FF is running';
const text=`# Approved UNKNOWN markup closures — stage 2

Status: **${status}**. Feature: \`codex/markup-unknown-v1\` at \`${sha}\`, one implementation commit from source \`6f2e5fb23643fc0041efcd7006f3e150bd5ce4be\`. No source FF, merge, release/Pages/main update or runtime deployment is part of this task. Stage 1 and its 171-entry proposal remain in this evidence branch unchanged; this stage adds one evidence commit. [Stage-1 report](../REPORT.md), [approved complete table](../PROPOSALS.md), [CSV](../proposals.csv).

## Exact approved result

${table(['Category','Before','After'],counts)}
N stays **2,724**; partial stays **126**. Resolved changes from 2,553/2,724 (93.72%) to 2,709/2,724 (99.45%). This is resolved annotation intent, not an assertion that all semantics are automated. Active debt changes 171 → 15; historical debt remains 217 original entries with 202 separately evidenced closures (the previous 46 plus these 156).

${table(['Book',...categories.map(category=>category+' before → after')],bookRows)}
The implementation matches the approved table exactly: **156 UNKNOWN → TEXT_ONLY_INTENDED**, no new RECIPIENTS_ONLY or EXECUTED. 135 rules use the exact battlefield owner-only reason and physical owner scope. The other 21 retain their approved distinct bases: three muster/mandatory-WARLORD statements and 18 army/detachment process references. They do not acquire a unit-owner-only scope. Of the 12 stage-1 boundary flags, **11** are among the approved text-only closures; **Regenerating Monstrosity remains UNKNOWN**, as explicitly required by the exact remaining-15 list. Battle choices are not permanently assigned to Bodyguards from attachment.

## Implementation and immutable debt

- \`decisions.v1.json\`: exactly 156 category/reason/evidence/scope changes, with source fields, source fingerprints, binding proof, operations and partial markers preserved. No other decision row changes. [Migration details](MIGRATION.json).
- \`closures.v1.json\`: exactly 156 named UNKNOWN closures, each linked to a test and the exact source-bound review fixture. Existing 46 closures remain unchanged. The original \`debt-baseline.v1.json\` and the 15 retained active debt records are unchanged, including their original historical reasons/next-step values.
- \`unknown-review.v1.json\`: all 171 approved source identities, source/binding fingerprints, clauses, reasons, physical scopes and detailed next steps. An ordered semantic SHA-256 pin binds the exact review without needing a sibling evidence commit available as a Git object. Approval fingerprint: \`${migration.approvalFingerprint}\`. The full report JSON and Markdown expose the approved current next steps as a validated overlay, alongside the historical values; the old immutable baseline is not repinned.
- The new strict closure-evidence adapter accepts only this review schema, exact approved identities and matching current source/field/clause/scope/binding. The existing 45-entry owner-only and recipient-enrollment adapters remain unchanged. \`checkMarkup\` additionally passes its already-validated binding fingerprint to fixture verification.
- \`tests/markup-unknown-qa.mjs\` contains the exact named canonical identities, exercises all 156 closures and all 15 remaining records, and checks source-fingerprint equality and owner isolation. It runs as one added sequential pre-FF job; the focused run took ${(focused.find(row=>row.id==='unknown-review').elapsedMs/1000).toFixed(2)} seconds, so it was not added to quick. All former pre-FF jobs and their order are unchanged: 202 → 203. Docs describe the review and follow-up workflow.

## Remaining named UNKNOWN debt

These are the approved **Next step** values. They are source-fingerprinted, validated against the exact remaining historical IDs and displayed by \`markup:census -- --report=<path>\`; they are not substituted into the immutable baseline.

${table(['Book','Canonical ID / name','Approved next step'],after.unknownReview.nextSteps.map(row=>[row.book,row.id+' — '+row.name,row.nextStep]))}

## Checks and negative controls

${table(['Focused check','Result','Seconds'],focused.map(row=>[row.id,row.status,(row.elapsedMs/1000).toFixed(2)]))}
The new test detects **${parseLog('unknown-review').controls.length} negative controls**. The unchanged census and owner-only suites also run their established controls; [CONTROLS.json](CONTROLS.json) lists all ${controls.length} detected mutations. New controls reject: missing/duplicate review IDs, changed source fingerprint/field/clause/binding, changed approval origin/authority, missing or substituted UNKNOWN next step, forged owner scope, absent current category, a mismatched decision, a foreign physical recipient, an executable path under text-only approval, and unclosed/forged debt or closure evidence. No test expectation is weakened.

${table(['Existing test','Before','After','Reason'],[['All existing tests / expectations','Unchanged','Unchanged','No test relocation or expectation edit was needed. Only the new exact-review QA module was added.']])}

## Product, generated and A/B parity

**${scope.generated.files}/${scope.generated.files} generated files are byte-identical to base; ${scope.runtime.files}/${scope.runtime.files} published runtime files are byte-identical.** Characteristics, weapon data, points, text, effects, execution conditions and presentation cannot differ within those identical bytes. [All file hashes and queue comparison](SCOPE_EQUALITY.json). No file was added to application startup, precache, cache revision or the runtime manifest. \`unknown-review.mjs\` is a Node QA tool, not a published application module.

Fresh sequential captures of both clean revisions using the accepted 199-fixture native harness: **199 rosters / 507 states; zero differences, no masking**. Both sides have 177 READY and 22 NEEDS_BINDINGS results. Complete decoded import, snapshot, projection, effective, related and points observations match byte-for-byte for all nine books. [A/B summary](ab/RESULTS.json). Raw owner exports and full captures stay external; they are not published in this evidence branch.

## One final full pre-FF

${run?.status==='PASS'?`**${run.passed}/${run.expectedJobs} PASS, ${run.failed} FAIL**, ${(run.elapsedMs/60000).toFixed(2)} minutes, exact SHA \`${sha}\`. No additional full run was used and no implementation/test change followed it. The generated rebuild job passed as part of this run, in addition to the explicit file-byte scope comparison.`:run?.status==='FAIL'?`The single full run completed with ${run.passed} PASS / ${run.failed} FAIL; do not claim READY or run it again without authorization.`:'The authorized single full run is still in progress; this draft is not a PASS claim.'}

The final evidence includes the per-job status/timing summary, run SHA and generated rebuild result. It excludes private exports, accepted RAW snapshots, candidate runtime packages and browser profiles. The live release and preview remain unchanged. Temporary worktrees and QA files under \`E:/Warhammer/qa-tmp/markup-unknown\` are cleaned after publication; any blocked cleanup is reported separately in the final response. **FF is not performed.**
`;
fs.writeFileSync(out+'/REPORT.md',text);
console.log(JSON.stringify({status,featureSha:sha,controls:controls.length,generated:scope.generated.files,runtime:scope.runtime.files}));
