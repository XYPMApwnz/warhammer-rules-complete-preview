# Native New Recruit export import

Baseline: `6fdb77a320b3907e206e08f9c4a6167c12593eb7`.
Feature: `codex/new-recruit-export-import-v1`.

## Export faction identities

Six existing faction gates use one common exact normalized-vocabulary checker in
`books/shared/roster-v2/export-faction.mjs`. Labels belong to producer metadata,
not the shared checker. Existing apostrophe/case/diacritic normalization and the
three SM-family importers' normalized-empty compatibility are retained. Missing
and literal em-dash headers retain their former treatment. No substring matching
or new faction gate is introduced.

| Book | Previously accepted normalized labels | Added accepted catalogue spelling | Foreign header |
| --- | --- | --- | --- |
| adeptus-mechanicus | No faction-header gate | Already accepted; no new equivalence class | Still accepted by this header check; normal identity/physical validation remains |
| blood-angels | blood angels; space marines; adeptus astartes; imperium adeptus astartes blood angels | Already accepted; no new equivalence class | FOREIGN_FACTION_EXPORT |
| chaos-space-marines | No faction-header gate | Already accepted; no new equivalence class | Still accepted by this header check; normal identity/physical validation remains |
| dark-angels | dark angels; space marines; adeptus astartes; imperium adeptus astartes dark angels | Already accepted; no new equivalence class | FOREIGN_FACTION_EXPORT |
| death-guard | No faction-header gate | Already accepted; no new equivalence class | Still accepted by this header check; normal identity/physical validation remains |
| emperors-children | emperors children; chaos emperors children | Already accepted; no new equivalence class | FOREIGN_FACTION_EXPORT |
| space-marines | space marines; adeptus astartes; imperium adeptus astartes space marines | Already accepted; no new equivalence class | FOREIGN_FACTION_EXPORT |
| tau-empire | tau empire | Xenos - T'au Empire | FOREIGN_FACTION_EXPORT |
| tyranids | tyranids | Xenos - Tyranids | FOREIGN_FACTION_EXPORT |

Catalogue identity assertions read pinned BSData captures. Death Guard has no
captured BSData catalogue in Git: its `Chaos - Death Guard` diagnostic label is
explicitly owner-provided, not falsely attributed to a captured file. AM, DG and
CSM accept an unrelated faction header on an otherwise valid native roster,
exactly as before; they still validate canonical units and physical choices.

## Physical singleton proof

`books/shared/roster-v2/singleton-model-import.mjs` is an import proof helper,
not an effect or condition computer. A confirmed Starting Strength of one, one
existing row of quantity one, and an already resolved canonical profile prove
the sole MODEL. Only non-weapon equipment with the existing source binding
`modelEffectRequiresConfirmedBearer` moves from UNIT inventory to that row.
Selection identity, canonical IDs, exact field paths, original UNIT-origin
quantity evidence and source references are retained; per-MODEL quantity is
proved from the sole existing MODEL. The occurrence is transferred once, never
copied. Multi-MODEL inventory and already MODEL-owned selections do not change.
The common import service applies the proof before its existing checked load.
No saved-roster migration, public method or new player-choice state is added.

The complete survey also found Tau Broadside's compact singleton composition
ambiguity. Its two member identities share a stat profile. A second common
helper accepts only the unique source-required member (minimum one, every other
member minimum zero, matching the already resolved profile). It never chooses
the first member or infers an identity from one statline. Tau's existing binder
consumes this proof; explicit rows and ambiguous multi-MODEL cases stay intact.

No rule text, recipient, classification, condition, policy, effect data, effect
interpreter, attached-rule-text path, stratagem or detachment rule is edited.

## Complete optional-equipment survey

Exact entity/block `wargearAbility === true` census: 89 contexts; 38 optional
physical-one contexts, covering 26 unique rule fields and 18 unique canonical
units; 51 source-composition/fixed-equipment exclusions. No flagged singleton
case exists in DG or Tyranids. Generic Tau drone selections are not flagged
wargearAbility records; their existing I-2 behavior is covered by unchanged
native fixtures, rather than reclassified as optional-ability source records.

Each candidate is imported as compact, explicit MODEL row, post-row loadout and
absent. The independent expected signature comes from the unmodified baseline's
explicit-row and absent results. These synthetic fixtures isolate the equipment
selection; they do not claim a complete tournament-legal weapon loadout.

| Book | MODEL / unit | Equipment ability | Baseline compact vs row | Feature compact vs row |
| --- | --- | --- | --- | --- |
| adeptus-mechanicus | Archaeopter Fusilave | Chaff Launcher | MATCH | MATCH |
| adeptus-mechanicus | Archaeopter Fusilave | Command Uplink | MATCH | MATCH |
| adeptus-mechanicus | Archaeopter Stratoraptor | Chaff Launcher | MATCH | MATCH |
| adeptus-mechanicus | Archaeopter Stratoraptor | Command Uplink | MATCH | MATCH |
| adeptus-mechanicus | Archaeopter Transvector | Chaff Launcher | MATCH | MATCH |
| adeptus-mechanicus | Archaeopter Transvector | Command Uplink | MATCH | MATCH |
| adeptus-mechanicus | Onager Dunecrawler | Broad spectrum data-tether | MATCH | MATCH |
| chaos-space-marines | Sorcerer In Terminator Armour | Chaos familiar | MATCH | MATCH |
| emperors-children | Keeper of Secrets | shining aegis | MATCH | MATCH |
| tau-empire | Commander In Coldstar Battlesuit | Battlesuit Support System | MATCH | MATCH |
| tau-empire | Commander In Coldstar Battlesuit | Shield Generator | MATCH | MATCH |
| tau-empire | Commander In Coldstar Battlesuit | Weapon Support System | MATCH | MATCH |
| tau-empire | Commander In Enforcer Battlesuit | Battlesuit Support System | MATCH | MATCH |
| tau-empire | Commander In Enforcer Battlesuit | Shield Generator | MATCH | MATCH |
| tau-empire | Commander In Enforcer Battlesuit | Weapon Support System | MATCH | MATCH |
| tau-empire | Ethereal | Hover Drone | MATCH | MATCH |
| tau-empire | Broadside Battlesuits | Weapon Support System | DIFFERENCE | MATCH |
| tau-empire | Ghostkeel Battlesuit | Battlesuit Support System | MATCH | MATCH |
| tau-empire | Tiger Shark | Transport Bay | MATCH | MATCH |
| space-marines | Lieutenant | Storm Shield | DIFFERENCE | MATCH |
| space-marines | Chaplain In Terminator Armour | Relic Shield | DIFFERENCE | MATCH |
| space-marines | Impulsor | Shield Dome | MATCH | MATCH |
| space-marines | Impulsor | Orbital Comms Array | MATCH | MATCH |
| space-marines | Captain | Relic Shield | DIFFERENCE | MATCH |
| space-marines | Captain With Jump Pack | Relic Shield | DIFFERENCE | MATCH |
| dark-angels | Lieutenant | Storm Shield | DIFFERENCE | MATCH |
| dark-angels | Chaplain In Terminator Armour | Relic Shield | DIFFERENCE | MATCH |
| dark-angels | Impulsor | Shield Dome | MATCH | MATCH |
| dark-angels | Impulsor | Orbital Comms Array | MATCH | MATCH |
| dark-angels | Captain | Relic Shield | DIFFERENCE | MATCH |
| dark-angels | Captain With Jump Pack | Relic Shield | DIFFERENCE | MATCH |
| blood-angels | Death Company Captain with jump pack | Relic Shield | DIFFERENCE | MATCH |
| blood-angels | Lieutenant | Storm Shield | DIFFERENCE | MATCH |
| blood-angels | Chaplain In Terminator Armour | Relic Shield | DIFFERENCE | MATCH |
| blood-angels | Impulsor | Shield Dome | MATCH | MATCH |
| blood-angels | Impulsor | Orbital Comms Array | MATCH | MATCH |
| blood-angels | Captain | Relic Shield | DIFFERENCE | MATCH |
| blood-angels | Captain With Jump Pack | Relic Shield | DIFFERENCE | MATCH |

Baseline differences: 13 SM-family equipment cases (SM 4, DA 4, BA 5), plus
Broadside NEEDS_BINDINGS versus READY. Feature differences: zero of 38 pairs.
The three shared Relic Shield carriers in each SM-family book (Captain, Captain
With Jump Pack, Chaplain In Terminator Armour) change compact W 5 to W 6. BA's
Death Company Captain with jump pack changes W 5 to W 6 as well. Each family's
Lieutenant gains the previously missing INSV 4+ field from Storm Shield. Compact
Broadside now imports READY with the same W 8 and support-system result as the
baseline explicit Shas'vre row. All 24 formerly matching contexts remain equal
to their source-backed baseline explicit-row control.
SM/DA/BA Captain additionally use the owner's literal compact weapon-and-shield
line: W 6 with Relic shield, W 5 without. The native queued QA checks both.

| Book | Excluded owner | Source field | Reason |
| --- | --- | --- | --- |
| death-guard | Deathshroud Terminators | datasheet-deathshroud-terminators:section:1/blocks/2/text | Canonical minimum composition exceeds one physical model |
| death-guard | Plague Drones | datasheet-plague-drones:section:1/blocks/1/text | Canonical minimum composition exceeds one physical model |
| death-guard | Plague Drones | datasheet-plague-drones:section:1/blocks/2/text | Canonical minimum composition exceeds one physical model |
| death-guard | Plague Marines | datasheet-plague-marines:section:1/blocks/1/text | Canonical minimum composition exceeds one physical model |
| death-guard | Plaguebearers | datasheet-plaguebearers:section:1/blocks/1/text | Canonical minimum composition exceeds one physical model |
| death-guard | Plaguebearers | datasheet-plaguebearers:section:1/blocks/2/text | Canonical minimum composition exceeds one physical model |
| adeptus-mechanicus | Serberys Raiders | datasheet-serberys-raiders:section:1/blocks/1/text | Canonical minimum composition exceeds one physical model |
| adeptus-mechanicus | Skitarii Rangers | datasheet-skitarii-rangers:section:1/blocks/1/text | Canonical minimum composition exceeds one physical model |
| adeptus-mechanicus | Skitarii Rangers | datasheet-skitarii-rangers:section:1/blocks/2/text | Canonical minimum composition exceeds one physical model |
| adeptus-mechanicus | Skitarii Vanguard | datasheet-skitarii-vanguard:section:1/blocks/1/text | Canonical minimum composition exceeds one physical model |
| adeptus-mechanicus | Skitarii Vanguard | datasheet-skitarii-vanguard:section:1/blocks/2/text | Canonical minimum composition exceeds one physical model |
| chaos-space-marines | Legionaries | datasheet-legionaries:section:1:block:1:text/text | Canonical minimum composition exceeds one physical model |
| chaos-space-marines | Dark Commune | datasheet-dark-commune:section:1:block:2:text/text | Canonical minimum composition exceeds one physical model |
| chaos-space-marines | Chosen | datasheet-chosen:section:1:block:1:text/text | Canonical minimum composition exceeds one physical model |
| chaos-space-marines | Nemesis Claw | datasheet-nemesis-claw:section:1:block:1:text/text | Canonical minimum composition exceeds one physical model |
| chaos-space-marines | Possessed | datasheet-possessed:section:1:block:1:text/text | Canonical minimum composition exceeds one physical model |
| chaos-space-marines | Chaos Bikers | datasheet-chaos-bikers:section:1:block:1:text/text | Canonical minimum composition exceeds one physical model |
| emperors-children | Tormentors | datasheet-tormentors:section:1/blocks/1/text | Canonical minimum composition exceeds one physical model |
| emperors-children | Daemonettes | datasheet-daemonettes:section:1/blocks/1/text | Canonical minimum composition exceeds one physical model |
| emperors-children | Daemonettes | datasheet-daemonettes:section:1/blocks/2/text | Canonical minimum composition exceeds one physical model |
| emperors-children | Seekers | datasheet-seekers:section:1/blocks/1/text | Canonical minimum composition exceeds one physical model |
| emperors-children | Seekers | datasheet-seekers:section:1/blocks/2/text | Canonical minimum composition exceeds one physical model |
| emperors-children | Infractors | datasheet-infractors:section:1/blocks/1/text | Canonical minimum composition exceeds one physical model |
| tau-empire | Commander Shadowsun | datasheet-commander-shadowsun:section:1/blocks/2/text | Fixed source composition equipment; wargearAbility is a selection flag, not proof that it is optional |
| tau-empire | Commander Shadowsun | datasheet-commander-shadowsun:section:1/blocks/3/text | Fixed source composition equipment; wargearAbility is a selection flag, not proof that it is optional |
| tau-empire | The Twin Lance | datasheet-the-twin-lance:section:1/blocks/3/text | Canonical minimum composition exceeds one physical model |
| tau-empire | Kroot Farstalkers | datasheet-kroot-farstalkers:section:1/blocks/1/text | Canonical minimum composition exceeds one physical model |
| tau-empire | Pathfinder Team | datasheet-pathfinder-team:section:1/blocks/1/text | Canonical minimum composition exceeds one physical model |
| tau-empire | Pathfinder Team | datasheet-pathfinder-team:section:1/blocks/2/text | Canonical minimum composition exceeds one physical model |
| tau-empire | Pathfinder Team | datasheet-pathfinder-team:section:1/blocks/3/text | Canonical minimum composition exceeds one physical model |
| tau-empire | Stealth Battlesuits | datasheet-stealth-battlesuits:section:1/blocks/1/text | Canonical minimum composition exceeds one physical model |
| tau-empire | Vespid Stingwings | datasheet-vespid-stingwings:section:1/blocks/1/text | Canonical minimum composition exceeds one physical model |
| space-marines | Vanguard Veteran Squad With Jump Packs | ability-sm-63d4ca967fa64b79/text | Canonical minimum composition exceeds one physical model |
| space-marines | Reiver Squad | ability-sm-683740758e7c490c/text | Canonical minimum composition exceeds one physical model |
| space-marines | Reiver Squad | ability-sm-801f058790ba4ed4/text | Canonical minimum composition exceeds one physical model |
| space-marines | Terminator Assault Squad | ability-sm-aa81f0067a3140de/text | Canonical minimum composition exceeds one physical model |
| space-marines | Infiltrator Squad | ability-sm-ece9a939dcf642bf/text | Canonical minimum composition exceeds one physical model |
| dark-angels | Deathwing Terminator Squad | ability-da-67e5af94e8b44695865b/text | Canonical minimum composition exceeds one physical model |
| dark-angels | Azrael | ability-da-95887a48130640feaf11/text | Fixed source composition equipment; wargearAbility is a selection flag, not proof that it is optional |
| dark-angels | Deathwing Knights | ability-da-9bd770df552c413daeca/text | Canonical minimum composition exceeds one physical model |
| dark-angels | Vanguard Veteran Squad With Jump Packs | ability-sm-63d4ca967fa64b79/text | Canonical minimum composition exceeds one physical model |
| dark-angels | Reiver Squad | ability-sm-683740758e7c490c/text | Canonical minimum composition exceeds one physical model |
| dark-angels | Reiver Squad | ability-sm-801f058790ba4ed4/text | Canonical minimum composition exceeds one physical model |
| dark-angels | Terminator Assault Squad | ability-sm-aa81f0067a3140de/text | Canonical minimum composition exceeds one physical model |
| dark-angels | Infiltrator Squad | ability-sm-ece9a939dcf642bf/text | Canonical minimum composition exceeds one physical model |
| blood-angels | Vanguard Veteran Squad With Jump Packs | ability-sm-63d4ca967fa64b79/text | Canonical minimum composition exceeds one physical model |
| blood-angels | Reiver Squad | ability-sm-683740758e7c490c/text | Canonical minimum composition exceeds one physical model |
| blood-angels | Reiver Squad | ability-sm-801f058790ba4ed4/text | Canonical minimum composition exceeds one physical model |
| blood-angels | Terminator Assault Squad | ability-sm-aa81f0067a3140de/text | Canonical minimum composition exceeds one physical model |
| blood-angels | Infiltrator Squad | ability-sm-ece9a939dcf642bf/text | Canonical minimum composition exceeds one physical model |
| space-marines | Victrix Honour Guard | ability-sm-c227c53a84a34dc1/text | Source composition fixes Banner of Macragge to Chapter Ancient; no source optional equipment permission. A one-model minimum composition contains Victrix Honour Guard and no Chapter Ancient. |

## Regression evidence and comparison boundaries

- Three legacy QA expectations encoded the former unconditional UNIT ownership:
  SM paid Orbital Comms Array demanded null MODEL scope; DA demanded that the
  same sole-Impulsor inventory remain on UNIT; BA expected no Relic Shield bonus
  from the UNIT line of a sole Death Company Captain. They now assert the exact
  existing singleton MODEL, original UNIT-origin evidence and unchanged prices,
  quantities and provenance. BA also retains an absent-shield negative and adds
  a two-MODEL pooled-shield negative. All other paid inventories retain their
  original no-fabricated-MODEL assertions. These are explicit expected import
  proof changes, not failures labelled pre-existing or weakened gameplay checks.
- 199 existing fixtures in all nine books: 507 completed lifecycle-state
  comparisons plus 22 non-READY outcomes with identical errors/binding requests.
  Full interpreter projections and roster snapshots are exactly identical,
  including effects, conditions, recipient scopes, trace IDs, source references,
  source choices, attachments, detach and reload. No lexical scope normalization
  is used for these baseline/feature comparisons. No new O-1 blocks occur.
- Six real multi-MODEL controls (SM/BA/DA, header 10 or header 1 with ten explicit
  MODELs) retain UNIT-owned Helix gauntlet and exactly match baseline state and
  projection. Their frozen full-state/source-decoded hashes are queued controls.
- Between two different export spellings of the same sole MODEL, the survey
  maps only that MODEL's exact lexical scope string. It retains canonical
  identities, complete characteristics, abilities, weapons, applied/conditional
  entries and source values. This mapping is not used for same-input A/B.
- Baseline already emits inline versus table-ref source encodings across some
  imports/reloads. Baseline and feature reproduce this in both export formats.
  Reload/reimport QA compares the complete projection through the existing
  common source reader; no source fields are discarded. A deliberate corrupt
  reference must still fail with its precise lookup/content-integrity error.
- Desktop and mobile UI imports use the New Recruit textbox and native player
  controls: Tau catalogue header succeeds; compact Captain displays W 6/W 5.
- The ten shared proof controls cover ownership, quantity, duplicate occurrence,
  idempotence, unrelated instances, weapon exclusion, multi-MODEL exclusion and
  composition ambiguity. They are in qa:roster. Native per-book vocabulary and
  equipment cases are in all nine book queues; UI checks are in test:browser.

Only faction import metadata and its derived Tyranids fingerprint change in
generated artifacts. The parity oracle reverses those declared metadata fields
and reconstructs every original generated byte. Card presentation data, source
tables, accepted-source pins and rules are unchanged. Runtime packaging adds
only the two common modules, existing import consumers, declared import metadata
and derived cache inventory/revision; it publishes no QA or audit artifacts.

Primary logs, raw before/after observations, census exclusions, byte-parity and
queue results are retained at `E:/Warhammer/qa-evidence/new-recruit-export-import-v1-20261106`. The final external REPORT.md
records exact commit IDs and actual quick/pre-FF classes; historical failed
development assertions are retained, not overwritten or reported as PASS.
Source/main/release/Pages require separate owner authorization and are not
delivery targets for this feature.
