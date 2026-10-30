# Source references: Translate 3

Base: `75d322e4e3274f14d7e2a81abace3ba63c784ec5`. Generated from repository files; no live ingestion.

## Scope and exact inverse

All nine books are included; Orks and all stratagem subtrees are excluded. Every generated JSON artifact is inverted and compared to the base, including every entity and field. Stratagem objects are compared by their original JSON serialization.

| Book | Artifacts | Entity occurrences | Source slots | Translated slots | References | Multi-document slots | Unresolved | Bytes before | Bytes after |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| adeptus-mechanicus | 8 | 3344 | 2907 | 2907 | 2298 | 15 | 157 | 21743338 | 21556769 |
| blood-angels | 15 | 11706 | 20710 | 20710 | 14724 | 4 | 13384 | 59212145 | 56597485 |
| chaos-space-marines | 10 | 12665 | 15034 | 15034 | 15369 | 953 | 13903 | 50550156 | 48507930 |
| dark-angels | 15 | 11898 | 21156 | 21156 | 15139 | 4 | 13768 | 60406679 | 57734342 |
| death-guard | 10 | 2492 | 3064 | 3064 | 2487 | 14 | 828 | 14591887 | 14352315 |
| emperors-children | 7 | 2925 | 4154 | 4154 | 7017 | 2758 | 6757 | 15140635 | 14058948 |
| space-marines | 19 | 24544 | 38178 | 38178 | 28310 | 18 | 26887 | 98520827 | 95498739 |
| tau-empire | 6 | 3397 | 8627 | 8627 | 7484 | 16 | 6628 | 15015477 | 14434708 |
| tyranids | 7 | 3966 | 8201 | 8201 | 11014 | 3860 | 6784 | 14741197 | 13708079 |

Static checks: `{"serializedReferenceClosure":"PASS","everyEntityAndFieldInverse":"PASS","everyOriginalSourceSlotInverse":"PASS","freshCompilerBindingInventory":"PASS","documentHashAssociations":"PASS","stratagemSerialization":"PASS","verification":"STATIC_DATA_ONLY"}`. Counts include repeated artifact representations. Source slots are inventoried from a fresh compilation of every baseline artifact with the repository registry, then compared to actual generated bindings. Complete per-artifact hashes, shapes, document bindings, metadata-only slots and unresolved document identities are generated locally in `docs/audit/source-refs-translation-3.json` by `node tools/audit/source-refs-translation-report.mjs --write`; this JSON is ignored by Git.

## Old form to common form

| Book | Original slot or flat source subset | Occurrences | New form |
| --- | --- | ---: | --- |
| adeptus-mechanicus | currentness | 308 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| adeptus-mechanicus | fieldProvenance | 76 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| adeptus-mechanicus | mfmProvenance | 44 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| adeptus-mechanicus | provenance | 2139 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| adeptus-mechanicus | recordReference | 32 | sourceRefs + sourceBindings.recordReference; fields[] restores flat document declarations |
| adeptus-mechanicus | sourceId | 308 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| blood-angels | currentness | 563 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| blood-angels | fieldProvenance | 4927 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| blood-angels | mfmProvenance | 142 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| blood-angels | provenance | 12998 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| blood-angels | recordReference | 1510 | sourceRefs + sourceBindings.recordReference; fields[] restores flat document declarations |
| blood-angels | sourceId | 560 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| blood-angels | sourceProvenance | 10 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| chaos-space-marines | currentness | 444 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| chaos-space-marines | provenance | 10996 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| chaos-space-marines | recordReference | 3144 | sourceRefs + sourceBindings.recordReference; fields[] restores flat document declarations |
| chaos-space-marines | sourceEvidence | 6 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| chaos-space-marines | sourceId | 444 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| dark-angels | currentness | 535 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| dark-angels | fieldProvenance | 4990 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| dark-angels | mfmProvenance | 142 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| dark-angels | provenance | 13390 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| dark-angels | recordReference | 1559 | sourceRefs + sourceBindings.recordReference; fields[] restores flat document declarations |
| dark-angels | sourceId | 532 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| dark-angels | sourceProvenance | 8 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| death-guard | currentness | 196 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| death-guard | fieldProvenance | 190 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| death-guard | mfmProvenance | 39 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| death-guard | provenance | 2412 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| death-guard | recordReference | 33 | sourceRefs + sourceBindings.recordReference; fields[] restores flat document declarations |
| death-guard | sourceId | 194 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| emperors-children | currentness | 56 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| emperors-children | fieldProvenance | 676 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| emperors-children | mfmProvenance | 44 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| emperors-children | provenance | 3286 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| emperors-children | recordReference | 40 | sourceRefs + sourceBindings.recordReference; fields[] restores flat document declarations |
| emperors-children | sourceId | 52 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| space-marines | currentness | 923 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| space-marines | fieldProvenance | 8518 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| space-marines | mfmProvenance | 234 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| space-marines | provenance | 22577 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| space-marines | recordReference | 4999 | sourceRefs + sourceBindings.recordReference; fields[] restores flat document declarations |
| space-marines | sourceEvidence | 1 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| space-marines | sourceId | 918 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| space-marines | sourceProvenance | 8 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| tau-empire | currentness | 220 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| tau-empire | fieldProvenance | 840 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| tau-empire | mfmProvenance | 30 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| tau-empire | provenance | 4085 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| tau-empire | recordReference | 2927 | sourceRefs + sourceBindings.recordReference; fields[] restores flat document declarations |
| tau-empire | sourceId | 232 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| tau-empire | sourceProvenance | 293 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| tyranids | currentness | 38 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| tyranids | fieldProvenance | 780 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| tyranids | mfmProvenance | 44 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| tyranids | provenance | 4528 | sourceRefs + sourceBindings; fieldProvenance retains its field map |
| tyranids | recordReference | 2773 | sourceRefs + sourceBindings.recordReference; fields[] restores flat document declarations |
| tyranids | sourceId | 38 | sourceRefs + sourceBindings; fieldProvenance retains its field map |

## Common format and additional fields

- `sourceRefs + shared document tables`: Published references carry documentId, referenceId and literal locators. One table per book in source-catalog.json stores document identity/hash/authority/currentness; the reference content ID protects the complete association. Scratch/unpublished metadata may use inline catalogs.
- `documentRole`: Distinguishes an accepted document from its corpus companion; their hashes must not be interchanged.
- `sourceBindings.recordReference.fields[]`: Inventories the original source-only fields of a flat document-bearing record. The inverse flattens these fields in original order; ordinary quotation, field, role, recipient and fact metadata remains inline.
- `document-path sourceId aliases`: A books/core/mfm/HTTP document path plus a locator resolves as a document, while its original sourceId field is restored by the layout. Its legacy sha256 remains attribute context because this form can hash fragment text rather than document bytes.
- `locators[]`: Preserves original literal locators. Opaque selectors and line numbers use TEXT_LOCATION; pages use PDF_PAGE with their original scalar or array values. Explicit xpath and JSON/HTML pointers retain their declared locator kinds.
- `resolution`: An unregistered or ambiguous document remains explicit UNRESOLVED_SOURCE. Captured/canonical entity IDs alone are typed identity contexts, not unresolved document references.
- `sourceOwnership`: Canonical rule/entity ownership is separate from document identity and source hashes.
- `sourceBindings + shared immutable layouts/contexts`: Published binding tuples, value-free layouts and contexts are interned across snapshots. They preserve exact existing structures, captured identities, effectiveFrom and unpaired purpose-specific hashes. Catalog entries are validated before first use and frozen; replacing record metadata invalidates cached reads. Canonical currentness contains only sourceVersion, effectiveDate, observedAt and acceptedBaseHead. No legacy provenance object is duplicated.

## Multi-document evidence

68 distinct book/entity identities with a recorded ruleContract have multiple documents; 7642 is the separate count of repeated source slots across artifacts. Rules without a ruleContract are not silently included in that contract-entity count.

CSM: `detachment-pactbound-zealots:rule` in `books/chaos-space-marines/v2/generated/roster-runtime.json` retains 5 evidence references from 2 documents: `books/chaos-space-marines/sources/waha-11e-current-2026-09-29/chaos-space-marines.html`, `books/chaos-space-marines/v2/sources/chaos-space-marines-faction-pack-v1.3.pdf`.

EC: `army-rule-thrill-seekers` in `books/emperors-children/v2/generated/effective.json` retains separate document/corpus bindings: `[{"sourceId":null,"document":"books/emperors-children/sources/waha-11e-current-2026-09-28/corpus.json","documentRole":"CORPUS","sha256":"ED0C7577998AEA4B0DFA6F39EF6CDE523BB8B4AEE6CF36A9C69E04CEAA14131E","textSha256":null,"sourceSha256":null},{"sourceId":null,"document":"books/emperors-children/sources/waha-11e-current-2026-09-28/emperor-s-children.html","documentRole":"DOCUMENT","sha256":"C668A60432C38E89FD30F8D6C48ECE3199D21355D5DF92272125D2FF62C98239","textSha256":null,"sourceSha256":null}]`.

89096 unresolved reference occurrences reduce to 250 distinct book/document/reason identities. Generate the local JSON with `node tools/audit/source-refs-translation-report.mjs --write` for both the deduplicated unresolvedDocuments[] list and every unresolved[] occurrence; no accepted source is relabelled or repaired.

The `multiDocument[]` inventory records actual references and document/hash pairs for every source slot and flat `recordReference` subset. It includes CSM multi-evidence rules and EC document/corpus pairs; counts are computed from files rather than assumed. Known document/hash pairings are checked independently of the exact inverse. Unpaired purpose-specific hashes and captured entity IDs remain typed contexts and do not increase unresolved document counts.

## Currentness and source ownership

Object currentness declarations use the same source binding mechanism. UI currentness strings, canonical `card.fields[].source` ownership pointers, source-free quotations and stratagem declarations retain their meanings. Canonical rule identity is never inferred from a document path.

## Actual execution measurements

Browser: `{"status":"MEASURED","scope":"FULL_CORPUS","selectedBookIds":null,"counts":{"books":9,"sourceFixtures":171,"savedSnapshotFixtures":0,"acceptedImports":330,"rejectedOrPendingImports":14,"scenarioViews":1142,"cardViews":8502,"uniqueTextBytes":8077834},"zeroDifference":true,"observationsSha256":"2d24c19efb5ec5d11cb61d294d279fe0fcf2cf675a8712fa09915281b0f4cf99"}`.

Package: `{"status":"FINAL_EXECUTION","baseline":{"files":429,"bytes":271531285,"contentSha256":"92c07f6abd5222f455c68a611acae9a4f8e83547448c5bb873df244300833c1e","cacheRevision":"90a31a5d4781b6a2"},"feature":{"files":432,"bytes":270069141,"contentSha256":"5254a31e4f800ed8edef0e3901eb0fa3e0b4bd7fbab8824302c35b2053681766","cacheRevision":"3f00868743b0aca0"},"packagingDeterminism":{"status":"PASS","checks":14,"contentSha256":"5254a31e4f800ed8edef0e3901eb0fa3e0b4bd7fbab8824302c35b2053681766"}}`.

These saved measurements are attestations from separate executions. Regeneration recomputes static parity; it does not rerun the browser or packaging checks.

## Baseline source gates

- `tests/source-enrollment-qa.mjs`: PRE_EXISTING_BASELINE_FAIL — `death-guard: registered sources are not actively declared: death-guard-mfm-v1.6`.
- `books/shared/tools/source-freshness.mjs`: PRE_EXISTING_BASELINE_FAIL — `death-guard: registered sources are not actively declared: death-guard-mfm-v1.6`.
- `tests/source-ingestion-contract-qa.mjs`: PRE_EXISTING_BASELINE_FAIL — `death-guard: registered sources are not actively declared: death-guard-mfm-v1.6`.

## Verified code references

- compiler: `books/shared/source-refs-v2/source-refs.mjs:135` (`export function compileBookSourceRefs`).
- recordReference: `books/shared/source-refs-v2/source-refs.mjs:30` (`function referenceFields`).
- inverse: `books/shared/source-refs-v2/source-refs.mjs:371` (`export function sourceDeclarationView`).
- reader: `books/shared/source-refs-v2/source-refs.mjs:418` (`export function readSourceRefs`).
- validation: `books/shared/source-refs-v2/source-refs.mjs:345` (`function validateBindings`).
- loader: `books/shared/army-book-app-v2/personal.mjs:9` (`export async function loadDetachmentPresentationSources`).

## Limits and technical debt

- Exact inverse is checked for every generated JSON artifact in scope, including every entity and field, rather than a fixed example list. Entity counts are artifact occurrences, not unique gameplay entities.
- Static source parity is not a browser execution. Actual card text, Source/Applies to labels and offline Noospheric table equality are reported only through the separate browser measurement.
- loadDetachmentPresentationSources algorithm is retained as F2 technical debt. Only the owner-authorized source binding guard/comparison adaptation is in scope.
- Registry resolution may be unresolved for historical accepted paths. The migration preserves their recorded locators and hash associations and does not ingest, refetch or relabel source facts.
- Baseline source enrollment/freshness/ingestion checks share the historical DG central MFM declaration failure; this report does not claim that gate passes.

The detailed JSON is generated by `node tools/audit/source-refs-translation-report.mjs --write` and is not committed. This command also refreshes the Markdown summary; `--check` verifies its locally generated outputs. Optional `--parity FILE` and `--package FILE` attach stable measurements; omitted measurements reuse attestations when a local JSON already exists.
