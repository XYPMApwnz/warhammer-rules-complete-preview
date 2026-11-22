# Cold Core popup verification — 22 November 2026

**Result: no branch regression. The owner-authorized second full pre-FF subsequently passed 209/209 in 78.73 minutes on unchanged `e08ec20df980d4e6700c32b65069de983b250e03`. The original Core test passed without a patch or timeout change. No third full run occurred.**

This targets the failed `assertCorePopup` section-link scenario. The original pre-FF Core harness serves source with service workers blocked; this diagnostic intentionally uses immutable published packages with workers enabled to exercise the owner-requested background-download hypothesis. It does not claim to rerun the original whole multi-chapter Core test ten times. The same accepted fight-phase deep route and first on-page Ctrl-click are used, without the unrelated all-chapter/reload warmup that would finish background downloading first. The original popup predicate, exact deep equality and 15-second timeout remain unchanged; only the expected entry pathname gains the actual Pages prefix. The repository test file is untouched.

Each width has ten fresh Chromium processes/contexts per side: 40 observations in total. The original viewport-only desktop context at 1440 and 390 px is retained, not Pixel 7 emulation. Base/head order alternates by pair. HTTPS/H2 and gzip level 6 match the original local audit; Fast 4G is one shared 9 Mbit/s / 170 ms link cap covering page and service-worker traffic. Calibration median RTT is 170.8 ms; aggregate page-plus-worker transfer obeyed the shared cap. No CPU slowdown, trace/screencast, forced focus, artificial response hold, or warm navigation is used.

Core is clicked immediately when Home is actionable, without awaiting worker status queries. Offline status is captured passively at the actual clicks. Base necessarily finishes its 221-URL offline installation before showing Home; it therefore cannot have background installation at that point. This is the architectural control, not a faked background scenario. The branch had background preparation in all 20 Home→Core clicks and all 20 section-popup clicks. The same current-revision controller was verified after every observation.

| Width | Side | Successes | Median click→window s | Maximum s | Background at Core / popup click |
| ---: | --- | ---: | ---: | ---: | --- |
| 1440 | base | 10/10 | 5.576 | 5.657 | 0/10 · 0/10 |
| 1440 | head | 10/10 | 2.805 | 2.827 | 10/10 · 10/10 |
| 390 | base | 10/10 | 5.388 | 5.531 | 0/10 · 0/10 |
| 390 | head | 10/10 | 2.832 | 2.952 | 10/10 · 10/10 |

Time starts at the actual DOM Ctrl-click and ends when the exact popup wait predicate resolves; page-event→predicate time is retained separately. All 40 observations pass the exact assertions. The decision uses unrounded values separately by width: no extra failures, no larger median and no larger maximum on the branch. No tolerance was invented and widths are not pooled.

One initial series was interrupted by an unhandled Node socket `ECONNRESET` during browser transition: base had passed; the candidate browser closed before creating a page, with no application URL or request. The original incomplete receipts are retained in [FIRST_INCOMPLETE_HARNESS_ATTEMPT.json](FIRST_INCOMPLETE_HARNESS_ATTEMPT.json). The external v2 transport only adds socket-error recording/handling to prevent a teardown error from terminating an unrelated next browser. Shaping, bytes, application code and popup assertions are unchanged. A new complete 40-observation series was collected; no application failure was resampled.

The original full pre-FF remains 208 PASS / 1 Core timeout, with its original stack and receipts intact. This targeted check does not explain that earlier timeout; it establishes that the branch is not worse under the owner-requested cold/active-worker/Fast-4G condition. The next action was the explicitly authorized second full run, not a test or timeout patch.

- [Full observations](RESULTS.json) · [Summary CSV](SUMMARY.csv) · [Authorization and independent gate](AUTHORIZATION_AND_GATE.json).
- [Exact original assertion function](ASSERT_CORE_POPUP_ORIGINAL.txt) · [Executable recipe](../RECIPES/cold-core-popup-fast4g-v2.mjs) · [Transport lifecycle change](../RECIPES/cold-core-transport.mjs).

The completed transport recorded 41 client-socket close/reset events across 41 browser profiles including calibration (39 ECONNABORTED, 2 ECONNRESET), zero origin-socket errors and zero application page exceptions. These lifecycle events are recorded rather than allowed to terminate the next unrelated browser. All 40 profile controllers matched their exact publication revision.
