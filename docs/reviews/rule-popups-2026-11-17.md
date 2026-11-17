# Rule popups v1 — review report

Status: READY_FOR_REVIEW. Owner-approved final full pre-FF PASS. Independent review and any source FF remain separate owner decisions.

- Base/source: `9b99ade9975346afc3644ade7f69d01ed71cce31`.
- Feature: `codex/rule-popups-v1`, `c477d20aaa16f850b56f18aa878d6b5fb8b4057f`.
- Evidence branch: `codex/rule-popups-evidence`; documentation only, one commit, never merge.
- [Offline before/after gallery](rule-popups-2026-11-17/GALLERY.html): 40 matched views, 80 local screenshots.
- Original local evidence: `E:/Warhammer/qa-evidence/rule-popups-v1-2026-11-17`.
- No source/main/release/Pages update or fast-forward is authorized by this task.

## Results for requirements 1–7

| Item | Result | Boundary |
|---|---|---|
| 1. One clicked rule | A focused popup selects the exact existing canonical field and physical context, displays the human type, title and complete body, and identifies a foreign datasheet owner. Datasheet ability, Wargear ability, Wargear, Core ability, Army rule, Detachment rule, Enhancement and Stratagem are independently covered. | No aggregate Abilities section, boolean metadata, generic Rule tag, empty arrow action or guessed sibling field. Open in Army Book actually enters Full Army Book; Open in Glossary preserves the exact reference route. |
| 2. Inline full text | Full-inline headings are plain text. Redundant full-text Librarian source controls are hidden while exact identity metadata remains available to tests. | Effects remain separate. Popups remain on abbreviated chips/links, composition items, granted Core references and Glossary results, because these locations omit the full definition. |
| 3. Exact glossary links | Whole-word, case-insensitive exact enrolled display labels and explicitly NORMALIZED display aliases link into the already loaded glossary. Ambiguous or unavailable personal-scope targets remain plain text. | No guessed aliases, bracket stripping, new fact, extra fetch or reference-scope expansion. Existing prose text and its exact source datasets survive. |
| 4. Non-weapon equipment | Canonical effect captions and weapon-like text links replace framed lowercase choice-option buttons. The popup is Wargear and contains the bound effect, not permission to equip it. | Uses explicit native canonicalEquipmentRequirement/equipmentRequirement or canonical source references; no name-based entity join. Unknown/ambiguous relationships stay plain text. |
| 5. Dangling Feel No Pain | It was the existing canonical Core grant reference appended after Silent Bodyguard's source text, separate from the computed + Feel No Pain 4+ chip. The same exact reference is now embedded into Feel No Pain 4+ inside that source prose. | The computed defensive chip and both weapon effects remain separate. Across all books the old trailing grant-link container is absent; a labelled inline fallback is retained if a canonical grant has no contiguous caption in its source text. |
| 6. Debug Source | entityId/path disclosure is absent in normal player mode. | Available only with explicit devSourceDisclosure: true; canonical identity attributes stay intact. |
| 7. Weapon chips | Gained weapon chips use the native chip font/size and nowrap. A contribution proven identical across all selected ranged and melee physical occurrences is summarized once as All weapons. | Separate effects, conditions, physical occurrences, numeric values and sources are not merged. Actual CSM Tzagulla and Tyranids Raveners cases cover both widths; desktop + LANCE does not wrap. |

## Where popups remain

| Location | Reason |
|---|---|
| Native/granted Core ability chips; abbreviated rule names in tables and source references | Only the short label is inline; the exact complete definition remains useful. |
| Unit Composition: an explicitly bound selected non-weapon item | The item line has no effect body; the popup shows that item's effect. |
| Gained source prose: embedded Feel No Pain and exact glossary terms | Short in-text reference, not another duplicate full-text title. |
| Full Army Book: exact glossary terms and compact Core/Army references | Full rule headings themselves are plain; cross-reference definitions are separate. |
| Glossary result and rule references | Preserve exact entry/field and ordinary canonical navigation. |

## Exact glossary link counts

Count = rendered prose links in one complete Full Army Book render, not glossary entries or every future roster state. Counts match at 390 and 1440 px. Existing standalone chip links are not counted.

| Book | Prose links |
|---|---:|
| death-guard | 464 |
| adeptus-mechanicus | 467 |
| chaos-space-marines | 905 |
| emperors-children | 479 |
| tyranids | 618 |
| tau-empire | 390 |
| space-marines | 689 |
| dark-angels | 684 |
| blood-angels | 635 |

The local inventory does not enroll a bare CHARACTER term merely because it appears in prose. Likewise a bracketed keyword label does not authorize an invented punctuation-free alias. Such non-matches remain text. Personal mode only links targets its existing reference contract permits.

### Rendering cost

Fresh 390 px contexts; unthrottled local HTTP and CPU; three alternating base/head pairs per lane; service workers blocked for measurement. All samples below were repeated on final c477d20a after the two display fixes. Material-regression guard, declared before measurement: median increase must exceed both 300 ms and 20%. No lane crossed it.

| Screen | Base median ms | Feature median ms | Change ms | Change % |
|---|---:|---:|---:|---:|
| death-guard | 874.7 | 916.1 | 41.4 | 4.74 |
| space-marines | 2567.9 | 2708.7 | 140.8 | 5.48 |
| glossary | 603.1 | 637.8 | 34.7 | 5.75 |
| Home | 300.7 | 249.1 | -51.6 | -17.17 |

These are local render measurements, not a mobile-network speed guarantee. [All samples and policy](rule-popups-2026-11-17/RENDER_TIMING.json). No new network request is introduced by linking.

## Equipment and dangling-control audit, nine books

The complete accepted native A/B fixture corpus has 199 inputs and 507 states. There are 122 selected non-weapon equipment observations and 18 distinct selected UNIT/equipment identities: **18 linked, 0 unresolved, 0 ambiguous** in that finite corpus. [Exact items, locators and counts by book](rule-popups-2026-11-17/SELECTED_EQUIPMENT_INVENTORY.md); [machine-readable inventory](rule-popups-2026-11-17/SELECTED_EQUIPMENT_INVENTORY.json).

The initial narrow lookup missed CSM Dark Commune's explicit native equipment contract. Inspecting the existing canonicalEquipmentRequirement/equipmentRequirement relations resolved it and the separately inspected T'au Tidewall Defence Platform. Both now have source-backed browser cases; no new relation or rule text was authored. The Tidewall case supplements the 199-input corpus. There is no claim that the finite fixture corpus selects every possible item in every book. An item with no unique explicit relation remains plain text and is never described by invented prose. No unresolved selected item remains in the audited corpus.

The dangling-control scan runs in each book's shown abilities and the explicit DG Lord of Contagion gained view at both widths. The Feel No Pain link is not another effect; it is a canonical explanation of the already existing computed grant. The old .ds-gained-rule-links trailing group is absent. All-weapons checks additionally cover actual mixed ranged/melee CSM and Tyranids inputs; all selected physical occurrences must agree before one summary is emitted.

## Test adaptations: exact expectations preserved

Authorized class: move existing exact checks from removed visible metadata/headings to the corresponding new view, and assert the removed presentation is absent. No numerical/gameplay expectation, old historical fixture, source identity, recipient, scope or effect clause is changed.

| Test: current line | Before | After | Why |
|---|---|---|---|
| [v2/card-display-2-browser-qa.mjs:293](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/blob/c477d20aaa16f850b56f18aa878d6b5fb8b4057f/v2/card-display-2-browser-qa.mjs#L293) | Clicked redundant full-text Librarian heading | Assert exact retained target and hidden old heading; open the same canonical Glossary result, then retain the old exact popup-text check. | Heading is no longer a button when its full text is already inline. |
| [v2/card-gained-rules-browser-qa.mjs:203](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/blob/c477d20aaa16f850b56f18aa878d6b5fb8b4057f/v2/card-gained-rules-browser-qa.mjs#L203) | Compared canonical body with an unsplit repeated title prefix; clicked inline source heading | Read the visible focused heading plus complete visible body; open the same exact canonical result and restore the physical instance. All IDs, recipients, scopes, weapon values and detach/reattach checks remain. | Caption and body are separate visible elements; the redundant heading control is hidden and explicitly checked. |
| [v2/glossary-browser-qa.mjs:185](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/blob/c477d20aaa16f850b56f18aa878d6b5fb8b4057f/v2/glossary-browser-qa.mjs#L185) | Open full entry | Open in Glossary; assert old action absent and exactly one new action. All exact source-field, condition, route, reload and focus assertions remain. | Explicit destination label. |
| [v2/glossary-core-navigation-browser-qa.mjs:169](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/blob/c477d20aaa16f850b56f18aa878d6b5fb8b4057f/v2/glossary-core-navigation-browser-qa.mjs#L169) | Open full entry | Open in Glossary; same exact canonical route, field and content assertions; old action absent. | Explicit destination label; existing earlier readiness failure is not changed. |
| [v2/presentation-metadata-browser-qa.mjs:114](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/blob/c477d20aaa16f850b56f18aa878d6b5fb8b4057f/v2/presentation-metadata-browser-qa.mjs#L114) | Open full entry | Open in Glossary; same canonical target/field checks, old action absent. | Explicit destination label; unrelated badge assertion remains unchanged. |
| [v2/sweep-polish-browser-qa.mjs:78](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/blob/c477d20aaa16f850b56f18aa878d6b5fb8b4057f/v2/sweep-polish-browser-qa.mjs#L78) | Visible-text guard inspected the existing page scope | Also inspect an open dialog: no generic Rule label, malformed wargear metadata, internal IDs/paths, unnamed or arrow-only actions. | Additional guard, no old assertion removed. |

[Complete combined diff, including the new preservation helper](rule-popups-2026-11-17/approved-test-changes.patch). Individual complete diffs:

- [v2/card-display-2-browser-qa.mjs](rule-popups-2026-11-17/card-display-2-browser-qa.patch)
- [v2/card-gained-rules-browser-qa.mjs](rule-popups-2026-11-17/card-gained-rules-browser-qa.patch)
- [v2/glossary-browser-qa.mjs](rule-popups-2026-11-17/glossary-browser-qa.patch)
- [v2/glossary-core-navigation-browser-qa.mjs](rule-popups-2026-11-17/glossary-core-navigation-browser-qa.patch)
- [v2/presentation-metadata-browser-qa.mjs](rule-popups-2026-11-17/presentation-metadata-browser-qa.patch)
- [v2/sweep-polish-browser-qa.mjs](rule-popups-2026-11-17/sweep-polish-browser-qa.patch)

The helper composes **visible** focused title + visible full body solely for the original unsplit-caption assertion; it does not pull hidden source text into the expected result. For Librarians, tests still assert the retained exact target and absence of the old visible heading, then follow the same exact canonical target from a compact Glossary result. All other original assertions remain.

### New tests and negative controls

- Focused presenter unit suite: 37 checks. Exact source fields, human types, title/body split, foreign owner, action route and no sibling leakage.
- Exact glossary link suite: 24 checks. Exact/punctuation/whole-word matching, ambiguity, unavailable personal targets, idempotence and copied target-set integrity.
- Exact equipment-reference suite: 24 checks. Existing explicit binding/source field/value, UNIT/selection identity, wrong owner/path/field, missing and ambiguous targets; no operation execution.
- Real browser: **100 recorded checks PASS**, nine books, 390 and 1440 px. [After results](rule-popups-2026-11-17/BROWSER_AFTER.json). Exact canonical ID/field/value/type, preserved physical source and context, inline-title absence, DG source grant, equipment effects, named actions, all-weapons summaries and overflow/chip assertions.
- Same observations on accepted base: **80 checks, 42 FAIL and 38 PASS**, honestly retained. Some newly added after-only navigation assertions do not execute after an earlier expected base mismatch. [Before results](rule-popups-2026-11-17/BROWSER_BEFORE.json).
- Old Rule-label injection is rejected in all 18 normal book/viewport paths. A separate whole-process mutation exits 1 with the exact player-dialog leak error: [mutation result](rule-popups-2026-11-17/OLD_LABEL_MUTATION.json). The clean base is not forced to fail already-correct assertions.
- Existing visible-text sweep also inspects open dialogs with the new guard.

### Pre-existing off-queue diagnostic failures

These are **not PASS**, were reproduced on both accepted base and feature, and were not repaired or weakened to get this task green. They are recorded in docs/TRACKER.md. None is a job in the final pre-FF queue. Later action-label changes in three of them are included in the full diff; their earlier unrelated failures remain.

| Test | Base / feature failure | Boundary |
|---|---|---|
| v2/glossary-browser-qa.mjs | Technical identity query core-anti-infantry expects one display-search result but gets zero (base line 197 / feature 198). | Search behavior and exact assertion unchanged. |
| books/shared/army-book-app-v2/reference-browser-qa.mjs | HTTP failure at removed standalone books/death-guard/v2/app.html. | Entire file unchanged; no retired UI restored. |
| v2/presentation-metadata-browser-qa.mjs | Edition-only badge expectation conflicts with accepted Core/MFM/book-date badges (base86 / feature87). | Badge assertion unchanged. |
| v2/glossary-core-navigation-browser-qa.mjs | Battle-shock #termFull read before href is set: Invalid URL: null (base119 / feature120). | Existing timing assertion unchanged; no timeout increase or Core runtime change. |

Passing focused regression runs before the final queue: card-gained 446 checks; card-display-2; sweep-polish 184 screens; source-equipment; startup-precache; executable-detachment-source (9 books,29 rules,116 negative controls). Full final-queue outcomes below are authoritative for the final SHA.

## Generated and gameplay boundaries

- [147/147 normal generated-plan files are byte-identical to base](rule-popups-2026-11-17/GENERATED_BASE_BYTE_COMPARISON.json), including book publications, Core, glossary and source registry. Each row records bytes and both SHA-256 values.
- [Native exact A/B](rule-popups-2026-11-17/NATIVE_EXACT_COMPARISON.json): **199 inputs / 507 states / all 9 books / 0 differences**, every decoded capture field, no filtering of source/text/metadata. READY177, NEEDS_BINDINGS22, same as base.
- [Generated gameplay exact A/B](rule-popups-2026-11-17/GENERATED_GAMEPLAY_EXACT_COMPARISON.json): **0 differences**, all compared fields.
- No datasheet value, weapon, price, rule/stratagem text, effect, condition, recipient or CP is changed. New projection data is disposable DOM/reference metadata.

| Generated/runtime inventory file | Change | Reason |
|---|---|---|
| 147 generated-plan outputs | None, byte-identical | Presentation-only change. |
| glossary/generated/cache-revision.js | Normal runtime revision stamp | New/changed published UI code; normal cache-revision producer only. |
| v2/app.html | Normal cache version/data-boot revision stamps | Same normal producer. |
| tools/pages-runtime-manifest.json | Three new runtime modules, content checksums | Explicit required startup publication. |

## Startup / precache

Three new runtime modules: books/shared/army-book-app-v2/rule-popup.mjs, rule-term-links.mjs and equipment-reference.mjs. All are enrolled in the runtime package and mandatory startup closure. Normal cache revision: **1c58bc9daaf0c2f5**; **452 package files**, **451 integrity assets**, **218 mandatory precache URLs**, **11,571,279 mandatory raw bytes**. Existing policy for lazy book/glossary payloads is unchanged. The independent parsed startup graph and missing-resource mutation remain mandatory pre-FF jobs; their final results are attached after the queue completes.

## Commit scope

- 2760ebfcd86fa402f5e3730e2408eb599487d879 feat: show focused canonical rule popups
- 8f0e0171d5cde15999524f18236f554447a999f0 test: cover focused rule dialogs and exact glossary links
- 8d43f9db63fdb2fe64a579a3fa2318d7e702d79c fix: resolve selected equipment through exact source contracts
- 520cbad1133bb8e474a138db9b65d462756cd163 test: reject unfocused source popups directly
- c477d20aaa16f850b56f18aa878d6b5fb8b4057f fix: preserve chip labels and suppress self source summaries

## Final pre-FF and preview

The first full run, targeted display fixes and owner-approved final full PASS are recorded below.


## First full pre-FF and subsequent display fixes

The single authorized full pre-FF completed on **520cbad1133bb8e474a138db9b65d462756cd163**, **174 PASS / 3 FAIL**, **113.43 minutes**. HEAD and the clean tree were unchanged throughout that run. [Complete recorded run](rule-popups-2026-11-17/FIRST_PREFF_RUN.json), [all177 job times](rule-popups-2026-11-17/FIRST_PREFF_JOBS.md), [queue result](rule-popups-2026-11-17/FIRST_PREFF_RESULTS.json).

| Failure | Exact failure | Resolution / current limit |
|---|---|---|
| v2/core-reader-browser-qa.mjs:103:148, helper42:25 | page.waitForFunction: Timeout15000ms exceeded, Ctrl+click table-of-contents link into a new Core tab. | No test, timeout or Core navigation edit. Three alternating base/head pairs of the identical test, with external trace/close-time state recording only, are listed below. This is distinct from the pre-existing off-queue glossary-core-navigation href readiness failure. |
| v2/cards-cosmetics-browser-qa.mjs:102 | Actual +\nCONTAGION ENGINE, expected + CONTAGION ENGINE. | CSS inline-flex split adjacent text in innerText. Restored inline-block; native9px font and nowrap retained. Exact old assertion unchanged; full154 checks now PASS. |
| v2/card-gained-rules-browser-qa.mjs:225 | Self-source caption All melee weapons: + WS3+ −1, +1 S — Trygon Prime, expected no self caption. | New summary now omits its own physical source name. Source identity attributes, effects and recipients unchanged. Exact old assertion unchanged; full446 checks now PASS. |

All three full failure logs are attached: [v2/core-reader-browser-qa.mjs](rule-popups-2026-11-17/FIRST_FAIL-core-reader-browser-qa.mjs.log.txt), [v2/cards-cosmetics-browser-qa.mjs](rule-popups-2026-11-17/FIRST_FAIL-cards-cosmetics-browser-qa.mjs.log.txt), [v2/card-gained-rules-browser-qa.mjs](rule-popups-2026-11-17/FIRST_FAIL-card-gained-rules-browser-qa.mjs.log.txt).

The two display fixes are commit **c477d20aaa16f850b56f18aa878d6b5fb8b4057f**. The new browser test additionally asserts that an all-weapons summary does not repeat its own source. No additional old test expectation changed. [Targeted results on final head](rule-popups-2026-11-17/REVISION_2_TARGETED.json): cards-cosmetics154PASS, card-gained446PASS, focused dialogs100PASS. The first npm attempt at targeted setup could not find the default bundled Chromium; it did not start a browser. These recorded runs use the same installed Chrome as pre-FF.

### Core targeted diagnosis

Repository test SHA-256: cd0b92cfdfd6dd3a421781910a1e77f34ed48bd83b791ceadfdede6c42f58a00, identical on base and head. Instrumentation is external: it adds tracing and close-time state/console/pending-request records, and changes no assertion, route, wait or timeout. Local traces stay under E:/Warhammer/qa-evidence/rule-popups-v1-2026-11-17/core-reader-diagnostic-traced/. No full pre-FF was started in this diagnostic.

| Pair | Tree | SHA | Status | Seconds |
|---|---|---|---|---:|
| 1 | base | 9b99ade9975346afc3644ade7f69d01ed71cce31 | PASS | 201.20 |
| 1 | head | c477d20aaa16f850b56f18aa878d6b5fb8b4057f | PASS | 188.74 |
| 2 | base | 9b99ade9975346afc3644ade7f69d01ed71cce31 | PASS | 189.17 |
| 2 | head | c477d20aaa16f850b56f18aa878d6b5fb8b4057f | PASS | 188.50 |
| 3 | base | 9b99ade9975346afc3644ade7f69d01ed71cce31 | PASS | 99.61 |
| 3 | head | c477d20aaa16f850b56f18aa878d6b5fb8b4057f | PASS | 99.57 |

[Diagnostic result](rule-popups-2026-11-17/CORE_DIAGNOSTIC_RESULTS.json). The original timeout was not reproduced in these six runs. This does not prove its cause or turn the failed full run into PASS.

### Verification boundary after the fixes

- First full normal generated gate:67steps/147files PASS on520cbad1; [exact report](rule-popups-2026-11-17/FIRST_GENERATED_GATE_RESULTS.json).
- Final-head generated bytes and native/gameplay A/B were captured again separately and are linked above; no changed gameplay field.
- Startup/precache first full check PASS with the three new modules; [first report](rule-popups-2026-11-17/FIRST_STARTUP_REPORT.json). Cache stamp was then rebuilt normally for the final two display fixes.
- Original173 queue jobs and relative order preserved, four task tests added: [queue comparison](rule-popups-2026-11-17/QUEUE_PLAN_COMPARISON.json).
- The owner subsequently authorized exactly one final full run on c477d20a; its PASS is recorded below.
- Publication and preview switch were held until that final PASS; completion records follow below.

Diagnostic instrumentation: pairs 1-2 used tracing plus close-time state; pair 3 used close-time state only, without trace, to retain the original execution pace. Per-run mode is recorded in CORE_DIAGNOSTIC_RESULTS.json.

Final-head startup/precache and cache verification both PASS: [current startup report](rule-popups-2026-11-17/STARTUP_CURRENT_REPORT.json), [independent graph](rule-popups-2026-11-17/STARTUP_CURRENT_GRAPH.json), [final-head proof run](rule-popups-2026-11-17/REVISION_2_PROOF_RUN.json).




## Owner-approved final full verification

- Run SHA: **c477d20aaa16f850b56f18aa878d6b5fb8b4057f**. Final feature SHA: **c477d20aaa16f850b56f18aa878d6b5fb8b4057f**.
- Exactly one additional full sequential run, explicitly owner-approved: **177/177 PASS**, **108.38 minutes**, started 2026-11-17T17:37:14.189Z, completed 2026-11-17T19:25:36.899Z. No third full run.
- [Run record](rule-popups-2026-11-17/APPROVED_FINAL_PREFLIGHT_RUN.json), [all177 job times](rule-popups-2026-11-17/PREFF_JOBS.md), [full queue result](rule-popups-2026-11-17/PREFF_RESULTS.json).
- [Normal generated gate](rule-popups-2026-11-17/GENERATED_GATE_RESULTS.json):67steps/147files, no differing bytes.
- [Independent startup graph](rule-popups-2026-11-17/STARTUP_GRAPH.json) includes all three new modules; [startup and missing-resource mutation checks](rule-popups-2026-11-17/STARTUP_REPORT.json) PASS. Native/gameplay A/B and final render measurements above refer to the same runtime.
- Core-reader browser, F1, F2, cosmetics, gained rules, focused dialogs, visible-text sweep, PWA and packaging all PASS in this full run; final logs are adjacent to this report. The earlier Core timeout remains an observed historical failure whose precise cause was not proved; it was not hidden by changing its test or timeout.

### Required run-to-final git diff --stat

Command: git diff --stat c477d20aaa16f850b56f18aa878d6b5fb8b4057f c477d20aaa16f850b56f18aa878d6b5fb8b4057f

stdout is empty (0 changed files). Final SHA equals run SHA; F1 was not edited after the run.

[Machine-readable exact command/stdout and allow-list check](rule-popups-2026-11-17/FINAL_FEATURE_DIFF_PROOF.json), [raw stdout](rule-popups-2026-11-17/RUN_TO_FINAL_DIFF_STAT.txt). No file outside the owner-allowed F1 path changed after the tested commit. The separate evidence branch documentation commit is not part of the final feature SHA.


## Publication and live preview

- Feature branch pushed normally, without force: **codex/rule-popups-v1 = c477d20aaa16f850b56f18aa878d6b5fb8b4057f**.
- Protected source branch remains **9b99ade9975346afc3644ade7f69d01ed71cce31**. No source/main/release/Pages update, fast-forward or merge. [Exact ls-remote](rule-popups-2026-11-17/FEATURE_AND_SOURCE_LS_REMOTE.txt).
- Evidence is a separate branch, codex/rule-popups-evidence, one documentation commit on top of this feature; never merge that branch. Its remote SHA is supplied in the delivery message, not embedded recursively in its own commit.
- Preview was switched **only after** the owner-approved full PASS. The rebuilt normal452-file package passed --check and has the same content SHA-256 as the package tested in pre-FF: **6d6a1d9f7320d2831299671102bc6f39f8ac5706ec0af20a903649bf7c9e4254**.
- PC: http://localhost:8765/ . LAN: http://192.168.1.124:8765/ . Existing HTTPS: https://192.168.1.124:8443/ . HTTP **200** on the exact LAN address; server bound to0.0.0.0; PID36688, managed session62659. Existing TLS material and firewall rules were not changed.
- [Preview state](rule-popups-2026-11-17/PREVIEW_STATUS.json), [complete normal runtime package manifest](rule-popups-2026-11-17/PREVIEW_PACKAGE_MANIFEST.json). The running preview package lives outside this task's disposable scratch directory and must be kept.
- Scope note: the four off-queue baseline diagnostic failures above were recorded before the final two display fixes, on520cbad1 and accepted9b99ade9. Their unrelated assertions were preserved; they are not part of the177-job PASS or claimed as newly fixed.

Published log artifacts use .log.txt names to preserve their exact contents without changing the repository's existing *.log ignore rule.
