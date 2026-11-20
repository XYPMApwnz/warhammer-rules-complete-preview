import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createHash}from'node:crypto';
const out='E:/Warhammer/qa-evidence/polish-6-v1-2026-11-20';
const dest=process.argv[2];assert(dest,'Explicit evidence worktree destination required');
assert.equal(JSON.parse(fs.readFileSync(out+'/FINAL_ACCEPTANCE.json')).status,'PASS');
const target=path.resolve(dest,'docs/reviews/polish-6-2026-11-20');assert(!fs.existsSync(target));
const prior=fs.readFileSync(out+'/REVIEW_ARTIFACT_COPYLIST.csv','utf8').trim().split(/\r?\n/).slice(1).map(line=>line.split(',')[0]);
const paths=new Set(prior.filter(file=>!['REVIEW_TABLES.md','REVIEW_ARTIFACT_COPYLIST.csv'].includes(file)));
const extras=['TEST_CHANGES_BEFORE_AFTER.csv','REPORT.md','GALLERY.html','PERF_NOTES.md','FEATURE_FINAL.json','PRE_FF_RUN.json','PRE_FF_FINAL_RUN.json','FINAL_ACCEPTANCE.json','GENERATED_FINAL.json','GENERATED_FINAL.log','FIRST_SHELL_FAIL.log','SOURCE_METADATA_BUILD_FINAL.log','SOURCE_METADATA_LOADER_FINAL.log','STARTUP_FINAL.log','SHELL_FINAL.log','LINK_PARITY_FINAL.log','OLD_AND_NEW_TEST_CHANGES_FINAL.diff','OLD_TEST_CHANGES.latest.diff','AB_FINAL.json','SCOPE_EQUALITY_FINAL.json','QUEUE_PLAN_FINAL.json','CENSUS_FINAL_METADATA.json','HOME_COLD_PERFORMANCE.json','METADATA_SIZES.json','PRE_FF_FINAL_TIMINGS.csv','PUBLICATION.json','pre-ff-final/RESULTS.json','pre-ff-final/RUNTIME_MANIFEST.json','pre-ff-final/PACKAGING_RESULTS.json','REVIEW_LATEST_CHANGES.csv','REVIEW_HARNESS_CONTROLS.latest.csv','REVIEW_OLD_TEST_CHANGES.latest.csv','REVIEW_FINAL_PERFORMANCE.latest.csv','REVIEW_HOME_COLD_PERFORMANCE.latest.csv','REVIEW_NATIVE_AB.latest.csv'];
for(const file of extras)paths.add(file);
for(const dir of ['gallery','library-small-metadata','notices-small-metadata','startup-small-metadata','RECIPES'])for(const file of fs.readdirSync(out+'/'+dir)){if(fs.statSync(out+'/'+dir+'/'+file).isFile())paths.add(dir+'/'+file);}
const rows=[];
for(const file of [...paths].sort()){
 assert(!path.isAbsolute(file)&&!file.split('/').includes('..'));assert(!/core-rules\.candidate|\.html?$/i.test(file)||/gallery|GALLERY/.test(file),'No raw/candidate publication');
 const source=path.join(out,file),stat=fs.statSync(source);assert(stat.isFile());assert(stat.size<10e6,'Bounded review evidence: '+file);
 const bytes=fs.readFileSync(source);if(/\.(?:json|csv|md|txt|mjs|diff|log|html)$/.test(file))assert(!/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(bytes.toString('utf8')),'Review artifact contains an email address; inspect privately: '+file);
 const destination=path.join(target,file);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,bytes);
 rows.push({file,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
const total=rows.reduce((n,row)=>n+row.bytes,0);assert(total<60e6,'Bounded gallery/report archive');
fs.writeFileSync(target+'/ARTIFACTS.json',JSON.stringify({schema:'polish-six-evidence-manifest/v1',files:rows,totalBytes:total},null,2)+'\n');
console.log(JSON.stringify({status:'PASS',target,files:rows.length+1,totalBytes:total}));
