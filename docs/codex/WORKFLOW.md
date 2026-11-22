# Codex session workflow

Read the root and nearest scoped `AGENTS.md`, then use `REPO_MAP.md` and `QA_MATRIX.md`. Keep one major stage per Codex session.

## Local bugfix session

- **Starting scope:** the reproduced record, direct owner, consumer, and closest test.
- **Read first:** relevant scoped guidance, book config, named source/producer, existing focused QA.
- **Normal QA:** matching `qa:<book>` or subsystem command, then `qa:integration` only for wiring/shared changes.
- **Expand when:** the reproduction reaches a shared helper or declared dependency.
- **Do not run:** unrelated books, source refreshes, architecture audit, `test:full`.

## Source/content session

- **Starting scope:** authenticated/pinned input, manifest binding, extractor/adapter, resulting canonical record.
- **Read first:** source manifest, `books/source-ingestion-contract.json`, book config, source-specific checker.
- **Normal QA:** `qa:sources`, affected `qa:<book>`, dependency books only when inherited semantics change.
- **Expand when:** the accepted owner or shared normalization contract changes.
- **Do not run:** live capture/update without explicit authorization; do not accept upstream drift implicitly.

## Roster session

- **Starting scope:** parsed fixture, canonical unit/profile/effect contract, shared runtime consumer.
- **Read first:** the physical contract in `books/shared/roster-v2/PHYSICAL_BEHAVIOR_CONTRACT.md`, affected book contract, `books/shared/roster-v2/runtime.mjs` and closest helper.
- **Normal QA:** `qa:roster`, affected `qa:<book>`, targeted real-browser scenario when rendering matters.
- **Expand when:** shared selectors/interpreter operations or attachment/dependency semantics change.
- **Do not run:** every browser suite or every book by default.

## Frontend session

- **Starting scope:** named page/component, its data contract, styles, and a focused browser reproduction.
- **Read first:** relevant renderer/presentation code and generated-output producer.
- **Normal QA:** targeted browser test, `qa:integration`, and `qa:publication` only for routes/inventory.
- **Expand when:** shared UI assets, Library, runtime inventory or mandatory precache are affected.
- **Do not run:** source or architecture suites for a presentation-only change.

## Release session

- **Starting scope:** clean release candidate and explicit release checklist.
- **Read first:** current HEAD, outstanding debt, publication/cache state, release command definitions.
- **Normal QA:** `qa:release`, then explicitly authorized cache/deploy steps.
- **Candidate boundary:** create `git commit-tree` from the reviewed source tree with current release as its only parent; push only to a new review branch. Do not move release or dispatch Pages while preparing a candidate.
- **Publication authority:** after Claude PASS for the exact candidate and the owner's manual check, Codex performs the ordinary fast-forward of `unified-v2-release` only after separate explicit owner authorization for that exact SHA. Follow [the full release and rollback checklist](../../tools/PAGES_RUNTIME_RELEASE.md#source-review-and-release-authorization); candidate permission is not release permission.
- **Expand when:** a failure provides a concrete owner and reproduction.
- **Do not run:** release actions from a local repair session.

## Manual GitHub pre-FF (initial equivalence trial)

`.github/workflows/qa-pre-ff.yml` accepts a repository branch or SHA through
`workflow_dispatch` only. It runs the complete sequential queue, with Node 24,
Python 3.12, locked npm dependencies, declared Python packages, pinned BSData and
the Chromium shipped with the locked Playwright version. It neither deploys nor
updates any branch. Same-ref runs are serialized; the job timeout is 300 minutes.

GitHub requires a new manual workflow to exist on the repository's default branch
before first dispatch. Do not move source or change repository settings merely to
bootstrap it; obtain a separate owner decision. After the workflow is available:

```text
gh workflow run qa-pre-ff.yml --ref <workflow-branch> -f ref=<tested-branch-or-sha>
```

The tested SHA, ordered plan, counts, timings and failed jobs appear in the run
summary and a 30-day artifact. Raw console, captures, DOM and traces remain
runner-local and are not uploaded. A failed or incomplete run remains FAIL;
timeouts are not retried automatically. Local equivalence uses the same exact
SHA and complete queue once, comparing command kind and every argument, with
only checkout and declared packaging-work operands normalized. Until the owner
accepts this trial, existing local verification remains required. Real device
review, local preview and separately authorized release checks are unchanged.

## Session boundary

**NEW MAJOR STAGE → NEW CODEX SESSION**

Use this compact handoff:

```text
HEAD=<sha>
BRANCH=<branch>
WORKING_TREE=<clean/changes>
TASK=<one bounded objective>
RELEVANT_PATHS=<small exact list>
CURRENT_BLOCKER=<proven failure or NONE>
REQUIRED_QA=<qa:* commands and focused tests>
SAFETY=<no push/deploy/cache/live update; other task constraints>
```

Do not carry audit chronology, completed campaigns, or unrelated debt into the next prompt. Link the durable repository guidance instead.
