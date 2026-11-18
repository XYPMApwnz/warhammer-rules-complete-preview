import fs from 'node:fs';
import path from 'node:path';
import {spawnSync,execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const option=name=>process.argv.find(arg=>arg.startsWith(name+'='))?.slice(name.length+1);
const root=option('--root')||'E:/Warhammer/worktrees/roster-navigation-v1',base='E:/Warhammer/worktrees/rule-popups-v1';
const out=option('--out');assert(out&&!fs.existsSync(out),'Fresh external --out is required');fs.mkdirSync(out,{recursive:true});
const accepted='E:/Warhammer/qa-evidence/rule-popups-v1-2026-11-17/revision-2-proof/native-ab-final';
const recipes='E:/Warhammer/qa-evidence/card-polish-2-v1-2026-11-14/RECIPES',baseSha='c477d20aaa16f850b56f18aa878d6b5fb8b4057f';
const git=(dir,...args)=>execFileSync('git',args,{cwd:dir,encoding:'utf8'}).trim();
assert.equal(git(base,'rev-parse','HEAD'),baseSha);assert.equal(git(base,'status','--porcelain'),'');assert.equal(git(root,'status','--porcelain'),'');
const sha=git(root,'rev-parse','HEAD'),tracked=git(root,'ls-tree','-r','--name-only','HEAD').split('\n');
const {generatedRebuildPlan}=await import(pathToFileURL(path.join(root,'books/shared/tools/generated-rebuild-plan.mjs')));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const rows=generatedRebuildPlan(tracked,{root}).files.map(file=>{const a=fs.readFileSync(path.join(base,file)),b=fs.readFileSync(path.join(root,file));
  return {file,beforeBytes:a.length,afterBytes:b.length,beforeSha256:hash(a),afterSha256:hash(b),identical:a.equals(b)};});
fs.writeFileSync(path.join(out,'GENERATED_BASE_BYTES.json'),JSON.stringify({sha,baseSha,status:rows.every(row=>row.identical)?'PASS':'STOP',files:rows.length,rows},null,2)+'\n');
assert(rows.every(row=>row.identical),'STOP: generated differs from the accepted task base');
const results=[];
for(const kind of ['native','generated-gameplay']){
  const before=path.join(accepted,kind+'-head'),manifest=JSON.parse(fs.readFileSync(path.join(before,'MANIFEST.json')));
  assert.equal(manifest.sha,baseSha);assert.equal(manifest.status,'PASS');
  if(kind==='native'){assert.equal(manifest.counts.cases,199);assert.equal(manifest.counts.frames,507);}
  const capture=path.join(out,kind+'-head'),started=Date.now(),log=fs.openSync(path.join(out,kind+'-capture.log'),'wx');
  const run=spawnSync(process.execPath,[path.join(recipes,'capture-'+kind+'.mjs'),'--root='+root,'--out='+capture],{cwd:root,
    env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',QA_TMP_ROOT:'E:/Warhammer/qa-tmp/roster-navigation'},stdio:['ignore',log,log]});fs.closeSync(log);assert.equal(run.status,0,kind+' capture');
  const fd=fs.openSync(path.join(out,kind+'-compare.log'),'wx');
  const comparison=spawnSync(process.execPath,[path.join(recipes,'compare-exact-captures.mjs'),'--before='+before,'--after='+capture,'--out='+path.join(out,kind+'-compare')],{cwd:root,stdio:['ignore',fd,fd]});fs.closeSync(fd);
  assert.equal(comparison.status,0,'STOP: gameplay A/B differs');
  results.push({kind,status:'PASS',elapsedMs:Date.now()-started,accepted:before});
  fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({sha,baseSha,generatedFiles:rows.length,results},null,2)+'\n');console.log(JSON.stringify(results.at(-1)));
}
