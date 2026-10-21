Dark Angels V2 — native factual foundation (Stage 2A)

Offline build: python books/dark-angels/v2/build.py
Freshness: python books/dark-angels/v2/build.py --check
Independent source QA: python books/dark-angels/v2/foundation-qa.py
Reference/condition/MFM boundary QA: python books/dark-angels/v2/reference-qa.py
Python requires lxml, as in the existing SM V2 factual producer.

Ownership pipeline
sources/enrollment.json pins accepted raw bytes, URLs, dates and authority.
build.py reads the raw captures on every build. source-bindings.json binds
reviewed source addresses, raw-node hashes and data fingerprints to persistent
source identities. identity-bindings.json holds opaque canonical identities
minted once at enrollment. A changed title/order never silently changes identity.
Source changes require explicit address review; the builder never mints IDs.
The generated base/effective/factual-census JSON files are downstream outputs.
No legacy Dark Angels facts, IDs, builders or compatibility layers are inputs.

Corpus: 320 source-addressed DA-owned records. 16 Datasheets; 21 MODEL profiles;
68 weapon profiles; 21 composition rows; 12 wargear options; 49 sections;
35 main abilities plus 5 separately addressed nested abilities; 43 rule refs;
15 invulnerable panels; 7 relation blocks holding 35 Leader and 2 Support edges;
2 Army Rules; 3 Detachments and 3 rule blocks; 6 Enhancements; 2 UNIT Upgrades;
12 Stratagems. Section records preserve default equipment, restrictions and
Supreme Commander. MODEL/weapon profiles remain source declarations, not guessed
physical loadout assignments. Nested abilities retain their source section link.

Inherited SM data
inherited-sm-references.json references the existing SM effective owner. It does
not copy SM stats, texts or weapon profiles or reapply SM official corrections.
Chapter conditions and MFM candidates are non-executable ledgers. The existing
shared mixed-owner context guard is unchanged. A reference ledger alone proves
neither runtime integration nor physical Chapter context.

Boundary
No points, executor, importer, runtime contracts, registration, UI or Glossary
are implemented here. Central DA MFM v1.4 is not consumed; v1.6 is candidate-only.
All active gameplay bindings and Chapter keyword grants remain zero.
Astraeus/Thunderhawk remain MFM-only; Deathwatch Support has a separate owner.
The paid Cyclone option is a source candidate, never an inferred physical charge.

Source confidence
SOURCE_COMPLETENESS=PARTIAL; SEMANTIC_COMPLETENESS=NOT_PROVEN.
Wahapedia reports App. Dark Angels 11E v2.8.1 (October 2026). Full official App
content was not captured. The September 2026 official article corroborates only
part of the corpus. Official faction pack v1.3 is Legends-only. Those captures
are retained as boundary evidence, not executable replacement overlays.
Source issue dispositions are in source-issues.json. No claim of browser or
runtime acceptance is made by this foundation.
