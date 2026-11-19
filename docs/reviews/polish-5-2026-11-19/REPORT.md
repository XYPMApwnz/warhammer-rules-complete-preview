# Polish 5 — rule popups and bounded DA diagnosis

Phone preview address verified before changes: **http://192.168.1.130:8765/**. [Offline before/after gallery](GALLERY.html). Keep the HTML and images directory together.

Base: `4060074ae0c7888571367f99f7cb9cc375c167ba`. Feature: **`635c503b4bb45d13e3c2cc92c439b86a75e1c954`**, branch `codex/polish-5-v1`. Source/main/release/Pages were not moved; no fast-forward or force push. This report distinguishes completed popup fixes from the stopped performance portion.

## Scope and outcome

- B1–B4: common presentation fix, no name/faction branches. A uniquely addressable rule still opens one exact body. An unresolved or ambiguous name/path opens the complete explicitly selected canonical section; no sibling is guessed and the generic instruction is removed from both runtime branches.
- B5: weapon windows now show **Ranged weapon / Melee weapon**, from the accepted exact mode. Ordinary weapon rows and numeric fields are unchanged.
- **Point 3 stops without a performance patch.** The old multi-second DA stalls were not reproduced or diagnosed; one exact individual DA/SM comparison is 1.516355, above 1.5. Both group aggregates pass, but that does not override the individual FAIL. The owner explicitly permitted this point to stop while the other work continues.
- No rules text, stratagem wording, effects, CP, book data, official updates, source identities or execution logic changed. **147 generated outputs are byte-identical to base; native A/B 199 rosters / 507 states / nine books has zero differences.**

## 0. Wi-Fi preview diagnosis

| Check | Observed | Action |
|---|---|---|
| Ethernet | Disconnected; no `.124` address | None |
| Wi-Fi | `192.168.1.130`, Private, connected | None |
| Listener | `0.0.0.0:8765` and `0.0.0.0:8443`, original PID 4240 | None before successful pre-ff |
| Firewall | `Warhammer-Preview-Private-8765-8443`, enabled Allow/Inbound/TCP, ports 8765/8443, Private, LocalSubnet | Unchanged |
| Program | `C:\Program Files\nodejs\node.exe` | Unchanged |
| LAN GET from PC | `http://192.168.1.130:8765/`, HTTP 200, base package header matched | Working phone address supplied |

No network category, Public rule, firewall rule, HTTPS certificate or TLS material was changed. The preview may be switched to the feature only after the recorded pre-ff PASS; its final live status is recorded with handoff.

## 1. Exact causes and general correction

`runtime.mjs` asked `focusedRuleField` to resolve a title-only link. Each reported target has three `/blocks/N/text` fields and three false classification markers. Its section title matches none of the option prefixes, so there is no exact fieldPath. Returning null from the focus selector was correct; converting that null into the generic instruction at both runtime rendering branches was the defect.

| Target | Canonical section | Three owned subrule captions |
|---|---|---|
| Mortarion — Lord of the Death Guard | `datasheet-mortarion:section:1` | Diseased Influence; Boon of Death; Inflamed Reprisal |
| Belisarius Cawl — Canticles of the Omnissiah | `datasheet-belisarius-cawl:section:4` | Invocation of Machine Vengeance; Mantra of Discipline; Shroudpsalm (Aura) |
| Thulia Ghuld — Icon of War | `datasheet-thulia-ghuld:section:4` | Fanatical Devotion; Adaptive Tactics; The Fires of Mars |
| Fulgrim — Daemon Primarch of Slaanesh | `datasheet-fulgrim:section:5` | Beguiling Form; Daemonic Speed; Enthralling Hypnosis (Aura) |

The new common `renderSection` shares the same canonical text-field renderer with focused views. It retains every owned body, qualifier, fact ID/value, original entity/context and foreign source attribution once. It omits boolean classification rows and technical labels. Existing focused-selector and focused-renderer contracts remain fail-closed; the explicit runtime fallback supplies the whole section. Generic unclassified source sections use **Datasheet section**, avoiding a claim that composition text is an ability.

Separate introductory/choice text remains with its existing canonical owner and ordinary inline presentation (Mortarion section 3, Cawl section 1, Fulgrim section 2). It is not copied from a sibling or re-owned by matching names. The approved fallback displays the complete selected section, not a fabricated cross-section rule.

The exhaustive census also exposed projected members reusing source-local `/sourceText` paths. A match must now be unique; no first member is selected. A unique canonical path is preferred and preserves previous URLs. A unique projection path is used only when needed. If neither is unique, the complete known section is shown. Seventy-five display/source path collisions (52 Tyranids, 23 EC, primarily composition records) have explicit negative controls, preserving every distinct canonical owner/value.

No body is invented for a bodyless record. The accepted CSM `detachment-pactbound-zealots:rule:muster-selection` has only a display name, is not a named datasheet ability, and keeps its existing owner/presenter path.

### Exhaustive and player-route checks

| Book | Canonical rule/section cards | Body fields | Actual datasheet visits, both widths | Unique clicked named targets, both widths |
|---|---:|---:|---:|---:|
| death-guard | 97 | 127 | 72 | 2 |
| adeptus-mechanicus | 86 | 122 | 68 | 4 |
| chaos-space-marines | 187 | 335 | 108 | 6 |
| emperors-children | 62 | 112 | 46 | 2 |
| tyranids | 132 | 218 | 104 | 0 |
| tau-empire | 119 | 166 | 86 | 0 |
| space-marines | 457 | 457 | 170 | 0 |
| dark-angels | 446 | 446 | 166 | 2 |
| blood-angels | 426 | 426 | 162 | 0 |


- Portable independent source-backed presentation census: **128,013 assertions**, **2012 cards / 2409 canonical body fields**, source payload unchanged. Every uniquely addressable focus is checked exactly; unknown names/paths and colliding member paths must fall back without choosing a sibling.
- Actual browser census: **982 datasheet visits** (491 × two widths). Full inline captions stay noninteractive; visible body fact values are checked against accepted fields. Every unique visible supported named-rule popup link is clicked from its real source card: **16 target/width observations**, zero placeholders/failures.
- Explicit B1–B4 and both weapon types plus placeholder mutation controls bring the new browser suite to **30/30 PASS**, at 390 and 1440.
- Base negative evidence: the new section API/census fails on 4060074a; before browser observations record **12/12 expected failures** for the four placeholder windows and missing weapon captions. They are not reported as feature failures.
- Injecting the removed generic instruction into an open player dialog makes the actual dialog guard fail; it is removed and the clean guard passes. No mutation remains in the source or gallery.

The 253 multi-text source cards include generic sections; they are not claimed as 253 player-visible defects. The browser census counts real links separately from full inline text/nonbuttons. Long windows scroll; gallery pictures show the opening viewport, while source completeness is checked separately.

## 2. Weapon type

The shared `renderWeapon(..., {popup:true})` emits one human caption from exact `mode`: `ranged` becomes **Ranged weapon**, `melee` becomes **Melee weapon**. All **2237 accepted weapon profiles** have one of those modes. No title/range inference, new profile or altered stat/keyword/quantity is introduced. This common branch covers direct reader and reference-presenter weapon windows. Normal rows are untouched. Both modes were clicked, checked and captured on both widths.

## 3. DA measurements — stop without speculative correction

All DA/SM/DG timings and the Performance trace below were measured on the unchanged accepted base preview `4060074a`, not on the feature. No feature performance improvement is claimed. Three existing DA inputs previously implicated in the sweep were paired with three existing SM and three DG inputs. Each was imported through the UI in three fresh profiles at 390 and 1440, interleaved by book: **54 serial samples**, no other QA/browser workload. Exact source aliases, text/file hashes and per-card unit/DOM/profile counts are retained. These are different compositions/card sizes, not equal-complexity faction fixtures.

Readiness is the actual captured Open card click to the matching requested physical card, fonts and two browser frames. Playwright actionability/transport is recorded separately. Import/setup, DOM audit and screenshots are outside this interval. This metric must not be silently equated with the earlier observer's end-to-end times.

| Width | Fixture slot | DA median ms | SM median ms | DG median ms | DA / SM | Exact 1.5 threshold |
|---:|---:|---:|---:|---:|---:|---|
| 390 | 1 | 45.200 | 55.200 | 51.100 | 0.818841 | PASS |
| 390 | 2 | 51.400 | 41.900 | 39.600 | 1.226730 | PASS |
| 390 | 3 | 64.900 | 42.800 | 51.500 | 1.516355 | **FAIL** |
| 1440 | 1 | 47.200 | 53.900 | 52.100 | 0.875696 | PASS |
| 1440 | 2 | 55.100 | 43.300 | 41.300 | 1.272517 | PASS |
| 1440 | 3 | 65.000 | 45.200 | 52.800 | 1.438053 | PASS |


Aggregate median of the three fixture medians: DA/SM **1.200935 at 390**, **1.219027 at 1440**. Slot 3 at 390 remains **FAIL**: 64.9 ms exceeds 1.5 × 42.8 = 64.2 ms by 0.7 ms. No tolerance was added. Sammael's card has 176 DOM nodes, versus 97 for the paired SM card; that workload caveat does not turn FAIL into PASS.

Slowest untraced DA sample: **68.1 ms**. Separate slowest-case Performance/CPU replay: **68.6 ms**. The click handler contains 62.749 ms; native effective projection accounts for 16.765 ms inclusive / 4.668 ms self, and navigation-forced layout contributes 18.287 ms. These overlap and are not additive. GC in the full trace occurs after readiness, not within the clicked interval.

The old 7–11 second stalls and original import/replacement timeout cause are **not proven**. No original failing trace exists; this bounded fresh-profile workload did not reproduce them. Memoization or layout scheduling would be a separate optimization with its own correctness controls. **No performance code was changed. Point 3 is stopped with its exact threshold result and profile.** All 54 UI imports succeeded, saved roster state stayed exactly equal on every card opening, and no console errors were recorded.

[Full analysis](performance/ANALYSIS.md), [all measurements](performance/RESULTS.json), [fixture provenance](performance/INPUT_MANIFEST.json), [Performance trace](performance/slowest-card.trace.json), [CPU profile](performance/slowest-card.cpuprofile), [click-window attribution](performance/PROFILE_CLICK_INTERVAL.json), [CSV](tables/DA_MEDIANS.csv).

## Tests and exact expectation preservation

| File / check | Before | After | Reason / preservation |
|---|---|---|---|
| `tests/helpers/player-dialog-assertions.mjs:11` | Technical labels/IDs/paths and unnamed actions rejected | Same checks plus the exact removed placeholder rejected | Stronger player guard; no former assertion removed. [Full diff](tables/OLD_TEST_HELPER.patch) |
| `rule-popup-qa.mjs` | 37 exact focus/identity/body/source/nonmutation checks | **Unchanged, 37 PASS** | Focus API still returns null for ambiguity; a separate section API supplies runtime fallback. |
| `v2/rule-popups-browser-qa.mjs` | Exact original canonical links, source fields, recipients and bodies across nine books | **Unchanged, 100 PASS** | A targeted run caught an accidental SM canonical-URL change; common code was corrected rather than relaxing its assertion. |
| New `rule-popup-section-qa.mjs` | No exhaustive whole-section/ambiguous-path census | Exact source census and negative controls | All canonical facts and notes retained, no source mutation. [New tests](tables/NEW_TESTS.patch) |
| New `v2/polish-5-browser-qa.mjs` | Four group headings and weapon captions untested | 491 datasheets × two widths; exact dialogs and visible full bodies; real placeholder mutation | Actual links, no source-specific patch. |
| `tools/qa-queue.mjs`, `package.json`, QA matrix | Existing jobs and checks | Two added sequential jobs; `npm run test:polish-5` | No old job or assertion removed. [Integration diff](tables/QA_INTEGRATION.patch) |

There are **no changed old numerical/gameplay/textual expectations**. The existing SM abbreviated-link check initially caught a code regression before pre-ff; after canonical locator preference was repaired it passed unchanged. Earlier external positive attempts remain recorded, not overwritten or counted as final PASS. [Final common source diff](tables/SOURCE.patch).

## Generated, A/B, packaging and pre-ff

- Base-vs-feature byte inventory: **147/147 identical generated files**, including book publication facts, Core, glossary, source registry and bindings. [Byte hashes](checks/GENERATED_BASE_BYTES.json).
- Native A/B: **199 exact fixture rosters / 507 states / nine books, zero differences**. Both sides: 177 READY and 22 NEEDS_BINDINGS cases. [Result](checks/AB_RESULTS.json).
- The [complete 67-step cloned rebuild](checks/GENERATED_REBUILD.json) passed inside pre-ff; all 147 files remained identical.
- Runtime inventory is unchanged: 453 allowed files. Three copied presentation modules changed, plus the two normal package-only revision stamps (`v2/app.html`, cache-revision script). [Exact runtime diff](checks/RUNTIME_DIFF.json).
- **No new startup file**. Precache has **219 unchanged normalized paths**; service-worker bytes and caching policy are identical. The ordinary packager regenerates the cache/integrity revision. [Comparison](checks/PRECACHE_COMPARISON.json).
- The pinned BSData preparation remote was unavailable. The normal preparation command accepted a clean existing local cache at exact `fa30730fca11fbfe87be90684d481d50e0efaf66`, checked its original upstream and all four Git inputs, then created its task-local authenticated checkout. No input was substituted or refreshed.
- Single full `qa:pre-ff`, frozen SHA `635c503b4bb45d13e3c2cc92c439b86a75e1c954`: **PASS — 183 / 183 jobs, 84.18 minutes, one full run.**

The complete generated gate, browser, source, PWA/offline/startup-graph and packaging results are retained in the full queue evidence; publication contains bounded summaries rather than private test captures. No second full pre-ff is authorized or assumed. Feature HEAD must remain the same after the run; no report commit is added to the feature.

## Gallery and publication boundary

[Before/after gallery](GALLERY.html): **24 width/phase slots / 22 unique compressed JPEG assets**, four named sections and ranged/melee weapon captions at 390 and 1440. Identical before images are hash-deduplicated. No rule text or pixels were edited. Local file opening and image decoding were checked at both widths; no external requests, script errors, broken internal anchors or horizontal gallery overflow.

Evidence is a single documentation commit on `codex/polish-5-evidence`, parent base 4060074a, with report, gallery, bounded checks and DA profile. It must not be merged. It does not publish RAW Wahapedia, a release candidate, raw roster exports, browser profiles or the source repository. Feature and evidence pushes are ordinary pushes; source/main/release/Pages stay unchanged.

Temporary directory: `E:/Warhammer/qa-tmp/polish-5`. Final preview SHA/address and cleanup outcome are recorded at handoff. Preview switching is prohibited until successful pre-ff. The performance portion remains explicitly stopped; functional QA PASS must not be described as performance-threshold PASS.

## Final handoff

- Single full pre-ff: **183 PASS / 0 FAIL, 84.18 minutes**. Final feature SHA is exactly the tested SHA; `git diff --stat` between them is empty. [Every job](checks/PRE_FF_JOBS.json), [timing CSV](tables/PRE_FF_TIMINGS.csv).
- Live preview switched only after PASS: **http://192.168.1.130:8765/** (PC: http://localhost:8765/), PID **3312**, feature **635c503b**. Both addresses return 200 and the correct package header. The three changed served modules match the tested file hashes. [Live checks](checks/LIVE_PREVIEW_CHECK.json).
- Served cache revision: `632b5368286ec088`; content SHA256: `bb6c69ae63b745beb3b343fc5472e8c36ad63e59f44b4cfca335235956ceda52`. The preview package is outside task cleanup under `E:/Warhammer/qa-tmp/preview-v1/package-polish-5-635c503b`. TLS and firewall unchanged.
- Cleanup preflight found no active task processes or reparse entries. Automatic approval review rejected recursive deletion of `E:/Warhammer/qa-tmp/polish-5` with **blocked by policy**. The temporary folder remains; no bypass was attempted. The running preview and its TLS/package files were protected.
- B1–B5 are ready for review. **Performance point 3 remains stopped**, with the exact 1.516355 per-fixture FAIL and no speculative performance change. Functional suite PASS does not waive it.
