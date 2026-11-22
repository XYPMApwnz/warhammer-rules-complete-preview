# Fast first load — verification report

Feature: `codex/fast-first-load-v1` at `e08ec20df980d4e6700c32b65069de983b250e03`. Base: `8579a7a77c7f5e8dad291afc11b27aab3cd9d73a`.

Runtime preview only. No release candidate, source fast-forward, release update or Pages deployment is authorized by this task.

**READY_FOR_REVIEW. The cold Fast-4G Core check passed without regression, and the one owner-authorized additional full pre-FF passed 209/209 on unchanged `e08ec20df980d4e6700c32b65069de983b250e03`. No third run, Core test patch or timeout increase occurred. Preview was switched only after final PASS. See the [22 November follow-up](cold-core-2026-11-22/REPORT.md).**

## Result

UI opening is separated from complete offline preparation. A hash-verified startup control core activates first; the same revision’s complete 221-URL offline package follows in the background. Invisible unit artwork has no source URL until visible. Current revision-marked resources reuse only verified bytes; unmarked requests retain network-first behavior.

## Matched measurements

Fresh Chromium 154 profiles, 390 px, no CPU throttle; three repetitions for each network/view/cache combination. Both sides use the same local Pages-like HTTPS/H2 server and gzip level 6, with one shared link cap across page, worker and browser traffic. Fast 4G is configured at 9 Mbit/s with 170 ms RTT; Slow 4G at 1.6 Mbit/s with 150 ms RTT. Fast calibration medians were 171.2/171.6 ms before/after; Slow medians were 169.9/155.7 ms with Windows timer quantization. The same configured cap is used; measured RTT jitter remains a limitation. Actual calibration timings are retained in the measurement indexes. Remote/live audit timings were not reused as the before side.

UI readiness below retains the original audit’s navigation/DOM driver, including native roster import completion. Passive application-promise and DOM marks remain separate diagnostics in CSV; they are not silently substituted for interactivity. FCP includes the initial Loading screen. Offline usability is the maximum of exact-revision Ready broadcast receipt and worker activation; full 221-key proof is also required. Independent column medians are not additive.

| Network | View | Cache | UI before s | UI after s | FCP before / after s | Offline before / after s | HTTP sends before / after | Encoded bodies before / after MB |
| --- | --- | --- | ---: | ---: | --- | --- | --- | --- |
| unlimited | Home | cold | 1.70 | 1.43 | 0.10 / 0.09 | 1.54 / 1.97 | 296 / 231 | 2.737 / 2.562 |
| unlimited | Home | warm | 0.32 | 0.49 | 0.05 / 0.05 | 0.00 / 0.00 | 16 / 6 | 0.033 / 0.012 |
| unlimited | DG book | cold | 3.99 | 4.15 | 0.10 / 0.19 | 1.39 / 3.96 | 367 / 235 | 26.769 / 4.049 |
| unlimited | DG book | warm | 2.52 | 2.54 | 0.17 / 0.06 | 0.00 / 0.00 | 25 / 9 | 1.486 / 0.086 |
| unlimited | SM book | cold | 8.75 | 8.37 | 0.11 / 0.16 | 1.36 / 5.56 | 338 / 235 | 5.751 / 4.947 |
| unlimited | SM book | warm | 7.30 | 6.98 | 0.08 / 0.08 | 0.00 / 0.00 | 25 / 11 | 3.018 / 0.086 |
| unlimited | DG import / saved roster | cold | 3.67 | 3.87 | 0.17 / 0.08 | 1.39 / 3.58 | 335 / 235 | 4.051 / 3.575 |
| unlimited | DG import / saved roster | warm | 2.22 | 2.07 | 0.05 / 0.05 | 0.00 / 0.00 | 24 / 9 | 1.486 / 0.086 |
| fast4g | Home | cold | 22.91 | 3.99 | 0.40 / 0.39 | 21.41 / 12.08 | 296 / 231 | 2.737 / 2.562 |
| fast4g | Home | warm | 0.79 | 0.80 | 0.22 / 0.22 | 0.00 / 0.00 | 16 / 6 | 0.033 / 0.012 |
| fast4g | DG book | cold | 28.06 | 8.01 | 0.39 / 0.38 | 21.26 / 14.82 | 367 / 235 | 26.769 / 4.049 |
| fast4g | DG book | warm | 4.97 | 3.14 | 0.31 / 0.33 | 0.00 / 0.00 | 25 / 10 | 1.486 / 0.086 |
| fast4g | SM book | cold | 34.14 | 14.25 | 0.39 / 0.38 | 21.28 / 19.03 | 338 / 235 | 5.751 / 4.947 |
| fast4g | SM book | warm | 11.24 | 7.69 | 0.43 / 0.26 | 0.00 / 0.00 | 25 / 11 | 3.018 / 0.086 |
| fast4g | DG import / saved roster | cold | 27.71 | 8.07 | 0.38 / 0.41 | 21.20 / 14.09 | 335 / 235 | 4.051 / 3.575 |
| fast4g | DG import / saved roster | warm | 4.73 | 2.94 | 0.22 / 0.22 | 0.00 / 0.00 | 24 / 11 | 1.486 / 0.086 |
| slow4g | Home | cold | 31.54 | 8.59 | 0.37 / 0.37 | 29.30 / 20.54 | 296 / 231 | 2.737 / 2.562 |
| slow4g | Home | warm | 0.85 | 0.74 | 0.21 / 0.21 | 0.00 / 0.00 | 16 / 6 | 0.033 / 0.012 |
| slow4g | DG book | cold | 42.78 | 15.15 | 0.36 / 0.36 | 29.26 / 29.37 | 367 / 235 | 26.769 / 4.049 |
| slow4g | DG book | warm | 11.11 | 3.40 | 0.29 / 0.30 | 0.00 / 0.00 | 25 / 11 | 1.486 / 0.086 |
| slow4g | SM book | cold | 55.45 | 26.34 | 0.36 / 0.37 | 29.00 / 37.07 | 338 / 235 | 5.751 / 4.947 |
| slow4g | SM book | warm | 23.36 | 8.33 | 0.24 / 0.43 | 0.00 / 0.00 | 25 / 11 | 3.018 / 0.086 |
| slow4g | DG import / saved roster | cold | 42.45 | 15.18 | 0.35 / 0.36 | 28.91 / 27.45 | 335 / 235 | 4.051 / 3.575 |
| slow4g | DG import / saved roster | warm | 10.66 | 3.17 | 0.20 / 0.21 | 0.00 / 0.00 | 24 / 11 | 1.486 / 0.086 |

All 24 groups have n=3; all 144 observations are retained. Exact bytes, timestamps, partial bytes before/after UI, request rows and same-file duplicates are in the accompanying CSV files.

**Trade-off:** on an unlimited link some small absolute driver regressions remain (including cold DG and cold DG import), while passive app readiness is earlier. On Slow 4G direct SM, offline preparation completes later because book usability is prioritized. These costs are visible above; the offline package is not represented as instantaneous.

**Data quality:** before-side validation arrays are empty. After-side records retain two zero-body service-worker update probes canceled 12/14 ms after their observation windows, when the test profiles closed. Both began after the working screen was ready. Original failure/delta counters are kept, not removed or resampled; NetLog CANCELLED evidence is in `TEARDOWN_REQUEST_ANNOTATION.json`. No application page exceptions, incomplete response bodies, compressed-size fallbacks or missing readiness marks occurred.

## Queue 4/6/8 experiment

Each alternative has three fresh Home cold/warm pairs per Fast/Slow network. Variants are temporary packages made by changing only the declared concurrency constant, then using the normal package producer/check. The 4-slot restamp has the same runtime content hash. Factual JSON and the 221-URL composition are unchanged in all variants.

| Slots | Network | Cold UI s | Cold offline usable s | n |
| ---: | --- | ---: | ---: | ---: |
| 4 | fast4g | 3.99 | 12.08 | 3 |
| 4 | slow4g | 8.59 | 20.54 | 3 |
| 6 | fast4g | 4.02 | 10.07 | 3 |
| 6 | slow4g | 8.74 | 18.80 | 3 |
| 8 | fast4g | 4.08 | 9.02 | 3 |
| 8 | slow4g | 8.59 | 17.70 | 3 |

**Decision: retain 4.** Six/eight slots reduce background completion by about 2–3 seconds but do not improve Home interactivity. The requested four-request background budget is preserved; no higher publication concurrency is inferred from a Home-only experiment.

## Startup and revision safety

The seven startup cache keys represent five physical bodies: 45,178 unique raw bytes (83,363 bytes counting alias cache entries). Full mandatory entries total 5,183,834 raw bytes versus 5,139,186 on the base; all 221 paths/members remain, with new revision tokens and code hashes. `CACHE_INVENTORY_SUMMARY.json` records the calculation.

```text
./
./index.html
./v2/app.html
./books/shared/offline-status.js?v=4
./books/shared/offline-status.js?wh-pwa=<revision>
./books/shared/styles/offline-status.css
./v2/boot.mjs
```

The worker and freshness inventory are additional browser-managed bootstrap requests. Application module/data dependencies are fetched on demand through the controlling worker and checked against its immutable publication inventory; they do not wait for all 221 URLs. The full graph stays covered by the mandatory offline inventory.

- Full mandatory URL membership is unchanged. Its hashes and raw-byte cache namespace identify one coherent publication.
- Initial HTML runs the network-first unmarked `?v=4` updater with an SRI hash. This permits an old controlling worker to load the new updater safely.
- Package-only AST edits stamp native imports/resource literals; source/Node modules, factual JSON and the classic glossary data assignment are untouched. No import maps or JSON import attributes are introduced.
- Cache-first applies only to one exact `wh-pwa` value equal to the active revision, a listed file and a SHA-verified response. Foreign/ambiguous/unknown marked code is refused. Corrupt bytes are repaired, never served.
- HTML, service-worker code and freshness manifests remain network-first; unmarked CODE_A cache plus network CODE_B still returns CODE_B. Original JSON 409 and migration controls remain unchanged.
- In-flight foreground/background requests reuse verified bodies of the same cache namespace. Repeated version-oracle/entry/updater requests remain intentional network-first exceptions.
- Activation waits only for verified core. Background work is owned by message events, not by activate.waitUntil. A current page’s bootstrap-complete signal prioritizes its first screen.
- A restarted worker adopts progress ordering through a new instance token and an authoritative query; late old messages cannot overwrite Ready.
- A completely verified package stays Ready when reopening offline; network loss does not create a false version mismatch.

Visible English copies: `Preparing offline access…`, `Ready for offline use` (briefly, then hidden), `Offline access not ready — will retry`; updates at Loading retain `Updating to the new version…`. Status is aria-live.

## Artwork

The shared datasheet presenter defers IMG src until a positive viewport intersection, with reserved geometry and lifecycle cleanup. No per-book branches were added. DG’s 32 published art bindings retain 32 placeholders and make 0 unit-art requests at initial book opening. Opening one card makes its current-revision image request; the held-response/decode comparison preserves header width and height exactly.

## Real browser scenarios

| Scenario | Result | Evidence |
| --- | --- | --- |
| Usable Home while a real noncore mandatory response is held | PASS | first-load-browser-1 |
| Network disappears after core/Home is usable but before full Ready; clear status, no blank screen or reload loop; automatic recovery | PASS | first-load-browser-1 |
| All221 exact keys and SHA-256 values after recovery | PASS | first-load-browser-1 |
| Nine native books warmed online, then reopened offline; real DG v37.25 saved roster and second offline visit | PASS; exact snapshot/storage bytes | first-load-browser-1 |
| A→B during background preparation | PASS; foreign body absent from A, A never Ready, B waits, working DOM/storage unchanged | first-load-browser-1 |
| Verified cached boot with unavailable network | PASS; exact current revision and hash | bootstrap-targeted-5 |
| Stalled/unavailable real boot dependency, no loop, actionable retry/recovery and unchanged saves | PASS | bootstrap-targeted-5; update-targeted-3 |
| Core/glossary/card/guide offline at 390/1440 | PASS | offline-targeted-1; repeated by final pre-FF |

The final-current-run case summaries are [PWA_FINAL_RESULTS.json](PWA_FINAL_RESULTS.json) and [FIRST_LOAD_BROWSER_FINAL.json](FIRST_LOAD_BROWSER_FINAL.json); earlier targeted folder labels in the table identify the local detailed receipts.

Large untouched book/glossary payloads remain lazy, as before. The nine-book offline scenario deliberately opens each book online first. Browser eviction/quota and uncached artwork remain the accepted limitations; Ready refers to the declared offline package, not automatic download of every Army Book’s large data.

## Actual historical updates

| Old publication | Width | Startup to working s | Saved DG/SM and all localStorage | Offline repeat |
| --- | ---: | ---: | --- | --- |
| 1fd0b279 | 390 | 1.99 | identical (18915 bytes) | PASS |
| 1fd0b279 | 1440 | 2.06 | identical (18915 bytes) | PASS |
| e3db1b34/runtime-identical base | 390 | 2.44 | identical (31508 bytes) | PASS |
| e3db1b34/runtime-identical base | 1440 | 2.31 | identical (31508 bytes) | PASS |

The existing working document keeps its native roster, physical DOM and unfinished draft with a manual banner. A separate Loading document applies the new core and opens without a button. Separate bootstrap regression also covers ordinary reload, late input, once-per-version markers and manual recovery.

Historical input disclosure: 1fd0b279 does not accept the later authentic DG plain v37.25/v37.15 exports. Those failed attempts remain recorded. Its DG save uses the exact previously accepted `DERIVED_NOT_REAL_EXPORT` record `dg-short-derived-labelled`, SHA `ab88387de19a9020f96668c16198cb5ec87ab4c6c35670d8075aac8964300b1f`, with two units; no export was converted. The current-live→new scenario uses the authentic DGv37.25 export. SM uses the authentic v37.3 fixture in both. Historical point status is optional report metadata because that old DG facade lacks the modern getter; native unit/render counts and exact storage assertions are mandatory.

The original historical harness counted two console error-level events per width. A separate same-assertion diagnostic records their exact text and phase: network-first freshness requests for `glossary/generated/cache-revision.js` report `net::ERR_FAILED` only during intentional candidate-offline operation. These are retained as expected offline network attempts, not hidden or counted as a clean console. Page exceptions and failed origin responses are zero; the offline native views and exact storage assertions pass. See `HISTORICAL_CONSOLE_SUMMARY.json`.

## Old-test changes and precision

The queue also preserves all 203 old jobs in their exact order and with exact arguments (only absolute checkout roots normalized), adding six new jobs; see `QUEUE_PRESERVATION.json`. Every original assert call remains an ordered AST subsequence with exact arguments/messages: bootstrap 111→114, update 26→31, cold/offline 24→24, package QA 15→15. The full diff is `TEST_CHANGES.patch`; the independent audit is `ASSERTION_PRESERVATION.json`.

| Test / old location | Before | After | Why |
| --- | --- | --- | --- |
| tests/minimal-pwa-cache-qa.mjs:27–30 and JSON/migration controls | Unmarked cached A versus network B | Unchanged file and expectations ; 36 controls retained | New marked-only behavior is tested separately; old behavior still applies to unmarked URLs |
| tests/browser/pwa-bootstrap-update.mjs:125–155 | App ready / workerinstalled implied full offline preparation | Explicit full preparation precondition before offline-only assertions | Interactivity no longer implies full offline readiness |
| same:44–46,377–409 | Network boot outage after boot was already verified/cached | Remove exactly one B-only noncore boot dependency, `books/shared/application-v2/runtime.mjs`, then hold/refuse it | It is a direct boot import and genuinely unavailable; all old failure, button, timeout, activation, reload, recovery, storage and DOM assertions remain |
| same:152–165 | First offline start implicitly used cached boot | Additionally verify boot’s current-manifest SHA and successful SW response with network unavailable | Positive check of the new intended cache behavior |
| tests/browser/pwa-update-flow.mjs:26,44–46 | Failed installation fault targets datasheet-system.css; install completion implicit | Refuse core boot.mjs before B has cached it; explicit full preparation before offline; add restored-connectivity Retry proof | Noncore CSS no longer blocks activation; all old native-state/sibling/draft/storage assertions remain |
| tests/browser/cold-offline.mjs:33–37 | Full package implicit at appready | Wait for verified offline preparation before disconnecting | All 24 old exact assertions remain |
| tools/pages-runtime-package-qa.mjs | Existing 14 named boundary checks | All retained; independent core/import-stamp/SRI guard added | Exact published bodies and negative mutations checked without evaluating native modules |

Owner authorizations covered the marked-only cache policy and these outage-precondition adaptations. No numeric/textual gameplay expectation was changed.

## Core popup timeout investigation

The original full run failed only `v2/core-reader-browser-qa.mjs:103`, calling `assertCorePopup:42`: `page.waitForFunction: Timeout 15000ms exceeded.` The exact stack is preserved in `CORE_PREFF_FAILURE.txt`. No Core test expectation or timeout was edited.

A sequential base/head/base/head/base/head comparison with an external diagnostic observer passes 3/3 on each side. All 46 original assertions, wait predicates and arguments remain exact. There are 24 successful popup observations; all are visible and satisfy the expected document/frame/glossary state, maximum 2.228 seconds. Tracing changes timing and is not treated as a clean performance baseline. The earlier background-rAF and changing-href hypotheses were not demonstrated; the cause of the original timeout remains undetermined. See `CORE_OBSERVER_ASSURANCE.json` and `CORE_COMPARISON_SUMMARY.json`.

Core reader, native application runtime, boot, HTML and the Core test are unchanged against the base. The relevant blocked-service-worker fallback difference installs a fetch revision marker; the source test server ignores queries and returns the same bytes. This inspection does not prove the absence of a timing regression. The owner subsequently authorized one additional full run after the cold Fast-4G comparison. All 40 observations passed without branch regression; the second full run then passed 209/209, including the unchanged Core test in 54.043 seconds. The original timeout was not reproduced or fixed by a test change; its cause remains undetermined. No third full run was started.

## Gates and artifacts

First full pre-FF: **208 PASS / 1 Core timeout**, 132.01 minutes; [original results](PREFF_RESULTS.json) and stack are retained. After the cold comparison and explicit owner authorization, the final full run passed **209/209**, 78.73 minutes, on exactly the same source SHA. [Final results](PREFF_FINAL_RESULTS.json), [final per-job times](PREFF_FINAL_TIMINGS.csv). The diff between the pre-FF SHA and final code SHA is empty. Only two full runs were started.

- Runtime package/check/determinism/boundary: 15 PASS; 456 inventory files / 282,878,160 bytes, plus the 308,073-byte manifest (457 files / 283,186,233 bytes on disk); 221 mandatory keys.
- Runtime content SHA-256: `32efc21a7166f44a2d758ce869139e0191a30195abeccdc22884953cb1668b2b`; revision `9445e8293bc10c1c`.
- Exact published syntax: 142 JS modules and 3 inline scripts PASS for safari15/chrome100/firefox102; API/real Safari engine validation is separate.
- Factual publication byte comparison: 41 JSON/generated-data JS files, 232,985,525 bytes, 0 differences. Tracked generated changes: 0. The generated rebuild gate passed in both full runs: all 148 files / 68 steps, byte-identical; [first](GENERATED_REBUILD.json), [final](GENERATED_REBUILD_FINAL.json).
- Fresh native A/B: 199 cases, 507 states, 9 books, 0 differences, no masking.
- Markup census: 2,724 rules; EXECUTED 812 / RECIPIENTS_ONLY 1,478 / TEXT_ONLY_INTENDED 419 / GAP 0 / UNKNOWN 15; registry unchanged.
- New cache controls 16, worker-instance controls 4, package-stamp/core mutations and art-visibility controls pass. Original 36 cache/JSON/migration controls are retained.
- No new runtime file or allowlist member; startup/full-inventory guards are updated for the staged model.
- Gallery: self-contained `GALLERY.html`, six original 390 px PNG screenshots, 4,118,147 bytes; image bytes are not re-encoded.

Full results remain in the local task evidence root. Private NetLogs are additionally archived locally (86 files / 417,341,717 raw bytes / 28,949,819 ZIP bytes) and are not published. Public evidence excludes raw exports, storage contents, NetLogs, browser profiles, TLS material, RAW source captures and runtime package binaries.

## Reproduction and boundary

Use `npm run test:fast-first-load`, `npm run test:fast-first-load-browser` and the existing PWA update/offline commands. Timing recipes in `measurement-recipes/README.md` use already-built immutable packages, fresh profiles, matched controls and sequential execution. The accompanying source recipes preserve the actual observer and NetLog reducer used for the tables. Six/eight variants are explicitly not for publication. No heavy verification runs overlap.

The feature remains at the unchanged SHA above. After final full PASS, preview PID 1348 serves runtime `32efc21a…` at **http://192.168.1.124:8765/** (HTTP 200) and **https://192.168.1.124:8443/**. Both listeners bind `0.0.0.0`; TLS material is byte-identical. Fresh-browser smoke passes at HTTP/LAN 390 px and HTTPS/loopback 1440 px, including a verified-ready offline reload. HTTP on the LAN is an insecure context and does not offer service workers; the HTTPS check exercises the worker. Source remains `8579a7a7…`; release remains `e3db1b34…`. No fast-forward, main/release change or Pages action occurred. [Preview switch](PREVIEW_SWITCH.json), [browser smoke](PREVIEW_BROWSER_SMOKE.json).

Automatic approval review rejected the cleanup command with `blocked by policy` before process creation. Zero deletion operations ran. `E:/Warhammer/qa-tmp/fast-first-load` remains, including the owned base worktree and its dependency junction; no workaround was attempted. See `CLEANUP.json` and `PREVIEW_UNCHANGED.json`.

## Evidence links

- [Matched before/after table](BEFORE_AFTER.csv), [before observations](measurements-base/observations.csv), [after observations](measurements-after/observations.csv).
- [Before requests](measurements-base/requests.csv), [after requests](measurements-after/requests.csv), [timing methodology](measurement-recipes/README.md).
- [Full old-test diff](TEST_CHANGES.patch), [assertion preservation](ASSERTION_PRESERVATION.json), [queue preservation](QUEUE_PRESERVATION.json).
- [Generated rebuild](GENERATED_REBUILD.json), [factual byte comparison](DATA_BYTE_PROOF.json), [native A/B](AB_RESULTS.json), [census](CENSUS_SUMMARY.json).
- [First full pre-FF](PREFF_RESULTS.json), [final full pre-FF](PREFF_FINAL_RESULTS.json), [final per-job timings](PREFF_FINAL_TIMINGS.csv), [Core error stack](CORE_PREFF_FAILURE.txt), [Core comparison](CORE_COMPARISON_SUMMARY.json).
- [PWA current-run cases](PWA_FINAL_RESULTS.json), [historical offline console classification](HISTORICAL_CONSOLE_SUMMARY.json), [syntax guard](PACKAGE_SYNTAX.json).
- [Self-contained gallery](GALLERY.html), [verification status](VERIFICATION_STATUS.json), [current preview](PREVIEW_STATUS.json), [prior preview record](PREVIEW_UNCHANGED.json), [cleanup refusal](CLEANUP.json).
