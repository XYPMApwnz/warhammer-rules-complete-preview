# Browser compatibility and lazy source-catalog

Status: **READY_FOR_REVIEW**. Accepted base: `9876164de85f1e35aa2cf070a3eb9de662093980`; feature branch: `codex/browser-compat-v1`. The feature is committed and published at b0aa1273b907020776dec41ca0466d646e5435e2. The sole authorized complete pre-FF passed 202/202 jobs in 134.48 minutes, exit0; its SHA remained unchanged and its final tree was clean. PRE_FF_RUN.json is authoritative. No source/main/release/Pages change or FF is part of this task.

Feature SHA: **b0aa1273b907020776dec41ca0466d646e5435e2**. Evidence branch/commit: **codex/browser-compat-evidence, one documentation-only commit; exact remote SHA is in the final chat**. Preview handoff: **PASS: http://192.168.1.124:8765/; exact feature b0aa1273b907020776dec41ca0466d646e5435e2; see PUBLICATION.json for HTTP/package proof**, only after the complete authorized pre-FF passes.

## 1. All 12 published JSON import attributes replaced

The accepted Pages manifest contains 12 JSON import-attribute declarations across four published modules. The same audit of live-release tree `1fd0b279051d76f1a262f7c8f117e35551b7de39` finds zero, confirming the release regression. The new player path contains no JSON import attributes/assertions.

| Published owner | Before | Replacement | Values and timing boundary |
| --- | --- | --- | --- |
| books/shared/roster-v2/keywords.mjs | 9 static JSON passport imports | Nine explicit ordinary JSON-loader calls, awaited together before the original passport registration | Same nine book.config.json values and registration order; passports remain mandatory startup resources |
| books/shared/source-refs-v2/source-catalog.mjs | 1 eager full JSON import | Same generic loader, called by loadSourceCatalog only before first Army Book/roster use | Full accepted catalog retained; synchronous catalogValue/catalogBinding readers operate only after readiness |
| books/adeptus-mechanicus/v2/roster-import.mjs | 1 model-name-aliases.json import | Ordinary cached JSON-loader call | Exact accepted aliases, no inferred names |
| books/chaos-space-marines/v2/roster-import.mjs | 1 model-name-aliases.json import | Ordinary cached JSON-loader call | Exact accepted aliases, no inferred names |

Complete12-resource mapping is [runtime-json-imports.csv](runtime-json-imports.csv).

All twelve replacements share `loadRuntimeJSON(URL, {fetch})` from the existing source-catalog module. A resolved-URL map shares the same Promise and decoded object; a healthy resource is fetched/parsed once. Network, HTTP and parse failures evict only their own failed attempt so later reads can retry. An old failure cannot evict a newer successful retry. This is a read/transport change, not a new source or projection of gameplay facts.

Node 24 producers still read the adjacent full JSON synchronously through `globalThis.process?.getBuiltinModule?.('fs')` for file URLs. They do not fetch data or need browser initialization. This preserves existing cold scratch fixtures which copy only the loader, source-refs module and candidate JSON. The initial document map and top-level freezing are unchanged; binding expansion remains memoized and source content checks remain in the existing decoder. A browser read before explicit readiness fails clearly rather than using partial or missing metadata. Failed catalog installation publishes no partial document map.

No Node-only source-catalog tool or existing Node source-catalog test was edited. The unchanged existing catalog QA passes all **12** negative controls: locator changed after first read; unregistered document pointer; reference anchor removed; binding identity replaced; legacy shadow proof after cache; mutable shared locator; immutable value under another identity; changed document hash; changed binding tuple; changed layout; deleted document; and absent reference on cold load. See [EXISTING_CATALOG_QA.log](EXISTING_CATALOG_QA.log).

New loader QA passes: exact Node full-catalog equality, all 522 unique documents / 182 layouts / 10,168 contexts, representative expanded bindings, no Node fetch, file-read retry, browser import-time requests0, concurrent catalog fetch1/parse1, generic JSON fetch1/parse1, network/HTTP/JSON retry, conflicting-document atomic rejection/retry and the concurrent-retry guard. See [CATALOG_LOADER_QA.log](CATALOG_LOADER_QA.log) and [CATALOG_LOADER_FINAL.log](CATALOG_LOADER_FINAL.log). These are focused checks, not a substitute for final native A/B.

## 2. Published-syntax guard, simple extra compatibility fixes and limits

`npm run qa:browser-compat` is included in quick and pre-FF. The guard enumerates the exact Pages runtime manifest, checks **142 JS/MJS files plus three inline HTML scripts**, and rejects JSON `with {type: ...}` or `assert {type: ...}` declarations. Pinned esbuild **0.28.2** checks Safari15 / Chrome100 / Firefox102 syntax. It compares the compiler's normalized ES-next and target outputs and rejects warnings, parse errors or any required lowering; successful transpilation is not accepted as proof that the original published bytes work. The site is not transpiled.

Five negative controls pass: JSON with attributes; JSON assert attributes; multiline/commented attributes; unsupported regex; unsupported newer syntax which a compiler could otherwise lower. See [COMPAT_FOCUSED.log](COMPAT_FOCUSED.log). The initial read-only AST audit is [SYNTAX_API_AUDIT.json](SYNTAX_API_AUDIT.json), with context in [SYNTAX_AUDIT_NOTES.md](SYNTAX_AUDIT_NOTES.md).

| Additional issue | Bounded production change | Equality evidence |
| --- | --- | --- |
| One final-s negative-lookbehind expression, unsupported by Safari15 | Equivalent capture-group expression preserving the preceding character | 1,316 public lexical-candidate cases against the exact original expression |
| Three Array.toSorted uses in reference/source-table presenters | Copy with spread, then stable sort; original arrays remain unchanged | Eight dense/sparse ordering cases and real reference/source-table renders with toSorted unavailable; source IDs, geometry, spans, complete remaining prose and table-echo suppression preserved |
| esbuild conservatively lowers bare General_Category Mark literals | Equivalent one-member character class for the two Mark expressions | All 1,114,112 code points and normalization examples compared; zero differences in the current Node engine |

These simple changes affect lexical equivalence or presentation ordering, not accepted labels, source fields, effects or prices. Existing Node expected values were not changed to make them pass. The original old-lookbehind expression and toSorted oracle remain only in the new Node QA file, not in published code. See [EQUIVALENCE_FOCUSED.json](EQUIVALENCE_FOCUSED.json), [PROPERTY_CLASS_EQUIVALENCE.json](PROPERTY_CLASS_EQUIVALENCE.json), [ESBUILD_PROPERTY_ESCAPE_NOTES.md](ESBUILD_PROPERTY_ESCAPE_NOTES.md) and the new tests/browser-compat-equivalence-qa.mjs.

A compiler target is not an API or physical-browser certification. The initial audit found existing Object.hasOwn, structuredClone and array at calls; native Safari15.4 is the documented API floor, rather than claiming Safari15.0. Existing CSS :has selectors are progressively enhanced in newer engines and are not supported by Chrome100 / Firefox102; no claim of identical old-engine layout is made. The CSS selectors are inventoried in [CSS_HAS_NOTES.json](CSS_HAS_NOTES.json). The current Node Unicode equivalence check does not claim identical Unicode database versions in every older engine.

## 3. Why the full source catalog remains, loaded lazily

The source catalog is not merely developer disclosure text. Source-refs decoding supplies document identity, ordered source-slot mappings, layouts and contexts used by native import validation, canonical source ownership, physical equipment/model effect checks, conditional rules, grouped gained/executable text, Effective Datasheets and Personal Guide. Removing it from execution would remove integrity/ownership checks or change projected state. Concrete paths/functions are listed in [CATALOG_INVENTORY.md](CATALOG_INVENTORY.md).

A conservative content-ID closure over all **21 published book generated JSON inputs**, expanded through every referenced binding tuple, retains **98.23%** of raw bytes. It is an upper bound, not a claim that one session visits every record. A small global runtime projection is not justified: it saves only 115,806 raw bytes / 15,222 gzip bytes while introducing another registry representation. The full catalog is kept byte-identical in publication; there is no new generated projection.

| Catalog section/size | Complete accepted registry | Published-input closure |
| --- | ---: | ---: |
| Document rows / unique IDs | 562 / 522 | 517 / 477 |
| Layouts | 182 | 179 |
| Contexts | 10,168 | 10,083 |
| Bindings | 19,286 | 19,027 |
| Raw bytes | 6,530,013 | 6,414,207 |
| Gzip bytes, Node default level | 719,107 | 703,885 |

See [CATALOG_CLOSURE_INVENTORY.json](CATALOG_CLOSURE_INVENTORY.json) for per-input counts and method. The synchronous catalog APIs remain intact; the asynchronous application book boundary waits once before creating native roster services or mounting source-backed cards. Home, Core and global glossary do not need the catalog, so merely importing the loader no longer loads/decodes 6.5MB. Successful requests are cached in memory, and the ordinary lazy-resource worker path caches the catalog for later offline use.

### Startup, precache and update preservation

The focused startup guard passes **162 graph nodes / 221 mandatory URLs**. Nine keyword passports remain explicit and mandatory. The full source catalog appears exactly once as a published lazy resource, is absent from eager/selected-factory startup nodes and is absent from mandatory precache. The existing removed-resource, selected-book-code and three source-metadata/notice omission controls remain.

Moving this JSON out of precache exposes an existing migration boundary: its path lies outside the exact /v2/ segment regex. Without an explicit exception, an unchanged cached catalog would be skipped and then lost when old caches are deleted. The worker change adds only the exact path `books/shared/source-refs-v2/source-catalog.json` alongside the existing exact Core glossary exception. Current publication membership, SHA verification before copy, canonical destination, SHA read-back, migration ownership and old-cache-retention guards are unchanged. It never fetches missing data during migration. Full catalog bytes still participate in the runtime integrity ledger and revision even though installation no longer preloads them.

New cache QA passes seven cases: exact unchanged query URL migration and offline read; lookalikes/unrelated shared JSON excluded; changed/unlisted body denied; quota failure retention/retry; corrupt/missing destination retention; no-fetch/idempotence; and removal of the exact new exception makes the positive scenario fail. No old cache-test expectation was changed. See [CATALOG_CACHE_QA.log](CATALOG_CACHE_QA.log) and [CATALOG_OFFLINE_MIGRATION_REVIEW.md](CATALOG_OFFLINE_MIGRATION_REVIEW.md).

### Package sizes and cold-screen measurements

[PERFORMANCE.json](PERFORMANCE.json) is PASS for all **18 original measured samples**: Home, saved DG roster and saved SM roster, three samples per revision/lane. Both exact packages and publication manifest hashes are recorded. Each sample uses a new Chromium process/profile, disabled browser HTTP cache, blocked service workers, 390×844 viewport, unthrottled CPU and no-store loopback HTTP. Timer starts immediately before page.goto; browser launch/save preparation are excluded. Responses are uncompressed; gzip sizes below are separately computed at level9. OS file cache was not flushed. No performance rejection threshold was imposed or invented.

| Cold-screen lane | Base9876164d median ms | Feature median ms | Delta ms | Delta |
| --- | ---: | ---: | ---: | ---: |
| home | 502.111 | 505.149 | +3.039 | +0.61% |
| roster-dg | 860.012 | 896.393 | +36.381 | +4.23% |
| roster-sm | 1379.450 | 1413.846 | +34.395 | +2.49% |

The endpoint waits for real application/roster readiness, all expected native unit articles, styles including imports, fonts and two frames. Home additionally waits for nine unique book cards, decoded images and Sources caption. These are installed Chromium measurements with a mobile viewport, not real old Safari/Chrome100/Firefox102 timings.

| Bytes/inventory | Base9876164d | Feature |
| --- | ---: | ---: |
| Runtime inventory files | 456 | 456 |
| Physical package files, including manifest | 457 | 457 |
| Package raw bytes | 282979450 | 282982284 |
| Package gzip bytes | 60920600 | 60921554 |
| Mandatory URLs | 222 | 221 |
| Mandatory URL-body raw bytes | 11666371 | 5139186 |
| Mandatory URL-body gzip bytes | 2847258 | 2153544 |
| Unique mandatory bodies | 220 | 219 |
| Unique mandatory raw bytes | 11640954 | 5113769 |
| Unique mandatory gzip bytes | 2840173 | 2146459 |

The mandatory URL inventory is the published self.WH40K_PRECACHE consumed by the worker. URL-body totals count aliases as the worker does; unique-body totals separately remove duplicate bodies. The full catalog remains in the package, so total package size is essentially unchanged; the startup precache reduction comes from making this resource lazy. The catalog table above uses the earlier inventory's default gzip level, while this packaging table consistently uses level9.

Home requests the full catalog **1→0** times; Home request count **82→81**, raw response bodies **8,202,346→1,674,951 bytes**. Both saved roster lanes request it once per fresh application context on both revisions. The change shifts required catalog work to the first book/roster rather than downloading it for every Home/install. The first roster medians increase by34–36ms here; that cost is reported rather than presented as a speedup. The corrected untimed DG→SM→empty-Tau probe retains exactly one catalog GET throughout, with no new application errors. Real DG owner-v37.25 (eight units) and SMv37.3 (three units) save strings/snapshots remain byte-identical at each timed endpoint.

#### Preserved probe/statistics corrections

All18 measured rows completed their noErrors check before an optional untimed probe incorrectly called snapshot() on an empty Tau roster. The unchanged API correctly throws TypeError No roster. [EMPTY_ROSTER_PROBE_CONTROL.json](EMPTY_ROSTER_PROBE_CONTROL.json) reproduces the same error on the accepted baseline: normal empty-screen navigation has0pageerrors; explicitly caught snapshot has0; the deliberately invalid waitForFunction predicate emits1; the corrected predicate adds0. The two native runtime modules are byte-identical between compared packages. This identifies an observer error, not a production navigation defect.

The initial probe failure and stack remain in PERFORMANCE_INITIAL_PROBE_FAILURE.json/log and PERFORMANCE.json.initialProbeFailure. The first correction also inherited the original error array; that log remains separate. A fresh corrected probe passes. **No original performance sample was rerun or selected**; all18 measured rows retain their recorded hash. Separately, the first statistics attempt read the legacy six-entry APP_SHELL fallback; the final table instead reads the actual222/221 published mandatory inventories. Existing per-file gzip results were reused, without recompression or browser remeasurement. See [PERFORMANCE_NOTES.md](PERFORMANCE_NOTES.md) for full methods and provenance.

## 4. Documented browser minimum and certification scope

README documents **Safari15.4 / Chrome100 / Firefox102**, or newer. The syntax guard is deliberately stricter at Safari15 grammar; the API floor is Safari15.4 because native structuredClone / Object.hasOwn / at / dialog already belong to the application. Offline/install mode still needs HTTPS or localhost and available storage. JSON import attributes are no longer required. CSS :has decoration differences and physical-device review are explicitly separate.

Primary references used by the audit/documentation:

- [Apple Safari15.4 release notes](https://developer.apple.com/documentation/safari-release-notes/safari-15_4-release-notes) for native API floor.
- [WebKit Safari16.4 feature notes](https://webkit.org/blog/13966/webkit-features-in-safari-16-4/) for prior regex-lookbehind support.
- [Mozilla Firefox115 developer notes](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/115) and [official MDN Array compatibility data](https://raw.githubusercontent.com/mdn/browser-compat-data/main/javascript/builtins/Array.json) for copying-array methods.
- [esbuild target contract](https://esbuild.github.io/api/#target) for syntax lowering versus API polyfills.
- [esbuild0.28.2 compatibility table](https://raw.githubusercontent.com/evanw/esbuild/v0.28.2/internal/compat/js_table.go) and [content-type notes](https://esbuild.github.io/content-types/) for the Unicode-property lowering diagnostic.

No physical Safari15.4/Chrome100/Firefox102 engine run is claimed by these static checks. Final Chrome Playwright offline/update/browser evidence below remains a different certification layer.

## Offline and update evidence

Focused cold/offline QA passes at **1440 and390px**: fresh installed Home; online native SM import/reload/reimport; card/PersonalGuide/Core/glossary views; then fresh offline launch and saved roster/card/guide/Core/glossary. The native SM total remains490 with the original explicit numbers; all checked localStorage remains equal and pageerrors are empty. See [cold-offline-focused/wh-v2-cold-GSjI6W/REPORT.json](cold-offline-focused/wh-v2-cold-GSjI6W/REPORT.json) and COLD_OFFLINE_FOCUSED.log. This does not promise offline opening of unvisited large books or immunity to storage eviction.

The current-feature A→synthetic-next publication update also passes: explicit update on an already working screen, sibling unfinished draft preserved, same native roster/storage/draft after confirmation, unchanged data reopen offline, changed Tyranids data refused offline, and a failed mandatory installation retains the working old application/state. See [update-focused/REPORT.json](update-focused/REPORT.json). The worker's exact catalog eligibility addition is also proven separately by seven unit cases and mutation removal of the new exception→FAIL.

### Real release1fd0b279 → this exact feature

Separate real-worker profiles first installed the exact old package, imported/saved the existing DG two-unit and SM three-unit fixtures through the public UI, switched to the actual feature package on the same origin, and used ordinary reload. There were no manual update clicks, activation API or storage/cache clearing.

| Width | Automatic update seconds | DG/SM saved bytes | Both reopen | Offline after update |
| --- | ---: | --- | --- | --- |
| 390 | 5.035 | identical | yes | PASS |
| 1440 | 5.506 | identical | yes | PASS |

Both profiles report no pageerrors, new revision d08e23b961b6f507 and usable saved rosters without a reimport message. Existing storage has the two fixture save keys, not a separately customized settings corpus; do not generalize the result to every historic state. Request-failure logs retain48 deliberate offline network-first failures and two navigation-aborted favicon requests per width, rather than claiming no raw request failures. The offline fallbacks and final functional assertions pass. See [update-path/RESULTS.json](update-path/RESULTS.json), OLD_RELEASE_UPDATE.log and the recorded package/body hashes.

## Existing tests/framework changes

| Existing file/location | Before | After | Exact controls retained / reason |
| --- | --- | --- | --- |
| tests/startup-precache-qa.mjs:66 | Full source catalog required as a genuine static JSON startup dependency | Require exactly one published lazy catalog URL, no eager/factory-startup node, no mandatory precache; add two negative controls that incorrectly promote it to startup/precache | All old keyword bridge, nine passports, selected-book code, metadata/notice omissions and lazy book/glossary guards remain. Only the catalog's transport timing contract changes. |
| tests/helpers/startup-graph.mjs | Recognizes existing static module/resource and direct ordinary metadata fetch shapes | Also recognizes nine explicit loadRuntimeJSON(new URL(...)) passport URLs | Same exact startup coverage; alias-book JSON stays lazy, no global source-tree wildcard. |

No old Node source-catalog test/tool was edited, and no old gameplay number/text expectation has been changed. New tests are additive: syntax guard, equivalence, JSON loader and exact catalog cache migration. Full committed test/framework diffs are in [TEST_CHANGES.diff](TEST_CHANGES.diff); exact before/after rows are in [tests-before-after.csv](tests-before-after.csv).

The focused existing shell browser already passes at desktop/phone with no console errors, 209 requests, forbidden0; original five resource-negative controls, three startup positives, four startup negatives and three MIME checks remain. This is not a substitute for the complete final pre-FF. See [SHELL_FOCUSED.log](SHELL_FOCUSED.log) and [STARTUP_FOCUSED.log](STARTUP_FOCUSED.log).

## Verification and review handoff

| Required evidence | Status / final record |
| --- | --- |
| Existing generated outputs | **Direct equality PASS:148/148 old generated files** at the exact feature (SCOPE_EQUALITY.json); complete clean-clone generated rebuild is also **PASS:148/148 outputs,68/68 producer steps,zero byte differences (GENERATED_FINAL.json)** in the sole completed pre-FF. No new generated files/projections were needed because the permitted ordinary-fetch option was selected |
| Native A/B | **PASS:199 rosters /507 states /9books, zero full native differences on exact feature; AB_FINAL.json** — required199 rosters /507 states /9books; zero differences |
| Markup census | **PASS:N2724; EXECUTED812 /RECIPIENTS_ONLY1478 /TEXT_ONLY_INTENDED263 /GAP0 /UNKNOWN171; partial126; resolved2553; registry unchanged; CENSUS.json** — registry must remain byte-identical |
| Fresh offline Home and previously opened native roster | **PASS:both widths, cold-offline-focused report** |
| Old release1fd0b279 → final same-origin update, saved DG/SM reopen/offline | **PASS:390px5.035s /1440px5.506s; saved DG/SM bytes identical, reopen and offline PASS; update-path/RESULTS.json** |
| Current feature → synthetic next publication, lazy-catalog migration and offline roster | **PASS:current-feature-to-synthetic-next update-focused report plus exact-catalog migration unit controls** |
| Complete authorized pre-FF | **PASS:202/202 jobs, 134.48 minutes, exit0**, exact SHA b0aa1273b907020776dec41ca0466d646e5435e2 (PRE_FF_RUN.json). |
| Final feature SHA / unchanged tree after run | **b0aa1273b907020776dec41ca0466d646e5435e2; run SHA and headAfter identical; treeAfter empty** |
| Feature/evidence remote SHAs | **Feature b0aa1273b907020776dec41ca0466d646e5435e2; evidence branch codex/browser-compat-evidence; final git ls-remote output is in the final chat** |
| Preview revision and HTTP200 | **PASS: http://192.168.1.124:8765/; exact feature b0aa1273b907020776dec41ca0466d646e5435e2; see PUBLICATION.json for HTTP/package proof** |
| Task temporary-root cleanup | **Cleanup follows evidence publication; its outcome is recorded in the final chat, with the retained path if policy blocks deletion**, E:/Warhammer/qa-tmp/browser-compat; record policy rejection if blocked, no bypass |

The running reviewed preview remains outside this task's temporary root. No FF, merge of evidence, source/main/release/Pages update, source capture, accepted registry rewrite or gameplay-data change is authorized. Owner email remains private.

## Verification snapshot boundaries

The feature was pushed before the full run so independent review could proceed. [QUEUE_PLAN.json](QUEUE_PLAN.json) confirms every original198 job remains in the same order, plus four additive compatibility jobs, for202 total. The sole complete run passed on the exact feature; earlier focused results were not aggregated across revisions to obtain that PASS. Exact remote evidence SHA, verified preview handoff and post-publication cleanup are reported in the final chat. No FF is performed by this evidence preparation.

No old expected gameplay number or text, accepted RAW/enrollment byte, catalog entry, source identity, MFM price, rule/stratagem text, effect, CP or markup decision/debt record changed. A/B preserves the complete serialized native import/snapshot/projection/effective/related/points observations, not a masked subset. The runtime changes are transport readiness, equivalent older-syntax/API forms and one exact SHA-verified lazy-data migration eligibility case.

## Final complete-run artifacts

[PRE_FF_RUN.json](PRE_FF_RUN.json), [pre-ff/RESULTS.json](pre-ff/RESULTS.json) and [PRE_FF_TIMINGS.csv](PRE_FF_TIMINGS.csv) preserve the complete202-job result and every duration. [GENERATED_FINAL.json](GENERATED_FINAL.json) and [GENERATED_FINAL.log](GENERATED_FINAL.log) preserve the clean-clone148-output/68-step byte proof. Full-run syntax, equivalence, loader and migration results are in FULL_SYNTAX.json, FULL_EQUIVALENCE.json, FULL_CATALOG_LOADER.json and FULL_CATALOG_CACHE.json. [TEST_CHANGES.diff](TEST_CHANGES.diff) and [tests-before-after.csv](tests-before-after.csv) preserve the old-test/framework changes.

[Open the local review gallery](GALLERY.html); keep it with its screenshot files. The gallery uses existing measured/update screenshots and performs no network access.
