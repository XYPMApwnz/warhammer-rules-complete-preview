# Core / Waha 11E content certification

This certification binds the accepted Warhammer 40,000 11E Core Rules and Rules Appendix capture to the effective Core catalog and its player projections. It does not reproduce the rules text.

## Bound evidence

- Corpus fingerprint: `7AD0124845D23DB5CAADEE077732F8BDB6ECD9B2D713E6977F7917BBE0B14D5F`
- Core page raw SHA-256: `E3414B6A2E45F15BF2146370B2BDBF92581517D4F17E2533C6B49759927FEEB8`
- Rules Appendix raw SHA-256: `C9AE762F12EE05BF43CC6AC58987BA4D7701651CB60AD06CFBCAFFD5A451BA02`
- Effective source units: 353
- Reference occurrences: 1,087
- Unique reference edges: 925

The versioned corpus, manifest, source-defect ledger and reference census live in `books/core-rules/sources/waha-core-2026-09-25/`.

## Result

- 353/353 source units have explicit canonical mappings; no source unit is missing. Mapping coverage does not establish a unique effective wording for every rule.
- The effective catalog contains 370 records: 276 main rules, 9 errata, 71 FAQ clarifications, 5 Universal Rules Updates and 9 Core concepts.
- Every canonical record has accepted Waha ownership, stronger enrolled GW ownership, or an explicit projection from one of those owners.
- All 353 source payloads remain retained in the enrolled corpus. All 948 captured structured fact items are protected by corpus hashes and mutation checks. Effective presentation applies source-bound errata and separates duplicate FAQ/errata panels from their rule owners.
- All 353 logical source units have a Core Reader and/or Glossary V2 player path.
- All 1,087 reference occurrences resolve to canonical and player targets. The one adjudicated broken Waha hyperlink resolves by strict unique identity to `core-devastating-wounds`.
- Previously pending codes `01.02.06`, `12.08`, `13.09`, `18.04.01`, `18.05`, `18.06`, `18.07` and `22.03.01` are full-content records.

## Authority and source defects

Wahapedia 11E is the operational completeness/content baseline. Explicit stronger current GW evidence overrides a direct conflict; it does not erase the captured Waha source structure or provenance.

The `18.07` After Moving clause is deterministic accepted source content and is retained exactly. Its semantic oddity is recorded as `KNOWN_SOURCE_SEMANTIC_ANOMALY`. The malformed DEVASTATING WOUNDS fragment is recorded as `KNOWN_SOURCE_NAVIGATION_DEFECT`; the product does not reproduce the broken link. The unmatched markup delimiter before `bodyguard` in source rule `19.01.01` is recorded as `KNOWN_SOURCE_MARKUP_DEFECT`; the canonical projection removes only that bound delimiter and preserves the gameplay wording.

All three adjudications bind exact corpus, unit and occurrence hashes. Any bound change fails certification and requires new adjudication.

Rule `09.07.01` is an unresolved accepted-source conflict: occurrences 52 and 53 have different wording and no enrolled supersession or official overlay establishes a winner. Its canonical identity remains available with both source variants and a warning, but it has no adjudicated effective rule text. Of 276 main-rule identities, 275 have established effective content and one has `SOURCE_CONFLICT` state. Neither source order nor previous generated output is adjudication evidence.

The effective bindings in `books/core-rules/content/core-effective-bindings.v1.json` apply the enrolled Ongoing Consolidation and Emergency Disembark errata and preserve the Objective Consolidation unengaged prerequisite. All 71 FAQ identities remain inspectable: 66 accepted secondary FAQs and five official page-88 FAQs. FAQ relationships may have no unique primary owner. Forty embedded FAQ semantic groups and the already-applied Splitting Units erratum are presented once per rule surface; separate source records and relationships remain intact. Battle Size values have one canonical structured-table owner. Rules `18.04` and `18.04.01` remain distinct parent and child identities.

## Permanent controls

- `core-waha-source-corpus-qa.mjs` validates capture hashes, the 353-unit inventory, the defect ledger and nine source mutations.
- `core-waha-player-visible-reference-census-qa.mjs` reconstructs and compares all 1,087 reference occurrences.
- `core-waha-certification-qa.mjs` validates forward/reverse ownership, player convergence, structured inventory, known defects and formerly pending identities.
- Existing Core catalog, currentness, Reader propagation and popup QA protect official precedence and production projections.
- Shared synthetic ownership controls and Core factual-ownership/browser guards protect source-bound edits, FAQ provenance/relationships, duplicate presentation, canonical Battle Size rendering, and rejection of silent source-conflict adjudication.

## Scoped publication and baseline failures

The Core reader and DG/AdMech Core reference cards are rebuilt from the effective catalog. `node glossary/v2/tools/build-glossary-v2.mjs --core-only` rebuilds the existing global publication's Core entries through the same canonical projection as a full build, including source conflict warnings and both variants. It preserves every other domain byte-for-byte and rejects a changed Core identity inventory; prior generated Core facts are never inputs to this rebuild. Source-bound guards check this with poisoned prior Core entries.

The following unrelated failures were reproduced on a clean checkout of base `cc84bfe2913afc7fee823fa4735014009d7e5287` and left unchanged:

- Full global V2 glossary build: `mfm-detachment-009fa9372dd775a8: unknown Mission Force Disposition undefined`.
- Legacy global glossary build: `Blood Angels shared glossary target is absent: space-marines-ability-support`.
- Integration QA: `chaos-space-marines entry exposes verification status and artwork`.
- DG multiple-Detachment QA's final synthetic `evaluateRole` assertion: `INVALID` versus expected `TRUE` at line 144. The same failure occurs on the base; roster runtime and visible-effects checks are separate regressions.
- Legacy `qa:glossary`: the unchanged legacy publication omits accepted Splitting Units content, so its semantic-projection check fails on the base and after this cleanup. The current V2 publication is rebuilt and guarded separately; the legacy builder remains blocked by the Blood Angels binding above.
- Architecture wiring QA: stale `scripts/roster-data.js` for Emperor's Children, Space Marines, Dark Angels and Blood Angels, and obsolete standalone Glossary script expectations. The same failures occur on the clean base.

The scoped rebuild does not certify or repair these other domains. The legacy global publication cannot be regenerated until its independent binding failure is repaired; its producer now consumes canonical FAQ relationships/provenance and the explicit conflict warning for that future build.

Certification status: `SOURCE_ACCOUNTED_WITH_UNRESOLVED_CONFLICT`. The previous `CORE_WAHA_CERTIFIED_100_PERCENT` label is superseded; source coverage must not be reported as proof that `09.07.01` is resolved.
