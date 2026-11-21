# Core importer candidate review

Status: **PASS**. This report reviews an inactive candidate and never changes the active Core, reader, glossary or Army Books.

Baseline: `7b15dc36425ac577b6928837ec9983409972e278`. Active identities: 371; candidate identities: 385; old IDs preserved: true.

## Categories

| Category | Records |
|---|---:|
| unchanged | 332 |
| restored | 14 |
| sourcechanged | 5 |
| presentation | 20 |
| new | 14 |

## Raw capture footprint

| Page | Bytes | SHA-256 | Numbered units | FAQ | Errata |
|---|---:|---|---:|---:|---:|
| core | 783183 | 9343EDEA5BC2C536DA0E4CF19AACDCA875108B61D1D4BF30CA8D5A9F2AC9D695 | 185 | 73 | 7 |
| appendix | 361411 | 9DE62D73CA6CEEDA040B3F6CC0607CDDFCBCAFC3C760599C51F3214E9BC92BBF | 108 | 0 | 1 |

## New stable identities

- `core-faq-waha-067`
- `core-faq-waha-068`
- `core-faq-waha-069`
- `core-faq-waha-070`
- `core-faq-waha-071`
- `core-faq-waha-072`
- `core-faq-waha-073`
- `core-rule-01-02-12-replacing-one-model-with-another`
- `core-rule-01-04-06-drawing-a-line`
- `core-rule-25-04-01-select-detachments`
- `core-rule-25-04-02-select-units`
- `core-rule-25-04-03-attach-leaders-and-support-units`
- `core-rule-25-04-04-select-enhancements`
- `core-waha-errata-07-01`

## Addition attribution

Existing captured main-rule sentence additions: 262. Absent from the entire old accepted corpus and effective catalog: 165; of these, the unchanged old extractor also omits 155 on the same fresh HTML. Unresolved additions: 0.

| Evidence category | Sentence occurrences |
|---|---:|
| ACCEPTED_FORMATTER_REPRESENTATION | 3 |
| AUTHORIZED_SOURCE_WORDING_CHANGE | 8 |
| EXISTING_ACCEPTED_FACT_OR_REFERENCE | 97 |
| NEW_APPROVED_APPENDIX_TARGET_REFERENCE | 2 |
| OLD_EXTRACTOR_OMITS_THIS_FRESH_RAW_REGION | 152 |

The JSON contains every sentence, old global witnesses, exact legacy extraction boundary, fresh text DOM paths and source pins. Omitted-region evidence proves importer coverage, not historical webpage equality.

## Complete canonical record table

| ID | Title | Live effective chars | Candidate chars | Category |
|---|---|---:|---:|---|
| core-abilities | Abilities | 742 | 742 | unchanged |
| core-active-player | Active Player | 78 | 78 | unchanged |
| core-anti | [ANTI] | 537 | 537 | unchanged |
| core-assault | [ASSAULT] | 216 | 216 | unchanged |
| core-attached-unit | Attached Unit | 56 | 56 | unchanged |
| core-blast | [BLAST] | 721 | 721 | unchanged |
| core-bodyguard | Bodyguard | 500 | 500 | unchanged |
| core-cleave | [CLEAVE] | 601 | 601 | unchanged |
| core-close-quarters | [CLOSE-QUARTERS] | 473 | 473 | unchanged |
| core-critical-hit | Critical Hit | 28 | 28 | unchanged |
| core-critical-wound | Critical Wound | 30 | 30 | unchanged |
| core-damaged | DAMAGED | 153 | 153 | unchanged |
| core-deadly-demise | DEADLY DEMISE | 512 | 512 | unchanged |
| core-deep-strike | DEEP STRIKE | 407 | 407 | unchanged |
| core-destroyed | Destroyed | 979 | 979 | unchanged |
| core-devastating-wounds | [DEVASTATING WOUNDS] | 895 | 895 | unchanged |
| core-duplicated-abilities | Duplicated Abilities | 1240 | 1240 | unchanged |
| core-engagement-range | Engagement Range | 61 | 61 | unchanged |
| core-errata-01-02-03 | Update to Revived and Adding Models to a Unit | 179 | 179 | unchanged |
| core-errata-08-02-01 | Update to Command Points | 57 | 57 | unchanged |
| core-errata-15-05 | Grenades Stratagem | 0 | 62 | presentation |
| core-errata-15-06 | Tank Shock Stratagem | 0 | 70 | presentation |
| core-errata-17-03 | 17.03 - Change to First Sentence | 89 | 89 | unchanged |
| core-extra-attacks | [EXTRA ATTACKS] | 498 | 547 | presentation |
| core-faq-waha-001 | If a unit has a rule that allows it to start an action when it is battle-shocked can it also continue doing that action if it becomes battle-shocked after starting an action? | 3 | 3 | unchanged |
| core-faq-waha-002 | If a unit becomes battle-shocked after starting an action does it stop performing that action? | 3 | 3 | unchanged |
| core-faq-waha-003 | My unit has access to a rule that changes the Damage characteristic of an incoming attack to 0. When such an attack is allocated to a model in that unit, is the Damage changed before or after save rolls? | 6 | 6 | unchanged |
| core-faq-waha-004 | How do modifiers to the charge roll (or to the maximum distance of the charge move, such as Take to the Skies) affect the selection of charge targets? | 754 | 754 | unchanged |
| core-faq-waha-005 | My rule says that "this units ranged attacks have +1 A", do each of my attacks get an extra attack dice? | 73 | 73 | unchanged |
| core-faq-waha-006 | Do rules that affect a keyword include multi-word keywords that contain that keyword? For example, would rules that affect COMMISSAR units affect a unit that has the COMMISSAR GRAVES keyword? | 3 | 3 | unchanged |
| core-faq-waha-007 | The Munitorium Field Manual shows my unit can attach to different units then are on it's datasheet, which do I use? | 32 | 32 | unchanged |
| core-faq-waha-008 | Do models destroyed when a unit is out of coherency count for mission objectives? | 4 | 4 | unchanged |
| core-faq-waha-009 | When checking coherency for my unit can my unit be in multiple groups? | 116 | 116 | unchanged |
| core-faq-waha-010 | When a move says that a model or unit must move in a way if it is able, can that requirement force the unit to end their move not in coherency? | 106 | 106 | unchanged |
| core-faq-waha-011 | Does my model or unit become engaged while moving through a enemy units engagement range during a move? | 2 | 2 | unchanged |
| core-faq-waha-012 | When selecting a target unit can the enemy model that is visible to my model and the enemy model that is in range of my model's weapon be different enemy models in the same unit? | 3 | 3 | unchanged |
| core-faq-waha-013 | Can a model be within range of a weapon if it is not visible? | 3 | 3 | unchanged |
| core-faq-waha-014 | My rule says that "this units ranged attacks have +1 A", do each of my attacks get an extra attack dice? | 73 | 73 | unchanged |
| core-faq-waha-015 | When my unit shoots at another unit, how does it work if some models in the target unit are fully visible to some models in my unit, while others are within a terrain area/not fully visible? | 637 | 637 | unchanged |
| core-faq-waha-016 | If my unit has weapons that are identical in characteristics, but some of those weapons have [PRECISION] and those weapons targeted a unit without the CHARACTER keyword, do I roll all of those weapons together? | 156 | 156 | unchanged |
| core-faq-waha-017 | My attack has a rule that means it results in a critical hit on a hit roll of 4+. Does this work when snap shooting? | 86 | 86 | unchanged |
| core-faq-waha-018 | My attack has a rule that means it results in a critical hit on a hit roll of 4+, and I would otherwise need a 5+ to hit. Does a 4+ hit? | 89 | 89 | unchanged |
| core-faq-waha-019 | When declaring the allocation order of groups in my unit I have more than one non-CHARACTER groups that contain a model with a missing wound, how must I select the order? | 184 | 184 | unchanged |
| core-faq-waha-020 | I have a unit being attacked with weapons that will modify some of their save rolls to be worse then 6 should I make those save rolls? | 265 | 265 | unchanged |
| core-faq-waha-021 | Can I group or allocate a wound to a destroyed model? | 3 | 3 | unchanged |
| core-faq-waha-022 | Fight On Death (05.04.05) requires models awaiting such an ability to stay on the battlefield until their unit has attacked (or until the end of the phase). How do these models function while this is the case? | 520 | 520 | unchanged |
| core-faq-waha-023 | In what step during the attack sequence do I roll for Feel No Pain? | 62 | 62 | unchanged |
| core-faq-waha-024 | When checking line of sight from one model to another, is this drawn between the bases of those models, or between any part of them? | 100 | 100 | unchanged |
| core-faq-waha-025 | I have a rule that triggers when a mortal wound is allocated to a model, when does this happen? | 74 | 74 | unchanged |
| core-faq-waha-026 | I failed hazard rolls from [Hazardous] weapons, do those mortal wounds have to be allocated to the models with the [HAZARDOUS] weapons? | 249 | 249 | unchanged |
| core-faq-waha-027 | If a rule says my unit must make a hazard roll does every model in the unit make a hazard roll? | 45 | 45 | unchanged |
| core-faq-waha-028 | Can I select a unit to shoot or fight if it doesn't have melee or ranged weapons? | 80 | 80 | unchanged |
| core-faq-waha-029 | When a rule instructs you to perform a charge outside of the charge phase, do I resolve step 2 and 3 of the Charge step (11.02)? | 3 | 3 | unchanged |
| core-faq-waha-030 | If a rule modifies how far a unit or model can move during a pile-in move or consolidation move does it also change the distance of the target units? | 2 | 2 | unchanged |
| core-faq-waha-031 | If a rule allows my unit to pile-in or consolidate an extra distance in the Fight phase, when can I use that rule? | 136 | 136 | unchanged |
| core-faq-waha-032 | If I have a rule that says my unit can move up to 6" when it makes a pile-in move or consolidation move, does this also mean it changes the maximum distance of those moves to 6"? | 3 | 3 | unchanged |
| core-faq-waha-033 | Can I select a unit to shoot or fight if it doesn't have melee or ranged weapons? | 80 | 80 | unchanged |
| core-faq-waha-034 | Are models that are within the boundary of a terrain area, but not on the ground floor of a terrain area (e.g. overhanging parts of FRAME VEHICLES or models on terrain features that are within that terrain area) within that terrain area? | 3 | 3 | unchanged |
| core-faq-waha-035 | When my unit shoots at another unit, how does it work if some models in the target unit are fully visible to some models in my unit, while others are within a terrain area/not fully visible? | 637 | 637 | unchanged |
| core-faq-waha-036 | If a rule refers to an 'objective marker', does this mean an 'objective'? | 41 | 41 | unchanged |
| core-faq-waha-037 | Are models that are within the boundary of a terrain area, but not on the ground floor of a terrain area (e.g. overhanging parts of FRAME VEHICLES or models on terrain features that are within that terrain area) within that terrain area? | 3 | 3 | unchanged |
| core-faq-waha-038 | Is being within range of a terrain objective the same as being within range of an objective marker? | 4 | 4 | unchanged |
| core-faq-waha-039 | If my unit has taken control of an objective at the end of my movement phase and that unit has as an ability that secures an objective they control, can they secure that objective? | 3 | 3 | unchanged |
| core-faq-waha-040 | Can I use the Insane Bravery stratagem on a battle-shocked unit? | 83 | 83 | unchanged |
| core-faq-waha-041 | After using an ability that increases the CP cost of a stratagem, must my opponent continue to use the selected stratagem at the increased cost if they have the necessary CP available? | 4 | 4 | unchanged |
| core-faq-waha-042 | After using an ability that increases the CP cost of a stratagem, if my opponent does not have the necessary CP available for the selected stratagem, what happens? | 127 | 127 | unchanged |
| core-faq-waha-043 | If a stratagem contains a section that carries an additional CP cost (such as the Into the Fray option of Heroic Intervention), is that additional cost considered to be a modifier? | 105 | 105 | unchanged |
| core-faq-waha-044 | If a unit has a rule that allows it to start an action when it is battle-shocked can it also continue doing that action if it becomes battle-shocked after starting an action? | 3 | 3 | unchanged |
| core-faq-waha-045 | If a unit becomes battle-shocked after starting an action does it stop performing that action? | 3 | 3 | unchanged |
| core-faq-waha-046 | While making a move type other than a normal/advance move, can my MONSTER/VEHICLE unit move through friendly units? | 4 | 4 | unchanged |
| core-faq-waha-047 | Are models that are within the boundary of a terrain area, but not on the ground floor of a terrain area (e.g. overhanging parts of FRAME VEHICLES or models on terrain features that are within that terrain area) within that terrain area? | 3 | 3 | unchanged |
| core-faq-waha-048 | Do a unit's abilities continue to function while they are embarked within a TRANSPORT? | 671 | 671 | unchanged |
| core-faq-waha-049 | If a rule says a unit can embark into a TRANSPORT in a turn that unit disembarked, does this ignore the core rules restriction on embarking in a turn that unit made a set up move (see 18.02)? | 3 | 3 | unchanged |
| core-faq-waha-050 | If a unit makes any disembark move in a turn (i.e. Disembark move, Emergency Disembark move etc.) has it disembarked that turn? | 4 | 4 | unchanged |
| core-faq-waha-051 | The Munitorium Field Manual shows my unit can attach to different units then are on it's datasheet, which do I use? | 32 | 32 | unchanged |
| core-faq-waha-052 | Units have all the keywords of all their models, and attached units have all the keywords of all of their component units. How are destroyed models taken into account for these purposes? | 362 | 362 | unchanged |
| core-faq-waha-053 | If I place units in strategic reserves during the battle, can this exceed the 50% of my points limit for the battle restriction as mentioned in Placing Units in Strategic Reserves (20.01)? | 93 | 93 | unchanged |
| core-faq-waha-054 | Does the limit to the combined points value of my units in strategic reserves only apply until the start of the first battle round? | 4 | 4 | unchanged |
| core-faq-waha-055 | When do the effects of a FLYING unit taking to the skies apply? | 220 | 220 | unchanged |
| core-faq-waha-056 | What does the X" in Lone Operative X" mean? | 154 | 154 | unchanged |
| core-faq-waha-057 | I failed hazard rolls from [Hazardous] weapons, do those mortal wounds have to be allocated to the models with the [HAZARDOUS] weapons? | 248 | 248 | unchanged |
| core-faq-waha-058 | If both players have units with the Scouts ability, do they alternate resolving scout moves? | 140 | 140 | unchanged |
| core-faq-waha-059 | In what step during the attack sequence do I roll for Feel No Pain? | 62 | 62 | unchanged |
| core-faq-waha-060 | If my unit has the Deadly Demise ability and has an ability that allows it to Fight on Death, how do I resolve this? | 232 | 232 | unchanged |
| core-faq-waha-061 | If the [ANTI] ability on my unit is ANTI-NON-MONSTER/VEHICLE does it mean the [ANTI] rule triggers when targeting units that do not have the MONSTER or VEHICLE keyword? | 94 | 94 | unchanged |
| core-faq-waha-062 | Does vertical movement in a unit that has taken to the skies count towards the distance a model has used for the purposes of [Heavy]? | 3 | 3 | unchanged |
| core-faq-waha-063 | Can an attached unit be given an Upgrade? | 4 | 4 | unchanged |
| core-faq-waha-064 | Can a unit have both an Upgrade and an enhancement? | 84 | 84 | unchanged |
| core-faq-waha-065 | Are Upgrades enhancements? | 80 | 80 | unchanged |
| core-faq-waha-066 | Can an EPIC HERO unit form an attached unit with a unit that has an enhancement? | 4 | 4 | unchanged |
| core-faq-waha-067 | If a rule's effect lasts until the end of a specific part of the battle (e.g. until the end of the phase, until the end of the turn), is that rule still in effect at the end of that part of the battle? | — | 196 | new |
| core-faq-waha-068 | When a model overhangs the edge of the battlefield, how does that affect its visibility? | — | 200 | new |
| core-faq-waha-069 | When determining control over an objective, can the same model's OC count towards more than one objective that model is within range of? | — | 4 | new |
| core-faq-waha-070 | Can a unit be controlling more than one objective at once? | — | 4 | new |
| core-faq-waha-071 | Can a unit that used the rapid disembark mode this turn (e.g. using a Trukk's Pilin' Out ability) be targeted with the Heroic Intervention stratagem? | — | 3 | new |
| core-faq-waha-072 | When does a model's or unit's ability in an attached unit apply to all models in that unit? | — | 306 | new |
| core-faq-waha-073 | When a unit with Firing Deck is equipped with another unit's weapons, do abilities that affect those weapons while they are equipped by that other unit affect those weapons while they are equipped by the unit with Firing Deck? | — | 371 | new |
| core-feel-no-pain | FEEL NO PAIN | 254 | 254 | unchanged |
| core-fights-first | FIGHTS FIRST | 235 | 235 | unchanged |
| core-firing-deck | FIRING DECK | 775 | 775 | unchanged |
| core-hazardous | [HAZARDOUS] | 374 | 374 | unchanged |
| core-heavy | [HEAVY] | 397 | 397 | unchanged |
| core-hover | HOVER | 267 | 267 | unchanged |
| core-ignores-cover | [IGNORES COVER] | 296 | 296 | unchanged |
| core-indirect-fire | [INDIRECT FIRE] | 220 | 220 | unchanged |
| core-infiltrators | INFILTRATORS | 301 | 301 | unchanged |
| core-lance | [LANCE] | 220 | 220 | unchanged |
| core-leader | LEADER | 410 | 485 | presentation |
| core-lethal-hits | [LETHAL HITS] | 497 | 497 | unchanged |
| core-lone-operative | LONE OPERATIVE | 577 | 631 | presentation |
| core-melta | [MELTA] | 545 | 545 | unchanged |
| core-objective-control | Objective Control | 74 | 74 | unchanged |
| core-one-shot | [ONE SHOT] | 498 | 546 | presentation |
| core-pistol | [PISTOL] | 393 | 393 | unchanged |
| core-precision | [PRECISION] | 557 | 557 | unchanged |
| core-psychic | [PSYCHIC] | 371 | 371 | unchanged |
| core-rapid-fire | [RAPID FIRE] | 531 | 531 | unchanged |
| core-reinforcements-step | Reinforcements Step | 92 | 92 | unchanged |
| core-rule-01-01-01-you | You | 88 | 88 | unchanged |
| core-rule-01-01-armies | Armies | 283 | 283 | unchanged |
| core-rule-01-02-01-starting-strength-and-half-strength | Starting Strength and Half-Strength | 1612 | 1612 | unchanged |
| core-rule-01-02-02-persisting-rules-effects | Persisting Rules Effects | 904 | 904 | unchanged |
| core-rule-01-02-03-revived-and-adding-models-to-a-unit | Revived and Adding Models to a Unit | 1260 | 1260 | unchanged |
| core-rule-01-02-04-not-on-the-battlefield | Not On The Battlefield | 982 | 982 | unchanged |
| core-rule-01-02-05-other-model-unit | Other Model / Unit | 255 | 255 | unchanged |
| core-rule-01-02-06-splitting-units | Splitting Units | 844 | 844 | unchanged |
| core-rule-01-02-07-describing-units | Describing Units | 584 | 584 | unchanged |
| core-rule-01-02-08-a-unit-model-object | A (Unit/Model/Object) | 330 | 330 | unchanged |
| core-rule-01-02-09-tokens | Tokens | 426 | 426 | unchanged |
| core-rule-01-02-10-adding-a-new-unit-to-your-army | Adding a new unit to your army | 194 | 194 | unchanged |
| core-rule-01-02-11-all-types-of-model | All Types of Model | 136 | 136 | unchanged |
| core-rule-01-02-12-replacing-one-model-with-another | Replacing One Model with Another | — | 608 | new |
| core-rule-01-02-units-and-models | Units and Models | 1021 | 1065 | presentation |
| core-rule-01-03-01-players-rules | Player’s Rules | 807 | 807 | unchanged |
| core-rule-01-03-02-rules-sequencing | Rules Sequencing | 1160 | 1160 | unchanged |
| core-rule-01-03-active-player-and-opposing-player | Active Player and Opposing Player | 881 | 881 | unchanged |
| core-rule-01-04-01-within-wholly-within | Within / Wholly Within | 1153 | 1153 | unchanged |
| core-rule-01-04-02-closest-or-nearest-model-unit | Closest Or Nearest Model/Unit | 285 | 285 | unchanged |
| core-rule-01-04-03-as-close-as-possible | As Close As Possible | 1004 | 1004 | unchanged |
| core-rule-01-04-04-base-contact-or-base-to-base-contact | Base Contact or Base to Base Contact | 722 | 722 | unchanged |
| core-rule-01-04-05-table-quarters | Table Quarters | 254 | 254 | unchanged |
| core-rule-01-04-06-drawing-a-line | Drawing a Line | — | 122 | new |
| core-rule-01-04-measuring-distances | Measuring Distances | 467 | 493 | presentation |
| core-rule-01-05-01-automatically-successful-passes-hits-wounds | Automatically Successful/Passes/Hits/Wounds | 604 | 604 | unchanged |
| core-rule-01-05-02-re-rolls | Re-rolls | 606 | 606 | unchanged |
| core-rule-01-05-03-modifying-dice-rolls | Modifying Dice Rolls | 25 | 25 | unchanged |
| core-rule-01-05-04-ignoring-roll-modifiers | Ignoring Roll Modifiers | 31 | 31 | unchanged |
| core-rule-01-05-05-roll-off | Roll Off | 181 | 181 | unchanged |
| core-rule-01-05-06-doubles-or-triples | Doubles Or Triples | 162 | 162 | unchanged |
| core-rule-01-05-07-highest-or-lowest-dice-result | Highest or Lowest Dice Result | 488 | 488 | unchanged |
| core-rule-01-05-08-treated-as-set-to-dice-roll | Treated As, Set To (Dice Roll) | 228 | 228 | unchanged |
| core-rule-01-05-dice | Dice | 902 | 902 | unchanged |
| core-rule-01-06-01-leadership-test | Leadership Test | 81 | 81 | unchanged |
| core-rule-01-06-leadership-rolls | Leadership Rolls | 333 | 333 | unchanged |
| core-rule-01-07-01-battlefield-morale | Battlefield Morale | 400 | 400 | unchanged |
| core-rule-01-07-02-battle-shock-test | Battle-shock Test | 60 | 60 | unchanged |
| core-rule-01-07-battle-shock-rolls | Battle-shock Rolls | 608 | 608 | unchanged |
| core-rule-02-01-01-datasheet-name-and-keywords | Datasheet Name and Keywords | 133 | 133 | unchanged |
| core-rule-02-01-datasheet-name | 1. Datasheet Name | 88 | 88 | unchanged |
| core-rule-02-02-01-modifiers | Modifiers | 2883 | 4710 | restored / EXACT_ACCEPTED_FORMATTER_PAIRINGS |
| core-rule-02-02-02-ignore-modifiers | Ignore Modifiers | 978 | 978 | unchanged |
| core-rule-02-02-03-random-characteristics | Random Characteristics | 1197 | 1197 | unchanged |
| core-rule-02-02-04-healing-or-regaining-lost-wounds | Healing Or Regaining Lost Wounds | 845 | 845 | unchanged |
| core-rule-02-02-05-full-wounds-remaining | Full Wounds Remaining | 108 | 108 | unchanged |
| core-rule-02-02-06-characteristic-modifiers-modified-characteristics | Characteristic Modifiers & Modified Characteristics | 25 | 25 | unchanged |
| core-rule-02-02-profiles | 2. Profiles | 1440 | 1440 | unchanged |
| core-rule-02-03-01-rules-with-multiple-conditions-and-effects | Rules With Multiple Conditions And Effects | 671 | 671 | unchanged |
| core-rule-02-03-abilities | 3. Abilities | 251 | 251 | unchanged |
| core-rule-02-04-01-weapons-with-no-strength | Weapons With No Strength | 165 | 165 | unchanged |
| core-rule-02-04-weapons | 4. Weapons | 860 | 860 | unchanged |
| core-rule-02-05-01-using-keywords-mixed-keywords-in-units | Using Keywords & Mixed Keywords in Units | 1711 | 1711 | unchanged |
| core-rule-02-05-keywords | 5. Keywords | 573 | 573 | unchanged |
| core-rule-02-06-01-bearer | Bearer | 85 | 85 | unchanged |
| core-rule-02-06-02-units-equipment | Unit's Equipment | 106 | 106 | unchanged |
| core-rule-02-06-unit-composition-and-other-rules | 6. Unit Composition and Other Rules | 324 | 324 | unchanged |
| core-rule-02-07-wargear-options | 7. Wargear Options | 172 | 172 | unchanged |
| core-rule-03-01-01-different-move-characteristics | Different Move Characteristics | 547 | 547 | unchanged |
| core-rule-03-01-02-moving-over-or-through-models | Moving Over Or Through Models | 303 | 303 | unchanged |
| core-rule-03-01-03-random-movement | Random Movement | 37 | 37 | unchanged |
| core-rule-03-01-04-when-moving-up-to | When Moving Up To | 125 | 125 | unchanged |
| core-rule-03-01-moving-units | Moving Units | 812 | 3012 | restored |
| core-rule-03-02-01-if-you-cannot-set-up-a-unit | If You Cannot Set Up a Unit | 327 | 327 | unchanged |
| core-rule-03-02-02-setting-up-large-models | Setting Up Large Models | 1921 | 1921 | unchanged |
| core-rule-03-02-03-redeployments | Redeployments | 277 | 277 | unchanged |
| core-rule-03-02-set-up | Set Up | 723 | 723 | unchanged |
| core-rule-03-03-01-what-is-coherency | What Is Coherency | 183 | 183 | unchanged |
| core-rule-03-03-coherency | Coherency | 884 | 884 | unchanged |
| core-rule-03-04-01-what-is-engagement | What Is Engagement | 199 | 199 | unchanged |
| core-rule-03-04-engagement | Engagement | 454 | 454 | unchanged |
| core-rule-04-01-01-models-without-ranged-melee-weapons | Models Without Ranged/Melee Weapons | 149 | 149 | unchanged |
| core-rule-04-01-02-sidearms | Sidearms | 223 | 223 | unchanged |
| core-rule-04-01-03-multiple-weapon-profiles | Multiple Weapon Profiles | 475 | 475 | unchanged |
| core-rule-04-01-04-attack-characteristics-and-abilities | Attack Characteristics and Abilities | 431 | 431 | unchanged |
| core-rule-04-01-05-selected-to-attack | Selected to Attack | 153 | 153 | unchanged |
| core-rule-04-01-select-weapons | 1. Select Weapons | 561 | 561 | unchanged |
| core-rule-04-02-01-selecting-targets | Selecting Targets | 239 | 239 | unchanged |
| core-rule-04-02-02-against-an-attack | Against An Attack | 375 | 375 | unchanged |
| core-rule-04-02-03-single-target | Single Target | 207 | 207 | unchanged |
| core-rule-04-02-select-targets | 2. Select Targets | 612 | 612 | unchanged |
| core-rule-04-03-01-identical-attacks | Identical Attacks | 149 | 149 | unchanged |
| core-rule-04-03-02-splitting-melee-attacks | Splitting Melee Attacks | 523 | 523 | unchanged |
| core-rule-04-03-03-target-no-longer-eligible-or-viable | Target No Longer Eligible Or Viable | 255 | 255 | unchanged |
| core-rule-04-03-04-shot | Shot | 369 | 369 | unchanged |
| core-rule-04-03-05-fought | Fought | 385 | 385 | unchanged |
| core-rule-04-03-06-finished-making-its-attacks | Finished Making Its Attacks | 123 | 123 | unchanged |
| core-rule-04-03-resolve-attacks | 3. Resolve Attacks | 1585 | 1585 | unchanged |
| core-rule-05-01-01-critical-hits-and-critical-wounds | Critical Hits and Critical Wounds | 201 | 201 | unchanged |
| core-rule-05-01-hit-rolls | 1. Hit Roll | 419 | 419 | unchanged |
| core-rule-05-02-01-multiple-toughness-characteristics | Multiple Toughness Characteristics | 395 | 395 | unchanged |
| core-rule-05-02-wound-rolls | 2. Wound Roll | 791 | 791 | unchanged |
| core-rule-05-03-01-saving-throw | Saving Throw | 49 | 49 | unchanged |
| core-rule-05-03-02-attacks-modified-during-hit-and-wound-rolls | Attacks Modified during Hit and Wound rolls | 455 | 455 | unchanged |
| core-rule-05-03-save-rolls | 3. Save Rolls | 896 | 896 | unchanged |
| core-rule-05-04-01-current-allocation-group | Current Allocation Group | 186 | 186 | unchanged |
| core-rule-05-04-02-modifying-damage | Modifying Damage | 25 | 25 | unchanged |
| core-rule-05-04-03-suffers-damage | Suffers Damage | 565 | 565 | unchanged |
| core-rule-05-04-05-fight-on-death | Fight On Death | 771 | 771 | unchanged |
| core-rule-05-04-06-measuring-to-a-destroyed-model-or-unit | Measuring To A Destroyed Model Or Unit | 386 | 386 | unchanged |
| core-rule-05-04-inflict-damage | 4. Inflict Damage | 1302 | 1302 | unchanged |
| core-rule-06-01-01-describing-visible-units | Describing Visible Units | 336 | 336 | unchanged |
| core-rule-06-01-visibility | Visibility | 1194 | 1194 | unchanged |
| core-rule-06-02-01-normal-damage | Normal Damage | 241 | 241 | unchanged |
| core-rule-06-02-mortal-wounds | Mortal Wounds | 1123 | 1123 | unchanged |
| core-rule-06-03-01-hazardous-test | Hazardous Test | 53 | 53 | unchanged |
| core-rule-06-03-hazard-rolls | Hazard Rolls | 285 | 285 | unchanged |
| core-rule-07-01-start-of-battle-round | 1. Start of Battle Round | 144 | 317 | sourcechanged |
| core-rule-07-02-01-out-of-phase-rules | Out Of Phase Rules | 589 | 589 | unchanged |
| core-rule-07-02-02-battle-round-turn-phase-definitions | Battle Round/Turn/Phase Definitions | 534 | 534 | unchanged |
| core-rule-07-02-player-turns | 2. Player Turns | 480 | 480 | unchanged |
| core-rule-07-03-end-of-battle-round | 3. End of Battle Round | 516 | 1314 | restored |
| core-rule-08-01-start-of-command-phase | 1. Start of Command Phase | 76 | 76 | unchanged |
| core-rule-08-02-01-command-points | Command Points | 359 | 359 | unchanged |
| core-rule-08-02-gain-core-cp | 2. Gain Core CP | 75 | 75 | unchanged |
| core-rule-08-03-01-multiple-battle-shock-rolls | Multiple Battle-shock Rolls | 390 | 390 | unchanged |
| core-rule-08-03-battle-shock | 3. Battle-shock Step | 560 | 560 | unchanged |
| core-rule-08-04-command-abilities | 4. Command Abilities | 182 | 182 | unchanged |
| core-rule-08-05-end-of-command-phase | 5. End of Command Phase | 1033 | 1033 | unchanged |
| core-rule-09-01-start-of-movement-phase | 1. Start of Movement Phase | 77 | 77 | unchanged |
| core-rule-09-02-01-selecting-units-to-move | Selecting Units To Move | 395 | 395 | unchanged |
| core-rule-09-02-02-selecting-modes | Selecting Modes | 662 | 662 | unchanged |
| core-rule-09-02-move-units | 2. Move Units Step | 937 | 937 | unchanged |
| core-rule-09-03-end-of-movement-phase | 3. End of Movement Phase | 75 | 75 | unchanged |
| core-rule-09-04-remain-stationary | REMAIN STATIONARY | 219 | 219 | unchanged |
| core-rule-09-05-01-more-than-one-normal-move-in-a-phase | More Than One Normal Move in a Phase | 56 | 56 | unchanged |
| core-rule-09-05-normal-move | NORMAL MOVE | 203 | 203 | unchanged |
| core-rule-09-06-advance-move | ADVANCE MOVE | 395 | 395 | unchanged |
| core-rule-09-07-01-desperate-escape | Desperate Escape | 174 | 174 | unchanged |
| core-rule-09-07-01-desperate-escape-test | Desperate Escape Test | 557 | 984 | sourcechanged |
| core-rule-09-07-fall-back-move | FALL-BACK MOVE | 747 | 747 | unchanged |
| core-rule-10-01-start-of-shooting-phase | 1. Start of Shooting Phase | 77 | 77 | unchanged |
| core-rule-10-02-shoot | 2. Shoot | 813 | 813 | unchanged |
| core-rule-10-03-end-of-shooting-phase | 3. End of Shooting Phase | 75 | 75 | unchanged |
| core-rule-10-04-normal-shooting | NORMAL SHOOTING | 231 | 231 | unchanged |
| core-rule-10-05-assault-shooting | ASSAULT SHOOTING | 366 | 366 | unchanged |
| core-rule-10-06-close-quarters-shooting | CLOSE-QUARTERS SHOOTING | 929 | 929 | unchanged |
| core-rule-10-07-indirect-shooting | INDIRECT SHOOTING | 1008 | 1008 | unchanged |
| core-rule-11-01-start-of-charge-phase | 1. Start of Charge Phase | 75 | 75 | unchanged |
| core-rule-11-02-01-failed-charges | Failed Charges | 302 | 302 | unchanged |
| core-rule-11-02-charge | 2. Charge Step | 1089 | 1089 | unchanged |
| core-rule-11-03-end-of-charge-phase | 3. End of Charge Phase | 73 | 73 | unchanged |
| core-rule-11-04-charge-move | CHARGE MOVE | 845 | 1520 | restored |
| core-rule-12-01-start-of-fight-phase | 1. Start of Fight Phase | 225 | 225 | unchanged |
| core-rule-12-02-pile-in | 2. Pile In | 336 | 336 | unchanged |
| core-rule-12-03-pile-in-move | PILE-IN MOVE | 807 | 1281 | restored |
| core-rule-12-04-01-eligible-to-fight-but-unable-to-fight | Eligible to fight, but unable to fight | 766 | 766 | unchanged |
| core-rule-12-04-fight | 3. Fight Step | 1439 | 1653 | restored |
| core-rule-12-05-normal-fight | NORMAL FIGHT | 96 | 96 | unchanged |
| core-rule-12-06-overrun-fight | OVERRUN FIGHT | 487 | 1247 | restored |
| core-rule-12-07-consolidate | 4. Consolidate | 677 | 348 | presentation / EXPLICIT_SAME_SECTION_OWNERSHIP_REDISTRIBUTION |
| core-rule-12-08-consolidation-move | CONSOLIDATION MOVE | 1964 | 2302 | presentation |
| core-rule-12-09-end-of-fight-phase | 5. End of Fight Phase | 479 | 479 | unchanged |
| core-rule-13-01-placing-terrain | Placing Terrain | 742 | 742 | unchanged |
| core-rule-13-02-01-creating-your-own-battlefield | Creating Your Own Battlefield | 680 | 680 | unchanged |
| core-rule-13-02-terrain-categories | Terrain Categories | 242 | 242 | unchanged |
| core-rule-13-03-exposed | Exposed | 162 | 162 | unchanged |
| core-rule-13-04-light | Light | 160 | 160 | unchanged |
| core-rule-13-05-dense | Dense | 441 | 962 | restored |
| core-rule-13-06-01-solid-terrain-and-movement | Solid Terrain and Movement | 404 | 404 | unchanged |
| core-rule-13-06-terrain-and-movement | Terrain and Movement | 864 | 3023 | restored |
| core-rule-13-07-terrain-and-visibility | Terrain and Visibility | 113 | 113 | unchanged |
| core-rule-13-08-benefit-of-cover | Benefit of Cover | 559 | 559 | unchanged |
| core-rule-13-09-01-hidden-and-the-first-turn | Hidden and the First Turn | 232 | 232 | unchanged |
| core-rule-13-09-hidden | Hidden | 654 | 654 | unchanged |
| core-rule-13-10-obscuring | Obscuring | 318 | 318 | unchanged |
| core-rule-13-11-01-gone-to-ground | Gone to Ground | 669 | 2061 | restored |
| core-rule-13-11-solid | Solid | 547 | 547 | unchanged |
| core-rule-14-01-01-objectives-not-within-a-terrain-area | Objectives Not Within A Terrain Area | 553 | 553 | unchanged |
| core-rule-14-01-terrain-objectives | Terrain Objectives | 433 | 433 | unchanged |
| core-rule-14-02-01-controlling-an-objective-at-the-end-of-a-phase | Controlling an Objective at the End of a Phase | 203 | 203 | unchanged |
| core-rule-14-02-level-of-control | Level of Control | 1172 | 1172 | unchanged |
| core-rule-14-03-secured-objectives | Secured Objectives | 324 | 967 | restored |
| core-rule-15-01-01-modifying-cp-cost | Modifying CP Cost | 340 | 340 | unchanged |
| core-rule-15-01-02-affected-by-a-stratagem | Affected By A Stratagem | 96 | 96 | unchanged |
| core-rule-15-01-03-stratagem-definitions | Stratagem Definitions | 431 | 431 | unchanged |
| core-rule-15-01-using-stratagems | Using Stratagems | 1437 | 1661 | restored |
| core-rule-15-02-command-re-roll | COMMAND RE-ROLL | 585 | 585 | unchanged |
| core-rule-15-03-epic-challenge | EPIC CHALLENGE | 350 | 350 | unchanged |
| core-rule-15-04-insane-bravery | INSANE BRAVERY | 380 | 380 | unchanged |
| core-rule-15-05-explosives | EXPLOSIVES | 516 | 516 | unchanged |
| core-rule-15-06-crushing-impact | CRUSHING IMPACT | 701 | 701 | unchanged |
| core-rule-15-07-rapid-ingress | RAPID INGRESS | 407 | 407 | unchanged |
| core-rule-15-09-snap-shooting | SNAP SHOOTING | 504 | 538 | sourcechanged |
| core-rule-15-10-smokescreen | SMOKESCREEN | 453 | 453 | unchanged |
| core-rule-15-11-heroic-intervention | HEROIC INTERVENTION | 848 | 848 | unchanged |
| core-rule-15-12-counteroffensive | COUNTEROFFENSIVE | 404 | 404 | unchanged |
| core-rule-16-01-performing-actions | Performing Actions | 528 | 1369 | restored |
| core-rule-17-01-moving-monsters-and-vehicles | Moving Monsters and Vehicles | 181 | 181 | unchanged |
| core-rule-17-02-frame | Frame | 584 | 584 | unchanged |
| core-rule-17-03-01-shooting-while-engaged-with-monsters-vehicles | Shooting While Engaged With Monsters/Vehicles | 262 | 262 | unchanged |
| core-rule-17-03-shooting-at-engaged-monsters-and-vehicles | Shooting at Engaged Monsters and Vehicles | 557 | 557 | unchanged |
| core-rule-18-01-transport-capacity | Transport Capacity | 759 | 759 | unchanged |
| core-rule-18-02-01-able-to-embark | Able To Embark | 277 | 277 | unchanged |
| core-rule-18-02-embarking | Embarking | 720 | 720 | unchanged |
| core-rule-18-03-disembarking | Disembarking | 441 | 441 | unchanged |
| core-rule-18-04-01-rapid-disembark-and-limitations | Rapid Disembark And Limitations | 335 | 335 | unchanged |
| core-rule-18-04-disembark-move | DISEMBARK MOVE | 1846 | 1846 | unchanged |
| core-rule-18-05-emergency-disembark-move | EMERGENCY DISEMBARK MOVE | 733 | 737 | presentation / EXACT_ACCEPTED_FORMATTER_PAIRINGS |
| core-rule-18-06-assault-disembark-move | ASSAULT DISEMBARK MOVE | 330 | 330 | unchanged |
| core-rule-18-07-shock-disembark-move | SHOCK DISEMBARK MOVE | 616 | 350 | sourcechanged |
| core-rule-19-01-01-attached-units-after-their-bodyguard-unit-is-destroyed | Attached Units After Their Bodyguard Unit is Destroyed | 363 | 364 | presentation / PRESENTATION_WITH_IDENTICAL_WORD_NUMBER_OPERATOR_SEQUENCE |
| core-rule-19-01-forming-attached-units | Forming Attached Units | 500 | 425 | presentation / EXPLICIT_SAME_SECTION_OWNERSHIP_REDISTRIBUTION |
| core-rule-19-02-attacking-attached-units | Attacking Attached Units | 565 | 565 | unchanged |
| core-rule-19-03-keywords-in-attached-units | Keywords in Attached Units | 757 | 757 | unchanged |
| core-rule-19-04-01-only-in-death-does-duty-end | Only In Death Does Duty End | 465 | 465 | unchanged |
| core-rule-19-04-abilities-in-attached-units | Abilities in Attached Units | 1180 | 1180 | unchanged |
| core-rule-20-01-01-reserves | Reserves | 54 | 54 | unchanged |
| core-rule-20-01-02-strategic-reserves-at-the-end-of-the-battle | Strategic Reserves at the End of the Battle | 140 | 140 | unchanged |
| core-rule-20-01-placing-units-in-strategic-reserves | Placing Units in Strategic Reserves | 601 | 601 | unchanged |
| core-rule-20-02-repositioned-units | Repositioned Units | 1163 | 1163 | unchanged |
| core-rule-20-03-01-set-up-as-reinforcements | Set Up As Reinforcements | 119 | 119 | unchanged |
| core-rule-20-03-advanced-arriving-from-strategic-reserves | Arriving from Strategic Reserves | 632 | 180 | presentation / EXPLICIT_SAME_SECTION_OWNERSHIP_REDISTRIBUTION |
| core-rule-20-04-ingress-move | INGRESS MOVE | 693 | 1145 | presentation |
| core-rule-21-01-surge-moves | Surge Moves | 1021 | 65 | presentation / EXPLICIT_SAME_SECTION_OWNERSHIP_REDISTRIBUTION |
| core-rule-21-02-surge-move | SURGE MOVE | 743 | 1221 | sourcechanged |
| core-rule-21-03-flying-models | Flying Models | 721 | 1199 | presentation |
| core-rule-22-01-aura-abilities | Aura Abilities | 410 | 410 | unchanged |
| core-rule-22-02-faction-abilities | Faction Abilities | 378 | 378 | unchanged |
| core-rule-22-03-01-psychic-abilities-with-a-psychic-level | Psychic Abilities with a Psychic Level | 126 | 126 | unchanged |
| core-rule-22-03-psychic-abilities | Psychic Abilities | 312 | 312 | unchanged |
| core-rule-22-04-wargear-abilities | Wargear Abilities | 459 | 459 | unchanged |
| core-rule-22-05-plunging-fire | Plunging Fire | 386 | 833 | restored |
| core-rule-23-01-deployment | Deployment | 105 | 105 | unchanged |
| core-rule-23-02-movement | Movement | 701 | 701 | unchanged |
| core-rule-23-03-shooting | Shooting | 96 | 96 | unchanged |
| core-rule-23-04-charging-and-fighting | Charging and Fighting | 252 | 252 | unchanged |
| core-rule-24-01-01-with-the-x-ability | With The 'X' Ability | 394 | 394 | unchanged |
| core-rule-24-11-01-only-extra-attacks-weapons | Only [EXTRA ATTACKS] weapons | 170 | 170 | unchanged |
| core-rule-24-24-01-attached-units-and-lone-operative | Attached units and Lone Operative | 822 | 822 | unchanged |
| core-rule-24-26-01-multiple-one-shot-weapons | Multiple [ONE SHOT] Weapons | 186 | 186 | unchanged |
| core-rule-24-28-01-precision-and-devastating-wounds | Precision and Devastating Wounds | 216 | 216 | unchanged |
| core-rule-24-37-01-torrent-restrictions | Torrent Restrictions | 61 | 61 | unchanged |
| core-rule-25-01-start-your-army-roster | Start Your Army Roster | 214 | 214 | unchanged |
| core-rule-25-02-select-army-faction | Select Army Faction | 69 | 69 | unchanged |
| core-rule-25-03-select-battle-size | Select Battle Size | 916 | 916 | unchanged |
| core-rule-25-04-01-select-detachments | Select Detachments | — | 585 | new |
| core-rule-25-04-02-select-units | Select Units | — | 980 | new |
| core-rule-25-04-03-attach-leaders-and-support-units | Attach Leaders and Support Units | — | 235 | new |
| core-rule-25-04-04-select-enhancements | Select Enhancements | — | 1033 | new |
| core-rule-25-04-fill-your-army-roster | Fill Your Army Roster | 554 | 554 | unchanged |
| core-scout-move | SCOUT MOVE | 282 | 282 | unchanged |
| core-scouts | SCOUTS | 707 | 707 | unchanged |
| core-stealth | STEALTH | 234 | 234 | unchanged |
| core-stratagem-fire-overwatch | FIRE OVERWATCH | 218 | 218 | unchanged |
| core-super-heavy-walker | SUPER-HEAVY WALKER | 834 | 834 | unchanged |
| core-support | SUPPORT | 410 | 410 | unchanged |
| core-sustained-hits | [SUSTAINED HITS] | 573 | 573 | unchanged |
| core-torrent | [TORRENT] | 199 | 199 | unchanged |
| core-twin-linked | [TWIN-LINKED] | 171 | 171 | unchanged |
| core-waha-errata-01-02-06 | 01.02.06 Splitting Units | 412 | 416 | presentation |
| core-waha-errata-07-01 | CP Generated by a Warlord | — | 172 | new |
| core-waha-errata-12-08 | 12.08 - Consolidation Move, After Moving Section, Ongoing Consolidation | 337 | 347 | presentation |
| core-waha-errata-13-09 | 13.09 - Change to First Bullet Point | 135 | 146 | presentation |
| core-waha-errata-18-05 | 18.05 - Change to Emergency Disembark Move | 376 | 376 | unchanged |
| core-wholly-within | Wholly Within | 70 | 70 | unchanged |
| core-within | Within | 68 | 68 | unchanged |
| faq-blast-against-engaged-monster-vehicle | When my unit shoots at an engaged MONSTER/VEHICLE unit, can models in my unit target that unit with [BLAST] weapons? | 3 | 3 | unchanged |
| faq-blast-during-close-quarters-shooting | When my unit shoots using close - quarters shooting, can MONSTER/ VEHICLE models in my unit target an engaged unit with [BLAST] weapons? | 3 | 3 | unchanged |
| faq-embark-after-scout-move | Can a unit embark within a TRANSPORT after making a scout move? | 169 | 169 | unchanged |
| faq-no-ranged-weapons-eligible-to-shoot | Is a unit with no ranged weapons eligible to shoot in its controlling player’s Shooting phase? | 159 | 159 | unchanged |
| faq-overrun-fight-without-fight-eligibility | Can a unit that is eligible to make an overrun fight be selected to do so if it is not also eligible to fight? | 209 | 209 | unchanged |
| uru-2026-07-22-defensive-stratagem-range | Stratagems That Prevent Units from Being Targeted | 207 | 207 | unchanged |
| uru-2026-07-22-identical-destroyed-unit | Stratagems That Add New Units to Your Army | 114 | 114 | unchanged |
| uru-2026-07-22-stratagem-cp-cost | Modifying a Stratagem's CP Cost | 127 | 127 | unchanged |
| uru-2026-07-22-stratagem-reuse | Stratagems That Can Be Used More Than Once per Phase or Turn | 278 | 278 | unchanged |
| uru-2026-08-26-disembark-move-types | Move Types for Disembarking Units | 342 | 342 | unchanged |

## Exact ownership redistribution list

| Source record | Old chars | New chars | Destinations | Lost sentences |
|---|---:|---:|---|---:|
| core-rule-12-07-consolidate | 677 | 348 | core-rule-12-08-consolidation-move | 0 |
| core-rule-19-01-forming-attached-units | 500 | 425 | core-leader | 0 |
| core-rule-20-03-advanced-arriving-from-strategic-reserves | 632 | 180 | core-rule-20-04-ingress-move | 0 |
| core-rule-21-01-surge-moves | 1021 | 65 | core-rule-21-02-surge-move, core-rule-21-03-flying-models | 0 |

### core-rule-12-07-consolidate

Destination: `core-rule-12-08-consolidation-move`.

```text
NEW FOES TO FACE
```

Destination: `core-rule-12-08-consolidation-move`.

```text
While using the engaging consolidation mode, your unit can end its consolidation move engaged with enemy units that have not yet fought this phase.
```

Destination: `core-rule-12-08-consolidation-move`.

```text
If so, each of those enemy units will have an opportunity to fight your unit, so think carefully about how aggressively you want to move your unit using this mode.
```

### core-rule-19-01-forming-attached-units

Destination: `core-leader`.

```text
SEE ALSO
```

Destination: `core-leader`.

```text
Attached Units After Their Bodyguard Unit is Destroyed 19.01.01
```

### core-rule-20-03-advanced-arriving-from-strategic-reserves

Destination: `core-rule-20-04-ingress-move`.

```text
At the end of the third battle round, unless otherwise stated, all strategic reserves units that have not made one or more ingress moves are destroyed, with the following exceptions:
```

Destination: `core-rule-20-04-ingress-move`.

```text
Units embarked within TRANSPORTS that have made an ingress move during the battle.
```

Destination: `core-rule-20-04-ingress-move`.

```text
Repositioned units (see above).
```

Destination: `core-rule-20-04-ingress-move`.

```text
SEE ALSO
```

Destination: `core-rule-20-04-ingress-move`.

```text
Not on the Battlefield 01.02.04
```

Destination: `core-rule-20-04-ingress-move`.

```text
Persisting Rules Effects 01.02.02
```

Destination: `core-rule-20-04-ingress-move`.

```text
Setting Up Large Models 03.02.02
```

Destination: `core-rule-20-04-ingress-move`.

```text
Set Up As Reinforcements 20.03.01
```

### core-rule-21-01-surge-moves

Destination: `core-rule-21-02-surge-move`.

```text
SEE ALSO
```

Destination: `core-rule-21-02-surge-move`.

```text
Rules Sequencing 01.03.02
```

Destination: `core-rule-21-02-surge-move`.

```text
MAKING A SURGE MOVE
```

Destination: `core-rule-21-02-surge-move`.

```text
Unit A shoots, and destroys two models from unit B.
```

Destination: `core-rule-21-02-surge-move`.

```text
Unit B has an ability that allows it to make a surge move of D6" after an enemy unit has shot, if one or more of its models were destroyed by those attacks.
```

Destination: `core-rule-21-02-surge-move`.

```text
The active player rolls one D6, resulting in a 4.
```

Destination: `core-rule-21-02-surge-move`.

```text
Unit B makes a surge move, each of its surviving models moving up to 4" towards the closest enemy unit (unit C).
```

Destination: `core-rule-21-02-surge-move`.

```text
It ends this move engaged with that unit.
```

Destination: `core-rule-21-03-flying-models`.

```text
TAKING TO THE SKIES
```

Destination: `core-rule-21-03-flying-models`.

```text
This Riptide Battlesuit can FLY.
```

Destination: `core-rule-21-03-flying-models`.

```text
It makes an advance move with a maximum distance of 16".
```

Destination: `core-rule-21-03-flying-models`.

```text
Before moving the unit, the active player declares that it will take to the skies.
```

Destination: `core-rule-21-03-flying-models`.

```text
That move’s maximum distance is reduced to 14", but while making that move, the Riptide Battlesuit can move through all enemy units (including VEHICLES) and all terrain features, ignoring any vertical distance that would normally be counted to ascend and descend terrain features.
```

Separately authorized source change in `core-rule-21-02-surge-move`: `SET-UP DISTANCE: As stated in the rule allowing this move type.` → `MAXIMUM DISTANCE: As stated in the rule allowing this move type.`. It is excluded only from literal-union equality; unchanged source facts have loss 0.

## Exact formatter representation pairs

### core-rule-02-02-01-modifiers

Old accepted formatter (books/core-rules/tools/import_wahapedia_11e.py:181):

```text
A value that has been changed is a modified rule (for example, a modified characteristic, modified roll or modified value).
```

Equivalent captured representation, with independent own-source witness in JSON:

```text
A value that has been changed is a modified rule (e.g. modified characteristic, modified roll, modified value, etc).
```

Old accepted formatter (books/core-rules/tools/import_wahapedia_11e.py:183):

```text
If a rule has +1 to a characteristic, it improves it by the value after the ‘+’ symbol.
```

Equivalent captured representation, with independent own-source witness in JSON:

```text
If the rule has +1 to a characteristic, it improves it by the value after the ‘+’ symbol.
```

Old accepted formatter (books/core-rules/tools/import_wahapedia_11e.py:183):

```text
For example, ‘This weapon has +1 AP’ would improve an AP characteristic of -2 to -3.
```

Equivalent captured representation, with independent own-source witness in JSON:

```text
Example: ‘This weapon has +1 AP’ would improve an AP characteristic of -2 to -3.
```

Old accepted formatter (books/core-rules/tools/import_wahapedia_11e.py:184):

```text
If a rule has -1 to a characteristic, it worsens it by the value after the ‘-’ symbol.
```

Equivalent captured representation, with independent own-source witness in JSON:

```text
If the rule has -1 to a characteristic, it worsens it by the value after the ‘-’ symbol.
```

Old accepted formatter (books/core-rules/tools/import_wahapedia_11e.py:184):

```text
For example, ‘This unit has -1 Sv’ would worsen a Sv characteristic of 3+ to 4+.
```

Equivalent captured representation, with independent own-source witness in JSON:

```text
Example: ‘This unit has -1 Sv’ would worsen a Sv characteristic of 3+ to 4+.
```

### core-rule-18-05-emergency-disembark-move

Old accepted formatter (books/core-rules/content/core-rules.digital-11e.json):

```text
Or: If the above is not possible while remaining unengaged, set up that model wholly within the set-up distance of that TRANSPORT, as close as possible to that TRANSPORT, and engaged.
```

Equivalent captured representation, with independent own-source witness in JSON:

```text
OR: (2) If the above is not possible while remaining unengaged, set up that model wholly within the set-up distance of that TRANSPORT, as close as possible to that TRANSPORT, and engaged.
```

## Baseline representation exceptions

| ID | Origin | Old effective text exactly retained | Proof |
|---|---|---|---|
| core-rule-01-02-01-starting-strength-and-half-strength | CAPTURED_WAHAPEDIA | true | {"kind":"EXACT_ACCEPTED_TYPED_RENDER","baselineTextSha256":"9AF737A72DE39578BE135E034A7F2DDA8A840E807C668FC6FF5B4B4967460F7B","sourceFactsVerifiedUnchanged":true,"visibleDiceFaces":[]} |
| core-rule-03-03-coherency | CAPTURED_WAHAPEDIA | true | {"kind":"EXACT_ACCEPTED_TYPED_RENDER","baselineTextSha256":"3010E5F04D1AE0F2BE3E6C5F8594F5A8B1C48155A90B50F9EBB81F9728AD7A42","sourceFactsVerifiedUnchanged":true,"visibleDiceFaces":[]} |
| core-rule-03-04-01-what-is-engagement | CAPTURED_WAHAPEDIA | true | {"kind":"EXACT_ACCEPTED_PROSE_TEMPLATE","baselineTextSha256":"BDA742D4DB1E0E254DBF1617A99FDF7B709F9DAA95356C506F39791ED38DDC79","sourceFactsVerifiedUnchanged":true} |
| core-rule-05-02-wound-rolls | CAPTURED_WAHAPEDIA | true | {"kind":"EXACT_ACCEPTED_TYPED_RENDER","baselineTextSha256":"79E42B359436CD3D09C64853EE4B3A09F661143094496973560FEDADD6EC3FBB","sourceFactsVerifiedUnchanged":true,"visibleDiceFaces":["1","6","2","3","4","5","6"]} |
| core-rule-05-03-save-rolls | CAPTURED_WAHAPEDIA | true | {"kind":"EXACT_ACCEPTED_TYPED_RENDER","baselineTextSha256":"8C119857E14DD81CEEB2B3E22E56B5AE104CEBAB13EDE1682AB826BB62CE5767","sourceFactsVerifiedUnchanged":true,"visibleDiceFaces":[]} |
| core-rule-09-04-remain-stationary | CAPTURED_WAHAPEDIA | true | {"kind":"EXACT_ACCEPTED_TYPED_RENDER","baselineTextSha256":"757E4BAB54D3F744D8174B354D2E5684859D18F2A45EDBCDDB396BCB3AF2B8EF","sourceFactsVerifiedUnchanged":true,"visibleDiceFaces":[]} |
| core-rule-09-05-normal-move | CAPTURED_WAHAPEDIA | true | {"kind":"EXACT_ACCEPTED_TYPED_RENDER","baselineTextSha256":"49276ED633FE2A02BF2E36904EC253BD747C9599C4A6B4DC5631DB57D3689833","sourceFactsVerifiedUnchanged":true,"visibleDiceFaces":[]} |
| core-rule-09-06-advance-move | CAPTURED_WAHAPEDIA | true | {"kind":"EXACT_ACCEPTED_TYPED_RENDER","baselineTextSha256":"BBA01A40E9E571E4AFDECD61EF3F9488877C07F416A089489842AA96DF660EB6","sourceFactsVerifiedUnchanged":true,"visibleDiceFaces":[]} |
| core-rule-09-07-01-desperate-escape | CAPTURED_WAHAPEDIA | true | {"kind":"EXACT_BASELINE_SOURCE_RENDER","baselineTextSha256":"741DF75EC62D46C1FAD99E307AE7FA56BF54DC3F72275422C38B54E0E38B7BFB","completeBodyContainedInOwnSource":true} |
| core-rule-09-07-fall-back-move | CAPTURED_WAHAPEDIA | true | {"kind":"EXACT_ACCEPTED_TYPED_RENDER","baselineTextSha256":"02CCA0C082A7A86B3BC50CE7CF669916EE1331D471C6B5F2E40E8EE024A4C3D2","sourceFactsVerifiedUnchanged":true,"visibleDiceFaces":[]} |
| core-rule-10-04-normal-shooting | CAPTURED_WAHAPEDIA | true | {"kind":"EXACT_ACCEPTED_TYPED_RENDER","baselineTextSha256":"5A159BA4EA226F20ABC57BA9F383F2BC82AF1948FA4F19890EC43F038CE9C1FC","sourceFactsVerifiedUnchanged":true,"visibleDiceFaces":[]} |
| core-rule-10-05-assault-shooting | CAPTURED_WAHAPEDIA | true | {"kind":"EXACT_ACCEPTED_TYPED_RENDER","baselineTextSha256":"0704AAFF3B78CFD0F4723DC86A70F2376D55877216296D4FAD8B8D98696E2CE8","sourceFactsVerifiedUnchanged":true,"visibleDiceFaces":[]} |
| core-rule-10-06-close-quarters-shooting | CAPTURED_WAHAPEDIA | true | {"kind":"EXACT_ACCEPTED_TYPED_RENDER","baselineTextSha256":"82F2E850A75A0C1B54A8F7C99606C4E1A7CED580AD9393E61427A1CAFBB1EEA5","sourceFactsVerifiedUnchanged":true,"visibleDiceFaces":[]} |
| core-rule-10-07-indirect-shooting | CAPTURED_WAHAPEDIA | true | {"kind":"EXACT_ACCEPTED_TYPED_RENDER","baselineTextSha256":"F057A502E288058C062D0EF96E4A6479D351AC603C646CBC61DB4522AE848252","sourceFactsVerifiedUnchanged":true,"visibleDiceFaces":[]} |
| core-rule-12-05-normal-fight | CAPTURED_WAHAPEDIA | true | {"kind":"EXACT_ACCEPTED_TYPED_RENDER","baselineTextSha256":"18316F277731D06A0D8330131CF9E67D5C3DC58396CE0874364033AAFEE88100","sourceFactsVerifiedUnchanged":true,"visibleDiceFaces":[]} |
| core-rule-13-09-hidden | CAPTURED_WAHAPEDIA | true | {"kind":"EXACT_BASELINE_SOURCE_RENDER","baselineTextSha256":"54258F494F045752DD9105F61C4E46D9EA4D4AD87DA3306365DB879CBFDDC05A","completeBodyContainedInOwnSource":true} |
| core-rule-18-04-disembark-move | CAPTURED_WAHAPEDIA | true | {"kind":"EXACT_ACCEPTED_TYPED_RENDER","baselineTextSha256":"BF7C9699BA77EE4EF6192B26B8A54EF2F1B5FD0B6FA6F2FB37DD34D2917289F9","sourceFactsVerifiedUnchanged":true,"visibleDiceFaces":[]} |
| core-rule-19-04-01-only-in-death-does-duty-end | CAPTURED_WAHAPEDIA | true | {"kind":"EXACT_ACCEPTED_PROSE_TEMPLATE","baselineTextSha256":"26243AC7995E8F1B780CC3005CA3E957784C711A497A6E5A9B141E6A7295B6D6","sourceFactsVerifiedUnchanged":true} |
| core-rule-19-04-abilities-in-attached-units | CAPTURED_WAHAPEDIA | true | {"kind":"EXACT_ACCEPTED_TYPED_RENDER","baselineTextSha256":"4FBD49C5BA42A58045B0ECB870DD0B4E85FFEF37D377B54D08C101FB04F9B377","sourceFactsVerifiedUnchanged":true,"visibleDiceFaces":[]} |
| core-rule-25-03-select-battle-size | CAPTURED_WAHAPEDIA | true | {"kind":"EXACT_ACCEPTED_TYPED_RENDER","baselineTextSha256":"AA61EB21C583C3EC5F8055FAEA3ECDEA45CF0A23DB4FE445D80AEB1684A9BA5C","sourceFactsVerifiedUnchanged":true,"visibleDiceFaces":[]} |
| core-scout-move | CAPTURED_WAHAPEDIA | true | {"kind":"EXACT_ACCEPTED_TYPED_RENDER","baselineTextSha256":"D93E2F6A73A1E366221151B0D1AD81BAA50AFC60AD52994106C1EA5F4B614435","sourceFactsVerifiedUnchanged":true,"visibleDiceFaces":[]} |
| core-support | BASELINE_PRESENTATION_EXCEPTION | true | null |

## Full changed texts

### core-rule-02-02-01-modifiers — Modifiers

Category: restored / EXACT_ACCEPTED_FORMATTER_PAIRINGS.

Old effective text:

```text
WHAT ARE MODIFIERS?
Many rules in the game modify a value, characteristic or roll elsewhere in the game. A rule that does so is known as a modifier. A value that has been changed is a modified rule (for example, a modified characteristic, modified roll or modified value).
One of the most common ways for modifiers to be presented is as +1 or -1 to a characteristic, roll or value.
If a rule has +1 to a characteristic, it improves it by the value after the ‘+’ symbol. For example, ‘This weapon has +1 AP’ would improve an AP characteristic of -2 to -3.
If a rule has -1 to a characteristic, it worsens it by the value after the ‘-’ symbol. For example, ‘This unit has -1 Sv’ would worsen a Sv characteristic of 3+ to 4+.

When Modifying Characteristics
When modifying characteristics, unless otherwise stated, the following points also apply:
• Characteristics of ‘-’, ‘*’ and ‘N/A’ can never be modified.
• Rules that modify a model’s WS and/or BS characteristic modify the WS and/or BS characteristic of every weapon equipped by that model.
• After all modifiers have been applied:
• M cannot be less than 1".
• T cannot be less than 1.
• Sv cannot be 1+ or better.
• InSv cannot be 1+ or better.
• Ld cannot be 4+ (or better) or 9+ (or worse).
• OC cannot be less than 0 or ‘-’.
• Range characteristics cannot be less than 1".
• A cannot be less than 1.
• WS cannot be 1+ (or better) or 7+ (or worse).
• BS cannot be 1+ (or better) or 7+ (or worse).
• S cannot be less than 1.
• AP cannot be worse than 0.
• D cannot be less than 1.
When these terms are used in rules, the affected characteristics are being modified, and the following points apply:
• Improving WS, BS, Sv and Ld: When improving a WS, BS, Sv or Ld characteristic, subtract the appropriate amount from the number before the plus sign, for example improving a WS of 3+ by 1 would result in a WS of 2+.
• Worsening WS, BS, Sv and Ld: When worsening a WS, BS, Sv or Ld characteristic, add the appropriate amount to the number before the plus sign, for example worsening a WS of 3+ by 1 would result in a WS of 4+.
• Improving AP: When improving an Armour Penetration characteristic, subtract the appropriate amount from the characteristic, for example improving an AP of -1 by 1 would result in an AP of -2; improving an AP of 0 by 1 would result in an AP of -1.
• Reducing or Worsening AP: When reducing or worsening an Armour Penetration characteristic, add the appropriate amount to the characteristic, to a maximum of 0, for example reducing/worsening an AP of -1 by 1 would result in an AP of 0; reducing/worsening an AP of 0 by 1 would result in an AP of 0.
• Improving or Worsening Other Characteristics: When instructed to improve/worsen a characteristic that does not include a ‘+’ or ‘-’ symbol, add/subtract the specified amount to/from that characteristic (for example to improve a S by 1, add 1 to it).
```

Candidate text:

```text
WHAT ARE MODIFIERS?
Many rules in the game modify a value, characteristic or roll elsewhere in the game. A rule that does so is known as a modifier. A value that has been changed is a modified rule (e.g. modified characteristic, modified roll, modified value, etc).
One of the most common ways for modifiers to be presented is as +1 or -1 to a characteristic, roll or value.
If the rule has +1 to a characteristic, it improves it by the value after the ‘+’ symbol.
Example: ‘This weapon has +1 AP’ would improve an AP characteristic of -2 to -3.
If the rule has -1 to a characteristic, it worsens it by the value after the ‘-’ symbol.
Example: ‘This unit has -1 Sv’ would worsen a Sv characteristic of 3+ to 4+.
Applying Modifiers
This section presents the various ways rules may be modified. All modifiers are cumulative.
When a value is modified (e.g. characteristic, dice roll, distance), do so in the following order.
• If a rule instructs you to change or replace one value with a specified value, you must first change the relevant value to the new value.
Note that rules that modify a characteristic in this step to a new value of ‘0’, ‘-’ or ‘*’ cannot be modified by other rules (in such cases, skip steps 2-5).
• Apply multiplication modifiers.
• Apply addition modifiers.
• Apply division modifiers.
• Apply subtraction modifiers.
• Round any fractions up after applying all modifiers.
When Modifying Characteristics
When modifying characteristics, unless otherwise stated, the following points also apply:
• Characteristics of ‘-’, ‘*’ and ‘N/A’ can never be modified.
• Rules that modify a model’s WS and/or BS characteristic modify the WS and/or BS characteristic of every weapon equipped by that model.
• After all modifiers have been applied:
• M cannot be less than 1"".
• T cannot be less than 1.
• Sv cannot be 1+ or better.
• InSv cannot be 1+ or better.
• Ld cannot be 4+ (or better) or 9+ (or worse).
• OC cannot be less than 0 or ‘-’.
• Range characteristics cannot be less than 1".
• A cannot be less than 1.
• WS cannot be 1+ (or better) or 7+ (or worse).
• BS cannot be 1+ (or better) or 7+ (or worse).
• S cannot be less than 1.
• AP cannot be worse than 0.
• D cannot be less than 1.
When these terms are used in rules, the affected characteristics are being modified, and the following points apply:
• Improving WS, BS, Sv and Ld: When improving a WS, BS, Sv or Ld characteristic, subtract the appropriate amount from the number before the plus sign, e.g. improving a WS of 3+ by 1 would result in a WS of 2+.
• Worsening WS, BS, Sv and Ld: When worsening a WS, BS, Sv or Ld characteristic, add the appropriate amount to the number before the plus sign, e.g. worsening a WS of 3+ by 1 would result in a WS of 4+.
• Improving AP: When improving an Armour Penetration characteristic, subtract the appropriate amount from the characteristic, e.g. improving an AP of -1 by 1 would result in an AP of -2; improving an AP of 0 by 1 would result in an AP of -1.
• Reducing or Worsening AP: When reducing or worsening an Armour Penetration characteristic, add the appropriate amount to the characteristic, to a maximum of 0, e.g. reducing/worsening an AP of -1 by 1 would result in an AP of 0; reducing/worsening an AP of 0 by 1 would result in an AP of 0.
• Improving or Worsening Other Characteristics: When instructed to improve/worsen a characteristic that does not include a ‘+’ or ‘-’ symbol, add/subtract the specified amount to/from that characteristic (e.g. to improve a S by 1, add 1 to it).
When Modifying Dice Rolls
When modifying dice rolls, the following points also apply:
• Modifiers are applied after any re-rolls of that dice roll.
• Rules that refer to the value of an ‘unmodified’ dice roll are referring to the dice result after any re-rolls, but before modifiers.
• A dice result can be modified above its maximum possible value (for example, a D6 roll can be modified above 6).
• A result that would be less than 1 is changed to a result of 1.
• Hit rolls and wound rolls can never be modified by more than -1 or +1. After all the cumulative modifiers to such a roll have been calculated, if the total modifier would be:
• -2 or worse, it is changed to -1.
• +2 or better, it is changed to +1.
• Charge rolls cannot be greater than 12. After all the cumulative modifiers to a charge roll have been calculated, if the result would be 13 or more, it is changed to 12.
Other Modified Rules
The following rules apply to various rules and effects found throughout the game.
• Detection range and Lone Operative cannot be better than 9" or worse than 30".
A stratagem cannot have its CP increased by more than 1 or reduced to below 0 after all modifiers have been applied.
```

### core-rule-03-01-moving-units — Moving Units

Category: restored.

Old effective text:

```text
There are several types of move a unit can make. Each one defines which units are eligible to make it, what its maximum distance or set-up distance is, and any conditions that must be met.
Each time you move a unit, you can move one or more of its models, one at a time, by moving it in a straight line and/or rotating it, as many times as you want to.
Each time you move a model, unless otherwise stated:
• It can be moved through friendly models.
• It can be moved through any space its base can fit through.
• Its base cannot be moved through enemy models.
• Its base cannot cross the edge of the battlefield.
• All stated ‘While Moving’ conditions must be met.
SEE ALSO
• Different Move Characteristics 03.01.01
• Moving Over Or Through Models 03.01.02
• Random Movement 03.01.03
• When Moving Up To 03.01.04
```

Candidate text:

```text
There are several types of move a unit can make. Each one defines which units are eligible to make it, what its maximum distance or set-up distance is, and any conditions that must be met.
Each time you move a unit, you can move one or more of its models, one at a time, by moving it in a straight line and/or rotating it, as many times as you want to.
Each time you move a model, unless otherwise stated:
• It can be moved through friendly models.
• It can be moved through any space its base can fit through.
• Its base cannot be moved through enemy models.
• Its base cannot cross the edge of the battlefield.
• All stated ‘While Moving’ conditions must be met.
SEE ALSO
• Different Move Characteristics 03.01.01
• Moving Over Or Through Models 03.01.02
• Random Movement 03.01.03
• When Moving Up To 03.01.04
Moving a Model in a Straight Line
Each time you move a model in a straight line, move it horizontally across the battlefield. Measure from the same point on its base at the start and end of that move, and add that distance to any other distance it has moved since its unit began that move. The distance moved cannot be greater than the maximum distance of that move type.
Rotating a Model
Each time you rotate a model, turn it any amount around the centre of its base, while keeping it upright. Note that rotating a model does not count towards the distance it has moved.
Ending a Move
After you have finished setting up all of the models in a unit and/or moving all of the models in a unit that you want to move, check that all of the following apply:
• If that unit is on the battlefield, it is in coherency (03.03).
• No models in that unit are on another model or partway through a surface of a terrain feature (e.g. a wall or ceiling).
• All stated ‘After Moving’ conditions are met.
If one or more of the above conditions are not met, that unit cannot make that move and its models are returned to their positions at the start of that move. Otherwise, after resolving any additional rules stated in the ‘After Moving’ section of that move type, that move ends.
SEE ALSO
• Frame 17.02
• Monsters and Vehicles 17.00
• Moving Vertically 13.06
• Random Movement
• Strategic Reserves 20.00
• Terrain 13.00
• Transports 18.00
MOVE TYPES
• Advance Move 09.06
• Charge Move 11.04
• Consolidation Move 12.08
• Disembark Move 18.04
• Emergency Disembark Move 18.05
• Fall-back Move 09.07
• Ingress Move 20.04
• Normal Move 09.05
• Pile-in Move 12.03
• Scout Move 24.32
• Surge Move 21.02
MOVING IN A STRAIGHT LINE
Both models shown here can move a maximum distance of 6". They both move 3" in a straight line, then 3" in another straight line, for a total movement of 6".
ROTATING
This model can move a maximum distance of 12". It moves in a series of straight lines and rotations, as follows:
A) Moves 6" in a straight line
B) Rotates
C) Moves 6" in a straight line
D) Rotates This model has moved a total of 12".
ROTATING
Models without a base are rotated around their central axis (see Frame, 17.02).
```

### core-rule-07-01-start-of-battle-round — 1. Start of Battle Round

Category: sourcechanged.

Old effective text:

```text
At the start of the battle round, players resolve rules that are triggered at the start of the battle round, before progressing to player turns.
```

Candidate text:

```text
At the start of the battle round, players resolve rules that are triggered at the start of the battle round, before progressing to player turns.
When a rule states that 'At the start of the battle round, if a model with this ability is your WARLORD, gain 1CP.' you do not gain the 1CP while your WARLORD is destroyed.
```

### core-rule-07-03-end-of-battle-round — 3. End of Battle Round

Category: restored.

Old effective text:

```text
Rules that are triggered at the end of the battle round are resolved now, in the following order:
• First resolve rules triggered at this point other than mission rules.
• Both players then consult their mission; if one or both players have achieved any aspects of their mission that are triggered at this point, resolve them now.
The battle round then ends and, unless the battle ends, the next battle round starts. The mission you are playing will tell you how many battle rounds to resolve before the battle ends.
```

Candidate text:

```text
Rules that are triggered at the end of the battle round are resolved now, in the following order:
• First resolve rules triggered at this point other than mission rules.
• Both players then consult their mission; if one or both players have achieved any aspects of their mission that are triggered at this point, resolve them now.
The battle round then ends and, unless the battle ends, the next battle round starts. The mission you are playing will tell you how many battle rounds to resolve before the battle ends.
1
START OF TURN STEP
Rules that are triggered at the start of a turn are resolved now.
2
COMMAND PHASE
You marshal strategic resources and check your units’ morale.
3
MOVEMENT PHASE
Your units move across the battlefield and strategic reserves arrive.
4
SHOOTING PHASE
Your units make attacks with their ranged weapons.
5
CHARGE PHASE
Your units make charge moves to engage the enemy.
6
FIGHT PHASE
Both players’ units make attacks with their melee weapons.
7
END OF TURN STEP
Rules that are triggered at the end of a turn are resolved now, in the following order:
• First resolve rules triggered at this point other than mission rules.
• Both players then consult their mission; if one or both players have achieved any aspects of their mission that are triggered at this point, resolve them now.
```

### core-rule-09-07-01-desperate-escape-test — Desperate Escape Test

Category: sourcechanged.

Old effective text:

```text
Some rules may reference the term 'Desperate Escape test'. In all instances this means the hazard rolls made for the desperate escape mode of a fall-back move.
Abilities that subtract from a unit's Desperate Escape test instead subtract from those hazard rolls.
Example: A battle-shocked unit makes a fall-back move away from a unit of Bloodletters that have the Bane of Cowards ability. As a result of Bane of Cowards, because the unit making the fall-back move is battle-shocked, the hazard rolls they make as part of their desperate escape will be at -1.
```

Candidate text:

```text
Some rules may reference the term ‘Desperate Escape test’. In all instances this means the hazard rolls made for the desperate escape mode of a fall-back move.
Abilities that subtract from a unit’s Desperate Escape test instead subtract from those hazard rolls.
If a stratagem or ability instructs a unit to make a Desperate Escape test, that unit:
• Must use the desperate escape mode when it is selected to make a fall-back move.
• Must make one hazard roll for each model in that unit.
• Must make a battle-shock roll.
Example 1: A battle-shocked unit makes a fall-back move away from a unit of Bloodletters that have the Bane of Cowards ability. As a result of Bane of Cowards, because the unit making the fall-back move is battle-shocked, the hazard rolls they make as part of their desperate escape will be at -1.
Example 2: If an ability allows a unit to re-roll Desperate Escape tests, that unit can re-roll hazard rolls made for the desperate escape mode of a fall-back move.
```

### core-rule-11-04-charge-move — CHARGE MOVE

Category: restored.

Old effective text:

```text
MAXIMUM DISTANCE: Charge roll.
ELIGIBLE IF: Your unit declared a charge this phase.
EFFECT: Your unit moves as described in Moving (03).
BEFORE MOVING: Select one or more enemy units that are within 12" of your unit and within the maximum distance of your unit; until the end of this move, each of those enemy units is a charge target.
WHILE MOVING:
• Each model must end its move closer to one or more charge targets.
• Each model that can end its move within 1" of one or more charge targets must do so.
• Each model that can end its move engaged with one or more charge targets must do so.
AFTER MOVING:
• Your unit must be engaged with all of the charge targets.
• Your unit cannot be engaged with one or more enemy units that are not charge targets.
• Until the end of the turn, each model in your unit has the Fights First ability (24.13).
```

Candidate text:

```text
MAXIMUM DISTANCE: Charge roll.
ELIGIBLE IF: Your unit declared a charge this phase.
EFFECT: Your unit moves as described in Moving (03).
BEFORE MOVING: Select one or more enemy units that are within 12" of your unit and within the maximum distance of your unit; until the end of this move, each of those enemy units is a charge target.
WHILE MOVING:
• Each model must end its move closer to one or more charge targets.
• Each model that can end its move within 1" of one or more charge targets must do so.
• Each model that can end its move engaged with one or more charge targets must do so.
AFTER MOVING:
• Your unit must be engaged with all of the charge targets.
• Your unit cannot be engaged with one or more enemy units that are not charge targets.
• Until the end of the turn, each model in your unit has the Fights First ability (24.13).
MAKING A CHARGE MOVE
A
The BLUE unit declares a charge and the charge roll generates a maximum distance of 7". Unit A is within this distance, so can be selected as a charge target, but the BLUE unit would not be able to end its charge move engaged with this unit after moving around the intervening terrain features.
B
This unit is more than 7" from the charging unit, so it cannot be selected as a charge target, even though the charging unit could end its charge move within 2" of this unit.
C
These units are both within 7", so can be selected as charge targets. The charging unit can end its charge move engaged with all of its charge targets, so this move can be made.
```

### core-rule-12-03-pile-in-move — PILE-IN MOVE

Category: restored.

Old effective text:

```text
MAXIMUM DISTANCE: 3".
ELIGIBLE IF: It is the Fight phase and one or more of the following apply to your unit:
• It is engaged.
• It made a charge move this turn.
• It was selected to make an overrun fight this phase (12.06).
EFFECT: Your unit moves as described in Moving (03).
BEFORE MOVING: Select pile-in targets:
• If your unit is engaged, select every enemy unit it is engaged with.
• Otherwise, select one or more enemy units within 5" of your unit.
WHILE MOVING:
• Models in base-contact with one or more enemy models cannot be moved.
• Each model that is moved must end its move closer to the closest pile-in target, and engaged with it if possible.
AFTER MOVING:
• Your unit must be engaged.
• Each model that started this move engaged with an enemy unit must still be engaged with that enemy unit.
```

Candidate text:

```text
MAXIMUM DISTANCE: 3".
ELIGIBLE IF: It is the Fight phase and one or more of the following apply to your unit:
• It is engaged.
• It made a charge move this turn.
• It was selected to make an overrun fight this phase (12.06).
EFFECT: Your unit moves as described in Moving (03).
BEFORE MOVING: Select pile-in targets:
• If your unit is engaged, select every enemy unit it is engaged with.
• Otherwise, select one or more enemy units within 5" of your unit.
WHILE MOVING:
• Models in base-contact with one or more enemy models cannot be moved.
• Each model that is moved must end its move closer to the closest pile-in target, and engaged with it if possible.
AFTER MOVING:
• Your unit must be engaged.
• Each model that started this move engaged with an enemy unit must still be engaged with that enemy unit.
START OF FIGHT PHASE
Because both RED units made charge moves this turn, they are both Fights First units this phase and are both eligible to make pile-in moves, even though the MONSTER is unengaged as it destroyed its charge target in the Charge phase using the Crushing Impact stratagem (15.06).
PILE-IN MOVES
• The RED player makes pile-in moves first.
• The BLUE player makes pile-in moves next, but as their model is in base-contact with enemy models, it is not moved.
```

### core-rule-12-04-fight — 3. Fight Step

Category: restored.

Old effective text:

```text
A unit is eligible to fight if it has not already been selected to fight this phase and one or more of the following apply to it:
• It is engaged, or it was engaged at the start of this step.
• It made a charge move this turn.
Players resolve the following sequence until all eligible units have been selected to fight and their attacks have been resolved:
• Resolve Fights First Combats: Starting with the player whose turn it is, players alternate selecting one friendly Fights First unit that is eligible to fight; that unit is selected to fight (see below). If this is not possible:
• If there are no Fights First units that are eligible to fight, move to the Resolve Remaining Combats step where this player will select their next unit.
• Otherwise, the other player selects their next unit.
• Resolve Remaining Combats: Starting with the player who just moved this sequence onto this step, players alternate selecting one friendly unit that is eligible to fight; that unit is selected to fight. If this is not possible:
• If there are no units that are eligible to fight, the Fight step ends.
• Otherwise, the other player selects their next unit.
After resolving a fight in the Resolve Remaining Combats step, if there are one or more Fights First units that are now eligible to fight, return to the Resolve Fights First Combats step.
Fight types are marked with this icon.
SEE ALSO
• Eligible to fight, but unable to fight 12.04.01
```

Candidate text:

```text
A unit is eligible to fight if it has not already been selected to fight this phase and one or more of the following apply to it:
• It is engaged, or it was engaged at the start of this step.
• It made a charge move this turn.
Players resolve the following sequence until all eligible units have been selected to fight and their attacks have been resolved:
• Resolve Fights First Combats: Starting with the player whose turn it is, players alternate selecting one friendly Fights First unit that is eligible to fight; that unit is selected to fight (see below). If this is not possible:
• If there are no Fights First units that are eligible to fight, move to the Resolve Remaining Combats step where this player will select their next unit.
• Otherwise, the other player selects their next unit.
• Resolve Remaining Combats: Starting with the player who just moved this sequence onto this step, players alternate selecting one friendly unit that is eligible to fight; that unit is selected to fight. If this is not possible:
• If there are no units that are eligible to fight, the Fight step ends.
• Otherwise, the other player selects their next unit.
After resolving a fight in the Resolve Remaining Combats step, if there are one or more Fights First units that are now eligible to fight, return to the Resolve Fights First Combats step.
Fight types are marked with this icon.
SEE ALSO
• Eligible to fight, but unable to fight 12.04.01
When a Unit is Selected to Fight
Each time a unit is selected to fight, select one fight type that unit is eligible to make, and resolve it with that unit. This can be one listed below, or one presented elsewhere:
```

### core-rule-12-06-overrun-fight — OVERRUN FIGHT

Category: restored.

Old effective text:

```text
ELIGIBLE IF: Your unit is unengaged, or was unengaged at the start of the Fight step but became engaged during the Fight phase.
EFFECT: Your unit can make one additional pile-in move, then fights as described in Making Attacks (04).
OVERRUN FIGHTS
When a unit makes an overrun fight, its models can be moved such that enemy units that were unengaged become engaged. Such enemy units become eligible to fight this phase (and may even be able to fight next if they are Fights First units).
```

Candidate text:

```text
ELIGIBLE IF: Your unit is unengaged, or was unengaged at the start of the Fight step but became engaged during the Fight phase.
EFFECT: Your unit can make one additional pile-in move, then fights as described in Making Attacks (04).
OVERRUN FIGHTS
When a unit makes an overrun fight, its models can be moved such that enemy units that were unengaged become engaged. Such enemy units become eligible to fight this phase (and may even be able to fight next if they are Fights First units).
NORMAL FIGHT
Players alternate selecting units to fight. Fights First units must be selected before any other eligible units.
• The RED player selects their MONSTER to fight. It makes a normal fight, destroying the TRANSPORT.
• The embarked unit makes an emergency disembark move. After doing so, it is unengaged.
OVERRUN FIGHT
• The BLUE player has no Fights First units, so the RED player selects their next unit.
• The RED player selects another Fights First unit. This unit is unengaged, but was engaged with the TRANSPORT at the start of the Fight step, so can make an overrun fight. It first makes a pile-in move to engage the unit that disembarked, then fights, destroying two enemy models.
• The BLUE player’s unit fights back, but inflicts no damage.
```

### core-rule-12-07-consolidate — 4. Consolidate

Category: presentation / EXPLICIT_SAME_SECTION_OWNERSHIP_REDISTRIBUTION.

Old effective text:

```text
Both players make consolidation moves (see below) with all of their eligible units they choose to move. The ‘Eligible If’ section describes which units are eligible to make such moves. The player whose turn it is resolves all of their moves first, followed by their opponent. Each unit cannot make more than one consolidation move during this step.
NEW FOES TO FACE
While using the engaging consolidation mode, your unit can end its consolidation move engaged with enemy units that have not yet fought this phase. If so, each of those enemy units will have an opportunity to fight your unit, so think carefully about how aggressively you want to move your unit using this mode.
```

Candidate text:

```text
Both players make consolidation moves (see below) with all of their eligible units they choose to move. The ‘Eligible If’ section describes which units are eligible to make such moves. The player whose turn it is resolves all of their moves first, followed by their opponent. Each unit cannot make more than one consolidation move during this step.
```

### core-rule-13-05-dense — Dense

Category: restored.

Old effective text:

```text
Dense terrain is an obstacle to even the largest war machines, and can shelter entire squads from enemy sight.
Examples: Buildings, ruins, armoured containers, woods.
A mission’s deployment map may define which terrain categories should be present within each terrain area. Meeting these requirements will create the best gaming experience. Note that terrain features sharing the same terrain area can belong to different terrain categories.
```

Candidate text:

```text
Dense terrain is an obstacle to even the largest war machines, and can shelter entire squads from enemy sight.
Examples: Buildings, ruins, armoured containers, woods.
A mission’s deployment map may define which terrain categories should be present within each terrain area. Meeting these requirements will create the best gaming experience. Note that terrain features sharing the same terrain area can belong to different terrain categories.

TERRAIN PLACED ON A MAT
Two terrain features have been placed on a mat. The edges of this mat define the boundary of this terrain area. Both terrain features are ruins, so use the rules for dense terrain features.
TERRAIN PLACED ON THE BATTLEFIELD
Three terrain features have been placed directly on the battlefield. The players have agreed on the boundary of the terrain area defined by these features (the shaded rectangle). The BLUE
features are dense terrain features and the RED
feature is a light terrain feature.
```

### core-rule-13-06-terrain-and-movement — Terrain and Movement

Category: restored.

Old effective text:

```text
Models can move through different categories of terrain feature as follows:
• Exposed/Light: All models can move horizontally and vertically through exposed and light terrain features.
• Dense:
• INFANTRY/BEASTS/SWARM/MOBILE models can move horizontally through dense terrain features.
• INFANTRY/BEASTS/SWARM models can move vertically through dense terrain features.
• Other models can move horizontally through dense terrain features provided that all sections of that terrain feature that the moving model’s base would move through are 2" or less in height. Otherwise, the moving model must move vertically to ascend or descend such sections. They cannot move through ceilings and floors while doing so, and they cannot end that move on any surface of that terrain feature that is not on ground level (see below).
SEE ALSO
• Solid Terrain and Movement 13.06.01
```

Candidate text:

```text
Models can move through different categories of terrain feature as follows:
• Exposed/Light: All models can move horizontally and vertically through exposed and light terrain features.
• Dense:
• INFANTRY/BEASTS/SWARM/MOBILE models can move horizontally through dense terrain features.
• INFANTRY/BEASTS/SWARM models can move vertically through dense terrain features.
• Other models can move horizontally through dense terrain features provided that all sections of that terrain feature that the moving model’s base would move through are 2" or less in height. Otherwise, the moving model must move vertically to ascend or descend such sections. They cannot move through ceilings and floors while doing so, and they cannot end that move on any surface of that terrain feature that is not on ground level (see below).
SEE ALSO
• Solid Terrain and Movement 13.06.01
Moving Vertically
Models can move vertically to ascend or descend terrain features. While doing so:
• That model must remain within 1/2" horizontally of that terrain feature.
• Add the distance moved vertically up, and the distance moved vertically down, to any other distance that model has moved since its unit began that move.
PLUNGING FIRE
As well as gaining superior lines of sight, models that ascend tall terrain features can benefit from the Plunging Fire rule (22.05).
Setting Up or Ending a Move
Models can be set up or end a move on the ground level of terrain features. Models can also be set up or end a move on any surface of a terrain feature that is not on ground level, if all of the following apply:
• That model has one or more of the following keywords: INFANTRY/BEASTS/SWARM/FLY/MONSTER.
• After ending that move, that model is stable and no part of its base overhangs the outer edge of that surface.
SOLID TERRAIN
If a terrain feature has the Solid rule (13.11), as dense terrain features do, a model cannot end a move such that any part of it is through any enclosed part of that terrain feature that is 3" or less from ground level – not even through small openings such as doors and windows. This ensures that protruding elements of models cannot be used to circumvent the visibility restrictions of the Solid rule.
TERRAIN AND MOVEMENT
A
All sections of this dense terrain feature are more than 2" in height, so this MONSTER model cannot move through it and must move around it instead.
B
These INFANTRY models can move through dense terrain features, such as the walls of this ruin.
A
This INFANTRY model is not being moved over or through any terrain features. Its move through the terrain area shown is therefore unimpeded.
B
This INFANTRY model can move vertically and end its move on the top surface of this terrain feature, as it is stable and no part of its base overhangs the outer edge of that surface.
C
This VEHICLE model cannot move through this dense terrain feature, but It can move vertically to ascend and descend sections that are more than 2" in height (provided it does not end that move on top of such sections).
```

### core-rule-13-11-01-gone-to-ground — Gone to Ground

Category: restored.

Old effective text:

```text
Hidden models that are concealed by dense terrain features gain an extra benefit while they have gone to ground.
A model has gone to ground while all of the following apply:
• That model is hidden.
• That model is not fully visible to the attacking model due to one or more intervening dense terrain features.
• That model’s unit did not make one or more ranged attacks during this turn or during the previous turn.
While a model has gone to ground, subtract 3" from that model’s detection range.
Designer’s Note: Units that made ranged attacks in the current or previous turn cannot go to ground, regardless of any abilities that allow them to shoot and remain hidden.
```

Candidate text:

```text
Hidden models that are concealed by dense terrain features gain an extra benefit while they have gone to ground.
A model has gone to ground while all of the following apply:
• That model is hidden.
• That model is not fully visible to the attacking model due to one or more intervening dense terrain features.
• That model’s unit did not make one or more ranged attacks during this turn or during the previous turn.
While a model has gone to ground, subtract 3" from that model’s detection range.
Designer’s Note: Units that made ranged attacks in the current or previous turn cannot go to ground, regardless of any abilities that allow them to shoot and remain hidden.
BENEFIT OF COVER
When Unit E makes ranged attacks:
• Unit A is fully visible to every model in Unit E, so does not have the benefit of cover.
• Not all of the models in unit B are within a terrain area, so unit B does not have the benefit of cover.
• All of the models in unit C are within a terrain area, so unit C has the benefit of cover.
• Unit D is not fully visible to unit E due to an intervening obscuring terrain area, so unit D has the benefit of cover.
HIDDEN AND OBSCURING
• There is an obscuring terrain area between all models in units A and D, so none of them are visible to each other.
• All models in units B and C are within the terrain area and are INFANTRY, so are hidden. However, unit D’s models are within the 15" detection range of unit B’s models (but not unit C’s), so unit B’s models are visible to unit D’s. Unit D’s models are also visible to the models in units B and C, since they are not within a terrain area.
SOLID
Units A and B are not visible to each other, because even though there is a window in this dense terrain feature, it has the Solid rule, so line of sight cannot be drawn through such enclosed gaps that are 3" or less from ground level.
Units A and C are visible to each other, because even though this dense terrain feature has the Solid rule, line of sight can be drawn normally through enclosed gaps that are more than 3" from ground level.
```

### core-rule-14-03-secured-objectives — Secured Objectives

Category: restored.

Old effective text:

```text
Some rules allow an objective to be secured by a player’s army. When an objective is secured by a player’s army, that objective remains under their control – even once they no longer have any units within range of it – until their opponent’s level of control over that objective is greater than theirs at the end of a phase.
```

Candidate text:

```text
Some rules allow an objective to be secured by a player’s army. When an objective is secured by a player’s army, that objective remains under their control – even once they no longer have any units within range of it – until their opponent’s level of control over that objective is greater than theirs at the end of a phase.
CONTROLLING A TERRAIN OBJECTIVE
Both players add together the OC characteristics of all their models that are within the terrain area. The BLUE
player’s level of control is 5, and the RED
player’s level of control is 6. The RED
player therefore controls the objective.
A
This VEHICLE has an OC characteristic of 3, and it is within the terrain area.
B
This VEHICLE has an OC characteristic of 2, and it is wholly within the terrain area.
C
The models in this unit each have an OC characteristic of 1. Six of its models are within the terrain area.
D
This unit is currently
battle-shocked, so the OC characteristic of all of its models is ‘-’.
```

### core-rule-15-01-using-stratagems — Using Stratagems

Category: restored.

Old effective text:

```text
During the battle, both players can use stratagems. Each stratagem states:
• How many CP it costs to use.
• WHEN: When it can be used.
• TARGET: Which units it can target.
• EFFECT: What the effects of using that stratagem are.
• RESTRICTIONS: Any additional restrictions that apply.
Each player can use the same stratagem multiple times during the battle, but the following restrictions apply:
• Each player cannot use the same stratagem more than once in the same phase.
• Unless otherwise stated, each player cannot target the same unit with more than one stratagem in the same phase.
Each time you use a stratagem, resolve the following sequence:
• Select targets as described in that stratagem.
• Reduce your CP total by the CP cost listed in that stratagem. If that stratagem contains a section that carries an additional CP cost (e.g. +1CP), you can only use that additional section if you increase the CP cost of that stratagem by the amount shown. If you do not have enough CP remaining, you cannot use that stratagem.
• Resolve the effects of that stratagem.
SEE ALSO
• Rules Sequencing 01.03.02
• Modifying CP Cost 15.01.01
• Affected By A Stratagem 15.01.02
• Stratagem Definitions 15.01.03
Some stratagems feature optional conditions that carry on additional CP cost. This can depend on the effect you select (see HEROIC INTERVENTION stratagem for example) or other variables such os the keywords of the unit being targeted.
```

Candidate text:

```text
During the battle, both players can use stratagems. Each stratagem states:
• How many CP it costs to use.
• WHEN: When it can be used.
• TARGET: Which units it can target.
• EFFECT: What the effects of using that stratagem are.
• RESTRICTIONS: Any additional restrictions that apply.
Each player can use the same stratagem multiple times during the battle, but the following restrictions apply:
• Each player cannot use the same stratagem more than once in the same phase.
• Unless otherwise stated, each player cannot target the same unit with more than one stratagem in the same phase.
Each time you use a stratagem, resolve the following sequence:
• Select targets as described in that stratagem.
• Reduce your CP total by the CP cost listed in that stratagem. If that stratagem contains a section that carries an additional CP cost (e.g. +1CP), you can only use that additional section if you increase the CP cost of that stratagem by the amount shown. If you do not have enough CP remaining, you cannot use that stratagem.
• Resolve the effects of that stratagem.
SEE ALSO
• Rules Sequencing 01.03.02
• Modifying CP Cost 15.01.01
• Affected By A Stratagem 15.01.02
• Stratagem Definitions 15.01.03
Some stratagems feature optional conditions that carry on additional CP cost. This can depend on the effect you select (see HEROIC INTERVENTION stratagem for example) or other variables such os the keywords of the unit being targeted.
Core Stratagems
All players can use core stratagems (see below). Additional stratagems can be found in Codexes and other publications.
Stratagems Key
Used in:
Either player’s turn
Used in:
Your turn
Used in:
Opponent’s turn
```

### core-rule-15-09-snap-shooting — SNAP SHOOTING

Category: sourcechanged.

Old effective text:

```text
ELIGIBLE IF: As stated in the rule allowing this shooting type.
EFFECT: Your unit shoots as described in Making Attacks (04).
WHILE SHOOTING:
• You can only target one visible enemy unit within 24" of your unit (and only if it is an eligible target).
• Each attack only hits on an unmodified hit roll of 6 (irrespective of the attacking weapon’s BS characteristic or any modifiers).
• You cannot re-roll hit rolls.
AFTER SHOOTING: Until the end of the phase, your unit is not eligible to start an action.
```

Candidate text:

```text
ELIGIBLE IF: As stated in the rule allowing this shooting type.
EFFECT: Your unit shoots as described in Making Attacks (04).
WHILE SHOOTING:
• You can only target one visible enemy unit within 24" of your unit (and only if it is an eligible target).
• Each attack only hits on an unmodified hit roll of 6 (irrespective of the attacking weapon’s BS characteristic or any modifiers). Those hits are not critical hits.
• You cannot re-roll hit rolls.
AFTER SHOOTING: Until the end of the phase, your unit is not eligible to start an action.
```

### core-rule-16-01-performing-actions — Performing Actions

Category: restored.

Old effective text:

```text
Some rules allow units to perform actions. Each action states:
• STARTS: When it is started.
• UNITS: Which friendly units can perform it.
• USE LIMIT: How many times friendly units can start it.
• COMPLETES: When it completes.
• EFFECT: What the effects of completing it are.
• Any additional restrictions that may apply.
WHERE TO FIND ACTIONS
The actions players can use can be found in other publications such as mission packs. All players can use core actions, while other actions may have restrictions such as army faction.
```

Candidate text:

```text
Some rules allow units to perform actions. Each action states:
• STARTS: When it is started.
• UNITS: Which friendly units can perform it.
• USE LIMIT: How many times friendly units can start it.
• COMPLETES: When it completes.
• EFFECT: What the effects of completing it are.
• Any additional restrictions that may apply.
WHERE TO FIND ACTIONS
The actions players can use can be found in other publications such as mission packs. All players can use core actions, while other actions may have restrictions such as army faction.
Starting an Action
A unit is eligible to start an action unless one or more of the following apply to that unit:
• It is not on the battlefield.
• It is an AIRCRAFT/FORTIFICATION unit.
• It is battle-shocked.
• It has an OC characteristic of 0 or ‘-’.
• It is engaged (unless it is a TITANIC unit).
• It made an advance or fall-back move this turn.
• It started another action this turn.
If a unit starts an action, until the end of the turn:
• It is not eligible to shoot (excluding TITANIC units).
• It is not eligible to declare a charge.
Completing an Action
If a unit performing an action makes a move (excluding pile-in and consolidation moves) or leaves the battlefield, that unit does not complete that action. Otherwise, when an action is completed, its ‘Effect’ section is triggered.
Example action for illustrative purposes only.
```

### core-rule-18-07-shock-disembark-move — SHOCK DISEMBARK MOVE

Category: sourcechanged.

Old effective text:

```text
SET-UP DISTANCE: 3"
ELIGIBLE IF:
• Embarked within a TRANSPORT on the battlefield
• Did not embark within that TRANSPORT this phase
EFFECT: Set up as described in Set Up (03.02).
WHILE MOVING: Set up each model wholly within the set-up distance of that TRANSPORT.
AFTER MOVING: Each model that started this move engaged with an enemy unit must still be engaged with that enemy unit. If one or more enemy units engaged with your unit have not been selected to fight this phase, your opponent must select each of those units, one at a time; when each is selected, it becomes eligible to fight and is selected to fight.
```

Candidate text:

```text
SET-UP DISTANCE: 3"
ELIGIBLE IF:
• Embarked within a TRANSPORT on the battlefield
• Did not embark within that TRANSPORT this phase
EFFECT: Set up as described in Set Up (03.02).
WHILE MOVING: Set up each model wholly within the set-up distance of that TRANSPORT.
AFTER MOVING: Your unit is not eligible to declare a charge until the end of the turn.
```

### core-rule-19-01-forming-attached-units — Forming Attached Units

Category: presentation / EXPLICIT_SAME_SECTION_OWNERSHIP_REDISTRIBUTION.

Old effective text:

```text
Some units have the Leader or Support ability listed on their datasheet (see below). Such units are known as leader units and support units respectively. Both of these abilities allow such units to lead other friendly units (known as bodyguard units) to form attached units. An attached unit is a single unit for all rules purposes. Leader and support units can only lead specific bodyguard units, as listed in the datasheet.
SEE ALSO
• Attached Units After Their Bodyguard Unit is Destroyed 19.01.01
```

Candidate text:

```text
Some units have the Leader or Support ability listed on their datasheet (see below). Such units are known as leader units and support units respectively. Both of these abilities allow such units to lead other friendly units (known as bodyguard units) to form attached units. An attached unit is a single unit for all rules purposes. Leader and support units can only lead specific bodyguard units, as listed in the datasheet.
```

### core-rule-20-03-advanced-arriving-from-strategic-reserves — Arriving from Strategic Reserves

Category: presentation / EXPLICIT_SAME_SECTION_OWNERSHIP_REDISTRIBUTION.

Old effective text:

```text
To arrive on the battlefield, each strategic reserves unit must make an ingress move (see below). Unless otherwise stated, they can only do so from the second battle round onwards.
At the end of the third battle round, unless otherwise stated, all strategic reserves units that have not made one or more ingress moves are destroyed, with the following exceptions:
• Units embarked within TRANSPORTS that have made an ingress move during the battle.
• Repositioned units (see above).
SEE ALSO
• Not on the Battlefield 01.02.04
• Persisting Rules Effects 01.02.02
• Setting Up Large Models 03.02.02
• Set Up As Reinforcements 20.03.01
```

Candidate text:

```text
To arrive on the battlefield, each strategic reserves unit must make an ingress move (see below). Unless otherwise stated, they can only do so from the second battle round onwards.
```

### core-rule-21-01-surge-moves — Surge Moves

Category: presentation / EXPLICIT_SAME_SECTION_OWNERSHIP_REDISTRIBUTION.

Old effective text:

```text
Some rules allow a unit to make a surge move, as described below.
SEE ALSO
• Rules Sequencing 01.03.02
MAKING A SURGE MOVE
• Unit A shoots, and destroys two models from unit B.
• Unit B has an ability that allows it to make a surge move of D6" after an enemy unit has shot, if one or more of its models were destroyed by those attacks. The active player rolls one D6, resulting in a 4.
• Unit B makes a surge move, each of its surviving models moving up to 4" towards the closest enemy unit (unit C). It ends this move engaged with that unit.

TAKING TO THE SKIES
• This Riptide Battlesuit can FLY. It makes an advance move with a maximum distance of 16".
• Before moving the unit, the active player declares that it will take to the skies. That move’s maximum distance is reduced to 14", but while making that move, the Riptide Battlesuit can move through all enemy units (including VEHICLES) and all terrain features, ignoring any vertical distance that would normally be counted to ascend and descend terrain features.
```

Candidate text:

```text
Some rules allow a unit to make a surge move, as described below.
```

### core-rule-21-02-surge-move — SURGE MOVE

Category: sourcechanged.

Old effective text:

```text
SET-UP DISTANCE: As stated in the rule allowing this move type.
ELIGIBLE IF: All of the following apply:
• The rule allowing this move type has been triggered.
• Your unit is not battle-shocked.
• Your unit is unengaged.
• Your unit has not moved this phase.
EFFECT: Your unit moves as described in Moving (03).
BEFORE MOVING: Select the closest enemy unit to be the surge target.
WHILE MOVING:
• Each model must end its move engaged with the surge target if possible.
• Each model that cannot end its move engaged with the surge target must end its move as close as possible to the surge target.
AFTER MOVING:
• Your unit cannot be engaged with one or more enemy units that were not the surge target.
• Your unit cannot move again this phase.
```

Candidate text:

```text
MAXIMUM DISTANCE: As stated in the rule allowing this move type.
ELIGIBLE IF: All of the following apply:
• The rule allowing this move type has been triggered.
• Your unit is not battle-shocked.
• Your unit is unengaged.
• Your unit has not moved this phase.
EFFECT: Your unit moves as described in Moving (03).
BEFORE MOVING: Select the closest enemy unit to be the surge target.
WHILE MOVING:
• Each model must end its move engaged with the surge target if possible.
• Each model that cannot end its move engaged with the surge target must end its move as close as possible to the surge target.
AFTER MOVING:
• Your unit cannot be engaged with one or more enemy units that were not the surge target.
• Your unit cannot move again this phase.
SEE ALSO
• Rules Sequencing 01.03.02
MAKING A SURGE MOVE
• Unit A shoots, and destroys two models from unit B.
• Unit B has an ability that allows it to make a surge move of D6" after an enemy unit has shot, if one or more of its models were destroyed by those attacks. The active player rolls one D6, resulting in a 4.
• Unit B makes a surge move, each of its surviving models moving up to 4" towards the closest enemy unit (unit C). It ends this move engaged with that unit.
```

### core-rule-22-05-plunging-fire — Plunging Fire

Category: restored.

Old effective text:

```text
Each time a model makes a ranged attack that targets a visible unit containing one or more models on ground level, if one or more of the following conditions apply, improve the BS characteristic of that attack by 1:
• The attacking model is on a section of a terrain feature that is 3" or more in height.
• The attacking model has the TOWERING keyword and the target unit is within 12".
```

Candidate text:

```text
Each time a model makes a ranged attack that targets a visible unit containing one or more models on ground level, if one or more of the following conditions apply, improve the BS characteristic of that attack by 1:
• The attacking model is on a section of a terrain feature that is 3" or more in height.
• The attacking model has the TOWERING keyword and the target unit is within 12".
PLUNGING FIRE
A
This attacking model is on ground level, but has the TOWERING keyword. The target unit is within 12" and contains models on ground level, so Plunging Fire improves the BS characteristic of those attacks by 1.
B
All of these attacking models are on a section of terrain feature that is 3" or more in height, and the target unit contains models on ground level, so Plunging Fire improves the BS characteristic of those attacks by 1.
```

## Protected entries and provenance limits

- Original 2026-09-25 RAW HTML is absent from Git. The accepted pinned corpus transcription is the old-source comparison; the fresh 2026-11-11 HTML is checked independently.
- Executing the unchanged old importer against the same fresh HTML proves a structural extraction omission, not historical equality of the September and November webpages. Each restored addition records its old global witness or exact legacy extraction boundary and fresh public text DOM path.
- sourcechanged describes a difference from that accepted transcription with fresh same-owner RAW support; it does not claim an independently re-downloaded 2026-09-25 webpage. Only the owner-approved changed-rule scope is admitted.

Raw Waha differences behind preserved baseline entries: 5; full old/new raw transcriptions are in the JSON report. They do not authorize replacing stronger official entries.

## Violations

None.
