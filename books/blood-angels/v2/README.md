# Blood Angels V2 factual foundation

This isolated foundation uses the accepted Stage 1 captures from 22 October 2026.
It is not registered in the application and provides no executable effects,
physical importer or Chapter grants.

Run `python -B build.py` to produce the three files in `generated/`; use
`python -B build.py --check` to check freshness. Run `foundation-qa.py`,
`reference-qa.py` and `mutation-qa.py` for independent RAW parity, dependency
boundaries and negative controls. The existing Python runtime requires lxml.

The 301 BA-owned records include 14 Datasheets, 14 MODEL profiles, 71 weapon
profiles, 14 composition rows, 26 wargear blocks, 31 abilities (29 main and two
separate Mephiston psychic abilities), 44 sections, 45 native rule references,
nine InSv panels, seven relation declarations (12 Leader and eight Support
recipient edges), three Detachments and three rule blocks, eight Enhancements
and 12 Stratagems. Relation declarations overlap their full source sections;
recipient edges are not additional canonical entities.

Persistent canonical and source IDs were enrolled once as opaque UUID values
against explicit source addresses. Rebuilding never creates identities. Source
bytes, DOM node hashes, extracted-data fingerprints and the review ledger are
checked before generation. Enrollment is explicitly LF; raw captures retain
their accepted bytes through local Git attributes.

The 180 inherited references retain existing Space Marines canonical IDs,
source ownership and provenance. Their descendant inventories are references,
not copied SM facts or evidence of an operational mixed-owner runtime. The 18
other Chapter Datasheets are excluded. The Stage 2A identity-candidate ledger
remains an immutable record of the initially inactive proposals. Its v1.4 status
describes that historical stage, not the current central source.

Stage 2B separately enrolls official BA MFM v1.6 in the central catalog. Run
`node books/blood-angels/v2/mfm-build.mjs` from the repository root to build the
three native MFM projections; add `--check` for freshness. `mfm-qa.py` checks
independent official RAW parity and reviewed identity proofs. The 25 proven
pricing bindings comprise 14 UNIT (19 schedules / 25 rows), three Detachments
and eight Enhancements. Numeric facts remain owned by central MFM; the factual
`base.json` and `effective.json` remain the unchanged Stage 2A foundation.

The 69 shared SM pricing records stay with their existing owner and identities.
Inherited pricing references do not activate the 180 Army references in BA
gameplay. Ten unpriced MFM relation-target references remain REFERENCE_ONLY;
relations are not activated by the pricing boundary. Ten historical BA Legends
retain their original v1.4 MFM identities and provenance with no current native
Army recipients. Astraeus and Thunderhawk remain SM MFM-only references, and
Deathwatch retains its separate owner.

The active `mfm-boundary.json` retains the same-fact Stormlance SOURCE_CONFLICT:
BA's secondary page says 2DP while official MFM and accepted SM source say 1DP.
Stormlance remains SM-owned; no BA price record or override is introduced.
Observation/verification on 22 October is separate from an unknown publication
date; the effective date remains null. No physical equipment charge is inferred.

Stage 2C uses `node books/blood-angels/v2/book-build.mjs` (or `--check`) from
the repository root. Four disposable `generated/mixed-owner-*` projections
resolve the 180 reviewed SM references and their 1,319 owned descendants. The
result contains 81 Datasheets (14 BA + 67 SM), 106 MODEL and 400 weapon profiles,
three SM Army Rules, 18 Detachments, 32 Enhancements, eight UNIT Upgrades and
60 Stratagems. SM canonical records remain in the SM foundation; generated
consumer views retain their original IDs, owners and provenance.

The owned Datasheet layout adapter runs in memory during this build; a separate
`generated/native-datasheets.json` is not a runtime dependency. The existing
V2 projectors supply Effective and Personal Guide views. Caption references use
the BA consumer domain while equipment and MODEL/weapon ownership stay with
their canonical source. Shared membership and equipment-owner guards are
unchanged. `mixed-owner-qa.mjs` and `mixed-owner-context-qa.mjs` exercise the
consumer paths using constructed diagnostic snapshots, not New Recruit exports
or browser acceptance.

The mixed points view contains 81 native recipients, the 25 BA pricing bindings,
and seven applicable shared SM paid-option price references. Neither the two
SM MFM-only UNIT nor Deathwatch gains a BA Datasheet. Physical option selection
and charging remain unimplemented. All 29 inherited/owned MFM role declarations
are references only, including the ten unresolved targets; no attachment policy
is activated. Chapter context for inherited physical UNIT remains NOT_PROVEN.
Opening this book, membership or selecting a Detachment grants no Chapter
keywords. The existing SM source-token normalization removes conditional
Chapter tags; it is not a Deathwing/Ravenwing grant or a new BA effect.

`source-issues.json` preserves the two unconfirmed equipment mappings, literal
Black Rage OR and unknown positional context, printed keyword/reference
omissions, Legacy of the Angel eligibility, and the Stormlance 2DP/1DP conflict.
No weapon aliases, inferred keywords or equipment recipients are introduced.
DOOMED and GRACE are not enrolled as independent keyword rules.

SOURCE_COMPLETENESS=PARTIAL. SEMANTIC_COMPLETENESS=NOT_PROVEN. The official full
App capture is unavailable; the official BA v1.2 PDF is Legends-only and is not
a source for current Datasheet facts. Existing SM official corrections remain
with their original owner and are not reapplied here. Constructed or real New
Recruit import acceptance has not been performed by this foundation.
