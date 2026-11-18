# Roster navigation — READY_FOR_REVIEW

Delivery date: **2026-11-18** (Europe/Moscow). Feature branch: `codex/roster-navigation-v1`.

**READY_FOR_REVIEW — `5bc1b038437fcac86966f87371760da94d7e9b38`.** The single full pre-FF on `880a98dbb9dd743f548fc1ed750093912628b570` completed in 136.52 minutes: **178 PASS / 1 FAIL**. The sole failure was an obsolete desktop-menu visibility expectation. Under the original task's explicit one-test-file completion exception, only that test changed afterward and its complete separate run passed **446 checks, 0 failures**. The run-to-delivery diff is exactly one test file; runtime, generated facts, and gameplay bytes are unchanged. The original failed run is retained verbatim and is not relabelled a fully green rerun.

The result is a clearer roster menu and Attachment Setup, distinct physical-unit names, explicit Warlord selection, and lazy eligible Stratagem cards. Gameplay facts, saved-roster format, source identities, recipients, attachments, and effective calculations remain under their existing owners.

## Exact review identity

| Item | Exact identity / status |
|---|---|
| Accepted source baseline | `c477d20aaa16f850b56f18aa878d6b5fb8b4057f` |
| Measured/runtime/UI commit | `8e17f9d39f286d4cbc930539f817b2fb7ef0047d` |
| Exact commit of the one full pre-FF | `880a98dbb9dd743f548fc1ed750093912628b570` |
| Final feature/review commit | `5bc1b038437fcac86966f87371760da94d7e9b38` |
| Runtime cache revision | `a4ab4bdc382e9a00` |
| Full pre-FF | **178 PASS / 1 FAIL**, 136.52 min; sole corrected test **446/446 PASS**, 2.08 min; no second full run |
| Review publication, feature push | Feature `5bc1b038437fcac86966f87371760da94d7e9b38` pushed; evidence branch `codex/roster-navigation-evidence`, one docs-only commit above this feature, never merged |
| Protected source/release refs | GitHub source remains `c477d20aaa16f850b56f18aa878d6b5fb8b4057f`; protected refs verified unchanged after feature push; no FF |
| Preview switch | Final SHA, HTTP 200 on localhost and LAN; PID 41928; existing HTTPS/TLS unchanged |
| Cleanup | Exact task-root removal rejected by automatic execution review; temporary directory retained, no deletion executed |

The measured commit and the full-pre-FF commit differ only in canonical whitespace serialization of `tools/pages-runtime-manifest.json`. The JSON is deeply equal; every manifest entry/value and all runtime and gameplay bytes are identical. The bridge is recorded in [FINAL_COMMIT_BRIDGE.json](proofs/FINAL_COMMIT_BRIDGE.json). Thus completed runtime/UI measurements on `8e17f9d39f286d4cbc930539f817b2fb7ef0047d` apply to the same runtime bytes at `880a98dbb9dd743f548fc1ed750093912628b570`. They do not replace the final pre-FF run on `880a98dbb9dd743f548fc1ed750093912628b570`.


The delivery commit `5bc1b038437fcac86966f87371760da94d7e9b38` adds exactly one later **test-only** correction. [Run-to-delivery boundary proof](proofs/FINAL_TEST_ONLY_DIFF.json), [complete sole-test patch](proofs/POST_PREFLIGHT_TEST_ONLY.patch), and [diff stat](proofs/POST_PREFLIGHT_TEST_ONLY.stat.txt) prove that no application, package manifest, cache stamp, generated fact, or gameplay implementation changed after the full pre-FF. All runtime measurements/gallery captures therefore also cover the identical runtime at the delivery commit.

```text
v2/card-gained-rules-browser-qa.mjs | 6 ++++--
 1 file changed, 4 insertions(+), 2 deletions(-)
```

Six feature commits, in dependency order:

| Commit | Title |
|---|---|
| `7fa1dc25e635ceb7e5744888191e33208222d927` | feat: add shared physical roster names and Core reference selection |
| `ced098f09a86d953f7c72fd75878270dc9b41326` | feat: simplify roster navigation and load Stratagems on demand |
| `f3806e812aae0e305446def138a2f259289e49c8` | test: preserve roster facts and saved snapshots across navigation changes |
| `8e17f9d39f286d4cbc930539f817b2fb7ef0047d` | fix: share accepted MFM prices and complete roster navigation controls |
| `880a98dbb9dd743f548fc1ed750093912628b570` | chore: keep runtime dependency manifest serialization canonical |
| `5bc1b038437fcac86966f87371760da94d7e9b38` | test: verify visible desktop roster section navigation |

## Implementation 1 — roster navigation

The roster menu shows the faction, selected Detachments, points, and selected Warlord. Physical units remain separate. Each formed group starts with its bodyguard; attached leaders and Support follow with indented `↳` labels. Names use model composition to distinguish copies, and `#N` is retained only where otherwise identical copies still require an ordinal. The same physical naming is reused by the Guide, Setup, effective cards, and relationship captions.

Full Army Book and Attachment Setup sit at the bottom of roster navigation. The mobile Units control applies at widths **760 px and below**. Keyboard navigation, Escape, focus return, branch expansion, scrolling, desktop navigation, and physical URLs use the existing navigation controller. Original Guide unit links remain available. Selecting a unit or moving between Full Army Book, Guide, and Setup preserves the exact roster and physical context.

## Implementation 2 — Attachment Setup and Warlord

Attachment Setup has one actual roster-wide Warlord selector. Candidates come from the physical component's own CHARACTER eligibility, avoiding an attached leader's borrowed keywords. Save Warlord uses the existing validated snapshot-load path and changes only the existing Warlord fields. Immediate menu/crown refresh, persistence, reload, and ordinary attachment behavior are checked. Effective Datasheet identity facts remain available in their supported context.

The action is now **Open card**, model count is labelled **Models**, and import count wording uses units. Successful imports fold the actual disclosure to **Import another roster**. Reimports, replacement confirmation/cancellation, errors, unfinished input, warnings, backup restore, and the existing raw-text input remain on their original controls. Tests reopen the disclosure before reading notices or filling an existing import scenario; no hidden replacement panel is used.

The native snapshot schema is unchanged. Import-header metadata, including the original points limit, is transient and keyed to the active roster; successful restore clears it. Saved native snapshots do not carry that header limit, so reopening an old snapshot can show `N pts` without `/ limit`. It never borrows a limit from another list and adds no persisted sidecar or snapshot field.

## Implementation 3 — Stratagem scope and lazy presentation

The accepted Core clarification separates **reference availability** from **physical-unit applicability**:

- Personal Guide exposes all Stratagems from its selected Detachments and all **ten** explicitly accepted Core Stratagem reference records. Core references are not filtered by a guessed unit target.
- Roster cards expose only existing native `MATCH` or `CONDITIONAL` Stratagem rows belonging to the roster's selected Detachments. Conditional rows retain their status and full conditions. No Core applicability or foreign-Detachment eligibility is invented.
- Core unit applicability remains **DEFERRED_NEEDS_CONTRACTS**, at `books/shared/rule-contract-v2/book-related.mjs:118`. The Guide's ten reference cards are not evidence that those contracts exist.
- The **Compatible Stratagems & Enhancements** button is removed only from roster cards. The Full Army Book compatible panel, its filters, Enhancement controls, and independent negative cases remain supported.

Under the second accepted clarification, a roster card initially contains the Stratagems heading/disclosure and an accessible local tab, at **390 and 1440 px**. The first opening calls the existing eligibility engine and renders complete eligible text. Subsequent openings reuse the result once per physical instance and unchanged state snapshot. A changed snapshot invalidates that cache. If no eligible rows exist, first opening removes the empty section and matching tab, with focus restored appropriately. The normal card-open path therefore defers engine/text work; it does not infer or alter its result.

First expansion performs deferred work. Card-open timing below excludes that later interaction; functional checks cover first opening, repeated opening, cache invalidation, empty results, complete text, and the desktop local-tab path. No separate first-expansion latency claim is made.

## Implementation 4 — prices, saved state, and runtime boundary

Attachment Setup uses the shared accepted MFM reader for per-unit prices and the existing native total when available. Native `UNRESOLVED` remains explicit. Where no native calculator is available, any export-derived total is labelled imported. The previous accepted card-price reader was preserved as the independent comparison implementation: **33,700** boundary/copy/native-price cases match across all **491** datasheet book contexts, copies **1–4**, and five native-price variants. [Price-reader equivalence](proofs/PRICE_READER_EQUIVALENCE.json).

The new shared roster-label module is **2,296 bytes**, **1,033 bytes gzip**. It is in the existing runtime dependency inventory and mandatory startup closure. This changes presentation and supported runtime dependencies; accepted rule sources, canonical/effective gameplay data, and generated factual artifacts are not rewritten.

| Runtime inventory / release metadata | Exact change | Reason |
|---|---|---|
| `books/shared/army-book-app-v2/roster-labels.mjs` | One new 2,296-byte presentation module | Shared physical-unit names across the roster UI |
| `tools/pages-runtime-manifest.json` | Explicit runtime-module declaration; canonical serialization | Include the new startup dependency in the supported package |
| `glossary/generated/cache-revision.js` | Runtime asset hashes and cache revision `1c58bc9daaf0c2f5` → `a4ab4bdc382e9a00` | Normal cache producer stamps the changed UI assets and mandatory dependency |
| `v2/app.html` | Same producer updates runtime cache/version stamps | Keep bootstrap and service worker on one publication revision |
| The 147 factual generated outputs | No byte changed | Independent baseline comparison and full generated rebuild gate |

The two release-metadata files are reported separately from factual book/Core/glossary outputs; their normal cache/version stamping does not change a rule, price, recipient, condition, effect, or catalogue entry.

## Gameplay and saved-state preservation

| Evidence | Completed result |
|---|---|
| Generated artifact comparison | **147** protected generated files byte-identical to baseline |
| Native gameplay A/B | **199** cases, **507** captured frames; **0** full-field differences; all nine books byte-identical in comparison outputs |
| Generated gameplay A/B | All **9** books, **0** differences |
| Independent price reader | **33,700** equivalent cases across **491** datasheet contexts |
| Legacy native saved snapshots | **9** baseline fixtures load and reload with exact fields/attachments; schema unchanged |
| New all-book UI guard in full queue | **224** checks across **18** contexts, nine books at 390/1440, including old-save admission — [results](proofs/final-queue-navigation/RESULTS.json) |
| Later focused Guide scope check | Death Guard: **18** checks passed |

Gameplay evidence: [final gameplay run](proofs/final-8e17-gameplay/RESULTS.json), [generated bytes](proofs/final-8e17-gameplay/GENERATED_BASE_BYTES.json), [native comparison](proofs/final-8e17-gameplay/native-compare.log), and [generated gameplay comparison](proofs/final-8e17-gameplay/generated-gameplay-compare.log). Native capture includes 177 READY and 22 NEEDS_BINDINGS cases; those explicit unknown/binding outcomes were retained rather than converted to READY.

The old-save fixture is `v2/fixtures/roster-navigation-saved-v2.json`, **100,699 bytes**, rooted in accepted baseline `c477d20aaa16f850b56f18aa878d6b5fb8b4057f` and pinned to SHA-256 `08b65ce335f84cbb0b481501db023a3a3a518a7dd16c75cbbb6fdaba32b1fefe`. The browser guard admits one baseline snapshot per book and checks exact reload/storage state. It does not rebuild those expectations from the new implementation.

The Death Guard owner v37.25 export is unchanged and produces eight physical units. Setup adds exactly Lord of Contagion → Deathshroud Terminators and Biologus Putrifier → ten Plague Marines through ordinary attachment controls. The separate five-model Plague Marines remain separate. These are explicit derived UI attachments, not invented content inside the original export.

## Completed targeted checks and mutation proof

| Check | Result / evidence |
|---|---|
| All-nine new browser acceptance | **PASS**, 206 checks / 18 contexts — [results](proofs/new-browser-all-final-ui/RESULTS.json) |
| Focused Guide scope regression | **PASS**, 18 checks — [log](proofs/guide-scope-dg-final.log) |
| Existing shell browser | **PASS**, desktop and phone; no page errors or forbidden resources — [log](proofs/targeted-shell-browser-qa.mjs.log) |
| Existing cards-cosmetics browser | **PASS**, 154 rows, zero failures — [log](proofs/targeted-3-cards-cosmetics-browser-qa.mjs.log) |
| Existing Full Army Book related panel | **PASS**, 6 scenarios × 2 devices, 12 checks — [log](proofs/targeted-3-related-panel-browser-qa.mjs.log) |
| Existing recipient browser against packaged runtime | **PASS** — [log](proofs/targeted-f1-packaged.log) |
| Cosmetics pure controls | **PASS** — [log](proofs/cosmetics-pure-final.log) |
| Workflow | **PASS**, 83 QA entrypoints — [log](proofs/workflow-final.log) |
| Integration | **PASS**, 529/529 — [log](proofs/integration-final.log); its full-queue job also passed |
| Foreign-Detachment mutation | **EXPECTED FAIL / guard effective**: injected Tallyband Summoners row rejected by exact native selected-Detachment equality — [report](proofs/final-foreign-detachment-mutation/RESULTS.json) |
| Mandatory startup closure | **PASS**, 160 nodes / 413 edges, 219 URLs; removal controls rejected missing mandatory resources — [report](proofs/startup-final/REPORT.json), [graph](proofs/startup-final/GRAPH.json) |
| Runtime packaging | **PASS**, 453 files and 14 packaging/boundary controls — [log](proofs/packaging-final.log) |
| Full pre-FF on `880a98db` | **178 PASS / 1 FAIL**; all 179 jobs completed; failure and correction documented below |
| New all-book navigation in that queue | **PASS**, 224 checks — [results](proofs/final-queue-navigation/RESULTS.json) |
| Sole corrected existing test on final SHA | **PASS**, 446 checks, 0 failures — [results](proofs/post-preff-card-gained-5bc1b038/RESULTS.json), [log](proofs/post-preff-card-gained.log) |

The foreign-Detachment mutation's report intentionally has `status: FAIL`; it proves the real guard rejects the foreign canonical row and must not be confused with a normal acceptance failure. Existing fact, recipient, scope, text/value, and source-integrity negative controls remain intact.

The completed startup proof covers 85 eager and 75 selected-book nodes, all nine factory closures, and removal controls for both eager and selected-book resources. Large book payloads remain lazy. Packaging confirms deterministic rebuilding, exact source/output bytes, allowlist and traversal rejection, exclusion of development/QA and unreviewed capture content, corruption rejection, and restoration after its negative fixture. Cache revision is `a4ab4bdc382e9a00`; package content SHA-256 is `2b1e393cf757df0f55b3fb3c1871e6c0ed4f0941a13b57b8e425b33a374f15ec`.

## Performance

The final accepted material-regression rule is **strictly more than 10% AND strictly more than 100 ms** for the median. Both conditions must hold. Three repetitions are used per book/revision, with alternating order `base/head; head/base; base/head`. The final matched run uses clean baseline `c477d20aaa16f850b56f18aa878d6b5fb8b4057f` and clean measured commit `8e17f9d39f286d4cbc930539f817b2fb7ef0047d`, 390×844, fresh browser contexts, blocked service workers, local unthrottled HTTP/CPU, and no parallel heavy QA. Timing starts immediately before the real UI click and ends after the exact rendered destination plus two animation frames. Import, attachment setup, and menu preparation are outside the timed interval.

### Final matched baseline/head measurements

| Book | Action | Base median ms | Final median ms | Δ ms | Δ % | Accepted rule |
|---|---|---:|---:|---:|---:|---|
| Death Guard | Personal Guide open | 45.191 | 48.608 | +3.418 | +7.56% | PASS: neither exceeds both limits |
| Death Guard | Physical card open | 278.861 | 264.539 | -14.322 | -5.14% | PASS: neither exceeds both limits |
| Space Marines | Personal Guide open | 38.641 | 56.574 | +17.933 | +46.41% | PASS: neither exceeds both limits |
| Space Marines | Physical card open | 224.708 | 193.145 | -31.563 | -14.05% | PASS: neither exceeds both limits |

| Action | Three base samples, ms | Three final samples, ms |
|---|---|---|
| Death Guard / Personal Guide open | 68.367, 36.366, 45.191 | 37.847, 54.041, 48.608 |
| Death Guard / Physical card open | 316.473, 266.420, 278.861 | 264.059, 264.539, 276.108 |
| Space Marines / Personal Guide open | 39.084, 37.047, 38.641 | 56.574, 61.485, 45.461 |
| Space Marines / Physical card open | 241.284, 183.214, 224.708 | 194.081, 182.481, 193.145 |

Final result: **PASS under the accepted combined threshold**. The SM Guide median increased by 46.41%, or 17.933 ms; that is reported explicitly and does not exceed the 100 ms condition. These measurements support the two tested UI paths and environment; they do not establish general device/browser performance. [Final alternating measurements](proofs/final-8e17-browser/measure-both/RESULTS.json).

### Preserved pre-lazy draft comparison

| Book | Action | Original base median ms | Pre-lazy draft median ms | Δ ms | Δ % |
|---|---|---:|---:|---:|---:|
| Death Guard | Personal Guide open | 36.503 | 58.899 | +22.395 | +61.35% |
| Death Guard | Physical card open | 218.682 | 296.395 | +77.714 | +35.54% |
| Space Marines | Personal Guide open | 62.844 | 69.763 | +6.919 | +11.01% |
| Space Marines | Physical card open | 267.168 | 272.567 | +5.399 | +2.02% |

These earlier runs used separate sequential base and draft batches. Their original stop flags reflected the earlier strict percentage-only instruction and remain preserved in [MEASUREMENT_COMPARISON.json](proofs/MEASUREMENT_COMPARISON.json), [original base](proofs/measure-base/RESULTS.json), and [pre-lazy draft](proofs/measure-head/RESULTS.json). The owner subsequently authorized lazy opening and the combined percentage/millisecond threshold. The final alternating table is a new matched comparison; its baseline medians differ from the original batch and must not be mixed with the old draft rows. The original stop is not erased or relabelled a passing final implementation.

The [original STOP report](proofs/REPORT_ORIGINAL_STOP.md) is retained verbatim as historical evidence. Its draft/uncommitted status describes that earlier measurement, not the final feature commit.

## Offline before/after gallery

[Open the complete gallery](GALLERY.html). The archive source is external `review-gallery/index.html`; the review destination is `docs/reviews/roster-navigation-v1/GALLERY.html` with its gallery assets and index kept together.

Coverage is all **9** books at **390 and 1440 px**. The index records **186** screenshot entries: **86** before/after pairs and **14** after-only interaction examples, with **177** distinct PNG files after content deduplication. No before screenshot is unpaired. The two reports identify clean baseline `c477d20aaa16f850b56f18aa878d6b5fb8b4057f` and measured commit `8e17f9d39f286d4cbc930539f817b2fb7ef0047d`. Their runtime identity is bridged to final `880a98dbb9dd743f548fc1ed750093912628b570` as described above. [Gallery index](GALLERY_INDEX.json).

The gallery includes Setup, Guide, mobile menu/desktop sidebar, physical cards, composition distinctions, Warlord/menu state, and additional Stratagem interaction examples. Death Guard includes all eight owner-roster physical instances at both widths. Screenshots show final presentation, while exact gameplay/state equivalence is established by the separate A/B proofs.

## Equipment inventory — complete book-context denominator

The equipment audit enumerated all **491 canonical datasheet book contexts**. Its primary denominator is explicit selectable **nonweapon equipment identity occurrences per UNIT**, not a globally unique item catalogue, aliases, or roster observations. Inherited SM contexts remain included in DA/BA totals. Weapon/profile-providing equipment is excluded by the inventory's stated boundary.

| Book | Datasheets | Explicit nonweapon identities | Exact helper relations | Missing helper relation | Existing presenter text links |
|---|---:|---:|---:|---:|---:|
| Death Guard | 36 | 6 | 0 | 6 | 6 |
| Adeptus Mechanicus | 34 | 12 | 6 | 6 | 12 |
| Chaos Space Marines | 54 | 7 | 7 | 0 | 7 |
| Emperor's Children | 23 | 7 | 5 | 2 | 7 |
| Tyranids | 52 | 0 | 0 | 0 | 0 |
| T'au Empire | 43 | 43 | 8 | 35 | 43 |
| Space Marines | 85 | 12 | 9 | 3 | 12 |
| Dark Angels | 83 | 14 | 10 | 4 | 14 |
| Blood Angels | 81 | 12 | 10 | 2 | 12 |
| **Total book contexts** | **491** | **113** | **55** | **58** | **113** |

All 113 identities have an existing explicit presenter route; 55 resolve through the equipment-reference helper and 58 use another explicit supported text relation. There are zero unlinked or ambiguous presenter identities in this inventory. A helper-only zero is not a missing UI relationship. **A text-reference link is not proof of executable gameplay behavior**; no missing contract is filled by a name/alias match and no new behavior certification is claimed.

[Full inventory and exact 58-item missing-helper list](equipment/ALL_DATASHEET_EQUIPMENT_INVENTORY.md#exact-identities-without-a-helper-contract-relation) · [machine-readable inventory](equipment/ALL_DATASHEET_EQUIPMENT_INVENTORY.json). The list includes canonical equipment paths, UNIT identity, explicit presenter route, and limitations for independent review.

## All 31 existing browser-test adaptations

These are the complete approved migrations of pre-existing tests, not new factual expectations. The baseline-to-final `5bc1b038437fcac86966f87371760da94d7e9b38` patch includes the sole post-pre-FF desktop visibility correction. [Full unabridged patch](approved-tests.patch) · [detailed audit](approved-tests.md) · [audit JSON](proofs/FINAL_EXISTING_TESTS.json).

For 29 label/form files, reversing only the enumerated UI migrations recovers the original source after newline normalization, with exact appended-helper validation. The explicitly reviewed gained-rules change replaces the obsolete desktop-hidden policy with visible exact-tab and physical-target click checks; its unchanged mobile check is reused verbatim. The explicitly reviewed cosmetics relocation preserves the same nine-element DG Warlord Yes/No array and all other-book Not set checks, now derived from the actual roster-wide selector and actual rendered unit-instance order. The shell retains every old assertion line and returns to the complete original physical URL after the Full Army Book panel. The synthetic route test changes only the two actual-control selectors. No original canonical/physical ID, sourceInstanceId, recipient, scope, factual text/value, number, source hash, or existing negative/mutation control was reset.

The import helper waits for unique `[data-roster-view]`, then opens actual `details[data-roster-import]` through its summary only if raw input is hidden. Other specific `.v2-roster` scopes remain unchanged. Removed action labels are asserted absent with hidden controls included. The Warlord relocation additionally asserts one actual selector and zero removed per-unit captions.

| Test and final changed line starts | Before | After | Why |
|---|---|---|---|
| `v2/admech-fnp-browser-qa.mjs:77, 80, 224` | Fill the existing raw-text input directly; some Setup helpers await that input. | Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Successful imports now fold the form; no new fixture or import scenario. |
| `v2/attached-rule-text-browser-qa.mjs:125, 128, 147, 241` | Open the exact physical owner using Effective datasheet. Fill the existing raw-text input directly; some Setup helpers await that input. | Open the same owner using Open card; assert the old label is absent including hidden controls. Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Authorized action-label change. Successful imports now fold the form; no new fixture or import scenario. |
| `v2/card-display-2-browser-qa.mjs:57, 60, 277, 311` | Open the exact physical owner using Effective datasheet. Fill the existing raw-text input directly; some Setup helpers await that input. | Open the same owner using Open card; assert the old label is absent including hidden controls. Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Authorized action-label change. Successful imports now fold the form; no new fixture or import scenario. |
| `v2/card-display-browser-qa.mjs:82, 85, 175, 201` | Open the exact physical owner using Effective datasheet. Fill the existing raw-text input directly; some Setup helpers await that input. | Open the same owner using Open card; assert the old label is absent including hidden controls. Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Authorized action-label change. Successful imports now fold the form; no new fixture or import scenario. |
| `v2/card-gained-rules-browser-qa.mjs:140, 160, 195, 243, 347` | Open the exact physical owner using Effective datasheet. Fill the existing raw-text input directly; some Setup helpers await that input. Require desktop local navigation display:none; mobile already clicks the exact Gained rules tab and validates its physical section. | Open the same owner using Open card; assert the old label is absent including hidden controls. Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. Require desktop display:flex and the exact Gained rules tab visible; click it and use the unchanged mobile physical-target/heading visibility check. Mobile and every factual/value/scope check remain unchanged. | Authorized action-label change. Successful imports now fold the form; no new fixture or import scenario. The accepted immediate roster-card section menu includes desktop. Sole test-only correction after the full pre-FF; no runtime or generated byte changed. |
| `v2/card-polish-2-browser-qa.mjs:45, 52, 239` | Open the exact physical owner using Effective datasheet. Fill the existing raw-text input directly; some Setup helpers await that input. | Open the same owner using Open card; assert the old label is absent including hidden controls. Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Authorized action-label change. Successful imports now fold the form; no new fixture or import scenario. |
| `v2/card-recipient-browser-qa.mjs:92, 95, 470` | Fill the existing raw-text input directly; some Setup helpers await that input. | Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Successful imports now fold the form; no new fixture or import scenario. |
| `v2/card-texts-browser-qa.mjs:39, 46, 63, 184` | Open the exact physical owner using Effective datasheet. Fill the existing raw-text input directly; some Setup helpers await that input. | Open the same owner using Open card; assert the old label is absent including hidden controls. Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Authorized action-label change. Successful imports now fold the form; no new fixture or import scenario. |
| `v2/cards-cosmetics-browser-qa.mjs:27, 33, 37, 69, 74, 136, 157` | Open the exact physical owner using Effective datasheet. Fill the existing raw-text input directly; some Setup helpers await that input. Import-pane screenshot scrolls to h2; warnings read from open pane; Warlord labels read from each unit dt; drawer found by old name. | Open the same owner using Open card; assert the old label is absent including hidden controls. Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. Screenshot scrolls to actual summary/h2 and disclosure is opened before identical warning checks. Warlord labels derive from the actual selected instance and original rendered unit order; exact nine Yes/No DG array and all Not set expectations remain. Assert exactly one Warlord control and zero removed per-unit captions. Use #navMenu. | Authorized action-label change. Successful imports now fold the form; no new fixture or import scenario. Authorized heading/form and single roster-wide Warlord-control relocation; no changed owner, ordinal, or expected label values. |
| `v2/charge-effects-browser-qa.mjs:84, 87, 228` | Fill the existing raw-text input directly; some Setup helpers await that input. | Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Successful imports now fold the form; no new fixture or import scenario. |
| `v2/detachment-card-text-browser-qa.mjs:30, 34, 113` | Open the exact physical owner using Effective datasheet. Wait for the visible import textbox as Setup readiness. | Open the same owner using Open card; assert the old label is absent including hidden controls. Wait for the unique [data-roster-view] owner, allowing the form to remain folded. | Authorized action-label change. Authorized layout/readiness relocation. |
| `v2/detachment-recipient-browser-qa.mjs:67, 70, 379` | Fill the existing raw-text input directly; some Setup helpers await that input. | Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Successful imports now fold the form; no new fixture or import scenario. |
| `v2/detachment-synthetic-table-browser-qa.mjs:162, 188, 243` | Fill the existing raw-text input directly; some Setup helpers await that input. | Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Successful imports now fold the form; no new fixture or import scenario. |
| `v2/dg-am-recipient-enrollment-browser-qa.mjs:66, 70, 93, 280` | Open the exact physical owner using Effective datasheet. Fill the existing raw-text input directly; some Setup helpers await that input. | Open the same owner using Open card; assert the old label is absent including hidden controls. Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Authorized action-label change. Successful imports now fold the form; no new fixture or import scenario. |
| `v2/enhancement-presentation-browser-qa.mjs:50, 53, 69, 148` | Open the exact physical owner using Effective datasheet. Fill the existing raw-text input directly; some Setup helpers await that input. | Open the same owner using Open card; assert the old label is absent including hidden controls. Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Authorized action-label change. Successful imports now fold the form; no new fixture or import scenario. |
| `v2/epic-hero-enhancements-browser-qa.mjs:31, 78, 116` | Open the exact physical owner using Effective datasheet. Fill the existing raw-text input directly; some Setup helpers await that input. | Open the same owner using Open card; assert the old label is absent including hidden controls. Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Authorized action-label change. Successful imports now fold the form; no new fixture or import scenario. |
| `v2/fabius-safe-import-browser-qa.mjs:42, 49, 66, 146` | Open the exact physical owner using Effective datasheet. Fill the existing raw-text input directly; some Setup helpers await that input. | Open the same owner using Open card; assert the old label is absent including hidden controls. Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Authorized action-label change. Successful imports now fold the form; no new fixture or import scenario. |
| `v2/new-recruit-export-browser-qa.mjs:42, 53, 72` | Open the exact physical owner using Effective datasheet. Fill the existing raw-text input directly; some Setup helpers await that input. | Open the same owner using Open card; assert the old label is absent including hidden controls. Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Authorized action-label change. Successful imports now fold the form; no new fixture or import scenario. |
| `v2/new-recruit-model-names-browser-qa.mjs:31, 40, 60` | Fill the existing raw-text input directly; some Setup helpers await that input. | Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Successful imports now fold the form; no new fixture or import scenario. |
| `v2/new-recruit-plain-header-browser-qa.mjs:34, 37, 73, 93, 132` | Open the exact physical owner using Effective datasheet. Fill the existing raw-text input directly; some Setup helpers await that input. | Open the same owner using Open card; assert the old label is absent including hidden controls. Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Authorized action-label change. Successful imports now fold the form; no new fixture or import scenario. |
| `v2/reviewed-text-coverage-browser-qa.mjs:32, 34, 42, 85` | Open the exact physical owner using Effective datasheet. Fill the existing raw-text input directly; some Setup helpers await that input. | Open the same owner using Open card; assert the old label is absent including hidden controls. Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Authorized action-label change. Successful imports now fold the form; no new fixture or import scenario. |
| `v2/rule-popups-browser-qa.mjs:35, 206` | Open the exact physical owner using Effective datasheet. Fill the existing raw-text input directly; some Setup helpers await that input. | Open the same owner using Open card; assert the old label is absent including hidden controls. Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Authorized action-label change. Successful imports now fold the form; no new fixture or import scenario. |
| `v2/sweep-polish-browser-qa.mjs:85, 141, 160, 220` | Open the exact physical owner using Effective datasheet. Fill the existing raw-text input directly; some Setup helpers await that input. | Open the same owner using Open card; assert the old label is absent including hidden controls. Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Authorized action-label change. Successful imports now fold the form; no new fixture or import scenario. |
| `v2/tyranids-seven-effects-browser-qa.mjs:67, 70, 335` | Fill the existing raw-text input directly; some Setup helpers await that input. | Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Successful imports now fold the form; no new fixture or import scenario. |
| `v2/wardens-source-binding-browser-qa.mjs:25, 28, 51, 77` | Open the exact physical owner using Effective datasheet. Fill the existing raw-text input directly; some Setup helpers await that input. | Open the same owner using Open card; assert the old label is absent including hidden controls. Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Authorized action-label change. Successful imports now fold the form; no new fixture or import scenario. |
| `books/shared/army-book-app-v2/personal-datasheet-browser-qa.mjs:199, 366, 373, 506` | Open the exact physical owner using Effective datasheet. Fill the existing raw-text input directly; some Setup helpers await that input. | Open the same owner using Open card; assert the old label is absent including hidden controls. Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Authorized action-label change. Successful imports now fold the form; no new fixture or import scenario. |
| `tests/browser/cold-offline.mjs:30, 34, 39` | Open the exact physical owner using Effective datasheet. Fill the existing raw-text input directly; some Setup helpers await that input. | Open the same owner using Open card; assert the old label is absent including hidden controls. Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Authorized action-label change. Successful imports now fold the form; no new fixture or import scenario. |
| `tests/browser/pwa-update-flow.mjs:35, 39, 44, 52` | Open the exact physical owner using Effective datasheet. Fill the existing raw-text input directly; some Setup helpers await that input. | Open the same owner using Open card; assert the old label is absent including hidden controls. Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Authorized action-label change. Successful imports now fold the form; no new fixture or import scenario. |
| `tests/browser/pwa-bootstrap-update.mjs:223, 226, 413, 416, 420, 484` | Fill the existing raw-text input directly; some Setup helpers await that input. | Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden. | Successful imports now fold the form; no new fixture or import scenario. |
| `v2/shell-browser-qa.mjs:193, 208` | Compatible Stratagems & Enhancements dialog opened on parsed-unit-1 roster card. | Assert removed roster button/label absent, open the actual Full Army Book button and same canonical datasheet, retain dialog geometry/tab/close checks, return via Roster/Open card, and assert the complete original physical URL plus existing instance/effective-reference checks. | The user removed this panel only from roster cards; its Full Army Book consumer remains supported. |
| `books/shared/army-book-app-v2/route-context-synthetic-browser-qa.mjs:129` | Attachment Setup/Roster searched only in .toc-shortcuts; mobile drawer selected by Open navigation name. | Search bottom shortcuts and the retained full-book shortcuts; open the same #navMenu control across Units/Open navigation labels. | Attachment Setup moved to the bottom, and the roster drawer has a new accessible label. |

No change outside the explicitly allowed UI migrations was found in the existing-test review. The full patch is preserved, rather than only a summary or altered EXPECTED list.

## Known failure and diagnostic limits

**Synthetic route browser: known off-queue baseline HTTP 404, not fixed and not PASS.** The same error is reproduced at the unchanged console-error guard on baseline `c477d20aaa16f850b56f18aa878d6b5fb8b4057f` and on the feature. [Baseline log](proofs/base-synthetic-diagnostic.log) · [feature log](proofs/targeted-3-route-context-synthetic-browser-qa.mjs.log). Its guards and factual assertions remain intact. This is recorded separately from completed passing routes and from the final queue status.

Completed diagnostics also exposed environment/test-interaction issues that were corrected without weakening gameplay checks: an unpackaged F1 run used stale publication/cache metadata and was rerun against the version-consistent package; generic roster readiness matched two DOM elements and was scoped to the unique view; cosmetics now opens the actual disclosure to read unchanged notices and scrolls to its actual summary; the new hidden-menu reader opens the actual menu before inspecting it. The completed shell diagnostic and packaged F1 evidence pass. The completed queue found only the obsolete desktop local-menu visibility expectation. Its corrected complete test passed separately; no application code was changed after the full run. The raw full-run FAIL remains in the archived evidence.

Core unit-target applicability remains deferred; import-header limits remain transient under the unchanged save schema; lazy first expansion has functional coverage but no separate latency claim. These are explicit boundaries, not completed gameplay/source certification.

## Final checks, sole test correction, and delivery

| Record | Exact result |
|---|---|
| Single full pre-FF commit | `880a98dbb9dd743f548fc1ed750093912628b570` |
| Sequential queue | All **179** jobs completed: **178 PASS / 1 FAIL** |
| Start / finish UTC | `2026-11-17T23:13:41.1370301Z` / `2026-11-18T01:30:12.5173236Z` |
| Full-run time | **136.52 minutes** (8,190,988 ms) |
| Sole raw failure | `v2/card-gained-rules-browser-qa.mjs:243`, `Preserve the existing hidden desktop local-navigation policy`; actual `flex`, expected `none` |
| Cause | Obsolete UI policy; the accepted roster-card section menu is immediately visible on desktop |
| Correction | Only this test file: require `flex`, visible exact Gained rules tab, click, then the unchanged exact mobile physical-section/heading visibility check |
| Preserved | Every numeric/source/recipient/scope/text/gameplay check and all mobile checks; the independent reverse audit recovers every other original line |
| Separate complete test | **446 PASS / 0 FAIL**, 124.791 s, on `5bc1b038437fcac86966f87371760da94d7e9b38`; no viewport/scenario filtering |
| Run-to-delivery diff | One test file, **4 insertions / 2 deletions**; no application or generated byte changed |
| Final feature SHA / tree | `5bc1b038437fcac86966f87371760da94d7e9b38`, clean |
| Final completion path | **PASS** under the original task's one-test-file exception; **not** a claim of a second fully green pre-FF |
| Generated gate in the full queue | **147/147 byte-identical**, 67 normal producer steps; 1,331,614 ms including queue overhead |
| All-nine gameplay A/B | **199 rosters / 507 frames**, **0 differences** |
| New navigation browser test in full queue | **224/224 PASS**, 18 contexts, nine books, 390/1440 |
| Runtime package | **453 files**, **219** mandatory URLs, revision `a4ab4bdc382e9a00`; normal final-SHA build and `--check` PASS |
| Package bytes | `282918911`; content SHA-256 `2b1e393cf757df0f55b3fb3c1871e6c0ed4f0941a13b57b8e425b33a374f15ec`, identical to measured/pre-FF runtime |
| Feature publication | `codex/roster-navigation-v1` pushed normally at `5bc1b038437fcac86966f87371760da94d7e9b38` |
| Evidence publication | `codex/roster-navigation-evidence`: exactly one documentation/assets commit above `5bc1b038437fcac86966f87371760da94d7e9b38`; never merged; exact remote SHA is reported with delivery `git ls-remote` |
| Protected refs | Source still `c477d20aaa16f850b56f18aa878d6b5fb8b4057f`; source/main/release/Pages not changed by this task |
| Preview | `http://localhost:8765/` and `http://192.168.1.124:8765/`: **200**, exact final SHA in `X-Preview-Package`; PID **41928**, managed session **37596** |
| Preview HTTPS | Existing `https://192.168.1.124:8443/`, unchanged key/certificate and server behavior |
| Owned temporary directory | `E:/Warhammer/qa-tmp/roster-navigation` retained: removal rejected as **blocked by policy**; no deletion executed |

The original task expressly allows showing the one-test-file run-to-final diff and running that test separately instead of a second full pre-FF. The acceptance record verifies the exact original failed leaf, all other 178 passing leaves, the clean original run tree, the single changed test path, and the complete corrected test's PASS/zero failures. It preserves the original run and makes no aggregate-rerun claim.

[Final acceptance](proofs/FINAL_ACCEPTANCE.json) · [original full-run wrapper](proofs/FINAL_PREFLIGHT_RUN.json) · [all 179 job commands, statuses, and times](proofs/pre-ff-final-880a98db/RESULTS.json) · [original console](proofs/pre-ff-console.log) · [corrected test wrapper](proofs/POST_PREFLIGHT_TEST_RUN.json) · [corrected complete test](proofs/post-preff-card-gained-5bc1b038/RESULTS.json) · [single-file patch](proofs/POST_PREFLIGHT_TEST_ONLY.patch) · [single-file diff stat](proofs/POST_PREFLIGHT_TEST_ONLY.stat.txt) · [final clean-tree proof](proofs/FINAL_TREE_VERIFICATION.json).

[Live-preview checks](proofs/PREVIEW_CHECK.json) · [preview process/package](proofs/PREVIEW_STATUS.json) · [protected refs before push](proofs/PROTECTED_REFS_BEFORE_PUSH.txt) · [protected refs after feature push](proofs/PROTECTED_REFS_AFTER_FEATURE_PUSH.txt) · [cleanup outcome](proofs/CLEANUP_STATUS.json).

The review archive is `docs/reviews/roster-navigation-v1/`: this report, `GALLERY.html`, images/index, equipment inventory, full approved test diff/audit, and selected proofs including every final queue log. Archive-local `.gitattributes` preserves the exact evidence bytes without Git newline conversion; `ARCHIVE_MANIFEST.json` records their sizes and SHA-256 values. No source repository clone, accepted RAW/candidate capture, private contact detail, or runtime package is included in the archive. The published site package remains the explicit runtime-only package.

No protected-source fast-forward, release mutation, or Pages deployment was performed. Independent review and the owner's separate exact-SHA authorization remain required before any protected-branch update.
