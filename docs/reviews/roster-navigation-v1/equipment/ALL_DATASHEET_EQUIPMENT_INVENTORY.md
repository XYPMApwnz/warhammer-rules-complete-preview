# All-datasheet native equipment inventory

Snapshot: `c477d20aaa16f850b56f18aa878d6b5fb8b4057f`. Read-only, all 491 datasheets across all nine book contexts, zero builds/import services/network.

Complete sequential enumeration of native candidate groups for every canonical DATASHEET in nine published books. The production selectionCandidates body is unchanged except adding allGroups to its returned object. Native book bindings are loaded without running services. Equipment candidates with profiles or declared providedWeaponProfileIds are excluded. Candidates require explicit native equipment binding or source equipment-ability marker; shared lexical clauses alone are recorded separately. Identity uses UNIT + canonical equipment IDs/paths + genericEquipmentId + exact caption span where a source row names several items. Aliases do not establish effect relations.

## Counting boundary

The primary denominator is canonical selectable equipment identity occurrences per UNIT, not a global unique named item catalog, roster observations, raw option rows, aliases, or quantities. Exact source caption spans distinguish several selectable items stored in one option field; generic equipment IDs distinguish drone types. Repeated aliases with the same identity count once. The SM dependency remains repeated in DA/BA book-context totals; the total is not globally deduplicated.

Equipment with a weapon profile, including explicitly provided drone weapon profiles, is excluded. A source-backed equipment item may own an entire ability block rather than a separate equipment entity. The secondary entity-pair count deliberately collapses distinct fields/items sharing one entity and therefore is not the primary item count.

**The helper-only count is distinct from the existing presenter count.** equipment-reference.mjs handles native canonicalEquipmentRequirement / SOURCE EQUIPMENT_PRESENT contract relations. The presenter additionally supports the selected marked ability itself, explicit marked source references, normal.boundAbilities and generic equipment IDs. A helper count of zero does not mean the UI has no explicit relationship.

| Book | Datasheets | With equipment | Nonweapon identities | Entity pairs | Aliases | Helper resolves | Helper exactly one | Presenter linked | Unlinked | Ambiguous |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| death-guard | 36 | 4 | 6 | 6 | 6 | 0 | 0 | 6 | 0 | 0 |
| adeptus-mechanicus | 34 | 7 | 12 | 7 | 12 | 6 | 6 | 12 | 0 | 0 |
| chaos-space-marines | 54 | 7 | 7 | 7 | 7 | 7 | 7 | 7 | 0 | 0 |
| emperors-children | 23 | 5 | 7 | 7 | 7 | 5 | 5 | 7 | 0 | 0 |
| tyranids | 52 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| tau-empire | 43 | 18 | 43 | 24 | 43 | 8 | 8 | 43 | 0 | 0 |
| space-marines | 85 | 10 | 12 | 12 | 12 | 9 | 9 | 12 | 0 | 0 |
| dark-angels | 83 | 12 | 14 | 14 | 14 | 10 | 10 | 14 | 0 | 0 |
| blood-angels | 81 | 10 | 12 | 12 | 12 | 10 | 10 | 12 | 0 | 0 |
| TOTAL book contexts | 491 | 73 | 113 | 89 | 113 | 55 | 55 | 113 | 0 | 0 |

## Exact identities without a helper contract relation

| Book | UNIT | Source caption / accepted alias | Equipment ID and exact path | Other explicit presenter route | Presenter state |
|---|---|---|---|---|---|
| death-guard | Deathshroud Terminators — `unit-deathshroud-terminators` | icon of despair | `datasheet-deathshroud-terminators:wargear:2::/text` | explicit-marked-source-reference | LINKED |
| death-guard | Plague Drones — `unit-plague-drones` | instrument of chaos | `datasheet-plague-drones:wargear:1::/text` | explicit-marked-source-reference | LINKED |
| death-guard | Plague Drones — `unit-plague-drones` | daemonic icon | `datasheet-plague-drones:wargear:2::/text` | explicit-marked-source-reference | LINKED |
| death-guard | Plague Marines — `unit-plague-marines` | icon of despair | `datasheet-plague-marines:wargear:8::/text` | explicit-marked-source-reference | LINKED |
| death-guard | Plaguebearers — `unit-plaguebearers` | instrument of chaos | `datasheet-plaguebearers:wargear:1::/text` | explicit-marked-source-reference | LINKED |
| death-guard | Plaguebearers — `unit-plaguebearers` | daemonic icon | `datasheet-plaguebearers:wargear:2::/text` | explicit-marked-source-reference | LINKED |
| adeptus-mechanicus | Archaeopter Fusilave — `unit-archaeopter-fusilave` | command uplink | `datasheet-archaeopter-fusilave:section:1::/blocks/2/text` | selected-marked-ability | LINKED |
| adeptus-mechanicus | Archaeopter Stratoraptor — `unit-archaeopter-stratoraptor` | command uplink | `datasheet-archaeopter-stratoraptor:section:1::/blocks/2/text` | selected-marked-ability | LINKED |
| adeptus-mechanicus | Archaeopter Transvector — `unit-archaeopter-transvector` | command uplink | `datasheet-archaeopter-transvector:section:1::/blocks/2/text` | selected-marked-ability | LINKED |
| adeptus-mechanicus | Serberys Raiders — `unit-serberys-raiders` | enhanced data tether | `datasheet-serberys-raiders:wargear:1::/text` | explicit-marked-source-reference | LINKED |
| adeptus-mechanicus | Skitarii Rangers — `unit-skitarii-rangers` | enhanced data tether | `datasheet-skitarii-rangers:section:1::/blocks/1/text` | selected-marked-ability | LINKED |
| adeptus-mechanicus | Skitarii Vanguard — `unit-skitarii-vanguard` | enhanced data tether | `datasheet-skitarii-vanguard:section:1::/blocks/1/text` | selected-marked-ability | LINKED |
| emperors-children | Tormentors — `unit-tormentors` | icon of excess | `datasheet-tormentors:wargear:5::/text` | explicit-marked-source-reference | LINKED |
| emperors-children | Infractors — `unit-infractors` | icon of excess | `datasheet-infractors:wargear:3::/text` | explicit-marked-source-reference | LINKED |
| tau-empire | Breacher Team — `unit-breacher-team` | Guardian Drone | `datasheet-breacher-team:wargear:1::/text` | generic-source-equipment | LINKED |
| tau-empire | Breacher Team — `unit-breacher-team` | Marker Drone | `datasheet-breacher-team:wargear:1::/text` | generic-source-equipment | LINKED |
| tau-empire | Breacher Team — `unit-breacher-team` | Shield Drone | `datasheet-breacher-team:wargear:1::/text` | generic-source-equipment | LINKED |
| tau-empire | Strike Team — `unit-strike-team` | Guardian Drone | `datasheet-strike-team:wargear:1::/text` | generic-source-equipment | LINKED |
| tau-empire | Strike Team — `unit-strike-team` | Marker Drone | `datasheet-strike-team:wargear:1::/text` | generic-source-equipment | LINKED |
| tau-empire | Strike Team — `unit-strike-team` | Shield Drone | `datasheet-strike-team:wargear:1::/text` | generic-source-equipment | LINKED |
| tau-empire | Cadre Fireblade — `unit-cadre-fireblade` | Marker Drone | `datasheet-cadre-fireblade:wargear:1::/text` | generic-source-equipment | LINKED |
| tau-empire | Cadre Fireblade — `unit-cadre-fireblade` | Shield Drone | `datasheet-cadre-fireblade:wargear:1::/text` | generic-source-equipment | LINKED |
| tau-empire | Commander In Coldstar Battlesuit — `unit-commander-in-coldstar-battlesuit` | Battlesuit Support System | `datasheet-commander-in-coldstar-battlesuit:section:1::/blocks/1/text` | selected-marked-ability | LINKED |
| tau-empire | Commander In Coldstar Battlesuit — `unit-commander-in-coldstar-battlesuit` | Weapon Support System | `datasheet-commander-in-coldstar-battlesuit:section:1::/blocks/3/text` | selected-marked-ability | LINKED |
| tau-empire | Commander In Coldstar Battlesuit — `unit-commander-in-coldstar-battlesuit` | Marker Drone | `datasheet-commander-in-coldstar-battlesuit:wargear:2::/text` | generic-source-equipment | LINKED |
| tau-empire | Commander In Coldstar Battlesuit — `unit-commander-in-coldstar-battlesuit` | Shield Drone | `datasheet-commander-in-coldstar-battlesuit:wargear:2::/text` | generic-source-equipment | LINKED |
| tau-empire | Commander In Enforcer Battlesuit — `unit-commander-in-enforcer-battlesuit` | Battlesuit Support System | `datasheet-commander-in-enforcer-battlesuit:section:1::/blocks/1/text` | selected-marked-ability | LINKED |
| tau-empire | Commander In Enforcer Battlesuit — `unit-commander-in-enforcer-battlesuit` | Weapon Support System | `datasheet-commander-in-enforcer-battlesuit:section:1::/blocks/3/text` | selected-marked-ability | LINKED |
| tau-empire | Commander In Enforcer Battlesuit — `unit-commander-in-enforcer-battlesuit` | Marker Drone | `datasheet-commander-in-enforcer-battlesuit:wargear:2::/text` | generic-source-equipment | LINKED |
| tau-empire | Commander In Enforcer Battlesuit — `unit-commander-in-enforcer-battlesuit` | Shield Drone | `datasheet-commander-in-enforcer-battlesuit:wargear:2::/text` | generic-source-equipment | LINKED |
| tau-empire | Ethereal — `unit-ethereal` | Marker Drone | `datasheet-ethereal:wargear:2::/text` | generic-source-equipment | LINKED |
| tau-empire | Ethereal — `unit-ethereal` | Shield Drone | `datasheet-ethereal:wargear:2::/text` | generic-source-equipment | LINKED |
| tau-empire | Commander Shadowsun — `unit-commander-shadowsun` | Advanced Guardian Drone | `datasheet-commander-shadowsun:section:1::/blocks/2/text` | selected-marked-ability | LINKED |
| tau-empire | Commander Shadowsun — `unit-commander-shadowsun` | Command-link Drone | `datasheet-commander-shadowsun:section:1::/blocks/3/text` | selected-marked-ability | LINKED |
| tau-empire | Pathfinder Team — `unit-pathfinder-team` | Grav-inhibitor Drone | `datasheet-pathfinder-team:section:1::/blocks/1/text` | selected-marked-ability | LINKED |
| tau-empire | Pathfinder Team — `unit-pathfinder-team` | Marker Drone | `datasheet-pathfinder-team:wargear:2::/text` | generic-source-equipment | LINKED |
| tau-empire | Pathfinder Team — `unit-pathfinder-team` | Shield Drone | `datasheet-pathfinder-team:wargear:2::/text` | generic-source-equipment | LINKED |
| tau-empire | Stealth Battlesuits — `unit-stealth-battlesuits` | Marker Drone | `datasheet-stealth-battlesuits:wargear:2::/text` | generic-source-equipment | LINKED |
| tau-empire | Stealth Battlesuits — `unit-stealth-battlesuits` | Homing Beacon | `datasheet-stealth-battlesuits:section:1::/blocks/1/text` | selected-marked-ability | LINKED |
| tau-empire | Vespid Stingwings — `unit-vespid-stingwings` | Oversight Drone | `datasheet-vespid-stingwings:section:1::/blocks/1/text` | selected-marked-ability | LINKED |
| tau-empire | Broadside Battlesuits — `unit-broadside-battlesuits` | Weapon Support System | `datasheet-broadside-battlesuits:section:1::/blocks/1/text` | selected-marked-ability | LINKED |
| tau-empire | Broadside Battlesuits — `unit-broadside-battlesuits` | Marker Drone | `datasheet-broadside-battlesuits:wargear:3::/text` | generic-source-equipment | LINKED |
| tau-empire | Broadside Battlesuits — `unit-broadside-battlesuits` | Shield Drone | `datasheet-broadside-battlesuits:wargear:3::/text` | generic-source-equipment | LINKED |
| tau-empire | Crisis Fireknife Battlesuits — `unit-crisis-fireknife-battlesuits` | Marker Drone | `datasheet-crisis-fireknife-battlesuits:wargear:3::/text` | generic-source-equipment | LINKED |
| tau-empire | Crisis Fireknife Battlesuits — `unit-crisis-fireknife-battlesuits` | Shield Drone | `datasheet-crisis-fireknife-battlesuits:wargear:3::/text` | generic-source-equipment | LINKED |
| tau-empire | Crisis Starscythe Battlesuits — `unit-crisis-starscythe-battlesuits` | Marker Drone | `datasheet-crisis-starscythe-battlesuits:wargear:3::/text` | generic-source-equipment | LINKED |
| tau-empire | Crisis Starscythe Battlesuits — `unit-crisis-starscythe-battlesuits` | Shield Drone | `datasheet-crisis-starscythe-battlesuits:wargear:3::/text` | generic-source-equipment | LINKED |
| tau-empire | Crisis Sunforge Battlesuits — `unit-crisis-sunforge-battlesuits` | Marker Drone | `datasheet-crisis-sunforge-battlesuits:wargear:1::/text` | generic-source-equipment | LINKED |
| tau-empire | Crisis Sunforge Battlesuits — `unit-crisis-sunforge-battlesuits` | Shield Drone | `datasheet-crisis-sunforge-battlesuits:wargear:1::/text` | generic-source-equipment | LINKED |
| space-marines | Reiver Squad — `unit-sm-5d6184dd92154615` | Grapnel Launchers | `ability-sm-801f058790ba4ed4::/text` | selected-marked-ability | LINKED |
| space-marines | Infiltrator Squad — `unit-sm-8ef63e7da6444869` | Helix Gauntlet | `ability-sm-ece9a939dcf642bf::/text` | selected-marked-ability | LINKED |
| space-marines | Victrix Honour Guard — `unit-sm-f169827c554c4eee` | Banner of Macragge | `ability-sm-c227c53a84a34dc1::/text` | selected-marked-ability | LINKED |
| dark-angels | Deathwing Terminator Squad — `unit-da-9f8f2ccbdb7d4c72857c` | Watcher in the Dark | `ability-da-67e5af94e8b44695865b::/text` | selected-marked-ability | LINKED |
| dark-angels | Deathwing Knights — `unit-da-a1d3821fd56946f0951d` | Watcher in the Dark | `ability-da-9bd770df552c413daeca::/text` | selected-marked-ability | LINKED |
| dark-angels | Reiver Squad — `unit-sm-5d6184dd92154615` | Grapnel Launchers | `ability-sm-801f058790ba4ed4::/text` | selected-marked-ability | LINKED |
| dark-angels | Infiltrator Squad — `unit-sm-8ef63e7da6444869` | Helix Gauntlet | `ability-sm-ece9a939dcf642bf::/text` | selected-marked-ability | LINKED |
| blood-angels | Reiver Squad — `unit-sm-5d6184dd92154615` | Grapnel Launchers | `ability-sm-801f058790ba4ed4::/text` | selected-marked-ability | LINKED |
| blood-angels | Infiltrator Squad — `unit-sm-8ef63e7da6444869` | Helix Gauntlet | `ability-sm-ece9a939dcf642bf::/text` | selected-marked-ability | LINKED |

## Exact identities without any presenter relationship

None in this native selectable-equipment universe.

## Ambiguous effects

None.

## Raw source coverage and limits

| Book | All wargear option rows | Marked ability blocks | Canonical equipment abilities | Source rows not addressed by equipment bindings/effect links | Excluded provided-weapon candidates | Lexical-only clause candidates |
|---|---:|---:|---:|---:|---:|---:|---:|
| death-guard | 43 | 6 | 0 | 37 | 0 | 0 |
| adeptus-mechanicus | 41 | 12 | 0 | 37 | 0 | 0 |
| chaos-space-marines | 87 | 0 | 7 | 81 | 0 | 0 |
| emperors-children | 33 | 7 | 0 | 26 | 0 | 0 |
| tyranids | 29 | 0 | 0 | 29 | 0 | 0 |
| tau-empire | 76 | 19 | 0 | 65 | 16 | 9 |
| space-marines | 84 | 0 | 12 | 74 | 0 | 1 |
| dark-angels | 96 | 0 | 14 | 96 | 0 | 1 |
| blood-angels | 110 | 0 | 12 | 110 | 0 | 1 |

Fixed/non-selectable canonical equipment ability entities are included in the source coverage scan. Every nonweapon canonical equipment ability is already addressed by an enumerated native identity or explicit linked effect; this does not require that it be optional. The two uncovered marked Tau blocks belong to explicitly excluded weapon-providing MV15 Gun Drone and Recon Drone selections. Contract equipment targets are also retained independently, and every retained target has an enumerated identity. Every explicit native nonweapon equipment declaration is represented (coverage assertion in recipe). Canonical generic equipment rules retain their original global IDs through each unit occurrence.

### Shared lexical-only clause candidates (excluded from nonweapon item denominator)

- tau-empire, Devilfish (`unit-devilfish`): `datasheet-devilfish:wargear:2` up to 2 seeker missiles.
- tau-empire, Broadside Battlesuits (`unit-broadside-battlesuits`): `datasheet-broadside-battlesuits:wargear:4` both a twin plasma rifle and twin smart missile system at the same time.
- tau-empire, Crisis Fireknife Battlesuits (`unit-crisis-fireknife-battlesuits`): `datasheet-crisis-fireknife-battlesuits:wargear:3` up to two of the following but cannot take duplicates.
- tau-empire, Crisis Starscythe Battlesuits (`unit-crisis-starscythe-battlesuits`): `datasheet-crisis-starscythe-battlesuits:wargear:3` up to two of the following but cannot take duplicates.
- tau-empire, Ghostkeel Battlesuit (`unit-ghostkeel-battlesuit`): `datasheet-ghostkeel-battlesuit:wargear:3` one battlesuit support system.
- tau-empire, Hammerhead Gunship (`unit-hammerhead-gunship`): `datasheet-hammerhead-gunship:wargear:3` up to 2 seeker missiles.
- tau-empire, Riptide Battlesuit (`unit-riptide-battlesuit`): `datasheet-riptide-battlesuit:wargear:3` up to 2 missile drones.
- tau-empire, AX-1-0 Tiger Shark (`unit-ax-1-0-tiger-shark`): `datasheet-ax-1-0-tiger-shark:wargear:1` up to 6 seeker missiles.
- tau-empire, Tiger Shark (`unit-tiger-shark`): `datasheet-tiger-shark:wargear:3` up to 6 seeker missiles.
- space-marines, Lieutenant (`unit-sm-4660f547cc3744b0`): `wargear-sm-5f504d008dc34642` storm shield this models 1 neo volkite pistol cannot be replaced.
- dark-angels, Lieutenant (`unit-sm-4660f547cc3744b0`): `wargear-sm-5f504d008dc34642` storm shield this models 1 neo volkite pistol cannot be replaced.
- blood-angels, Lieutenant (`unit-sm-4660f547cc3744b0`): `wargear-sm-5f504d008dc34642` storm shield this models 1 neo volkite pistol cannot be replaced.

All raw WARGEAR_OPTION rows and wargearAbility-marked blocks are retained in JSON, including rows not admitted as nonweapon candidates. These unclassified rows include weapon replacement choices, combined/multiple-choice clauses and fixed or otherwise unlowered narrative equipment. No title/prose-based guess labels them nonweapon or links them to an effect. Consequently this is exhaustive for the current native canonical selectable-equipment identity universe across every datasheet, not a claim that all source-mentioned physical equipment has a canonical selectable identity. The latter requires accepted source-owned item-level lowering, not an audit-side name parser.

A LINKED presenter result requires exactly one focused non-option effect field, with existing canonical owner, exact field path and nonblank published source text. Contract conditions and effects are never executed. JSON retains each helper effect independently, including helper multiplicity. Text-only links are not semantic execution certification.

Reusable recipe: `inventory-all-datasheet-equipment.mjs`. The recipe prints only per-book counts. Exact input paths, source rows, candidate identities, contract targets and effect text are retained in `ALL_DATASHEET_EQUIPMENT_INVENTORY.json`.
