# Markup debt closure and recipient audit — published before pre-FF

Status: **READY FOR INDEPENDENT AUDIT REVIEW; FULL PRE-FF PENDING**. Base `9efbd95f67c5e65bc62b477e36acf9d710ff4784`; implementation commit `50c9a9c89d8e66e0466dbeeabc918ec1d465c87f` on local branch `codex/markup-gap-close-v1`. This evidence branch is published in one documentation-only commit before the single full pre-FF, as requested. It is not to be merged. A pending full run is not PASS; its result will be delivered separately after execution. No fast-forward/source/main/release/Pages update is authorized or performed by this task.

## Owner decision and result

The2026-11-20 clarification applies **owner-only to UNIT/MODEL abilities and personal upgrades**. Actual ARMY_RULE and DETACHMENT_RULE sources belong to the army; eligible units of the selected army/Detachment retain the existing rule text. This resolves the earlier Panegyric ownership STOP without changing presentation. No rule-name exception is used.

All45 exact former GAP IDs are now **TEXT_ONLY_INTENDED**. They are the same IDs as the prior [45-GAP proposal table](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/blob/a594b2b19b0e654c774b33f7a3ca417a8b76790a/docs/reviews/markup-gate-2026-11-20/remaining-45-gaps.csv); no other source is recategorized. **39 OWNER_ONLY** (36ABILITY +3ENHANCEMENT); **6 ARMY_ELIGIBLE_RECIPIENTS** (5ARMY_RULE +1DETACHMENT_RULE). The dated review fixture pins exact kinds, source fingerprints/fields, clauses and presentation scope.

| Measure | Accepted base | This task |
| --- | ---: | ---: |
| N |2724|2724|
| EXECUTED |812|812|
| RECIPIENTS_ONLY |1478|1478|
| TEXT_ONLY_INTENDED |218|263|
| GAP |45|0|
| UNKNOWN |171|171|
| Partial |126|126|
| Resolved category |2508/2724 (92.07%)|2553/2724 (93.72%)|

Command: `npm run markup:census -- --check --report=<external.json|external.md>`. Current census **PASS**, **6.346s**. Coverage is a reviewed category metric, not full automation or policy-compliance certification.171UNKNOWN and126partial markers remain. [Per-book/kind63-row summary](markup-gap-close-2026-11-20/summary.csv); [complete census](markup-gap-close-2026-11-20/census.json); [all45 closures](markup-gap-close-2026-11-20/closed-45-rules.csv).

The historical217-item debt baseline is byte-identical. Active debt is the exact original171UNKNOWN entries;46closures consist of the unchanged earlier Insectile closure plus these45 dated decisions. Source/binding/capability proofs and source fingerprints remain unchanged. Only category/reason/evidence/presentationScope metadata changed for these45 IDs. No existing debt is silently rewritten.

## Owner-only guard and negative controls

`tools/markup-census/owner-only.mjs` checks physical foreign routes using actual native recipient diagnostics. It conservatively rejects newly admitted ATTACHED/F1/conditional/declaration/equipment/reference paths and shared canonical source-field leakage. Its necessary ATTACHED admission proof is bound to the exact actual projector and its private leaf helper; consumer changes require review. Later runtime gates can only reduce the conservatively admitted candidates. This is scoped implementation evidence, not a whole-output freeze or a duplicate game engine.

The army exception is determined by the **actual native kind** and an exact reviewed `presentationScope`. Native kind/identity validation occurs before the isolation guard. An ABILITY cannot escape by claiming ARMY_ELIGIBLE_RECIPIENTS or relabelling only its registry kind. Existing source/binding checks continue to apply to the6army-owned sources. No owner-only decision is automatically applied to the other current RECIPIENTS_ONLY/EXECUTED rules.

The new source-bound owner test is **PASS in8.222s**, with **28 detected negative controls**: real canonical UNIT/FORMED foreign route even after proof refresh; structured bearer-radius admission; foreign related target; F1; conditional/declaration/effect leakage; changed actual projector/private helper; missing diagnostics; changed/missing/forged scopes/kinds; wrong source/date/field/clause/authority; duplicate review identity; and false owner metadata. Positive controls retain physical-owner text and the exact existing Panegyric full F1 payload. Old16census mutation controls and29evidence controls also PASS unchanged.

Tome of Bounteous Blessings illustrates why graph declarations are not identical to current display: its2recorded ROLE links fail the actual admission forms, so no text propagates. Existing exact fixturecase38 imports READY, with the selected Tome; before/after attachment all foreign components have zero Tome attached text. No named Tome exemption is used.

Panegyric remains TEXT_ONLY_INTENDED. The current parent F1 route emits the whole Data-Psalm `/text`, including Panegyric; this is now explicitly allowed army-owned eligible-unit presentation. The parent clause's UNIT EFFECT_RECIPIENT relation is preserved, rather than relabelled as a physical-owner fact. The earlier strict-owner STOP and row-local positive logs are historical diagnostics, not the current result.

## Item2: current display, no fixes

[**RECIPIENT_AUDIT: full table**](markup-gap-close-2026-11-20/RECIPIENT_AUDIT.md) and [188-row CSV](markup-gap-close-2026-11-20/recipient-audit.csv) contain book, exact rule ID/kind/category, canonical owner, displayed recipient, existing roster/card witness, source fields/fingerprint and printed condition basis.

**158 physical cross-component routes** (123ABILITY,11WARGEAR_ABILITY,24ENHANCEMENT) are submitted for Claude/owner review. These are reproduced source-text routes, **not158automatically established violations**: attached components can belong to the same formed gameUNIT; a full rule can mix roster-known grants and battlefield-dependent paragraphs. Every individual source/condition is retained for review. No text has been removed, hidden, recategorized or repaired based on this table.

**30 selected-Detachment F1 routes** are allowed by the explicit army-owned clarification. They are a separate section and marked ARMY_OWNED_ELIGIBLE_RECIPIENT_ALLOWED in theCSV. They are not pending ownership conflicts.

| Book | Physical routes for review | Allowed selected-Detachment F1 | Total |
| --- | --- | --- | --- |
| adeptus-mechanicus | 14 | 5 | 19 |
| blood-angels | 5 |  | 5 |
| chaos-space-marines | 31 | 9 | 40 |
| dark-angels | 11 | 1 | 12 |
| death-guard | 23 | 1 | 24 |
| emperors-children | 3 | 3 | 6 |
| space-marines | 41 | 1 | 42 |
| tau-empire | 21 | 4 | 25 |
| tyranids | 9 | 6 | 15 |

Examples retained for individual review include Insectile Murmuration, Death Approaches/Icon of Despair, Sorrowsyphon's battle paragraph, Abaddon's auras and Node Lash's target-state paragraph. Their existing calculations and presentation are untouched; the user's decision explicitly defers display changes until owner review.

### Audit method and limitations

All **2290** accepted RECIPIENTS_ONLY/EXECUTED IDs were screened across nine books. [Per-ID dispositions](markup-gap-close-2026-11-20/all-rule-dispositions.csv) retain every ID, including negatives and unexercised candidates. The accepted native199/507 observations were supplemented by existing exact source-bound fixture replays:71/71READY inSM/BA/DA/AM/Tau;88/90READY inDG/CSM/EC/Tyranids. Two constructed text fixtures with INVALID imports were excluded as successful witnesses and did not trigger data changes. No new owner roster export was invented.

There remain **327** static/unexercised routes in the five-book audit and **22** legal formed plus **66** other declared/unexercised routes in the four-book audit. They remain NOT_REPRODUCED, not proof of current text transfer. Intrinsic Core definitions and Stratagem reference-menu eligibility are separately disposed. Another **19** observed constant roster-known grants are in [a separate appendix](markup-gap-close-2026-11-20/constant-roster-grants.csv), so manual die resolution alone is not silently treated as an unknown recipient-eligibility condition. The table is complete over the observed witnesses, not every possible legal physical roster scenario.

## Unchanged product outputs and A/B

Direct independent comparison on exact clean implementation commit `50c9a9c89d8e66e0466dbeeabc918ec1d465c87f`: **147/147 generated outputs and453/453 publication/runtime inputs byte-identical** to base. No characteristics, weapons, prices, source facts, rule/Stratagem text, effects, CP, execution conditions, visible copy or publication bytes changed. No new startup file, precache/policy change, RAW source or release candidate is published.

Fresh exact-base/feature A/B: **199rosters /507states, zero differences**. Complete serialized native import/snapshot/projection/effective/related/points observations match byte-for-byte, with no masking. Details: [A/B evidence](markup-gap-close-2026-11-20/ab-results.json), [all output hashes](markup-gap-close-2026-11-20/scope-equality.json).

| Book | Rosters | States | Differences |
| --- | --- | --- | --- |
| adeptus-mechanicus | 21 | 42 | 0 |
| blood-angels | 4 | 14 | 0 |
| chaos-space-marines | 67 | 164 | 0 |
| dark-angels | 5 | 16 | 0 |
| death-guard | 11 | 32 | 0 |
| emperors-children | 14 | 34 | 0 |
| space-marines | 5 | 24 | 0 |
| tau-empire | 54 | 122 | 0 |
| tyranids | 18 | 59 | 0 |

The full generated rebuild gate will run normally as part of the one pending pre-FF. Direct equality is not represented as a completed rebuild gate.

## Tests, queue and remaining run

| Test | Before | After | Why |
| --- | --- | --- | --- |
| Existing test files/expectations |Accepted exact checks|Unchanged|No old expectation needed updating|
| New `tests/markup-owner-only-qa.mjs` |Absent|Exact dated45-source review, typedscope and28negative controls|Protect the admitted owner-only boundary and prevent a forged army exception|
| Queue |188existing jobs|Same188in the same order +newowner test once =189|Quick/pre-FF shared guard; no old job removed/reordered|

[Full new-test patch](markup-gap-close-2026-11-20/new-test.patch), [targeted statuses](markup-gap-close-2026-11-20/targeted-checks.json), [owner controls](markup-gap-close-2026-11-20/owner-only-controls.json), [queue comparison](markup-gap-close-2026-11-20/queue-plan.json). Both old and new assertions remain exact. Evidence is versioned human review with source linkage; it is not cryptographic authorization to change future sources/scopes without review.

**Full pre-FF status at this publication: NOT STARTED.** The single authorized run will target `50c9a9c89d8e66e0466dbeeabc918ec1d465c87f` after this evidence branch is pushed. The implementation will stay unchanged during it. Final status/time will be delivered in the task response/local run record; this one-commit evidence snapshot deliberately does not claim a result it predates. No force, merge, FF or protected-branch publication is performed. The preview remains on accepted9efbd95f; its runtime bytes are identical.
