import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const evidence='E:/Warhammer/qa-evidence/roster-navigation-v1-2026-11-17';
const sha='5bc1b038437fcac86966f87371760da94d7e9b38';
const destination=process.argv[2];
assert(destination,'Pass an evidence-branch worktree directory.');
const git=(...args)=>execFileSync('git',args,{cwd:destination,encoding:'utf8'}).trim();
assert.equal(git('branch','--show-current'),'codex/roster-navigation-evidence');
assert.equal(git('rev-parse','HEAD'),sha);
const gate=JSON.parse(fs.readFileSync(path.join(evidence,'FINAL_PREFLIGHT_RUN.json')));
const acceptance=JSON.parse(fs.readFileSync(path.join(evidence,'FINAL_ACCEPTANCE.json')));
assert.equal(acceptance.status,'PASS');assert.equal(acceptance.finalSha,sha);assert.equal(acceptance.completedJobCoverage,179);
assert.equal(gate.status,'FAIL');assert.equal(gate.sha,acceptance.preffSha);assert.equal(gate.failed,1);assert.equal(gate.passed,178);
const report=fs.readFileSync(path.join(evidence,'REPORT.md'),'utf8');
assert(report.includes('READY_FOR_REVIEW'));assert(!report.includes('PENDING_'));
const root=path.join(destination,'docs/reviews/roster-navigation-v1');
assert(!fs.existsSync(root),'Do not overwrite a review archive.');
const records=[];
function copy(source,relative){
  assert(!relative.includes('..'));assert(!path.isAbsolute(relative));
  if(records.some(record=>record.path===relative)){assert(fs.readFileSync(source).equals(fs.readFileSync(path.join(root,relative))));return;}
  const stat=fs.lstatSync(source);assert(stat.isFile());assert(!stat.isSymbolicLink());assert(stat.size<50*1024*1024);
  if(!relative.endsWith('.png')){
    const value=fs.readFileSync(source,'utf8');
    const emails=value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)||[];
    assert(emails.every(value=>value==='codex@openai.com'),`Private-contact review required: ${relative}`);
  }
  const output=path.join(root,relative);fs.mkdirSync(path.dirname(output),{recursive:true});fs.copyFileSync(source,output);
  records.push({path:relative,bytes:stat.size,sha256:crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex')});
}
fs.writeFileSync(path.join(evidence,'ARCHIVE_ATTRIBUTES.txt'),'* -text -eol whitespace=blank-at-eol,blank-at-eof,space-before-tab,cr-at-eol\n*.patch -whitespace\n*.log -whitespace\n');
copy(path.join(evidence,'ARCHIVE_ATTRIBUTES.txt'),'.gitattributes');
copy(path.join(evidence,'REPORT.md'),'REPORT.md');
const links=[...new Set([...report.matchAll(/\]\(([^)]+)\)/g)].map(match=>match[1].split('#')[0]).filter(value=>value&&!value.startsWith('http')&&!value.startsWith('/')))];
for(const relative of links){
  if(relative==='REPORT.md')continue;
  let source=relative.startsWith('proofs/')?relative.slice(7):relative==='GALLERY.html'?'review-gallery/index.html':relative==='GALLERY_INDEX.json'?'review-gallery/GALLERY_INDEX.json':relative==='approved-tests.patch'?'FINAL_EXISTING_TESTS.patch':relative==='approved-tests.md'?'FINAL_EXISTING_TESTS.md':relative.startsWith('equipment/')?'equipment-inventory/'+relative.slice(10):relative;
  copy(path.join(evidence,source),relative);
}
for(const name of fs.readdirSync(path.join(evidence,'review-gallery/images'))){
  assert(name.endsWith('.png'));copy(path.join(evidence,'review-gallery/images',name),'images/'+name);
}
const extras=[
  'FINAL_PREFLIGHT_RUN.json','FINAL_ACCEPTANCE.json','POST_PREFLIGHT_TEST_RUN.json','FINAL_TEST_ONLY_DIFF.json','POST_PREFLIGHT_TEST_ONLY.stat.txt','POST_PREFLIGHT_TEST_ONLY.patch','post-preff-card-gained.log','PRE_FF_PLAN.json','PREVIEW_STATUS.json',
  'PROTECTED_REFS_BEFORE_PUSH.txt','FINAL_TREE_VERIFICATION.json','CLEANUP_STATUS.json',
  'pre-ff-console.log','final-8e17-gameplay/native-compare/RESULTS.json',
  'final-8e17-gameplay/generated-gameplay-compare/RESULTS.json',
  'gallery-base/RESULTS.json','final-8e17-browser/gallery-head/RESULTS.json',
  'new-browser-all-final-ui/RESULTS.json','guide-scope-dg-final/RESULTS.json',
];
for(const name of extras){const relative='proofs/'+name;if(!records.some(record=>record.path===relative))copy(path.join(evidence,name),relative);}
for(const name of fs.readdirSync(path.join(evidence,'pre-ff-final-880a98db'))){
  if(name==='RESULTS.json'||name.endsWith('.log'))copy(path.join(evidence,'pre-ff-final-880a98db',name),'proofs/pre-ff-final-880a98db/'+name);
}
for(const name of ['browser-measure-gallery.mjs','verify-existing-price-reader.mjs','verify-final-bridge.mjs','verify-final-acceptance.mjs','verify-gameplay-and-generated.mjs','finalize-existing-test-audit.py','finalize-ready-report.py','assemble-before-after-gallery.mjs','start-reviewed-preview.mjs','archive-review.mjs'])copy(path.join(evidence,'RECIPES',name),'recipes/'+name);
for(const name of ['FINAL_EXISTING_TESTS.patch','FINAL_EXISTING_TESTS.json','base-synthetic-diagnostic.log','targeted-3-route-context-synthetic-browser-qa.mjs.log'])copy(path.join(evidence,name),name);
for(const name of ['RESULTS.json','SOURCE_INVENTORY.json','GAMEPLAY_OBSERVATIONS.json','FULL_BOOK_OBSERVATIONS.json'])copy(path.join(evidence,'post-preff-card-gained-5bc1b038',name),'proofs/post-preff-card-gained-5bc1b038/'+name);
copy(path.join(evidence,'equipment-inventory/inventory-all-datasheet-equipment.mjs'),'equipment/inventory-all-datasheet-equipment.mjs');
const gallery=fs.readFileSync(path.join(root,'GALLERY.html'),'utf8');
for(const match of gallery.matchAll(/(?:src|href)="(images\/[^"#]+)"/g))assert(fs.existsSync(path.join(root,match[1])));
for(const relative of links)assert(fs.existsSync(path.join(root,relative)),`Broken report link: ${relative}`);
const manifest={schema:'roster-navigation-review-archive/v1',featureSha:sha,files:records.length,bytes:records.reduce((sum,row)=>sum+row.bytes,0),records};
fs.writeFileSync(path.join(root,'ARCHIVE_MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.join(evidence,'ARCHIVE_MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',root,files:manifest.files,bytes:manifest.bytes}));
