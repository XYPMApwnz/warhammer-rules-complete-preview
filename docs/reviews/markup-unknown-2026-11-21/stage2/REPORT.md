# Approved UNKNOWN markup closures — stage 2

Status: **READY_FOR_REVIEW**. Feature: `codex/markup-unknown-v1` at `8579a7a77c7f5e8dad291afc11b27aab3cd9d73a`, one implementation commit from source `6f2e5fb23643fc0041efcd7006f3e150bd5ce4be`. No source FF, merge, release/Pages/main update or runtime deployment is part of this task. Stage 1 and its 171-entry proposal remain in this evidence branch unchanged; this stage adds one evidence commit. [Stage-1 report](../REPORT.md), [approved complete table](../PROPOSALS.md), [CSV](../proposals.csv).

## Exact approved result

| Category | Before | After |
| --- | --- | --- |
| EXECUTED | 812 | 812 |
| RECIPIENTS_ONLY | 1478 | 1478 |
| TEXT_ONLY_INTENDED | 263 | 419 |
| GAP | 0 | 0 |
| UNKNOWN | 171 | 15 |

N stays **2,724**; partial stays **126**. Resolved changes from 2,553/2,724 (93.72%) to 2,709/2,724 (99.45%). This is resolved annotation intent, not an assertion that all semantics are automated. Active debt changes 171 → 15; historical debt remains 217 original entries with 202 separately evidenced closures (the previous 46 plus these 156).

| Book | EXECUTED before → after | RECIPIENTS_ONLY before → after | TEXT_ONLY_INTENDED before → after | GAP before → after | UNKNOWN before → after |
| --- | --- | --- | --- | --- | --- |
| adeptus-mechanicus | 68 → 68 | 126 → 126 | 21 → 21 | 0 → 0 | 0 → 0 |
| blood-angels | 150 → 150 | 176 → 176 | 19 → 63 | 0 → 0 | 47 → 3 |
| chaos-space-marines | 78 → 78 | 239 → 239 | 34 → 34 | 0 → 0 | 1 → 1 |
| dark-angels | 146 → 146 | 185 → 185 | 14 → 63 | 0 → 0 | 52 → 3 |
| death-guard | 40 → 40 | 135 → 135 | 45 → 46 | 0 → 0 | 1 → 0 |
| emperors-children | 32 → 32 | 127 → 127 | 27 → 27 | 0 → 0 | 0 → 0 |
| space-marines | 164 → 164 | 211 → 211 | 12 → 74 | 0 → 0 | 68 → 6 |
| tau-empire | 105 → 105 | 102 → 102 | 40 → 40 | 0 → 0 | 0 → 0 |
| tyranids | 29 → 29 | 177 → 177 | 51 → 51 | 0 → 0 | 2 → 2 |

The implementation matches the approved table exactly: **156 UNKNOWN → TEXT_ONLY_INTENDED**, no new RECIPIENTS_ONLY or EXECUTED. 135 rules use the exact battlefield owner-only reason and physical owner scope. The other 21 retain their approved distinct bases: three muster/mandatory-WARLORD statements and 18 army/detachment process references. They do not acquire a unit-owner-only scope. Of the 12 stage-1 boundary flags, **11** are among the approved text-only closures; **Regenerating Monstrosity remains UNKNOWN**, as explicitly required by the exact remaining-15 list. Battle choices are not permanently assigned to Bodyguards from attachment.

## Implementation and immutable debt

- `decisions.v1.json`: exactly 156 category/reason/evidence/scope changes, with source fields, source fingerprints, binding proof, operations and partial markers preserved. No other decision row changes. [Migration details](MIGRATION.json).
- `closures.v1.json`: exactly 156 named UNKNOWN closures, each linked to a test and the exact source-bound review fixture. Existing 46 closures remain unchanged. The original `debt-baseline.v1.json` and the 15 retained active debt records are unchanged, including their original historical reasons/next-step values.
- `unknown-review.v1.json`: all 171 approved source identities, source/binding fingerprints, clauses, reasons, physical scopes and detailed next steps. An ordered semantic SHA-256 pin binds the exact review without needing a sibling evidence commit available as a Git object. Approval fingerprint: `62a06e9993572596f3385baef5445705091ce26f6f30d1aaa2a66cef2ffe2375`. The full report JSON and Markdown expose the approved current next steps as a validated overlay, alongside the historical values; the old immutable baseline is not repinned.
- The new strict closure-evidence adapter accepts only this review schema, exact approved identities and matching current source/field/clause/scope/binding. The existing 45-entry owner-only and recipient-enrollment adapters remain unchanged. `checkMarkup` additionally passes its already-validated binding fingerprint to fixture verification.
- `tests/markup-unknown-qa.mjs` contains the exact named canonical identities, exercises all 156 closures and all 15 remaining records, and checks source-fingerprint equality and owner isolation. It runs as one added sequential pre-FF job; the focused run took 11.07 seconds, so it was not added to quick. All former pre-FF jobs and their order are unchanged: 202 → 203. Docs describe the review and follow-up workflow.

## Remaining named UNKNOWN debt

These are the approved **Next step** values. They are source-fingerprinted, validated against the exact remaining historical IDs and displayed by `markup:census -- --report=<path>`; they are not substituted into the immutable baseline.

| Book | Canonical ID / name | Approved next step |
| --- | --- | --- |
| blood-angels | army-rule-sm-a3907d06530b419a — Librarius | Record explicit source-backed stable-ID bindings from each accepted native unit ability occurrence to canonical Librarius, including exact source field/anchor and provenance. Then validate the eligible physical unit set and add a consumed textual recipient path preserving levels and battle-round limits. Do not join by runtime title, tooltip label or PSYKER keyword alone. |
| blood-angels | army-rule-sm-fcdb8cd8bb5f40dd — Combat Doctrines | Record explicit source-backed stable-ID bindings from accepted native unit ability occurrences to canonical Combat Doctrines, including exact source field/anchor and provenance; prove eligible physical membership before recording presentation recipients. Preserve doctrine activation and timing as text, and do not use runtime name matching or assume every ADEPTUS ASTARTES unit has the ability. |
| blood-angels | detachment-rule-dw-b41deacc51464866 — Mission Tactics | Establish explicit accepted source-backed stable-ID membership bindings between exact Deathwatch unit ability occurrences and Mission Tactics, preserving selected Deathwatch Support scope. Separate combat-recipient clauses from allied muster/WARLORD/Enhancement restrictions, then add only proven textual recipients with doctrine/range conditions intact. Do not use runtime titles, a guessed tooltip join or all-KILL-TEAM fallback. |
| chaos-space-marines | army-rule-cult-of-the-dark-gods — Cult of the Dark Gods | Trace/enroll exact accepted canonical allied datasheet identities and physical inclusion selections; prove how each source Faction keyword is removed and HERETIC ASTARTES is represented in the actual faction-keyword channel using existing operations if semantically supported. Preserve muster caps as text unless already consumed elsewhere. Split scoped clauses before any execution proposal; do not invent an operation or legal-assessment feature. |
| dark-angels | army-rule-sm-a3907d06530b419a — Librarius | At the Space Marines factual owner, bind the three Librarius source-declaration references explicitly to this army rule and source-specified PSYKER levels. Review eligible selected-army text presentation without a new psychic-round budget executor; reconcile DA/BA inheritance. |
| dark-angels | army-rule-sm-fcdb8cd8bb5f40dd — Combat Doctrines | At the Space Marines factual owner, bind the eighty-three Combat Doctrines source-declaration references explicitly to this army rule, keeping exact ADEPTUS ASTARTES with-this-ability eligibility. Review selected-army presentation and leave active doctrine, duration and use limits conditional; reconcile DA/BA inheritance. |
| dark-angels | detachment-rule-dw-b41deacc51464866 — Mission Tactics | Verify accepted Deathwatch Support eligibility in the native DA inheritance and source-owned KILL TEAM with-this-ability identity set; separate Deathwatch Allies formation clauses from tactics, then propose only exact selected-detachment recipients. No live-source refresh or new battle automation. |
| space-marines | ability-sm-2b6f674af70b4f2a — Thunderhawk Insertion | Review a source-backed exact physical UNIT choice path for this datasheet ability, including duplicate-unit isolation and saved choice provenance. Existing UNIT_RECIPIENTS choice validation currently accepts ENHANCEMENT sources only; do not nominate a receiver until a supported scoped binding is established. |
| space-marines | ability-sm-606c484717d94d0d — Captain of the Honour Guard | Establish a reviewed canonical attribution from this exact ability ID to the existing ARMY_UNIT_PRESENT inverse Leader/Support policies and confirm whether census can consume enforced-permission evidence. Keep current role execution unchanged; do not create an unconditional Support grant. |
| space-marines | ability-sm-e107e7f8794643c0 — Cerebrex Logic Engine | Review a source-backed exact physical UNIT choice path for Scouts and this datasheet ability, preserving the 6-inch parameter and physical choice provenance. Existing UNIT_RECIPIENTS support is Enhancement-only; do not infer a chosen receiver. |
| space-marines | army-rule-sm-a3907d06530b419a — Librarius | Establish a reviewed explicit stable-ID/source binding from each applicable accepted UNIT rule reference to this exact Librarius identity, with accepted source evidence resolving its tooltip/href identity. Then bind only proven physical ADEPTUS ASTARTES PSYKER units with this ability for text presentation; preserve source-specific levels and round limits without psychic-use automation. |
| space-marines | army-rule-sm-fcdb8cd8bb5f40dd — Combat Doctrines | Review explicit stable-ID/source bindings from accepted UNIT references to this exact Combat Doctrines identity before proposing Gained-rule recipients. Preserve doctrine choice, duration, once-per-battle limits, replacement and unit eligibility; use only source-proven physical receiver identities and do not activate any doctrine from a label match. |
| space-marines | detachment-rule-dw-b41deacc51464866 — Mission Tactics | Review explicit accepted source-to-canonical bindings for the Mission Tactics KILL TEAM ability references and the permitted native import membership. Establish a proven selected-Deathwatch-Support recipient path before adding Gained text; preserve the existing reference, allies/WARLORD/Enhancement restrictions and 500-point cap, without silently enrolling Deathwatch units or automating doctrine effects. |
| tyranids | datasheet-venomthropes:section:1#/blocks/0/text — Foul Spores (Aura) | Obtain an explicit accepted source adjudication for tyranids-source-conflict-foul-spores using the existing PDF page-20 update and page-21 FAQ, or a separately authorized source update. Until adjudicated retain UNKNOWN; after resolution apply owner-only policy without new aura execution or foreign Gained propagation. |
| tyranids | detachment-assimilation-swarm:enhancement:1 — Regenerating Monstrosity | Adjudicate regenerating-monstrosity-legacy-assertion and accepted plural-MONSTERS wording without rewriting the source or asserting an absent official correction. Then prove the selected physical bearer and exact formed-unit presentation path under principle 2, preserving phase limit as text and unknown battle state; no new regeneration operation. |


## Checks and negative controls

| Focused check | Result | Seconds |
| --- | --- | --- |
| unknown-review | PASS | 11.07 |
| census | PASS | 9.83 |
| existing-census | PASS | 12.20 |
| existing-evidence | PASS | 0.22 |
| existing-owner-only | PASS | 11.53 |

The new test detects **18 negative controls**. The unchanged census and owner-only suites also run their established controls; [CONTROLS.json](CONTROLS.json) lists all 62 detected mutations. New controls reject: missing/duplicate review IDs, changed source fingerprint/field/clause/binding, changed approval origin/authority, missing or substituted UNKNOWN next step, forged owner scope, absent current category, a mismatched decision, a foreign physical recipient, an executable path under text-only approval, and unclosed/forged debt or closure evidence. No test expectation is weakened.

| Existing test | Before | After | Reason |
| --- | --- | --- | --- |
| All existing tests / expectations | Unchanged | Unchanged | No test relocation or expectation edit was needed. Only the new exact-review QA module was added. |


## Product, generated and A/B parity

**148/148 generated files are byte-identical to base; 456/456 published runtime files are byte-identical.** Characteristics, weapon data, points, text, effects, execution conditions and presentation cannot differ within those identical bytes. [All file hashes and queue comparison](SCOPE_EQUALITY.json). No file was added to application startup, precache, cache revision or the runtime manifest. `unknown-review.mjs` is a Node QA tool, not a published application module.

Fresh sequential captures of both clean revisions using the accepted 199-fixture native harness: **199 rosters / 507 states; zero differences, no masking**. Both sides have 177 READY and 22 NEEDS_BINDINGS results. Complete decoded import, snapshot, projection, effective, related and points observations match byte-for-byte for all nine books. [A/B summary](ab/RESULTS.json). Raw owner exports and full captures stay external; they are not published in this evidence branch.

## One final full pre-FF

**203/203 PASS, 0 FAIL**, 103.52 minutes, exact SHA `8579a7a77c7f5e8dad291afc11b27aab3cd9d73a`. No additional full run was used and no implementation/test change followed it. The generated rebuild job passed as part of this run, in addition to the explicit file-byte scope comparison.

The final evidence includes the per-job status/timing summary, run SHA and generated rebuild result. It excludes private exports, accepted RAW snapshots, candidate runtime packages and browser profiles. The live release and preview remain unchanged. Temporary worktrees and QA files under `E:/Warhammer/qa-tmp/markup-unknown` are cleaned after publication; any blocked cleanup is reported separately in the final response. **FF is not performed.**
