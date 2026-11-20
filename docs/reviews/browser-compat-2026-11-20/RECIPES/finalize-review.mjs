/** Prepare derived review records only after the exact complete run passes.
 * This script runs no tests, browser, build, process or Git command. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const out=fileURLToPath(new URL('../',import.meta.url));
const expected='b0aa1273b907020776dec41ca0466d646e5435e2';
const read=name=>JSON.parse(fs.readFileSync(path.join(out,name),'utf8'));
const write=(name,value)=>fs.writeFileSync(path.join(out,name),JSON.stringify(value,null,2)+'\n');
const inside=(root,file)=>path.resolve(file).startsWith(path.resolve(root)+path.sep);
const feature=read('FEATURE.json'),run=read('PRE_FF_RUN.json'),queue=read('pre-ff/RESULTS.json');
assert.equal(feature.sha,expected);assert.equal(feature.base,'9876164de85f1e35aa2cf070a3eb9de662093980');
assert.equal(run.status,'PASS');assert.equal(run.sha,expected);assert.equal(run.headAfter,expected);
assert.equal(run.treeAfter,'');assert.equal(run.expectedJobs,202);assert.equal(run.passed,202);
assert.equal(run.failed,0);assert.equal(run.exitCode,0);
assert.equal(queue.results.length,202);assert(queue.results.every(row=>row.status==='PASS'&&row.exitCode===0));

const uniqueJob=id=>{const rows=queue.results.filter(row=>row.id===id);assert.equal(rows.length,1,'One complete job: '+id);return rows[0];};
const logBytes=row=>{assert(inside(out,row.log),'Job log must stay in task evidence');return fs.readFileSync(row.log);};
const copyLog=(id,name)=>{const row=uniqueJob(id);fs.writeFileSync(path.join(out,name),logBytes(row));return row;};
const lastJSON=(bytes,predicate)=>{
 for(const line of bytes.toString('utf8').split(/\r?\n/).reverse()){
  if(!line.trim().startsWith('{'))continue;
  try{const value=JSON.parse(line);if(predicate(value))return value;}catch{}
 }
 throw new Error('Missing expected structured job result');
};
const generatedJob=copyLog('books/shared/tools/check-generated-rebuild.mjs','GENERATED_FINAL.log');
const child=generatedJob.log.replace(/\.log$/,'-evidence');assert(inside(out,child));
const generatedFolders=fs.readdirSync(child,{withFileTypes:true})
 .filter(entry=>entry.isDirectory()&&entry.name.startsWith('wh-generated-rebuild-evidence-'));
assert.equal(generatedFolders.length,1,'One actual clean-clone generated report');
const generatedFile=path.join(child,generatedFolders[0].name,'RESULTS.json');
const generated=JSON.parse(fs.readFileSync(generatedFile,'utf8'));
assert.equal(generated.status,'PASS');assert.equal(generated.head,expected);
assert.equal(generated.files.length,148);assert.equal(generated.steps.length,68);
assert(generated.steps.every(row=>row.status==='PASS'&&row.exitCode===0&&Array.isArray(row.differences)&&!row.differences.length));
fs.copyFileSync(generatedFile,path.join(out,'GENERATED_FINAL.json'));

const syntaxJob=copyLog('tests/browser-compatibility-qa.mjs','FULL_SYNTAX.log');
const syntax=lastJSON(logBytes(syntaxJob),value=>value.schema==='browser-syntax-qa/v1');
assert.equal(syntax.status,'PASS');assert.equal(syntax.modules,142);assert.equal(syntax.inlineScripts,3);
assert.deepEqual(syntax.targets,['safari15','chrome100','firefox102']);assert.equal(syntax.negativeControls.length,5);
write('FULL_SYNTAX.json',syntax);
const equivalenceJob=copyLog('tests/browser-compat-equivalence-qa.mjs','FULL_EQUIVALENCE.log');
const equivalence=lastJSON(logBytes(equivalenceJob),value=>value.status==='PASS'&&value.lexicalCases!==undefined);
assert.equal(equivalence.lexicalCases,1316);assert.equal(equivalence.orderingCases,8);
assert.equal(equivalence.renderedSorterCallSites,3);assert.equal(equivalence.unicodeCodePoints,1114112);
assert.equal(equivalence.sourceFactsUnchanged,true);assert.equal(equivalence.oldTestsChanged,false);
write('FULL_EQUIVALENCE.json',equivalence);
const loaderJob=copyLog('tests/browser-catalog-loader-qa.mjs','FULL_CATALOG_LOADER.log');
const loader=lastJSON(logBytes(loaderJob),value=>value.status==='PASS'&&value.browser&&value.node);
assert.equal(loader.node.fullCatalogEquality,true);assert.equal(loader.node.fileReadsFetches,0);
assert.equal(loader.browser.startupCatalogRequests,0);assert.equal(loader.browser.catalogFetches,1);
assert.equal(loader.browser.catalogParses,1);assert.equal(loader.browser.concurrentRetryPreserved,true);
write('FULL_CATALOG_LOADER.json',loader);
const cacheJob=copyLog('tests/browser-catalog-cache-qa.mjs','FULL_CATALOG_CACHE.log');
const cache=lastJSON(logBytes(cacheJob),value=>value.status==='PASS'&&value.sourceCatalogPath);
assert.equal(cache.checks,7);assert.equal(cache.shaGuardsRetained,true);assert.equal(cache.exactPathOnly,true);
assert.equal(cache.oldTestExpectationsChanged,false);write('FULL_CATALOG_CACHE.json',cache);
copyLog('tests/startup-precache-qa.mjs','FULL_STARTUP.log');
for(const [id,name]of[
 ['books/shared/source-refs-v2/source-catalog-qa.mjs','FULL_SOURCE_CATALOG.log'],
 ['tests/minimal-pwa-cache-qa.mjs','FULL_PWA_CACHE.log'],
 ['tests/browser/cold-offline.mjs','FULL_COLD_OFFLINE.log'],
 ['tests/browser/pwa-update-flow.mjs','FULL_PWA_UPDATE.log']
]){
 const rows=queue.results.filter(row=>row.id===id);
 assert(rows.length<=1,'No duplicate optional job: '+id);
 if(rows.length)fs.writeFileSync(path.join(out,name),logBytes(rows[0]));
}

const ab=read('AB_FINAL.json'),scope=read('SCOPE_EQUALITY.json'),census=read('CENSUS.json'),performance=read('PERFORMANCE.json');
assert.equal(ab.status,'PASS');assert.equal(ab.differences,0);assert.equal(ab.lanes.head.manifest.sha,expected);
assert.equal(ab.lanes.head.manifest.counts.cases,199);assert.equal(ab.lanes.head.manifest.counts.frames,507);
assert.equal(scope.status,'PASS');assert.equal(scope.head,expected);assert.equal(scope.generatedFiles,148);
assert.equal(scope.identical,148);assert(scope.files.every(row=>row.identical));
assert.equal(census.status,'PASS');assert.equal(census.N,2724);
assert.deepEqual(census.counts,{EXECUTED:812,RECIPIENTS_ONLY:1478,TEXT_ONLY_INTENDED:263,GAP:0,UNKNOWN:171});
assert.equal(performance.status,'PASS');assert.equal(performance.hashes.head,expected);assert.equal(performance.rows.length,18);
const manifest=read('pre-ff/RUNTIME_MANIFEST.json');
assert.equal(manifest.fileCount,456);assert.equal(manifest.precacheUrls,221);
assert.equal(manifest.contentSha256,performance.publications.head.contentSha256);
assert.equal(manifest.cacheRevision,performance.publications.head.cacheRevision);

const quote=value=>'"'+String(value??'').replaceAll('"','""')+'"';
fs.writeFileSync(path.join(out,'PRE_FF_TIMINGS.csv'),[
 ['position','job','status','elapsedMs','seconds','command','args','log'],
 ...queue.results.map((row,index)=>[index+1,row.id,row.status,row.elapsedMs,row.elapsedMs/1000,row.command,JSON.stringify(row.args),path.basename(row.log)])
].map(row=>row.map(quote).join(',')).join('\n')+'\n');

const minutes=(run.elapsedMs/60000).toFixed(2);
let report=fs.readFileSync(path.join(out,'REPORT.preff-running.md'),'utf8').replaceAll('\r\n','\n');
report=report.replace('Status: **FOCUSED VERIFICATION PASSED — FULL PRE-FF RUNNING**.','Status: **READY_FOR_REVIEW**.');
report=report.replace('The sole authorized complete pre-FF is RUNNING with 202 expected jobs, started '+run.started+'; PRE_FF_RUN.json is authoritative. No complete pre-FF PASS is claimed in this report snapshot.',
 'The sole authorized complete pre-FF passed 202/202 jobs in '+minutes+' minutes, exit0; its SHA remained unchanged and its final tree was clean. PRE_FF_RUN.json is authoritative.');
report=report.replace('**RUNNING:202 expected jobs**, exact SHA '+expected+', started '+run.started+' (PRE_FF_RUN.json). **[PENDING_PRE_FF]** — root must fill the final result; this snapshot does not claim complete PASS',
 '**PASS:202/202 jobs, '+minutes+' minutes, exit0**, exact SHA '+expected+' (PRE_FF_RUN.json).');
report=report.replaceAll('[PENDING_PRE_FF]','PASS:202/202 jobs in '+minutes+' minutes, exit0');
report=report.replaceAll('[PENDING_GENERATED_GATE]','PASS:148/148 outputs,68/68 producer steps,zero byte differences (GENERATED_FINAL.json)');
report=report.replace('complete clean-clone generated rebuild remains','complete clean-clone generated rebuild is also');
report=report.replace('in the sole running pre-FF','in the sole completed pre-FF');
report=report.replace('has been changed in this draft','has been changed');
report=report.replaceAll('[PENDING_FINAL_SHA_PROOF]',expected+'; run SHA and headAfter identical; treeAfter empty');
report=report.replaceAll('[PENDING_EVIDENCE_SHA]','codex/browser-compat-evidence, one documentation-only commit; exact remote SHA is in the final chat');
report=report.replaceAll('[PENDING_LS_REMOTE]','Feature '+expected+'; evidence branch codex/browser-compat-evidence; final git ls-remote output is in the final chat');
report=report.replaceAll('[PENDING_CLEANUP]','Cleanup follows evidence publication; its outcome is recorded in the final chat, with the retained path if policy blocks deletion');
let preview='The reviewed preview is switched only after this full PASS. PUBLICATION.json and the final chat record the actual verified URL/SHA handoff; this sentence does not claim an unperformed restart.';
if(fs.existsSync(path.join(out,'PUBLICATION.json'))){
 const publication=read('PUBLICATION.json');assert.equal(publication.status,'PASS');
 const state=publication.preview||publication;
 const sha=publication.feature||state.sha||publication.sha;assert.equal(sha,expected);
 preview='PASS: '+(state.lan||publication.url||'see PUBLICATION.json')+'; exact feature '+expected+'; see PUBLICATION.json for HTTP/package proof';
}
report=report.replaceAll('[PENDING_PREVIEW]',preview);
report=report.replace(' — do not switch before full PASS','');
report=report.replace('Verification and pending final handoff','Verification and review handoff');
report=report.replace('The sole complete run is still RUNNING at this snapshot. Focused PASS results and direct byte comparisons are not combined into a fabricated full-suite PASS. Final run result, elapsed time, exact final SHA/clean-tree proof, evidence commit/remotes, preview switch/HTTP200 and cleanup remain root-owned handoff fields.',
 'The sole complete run passed on the exact feature; earlier focused results were not aggregated across revisions to obtain that PASS. Exact remote evidence SHA, verified preview handoff and post-publication cleanup are reported in the final chat. No FF is performed by this evidence preparation.');
report+='\n## Final complete-run artifacts\n\n[PRE_FF_RUN.json](PRE_FF_RUN.json), [pre-ff/RESULTS.json](pre-ff/RESULTS.json) and [PRE_FF_TIMINGS.csv](PRE_FF_TIMINGS.csv) preserve the complete202-job result and every duration. [GENERATED_FINAL.json](GENERATED_FINAL.json) and [GENERATED_FINAL.log](GENERATED_FINAL.log) preserve the clean-clone148-output/68-step byte proof. Full-run syntax, equivalence, loader and migration results are in FULL_SYNTAX.json, FULL_EQUIVALENCE.json, FULL_CATALOG_LOADER.json and FULL_CATALOG_CACHE.json. [TEST_CHANGES.diff](TEST_CHANGES.diff) and [tests-before-after.csv](tests-before-after.csv) preserve the old-test/framework changes.\n';
if(fs.existsSync(path.join(out,'GALLERY.html')))report+='\n[Open the local review gallery](GALLERY.html); keep it with its screenshot files. The gallery uses existing measured/update screenshots and performs no network access.\n';
assert(!/\[PENDING_[A-Z_]+\]/.test(report),'All final-result placeholders must be resolved');
fs.writeFileSync(path.join(out,'REPORT.md'),report);
write('FINAL_ACCEPTANCE.json',{schema:'browser-compat-final-acceptance/v1',status:'PASS',feature:expected,
 base:feature.base,preff:{passed:202,failed:0,elapsedMs:run.elapsedMs,headAfter:run.headAfter,treeAfter:run.treeAfter},
 generated:{outputs:148,steps:68,oldOutputsIdentical:148,newOutputs:0},native:{rosters:199,states:507,differences:0},
 census:{N:census.N,counts:census.counts},syntax:{files:142,inlineScripts:3,negativeControls:5},
 publication:{files:456,mandatoryUrls:221,contentSha256:manifest.contentSha256,cacheRevision:manifest.cacheRevision},
 evidenceBranch:'codex/browser-compat-evidence',cleanup:'After evidence publication; final chat records outcome'});
console.log(JSON.stringify({status:'PASS',sha:expected,preffJobs:202,minutes,generated:148}));
