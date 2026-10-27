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
- **Expand when:** a failure provides a concrete owner and reproduction.
- **Do not run:** release actions from a local repair session.

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
