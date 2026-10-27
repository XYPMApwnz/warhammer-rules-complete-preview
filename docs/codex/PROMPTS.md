# Short Codex prompt templates

Replace bracketed values. Keep the task bounded and refer to repository guidance instead of pasting project history.

## Local bugfix

```text
Read root and nearest scoped AGENTS.md, docs/codex/REPO_MAP.md, and QA_MATRIX.md.
HEAD=[sha]
BRANCH=[branch]
WORKING_TREE=clean

Task: fix [specific reproduced defect] in [book/subsystem].
Reproduction: [minimal current failure].
Expected: [observable correct behavior].

Scope: [exact paths/consumer]. Expand only if a dependency is proven.
Preserve gameplay/identity/points/publication outside the stated correction.
Run: [qa:<book/subsystem>] and [focused reproduction].
Do not run test:full. No push/deploy/cache/live update.
Commit the bounded repair and report SHA, root cause, QA, and deltas.
```

## Source adjudication

```text
Read root/scoped AGENTS.md and the source-ingestion section of REPO_MAP.md.
HEAD=[sha]
Task: adjudicate [named source drift/mismatch].

Trace authenticated accepted input → extractor → normalized source → canonical record → consumer.
Do not fetch or promote live upstream data.
Classify each mismatch as source, normalizer, adapter, generated expectation, or stale QA.
Apply only evidence-backed corrections.

Run qa:sources, qa:[book], and dependency QA only if inherited semantics change.
No architecture redesign, test:full, cache stamp, push, or deploy.
Report exact records, authority, correction, QA, and semantic deltas.
```

## Roster or gameplay bug

```text
Read root AGENTS.md, books/shared/roster-v2/PHYSICAL_BEHAVIOR_CONTRACT.md, affected book AGENTS.md, and QA_MATRIX.md.
HEAD=[sha]
Task: fix [runtime/roster behavior].

Reproduce through the actual provider/runtime consumer.
Trace canonical fact/effect contract → effective binding → shared runtime → rendered result.
Prefer correcting the factual contract or generic operation; do not add a book-specific hack.
Keep runtime state distinct from source facts.

Run qa:roster, qa:effects when relevant, qa:[book], and the focused browser scenario.
No test:full, cache stamp, push, or deploy.
Commit and report controls plus unrelated semantic deltas.
```

## Frontend or visual bug

```text
Read root/scoped AGENTS.md and publication/rendering paths in REPO_MAP.md.
HEAD=[sha]
Task: correct [page/component/viewport behavior].

Reproduce at [route, viewport, state].
Keep factual data and canonical identity unchanged.
Edit the source renderer/style, not generated HTML, unless its producer owns the change.
Verify the actual rendered consumer and required accessibility/state behavior.

Run the focused browser QA and qa:integration; add qa:publication only for routes/inventory.
No source refresh, architecture audit, test:full, cache stamp, push, or deploy.
Commit and report screenshots/evidence and semantic deltas.
```

## Targeted QA cleanup

```text
Read root AGENTS.md and QA_MATRIX.md.
HEAD=[sha]
Task: repair only [named failing QA assertions].

First classify each failure: production bug, stale identity, stale generated expectation, stale implementation assertion, or fixture defect.
Do not change production merely to satisfy stale QA.
Preserve the intended semantic oracle and mutation coverage.
Stop and report any newly proven production bug before broadening scope.

Run the repaired test, closest semantic control, and qa:integration only if wiring changed.
No broad cleanup, test:full, cache stamp, push, or deploy.
Commit test-only changes and report classifications.
```

## Release acceptance

```text
Read root AGENTS.md, WORKFLOW.md release section, and QA_MATRIX.md.
HEAD=[sha]
BRANCH=[branch]
WORKING_TREE=clean
Task: perform the explicitly authorized release acceptance stage.

Run qa:release and record every failure without masking known debt.
Confirm nine public/offline Army Books; Orks remains freshness-only.
Verify generated outputs, publication inventory, runtime inventory, cache/release state, and clean rebuild requirements.
Do not repair unrelated failures inside acceptance without a new bounded task.

Push/deploy/cache/tag actions require explicit authorization.
Report command results, blockers, final SHA, and working-tree state.
```

## Scope economics examples

| Task | Old likely discovery scope | New documented scope | Primary QA | Cross-book expansion |
| --- | --- | --- | --- | --- |
| Space Marines content bug | `books/`, all book scripts, global tests, publication tooling | `books/space-marines/`, its config/source/adapter, closest tests | `qa:sm` | Add `qa:da` and `qa:ba` only for inherited semantics |
| Death Guard popup bug | all generated readers/glossary/runtime files | DG adapter/presentation hook, canonical projection, popup consumer | `qa:dg`, then `qa:glossary` if glossary facts change | No, unless a shared popup/glossary mechanism is proven |
| Roster runtime bug | all nine roster catalogs and browser suites | `books/shared/roster-v2/`, native book bindings and exact presentation consumer | `qa:roster`, affected `qa:<book>` | Only affected provider/attachment consumers |
| Glossary-only bug | every book `scripts/data.js`, registry, readers, contexts | `glossary/`, editorial contract or named canonical projection | `qa:glossary` | Only books whose projection changes |
