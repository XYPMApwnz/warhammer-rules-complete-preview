# Translate 3: final validation

Base: `75d322e4e3274f14d7e2a81abace3ba63c784ec5`. Tested implementation: `2c6d6716eb97394c91ddde4efc462f3ae507eed2`. Status: **COMPLETE_WITH_BASELINE_FAILURES**.

## Format and scope

sourceRefs address documentId in a per-book shared document table; referenceId and literal locators protect each document/locator/hash association. Shared binding tuples and typed contexts preserve every original source-only value and key order. Canonical ownership and field maps remain separate. All stratagem data stays unchanged.

loadDetachmentPresentationSources retains its original cache-revision/file-selection/ambiguous algorithm and canonical source-field/table placement. Only its explicitly authorized source identity guard and evidence equality use the common reader.

All nine books are covered; Orks is excluded. The full per-book old-to-new source-field counts, all multi-document rules and every unresolved document identity are in [the migration census](source-refs-translation-3.md) and its companion JSON. All changed readers and test assertions, including exact old/new expressions and lines, are in [the reader inventory](source-reader-migration.md). [Producer reconfirmation](source-producer-reconfirmation.md) includes the old/new SM build.py hashes, complete serializer-only diff and implementation commit link. [Closure repair](source-reference-closure.md) explains the four CSM artifacts and cache-masking defect.

## Execution

One fresh full run from the start, sequential leaf commands from the existing suite aliases. Twenty minutes without child output stops only that test. No agents.

Counts: `{"PASS":46,"PRE_EXISTING_BASELINE_FAIL":8}`. The existing aliases are expanded into their actual leaf commands so an upstream baseline failure cannot hide later tests. Only a failing leaf is repeated for diagnosis; the full suite is not restarted.

| Existing suite | Actual command | Classification |
| --- | --- | --- |
| qa:am | `node books/adeptus-mechanicus/v2/app-qa.mjs` | PASS |
| qa:am | `node books/adeptus-mechanicus/v2/roster-import-qa.mjs` | PASS |
| qa:ba | `node books/blood-angels/v2/app-qa.mjs` | PASS |
| qa:ba | `node books/blood-angels/v2/roster-qa.mjs` | PASS |
| qa:csm | `node books/chaos-space-marines/v2/app-qa.mjs` | PASS |
| qa:csm | `node books/chaos-space-marines/v2/roster-import-qa.mjs` | PASS |
| qa:da | `node books/dark-angels/v2/app-qa.mjs` | PRE_EXISTING_BASELINE_FAIL |
| qa:da | `node books/dark-angels/v2/roster-import-qa.mjs` | PRE_EXISTING_BASELINE_FAIL |
| qa:dg | `node books/death-guard/v2/app-qa.mjs` | PASS |
| qa:dg | `node books/death-guard/v2/roster-import-qa.mjs` | PASS |
| qa:ec | `node books/emperors-children/v2/app-qa.mjs` | PASS |
| qa:ec | `node books/emperors-children/v2/roster-import-qa.mjs` | PASS |
| qa:sm | `node books/space-marines/v2/app-qa.mjs` | PASS |
| qa:sm | `node books/space-marines/v2/roster-import-qa.mjs` | PASS |
| qa:tau | `node books/tau-empire/v2/app-qa.mjs` | PASS |
| qa:tau | `node books/tau-empire/v2/roster-import-qa.mjs` | PASS |
| qa:tyranids | `node books/tyranids/v2/app-qa.mjs` | PASS |
| qa:tyranids | `node books/tyranids/v2/roster-import-qa.mjs` | PASS |
| qa:effects | `node books/shared/rule-contract-v2/recipients-qa.mjs` | PASS |
| qa:effects | `node books/shared/roster-v2/numeric-effects-qa.mjs` | PASS |
| qa:effects | `node books/shared/roster-v2/keyword-effects-qa.mjs` | PASS |
| qa:effects | `node books/shared/roster-v2/ability-effects-qa.mjs` | PASS |
| qa:effects | `node books/shared/roster-v2/weapon-contribution-effects-qa.mjs` | PASS |
| qa:effects | `node books/shared/roster-v2/advance-roll-effects-qa.mjs` | PASS |
| qa:effects | `node v2/source-effect-regression-qa.mjs` | PASS |
| qa:effects | `node v2/detachment-source-binding-qa.mjs` | PASS |
| qa:roster | `node books/shared/roster-v2/import-service-qa.mjs` | PASS |
| qa:roster | `node books/shared/roster-v2/import-selections-qa.mjs` | PASS |
| qa:roster | `node books/shared/roster-v2/attachment-service-qa.mjs` | PASS |
| qa:roster | `node books/shared/roster-v2/attachment-conditions-qa.mjs` | PASS |
| qa:roster | `node books/shared/roster-v2/reimport-attachments-qa.mjs` | PASS |
| qa:roster | `node v2/detachment-recipient-qa.mjs` | PASS |
| qa:roster | `node v2/card-recipient-qa.mjs` | PASS |
| qa:integration | `node v2/source-completeness-check.mjs` | PASS |
| qa:integration | `node tests/integration-qa.mjs` | PASS |
| qa:workflow | `node tests/codex-workflow-qa.mjs` | PASS |
| test:browser | `node v2/shell-browser-qa.mjs` | PASS |
| test:browser | `node v2/core-reader-browser-qa.mjs` | PASS |
| test:browser | `node tests/minimal-pwa-cache-qa.mjs` | PASS |
| test:browser | `node v2/pwa-transition-qa.mjs` | PASS |
| test:browser | `node tests/browser/pwa-update-flow.mjs` | PRE_EXISTING_BASELINE_FAIL |
| test:browser | `node tests/browser/cold-offline.mjs` | PRE_EXISTING_BASELINE_FAIL |
| test:browser | `node v2/detachment-recipient-browser-qa.mjs` | PASS |
| test:browser | `node v2/detachment-synthetic-table-browser-qa.mjs` | PASS |
| test:browser | `node v2/card-recipient-browser-qa.mjs` | PASS |
| packaging/determinism | `node tools/pages-runtime-package-qa.mjs --source $SOURCE --published E:\Warhammer\qa-evidence\translate-3-final-jbowQJ\feature-runtime --work E:\Warhammer\qa-evidence\translate-3-final-jbowQJ\packaging-qa` | PASS |
| source-enrollment | `node tests/source-enrollment-qa.mjs` | PRE_EXISTING_BASELINE_FAIL |
| source-freshness | `node books/shared/tools/source-freshness.mjs` | PRE_EXISTING_BASELINE_FAIL |
| source-ingestion | `node tests/source-ingestion-contract-qa.mjs` | PRE_EXISTING_BASELINE_FAIL |
| all-nine-browser-baseline | `node v2/source-refs-browser-parity.mjs --fixtures $EVIDENCE/source-browser-fixtures.json --root E:\Warhammer\qa-evidence\translate-3-final-jbowQJ\baseline-runtime --out $EVIDENCE/delivery-browser-baseline-corrected.json` | PASS |
| all-nine-browser-feature | `node v2/source-refs-browser-parity.mjs --fixtures $EVIDENCE/source-browser-fixtures.json --root E:\Warhammer\qa-evidence\translate-3-final-jbowQJ\feature-runtime --compare $EVIDENCE/delivery-browser-baseline-corrected.json --out $EVIDENCE/delivery-browser-feature-corrected.json` | PASS |
| additional migrated reader QA | `node books/dark-angels/v2/roster-import-lifecycle-qa.mjs` | PASS |
| additional migrated reader QA | `node books/shared/army-book-app-v2/keyword-attribution-qa.mjs` | PRE_EXISTING_BASELINE_FAIL |
| strict source catalog negatives | `node books/shared/source-refs-v2/source-catalog-qa.mjs` | PASS |

Full output tails, exit codes and evidence log names are in the companion JSON. Known DA count failures and PWA startup failures retain their baseline classification. A timeout is NOT_COMPLETED, never PASS.

## Independent source proof

All 97 generated artifacts inverse exactly, including all source values, original object order, document/locator/hash associations and 38136 stratagem serializations. Static closure covers all 97 artifacts and all package JSON files; nine own-table deletion controls pass in each scope. Cold-load missing-reference rejection remains strict. The native source enrollment/freshness/ingestion gates each retain the exact DG MFM v1.6 baseline error. Their baseline log digests and comparisons are in the JSON.

## Package, timing and cards

Runtime package: 432 files; 270069141 bytes, delta -1462144 from base. Content SHA-256: `5254a31e4f800ed8edef0e3901eb0fa3e0b4bd7fbab8824302c35b2053681766`. Packaging/determinism: PASS (14 completed checks).

CSM five-pair median: 525.8533 ms against 485.4894 ms; 8.3141% change. The measured existing production recipe is documented in the JSON; this is not a claim about every roster.

Browser: `{"status":"PASS","scope":"FULL_CORPUS","counts":{"books":9,"sourceFixtures":171,"savedSnapshotFixtures":0,"acceptedImports":330,"rejectedOrPendingImports":14,"scenarioViews":1142,"cardViews":8502,"uniqueTextBytes":8077834},"comparison":{"status":"PASS","zeroDifference":true},"tableChecks":[{"viewport":"desktop","phase":"ONLINE","inline":true,"before":"6c97691bf2c4abc186df5188fd8d1ea1896cfa0f09b9bf0e63a22978fd911f0f","after":"a8ed7c4a6a55720e1cbd9cede90c42df355bb3fdeaa23b4493d929fd8fe8685f","cells":[["INCURSION:","1 UNIT"],["STRIKE FORCE","2 UNITS"],["ONSLAUGHT","3 UNITS"]],"textContent":"e057f4b63828aca6505bc91d8308eec753159f0b54c61a49a473cd69b211b676","innerText":"79afcb51e010bb4f209196e575722283d3403cf61e17570e0bd3b01625a73fb2"},{"viewport":"desktop","phase":"OFFLINE","inline":true,"before":"6c97691bf2c4abc186df5188fd8d1ea1896cfa0f09b9bf0e63a22978fd911f0f","after":"a8ed7c4a6a55720e1cbd9cede90c42df355bb3fdeaa23b4493d929fd8fe8685f","cells":[["INCURSION:","1 UNIT"],["STRIKE FORCE","2 UNITS"],["ONSLAUGHT","3 UNITS"]],"textContent":"e057f4b63828aca6505bc91d8308eec753159f0b54c61a49a473cd69b211b676","innerText":"79afcb51e010bb4f209196e575722283d3403cf61e17570e0bd3b01625a73fb2"},{"viewport":"mobile","phase":"ONLINE","inline":true,"before":"6c97691bf2c4abc186df5188fd8d1ea1896cfa0f09b9bf0e63a22978fd911f0f","after":"a8ed7c4a6a55720e1cbd9cede90c42df355bb3fdeaa23b4493d929fd8fe8685f","cells":[["INCURSION:","1 UNIT"],["STRIKE FORCE","2 UNITS"],["ONSLAUGHT","3 UNITS"]],"textContent":"e057f4b63828aca6505bc91d8308eec753159f0b54c61a49a473cd69b211b676","innerText":"79afcb51e010bb4f209196e575722283d3403cf61e17570e0bd3b01625a73fb2"},{"viewport":"mobile","phase":"OFFLINE","inline":true,"before":"6c97691bf2c4abc186df5188fd8d1ea1896cfa0f09b9bf0e63a22978fd911f0f","after":"a8ed7c4a6a55720e1cbd9cede90c42df355bb3fdeaa23b4493d929fd8fe8685f","cells":[["INCURSION:","1 UNIT"],["STRIKE FORCE","2 UNITS"],["ONSLAUGHT","3 UNITS"]],"textContent":"e057f4b63828aca6505bc91d8308eec753159f0b54c61a49a473cd69b211b676","innerText":"79afcb51e010bb4f209196e575722283d3403cf61e17570e0bd3b01625a73fb2"}],"screenshots":["desktop-noospheric-online.png","desktop-noospheric-offline.png","mobile-noospheric-online.png","mobile-noospheric-offline.png"],"method":"Unchanged renderer; fonts and styles ready, then two animation frames without DOM/resize changes. Exact card block order, paragraph text, Source and Applies to labels. Normal Service Worker offline reload."}`. Online/offline Noospheric rule text, table content and inline placement are checked with the normal Service Worker. Cold-new-tab startup remains a separately classified baseline failure.

## Production and evidence

Feature branch only. No source/release/main update, deployment, Pages/workflow/default-branch change or live source ingestion.

Review evidence root: `C:/Users/denis/AppData/Local/Temp/wh-translate-3-Bb4PEp`. Referenced packages: baseline-runtime, feature-runtime-complete (before optimization), feature-runtime-source-closure. Execution logs: delivery-qa-corrected and baseline-sources. Browser captures: delivery-browser-baseline-corrected.json and delivery-browser-feature-corrected.json; screenshots referenced by the latter are retained.

Automatic cleanup review rejected Remove-Item with blocked by policy. The two previously retained intermediates and the untracked CSM Python cache remain; no bypass was attempted. Four older blocked directories were not touched.

## Resolved migration and input failures

- CSM: the generic serializer now traverses ordinary sourceBindings containers; all 71 raw references in each of four artifacts are encoded and resolved. Missing-entry guards remain strict.
- Tau QA: three legacy equipment-source equality reads and one mutation use the common named-slot reader. The complete retry, including negative controls, passed.
- Tyranids QA: full FNP/data equality compares exact inverse records rather than compact storage versus producer scratch data. Both app and import checks retain changed-hash negative controls.
- Checkout cache metadata: the normal producer refreshed 8312260aa5c2fd6b to 3f00868743b0aca0 after catalog bytes changed. No Service Worker algorithm was changed; F1 browser then passed.
- External runtime copies became incomplete. The deletion mechanism is unknown. Fresh evidence lives at `E:\Warhammer\qa-evidence\translate-3-final-jbowQJ`; all 429 baseline files match the recorded base manifest byte hashes, and the rebuilt 432-file feature has the same content hash as before the loss. The complete recovery map is in the JSON.

## Additional baseline limitation

DA lifecycle source/mutation QA passed. The extra keyword-attribution QA fails on both feature and exact base 75d322e4 before its native source checks: its old synthetic effect lacks a canonical recipient reference. The baseline module closure (50 exact Git files) and both error stacks are recorded. Its native source assertions are NOT_REACHED; no PASS is claimed for them, and no recipient fixture or runtime guard was changed. Strict catalog controls passed all 12 mutations.

All common-reader conversions and old/new source expressions remain listed in the reader migration inventory.

## Tested working tree

The run started at `2c6d6716eb97394c91ddde4efc462f3ae507eed2`. The final feature commit also includes the source-reading QA corrections and normal derived cache refresh applied during this run. Their exact file hashes are recorded in validationWorkingTree; unchanged runtime behavior is bound to content SHA-256 `5254a31e4f800ed8edef0e3901eb0fa3e0b4bd7fbab8824302c35b2053681766`. Only affected leaves were retried, and all initial failures remain in the execution record.
