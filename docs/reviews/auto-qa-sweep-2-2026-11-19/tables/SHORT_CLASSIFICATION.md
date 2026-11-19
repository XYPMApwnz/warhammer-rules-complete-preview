# Completed short supplement — independent static classification

This review streams completed evidence only. No browser, tests, builds, source edits, game evaluation, or changes to existing capture recipes were performed.

## Totals and scope

- 27268 screens, 0 screen errors; 1980 exact raw native imports, 0 execution errors.
- 647092 scoped native/display comparisons, 0 differences. The 2764 explicit gap observations below are not claimed as comparisons.
- 634 short-duplicate group observations: 614 repeated category/book labels in distinct Glossary search-result items; 16 Black Rage heading observations with independent canonical/physical source owners; 4 approved short Lion battle-choice references on separate effects.
- 1,250 service-marker lines are actual direct-canonical/API-route exposure: 934 UNVERIFIED and 184 NOT_IMPLEMENTED execution fields in SM/BA/DA DATASHEET_SECTION records; 132 AM RULE_REFERENCE internal entry IDs. No ordinary roster/import/guide or actual global Glossary-result/popup screen contributed a marker line.
- No exact import-copy candidate was found. Title-case Unknown from fixture-authored unresolved names is not converted into an uppercase UNKNOWN enum finding.

**Method distinction:** the short supplement calls native `roster.import(text, {}, {replaceExisting:true})`, refreshes, and opens the setup view. It does not drive the UI review handler that writes ordinary refusal/warning/clarification text. Therefore its error-copy absence is not independent UI-refusal coverage; the completed main UI sweep owns those screens.

## Direct canonical-route exposure

| Candidate | Lines | Books | Also clicked as focused targets | Actual full-page marker-owner occurrences |
|---|---:|---|---:|---:|
| authored-DATASHEET_SECTION|UPPERCASE_ENUM|UNVERIFIED | 934 | {'space-marines': 324, 'blood-angels': 296, 'dark-angels': 314} | 26 | 0 |
- Example: `short-screens.jsonl:8661`, space-marines, 390 px, canonical `ability-sm-022ef427b01e4c7b`, field `ability-sm-022ef427b01e4c7b::/execution`, token `UNVERIFIED`; existing main screenshot: `not captured for this direct API route`.
- Example: `short-screens.jsonl:22296`, space-marines, 1440 px, canonical `ability-sm-0392756f7c5a4d57`, field `ability-sm-0392756f7c5a4d57::/execution`, token `UNVERIFIED`; existing main screenshot: `not captured for this direct API route`.
- Example: `short-screens.jsonl:10651`, blood-angels, 390 px, canonical `ability-ba-11c612255925457c89ed`, field `ability-ba-11c612255925457c89ed::/execution`, token `UNVERIFIED`; existing main screenshot: `not captured for this direct API route`.
- Example: `short-screens.jsonl:24286`, blood-angels, 1440 px, canonical `ability-ba-16b14dac906045e3a48b`, field `ability-ba-16b14dac906045e3a48b::/execution`, token `UNVERIFIED`; existing main screenshot: `not captured for this direct API route`.
- Example: `short-screens.jsonl:12073`, dark-angels, 390 px, canonical `ability-da-0ef218638a454a2d96de`, field `ability-da-0ef218638a454a2d96de::/execution`, token `UNVERIFIED`; existing main screenshot: `not captured for this direct API route`.
| authored-DATASHEET_SECTION|UPPERCASE_ENUM|NOT_IMPLEMENTED | 184 | {'space-marines': 68, 'blood-angels': 52, 'dark-angels': 64} | 0 | 0 |
- Example: `short-screens.jsonl:8929`, space-marines, 390 px, canonical `invulnerable-sm-01e71a5bc2ad47ae`, field `invulnerable-sm-01e71a5bc2ad47ae::/execution`, token `NOT_IMPLEMENTED`; existing main screenshot: `not captured for this direct API route`.
- Example: `short-screens.jsonl:22564`, space-marines, 1440 px, canonical `invulnerable-sm-0e79df7c09a84fac`, field `invulnerable-sm-0e79df7c09a84fac::/execution`, token `NOT_IMPLEMENTED`; existing main screenshot: `not captured for this direct API route`.
- Example: `short-screens.jsonl:10878`, blood-angels, 390 px, canonical `invul-ba-206c1ff569204e5bb877`, field `invul-ba-206c1ff569204e5bb877::/execution`, token `NOT_IMPLEMENTED`; existing main screenshot: `not captured for this direct API route`.
- Example: `short-screens.jsonl:24513`, blood-angels, 1440 px, canonical `invul-ba-3590261d314c4fe1b386`, field `invul-ba-3590261d314c4fe1b386::/execution`, token `NOT_IMPLEMENTED`; existing main screenshot: `not captured for this direct API route`.
- Example: `short-screens.jsonl:12311`, dark-angels, 390 px, canonical `invul-da-057246e71cc34742b7e9`, field `invul-da-057246e71cc34742b7e9::/execution`, token `NOT_IMPLEMENTED`; existing main screenshot: `not captured for this direct API route`.
| authored-RULE_REFERENCE|INTERNAL_ID|explicit-id | 132 | {'adeptus-mechanicus': 132} | 0 | 0 |
- Example: `short-screens.jsonl:2143`, adeptus-mechanicus, 390 px, canonical `datasheet-archaeopter-fusilave:rule-reference:1`, field `datasheet-archaeopter-fusilave:rule-reference:1::/groups/0/entries/0/id`, token `datasheet-archaeopter-fusilave:rule-reference:1:entry:1:1`; existing main screenshot: `not captured for this direct API route`.
- Example: `short-screens.jsonl:15781`, adeptus-mechanicus, 1440 px, canonical `datasheet-archaeopter-stratoraptor:rule-reference:1`, field `datasheet-archaeopter-stratoraptor:rule-reference:1::/groups/0/entries/0/id`, token `datasheet-archaeopter-stratoraptor:rule-reference:1:entry:1:1`; existing main screenshot: `not captured for this direct API route`.
- Example: `short-screens.jsonl:2143`, adeptus-mechanicus, 390 px, canonical `datasheet-archaeopter-fusilave:rule-reference:1`, field `datasheet-archaeopter-fusilave:rule-reference:1::/groups/1/entries/0/id`, token `datasheet-archaeopter-fusilave:rule-reference:1:entry:2:1`; existing main screenshot: `not captured for this direct API route`.
- Example: `short-screens.jsonl:2147`, adeptus-mechanicus, 390 px, canonical `datasheet-archaeopter-stratoraptor:rule-reference:1`, field `datasheet-archaeopter-stratoraptor:rule-reference:1::/groups/0/entries/0/id`, token `datasheet-archaeopter-stratoraptor:rule-reference:1:entry:1:1`; existing main screenshot: `not captured for this direct API route`.
- Example: `short-screens.jsonl:2147`, adeptus-mechanicus, 390 px, canonical `datasheet-archaeopter-stratoraptor:rule-reference:1`, field `datasheet-archaeopter-stratoraptor:rule-reference:1::/groups/1/entries/0/id`, token `datasheet-archaeopter-stratoraptor:rule-reference:1:entry:2:1`; existing main screenshot: `not captured for this direct API route`.

Keep the direct-URL/API presentation advisory visible in the report. It is neither an invented false positive nor evidence that 1,250 normal player windows leaked service fields. Actual popup targets overlapping 26 UNVERIFIED occurrences were exercised as focused windows with zero player-dialog-guard leaks. None of the marker owner IDs appeared in actual FULL_PAGE_NAVIGATION records. The independent clicked popup/inline-flow pass records zero in-word links; this static review does not substitute API navigation for clicking.

## All short-duplicate signatures

| Text | Group observations | Scope | Classification |
|---|---:|---|---|
| Reference · Space Marines | 32 | {'glossary-results': 32} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Datasheet · Space Marines | 30 | {'glossary-results': 30} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Main Rule · Core Rules | 28 | {'glossary-results': 28} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Reference · Tyranids | 24 | {'glossary-results': 24} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Datasheet · Chaos Space Marines | 22 | {'glossary-results': 22} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Datasheet · T’au Empire | 22 | {'glossary-results': 22} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Datasheet · Dark Angels | 20 | {'glossary-results': 20} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Datasheet · Death Guard | 20 | {'glossary-results': 20} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Reference · T’au Empire | 20 | {'glossary-results': 20} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Weapon Profile · Space Marines | 20 | {'glossary-results': 20} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Datasheet · Emperor’s Children | 18 | {'glossary-results': 18} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Reference · Adeptus Mechanicus | 18 | {'glossary-results': 18} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Black Rage: | 16 | {'attached-card': 8, 'expanded-attached-card': 8} | EXPECTED_INDEPENDENT_PHYSICAL_RULE_SOURCES |
| Datasheet · Adeptus Mechanicus | 16 | {'glossary-results': 16} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Datasheet · Blood Angels | 16 | {'glossary-results': 16} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Datasheet · Tyranids | 16 | {'glossary-results': 16} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Reference · Blood Angels | 16 | {'glossary-results': 16} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Reference · Death Guard | 16 | {'glossary-results': 16} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Weapon Profile · Adeptus Mechanicus | 16 | {'glossary-results': 16} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Weapon Profile · Chaos Space Marines | 16 | {'glossary-results': 16} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Weapon Profile · Emperor’s Children | 16 | {'glossary-results': 16} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Ability · Space Marines | 14 | {'glossary-results': 14} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Reference · Emperor’s Children | 14 | {'glossary-results': 14} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Weapon Profile · Death Guard | 14 | {'glossary-results': 14} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Weapon Profile · Tyranids | 14 | {'glossary-results': 14} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Enhancement · Chaos Space Marines | 12 | {'glossary-results': 12} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Reference · Dark Angels | 12 | {'glossary-results': 12} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Weapon Profile · Dark Angels | 12 | {'glossary-results': 12} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Weapon Profile · T’au Empire | 12 | {'glossary-results': 12} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| FAQ · Core Rules | 10 | {'glossary-results': 10} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Weapon Profile · Blood Angels | 10 | {'glossary-results': 10} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Ability · Dark Angels | 8 | {'glossary-results': 8} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Reference · Chaos Space Marines | 8 | {'glossary-results': 8} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Enhancement · Space Marines | 6 | {'glossary-results': 6} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Stratagem · Space Marines | 6 | {'glossary-results': 6} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Ability · Chaos Space Marines | 4 | {'glossary-results': 4} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Enhancement · Adeptus Mechanicus | 4 | {'glossary-results': 4} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Enhancement · T’au Empire | 4 | {'glossary-results': 4} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Required battle choice: Primarch of the First Legion | 4 | {'ordinary-card': 2, 'expanded-ordinary-card': 2} | EXPECTED_SHORT_EFFECT_REFERENCE_LABELS |
| Stratagem · Adeptus Mechanicus | 4 | {'glossary-results': 4} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Wargear · T’au Empire | 4 | {'glossary-results': 4} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Detachment Rule · Adeptus Mechanicus | 2 | {'glossary-results': 2} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Detachment Rule · Emperor’s Children | 2 | {'glossary-results': 2} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Detachment Rule · T’au Empire | 2 | {'glossary-results': 2} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Detachment · Adeptus Mechanicus | 2 | {'glossary-results': 2} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Detachment · T’au Empire | 2 | {'glossary-results': 2} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Enhancement · Death Guard | 2 | {'glossary-results': 2} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Enhancement · Tyranids | 2 | {'glossary-results': 2} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| FAQ · Tyranids | 2 | {'glossary-results': 2} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Secondary Mission · Missions | 2 | {'glossary-results': 2} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Stratagem · Blood Angels | 2 | {'glossary-results': 2} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Stratagem · Chaos Space Marines | 2 | {'glossary-results': 2} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Stratagem · Emperor’s Children | 2 | {'glossary-results': 2} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Stratagem · Tyranids | 2 | {'glossary-results': 2} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Stratagem · T’au Empire | 2 | {'glossary-results': 2} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Update · Chaos Space Marines | 2 | {'glossary-results': 2} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Wargear · Adeptus Mechanicus | 2 | {'glossary-results': 2} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Wargear · Chaos Space Marines | 2 | {'glossary-results': 2} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Wargear · Death Guard | 2 | {'glossary-results': 2} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Wargear · Emperor’s Children | 2 | {'glossary-results': 2} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |
| Wargear · Space Marines | 2 | {'glossary-results': 2} | FALSE_POSITIVE_DISTINCT_GLOSSARY_RESULTS |

### Physical source evidence and retained review cases

**Black Rage:** — The bodyguard and attached Character each own a different canonical Black Rage rule and a different physical source instance. One own rule plus the other attached source can have the same heading on the same component card. Retained exact source identities show distinct owners; they must not be merged merely by equal prose.

- `short-screens.jsonl:11670`; input `sweep2-blood-angels-3affc9cd126b8ab1`; blood-angels; 390 px; physical `parsed-unit-2`; owners `[('ability-ba-9c4c7122376a4a73b2b0::/text', 'parsed-unit-2'), ('ability-ba-1d205c52ba9d49fbbcfd', 'parsed-unit-1')]`; matched main screenshot `none captured for this exact case`.
- `short-screens.jsonl:11670`; input `sweep2-blood-angels-3affc9cd126b8ab1`; blood-angels; 390 px; physical `parsed-unit-2`; owners `[('ability-ba-1d205c52ba9d49fbbcfd::/text', 'parsed-unit-1'), ('ability-ba-9c4c7122376a4a73b2b0', 'parsed-unit-2')]`; matched main screenshot `none captured for this exact case`.
- `short-screens.jsonl:11671`; input `sweep2-blood-angels-3affc9cd126b8ab1`; blood-angels; 390 px; physical `parsed-unit-2`; owners `[('ability-ba-9c4c7122376a4a73b2b0::/text', 'parsed-unit-2'), ('ability-ba-1d205c52ba9d49fbbcfd', 'parsed-unit-1')]`; matched main screenshot `none captured for this exact case`.
- `short-screens.jsonl:11671`; input `sweep2-blood-angels-3affc9cd126b8ab1`; blood-angels; 390 px; physical `parsed-unit-2`; owners `[('ability-ba-1d205c52ba9d49fbbcfd::/text', 'parsed-unit-1'), ('ability-ba-9c4c7122376a4a73b2b0', 'parsed-unit-2')]`; matched main screenshot `none captured for this exact case`.
- `short-screens.jsonl:11868`; input `sweep2-blood-angels-9eaad21b2b7c47c3`; blood-angels; 390 px; physical `parsed-unit-2`; owners `[('ability-ba-72b0b3cfecf1494fab5e::/text', 'parsed-unit-2'), ('ability-ba-de9ed78c7327410a8010', 'parsed-unit-1')]`; matched main screenshot `none captured for this exact case`.

**Required battle choice: Primarch of the First Legion** — This is the approved short per-effect reference label for separate REROLL/QUALIFIED_FNP clauses, not a repeated full battle-choice rule body. The source dataset/clauses and canonical shared text references are retained in each occurrence.

- `short-screens.jsonl:13429`; input `sweep2-dark-angels-d4ac378ebc570c80`; dark-angels; 390 px; physical `parsed-unit-2`; owners `[(None, 'parsed-unit-2'), (None, 'parsed-unit-2'), (None, 'parsed-unit-2')]`; matched main screenshot `none captured for this exact case`.
- `short-screens.jsonl:13430`; input `sweep2-dark-angels-d4ac378ebc570c80`; dark-angels; 390 px; physical `parsed-unit-2`; owners `[(None, 'parsed-unit-2'), (None, 'parsed-unit-2'), (None, 'parsed-unit-2')]`; matched main screenshot `none captured for this exact case`.
- `short-screens.jsonl:27063`; input `sweep2-dark-angels-d4ac378ebc570c80`; dark-angels; 1440 px; physical `parsed-unit-2`; owners `[(None, 'parsed-unit-2'), (None, 'parsed-unit-2'), (None, 'parsed-unit-2')]`; matched main screenshot `none captured for this exact case`.
- `short-screens.jsonl:27064`; input `sweep2-dark-angels-d4ac378ebc570c80`; dark-angels; 1440 px; physical `parsed-unit-2`; owners `[(None, 'parsed-unit-2'), (None, 'parsed-unit-2'), (None, 'parsed-unit-2')]`; matched main screenshot `none captured for this exact case`.

## 2,764 comparison-gap observations

| Kind | Observations | Books | Interpretation |
|---|---:|---|---|
| NATIVE_PROFILE_FIELD_NOT_EXPOSED / INSV | 2600 | Adeptus Mechanicus | Accepted separate invulnerable-save fact exists, but the inspected native effective profile interface does not expose that field. This is a comparison-coverage limitation, not a measured value mismatch. |
| CURRENT_MFM_TIER_NOT_UNIQUE | 164 | DG 112; AM 8; SM 44 | The derived fixture uses a model count with no row in the exact current source unit/copy schedule. Every case has zero independently matching source entries; displayed price stays null. |

### Source units and unsupported fixture model counts

| Book / exact MFM source unit | Observations | Model counts | Accepted model counts in applicable schedules | Displayed price |
|---|---:|---|---|---|
| death-guard / BLIGHTLORD TERMINATORS | 108 | {'1': 108} | [(3, 3), (5, 5), (10, 10)] | {'None': 108} |
| death-guard / PLAGUE MARINES | 4 | {'1': 4} | [(5, 5), (7, 7), (10, 10)] | {'None': 4} |
| adeptus-mechanicus / SERBERYS SULPHURHOUNDS | 4 | {'1': 4} | [(3, 3), (6, 6)] | {'None': 4} |
| adeptus-mechanicus / SICARIAN INFILTRATORS | 4 | {'1': 4} | [(5, 5), (10, 10)] | {'None': 4} |
| space-marines / VICTRIX HONOUR GUARD | 40 | {'1': 36, '4': 4} | [(3, 3), (6, 6)] | {'None': 40} |
| space-marines / WARDENS OF ULTRAMAR | 4 | {'1': 4} | [(6, 6)] | {'None': 4} |

The current scoped source auditor joins by exact book/source ownership and source pointer. The earlier first-pass unscoped CSM Rhino/other same-name-source join gaps remain in its original journal; they are not erased. This short pass has **zero CSM source-join gaps** after the scoped auditor is used, and all accepted matching source rows remain compared exactly.

All 2,600 AM INSV gaps are grouped by canonical source unit/profile in JSON, including five exact source/case examples per kind. All 164 unsupported-size observations retain source ID, pointer, accepted copy/model tiers, model count, displayed-null evidence and five examples per source unit. No source value, fixture size, or expectation was changed.

## Preserved limits

- Raw native import is not a replacement for the main UI error/clarification workflow.
- Direct authored canonical routes are not automatically ordinary player-linked screens. Their real marker exposure is retained with that distinction.
- The API-only short pass generated no new screenshots. Existing exact-case main screenshots are linked where present; missing screenshots are explicit.
- Counts are observation counts, including two widths and ordinary/expanded/attached views, not numbers of unique source facts or unique defects.
