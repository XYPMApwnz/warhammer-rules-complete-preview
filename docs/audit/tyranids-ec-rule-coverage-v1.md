# Tyranids and Emperor's Children reviewed text coverage

Baseline: `c0fab930a4f45ba05c33b66834fbf979518d91ef`.

The producer-only shared module consumes explicit, source-fingerprinted book
reviews. It adds non-executable clauses through the existing contract builder,
recipient declarations and finalizer. It does not infer recipients from prose.
No presentation, compatibility, condition evaluator or effect executor changes
are part of this task.

The owner explicitly approved new BATTLE_ONLY conditional rows and the resulting
UNKNOWN-to-MATCH/CONDITIONAL compatibility changes. Existing effects, source
identities, physical choices, import results and gameplay values remain protected.

## Existing test expectation changes

| File | Before | After | Reason and independent evidence |
| --- | --- | --- | --- |
| `books/tyranids/v2/app-qa.mjs` | 19 contract IDs and reported contracts | 176 | All source paragraphs now have contracts; the original 19 contracts remain byte-identical. The new coverage QA separately protects their reviewed SHA-256 fingerprints. |
| `v2/fixtures/new-recruit-plain-header.json`, Tyranids observation | `b197971cdf934bcf43eda055ffd2ad0d6b666a01ced8e0500eb80c53054bdd3b` | `d386779c13696c3e07b129267edc1477e79575adb49e9ad16f0454ed3bd99837` | Exactly six approved conditional rows: Resilient Organism and damaged profile for each of three Tyrannofex instances. Independent baseline comparison confirmed complete import, state, points and every other projection byte unchanged. Assertions and negative controls remain intact. |

## Source-review boundaries

The source typo `excluding MONSTERS models` on Regenerating Monstrosity remains
literal. Its carrier selector preserves the existing import producer's conservative
MONSTER exclusion. Its text recipient is not guessed. Other unresolved source
recipients remain unrecorded and are listed in the detailed review.

Surprise Assault retains its existing executable contract, including its original
paragraph boundary and deferred text. This task does not rewrite accepted
executable clauses to split additional sentences.

`text-rule-review.json` contains every exact paragraph, classification reason and
explicit Enhancement carrier restriction. `text-rule-baseline.json` protects the
accepted executable contracts and clauses. Both inputs are producer/test data;
neither introduces a second runtime or public execution mechanism.

## Final coverage

| Book | Enhancements | Detachment rules | Army rules | ABILITIES blocks | Contracts |
| --- | --- | --- | --- | --- | --- |
| Tyranids | 11/34 → 34/34 | 3/11 → 11/11 | 0/2 → 2/2 | 9/79 → 79/79 | 19 → 176 |
| Emperor's Children | 16/34 → 34/34 | 2/11 → 11/11 | 0/2 → 2/2 | 7/41 → 41/41 | 26 → 110 |

Named, damaged, Leader, Transport and Unit Composition source paragraphs are also covered. Army roots retain their canonical component owners; no synthetic source text is created.

## EC additions to existing contracts

| Contract | Added clauses | Existing clauses byte-identical |
| --- | --- | --- |
| datasheet-lord-exultant:section:1 | text-coverage:/blocks/1/text | Yes |
| datasheet-lord-kakophonist:section:1 | text-coverage:/blocks/1/text | Yes |
| datasheet-daemonettes:section:1 | text-coverage:/blocks/0/text | Yes |
| datasheet-seekers:section:1 | text-coverage:/blocks/0/text | Yes |
| datasheet-keeper-of-secrets:section:1 | text-coverage:/blocks/0/text, text-coverage:/blocks/1/text | Yes |

## Additional existing-test expectation changes

| File | Before | After | Reason |
| --- | --- | --- | --- |
| `books/emperors-children/v2/app-qa.mjs` | 26 contract IDs and reported contracts | 110 | Complete text coverage; original executable clauses and operations protected separately. |
| `v2/fixtures/new-recruit-plain-header.json`, EC observation | `c88a5efd9574826c8f7d28f3717b9df11812ea47ded15b1f371dadf92d169f06` | `2c7517a0060c2c3e651547aefb9591ddae8fe44204ffc654e4818cff11744675` | Three approved Horrifying Beauty conditional rows, one per Daemonettes instance. Complete import, state, points and every other observation byte unchanged. |
| `v2/fixtures/new-recruit-export.json`, EC Keeper of Secrets / expectedGameSha256 | `cc274b42e62032ebe508baf20daf2c0a217c53e2354cfdef57a46f367dc316ed` | `5fa226d0777c55402ee502836bb45672be24c4e9f3ab494d561844b87fe966b2` | Exactly three approved conditional rows (friendly aura, Mesmerising Form, damaged profile). Full independent source-baseline comparison confirmed unchanged applied effects, fields, abilities and source identities for compact, row, loadout and absent formats. |
| `v2/fixtures/new-recruit-export.json`, EC Keeper of Secrets / expectedAbsentGameSha256 | `41bf377306e668d25c3c6f0852e7d0f10fe556e70bebe3563aa68e36b9627d97` | `d81e516fc855da61215e90fc7aadc36b08542c9040ad4523a12dc888c9b75134` | Exactly three approved conditional rows (friendly aura, Mesmerising Form, damaged profile). Full independent source-baseline comparison confirmed unchanged applied effects, fields, abilities and source identities for compact, row, loadout and absent formats. |

No existing assertion, expected import result or gameplay value was removed or weakened. Source pins were not changed.

## New reviewed text recipients

These rows are explicit reviewed declarations. PHYSICAL recipients remain owner-only; FORMED recipients can reach the other component only in the actual attachment group. Battle conditions stay literal text. No Detachment/Army/table source receives a fabricated physical source unit.

| Book | Rule / source paragraph | Literal evidence | Recipient | Reason |
| --- | --- | --- | --- | --- |
| tyranids | Synaptic Strategy — `detachment-subterranean-assault:enhancement:1` | target the bearer’s unit | UNIT SOURCE_UNIT FORMED | Permission expressly targets the bearer’s unit, including its attached formation. |
| tyranids | Vanguard Intellect — `detachment-subterranean-assault:enhancement:3` | The bearer’s unit can be set up | UNIT SOURCE_UNIT FORMED | Reserve arrival permission belongs to the bearer’s whole unit. |
| tyranids | Perfectly Adapted — `detachment-invasion-fleet:enhancement:2` | made for the bearer | UNIT SOURCE_UNIT PHYSICAL | Reroll permission is limited to rolls made for the bearer. |
| tyranids | Synaptic Linchpin — `detachment-invasion-fleet:enhancement:3` | While a friendly TYRANIDS unit is within 9" of the bearer, that unit | UNIT SOURCE_UNIT FORMED | Friendly-unit aura may affect a formed friendly unit; no range or keyword evaluation is introduced. |
| tyranids | Synaptic Control — `detachment-synaptic-nexus:enhancement:3` | Each time an attack is allocated to the bearer | UNIT SOURCE_UNIT PHYSICAL | Damage reduction protects only the bearer, not attached Bodyguard models. |
| tyranids | Instinctive Defence — `detachment-assimilation-swarm:enhancement:2` | models in the bearer’s unit have the Fights First ability | UNIT SOURCE_UNIT FORMED | Both Heroic Intervention permission and Fights First are expressly local-unit effects; proximity remains text. |
| tyranids | Biophagic Flow (Aura) — `detachment-assimilation-swarm:enhancement:3` | While a friendly HARVESTER model is within 12" of the bearer | UNIT SOURCE_UNIT FORMED | Friendly aura has formed-unit presentation scope; HARVESTER restriction and regeneration target remain source text, never an executable local grant. |
| tyranids | Enraged Reserves — `detachment-crusher-stampede:enhancement:2` | If the bearer is destroyed by a melee attack | UNIT SOURCE_UNIT PHYSICAL | Fight-on-death is limited to the destroyed bearer. |
| tyranids | Null Nodules — `detachment-crusher-stampede:enhancement:3` | the bearer has the Feel No Pain 5+ ability against Psychic Attacks | UNIT SOURCE_UNIT PHYSICAL | The temporary defense belongs solely to the bearer. |
| tyranids | Monstrous Nemesis — `detachment-crusher-stampede:enhancement:4` | Each time the bearer makes a melee attack | UNIT SOURCE_UNIT PHYSICAL | The conditional attack modifier belongs solely to the bearer. |
| tyranids | Stalker — `detachment-vanguard-onslaught:enhancement:3` | Each time the bearer makes an attack that targets that enemy unit | UNIT SOURCE_UNIT PHYSICAL | Selected enemy is the attack target; the beneficiary is expressly the bearer. |
| tyranids | Piercing Talons — `detachment-unending-swarm:enhancement:3` | Each time a model in the bearer’s unit makes an attack | UNIT SOURCE_UNIT FORMED | Attacking models in the bearer’s unit includes attached Bodyguards; Broodlord with Genestealers is the required positive. |
| tyranids | Adrenalised Onslaught — `detachment-unending-swarm:enhancement:4` | Each time the bearer’s unit Piles In or Consolidates, models in this unit | UNIT SOURCE_UNIT FORMED | Additional movement belongs to all models in the bearer’s formed unit. |
| tyranids | Encircling Horrors — `detachment-ambush-predators:enhancement:1` | this unit can make a normal move | UNIT SOURCE_UNIT FORMED | Unit upgrade explicitly grants movement to this unit, without resolving its battle trigger. |
| tyranids | Ocular Adaptation — `detachment-warrior-bioform-onslaught:enhancement:2` | This unit’s melee attacks have +1 to hit rolls | UNIT SOURCE_UNIT FORMED | Bearer is model-scoped but recipient is expressly this unit; no model-only downgrade. |
| tyranids | Blistering Assault — `datasheet-carnifexes:section:1/blocks/0` | this unit can make a surge move | UNIT SOURCE_UNIT FORMED | Explicit source-unit movement. |
| tyranids | This model cannot be your WARLORD. — `datasheet-deathleaper:section:3/blocks/0` | This model cannot be your WARLORD. | UNIT SOURCE_UNIT PHYSICAL | Warlord prohibition concerns this physical model only. |
| tyranids | While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll. — `datasheet-exocrine:section:3/blocks/0` | this model | UNIT SOURCE_UNIT PHYSICAL | Damage bracket and modifiers concern only this physical model; current wound state remains source text. |
| tyranids | Winged Swarm — `datasheet-gargoyles:section:1/blocks/0` | it can make a Normal move of up to 6" | UNIT SOURCE_UNIT FORMED | The preceding subject is this unit; movement and charge restriction apply to that unit. |
| tyranids | Vanguard Predator — `datasheet-genestealers:section:1/blocks/0` | Each time a model in this unit makes an attack | UNIT SOURCE_UNIT FORMED | Attack rerolls apply to models in the source unit, including a joined Leader. |
| tyranids | While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll. — `datasheet-harpy:section:3/blocks/0` | this model | UNIT SOURCE_UNIT PHYSICAL | Damage bracket and modifiers concern only this physical model; current wound state remains source text. |
| tyranids | Frenzied Metabolism — `datasheet-harridan:section:1/blocks/0` | each time this model makes an attack | UNIT SOURCE_UNIT PHYSICAL | Buff and subsequent mortal wounds both concern this model. |
| tyranids | While this model has 1-10 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll. — `datasheet-harridan:section:4/blocks/0` | this model | UNIT SOURCE_UNIT PHYSICAL | Damage bracket and modifiers concern only this physical model; current wound state remains source text. |
| tyranids | While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll. — `datasheet-haruspex:section:3/blocks/0` | this model | UNIT SOURCE_UNIT PHYSICAL | Damage bracket and modifiers concern only this physical model; current wound state remains source text. |
| tyranids | Apex-beast — `datasheet-hierophant:section:1/blocks/0` | Each time this model makes an attack | UNIT SOURCE_UNIT PHYSICAL | Attack modifier is model-only. |
| tyranids | Stalking Forward — `datasheet-hierophant:section:1/blocks/1` | Each time this model makes a Normal, Advance or Fall Back move | UNIT SOURCE_UNIT PHYSICAL | Movement permission is model-only. |
| tyranids | While this model has 1-10 wounds remaining, subtract 6 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll. — `datasheet-hierophant:section:4/blocks/0` | this model | UNIT SOURCE_UNIT PHYSICAL | Damage bracket and modifiers concern only this physical model; current wound state remains source text. |
| tyranids | Airborne Predator — `datasheet-hive-crone:section:1/blocks/0` | Each time this model makes a ranged attack | UNIT SOURCE_UNIT PHYSICAL | Attack modifier is model-only. |
| tyranids | While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll. — `datasheet-hive-crone:section:3/blocks/0` | this model | UNIT SOURCE_UNIT PHYSICAL | Damage bracket and modifiers concern only this physical model; current wound state remains source text. |
| tyranids | Defensive Stance — `datasheet-hive-guard:section:1/blocks/0` | Each time you target this unit with the Fire Overwatch Stratagem | UNIT SOURCE_UNIT FORMED | Stratagem permission applies expressly to the source unit. |
| tyranids | Onslaught (Aura, Psychic) — `datasheet-hive-tyrant:section:1/blocks/1` | While a friendly TYRANIDS unit is within 6" of this model | UNIT SOURCE_UNIT FORMED | Friendly-unit aura; no assumed proximity or unconditional ASSAULT/LETHAL HITS lowering. |
| tyranids | Bounding Leap — `datasheet-hormagaunts:section:1/blocks/0` | This unit is eligible to declare a charge | UNIT SOURCE_UNIT FORMED | Charge permission is source-unit scoped. |
| tyranids | While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll. — `datasheet-maleceptor:section:3/blocks/0` | this model | UNIT SOURCE_UNIT PHYSICAL | Damage bracket and modifiers concern only this physical model; current wound state remains source text. |
| tyranids | While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll. — `datasheet-mawloc:section:3/blocks/0` | this model | UNIT SOURCE_UNIT PHYSICAL | Damage bracket and modifiers concern only this physical model; current wound state remains source text. |
| tyranids | Neurocytes — `datasheet-neurogaunts:section:1/blocks/0` | While this unit is within Synapse Range | UNIT SOURCE_UNIT FORMED | Temporary keyword belongs to this unit; current Synapse Range remains unknown. |
| tyranids | Node Lash (Psychic) — `datasheet-neurotyrant:section:1/blocks/0` | While this model is leading a unit, each time a model in that unit makes an attack | UNIT SOURCE_UNIT FORMED | While-leading effect explicitly reaches models in the formed unit, including Neurogaunts/Tyrant Guard/Zoanthropes when attached. |
| tyranids | Singular Purpose — `datasheet-norn-assimilator:section:1/blocks/0` | each time this model makes an attack | UNIT SOURCE_UNIT PHYSICAL | Both optional branches benefit this model; selected enemy/objective is a condition, not a recipient. |
| tyranids | While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll. — `datasheet-norn-assimilator:section:3/blocks/0` | this model | UNIT SOURCE_UNIT PHYSICAL | Damage bracket and modifiers concern only this physical model; current wound state remains source text. |
| tyranids | Singular Purpose — `datasheet-norn-emissary:section:1/blocks/0` | each time this model makes an attack | UNIT SOURCE_UNIT PHYSICAL | Both optional branches benefit this model; selected enemy/objective is a condition, not a recipient. |
| tyranids | Unnatural Resilience — `datasheet-norn-emissary:section:1/blocks/1` | This model has the Feel No Pain 4+ ability against mortal wounds | UNIT SOURCE_UNIT PHYSICAL | Defense expressly belongs to this model. |
| tyranids | While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll. — `datasheet-norn-emissary:section:3/blocks/0` | this model | UNIT SOURCE_UNIT PHYSICAL | Damage bracket and modifiers concern only this physical model; current wound state remains source text. |
| tyranids | Alpha Leader — `datasheet-old-one-eye:section:1/blocks/0` | While this model is leading a unit, each time a model in that unit makes an attack | UNIT SOURCE_UNIT FORMED | Conditional reroll belongs to all attacking models in the led unit. |
| tyranids | Unstoppable Monster — `datasheet-old-one-eye:section:1/blocks/1` | this model regains up to D3 lost wounds | UNIT SOURCE_UNIT PHYSICAL | Regeneration belongs solely to Old One Eye, even while leading Carnifexes. |
| tyranids | Feeding Frenzy — `datasheet-psychophage:section:1/blocks/1` | Each time this model makes a melee attack | UNIT SOURCE_UNIT PHYSICAL | Attack modifiers belong only to this model. |
| tyranids | Death From Below — `datasheet-raveners:section:1/blocks/0` | you can remove it from the battlefield and place it into Strategic Reserves | UNIT SOURCE_UNIT FORMED | The subject is this unit, so an attached formation is the presentation recipient. |
| tyranids | Hive Defences — `datasheet-sporocyst:section:1/blocks/1` | You can target this model with the Fire Overwatch Stratagem for 0CP | UNIT SOURCE_UNIT PHYSICAL | Permission expressly targets this model. |
| tyranids | Skulking Horrors — `datasheet-termagants:section:1/blocks/0` | this unit can make a Normal move of up to D6" | UNIT SOURCE_UNIT FORMED | Reactive movement explicitly belongs to this unit. |
| tyranids | Brood Progenitor (Aura, Psychic) — `datasheet-tervigon:section:1/blocks/1` | While a friendly TERMAGANTS unit is within 6" of this model | UNIT SOURCE_UNIT FORMED | Friendly-unit aura; TERMAGANTS and proximity are preserved in text, not evaluated. |
| tyranids | While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll. — `datasheet-tervigon:section:3/blocks/0` | this model | UNIT SOURCE_UNIT PHYSICAL | Damage bracket and modifiers concern only this physical model; current wound state remains source text. |
| tyranids | Swallow Whole — `datasheet-the-red-terror:section:1/blocks/0` | this model regains up to D3+2 lost wounds | UNIT SOURCE_UNIT PHYSICAL | Weapon-specific critical wounds and healing both concern this model. |
| tyranids | Subterranean Hunter — `datasheet-the-red-terror:section:1/blocks/1` | you can remove it from the battlefield and place it into Strategic Reserves | UNIT SOURCE_UNIT FORMED | Explicit source-unit reserve movement. |
| tyranids | Domination of the Hive Mind (Aura) — `datasheet-the-swarmlord:section:1/blocks/2` | While a friendly TYRANIDS unit is within 9" of this model | UNIT SOURCE_UNIT FORMED | Friendly-unit Synapse aura; no range or Synapse condition is computed. |
| tyranids | Subterranean Tunnels — `datasheet-trygon:section:1/blocks/0` | this model can be set up anywhere on the battlefield | UNIT SOURCE_UNIT PHYSICAL | Arrival permission and charge restriction expressly concern this model. |
| tyranids | While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll. — `datasheet-trygon:section:3/blocks/0` | this model | UNIT SOURCE_UNIT PHYSICAL | Damage bracket and modifiers concern only this physical model; current wound state remains source text. |
| tyranids | Adaptive Instincts (Once per turn, per unit) — `datasheet-tyranid-warriors-with-melee-bio-weapons:section:1/blocks/0` | This unit’s melee attacks have +1 S. | UNIT SOURCE_UNIT FORMED | Both choices concern this unit, never just an attached Prime. |
| tyranids | Adaptable Predators — `datasheet-tyranid-warriors-with-ranged-bio-weapons:section:1/blocks/0` | This unit is eligible to shoot and declare a charge | UNIT SOURCE_UNIT FORMED | Explicit source-unit fall-back permissions. |
| tyranids | Resilient Organism — `datasheet-tyrannofex:section:1/blocks/0` | when an attack is allocated to this model | UNIT SOURCE_UNIT PHYSICAL | Single-use defense protects only this model. |
| tyranids | While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll. — `datasheet-tyrannofex:section:3/blocks/0` | this model | UNIT SOURCE_UNIT PHYSICAL | Damage bracket and modifiers concern only this physical model; current wound state remains source text. |
| tyranids | Pouncing Leap — `datasheet-von-ryans-leapers:section:1/blocks/0` | You can target this unit with the Heroic Intervention stratagem | UNIT SOURCE_UNIT FORMED | Permission expressly targets this unit. |
| tyranids | Warp Field (Aura, Psychic) — `datasheet-zoanthropes:section:1/blocks/1` | While a friendly TYRANIDS unit is within 6" of this unit | UNIT SOURCE_UNIT FORMED | Friendly-unit defensive aura may concern a formed unit; no save is automatically applied. |
| emperors-children | Pledge of Eternal Servitude — `detachment-coterie-of-the-conceited:enhancement:1` | set the bearer back up on the battlefield | UNIT SOURCE_UNIT PHYSICAL | Resurrection concerns the bearer alone. |
| emperors-children | Pledge of Unholy Fortune — `detachment-coterie-of-the-conceited:enhancement:4` | for a model in the bearer’s unit | UNIT SOURCE_UNIT FORMED | Changes a roll for a model in the bearer’s unit. |
| emperors-children | Dark Blessings — `detachment-carnival-of-excess:enhancement:2` | the bearer has a 3+ invulnerable save | UNIT SOURCE_UNIT PHYSICAL | Only the bearer receives the save. |
| emperors-children | Warp Walker — `detachment-carnival-of-excess:enhancement:4` | add 6" to the Move characteristic of models in that unit | UNIT SOURCE_UNIT FORMED | Bearer’s unit and its models receive both movement benefits. |
| emperors-children | Spearhead Striker — `detachment-rapid-evisceration:enhancement:2` | you can re-roll Charge rolls made for the bearer’s unit | UNIT SOURCE_UNIT FORMED | Both charge reroll and overwatch protection apply to bearer’s unit. |
| emperors-children | Blinding Speed — `detachment-peerless-bladesmen:enhancement:2` | models in the bearer’s unit have the Fights First ability | UNIT SOURCE_UNIT FORMED | Formation receives Fights First. |
| emperors-children | Rise to the Challenge — `detachment-peerless-bladesmen:enhancement:4` | the bearer can fight one additional time | UNIT SOURCE_UNIT PHYSICAL | Additional fight belongs only to bearer. |
| emperors-children | Eager to Prove — `detachment-slaaneshs-chosen:enhancement:1` | You can re-roll Charge rolls made for the bearer’s unit | UNIT SOURCE_UNIT FORMED | Reroll and conditional Move bonus concern bearer’s unit. |
| emperors-children | Proud and Vainglorious — `detachment-slaaneshs-chosen:enhancement:3` | You can re-roll Battle-shock and Leadership tests taken for the bearer’s unit | UNIT SOURCE_UNIT FORMED | Tests and conditional OC bonus concern bearer’s unit. |
| emperors-children | Steeped in Suffering — `detachment-mercurial-host:enhancement:1` | Each time a model in the bearer’s unit makes an attack | UNIT SOURCE_UNIT FORMED | Hit and Wound benefits attach to every model in bearer’s formed unit; enemy strength stays battle-only. |
| emperors-children | Intoxicating Musk — `detachment-mercurial-host:enhancement:2` | Each time a melee attack targets the bearer’s unit | UNIT SOURCE_UNIT FORMED | Source formation receives defensive benefit; comparison stays battle-only. |
| emperors-children | Icon of Excess — `datasheet-tormentors:section:1/blocks/1` | the bearer’s unit takes a Leadership test | UNIT SOURCE_UNIT FORMED | Bearer’s formed unit explicitly takes the test; CP award remains battle-only. |
| emperors-children | While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll. — `datasheet-keeper-of-secrets:section:3/blocks/0` | each time this model makes an attack | UNIT SOURCE_UNIT PHYSICAL | Explicit damaged source-model attack penalty; wounds threshold stays literal battle text. |
| emperors-children | No Prey Can Evade — `datasheet-shalaxi-helbane:section:1/blocks/0` | made for this model | UNIT SOURCE_UNIT PHYSICAL | Explicit source model. |
| emperors-children | Monarch of the Hunt — `datasheet-shalaxi-helbane:section:1/blocks/1` | Each time this model makes a melee attack that targets its quarry | UNIT SOURCE_UNIT PHYSICAL | Quarry selection is external condition, rerolls apply only source model’s attacks. |
| emperors-children | While this model has 1-7 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll. — `datasheet-shalaxi-helbane:section:3/blocks/0` | each time this model makes an attack | UNIT SOURCE_UNIT PHYSICAL | Explicit damaged source-model attack penalty; wounds threshold stays literal battle text. |
| emperors-children | If this model is in your army, it must be your WARLORD. — `datasheet-fulgrim:section:1/blocks/0` | it must be your WARLORD | UNIT SOURCE_UNIT PHYSICAL | Static source composition, attachment, transport or army-construction declaration. No roster operation is introduced. |
| emperors-children | Daemon Primarch of Slaanesh — `datasheet-fulgrim:section:2/blocks/1` | this model has that ability | UNIT SOURCE_UNIT PHYSICAL | Selected ability is granted only source model. |
| emperors-children | While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll. — `datasheet-fulgrim:section:4/blocks/0` | each time this model makes an attack | UNIT SOURCE_UNIT PHYSICAL | Explicit damaged source-model attack penalty; wounds threshold stays literal battle text. |
| emperors-children | Beguiling Form — `datasheet-fulgrim:section:5/blocks/0` | attack that targets this model | UNIT SOURCE_UNIT PHYSICAL | Only source model receives defensive benefit. |
| emperors-children | Daemonic Speed — `datasheet-fulgrim:section:5/blocks/1` | This model has the Fights First ability | UNIT SOURCE_UNIT PHYSICAL | Explicit source model. |
| emperors-children | Daemonic Patrons — `datasheet-flawless-blades:section:1/blocks/0` | each time a model in this unit makes an attack | UNIT SOURCE_UNIT FORMED | Benefits and failure cost apply models in source unit. |
| emperors-children | Lord of Excess — `datasheet-daemon-prince-of-slaanesh:section:1/blocks/0` | this model has the Lone Operative ability | UNIT SOURCE_UNIT PHYSICAL | Friendly infantry is proximity condition; source model alone benefits. |
| emperors-children | Excessive Vigour (Aura) — `datasheet-daemon-prince-of-slaanesh:section:1/blocks/1` | While a friendly SLAANESH unit is within 6" of this model | UNIT SOURCE_UNIT FORMED | Reviewed friendly aura; requested FORMED display scope, with charge/range conditions literal. |
| emperors-children | Ecstatic Death — `datasheet-daemon-prince-of-slaanesh:section:1/blocks/2` | This model can fight after the attacking unit | UNIT SOURCE_UNIT PHYSICAL | Source model receives fight-on-death. |
| emperors-children | Lethal Obsession — `datasheet-chaos-terminators:section:1/blocks/0` | This unit can re-roll that charge roll | UNIT SOURCE_UNIT FORMED | Enemy selection sets charge restriction but local source unit receives charge reroll. |
| emperors-children | Scuttling Horrors — `datasheet-chaos-spawn:section:1/blocks/0` | this unit can make a Normal move of up to 6" | UNIT SOURCE_UNIT FORMED | Explicit local unit reactive move. |
| emperors-children | Stimulated by Pain — `datasheet-daemon-prince-of-slaanesh-with-wings:section:1/blocks/1` | Each time an attack is allocated to this model | UNIT SOURCE_UNIT PHYSICAL | Only source model receives damage reduction. |
| emperors-children | Excessive Assault — `datasheet-infractors:section:1/blocks/0` | Each time a model in this unit targets an enemy unit with a melee attack | UNIT SOURCE_UNIT FORMED | Every model in source formation receives attack reroll. |
| emperors-children | Icon of Excess — `datasheet-infractors:section:1/blocks/1` | the bearer’s unit takes a Leadership test | UNIT SOURCE_UNIT FORMED | Bearer’s formed unit explicitly takes the test; CP award remains battle-only. |
| emperors-children | A Challenge Worthy of Skill — `datasheet-lucius-the-eternal:section:1/blocks/0` | Each time this model makes an attack | UNIT SOURCE_UNIT PHYSICAL | Only source model attacks receive rerolls. |
| emperors-children | Duellist’s Hubris — `datasheet-lucius-the-eternal:section:1/blocks/1` | if this model is not leading a unit | UNIT SOURCE_UNIT PHYSICAL | Only source model receives Fights First; retain negative leading condition. |
| emperors-children | Warped Interference (Psychic) — `datasheet-sorcerer:section:1/blocks/0` | While this model is leading a unit, each time a ranged attack targets that unit, models in it have the Benefit of Cover | UNIT SOURCE_UNIT FORMED | Explicit while-leading local formation; this is new text-only leader-ability fixture candidate. |
| emperors-children | While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll. — `datasheet-chaos-land-raider:section:4/blocks/0` | each time this model makes an attack | UNIT SOURCE_UNIT PHYSICAL | Explicit damaged source-model attack penalty; wounds threshold stays literal battle text. |
| emperors-children | While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll. — `datasheet-heldrake:section:3/blocks/0` | each time this model makes an attack | UNIT SOURCE_UNIT PHYSICAL | Explicit damaged source-model attack penalty; wounds threshold stays literal battle text. |
| emperors-children | Scuttling Walker — `datasheet-defiler:section:1/blocks/0` | Each time this unit makes a Normal, Advance or Fall Back move | UNIT SOURCE_UNIT FORMED | Explicit source-unit movement permission. |
| emperors-children | Revel in Desecration — `datasheet-defiler:section:1/blocks/1` | Each time this model makes an attack | UNIT SOURCE_UNIT PHYSICAL | Only source model attacks receive hit bonus. |
| emperors-children | While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll. — `datasheet-defiler:section:3/blocks/0` | each time this model makes an attack | UNIT SOURCE_UNIT PHYSICAL | Explicit damaged source-model attack penalty; wounds threshold stays literal battle text. |
| emperors-children | Glutton for Punishment — `datasheet-maulerfiend:section:1/blocks/0` | Each time this model makes an attack | UNIT SOURCE_UNIT PHYSICAL | Only source model attacks receive bonuses. |
| emperors-children | While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll. — `datasheet-maulerfiend:section:3/blocks/0` | each time this model makes an attack | UNIT SOURCE_UNIT PHYSICAL | Explicit damaged source-model attack penalty; wounds threshold stays literal battle text. |
| emperors-children | Daemon Lord of Slaanesh (Aura) — `datasheet-keeper-of-secrets:section:1/blocks/0` | While a friendly LEGIONS OF EXCESS unit is within 6" of this model | UNIT SOURCE_UNIT FORMED | Reviewed friendly aura; use FORMED per requested display scope, preserve range/keyword conditions as text. |
| emperors-children | Mesmerising Form — `datasheet-keeper-of-secrets:section:1/blocks/1` | Each time an attack targets this model | UNIT SOURCE_UNIT PHYSICAL | Only source model receives defensive benefit. |
| emperors-children | Unholy Speed — `datasheet-seekers:section:1/blocks/0` | You can re-roll Advance and Charge rolls made for this unit | UNIT SOURCE_UNIT FORMED | Explicit local unit. |
| emperors-children | Euphoric Strikes — `datasheet-lord-exultant:section:1/blocks/1` | melee weapons equipped by this model | UNIT SOURCE_UNIT PHYSICAL | Model-only attack buff; must not propagate to Infractors. |

## Unrecorded recipient ambiguities

| Rule / paragraph | Literal source | Reason / unresolved question |
| --- | --- | --- |
| `detachment-assimilation-swarm:enhancement:1/text` | TYRANIDS model only (excluding MONSTERS models). The bearer’s unit can be regenerated up to twice per phase, instead of once. | Source issue regenerating-monstrosity-legacy-assertion: accepted exclusion says MONSTERS; correction to MONSTER is not proven. Keep source conflict unrecorded despite clear local-unit wording. Is a source correction or an independently proven local recipient available? |
| `datasheet-mucolid-spores:section:1/blocks/1/text` | Floating Death: Each time this unit or an enemy unit ends a move, for each model in this unit that is within 3" of one or more enemy units, select one of those enemy units. That model in this unit is destroyed, then roll one D6: on a 2-5, that enemy unit suffers D3 mortal wounds; on a 6, that enemy unit suffers D6 mortal wounds. | Full block combines self-destruction of selected source models and damage to selected enemy units; a single UNIT role would blur different recipients. No clause split in this task. Is a source correction or an independently proven local recipient available? |
| `datasheet-spore-mines:section:1/blocks/1/text` | Floating Death: Each time this unit or an enemy unit ends a move, for each model in this unit that is within 3" of one or more enemy units, select one of those enemy units. That model in this unit is destroyed, then roll one D6: on a 2-5, that enemy unit suffers 1 mortal wound; on a 6, that enemy unit suffers D3 mortal wounds. | Full block combines self-destruction of selected source models and damage to selected enemy units; leave mixed recipient block unrecorded. Is a source correction or an independently proven local recipient available? |
| `datasheet-tyrannocyte:section:1/blocks/0/text` | Aerial Seeding: This model must start the battle in Reserves, but neither it nor any units embarked within it are counted towards any limits placed on the maximum number of Reserves units you can start the battle with. This model can be set up in the Reinforcements step of your first, second or third Movement phase, regardless of any mission rules. Any units embarked within this model must immediately disembark after it has been set up on the battlefield, and they must be set up more than 8" away from all enemy models. After this model has been set up on the battlefield, no units can embark within it. | Block combines model-only arrival and restrictions for external embarked units. A single source-unit role cannot represent all relationships. Is a source correction or an independently proven local recipient available? |
| `datasheet-venomthropes:section:1/blocks/0/text` | Foul Spores (Aura): Friendly TYRANIDS units within 6" of this unit have Stealth. | Source conflict tyranids-source-conflict-foul-spores: official update and FAQ contradictory. Do not establish a new aura recipient. Is a source correction or an independently proven local recipient available? |
| `datasheet-winged-hive-tyrant:section:1/blocks/1/text` | Paroxysm (Psychic): At the start of the Fight phase, you can select one enemy unit within 12" of and visible to this model and roll one D6: on a 1, this PSYKER suffers D3 mortal wounds; on a 2+, until the end of the phase, subtract 1 from the Attacks characteristic of weapons equipped by models in that unit. | Block combines self mortal wounds and enemy weapon attack reduction; leave mixed sides and scopes unrecorded. Is a source correction or an independently proven local recipient available? |
| `datasheet-zoanthropes:section:1/blocks/0/text` | Spirit Leech (Aura, Psychic): While an enemy unit is within 6" of this unit, if this unit contains a Neurothrope, each time that enemy unit fails a Battle-shock test, it suffers D3 mortal wounds and one model in this unit regains up to D3 lost wounds. | Block combines enemy mortal wounds and local-unit healing; a single friendly source-unit role is incomplete. Is a source correction or an independently proven local recipient available? |

EC enemy-target, external-friendly-target, army-wide and objective-control-only paragraphs remain owner-only; no ambiguous local recipient is guessed.

## Independent A/B against source

199 fixture inputs across all nine books, 507 physical observations. Complete import results and snapshots compare exactly. After accounting for exact newly reviewed BATTLE_ONLY rows, complete projections (including existing conditional rows, applied effects, stats, weapons, keywords, granted abilities, trace IDs and source provenance) compare byte-for-byte. Existing O-1 text rows are retained unchanged.

| Book | New BATTLE_ONLY clauses | New DISPLAY_ONLY clauses | Added conditional rows observed (including repeated lifecycle observations) | Distinct observed clauses | Related changes | New O-1 rows observed |
| --- | --- | --- | --- | --- | --- | --- |
| tyranids | 117 | 63 | 300 | 40 | 540 | 12 |
| emperors-children | 80 | 31 | 138 | 26 | 128 | 4 |

### Conditional examples

| Book | Rule / clause | Reason |
| --- | --- | --- |
| tyranids | `datasheet-tyrannofex:section:1/text-coverage:/blocks/0/text` | Single-use defense protects only this model. |
| tyranids | `datasheet-tyrannofex:section:3/text-coverage:/blocks/0/text` | Damage bracket and modifiers concern only this physical model; current wound state remains source text. |
| tyranids | `datasheet-hive-tyrant:section:1/text-coverage:/blocks/0/text` | Friendly Stratagem target within 12 inches is external and selected by actual use; this is not an automatic friendly aura. |
| tyranids | `datasheet-hive-tyrant:section:1/text-coverage:/blocks/1/text` | Friendly-unit aura; no assumed proximity or unconditional ASSAULT/LETHAL HITS lowering. |
| tyranids | `datasheet-genestealers:section:1/text-coverage:/blocks/0/text` | Attack rerolls apply to models in the source unit, including a joined Leader. |
| emperors-children | `datasheet-daemonettes:section:1/text-coverage:/blocks/0/text` | Enemy test effect only. |
| emperors-children | `datasheet-seekers:section:1/text-coverage:/blocks/0/text` | Explicit local unit. |
| emperors-children | `datasheet-noise-marines:section:1/text-coverage:/blocks/0/text` | Only enemy test modifier. |
| emperors-children | `datasheet-tormentors:section:1/text-coverage:/blocks/0/text` | Ambiguous recipient: this unit is only the condition, while objective marker control is the effect. Conservatively owner-only; do not infer scope from this-unit trigger alone. |
| emperors-children | `datasheet-tormentors:section:1/text-coverage:/blocks/1/text` | Bearer’s formed unit explicitly takes the test; CP award remains battle-only. |

### Related changes by fixture

Counts include lifecycle stages and physical units; exact before/after rows are retained in the external PARITY.json evidence. The old fallback reports UNKNOWN / CONDITIONAL, while the new selector gives MATCH for proven carriers and NO_MATCH for incompatible carriers.

| Book | Fixture | CONDITIONAL → MATCH | CONDITIONAL → NO_MATCH |
| --- | --- | --- | --- |
| emperors-children | charge/ec-daemonettes | 0 | 12 |
| emperors-children | charge/ec-daemonettes/disabled | 0 | 12 |
| emperors-children | charge/ec-seekers | 0 | 12 |
| emperors-children | charge/ec-seekers/disabled | 0 | 12 |
| emperors-children | native-json/aggregate-equipment-unresolved | 0 | 4 |
| emperors-children | native-json/bsdata-model-variants | 8 | 0 |
| emperors-children | native-json/character-bodyguard | 8 | 0 |
| emperors-children | native-json/legions-physical-equipment | 2 | 18 |
| emperors-children | native-json/native-fnp-physical-instances | 20 | 0 |
| emperors-children | source-choice/equipped-blade | 4 | 0 |
| emperors-children | native-json/character-bodyguard/I4-timing-repeat-1 | 8 | 0 |
| emperors-children | native-json/character-bodyguard/I4-timing-repeat-2 | 8 | 0 |
| tyranids | F1/broad-fixture | 18 | 0 |
| tyranids | native-ui/A | 60 | 0 |
| tyranids | native-ui/B | 8 | 4 |
| tyranids | native-ui/C | 60 | 0 |
| tyranids | native-ui/E | 48 | 0 |
| tyranids | native-ui/F | 18 | 0 |
| tyranids | native-ui/G | 36 | 0 |
| tyranids | native-ui/H | 4 | 0 |
| tyranids | seven-effects/chameleonic | 48 | 0 |
| tyranids | seven-effects/elevated | 16 | 8 |
| tyranids | seven-effects/guardian | 72 | 0 |
| tyranids | seven-effects/leaderBeasts | 12 | 16 |
| tyranids | seven-effects/mindhunger | 8 | 2 |
| tyranids | seven-effects/power | 36 | 12 |
| tyranids | source-choice/trygon | 18 | 0 |
| tyranids | source-choice/trygon/I4-timing-repeat-1 | 18 | 0 |
| tyranids | source-choice/trygon/I4-timing-repeat-2 | 18 | 0 |

### Carrier restriction cross-check

The native coverage QA evaluates every newly contracted Enhancement against every factual physical MODEL profile, including negative carriers. The independent oracle reads literal reviewed restrictions, physical keyword groups and native Deep Strike recipients, rather than formed-unit keywords. This covers all newly introduced MATCH results.

| Book | Enhancement | Original restriction | Proven physical profile count | Result |
| --- | --- | --- | --- | --- |
| tyranids | `detachment-subterranean-assault:enhancement:1` | TYRANIDS model only. | 53 | PASS; no incompatible carrier MATCH |
| tyranids | `detachment-subterranean-assault:enhancement:2` | TYRANIDS model only. | 53 | PASS; no incompatible carrier MATCH |
| tyranids | `detachment-subterranean-assault:enhancement:3` | TYRANIDS model with the Deep Strike ability only. | 14 | PASS; no incompatible carrier MATCH |
| tyranids | `detachment-invasion-fleet:enhancement:1` | TYRANIDS model only. | 53 | PASS; no incompatible carrier MATCH |
| tyranids | `detachment-invasion-fleet:enhancement:2` | TYRANIDS model only. | 53 | PASS; no incompatible carrier MATCH |
| tyranids | `detachment-invasion-fleet:enhancement:3` | TYRANIDS model only. | 53 | PASS; no incompatible carrier MATCH |
| tyranids | `detachment-synaptic-nexus:enhancement:2` | TYRANIDS SYNAPSE model only. | 17 | PASS; no incompatible carrier MATCH |
| tyranids | `detachment-synaptic-nexus:enhancement:3` | TYRANIDS SYNAPSE model only. | 17 | PASS; no incompatible carrier MATCH |
| tyranids | `detachment-synaptic-nexus:enhancement:4` | TYRANIDS SYNAPSE model only. | 17 | PASS; no incompatible carrier MATCH |
| tyranids | `detachment-assimilation-swarm:enhancement:1` | TYRANIDS model only (excluding MONSTERS models). | 28 | PASS; no incompatible carrier MATCH |
| tyranids | `detachment-assimilation-swarm:enhancement:2` | TYRANIDS model only. | 53 | PASS; no incompatible carrier MATCH |
| tyranids | `detachment-assimilation-swarm:enhancement:3` | TYRANIDS model only. | 53 | PASS; no incompatible carrier MATCH |
| tyranids | `detachment-crusher-stampede:enhancement:2` | TYRANIDS MONSTER model only. | 25 | PASS; no incompatible carrier MATCH |
| tyranids | `detachment-crusher-stampede:enhancement:3` | TYRANIDS MONSTER model only. | 25 | PASS; no incompatible carrier MATCH |
| tyranids | `detachment-crusher-stampede:enhancement:4` | TYRANIDS MONSTER model only. | 25 | PASS; no incompatible carrier MATCH |
| tyranids | `detachment-vanguard-onslaught:enhancement:1` | TYRANIDS model only. | 53 | PASS; no incompatible carrier MATCH |
| tyranids | `detachment-vanguard-onslaught:enhancement:3` | VANGUARD INVADER model only. | 19 | PASS; no incompatible carrier MATCH |
| tyranids | `detachment-vanguard-onslaught:enhancement:4` | TYRANIDS model only. | 53 | PASS; no incompatible carrier MATCH |
| tyranids | `detachment-unending-swarm:enhancement:2` | TYRANIDS model only. | 53 | PASS; no incompatible carrier MATCH |
| tyranids | `detachment-unending-swarm:enhancement:3` | TYRANIDS model only. | 53 | PASS; no incompatible carrier MATCH |
| tyranids | `detachment-unending-swarm:enhancement:4` | TYRANIDS model only. | 53 | PASS; no incompatible carrier MATCH |
| tyranids | `detachment-ambush-predators:enhancement:1` | NEUROLICTOR/LICTOR/VON RYAN’S LEAPERS unit only. | 3 | PASS; no incompatible carrier MATCH |
| tyranids | `detachment-warrior-bioform-onslaught:enhancement:2` | WINGED TYRANID PRIME/TYRANID PRIME WITH LASH WHIP model only. | 2 | PASS; no incompatible carrier MATCH |
| emperors-children | `detachment-coterie-of-the-conceited:enhancement:1` | EMPEROR’S CHILDREN model only. | 18 | PASS; no incompatible carrier MATCH |
| emperors-children | `detachment-coterie-of-the-conceited:enhancement:3` | EMPEROR’S CHILDREN model only. | 18 | PASS; no incompatible carrier MATCH |
| emperors-children | `detachment-coterie-of-the-conceited:enhancement:4` | EMPEROR’S CHILDREN model only. | 18 | PASS; no incompatible carrier MATCH |
| emperors-children | `detachment-carnival-of-excess:enhancement:2` | EMPEROR’S CHILDREN INFANTRY model only. | 9 | PASS; no incompatible carrier MATCH |
| emperors-children | `detachment-carnival-of-excess:enhancement:4` | EMPEROR’S CHILDREN or KEEPER OF SECRETS model only. | 19 | PASS; no incompatible carrier MATCH |
| emperors-children | `detachment-rapid-evisceration:enhancement:1` | EMPEROR’S CHILDREN INFANTRY model only. | 9 | PASS; no incompatible carrier MATCH |
| emperors-children | `detachment-rapid-evisceration:enhancement:2` | EMPEROR’S CHILDREN INFANTRY model only. | 9 | PASS; no incompatible carrier MATCH |
| emperors-children | `detachment-rapid-evisceration:enhancement:3` | EMPEROR’S CHILDREN INFANTRY model only. | 9 | PASS; no incompatible carrier MATCH |
| emperors-children | `detachment-rapid-evisceration:enhancement:4` | EMPEROR’S CHILDREN INFANTRY model only. | 9 | PASS; no incompatible carrier MATCH |
| emperors-children | `detachment-peerless-bladesmen:enhancement:2` | EMPEROR’S CHILDREN model only. | 18 | PASS; no incompatible carrier MATCH |
| emperors-children | `detachment-peerless-bladesmen:enhancement:4` | EMPEROR’S CHILDREN INFANTRY model only. | 9 | PASS; no incompatible carrier MATCH |
| emperors-children | `detachment-court-of-the-phoenician:enhancement:3` | EMPEROR’S CHILDREN model only. | 18 | PASS; no incompatible carrier MATCH |
| emperors-children | `detachment-slaaneshs-chosen:enhancement:1` | EMPEROR’S CHILDREN model only. | 18 | PASS; no incompatible carrier MATCH |
| emperors-children | `detachment-slaaneshs-chosen:enhancement:2` | EMPEROR’S CHILDREN model only. | 18 | PASS; no incompatible carrier MATCH |
| emperors-children | `detachment-slaaneshs-chosen:enhancement:3` | EMPEROR’S CHILDREN model only. | 18 | PASS; no incompatible carrier MATCH |
| emperors-children | `detachment-mercurial-host:enhancement:1` | EMPEROR’S CHILDREN model only. | 18 | PASS; no incompatible carrier MATCH |
| emperors-children | `detachment-mercurial-host:enhancement:2` | EMPEROR’S CHILDREN model only. | 18 | PASS; no incompatible carrier MATCH |
| emperors-children | `detachment-mercurial-host:enhancement:3` | EMPEROR’S CHILDREN model only. | 18 | PASS; no incompatible carrier MATCH |

## Browser evidence

Five owner/derived scenarios on desktop and mobile, 48 assertions across Effective Datasheet and Personal Guide. Piercing Talons, Steeped in Suffering, Node Lash and Warped Interference appear with the exact original text and physical Source. Detach removes them; independent duplicate units do not receive them. Synaptic Control remains owner-only. The two owner text fixtures are preserved separately from derived controls.

## Build and package proof

Six derived files were removed and reproduced by the existing producers with
byte-identical output. The existing app source-review guard reads all runtime
inputs before applying its executionBook override; the clean-build evidence
bootstraps Tyranids runtime using buildTyranidsContracts().book and the same
serializeSourceJSON used by writeApp. No builder, source-review guard or
application code was changed for this bootstrap.

All 83 generated files of the other seven books remain byte-identical to source.
The 442-file runtime package changes only:

- Tyranids app-presentation.json and roster-runtime.json;
- EC app-presentation.json and roster-attachments.json;
- EC rule-contract-schema.mjs (a declared BATTLE boolean, no new computer);
- derived glossary/generated/cache-revision.js and v2/app.html publication revision.

The old 29 Tyranids clauses and 38 EC clauses are protected twice: hashes of
their decoded source values and hashes of the published source-refs objects.
All 19 original Tyranids contracts and 21 unchanged EC contracts also retain
their complete original publication bytes. Five EC contracts append six clauses
without changing any old clause.

The final targeted quick queue passed 44/44 in 133133 ms. Its earlier single
failure was the now explicitly reviewed Keeper of Secrets conditional golden;
the complete original failure log is retained. The aborted early quick run is
not an acceptance result.

The extended independent A/B also compares complete Effective projections
(apart from the exact reviewed conditional additions and separately audited
attached text) and points for all 199 fixtures / 507 lifecycle observations.
It passed in 82253 ms. Each side uses its own checked source-refs reader for
ephemeral fragments bound to that reader's source catalog. A failed development
run using the feature reader for a baseline fragment is retained separately.

The final native coverage checks pass with ten negative controls per book,
including rejection of a falsely claimed already-covered source paragraph.

## Execution and evidence

Full primary evidence is stored outside Git at `E:/Warhammer/qa-evidence/tyranids-ec-rule-coverage-v1-20261107`. This includes original failed development runs and their fixes; they are not substituted for final acceptance results. One early quick run was stopped after it was inadvertently started before A/B exited. The final quick run uses its own fresh evidence directory and runs sequentially. The full pre-FF is run exactly once after both implementation commits.
