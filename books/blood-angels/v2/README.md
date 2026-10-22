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
