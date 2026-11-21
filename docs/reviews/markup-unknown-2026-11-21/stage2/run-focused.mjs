import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const root='E:/Warhammer/worktrees/markup-unknown-v1',out='E:/Warhammer/qa-evidence/markup-unknown-v1-2026-11-21/stage2';
const jobs=[['unknown-review',['tests/markup-unknown-qa.mjs']],['census',['tools/markup-census.mjs','--check','--report='+out+'/CENSUS_AFTER.json']],
 ['existing-census',['tests/markup-census-qa.mjs']],['existing-evidence',['tests/markup-evidence-qa.mjs']],['existing-owner-only',['tests/markup-owner-only-qa.mjs']]];
const results=[];fs.mkdirSync(out+'/focused',{recursive:true});
for(const [id,args] of jobs){const start=Date.now(),p=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',maxBuffer:24*1024*1024,env:{...process.env,QA_TMP_ROOT:'E:/Warhammer/qa-tmp/markup-unknown',QA_SKIP_TMP_SWEEP:'1'}});
 fs.writeFileSync(out+'/focused/'+id+'.log',(p.stdout||'')+(p.stderr||''));const row={id,command:['node',...args],status:p.status===0?'PASS':'FAIL',elapsedMs:Date.now()-start,exitCode:p.status,error:p.error?.message};results.push(row);
 fs.writeFileSync(out+'/focused/RESULTS.json',JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(row));
 if(p.status!==0){console.log((p.stderr||p.stdout||'').slice(-6000));process.exitCode=1;break;}
}
