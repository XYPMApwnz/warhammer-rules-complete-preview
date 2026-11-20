# Lazy glossary performance evidence

The latest corrected measurement for commit `9876164de85f1e35aa2cf070a3eb9de662093980` passes both book/card performance requirements. Cold HOME also stays within its +5% gate. Full nine-book, two-width exact link parity and target geometry passed. Earlier results are historical; failed attempts remain failed. No performance thresholds were relaxed.

## Revisions and method

- Before task B: `9b99ade9975346afc3644ade7f69d01ed71cce31`, clean existing `card-gained-rules-v1` checkout.
- Baseline 50: `50c9a9c89d8e66e0466dbeeabc918ec1d465c87f`, exported from Git before any implementation edits into `qa-tmp/polish-6/runtime-50`.
- Head: commit `9876164de85f1e35aa2cf070a3eb9de662093980`, including the small generated source-metadata fetch, final MODEL_BASE/MODEL_BASE_METADATA guard and lazy-scroll fixes. The module hashes below identify the measured bytes.
- Installed Google Chrome `154.0.8037.58`; fresh contexts, 390×844 viewport, service workers blocked, unthrottled local static HTTP and CPU, one browser workload at a time.
- Each book/revision has three samples. Revision order is forward, reverse, forward. No unchanged corrected run was repeated.
- Book endpoint is unchanged from the earlier rule-popups recipe: click the Home book entry, wait for the matching mounted book and a unit card, then two animation frames.
- Card endpoint remains `locator.click` through the selected card plus two animation frames. The corrected untimed setup centers the target in the usable viewport, hovers it, then requires stable bounds and a clear center hit-test for three consecutive animation frames.
- Gates remain head book median ≤ 1.05 × before-B median, and head card median ≤ baseline-50 median. No noise allowance was added.

## Final medians, milliseconds

Source: [LAZY_PERFORMANCE_corrected.json](LAZY_PERFORMANCE_corrected.json), 18 samples, **PASS**, finished 2026-11-20 17:18:56 UTC. Compare the ratios within this run; its contemporaneous baselines also differ from the historical run.

| Book | Before-B book | Baseline-50 book | Head book | Head vs before B | Baseline-50 card | Head card | Head card change |
|---|---:|---:|---:|---:|---:|---:|---:|
| Death Guard | 800.4682 | 870.7439 | 558.4798 | −30.23% | 111.4455 | 103.9400 | −6.73% |
| Space Marines | 2370.6282 | 2452.1944 | 1083.8642 | −54.28% | 125.6614 | 111.2004 | −11.51% |

Actual click-event → two-frame medians also improved: DG 29.1 → 23.8 ms; SM 37.6 → 30.1 ms. Initial head book prose-link counts are zero in these two views; selected Plague Marines/Intercessor Squad link counts remain 5/3.

## Historical 71 result and evidence identity

[REVIEW_FINAL_PERFORMANCE.csv](REVIEW_FINAL_PERFORMANCE.csv) and the earlier console output retain the historical `71e5ab85` summary, finished at 12:23:47 UTC:

| Historical book | Before-B book | Head book | Baseline-50 card | Head card |
|---|---:|---:|---:|---:|
| Death Guard | 1609.2275 | 1116.6619 | 161.3907 | 145.4745 |
| Space Marines | 5077.7452 | 2174.9451 | 187.6425 | 154.5286 |

The CSV's evidence column names the JSON as it existed then. That old raw corrected JSON was overwritten by the `9876164d` rerun; **the current `LAZY_PERFORMANCE_corrected.json` does not contain the historical 71 raw samples**. The separately retained pre-scroll-fix JSON is an earlier, different run.

## Cold HOME

[HOME_COLD_PERFORMANCE.json](HOME_COLD_PERFORMANCE.json) is **PASS**: exact baseline 50 median **301.5934 ms**, final median **298.6854 ms**, ratio **0.9903578792** (−0.96%, unchanged limit ≤1.05). Three samples per revision alternate base/head, head/base, base/head. Every sample uses a new Chrome process/profile and context, disabled browser HTTP cache, service workers blocked, unthrottled CPU and raw local HTTP with `no-store` for both revisions.

The timer starts before navigation and ends after the actual HOME has nine unique book cards, completed application/bootstrap, active stylesheets including imports, ready fonts, loaded/decoded HOME/header images and two animation frames. Final HOME additionally requires its successful Sources caption; baseline has no caption feature. Browser launch and SW installation are outside this first-screen measurement.

Final HOME makes exactly one request for the 1003-byte `books/shared/application-v2/generated/source-metadata.v1.json`, with no full Core canonical or MFM-owner requests. Every untimed HOME → Army Books library → HOME probe keeps that count at one. Served request counts are 80 → 83 and uncompressed resource body totals 8,183,267 → 8,202,346 bytes. Request names and ResourceTiming sizes remain in the JSON. New metadata runtime has no imports or JSON import-attribute syntax; the ten source-catalog/passport JSON import-attribute declarations already present in baseline remain separate. This is not physical Safari certification.

## Trace and the measurement correction

[LAZY_BOTTLENECK_TRACE.json](LAZY_BOTTLENECK_TRACE.json) and [LAZY_BOTTLENECK_INCLUSIVE.json](LAZY_BOTTLENECK_INCLUSIVE.json) locate the original cost. Repeated whole-main Contents scans consumed about 564 ms DG / 3814 ms SM inclusive in the profiled startup. Term linking consumed about 99/144 ms inclusive. These are diagnostic profiles, not the gate's timing samples.

Initial lazy matching moved the regex's cold work to the first selected card: [LAZY_CARD_DIAGNOSTIC.json](LAZY_CARD_DIAGNOSTIC.json) records about 12.5/22.9 ms in the head linker. Preparing the existing vocabulary and both string-width paths against whitespace at mount removes that moved cost without examining any page prose or placing links. The warmed DG diagnostic is [LAZY_CARD_DIAGNOSTIC_whitespace-warm.json](LAZY_CARD_DIAGNOSTIC_whitespace-warm.json).

The remaining old-recipe DG miss was 2.9001 ms: 902.2145 → 905.1146 ms. [LAZY_CARD_ACTIONABILITY.log](LAZY_CARD_ACTIONABILITY.log) then proved both versions spent roughly 800 ms before the actual click on instability, sticky-header interception and Playwright's 20/100/100/500 ms retries. [LAZY_CARD_ACTIONABILITY.json](LAZY_CARD_ACTIONABILITY.json) records actual event dispatch at 36.4 → 34.1 ms and event → two frames at 54.7 → 46.4 ms. This justified correcting target preparation identically for all revisions, while retaining the same timed endpoint and gates. The original failure is still [LAZY_PERFORMANCE_final.json](LAZY_PERFORMANCE_final.json), **FAIL_THRESHOLD**.

## Retained runs

| File | Samples | Result / purpose |
|---|---:|---|
| `LAZY_PERFORMANCE_baseline.json` | 12 | Before any edits; before-B vs 50. DG book 1643.3368/1812.8636; SM 5571.9205/5883.4781 ms. Baseline-50 card 909.4907/932.2759 ms. |
| `LAZY_PERFORMANCE_final-before-warm.json` | 18 | FAIL: moved cold matcher cost; both card gates failed. |
| `LAZY_PERFORMANCE_final-whitespace-warm.json` | 18 | FAIL: DG card +11.3601 ms; SM passed. |
| `LAZY_PERFORMANCE_final-before-geometry-index.json` | 18 | Preserved alias of the same whitespace-warm run, not an additional trial. |
| `LAZY_PERFORMANCE_final-pre-baseguard-partial.json` | 14 | Interrupted for the final CSM base-kind guard; no PASS claim. |
| `LAZY_PERFORMANCE_final.json` | 18 | FAIL: then-current pre-scroll-fix bytes, old target setup; DG card +2.9001 ms; other gates passed. |
| `LAZY_PERFORMANCE_corrected-pre-scroll-fix.json` | 18 | One corrected fixed run; all gates PASS before the later desktop-scroll fix. |
| `REVIEW_FINAL_PERFORMANCE.csv` | Historical summary | Historical 71 corrected medians; old raw corrected JSON was overwritten, console/CSV retained. |
| `LAZY_PERFORMANCE_corrected.json` | 18 | Latest fixed corrected rerun on `9876164d`; all book/card gates PASS. |
| `HOME_COLD_PERFORMANCE.json` | 6 | Fixed cold-HOME comparison with fresh browser profiles; +5% gate PASS. |

Recipes are retained under `RECIPES/`. Initial DG card aggregates survive in their JSON; the follow-up superseded the original DG raw card profiles. Warm DG raw profiles have the explicit `_whitespace-warm.cpuprofile` suffix. Original SM cold-card profiles and both initial startup profiles remain available.

## Code and static review

Only continuous Contents decoration is deferred. Requests preserve original presenter order and detached title context; nearest card boundaries prevent a shown parent from scanning unseen children. Focused cards, references and dialogs retain the existing immediate linker, exact aliases, availability checks and canonical anchor factory. Route replacement and teardown discard queued work and disconnect the observer.

Anchor-only mutation suppression requires exact unchanged text and no other structural mutation. Revealed boundary size changes still schedule geometry, and the existing main/header ResizeObserver remains active. The Contents index exists only during one geometry pass, preserves first-DOM-match and heading/physical/canonical priority, and is cleared in `finally`; live queries remain outside the pass. No CSS or content/order changes were introduced.

Desktop browser testing subsequently found a real regression: lazy pill links in intermediate sections grew the page during a controlled smooth scroll. The destination moved by 230 px while the captured scroll destination stayed fixed. Original screenshots/state traces remain in `lazy-desktop-diagnostic/`; baseline reached 151.719 px against a 152 px inset, while head stopped at 382.344 px. The scoped fix retains transient intersections until reader ownership resumes, then checks the actual usable viewport; the explicit destination still links before geometry. `lazy-desktop-diagnostic-after-fix/` proves head now reaches 152.234 px, baseline 151.719 px, both with the canonical unit active.

One later DG390 full-count check exposed an IO scheduling race in the test's guessed two-frame reveal wait. A direct physical introduction-card visit produced its exact eight links. Actual deferred boundaries now expose a presentation-only pending/ready marker; ready is set after linking, even for zero-match groups, and stale pending markers are removed on reset. The marker does not affect boundary classification or filtering. Tests physically visit every eligible marked boundary and await completion; exact assertions remain unchanged.

Final checks: new navigation geometry **35**; new visibility **41** (including controlled/cancelled scrolling, covered/offscreen cards, readiness/reset and frame cleanup); unchanged exact term-link checks **24**, all PASS. Earlier rule-popup **37**, equipment-reference **24** and existing nine-book roster-navigation checks passed; the root's broader regression batch is separate.

[lazy-link-parity-ready/RESULTS.json](lazy-link-parity-ready/RESULTS.json) is **PASS for all 18 cases** at 390/1440. Full-book, focused-card, popup and reference link text, canonical address, target and fact owner match immutable 50 exactly. Full-book counts are DG 464, AM 467, CSM 905, EC 479, Tyranids 618, Tau 390, SM 689, DA 684, BA 635. All unshown test datasheets have zero prose links, and the maximum requested-target error is **0.484375 px**, below the unchanged ±2 px guard. [lazy-negative-eager-summary.json](lazy-negative-eager-summary.json) confirms the eager baseline was rejected with expected exit 1 (`1 !== 0` offscreen links). Initial development and failed intermediate correctness artifacts remain separate; they are not counted as final PASS evidence.

## Captured module SHA-256 hashes

These are the performance-relevant modules captured for the **latest `9876164d`** corrected run, not a claim to hash the entire publication. Metadata-specific hashes additionally come from the cold-HOME report. The final publication manifest is a separate root-owned artifact.

| Module | Before B | Baseline 50 | Head |
|---|---|---|---|
| Army runtime | `470397895010047d047ade5cc8a2674c6018def2dc585d7008901861cd8b1412` | `d79caf8cf4c682d66de38274aa1f893e0fa52f8ea3d4d038166cba4c2c7f3fc4` | `d8bbc51f09d0a50aaae0242b8a564b2236be210a208639196572dcb47b9b70f6` |
| Rule-term linker | Absent before B | `93b53e945ce90046c59065b5339a0449407e65d6d651ebb602566583ebe5ed3c` | `5375b7b18d480ee7f6aabeef0e831c6ff827cf9b4461b3d587823ff4af6d5792` |
| Navigation adapter | `b48ceb07f0bdbbd2ac0147989e41933ed721b0addbffd93429938098e4366826` | `63ba24f1a73492cb95e164d8b0d00f2195adfd4a2384996f1b86cf1a9a1cb3d3` | `b8c6c2b60452b23a46baaf64da910138ccb8b09bb95f8500640a95dc5bd6fab2` |
| Navigation controller | `400b84410b3d3ccfe1cd351abdba4314deaf27d19f7ef393ede8680af1d95069` | `1d7f0d856e59ab527dafb799a77e8fbab552b37e987b6f4a34eb68545d2fdd0a` | `22a8fe82821dda9d9bd1cb0e2637ce00c3d4af813c30872edce549fd2605a039` |
| Application runtime | `4cd3a510ed6adef9d4163db9279fe3b3e3aa85d43f9fdbbdbcfb08d524a1a2f8` | `4cd3a510ed6adef9d4163db9279fe3b3e3aa85d43f9fdbbdbcfb08d524a1a2f8` | `b6e3ff5aa04273010e5dbaa44e4e7fa2a15922d04a71a144efd03c27f148182e` |
| Home | `33f2db5085333d9cd4babfebf7b0c9752cf532be5fedd29a849efc528b22d7a5` | `33f2db5085333d9cd4babfebf7b0c9752cf532be5fedd29a849efc528b22d7a5` | `ee4f99d7f1465293d865a1bebf80d9ec43383872ec2690137f0b893ad9a2c993` |
| Metadata loader | Absent | Absent | `ac426c0b8efa4cc1042d2a7f766feae82f6eab89f250bfb552a630bc1c2a615e` |
| Generated metadata JSON | Absent | Absent | `d27f4b10e255d3cc6fb67743a83e9f766f6d30b6ace02a85e383c67d0bd01f66` |
