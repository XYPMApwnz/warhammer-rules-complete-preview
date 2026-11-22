"""Exact four workflow commands in a fresh clone, no shared dependency tree."""
import pathlib, os, json, subprocess, hashlib, time, platform, shlex
ROOT=pathlib.Path('E:/Warhammer/worktrees/visual-polish-v1')
OUT=pathlib.Path('E:/Warhammer/qa-evidence/visual-polish-v1-2026-11-22')
TMP=pathlib.Path('E:/Warhammer/qa-tmp/visual-polish')
SHA='9e04d5d43240795979d0257a27ba4c35cd2259f6'
NODE='C:/Program Files/nodejs/node.exe';NPM='C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js'
CLONE=TMP/'clean-room-clone';RUNNER=TMP/'clean-room-runner';LOCAL=TMP/'package-final'
env=dict(os.environ)
for key in ('NODE_OPTIONS','NODE_PATH','NODE_ENV','NPM_CONFIG_PRODUCTION','NPM_CONFIG_OMIT'):env.pop(key,None)
scratch=TMP/'clean-room-scratch';scratch.mkdir(parents=True,exist_ok=True)
for key in ('TEMP','TMP','TMPDIR','QA_TMP_ROOT'):env[key]=str(scratch)
env['QA_SKIP_TMP_SWEEP']='1';env['NPM_CONFIG_CACHE']=str(TMP/'clean-room-npm-cache')
result={'schema':'visual-polish-clean-room/v1','sha':SHA,'host':platform.platform(),'steps':[]}
def run(label,args,cwd=ROOT,command=None):
 start=time.monotonic();log=OUT/('clean-room-'+label+'.txt')
 with log.open('wb') as output:p=subprocess.run(args,cwd=cwd,env=env,stdout=output,stderr=subprocess.STDOUT)
 result['steps'].append({'label':label,'command':command or subprocess.list2cmdline(args),'cwd':str(cwd),'exitCode':p.returncode,'elapsedMs':round((time.monotonic()-start)*1000),'log':log.name})
 print(label,p.returncode,flush=True);assert p.returncode==0,label+' failed; STOP'
 return log.read_text(encoding='utf-8',errors='replace').strip()
def sha(file):return hashlib.sha256(file.read_bytes()).hexdigest()
try:
 assert not CLONE.exists() and not RUNNER.exists() and not LOCAL.exists()
 assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()==SHA
 assert not subprocess.check_output(['git','status','--porcelain'],cwd=ROOT,text=True).strip()
 result['node']=run('node',[NODE,'--version']);result['npm']=run('npm',[NODE,NPM,'--version']);assert result['node'].startswith('v24.')
 run('local-package',[NODE,'tools/pages-runtime-package.mjs','--source','.','--out',str(LOCAL)])
 run('clone',['git','-c','core.autocrlf=false','clone','--no-local','--no-hardlinks','--single-branch','--branch','codex/visual-polish-v1','--depth=1',ROOT.as_uri(),str(CLONE)])
 assert run('clone-sha',['git','rev-parse','HEAD'],CLONE)==SHA
 result['tree']=run('clone-tree',['git','rev-parse','HEAD^{tree}'],CLONE)
 assert not run('status-before',['git','status','--porcelain'],CLONE)
 assert not (CLONE/'node_modules').exists() and not (CLONE/'.git/objects/info/alternates').exists()
 result['initialNodeModulesAbsent']=True;result['noObjectAlternates']=True
 before={f:sha(CLONE/f) for f in ('package.json','package-lock.json')}
 contract=json.loads(run('contract',[NODE,str(ROOT/'tools/pages-runtime-ci-contract.mjs'),'--source',str(CLONE)]))
 RUNNER.mkdir()
 for index,command in enumerate(contract['workflow']['commands'],1):
  expanded=command.replace('${{ runner.temp }}',RUNNER.as_posix());args=shlex.split(expanded)
  assert args[0] in ('npm','node')
  executable=[NODE,NPM] if args[0]=='npm' else [NODE]
  run('workflow-'+str(index),executable+args[1:],CLONE,expanded)
  if index==1:
   modules=CLONE/'node_modules';assert modules.exists() and not modules.is_symlink() and not modules.is_junction()
   acorn=run('acorn-resolved',[NODE,'--input-type=module','-e',"console.log(import.meta.resolve('acorn'))"],CLONE)
   assert pathlib.Path(acorn.removeprefix('file:///')).resolve().is_relative_to(modules.resolve())
   result['isolatedDependencies']=True
 assert all(sha(CLONE/f)==digest for f,digest in before.items())
 assert not run('status-after',['git','status','--porcelain'],CLONE)
 def inventory(root):return {p.relative_to(root).as_posix():{'bytes':p.stat().st_size,'sha256':sha(p)} for p in root.rglob('*') if p.is_file()}
 a,b=inventory(LOCAL),inventory(RUNNER/'dist-pages');assert a==b,'Package bytes differ; STOP'
 manifest=json.loads((RUNNER/'dist-pages/PAGES_RUNTIME_MANIFEST.json').read_text(encoding='utf-8'))
 result.update({'status':'PASS','package':{key:manifest[key] for key in ('contentSha256','cacheRevision','fileCount','runtimeBytes','precacheUrls')},'comparedPhysicalFiles':len(a),'byteDifferences':0,'manifestSha256':sha(RUNNER/'dist-pages/PAGES_RUNTIME_MANIFEST.json')})
except BaseException as error:
 result.update({'status':'FAIL','error':str(error)});raise
finally:(OUT/'CLEAN_ROOM.json').write_bytes((json.dumps(result,indent=2)+'\n').encode())
print(json.dumps({'status':result['status'],'package':result['package'],'physicalFiles':result['comparedPhysicalFiles']}))
