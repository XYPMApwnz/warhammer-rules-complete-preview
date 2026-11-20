import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {execFileSync}from'node:child_process';
const root='E:/Warhammer/worktrees/polish-6-v1',out='E:/Warhammer/qa-evidence/polish-6-v1-2026-11-20';
const read=name=>JSON.parse(fs.readFileSync(path.join(out,name))),write=(name,value)=>fs.writeFileSync(path.join(out,name),JSON.stringify(value,null,2)+'\n');
const feature=read('FEATURE_FINAL.json'),run=read('PRE_FF_FINAL_RUN.json'),jobs=read('pre-ff-final/RESULTS.json').results;
assert.equal(run.status,'PASS');assert.equal(run.sha,feature.sha);assert.equal(run.headAfter,feature.sha);assert.equal(run.treeAfter,'');assert.equal(run.passed,198);assert.equal(run.failed,0);assert.equal(jobs.length,198);assert(jobs.every(x=>x.status==='PASS'));
assert.equal(execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim(),'');
const generatedJob=jobs.find(x=>x.id==='books/shared/tools/check-generated-rebuild.mjs');assert(generatedJob);
const evidence=generatedJob.log.replace(/\.log$/,'-evidence');
const dirs=fs.readdirSync(evidence).filter(x=>x.startsWith('wh-generated-rebuild-evidence-'));assert.equal(dirs.length,1);
const generated=JSON.parse(fs.readFileSync(path.join(evidence,dirs[0],'RESULTS.json')));
assert.equal(generated.status,'PASS');assert.equal(generated.head,feature.sha);assert.equal(generated.files.length,148);assert.equal(generated.steps.length,68);assert(generated.steps.every(x=>x.status==='PASS'&&x.differences.length===0));write('GENERATED_FINAL.json',generated);
fs.copyFileSync(generatedJob.log,out+'/GENERATED_FINAL.log');
const first=read('pre-ff/RESULTS.json').results.find(x=>x.id==='v2/shell-browser-qa.mjs');assert.equal(first.status,'FAIL');fs.copyFileSync(first.log,out+'/FIRST_SHELL_FAIL.log');
for(const [id,name]of [['tests/source-metadata-build-qa.mjs','SOURCE_METADATA_BUILD_FINAL.log'],['books/shared/application-v2/source-metadata-qa.mjs','SOURCE_METADATA_LOADER_FINAL.log'],['tests/startup-precache-qa.mjs','STARTUP_FINAL.log'],['v2/shell-browser-qa.mjs','SHELL_FINAL.log'],['v2/lazy-glossary-browser-qa.mjs','LINK_PARITY_FINAL.log']]){let job=jobs.find(x=>x.id===id);assert(job);fs.copyFileSync(job.log,out+'/'+name);}
const manifest=read('pre-ff-final/RUNTIME_MANIFEST.json');assert.equal(manifest.fileCount,456);assert.equal(manifest.precacheUrls,222);
const ab=read('AB_FINAL.json'),scope=read('SCOPE_EQUALITY_FINAL.json'),census=read('CENSUS_FINAL_METADATA.json');assert.equal(ab.status,'PASS');assert.equal(ab.lanes.head.manifest.sha,feature.sha);assert.equal(scope.generatedFiles,148);assert.equal(scope.identical,147);assert.equal(census.status,'PASS');
const quote=value=>'"'+String(value??'').replaceAll('"','""')+'"';fs.writeFileSync(out+'/PRE_FF_FINAL_TIMINGS.csv',['job,status,seconds,log',...jobs.map(x=>[x.id,x.status,x.elapsedMs/1000,path.basename(x.log)].map(quote).join(','))].join('\n')+'\n');
const mins=(run.elapsedMs/60000).toFixed(2);
let report=fs.readFileSync(out+'/REPORT.final-draft.md','utf8');
report=report.replace('# Polish 6: final report draft for small metadata follow-up','# Polish 6: sources, lazy glossary links and informational import notes');
report=report.replace('Status: **final verification pending**.','Status: **READY_FOR_REVIEW**.');
report=report.replaceAll('[FINAL_PREF_F_STATUS_PENDING]',`PASS: 198/198, ${mins} minutes, exit 0`)
.replaceAll('[FINAL_GENERATED_GATE_STATUS_PENDING]','PASS: 148/148 files, 68/68 producer steps, zero byte differences')
.replaceAll('[FINAL_PARITY_EVIDENCE_PENDING]','PASS in the final complete run; LINK_PARITY_FINAL.log')
.replaceAll('[FINAL_PREF_F_METADATA_AND_RESULT_PATH_PENDING]','PRE_FF_FINAL_RUN.json and pre-ff-final/RESULTS.json')
.replaceAll('[FINAL_PREF_F_STATUS_COUNTS_PENDING]',`PASS: 198/198, ${mins} minutes, exit 0`)
.replaceAll('[ROOT_FINAL_ACCEPTANCE_FIELDS_PENDING]','Final scope: original 147 generated files byte-identical plus the explicitly requested derived 1003-byte artifact; native A/B 199/507, zero differences; census PASS without registry changes. See PUBLICATION.json for the exact preview handoff. The task temporary root is E:/Warhammer/qa-tmp/polish-6; cleanup is performed after evidence publication and its outcome is recorded in the final chat. Feature and evidence pushes only; no source/main/release/Pages update or FF.');
report=report.replace('The new complete 148-file regeneration result is','The new complete 148-file regeneration result is');
report=report.replace('in the authorized new full run. Existing 147-output byte equality remains recorded separately in SCOPE_EQUALITY.json','in the authorized new full run (GENERATED_FINAL.json). Existing 147-output byte equality is confirmed on the final SHA in SCOPE_EQUALITY_FINAL.json');
report=report.replace('Root should confirm/fill final-run parity evidence','Final-run parity evidence is');
report=report.replace('The new user-authorized 198-job full run remains','The new user-authorized 198-job full run completed');
report=report.replace('The user authorized one new complete **198-job** pre-FF after that A/B; its result is','The user authorized one new complete **198-job** pre-FF after that A/B; its result is');
report=report.replace('This draft does not claim final approval, a completed new pre-FF, or deployment.','Independent Claude approval and FF remain separate owner-controlled steps. No deployment was performed.');
report=report.replace('Exact current eight-file diff is','Exact current eight-file old-expectation diff is');
report=report.replace('## Recorded scope and pending final acceptance','## Final acceptance');
report += '\n## Startup footprint and final records\n\nThe new metadata is 1003 bytes raw / 405 bytes gzip (level 9). The removed startup owners are 232708 bytes Core + 2132 bytes MFM raw. The final runtime publication contains 456 files / 222 mandatory precache URLs: the new source module, notice module and small artifact are the three additions relative to the accepted base. No raw Core/MFM owners are published or precached. METADATA_SIZES.json and pre-ff-final/RUNTIME_MANIFEST.json record exact sizes/hashes.\n\nThe existing startup graph helper also recognizes the new direct literal fetch(new URL(..., import.meta.url)); it does not broaden property-fetch/book-data matching or remove existing lazy-data guards. Its full diff is in OLD_AND_NEW_TEST_CHANGES_FINAL.diff together with all other test changes.\n\nFinal full-run metadata, every job status/time and the generated gate are preserved in PRE_FF_FINAL_RUN.json, PRE_FF_FINAL_TIMINGS.csv, pre-ff-final/RESULTS.json, GENERATED_FINAL.json and GENERATED_FINAL.log. The first 196/197 run remains a failed historical record, not aggregated into this result. The final feature stayed unchanged throughout the authorized run.\n';
report=report.replace('Earlier REPORT.md, REVIEW_TABLES.md, CSVs, first full-run records and failed/superseded timing evidence remain untouched.','Earlier CSVs, first full-run records and failed/superseded timing evidence remain preserved and explicitly separate from final records.');
fs.writeFileSync(out+'/REPORT.md',report);
for(const file of ['REVIEW_LATEST_CHANGES.csv']){let csv=fs.readFileSync(out+'/'+file,'utf8').replaceAll('PASS focused; final full run pending','PASS final full run 198/198').replaceAll('PASS focused; full148 rebuild gate pending','PASS full148 rebuild gate').replaceAll('[FINAL_PREF_F_STATUS_PENDING] and exact logs/counts tobe filled byroot','PASS 198/198; PRE_FF_FINAL_RUN.json and pre-ff-final/RESULTS.json').replaceAll(',PENDING',',PASS');fs.writeFileSync(out+'/'+file,csv);}
write('FINAL_ACCEPTANCE.json',{status:'PASS',sha:feature.sha,preff:{passed:198,failed:0,elapsedMs:run.elapsedMs},generated:{files:148,steps:68,oldIdentical:147,newDerived:1},native:{rosters:199,states:507,differences:0},census:census.counts,runtime:{files:456,mandatoryPrecache:222}});
console.log(JSON.stringify({status:'PASS',sha:feature.sha,minutes:mins}));
