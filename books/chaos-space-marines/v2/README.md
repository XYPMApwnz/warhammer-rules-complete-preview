# Chaos Space Marines V2 source-first foundation and Rule Contracts

This is the source-first factual stage based on
`e77ea12d312f1bec6ea6632e102777792c06de38`. The factual foundation is unchanged.
The subsequent semantic overlay uses the existing shared Rule Contract
schema, binders and compatibility compiler. It is not wired into the Army Book,
roster import or player-facing effect projection. The book-owned executable
declaration layer below is independently exercised with canonical-ID roster
inputs; it is not connected to import or UI. The shared runtime supports Wounds modifiers,
canonical MODEL ability suppression and specific canonical MODEL ability ranges.
Living Carapace, Slaves to None and Crown of Worms are lowered.

## Accepted inputs and denominators

`sources/enrollment.json` pins 66 local artifacts from the accepted September
29–30 capture: the official Faction Pack v1.2 PDF, current operational corpus
and its 55 HTML pages, capture/defect metadata, current official MFM captures,
and two allied **points-only** dependencies. Builds are network-free. Frozen
reproducibility does not assert that these captures remain current forever.

The original HTML capture hashes describe CRLF bytes. Enrollment separately pins
the repository's LF bytes and preserves the original capture hashes; source
files are unchanged. Historical MFM versions, BSData, legacy CSM content,
contracts, fixtures, compatibility tables and generated publications are not
inputs. The older manifest/publication remains untouched.

`sources/source-census.json` freezes **1,825 typed source entities**, not 1,825
atomic facts. The producer rebuilds their payloads from accepted sources, never
from a prior audit payload or PASS report. Parent source text, structured
children and repeated source occurrences are reconciled to canonical owners.
The preserved partitions include:

| Partition | Count |
|---|---:|
| Non-Legends datasheets / explicit model statlines | 54 / 60 |
| Composition members / composition rules | 78 / 54 |
| Weapon profiles | 315 |
| Ordinary datasheet ability occurrences / equipment abilities | 89 / 7 |
| Army Rules / Detachments / Detachment Rules | 2 / 17 / 17 |
| Enhancements / Stratagems | 62 / 93 |
| Attachment declarations / current in-scope directed relations | 21 / 58 |
| Wargear options / upgrade declarations | 87 / 3 |
| FAQ / secondary errata / official update blocks | 17 / 18 / 34 |

The 89 ordinary abilities are occurrences, not distinct titles; Warmaster's three
named components are separately preserved. Six literal “None” option records
are metadata outside the 87 substantive options. Attachment declarations retain
their exact source text, including references outside the current book scope;
no Legends datasheets or runtime relationships are fabricated. Two allied MFM
dependencies do not supply allied gameplay datasheets.

## Identity and ownership

`identity-bindings.json` assigns persistent canonical identities to source nodes.
The build rejects collisions or unbound parents rather than deriving identity
from a display name, source code, title or order. `capture-bindings.json` binds
source-addressed MFM occurrences and direct Army Rule memberships to explicit
identities. Source names are only checked as source grammar during validation;
they are not runtime gameplay joins.

Canonical records use `id`, `kind`, `ownerId`, `displayName`, `data`, and
`provenance`. `sourceAccounting` binds every source entity to its record and
factual owner. Structured tables own their rows; parent rules reference the
tables. Composition members own their quantities; composition rules reference
members and retain source-backed equipment/static text. Upgrade choices,
Warmaster components and repeated notes similarly retain one owner. The five
Marks options reference their owning selection rule. Three paid MFM options
have explicit weapon/option identity bindings.

`model-bindings.json` preserves 78 composition roles against 60 explicit
statlines. A shared statline does not widen a role-specific keyword: Mindwitch
and Garlon retain their exact PSYKER recipients. Invulnerable qualifiers and base
size exceptions are retained. No individual selected weapon ownership is
inferred. `model_sources.py` reconstructs and verifies these bindings from
accepted source structure, rejecting unsupported quantities, scopes or values.

`presentation-bindings.json` preserves source-backed profile-selection metadata
for 34 weapon groups on 24 datasheets. One instruction owner has 70 explicit
weapon occurrence bindings; responsive duplicates are source references. This
is factual/reference metadata, not a renderer or new presentation behavior.

## Effective corrections and FAQ

`official_sources.py` reads the enrolled PDF afresh. Explicit column spans and
source/target hashes bind 34 individual update blocks and 15 official FAQ.
Official precedence is the accepted source-defect policy, not source order.
`base.json` retains captured facts; `effective.json` applies five verified
PDF-sourced field corrections:

- Pactbound Character/EPIC HERO attachment restriction.
- Soulforged Unstoppable Rampage and Predatory Pursuit DAEMON prerequisite.
- Obliterators' current activation/attack wording.
- Screaming Descent's exact official “battle-shock roll” wording.

The other update targets are already effective in the accepted capture.
Correction records and provenance remain separate from gameplay text. Fifteen
secondary errata occurrences refer to the same official correction owners;
three additional already-effective annotations retain their secondary evidence
and official-page corroboration metadata. Raw editing instructions never replace
effective gameplay text. FAQ has 15 official owners plus two accepted
secondary-only questions (`faq-3`, `faq-8`); general Core FAQ appended by the
website are excluded. No FAQ creates an invented unique gameplay primary owner.

`future-capability-gaps.json` records the factual stage's three deferred source consumers:
Wounds modification, canonical ability removal, and a specific ability's range
modification. It supplies no executable declarations and is not the current
semantic blocker inventory. The generated Rule Contract census now records zero
remaining blockers after these three source-proven capability extensions.

## Build and verification

Use Python with `lxml` and `pdfplumber` (the bundled Codex Python has both).

```text
python -B books/chaos-space-marines/v2/build.py
python -B books/chaos-space-marines/v2/build.py --check
python -B books/chaos-space-marines/v2/factual-qa.py
python -B books/chaos-space-marines/v2/source-isolation-qa.py
```

The factual guard independently checks raw DOM statlines/weapons, captured
rules/options/composition, MFM values, PDF FAQ/update text, source enrollment,
canonical ownership and effective correction deltas. In-memory mutations prove
that missing records, wrong identities/owners, severed provenance, corrupted
characteristics and dropped update prerequisites fail.

The isolation guard rebuilds in a temporary tree containing only enrolled
sources and new foundation declarations/code: no legacy CSM, generated output,
DG, AdMech or prior audit artifacts. Output must equal the full-tree build.
Synthetic controls preserve distinct same-code/same-title source nodes and
reject canonical collisions, duplicate source nodes and absent owners. Model
binding mutations and altered source bytes also fail closed.

DG/AdMech focused factual, Rule Contract, effect and attachment regressions were
rerun. The additional DG `roster-multiple-detachments-qa.mjs` assertion at line
144 (`INVALID` versus `TRUE`) was independently reproduced from a clean
`git archive` of the base HEAD. It is unchanged baseline debt; it was not fixed
or silently counted as a passing test. DG's 22-clause runtime regression and
AdMech's 43-clause effective integration pass.

The older DG `datasheet-v1-qa.mjs` navigation snapshot assertion also differs
on the base HEAD; its navigation input is byte-identical here. The independent
canonical presentation oracle still confirms 3,654 facts. The optional DG
browser visible-effects guard timed out waiting for `ArmyBookAppV2.rosterPanel`
after launching the available Chromium binary; it is not reported as passing.
No browser/UI certification is claimed by this factual-foundation task.

## Source-bound Rule Contract overlay

Four book-owned typed declaration files cover an independent census of **542
semantic owners** from the canonical record kinds. The remaining **1,283**
entities are explicitly partitioned as facts/references. These denominators do
not come from legacy CSM contracts or compatibility answers.

| Exclusive owner disposition | Count |
|---|---:|
| BUILT | 66 |
| BATTLE_ONLY_NO_RUNTIME_NEEDED | 249 |
| NOT_EFFECT_OR_PRESENTATION_ONLY | 227 |
| BLOCKED_BY_CONFIRMED_GENERIC_CAPABILITY | 0 |

Both BUILT and battle-only owners have validated applicability contracts:
**315 contracts total**. Battle-only contracts retain canonical text, source
evidence, selectors, roles, targets and explicit BATTLE prerequisites; they do
not implement battle execution. BUILT does not itself imply executable roster
effects; the separate declaration census below identifies those clauses.
Corrections, source aliases, structured table children,
construction options and static information retain their factual owner and do
not fabricate a second effect authority.

`rule-contract-context.mjs` provides a disposable book-owned interface to the
existing shared compiler. Each of the **78 canonical composition members** is a
MODEL evaluation scope bound to its existing source statline (60 distinct
statlines). This adds no canonical identity and does not widen role-specific
keywords when two roles share a statline. Unit, formed-unit and model scopes
remain distinct. Canonical Army Rule membership is STATIC; assignments,
selected upgrades, initial attachment state and Detachments require explicit
ROSTER input; activation and spatial/event state require BATTLE input.

`rule-contract-build.mjs` rejects missing classifications, duplicate owners,
severed source evidence, invalid contracts and manual pairwise authority. Its
generated overlay and compatibility rows are disposable projections, not a
second factual catalog. The factual producer's stage flags continue to describe
the factual foundation alone. Rebuild/check the separate semantic artifacts:

```text
node books/chaos-space-marines/v2/rule-contract-build.mjs
node books/chaos-space-marines/v2/rule-contract-build.mjs --check
node books/chaos-space-marines/v2/rule-contract-qa.mjs
node books/chaos-space-marines/v2/rule-contract-blocker-qa.mjs
node books/shared/roster-v2/wounds-effects-qa.mjs
node books/chaos-space-marines/v2/wounds-modifier-qa.mjs
node books/shared/roster-v2/ability-suppression-qa.mjs
node books/chaos-space-marines/v2/ability-suppression-qa.mjs
node books/shared/army-book-app-v2/ability-presentation-browser-qa.mjs
node books/shared/roster-v2/ability-range-qa.mjs
node books/chaos-space-marines/v2/ability-range-qa.mjs
node books/shared/army-book-app-v2/ability-range-browser-qa.mjs
```

Slaves to None's exact current clause suppresses `army-rule-dark-pacts` on
HERETIC ASTARTES MODEL scopes while Renegade Warband is selected. Its typed
declaration preserves the separate ranged ASSAULT, mustering and battle-only
clauses without executing them in this change. The focused capability probe
lowers only suppression into the existing effect interpreter. Canonical facts
and source memberships remain unchanged. Effective MODEL bags carry a scoped
canonical suppression mask so static reference presentation cannot reintroduce
the removed ability. Independently owned UNIT abilities remain separate.
Synthetic guards cover identical display names with different canonical IDs,
mixed profiles, physical duplicates, attachment/condition changes and a wrong-ID
mutation. The shared renderer is exercised at desktop and 390×844.

The semantic guard checks all MODEL scopes, context availability, physical
identity rejection, source/owner mutations, battle-state isolation and
deterministic compilation. A closed temporary input tree rebuilds without
legacy CSM, DG/AdMech facts or previous semantic artifacts.

`generated/rule-contract-blockers.json` now has no unresolved owners. The
declarations preserve the exact source clauses, recipients, conditions and
evidence for the resolved capabilities.

Crown of Worms adds 3 inches to its exact WARPSMITH bearer MODEL's three
canonical abilities: Warpsmith 3→6 inches, Master of Mechanisms 3→6 inches and
Enrage Machine Spirits 12→15 inches. Typed canonical field spans bind each
range; the effective text replaces only that bound value. No title/prose search
locates an ability or a range. Immutable canonical text remains the ordinary
Army Book/source view, while scoped effective cards retain the physical owner
and MODEL recipient. Independently owned abilities with the same caption do
not change. No underlying battle action is executed.

The shared synthetic range guard covers mixed profiles, same-caption distinct
identities, physical duplicates, remove/restore, attachment changes, numeric
composition and immutable sources. The current-source CSM probe validates all
three ranges and rejects target-ID and value mutations. A test-only bridge
executes the declarations; it does not wire CSM roster import or Army Book UI.
The existing shared renderer is checked at desktop and 390×844 with effective
and base MODEL scopes kept distinct and ordinary book content unchanged.

Living Carapace now has two source-bound roster-known clauses: W +1 and the
existing Feel No Pain 5+ grant, both restricted to its assigned CHAOS LORD
bearer MODEL. W uses the existing `MODIFY_STAT` numeric machinery, including
flat and nested statlines. No CSM-specific shared branch or second effect path
is introduced. A test-only bridge executes these two declarations on canonical
CSM model/composition facts; it does not start CSM roster integration.

The standalone shared Wounds guard loads no army factual data and tests mixed
profiles, duplicate instances, remove/restore, attachment changes, numeric
composition and immutable bases. Both it and the source-bound Living Carapace
guard reject an intentionally mutated +2 modifier. The independent capability
guard accepts the three supported operations and still rejects substituting
arbitrary rule metrics for canonical ability ranges. Eye of the Gods' battle-only Wounds increase remains conditional
source text and is not made executable.

DG's 22-clause and AdMech's 43-clause effect regressions pass after the shared
extensions. `qa:integration` still fails only the older CSM entry
verification-status/artwork check; the same failure was reproduced from a
fresh archive of the task's base commit, without applying this change.
The broader legacy `qa:am` command also retains its isolated-source ownership
test failure: its temporary fixture omits
`books/shared/canonical-content-v2/effective-content.mjs`. That exact missing
dependency was independently reproduced from the same clean base archive;
AdMech V2 factual, contract and 43-clause effective-runtime guards pass.

## Book-owned roster-effect declaration layer

`roster-effect-build.mjs` consumes the existing source-backed typed contracts.
It produces an in-memory disposable view with **57 executable clauses**:
28 Enhancement, 8 Detachment, 16 Daemonic Allegiance and 5 datasheet clauses.
All 315 applicability contracts and canonical source records are preserved;
no generated publication or legacy CSM runtime is an input. No shared runtime
operation or browser/import path is added.

The 58th executable clause,
`army-rule-cult-of-the-dark-gods::source-clause`, remains explicitly deferred.
Its allied recipient foundation, cross-registry roster dependencies and Army
Faction input are absent. It has no executable effects. No global Army Rule
dispatch or allied datasheet is introduced.

The declaration projection binds existing operations to canonical clause IDs,
selectors, exact MODEL/composition recipients, conditions, source evidence and
duration evidence. Canonical Upgrade owners remain recorded separately from
their owning physical DATASHEET dispatch address. The eight executable
bearer-unit gaps use disjoint standalone and attached bindings; Huron's ninth
scope binding preserves display-only canonical references without executing
their battle permissions.

`roster-reference-bindings.json` explicitly binds accepted rule-reference
memberships to canonical ability identities and parameters. Source labels are
validation evidence, never runtime joins. `roster-effect-context.mjs` supplies
the existing generic interpreter with these book-owned explicit roster inputs:

- `selectedMarkId`: one canonical Mark option; `null` means known absent and
  omitted means unknown. Keywords or captions never establish a selected Mark.
- `selectedUpgradeIds`: canonical option IDs on the unit or exact model row.
  An empty list means known absent. The currently accepted Allegiance options
  require singleton MODEL ownership; foreign, competing or ambiguous choices
  are rejected.
- `enhancementAssignments`: the existing shared exact bearer composition scope.
  Aggregate weapon selections never establish individual bearer ownership.
- `initialAttachments`: an optional explicit physical attachment snapshot for
  Fabius's start-of-battle prerequisite. Current attachment alone never supplies
  this historical input, and reattachment to another unit does not satisfy it.

Profile presence uses positive quantities and the canonical statline binding.
Scouts prerequisites use canonical identity plus exact distance on the actual
Bodyguard unit. A prerequisite-only shared-runtime projection supplies effective
abilities without self-enabling the Scouts grant; the final projection rebuilds
from the same immutable base. The best-save condition preserves intrinsic
invulnerable saves stronger than 5+. These are input normalization and typed
binding responsibilities; all selector/condition/effect interpretation remains
in the existing shared kernel and roster runtime.

```text
node books/chaos-space-marines/v2/roster-effect-declarations-qa.mjs
node books/chaos-space-marines/v2/roster-effect-bindings-qa.mjs
node books/chaos-space-marines/v2/roster-effect-scope-qa.mjs
```

These guards execute every one of the 57 clauses with deterministic canonical-ID
fixtures. They cover physical duplicates, mixed profiles, exact weapon ownership,
all eight bearer-unit scopes, stronger intrinsic saves, selection and attachment
changes, remove/restore, provenance and immutable canonical inputs. Independent
expected-output controls reject numeric-value, owner-selector, recipient-selector
and bearer-unit-binding mutations. Battle-only and display-only clauses have no
executable effects. This stage makes no import or UI certification claim.

The declaration-stage regression run also reproduces three unrelated legacy
failures from a fresh archive of `da82228b00fbb29cd737fad5dbb77e733272068e`:
`qa:csm` expects 1,184,893 bytes for the hub capture instead of its unchanged
1,181,088 LF bytes; `qa:am` remains 214/215 because its isolated fixture omits
`canonical-content-v2/effective-content.mjs`; and `qa:integration` retains the
CSM entry verification-status/artwork assertion. None is counted as a passing
suite or repaired here. The source-first CSM and targeted DG/AdMech V2 guards
pass independently.

## Attachment-only roster service

`roster-attachments.mjs` connects the native canonical import service to the
existing shared attachment graph. Receiving Bodyguard first, `candidates()`
returns eligible physical Character/Support instances; `attach()`, `detach()`
and `reattach()` preserve their independently owned state. No effect interpreter,
Effective Datasheet projection, Personal Guide or CSM attachment UI is connected.

All **21 source attachment declarations** are bound: 19 participant declarations
and two recipient substitution declarations. Their **58 native canonical relation
facts** yield 51 LEADER and seven SUPPORT pairs. Substitution declarations add
their evidence to existing pairs; they do not invent foreign/Legends recipients.
Ordinary Core capacity is one LEADER plus one SUPPORT, in either order.

One additional conditional pair (Jump Pack Lord → Warp Talons) preserves two
independent source permissions, Sorrowscent Vulture and Pact of Cursed Pinions.
Only the physical owner with the matching assigned Enhancement and selected
Detachment is eligible. There are **59 distinct native attachment pairs** in
the adapter, 58 unconditional plus one conditional; no Enhancement stat/ability
effect executes here. Falsehood's battle-dependent attachment remains excluded.

Pactbound Zealots' current attachment restriction compares each component's
intrinsic or explicitly selected canonical Mark before formation. Missing Marks
are not inferred, and the formed-unit keyword union cannot establish a match.
The small shared typed prerequisite check receives book-owned IDs/bindings;
it contains no CSM facts or army-specific branch. All previous policies without
these prerequisites retain their existing behavior.

MODEL keywords use exact canonical composition-member bindings, including
Dark Commune's Demagogue-only CHARACTER and Mindwitch-only PSYKER. Components,
quantities, imported loadouts, Enhancements and options remain unchanged in the
physical snapshot. Cult of the Dark Gods allied import remains deferred.

```text
npm run qa:csm:v2:attachments
npm run qa:csm:v2:attachments:browser
```

The focused guards check all 2,916 native pairs, every base relation's
attach/detach transition, enrolled evidence hashes, duplicate owners/recipients,
mixed profiles, role capacity, order independence, illegal-action atomicity,
selected Marks and Enhancement permission remove/restore. Desktop and 390×844
browser API checks match Node state/context and survive reload; poisoned
dependencies prove no legacy, effects, Rule Contracts or presentation code is
loaded. These are attachment service checks, not a claim that CSM Personal Guide
or roster UI has been enabled.

## Imported roster effect projection

`roster-runtime-build.mjs` composes the existing 57 effect declarations with
the current 59 attachment policies and profile bindings. Its generated
`roster-runtime.json` is disposable execution input, not another factual catalog.
`roster-runtime.mjs` accepts native imported physical snapshots, delegates
attachment transitions to the existing shared graph, and rebuilds effective
state through `evaluateCSMRosterDeclarations()` and the shared effect interpreter.
No shared primitive, interpreter, compatibility logic or presentation is added.

Selection validation uses the canonical import/attachment view. This preserves
the imported Allegiance `exclusiveGroupId` and canonical option parent even
though the executable view uses its datasheet parent for dispatch. Neither
selected ownership nor source evidence is stripped or weakened.

`load(snapshot)` is the semantic input boundary. `projection` returns a copy
of the resulting effective state; `snapshot()` retains independently owned
import state. Bodyguard-first `attach`, `detach` and `reattach` recompute it.
The convenience `import()` works when imported state identifies the bearer
unambiguously. Ambiguous MODEL bearers require an explicit existing
`enhancementAssignments` selection before `load`; the runtime does not choose
the first profile or guess missing selections. Tests declare those physical
MODEL choices separately from text import. Explicit initial attachment history
is likewise required for Fabius, never inferred from a current attachment.

```text
node books/chaos-space-marines/v2/roster-runtime-build.mjs
node books/chaos-space-marines/v2/roster-runtime-qa.mjs --write
npm run qa:csm:v2:roster-effects
npm run qa:csm:v2:roster-effects:browser
```

`audit/roster-execution-matrix.json` records all 57 positive clauses, the actual
New Recruit text, canonical evidence, physical selections, explicit bearer and
attachment inputs, expected scope/operations, and observed effective changes.
The census exercises 125 effective contributions, 44 ownership remove/restore
controls, 36 Detachment controls and 34 attachment transitions. Independent
edge guards test exact numeric values, stronger saves, ability identity,
mixed profiles, equipment, multiple Detachments and nine mutations.
Desktop and 390×844 browser API runs independently import every fixture and
match Node projection, including reload; poisoned dependency boundaries reject
legacy and presentation modules. These are runtime checks, not UI acceptance.

The current 408 contract clauses contain 57 `ROSTER_EXECUTABLE`, 304
`BATTLE_ONLY`, 30 `DISPLAY_ONLY` and 17 `NOT_AN_EFFECT` classifications.
Normalization preserves explicit battle classifications from either declaration
field or the contract's battle-action mode. The classification guard checks all
111 restored clauses: 106 use existing physical-instance UNKNOWN entries and
five use the existing canonical reference/compatibility path (including Dark
Pacts). No global Army Rule dispatch is added. Every non-executable clause is
checked for an empty effect payload and every applied contribution
must belong to the exact 57-clause executable set. Cult of the Dark Gods remains
canonically present and deferred. ROSTER-CONTENT-01, Effective Datasheet UI and
Personal Guide are unchanged.
