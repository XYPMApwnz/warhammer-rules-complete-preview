# Adeptus Mechanicus V2 factual foundation

This directory owns the source-to-canonical factual build for Adeptus Mechanicus.
It is not wired into the published reader or the Death Guard platform. The
separate, bounded Rule Contract build below consumes this factual foundation.
There is no AdMech attachment interpreter or effect runtime integration yet.

## Inputs and authority

`sources/enrollment.json` pins exact file bytes and the accepted scope. The
operational baseline is the current 11E source capture from 25 September 2026.
The official GW Faction Pack v1.3, dated 30 September 2026, is enrolled here as
stronger current update/FAQ evidence. Its non-Legends content agrees with the
accepted operational baseline; the current update checkpoints are independently
tested against the PDF. Legends, Boarding Actions and Crusade are excluded.

Existing raw HTML is unchanged. Its checked-in LF bytes differ from the historical
CRLF capture hashes. Enrollment records both representations, while the build
validates the actual bytes without rewriting or normalizing them. The historical
correspondence is a separate QA assertion.

The accepted source-defect ledger owns three literal editorial adjudications.
`source-adjudications.json` binds them to their actual source occurrences. For
Tribute of Empathic Veneration, the accepted Codex transcription is consumed for
one explicitly enrolled title field only. It is not first-party corroboration;
the official current pack does not reproduce that Stratagem. No eligibility,
effect, ownership or legacy contract field from that transcription is consumed.
The stale occurrence ID in the old defect ledger is recorded in the title evidence.

## Canonical ownership

`build.py` derives `generated/base.json` from accepted sources and the book-owned
identity declarations. It derives `generated/effective.json` by applying only the
three accepted source adjudications. Rebuild these projections; do not edit them.

Each entity has an explicit canonical ID and provenance: source ID/path plus a
JSON pointer, or a raw DOM XPath and SHA256, or an official PDF page. Reference
metadata links to existing owners and never supplies independent gameplay answers.
The raw source capture and enrollment remain available for field-level tracing.

- Ordinary characteristics belong to individual MODEL profiles. Servitor
  Battleclade preserves both profiles, their distinct W/Ld values, their Bases,
  and the Underseer-only TECH-PRIEST keyword scope. Its shared 6+ invulnerable
  save has one owner, explicitly referenced by both profiles.
  Base-size qualifiers remain separate source notes: Gun Servitors use 32mm,
  and Skitarii with a transuranic arquebus use 60 x 35mm. They are not flattened
  into the ordinary Base value or applied to unrelated models.
- The explicit UPGRADE label on Stealth-Screened Cybercanids is preserved from
  raw source with field provenance; it is not inferred from an old owner contract.
- Weapon profiles retain source IDs, modes, values and abilities. Seven source
  selection instructions reference eight distinct weapon groups; Thulia's ranged
  and melee groups remain separate. There are no title joins at runtime.
- Datasheet sections retain source-backed ability, wargear, composition, transport,
  damaged and attachment text. Leader/Support/receiver declarations reference
  canonical in-scope units by source links. Legends references are marked as
  excluded metadata. No attachment capacity, derived edge or execution semantics
  is invented.
- Individual Core/Army ability references preserve source labels and tooltip
  references. They do not copy Core definitions or combine several rules into a
  new definition. Canonical popup binding belongs to a later consumer stage.
- Nested layout-table occurrences reference the innermost semantic table. Its
  values have one canonical owner; the flattened duplicate is removed from the
  operative rule text. Source occurrences remain traceable.
- Official update references identify canonical targets and exact PDF pages.
  Operative facts remain owned by their rule/profile records. The separate
  update/FAQ directives remain preserved in source erratum records/PDF evidence.
- Prices and force-disposition assignments remain centralized MFM facts. Their
  captured copies are explicitly accounted as `MFM_OWNED`, not imported as a new
  points catalog. This foundation adds no new MFM consumer or prices.

## Census units and guards

The canonical corpus has 34 datasheets, 35 MODEL profiles, 139 weapon profiles
(138 datasheet profiles and one Enhancement weapon), one Army Rule with three
components, 10 Detachments/rules, 34 Enhancements and 51 Stratagems. The ability
count is 66 source `ABILITIES` blocks, including wargear abilities and preserving
compound blocks; it is not a claim of executable clause atomization. Core ability
memberships are inventoried separately. There are nine attachment declarations:
three Leader, three Support and three receiver declarations.

`generated/factual-census.json` reports independently compared source values.
Its scalar count includes source-backed presentation/reference metadata as well
as gameplay fields; it is not a count of gameplay clauses or an applicability
denominator. `factPartitions` names every comparison. Each capture scalar also
has an explicit disposition in `sourceLeafAccounting`: canonical fact, capture
occurrence/reference, source/reference metadata, or MFM-owned. Introduction
Crusade sentences are separately accounted as excluded scope. Additional raw
profile/keyword/Base/selection/qualifier/Introduction facts omitted by the old
structured capture are independently checked against raw DOM evidence.

`factual-qa.py` does not import the producer. It checks the complete identity
domain, raw profile/weapon/keyword/reference scopes, source fields, source leaf
dispositions, current official updates and effective deltas. Mutations poison
both base and effective projections, so the other snapshot cannot mask a weak
source comparison. `source-isolation-qa.py` rebuilds in a temporary tree that
contains only enrolled sources and this producer, without V1 generated facts,
adapters or effect contracts. Poisoned non-title legacy fields cannot change the
result; poisoned accepted title evidence fails closed.

Run with Python 3, `lxml` and `pdfplumber`:

```text
python -X utf8 books/adeptus-mechanicus/v2/build.py
python -X utf8 books/adeptus-mechanicus/v2/build.py --check
python -X utf8 books/adeptus-mechanicus/v2/factual-qa.py --write-census
python -X utf8 books/adeptus-mechanicus/v2/source-isolation-qa.py
```

Build/check is network-free. The current official PDF and its text extraction are
pinned artifacts. Existing DG source, contracts, runtime, presentation and shared
architecture are untouched.

Validation for this foundation also ran the existing local AM checks (215/215),
DG V2 fact parity (3654), DG roster runtime and the desktop/phone visible-effect
checks (22/22, mega-case and detach/re-attach). The repository-wide `qa:sources`
entrypoint remains blocked by an unchanged DG manifest omission:
`books/death-guard/sources/death-guard-wargear-option-contracts.v1.json`.
That global baseline issue is separate from the passing V2 source enrollment,
current-PDF parity and closed-input checks here.

## Rule Contract stage: represented subset, explicit limitations

`rule-contract-build.mjs` uses the shared schema, typed binders and
profile-aware compatibility compiler. The three
`contract-*-declarations.json` files own reviewed book-specific declarations;
the corresponding review files are diagnostic records, not runtime inputs.
No legacy AdMech contract or compatibility answer participates.

There are 204 substantive existing canonical rule owners: 52 rule-bearing
datasheet sections, 39 wargear options, seven weapon-selection instructions,
three Army Rule components, ten Detachment rules, 34 Enhancements/Upgrades,
51 Stratagems and eight source errata. Compound abilities remain clauses of
their existing section owner. The Army Rule root is a reference container;
two literal `None` options are absences, the introduction is scope guidance,
and attachment metadata references the authoritative section. The exhaustive
entity disposition ledger is regenerated with the census.

All 204 contracts are source-bound and schema-valid. No current source owner
remains blocked. TL-4Ø9 contributes only a reference to the existing canonical
weapon profile to its exact physical bearer; the canonical weapon definition
and base datasheet remain unchanged. Ownership does not transfer on attachment.
The three Doctrina components preserve their UNIT prerequisite through canonical
Army Rule reference memberships. The book producer lowers those relationships
to existing STATIC ANY/UNIT_ID predicates, without a manually authored unit/rule
answer table or MODEL_ABILITY substitution. Protector and Conqueror activation
are independent UNIT/BATTLE fields: absent battle context stays CONDITIONAL,
and both can be represented as active without an exclusive option state machine.
All seven clauses retain source text, lifetime and battle-only applicability;
none grants HEAVY/ASSAULT or changes BS/WS from ordinary roster state.
Seven previously blocked owners now use shared MODEL keyword grants and
MODEL/UNIT keyword removal: three Chaff Launcher sections, Data-severed,
Onager data-tether, Transoracular Dyad Wafers and Martial Signatum Amplificator.
Their complete sections retain nonexecuting battle clauses and source-backed
equipment, attachment and owner prerequisites. Data-severed uses initial
Kastelan attachment state; battle casualties are not simulated. Transoracular
Dyad Wafers preserves its Noospheric Transference selection exclusion as
nonexecuting battle metadata. Martial Signatum has separate standalone and
attached model bindings under its single existing owner.

Seven further owners use canonical scoped ability grants: Temporcopia,
Stealth Optimisation, Clandestine Infiltrator, Malphonic Susurrus,
Electromiasmic Brazier, Explorator Dispensation and Stealth-Screened Cybercanids.
Their references resolve through the current effective Core catalog; definitions
are not copied. MODEL grants preserve profile recipients, UNIT grants preserve
formed versus exact physical owner scope, and Scouts 6" / Lone Operative 15"
retain their source parameters. The pure compatibility build does not need Core
definitions; roster grant consumers explicitly inject the resolved reference registry.

Five further Enhancement owners compose the existing numeric modifier and weapon-ability mechanisms. BS/WS improvements preserve ranged/melee scope; Range and AP preserve signed numeric direction. Both-Imperative Enhancements retain canonical Protector/Conqueror references, grant their unconditional HEAVY/ASSAULT and BS/WS characteristics from roster ownership, and keep attack-resolution clauses battle-only. Ordinary Doctrina activation remains unexecuted. Cohort Cybernetica and Lords of the Forge now select global MODEL/profile recipients using separate containing-UNIT and MODEL selectors. Cybernetica Move +2 uses formed-unit eligibility; Lords of the Forge InSv 4+ and FNP 5+ use each exact TECH-PRIEST profile. Battle-shock-dependent OC and Baffling Data Screed remain nonexecuting battle clauses.

All 51 Stratagems preserve typed current-product applicability. Battle effects
remain nonexecuting source-backed clauses; 40 explicit lifetime occurrences
are bound to their actual recipients. Two objective-only lifetimes remain
exact deferred battle metadata (Cached Acquisition and Infoslave Skull),
without manufacturing an objective as a UNIT, MODEL or ROSTER. Optional target
set cardinality likewise remains source-backed battle-resolution metadata.
The Electrotraction source's explicit BATTLECLADE requirement is preserved,
even though it has no currently eligible intrinsic Electro-Priest identity.

The 6,936 compatibility rows cover all 204 represented owners against
34 datasheets; they do not certify a complete AdMech product. They are disposable output and never an authority. The overlay keeps
semantics under the existing canonical IDs, without copying factual text into
a second rules catalog. The original base/effective snapshots are unchanged.

The build-only context adapter follows explicit MODEL keyword-scope IDs and
`contract-composition-bindings.json`. Servitor Underseer and Combat/Gun
Servitors remain separate; TECH-PRIEST does not leak between profiles. UNIT
keyword union follows current Core 02.05.01. Source-backed Leader/Support
references feed the existing feasibility compiler, using current Core 24.22 /
24.34 one-Leader/one-Support semantics. These are compatibility bounds, not a
new attachment runtime. Enhancement ownership uses the physical owner's
intrinsic scope; battle activation never becomes assignment eligibility.
Omnispex targets UNIT weapons so it does not invent a requirement to be attached.

Run with Node.js:

```text
node books/adeptus-mechanicus/v2/rule-contract-build.mjs
node books/adeptus-mechanicus/v2/rule-contract-build.mjs --check
node books/adeptus-mechanicus/v2/rule-contract-qa.mjs
node books/adeptus-mechanicus/v2/keyword-roster-effects-qa.mjs
node books/adeptus-mechanicus/v2/ability-roster-effects-qa.mjs
node books/adeptus-mechanicus/v2/doctrina-contract-qa.mjs
node books/adeptus-mechanicus/v2/numeric-roster-effects-qa.mjs
node books/adeptus-mechanicus/v2/global-model-roster-effects-qa.mjs
node books/adeptus-mechanicus/v2/weapon-contribution-roster-effects-qa.mjs
node books/shared/roster-v2/weapon-contribution-effects-qa.mjs
node books/shared/roster-v2/weapon-contribution-browser-qa.mjs
node books/shared/rule-contract-v2/schema-qa.mjs
node books/shared/rule-contract-v2/bindings-qa.mjs
node books/shared/roster-v2/ability-effects-qa.mjs
node books/shared/roster-v2/numeric-effects-qa.mjs
node books/shared/roster-v2/global-model-effects-qa.mjs
node books/shared/rule-contract-v2/compatibility-qa.mjs
```

QA checks every owner disposition and binding, typed conditions, selected and
unspecified Detachments, all explicit profiles, exact physical owners, source
contradictions, duration recipients, generated-row poisoning and deterministic
rebuild. A closed-input temporary tree contains only this V2 factual snapshot,
typed declarations and existing shared modules: DG and legacy AM contracts,
runtime and generated answers are absent. The focused keyword QA reads the
captured source again, then executes only the seven newly represented owners
through the shared effects kernel. It verifies selected/absent/unknown gear,
separate physical copies, mixed MODEL profiles, standalone and attached
recipients, repeated recomputation and detach restoration. It introduces no
general AdMech runtime or additional executable abilities.
The existing `qa:am` command remains a legacy regression check only; it is not
the source oracle or contract denominator.

## Normal Army Book application

`app.html` loads one disposable V2 presentation payload and the existing shared
ArmyBookApp. It does not enable roster mode. Canonical facts and the 204 current
contracts feed the producer; central MFM records own points. Enhancement costs
use explicit canonical/MFM bindings, never title matching in production.

Both books use the same shared MODEL-profile presentation boundary. It maps
flat or nested characteristics to layout fields without changing their source
addresses, values or owners. Mixed profiles retain separate names, statlines,
Bases and keyword-scope captions. A shared invulnerable-save record remains one
owner referenced by its explicit profiles. Single-profile datasheets use the
same renderer. No army-name branches or separate datasheet renderer are added.

The book renders all 34 datasheets, 35 profiles, 139 weapon profiles (including
the canonical Enhancement weapon), ten Detachments, 34 Enhancements/Upgrades,
51 Stratagems and current updates. Source-tooltip bindings open the existing
canonical Core/Army definitions. Related Rules compiles all 2,890 unit/rule
relationships and selected-Detachment alternatives from the shared evaluator.
Book mode leaves roster and battle state unavailable; ordinary Imperatives
remain conditional. Generated compatibility rows have no factual authority.

The independent application oracle accounts for 3,138 canonical player-facing
fields. This differs from the 6,481 accepted-source census, which also accounts
for source occurrences and metadata. Browser QA checks ordinary book/detail
surfaces before its supplementary full-field view. Single-profile names may
share their identical datasheet heading, weapon modes appear through the
ranged/melee groups, and false wargear-presentation flags are not player text.
All other expected player fields must have their own visible factual binding.

```text
node books/adeptus-mechanicus/v2/app-build.mjs
node books/adeptus-mechanicus/v2/app-build.mjs --check
node books/adeptus-mechanicus/v2/app-qa.mjs
node books/adeptus-mechanicus/v2/presentation-reference-qa.mjs
node books/adeptus-mechanicus/v2/app-browser-qa.mjs
node books/shared/army-book-app-v2/profile-projection-qa.mjs
```

Browser QA uses Playwright on desktop and 390x844 phone, with optional screenshot
output through `ARMY_APP_V2_SCREENSHOTS`. It exercises canonical popups, all
Detachment filters, mixed profiles, navigation/reload/history, legacy disconnect
and V2 value poison controls. The existing DG app projection remains unchanged;
its 3,654-fact and 22-clause visible-effect guards remain regression gates.
