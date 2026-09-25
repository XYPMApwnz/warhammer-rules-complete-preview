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

- 353/353 source units have explicit canonical mappings; no source unit is missing or ambiguous.
- The effective catalog contains 370 records: 276 main rules, 9 errata, 71 FAQ clarifications, 5 Universal Rules Updates and 9 Core concepts.
- Every canonical record has accepted Waha ownership, stronger enrolled GW ownership, or an explicit projection from one of those owners.
- All 353 source payloads are retained under the exact normalized-text contract. All 948 captured structured fact items are protected by corpus hashes and mutation checks.
- All 353 logical source units have a Core Reader and/or Glossary V2 player path.
- All 1,087 reference occurrences resolve to canonical and player targets. The one adjudicated broken Waha hyperlink resolves by strict unique identity to `core-devastating-wounds`.
- Previously pending codes `01.02.06`, `12.08`, `13.09`, `18.04.01`, `18.05`, `18.06`, `18.07` and `22.03.01` are full-content records.

## Authority and source defects

Wahapedia 11E is the operational completeness/content baseline. Explicit stronger current GW evidence overrides a direct conflict; it does not erase the captured Waha source structure or provenance.

The `18.07` After Moving clause is deterministic accepted source content and is retained exactly. Its semantic oddity is recorded as `KNOWN_SOURCE_SEMANTIC_ANOMALY`. The malformed DEVASTATING WOUNDS fragment is recorded as `KNOWN_SOURCE_NAVIGATION_DEFECT`; the product does not reproduce the broken link. The unmatched markup delimiter before `bodyguard` in source rule `19.01.01` is recorded as `KNOWN_SOURCE_MARKUP_DEFECT`; the canonical projection removes only that bound delimiter and preserves the gameplay wording.

All three adjudications bind exact corpus, unit and occurrence hashes. Any bound change fails certification and requires new adjudication.

## Permanent controls

- `core-waha-source-corpus-qa.mjs` validates capture hashes, the 353-unit inventory, the defect ledger and nine source mutations.
- `core-waha-player-visible-reference-census-qa.mjs` reconstructs and compares all 1,087 reference occurrences.
- `core-waha-certification-qa.mjs` validates forward/reverse ownership, player convergence, structured inventory, known defects and formerly pending identities.
- Existing Core catalog, currentness, Reader propagation and popup QA protect official precedence and production projections.

Certification status: `CORE_WAHA_CERTIFIED_100_PERCENT`.
