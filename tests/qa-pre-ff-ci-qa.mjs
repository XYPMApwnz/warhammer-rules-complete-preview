/** CI setup, privacy and cross-platform identity controls; no application fixtures. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createQaTempDir,cleanupQaTempDir} from './helpers/qa-temp.mjs';
import {projectResults,normalizeJob,markdownReport,safeFailureDiagnostic} from '../tools/qa-pre-ff-ci.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const workflow=fs.readFileSync(path.join(root,'.github/workflows/qa-pre-ff.yml'),'utf8').replace(/\r\n?/g,'\n');
const checks=[];
function control(name,operation){operation();checks.push(name);}
function workflowContract(text){
 assert.match(text,/on:\s*\n  workflow_dispatch:/);
 assert.doesNotMatch(text,/^  (?:push|pull_request|schedule|repository_dispatch):/m);
 assert.match(text,/permissions:\s*\n  contents: read/);
 assert.doesNotMatch(text,/contents: write|actions: write|pages: write/);
 const steps=text.split(/^      - /m),secretSteps=steps.filter(step=>step.includes('secrets.'));
 assert.equal(secretSteps.length,1,'Exactly one secret-scoped preparation step');
 assert(secretSteps[0].startsWith('name: Prepare authenticated BSData from private mirror\n'));
 for(const step of steps)if(step!==secretSteps[0])assert.doesNotMatch(step,/BSDATA_MIRROR_SSH_KEY/);
 assert.deepEqual([...text.matchAll(/secrets\.([A-Za-z0-9_]+)/g)].map(match=>match[1]),['BSDATA_MIRROR_SSH_KEY']);
 assert.match(secretSteps[0],/env:\s*\n          BSDATA_MIRROR_SSH_KEY: \$\{\{ secrets\.BSDATA_MIRROR_SSH_KEY \}\}/);
 assert.match(secretSteps[0],/node \.\.\/orchestration\/tools\/prepare-ci-bsdata\.mjs --source="\$PWD" > "\$RUNNER_TEMP\/bsdata-prepare.log" 2>&1/);
 assert.doesNotMatch(text.split('    steps:')[0],/BSDATA_MIRROR_SSH_KEY|secrets\./);
 assert.match(text,/runs-on: ubuntu-latest/);assert.match(text,/timeout-minutes: 300/);
 assert.match(text,/group: pre-ff-\$\{\{ inputs.ref \}\}/);assert.match(text,/cancel-in-progress: false/);
 assert.match(text,/fetch-depth: 0/);assert.match(text,/node-version: '24'/);assert.match(text,/python-version: '3.12'/);
 const requirements=['npm ci >','python -m pip install','python -B ../orchestration/tests/parser-independent-source-qa.py','npx playwright install --with-deps chromium','node ../orchestration/tests/ci-bsdata-transport-qa.mjs','node ../orchestration/tools/prepare-ci-bsdata.mjs','npm run qa:pre-ff -- --out='];
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
control('missing-parser-source-controls-is-rejected',()=>assert.throws(()=>workflowContract(workflow.replace('python -B ../orchestration/tests/parser-independent-source-qa.py','echo parser control removed'))));
control('publishing-raw-output-is-rejected',()=>assert.throws(()=>workflowContract(workflow.replace('pre-ff-report/RESULTS.json','pre-ff-raw/RESULTS.json'))));
control('push-trigger-is-rejected',()=>assert.throws(()=>workflowContract(workflow.replace('  workflow_dispatch:','  push:\n  workflow_dispatch:'))));
control('secret-in-any-other-step-is-rejected',()=>assert.throws(()=>workflowContract(workflow.replace('      - name: Run complete sequential pre-FF','      - name: Unexpected secret use\n        env:\n          BSDATA_MIRROR_SSH_KEY: ${{ secrets.BSDATA_MIRROR_SSH_KEY }}\n        run: echo forbidden\n      - name: Run complete sequential pre-FF'))));
control('unapproved-secret-name-is-rejected',()=>assert.throws(()=>workflowContract(workflow.replaceAll('secrets.BSDATA_MIRROR_SSH_KEY','secrets.UNAPPROVED_SECRET'))));
control('credential-identifier-cannot-be-forwarded-to-queue-step',()=>assert.throws(()=>workflowContract(workflow.replace('      - name: Run complete sequential pre-FF','      - name: Unexpected credential forwarding\n        env:\n          BSDATA_MIRROR_SSH_KEY: ${{ env.BSDATA_MIRROR_SSH_KEY }}\n        run: echo forbidden\n      - name: Run complete sequential pre-FF'))));
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
const privateCanaries=['owner@example.invalid','RAW_CAPTURE_CANARY','PRIVATE_SOURCE_SENTENCE','PRIVATE_KEY_CANARY','/home/private-runner/secret','C:\\private-runner\\secret'];
const privateBody=privateCanaries.join(' ');
const safeStack='    at '+pathToFileURL(path.join(checkout,'tests/example-qa.mjs')).href+':42:7';
const noPrivateBody=value=>{const body=typeof value==='string'?value:JSON.stringify(value);for(const canary of [...privateCanaries,checkout]){assert(!body.includes(canary));assert(!body.includes(JSON.stringify(canary).slice(1,-1)));}};
control('assertion-diagnostic-keeps-only-class-tag-and-relative-stack-position',()=>{
 const diagnostic=safeFailureDiagnostic({sourceFiles:[plan[0].id],text:'AssertionError [ERR_ASSERTION]: '+privateBody+'\n'+safeStack,root:checkout,exitCode:1});
 assert.equal(diagnostic.errorClass,'AssertionError');assert.equal(diagnostic.cause,'ASSERTION_FAILED');
 assert.equal(diagnostic.firstLine,'AssertionError: assertion failed; private comparison values redacted.');
 assert.deepEqual(diagnostic.location,{file:'tests/example-qa.mjs',line:42,column:7});noPrivateBody(diagnostic);
});
control('unknown-error-name-and-source-body-are-conservatively-redacted',()=>{
 const diagnostic=safeFailureDiagnostic({sourceFiles:[plan[0].id],text:'PRIVATE_KEY_CANARY: '+privateBody,error:privateBody,root:checkout,exitCode:1});
 assert.equal(diagnostic.errorClass,'UnknownError');assert.equal(diagnostic.cause,'PROCESS_EXIT');
 assert.equal(diagnostic.firstLine,'UnknownError: process exited with code 1; private details redacted.');noPrivateBody(diagnostic);
});
control('standard-assertion-first-line-is-allowlisted-without-comparison-body',()=>{
 const diagnostic=safeFailureDiagnostic({text:'AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:\n'+privateBody,root:checkout,exitCode:1});
 assert.equal(diagnostic.errorClass,'AssertionError');assert.equal(diagnostic.cause,'ASSERTION_DEEP_EQUAL');
 assert.equal(diagnostic.firstLine,'AssertionError: expected values to be strictly deep-equal; private comparison values redacted.');noPrivateBody(diagnostic);
 const poisoned=safeFailureDiagnostic({text:'AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal: '+privateBody,root:checkout,exitCode:1});
 assert.equal(poisoned.cause,'ASSERTION_FAILED');noPrivateBody(poisoned);
});
control('timeout-and-module-errors-get-useful-fixed-safe-first-lines',()=>{
 const timeout=safeFailureDiagnostic({text:'TimeoutError: locator.waitFor: '+privateBody,root:checkout,exitCode:1});
 const module=safeFailureDiagnostic({text:'Error [ERR_MODULE_NOT_FOUND]: '+privateBody,root:checkout,exitCode:1});
 assert.equal(timeout.errorClass,'TimeoutError');assert.equal(timeout.cause,'TIMEOUT');
 assert.equal(module.errorClass,'Error');assert.equal(module.cause,'MODULE_UNAVAILABLE');
 assert(module.firstLine.includes('ERR_MODULE_NOT_FOUND'));noPrivateBody([timeout,module]);
});
control('spawn-system-errors-and-signals-use-only-allowlisted-tags',()=>{
 const system=safeFailureDiagnostic({error:'spawn '+privateBody+' ENOENT',root:checkout,exitCode:null});
 const killed=safeFailureDiagnostic({text:privateBody,signal:'SIGKILL',root:checkout,exitCode:null});
 assert.equal(system.errorClass,'SystemError');assert.equal(system.cause,'SYSTEM_ENOENT');
 assert.equal(killed.errorClass,'ProcessError');assert.equal(killed.cause,'PROCESS_SIGNAL');assert(killed.firstLine.includes('SIGKILL'));
 noPrivateBody([system,killed]);
});
control('first-line-is-bounded-and-never-copies-comparison-or-secret-values',()=>{
 for(const errorClass of ['AssertionError','TypeError','ReferenceError','SyntaxError','RangeError','TimeoutError','Error']){
  const diagnostic=safeFailureDiagnostic({sourceFiles:[plan[0].id],text:errorClass+': '+privateBody.repeat(1000),root:checkout,exitCode:1});
  assert(diagnostic.firstLine.length<=200);assert(!diagnostic.firstLine.includes('\n'));noPrivateBody(diagnostic);
 }
});
control('external-traversal-raw-and-private-stack-paths-are-not-published',()=>{
 for(const stack of ['    at /home/private-runner/secret:5:6','    at C:\\private-runner\\secret:5:6','    at '+pathToFileURL(path.join(checkout,'books/death-guard/sources/private.html')).href+':5:6','    at '+pathToFileURL(path.join(checkout,'../private/example.mjs')).href+':5:6','    at '+pathToFileURL(path.join(checkout,'tools/PRIVATE_KEY_CANARY.mjs')).href+':5:6']){
  const diagnostic=safeFailureDiagnostic({sourceFiles:[plan[0].id],text:'Error: '+privateBody+'\n'+stack,root:checkout,exitCode:1});
  assert(!Object.hasOwn(diagnostic,'location'));noPrivateBody(diagnostic);
 }
});
control('failed-job-publishes-safe-diagnostic-in-both-report-formats',()=>{
 const failed=structuredClone(raw);failed.results[0].status='FAIL';failed.results[0].exitCode=1;
 const {result}=projectResults({...input,raw:failed,outcome:'failure',failureLogs:['AssertionError [ERR_ASSERTION]: '+privateBody+'\n'+safeStack]});
 assert.equal(result.jobs[0].diagnostic.errorClass,'AssertionError');assert(markdownReport(result).includes('tests/example-qa.mjs:42:7'));
 noPrivateBody(result);noPrivateBody(markdownReport(result));
 assert(!Object.hasOwn(result.jobs[1],'diagnostic'),'Passing jobs do not receive invented failure diagnoses');
});
control('python-ValueError-keeps-class-and-allowlisted-line-without-private-body',()=>{
 const file='tools/example.py',location=path.join(checkout,file);
 const text='Traceback (most recent call last):\n  File "'+location+'", line 51, in private_function\n    '+privateBody+'\nValueError: '+privateBody;
 const diagnostic=safeFailureDiagnostic({text,root:checkout,sourceFiles:[file],exitCode:1});
 assert.equal(diagnostic.errorClass,'ValueError');assert.equal(diagnostic.firstLine,'ValueError: error message redacted.');
 assert.equal(diagnostic.messageRedacted,true);assert.deepEqual(diagnostic.location,{file,line:51});
 assert(diagnostic.firstLine.length<=200);noPrivateBody(diagnostic);assert(!JSON.stringify(diagnostic).includes('private_function'));
 const unlisted=safeFailureDiagnostic({text,root:checkout,sourceFiles:[],exitCode:1});
 assert.equal(unlisted.errorClass,'ValueError');assert(!Object.hasOwn(unlisted,'location'));noPrivateBody(unlisted);
});
control('python-fixed-builtin-error-classes-retain-only-safe-bounded-diagnostics',()=>{
 for(const errorClass of ['ValueError','KeyError','RuntimeError','ImportError','ModuleNotFoundError','FileNotFoundError','PermissionError','OSError','AttributeError','IndexError','MemoryError','UnicodeDecodeError','UnicodeEncodeError','UnicodeTranslateError','NotImplementedError','ZeroDivisionError','EOFError','RecursionError']){
  const diagnostic=safeFailureDiagnostic({text:errorClass+': '+privateBody.repeat(1000),root:checkout,exitCode:1});
  assert.equal(diagnostic.errorClass,errorClass);assert.equal(diagnostic.messageRedacted,true);
  assert(diagnostic.firstLine.length<=200);assert(!diagnostic.firstLine.includes('\n'));noPrivateBody(diagnostic);
 }
});
control('chained-python-error-uses-final-allowlisted-class-and-latest-traceback',()=>{
 const file='tools/example.py',location=path.join(checkout,file);
 const text='Traceback (most recent call last):\n  File "'+location+'", line 4\nValueError: '+privateBody+'\nDuring handling of the above exception, another exception occurred:\nTraceback (most recent call last):\n  File "'+location+'", line 71, in private_function\nRuntimeError: '+privateBody;
 const diagnostic=safeFailureDiagnostic({text,root:checkout,sourceFiles:[file],exitCode:1});
 assert.equal(diagnostic.errorClass,'RuntimeError');assert.deepEqual(diagnostic.location,{file,line:71});assert.equal(diagnostic.messageRedacted,true);noPrivateBody(diagnostic);
});
control('markdown-python-line-location-never-invents-an-undefined-column',()=>{
 const failed=structuredClone(raw);failed.results[0].status='FAIL';failed.results[0].exitCode=1;
 const {result}=projectResults({...input,raw:failed,outcome:'failure'});
 result.jobs[0].diagnostic=safeFailureDiagnostic({text:'Traceback (most recent call last):\n  File "'+path.join(checkout,'tools/example.py')+'", line 51\nValueError: '+privateBody,root:checkout,sourceFiles:['tools/example.py'],exitCode:1});
 const markdown=markdownReport(result);assert(markdown.includes('tools/example.py:51'));assert(!markdown.includes('undefined'));noPrivateBody(markdown);
});
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
 control('CLI-uses-only-bounded-expected-job-log-not-untrusted-row-path',()=>{
  const rawDir=path.join(arena,'failed-raw'),outDir=path.join(arena,'failed-public');fs.mkdirSync(rawDir);
  const foreign=path.join(arena,'private-log');fs.writeFileSync(foreign,'TypeError: '+privateBody);
  const expectedLog='01-git_diff_--check.log';
  fs.writeFileSync(path.join(rawDir,expectedLog),privateBody.repeat(1000)+'\nAssertionError [ERR_ASSERTION]: '+privateBody+'\n'+safeStack+'\n');
  const job={id:'git diff --check',command:'git',args:['diff','--check'],status:'FAIL',exitCode:1,elapsedMs:5,log:foreign,error:privateBody};
  fs.writeFileSync(path.join(rawDir,'RESULTS.json'),JSON.stringify({mode:'pre-ff',root:checkout,elapsedMs:5,results:[job]}));
  const cli=spawnSync(process.execPath,[path.join(root,'tools/qa-pre-ff-ci.mjs'),'report','--source='+checkout,'--raw='+rawDir,'--out='+outDir,'--outcome=failure'],{encoding:'utf8'});
  assert.equal(cli.status,1);assert.deepEqual(fs.readdirSync(outDir).sort(),['JOB_PLAN.json','REPORT.md','RESULTS.json']);
  const result=JSON.parse(fs.readFileSync(path.join(outDir,'RESULTS.json'),'utf8'));
  assert.equal(result.jobs[0].diagnostic.errorClass,'AssertionError');assert(!Object.hasOwn(result.jobs[0].diagnostic,'location'),'A Git-only result cannot publish a filename absent from its canonical partial plan');
  const published=fs.readdirSync(outDir).map(file=>fs.readFileSync(path.join(outDir,file),'utf8')).join('');noPrivateBody(published);noPrivateBody(cli.stdout+cli.stderr);
 });
 control('CLI-malformed-private-input-produces-explicitly-redacted-safe-fallback',()=>{
  const rawDir=path.join(arena,'malformed-raw'),outDir=path.join(arena,'malformed-public');fs.mkdirSync(rawDir);
  fs.writeFileSync(path.join(rawDir,'RESULTS.json'),'<html>'+privateBody+'</html>');
  const cli=spawnSync(process.execPath,[path.join(root,'tools/qa-pre-ff-ci.mjs'),'report','--source='+checkout,'--raw='+rawDir,'--out='+outDir,'--outcome=failure'],{encoding:'utf8'});
  assert.equal(cli.status,1);assert.deepEqual(fs.readdirSync(outDir).sort(),['JOB_PLAN.json','REPORT.md','RESULTS.json']);
  const result=JSON.parse(fs.readFileSync(path.join(outDir,'RESULTS.json'),'utf8'));
  assert.equal(result.diagnostic.errorClass,'ReportError');assert.equal(result.diagnostic.messageRedacted,true);assert(result.diagnostic.firstLine.length<=200);
  const published=fs.readdirSync(outDir).map(file=>fs.readFileSync(path.join(outDir,file),'utf8')).join('');noPrivateBody(published);noPrivateBody(cli.stdout+cli.stderr);
 });
}finally{cleanupQaTempDir(arena);}
console.log(JSON.stringify({status:'PASS',checks:checks.length,controls:checks}));
