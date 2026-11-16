# Disk cleanup result and scoped second-pass audit — 2026-11-16

**Scope: E:/Warhammer and E:/Codex only. This second pass did not inspect personal files outside those two trees. No second-pass deletion or move was performed. The only Git write is publication of this report on codex/disk-e-audit-evidence.**

This is the current, scoped report. The accepted original one-pass inventory and original 36-target proposal remain preserved in the previous evidence commit [16e75e4d](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/blob/16e75e4d11982287a68c66978872d765af0ad730/docs/reviews/disk-e-audit-2026-11-16.md). It is not necessary to rescan or reclassify anything outside the two authorized trees.

## 1. Approved cleanup: completed by the owner

The agent attempted the owner-approved script with Apply=true; automatic approval review rejected it before process launch. The agent prepared E:/Warhammer/qa-tmp/disk-cleanup/apply.ps1 instead. The owner then executed that file in PowerShell 7 and supplied the following successful output. A subsequent read-only existence check confirmed that all 36 exact approved target paths are absent (0 remaining).

| Measurement from owner-run script | Bytes | GiB |
| --- | --- | --- |
| Free before | 14884270080 | 13.862057 |
| Free after | 59215544320 | 55.148773 |
| Increase | 44331274240 | 41.286716 |

The increase is 41.287 GiB. The original allocation estimate was 41.269 GiB; live filesystem activity and allocation accounting can change the final measured difference. The reported capacity change is volume metadata, not a new scan of personal files. The subsequent check observed 59,215,032,320 free bytes. No further cleanup is authorized by this report.

### Exact completed 36-target list

| Approved target | Original logical size | Verified outcome |
| --- | --- | --- |
| `E:/Warhammer/qa-tmp/book-passport-v1/baseline-913cfef5` | 1.547 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/book-unification-v1/experiment-clone` | 1.589 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/book-update-command-v1/baseline-35a5e4d5` | 1.549 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/book-update-command-v1/core-reader-baseline-35a5e4d5` | 1.549 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger/checkout` | 1.548 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-itUuYK/checkout` | 1.548 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/core-switch-b-v1-20261111/historical-baseline-source/checkout` | 1.545 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/core-switch-b-v1-20261111/task-a-boundary-probe` | 1.554 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/keywords-access-v1/base-checkout` | 1.563 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/keywords-access-v1/wh-qa-pre-ff-work-wI2qAj` | 263 B | Absent after owner execution |
| `E:/Warhammer/qa-tmp/mfm-update-v1/baseline-e8841df8` | 1.548 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/mfm-update-v1/baseline-e8841df8-final` | 1.548 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/mfm-update-v1/wh-qa-pre-ff-work-cjsfmZ` | 264 B | Absent after owner execution |
| `E:/Warhammer/qa-tmp/official-updates-v1/baseline-d55a3515` | 1.552 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/official-updates-v1/baseline-d55a3515-approved-5bc26d82` | 1.552 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/official-updates-v1/baseline-d55a3515-final` | 1.552 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/official-updates-v1/baseline-d55a3515-final-89e16ac5` | 1.552 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/official-updates-v1/gate-adeptus-mechanicus-91e0f9ac` | 1.551 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/official-updates-v1/gate-blood-angels-c150464d` | 1.553 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/official-updates-v1/gate-chaos-space-marines-c150464d` | 1.553 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/official-updates-v1/gate-dark-angels-c150464d` | 1.553 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/official-updates-v1/gate-death-guard-69340e49` | 1.548 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/official-updates-v1/gate-emperors-children-c150464d` | 1.553 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/official-updates-v1/gate-space-marines-91e0f9ac` | 1.551 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/official-updates-v1/gate-space-marines-c150464d` | 1.553 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/official-updates-v1/gate-tau-empire-91e0f9ac` | 1.551 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/official-updates-v1/gate-tyranids-91e0f9ac` | 1.551 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/sw-update-v1/resume-source-final` | 1.163 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/sw-update-v1/source-final` | 1.163 GiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/sw-update-v1/wh-browser-eAl1BL` | 82.791 KiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/sw-update-v1/wh-qa-pre-ff-work-trRC6g` | 264 B | Absent after owner execution |
| `E:/Warhammer/qa-tmp/test-hygiene-min-v1/wh-browser-AQe87V` | 84.541 KiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/test-hygiene-min-v1/wh-browser-lSg6mw` | 86.377 KiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/test-hygiene-min-v1/wh-browser-qMmOXQ` | 79.771 KiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/wh-browser-LEHZ35` | 81.910 KiB | Absent after owner execution |
| `E:/Warhammer/qa-tmp/wh-qa-pre-ff-work-6qmGr1` | 264 B | Absent after owner execution |

The preview process PID 29324 was still running at the post-cleanup check. E:/Warhammer/qa-tmp/preview-v1, its active package package-9a487657, TLS material, preview recipes, and QA evidence dated November 1 or later are KEEP. They were not traversed by the scoped Warhammer scan.

## 2. Method and limits

- Warhammer: one metadata walk, 3.774 seconds, 30,961 directory records, 322,025 observed files; 0 enumeration errors. Protected subtrees are intentionally not measured, so the scanned root total is not a full Warhammer capacity total.
- Codex: one separate metadata walk; no session, configuration, authentication, database or plugin-manifest contents read. Details are in section 5.
- Git: 78 in-scope A checkouts, 29 common repositories, 129.52 seconds of sequential read-only commands; three additional embedded old-QA baseline worktrees checked separately. No tests, pre-ff, builds, fetch, reset, checkout or source-data changes were used by the inventory.
- Commands include git --no-optional-locks status --porcelain=v1 --untracked-files=all --ignore-submodules=all; git log --branches --not --remotes; a separate git log HEAD --not --remotes for detached/local checkout history; git worktree list --porcelain; and read-only ls-remote origin. GIT_OPTIONAL_LOCKS=0. Commit authors/emails were not requested; email-looking path fragments are redacted.
- No remote-tracking refs were updated. A zero log count means absence relative to locally recorded remote-tracking refs, not a fresh proof that every remote branch still exists. Current origin lookup results are reported separately. The principal recovery repository uses a local safety mirror as origin; that mirror is older than the current GitHub source. Stale refs are not silently called unique work or synchronized state.
- For linked worktrees, removing the checkout later must preserve its shared common Git directory and all branches/stashes. Local branches elsewhere in the common repository do not disappear when one clean checkout is unregistered. Standalone clones with unique branches or stash are retained. No worktree was unregistered here.
- Do not sum parent/child rows. All new size figures are logical bytes, not promised physical reclaim; junction destinations were not traversed or double-counted. Dates below are UTC unless explicitly labeled Moscow. November cutoff: 2026-11-01 00:00 Moscow.

## 3. A — clones, worktrees and remaining temporary material

**Proposed SAFE_TO_DELETE: 34 disjoint Git checkouts, 33.252 GiB logical. None was deleted.** There are 13 KEEP and 31 UNCLEAR Git rows. A later cleanup must use only the exact proposed safe rows and recheck state immediately before action; never delete the parent worktrees or qa-tmp container wholesale.

KEEP overrides a clean Git result where the directory owns a common Git object/ref store, serves as another retained checkout's origin/dependency, is the current checkout, or is the explicitly retained Core-refresh warehouse. UNCLEAR retains dirty/untracked files, local commits, stash, failed checks, or an uninspected non-Git artifact.

### Per-checkout result

S = number of porcelain status entries; H = commits reachable from this checkout HEAD but absent from remote-tracking refs; B = commits from all local branches absent from remote-tracking refs in the common repository. All 78 A status queries succeeded. B is shared across linked worktrees and must not be added across rows.

| Path | Logical size | Modified UTC | Branch / HEAD | S / H / B | Common | Class | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `E:/Warhammer/worktrees/v2-stage59-universal-pricing-be70d80b` | 1.214 GiB | 2026-10-23T15:22:05+00:00 | codex/v2-stage59-universal-pricing / be70d80b8b3f | 27 / 0 / 16 | G01 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/worktrees/v1-cleanup-v1` | 1.144 GiB | 2026-11-07T19:57:27+00:00 | codex/v1-cleanup-v1 / 61e7c87075ed | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/tyranids-ec-rule-coverage-v1` | 1.137 GiB | 2026-11-06T22:14:40+00:00 | codex/tyranids-ec-rule-coverage-v1 / 427796be5d29 | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/test-temp-cleanup-tau` | 1.130 GiB | 2026-10-31T11:23:56+00:00 | codex/test-temp-cleanup-tau / 3bb12ef850a4 | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/test-hygiene-min-v1` | 1.162 GiB | 2026-11-13T20:51:19+00:00 | codex/test-hygiene-min-v1 / 2d5defae9e96 | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/test-hygiene-2` | 1.132 GiB | 2026-11-05T12:13:08+00:00 | codex/test-hygiene-2 / b4c7e9738941 | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/test-hygiene-1` | 1.132 GiB | 2026-11-05T07:44:56+00:00 | codex/test-hygiene-1 / f3cb1565c17a | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/sweep-polish-v1` | 1.163 GiB | 2026-11-15T09:49:19+00:00 | codex/sweep-polish-v1 / 175d41d14a58 | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/sw-update-v1` | 1.163 GiB | 2026-11-14T21:14:48+00:00 | codex/sw-update-v1 / 62b16eb233c4 | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/source-catalog-registry-v1` | 1.144 GiB | 2026-11-11T13:33:55+00:00 | codex/source-catalog-registry-v1 / 7b15dc36425a | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/sm-da-recipient-gaps-v1` | 1.133 GiB | 2026-11-06T11:20:41+00:00 | codex/sm-da-recipient-gaps-v1 / 6fdb77a320b3 | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/sm-ba-da-rule-recipients` | 1.132 GiB | 2026-11-04T14:04:29+00:00 | codex/sm-ba-da-rule-recipients / 7882b6583de1 | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/show-2-card-display` | 1.130 GiB | 2026-10-31T08:53:18+00:00 | codex/show-2-card-display / 1d6ed00ec299 | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/show-1-card-labels` | 1.130 GiB | 2026-10-31T01:25:03+00:00 | codex/show-1-card-labels / fe40b913da96 | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/safe-pwa-updates-0cbf20e5` | 1.213 GiB | 2026-10-26T12:29:58+00:00 | codex/safe-pwa-updates / 0cbf20e54fa5 | 8 / 0 / 16 | G01 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/worktrees/preff-speedup-v1` | 1.163 GiB | 2026-11-14T00:12:20+00:00 | codex/preff-speedup-v1 / 242fc764ca08 | 0 / 1 / 16 | G01 | UNCLEAR | Checkout HEAD contains commits absent from local remote-tracking refs; preserve or explicitly archive them first. |
| `E:/Warhammer/worktrees/official-updates-v1` | 1.162 GiB | 2026-11-12T21:36:41+00:00 | codex/official-updates-v1 / 021578691aff | 0 / 0 / 16 | G01 | KEEP | Referenced as a dependency/junction target or configured origin by another retained tree; preserve until those references are deliberately retired. |
| `E:/Warhammer/worktrees/o3-detachment-card-text-v1` | 1.150 GiB | 2026-11-07T08:33:55+00:00 | codex/o3-detachment-card-text-v1 / 29a866d534ef | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/o1-recipient-rule-text` | 1.130 GiB | 2026-10-30T22:02:17+00:00 | codex/o1-recipient-rule-text / 0ba0426b592f | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/nr-v3725-header-v1` | 1.163 GiB | 2026-11-15T15:05:13+00:00 | codex/nr-v3725-header-v1 / 9a48765744f3 | 0 / 0 / 16 | G01 | KEEP | Current working checkout. |
| `E:/Warhammer/worktrees/norma-1` | 1.130 GiB | 2026-11-03T20:41:49+00:00 | codex/norma-1 / f85c0b59f008 | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/new-recruit-plain-header-v1` | 1.134 GiB | 2026-11-06T17:11:14+00:00 | codex/new-recruit-plain-header-v1 / 2bced37f2733 | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/new-recruit-model-names-v1` | 1.134 GiB | 2026-11-06T19:55:25+00:00 | codex/new-recruit-model-names-v1 / c0fab930a4f4 | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/new-recruit-export-import-v1` | 1.134 GiB | 2026-11-06T13:48:54+00:00 | codex/new-recruit-export-import-v1 / 70be7d9d37a7 | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/keywords-access-v1` | 1.163 GiB | 2026-11-14T06:38:40+00:00 | codex/keywords-access-v1 / 0e887a93c298 | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/glossary-builder` | 1.132 GiB | 2026-11-05T14:16:07+00:00 | codex/glossary-builder / 0d67e4a27466 | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/generated-rebuild-gate-v1` | 1.150 GiB | 2026-11-07T21:21:59+00:00 | codex/generated-rebuild-gate-v1 / 8bc41677f384 | 3 / 0 / 16 | G01 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/worktrees/fabius-safe-import-v1` | 1.162 GiB | 2026-11-13T10:56:25+00:00 | codex/fabius-safe-import-v1 / feea3583775b | 0 / 0 / 16 | G01 | KEEP | Referenced as a dependency/junction target or configured origin by another retained tree; preserve until those references are deliberately retired. |
| `E:/Warhammer/worktrees/epic-hero-enhancements-v1` | 1.151 GiB | 2026-11-10T19:40:13+00:00 | codex/core-rules-refresh-v1 / f57e61f9c7fb | 0 / 3 / 16 | G01 | KEEP | Referenced as a dependency/junction target or configured origin by another retained tree; preserve until those references are deliberately retired. |
| `E:/Warhammer/worktrees/csm-tau-tyranids-ec-rule-recipients` | 1.133 GiB | 2026-11-04T23:27:25+00:00 | codex/csm-tau-tyranids-ec-rule-recipients / 8e9a95289168 | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/csm-tau-recipient-gaps-v1` | 1.132 GiB | 2026-11-06T09:11:08+00:00 | codex/csm-tau-recipient-gaps-v1 / 67f10ef5e754 | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/core-switch-b-v1` | 1.161 GiB | 2026-11-11T21:14:21+00:00 | codex/book-update-command-v1 / d55a3515d2cb | 0 / 0 / 16 | G01 | KEEP | Referenced as a dependency/junction target or configured origin by another retained tree; preserve until those references are deliberately retired. |
| `E:/Warhammer/worktrees/core-importer-a-v1` | 1.154 GiB | 2026-11-11T17:07:30+00:00 | codex/core-importer-a-v1 / 8ab6787ce503 | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/core-b1-term-bindings-27eb38fe` | 1.213 GiB | 2026-10-26T08:12:01+00:00 | codex/core-b1-term-bindings / c03cd157503e | 2 / 0 / 16 | G01 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/worktrees/compatible-related-panel-v1` | 1.149 GiB | 2026-11-07T01:15:53+00:00 | codex/compatible-related-panel-v1 / 985a1da4a842 | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/cards-cosmetics-v1` | 1.144 GiB | 2026-11-07T21:33:17+00:00 | codex/cards-cosmetics-v1 / f7500b434806 | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/card-texts-v1` | 1.162 GiB | 2026-11-13T14:52:02+00:00 | codex/card-texts-v1 / 56b5c82466ba | 0 / 0 / 16 | G01 | KEEP | Referenced as a dependency/junction target or configured origin by another retained tree; preserve until those references are deliberately retired. |
| `E:/Warhammer/worktrees/card-polish-2-v1` | 1.163 GiB | 2026-11-14T10:36:33+00:00 | codex/card-polish-2-v1 / 4bd213b92f8a | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/backlog-triage-v1` | 1.162 GiB | 2026-11-13T08:57:11+00:00 | codex/backlog-triage-v1 / 53cef239c49f | 0 / 1 / 16 | G01 | UNCLEAR | Checkout HEAD contains commits absent from local remote-tracking refs; preserve or explicitly archive them first. |
| `E:/Warhammer/worktrees/am-dg-recipient-gaps-v1` | 1.132 GiB | 2026-11-05T23:06:29+00:00 | codex/am-dg-recipient-gaps-v1 / 82f628e4524a | 0 / 0 / 16 | G01 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/warhammer-w2-25-sm-facts` | 639.218 MiB | 2026-09-11T13:49:54+00:00 | repair/w2-25-sm-facts / 27d68db0c8ba | 0 / 1 / 92 | G02 | UNCLEAR | Checkout HEAD contains commits absent from local remote-tracking refs; preserve or explicitly archive them first. |
| `E:/Warhammer/warhammer-w2-25-sm-facts/tmp/bsdata-wh40k-11e` | 68.700 MiB | 2026-09-11T13:50:05+00:00 | (detached/unborn) / fa30730fca11 | 0 / 0 / 0 | G03 | SAFE_TO_DELETE | Clean standalone clone with no local branch/HEAD commits outside tracking refs or stash. Origin returns Repository not found; safety relies on two retained local copies of exactly the same HEAD: E:/Warhammer/warhammer-rules-complete-preview/tmp/bsdata-wh40k-11e, E:/Warhammer/qa-tmp/test-hygiene-min-v1/bsdata-wh40k-11e-fa30730fca11fbfe87be90684d481d50e0efaf66. No live remote backup is claimed. |
| `E:/Warhammer/warhammer-w2-16-root-overflow` | 547.802 MiB | 2026-09-11T13:33:44+00:00 | repair/w2-16-root-overflow / 10fe62712ddd | 0 / 0 / 92 | G02 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/warhammer-v2-safety-20261017` | 1.238 GiB | 2026-10-17T20:28:36+00:00 | development/v2-current / b1d69da47475 | 7 / 55 / 55 | G04 | KEEP | Referenced as a dependency/junction target or configured origin by another retained tree; preserve until those references are deliberately retired. |
| `E:/Warhammer/warhammer-v2-recovery` | 1.592 GiB | 2026-10-27T19:08:26+00:00 | codex/test-speedup / feb2fee2e674 | 3 / 0 / 16 | G01 | KEEP | Owns shared Git common directory used by other registered worktrees; removing this tree would destroy their object/ref store. |
| `E:/Warhammer/warhammer-v2-current` | 1.238 GiB | 2026-10-12T14:01:10+00:00 | development/v2-current / b1d69da47475 | 7 / 55 / 55 | G05 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/warhammer-rules-dg-v2` | 728.358 MiB | 2026-10-01T10:13:06+00:00 | working/death-guard-book-v2 / 9d0f5afe0f26 | 16 / 0 / 92 | G02 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/warhammer-rules-dg-v1-navigation-port` | 833.582 MiB | 2026-10-10T16:11:26+00:00 | shared-v2-source-first / 078de95d5ba6 | 0 / 17 / 92 | G02 | UNCLEAR | Checkout HEAD contains commits absent from local remote-tracking refs; preserve or explicitly archive them first. |
| `E:/Warhammer/warhammer-rules-complete-preview` | 1.406 GiB | 2026-09-30T10:31:33+00:00 | working/army-books-clean / bdc43be87218 | 17 / 0 / 92 | G02 | KEEP | Owns shared Git common directory used by other registered worktrees; removing this tree would destroy their object/ref store. |
| `E:/Warhammer/warhammer-rules-complete-preview/tmp/bsdata-wh40k-11e-d5af57` | 64.543 MiB | 2026-09-13T07:59:01+00:00 | (detached/unborn) / d5af57cf1e79 | 0 / 0 / 0 | G06 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/warhammer-rules-complete-preview/tmp/bsdata-wh40k-11e-b6d179` | 64.502 MiB | 2026-09-13T07:59:05+00:00 | (detached/unborn) / b6d17952f748 | 0 / 0 / 0 | G06 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/warhammer-rules-complete-preview/tmp/bsdata-wh40k-11e-72620b` | 64.603 MiB | 2026-09-13T08:02:39+00:00 | (detached/unborn) / 72620bee0d1d | 0 / 0 / 0 | G06 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/warhammer-rules-complete-preview/tmp/bsdata-wh40k-11e` | 78.835 MiB | 2026-09-13T01:59:01+00:00 | (detached/unborn) / fa30730fca11 | 0 / 0 / 0 | G06 | KEEP | Owns shared Git common directory used by other registered worktrees; removing this tree would destroy their object/ref store. |
| `E:/Warhammer/warhammer-final-test-cleanup` | 531.127 MiB | 2026-09-11T20:39:54+00:00 | repair/final-test-cleanup / 582e321c57ee | 3 / 0 / 92 | G02 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/warhammer-ec-eager` | 531.129 MiB | 2026-09-11T20:35:10+00:00 | repair/ec-eager / c5a9f21c8e34 | 0 / 0 / 92 | G02 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/qa-tmp/test-hygiene-min-v1/bsdata-wh40k-11e-fa30730fca11fbfe87be90684d481d50e0efaf66` | 78.819 MiB | 2026-11-13T20:51:18+00:00 | (detached/unborn) / fa30730fca11 | 0 / 0 / 0 | G07 | KEEP | Referenced as a dependency/junction target or configured origin by another retained tree; preserve until those references are deliberately retired. |
| `E:/Warhammer/qa-tmp/official-updates-v1/tyranids-trial-guard-diagnostic/checkout` | 1.558 GiB | 2026-11-12T23:21:36+00:00 | (detached/unborn) / ed55e7edebd8 | 5 / 1 / 0 | G08 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/qa-tmp/official-updates-v1/trials-final/tyranids/checkout` | 1.558 GiB | 2026-11-12T22:55:02+00:00 | (detached/unborn) / ed55e7edebd8 | 0 / 1 / 0 | G09 | KEEP | Referenced as a dependency/junction target or configured origin by another retained tree; preserve until those references are deliberately retired. |
| `E:/Warhammer/qa-tmp/official-updates-v1/trials-final/death-guard/checkout` | 1.565 GiB | 2026-11-12T22:48:06+00:00 | (detached/unborn) / b0df1b458ae0 | 0 / 3 / 0 | G10 | UNCLEAR | Checkout HEAD contains commits absent from local remote-tracking refs; preserve or explicitly archive them first. |
| `E:/Warhammer/qa-tmp/official-updates-v1/trials-approved-5bc26d82/tyranids/checkout` | 1.558 GiB | 2026-11-13T06:44:11+00:00 | (detached/unborn) / a6d5a0e59ae3 | 8 / 2 / 0 | G11 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/qa-tmp/mfm-update-v1/wh-mfm-update-LuGjf2/work/checkout` | 1.556 GiB | 2026-11-12T07:19:05+00:00 | codex/mfm-update-v1 / e8841df84cb4 | 239 / 0 / 0 | G12 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/qa-tmp/mfm-update-v1/warhammer-source-contract-B22n5D/work/tracked-inputs` | 27.638 KiB | 2026-11-12T07:19:27+00:00 | master / 815d10fe625b | 2 / 1 / 1 | G13 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/qa-tmp/mfm-update-v1/warhammer-source-contract-B22n5D/work/capture-repo` | 27.678 KiB | 2026-11-12T07:19:26+00:00 | master / 2899bf7c4a25 | 0 / 1 / 1 | G14 | UNCLEAR | Checkout HEAD contains commits absent from local remote-tracking refs; preserve or explicitly archive them first. |
| `E:/Warhammer/qa-tmp/core-rules-refresh-v1-source-catalog-baseline-write` | 1.518 GiB | 2026-11-11T09:50:53+00:00 | (detached/unborn) / 949d98f9699d | 8 / 0 / 0 | G15 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/qa-tmp/core-rules-refresh-v1-registry-u6-recovery` | 1.525 GiB | 2026-11-11T10:31:04+00:00 | (detached/unborn) / e2a7740b57a2 | 100 / 0 / 0 | G16 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/qa-tmp/core-rules-refresh-v1-registry-u6-baseline` | 1.518 GiB | 2026-11-11T10:29:48+00:00 | (detached/unborn) / 949d98f9699d | 1 / 0 / 0 | G17 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/qa-tmp/core-rules-refresh-v1-baseline-949d98f` | 1.518 GiB | 2026-11-11T07:00:49+00:00 | (detached/unborn) / 949d98f9699d | 1 / 0 / 0 | G18 | KEEP | Referenced as a dependency/junction target or configured origin by another retained tree; preserve until those references are deliberately retired. |
| `E:/Warhammer/qa-tmp/book-update-command-v1/wh-book-update-WVLHxS/work/checkout` | 1.544 GiB | 2026-11-12T14:22:16+00:00 | (detached/unborn) / 5c7f036ebe64 | 5 / 0 / 0 | G19 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-yRGrgn/checkout` | 1.557 GiB | 2026-11-12T14:28:04+00:00 | (detached/unborn) / 1489cae98ecd | 2 / 1 / 0 | G20 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-wnwCOx/checkout` | 1.557 GiB | 2026-11-12T16:36:48+00:00 | (detached/unborn) / 12c14caeef64 | 58 / 1 / 0 | G21 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-ufMFO6/checkout` | 1.556 GiB | 2026-11-12T12:59:05+00:00 | (detached/unborn) / ef9a6f8c4c1c | 6 / 1 / 0 | G22 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-sugJ53/checkout` | 1.557 GiB | 2026-11-12T13:37:01+00:00 | (detached/unborn) / 6ae35ce7f975 | 16 / 1 / 0 | G23 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-jooswU/checkout` | 1.557 GiB | 2026-11-12T14:51:07+00:00 | (detached/unborn) / d9d1998099fd | 64 / 1 / 0 | G24 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-bd4W8f/checkout` | 1.557 GiB | 2026-11-12T13:21:09+00:00 | (detached/unborn) / c22b3b344525 | 13 / 1 / 0 | G25 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-v3/checkout` | 1.553 GiB | 2026-11-12T12:51:30+00:00 | codex/book-update-command-v1 / b7c97a770a6b | 6 / 1 / 1 | G26 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-v2/checkout` | 1.548 GiB | 2026-11-12T12:46:44+00:00 | codex/book-update-command-v1 / 4f0dfa841894 | 0 / 1 / 1 | G27 | UNCLEAR | Checkout HEAD contains commits absent from local remote-tracking refs; preserve or explicitly archive them first. |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-final/checkout` | 1.553 GiB | 2026-11-12T17:31:09+00:00 | codex/book-update-command-v1 / e6ca478c9a42 | 6 / 1 / 1 | G28 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/Codex-Archive/patchrepo-2026-09-11` | 178.864 KiB | 2026-10-12T14:41:52+00:00 | master / HEAD | 9 / 0 / 0 | G29 | UNCLEAR | Read-only Git check failed; no deletion classification. |

### Remaining container-level inventory

Containers can include retained and proposed-safe descendants. Their classification is never an instruction to remove the whole parent. No additional safe claim is made for non-Git files merely because their directory is named tmp or archive.

| Path | Logical size | Modified UTC | Class | Reason |
| --- | --- | --- | --- | --- |
| `E:/Warhammer/qa-tmp/wh-temp-controls-WAJ5dS` | 269 B | 2026-10-31T18:55:02+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-temp-controls-qlHdQA` | 45.746 KiB | 2026-10-31T16:38:18+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-temp-controls-OsGrz2` | 270 B | 2026-10-31T18:31:56+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-temp-controls-O0f9xH` | 270 B | 2026-10-31T18:11:30+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-temp-controls-JtE3Gd` | 45.793 KiB | 2026-10-31T16:37:05+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-temp-controls-0DMKty` | 270 B | 2026-10-31T18:50:04+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-source-clone-ymVmsw` | 39.026 KiB | 2026-10-31T19:28:33+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-source-clone-vDBDj8` | 39.026 KiB | 2026-10-31T18:52:44+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-source-clone-DX1nmb` | 39.026 KiB | 2026-10-31T18:24:09+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-source-clone-0lkKMu` | 39.026 KiB | 2026-10-31T18:45:33+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-source-catalog-negative-UvsOlj` | 31.347 MiB | 2026-10-31T19:28:34+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-source-catalog-negative-MreIqq` | 31.347 MiB | 2026-10-31T18:24:11+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-source-catalog-negative-JpeIA6` | 31.347 MiB | 2026-10-31T18:52:45+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-source-catalog-negative-9hFi9Y` | 31.347 MiB | 2026-10-31T18:45:35+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-runtime-package-qa-iXU1NR` | 516.302 MiB | 2026-10-31T19:48:12+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-qa-quick-work-ORv6m5` | 262 B | 2026-10-31T18:50:04+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-qa-quick-work-CNgXWk` | 263 B | 2026-10-31T18:11:28+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-qa-quick-work-7vf35C` | 263 B | 2026-10-31T18:31:55+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-qa-pre-ff-work-8cJmv9` | 257.923 MiB | 2026-10-31T18:55:02+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-qa-pre-ff-bvVbdK` | 8.552 KiB | 2026-11-13T06:44:50+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-pwa-update-work-epEqzN` | 515.843 MiB | 2026-10-31T19:32:02+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-pwa-cold-work-lzAyEP` | 257.921 MiB | 2026-10-31T19:33:08+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-f1-synthetic-table-iKZWE1` | 1.009 GiB | 2026-10-31T19:35:46+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-yWAZCJ` | 263 B | 2026-10-31T19:29:50+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-Ypu6Wc` | 263 B | 2026-10-31T19:51:45+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-xIhFhV` | 263 B | 2026-10-31T19:49:55+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-x2xs8V` | 263 B | 2026-10-31T18:11:18+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-vQ8gBg` | 0 B | 2026-11-05T09:52:52+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-tj9Y2G` | 263 B | 2026-10-31T18:50:34+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-si3Aud` | 263 B | 2026-10-31T19:30:33+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-PtW6dP` | 263 B | 2026-10-31T18:20:46+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-ocVmbM` | 263 B | 2026-10-31T19:28:36+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-OcUK3f` | 263 B | 2026-10-31T19:43:05+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-ny7HCL` | 263 B | 2026-10-31T18:53:27+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-nKJz0y` | 263 B | 2026-10-31T19:36:23+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-ml914X` | 263 B | 2026-10-31T19:46:18+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-M3sJ01` | 262 B | 2026-10-31T19:36:45+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-kG5FBj` | 263 B | 2026-10-31T18:30:06+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-k8zCyf` | 263 B | 2026-10-31T18:35:59+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-iPDKh5` | 263 B | 2026-10-31T19:35:26+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-HRzOnq` | 82.278 KiB | 2026-11-03T21:22:03+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-gT8Gbp` | 263 B | 2026-10-31T19:53:46+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-G9HnkB` | 263 B | 2026-10-31T19:37:47+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-g03yBK` | 263 B | 2026-10-31T18:12:36+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-eDccGI` | 45.541 KiB | 2026-10-31T16:41:30+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-dbNK31` | 263 B | 2026-10-31T19:52:06+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-d2I86b` | 77.541 KiB | 2026-11-05T07:57:31+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-bDyBvT` | 263 B | 2026-10-31T19:32:13+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-APmBLL` | 263 B | 2026-10-31T18:32:13+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-AiythD` | 262 B | 2026-10-31T19:53:08+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-69U5Oi` | 263 B | 2026-10-31T18:52:14+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/wh-browser-0O5Doe` | 263 B | 2026-10-31T19:33:15+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/warhammer-source-enrollment-OHVnTx` | 255.471 MiB | 2026-10-31T19:53:12+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/warhammer-source-enrollment-jklIjg` | 255.471 MiB | 2026-10-31T19:48:43+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/warhammer-dg-wargear-enrollment-PGKVGC` | 35.101 KiB | 2026-10-31T19:53:12+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/warhammer-dg-wargear-enrollment-0E5gDe` | 35.101 KiB | 2026-10-31T19:48:43+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/v1-cleanup-v1-scripts` | 63.497 KiB | 2026-11-07T20:45:53+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/test-hygiene-min-v1` | 78.880 MiB | 2026-11-16T07:09:56+00:00 | UNCLEAR | Mixed container; consult exact nested Git rows, preserve all non-classified output. |
| `E:/Warhammer/qa-tmp/sweep-polish-v1` | 269.737 MiB | 2026-11-15T18:43:48+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/sw-update-v1` | 2.899 GiB | 2026-11-16T07:09:56+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/source-catalog-registry-v1-review-20261111` | 2.356 MiB | 2026-11-11T15:20:03+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/preview-v1` | Not measured | 2026-11-15T20:23:13+00:00 | KEEP | Protected live preview; not traversed. |
| `E:/Warhammer/qa-tmp/preview-phone-diagnostics` | 0 B | 2026-11-15T20:43:12+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/preff-speedup-v1` | 79.775 KiB | 2026-11-14T06:16:55+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/official-updates-v1` | 6.265 GiB | 2026-11-16T07:09:56+00:00 | UNCLEAR | Mixed container; consult exact nested Git rows, preserve all non-classified output. |
| `E:/Warhammer/qa-tmp/node-compile-cache` | 1.014 MiB | 2026-11-02T15:50:05+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/mfm-update-v1` | 1.818 GiB | 2026-11-16T07:09:52+00:00 | UNCLEAR | Mixed container; consult exact nested Git rows, preserve all non-classified output. |
| `E:/Warhammer/qa-tmp/keywords-access-v1` | 56.781 KiB | 2026-11-16T07:09:51+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/fabius-safe-import-v1` | 52.705 KiB | 2026-11-13T12:31:12+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/epic-hero-enhancements-v1-scripts` | 85.704 KiB | 2026-11-10T22:34:53+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/disk-e-audit` | 51.536 MiB | 2026-11-15T23:41:09+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/disk-cleanup` | 5.223 KiB | 2026-11-16T07:06:01+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/core-switch-b-v1-term-audit` | 88.943 MiB | 2026-11-11T21:38:53+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/core-switch-b-v1-runtime-working-final` | 269.612 MiB | 2026-11-11T21:46:28+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/core-switch-b-v1-runtime-preview` | 269.612 MiB | 2026-11-11T21:41:51+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/core-switch-b-v1-runtime-baseline-8ab` | 266.613 MiB | 2026-11-11T21:42:40+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/core-switch-b-v1-runtime-baseline` | 268.646 MiB | 2026-11-11T21:42:08+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/core-switch-b-v1-clarification-3` | 182.828 MiB | 2026-11-11T22:13:26+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/core-switch-b-v1-20261111` | 50.690 MiB | 2026-11-16T07:09:51+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/core-rules-refresh-v1-tests` | 377.114 KiB | 2026-11-11T12:11:36+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/core-rules-refresh-v1-source-catalog-baseline-write` | 1.518 GiB | 2026-11-11T09:50:53+00:00 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/qa-tmp/core-rules-refresh-v1-scripts` | 130.350 KiB | 2026-11-11T13:31:18+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/core-rules-refresh-v1-registry-u6-recovery` | 1.525 GiB | 2026-11-11T10:31:04+00:00 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/qa-tmp/core-rules-refresh-v1-registry-u6-baseline` | 1.518 GiB | 2026-11-11T10:29:48+00:00 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/qa-tmp/core-rules-refresh-v1-comparator-control` | 46.317 MiB | 2026-11-11T07:07:44+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/core-rules-refresh-v1-baseline-949d98f` | 1.518 GiB | 2026-11-11T07:00:49+00:00 | KEEP | Referenced as a dependency/junction target or configured origin by another retained tree; preserve until those references are deliberately retired. |
| `E:/Warhammer/qa-tmp/core-rules-refresh-v1-20261111` | 379.105 MiB | 2026-11-11T11:22:18+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/core-importer-a-v1-20261111` | 36.359 MiB | 2026-11-11T18:22:45+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/cards-cosmetics-v1-scripts` | 55.880 KiB | 2026-11-08T01:16:45+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/cards-cosmetics-u2-scripts` | 26.902 KiB | 2026-11-08T12:06:41+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/card-polish-2-v1` | 106.484 KiB | 2026-11-14T12:45:48+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/book-update-command-v1` | 16.580 GiB | 2026-11-16T07:09:50+00:00 | UNCLEAR | Mixed container; consult exact nested Git rows, preserve all non-classified output. |
| `E:/Warhammer/qa-tmp/book-unification-v1` | 78.130 KiB | 2026-11-16T07:09:49+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/book-passport-v1` | 44.619 KiB | 2026-11-16T07:09:49+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/backlog-triage-v1` | 269.691 MiB | 2026-11-13T09:53:39+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/qa-tmp/auto-qa-sweep-v1` | 0 B | 2026-11-15T06:48:12+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/worktrees/v2-stage59-universal-pricing-be70d80b` | 1.214 GiB | 2026-10-23T15:22:05+00:00 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/worktrees/v1-cleanup-v1` | 1.144 GiB | 2026-11-07T19:57:27+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/tyranids-ec-rule-coverage-v1` | 1.137 GiB | 2026-11-06T22:14:40+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/test-temp-cleanup-tau` | 1.130 GiB | 2026-10-31T11:23:56+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/test-hygiene-min-v1` | 1.162 GiB | 2026-11-13T20:51:19+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/test-hygiene-2` | 1.132 GiB | 2026-11-05T12:13:08+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/test-hygiene-1` | 1.132 GiB | 2026-11-05T07:44:56+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/sweep-polish-v1` | 1.163 GiB | 2026-11-15T09:49:19+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/sw-update-v1` | 1.163 GiB | 2026-11-14T21:14:48+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/source-catalog-registry-v1` | 1.144 GiB | 2026-11-11T13:33:55+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/sm-da-recipient-gaps-v1` | 1.133 GiB | 2026-11-06T11:20:41+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/sm-ba-da-rule-recipients` | 1.132 GiB | 2026-11-04T14:04:29+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/show-2-card-display` | 1.130 GiB | 2026-10-31T08:53:18+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/show-1-card-labels` | 1.130 GiB | 2026-10-31T01:25:03+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/safe-pwa-updates-0cbf20e5` | 1.213 GiB | 2026-10-26T12:29:58+00:00 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/worktrees/preff-speedup-v1` | 1.163 GiB | 2026-11-14T00:12:20+00:00 | UNCLEAR | Checkout HEAD contains commits absent from local remote-tracking refs; preserve or explicitly archive them first. |
| `E:/Warhammer/worktrees/official-updates-v1` | 1.162 GiB | 2026-11-12T21:36:41+00:00 | KEEP | Referenced as a dependency/junction target or configured origin by another retained tree; preserve until those references are deliberately retired. |
| `E:/Warhammer/worktrees/o3-detachment-card-text-v1` | 1.150 GiB | 2026-11-07T08:33:55+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/o1-recipient-rule-text` | 1.130 GiB | 2026-10-30T22:02:17+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/nr-v3725-header-v1` | 1.163 GiB | 2026-11-15T15:05:13+00:00 | KEEP | Current working checkout. |
| `E:/Warhammer/worktrees/norma-1` | 1.130 GiB | 2026-11-03T20:41:49+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/new-recruit-plain-header-v1` | 1.134 GiB | 2026-11-06T17:11:14+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/new-recruit-model-names-v1` | 1.134 GiB | 2026-11-06T19:55:25+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/new-recruit-export-import-v1` | 1.134 GiB | 2026-11-06T13:48:54+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/keywords-access-v1` | 1.163 GiB | 2026-11-14T06:38:40+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/glossary-builder` | 1.132 GiB | 2026-11-05T14:16:07+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/generated-rebuild-gate-v1` | 1.150 GiB | 2026-11-07T21:21:59+00:00 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/worktrees/fabius-safe-import-v1` | 1.162 GiB | 2026-11-13T10:56:25+00:00 | KEEP | Referenced as a dependency/junction target or configured origin by another retained tree; preserve until those references are deliberately retired. |
| `E:/Warhammer/worktrees/epic-hero-enhancements-v1` | 1.151 GiB | 2026-11-10T19:40:13+00:00 | KEEP | Referenced as a dependency/junction target or configured origin by another retained tree; preserve until those references are deliberately retired. |
| `E:/Warhammer/worktrees/csm-tau-tyranids-ec-rule-recipients` | 1.133 GiB | 2026-11-04T23:27:25+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/csm-tau-recipient-gaps-v1` | 1.132 GiB | 2026-11-06T09:11:08+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/core-switch-b-v1` | 1.161 GiB | 2026-11-11T21:14:21+00:00 | KEEP | Referenced as a dependency/junction target or configured origin by another retained tree; preserve until those references are deliberately retired. |
| `E:/Warhammer/worktrees/core-importer-a-v1` | 1.154 GiB | 2026-11-11T17:07:30+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/core-b1-term-bindings-27eb38fe` | 1.213 GiB | 2026-10-26T08:12:01+00:00 | UNCLEAR | Uncommitted tracked and/or untracked files remain; no blanket cleanup. |
| `E:/Warhammer/worktrees/compatible-related-panel-v1` | 1.149 GiB | 2026-11-07T01:15:53+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/cards-cosmetics-v1` | 1.144 GiB | 2026-11-07T21:33:17+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/card-texts-v1` | 1.162 GiB | 2026-11-13T14:52:02+00:00 | KEEP | Referenced as a dependency/junction target or configured origin by another retained tree; preserve until those references are deliberately retired. |
| `E:/Warhammer/worktrees/card-polish-2-v1` | 1.163 GiB | 2026-11-14T10:36:33+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/worktrees/backlog-triage-v1` | 1.162 GiB | 2026-11-13T08:57:11+00:00 | UNCLEAR | Checkout HEAD contains commits absent from local remote-tracking refs; preserve or explicitly archive them first. |
| `E:/Warhammer/worktrees/am-dg-recipient-gaps-v1` | 1.132 GiB | 2026-11-05T23:06:29+00:00 | SAFE_TO_DELETE | Clean checkout, no HEAD commits outside remote-tracking refs. Shared Git common directory/branches stay in place; remove only this linked worktree. |
| `E:/Warhammer/_codex_temp/sm-live-probe-f938` | 529.016 MiB | 2026-09-13T08:46:04+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/_codex_temp/bsdata-unverified-backup-20260912` | 64.322 MiB | 2026-08-29T08:35:41+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/Codex-Archive/QA-Artifacts` | 1.895 GiB | 2026-10-13T06:49:55+00:00 | UNCLEAR | Non-Git/partial snapshot, QA result, cache or backup; no independent retention/rebuildability proof. |
| `E:/Warhammer/Codex-Archive/patchrepo-2026-09-11` | 178.864 KiB | 2026-10-12T14:41:52+00:00 | UNCLEAR | Read-only Git check failed; no deletion classification. |
| `E:/Warhammer/_codex_temp` | 594.813 MiB | 2026-09-13T08:47:21+00:00 | UNCLEAR | Partial/backup container; do not discard without reviewing its non-Git contents. |
| `E:/Warhammer/warhammer-source-orks-probe` | 0 B | 2026-09-13T10:44:34+00:00 | UNCLEAR | Partial/backup container; do not discard without reviewing its non-Git contents. |
| `E:/Warhammer/Codex-Archive` | 1.895 GiB | 2026-10-12T14:46:33+00:00 | UNCLEAR | Partial/backup container; do not discard without reviewing its non-Git contents. |

### Origins, shared storage and exact local-commit inventory

| Common ID | Common Git directory | Origin | Origin lookup | B count | Stash present |
| --- | --- | --- | --- | --- | --- |
| G01 | `E:/Warhammer/warhammer-v2-recovery/.git` | `E:/Warhammer/warhammer-v2-safety-20261017` | 0 | 16 | no |
| G02 | `E:/Warhammer/warhammer-rules-complete-preview/.git` | `https://github.com/XYPMApwnz/warhammer-rules-complete-preview.git` | 0 | 92 | yes |
| G03 | `E:/Warhammer/warhammer-w2-25-sm-facts/tmp/bsdata-wh40k-11e/.git` | `https://github.com/BSData/wh40k-11e.git` | 128 | 0 | no |
| G04 | `E:/Warhammer/warhammer-v2-safety-20261017/.git` | `https://github.com/XYPMApwnz/warhammer-rules-complete-preview.git` | 0 | 55 | no |
| G05 | `E:/Warhammer/warhammer-v2-current/.git` | `https://github.com/XYPMApwnz/warhammer-rules-complete-preview.git` | 0 | 55 | no |
| G06 | `E:/Warhammer/warhammer-rules-complete-preview/tmp/bsdata-wh40k-11e/.git` | `https://github.com/BSData/wh40k-11e.git` | 128 | 0 | no |
| G07 | `E:/Warhammer/qa-tmp/test-hygiene-min-v1/bsdata-wh40k-11e-fa30730fca11fbfe87be90684d481d50e0efaf66/.git` | `https://github.com/BSData/wh40k-11e.git` | 128 | 0 | no |
| G08 | `E:/Warhammer/qa-tmp/official-updates-v1/tyranids-trial-guard-diagnostic/checkout/.git` | `E:/Warhammer/qa-tmp/official-updates-v1/trials-final/tyranids/checkout` | 0 | 0 | no |
| G09 | `E:/Warhammer/qa-tmp/official-updates-v1/trials-final/tyranids/checkout/.git` | `E:\Warhammer\worktrees\official-updates-v1` | 0 | 0 | no |
| G10 | `E:/Warhammer/qa-tmp/official-updates-v1/trials-final/death-guard/checkout/.git` | `E:\Warhammer\worktrees\official-updates-v1` | 0 | 0 | no |
| G11 | `E:/Warhammer/qa-tmp/official-updates-v1/trials-approved-5bc26d82/tyranids/checkout/.git` | `E:\Warhammer\worktrees\official-updates-v1` | 0 | 0 | no |
| G12 | `E:/Warhammer/qa-tmp/mfm-update-v1/wh-mfm-update-LuGjf2/work/checkout/.git` | `E:\Warhammer\worktrees\core-switch-b-v1\` | 0 | 0 | no |
| G13 | `E:/Warhammer/qa-tmp/mfm-update-v1/warhammer-source-contract-B22n5D/work/tracked-inputs/.git` | `(none)` | not queried | 1 | no |
| G14 | `E:/Warhammer/qa-tmp/mfm-update-v1/warhammer-source-contract-B22n5D/work/capture-repo/.git` | `(none)` | not queried | 1 | no |
| G15 | `E:/Warhammer/qa-tmp/core-rules-refresh-v1-source-catalog-baseline-write/.git` | `E:/Warhammer/qa-tmp/core-rules-refresh-v1-baseline-949d98f` | 0 | 0 | no |
| G16 | `E:/Warhammer/qa-tmp/core-rules-refresh-v1-registry-u6-recovery/.git` | `E:/Warhammer/worktrees/epic-hero-enhancements-v1` | 0 | 0 | no |
| G17 | `E:/Warhammer/qa-tmp/core-rules-refresh-v1-registry-u6-baseline/.git` | `E:/Warhammer/qa-tmp/core-rules-refresh-v1-baseline-949d98f` | 0 | 0 | no |
| G18 | `E:/Warhammer/qa-tmp/core-rules-refresh-v1-baseline-949d98f/.git` | `E:/Warhammer/worktrees/epic-hero-enhancements-v1` | 0 | 0 | no |
| G19 | `E:/Warhammer/qa-tmp/book-update-command-v1/wh-book-update-WVLHxS/work/checkout/.git` | `E:\Warhammer\worktrees\core-switch-b-v1` | 0 | 0 | no |
| G20 | `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-yRGrgn/checkout/.git` | `E:\Warhammer\worktrees\core-switch-b-v1` | 0 | 0 | no |
| G21 | `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-wnwCOx/checkout/.git` | `E:\Warhammer\worktrees\core-switch-b-v1` | 0 | 0 | no |
| G22 | `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-ufMFO6/checkout/.git` | `E:\Warhammer\worktrees\core-switch-b-v1` | 0 | 0 | no |
| G23 | `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-sugJ53/checkout/.git` | `E:\Warhammer\worktrees\core-switch-b-v1` | 0 | 0 | no |
| G24 | `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-jooswU/checkout/.git` | `E:\Warhammer\worktrees\core-switch-b-v1` | 0 | 0 | no |
| G25 | `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-bd4W8f/checkout/.git` | `E:\Warhammer\worktrees\core-switch-b-v1` | 0 | 0 | no |
| G26 | `E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-v3/checkout/.git` | `E:/Warhammer/worktrees/core-switch-b-v1` | 0 | 1 | no |
| G27 | `E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-v2/checkout/.git` | `E:/Warhammer/worktrees/core-switch-b-v1` | 0 | 1 | no |
| G28 | `E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-final/checkout/.git` | `E:/Warhammer/worktrees/core-switch-b-v1` | 0 | 1 | no |
| G29 | `E:/Warhammer/Codex-Archive/patchrepo-2026-09-11/.git` | `(none)` | not queried | 0 | no |

Origin exit 128 for the three BSData common repositories reports Repository not found. No live remote backup is asserted. The standalone G03 candidate has exactly the same HEAD fa30730fca11fbfe87be90684d481d50e0efaf66 as two KEEP roots: E:/Warhammer/warhammer-rules-complete-preview/tmp/bsdata-wh40k-11e and E:/Warhammer/qa-tmp/test-hygiene-min-v1/bsdata-wh40k-11e-fa30730fca11fbfe87be90684d481d50e0efaf66. That local redundancy, zero dirty entries and zero local branch/HEAD commits outside tracking refs support its proposal. Retain both backup roots; older clean, unreferenced linked BSData checkouts preserve their shared Git store.

#### G01: exact git log --branches --not --remotes output (IDs)

Queried at `E:/Warhammer/worktrees/v2-stage59-universal-pricing-be70d80b`. 16 commits; IDs only, no author/email metadata.

```text
16e75e4d11982287a68c66978872d765af0ad730
5f88e125835ade0c4d544d3fb7dd6fea699df13c
242fc764ca0890e10b3c7c2b6270291fa0b0a070
53cef239c49fc66fb00dd48bb4727088bf791e32
f57e61f9c7fb2f30d1723479ed5257257eeb6235
3416606904b87af24c130fc3610051998244451d
e2a7740b57a2d72a57039526cfdd09962386159c
874f3ccb2e21a561828985875c19c52146d387af
2c6d6716eb97394c91ddde4efc462f3ae507eed2
c73bd5396aa358d97603650ebd28a4886b61cf6b
bc18ef7e5ed45ed7f3877a0e0eefa68d9475a6c5
8b504913041f53b18e7d7f155d26443f368f20e0
ce63022df7819ad316f4a33051151b28ac6faf7e
814109cd5be5b5b65a70015c2d26bb2394efa80a
bb30250e4906712d13339eaab18b85f919df3188
ca651a233a92d836c9d724262aa2460bd8776e37
```

#### G02: exact git log --branches --not --remotes output (IDs)

Queried at `E:/Warhammer/warhammer-w2-25-sm-facts`. 92 commits; IDs only, no author/email metadata.

```text
078de95d5ba6337c68fa68f99fa73d5ab22d4a8c
fb217cb405cf65eefb4cf9c72affd32441ffdce6
14916f21f04037cbc1663312354968fbf1138f08
9a952c7c6e0d866677eb48897b5a4b32bc207682
a3537d83be097a5d61cae285a25dc8a8a52ecb7b
9439c9cc93da26ad916f9ce6941905e0619c5adc
ca5ce40c497901a6f105bf106decfd18547ed293
7ad3a2a5e3b3cf0b59534d0982730ba8a3e46237
5e87a7b419aa0da21a6f95c4ab4c522a99499eae
da82228b00fbb29cd737fad5dbb77e733272068e
feb5f7b734bbca31fd8b183213e5ee554785debb
4ad2db92153e46c201c10c04c58da05a5814a9ca
68d6c5b75c0e7d4db7fe5b40abc361df43b5c6ee
f44f5edab2db509385ed44f71885658b013da268
5ad7616c71cf765936a7c68de6c36c66a3422dbf
e77ea12d312f1bec6ea6632e102777792c06de38
0b55381cb39da518649259c7337410e5103c33ce
c1d8da2dfb43a446096fd1a85a60a2637cfaaf25
e4dfd5b7a5d739140a608a8bf97c4bd494c81a86
31c0a667a9dd77d2900a4740eb00f1b7e6364573
62784dffa2034df2832bf75a55b841628c3a39da
1c3bb397c32649a70e81dde6debcc3bbc795003d
810347f43c1801684bd9c8a8870955efd1b178b1
0d5f7bc386cc56b348eff03fb2ce82f48c5f109b
969a08321437f401fb1df791c1fc9c3f1999431c
27d68db0c8baef440d16cecd69e333fa8b19e5a4
6f7da1d15b2487728481cd58e4731477184b431e
93a8fff5aba91d0f16a5a4aed987366329ce9f29
05a22d957048dfb0a2863ad4afa9c61a5ac36784
301b4e06c897e787dfd3cfa7108bad648845c42f
9a25a4a883f54fe49e7f0c8ea38bcc9e14bd3ee9
9f5a19ab8c377b4af7049e08805cf38c1bba2a57
866aeac7ad564908ac873f1b0edfd2dea8991ba2
32cdb221b260a3a1f644f6b8059a3b52c8a93bd8
9c892bd5c2b4f3e5fdb643f8c8fdd28ec91273f7
1d1f292d493f0c170268aaa6a348317c23843e4c
f229ad6c600d3f3e71891511019a1123b831d9e4
6bbc3d5b2b827ff3aaca9a11383c10f85d00124b
0d8c465b6d143e8ad4e677c0794c3dbcc6b8c260
ca1734e0abb69e0f9240cf3819b33c6e1490d0b5
abec793f3947f7350c4c5dd6baf8e8d541ade22f
83a8ccbfc35505ff2cf7be8cce333ed8d827b221
aa05c799625b014d1dc130037e20a91b2bb1b6a6
14544b868fa81103ea0edc8372a2a9b27cba3407
41c364cdf3a6161634aa8d6238e95e6a47103ac4
f93e1398aadce85a7e98d8f3c1cb6159612eba21
0d3f6bd37e9d33a8ea16b8bc5c7b7a716ae303e9
29a9e3255638b467263d63f488e592171d97daac
87c76c1574552fa2b5e57962867063ecab4cef42
28fb3e62f6822a7b7a311b5343f5fad90fa304f1
ec4c87c1ef183ec7122bb8e26909efdbf0dccf27
511016acbccf68c1a655847a1d3c76508c540b3c
4d7fd0fbac3c7aebf40deab98794007bd5473fe3
028d2d45fd3397d1227d4aa6acb3f205600e7843
a8559629589c8b5f2d6b9e12a9fc6a55539173ae
4e944734075c8f56d948d4dcc17e308184fa5e8a
f1d34a8189d5de0598ae0a0b1be20f984d04132c
d717e1659441d43e6b7a4d19c2b58b84b15de833
f8cdb930934c01de05a0f79a5c55d223322df842
374bba9b4c2b5befc03090703eb1d0c9ffd589a4
8dd99529c7fc449fdbe226f65ed5b2e7ee8db9a6
d3cbdf7ea9dcddf07dcd5d1f0767f30ebd3d7471
65dc8e72fdb406cb3d0b5c3f30ed657e792f5926
b026220b1258e69bc9dda13ab2ed69dfb0bb1614
95e2ed874568afbb0aaef45d2337e73a4365e64c
43eb0a609c347c4c5dd92b7294ef189164df620d
63498d99640ad0393ff8c5f78d24818e15e6110b
03bdd8d2ed9299ca6e1479c596f982e76cff3a7c
39f6859cf780c2fc064e9c9a9f81e27677bbc1de
0d124114a0e287f62892b2597509f269a646ae86
6b923b0ce813cff58e1e50d781becef34d2a591f
3b1ffcd5c3d53d9790d007136281ee45f06bf16f
e9d081df5ba29a0f9d183e83463d2ce7edc8238e
a679fc3977a5d3757ac121f1dfb77dd8800f2527
afe256138a0730f1e0e0ebc1f55d5f553596308c
a0aa402b40b62e9736236116945fe56c3476048d
9a8b47ecee111999621d78ee32dae3445ccea80a
1216d0f12b4b4321053fb28bf5b31cf3513fe60b
3a2534be7287d6f7821e4c2f4374d5a13660c8b9
c1f4dfd63892b38f4cdebc033742b75736b73c4f
e1714db9078f601d1841704713f39df7c2314c0a
2f999ad6e6ca4ab1939ba26824a4141965b5a309
cd2f0315df30328139652e24cbc80b7a78751a16
d36055a2e1d3e8565f876132597f07ab16f26120
7cce5120692451aeea4262b75ed9360cd2f3acbe
794fe211481bf6526997c033d145f2377b83e969
c7c790c7596d20f6974bd273b1d32aaec22fe53b
9351edffe37539212489395774b951fece3bee2a
deba9e5525021698713ca002c5bec47d9be89447
b64493233f98a0f9fd3f7439cae3dd1db4518226
a83e4bf894107ddb19db8397895040f4cdcb1055
b37e735622838fe48a7b2fb3b90c5d4685476c4f
```

#### G04: exact git log --branches --not --remotes output (IDs)

Queried at `E:/Warhammer/warhammer-v2-safety-20261017`. 55 commits; IDs only, no author/email metadata.

```text
b1d69da474754fe609f6f69b3fc52110f74aaca5
ca8567a1b0dd0afcb9b98af7bf2a729ed9037a1c
a316ff0c885eb8fbb1287ab4a9790e1b0dc30800
63e265a14b1139ff957048866ca1ae0c6b6d0c80
f8f82f3851f57cec1f8d08f714b1576e3195aa7b
82c5ad7bf1429eb0e4f5687d298d3c59de7c3aee
df80f6a312f55b0110352523ea0287da9ad76945
1af1d51f9c9b631b141aa161c4ca306140ba5677
ab41bb1feb784bd084970e2e84ee40c2f7e3a0ac
4edfabbda60b604b546884401541e97790d9afc8
6e4aa58e706f1f9b46ce2ae3f8476046db158c36
2d9e790c129cab7e3cba2271787f47ba231d5267
ee6387bed4483d44429249dcc9d9b5580cf2b80d
642684b4d1d33e97c75ee5a00e0aa542d1b9329d
045b747eab5c2b8f3ba2709a9fcaea5ae8aa758b
e94ca102e330863dc00db8c929366baa8dbf1b5a
c0ac0d890973d1dc5a8f9979bbb614ee8ebee7e2
872f1f8e5c86bfe2110df1ee6aa23e4416e56760
47495cc55debb652b3867c8fa558e496337bcb60
273b8bd3ce8ef5844e4c2518b61b4e6189e1ed8d
a56909db85b85161a6706db5accae0dc9f5b2432
3ec9f7ae7ba7d80d8af3b8bc328b776060910ed7
cfe07d09a5cbfb51f6f191ca790ba0c0edab5bf7
a318fc7a1d9313eaba9a43f59e9d6fbfc8367d2e
f977f123caba64ce62480ba23a26e9264db9d3bf
499d1d92cbb40ce1f6ecbb7c03463bd7f6993b0c
9e3284e9481d993f05058fb99ee9f37ec39708b0
f2bff38b382009844403abae2391b8f066d1ddef
05ef00be54d9f876cad262b324e8ba011e6d05d6
6d15477e5bfa12ca2a7fe7b75da68a82c685dd5b
9583a5a7521bf6f6002d5a1a76b1c148bcc2a280
20673f6d016378f8927550f38dbe866ae0f6599d
76022d87f3a123d681dad884e7a61ab9e8a8da9f
4a8b9a291d00c896e2c5574e6da9258435929ac0
54c89f610161a8bffbdada8588cc8bed27c0b2f5
72eef36eee0b9598051d5098a0150bc50800f37e
27e692ae16a88acc5565947f0deebafa95d33e66
6e6be74824deb64fd1a32762e9bc3f9b4ac68278
9c41816eb955af27b14f7ec75e1035b755ae09cf
bdd337317d7c4d906c773c0c1770e7efe78a76f5
70ccef5caef149283c7a67d526e9a2bdd4e704ea
05d354919d995240f98b06fdec4b03109c4aa39d
bfd04caea0b61f8f710cae581a500a68550371a7
210a6aab7ce54b734a32659778b9ce16a4524a99
f48545593ffdf2a8006a5acf71267845d4119958
76a48286685e8ec6762a9902f04b696f05c4dec2
32b9e0df9ace8dfeed43d09498d3225e43e40f05
f5d203d284bef742d5cbed720607cae3defe5cab
fe3f1d644ad77e6d0ea4cca1c4cfe2816f06400e
b61012d1a89d7eb0ae8f7ba883b34aa696a09a61
5b8c9d4940e3f70cc88b0a36b88274ed8f9de73c
b31acbe7e7219f3450bedb167d0933676dcfa482
94f34e416559817b871d434b5d2d232f9240332a
0be4e57ce47385d8ebecc268a151027742c659f7
b2a2a2d6f5e5f4e607e14f695aaff9b860ee13e0
```

#### G05: exact git log --branches --not --remotes output (IDs)

Queried at `E:/Warhammer/warhammer-v2-current`. 55 commits; IDs only, no author/email metadata.

```text
b1d69da474754fe609f6f69b3fc52110f74aaca5
ca8567a1b0dd0afcb9b98af7bf2a729ed9037a1c
a316ff0c885eb8fbb1287ab4a9790e1b0dc30800
63e265a14b1139ff957048866ca1ae0c6b6d0c80
f8f82f3851f57cec1f8d08f714b1576e3195aa7b
82c5ad7bf1429eb0e4f5687d298d3c59de7c3aee
df80f6a312f55b0110352523ea0287da9ad76945
1af1d51f9c9b631b141aa161c4ca306140ba5677
ab41bb1feb784bd084970e2e84ee40c2f7e3a0ac
4edfabbda60b604b546884401541e97790d9afc8
6e4aa58e706f1f9b46ce2ae3f8476046db158c36
2d9e790c129cab7e3cba2271787f47ba231d5267
ee6387bed4483d44429249dcc9d9b5580cf2b80d
642684b4d1d33e97c75ee5a00e0aa542d1b9329d
045b747eab5c2b8f3ba2709a9fcaea5ae8aa758b
e94ca102e330863dc00db8c929366baa8dbf1b5a
c0ac0d890973d1dc5a8f9979bbb614ee8ebee7e2
872f1f8e5c86bfe2110df1ee6aa23e4416e56760
47495cc55debb652b3867c8fa558e496337bcb60
273b8bd3ce8ef5844e4c2518b61b4e6189e1ed8d
a56909db85b85161a6706db5accae0dc9f5b2432
3ec9f7ae7ba7d80d8af3b8bc328b776060910ed7
cfe07d09a5cbfb51f6f191ca790ba0c0edab5bf7
a318fc7a1d9313eaba9a43f59e9d6fbfc8367d2e
f977f123caba64ce62480ba23a26e9264db9d3bf
499d1d92cbb40ce1f6ecbb7c03463bd7f6993b0c
9e3284e9481d993f05058fb99ee9f37ec39708b0
f2bff38b382009844403abae2391b8f066d1ddef
05ef00be54d9f876cad262b324e8ba011e6d05d6
6d15477e5bfa12ca2a7fe7b75da68a82c685dd5b
9583a5a7521bf6f6002d5a1a76b1c148bcc2a280
20673f6d016378f8927550f38dbe866ae0f6599d
76022d87f3a123d681dad884e7a61ab9e8a8da9f
4a8b9a291d00c896e2c5574e6da9258435929ac0
54c89f610161a8bffbdada8588cc8bed27c0b2f5
72eef36eee0b9598051d5098a0150bc50800f37e
27e692ae16a88acc5565947f0deebafa95d33e66
6e6be74824deb64fd1a32762e9bc3f9b4ac68278
9c41816eb955af27b14f7ec75e1035b755ae09cf
bdd337317d7c4d906c773c0c1770e7efe78a76f5
70ccef5caef149283c7a67d526e9a2bdd4e704ea
05d354919d995240f98b06fdec4b03109c4aa39d
bfd04caea0b61f8f710cae581a500a68550371a7
210a6aab7ce54b734a32659778b9ce16a4524a99
f48545593ffdf2a8006a5acf71267845d4119958
76a48286685e8ec6762a9902f04b696f05c4dec2
32b9e0df9ace8dfeed43d09498d3225e43e40f05
f5d203d284bef742d5cbed720607cae3defe5cab
fe3f1d644ad77e6d0ea4cca1c4cfe2816f06400e
b61012d1a89d7eb0ae8f7ba883b34aa696a09a61
5b8c9d4940e3f70cc88b0a36b88274ed8f9de73c
b31acbe7e7219f3450bedb167d0933676dcfa482
94f34e416559817b871d434b5d2d232f9240332a
0be4e57ce47385d8ebecc268a151027742c659f7
b2a2a2d6f5e5f4e607e14f695aaff9b860ee13e0
```

#### G13: exact git log --branches --not --remotes output (IDs)

Queried at `E:/Warhammer/qa-tmp/mfm-update-v1/warhammer-source-contract-B22n5D/work/tracked-inputs`. 1 commits; IDs only, no author/email metadata.

```text
815d10fe625bc30815a60ddb679424348ee81402
```

#### G14: exact git log --branches --not --remotes output (IDs)

Queried at `E:/Warhammer/qa-tmp/mfm-update-v1/warhammer-source-contract-B22n5D/work/capture-repo`. 1 commits; IDs only, no author/email metadata.

```text
2899bf7c4a25007a8ed4cde8af7130c029a5424f
```

#### G26: exact git log --branches --not --remotes output (IDs)

Queried at `E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-v3/checkout`. 1 commits; IDs only, no author/email metadata.

```text
b7c97a770a6b40de8d4f67f9a8e28513bc87ad21
```

#### G27: exact git log --branches --not --remotes output (IDs)

Queried at `E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-v2/checkout`. 1 commits; IDs only, no author/email metadata.

```text
4f0dfa841894d527776ae10d80083f2b4635f055
```

#### G28: exact git log --branches --not --remotes output (IDs)

Queried at `E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-final/checkout`. 1 commits; IDs only, no author/email metadata.

```text
e6ca478c9a4280940554976147f72b7ea2ce6591
```

### Dirty/untracked paths and checkout-local HEAD commits

These lists are evidence for retention, not a patch archive. No changed-file contents were copied or diffed. HEAD-only commits are listed because --branches alone can miss detached trial commits.

#### `E:/Warhammer/worktrees/v2-stage59-universal-pricing-be70d80b`

Porcelain status:
```text
M books/blood-angels/v2/generated/roster-import.json
 M books/blood-angels/v2/roster-import.mjs
 M books/blood-angels/v2/roster-paid-option-bindings-build.mjs
 M books/blood-angels/v2/roster-paid-options.mjs
 M books/chaos-space-marines/v2/roster-boot.mjs
 M books/chaos-space-marines/v2/roster-runtime.mjs
 M books/dark-angels/v2/generated/roster-import.json
 M books/dark-angels/v2/roster-import.mjs
 M books/dark-angels/v2/roster-paid-option-bindings-build.mjs
 M books/dark-angels/v2/roster-paid-options.mjs
 M books/emperors-children/v2/roster-boot.mjs
 M books/shared/roster-v2/context.mjs
 M books/shared/roster-v2/runtime.mjs
 M books/space-marines/v2/generated/roster-import.json
 M books/space-marines/v2/roster-import.mjs
 M books/space-marines/v2/roster-paid-option-bindings-build.mjs
 M books/space-marines/v2/roster-paid-options.mjs
 M books/tau-empire/v2/roster-boot.mjs
 M books/tau-empire/v2/roster-import.mjs
 M books/tyranids/v2/roster-boot.mjs
 M books/tyranids/v2/roster-points.mjs
?? books/shared/army-book-app-v2/generated/roster-pricing-catalog.mjs
?? books/shared/roster-v2/canonical-option-pricing-qa.mjs
?? books/shared/roster-v2/paid-options-qa.mjs
?? books/shared/roster-v2/paid-options.mjs
?? books/shared/roster-v2/points.mjs
?? books/shared/tools/build-roster-pricing-catalog.mjs
```

#### `E:/Warhammer/worktrees/safe-pwa-updates-0cbf20e5`

Porcelain status:
```text
M books/shared/offline-status.js
 M glossary/generated/cache-revision.js
 M service-worker.js
 M tests/cache-revision-portability-qa.mjs
 M tools/cache-revision.mjs
 M tools/pages-runtime-package.mjs
 M v2/app.html
?? tests/pwa-version-safety-qa.mjs
```

#### `E:/Warhammer/worktrees/preff-speedup-v1`

HEAD commits absent from remote-tracking refs:
```text
242fc764ca0890e10b3c7c2b6270291fa0b0a070
```

#### `E:/Warhammer/worktrees/generated-rebuild-gate-v1`

Porcelain status:
```text
?? "Claude outputs/handoff-2026-11-08-gpt.md"
?? "Claude outputs/plan-norma.md"
?? "Claude outputs/prompt-codex-cards-cosmetics.md"
```

#### `E:/Warhammer/worktrees/epic-hero-enhancements-v1`

HEAD commits absent from remote-tracking refs:
```text
f57e61f9c7fb2f30d1723479ed5257257eeb6235
3416606904b87af24c130fc3610051998244451d
e2a7740b57a2d72a57039526cfdd09962386159c
```

#### `E:/Warhammer/worktrees/core-b1-term-bindings-27eb38fe`

Porcelain status:
```text
?? "Claude outputs/unified-v2-cleanup-inventory.md"
?? "Claude outputs/v1-dependency-map-simple.md"
```

#### `E:/Warhammer/worktrees/backlog-triage-v1`

HEAD commits absent from remote-tracking refs:
```text
53cef239c49fc66fb00dd48bb4727088bf791e32
```

#### `E:/Warhammer/warhammer-w2-25-sm-facts`

HEAD commits absent from remote-tracking refs:
```text
27d68db0c8baef440d16cecd69e333fa8b19e5a4
```

#### `E:/Warhammer/warhammer-v2-safety-20261017`

Porcelain status:
```text
M books/emperors-children/v2/roster-import.mjs
 M v2/source-effect-regression-qa.mjs
 M v2/wargear-constraints-qa.mjs
 M v2/wargear-source-expectations.json
?? books/emperors-children/v2/wargear-constraints-qa.mjs
?? books/emperors-children/v2/wargear-constraints.json
?? books/emperors-children/v2/wargear-selections.mjs
```

HEAD commits absent from remote-tracking refs:
```text
b1d69da474754fe609f6f69b3fc52110f74aaca5
ca8567a1b0dd0afcb9b98af7bf2a729ed9037a1c
a316ff0c885eb8fbb1287ab4a9790e1b0dc30800
63e265a14b1139ff957048866ca1ae0c6b6d0c80
f8f82f3851f57cec1f8d08f714b1576e3195aa7b
82c5ad7bf1429eb0e4f5687d298d3c59de7c3aee
df80f6a312f55b0110352523ea0287da9ad76945
1af1d51f9c9b631b141aa161c4ca306140ba5677
ab41bb1feb784bd084970e2e84ee40c2f7e3a0ac
4edfabbda60b604b546884401541e97790d9afc8
6e4aa58e706f1f9b46ce2ae3f8476046db158c36
2d9e790c129cab7e3cba2271787f47ba231d5267
ee6387bed4483d44429249dcc9d9b5580cf2b80d
642684b4d1d33e97c75ee5a00e0aa542d1b9329d
045b747eab5c2b8f3ba2709a9fcaea5ae8aa758b
e94ca102e330863dc00db8c929366baa8dbf1b5a
c0ac0d890973d1dc5a8f9979bbb614ee8ebee7e2
872f1f8e5c86bfe2110df1ee6aa23e4416e56760
47495cc55debb652b3867c8fa558e496337bcb60
273b8bd3ce8ef5844e4c2518b61b4e6189e1ed8d
a56909db85b85161a6706db5accae0dc9f5b2432
3ec9f7ae7ba7d80d8af3b8bc328b776060910ed7
cfe07d09a5cbfb51f6f191ca790ba0c0edab5bf7
a318fc7a1d9313eaba9a43f59e9d6fbfc8367d2e
f977f123caba64ce62480ba23a26e9264db9d3bf
499d1d92cbb40ce1f6ecbb7c03463bd7f6993b0c
9e3284e9481d993f05058fb99ee9f37ec39708b0
f2bff38b382009844403abae2391b8f066d1ddef
05ef00be54d9f876cad262b324e8ba011e6d05d6
6d15477e5bfa12ca2a7fe7b75da68a82c685dd5b
9583a5a7521bf6f6002d5a1a76b1c148bcc2a280
20673f6d016378f8927550f38dbe866ae0f6599d
76022d87f3a123d681dad884e7a61ab9e8a8da9f
4a8b9a291d00c896e2c5574e6da9258435929ac0
54c89f610161a8bffbdada8588cc8bed27c0b2f5
72eef36eee0b9598051d5098a0150bc50800f37e
27e692ae16a88acc5565947f0deebafa95d33e66
6e6be74824deb64fd1a32762e9bc3f9b4ac68278
9c41816eb955af27b14f7ec75e1035b755ae09cf
bdd337317d7c4d906c773c0c1770e7efe78a76f5
70ccef5caef149283c7a67d526e9a2bdd4e704ea
05d354919d995240f98b06fdec4b03109c4aa39d
bfd04caea0b61f8f710cae581a500a68550371a7
210a6aab7ce54b734a32659778b9ce16a4524a99
f48545593ffdf2a8006a5acf71267845d4119958
76a48286685e8ec6762a9902f04b696f05c4dec2
32b9e0df9ace8dfeed43d09498d3225e43e40f05
f5d203d284bef742d5cbed720607cae3defe5cab
fe3f1d644ad77e6d0ea4cca1c4cfe2816f06400e
b61012d1a89d7eb0ae8f7ba883b34aa696a09a61
5b8c9d4940e3f70cc88b0a36b88274ed8f9de73c
b31acbe7e7219f3450bedb167d0933676dcfa482
94f34e416559817b871d434b5d2d232f9240332a
0be4e57ce47385d8ebecc268a151027742c659f7
b2a2a2d6f5e5f4e607e14f695aaff9b860ee13e0
```

#### `E:/Warhammer/warhammer-v2-recovery`

Porcelain status:
```text
?? books/chaos-space-marines/v2/__pycache__/model_sources.cpython-312.pyc
?? books/chaos-space-marines/v2/__pycache__/official_sources.cpython-312.pyc
?? books/chaos-space-marines/v2/__pycache__/source_nodes.cpython-312.pyc
```

#### `E:/Warhammer/warhammer-v2-current`

Porcelain status:
```text
M books/emperors-children/v2/roster-import.mjs
 M v2/source-effect-regression-qa.mjs
 M v2/wargear-constraints-qa.mjs
 M v2/wargear-source-expectations.json
?? books/emperors-children/v2/wargear-constraints-qa.mjs
?? books/emperors-children/v2/wargear-constraints.json
?? books/emperors-children/v2/wargear-selections.mjs
```

HEAD commits absent from remote-tracking refs:
```text
b1d69da474754fe609f6f69b3fc52110f74aaca5
ca8567a1b0dd0afcb9b98af7bf2a729ed9037a1c
a316ff0c885eb8fbb1287ab4a9790e1b0dc30800
63e265a14b1139ff957048866ca1ae0c6b6d0c80
f8f82f3851f57cec1f8d08f714b1576e3195aa7b
82c5ad7bf1429eb0e4f5687d298d3c59de7c3aee
df80f6a312f55b0110352523ea0287da9ad76945
1af1d51f9c9b631b141aa161c4ca306140ba5677
ab41bb1feb784bd084970e2e84ee40c2f7e3a0ac
4edfabbda60b604b546884401541e97790d9afc8
6e4aa58e706f1f9b46ce2ae3f8476046db158c36
2d9e790c129cab7e3cba2271787f47ba231d5267
ee6387bed4483d44429249dcc9d9b5580cf2b80d
642684b4d1d33e97c75ee5a00e0aa542d1b9329d
045b747eab5c2b8f3ba2709a9fcaea5ae8aa758b
e94ca102e330863dc00db8c929366baa8dbf1b5a
c0ac0d890973d1dc5a8f9979bbb614ee8ebee7e2
872f1f8e5c86bfe2110df1ee6aa23e4416e56760
47495cc55debb652b3867c8fa558e496337bcb60
273b8bd3ce8ef5844e4c2518b61b4e6189e1ed8d
a56909db85b85161a6706db5accae0dc9f5b2432
3ec9f7ae7ba7d80d8af3b8bc328b776060910ed7
cfe07d09a5cbfb51f6f191ca790ba0c0edab5bf7
a318fc7a1d9313eaba9a43f59e9d6fbfc8367d2e
f977f123caba64ce62480ba23a26e9264db9d3bf
499d1d92cbb40ce1f6ecbb7c03463bd7f6993b0c
9e3284e9481d993f05058fb99ee9f37ec39708b0
f2bff38b382009844403abae2391b8f066d1ddef
05ef00be54d9f876cad262b324e8ba011e6d05d6
6d15477e5bfa12ca2a7fe7b75da68a82c685dd5b
9583a5a7521bf6f6002d5a1a76b1c148bcc2a280
20673f6d016378f8927550f38dbe866ae0f6599d
76022d87f3a123d681dad884e7a61ab9e8a8da9f
4a8b9a291d00c896e2c5574e6da9258435929ac0
54c89f610161a8bffbdada8588cc8bed27c0b2f5
72eef36eee0b9598051d5098a0150bc50800f37e
27e692ae16a88acc5565947f0deebafa95d33e66
6e6be74824deb64fd1a32762e9bc3f9b4ac68278
9c41816eb955af27b14f7ec75e1035b755ae09cf
bdd337317d7c4d906c773c0c1770e7efe78a76f5
70ccef5caef149283c7a67d526e9a2bdd4e704ea
05d354919d995240f98b06fdec4b03109c4aa39d
bfd04caea0b61f8f710cae581a500a68550371a7
210a6aab7ce54b734a32659778b9ce16a4524a99
f48545593ffdf2a8006a5acf71267845d4119958
76a48286685e8ec6762a9902f04b696f05c4dec2
32b9e0df9ace8dfeed43d09498d3225e43e40f05
f5d203d284bef742d5cbed720607cae3defe5cab
fe3f1d644ad77e6d0ea4cca1c4cfe2816f06400e
b61012d1a89d7eb0ae8f7ba883b34aa696a09a61
5b8c9d4940e3f70cc88b0a36b88274ed8f9de73c
b31acbe7e7219f3450bedb167d0933676dcfa482
94f34e416559817b871d434b5d2d232f9240332a
0be4e57ce47385d8ebecc268a151027742c659f7
b2a2a2d6f5e5f4e607e14f695aaff9b860ee13e0
```

#### `E:/Warhammer/warhammer-rules-dg-v2`

Porcelain status:
```text
M books/death-guard/book.config.json
 M books/death-guard/reader.html
 M books/death-guard/scripts/app.js
 M books/death-guard/scripts/target-data.js
 M books/death-guard/tools/presentation-hook.mjs
 M books/shared/army-book-app.js
 M books/shared/tools/build-army-book.mjs
?? books/death-guard/v2/generated/presentation.js
?? books/death-guard/v2/generated/presentation.json
?? books/death-guard/v2/generated/related-rules.inc
?? books/death-guard/v2/presentation-bindings.json
?? books/death-guard/v2/presentation-browser-qa.mjs
?? books/death-guard/v2/presentation-projection.mjs
?? books/death-guard/v2/presentation-qa.mjs
?? books/death-guard/v2/presentation-runtime.js
?? books/death-guard/v2/publication-build.mjs
```

#### `E:/Warhammer/warhammer-rules-dg-v1-navigation-port`

HEAD commits absent from remote-tracking refs:
```text
078de95d5ba6337c68fa68f99fa73d5ab22d4a8c
fb217cb405cf65eefb4cf9c72affd32441ffdce6
14916f21f04037cbc1663312354968fbf1138f08
9a952c7c6e0d866677eb48897b5a4b32bc207682
a3537d83be097a5d61cae285a25dc8a8a52ecb7b
9439c9cc93da26ad916f9ce6941905e0619c5adc
ca5ce40c497901a6f105bf106decfd18547ed293
7ad3a2a5e3b3cf0b59534d0982730ba8a3e46237
5e87a7b419aa0da21a6f95c4ab4c522a99499eae
da82228b00fbb29cd737fad5dbb77e733272068e
feb5f7b734bbca31fd8b183213e5ee554785debb
4ad2db92153e46c201c10c04c58da05a5814a9ca
68d6c5b75c0e7d4db7fe5b40abc361df43b5c6ee
f44f5edab2db509385ed44f71885658b013da268
5ad7616c71cf765936a7c68de6c36c66a3422dbf
e77ea12d312f1bec6ea6632e102777792c06de38
0b55381cb39da518649259c7337410e5103c33ce
```

#### `E:/Warhammer/warhammer-rules-complete-preview`

Porcelain status:
```text
M books/adeptus-mechanicus/scripts/roster-data.js
 M books/adeptus-mechanicus/sources/adeptus-mechanicus-effect-contracts.v1.json
 M books/chaos-space-marines/scripts/roster-data.js
 M books/chaos-space-marines/sources/chaos-space-marines-effect-contracts.v1.json
 M books/death-guard/scripts/roster-data.js
 M books/death-guard/sources/death-guard-effect-contracts.v1.json
 M books/emperors-children/scripts/roster-data.js
 M books/emperors-children/sources/emperors-children-effect-contracts.v1.json
 M books/shared/effect-contract-runtime.js
 M books/tau-empire/scripts/roster-data.js
 M books/tau-empire/sources/tau-empire-effect-contracts.v1.json
 M books/tyranids/scripts/roster-data.js
 M books/tyranids/sources/tyranids-effect-contracts.v1.json
?? tests/browser/group-selector-source.mjs
?? tests/fixtures/group-selector-source.json
?? tests/group-selector-source-qa.mjs
?? tests/helpers/group-selector-controls.mjs
```

#### `E:/Warhammer/warhammer-final-test-cleanup`

Porcelain status:
```text
M tests/browser/dg-final-conformance.mjs
 M tests/browser/dg-tainted-narthecium.mjs
 M tests/tau-synergy-semantic-qa.mjs
```

#### `E:/Warhammer/qa-tmp/official-updates-v1/tyranids-trial-guard-diagnostic/checkout`

Porcelain status:
```text
M books/tyranids/v2/generated/app-presentation.json
 M books/tyranids/v2/generated/effective.json
 M books/tyranids/v2/generated/roster-import.json
 M books/tyranids/v2/generated/roster-runtime.json
 M books/tyranids/v2/generated/rule-contracts.json
```

HEAD commits absent from remote-tracking refs:
```text
ed55e7edebd8bc0f01eb6317b76c1dcec100da47
```

#### `E:/Warhammer/qa-tmp/official-updates-v1/trials-final/tyranids/checkout`

HEAD commits absent from remote-tracking refs:
```text
ed55e7edebd8bc0f01eb6317b76c1dcec100da47
```

#### `E:/Warhammer/qa-tmp/official-updates-v1/trials-final/death-guard/checkout`

HEAD commits absent from remote-tracking refs:
```text
b0df1b458ae0c136ac7cd1501410a7b364554a1d
414dedfb2df87e183fadf2c3065b3dd2356745bd
8bdd21e282b13eed784696b742957b2f848c4664
```

#### `E:/Warhammer/qa-tmp/official-updates-v1/trials-approved-5bc26d82/tyranids/checkout`

Porcelain status:
```text
M books/shared/source-refs-v2/source-catalog.json
 M books/tyranids/v2/generated/app-presentation.json
 M books/tyranids/v2/generated/effective.json
 M books/tyranids/v2/generated/roster-import.json
 M books/tyranids/v2/generated/roster-runtime.json
 M books/tyranids/v2/generated/rule-contracts.json
 M glossary/v2/generated/index.en.js
 M glossary/v2/generated/index.en.json
```

HEAD commits absent from remote-tracking refs:
```text
a6d5a0e59ae3fd2b5c896193e39ff26b90020cc6
1adbfb5398afe0fb2a891eff95c63c5016e001f9
```

#### `E:/Warhammer/qa-tmp/mfm-update-v1/wh-mfm-update-LuGjf2/work/checkout`

Porcelain status:
```text
M .gitattributes
 M .github/workflows/pages-runtime.yml
 M .gitignore
 M AGENTS.md
 M README.md
 M books/SOURCE_INGESTION.md
 M books/adeptus-mechanicus/AGENTS.md
 M books/adeptus-mechanicus/README.md
 M books/adeptus-mechanicus/book.config.json
 M books/adeptus-mechanicus/docs/SPEC_NAVIGATION.md
 M books/adeptus-mechanicus/docs/SPEC_POPUPS.md
 M books/adeptus-mechanicus/docs/VISUAL_CONTRACT_V2.md
 M books/adeptus-mechanicus/sources/bsdata-adeptus-mechanicus.cat
 M books/adeptus-mechanicus/sources/source-manifest.json
 M books/adeptus-mechanicus/tests/codex-parity.cjs
 M books/adeptus-mechanicus/tests/datasheet-parity.cjs
 M books/adeptus-mechanicus/tests/runtime-smoke.cjs
 M books/adeptus-mechanicus/tools/extract-codex-rules.cjs
 M books/adeptus-mechanicus/tools/extract-wargear.cjs
 M books/adeptus-mechanicus/v2/.gitattributes
 M books/blood-angels/book.config.json
 M books/blood-angels/sources/source-manifest.json
 M books/blood-angels/v2/README.md
 M books/blood-angels/v2/book-build.mjs
 M books/blood-angels/v2/generated/app-presentation.json
 M books/blood-angels/v2/generated/gameplay-presentation.json
 M books/blood-angels/v2/generated/mfm-coverage.json
 M books/blood-angels/v2/generated/mfm-presentation.json
 M books/blood-angels/v2/generated/mixed-owner-book.json
 M books/blood-angels/v2/generated/mixed-owner-points.json
 M books/blood-angels/v2/generated/mixed-owner-presentation.json
 M books/blood-angels/v2/generated/native-mfm-book.json
 M books/blood-angels/v2/generated/roster-import.json
 M books/blood-angels/v2/generated/roster-runtime.json
 M books/blood-angels/v2/mfm-boundary.mjs
 M books/blood-angels/v2/roster-paid-option-bindings-build.mjs
 M books/blood-angels/v2/roster-paid-options.mjs
 M books/blood-angels/v2/roster-qa.mjs
 M books/chaos-space-marines/book.config.json
 M books/chaos-space-marines/sources/source-manifest.json
 M books/chaos-space-marines/tools/extract-mfm.cjs
 M books/chaos-space-marines/v2/README.md
 M books/core-rules/CURRENTNESS_2026-09-19.md
 M books/core-rules/CURRENTNESS_2026-09-20.md
 M books/core-rules/EFFECTIVE_CORE_CONTRACT.md
 M books/dark-angels/book.config.json
 M books/dark-angels/sources/source-manifest.json
 M books/dark-angels/v2/book-build.mjs
 M books/dark-angels/v2/generated/app-presentation.json
 M books/dark-angels/v2/generated/gameplay-presentation.json
 M books/dark-angels/v2/generated/mfm-coverage.json
 M books/dark-angels/v2/generated/mfm-presentation.json
 M books/dark-angels/v2/generated/mixed-owner-book.json
 M books/dark-angels/v2/generated/mixed-owner-points.json
 M books/dark-angels/v2/generated/mixed-owner-presentation.json
 M books/dark-angels/v2/generated/native-mfm-book.json
 M books/dark-angels/v2/generated/roster-import.json
 M books/dark-angels/v2/generated/roster-runtime.json
 M books/dark-angels/v2/mfm-boundary.mjs
 M books/dark-angels/v2/roster-import-qa.mjs
 M books/dark-angels/v2/roster-paid-option-bindings-build.mjs
 M books/dark-angels/v2/roster-paid-options.mjs
 M books/death-guard/AGENTS.md
 M books/death-guard/book.config.json
 M books/death-guard/docs/SPEC_NAVIGATION.md
 M books/death-guard/docs/SPEC_POPUPS.md
 M books/death-guard/docs/TEST_REPORT.md
 M books/death-guard/docs/VISUAL_CONTRACT_V2.md
 M books/death-guard/sources/source-manifest.json
 M books/death-guard/v2/.gitattributes
 M books/death-guard/v2/APP_V2.md
 M books/death-guard/v2/README.md
 M books/death-guard/v2/ROSTER_V2.md
 M books/death-guard/v2/build.mjs
 M books/death-guard/v2/generated/app-presentation.json
 M books/death-guard/v2/generated/comparison.json
 M books/death-guard/v2/generated/effective.json
 M books/death-guard/v2/generated/rule-contract-effective.json
 M books/death-guard/v2/overlay-engine.mjs
 M books/emperors-children/book.config.json
 M books/emperors-children/sources/source-manifest.json
 M books/emperors-children/v2/app-build.mjs
 M books/emperors-children/v2/mfm-boundary.mjs
 M books/emperors-children/v2/roster-attachment-qa.mjs
 M books/emperors-children/v2/roster-import.mjs
 M books/shared/AGENTS.md
 M books/shared/application-v2/README.md
 M books/shared/army-book-app-v2/LIFECYCLE.md
 M books/shared/army-book-app-v2/README.md
 M books/shared/army-book-app-v2/ROUTE_CONTEXT_CONTRACT.md
 M books/shared/roster-v2/PHYSICAL_BEHAVIOR_CONTRACT.md
 M books/shared/tools/book-passport.mjs
 M books/shared/tools/effective-mfm-army-projection.mjs
 M books/shared/tools/source-enrollment-contract.mjs
 M books/source-ingestion-contract.json
 M books/space-marines/AGENTS.md
 M books/space-marines/book.config.json
 M books/space-marines/sources/source-manifest.json
 M books/space-marines/tools/extract-codex-details.cjs
 M books/space-marines/v2/generated/app-presentation.json
 M books/space-marines/v2/generated/deathwatch-mfm-presentation.json
 M books/space-marines/v2/generated/gameplay-presentation.json
 M books/space-marines/v2/generated/mfm-coverage.json
 M books/space-marines/v2/generated/mfm-presentation.json
 M books/space-marines/v2/generated/native-mfm-book.json
 M books/space-marines/v2/generated/roster-import.json
 M books/space-marines/v2/generated/roster-runtime.json
 M books/space-marines/v2/mfm-boundary.mjs
 M books/space-marines/v2/mfm-build.mjs
 M books/space-marines/v2/roster-import-qa.mjs
 M books/space-marines/v2/roster-paid-option-bindings-build.mjs
 M books/space-marines/v2/roster-paid-options.mjs
 M books/tau-empire/book.config.json
 M books/tau-empire/sources/source-manifest.json
 M books/tau-empire/tools/extract-codex-parity.cjs
 M books/tau-empire/tools/extract-mfm.cjs
 M books/tau-empire/tools/extract-wargear.cjs
 M books/tau-empire/v2/app-build.mjs
 M books/tau-empire/v2/mfm-boundary.mjs
 M books/tyranids/book.config.json
 M books/tyranids/sources/source-manifest.json
 M books/tyranids/tests/codex-source-parity.cjs
 M books/tyranids/tools/extract-codex-parity.cjs
 M books/tyranids/tools/extract-wargear.cjs
 M books/tyranids/v2/README.md
 M books/tyranids/v2/app-build.mjs
 M books/tyranids/v2/generated/app-presentation.json
 M books/tyranids/v2/generated/roster-import.json
 M books/tyranids/v2/generated/roster-runtime.json
 M books/tyranids/v2/generated/rule-contracts.json
 M books/tyranids/v2/mfm-boundary.mjs
 M books/tyranids/v2/roster-import-qa.mjs
 M books/tyranids/v2/roster-import.mjs
 M books/tyranids/v2/roster-points.mjs
 M books/tyranids/v2/rule-contract-build.mjs
 M docs/ARMY_BOOK_BLUEPRINT.md
 M docs/COMPATIBLE_RULES_SOURCE_PIPELINE.md
 M docs/PRODUCT_STRUCTURE.md
 M docs/PROJECT_SOURCE_OF_TRUTH.md
 M docs/TRACKER.md
 M docs/audit/cards-cosmetics-v1.md
 M docs/audit/compatible-related-panel-v1.md
 M docs/audit/condition-translation-2.md
 M docs/audit/new-recruit-export-import-v1.md
 M docs/audit/new-recruit-model-names-v1.md
 M docs/audit/new-recruit-plain-header-v1.md
 M docs/audit/rule-encoding-census.md
 M docs/audit/sm-da-recipient-gaps-v1.md
 M docs/audit/source-producer-reconfirmation.md
 M docs/audit/source-reader-migration.md
 M docs/audit/source-reference-closure.md
 M docs/audit/source-refs-final-validation.md
 M docs/audit/source-refs-optimization.md
 M docs/audit/source-refs-translation-3.md
 M docs/audit/test-hygiene-1.md
 M docs/audit/test-hygiene-2.md
 M docs/audit/tyranids-ec-rule-coverage-v1.md
 M docs/certification/ADEPTUS_MECHANICUS_WAHA_CONTENT_CERTIFICATION.md
 M docs/certification/CHAOS_SPACE_MARINES_WAHA_CONTENT_CERTIFICATION.md
 M docs/certification/CORE_WAHA_CONTENT_CERTIFICATION.md
 M docs/certification/DEATH_GUARD_WAHA_CONTENT_CERTIFICATION.md
 M docs/certification/EMPERORS_CHILDREN_WAHA_CONTENT_CERTIFICATION.md
 M docs/certification/TAU_EMPIRE_WAHA_CONTENT_CERTIFICATION.md
 M docs/certification/TYRANIDS_WAHA_CONTENT_CERTIFICATION.md
 M docs/codex/PROMPTS.md
 M docs/codex/QA_MATRIX.md
 M docs/codex/REPO_MAP.md
 M docs/codex/ROSTER_SERVICE_LIFECYCLE.md
 M docs/codex/V2_RULE_PRESENTATION_CONTRACT.md
 M docs/codex/V2_SOURCE_REVIEW.md
 M docs/codex/WORKFLOW.md
 M docs/data-ownership.md
 M docs/rules-universe/RULES_UNIVERSE_2026-09-22.md
 M docs/rules-universe/STANDARD_MISSIONS_SOURCE_ACQUISITION_2026-09-22.md
 M docs/rules/conditions.md
 M docs/rules/recipients.md
 M docs/rules/source-refs.md
 M glossary/AGENTS.md
 M glossary/README.md
 M glossary/SPEC_GLOBAL_GLOSSARY.md
 M glossary/v2/GLOSSARY_V2_CONTRACT.md
 M glossary/v2/content/glossary-v2-index.mjs
 M mfm/MFM_DOMAIN_CONTRACT.md
 M mfm/content/canonical-mfm-facts.mjs
 M mfm/content/effective-mfm-catalog.mjs
 M mfm/content/mfm-model-contract.mjs
 M missions/MISSION_DOMAIN_CONTRACT.md
 M package.json
 M pnpm-lock.yaml
 M tests/helpers/qa-browser.cjs
 M tests/helpers/qa-python.cjs
 M tests/helpers/qa-temp.cjs
 M tests/source-enrollment-qa.mjs
 M tests/source-ingestion-contract-qa.mjs
 M tools/PAGES_RUNTIME_RELEASE.md
 M v2/core-reader-browser-qa.mjs
?? books/shared/tools/mfm-capture.mjs
?? books/shared/tools/mfm-dom.mjs
?? books/shared/tools/mfm-release-cli.mjs
?? books/shared/tools/mfm-release-update.mjs
?? mfm/capture/owner-scope.json
?? mfm/capture/replay-v1.6.json
?? mfm/content/current-mfm-release.mjs
?? mfm/content/mfm-v1.7-army-mission-bindings.json
?? mfm/content/mfm-v1.7-scoped.identity-registry.json
?? mfm/current.json
?? mfm/releases.json
?? mfm/releases/v1.7/REPORT.md
?? mfm/releases/v1.7/capture.json
?? mfm/sources/v1.7/adeptus-mechanicus-legends.html
?? mfm/sources/v1.7/adeptus-mechanicus.html
?? mfm/sources/v1.7/adeptus-mechanicus.json
?? mfm/sources/v1.7/blood-angels.json
?? mfm/sources/v1.7/chaos-space-marines-legends.html
?? mfm/sources/v1.7/chaos-space-marines.html
?? mfm/sources/v1.7/chaos-space-marines.json
?? mfm/sources/v1.7/csm-khorne-berzerkers.html
?? mfm/sources/v1.7/csm-khorne-berzerkers.json
?? mfm/sources/v1.7/csm-rubric-marines.html
?? mfm/sources/v1.7/csm-rubric-marines.json
?? mfm/sources/v1.7/dark-angels.json
?? mfm/sources/v1.7/death-guard-legends.html
?? mfm/sources/v1.7/death-guard.html
?? mfm/sources/v1.7/death-guard.json
?? mfm/sources/v1.7/emperors-children.html
?? mfm/sources/v1.7/emperors-children.json
?? mfm/sources/v1.7/official-mfm-ba-hydrated.html
?? mfm/sources/v1.7/official-mfm-da-hydrated.html
?? mfm/sources/v1.7/official-mfm-sm-hydrated.html
?? mfm/sources/v1.7/space-marines.json
?? mfm/sources/v1.7/tau-empire-legends.html
?? mfm/sources/v1.7/tau-empire.html
?? mfm/sources/v1.7/tau-empire.json
?? mfm/sources/v1.7/tyranids-legends.html
?? mfm/sources/v1.7/tyranids.html
?? mfm/sources/v1.7/tyranids.json
?? tests/helpers/mfm-release-expectations.mjs
?? tests/mfm-release-history-qa.mjs
?? tests/mfm-update-qa.mjs
```

#### `E:/Warhammer/qa-tmp/mfm-update-v1/warhammer-source-contract-B22n5D/work/tracked-inputs`

Porcelain status:
```text
M input.json
?? untracked.json
```

HEAD commits absent from remote-tracking refs:
```text
815d10fe625bc30815a60ddb679424348ee81402
```

#### `E:/Warhammer/qa-tmp/mfm-update-v1/warhammer-source-contract-B22n5D/work/capture-repo`

HEAD commits absent from remote-tracking refs:
```text
2899bf7c4a25007a8ed4cde8af7130c029a5424f
```

#### `E:/Warhammer/qa-tmp/core-rules-refresh-v1-source-catalog-baseline-write`

Porcelain status:
```text
M books/blood-angels/v2/generated/roster-import.json
 M books/dark-angels/v2/generated/roster-import.json
 M books/emperors-children/v2/generated/roster-attachments.json
 M books/emperors-children/v2/generated/roster-import.json
 M books/emperors-children/v2/generated/rule-contracts.json
 M books/shared/source-refs-v2/source-catalog.json
 M books/space-marines/v2/generated/roster-import.json
 M books/tau-empire/v2/generated/roster-import.json
```

#### `E:/Warhammer/qa-tmp/core-rules-refresh-v1-registry-u6-recovery`

Porcelain status:
```text
M .gitattributes
 M books/adeptus-mechanicus/v2/generated/app-presentation.json
 M books/adeptus-mechanicus/v2/generated/roster-runtime.json
 M books/blood-angels/v2/conditional-policy-declarations.mjs
 M books/blood-angels/v2/generated/app-presentation.json
 M books/blood-angels/v2/generated/gameplay-presentation.json
 M books/blood-angels/v2/generated/roster-import.json
 M books/blood-angels/v2/generated/roster-runtime.json
 M books/chaos-space-marines/v2/generated/app-presentation.json
 M books/core-rules/content/core-effective-bindings.v1.json
 M books/core-rules/content/core-fact-projection.mjs
 M books/core-rules/content/core-identities.v1.json
 M books/core-rules/content/core-official-source-registry.en.json
 M books/core-rules/content/core-rules.digital-11e.json
 M books/core-rules/content/effective-core-catalog.mjs
 M books/core-rules/content/waha-core-source.mjs
 M books/core-rules/reader/actions.html
 M books/core-rules/reader/aircraft.html
 M books/core-rules/reader/attached-units.html
 M books/core-rules/reader/attack-sequence.html
 M books/core-rules/reader/battle-round-overview.html
 M books/core-rules/reader/build.mjs
 M books/core-rules/reader/charge-phase.html
 M books/core-rules/reader/command-phase.html
 M books/core-rules/reader/core-abilities.html
 M books/core-rules/reader/core-concepts.html
 M books/core-rules/reader/datasheets.html
 M books/core-rules/reader/fight-phase.html
 M books/core-rules/reader/flying-surging.html
 M books/core-rules/reader/index.html
 M books/core-rules/reader/introduction.html
 M books/core-rules/reader/making-attacks.html
 M books/core-rules/reader/monsters-vehicles.html
 M books/core-rules/reader/movement-phase.html
 M books/core-rules/reader/moving.html
 M books/core-rules/reader/muster-armies.html
 M books/core-rules/reader/objectives.html
 M books/core-rules/reader/other-concepts.html
 M books/core-rules/reader/other-rules-abilities.html
 M books/core-rules/reader/presentation-bindings.json
 M books/core-rules/reader/search-index.json
 M books/core-rules/reader/shooting-phase.html
 M books/core-rules/reader/stratagems.html
 M books/core-rules/reader/strategic-reserves.html
 M books/core-rules/reader/terrain.html
 M books/core-rules/reader/transports.html
 M books/core-rules/tests/core-waha-certification-qa.mjs
 M books/core-rules/tests/core-waha-player-visible-reference-census-qa.mjs
 M books/core-rules/tests/core-waha-source-corpus-qa.mjs
 M books/core-rules/tests/effective-catalog-qa.mjs
 M books/core-rules/tests/fact-provenance-qa.mjs
 M books/core-rules/tests/factual-ownership-browser-qa.mjs
 M books/core-rules/tests/factual-ownership-qa.mjs
 M books/core-rules/tests/source-node-ingestion-qa.mjs
 M books/core-rules/tools/clean_digital_records.mjs
 M books/core-rules/tools/import_wahapedia_11e.py
 M books/dark-angels/v2/generated/app-presentation.json
 M books/dark-angels/v2/generated/gameplay-presentation.json
 M books/dark-angels/v2/generated/roster-import.json
 M books/dark-angels/v2/generated/roster-runtime.json
 M books/death-guard/v2/generated/app-presentation.json
 M books/death-guard/v2/generated/compatibility-v2.json
 M books/death-guard/v2/generated/glossary-v2.json
 M books/emperors-children/v2/generated/app-presentation.json
 M books/emperors-children/v2/generated/roster-attachments.json
 M books/emperors-children/v2/generated/rule-contracts.json
 M books/shared/army-book-app-v2/glossary.mjs
 M books/shared/source-refs-v2/source-catalog.json
 M books/shared/tools/generated-rebuild-plan.mjs
 M books/space-marines/v2/generated/app-presentation.json
 M books/space-marines/v2/generated/gameplay-presentation.json
 M books/space-marines/v2/generated/roster-import.json
 M books/space-marines/v2/generated/roster-runtime.json
 M books/space-marines/v2/generated/rule-contracts.json
 M books/space-marines/v2/static-gameplay-qa.mjs
 M books/tau-empire/v2/generated/app-presentation.json
 M books/tau-empire/v2/generated/roster-import.json
 M books/tyranids/v2/generated/app-presentation.json
 M books/tyranids/v2/generated/roster-runtime.json
 M glossary/v2/generated/index.en.js
 M glossary/v2/generated/index.en.json
 M glossary/v2/tests/core-projection-qa.mjs
 M tests/am-datasheet-source-ownership-qa.mjs
 M tools/audit/build-source-catalog.mjs
 M tools/qa-queue.mjs
 M v2/fixtures/related-panel.json
 M v2/related-panel-qa.mjs
?? books/core-rules/sources/waha-core-2026-11-11/capture.json
?? books/core-rules/sources/waha-core-2026-11-11/core-rules.html
?? books/core-rules/sources/waha-core-2026-11-11/known-source-defects.v1.json
?? books/core-rules/sources/waha-core-2026-11-11/rules-appendix.html
?? books/core-rules/sources/waha-core-2026-11-11/source-identities.v1.json
?? books/core-rules/sources/waha-core-2026-11-11/waha-core-corpus.manifest.json
?? books/core-rules/sources/waha-core-2026-11-11/waha-core-corpus.v1.json
?? books/core-rules/sources/waha-core-2026-11-11/waha-core-player-visible-reference-census.v1.json
?? books/core-rules/tests/fixtures/core-refresh-2026-11-11-baseline.json
?? books/core-rules/tests/fixtures/core-refresh-unnumbered-coverage.json
?? books/core-rules/tools/build_waha_core_corpus.py
?? tests/helpers/core-publication-boundary.mjs
?? tests/source-catalog-registry-qa.mjs
```

#### `E:/Warhammer/qa-tmp/core-rules-refresh-v1-registry-u6-baseline`

Porcelain status:
```text
M tools/audit/build-source-catalog.mjs
```

#### `E:/Warhammer/qa-tmp/core-rules-refresh-v1-baseline-949d98f`

Porcelain status:
```text
?? books/core-rules/tests/digital-source-boundary-qa.mjs
```

#### `E:/Warhammer/qa-tmp/book-update-command-v1/wh-book-update-WVLHxS/work/checkout`

Porcelain status:
```text
D books/blood-angels/v2/generated/roster-runtime.json
 D books/blood-angels/v2/generated/rule-contracts.json
 M books/shared/tools/book-update.mjs
 M books/space-marines/v2/roster-import-qa.mjs
 M tests/book-update-command-qa.mjs
```

#### `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-yRGrgn/checkout`

Porcelain status:
```text
M books/shared/source-refs-v2/source-catalog.json
 M books/space-marines/v2/generated/app-presentation.json
```

HEAD commits absent from remote-tracking refs:
```text
1489cae98ecd3c1ae4eba02a986689818eb3e3fa
```

#### `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-wnwCOx/checkout`

Porcelain status:
```text
M books/adeptus-mechanicus/v2/generated/app-presentation.json
 M books/blood-angels/v2/generated/app-presentation.json
 M books/blood-angels/v2/generated/gameplay-presentation.json
 M books/blood-angels/v2/generated/mfm-coverage.json
 M books/blood-angels/v2/generated/mfm-presentation.json
 M books/blood-angels/v2/generated/mixed-owner-book.json
 M books/blood-angels/v2/generated/mixed-owner-points.json
 M books/blood-angels/v2/generated/mixed-owner-presentation.json
 M books/blood-angels/v2/generated/native-mfm-book.json
 M books/blood-angels/v2/generated/roster-import.json
 M books/blood-angels/v2/generated/roster-runtime.json
 M books/dark-angels/v2/generated/app-presentation.json
 M books/dark-angels/v2/generated/gameplay-presentation.json
 M books/dark-angels/v2/generated/mfm-coverage.json
 M books/dark-angels/v2/generated/mfm-presentation.json
 M books/dark-angels/v2/generated/mixed-owner-book.json
 M books/dark-angels/v2/generated/mixed-owner-points.json
 M books/dark-angels/v2/generated/mixed-owner-presentation.json
 M books/dark-angels/v2/generated/native-mfm-book.json
 M books/dark-angels/v2/generated/roster-import.json
 M books/dark-angels/v2/generated/roster-runtime.json
 M books/death-guard/v2/generated/app-presentation.json
 M books/death-guard/v2/generated/comparison.json
 M books/death-guard/v2/generated/effective.json
 M books/death-guard/v2/generated/rule-contract-effective.json
 M books/emperors-children/v2/generated/app-presentation.json
 M books/emperors-children/v2/generated/base.json
 M books/emperors-children/v2/generated/effective.json
 M books/emperors-children/v2/generated/roster-attachments.json
 M books/emperors-children/v2/generated/roster-import.json
 M books/emperors-children/v2/generated/rule-contracts.json
 M books/emperors-children/v2/text-rule-review.json
 M books/shared/source-refs-v2/source-catalog.json
 M books/space-marines/v2/generated/app-presentation.json
 M books/space-marines/v2/generated/cross-owner-references.json
 M books/space-marines/v2/generated/deathwatch-mfm-presentation.json
 M books/space-marines/v2/generated/deathwatch-presentation.json
 M books/space-marines/v2/generated/gameplay-presentation.json
 M books/space-marines/v2/generated/mfm-coverage.json
 M books/space-marines/v2/generated/mfm-presentation.json
 M books/space-marines/v2/generated/native-mfm-book.json
 M books/space-marines/v2/generated/roster-import.json
 M books/space-marines/v2/generated/roster-runtime.json
 M books/tau-empire/v2/generated/app-presentation.json
 M books/tau-empire/v2/generated/base.json
 M books/tau-empire/v2/generated/effective.json
 M books/tau-empire/v2/generated/roster-import.json
 M books/tau-empire/v2/generated/rule-contracts.json
 M books/tau-empire/v2/rule-clause-review.json
 M books/tyranids/v2/generated/app-presentation.json
 M books/tyranids/v2/generated/base.json
 M books/tyranids/v2/generated/effective.json
 M books/tyranids/v2/generated/roster-import.json
 M books/tyranids/v2/generated/roster-runtime.json
 M books/tyranids/v2/generated/rule-contracts.json
 M books/tyranids/v2/text-rule-review.json
 M glossary/v2/generated/index.en.js
 M glossary/v2/generated/index.en.json
```

HEAD commits absent from remote-tracking refs:
```text
12c14caeef64f5a83c5d3c2dd796ef1922d19c1f
```

#### `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-ufMFO6/checkout`

Porcelain status:
```text
M books/tau-empire/v2/generated/app-presentation.json
 M books/tau-empire/v2/generated/base.json
 M books/tau-empire/v2/generated/effective.json
 M books/tau-empire/v2/generated/roster-import.json
 M books/tau-empire/v2/generated/rule-contracts.json
 M books/tau-empire/v2/rule-clause-review.json
```

HEAD commits absent from remote-tracking refs:
```text
ef9a6f8c4c1c2367e4a5a8e389467b5c05c05fde
```

#### `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-sugJ53/checkout`

Porcelain status:
```text
M books/blood-angels/v2/roster-qa.mjs
 M books/emperors-children/v2/app-qa.mjs
 M books/emperors-children/v2/roster-import-qa.mjs
 M books/space-marines/v2/app-qa.mjs
 M books/space-marines/v2/generated/app-presentation.json
 M books/space-marines/v2/generated/deathwatch-mfm-presentation.json
 M books/space-marines/v2/generated/mfm-coverage.json
 M books/space-marines/v2/generated/mfm-presentation.json
 M books/space-marines/v2/generated/native-mfm-book.json
 M books/space-marines/v2/generated/roster-import.json
 M books/tau-empire/v2/app-qa.mjs
 M books/tyranids/v2/app-qa.mjs
 M books/tyranids/v2/roster-import-qa.mjs
 M tests/book-update-report-qa.mjs
 M tests/book-update-snapshots-qa.mjs
 M v2/wardens-source-binding-qa.mjs
```

HEAD commits absent from remote-tracking refs:
```text
6ae35ce7f9753a76b3b31face3419d876313a0d7
```

#### `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-jooswU/checkout`

Porcelain status:
```text
M books/adeptus-mechanicus/v2/generated/app-presentation.json
 M books/blood-angels/v2/generated/app-presentation.json
 M books/blood-angels/v2/generated/gameplay-presentation.json
 M books/blood-angels/v2/generated/mfm-coverage.json
 M books/blood-angels/v2/generated/mfm-presentation.json
 M books/blood-angels/v2/generated/mixed-owner-book.json
 M books/blood-angels/v2/generated/mixed-owner-points.json
 M books/blood-angels/v2/generated/mixed-owner-presentation.json
 M books/blood-angels/v2/generated/native-mfm-book.json
 M books/blood-angels/v2/generated/roster-import.json
 M books/blood-angels/v2/generated/roster-runtime.json
 M books/dark-angels/v2/generated/app-presentation.json
 M books/dark-angels/v2/generated/gameplay-presentation.json
 M books/dark-angels/v2/generated/mfm-coverage.json
 M books/dark-angels/v2/generated/mfm-presentation.json
 M books/dark-angels/v2/generated/mixed-owner-book.json
 M books/dark-angels/v2/generated/mixed-owner-points.json
 M books/dark-angels/v2/generated/mixed-owner-presentation.json
 M books/dark-angels/v2/generated/native-mfm-book.json
 M books/dark-angels/v2/generated/roster-import.json
 M books/dark-angels/v2/generated/roster-runtime.json
 M books/death-guard/v2/generated/app-presentation.json
 M books/death-guard/v2/generated/comparison.json
 M books/death-guard/v2/generated/effective.json
 M books/death-guard/v2/generated/rule-contract-effective.json
 M books/emperors-children/v2/generated/app-presentation.json
 M books/emperors-children/v2/generated/base.json
 M books/emperors-children/v2/generated/effective.json
 M books/emperors-children/v2/generated/roster-attachments.json
 M books/emperors-children/v2/generated/roster-import.json
 M books/emperors-children/v2/generated/rule-contracts.json
 M books/emperors-children/v2/text-rule-review.json
 M books/shared/source-refs-v2/source-catalog.json
 M books/space-marines/v2/generated/app-presentation.json
 M books/space-marines/v2/generated/cross-owner-references.json
 M books/space-marines/v2/generated/deathwatch-mfm-presentation.json
 M books/space-marines/v2/generated/deathwatch-presentation.json
 M books/space-marines/v2/generated/gameplay-presentation.json
 M books/space-marines/v2/generated/mfm-coverage.json
 M books/space-marines/v2/generated/mfm-presentation.json
 M books/space-marines/v2/generated/native-mfm-book.json
 M books/space-marines/v2/generated/roster-import.json
 M books/space-marines/v2/generated/roster-runtime.json
 M books/tau-empire/v2/generated/app-presentation.json
 M books/tau-empire/v2/generated/base.json
 M books/tau-empire/v2/generated/effective.json
 M books/tau-empire/v2/generated/roster-import.json
 M books/tau-empire/v2/generated/rule-contracts.json
 M books/tau-empire/v2/rule-clause-review.json
 M books/tyranids/v2/generated/app-presentation.json
 M books/tyranids/v2/generated/base.json
 M books/tyranids/v2/generated/effective.json
 M books/tyranids/v2/generated/roster-import.json
 M books/tyranids/v2/generated/roster-runtime.json
 M books/tyranids/v2/generated/rule-contracts.json
 M books/tyranids/v2/text-rule-review.json
 M glossary/v2/generated/index.en.js
 M glossary/v2/generated/index.en.json
 M tests/helpers/stratagem-target-assertions.mjs
 M v2/new-recruit-plain-header-qa.mjs
 M v2/reviewed-text-coverage-qa.mjs
?? tests/helpers/accepted-mfm-history.mjs
?? tests/helpers/current-mfm-contract.mjs
?? tests/helpers/plain-header-history.mjs
```

HEAD commits absent from remote-tracking refs:
```text
d9d1998099fd9d1c7e7d22a6d3cd76a3e5898257
```

#### `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-bd4W8f/checkout`

Porcelain status:
```text
M books/emperors-children/v2/generated/app-presentation.json
 M books/emperors-children/v2/generated/base.json
 M books/emperors-children/v2/generated/effective.json
 M books/emperors-children/v2/generated/roster-import.json
 M books/emperors-children/v2/generated/rule-contracts.json
 M books/emperors-children/v2/text-rule-review.json
 M books/tyranids/v2/generated/app-presentation.json
 M books/tyranids/v2/generated/base.json
 M books/tyranids/v2/generated/effective.json
 M books/tyranids/v2/generated/roster-import.json
 M books/tyranids/v2/generated/roster-runtime.json
 M books/tyranids/v2/generated/rule-contracts.json
 M books/tyranids/v2/text-rule-review.json
```

HEAD commits absent from remote-tracking refs:
```text
c22b3b34452523e7559f16d93bdb8d050fe22ff5
```

#### `E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-v3/checkout`

Porcelain status:
```text
M books/death-guard/v2/generated/app-presentation.json
 M books/death-guard/v2/generated/comparison.json
 M books/death-guard/v2/generated/effective.json
 M books/death-guard/v2/generated/rule-contract-effective.json
 M glossary/v2/generated/index.en.js
 M glossary/v2/generated/index.en.json
```

HEAD commits absent from remote-tracking refs:
```text
b7c97a770a6b40de8d4f67f9a8e28513bc87ad21
```

#### `E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-v2/checkout`

HEAD commits absent from remote-tracking refs:
```text
4f0dfa841894d527776ae10d80083f2b4635f055
```

#### `E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-final/checkout`

Porcelain status:
```text
M books/death-guard/v2/generated/app-presentation.json
 M books/death-guard/v2/generated/comparison.json
 M books/death-guard/v2/generated/effective.json
 M books/death-guard/v2/generated/rule-contract-effective.json
 M glossary/v2/generated/index.en.js
 M glossary/v2/generated/index.en.json
```

HEAD commits absent from remote-tracking refs:
```text
e6ca478c9a4280940554976147f72b7ea2ce6591
```

#### `E:/Warhammer/Codex-Archive/patchrepo-2026-09-11`

Porcelain status:
```text
AM books/shared/tools/build-effective-book.mjs
AM books/shared/tools/build-roster-catalog.mjs
AM books/shared/tools/canonical-unit-stats.mjs
AM books/shared/tools/effective-book-model.mjs
AM package.json
 A tests/characteristic-effect-runtime-target-qa.mjs
A  tests/helpers/roster-fixtures.mjs
AM tests/roster-base-stat-ownership-qa.mjs
AM tests/roster-gameplay-projection-ownership-qa.mjs
```

### Dependency protections

| Kept target owner | Referenced from | Target | Why |
| --- | --- | --- | --- |
| E:/Warhammer/worktrees/official-updates-v1 | E:/Warhammer/qa-tmp/official-updates-v1/trials-final/tyranids/checkout | e:/warhammer/worktrees/official-updates-v1 | configured origin of retained repo |
| E:/Warhammer/worktrees/official-updates-v1 | E:/Warhammer/qa-tmp/official-updates-v1/trials-final/death-guard/checkout | e:/warhammer/worktrees/official-updates-v1 | configured origin of retained repo |
| E:/Warhammer/worktrees/official-updates-v1 | E:/Warhammer/qa-tmp/official-updates-v1/trials-approved-5bc26d82/tyranids/checkout | e:/warhammer/worktrees/official-updates-v1 | configured origin of retained repo |
| E:/Warhammer/worktrees/fabius-safe-import-v1 | E:/Warhammer/worktrees/card-texts-v1/node_modules | e:/warhammer/worktrees/fabius-safe-import-v1/node_modules | junction/dependency target |
| E:/Warhammer/worktrees/epic-hero-enhancements-v1 | E:/Warhammer/qa-tmp/core-rules-refresh-v1-registry-u6-recovery | e:/warhammer/worktrees/epic-hero-enhancements-v1 | configured origin of retained repo |
| E:/Warhammer/worktrees/epic-hero-enhancements-v1 | E:/Warhammer/qa-tmp/core-rules-refresh-v1-baseline-949d98f | e:/warhammer/worktrees/epic-hero-enhancements-v1 | configured origin of retained repo |
| E:/Warhammer/worktrees/core-switch-b-v1 | E:/Warhammer/qa-tmp/mfm-update-v1/wh-mfm-update-LuGjf2/work/checkout | e:/warhammer/worktrees/core-switch-b-v1 | configured origin of retained repo |
| E:/Warhammer/worktrees/core-switch-b-v1 | E:/Warhammer/qa-tmp/book-update-command-v1/wh-book-update-WVLHxS/work/checkout | e:/warhammer/worktrees/core-switch-b-v1 | configured origin of retained repo |
| E:/Warhammer/worktrees/core-switch-b-v1 | E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-yRGrgn/checkout | e:/warhammer/worktrees/core-switch-b-v1 | configured origin of retained repo |
| E:/Warhammer/worktrees/core-switch-b-v1 | E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-wnwCOx/checkout | e:/warhammer/worktrees/core-switch-b-v1 | configured origin of retained repo |
| E:/Warhammer/worktrees/core-switch-b-v1 | E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-ufMFO6/checkout | e:/warhammer/worktrees/core-switch-b-v1 | configured origin of retained repo |
| E:/Warhammer/worktrees/core-switch-b-v1 | E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-sugJ53/checkout | e:/warhammer/worktrees/core-switch-b-v1 | configured origin of retained repo |
| E:/Warhammer/worktrees/core-switch-b-v1 | E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-jooswU/checkout | e:/warhammer/worktrees/core-switch-b-v1 | configured origin of retained repo |
| E:/Warhammer/worktrees/core-switch-b-v1 | E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-bd4W8f/checkout | e:/warhammer/worktrees/core-switch-b-v1 | configured origin of retained repo |
| E:/Warhammer/worktrees/core-switch-b-v1 | E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-v3/checkout | e:/warhammer/worktrees/core-switch-b-v1 | configured origin of retained repo |
| E:/Warhammer/worktrees/core-switch-b-v1 | E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-v2/checkout | e:/warhammer/worktrees/core-switch-b-v1 | configured origin of retained repo |
| E:/Warhammer/worktrees/core-switch-b-v1 | E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-final/checkout | e:/warhammer/worktrees/core-switch-b-v1 | configured origin of retained repo |
| E:/Warhammer/worktrees/card-texts-v1 | E:/Warhammer/worktrees/test-hygiene-min-v1/node_modules | e:/warhammer/worktrees/card-texts-v1/node_modules | junction/dependency target |
| E:/Warhammer/worktrees/card-texts-v1 | E:/Warhammer/worktrees/sweep-polish-v1/node_modules | e:/warhammer/worktrees/card-texts-v1/node_modules | junction/dependency target |
| E:/Warhammer/worktrees/card-texts-v1 | E:/Warhammer/worktrees/sw-update-v1/node_modules | e:/warhammer/worktrees/card-texts-v1/node_modules | junction/dependency target |
| E:/Warhammer/worktrees/card-texts-v1 | E:/Warhammer/worktrees/preff-speedup-v1/node_modules | e:/warhammer/worktrees/card-texts-v1/node_modules | junction/dependency target |
| E:/Warhammer/worktrees/card-texts-v1 | E:/Warhammer/worktrees/nr-v3725-header-v1/node_modules | e:/warhammer/worktrees/card-texts-v1/node_modules | junction/dependency target |
| E:/Warhammer/worktrees/card-texts-v1 | E:/Warhammer/worktrees/keywords-access-v1/node_modules | e:/warhammer/worktrees/card-texts-v1/node_modules | junction/dependency target |
| E:/Warhammer/worktrees/card-texts-v1 | E:/Warhammer/worktrees/card-polish-2-v1/node_modules | e:/warhammer/worktrees/card-texts-v1/node_modules | junction/dependency target |
| E:/Warhammer/warhammer-v2-safety-20261017 | E:/Warhammer/worktrees/v2-stage59-universal-pricing-be70d80b | e:/warhammer/warhammer-v2-safety-20261017 | configured origin of retained repo |
| E:/Warhammer/warhammer-v2-recovery | E:/Warhammer/worktrees/v1-cleanup-v1/node_modules | e:/warhammer/warhammer-v2-recovery/node_modules | junction/dependency target |
| E:/Warhammer/warhammer-v2-recovery | E:/Warhammer/worktrees/source-catalog-registry-v1/node_modules | e:/warhammer/warhammer-v2-recovery/node_modules | junction/dependency target |
| E:/Warhammer/warhammer-v2-recovery | E:/Warhammer/worktrees/epic-hero-enhancements-v1/node_modules | e:/warhammer/warhammer-v2-recovery/node_modules | junction/dependency target |
| E:/Warhammer/warhammer-v2-recovery | E:/Warhammer/worktrees/core-switch-b-v1/node_modules | e:/warhammer/warhammer-v2-recovery/node_modules | junction/dependency target |
| E:/Warhammer/warhammer-v2-recovery | E:/Warhammer/worktrees/core-importer-a-v1/node_modules | e:/warhammer/warhammer-v2-recovery/node_modules | junction/dependency target |
| E:/Warhammer/warhammer-v2-recovery | E:/Warhammer/worktrees/cards-cosmetics-v1/node_modules | e:/warhammer/warhammer-v2-recovery/node_modules | junction/dependency target |
| E:/Warhammer/warhammer-v2-recovery | E:/Warhammer/qa-evidence/test-speedup-20261030/baseline/node_modules | e:/warhammer/warhammer-v2-recovery/node_modules | junction/dependency target |
| E:/Warhammer/warhammer-rules-complete-preview | E:/Warhammer/_codex_temp/sm-live-probe-f938/node_modules | e:/warhammer/warhammer-rules-complete-preview/node_modules | junction/dependency target |
| E:/Warhammer/warhammer-rules-complete-preview | E:/Warhammer/warhammer-source-orks-probe/tmp/bsdata-wh40k-11e | e:/warhammer/warhammer-rules-complete-preview/tmp/bsdata-wh40k-11e | junction/dependency target |
| E:/Warhammer/warhammer-rules-complete-preview | E:/Warhammer/warhammer-final-test-cleanup/node_modules | e:/warhammer/warhammer-rules-complete-preview/node_modules | junction/dependency target |
| E:/Warhammer/warhammer-rules-complete-preview | E:/Warhammer/warhammer-ec-eager/tmp | e:/warhammer/warhammer-rules-complete-preview/tmp | junction/dependency target |
| E:/Warhammer/warhammer-rules-complete-preview | E:/Warhammer/warhammer-ec-eager/node_modules | e:/warhammer/warhammer-rules-complete-preview/node_modules | junction/dependency target |
| E:/Warhammer/warhammer-rules-complete-preview/tmp/bsdata-wh40k-11e | E:/Warhammer/warhammer-source-orks-probe/tmp/bsdata-wh40k-11e | e:/warhammer/warhammer-rules-complete-preview/tmp/bsdata-wh40k-11e | junction/dependency target |
| E:/Warhammer/qa-tmp/test-hygiene-min-v1/bsdata-wh40k-11e-fa30730fca11fbfe87be90684d481d50e0efaf66 | E:/Warhammer/worktrees/test-hygiene-min-v1/tmp/bsdata-wh40k-11e | e:/warhammer/qa-tmp/test-hygiene-min-v1/bsdata-wh40k-11e-fa30730fca11fbfe87be90684d481d50e0efaf66 | junction/dependency target |
| E:/Warhammer/qa-tmp/official-updates-v1/trials-final/tyranids/checkout | E:/Warhammer/qa-tmp/official-updates-v1/tyranids-trial-guard-diagnostic/checkout | e:/warhammer/qa-tmp/official-updates-v1/trials-final/tyranids/checkout | configured origin of retained repo |
| E:/Warhammer/qa-tmp/core-rules-refresh-v1-baseline-949d98f | E:/Warhammer/qa-tmp/core-rules-refresh-v1-source-catalog-baseline-write | e:/warhammer/qa-tmp/core-rules-refresh-v1-baseline-949d98f | configured origin of retained repo |
| E:/Warhammer/qa-tmp/core-rules-refresh-v1-baseline-949d98f | E:/Warhammer/qa-tmp/core-rules-refresh-v1-registry-u6-baseline | e:/warhammer/qa-tmp/core-rules-refresh-v1-baseline-949d98f | configured origin of retained repo |

The main shared Git store is E:/Warhammer/warhammer-v2-recovery/.git. The current checkout's node_modules junction passes through card-texts-v1 and fabius-safe-import-v1; those directories are KEEP despite clean Git status. The local safety origin and root dependency stores are also KEEP. This prevents a cleanup from breaking active work while removing only obsolete checkouts.

## 4. B — QA material older than November 1

**Proposal only. No text was moved and no screenshot, trace, clone, package or other file was removed.** The extension/size split exactly follows the owner's rule: .md, .json or .txt, each strictly less than 5,000,000 bytes. That includes JSON data/package manifests inside copied outputs, not just prose reports; the preserved text total is therefore substantial. Files exactly 5 MB or larger belong to the other group.

There are 290 eligible old directories plus 14 old loose files at the two QA roots. No scanned file within those old directories had a last-write date on or after the Moscow cutoff. Newer QA directories were not traversed.

| Proposed action | Logical bytes | Size | Class / condition |
| --- | --- | --- | --- |
| Copy small text, preserve relative paths, verify hashes/counts before any removal | 7061636438 | 6.577 GiB | KEEP; proposed archive-reports destination |
| Remainder after verified text archive | 52745456018 | 49.123 GiB | SAFE_TO_DELETE only after the archive and Git retention conditions below |
| Combined eligible old QA material | 59807092456 | 55.700 GiB | Overlapping total; not extra reclaim |

Proposed destinations: E:/Warhammer/archive-reports/qa-artifacts/<original-folder>/<relative-path> and E:/Warhammer/archive-reports/qa-evidence/<original-folder>/<relative-path>. Keeping the source-container name prevents collisions. Old loose text files go under the corresponding container's _root-files directory. No archive-reports directory was created. Copying on the same volume does not itself free space; the future removal of original copies and retained-byte verification must be a separate authorized operation.

Required future order: (1) freeze exact eligible paths; (2) copy every retained text file with its relative path and verify count, byte total and SHA-256; (3) unregister the three clean embedded baseline worktrees without deleting the common Git store/branches; (4) remove only the original eligible folder contents after verification. Do not follow reparse links or remove their destinations. This is a conditional cleanup proposal, not an unconditional additional deletion authorization.

### Folder-by-folder split

| Path | Modified UTC | Text <5 MB | Remainder | Proposed archive destination |
| --- | --- | --- | --- | --- |
| `E:/Warhammer/qa-artifacts/v1-tests-pdf-cleanup-20261027` | 2026-10-27T19:45:58+00:00 | 781.463 MiB / 603 files | 6.041 GiB / 10924 files | `E:/Warhammer/archive-reports/qa-artifacts/v1-tests-pdf-cleanup-20261027` |
| `E:/Warhammer/qa-evidence/test-speedup-20261030` | 2026-10-30T14:23:12+00:00 | 397.579 MiB / 750 files | 4.364 GiB / 4890 files | `E:/Warhammer/archive-reports/qa-evidence/test-speedup-20261030` |
| `E:/Warhammer/qa-artifacts/f1-detachment-recipients-tables-20261028` | 2026-10-28T14:51:56+00:00 | 527.180 MiB / 433 files | 4.060 GiB / 7340 files | `E:/Warhammer/archive-reports/qa-artifacts/f1-detachment-recipients-tables-20261028` |
| `E:/Warhammer/qa-artifacts/minimal-pwa-fix-20261026` | 2026-10-27T13:25:58+00:00 | 530.194 MiB / 1503 files | 3.656 GiB / 13102 files | `E:/Warhammer/archive-reports/qa-artifacts/minimal-pwa-fix-20261026` |
| `E:/Warhammer/qa-artifacts/f1-detachment-recipients-authorized-20261028` | 2026-10-28T13:47:12+00:00 | 349.494 MiB / 275 files | 2.694 GiB / 4885 files | `E:/Warhammer/archive-reports/qa-artifacts/f1-detachment-recipients-authorized-20261028` |
| `E:/Warhammer/qa-artifacts/f1-detachment-recipients-20261028` | 2026-10-28T13:38:47+00:00 | 328.530 MiB / 673 files | 2.300 GiB / 4218 files | `E:/Warhammer/archive-reports/qa-artifacts/f1-detachment-recipients-20261028` |
| `E:/Warhammer/qa-artifacts/f1-detachment-recipients-resume-20261028` | 2026-10-28T12:52:11+00:00 | 239.992 MiB / 591 files | 1.610 GiB / 2946 files | `E:/Warhammer/archive-reports/qa-artifacts/f1-detachment-recipients-resume-20261028` |
| `E:/Warhammer/qa-artifacts/v1-leftovers-20261027` | 2026-10-27T16:09:14+00:00 | 174.327 MiB / 159 files | 1.342 GiB / 2454 files | `E:/Warhammer/archive-reports/qa-artifacts/v1-leftovers-20261027` |
| `E:/Warhammer/qa-artifacts/dg-source-enrollment-20261028` | 2026-10-27T22:11:42+00:00 | 174.307 MiB / 148 files | 1.342 GiB / 2439 files | `E:/Warhammer/archive-reports/qa-artifacts/dg-source-enrollment-20261028` |
| `E:/Warhammer/qa-artifacts/dg-two-failures-history-8eb9b843-181a-4fd0-be73-8a9b5f0c7c44` | 2026-10-13T08:29:54+00:00 | 94.935 MiB / 658 files | 1.347 GiB / 4121 files | `E:/Warhammer/archive-reports/qa-artifacts/dg-two-failures-history-8eb9b843-181a-4fd0-be73-8a9b5f0c7c44` |
| `E:/Warhammer/qa-evidence/translate-3-final-jbowQJ` | 2026-10-30T08:56:24+00:00 | 127.308 MiB / 91 files | 905.985 MiB / 1691 files | `E:/Warhammer/archive-reports/qa-evidence/translate-3-final-jbowQJ` |
| `E:/Warhammer/qa-evidence/show-2-card-display` | 2026-10-31T10:23:16+00:00 | 109.407 MiB / 653 files | 882.025 MiB / 1816 files | `E:/Warhammer/archive-reports/qa-evidence/show-2-card-display` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-omega-root-cause-fix-safety-20261023` | 2026-10-23T00:25:10+00:00 | 345.138 MiB / 1178 files | 588.105 MiB / 1625 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-ba-v2-omega-root-cause-fix-safety-20261023` |
| `E:/Warhammer/qa-evidence/show-1-card-labels` | 2026-10-31T03:14:18+00:00 | 100.186 MiB / 108 files | 812.593 MiB / 1697 files | `E:/Warhammer/archive-reports/qa-evidence/show-1-card-labels` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-omega-acceptance-20261023` | 2026-10-22T22:30:36+00:00 | 111.166 MiB / 450 files | 785.266 MiB / 1273 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-ba-v2-omega-acceptance-20261023` |
| `E:/Warhammer/qa-evidence/o1-pre-ff-reviewed-0ba0426b` | 2026-10-31T00:55:10+00:00 | 99.679 MiB / 83 files | 745.711 MiB / 1464 files | `E:/Warhammer/archive-reports/qa-evidence/o1-pre-ff-reviewed-0ba0426b` |
| `E:/Warhammer/qa-artifacts/dg-caption-blockers-b31acbe7-8506e545-e88f-4edb-93c5-050bc8f1142b` | 2026-10-13T07:11:14+00:00 | 81.290 MiB / 396 files | 744.480 MiB / 2295 files | `E:/Warhammer/archive-reports/qa-artifacts/dg-caption-blockers-b31acbe7-8506e545-e88f-4edb-93c5-050bc8f1142b` |
| `E:/Warhammer/qa-artifacts/f1-detachment-recipients-final-20261028` | 2026-10-28T14:07:02+00:00 | 89.841 MiB / 74 files | 687.203 MiB / 1238 files | `E:/Warhammer/archive-reports/qa-artifacts/f1-detachment-recipients-final-20261028` |
| `E:/Warhammer/qa-evidence/translate-3-sources-v2-EnpOFC` | 2026-10-30T09:55:52+00:00 | 97.994 MiB / 70 files | 675.531 MiB / 1233 files | `E:/Warhammer/archive-reports/qa-evidence/translate-3-sources-v2-EnpOFC` |
| `E:/Warhammer/qa-artifacts/recovery-unified-v2-stage6c-20261021` | 2026-10-21T07:00:51+00:00 | 3.370 MiB / 68 files | 703.140 MiB / 1844 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-unified-v2-stage6c-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage6b-production-20261021` | 2026-10-21T21:03:27+00:00 | 14.865 MiB / 613 files | 612.350 MiB / 486 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-da-v2-stage6b-production-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-omega-acceptance-20261021` | 2026-10-21T15:26:53+00:00 | 36.175 MiB / 1768 files | 574.100 MiB / 1708 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-da-v2-omega-acceptance-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-omega-acceptance-20261020` | 2026-10-20T18:30:52+00:00 | 32.036 MiB / 868 files | 536.816 MiB / 1129 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-sm-v2-omega-acceptance-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-admech-omega-acceptance-20261018` | 2026-10-18T17:14:45+00:00 | 15.320 MiB / 37 files | 551.926 MiB / 162 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-admech-omega-acceptance-20261018` |
| `E:/Warhammer/qa-artifacts/unified-v2-image-audit-ca651a23-20261020` | 2026-10-20T09:23:08+00:00 | 291.125 KiB / 4 files | 520.579 MiB / 30 files | `E:/Warhammer/archive-reports/qa-artifacts/unified-v2-image-audit-ca651a23-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage52-safe-attribution-20261023` | 2026-10-23T07:04:03+00:00 | 197.529 MiB / 618 files | 311.891 MiB / 700 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-ba-v2-stage52-safe-attribution-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage4b-capabilities-20261022` | 2026-10-22T21:12:17+00:00 | 45.499 MiB / 566 files | 454.664 MiB / 492 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-ba-v2-stage4b-capabilities-20261022` |
| `E:/Warhammer/qa-artifacts/recovery-unified-v2-stage6a-20261021` | 2026-10-20T22:00:29+00:00 | 1.393 MiB / 53 files | 488.062 MiB / 184 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-unified-v2-stage6a-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-v2-nine-book-release-20261024` | 2026-10-27T13:26:01+00:00 | 20.256 MiB / 93 files | 424.351 MiB / 109 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-v2-nine-book-release-20261024` |
| `E:/Warhammer/qa-artifacts/recovery-unified-v2-stage6b2-20261021` | 2026-10-20T23:10:00+00:00 | 2.238 MiB / 30 files | 418.377 MiB / 133 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-unified-v2-stage6b2-20261021` |
| `E:/Warhammer/qa-artifacts/ec-user-stress-a56909db-20261015` | 2026-10-15T08:48:48+00:00 | 15.397 MiB / 118 files | 356.184 MiB / 89 files | `E:/Warhammer/archive-reports/qa-artifacts/ec-user-stress-a56909db-20261015` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage6a-resume-20261021` | 2026-10-21T19:44:53+00:00 | 18.002 MiB / 653 files | 332.499 MiB / 568 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-da-v2-stage6a-resume-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage5a-20261020` | 2026-10-20T17:06:10+00:00 | 599.229 KiB / 53 files | 327.895 MiB / 193 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-sm-v2-stage5a-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage54-points-p2-20261023` | 2026-10-23T08:00:57+00:00 | 117.313 MiB / 412 files | 188.240 MiB / 486 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-ba-v2-stage54-points-p2-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage4b1-independent-review-20261023` | 2026-10-22T21:28:56+00:00 | 41.703 MiB / 426 files | 262.574 MiB / 339 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-ba-v2-stage4b1-independent-review-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-shared-equipment-caption-fix-20261018` | 2026-10-18T17:53:27+00:00 | 12.006 MiB / 38 files | 286.428 MiB / 182 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-shared-equipment-caption-fix-20261018` |
| `E:/Warhammer/qa-artifacts/safe-pwa-updates-20261026` | 2026-10-27T13:26:03+00:00 | 29.975 MiB / 53 files | 261.537 MiB / 1325 files | `E:/Warhammer/archive-reports/qa-artifacts/safe-pwa-updates-20261026` |
| `E:/Warhammer/qa-artifacts/recovery-tyranids-omega-acceptance-20261019` | 2026-10-19T08:55:48+00:00 | 83.677 MiB / 805 files | 205.849 MiB / 546 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-tyranids-omega-acceptance-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-tyranids-trygon-selection-fix-20261019` | 2026-10-19T10:46:03+00:00 | 117.383 MiB / 624 files | 171.889 MiB / 230 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-tyranids-trygon-selection-fix-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage5c-20261020` | 2026-10-20T19:45:01+00:00 | 238.336 KiB / 12 files | 288.783 MiB / 81 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-sm-v2-stage5c-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-v2-stage56-multi-detachment-20261023` | 2026-10-23T13:27:47+00:00 | 76.685 MiB / 303 files | 203.176 MiB / 268 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-v2-stage56-multi-detachment-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage53-attribution-integration-20261023` | 2026-10-23T07:22:30+00:00 | 102.285 MiB / 322 files | 169.825 MiB / 437 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-ba-v2-stage53-attribution-integration-20261023` |
| `E:/Warhammer/qa-artifacts/release-certification-98fc94a5-20261009` | 2026-10-08T21:36:03+00:00 | 22.294 MiB / 235 files | 180.312 MiB / 354 files | `E:/Warhammer/archive-reports/qa-artifacts/release-certification-98fc94a5-20261009` |
| `E:/Warhammer/qa-artifacts/am-official-v1.4-20261014` | 2026-10-14T11:29:31+00:00 | 15.054 MiB / 33 files | 166.629 MiB / 161 files | `E:/Warhammer/archive-reports/qa-artifacts/am-official-v1.4-20261014` |
| `E:/Warhammer/qa-artifacts/unified-v2-release-preparation-3f362abb-20261020` | 2026-10-20T09:03:29+00:00 | 1.410 MiB / 120 files | 172.394 MiB / 55 files | `E:/Warhammer/archive-reports/qa-artifacts/unified-v2-release-preparation-3f362abb-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-ec-omega-acceptance-20261019` | 2026-10-19T07:32:02+00:00 | 57.586 MiB / 522 files | 110.147 MiB / 170 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-ec-omega-acceptance-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-ec-omega-import-fix-20261019` | 2026-10-19T07:51:19+00:00 | 52.394 MiB / 412 files | 109.970 MiB / 155 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-ec-omega-import-fix-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage4b2-integration-20261023` | 2026-10-22T21:40:16+00:00 | 21.264 MiB / 236 files | 129.854 MiB / 202 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-ba-v2-stage4b2-integration-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage51-fixes-20261021` | 2026-10-21T17:42:58+00:00 | 30.491 MiB / 796 files | 114.531 MiB / 594 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-da-v2-stage51-fixes-20261021` |
| `E:/Warhammer/qa-evidence/test-temp-cleanup-tau` | 2026-10-31T13:13:41+00:00 | 5.042 MiB / 206 files | 139.584 MiB / 389 files | `E:/Warhammer/archive-reports/qa-evidence/test-temp-cleanup-tau` |
| `E:/Warhammer/qa-artifacts/patch-release-4a8b9a29-20261014` | 2026-10-14T13:09:57+00:00 | 617.946 KiB / 15 files | 143.665 MiB / 58 files | `E:/Warhammer/archive-reports/qa-artifacts/patch-release-4a8b9a29-20261014` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage4c-capabilities-20261021` | 2026-10-21T14:15:54+00:00 | 34.458 MiB / 860 files | 108.735 MiB / 554 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-da-v2-stage4c-capabilities-20261021` |
| `E:/Warhammer/qa-artifacts/csm-v13-implementation` | 2026-10-14T12:15:07+00:00 | 466.181 KiB / 5 files | 136.561 MiB / 25 files | `E:/Warhammer/archive-reports/qa-artifacts/csm-v13-implementation` |
| `E:/Warhammer/qa-artifacts/admech-v2-deep-audit` | 2026-10-17T15:42:35+00:00 | 23.333 MiB / 154 files | 109.485 MiB / 161 files | `E:/Warhammer/archive-reports/qa-artifacts/admech-v2-deep-audit` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage2c-mixed-owner-20261021` | 2026-10-21T08:55:27+00:00 | 28.393 MiB / 102 files | 100.847 MiB / 646 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-da-v2-stage2c-mixed-owner-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage4a-application-20261022` | 2026-10-22T20:29:29+00:00 | 2.507 MiB / 196 files | 125.854 MiB / 289 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-ba-v2-stage4a-application-20261022` |
| `E:/Warhammer/qa-artifacts/recovery-v2-stage59-universal-pricing-20261023` | 2026-10-23T15:31:56+00:00 | 6.534 MiB / 116 files | 118.191 MiB / 110 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-v2-stage59-universal-pricing-20261023` |
| `E:/Warhammer/qa-artifacts/death-guard-v2-deep-audit` | 2026-10-17T13:14:25+00:00 | 25.931 MiB / 142 files | 97.195 MiB / 143 files | `E:/Warhammer/archive-reports/qa-artifacts/death-guard-v2-deep-audit` |
| `E:/Warhammer/qa-artifacts/manual-release-plan-98fc94a5-20261009` | 2026-10-09T00:10:16+00:00 | 9.409 MiB / 245 files | 110.219 MiB / 283 files | `E:/Warhammer/archive-reports/qa-artifacts/manual-release-plan-98fc94a5-20261009` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage4a-application-20261021` | 2026-10-21T12:50:40+00:00 | 2.658 MiB / 298 files | 111.905 MiB / 399 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-da-v2-stage4a-application-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage6a-release-20261021` | 2026-10-21T18:43:06+00:00 | 2.249 MiB / 54 files | 109.738 MiB / 25 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-da-v2-stage6a-release-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-csm-dd-fix-4bef79a7-20261018` | 2026-10-18T14:21:02+00:00 | 12.697 MiB / 54 files | 93.488 MiB / 136 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-csm-dd-fix-4bef79a7-20261018` |
| `E:/Warhammer/qa-artifacts/datasheet-recertification-855d641b` | 2026-10-08T19:16:20+00:00 | 9.055 MiB / 136 files | 91.451 MiB / 229 files | `E:/Warhammer/archive-reports/qa-artifacts/datasheet-recertification-855d641b` |
| `E:/Warhammer/qa-artifacts/unified-v2-release-preflight-20261020` | 2026-10-20T08:33:49+00:00 | 667.843 KiB / 38 files | 98.601 MiB / 106 files | `E:/Warhammer/archive-reports/qa-artifacts/unified-v2-release-preflight-20261020` |
| `E:/Warhammer/qa-artifacts/datasheet-certification-98fc94a5` | 2026-10-08T20:33:59+00:00 | 9.212 MiB / 146 files | 85.951 MiB / 220 files | `E:/Warhammer/archive-reports/qa-artifacts/datasheet-certification-98fc94a5` |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage5-20261019` | 2026-10-19T18:51:29+00:00 | 674.540 KiB / 47 files | 92.154 MiB / 31 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-tau-v2-stage5-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage6-20261019` | 2026-10-19T19:17:44+00:00 | 797.930 KiB / 60 files | 91.264 MiB / 50 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-tau-v2-stage6-20261019` |
| `E:/Warhammer/qa-artifacts/gw-freshness-2026-10-14` | 2026-10-14T18:04:20+00:00 | 2.910 MiB / 35 files | 85.841 MiB / 38 files | `E:/Warhammer/archive-reports/qa-artifacts/gw-freshness-2026-10-14` |
| `E:/Warhammer/qa-artifacts/recovery-tau-omega-acceptance-20261019` | 2026-10-19T20:47:14+00:00 | 40.375 MiB / 262 files | 45.090 MiB / 122 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-tau-omega-acceptance-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-tau-omega-final-reacceptance-20261020` | 2026-10-20T07:02:14+00:00 | 56.213 MiB / 696 files | 25.048 MiB / 89 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-tau-omega-final-reacceptance-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-csm-omega-acceptance-4bef79a7-20261018` | 2026-10-18T13:21:11+00:00 | 15.154 MiB / 64 files | 65.173 MiB / 109 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-csm-omega-acceptance-4bef79a7-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage53-omega-closure-20261021` | 2026-10-21T18:30:39+00:00 | 16.479 MiB / 222 files | 54.284 MiB / 207 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-da-v2-stage53-omega-closure-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-unified-v2-stage6b1-20261021` | 2026-10-20T22:58:34+00:00 | 9.732 MiB / 78 files | 59.665 MiB / 257 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-unified-v2-stage6b1-20261021` |
| `E:/Warhammer/qa-artifacts/csm-independent-content-078de95d` | 2026-10-11T16:46:50+00:00 | 25.724 MiB / 59 files | 42.342 MiB / 45 files | `E:/Warhammer/archive-reports/qa-artifacts/csm-independent-content-078de95d` |
| `E:/Warhammer/qa-artifacts/recovery-v2-model-identity-safety-20261024` | 2026-10-24T08:37:21+00:00 | 17.636 MiB / 76 files | 47.890 MiB / 87 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-v2-model-identity-safety-20261024` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage52-integration-20261021` | 2026-10-21T18:08:43+00:00 | 11.338 MiB / 346 files | 54.118 MiB / 292 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-da-v2-stage52-integration-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-v2-stage591-canonical-option-knownness-20261023` | 2026-10-23T15:48:47+00:00 | 3.935 MiB / 69 files | 61.231 MiB / 111 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-v2-stage591-canonical-option-knownness-20261023` |
| `E:/Warhammer/qa-artifacts/personal-datasheet-parity-43bd6aaf` | 2026-10-08T18:56:14+00:00 | 5.623 KiB / 3 files | 63.755 MiB / 144 files | `E:/Warhammer/archive-reports/qa-artifacts/personal-datasheet-parity-43bd6aaf` |
| `E:/Warhammer/qa-artifacts/datasheet-parity-51088e8e` | 2026-10-08T14:44:05+00:00 | 4.538 MiB / 92 files | 59.182 MiB / 162 files | `E:/Warhammer/archive-reports/qa-artifacts/datasheet-parity-51088e8e` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage1-discovery-20261021` | 2026-10-21T07:45:13+00:00 | 1.469 MiB / 34 files | 61.695 MiB / 33 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-da-v2-stage1-discovery-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage1-discovery-20261020` | 2026-10-20T10:11:22+00:00 | 2.849 MiB / 26 files | 56.714 MiB / 24 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-sm-v2-stage1-discovery-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-tau-omega-evidence-closure-20261020` | 2026-10-20T07:28:19+00:00 | 9.266 MiB / 203 files | 48.850 MiB / 207 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-tau-omega-evidence-closure-20261020` |
| `E:/Warhammer/qa-evidence/o1-recipient-rule-text` | 2026-10-30T22:39:23+00:00 | 583.465 KiB / 16 files | 56.653 MiB / 292 files | `E:/Warhammer/archive-reports/qa-evidence/o1-recipient-rule-text` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage1-discovery-20261022` | 2026-10-22T07:38:14+00:00 | 2.052 MiB / 48 files | 54.518 MiB / 55 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-ba-v2-stage1-discovery-20261022` |
| `E:/Warhammer/qa-artifacts/tyranids-v2-user-stress-ee6387be-20261015` | 2026-10-15T20:25:44+00:00 | 7.744 MiB / 306 files | 46.537 MiB / 115 files | `E:/Warhammer/archive-reports/qa-artifacts/tyranids-v2-user-stress-ee6387be-20261015` |
| `E:/Warhammer/qa-artifacts/release-preview-98fc94a5` | 2026-10-09T08:56:15+00:00 | 2.182 KiB / 2 files | 52.857 MiB / 10 files | `E:/Warhammer/archive-reports/qa-artifacts/release-preview-98fc94a5` |
| `E:/Warhammer/qa-artifacts/live-v2-release-20261014-27e692ae` | 2026-10-14T09:15:59+00:00 | 4.687 MiB / 62 files | 45.839 MiB / 69 files | `E:/Warhammer/archive-reports/qa-artifacts/live-v2-release-20261014-27e692ae` |
| `E:/Warhammer/qa-evidence/dg-am-rule-recipients` | 2026-10-31T15:21:09+00:00 | 5.118 MiB / 44 files | 42.721 MiB / 258 files | `E:/Warhammer/archive-reports/qa-evidence/dg-am-rule-recipients` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage4c-final-review-20261021` | 2026-10-21T14:27:11+00:00 | 8.548 MiB / 265 files | 37.988 MiB / 203 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-da-v2-stage4c-final-review-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage4c-integration-20261021` | 2026-10-21T14:36:27+00:00 | 8.452 MiB / 262 files | 37.955 MiB / 186 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-da-v2-stage4c-integration-20261021` |
| `E:/Warhammer/qa-artifacts/dg-content-03-06-9c41816e-eff883b1-2f6e-49b8-8b1d-70226c346952` | 2026-10-13T18:49:25+00:00 | 2.887 MiB / 21 files | 42.011 MiB / 238 files | `E:/Warhammer/archive-reports/qa-artifacts/dg-content-03-06-9c41816e-eff883b1-2f6e-49b8-8b1d-70226c346952` |
| `E:/Warhammer/qa-artifacts/recovery-tau-omega-proposal-20261019` | 2026-10-19T20:03:16+00:00 | 11.133 MiB / 39 files | 29.011 MiB / 20 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-tau-omega-proposal-20261019` |
| `E:/Warhammer/qa-artifacts/am-recert-ca771f43` | 2026-10-08T08:23:10+00:00 | 0 B / 0 files | 38.516 MiB / 97 files | `E:/Warhammer/archive-reports/qa-artifacts/am-recert-ca771f43` |
| `E:/Warhammer/qa-artifacts/v2-only-core-glossary-qa-20261027` | 2026-10-27T13:26:04+00:00 | 10.650 MiB / 46 files | 27.292 MiB / 248 files | `E:/Warhammer/archive-reports/qa-artifacts/v2-only-core-glossary-qa-20261027` |
| `E:/Warhammer/qa-artifacts/am-final-fdefd4da` | 2026-10-08T09:59:56+00:00 | 0 B / 0 files | 37.802 MiB / 121 files | `E:/Warhammer/archive-reports/qa-artifacts/am-final-fdefd4da` |
| `E:/Warhammer/qa-artifacts/recovery-v2-universal-nr373-mfm-20261024` | 2026-10-24T08:28:40+00:00 | 524.015 KiB / 15 files | 35.252 MiB / 37 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-v2-universal-nr373-mfm-20261024` |
| `E:/Warhammer/qa-artifacts/death-guard-v2-stage1-targeted-fix-df80f6a3-20261017` | 2026-10-17T12:49:15+00:00 | 17.210 MiB / 15 files | 18.404 MiB / 3 files | `E:/Warhammer/archive-reports/qa-artifacts/death-guard-v2-stage1-targeted-fix-df80f6a3-20261017` |
| `E:/Warhammer/qa-artifacts/five-books-roster-effect-coverage-ee6387be-20261015` | 2026-10-15T21:19:29+00:00 | 23.890 MiB / 83 files | 10.671 MiB / 43 files | `E:/Warhammer/archive-reports/qa-artifacts/five-books-roster-effect-coverage-ee6387be-20261015` |
| `E:/Warhammer/qa-artifacts/am-glossary-fdefd4da` | 2026-10-08T10:32:00+00:00 | 8.273 KiB / 3 files | 33.941 MiB / 105 files | `E:/Warhammer/archive-reports/qa-artifacts/am-glossary-fdefd4da` |
| `E:/Warhammer/qa-artifacts/recovery-v2-stage57-stage56-p2-integration-20261023` | 2026-10-23T13:39:29+00:00 | 15.611 MiB / 59 files | 17.873 MiB / 74 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-v2-stage57-stage56-p2-integration-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-v2-enhancement-text-fix-78522fcf-20261018` | 2026-10-18T11:39:50+00:00 | 4.008 MiB / 14 files | 28.269 MiB / 115 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-v2-enhancement-text-fix-78522fcf-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-v2-real-nr373-import-fix-20261023` | 2026-10-23T19:24:43+00:00 | 16.141 MiB / 88 files | 14.777 MiB / 80 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-v2-real-nr373-import-fix-20261023` |
| `E:/Warhammer/qa-artifacts/v2-only-remove-legacy-20261027` | 2026-10-27T13:26:07+00:00 | 5.240 MiB / 78 files | 25.536 MiB / 267 files | `E:/Warhammer/archive-reports/qa-artifacts/v2-only-remove-legacy-20261027` |
| `E:/Warhammer/qa-artifacts/recovery-v2-controlled-nr373-integration-20261024` | 2026-10-24T09:06:09+00:00 | 17.348 MiB / 73 files | 12.874 MiB / 72 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-v2-controlled-nr373-integration-20261024` |
| `E:/Warhammer/qa-artifacts/recovery-v2-model-membership-no-brackets-20261024` | 2026-10-24T08:58:47+00:00 | 17.508 MiB / 77 files | 12.613 MiB / 94 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-v2-model-membership-no-brackets-20261024` |
| `E:/Warhammer/qa-artifacts/recovery-dg-selective-transfer-20261017` | 2026-10-17T20:56:23+00:00 | 6.264 KiB / 7 files | 28.648 MiB / 18 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-dg-selective-transfer-20261017` |
| `E:/Warhammer/qa-artifacts/core-preintegration-cc84bfe2` | 2026-10-09T22:23:04+00:00 | 2.346 MiB / 6 files | 24.710 MiB / 29 files | `E:/Warhammer/archive-reports/qa-artifacts/core-preintegration-cc84bfe2` |
| `E:/Warhammer/qa-artifacts/am-theme-1be58024` | 2026-10-08T10:50:38+00:00 | 166.200 KiB / 2 files | 25.966 MiB / 99 files | `E:/Warhammer/archive-reports/qa-artifacts/am-theme-1be58024` |
| `E:/Warhammer/qa-artifacts/recovery-v2-controlled-stage57-integration-20261023` | 2026-10-23T17:08:47+00:00 | 15.513 MiB / 59 files | 10.603 MiB / 22 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-v2-controlled-stage57-integration-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-v2-sm-deathwatch-qa-contract-20261023` | 2026-10-23T20:19:31+00:00 | 15.500 MiB / 55 files | 10.599 MiB / 15 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-v2-sm-deathwatch-qa-contract-20261023` |
| `E:/Warhammer/qa-artifacts/_manifests` | 2026-10-27T13:23:41+00:00 | 24.811 MiB / 89 files | 42.065 KiB / 1 files | `E:/Warhammer/archive-reports/qa-artifacts/_manifests` |
| `E:/Warhammer/qa-artifacts/unified-v2-pages-release-ca651a23-20261020` | 2026-10-20T09:28:07+00:00 | 146.749 KiB / 9 files | 23.617 MiB / 65 files | `E:/Warhammer/archive-reports/qa-artifacts/unified-v2-pages-release-ca651a23-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage3b-physical-import-20261022` | 2026-10-27T12:56:55+00:00 | 2.199 MiB / 24 files | 21.161 MiB / 87 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-ba-v2-stage3b-physical-import-20261022` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage2b-mfm-20261022` | 2026-10-27T12:56:57+00:00 | 796.555 KiB / 25 files | 22.409 MiB / 108 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-ba-v2-stage2b-mfm-20261022` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage3a-gameplay-20261022` | 2026-10-27T12:56:57+00:00 | 1.243 MiB / 20 files | 21.336 MiB / 102 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-ba-v2-stage3a-gameplay-20261022` |
| `E:/Warhammer/qa-artifacts/am-ux-fdefd4da` | 2026-10-08T10:17:56+00:00 | 19.712 KiB / 2 files | 22.091 MiB / 64 files | `E:/Warhammer/archive-reports/qa-artifacts/am-ux-fdefd4da` |
| `E:/Warhammer/qa-artifacts/formed-units-9a952c7c` | 2026-10-11T12:20:30+00:00 | 56.347 KiB / 3 files | 22.012 MiB / 30 files | `E:/Warhammer/archive-reports/qa-artifacts/formed-units-9a952c7c` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage2c-mixed-owner-20261022` | 2026-10-27T12:57:00+00:00 | 686.689 KiB / 14 files | 21.314 MiB / 95 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-ba-v2-stage2c-mixed-owner-20261022` |
| `E:/Warhammer/qa-artifacts/csm-personal-guide-14916f21` | 2026-10-11T13:07:49+00:00 | 1.177 MiB / 3 files | 18.158 MiB / 28 files | `E:/Warhammer/archive-reports/qa-artifacts/csm-personal-guide-14916f21` |
| `E:/Warhammer/qa-artifacts/charge-family-fix-ee6387be-20261016` | 2026-10-15T23:15:50+00:00 | 469.047 KiB / 10 files | 18.632 MiB / 42 files | `E:/Warhammer/archive-reports/qa-artifacts/charge-family-fix-ee6387be-20261016` |
| `E:/Warhammer/qa-artifacts/dg-content-05-bdd33731-964bf822-3476-4efe-850e-1bdab7aadf51` | 2026-10-27T13:26:09+00:00 | 959.136 KiB / 13 files | 17.753 MiB / 160 files | `E:/Warhammer/archive-reports/qa-artifacts/dg-content-05-bdd33731-964bf822-3476-4efe-850e-1bdab7aadf51` |
| `E:/Warhammer/qa-artifacts/minimal-pwa-css-20261027` | 2026-10-27T13:25:51+00:00 | 4.620 MiB / 20 files | 13.550 MiB / 83 files | `E:/Warhammer/archive-reports/qa-artifacts/minimal-pwa-css-20261027` |
| `E:/Warhammer/qa-artifacts/recovery-charge-frontend-review-20261018` | 2026-10-18T09:56:44+00:00 | 507.423 KiB / 7 files | 17.408 MiB / 75 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-charge-frontend-review-20261018` |
| `E:/Warhammer/qa-artifacts/core-b2-b3-20261025` | 2026-10-25T10:30:33+00:00 | 113.052 KiB / 12 files | 16.706 MiB / 38 files | `E:/Warhammer/archive-reports/qa-artifacts/core-b2-b3-20261025` |
| `E:/Warhammer/qa-artifacts/recovery-granted-ability-attribution-20261020` | 2026-10-20T07:59:31+00:00 | 1.840 MiB / 22 files | 14.827 MiB / 66 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-granted-ability-attribution-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-preserve-reimport-attachments-20261020` | 2026-10-20T06:49:37+00:00 | 1.642 MiB / 112 files | 14.622 MiB / 17 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-preserve-reimport-attachments-20261020` |
| `E:/Warhammer/qa-artifacts/normal-datasheet-parity-51088e8e` | 2026-10-08T14:42:43+00:00 | 1.615 KiB / 1 files | 16.160 MiB / 32 files | `E:/Warhammer/archive-reports/qa-artifacts/normal-datasheet-parity-51088e8e` |
| `E:/Warhammer/qa-artifacts/unified-v2-live-playwright-df80f6a3-20261017` | 2026-10-17T11:58:30+00:00 | 862.167 KiB / 24 files | 13.456 MiB / 36 files | `E:/Warhammer/archive-reports/qa-artifacts/unified-v2-live-playwright-df80f6a3-20261017` |
| `E:/Warhammer/qa-artifacts/dg-content-final-9c41816e-20261013` | 2026-10-13T19:23:03+00:00 | 3.131 MiB / 28 files | 10.831 MiB / 47 files | `E:/Warhammer/archive-reports/qa-artifacts/dg-content-final-9c41816e-20261013` |
| `E:/Warhammer/qa-artifacts/ability-dedup-855d641b` | 2026-10-08T20:15:00+00:00 | 87.974 KiB / 6 files | 13.556 MiB / 34 files | `E:/Warhammer/archive-reports/qa-artifacts/ability-dedup-855d641b` |
| `E:/Warhammer/qa-artifacts/unified-v2-cover-release-20261020` | 2026-10-20T09:41:49+00:00 | 330.288 KiB / 9 files | 12.502 MiB / 38 files | `E:/Warhammer/archive-reports/qa-artifacts/unified-v2-cover-release-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage3c-coverage-20261022` | 2026-10-22T13:02:55+00:00 | 1.827 MiB / 25 files | 10.634 MiB / 51 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-ba-v2-stage3c-coverage-20261022` |
| `E:/Warhammer/qa-artifacts/am06` | 2026-10-08T08:00:53+00:00 | 0 B / 0 files | 11.803 MiB / 14 files | `E:/Warhammer/archive-reports/qa-artifacts/am06` |
| `E:/Warhammer/qa-artifacts/tyranids-seven-effects-4edfabbd-20261016` | 2026-10-17T09:22:13+00:00 | 2.613 MiB / 4 files | 9.061 MiB / 18 files | `E:/Warhammer/archive-reports/qa-artifacts/tyranids-seven-effects-4edfabbd-20261016` |
| `E:/Warhammer/qa-artifacts/glossary-v1-v2-forensic-98fc94a5` | 2026-10-09T08:56:18+00:00 | 84.679 KiB / 4 files | 11.178 MiB / 75 files | `E:/Warhammer/archive-reports/qa-artifacts/glossary-v1-v2-forensic-98fc94a5` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage4d-20261020` | 2026-10-20T16:14:04+00:00 | 5.173 MiB / 25 files | 5.898 MiB / 41 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-sm-v2-stage4d-20261020` |
| `E:/Warhammer/qa-artifacts/effective-profile-annotations-0b55381c` | 2026-10-10T14:20:38+00:00 | 52.314 KiB / 1 files | 11.003 MiB / 23 files | `E:/Warhammer/archive-reports/qa-artifacts/effective-profile-annotations-0b55381c` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage4b-coverage-20261021` | 2026-10-21T13:18:18+00:00 | 1.642 MiB / 51 files | 9.195 MiB / 79 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-da-v2-stage4b-coverage-20261021` |
| `E:/Warhammer/qa-artifacts/effective-datasheet-presentation-d087` | 2026-10-10T12:18:54+00:00 | 40.283 KiB / 2 files | 10.359 MiB / 24 files | `E:/Warhammer/archive-reports/qa-artifacts/effective-datasheet-presentation-d087` |
| `E:/Warhammer/qa-artifacts/recovery-v2-15-rule-presentation-20261018` | 2026-10-18T10:50:03+00:00 | 2.269 MiB / 7 files | 8.074 MiB / 23 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-v2-15-rule-presentation-20261018` |
| `E:/Warhammer/qa-artifacts/v2-only-baseline-resume-rc-20261027` | 2026-10-27T10:11:43+00:00 | 3.889 MiB / 15 files | 6.139 MiB / 75 files | `E:/Warhammer/archive-reports/qa-artifacts/v2-only-baseline-resume-rc-20261027` |
| `E:/Warhammer/qa-artifacts/tyranids-v2-isolated-browser` | 2026-10-15T16:03:31+00:00 | 2.765 KiB / 2 files | 9.320 MiB / 17 files | `E:/Warhammer/archive-reports/qa-artifacts/tyranids-v2-isolated-browser` |
| `E:/Warhammer/qa-artifacts/tyranids-v2-unified-browser` | 2026-10-15T16:21:59+00:00 | 1.021 KiB / 1 files | 8.818 MiB / 16 files | `E:/Warhammer/archive-reports/qa-artifacts/tyranids-v2-unified-browser` |
| `E:/Warhammer/qa-artifacts/recovery-dg-omega-final-d53656ad-20261018` | 2026-10-18T00:04:53+00:00 | 3.492 MiB / 28 files | 5.085 MiB / 38 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-dg-omega-final-d53656ad-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-dg-omega-fixed-roster-20261018` | 2026-10-17T23:19:29+00:00 | 3.418 MiB / 26 files | 5.118 MiB / 34 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-dg-omega-fixed-roster-20261018` |
| `E:/Warhammer/qa-artifacts/ec-two-defects-forensic-a56909db-20261015` | 2026-10-15T09:48:39+00:00 | 332.512 KiB / 10 files | 8.104 MiB / 30 files | `E:/Warhammer/archive-reports/qa-artifacts/ec-two-defects-forensic-a56909db-20261015` |
| `E:/Warhammer/qa-artifacts/recovery-cross-book-root-fixes-20261018` | 2026-10-17T23:53:34+00:00 | 4.612 MiB / 31 files | 3.756 MiB / 47 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-cross-book-root-fixes-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-equipment-identity-grouping-fix-20261020` | 2026-10-19T21:02:35+00:00 | 7.105 MiB / 361 files | 1.248 MiB / 64 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-equipment-identity-grouping-fix-20261020` |
| `E:/Warhammer/qa-artifacts/unified-glossary-reference-98fc94a5` | 2026-10-09T09:50:12+00:00 | 113.110 KiB / 3 files | 8.141 MiB / 32 files | `E:/Warhammer/archive-reports/qa-artifacts/unified-glossary-reference-98fc94a5` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage3c-physical-import-20261021` | 2026-10-21T11:24:43+00:00 | 123.384 KiB / 12 files | 7.871 MiB / 52 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-da-v2-stage3c-physical-import-20261021` |
| `E:/Warhammer/qa-artifacts/v1-home-port` | 2026-10-09T16:00:24+00:00 | 33.412 KiB / 2 files | 7.766 MiB / 8 files | `E:/Warhammer/archive-reports/qa-artifacts/v1-home-port` |
| `E:/Warhammer/qa-artifacts/unified-regression-f5d203d2-20261013-fa10caa3-1781-40e9-8c32-86d70a1c4b75` | 2026-10-13T08:20:46+00:00 | 567.253 KiB / 11 files | 7.074 MiB / 167 files | `E:/Warhammer/archive-reports/qa-artifacts/unified-regression-f5d203d2-20261013-fa10caa3-1781-40e9-8c32-86d70a1c4b75` |
| `E:/Warhammer/qa-artifacts/source-runtime-manifest-fix-20261026` | 2026-10-27T13:26:04+00:00 | 1.318 MiB / 25 files | 6.113 MiB / 53 files | `E:/Warhammer/archive-reports/qa-artifacts/source-runtime-manifest-fix-20261026` |
| `E:/Warhammer/qa-artifacts/recovery-admech-omega-proposal-20261018` | 2026-10-18T16:14:52+00:00 | 2.804 MiB / 5 files | 4.623 MiB / 6 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-admech-omega-proposal-20261018` |
| `E:/Warhammer/qa-artifacts/runtime-manifest-integration-20261026` | 2026-10-27T13:26:03+00:00 | 1.301 MiB / 22 files | 6.111 MiB / 51 files | `E:/Warhammer/archive-reports/qa-artifacts/runtime-manifest-integration-20261026` |
| `E:/Warhammer/qa-artifacts/minimal-pwa-core-glossary-20261026` | 2026-10-27T13:25:51+00:00 | 4.807 MiB / 16 files | 2.392 MiB / 35 files | `E:/Warhammer/archive-reports/qa-artifacts/minimal-pwa-core-glossary-20261026` |
| `E:/Warhammer/qa-artifacts/glossary-dependencies-bfd04cae-home-96ae611d-79b8-47f2-90c4-4022b3cc1829` | 2026-10-13T13:14:50+00:00 | 0 B / 0 files | 7.055 MiB / 6 files | `E:/Warhammer/archive-reports/qa-artifacts/glossary-dependencies-bfd04cae-home-96ae611d-79b8-47f2-90c4-4022b3cc1829` |
| `E:/Warhammer/qa-artifacts/v2-home-qa-f4854559-acceptance-final` | 2026-10-13T12:25:10+00:00 | 0 B / 0 files | 7.055 MiB / 6 files | `E:/Warhammer/archive-reports/qa-artifacts/v2-home-qa-f4854559-acceptance-final` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage2b-20261020` | 2026-10-20T13:07:03+00:00 | 3.583 MiB / 11 files | 3.458 MiB / 21 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-sm-v2-stage2b-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-root-cause-20261021` | 2026-10-21T17:11:45+00:00 | 2.582 MiB / 57 files | 4.354 MiB / 42 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-da-v2-root-cause-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-tyranids-omega-proposal-20261019` | 2026-10-19T08:07:54+00:00 | 6.457 MiB / 25 files | 410.200 KiB / 13 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-tyranids-omega-proposal-20261019` |
| `E:/Warhammer/qa-artifacts/v2-home-qa-f4854559-acceptance` | 2026-10-13T12:23:02+00:00 | 0 B / 0 files | 6.611 MiB / 6 files | `E:/Warhammer/archive-reports/qa-artifacts/v2-home-qa-f4854559-acceptance` |
| `E:/Warhammer/qa-artifacts/glossary-release-76022d87-20261014` | 2026-10-14T14:41:39+00:00 | 1.841 MiB / 10 files | 4.715 MiB / 45 files | `E:/Warhammer/archive-reports/qa-artifacts/glossary-release-76022d87-20261014` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage2b-mfm-20261021` | 2026-10-21T08:18:42+00:00 | 6.482 MiB / 21 files | 46.733 KiB / 31 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-da-v2-stage2b-mfm-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-army-book-cover-restoration-20261020` | 2026-10-20T09:29:57+00:00 | 179.683 KiB / 5 files | 6.250 MiB / 20 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-army-book-cover-restoration-20261020` |
| `E:/Warhammer/qa-artifacts/mfm-v16-integration-2026-10-14` | 2026-10-14T12:53:36+00:00 | 183.906 KiB / 6 files | 6.079 MiB / 28 files | `E:/Warhammer/archive-reports/qa-artifacts/mfm-v16-integration-2026-10-14` |
| `E:/Warhammer/qa-artifacts/shell-allowlist-210a6aab-home-6880624e-7b49-4335-ab19-e457c693250e` | 2026-10-13T12:45:45+00:00 | 0 B / 0 files | 6.120 MiB / 6 files | `E:/Warhammer/archive-reports/qa-artifacts/shell-allowlist-210a6aab-home-6880624e-7b49-4335-ab19-e457c693250e` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage4a-20261020` | 2026-10-20T14:31:53+00:00 | 6.039 MiB / 19 files | 23.090 KiB / 7 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-sm-v2-stage4a-20261020` |
| `E:/Warhammer/qa-artifacts/b1-b3-pwa-production-20261027` | 2026-10-27T06:58:43+00:00 | 430.043 KiB / 13 files | 5.247 MiB / 20 files | `E:/Warhammer/archive-reports/qa-artifacts/b1-b3-pwa-production-20261027` |
| `E:/Warhammer/qa-artifacts/release-manifest-sw-investigation-20261026` | 2026-10-27T13:26:02+00:00 | 5.047 MiB / 21 files | 547.076 KiB / 13 files | `E:/Warhammer/archive-reports/qa-artifacts/release-manifest-sw-investigation-20261026` |
| `E:/Warhammer/qa-artifacts/recovery-admech-omega-caption-fix-20261018` | 2026-10-18T17:49:00+00:00 | 139.529 KiB / 2 files | 5.398 MiB / 15 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-admech-omega-caption-fix-20261018` |
| `E:/Warhammer/qa-artifacts/admech-omnispex-fix-f8f82f38-20261017` | 2026-10-17T17:27:25+00:00 | 2.061 MiB / 20 files | 3.408 MiB / 49 files | `E:/Warhammer/archive-reports/qa-artifacts/admech-omnispex-fix-f8f82f38-20261017` |
| `E:/Warhammer/qa-artifacts/admech-fnp-fix-6e4aa58e-20261016` | 2026-10-15T23:49:46+00:00 | 266.937 KiB / 3 files | 5.165 MiB / 7 files | `E:/Warhammer/archive-reports/qa-artifacts/admech-fnp-fix-6e4aa58e-20261016` |
| `E:/Warhammer/qa-artifacts/recovery-csm-megaroster-20261018` | 2026-10-17T22:47:05+00:00 | 2.235 MiB / 21 files | 3.085 MiB / 30 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-csm-megaroster-20261018` |
| `E:/Warhammer/qa-artifacts/csm-source-first-e77ea12d` | 2026-10-10T15:40:53+00:00 | 4.515 MiB / 27 files | 721.528 KiB / 9 files | `E:/Warhammer/archive-reports/qa-artifacts/csm-source-first-e77ea12d` |
| `E:/Warhammer/qa-artifacts/v2-only-integration-release-candidate-20261027` | 2026-10-27T09:49:28+00:00 | 87.762 KiB / 10 files | 5.006 MiB / 40 files | `E:/Warhammer/archive-reports/qa-artifacts/v2-only-integration-release-candidate-20261027` |
| `E:/Warhammer/qa-artifacts/five-books-physical-wargear-investigation-20261017` | 2026-10-17T17:47:15+00:00 | 4.856 MiB / 73 files | 117.805 KiB / 23 files | `E:/Warhammer/archive-reports/qa-artifacts/five-books-physical-wargear-investigation-20261017` |
| `E:/Warhammer/qa-artifacts/csm-blank-inventory-fix-20261014` | 2026-10-14T06:54:54+00:00 | 1.189 MiB / 8 files | 3.774 MiB / 11 files | `E:/Warhammer/archive-reports/qa-artifacts/csm-blank-inventory-fix-20261014` |
| `E:/Warhammer/qa-artifacts/ec-master-pageant-273b8bd3-20261015` | 2026-10-15T10:34:17+00:00 | 3.509 KiB / 1 files | 4.947 MiB / 14 files | `E:/Warhammer/archive-reports/qa-artifacts/ec-master-pageant-273b8bd3-20261015` |
| `E:/Warhammer/qa-artifacts/v2-only-eol-integration-candidate-20261027` | 2026-10-27T10:00:42+00:00 | 2.499 MiB / 72 files | 2.422 MiB / 85 files | `E:/Warhammer/archive-reports/qa-artifacts/v2-only-eol-integration-candidate-20261027` |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage1-20261019` | 2026-10-19T11:55:57+00:00 | 1.064 MiB / 15 files | 3.657 MiB / 12 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-tau-v2-stage1-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage5d-20261020` | 2026-10-20T20:47:44+00:00 | 366.585 KiB / 21 files | 4.115 MiB / 24 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-sm-v2-stage5d-20261020` |
| `E:/Warhammer/qa-artifacts/ec-wargear-integration-b1d69da4-20261017` | 2026-10-17T19:58:17+00:00 | 36.598 KiB / 11 files | 4.360 MiB / 13 files | `E:/Warhammer/archive-reports/qa-artifacts/ec-wargear-integration-b1d69da4-20261017` |
| `E:/Warhammer/qa-artifacts/phase2b-shell-final` | 2026-10-09T15:09:15+00:00 | 0 B / 0 files | 4.274 MiB / 20 files | `E:/Warhammer/archive-reports/qa-artifacts/phase2b-shell-final` |
| `E:/Warhammer/qa-artifacts/ec-four-books-live-47495cc5-20261015` | 2026-10-15T11:04:03+00:00 | 301.239 KiB / 5 files | 3.785 MiB / 14 files | `E:/Warhammer/archive-reports/qa-artifacts/ec-four-books-live-47495cc5-20261015` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage3b1-applicability-20261021` | 2026-10-21T10:53:21+00:00 | 619.606 KiB / 13 files | 3.423 MiB / 53 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-da-v2-stage3b1-applicability-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-dg-megaroster-20261018` | 2026-10-17T21:44:20+00:00 | 949.182 KiB / 16 files | 3.068 MiB / 21 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-dg-megaroster-20261018` |
| `E:/Warhammer/qa-artifacts/csm-player-scenario-20261014-34263d24-8422-4621-9e02-ddd8412c4e37` | 2026-10-13T23:31:53+00:00 | 611.721 KiB / 5 files | 3.378 MiB / 7 files | `E:/Warhammer/archive-reports/qa-artifacts/csm-player-scenario-20261014-34263d24-8422-4621-9e02-ddd8412c4e37` |
| `E:/Warhammer/qa-artifacts/v1-v2-home-audit-b7db5f31` | 2026-10-09T15:28:26+00:00 | 0 B / 0 files | 3.971 MiB / 12 files | `E:/Warhammer/archive-reports/qa-artifacts/v1-v2-home-audit-b7db5f31` |
| `E:/Warhammer/qa-artifacts/dg-upgrade-label-fix-bdd33731-90d9ee74-f0fe-454d-a0b5-5f0578df4f54` | 2026-10-13T16:31:20+00:00 | 2.932 MiB / 13 files | 973.488 KiB / 26 files | `E:/Warhammer/archive-reports/qa-artifacts/dg-upgrade-label-fix-bdd33731-90d9ee74-f0fe-454d-a0b5-5f0578df4f54` |
| `E:/Warhammer/qa-artifacts/f1-qa-wiring-20261028` | 2026-10-28T15:47:38+00:00 | 3.161 MiB / 15 files | 594.044 KiB / 12 files | `E:/Warhammer/archive-reports/qa-artifacts/f1-qa-wiring-20261028` |
| `E:/Warhammer/qa-artifacts/ec-native-fnp-a56909db-20261015` | 2026-10-15T10:13:40+00:00 | 1.680 KiB / 1 files | 3.722 MiB / 8 files | `E:/Warhammer/archive-reports/qa-artifacts/ec-native-fnp-a56909db-20261015` |
| `E:/Warhammer/qa-artifacts/dg-player-scenario-20261014-14f4ceb8-88a2-4ff6-80ba-bf5eb82ef66c` | 2026-10-13T22:50:05+00:00 | 602.193 KiB / 5 files | 3.110 MiB / 6 files | `E:/Warhammer/archive-reports/qa-artifacts/dg-player-scenario-20261014-14f4ceb8-88a2-4ff6-80ba-bf5eb82ef66c` |
| `E:/Warhammer/qa-artifacts/ec-v2-app-browser` | 2026-10-15T07:26:05+00:00 | 4.848 KiB / 2 files | 3.581 MiB / 6 files | `E:/Warhammer/archive-reports/qa-artifacts/ec-v2-app-browser` |
| `E:/Warhammer/qa-artifacts/dg-content0306-official-review-20261013` | 2026-10-13T18:24:16+00:00 | 22.541 KiB / 1 files | 3.500 MiB / 4 files | `E:/Warhammer/archive-reports/qa-artifacts/dg-content0306-official-review-20261013` |
| `E:/Warhammer/qa-artifacts/recovery-admech-megaroster-20261018` | 2026-10-17T22:17:07+00:00 | 1.074 MiB / 18 files | 2.313 MiB / 22 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-admech-megaroster-20261018` |
| `E:/Warhammer/qa-artifacts/am-omnispex-caption-fix-20261014` | 2026-10-13T23:13:44+00:00 | 0 B / 0 files | 3.232 MiB / 5 files | `E:/Warhammer/archive-reports/qa-artifacts/am-omnispex-caption-fix-20261014` |
| `E:/Warhammer/qa-artifacts/recovery-ec-omega-proposal-20261019` | 2026-10-19T06:44:00+00:00 | 3.132 MiB / 8 files | 39.020 KiB / 3 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-ec-omega-proposal-20261019` |
| `E:/Warhammer/qa-artifacts/am09-binding-ca771f43` | 2026-10-08T09:08:36+00:00 | 0 B / 0 files | 3.164 MiB / 9 files | `E:/Warhammer/archive-reports/qa-artifacts/am09-binding-ca771f43` |
| `E:/Warhammer/qa-artifacts/dg-content-04-70ccef5c-d9176fb8-9f3a-4baa-8ecf-c86f8e8037bb` | 2026-10-13T14:19:07+00:00 | 392.278 KiB / 19 files | 2.744 MiB / 31 files | `E:/Warhammer/archive-reports/qa-artifacts/dg-content-04-70ccef5c-d9176fb8-9f3a-4baa-8ecf-c86f8e8037bb` |
| `E:/Warhammer/qa-artifacts/am-datasheet-noise-022790fe` | 2026-10-08T11:48:45+00:00 | 739 B / 1 files | 2.931 MiB / 6 files | `E:/Warhammer/archive-reports/qa-artifacts/am-datasheet-noise-022790fe` |
| `E:/Warhammer/qa-artifacts/am-player-scenario-20261014-7545da94-f692-440f-ba70-36a107258fb3` | 2026-10-13T22:58:07+00:00 | 513.440 KiB / 5 files | 2.295 MiB / 6 files | `E:/Warhammer/archive-reports/qa-artifacts/am-player-scenario-20261014-7545da94-f692-440f-ba70-36a107258fb3` |
| `E:/Warhammer/qa-artifacts/wargear-contract-pilot-20261017` | 2026-10-17T18:47:27+00:00 | 84.942 KiB / 14 files | 2.636 MiB / 26 files | `E:/Warhammer/archive-reports/qa-artifacts/wargear-contract-pilot-20261017` |
| `E:/Warhammer/qa-artifacts/ability-release-20673f6d-20261014` | 2026-10-14T16:54:07+00:00 | 446.414 KiB / 6 files | 2.269 MiB / 27 files | `E:/Warhammer/archive-reports/qa-artifacts/ability-release-20673f6d-20261014` |
| `E:/Warhammer/qa-artifacts/dg-content03-closure-9c41816e-efe1bc3d-34f9-425c-b593-38075452ab47` | 2026-10-13T17:50:45+00:00 | 923.036 KiB / 12 files | 1.678 MiB / 16 files | `E:/Warhammer/archive-reports/qa-artifacts/dg-content03-closure-9c41816e-efe1bc3d-34f9-425c-b593-38075452ab47` |
| `E:/Warhammer/qa-artifacts/ec-v2-unified-browser` | 2026-10-15T07:46:34+00:00 | 0 B / 0 files | 2.409 MiB / 6 files | `E:/Warhammer/archive-reports/qa-artifacts/ec-v2-unified-browser` |
| `E:/Warhammer/qa-artifacts/core-b2-b3-concept-fallback-20261026` | 2026-10-26T07:34:35+00:00 | 920.955 KiB / 17 files | 1.421 MiB / 33 files | `E:/Warhammer/archive-reports/qa-artifacts/core-b2-b3-concept-fallback-20261026` |
| `E:/Warhammer/qa-artifacts/csm-wargear-integration-ca8567a1-20261017` | 2026-10-17T19:38:33+00:00 | 54.860 KiB / 11 files | 2.239 MiB / 17 files | `E:/Warhammer/archive-reports/qa-artifacts/csm-wargear-integration-ca8567a1-20261017` |
| `E:/Warhammer/qa-artifacts/unified-v2-technical-acceptance-ab41bb1f-20261017` | 2026-10-17T09:50:04+00:00 | 328.027 KiB / 25 files | 1.899 MiB / 13 files | `E:/Warhammer/archive-reports/qa-artifacts/unified-v2-technical-acceptance-ab41bb1f-20261017` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage3d-static-gameplay-20261021` | 2026-10-21T12:11:50+00:00 | 426.736 KiB / 11 files | 1.671 MiB / 44 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-da-v2-stage3d-static-gameplay-20261021` |
| `E:/Warhammer/qa-artifacts/v2-home-forensic-f4854559-1791893580312` | 2026-10-13T12:13:10+00:00 | 7.680 KiB / 1 files | 2.078 MiB / 4 files | `E:/Warhammer/archive-reports/qa-artifacts/v2-home-forensic-f4854559-1791893580312` |
| `E:/Warhammer/qa-artifacts/release-candidate-b1-b3-pwa-fresh-20261027` | 2026-10-27T13:26:02+00:00 | 2.064 MiB / 19 files | 10.765 KiB / 9 files | `E:/Warhammer/archive-reports/qa-artifacts/release-candidate-b1-b3-pwa-fresh-20261027` |
| `E:/Warhammer/qa-artifacts/exact-user-roster-preview` | 2026-10-10T13:15:47+00:00 | 721 B / 1 files | 1.961 MiB / 4 files | `E:/Warhammer/archive-reports/qa-artifacts/exact-user-roster-preview` |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage2-20261019` | 2026-10-19T12:26:33+00:00 | 1.582 MiB / 16 files | 330.222 KiB / 17 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-tau-v2-stage2-20261019` |
| `E:/Warhammer/qa-artifacts/home-core-glossary-smoke-20261014-8b2d75e0-3c99-4f13-96f5-5184a1f1d269` | 2026-10-14T08:08:48+00:00 | 8.729 KiB / 5 files | 1.890 MiB / 13 files | `E:/Warhammer/archive-reports/qa-artifacts/home-core-glossary-smoke-20261014-8b2d75e0-3c99-4f13-96f5-5184a1f1d269` |
| `E:/Warhammer/qa-artifacts/dg-navigation-acceptance-76a48286-20261013` | 2026-10-13T11:22:14+00:00 | 3.342 KiB / 1 files | 1.756 MiB / 5 files | `E:/Warhammer/archive-reports/qa-artifacts/dg-navigation-acceptance-76a48286-20261013` |
| `E:/Warhammer/qa-artifacts/dg-navigation-forensic-76a48286-20261013-1791884146259` | 2026-10-13T09:35:55+00:00 | 4.386 KiB / 1 files | 1.723 MiB / 2 files | `E:/Warhammer/archive-reports/qa-artifacts/dg-navigation-forensic-76a48286-20261013-1791884146259` |
| `E:/Warhammer/qa-artifacts/recovery-v2-four-original-nr373-validation-20261024` | 2026-10-23T21:44:35+00:00 | 1.633 MiB / 14 files | 25.317 KiB / 7 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-v2-four-original-nr373-validation-20261024` |
| `E:/Warhammer/qa-artifacts/core-b2-b3-resume-20261025` | 2026-10-25T11:02:27+00:00 | 842.547 KiB / 21 files | 824.956 KiB / 38 files | `E:/Warhammer/archive-reports/qa-artifacts/core-b2-b3-resume-20261025` |
| `E:/Warhammer/qa-artifacts/dg-icon-bearer-fix-82c5ad7b-20261017` | 2026-10-17T13:10:25+00:00 | 9.427 KiB / 2 files | 1.565 MiB / 7 files | `E:/Warhammer/archive-reports/qa-artifacts/dg-icon-bearer-fix-82c5ad7b-20261017` |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4g-final-20261019` | 2026-10-19T18:18:56+00:00 | 1.565 MiB / 26 files | 0 B / 0 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-tau-v2-stage4g-final-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage6a1-enrollment-bytes-20261021` | 2026-10-21T18:54:11+00:00 | 1.488 MiB / 57 files | 56.691 KiB / 39 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-da-v2-stage6a1-enrollment-bytes-20261021` |
| `E:/Warhammer/qa-artifacts/mega-glossary-v2` | 2026-10-15T07:48:06+00:00 | 16.670 KiB / 2 files | 1.498 MiB / 32 files | `E:/Warhammer/archive-reports/qa-artifacts/mega-glossary-v2` |
| `E:/Warhammer/qa-artifacts/ability-category-76022d87-20261014` | 2026-10-14T15:44:45+00:00 | 0 B / 0 files | 1.428 MiB / 30 files | `E:/Warhammer/archive-reports/qa-artifacts/ability-category-76022d87-20261014` |
| `E:/Warhammer/qa-artifacts/recovery-sm-mfm-v16-enrollment-20261020` | 2026-10-20T10:31:32+00:00 | 670.083 KiB / 8 files | 718.870 KiB / 15 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-sm-mfm-v16-enrollment-20261020` |
| `E:/Warhammer/qa-artifacts/core-b2-b3-integration-20261026` | 2026-10-26T09:39:12+00:00 | 35.084 KiB / 9 files | 1.293 MiB / 61 files | `E:/Warhammer/archive-reports/qa-artifacts/core-b2-b3-integration-20261026` |
| `E:/Warhammer/qa-artifacts/core-b1-integration-source-sync-20261025` | 2026-10-25T09:48:50+00:00 | 807.300 KiB / 21 files | 486.760 KiB / 30 files | `E:/Warhammer/archive-reports/qa-artifacts/core-b1-integration-source-sync-20261025` |
| `E:/Warhammer/qa-artifacts/release-remainder-df80f6a3-20261017` | 2026-10-17T10:40:36+00:00 | 139.675 KiB / 3 files | 1.047 MiB / 1 files | `E:/Warhammer/archive-reports/qa-artifacts/release-remainder-df80f6a3-20261017` |
| `E:/Warhammer/qa-artifacts/charge-family-implementation-ee6387be-20261016` | 2026-10-15T22:59:34+00:00 | 1.096 MiB / 3 files | 20.281 KiB / 4 files | `E:/Warhammer/archive-reports/qa-artifacts/charge-family-implementation-ee6387be-20261016` |
| `E:/Warhammer/qa-artifacts/minimal-pwa-recovery-integration-20261027` | 2026-10-27T13:25:59+00:00 | 1.036 MiB / 8 files | 24.332 KiB / 17 files | `E:/Warhammer/archive-reports/qa-artifacts/minimal-pwa-recovery-integration-20261027` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage2a-foundation-20261022` | 2026-10-27T12:56:59+00:00 | 871.354 KiB / 19 files | 207.076 KiB / 47 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-ba-v2-stage2a-foundation-20261022` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-real-newrecruit37-p2-validation-20261023` | 2026-10-23T08:51:18+00:00 | 216.803 KiB / 9 files | 808.657 KiB / 8 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-ba-v2-real-newrecruit37-p2-validation-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage1-independent-review-20261020` | 2026-10-20T10:23:37+00:00 | 513.082 KiB / 14 files | 487.672 KiB / 17 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-sm-v2-stage1-independent-review-20261020` |
| `E:/Warhammer/qa-artifacts/five-books-effect-root-causes-ee6387be-20261016` | 2026-10-15T22:16:54+00:00 | 793.477 KiB / 24 files | 156.766 KiB / 14 files | `E:/Warhammer/archive-reports/qa-artifacts/five-books-effect-root-causes-ee6387be-20261016` |
| `E:/Warhammer/qa-artifacts/recovery-crlf-integrity-20261018` | 2026-10-17T21:07:42+00:00 | 52.856 KiB / 8 files | 847.519 KiB / 14 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-crlf-integrity-20261018` |
| `E:/Warhammer/qa-artifacts/core-b1-term-bindings-20261025` | 2026-10-25T09:45:14+00:00 | 350.840 KiB / 8 files | 493.219 KiB / 22 files | `E:/Warhammer/archive-reports/qa-artifacts/core-b1-term-bindings-20261025` |
| `E:/Warhammer/qa-artifacts/recovery-v2-stage58-universal-knownness-20261023` | 2026-10-23T14:02:11+00:00 | 713.610 KiB / 5 files | 14.901 KiB / 3 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-v2-stage58-universal-knownness-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage3b-chapter-context-20261021` | 2026-10-21T10:25:06+00:00 | 342.919 KiB / 10 files | 336.984 KiB / 36 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-da-v2-stage3b-chapter-context-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-v2-real-newrecruit373-validation-20261023` | 2026-10-23T18:13:37+00:00 | 635.971 KiB / 18 files | 14.674 KiB / 3 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-v2-real-newrecruit373-validation-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage3a-mechanics-20261021` | 2026-10-21T09:42:12+00:00 | 460.167 KiB / 12 files | 170.044 KiB / 39 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-da-v2-stage3a-mechanics-20261021` |
| `E:/Warhammer/qa-artifacts/dg-errata-title-fix-70ccef5c-5513bb9f-e1fa-4ba9-a43f-f6a821138f6b` | 2026-10-13T14:27:49+00:00 | 239.586 KiB / 5 files | 346.145 KiB / 4 files | `E:/Warhammer/archive-reports/qa-artifacts/dg-errata-title-fix-70ccef5c-5513bb9f-e1fa-4ba9-a43f-f6a821138f6b` |
| `E:/Warhammer/qa-artifacts/recovery-v2-sm-appqa-independent-review-20261023` | 2026-10-23T19:44:06+00:00 | 22.154 KiB / 3 files | 537.562 KiB / 7 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-v2-sm-appqa-independent-review-20261023` |
| `E:/Warhammer/qa-artifacts/unified-v2-safety-backup-20261017` | 2026-10-17T20:28:47+00:00 | 535.328 KiB / 2 files | 0 B / 0 files | `E:/Warhammer/archive-reports/qa-artifacts/unified-v2-safety-backup-20261017` |
| `E:/Warhammer/qa-artifacts/glossary-single-owner-4a8b9a29-20261014` | 2026-10-14T13:59:31+00:00 | 0 B / 0 files | 512.274 KiB / 8 files | `E:/Warhammer/archive-reports/qa-artifacts/glossary-single-owner-4a8b9a29-20261014` |
| `E:/Warhammer/qa-artifacts/glossary-dependencies-bfd04cae-b070687c-0a02-44b8-afcd-be37dc18bb6a` | 2026-10-13T13:13:46+00:00 | 0 B / 0 files | 490.420 KiB / 8 files | `E:/Warhammer/archive-reports/qa-artifacts/glossary-dependencies-bfd04cae-b070687c-0a02-44b8-afcd-be37dc18bb6a` |
| `E:/Warhammer/qa-artifacts/v2-only-production-20261027` | 2026-10-27T11:29:13+00:00 | 379.231 KiB / 9 files | 103.233 KiB / 1 files | `E:/Warhammer/archive-reports/qa-artifacts/v2-only-production-20261027` |
| `E:/Warhammer/qa-artifacts/unified-v2-recovery-20261017` | 2026-10-17T20:38:25+00:00 | 2.535 KiB / 4 files | 471.670 KiB / 5 files | `E:/Warhammer/archive-reports/qa-artifacts/unified-v2-recovery-20261017` |
| `E:/Warhammer/qa-artifacts/recovery-sm-native-mfm-stage4a-20261020` | 2026-10-20T14:22:00+00:00 | 447.059 KiB / 1 files | 0 B / 0 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-sm-native-mfm-stage4a-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4d-20261019` | 2026-10-19T16:00:58+00:00 | 310.284 KiB / 62 files | 83.468 KiB / 1 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-tau-v2-stage4d-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4c-20261019` | 2026-10-19T15:46:08+00:00 | 286.752 KiB / 53 files | 70.866 KiB / 1 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-tau-v2-stage4c-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-tau-student-source-scenario-review-20261020` | 2026-10-20T07:41:36+00:00 | 47.392 KiB / 6 files | 261.774 KiB / 5 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-tau-student-source-scenario-review-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-csm-omega-proposal-4bef79a7-20261018` | 2026-10-18T12:44:51+00:00 | 248.336 KiB / 3 files | 22.827 KiB / 2 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-csm-omega-proposal-4bef79a7-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4b-20261019` | 2026-10-19T13:48:11+00:00 | 236.731 KiB / 24 files | 17.905 KiB / 2 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-tau-v2-stage4b-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage3-20261019` | 2026-10-19T12:46:54+00:00 | 193.413 KiB / 5 files | 54.191 KiB / 2 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-tau-v2-stage3-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-qa-census-eca6c72d-20261018` | 2026-10-18T15:48:58+00:00 | 45.699 KiB / 7 files | 170.471 KiB / 24 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-qa-census-eca6c72d-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4-20261019` | 2026-10-19T13:20:45+00:00 | 154.459 KiB / 29 files | 52.388 KiB / 13 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-tau-v2-stage4-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4g-20261019` | 2026-10-19T17:38:40+00:00 | 176.884 KiB / 20 files | 5.067 KiB / 1 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-tau-v2-stage4g-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage4c-20261020` | 2026-10-20T15:35:58+00:00 | 106.905 KiB / 18 files | 27.076 KiB / 11 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-sm-v2-stage4c-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4g-completion-20261019` | 2026-10-19T18:14:32+00:00 | 127.955 KiB / 3 files | 0 B / 0 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-tau-v2-stage4g-completion-20261019` |
| `E:/Warhammer/qa-artifacts/legacy-pending-patches` | 2026-10-13T13:54:10+00:00 | 3.029 KiB / 2 files | 120.845 KiB / 5 files | `E:/Warhammer/archive-reports/qa-artifacts/legacy-pending-patches` |
| `E:/Warhammer/qa-artifacts/recovery-admech-five-qa-fixes-20261018` | 2026-10-18T20:14:38+00:00 | 24.131 KiB / 6 files | 93.263 KiB / 58 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-admech-five-qa-fixes-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage4b-20261020` | 2026-10-20T15:03:10+00:00 | 69.794 KiB / 5 files | 30.483 KiB / 12 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-sm-v2-stage4b-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-tau-omega-reviewed-addendum-20261020` | 2026-10-20T08:15:57+00:00 | 77.582 KiB / 6 files | 21.183 KiB / 4 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-tau-omega-reviewed-addendum-20261020` |
| `E:/Warhammer/qa-artifacts/csm-wargear-contracts-20261017` | 2026-10-17T18:53:00+00:00 | 90.562 KiB / 13 files | 8.183 KiB / 2 files | `E:/Warhammer/archive-reports/qa-artifacts/csm-wargear-contracts-20261017` |
| `E:/Warhammer/qa-artifacts/dg-content-05-official-6dfd3360-6dee-4a77-af71-9071ddf875c8` | 2026-10-13T14:34:35+00:00 | 76.059 KiB / 4 files | 0 B / 0 files | `E:/Warhammer/archive-reports/qa-artifacts/dg-content-05-official-6dfd3360-6dee-4a77-af71-9071ddf875c8` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage2a-20261020` | 2026-10-20T12:47:52+00:00 | 15.971 KiB / 3 files | 56.659 KiB / 19 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-sm-v2-stage2a-20261020` |
| `E:/Warhammer/qa-artifacts/stale-test-input-fix-ab41bb1f-20261017` | 2026-10-17T09:57:16+00:00 | 50.927 KiB / 5 files | 18.244 KiB / 17 files | `E:/Warhammer/archive-reports/qa-artifacts/stale-test-input-fix-ab41bb1f-20261017` |
| `E:/Warhammer/qa-artifacts/wargear-schema-capabilities-20261017` | 2026-10-17T19:19:27+00:00 | 21.783 KiB / 5 files | 42.317 KiB / 2 files | `E:/Warhammer/archive-reports/qa-artifacts/wargear-schema-capabilities-20261017` |
| `E:/Warhammer/qa-artifacts/ability-presentation-synthetic` | 2026-10-09T09:33:22+00:00 | 59.658 KiB / 1 files | 0 B / 0 files | `E:/Warhammer/archive-reports/qa-artifacts/ability-presentation-synthetic` |
| `E:/Warhammer/qa-artifacts/recovery-v2-sm-newrecruit373-original-validation-20261023` | 2026-10-23T18:42:07+00:00 | 57.205 KiB / 3 files | 0 B / 0 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-v2-sm-newrecruit373-original-validation-20261023` |
| `E:/Warhammer/qa-artifacts/wargear-compatibility-a316ff0c-20261017` | 2026-10-17T18:48:22+00:00 | 41.856 KiB / 2 files | 3.802 KiB / 1 files | `E:/Warhammer/archive-reports/qa-artifacts/wargear-compatibility-a316ff0c-20261017` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage2a-foundation-20261021` | 2026-10-21T07:53:07+00:00 | 22.438 KiB / 9 files | 18.864 KiB / 17 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-da-v2-stage2a-foundation-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-tau-omega-final-reconciliation-20261020` | 2026-10-20T08:06:31+00:00 | 15.180 KiB / 2 files | 24.987 KiB / 1 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-tau-omega-final-reconciliation-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage3a-20261020` | 2026-10-20T13:39:49+00:00 | 24.878 KiB / 18 files | 5.458 KiB / 2 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-sm-v2-stage3a-20261020` |
| `E:/Warhammer/qa-artifacts/source-completeness-gate-1af1d51f-20261017` | 2026-10-17T10:15:41+00:00 | 5.523 KiB / 2 files | 22.836 KiB / 2 files | `E:/Warhammer/archive-reports/qa-artifacts/source-completeness-gate-1af1d51f-20261017` |
| `E:/Warhammer/qa-artifacts/v2-only-baseline-adjudication-20261027` | 2026-10-27T08:46:55+00:00 | 10.324 KiB / 3 files | 17.515 KiB / 13 files | `E:/Warhammer/archive-reports/qa-artifacts/v2-only-baseline-adjudication-20261027` |
| `E:/Warhammer/qa-artifacts/unified-v2-five-books-release-df80f6a3-20261017` | 2026-10-17T11:19:26+00:00 | 27.344 KiB / 9 files | 0 B / 0 files | `E:/Warhammer/archive-reports/qa-artifacts/unified-v2-five-books-release-df80f6a3-20261017` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage3b-20261020` | 2026-10-20T13:51:25+00:00 | 24.737 KiB / 22 files | 0 B / 0 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-sm-v2-stage3b-20261020` |
| `E:/Warhammer/qa-artifacts/wargear-technical-review-b1d69da4-20261017` | 2026-10-17T20:08:35+00:00 | 24.135 KiB / 2 files | 0 B / 0 files | `E:/Warhammer/archive-reports/qa-artifacts/wargear-technical-review-b1d69da4-20261017` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage2c-20261020` | 2026-10-20T13:13:15+00:00 | 13.597 KiB / 7 files | 8.833 KiB / 2 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-sm-v2-stage2c-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-reimport-attachments-investigation-20261020` | 2026-10-19T21:20:06+00:00 | 15.328 KiB / 4 files | 7.060 KiB / 2 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-reimport-attachments-investigation-20261020` |
| `E:/Warhammer/qa-artifacts/pwa-historical-failure-20261027` | 2026-10-26T22:17:39+00:00 | 11.481 KiB / 10 files | 6.474 KiB / 5 files | `E:/Warhammer/archive-reports/qa-artifacts/pwa-historical-failure-20261027` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage4c-shared-capabilities-20261021` | 2026-10-21T13:32:51+00:00 | 5.002 KiB / 1 files | 11.818 KiB / 1 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-da-v2-stage4c-shared-capabilities-20261021` |
| `E:/Warhammer/qa-artifacts/ec-foundation-20673f6d-20261014` | 2026-10-14T18:05:40+00:00 | 0 B / 0 files | 12.784 KiB / 2 files | `E:/Warhammer/archive-reports/qa-artifacts/ec-foundation-20673f6d-20261014` |
| `E:/Warhammer/qa-evidence/o1-core-diagnosis-20261031` | 2026-10-30T23:25:20+00:00 | 5.546 KiB / 2 files | 1.809 KiB / 4 files | `E:/Warhammer/archive-reports/qa-evidence/o1-core-diagnosis-20261031` |
| `E:/Warhammer/qa-artifacts/recovery-tyranids-trygon-source-choice-fix-20261019` | 2026-10-19T10:28:39+00:00 | 1.828 KiB / 1 files | 4.788 KiB / 7 files | `E:/Warhammer/archive-reports/qa-artifacts/recovery-tyranids-trygon-source-choice-fix-20261019` |
| `E:/Warhammer/qa-artifacts/release-candidate-b1-b3-pwa-20261027` | 2026-10-27T13:26:01+00:00 | 4.308 KiB / 3 files | 1.954 KiB / 2 files | `E:/Warhammer/archive-reports/qa-artifacts/release-candidate-b1-b3-pwa-20261027` |
| `E:/Warhammer/qa-artifacts/admech-native-fnp-fix-6e4aa58e-20261016` | 2026-10-15T23:47:44+00:00 | 1.723 KiB / 1 files | 996 B / 1 files | `E:/Warhammer/archive-reports/qa-artifacts/admech-native-fnp-fix-6e4aa58e-20261016` |
| `E:/Warhammer/qa-artifacts/glossary-forensic-bfd04cae-96819709-f747-41b7-82b6-7228fb409f68` | 2026-10-13T13:01:30+00:00 | 0 B / 0 files | 0 B / 0 files | `E:/Warhammer/archive-reports/qa-artifacts/glossary-forensic-bfd04cae-96819709-f747-41b7-82b6-7228fb409f68` |
| `E:/Warhammer/qa-artifacts/v2-home-forensic-f4854559-1791893512065` | 2026-10-13T12:11:52+00:00 | 0 B / 0 files | 0 B / 0 files | `E:/Warhammer/archive-reports/qa-artifacts/v2-home-forensic-f4854559-1791893512065` |

### Old loose files at QA roots

| Path | Modified UTC | Size | Proposal |
| --- | --- | --- | --- |
| `E:/Warhammer/qa-artifacts/core-preintegration-audit.mjs` | 2026-10-09T22:14:49.512224+00:00 | 8.830 KiB | SAFE_TO_DELETE after archive conditions |
| `E:/Warhammer/qa-artifacts/core-preintegration-targets.mjs` | 2026-10-09T22:22:07.635700+00:00 | 4.355 KiB | SAFE_TO_DELETE after archive conditions |
| `E:/Warhammer/qa-artifacts/dg-fixed-oracle-build.cjs` | 2026-10-17T23:12:21.041646+00:00 | 9.718 KiB | SAFE_TO_DELETE after archive conditions |
| `E:/Warhammer/qa-artifacts/effective-profile-annotations-browser.log` | 2026-10-10T14:20:32.943640+00:00 | 27.743 KiB | SAFE_TO_DELETE after archive conditions |
| `E:/Warhammer/qa-artifacts/effective-profile-annotations-integration.log` | 2026-10-10T14:20:01.117592+00:00 | 3.732 KiB | SAFE_TO_DELETE after archive conditions |
| `E:/Warhammer/qa-artifacts/f1-diagnosis-before-edit.log` | 2026-10-28T12:50:58.271923+00:00 | 10.997 KiB | SAFE_TO_DELETE after archive conditions |
| `E:/Warhammer/qa-artifacts/f1-table-schema.jsonl` | 2026-10-28T14:11:15.582308+00:00 | 24.472 KiB | SAFE_TO_DELETE after archive conditions |
| `E:/Warhammer/qa-artifacts/glossary-display-review.log` | 2026-10-14T14:11:36.500099+00:00 | 1.938 KiB | SAFE_TO_DELETE after archive conditions |
| `E:/Warhammer/qa-artifacts/glossary-owner-parity.log` | 2026-10-14T14:13:52.337144+00:00 | 244 B | SAFE_TO_DELETE after archive conditions |
| `E:/Warhammer/qa-artifacts/recovery-sm-native-mfm-stage4a-20261020-mapping-review.py` | 2026-10-20T14:22:00.097013+00:00 | 9.218 KiB | SAFE_TO_DELETE after archive conditions |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage4b-20261020-gameplay-qa.tmp.json` | 2026-10-20T14:59:41.308372+00:00 | 25.062 KiB | KEEP: archive text first |
| `E:/Warhammer/qa-artifacts/sm-original373-readonly.mjs` | 2026-10-23T18:41:30.961724+00:00 | 2.602 KiB | SAFE_TO_DELETE after archive conditions |
| `E:/Warhammer/qa-artifacts/source-completeness-gate-1af1d51f-20261017-mutations.log` | 2026-10-17T10:09:30.959827+00:00 | 12.229 KiB | SAFE_TO_DELETE after archive conditions |
| `E:/Warhammer/qa-artifacts/wargear-schema-regression-preqa.json` | 2026-10-17T19:15:43.797870+00:00 | 12.415 KiB | KEEP: archive text first |

### Embedded baseline worktrees

| Path | Dirty entries | HEAD commits outside remotes | Shared local-branch commits | Common store |
| --- | --- | --- | --- | --- |
| `E:/Warhammer/qa-evidence/test-speedup-20261030/baseline` | 0 | 0 | 16 | E:/Warhammer/warhammer-v2-recovery/.git |
| `E:/Warhammer/qa-artifacts/f1-detachment-recipients-resume-20261028/baseline-checkout` | 0 | 0 | 16 | E:/Warhammer/warhammer-v2-recovery/.git |
| `E:/Warhammer/qa-artifacts/f1-detachment-recipients-20261028/baseline-checkout` | 0 | 0 | 16 | E:/Warhammer/warhammer-v2-recovery/.git |

All three are clean with zero checkout-HEAD commits outside remote-tracking refs. Their common repository still has 16 branch commits outside tracking refs, preserved in the retained shared Git store. Reparse entries inside old QA material are not independent physical copies and must not be followed during a later archive/removal.

## 5. C — E:/Codex

Read-only snapshot: 2026-11-16T07:13:21.972213+00:00 to 2026-11-16T07:13:22.708903+00:00 (UTC). Exactly one metadata traversal, 0.737 seconds. No file contents were opened; no session, database, configuration, plugin manifest or email was read. No deletion, move, Git, build, test or cleanup command was run. Warhammer was not scanned.

Measured regular-file logical size: **19.360 GiB** (20,787,484,712 bytes), 34,529 files and 6,922 descendant directories. Reparse/link entries skipped: 0; cloud/offline entries skipped: 0; metadata errors: 0.

### Recommendation

**No unconditional SAFE_TO_DELETE item is established.** Keep sessions, archived history, current app/state/settings/authentication databases, installed plugins/skills/runtimes and user-created visualizations. A cache or `.tmp` name and an old date do not prove unused or rebuildable. Current work and active session cannot be identified reliably from metadata alone. Temporary/log/cache candidates below are UNCLEAR pending specific ownership, inactivity and supported rebuildability evidence; do not clear entire Codex trees.

### Immediate directory composition

| Directory | Logical size | Folder modified UTC | Latest descendant metadata UTC |
| --- | ---: | --- | --- |
| `E:/Codex/data` | 17.809 GiB | 2026-08-27T18:34:31.116098+00:00 | 2026-11-16T07:12:56.679912+00:00 |
| `E:/Codex/cache` | 1.504 GiB | 2026-08-27T18:49:08.261004+00:00 | 2026-10-19T07:41:39.250698+00:00 |
| `E:/Codex/projects` | 48.304 MiB | 2026-08-27T07:00:09.098005+00:00 | 2026-08-27T18:54:29.735031+00:00 |
| `E:/Codex/temp` | 22.269 KiB | 2026-08-29T09:42:48.662768+00:00 | 2026-08-29T09:42:48.674351+00:00 |
| `E:/Codex/backups` | 0 B | 2026-09-09T11:16:33.909025+00:00 | 2026-09-09T11:16:33.909025+00:00 |

Root-level files are included in the total but not the directory-only table. Detailed largest-file and recent-file paths are in `codex.json`; they are metadata records, not content inspection.

### Non-overlapping file categories

Category assignment uses path/name heuristics. These totals partition the measured regular files; they do not establish app lifecycle or deletion authority.

| Category | Logical size | Files | Latest file modified UTC |
| --- | ---: | ---: | --- |
| sessions_and_history | 11.606 GiB | 2,126 | 2026-11-16T07:12:56.679912+00:00 |
| state_settings_and_databases | 4.838 GiB | 47 | 2026-11-16T07:11:15.529378+00:00 |
| runtimes_and_dependencies | 1.482 GiB | 21,445 | 2026-10-19T07:41:39.250197+00:00 |
| plugins_and_skills | 697.622 MiB | 9,436 | 2026-11-16T00:59:13.975021+00:00 |
| app_other_or_unclassified | 488.678 MiB | 691 | 2026-11-16T07:12:46.280030+00:00 |
| logs | 147.725 MiB | 92 | 2026-11-16T07:06:31.246916+00:00 |
| other_caches | 86.920 MiB | 9 | 2026-11-16T00:59:08.803131+00:00 |
| visualizations_and_artifacts | 43.207 MiB | 500 | 2026-08-27T08:08:37+00:00 |
| temporary_named_paths | 3.845 MiB | 183 | 2026-11-15T13:33:32.141025+00:00 |

### Named areas and cleanup classification

Parent/child rows overlap and must not be summed. Modification dates are UTC, not last access. A very recent file can show activity; an old one can still be essential.

| Path | Logical size | Class | Latest descendant modified UTC | Reason |
| --- | ---: | --- | --- | --- |
| `E:/Codex/data/.codex/sessions` | 10.937 GiB | KEEP | 2026-11-16T07:12:56.679912+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/cache` | 1.504 GiB | UNCLEAR | 2026-10-19T07:41:39.250698+00:00 | Cache container can include installed runtime/plugin assets, downloads and current state. No authoritative unused/rebuildable proof; do not clear wholesale. |
| `E:/Codex/cache/codex-runtimes` | 1.504 GiB | KEEP | 2026-10-19T07:41:39.250698+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/archived_sessions` | 684.996 MiB | KEEP | 2026-11-01T10:51:29.213509+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins` | 534.712 MiB | KEEP | 2026-11-16T00:59:13.975021+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp` | 160.811 MiB | UNCLEAR | 2026-11-15T13:33:27.225341+00:00 | Name suggests scratch/log output, but no process ownership, open handles, rebuildability or task-retention proof was collected. Do not clear while the app/current work may use it. |
| `E:/Codex/data/.codex/cache` | 86.920 MiB | UNCLEAR | 2026-11-16T00:59:08.803131+00:00 | Cache container can include installed runtime/plugin assets, downloads and current state. No authoritative unused/rebuildable proof; do not clear wholesale. |
| `E:/Codex/data/.codex/plugins/cache` | 71.110 MiB | KEEP | 2026-11-16T00:59:13.975021+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins` | 65.256 MiB | KEEP | 2026-08-20T20:49:03.984596+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/bundled-marketplaces/openai-bundled.staging-7b54fe7e-eab3-40bb-9779-57fe087e17b9/plugins` | 64.263 MiB | KEEP | 2026-07-19T19:52:50.400312+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/bundled-marketplaces/openai-bundled/plugins` | 27.426 MiB | KEEP | 2026-11-15T13:33:27.133403+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/visualizations` | 26.553 MiB | KEEP | 2026-10-31T15:10:26.579378+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/cache/openai-curated-remote/openai-templates/0.1.1/skills` | 25.831 MiB | KEEP | 2026-10-20T19:37:38.711137+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/shopify/skills` | 6.222 MiB | KEEP | 2026-08-20T20:49:03.171417+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/cache/codex-runtimes/codex-primary-runtime/plugins` | 5.484 MiB | KEEP | 2026-08-27T08:14:02+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/cache/codex-runtimes/codex-primary-runtime/plugins/openai-primary-runtime/plugins/presentations/skills` | 4.500 MiB | KEEP | 2026-08-27T08:14:02+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/cache/openai-bundled/visualize/1.0.97/skills` | 3.776 MiB | KEEP | 2026-11-15T13:33:27.745444+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/bundled-marketplaces/openai-bundled/plugins/visualize/skills` | 3.776 MiB | KEEP | 2026-11-15T13:33:26.164934+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/cache/openai-curated-remote/visualize/1.0.103/skills` | 3.773 MiB | KEEP | 2026-11-14T01:57:14.048602+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/zoom/skills` | 3.295 MiB | KEEP | 2026-08-20T20:49:03.960016+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/nvidia/skills` | 3.174 MiB | KEEP | 2026-08-20T20:49:02.922357+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/wix/skills` | 1.732 MiB | KEEP | 2026-08-20T20:49:03.547717+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/cloudflare/skills` | 1.577 MiB | KEEP | 2026-08-20T20:49:00.939714+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/figma/skills` | 1.498 MiB | KEEP | 2026-08-20T20:49:01.782268+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/moody-s/skills` | 998.887 KiB | KEEP | 2026-08-20T20:49:02.192292+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/cache/openai-curated-remote/sites/1.1.6/skills` | 893.148 KiB | KEEP | 2026-11-10T19:59:32.690199+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/life-science-research/skills` | 800.113 KiB | KEEP | 2026-08-20T20:49:02.111285+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/hugging-face/skills` | 795.286 KiB | KEEP | 2026-08-20T20:49:01.983779+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/cache/openai-primary-runtime/presentations/26.1112.11011/skills` | 678.031 KiB | KEEP | 2026-11-13T06:40:47.360681+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/google-drive/skills` | 642.534 KiB | KEEP | 2026-08-20T20:49:01.903273+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/twilio-developer-kit/skills` | 625.284 KiB | KEEP | 2026-08-20T20:49:03.343653+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/vercel/skills` | 585.198 KiB | KEEP | 2026-08-20T20:49:03.394763+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/render/skills` | 502.647 KiB | KEEP | 2026-08-20T20:49:03.077371+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/catalyst-by-zoho/skills` | 489.509 KiB | KEEP | 2026-08-20T20:49:00.788707+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/build-web-data-visualization/skills` | 464.111 KiB | KEEP | 2026-08-20T20:49:00.761702+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/google-calendar/skills` | 444.518 KiB | KEEP | 2026-08-20T20:49:01.871768+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/cache/openai-curated/google-calendar/2f1a8948/skills` | 443.731 KiB | KEEP | 2026-07-09T21:04:30.315331+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/codex-security/skills` | 434.455 KiB | KEEP | 2026-08-20T20:49:00.985220+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/cache/codex-runtimes/codex-primary-runtime/plugins/openai-primary-runtime/plugins/documents/skills` | 423.261 KiB | KEEP | 2026-08-27T08:13:41+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/cache/openai-primary-runtime/documents/26.1112.11011/skills` | 421.188 KiB | KEEP | 2026-11-13T06:40:47.164425+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/build-web-apps/skills` | 410.364 KiB | KEEP | 2026-08-20T20:49:00.698202+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/temporal/skills` | 364.833 KiB | KEEP | 2026-08-20T20:49:03.283443+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/morningstar/skills` | 317.965 KiB | KEEP | 2026-08-20T20:49:02.208792+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/daloopa/skills` | 314.799 KiB | KEEP | 2026-08-20T20:49:01.017220+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/notion/skills` | 310.393 KiB | KEEP | 2026-08-20T20:49:02.372298+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/skills` | 304.626 KiB | KEEP | 2026-11-15T13:33:22.068058+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/superpowers/skills` | 299.562 KiB | KEEP | 2026-08-20T20:49:03.253431+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/hyperframes/skills` | 282.575 KiB | KEEP | 2026-08-20T20:49:02.012779+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/cache/openai-primary-runtime/spreadsheets/26.1112.11011/skills` | 272.689 KiB | KEEP | 2026-11-13T06:40:47.424726+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/netlify/skills` | 267.806 KiB | KEEP | 2026-08-20T20:49:02.263792+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/expo/skills` | 264.100 KiB | KEEP | 2026-08-20T20:49:01.189733+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/build-ios-apps/skills` | 260.963 KiB | KEEP | 2026-08-20T20:49:00.636196+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/midpage/skills` | 245.650 KiB | KEEP | 2026-08-20T20:49:02.153785+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/base44/skills` | 239.235 KiB | KEEP | 2026-08-20T20:49:00.578197+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/mixpanel-headless/skills` | 235.673 KiB | KEEP | 2026-08-20T20:49:02.166785+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/cache/openai-curated-remote/work-pets/0.1.6/skills` | 200.769 KiB | KEEP | 2026-09-29T06:16:50.318246+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/cache/codex-runtimes/codex-primary-runtime/plugins/openai-primary-runtime/plugins/spreadsheets/skills` | 183.140 KiB | KEEP | 2026-08-27T08:13:38+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/boltz-api-cli/skills` | 182.060 KiB | KEEP | 2026-08-20T20:49:00.597696+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/heygen/skills` | 156.158 KiB | KEEP | 2026-08-20T20:49:01.930773+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/datasite/skills` | 152.502 KiB | KEEP | 2026-08-20T20:49:01.038220+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/atlassian-rovo/skills` | 148.777 KiB | KEEP | 2026-08-20T20:49:00.559690+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/openai-developers/skills` | 145.585 KiB | KEEP | 2026-08-20T20:49:02.941856+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/dnb-finance-analytics/skills` | 114.417 KiB | KEEP | 2026-08-20T20:49:01.132727+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/remotion/skills` | 112.951 KiB | KEEP | 2026-08-20T20:49:03.026364+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/gmail/skills` | 97.357 KiB | KEEP | 2026-08-20T20:49:01.855268+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/ngs-analysis/skills` | 91.818 KiB | KEEP | 2026-08-20T20:49:02.315297+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/lib/tools/skills` | 88.255 KiB | KEEP | 2026-08-27T08:09:32+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/github/skills` | 82.160 KiB | KEEP | 2026-08-20T20:49:01.845268+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/build-macos-apps/skills` | 80.752 KiB | KEEP | 2026-08-20T20:49:00.651196+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/openai-ads-conversions/skills` | 80.553 KiB | KEEP | 2026-08-20T20:49:02.928856+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/cache/openai-curated-remote/pages/0.1.26/skills` | 75.388 KiB | KEEP | 2026-10-27T01:58:07.123271+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/supabase/skills` | 74.128 KiB | KEEP | 2026-08-20T20:49:03.211928+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/cache/openai-primary-runtime/template-creator/26.1112.11011/skills` | 71.697 KiB | KEEP | 2026-11-13T06:40:47.421226+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/cache/codex-runtimes/codex-primary-runtime/plugins/openai-primary-runtime/plugins/template-creator/skills` | 71.683 KiB | KEEP | 2026-08-27T08:13:38+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/box/skills` | 71.250 KiB | KEEP | 2026-08-20T20:49:00.604196+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/chronograph-lp/skills` | 60.486 KiB | KEEP | 2026-08-20T20:49:00.802707+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/slack/skills` | 59.839 KiB | KEEP | 2026-08-20T20:49:03.191425+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/cache/openai-curated/slack/2f1a8948/skills` | 59.286 KiB | KEEP | 2026-07-09T21:04:37.674478+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/outlook-calendar/skills` | 52.444 KiB | KEEP | 2026-08-20T20:49:02.950856+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/bundled-marketplaces/openai-bundled.staging-7b54fe7e-eab3-40bb-9779-57fe087e17b9/plugins/visualize/skills` | 51.147 KiB | KEEP | 2026-07-19T19:52:49.584702+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/zotero/skills` | 46.758 KiB | KEEP | 2026-08-20T20:49:03.966049+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/test-android-apps/skills` | 44.672 KiB | KEEP | 2026-08-20T20:49:03.289948+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/sharepoint/skills` | 44.162 KiB | KEEP | 2026-08-20T20:49:03.107911+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/superhuman/skills` | 43.878 KiB | KEEP | 2026-08-20T20:49:03.221929+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/game-studio/skills` | 39.825 KiB | KEEP | 2026-08-20T20:49:01.826268+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/deepnote/skills` | 39.094 KiB | KEEP | 2026-08-20T20:49:01.058220+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/canva/skills` | 35.125 KiB | KEEP | 2026-08-20T20:49:00.773702+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/circleci/skills` | 34.901 KiB | KEEP | 2026-08-20T20:49:00.812707+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/outlook-email/skills` | 32.876 KiB | KEEP | 2026-08-20T20:49:02.960856+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/teams/skills` | 30.003 KiB | KEEP | 2026-08-20T20:49:03.262932+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/.agents/skills` | 25.753 KiB | KEEP | 2026-08-20T20:49:00.407183+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/sentry/skills` | 25.728 KiB | KEEP | 2026-08-20T20:49:03.094409+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/chronograph-gp/skills` | 24.885 KiB | KEEP | 2026-08-20T20:49:00.794707+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/neon-postgres/skills` | 23.947 KiB | KEEP | 2026-08-20T20:49:02.219792+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/linear/skills` | 23.860 KiB | KEEP | 2026-08-20T20:49:02.119785+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/replayio/skills` | 22.424 KiB | KEEP | 2026-08-20T20:49:03.081872+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/temp` | 22.269 KiB | UNCLEAR | 2026-08-29T09:42:48.674351+00:00 | Name suggests scratch/log output, but no process ownership, open handles, rebuildability or task-retention proof was collected. Do not clear while the app/current work may use it. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/digitalocean/skills` | 20.995 KiB | KEEP | 2026-08-20T20:49:01.090728+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/airtable/skills` | 18.494 KiB | KEEP | 2026-08-20T20:49:00.417684+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/stripe/skills` | 17.214 KiB | KEEP | 2026-08-20T20:49:03.197426+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/cache/ponytail/ponytail/4.9.0/skills` | 17.116 KiB | KEEP | 2026-08-08T08:32:24.823723+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/.marketplace-plugin-source-staging/marketplace-plugin-source-Qm7bfq/skills` | 17.116 KiB | KEEP | 2026-08-08T08:32:11.123509+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/marketplaces/ponytail/skills` | 17.116 KiB | KEEP | 2026-08-08T08:31:51.450411+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/cache/codex-runtimes/codex-primary-runtime/dependencies/python/Lib/site-packages/pip/_vendor/cachecontrol/caches` | 15.782 KiB | KEEP | 2026-08-27T08:12:24+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/cache/ponytail/ponytail/4.9.0/.openclaw/skills` | 15.575 KiB | KEEP | 2026-08-08T08:32:24.778289+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/.marketplace-plugin-source-staging/marketplace-plugin-source-Qm7bfq/.openclaw/skills` | 15.575 KiB | KEEP | 2026-08-08T08:32:09.172751+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/marketplaces/ponytail/.openclaw/skills` | 15.575 KiB | KEEP | 2026-08-08T08:31:49.968538+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/magicpath/skills` | 14.924 KiB | KEEP | 2026-08-20T20:49:02.129785+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/bundled-marketplaces/openai-bundled/plugins/browser/skills` | 13.892 KiB | KEEP | 2026-11-15T13:33:27.133403+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/bundled-marketplaces/openai-bundled/plugins/chrome/skills` | 13.032 KiB | KEEP | 2026-11-15T13:33:27.131403+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/cache/openai-bundled/chrome/26.818.21641/skills` | 12.790 KiB | KEEP | 2026-08-20T13:30:18.650054+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/plugin-eval/skills` | 11.553 KiB | KEEP | 2026-08-20T20:49:02.983858+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/cache/openai-bundled/plugin-backup-wjawUQ/browser/26.721.41059/skills` | 11.176 KiB | KEEP | 2026-07-27T07:03:49.176808+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/cache/openai-bundled/plugin-backup-Vb8Upu/browser/26.715.70719/skills` | 11.176 KiB | KEEP | 2026-07-23T00:40:47.167394+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/cache/openai-bundled/plugin-backup-nSU2Su/browser/26.715.31925/skills` | 11.176 KiB | KEEP | 2026-07-19T01:36:15.046776+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/cache/openai-bundled/plugin-backup-gp0AQV/browser/26.721.41059/skills` | 11.176 KiB | KEEP | 2026-07-25T21:09:24.391503+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/bundled-marketplaces/openai-bundled.staging-7b54fe7e-eab3-40bb-9779-57fe087e17b9/plugins/browser/skills` | 11.176 KiB | KEEP | 2026-07-19T19:52:50.394926+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/cache/openai-bundled/plugin-backup-M2qktz/browser/26.707.91948/skills` | 10.828 KiB | KEEP | 2026-07-16T12:37:40.322831+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/bundled-marketplaces/openai-bundled.staging-7b54fe7e-eab3-40bb-9779-57fe087e17b9/plugins/chrome/skills` | 10.683 KiB | KEEP | 2026-07-19T19:52:50.397426+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/cache/openai-primary-runtime/pdf/26.1112.11011/skills` | 10.317 KiB | KEEP | 2026-11-13T06:40:47.184447+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/cache/codex-runtimes/codex-primary-runtime/plugins/openai-primary-runtime/plugins/pdf/skills` | 9.625 KiB | KEEP | 2026-08-27T08:13:31+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/posthog/skills` | 6.823 KiB | KEEP | 2026-08-20T20:49:02.999363+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/hubspot/skills` | 6.737 KiB | KEEP | 2026-08-20T20:49:01.945773+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/marketplaces/ponytail/.opencode/plugins` | 4.833 KiB | KEEP | 2026-08-08T08:31:50.609127+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/bundled-marketplaces/openai-bundled.staging-7b54fe7e-eab3-40bb-9779-57fe087e17b9/plugins/latex/skills` | 4.204 KiB | KEEP | 2026-07-19T19:52:49.684055+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/bundled-marketplaces/openai-bundled/plugins/latex/skills` | 4.204 KiB | KEEP | 2026-11-15T13:33:26.050447+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/coderabbit/skills` | 3.765 KiB | KEEP | 2026-08-20T20:49:00.945715+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/hex/skills` | 3.221 KiB | KEEP | 2026-08-20T20:49:01.918273+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/cache/openai-curated-remote/plugin-management/0.1.0/skills` | 2.913 KiB | KEEP | 2026-08-14T07:35:46.570993+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/bundled-marketplaces/openai-bundled/.agents/plugins` | 1.968 KiB | KEEP | 2026-11-15T13:33:25.994545+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/brighthire/skills` | 1.878 KiB | KEEP | 2026-08-20T20:49:00.609696+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/bundled-marketplaces/openai-bundled.staging-7b54fe7e-eab3-40bb-9779-57fe087e17b9/plugins/computer-use/skills` | 1.581 KiB | KEEP | 2026-07-19T19:52:49.581155+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/cache/openai-bundled/computer-use/26.1111.21308/skills` | 1.462 KiB | KEEP | 2026-11-15T13:33:27.696196+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/bundled-marketplaces/openai-bundled/plugins/computer-use/skills` | 1.462 KiB | KEEP | 2026-11-15T13:33:26.029241+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/bundled-marketplaces/openai-bundled.staging-7b54fe7e-eab3-40bb-9779-57fe087e17b9/.agents/plugins` | 1.409 KiB | KEEP | 2026-07-19T19:52:49.495589+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/tmp` | 1.090 KiB | UNCLEAR | 2026-11-15T13:33:32.141025+00:00 | Name suggests scratch/log output, but no process ownership, open handles, rebuildability or task-retention proof was collected. Do not clear while the app/current work may use it. |
| `E:/Codex/data/.codex/plugins/cache/ponytail/ponytail/4.9.0/.git/logs` | 776 B | UNCLEAR | 2026-08-08T08:32:24.767287+00:00 | Name suggests scratch/log output, but no process ownership, open handles, rebuildability or task-retention proof was collected. Do not clear while the app/current work may use it. |
| `E:/Codex/data/.codex/browser/sessions` | 629 B | KEEP | 2026-08-27T07:03:42.893843+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/.marketplace-plugin-source-staging/marketplace-plugin-source-Qm7bfq/.git/logs` | 600 B | UNCLEAR | 2026-08-08T08:32:08.415397+00:00 | Name suggests scratch/log output, but no process ownership, open handles, rebuildability or task-retention proof was collected. Do not clear while the app/current work may use it. |
| `E:/Codex/data/.codex/.tmp/marketplaces/ponytail/.git/logs` | 600 B | UNCLEAR | 2026-08-08T08:31:49.117791+00:00 | Name suggests scratch/log output, but no process ownership, open handles, rebuildability or task-retention proof was collected. Do not clear while the app/current work may use it. |
| `E:/Codex/data/.codex/.tmp/marketplaces/ponytail/.agents/plugins` | 431 B | KEEP | 2026-08-08T08:31:49.520484+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/plugin-eval/fixtures/multi-skill-plugin/skills` | 375 B | KEEP | 2026-08-20T20:49:02.976357+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/.tmp/plugins/.git/logs` | 364 B | UNCLEAR | 2026-08-20T20:49:03.983092+00:00 | Name suggests scratch/log output, but no process ownership, open handles, rebuildability or task-retention proof was collected. Do not clear while the app/current work may use it. |
| `E:/Codex/data/.codex/.tmp/plugins/plugins/plugin-eval/fixtures/minimal-plugin/skills` | 218 B | KEEP | 2026-08-20T20:49:02.973857+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/computer-use/sessions` | 154 B | KEEP | 2026-07-21T14:08:24.213051+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |
| `E:/Codex/data/.codex/plugins/cache/openai-bundled/browser/26.1111.21308/skills` | 0 B | KEEP | 2026-11-15T13:33:29.237837+00:00 | Session/history, generated work artifacts, installed plugins/skills or runtime/dependency assets may be needed by current work. No content was read and no inactive copy was established. |

### Largest subpaths

Directory totals below overlap. The JSON contains the complete directory metadata and largest/recent file records; sizes are logical file lengths, not free space recovery estimates.

| Directory | Logical size | Folder modified UTC |
| --- | ---: | --- |
| `E:/Codex/data` | 17.809 GiB | 2026-08-27T18:34:31.116098+00:00 |
| `E:/Codex/data/.codex` | 17.809 GiB | 2026-11-16T07:11:03.693219+00:00 |
| `E:/Codex/data/.codex/sessions` | 10.937 GiB | 2026-07-11T14:52:18.673479+00:00 |
| `E:/Codex/data/.codex/sessions/2026` | 10.937 GiB | 2026-10-31T21:53:35.656925+00:00 |
| `E:/Codex/cache` | 1.504 GiB | 2026-08-27T18:49:08.261004+00:00 |
| `E:/Codex/cache/codex-runtimes` | 1.504 GiB | 2026-08-27T15:19:24.278771+00:00 |
| `E:/Codex/cache/codex-runtimes/codex-primary-runtime` | 1.302 GiB | 2026-08-27T08:13:44+00:00 |
| `E:/Codex/cache/codex-runtimes/codex-primary-runtime/dependencies` | 1.297 GiB | 2026-08-27T08:08:57+00:00 |
| `E:/Codex/data/.codex/archived_sessions` | 684.996 MiB | 2026-11-01T10:51:29.213509+00:00 |
| `E:/Codex/data/.codex/plugins` | 534.712 MiB | 2026-11-12T00:34:41.341031+00:00 |
| `E:/Codex/data/.codex/plugins/.plugin-appserver` | 459.713 MiB | 2026-11-12T00:34:41.340386+00:00 |
| `E:/Codex/data/.codex/.sandbox-bin` | 425.676 MiB | 2026-10-11T17:23:06.028174+00:00 |
| `E:/Codex/data/.codex/.tmp` | 160.811 MiB | 2026-11-15T13:33:24.458791+00:00 |
| `E:/Codex/data/.codex/.sandbox` | 147.725 MiB | 2026-11-16T00:59:08.054019+00:00 |
| `E:/Codex/data/.codex/.tmp/bundled-marketplaces` | 91.692 MiB | 2026-11-15T13:33:27.225341+00:00 |
| `E:/Codex/cache/codex-runtimes/codex-primary-runtime.previous-26b505d7-828f-4d92-951c-a844c8a97241` | 87.147 MiB | 2026-07-24T07:21:01.571869+00:00 |
| `E:/Codex/cache/codex-runtimes/codex-primary-runtime.previous-26b505d7-828f-4d92-951c-a844c8a97241/dependencies` | 87.147 MiB | 2026-07-24T07:21:01.575369+00:00 |
| `E:/Codex/data/.codex/cache` | 86.920 MiB | 2026-09-10T17:16:55.940812+00:00 |
| `E:/Codex/data/.codex/cache/remote_plugin_catalog` | 75.434 MiB | 2026-11-14T08:23:06.572015+00:00 |
| `E:/Codex/data/.codex/plugins/cache` | 71.110 MiB | 2026-07-24T10:24:55.142357+00:00 |
| `E:/Codex/data/.codex/.tmp/plugins` | 65.256 MiB | 2026-08-20T20:49:00.408182+00:00 |
| `E:/Codex/cache/codex-runtimes/codex-runtime-install-JU3Ptt` | 49.069 MiB | 2026-08-20T20:08:13.354772+00:00 |
| `E:/Codex/projects` | 48.304 MiB | 2026-08-27T07:00:09.098005+00:00 |
| `E:/Codex/projects/2026-08-22` | 45.289 MiB | 2026-08-22T10:21:16.276101+00:00 |
| `E:/Codex/projects/2026-08-22/new-chat` | 45.289 MiB | 2026-08-22T10:21:16.277101+00:00 |
| `E:/Codex/projects/2026-08-22/new-chat/work` | 45.289 MiB | 2026-08-22T10:35:26.829413+00:00 |
| `E:/Codex/data/.codex/visualizations` | 26.553 MiB | 2026-07-11T14:52:18.640297+00:00 |
| `E:/Codex/data/.codex/visualizations/2026` | 26.553 MiB | 2026-10-03T18:15:06.999806+00:00 |

### Limits and preserved state

- Junctions, reparse entries and cloud/offline placeholders were not followed or hydrated. Their targets are not cleanup candidates; an excluded size is unmeasured.
- Logical sizes differ from physical allocation and possible reclaim. No compression database, archive or session stream was opened/decompressed.
- No active-process/open-handle, plugin lifecycle, supported prune or uninstall proof was collected. Installed caches and stale-looking versions remain KEEP/UNCLEAR.
- Nothing was deleted or moved. This report does not grant cleanup permission. Exact recorded paths and metadata are retained in `codex.json`; settings, history and current work remain untouched.

No cleanup of E:/Codex was performed or authorized by this inventory. In particular, do not delete sessions, archived_sessions, thread_history SQLite/WAL files, settings/authentication/configuration files, installed plugin/runtime trees or visualizations. The .tmp/log/cache labels alone do not establish inactivity. An optional later investigation could examine ownership and supported rebuildability of the roughly 0.157 GiB .tmp and 0.085 GiB generic cache, plus approximately 0.144 GiB logs, without reading private session contents; these are UNCLEAR, not additive approved savings.

## 6. Delivery and preserved state

- Existing source/main/release/Pages refs are not changed. Only this Markdown file is committed to codex/disk-e-audit-evidence as the owner authorized. Publication SHA is provided in the chat after remote verification.
- The current site source remains 9a48765744f32f467f6e53c1f85e94921cbdd54b. No tests, pre-ff, package builds, server restart, configuration changes, fetch or cleanup were performed in the second pass.
- Preview PID 29324, preview-v1, TLS material and QA evidence dated November 1 or later are preserved. Audit output is written only to the current audit evidence directory and the explicitly requested review document.
- Local evidence: E:/Warhammer/qa-evidence/disk-e-audit-2026-11-16/SECOND_PASS/warhammer.json, git-second-pass.json, classification.json, old-qa-git.json, old-loose-files.json, codex.json and codex.md. Scanner/review scripts are kept beside them. They are not extra repository changes.
- The audit scratch from the first pass remained after an earlier automatic-review cleanup rejection. This second pass did not retry deletion or remove that scratch. The owner-run apply.ps1 is retained as execution evidence.
