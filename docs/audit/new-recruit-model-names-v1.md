# New Recruit MODEL names v1

Base: `2bced37f2733c97595407790429a8aa60c07b2a8`. Branch: `codex/new-recruit-model-names-v1`.

## Mechanism and factual boundary

The shared offline producer is `books/shared/tools/build-new-recruit-model-names.mjs`. It reads each book's pinned BSData snapshot and its existing canonical import view. It emits `books/<book>/v2/model-name-aliases.json`; nonliteral, individually reviewed source joins live in `model-name-source-bindings.json`. Every emitted MODEL alias retains canonical field evidence plus BSData document, exact byte SHA-256, JSON pointer, entry ID, unmodified source name and MODEL/group kind. The generic browser-safe `model-name-aliases.mjs` appends names to existing identityAliases and the exact evidenced composition member. Original aliases remain. The composition label marker makes regeneration independent of previously generated additions.

Only exact existing names, existing singular inflection, explicit reviewed source joins and source MODEL-profile/group structure establish identities. Diagnostic plausible candidates never establish a join. Profile statistics and matching quantities are never used to guess identity. Two physical composition members sharing one statline are still ambiguous. An unproven same-name source MODEL blocks new enrollment. Group labels are admitted only when every contained MODEL has the same independently proven physical member. Generic equipment submenus are excluded.

The shared SM owner supplies inherited names to BA/DA through their existing producer dependency; supplement alias data contains only supplement-owned additions. Vanguard Veterans use the already accepted reviewed composition mapping; no MODEL mapping is invented. The pinned snapshots are intentionally older than the live BSData HEAD mentioned in the preliminary census. They are not refreshed.

Run `node books/shared/tools/build-new-recruit-model-names.mjs --book=<canonical-book-id> --write` to regenerate vocabulary; `--check` verifies it. Both the check and independent owner-authored `v2/new-recruit-model-names-qa.mjs --book=<id>` are connected to all eight applicable book queues. DG has no pinned snapshot and is not modified. New browser QA is connected to `test:browser`. Three literal runtime dependencies are explicitly enrolled in the publication allowlist. No raw BSData source is published.

There are 66 source-occurrence proof rows for 40 distinct owner/MODEL/label additions. This is vocabulary coverage, not a count of previously broken imports: some labels were already accepted by singular inflection.

## Book census

MODEL occurrences count source selection entries, including equipment variants, within each admitted book view. They are not physical roster quantities or independent source-owner counts. The full table deduplicates repeated occurrences of the same label/type within one unit. The before/after columns count PROFILE candidates and literal composition matches; they are not an assertion that every row was a failing complete roster. Actual complete-roster outcomes are separately measured below. Eligibility status describes proof for enrollment; existing accepted vocabulary is retained even if a same-named broad source group contains several MODEL types.

| Book | Source MODEL records | Distinct unit/label/type rows | Own distinct additions | Scope |
| --- | --- | --- | --- | --- |
| adeptus-mechanicus | 71 | 73 | 0 | Pinned snapshot only |
| death-guard | N/A | N/A | 0 | No pinned BSData snapshot; unchanged |
| chaos-space-marines | 127 | 98 | 14 | Pinned snapshot only |
| space-marines | 125 | 133 | 13 | Pinned snapshot only |
| blood-angels | 119 | 126 | 3 | Pinned snapshot only |
| dark-angels | 126 | 133 | 4 | Pinned snapshot only |
| tau-empire | 70 | 78 | 4 | Pinned snapshot only |
| tyranids | 62 | 76 | 1 | Pinned snapshot only |
| emperors-children | 47 | 41 | 1 | Pinned snapshot only |

## Independent complete-roster expectations

| Book | Case | Baseline status | Baseline unanswered labels | Feature status |
| --- | --- | --- | --- | --- |
| chaos-space-marines | cultist | NEEDS_BINDINGS | PROFILE: Cultist | READY |
| chaos-space-marines | beastman | NEEDS_BINDINGS | PROFILE: Beastman | READY |
| chaos-space-marines | biker | NEEDS_BINDINGS | PROFILE: Biker | READY |
| chaos-space-marines | guardsman | NEEDS_BINDINGS | PROFILE: Guardsman | READY |
| chaos-space-marines | terminator-equipment-named-model | NEEDS_BINDINGS | PROFILE: Accursed weapon and combi-bolter | READY |
| chaos-space-marines | derived-tournament | NEEDS_BINDINGS | PROFILE: Cultist; PROFILE: Cultist; PROFILE: Beastman | READY |
| space-marines | assault-sergeant | NEEDS_BINDINGS | PROFILE: Assault Terminator Sergeant | READY |
| space-marines | assault-jump | NEEDS_BINDINGS | PROFILE: Assault Intercessors with Jump Pack | READY |
| space-marines | company-veteran | NEEDS_BINDINGS | PROFILE: Company Veteran | NEEDS_BINDINGS |
| space-marines | assault-terminator | NEEDS_BINDINGS | PROFILE: Assault Terminator Sergeant; PROFILE: Assault Terminator | READY |
| space-marines | vanguard-jump | NEEDS_BINDINGS | PROFILE: Vanguard Veterans with Jump Packs | READY |
| blood-angels | death-company | NEEDS_BINDINGS | COMPOSITION_MEMBER: Death Company Marine | READY |
| blood-angels | blood-angels/assault-sergeant | NEEDS_BINDINGS | PROFILE: Assault Terminator Sergeant | READY |
| blood-angels | blood-angels/assault-jump | NEEDS_BINDINGS | PROFILE: Assault Intercessors with Jump Pack | READY |
| blood-angels | blood-angels/company-veteran | NEEDS_BINDINGS | PROFILE: Company Veteran | NEEDS_BINDINGS |
| blood-angels | blood-angels/assault-terminator | NEEDS_BINDINGS | PROFILE: Assault Terminator Sergeant; PROFILE: Assault Terminator | READY |
| blood-angels | blood-angels/vanguard-jump | NEEDS_BINDINGS | PROFILE: Vanguard Veterans with Jump Packs | READY |
| tau-empire | fire-warrior | NEEDS_BINDINGS | COMPOSITION_MEMBER: parsed-unit-1/model-row/2 | READY |
| tau-empire | krootox-rider | NEEDS_BINDINGS | COMPOSITION_MEMBER: parsed-unit-1/model-row/1 | READY |
| tau-empire | kroot-carnivore | NEEDS_BINDINGS | COMPOSITION_MEMBER: parsed-unit-1/model-row/2 | READY |
| tyranids | termagant | NEEDS_BINDINGS | COMPOSITION_MEMBER: Termagant | READY |
| emperors-children | terminators-group | NEEDS_BINDINGS | COMPOSITION_MEMBER: Terminators | READY |
| dark-angels | dark-angels/assault-sergeant | NEEDS_BINDINGS | PROFILE: Assault Terminator Sergeant | READY |
| dark-angels | dark-angels/assault-jump | NEEDS_BINDINGS | PROFILE: Assault Intercessors with Jump Pack | READY |
| dark-angels | dark-angels/company-veteran | NEEDS_BINDINGS | PROFILE: Company Veteran | NEEDS_BINDINGS |
| dark-angels | dark-angels/assault-terminator | NEEDS_BINDINGS | PROFILE: Assault Terminator Sergeant; PROFILE: Assault Terminator | READY |
| dark-angels | dark-angels/vanguard-jump | NEEDS_BINDINGS | PROFILE: Vanguard Veterans with Jump Packs | READY |

The tournament fixture is `DERIVED_FROM_REAL_TOURNAMENT_LIST`, not an original New Recruit export. Player 5_13, La Grande Castagne Ardéchoise, 2026-09-19; owner-supplied Claude transcription. Units/models/equipment come from that list; the plain header and N-with grouping are derived. Its exact bytes and independent expectations are pinned in its fixture metadata. Baseline requests only PROFILE Cultist twice and Beastman once; feature is READY.

## MODEL names deliberately not enrolled

| Book | Unit | Source name | Status | Reason |
| --- | --- | --- | --- | --- |
| space-marines | Outrider Squad | Invader ATV | NOT_PROVEN | No admitted matching Outrider composition member; no model or unit created |
| space-marines | Company Heroes | Company Veteran | AMBIGUOUS | Two real canonical MODEL profiles; keep player selection |
| space-marines | Wardens of Ultramar | Dainal Kornelius | NOT_PROVEN | Existing source MODEL mapping remains unproven |
| blood-angels | Outrider Squad | Invader ATV | NOT_PROVEN | No admitted matching Outrider composition member; no model or unit created |
| blood-angels | Company Heroes | Company Veteran | AMBIGUOUS | Two real canonical MODEL profiles; keep player selection |
| dark-angels | Outrider Squad | Invader ATV | NOT_PROVEN | No admitted matching Outrider composition member; no model or unit created |
| dark-angels | Company Heroes | Company Veteran | AMBIGUOUS | Two real canonical MODEL profiles; keep player selection |

Broad groups with several physical members are also not enrolled; they are visible in the full census. Company Veteran remains a two-candidate player choice in SM, BA and DA. No equipment-based guessing is introduced. Deathwatch, unsupported aircraft/tanks, CSM allied cult units and standalone mine entries receive no declarations. Selected source-root exclusions:

| Book view | Source root selection | Reason |
| --- | --- | --- |
| chaos-space-marines | Khorne Berzerkers | OUTSIDE_ADMITTED_BOOK |
| chaos-space-marines | Rubric Marines | OUTSIDE_ADMITTED_BOOK |
| chaos-space-marines | Plague Marines | OUTSIDE_ADMITTED_BOOK |
| chaos-space-marines | Noise Marines | OUTSIDE_ADMITTED_BOOK |
| chaos-space-marines | Chaos Thunderhawk [Legends] | OUTSIDE_ADMITTED_BOOK |
| space-marines | Astraeus | OUTSIDE_ADMITTED_BOOK |
| space-marines | Thunderhawk Gunship | OUTSIDE_ADMITTED_BOOK |
| space-marines | Thunderhawk Transporter [Legends] | OUTSIDE_ADMITTED_BOOK |
| space-marines | Chaos Thunderhawk [Legends] | OUTSIDE_ADMITTED_BOOK |
| blood-angels | Astraeus | OUTSIDE_ADMITTED_BOOK |
| blood-angels | Thunderhawk Gunship | OUTSIDE_ADMITTED_BOOK |
| blood-angels | Thunderhawk Transporter [Legends] | OUTSIDE_ADMITTED_BOOK |
| blood-angels | Corvus Blackstar | OUTSIDE_ADMITTED_BOOK |
| blood-angels | Deathwatch Kill Team | OUTSIDE_ADMITTED_BOOK |
| blood-angels | Deathwatch Terminator Squad [Legends] | OUTSIDE_ADMITTED_BOOK |
| blood-angels | Deathwatch Veteran w/ carbine | OUTSIDE_ADMITTED_BOOK |
| blood-angels | Deathwatch Veteran w/ heavy thunder hammer | OUTSIDE_ADMITTED_BOOK |
| blood-angels | Deathwatch Veteran w/ stalker bolt rifle | OUTSIDE_ADMITTED_BOOK |
| blood-angels | Deathwatch Agent [Crucible] | OUTSIDE_ADMITTED_BOOK |
| blood-angels | Chaos Thunderhawk [Legends] | OUTSIDE_ADMITTED_BOOK |
| dark-angels | Astraeus | OUTSIDE_ADMITTED_BOOK |
| dark-angels | Thunderhawk Gunship | OUTSIDE_ADMITTED_BOOK |
| dark-angels | Thunderhawk Transporter [Legends] | OUTSIDE_ADMITTED_BOOK |
| dark-angels | Corvus Blackstar | OUTSIDE_ADMITTED_BOOK |
| dark-angels | Deathwatch Kill Team | OUTSIDE_ADMITTED_BOOK |
| dark-angels | Deathwatch Terminator Squad [Legends] | OUTSIDE_ADMITTED_BOOK |
| dark-angels | Deathwatch Veteran w/ carbine | OUTSIDE_ADMITTED_BOOK |
| dark-angels | Deathwatch Veteran w/ heavy thunder hammer | OUTSIDE_ADMITTED_BOOK |
| dark-angels | Deathwatch Veteran w/ stalker bolt rifle | OUTSIDE_ADMITTED_BOOK |
| dark-angels | Deathwatch Agent [Crucible] | OUTSIDE_ADMITTED_BOOK |
| dark-angels | Chaos Thunderhawk [Legends] | OUTSIDE_ADMITTED_BOOK |
| tyranids | Spore Mines (Biovore) | OUTSIDE_ADMITTED_BOOK |
| tyranids | Mucolid Spores (Sporocyst) | OUTSIDE_ADMITTED_BOOK |

## Verification and limits

Existing fixture A/B uses the clean base worktree: all nine books, 199 existing fixture inputs, 529 exact stage/status observations. Full interpreter projections, persisted states and attached-rule text/source rows are compared without normalization. The independent added fixtures also assert exact MODEL and composition-member IDs, reload preservation, no implicit equipment selection, the two-model ambiguity, and ten negative source/identity controls. Browser QA pastes the derived tournament, SM, BA and Tau inputs on desktop and mobile, verifies actual saved roster articles and restores the same physical state.

All 97 tracked generated book JSON artifacts are checked: 88 remain byte-identical. Nine contain import vocabulary/its source serialization only; restoring those additions yields exact decoded baseline objects. The Tyranids contract artifact only changes its import-input fingerprint; factual/declaration fingerprints and every contract are unchanged. No canonical entity, DATASHEET name, equipment definition, gameplay effect, condition, price, recipient or presentation code is changed.

Existing test expectations changed: **none**. Existing out-of-queue legacy/source-reader failures are not repaired or reclassified in this task.

Quick for the eight applicable books: 80/80 PASS (945107 ms), before the final two explicit SM source-name joins. Scoped acceptance and final pre-FF cover the completed vocabulary. Full pre-FF is run once after the implementation commit; its exact SHA, primary logs, classification and package hash comparison are recorded in the external final REPORT.md and CLASSIFIED_RESULTS.json. This document does not predeclare that result.

## Full census

| Book | Unit | New Recruit name | Source type | PROFILE candidates before | Literal members before | PROFILE candidates after | Literal members after | Enrollment proof |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| adeptus-mechanicus | Archaeopter Fusilave | Archaeopter Fusilave | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Archaeopter Stratoraptor | Archaeopter Stratoraptor | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Archaeopter Transvector | Archaeopter Transvector | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Belisarius Cawl | Belisarius Cawl | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Corpuscarii Electro-priests | Corpuscarii Electro-Priests | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Fulgurite Electro-priests | Fulgurite Electro-Priests | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Ironstrider Ballistarii | Ironstrider Ballistarius (Twin cognis autocannon) | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Ironstrider Ballistarii | Ironstrider Ballistarius (Twin cognis lascannon) | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Ironstrider Ballistarii | Ironstrider Ballistarii | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Kastelan Robots | Kastelan Robot | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Kataphron Breachers | Kataphron Breacher (Heavy arc rifle & arc claw) | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Kataphron Breachers | Kataphron Breacher (Heavy arc rifle & hydraulic claw) | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Kataphron Breachers | Kataphron Breacher (Torsion cannon & arc claw) | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Kataphron Breachers | Kataphron Breacher (Torsion cannon & hydraulic claw) | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Kataphron Breachers | Kataphron Breachers | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Kataphron Destroyers | Kataphron Destroyer (Heavy grav-cannon & Cognis flamer) | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Kataphron Destroyers | Kataphron Destroyer (Heavy grav-cannon & phosphor blaster) | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Kataphron Destroyers | Kataphron Destroyer (Kataphron plasma culverin & Phosphor blaster) | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Kataphron Destroyers | Kataphron Destroyer (Kataphron plasma culverin & Cognis flamer) | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Kataphron Destroyers | Kataphron Destroyers | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Onager Dunecrawler | Onager Dunecrawler | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Pteraxii Skystalkers | Pteraxii Skystalker Alpha | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Pteraxii Skystalkers | Pteraxii Skystalkers | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Pteraxii Sterylizors | Pteraxii Sterylizor Alpha | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Pteraxii Sterylizors | Pteraxii Sterylizors | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Serberys Raiders | Serberys Raider Alpha | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Serberys Raiders | Serberys Raider | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Serberys Raiders | Serberys Raiders | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Serberys Sulphurhounds | Serberys Sulphurhound Alpha | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Serberys Sulphurhounds | Serberys Sulphurhound (Twin phosphor pistols) | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Serberys Sulphurhounds | Serberys Sulphurhound (Phosphor blast carbine & Phosphor pistol) | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Serberys Sulphurhounds | Serberys Sulphurhounds | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Sicarian Infiltrators | Sicarian Infiltrator (Power weapon & stubcarbine) | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Sicarian Infiltrators | Sicarian Infiltrator (Taser goad & flechette blaster) | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Sicarian Infiltrators | Sicarian Infiltrator Princeps (Power weapon & stub carbine) | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Sicarian Infiltrators | Sicarian Infiltrator Princeps (Taser goad & flechette blaster) | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Sicarian Infiltrators | Sicarian Infiltrators | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Sicarian Infiltrators | Sicarian Infiltrator Princeps | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Sicarian Ruststalkers | Sicarian Ruststalker (Transonic razor & chordclaw) | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Sicarian Ruststalkers | Sicarian Ruststalker (Transonic blades) | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Sicarian Ruststalkers | Sicarian Ruststalker Princeps (Transonic blades & chordclaw) | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Sicarian Ruststalkers | Sicarian Ruststalker Princeps (Transonic razor & chordclaw) | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Sicarian Ruststalkers | Sicarian Ruststalkers | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Sicarian Ruststalkers | Sicarian Ruststalker Princeps | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Skitarii Marshal | Skitarii Marshal | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Skitarii Rangers | Skitarii Ranger Alpha | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Skitarii Rangers | Skitarii Ranger | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Skitarii Rangers | Skitarii Rangers | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Skitarii Vanguard | Skitarii Vanguard Alpha | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Skitarii Vanguard | Skitarii Vanguard | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Skitarii Vanguard | Skitarii Vanguard | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Skorpius Disintegrator | Skorpius Disintegrator | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Skorpius Dunerider | Skorpius Dunerider | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Sydonian Dragoons With Taser Lances | Sydonian Dragoon with taser lance | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Sydonian Dragoons With Taser Lances | Sydonian Dragoons | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Tech-priest Dominus | Tech-Priest Dominus | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Tech-priest Enginseer | Tech-Priest Enginseer | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Tech-priest Manipulus | Tech-Priest Manipulus | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Technoarcheologist | Technoarcheologist | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Cybernetica Datasmith | Cybernetica Datasmith | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Sydonian Dragoons With Radium Jezzails | Sydonian Dragoon with radium jezzail | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Sydonian Dragoons With Radium Jezzails | Sydonian Dragoons | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Servitor Battleclade | Servitor Underseer | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Servitor Battleclade | Gun Servitor | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Servitor Battleclade | Combat Servitor | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Servitor Battleclade | Combat Servitors | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Thulia Ghuld | Thulia Ghuld | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Hastarii Exterminators | Hastarii Exterminator Alpha | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Hastarii Exterminators | Hastarii Exterminator | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Hastarii Exterminators | Hastarii Exterminators | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Hastarii Fusiliers | Hastarii Fusilier Alpha | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Hastarii Fusiliers | Hastarii Fusilier | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| adeptus-mechanicus | Hastarii Fusiliers | Hastarii Fusiliers | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Abaddon The Despoiler | Abaddon the Despoiler | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Haarken Worldclaimer | Haarken Worldclaimer | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Huron Blackheart | Huron Blackheart | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Heretic Astartes Daemon Prince | Heretic Astartes Daemon Prince | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Heretic Astartes Daemon Prince With Wings | Heretic Astartes Daemon Prince with wings | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Fabius Bile | Fabius Bile | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Fabius Bile | Surgeon Acolyte | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Cypher | Cypher | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Master Of Possession | Master of Possession | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Chaos Lord | Chaos Lord | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Chaos Lord In Terminator Armour | Chaos Lord in Terminator Armour | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Sorcerer | Sorcerer | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Sorcerer In Terminator Armour | Sorcerer in Terminator Armour | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Lord Discordant On Helstalker | Lord Discordant on Helstalker | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Warpsmith | Warpsmith | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Dark Apostle | Dark Apostle | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Dark Apostle | Dark Disciple | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Dark Commune | Blessed Blades | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Dark Commune | Iconarch | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Dark Commune | Mindwitch | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Dark Commune | Cult Demagogue | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Dark Commune | Cult Demagogue | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Legionaries | Aspiring Champion | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Legionaries | Legionary | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Legionaries | Legionaries | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Cultist Mob | Cultist Champion | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Cultist Mob | Cultist | MODEL | 2 | N/A | 1 | 1 | RESOLVED |
| chaos-space-marines | Accursed Cultists | Torment | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Accursed Cultists | Mutant | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Chaos Terminator Squad | Accursed weapon and combi-bolter | MODEL | 0 | N/A | 1 | 1 | RESOLVED |
| chaos-space-marines | Chaos Terminator Squad | Accursed weapon and combi-weapon | MODEL | 0 | N/A | 1 | 1 | RESOLVED |
| chaos-space-marines | Chaos Terminator Squad | Power fist and combi-weapon | MODEL | 0 | N/A | 1 | 1 | RESOLVED |
| chaos-space-marines | Chaos Terminator Squad | Chainfist and combi-bolter | MODEL | 0 | N/A | 1 | 1 | RESOLVED |
| chaos-space-marines | Chaos Terminator Squad | Heavy weapon | MODEL | 0 | N/A | 1 | 1 | RESOLVED |
| chaos-space-marines | Chaos Terminator Squad | Power fist and combi-bolter | MODEL | 0 | N/A | 1 | 1 | RESOLVED |
| chaos-space-marines | Chaos Terminator Squad | Chainfist and combi-weapon | MODEL | 0 | N/A | 1 | 1 | RESOLVED |
| chaos-space-marines | Chaos Terminator Squad | Paired accursed weapons | MODEL | 0 | N/A | 1 | 1 | RESOLVED |
| chaos-space-marines | Chaos Terminator Squad | Terminator Champion | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Chaos Terminator Squad | Chaos Terminators | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Chaos Terminator Squad | Terminator Champion | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Master Of Executions | Master of Executions | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Possessed | Possessed | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Possessed | Possessed | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Chosen | Chosen | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Chosen | Chosen Champion | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Chosen | Chosen | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Chosen | Chosen Champion | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Venomcrawler | Venomcrawler | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Chaos Bikers | Biker Champion | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Chaos Bikers | Biker | MODEL | 2 | N/A | 1 | 1 | RESOLVED |
| chaos-space-marines | Chaos Bikers | Bikers | MODEL_GROUP | 1 | N/A | 1 | 1 | RESOLVED |
| chaos-space-marines | Raptors | Raptor Champion | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Raptors | Raptor | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Raptors | Raptors | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Warp Talons | Warp Talon Champion | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Warp Talons | Warp Talon | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Warp Talons | Warp Talons | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Havocs | Havoc Champion | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Havocs | Havoc | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Havocs | Havocs | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Obliterators | Obliterator | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Noctilith Crown | Noctilith Crown | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Vashtorr The Arkifane | Vashtorr the Arkifane | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Traitor Guardsmen Squad | Traitor Sergeant | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Traitor Guardsmen Squad | Guardsman | MODEL | 1 | N/A | 1 | 1 | RESOLVED |
| chaos-space-marines | Traitor Guardsmen Squad | Traitor Guardsmen | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Fellgor Beastmen | Fellgor Champion | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Fellgor Beastmen | Beastman | MODEL | 1 | N/A | 1 | 1 | RESOLVED |
| chaos-space-marines | Fellgor Beastmen | Beastmen | MODEL_GROUP | 1 | N/A | 1 | 1 | RESOLVED |
| chaos-space-marines | Traitor Enforcer | Traitor Enforcer | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Traitor Enforcer | Traitor Ogryn | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Chaos Land Raider | Chaos Land Raider | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Chaos Predator Annihilator | Chaos Predator Annihilator | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Chaos Predator Destructor | Chaos Predator Destructor | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Chaos Vindicator | Chaos Vindicator | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Forgefiend | Forgefiend | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Helbrute | Helbrute | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Heldrake | Heldrake | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Maulerfiend | Maulerfiend | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Chaos Rhino | Chaos Rhino | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Khorne Lord Of Skulls | Khorne Lord of Skulls | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Chaos Spawn | Chaos Spawn | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Mutilators | Mutilator | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Chaos Lord with Jump Pack | Chaos Lord with Jump Pack | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Cultist Firebrand | Cultist Firebrand | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Nemesis Claw | Visionary | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Nemesis Claw | Legionary | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Nemesis Claw | Legionaries | MODEL_GROUP | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Masters of the Maelstrom | Garreon the Corpsemaster | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Masters of the Maelstrom | Garlon Souleater | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Masters of the Maelstrom | Katar Garrix | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Masters of the Maelstrom | Captain Sargotta | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Masters of the Maelstrom | The Enforcer | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Red Corsairs Raiders | Red Corsairs Raider Champion | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Red Corsairs Raiders | Red Corsairs Raider | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Red Corsairs Reave-Captain | Red Corsairs Reave-captain | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Defiler | Defiler | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| chaos-space-marines | Kravek Morne | Kravek Morne | MODEL | 1 | N/A | 1 | N/A | RESOLVED |
| space-marines | Captain In Gravis Armour | Captain in Gravis Armour | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Captain In Phobos Armour | Captain in Phobos Armour | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Captain In Terminator Armour | Captain in Terminator Armour | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Captain With Jump Pack | Captain with Jump Pack | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Intercessor Squad | Intercessor Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Intercessor Squad | Intercessor | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Intercessor Squad | Intercessors | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| space-marines | Infernus Squad | Infernus Marines | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| space-marines | Infernus Squad | Infernus Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Infernus Squad | Infernus Marines | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| space-marines | Assault Intercessor Squad | Assault Intercessor Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Assault Intercessor Squad | Assault Intercessors | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| space-marines | Assault Intercessor Squad | Assault Intercessors | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| space-marines | Heavy Intercessor Squad | Heavy Intercessors | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| space-marines | Heavy Intercessor Squad | Heavy Intercessor Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Heavy Intercessor Squad | Heavy Intercessor | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Heavy Intercessor Squad | Heavy Intercessors | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| space-marines | Infiltrator Squad | Infiltrator | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Infiltrator Squad | Infiltrator Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Infiltrator Squad | Infiltrators | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| space-marines | Incursor Squad | Incursor Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Incursor Squad | Incursor | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Incursor Squad | Incursors | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| space-marines | Scout Squad | Scouts | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| space-marines | Scout Squad | Scout Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Scout Squad | Scout | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Scout Squad | Scouts | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| space-marines | Bladeguard Veteran Squad | Bladeguard Veterans | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| space-marines | Bladeguard Veteran Squad | Bladeguard Veteran Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Bladeguard Veteran Squad | Bladeguard Veterans | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| space-marines | Vanguard Veteran Squad With Jump Packs | Vanguard Veterans with Jump Packs | MODEL | 0 | 0 | 1 | 1 | RESOLVED |
| space-marines | Vanguard Veteran Squad With Jump Packs | Vanguard Veteran Sergeant with Jump Pack | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Vanguard Veteran Squad With Jump Packs | Vanguard Veteran | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| space-marines | Sternguard Veteran Squad | Sternguard Veteran | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Sternguard Veteran Squad | Sternguard Veteran Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Sternguard Veteran Squad | Sternguard Veterans | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| space-marines | Reiver Squad | Reivers | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| space-marines | Reiver Squad | Reiver Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Reiver Squad | Reivers | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| space-marines | Aggressor Squad | Aggressors | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| space-marines | Aggressor Squad | Aggressor Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Aggressor Squad | Aggressors | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| space-marines | Terminator Assault Squad | Assault Terminator | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| space-marines | Terminator Assault Squad | Assault Terminator Sergeant | MODEL | 2 | 0 | 1 | 1 | RESOLVED |
| space-marines | Terminator Squad | Terminator Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Terminator Squad | Terminator | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Terminator Squad | Terminators | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| space-marines | Invictor Tactical Warsuit | Invictor Tactical Warsuit | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Redemptor Dreadnought | Redemptor Dreadnought | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Ballistus Dreadnought | Ballistus Dreadnought | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Brutalis Dreadnought | Brutalis Dreadnought | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Outrider Squad | Outrider | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Outrider Squad | Outrider Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Outrider Squad | Invader ATV | MODEL | 0 | 0 | 0 | 0 | NOT_PROVEN |
| space-marines | Outrider Squad | Outriders | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| space-marines | Inceptor Squad | Inceptor Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Inceptor Squad | Inceptor | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Inceptor Squad | Inceptors | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| space-marines | Storm Speeder Hailstrike | Storm Speeder Hailstrike | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Storm Speeder Thunderstrike | Storm Speeder Thunderstrike | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Storm Speeder Hammerstrike | Storm Speeder Hammerstrike | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Hellblaster Squad | Hellblaster Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Hellblaster Squad | Hellblaster | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Hellblaster Squad | Hellblasters | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| space-marines | Eliminator Squad | Eliminator Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Eliminator Squad | Eliminator | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Eliminator Squad | Eliminators | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| space-marines | Desolation Squad | Desolation Marine | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Desolation Squad | Desolation Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Desolation Squad | Desolation Marines | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| space-marines | Firestrike Servo-turrets | Firestrike Servo-Turret | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| space-marines | Firestrike Servo-turrets | Firestrike Servo-Turrets | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Gladiator Lancer | Gladiator Lancer | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Gladiator Reaper | Gladiator Reaper | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Gladiator Valiant | Gladiator Valiant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Land Raider | Land Raider | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Land Raider Crusader | Land Raider Crusader | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Land Raider Redeemer | Land Raider Redeemer | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Repulsor | Repulsor | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Repulsor Executioner | Repulsor Executioner | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Rhino | Rhino | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Impulsor | Impulsor | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Drop Pod | Drop Pod | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Lieutenant | Lieutenant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Lieutenant In Phobos Armour | Lieutenant in Phobos Armour | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Librarian | Librarian | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Librarian In Phobos Armour | Librarian in Phobos Armour | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Librarian In Terminator Armour | Librarian in Terminator Armour | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Chaplain | Chaplain | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Chaplain In Terminator Armour | Chaplain in Terminator Armour | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Chaplain On Bike | Chaplain on Bike | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Chaplain With Jump Pack | Chaplain with Jump Pack | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Techmarine | Techmarine | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Lieutenant With Combi-weapon | Lieutenant with Combi-weapon | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Apothecary | Apothecary | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Apothecary Biologis | Apothecary Biologis | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Ancient | Ancient | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Bladeguard Ancient | Bladeguard Ancient | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Judiciar | Judiciar | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Captain | Captain | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Assault Intercessors With Jump Packs | Assault Intercessor Sergeant with Jump Pack | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Assault Intercessors With Jump Packs | Assault Intercessors with Jump Pack | MODEL | 2 | 0 | 1 | 1 | RESOLVED |
| space-marines | Company Heroes | Ancient | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Company Heroes | Company Champion | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Company Heroes | Company Veteran | MODEL | 2 | 0 | 2 | 0 | AMBIGUOUS |
| space-marines | Eradicator Squad with Heavy Bolters | Eradicator | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Eradicator Squad with Heavy Bolters | Eradicator Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Eradicator Squad with Heavy Bolters | Eradicators | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| space-marines | Land Speeder | Land Speeder | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Chief Librarian Tigurius | Chief Librarian Tigurius | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Roboute Guilliman | Roboute Guilliman | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Cato Sicarius | Cato Sicarius | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Victrix Honour Guard | Victrix Honour Guard | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Victrix Honour Guard | Chapter Champion | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Victrix Honour Guard | Chapter Ancient | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Victrix Honour Guard | Victrix Honour Guard | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Captain Titus | Captain Titus | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Wardens of Ultramar | Ancient Gadriel | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Wardens of Ultramar | Veteran Sergeant Metaurus | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Wardens of Ultramar | Gaius Silva | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Wardens of Ultramar | Aemelia Minervas | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Wardens of Ultramar | Dainal Kornelius | MODEL | 0 | 0 | 0 | 0 | NOT_PROVEN |
| space-marines | Wardens of Ultramar | Lucia Vestha | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Darnath Lysander | Darnath Lysander | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Tor Garadon | Tor Garadon | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Iron Father Feirros | Iron Father Feirros | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Caanok Var | Caanok Var | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Kayvaan Shrike | Kayvaan Shrike | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Aethon Shaan | Aethon Shaan | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Adrax Agatone | Adrax Agatone | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Vulkan He’stan | Vulkan He'stan | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Kor’sarro Khan | Kor'sarro Khan | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| space-marines | Suboden Khan | Suboden Khan | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Astorath | Astorath | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Baal Predator | Baal Predator | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Chief Librarian Mephiston | Chief Librarian Mephiston | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Commander Dante | Commander Dante | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Death Company Marines With Jump Packs | Death Company Marine | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| blood-angels | Death Company Marines With Jump Packs | Death Company Marines | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| blood-angels | Lemartes | Lemartes | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Sanguinary Guard | Sanguinary Guard | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Sanguinary Guard | Sanguinary Guard | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Sanguinary Priest | Sanguinary Priest | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | The Sanguinor | The Sanguinor | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Blood Angels Captain | Blood Angels Captain | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Death Company Captain | Death Company Captain | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Death Company Captain with jump pack | Death Company Captain with Jump Pack | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Death Company Marines | Death Company Marine | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| blood-angels | Death Company Marines | Death Company Marines | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Death Company Dreadnought | Death Company Dreadnought | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Captain In Gravis Armour | Captain in Gravis Armour | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Captain In Phobos Armour | Captain in Phobos Armour | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Captain In Terminator Armour | Captain in Terminator Armour | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Captain With Jump Pack | Captain with Jump Pack | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Intercessor Squad | Intercessor Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Intercessor Squad | Intercessor | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Intercessor Squad | Intercessors | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| blood-angels | Infernus Squad | Infernus Marines | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| blood-angels | Infernus Squad | Infernus Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Infernus Squad | Infernus Marines | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| blood-angels | Assault Intercessor Squad | Assault Intercessor Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Assault Intercessor Squad | Assault Intercessors | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| blood-angels | Assault Intercessor Squad | Assault Intercessors | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| blood-angels | Heavy Intercessor Squad | Heavy Intercessors | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| blood-angels | Heavy Intercessor Squad | Heavy Intercessor Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Heavy Intercessor Squad | Heavy Intercessor | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Heavy Intercessor Squad | Heavy Intercessors | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| blood-angels | Infiltrator Squad | Infiltrator | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Infiltrator Squad | Infiltrator Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Infiltrator Squad | Infiltrators | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| blood-angels | Incursor Squad | Incursor Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Incursor Squad | Incursor | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Incursor Squad | Incursors | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| blood-angels | Scout Squad | Scouts | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| blood-angels | Scout Squad | Scout Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Scout Squad | Scout | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Scout Squad | Scouts | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| blood-angels | Bladeguard Veteran Squad | Bladeguard Veterans | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| blood-angels | Bladeguard Veteran Squad | Bladeguard Veteran Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Bladeguard Veteran Squad | Bladeguard Veterans | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| blood-angels | Vanguard Veteran Squad With Jump Packs | Vanguard Veterans with Jump Packs | MODEL | 0 | 0 | 1 | 1 | RESOLVED |
| blood-angels | Vanguard Veteran Squad With Jump Packs | Vanguard Veteran Sergeant with Jump Pack | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Vanguard Veteran Squad With Jump Packs | Vanguard Veteran | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| blood-angels | Sternguard Veteran Squad | Sternguard Veteran | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Sternguard Veteran Squad | Sternguard Veteran Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Sternguard Veteran Squad | Sternguard Veterans | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| blood-angels | Reiver Squad | Reivers | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| blood-angels | Reiver Squad | Reiver Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Reiver Squad | Reivers | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| blood-angels | Aggressor Squad | Aggressors | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| blood-angels | Aggressor Squad | Aggressor Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Aggressor Squad | Aggressors | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| blood-angels | Terminator Assault Squad | Assault Terminator | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| blood-angels | Terminator Assault Squad | Assault Terminator Sergeant | MODEL | 2 | 0 | 1 | 1 | RESOLVED |
| blood-angels | Terminator Squad | Terminator Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Terminator Squad | Terminator | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Terminator Squad | Terminators | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| blood-angels | Invictor Tactical Warsuit | Invictor Tactical Warsuit | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Redemptor Dreadnought | Redemptor Dreadnought | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Ballistus Dreadnought | Ballistus Dreadnought | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Brutalis Dreadnought | Brutalis Dreadnought | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Outrider Squad | Outrider | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Outrider Squad | Outrider Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Outrider Squad | Invader ATV | MODEL | 0 | 0 | 0 | 0 | NOT_PROVEN |
| blood-angels | Outrider Squad | Outriders | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| blood-angels | Inceptor Squad | Inceptor Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Inceptor Squad | Inceptor | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Inceptor Squad | Inceptors | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| blood-angels | Storm Speeder Hailstrike | Storm Speeder Hailstrike | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Storm Speeder Thunderstrike | Storm Speeder Thunderstrike | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Storm Speeder Hammerstrike | Storm Speeder Hammerstrike | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Hellblaster Squad | Hellblaster Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Hellblaster Squad | Hellblaster | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Hellblaster Squad | Hellblasters | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| blood-angels | Eliminator Squad | Eliminator Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Eliminator Squad | Eliminator | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Eliminator Squad | Eliminators | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| blood-angels | Desolation Squad | Desolation Marine | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Desolation Squad | Desolation Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Desolation Squad | Desolation Marines | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| blood-angels | Firestrike Servo-turrets | Firestrike Servo-Turret | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| blood-angels | Firestrike Servo-turrets | Firestrike Servo-Turrets | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Gladiator Lancer | Gladiator Lancer | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Gladiator Reaper | Gladiator Reaper | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Gladiator Valiant | Gladiator Valiant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Land Raider | Land Raider | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Land Raider Crusader | Land Raider Crusader | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Land Raider Redeemer | Land Raider Redeemer | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Repulsor | Repulsor | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Repulsor Executioner | Repulsor Executioner | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Rhino | Rhino | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Impulsor | Impulsor | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Drop Pod | Drop Pod | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Lieutenant | Lieutenant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Lieutenant In Phobos Armour | Lieutenant in Phobos Armour | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Librarian | Librarian | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Librarian In Phobos Armour | Librarian in Phobos Armour | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Librarian In Terminator Armour | Librarian in Terminator Armour | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Chaplain | Chaplain | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Chaplain In Terminator Armour | Chaplain in Terminator Armour | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Chaplain On Bike | Chaplain on Bike | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Chaplain With Jump Pack | Chaplain with Jump Pack | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Techmarine | Techmarine | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Lieutenant With Combi-weapon | Lieutenant with Combi-weapon | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Apothecary | Apothecary | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Apothecary Biologis | Apothecary Biologis | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Ancient | Ancient | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Bladeguard Ancient | Bladeguard Ancient | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Judiciar | Judiciar | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Captain | Captain | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Assault Intercessors With Jump Packs | Assault Intercessor Sergeant with Jump Pack | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Assault Intercessors With Jump Packs | Assault Intercessors with Jump Pack | MODEL | 2 | 0 | 1 | 1 | RESOLVED |
| blood-angels | Company Heroes | Ancient | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Company Heroes | Company Champion | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Company Heroes | Company Veteran | MODEL | 2 | 0 | 2 | 0 | AMBIGUOUS |
| blood-angels | Eradicator Squad with Heavy Bolters | Eradicator | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Eradicator Squad with Heavy Bolters | Eradicator Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| blood-angels | Eradicator Squad with Heavy Bolters | Eradicators | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| blood-angels | Land Speeder | Land Speeder | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Azrael | Azrael | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Belial | Belial | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Sammael | Sammael | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Ezekiel | Ezekiel | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Asmodai | Asmodai | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Lion El’jonson | Lion El'Jonson | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Lazarus | Lazarus | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Nephilim Jetfighter | Nephilim Jetfighter | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Ravenwing Dark Talon | Ravenwing Dark Talon | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Land Speeder Vengeance | Land Speeder Vengeance | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Ravenwing Darkshroud | Ravenwing Darkshroud | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Ravenwing Black Knights | Ravenwing Huntmaster | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Ravenwing Black Knights | Ravenwing Black Knight | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Ravenwing Black Knights | Ravenwing Black Knights | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| dark-angels | Ravenwing Command Squad | Ravenwing Ancient | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Ravenwing Command Squad | Ravenwing Apothecary | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Ravenwing Command Squad | Ravenwing Champion | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Deathwing Knights | Deathwing Knight | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| dark-angels | Deathwing Knights | Knight Master | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Deathwing Knights | Deathwing Knights | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Deathwing Terminator Squad | Deathwing Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Deathwing Terminator Squad | Deathwing Terminator | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| dark-angels | Inner Circle Companions | Inner Circle Companion | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| dark-angels | Inner Circle Companions | Companions | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| dark-angels | Captain In Gravis Armour | Captain in Gravis Armour | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Captain In Phobos Armour | Captain in Phobos Armour | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Captain In Terminator Armour | Captain in Terminator Armour | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Captain With Jump Pack | Captain with Jump Pack | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Intercessor Squad | Intercessor Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Intercessor Squad | Intercessor | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Intercessor Squad | Intercessors | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| dark-angels | Infernus Squad | Infernus Marines | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| dark-angels | Infernus Squad | Infernus Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Infernus Squad | Infernus Marines | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| dark-angels | Assault Intercessor Squad | Assault Intercessor Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Assault Intercessor Squad | Assault Intercessors | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| dark-angels | Assault Intercessor Squad | Assault Intercessors | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| dark-angels | Heavy Intercessor Squad | Heavy Intercessors | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| dark-angels | Heavy Intercessor Squad | Heavy Intercessor Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Heavy Intercessor Squad | Heavy Intercessor | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Heavy Intercessor Squad | Heavy Intercessors | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| dark-angels | Infiltrator Squad | Infiltrator | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Infiltrator Squad | Infiltrator Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Infiltrator Squad | Infiltrators | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| dark-angels | Incursor Squad | Incursor Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Incursor Squad | Incursor | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Incursor Squad | Incursors | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| dark-angels | Scout Squad | Scouts | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| dark-angels | Scout Squad | Scout Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Scout Squad | Scout | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Scout Squad | Scouts | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| dark-angels | Bladeguard Veteran Squad | Bladeguard Veterans | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| dark-angels | Bladeguard Veteran Squad | Bladeguard Veteran Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Bladeguard Veteran Squad | Bladeguard Veterans | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| dark-angels | Vanguard Veteran Squad With Jump Packs | Vanguard Veterans with Jump Packs | MODEL | 0 | 0 | 1 | 1 | RESOLVED |
| dark-angels | Vanguard Veteran Squad With Jump Packs | Vanguard Veteran Sergeant with Jump Pack | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Vanguard Veteran Squad With Jump Packs | Vanguard Veteran | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| dark-angels | Sternguard Veteran Squad | Sternguard Veteran | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Sternguard Veteran Squad | Sternguard Veteran Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Sternguard Veteran Squad | Sternguard Veterans | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| dark-angels | Reiver Squad | Reivers | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| dark-angels | Reiver Squad | Reiver Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Reiver Squad | Reivers | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| dark-angels | Aggressor Squad | Aggressors | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| dark-angels | Aggressor Squad | Aggressor Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Aggressor Squad | Aggressors | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| dark-angels | Terminator Assault Squad | Assault Terminator | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| dark-angels | Terminator Assault Squad | Assault Terminator Sergeant | MODEL | 2 | 0 | 1 | 1 | RESOLVED |
| dark-angels | Terminator Squad | Terminator Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Terminator Squad | Terminator | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Terminator Squad | Terminators | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| dark-angels | Invictor Tactical Warsuit | Invictor Tactical Warsuit | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Redemptor Dreadnought | Redemptor Dreadnought | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Ballistus Dreadnought | Ballistus Dreadnought | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Brutalis Dreadnought | Brutalis Dreadnought | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Outrider Squad | Outrider | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Outrider Squad | Outrider Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Outrider Squad | Invader ATV | MODEL | 0 | 0 | 0 | 0 | NOT_PROVEN |
| dark-angels | Outrider Squad | Outriders | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| dark-angels | Inceptor Squad | Inceptor Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Inceptor Squad | Inceptor | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Inceptor Squad | Inceptors | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| dark-angels | Storm Speeder Hailstrike | Storm Speeder Hailstrike | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Storm Speeder Thunderstrike | Storm Speeder Thunderstrike | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Storm Speeder Hammerstrike | Storm Speeder Hammerstrike | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Hellblaster Squad | Hellblaster Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Hellblaster Squad | Hellblaster | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Hellblaster Squad | Hellblasters | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| dark-angels | Eliminator Squad | Eliminator Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Eliminator Squad | Eliminator | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Eliminator Squad | Eliminators | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| dark-angels | Desolation Squad | Desolation Marine | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Desolation Squad | Desolation Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Desolation Squad | Desolation Marines | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| dark-angels | Firestrike Servo-turrets | Firestrike Servo-Turret | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| dark-angels | Firestrike Servo-turrets | Firestrike Servo-Turrets | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Gladiator Lancer | Gladiator Lancer | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Gladiator Reaper | Gladiator Reaper | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Gladiator Valiant | Gladiator Valiant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Land Raider | Land Raider | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Land Raider Crusader | Land Raider Crusader | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Land Raider Redeemer | Land Raider Redeemer | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Repulsor | Repulsor | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Repulsor Executioner | Repulsor Executioner | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Rhino | Rhino | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Impulsor | Impulsor | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Drop Pod | Drop Pod | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Lieutenant | Lieutenant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Lieutenant In Phobos Armour | Lieutenant in Phobos Armour | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Librarian | Librarian | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Librarian In Phobos Armour | Librarian in Phobos Armour | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Librarian In Terminator Armour | Librarian in Terminator Armour | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Chaplain | Chaplain | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Chaplain In Terminator Armour | Chaplain in Terminator Armour | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Chaplain On Bike | Chaplain on Bike | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Chaplain With Jump Pack | Chaplain with Jump Pack | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Techmarine | Techmarine | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Lieutenant With Combi-weapon | Lieutenant with Combi-weapon | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Apothecary | Apothecary | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Apothecary Biologis | Apothecary Biologis | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Ancient | Ancient | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Bladeguard Ancient | Bladeguard Ancient | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Judiciar | Judiciar | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Captain | Captain | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Assault Intercessors With Jump Packs | Assault Intercessor Sergeant with Jump Pack | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Assault Intercessors With Jump Packs | Assault Intercessors with Jump Pack | MODEL | 2 | 0 | 1 | 1 | RESOLVED |
| dark-angels | Company Heroes | Ancient | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Company Heroes | Company Champion | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Company Heroes | Company Veteran | MODEL | 2 | 0 | 2 | 0 | AMBIGUOUS |
| dark-angels | Eradicator Squad with Heavy Bolters | Eradicator | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Eradicator Squad with Heavy Bolters | Eradicator Sergeant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| dark-angels | Eradicator Squad with Heavy Bolters | Eradicators | MODEL_GROUP | 1 | 0 | 1 | 0 | NOT_PROVEN |
| dark-angels | Land Speeder | Land Speeder | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Commander Shadowsun | Commander Shadowsun | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Commander Farsight | Commander Farsight | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Commander In Enforcer Battlesuit | Commander in Enforcer Battlesuit | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Commander In Coldstar Battlesuit | Commander in Coldstar Battlesuit | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Cadre Fireblade | Cadre Fireblade | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Ethereal | Ethereal | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Darkstrider | Darkstrider | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Strike Team | Fire Warrior | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| tau-empire | Strike Team | Fire Warrior Shas'ui | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Strike Team | Fire Warriors | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Strike Team | Fire Warrior Shas'ui | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Breacher Team | Breacher Fire Warriors | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Breacher Team | Breacher Fire Warrior Shas'ui | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Breacher Team | Breacher Fire Warrior Shas'ui | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Kroot Carnivores | Kroot Carnivores | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Kroot Carnivores | Kroot Carnivore | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| tau-empire | Kroot Carnivores | Long-quill | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Kroot Carnivores | Kroot Carnivores | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Kroot Carnivores | Long-quill | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Krootox Riders | Krootox Rider | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| tau-empire | Krootox Riders | Krootox Riders | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Stealth Battlesuits | Stealth Shas'ui | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Stealth Battlesuits | Stealth Shas'vre | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Stealth Battlesuits | Stealth Shas'ui | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Stealth Battlesuits | Stealth Shas'vre | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Ghostkeel Battlesuit | Ghostkeel Battlesuit | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Firesight Team | Firesight Team | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Pathfinder Team | Pathfinders | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Pathfinder Team | Pathfinder Shas'ui | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Pathfinder Team | Pathfinders | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Pathfinder Team | Pathfinder Shas'ui | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Piranhas | Piranhas | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Vespid Stingwings | Vespid Strain Leader | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Vespid Stingwings | Vespid Stingwings | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Vespid Stingwings | Vespid Strain Leader | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Vespid Stingwings | Vespid Stingwings | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Kroot Hounds | Kroot Hounds | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Kroot Hounds | Kroot Hounds | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Broadside Battlesuits | Broadside Shas’ui | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Broadside Battlesuits | Broadside Shas’vre | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Broadside Battlesuits | Broadside Shas’ui (0-2) | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| tau-empire | Broadside Battlesuits | Broadside Shas’vre | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Riptide Battlesuit | Riptide Battlesuit | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Hammerhead Gunship | Hammerhead Gunship | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Sky Ray Gunship | Sky Ray Gunship | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Devilfish | Devilfish | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Razorshark Strike Fighter | Razorshark Strike Fighter | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Sun Shark Bomber | Sun Shark Bomber | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Tidewall Shieldline | Tidewall Shieldline | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Tidewall Droneport | Tidewall Droneport | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Tidewall Gunrig | Tidewall Gunrig | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Stormsurge | Stormsurge | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Kroot Farstalkers | Kroot Hounds | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Kroot Farstalkers | Kroot Farstalker | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Kroot Farstalkers | Kroot Kill-broker | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Kroot Farstalkers | Kroot Farstalkers | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Kroot Farstalkers | Kroot Kill-broker | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Ta’unar Supremacy Armour | Ta'unar Supremacy Armour | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Tiger Shark | Tiger Shark | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | AX-1-0 Tiger Shark | AX-1-0 Tiger Shark | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Manta | Manta | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Crisis Sunforge Battlesuits | Crisis Sunforge Shas’ui | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Crisis Sunforge Battlesuits | Crisis Sunforge Shas’vre | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Crisis Sunforge Battlesuits | Crisis Sunforge Shas’vre | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Crisis Fireknife Battlesuits | Crisis Fireknife Shas’ui | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Crisis Fireknife Battlesuits | Crisis Fireknife Shas’vre | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Crisis Fireknife Battlesuits | Crisis Fireknife Shas’vre | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Crisis Starscythe Battlesuits | Crisis Starscythe Shas’ui | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Crisis Starscythe Battlesuits | Crisis Starscythe Shas’vre | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Crisis Starscythe Battlesuits | Crisis Starscythe Shas’vre | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Kroot Trail Shaper | Kroot Trail Shaper | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Kroot War Shaper | Kroot War Shaper | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Kroot Flesh Shaper | Kroot Flesh Shaper | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Kroot Lone-Spear | Kroot Lone-spear | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Krootox Rampagers | Krootox Rampagers | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | Krootox Rampagers | Krootox Rampagers | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | The Twin Lance | Ri'Lantar | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tau-empire | The Twin Lance | Ri'Locai | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Tervigon | Tervigon | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | The Swarmlord | The Swarmlord | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Broodlord | Broodlord | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Old One Eye | Old One Eye | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Tyranid Warriors With Ranged Bio-weapons | Tyranid Prime | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Tyranid Warriors With Ranged Bio-weapons | Tyranid Warrior | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Tyranid Warriors With Ranged Bio-weapons | Tyranid Prime | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Tyranid Warriors With Ranged Bio-weapons | Tyranid Warriors | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Tyranid Warriors With Melee Bio-weapons | Tyranid Prime | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Tyranid Warriors With Melee Bio-weapons | Tyranid Warrior | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Tyranid Warriors With Melee Bio-weapons | Tyranid Prime | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Tyranid Warriors With Melee Bio-weapons | Tyranid Warriors | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Termagants | Termagants | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Termagants | Termagant | MODEL | 1 | 0 | 1 | 1 | RESOLVED |
| tyranids | Termagants | Termagants | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Hormagaunts | Hormagaunts | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Hormagaunts | Hormagaunts | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Toxicrene | Toxicrene | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Tyrant Guard | Tyrant Guard | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Tyrant Guard | Tyrant Guard | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Neurotyrant | Neurotyrant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Maleceptor | Maleceptor | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Pyrovores | Pyrovore | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Pyrovores | Pyrovores | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Haruspex | Haruspex | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Venomthropes | Venomthrope | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Venomthropes | Venomthropes | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Neurogaunts | Neurogaunt Nodebeast | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Neurogaunts | Neurogaunt | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Neurogaunts | Neurogaunt Nodebeasts | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Neurogaunts | Neurogaunts | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Zoanthropes | Neurothrope | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Zoanthropes | Zoanthrope | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Zoanthropes | Neurothrope | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Zoanthropes | Zoanthropes | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Mucolid Spores | Mucolid Spore | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Spore Mines | Spore Mine | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Exocrine | Exocrine | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Biovores | Biovore | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Carnifexes | Carnifex | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Screamer-killer | Screamer-killer | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Hive Guard | Hive Guard | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Hive Guard | Hive Guard | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Tyrannofex | Tyrannofex | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Hive Crone | Hive Crone | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Harpy | Harpy | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Sporocyst | Sporocyst | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Psychophage | Psychophage | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Barbgaunts | Barbgaunt | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Harridan | Harridan | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Hierophant | Hierophant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Genestealers | Genestealer | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Genestealers | Genestealers | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Norn Assimilator | Norn Assimilator | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Norn Emissary | Norn Emissary | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Hive Tyrant | Hive Tyrant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Tyranid Prime with Lash Whip | Tyranid Prime with Lash Whip | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Winged Hive Tyrant | Winged Hive Tyrant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Winged Tyranid Prime | Winged Tyranid Prime | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Deathleaper | Deathleaper | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Gargoyles | Gargoyles | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Hyperadapted Raveners | Ravener Prime | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Hyperadapted Raveners | Ravener | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Hyperadapted Raveners | Raveners | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Lictor | Lictor | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Mawloc | Mawloc | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Neurolictor | Neurolictor | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Parasite Of Mortrex | Parasite of Mortrex | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Raveners | Ravener | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Raveners | Raveners | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Trygon | Trygon | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Tyrannocyte | Tyrannocyte | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Von Ryan’s Leapers | Von Ryan's Leaper | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Von Ryan’s Leapers | Von Ryan's Leapers | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | Ripper Swarms | Ripper Swarm | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| tyranids | The Red Terror | The Red Terror | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Lucius the Eternal | Lucius the Eternal | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Fulgrim | Fulgrim | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Lord Exultant | Lord Exultant | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Lord Kakophonist | Lord Kakophonist | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Sorcerer | Sorcerer | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Daemon Prince of Slaanesh | Daemon Prince of Slaanesh | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Daemon Prince of Slaanesh with Wings | Daemon Prince of Slaanesh with Wings | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Tormentors | Obsessionist | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Tormentors | Tormentor | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Tormentors | Tormentors | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Infractors | Obsessionist | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Infractors | Infractor | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Infractors | Infractors | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Flawless Blades | Flawless Blade | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Chaos Terminators | Accursed weapon and combi-bolter | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Chaos Terminators | Accursed weapon and combi-weapon | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Chaos Terminators | Power fist and combi-weapon | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Chaos Terminators | Chainfist and combi-bolter | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Chaos Terminators | Heavy weapon | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Chaos Terminators | Power fist and combi-bolter | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Chaos Terminators | Chainfist and combi-weapon | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Chaos Terminators | Paired accursed weapons | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Chaos Terminators | Terminator Champion | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Chaos Terminators | Terminators | MODEL_GROUP | 1 | 0 | 1 | 1 | RESOLVED |
| emperors-children | Chaos Spawn | Chaos Spawn | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Chaos Land Raider | Chaos Land Raider | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Noise Marines | Disharmonist | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Noise Marines | Noise Marine | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Noise Marines | Noise Marines | MODEL_GROUP | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Heldrake | Heldrake | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Maulerfiend | Maulerfiend | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Chaos Rhino | Chaos Rhino | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Shalaxi Helbane | Shalaxi Helbane | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Keeper of Secrets | Keeper of Secrets | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Daemonettes | Daemonette | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Daemonettes | Alluress | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Fiends | Fiends | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Fiends | Blissbringer | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Seekers | Seeker | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Seekers | Heartseeker | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
| emperors-children | Defiler | Defiler | MODEL | 1 | 1 | 1 | 1 | RESOLVED |
