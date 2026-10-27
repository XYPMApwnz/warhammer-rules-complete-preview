# Source ownership and independent certification

[README](../README.md) is the current product, entrypoint, build and release guide. This document preserves source/gameplay requirements and the independent V2 certification contract. Historical milestone counts, deferred-book exclusions, old repository URLs, V1 surfaces and V1 compatibility obligations do not define the current product. Unified V2 supports the nine books listed in README. Current enrolled artifacts and scoped evidence determine source versions and factual results; this documentation does not re-certify them.

The removed handoffs and old milestone snapshots remain available in Git history. Detailed historical content evidence remains under `docs/certification/`; its conclusions apply to its recorded revisions and declared scope.

## 3. Factual ownership model

The repository follows this flow:

```text
accepted factual source
  -> canonical fact
  -> effective, scoped/contextual fact
  -> deterministic projection
  -> generated artifact and UI
```

- Core facts: the pinned Wahapedia 11E Core + Rules Appendix corpus is the operational completeness/content baseline, normalized in `books/core-rules/content/` and exposed by `createEffectiveCoreCatalog()` in `effective-core-catalog.mjs`. Explicit stronger current GW evidence overrides only direct conflicts.
- Army facts: each book's accepted canonical sources and explicit overrides, normalized into `wh40k-effective-book-model/v1` by the shared Army builders. Generated JSON/JavaScript/HTML and runtime presentation are projections.
- MFM facts: `mfm/content/canonical-mfm-facts.mjs`, exposed by `createEffectiveMfmCatalog()` and projected to Army models through `books/shared/tools/effective-mfm-army-projection.mjs`.
- Mission facts: `missions/content/chapter-approved-2026-27.canonical.json`, validated by `mission-model-contract.mjs` and exposed through `createEffectiveMissionCatalog()`.
- Glossary V2: a downstream index over effective Core, Army, MFM and Missions interfaces. It does not own gameplay facts.
- Roster effective state: a runtime projection of canonical/effective book facts, MFM facts, selected physical roster instances, selections, attachments and structured effects.

Generated readers, HTML, scripts, search indexes, popup payloads and roster projections are never factual owners. The large Core-reader glossary JavaScript remains an active definition-data consumer; it must not feed semantics or identity back into factual producers.

## 4. MFM contract

The enrolled official captures and centralized effective MFM catalog are the sole owners of MFM-owned facts. Read each owner's accepted source/version rather than treating an old milestone version as globally current:

- unit points and model/copy schedules;
- paid upgrades and wargear costs;
- Enhancement inventory and costs;
- Leader and Support eligibility;
- Detachment Points;
- Detachment-to-Force-Disposition assignment;
- MFM qualifiers/tags and current/Legends grouping where present.

Army-owned gameplay overlays may add distinct Army semantics, but book configuration and historical per-book MFM snapshots must not validate, override or block current MFM-owned numeric values. Cross-domain binding uses explicit identities in `mfm/content/mfm-army-mission-bindings.json`; `REFERENCE_ONLY` records remain explicit instead of creating synthetic Army datasheets.

MFM references keep their original owner and identity. Multiple Force Dispositions are canonical stable-ID arrays with exact membership, no duplicates and no ordering semantics unless a source explicitly defines order. Unsupported or relation-only records stay explicitly non-executable; no synthetic Army datasheets or guessed prices may be created.

`tests/mfm-numeric-ownership-qa.mjs`, `tests/mfm-production-migration-qa.mjs`, MFM domain/cross-domain QA and focused book controls use parity and poisoned/stale-owner controls to prove that obsolete book values cannot influence the effective result.

## 5. Identity model

**Canonical identity** answers which fact/entity a record represents. **Contextual effective facts** answer which properties that entity has in a requested book, scope or physical roster state. Sharing a canonical identity does not make every contextual property globally identical.

Current examples:

- `Stormlance Task Force` keeps its shared canonical identity; contextual values and any accepted source conflict remain explicit rather than being collapsed by name.
- An inherited Space Marines `Terminator Squad` keeps its shared identity, while a proven Dark Angels army context can enable the source-conditioned `DEATHWING` overlay without leaking it into other contexts or physical MODEL keywords.

Correctness-sensitive joins use explicit canonical IDs or an explicit stable source-ID-to-canonical-ID registry. A display rename must not change identity. Parent-scoped child identities are valid where a global identity is not justified. In particular, same-name weapon profiles can have different semantics and must not be merged globally by title. Title/prose lookup is not acceptable when a stable identity exists.

## 6. Space Marines dependency contexts

These are supported native V2 books. Their current sources, bindings and scoped acceptance evidence determine behavior; old milestone exclusions are not product restrictions.

Space Marines supplies a shared base. Dark Angels and Blood Angels build effective books from that dependency plus their own accepted local facts and explicit stable-ID overlays.

The conceptual order is:

```text
BASE -> ADD -> OVERRIDE -> QUALIFY -> REMOVE
```

- **BASE** imports the declared dependency by canonical identity.
- **ADD** contributes local entities or explicit relations to the final effective inventory.
- **OVERRIDE** replaces an allowed contextual field from accepted owning evidence.
- **QUALIFY** adds contextual properties such as DA `DEATHWING`/`RAVENWING` keywords or a book-specific MFM value.
- **REMOVE** excludes content only through an explicit supported exclusion/removal contract; absence or a sibling title is not a removal instruction.

Dependency relation additions are exact-ID and fail closed in `build-relation-graph.mjs`. The final model must preserve a shared canonical owner, book-specific contexts, and no DA↔BA sibling leakage. Relevant controls include `dependency-relation-overlay-qa.mjs`, SM/DA/BA book QA and `glossary-v2-faction-context-qa.mjs`.

## 7. Roster physical-instance model

A canonical datasheet describes the unit type. Every occurrence in a saved roster has a separate physical `instanceId`. Attachments, selections, Enhancements and effects operate on those physical instances.

Consequences:

- duplicate datasheets remain isolated;
- a character physical instance cannot be attached twice or fill two roles at once;
- attach/detach/regroup rebuilds the effective group state;
- only selected loadout/wargear can provide selection-gated facts;
- conditional effects remain conditional and fail closed when their condition is not proven;
- effective stats, weapon profiles, abilities and keywords are calculated without mutating canonical facts.

Current QA covers Leader↔Bodyguard behavior, Support, Enhancements, Detachments, selected wargear, stat and weapon changes, added/removed abilities and keywords, stacking, conditional effects, attachment cleanup and duplicate-instance isolation. The current native boundaries are `books/shared/roster-v2/` and the V2 presentation consumers. Historical controls are evidence for their original runtime and revision, not automatic certification of a newer implementation.

## 8. Effect contract model

Source-produced structured contracts feed native bindings and the shared `books/shared/roster-v2/` execution path. Retained canonical/effective producers remain upstream; removed V1 UI is not an alternate runtime. Source semantics determine selector, scope, condition and operation. The shared interpreter should be extended only when an accepted current rule cannot be represented by an existing semantic dimension.

Scope is significant: bearer-only, model-only and profile-only effects must not spread to a unit or attachment group. Conversely, an accepted **Attached Unit** effect must propagate through the formed physical group. Do not add rule-name or faction-name branches when an existing scope/selector expresses the rule.

Source-backed behavioral requirements:

- Belicosa-class Capacitor Vanes propagates its accepted weapon changes across the attached physical unit and remains isolated from another copy.
- Helix Gauntlet grants the accepted Feel No Pain effect to the attached group, including the attached Librarian, and disappears from that character after detach.
- Negative controls in `attached-unit-wide-effect-scope-qa.mjs`, `physical-unit-game-effects-qa.mjs` and `tests/browser/attached-unit-wide-effects.mjs` prevent over-propagation and cross-instance leakage.

## 9. Attachment-group constraint model

MFM eligibility answers **who may attach**. The canonical constraint layer answers **how many, in which roles, under which Bodyguard condition, whether duplicate canonical characters may coexist, and whether attachment is mandatory**. Exact constraints are projected onto source-backed relation edges; the native attachment service and runtime evaluate physical instances.

The current schema supports only proven corpus dimensions:

- total attachment capacity;
- per-role capacity;
- same-canonical multiplicity for an exact source→target relation;
- conditional capacity from resolved Bodyguard state, currently `STARTING_STRENGTH_EQUALS`;
- duplicate/coexistence restrictions;
- mandatory participant and explicit no-valid-target consequence;
- exact canonical source/target scoping and physical-instance ownership.

Do not replace this with a second eligibility graph or a general expression language.

Source-backed decisions to preserve:

- Cybernetica Datasmith→Kastelan Robots permits repeated physical Datasmith instances. The accepted rule is not `max=2`; the exact relation uses unbounded same-canonical/role/total permission while each physical instance remains unique.
- A Kroot Carnivores Bodyguard at Starting Strength 20 can take a conditional second **distinct** eligible Shaper; ordinary duplicate rules still apply.
- Ordinary groups retain the default one-Leader/one-Support behavior unless an accepted exact constraint says otherwise.
- Death Guard dual-role exceptions retain their accepted scoped behavior.
- Accepted official MFM evidence proves Judiciar has both Leader and Support eligibility. Support does not supersede Leader. One physical Judiciar chooses one feasible role in the actual group. Preserve this accepted hard decision.

For the affected native consumer, verify exact capacity/role conditions, detach/reload and physical isolation with source-backed positive and negative controls. Historical exception counts are not current independent certification.

## 10. Glossary V2

Glossary V2 is the production factual/search projection. Its canonical input contract is `glossary/v2/content/glossary-v2-index.mjs`; generated `index.en.json` is disposable output. Search, Army/Core popup and full article must resolve the same V2 identity. There is no legacy Glossary gameplay fallback.

The generated index contains standalone browse articles and parent-scoped children; its current inventory is checked by the native producer and source review rather than pinned to a historical count. Main browse exposes standalone entries; scoped children remain searchable and directly openable with parent/book context. Same-name profiles retain visible parent context and may not resolve to an arbitrary global entity.

Shared canonical entries can expose context-specific effective facts through `resolveView(bookId, id)`. Filter/search changes must reconcile the active article with the visible result set while deep-link and Back/Forward behavior remain coherent.

Masters of Misdirection now has complete accepted source text, exact battle-size caps and an executable data-driven roster choice. It must not fall back to guessed or legacy text.

## 11. Missions

Missions owns Force Dispositions, Primary and Secondary Missions, sequence rules, Twists, Deployments, mission-wide reference/Appendix rules, FAQ clarifications, unordered Force-Disposition matchups and Event Terrain Layouts. Standard and Event scopes are assembled separately by `createEffectiveMissionCatalog()`; Event Companion v1.2 overlays must not leak into ordinary `STANDARD_MATCHED_PLAY`.

The current canonical corpus preserves 88/88 physical-card accounting, 25 semantic Primaries, 18 semantic Secondaries, 5 Force Dispositions, 6 Deployments, 6 Twists, 15 unordered matchups and 45 Event layouts. Glossary V2 projects 156 user-facing Mission entries, including 21 effective sequence-rule articles after overlays.

Source-backed Deployment and Terrain reference images are valid user-facing evidence. Their machine geometry envelope is separate. All 6 Deployment and 45 Event-layout records are authenticated/source-registered but remain `SOURCE_REGISTERED_PENDING_VERIFIED_DIGITIZATION` for the missing verified vector layers. Never infer polygons, objectives or measurement endpoints from an image or secondary visual reference.

## 12. Source and evidence policy

Accepted source artifacts are enrolled with authority, edition/version, currentness, scope and exact hashes. The source-integrity contract protects captured bytes; a hash mismatch must be classified before metadata is changed. Re-enrollment is valid only when current bytes are independently shown to be the already accepted artifact and the mismatch is stale metadata. Never weaken exact hash checks or silently accept source drift.

Official current evidence outranks secondary evidence where available. Secondary sources can support discovery, transcription or corroboration within their declared authority; they cannot override a newer applicable official source. Missing evidence stays missing.

For Core completeness and operational wording, the versioned Waha 11E Core + Rules Appendix capture is pinned by exact corpus and raw-page hashes. Deterministic defects in an accepted source are recorded in a bound source-defect ledger rather than guessed away. A known semantic anomaly does not by itself block exact-content certification when the captured wording is deterministic; a stronger enrolled current GW source still wins a direct conflict. Changed source bytes or bound defect hashes require fresh adjudication.

Current evidence limitations:

- Core `18.06` Assault Disembark Move and `18.07` Shock Disembark Move have full deterministic accepted Waha definitions. The unusual `18.07` After Moving clause is retained verbatim and classified as `KNOWN_SOURCE_SEMANTIC_ANOMALY`; it is not silently corrected.
- Masters of Misdirection has a complete accepted current Waha body and battle-size table in the certified Chaos Space Marines corpus.
- Abaddon's `The Warmaster` has all three accepted current Waha options, preserved as scoped structured choices under the canonical ability.
- Mirrored World has accepted rule, options, D6 metadata and reroll-6 fact, but no proven roll-to-option mapping; option order must not be turned into die results.
- Six Deployment and 45 Event-layout machine geometry layers await verified digitization.

## 14. Generic runtime requirements

The following supported mechanisms must remain data-driven and faction-agnostic. Each implementation claim still needs evidence for its recorded HEAD and scope:

- physical roster-instance identity and duplicate isolation;
- exact composition bounds, multipart mixtures and canonical model identities;
- multipart physical-profile characteristics without profile flattening or leakage;
- structured wargear defaults, replacements, ratios, exclusions and shared caps;
- Leader/Support eligibility, attachment constraints and formed-group propagation;
- mandatory-Warlord, Enhancement-qualifier and leading-state predicates;
- roster choices, exact target eligibility and battle-size selection/points caps;
- allied-unit muster contracts backed by centralized MFM identities and schedules;
- transport capacity, passenger restrictions and multi-space passengers;
- targeting restrictions, keyword/ability grants and removals;
- unit/model/profile stat and weapon modifiers;
- selected-loadout and selected-physical-model effects;
- stable-identity ability-range modifiers;
- detach, re-attach, deselect, reload and recompute cleanup;
- current copy-scaled MFM schedules and paid options;
- multiple Force Dispositions as canonical ID arrays with exact set membership;
- fail-closed handling of unknown identities, choices, conditions and conflicting bindings.

Preserve these decisions: Judiciar is Leader + Support; Datasmith multiplicity is not an invented maximum of two; Kroot capacity is conditionally source-backed; MFM is the sole numeric owner; canonical identity does not make contextual facts globally identical; same-name profiles remain parent-scoped; generated UI and tests are never factual owners.

## 16. Unresolved evidence and current QA debt

- Mirrored World exact D6-to-option mapping remains unproven where not enrolled; option order is not a die-result mapping.
- Verified vector digitization for Deployment and Event-layout geometries requires independent accepted evidence. Images alone do not prove polygons or measurement endpoints.
- Accepted compatibility rows lacking stable upstream source identities remain outside guessed title-to-ID repairs.
- MFM-only or `REFERENCE_ONLY` entries must not become physical Army datasheets or executable pricing bindings without source-backed enrollment.
- Current book-specific Chapter, equipment, battle-context and semantic limits remain in their review ledgers and source-bound artifacts.
- Known reproducible QA debt, including the historical SM/Deathwatch `--fresh` failure, is tracked in [TRACKER](TRACKER.md). A known failure remains FAIL; do not hide it by changing EXPECTED.

## 17. QA and certification contract

Use the current native commands, runtime-only packaging and scope rules in [README](../README.md) and [QA_MATRIX](codex/QA_MATRIX.md). Focused regression PASS is not independent factual proof when EXPECTED comes from the same producer. Source-derived expectations, poisoned inputs, negative controls and mutation sensitivity remain required at the affected boundary. Broad acceptance is a separate authorized stage.

### Independent V2 certification requirements

This is the authoritative independent certification contract for Core Rules,
Death Guard, Adeptus Mechanicus and Chaos Space Marines in the unified V2 app.
It defines evidence requirements, not new certification results. It supplements
this document's factual ownership policy and the Army Book Blueprint without
changing Preview gates, source acceptance, publication scope or release approval.
Use existing QA, browser harnesses and bounded audits; no new framework is required.

#### Scope, baseline and independence

- Record the audited repository, branch, exact HEAD, tree state, product route,
  supported capabilities, environments and explicit exclusions. Each of the four
  sections receives separate `CONTENT_CERTIFIED` and `USER_PATH_CERTIFIED`
  results; neither result implies the other.
- Pin accepted source files, versions, exact enrolled hashes, authority, applicable
  scope and FAQ/errata/update precedence before comparison. Conflicting versions,
  hash mismatches or unresolved source precedence block the affected certification
  pending forensic adjudication. Do not refresh sources, repair hashes or choose a
  winner merely to obtain PASS. A deterministic accepted-source anomaly already
  bound to the source-defect ledger remains distinct from an unresolved conflict;
  preserve its wording and disclose the limitation under the existing source policy.
- Construct a fresh independent oracle directly from accepted source documents,
  including relevant page images, tables and diagrams. Generated facts, canonical
  exports, Rule Contracts, runtime declarations, previous oracles, QA expectations
  and UI output must not determine its expected facts. Those artifacts may be
  inspected afterward as targets, regression controls or diagnostic evidence.
  This does not change canonical/effective ownership in production.
- Reconcile source identities and semantic sets independently before reporting
  denominators. Keep source entities, fields, clauses, executable operations,
  model profiles and physical-instance cases distinct. Old counts and PASS results
  are historical evidence, not a new independent oracle or completeness proof.
  Absence of a proven defect is not evidence that all required content was checked.

#### CONTENT_CERTIFIED

PASS requires a complete source-to-user reconciliation for the declared content
scope, covering every required field and entity, not merely record existence:

- Exact values, current rule wording/meaning, qualifiers, restrictions, parameters,
  canonical/source owners, MODEL/UNIT/profile scope and supporting provenance.
- All applicable Army Rules, Detachments/subrules, Enhancements, Stratagems,
  datasheets, model/weapon profiles and modes, abilities, selections/instructions,
  equipment, wargear options, composition, upgrades, Leader/Support/Attached Unit
  content, keywords, faction keywords, model-scoped bases and structured content.
  Core instead covers its complete rules, chapter/section placement, lists, tables,
  diagrams, concepts and canonical references.
- Current accepted FAQ/errata/update results, correct relationships and provenance;
  effective corrected text may replace raw source-edit instructions without losing
  gameplay content. No missing, unsupported extra or semantically duplicated facts.
- Comparison against the actual rendered, normally reachable V2 book/reader,
  including reference surfaces where they are the intended access to content.
  Generated JSON parity alone cannot certify the user-facing content. Equivalent
  presentation is allowed only if all source meaning, scope and parameters survive;
  omitted restrictions, qualifiers or ownership are failures.

#### USER_PATH_CERTIFIED

For DG, AdMech and CSM, PASS requires real supported user journeys through
`source -> import -> selections -> attachments -> runtime -> UI`, including
Effective Datasheets and Personal Guide. Independently source-derived cases must
verify the following wherever applicable:

- Selected/unselected weapons, equipment, upgrades/options and Enhancements;
  exact source-backed captions, quantities and physical ownership in the final UI.
  Legal options must not become selections, and aggregate input must not invent
  individual MODEL ownership or missing bearer choices.
- Every required roster-known executable operation, with the correct physical
  recipient, component, MODEL/profile, weapon and UNIT/formed-unit scope. Preserve
  mixed profiles, all attached Character/Support content, owner identities and
  instance isolation; presentation deduplication must not erase physical content.
- Positive cases and meaningful negative controls: absent/wrong selections,
  missing prerequisites, ineligible recipients, duplicate independent instances,
  component/profile isolation, attachment transitions and remove/restore choices.
  Attach/detach/reattach, recompute and reload must be deterministic without stale
  effects, duplicate keywords or transferred equipment/Enhancement ownership.
- Independent semantic-to-runtime clause reconciliation: every source-classified
  clause is accounted for, classifications have source evidence, and no unsupported
  executable-set change or loss of required conditional visibility is allowed.
  Only imported/roster-known conditions execute. Battle state or unrecorded
  historical battle conditions remain conditional/canonical content; a current
  attachment alone must not invent start-of-battle history. BATTLE_ONLY clauses
  must not alter effective roster state. Related Rules must preserve applicable
  MATCH/CONDITIONAL/UNKNOWN visibility and hide NO_MATCH/INVALID as contracted.
- Actual rendered/browser acceptance on desktop and 390x844 phone: normal
  navigation, direct/deep links, reload, Back/Forward, supported new-tab references,
  popup/article round trips and preserved roster/book context. Check readability,
  table containment, complete content, no internal/debug metadata or uncaught
  errors, and module switching without leaked state or themes. DOM assertions
  alone do not establish visual acceptance; retain inspectable visual evidence.

For Core Rules, use reader/chapter/section/navigation/reference journeys instead
of roster import, attachments, Effective Datasheets or Personal Guide. Verify
source-backed rules, FAQ/errata results, tables, diagrams, anchors, popups/articles
and the same applicable desktop/phone, reload and navigation controls.

#### Evidence, comparator validation and reporting

- Every source-derived case must retain checkable source location/identity,
  expected value/text/owner/scope and its derivation, actual observation, input or
  roster selections, UI location, comparison result and evidence references.
  Artifacts must identify their HEAD, source baseline and browser transport;
  source-field, clause and imported-execution matrices may use existing formats.
- Validate comparator sensitivity with representative in-memory target mutations:
  missing profiles, wrong numeric/text values, hidden qualifiers/restrictions,
  changed section semantics, wrong owner/scope/model-base binding, duplicate
  content and corrupted block/table structure as applicable. Run each mutated
  target through the comparator and assert the expected mismatch category.
  Deliberate unconditional exceptions or weakened assertions are not mutation proof.
- Reuse existing targeted/regression suites at the affected boundary. Their PASS
  remains useful regression evidence, but does not replace independent source or
  real user-path evidence. Do not initiate unrelated repairs or broad release work
  merely to document or perform a bounded certification audit.
- Record unfinished/deferred capabilities and their source-backed obligations
  explicitly. An unavailable required capability blocks full certification of its
  affected scope; a reproduced incorrect supported behavior fails it. A narrower
  PASS must name its exclusions and must not be reported as whole-section PASS.
  Optional visibly unsupported capabilities outside declared scope do not become
  requirements solely through this contract; no required capability may be silently
  excluded. Canonical content can PASS while its runtime user path is BLOCKED.
- Static-byte browser acceptance must use real application bytes and computations
  without test-side replacement of results. Record it separately from live-hosting
  verification: it cannot certify deployment, public base paths, network assets,
  service-worker updates or offline behavior. Existing publication/PWA/release gates
  still apply when those claims are made; these two statuses do not authorize release.

Use exactly these result values for each status and required case:

| Result | Meaning |
| --- | --- |
| PASS | All required evidence for the declared scope is present and all applicable comparisons/controls pass, with no unresolved discrepancy. |
| FAIL | Checkable source-backed evidence proves incorrect content or supported user behavior; report the exact mismatch. |
| BLOCKED | Required source authority/integrity, capability or test access prevents completion; state the missing prerequisite. |
| NOT_ASSESSED | The check has not been performed; no certification claim is made. |

Never roll an unassessed or blocked required case into overall PASS. Report proven
failures even when another check is blocked. Preserve previous reports and counts
as evidence for their recorded HEAD, sources and scope; do not retroactively
invalidate them or automatically transfer their PASS to a new independent audit.
Adding this contract performs no certification and reopens no closed defect class.

## 18. Release workflow

Follow [README](../README.md#runtime-only-packaging-and-publication) and the [runtime-only checklist](../tools/PAGES_RUNTIME_RELEASE.md). GitHub Actions publishes only an explicitly authorized `unified-v2-release` candidate. Source/feature branches are for review; Pages settings and release history must not be changed implicitly. No V1 URL, roster or offline-migration compatibility is required.

## 19. Development policy

- During milestone certification and release stabilization, do not start feature work.
- Repair the factual owner or true producer first; generated symptoms are not owners.
- Prefer the smallest source-backed repair plus focused regression coverage.
- Fix a systemic defect once at the common producer/runtime boundary instead of patching every output.
- Do not reopen a certified class without a new signal.
- Preserve explicit stable identities and fail closed on unknown/conflicting bindings.
- Run broad acceptance only at authorized checkpoints or release gates, and publish only the exact reviewed clean candidate.

## 21. Do not regress these decisions

> - Judiciar is **Leader + Support** in current MFM. There is no implicit “Support supersedes Leader” rule.
> - Datasmith→Kastelan permits repeated physical Datasmith instances for the exact accepted relation. Do not invent `max=2`.
> - Kroot Carnivores at Starting Strength 20 permit the proven conditional second distinct Shaper.
> - Current MFM numeric facts cannot be overridden by Army configuration or historical per-book copies.
> - Canonical identity does not imply globally identical contextual facts.
> - A shared display title does not make weapon/profile records the same entity.
> - Generated Glossary/UI/HTML/data scripts are never factual owners.
> - Evidence gaps remain gaps; do not guess rules or geometry.
> - Effects and attachments operate on physical instances and must not leak between duplicate datasheets.
> - Reuse the shared structured effect runtime instead of duplicating rule-specific behavior.

## Historical content certification records

The retained records for [Core](certification/CORE_WAHA_CONTENT_CERTIFICATION.md), [Death Guard](certification/DEATH_GUARD_WAHA_CONTENT_CERTIFICATION.md), [Adeptus Mechanicus](certification/ADEPTUS_MECHANICUS_WAHA_CONTENT_CERTIFICATION.md), [Tyranids](certification/TYRANIDS_WAHA_CONTENT_CERTIFICATION.md), [T'au Empire](certification/TAU_EMPIRE_WAHA_CONTENT_CERTIFICATION.md), [Emperor's Children](certification/EMPERORS_CHILDREN_WAHA_CONTENT_CERTIFICATION.md) and [Chaos Space Marines](certification/CHAOS_SPACE_MARINES_WAHA_CONTENT_CERTIFICATION.md) preserve their source baselines and scoped historical conclusions. They are not automatically new certificates for this checkout.
