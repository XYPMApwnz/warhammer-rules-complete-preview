/** CI setup, privacy and cross-platform identity controls; no application fixtures. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createQaTempDir,cleanupQaTempDir} from './helpers/qa-temp.mjs';
import {projectResults,normalizeJob,markdownReport} from '../tools/qa-pre-ff-ci.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const workflow=fs.readFileSync(path.join(root,'.github/workflows/qa-pre-ff.yml'),'utf8').replace(/\r\n?/g,'\n');
const checks=[];
function control(name,operation){operation();checks.push(name);}
function workflowContract(text){
 assert.match(text,/on:\s*\n  workflow_dispatch:/);
 assert.doesNotMatch(text,/^  (?:push|pull_request|schedule|repository_dispatch):/m);
 assert.match(text,/permissions:\s*\n  contents: read/);
 assert.doesNotMatch(text,/secrets\.|contents: write|actions: write|pages: write/);
 assert.match(text,/runs-on: ubuntu-latest/);assert.match(text,/timeout-minutes: 300/);
 assert.match(text,/group: pre-ff-\$\{\{ inputs.ref \}\}/);assert.match(text,/cancel-in-progress: false/);
 assert.match(text,/fetch-depth: 0/);assert.match(text,/node-version: '24'/);assert.match(text,/python-version: '3.12'/);
 const requirements=['npm ci >','python -m pip install','npx playwright install --with-deps chromium','npm run qa:sm:prepare-bsdata','npm run qa:pre-ff -- --out='];
 let previous=-1;for(const item of requirements){const position=text.indexOf(item);assert(position>previous,'Required sequential preparation: '+item);previous=position;}
 assert.match(text,/WH_PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH/);assert.match(text,/PLAYWRIGHT_CHROMIUM_EXECUTABLE/);
 assert.match(text,/QA_PYTHON=/);assert.match(text,/PYTHON=/);
 assert.match(text,/npm run qa:pre-ff[^\n]+> "\$RUNNER_TEMP\/pre-ff-console.log" 2>&1/);
 assert.doesNotMatch(text,/\btee\b|cat .*pre-ff-console|path: .*pre-ff-raw/);
 assert.match(text,/Export safe report and step summary\n        if: \$\{\{ always\(\) \}\}/);
 assert.match(text,/Upload report only, including failures\n        if: \$\{\{ always\(\) \}\}/);
 assert.match(text,/retention-days: 30/);
 const upload=text.slice(text.indexOf('      - name: Upload report'));
 assert.deepEqual([...upload.matchAll(/\$\{\{ runner.temp \}\}\/pre-ff-report\/([^\s]+)/g)].map(match=>match[1]),['REPORT.md','RESULTS.json','JOB_PLAN.json']);
}
control('manual-only-read-only-setup-summary-and-allowlisted-artifact',()=>workflowContract(workflow));
control('missing-locked-install-is-rejected',()=>assert.throws(()=>workflowContract(workflow.replace('npm ci >','npm install >'))));
control('publishing-raw-output-is-rejected',()=>assert.throws(()=>workflowContract(workflow.replace('pre-ff-report/RESULTS.json','pre-ff-raw/RESULTS.json'))));
control('push-trigger-is-rejected',()=>assert.throws(()=>workflowContract(workflow.replace('  workflow_dispatch:','  push:\n  workflow_dispatch:'))));
const checkout=path.resolve(root),sha='a'.repeat(40);
const plan=[{command:process.execPath,id:'tests/example-qa.mjs',args:['tests/example-qa.mjs','--fixtures=v2/fixtures/accepted.json']},
 {command:process.execPath,id:'tests/source-book-clone-qa.mjs',args:['tests/source-book-clone-qa.mjs','--root='+checkout]},
 {command:process.execPath,id:'tools/pages-runtime-package.mjs',args:['tools/pages-runtime-package.mjs','--source',checkout,'--out',path.resolve(checkout,'../qa-plan-work/runtime')]}];
const raw={mode:'pre-ff',root:checkout,elapsedMs:123,results:plan.map(job=>({...job,status:'PASS',exitCode:0,elapsedMs:41,log:'PRIVATE_PATH',error:'owner@example.invalid <html>RAW_CAPTURE_CANARY</html>'}))};
const input={plan,raw,root:checkout,sha,outcome:'success',platform:'linux'};
control('complete-public-report-keeps-exact-plan-and-numbers',()=>{
 const {plan:canonical,result}=projectResults(input);assert.equal(result.status,'PASS');assert.equal(result.total,3);assert.equal(result.passed,3);assert.equal(result.elapsedMs,123);
 assert.equal(canonical[1].args[1],'--root=<REPO>');assert.equal(canonical[2].args[4],'<QA_WORK>/runtime');
 assert.equal(canonical[0].args[1],'--fixtures=v2/fixtures/accepted.json');
});
control('raw-capture-email-error-and-log-path-never-leave-projection',()=>{
 const {result}=projectResults(input),published=JSON.stringify(result)+markdownReport(result);
 for(const privateValue of ['owner@example.invalid','RAW_CAPTURE_CANARY','PRIVATE_PATH','<html>'])assert(!published.includes(privateValue));
});
control('different-fixture-is-a-different-job',()=>{
 const changed=structuredClone(raw);changed.results[0].args[1]='--fixtures=v2/fixtures/other.json';assert.throws(()=>projectResults({...input,raw:changed}),/JOB_PLAN_MISMATCH/);
});
control('missing-result-is-failure-with-unfinished-job-count',()=>{
 const partial=structuredClone(raw);partial.results.pop();const {result}=projectResults({...input,raw:partial});assert.equal(result.status,'FAIL');assert.equal(result.missing,1);
});
control('nonzero-exit-and-failed-job-are-published-without-error-text',()=>{
 const failed=structuredClone(raw);failed.results[0].status='FAIL';failed.results[0].exitCode=1;const {result}=projectResults({...input,raw:failed,outcome:'failure'});assert.equal(result.failed,1);assert.equal(result.status,'FAIL');assert(markdownReport(result).includes('tests/example-qa.mjs'));
});
control('pass-with-nonzero-exit-is-rejected',()=>{const changed=structuredClone(raw);changed.results[0].exitCode=1;assert.throws(()=>projectResults({...input,raw:changed}),/INVALID_JOB_STATUS/);});
control('all-pass-results-with-failed-step-are-still-failure',()=>assert.equal(projectResults({...input,outcome:'failure'}).result.status,'FAIL'));
control('missing-raw-output-is-reported-without-invented-passes',()=>{const {result}=projectResults({...input,raw:null,outcome:'skipped'});assert.equal(result.status,'FAIL');assert.equal(result.passed,0);assert.equal(result.missing,3);});
control('only-known-work-slots-normalize-and-extra-package-args-fail',()=>assert.throws(()=>normalizeJob({...plan[2],args:[...plan[2].args,'--check']},checkout),/INVALID_PACKAGE_ARGS/));
control('arbitrary-text-in-public-job-arguments-is-rejected',()=>assert.throws(()=>normalizeJob({...plan[0],args:[plan[0].id,'<html>RAW</html>']},checkout),/UNSAFE_PUBLIC_ARG/));
const arena=createQaTempDir('wh-pre-ff-ci-controls-');
try{
 control('CLI-incomplete-results-exits-nonzero-and-uploads-no-private-fields',()=>{
  const rawDir=path.join(arena,'raw'),outDir=path.join(arena,'public');fs.mkdirSync(rawDir);
  fs.writeFileSync(path.join(rawDir,'RESULTS.json'),JSON.stringify({mode:'pre-ff',root:checkout,elapsedMs:5,results:[],error:'owner@example.invalid <html>RAW_CAPTURE_CANARY</html>'}));
  const cli=spawnSync(process.execPath,[path.join(root,'tools/qa-pre-ff-ci.mjs'),'report','--source='+checkout,'--raw='+rawDir,'--out='+outDir,'--outcome=success'],{encoding:'utf8'});
  assert.equal(cli.status,1);assert.deepEqual(fs.readdirSync(outDir).sort(),['JOB_PLAN.json','REPORT.md','RESULTS.json']);
  const published=fs.readdirSync(outDir).map(file=>fs.readFileSync(path.join(outDir,file),'utf8')).join('');
  for(const value of ['owner@example.invalid','RAW_CAPTURE_CANARY'])assert(!published.includes(value));
  assert.equal(JSON.parse(fs.readFileSync(path.join(outDir,'RESULTS.json'))).status,'FAIL');
 });
 control('CLI-checkout-failure-still-produces-fixed-safe-failure-artifact',()=>{
  const source=path.join(arena,'not-a-checkout'),outDir=path.join(arena,'fallback');fs.mkdirSync(source);
  const cli=spawnSync(process.execPath,[path.join(root,'tools/qa-pre-ff-ci.mjs'),'report','--source='+source,'--raw='+arena,'--out='+outDir,'--outcome=skipped'],{encoding:'utf8'});
  assert.equal(cli.status,1);assert.deepEqual(fs.readdirSync(outDir).sort(),['JOB_PLAN.json','REPORT.md','RESULTS.json']);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(outDir,'RESULTS.json'))).problems,['REPORT_UNAVAILABLE']);
 });
}finally{cleanupQaTempDir(arena);}
console.log(JSON.stringify({status:'PASS',checks:checks.length,controls:checks}));
