# Roster navigation: STOP at the performance boundary

GitHub source and branch base: `c477d20aaa16f850b56f18aa878d6b5fb8b4057f`.
Feature branch: `codex/roster-navigation-v1`. Implementation is an uncommitted working-tree draft. Nothing pushed or fast-forwarded. This is not READY_FOR_REVIEW.

## Accepted scope clarification

Roster-card Stratagems use only existing MATCH/CONDITIONAL contracts for roster-selected Detachments. No Core applicability is inferred. Personal Guide has a separate Core Stratagems reference group, with all ten explicitly labelled accepted Core records and no unit filtering. Core applicability remains backlog: `DEFERRED_NEEDS_CONTRACTS`, `books/shared/rule-contract-v2/book-related.mjs:118`.

## Performance STOP

Cold browser contexts, 390 px, local unthrottled static source server, same fixture and UI path. DG is the owner's v37.25 eight-unit export with exactly Lord of Contagion -> Deathshroud and Biologus Putrifier -> ten Plague Marines. Three repetitions per book/revision, median reported. Timing is actual UI click through exact destination and two animation frames. Import and attachment preparation are excluded. No other QA run ran alongside these measurements.

Baseline and draft ran as separate sequential blocks, not alternating pairs; this limits causal attribution, especially for the small SM Guide difference. The requested strict 10% threshold is still applied without an absolute-millisecond exception. No acceptance rerun or optimization was used to bypass it.

| Book | Screen | Base median ms | Draft median ms | Difference | Threshold |
| --- | --- | ---: | ---: | ---: | --- |
| Death Guard | Personal guide | 36.5035 | 58.8985 | +61.35% | STOP |
| Death Guard | Physical card | 218.6816 | 296.3952 | +35.54% | STOP |
| Space Marines | Personal guide | 62.8440 | 69.7629 | +11.01% | STOP |
| Space Marines | Physical card | 267.1678 | 272.5671 | +2.02% | Below threshold |

Exact samples and measured draft diff hashes: `measure-base/RESULTS.json`, `measure-head/RESULTS.json`; arithmetic: `MEASUREMENT_COMPARISON.json`. Both runs: zero application errors and zero missing dependencies.

### New work on the measured paths

- Physical-card rendering now calls the existing native `service.related(instanceId)` synchronously, filters its results and renders the complete eligible Stratagem cards. The base rendered only an opening button and deferred this work until the panel was opened. Formed groups render each physical component separately, so the work can repeat for a bodyguard and attached leader.
- Guide navigation now includes roster summary, composition-aware physical names, crown markers and Detachment/Core Stratagem navigation. The Core reference list and personal allowed-ID projection are currently recomputed on repeated personal projection calls.

These are code-confirmed added operations, not a CPU-profile attribution of every measured millisecond. A controlled alternating timing and profile would distinguish evaluation, text linking, DOM/layout and measurement variance. No gameplay calculation, rule contract or generated book data was changed. Profiling/optimization was not continued after the STOP threshold was observed.

## Draft implementation and tests

Draft code covers composition-aware names, bodyguard-first groups, mobile Units control, bottom shortcuts, top Warlord selection via existing snapshot load/save fields, folding the successful import, human labels and unit points, and the accepted Stratagem/reference split. Existing browser test edits relocate UI operations and labels; their facts, IDs, values and controls are retained. Full test diff/table: `EXISTING_BROWSER_TEST_MIGRATION.patch` and `.md`. Draft code is preserved in `WORKING_TREE_AT_PERFORMANCE_STOP.patch`; untracked new files are copied under `WORKING_TREE_NEW_FILES`.

Completed light checks: syntax, diff hygiene, new pure nine-book navigation test, points-status QA, cosmetics QA, rule-popup QA. A provisional runtime package built successfully: 453 files, 219 mandatory URLs; the new roster-labels module is in the explicit runtime manifest and picked up by the existing module precache policy. Final startup-graph proof is not yet run.

Not completed: dedicated new browser assertions/mutation proofs, full existing-test regression, head gallery, full generated rebuild gate, 199-roster/507-state A/B, final cache metadata, pre-ff, commits and pushes. No full pre-ff has been consumed for this task.

## Equipment inventory and before gallery

Complete equipment audit is attached under `equipment-inventory/`: all 491 datasheet book contexts, 113 explicit nonweapon identities, 55 exact helper contract resolutions, 58 without an equipment-reference helper relation, and 113 existing presenter text relations. Exact IDs, sources, caveats and independent recipe are included.

Baseline gallery: `gallery-base/RESULTS.json`, 18 book/width cases (nine books at 390 and 1440), 86 screenshots, zero browser errors/missing dependencies. Baseline summary: `BASELINE_BROWSER_SUMMARY.md`.

The approved live preview remains at c477d20; no preview switch was made. The existing preview/TLS files remain untouched. Temporary draft package: `E:/Warhammer/qa-tmp/roster-navigation/runtime-dev-1`; retained while the task is stopped for the owner's decision.
