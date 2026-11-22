# Release candidate v5 — 22 November 2026

READY_FOR_REVIEW. Candidate preparation only; no release or Pages update.

## Authorization and identities

The owner reported Claude PASS for feature `f5d73d53`, including an independent Linux fresh clone, exact workflow commands, package-QA 15/15 and the expected package hash. The owner authorized source fast-forward from `9c18451452a478be2509314b6b80224313506ec9` to `f5d73d531edbea8f8c919265477404c9b1b0eec4` and immediate candidate v5 preparation. GitHub source was checked immediately before the ordinary non-force push and matched the required old SHA.

| Identity | Value |
| --- | --- |
| Source after authorized FF | `f5d73d531edbea8f8c919265477404c9b1b0eec4` |
| Candidate | `5bfc62144a8d8d6986c77eb1833941502fb06ab4` |
| Candidate/source tree | `1c5052f4e977cfc9d0cd490d06af037e4e23366f` |
| Only parent | `818d3b0c34503a166b58b21810666feafe858bc5` |
| Candidate review branch | `codex/release-candidate-5bfc6214` |
| Evidence branch | `codex/release-candidate-evidence-v5` |

A clean detached checkout of reviewed source was created before `git commit-tree`. Candidate tree equals source tree exactly (`git diff --quiet` PASS), and `%P` contains exactly the current release SHA. The review branch was proven absent before push. There was no merge commit, force push, release push, Pages setting change or manual workflow dispatch. `main` is unchanged.

## Fresh-clone clean room at the candidate SHA

A new depth-1 HTTPS clone of `codex/release-candidate-5bfc6214` started with no `node_modules` and no object alternates. Node `v24.18.0` / npm `11.16.0`; actual host `Windows-11-10.0.26300-SP0`. This candidate run was on Windows, not Linux. The earlier Linux verification reported by the owner concerned the reviewed feature with the same tree; it is not relabelled as a Linux candidate run here.

The four actual workflow commands were extracted, with only `${{ runner.temp }}` replaced by a new runner directory:

```text
npm ci --ignore-scripts
node tools/pages-runtime-package.mjs --source . --out "E:/Warhammer/qa-tmp/release-candidate-v5/clean-room-runner/dist-pages"
node tools/pages-runtime-package.mjs --source . --out "E:/Warhammer/qa-tmp/release-candidate-v5/clean-room-runner/dist-pages" --check
node tools/pages-runtime-package-qa.mjs --source . --published "E:/Warhammer/qa-tmp/release-candidate-v5/clean-room-runner/dist-pages" --work "E:/Warhammer/qa-tmp/release-candidate-v5/clean-room-runner/pages-package-qa"
```

All exit codes are zero. `npm ci --ignore-scripts` installed ordinary clone-local dependencies; `acorn` resolved inside that clone. Package and lockfile bytes, clone HEAD and tracked Git status stayed unchanged. No copied/junctioned dependency tree was used. Dependency installation is the network step; packaging remains network-free.

| Step | Exit | Duration | Evidence |
| --- | --- | --- | --- |
| NODE_VERSION | 0 | 0.020 s | [log](logs/NODE_VERSION.txt) |
| NPM_VERSION | 0 | 0.154 s | [log](logs/NPM_VERSION.txt) |
| CLONE | 0 | 49.707 s | [log](logs/CLONE.txt) |
| CLONE_SHA | 0 | 0.021 s | [log](logs/CLONE_SHA.txt) |
| CLONE_STATUS_BEFORE | 0 | 0.137 s | [log](logs/CLONE_STATUS_BEFORE.txt) |
| WORKFLOW_CONTRACT | 0 | 0.111 s | [log](logs/WORKFLOW_CONTRACT.txt) |
| WORKFLOW_1 | 0 | 1.162 s | [log](logs/WORKFLOW_1.txt) |
| ACORN_RESOLVED | 0 | 0.038 s | [log](logs/ACORN_RESOLVED.txt) |
| WORKFLOW_2 | 0 | 8.315 s | [log](logs/WORKFLOW_2.txt) |
| WORKFLOW_3 | 0 | 4.110 s | [log](logs/WORKFLOW_3.txt) |
| WORKFLOW_4 | 0 | 33.590 s | [log](logs/WORKFLOW_4.txt) |
| CLONE_STATUS_AFTER | 0 | 0.141 s | [log](logs/CLONE_STATUS_AFTER.txt) |

Package-QA: **15/15 PASS**, including independent deterministic packaging, CRLF/LF equality, source-overwrite/nonempty-output refusals, traversal/development/unreviewed-RAW controls, missing-module rejection, corruption and unlisted-file controls. See [full output](logs/WORKFLOW_4.txt), [clean-room details](CLEAN_ROOM.json) and [reproduction](recipes/clean-room.py). Text logs are normalized to LF for Git; the publication manifest retains exact original bytes.

## Runtime publication

| Metric | Value |
| --- | --- |
| Runtime inventory | 456 files / 282,879,565 bytes |
| Physical package including manifest | 457 files / 283,187,880 bytes |
| Aggregate content SHA-256 | `f975aa7a6c68073dd86c46b512e9cc1b8664209abce937fad128e91616095af5` |
| Manifest SHA-256 | `0a4b26fd2f8f370ab954d06d5914bc27cba02235ecf820bec77bdd69e278295c` |
| Cache revision | `28acb87c11537a8b` |
| Precache URL count | 221, unchanged |
| Comparison with accepted 818 package | Every path, size and SHA-256 identical: 457/457 |
| Comparison with normal reviewed-feature package | Every path, size and SHA-256 identical: 457/457 |

The CI repair changes no published site body, game data or generated publication. The workflow is absent from the runtime allowlist/package. This is the expected `f975aa7a...` package, with its original manifest bytes. [Manifest](PAGES_RUNTIME_MANIFEST.json).

## Requested browser smoke

The candidate package alone was served from a temporary local origin under the real Pages path prefix. Chromium used fresh persistent profiles, service workers enabled, separate 390 and 1440 viewports. No app modules, worker, fixture values or saved storage were substituted. This is mobile viewport emulation, not a physical-phone test.

| Width | Scenario | Result | Duration |
| --- | --- | --- | --- |
| 390 | home | PASS | 380 ms |
| 390 | death-guard-library | PASS | 1382 ms |
| 390 | authentic-DG-v37.25-import | PASS | 1059 ms |
| 1440 | home | PASS | 367 ms |
| 1440 | death-guard-library | PASS | 1323 ms |
| 1440 | authentic-DG-v37.25-import | PASS | 1080 ms |

Home exposes all nine book links. The selected DG library shows exactly 53/53 published entries. The authentic owner New Recruit v37.25 DG fixture is SHA-verified before input; import shows `Roster imported.`, READY, eight units. No raw roster or localStorage body is copied into evidence. Both widths have zero page errors, console errors, failed requests and HTTP failures. Browser server and profiles were closed after the smoke. The existing owner preview was not restarted or changed.

[Results](browser/RESULTS.json), [network record](browser/NETWORK.json), [offline-readable screenshot gallery](GALLERY.html).

The owner limited this candidate to the smoke above. No new full pre-FF, nine-book acceptance sweep, offline matrix or historical update matrix was run. The reviewed source quick result is 78/78; its CI gate has 16 rejected mutations. Earlier broad source/candidate QA remains historical evidence, not a fresh run claimed here.

## Deployment and rollback baseline

Git release stays `818d3b0c34503a166b58b21810666feafe858bc5`. Its Pages run `45008914493` is completed/FAILURE and produced no retained artifact; it did not deploy. Last successful Pages run `44863910786` is for `e3db1b345eca989436eea7af758900eee7795203`. HTTPS live manifest was rechecked: aggregate `0fab482c0fa7f4132c9bbb60646e880afca25f2b5823ab7fc1bd62322e67b909`, revision `d08e23b961b6f507`. Both runs currently expose zero artifacts. See [deployment state](PREVIOUS_DEPLOYMENT.json) and [artifact state](PREVIOUS_ARTIFACTS.json).

The known-good live source tree is `74a8064e67dafa06b20120ef5563da176db6d793` (`e3db1b345eca989436eea7af758900eee7795203`). If rollback is requested after a future release, follow `tools/PAGES_RUNTIME_RELEASE.md`: prepare a new reviewed commit-tree candidate with the chosen old tree and the then-current release as its sole parent, verify/package it, obtain Claude PASS and explicit owner authorization before FF release. Do not reset/force release or dispatch an old workflow. The undeployed 818 tree contains the missing-install CI defect, so it must not be assumed to be a working rollback publication. No rollback commit was created or executed.

## Release boundary and known limitations

This review branch does not publish the site. A future release needs separate explicit owner authorization naming this exact candidate SHA after review and the owner's manual check.

Runtime behavior is unchanged from the accepted package: first-visit offline access becomes available only after background preparation, and an Army Book's data must first be opened online for offline use. The 15 named markup UNKNOWN debts remain unchanged. The prior occasional Core popup timeout was not investigated or rerun in this deliberately small smoke.

Task evidence is retained at `E:/Warhammer/qa-evidence/release-candidate-v5-2026-11-22`. Referenced clean clone/package/profile paths remain under `E:/Warhammer/qa-tmp/release-candidate-v5` for review. No RAW source capture or development dependency tree is published in this evidence branch.
