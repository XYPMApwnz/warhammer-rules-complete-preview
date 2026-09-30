# Current handoff

This is the first document for a new ChatGPT, Codex or Astra conversation. It records the certified **local** milestone at `8fc01265a18e6c367451d18a7b86bf522edf63e8` on `working/army-books-clean`. Verify the actual HEAD and require a clean tree before work. Do not reset a newer legitimate checkout merely to match this file.

## Milestone boundary

In scope:

- Core Rules
- Death Guard
- Adeptus Mechanicus
- Tyranids
- T'au Empire
- Emperor's Children
- Chaos Space Marines

Out of scope for this milestone:

- Space Marines
- Dark Angels
- Blood Angels

SM/DA/BA have production code and historical QA, but they are not currently content- or roster-certified. Do not inspect them during the next red-team task.

## Certified state

| Domain | Content | Roster | MFM v1.5 |
|---|---|---|---|
| Core | Complete Waha operational corpus; text, structured facts, visible projection and references certified; accepted anomalies remain ledgered | N/A | Operational baseline |
| Death Guard | 100% | 100%; source-derived denominator fully executable | Regression PASS |
| Adeptus Mechanicus | 100% | 100% | Regression PASS |
| Tyranids | 100% | 1269/1269; partial 0; missing 0 | Regression PASS |
| T'au Empire | 100% | 1291/1291; partial 0; missing 0 | Regression PASS |
| Emperor's Children | 100% | 670/670; partial 0; missing 0 | Regression PASS |
| Chaos Space Marines | 100% | 1586/1586; partial 0; missing 0 | Convergence PROVEN |

CSM final controls: attachments 58/58, effects 100/100, physical instances 67/67, operator classes 11/11, composition capabilities 3/3, muster-legality classes 5/5 and transports 2/2.

## Current MFM

- Official version: v1.5, updated 2026-09-30.
- Migrated scope: DG, AdMech, Tyranids, T'au, EC and CSM.
- Result: 586/586 current in-scope records, 0 gaps, 12/12 multi-Force-Disposition records.
- Centralized MFM is the sole owner; owner conflicts 0; book numeric overrides 0.
- Multiple Force Dispositions are exact canonical-ID arrays without duplicate or implicit ordering semantics.
- External CSM dependencies enrolled: Khorne Berzerkers and Rubric Marines.
- SM/DA/BA migration and certification are deferred.

## Source and ownership policy

- Wahapedia 11E is the operational content/completeness baseline.
- Explicit stronger current GW evidence overrides a direct conflict.
- Current official Warhammer Community MFM is the sole MFM factual owner.
- Accepted source defects are bound to a ledger; never guess them away.
- Generated readers, data scripts, UI and tests are projections or controls, never factual oracles.
- Canonical identity does not make contextual facts globally identical. Same-name child profiles remain parent-scoped.

## Certified runtime contracts

Preserve physical-instance isolation, composition and multipart profiles, structured wargear predicates, Leader/Support legality, attachment-group propagation, mandatory Warlords, roster choices, battle-size caps, allied musters, Enhancement qualifiers, transports, targeting restrictions, keyword/ability changes, stat/weapon modifiers, selected-loadout/model effects, ability-range modifiers, detach/re-attach/recompute and fail-closed unknown conditions.

Hard decisions include Judiciar Leader + Support, unbounded source-backed Datasmith multiplicity, Kroot conditional capacity, centralized MFM numeric ownership, contextual effective facts, parent-scoped same-name profiles and generated UI never owning facts.

## Release state

- Certified local HEAD: `8fc01265a18e6c367451d18a7b86bf522edf63e8`.
- Current generated cache revision at this HEAD: `5d5ff33f862d9332`.
- This latest certified local work is not yet the public Pages release.
- Do not deploy until independent red-team review, finding adjudication, any proven repairs, final aggregate/generated refresh, scoped release gate and fresh public acceptance are complete.

## Next task: independent Astra red team

The next intended task is a read-only independent Astra review of the certified scope. Astra must distrust existing QA and counts as proof and independently challenge:

- source denominators and completeness;
- roster-relevance classifications;
- effect semantics and scopes;
- cross-book shared runtime behavior;
- centralized MFM v1.5 convergence.

Astra must not inspect SM/DA/BA, modify files, repair findings, commit, push or deploy. After Astra: adjudicate findings, repair only proven defects, refresh aggregate/generated outputs, run the final scoped QA/release gate, then deploy to Pages.

## Continue safely

Read `docs/PROJECT_SOURCE_OF_TRUTH.md` for ownership and runtime details, then the matching file under `docs/certification/`. Keep each task bounded. A new source change or reproducible contradiction is required before reopening a certified class.
