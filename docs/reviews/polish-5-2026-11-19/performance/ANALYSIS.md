# DA performance profile analysis — baseline 4060074a

Read-only analysis of the completed sequential run. No browser, test, build or production edit was performed by this reviewer.

## Result

All **54 samples** completed: 3 existing DA, 3 SM, 3 DG fixture inputs × 3 fresh repeats × 2 widths. Imports reached the accepted READY status; opening the requested card preserved the complete native roster state. No console errors were recorded.

| Width | Slot | DA median ms | SM median ms | DG median ms | DA / SM | Exact <= 1.5 |
|---:|---:|---:|---:|---:|---:|---|
| 390 | 1 | 45.200 | 55.200 | 51.100 | 0.818841 | PASS |
| 390 | 2 | 51.400 | 41.900 | 39.600 | 1.226730 | PASS |
| 390 | 3 | 64.900 | 42.800 | 51.500 | 1.516355 | FAIL |
| 1440 | 1 | 47.200 | 53.900 | 52.100 | 0.875696 | PASS |
| 1440 | 2 | 55.100 | 43.300 | 41.300 | 1.272517 | PASS |
| 1440 | 3 | 65.000 | 45.200 | 52.800 | 1.438053 | PASS |

Median of the three fixture medians:
- 390 px: DA 51.400 ms / SM 42.800 ms / DG 51.100 ms; DA:SM 1.200935, within 1.5.
- 1440 px: DA 55.100 ms / SM 45.200 ms / DG 52.100 ms; DA:SM 1.219027, within 1.5.

Slowest untraced sample: **68.100 ms**, dark-angels, 1440 px, input `sweep2-dark-angels-c99e4df19d6ce4d2`. Separate slowest-DA trace replay: **68.600 ms**.

**Do not report an unqualified threshold PASS.** Slot 3 at 390 px is 1.516355 × SM: DA 64.9 ms versus an exact 1.5 × 42.8 = 64.2 ms limit. The excess is 0.7 ms, but the owner specified an exact ratio and this run retains that FAIL. The group aggregates and the other five comparisons pass; neither overrides this individual result. The sample size is three; there is no statistical significance claim or threshold tolerance added.

The selected inputs have different compositions and first-card sizes across books. Exact source paths/text hashes and per-row unit/DOM/profile counts are retained; this is a bounded representative workload comparison, not an equal-complexity faction benchmark.

## What the trace establishes

The CPU profile spans 275.981 ms, but the actual card-opening interval is 68.600 ms. The remainder includes CDP/setup and Playwright actionability before the actual click, plus post-ready activity. `PROFILE_CLICK_INTERVAL.json` clips CPU sample weights and main-thread events to the exact `polish5-card-click-before` / `polish5-card-ready` markers. Do not attribute the full 182 ms `(program)` frame to the 68.6 ms card event.

| Measured item within the clicked interval | Time ms | Interpretation |
|---|---:|---|
| Main click EventDispatch | 62.749 | Contains the synchronous route/render work; overlaps all child work below. |
| Native `projectEffectiveInstance` | 16.765 inclusive / 4.668 self | Proven materialization/provenance cost; repeated calls are a possible general optimization target. |
| `renderDatasheet` | 32.891 inclusive / 1.774 self | Includes projections, factual rendering and term matching; not additional independent time. |
| `keepRowVisible` / `getBoundingClientRect` | 18.011 sampled self in native geometry | Trace shows an 18.287 ms Layout in this call chain. |
| `rule-term-links.mjs:28` `match` | 3.067 self | Glossary matching contributes a few milliseconds. |
| Minor/Major GC within measured interval | 0.000 | The ~4.4 ms MinorGC in the full trace occurs after the ready marker. It cannot explain this card interval or the old multi-second observation. |

The geometry sample ancestry is `navigation-v1-controller.mjs:238 keepRowVisible` -> `:224 activate` -> `navigation-v1.mjs:173 refresh` -> `runtime.mjs:504 renderNavigation` -> `runtime.mjs:564 renderInstance`. DOM writes before the geometry read force normal layout. This is measurable work, but 18 ms in one healthy 68 ms navigation is not evidence of the old 7–11 second stall.

`projectEffectiveInstance` currently creates an entire-book records map and scans model/source entities. The same native projection is requested from several shared render/source-link paths. Its 16.8 ms inclusive cost confirms that work exists; it does **not** prove that it caused the previous DA outliers or that changing cache lifetimes would be risk-free.

## Attribution boundary and recommendation

The earlier audit recorded five DA card outliers (7.34–11.03 s) and two import/replacement timeouts. No original failing Performance trace exists. This fresh, isolated, real-UI-click run did not reproduce a multi-second card stall. Its precise browser event timing also excludes observer transport/actionability overhead; the old end-to-end observer times are not directly interchangeable with this metric. Do not describe the old cause as load, garbage collection, or fixed by this task.

Fresh UI imports passed here; replacement-after-guide timing is not part of this recipe. The preceding audit had 12 focused import/replacement replays, which passed, but those remain evidence for their own run and do not provide the missing original causal trace.

**Recommendation: no production performance patch in this task.** A narrow safe fix for the old stalls is not established, and shaving a sub-millisecond ratio excess by speculative memoization or navigation/layout changes would optimize toward a threshold without diagnosing the blocker. Stop the performance-fix portion (point 3) with this measured profile and explicit per-fixture FAIL; continue the authorized popup fixes and full required verification. A later targeted performance task can investigate render-scoped immutable projection reuse and write/read layout scheduling with its own semantic and navigation controls.

## Evidence

- `RESULTS.json`: every original sample, exact inputs, dimensions, browser-only and automation timings, ratios and trace replay metadata.
- `INPUT_MANIFEST.json`: frozen source/text hashes, no fabricated rosters.
- `slowest-card.trace.json`: DevTools timeline; `slowest-card.cpuprofile`: CPU sample tree.
- `PROFILE_SUMMARY.json`: raw full-capture sampled totals.
- `PROFILE_CLICK_INTERVAL.json`: bounded click-window classification.

No test expectation, generated output, book rule, effect, CP value or saved roster was changed by this analysis.
