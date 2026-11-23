# CSM lazy-glossary renderer investigation

Status: READY FOR REVIEW; requested full 213/213 achieved, with performance limitations recorded.

Source: `b06e22f35bf16bad913cf0dd4c74e3afab08f55c`, advanced only under the owner's explicit FF authorization. Feature: `codex/lazy-glossary-perf-v1`, final code `43af890575b53767e91e8986be190c8b731c2272`. Main, release, Pages and default-branch configuration are unchanged. No release is prepared.

## Evidence boundary and reproduction

The previous full run 45201837522 failed job 205 at CSM/390: the `boundary-sweep` Node phase deadline fired after 30.002 s, then the renderer did not answer a 2.002 s probe. The job exited after 77.767 s; cleanup reaped 6 descendants and the remaining 8 jobs passed. This proves where that failure occurred, not the reason for the renderer's missed response.

The new baseline diagnostic [45233093106](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/actions/runs/45233093106) runs **only job 205**, on `9e005fada23519247334f601c06e37816f41d6ed`. That commit adds numeric diagnostics, with no production change. It passes all 9 books/two widths in 247.588 s. CSM boundary sweeps are12.484 s at 390 and15.527 s at 1440. Thus the previous >30-second failure was not reproduced in this isolated run; it must not be replaced retrospectively with a PASS.

GitHub status requests are scheduled no more often than once per 20 minutes. Diagnostic and full workflows run sequentially, with no job sharding and no automatic retries.

## PC measurements

Chromium149.0.7827.55 / Playwright1.61.1;390Г—844; fresh browser per run; local static origin with `Cache-Control:no-store`; service workers blocked exactly as in job 205. The CPU 4Г— pairs run the exact same ten original assertions and readiness logic against the old/new production roots. V8/timeline sampling is disabled for timing pairs; a Long Tasks observer remains enabled on both. Separate sampled profiles provide attribution and are not used as equivalent timing trials. Network is unthrottled.

| Collection | Before | After | Change |
|---|---:|---:|---:|
| CSM/390 sweep, ordinary PC, median 3 |5.381 s|5.153 s|в€’4.24%|
| CSM/390 sweep, CPU 4Г—, median 3 paired |14.230 s|11.710 s|в€’17.71%|
| Largest Long Task per CPU 4Г— trial, median 3 |1.607 s|1.517 s|в€’5.60%|
| Tasks >1 s in each CPU 4Г— trial |3/3/3|2/2/2|One repeated render removed per trial|

All individual trials are in `PC_TIMINGS.csv`. These are simulated CPU results, not a claim of certification on a physical phone. The CI/ordinary-PC sweep ratio is an observation, not a calibrated CPU-throttling factor.

`LONG_TASKS.csv` retains325 numeric Long Tasks entries from the six paired CPU 4Г— trials. Its phase label records delivery context, not a claim that the named phase caused the task. The sampled V8 profiles are also available as sanitized, loadable metadata: [before sweep](profiles/before-1-boundary-sweep.cpuprofile), [after sweep](profiles/after-1-boundary-sweep.cpuprofile), and the two book/start profiles in [profiles](profiles/). Sample IDs, call trees and time deltas are preserved; raw URLs, unbounded names and the time origin are removed. `PROFILE_SANITIZATION.json` records the projection. Raw originals and timelines remain local.

In the representative sampled trace, the largest Contents click event falls from 1,184.413 ms to 317.151 ms. This is diagnostic attribution, not a replacement for the paired timing medians.

Paired performance measurements use616aef02. The final43af8905 delta only excludes an existing unknown-route warning from reuse, adds its recovery regression and refreshes revision stamps; the measured valid routes are unchanged. That regression first FAILS on616 (`1 !== 0`) and then passes at 390/1440. It prevents preserving a warning after a valid Contents move.

**Residual:** two initial full-book construction/layout tasks above 1 second remain under CPU 4Г—. This work does not claim zero long tasks or that the exact old >30-second stall is fully explained. The representative trace still shows expensive initial native layout/microtasks. The controlled Contents click no longer rebuilds that entire book; the remaining initial-load work is distinct from that avoidable repetition.

## Proven expensive work and changes

| Owner | Before | After | Correctness boundary |
|---|---|---|---|
| `navigation-v1.mjs` | Every geometry pass rescans the whole unchanged DOM to rebuild the same target maps. Representative CPU 4Г— sweep samples attribute about1.18s self time to that repeated map construction. | Cache DOM identities, not positions. | First-in-DOM and headingв†’physicalв†’canonical priority preserved. Identity attributes, nested insertion/removal/reordering and every model refresh invalidate it. Pending observer records are drained synchronously; Start remains live; teardown clears the cache. Without an observer, fresh lookup remains the fallback. |
| `datasheet-v1-layout.mjs` | Repeated settled layout moves the same ability/profile nodes again, producing486 child-list mutations in the baseline CSM guard. | Skip already-correct ordered tails and adjacent profile strips. | The old final node order is preserved. Actual moves still occur when order/position differs. New exact guard requires0 mutations on a second settled flush and fails on the old source. |
| `runtime.mjs`, `rule-term-links.mjs` | A controlled Contents move discards and rebuilds the complete already-open Army Book and its first-show decoration state. | Retain the same canonical DOM and pending prose groups for a controlled move inside the same immutable full Army Book; reveal the exact destination and flush layout before geometry. | No reuse for roster/personal mode, wrong scope, dialogs/references, selected-card views or history restoration. Target/current-card marking and canonical routes remain exact. History uses the old replacement path. |

This also avoids discarding already-loaded unit art during that controlled move. The retained view can preserve native local expansion state; the first CSM datasheet used in the dedicated edge probe had no native `<details>`, so that particular expansion case is marked **not reproduced**, not invented. Both viewport edge probes verify retained canonical nodes, current-card clearing on Start/group navigation, and replacement on history navigation.

## Checks and fixed deadlines

No phase limit, readiness limit, job budget or exact old assertion is relaxed. No retry is introduced.

| Budget | Before | After |
|---|---:|---:|
| Node phase |30,000 ms|30,000 ms|
| Per-boundary readiness |10,000 ms|10,000 ms|
| CI job 205 |332,478 ms|332,478 ms|

`ASSERTION_PRESERVATION.json` compares assertion ASTs against b06, preserving every old expression in order. `EXISTING_TESTS.diff` is the exact test diff.

| Test | Old exact assertion calls | New total | What was added |
|---|---:|---:|---|
| `v2/lazy-glossary-browser-qa.mjs` |10|14|Settled layout emits0 child-list mutations; controlled Contents retains the exact canonical card node; unknown-route fallback and valid recovery remain exact. All10 old checks remain. |
| `navigation-geometry-qa.mjs` |28|70|Identity-cache freshness, first-match, mutation/model/hero/teardown/fallback controls. Original35 counted cases plus23 new cases pass. |
| `rule-term-visibility-qa.mjs` |52|57|A retained destination decorates once and keeps other pending requests available. |
| `browser-phase-controls-qa.mjs` |25|28|Bounded aggregate sweep timings survive detailed-history trimming. |
| `qa-ci-progress-qa.mjs` |37|39|Public sweep records retain only allowlisted book/width/status/elapsed numbers and reject injected fields/values. |

All old expected values are unchanged. The mandatory public workflow report still contains exactly3 fixed files. Numeric sweep aggregates make all 18 book/viewport timings available on PASS as well as FAIL, without copying page text, DOM, source values, console output or private error messages.

Local verification:

- Exact job 205: all 18 book/viewport cases PASS on616; final43 adds the warning exclusion and passes the focused CSM/390 job plus390/1440 edge probes.
- Four exact link views per case:18Г—4 comparisons against the accepted b06 PC results, **0 differences** in link text, target, address and fact ownership.
- Quick:79/79 PASS,227.173 s. This includes integration, census and browser compatibility. The final subsequent changes were the navigation comment and derived revision stamps; exact final-SHA CI results are recorded below.
- Native factual outputs: all 148 files compared byte-for-byte against the b06 checkout,0 differences. The full CI rebuild remains a separate check.
- Baseline negative: the new no-op guard FAILS on b06 (`486 !== 0`); no historical fixture is edited.

## Publication and offline footprint

No startup file, manifest entry, offline policy, book fact, rule/stratagem text, effect, CP, price or census decision is changed. The same 221 mandatory URLs and 455 reviewed assets remain. Normal producer refresh changes only the derived cache revision/stamps in `glossary/generated/cache-revision.js` and `v2/app.html`:

| Item | Before | After |
|---|---:|---:|
| Cache revision |`946ff60a59dc4381`|`7751db657f014918`|
| Mandatory precache bytes |5,134,872|5,138,573|
| Mandatory URLs |221|221|
| New startup files |0|0|

Raw V8 profiles and timelines remain local under `E:/Warhammer/qa-tmp/gh-actions-hang/205/`. `CPU_PROFILE_SUMMARY.json` publishes bounded function/path/timing metadata only; source bodies, RAW Wahapedia, BSData and browser profiles are not published. The private BSData preparation step and secret scope are unchanged.

## Final CI verification

**READY FOR REVIEW.** Final frozen code: `43af890575b53767e91e8986be190c8b731c2272`. No feature FF or release is performed. External owner/Claude review remains pending.

| Run | Scope | PASS | FAIL | Missing | Queue time |
|---|---|---:|---:|---:|---:|
|45233093106 /9e005fad|Baseline single job 205|1|0|0|247.588 s|
|45237412194 /616aef02|Fixed single job 205|1|0|0|235.729 s|
|45240992883 /43af8905|One complete 213-job workflow|213|0|0|138.784 min|

[Full run](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/actions/runs/45240992883) В· [metadata-only artifact](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/actions/runs/45240992883/artifacts/14862062314), retention 30 days. Entire workflow wall time including preparation: 142.800 min. There is no additional local full pre-FF run and no silent retry. The same213 ordered identities, commands and fixture arguments match the accepted plan. Full individual timings are in `FULL_TIMINGS_213.csv`.

| Run | Width | CSM sweep | Status |
|---|---:|---:|---|
|Baseline single205|390|12.484 s|PASS|
|Baseline single205|1440|15.527 s|PASS|
|Fixed single205 on616|390|12.289 s|PASS|
|Fixed single205 on616|1440|14.949 s|PASS|
|Final full on43|390|12.611 s|PASS|
|Final full on43|1440|16.049 s|PASS|

These are single CI observations, not statistical proof of a small speedup. The 616 diagnostic precedes the narrow unknown-warning guard; the final full run executes that guard and its new regression on exact 43. The original30-second failure was not reproduced by the baseline single run; its exact renderer-stall cause remains unproven.

### Ten longest full CI jobs

| Index | Job / arguments | Accepted PC b06 (s) | GitHub43 (s) | Result |
|---:|---|---:|---:|---|
|165|`books/shared/tools/check-generated-rebuild.mjs` |683.609|977.299|PASS|
|179|`v2/attached-rule-text-browser-qa.mjs` |193.598|364.781|PASS|
|207|`v2/dg-am-recipient-enrollment-browser-qa.mjs` --fixtures=v2/fixtures/csm-tau-recipient-gaps-v1-browser.json|185.764|357.280|PASS|
|200|`v2/roster-navigation-browser-qa.mjs` |200.751|329.284|PASS|
|206|`v2/dg-am-recipient-enrollment-browser-qa.mjs` --fixtures=v2/fixtures/sm-da-recipient-gaps-v1-browser.json|155.169|306.255|PASS|
|96|`books/tau-empire/v2/roster-import-qa.mjs` |252.375|301.873|PASS|
|66|`books/dark-angels/v2/roster-import-qa.mjs` |235.129|299.449|PASS|
|198|`v2/rule-popups-browser-qa.mjs` |107.624|272.928|PASS|
|205|`v2/lazy-glossary-browser-qa.mjs` |111.414|248.825|PASS|
|87|`books/space-marines/v2/roster-import-qa.mjs` |174.646|222.937|PASS|

The PC column is the already accepted b06 reference, not a new full PC measurement. All old assertions are retained; job 205 adds four assertions. Runtime performance changes and platform differences prevent treating every elapsed-time ratio as a controlled speed benchmark.

### Final boundaries and remaining work

Native generated rebuild job 165: **PASS**. Its unchanged comparator covers 148 factual files and 68 producer steps. Local 148-file byte comparison and18Г—4 link-view equality are separately documented. The source/gameplay data and census registry are unchanged. No startup file is added; the same 221 mandatory URLs remain, with the normal derived revision refresh.

Two initial-render tasks above 1 second still remain in the CPU 4Г— paired measurements (median maximum1.517 s). The completed work removes redundant navigation/layout/index work; it does not certify that all first-book loading costs or every possible renderer stall are solved. This limitation must remain visible in review even if all 213 CI jobs pass. Phase 30 s, per-boundary 10 s and job 205332.478 s limits remain unchanged.

Raw profiles, timelines and logs stay private under `E:/Warhammer/qa-tmp/gh-actions-hang/205/`, referenced for review. Public evidence contains only explicit metadata and exact test diffs. Source remains the authorized b06 base; main/release/Pages/default are not advanced by this feature. STOP for review.
