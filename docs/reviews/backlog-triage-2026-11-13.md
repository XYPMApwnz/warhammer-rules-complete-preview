# Backlog triage — 13 November 2026

## Review scope and base

This is the full English publication of the local backlog-triage `REPORT.md`, prepared for GitHub review. It preserves the 53 numbered items, findings, qualifications, evidence, estimates and three proposed follow-up tasks. Screenshots and QA archives are not uploaded; their local paths are retained below. Essential observations and failures are written out here so the reviewer does not need access to those local files.

- Audited source: `021578691affac6bf75433bc813aded7789709a0`.
- Feature branch: `codex/backlog-triage-v1`, created directly from that source.
- Evidence directory: `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/`.
- Audit worktree: `E:/Warhammer/worktrees/backlog-triage-v1/`.
- Original audit: no code, data or tests changed; no commits, push or FF; clean tree and GitHub source rechecked at completion.
- Publication follow-up: one documentation commit adding only this file. It does not implement any proposal or change the source branch, main, release or Pages.

Repository file/line references below refer to the audited commit. Evidence paths are local retained artifacts, not files included in this feature branch. Reported test results belong to the audit, not to a new execution during translation/publication.

## What remains before release

The most significant confirmed gameplay gap is **item 20, Fabius Bile**. The Enhanced Warriors computation exists, but the normal UI does not record the attachment at the start of the battle. The enhancement therefore remains `UNKNOWN`. It must not be enabled merely because the units are attached now: the rule depends on their initial attachment.

Other player-visible findings are missing physical composition or empty weapon sections for some compact inputs; no faction-header validation in AM/DG/CSM; several duplicated passages and flattened lists; and four specific texts absent from attached components. Showing the full text of an already executed Detachment rule is optional: its modifier/ability and source are already visible.

New Recruit model aliases, Wardens of Ultramar, Tyranids/EC contract coverage, readable import warnings, Range/Melee layout and the Broodlord source caption have already been addressed. Retained V1 points, architecture aggregates and large publication payloads need separate maintenance, but are not proven defects in current V2 gameplay values.

## Method and limits

Findings were checked against the current audited files and actual runs at the stated SHA, rather than accepted from older reports. Each named failing test was run once, sequentially; reported times are wall-clock measurements on the owner's PC. The full generated gate, pre-ff, all outside-queue tests and the architecture gate were deliberately not run in this inventory task. Gate declarations and coverage were inspected statically.

Imports used existing repository fixtures/reference inputs and scenarios explicitly derived from them. The tournament CSM input remains `DERIVED_FROM_REAL_TOURNAMENT_LIST`, not an authentic New Recruit export. For EC Elegant But Deadly, the existing valid public saved-roster fixture used by the original browser QA was loaded. Attempting to import its non-equivalent textual representation returned `INVALID SOURCE_COMPOSITION_QUANTITY`; this is not classified as an importer defect or an authentic-export failure. Friends' actual exports, old saved V2 backups and a full official SM Codex were not provided.

A fresh runtime package was built. There are **42 UI scenarios at 390 and 1440 px**, viewport height 1000, with **156 referenced screenshots**. Four initial errors in the external capture observer were corrected only in that observer: two selectors incorrectly expected a `Full Army Book` button and two observations dereferenced a null roster while bindings were pending. Original errors remain in `ui/RESULTS.json`; successful repeated observations are in `ui-retry/RESULTS.json`. The product was not modified. Merged observations are in `UI_OBSERVATIONS.json`; four extra observations are in `ui-extra/RESULTS.json`.

Status meanings:

- **PRESENT**: the stated remaining condition was reproduced or statically confirmed. This includes deliberate limitations and development issues, not only gameplay defects.
- **FIXED (commit)**: the old defect has been addressed; current code or observations support closure.
- **OBSOLETE**: the original claim no longer describes a defect or asks for behavior already intentionally covered.
- **CANNOT VERIFY**: required input or a comparable measurement is missing, or a one-off probe did not reproduce the claimed intermittent issue.

Composite items keep their qualifications: item 20 combines fixed EC options with a present Fabius gap; item 43 combines confirmed examples with unverified older subclaims. Items 1/19 and 2/17 are counted once in package estimates. For closed items, size S means administrative closure with zero remaining implementation hours. For CANNOT VERIFY items, any estimate covers later investigation after inputs arrive, not a promised fix without those inputs.

Sizes: **S** up to one hour; **M** approximately half a day; **L** a day or more. Hour ranges are planning estimates, excluding external-input waiting time and acceptance pre-ff. Risk refers to the proposed future work, not to a new change made by this audit.

## Status totals

| Status | Items |
| --- | ---: |
| PRESENT | 31 |
| FIXED | 11 |
| OBSOLETE | 4 |
| CANNOT VERIFY | 7 |

## All 53 items

| # / item | Status and current evidence | Player visibility | Size / remaining hours / game risk | Proposal |
| --- | --- | --- | --- | --- |
| **1. Full text of executable detachment rules** | **PRESENT**. The text path explicitly excludes ROSTER_EXECUTABLE; the meaning is conveyed by the granted ability/modifier and the source name. The original numbers are clause counts, rather than counts of unique rules: AM 5/6, Tyr 3/4, Tau 2/2, EC 2/2, DG 3/4, SM 3/4, DA 3/4, BA 2/2 (rules/clauses). This is the preserved O-3 boundary, not a broken effect. Evidence: `books/shared/roster-v2/conditional-policy.mjs:157`; `books/shared/army-book-app-v2/datasheet-v1.mjs:565`. [All paths](#item-1). | YES — Effective/Guide, Unit modifiers, or the granted ability | S; 0.5–1 h; low | Optionally add the full source of an executable clause through the shared display path, without changing execution. |
| **2. Four conditional texts on an attached component** | **PRESENT**. Recipients are empty for Network Override, Malign Sacrifice, Brutal Example, and the bodyguard-destruction part of Sorrowsyphon. The Plague-Wind-Damage part of Sorrowsyphon remains ROSTER_EXECUTABLE with SOURCE_MODEL, granting +1 Damage when Leading Poxwalkers. The existence of a generic PROFILE_PRESENT does not prove that the specific sourceProfilePresent evaluator exists with this parameter tuple. Evidence: `books/adeptus-mechanicus/v2/contract-datasheet-army-declarations.json:4600`; `books/chaos-space-marines/v2/contract-datasheet-army-declarations.json:5465`. [All paths](#item-2). | YES — attached component; the text block is missing | M; 3–5 h; present | Declare the precise physical conditions and recipients of the four texts separately, preserving the working Damage effect. |
| **3. Architecture cluster: active guarantees are mixed with V1** | **PRESENT**. Static inventory; the aggregate gate and 29 oracles were not run under the exception in item 40. Evidence: `tests/architecture-conformance-gate.mjs:9–14,27–44`; `tests/helpers/architecture-behavioral-oracles.mjs:5–22`. [All paths](#item-3). | NO — development/certification | L; 16–24 h; low | Separate the eight mixed V1 consumers from the active source/identity/ownership checks, then rebuild the aggregator around actual native V2 oracles. |
| **4. Shell-browser: intermittent Ctrl+Click** | **CANNOT VERIFY**. The flake did not reproduce in the single authorized run: the entire shell test passed in 104.914 s (390/1440). Bundled Chromium 151.0.7922.34; a separate narrow probe using installed Chrome 154.0.8037.58 passed 2/2, with a new tab opening in 1404/1646 ms. This is not statistical proof that the flake has been eliminated. The application code returns control to the browser for ctrl/meta/shift; the cause of the rare failure is still unknown. Evidence: `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/tests/item04-shell/OBSERVATION.json`; `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/tests/item04-shell/trace-desktop.zip`. [All paths](#item-4). | NO — test instability; user Ctrl+Click works in the probe | M; 2–4 h; none | Keep the trace and collect a series of runs if the issue recurs, distinguishing the new-tab event, href, and application readiness; do not increase the timeout blindly. |
| **5. SM BSData requires an external checkout** | **PRESENT**. The audit performed exactly one run: FAIL, 88 ms, because tmp/bsdata-wh40k-11e is missing. Evidence: `node tests/sm-authenticated-bsdata-argument-binding-qa.mjs`; `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/tests/05-sm-bsdata.log`. [All paths](#item-5). | NO — source:check/source preparation | S; 0.5–1 h; none | Make a pristine BSData checkout at fa30730f an explicit setup step/prerequisite, preserving the Git/SHA checks and the prohibition on substituting the input. |
| **6. Targeted recipient checks are missing from the queues** | **PRESENT**. unit-recipient-scope-qa and two named fixtures are absent from both queues; the claim that these are ‘external scripts only’ is inaccurate: the repository contains a generic --fixtures runner. SM/DA/BA fixture: 33 browserCases; CSM/Tau: 46; unscopedUNIT: 6. The queues do not invoke their exact argument configuration. Evidence: `v2/unit-recipient-scope-qa.mjs:9–52`; `v2/dg-am-recipient-enrollment-browser-qa.mjs:19–22`. [All paths](#item-6). | NO — missing automated regression coverage | S; 0.5–1 h; low | After a targeted check that they remain current, add unit-guard and both fixtures as arguments to the existing browser runner, without adding duplicate scenarios. |
| **7. Tau roster-import QA runtime** | **PRESENT**. The current single sequential run passed in 313472 ms (5 min 13.5 s), rather than 16 min. The test remains expensive, but the claim that it takes ‘one third of pre-ff’ cannot be confirmed from the current data: a full pre-ff run is prohibited here. The stage log was saved; no CPU/allocation profile was captured, so the cause of the cost has not been established. Evidence: `node books/tau-empire/v2/roster-import-qa.mjs`; `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/tests/07-tau-roster.log`. [All paths](#item-7). | NO — QA duration | M; 3–5 h; low | Profile preparation of repeated scenarios and reuse of unchanged inputs, preserving all physical and negative checks. |
| **8. __pycache__ clutters the working tree** | **FIXED (0365e925dd127753ba827d3fa7a37856d579be2b)**. Both patterns are ignored. The main generated gate also suppresses bytecode; running Python directly outside it may still leave an ignored cache on disk. Evidence: `.gitignore:13–14`; `books/shared/tools/check-generated-rebuild.mjs:42`. [All paths](#item-8). | NO — developer working tree | S; 0 h; none | Close the original item; remove remaining ignored caches through routine cleanup, without changing source files. |
| **9. Inconsistent qa-queue shorthand keys** | **PRESENT**. The map has am, ba, csm, da, dg, ec, sm, tau, and only tyranids; the unknown key tyr is rejected. Evidence: `tools/qa-queue.mjs:12–14`; `docs/codex/QA_MATRIX.md:5–12`. [All paths](#item-9). | NO — QA command | S; 0.5 h; none | List the accepted keys explicitly in help and add tyr as an alias with deduplication by canonical book, or retain the documented tyranids key. |
| **10. BA import: claimed +7.5%** | **CANNOT VERIFY**. The current BA roster-qa passed in 182222 ms (3 min 2.2 s). No exact commit ‘before the earlier task series’, identical scenario set, or controlled before/after measurement is specified; a single current runtime neither proves nor disproves a 7.5% regression. Evidence: `node books/blood-angels/v2/roster-qa.mjs`; `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/tests/10-ba-roster.log`. [All paths](#item-10). | NO — comparative performance test | S; 0.5–1 h; none | First pin a pair of SHAs and identical scenario/measurement conditions, then measure only that scenario sequentially. |
| **11. qa:glossary: Lost source provenance** | **PRESENT**. FAIL in 21479 ms. reconcile:67, call:106: expected [{ref:refs-39a2a1f7c0905ea9}], actual — an expanded GW URU2026-08-26 source object. This compares two representations of provenance; it does not establish loss of a rule/source. cross-owner and core-navigation passed; the subsequent v2-owner-parity was not run because of &&. Evidence: `npm run qa:glossary`; `glossary/v2/tests/ability-category-qa.mjs:67`. [All paths](#item-11). | NO — standalone glossary QA | M; 1–2 h; none | Compare both sides through the existing sourceRefs decoder, preserving exact source equality and the negative controls. |
| **12. No separate build.py --check runs in pre-ff** | **OBSOLETE (8bc41677f384093f418de26583d7f13ade25335b)**. All eight native Python build.py scripts are already included in the full generated gate through their passports; it rebuilds after deleting previous outputs and compares bytes. This is generated:check, rather than a nested glossary:check. Evidence: `books/shared/tools/generated-rebuild-plan.mjs:22–27,46–52`; `tools/qa-queue.mjs:68`. [All paths](#item-12). | NO — build coverage | S; 0 h; none | Close the item and correct the coverage description; do not add eight repeated --check runs to pre-ff. |
| **13. Failing points:check and the V1 catalog** | **PRESENT**. The current points:check fails on unknown canonical ID detachment-sm-624df9cefb95455f. This is a retained V1 producer, explicitly excluded from the generated gate; V2 reads native MFM. The old HTML generators output a different, already retired URL, roster-guides/points-data.js; they do not read the current books/shared/points/points-data.js. Evidence: `package.json:15`; `books/shared/points/build.mjs:39–46`. [All paths](#item-13). | NO — Development only; the file is absent from the V2 runtime allowlist. | M; 3–5 h; low | Retire the legacy command and its remaining consumers from active support in a separate cleanup, without treating it as a V2 points defect. |
| **14. Pinned hash for SM Related Rules** | **FIXED (411056f26249605f4d7267a57ee1d64b9448a8aa)**. The accepted-input chain has been repinned; the current standard --check passes. Evidence: `books/space-marines/tools/build-related-rules.mjs:16–22`; `books/space-marines/sources/space-marines-related-rules-contracts.v1.json`. [All paths](#item-14). | NO — Developer pin; there is no current defect. | S; 0 h; none | Close the item; keep the check in the generated gate. |
| **15. DG enhancement-owner QA: memory** | **PRESENT**. FAIL in 101787 ms: [RangeError: Array buffer allocation failed], Node v24.18.0. There is no script stack trace. The cause and location of excessive memory allocation have not been established; the previous 78 s did not reproduce exactly. Evidence: `node books/death-guard/v2/enhancement-owner-qa.mjs`; `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/tests/15-dg-enhancement-owner.log`. [All paths](#item-15). | NO — separate test outside the queues | M; 3–5 h; low | Profile RSS/heap around the legacy matrix and limit repeated materialization, without raising the memory limit in place of diagnosis. |
| **16. EC/Tyranids: rules without contracts** | **FIXED (Tyranids 87edf0b5cf58132e5df72d1f60006b52e085991a; EC 427796be5d29766acedc59338537f04667c0ba67)**. Current census: Tyranids 34/34 enhancements, 11/11 detachments, 2/2 army components, 129/129 DATASHEET_SECTION (including 79 ABILITIES); EC 34/34, 11/11, 2/2, 62/62 (including 41 ABILITIES). Top-level ARMY_RULE containers are not equivalent to logical component rules. Evidence: `books/tyranids/v2/rule-contract-build.mjs`; `books/tyranids/v2/text-rule-review.json`. [All paths](#item-16). | NO — the previous shortfall has been fixed; the current text is displayed on attached Genestealers/Infractors — The previously described shortfall is no longer present; text contracts and recipients have already been added. | S; 0 h; none | Close the old 31/44 counts; do not add executable effects merely to provide a contract. |
| **17. Conditions without an evaluator; Electro-infusion** | **PRESENT**. The old count of 189 is not comparable with the current schema: 997 FIELD/ROSTER occurrences, including repeats. Missing declarations have been confirmed for containsTechPriestModel (Network Override), characterModelLeadingSource (Electro-infusion), the exact profilePresent conditions for Malign Sacrifice/Brutal Example, and memberOfBearerUnit in the battle portion of Sorrowsyphon. These concern BATTLE_ONLY/text applicability; the executable +1 Damage from Sorrowsyphon is separate and has not been lost. Evidence: `books/shared/roster-v2/condition-context.mjs:16–24`; `books/shared/roster-v2/condition-computations.mjs:35`. [All paths](#item-17). | YES — Text applicability/display on attached units; the corresponding Network Override/Malign Sacrifice/Brutal Example cases from item 2. | M; 3–5 h; low | Declare the existing roster facts specifically for these rules and check the recipients; do not automate battle events or count 997 as separate defects. |
| **18. 250 UNRESOLVED_SOURCE** | **PRESENT**. The current check of 97 native JSON files found 250 distinct document identities with UNREGISTERED_DOCUMENT; 241 referenced local files exist, and 9 cases have no document name (one per book). This does not mean 250 lost files/rules or 89,829 independent errors (the latter are repeated sourceRefs). Evidence: `books/shared/source-refs-v2/source-registry.mjs:38`; `books/shared/source-refs-v2/source-refs.mjs:133`. [All paths](#item-18). | NO — An internal provenance marker; the application does not display the literal UNRESOLVED_SOURCE. The marker alone does not establish broken user-facing links. | L; 8–16 h; low | Register the 241 verified documents separately and investigate the 9 pieces of metadata without a document, without guessing at evidence. |
| **19. Death Blow / Shadow Tactics / Hypervirulent Strains lack full text** | **PRESENT**. This is the same preserved boundary as item 1; do not count it as a second task. Death Blow charge +1, Shadow Tactics Stealth/detection −3, and Hypervirulent contagion +3 execute through the preserved contracts; only BATTLE_ONLY enters DETACHMENT_TEXT. Evidence: `books/shared/roster-v2/conditional-policy.mjs:157`; `books/shared/army-book-app-v2/datasheet-v1.mjs:565`. [All paths](#item-19). | YES — the card shows a modifier/ability with its source instead of the full rule | S; 0.5–1 h; low | Merge with item 1; do not change game operations. |
| **20. EC wargear options / Fabius Enhanced Warriors** | **PRESENT**. The EC part was fixed in 43bd6aaf: 33 canonical WARGEAR_OPTION entries; the library displays a separate Wargear Options section, while unselected options are hidden in the roster. For Fabius, the INITIAL_ATTACHMENT evaluator exists, but manual service.attach changes only attachments; the production UI never writes initialAttachments. Without explicitly injected history, Enhanced Warriors remains conditional. Current UI + native control: initialAttachments=null; Legionaries have T5, Enhanced Warriors applied=0, and four UNKNOWN conditional rows. Explicit initial history in an isolated control snapshot yields T6 and melee S5→6, with 4 physical applied rows/2 unique effects. The existing evaluator works; the user path for specifying history is missing. Evidence: `books/shared/army-book-app-v2/datasheet-v1.mjs:890–897`; `books/shared/army-book-app-v2/personal.mjs:531`. [All paths](#item-20). | YES — EC Noise Marines: options in the library; CSM Fabius when attached normally to Legionaries/another eligible unit. | M; 4–8 h; present | For Fabius, have the player explicitly record the initial attachment; do not treat the current relationship as the history at the start of the battle. Close the EC subitem. |
| **21. Historical MFM and source statuses** | **PRESENT**. Fifteen old v1.4/v1.5 sources belonging to the books themselves are already inactive/HISTORICAL_EVIDENCE. Two old allied-CSM v1.5 sources remain active/ACCEPTED_SOURCE alongside v1.6; in the global registry, VERIFIED_CURRENT/UPDATE_AVAILABLE represent a separate axis of upstream currentness, rather than lifecycle. The preserved currentness snapshot dated 2026-09-30 must not be changed merely to introduce a new date. Evidence: `books/chaos-space-marines/sources/source-manifest.json:222–263`; `books/chaos-space-marines/sources/source-manifest.json:368–397`. [All paths](#item-21). | NO — Metadata; current.json selects the current v1.6 sources. | M; 2–4 h; low | Separate historical lifecycle from the snapshot verification status; archive the two old auxiliary authorities while preserving RAW and historical checks. |
| **22. Legacy v1.3 points for Tyranids/Tau** | **PRESENT**. The files are indeed v1.3, but the claim that ‘only tests read them’ is incorrect: extract-codex-parity reads them as canonical-source-input; tau:sources:check runs this retained producer. V2 uses native current MFM. Evidence: `books/tyranids/content/tyranids-points.en.json`; `books/tau-empire/content/tau-empire-points.en.json`. [All paths](#item-22). | NO — Retained parity/capture chain, rather than active V2 points. | M; 3–5 h; low | First separate the retained parity/capture consumers, then mark the files historical or remove them; do not delete them as dead test fixtures. |
| **23. BA Stormlance 1DP/2DP** | **OBSOLETE**. The source discrepancy remains, but the application retains the official SM owner's 1DP; BA does not create its own pricing override. There is therefore no game-points defect to fix: Waha 2DP is documented as SOURCE_CONFLICT. Evidence: `mfm/sources/v1.6/space-marines.json:/detachments/17`; `books/blood-angels/v2/mfm-boundary.json:1327–1364`. [All paths](#item-23). | YES — BA Stormlance Task Force: 1DP applies; the secondary-source conflict is stored in the data. | S; 0 h; none | Keep the official 1DP and the conflict record; do not introduce a BA override based on Waha 2DP. |
| **24. DG RAW from 25 September allegedly missing** | **FIXED (cc21032591931551c4df262cea28040289b379f1)**. The 37 accepted original RAW HTML files are preserved in books/death-guard/v2/sources/accepted-waha-pages/. Independently, 37/37 actual SHAs match source-enrollment and the original corpus.pages; this is not a fresh download from the current website. Verification used the bytes of the current Git snapshot, without network access. Evidence: `books/death-guard/v2/sources/source-enrollment.json:normalizationEvidence`; `books/death-guard/v2/sources/accepted-waha-pages/`. [All paths](#item-24). | NO — Developer source archive. | S; 0 h; none | Close the item; distinguish the dated original corpus from the location where its pinned RAW files were restored. |
| **25. BA ambiguous Chainsword / Bolt Rifle profiles** | **CANNOT VERIFY**. The current book still explicitly declares two unverified bindings and realNewRecruitExportTested=false; the task contains no real BA export. Constructed input does not establish the real spelling or the physical profile split. Paired screenshot paths for the current warning are retained below; the actual disputed real export is absent. Evidence: `books/blood-angels/v2/app-build.mjs:36`; `books/shared/army-book-app-v2/cosmetics.mjs:7`. [All paths](#item-25). | YES — warning on the import screen; possible manual clarification | M; 3–5 h; present | Obtain a real BA export containing both disputed options and bind only entries supported by evidence. |
| **26. Tau Fireknife without selected weapons / without composition** | **PRESENT**. Actual weapons are derived from selected wargear, rather than automatically from the datasheet; a fixture with explicit Shas’vre/Shas’ui but no weapons produces a conservative empty section. For compact, ambiguous composition, the code requires COMPOSITION_MEMBER rather than inventing a bearer. Evidence: `books/tau-empire/v2/roster-import.mjs:77`; `books/tau-empire/v2/roster-import.mjs:84`. [All paths](#item-26). | YES — import requires composition / Weapons has no selected profiles | M; 1–2 h; low | Explain the incomplete export and the required composition/wargear lines; do not add silent loadout defaults. |
| **27. Wardens of Ultramar / Kornelius–Komelius** | **FIXED (29a866d534ef64b5e7ed5fc1f97bf87e267f9f8e)**. An explicit contextual binding of one PSYKER among six named models is preserved; Raise the Banner exists and is recorded as the source for SUPPORT. The repository contains an exact constructed import fixture and a browser check covering READY/6 models/attach/detach. Evidence: `books/space-marines/v2/roster-source-corrections.json:343`; `books/space-marines/v2/roster-source-corrections.json:401`. [All paths](#item-27). | NO — the previous import error has been fixed | S; 0 h; none | Close the item following the current fixture confirmation; do not rename source facts. |
| **28. Cultist / Beastman and other MODEL names** | **FIXED (c0fab930a4f45ba05c33b66834fbf979518d91ef)**. A shared alias producer now uses pinned BSData, preserves existing aliases, and adds only unambiguous entries; the evidence records the source/entryId/path/SHA. The tournament fixture is marked DERIVED_FROM_REAL_TOURNAMENT_LIST; it is not a real export. Evidence: `books/shared/tools/build-new-recruit-model-names.mjs:152`; `books/shared/roster-v2/model-name-aliases.mjs:1`. [All paths](#item-28). | NO — the previous unnecessary MODEL questions have been eliminated for the proven names | S; 0 h; none | Close; retain fail-closed behavior for genuine MODEL ambiguity. |
| **29. Plain header requires three lines; real chapter headers remain unconfirmed** | **PRESENT**. The metadataLines.length===3 condition remains literal (blank lines are removed first). The labelled format has a separate path; DG is a genuine owner-provided fixture, while the other eight are explicitly DERIVED. The actual SM chapter and AM header names cannot be confirmed without exports. A DG control with an additional fourth line returns NEEDS_BINDINGS and preserves the previous roster. The actual variety of headers remains unknown. Evidence: `books/shared/roster-v2/parser.mjs:105`; `books/shared/roster-v2/parser.mjs:116`. [All paths](#item-29). | YES — a different unlabelled preamble is not recognized as a plain header | S; 0.5–1 h; low | Collect real variants; extend the grammar only on that basis, preserving the labelled path. |
| **30. AM/DG/CSM do not reject a foreign faction** | **PRESENT**. AM/CSM create the shared importer without factionIdentityLabels; DG passes metadata with the same previous policy. The shared gate exists, but the owner previously chose to defer applying it to these books. The relevant exact probe uses a foreign header plus a valid unit body from the book itself. In three probes, only the header was changed to a foreign one, while the body remained from the book’s own valid fixture: all returned READY. This proves the absence of a header gate, but does not prove that any foreign army can be imported. Evidence: `books/adeptus-mechanicus/v2/roster-import.mjs:39`; `books/chaos-space-marines/v2/roster-import.mjs:6`. [All paths](#item-30). | YES — it may accept its own set of units with a foreign faction line | M; 2–3 h; low | Subject to the owner’s decision, enable the existing shared faction gate for the three books with an exact list of accepted names. |
| **31. Terminator Assault Squad is not recognized** | **FIXED (c0fab930a4f45ba05c33b66834fbf979518d91ef)**. The DATASHEET itself has the exact name Terminator Assault Squad; two owner-provided fixtures are preserved with MODEL Assault Terminator Sergeant + Terminator/Assault Terminator, expecting READY with specific composition/profile IDs. The original real cloud input body is not attached, so its individual cause cannot be reconstructed. The current existing fixture is READY in native and UI checks; the separate original cloud input body is missing, so its cause has not been established. Evidence: `v2/fixtures/new-recruit-model-names.json:47`; `v2/fixtures/new-recruit-model-names.json:170`. [All paths](#item-31). | NO — the existing proven variants are accepted | S; 0 h; none | Close name recognition based on the fixtures; preserve the full export text if a new real rejection occurs. |
| **32. Old saved rosters require re-importing** | **CANNOT VERIFY**. A specific old V2 backup and the version that saved it are needed. A limited scalar Detachment migration exists; generic load validates the snapshot and does not re-parse the original export. Singleton equipment promotion exists only in import, not in import-only load. This does not prove that all saved rosters are broken. A screenshot of the defect is impossible without the corresponding old backup; a fresh import cannot substitute for it. Evidence: `books/shared/roster-v2/context.mjs:9`; `books/shared/roster-v2/import-service.mjs:92`. [All paths](#item-32). | YES — possibly when restoring a specific old V2 backup | M; 2–4 h; none | Include a conditional re-import hint in the release; design a migrator only after obtaining a real backup. |
| **33. Friends’ real rosters across nine armies** | **CANNOT VERIFY**. These exports are not included in the task; constructed and derived fixtures cannot substitute for them. There are no screenshots of errors: the input files were not provided. Evidence: `v2/fixtures/new-recruit-plain-header.json:1`; `v2/fixtures/new-recruit-model-names-tournament-csm.json:1`. [All paths](#item-33). | YES — potential errors in real imports | L; 8–16 h; low | Obtain friends’ unchanged real exports and maintain a separate error matrix without guesswork. |
| **34. SM: verification against the official Codex** | **CANNOT VERIFY**. The full official Codex/App was not provided. In the legacy manifest, 101 entries carry requires-codex-verification; that is not the provenance of the current 85 native datasheets. Native reads frozenWaha20.10 plus confirmed official fields; enrollment explicitly records the absence of an independent complete Codex/App. Evidence: `books/space-marines/sources/source-manifest.json:37–55`; `books/space-marines/v2/build.py:24–27`. [All paths](#item-34). | NO — A lack of independent evidence for the data, not a proven visible card defect. | L; 16–32 h; present | Obtain the official book/available excerpts and verify specific fields; do not declare 85 native cards incorrect based on the legacy flag on 101 entries. |
| **35. A ‘Data current as of…’ summary** | **PRESENT**. The library intentionally displays only the Edition badge; currentness/MFM version remain provenance metadata and are not shown to the player. Evidence: `books/shared/army-book-app-v2/runtime.mjs:517–524`; `books/shared/army-book-app-v2/project.mjs:77`. [All paths](#item-35). | YES — At the top of the library in each of the 9 books: no source date/MFM version is shown. | M; 2–4 h; low | Display the rules snapshot date and current MFM separately, avoiding a single misleading ‘everything verified’ date. |
| **36. Evidence pins depend on sourceOrder and links** | **PRESENT**. The pins were re-pinned after Core B, but the hash model did not become text-only: sourceContentHashes come from corpus contentHash, and the unit hash contains complete occurrences, including order/HTML/links. Evidence: `books/space-marines/v2/static-gameplay-qa.mjs:65–68`; `books/blood-angels/v2/conditional-policy-declarations.mjs:15,17`. [All paths](#item-36). | NO — it breaks evidence re-binding when Core is updated | M; 3–5 h; low | Introduce a separate normalized semantic-text hash for book pins, preserving the full capture/content hash for authenticity. |
| **37. Source-catalog as an authored registry** | **FIXED (7b15dc36425ac577b6928837ec9983409972e278)**. Binding loss has been fixed through append-only/pre-write integrity. There are now 19,286 bindings and 10,168 contexts; the old 19,174 is a historical count. The catalog intentionally remains an authored registry seed; there is currently no architectural requirement to recreate it from nothing. Evidence: `books/shared/source-refs-v2/source-refs.mjs:37–40`; `tools/audit/build-source-catalog.mjs:26–59`. [All paths](#item-37). | NO — Provenance/build integrity, not a standalone gameplay feature. | S; 0 h; none | Preserve the accepted append-only design and its checks; a self-contained input is a separate optional architectural task. |
| **38. Increasing pre-ff duration** | **CANNOT VERIFY**. The current plan contains 154 jobs; a full pre-ff was not run for this task. The historical 50/75.6/80.5 minutes refer to different SHAs, queues, and machine loads. Current measurements of individual jobs are provided below; they cannot establish that code caused the increase or identify the 10 jobs with the largest increases without a comparable baseline log. Evidence: `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/infra/pre-ff-plan.json`; `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/TEST_RUNS.json`. [All paths](#item-38). | NO — development/acceptance speed | M; 3–5 h; none | Save per-job JSON, scenario counts, and machine conditions for every pre-ff; optimize only confirmed hotspots, combining this with item 7. |
| **39. Most tests are outside quick/pre-ff** | **PRESENT**. This is only a static inventory, as authorized. Current counts: 539 test-like modules = 513 test candidates + 26 helpers/fixtures; 111 direct queue jobs + 10 actually executed through import + 2 producer checks = 123; 390 lack full coverage. Neither PASS/FAIL results for the 390 files nor a complete run of them are claimed. The 390 include 88 browser-named files and 31 Python files; 33 files statically read removed paths/old pages. personal-datasheet-qa imports only the fixture: its main-only guard still does not execute. The presence of a legacy token alone was not treated as proof that a test is dead. Evidence: `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/infra/STATIC_INVENTORY.json`; `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/infra/OUTSIDE_TESTS.txt`. [All paths](#item-39). | NO — risk of incomplete QA | L; 8–16 h for analysis; full sequential run estimated at 3–8 h; low | First classify the obvious retired/mixed/live cases, then run the remaining live tests in a separately authorized pass with timeouts and preserve the classifications; do not blindly add all 390. |
| **40. Architecture gate: 15 contracts/29 oracles** | **PRESENT**. Statically confirmed: 15 contracts/29 unique scripts, with 2 mapped paths missing; only 2 leaf oracles are direct queue jobs. The old 0/15 and 119 deviations were not checked on this base and are not repeated as facts. tests/glossary-output-ownership-qa.mjs and tests/offline-mobile-routes-qa.mjs are missing. Eight mixed oracles read removed V1 catalog/provider data. qa:architecture is a different wiring smoke check, not architecture:check. The gate executes 29 oracles once, then propagates each contract’s overall status to 9 books; 119 does not mean 119 independent book defects. Evidence: `tests/architecture-conformance-gate.mjs:9–14,27–52`; `tests/helpers/architecture-behavioral-oracles.mjs:5–22,59–63`. [All paths](#item-40). | NO — not a user-facing release gate | L; included in item 3; standalone run estimated at 5–20 min (not measured); low | Do not add the current aggregator to pre-ff; first separate live checks from V1, remove only missing mappings after review, and replace consumers with native ones. |
| **41. Retained V1 B/C/D** | **PRESENT**. B/C/D remain a mixed graph of legacy production components and tests; the direct V1 UI is retired. Configs/legacy build-army-book still read relatedRules/effectContracts; other generators output V1 HTML/target-data. The inventory label STILL_REQUIRED V1 production does not prove use by modern V2. Evidence: `books/space-marines/book.config.json:96`; `books/shared/tools/build-army-book.mjs:47–85`. [All paths](#item-41). | NO — Retained producers/tools only; the listed V1 outputs are absent from the runtime allowlist. | L; 16–32 h; present | Remove components in separate steps following the consumer graph and preserving actual inputs; keep the large rework outside the release. |
| **42. Runtime size/duplicate glossary payloads** | **PRESENT**. Current byte counts: glossary JSON 31,196,261; glossary JS 23,228,308; SM app 23,277,041; DA 19,762,917; CSM 19,597,738; BA 19,417,687. JS and JSON are both allowlisted for different consumers. The old 279 MB cannot be treated as the current size without a new package build (performed by the root agent). Fresh runtime-package: 436 allowlisted files + a separate manifest, publishedBytes=282687675 (282.69 MB/269.59 MiB), cacheRevision39f6cefe1b2905d2. This is the size of the entire package, not the initial download or mandatory precache; both glossary formats have distinct live consumers. Evidence: `tools/pages-runtime-manifest.json:9745`; `tools/pages-runtime-manifest.json:9897`. [All paths](#item-42). | YES — Initial loading/offline download and cache storage; not incorrect gameplay values. | L; 12–24 h; low | Measure the current package/network traffic and gradually eliminate repeated delivery of large data or load it lazily, preserving texts and API. |
| **43. Combined remaining O-4/O-8/O-13/Lion/O-3/O-6/U-1 items** | **PRESENT**. Specific remaining issues are confirmed: for Lion El’jonson, the full Martial Exemplar text is repeated under two Reroll permission entries, conditional bullets are joined into one line, and Supreme Commander repeats the heading in its body. The derived Titus scenario also has two WARGEAR OPTIONS headings. There is already only one source caption: this is not a recurrence of the old fixed captions defect. O-4 is reproduced in item 26. General O-13 ordering instability, the exact old 11 DG/8 EC repetitions, and annotation-style decisions without original examples are NOT VERIFIED; representative DG/EC scenarios are preserved, but they do not prove the entire old list. Evidence: `books/shared/army-book-app-v2/effective-datasheet-presentation.mjs:20`; `books/shared/army-book-app-v2/effective-datasheet-presentation.mjs:95`. [All paths](#item-43). | YES — partly formatting/captions; the exact remaining examples are unknown | M; 4–6 h; low | Fix only the demonstrated text/heading repetitions and lists, following the physical rule/source without merging different gameplay effects; clarify the rest through examples. |
| **44. Internal Codex reason fields** | **PRESENT**. reason is preserved in reviewed text data. The normal user route does not call renderInstanceContext: the only call is in a synthetic browser test. These review notes are not displayed in the normal card or roster. Evidence: `books/tyranids/v2/text-rule-review.json:1333`; `books/shared/army-book-app-v2/roster.mjs:474`. [All paths](#item-44). | NO — review data and a synthetic test-only screen | S; 0.5–1 h; none | Exclude this from the release’s cosmetic changes; preserve the rationale in documentation during cleanup. |
| **45. Technical phrases on the import screen** | **FIXED (e1c03468)**. playerImportCopy replaces NOT_PROVEN/source OR/constructed-input with plain English wording; the MFM reference-only phrase has been removed from the screen. The roster renderer applies formatting before output and skips an empty message. On the normal import screen across all 9 books at 390/1440, a search for NOT_PROVEN\|MFM\|source OR\|constructed-input\|canonical\|binding returned 0 matches. This checks the normal path, not every possible error. Evidence: `books/shared/army-book-app-v2/cosmetics.mjs:2`; `books/shared/army-book-app-v2/roster.mjs:164`. [All paths](#item-45). | NO — the previous internal clutter; the meaning of warnings remains visible | S; 0 h; none | Close; do not hide the real BA/DA limitations. |
| **46. Extra hyphen before Prey on the Weak** | **OBSOLETE**. The current title is separate; the body contains two genuine bullet points. The same values were already present at 61e7c870 before the cosmetic changes; the unverified original defect is not confirmed. The genuine - Friendly/- When bullets must not be removed. Evidence: `v2/cards-cosmetics-browser-qa.mjs:110`; `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/display-import/COSMETIC_SOURCE_PROOF.json`. [All paths](#item-46). | NO — the evidence contains no extra repeated heading | S; 0 h; none | Close as an unconfirmed item; preserve the genuine bullets. |
| **47. Range/Melee wraps and D is clipped** | **FIXED (e1c03468)**. Shared container CSS reserves Range/stat widths and prevents effective values from wrapping. A current geometry test covers all columns and single-line Melee, including 1024/1200/1440. On the current Biologus Putrifier card, Melee occupies 1 line at 390 and 1440; screenshots and DOM are preserved. The other widths were not rerun here. Evidence: `books/shared/army-book-app-v2/datasheet-v1.css:221`; `books/shared/army-book-app-v2/datasheet-v1.css:231`. [All paths](#item-47). | NO — the previous weapon-table defect | S; 0 h; none | Close based on the current screenshots; preserve geometry checks. |
| **48. Broodlord: Source ABILITIES instead of the rule name** | **FIXED (e1c03468)**. sourceRuleCaption resolves the source through exact sourceFields and a single named block. For the current Broodlord, this produces Vicious Insight and Hypnotic Gaze (Psychic); it does not guess an ambiguous/unnamed block. In the actual UI for the selected fixture, the weapon caption is: Source: Vicious Insight — Broodlord · Applies to: Genestealers · 5 models. Evidence: `books/shared/army-book-app-v2/cosmetics.mjs:50`; `books/shared/army-book-app-v2/datasheet-v1.mjs:187`. [All paths](#item-48). | NO — the confirmed rule name is displayed instead of the generic ABILITIES | S; 0 h; none | Close; preserve the fallback for an unnamed source and investigate the data separately. |
| **49. The recipient displays the full block containing this model** | **OBSOLETE**. This is the owner-authorized display of the entire source. Righteous Fury has UNIT/SOURCE_UNIT/FORMED for +1S and MODEL/SOURCE_MODEL for healing; the shared text boundary is the entire field text. Its display on Assault Intercessors does not mean healing is executed on them. Evidence: `books/space-marines/v2/recipient-declarations.json:100`; `books/space-marines/v2/recipient-declarations.json:102`. [All paths](#item-49). | YES — the complete Righteous Fury block with Captain Titus as its source caption | S; 0 h; none | Keep it as specified in the catalog; do not split execution based on the visible text. |
| **50. Release FF: documents require the owner, while policy permits Codex** | **PRESENT**. Both current documents explicitly prohibit Codex from pushing release and require the owner to do it. They do not express the discussed exception for separate, specific authorization. Evidence: `AGENTS.md:42–43`; `tools/PAGES_RUNTIME_RELEASE.md:25,27,34`. [All paths](#item-50). | NO — publication procedure | S; 0.5 h; none | State consistently that Codex performs only an ordinary FF release after separate owner approval of the exact SHA, with all checks preserved. |
| **51. Old feature branches on GitHub** | **PRESENT**. GitHub ls-remote at audit time: 47 heads, 45 codex; 43 feature heads are ancestors of the current source. These are candidates, not authorization to delete. codex/unified-v2-source is protected; codex/translate-3-sources@874f3ccb is not merged. GitHub cleanup does not delete working copies/local repositories. Evidence: `git ls-remote --heads https://github.com/XYPMApwnz/warhammer-rules-complete-preview.git`; `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/infra/GITHUB_BRANCHES.json`. [All paths](#item-51). | NO — developer navigation | S; 0.5–1 h; none | Present the owner with an explicit allowlist of merged feature branches and delete only after separate authorization; exclude source/release/unmerged branches. |
| **52. *:check checks are outside the queues** | **PRESENT**. There are now 14 aliases, not 13. generated:check is included directly; two glossary aliases have equivalent coverage through the producer gate; source:check has coverage for 3 of its 4 leaves; the rest require analysis at the leaf level. qa:points is not expanded in quick/pre-ff, so tests/mfm-numeric-ownership-qa.mjs is not executed separately. The publication/wiring standalones are not direct queue jobs either. points-data.js is marked RETired, and cache-revision is a release seed: their old freshness aliases cannot simply be enabled. Evidence: `package.json:scripts`; `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/infra/CHECK_ALIAS_COVERAGE.json`. [All paths](#item-52). | NO — QA commands/owner updates | M; 3–4 h; low | Connect the live numeric-ownership/publication/wiring leaf oracles, examine external-source prerequisites, and mark retired aliases; do not blindly connect all 14 aggregators. |
| **53. Python CRLF output is invisible to read_text --check** | **PRESENT**. Partially confirmed: the CSMv2 example in TRACKER has already been fixed, and all 8 native build.py files use bytes. However, 15 legacy/source-capture tools still use write_text without newline, and several --check paths read with normalizing read_text. The gate compares 147 files byte for byte and protects active native output; the old TRACKER example is outdated. The remaining gap concerns old tools/manual capture, not current native data. Writers were not run for this inventory, and CRLF in saved files was not corrected; the remainder is confirmed by writer/read_text code, not by a new native-gate failure. Evidence: `books/chaos-space-marines/v2/build.py:437–441`; `books/space-marines/v2/build.py:448–452`. [All paths](#item-53). | NO — sources/build reproducibility | M; 2–4 h; low | Close the native portion of the old entry and convert the remaining source writers/checks to LF bytes in a separate small pass, without changing saved data. |


## Actual one-off executions

All runs were sequential. Every recorded run left the repository tree unchanged. Full machine-readable record: `TEST_RUNS.json`; complete output is under `tests/` in the evidence directory.

| Item | Command | Result | Wall time | Observation / local log |
| --- | --- | --- | ---: | --- |
| 5 | `node tests/sm-authenticated-bsdata-argument-binding-qa.mjs` | FAIL | 0.088 s | `ENOENT` resolving `root/tmp/bsdata-wh40k-11e`; authenticated checkout at `fa30730f` is required. `tests/05-sm-bsdata.log`. |
| 11 | `npm run qa:glossary` | FAIL | 21.479 s | Lost source provenance: a decoded object is compared with an encoded ref. Cross-owner-reference and glossary-core-navigation passed; the later v2-owner-parity job was NOT_RUN because the chain uses `&&`. `tests/11-qa-glossary.log`. |
| 13 | `npm run points:check` | FAIL | 6.323 s | `unknown canonical ID detachment-sm-624df9cefb95455f`; retained V1 producer. The later two checks were NOT_RUN. `tests/13-points-check.log`. |
| 14 | `node books/space-marines/tools/build-related-rules.mjs --check` | PASS | 0.429 s | Accepted-input pins and stored output agree. `tests/14-sm-related-check.log`. |
| 15 | `node books/death-guard/v2/enhancement-owner-qa.mjs` | FAIL | 101.787 s | `[RangeError: Array buffer allocation failed]`, Node v24.18.0. No script-level allocation stack was supplied. `tests/15-dg-enhancement-owner.log`. |
| 10 | `node books/blood-angels/v2/roster-qa.mjs` | PASS | 182.222 s | Current correctness confirmed; a 7.5% performance regression was not measured. `tests/10-ba-roster.log`. |
| 7 | `node books/tau-empire/v2/roster-import-qa.mjs` | PASS | 313.472 s | 5 min 13.5 s; the earlier 16-minute duration did not recur. `tests/07-tau-roster.log`. |
| 4 | `node v2/shell-browser-qa.mjs`, external copy with trace instrumentation | PASS | 104.914 s | Assertions/timings retained; only import/root relocation and read-only tracing/network/screenshots added. Desktop 1440 and phone 390 passed, app errors 0, requests 189, forbidden requests 0. `tests/04-shell-browser.log`; `tests/item04-shell/INSTRUMENTATION.json`. |
| 42 | `node tools/pages-runtime-package.mjs --source <HEAD> --out <tmp>` | PASS | 5.984 s | 436 allowlisted files plus a separate manifest; published files total 282,687,675 bytes. `tests/42-runtime-package.log`. |

### Shell Ctrl+Click comparison

The full shell suite used bundled **Chromium 151.0.7922.34**. A separate narrow Ctrl+Click diagnostic used installed **Chrome 154.0.8037.58**, executable `C:/Program Files/Google/Chrome/Application/chrome.exe`; this was not a second full shell-suite run.

| Width | Result | Total probe | Click to loaded new tab | App errors |
| --- | --- | ---: | ---: | ---: |
| 390 | PASS | 3.606 s | 1.404 s | 0 |
| 1440 | PASS | 4.279 s | 1.646 s | 0 |

The exact expected physical reference URL was preserved. Results: `tests/item04-chrome/RESULTS.json`; traces: `trace-390.zip`, `trace-1440.zip`. Bundled traces: `tests/item04-shell/trace-desktop.zip`, `trace-phone.zip`. Both browsers ran headless. One successful comparison cannot exclude a rare race or differences in visible-window mode. The application handlers return control to the browser for Ctrl/Meta/Shift clicks; no interception was found in the inspected code.

### Exact glossary failure evidence

The stack is `glossary/v2/tests/ability-category-qa.mjs:67:12` in `reconcile`, called at `:106:20`. The message names:

```text
Lost source provenance army::death-guard::datasheet_section::unit-chaos-land-raider::datasheet-chaos-land-raider:section:1::/blocks/0/text
```

Expected:

```json
[{"ref":"refs-39a2a1f7c0905ea9"}]
```

Actual decoded provenance:

```json
{
  "sourceId": "gw-universal-rules-updates-v1.1-2026-08-26",
  "effectiveFrom": "2026-08-26",
  "operationId": "gw-universal-rules-updates-v1.1-2026-08-26:operation:060",
  "page": 1,
  "documentPath": "books/death-guard/v2/sources/gw-universal-rules-updates-2026-08-26.pdf",
  "sourceLocator": "MOVE TYPES FOR DISEMBARKING UNITS"
}
```

This proves a mismatch of provenance representations in the oracle, not loss of the underlying rule/source. For item 15, Node reports only its internal `triggerUncaughtException` and the RangeError; the allocation site and cause remain unproven.

### Performance limits

Item 38 does not claim a fresh full pre-ff measurement. The plan currently contains **154 jobs**, not 154 measured passes. Historical 50 / 75.6 / 80.5 minute figures came from different SHAs, queues and PC loads. Individual times above neither sum to a full pre-ff nor distinguish machine load from code regression. Item 10 also lacks the exact earlier SHA, fixed scenario set and controlled baseline needed to assess the claimed 7.5% increase.

## Packages A-D and order

Estimates exclude closed items and double counting. They are not the sum of all 53 row estimates. Acceptance pre-ff is additional; this audit did not establish a new comparable full-run baseline. For planning, reserve roughly 1-1.5 hours per full run, plus review/FF.

| Package | Included work and order | Total estimate | Keep out of the immediate release scope |
| --- | --- | --- | --- |
| **A — player-visible import/roster** | 1) Item **20**, Fabius initial history; 2) **30**, faction gate after owner decision; 3) **26**, clear unknown-composition/empty-weapons feedback; 4) **29**, supported-header boundaries and collection of exports for **25/33**. | **L, 8-14 h**: Fabius 4-8 h; remaining work 4-6 h. | Never infer equipment or initial attachment. **25/32/33** need real exports/backups; waiting time is not estimated. **27/28/31** are closed. |
| **B — player-visible text/layout** | 1) **43**, concrete duplicates/lists, 4-6 h; 2) **2+17**, four specific attached texts, 3-5 h; 3) **35**, rule-snapshot/MFM dates, 2-4 h; 4) **1+19**, optional full executable-rule text, 1-2 h. | **L, 10-17 h**, excluding payload optimization. Including all of **42**: **L, 22-41 h**. | **42**, payload/lazy-loading work, adds 12-24 h and needs network measurement first. **44** is not player-visible; **45/47/48** are fixed; **46/49** are not defects. |
| **C — data** | 1) **21**, retire remaining old allied-MFM authority without changing current prices; 2) **18**, register 250 provenance identities; 3) **34**, independently compare the official SM Codex after it is supplied. | **L, 26-52 h**: 2-4 + 8-16 + 16-32 h. | This is not 26-52 h of mandatory gameplay fixes. **18** does not mean 250 lost rules; **34** lacks input. **23** already uses official 1 DP; **24/16** are closed. |
| **D — tests/infrastructure** | Immediate minimum: **11**, decoder-aware oracle; **5**, reproducible BSData setup; **15**, memory; **6**, targeted queues; **9**, help; **50**, docs. Then **7+10+38** as one performance investigation; **36**, pins; **53**, legacy EOL; **51**, merged branches. Separate large tail: **3+39+40+52** and **13+22+41**, following real consumer graphs. | Immediate minimum **L, 6-11 h**. Entire open tail **L, 48-82 h**, including 16-24 h for the architecture cluster and 16-32 h for V1 boundaries; shared coverage is counted once. | Do not enqueue 390 tests or 14 aggregates blindly. A separate sequential diagnostic run of 390 entries is estimated at 3-8 h wall-clock, not measured; architecture execution 5-20 min, not measured. Wrappers without a global timeout can run longer. |

Closing all work estimated in these four packages, including Codex/payload/legacy architecture but excluding the missing actual exports and backups, is roughly **104-189 hours**, plus external materials and sequential QA. This is not a sensible mandatory scope before the first stable release.

### Three concrete follow-up tasks

1. **Fabius initial attachment and safe import** — items **20 (Fabius only), 30 and 26**. Explicit start-of-battle history with save/load and a negative reattachment control; shared faction validation for AM/DG/CSM after the owner's decision; clear feedback when physical composition/equipment is unproven. **8-13 hours + one pre-ff**. Do not enable Enhanced Warriors from the current attachment alone or guess missing weapons.
2. **Remaining card-text defects** — only reproduced parts of **43**, plus the specific cases in **2/17**. Preserve separate effects while rendering one full text per physical rule/source; repair lists and repeated headings without changing numbers/equipment. **7-11 hours + one pre-ff**. Item **35** is optional additional work (+2-4 h). Full executable-rule text in **1/19** is not required for release.
3. **Minimum acceptance-test hygiene** — **11**, exact decoded provenance; **5**, source setup; **15**, bounded-memory QA; **6**, targeted regression controls; brief documentation for **9/50**. **6-11 hours + one pre-ff**. Exclude the architecture rewrite, V1 cleanup and mass execution of all 390 entries.

Combined: **21-35 hours of active work**, with each feature reviewed and accepted separately. Import and card-text improvements can ship independently. Waiting for friends' real exports or the full official Codex, and the larger maintenance tail, should not conceal a major pre-release rewrite.

## Corrections to the original backlog wording

- **1/19:** the listed 6/4/etc. counts refer to clauses, not that many distinct rules. Their effects already execute.
- **17:** the current 997 ROSTER/FIELD occurrences include repeated layers/copies. They cannot be directly compared with the old 189 or called 997 defects. Named exact cases were checked; Sorrowsyphon +1 Damage separately works.
- **18:** 250 document identities, 241 existing named local documents and nine unnamed metadata cases. The 89,829 repeated sourceRef occurrences are not 89,829 independent errors.
- **21:** 15 old book-owned MFM sources are already historical; two allied CSM v1.5 authorities remain. `VERIFIED_CURRENT` is not the same axis as lifecycle `CURRENT`.
- **22:** old points files have retained capture/parity producer consumers, not only tests.
- **24:** 37 original DG RAW pages are already tracked; 37/37 SHA values match accepted enrollment and corpus entries.
- **31:** the current specific Terminator Assault Squad fixture is READY. The missing original cloud input prevents explaining that historical failure.
- **34:** the legacy 101-entry BSData `requires-codex-verification` flag must not be assigned to the 85 current native datasheets. A separate complete Codex comparison is still missing.
- **36:** semantic-text-only pins were not implemented; Core B re-pinned full-content hashes.
- **37:** the append-only registry is an accepted design, and binding loss was fixed. Current counts: 19,286 bindings / 10,168 contexts.
- **39:** 539 test-like modules = 513 test candidates + 26 helpers/utilities. 513 = 111 direct queue + 10 actually executed through imports/integration calls + two producer tests + 390 outside. The 33 concrete removed-input readers are not automatically 33 wholly dead tests.
- **40:** 15 contracts / 29 oracles, with two absent mapped paths. The old 119 deviations were aggregate results reused across nine books, not 119 independently diagnosed gameplay defects.
- **42:** 282,687,675 bytes is the entire runtime package, not the initial download or mandatory precache. Glossary JSON 31.20 MB and JS 23.23 MB have different live consumers.
- **46:** Prey on the Weak has two genuine bullet points. A redundant heading dash was absent even at `61e7c870`.
- **51:** 47 remote heads / 45 codex heads; 43 merged feature candidates. `codex/translate-3-sources@874f3ccb` is not merged. No deletion was authorized.
- **52:** 14 check aliases; `generated:check` is already queued, glossary production is covered and three of four `source:check` leaves are queued.
- **53:** all eight native Python outputs/read-checks already use bytes. Fifteen legacy/source writer files with 19 `write_text` calls remain.

## Supporting static inventories

### Queue coverage and architecture

The test-like inventory includes tracked MJS/CJS/JS/Python files under test directories or with QA/test/spec names. Helpers/fixtures are separated. A file imported only for a fixture is not considered executed: `personal-datasheet-qa` still has an unexecuted main-only guard. Ten other imported guards actually execute on import or through the integration call.

Of the 390 outside-queue candidates, 88 have browser-oriented names and 31 are Python. Thirty-three have verified removed-input reads or retired page entrypoints; a wider legacy-token list contains deliberate deny lists and is not a dead-test classification. A first classification/repair pass is estimated at 8-16 h, separate from the estimated 3-8 h sequential run. No guaranteed upper bound exists while nested wrappers lack a common timeout.

The architecture wrapper runs 29 mapped scripts once and reuses global contract bucket results across nine books, except dependency NOT_APPLICABLE. Only source-enrollment and source-ingestion-contract QA are direct queue jobs. Two mappings are missing: `tests/glossary-output-ownership-qa.mjs` and `tests/offline-mobile-routes-qa.mjs`. Neither 0/15 nor 119 deviations was remeasured at this base.

Eight mixed tests contain live guarantees that must survive any V1 separation:

| Test | Live assertion to preserve | Obsolete consumer/input |
| --- | --- | --- |
| `tests/canonical-join-architecture-qa.mjs` | Exact IDs, ambiguity, scope, parent/child identity | Line 17 imports deleted CSM compatible builder; line 73 V1 catalogs. |
| `tests/effect-contract-ownership-qa.mjs` | Effect inventory, unknown owner/operation/selector and mutation refusals | Line 35 V1 roster-data/provider publication. |
| `tests/effect-provider-interpreter-equality-qa.mjs` | Interpreter values; port scenarios before retiring wrapper | Lines 21-33 V1 installed provider/reader/roster-data. |
| `tests/persistent-child-identity-qa.mjs` | Source-child rename/text/reorder refusal | Lines 35/44 deleted V1 catalogs. |
| `tests/roster-base-stat-ownership-qa.mjs` | Poisoned derived stat versus canonical value; profile integrity | Lines 16/49 V1 roster-data/context. |
| `tests/roster-fixtures-qa.mjs` | Canonical rename and physical effect isolation | Lines 10/49/131 CSM roster-data, old guides/providers. |
| `tests/roster-gameplay-projection-ownership-qa.mjs` | Weapon/stat/tag/keyword partitions and exact profile direction | Lines 18/54 V1 catalog/provider. |
| `tests/stratagem-architecture-qa.mjs` | Exact scoped/inherited IDs and count-preserving poison | Line 76 removed target-data. |

`final-architecture-ownership-qa` also references removed V1 surfaces, while its Core source-identity checks remain valuable. Native publication/rendered/generated-output ownership checks must not be deleted merely because an aggregate maps them. Architecture remediation is estimated once at 16-24 h across items 3/39/40/52.

### The 14 check aliases

This compares exact standalone leaves, not merely similar invariants. A producer covered by the byte-rebuild gate does not mean every standalone test with a similar name was run.

| Alias | Leaves | Exact queued leaves | Producer coverage in rebuild gate |
| --- | ---: | ---: | ---: |
| `source:check` | 4 | 3 | 0 |
| `tau:sources:check` | 6 | 0 | 0 |
| `blood-angels:extract:check` | 3 | 0 | 0 |
| `points:check` | 3 | 0 | 0 |
| `glossary:check` | 1 | 0 | 1 |
| `generated:check` | 1 | 1 | 0 |
| `cache:check` | 1 | 0 | 0 |
| `wiring:check` | 1 | 0 | 0 |
| `architecture:check` | 1 | 0 | 0 |
| `army-books:check` | 3 | 0 | 0 |
| `army-books:sources:check` | 17 | 3 | 1 |
| `gw-update:check` | 1 | 0 | 0 |
| `glossary:v2:check` | 1 | 0 | 1 |
| `publication:check` | 3 | 0 | 0 |

`tests/mfm-numeric-ownership-qa.mjs` is not a direct queue job; `points:check` starts with a retired V1 catalog producer. `cache:check` examines a committed release seed, whereas package tests regenerate and verify the actual stamp. Connect current numeric/publication/wiring leaves selectively rather than all aggregates. The external BSData prerequisite must remain authenticated.

## Detailed evidence by item

### Item 1

- `books/shared/roster-v2/conditional-policy.mjs:157`
- `books/shared/army-book-app-v2/datasheet-v1.mjs:565`
- `v2/fixtures/detachment-card-text.json:491`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/display-import/EXECUTABLE_DETACHMENT_COUNTS.json`

UI scenarios: `p1-p19-death-blow`. Exact input provenance and source text are retained in `UI_SCENARIOS.json` / `UI_EXTRA_SCENARIOS.json` and per-book `native/*.json`.

Representative screenshot paths (not uploaded):

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p1-p19-death-blow-parsed-unit-1-390-top.png`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p1-p19-death-blow-parsed-unit-1-1440-top.png`

### Item 2

- `books/adeptus-mechanicus/v2/contract-datasheet-army-declarations.json:4600`
- `books/chaos-space-marines/v2/contract-datasheet-army-declarations.json:5465`
- `books/chaos-space-marines/v2/contract-datasheet-army-declarations.json:13408`
- `books/death-guard/v2/rule-contract-enhancements.mjs:61`
- `books/shared/roster-v2/attached-rule-text.mjs:100`

UI scenarios: `p2-network-override`, `p2-sorrowsyphon`, `p2-malign-sacrifice`, `p2-brutal-example`. Exact input provenance and source text are retained in `UI_SCENARIOS.json` / `UI_EXTRA_SCENARIOS.json` and per-book `native/*.json`.

Representative screenshot paths (not uploaded):

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p2-network-override-parsed-unit-2-390-top.png`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p2-network-override-parsed-unit-2-1440-top.png`

### Item 3

- `tests/architecture-conformance-gate.mjs:9–14,27–44`
- `tests/helpers/architecture-behavioral-oracles.mjs:5–22`
- `tests/canonical-join-architecture-qa.mjs:17,73`
- `tests/stratagem-architecture-qa.mjs:76`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/infra/STATIC_INVENTORY.json`

### Item 4

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/tests/item04-shell/OBSERVATION.json`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/tests/item04-shell/trace-desktop.zip`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/tests/item04-shell/trace-phone.zip`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/tests/item04-chrome/RESULTS.json`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/tests/item04-chrome/trace-390.zip`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/tests/item04-chrome/trace-1440.zip`
- `books/shared/application-v2/runtime.mjs:200`
- `books/shared/army-book-app-v2/runtime.mjs:79`
- `books/shared/army-book-app-v2/roster.mjs:91`

Representative screenshot paths (not uploaded):

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/tests/item04-chrome/390.png`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/tests/item04-chrome/1440.png`

### Item 5

- `node tests/sm-authenticated-bsdata-argument-binding-qa.mjs`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/tests/05-sm-bsdata.log`
- `books/space-marines/sources/bsdata-extract.config.json:11–12,51–63`
- `books/space-marines/tools/extract-faction-pack.mjs:12–21,81–84`
- `tests/sm-authenticated-bsdata-argument-binding-qa.mjs:40–46`

### Item 6

- `v2/unit-recipient-scope-qa.mjs:9–52`
- `v2/dg-am-recipient-enrollment-browser-qa.mjs:19–22`
- `docs/audit/sm-da-recipient-gaps-v1.md:262`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/infra/pre-ff-plan.json`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/infra/quick-all-plan.json`

### Item 7

- `node books/tau-empire/v2/roster-import-qa.mjs`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/tests/07-tau-roster.log`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/TEST_RUNS.json`
- `books/tau-empire/v2/roster-import-qa.mjs`

### Item 8

- `.gitignore:13–14`
- `books/shared/tools/check-generated-rebuild.mjs:42`
- `books/shared/tools/book-update.mjs:90`
- `books/shared/official-updates-v1/bridge.py:19`
- `git show 0365e925dd127753ba827d3fa7a37856d579be2b`

### Item 9

- `tools/qa-queue.mjs:12–14`
- `docs/codex/QA_MATRIX.md:5–12`
- `package.json:qa:tyranids`

### Item 10

- `node books/blood-angels/v2/roster-qa.mjs`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/tests/10-ba-roster.log`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/TEST_RUNS.json`

### Item 11

- `npm run qa:glossary`
- `glossary/v2/tests/ability-category-qa.mjs:67`
- `glossary/v2/tests/ability-category-qa.mjs:106`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/tests/11-qa-glossary.log`

### Item 12

- `books/shared/tools/generated-rebuild-plan.mjs:22–27,46–52`
- `tools/qa-queue.mjs:68`
- `books/shared/tools/check-generated-rebuild.mjs:42,61–85`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/infra/STATIC_INVENTORY.json`

### Item 13

- `package.json:15`
- `books/shared/points/build.mjs:39–46`
- `books/shared/points/effective-catalog.mjs:13`
- `books/shared/tools/generated-rebuild-plan.mjs:42–43`
- `books/shared/tools/render-structured-effective-book.mjs:251`
- `books/death-guard/tools/presentation-hook.mjs:84`

### Item 14

- `books/space-marines/tools/build-related-rules.mjs:16–22`
- `books/space-marines/sources/space-marines-related-rules-contracts.v1.json`

### Item 15

- `node books/death-guard/v2/enhancement-owner-qa.mjs`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/tests/15-dg-enhancement-owner.log`
- `books/death-guard/v2/enhancement-owner-qa.mjs`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/infra/OUTSIDE_TESTS.txt`

### Item 16

- `books/tyranids/v2/rule-contract-build.mjs`
- `books/tyranids/v2/text-rule-review.json`
- `books/emperors-children/v2/rule-contract-build.mjs`
- `books/emperors-children/v2/text-rule-review.json`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/data/CURRENT_NATIVE_INVENTORY.json`

UI scenarios: `p48-broodlord`, `p16-ec-coverage`, `p48-weapon-source`. Exact input provenance and source text are retained in `UI_SCENARIOS.json` / `UI_EXTRA_SCENARIOS.json` and per-book `native/*.json`.

Representative screenshot paths (not uploaded):

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p48-broodlord-parsed-unit-1-390-top.png`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p48-broodlord-parsed-unit-1-1440-top.png`

### Item 17

- `books/shared/roster-v2/condition-context.mjs:16–24`
- `books/shared/roster-v2/condition-computations.mjs:35`
- `books/shared/rule-contract-v2/conditions.mjs:368`
- `books/shared/rule-contract-v2/conditions.mjs:385`
- `books/shared/rule-contract-v2/conditions.mjs:406`
- `books/shared/rule-contract-v2/conditions.mjs:489`
- `books/chaos-space-marines/v2/roster-effect-build.mjs:177`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/data/ROSTER_CONDITION_COUNTS.json`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/data/CURRENT_NATIVE_INVENTORY.json`

UI scenarios: `p2-network-override`, `p2-sorrowsyphon`, `p2-malign-sacrifice`, `p2-brutal-example`. Exact input provenance and source text are retained in `UI_SCENARIOS.json` / `UI_EXTRA_SCENARIOS.json` and per-book `native/*.json`.

Representative screenshot paths (not uploaded):

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p2-network-override-parsed-unit-2-390-top.png`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p2-network-override-parsed-unit-2-1440-top.png`

### Item 18

- `books/shared/source-refs-v2/source-registry.mjs:38`
- `books/shared/source-refs-v2/source-refs.mjs:133`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/data/CURRENT_UNRESOLVED_SOURCE.json`

### Item 19

- `books/shared/roster-v2/conditional-policy.mjs:157`
- `books/shared/army-book-app-v2/datasheet-v1.mjs:565`
- `v2/fixtures/detachment-card-text.json:491`

UI scenarios: `p1-p19-death-blow`, `p19-hypervirulent`. Exact input provenance and source text are retained in `UI_SCENARIOS.json` / `UI_EXTRA_SCENARIOS.json` and per-book `native/*.json`.

Representative screenshot paths (not uploaded):

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p1-p19-death-blow-parsed-unit-1-390-top.png`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p1-p19-death-blow-parsed-unit-1-1440-top.png`

### Item 20

- `books/shared/army-book-app-v2/datasheet-v1.mjs:890–897`
- `books/shared/army-book-app-v2/personal.mjs:531`
- `books/chaos-space-marines/v2/roster-effect-build.mjs:178`
- `books/shared/roster-v2/condition-computations.mjs:42–47`
- `books/shared/army-book-app-v2/roster.mjs:718`
- `books/shared/roster-v2/runtime.mjs:147`
- `books/shared/roster-v2/context.mjs:247–257`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/native/chaos-space-marines.json`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui-extra/RESULTS.json`

UI scenarios: `p20-ec-wargear`, `p20-fabius-initial`, `p20-fabius-source`. Exact input provenance and source text are retained in `UI_SCENARIOS.json` / `UI_EXTRA_SCENARIOS.json` and per-book `native/*.json`.

Representative screenshot paths (not uploaded):

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui-retry/p20-ec-wargear-390.png`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui-retry/p20-ec-wargear-1440.png`

### Item 21

- `books/chaos-space-marines/sources/source-manifest.json:222–263`
- `books/chaos-space-marines/sources/source-manifest.json:368–397`
- `tests/source-ingestion-contract-qa.mjs:31–58`
- `tests/csm-allied-mfm-dependencies-qa.mjs:3–5`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/data/MFM_SOURCE_LIFECYCLE.json`

### Item 22

- `books/tyranids/content/tyranids-points.en.json`
- `books/tau-empire/content/tau-empire-points.en.json`
- `books/tyranids/tools/extract-codex-parity.cjs:6`
- `books/tyranids/tools/extract-codex-parity.cjs:41`
- `books/tau-empire/tools/extract-codex-parity.cjs:6`
- `tests/source-ingestion-contract-qa.mjs:74`

### Item 23

- `mfm/sources/v1.6/space-marines.json:/detachments/17`
- `books/blood-angels/v2/mfm-boundary.json:1327–1364`
- `books/blood-angels/v2/mfm-qa.py:227–239`

UI scenarios: `p23-ba-stormlance`, `p23-stormlance-cost`. Exact input provenance and source text are retained in `UI_SCENARIOS.json` / `UI_EXTRA_SCENARIOS.json` and per-book `native/*.json`.

Representative screenshot paths (not uploaded):

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p23-ba-stormlance-390.png`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p23-ba-stormlance-1440.png`

### Item 24

- `books/death-guard/v2/sources/source-enrollment.json:normalizationEvidence`
- `books/death-guard/v2/sources/accepted-waha-pages/`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/data/DG_RAW_HASH_PROOF.json`

### Item 25

- `books/blood-angels/v2/app-build.mjs:36`
- `books/shared/army-book-app-v2/cosmetics.mjs:7`
- `v2/cards-cosmetics-browser-qa.mjs:57`

UI scenarios: `p45-blood-angels`. Exact input provenance and source text are retained in `UI_SCENARIOS.json` / `UI_EXTRA_SCENARIOS.json` and per-book `native/*.json`.

Representative screenshot paths (not uploaded):

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p45-blood-angels-390.png`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p45-blood-angels-1440.png`

### Item 26

- `books/tau-empire/v2/roster-import.mjs:77`
- `books/tau-empire/v2/roster-import.mjs:84`
- `books/shared/roster-v2/context.mjs:310`
- `v2/fixtures/csm-tau-recipient-gaps-v1-browser.json:711`

UI scenarios: `p26-explicit-no-weapons`, `p26-compact-no-model-rows`. Exact input provenance and source text are retained in `UI_SCENARIOS.json` / `UI_EXTRA_SCENARIOS.json` and per-book `native/*.json`.

Representative screenshot paths (not uploaded):

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p26-explicit-no-weapons-parsed-unit-2-390-top.png`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p26-explicit-no-weapons-parsed-unit-2-1440-top.png`

### Item 27

- `books/space-marines/v2/roster-source-corrections.json:343`
- `books/space-marines/v2/roster-source-corrections.json:401`
- `v2/wardens-source-binding-browser-qa.mjs:49`
- `v2/fixtures/wardens-contextual-source.txt:1`

UI scenarios: `p27-wardens`. Exact input provenance and source text are retained in `UI_SCENARIOS.json` / `UI_EXTRA_SCENARIOS.json` and per-book `native/*.json`.

Representative screenshot paths (not uploaded):

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p27-wardens-parsed-unit-1-390-top.png`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p27-wardens-parsed-unit-1-1440-top.png`

### Item 28

- `books/shared/tools/build-new-recruit-model-names.mjs:152`
- `books/shared/roster-v2/model-name-aliases.mjs:1`
- `v2/new-recruit-model-names-qa.mjs:46`
- `v2/fixtures/new-recruit-model-names-tournament-csm.json:1`

UI scenarios: `p28-csm-model-aliases`. Exact input provenance and source text are retained in `UI_SCENARIOS.json` / `UI_EXTRA_SCENARIOS.json` and per-book `native/*.json`.

Representative screenshot paths (not uploaded):

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p28-csm-model-aliases-390.png`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p28-csm-model-aliases-1440.png`

### Item 29

- `books/shared/roster-v2/parser.mjs:105`
- `books/shared/roster-v2/parser.mjs:116`
- `v2/fixtures/new-recruit-plain-header.json:1`

UI scenarios: `p29-extra-header-line`. Exact input provenance and source text are retained in `UI_SCENARIOS.json` / `UI_EXTRA_SCENARIOS.json` and per-book `native/*.json`.

Representative screenshot paths (not uploaded):

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui-retry/p29-extra-header-line-390.png`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui-retry/p29-extra-header-line-1440.png`

### Item 30

- `books/adeptus-mechanicus/v2/roster-import.mjs:39`
- `books/chaos-space-marines/v2/roster-import.mjs:6`
- `books/shared/roster-v2/import-service.mjs:76`
- `books/shared/roster-v2/import-service.mjs:81`

UI scenarios: `p30-foreign-header-adeptus-mechanicus`, `p30-foreign-header-death-guard`, `p30-foreign-header-chaos-space-marines`. Exact input provenance and source text are retained in `UI_SCENARIOS.json` / `UI_EXTRA_SCENARIOS.json` and per-book `native/*.json`.

Representative screenshot paths (not uploaded):

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p30-foreign-header-adeptus-mechanicus-390.png`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p30-foreign-header-adeptus-mechanicus-1440.png`

### Item 31

- `v2/fixtures/new-recruit-model-names.json:47`
- `v2/fixtures/new-recruit-model-names.json:170`
- `v2/new-recruit-model-names-qa.mjs:24`

UI scenarios: `p31-assault-terminators`. Exact input provenance and source text are retained in `UI_SCENARIOS.json` / `UI_EXTRA_SCENARIOS.json` and per-book `native/*.json`.

Representative screenshot paths (not uploaded):

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p31-assault-terminators-parsed-unit-1-390-top.png`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p31-assault-terminators-parsed-unit-1-1440-top.png`

### Item 32

- `books/shared/roster-v2/context.mjs:9`
- `books/shared/roster-v2/import-service.mjs:92`
- `books/shared/roster-v2/import-service.mjs:97`
- `books/shared/army-book-app-v2/roster.mjs:259`

No defect screenshot can be produced without the missing original backup/export. This is not evidence that a fresh fixture reproduces the old issue.

### Item 33

- `v2/fixtures/new-recruit-plain-header.json:1`
- `v2/fixtures/new-recruit-model-names-tournament-csm.json:1`
- `books/blood-angels/v2/app-build.mjs:36`

No defect screenshot can be produced without the missing original backup/export. This is not evidence that a fresh fixture reproduces the old issue.

### Item 34

- `books/space-marines/sources/source-manifest.json:37–55`
- `books/space-marines/v2/build.py:24–27`
- `books/space-marines/v2/sources/enrollment.json:6–10`
- `books/space-marines/v2/sources/enrollment.json:38–65`

### Item 35

- `books/shared/army-book-app-v2/runtime.mjs:517–524`
- `books/shared/army-book-app-v2/project.mjs:77`

UI scenarios: `p35-currentness`. Exact input provenance and source text are retained in `UI_SCENARIOS.json` / `UI_EXTRA_SCENARIOS.json` and per-book `native/*.json`.

Representative screenshot paths (not uploaded):

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p35-currentness-390.png`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p35-currentness-1440.png`

### Item 36

- `books/space-marines/v2/static-gameplay-qa.mjs:65–68`
- `books/blood-angels/v2/conditional-policy-declarations.mjs:15,17`
- `books/core-rules/tools/build_waha_core_corpus.py:301–314,382–399`
- `books/core-rules/content/effective-core-catalog.mjs:209`
- `books/core-rules/content/waha-core-source.mjs:114`

### Item 37

- `books/shared/source-refs-v2/source-refs.mjs:37–40`
- `tools/audit/build-source-catalog.mjs:26–59`
- `tools/audit/build-source-catalog.mjs:61–96`
- `tools/audit/build-source-catalog.mjs:157`
- `books/shared/tools/generated-rebuild-plan.mjs:35–38`

### Item 38

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/infra/pre-ff-plan.json`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/TEST_RUNS.json`
- `tools/qa-queue.mjs:29–91`

### Item 39

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/infra/STATIC_INVENTORY.json`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/infra/OUTSIDE_TESTS.txt`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/infra/VERIFIED_MISSING_INPUTS.json`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/infra/LEGACY_REFERENCE_CANDIDATES.json`
- `tools/qa-queue.mjs:29–91`

### Item 40

- `tests/architecture-conformance-gate.mjs:9–14,27–52`
- `tests/helpers/architecture-behavioral-oracles.mjs:5–22,59–63`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/infra/STATIC_INVENTORY.json`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/infra/CHECK_ALIAS_COVERAGE.json`

### Item 41

- `books/space-marines/book.config.json:96`
- `books/shared/tools/build-army-book.mjs:47–85`
- `books/death-guard/book.config.json:24`
- `books/death-guard/tools/canonical-source-adapter.mjs:194`
- `books/shared/tools/build-effective-book.mjs:62`
- `books/death-guard/v2/mfm-boundary-qa.mjs:47`
- `books/death-guard/v2/rule-contract-v1-inventory.json:5–7`

### Item 42

- `tools/pages-runtime-manifest.json:9745`
- `tools/pages-runtime-manifest.json:9897`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/data/PAYLOAD_BYTES.json`
- `README.md:37`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/tests/42-runtime-package.log`

UI scenarios: `p35-currentness`. Exact input provenance and source text are retained in `UI_SCENARIOS.json` / `UI_EXTRA_SCENARIOS.json` and per-book `native/*.json`.

Representative screenshot paths (not uploaded):

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p35-currentness-390.png`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p35-currentness-1440.png`

### Item 43

- `books/shared/army-book-app-v2/effective-datasheet-presentation.mjs:20`
- `books/shared/army-book-app-v2/effective-datasheet-presentation.mjs:95`
- `books/shared/army-book-app-v2/personal.mjs:68`
- `books/shared/army-book-app-v2/personal.mjs:116`
- `v2/card-display-2-browser-qa.mjs:36`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui-extra/RESULTS.json`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/UI_OBSERVATIONS.json`

UI scenarios: `p43-lion-candidate`, `p43-emperors-children-elegant`, `p43-death-guard-flyblown`, `p26-compact-no-model-rows`, `p43-lion-composition`. Exact input provenance and source text are retained in `UI_SCENARIOS.json` / `UI_EXTRA_SCENARIOS.json` and per-book `native/*.json`.

Representative screenshot paths (not uploaded):

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p43-lion-candidate-parsed-unit-2-390-top.png`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p43-lion-candidate-parsed-unit-2-1440-top.png`

### Item 44

- `books/tyranids/v2/text-rule-review.json:1333`
- `books/shared/army-book-app-v2/roster.mjs:474`
- `books/shared/army-book-app-v2/roster.mjs:600`
- `books/shared/army-book-app-v2/route-context-synthetic-browser-qa.mjs:188`

### Item 45

- `books/shared/army-book-app-v2/cosmetics.mjs:2`
- `books/shared/army-book-app-v2/roster.mjs:164`
- `books/shared/army-book-app-v2/roster.mjs:368`
- `v2/cards-cosmetics-browser-qa.mjs:57`

UI scenarios: `p45-blood-angels`, `p45-dark-angels`, `p45-import-adeptus-mechanicus`, `p45-import-blood-angels`, `p45-import-dark-angels`, `p45-import-chaos-space-marines`, `p45-import-death-guard`, `p45-import-emperors-children`, `p45-import-space-marines`, `p45-import-tau-empire`, `p45-import-tyranids`. Exact input provenance and source text are retained in `UI_SCENARIOS.json` / `UI_EXTRA_SCENARIOS.json` and per-book `native/*.json`.

Representative screenshot paths (not uploaded):

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p45-blood-angels-390.png`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p45-blood-angels-1440.png`

### Item 46

- `v2/cards-cosmetics-browser-qa.mjs:110`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/display-import/COSMETIC_SOURCE_PROOF.json`

UI scenarios: `p46-prey`. Exact input provenance and source text are retained in `UI_SCENARIOS.json` / `UI_EXTRA_SCENARIOS.json` and per-book `native/*.json`.

Representative screenshot paths (not uploaded):

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui-retry/p46-prey-390.png`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui-retry/p46-prey-1440.png`

### Item 47

- `books/shared/army-book-app-v2/datasheet-v1.css:221`
- `books/shared/army-book-app-v2/datasheet-v1.css:231`
- `v2/cards-cosmetics-browser-qa.mjs:79`

UI scenarios: `p47-melee`. Exact input provenance and source text are retained in `UI_SCENARIOS.json` / `UI_EXTRA_SCENARIOS.json` and per-book `native/*.json`.

Representative screenshot paths (not uploaded):

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p47-melee-parsed-unit-1-390-top.png`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p47-melee-parsed-unit-1-1440-top.png`

### Item 48

- `books/shared/army-book-app-v2/cosmetics.mjs:50`
- `books/shared/army-book-app-v2/datasheet-v1.mjs:187`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/display-import/COSMETIC_SOURCE_PROOF.json`

UI scenarios: `p48-broodlord`, `p48-weapon-source`. Exact input provenance and source text are retained in `UI_SCENARIOS.json` / `UI_EXTRA_SCENARIOS.json` and per-book `native/*.json`.

Representative screenshot paths (not uploaded):

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p48-broodlord-parsed-unit-1-390-top.png`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p48-broodlord-parsed-unit-1-1440-top.png`

### Item 49

- `books/space-marines/v2/recipient-declarations.json:100`
- `books/space-marines/v2/recipient-declarations.json:102`
- `books/shared/roster-v2/attached-rule-text.mjs:46`
- `books/shared/roster-v2/attached-rule-text.mjs:116`

UI scenarios: `p49-titus-whole-block`. Exact input provenance and source text are retained in `UI_SCENARIOS.json` / `UI_EXTRA_SCENARIOS.json` and per-book `native/*.json`.

Representative screenshot paths (not uploaded):

- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p49-titus-whole-block-parsed-unit-2-390-top.png`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/ui/p49-titus-whole-block-parsed-unit-2-1440-top.png`

### Item 50

- `AGENTS.md:42–43`
- `tools/PAGES_RUNTIME_RELEASE.md:25,27,34`

### Item 51

- `git ls-remote --heads https://github.com/XYPMApwnz/warhammer-rules-complete-preview.git`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/infra/GITHUB_BRANCHES.json`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/infra/github-heads.txt`

### Item 52

- `package.json:scripts`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/infra/CHECK_ALIAS_COVERAGE.json`
- `tools/qa-queue.mjs:52–91`
- `books/shared/tools/generated-rebuild-plan.mjs:32–43`

### Item 53

- `books/chaos-space-marines/v2/build.py:437–441`
- `books/space-marines/v2/build.py:448–452`
- `books/adeptus-mechanicus/tools/extract-faction-pack.py:51–57`
- `books/blood-angels/tools/extract-faction-pack.py:248–258`
- `books/shared/tools/check-generated-rebuild.mjs:15–21`
- `docs/TRACKER.md:Python generator line endings on Windows`
- `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/infra/PYTHON_EOL_WRITERS.json:15files/19calls`



## Retained artifacts and reproduction

All paths in this section are relative to `E:/Warhammer/qa-evidence/backlog-triage-v1-2026-11-13/`, unless a different absolute path is shown. They were not uploaded with this document.

- `TRIAGE.json`: 53 structured rows, original proofs and screenshot associations.
- `infra/SUPPORTING.md`: static queue coverage, eight mixed oracles, 14 check aliases, branch inventory and run estimates.
- `data/REPORT.md`: native census, MFM lifecycle, RAW/source/payload evidence.
- `display-import/supporting.md`: exact import and text-presentation boundaries and inputs.
- `TEST_RUNS.json` and `tests/*.log`: exact commands, wall times, exit codes, clean-tree checks and unabridged output.
- `native/*.json`: current read-only observations across nine books, including source text and controls. `NATIVE_PROBES.json` records per-book subprocess results.
- `UI_SCENARIOS.json`, `UI_EXTRA_SCENARIOS.json`, `fixtures/`: frozen input scenarios and their fixture provenance.
- `UI_OBSERVATIONS.json`, `ui-extra/RESULTS.json`, `SCREENSHOTS.md`: merged successful observations and screenshot index.
- `reproduction/`: external scripts and the original request; these scripts were not added to the repository. Rebuild the temporary runtime using the package command in `TEST_RUNS.json` before repeating UI observations.
- `REVIEW_CHECKS.json`: completeness and local evidence-link checks; `FINAL_STATE.json`: final audit SHA, clean tree, unchanged GitHub source and cleanup status.

The original audit ended with the branch at the base and no commits. This publication adds only the requested English review document. No backlog fixes are included, and no full generated gate or pre-ff is newly claimed.

The automatic approval review rejected deletion of `E:/Warhammer/qa-tmp/backlog-triage-v1/`. The temporary runtime/helpers remain for the owner; no alternative deletion was attempted. Reproduction scripts were copied into the evidence directory before that cleanup attempt.

**STOP: review inventory only. Follow-up tasks require separate implementation authorization.**
