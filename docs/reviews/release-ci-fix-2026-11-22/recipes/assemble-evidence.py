"""Publish selected evidence, never raw source/test fixtures or whole QA archives."""
import pathlib, json, subprocess, shutil, hashlib
ROOT=pathlib.Path('E:/Warhammer/worktrees/release-ci-fix-v1')
OUT=pathlib.Path('E:/Warhammer/qa-evidence/release-ci-fix-v1-2026-11-22')
DEST=pathlib.Path('E:/Warhammer/worktrees/release-ci-fix-evidence/docs/reviews/release-ci-fix-2026-11-22')
SHA='f5d73d531edbea8f8c919265477404c9b1b0eec4'
BASE='9c18451452a478be2509314b6b80224313506ec9'
def read(file): return json.loads(file.read_text(encoding='utf-8-sig'))
q=read(OUT/'quick/RESULTS.json'); c=read(OUT/'CLEAN_ROOM.json')
assert len(q['results'])==78 and all(r['status']=='PASS' for r in q['results'])
assert c['status']=='PASS'
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()==SHA
assert not subprocess.check_output(['git','status','--porcelain'],cwd=ROOT,text=True).strip()
DEST.mkdir(parents=True,exist_ok=False)
for name in ('CLEAN_ROOM.json','QUEUE_PRESERVATION.json','GENERATED_BYTE_IDENTITY.json'):
    shutil.copyfile(OUT/name, DEST/name)
shutil.copyfile(OUT/'quick/RESULTS.json',DEST/'QUICK_RESULTS.json')
ci=read(next((OUT/'quick').glob('*-pages-runtime-ci-contract-qa.mjs.log')))
(DEST/'CI_CONTRACT.json').write_text(json.dumps(ci,indent=2)+'\n',encoding='utf-8')
shutil.copyfile('E:/Warhammer/qa-tmp/release-ci-fix/clean-room-runner/dist-pages/PAGES_RUNTIME_MANIFEST.json',DEST/'PACKAGE_MANIFEST.json')
for args,name in [(['--','.github/workflows/pages-runtime.yml'],'WORKFLOW.patch'),([], 'FEATURE_DIFF.patch')]:
    data=subprocess.check_output(['git','diff',BASE,SHA,*args],cwd=ROOT)
    (DEST/name).write_bytes(data)
logs=DEST/'logs'; logs.mkdir()
for step in c['steps']:
    shutil.copyfile(OUT/step['log'],logs/step['log'])
recipes=DEST/'recipes'; recipes.mkdir()
shutil.copyfile(OUT/'RECIPES/clean-room.py',recipes/'clean-room.py')
shutil.copyfile(OUT/'RECIPES/assemble-evidence.py',recipes/'assemble-evidence.py')
rows='\n'.join(f"| {s['label']} | {s['exitCode']} | {s['elapsedMs']/1000:.3f} s | [output](logs/{s['log']}) |" for s in c['steps'])
commands='\n'.join(s['command'] for s in c['steps'] if s['label'].startswith('WORKFLOW_'))
report=f'''# Release CI dependency fix — 22 November 2026

READY_FOR_REVIEW. Feature `codex/release-ci-fix-v1`: `{SHA}` from `{BASE}`.
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
| `npm run qa:quick` | 78/78 PASS; {q['elapsedMs']/60000:.3f} minutes |
| New `qa:pages-ci` contract | PASS; {len(ci['negativeControls'])} negative controls rejected |
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
It parses the transitive local JavaScript dependency graph from producer and package-QA roots with Acorn, without evaluating factories, and verifies all bare packages against direct `dependencies` / `devDependencies` declarations. Current graph: {len(ci['dependencies']['files'])} local files, package `acorn`.
It handles static imports, reexports, literal dynamic imports and CommonJS requires, including scoped subpaths; unsupported dynamic/URL/escaping shapes fail closed.

The {len(ci['negativeControls'])} controls are listed with results in [CI_CONTRACT.json](CI_CONTRACT.json). Required mutations are explicit: removing the install step rejects with `CI_LOCKED_INSTALL_REQUIRED`; adding an undeclared bare import to the actual transitive `runtime-url-stamps.mjs` rejects with `CI_UNDECLARED_PACKAGE`.
Other controls cover installation order, unlocked installs, omitted dev dependencies, conditions, directory/environment changes, scoped/reexport/dynamic/CommonJS dependencies and unsupported dependency resolution.

The guard is in both quick and pre-FF and has its own `npm run qa:pages-ci` entrypoint. Existing test expectations did not change: the old/new expectation table has **zero rows**.

## Real clean room

Host: `{c['platform']}`; Node `{c['node']}`, npm `{c['npm']}`. This is a Windows Node 24 execution of the workflow commands, **not a Linux GitHub runner execution**.
The fresh depth-1 transport clone had no `node_modules`, no object alternates and clean Git status, at exact feature SHA. No dependency folder was copied, junctioned or shared. After installation, `node_modules` was an ordinary local directory and `acorn` resolved inside it; package/lock bytes and tracked Git status remained unchanged.

Commands were extracted from the actual workflow; only `${{{{ runner.temp }}}}` was replaced by the new task-owned runner directory:

```text
{commands}
```

On Windows, the driver invokes npm through Node's bundled `npm-cli.js` and Node via its absolute executable; argument lists are otherwise the extracted workflow commands. Exact outputs and exit codes:

| Step | Exit | Time | Evidence |
| --- | --- | --- | --- |
{rows}

See [CLEAN_ROOM.json](CLEAN_ROOM.json) and [reproduction recipe](recipes/clean-room.py). Dependency installation is the network step; packaging stays network-free. A later candidate must repeat this fresh-clone check at its own exact SHA. The procedure also retains independent Claude Linux review; no Linux/WSL/Docker environment was available for this local execution.

## Runtime byte proof

| Metric | Result |
| --- | --- |
| Runtime inventory | 456 files; 282,879,565 bytes |
| Physical publication including manifest | 457 files; 283,187,880 bytes |
| Aggregate content SHA-256 | `{c['package']['contentSha256']}` |
| Manifest file SHA-256 | `{c['release818VsCleanRoom']['manifestSha256']}` |
| Cache revision | `{c['package']['cacheRevision']}` |
| Mandatory precache | 221 URLs; unchanged |
| Source files changed by this feature included in publication | 0 |

The workflow, Node-only CI guard/test, queue/package scripts metadata and procedure documents are all excluded from the runtime publication. The unchanged aggregate is supported by independent per-path size and SHA-256 comparisons, including exact manifest bytes, against both the retained accepted 818 package and a normal local build. See [PACKAGE_MANIFEST.json](PACKAGE_MANIFEST.json) and [generated blob proof](GENERATED_BYTE_IDENTITY.json).

## Scope and next action

The fix is ready for Claude review and owner PASS. Source FF requires separate authorization for this exact feature SHA.
Only after approved source FF: create candidate v5 using the new source tree with sole parent `818d3b0c34503a166b58b21810666feafe858bc5`; push a new candidate review branch; repeat the clean room and verify the same aggregate; browser smoke is Home, one Army Book and DG import. No candidate v5 or release was created by this task.

Full logs and task evidence are retained at `E:/Warhammer/qa-evidence/release-ci-fix-v1-2026-11-22`. Fresh-clone/package scratch paths named by the report are retained for review under `E:/Warhammer/qa-tmp/release-ci-fix`. The running preview was left untouched.
'''
(DEST/'REPORT.md').write_text(report,encoding='utf-8',newline='\n')
index=[]
for p in sorted(DEST.rglob('*')):
    if p.is_file(): index.append({'path':p.relative_to(DEST).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(DEST/'EVIDENCE_INDEX.json').write_text(json.dumps({'files':index},indent=2)+'\n',encoding='utf-8')
print('Assembled',len(index)+1,'evidence files',sum(r['bytes'] for r in index),'bytes')
