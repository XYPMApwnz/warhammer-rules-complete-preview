# Native rule-markup gate and Insectile Murmuration

Status: **READY_FOR_REVIEW**. Feature SHA: `9efbd95f67c5e65bc62b477e36acf9d710ff4784`. Base: `635c503b4bb45d13e3c2cc92c439b86a75e1c954`. The source/main/release/Pages references are not changed by this task; no fast-forward is authorized or performed. Separate commits: `f1e0a5b5` for the exact DG annotation fix; `4d49446d` for the census gate, registry, controls, queue wiring and instructions; an additional test-only commit if listed below preserves the initial numeric certification on its own historical ledger while allowing future reviewed HEAD updates.

## Result and scope

The native census reads **2,724** logical rule occurrences through the same nine native factories as the accepted [census a854d173](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/blob/a854d1735ebc780ed587b6be86d2a6581584c7b6/docs/reviews/markup-census-2026-11-19.md). Current result: **812 EXECUTED / 1,478 RECIPIENTS_ONLY / 218 TEXT_ONLY_INTENDED / 45 GAP / 171 UNKNOWN**. Partial: **126**; minimum resolved-category coverage: **2,508/2,724 = 92.07%**. This is not the proportion of all rule semantics automatically executed.

Only Insectile Murmuration changes category: GAP → RECIPIENTS_ONLY. No other GAP/UNKNOWN is recategorized. The original exact **46 GAP + 171 UNKNOWN** historical debt remains pinned; active debt is **45 + 171**, with one separately evidenced closure.

| Measure | Accepted census | This task |
| --- | ---: | ---: |
| N | 2724 | 2724 |
| EXECUTED | 812 | 812 |
| RECIPIENTS_ONLY | 1477 | 1478 |
| TEXT_ONLY_INTENDED | 218 | 218 |
| GAP | 46 | 45 |
| UNKNOWN | 171 | 171 |
| Partial/composite rows | 126 | 126 |

## Command, decisions and failure boundaries

`npm run markup:census -- --check` validates current native inputs. `--report=<external.json|external.md>` retains the same result; it never rewrites decisions or rebuilds books. The normal measured run took **6.16 seconds**, so the command and its focused controls are in quick and pre-FF. The one pre-FF invocation includes all old jobs in their existing order plus five new jobs. Timing CSV records each completed job.

The versioned decision registry is `tools/markup-census/decisions.v1.json`. Each physical source occurrence has its canonical owner, exact source fields, category, reason, review references, partial marker and native evidence. Factual fingerprints cover the complete provenance/annotation-stripped owner data and source shape independently of `ruleContract.sourceFields`. Binding/capability fingerprints separately protect actual operations, recipient paths, scoped Core presence, attachment permissions, provided weapons, physical equipment and condition bindings. This is evidence about factual owners, not a second source of gameplay values.

The native factories are really invoked through a filesystem-only fetch with the already-loaded publication; no invented roster or substitute runtime is used for counting. SM/BA/DA template books come from their native constructor `.book`; AM's real equipment-caption adapter is also applied. Different source formats remain adapters, not a data-format migration.

New/changed source without a reviewed decision, unknown category, duplicate ID, stale fingerprint, vanished source field, missing retirement and debt outside the exact named list fail closed. The accepted source denominator has **2,138 exact reviewed rule-bearing structural exclusions and 34 exact adjacent-field exclusions**. A new named section/table or a new text field cannot silently inherit a generic exclusion; unknown native kinds fail. Existing exclusion source changes invalidate their old normalization decision.

The original 217 debt identities/reasons/next actions are immutable historical evidence; closures remove active debt only with an explicit resolved decision and a source-linked test plus structured fixture. Common words in unrelated files are not evidence. Fixture canonical IDs and exact clause membership are checked, including path/junction escape controls. Retirement review records identify the prior fingerprint and hash of the accepted replacement source bytes. The gate checks evidence identity/structure; the actual witness tests run separately in the queues.

Executable conditions include real common dispatch reachability and physical-condition implementation/binder/native-wiring proofs. Removing an actual INITIAL_ATTACHMENT case or physical equipment binder fails. Implementation changes require review of the affected proof; the gate does not freeze unrelated files/outputs. These checks do not replace source interpretation, native physical-state tests or A/B acceptance.

Files: [command](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/blob/9efbd95f67c5e65bc62b477e36acf9d710ff4784/tools/markup-census.mjs), [native inventory](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/blob/9efbd95f67c5e65bc62b477e36acf9d710ff4784/tools/markup-census/native-inventory.mjs), [checker](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/blob/9efbd95f67c5e65bc62b477e36acf9d710ff4784/tools/markup-census/check.mjs), [computers](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/blob/9efbd95f67c5e65bc62b477e36acf9d710ff4784/tools/markup-census/computers.mjs), [evidence linkage](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/blob/9efbd95f67c5e65bc62b477e36acf9d710ff4784/tools/markup-census/evidence.mjs), [operator instructions](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/blob/9efbd95f67c5e65bc62b477e36acf9d710ff4784/docs/UPDATING.md).

## Negative controls

All five required controls PASS by detecting their intended failure: missing category → UNCLASSIFIED; stale source → STALE_DECISION; new GAP → NEW_DEBT; actual removed INITIAL_ATTACHMENT computer → MISSING_COMPUTER; lost real source text field → SOURCE_FIELD_LOSS.

The complete new gate test has **16** detected mutation controls, additionally covering a removed physical-equipment binder, a new known-kind excluded section, an unaccounted source rule field, a new rule, duplicate identity, unexplained disappearance, rewritten historical debt, active-debt deletion and unrelated/missing closure evidence. The separate evidence test has **29** positive/negative controls, including exact source/clause linkage, wrong owners/clauses, missing text/field, unrelated real files/common-word identities, source retirement substitution and path/junction escapes. No old assertion is removed or relaxed.

## Insectile Murmuration: before and after

Canonical source: `detachment-flyblown-host:enhancement:1`, clause `wound-reroll`. The existing owner role already described an eligible PLAGUE MARINES UNIT, but lacked the explicit OWNER / SOURCE_UNIT relationship needed by the O-1 text gate. The single source-bound owner relation and SOURCE_UNIT / FORMED effect recipient are now declared. The battle attack-target/Contagion Range condition remains literal; no reroll, attack, range or other numerical effect is executed.

| Exact witness | Before 635c503b | After 9efbd95f | Preserved checks |
| --- | --- | --- | --- |
| Biologus Putrifier attached to the seven-model Plague Marines UNIT carrying the upgrade | 0 inherited full-text blocks | Exactly 1 complete canonical block on the attached component | Exact rule/clause/source field, physical source `parsed-unit-2`, recipient `parsed-unit-1`, UNIT/FROM_SOURCE_UNIT/FORMED, full canonical text/provenance |
| Independent seven-model duplicate | 0 | 0 | No source/ownership leak |
| Detach / reattach | No inherited text | 0 / exactly the same full block | Same physical source and body |
| Upgrade unselected | 0 | 0 | No fabricated owner |
| Stored roster and full executable projection | Original | Byte-equivalent serialized observations | Every effective field except the one admitted text route remains exact |

The dedicated native witness reproduces the old absence on the accepted source and checks attached/detached/reattached/reloaded/unselected states, duplicate controls and old-owner/PHYSICAL-recipient mutations. The unchanged strict O-1 browser runner passes at **390 and 1440**, both Effective Datasheet and Personal Guide, retaining all eight stage/view assertions per width plus source-detachment checks (**20 assertions** per run). Baseline runner PASS means it confirms the former expected absence; branch PASS confirms the admitted full text. After screenshots are in the gallery.

The default Playwright browser cache was absent during initial preparation; the run was repeated using the installed Chrome executable through the existing supported environment override, as in the prior accepted pre-FF. No browser assertion, timeout or application code was changed for this environment issue.

## Existing test expectation changes

Only one old fixture file changes. The existing O-1 browser assertion code is unchanged. The new native/browser/gate tests add checks; they do not replace old checks. Complete exact changes are in `tests.patch` (zero context; use `git apply --unidiff-zero` when applying it to the exact base). [Screenshot gallery](markup-gate-2026-11-20/GALLERY.html) contains the original 390/1440 after images.

| Test/fixture | Before | After | Why |
| --- | --- | --- | --- |
| `books/death-guard/v2/recipient-enrollment-qa.json`, Insectile `wound-reroll` record | Exact source clause in deferred list; no owner gate | Same quote/field/clause moved to recorded list with the exact physical owner/recipient reason | Authorized point 2 closes only this clause |
| Same file, browser case `death-guard:detachment-flyblown-host:enhancement:1:28`, `expectedAttached` | false | true | Source-bound UNIT owner is now proven; exact canonical body, recipients, scope, count and detach/reattach checks are preserved |
| Same case, `visibilityReason` | Explicit unresolved O-1 owner relation | Explicit current SOURCE_UNIT FORMED route and independent/detached negative boundary | Description follows the admitted annotation, not a numerical expectation change |
| New `tests/markup-census-qa.mjs`, test-only follow-up | Initial numeric census asserted on every HEAD | Same exact initial counts on introducing ledger; current HEAD exactly equals native inventory/current reviewed ledger | Preserves all 16 controls without freezing future approved source releases or evidenced debt closures |

## Generated gate and gameplay equality

Current full rebuild gate status: **PASS** (the normal `generated:check` job in the single final pre-FF, not an extra concurrent run).

Direct exact-base comparison: **147 factual generated outputs, 146 byte-identical**. Only the native DG contract artifact changes. Restoring just the explicitly listed owner/recipient metadata reconstructs the whole original parsed artifact; all entity data and all execution clauses/conditions/policies serialize byte-identically.

| File | Before bytes | After bytes | Allowed change |
| --- | --- | --- | --- |
| books/death-guard/v2/generated/rule-contract-effective.json | 2293806 | 2295405 | Insectile only: OWNER/SOURCE_UNIT, exact affected UNIT/FORMed text recipient and RECORDED status |

Factual data hash: `23639c8e9938750628d68ade45ce33aafef3185bbe1ad382fbcb166f9bdd5987`; execution field hash: `d3bc5166dccc18ab4c05cd04eea4130bc513ffe80b03974a4a48199c0f65454a`. No characteristics, weapons, prices, rule text, Stratagem text, CP, executable operations or conditions change. The source registry is unchanged.

Fresh A/B captures on the exact base and full-pre-FF feature SHA `4d49446d8068e57cfa143a698886922a803a0690`: **199 rosters / 507 states; zero differences in complete import, snapshot, projection, effective, related and points observations**. The comparison permits only exact canonical Insectile attached text with proven physical ownership; no such witness occurs in the fixed 199 set, so even allowed text differences are zero there. The dedicated additional source-bound Insectile case above establishes the intended display difference without changing gameplay. No other field is masked.

| Book | Rosters | States | Gameplay differences | Allowed text differences |
| --- | --- | --- | --- | --- |
| adeptus-mechanicus | 21 | 42 |  |  |
| blood-angels | 4 | 14 |  |  |
| chaos-space-marines | 67 | 164 |  |  |
| dark-angels | 5 | 16 |  |  |
| death-guard | 11 | 32 |  |  |
| emperors-children | 14 | 34 |  |  |
| space-marines | 5 | 24 |  |  |
| tau-empire | 54 | 122 |  |  |
| tyranids | 18 | 59 |  |  |

## The other 45 GAPs — proposals only

Every row remains GAP in both active debt and decisions. All 45 have a battlefield-dependent attack, distance, chosen enemy, disembarkation, wound/destruction or activation qualification; none was proven to be an unconditional direct stat/weapon change with all prerequisites known from the roster. Known roster candidates are explicitly separated from those unknown qualifications.

The proposed TEXT_ONLY_INTENDED boundary is **not approved by this task**. Owner/Claude must decide whether source-owner full text is sufficient or whether conditional text at potential recipients is still required. If that propagation is required, the exact annotation debt remains and the fallback S/M/L estimate applies. No count is improved by these proposals.

| Book / exact rule | Roster-known candidates | Missing battlefield inputs | Proposal / optional annotation size |
| --- | --- | --- | --- |
| adeptus-mechanicus / Panegyric Procession (`detachment-data-psalm-conclave:rule#component/panegyric-procession`) | Selected detachment; candidate CULT MECHANICUS models. | First-round Benediction choice; actual ranged attack, target and half-range relation. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Resolve qualified attack AP manually; do not change stored weapon AP. Preserve the separate F1-admission question. If recipient annotation is required: M |
| adeptus-mechanicus / Emotionless Clarity (`detachment-cohort-cybernetica:enhancement:3`) | Bearer; candidate allied keywords and Deadly Demise references. | Destroyed model within 12 inches; once-per-turn activation; actual Deadly Demise victims. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Resolve destruction/range and mortal wounds manually; the destroyed trigger is not a damage recipient. If recipient annotation is required: M |
| adeptus-mechanicus / Bomb Rack (`datasheet-archaeopter-fusilave:section:1#/blocks/0/text`) | Owning Fusilave and its rule. | Opponent phase end; selected visible enemy within 24 inches excluding Lone Operative; dice. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual target-qualified mortal wounds. Retain the enemy exception; no unrestricted enemy selector. If recipient annotation is required: M |
| adeptus-mechanicus / Invocation of Machine Vengeance (`datasheet-belisarius-cawl:section:4#/blocks/0/text`) | Cawl; candidate friendly ADEPTUS MECHANICUS models. | Command-phase enemy choice; current Machine Vengeance mark; actual attack against that enemy. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual Hit reroll against the marked target, without assuming the mark or broadening model membership. If recipient annotation is required: M |
| adeptus-mechanicus / Emanatus Force Field (Aura) (`datasheet-onager-dunecrawler:section:1#/blocks/0/text`) | Onager; candidate AM BATTLELINE models. | Wholly within 6 inches; actual incoming ranged attack. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual qualified save, not unconditional 4+ invulnerable save. Preserve the missing range-anchor question. If recipient annotation is required: M |
| adeptus-mechanicus / Searing Conflagration (`datasheet-pteraxii-sterylizors:section:1#/blocks/0/text`) | Owning models; selected phosphor torches can be known. | Actual torch attack; enemy at an objective; friendly BATTLELINE within 6 inches determines reroll tier. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual qualified Wound rerolls. Do not give the text to formed models lacking the required weapon. If recipient annotation is required: M |
| adeptus-mechanicus / Servo-skull Uplink (`datasheet-skitarii-marshal:section:1#/blocks/1/text`) | Marshal; candidate friendly SKITARII units. | Once-per-battle use; phase; selected Battle-shocked unit within 6 inches. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual removal of the selected unit's battlefield Battle-shocked state, not roster-state repair. If recipient annotation is required: M |
| adeptus-mechanicus / Fire Support (`datasheet-skorpius-dunerider:section:1#/blocks/1/text`) | Source Transport; possible allied models. | Models disembarked from this exact Transport this turn; shooting hits; selected enemy. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual rerolls for actual disembarked models against the marked enemy; attachment is not transport occupancy. If recipient annotation is required: L |
| death-guard / Afflicted (`army-rule-nurgles-gift:afflicted#/text`) | Army identity; available Plague definitions. | Unrecorded Declare Battle Formations Plague choice; actual enemy Afflicted state. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual enemy Toughness/Plague consequences. Do not infer a chosen Plague or modify friendly roster Toughness. If recipient annotation is required: L |
| death-guard / Contagion Range (`army-rule-nurgles-gift:contagion-range#/text`) | DEATH GUARD faction prerequisite remains a source-bound requirement. | Current battle-dependent range; enemy position relative to a source model. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual range and Afflicted determination. Book identity alone is not a replacement for faction prerequisite proof. If recipient annotation is required: L |
| death-guard / Rattlejoint Ague (`army-rule-nurgles-gift:rattlejoint-ague#/text`) | Named child of the Afflicted procedure; Save direction. | Parent Plague choice; actual enemy Afflicted state. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual affected-enemy Save penalty. Keep the parent qualification, not an unconditional friendly save change. If recipient annotation is required: L |
| death-guard / Scabrous Soulrot (`army-rule-nurgles-gift:scabrous-soulrot#/text`) | Named child of Afflicted; characteristic list and OC minimum. | Parent Plague choice; actual enemy Afflicted state. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual enemy M/LD/OC penalties with OC minimum 1; preserve MODEL-within-enemy-UNIT scope. If recipient annotation is required: L |
| death-guard / Skullsquirm Blight (`army-rule-nurgles-gift:skullsquirm-blight#/text`) | Named child of the source Afflicted procedure. | Chosen Plague; enemy Afflicted status; current ranged/melee attack and cover/Hit resolution. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual source-exact attack consequences; preserve both bullets without repairing wording or substituting BS/WS. If recipient annotation is required: L |
| death-guard / Parasitic Woe‑Reaper (`detachment-contagion-engines:enhancement:1`) | Assigned CONTAGION ENGINE UNIT upgrade owner. | Unit has fought; one chosen wounded model; lost wounds; D3. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual one-model healing after fighting; not healing all models or increasing starting Wounds. If recipient annotation is required: M |
| death-guard / Tome of Bounteous Blessings (`detachment-tallyband-summoners:enhancement:4`) | Bearer; candidate PLAGUE LEGIONS/BATTLELINE units; other current recipient channels. | Range; actual Battle-shock test/pass; chosen wounded model; D3; destroyed-model alternative. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Propose manual scope only for recover-wounds. Preserve test-modifier/return-model channels and partial coverage. If recipient annotation is required: L |
| death-guard / Assault Ramp (`datasheet-chaos-land-raider:section:1#/blocks/0/text`) | Owning Chaos Land Raider. | Actual passenger disembarking after this Transport's Normal move; current disembark event. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual assault-disembark permission with Core 18.06. Roster co-presence does not prove passengers. If recipient annotation is required: L |
| death-guard / Metalophagic Infection (`datasheet-chaos-predator-annihilator:section:1#/blocks/0/text`) | Source Predator; printed enemy keyword restriction. | Shooting hits; selected enemy MONSTER/VEHICLE; Afflicted; D6. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual target-qualified mortal wounds, not a weapon stat change or unconditional enemy damage. If recipient annotation is required: M |
| death-guard / Hail of Corrosive Disease (`datasheet-chaos-predator-destructor:section:1#/blocks/0/text`) | Source Predator; candidate friendly DEATH GUARD units. | Selected enemy actually hit; enemy exclusions; current ranged attack; once-per-phase cap. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual AP benefit against marked enemy; not permanent AP on all friendly weapons. Enemy is not beneficiary. If recipient annotation is required: L |
| death-guard / Fire Support (`datasheet-chaos-rhino:section:1#/blocks/0/text`) | Source Rhino; possible allied models. | Exact Transport disembark history this turn; shooting hit; selected enemy. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual disembarked-model rerolls. Do not substitute attached formation models for passengers. If recipient annotation is required: L |
| death-guard / Lethal Ichor (`datasheet-chaos-spawn:section:1#/blocks/0/text`) | Owning Spawn models. | Allocated melee attack; actual enemy attacker; completed attacks; capped dice. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual retaliatory mortal wounds to the actual attacker. Preserve the per-attacker cap and timing. If recipient annotation is required: M |
| death-guard / Horrifying Visage (`datasheet-daemon-prince-of-nurgle-with-wings:section:1#/blocks/0/text`) | Source Daemon Prince. | Completed Charge; selected enemy in Engagement Range; Battle-shock test. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual selected-enemy test penalty after Charge, not Leadership or Movement modification. If recipient annotation is required: M |
| death-guard / Enfeebling Miasma (Aura) (`datasheet-daemon-prince-of-nurgle-with-wings:section:1#/blocks/1/text`) | Source; printed MONSTER/VEHICLE exclusion. | Enemy within 6 inches; Fall Back; model escape tests; Battle-shocked state. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual positional movement/test restriction; retain exclusion and each model's test qualification. If recipient annotation is required: L |
| death-guard / Miasma of Pestilence (Aura) (`datasheet-daemon-prince-of-nurgle:section:1#/blocks/2/text`) | Source Prince; candidate friendly DEATH GUARD units. | Unit within 6 inches; actual incoming ranged attack. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual qualified Benefit of Cover. Known ally identity does not prove range or incoming attack. If recipient annotation is required: M |
| death-guard / Barrage of Filth (`datasheet-defiler:section:1#/blocks/1/text`) | Source Defiler. | Shooting hits; selected enemy; current phase duration. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual denial of enemy Cover after the hit event; do not overwrite own weapon traits. If recipient annotation is required: M |
| death-guard / Explosive Blight (`datasheet-foetid-bloat-drone-with-heavy-blight-launcher:section:1#/blocks/0/text`) | Source drone and weapon. | Enemy destroyed; last-model removal; Afflicted/D6; other enemies within 6 inches of that destroyed model. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual Afflicted spread. Preserve destroyed-model range origin, not source-drone range. If recipient annotation is required: L |
| death-guard / Putrefying Stink (`datasheet-foul-blightspawn:section:1#/blocks/1/text`) | Source Foul Blightspawn. | Enemy models' positions and Advance start/end positions. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual 9-inch Advance exclusion, not a Movement or Advance-dice debuff. If recipient annotation is required: M |
| death-guard / Reverberating Summons (`datasheet-great-unclean-one:raw-dsAbility:1`) | Bearer; accepted weapon-owned supplemental rule. | Model destroyed by this weapon; chosen Plaguebearers within 12 inches; a destroyed model to return. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual one-model return after weapon trigger; not increased starting composition or free roster models. If recipient annotation is required: L |
| death-guard / Daemon Lord of Nurgle (Aura) (`datasheet-great-unclean-one:section:1#/blocks/0/text`) | Source Great Unclean One; candidate PLAGUE LEGIONS models/units. | Actual friendly unit within 6 inches of this source model. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual aura Toughness +1. A direct stat bonus is not roster-known while its range gate is unknown. If recipient annotation is required: M |
| death-guard / Nurgle’s Rot (Psychic) (`datasheet-great-unclean-one:section:1#/blocks/1/text`) | Source Great Unclean One. | Movement-phase end; selected enemy within 12 inches; rotted duration. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual selected-enemy Toughness penalty; source presence does not imply enemy is rotted. If recipient annotation is required: M |
| death-guard / Blessed Icon of Disease (`datasheet-icon-bearer:section:1#/blocks/1/text`) | Icon Bearer; candidate DEATH GUARD units. | Once-per-battle activation; chosen Battle-shocked unit; source-to-unit 12-inch range. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual removal of selected battlefield unit's Battle-shocked state; no proximity-free beneficiary guess. If recipient annotation is required: M |
| death-guard / Blight Bombardment (`datasheet-lord-of-virulence:section:1#/blocks/1/text`) | Source; friendly Death Guard models; Blast weapon traits. | Phase choice; enemy within 30 inches and visible; actual attack against it. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual Hit reroll tier; no BS change. Distinguish allied beneficiary models from selected enemy. If recipient annotation is required: L |
| death-guard / Pestilent Fallout (Psychic) (`datasheet-malignant-plaguecaster:section:1#/blocks/1/text`) | Source Plaguecaster; Plague Wind identity. | Enemy INFANTRY actually hit by that weapon; selected enemy; enfeebled duration. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual hit-qualified enemy Move reduction; no unconditional stored Movement change. If recipient annotation is required: M |
| death-guard / Putrescent Fog (Aura) (`datasheet-miasmic-malignifier:section:2#/blocks/0/text`) | Fortification source. | Actual Reinforcement setup and enemy position within 12 inches. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual enemy setup exclusion, not roster legality simulation or current stat change. If recipient annotation is required: M |
| death-guard / Diseased Cover (`datasheet-miasmic-malignifier:section:2#/blocks/1/text`) | Fortification source. | Incoming ranged attack allocation; physical visibility blocked specifically by this Fortification. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual qualified Cover; not a generic grant from roster membership. If recipient annotation is required: M |
| death-guard / Fortification (`datasheet-miasmic-malignifier:section:2#/blocks/2/text`) | Fortification source class; printed exceptions. | Enemy engaged only with qualifying Fortifications; attack/Pistol; Fall Back; Battle-shock; route over enemy models. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual attack/escape policy. Preserve both bullets and exceptions; terrain anchor is not a recipient. If recipient annotation is required: L |
| death-guard / Diseased Influence (`datasheet-mortarion:section:1#/blocks/0/text`) | Mortarion; candidate friendly Death Guard units. | Enemy move within 8 inches of a friendly unit; friendly unit within 6 inches of Mortarion; not engaged. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual reactive move; retain both range origins and event ordering, not a roster-wide move permission. If recipient annotation is required: L |
| death-guard / Boon of Death (`datasheet-mortarion:section:1#/blocks/1/text`) | Mortarion; candidate friendly units/models. | Fight-phase incoming melee target; range; source activation; model destroyed before fighting; D6. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual fight-after-destruction; do not invent unconditional Fights First or extra attacks. If recipient annotation is required: L |
| death-guard / Inflamed Reprisal (`datasheet-mortarion:section:1#/blocks/2/text`) | Mortarion; candidate friendly weapons/units. | Opponent shooting target; range; activation; completed enemy attacks; eligible retaliatory target. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual retaliatory shooting with attack-local BS penalty; not worse stored BS on all weapons. If recipient annotation is required: L |
| death-guard / Host of Plagues (`datasheet-mortarion:section:3#/blocks/1/text`) | Mortarion source. | Movement-phase end; actual enemies within 6 inches; Afflicted; per-enemy D6. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual radius mortal wounds; not damage or stat modification to source roster models. If recipient annotation is required: M |
| death-guard / Mischief Makers (`datasheet-nurglings:section:1#/blocks/0/text`) | Source Nurglings; enemy TITAN exclusion. | Enemy Engagement Range; Fight selection; melee attack; phase. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual enemy melee Hit penalty. No outgoing WS/BS substitution or friendly-unit grant. If recipient annotation is required: M |
| death-guard / Death’s Heads (`datasheet-plague-drones:section:1#/blocks/0/text`) | Source drones; candidate friendly PLAGUE LEGIONS units. | Enemy actually hit; selected mark; actual allied attacks; duration. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual rerolls against marked enemy, not a blanket roster reroll grant. If recipient annotation is required: L |
| death-guard / Spore-laced Shock Waves (`datasheet-plagueburst-crawler:section:1#/blocks/0/text`) | Source Crawler; mortar. | Actual mortar target; nearby enemy victims within 3 inches; Afflicted; dice; post-attack sequence. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual multi-target mortal wounds. Retain target-relative range origin and timing. If recipient annotation is required: L |
| death-guard / Virulent Blessing (Psychic) (`datasheet-rotigus:section:1#/blocks/0/text`) | Rotigus; candidate friendly PLAGUE LEGIONS models. | Fight-phase selected enemy; range/visibility; an attack allocated to that enemy. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual attack-local Damage +1; known weapon identity does not prove this conditional bonus active. If recipient annotation is required: L |
| death-guard / Deluge of Nurgle (Aura) (`datasheet-rotigus:section:1#/blocks/1/text`) | Rotigus; printed enemy stat directions. | Actual enemy unit within 6 inches; its model membership. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual enemy Move/OC penalties, not changes to Rotigus or friendly roster models. If recipient annotation is required: M |
| death-guard / Eater Plague (Psychic) (`datasheet-typhus:section:1#/blocks/1/text`) | Typhus; exact physical source formation. | Selected enemy range/visibility; Lone Operative/Attached exception; D6 branch deciding harm receiver. | Propose TEXT_ONLY_INTENDED, PENDING owner/Claude: Manual damage to actual source unit or enemy. Retain both harm paths and every target exception. If recipient annotation is required: L |

The accompanying `remaining-45-gaps.csv` gives all exact IDs, reasons, next steps, risks and current gate fingerprints. Independent source-review/quote verification was 45/45 on Git objects of the base; no source wording was corrected or invented.

## Final pre-FF, startup and preview

One authorized full run only: SHA `4d49446d8068e57cfa143a698886922a803a0690`; **PASS**; completed **188/188**, PASS **188**, FAIL **0**. Elapsed final record: **84.43 minutes**. Per-job times are in `timings.csv`; the new jobs currently contribute 23.75 seconds:

| New job | Status | Seconds |
| --- | --- | --- |
| tools/markup-census.mjs | PASS | 6.202 |
| tests/markup-census-qa.mjs | PASS | 7.152 |
| tests/markup-evidence-qa.mjs | PASS | 0.080 |
| books/death-guard/v2/insectile-recipient-qa.mjs | PASS | 0.342 |
| v2/markup-insectile-browser-qa.mjs | PASS | 9.969 |

### Test-only follow-up, under the explicitly permitted rule

After the full run, only tests/markup-census-qa.mjs changed. It preserves all exact initial counts on the immutable introducing decision ledger at 4d49446d8068e57cfa143a698886922a803a0690; HEAD is compared exactly against its current reviewed registry/native denominator, debt and partial markers. This prevents the new test from accidentally freezing future approved sources/closures. All 16 negative controls remain. The isolated amended test is PASS; no second full pre-FF was run. Application, registry, generated outputs and runtime bytes remain those of the full run.

`git diff --stat 4d49446d..9efbd95f`:

```text
tests/markup-census-qa.mjs | 30 ++++++++++++++++++++++++------
 1 file changed, 24 insertions(+), 6 deletions(-)
```

This additional file was introduced in this task; no old gameplay expectation is changed. The complete patch is included. Existing A/B and generated-scope evidence was captured on `4d49446d8068e57cfa143a698886922a803a0690`; the exact test-only diff establishes that its runtime inputs still describe the final feature. Packaging must match the full run's content/cache hashes before the preview switch.

No new application startup file is added. The runtime manifest, precache policy and startup graph file set are unchanged; census/evidence files are development-only and are not published in the site package. Packaging recalculates the ordinary cache revision for the changed lazy DG native artifact. No RAW Wahapedia, release candidate or owner roster export is included in this evidence publication.

Preview: {"status": "RUNNING", "pid": 15228, "sha": "9efbd95f67c5e65bc62b477e36acf9d710ff4784", "root": "E:\\Warhammer\\qa-tmp\\preview-v1\\package-markup-gate-9efbd95f", "started": "2026-11-19T23:06:18.09Z", "http": "http://localhost:8765/", "lan": "http://192.168.1.130:8765/", "https": "https://192.168.1.130:8443/", "stopFile": "E:\\Warhammer\\qa-tmp\\preview-v1\\STOP-markup-gate-9efbd95f", "cacheRevision": "383b7486b891ddd8", "servedContentSha256": "fb6edb6a22348aebacaa753d3cf3c2a52b888fc35b16ae5ad9acec8f40080ac9", "preffPassed": 188, "verification": [{"status": 200, "url": "http://localhost:8765/"}, {"status": 200, "url": "http://192.168.1.130:8765/"}]}. It is switched only after the final pre-FF PASS and byte-identical packaged-runtime verification. Existing TLS material and saved rosters are not modified by this task.

Evidence-only branch `codex/markup-gate-evidence` is not to be merged. Final remote SHAs and temporary-folder cleanup outcome are reported in the delivery message.
