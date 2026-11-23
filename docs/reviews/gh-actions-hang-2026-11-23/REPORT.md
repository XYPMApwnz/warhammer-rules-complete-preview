# GitHub pre-FF hang investigation

STOP FOR REVIEW: verification failure. Full verification results are recorded below.

Base: `6156836b7841d2c4f4c429834013598b3484058e`. Feature: `codex/gh-actions-hang-v1`. No protected branch, release, Pages deployment or default-branch setting is changed by this task.

## What the cancelled run proves

Run [45125199666](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/actions/runs/45125199666) persisted 201 PASS, 3 FAIL and no result for the final 9 jobs. The queue step lasted 222 min 28 s, while its last saved elapsed counter was 90 min 11.329 s. Job 204 is the last recorded PASS. The old report did not retain START or active-phase metadata: job 205 is the next planned job, not a retrospectively proven started job. Child execution, inherited streams, post-job cleanup and wrapper delay cannot be distinguished from that artefact alone. See [the twelve-job analysis](CANCELLED_ANALYSIS.md) and [the exact CSV](CANCELLED_12_JOBS.csv).

## Proven Linux failures and repairs

| Job | Evidence | Repair | Assertions |
|---|---|---|---|
| 2, `tests/qa-temp-qa.mjs` | Focused run 45180625110 reproduced `UNIX_SOCKET_PATH_TOO_LONG`, with a 97-byte child temporary path. | Explicit short, project-owned Linux IPC scratch; Chromium alone receives it through its child temporary environment. Playwright profiles, downloads and traces keep their existing paths. | Original fourteen controls unchanged; a new Linux control invokes that exact test and checks IPC cleanup. |
| 151, `tests/book-update-command-qa.mjs` | POSIX dependency symlinks are not excluded by the directory-only `node_modules/` pattern. The work-state fingerprint reader attempts to read the symlinked directory as a file. | Ignore the dependency path with `node_modules`, covering both directories and POSIX symlinks. | Existing rejection and work-state assertions unchanged; new directory/symlink/unrelated-input and old-pattern mutation controls. |
| 165, generated rebuild | Focused run 45179097911 identified the Core corpus producer, `ownedHtml` strings and derived hashes. Three exact outputs differed; the corpus was 1,226 bytes shorter on Linux. | Authenticated capture line-ending style is preserved through parsing, and only an invalid empty quote-name attribute is removed. Deterministic fragment serialization preserves the accepted representation. | All 294 fragments match the previous Windows representation. Three exact corpus outputs and ten controls pass on both installed Windows lxml versions. Linux/full verification is recorded below. |

No source capture, source-file checksum, historical expectation, game value or generated output is refreshed to obtain a PASS. The Core formatter has no additional implementation checksum pin requiring an expectation update.

The Core difference has two independently isolated causes. The newer parser normalizes physical CRLF; the accepted owned fragments contain 645 CR characters, corresponding to 1,290 escaped JSON bytes. It also retains an empty attribute whose name consists solely of a quote, produced by malformed source markup that the older parser discards. Adding that one syntactic attribute reproduces all eight remaining Linux fragment hashes exactly. Its three quotes require additional JSON escaping: eight affected fragments add 64 bytes. Therefore `-1290 + 64 = -1226`, exactly the original corpus size difference. Canonical parser input plus restoration of the authenticated physical line-ending style removes the first dependency; generic removal of only that empty invalid attribute removes the second. A nonempty variant, ambiguous physical line endings or newline character references in a CRLF capture fail closed. All legitimate attributes remain intact. The captured files are authenticated before this in-memory projection and never rewritten.

## Existing test expectations

No existing expected value, identity, recipient, text, source checksum, comparison precision or test timeout is relaxed.

| Existing check | Before | After | Preservation proof |
|---|---|---|---|
| `v2/lazy-glossary-browser-qa.mjs` | A readiness deadline checked only inside rAF; unbounded evaluation/teardown waits. | The same ten assertions and single browser-side loop; independent existing ten-second readiness deadline, bounded host phases and diagnostics. | AST assertion comparison; exact baseline callback remains pending with paused rAF, corrected callback rejects at 10.033 s. |
| `tests/qa-temp-qa.mjs` | Fourteen exact lifecycle and profile-cleanup assertions. | Source and assertions unchanged. | Windows fourteen controls PASS; mandatory Linux preparation invokes the same file and checks the short IPC root is clean. |
| `tests/book-update-command-qa.mjs` | Exact native work-state and expected rejection checks. | Source and assertions unchanged. | Focused Linux job 151 PASS, 65.727 s; dependency-path regression and old-ignore-pattern mutation. |
| `books/shared/tools/check-generated-rebuild.mjs` | Exact expected bytes for every declared output. | Comparator and expectations unchanged. | Ten source-format controls, exact three Core outputs on both local parser versions; full native 148-file proof below. |
| `tests/qa-pre-ff-ci-qa.mjs` | Forty-five setup/privacy/identity controls. | Source and assertions unchanged. | All forty-five controls PASS; additional telemetry controls are separate. |

New controls cover reviewed-time-table tampering, full-plan validation before filtering, normal and failed leaf exits, bounded hangs and continuation, inherited streams, detached/double-fork descendants, exact argument/environment transmission, PID reuse, malformed telemetry, synthetic private-text canaries, source-format drift and IPC ownership. Linux-specific process controls actually execute during workflow preparation; Windows records three Linux-only skips, and the mandatory Linux preparation step executes those controls rather than inventing a local PASS.

## Hang mechanism and containment

The lazy-glossary test awaited animation frames inside `page.evaluate`. Its ten-second readiness check ran only from an animation-frame callback, and Playwright's locator timeout does not impose a deadline on an arbitrary evaluation promise. The exact baseline callback remained pending after 11.007 seconds when animation frames were suppressed; the corrected callback rejected after 10.033 seconds through the existing readiness budget. This proves the mechanism, not the unknown historical run phase.

The same ten assertion expressions remain exact after removing only timing wrappers in the AST comparison. The original single-evaluation loop, geometry checks, double-animation-frame synchronization, link identities, scope and ownership are preserved. Node-side phase deadlines, an independent readiness timer, bounded phase history and fixed-schema browser-state diagnostics prevent an infinite wait. No retries or increased existing timeout are introduced.

A rejected experiment with per-boundary host round trips took 367.956 seconds and is not shipped. The final implementation took 322.773 seconds locally; the exact baseline under the same standalone environment took 325.668 seconds (-0.889%). The historical full-queue value, 110.826 seconds, was not reproduced by the standalone baseline and is not presented as a comparable instrumentation measurement. Focused Linux job 205 passed in 275.178 seconds.

## Sequential CI execution policy

The full plan still contains the same 213 ordered job identities, commands and arguments. The optional diagnostic filter selects one full-plan index only after validating the entire plan and policy. Diagnostic artefacts are explicitly labelled as single-job reports and cannot imply full verification.

The committed baseline is the last accepted Windows run on 6156836b. Every deadline is exactly `max(3 * lastPcElapsedMs, 300000)`; the minimum is 300,000 ms, maximum 2,013,102 ms, and job 205 receives 332,478 ms. A pinned digest of the reviewed identity/timing table rejects changing both a baseline time and its calculated deadline together.

A timeout remains a failed job. A Linux standard-library Python subreaper retains orphan ownership even after `setsid` or double-fork. It signals and reaps descendants, and the queue advances only after an `ECHILD` acknowledgement, closed streams and confirmed ownership cleanup. PID identities are frozen and fallback signals use PID descriptors; uncertainty stops the queue instead of risking an unrelated process. Original arguments, environment and private child output are preserved through separate private descriptors. Every CI queue runs sequentially on one runner; there is no multiple-runner distribution or sharding.

Public progress contains only canonical job IDs, elapsed seconds and results. The atomic current-job marker distinguishes spawn, leaf exit, stream closure, cleanup and completion. Raw output remains runner-local. Fixed-schema reporting exposes classes, bounded fixed messages and validated code locations; generated failures additionally expose allowlisted filenames, hashes, sizes, JSON pointers and types, never values or captured HTML. The artefact remains exactly `REPORT.md`, `RESULTS.json`, `JOB_PLAN.json` with thirty-day retention and `always()` upload.

The public progress proof from focused run 45184256819 is:

```text
START v2/lazy-glossary-browser-qa.mjs 0.000
END v2/lazy-glossary-browser-qa.mjs 275.179 PASS
```

## Preparation caches

Only rebuildable npm downloads and locked Playwright browser binaries are cached. The browser key includes OS, architecture and the exact package-lock hash, with no broad fallback key. Locked npm installation and Chromium/system-dependency installation still execute. Neither source captures, BSData, secrets, profiles, node_modules nor test results are cached. The configuration uses the official [setup-node cache inputs](https://github.com/actions/setup-node/blob/v7/action.yml) and [cache action](https://github.com/actions/cache/tree/v5).

The private BSData mirror secret remains confined to its original preparation step. No raw BSData, Wahapedia capture, private key or owner email is included in public logs or evidence.

## Focused probes and limits

Probe 45178344932 stopped in preparation because the new browser helper control ran from the orchestration checkout without installed npm dependencies; its path was corrected before subsequent probes. Probe 45184252000 never started a job: GitHub replaced a pending same-ref workflow while diagnostic runs were submitted together. It is a queue-management cancellation, not a flaky test retry. Subsequent diagnostic dispatches are submitted only after the current running/pending state is known. None of these probes is counted as the single final full workflow.

The original cancelled run's exact active phase remains unprovable. New markers and public START/END lines remove that evidence gap for future runs. No claim is made that all historical delay is attributable to the reproduced animation-frame mechanism.

## Final verification

**STOP FOR REVIEW: verification failure.** Code SHA: `b06e22f35bf16bad913cf0dd4c74e3afab08f55c`. Feature: `codex/gh-actions-hang-v1`. External Claude/owner review is pending; no FF or release is performed.

| Run | PASS | FAIL | Missing | Queue time | Other timing |
|---|---:|---:|---:|---:|---|
| Last accepted PC baseline 6156836b | 213 | 0 | 0 | 81.913 min | Reviewed timeout reference |
| One current PC run b06e22f3 | 213 | 0 | 0 | 94.239 min | Command wall: 94.243 min |
| One full GitHub run b06e22f3 | 212 | 1 | 0 | 130.764 min | Workflow wall incl. setup: 134.717 min; failure |

[Full workflow](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/actions/runs/45201837522) · [safe report artifact](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/actions/runs/45201837522/artifacts/14842238939) (30-day retention). The same 213 job identities, commands, fixture arguments and execution order match the baseline, Windows and Linux exactly. `TIMINGS_ALL_213.csv` retains every timing, status and fixed deadline.

Cross-platform result differences: 1. No flaky test or full queue is silently retried. Focused probes were diagnostic runs with a nonempty job filter; exactly one final full workflow and one current local full queue were run.

### Ten longest GitHub jobs

| Index | Job and fixture arguments | PC baseline 615 (s) | PC b06 (s) | GitHub b06 (s) | GH / PC |
|---:|---|---:|---:|---:|---:|
| 165 | `books/shared/tools/check-generated-rebuild.mjs`  | 671.034 | 683.609 | 904.827 | 1.324 |
| 207 | `v2/dg-am-recipient-enrollment-browser-qa.mjs` --fixtures=v2/fixtures/csm-tau-recipient-gaps-v1-browser.json | 184.033 | 185.764 | 361.065 | 1.944 |
| 179 | `v2/attached-rule-text-browser-qa.mjs`  | 188.714 | 193.598 | 355.482 | 1.836 |
| 200 | `v2/roster-navigation-browser-qa.mjs`  | 200.577 | 200.751 | 320.675 | 1.597 |
| 206 | `v2/dg-am-recipient-enrollment-browser-qa.mjs` --fixtures=v2/fixtures/sm-da-recipient-gaps-v1-browser.json | 154.349 | 155.169 | 303.883 | 1.958 |
| 96 | `books/tau-empire/v2/roster-import-qa.mjs`  | 176.030 | 252.375 | 292.313 | 1.158 |
| 66 | `books/dark-angels/v2/roster-import-qa.mjs`  | 177.114 | 235.129 | 267.134 | 1.136 |
| 198 | `v2/rule-popups-browser-qa.mjs`  | 107.242 | 107.624 | 258.913 | 2.406 |
| 87 | `books/space-marines/v2/roster-import-qa.mjs`  | 119.032 | 174.646 | 214.220 | 1.227 |
| 195 | `tests/browser/offline-army-book.mjs`  | 112.997 | 112.507 | 199.561 | 1.774 |

The original cancelled result was incomplete and cannot be treated as an equivalent speed benchmark. The current full Windows/Linux comparison has identical coverage. Current PC job205 takes 111.414 s versus the accepted full-queue baseline110.826 s; the separate same-environment standalone controls are documented above.

### Byte and scope verification

The native generated comparator passes on both platforms: 148 output files, 68 producer steps, zero differing rebuilt bytes. Every tracked output also retains its baseline blob identity. The package built inside the Windows queue retains content SHA256 `2b3643a912a65dcdf285d5a8de5647d8c0bf2f156f39d1db920f4d108cf4f1c0`, matching the accepted reviewed release content. No runtime source, game data, capture, existing test expectation or Pages workflow is changed.

Local-only raw logs, browser screenshots/profiles and private transport inputs remain outside GitHub evidence. They are retained under `E:/Warhammer/qa-tmp/gh-actions-hang` for review and the active worktree's prepared dependency link. Public evidence is metadata-only. Source/main/release/Pages/default are not advanced by this task.

Failed jobs:

- 205. `v2/lazy-glossary-browser-qa.mjs`: PC PASS; GitHub FAIL.

## Remaining blocker: job 205 is now bounded, not resolved

The final full GitHub run is **212 PASS / 1 FAIL / 0 missing**, not 213/213. It is not READY for FF. The only failed job is `v2/lazy-glossary-browser-qa.mjs`; Windows passes that same job in111.414 s. No retry, second full workflow or additional local full run is started.

| Observation | Final Linux evidence |
|---|---|
| Whole job | FAIL after77.767 s; original process exit1 |
| Current book / viewport | Chaos Space Marines /390 px |
| Last successful phase | Screenshot,127 ms, after geometry35 ms and frame synchronization29 ms |
| Failing phase | `boundary-sweep`, Node-side phase deadline after30.002 s |
| Follow-up renderer probe | No response within2.002 s; page was not closed; ready/visibility state unavailable |
| Cleanup | Context6 ms, browser53 ms, server0 ms; supervisor confirms teardown and reaps6 descendants |
| Queue continuation | Every remaining job206–213 PASS; all213 results persisted |

The evidence now identifies the active operation, which the old cancelled artefact could not. It **does not prove why the renderer stopped responding**: sustained synchronous work, a stalled renderer, or the new aggregate30-second sweep deadline being too restrictive are still distinguishable hypotheses. The existing per-boundary10-second timer cannot fire while the renderer event loop is blocked. A two-second responsiveness probe is evidence of a missed response, not a CPU profile or proof of an infinite loop. The earlier focused Linux PASS at275.178 s does not cancel this final FAIL.

Proposed next diagnostic, **not applied or run**: retain the exact frozen assertions and job budget; collect bounded CDP/CPU and boundary-ordinal heartbeat metadata on a single-job CI run205, then compare where time is spent. First determine whether the aggregate guard is interrupting valid work or containing a real stall. Do not increase old readiness timeouts, add retries, or claim a PASS from an isolated rerun. Any change requiring an expectation decision must be reviewed before implementation.

The three original Linux failures are repaired in this full run: jobs2,151 and165 PASS. The native148-file byte rebuild passes on Linux and Windows. The lifecycle guard contains the remaining failure and the queue finishes, but the requested213/213 GitHub target is **not achieved**. `FINAL_FAILED_JOB.json` records the exact public failure metadata; `FINAL_PUBLIC_PROGRESS.json` verifies all213 START/END pairs without test output.
