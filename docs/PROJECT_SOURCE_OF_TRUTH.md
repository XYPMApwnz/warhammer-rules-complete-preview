# Project source of truth

This document describes the repository at the certified baseline below. Treat current code, enrolled evidence and passing QA as authoritative when this document and an older handoff disagree.

## 1. Current baseline

- Branch: `working/army-books-clean`.
- Certified HEAD and current public Pages SHA: `c903ebec77d238e5423934c31aed5a461f10abbe`.
- Public site: <https://xypmapwnz.github.io/warhammer-rules-fe1d435/>.
- Pages source: the root of `release/working/army-books-clean` in `XYPMApwnz/warhammer-rules-fe1d435`.
- Cache revision: `6f57915fe9ddc628`, generated in `glossary/generated/cache-revision.js` and consumed by `service-worker.js`.
- Release gate at this HEAD: `test:full` 72/72 PASS; publication, source integrity/currentness, cache revision and cold-offline gates PASS. The current `source:check` accounts for 85 public active owners plus 3 Orks freshness-only owners with no unclassified or undeclared source.
- The expected maintenance state is a clean working tree. The final public acceptance at this SHA passed desktop 1440×900, phone 390×844, all nine books, critical roster controls, a fresh service-worker install and offline root/Core/Glossary/Roster/Army Book routes.

## 2. Product scope

Production includes the Library/root, Core Rules reader, nine Army Books, roster guides and effective roster views, Glossary V2, current standard/event mission reference content, desktop and phone readers, and installable offline/PWA behavior.

The supported Army Books are:

1. Death Guard
2. Adeptus Mechanicus
3. Tyranids
4. T'au Empire
5. Emperor's Children
6. Chaos Space Marines
7. Space Marines
8. Dark Angels
9. Blood Angels

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

The current official MFM v1.4 capture and centralized effective MFM catalog are the sole current owners of MFM-owned facts:

- unit points and model/copy schedules;
- paid upgrades and wargear costs;
- Enhancement inventory and costs;
- Leader and Support eligibility;
- Detachment Points;
- Detachment-to-Force-Disposition assignment;
- MFM qualifiers/tags and current/Legends grouping where present.

Army-owned gameplay overlays may add distinct Army semantics, but book configuration and historical per-book MFM snapshots must not validate, override or block current MFM-owned numeric values. Cross-domain binding uses explicit identities in `mfm/content/mfm-army-mission-bindings.json`; `REFERENCE_ONLY` records remain explicit instead of creating synthetic Army datasheets.

`tests/mfm-numeric-ownership-qa.mjs`, `tests/mfm-production-migration-qa.mjs`, `tests/points-consumer-convergence-qa.mjs` and MFM domain/cross-domain QA use parity and poisoned/stale-owner controls to prove that obsolete book values cannot influence the effective result.

## 5. Identity model

**Canonical identity** answers which fact/entity a record represents. **Contextual effective facts** answer which properties that entity has in a requested book, scope or physical roster state. Sharing a canonical identity does not make every contextual property globally identical.

Current examples:

- `Stormlance Task Force` remains one shared canonical Detachment identity, while its MFM augmentation resolves to 2DP in Blood Angels context and to each sibling book's own current value.
- An inherited Space Marines `Terminator Squad` keeps its shared identity, while Dark Angels context adds the accepted `DEATHWING` keyword overlay without leaking it into Space Marines or Blood Angels.

Correctness-sensitive joins use explicit canonical IDs or an explicit stable source-ID-to-canonical-ID registry. A display rename must not change identity. Parent-scoped child identities are valid where a global identity is not justified. In particular, same-name weapon profiles can have different semantics and must not be merged globally by title. Title/prose lookup is not acceptable when a stable identity exists.

## 6. Space Marines, Dark Angels and Blood Angels inheritance

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
- Current official MFM v1.4 proves Judiciar has both Leader and Support eligibility. Support does not supersede Leader. One physical Judiciar chooses one feasible role in the actual group.

`tests/attachment-group-constraints-qa.mjs` certifies 43/43 current exception records with mutation controls; browser controls cover Datasmith, Kroot, detach/reload and physical isolation.

## 10. Glossary V2

Glossary V2 is the production factual/search projection. Its canonical input contract is `glossary/v2/content/glossary-v2-index.mjs`; generated `index.en.json` is disposable output. Search, Army/Core popup and full article must resolve the same V2 identity. There is no legacy Glossary gameplay fallback.

The current generated index contains 4,705 entries: 1,813 standalone browse articles and 2,892 parent-scoped children. Main browse exposes standalone entries; scoped children remain searchable and directly openable with parent/book context. Same-name profiles retain visible parent context and may not resolve to an arbitrary global entity.

Shared canonical entries can expose context-specific effective facts through `resolveView(bookId, id)`. Filter/search changes must reconcile the active article with the visible result set while deep-link and Back/Forward behavior remain coherent.

Known intentional limitation: `army::chaos-space-marines::detachment_rule::deceptors::chaos-space-marines-detachment-rule-masters-of-misdirection` has an accepted identity but no accepted upstream gameplay body, so it remains evidence-limited rather than inheriting guessed or legacy text.

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
- Masters of Misdirection has identity/context but no accepted substantive body.
- Abaddon's `The Warmaster` instruction is accepted, but its verified option definitions are not present in the enrolled CSM evidence; choices remain absent rather than reconstructed.
- Mirrored World has accepted rule, options, D6 metadata and reroll-6 fact, but no proven roll-to-option mapping; option order must not be turned into die results.
- Six Deployment and 45 Event-layout machine geometry layers await verified digitization.

## 13. Closed defect classes — do not reopen without new evidence

These contracts are certified at the baseline. Investigate them again only after a concrete new failure, source change or reproducible contradiction.

| Class | Certified contract | Focused QA |
|---|---|---|
| MFM numeric ownership | Central MFM is the current numeric/eligibility owner; stale book values have zero influence | `mfm-numeric-ownership-qa.mjs`, `mfm-production-migration-qa.mjs`, `points-consumer-convergence-qa.mjs` |
| Judiciar dual role | Current MFM Leader and Support alternatives both survive through SM/DA/BA and runtime role assignment | `mfm-production-migration-qa.mjs`, roster attachment QA |
| Attachment constraints | 43/43 enrolled exceptions validate and mutation controls fail closed | `attachment-group-constraints-qa.mjs`, `browser/attachment-group-constraints.mjs` |
| Datasmith/Kroot | Exact multiplicity and Starting-Strength-20 capacity work without weakening ordinary groups | same attachment QA/browser paths |
| Physical instances | duplicate datasheets, attachments and effects remain isolated | `physical-unit-game-projection-qa.mjs`, `physical-unit-game-effects-qa.mjs` |
| Belicosa/Helix | accepted Attached Unit effects propagate and detach/isolation controls hold | `attached-unit-wide-effect-scope-qa.mjs`, `browser/attached-unit-wide-effects.mjs` |
| Glossary context | shared identity retains BA DP and DA keyword contexts without sibling leakage | `glossary-v2-faction-context-qa.mjs`, `browser/glossary-v2-faction-context.mjs` |
| Weapon keywords | HEAVY, ASSAULT, PRECISION and LETHAL HITS navigate to Core while weapon profiles remain separate | `browser/weapon-keyword-navigation.mjs` |
| DG keyword popup | `keyword-death-guard` resolves through V2 to its canonical Core owner | Glossary production/navigation QA and public release smoke |
| Mission projection | current Mission article classes have useful source-backed projections; operation codes do not replace readable rules | Mission full-corpus/domain QA, Glossary V2 production smoke |
| Source integrity | all current declared sources are classified and enrolled with exact integrity/currentness checks | `npm run source:check`, source enrollment/ingestion QA |
| Publication freshness | all nine mobile generators and aggregate publication inventory are current | `npm run publication:check` |
| Cache/offline | derived revision matches required assets; update and cold-offline routes pass | `npm run cache:check`, `test:pwa-update`, `test:cold-offline` |

Certification is scoped to what these controls prove; it is not permission to ignore a new reproducible defect.

## 14. Known open issues and evidence gaps

**PROVEN BUG**

- None recorded at the certified baseline.

**EVIDENCE GAP**

- Masters of Misdirection substantive text.
- Abaddon/The Warmaster verified option definitions.
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

## 15. QA and certification contract

Major release gates are:

- `npm run test:full` — complete aggregate; 72/72 leaves passed at this baseline.
- `npm run publication:check` — generated publication ownership/freshness and offline route inventory.
- `npm run source:check` and enrolled-source QA — exact accepted source integrity/currentness; currently 85 public active plus 3 Orks freshness-only owners, with complete enrollment and no unclassified source.
- `npm run cache:check`, `npm run test:pwa-update`, `npm run test:cold-offline` — derived cache revision, update behavior and offline routes.
- deterministic builder `--check` paths for Core/Army/Glossary/Missions outputs.
- focused `qa:points`, `qa:roster`, `qa:effects`, book QA and integration controls for correctness-sensitive changes.

Use focused QA during a repair and reserve `test:full` for explicit checkpoints/release gates. A green test is not independent factual proof when its expected value comes from the same producer under test. Prefer accepted-source comparisons, independent contracts, poisoned-input checks and mutation controls.

## 16. Release and Pages workflow

- Authoritative working branch: `working/army-books-clean`.
- Deployment remote: `release` → `XYPMApwnz/warhammer-rules-fe1d435`.
- GitHub Pages serves branch `working/army-books-clean`, path `/`, through the repository's existing legacy Pages build.
- Before deployment, fetch and resolve the actual Pages source SHA from current configuration/build state. Create a clearly named rollback branch at that exact SHA.
- Require the published SHA to be an ancestor of the certified local HEAD. Push a normal fast-forward only; never force-push or rewrite release history.
- Wait for Pages to report the new exact SHA, then use fresh desktop/phone contexts to verify public routes, critical controls, required assets, service worker/cache revision and offline behavior.
- Public URL: <https://xypmapwnz.github.io/warhammer-rules-fe1d435/>.

## 17. Development policy

- During Game Night stabilization, do not start feature work.
- Repair the factual owner or true producer first; generated symptoms are not owners.
- Prefer the smallest source-backed repair plus focused regression coverage.
- Fix a systemic defect once at the common producer/runtime boundary instead of patching every output.
- Do not reopen a certified class without a new signal.
- Preserve explicit stable identities and fail closed on unknown/conflicting bindings.
- Run broad `test:full` only at checkpoints or release gates, then deploy only the exact certified clean HEAD.

## 18. Future clean rewrite

A clean rewrite starts only after the entire intended product is feature-complete, not merely after the present Game Night scope is stable. Its inputs should be:

- canonical/effective factual exports;
- the accepted source/evidence package;
- final behavior specification;
- final UX/design specification;
- the acceptance suite;
- the current final application as a behavioral oracle.

The new implementation should preserve proven contracts and observable behavior without copying legacy architecture blindly.

## 19. Do not regress these decisions

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

The complete supported/current Death Guard gameplay corpus is certified source-first against the 2026-09-25 Waha 11E capture, with official MFM v1.4 ownership and official Faction Pack precedence. See [DEATH_GUARD_WAHA_CONTENT_CERTIFICATION.md](certification/DEATH_GUARD_WAHA_CONTENT_CERTIFICATION.md).
