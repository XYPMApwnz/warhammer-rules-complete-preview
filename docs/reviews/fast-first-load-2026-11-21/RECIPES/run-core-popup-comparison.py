from pathlib import Path
import json,subprocess,os,time,hashlib
OUT=Path("E:/Warhammer/qa-evidence/fast-first-load-v1-2026-11-21")
TMP=Path("E:/Warhammer/qa-tmp/fast-first-load")
pre=json.loads((OUT/"preff/RESULTS.json").read_text(encoding="utf-8-sig"))
assert len(pre["results"])==209,"Do not overlap diagnostics with the full pre-FF"
head="e08ec20df980d4e6700c32b65069de983b250e03"
roots={"base":TMP/"base","head":Path("E:/Warhammer/worktrees/fast-first-load-v1")}
git=lambda root,*a:subprocess.check_output(["git",*a],cwd=root,text=True).strip()
assert git(roots["head"],"rev-parse","HEAD")==head
assert git(roots["head"],"status","--porcelain")==""
baseTest=(roots["base"]/"v2/core-reader-browser-qa.mjs").read_bytes()
assert baseTest==(roots["head"]/"v2/core-reader-browser-qa.mjs").read_bytes()
dest=OUT/"core-popup-comparison";dest.mkdir(exist_ok=False)
report={"status":"RUNNING","sourceTestSha256":hashlib.sha256(baseTest).hexdigest(),"assertions":"Unchanged repository test, external diagnostic loader only; tracing overhead is not used as performance evidence.","runs":[]}
def save(): (dest/"RESULTS.json").write_text(json.dumps(report,indent=2)+"\n",encoding="utf-8")
save()
for n in range(1,4):
 for side in ["base","head"]:
  root=roots[side];case=dest/f"{side}-{n}";case.mkdir();obs=case/"observer";obs.mkdir()
  env=dict(os.environ,QA_TMP_ROOT=str(TMP/"core-popup"),QA_EVIDENCE_DIR=str(case),CORE_POPUP_DIAG_OUT=str(obs),WH_PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe")
  args=["C:/Program Files/nodejs/node.exe","--import",(OUT/"RECIPES/core-popup-observer.mjs").as_uri(),"v2/core-reader-browser-qa.mjs"]
  start=time.monotonic();print(f"START {side}-{n}",flush=True)
  with (case/"stdout.log").open("w",encoding="utf-8") as log:
   process=subprocess.Popen(args,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT,text=True)
   while process.poll() is None:
    try: process.wait(timeout=30)
    except subprocess.TimeoutExpired: print(f"RUNNING {side}-{n} {time.monotonic()-start:.1f}s",flush=True)
  row={"side":side,"repetition":n,"exitCode":process.returncode,"status":"PASS" if process.returncode==0 else "FAIL","elapsedMs":round((time.monotonic()-start)*1000),"sha":git(root,"rev-parse","HEAD"),"log":str(case/"stdout.log"),"observer":str(obs)}
  report["runs"].append(row);save();print(json.dumps(row),flush=True)
report["status"]="COMPLETE";report["counts"]={side:{status:sum(r["side"]==side and r["status"]==status for r in report["runs"]) for status in ["PASS","FAIL"]} for side in roots};save();print(json.dumps(report["counts"]),flush=True)
