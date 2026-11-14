# Pre-FF timing review — 14 November 2026

## Publication scope

This is the complete English reviewer copy of the local measurement REPORT.md, expanded with the timings of **all 164 queue jobs** and all 67 generated-gate steps. It is self-contained: the reviewer does not need the local CSV/JSON files to read the timings, findings, proposals or risks.

The measurement ended at **phase 1, STOP**. This later publication adds one documentation-only commit containing this file. Statements below about zero changes and zero new commits describe the measured tree, before this publication commit. No speedup was implemented, no tests or expectations were edited, and no optimized second run was performed.

## Decision and measured result

**Do not start phase 2. Directly supported savings from removing repeated preparation are approximately 2–3 minutes, below the owner's 15-minute threshold.** Additional model-preparation opportunities require explicit prepared-input contracts and isolation evidence; they do not establish 15 minutes of risk-free savings.

| Item | Result |
|---|---|
| Feature branch | `codex/preff-speedup-v1` |
| Measurement base and measured HEAD | `2d5defae9e9677e64c48814055ba9b2eb3c24452` |
| GitHub source after the measurement | `2d5defae9e9677e64c48814055ba9b2eb3c24452` |
| Full pre-FF | **164/164 PASS**, 103:54.406 = 103.907 minutes |
| Start / finish | 2026-11-14T03:13:12.1436569+03:00 / 2026-11-14T04:57:07.6659160+03:00 |
| Generated gate | **147/147 files, 67/67 steps PASS**, zero byte differences |
| Gate's internal time / queue job time | 18:33.427 / 18:34.173 |
| Repository files changed during measurement / new commits | 0 / 0; working tree clean |
| Phase 2 / optimized run | Not started / not run |
| Measurement-stage push, FF or protected-branch changes | None |
| This publication | One report file; feature-branch push only; no FF |

All durations use **minutes:seconds.milliseconds**, not hours:minutes:seconds. Numeric millisecond values are also supplied in the complete tables.

## Measurement method and limits

The one full baseline command was:

```text
npm run qa:pre-ff -- --out=E:/Warhammer/qa-evidence/preff-speedup-v1-2026-11-14/baseline-preff
```

No selective mode or parallel queue execution was used. No other heavy QA/build runs were launched concurrently. Static investigation only read source files. The initial ten-second observation found no heavy competing load. Background applications, including qBittorrent, remained running; this is not a claim that the machine had no background activity.

Queue/job timings come from the unchanged queue's RESULTS.json. Preparation was examined with the native Node CPU profiler at a 10 ms sampling interval and an external preload that only recorded PID, PPID, argv, time and resource usage. It did not replace fs, JSON, child_process, application code or test assertions. Node was v24.18.0. Measurement files stayed outside the repository.

Observation covered **560 Node processes and 3 worker threads**, producing **562 CPU profiles**. All 163 Node queue jobs have a main-thread profile; git diff --check is not a Node process. One deliberately SIGKILLed qa-temp control process could not produce an exit profile. Recycled Windows PIDs were distinguished by start time and parent lifetime; worker threads were identified separately. Python-invoked Node decoders without a recorded Node parent were attributed using their enclosing sequential job interval.

**Exact measurements:** queue time, job time, generated-step time and observed child-process lifetimes. **Estimates:** preparation regions sampled at 10 ms. Inclusive regions can overlap and must not be added as independent savings. JSON parsing inside Chromium was not separately profiled. Unclassified time is not labelled entirely as assertions: it also contains actual application work, necessary startup, screenshots and process management.

Profiler overhead was not separately calibrated, because only one baseline run was authorized. The previous 105:54.972 on this base is context only. The present **103:54.406 was obtained without changing code**; the difference is not an implemented speedup.

The runner used external QA temporary/evidence directories, QA_SKIP_TMP_SWEEP=1 to avoid unrelated old temporary folders, and PYTHONDONTWRITEBYTECODE=1. No computed QA result was reused between runs.

## Totals by group

Groups are mutually exclusive by the job's primary purpose. MFM QA remains MFM even when it launches Chromium. Mixed native/browser faction tests, including T'au roster-import QA, remain in Books. The full Glossary producer inside the generated gate is counted in the gate, while the standalone Glossary category is Core projection QA. The complete npm qa:glossary suite is not part of pre-FF.

| Group | Jobs | Time | Share |
|---|---:|---:|---:|
| Browser | 26 | 39:50.776 | 38.3% |
| Books | 44 | 26:40.384 | 25.7% |
| Generated gate | 1 | 18:34.173 | 17.9% |
| Other | 63 | 7:23.996 | 7.1% |
| Historical checks | 21 | 5:46.600 | 5.6% |
| Glossary | 1 | 4:35.230 | 4.4% |
| MFM | 2 | 0:42.143 | 0.7% |
| Core | 6 | 0:21.001 | 0.3% |
| Between-job queue overhead | — | 0:00.103 | — |
| Total | 164 | 103:54.406 | 100% |

## Top 20 queue jobs

Arguments are retained so that different fixture files passed to one runner are not merged.

| Rank | Queue no. | Command | Time |
|---:|---:|---|---:|
| 1 | 131 | `node books/shared/tools/check-generated-rebuild.mjs` | 18:34.173 |
| 2 | 32 | `node books/dark-angels/v2/roster-import-qa.mjs` | 5:30.806 |
| 3 | 158 | `node v2/dg-am-recipient-enrollment-browser-qa.mjs --fixtures=v2/fixtures/csm-tau-recipient-gaps-v1-browser.json` | 5:29.318 |
| 4 | 62 | `node books/tau-empire/v2/roster-import-qa.mjs` | 5:15.643 |
| 5 | 157 | `node v2/dg-am-recipient-enrollment-browser-qa.mjs --fixtures=v2/fixtures/sm-da-recipient-gaps-v1-browser.json` | 4:42.047 |
| 6 | 124 | `node glossary/v2/tests/core-projection-qa.mjs` | 4:35.230 |
| 7 | 142 | `node v2/attached-rule-text-browser-qa.mjs` | 4:30.675 |
| 8 | 53 | `node books/space-marines/v2/roster-import-qa.mjs` | 3:31.852 |
| 9 | 33 | `node v2/new-recruit-export-qa.mjs --book=dark-angels` | 3:08.521 |
| 10 | 19 | `node books/blood-angels/v2/roster-qa.mjs` | 3:01.328 |
| 11 | 139 | `node v2/detachment-recipient-browser-qa.mjs` | 2:41.961 |
| 12 | 143 | `node v2/card-display-browser-qa.mjs` | 2:31.199 |
| 13 | 138 | `node tests/browser/cold-offline.mjs` | 2:19.456 |
| 14 | 145 | `node v2/source-equipment-browser-qa.mjs` | 2:02.317 |
| 15 | 136 | `node v2/pwa-transition-qa.mjs` | 1:39.913 |
| 16 | 134 | `node v2/core-reader-browser-qa.mjs` | 1:38.311 |
| 17 | 144 | `node v2/card-display-2-browser-qa.mjs` | 1:31.893 |
| 18 | 141 | `node v2/card-recipient-browser-qa.mjs` | 1:28.534 |
| 19 | 85 | `node v2/source-effect-regression-qa.mjs` | 1:22.233 |
| 20 | 52 | `node books/space-marines/v2/app-qa.mjs` | 1:22.006 |

### Largest generated-gate steps

These times are nested inside queue job 131 and must not be added again to group totals.

| Producer | Time |
|---|---:|
| `books/chaos-space-marines/v2/rule-contract-build.mjs` | 4:22.173 |
| `glossary/v2/tools/build-glossary-v2.mjs` | 3:58.206 |
| `books/chaos-space-marines/v2/app-build.mjs` | 3:50.802 |
| `books/adeptus-mechanicus/v2/factual-qa.py` | 1:00.718 |
| `books/dark-angels/v2/app-build.mjs` | 0:40.831 |
| `books/blood-angels/v2/app-build.mjs` | 0:38.676 |
| `books/space-marines/v2/app-build.mjs` | 0:22.178 |
| `books/chaos-space-marines/v2/build.py` | 0:17.052 |
| `tools/audit/build-source-catalog-additions.mjs` | 0:15.580 |
| `books/tau-empire/v2/build.py` | 0:11.402 |

The gate created its own authenticated Git checkout in **0:06.638**. The remaining **18:26.789** includes producers, output deletion, comparison and management. Reusing already generated files instead of actually rebuilding them would remove freshness/missing-write coverage. Shared upstream preparation, if introduced later, must preserve each producer and every output comparison.

## Repeated preparation and possible within-run savings

Savings below are estimates, not an optimized-run benchmark. Minutes are included explicitly for comparison with the 15-minute threshold.

| Preparation | Repetition | Measured region | Reusable input and preserved checks | Estimated saving, minutes |
|---|---|---|---|---:|
| Accepted MFM historical checkout | 17 checkouts of 35a5e4d5 | 2:12.212 outside 25 Node workers; workers themselves 1:05.357 | One queue-owned checkout per run; every original historical test, decoder and before/after clean-tree assertion still executes | About 1.67–2.00; the full 2.20-minute remainder is not removable |
| Core codec | Nine materializations of 30 identical files at 913cfef5 | 0:08.368 | One immutable file preparation; all distinct decodings and comparisons remain | About 0.12 |
| Baseline runtime package | Four baseline builds from the same inputs | 0:23.409 in the package builder | One baseline; B/synthetic variants and independent package checks remain | About 0.25–0.33 |
| DA roster preparation | Two identical default contract builds | 0:13.412 | Supply one built input through the two existing APIs; keep the independent source oracle and every roster case | About 0.10–0.12 |
| EC roster preparation | Eight helper calls plus two nested contract builds | 0:05.307 | Prepare once and provide fresh data per case; do not JSON-serialize schema functions | About 0.05–0.08 for the narrow handoff |
| Card-display-2 publication reading | Repeated inspect calls for modes/units | 0:09.910 in the complete read helper | Prepare publication/card lookup per book; preserve sourceRefs registration | Less than 0.17; registration side effects need verification |

The directly supported simple reserve is **approximately 2–3 minutes**. Prepared-input identity and lifetime checks also cost time. No risk-free 15-minute saving was established, so phase 2 was not authorized by its condition and was not started.

### Historical jobs: preparation versus original checks

Worker time is the original historical test and, when needed, its separate decoder. It remains necessary. The last column also includes required Git guards and startup/exit boundaries, so it overstates removable preparation. The difference between the complete job and these columns contains current HEAD checks and other leaf work, not a claimed preparation saving.

| Queue no. | Command | Whole job | Historical Node workers | Upper estimate outside workers |
|---:|---|---:|---:|---:|
| 15 | `node v2/new-recruit-plain-header-qa.mjs --book=adeptus-mechanicus` | 0:08.121 | 0:00.191 | 0:07.553 |
| 21 | `node v2/new-recruit-plain-header-qa.mjs --book=blood-angels` | 0:09.619 | 0:00.784 | 0:07.407 |
| 23 | `node v2/related-panel-qa.mjs --book=blood-angels --phase=all` | 0:33.615 | 0:13.224 | 0:07.947 |
| 28 | `node v2/new-recruit-plain-header-qa.mjs --book=chaos-space-marines` | 0:08.854 | 0:00.467 | 0:07.437 |
| 34 | `node v2/new-recruit-plain-header-qa.mjs --book=dark-angels` | 0:16.853 | 0:03.135 | 0:07.892 |
| 36 | `node v2/related-panel-qa.mjs --book=dark-angels --phase=all` | 0:33.337 | 0:12.965 | 0:07.740 |
| 41 | `node v2/new-recruit-plain-header-qa.mjs --book=death-guard` | 0:07.997 | 0:00.169 | 0:07.375 |
| 47 | `node v2/new-recruit-plain-header-qa.mjs --book=emperors-children` | 0:09.101 | 0:00.342 | 0:08.001 |
| 49 | `node v2/reviewed-text-coverage-qa.mjs --book=emperors-children` | 0:10.554 | 0:01.180 | 0:08.009 |
| 50 | `node v2/related-panel-qa.mjs --book=emperors-children --phase=all` | 0:17.033 | 0:04.138 | 0:07.864 |
| 56 | `node v2/new-recruit-plain-header-qa.mjs --book=space-marines` | 0:09.260 | 0:00.508 | 0:07.730 |
| 58 | `node v2/related-panel-qa.mjs --book=space-marines --phase=all` | 0:36.932 | 0:14.544 | 0:07.936 |
| 65 | `node v2/new-recruit-plain-header-qa.mjs --book=tau-empire` | 0:08.927 | 0:00.481 | 0:07.414 |
| 67 | `node v2/related-panel-qa.mjs --book=tau-empire --phase=all` | 0:19.428 | 0:05.366 | 0:08.170 |
| 72 | `node v2/new-recruit-plain-header-qa.mjs --book=tyranids` | 0:08.941 | 0:00.342 | 0:07.929 |
| 74 | `node v2/reviewed-text-coverage-qa.mjs --book=tyranids` | 0:11.169 | 0:01.445 | 0:08.012 |
| 75 | `node v2/related-panel-qa.mjs --book=tyranids --phase=all` | 0:20.718 | 0:06.076 | 0:07.796 |

### Runtime packages: preparation versus the rest of each job

| Queue no. | Entry point | Whole job | Baseline package builder, sampled |
|---:|---|---:|---:|
| 132 | `tools/pages-runtime-package.mjs` | 0:06.162 | 0:05.982 |
| 137 | `tests/browser/pwa-update-flow.mjs` | 1:06.949 | 0:05.742 |
| 138 | `tests/browser/cold-offline.mjs` | 2:19.456 | 0:05.598 |
| 140 | `v2/detachment-synthetic-table-browser-qa.mjs` | 0:54.332 | 0:06.087 |

Independent builds in pages-runtime-package-qa.mjs are excluded from this reuse estimate: they test determinism, CRLF/LF equivalence, refusal and corruption. They must remain.

### Glossary owner-model preparation: an additional candidate

Both commands really build a fresh complete publication. The --core-only command first verifies non-Core owners; see glossary/v2/tools/build-glossary-v2.mjs:15–17. That check cannot be replaced by a copy of the committed index.

| Invocation | Whole process | loadV2ArmyModels, including checks | Factual freshness within loader | Parity, both calls |
|---|---:|---:|---:|---:|
| Core-only check | 4:31.219 | 3:41.275 | 0:52.127 | 0:45.664 |
| Full generated gate | 3:57.952 | 3:10.688 | 0:21.521 | 0:44.176 |

Subtracting the explicit factual check leaves approximately **169 seconds** in each loader, still including required inner parity. Thus even an optimistic saving from one repeated model set is below **2.83 minutes**. Only independently prepared models with an exact source/producer fingerprint could be handed through. Every factual-freshness and parity assertion must still execute. Contracts containing schema functions, Maps and source-reference state are not an arbitrary JSON cache. A prepared-input contract and isolation evidence would be required; neither was implemented.

Other SM/BA/DA/EC contract builds also contain preparation, but some use different CANONICAL, DECLARATION or runtime stages; others are independent oracles or determinism checks. Whole CLI durations cannot be treated as savings. For example, the measured CSM contract CLI spent about **0.8 seconds** building contracts and about **256 seconds** compiling compatibility. The app CLI spent about **220 seconds** on a different compatibility domain and selected-detachment context. These are different required outputs.

Such model handoffs could add a few minutes of potential savings; they do not establish 15 minutes of risk-free savings. Book name alone does not make differing stages and inputs identical.

### Large JSON inputs

| Input | Bytes |
|---|---:|
| books/shared/source-refs-v2/source-catalog.json | 6,530,013 |
| glossary/v2/generated/index.en.json | 31,196,261 |
| books/space-marines/v2/generated/roster-runtime.json | 5,594,194 |

Main Node processes of queue leaves showed **3:33.544** in synchronous reading/decoding regions. This is **not an additional saving**: it includes required assertion reads and portions of the construction work above, and covers Node only. Overlapping regions must not be added. Card-display-2's entire repeated read helper costs about ten seconds, not minutes. Chromium must still load/parse data through the tested player path; replacing it with pre-injected application state was not proposed.

## Why whole slow browser jobs are not duplicated preparation

- Enrollment already launches one Chromium per invocation and uses one page per book × viewport: v2/dg-am-recipient-enrollment-browser-qa.mjs:141,149–153. Physical-input grouping is already on the base; it is not a change made by this task.
- SM/DA fixture: 33 cases / 29 physical groups, producing six contexts and 58 imports with reload across both viewports. CSM/Tau: 46 / 36, four contexts and 72 imports with reload. These are static counts from current fixtures, not extra measured scenarios.
- Enrollment, attached-rule-text, card-display-2 and pwa-transition contain no fixed sleep/waitForTimeout calls. Their timeouts are upper readiness limits, not unconditional delays.
- PWA transition already uses a single page. Its 15-second Promise.race is a failure deadline and advances immediately on the event. Held requests exercise navigation-race assertions.
- Real imports/reloads, attached/detached/reattached states, source ownership, model scope, refusal controls and screenshots remain actual test work. Removing them to save minutes would exceed the task's scope.

## Report-only proposals: saving estimates in minutes and risk

None of these proposals was implemented. Estimates overlap and cannot automatically be added. Except for the small measured preparation regions, these are hypotheses or workload ceilings, not validated speedup forecasts.

| Proposal | Estimated saving, minutes | Risk and requirements |
|---|---:|---|
| Historical-result cache between runs | The current MFM worker + non-worker budget is about **3.30**; actual saving is smaller and current HEAD checks remain | **Medium.** Key must cover exact Git, fixture, codec and toolchain inputs. A stale PASS must never be accepted. Forbidden in this task; not implemented. |
| Selective queue based on changed files | Approximately **10–40** for a narrow change; dependency-dependent | **High.** Could omit shared or inherited-book regressions. Requires a separate complete coverage contract. Not implemented. |
| Change slow native-test/producer code after profiling | Approximately **3–10**, currently a hotspot hypothesis; exposure is shown in the top 20 and CSM compiler measurements | **Medium to high.** Profile real calculations; do not remove cases or replace runtime with stubs. Shared caches can invalidate poison/mutation controls and recipient isolation. Not implemented. |
| Attached-rule-text page reuse by book/viewport | Approximately **0.50–1.50** out of its 4:30.675, requiring a separate measurement | **Medium.** Test-code change; prove complete state reset while preserving every stage, real reload and independent expectation. Not implemented. |
| Card-display-2 source-side JSON preparation | **Less than 0.17**, measured upper region | **Low only after source-registration verification.** This cannot provide 15 minutes. Not implemented. |
| Two parallel job executors | Approximately **20–35**, unvalidated | **Medium to high.** RAM, disk, temporary-directory ownership, shared inputs and ordered reporting need proof. No parallel run was attempted; prohibited by the owner in this task. |
| Reduce timeouts, reloads or screenshot count | **0 proven risk-free minutes** | **High for coverage/evidence loss.** Readiness limits are not idle sleeps. Not recommended as a simple speedup; not implemented. |

## Proof that checks and boundaries were unchanged

At the end of measurement, before this documentation-only publication:

| Proof | Value |
|---|---|
| Base = measured HEAD | `2d5defae9e9677e64c48814055ba9b2eb3c24452` |
| Base tree = measured HEAD tree | `d110f57313a148e5d4c2f9a16f39b7cef4b29d15` |
| git status / git diff | Empty / empty |
| Changed repository files / measurement commits | 0 / 0 |
| Exact queue comparison | All 164 jobs, arguments and result order identical |
| Canonical queue-list SHA-256, before and after | `7f102019b4d45ce6fe29942563842eddc15268941e8e3b0c13607c0c0b4a45af` |
| pre-FF result | 164 PASS, 0 FAIL |
| Generated comparison | 147 files / 67 steps; zero differences |

The local CHECKS_INVENTORY.json records each job's arguments, source Git blob and local assert/negative/mutation/poison markers for navigation. It is not a fabricated count of runtime assertions. Equality of the complete Git tree preserves imported helpers, fixtures and controls as well. No test source or assertion was changed; the changed-test table is empty. No prepared-input handoff was implemented.

The publication commit contains only this Markdown report. It changes neither the measured implementation nor any test, generated output, data, queue or runtime publication file. No new pre-FF run was performed for documentation publication.

## Complete timing table: all 164 jobs, original order

Every row retains its original command/arguments. Absolute temporary paths are original local run paths, not extra required repository inputs. All rows are PASS. Group labels follow the exclusive classification above.

| Queue no. | Group | Command | Elapsed ms | Time | Result |
|---:|---|---|---:|---:|---|
| 1 | Other | `git diff --check` | 31 | 0:00.031 | PASS |
| 2 | Other | `node tests/qa-temp-qa.mjs` | 4452 | 0:04.452 | PASS |
| 3 | Other | `node tests/book-passport-qa.mjs` | 926 | 0:00.926 | PASS |
| 4 | Other | `node tests/official-updates-qa.mjs` | 74 | 0:00.074 | PASS |
| 5 | Other | `node tests/official-update-books-qa.mjs` | 155 | 0:00.155 | PASS |
| 6 | Other | `node tests/official-update-report-qa.mjs` | 76 | 0:00.076 | PASS |
| 7 | Other | `node tests/official-update-integration-qa.mjs` | 23489 | 0:23.489 | PASS |
| 8 | Other | `node tests/official-effect-review-qa.mjs` | 109 | 0:00.109 | PASS |
| 9 | Other | `node tests/current-gw-contract-qa.mjs` | 63 | 0:00.063 | PASS |
| 10 | Core | `node books/core-rules/tests/core-importer-candidate-qa.mjs` | 16241 | 0:16.241 | PASS |
| 11 | Historical checks | `node books/core-rules/tests/core-importer-isolation-qa.mjs` | 54890 | 0:54.890 | PASS |
| 12 | Books | `node books/adeptus-mechanicus/v2/app-qa.mjs` | 22576 | 0:22.576 | PASS |
| 13 | Books | `node books/adeptus-mechanicus/v2/roster-import-qa.mjs` | 3147 | 0:03.147 | PASS |
| 14 | Books | `node v2/new-recruit-export-qa.mjs --book=adeptus-mechanicus` | 461 | 0:00.461 | PASS |
| 15 | Historical checks | `node v2/new-recruit-plain-header-qa.mjs --book=adeptus-mechanicus` | 8121 | 0:08.121 | PASS |
| 16 | Books | `node v2/new-recruit-model-names-qa.mjs --book=adeptus-mechanicus` | 377 | 0:00.377 | PASS |
| 17 | Historical checks | `node v2/related-panel-qa.mjs --book=adeptus-mechanicus --phase=all` | 4967 | 0:04.967 | PASS |
| 18 | Books | `node books/blood-angels/v2/app-qa.mjs` | 48950 | 0:48.950 | PASS |
| 19 | Books | `node books/blood-angels/v2/roster-qa.mjs` | 181328 | 3:01.328 | PASS |
| 20 | Books | `node v2/new-recruit-export-qa.mjs --book=blood-angels` | 24169 | 0:24.169 | PASS |
| 21 | Historical checks | `node v2/new-recruit-plain-header-qa.mjs --book=blood-angels` | 9619 | 0:09.619 | PASS |
| 22 | Books | `node v2/new-recruit-model-names-qa.mjs --book=blood-angels` | 4378 | 0:04.378 | PASS |
| 23 | Historical checks | `node v2/related-panel-qa.mjs --book=blood-angels --phase=all` | 33615 | 0:33.615 | PASS |
| 24 | Books | `node v2/detachment-card-text-qa.mjs --book=blood-angels` | 325 | 0:00.325 | PASS |
| 25 | Books | `node books/chaos-space-marines/v2/app-qa.mjs` | 1054 | 0:01.054 | PASS |
| 26 | Books | `node books/chaos-space-marines/v2/roster-import-qa.mjs` | 12833 | 0:12.833 | PASS |
| 27 | Books | `node v2/new-recruit-export-qa.mjs --book=chaos-space-marines` | 1418 | 0:01.418 | PASS |
| 28 | Historical checks | `node v2/new-recruit-plain-header-qa.mjs --book=chaos-space-marines` | 8854 | 0:08.854 | PASS |
| 29 | Books | `node v2/new-recruit-model-names-qa.mjs --book=chaos-space-marines` | 2938 | 0:02.938 | PASS |
| 30 | Historical checks | `node v2/related-panel-qa.mjs --book=chaos-space-marines --phase=all` | 12134 | 0:12.134 | PASS |
| 31 | Books | `node books/dark-angels/v2/app-qa.mjs` | 49169 | 0:49.169 | PASS |
| 32 | Books | `node books/dark-angels/v2/roster-import-qa.mjs` | 330806 | 5:30.806 | PASS |
| 33 | Books | `node v2/new-recruit-export-qa.mjs --book=dark-angels` | 188521 | 3:08.521 | PASS |
| 34 | Historical checks | `node v2/new-recruit-plain-header-qa.mjs --book=dark-angels` | 16853 | 0:16.853 | PASS |
| 35 | Books | `node v2/new-recruit-model-names-qa.mjs --book=dark-angels` | 16818 | 0:16.818 | PASS |
| 36 | Historical checks | `node v2/related-panel-qa.mjs --book=dark-angels --phase=all` | 33337 | 0:33.337 | PASS |
| 37 | Books | `node v2/detachment-card-text-qa.mjs --book=dark-angels` | 474 | 0:00.474 | PASS |
| 38 | Books | `node books/death-guard/v2/app-qa.mjs` | 7448 | 0:07.448 | PASS |
| 39 | Books | `node books/death-guard/v2/roster-import-qa.mjs` | 156 | 0:00.156 | PASS |
| 40 | Books | `node v2/new-recruit-export-qa.mjs --book=death-guard` | 411 | 0:00.411 | PASS |
| 41 | Historical checks | `node v2/new-recruit-plain-header-qa.mjs --book=death-guard` | 7997 | 0:07.997 | PASS |
| 42 | Historical checks | `node v2/related-panel-qa.mjs --book=death-guard --phase=all` | 4150 | 0:04.150 | PASS |
| 43 | Books | `node v2/detachment-card-text-qa.mjs --book=death-guard` | 221 | 0:00.221 | PASS |
| 44 | Books | `node books/emperors-children/v2/app-qa.mjs` | 4679 | 0:04.679 | PASS |
| 45 | Books | `node books/emperors-children/v2/roster-import-qa.mjs` | 12220 | 0:12.220 | PASS |
| 46 | Books | `node v2/new-recruit-export-qa.mjs --book=emperors-children` | 1873 | 0:01.873 | PASS |
| 47 | Historical checks | `node v2/new-recruit-plain-header-qa.mjs --book=emperors-children` | 9101 | 0:09.101 | PASS |
| 48 | Books | `node v2/new-recruit-model-names-qa.mjs --book=emperors-children` | 642 | 0:00.642 | PASS |
| 49 | Historical checks | `node v2/reviewed-text-coverage-qa.mjs --book=emperors-children` | 10554 | 0:10.554 | PASS |
| 50 | Historical checks | `node v2/related-panel-qa.mjs --book=emperors-children --phase=all` | 17033 | 0:17.033 | PASS |
| 51 | Books | `node v2/detachment-card-text-qa.mjs --book=emperors-children` | 237 | 0:00.237 | PASS |
| 52 | Books | `node books/space-marines/v2/app-qa.mjs` | 82006 | 1:22.006 | PASS |
| 53 | Books | `node books/space-marines/v2/roster-import-qa.mjs` | 211852 | 3:31.852 | PASS |
| 54 | Books | `node books/space-marines/v2/roster-static-model-bindings-qa.mjs` | 14883 | 0:14.883 | PASS |
| 55 | Books | `node v2/new-recruit-export-qa.mjs --book=space-marines` | 14648 | 0:14.648 | PASS |
| 56 | Historical checks | `node v2/new-recruit-plain-header-qa.mjs --book=space-marines` | 9260 | 0:09.260 | PASS |
| 57 | Books | `node v2/new-recruit-model-names-qa.mjs --book=space-marines` | 4302 | 0:04.302 | PASS |
| 58 | Historical checks | `node v2/related-panel-qa.mjs --book=space-marines --phase=all` | 36932 | 0:36.932 | PASS |
| 59 | Books | `node v2/detachment-card-text-qa.mjs --book=space-marines` | 367 | 0:00.367 | PASS |
| 60 | Other | `node v2/wardens-source-binding-qa.mjs` | 1474 | 0:01.474 | PASS |
| 61 | Books | `node books/tau-empire/v2/app-qa.mjs` | 5862 | 0:05.862 | PASS |
| 62 | Books | `node books/tau-empire/v2/roster-import-qa.mjs` | 315643 | 5:15.643 | PASS |
| 63 | Books | `node books/tau-empire/v2/physical-choice-qa.mjs` | 15340 | 0:15.340 | PASS |
| 64 | Books | `node v2/new-recruit-export-qa.mjs --book=tau-empire` | 1507 | 0:01.507 | PASS |
| 65 | Historical checks | `node v2/new-recruit-plain-header-qa.mjs --book=tau-empire` | 8927 | 0:08.927 | PASS |
| 66 | Books | `node v2/new-recruit-model-names-qa.mjs --book=tau-empire` | 1083 | 0:01.083 | PASS |
| 67 | Historical checks | `node v2/related-panel-qa.mjs --book=tau-empire --phase=all` | 19428 | 0:19.428 | PASS |
| 68 | Books | `node v2/detachment-card-text-qa.mjs --book=tau-empire` | 381 | 0:00.381 | PASS |
| 69 | Books | `node books/tyranids/v2/app-qa.mjs` | 5843 | 0:05.843 | PASS |
| 70 | Books | `node books/tyranids/v2/roster-import-qa.mjs` | 7108 | 0:07.108 | PASS |
| 71 | Books | `node v2/new-recruit-export-qa.mjs --book=tyranids` | 925 | 0:00.925 | PASS |
| 72 | Historical checks | `node v2/new-recruit-plain-header-qa.mjs --book=tyranids` | 8941 | 0:08.941 | PASS |
| 73 | Books | `node v2/new-recruit-model-names-qa.mjs --book=tyranids` | 668 | 0:00.668 | PASS |
| 74 | Historical checks | `node v2/reviewed-text-coverage-qa.mjs --book=tyranids` | 11169 | 0:11.169 | PASS |
| 75 | Historical checks | `node v2/related-panel-qa.mjs --book=tyranids --phase=all` | 20718 | 0:20.718 | PASS |
| 76 | Books | `node v2/detachment-card-text-qa.mjs --book=tyranids` | 337 | 0:00.337 | PASS |
| 77 | Other | `node books/shared/rule-contract-v2/recipients-qa.mjs` | 3233 | 0:03.233 | PASS |
| 78 | Other | `node books/shared/roster-v2/physical-selection-effects-qa.mjs` | 199 | 0:00.199 | PASS |
| 79 | Other | `node books/shared/roster-v2/condition-execution-qa.mjs` | 132 | 0:00.132 | PASS |
| 80 | Other | `node books/shared/roster-v2/numeric-effects-qa.mjs` | 204 | 0:00.204 | PASS |
| 81 | Other | `node books/shared/roster-v2/keyword-effects-qa.mjs` | 187 | 0:00.187 | PASS |
| 82 | Other | `node books/shared/roster-v2/ability-effects-qa.mjs` | 196 | 0:00.196 | PASS |
| 83 | Other | `node books/shared/roster-v2/weapon-contribution-effects-qa.mjs` | 169 | 0:00.169 | PASS |
| 84 | Other | `node books/shared/roster-v2/advance-roll-effects-qa.mjs` | 139 | 0:00.139 | PASS |
| 85 | Other | `node v2/source-effect-regression-qa.mjs` | 82233 | 1:22.233 | PASS |
| 86 | Other | `node v2/detachment-source-binding-qa.mjs` | 38429 | 0:38.429 | PASS |
| 87 | Other | `node books/shared/roster-v2/reimport-attachments-qa.mjs` | 10537 | 0:10.537 | PASS |
| 88 | Other | `node books/shared/roster-v2/service-qa.mjs` | 132 | 0:00.132 | PASS |
| 89 | Other | `node books/shared/roster-v2/import-service-qa.mjs` | 211 | 0:00.211 | PASS |
| 90 | Other | `node books/shared/roster-v2/import-selections-qa.mjs` | 120 | 0:00.120 | PASS |
| 91 | Other | `node books/shared/roster-v2/attachment-service-qa.mjs` | 111 | 0:00.111 | PASS |
| 92 | Other | `node books/shared/roster-v2/attachment-conditions-qa.mjs` | 118 | 0:00.118 | PASS |
| 93 | Other | `node tests/roster-execution-atomic-qa.mjs` | 4874 | 0:04.874 | PASS |
| 94 | Other | `node v2/detachment-recipient-qa.mjs` | 1486 | 0:01.486 | PASS |
| 95 | Other | `node v2/card-recipient-qa.mjs` | 705 | 0:00.705 | PASS |
| 96 | Other | `node v2/attached-rule-text-qa.mjs` | 14678 | 0:14.678 | PASS |
| 97 | Other | `node v2/card-display-2-qa.mjs` | 2086 | 0:02.086 | PASS |
| 98 | Other | `node books/shared/roster-v2/singleton-model-import-qa.mjs` | 52 | 0:00.052 | PASS |
| 99 | Other | `node books/shared/roster-v2/plain-header-qa.mjs` | 74 | 0:00.074 | PASS |
| 100 | Other | `node v2/epic-hero-enhancements-qa.mjs` | 7245 | 0:07.245 | PASS |
| 101 | Other | `node books/shared/roster-v2/initial-attachment-qa.mjs` | 110 | 0:00.110 | PASS |
| 102 | Other | `node v2/faction-safe-import-qa.mjs` | 730 | 0:00.730 | PASS |
| 103 | Other | `node books/shared/army-book-app-v2/card-text-formatting-qa.mjs` | 53 | 0:00.053 | PASS |
| 104 | Other | `node books/shared/army-book-app-v2/library-currentness-qa.mjs` | 235 | 0:00.235 | PASS |
| 105 | Other | `node books/shared/roster-v2/text-roster-facts-qa.mjs` | 62 | 0:00.062 | PASS |
| 106 | Other | `node v2/source-completeness-check.mjs` | 1641 | 0:01.641 | PASS |
| 107 | Other | `node tests/integration-qa.mjs` | 4574 | 0:04.574 | PASS |
| 108 | Other | `node books/shared/army-book-app-v2/cosmetics-qa.mjs` | 490 | 0:00.490 | PASS |
| 109 | Other | `node tests/codex-workflow-qa.mjs` | 136 | 0:00.136 | PASS |
| 110 | Other | `node tests/source-book-clone-qa.mjs --root=E:\Warhammer\worktrees\preff-speedup-v1` | 1676 | 0:01.676 | PASS |
| 111 | Other | `node books/shared/source-refs-v2/source-catalog-qa.mjs` | 1198 | 0:01.198 | PASS |
| 112 | Other | `node v2/unit-recipient-scope-qa.mjs` | 2691 | 0:02.691 | PASS |
| 113 | Other | `node tests/book-update-declarations-qa.mjs` | 171 | 0:00.171 | PASS |
| 114 | Other | `node tests/book-update-report-qa.mjs` | 75 | 0:00.075 | PASS |
| 115 | Other | `node tests/book-update-snapshots-qa.mjs` | 13346 | 0:13.346 | PASS |
| 116 | Other | `node tests/book-update-metadata-qa.mjs` | 68 | 0:00.068 | PASS |
| 117 | Other | `node tests/book-update-command-qa.mjs` | 58417 | 0:58.417 | PASS |
| 118 | MFM | `node tests/mfm-release-history-qa.mjs` | 212 | 0:00.212 | PASS |
| 119 | MFM | `node tests/mfm-update-qa.mjs` | 41931 | 0:41.931 | PASS |
| 120 | Other | `node tests/source-catalog-registry-qa.mjs` | 54259 | 0:54.259 | PASS |
| 121 | Other | `node tests/source-catalog-additions-qa.mjs` | 15632 | 0:15.632 | PASS |
| 122 | Core | `node books/core-rules/tests/factual-ownership-qa.mjs` | 532 | 0:00.532 | PASS |
| 123 | Core | `node books/core-rules/tests/core-waha-certification-qa.mjs` | 205 | 0:00.205 | PASS |
| 124 | Glossary | `node glossary/v2/tests/core-projection-qa.mjs` | 275230 | 4:35.230 | PASS |
| 125 | Core | `node books/core-rules/tests/term-bindings-qa.mjs` | 679 | 0:00.679 | PASS |
| 126 | Core | `node books/core-rules/tests/reader-see-also-regression-qa.mjs` | 1550 | 0:01.550 | PASS |
| 127 | Core | `node books/core-rules/tests/core-faq-anchor-qa.mjs` | 1794 | 0:01.794 | PASS |
| 128 | Other | `node tests/generated-rebuild-qa.mjs` | 25386 | 0:25.386 | PASS |
| 129 | Other | `node tests/csm-model-alias-bootstrap-qa.mjs` | 2678 | 0:02.678 | PASS |
| 130 | Other | `node tests/source-review-execution-book-qa.mjs` | 3430 | 0:03.430 | PASS |
| 131 | Generated gate | `node books/shared/tools/check-generated-rebuild.mjs` | 1114173 | 18:34.173 | PASS |
| 132 | Other | `node tools/pages-runtime-package.mjs --source E:\Warhammer\worktrees\preff-speedup-v1 --out E:\Warhammer\qa-tmp\preff-speedup-v1\wh-qa-pre-ff-work-y0aCQo\work\runtime` | 6162 | 0:06.162 | PASS |
| 133 | Browser | `node v2/shell-browser-qa.mjs` | 55895 | 0:55.895 | PASS |
| 134 | Browser | `node v2/core-reader-browser-qa.mjs` | 98311 | 1:38.311 | PASS |
| 135 | Other | `node tests/minimal-pwa-cache-qa.mjs` | 153 | 0:00.153 | PASS |
| 136 | Browser | `node v2/pwa-transition-qa.mjs` | 99913 | 1:39.913 | PASS |
| 137 | Browser | `node tests/browser/pwa-update-flow.mjs` | 66949 | 1:06.949 | PASS |
| 138 | Browser | `node tests/browser/cold-offline.mjs` | 139456 | 2:19.456 | PASS |
| 139 | Browser | `node v2/detachment-recipient-browser-qa.mjs` | 161961 | 2:41.961 | PASS |
| 140 | Browser | `node v2/detachment-synthetic-table-browser-qa.mjs` | 54332 | 0:54.332 | PASS |
| 141 | Browser | `node v2/card-recipient-browser-qa.mjs` | 88534 | 1:28.534 | PASS |
| 142 | Browser | `node v2/attached-rule-text-browser-qa.mjs` | 270675 | 4:30.675 | PASS |
| 143 | Browser | `node v2/card-display-browser-qa.mjs` | 151199 | 2:31.199 | PASS |
| 144 | Browser | `node v2/card-display-2-browser-qa.mjs` | 91893 | 1:31.893 | PASS |
| 145 | Browser | `node v2/source-equipment-browser-qa.mjs` | 122317 | 2:02.317 | PASS |
| 146 | Browser | `node v2/new-recruit-export-browser-qa.mjs` | 22322 | 0:22.322 | PASS |
| 147 | Browser | `node v2/new-recruit-plain-header-browser-qa.mjs` | 5046 | 0:05.046 | PASS |
| 148 | Browser | `node v2/new-recruit-model-names-browser-qa.mjs` | 48546 | 0:48.546 | PASS |
| 149 | Browser | `node v2/reviewed-text-coverage-browser-qa.mjs` | 22439 | 0:22.439 | PASS |
| 150 | Browser | `node v2/related-panel-browser-qa.mjs` | 25427 | 0:25.427 | PASS |
| 151 | Browser | `node v2/detachment-card-text-browser-qa.mjs` | 58657 | 0:58.657 | PASS |
| 152 | Browser | `node v2/wardens-source-binding-browser-qa.mjs` | 11447 | 0:11.447 | PASS |
| 153 | Browser | `node v2/cards-cosmetics-browser-qa.mjs` | 68498 | 1:08.498 | PASS |
| 154 | Browser | `node v2/epic-hero-enhancements-browser-qa.mjs` | 23540 | 0:23.540 | PASS |
| 155 | Browser | `node v2/fabius-safe-import-browser-qa.mjs` | 34884 | 0:34.884 | PASS |
| 156 | Browser | `node v2/card-texts-browser-qa.mjs` | 52881 | 0:52.881 | PASS |
| 157 | Browser | `node v2/dg-am-recipient-enrollment-browser-qa.mjs --fixtures=v2/fixtures/sm-da-recipient-gaps-v1-browser.json` | 282047 | 4:42.047 | PASS |
| 158 | Browser | `node v2/dg-am-recipient-enrollment-browser-qa.mjs --fixtures=v2/fixtures/csm-tau-recipient-gaps-v1-browser.json` | 329318 | 5:29.318 | PASS |
| 159 | Browser | `node books/core-rules/tests/core-switch-browser-qa.mjs` | 4289 | 0:04.289 | PASS |
| 160 | Other | `node tools/pages-runtime-package-qa.mjs --source E:\Warhammer\worktrees\preff-speedup-v1 --published E:\Warhammer\qa-tmp\preff-speedup-v1\wh-qa-pre-ff-work-y0aCQo\work\runtime --work E:\Warhammer\qa-tmp\preff-speedup-v1\wh-qa-pre-ff-work-y0aCQo\work\packaging` | 26181 | 0:26.181 | PASS |
| 161 | Other | `node tests/source-enrollment-qa.mjs` | 12395 | 0:12.395 | PASS |
| 162 | Other | `node books/shared/tools/source-freshness.mjs` | 2371 | 0:02.371 | PASS |
| 163 | Other | `node tests/source-ingestion-contract-qa.mjs` | 9868 | 0:09.868 | PASS |
| 164 | Other | `node books/shared/army-book-app-v2/keyword-attribution-qa.mjs` | 1409 | 0:01.409 | PASS |

## Complete generated-gate timing table: all 67 steps

These are nested producer times, already included in job 131. They must not be added to the 164-job total.

| Step | Book/scope | Rebuild command | Elapsed ms | Time | Result |
|---:|---|---|---:|---:|---|
| 1 | core-candidate | `python books/core-rules/tools/build_waha_core_corpus.py --write` | 2475 | 0:02.475 | PASS |
| 2 | core-candidate | `python books/core-rules/tools/build_core_candidate.py --write` | 3658 | 0:03.658 | PASS |
| 3 | core | `python books/core-rules/tools/publish_core_candidate.py --write` | 368 | 0:00.368 | PASS |
| 4 | space-marines | `python books/space-marines/v2/build.py` | 2914 | 0:02.914 | PASS |
| 5 | space-marines | `node books/space-marines/v2/datasheet-build.mjs` | 1209 | 0:01.209 | PASS |
| 6 | space-marines | `node books/space-marines/v2/book-build.mjs` | 1559 | 0:01.559 | PASS |
| 7 | space-marines | `node books/space-marines/v2/mfm-build.mjs` | 2273 | 0:02.273 | PASS |
| 8 | space-marines | `node books/space-marines/v2/rule-contract-build.mjs` | 2794 | 0:02.794 | PASS |
| 9 | space-marines | `node books/space-marines/v2/gameplay-presentation-build.mjs` | 3457 | 0:03.457 | PASS |
| 10 | space-marines | `node books/space-marines/v2/roster-import-build.mjs` | 4040 | 0:04.040 | PASS |
| 11 | space-marines | `node books/space-marines/v2/app-build.mjs` | 22178 | 0:22.178 | PASS |
| 12 | blood-angels | `python books/blood-angels/v2/build.py` | 4183 | 0:04.183 | PASS |
| 13 | blood-angels | `node books/blood-angels/v2/book-build.mjs` | 3027 | 0:03.027 | PASS |
| 14 | blood-angels | `node books/blood-angels/v2/mfm-build.mjs` | 667 | 0:00.667 | PASS |
| 15 | blood-angels | `node books/blood-angels/v2/rule-contract-build.mjs` | 7211 | 0:07.211 | PASS |
| 16 | blood-angels | `node books/blood-angels/v2/gameplay-presentation-build.mjs` | 9670 | 0:09.670 | PASS |
| 17 | blood-angels | `node books/blood-angels/v2/roster-build.mjs` | 9762 | 0:09.762 | PASS |
| 18 | blood-angels | `node books/blood-angels/v2/app-build.mjs` | 38676 | 0:38.676 | PASS |
| 19 | dark-angels | `python books/dark-angels/v2/build.py` | 3972 | 0:03.972 | PASS |
| 20 | dark-angels | `node books/dark-angels/v2/book-build.mjs` | 3322 | 0:03.322 | PASS |
| 21 | dark-angels | `node books/dark-angels/v2/mfm-build.mjs` | 705 | 0:00.705 | PASS |
| 22 | dark-angels | `node books/dark-angels/v2/rule-contract-build.mjs` | 7586 | 0:07.586 | PASS |
| 23 | dark-angels | `node books/dark-angels/v2/gameplay-presentation-build.mjs` | 10096 | 0:10.096 | PASS |
| 24 | dark-angels | `node books/dark-angels/v2/roster-import-build.mjs` | 9722 | 0:09.722 | PASS |
| 25 | dark-angels | `node books/dark-angels/v2/app-build.mjs` | 40831 | 0:40.831 | PASS |
| 26 | adeptus-mechanicus | `python books/adeptus-mechanicus/v2/build.py` | 8275 | 0:08.275 | PASS |
| 27 | adeptus-mechanicus | `python books/adeptus-mechanicus/v2/factual-qa.py --write-census` | 60718 | 1:00.718 | PASS |
| 28 | adeptus-mechanicus | `node books/adeptus-mechanicus/v2/rule-contract-build.mjs` | 2211 | 0:02.211 | PASS |
| 29 | adeptus-mechanicus | `node books/adeptus-mechanicus/v2/app-build.mjs` | 5578 | 0:05.578 | PASS |
| 30 | chaos-space-marines | `python books/chaos-space-marines/v2/build.py` | 17052 | 0:17.052 | PASS |
| 31 | chaos-space-marines | `node books/chaos-space-marines/v2/rule-contract-build.mjs` | 262173 | 4:22.173 | PASS |
| 32 | chaos-space-marines | `node books/chaos-space-marines/v2/roster-import-build.mjs` | 551 | 0:00.551 | PASS |
| 33 | chaos-space-marines | `node books/chaos-space-marines/v2/roster-runtime-build.mjs` | 1974 | 0:01.974 | PASS |
| 34 | chaos-space-marines | `node books/chaos-space-marines/v2/app-build.mjs` | 230802 | 3:50.802 | PASS |
| 35 | death-guard | `node books/death-guard/v2/build.mjs` | 1288 | 0:01.288 | PASS |
| 36 | death-guard | `node books/death-guard/v2/rule-contract-build.mjs` | 2463 | 0:02.463 | PASS |
| 37 | death-guard | `node books/death-guard/v2/roster-contract-build.mjs` | 346 | 0:00.346 | PASS |
| 38 | death-guard | `node books/death-guard/v2/related-rules-build.mjs` | 756 | 0:00.756 | PASS |
| 39 | death-guard | `node books/death-guard/v2/glossary-build.mjs` | 526 | 0:00.526 | PASS |
| 40 | death-guard | `node books/death-guard/v2/app-build.mjs` | 2782 | 0:02.782 | PASS |
| 41 | tau-empire | `python books/tau-empire/v2/build.py` | 11402 | 0:11.402 | PASS |
| 42 | tau-empire | `node books/tau-empire/v2/rule-contract-build.mjs` | 987 | 0:00.987 | PASS |
| 43 | tau-empire | `node books/tau-empire/v2/roster-import-build.mjs` | 1255 | 0:01.255 | PASS |
| 44 | tau-empire | `node books/tau-empire/v2/app-build.mjs` | 2510 | 0:02.510 | PASS |
| 45 | tyranids | `python books/tyranids/v2/build.py` | 8030 | 0:08.030 | PASS |
| 46 | tyranids | `node books/tyranids/v2/roster-import-build.mjs` | 583 | 0:00.583 | PASS |
| 47 | tyranids | `node books/tyranids/v2/rule-contract-build.mjs` | 1018 | 0:01.018 | PASS |
| 48 | tyranids | `node books/tyranids/v2/app-build.mjs` | 3082 | 0:03.082 | PASS |
| 49 | emperors-children | `python books/emperors-children/v2/build.py` | 7860 | 0:07.860 | PASS |
| 50 | emperors-children | `node books/emperors-children/v2/rule-contract-build.mjs` | 868 | 0:00.868 | PASS |
| 51 | emperors-children | `node books/emperors-children/v2/roster-import-build.mjs` | 589 | 0:00.589 | PASS |
| 52 | emperors-children | `node books/emperors-children/v2/roster-attachment-build.mjs` | 1065 | 0:01.065 | PASS |
| 53 | emperors-children | `node books/emperors-children/v2/app-build.mjs` | 3098 | 0:03.098 | PASS |
| 54 | space-marines | `node books/shared/tools/build-new-recruit-model-names.mjs --book=space-marines --write` | 1681 | 0:01.681 | PASS |
| 55 | blood-angels | `node books/shared/tools/build-new-recruit-model-names.mjs --book=blood-angels --write` | 1767 | 0:01.767 | PASS |
| 56 | dark-angels | `node books/shared/tools/build-new-recruit-model-names.mjs --book=dark-angels --write` | 1798 | 0:01.798 | PASS |
| 57 | adeptus-mechanicus | `node books/shared/tools/build-new-recruit-model-names.mjs --book=adeptus-mechanicus --write` | 291 | 0:00.291 | PASS |
| 58 | chaos-space-marines | `node books/shared/tools/build-new-recruit-model-names.mjs --book=chaos-space-marines --write` | 1116 | 0:01.116 | PASS |
| 59 | tau-empire | `node books/shared/tools/build-new-recruit-model-names.mjs --book=tau-empire --write` | 515 | 0:00.515 | PASS |
| 60 | tyranids | `node books/shared/tools/build-new-recruit-model-names.mjs --book=tyranids --write` | 414 | 0:00.414 | PASS |
| 61 | emperors-children | `node books/shared/tools/build-new-recruit-model-names.mjs --book=emperors-children --write` | 425 | 0:00.425 | PASS |
| 62 | space-marines | `node books/space-marines/tools/build-related-rules.mjs` | 545 | 0:00.545 | PASS |
| 63 | core | `node books/core-rules/reader/build.mjs` | 714 | 0:00.714 | PASS |
| 64 | glossary | `node glossary/v2/tools/build-glossary-v2.mjs` | 238206 | 3:58.206 | PASS |
| 65 | core | `node books/core-rules/tests/core-waha-player-visible-reference-census-qa.mjs --write` | 797 | 0:00.797 | PASS |
| 66 | source-registry | `node tools/audit/build-source-catalog-additions.mjs --check` | 15580 | 0:15.580 | PASS |
| 67 | source-registry | `node tools/audit/build-source-catalog.mjs --check` | 6061 | 0:06.061 | PASS |

## Static source evidence and reuse boundaries

The following inventory is the English source-evidence appendix from the measurement, included here so it does not depend on local-only Markdown links.

Base: `2d5defae9e9677e64c48814055ba9b2eb3c24452`. No tests or producers were edited. Counts describe normal sequential pre-FF, not optional standalone modes.

| Preparation | Repetitions / identity | Source | Reuse boundary |
|---|---|---|---|
| Accepted MFM checkout | 17 clones of `35a5e4d59c9343b4c74f8e9b4833ee095f59f411`: nine plain-header, six TARGET-related-panel, two reviewed-text | `tests/helpers/accepted-mfm-history.mjs:17-33`; `tests/helpers/plain-header-history.mjs:7`; `tests/helpers/stratagem-target-assertions.mjs:31`; `v2/reviewed-text-coverage-qa.mjs:23` | Existing `checkout` parameter can accept one queue-owned checkout. Every historical worker, original codec, exact fixture comparison and clean-tree assertion before/after must still execute. |
| Core codec materialization | Nine copies of 30 identical files at `913cfef538bc96b7f2d9b55e21995c631cabffeb` | `tests/helpers/core-transition-history.mjs:16-29`; `v2/related-panel-qa.mjs:11-14` | Share immutable codec files only. Distinct publication decoding and comparisons remain. Do not share the separate intentionally poisoned historical checkout. |
| Baseline runtime package | Four builds from the same source tree and allowlist | `tools/qa-queue.mjs:82`; `tests/browser/pwa-update-flow.mjs:19`; `tests/browser/cold-offline.mjs:16`; `v2/detachment-synthetic-table-browser-qa.mjs:46` | Queue-owned immutable baseline may be handed to consumers. B/variant copies, modified revisions, service-worker state and independent packaging checks remain separate. |
| DA roster preparation | Two same-default DA contract chains, both including inherited SM | `books/dark-angels/v2/roster-import-qa.mjs:20-22` | Existing `buildDarkAngelsImportBook({built})` / `buildGameplayPresentation(built)` parameters allow one preparation. Separate source oracle and every roster case remain. |
| EC roster preparation | Eight default `nativeContracts()` calls plus two contract chains under `buildApp()` | `books/emperors-children/v2/roster-import-qa.mjs:22,43,64,72,86,106,131,154,173`; `app-build.mjs:49,142`; `roster-attachment-build.mjs:11-12` | Prepared books must be freshly cloned per case. Schema functions cannot be JSON-cloned. Nested attachment builder currently lacks a prepared-input parameter. |
| SM / inherited chains | 11 SM contract builds in SM jobs, plus 11 inherited by BA/DA in the inspected app/roster setups | SM `app-build.mjs:24-29`, `app-qa.mjs:17,119,126`; BA/DA `app-build.mjs:20-27`, `rule-contract-build.mjs:34/33` | Base/runtime-specific and canonical/declaration variants differ. Some duplicate constructions are explicit determinism assertions. Broad reuse needs explicit producer handoffs, not substitution with committed generated outputs. |
| Large JSON / source decoding | Repeated in separate processes and browser contexts | `books/shared/source-refs-v2/producer-io.mjs:13-20`; `tests/helpers/source-refs-fixtures.mjs`; per-process CPU profiles | Producer declaration view and published fixture view differ. Mutation tests require fresh objects and registry state. Filesystem cache is not a substitute for parsing; sharing browser application state would alter isolation. |

### Actual checks that must not be removed

- The normal generated gate deletes each producer output and authenticates a fresh checkout before rebuilding: `books/shared/tools/check-generated-rebuild.mjs:36,51-81`. Reusing a previously generated file would remove freshness/missing-write coverage.
- `tests/generated-rebuild-qa.mjs:25-54` uses separate fresh/tampered/dirty checkouts as deliberate controls.
- `tools/pages-runtime-package-qa.mjs:21-34,46-62` independently rebuilds for determinism, line-ending equivalence and refusal/corruption controls.
- `tests/browser/pwa-update-flow.mjs:20-27` mutates B and exercises upgrade/state-preservation controls.
- `v2/detachment-synthetic-table-browser-qa.mjs:99-145` creates distinct valid/missing-table/missing-row cases with independent cache revisions.
- SM `roster-import-qa.mjs:203` deliberately rebuilds to check determinism and no mutation.
- AM/DG app isolation workers poison reads before importing producer modules. Passing a parent-prepared model would evade that boundary.
- Core tests deliberately mutate catalogs/facts. Their alternate inputs cannot share mutable objects.

### Long CSM and Glossary producers are not duplicate book setup

`buildCSMContracts()` alone takes approximately one second in ordinary app QA; this is distinct from the long contract CLI's `compileCSMContracts()` (`rule-contract-build.mjs:120-127,146`). The latter produces compatibility across seven rule kinds. The app builds a different compatibility domain and a second selected-detachment projection (`app-build.mjs:211-214`). Reusing compiled answers would be a compiler change, not preparation handoff.

The full Glossary builds fresh army owner models (`glossary/v2/content/glossary-v2-index.mjs:342-350`; `army-v2-projection.mjs:270-303`). Its CSM path already receives the published `relatedRules` and avoids recompiling compatibility (`army-v2-projection.mjs:295`). It also executes factual freshness checks and two parity assertions; those checks must remain. Sharing only immutable model preparation requires matching source/producer fingerprints and fresh mutable copies.

The queued Core projection test invokes `build-glossary-v2.mjs --core-only --check`. That CLI still builds a fresh full index first (`build-glossary-v2.mjs:15-17`) to verify non-Core owners. This is a second owner-model preparation opportunity, but the non-Core freshness/parity checks and scoped Core assertions must not be skipped.

`v2/source-completeness-check.mjs` calls the owner loader only under `--fresh`; the queued command does not pass `--fresh`. It must not be counted as a third complete owner-model preparation.

### Lifetime and provenance requirements

`tools/qa-queue.mjs:107` cleans exited-child temporary directories after each leaf. Reused preparation must be owned by the queue and removed at the end of that run. No cross-run cache is proposed for implementation.

Package identity must cover source bytes, allowlist, packaging implementation and revision, not HEAD alone. Existing manifest fields include input/published hashes, `contentSha256`, `allowlistSha256` and `cacheRevision` (`tools/pages-runtime-package.mjs:88-104`).

Every historical test still runs its accepted original code. Historical codec, canonical/declaration stage, recipient stage, source registry and frozen fixture identities must remain distinct.


## Local evidence and retained files

Raw evidence is retained locally at:

```text
E:/Warhammer/qa-evidence/preff-speedup-v1-2026-11-14/
```

The following are evidence names, **not broken relative GitHub links**; only this report is included in the publication commit:

| Local artifact | Purpose |
|---|---|
| REPORT.md | Original measurement report in Russian |
| MEASUREMENT.json; JOB_TIMINGS.csv | All job durations, groups and top 20 |
| GENERATED_TIMINGS.csv; baseline-preff/131-check-generated-rebuild.mjs-evidence/wh-generated-rebuild-evidence-9eAYmP/RESULTS.json | Generated-step timings and exact-byte comparison |
| baseline-preff/RESULTS.json; BASELINE_RUN_RESULT.json | Queue PASS results and wrapper time/exit code |
| PREPARATION_TIMINGS.json; PROFILE_METRICS.json | Sampled preparation regions and source call frames |
| PROCESS_INVENTORY.json; processes/; profiles/ | Node/worker observations and native profiles |
| HOST_IDLE_BEFORE.json; HOST_TIMELINE.jsonl | Initial and continuing host observations |
| UNCHANGED_PROOF.json; JOBS_BEFORE.json; JOBS_AFTER.json; CHECKS_INVENTORY.json | Measured-tree and queue equality evidence |
| SOURCE_REMOTE_END.txt | Measured source ls-remote |
| STATIC_PREPARATION_INVENTORY.md; measurement-tools/ | Static investigation and reproducible measurement tools |

Standard QA cleanup removed its checkouts and runtime packages. Only measurement tools and a small native-profiler probe remained under E:/Warhammer/qa-tmp/preff-speedup-v1/; they were explicitly retained for reproducibility. The feature checkout E:/Warhammer/worktrees/preff-speedup-v1/ was retained for source inspection and discussion. Unrelated older temporary folders were not touched. Computed QA results were not reused between runs.

**Measurement decision remains STOP after phase 1. There is no speedup implementation to merge. This single report publication is the only subsequent repository change.**
