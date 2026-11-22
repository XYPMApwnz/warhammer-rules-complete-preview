# Polish 7 — review report

**READY_FOR_REVIEW. The single full pre-FF passed 211/211 on unchanged `9c18451452a478be2509314b6b80224313506ec9`. No additional full run occurred.**

Base/source: `e08ec20df980d4e6700c32b65069de983b250e03`.
Feature: `codex/polish-7-v1`, `9c18451452a478be2509314b6b80224313506ec9`.
Evidence: `codex/polish-7-evidence`; review only, never merge it.

## 1. Offline Army Books

The shared shell uses copy from `books/shared/army-book-app-v2/cosmetics.mjs`, without book-name branches or changes to cache policy, data, import, rules or gameplay. A failed load while the browser reports offline uses the explanation below. An online failure keeps the old message and offers Try again. Existing protection of an already mounted working document remains unchanged.

| Condition | Before | After |
| --- | --- | --- |
| Offline, no saved book data | Army Book unavailable — The Army Book could not be loaded. Return Home and try again. | This Army Book isn't saved for offline use yet. Open it once while online, then it will work offline. + Back to Home |
| Offline, book opened online earlier | Native book opens | Same native book, same datasheet count |
| Online, book request fails | The Army Book could not be loaded. Return Home and try again. | Same exact message + Try again; retry loads the book after connectivity/data recovers |

`npm run test:offline-army-book` serves the actual published package and worker. At 390 and 1440 px it first installs the shell and proves no book payload is in Cache Storage, goes offline, and opens each of nine books. It checks exact text, absence of the old text, no stale cards and the working Home action. It then warms/reopens all nine actual native books offline. Nine fresh online profiles per width receive a genuine 503 for the exact book payload and recover with Try again. Total: 54 cases. Both the targeted run and final full-queue run passed; [final receipt](OFFLINE_BOOK_FINAL.json), [self-contained screenshot gallery](GALLERY.html). No fetch function or native factory is substituted.

## 2. Core failure diagnostics

The old `assertCorePopup` function, 46 assertions, 15 waits, action order and original 15-second timeout are unchanged. No retries or success-path trace recording were added. Passive Playwright listeners retain console/page errors, page/frame navigation, request/response/finished/failed events and pending requests. A catch before the existing cleanup writes live frame DOM and application state, prints its absolute path, and rethrows the same error.

Artifacts: `<test evidence>/core-v2-mount-*/failure-diagnostics/FAILURE.json` plus `page-N-frame-M.html`. Pending requests/journal are frozen at failure entry. DOM/state queries have a diagnostic-only two-second bound after failure; capture errors are recorded and cannot replace the test error. No cookies, request bodies/headers or localStorage are collected. This diagnoses a future failure; it does not claim to establish the cause of the earlier intermittent timeout.

Controls: 13 lightweight synthetic assertions pass. A disposable external copy injected `POLISH7_NEGATIVE_CONTROL_POPUP` at popup entry and exited 1 with that exact error; the tracked test was not changed by this control. It saved three nonempty live frame DOM files, 2,440 journal events and one pending request, with zero capture errors. See [negative control](core-diagnostics/NEGATIVE_CONTROL.json) and [assertion preservation](core-diagnostics/ASSERTION_PRESERVATION.json).

| Existing test/tool | Before | After | Preserved facts |
| --- | --- | --- | --- |
| v2/core-reader-browser-qa.mjs:9,24,61,162 | Failure propagated through existing cleanup without a DOM/network receipt | Passive collector; failure catch captures evidence, prints path, rethrows original error | All 46 exact assertions, all 15 waits, timeout setter and assertCorePopup byte-identical; no changed expected values |
| tools/qa-queue.mjs | 209 sequential jobs | Same 209 jobs in the same order/arguments, plus helper QA and nine-book offline browser QA | [Ordered job proof](QUEUE_PRESERVATION.json); no old scenario removed or deduplicated differently |

[Full old-test/queue diff](OLD_TEST_AND_QUEUE_CHANGES.patch). All other existing tests and expectations remain unchanged. New helper QA runs in quick/pre-FF; the new browser QA runs once in pre-FF. The QA matrix documents both.

## 3. GitHub branches — proposal only, stopped for approval

The read-only snapshot includes 87 branches (all codex branches and the two non-codex protected branches). Exact tip ancestry was checked in an isolated audit object store, without changing existing refs.

| Category | Count | Proposal |
| --- | ---: | --- |
| Source ancestors, ordinary codex features | 63 | Candidate for deletion |
| Already released candidate | 1 | Candidate for deletion: release-candidate-e3db1b34, exact current release |
| Evidence branches | 17 | Keep all |
| Protected main/source/release | 3 | Never delete |
| Not merged | 3 | Keep: backlog-triage-v1, preff-speedup-v1, translate-3-sources |

The [complete table](branch-inventory/REPORT.md), [CSV](branch-inventory/BRANCH_INVENTORY.csv) and [exact ready-to-run deletion command](branch-inventory/DELETE_COMMAND_NOT_EXECUTED.txt) are included. **The command has not been executed.** Separate owner approval and an exact-tip recheck are required before any deletion. The two new polish-7 review branches created after the snapshot are also retained and absent from the proposed command. Commit emails are excluded.

## 4. Disk cleanup — owner script, not executed

Inventory: 108 top-level `E:/Warhammer/qa-tmp` folders, 41.816 GiB logical bytes. Proposal: **33.861 GiB (36,357,525,328 bytes), 240 disjoint targets / 248 operations**, including eight linked worktrees and four link-only junction removals. Logical totals count disjoint targets once; physical reclaimed space may differ.

Prepared owner script: `E:/Warhammer/qa-tmp/disk-cleanup/apply-3.ps1`, `$Apply = $true`, PowerShell 7+. The [review copy](disk-inventory/apply-3.ps1) is byte-identical: SHA256 `4543d7069bd3474e81e9760bc87003e80a46a977066d06d69a649a44dd8244f1`. **Do not execute before Claude review and separate owner approval.**

All boundaries, exact metadata fingerprints, file hashes, Git status/HEAD/owner, nested Git/reparse inventory, retained-worktree dependencies, active processes, preview identity/health, target counts and order are checked before the first removal. Worktrees use git worktree remove --force then prune in the retained owner; ordinary removals use exact LiteralPath. Junctions are unlinked without recursion before parents. Runtime failures stop and record completed operations and free space before/after; already completed removals cannot be rolled back.

Retained: all preview-v1, live package/PID 1348, TLS; current polish-7; all external source worktrees/common .git; all qa-evidence/archive-reports; entire E:/Codex; disk-cleanup itself and its history; shared node cache; six pinned BSData caches with eight dependency links; six unproven source/corpus folders left UNCLEAR. Parent containers with needed caches are only partially cleaned by exact sibling targets.

The prepared plan has passed parsing, literal/manifest hash checks, eight isolated helper controls and an independent read-only safety review. Neither its entry point nor Remove-Item/worktree removal/prune has been executed. Normal TOCTOU and incomplete OS open-handle visibility remain: any approved execution must run without concurrent changes. Fingerprints detect metadata drift, not malicious same-size/same-timestamp byte substitution. See [full inventory](disk-inventory/REPORT.md), [108 folders](disk-inventory/FOLDERS.csv), [248 operations](disk-inventory/OPERATIONS.csv), [guards](disk-inventory/GUARD_CONTROLS.json).

## Verification

- Native A/B: 199 cases (177 READY, 22 NEEDS_BINDINGS), 507 complete states, nine books; zero differences, no masking. Both sides were captured afresh at the exact base/feature SHA. [Results](AB_RESULTS.json).
- Generated rebuild gate: PASS, all 148 files / 68 steps byte-identical; [full receipt](GENERATED_REBUILD.json). No tracked generated/source data difference in [scope proof](SOURCE_BOUNDARY.json).
- Markup census: PASS, 2,724 rules, GAP 0 / UNKNOWN 15; registry unchanged. [Counts](CENSUS_SUMMARY.json).
- Runtime inventory: same 456 members / 221 precache URLs; no new browser startup file, no JSON attributes, no precache-policy change. The 41 published factual JSON/generated-data JS files (232,985,525 bytes) have identical SHA256 and byte lengths against the accepted base package; [byte proof](DATA_BYTE_PROOF.json). The failure helper/new tests are Node-only tools. Package syntax/startup/precache checks run in the full queue.
- Full pre-FF: **211/211 PASS**, 79.43 minutes, one run on exactly `9c18451452a478be2509314b6b80224313506ec9`. [Results](PREFF_RESULTS.json), [all per-job times](PREFF_TIMINGS.csv), [final verification](FINAL_VERIFICATION.json). The post-run code diff is empty. Core passed in 54.213 seconds; offline-book QA passed all 54 cases in 107.859 seconds. No test or runtime change followed the run.

The live preview remains on reviewed e08ec20d/PID1348 at http://192.168.1.124:8765/. It has not been restarted or switched. No remote deletion, disk cleanup, source FF, release/main change or Pages action is part of this task.

Verification command: `npm run qa:pre-ff -- --out=E:/Warhammer/qa-evidence/polish-7-v1-2026-11-22/preff`, using a task-owned QA_TMP_ROOT and system Chrome. QA_SKIP_TMP_SWEEP=1 suppresses only the startup stale-temp sweep; no job/assertion is skipped. Existing QA-owned scratch lifecycle tests still run. None of the proposed cleanup targets was removed.

Text review artifacts use UTF-8/LF. A scoped .gitattributes rule preserves the owner apply-3 script and its normal PowerShell CRLF bytes, retaining the advertised SHA256. Private raw diagnostic DOM/journals, full native roster observations, raw exports, TLS, runtime package binaries and GIT_INVENTORY_PRIVATE.json are not published.
