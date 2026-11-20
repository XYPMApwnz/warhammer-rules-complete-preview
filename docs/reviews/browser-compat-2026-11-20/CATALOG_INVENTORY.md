# Source-catalog runtime inventory

Read-only inventory of accepted base `9876164de85f1e35aa2cf070a3eb9de662093980`. No repository files or tests were changed and no browser/test run was started.

## Decision

The catalog is required by actual roster correctness checks and source decoding across all nine books, not only by a debug Source disclosure. A conservative content-ID closure of all 21 published book generated JSON inputs retains **98.23%** of its raw bytes. A small shared runtime projection is not justified: it would save only 115806 raw bytes and 15222 gzip bytes, while introducing a second global source registry representation. Prefer retaining the full JSON in publication and loading/parsing it once on first Army Book/roster use; remove it from mandatory installation precache so Home does not download it indirectly through the worker. Cache a successfully opened book's dependency through the existing lazy-resource policy for offline roster use.

| Section | Full catalog | Published-input closure |
| --- | ---: | ---: |
| Document rows (per-book tables) | 562 | 517 |
| Unique document IDs | 522 | 477 |
| Layouts | 182 | 179 |
| Contexts | 10168 | 10083 |
| Bindings | 19286 | 19027 |
| Raw bytes | 6530013 | 6414207 |
| Gzip bytes (Node default level) | 719107 | 703885 |

The closure is deliberately conservative: every exact content ID in each published generated JSON is retained, then every compact binding tuple expands its layout and context IDs. It is an upper bound on semantically reachable entries, not a claim that a single player session opens every record. It establishes that the union required to support all published books is nearly the complete registry. Source values, content IDs and entry order must remain unchanged. See CATALOG_CLOSURE_INVENTORY.json for per-file direct counts and method.

## Actual data/API use

- `books/shared/source-refs-v2/source-catalog.mjs:2-22`: imports full JSON, indexes document IDs across book tables, returns exact document/layout/context records through `catalogValue`, expands compact binding tuples through `catalogBinding`; expanded bindings are memoized.
- `source-refs.mjs:87-107`: `lookup` checks local/shared/pool catalogs, validates content-address identity and freezes accepted entries. This is a correctness guard.
- `source-refs.mjs:294-312`: `resolvedReference` joins document metadata to per-record locators/hash/role and checks reference content ID; `decode` reads layouts/contexts to recover exact declared fields.
- `source-refs.mjs:315-374`: `sourceSnapshot` and `validateBindings` validate all source slots, exact field provenance and canonical source ownership.
- `source-refs.mjs:375-451`: `sourceDeclarationView` / `readSourceRefs` expose complete decoded declaration/reference values.
- `source-refs.mjs:460-508`: `sameSourceEvidence`, `getRecordedSourceIdentity`, `getSourceContext`, `copySourceEvidence` support rule ownership and source-preserving runtime projections.

| Player path | Concrete consumers and reason |
| --- | --- |
| Army Book mounting/source-backed cards | `books/shared/army-book-app-v2/runtime.mjs:27` registers payload; `book-v1.mjs:30` source fields; `datasheet-v1.mjs:688,1067,1148,1182,1578` groups/deduplicates rules using exact source provenance and renders source-backed gained/executable text. |
| Import and saved-roster load | `books/shared/roster-v2/import-service.mjs:16,77`, `runtime.mjs:113-120`, `context.mjs:46` source registration; import/context/rule checks call exact source identity APIs. |
| Physical equipment/model effects | `recipient-execution.mjs:70-128`, `physical-static-model.mjs:17-55`, `physical-choice.mjs:17-132` validate real source owners, exact physical proof and scope before execution. |
| Enhancements and conditional text | `effects.mjs:239` checks source identity; `conditional-policy.mjs:34,71,155,244-313` checks conditional owner/reference evidence and preserves it in rows. |
| Effective/Personal Guide | `army-book-app-v2/personal.mjs:34,57,240,303,338-341,629` checks source identities/equality and selects source-backed complete rule text. |
| Attachment/navigation provenance | `navigation-v1.mjs:12` decodes relation metadata before accepting an explicit current attachment. |

The JSON sections are **documents / layouts / contexts / bindings**. Document rows preserve accepted document/source identity/hash/authority/currentness; contexts include exact IDs/attributes originally carried in source declarations; layouts preserve field structure; bindings preserve ordered source-slot-to-layout/ref/context mapping. Removing most of these as merely developer provenance would disable integrity/ownership checks or alter projected state.

## Lazy initialization boundary

`books/shared/application-v2/runtime.mjs:178-181` asynchronously loads a book payload and invokes its native roster factory before mounting. This is a suitable integration boundary to await catalog readiness once; those factory calls can validate/decode sources immediately. The Home/Core/global-glossary shell branches above it do not call catalog APIs themselves. Book registration modules dynamically import native roster modules (for example DG registration.mjs:14, AM:14, CSM:14). The synchronous catalogValue/catalogBinding/sourceSnapshot/identity APIs should remain synchronous once initialized.

Do not defer initialization until opening a Source popup: imports/effect calculation already need the catalog. Do not automatically place a lazy literal fetch in the eager startup graph: its existing direct-fetch parser needs an explicit checked lazy declaration or known lazy loader shape. Ordinary offline use requires a previously opened book/catalog dependency cached online; opening an unvisited large book offline remains the existing limitation.

## Node-only consumers and test boundaries

- `source-serialization.mjs:1-49` is producer-only: externalizes accepted source definitions to registry IDs, checks existing entries and serializes byte-stable JSON. It needs full current catalog values and is not in the runtime publication manifest.
- `tools/audit/build-source-catalog.mjs:71-101` copies loader/source-refs/source-closure into a scratch folder with a candidate full catalog JSON and validates all registry entries plus 97 generated source documents. It must keep validating full candidate catalog integrity without a browser bootstrap.
- `books/shared/source-refs-v2/source-catalog-qa.mjs:52-54` similarly copies loader/source-refs and poisoned catalog JSON into cold scratch workers. Existing cold tamper/collision controls must still work with no warm fallback.
- `books/shared/source-refs-v2/source-closure-qa.mjs:12,20` explicitly reads full catalog JSON, including packaged closure checks; retaining full JSON in publication preserves that input contract. Every removed document negative control per book must remain.
- `tests/startup-precache-qa.mjs:66` currently asserts the source registry is a genuine static JSON startup dependency. Converting that assertion to a precise lazy-dependency/caching contract requires a before/after row and retained negative controls under the task's test rule.
- `tools/cache-revision.mjs:81` and `tools/pages-runtime-manifest.json:9186-9203` currently declare full JSON as required runtime/startup data. Keep publication entry if using full lazy JSON, remove mandatory-precache entry only, and ensure cache revision still fingerprints this changing runtime data.

No runtime consumer in the inspected code directly needs the source-serialization/audit writer. The browser needs exact read/validation semantics; maintenance needs complete append-only registry validation. Neither is permission to modify accepted catalog entries.
