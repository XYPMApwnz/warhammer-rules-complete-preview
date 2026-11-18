# Import messages — stage 1 inventory and proposal

Date: **2026-11-18** (Europe/Moscow). Pinned source: **`5bc1b038437fcac86966f87371760da94d7e9b38`**.

**STOP AFTER STAGE 1. No stage-2 implementation is authorized by this report.** The local feature branch `codex/import-messages-v1` remains at the exact baseline, with a clean working tree and no product commits. The separate `codex/import-messages-evidence` branch contains one documentation/evidence commit only.

## Review files

- [Full Markdown table](messages.md): the requested location / book / condition and existing fixture or test / current text / proposal / importance / placement, with stable review IDs.
- [The same ordered table as CSV](messages.csv): UTF-8 with BOM; quoted multiline fields; additional scope, reproduction status and notes columns for filtering.
- [Structured inventory](inventory.json): conditions, original diagnostic-to-UI relationships, exact proposed player copy, optional Details copy and observed case IDs.
- [Dormant/internal-only appendix](dormant-and-internal.md): 22 dormant API-view strings excluded from ordinary player-copy changes.
- [Current browser observations](evidence/browser-observations.json) and [supplement](evidence/browser-supplement.json).
- [BA/DA enrolled export provenance](evidence/authenticity-provenance.md) and [independent primary-agent byte/hash check](evidence/PRIMARY_PROVENANCE_CHECK.json).
- [Read-only scope verification](evidence/STAGE_1_SCOPE.json) and [cleanup outcome](evidence/CLEANUP_STATUS.json).

The table has **334 review rows**, not 334 unique paragraphs visible at once. It deliberately retains repeated producer origins so that different failure conditions are not lost behind one shared sentence. Native code names in the condition/provenance columns are reviewer information, not proposed player copy.

| Scope | Rows | Interpretation |
|---|---:|---|
| Shared target-screen copy | 129 | Labels, controls, statuses, explanations, dynamic templates and common error mappings |
| Shared card-only copy, unchanged | 1 | Existing no-weapon-profiles text; not an Attachment Setup message |
| Native clarification variants | 31 | All **15 final need kinds**, including the two adapted upstream kinds, and all **5 nonempty need reasons** |
| Native error origins | 132 | **85 codes**, many defensive/API-only paths; not 132 additional visible messages |
| Points reason mappings | 10 | Existing renderer explanations, not new points calculations |
| Import result statuses | 3 | READY / NEEDS_BINDINGS / REPLACEMENT_REQUIRED producer-to-player mapping |
| Book-specific visible rows | 15 | Ten atomic caveat fragments and five faction-error variants |
| Already-hidden authored fragments | 2 | Existing hidden points-reference sentences; **keep hidden** |
| Native option-caption templates | 6 | Tau weapon/recipient choices and Tyranids CHARACTER choice |
| Proposed new disclosure label | 1 | Details |
| Special clarification legends | 4 | Prevent technical generated rawLabel text from leaking through an otherwise friendly body |

**105 rows have a matching actual stage-1 UI observation; 229 are explicitly `NOT_REPRODUCED`.** The latter include conditional guards, newly proposed/hidden content and static coverage leads. Existing tests were read, not executed. A test mentioning an error code does not prove that its complete browser path or chooser was reproduced.

## Method and limits

The inventory traces the current native path, not retired V1 readers: book factories and native import results → `createRosterPanel()` → actual Attachment Setup controls. It distinguishes the native diagnostic, the text that `playerError()` or `renderBindings()` actually renders, and a proposed replacement. The producer inventory resolves to 33 distinct current rendered-text templates; the broader shared table also includes controls, headings and parameterized captions.

Application-authored wording and interpolation templates are enumerated. Arbitrary user-entered export names, all catalogue-owned unit/rule names, weapon statistics, rule prose and numeric values are data, not a finite copy-editing vocabulary: they remain parameterized and unchanged. No missing roster, weapon, composition, recipient or name was invented to make a message appear.

The browser used the existing running package of the pinned SHA, at 1440 px, sequentially in fresh isolated contexts with service workers blocked. It did **not** use the owner's browser profile. The two observation tools recorded **50 states, zero page errors**:

- All nine books: before input, ordinary successful import of their existing `new-recruit-export.json` faction fixture, and foreign-faction refusal using the exact pre-existing header transformation from `new-recruit-export-qa.mjs:45-49`.
- SM: the existing ambiguous Company Veteran fixture and empty import.
- Tau: existing missing-weapons and missing-composition fixtures; exact existing Student/Prototype inputs and ordinary source-choice save actions.
- Tyranids: the exact existing Trygon choice input and ordinary source-choice save action.
- DG: empty backup actions, unchanged accepted old snapshot restore/download, owner v37.25 input, Warlord save, Lord of Contagion → Deathshroud attach/detach, reload, and replacement/cancellation using the existing v37.15 owner export.

Input hashes and fixture/test locations are in the observation records. Constructed fixtures are identified as such; current acceptance of one supplied example does not certify an entire book or all export versions. Failed foreign imports retained the saved roster bytes in all nine observed cases. No existing QA suite, generated rebuild, A/B sweep or pre-FF was run during stage 1.

## Findings and proposed message structure

### 1. Keep the entry screen short

`roster.mjs:168-175` appends each supplied `importLimitations` card before the textarea without inspecting a roster. Actual current publication metadata contains these cards only for BA and DA. The other seven books have no such card; SM explicitly supplies an empty list.

| Book | Current expanded cards before input | Existing faction fixture observed READY | Foreign header observed refused |
|---|---:|---|---|
| DG | 0 | Yes | Yes |
| AM | 0 | Yes | Yes |
| CSM | 0 | Yes | Yes |
| EC | 0 | Yes | Yes |
| Tyranids | 0 | Yes | Yes |
| Tau | 0 | Yes | Yes |
| SM | 0 | Yes | Yes |
| DA | 2 | Yes | Yes |
| BA | 2 | Yes | Yes |

Proposal: before input, show the short instruction, export field and Import roster action. Render a relevant notice beside the affected clarification/unit only from existing result IDs, reason codes, chapter context or points issues. General capability limitations belong at the bottom in **Known limitations of this Army Book**, collapsed and omitted when empty. Do not show a book-wide warning merely because a book is open.

The original four cards combine unrelated topics. Row-level display gates in the table split those topics for presentation only; they do not change native admission, keyword predicates, rule activation, costs or source policy. In particular:

- DA context uses its existing `chapterContexts`/`chapterContext(id)` result and existing recipient declarations; an opened book or parsed header does not manufacture army membership.
- BA unsupported weapon notices use existing exact failed-need/source-issue identities, not a substring search anywhere in the export. Current notice metadata does not satisfy `importLimitationForNeed()`'s exact owner/kind/rawLabel/state contract, so that helper does not currently turn the broad BA card into a scoped explanation.
- Black Rage and Legacy of the Angel use their existing source/recipient facts. Their full rule text and all unknown battlefield conditions remain unchanged.
- Stormlance's notice is limited to its exact imported Detachment and explains that the current points document owns Detachment Points; presentation must not resolve an old source conflict or invent a price.
- Paid-equipment problems use the existing per-unit points issue. A roster that imported but has an unresolved total must not be described as an import rejection.
- Both already-suppressed reference-only sentences remain suppressed; moving warnings must not resurrect them.

### 2. Use one plain-language event/action pair

The proposed main copy and optional Details copy are explicit in the table. Examples:

| Situation | Proposed primary copy | Importance |
|---|---|---|
| Successful import | Roster imported. Review your units, then open your personal guide. | Information |
| Actionable clarification | This name needs confirmation. Choose the matching entry below. | Choice |
| Unrecognized header | The export header could not be read. Export the complete list as text from New Recruit and try again. | Error |
| Wrong army | This list is for {faction}, but {book} is open. Open the matching Army Book and import it there. | Error |
| Unsupported BA weapon | {weaponName} cannot be identified reliably by this importer yet. Send the original export to the site owner. | Error |
| Total unavailable after import | The app cannot calculate a reliable total. Check the issues below before using these points. | Information |

Labels and buttons can remain short phrases; they do not need artificial two-sentence prose. Keep **Open card**, preserving the owner's accepted label. Main import copy must not promise that a chooser exists when the result is blocked. It must not tell a player to change their army to suit an unsupported importer.

**Details is still player-facing.** Put the complete human explanation and saved-roster reassurance there, not raw reason codes, internal IDs, paths, JSON or an unsanitized producer error. Do not hide the important replacement consequence: clearing manual attachments remains visible before Replace roster is chosen. Do not hide an invalid Enhancement assignment behind the empty-Enhancements cleanup: the roster imported, the illegal Enhancement remains unapplied, Core 25.04 and retained exported-point facts remain explicit.

### 3. Two coverage warnings are obsolete

BA's literal supplied NR v37.2 export and DA's corrected supplied NR v37.3 export are explicitly enrolled and SHA-pinned in their native QA. The current nine-book fixture embeds exactly those bytes. Both imported through current ordinary UI in this stage. Primary-agent comparison independently confirmed the exact byte matches.

| Book | Exact native sample | Bytes | SHA-256 |
|---|---|---:|---|
| BA | `newrecruit-v37.2-user-redemptor.txt` | 919 | `fb0be23eb8036a47d6228ce1babfbb251b5980a7fb63a198033be7e782e957d9` |
| DA | `newrecruit-v37.3-user-da-10-models.txt` | 972 | `2fa72ca975ac40144da3dc7ffaba612e25e1fa5f9be337c9627bb6127702327d` |

Proposal: remove the two blanket “not yet checked against a real export” player warnings, retain the exact sample/coverage links in collapsed Details, and make no whole-book or external-authenticity certification claim. The source files' declared owner origin and hashes establish accepted repository evidence, not independently signed upstream authenticity. Raw/enrolled bytes, tests and generated metadata remain unchanged in this stage.

### 4. Native select captions also need the common copy layer

The first nine simple faction examples did not contain these source choices. Existing focused fixtures did: the Tau Student recipient dropdown really displays names with `parsed-unit-*`; Prototype options and the Tyranids Trygon CHARACTER option were also observed and saved normally in fresh contexts.

`books/tau-empire/v2/roster-boot.mjs:55-72` authors weapon-quantity captions, a possible technical selection-key suffix, and recipient names plus instance IDs. `books/tyranids/v2/roster-boot.mjs:54-59` authors the CHARACTER/Muster Armies choice. The shared renderer prints option titles verbatim.

Proposal: format their **captions only** in cosmetics, using exact existing recipient/model/weapon references. Preserve every option value, candidate count, selected set, limit, scope, ordering and source identity. Repeated units need the existing composition-aware names/ordinals, not a bare catalogue name. Same-name weapon occurrences must remain distinguishable. If exact existing references do not supply enough human context, STOP rather than simply strip an ID or choose a default. Do not extend source-choice legality or execution.

### 5. Existing gaps are not fixes authorized by this report

- `OPTION` and `COMPOSITION_MEMBER` can have IDs that project to a chooser, but the current confirmation map in `roster.mjs:436` has no handler for those kinds. This is a **static mismatch**, not a reproduced ordinary-nine-book successful confirmation. Copy must not promise a working confirmation path; enabling new accepted inputs requires separate approval. The observed Tau composition case had no usable choice and stayed blocked.
- SM `import-limitations-qa.mjs:22` still requires one Wardens notice although the current producer/payload has an empty limitations list. This test was not run, is not evidence of a current visible notice, and must not be used to resurrect it. Any repair of this older metadata expectation is separate from changing approved visible copy.
- The exported `renderInstanceContext()` has no production caller. Its raw applicability/provenance view is invoked only by the synthetic route test; do not count its technical strings as present on the supported Setup screen or edit them opportunistically.
- Defensive native guards without an existing ordinary-export reproduction are marked **not reproduced**. A producer code is not permission to expose its technical diagnostic or to assume the user made a particular mistake.

## Review-C polish: proposals, not implementation

| Item / location | Proposed stage-2 delta | Invariants to preserve |
|---|---|---|
| Open Stratagems — `runtime.mjs:558` | Use the existing themed link/card styling, readable contrast and focus treatment; keep its label and destination | Existing guide records, links and source fields |
| Empty lazy Stratagems — `runtime.mjs:461-482` | Before adding the heading/tab, prove zero using an exact read-only count/eligibility path without constructing rule text; memoize by the same roster state | Same selected-Detachment MATCH/CONDITIONAL rows; no Core inference, approximation or eager text building; first expanded result must equal precheck |
| Empty Enhancement field — `roster.mjs:578-582` | Do not show the field when no Enhancement was imported | Retain “not applied” and the Core 25.04 warning when an imported invalid Enhancement is inactive |
| Points label — `roster.mjs:575-577` | MFM base points → Points | Current verified base/total values and their ownership; keep Exported points distinct and never replace an unresolved value with a guess |
| Singular/plural — `roster.mjs:316,711` | 1 unit / 3 units; proper model plural | Exact counts and composition |
| No Warlord candidates — `roster.mjs:670-695` | Hide Save Warlord when the existing candidate list is empty | Existing eligibility, selected/imported Warlord identity, saved-state schema and error guards |
| One-model identical copies — `roster-labels.mjs:25-28` | Tyrannofex #1 instead of Tyrannofex (1 model) #1, for that exact homogeneous case | Physical units, order, #N distinctions and meaningful mixed-composition captions |
| captionName call — `cosmetics.mjs:3-11` | Remove the unused-return form only while retaining equivalent explicit name validation | The call is **not behaviorally dead**: it throws for a missing/ID-as-name caption. Keep fail-closed behavior; do not weaken a test to admit bad labels |

There is no existing proven cheap count-only interface documented by this stage. Stage 2 must not treat “this Detachment has any Stratagems” as proof that a particular current unit has applicable rows. If an exact cheap path cannot be implemented without changing eligibility or eagerly building text, STOP with that finding. Reuse loaded data; do not fetch another app-presentation payload merely to format messages or choices.

## Test implications requiring the owner's stage-2 approval

No old test was edited or run. The complete implementation diff and exact test table are stage-2 deliverables. These known checks need a bounded migration once the corresponding proposal is approved:

| Existing test | Old expectation / selector | Proposed equivalent check |
|---|---|---|
| `v2/cards-cosmetics-browser-qa.mjs:70-72` | Expanded BA/DA blanket caveats before input, including obsolete no-real-export sentences | None before input; only relevant scoped notices; collapsed general details; obsolete warning absent; same factual rules/keyword requirements retained |
| `v2/card-polish-2-browser-qa.mjs:134-149` | Old header-help wording and immediately visible examples | Exact new primary copy, old copy absent, open Details and retain both exact 3/5-line examples and width checks |
| `v2/roster-navigation-browser-qa.mjs:251-259` | Initial lazy header/tab exists even for zero rows | For exact zero, neither exists initially; otherwise lazy initial heading/tab, exact rows after first open and no repeated calculation; foreign-Detachment mutation still fails |
| `v2/roster-navigation-browser-qa.mjs:172,263-266` | Old MFM label identifies the independent base-price comparison branch | New visible Points label and old label absent, while preserving that exact price comparison using the existing origin/context rather than silently skipping it |
| Clarification field selectors, e.g. `v2/card-display-browser-qa.mjs:179` | Matching source entry prefix | Exact approved new label/accessible name; old absent; same native candidates, values, quantities and recipients |
| Shared cosmetics/header/points checks | Exact old player strings | Exact approved replacements plus old absence, without changing source/factual values or negative controls |

The empty-header and price-origin checks include structure/observation changes beyond replacing a string. This table makes that explicit for approval; it is **not** permission to remove them. If the owner does not approve those equivalent checks, stage 2 must STOP rather than weaken an assertion.

The future visible-copy guard should inspect messages, headings, accessible names, placeholders, native select option captions and expanded Details—not only text nodes with layout rectangles. A native dropdown's options can be player-visible without ordinary element rectangles. Keep raw editable export input separate from application-authored messages; do not use this to exempt generated legends or option captions. Injecting an old internal marker into a message/option must fail the guard. All real game terms, rule quotations and source facts remain intact.

## Stage-2 boundary and delivery status

Only after owner approval: centralize approved player copy/formatting in the existing cosmetics module; move book caveats using existing evidence; implement the approved presentation-only polish; retain import results and data. No new runtime module is planned; if one is introduced, precache and startup graph must be updated. Then run the byte-identical generated gate, exact native 199-roster/507-state A/B, required 390/1440 gallery, approved old-test migrations/mutations and one final pre-FF under the task rules. None of those future gates is claimed PASS here.

The evidence commit contains Markdown, CSV and supporting read-only observations/recipes only. The source tree remains `5e20ac847b039d871be1ad463cc90446c18ea984`, the exact tree of the pinned baseline. The preview was not restarted and still serves `5bc1b038…` with HTTP 200. No source/main/release/Pages ref or rule, price, effect, CP, import logic, test expectation, enrolled RAW or fixture was changed.

Cleanup of `E:/Warhammer/qa-tmp/import-messages` was attempted, but automatic execution review rejected the exact-root deletion as **blocked by policy**. No deletion executed and no alternative method was attempted. The folder remains; the running preview is outside it and was preserved.

**STOP — await the owner's approval of the copy/placement table and the explicitly listed equivalent UI-test changes.**
