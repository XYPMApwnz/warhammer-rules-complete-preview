# Parallel Death Guard factual pipeline

This directory owns the isolated V2 experiment. Production readers, routes,
roster/effect runtime, Core, Missions, Glossary and offline delivery remain V1.

`sources/source-enrollment.json` records official source identity, integrity,
authority, lifecycle, applicability and reconciliation. The accepted Waha corpus
and its recovered raw pages form the base. Separately captured referenced images
retain their actual capture date; historical image byte identity is not asserted.
Local Git attributes preserve external HTML captures and PDF extracts byte for
byte across platforms; source whitespace is not reformatted.

`normalize.mjs` preserves source identities and provenance, with one canonical
owner for each profile, weapon, section, rule and option. Datasheets reference
those records. Display titles do not resolve factual joins. Source capture gaps
remain explicit until evidence closes them.

`MODEL_BASE` records preserve the exact decoded physical Base notation from
integrity-checked accepted datasheet header spans. Each record's `parentId`
identifies the model `PROFILE`, and `data.scope` is `MODEL`. `data.text` retains
source notation, including diameter marks and "Use model"; it is not a numeric
combat characteristic. Raw-page hash, locator and source identity remain in
provenance. Multiple ambiguous Base spans fail closed rather than flattening
profile ownership. A source with no Base span produces no Base record.

`overlay-engine.mjs` applies declared ADD, REPLACE, REMOVE and QUALIFY operations
to a copy of the base. Targets and field paths are explicit. Source precedence,
conflicting writes, duplicate ownership and unresolved identities fail closed.
The historical base is never overwritten.

`mfm-boundary.mjs` consumes the existing centralized MFM projection directly.
The effective model stores central record references and provenance rather than
DG-local price values. `resolveOwnedFact(recordId)` reads the central owner.
Army-owned Support exceptions retain separate accepted-source evidence.
`mfm.eligibilityEvidenceBindings` marks the 11 retained LEADER sections as base
evidence for eligibility. Future readers must obtain current eligible targets
from `mfm.relations`; Army-owned second-Leader and separation clauses remain
source evidence with their separate exception references.

`buildFactualV2()` returns the canonical base and one effective factual model.
It does not read V1 facts or generated catalogs. `buildV2()` adds a separate,
read-only comparison against V1. Comparison results cannot feed normalization.
Neither build writes production output or performs network access.

Run from the repository root:

```
node books/death-guard/v2/build.mjs
node books/death-guard/v2/build.mjs --check
node books/death-guard/v2/overlay-qa.mjs
node books/death-guard/v2/mfm-boundary-qa.mjs
node books/death-guard/v2/qa.mjs
node books/death-guard/v2/comparison-qa.mjs
node books/death-guard/v2/model-base-qa.mjs
```

Generated snapshots live only under `v2/generated/`. The source registry can
mark the model STALE when a newly enrolled applicable official source has not
been reconciled, or BLOCKED when source evidence is unresolved. This metadata
does not implement an internet polling service.

The current update workflow is demonstrated by the Plague Marines Boltgun
(`datasheet-plague-marines:weapon:2`): its pinned base Strength is 4 and AP is 0.
Faction Pack v1.3, page 7, explicitly REPLACEs those fields with Strength 5 and
AP -1. The effective record retains the overlay operation and PDF provenance;
the base record remains unchanged. The Poxwalkers profile
(`datasheet-poxwalkers:profile:default`) passes through unchanged, without a
characteristic overlay.

## Factual foundation closure

`foundation-closure.json` classifies the complete 158 previously missing source
leaves from the source-first audit at `9d0f5afe0f26afad21b56224d3e11ca3bbf9358a`.
Thirteen leaves are gameplay facts; 142 are reference metadata, one is source
navigation, one is presentation metadata and one is non-gameplay text. The latter
classes remain explicit `sourceAccounting` evidence; they are not gameplay
entities or executable rules. The original audit deferred 966 applicability
relationships; the Rule Contract foundation below now classifies that domain.

`foundation-facts.mjs` preserves accepted Introduction instructions, the scoped
Stinking Mire replacement directive, and the official profile-selection note.
Defiler selection has two stable profile groups with four explicit profile IDs;
there is no title/prose join. Source errata reference exact target field paths.
`table-facts.mjs` resolves nested raw source structure into one innermost semantic
table owner; layout occurrences retain references without independent values.

The image capture manifest is enrolled using unchanged accepted Git bytes and
raw SHA256. Scoped `-text` forbids checkout conversion. No line-ending
normalization is allowed in the integrity contract.

## Rule Contract V2 foundation

`rule-contract-build.mjs` adds typed semantics to the existing effective
canonical records, under `entity.ruleContract`. It does not introduce another
rule owner. All factual `data`, IDs and provenance remain unchanged. Source
fields point to the original text, tables and clauses; `currentness.sourceIds`
also retains overlay sources. Enhancement point ownership references central
MFM records, without copying their prices.

The source-owned inventory has 239 records: seven Army Rule records (including
five existing components), 37 Datasheet Ability owners, nine Detachment Rules,
30 Enhancements, 45 Stratagems, five source errata and 106 other rules. The 36
existing ABILITIES sections contain 64 separately classified clauses; one
supplemental ability brings the clause total to 65. These nested clauses keep
their existing section owner. Their local source-field addresses do not create
position-derived independent rule identities. Other rules include composition,
wargear, transport, Leader/Support and book-usage instructions.

Predicate subjects MODEL, UNIT, FORMED_ATTACHED_UNIT and ROSTER are explicit.
Each predicate has STATIC, ROSTER or BATTLE context. The finite contextual-field
vocabulary is declared in `rule-contract-state-fields.mjs`; an unknown field,
predicate, canonical identity or type is INVALID. Only unavailable valid context
returns UNKNOWN. The public mapping is TRUE→MATCH, FALSE→NO_MATCH,
UNKNOWN→CONDITIONAL, INVALID→INVALID.

Stratagem contracts preserve CP, timing alternatives, primary targets, secondary
actors, static selectors, roster and battle conditions, effects, restrictions
and duration. A missing source expiry stays NOT_EXPLICIT. Model keywords do
not inherit another model's keywords. Unit keyword queries can remain UNKNOWN
when a possible source-legal attachment has not been supplied. This policy
consumes accepted Core codes 02.05.01/19.03 and central MFM attachment relations;
it does not form an Attached Unit or mutate effective facts.

The compatibility projection asks TARGET_ELIGIBILITY, rather than whether an
entity can receive an army-wide effect. In particular, Plaguesurge's physical
Warlord target remains distinct from its beneficiaries. Effect actors retain
their separate bindings for future consumers. Enhancement ownership selectors
are also preserved separately from conditional effect applicability.

`rule-source-addresses.json` binds 84 publisher reference addresses to existing
canonical rule IDs. Those explicit bindings are validated against accepted raw
source. They re-enumerate the previous source-card domain (591 Stratagem, 211
Detachment Rule and 164 Enhancement occurrences). Cards and old matrices never
provide compatibility answers. All answers follow from contracts and canonical
unit facts; the full 3024-row projection is disposable.

`rule-contract-source-evidence.json` is source-first QA evidence only. Python
lxml independently verifies its 84 raw clauses; Node checks selectors and
typed conditions against that census. QA includes ten schema rejection controls,
ten production-contract/projection mutations and a synthetic exclusion control.
An EPIC HERO exclusion is absent from the accepted current DG sources, so it
is not invented in production. The synthetic NOT control covers that schema
shape. The guard also checks phase/turn alternatives, static Deadly Demise,
leading-state removal, physical Warlord isolation and model/unit keyword scope.

`rule-contract-v1-inventory.json` records each old artifact's V2 status and its
remaining V1 production dependency. No V1 artifacts are deleted or rewritten.
At Rule Contract foundation closure, Reader, Phone, Glossary and Roster V2
migrations had not started. The subsequent shared Army Book App V2 stage is
described in `APP_V2.md`; Glossary and Roster remain deferred.

```
node books/death-guard/v2/rule-contract-build.mjs
node books/death-guard/v2/rule-contract-build.mjs --check
node books/death-guard/v2/rule-contract-qa.mjs
```

These commands write/check only `v2/generated/rule-contract-effective.json`,
`compatibility-v2.json` and `rule-contract-closure.json`. They do not publish UI,
execute Stratagem effects or simulate battle state. Army/Datasheet execution is
classified only; the full future effect language remains deferred.

Run `npm run qa:dg:v2:foundation` for the permanent source-backed guards and
in-memory mutations. The independent raw-source checks use Python with lxml and
pdfplumber (the bundled Codex runtime is discovered automatically; `PYTHON` may
select another installed runtime). This guard is separate from Reader/Phone,
Rule Contract V2 and production publication.

Stratagem TARGET prerequisite closure
------------------------------------

The original producer copied hand-maintained `roster`/`battle` lists instead
of normalizing TARGET qualifiers; its old evidence checks shared that omission.
`stratagem-target-conditions.mjs` now normalizes accepted TARGET grammar during
build, for primary and secondary targets. Unsupported qualifier wording fails
construction. Static selectors and effect adjudication retain their existing
owners. No source text or player-facing factual record changes.

The independent `stratagem-target-source-qa.py` re-enumerates 45 matched-play
cards from pinned HTML and verifies the current supplement/update PDFs and
reported Beasts of Nurgle tooltip occurrences. Its 47 state/eligibility atoms
include 44 primary and three secondary-target conditions; static keyword
selectors remain covered by the existing Rule Contract source guard. Eight
demonstrative TARGETs retain their event-actor binding. No accepted TARGET
clause in this corpus adds a Battle-shocked prerequisite.

Three omissions are closed: Tallyband Summoners Stratagems 3 and 6, and
Contagion Engines Stratagem 3. `withinEngagementRangeOfTriggeringEnemy` is a
BATTLE boolean for the primary target's relation to the specific enemy
referenced by the trigger. General engagement with a different enemy does not
satisfy it. Unavailable valid context remains UNKNOWN; malformed context is
INVALID. This schema addition does not simulate engagement or execute effects.

`stratagem-target-qa.mjs` compares exact subject, role, polarity, context and
source-clause proof for every independently derived atom. The main Rule Contract
QA invokes this guard too. Its 62 mutations include dropping every atom,
moving engagement prerequisites to effect roles, using the wrong context or
subject, flattening compound action/engagement meaning, and severing TARGET
proof. Allowed and forbidden full-role evaluations are checked for all three
repaired contracts, alongside all 47 predicate controls.

```
python books/death-guard/v2/stratagem-target-source-qa.py --summary
node books/death-guard/v2/stratagem-target-qa.mjs
node books/death-guard/v2/rule-contract-qa.mjs
node books/death-guard/v2/rule-contract-build.mjs --check
```

The independent JSON census is disposable QA evidence, checked against raw
sources on every guard run. It is never a production semantics input.

Enhancement predicate subject closure
------------------------------------

Clause FIELD declarations bind an explicit participant role; the producer
derives their subject from that role. Implicit bearer conditions retain their
owner identity. A second MODEL participant is not interchangeable with the
bearer. Unknown roles, conflicting subjects and unbound non-owner conditions
fail construction. Schema validation checks the actual bound role, including
role bindings nested inside ALL, ANY and NOT.

Rejuvenating Swarm's source says "this unit" without requiring a leading state.
Its attack-strength condition is UNIT/BATTLE, bound to affected-unit. It accepts
ordinary eligible unit context with no attachment information; unavailable
battle context is UNKNOWN, and invalid subject/type is INVALID. Source-supported
leading conditions and FORMED_ATTACHED_UNIT recipients remain unchanged.

`enhancement-predicate-source-qa.py` independently re-enumerates all 30 accepted
raw Enhancement cards, verifies source identities and current PDF overlays,
and validates reviewed source expectations. The JSON expectations are QA
adjudication, never generated contracts or production inputs. Every run covers
67 roles, 194 predicates and the 60 assignment selector predicates. The Node
guard compares every role, subject, context, selector, condition and binding;
the main Rule Contract QA invokes it too.

The focused QA rejects 584 mutations, including coordinated UNIT/formed scope
changes that still pass schema, owner MODEL/UNIT confusion, attachment predicate
loss, assignment drift and same-subject bearer/Bodyguard identity mistakes.
Eight schema rejection controls and three producer rejection controls cover
the original defect and role-binding failures. No factual text, effect runtime,
Reader or Related Rules output changes.

```
python books/death-guard/v2/enhancement-predicate-source-qa.py --summary
node books/death-guard/v2/enhancement-predicate-qa.mjs
node books/death-guard/v2/rule-contract-qa.mjs
node books/death-guard/v2/rule-contract-build.mjs --check
```
