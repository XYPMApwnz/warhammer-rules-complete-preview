"""Task-owned reproduction; execute after quick, never concurrently with QA."""
import os, sys, json, hashlib, subprocess, pathlib, shlex, time, platform

ROOT = pathlib.Path('E:/Warhammer/worktrees/release-ci-fix-v1')
OUT = pathlib.Path('E:/Warhammer/qa-evidence/release-candidate-v5-2026-11-22')
TMP = pathlib.Path('E:/Warhammer/qa-tmp/release-candidate-v5')
CLONE = TMP / 'clean-room-clone'
RUNNER = TMP / 'clean-room-runner'
LOCAL = TMP / 'local-package'
BASE = pathlib.Path('E:/Warhammer/qa-tmp/release-candidate-v4/package')
EXPECTED = 'f975aa7a6c68073dd86c46b512e9cc1b8664209abce937fad128e91616095af5'
CANDIDATE = json.loads((OUT/'CANDIDATE.json').read_text())
SHA = CANDIDATE['candidate']
NODE = 'C:/Program Files/nodejs/node.exe'
NPM = 'C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js'
env = dict(os.environ)
for key in ('NODE_PATH', 'NODE_OPTIONS', 'NPM_CONFIG_PRODUCTION', 'NPM_CONFIG_OMIT', 'NODE_ENV'):
    env.pop(key, None)
scratch = TMP / 'clean-room-scratch'
scratch.mkdir(parents=True, exist_ok=True)
for key in ('TEMP', 'TMP', 'TMPDIR', 'QA_TMP_ROOT'):
    env[key] = str(scratch)
env['QA_SKIP_TMP_SWEEP'] = '1'
env['WH_PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH'] = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
results = {'schema':'release-ci-clean-room/v1', 'platform': platform.platform(), 'sha': SHA,
           'hostBoundary': 'Windows Node 24; not a Linux runner execution', 'steps': []}

def digest(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()

def run(label, args, cwd=ROOT, command=None):
    start = time.monotonic()
    log = OUT / (label + '.txt')
    with log.open('wb') as output:
        child = subprocess.run(args, cwd=cwd, env=env, stdout=output, stderr=subprocess.STDOUT)
    results['steps'].append({'label':label, 'command':command or subprocess.list2cmdline(args),
        'cwd':str(cwd), 'exitCode':child.returncode, 'elapsedMs':round((time.monotonic()-start)*1000), 'log':log.name})
    print(label, 'exit', child.returncode, flush=True)
    if child.returncode:
        raise RuntimeError(label + ' failed; inspect ' + str(log))
    return log.read_text(encoding='utf-8', errors='replace')

def compare(left, right):
    a = {p.relative_to(left).as_posix():(p.stat().st_size,digest(p)) for p in left.rglob('*') if p.is_file()}
    b = {p.relative_to(right).as_posix():(p.stat().st_size,digest(p)) for p in right.rglob('*') if p.is_file()}
    delta = [k for k in sorted(a.keys()|b.keys()) if a.get(k)!=b.get(k)]
    assert not delta, delta
    return {'status':'PASS','filesIncludingManifest':len(a),'totalBytes':sum(row[0] for row in a.values()),
            'differentFiles':delta, 'manifestSha256':digest(left/'PAGES_RUNTIME_MANIFEST.json')}

try:
    assert not CLONE.exists(), 'Fresh destination required'
    assert not LOCAL.exists(), 'Fresh local package destination required'
    RUNNER.mkdir(parents=True, exist_ok=False)
    results['node'] = run('NODE_VERSION', [NODE, '--version']).strip()
    results['npm'] = run('NPM_VERSION', [NODE, NPM, '--version']).strip()
    assert results['node'].startswith('v24.')
    run('CLONE', ['git','-c','core.autocrlf=false','clone','--single-branch','--branch',CANDIDATE['branch'],'--depth=1','https://github.com/XYPMApwnz/warhammer-rules-complete-preview.git',str(CLONE)])
    assert run('CLONE_SHA',['git','rev-parse','HEAD'],CLONE).strip()==SHA
    assert not run('CLONE_STATUS_BEFORE',['git','status','--porcelain'],CLONE).strip()
    assert not (CLONE/'node_modules').exists()
    assert not (CLONE/'.git/objects/info/alternates').exists()
    results['initialState']={'nodeModulesAbsent':True,'cleanGitStatus':True,'noObjectAlternates':True,'cloneMethod':'fresh depth-1 HTTPS clone of the candidate review branch; core.autocrlf=false'}
    initial = {f:digest(CLONE/f) for f in ('package.json','package-lock.json')}
    contract = json.loads(run('WORKFLOW_CONTRACT',[NODE,str(ROOT/'tools/pages-runtime-ci-contract.mjs'),'--source',str(CLONE)]))
    for index, command in enumerate(contract['workflow']['commands']):
        expanded = command.replace('${{ runner.temp }}', RUNNER.as_posix())
        args = shlex.split(expanded)
        if args[0]=='npm': args=[NODE,NPM]+args[1:]
        elif args[0]=='node': args=[NODE]+args[1:]
        else: raise AssertionError('Unexpected workflow command')
        run('WORKFLOW_'+str(index+1), args, CLONE, expanded)
        if index==0:
            dep = CLONE/'node_modules'
            assert dep.exists() and not dep.is_symlink() and not dep.is_junction()
            resolved = pathlib.Path(run('ACORN_RESOLVED',[NODE,'--input-type=module','-e',"console.log(import.meta.resolve('acorn'))"],CLONE).strip().removeprefix('file:///'))
            assert resolved.resolve().is_relative_to(dep.resolve())
            results['dependencyIsolation']={'ordinaryLocalNodeModules':True,'acornInsideClone':True,'lockAndPackageUnchanged':all(digest(CLONE/f)==sha for f,sha in initial.items())}
    assert all(digest(CLONE/f)==sha for f,sha in initial.items())
    assert not run('CLONE_STATUS_AFTER',['git','status','--porcelain'],CLONE).strip()
    LOCAL = pathlib.Path('E:/Warhammer/qa-tmp/release-ci-fix/local-package')
    manifest = json.loads((RUNNER/'dist-pages/PAGES_RUNTIME_MANIFEST.json').read_text())
    assert manifest['contentSha256']==EXPECTED
    results['localVsCleanRoom']=compare(LOCAL,RUNNER/'dist-pages')
    results['release818VsCleanRoom']=compare(BASE,RUNNER/'dist-pages')
    results['package']={k:manifest[k] for k in ('fileCount','runtimeBytes','contentSha256','cacheRevision','precacheUrls')}
    files = {p.relative_to(RUNNER/'dist-pages').as_posix() for p in (RUNNER/'dist-pages').rglob('*') if p.is_file()}
    changed = subprocess.check_output(['git','diff','--name-only','818d3b0c34503a166b58b21810666feafe858bc5',SHA],cwd=ROOT,text=True).splitlines()
    assert not (set(changed)&files)
    results['runtimeExclusion']={'changedSourceFiles':changed,'inRuntimePackage':sorted(set(changed)&files)}
    results['status']='PASS'
except BaseException as error:
    results['status']='FAIL'; results['error']=str(error)
    raise
finally:
    (OUT/'CLEAN_ROOM.json').write_text(json.dumps(results,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'status':results['status'],'package':results['package'],'comparedFiles':results['release818VsCleanRoom']['filesIncludingManifest']}))
