# Project source of truth

This document describes the repository at the certified local milestone below. Treat current code, enrolled evidence and passing QA as authoritative when this document and an older handoff disagree. Start a new conversation with `docs/CURRENT_HANDOFF.md`.

For new independent unified V2 audits, use the [certification requirements](#independent-v2-certification-requirements) in section 17. Milestone results and release details below remain historical evidence for their recorded HEAD and scope; this contract does not certify a newer checkout.

## 1. Current baseline

- Branch: `working/army-books-clean`.
- Certified local HEAD: `8fc01265a18e6c367451d18a7b86bf522edf63e8`.
- Public site: <https://xypmapwnz.github.io/warhammer-rules-fe1d435/>.
- Pages source: the root of `release/working/army-books-clean` in `XYPMApwnz/warhammer-rules-fe1d435`.
- Cache revision: `5d5ff33f862d9332`, generated in `glossary/generated/cache-revision.js` and consumed by `service-worker.js`.
- The expected maintenance state is a clean working tree. This local HEAD contains the latest certified milestone work but is **not yet the public Pages release**.
- An independent Astra red team, adjudication of any findings, final aggregate/generated refresh, scoped release gate and fresh public acceptance remain before deployment.

## 2. Product scope

Production includes the Library/root, Core Rules reader, nine Army Book surfaces, roster guides and effective roster views, Glossary V2, current standard/event mission reference content, desktop and phone readers, and installable offline/PWA behavior. Certification for the **current milestone** is intentionally narrower than all visible production surfaces.

The certified milestone scope is:

1. Death Guard
2. Adeptus Mechanicus
3. Tyranids
4. T'au Empire
5. Emperor's Children
6. Chaos Space Marines

Core Rules is also in scope and certified. Space Marines, Dark Angels and Blood Angels are explicitly out of scope for this milestone and must not be described as currently content- or roster-certified. Existing SM/DA/BA code and historical QA remain production context, not certification evidence for this milestone.

Other factions, game modes, a Mission Assistant and a Game Assistant are future scope unless current tracked code explicitly says otherwise. The Orks source/build work is not one of the nine supported production books.

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
- Army facts: each book's accepted canonical sources and explicit overrides, normalized into `wh40k-effective-book-model/v1` by the shared Army builders. Generated `data.js`, `roster-data.js`, HTML and mobile stubs are projections.
- MFM facts: `mfm/content/canonical-mfm-facts.mjs`, exposed by `createEffectiveMfmCatalog()` and projected to Army models through `books/shared/tools/effective-mfm-army-projection.mjs`.
- Mission facts: `missions/content/chapter-approved-2026-27.canonical.json`, validated by `mission-model-contract.mjs` and exposed through `createEffectiveMissionCatalog()`.
- Glossary V2: a downstream index over effective Core, Army, MFM and Missions interfaces. It does not own gameplay facts.
- Roster effective state: a runtime projection of canonical/effective book facts, MFM facts, selected physical roster instances, selections, attachments and structured effects.

Generated readers, HTML, scripts, search indexes, popup payloads and roster projections are never factual owners. The legacy Glossary is presentation/history only and must not feed factual semantics or identity back into any producer.

## 4. MFM contract

The current official MFM v1.5 capture, updated 2026-09-30, and centralized effective MFM catalog are the sole current owners of MFM-owned facts:

- unit points and model/copy schedules;
- paid upgrades and wargear costs;
- Enhancement inventory and costs;
- Leader and Support eligibility;
- Detachment Points;
- Detachment-to-Force-Disposition assignment;
- MFM qualifiers/tags and current/Legends grouping where present.

Army-owned gameplay overlays may add distinct Army semantics, but book configuration and historical per-book MFM snapshots must not validate, override or block current MFM-owned numeric values. Cross-domain binding uses explicit identities in `mfm/content/mfm-army-mission-bindings.json`; `REFERENCE_ONLY` records remain explicit instead of creating synthetic Army datasheets.

The current scoped migration covers Death Guard, Adeptus Mechanicus, Tyranids, T'au Empire, Emperor's Children and Chaos Space Marines: 586/586 in-scope records, 0 gaps and 12/12 multi-Force-Disposition records. Multiple Force Dispositions are canonical stable-ID arrays with exact membership, no duplicates and no ordering semantics unless a source explicitly defines order. Khorne Berzerkers and Rubric Marines are enrolled as the two external CSM MFM dependencies. Central MFM remains the sole owner, with 0 owner conflicts and 0 book numeric overrides.

`tests/mfm-numeric-ownership-qa.mjs`, `tests/mfm-production-migration-qa.mjs`, MFM domain/cross-domain QA and focused book controls use parity and poisoned/stale-owner controls to prove that obsolete book values cannot influence the effective result.

## 5. Identity model

**Canonical identity** answers which fact/entity a record represents. **Contextual effective facts** answer which properties that entity has in a requested book, scope or physical roster state. Sharing a canonical identity does not make every contextual property globally identical.

Current examples:

- `Stormlance Task Force` remains one shared canonical Detachment identity, while its MFM augmentation resolves to 2DP in Blood Angels context and to each sibling book's own current value.
- An inherited Space Marines `Terminator Squad` keeps its shared identity, while Dark Angels context adds the accepted `DEATHWING` keyword overlay without leaking it into Space Marines or Blood Angels.

Correctness-sensitive joins use explicit canonical IDs or an explicit stable source-ID-to-canonical-ID registry. A display rename must not change identity. Parent-scoped child identities are valid where a global identity is not justified. In particular, same-name weapon profiles can have different semantics and must not be merged globally by title. Title/prose lookup is not acceptable when a stable identity exists.

## 6. Deferred Space Marines, Dark Angels and Blood Angels context

Space Marines, Dark Angels and Blood Angels are out of scope for the current certification milestone. Do not treat the architecture notes below, existing code, historical QA or visible book surfaces as proof that these three books are currently certified. Their content and roster certification must be performed in a later bounded milestone.

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

Current QA covers Leader↔Bodyguard behavior, Support, Enhancements, Detachments, selected wargear, stat and weapon changes, added/removed abilities and keywords, stacking, conditional effects, attachment cleanup and duplicate-instance isolation. The main runtime boundaries are `books/shared/roster-context.js`, `roster-game-presentation.js` and `effect-contract-runtime.js`.

## 8. Effect contract model

Structured effect contracts are built in `books/shared/tools/effect-contract.mjs` and interpreted by `books/shared/effect-contract-runtime.js`. Source semantics determine selector, scope, condition and operation. The shared interpreter should be extended only when an accepted current rule cannot be represented by an existing semantic dimension.

Scope is significant: bearer-only, model-only and profile-only effects must not spread to a unit or attachment group. Conversely, an accepted **Attached Unit** effect must propagate through the formed physical group. Do not add rule-name or faction-name branches when an existing scope/selector expresses the rule.

Certified examples:

- Belicosa-class Capacitor Vanes propagates its accepted weapon changes across the attached physical unit and remains isolated from another copy.
- Helix Gauntlet grants the accepted Feel No Pain effect to the attached group, including the attached Librarian, and disappears from that character after detach.
- Negative controls in `attached-unit-wide-effect-scope-qa.mjs`, `physical-unit-game-effects-qa.mjs` and `tests/browser/attached-unit-wide-effects.mjs` prevent over-propagation and cross-instance leakage.

## 9. Attachment-group constraint model

MFM eligibility answers **who may attach**. The canonical constraint layer answers **how many, in which roles, under which Bodyguard condition, whether duplicate canonical characters may coexist, and whether attachment is mandatory**. `attachment-group-constraint.mjs` validates the contract; exact constraints are projected onto existing relation edges; `roster-context.js` evaluates them against physical instances.

The current schema supports only proven corpus dimensions:

- total attachment capacity;
- per-role capacity;
- same-canonical multiplicity for an exact source→target relation;
- conditional capacity from resolved Bodyguard state, currently `STARTING_STRENGTH_EQUALS`;
- duplicate/coexistence restrictions;
- mandatory participant and explicit no-valid-target consequence;
- exact canonical source/target scoping and physical-instance ownership.

Do not replace this with a second eligibility graph or a general expression language.

Certified examples and decisions:

- Cybernetica Datasmith→Kastelan Robots permits repeated physical Datasmith instances. The accepted rule is not `max=2`; the exact relation uses unbounded same-canonical/role/total permission while each physical instance remains unique.
- A Kroot Carnivores Bodyguard at Starting Strength 20 can take a conditional second **distinct** eligible Shaper; ordinary duplicate rules still apply.
- Ordinary groups retain the default one-Leader/one-Support behavior unless an accepted exact constraint says otherwise.
- Death Guard dual-role exceptions retain their accepted scoped behavior.
- Current official MFM v1.5 proves Judiciar has both Leader and Support eligibility. Support does not supersede Leader. One physical Judiciar chooses one feasible role in the actual group. Preserve this accepted hard decision when the deferred SM-family milestone begins.

`tests/attachment-group-constraints-qa.mjs` certifies 43/43 current exception records with mutation controls; browser controls cover Datasmith, Kroot, detach/reload and physical isolation.

## 10. Glossary V2

Glossary V2 is the production factual/search projection. Its canonical input contract is `glossary/v2/content/glossary-v2-index.mjs`; generated `index.en.json` is disposable output. Search, Army/Core popup and full article must resolve the same V2 identity. There is no legacy Glossary gameplay fallback.

The current generated index contains 4,705 entries: 1,813 standalone browse articles and 2,892 parent-scoped children. Main browse exposes standalone entries; scoped children remain searchable and directly openable with parent/book context. Same-name profiles retain visible parent context and may not resolve to an arbitrary global entity.

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

## 13. Current milestone certification state

Content certification is source-first and distinct from roster certification. The current state is:

| Domain | Content certification | Roster certification | Current MFM v1.5 |
|---|---|---|---|
| Core Rules | Complete corpus, normalized text, structured facts, player-visible projection and references certified against the accepted Waha baseline and source-defect ledger | Not an Army roster denominator | Operational baseline certified |
| Death Guard | 100% certified | 100% certified; source-derived denominator fully executable | Regression PASS |
| Adeptus Mechanicus | 100% certified | 100% certified | Regression PASS |
| Tyranids | 100% certified | 1269/1269; partial 0; missing 0 | Regression PASS |
| T'au Empire | 100% certified | 1291/1291; partial 0; missing 0 | Regression PASS |
| Emperor's Children | 100% certified | 670/670; partial 0; missing 0 | Regression PASS |
| Chaos Space Marines | 100% certified | current v1.5 denominator 1586/1586; partial 0; missing 0 | Convergence PROVEN |
| Space Marines | Out of scope | Out of scope | Deferred |
| Dark Angels | Out of scope | Out of scope | Deferred |
| Blood Angels | Out of scope | Out of scope | Deferred |

The final CSM census additionally proves attachments 58/58, active effects 100/100, physical-instance cases 67/67, runtime operator classes 11/11, composition capabilities 3/3, muster-legality classes 5/5 and transport classes 2/2.

Book content records are documented under `docs/certification/`. Roster certification is proven by the focused source-derived censuses and mutation controls accumulated in the corresponding book tests; do not confuse one certification layer with the other.

## 14. Certified generic runtime contracts

The following shared mechanisms are certified in the current milestone and must remain data-driven and faction-agnostic:

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

## 15. Closed defect classes — do not reopen without new evidence

These contracts are certified at the baseline. Investigate them again only after a concrete new failure, source change or reproducible contradiction.

| Class | Certified contract | Focused QA |
|---|---|---|
| MFM numeric ownership | Central MFM is the current numeric/eligibility owner; stale book values have zero influence | `mfm-numeric-ownership-qa.mjs`, `mfm-production-migration-qa.mjs`, `points-consumer-convergence-qa.mjs` |
| Judiciar dual role | Current MFM preserves Leader and Support alternatives; this is a hard decision for the deferred SM-family milestone, not a current SM/DA/BA certification claim | `mfm-production-migration-qa.mjs`, roster attachment QA |
| Attachment constraints | 43/43 enrolled exceptions validate and mutation controls fail closed | `attachment-group-constraints-qa.mjs`, `browser/attachment-group-constraints.mjs` |
| Datasmith/Kroot | Exact multiplicity and Starting-Strength-20 capacity work without weakening ordinary groups | same attachment QA/browser paths |
| Physical instances | duplicate datasheets, attachments and effects remain isolated | `physical-unit-game-projection-qa.mjs`, `physical-unit-game-effects-qa.mjs` |
| Belicosa/Helix | accepted Attached Unit effects propagate and detach/isolation controls hold | `attached-unit-wide-effect-scope-qa.mjs`, `browser/attached-unit-wide-effects.mjs` |
| Glossary context | existing contextual identity controls retain book-specific facts without sibling leakage; SM-family certification remains deferred | `glossary-v2-faction-context-qa.mjs`, `browser/glossary-v2-faction-context.mjs` |
| Weapon keywords | HEAVY, ASSAULT, PRECISION and LETHAL HITS navigate to Core while weapon profiles remain separate | `browser/weapon-keyword-navigation.mjs` |
| DG keyword popup | `keyword-death-guard` resolves through V2 to its canonical Core owner | Glossary production/navigation QA and public release smoke |
| Mission projection | current Mission article classes have useful source-backed projections; operation codes do not replace readable rules | Mission full-corpus/domain QA, Glossary V2 production smoke |
| Source integrity | all current declared sources are classified and enrolled with exact integrity/currentness checks | `npm run source:check`, source enrollment/ingestion QA |
| Publication freshness | final aggregate publication refresh is deferred until after independent red-team adjudication | `npm run publication:check` at the final release gate |
| Cache/offline | the current derived stamp is `5d5ff33f862d9332`; update and offline acceptance must be repeated at the final release gate | `npm run cache:check`, `test:pwa-update`, `test:cold-offline` |

Certification is scoped to what these controls prove; it is not permission to ignore a new reproducible defect.

## 16. Known open issues and evidence gaps

**PROVEN BUG**

- None recorded at the certified baseline.

**EVIDENCE GAP**

- Mirrored World exact D6-to-option mapping.
- Verified vector digitization for 6 Deployment and 45 Event-layout geometries.

**TECH DEBT**

- Some books retain different adapter/source shapes behind the shared effective contract; do not refactor merely for uniformity.
- Legacy Glossary files and historical per-book MFM snapshots remain for compatibility/provenance. They must remain non-authoritative.
- Accepted compatibility rows that lack stable upstream source identities remain outside correctness-sensitive identity repairs; do not invent title-to-ID ownership.
- Four current priced T'au Imperial Armour MFM records (Ta'unar Supremacy Armour, Manta, Tiger Shark and AX-1-0 Tiger Shark) remain explicit `REFERENCE_ONLY` because no accepted Army canonical datasheet identities exist.
- `tests/sm-family-normalization-qa.mjs` is a standalone historical QA path with a stale Orksbane-profile assertion; it is not part of the current aggregate and is not evidence of a production defect.

**FUTURE WORK**

- Complete intended faction/mode coverage, Mission/Game Assistant features and any remaining product UX before considering a clean rewrite.
- Digitize geometry only from accepted evidence with independent verification.
- Close evidence gaps when new accepted official evidence is enrolled.

## 17. QA and certification contract

Major release gates are:

- `npm run test:full` — complete aggregate, reserved for the final scoped release gate after red-team adjudication and generated-output refresh.
- `npm run publication:check` — generated publication ownership/freshness and offline route inventory; it is not yet the release claim for this local milestone HEAD.
- `npm run source:check` and enrolled-source QA — exact accepted source integrity/currentness; rerun at the final gate rather than copying a historical owner count into a release claim.
- `npm run cache:check`, `npm run test:pwa-update`, `npm run test:cold-offline` — derived cache revision, update behavior and offline routes.
- deterministic builder `--check` paths for Core/Army/Glossary/Missions outputs.
- focused `qa:points`, `qa:roster`, `qa:effects`, book QA and integration controls for correctness-sensitive changes.

Use focused QA during a repair and reserve `test:full` for explicit checkpoints/release gates. A green test is not independent factual proof when its expected value comes from the same producer under test. Prefer accepted-source comparisons, independent contracts, poisoned-input checks and mutation controls.

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

## 18. Release and Pages workflow

- Authoritative working branch: `working/army-books-clean`.
- Deployment remote: `release` → `XYPMApwnz/warhammer-rules-fe1d435`.
- GitHub Pages serves branch `working/army-books-clean`, path `/`, through the repository's existing legacy Pages build.
- Before deployment, fetch and resolve the actual Pages source SHA from current configuration/build state. Create a clearly named rollback branch at that exact SHA.
- Require the published SHA to be an ancestor of the certified local HEAD. Push a normal fast-forward only; never force-push or rewrite release history.
- Wait for Pages to report the new exact SHA, then use fresh desktop/phone contexts to verify public routes, critical controls, required assets, service worker/cache revision and offline behavior.
- Public URL: <https://xypmapwnz.github.io/warhammer-rules-fe1d435/>.

## 19. Development policy

- During milestone certification and release stabilization, do not start feature work.
- Repair the factual owner or true producer first; generated symptoms are not owners.
- Prefer the smallest source-backed repair plus focused regression coverage.
- Fix a systemic defect once at the common producer/runtime boundary instead of patching every output.
- Do not reopen a certified class without a new signal.
- Preserve explicit stable identities and fail closed on unknown/conflicting bindings.
- Run broad `test:full` only at checkpoints or release gates, then deploy only the exact certified clean HEAD.

## 20. Future clean rewrite

A clean rewrite starts only after the entire intended product is feature-complete, not merely after the present Game Night scope is stable. Its inputs should be:

- canonical/effective factual exports;
- the accepted source/evidence package;
- final behavior specification;
- final UX/design specification;
- the acceptance suite;
- the current final application as a behavioral oracle.

The new implementation should preserve proven contracts and observable behavior without copying legacy architecture blindly.

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

## Death Guard content certification

The complete supported/current Death Guard gameplay corpus is certified source-first against the 2026-09-25 Waha 11E capture, with current centralized MFM ownership and official Faction Pack precedence. See [DEATH_GUARD_WAHA_CONTENT_CERTIFICATION.md](certification/DEATH_GUARD_WAHA_CONTENT_CERTIFICATION.md).

## Adeptus Mechanicus content certification

The complete supported/current Adeptus Mechanicus gameplay corpus is certified source-first against the 2026-09-25 Waha 11E capture, with current centralized MFM ownership and stronger enrolled official evidence taking precedence on direct conflicts. See [ADEPTUS_MECHANICUS_WAHA_CONTENT_CERTIFICATION.md](certification/ADEPTUS_MECHANICUS_WAHA_CONTENT_CERTIFICATION.md).

The remaining certified milestone content records are [Tyranids](certification/TYRANIDS_WAHA_CONTENT_CERTIFICATION.md), [T'au Empire](certification/TAU_EMPIRE_WAHA_CONTENT_CERTIFICATION.md), [Emperor's Children](certification/EMPERORS_CHILDREN_WAHA_CONTENT_CERTIFICATION.md) and [Chaos Space Marines](certification/CHAOS_SPACE_MARINES_WAHA_CONTENT_CERTIFICATION.md). Core is documented in [CORE_WAHA_CONTENT_CERTIFICATION.md](certification/CORE_WAHA_CONTENT_CERTIFICATION.md).
