# AI bootstrap

Use this file when starting a fresh ChatGPT, Codex or Astra conversation with no prior context.

## Read first

Read these files in order:

1. `docs/PROJECT_SOURCE_OF_TRUTH.md` — current baseline, ownership, invariants, gaps and workflow.
2. `AGENTS.md` and any nearer `AGENTS.md` for the files being changed.
3. `docs/data-ownership.md` — source roles and generated-output boundary.
4. `docs/ARMY_BOOK_BLUEPRINT.md` when Army Book behavior or publication is in scope.
5. Domain contracts as needed:
   - `books/core-rules/EFFECTIVE_CORE_CONTRACT.md`
   - `missions/MISSION_DOMAIN_CONTRACT.md`
   - `glossary/v2/GLOSSARY_V2_CONTRACT.md`
   - `docs/certification/DEATH_GUARD_WAHA_CONTENT_CERTIFICATION.md` and `docs/certification/ADEPTUS_MECHANICUS_WAHA_CONTENT_CERTIFICATION.md` when those certified Army Books are in scope
6. `docs/codex/REPO_MAP.md`, `QA_MATRIX.md` and `WORKFLOW.md` for paths and commands.

Older prompts, handoffs and chat summaries are not current truth.

## Verify before work

Run:

```text
git branch --show-current
git rev-parse HEAD
git status --short --branch
```

The documented baseline is branch `working/army-books-clean`, certified/public SHA `c903ebec77d238e5423934c31aed5a461f10abbe`, cache revision `6f57915fe9ddc628`, and a clean tree. If HEAD has advanced, inspect the intervening commits and update your working assumptions; never reset merely to match this document.

The current product has Core Rules, nine supported Army Books, roster/effective synergies, Glossary V2, Mission/reference content, desktop/phone UI and PWA/offline support. The release baseline passed `test:full` 72/72, publication, source integrity/currentness, cache/update and cold-offline gates.

## Rules for every task

- Follow `accepted source -> canonical fact -> effective contextual fact -> projection -> UI`.
- Fix the factual owner or actual producer. Generated files, popup payloads and legacy Glossary data are not factual owners.
- Use stable IDs for correctness-sensitive joins. Never infer identity from title/prose when an explicit ID exists.
- Canonical identity and contextual effective facts are different: BA DP and DA inherited keywords are proven examples.
- MFM is the sole current owner of its numeric and eligibility facts.
- Roster effects and attachments operate on physical instances; duplicate datasheets must remain isolated.
- Evidence gaps stay unresolved until accepted evidence exists. Never fill rules or geometry from model memory.

## Do not regress

- Judiciar has both Leader and Support alternatives; one physical instance chooses one feasible role.
- Datasmith multiplicity is allowed for the exact Kastelan relation and is not capped at two.
- Kroot Starting Strength 20 has the proven conditional second distinct Shaper capacity.
- Belicosa and Helix use the shared Attached Unit effect mechanism.
- Same-name weapon profiles remain parent-scoped, not globally merged.
- Glossary V2 search, popup and article resolve the same identity with no legacy factual fallback.
- Current certified classes should not be re-audited without a new reproduction, source change or contradiction.

## Choose the workflow

- **Read-only audit:** inspect current code/artifacts, run only necessary read-only QA, report evidence, change nothing.
- **Repair:** reproduce first, identify owner/root cause, make the smallest source-backed change, run focused regression, then commit only if authorized.
- **Release:** require an exact clean certified HEAD, resolve the real remote Pages SHA, create a rollback ref, fast-forward without force, then verify the public site in fresh browser/PWA contexts.

During ordinary repair, run focused book/domain, integration and `git diff --check` gates. Use `npm run test:full` only when explicitly requested or at a release/checkpoint gate. A test whose oracle comes from the same producer is not independent factual proof; prefer source-backed, poisoned-input and mutation-resistant controls.

## Copyable prompt for a new chat

```text
Repository: E:\Warhammer\warhammer-rules-complete-preview

Read docs/AI_BOOTSTRAP.md and every file it marks mandatory. Verify the actual branch, HEAD and working tree before doing anything. Treat docs/PROJECT_SOURCE_OF_TRUTH.md plus current code, enrolled evidence and QA as the baseline; do not trust old chat context. Work only on the task I give next, preserve factual ownership and stable identities, and do not reopen certified decisions without new evidence.
```

For full detail, return to `docs/PROJECT_SOURCE_OF_TRUTH.md`.
