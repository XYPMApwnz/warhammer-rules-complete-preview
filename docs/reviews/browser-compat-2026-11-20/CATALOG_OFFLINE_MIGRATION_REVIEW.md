# Lazy source-catalog: offline update boundary

Read-only follow-up. No service worker, old test or offline recipe was edited or executed.

## Required exact-path migration exception

Current service-worker.js:146-148 migrates native v2 JSON and the exact lazy Core glossary JS. The path books/shared/source-refs-v2/source-catalog.json does not match the exact /v2/ segment regex. After removing it from mandatory precache, an unchanged old cached catalog would be skipped, then deleted with old caches at line165. A previously opened offline roster could then fail even though its native book JSON survived.

Add only the exact catalog path alongside the exact Core glossary exception in that eligibility predicate. Do not broaden to arbitrary shared JSON. Preserve all existing checks:

1. RUNTIME_ASSETS[item] exists in current publication.
2. matchesPublishedAsset hashes each old response using current expected SHA256 before copy (line151).
3. The canonical query-free target is written to current DATA_CACHE_NAME (lines152-155).
4. Every destination body is read back and SHA-verified (lines158-161).
5. Migration ownership is current before cleanup; failures retain old caches and retry (lines108-135,163-167).

The runtime integrity ledger already includes every reviewed publication path independently of mandatory precache (tools/cache-revision.mjs:122-135). Retaining the catalog in publication keeps its SHA guard. No semantic/file-format migration, source rewrite, or roster-storage change is needed.

## Test impact

Existing minimal-pwa-cache-qa.mjs:146-168 tests the analogous exact Core glossary exception: accepted old query URL, changed/unlisted data rejected, quota retry, corrupt destination prevents old-cache deletion. Add catalog-specific tests with those same controls. Existing 1/9 transferred counts use fixtures without the new catalog and need no changed expectations. Retain all unrelated JavaScript/non-publication and cache-owner negatives.

Existing tests/browser/pwa-update-flow.mjs builds current A and synthetic next B, changes only Tyranids payload, imports native SM, updates, then reopens SM offline. It would expose missing unchanged catalog migration. Preserve all existing roster/storage/draft and 490-point assertions. tests/browser/cold-offline.mjs covers fresh Home install, online SM import, online views, then fresh offline page and native roster/card/guide/Core/glossary; retain all checks. Its original lazy-data request regex does not include this shared catalog path, so a new exact no-startup-catalog request assertion is needed rather than assuming that old regex proves this.

The old release1fd0b279 tree has no books/shared/source-refs-v2/source-catalog.json (git cat-file check). The old-release-to-new observer warms new DG/SM books online after update before disabling networking; retain that route. Also add/retain current987-to-next coverage for transfer from a formerly precached catalog to the lazy cache.

## Reusable external update recipe

E:/Warhammer/qa-evidence/auto-qa-sweep-2-2026-11-19/recipes/update-path.mjs is the accepted observer used in sweepv2. It uses separate persistent profiles390/1440, same isolated loopback origin for old/new, real workers, approved DG2-unit and SM3-unit fixture text from E:/Warhammer/qa-evidence/preview-v1-2026-11-14/FIXTURES.json, ordinary reload, no manual activation API and byte equality of saved localStorage. It captures actual revision/worker/saves and offline reopen.

Copy/adapt it only into new task evidence: CLI accepts --source --old --new --out --profiles --chrome, but new label and expected revision/content hash are also hardcoded near lines22-24; profile boundary near line34 is fixed to the old task temporary root. Replace those observer inputs with exact current clean feature/package proof and E:/Warhammer/qa-tmp/browser-compat profiles. Do not mutate the accepted historical recipe. Its server uses runtime-server.mjs from preview-v1-2026-11-14 on an ephemeral loopback port and never touches live preview8765/8443.

Earlier observe-update.mjs under preview-v1-2026-11-14 is a diagnostic observer with fixed old/new roots; the sweepv2 recipe is preferable because its accepted checks already assert successful automatic update and exact storage equality.

## Implemented follow-up

At the root agent's explicit follow-up assignment, service-worker.js received only the exact-path eligibility addition described above; no hash, ownership, destination-readback or cache-deletion guard changed. New tests/browser-catalog-cache-qa.mjs passed seven transport-only cases in 0.46 seconds: exact unchanged/query URL migration with offline fallback; listed lookalikes and unrelated shared JSON excluded; changed/unlisted catalog denied; quota failure keeps old caches and retry succeeds; corrupt/missing destination keeps old caches; no fetch/idempotence; and mutation removing the exact new exception causes the positive scenario to fail. The original minimal-pwa-cache test file and its expectations remain untouched. See CATALOG_CACHE_QA.log.

The initial new unlisted fixture used an empty integrity ledger and correctly hit the stronger missing-inventory guard. It was corrected to a nonempty ledger containing another unrelated resource; no existing expected behavior was changed.
