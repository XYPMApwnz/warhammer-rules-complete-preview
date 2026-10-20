# Space Marines V2 factual foundation — Stage 2A

This directory is an isolated source and identity foundation. It is not registered
in Unified V2 and does not change Space Marines V1 or the six published V2 books.

## Factual ownership and source boundary

`sources/enrollment.json` accepts the byte-exact Stage 1 Wahapedia 11E captures and
the applicable official Printed Product Updates v1.1 PDF. Raw inputs are retained
under `sources/raw/`; the local `.gitattributes` disables checkout normalization.
The complete current official Codex/App body was not independently captured.

`build.py` reads those raw inputs on every offline build. It compares the discovered
record-address set and complete block fingerprints with `source-bindings.json`.
`identity-bindings.json` owns once-enrolled opaque IDs: neither titles nor array
positions generate identity, and the producer never creates new IDs. All current
Detachment identities are new; legacy same-title comparisons are not migrations.

`generated/base.json` contains 85 current SM-owned Datasheets (67 common and 18
Chapter-tagged), complete source MODEL/weapon profiles, native references, wargear,
composition, conditions and declarations. The 21 Detachments are 15 base plus six
Chapter appendices; original publication ownership remains recorded. Three named
nested Detachment abilities are separately addressed and retained in parent text.

`official.py` applies or verifies five PDF instructions with exact source target
IDs, page/crop evidence and field provenance in `generated/effective.json`. The
original heading and frequency of Righteous Fury remain intact. Ordinary ability
text is not turned into an executable effect.

`generated/cross-owner-references.json` separately retains Deathwatch Veteran
Recruits and Deathwatch Support (including its four Stratagems). These records
have `bookId: deathwatch`; they are not included in the 84 SM Stratagems and do not
register a Deathwatch Army Book. Legends, Forge World, foreign Chapter Datasheets
and 10E Boarding Actions are explicitly excluded from the main current corpus.

Named MODEL keywords, invulnerable-save recipients and melee-only conditions stay
separate from all-model declarations. Three composition/profile label differences
are `NOT_PROVEN` in `source-issues.json`; no guessed alias or recipient is created.

## MFM remains disconnected

No producer imports central MFM or V1 gameplay facts. Numeric prices, schedules,
Detachment Points and Force Dispositions are not copied into Army-owned data.
Wahapedia Leader/Support/Transport declarations are source-only records, with
`effectiveEligibility: false`; Cato's conditional role replacement is retained as
text, not converted into two unconditional eligibility edges.

`mfm-identity-candidates.json` contains inactive source-locator candidates only.
All remain `NOT_PROVEN` and have no `mfmRecordId`. Matching display labels is not
accepted identity proof. Central MFM integration is `BLOCKED` pending its approved
condition, date and unresolved-reference work. No MFM bridge or points consumer is
active in this directory.

## Verification

Use the configured Python runtime (with lxml and pdfplumber) to run:

```text
python books/space-marines/v2/build.py
python books/space-marines/v2/build.py --check
python books/space-marines/v2/raw-inventory-qa.py
python books/space-marines/v2/official-qa.py
python books/space-marines/v2/foundation-qa.py
node books/space-marines/v2/source-review-qa.mjs
```

The independent RAW/PDF oracles derive expected values from the accepted sources,
not the producer, generated data, legacy contracts or runtime results. Corruption
controls cover lost text/list clauses, scope, ownership, recipients and identities.

`source-review.json` uses the existing injectable shared source-completeness gate,
without changing global registration or its historical census. Every factual
block remains `UNVERIFIED` for semantic/executable review. Its structural result is
`inventoryStatus: PROVEN`, `status: PARTIAL`, `semanticCompleteness: NOT_PROVEN`.
It is not a certification of every semantic clause. Source/producer changes require
explicit review; normal builds never refresh these pins to obtain a pass.

Gameplay contracts, imports, physical roster integration, UI, Mega Glossary and
global source enrollment belong to later separately authorized stages. The known
DG global source-manifest baseline failure is unrelated and is not repaired here.
