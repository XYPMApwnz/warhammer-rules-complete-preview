# Pre-release automatic site sweep v2 — 19 November 2026

[Open the offline owner gallery](GALLERY.html). Keep `GALLERY.html` with its `images/` directory. Gallery captions are Russian as requested; this report and observer sources are English.

## Result and review priorities

The accepted source and inspected package are **4060074ae0c7888571367f99f7cb9cc375c167ba**. This is a read-only observation report, **not a release approval**. No site code, book data, repository tests, source/main/release/Pages references or generated files were changed. No generated gate, build or pre-ff was run for this audit.

**Four named abilities have a confirmed popup defect**: the click opens a generic instruction, without the clicked name/type/full rule. Weapon profile windows also lack an explicit human type caption; this is a lower-priority presentation gap. No displayed numeric discrepancy was found in the comparisons described below. Two DA actions timed out in the long UI cohort; all twelve focused replays passed, so their cause remains unresolved. Loading observations over five seconds are retained separately.

The update from release `1fd0b279051d76f1a262f7c8f117e35551b7de39` automatically completed without a manual button in **4.456 s at 390 px / 4.659 s at 1440 px**. Tested DG and SM saves were byte-identical before/after and reopened; both widths subsequently launched offline.

## Environment and method

- Windows, installed Google Chrome driven by Playwright; 390 × 900 and 1440 × 900. Mobile width uses touch/mobile emulation. This is not a physical iOS/Safari certification.
- Fresh browser contexts/profiles at each independent phase/width, service workers allowed. No network throttling. Browser phases ran sequentially; static evidence analysis did not run another browser/test/build.
- Runtime: `http://localhost:8765/`, the previously advertised LAN address is `http://192.168.1.124:8765/`; source header checked against full SHA. The previously stopped preview was restored from its existing reviewed package, without rebuilding or changing TLS/firewall configuration.
- Live package: 453 files; cache revision `10f19d471e77a76e`; content SHA256 `6f70b55e6b390f5e218729b9acfb0ba2ca694f7ec3436b9bb62236b20243a6f7`. Package manifest/bytes were verified by the update observer, against the same live package used by the sweep.
- Current points source is `mfm/current.json`, v1.6. Exact current faction source IDs and source locators constrain independent MFM joins, including CSM's legacy producer shape.
- Readiness timings exclude the later DOM scan and screenshot work. Raw native API replay timings in the physical supplement are labelled separately from ordinary Import-button navigation.
- Selected English observer sources are included under [recipes](recipes/); the complete original recipes remain local, with [source hashes](tables/RECIPE_SOURCE_HASHES.json). Copies with Russian screenshot captions are excluded from the English source appendix. Their absolute evidence/worktree paths record this machine's execution context; they are not installed tests or an independently portable test runner. Raw journals, native payloads, exports, traces and browser profiles stay in the local evidence directory. [Journal hashes](tables/LOCAL_JOURNAL_HASHES.json) identify the original observations without publishing those payloads.

## Coverage by book

| Book | Datasheets | Detachments | Library screens | Distinct input texts | UI import/card/guide screens | Physical supplement screens | Attach + detach cycles | Observation timeouts |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| space-marines | 85 | 22 | 556 | 128 | 1946 | 3980 | 158 | 0 |
| blood-angels | 81 | 19 | 446 | 89 | 1066 | 2844 | 80 | 0 |
| dark-angels | 83 | 19 | 454 | 77 | 1327 | 2992 | 93 | 2 |
| adeptus-mechanicus | 34 | 10 | 288 | 182 | 4006 | 3774 | 220 | 0 |
| chaos-space-marines | 54 | 17 | 492 | 148 | 3518 | 4008 | 248 | 0 |
| death-guard | 36 | 9 | 276 | 162 | 4124 | 4278 | 298 | 0 |
| tau-empire | 43 | 7 | 232 | 95 | 1498 | 1926 | 64 | 0 |
| tyranids | 52 | 10 | 326 | 69 | 1540 | 2194 | 98 | 0 |
| emperors-children | 23 | 10 | 268 | 40 | 752 | 1138 | 30 | 0 |

Library includes every one of **491 datasheets / 123 detachments**. Detachment rules, enhancements and stratagems were also opened on their individual routes, as were army rules. All chapters of Core and searches for Blast, Deep Strike, Leader, Battle-shock, Stealth, Lone Operative, Feel No Pain, Devastating Wounds, Lethal Hits, Sustained Hits, Precision, Scouts, Infiltrators, Fights First, Hazardous, Torrent, Melta, Twin-linked, Ignores Cover and Indirect Fire were visited.

There were **3,434 library observations**, **19,777 unique UI import/card/guide observations**, and **27,268 supplementary physical/raw-record observations**. These are observations of views/states, not 50,479 distinct logical pages. Repeated widths, source inputs and expanded cards intentionally overlap.

### Fixture inventory and import controls

**990 distinct source-backed input texts × two widths = 1,980 main UI runs**. All 12 committed TXT exports are represented, including the owner's DG v37.15 and v37.25. The metadata inventory covers literal fixture arrays, bounded existing fixture factories and existing source-backed Character pair derivations. It records 188 Characters: 150 have a native legal Leader/Support pair, 38 have no such native relationship; zero unresolved static pairing cases. Each available Character was attached to its first native-eligible bodyguard and detached. Lack of a legal bodyguard is recorded, not replaced by an invented relationship.

Finite complete saved/constructible scenarios are in scope; arbitrary mutation/fuzz combinations are not enumerable. The inventory explicitly excludes 28 fake registry controls, 399 text fragments and 124 uninstantiated dynamic templates from the claimed complete roster corpus. See [fixture inventory](tables/FIXTURE_INVENTORY.md). Inputs requiring explicit fixture binding context are distinguished from what the same raw paste can establish. `NEEDS_BINDINGS` and `INVALID` negative controls are not counted as product failures.

| Book | READY | NEEDS_BINDINGS | INVALID | Status not captured |
|---|---:|---:|---:|---:|
| space-marines | 234 | 22 | 0 | 0 |
| blood-angels | 146 | 28 | 4 | 0 |
| dark-angels | 149 | 4 | 0 | 1 |
| adeptus-mechanicus | 332 | 24 | 8 | 0 |
| chaos-space-marines | 246 | 44 | 6 | 0 |
| death-guard | 274 | 38 | 12 | 0 |
| tau-empire | 180 | 8 | 2 | 0 |
| tyranids | 110 | 22 | 6 | 0 |
| emperors-children | 72 | 6 | 2 | 0 |

One DA run reached native READY but its UI status was not captured; one failed before the final import status. These two observation gaps are preserved, not rewritten to PASS. The physical API supplement imported all 990 exact texts independently (1,744 READY / 236 intentionally unresolved or refused). Focused tier checks add **one additional existing CSM constructor input**, bringing the distinct tested text union to **991**; the DG tier constructor was already in the 990. Four focused tier runs include both widths and the repeated DG case.

The UI extension recorded 1,742 Warlord interactions/current-choice confirmations, 3,299 gained-source tooltip interactions, 1,742 composition ordinal checks, 871 mobile Units drawer open/Escape interactions, and 20 source-choice interactions. Imported enhancements and every available roster unit card were inspected. The physical supplement exercised 1,290 additional attach/detach contexts and ordinary/expanded component views. These overlap the UI cohort and are not additional unique Characters.

## A–D observations

| Area | Observation | Result / boundary |
|---|---|---|
| A — gained rules | Source tooltips, all-weapon summaries, own-source captions, final section order and group order, one roster price | No confirmed violation on ordinary player routes. 2,610 apparent missing-tooltip flags were reconciled to actual opened matching source tooltips. Own-source noninteractive spans intentionally retain their accepted noninteractive presentation; this audit does not claim they gained a new tooltip. |
| B — windows and glossary links | 3,454 authored routes; 10,420 unique target/field/href combinations, independently per book and width | Final destination accounting: **10,150 dialogs + 270 full-page navigations**. Every originally unresolved context was rechecked from its actual parent window: 530/530 resolved, zero remaining destination gaps. Four named abilities below fail the full-rule-window expectation. |
| B — text boundaries and visible technical labels | Same-inline-flow term boundaries, canonical target existence, named actions; actual open-window player guard | Zero in-word links in the corrected inline-flow check, zero forbidden-label/path/unnamed-action guard leaks in normal clicked windows. The 8 placeholder dialogs are reported separately; an absence of technical markers is not proof of complete content. |
| C — guide and navigation | Bodyguard/leader grouping, no prices, duplicate composition ordinals, Warlord crown, roster-detachment stratagems, mobile Units Escape | No confirmed mismatch in the inspected native-backed states or interaction controls. Lazy stratagem content was opened before inspection. |
| D — import | Before-input layout, successful/clarification/refusal text, human choices | No confirmed internal-copy leak. Eighteen case-insensitive `Unknown` matches came from deliberately unresolved fixture names, not uppercase service enums. |

Target checks are deduplicated by exact target+field/href per book/width. They are **not a claim that every identical term occurrence on every origin was clicked separately**. Raw direct record/API views are discussed separately below.

## Confirmed display findings

| ID | Book / unit | Clicked ability | Observed / expected | Evidence |
|---|---|---|---|---|
| B1 | Death Guard / Mortarion | Lord of the Death Guard | Generic instruction / full named rule, name and human type | [Both widths](GALLERY.html#finding-B1) |
| B2 | Adeptus Mechanicus / Belisarius Cawl | Canticles of the Omnissiah | Same defect | [Both widths](GALLERY.html#finding-B2) |
| B3 | Adeptus Mechanicus / Thulia Ghuld | Icon of War | Same defect | [Both widths](GALLERY.html#finding-B3) |
| B4 | Emperor's Children / Fulgrim | Daemon Primarch of Slaanesh | Same defect | [Both widths](GALLERY.html#finding-B4) |

Exact observed instruction: **“Choose a named ability from the Glossary to read its complete rule.”** Four physical named rules, eight width observations. Their full structured rules remain available on the parent datasheets. The named click carries no exact field path and falls into the broad section fallback. This audit leaves it unchanged. [Bounded parent/context replay evidence](tables/POPUP_RECHECK.json).

**B5, low priority:** 4,470 observed weapon-profile windows have a title, correct profile table and keywords, but no separate human record-type caption. The representative Putrid appendages window is linked in the gallery. They are not 4,470 empty/incorrect weapon profiles. Eight apparent DATASHEET type omissions were false: the eyebrow already identifies the datasheet.

**P3, presentation review:** 76 long repeated keyword-caption observations belong to different physical profiles: CSM Nemesis Claw (50), AM Gun Servitor (10), Combat Servitor (10), Skitarii Ranger (6). The facts and scopes differ, so merging rules would be unjustified. A compact presentation may be worth a later review.

**P4, direct raw-record route advisory:** the supplementary direct-canonical/API record views exposed 1,250 service-field lines: 934 `UNVERIFIED`, 184 `NOT_IMPLEMENTED` (SM/BA/DA section execution fields), and 132 AM `RULE_REFERENCE` internal IDs. These were not ordinary import/roster/guide screens or actual clicked popup/full-page destinations. Thirteen unique overlapping targets (26 width occurrences) were also tested as focused popup destinations; their actual player windows were clean. None of the marker-owner IDs occurred in the actual full-page-navigation records. Keep this distinction: real metadata exposure on direct/raw paths, **not** 1,250 leaked player popup messages and not a dismissed false positive. Source fields/URLs are retained in [supplement classification](tables/SHORT_CLASSIFICATION.md).

## Numeric display comparison

| Phase | Compared values / assertions | Mismatches |
|---|---:|---:|
| Every library datasheet against accepted publication facts/current MFM (same method as first sweep) | 42,888 | 0 |
| UI roster cards against native effective profiles/weapons, physical quantities/scopes and current source-joined MFM | 196,979 | 0 |
| Ordinary/expanded/attached physical supplement | 647,092 | 0 |
| Explicit CSM + DG copy-tier cases, both widths | 818 | 0 |
| AM exact invulnerable reference / native final-value supplement | 19,332 | 0 |

Assertions overlap and include source identity/scope checks; their sum is not a count of unique game facts. M, T, SV, W, LD, OC and INV, weapon A/BS/WS/S/AP/D, keywords and quantities are compared where present. Native effective values preserve real effect application; this observer does not implement a second rules engine.

**AM INV gap closed:** native AM profiles omit a flat INSV when they reference an explicit invulnerable-save entity. A separate frozen observer followed the exact `invulnerableSaveId`, owner, `profileIds` and published `/value` fact. If INSV was changed, it used the native final value and its exact executed effect/source trace, never ability-name inference or recomputed effect math. All **510 deduplicated contexts / 145 existing inputs** passed, covering all **3,414 original gap observations (814 main + 2,600 supplement)**; zero unresolved aliases, gaps or mismatches. There were 80 dynamic candidate contexts, not 80 claimed effect activations. [Counts](tables/AM_INV_COVERAGE.json), [method](tables/AM_INV_METHOD.md).

**Scoped CSM joins:** the original main observer could not uniquely join 14 legacy CSM price observations across same-named faction records. A separate observer constrained joins by the exact current pointer faction sourceId/bookId, preserving the original observer and journals. The complete physical supplement had zero CSM join gaps. No price/source was guessed by name alone.

**164 unsupported model-count controls remain explicit non-comparisons:** current MFM has no matching tier for those derived fixture counts, and displayed price is null. They comprise DG Blightlord Terminators (108 observations, 1 model vs 3/5/10 tiers), DG Plague Marines (4, 1 vs 5/7/10), AM Serberys Sulphurhounds (4, 1 vs 3/6), AM Sicarian Infiltrators (4, 1 vs 5/10), SM Victrix (40, 36 observations at 1 model and 4 at 4 models vs 3/6), SM Wardens (4, 1 vs 6). They are negative/incomplete source-backed inputs, not invented expected prices. Full accepted library tiers are separately covered; unsupported null values are not falsely counted as numeric PASS.

**Copy tiers:** the existing committed constructors in `v2/card-gained-rules-browser-qa.mjs:60–77` were used for three same-datasheet copies in CSM and DG. The third-copy tier and army total were source-joined, with 4/4 focused cases certified and zero mismatches. For the DG example, 585 total versus 3 × the first tier's 185 = 555 is the intended third-copy price difference, not a defect.

## Readiness and intermittent observations

[All 21 readiness observations over five seconds](tables/readiness-over-five-seconds.csv) retain exact source journal/line, width, route and milliseconds.

- Main player route sweep: two SM library openings (**5.046 / 5.198 s**) and five DA roster-unit cards (**7.34–11.03 s**).
- Supplement: two SM library mounts (~5.90 s), two BA mounts (~6.80 / 8.53 s), and ten DA raw native API import+refresh observations (**5.26–17.41 s**). The latter are not UI Import-button latency measurements.
- No throttling or concurrent browser workload; no paired baseline/profiler in this audit. No claim that these are proven regressions or caused by load. No performance fix was attempted.

The main cohort retained two DA 12-second observation timeouts:

| Width | Exact input ID | Observed action | Focused follow-up |
|---|---|---|---|
| 390 | sweep2-dark-angels-96da173a0c257097 | Native READY, status element not captured within 12 s | 3 fresh imports + 3 replacements after guide, all PASS |
| 1440 | sweep2-dark-angels-b8e5144a3ece854c | Replace roster click timed out while performing click | Same six modes/runs, all PASS |

Twelve follow-ups completed in **0.937–1.766 s**. Original runs had no console/network error. No product cause is proven; successful replays do not erase the original observations. The original main timeout points were not traced, so a precise original causal diagnosis is unavailable. Focused screenshots/traces stay local. No site/test fix was made.

## Old-site update and offline result

Independent same-origin profiles at each width first installed release `1fd0b279`, imported/saved one existing DG roster and one SM roster, opened books, then the server switched to the existing reviewed 4060074a package on the **same address**. The observer used ordinary reload, no forced activation API, no manual update button, no cache clearing. It waited for the actual new revision and reopened both saves, then disabled networking and relaunched both books.

| Width | Ordinary automatic update | Existing storage keys | Save byte equality | Reopen DG / SM | Offline after update |
|---|---:|---:|---|---|---|
| 390 | 4.456 s | 2 | Identical, no new/changed keys | PASS / PASS | PASS |
| 1440 | 4.659 s | 2 | Identical, no new/changed keys | PASS / PASS | PASS |

Old package revision: `c3dffaf3c592a3c4`; content SHA256 `d389549067279096e9a645bab8dbaa6be682967190155ce1f8ec37db8eaf35d3`. New package revision/hash are above. No white screen or failed request observed. Package bytes, active revision/document version and functional update paths were checked. Large response-body capture was capped at 8 MiB, so this is not a transport-body proof for every large JSON response. These profiles had the two save keys, not separately customized settings; do not generalize this to every possible historic browser state or claim a Safari test. [Summary](tables/UPDATE_PATH_SUMMARY.json); the gallery includes new/offline screens.

## Classified false positives and observer limitations

- 2,610 hidden-tooltip `innerText` flags: matching input/unit/tooltip identities were joined to actual source-open interactions and opened-DOM snapshots; all 3,299 interactions passed.
- 18 `Unknown` matches: literal negative-fixture labels such as “Unknown imported unit”; not the uppercase service enum.
- Long duplicates: 58 distinct weapon-group instructions, 14 paragraphs in different Core articles/questions, two independent clarification fields; those are separate owners. The 76 per-model keyword repetitions remain the advisory above.
- Short duplicates: 614 glossary category/book labels in different result rows, 16 Black Rage heading observations with different physical/canonical source owners, four accepted short Lion battle-choice references. Do not merge effects or count repeated search badges as one duplicated card rule.
- Initial in-word scanner crossed DOM block boundaries; final same-inline-flow observer yielded zero and retains the original candidates for traceability.
- 530 target replay setup errors were rechecked via their actual parent dialogs: 526 opened child dialogs and four navigated to the main view. No unresolved link was silently discarded.
- Early observer attempts tried a collapsed import field and then a disabled Save Warlord when the correct sole candidate was already current. Those external-harness failures were quarantined and affected keys replayed. The accepted original journals and recipe versions remain local. No app code or existing assertion was changed.
- The DG 390 attached gallery shot is a valid first-case capture from the quarantined early harness run, before its later setup failure; the exact source journal/line and 15 gained chips are recorded in [gallery context proof](tables/ATTACHED_GALLERY_CONTENT.json). All 18 attached gallery slots have a corresponding successful observed context.

## Gallery, artifacts and stopping point

The local gallery is `E:/Warhammer/qa-evidence/auto-qa-sweep-2-2026-11-19/publish/GALLERY.html`. **168/168 required width slots** are present: per book, home, three datasheets, a detachment, import before input, imported roster, attached-leader Gained rules and a rule window; plus global home/Core/glossary. Findings and update screens add examples. **184 selected images**, compressed without cropping; no image substitution for missing coverage. The gallery image build occupied **21.55 MiB** before this report/tables/observer sources, below the 60 MiB limit. Final bytes and offline gallery verification are recorded in `PUBLICATION_CHECK.json`.

Published evidence intentionally excludes RAW Wahapedia, release candidates, full exported rosters, native payload captures, browser profiles and traces. The local evidence root retains originals for review. This feature evidence branch must not be merged.

Preview remains the reviewed 4060074a package. Final source SHA, preview HTTP status, publication size, cleanup outcome and evidence commit SHA are reported with delivery. No FF, release or Pages action is part of this audit.

### Final local handoff checks

- Preview PID 4240 is listening on 0.0.0.0 ports 8765 and 8443; `http://localhost:8765/` returns HTTP 200 with the exact 4060074a package header.
- The saved LAN address 192.168.1.124 timed out at handoff. No 192.168.* IPv4 address was present in the final adapter query. Network/firewall/TLS configuration was not changed. The preview process remains running; the LAN address must be rechecked when the PC is back on that network.
- Offline local gallery: 390 and 1440 PASS, no external network requests, script errors, broken internal anchors or horizontal page overflow. All 184 image assets exist.
- Automatic approval review rejected recursive deletion of `E:/Warhammer/qa-tmp/auto-qa-sweep-2` with “blocked by policy”. It is retained for owner cleanup. No alternate deletion method was attempted. Evidence and preview directories were not targeted.
