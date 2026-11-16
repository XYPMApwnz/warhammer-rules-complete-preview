# Disk cleanup 2 — archives and exact deletion plan for review — 2026-11-16

**Preparation only. The agent has NOT executed apply-2.ps1, git worktree remove/prune, Remove-Item, a move, or any other deletion in this task. The owner will obtain Claude review before running the script. Scope is E:/Warhammer only; all E:/Codex, active work, preview/TLS and current QA evidence remain preserved.**

Accepted previous inventory: [c9f8fa26](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/blob/c9f8fa26e856bb35543832c0c83b85c3ef305138/docs/reviews/disk-e-audit-2026-11-16.md). The earlier owner-run cleanup removed its exact 36 targets and increased free space by 41.287 GiB; that completed action is separate from the unexecuted plan below.

## Summary

| Group | Selected source size (logical) | Preserved archive | Prepared action |
| --- | --- | --- | --- |
| 56 Git copies/worktrees | 62.674 GiB | 23 verified private archives; other selected checkouts were clean with retained common Git history | Native Git removal for linked worktrees; exact directory removal for standalone copies |
| 290 old QA directories +14 old loose files | 55.700 GiB | 29,260 small text files / 6.577 GiB under archive-reports/qa | Remove originals only after complete archive/source preflight |
| 49 junction entries | Link entries only | Targets retained; link metadata pinned in manifest | Link-only removal, NEVER recurse through a junction |
| 14 over-cap Git copies | Excluded | No per-copy archive created: format-patch alone exceeds 200,000,000 bytes | UNCLEAR; preserved |
| All other KEEP/non-selected material | Excluded | Current/common Git, dependency chains, current QA and all Codex retained | No action |

The disjoint source roots total **118.374 GiB** (127,102,947,368 logical bytes). Nested baseline worktrees and junctions are already included in their parent totals; do not add operation rows. Physical reclaim is not guaranteed by logical sizes/hardlinks. The archives themselves now occupy 7.188 GiB of verified file payload, plus manifest/helper filesystem overhead. Nothing in this plan has yet freed space.

There are **412 exact operations**: 36 worktree removals, 49 junction-only removals, 313 directory removals (23 Git copies +290 QA folders), and 14 old loose-file removals. 360 disjoint source roots are counted in the size total.

## 1. Git archives

Each per-copy archive is under E:/Warhammer/archive-reports/git/<readable-folder-name>--<path-hash>/. The path suffix prevents collisions between multiple checkout directories. Each successful archive contains commits.patch (git format-patch), commits.raw.txt, merge-per-parent patches where needed, refs.txt, tracked.patch, cached.patch, untracked-list.txt, eligible untracked copies, state.json and README.txt. README records original path, branch, HEAD and UTC date.

Commit selection is the conservative comparison used in the accepted inventory: union of HEAD and all local branches, minus all locally recorded remote-tracking refs. No fetch or ref refresh was performed. Root commits are included with --root; non-merge format-patch coverage was checked by exact commit IDs. Raw commit records and per-parent diffs preserve merge-only content/topology. Branch/tag/stash tip metadata is recorded; retained shared Git owners keep the original object/ref stores.

Tracked working-tree diff and cached diff use --binary --full-index --no-ext-diff --no-textconv. Untracked paths are listed; actual files are copied only when strictly below 5,000,000 bytes and outside generated/node_modules. Link targets are stored as metadata without following them. No unarchived large non-generated untracked file was silently promoted to safe.

All outputs were preflight-sized before the first write to a per-copy archive.23 groups were saved and verified, totaling 656,269,619 bytes; the largest group is 82,510,403 bytes.14 groups were not saved because git format-patch alone was proven larger than200,000,000bytes. No archive directory was created for those 14.

**Private archives are not GitHub attachments. Format-patch/raw commit headers may contain the owner identity/email and remain local. Only this English report and the review script are committed.**

| Git source | Source size | Archive bytes | Archive directory | Untracked copied / excluded generated | Result |
| --- | --- | --- | --- | --- | --- |
| `E:/Warhammer/qa-tmp/test-hygiene-min-v1/bsdata-wh40k-11e-fa30730fca11fbfe87be90684d481d50e0efaf66` | 78.819 MiB | 1,845 | `E:/Warhammer/archive-reports/git/bsdata-wh40k-11e-fa30730fca11fbfe87be90684d481d50e0efaf66--3fb23c23` | 0 / 0 | Verified; selected in plan |
| `E:/Warhammer/qa-tmp/official-updates-v1/tyranids-trial-guard-diagnostic/checkout` | 1.558 GiB | 22,990,931 | `E:/Warhammer/archive-reports/git/qa-tmp--official-updates-v1--tyranids-trial-guard-diagnostic--checkout--fd4682a4` | 0 / 0 | Verified; selected in plan |
| `E:/Warhammer/qa-tmp/official-updates-v1/trials-final/tyranids/checkout` | 1.558 GiB | 22,939,855 | `E:/Warhammer/archive-reports/git/official-updates-v1--trials-final--tyranids--checkout--4b1d3552` | 0 / 0 | Verified; selected in plan |
| `E:/Warhammer/qa-tmp/official-updates-v1/trials-final/death-guard/checkout` | 1.565 GiB | 82,468,910 | `E:/Warhammer/archive-reports/git/official-updates-v1--trials-final--death-guard--checkout--68d3cd6b` | 0 / 0 | Verified; selected in plan |
| `E:/Warhammer/qa-tmp/official-updates-v1/trials-approved-5bc26d82/tyranids/checkout` | 1.558 GiB | 82,510,403 | `E:/Warhammer/archive-reports/git/official-updates-v1--trials-approved-5bc26d82--tyranids--checkout--b78c1815` | 0 / 0 | Verified; selected in plan |
| `E:/Warhammer/qa-tmp/mfm-update-v1/wh-mfm-update-LuGjf2/work/checkout` | 1.556 GiB | 20,523,679 | `E:/Warhammer/archive-reports/git/mfm-update-v1--wh-mfm-update-LuGjf2--work--checkout--c39fc993` | 43 / 0 | Verified; selected in plan |
| `E:/Warhammer/qa-tmp/mfm-update-v1/warhammer-source-contract-B22n5D/work/tracked-inputs` | 27.638 KiB | 3,377 | `E:/Warhammer/archive-reports/git/mfm-update-v1--warhammer-source-contract-B22n5D--work--tracked-inputs--b47a7a0a` | 1 / 0 | Verified; selected in plan |
| `E:/Warhammer/qa-tmp/mfm-update-v1/warhammer-source-contract-B22n5D/work/capture-repo` | 27.678 KiB | 2,937 | `E:/Warhammer/archive-reports/git/mfm-update-v1--warhammer-source-contract-B22n5D--work--capture-repo--d212258c` | 0 / 0 | Verified; selected in plan |
| `E:/Warhammer/qa-tmp/core-rules-refresh-v1-source-catalog-baseline-write` | 1.518 GiB | 13,307,766 | `E:/Warhammer/archive-reports/git/core-rules-refresh-v1-source-catalog-baseline-write--be4fca97` | 0 / 0 | Verified; selected in plan |
| `E:/Warhammer/qa-tmp/core-rules-refresh-v1-registry-u6-recovery` | 1.525 GiB | 76,265,815 | `E:/Warhammer/archive-reports/git/core-rules-refresh-v1-registry-u6-recovery--e3cb7225` | 13 / 0 | Verified; selected in plan |
| `E:/Warhammer/qa-tmp/core-rules-refresh-v1-registry-u6-baseline` | 1.518 GiB | 18,531 | `E:/Warhammer/archive-reports/git/core-rules-refresh-v1-registry-u6-baseline--d847fd4b` | 0 / 0 | Verified; selected in plan |
| `E:/Warhammer/qa-tmp/core-rules-refresh-v1-baseline-949d98f` | 1.518 GiB | 6,603 | `E:/Warhammer/archive-reports/git/core-rules-refresh-v1-baseline-949d98f--15a3eb8c` | 1 / 0 | Verified; selected in plan |
| `E:/Warhammer/qa-tmp/book-update-command-v1/wh-book-update-WVLHxS/work/checkout` | 1.544 GiB | 5,098,680 | `E:/Warhammer/archive-reports/git/book-update-command-v1--wh-book-update-WVLHxS--work--checkout--35166013` | 0 / 0 | Verified; selected in plan |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-yRGrgn/checkout` | 1.557 GiB | 20,461,355 | `E:/Warhammer/archive-reports/git/qa-tmp--book-update-command-v1--trial-mfm-yRGrgn--checkout--6e5237dd` | 0 / 0 | Verified; selected in plan |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-wnwCOx/checkout` | 1.557 GiB | 73,352,985 | `E:/Warhammer/archive-reports/git/qa-tmp--book-update-command-v1--trial-mfm-wnwCOx--checkout--21bcd279` | 0 / 0 | Verified; selected in plan |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-ufMFO6/checkout` | 1.556 GiB | 7,415,578 | `E:/Warhammer/archive-reports/git/qa-tmp--book-update-command-v1--trial-mfm-ufMFO6--checkout--ed370bfb` | 0 / 0 | Verified; selected in plan |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-sugJ53/checkout` | 1.557 GiB | 8,676,161 | `E:/Warhammer/archive-reports/git/qa-tmp--book-update-command-v1--trial-mfm-sugJ53--checkout--1f5e4752` | 0 / 0 | Verified; selected in plan |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-jooswU/checkout` | 1.557 GiB | 73,380,591 | `E:/Warhammer/archive-reports/git/qa-tmp--book-update-command-v1--trial-mfm-jooswU--checkout--02cc355c` | 3 / 0 | Verified; selected in plan |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-bd4W8f/checkout` | 1.557 GiB | 7,904,256 | `E:/Warhammer/archive-reports/git/qa-tmp--book-update-command-v1--trial-mfm-bd4W8f--checkout--7fe0f74f` | 0 / 0 | Verified; selected in plan |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-v3/checkout` | 1.553 GiB | 69,396,475 | `E:/Warhammer/archive-reports/git/qa-tmp--book-update-command-v1--trial-ledger-v3--checkout--41e70f63` | 0 / 0 | Verified; selected in plan |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-v2/checkout` | 1.548 GiB | 5,082 | `E:/Warhammer/archive-reports/git/qa-tmp--book-update-command-v1--trial-ledger-v2--checkout--dbe56b2d` | 0 / 0 | Verified; selected in plan |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-final/checkout` | 1.553 GiB | 69,396,481 | `E:/Warhammer/archive-reports/git/qa-tmp--book-update-command-v1--trial-ledger-final--checkout--ca621157` | 0 / 0 | Verified; selected in plan |
| `E:/Warhammer/Codex-Archive/patchrepo-2026-09-11` | 178.864 KiB | 141,323 | `E:/Warhammer/archive-reports/git/patchrepo-2026-09-11--a719d58d` | 0 / 0 | Verified; selected in plan |

The previously failed HEAD lookup for Codex-Archive/patchrepo was resolved as a valid unborn repository: no commit or branch tip existed. Its staged/unstaged bytes and eligible untracked files were archived; the script explicitly checks that it remains unborn. The two synthetic source-contract repositories have unique root commits, and their root patch coverage was verified.

### Over200MB: preserved, no partial archive

| Source copy kept UNCLEAR | Source size | Reason |
| --- | --- | --- |
| `E:/Warhammer/worktrees/v2-stage59-universal-pricing-be70d80b` | 1.214 GiB | format-patch alone produced at least 200,278,016 bytes (>200,000,000). No per-copy archive saved. |
| `E:/Warhammer/worktrees/safe-pwa-updates-0cbf20e5` | 1.213 GiB | format-patch alone produced at least 200,278,016 bytes (>200,000,000). No per-copy archive saved. |
| `E:/Warhammer/worktrees/preff-speedup-v1` | 1.163 GiB | format-patch alone produced at least 200,278,016 bytes (>200,000,000). No per-copy archive saved. |
| `E:/Warhammer/worktrees/official-updates-v1` | 1.162 GiB | format-patch alone produced at least 200,278,016 bytes (>200,000,000). No per-copy archive saved. |
| `E:/Warhammer/worktrees/generated-rebuild-gate-v1` | 1.150 GiB | format-patch alone produced at least 200,278,016 bytes (>200,000,000). No per-copy archive saved. |
| `E:/Warhammer/worktrees/epic-hero-enhancements-v1` | 1.151 GiB | format-patch alone produced at least 200,278,016 bytes (>200,000,000). No per-copy archive saved. |
| `E:/Warhammer/worktrees/core-switch-b-v1` | 1.161 GiB | format-patch alone produced at least 200,278,016 bytes (>200,000,000). No per-copy archive saved. |
| `E:/Warhammer/worktrees/core-b1-term-bindings-27eb38fe` | 1.213 GiB | format-patch alone produced at least 200,278,016 bytes (>200,000,000). No per-copy archive saved. |
| `E:/Warhammer/worktrees/backlog-triage-v1` | 1.162 GiB | format-patch alone produced at least 200,278,016 bytes (>200,000,000). No per-copy archive saved. |
| `E:/Warhammer/warhammer-w2-25-sm-facts` | 639.218 MiB | format-patch alone produced at least 200,278,016 bytes (>200,000,000). No per-copy archive saved. |
| `E:/Warhammer/warhammer-v2-current` | 1.238 GiB | format-patch alone produced at least 200,278,016 bytes (>200,000,000). No per-copy archive saved. |
| `E:/Warhammer/warhammer-rules-dg-v2` | 728.358 MiB | format-patch alone produced at least 200,278,016 bytes (>200,000,000). No per-copy archive saved. |
| `E:/Warhammer/warhammer-rules-dg-v1-navigation-port` | 833.582 MiB | format-patch alone produced at least 200,278,016 bytes (>200,000,000). No per-copy archive saved. |
| `E:/Warhammer/warhammer-final-test-cleanup` | 531.127 MiB | format-patch alone produced at least 200,278,016 bytes (>200,000,000). No per-copy archive saved. |

## 2. Old QA text archive

**Copied and verified: 29,260 files, 7,061,636,438 bytes (6.577 GiB).** Count and byte totals exactly match the accepted old-QA inventory. Every copied file was SHA-256 verified, with source size/date checked before/after copy. Only .md/.json/.txt files strictly below 5,000,000 bytes were selected. This includes JSON data/manifests inside copied outputs, not just narrative prose.

Destinations are E:/Warhammer/archive-reports/qa/qa-artifacts/<folder>/<relative-path> and .../qa-evidence/<folder>/<relative-path>. Old loose text files use the corresponding _root-files directory. Source-container prefixes prevent name collisions. Copying was used: originals remain until a reviewed script is actually run.

Three clean embedded old-QA baseline worktrees are separate Git-removal operations before their parent folder removal. Their common Git store and all branch refs remain outside the removed QA directories. Newer QA folders were not selected.

| Old QA source | Original total | Copied text files / bytes | Verified archive directory |
| --- | --- | --- | --- |
| `E:/Warhammer/qa-artifacts/ability-category-76022d87-20261014` | 1.428 MiB | 0 / 0 | `E:/Warhammer/archive-reports/qa/qa-artifacts/ability-category-76022d87-20261014` |
| `E:/Warhammer/qa-artifacts/ability-dedup-855d641b` | 13.642 MiB | 6 / 90,085 | `E:/Warhammer/archive-reports/qa/qa-artifacts/ability-dedup-855d641b` |
| `E:/Warhammer/qa-artifacts/ability-presentation-synthetic` | 59.658 KiB | 1 / 61,090 | `E:/Warhammer/archive-reports/qa/qa-artifacts/ability-presentation-synthetic` |
| `E:/Warhammer/qa-artifacts/ability-release-20673f6d-20261014` | 2.705 MiB | 6 / 457,128 | `E:/Warhammer/archive-reports/qa/qa-artifacts/ability-release-20673f6d-20261014` |
| `E:/Warhammer/qa-artifacts/admech-fnp-fix-6e4aa58e-20261016` | 5.425 MiB | 3 / 273,343 | `E:/Warhammer/archive-reports/qa/qa-artifacts/admech-fnp-fix-6e4aa58e-20261016` |
| `E:/Warhammer/qa-artifacts/admech-native-fnp-fix-6e4aa58e-20261016` | 2.695 KiB | 1 / 1,764 | `E:/Warhammer/archive-reports/qa/qa-artifacts/admech-native-fnp-fix-6e4aa58e-20261016` |
| `E:/Warhammer/qa-artifacts/admech-omnispex-fix-f8f82f38-20261017` | 5.469 MiB | 20 / 2,160,625 | `E:/Warhammer/archive-reports/qa/qa-artifacts/admech-omnispex-fix-f8f82f38-20261017` |
| `E:/Warhammer/qa-artifacts/admech-v2-deep-audit` | 132.818 MiB | 154 / 24,466,039 | `E:/Warhammer/archive-reports/qa/qa-artifacts/admech-v2-deep-audit` |
| `E:/Warhammer/qa-artifacts/am-datasheet-noise-022790fe` | 2.931 MiB | 1 / 739 | `E:/Warhammer/archive-reports/qa/qa-artifacts/am-datasheet-noise-022790fe` |
| `E:/Warhammer/qa-artifacts/am-final-fdefd4da` | 37.802 MiB | 0 / 0 | `E:/Warhammer/archive-reports/qa/qa-artifacts/am-final-fdefd4da` |
| `E:/Warhammer/qa-artifacts/am-glossary-fdefd4da` | 33.949 MiB | 3 / 8,472 | `E:/Warhammer/archive-reports/qa/qa-artifacts/am-glossary-fdefd4da` |
| `E:/Warhammer/qa-artifacts/am-official-v1.4-20261014` | 181.683 MiB | 33 / 15,785,502 | `E:/Warhammer/archive-reports/qa/qa-artifacts/am-official-v1.4-20261014` |
| `E:/Warhammer/qa-artifacts/am-omnispex-caption-fix-20261014` | 3.232 MiB | 0 / 0 | `E:/Warhammer/archive-reports/qa/qa-artifacts/am-omnispex-caption-fix-20261014` |
| `E:/Warhammer/qa-artifacts/am-player-scenario-20261014-7545da94-f692-440f-ba70-36a107258fb3` | 2.797 MiB | 5 / 525,763 | `E:/Warhammer/archive-reports/qa/qa-artifacts/am-player-scenario-20261014-7545da94-f692-440f-ba70-36a107258fb3` |
| `E:/Warhammer/qa-artifacts/am-recert-ca771f43` | 38.516 MiB | 0 / 0 | `E:/Warhammer/archive-reports/qa/qa-artifacts/am-recert-ca771f43` |
| `E:/Warhammer/qa-artifacts/am-theme-1be58024` | 26.128 MiB | 2 / 170,189 | `E:/Warhammer/archive-reports/qa/qa-artifacts/am-theme-1be58024` |
| `E:/Warhammer/qa-artifacts/am-ux-fdefd4da` | 22.110 MiB | 2 / 20,185 | `E:/Warhammer/archive-reports/qa/qa-artifacts/am-ux-fdefd4da` |
| `E:/Warhammer/qa-artifacts/am06` | 11.803 MiB | 0 / 0 | `E:/Warhammer/archive-reports/qa/qa-artifacts/am06` |
| `E:/Warhammer/qa-artifacts/am09-binding-ca771f43` | 3.164 MiB | 0 / 0 | `E:/Warhammer/archive-reports/qa/qa-artifacts/am09-binding-ca771f43` |
| `E:/Warhammer/qa-artifacts/b1-b3-pwa-production-20261027` | 5.667 MiB | 13 / 440,364 | `E:/Warhammer/archive-reports/qa/qa-artifacts/b1-b3-pwa-production-20261027` |
| `E:/Warhammer/qa-artifacts/charge-family-fix-ee6387be-20261016` | 19.090 MiB | 10 / 480,304 | `E:/Warhammer/archive-reports/qa/qa-artifacts/charge-family-fix-ee6387be-20261016` |
| `E:/Warhammer/qa-artifacts/charge-family-implementation-ee6387be-20261016` | 1.116 MiB | 3 / 1,148,984 | `E:/Warhammer/archive-reports/qa/qa-artifacts/charge-family-implementation-ee6387be-20261016` |
| `E:/Warhammer/qa-artifacts/core-b1-integration-source-sync-20261025` | 1.264 MiB | 21 / 826,675 | `E:/Warhammer/archive-reports/qa/qa-artifacts/core-b1-integration-source-sync-20261025` |
| `E:/Warhammer/qa-artifacts/core-b1-term-bindings-20261025` | 844.059 KiB | 8 / 359,260 | `E:/Warhammer/archive-reports/qa/qa-artifacts/core-b1-term-bindings-20261025` |
| `E:/Warhammer/qa-artifacts/core-b2-b3-20261025` | 16.817 MiB | 12 / 115,765 | `E:/Warhammer/archive-reports/qa/qa-artifacts/core-b2-b3-20261025` |
| `E:/Warhammer/qa-artifacts/core-b2-b3-concept-fallback-20261026` | 2.320 MiB | 17 / 943,058 | `E:/Warhammer/archive-reports/qa/qa-artifacts/core-b2-b3-concept-fallback-20261026` |
| `E:/Warhammer/qa-artifacts/core-b2-b3-integration-20261026` | 1.327 MiB | 9 / 35,926 | `E:/Warhammer/archive-reports/qa/qa-artifacts/core-b2-b3-integration-20261026` |
| `E:/Warhammer/qa-artifacts/core-b2-b3-resume-20261025` | 1.628 MiB | 21 / 862,768 | `E:/Warhammer/archive-reports/qa/qa-artifacts/core-b2-b3-resume-20261025` |
| `E:/Warhammer/qa-artifacts/core-preintegration-cc84bfe2` | 27.056 MiB | 6 / 2,459,877 | `E:/Warhammer/archive-reports/qa/qa-artifacts/core-preintegration-cc84bfe2` |
| `E:/Warhammer/qa-artifacts/csm-blank-inventory-fix-20261014` | 4.963 MiB | 8 / 1,247,106 | `E:/Warhammer/archive-reports/qa/qa-artifacts/csm-blank-inventory-fix-20261014` |
| `E:/Warhammer/qa-artifacts/csm-independent-content-078de95d` | 68.067 MiB | 59 / 26,974,014 | `E:/Warhammer/archive-reports/qa/qa-artifacts/csm-independent-content-078de95d` |
| `E:/Warhammer/qa-artifacts/csm-personal-guide-14916f21` | 19.335 MiB | 3 / 1,234,149 | `E:/Warhammer/archive-reports/qa/qa-artifacts/csm-personal-guide-14916f21` |
| `E:/Warhammer/qa-artifacts/csm-player-scenario-20261014-34263d24-8422-4621-9e02-ddd8412c4e37` | 3.975 MiB | 5 / 626,402 | `E:/Warhammer/archive-reports/qa/qa-artifacts/csm-player-scenario-20261014-34263d24-8422-4621-9e02-ddd8412c4e37` |
| `E:/Warhammer/qa-artifacts/csm-source-first-e77ea12d` | 5.220 MiB | 27 / 4,734,335 | `E:/Warhammer/archive-reports/qa/qa-artifacts/csm-source-first-e77ea12d` |
| `E:/Warhammer/qa-artifacts/csm-v13-implementation` | 137.016 MiB | 5 / 477,369 | `E:/Warhammer/archive-reports/qa/qa-artifacts/csm-v13-implementation` |
| `E:/Warhammer/qa-artifacts/csm-wargear-contracts-20261017` | 98.745 KiB | 13 / 92,736 | `E:/Warhammer/archive-reports/qa/qa-artifacts/csm-wargear-contracts-20261017` |
| `E:/Warhammer/qa-artifacts/csm-wargear-integration-ca8567a1-20261017` | 2.292 MiB | 11 / 56,177 | `E:/Warhammer/archive-reports/qa/qa-artifacts/csm-wargear-integration-ca8567a1-20261017` |
| `E:/Warhammer/qa-artifacts/datasheet-certification-98fc94a5` | 95.163 MiB | 146 / 9,659,586 | `E:/Warhammer/archive-reports/qa/qa-artifacts/datasheet-certification-98fc94a5` |
| `E:/Warhammer/qa-artifacts/datasheet-parity-51088e8e` | 63.720 MiB | 92 / 4,758,362 | `E:/Warhammer/archive-reports/qa/qa-artifacts/datasheet-parity-51088e8e` |
| `E:/Warhammer/qa-artifacts/datasheet-recertification-855d641b` | 100.506 MiB | 136 / 9,494,582 | `E:/Warhammer/archive-reports/qa/qa-artifacts/datasheet-recertification-855d641b` |
| `E:/Warhammer/qa-artifacts/death-guard-v2-deep-audit` | 123.126 MiB | 142 / 27,190,154 | `E:/Warhammer/archive-reports/qa/qa-artifacts/death-guard-v2-deep-audit` |
| `E:/Warhammer/qa-artifacts/death-guard-v2-stage1-targeted-fix-df80f6a3-20261017` | 35.614 MiB | 15 / 18,045,690 | `E:/Warhammer/archive-reports/qa/qa-artifacts/death-guard-v2-stage1-targeted-fix-df80f6a3-20261017` |
| `E:/Warhammer/qa-artifacts/dg-caption-blockers-b31acbe7-8506e545-e88f-4edb-93c5-050bc8f1142b` | 825.769 MiB | 396 / 85,238,538 | `E:/Warhammer/archive-reports/qa/qa-artifacts/dg-caption-blockers-b31acbe7-8506e545-e88f-4edb-93c5-050bc8f1142b` |
| `E:/Warhammer/qa-artifacts/dg-content-03-06-9c41816e-eff883b1-2f6e-49b8-8b1d-70226c346952` | 44.899 MiB | 21 / 3,027,747 | `E:/Warhammer/archive-reports/qa/qa-artifacts/dg-content-03-06-9c41816e-eff883b1-2f6e-49b8-8b1d-70226c346952` |
| `E:/Warhammer/qa-artifacts/dg-content-04-70ccef5c-d9176fb8-9f3a-4baa-8ecf-c86f8e8037bb` | 3.127 MiB | 19 / 401,693 | `E:/Warhammer/archive-reports/qa/qa-artifacts/dg-content-04-70ccef5c-d9176fb8-9f3a-4baa-8ecf-c86f8e8037bb` |
| `E:/Warhammer/qa-artifacts/dg-content-05-bdd33731-964bf822-3476-4efe-850e-1bdab7aadf51` | 18.689 MiB | 13 / 982,155 | `E:/Warhammer/archive-reports/qa/qa-artifacts/dg-content-05-bdd33731-964bf822-3476-4efe-850e-1bdab7aadf51` |
| `E:/Warhammer/qa-artifacts/dg-content-05-official-6dfd3360-6dee-4a77-af71-9071ddf875c8` | 76.059 KiB | 4 / 77,884 | `E:/Warhammer/archive-reports/qa/qa-artifacts/dg-content-05-official-6dfd3360-6dee-4a77-af71-9071ddf875c8` |
| `E:/Warhammer/qa-artifacts/dg-content-final-9c41816e-20261013` | 13.962 MiB | 28 / 3,283,021 | `E:/Warhammer/archive-reports/qa/qa-artifacts/dg-content-final-9c41816e-20261013` |
| `E:/Warhammer/qa-artifacts/dg-content03-closure-9c41816e-efe1bc3d-34f9-425c-b593-38075452ab47` | 2.579 MiB | 12 / 945,189 | `E:/Warhammer/archive-reports/qa/qa-artifacts/dg-content03-closure-9c41816e-efe1bc3d-34f9-425c-b593-38075452ab47` |
| `E:/Warhammer/qa-artifacts/dg-content0306-official-review-20261013` | 3.522 MiB | 1 / 23,082 | `E:/Warhammer/archive-reports/qa/qa-artifacts/dg-content0306-official-review-20261013` |
| `E:/Warhammer/qa-artifacts/dg-errata-title-fix-70ccef5c-5513bb9f-e1fa-4ba9-a43f-f6a821138f6b` | 585.730 KiB | 5 / 245,336 | `E:/Warhammer/archive-reports/qa/qa-artifacts/dg-errata-title-fix-70ccef5c-5513bb9f-e1fa-4ba9-a43f-f6a821138f6b` |
| `E:/Warhammer/qa-artifacts/dg-icon-bearer-fix-82c5ad7b-20261017` | 1.574 MiB | 2 / 9,653 | `E:/Warhammer/archive-reports/qa/qa-artifacts/dg-icon-bearer-fix-82c5ad7b-20261017` |
| `E:/Warhammer/qa-artifacts/dg-navigation-acceptance-76a48286-20261013` | 1.759 MiB | 1 / 3,422 | `E:/Warhammer/archive-reports/qa/qa-artifacts/dg-navigation-acceptance-76a48286-20261013` |
| `E:/Warhammer/qa-artifacts/dg-navigation-forensic-76a48286-20261013-1791884146259` | 1.727 MiB | 1 / 4,491 | `E:/Warhammer/archive-reports/qa/qa-artifacts/dg-navigation-forensic-76a48286-20261013-1791884146259` |
| `E:/Warhammer/qa-artifacts/dg-player-scenario-20261014-14f4ceb8-88a2-4ff6-80ba-bf5eb82ef66c` | 3.698 MiB | 5 / 616,646 | `E:/Warhammer/archive-reports/qa/qa-artifacts/dg-player-scenario-20261014-14f4ceb8-88a2-4ff6-80ba-bf5eb82ef66c` |
| `E:/Warhammer/qa-artifacts/dg-source-enrollment-20261028` | 1.512 GiB | 148 / 182,773,954 | `E:/Warhammer/archive-reports/qa/qa-artifacts/dg-source-enrollment-20261028` |
| `E:/Warhammer/qa-artifacts/dg-two-failures-history-8eb9b843-181a-4fd0-be73-8a9b5f0c7c44` | 1.440 GiB | 658 / 99,546,165 | `E:/Warhammer/archive-reports/qa/qa-artifacts/dg-two-failures-history-8eb9b843-181a-4fd0-be73-8a9b5f0c7c44` |
| `E:/Warhammer/qa-artifacts/dg-upgrade-label-fix-bdd33731-90d9ee74-f0fe-454d-a0b5-5f0578df4f54` | 3.883 MiB | 13 / 3,074,813 | `E:/Warhammer/archive-reports/qa/qa-artifacts/dg-upgrade-label-fix-bdd33731-90d9ee74-f0fe-454d-a0b5-5f0578df4f54` |
| `E:/Warhammer/qa-artifacts/ec-foundation-20673f6d-20261014` | 12.784 KiB | 0 / 0 | `E:/Warhammer/archive-reports/qa/qa-artifacts/ec-foundation-20673f6d-20261014` |
| `E:/Warhammer/qa-artifacts/ec-four-books-live-47495cc5-20261015` | 4.079 MiB | 5 / 308,469 | `E:/Warhammer/archive-reports/qa/qa-artifacts/ec-four-books-live-47495cc5-20261015` |
| `E:/Warhammer/qa-artifacts/ec-master-pageant-273b8bd3-20261015` | 4.951 MiB | 1 / 3,593 | `E:/Warhammer/archive-reports/qa/qa-artifacts/ec-master-pageant-273b8bd3-20261015` |
| `E:/Warhammer/qa-artifacts/ec-native-fnp-a56909db-20261015` | 3.724 MiB | 1 / 1,720 | `E:/Warhammer/archive-reports/qa/qa-artifacts/ec-native-fnp-a56909db-20261015` |
| `E:/Warhammer/qa-artifacts/ec-two-defects-forensic-a56909db-20261015` | 8.429 MiB | 10 / 340,492 | `E:/Warhammer/archive-reports/qa/qa-artifacts/ec-two-defects-forensic-a56909db-20261015` |
| `E:/Warhammer/qa-artifacts/ec-user-stress-a56909db-20261015` | 371.581 MiB | 118 / 16,144,779 | `E:/Warhammer/archive-reports/qa/qa-artifacts/ec-user-stress-a56909db-20261015` |
| `E:/Warhammer/qa-artifacts/ec-v2-app-browser` | 3.586 MiB | 2 / 4,964 | `E:/Warhammer/archive-reports/qa/qa-artifacts/ec-v2-app-browser` |
| `E:/Warhammer/qa-artifacts/ec-v2-unified-browser` | 2.409 MiB | 0 / 0 | `E:/Warhammer/archive-reports/qa/qa-artifacts/ec-v2-unified-browser` |
| `E:/Warhammer/qa-artifacts/ec-wargear-integration-b1d69da4-20261017` | 4.395 MiB | 11 / 37,476 | `E:/Warhammer/archive-reports/qa/qa-artifacts/ec-wargear-integration-b1d69da4-20261017` |
| `E:/Warhammer/qa-artifacts/effective-datasheet-presentation-d087` | 10.398 MiB | 2 / 41,250 | `E:/Warhammer/archive-reports/qa/qa-artifacts/effective-datasheet-presentation-d087` |
| `E:/Warhammer/qa-artifacts/effective-profile-annotations-0b55381c` | 11.054 MiB | 1 / 53,570 | `E:/Warhammer/archive-reports/qa/qa-artifacts/effective-profile-annotations-0b55381c` |
| `E:/Warhammer/qa-artifacts/exact-user-roster-preview` | 1.961 MiB | 1 / 721 | `E:/Warhammer/archive-reports/qa/qa-artifacts/exact-user-roster-preview` |
| `E:/Warhammer/qa-artifacts/f1-detachment-recipients-20261028` | 2.621 GiB | 673 / 344,488,683 | `E:/Warhammer/archive-reports/qa/qa-artifacts/f1-detachment-recipients-20261028` |
| `E:/Warhammer/qa-artifacts/f1-detachment-recipients-authorized-20261028` | 3.035 GiB | 275 / 366,471,372 | `E:/Warhammer/archive-reports/qa/qa-artifacts/f1-detachment-recipients-authorized-20261028` |
| `E:/Warhammer/qa-artifacts/f1-detachment-recipients-final-20261028` | 777.044 MiB | 74 / 94,205,609 | `E:/Warhammer/archive-reports/qa/qa-artifacts/f1-detachment-recipients-final-20261028` |
| `E:/Warhammer/qa-artifacts/f1-detachment-recipients-resume-20261028` | 1.845 GiB | 591 / 251,649,334 | `E:/Warhammer/archive-reports/qa/qa-artifacts/f1-detachment-recipients-resume-20261028` |
| `E:/Warhammer/qa-artifacts/f1-detachment-recipients-tables-20261028` | 4.575 GiB | 433 / 552,788,637 | `E:/Warhammer/archive-reports/qa/qa-artifacts/f1-detachment-recipients-tables-20261028` |
| `E:/Warhammer/qa-artifacts/f1-qa-wiring-20261028` | 3.741 MiB | 15 / 3,314,582 | `E:/Warhammer/archive-reports/qa/qa-artifacts/f1-qa-wiring-20261028` |
| `E:/Warhammer/qa-artifacts/five-books-effect-root-causes-ee6387be-20261016` | 950.242 KiB | 24 / 812,520 | `E:/Warhammer/archive-reports/qa/qa-artifacts/five-books-effect-root-causes-ee6387be-20261016` |
| `E:/Warhammer/qa-artifacts/five-books-physical-wargear-investigation-20261017` | 4.971 MiB | 73 / 5,091,607 | `E:/Warhammer/archive-reports/qa/qa-artifacts/five-books-physical-wargear-investigation-20261017` |
| `E:/Warhammer/qa-artifacts/five-books-roster-effect-coverage-ee6387be-20261015` | 34.561 MiB | 83 / 25,050,331 | `E:/Warhammer/archive-reports/qa/qa-artifacts/five-books-roster-effect-coverage-ee6387be-20261015` |
| `E:/Warhammer/qa-artifacts/formed-units-9a952c7c` | 22.067 MiB | 3 / 57,699 | `E:/Warhammer/archive-reports/qa/qa-artifacts/formed-units-9a952c7c` |
| `E:/Warhammer/qa-artifacts/glossary-dependencies-bfd04cae-b070687c-0a02-44b8-afcd-be37dc18bb6a` | 490.420 KiB | 0 / 0 | `E:/Warhammer/archive-reports/qa/qa-artifacts/glossary-dependencies-bfd04cae-b070687c-0a02-44b8-afcd-be37dc18bb6a` |
| `E:/Warhammer/qa-artifacts/glossary-dependencies-bfd04cae-home-96ae611d-79b8-47f2-90c4-4022b3cc1829` | 7.055 MiB | 0 / 0 | `E:/Warhammer/archive-reports/qa/qa-artifacts/glossary-dependencies-bfd04cae-home-96ae611d-79b8-47f2-90c4-4022b3cc1829` |
| `E:/Warhammer/qa-artifacts/glossary-forensic-bfd04cae-96819709-f747-41b7-82b6-7228fb409f68` | 0 B | 0 / 0 | `E:/Warhammer/archive-reports/qa/qa-artifacts/glossary-forensic-bfd04cae-96819709-f747-41b7-82b6-7228fb409f68` |
| `E:/Warhammer/qa-artifacts/glossary-release-76022d87-20261014` | 6.556 MiB | 10 / 1,930,626 | `E:/Warhammer/archive-reports/qa/qa-artifacts/glossary-release-76022d87-20261014` |
| `E:/Warhammer/qa-artifacts/glossary-single-owner-4a8b9a29-20261014` | 512.274 KiB | 0 / 0 | `E:/Warhammer/archive-reports/qa/qa-artifacts/glossary-single-owner-4a8b9a29-20261014` |
| `E:/Warhammer/qa-artifacts/glossary-v1-v2-forensic-98fc94a5` | 11.260 MiB | 4 / 86,711 | `E:/Warhammer/archive-reports/qa/qa-artifacts/glossary-v1-v2-forensic-98fc94a5` |
| `E:/Warhammer/qa-artifacts/gw-freshness-2026-10-14` | 88.751 MiB | 35 / 3,051,797 | `E:/Warhammer/archive-reports/qa/qa-artifacts/gw-freshness-2026-10-14` |
| `E:/Warhammer/qa-artifacts/home-core-glossary-smoke-20261014-8b2d75e0-3c99-4f13-96f5-5184a1f1d269` | 1.898 MiB | 5 / 8,938 | `E:/Warhammer/archive-reports/qa/qa-artifacts/home-core-glossary-smoke-20261014-8b2d75e0-3c99-4f13-96f5-5184a1f1d269` |
| `E:/Warhammer/qa-artifacts/legacy-pending-patches` | 123.874 KiB | 2 / 3,102 | `E:/Warhammer/archive-reports/qa/qa-artifacts/legacy-pending-patches` |
| `E:/Warhammer/qa-artifacts/live-v2-release-20261014-27e692ae` | 50.526 MiB | 62 / 4,914,736 | `E:/Warhammer/archive-reports/qa/qa-artifacts/live-v2-release-20261014-27e692ae` |
| `E:/Warhammer/qa-artifacts/manual-release-plan-98fc94a5-20261009` | 119.628 MiB | 245 / 9,865,811 | `E:/Warhammer/archive-reports/qa/qa-artifacts/manual-release-plan-98fc94a5-20261009` |
| `E:/Warhammer/qa-artifacts/mega-glossary-v2` | 1.514 MiB | 2 / 17,070 | `E:/Warhammer/archive-reports/qa/qa-artifacts/mega-glossary-v2` |
| `E:/Warhammer/qa-artifacts/mfm-v16-integration-2026-10-14` | 6.259 MiB | 6 / 188,320 | `E:/Warhammer/archive-reports/qa/qa-artifacts/mfm-v16-integration-2026-10-14` |
| `E:/Warhammer/qa-artifacts/minimal-pwa-core-glossary-20261026` | 7.199 MiB | 16 / 5,040,174 | `E:/Warhammer/archive-reports/qa/qa-artifacts/minimal-pwa-core-glossary-20261026` |
| `E:/Warhammer/qa-artifacts/minimal-pwa-css-20261027` | 18.171 MiB | 20 / 4,844,900 | `E:/Warhammer/archive-reports/qa/qa-artifacts/minimal-pwa-css-20261027` |
| `E:/Warhammer/qa-artifacts/minimal-pwa-fix-20261026` | 4.174 GiB | 1,503 / 555,949,144 | `E:/Warhammer/archive-reports/qa/qa-artifacts/minimal-pwa-fix-20261026` |
| `E:/Warhammer/qa-artifacts/minimal-pwa-recovery-integration-20261027` | 1.060 MiB | 8 / 1,086,083 | `E:/Warhammer/archive-reports/qa/qa-artifacts/minimal-pwa-recovery-integration-20261027` |
| `E:/Warhammer/qa-artifacts/normal-datasheet-parity-51088e8e` | 16.162 MiB | 1 / 1,654 | `E:/Warhammer/archive-reports/qa/qa-artifacts/normal-datasheet-parity-51088e8e` |
| `E:/Warhammer/qa-artifacts/patch-release-4a8b9a29-20261014` | 144.268 MiB | 15 / 632,777 | `E:/Warhammer/archive-reports/qa/qa-artifacts/patch-release-4a8b9a29-20261014` |
| `E:/Warhammer/qa-artifacts/personal-datasheet-parity-43bd6aaf` | 63.761 MiB | 3 / 5,758 | `E:/Warhammer/archive-reports/qa/qa-artifacts/personal-datasheet-parity-43bd6aaf` |
| `E:/Warhammer/qa-artifacts/phase2b-shell-final` | 4.274 MiB | 0 / 0 | `E:/Warhammer/archive-reports/qa/qa-artifacts/phase2b-shell-final` |
| `E:/Warhammer/qa-artifacts/pwa-historical-failure-20261027` | 17.955 KiB | 10 / 11,757 | `E:/Warhammer/archive-reports/qa/qa-artifacts/pwa-historical-failure-20261027` |
| `E:/Warhammer/qa-artifacts/recovery-admech-five-qa-fixes-20261018` | 117.394 KiB | 6 / 24,710 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-admech-five-qa-fixes-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-admech-megaroster-20261018` | 3.387 MiB | 18 / 1,126,462 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-admech-megaroster-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-admech-omega-acceptance-20261018` | 567.246 MiB | 37 / 16,064,518 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-admech-omega-acceptance-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-admech-omega-caption-fix-20261018` | 5.534 MiB | 2 / 142,878 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-admech-omega-caption-fix-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-admech-omega-proposal-20261018` | 7.427 MiB | 5 / 2,939,898 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-admech-omega-proposal-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-army-book-cover-restoration-20261020` | 6.426 MiB | 5 / 183,995 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-army-book-cover-restoration-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-omega-acceptance-20261023` | 896.432 MiB | 450 / 116,565,664 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-omega-acceptance-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-omega-root-cause-fix-safety-20261023` | 933.243 MiB | 1,178 / 361,903,156 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-omega-root-cause-fix-safety-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-real-newrecruit37-p2-validation-20261023` | 1.001 MiB | 9 / 222,006 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-real-newrecruit37-p2-validation-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage1-discovery-20261022` | 56.570 MiB | 48 / 2,151,447 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage1-discovery-20261022` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage2a-foundation-20261022` | 1.053 MiB | 19 / 892,266 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage2a-foundation-20261022` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage2b-mfm-20261022` | 23.187 MiB | 25 / 815,672 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage2b-mfm-20261022` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage2c-mixed-owner-20261022` | 21.984 MiB | 14 / 703,170 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage2c-mixed-owner-20261022` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage3a-gameplay-20261022` | 22.579 MiB | 20 / 1,303,867 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage3a-gameplay-20261022` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage3b-physical-import-20261022` | 23.360 MiB | 24 / 2,306,275 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage3b-physical-import-20261022` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage3c-coverage-20261022` | 12.462 MiB | 25 / 1,915,940 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage3c-coverage-20261022` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage4a-application-20261022` | 128.360 MiB | 196 / 2,628,576 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage4a-application-20261022` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage4b-capabilities-20261022` | 500.163 MiB | 566 / 47,709,460 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage4b-capabilities-20261022` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage4b1-independent-review-20261023` | 304.277 MiB | 426 / 43,728,799 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage4b1-independent-review-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage4b2-integration-20261023` | 151.118 MiB | 236 / 22,296,764 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage4b2-integration-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage52-safe-attribution-20261023` | 509.420 MiB | 618 / 207,124,056 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage52-safe-attribution-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage53-attribution-integration-20261023` | 272.111 MiB | 322 / 107,254,091 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage53-attribution-integration-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage54-points-p2-20261023` | 305.553 MiB | 412 / 123,011,211 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage54-points-p2-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-charge-frontend-review-20261018` | 17.904 MiB | 7 / 519,601 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-charge-frontend-review-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-crlf-integrity-20261018` | 900.375 KiB | 8 / 54,125 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-crlf-integrity-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-cross-book-root-fixes-20261018` | 8.367 MiB | 31 / 4,835,808 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-cross-book-root-fixes-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-csm-dd-fix-4bef79a7-20261018` | 106.186 MiB | 54 / 13,314,275 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-csm-dd-fix-4bef79a7-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-csm-megaroster-20261018` | 5.321 MiB | 21 / 2,343,699 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-csm-megaroster-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-csm-omega-acceptance-4bef79a7-20261018` | 80.327 MiB | 64 / 15,890,307 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-csm-omega-acceptance-4bef79a7-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-csm-omega-proposal-4bef79a7-20261018` | 271.163 KiB | 3 / 254,296 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-csm-omega-proposal-4bef79a7-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-omega-acceptance-20261021` | 610.275 MiB | 1,768 / 37,932,430 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-omega-acceptance-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-root-cause-20261021` | 6.936 MiB | 57 / 2,707,785 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-root-cause-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage1-discovery-20261021` | 63.164 MiB | 34 / 1,540,087 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage1-discovery-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage2a-foundation-20261021` | 41.303 KiB | 9 / 22,977 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage2a-foundation-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage2b-mfm-20261021` | 6.528 MiB | 21 / 6,797,304 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage2b-mfm-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage2c-mixed-owner-20261021` | 129.239 MiB | 102 / 29,772,093 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage2c-mixed-owner-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage3a-mechanics-20261021` | 630.211 KiB | 12 / 471,211 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage3a-mechanics-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage3b-chapter-context-20261021` | 679.903 KiB | 10 / 351,149 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage3b-chapter-context-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage3b1-applicability-20261021` | 4.028 MiB | 13 / 634,477 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage3b1-applicability-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage3c-physical-import-20261021` | 7.991 MiB | 12 / 126,345 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage3c-physical-import-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage3d-static-gameplay-20261021` | 2.088 MiB | 11 / 436,978 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage3d-static-gameplay-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage4a-application-20261021` | 114.563 MiB | 298 / 2,787,340 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage4a-application-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage4b-coverage-20261021` | 10.837 MiB | 51 / 1,721,450 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage4b-coverage-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage4c-capabilities-20261021` | 143.193 MiB | 860 / 36,131,801 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage4c-capabilities-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage4c-final-review-20261021` | 46.535 MiB | 265 / 8,962,932 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage4c-final-review-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage4c-integration-20261021` | 46.407 MiB | 262 / 8,862,508 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage4c-integration-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage4c-shared-capabilities-20261021` | 16.820 KiB | 1 / 5,122 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage4c-shared-capabilities-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage51-fixes-20261021` | 145.022 MiB | 796 / 31,971,942 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage51-fixes-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage52-integration-20261021` | 65.455 MiB | 346 / 11,888,241 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage52-integration-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage53-omega-closure-20261021` | 70.762 MiB | 222 / 17,279,153 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage53-omega-closure-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage6a-release-20261021` | 111.987 MiB | 54 / 2,357,936 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage6a-release-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage6a-resume-20261021` | 350.501 MiB | 653 / 18,876,048 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage6a-resume-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage6a1-enrollment-bytes-20261021` | 1.544 MiB | 57 / 1,560,552 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage6a1-enrollment-bytes-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage6b-production-20261021` | 627.215 MiB | 613 / 15,587,236 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage6b-production-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-dg-megaroster-20261018` | 3.995 MiB | 16 / 971,962 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-dg-megaroster-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-dg-omega-final-d53656ad-20261018` | 8.577 MiB | 28 / 3,661,644 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-dg-omega-final-d53656ad-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-dg-omega-fixed-roster-20261018` | 8.536 MiB | 26 / 3,584,155 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-dg-omega-fixed-roster-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-dg-selective-transfer-20261017` | 28.654 MiB | 7 / 6,414 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-dg-selective-transfer-20261017` |
| `E:/Warhammer/qa-artifacts/recovery-ec-omega-acceptance-20261019` | 167.733 MiB | 522 / 60,383,173 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ec-omega-acceptance-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-ec-omega-import-fix-20261019` | 162.364 MiB | 412 / 54,939,196 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ec-omega-import-fix-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-ec-omega-proposal-20261019` | 3.170 MiB | 8 / 3,284,148 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ec-omega-proposal-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-equipment-identity-grouping-fix-20261020` | 8.352 MiB | 361 / 7,449,767 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-equipment-identity-grouping-fix-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-granted-ability-attribution-20261020` | 16.667 MiB | 22 / 1,929,047 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-granted-ability-attribution-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-preserve-reimport-attachments-20261020` | 16.264 MiB | 112 / 1,721,607 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-preserve-reimport-attachments-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-qa-census-eca6c72d-20261018` | 216.170 KiB | 7 / 46,796 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-qa-census-eca6c72d-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-reimport-attachments-investigation-20261020` | 22.388 KiB | 4 / 15,696 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-reimport-attachments-investigation-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-shared-equipment-caption-fix-20261018` | 298.433 MiB | 38 / 12,588,907 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-shared-equipment-caption-fix-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-sm-mfm-v16-enrollment-20261020` | 1.356 MiB | 8 / 686,165 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-mfm-v16-enrollment-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-sm-native-mfm-stage4a-20261020` | 447.059 KiB | 1 / 457,788 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-native-mfm-stage4a-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-omega-acceptance-20261020` | 568.852 MiB | 868 / 33,592,368 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-omega-acceptance-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage1-discovery-20261020` | 59.563 MiB | 26 / 2,987,194 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage1-discovery-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage1-independent-review-20261020` | 1000.754 KiB | 14 / 525,396 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage1-independent-review-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage2a-20261020` | 72.630 KiB | 3 / 16,354 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage2a-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage2b-20261020` | 7.041 MiB | 11 / 3,756,910 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage2b-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage2c-20261020` | 22.430 KiB | 7 / 13,923 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage2c-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage3a-20261020` | 30.336 KiB | 18 / 25,475 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage3a-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage3b-20261020` | 24.737 KiB | 22 / 25,331 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage3b-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage4a-20261020` | 6.062 MiB | 19 / 6,332,483 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage4a-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage4b-20261020` | 100.277 KiB | 5 / 71,469 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage4b-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage4c-20261020` | 133.981 KiB | 18 / 109,471 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage4c-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage4d-20261020` | 11.071 MiB | 25 / 5,424,598 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage4d-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage5a-20261020` | 328.480 MiB | 53 / 613,610 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage5a-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage5c-20261020` | 289.016 MiB | 12 / 244,056 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage5c-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage5d-20261020` | 4.473 MiB | 21 / 375,383 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage5d-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-tau-omega-acceptance-20261019` | 85.466 MiB | 262 / 42,336,549 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-omega-acceptance-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-tau-omega-evidence-closure-20261020` | 58.116 MiB | 203 / 9,715,845 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-omega-evidence-closure-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-tau-omega-final-reacceptance-20261020` | 81.261 MiB | 696 / 58,943,196 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-omega-final-reacceptance-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-tau-omega-final-reconciliation-20261020` | 40.167 KiB | 2 / 15,544 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-omega-final-reconciliation-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-tau-omega-proposal-20261019` | 40.145 MiB | 39 / 11,674,023 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-omega-proposal-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-tau-omega-reviewed-addendum-20261020` | 98.765 KiB | 6 / 79,444 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-omega-reviewed-addendum-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-tau-student-source-scenario-review-20261020` | 309.166 KiB | 6 / 48,529 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-student-source-scenario-review-20261020` |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage1-20261019` | 4.722 MiB | 15 / 1,115,895 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-v2-stage1-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage2-20261019` | 1.904 MiB | 16 / 1,658,817 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-v2-stage2-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage3-20261019` | 247.604 KiB | 5 / 198,055 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-v2-stage3-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4-20261019` | 206.847 KiB | 29 / 158,166 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-v2-stage4-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4b-20261019` | 254.637 KiB | 24 / 242,413 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-v2-stage4b-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4c-20261019` | 357.618 KiB | 53 / 293,634 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-v2-stage4c-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4d-20261019` | 393.752 KiB | 62 / 317,731 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-v2-stage4d-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4g-20261019` | 181.951 KiB | 20 / 181,129 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-v2-stage4g-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4g-completion-20261019` | 127.955 KiB | 3 / 131,026 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-v2-stage4g-completion-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4g-final-20261019` | 1.565 MiB | 26 / 1,640,501 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-v2-stage4g-final-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage5-20261019` | 92.813 MiB | 47 / 690,729 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-v2-stage5-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage6-20261019` | 92.043 MiB | 60 / 817,080 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-v2-stage6-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-tyranids-omega-acceptance-20261019` | 289.526 MiB | 805 / 87,741,402 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tyranids-omega-acceptance-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-tyranids-omega-proposal-20261019` | 6.858 MiB | 25 / 6,770,690 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tyranids-omega-proposal-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-tyranids-trygon-selection-fix-20261019` | 289.272 MiB | 624 / 123,085,163 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tyranids-trygon-selection-fix-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-tyranids-trygon-source-choice-fix-20261019` | 6.616 KiB | 1 / 1,872 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tyranids-trygon-source-choice-fix-20261019` |
| `E:/Warhammer/qa-artifacts/recovery-unified-v2-stage6a-20261021` | 489.455 MiB | 53 / 1,460,726 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-unified-v2-stage6a-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-unified-v2-stage6b1-20261021` | 69.396 MiB | 78 / 10,204,373 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-unified-v2-stage6b1-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-unified-v2-stage6b2-20261021` | 420.615 MiB | 30 / 2,347,137 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-unified-v2-stage6b2-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-unified-v2-stage6c-20261021` | 706.509 MiB | 68 / 3,533,382 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-unified-v2-stage6c-20261021` |
| `E:/Warhammer/qa-artifacts/recovery-v2-15-rule-presentation-20261018` | 10.343 MiB | 7 / 2,379,143 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-15-rule-presentation-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-v2-controlled-nr373-integration-20261024` | 30.222 MiB | 73 / 18,190,960 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-controlled-nr373-integration-20261024` |
| `E:/Warhammer/qa-artifacts/recovery-v2-controlled-stage57-integration-20261023` | 26.116 MiB | 59 / 16,266,363 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-controlled-stage57-integration-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-v2-enhancement-text-fix-78522fcf-20261018` | 32.277 MiB | 14 / 4,203,188 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-enhancement-text-fix-78522fcf-20261018` |
| `E:/Warhammer/qa-artifacts/recovery-v2-four-original-nr373-validation-20261024` | 1.658 MiB | 14 / 1,712,279 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-four-original-nr373-validation-20261024` |
| `E:/Warhammer/qa-artifacts/recovery-v2-model-identity-safety-20261024` | 65.526 MiB | 76 / 18,492,857 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-model-identity-safety-20261024` |
| `E:/Warhammer/qa-artifacts/recovery-v2-model-membership-no-brackets-20261024` | 30.121 MiB | 77 / 18,358,443 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-model-membership-no-brackets-20261024` |
| `E:/Warhammer/qa-artifacts/recovery-v2-nine-book-release-20261024` | 444.607 MiB | 93 / 21,240,058 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-nine-book-release-20261024` |
| `E:/Warhammer/qa-artifacts/recovery-v2-real-newrecruit373-validation-20261023` | 650.645 KiB | 18 / 651,234 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-real-newrecruit373-validation-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-v2-real-nr373-import-fix-20261023` | 30.917 MiB | 88 / 16,924,875 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-real-nr373-import-fix-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-v2-sm-appqa-independent-review-20261023` | 559.717 KiB | 3 / 22,686 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-sm-appqa-independent-review-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-v2-sm-deathwatch-qa-contract-20261023` | 26.099 MiB | 55 / 16,252,908 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-sm-deathwatch-qa-contract-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-v2-sm-newrecruit373-original-validation-20261023` | 57.205 KiB | 3 / 58,578 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-sm-newrecruit373-original-validation-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-v2-stage56-multi-detachment-20261023` | 279.861 MiB | 303 / 80,409,566 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-stage56-multi-detachment-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-v2-stage57-stage56-p2-integration-20261023` | 33.484 MiB | 59 / 16,369,427 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-stage57-stage56-p2-integration-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-v2-stage58-universal-knownness-20261023` | 728.512 KiB | 5 / 730,737 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-stage58-universal-knownness-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-v2-stage59-universal-pricing-20261023` | 124.725 MiB | 116 / 6,851,522 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-stage59-universal-pricing-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-v2-stage591-canonical-option-knownness-20261023` | 65.166 MiB | 69 / 4,126,235 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-stage591-canonical-option-knownness-20261023` |
| `E:/Warhammer/qa-artifacts/recovery-v2-universal-nr373-mfm-20261024` | 35.764 MiB | 15 / 536,591 | `E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-universal-nr373-mfm-20261024` |
| `E:/Warhammer/qa-artifacts/release-candidate-b1-b3-pwa-20261027` | 6.262 KiB | 3 / 4,411 | `E:/Warhammer/archive-reports/qa/qa-artifacts/release-candidate-b1-b3-pwa-20261027` |
| `E:/Warhammer/qa-artifacts/release-candidate-b1-b3-pwa-fresh-20261027` | 2.075 MiB | 19 / 2,164,560 | `E:/Warhammer/archive-reports/qa/qa-artifacts/release-candidate-b1-b3-pwa-fresh-20261027` |
| `E:/Warhammer/qa-artifacts/release-certification-98fc94a5-20261009` | 202.606 MiB | 235 / 23,376,850 | `E:/Warhammer/archive-reports/qa/qa-artifacts/release-certification-98fc94a5-20261009` |
| `E:/Warhammer/qa-artifacts/release-manifest-sw-investigation-20261026` | 5.582 MiB | 21 / 5,292,493 | `E:/Warhammer/archive-reports/qa/qa-artifacts/release-manifest-sw-investigation-20261026` |
| `E:/Warhammer/qa-artifacts/release-preview-98fc94a5` | 52.859 MiB | 2 / 2,234 | `E:/Warhammer/archive-reports/qa/qa-artifacts/release-preview-98fc94a5` |
| `E:/Warhammer/qa-artifacts/release-remainder-df80f6a3-20261017` | 1.184 MiB | 3 / 143,027 | `E:/Warhammer/archive-reports/qa/qa-artifacts/release-remainder-df80f6a3-20261017` |
| `E:/Warhammer/qa-artifacts/runtime-manifest-integration-20261026` | 7.412 MiB | 22 / 1,363,698 | `E:/Warhammer/archive-reports/qa/qa-artifacts/runtime-manifest-integration-20261026` |
| `E:/Warhammer/qa-artifacts/safe-pwa-updates-20261026` | 291.512 MiB | 53 / 31,431,037 | `E:/Warhammer/archive-reports/qa/qa-artifacts/safe-pwa-updates-20261026` |
| `E:/Warhammer/qa-artifacts/shell-allowlist-210a6aab-home-6880624e-7b49-4335-ab19-e457c693250e` | 6.120 MiB | 0 / 0 | `E:/Warhammer/archive-reports/qa/qa-artifacts/shell-allowlist-210a6aab-home-6880624e-7b49-4335-ab19-e457c693250e` |
| `E:/Warhammer/qa-artifacts/source-completeness-gate-1af1d51f-20261017` | 28.359 KiB | 2 / 5,656 | `E:/Warhammer/archive-reports/qa/qa-artifacts/source-completeness-gate-1af1d51f-20261017` |
| `E:/Warhammer/qa-artifacts/source-runtime-manifest-fix-20261026` | 7.431 MiB | 25 / 1,382,113 | `E:/Warhammer/archive-reports/qa/qa-artifacts/source-runtime-manifest-fix-20261026` |
| `E:/Warhammer/qa-artifacts/stale-test-input-fix-ab41bb1f-20261017` | 69.171 KiB | 5 / 52,149 | `E:/Warhammer/archive-reports/qa/qa-artifacts/stale-test-input-fix-ab41bb1f-20261017` |
| `E:/Warhammer/qa-artifacts/tyranids-seven-effects-4edfabbd-20261016` | 11.674 MiB | 4 / 2,740,400 | `E:/Warhammer/archive-reports/qa/qa-artifacts/tyranids-seven-effects-4edfabbd-20261016` |
| `E:/Warhammer/qa-artifacts/tyranids-v2-isolated-browser` | 9.322 MiB | 2 / 2,831 | `E:/Warhammer/archive-reports/qa/qa-artifacts/tyranids-v2-isolated-browser` |
| `E:/Warhammer/qa-artifacts/tyranids-v2-unified-browser` | 8.819 MiB | 1 / 1,046 | `E:/Warhammer/archive-reports/qa/qa-artifacts/tyranids-v2-unified-browser` |
| `E:/Warhammer/qa-artifacts/tyranids-v2-user-stress-ee6387be-20261015` | 54.281 MiB | 306 / 8,120,007 | `E:/Warhammer/archive-reports/qa/qa-artifacts/tyranids-v2-user-stress-ee6387be-20261015` |
| `E:/Warhammer/qa-artifacts/unified-glossary-reference-98fc94a5` | 8.252 MiB | 3 / 115,825 | `E:/Warhammer/archive-reports/qa/qa-artifacts/unified-glossary-reference-98fc94a5` |
| `E:/Warhammer/qa-artifacts/unified-regression-f5d203d2-20261013-fa10caa3-1781-40e9-8c32-86d70a1c4b75` | 7.628 MiB | 11 / 580,867 | `E:/Warhammer/archive-reports/qa/qa-artifacts/unified-regression-f5d203d2-20261013-fa10caa3-1781-40e9-8c32-86d70a1c4b75` |
| `E:/Warhammer/qa-artifacts/unified-v2-cover-release-20261020` | 12.825 MiB | 9 / 338,215 | `E:/Warhammer/archive-reports/qa/qa-artifacts/unified-v2-cover-release-20261020` |
| `E:/Warhammer/qa-artifacts/unified-v2-five-books-release-df80f6a3-20261017` | 27.344 KiB | 9 / 28,000 | `E:/Warhammer/archive-reports/qa/qa-artifacts/unified-v2-five-books-release-df80f6a3-20261017` |
| `E:/Warhammer/qa-artifacts/unified-v2-image-audit-ca651a23-20261020` | 520.863 MiB | 4 / 298,112 | `E:/Warhammer/archive-reports/qa/qa-artifacts/unified-v2-image-audit-ca651a23-20261020` |
| `E:/Warhammer/qa-artifacts/unified-v2-live-playwright-df80f6a3-20261017` | 14.298 MiB | 24 / 882,859 | `E:/Warhammer/archive-reports/qa/qa-artifacts/unified-v2-live-playwright-df80f6a3-20261017` |
| `E:/Warhammer/qa-artifacts/unified-v2-pages-release-ca651a23-20261020` | 23.761 MiB | 9 / 150,271 | `E:/Warhammer/archive-reports/qa/qa-artifacts/unified-v2-pages-release-ca651a23-20261020` |
| `E:/Warhammer/qa-artifacts/unified-v2-recovery-20261017` | 474.205 KiB | 4 / 2,596 | `E:/Warhammer/archive-reports/qa/qa-artifacts/unified-v2-recovery-20261017` |
| `E:/Warhammer/qa-artifacts/unified-v2-release-preflight-20261020` | 99.253 MiB | 38 / 683,871 | `E:/Warhammer/archive-reports/qa/qa-artifacts/unified-v2-release-preflight-20261020` |
| `E:/Warhammer/qa-artifacts/unified-v2-release-preparation-3f362abb-20261020` | 173.805 MiB | 120 / 1,478,839 | `E:/Warhammer/archive-reports/qa/qa-artifacts/unified-v2-release-preparation-3f362abb-20261020` |
| `E:/Warhammer/qa-artifacts/unified-v2-safety-backup-20261017` | 535.328 KiB | 2 / 548,176 | `E:/Warhammer/archive-reports/qa/qa-artifacts/unified-v2-safety-backup-20261017` |
| `E:/Warhammer/qa-artifacts/unified-v2-technical-acceptance-ab41bb1f-20261017` | 2.220 MiB | 25 / 335,900 | `E:/Warhammer/archive-reports/qa/qa-artifacts/unified-v2-technical-acceptance-ab41bb1f-20261017` |
| `E:/Warhammer/qa-artifacts/v1-home-port` | 7.799 MiB | 2 / 34,214 | `E:/Warhammer/archive-reports/qa/qa-artifacts/v1-home-port` |
| `E:/Warhammer/qa-artifacts/v1-leftovers-20261027` | 1.512 GiB | 159 / 182,795,590 | `E:/Warhammer/archive-reports/qa/qa-artifacts/v1-leftovers-20261027` |
| `E:/Warhammer/qa-artifacts/v1-tests-pdf-cleanup-20261027` | 6.804 GiB | 603 / 819,423,418 | `E:/Warhammer/archive-reports/qa/qa-artifacts/v1-tests-pdf-cleanup-20261027` |
| `E:/Warhammer/qa-artifacts/v1-v2-home-audit-b7db5f31` | 3.971 MiB | 0 / 0 | `E:/Warhammer/archive-reports/qa/qa-artifacts/v1-v2-home-audit-b7db5f31` |
| `E:/Warhammer/qa-artifacts/v2-home-forensic-f4854559-1791893512065` | 0 B | 0 / 0 | `E:/Warhammer/archive-reports/qa/qa-artifacts/v2-home-forensic-f4854559-1791893512065` |
| `E:/Warhammer/qa-artifacts/v2-home-forensic-f4854559-1791893580312` | 2.085 MiB | 1 / 7,864 | `E:/Warhammer/archive-reports/qa/qa-artifacts/v2-home-forensic-f4854559-1791893580312` |
| `E:/Warhammer/qa-artifacts/v2-home-qa-f4854559-acceptance` | 6.611 MiB | 0 / 0 | `E:/Warhammer/archive-reports/qa/qa-artifacts/v2-home-qa-f4854559-acceptance` |
| `E:/Warhammer/qa-artifacts/v2-home-qa-f4854559-acceptance-final` | 7.055 MiB | 0 / 0 | `E:/Warhammer/archive-reports/qa/qa-artifacts/v2-home-qa-f4854559-acceptance-final` |
| `E:/Warhammer/qa-artifacts/v2-only-baseline-adjudication-20261027` | 27.839 KiB | 3 / 10,572 | `E:/Warhammer/archive-reports/qa/qa-artifacts/v2-only-baseline-adjudication-20261027` |
| `E:/Warhammer/qa-artifacts/v2-only-baseline-resume-rc-20261027` | 10.029 MiB | 15 / 4,078,133 | `E:/Warhammer/archive-reports/qa/qa-artifacts/v2-only-baseline-resume-rc-20261027` |
| `E:/Warhammer/qa-artifacts/v2-only-core-glossary-qa-20261027` | 37.942 MiB | 46 / 11,167,377 | `E:/Warhammer/archive-reports/qa/qa-artifacts/v2-only-core-glossary-qa-20261027` |
| `E:/Warhammer/qa-artifacts/v2-only-eol-integration-candidate-20261027` | 4.921 MiB | 72 / 2,620,657 | `E:/Warhammer/archive-reports/qa/qa-artifacts/v2-only-eol-integration-candidate-20261027` |
| `E:/Warhammer/qa-artifacts/v2-only-integration-release-candidate-20261027` | 5.092 MiB | 10 / 89,868 | `E:/Warhammer/archive-reports/qa/qa-artifacts/v2-only-integration-release-candidate-20261027` |
| `E:/Warhammer/qa-artifacts/v2-only-production-20261027` | 482.465 KiB | 9 / 388,333 | `E:/Warhammer/archive-reports/qa/qa-artifacts/v2-only-production-20261027` |
| `E:/Warhammer/qa-artifacts/v2-only-remove-legacy-20261027` | 30.775 MiB | 78 / 5,494,253 | `E:/Warhammer/archive-reports/qa/qa-artifacts/v2-only-remove-legacy-20261027` |
| `E:/Warhammer/qa-artifacts/wargear-compatibility-a316ff0c-20261017` | 45.658 KiB | 2 / 42,861 | `E:/Warhammer/archive-reports/qa/qa-artifacts/wargear-compatibility-a316ff0c-20261017` |
| `E:/Warhammer/qa-artifacts/wargear-contract-pilot-20261017` | 2.719 MiB | 14 / 86,981 | `E:/Warhammer/archive-reports/qa/qa-artifacts/wargear-contract-pilot-20261017` |
| `E:/Warhammer/qa-artifacts/wargear-schema-capabilities-20261017` | 64.101 KiB | 5 / 22,306 | `E:/Warhammer/archive-reports/qa/qa-artifacts/wargear-schema-capabilities-20261017` |
| `E:/Warhammer/qa-artifacts/wargear-technical-review-b1d69da4-20261017` | 24.135 KiB | 2 / 24,714 | `E:/Warhammer/archive-reports/qa/qa-artifacts/wargear-technical-review-b1d69da4-20261017` |
| `E:/Warhammer/qa-artifacts/_manifests` | 24.852 MiB | 89 / 26,016,612 | `E:/Warhammer/archive-reports/qa/qa-artifacts/_manifests` |
| `E:/Warhammer/qa-evidence/dg-am-rule-recipients` | 47.839 MiB | 44 / 5,366,351 | `E:/Warhammer/archive-reports/qa/qa-evidence/dg-am-rule-recipients` |
| `E:/Warhammer/qa-evidence/o1-core-diagnosis-20261031` | 7.354 KiB | 2 / 5,679 | `E:/Warhammer/archive-reports/qa/qa-evidence/o1-core-diagnosis-20261031` |
| `E:/Warhammer/qa-evidence/o1-pre-ff-reviewed-0ba0426b` | 845.390 MiB | 83 / 104,520,824 | `E:/Warhammer/archive-reports/qa/qa-evidence/o1-pre-ff-reviewed-0ba0426b` |
| `E:/Warhammer/qa-evidence/o1-recipient-rule-text` | 57.223 MiB | 16 / 597,468 | `E:/Warhammer/archive-reports/qa/qa-evidence/o1-recipient-rule-text` |
| `E:/Warhammer/qa-evidence/show-1-card-labels` | 912.779 MiB | 108 / 105,053,134 | `E:/Warhammer/archive-reports/qa/qa-evidence/show-1-card-labels` |
| `E:/Warhammer/qa-evidence/show-2-card-display` | 991.431 MiB | 653 / 114,721,171 | `E:/Warhammer/archive-reports/qa/qa-evidence/show-2-card-display` |
| `E:/Warhammer/qa-evidence/test-speedup-20261030` | 4.753 GiB | 750 / 416,891,925 | `E:/Warhammer/archive-reports/qa/qa-evidence/test-speedup-20261030` |
| `E:/Warhammer/qa-evidence/test-temp-cleanup-tau` | 144.625 MiB | 206 / 5,286,466 | `E:/Warhammer/archive-reports/qa/qa-evidence/test-temp-cleanup-tau` |
| `E:/Warhammer/qa-evidence/translate-3-final-jbowQJ` | 1.009 GiB | 91 / 133,492,340 | `E:/Warhammer/archive-reports/qa/qa-evidence/translate-3-final-jbowQJ` |
| `E:/Warhammer/qa-evidence/translate-3-sources-v2-EnpOFC` | 773.526 MiB | 70 / 102,754,509 | `E:/Warhammer/archive-reports/qa/qa-evidence/translate-3-sources-v2-EnpOFC` |

## 3. Dependency recalculation and preserved paths

Final Git classification: 56 SAFE_TO_DELETE, 8 KEEP and 14 UNCLEAR. Previously dependency-only roots were released only after every dependent copy was also selected and their own unique state was archived. Baseline949d98f, the final Tyranids trial clone and the extra pinned BSData copy meet that rule. Official-updates/core-switch/Core-WIP origin anchors exceed the cap and remain excluded.

The standalone old BSData copy nested under over-cap warhammer-w2-25-sm-facts is conservatively excluded too, so the retained parent copy is left intact. The main pinned BSData common owner is retained even after its old child worktrees are removed; current remote availability was not assumed.

| Git path retained KEEP | Reason |
| --- | --- |
| `E:/Warhammer/worktrees/nr-v3725-header-v1` | Current working checkout. |
| `E:/Warhammer/worktrees/fabius-safe-import-v1` | Referenced as a dependency/junction target or configured origin by another retained tree; preserve until those references are deliberately retired. |
| `E:/Warhammer/worktrees/card-texts-v1` | Referenced as a dependency/junction target or configured origin by another retained tree; preserve until those references are deliberately retired. |
| `E:/Warhammer/warhammer-w2-25-sm-facts/tmp/bsdata-wh40k-11e` | Nested inside a retained over-cap Git copy; left untouched. |
| `E:/Warhammer/warhammer-v2-safety-20261017` | Referenced as a dependency/junction target or configured origin by another retained tree; preserve until those references are deliberately retired. |
| `E:/Warhammer/warhammer-v2-recovery` | Owns shared Git common directory used by other registered worktrees; removing this tree would destroy their object/ref store. |
| `E:/Warhammer/warhammer-rules-complete-preview` | Owns shared Git common directory used by other registered worktrees; removing this tree would destroy their object/ref store. |
| `E:/Warhammer/warhammer-rules-complete-preview/tmp/bsdata-wh40k-11e` | Owns shared Git common directory used by other registered worktrees; removing this tree would destroy their object/ref store. |

Always preserve: current nr-v3725-header-v1; common owners warhammer-v2-recovery, warhammer-rules-complete-preview and its main bsdata-wh40k-11e repository; the local safety origin; the nr→card-texts→fabius dependency chain; preview-v1/package-9a487657, PID29324 files, TLS and preview recipes; QA evidence dated November 1 or later; archive-reports; the cleanup-script folder; and all E:/Codex. No non-Git tmp/archive container was added merely because its name sounds temporary.

## 4. Review script and complete preflight

Prepared local file: E:/Warhammer/qa-tmp/disk-cleanup/apply-2.ps1. Review copy in this branch: [disk-cleanup-apply-2.ps1](disk-cleanup-apply-2.ps1). Apply is already true as requested, but neither copy was run. PowerShell7+ is required; the script changes no execution policy, file association, firewall, certificate or server.

| Pinned item | Location / SHA-256 |
| --- | --- |
| Private manifest | E:/Warhammer/archive-reports/cleanup-2-manifest.json |
| Manifest SHA-256 | da9dc1edd38835b958a45203168d294565ae1302b943052db49fce1b86cc7674 |
| Exact local/review script SHA-256 | 051b6e9a6041b0ecc32a09189ce5ef062628eae2cad86bb813d32e9fff20df2a |
| Verified archive payload | 29,505 files / 7,717,906,057 bytes |

The script embeds the exact path/kind/owner list below and compares it with the SHA-pinned private manifest. The manifest contains immutable archive-file checksums and source fingerprints; it is local input, not a source of arbitrary unpinned paths. All archive files must be under protected archive-reports.

Before any mutation it checks: absolute Warhammer scope; no reparse ancestors; all protected trees/common owners; all 29,505 archive-file sizes/count/byte totals/SHA-256; exact Git HEAD/branch/common directory/status/tracked/cached/ref hashes; all source directory metadata fingerprints and loose-file SHA-256; worktree registration/locks; explicit proof for nested Git roots; every reparse entry declared as a junction-only operation; no unplanned shared Git owner; and running-process references. Process references are refreshed again after the potentially long checks, immediately before mutation. A failure aborts before the first deletion.

Only the exact refs/heads/codex/disk-e-audit-evidence line is excluded from the common-ref fingerprint because this authorized report publication updates that branch. All other recorded branch/tag/stash refs remain checked. This is not permission to alter source/main/release.

Operations run deepest-first. A junction is removed by literal path with Force and **without Recurse**; its target is never traversed. A linked worktree is removed only through git worktree remove --force in its retained owner. Other exact directories/files use Remove-Item. After successful removals, git worktree prune runs once per retained owner. No branch deletion, reset, force push or merge is present. The script prints E: free bytes before/after in finally and pauses to keep the result visible.

All preflight is completed before mutation, but filesystem deletion is not transactional: a later Windows lock/permission/I/O error can still stop a partially completed cleanup. The script stops on such an error and preserves the archives/common stores. It is not intended for blind repeated execution after a partial run.

### Checks actually performed while preparing

- Static PowerShell AST parse: 0 errors. The cleanup entry point was never invoked.
- Read-only helper checks only: Python/PowerShell directory fingerprints matched for an ordinary small clone, a linked checkout and a worktree containing a junction; unborn-Git byte/ref checks matched; native worktree-list parsing succeeded. All 49 junction metadata targets matched their manifest proof. No remove/prune function was called.
- Independent static review confirmed 412 operations, 59 Git proofs, complete protection/dependency closure, exact archive counts/bytes, per-copy caps and allowed nesting. This did not execute cleanup.
- No tests, pre-ff, package builds or preview restart were run. Preview PID29324 remained running.

### Exact operations for Claude review

Worktree rows nested inside QA parent directories and junction rows are deliberately listed separately for safe ordering. Their byte sizes overlap the parent rows and are not additional reclaim.

| Exact deletion path | Method | Logical size | Archive / retained-history proof |
| --- | --- | --- | --- |
| `E:/Warhammer/qa-tmp/book-update-command-v1/wh-book-update-WVLHxS/work/checkout/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/qa-tmp/mfm-update-v1/wh-mfm-update-LuGjf2/work/checkout/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/qa-tmp/official-updates-v1/trials-approved-5bc26d82/tyranids/checkout/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/qa-tmp/official-updates-v1/trials-final/death-guard/checkout/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/qa-tmp/official-updates-v1/trials-final/tyranids/checkout/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-final/checkout/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-v2/checkout/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-v3/checkout/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-bd4W8f/checkout/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-jooswU/checkout/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-sugJ53/checkout/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-ufMFO6/checkout/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-wnwCOx/checkout/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-yRGrgn/checkout/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/qa-tmp/book-update-command-v1/wh-book-update-WVLHxS/work/checkout` | Remove-Item exact directory | 1.544 GiB | E:/Warhammer/archive-reports/git/book-update-command-v1--wh-book-update-WVLHxS--work--checkout--35166013 |
| `E:/Warhammer/qa-tmp/mfm-update-v1/warhammer-source-contract-B22n5D/work/capture-repo` | Remove-Item exact directory | 27.678 KiB | E:/Warhammer/archive-reports/git/mfm-update-v1--warhammer-source-contract-B22n5D--work--capture-repo--d212258c |
| `E:/Warhammer/qa-tmp/mfm-update-v1/warhammer-source-contract-B22n5D/work/tracked-inputs` | Remove-Item exact directory | 27.638 KiB | E:/Warhammer/archive-reports/git/mfm-update-v1--warhammer-source-contract-B22n5D--work--tracked-inputs--b47a7a0a |
| `E:/Warhammer/qa-tmp/mfm-update-v1/wh-mfm-update-LuGjf2/work/checkout` | Remove-Item exact directory | 1.556 GiB | E:/Warhammer/archive-reports/git/mfm-update-v1--wh-mfm-update-LuGjf2--work--checkout--c39fc993 |
| `E:/Warhammer/qa-tmp/official-updates-v1/trials-approved-5bc26d82/tyranids/checkout` | Remove-Item exact directory | 1.558 GiB | E:/Warhammer/archive-reports/git/official-updates-v1--trials-approved-5bc26d82--tyranids--checkout--b78c1815 |
| `E:/Warhammer/qa-tmp/official-updates-v1/trials-final/death-guard/checkout` | Remove-Item exact directory | 1.565 GiB | E:/Warhammer/archive-reports/git/official-updates-v1--trials-final--death-guard--checkout--68d3cd6b |
| `E:/Warhammer/qa-tmp/official-updates-v1/trials-final/tyranids/checkout` | Remove-Item exact directory | 1.558 GiB | E:/Warhammer/archive-reports/git/official-updates-v1--trials-final--tyranids--checkout--4b1d3552 |
| `E:/Warhammer/qa-tmp/official-updates-v1/tyranids-trial-guard-diagnostic/checkout/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/qa-artifacts/f1-detachment-recipients-20261028/baseline-checkout/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/qa-artifacts/f1-detachment-recipients-resume-20261028/baseline-checkout/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/qa-evidence/test-speedup-20261030/baseline/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-final/checkout` | Remove-Item exact directory | 1.553 GiB | E:/Warhammer/archive-reports/git/qa-tmp--book-update-command-v1--trial-ledger-final--checkout--ca621157 |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-v2/checkout` | Remove-Item exact directory | 1.548 GiB | E:/Warhammer/archive-reports/git/qa-tmp--book-update-command-v1--trial-ledger-v2--checkout--dbe56b2d |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-v3/checkout` | Remove-Item exact directory | 1.553 GiB | E:/Warhammer/archive-reports/git/qa-tmp--book-update-command-v1--trial-ledger-v3--checkout--41e70f63 |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-bd4W8f/checkout` | Remove-Item exact directory | 1.557 GiB | E:/Warhammer/archive-reports/git/qa-tmp--book-update-command-v1--trial-mfm-bd4W8f--checkout--7fe0f74f |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-jooswU/checkout` | Remove-Item exact directory | 1.557 GiB | E:/Warhammer/archive-reports/git/qa-tmp--book-update-command-v1--trial-mfm-jooswU--checkout--02cc355c |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-sugJ53/checkout` | Remove-Item exact directory | 1.557 GiB | E:/Warhammer/archive-reports/git/qa-tmp--book-update-command-v1--trial-mfm-sugJ53--checkout--1f5e4752 |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-ufMFO6/checkout` | Remove-Item exact directory | 1.556 GiB | E:/Warhammer/archive-reports/git/qa-tmp--book-update-command-v1--trial-mfm-ufMFO6--checkout--ed370bfb |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-wnwCOx/checkout` | Remove-Item exact directory | 1.557 GiB | E:/Warhammer/archive-reports/git/qa-tmp--book-update-command-v1--trial-mfm-wnwCOx--checkout--21bcd279 |
| `E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-yRGrgn/checkout` | Remove-Item exact directory | 1.557 GiB | E:/Warhammer/archive-reports/git/qa-tmp--book-update-command-v1--trial-mfm-yRGrgn--checkout--6e5237dd |
| `E:/Warhammer/qa-tmp/official-updates-v1/tyranids-trial-guard-diagnostic/checkout` | Remove-Item exact directory | 1.558 GiB | E:/Warhammer/archive-reports/git/qa-tmp--official-updates-v1--tyranids-trial-guard-diagnostic--checkout--fd4682a4 |
| `E:/Warhammer/worktrees/test-hygiene-min-v1/tmp/bsdata-wh40k-11e` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/qa-artifacts/f1-detachment-recipients-20261028/baseline-checkout` | git worktree remove --force | 1.089 GiB | Clean old-QA baseline; text archive and shared Git owner retained. |
| `E:/Warhammer/qa-artifacts/f1-detachment-recipients-resume-20261028/baseline-checkout` | git worktree remove --force | 1.089 GiB | Clean old-QA baseline; text archive and shared Git owner retained. |
| `E:/Warhammer/qa-evidence/test-speedup-20261030/baseline` | git worktree remove --force | 1.129 GiB | Clean old-QA baseline; text archive and shared Git owner retained. |
| `E:/Warhammer/qa-tmp/test-hygiene-min-v1/bsdata-wh40k-11e-fa30730fca11fbfe87be90684d481d50e0efaf66` | Remove-Item exact directory | 78.819 MiB | E:/Warhammer/archive-reports/git/bsdata-wh40k-11e-fa30730fca11fbfe87be90684d481d50e0efaf66--3fb23c23 |
| `E:/Warhammer/warhammer-rules-complete-preview/tmp/bsdata-wh40k-11e-72620b` | git worktree remove --force | 64.603 MiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/warhammer-rules-complete-preview/tmp/bsdata-wh40k-11e-b6d179` | git worktree remove --force | 64.502 MiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/warhammer-rules-complete-preview/tmp/bsdata-wh40k-11e-d5af57` | git worktree remove --force | 64.543 MiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/am-dg-recipient-gaps-v1/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/card-polish-2-v1/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/cards-cosmetics-v1/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/compatible-related-panel-v1/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/core-importer-a-v1/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/csm-tau-recipient-gaps-v1/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/csm-tau-tyranids-ec-rule-recipients/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/glossary-builder/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/keywords-access-v1/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/new-recruit-export-import-v1/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/new-recruit-model-names-v1/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/new-recruit-plain-header-v1/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/norma-1/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/o1-recipient-rule-text/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/o3-detachment-card-text-v1/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/show-1-card-labels/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/show-2-card-display/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/sm-ba-da-rule-recipients/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/sm-da-recipient-gaps-v1/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/source-catalog-registry-v1/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/sw-update-v1/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/sweep-polish-v1/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/test-hygiene-1/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/test-hygiene-2/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/test-hygiene-min-v1/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/test-temp-cleanup-tau/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/tyranids-ec-rule-coverage-v1/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/v1-cleanup-v1/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/Codex-Archive/patchrepo-2026-09-11` | Remove-Item exact directory | 178.864 KiB | E:/Warhammer/archive-reports/git/patchrepo-2026-09-11--a719d58d |
| `E:/Warhammer/qa-artifacts/_manifests` | Remove-Item exact directory | 24.852 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/_manifests |
| `E:/Warhammer/qa-artifacts/ability-category-76022d87-20261014` | Remove-Item exact directory | 1.428 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/ability-category-76022d87-20261014 |
| `E:/Warhammer/qa-artifacts/ability-dedup-855d641b` | Remove-Item exact directory | 13.642 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/ability-dedup-855d641b |
| `E:/Warhammer/qa-artifacts/ability-presentation-synthetic` | Remove-Item exact directory | 59.658 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/ability-presentation-synthetic |
| `E:/Warhammer/qa-artifacts/ability-release-20673f6d-20261014` | Remove-Item exact directory | 2.705 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/ability-release-20673f6d-20261014 |
| `E:/Warhammer/qa-artifacts/admech-fnp-fix-6e4aa58e-20261016` | Remove-Item exact directory | 5.425 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/admech-fnp-fix-6e4aa58e-20261016 |
| `E:/Warhammer/qa-artifacts/admech-native-fnp-fix-6e4aa58e-20261016` | Remove-Item exact directory | 2.695 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/admech-native-fnp-fix-6e4aa58e-20261016 |
| `E:/Warhammer/qa-artifacts/admech-omnispex-fix-f8f82f38-20261017` | Remove-Item exact directory | 5.469 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/admech-omnispex-fix-f8f82f38-20261017 |
| `E:/Warhammer/qa-artifacts/admech-v2-deep-audit` | Remove-Item exact directory | 132.818 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/admech-v2-deep-audit |
| `E:/Warhammer/qa-artifacts/am-datasheet-noise-022790fe` | Remove-Item exact directory | 2.931 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/am-datasheet-noise-022790fe |
| `E:/Warhammer/qa-artifacts/am-final-fdefd4da` | Remove-Item exact directory | 37.802 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/am-final-fdefd4da |
| `E:/Warhammer/qa-artifacts/am-glossary-fdefd4da` | Remove-Item exact directory | 33.949 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/am-glossary-fdefd4da |
| `E:/Warhammer/qa-artifacts/am-official-v1.4-20261014` | Remove-Item exact directory | 181.683 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/am-official-v1.4-20261014 |
| `E:/Warhammer/qa-artifacts/am-omnispex-caption-fix-20261014` | Remove-Item exact directory | 3.232 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/am-omnispex-caption-fix-20261014 |
| `E:/Warhammer/qa-artifacts/am-player-scenario-20261014-7545da94-f692-440f-ba70-36a107258fb3` | Remove-Item exact directory | 2.797 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/am-player-scenario-20261014-7545da94-f692-440f-ba70-36a107258fb3 |
| `E:/Warhammer/qa-artifacts/am-recert-ca771f43` | Remove-Item exact directory | 38.516 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/am-recert-ca771f43 |
| `E:/Warhammer/qa-artifacts/am-theme-1be58024` | Remove-Item exact directory | 26.128 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/am-theme-1be58024 |
| `E:/Warhammer/qa-artifacts/am-ux-fdefd4da` | Remove-Item exact directory | 22.110 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/am-ux-fdefd4da |
| `E:/Warhammer/qa-artifacts/am06` | Remove-Item exact directory | 11.803 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/am06 |
| `E:/Warhammer/qa-artifacts/am09-binding-ca771f43` | Remove-Item exact directory | 3.164 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/am09-binding-ca771f43 |
| `E:/Warhammer/qa-artifacts/b1-b3-pwa-production-20261027` | Remove-Item exact directory | 5.667 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/b1-b3-pwa-production-20261027 |
| `E:/Warhammer/qa-artifacts/charge-family-fix-ee6387be-20261016` | Remove-Item exact directory | 19.090 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/charge-family-fix-ee6387be-20261016 |
| `E:/Warhammer/qa-artifacts/charge-family-implementation-ee6387be-20261016` | Remove-Item exact directory | 1.116 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/charge-family-implementation-ee6387be-20261016 |
| `E:/Warhammer/qa-artifacts/core-b1-integration-source-sync-20261025` | Remove-Item exact directory | 1.264 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/core-b1-integration-source-sync-20261025 |
| `E:/Warhammer/qa-artifacts/core-b1-term-bindings-20261025` | Remove-Item exact directory | 844.059 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/core-b1-term-bindings-20261025 |
| `E:/Warhammer/qa-artifacts/core-b2-b3-20261025` | Remove-Item exact directory | 16.817 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/core-b2-b3-20261025 |
| `E:/Warhammer/qa-artifacts/core-b2-b3-concept-fallback-20261026` | Remove-Item exact directory | 2.320 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/core-b2-b3-concept-fallback-20261026 |
| `E:/Warhammer/qa-artifacts/core-b2-b3-integration-20261026` | Remove-Item exact directory | 1.327 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/core-b2-b3-integration-20261026 |
| `E:/Warhammer/qa-artifacts/core-b2-b3-resume-20261025` | Remove-Item exact directory | 1.628 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/core-b2-b3-resume-20261025 |
| `E:/Warhammer/qa-artifacts/core-preintegration-audit.mjs` | Remove-Item exact file | 8.830 KiB | Non-text old QA remainder; owner authorized retirement proposal. |
| `E:/Warhammer/qa-artifacts/core-preintegration-cc84bfe2` | Remove-Item exact directory | 27.056 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/core-preintegration-cc84bfe2 |
| `E:/Warhammer/qa-artifacts/core-preintegration-targets.mjs` | Remove-Item exact file | 4.355 KiB | Non-text old QA remainder; owner authorized retirement proposal. |
| `E:/Warhammer/qa-artifacts/csm-blank-inventory-fix-20261014` | Remove-Item exact directory | 4.963 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/csm-blank-inventory-fix-20261014 |
| `E:/Warhammer/qa-artifacts/csm-independent-content-078de95d` | Remove-Item exact directory | 68.067 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/csm-independent-content-078de95d |
| `E:/Warhammer/qa-artifacts/csm-personal-guide-14916f21` | Remove-Item exact directory | 19.335 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/csm-personal-guide-14916f21 |
| `E:/Warhammer/qa-artifacts/csm-player-scenario-20261014-34263d24-8422-4621-9e02-ddd8412c4e37` | Remove-Item exact directory | 3.975 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/csm-player-scenario-20261014-34263d24-8422-4621-9e02-ddd8412c4e37 |
| `E:/Warhammer/qa-artifacts/csm-source-first-e77ea12d` | Remove-Item exact directory | 5.220 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/csm-source-first-e77ea12d |
| `E:/Warhammer/qa-artifacts/csm-v13-implementation` | Remove-Item exact directory | 137.016 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/csm-v13-implementation |
| `E:/Warhammer/qa-artifacts/csm-wargear-contracts-20261017` | Remove-Item exact directory | 98.745 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/csm-wargear-contracts-20261017 |
| `E:/Warhammer/qa-artifacts/csm-wargear-integration-ca8567a1-20261017` | Remove-Item exact directory | 2.292 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/csm-wargear-integration-ca8567a1-20261017 |
| `E:/Warhammer/qa-artifacts/datasheet-certification-98fc94a5` | Remove-Item exact directory | 95.163 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/datasheet-certification-98fc94a5 |
| `E:/Warhammer/qa-artifacts/datasheet-parity-51088e8e` | Remove-Item exact directory | 63.720 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/datasheet-parity-51088e8e |
| `E:/Warhammer/qa-artifacts/datasheet-recertification-855d641b` | Remove-Item exact directory | 100.506 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/datasheet-recertification-855d641b |
| `E:/Warhammer/qa-artifacts/death-guard-v2-deep-audit` | Remove-Item exact directory | 123.126 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/death-guard-v2-deep-audit |
| `E:/Warhammer/qa-artifacts/death-guard-v2-stage1-targeted-fix-df80f6a3-20261017` | Remove-Item exact directory | 35.614 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/death-guard-v2-stage1-targeted-fix-df80f6a3-20261017 |
| `E:/Warhammer/qa-artifacts/dg-caption-blockers-b31acbe7-8506e545-e88f-4edb-93c5-050bc8f1142b` | Remove-Item exact directory | 825.769 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/dg-caption-blockers-b31acbe7-8506e545-e88f-4edb-93c5-050bc8f1142b |
| `E:/Warhammer/qa-artifacts/dg-content-03-06-9c41816e-eff883b1-2f6e-49b8-8b1d-70226c346952` | Remove-Item exact directory | 44.899 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/dg-content-03-06-9c41816e-eff883b1-2f6e-49b8-8b1d-70226c346952 |
| `E:/Warhammer/qa-artifacts/dg-content-04-70ccef5c-d9176fb8-9f3a-4baa-8ecf-c86f8e8037bb` | Remove-Item exact directory | 3.127 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/dg-content-04-70ccef5c-d9176fb8-9f3a-4baa-8ecf-c86f8e8037bb |
| `E:/Warhammer/qa-artifacts/dg-content-05-bdd33731-964bf822-3476-4efe-850e-1bdab7aadf51` | Remove-Item exact directory | 18.689 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/dg-content-05-bdd33731-964bf822-3476-4efe-850e-1bdab7aadf51 |
| `E:/Warhammer/qa-artifacts/dg-content-05-official-6dfd3360-6dee-4a77-af71-9071ddf875c8` | Remove-Item exact directory | 76.059 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/dg-content-05-official-6dfd3360-6dee-4a77-af71-9071ddf875c8 |
| `E:/Warhammer/qa-artifacts/dg-content-final-9c41816e-20261013` | Remove-Item exact directory | 13.962 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/dg-content-final-9c41816e-20261013 |
| `E:/Warhammer/qa-artifacts/dg-content03-closure-9c41816e-efe1bc3d-34f9-425c-b593-38075452ab47` | Remove-Item exact directory | 2.579 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/dg-content03-closure-9c41816e-efe1bc3d-34f9-425c-b593-38075452ab47 |
| `E:/Warhammer/qa-artifacts/dg-content0306-official-review-20261013` | Remove-Item exact directory | 3.522 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/dg-content0306-official-review-20261013 |
| `E:/Warhammer/qa-artifacts/dg-errata-title-fix-70ccef5c-5513bb9f-e1fa-4ba9-a43f-f6a821138f6b` | Remove-Item exact directory | 585.730 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/dg-errata-title-fix-70ccef5c-5513bb9f-e1fa-4ba9-a43f-f6a821138f6b |
| `E:/Warhammer/qa-artifacts/dg-fixed-oracle-build.cjs` | Remove-Item exact file | 9.718 KiB | Non-text old QA remainder; owner authorized retirement proposal. |
| `E:/Warhammer/qa-artifacts/dg-icon-bearer-fix-82c5ad7b-20261017` | Remove-Item exact directory | 1.574 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/dg-icon-bearer-fix-82c5ad7b-20261017 |
| `E:/Warhammer/qa-artifacts/dg-navigation-acceptance-76a48286-20261013` | Remove-Item exact directory | 1.759 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/dg-navigation-acceptance-76a48286-20261013 |
| `E:/Warhammer/qa-artifacts/dg-navigation-forensic-76a48286-20261013-1791884146259` | Remove-Item exact directory | 1.727 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/dg-navigation-forensic-76a48286-20261013-1791884146259 |
| `E:/Warhammer/qa-artifacts/dg-player-scenario-20261014-14f4ceb8-88a2-4ff6-80ba-bf5eb82ef66c` | Remove-Item exact directory | 3.698 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/dg-player-scenario-20261014-14f4ceb8-88a2-4ff6-80ba-bf5eb82ef66c |
| `E:/Warhammer/qa-artifacts/dg-source-enrollment-20261028` | Remove-Item exact directory | 1.512 GiB | E:/Warhammer/archive-reports/qa/qa-artifacts/dg-source-enrollment-20261028 |
| `E:/Warhammer/qa-artifacts/dg-two-failures-history-8eb9b843-181a-4fd0-be73-8a9b5f0c7c44` | Remove-Item exact directory | 1.440 GiB | E:/Warhammer/archive-reports/qa/qa-artifacts/dg-two-failures-history-8eb9b843-181a-4fd0-be73-8a9b5f0c7c44 |
| `E:/Warhammer/qa-artifacts/dg-upgrade-label-fix-bdd33731-90d9ee74-f0fe-454d-a0b5-5f0578df4f54` | Remove-Item exact directory | 3.883 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/dg-upgrade-label-fix-bdd33731-90d9ee74-f0fe-454d-a0b5-5f0578df4f54 |
| `E:/Warhammer/qa-artifacts/ec-foundation-20673f6d-20261014` | Remove-Item exact directory | 12.784 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/ec-foundation-20673f6d-20261014 |
| `E:/Warhammer/qa-artifacts/ec-four-books-live-47495cc5-20261015` | Remove-Item exact directory | 4.079 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/ec-four-books-live-47495cc5-20261015 |
| `E:/Warhammer/qa-artifacts/ec-master-pageant-273b8bd3-20261015` | Remove-Item exact directory | 4.951 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/ec-master-pageant-273b8bd3-20261015 |
| `E:/Warhammer/qa-artifacts/ec-native-fnp-a56909db-20261015` | Remove-Item exact directory | 3.724 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/ec-native-fnp-a56909db-20261015 |
| `E:/Warhammer/qa-artifacts/ec-two-defects-forensic-a56909db-20261015` | Remove-Item exact directory | 8.429 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/ec-two-defects-forensic-a56909db-20261015 |
| `E:/Warhammer/qa-artifacts/ec-user-stress-a56909db-20261015` | Remove-Item exact directory | 371.581 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/ec-user-stress-a56909db-20261015 |
| `E:/Warhammer/qa-artifacts/ec-v2-app-browser` | Remove-Item exact directory | 3.586 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/ec-v2-app-browser |
| `E:/Warhammer/qa-artifacts/ec-v2-unified-browser` | Remove-Item exact directory | 2.409 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/ec-v2-unified-browser |
| `E:/Warhammer/qa-artifacts/ec-wargear-integration-b1d69da4-20261017` | Remove-Item exact directory | 4.395 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/ec-wargear-integration-b1d69da4-20261017 |
| `E:/Warhammer/qa-artifacts/effective-datasheet-presentation-d087` | Remove-Item exact directory | 10.398 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/effective-datasheet-presentation-d087 |
| `E:/Warhammer/qa-artifacts/effective-profile-annotations-0b55381c` | Remove-Item exact directory | 11.054 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/effective-profile-annotations-0b55381c |
| `E:/Warhammer/qa-artifacts/effective-profile-annotations-browser.log` | Remove-Item exact file | 27.743 KiB | Non-text old QA remainder; owner authorized retirement proposal. |
| `E:/Warhammer/qa-artifacts/effective-profile-annotations-integration.log` | Remove-Item exact file | 3.732 KiB | Non-text old QA remainder; owner authorized retirement proposal. |
| `E:/Warhammer/qa-artifacts/exact-user-roster-preview` | Remove-Item exact directory | 1.961 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/exact-user-roster-preview |
| `E:/Warhammer/qa-artifacts/f1-detachment-recipients-20261028` | Remove-Item exact directory | 2.621 GiB | E:/Warhammer/archive-reports/qa/qa-artifacts/f1-detachment-recipients-20261028 |
| `E:/Warhammer/qa-artifacts/f1-detachment-recipients-authorized-20261028` | Remove-Item exact directory | 3.035 GiB | E:/Warhammer/archive-reports/qa/qa-artifacts/f1-detachment-recipients-authorized-20261028 |
| `E:/Warhammer/qa-artifacts/f1-detachment-recipients-final-20261028` | Remove-Item exact directory | 777.044 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/f1-detachment-recipients-final-20261028 |
| `E:/Warhammer/qa-artifacts/f1-detachment-recipients-resume-20261028` | Remove-Item exact directory | 1.845 GiB | E:/Warhammer/archive-reports/qa/qa-artifacts/f1-detachment-recipients-resume-20261028 |
| `E:/Warhammer/qa-artifacts/f1-detachment-recipients-tables-20261028` | Remove-Item exact directory | 4.575 GiB | E:/Warhammer/archive-reports/qa/qa-artifacts/f1-detachment-recipients-tables-20261028 |
| `E:/Warhammer/qa-artifacts/f1-diagnosis-before-edit.log` | Remove-Item exact file | 10.997 KiB | Non-text old QA remainder; owner authorized retirement proposal. |
| `E:/Warhammer/qa-artifacts/f1-qa-wiring-20261028` | Remove-Item exact directory | 3.741 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/f1-qa-wiring-20261028 |
| `E:/Warhammer/qa-artifacts/f1-table-schema.jsonl` | Remove-Item exact file | 24.472 KiB | Non-text old QA remainder; owner authorized retirement proposal. |
| `E:/Warhammer/qa-artifacts/five-books-effect-root-causes-ee6387be-20261016` | Remove-Item exact directory | 950.242 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/five-books-effect-root-causes-ee6387be-20261016 |
| `E:/Warhammer/qa-artifacts/five-books-physical-wargear-investigation-20261017` | Remove-Item exact directory | 4.971 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/five-books-physical-wargear-investigation-20261017 |
| `E:/Warhammer/qa-artifacts/five-books-roster-effect-coverage-ee6387be-20261015` | Remove-Item exact directory | 34.561 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/five-books-roster-effect-coverage-ee6387be-20261015 |
| `E:/Warhammer/qa-artifacts/formed-units-9a952c7c` | Remove-Item exact directory | 22.067 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/formed-units-9a952c7c |
| `E:/Warhammer/qa-artifacts/glossary-dependencies-bfd04cae-b070687c-0a02-44b8-afcd-be37dc18bb6a` | Remove-Item exact directory | 490.420 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/glossary-dependencies-bfd04cae-b070687c-0a02-44b8-afcd-be37dc18bb6a |
| `E:/Warhammer/qa-artifacts/glossary-dependencies-bfd04cae-home-96ae611d-79b8-47f2-90c4-4022b3cc1829` | Remove-Item exact directory | 7.055 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/glossary-dependencies-bfd04cae-home-96ae611d-79b8-47f2-90c4-4022b3cc1829 |
| `E:/Warhammer/qa-artifacts/glossary-display-review.log` | Remove-Item exact file | 1.938 KiB | Non-text old QA remainder; owner authorized retirement proposal. |
| `E:/Warhammer/qa-artifacts/glossary-forensic-bfd04cae-96819709-f747-41b7-82b6-7228fb409f68` | Remove-Item exact directory | 0 B | E:/Warhammer/archive-reports/qa/qa-artifacts/glossary-forensic-bfd04cae-96819709-f747-41b7-82b6-7228fb409f68 |
| `E:/Warhammer/qa-artifacts/glossary-owner-parity.log` | Remove-Item exact file | 244 B | Non-text old QA remainder; owner authorized retirement proposal. |
| `E:/Warhammer/qa-artifacts/glossary-release-76022d87-20261014` | Remove-Item exact directory | 6.556 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/glossary-release-76022d87-20261014 |
| `E:/Warhammer/qa-artifacts/glossary-single-owner-4a8b9a29-20261014` | Remove-Item exact directory | 512.274 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/glossary-single-owner-4a8b9a29-20261014 |
| `E:/Warhammer/qa-artifacts/glossary-v1-v2-forensic-98fc94a5` | Remove-Item exact directory | 11.260 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/glossary-v1-v2-forensic-98fc94a5 |
| `E:/Warhammer/qa-artifacts/gw-freshness-2026-10-14` | Remove-Item exact directory | 88.751 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/gw-freshness-2026-10-14 |
| `E:/Warhammer/qa-artifacts/home-core-glossary-smoke-20261014-8b2d75e0-3c99-4f13-96f5-5184a1f1d269` | Remove-Item exact directory | 1.898 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/home-core-glossary-smoke-20261014-8b2d75e0-3c99-4f13-96f5-5184a1f1d269 |
| `E:/Warhammer/qa-artifacts/legacy-pending-patches` | Remove-Item exact directory | 123.874 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/legacy-pending-patches |
| `E:/Warhammer/qa-artifacts/live-v2-release-20261014-27e692ae` | Remove-Item exact directory | 50.526 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/live-v2-release-20261014-27e692ae |
| `E:/Warhammer/qa-artifacts/manual-release-plan-98fc94a5-20261009` | Remove-Item exact directory | 119.628 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/manual-release-plan-98fc94a5-20261009 |
| `E:/Warhammer/qa-artifacts/mega-glossary-v2` | Remove-Item exact directory | 1.514 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/mega-glossary-v2 |
| `E:/Warhammer/qa-artifacts/mfm-v16-integration-2026-10-14` | Remove-Item exact directory | 6.259 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/mfm-v16-integration-2026-10-14 |
| `E:/Warhammer/qa-artifacts/minimal-pwa-core-glossary-20261026` | Remove-Item exact directory | 7.199 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/minimal-pwa-core-glossary-20261026 |
| `E:/Warhammer/qa-artifacts/minimal-pwa-css-20261027` | Remove-Item exact directory | 18.171 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/minimal-pwa-css-20261027 |
| `E:/Warhammer/qa-artifacts/minimal-pwa-fix-20261026` | Remove-Item exact directory | 4.174 GiB | E:/Warhammer/archive-reports/qa/qa-artifacts/minimal-pwa-fix-20261026 |
| `E:/Warhammer/qa-artifacts/minimal-pwa-recovery-integration-20261027` | Remove-Item exact directory | 1.060 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/minimal-pwa-recovery-integration-20261027 |
| `E:/Warhammer/qa-artifacts/normal-datasheet-parity-51088e8e` | Remove-Item exact directory | 16.162 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/normal-datasheet-parity-51088e8e |
| `E:/Warhammer/qa-artifacts/patch-release-4a8b9a29-20261014` | Remove-Item exact directory | 144.268 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/patch-release-4a8b9a29-20261014 |
| `E:/Warhammer/qa-artifacts/personal-datasheet-parity-43bd6aaf` | Remove-Item exact directory | 63.761 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/personal-datasheet-parity-43bd6aaf |
| `E:/Warhammer/qa-artifacts/phase2b-shell-final` | Remove-Item exact directory | 4.274 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/phase2b-shell-final |
| `E:/Warhammer/qa-artifacts/pwa-historical-failure-20261027` | Remove-Item exact directory | 17.955 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/pwa-historical-failure-20261027 |
| `E:/Warhammer/qa-artifacts/recovery-admech-five-qa-fixes-20261018` | Remove-Item exact directory | 117.394 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-admech-five-qa-fixes-20261018 |
| `E:/Warhammer/qa-artifacts/recovery-admech-megaroster-20261018` | Remove-Item exact directory | 3.387 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-admech-megaroster-20261018 |
| `E:/Warhammer/qa-artifacts/recovery-admech-omega-acceptance-20261018` | Remove-Item exact directory | 567.246 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-admech-omega-acceptance-20261018 |
| `E:/Warhammer/qa-artifacts/recovery-admech-omega-caption-fix-20261018` | Remove-Item exact directory | 5.534 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-admech-omega-caption-fix-20261018 |
| `E:/Warhammer/qa-artifacts/recovery-admech-omega-proposal-20261018` | Remove-Item exact directory | 7.427 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-admech-omega-proposal-20261018 |
| `E:/Warhammer/qa-artifacts/recovery-army-book-cover-restoration-20261020` | Remove-Item exact directory | 6.426 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-army-book-cover-restoration-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-omega-acceptance-20261023` | Remove-Item exact directory | 896.432 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-omega-acceptance-20261023 |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-omega-root-cause-fix-safety-20261023` | Remove-Item exact directory | 933.243 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-omega-root-cause-fix-safety-20261023 |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-real-newrecruit37-p2-validation-20261023` | Remove-Item exact directory | 1.001 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-real-newrecruit37-p2-validation-20261023 |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage1-discovery-20261022` | Remove-Item exact directory | 56.570 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage1-discovery-20261022 |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage2a-foundation-20261022` | Remove-Item exact directory | 1.053 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage2a-foundation-20261022 |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage2b-mfm-20261022` | Remove-Item exact directory | 23.187 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage2b-mfm-20261022 |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage2c-mixed-owner-20261022` | Remove-Item exact directory | 21.984 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage2c-mixed-owner-20261022 |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage3a-gameplay-20261022` | Remove-Item exact directory | 22.579 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage3a-gameplay-20261022 |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage3b-physical-import-20261022` | Remove-Item exact directory | 23.360 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage3b-physical-import-20261022 |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage3c-coverage-20261022` | Remove-Item exact directory | 12.462 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage3c-coverage-20261022 |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage4a-application-20261022` | Remove-Item exact directory | 128.360 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage4a-application-20261022 |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage4b-capabilities-20261022` | Remove-Item exact directory | 500.163 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage4b-capabilities-20261022 |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage4b1-independent-review-20261023` | Remove-Item exact directory | 304.277 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage4b1-independent-review-20261023 |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage4b2-integration-20261023` | Remove-Item exact directory | 151.118 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage4b2-integration-20261023 |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage52-safe-attribution-20261023` | Remove-Item exact directory | 509.420 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage52-safe-attribution-20261023 |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage53-attribution-integration-20261023` | Remove-Item exact directory | 272.111 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage53-attribution-integration-20261023 |
| `E:/Warhammer/qa-artifacts/recovery-ba-v2-stage54-points-p2-20261023` | Remove-Item exact directory | 305.553 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ba-v2-stage54-points-p2-20261023 |
| `E:/Warhammer/qa-artifacts/recovery-charge-frontend-review-20261018` | Remove-Item exact directory | 17.904 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-charge-frontend-review-20261018 |
| `E:/Warhammer/qa-artifacts/recovery-crlf-integrity-20261018` | Remove-Item exact directory | 900.375 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-crlf-integrity-20261018 |
| `E:/Warhammer/qa-artifacts/recovery-cross-book-root-fixes-20261018` | Remove-Item exact directory | 8.367 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-cross-book-root-fixes-20261018 |
| `E:/Warhammer/qa-artifacts/recovery-csm-dd-fix-4bef79a7-20261018` | Remove-Item exact directory | 106.186 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-csm-dd-fix-4bef79a7-20261018 |
| `E:/Warhammer/qa-artifacts/recovery-csm-megaroster-20261018` | Remove-Item exact directory | 5.321 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-csm-megaroster-20261018 |
| `E:/Warhammer/qa-artifacts/recovery-csm-omega-acceptance-4bef79a7-20261018` | Remove-Item exact directory | 80.327 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-csm-omega-acceptance-4bef79a7-20261018 |
| `E:/Warhammer/qa-artifacts/recovery-csm-omega-proposal-4bef79a7-20261018` | Remove-Item exact directory | 271.163 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-csm-omega-proposal-4bef79a7-20261018 |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-omega-acceptance-20261021` | Remove-Item exact directory | 610.275 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-omega-acceptance-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-root-cause-20261021` | Remove-Item exact directory | 6.936 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-root-cause-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage1-discovery-20261021` | Remove-Item exact directory | 63.164 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage1-discovery-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage2a-foundation-20261021` | Remove-Item exact directory | 41.303 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage2a-foundation-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage2b-mfm-20261021` | Remove-Item exact directory | 6.528 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage2b-mfm-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage2c-mixed-owner-20261021` | Remove-Item exact directory | 129.239 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage2c-mixed-owner-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage3a-mechanics-20261021` | Remove-Item exact directory | 630.211 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage3a-mechanics-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage3b-chapter-context-20261021` | Remove-Item exact directory | 679.903 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage3b-chapter-context-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage3b1-applicability-20261021` | Remove-Item exact directory | 4.028 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage3b1-applicability-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage3c-physical-import-20261021` | Remove-Item exact directory | 7.991 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage3c-physical-import-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage3d-static-gameplay-20261021` | Remove-Item exact directory | 2.088 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage3d-static-gameplay-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage4a-application-20261021` | Remove-Item exact directory | 114.563 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage4a-application-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage4b-coverage-20261021` | Remove-Item exact directory | 10.837 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage4b-coverage-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage4c-capabilities-20261021` | Remove-Item exact directory | 143.193 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage4c-capabilities-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage4c-final-review-20261021` | Remove-Item exact directory | 46.535 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage4c-final-review-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage4c-integration-20261021` | Remove-Item exact directory | 46.407 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage4c-integration-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage4c-shared-capabilities-20261021` | Remove-Item exact directory | 16.820 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage4c-shared-capabilities-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage51-fixes-20261021` | Remove-Item exact directory | 145.022 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage51-fixes-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage52-integration-20261021` | Remove-Item exact directory | 65.455 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage52-integration-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage53-omega-closure-20261021` | Remove-Item exact directory | 70.762 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage53-omega-closure-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage6a-release-20261021` | Remove-Item exact directory | 111.987 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage6a-release-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage6a-resume-20261021` | Remove-Item exact directory | 350.501 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage6a-resume-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage6a1-enrollment-bytes-20261021` | Remove-Item exact directory | 1.544 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage6a1-enrollment-bytes-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-da-v2-stage6b-production-20261021` | Remove-Item exact directory | 627.215 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-da-v2-stage6b-production-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-dg-megaroster-20261018` | Remove-Item exact directory | 3.995 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-dg-megaroster-20261018 |
| `E:/Warhammer/qa-artifacts/recovery-dg-omega-final-d53656ad-20261018` | Remove-Item exact directory | 8.577 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-dg-omega-final-d53656ad-20261018 |
| `E:/Warhammer/qa-artifacts/recovery-dg-omega-fixed-roster-20261018` | Remove-Item exact directory | 8.536 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-dg-omega-fixed-roster-20261018 |
| `E:/Warhammer/qa-artifacts/recovery-dg-selective-transfer-20261017` | Remove-Item exact directory | 28.654 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-dg-selective-transfer-20261017 |
| `E:/Warhammer/qa-artifacts/recovery-ec-omega-acceptance-20261019` | Remove-Item exact directory | 167.733 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ec-omega-acceptance-20261019 |
| `E:/Warhammer/qa-artifacts/recovery-ec-omega-import-fix-20261019` | Remove-Item exact directory | 162.364 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ec-omega-import-fix-20261019 |
| `E:/Warhammer/qa-artifacts/recovery-ec-omega-proposal-20261019` | Remove-Item exact directory | 3.170 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-ec-omega-proposal-20261019 |
| `E:/Warhammer/qa-artifacts/recovery-equipment-identity-grouping-fix-20261020` | Remove-Item exact directory | 8.352 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-equipment-identity-grouping-fix-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-granted-ability-attribution-20261020` | Remove-Item exact directory | 16.667 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-granted-ability-attribution-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-preserve-reimport-attachments-20261020` | Remove-Item exact directory | 16.264 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-preserve-reimport-attachments-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-qa-census-eca6c72d-20261018` | Remove-Item exact directory | 216.170 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-qa-census-eca6c72d-20261018 |
| `E:/Warhammer/qa-artifacts/recovery-reimport-attachments-investigation-20261020` | Remove-Item exact directory | 22.388 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-reimport-attachments-investigation-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-shared-equipment-caption-fix-20261018` | Remove-Item exact directory | 298.433 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-shared-equipment-caption-fix-20261018 |
| `E:/Warhammer/qa-artifacts/recovery-sm-mfm-v16-enrollment-20261020` | Remove-Item exact directory | 1.356 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-mfm-v16-enrollment-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-sm-native-mfm-stage4a-20261020` | Remove-Item exact directory | 447.059 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-native-mfm-stage4a-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-sm-native-mfm-stage4a-20261020-mapping-review.py` | Remove-Item exact file | 9.218 KiB | Non-text old QA remainder; owner authorized retirement proposal. |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-omega-acceptance-20261020` | Remove-Item exact directory | 568.852 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-omega-acceptance-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage1-discovery-20261020` | Remove-Item exact directory | 59.563 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage1-discovery-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage1-independent-review-20261020` | Remove-Item exact directory | 1000.754 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage1-independent-review-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage2a-20261020` | Remove-Item exact directory | 72.630 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage2a-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage2b-20261020` | Remove-Item exact directory | 7.041 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage2b-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage2c-20261020` | Remove-Item exact directory | 22.430 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage2c-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage3a-20261020` | Remove-Item exact directory | 30.336 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage3a-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage3b-20261020` | Remove-Item exact directory | 24.737 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage3b-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage4a-20261020` | Remove-Item exact directory | 6.062 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage4a-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage4b-20261020` | Remove-Item exact directory | 100.277 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage4b-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage4b-20261020-gameplay-qa.tmp.json` | Remove-Item exact file | 25.062 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/_root-files/recovery-sm-v2-stage4b-20261020-gameplay-qa.tmp.json |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage4c-20261020` | Remove-Item exact directory | 133.981 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage4c-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage4d-20261020` | Remove-Item exact directory | 11.071 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage4d-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage5a-20261020` | Remove-Item exact directory | 328.480 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage5a-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage5c-20261020` | Remove-Item exact directory | 289.016 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage5c-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-sm-v2-stage5d-20261020` | Remove-Item exact directory | 4.473 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-sm-v2-stage5d-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-tau-omega-acceptance-20261019` | Remove-Item exact directory | 85.466 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-omega-acceptance-20261019 |
| `E:/Warhammer/qa-artifacts/recovery-tau-omega-evidence-closure-20261020` | Remove-Item exact directory | 58.116 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-omega-evidence-closure-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-tau-omega-final-reacceptance-20261020` | Remove-Item exact directory | 81.261 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-omega-final-reacceptance-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-tau-omega-final-reconciliation-20261020` | Remove-Item exact directory | 40.167 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-omega-final-reconciliation-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-tau-omega-proposal-20261019` | Remove-Item exact directory | 40.145 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-omega-proposal-20261019 |
| `E:/Warhammer/qa-artifacts/recovery-tau-omega-reviewed-addendum-20261020` | Remove-Item exact directory | 98.765 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-omega-reviewed-addendum-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-tau-student-source-scenario-review-20261020` | Remove-Item exact directory | 309.166 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-student-source-scenario-review-20261020 |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage1-20261019` | Remove-Item exact directory | 4.722 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-v2-stage1-20261019 |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage2-20261019` | Remove-Item exact directory | 1.904 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-v2-stage2-20261019 |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage3-20261019` | Remove-Item exact directory | 247.604 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-v2-stage3-20261019 |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4-20261019` | Remove-Item exact directory | 206.847 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-v2-stage4-20261019 |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4b-20261019` | Remove-Item exact directory | 254.637 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-v2-stage4b-20261019 |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4c-20261019` | Remove-Item exact directory | 357.618 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-v2-stage4c-20261019 |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4d-20261019` | Remove-Item exact directory | 393.752 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-v2-stage4d-20261019 |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4g-20261019` | Remove-Item exact directory | 181.951 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-v2-stage4g-20261019 |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4g-completion-20261019` | Remove-Item exact directory | 127.955 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-v2-stage4g-completion-20261019 |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4g-final-20261019` | Remove-Item exact directory | 1.565 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-v2-stage4g-final-20261019 |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage5-20261019` | Remove-Item exact directory | 92.813 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-v2-stage5-20261019 |
| `E:/Warhammer/qa-artifacts/recovery-tau-v2-stage6-20261019` | Remove-Item exact directory | 92.043 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tau-v2-stage6-20261019 |
| `E:/Warhammer/qa-artifacts/recovery-tyranids-omega-acceptance-20261019` | Remove-Item exact directory | 289.526 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tyranids-omega-acceptance-20261019 |
| `E:/Warhammer/qa-artifacts/recovery-tyranids-omega-proposal-20261019` | Remove-Item exact directory | 6.858 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tyranids-omega-proposal-20261019 |
| `E:/Warhammer/qa-artifacts/recovery-tyranids-trygon-selection-fix-20261019` | Remove-Item exact directory | 289.272 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tyranids-trygon-selection-fix-20261019 |
| `E:/Warhammer/qa-artifacts/recovery-tyranids-trygon-source-choice-fix-20261019` | Remove-Item exact directory | 6.616 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-tyranids-trygon-source-choice-fix-20261019 |
| `E:/Warhammer/qa-artifacts/recovery-unified-v2-stage6a-20261021` | Remove-Item exact directory | 489.455 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-unified-v2-stage6a-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-unified-v2-stage6b1-20261021` | Remove-Item exact directory | 69.396 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-unified-v2-stage6b1-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-unified-v2-stage6b2-20261021` | Remove-Item exact directory | 420.615 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-unified-v2-stage6b2-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-unified-v2-stage6c-20261021` | Remove-Item exact directory | 706.509 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-unified-v2-stage6c-20261021 |
| `E:/Warhammer/qa-artifacts/recovery-v2-15-rule-presentation-20261018` | Remove-Item exact directory | 10.343 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-15-rule-presentation-20261018 |
| `E:/Warhammer/qa-artifacts/recovery-v2-controlled-nr373-integration-20261024` | Remove-Item exact directory | 30.222 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-controlled-nr373-integration-20261024 |
| `E:/Warhammer/qa-artifacts/recovery-v2-controlled-stage57-integration-20261023` | Remove-Item exact directory | 26.116 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-controlled-stage57-integration-20261023 |
| `E:/Warhammer/qa-artifacts/recovery-v2-enhancement-text-fix-78522fcf-20261018` | Remove-Item exact directory | 32.277 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-enhancement-text-fix-78522fcf-20261018 |
| `E:/Warhammer/qa-artifacts/recovery-v2-four-original-nr373-validation-20261024` | Remove-Item exact directory | 1.658 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-four-original-nr373-validation-20261024 |
| `E:/Warhammer/qa-artifacts/recovery-v2-model-identity-safety-20261024` | Remove-Item exact directory | 65.526 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-model-identity-safety-20261024 |
| `E:/Warhammer/qa-artifacts/recovery-v2-model-membership-no-brackets-20261024` | Remove-Item exact directory | 30.121 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-model-membership-no-brackets-20261024 |
| `E:/Warhammer/qa-artifacts/recovery-v2-nine-book-release-20261024` | Remove-Item exact directory | 444.607 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-nine-book-release-20261024 |
| `E:/Warhammer/qa-artifacts/recovery-v2-real-newrecruit373-validation-20261023` | Remove-Item exact directory | 650.645 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-real-newrecruit373-validation-20261023 |
| `E:/Warhammer/qa-artifacts/recovery-v2-real-nr373-import-fix-20261023` | Remove-Item exact directory | 30.917 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-real-nr373-import-fix-20261023 |
| `E:/Warhammer/qa-artifacts/recovery-v2-sm-appqa-independent-review-20261023` | Remove-Item exact directory | 559.717 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-sm-appqa-independent-review-20261023 |
| `E:/Warhammer/qa-artifacts/recovery-v2-sm-deathwatch-qa-contract-20261023` | Remove-Item exact directory | 26.099 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-sm-deathwatch-qa-contract-20261023 |
| `E:/Warhammer/qa-artifacts/recovery-v2-sm-newrecruit373-original-validation-20261023` | Remove-Item exact directory | 57.205 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-sm-newrecruit373-original-validation-20261023 |
| `E:/Warhammer/qa-artifacts/recovery-v2-stage56-multi-detachment-20261023` | Remove-Item exact directory | 279.861 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-stage56-multi-detachment-20261023 |
| `E:/Warhammer/qa-artifacts/recovery-v2-stage57-stage56-p2-integration-20261023` | Remove-Item exact directory | 33.484 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-stage57-stage56-p2-integration-20261023 |
| `E:/Warhammer/qa-artifacts/recovery-v2-stage58-universal-knownness-20261023` | Remove-Item exact directory | 728.512 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-stage58-universal-knownness-20261023 |
| `E:/Warhammer/qa-artifacts/recovery-v2-stage59-universal-pricing-20261023` | Remove-Item exact directory | 124.725 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-stage59-universal-pricing-20261023 |
| `E:/Warhammer/qa-artifacts/recovery-v2-stage591-canonical-option-knownness-20261023` | Remove-Item exact directory | 65.166 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-stage591-canonical-option-knownness-20261023 |
| `E:/Warhammer/qa-artifacts/recovery-v2-universal-nr373-mfm-20261024` | Remove-Item exact directory | 35.764 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/recovery-v2-universal-nr373-mfm-20261024 |
| `E:/Warhammer/qa-artifacts/release-candidate-b1-b3-pwa-20261027` | Remove-Item exact directory | 6.262 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/release-candidate-b1-b3-pwa-20261027 |
| `E:/Warhammer/qa-artifacts/release-candidate-b1-b3-pwa-fresh-20261027` | Remove-Item exact directory | 2.075 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/release-candidate-b1-b3-pwa-fresh-20261027 |
| `E:/Warhammer/qa-artifacts/release-certification-98fc94a5-20261009` | Remove-Item exact directory | 202.606 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/release-certification-98fc94a5-20261009 |
| `E:/Warhammer/qa-artifacts/release-manifest-sw-investigation-20261026` | Remove-Item exact directory | 5.582 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/release-manifest-sw-investigation-20261026 |
| `E:/Warhammer/qa-artifacts/release-preview-98fc94a5` | Remove-Item exact directory | 52.859 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/release-preview-98fc94a5 |
| `E:/Warhammer/qa-artifacts/release-remainder-df80f6a3-20261017` | Remove-Item exact directory | 1.184 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/release-remainder-df80f6a3-20261017 |
| `E:/Warhammer/qa-artifacts/runtime-manifest-integration-20261026` | Remove-Item exact directory | 7.412 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/runtime-manifest-integration-20261026 |
| `E:/Warhammer/qa-artifacts/safe-pwa-updates-20261026` | Remove-Item exact directory | 291.512 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/safe-pwa-updates-20261026 |
| `E:/Warhammer/qa-artifacts/shell-allowlist-210a6aab-home-6880624e-7b49-4335-ab19-e457c693250e` | Remove-Item exact directory | 6.120 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/shell-allowlist-210a6aab-home-6880624e-7b49-4335-ab19-e457c693250e |
| `E:/Warhammer/qa-artifacts/sm-original373-readonly.mjs` | Remove-Item exact file | 2.602 KiB | Non-text old QA remainder; owner authorized retirement proposal. |
| `E:/Warhammer/qa-artifacts/source-completeness-gate-1af1d51f-20261017` | Remove-Item exact directory | 28.359 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/source-completeness-gate-1af1d51f-20261017 |
| `E:/Warhammer/qa-artifacts/source-completeness-gate-1af1d51f-20261017-mutations.log` | Remove-Item exact file | 12.229 KiB | Non-text old QA remainder; owner authorized retirement proposal. |
| `E:/Warhammer/qa-artifacts/source-runtime-manifest-fix-20261026` | Remove-Item exact directory | 7.431 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/source-runtime-manifest-fix-20261026 |
| `E:/Warhammer/qa-artifacts/stale-test-input-fix-ab41bb1f-20261017` | Remove-Item exact directory | 69.171 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/stale-test-input-fix-ab41bb1f-20261017 |
| `E:/Warhammer/qa-artifacts/tyranids-seven-effects-4edfabbd-20261016` | Remove-Item exact directory | 11.674 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/tyranids-seven-effects-4edfabbd-20261016 |
| `E:/Warhammer/qa-artifacts/tyranids-v2-isolated-browser` | Remove-Item exact directory | 9.322 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/tyranids-v2-isolated-browser |
| `E:/Warhammer/qa-artifacts/tyranids-v2-unified-browser` | Remove-Item exact directory | 8.819 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/tyranids-v2-unified-browser |
| `E:/Warhammer/qa-artifacts/tyranids-v2-user-stress-ee6387be-20261015` | Remove-Item exact directory | 54.281 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/tyranids-v2-user-stress-ee6387be-20261015 |
| `E:/Warhammer/qa-artifacts/unified-glossary-reference-98fc94a5` | Remove-Item exact directory | 8.252 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/unified-glossary-reference-98fc94a5 |
| `E:/Warhammer/qa-artifacts/unified-regression-f5d203d2-20261013-fa10caa3-1781-40e9-8c32-86d70a1c4b75` | Remove-Item exact directory | 7.628 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/unified-regression-f5d203d2-20261013-fa10caa3-1781-40e9-8c32-86d70a1c4b75 |
| `E:/Warhammer/qa-artifacts/unified-v2-cover-release-20261020` | Remove-Item exact directory | 12.825 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/unified-v2-cover-release-20261020 |
| `E:/Warhammer/qa-artifacts/unified-v2-five-books-release-df80f6a3-20261017` | Remove-Item exact directory | 27.344 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/unified-v2-five-books-release-df80f6a3-20261017 |
| `E:/Warhammer/qa-artifacts/unified-v2-image-audit-ca651a23-20261020` | Remove-Item exact directory | 520.863 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/unified-v2-image-audit-ca651a23-20261020 |
| `E:/Warhammer/qa-artifacts/unified-v2-live-playwright-df80f6a3-20261017` | Remove-Item exact directory | 14.298 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/unified-v2-live-playwright-df80f6a3-20261017 |
| `E:/Warhammer/qa-artifacts/unified-v2-pages-release-ca651a23-20261020` | Remove-Item exact directory | 23.761 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/unified-v2-pages-release-ca651a23-20261020 |
| `E:/Warhammer/qa-artifacts/unified-v2-recovery-20261017` | Remove-Item exact directory | 474.205 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/unified-v2-recovery-20261017 |
| `E:/Warhammer/qa-artifacts/unified-v2-release-preflight-20261020` | Remove-Item exact directory | 99.253 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/unified-v2-release-preflight-20261020 |
| `E:/Warhammer/qa-artifacts/unified-v2-release-preparation-3f362abb-20261020` | Remove-Item exact directory | 173.805 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/unified-v2-release-preparation-3f362abb-20261020 |
| `E:/Warhammer/qa-artifacts/unified-v2-safety-backup-20261017` | Remove-Item exact directory | 535.328 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/unified-v2-safety-backup-20261017 |
| `E:/Warhammer/qa-artifacts/unified-v2-technical-acceptance-ab41bb1f-20261017` | Remove-Item exact directory | 2.220 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/unified-v2-technical-acceptance-ab41bb1f-20261017 |
| `E:/Warhammer/qa-artifacts/v1-home-port` | Remove-Item exact directory | 7.799 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/v1-home-port |
| `E:/Warhammer/qa-artifacts/v1-leftovers-20261027` | Remove-Item exact directory | 1.512 GiB | E:/Warhammer/archive-reports/qa/qa-artifacts/v1-leftovers-20261027 |
| `E:/Warhammer/qa-artifacts/v1-tests-pdf-cleanup-20261027` | Remove-Item exact directory | 6.804 GiB | E:/Warhammer/archive-reports/qa/qa-artifacts/v1-tests-pdf-cleanup-20261027 |
| `E:/Warhammer/qa-artifacts/v1-v2-home-audit-b7db5f31` | Remove-Item exact directory | 3.971 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/v1-v2-home-audit-b7db5f31 |
| `E:/Warhammer/qa-artifacts/v2-home-forensic-f4854559-1791893512065` | Remove-Item exact directory | 0 B | E:/Warhammer/archive-reports/qa/qa-artifacts/v2-home-forensic-f4854559-1791893512065 |
| `E:/Warhammer/qa-artifacts/v2-home-forensic-f4854559-1791893580312` | Remove-Item exact directory | 2.085 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/v2-home-forensic-f4854559-1791893580312 |
| `E:/Warhammer/qa-artifacts/v2-home-qa-f4854559-acceptance` | Remove-Item exact directory | 6.611 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/v2-home-qa-f4854559-acceptance |
| `E:/Warhammer/qa-artifacts/v2-home-qa-f4854559-acceptance-final` | Remove-Item exact directory | 7.055 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/v2-home-qa-f4854559-acceptance-final |
| `E:/Warhammer/qa-artifacts/v2-only-baseline-adjudication-20261027` | Remove-Item exact directory | 27.839 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/v2-only-baseline-adjudication-20261027 |
| `E:/Warhammer/qa-artifacts/v2-only-baseline-resume-rc-20261027` | Remove-Item exact directory | 10.029 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/v2-only-baseline-resume-rc-20261027 |
| `E:/Warhammer/qa-artifacts/v2-only-core-glossary-qa-20261027` | Remove-Item exact directory | 37.942 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/v2-only-core-glossary-qa-20261027 |
| `E:/Warhammer/qa-artifacts/v2-only-eol-integration-candidate-20261027` | Remove-Item exact directory | 4.921 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/v2-only-eol-integration-candidate-20261027 |
| `E:/Warhammer/qa-artifacts/v2-only-integration-release-candidate-20261027` | Remove-Item exact directory | 5.092 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/v2-only-integration-release-candidate-20261027 |
| `E:/Warhammer/qa-artifacts/v2-only-production-20261027` | Remove-Item exact directory | 482.465 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/v2-only-production-20261027 |
| `E:/Warhammer/qa-artifacts/v2-only-remove-legacy-20261027` | Remove-Item exact directory | 30.775 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/v2-only-remove-legacy-20261027 |
| `E:/Warhammer/qa-artifacts/wargear-compatibility-a316ff0c-20261017` | Remove-Item exact directory | 45.658 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/wargear-compatibility-a316ff0c-20261017 |
| `E:/Warhammer/qa-artifacts/wargear-contract-pilot-20261017` | Remove-Item exact directory | 2.719 MiB | E:/Warhammer/archive-reports/qa/qa-artifacts/wargear-contract-pilot-20261017 |
| `E:/Warhammer/qa-artifacts/wargear-schema-capabilities-20261017` | Remove-Item exact directory | 64.101 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/wargear-schema-capabilities-20261017 |
| `E:/Warhammer/qa-artifacts/wargear-schema-regression-preqa.json` | Remove-Item exact file | 12.415 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/_root-files/wargear-schema-regression-preqa.json |
| `E:/Warhammer/qa-artifacts/wargear-technical-review-b1d69da4-20261017` | Remove-Item exact directory | 24.135 KiB | E:/Warhammer/archive-reports/qa/qa-artifacts/wargear-technical-review-b1d69da4-20261017 |
| `E:/Warhammer/qa-evidence/dg-am-rule-recipients` | Remove-Item exact directory | 47.839 MiB | E:/Warhammer/archive-reports/qa/qa-evidence/dg-am-rule-recipients |
| `E:/Warhammer/qa-evidence/o1-core-diagnosis-20261031` | Remove-Item exact directory | 7.354 KiB | E:/Warhammer/archive-reports/qa/qa-evidence/o1-core-diagnosis-20261031 |
| `E:/Warhammer/qa-evidence/o1-pre-ff-reviewed-0ba0426b` | Remove-Item exact directory | 845.390 MiB | E:/Warhammer/archive-reports/qa/qa-evidence/o1-pre-ff-reviewed-0ba0426b |
| `E:/Warhammer/qa-evidence/o1-recipient-rule-text` | Remove-Item exact directory | 57.223 MiB | E:/Warhammer/archive-reports/qa/qa-evidence/o1-recipient-rule-text |
| `E:/Warhammer/qa-evidence/show-1-card-labels` | Remove-Item exact directory | 912.779 MiB | E:/Warhammer/archive-reports/qa/qa-evidence/show-1-card-labels |
| `E:/Warhammer/qa-evidence/show-2-card-display` | Remove-Item exact directory | 991.431 MiB | E:/Warhammer/archive-reports/qa/qa-evidence/show-2-card-display |
| `E:/Warhammer/qa-evidence/test-speedup-20261030` | Remove-Item exact directory | 4.753 GiB | E:/Warhammer/archive-reports/qa/qa-evidence/test-speedup-20261030 |
| `E:/Warhammer/qa-evidence/test-temp-cleanup-tau` | Remove-Item exact directory | 144.625 MiB | E:/Warhammer/archive-reports/qa/qa-evidence/test-temp-cleanup-tau |
| `E:/Warhammer/qa-evidence/translate-3-final-jbowQJ` | Remove-Item exact directory | 1.009 GiB | E:/Warhammer/archive-reports/qa/qa-evidence/translate-3-final-jbowQJ |
| `E:/Warhammer/qa-evidence/translate-3-sources-v2-EnpOFC` | Remove-Item exact directory | 773.526 MiB | E:/Warhammer/archive-reports/qa/qa-evidence/translate-3-sources-v2-EnpOFC |
| `E:/Warhammer/qa-tmp/core-rules-refresh-v1-baseline-949d98f` | Remove-Item exact directory | 1.518 GiB | E:/Warhammer/archive-reports/git/core-rules-refresh-v1-baseline-949d98f--15a3eb8c |
| `E:/Warhammer/qa-tmp/core-rules-refresh-v1-registry-u6-baseline` | Remove-Item exact directory | 1.518 GiB | E:/Warhammer/archive-reports/git/core-rules-refresh-v1-registry-u6-baseline--d847fd4b |
| `E:/Warhammer/qa-tmp/core-rules-refresh-v1-registry-u6-recovery` | Remove-Item exact directory | 1.525 GiB | E:/Warhammer/archive-reports/git/core-rules-refresh-v1-registry-u6-recovery--e3cb7225 |
| `E:/Warhammer/qa-tmp/core-rules-refresh-v1-source-catalog-baseline-write` | Remove-Item exact directory | 1.518 GiB | E:/Warhammer/archive-reports/git/core-rules-refresh-v1-source-catalog-baseline-write--be4fca97 |
| `E:/Warhammer/warhammer-ec-eager/node_modules` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/warhammer-ec-eager/tmp` | Remove-Item link only; NO Recurse | 0 B | Link metadata in pinned cleanup manifest; target is preserved. |
| `E:/Warhammer/worktrees/am-dg-recipient-gaps-v1` | git worktree remove --force | 1.132 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/card-polish-2-v1` | git worktree remove --force | 1.163 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/cards-cosmetics-v1` | git worktree remove --force | 1.144 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/compatible-related-panel-v1` | git worktree remove --force | 1.149 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/core-importer-a-v1` | git worktree remove --force | 1.154 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/csm-tau-recipient-gaps-v1` | git worktree remove --force | 1.132 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/csm-tau-tyranids-ec-rule-recipients` | git worktree remove --force | 1.133 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/glossary-builder` | git worktree remove --force | 1.132 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/keywords-access-v1` | git worktree remove --force | 1.163 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/new-recruit-export-import-v1` | git worktree remove --force | 1.134 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/new-recruit-model-names-v1` | git worktree remove --force | 1.134 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/new-recruit-plain-header-v1` | git worktree remove --force | 1.134 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/norma-1` | git worktree remove --force | 1.130 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/o1-recipient-rule-text` | git worktree remove --force | 1.130 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/o3-detachment-card-text-v1` | git worktree remove --force | 1.150 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/show-1-card-labels` | git worktree remove --force | 1.130 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/show-2-card-display` | git worktree remove --force | 1.130 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/sm-ba-da-rule-recipients` | git worktree remove --force | 1.132 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/sm-da-recipient-gaps-v1` | git worktree remove --force | 1.133 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/source-catalog-registry-v1` | git worktree remove --force | 1.144 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/sw-update-v1` | git worktree remove --force | 1.163 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/sweep-polish-v1` | git worktree remove --force | 1.163 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/test-hygiene-1` | git worktree remove --force | 1.132 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/test-hygiene-2` | git worktree remove --force | 1.132 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/test-hygiene-min-v1` | git worktree remove --force | 1.162 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/test-temp-cleanup-tau` | git worktree remove --force | 1.130 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/tyranids-ec-rule-coverage-v1` | git worktree remove --force | 1.137 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/worktrees/v1-cleanup-v1` | git worktree remove --force | 1.144 GiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/warhammer-ec-eager` | git worktree remove --force | 531.129 MiB | Clean; shared Git owner/remote refs retained. |
| `E:/Warhammer/warhammer-w2-16-root-overflow` | git worktree remove --force | 547.802 MiB | Clean; shared Git owner/remote refs retained. |

## 5. Delivery status

Only docs/reviews/disk-e-audit-2026-11-16.md and docs/reviews/disk-cleanup-apply-2.ps1 are committed to codex/disk-e-audit-evidence. Source remains 9a48765744f32f467f6e53c1f85e94921cbdd54b; main/release/Pages are untouched. No cleanup execution is part of the commit/push.

Local preparation evidence: E:/Warhammer/qa-evidence/disk-e-audit-2026-11-16/ARCHIVE_PREP/git-archives.json, qa-archive.json, manifest-summary.json, manifest.sha256, apply-2.sha256 and preparation scripts. Private format-patch/raw headers and copied source files are not published. The previous inventory remains in c9f8fa26; this report records the current archive-backed proposal.
