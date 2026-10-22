# Blood Angels V2 factual foundation

This isolated foundation uses the accepted Stage 1 captures from 22 October 2026.
It is not registered in the application. Stage 3A adds reviewed native and
static gameplay projections. Stage 3B adds book-owned physical import; Chapter
grants remain absent.

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

Stage 3A builds the source-reviewed gameplay view with:

- `node books/blood-angels/v2/rule-contract-build.mjs`
- `node books/blood-angels/v2/gameplay-presentation-build.mjs`

Both accept `--check`. Run `gameplay-qa.mjs` and `rule-clause-review-qa.mjs`
for source-authored physical projections, negative cases and mutation controls.
These are existing shared Effective/Personal Guide projectors, not a second UI,
New Recruit importer or application registration. Earlier paragraphs describe
Stage 2 ownership and admission boundaries; their factual files remain intact.

The non-overlapping BA census contains 233 clauses over 141 source records:
37 EXECUTABLE_PROVEN, 187 TEXT_ONLY_SOURCE_BACKED and nine NOT_PROVEN. The 37
comprise 20 native Core MODEL-presence references, nine unconditional source
InSv panels and eight new static clauses. Native presence does not simulate
FNP rolls, Deep Strike actions or Deadly Demise damage. Selection permissions,
relation edges and composite eligibility/effect sentences have separate spans;
44 aggregate source sections are preserved but not counted twice. All 301
foundation records are accounted for. The 71 native weapon profiles remain
base factual profiles, not 71 invented effect clauses.

The eight static lowerings are Forlorn Hero Scouts 6", Fury Unbound Lethal
Hits, Lost to Fury Sustained Hits 1, Blood Chalice +1 T, physically selected
Relic Shield +1 W, Savage Fury +1 charge, Prescient Flash Scouts 6", and
Archtraitor's Bridge bearer-only melee +2 A. Physical instances, exact MODEL
assignments, selected Detachments and weapon modes are retained. Relic Shield
requires an exact canonical MODEL selection covering its physical group;
partial counts in an undifferentiated MODEL row do not identify its bearer.
The separate Chainsword replacement permission remains NOT_PROVEN.

Dante's complete Warden clause remains TEXT_ONLY. Its source-proven permanent
Assault context is exposed only to existing SM consumers through the established
physical formation binder; Tactical fallback permissions and phase/exclusivity
logic are not calculated. No duplicate effect or global doctrine is created.
Eight existing conditional policy displays cover five Black Rage hit-reroll
spans and three incoming modifiers. All remain TEXT_ONLY and UNKNOWN battle
context; no dice, incoming damage, hit or wound values are calculated.

The five Black Rage positional spans retain their literal OR and NOT_PROVEN
status. The other four NOT_PROVEN spans concern two equipment mappings:
three Chainsword replacement permissions and one Bolt Rifle Fire permission.
No aliases or weapon recipients are inferred. Legacy of the Angel retains
BLOOD ANGELS plus CHARACTER eligibility; neither the book, Detachment nor
attachment grants that Chapter keyword. Mephiston psychic conditions, other
unknown combat events, unsupported Detachment conditional-policy sources,
Advance/Leadership reroll policies, doctrine permissions and CP/target state
remain full text with explicit ledger reasons.

The gameplay view inherits 35 existing SM typed clauses without reminting IDs
or source owners. The 180 references and closed 81-Datasheet membership remain
unchanged, as do central MFM v1.6 and all 25 BA pricing bindings. At Stage 3A, physical paid
selection, charging and active native attachment permissions remained later-stage
work; Stage 3B below now supplies those book-owned consumers. Ten relation-only references and Stormlance SOURCE_CONFLICT stay intact.
Diagnostic attachment permissions used in QA are never production permissions
or evidence of a legal army. Snapshots are native constructed diagnostics;
reloading them is not a claim of New Recruit import/reimport acceptance.

REAL_NEW_RECRUIT_EXPORT_TESTED=NO. BROWSER_ACCEPTANCE=NOT_RUN_NOT_CLAIMED.
SOURCE_COMPLETENESS=PARTIAL. SEMANTIC_COMPLETENESS=NOT_PROVEN.

Stage 3B uses `node books/blood-angels/v2/roster-build.mjs` (or `--check`) to
produce `generated/roster-import.json`. `roster-import.mjs` supplies the native
service over the unchanged shared New Recruit parser, importer, physical
runtime, snapshot/replacement commit and attachment guards. Run
`node books/blood-angels/v2/roster-qa.mjs` for constructed source-authored
physical acceptance. This does not register BA or claim a browser user path.

Import vocabulary covers 81 Datasheets, 106 source-confirmed MODEL composition
bindings, 400 explicit source weapon profiles, 18 Detachments, 32 Enhancements
and eight UNIT Upgrades. Omitted loadout is UNKNOWN, not default equipment.
Exact BA profile names do not invent replacements or select a firing mode.
Astartes Chainsword for the Death Company Jump Captain and Bolt Rifle Fire for
Death Company Marines remain NOT_PROVEN operations. They return NEEDS_BINDINGS
with the source reason even if a caller attempts a manual weapon mapping.
Independently confirmed composition and exact profile operations remain usable;
this is not a claim of unrestricted 81/81 export compatibility or army legality.

Army attachment policies use independently verified source hyperlinks, canonical
membership and source ownership: 12 BA Leader edges, eight BA Support edges,
three incoming SM declarations and admitted shared SM relations. The resulting
29 declarations expose 110 admitted edges; 79 foreign/outside-membership target
edges remain excluded. Existing physical capacity guards enforce one Leader
and one Support unless a proven source exception exists. These Army permissions
do not resolve or activate the ten central MFM relation-only references.

Seven inherited SM paid-option identities retain the central SM owner, accepted
v1.6 prices and physical quantity basis. Alternative profiles of one selected
piece are charged once. Unknown selection, unknown/invalid quantity, foreign
owner and unproven split alternative occurrences yield UNRESOLVED and
`totalPoints=null`; a known subtotal is never a final total. The existing
shared points-warning presentation can consume the service result. No BA
pricing override or new calculator contract is introduced. Stormlance retains
its source conflict without a BA override.

New imports have no invented attachment, equipment bearer, Chapter or battle
state. Assignments require source eligibility and an exact MODEL where needed.
Reload validates canonical identities, quantities and stored MFM/source
metadata. Identical reimport preserves confirmed assignments and attachments;
changed physical input uses the existing explicit replace behavior. Failed
import/load leaves the previous roster unchanged. Opening BA, a faction header,
Detachment or attachment does not grant BLOOD ANGELS to a generic SM UNIT.
Black Rage retains its OR and unknown positional condition, and no missing
printed Death Company Jump Captain keyword or CORE reference is fabricated.

Stage 3A's clause census is unchanged: physical attachment permissions and import
bindings are recorded separately, not counted as new typed effects. Full texts,
canonical source IDs and attribution remain with their accepted owners.
REAL_NEW_RECRUIT_EXPORT_TESTED=NO. SOURCE_COMPLETENESS=PARTIAL.
SEMANTIC_COMPLETENESS=NOT_PROVEN. At the close of Stage 3B, actual BA New Recruit
exports and browser acceptance were unverified; constructed fixtures are scope diagnostics.


## Local V2 application enrollment (Stage 4A)

`registration.mjs` loads `generated/app-presentation.json` and the browser-safe
`roster-boot.mjs`. `app-build.mjs` decorates the existing native gameplay
presentation; it does not produce new canonical facts. Regenerate with
`node books/blood-angels/v2/app-build.mjs`; check with `--check`, `app-qa.mjs`
and `glossary-qa.mjs`. The standard registry and Mega Glossary use this consumer.
The full view contains 81 Datasheets, 3 Army Rules, 18 Detachments,
32 Enhancements, 8 UNIT Upgrades and 60 Stratagems. Inherited records retain SM
canonical ownership. Only the 301 BA-owned records are new Glossary entries.

The local UI exposes import limitations before input. Unknown paid equipment
continues to produce UNRESOLVED with a null final total and existing warnings.
Two source-ambiguous weapon selections remain blocked without replacing the
saved roster. Black Rage retains its OR and unknown positional condition;
Legacy of the Angel still requires BLOOD ANGELS and CHARACTER. Stormlance
SOURCE_CONFLICT, ten MFM REFERENCE_ONLY relations and seventeen clauses with
shared capability gaps remain documented limitations, not automatic effects.
The source-review enrollment is structural and UNVERIFIED, independent of the
existing 233-clause gameplay review (37 executable, 187 text-only, 9 not proven).
Constructed browser fixtures are not authentic New Recruit exports.
REAL_NEW_RECRUIT_EXPORT_TESTED=NO. SOURCE_COMPLETENESS=PARTIAL.
SEMANTIC_COMPLETENESS=NOT_PROVEN. This stage does not publish the application.


## Shared conditional capabilities (Stage 4B)

The 17 reviewed gap clauses are tracked separately in
`shared-capability-review.json`. Eight existing policies remain unchanged;
five newly structured policies describe Advance rerolls, Legacy hit/wound
rerolls, Blazing Icon attack targeting and Instinctive Interception CP cost.
All thirteen are CONDITIONAL_TEXT_ONLY with UNKNOWN battle context. No roll,
target, CP spend or final action cost is calculated. The four doctrine clauses
remain full source-backed text: Tactical permissions and explicit doctrine
phase/exclusivity semantics are not added by this stage. The 233-clause census
remains 37 executable / 187 text-only / 9 not proven.

Detachment policies have a canonical Detachment source and no physical bearer.
They require the actual selected Detachment and both source-declared UNIT
keywords. Existing formed-unit keywords may establish BLOOD ANGELS + CHARACTER
through real attached components; intrinsic UNIT/MODEL keywords are unchanged.
Core action references resolve exact accepted canonical IDs and source hashes.
Snap-shooting attack targets are distinct from the friendly Stratagem target;
Heroic Intervention's CP modifier never substitutes a fabricated final cost.

`shared-capability-qa.mjs` checks source/physical applicability and mutation
controls. Existing source ambiguity, Chapter, battle-context, MFM and authentic
New Recruit export limitations remain unchanged.
