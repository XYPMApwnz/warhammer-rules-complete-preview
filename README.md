# Unified V2 — Warhammer 40,000 11E

Unified V2 is a personal rules reference for the repository owner. It combines Army Books, Core Rules, Mega Glossary, physical roster import, Effective Datasheets and Personal Guide in one application.

**Unified V2 is the only supported user interface.** The root URL opens the existing `v2/app.html` entrypoint. Legacy V1 readers, Roster Guides, separate mobile HTML pages, old URL contracts and V1 roster compatibility are retired. Do not restore them as requirements for later work. This decision does not permit deleting canonical sources, changing gameplay facts or clearing current V2 user data.

## Supported books and user paths

- Death Guard
- Adeptus Mechanicus
- Chaos Space Marines
- Emperor's Children
- Tyranids
- T'au Empire
- Space Marines
- Dark Angels
- Blood Angels

Core Rules remains the working reader mounted in the V2 iframe, with its chapter pages, diagrams, search and glossary definitions. Mega Glossary provides the shared search and reference views. Orks has no public reader; its canonical sources and required source/build tools remain for future V2 enrollment.

The normal roster path is `New Recruit text -> physical UNIT/MODEL and selected equipment -> attachments and assignments -> Effective Datasheets -> Personal Guide`. Repeated units, model/weapon ownership and source attribution remain distinct. Unknown equipment or unsupported conditions stay explicit; an unresolved points result is not a proven total. Text-only and conditional policies are not automatically executed battle mechanics. A visible book or green regression suite is not a claim of complete source or semantic certification.

## Architecture and factual ownership

```text
accepted sources -> persistent canonical identities -> contextual effective facts
                 -> deterministic artifacts -> V2 runtime and presentation
```

- `v2/army-books.mjs` registers the nine native books. `books/shared/application-v2/` owns the shell, routing, Home, Core mounting and global glossary integration.
- `books/<book>/v2/` owns each book's enrollment, identity bindings, producers, generated artifacts and book-specific runtime bindings.
- `books/shared/roster-v2/` owns physical roster parsing/import, selections, attachments, typed effects and recomputation. `books/shared/army-book-app-v2/` projects book, roster, Effective Datasheet and Personal Guide views.
- Space Marines owns inherited common facts. Dark Angels and Blood Angels consume references with the original identities, ownership and provenance; shared facts are not copied into supplement ownership.
- `mfm/content/` owns accepted centralized points and MFM relations. Book bindings select those identities; configuration, historical snapshots and the UI must not override prices.
- `books/shared/points/` contains the retained effective-points catalog producer and generated catalog. It replaces the former producer location under Roster Guides; there is no Roster Guides application.
- `books/core-rules/content/` and the Core catalog own Core facts. `books/core-rules/reader/` remains an active V2 consumer, including its iframe resources.
- `glossary/v2/` projects the accepted facts for references and search. The large `glossary/v2/generated/index.en.js` is still required by the Core reader; it is not a retired V1 interface.
- `missions/`, accepted sources, frozen PDFs/RAW and required canonical/effective producers are retained even when a former reader was removed.

Generated HTML/JSON/JavaScript, screenshots, tests and documentation do not own rule facts. Resolve identity by explicit canonical/source bindings, not titles or source order. Scope, recipient, source conditions and provenance must survive projection. Unknown battle state must not become an unconditional modifier.

Some active V2 presentation modules retain `v1` in their filenames. Names alone are not evidence that a file is unused. Remove code only after tracing imports, producers and consumers.

The detailed [source/gameplay and independent certification contract](docs/PROJECT_SOURCE_OF_TRUTH.md), [rule presentation contract](docs/codex/V2_RULE_PRESENTATION_CONTRACT.md) and [physical behavior contract](books/shared/roster-v2/PHYSICAL_BEHAVIOR_CONTRACT.md) remain applicable. Historical counts in retained certification records apply only to their recorded HEAD and scope.

## Local setup and builds

Use Node.js 24 and Python 3.12 with the dependencies declared in `package.json` and `requirements-army-books.txt`. Browser QA requires Playwright and Chromium; `WH_PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` can select an installed Chromium executable.

Serve the checkout over HTTP for local use. PWA installation requires HTTPS or localhost, not `file://`. The root page leads to V2; `/v2/app.html` remains the application entrypoint and route base.

Normal builds and checks use committed accepted inputs and must remain network-free. Live source capture/update is separate and needs explicit authorization.

```powershell
npm run qa:help
node books/core-rules/reader/build.mjs
node books/<book>/v2/app-build.mjs
node books/shared/points/build.mjs
node glossary/v2/tools/build-glossary-v2.mjs
```

Use the relevant producer's `--check` for freshness instead of changing generated files manually. Native book producers may invoke their factual producers; source integrity failures are blockers, not permission to change enrolled hashes. Read the affected book's config and scoped guidance before rebuilding.

## QA

Start at the changed owner and its closest supported suite:

```powershell
npm run qa:help
npm run qa:points
npm run qa:roster
npm run qa:effects
npm run qa:integration
npm run qa:publication
```

Use the matching native book or `qa:shared:v2:*` checks listed by `qa:help`, then targeted real-browser checks for affected user paths. The [QA matrix](docs/codex/QA_MATRIX.md) describes boundary-based expansion. A shared change needs affected consumer regressions; a source change needs accepted-source integrity and provenance controls. Do not hide a broad release audit inside a local check.

- Preserve calculated values, MFM prices, physical recipients, assignments, attachments, snapshots and reimport behavior unless a bounded, source-proven correction was authorized.
- Compare independent source expectations and negative/mutation controls; do not make expectations match production merely to obtain PASS.
- Desktop and 390x844 mobile acceptance require real rendered evidence, not only DOM existence.
- The known SM/Deathwatch failure in `node v2/source-completeness-check.mjs --fresh` is recorded in [TRACKER](docs/TRACKER.md). It remains FAIL and must be separated from new regressions.
- The retained general points producer also has a pre-existing SM canonical Detachment join failure (`detachment-sm-624df9cefb95455f`); its relocation preserves that FAIL. Native MFM/paid-option and physical pricing checks remain separate.
- Other historical reports remain evidence for their original revisions. Do not transfer an old PASS or completeness claim to a newer checkout.

## PWA and offline policy

The existing service worker prepares the V2 shell, required code and shared styles for offline use. Large Army Book JSON and both large glossary payloads remain lazy and are cached when opened; installation must not download all nine books.

Changing V2 resources prefer the network and use only compatible cached bytes offline. The publication inventory and cache revision identify the served code/data. Compatible previously cached V2 data, including the exact Core glossary definition file, is copied and SHA-256 verified before obsolete app caches are removed. A failed copy preserves old caches for a later startup retry. No old V1 reader or V1 offline contract is supported.

Updates use the existing explicit confirmation button. Another tab's controller change does not reload the current document. The app checks its running version before and after preparing a new view; incompatible results are refused before mounting. Current V2 localStorage rosters and unfinished import drafts are not cleared by an update.

Previously opened compatible books can work offline while the browser retains their data. Browser eviction, quota and changed data can limit this. Unit images may be absent offline after an update; no image migration or offline library manager is promised. Safari/iOS behavior needs its own platform evidence. See [MINIMAL_PWA_NOTES](docs/MINIMAL_PWA_NOTES.txt) for the existing implementation boundary and residual risks.

## Runtime-only packaging and publication

`tools/pages-runtime-manifest.json` is the explicit runtime dependency allowlist. Pages publishes its runtime-only package, not the entire source checkout or private QA/capture archives.

Build from a fresh clean checkout at the exact reviewed commit. Check `git ls-files --eol` when working bytes differ from Git blobs: the packager copies runtime bytes, and line endings affect integrity hashes. Do not normalize accepted RAW/enrollment files or change expected hashes to make a build pass.

```powershell
node tools/pages-runtime-package.mjs --source SOURCE --out NEW_RUNTIME_DIRECTORY
node tools/pages-runtime-package.mjs --source SOURCE --out NEW_RUNTIME_DIRECTORY --check
node tools/pages-runtime-package-qa.mjs --source SOURCE --published NEW_RUNTIME_DIRECTORY --work NEW_QA_DIRECTORY
```

The package checks module/resource closure, explicit inventory, bytes/hashes and deterministic rebuilding. It generates `PAGES_RUNTIME_MANIFEST.json` and invokes only the declared publication/cache producers. Retiring V1 changes the file count and package hash; record the new reviewed baseline rather than targeting the former 1273 files.

Source review uses `codex/unified-v2-source` or an explicitly authorized feature branch. The release workflow `.github/workflows/pages-runtime.yml` runs only for `unified-v2-release`; Pages is configured for GitHub Actions. A feature/source push is not a deployment. Before any authorized release, recheck remote SHA, exact candidate tree/parent, workflow scope and Pages configuration, use a normal fast-forward push through the explicit GitHub URL, wait for build/deploy SUCCESS, and verify the live manifest and desktop/mobile site. Never force-push or rewrite release history. Do not assume a local `origin` points to GitHub.

The [publication checklist](tools/PAGES_RUNTIME_RELEASE.md) covers the existing mechanism. Publishing, changing Pages settings, live source updates and modifying release branches require explicit task authorization.
