# Polish 6: sources, lazy glossary links and informational import notes

Status: **READY_FOR_REVIEW**. Final feature `9876164de85f1e35aa2cf070a3eb9de662093980` on `codex/polish-6-v1` is committed and clean. Accepted base: `50c9a9c89d8e66e0466dbeeabc918ec1d465c87f`. Final native A/B is **PASS: 199 rosters / 507 states / 9 books / 0 differences**, completed at `2026-11-20T17:20:39.230Z` on the exact final feature. See [AB_FINAL.json](AB_FINAL.json) and [latest per-book hashes](REVIEW_NATIVE_AB.latest.csv). The user authorized one new complete **198-job** pre-FF after that A/B; its result is **PASS: 198/198, 79.12 minutes, exit 0**. Independent Claude approval and FF remain separate owner-controlled steps. No deployment was performed.

## Live source captions through a 1003-byte artifact

Home displays its source caption immediately below Library; each Army Book displays its caption after its homepage sections. Current text remains:

> Points: Munitorum Field Manual v1.6 · Core Rules: 11 Nov 2026

Global version is derived from `mfm/current.json.version`. Each book version follows its actual passport `mfm.currentRelease`; Core date/fingerprint and battle-size rows follow accepted `books/core-rules/content/core-rules.digital-11e.json` metadata and Core Rules 25.03. The separate official correction labels remain unchanged.

The initial implementation's eager 232,708-byte Core JSON and MFM source imports were replaced. The Node-only producer `books/shared/tools/build-source-metadata.mjs` deterministically emits **1003 bytes** at `books/shared/application-v2/generated/source-metadata.v1.json` with schema `application-source-metadata/v1`. It includes global MFM version, per-book MFM versions, Core capture date / corpus fingerprint and source battle-size rows. It has no timestamp or factual override. The browser performs one ordinary fetch and one JSON parse per application context, shared by Home, all nine books and import notices. Failed reads can retry. It does not fetch the full Core/MFM source owners or reparse a book presentation to show metadata.

Independent QA compares the entire artifact to separate direct source reads. MFM version, Core capture date, corpus fingerprint, table points, table DP and one passport-selected release pointer each invalidate stale output and change a rebuild. The actual CLI fails stale checks with exit 1 without writing; rebuilding restores deterministic bytes. Invalid source fields are rejected. Source changes select the producer explicitly for MFM/current, canonical Core JSON and all nine book configurations (11 tested inputs).

The latest real browser check passes **42 checks** across all nine books and 390/1440 widths, including exactly one metadata GET/parse per context and no raw-owner request. Earlier 40-check evidence remains separate. [Latest sources results](library-small-metadata/RESULTS.json), [latest sources gallery](library-small-metadata/gallery.html).

## Generated gate: one additive artifact, unchanged legacy proof

The actual rebuild plan is **68 steps / 148 files**: exactly one new source-metadata producer/output inserted before the Core reader. The prior plan is still 67 steps / 147 files with immutable fixture SHA `19db00e4817d116a3fc9307f68df4b11b164e1c147153642563baebaabd75880`. Old tests strictly validate the additive step/output before projecting it out solely for the unchanged legacy hash comparison; actual 68/148 plan remains the update-selection authority. No fixture hash or old source expected value was repinned.

Negative controls prove that modifying old producer args or an old output still fails the original hash. Duplicate metadata step, wrong output, extra args, wrong position, duplicate file and missing file are rejected (eight controls total). The first completed full run already passed the old 147-file generated rebuild gate; the new complete 148-file regeneration result is **PASS: 148/148 files, 68/68 producer steps, zero byte differences** in the authorized new full run (GENERATED_FINAL.json). Existing 147-output byte equality is confirmed on the final SHA in SCOPE_EQUALITY_FINAL.json; the 148th file is a new derived artifact, independently checked against accepted inputs.

## Model-base captions

Only the displayed `(⌀Use model)` instruction becomes `(Use model base)`. Original source values, fact IDs, source identity and numeric base sizes remain exact. Both MODEL_BASE and CSM's MODEL_BASE_METADATA are covered; the latter's text fact is presented through composition with its original source address. Unique instruction counts remain **AM 2 / CSM 7 / DG 6**. Source records/display rows are AM 35/38, CSM 60/60, DG 36/36; other books legitimately publish zero such source facts. The public CSM Chaos Rhino link and readable caption are checked at both widths.

## First-show links and performance

Continuous books preserve content/DOM. Only prose decoration waits for the first displayed boundary; focused cards, dialogs and references retain complete linking. Exact title context, canonical identity, scope, ordering, available-target checks and idempotence remain shared. The fixed navigation transition defers intermediate intersections while the navigation controller owns smooth scrolling, then links the real usable viewport; requested destinations are ready before geometry. Link-only unchanged-text replacements avoid redundant geometry; actual size changes retain geometry scheduling. The disposable per-pass Contents lookup preserves first-match and heading/physical/canonical priority and is cleared in finally.

Earlier desktop destination drift and reveal-readiness races remain documented rather than hidden. Final exact parity evidence covers 18 book/width cases and full/selected/dialog/reference arrays, including text, target address and fact owner. Recorded full-book counts remain DG 464, AM 467, CSM 905, EC 479, Tyranids 618, Tau 390, SM 689, DA 684, BA 635. Maximum recorded target error 0.484375 px meets the unchanged ±2 px guard. Final records confirm final-run parity evidence **PASS in the final complete run; LINK_PARITY_FINAL.log**; prior strict 18-case evidence is preserved.

The final corrected DG/SM benchmark was repeated after the small-metadata change and is **PASS**, finished `2026-11-20T17:18:56.667Z`, Chrome 154.0.8037.58, three alternating samples per revision, 390×844, fresh contexts, service workers blocked, unthrottled local network/CPU, no heavy parallel work. Untimed setup verifies a stable unobstructed target for three frames; endpoints and thresholds are unchanged: head book ≤ 1.05×before-B; head card ≤ baseline 50.

| Book | Before-B book ms | Final book ms | Change | Base50 card ms | Final card ms | Change |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| death-guard | 800.4682 | 558.4798 | -30.23% | 111.4455 | 103.9400 | -6.73% |
| space-marines | 2370.6282 | 1083.8642 | -54.28% | 125.6614 | 111.2004 | -11.51% |

Latest exact rows are in [REVIEW_FINAL_PERFORMANCE.latest.csv](REVIEW_FINAL_PERFORMANCE.latest.csv) and [current raw benchmark](LAZY_PERFORMANCE_corrected.json). Event-to-two-frame medians are DG 29.1→23.8 ms and SM 37.6→30.1 ms. The earlier old-recipe FAIL_THRESHOLD and its +2.9001 ms DG miss remain separate. Earlier 71-era medians survive in the original REVIEW_FINAL_PERFORMANCE.csv and logs; the raw LAZY_PERFORMANCE_corrected.json was inadvertently replaced by this latest run, that filename contains only the final rerun, not both runs. This provenance limitation is explicit; prior CSV/logs remain preserved.

Cold first-screen Home also passes the user-requested fresh browser process/profile comparison: baseline 301.5934 ms → final 298.6854 ms, ratio 0.990357879 (-0.9642%), below the unchanged 1.05 gate. Both endpoints wait for real Home, nine unique book cards, ready, styles including imports, fonts, decoded Home/header images, and two frames; head additionally requires the source caption. Browser HTTP cache disabled and service workers blocked; six samples, three per revision. Raw request counts 80→83 and body bytes 8,183,267→8,202,346 are recorded, not hidden. Every head sample fetches metadata once and requests no full owner. [HOME_COLD_PERFORMANCE.json](HOME_COLD_PERFORMANCE.json).

## Safari compatibility boundary

The new metadata path has **no JSON import attributes** and uses ordinary fetch/JSON. The cold-run audit independently records **10 existing JSON-with imports in both base and final**: nine keyword-passport config imports and one source-catalog import. Those baseline imports retain the existing Safari<17.2 limitation. This task does not fix that baseline limitation or certify the entire application for Safari<17.2. No physical Safari/iOS run was performed. The claim is specifically that the new metadata feature adds none of that syntax and no full Core startup download.

## Informational import comparisons and Tau caption

Native import/state/saved bytes remain exact. The real DG owner export remains READY with eight units and original Detachment IDs. Source-selected DP 5 compared to explicit Strike Force table 3 shows the informational DP message; Disruption belonging to any selected Detachment suppresses FD notice. The recognized nonmember Reconnaissance control shows FD notice. Existing three-line headers receive no guessed context. CSM actual named-source relation shape checks positive/negative membership and DP 2 against Incursion 2. This remains source comparison, not new legality enforcement; Core exceptions and execution are unchanged.

The extra Tau Imported points fallback caption is removed while existing 100/2000 total/limit remain. [Latest notice browser](notices-small-metadata/RESULTS.json) passes 10 checks at both widths, retaining one already-loaded book presentation request/parse where recorded.

## Closed QA server and previous full-run failure

First full pre-FF at `71e5ab85202a8280ca6ae54d772f559eceab2aae` completed **196 PASS / 1 FAIL / 197 jobs**, exit 1. The sole failure is the existing shell-browser test's initial WarhammerAppV2 timeout. Its closed mock HTTP helper omitted the new startup JSON paths; production manifest and the previously passing manifest-backed browsers were separate. That run remains FAIL and its original log/result are preserved.

The final helper admits exactly three URL/MIME pairs: source-metadata.mjs, import-notices.mjs, and the 1003-byte artifact. It admits no source-tree wildcard. Shell QA asserts all three paths in both helper/server and checks all three MIME values. It denies four exact paths: `mfm/next.json`, `books/core-rules/content/core-rules.candidate-11e.json`, `mfm/current.json`, and `books/core-rules/content/core-rules.digital-11e.json`. Original five resource-negative checks/count and two Node-only denials remain unchanged. Report metadata is 3 startup positives, 4 new negatives, 3 MIME checks, and the original 5 resource negatives. Helper consumers are tests, not application modules, and helper is absent from production manifest/startup graph.

The isolated corrected existing shell-browser check now passes desktop+phone, errors 0, forbidden 0. Startup graph also passes 8 checks, 163 nodes / 418 edges, 87 eager + 76 selected nodes, and 222 required precache URLs. It requires the small artifact and rejects the two full source owners at startup/precache. Army Book/glossary payloads remain lazy. The new user-authorized 198-job full run completed **PASS: 198/198, 79.12 minutes, exit 0**; it must not inherit PASS from the isolated check or the old 196 passing jobs.

## Existing-test changes and retained controls

| Test/location | Before | After | Preserved checks / why |
| --- | --- | --- | --- |
| v2/card-texts-browser-qa.mjs:153-160 | Expected Core/MFM from generated book.dataVersions | Expected canonical Core captureDate and passport-selected MFM version | Same current date/version, three labels and every official version/date check; stale date explicitly absent |
| v2/rule-popups-browser-qa.mjs:showBookCards | Count eager links immediately | Wait reader ownership; physically reveal exact boundaries; wait ready before both original counts | Exact full-book link counts, canonical dialog/source, roster equality and back navigation unchanged |
| tests/startup-precache-qa.mjs:46-64 | Existing startup graph and omission controls | Add three precise module/data omission controls and deny full Core/MFM owners | All existing module/resource/book-code/lazy-data guards remain |
| tests/helpers/startup-graph.mjs:77-80 | Existing literal module/resource parsers | Also parse direct literal shared JSON fetch(new URL(...)) | Existing parsers unchanged; property fetch and lazy book/glossary data not promoted |
| v2/new-recruit-plain-header-browser-qa.mjs:98 | Report annotation: DP warning not implemented, backlog | Report annotation: informational comparison covered by import-notices-browser-qa | No assertion, fixture or native-value changes |
| books/shared/application-v2/browser-test-dependencies.mjs | Closed server list lacked polish-6 startup inputs | Add only source-metadata.mjs, import-notices.mjs and generated/source-metadata.v1.json with exact MIME | No wildcard, raw owner access or production dependency on this test helper |
| v2/shell-browser-qa.mjs:25-42,285 | Original five resource negatives and two Node-only denials | Preserve them; add three exact startup positives, three MIME checks and four exact new denials | All old navigation, geometry, state, roster and route checks remain |
| tests/book-passport-qa.mjs:83-94 | Compare complete plan to immutable 67-step/147-output fixture hash | Validate exactly one named additive step/output and position; compare remaining complete plan to identical fixture hash | No fixture/SHA change; malformed extension or old plan change still fails; eight negative controls |
| tests/book-update-declarations-qa.mjs:18-24,110 | Complete plan equals immutable 67/147 hash | Same strict additive validation for old hash; actual 68/148 plan drives selection | Old hash/counts retained; eleven declared metadata inputs tested; no full-plan fallback guessing |

Exact current eight-file old-expectation diff is [OLD_TEST_CHANGES.latest.diff](OLD_TEST_CHANGES.latest.diff). Separate new producer/loader/plan/harness checks strengthen the new behavior. Existing source-header values remain 2026-11-11/v1.6; all three labels and official date/version checks remain. Original immutable 67/147 fixture SHA stays unchanged.

## Final acceptance

Preserved prior evidence: source/base 40 checks (latest 42), notices 10, existing popups 100 (not 272), source headers 6, 18-case parity, 147/147 generated byte equality, native 199 rosters / 507 states across 9 books with 0 differences, and census N=2724 (EXECUTED 812, RECIPIENTS_ONLY 1478, TEXT_ONLY_INTENDED 263, GAP 0, UNKNOWN 171, partial 126, resolved 2553). All five markup decision/debt/closure/retirement registries remain byte-identical to base in the preserved review. These facts are not a new source/content certification.

Final feature: `9876164de85f1e35aa2cf070a3eb9de662093980`. Final native A/B: **PASS, 199/507/9, 0 differences** at the exact final SHA; [AB_FINAL.json](AB_FINAL.json) and [per-book hashes](REVIEW_NATIVE_AB.latest.csv). New 198-job pre-FF: **PRE_FF_FINAL_RUN.json and pre-ff-final/RESULTS.json**, **PASS: 198/198, 79.12 minutes, exit 0**. Complete 148-file fresh gate: **PASS: 148/148 files, 68/68 producer steps, zero byte differences**. Final scope and handoff: **Final scope: original 147 generated files byte-identical plus the explicitly requested derived 1003-byte artifact; native A/B 199/507, zero differences; census PASS without registry changes. See PUBLICATION.json for the exact preview handoff. The task temporary root is E:/Warhammer/qa-tmp/polish-6; cleanup is performed after evidence publication and its outcome is recorded in the final chat. Feature and evidence pushes only; no source/main/release/Pages update or FF.** All final results are tied to the exact feature SHA.

Exact before/after rows: [TEST_CHANGES_BEFORE_AFTER.csv](TEST_CHANGES_BEFORE_AFTER.csv).

New review tables: [REVIEW_LATEST_CHANGES.csv](REVIEW_LATEST_CHANGES.csv), [REVIEW_HARNESS_CONTROLS.latest.csv](REVIEW_HARNESS_CONTROLS.latest.csv), [REVIEW_OLD_TEST_CHANGES.latest.csv](REVIEW_OLD_TEST_CHANGES.latest.csv), [REVIEW_HOME_COLD_PERFORMANCE.latest.csv](REVIEW_HOME_COLD_PERFORMANCE.latest.csv), and [REVIEW_FINAL_PERFORMANCE.latest.csv](REVIEW_FINAL_PERFORMANCE.latest.csv). Earlier CSVs, first full-run records and failed/superseded timing evidence remain preserved and explicitly separate from final records.

## Startup footprint and final records

The new metadata is 1003 bytes raw / 405 bytes gzip (level 9). The removed startup owners are 232708 bytes Core + 2132 bytes MFM raw. The final runtime publication contains 456 files / 222 mandatory precache URLs: the new source module, notice module and small artifact are the three additions relative to the accepted base. No raw Core/MFM owners are published or precached. METADATA_SIZES.json and pre-ff-final/RUNTIME_MANIFEST.json record exact sizes/hashes.

The existing startup graph helper also recognizes the new direct literal fetch(new URL(..., import.meta.url)); it does not broaden property-fetch/book-data matching or remove existing lazy-data guards. Its full diff is in OLD_AND_NEW_TEST_CHANGES_FINAL.diff together with all other test changes.

Final full-run metadata, every job status/time and the generated gate are preserved in PRE_FF_FINAL_RUN.json, PRE_FF_FINAL_TIMINGS.csv, pre-ff-final/RESULTS.json, GENERATED_FINAL.json and GENERATED_FINAL.log. The first 196/197 run remains a failed historical record, not aggregated into this result. The final feature stayed unchanged throughout the authorized run.

## Review and preview

Feature branch: codex/polish-6-v1 at 9876164de85f1e35aa2cf070a3eb9de662093980. Evidence branch: codex/polish-6-evidence, one documentation-only commit from that feature, not merged. The preview now serves the exact complete-PASS package at http://192.168.1.124:8765/ (PC: http://localhost:8765/). HTTP 200 was verified from the PC using the LAN address; mandatory metadata returns200 and removed full owners return404. Cache revision d3117be5ab05b043;456 published files;222 mandatory URLs. Existing HTTPS/TLS and firewall settings were preserved. See PUBLICATION.json. No source/main/release/Pages ref was changed and no FF was performed.
