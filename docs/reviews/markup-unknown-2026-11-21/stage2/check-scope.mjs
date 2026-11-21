import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {generatedRebuildPlan} from 'file:///E:/Warhammer/worktrees/markup-unknown-v1/books/shared/tools/generated-rebuild-plan.mjs';
const root='E:/Warhammer/worktrees/markup-unknown-v1',baseRoot='E:/Warhammer/qa-tmp/markup-unknown/base',out='E:/Warhammer/qa-evidence/markup-unknown-v1-2026-11-21/stage2',base='6f2e5fb23643fc0041efcd7006f3e150bd5ce4be';
const git=(...args)=>execFileSync('git',args,{cwd:root,maxBuffer:128*1024*1024});
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
assert.equal(git('status','--porcelain').toString().trim(),'');
const plan=generatedRebuildPlan(git('ls-files').toString().trim().split(/\r?\n/),{root});
const compare=names=>names.map(file=>{const before=git('show',base+':'+file),after=fs.readFileSync(path.join(root,file));return {file,bytes:after.length,sha256:hash(after),identical:before.equals(after)};});
const generated=compare(plan.files);assert(generated.every(row=>row.identical),'Generated difference forbidden');
const manifest=JSON.parse(fs.readFileSync(root+'/tools/pages-runtime-manifest.json'));
const runtime=compare(manifest.files.map(row=>row.path));assert(runtime.every(row=>row.identical),'Published runtime difference forbidden');
const parseBase=file=>JSON.parse(git('show',base+':tools/markup-census/'+file+'.v1.json'));
const parseHead=file=>JSON.parse(fs.readFileSync(root+'/tools/markup-census/'+file+'.v1.json'));
const oldDecisions=parseBase('decisions'),decisions=parseHead('decisions'),oldMap=new Map(oldDecisions.records.map(row=>[row.book+'\0'+row.id,row]));
const changed=decisions.records.filter(row=>JSON.stringify(row)!==JSON.stringify(oldMap.get(row.book+'\0'+row.id)));
assert.equal(changed.length,156);assert(changed.every(row=>row.category==='TEXT_ONLY_INTENDED'));
for(const row of changed){const before=structuredClone(oldMap.get(row.book+'\0'+row.id)),after=structuredClone(row);for(const field of ['category','reason','evidence','presentationScope'])delete before[field],delete after[field];assert.deepEqual(after,before);}
const oldDebt=new Map(parseBase('debt').records.map(row=>[row.book+'\0'+row.id,row]));
for(const row of parseHead('debt').records)assert.deepEqual(row,oldDebt.get(row.book+'\0'+row.id));
assert.equal(parseHead('debt').records.length,15);assert(git('show',base+':tools/markup-census/debt-baseline.v1.json').equals(fs.readFileSync(root+'/tools/markup-census/debt-baseline.v1.json')));
const paths=git('diff','--name-only',base,'HEAD').toString().trim().split(/\r?\n/);
const oldTests=paths.filter(file=>/^(tests|v2)\//.test(file)&&file!=='tests/markup-unknown-qa.mjs');assert.deepEqual(oldTests,[]);
const beforePlan=JSON.parse(execFileSync(process.execPath,['tools/qa-queue.mjs','pre-ff','--list'],{cwd:baseRoot,encoding:'utf8',maxBuffer:16*1024*1024}));
const afterPlan=JSON.parse(execFileSync(process.execPath,['tools/qa-queue.mjs','pre-ff','--list'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024}));
const normalize=value=>JSON.parse(JSON.stringify(value).replaceAll(baseRoot,root).replaceAll(baseRoot.replaceAll('/','\\').replaceAll('\\','\\\\'),root.replaceAll('/','\\').replaceAll('\\','\\\\')));
assert.deepEqual(afterPlan.filter(job=>job.id!=='tests/markup-unknown-qa.mjs'),normalize(beforePlan));assert.equal(afterPlan.length,beforePlan.length+1);
const result={status:'PASS',baseSha:base,headSha:git('rev-parse','HEAD').toString().trim(),generated:{files:generated.length,identical:generated.length,changed:[]},runtime:{files:runtime.length,identical:runtime.length,changed:[]},
 changedDecisionRows:156,onlyDecisionMetadataChanged:true,retainedHistoricalDebtRows:15,historicalBaselineBytesUnchanged:true,oldTestsChanged:oldTests,
 queue:{before:beforePlan.length,after:afterPlan.length,oldJobsAndOrderIdentical:true,added:'tests/markup-unknown-qa.mjs'},noNewStartupFiles:true,precacheUnchanged:true,generatedFiles:generated,runtimeFiles:runtime};
fs.writeFileSync(out+'/SCOPE_EQUALITY.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:result.status,generated:result.generated,runtime:result.runtime,queue:result.queue}));
