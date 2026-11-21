# Source reference size and execution checkpoint

Base: `75d322e4e3274f14d7e2a81abace3ba63c784ec5`. Targeted checks only; no full QA run.

## Runtime size

| Version | Files | Runtime bytes |
| --- | ---: | ---: |
| baseline | 429 | 271531285 |
| before | 430 | 303574045 |
| after | 432 | 270049414 |

Old growth: 32042760 bytes. New growth: -1481871 bytes. Saved: 33524631 bytes. Size target: PASS.

One document table per book stores document identity, document hash, authority and recorded currentness. Individual sourceRefs carry documentId, locator/fragment/role and a referenceId authenticating the entire association. Immutable layouts, typed contexts and binding tuples are shared across published snapshots; source-only JSON is compact. Ordinary values and stratagem serialization inverse exactly.

## File breakdown

| File | Base | Before | After | Old growth | New growth | Saved |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| books/adeptus-mechanicus/v2/generated/app-presentation.json | 7766993 | 8208657 | 7598132 | 441664 | -168861 | 610525 |
| books/adeptus-mechanicus/v2/generated/effective.json | 2072771 | 2425608 | 2071698 | 352837 | -1073 | 353910 |
| books/adeptus-mechanicus/v2/generated/roster-runtime.json | 4552846 | 5028149 | 4543197 | 475303 | -9649 | 484952 |
| books/adeptus-mechanicus/v2/roster-import.mjs | 2993 | 3106 | 3106 | 113 | 113 | 0 |
| books/blood-angels/v2/generated/app-presentation.json | 17663313 | 19967255 | 17128132 | 2303942 | -535181 | 2839123 |
| books/blood-angels/v2/generated/roster-import.json | 5948853 | 8089624 | 5337178 | 2140771 | -611675 | 2752446 |
| books/blood-angels/v2/roster-import.mjs | 18928 | 19638 | 19638 | 710 | 710 | 0 |
| books/blood-angels/v2/roster-paid-options.mjs | 6409 | 6593 | 6593 | 184 | 184 | 0 |
| books/chaos-space-marines/v2/generated/app-presentation.json | 20341735 | 22639158 | 19553775 | 2297423 | -787960 | 3085383 |
| books/chaos-space-marines/v2/generated/roster-import.json | 3550204 | 6073444 | 3065402 | 2523240 | -484802 | 3008042 |
| books/chaos-space-marines/v2/generated/roster-runtime.json | 8458678 | 11440784 | 7651722 | 2982106 | -806956 | 3789062 |
| books/chaos-space-marines/v2/roster-attachment-build.mjs | 5158 | 5285 | 5301 | 127 | 143 | -16 |
| books/chaos-space-marines/v2/roster-presentation.mjs | 3123 | 3210 | 3236 | 87 | 113 | -26 |
| books/chaos-space-marines/v2/roster-runtime.mjs | 3298 | 3298 | 3375 | 0 | 77 | -77 |
| books/dark-angels/v2/generated/app-presentation.json | 17960149 | 20290724 | 17421156 | 2330575 | -538993 | 2869568 |
| books/dark-angels/v2/generated/roster-import.json | 6174362 | 8390079 | 5539055 | 2215717 | -635307 | 2851024 |
| books/dark-angels/v2/physical-chapter.mjs | 4089 | 4162 | 4162 | 73 | 73 | 0 |
| books/dark-angels/v2/roster-import.mjs | 17857 | 18554 | 18554 | 697 | 697 | 0 |
| books/dark-angels/v2/roster-paid-options.mjs | 5706 | 5890 | 5890 | 184 | 184 | 0 |
| books/death-guard/v2/generated/app-presentation.json | 6239872 | 6723197 | 6064868 | 483325 | -175004 | 658329 |
| books/death-guard/v2/generated/rule-contract-effective.json | 2244250 | 3025408 | 2161836 | 781158 | -82414 | 863572 |
| books/death-guard/v2/roster-import-bindings.mjs | 1585 | 1685 | 1685 | 100 | 100 | 0 |
| books/emperors-children/v2/generated/app-presentation.json | 5162402 | 6115751 | 4814125 | 953349 | -348277 | 1301626 |
| books/emperors-children/v2/generated/roster-attachments.json | 2998017 | 3616068 | 2735476 | 618051 | -262541 | 880592 |
| books/emperors-children/v2/generated/roster-import.json | 2357146 | 2871694 | 2164577 | 514548 | -192569 | 707117 |
| books/emperors-children/v2/roster-import.mjs | 16672 | 16795 | 16795 | 123 | 123 | 0 |
| books/shared/army-book-app-v2/book-v1.mjs | 13176 | 13300 | 13300 | 124 | 124 | 0 |
| books/shared/army-book-app-v2/datasheet-v1.mjs | 75932 | 76098 | 76098 | 166 | 166 | 0 |
| books/shared/army-book-app-v2/glossary.mjs | 10647 | 10719 | 10719 | 72 | 72 | 0 |
| books/shared/army-book-app-v2/navigation-v1.mjs | 16533 | 16606 | 16606 | 73 | 73 | 0 |
| books/shared/army-book-app-v2/normal-datasheet-bindings.mjs | 5235 | 5467 | 5467 | 232 | 232 | 0 |
| books/shared/army-book-app-v2/personal.mjs | 41381 | 41572 | 41572 | 191 | 191 | 0 |
| books/shared/army-book-app-v2/roster.mjs | 44428 | 44499 | 44499 | 71 | 71 | 0 |
| books/shared/army-book-app-v2/runtime.mjs | 63277 | 63380 | 63380 | 103 | 103 | 0 |
| books/shared/roster-v2/conditional-policy.mjs | 29418 | 29804 | 29804 | 386 | 386 | 0 |
| books/shared/roster-v2/context.mjs | 29244 | 29395 | 29395 | 151 | 151 | 0 |
| books/shared/roster-v2/effective-instance.mjs | 15229 | 15434 | 15434 | 205 | 205 | 0 |
| books/shared/roster-v2/effects.mjs | 53199 | 53323 | 53323 | 124 | 124 | 0 |
| books/shared/roster-v2/import-service.mjs | 8244 | 8417 | 8444 | 173 | 200 | -27 |
| books/shared/roster-v2/runtime.mjs | 5679 | 5779 | 5795 | 100 | 116 | -16 |
| books/shared/rule-contract-v2/finalize-recipients.mjs | 1299 | 1683 | 1683 | 384 | 384 | 0 |
| books/shared/rule-contract-v2/recipients.mjs | 31975 | 32104 | 32104 | 129 | 129 | 0 |
| books/shared/rule-contract-v2/schema.mjs | 23535 | 23698 | 23698 | 163 | 163 | 0 |
| books/shared/source-refs-v2/source-catalog.json | 0 | 0 | 6442156 | 0 | 6442156 | -6442156 |
| books/shared/source-refs-v2/source-catalog.mjs | 0 | 0 | 1313 | 0 | 1313 | -1313 |
| books/shared/source-refs-v2/source-refs.mjs | 0 | 33583 | 38789 | 33583 | 38789 | -5206 |
| books/space-marines/v2/generated/app-presentation.json | 20399922 | 23060150 | 19937258 | 2660228 | -462664 | 3122892 |
| books/space-marines/v2/generated/roster-import.json | 6824936 | 9100994 | 6036659 | 2276058 | -788277 | 3064335 |
| books/space-marines/v2/roster-import.mjs | 17083 | 17780 | 17780 | 697 | 697 | 0 |
| books/space-marines/v2/roster-paid-options.mjs | 5684 | 5868 | 5868 | 184 | 184 | 0 |
| books/space-marines/v2/roster-static-model-bindings.mjs | 5079 | 5245 | 5245 | 166 | 166 | 0 |
| books/tau-empire/v2/generated/app-presentation.json | 6729225 | 7979375 | 6413595 | 1250150 | -315630 | 1565780 |
| books/tau-empire/v2/generated/roster-import.json | 3381794 | 5317760 | 3197708 | 1935966 | -184086 | 2120052 |
| books/tau-empire/v2/roster-import.mjs | 14451 | 15148 | 15148 | 697 | 697 | 0 |
| books/tau-empire/v2/roster-source-choices.mjs | 18641 | 19030 | 19030 | 389 | 389 | 0 |
| books/tau-empire/v2/roster-weapon-choices.mjs | 11250 | 11519 | 11519 | 269 | 269 | 0 |
| books/tyranids/v2/generated/app-presentation.json | 7783682 | 8859244 | 7427491 | 1075562 | -356191 | 1431753 |
| books/tyranids/v2/generated/roster-runtime.json | 2106010 | 3495233 | 1881514 | 1389223 | -224496 | 1613719 |
| books/tyranids/v2/roster-source-choices.mjs | 7050 | 7197 | 7197 | 147 | 147 | 0 |
| glossary/generated/cache-revision.js | 69592 | 69779 | 70113 | 187 | 521 | -334 |

## Source metadata by record kind

Per-file bytes and deltas are exact physical package sizes. Record-kind/form columns count compact UTF-8 source-property values, excluding formatting and ordinary facts. They explain duplication but must not be added to physical file deltas.

| Record kind | Before compact bytes | After compact bytes |
| --- | ---: | ---: |
| ALLIED_POINTS_DEPENDENCY | 2082 | 1520 |
| ARMY_RULE | 32269 | 21405 |
| ARMY_RULE_COMPONENT | 18637 | 14658 |
| ATTACHMENT_DECLARATION | 27377 | 17843 |
| ATTACHMENT_RELATION | 60378 | 49412 |
| BOOK_CONTAINER | 17402116 | 1916159 |
| BOOK_USAGE | 632 | 636 |
| BOOK_USAGE_RULES | 1057 | 469 |
| COMPOSITION_MEMBER | 385435 | 301404 |
| CORE_CORE_CONCEPT | 29169 | 2349 |
| CORE_ERRATA | 37467 | 15039 |
| CORE_FAQ_CLARIFICATION | 313605 | 112734 |
| CORE_MAIN_RULE | 1025424 | 116802 |
| CORE_UNIVERSAL_RULE_UPDATE | 30555 | 16218 |
| DATASHEET | 342408 | 266783 |
| DATASHEET_ABILITY | 475877 | 305914 |
| DATASHEET_SECTION | 1311647 | 917690 |
| DETACHMENT | 167690 | 112965 |
| DETACHMENT_ROSTER_METADATA | 17697 | 13560 |
| DETACHMENT_RULE | 224818 | 158755 |
| ENHANCEMENT | 807756 | 577573 |
| ENHANCEMENT_COST_QUALIFIERS | 64542 | 53184 |
| EQUIPMENT_ABILITY | 7259 | 4242 |
| EQUIPMENT_RULE | 5880 | 3790 |
| ERRATA | 20943 | 19609 |
| FACTION_KEYWORD | 84618 | 67156 |
| FAQ | 21299 | 23643 |
| INVULNERABLE_SAVE | 39764 | 36205 |
| KEYWORD_MEMBERSHIP | 470648 | 396582 |
| KEYWORD_SCOPES | 15232 | 14892 |
| MFM_DETACHMENT | 16788 | 8934 |
| MFM_ENHANCEMENT_COST | 37008 | 24815 |
| MFM_PAID_UPGRADE | 8630 | 6102 |
| MFM_QUALIFIER | 11043 | 6772 |
| MFM_UNIT_POINTS | 137897 | 99162 |
| MODEL_BASE | 24752 | 27431 |
| MODEL_BASE_METADATA | 127608 | 103752 |
| NAMED_RULE_COMPONENT | 4746 | 3030 |
| NO_WARGEAR_OPTIONS | 6246 | 5160 |
| OFFICIAL_UPDATE | 24380 | 24246 |
| PAID_WARGEAR_COST | 1656 | 1248 |
| POINTS_SCHEDULE_ROW | 51336 | 41070 |
| PROFILE | 615257 | 503995 |
| RULE_REFERENCE | 841471 | 676353 |
| SHARED_CATALOG | 0 | 6442155 |
| SOURCE_CONFLICT | 831 | 1194 |
| SOURCE_ERRATUM | 60652 | 44526 |
| SOURCE_PRESENTATION_NOTE | 6337 | 5806 |
| SOURCE_RELATION | 142774 | 89670 |
| SOURCE_UPDATE_REFERENCE | 83322 | 89842 |
| SPECIAL_DATASHEET_RULE | 12769 | 8224 |
| STRUCTURED_RULE_TABLE | 6135 | 5896 |
| SUPPLEMENTAL_DATASHEET_RULE | 49556 | 45704 |
| TRANSPORT_DECLARATION | 1468 | 1720 |
| UNIQUE | 18608 | 10591 |
| UNIT_COMPOSITION | 29808 | 21708 |
| UPGRADE_DECLARATION | 2839 | 1875 |
| UPGRADE_OPTION | 123255 | 123065 |
| WARGEAR_FOOTNOTE | 708 | 336 |
| WARGEAR_OPTION | 486323 | 361487 |
| WEAPON_ABILITY | 552 | 736 |
| WEAPON_PROFILE | 1656621 | 1372400 |
| WEAPON_PROFILE_SELECTION | 7335 | 5119 |
| WEAPON_PROFILE_SELECTION_INSTRUCTION | 368 | 452 |

## Shared catalog

`{"bytes":6442156,"documentsByBook":{"adeptus-mechanicus":{"entries":58,"compactBytes":13240},"blood-angels":{"entries":14,"compactBytes":3436},"chaos-space-marines":{"entries":120,"compactBytes":34530},"dark-angels":{"entries":14,"compactBytes":3427},"death-guard":{"entries":50,"compactBytes":14208},"emperors-children":{"entries":37,"compactBytes":11337},"space-marines":{"entries":13,"compactBytes":3009},"tau-empire":{"entries":141,"compactBytes":40154},"tyranids":{"entries":115,"compactBytes":31128}},"pools":{"layouts":{"entries":182,"compactBytes":231402},"contexts":{"entries":10081,"compactBytes":1181162},"bindings":{"entries":19130,"compactBytes":4874917}}}`

## Timing

`{"samples":5,"execution":"SEQUENTIAL_ALTERNATING_FRESH_NODE_PROCESSES","fixtureId":"detachment-creations-of-bile:enhancement:2::roster-clause-1","allSamplesMs":{"baseline":[473.8974,468.7568,464.9362,471.7718,466.74049999999994],"before":[1438.4135000000003,1467.0898000000002,1453.5526,1438.3297999999998,1443.6997999999996],"optimized":[506.56590000000017,504.5521,507.43150000000014,508.09119999999996,500.8616000000002]},"mediansMs":{"baseline":468.7568,"before":1443.6997999999996,"optimized":506.56590000000017},"baselineMedianMs":468.7568,"beforeMedianMs":1443.6997999999996,"featureMedianMs":506.56590000000017,"changePercent":8.065824325108494,"stages":[{"stage":"module-imports","baselineMedianMs":26.942700000000002,"beforeMedianMs":28.4302,"optimizedMedianMs":63.21480000000001},{"stage":"read-json","baselineMedianMs":114.70530000000001,"beforeMedianMs":164.63049999999998,"optimizedMedianMs":111.1691},{"stage":"create-importer","baselineMedianMs":28.358799999999974,"beforeMedianMs":160.94159999999997,"optimizedMedianMs":35.365099999999984},{"stage":"import-text","baselineMedianMs":17.87730000000002,"beforeMedianMs":52.0489,"optimizedMedianMs":13.815300000000008},{"stage":"explicit-fixture-bearer","baselineMedianMs":1.2404999999999973,"beforeMedianMs":1.3075999999999794,"optimizedMedianMs":1.6277000000000044},{"stage":"create-runtime","baselineMedianMs":130.65210000000002,"beforeMedianMs":446.1943,"optimizedMedianMs":120.28659999999999},{"stage":"runtime-load","baselineMedianMs":98.48689999999999,"beforeMedianMs":412.6653000000001,"optimizedMedianMs":115.46260000000001},{"stage":"normalize-effective-book","baselineMedianMs":24.885299999999972,"beforeMedianMs":38.21270000000004,"optimizedMedianMs":10.585900000000038},{"stage":"prepare-presentation-cards","baselineMedianMs":2.832400000000007,"beforeMedianMs":3.108600000000024,"optimizedMedianMs":2.914600000000007},{"stage":"personal-book-projection","baselineMedianMs":0.6464000000000283,"beforeMedianMs":0.8542999999999665,"optimizedMedianMs":0.8065000000000282},{"stage":"effective/parsed-unit-1","baselineMedianMs":6.2964999999999804,"beforeMedianMs":37.72609999999986,"optimizedMedianMs":8.651400000000024},{"stage":"personal-instance/parsed-unit-1","baselineMedianMs":1.9196000000000026,"beforeMedianMs":3.264499999999998,"optimizedMedianMs":2.3496000000000095},{"stage":"effective/parsed-unit-2","baselineMedianMs":3.6426999999999907,"beforeMedianMs":30.806800000000067,"optimizedMedianMs":5.094099999999969},{"stage":"personal-instance/parsed-unit-2","baselineMedianMs":0.6188999999999965,"beforeMedianMs":1.514699999999948,"optimizedMedianMs":1.0131999999999834},{"stage":"effective/parsed-unit-3","baselineMedianMs":3.5371999999999844,"beforeMedianMs":29.039799999999786,"optimizedMedianMs":5.0067000000000235},{"stage":"personal-instance/parsed-unit-3","baselineMedianMs":0.8378999999999905,"beforeMedianMs":1.6619000000000597,"optimizedMedianMs":1.1361000000000558},{"stage":"effective/parsed-unit-4","baselineMedianMs":3.541300000000035,"beforeMedianMs":28.777900000000045,"optimizedMedianMs":4.927400000000034},{"stage":"personal-instance/parsed-unit-4","baselineMedianMs":0.6621000000000095,"beforeMedianMs":1.5389999999999873,"optimizedMedianMs":1.0189000000000306}],"targetPass":true}`

Catalog identities are checked before first use and then frozen. Source-only metadata is shared across book clones; mutable gameplay fields retain independent copies. Replaced metadata and source shadows invalidate the read cache. Ten new negative controls cover locator/document/binding changes, cold-load catalog corruption and immutable identity aliasing.

## Browser comparison

`{"status":"PASS","scope":"SELECTED_FIXTURES","selectedBookIds":["emperors-children","tau-empire","tyranids"],"selectedFixtures":74,"counts":{"books":3,"sourceFixtures":171,"savedSnapshotFixtures":0,"acceptedImports":146,"rejectedOrPendingImports":2,"scenarioViews":414,"cardViews":2322,"uniqueTextBytes":1737264},"comparison":{"status":"PASS","zeroDifference":true},"method":"Original renderer; styles/fonts ready and two animation frames without DOM or resize changes before exact textContent/innerText and block-order comparison."}`

No paragraph or expected-text normalization is used. The unchanged layout module is allowed to finish before capture. Block order, text bytes, Source and Applies to labels remain exact.

## Validation and scope

97-artifact inverse and source checks, the existing source-severing controls, new catalog controls and independent source oracles passed. Full suites are NOT_RUN by owner agreement. Detailed controls and per-file measurements are in the companion JSON.

- Timing covers one existing CSM source-backed recipe through actual import, bearer selection, runtime, effective and personal paths in fresh alternating Node processes; it is not a claim about every roster.
- PRE_EXISTING_LAYOUT_NONDETERMINISM was reproduced on the unchanged base. No renderer or expected rule text was changed.
- The original all-book migration audit remains a draft pending final full QA and regeneration; this checkpoint supersedes its earlier size/performance measurements and certifies browser parity only for the three requested books.
- No commit, push, source/release/main ref update or publication is part of this checkpoint.


## Temporary cleanup

BLOCKED_BY_AUTOMATIC_REVIEW: The tool policy rejected the Remove-Item operation without a more detailed reason. No alternative removal was attempted. Baseline/before/final evidence packages are intentionally retained for final QA.

- `feature-runtime-optimized`
- `size-before-optimization.json.prototype-catalog.json`
