# Death Guard Roster Context and Effect Runtime V2

Base: `cb6f77ba582c4cab9c9efb5951f1c6dcc580c1a3`.
This phase adds roster consumption and attachment state to the existing certified
book, contracts, Reader, Related Rules and Glossary. It executes no battle action.

## Inputs and ownership

`generated/rule-contract-effective.json` remains the canonical Effective Book
and Rule Contract input. `rule-contract-build.mjs` attaches roster classifications
and typed operations to the same existing rule and clause identities. Existing
entity data, provenance, applicability predicates and MFM records are unchanged.
`generated/roster-contract-closure.json` is a disposable classification report.
The existing Reader presentation and compatibility indexes are unchanged.

The supported New Recruit format is its text export. The existing shared parser
is reused exclusively as a lexical parser. Neither its legacy canonicalizer nor
any V1 fact/effect catalog is loaded. Text exports do not supply accepted canonical
catalogue IDs. The import UI therefore requires explicit canonical bindings for
unit, Detachment, Enhancement and equipment labels; unresolved labels fail closed.
Singleton model profiles follow an existing canonical unit/profile relation.
Multiple profiles and nested equipment fields require explicit identities.
Native New Recruit JSON/XML and `.ros` formats are not claimed as supported.

Physical selected quantities are preserved separately from alternate weapon
profiles. Model-row and loadout quantities are per model; explicit unit-level
quantities are totals. An unspecified unit-level quantity in a multi-model unit
requires confirmation. Imported composition, Enhancement ownership and Warlord
identity survive V2 reload and backup. No army-construction validator is added.

## Typed state and execution

The shared `roster-v2` modules own roster UNIT instances and distinguish MODEL
rule semantics from UNIT and actual FORMED_ATTACHED_UNIT contexts. A unit's
`profiles` are composition/loadout groups with a canonical profile ID and quantity,
not a simulation of individual infantry. Aggregate Starting Strength does not
create numbered model identities or numbered profile cards. The saved `modelRows`
field retains import composition and canonical profile bindings for compatibility;
`compositionScope` distinguishes UNIT composition from explicitly imported rows.

Aggregate selected equipment belongs to the roster UNIT instance. No first model
or profile group is assigned as its owner. A single-model unit can identify its
sole model through the unit identity; an explicitly imported one-model row can
provide a meaningful row-level identity. Other groups have null model identity.
Composition `scopeId` is derived group metadata, never physical model identity.
Missing or duplicate loadout identities fail closed on load/backup restoration.

Profile groups retain intrinsic MODEL keywords for rule predicates. Formed-unit
keywords are a derived union, including applicable unit grants. MODEL context
with multiple profile groups requires an explicit scope; it never selects an
arbitrary first infantry member. Canonical facts are never mutated, and every
transition rebuilds derived state.

Canonical Leader relations and accepted additional-Leader exceptions compile to
typed attachment policies. Attach/detach/re-attach validates physical membership,
eligible Bodyguard, distinct Leader identity and permitted capacity. Support
exceptions remain Leader relationships with the accepted coexistence permission.
No transport or battle-state membership is represented.

The attachment product contract intentionally permits an upgraded Bodyguard
and two separately enhanced Characters in one source-eligible formed group.
Army-construction legality remains New Recruit's responsibility. The application
must not reject this group because it contains several Enhancements/Upgrades.
Ownership stays on each physical unit; bearer effects remain bearer-scoped and
UNIT effects follow their actual source-defined formed-unit target. The permanent
`roster-multiple-enhancements-product-qa.mjs` guard covers three distinct owners,
duplicate groups, provenance, detach/re-attach and backup/reload.

Related Rules uses disposable static capability bounds derived during build
from accepted composition and canonical attachment policies. Impossible
attachment and CHARACTER MODEL-count requirements return NO_MATCH before
unavailable roster/battle context. MODEL counts do not inherit UNIT keywords.
Compatibility also checks mandatory source-linked EFFECT_RECIPIENT roles,
including clause-local roles: book mode needs a canonical eligible recipient;
roster mode needs an eligible physical recipient instance. This does not execute
the battle action or require an existing attachment. Leading remains relative
to the physical component (Leader true, Bodyguard false). Run
`npm run qa:dg:v2:feasibility` for the independent accepted-source graph/count
census and the permanent product guard.

Independent accepted-source classification covers 239 rule owners and 306 existing
clauses: 22 ROSTER_EXECUTABLE, 161 BATTLE_ONLY, 112 NOT_AN_EFFECT and 11 DISPLAY_ONLY.
The 22 roster clauses contain 25 atomic operations. Their independent source
expectations and complete runtime controls live in `roster-contract-qa.mjs` and
`roster-runtime-qa.mjs`, rather than using V1 as a denominator.

The finite operations modify profile/weapon characteristics, grant weapon or
model abilities, grant UNIT keywords, and record rule-range modifiers. Source
and target predicates use the existing Rule Contract evaluator. Keyword grants
reach a fixed point before dependent effects. Each clause evaluates independently;
an unknown battle clause cannot suppress a known roster operation. UNIT effects
propagate across an actual formed unit, while MODEL effects target the appropriate
canonical profile/composition group or genuinely identified singleton. Each applied change records rule/clause/effect identity,
source and target physical instances, operation, before/after, lifetime and source
fields. `sourceInstanceId` and `targetInstanceId` identify roster UNIT instances.
Weapon changes retain their canonical weapon profile ID. Model identity is null
when ownership is unknown; grouped profile changes additionally identify their
canonical profile and composition scope without inventing an individual owner.
Range modifiers and caps are shown without choosing a battle round or
inventing battlefield distance. Unavailable equipment context is UNKNOWN.

Roster-aware Related Rules use the existing evaluator, intrinsic MODEL facts and
known formed UNIT facts. Detachment filtering does not change the imported
Detachment. NO_MATCH is hidden from normal results. Battle predicates stay
UNKNOWN/CONDITIONAL; no Stratagem is executed.

## Verification

Focused source QA: 450 detected mutations, all 306 clauses classified. Import QA:
17 controls. Runtime QA: all 22 independent source paths and all 25 operation
signatures exercised, with physical isolation, Silent Bodyguard, owner identity,
Leading, Warlord, quantity, Starting Strength, formed keywords, group/member and
MODEL/UNIT distinctions, modifier composition, reload and deterministic rebuild.
Reader fact parity remains 3654/3654 on desktop and 390x844 phone. Existing Reader,
Related Rules and Glossary browser suites pass with explicit V2 dependency lists.
The lexical parser is permitted; V1 factual and effect runtime dependencies are
poisoned/disconnected. Canonical data/MFM and other-book factual deltas are zero.

Relevant repository-wide legacy checks were run, without `test:full`. Their known
baseline failures also reproduce at the clean base in the Glossary worktree:

- `qa:effects`: legacy expected contract count 549 versus current source count 566.
- `qa:roster`: the Adeptus Mechanicus Archaeopter-Fusilave raw-byte pinned hash.
- `qa:integration`: the CSM entry verification/artwork assertion.
- `qa:architecture`: existing V1 generated roster-data freshness for EC, SM, DA, BA.

These are outside this DG V2 implementation; they were not repaired or used as
correctness oracles. `qa:dg` passes. No full independent red-team, push or deployment
is performed in this phase.

## Unit-instance regression guard

Run `node books/death-guard/v2/roster-unit-instance-qa.mjs` alongside the existing
import, source-contract, runtime and desktop/phone roster QA. It checks aggregate
Biologus/Plague Marines weapon provenance, two differently equipped Plague Marines
instances, optional equipment, grouped quantities, attach/detach/re-attach,
reload/backup, singleton MODEL semantics and Silent Bodyguard. Output mutations
must detect invented aggregate ownership, lost quantities and instance leakage.
