# Release candidate v4 — 22 November 2026

**READY FOR CANDIDATE REVIEW — NOT RELEASED.** Source/release/main/Pages and the existing preview were not changed. The candidate and evidence branches are review-only. Release requires separate exact-SHA owner authorization after Claude PASS and owner acceptance.

## Commit identity

| Item | Exact value |
| --- | --- |
| Reviewed source | `9c18451452a478be2509314b6b80224313506ec9` |
| Candidate | `818d3b0c34503a166b58b21810666feafe858bc5` |
| Candidate/source tree | `01c7af3af3cb9f8d19d0cef14ddf8aededcdd09c` |
| Only parent/current live release | `e3db1b345eca989436eea7af758900eee7795203` |
| Review branch | `codex/release-candidate-818d3b0c` |
| Evidence branch | `codex/release-candidate-evidence-v4` — one documentation/evidence commit, never merge |

Created from a clean checkout with `git commit-tree 01c7af3af3cb9f8d19d0cef14ddf8aededcdd09c -p e3db1b345eca989436eea7af758900eee7795203 -m "Release candidate: Unified V2 from reviewed source 9c184514"`, using the public automation identity. The new branch was proved absent before its ordinary push. No force, merge commit, release push or workflow dispatch occurred. Source/candidate working bytes were clean before and after packaging/browser checks; temporary checkouts were then removed. [Commit receipt](CANDIDATE.json), [final proof](FINAL_VERIFICATION.json).

## Package

The three normal commands passed, sequentially, from the clean exact candidate checkout: build into a new directory, `--check`, and `pages-runtime-package-qa.mjs` (**15/15**). [Commands](PACKAGE_COMMANDS.json), [QA](PACKAGE_QA.json).

| Metric | Value |
| --- | ---: |
| Runtime inventory | 456 files |
| Physical publication including manifest | 457 files |
| Runtime bytes | 282,879,565 |
| Manifest bytes | 308,315 |
| Total on disk | 283,187,880 bytes |
| Aggregate content SHA256 | `f975aa7a6c68073dd86c46b512e9cc1b8664209abce937fad128e91616095af5` |
| Manifest-file SHA256 | `0a4b26fd2f8f370ab954d06d5914bc27cba02235ecf820bec77bdd69e278295c` |
| Cache revision | `28acb87c11537a8b` |
| Full precache | 221 URLs / 5,185,239 raw bytes including aliases |
| Unique full precache | 219 bodies / 5,147,054 bytes |
| Startup core | 7 keys / 5 bodies / 45,178 unique bytes |

The entire candidate manifest is byte-identical to the accepted 211/211 source publication. The candidate and both historical package inputs additionally passed full per-file SHA256/size validation against their frozen manifests. No package bodies were edited for browser tests. [Package metrics](PACKAGE_METRICS.json), [manifest](PAGES_RUNTIME_MANIFEST.json), [all input-body integrity](PACKAGE_INPUT_INTEGRITY.json).

## Browser — exact built package, Chromium at 390 and 1440

Each final width passed 13 steps on a fresh isolated persistent profile, followed by a fresh browser process using that profile offline:

- Cold first Home, with one origin-wide configured Fast 4G cap (9 Mbps / 170 ms) only for the functional indicator scenario: actual visible `Preparing offline access…` then `Ready for offline use`. This is not a calibrated load benchmark.
- Actual current worker/revision and SHA256/size verification of all 221 precache keys before disconnecting.
- No book payload had been cached. Offline, each of nine untouched books showed exactly `This Army Book isn't saved for offline use yet. Open it once while online, then it will work offline.` and a working `Back to Home` action.
- Back online, all nine native libraries opened, with rendered card counts equal to their native payload group totals.
- The unchanged authentic owner DG v37.25 export passed its fixture SHA, imported READY with eight units, and was saved through the real UI. Raw export/storage contents were not published.
- After Ready, the browser process was closed and reopened offline: Home, all nine warmed books and saved DG opened. All origin localStorage bytes and the native DG snapshot were identical.

Final result: **2/2 widths, 26/26 steps PASS**, no page exceptions, no unexpected console/network failures. Intentional unseen-offline checks retain 27 console events per width (18 out-of-scope favicon failures, nine fail-closed source-catalog 503s). Explicit-navigation cancellations of those failed requests are separately retained; no arbitrary timing window is used. [Final browser receipt](browser-final/RESULTS.json), [self-contained gallery](GALLERY.html).

The initial functional smoke also passed both widths, but only its persistent profiles were explicitly on E; transient Playwright artifacts inherited system TEMP. That PASS/recipe is retained, and the final smoke repeats the same functional assertions with TMP/TEMP/TMPDIR all under the task-owned E directory plus stricter passive diagnostics. No application/package change or pre-FF rerun was involved. [Initial receipt](browser/RESULTS.json), [repeat scope](BROWSER_REPEAT_SCOPE.json).

## Historical update paths

Both actual historical inputs were served on isolated loopback origins. Each scenario kept the same origin/profile while switching the serving directory to the exact candidate package. Working screens retained their old native document and unfinished draft with a manual banner; a separate Loading document applied the new version automatically. HTML expectation and active worker revision matched. Saved DG/SM native rosters were readable online and offline without reimport, and all localStorage keys were byte-identical.

| Old input | Width | New Loading to working screen | Exact saved localStorage | Offline DG/SM |
| --- | ---: | ---: | --- | --- |
| live-e3 | 390 | 1.445 s | 31508 bytes, identical | PASS |
| live-e3 | 1440 | 1.450 s | 31508 bytes, identical | PASS |
| old-1fd | 390 | 1.294 s | 18915 bytes, identical | PASS |
| old-1fd | 1440 | 1.328 s | 18915 bytes, identical | PASS |

Times are local functional observations, not live mobile-network benchmarks. Current e3 uses the authentic DG v37.25 export (eight DG units) and authentic SM v37.3 export (three SM units). Historical 1fd cannot accept the later authentic DG v37.25/v37.15 plain exports; both rejections are preserved, then the exact previously accepted `DERIVED_NOT_REAL_EXPORT` dg-short-derived-labelled fixture (two DG units) is used, SHA256 `ab88387de19a9020f96668c16198cb5ec87ab4c6c35670d8075aac8964300b1f`. No export was invented or transformed. SM remains the authentic stored export on both sides.

Both widths on both sides have zero page exceptions and zero unexpected errors. The two expected console messages per historical width are exact `cache-revision.js` network-first freshness probes during intentional offline operation. Navigation cancellations are retained separately. [Current-live update](update-path/live-e3/REPORT.json), [old-site update](update-path/old-1fd/REPORT.json). All 21 old recipe assertions are exact ordered matches; the external recipe adaptation adds three diagnostic guards and no repository test changes. [Audit](HISTORICAL_RECIPE_AUDIT.json).

## QA boundary and retained limitations

No `qa:pre-ff` was run for this candidate. The accepted source remains **211/211 PASS** at 9c184514; identical tree/working facts and byte-identical publication preserve that baseline. [Accepted source QA](ACCEPTED_SOURCE_QA.json). No source code, game data, tests, effects or CP were changed by candidate preparation.

Offline completeness still means the shell/code/small resources are ready; large untouched books, glossary payloads and unit artwork remain lazy. A book must be opened online before its data works offline. The candidate now explains this instead of a generic book error. Core's earlier intermittent timeout cause is still undetermined; source 9c184514 adds failure-only diagnostics while preserving its assertions/timeout. Browser checks here are Chromium viewports, not physical-device or Safari engine certification.

## Previous deployment and rollback

Current release is still e3db1b34. Its successful Pages run is **44863910786**, deployment **7958227298**, successful at 2026-11-21T04:01:49Z. The live HTTPS manifest remains HTTP 200 with aggregate `0fab482c0fa7f4132c9bbb60646e880afca25f2b5823ab7fc1bd62322e67b909`.

The authenticated artifact API lists zero artifacts for both the e3 and older 1fd runs, so no downloadable previous Pages artifact is currently available. Expiration versus deletion is not inferred. Per `tools/PAGES_RUNTIME_RELEASE.md`, a future rollback must create a **new** commit whose tree is **`74a8064e67dafa06b20120ef5563da176db6d793` (e3)** and whose only parent is the then-current release (818d3b0c if this candidate is published). First push only a new rollback-review branch; after review and separate exact-SHA owner authorization, perform an ordinary release FF. No rollback was created or performed. [Exact guarded commands](rollback/ROLLBACK_COMMANDS.md), [deployment/API receipt](rollback/PAGES_ROLLBACK_DATA.json).

## Cleanup and privacy

Own temporary source/candidate worktrees, package-QA copies and private browser profiles were cleaned with bounded path/process/reparse/Git/preview guards. The first helper attempt stopped before any removal because its PowerShell function name shadowed git; the helper was corrected and the same guarded cleanup passed. Receipts preserve both outcomes. The actual package remains at `E:/Warhammer/qa-tmp/release-candidate-v4/package` for owner review. The evidence checkout is only for the report commit/push. Previous packages, source/main/release refs, the existing preview/PID1348 and TLS were untouched. [Cleanup](CLEANUP.json).

Public evidence contains compressed screenshots, reports, hashes and authoring recipes only: no raw imports, storage values, private profiles, TLS, runtime package binaries or RAW source captures. Text is English; the only email in proposed commands is the existing public Codex automation identity, never the owner's address. **STOP: publication requires a separate owner instruction for this exact candidate SHA after independent review and manual acceptance.**
