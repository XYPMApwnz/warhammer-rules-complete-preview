# Selected nonweapon equipment inventory

Accepted observation corpus: `9b99ade9975346afc3644ade7f69d01ed71cce31`. 199 inputs and 507 captured states; 122 positive equipment observations. No import service, build, gameplay projection or browser was rerun.

Sequential NDJSON frame.snapshot scan; positive physicalQuantity; canonicalEquipmentIds only; deduplicate canonical UNIT and exact selected identity/paths/source references. Lookup reproduces current composition presenter, including explicit native equipment contracts loaded from the same already published source URLs. No names establish relations.

Finite observed equipment selections in 199 accepted inputs / 507 states. This does not inventory every possible automatic importer selection or claim that other books have no equipment. Only observed unresolved items would be listed as unresolved.

INITIAL_SELECTED_EQUIPMENT_INVENTORY.json/.md and RECIPES/INITIAL_inventory-selected-equipment.mjs preserve the initial narrower presentation-only lookup. That report found CSM Dark Commune unlinked and had not inspected native canonicalEquipmentRequirement/equipmentRequirement; the revised exact native lookup resolves it and the separately inspected Tidewall item.

Weapon profile selections are excluded. Distinct identity includes source occurrence/paths, so two different canonical representations are listed separately. A LINKED result requires exactly one existing effect fact; ambiguous or missing facts do not become invented descriptions.

| Book | Inputs | States | Equipment observations | Distinct UNIT/selections | Linked | Unlinked | Ambiguous |
|---|---:|---:|---:|---:|---:|---:|---:|
| death-guard | 11 | 32 | 56 | 6 | 6 | 0 | 0 |
| space-marines | 5 | 24 | 0 | 0 | 0 | 0 | 0 |
| blood-angels | 4 | 14 | 0 | 0 | 0 | 0 | 0 |
| dark-angels | 5 | 16 | 0 | 0 | 0 | 0 | 0 |
| adeptus-mechanicus | 21 | 42 | 12 | 3 | 3 | 0 | 0 |
| chaos-space-marines | 67 | 164 | 8 | 1 | 1 | 0 | 0 |
| tau-empire | 54 | 122 | 12 | 3 | 3 | 0 | 0 |
| tyranids | 18 | 59 | 0 | 0 | 0 | 0 | 0 |
| emperors-children | 14 | 34 | 34 | 5 | 5 | 0 | 0 |

## Exact selected identities

| Book | UNIT | Item caption/title | Item ID | Status | Existing effect and exact field | Lookup |
|---|---|---|---|---|---|---|
| death-guard | Plague Marines | icon of despair | datasheet-plague-marines:wargear:8 | LINKED | Icon of Despair (Aura) — `datasheet-plague-marines:section:1::/blocks/1/text` | sourceReferences-wargear-marker |
| death-guard | Deathshroud Terminators | icon of despair | datasheet-deathshroud-terminators:wargear:2 | LINKED | Icon of Despair (Aura) — `datasheet-deathshroud-terminators:section:1::/blocks/2/text` | sourceReferences-wargear-marker |
| death-guard | Plaguebearers | instrument of Chaos | datasheet-plaguebearers:wargear:1 | LINKED | Instrument of Chaos — `datasheet-plaguebearers:section:1::/blocks/2/text` | sourceReferences-wargear-marker |
| death-guard | Plaguebearers | daemonic icon | datasheet-plaguebearers:wargear:2 | LINKED | Daemonic Icon — `datasheet-plaguebearers:section:1::/blocks/1/text` | sourceReferences-wargear-marker |
| death-guard | Plague Drones | instrument of Chaos | datasheet-plague-drones:wargear:1 | LINKED | Instrument of Chaos — `datasheet-plague-drones:section:1::/blocks/2/text` | sourceReferences-wargear-marker |
| death-guard | Plague Drones | daemonic icon | datasheet-plague-drones:wargear:2 | LINKED | Daemonic Icon — `datasheet-plague-drones:section:1::/blocks/1/text` | sourceReferences-wargear-marker |
| adeptus-mechanicus | Onager Dunecrawler | WARGEAR OPTION | datasheet-onager-dunecrawler:wargear:3 | LINKED | Broad spectrum data-tether — `datasheet-onager-dunecrawler:section:1::/blocks/2/text` | sourceReferences-wargear-marker |
| adeptus-mechanicus | Skitarii Rangers | omnispex | datasheet-skitarii-rangers:section:1 | LINKED | Omnispex — `datasheet-skitarii-rangers:section:1::/blocks/2/text` | selected-ability |
| adeptus-mechanicus | Skitarii Rangers | enhanced data-tether | datasheet-skitarii-rangers:section:1 | LINKED | Enhanced data-tether — `datasheet-skitarii-rangers:section:1::/blocks/1/text` | selected-ability |
| chaos-space-marines | Dark Commune | Chaos icon | datasheet-dark-commune:section:2 | LINKED | Chaos Icon — `datasheet-dark-commune:section:1:block:2:text::/text` | explicit-native-contract |
| tau-empire | Crisis Fireknife Battlesuits | shield drone | datasheet-crisis-fireknife-battlesuits:wargear:3 | LINKED | SHIELD DRONE — `drone-shield-drone::/text` | sourceEquipmentIdentity |
| tau-empire | Crisis Fireknife Battlesuits | marker drone | datasheet-crisis-fireknife-battlesuits:wargear:3 | LINKED | MARKER DRONE — `drone-marker-drone::/text` | sourceEquipmentIdentity |
| tau-empire | Broadside Battlesuits | shield drone | datasheet-broadside-battlesuits:wargear:3 | LINKED | SHIELD DRONE — `drone-shield-drone::/text` | sourceEquipmentIdentity |
| emperors-children | Daemonettes | instrument of Chaos | datasheet-daemonettes:wargear:1 | LINKED | Instrument of Chaos — `datasheet-daemonettes:section:1::/blocks/2/text` | sourceReferences-wargear-marker |
| emperors-children | Daemonettes | daemonic icon | datasheet-daemonettes:wargear:2 | LINKED | Daemonic Icon — `datasheet-daemonettes:section:1::/blocks/1/text` | sourceReferences-wargear-marker |
| emperors-children | Seekers | instrument of Chaos | datasheet-seekers:wargear:1 | LINKED | Instrument of Chaos — `datasheet-seekers:section:1::/blocks/2/text` | sourceReferences-wargear-marker |
| emperors-children | Seekers | daemonic icon | datasheet-seekers:wargear:2 | LINKED | Daemonic Icon — `datasheet-seekers:section:1::/blocks/1/text` | sourceReferences-wargear-marker |
| emperors-children | Keeper of Secrets | shining aegis | datasheet-keeper-of-secrets:section:1 | LINKED | Shining Aegis — `datasheet-keeper-of-secrets:section:1::/blocks/2/text` | selected-ability |

## Observed unresolved selections

None among the finite observed selections. This is not a statement about every possible roster.

## Separately inspected existing native relation

**T’au Empire · Tidewall Shieldline · Tidewall defence platform**: `datasheet-tidewall-shieldline:wargear:1` is **LINKED** through its existing native contract. The published native rule clause tidewall-defence-platform has a SOURCE/EQUIPMENT_PRESENT equipmentRequirement addressing this exact option /text; clause sourceFields addresses /blocks/2/text. This is an existing contract relation, not a runtime name match.
Effect: `datasheet-tidewall-shieldline:section:1::/blocks/2/text` — Tidewall Defence Platform.

Observed in the accepted selected-equipment frames: **no**. Metadata lookup for an existing native test-selected item; not an imported or recomputed roster state. The existing native import test constructs this equipped item; the 199-input snapshot corpus contains only the unequipped Tidewall case.

## Native source input boundary

The production source-only loader is invoked against local published bytes. Its existing URL set is retained, with zero extra network URLs. JSON records the exact files read for every book. No rule condition or roster effect is evaluated.

## Scope limitation

A complete inventory of every possible nonweapon selection cannot be inferred reliably from importBindings alone: the importer also constructs source-backed option/ability selections at admission, and books have native equipment lowering. Reimplementing those selection paths here would create a second importer. This report deliberately covers the accepted finite snapshots plus the explicitly identified Tidewall native relation, rather than inventing possible selections or claiming universal absence of missing links.

The JSON contains complete selected identity objects, source field addresses, source-provided captions, fixture IDs and stages for reproducibility.
