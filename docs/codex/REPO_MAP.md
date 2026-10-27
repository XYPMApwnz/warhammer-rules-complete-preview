# Unified V2 repository map

Start with [README](../../README.md), the task and nearest scoped `AGENTS.md`. This map locates existing owners; it does not introduce another architecture or a compatibility layer.

| Boundary | Current paths and consumers | Focused checks |
|---|---|---|
| Application and routes | `v2/app.html`, `v2/boot.mjs`, `v2/army-books.mjs`, `books/shared/application-v2/`; root redirects into the same app | `qa:shared:v2:shell`, `qa:shared:v2:home`, `qa:integration`, relevant browser routes |
| Native Army Books | `books/<book>/v2/` enrollments, identity bindings, factual/contracts/app producers and generated artifacts | Native producer `--check`, matching `qa:<book>` / V2 suite from `qa:help` |
| SM inheritance | SM canonical ownership plus DA/BA explicit mixed-owner references, membership and context bindings | SM controls; DA/BA only when shared facts or eligibility change |
| Core Rules | `books/core-rules/content/`, effective Core catalog, `reader/build.mjs`, existing reader HTML/app/iframe and source-backed term placements | `qa:shared:v2:core`, Core targeted checks, Core/Glossary navigation |
| Accepted inputs | `books/source-ingestion-contract.json`, per-book source manifests/configs, accepted sources and RAW/PDF | `qa:sources`, affected source/factual `--check`; no live capture implicitly |
| Canonical/effective producers | `books/shared/tools/canonical-build-contract.mjs`, canonical joins/effective model, native book factual producers | Affected factual/identity contracts; `qa:architecture` only when that boundary changes |
| Central MFM | `mfm/content/canonical-mfm-facts.mjs`, `effective-mfm-catalog.mjs` and native book MFM bindings | `qa:points`, exact numeric/owner parity and unresolved controls |
| Retained points catalog producer | `books/shared/points/build.mjs`, `effective-catalog.mjs`, generated `points-data.js`; no Roster Guides UI | `points:build`, `points:check`, effective-points projection controls |
| Physical import/selections | `books/shared/roster-v2/parser.mjs`, `import.mjs`, `import-service.mjs`, native book binding/artifact producers | `qa:roster`, import/reimport/quantity/model ownership controls |
| Attachments and gameplay | `books/shared/roster-v2/attachment-service.mjs`, `runtime.mjs`, `effects.mjs`, source-produced native bindings | Relevant `qa:effects`, attachment, scope, repeated-instance and recompute tests |
| Book/Effective/Guide rendering | `books/shared/army-book-app-v2/` and book-native consumer metadata | Targeted normal/effective/Personal Guide presentation and browser controls |
| Glossary | `glossary/v2/content/`, `tools/`, generated `index.en.json` and the Core-reader definition JS; `books/shared/application-v2/glossary.mjs` and shared book popups | `qa:glossary`, B2/B3 search, canonical ownership/reference and navigation controls |
| Source-only legacy-named producers | Retained canonical/effective/source tools may serve native producers even when an old reader is removed | Trace actual imports/configs; never delete by `legacy`/`v1` filename alone |
| PWA | `service-worker.js`, `books/shared/offline-status.js`, `tools/cache-revision.mjs`, generated revision | Cache portability/migration, current V2 install/update/offline and manual-consent controls |
| Publication | `tools/pages-runtime-manifest.json`, `pages-runtime-package.mjs` and packaging QA | `qa:publication`, runtime closure, exact package hashes, deterministic double build |
| Missions | Accepted canonical mission content and effective mission catalog | Domain/source controls; no geometry guessed from images |

Orks is source/future-enrollment work only. Its old user-facing reader and runtime publication are retired; do not add a tenth native registration without a separate task.

Active V2 presentation files include names such as `book-v1.mjs` and `datasheet-v1.mjs`. Follow imports and physical contracts rather than renaming or deleting them because of their name.

## Ownership and QA expansion

- Accepted sources own facts; generated JSON/HTML/JavaScript, search indexes and tests are projections/controls.
- Preserve canonical owner and provenance through inherited references. A consumer book does not acquire ownership of shared facts.
- A points change expands to affected pricing consumers; a shared effect/attachment change expands to physical recipients and dependent books.
- A frontend-only change does not justify refreshing sources or auditing rules. A source change does not justify UI refactoring.
- Use `qa:help`, [QA_MATRIX](QA_MATRIX.md) and the source/gameplay contract for bounded checks. `qa:release` is a separate authorized checkpoint.
- Known historical failures remain explicit in [TRACKER](../TRACKER.md); do not make EXPECTED match an erroneous result.
- Browser acceptance uses real runtime bytes at the project prefix on desktop and 390x844 mobile. Preserve evidence outside the repository.

## Search policy

Use `rg` in the named native book or shared subsystem first. Include accepted `sources/` and configs when relevant. Avoid broad searches through large generated data/media, unless tracing a specific consumer or failed output. Source capture and refresh are separate explicit operations.

The removed V1 readers, Roster Guides, mobile stubs, old URLs and V1 saved-roster/update journeys are not compatibility targets. Keep their Git history; do not restore them to satisfy stale QA.
