Dark Angels V2 — static gameplay completion (Stage 3D)

Offline build: python books/dark-angels/v2/build.py
Freshness: python books/dark-angels/v2/build.py --check
Independent source QA: python books/dark-angels/v2/foundation-qa.py
Reference/condition boundary QA: python books/dark-angels/v2/reference-qa.py
Pricing source QA: python books/dark-angels/v2/mfm-qa.py
Native pricing build/check: node books/dark-angels/v2/mfm-build.mjs [--check]
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
Chapter conditions now execute only under verified DA army applicability.
Source-proven MFM identities bind pricing only. The existing shared context guard
is unchanged. Intrinsic Chapter and army applicability are separate proofs.

Boundary
MFM v1.6 now owns DA numeric facts centrally. mfm-bindings.json joins proven
native source identities to central records. mfm-mapping-review.json records the
independent source proof. mfm-boundary.mjs validates those joins; mfm-build.mjs
uses the existing createEffectiveMfmArmyProjection, without a legacy builder.
Generated mfm-presentation.json is a pricing projection, not a registered Army
Book UI. No numeric MFM values are copied into DA canonical factual entities.
All 69 shared prices stay SM-owned; inherited pricing references carry IDs only.
Native physical import is available through roster-boot.mjs. Application registration,
UI/browser acceptance and Mega Glossary integration remain deferred.
Chapter keyword grants are conditional. Mixed-owner source/reference, physical
Effective and Personal projections are verified; full DA gameplay is deferred.
Astraeus/Thunderhawk remain MFM-only; Deathwatch Support has a separate owner.
The Cyclone price is unit-owned source data; no MODEL, selection or physical
charge is inferred. Historical DA Legends retain their original v1.4 provenance.
Lazarus source relation disagreement is preserved; eligibility is not activated.

Source confidence
SOURCE_COMPLETENESS=PARTIAL; SEMANTIC_COMPLETENESS=NOT_PROVEN.
Wahapedia reports App. Dark Angels 11E v2.8.1 (October 2026). Full official App
content was not captured. The September 2026 official article corroborates only
part of the corpus. Official faction pack v1.3 is Legends-only. Those captures
are retained as boundary evidence, not executable replacement overlays.
Source issue dispositions are in source-issues.json. No browser acceptance,
real New Recruit export or complete DA gameplay certification is claimed.

Mixed-owner consumer projection
Build/check: node books/dark-angels/v2/book-build.mjs [--check]
Independent QA: node books/dark-angels/v2/mixed-owner-qa.mjs
Caption/context QA: node books/dark-angels/v2/mixed-owner-context-qa.mjs

book-build.mjs admits the exact 180 reviewed SM references and their source-owned
descendants. It composes 16 DA + 67 SM Datasheets, 113 MODEL profiles and 397
weapon profiles through existing native projectors. owned-book-view.mjs and
datasheet-build.mjs perform the established disposable native layout aliases.
SM facts remain in the existing SM canonical/effective owner; no SM sources,
canonical records or identities are authored under DA. The generated mixed-owner
artifacts are disposable projections and must never become factual build input.

Existing card.identity.registryId records the canonical owner. Caption reference
bookId instead records the DA consumer domain. The shared parent, field, path,
span and canonical membership validation is preserved, without widening a guard.
Source-backed equipment captions cover 11 inherited SM and 3 DA occurrences.

Existing SM keyword normalization is applied only to its disposable view: the
26 reviewed conditional tokens are not intrinsic grants. No physical Chapter is
inferred from membership, a Detachment, attachment or caller-supplied extra state.
The shared context passes caller extras but does not establish source provenance
for a Chapter assignment. The reviewed army applicability binding strips forged FIELD claims.

83 unit price references use the central owners (16 DA + 67 SM); two additional
SM MFM-only units remain references without native Datasheets. Shared Detachment
and item references retain SM ownership. Source Leader/Support declarations are
addressable, but no attachment policies are activated; Lazarus and all ten
REFERENCE_ONLY relation targets remain unresolved/inactive. Constructed physical
Stage 2C snapshots test projections without adding a New Recruit importer or effects.

Native Chapter mechanics and rule presentation
Build/check: node books/dark-angels/v2/rule-contract-build.mjs [--check]
Presentation: node books/dark-angels/v2/gameplay-presentation-build.mjs [--check]
Source coverage/mutations: node books/dark-angels/v2/rule-clause-review-qa.mjs
Gameplay/physical scope: node books/dark-angels/v2/gameplay-qa.mjs
Chapter evidence boundary: node books/dark-angels/v2/chapter-context-qa.mjs

rule-clause-review.json addresses 252 literal clauses from 131 DA-owned operative
source records. Complete source context, spans, hashes and provenance are retained;
segmentation is a transcription locator, never a gameplay inference. Layout-only
headings, duplicate aggregate ability sections and numeric weapon/model facts are
accounted separately. Five nested Ezekiel/Lion abilities remain separate records.
41 clauses have a fully covered typed/native binding; 203 remain source-backed
text and 8 are NOT_PROVEN (Lazarus source conflict). Six source-reviewed Army Rule
clauses join the original nine typed DA lowerings, which include one partial clause: Honour or Death executes only
Charge +1. Its Advance +1 and CP restriction remain text, not an executed claim.
15 source InSv panels seed exactly their 20 explicit MODEL recipients; 12 native
Core ability occurrences retain parameters, including Lone Operative 15 inches.
Qualified/activated FNP, incoming Wound/Damage and battle events remain full text.

The closed consumer reuses the existing SM producer: 253 child contracts and 35
typed clauses preserve SM source ownership. Four foreign-Chapter weapon exclusions
are intersected with consumer membership; originals remain in the projection log.
Text-only root SM Army rules are not rebound to the DA owner to bypass validation.
SM physical-choice FIELD bindings remain conditional without their required proof.
No SM canonical data or generated factual output is authored under DA.

roster-runtime.mjs is a snapshot adapter to the existing shared runtime, not a new
executor or importer. load/recompute rebuilds source physical Ancient/Champion
presence from exact canonical MODEL rows with positive quantity. Invalid load
preserves the prior runtime. Enhancement eligibility uses the existing selectors,
including exact MODEL bearer and UNIT Upgrade scope. UNIT keyword grants are not
copied into MODEL keywords. Attachment permissions remain inactive; diagnostic
formation tests prove scope only, not source-valid attachment eligibility.

Army applicability correction (Stage 3B.1)
The Deathwing/The Ravenwing target friendly ADEPTUS ASTARTES UNIT categories;
they do not require a second DARK ANGELS Faction keyword on common recipients.
Space Marine Chapters defines a second Faction keyword if present and prohibits
mixing Chapters. It does not mandate adding a Chapter keyword to common units.

A source-fixed DA physical UNIT plus the validated closed DA/common membership
is sufficient evidence of DA army applicability. All 18 DEATHWING and 8 RAVENWING
conditions now have executable PHYSICAL UNIT grants gated by that proof. This is
a sufficient technical proof, not a source requirement to include a DA-specific
Datasheet. A generic-only army may be legal, but its context remains NOT_PROVEN
without an independently reviewed army declaration. No selector is invented.
Book, Detachment, attachment, names and unvalidated faction headers alone remain
insufficient. Removing the final DA member removes grants; no Chapter is assigned
to generic UNITs or MODELs. The existing FIELD binding is derived on every load.

Shared effects.mjs dispatches genuine root ARMY_RULE contracts only when they
contain roster-executable effects, once with a roster source. Global targets and
TARGET-only conditions are required; source-relative bindings fail closed.
Existing text/battle-only roots and parented components preserve their behaviour.
No new operation, schema, importer, renderer or faction-specific shared branch.
QA: node books/dark-angels/v2/chapter-applicability-qa.mjs

Physical Chapter validation
QA: node books/dark-angels/v2/physical-chapter-qa.mjs

The accepted SM source condition army-rule-sm-0fc8f686c793466d defines an actual
second Datasheet Faction keyword as that UNIT's Chapter. chapter-source-review.json
pins this existing source and 16 exact DA Faction Keyword panels. This is proof
metadata over canonical owners, not a new Chapter catalog or assignment input.
chapter-bindings-build.mjs verifies canonical/source identities, field fingerprints
and ownership. The consumer membership remains 83 Datasheets and 180 inherited
references; the SM source condition is an evidence reference, not an extra DA rule.

physical-chapter.mjs validates the existing physical roster and resolves each
physical instance independently. Its canonical Datasheet must have the reviewed
second Faction keyword. All 16 DA-owned types have explicit DARK ANGELS; the 67
generic SM types have only ADEPTUS ASTARTES and remain CHAPTER_CONTEXT_NOT_PROVEN.
Ownership, ordinary/formed keywords, title, army faction, Detachment and attachment
are not Chapter proof. Unvalidated snapshot Chapter fields are ignored.

The existing runtime adapter recomputes contexts atomically on every load. Query
chapterContext(instanceId) returns the canonical source references and disposition.
UNIT context exposes source-derived daPhysicalChapter only when proven, plus
daChapterContextStatus. Caller extras cannot supply either field. Nothing is
written into the snapshot or MODEL keywords; MODEL context receives no UNIT Chapter
field. Invalid load preserves the previous runtime and Chapter contexts.

Intrinsic Chapter remains proven only for 16 DA-owned types. All 67 common SM
faction arrays remain unchanged. chapterContext(instanceId).armyApplicability
separately reports the physical member, source-fixed DA anchor instances and
source references used for conditional grants. The UNIT FIELD is derived from
this proof, cannot be supplied by caller extras and is absent from MODEL context.
Native New Recruit-compatible input and the existing shared candidate handoff are
now tested with constructed input; a genuine DA New Recruit export remains unverified.

Native New Recruit / physical roster (Stage 3C)
Build/check: node books/dark-angels/v2/roster-import-build.mjs [--check]
Source/input QA: node books/dark-angels/v2/roster-import-qa.mjs
Lifecycle/ownership QA: node books/dark-angels/v2/roster-import-lifecycle-qa.mjs
Paid options: node books/dark-angels/v2/roster-paid-options-qa.mjs
Native relations: node books/dark-angels/v2/roster-relations-qa.mjs

roster-import-build.mjs consumes the existing DA gameplay projection and admitted
SM import metadata. It adds 21 DA source-confirmed composition/profile joins,
retains the 92 common SM joins (including previously reviewed Vanguard mappings),
and does not author common source facts. All83 members preserve canonical owner,
ID and provenance. All113 MODEL profiles and397 weapon profiles have constructed
input coverage. Source-named alternative profiles retain one physical quantity.
Ravenwing Command Squad has three separate MODEL profiles. Azrael has one MODEL;
Watcher is an ability/token, not an invented composition member or import alias.

roster-import.mjs uses the existing shared import-only service and atomic runtime
commit with keep/replace confirmation. Roster load revalidates physical quantities,
source equipment identities/fields/provenance and exact Enhancement bearers.
Duplicate physical selection keys are rejected. Invalid import or snapshot does
not replace the active roster. Identical reimport retains the current graph,
including an explicit detach. The source-qualified Chapter binding is recomputed
from the imported physical army; a generic-only army remains explicitly unresolved.

Paid equipment is an established book-owned physical projection over central
MFMv1.6, not a new pricing engine. Seven applicable SM purchase bridges are reused;
DA Cyclone is bound to its existing replacement permission and two weapon profiles.
Only selected physical quantities are charged; alternative profiles are one purchase.
Unknown omitted inventory remains UNRESOLVED with totalPoints=null and the existing
points warning. UNIT aggregate equipment never supplies a MODEL bearer; the known
MODEL equipment effect is applied only in its exact physical composition scope.
Partial export completeness cannot be certified without authentic export evidence.

Native attachment permissions use exact accepted source hyperlinks and persistent
membership, independently from central MFM reference-only declarations. There are
134 active native edges (30 DA +104 inheritedSM). All Lazarus permissions remain
inactive because SOURCE_CONFLICT is not adjudicated here. Ten central relation-only
REFERENCE_ONLY records remain unmodified and inactive; native permissions do not
promote those MFM references. Deathwatch/otherChapter members are not admitted.

Runtime modules are browser-native and exposed through the standard roster boot.
No production registration, browser acceptance or actual New Recruit export is
claimed. REAL_NEW_RECRUIT_EXPORT_TESTED=NO. SOURCE_COMPLETENESS=PARTIAL and
SEMANTIC_COMPLETENESS=NOT_PROVEN remain. Conditional battle mechanics retain text.

Static gameplay completion (Stage 3D)
QA: node books/dark-angels/v2/static-gameplay-qa.mjs

The unchanged 252-clause source ledger now records 42 EXECUTABLE_PROVEN,
202 TEXT_ONLY_SOURCE_BACKED and 8 NOT_PROVEN. This stage adds only Sammael's
literal "This unit has MOBILE." clause. Core units-and-models and terrain
movement definitions explicitly prove MODEL scope. Existing GRANT_MODEL_KEYWORD
targets the source's physical models while detached and validated formed models
while attached; those two branches are exclusive. Source/Core provenance is
retained. No movement simulation or new shared operation is introduced.

Independent constructed-input checks cover repeated bodyguards, Leader/Support
formations, coexistence with the Ancient's OC modifier, detach/reattach, recompute,
snapshot reload, identical reimport and confirmed source removal. Effective and
Personal projectors retain MOBILE and its physical source. Mutation controls
remove the effect, corrupt the Core scope proof and omit formed recipients.
Chapter grants remain UNIT-scoped and require the existing army proof; generic-only
input remains unresolved. Darkflight's RAVENWING+FLY restriction is unchanged.

Command-phase Doctrine choice, incoming modifiers, rerolls, qualified FNP,
unknown proximity, Advance-roll/CP mechanics and unknown battle events remain
non-executable source text. The 8 unresolved clauses remain Lazarus source
relation conflicts. Ten MFM relation-only references remain inactive. Full source
and semantic completeness, authentic NR export and browser acceptance are not
claimed. No changes to SM facts, central MFM or shared production are required.
