# Sweep 2: exact fixture inventory and current UI/service map

Base: `4060074ae0c7888571367f99f7cb9cc375c167ba`. This subtask inspected sources and evaluated bounded original fixture data declarations only. It did not run any browser, QA program, build command, or mutate the repository.

## Inputs and bounded scope

`ALL_INPUTS.json` is the single sweep input union. Its 990 stable IDs are `sweep2-<book>-<first 16 SHA-256 digits>` with collision checks; deduplication is by target book plus complete text SHA-256. All original IDs and source aliases remain. `FIXTURE_INVENTORY.json` is the corresponding review-safe metadata inventory without raw roster text. The raw-text union is an internal execution input, not a request to publish captured exports again.

| Book | Unique inputs |
|---|---:|
| space-marines | 128 |
| blood-angels | 89 |
| dark-angels | 77 |
| adeptus-mechanicus | 182 |
| chaos-space-marines | 148 |
| death-guard | 162 |
| tau-empire | 95 |
| tyranids | 69 |
| emperors-children | 40 |

- 761 primary saved/static/factory inputs +81 bounded additions =842 distinct repository-derived inputs. The repeated prior Character-pair derivation adds148 distinct inputs; two of its150 cases already exist in that set.
- 1,160 source aliases from138 distinct source files.
- 32 original fixture producer outputs are evaluated from declarations only. The61 CSM imported-effect inputs already live in its tracked execution matrix.
- 188 canonical Character-containing datasheets:150 recorded active native Leader/Support policies get one exact first-policy source-backed text pair;38 have no attachable policy;0 unresolved. This is the same explicitly classified derivation as sweep1, rather than an invented owner roster.
- 28 synthetic-registry inputs are excluded from native-book import: their Sample/Test entities do not belong to the nine native books.
- 399 source fragments/intermediate expressions are retained separately. A fragment is not falsely treated as a saved complete export.
- 124 dynamic source templates are retained in `DYNAMIC-SOURCES.json`; production display templates and parameterized mutations are not saved export fixtures. Fixed original producer invocations above are expanded. This is not a claim that every arbitrary runtime mutation in every test was enumerated.
- Expected statuses: `{"READY":448,"OBSERVE_NO_SINGLE_EXPECTATION":531,"NEEDS_BINDINGS":8,"INVALID":3}`. Missing status means observation, never assumed READY. Existing intentionally unresolved/invalid controls remain in the sweep.

## Tracked TXT sources

- `v2/fixtures/wardens-contextual-source.txt`
- `books/space-marines/v2/fixtures/newrecruit-v37.3-user-sm.txt`
- `books/blood-angels/v2/fixtures/newrecruit-v37.2-user-redemptor.txt`
- `books/dark-angels/v2/fixtures/newrecruit-v37.3-user-da-10-models.txt`
- `books/dark-angels/v2/fixtures/newrecruit-v37.3-user-da.txt`
- `v2/fixtures/new-recruit-model-names-tournament-csm.txt`
- `v2/fixtures/new-recruit-v37.15-owner-death-guard.txt`
- `v2/fixtures/f2-deathshroud-newrecruit.txt`
- `v2/fixtures/new-recruit-v37.25-owner-death-guard.txt`
- `books/death-guard/v2/fixtures/omega-megaroster.txt`
- `v2/fixtures/text-coverage-tyranids-owner.txt`
- `v2/fixtures/text-coverage-ec-owner.txt`

| Required DG owner capture | Bytes | SHA-256 | Stable sweep input |
|---|---:|---|---|
| v2/fixtures/new-recruit-v37.15-owner-death-guard.txt | 1142 | 2db0c83b5c2f0e422719a14261a1470ceb2e974e91ff6aff791f974cfe518940 | sweep2-death-guard-2db0c83b5c2f0e42 |
| v2/fixtures/new-recruit-v37.25-owner-death-guard.txt | 1242 | 7b7050e6f2e39c749f9cd883cd0c00c3806291faf625479dede324f6b38a188f | sweep2-death-guard-7b7050e6f2e39c74 |

## v37.25 metadata

`v2/fixtures/new-recruit-plain-header-v37.25.json` is separate from the unchanged historical3-line fixture. Per `v2/new-recruit-plain-header-qa.mjs:151-188`, all four optional header variants are accepted for all nine books: five-line, reversed optional-line order, size-only, and disposition-only. Original3-line text remains accepted; its pointsLimit is null. The six explicit rejectionCases return NEEDS_BINDINGS and preserve the existing snapshot. Both captured DG owner exports are explicitly READY. The union preserves all body bytes, native options and bindings; it does not synthesize extra header grammar.

## Gaps in the previous import sweep to cover now

The old `sweep-imports.mjs` opened enhanced physical cards but did not open every ordinary physical roster unit. It did not choose Warlord, open Personal Guide, save source choices, or inspect all rule dialogs/glossary targets. Its attachment iteration already used native candidates plus the UI selector and detach button. It reported no eligible bodyguard honestly; the separate prior Character-pair derivation expanded coverage beyond characters present in owner exports.

For the new sweep, open every physical unit after every READY import; test choices through actual exposed select options; choose an eligible different Warlord; open Personal Guide; exercise Units on390 with Escape; and inspect dialogs/links. Imported enhancement-bearing inputs are already in the union. There is no generic manual enhancement-picker in the current UI: cover existing imported enhancements and ENHANCEMENT_BEARER clarification instead of inventing a new assignment.

## Exact current selectors and operations

| Action | Current owner / line | Safe execution route |
|---|---|---|
| Paste/import | `books/shared/army-book-app-v2/roster.mjs:172-175,296-345` | `textarea[data-roster-input="raw-text"]`, click `[data-roster-action="review-import"]`; confirm existing replacement explicitly if shown |
| Refused initial text | `roster.mjs:296-345,386-445` | Read native result and rendered status; compare complete snapshot and saved bytes before/after. NEEDS_BINDINGS is valid for intentional controls |
| Warlord | `roster.mjs:668-697` | Actual `select[data-roster-warlord-select]` options define eligible Characters. Pick an enabled value other than current, click `[data-roster-action="set-warlord"]`; otherwise record already-selected/no-eligible |
| Bodyguard candidates | `books/shared/roster-v2/runtime.mjs:150` | Native `service.candidates(leaderInstanceId)` supplies exact eligible physical targets. Never infer Leader legality from names |
| Attach | `roster.mjs:759-767,794-819` | Select leader instance in `[data-attachment-candidate-for="<target instance>"]`; click its exact section `[data-roster-action="attach"]` |
| Detach | `roster.mjs:798-806` | `[data-roster-action="detach"][data-leader-instance-id="<leader>"]` |
| Service attachment signature | `books/shared/roster-v2/runtime.mjs:147-150` | Public runtime uses `attach(leaderId,bodyguardId)` and `detach(leaderId)`; a different lower-level adapter signature is not this UI |
| Imported enhancements | `roster.mjs:578-582,731-741` | Observe exact imported and active IDs, warnings and card text. No generic manual setEnhancement UI exists |
| Source selections | `roster.mjs:608-635` | Actual `select[data-source-choice-id]`; choose a genuine exposed option, then exact `[data-roster-action="set-source-choice"]` button. Native serialized values remain opaque |
| Enhancement bearer clarification | `roster.mjs:395-435` | Existing need.kind ENHANCEMENT_BEARER select candidates only; exact matching ID, no fabricated recipient |
| Every physical card | `roster.mjs:775-782`; `runtime.mjs:959` | Exact physical instance button or `ArmyBookAppV2.openInstance(instanceId)`, not canonical title lookup |
| Personal Guide | `runtime.mjs:958` | `ArmyBookAppV2.openPersonalGuide()` on the imported native roster |

The public service exposes `state`, `snapshot`, `projection`, `candidates`, `attach`, `detach`, `effective`, `related`; optional source-choice methods are book-owned. Use native API only to observe and obtain IDs, then exercise the corresponding UI action. No snapshot should be fabricated for this sweep.

## Interpretation controls

Some retained inputs exercise older V1/parser contexts and old prices. They are included for coverage with explicit fixtureScope, but native V2 refusal is not by itself a new regression. Likewise a fixture asserted READY after a supplied clarification is not proof that raw paste alone must bypass clarification. Preserve original expectedStatusSource, binding metadata, and initial versus resolved observations. Neither UNKNOWN needs nor intentionally unknown gear justify guessing equipment, recipients or prices.

## Binding expectation clarification

The saved JSON fixtures contain empty bindings objects only; ALL_INPUTS normalized these to null. Four full DG JavaScript inputs have separately constructed nonempty canonical bindings; these are now recorded in BINDING_EXPECTATIONS.json (69 mapped inputs, four nonempty native binding objects, 66 independently supported raw-paste statuses). A helper-context READY is not automatically a raw-paste READY promise. The file preserves the source and expectedStatusContext, and leaves rawPasteExpectedStatus null where the original source does not prove it. No native import or QA program was executed to construct this clarification.

