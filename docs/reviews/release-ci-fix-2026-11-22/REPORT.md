# Release CI dependency fix — 22 November 2026

READY_FOR_REVIEW. Feature `codex/release-ci-fix-v1`: `f5d73d531edbea8f8c919265477404c9b1b0eec4` from `9c18451452a478be2509314b6b80224313506ec9`.
The runtime publication remains byte-for-byte identical to release candidate `818d3b0c34503a166b58b21810666feafe858bc5`.
No release/source/main ref, Pages setting, workflow dispatch, or running preview was changed.

## Incident and exact change

Pages run `45008914493` failed during packaging: `ERR_MODULE_NOT_FOUND` for `acorn` in `tools/runtime-url-stamps.mjs`; deployment was skipped.
The package tools already declared this dependency; the workflow did not install the lockfile dependencies. Local installed dependencies hid that preparation omission.

The entire workflow change is two added lines, before the first package command:

```yaml
      - name: Install locked packaging dependencies
        run: npm ci --ignore-scripts
```

Node 24, action versions, triggers, build/deploy permissions, deployment environment and all other workflow lines are unchanged. See [exact workflow diff](WORKFLOW.patch) and [complete feature diff](FEATURE_DIFF.patch).
`npm ci --ignore-scripts` succeeded in the fresh clone, and all three package/check/QA commands then passed. These commands do not require dependency lifecycle/postinstall execution. Dependency versions and `package-lock.json` are unchanged.

## Verification authorized by the owner

The owner replaced the full pre-FF requirement with quick, the new contract test and the real clean room. **No full pre-FF was started.**

| Check | Result |
| --- | --- |
| `npm run qa:quick` | 78/78 PASS; 6.438 minutes |
| New `qa:pages-ci` contract | PASS; 16 negative controls rejected |
| Workflow guidance QA | PASS inside quick |
| Fresh-clone workflow commands | All exit 0; details below |
| Normal local package vs fresh clone | 457/457 physical files, including manifest, identical bytes |
| Accepted 818 package vs fresh clone | 457/457 physical files, including manifest, identical bytes |
| Accepted generated outputs | 148/148 exact Git blob identities; no generated changes |
| Old tests/expectations | No edits |
| Queue preservation | All prior 77 quick / 211 pre-FF jobs and arguments retain order; only the new contract added |

The 212-job pre-FF plan was inspected only, not executed. No fresh complete A/B capture, full generated rebuild or separate census run was added to the owner's accelerated scope. The full runtime package, all accepted generated blobs, all runtime code, game data and census registry are unchanged; there is no new gameplay or presentation delta. Existing accepted source QA is not presented as a new run.

## New contract and negative controls

The guard reads the actual build job and requires an unconditional locked install at the checkout root before the first `tools/pages-runtime-package*.mjs` invocation.
It parses the transitive local JavaScript dependency graph from producer and package-QA roots with Acorn, without evaluating factories, and verifies all bare packages against direct `dependencies` / `devDependencies` declarations. Current graph: 11 local files, package `acorn`.
It handles static imports, reexports, literal dynamic imports and CommonJS requires, including scoped subpaths; unsupported dynamic/URL/escaping shapes fail closed.

The 16 controls are listed with results in [CI_CONTRACT.json](CI_CONTRACT.json). Required mutations are explicit: removing the install step rejects with `CI_LOCKED_INSTALL_REQUIRED`; adding an undeclared bare import to the actual transitive `runtime-url-stamps.mjs` rejects with `CI_UNDECLARED_PACKAGE`.
Other controls cover installation order, unlocked installs, omitted dev dependencies, conditions, directory/environment changes, scoped/reexport/dynamic/CommonJS dependencies and unsupported dependency resolution.

The guard is in both quick and pre-FF and has its own `npm run qa:pages-ci` entrypoint. Existing test expectations did not change: the old/new expectation table has **zero rows**.

## Real clean room

Host: `Windows-11-10.0.26300-SP0`; Node `v24.18.0`, npm `11.16.0`. This is a Windows Node 24 execution of the workflow commands, **not a Linux GitHub runner execution**.
The fresh depth-1 transport clone had no `node_modules`, no object alternates and clean Git status, at exact feature SHA. No dependency folder was copied, junctioned or shared. After installation, `node_modules` was an ordinary local directory and `acorn` resolved inside it; package/lock bytes and tracked Git status remained unchanged.

Commands were extracted from the actual workflow; only `${{ runner.temp }}` was replaced by the new task-owned runner directory:

```text
"C:/Program Files/nodejs/node.exe" E:\Warhammer\worktrees\release-ci-fix-v1\tools\pages-runtime-ci-contract.mjs --source E:\Warhammer\qa-tmp\release-ci-fix\clean-room-clone
npm ci --ignore-scripts
node tools/pages-runtime-package.mjs --source . --out "E:/Warhammer/qa-tmp/release-ci-fix/clean-room-runner/dist-pages"
node tools/pages-runtime-package.mjs --source . --out "E:/Warhammer/qa-tmp/release-ci-fix/clean-room-runner/dist-pages" --check
node tools/pages-runtime-package-qa.mjs --source . --published "E:/Warhammer/qa-tmp/release-ci-fix/clean-room-runner/dist-pages" --work "E:/Warhammer/qa-tmp/release-ci-fix/clean-room-runner/pages-package-qa"
```

On Windows, the driver invokes npm through Node's bundled `npm-cli.js` and Node via its absolute executable; argument lists are otherwise the extracted workflow commands. Exact outputs and exit codes:

| Step | Exit | Time | Evidence |
| --- | --- | --- | --- |
| NODE_VERSION | 0 | 0.027 s | [output](logs/NODE_VERSION.txt) |
| NPM_VERSION | 0 | 0.193 s | [output](logs/NPM_VERSION.txt) |
| CLONE | 0 | 33.867 s | [output](logs/CLONE.txt) |
| CLONE_SHA | 0 | 0.033 s | [output](logs/CLONE_SHA.txt) |
| CLONE_STATUS_BEFORE | 0 | 0.186 s | [output](logs/CLONE_STATUS_BEFORE.txt) |
| WORKFLOW_CONTRACT | 0 | 0.140 s | [output](logs/WORKFLOW_CONTRACT.txt) |
| WORKFLOW_1 | 0 | 3.727 s | [output](logs/WORKFLOW_1.txt) |
| ACORN_RESOLVED | 0 | 0.058 s | [output](logs/ACORN_RESOLVED.txt) |
| WORKFLOW_2 | 0 | 11.055 s | [output](logs/WORKFLOW_2.txt) |
| WORKFLOW_3 | 0 | 5.459 s | [output](logs/WORKFLOW_3.txt) |
| WORKFLOW_4 | 0 | 44.914 s | [output](logs/WORKFLOW_4.txt) |
| CLONE_STATUS_AFTER | 0 | 0.180 s | [output](logs/CLONE_STATUS_AFTER.txt) |
| LOCAL_PACKAGE | 0 | 10.183 s | [output](logs/LOCAL_PACKAGE.txt) |

See [CLEAN_ROOM.json](CLEAN_ROOM.json) and [reproduction recipe](recipes/clean-room.py). Dependency installation is the network step; packaging stays network-free. A later candidate must repeat this fresh-clone check at its own exact SHA. The procedure also retains independent Claude Linux review; no Linux/WSL/Docker environment was available for this local execution.

## Runtime byte proof

| Metric | Result |
| --- | --- |
| Runtime inventory | 456 files; 282,879,565 bytes |
| Physical publication including manifest | 457 files; 283,187,880 bytes |
| Aggregate content SHA-256 | `f975aa7a6c68073dd86c46b512e9cc1b8664209abce937fad128e91616095af5` |
| Manifest file SHA-256 | `0a4b26fd2f8f370ab954d06d5914bc27cba02235ecf820bec77bdd69e278295c` |
| Cache revision | `28acb87c11537a8b` |
| Mandatory precache | 221 URLs; unchanged |
| Source files changed by this feature included in publication | 0 |

The workflow, Node-only CI guard/test, queue/package scripts metadata and procedure documents are all excluded from the runtime publication. The unchanged aggregate is supported by independent per-path size and SHA-256 comparisons, including exact manifest bytes, against both the retained accepted 818 package and a normal local build. See [PACKAGE_MANIFEST.json](PACKAGE_MANIFEST.json) and [generated blob proof](GENERATED_BYTE_IDENTITY.json).

## Scope and next action

The fix is ready for Claude review and owner PASS. Source FF requires separate authorization for this exact feature SHA.
Only after approved source FF: create candidate v5 using the new source tree with sole parent `818d3b0c34503a166b58b21810666feafe858bc5`; push a new candidate review branch; repeat the clean room and verify the same aggregate; browser smoke is Home, one Army Book and DG import. No candidate v5 or release was created by this task.

Full logs and task evidence are retained at `E:/Warhammer/qa-evidence/release-ci-fix-v1-2026-11-22`. Fresh-clone/package scratch paths named by the report are retained for review under `E:/Warhammer/qa-tmp/release-ci-fix`. The running preview was left untouched.
