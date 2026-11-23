/** Fixed-schema public telemetry and filtered-report negative controls. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createQaTempDir,cleanupQaTempDir} from './helpers/qa-temp.mjs';
import {publicEvent,safeCurrentJob,jsonDifferencePaths,jsonDifferenceSummary,browserLaunchDetails} from '../tools/qa-ci-progress.mjs';
import {exportReport} from '../tools/qa-pre-ff-ci.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const plan=[{command:'node',id:'tests/example-qa.mjs',args:['tests/example-qa.mjs']}];
const start={schema:'qa-job-progress/v1',index:1,ordinal:1,total:1,selectedTotal:1,id:plan[0].id,elapsedMs:0,elapsedSeconds:0,event:'START'};
let controls=0;
const check=(name,fn)=>{fn();controls++;console.log('PASS '+name);};
check('CI-caches-only-rebuildable-locked-downloads',()=>{
 const workflow=fs.readFileSync(path.join(root,'.github/workflows/qa-pre-ff.yml'),'utf8');
 assert.match(workflow,/cache: npm\s+cache-dependency-path: source\/package-lock.json/);
 const cache=workflow.split('      - name: Restore locked Playwright browser binaries')[1]?.split('      - name:')[0];
 assert(cache);assert.match(cache,/path: ~\/\.cache\/ms-playwright/);
 assert(cache.includes("key: playwright-${{ runner.os }}-${{ runner.arch }}-${{ hashFiles('source/package-lock.json') }}"));
 assert.doesNotMatch(cache,/restore-keys|node_modules|qa-tmp|bsdata|profiles|artifacts/);
 assert.match(workflow,/npx playwright install --with-deps chromium/,'System dependencies and locked install still execute after a cache hit');
});
check('safe-start-and-end-lines',()=>{
 assert.equal(publicEvent(start,plan,[1]),'START tests/example-qa.mjs 0.000');
 for(const status of ['PASS','FAIL','TIMEOUT'])assert.equal(publicEvent({...start,event:'END',elapsedMs:1250,elapsedSeconds:1,status},plan,[1]),'END tests/example-qa.mjs 1.250 '+status);
});
for(const [key,value]of Object.entries({id:'owner@example.invalid',index:2,ordinal:2,total:213,selectedTotal:213,elapsedMs:-1,elapsedSeconds:4,event:'PRIVATE'})){
 check('reject-injected-'+key,()=>assert.throws(()=>publicEvent({...start,[key]:value},plan,[1])));
}
check('arbitrary-private-progress-field-rejected',()=>assert.throws(()=>publicEvent({...start,raw:'PRIVATE_CAPTURE'},plan,[1])));
check('invalid-end-status-rejected',()=>assert.throws(()=>publicEvent({...start,event:'END',status:'PRIVATE_CAPTURE'},plan,[1])));
check('marker-projection-omits-PID-path-and-private-fields',()=>{
 const row={...start,phase:'cleanup',childPid:123,private:'PRIVATE_CAPTURE',timeoutMs:300000};delete row.event;
 assert.deepEqual(safeCurrentJob(row,plan,[1]),{index:1,id:plan[0].id,phase:'cleanup',elapsedMs:0,timeoutMs:300000});
 assert.equal(safeCurrentJob({...row,id:'PRIVATE_CAPTURE'},plan,[1]),null);
});
check('JSON-difference-publishes-path-and-types-only',()=>{
 const result=jsonDifferencePaths({articles:[{ownedHtml:'PRIVATE_BEFORE'}]},{articles:[{ownedHtml:'PRIVATE_AFTER'}]});
 assert.deepEqual(result,[{pointer:'/articles/0/ownedHtml',expectedType:'string',rebuiltType:'string'}]);
 assert(!JSON.stringify(result).includes('PRIVATE_'));
 const injected=jsonDifferencePaths({}, {'owner@example.invalid':'PRIVATE_CAPTURE'});
 assert.deepEqual(injected,[{pointer:'/<redacted-key>',expectedType:'undefined',rebuiltType:'string'}]);
});
const arena=createQaTempDir('wh-ci-progress-controls-');
check('complete-difference-summary-publishes-no-source-text',()=>{
 const before={ownedHtml:'PRIVATE_CAPTURE\r\n',contentHash:'PRIVATE_HASH',details:{title:'PRIVATE_OLD'}};
 const after={ownedHtml:'PRIVATE_CAPTURE\n',contentHash:'PRIVATE_OTHER',details:{title:'PRIVATE_NEW'}};
 const summary=jsonDifferenceSummary(before,after);
 assert.deepEqual(summary.counts,{'ownedHtml:string->string':1,'contentHash:string->string':1,'title:string->string':1});
 assert.equal(summary.ownedHtml.length,1);assert.equal(summary.ownedHtml[0].crlfNormalizedEqual,true);
 assert.deepEqual(summary.ownedHtml[0].expectedBreaks,{cr:1,lf:1,crlf:1});
 assert.deepEqual(summary.ownedHtml[0].rebuiltBreaks,{cr:0,lf:1,crlf:0});
 assert(!JSON.stringify(summary).includes('PRIVATE_'));
});
check('browser-launch-diagnostic-never-forwards-private-message',()=>{
 const row={schema:'browser-launch-diagnostic/v1',phase:'browser-launch',status:'FAIL',errorClass:'Error',cause:'UNIX_SOCKET_PATH_TOO_LONG',tempPathBytes:180,private:'PRIVATE_CAPTURE owner@example.invalid'};
 assert.deepEqual(browserLaunchDetails('QA_BROWSER_LAUNCH_DIAGNOSTIC '+JSON.stringify(row)),{errorClass:'Error',cause:'UNIX_SOCKET_PATH_TOO_LONG',tempPathBytes:180});
 assert.deepEqual(browserLaunchDetails('AssertionError [ERR_ASSERTION]: QA_BROWSER_LAUNCH_DIAGNOSTIC '+JSON.stringify(row)),{errorClass:'Error',cause:'UNIX_SOCKET_PATH_TOO_LONG',tempPathBytes:180});
 assert.equal(browserLaunchDetails('QA_BROWSER_LAUNCH_DIAGNOSTIC '+JSON.stringify({...row,cause:'PRIVATE_CAPTURE'})),null);
});
try{
 check('single-job-report-preserves-full-ordinal-and-timeout-failure',()=>{
  const raw=path.join(arena,'raw');fs.mkdirSync(raw);
  const listed=spawnSync(process.execPath,['tools/qa-queue.mjs','pre-ff','--list'],{cwd:root,encoding:'utf8'});assert.equal(listed.status,0);
  const jobs=JSON.parse(listed.stdout),job=jobs[1];
  fs.writeFileSync(path.join(raw,'RESULTS.json'),JSON.stringify({mode:'pre-ff',root,elapsedMs:300001,selectedFullIndices:[2],results:[{...job,originalIndex:2,status:'FAIL',exitCode:124,elapsedMs:300001,timedOut:true}]}));
  const result=exportReport({source:root,raw,out:path.join(arena,'report'),outcome:'failure',job:'2'});
  assert.equal(result.schema,'pre-ff-diagnostic-report/v1');assert.equal(result.fullPlanTotal,213);assert.equal(result.total,1);
  assert.equal(result.jobs[0].index,2);assert.equal(result.failed,1);assert.equal(result.jobs[0].diagnostic.cause,'TIMEOUT');
  assert.throws(()=>exportReport({source:root,raw,out:path.join(arena,'mismatch'),outcome:'failure',job:'3'}),/JOB_PLAN_MISMATCH/);
 });
}finally{cleanupQaTempDir(arena);}
console.log('CI_PROGRESS_CONTROLS '+controls+' PASS');
