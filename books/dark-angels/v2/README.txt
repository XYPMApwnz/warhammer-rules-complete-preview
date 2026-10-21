Dark Angels V2 — source-reviewed army applicability (Stage 3B.1)

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
No physical importer, application registration, UI or Mega Glossary is implemented here.
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
Shared import candidate handoff is tested with constructed snapshots only; a
complete DA importer and genuine New Recruit export remain unverified.
