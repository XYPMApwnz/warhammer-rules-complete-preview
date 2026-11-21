# Release candidate v3 — review only

Status: **READY_FOR_CANDIDATE_REVIEW — NOT RELEASED**. Candidate e3db1b345eca989436eea7af758900eee7795203 is published only in [codex/release-candidate-e3db1b34](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/tree/codex/release-candidate-e3db1b34). Source FF for documentation stage 1 was separately authorized by the owner after Claude PASS. No release FF, workflow dispatch or Pages setting change was performed.

## Exact commits and tree

| Item | Value |
| --- | --- |
| Stage 1 / current source | 6f2e5fb23643fc0041efcd7006f3e150bd5ce4be |
| Candidate | e3db1b345eca989436eea7af758900eee7795203 |
| Candidate and source tree | 74a8064e67dafa06b20120ef5563da176db6d793 |
| Candidate's only parent / unchanged release | 1fd0b279051d76f1a262f7c8f117e35551b7de39 |
| Review branch | codex/release-candidate-e3db1b34 |
| Previous release tree for rollback | fb96adf457eef15e25030562261cae193db29f9c |

A detached clean source checkout was created before commit-tree; a separate detached clean candidate checkout supplied the package. git diff source..candidate is empty and both working trees remained clean. Candidate creation used exactly: `git commit-tree 74a8064e67dafa06b20120ef5563da176db6d793 -p 1fd0b279051d76f1a262f7c8f117e35551b7de39 -m "Release candidate: Unified V2 from reviewed source 6f2e5fb23643fc0041efcd7006f3e150bd5ce4be"`. The review branch did not exist before push; only that new ref was pushed for the candidate. See [CANDIDATE.json](CANDIDATE.json) and [PROTECTED_REFS.json](PROTECTED_REFS.json).

Stage 1 changed only AGENTS.md, README.md, docs/codex/WORKFLOW.md and tools/PAGES_RUNTIME_RELEASE.md: [diff stat](STAGE1_DIFF_STAT.txt). qa:workflow passed with 44 AGENTS lines; quick passed 71/71 in 6.27 minutes ([STAGE1_QUICK.json](STAGE1_QUICK.json)).

## Clean candidate package

| Measure | Result |
| --- | ---: |
| Runtime inventory files | 456 |
| Physical files including manifest | 457 |
| Runtime body bytes | 282837773 |
| Manifest bytes | 144511 |
| Total published bytes | 282982284 |
| Aggregate SHA-256: manifest contentSha256 | 0fab482c0fa7f4132c9bbb60646e880afca25f2b5823ab7fc1bd62322e67b909 |
| SHA-256 of PAGES_RUNTIME_MANIFEST.json itself | 615a0834ea9032a19ae163acc4dd4454dc847fb574110849a0eb5a6ec4f1805c |
| Cache revision | d08e23b961b6f507 |
| Mandatory precache URLs / URL-body bytes | 221 / 5139186 |
| Mandatory precache gzip bytes, level 9 | 2153544 |
| Unique precache bodies / bytes | 219 / 5113769 |

Normal build, --check and all 14 pages-runtime-package-qa checks passed, including independent deterministic rebuild, source closure, CRLF/LF allowlist equality, rejection of unlisted/unsafe files, unreviewed RAW and QA publication, preserved declared public source downloads, and corruption controls. No source/data producer was edited or run to alter accepted facts. [PACKAGE_QA.json](PACKAGE_QA.json), [PACKAGE_METRICS.json](PACKAGE_METRICS.json), [PAGES_RUNTIME_MANIFEST.json](PAGES_RUNTIME_MANIFEST.json).

The manifest is byte-identical to the accepted b0aa1273 pre-FF publication, and every one of its 456 bodies was SHA-256 checked. Source 6f2e5fb2 adds documentation only. No new qa:pre-ff was run: the accepted exact b0aa1273 run remains 202/202 PASS in 134.48 minutes, with unchanged head/clean tree ([ACCEPTED_PRE_FF.json](ACCEPTED_PRE_FF.json)). The previous A/B 199/507 and census files are retained as explicitly reused evidence, not newly rerun results: [ACCEPTED_AB.json](ACCEPTED_AB.json), [ACCEPTED_CENSUS.json](ACCEPTED_CENSUS.json). Physical old Safari/Chrome/Firefox certification and a Linux CI run of this candidate were not performed by these local checks; candidate review still needs its independent acceptance.

## New browser observations on this exact package

Installed Chromium, real service workers, separate fresh profiles per width, GitHub Pages subpath /warhammer-rules-complete-preview/, isolated ephemeral loopback servers. No parallel heavy runs. The owner DG v37.25 file was read from the clean candidate and its accepted SHA-256 7b7050e6f2e39c749f9cd883cd0c00c3806291faf625479dede324f6b38a188f verified before UI import. No guessed roster content or direct saved-state injection was used.

| Width | Home / all books | Owner DG v37.25 | Offline restart | Old release to candidate | Saved DG/SM after update |
| --- | --- | --- | --- | --- | --- |
| 390 | PASS; 9/9 | READY; 8 units | PASS; fresh process; saved bytes/snapshot equal | 4.795s; no button | DG/SM reopen online/offline; saved bytes equal |
| 1440 | PASS; 9/9 | READY; 8 units | PASS; fresh process; saved bytes/snapshot equal | 4.973s; no button | DG/SM reopen online/offline; saved bytes equal |

All nine Army Book links were clicked from the real Home. Visible library-entry counts equal the native payload's group entries:

| Book | Title | 390 shown/expected | 1440 shown/expected |
| --- | --- | ---: | ---: |
| death-guard | Death Guard | 53/53 | 53/53 |
| adeptus-mechanicus | Adeptus Mechanicus | 69/69 | 69/69 |
| chaos-space-marines | Chaos Space Marines | 139/139 | 139/139 |
| emperors-children | Emperor’s Children | 81/81 | 81/81 |
| tyranids | Tyranids | 92/92 | 92/92 |
| tau-empire | T’au Empire | 69/69 | 69/69 |
| space-marines | Space Marines | 111/111 | 111/111 |
| dark-angels | Dark Angels | 106/106 | 106/106 |
| blood-angels | Blood Angels | 102/102 | 102/102 |

Cold/offline smoke closed the original browser process and reopened the same persistent profile with networking disabled before navigation. Home and the saved eight-unit DG roster opened; its saved JSON and full snapshot were unchanged. Scope is the requested library/import/offline smoke, not a new exhaustive 491-datasheet sweep or full A/B. [browser/RESULTS.json](browser/RESULTS.json), [BROWSER_SMOKE.log](BROWSER_SMOKE.log).

For each update profile the actual old 1fd0b279051d76f1a262f7c8f117e35551b7de39 package was installed first; existing two-unit DG and three-unit SM fixtures were imported and saved through its public UI. Only the server's package changed on the same origin/subpath. Ordinary reload activated the prepared update automatically; no update button, activation API, cache/storage clear or forced check was used. The current worker and page report revision d08e23b961b6f507. Saved roster bytes and existing localStorage keys stayed identical; both rosters reopened online and offline. Page errors are zero. Raw offline network-first failures and aborted navigation requests remain in the logs rather than being misreported as zero failed requests. Large response bodies above 8 MB use header-only network coverage; all static candidate package bodies were separately verified. [update-path/RESULTS.json](update-path/RESULTS.json), [UPDATE_PATH.log](UPDATE_PATH.log).

[Open the offline screenshot gallery](GALLERY.html). The owner's running preview was not switched or stopped by these isolated observations; its accepted b0aa1273 runtime bytes equal this candidate's package.

## Previous live deployment and rollback

Latest successful Pages deployment: 7357185549, SHA 1fd0b279051d76f1a262f7c8f117e35551b7de39, success 2026-10-27T11:27:21Z. [Workflow run 40496093519](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/actions/runs/40496093519) and both build/deploy jobs succeeded. Pages remains workflow-based on unified-v2-release. Both REST and the GitHub connector report no artifacts for this run; expiration versus deletion is unknown. [Selected deployment metadata](metadata/PAGES_ROLLBACK_METADATA.json), [deployment inventory](metadata/DEPLOYMENT_INVENTORY.json).

Rollback is a new reviewed commit-tree with old tree fb96adf457eef15e25030562261cae193db29f9c and the then-current release as its only parent. Its separate review branch does not publish anything. Only another explicit owner authorization for the exact reviewed rollback SHA permits Codex to FF release. Complete guarded PowerShell preparation and authorized-FF commands are in [ROLLBACK_COMMANDS.md](ROLLBACK_COMMANDS.md); none was executed.

## Known player limitations and remaining authority

See [the sourced player limitations](metadata/KNOWN_PLAYER_LIMITATIONS.md): Safari/iOS 15.4+, Chrome 100+, Firefox 102+; old-device certification separate; offline only compatible visited data, subject to storage eviction and incomplete images; working-screen updates require confirmation; some rules are text/recipient-only and 171 remain UNKNOWN; incomplete/ambiguous exports require player clarification; known Space Marine export ambiguity/Stormlance DP disagreement; Core Stratagem unit applicability is a reference-only boundary. GAP 0 is not full automation. Historical off-queue engineering debt is separated from demonstrated player defects.

The candidate and this one-commit evidence branch are for review only. Claude candidate PASS, the owner's manual acceptance and a further explicit owner authorization naming the exact candidate SHA are required before release. Source remains 6f2e5fb23643fc0041efcd7006f3e150bd5ce4be; release remains 1fd0b279051d76f1a262f7c8f117e35551b7de39. No workflow was dispatched and GitHub reports 0 Actions runs for the candidate. No runtime source, book data, tests, cache policy or release workflow was changed during stage 2. Temporary cleanup is attempted only after evidence publication; its outcome/retained path is reported in the final chat.
