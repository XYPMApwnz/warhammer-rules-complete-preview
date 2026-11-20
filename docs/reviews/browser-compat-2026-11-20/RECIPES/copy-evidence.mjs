/** Copy a bounded, LF-normalized review archive into an explicit new worktree.
 * No Git, process, test, browser, package build, deletion or source write. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const out=fileURLToPath(new URL('../',import.meta.url));
const argument=process.argv[2];assert(argument,'Supply the new evidence worktree path explicitly');
const worktree=fs.realpathSync(path.resolve(argument));
assert(fs.existsSync(path.join(worktree,'.git')),'Destination must be an existing evidence worktree');
assert.notEqual(worktree.toLowerCase(),path.resolve('E:/Warhammer/worktrees/browser-compat-v1').toLowerCase(),'Do not write evidence into the feature worktree');
const relativeTarget='docs/reviews/browser-compat-2026-11-20';
const target=path.resolve(worktree,relativeTarget);
assert(target.startsWith(worktree+path.sep));assert(!fs.existsSync(target),'Use a fresh evidence destination; preserve any previous archive');
const acceptance=JSON.parse(fs.readFileSync(path.join(out,'FINAL_ACCEPTANCE.json'),'utf8'));
assert.equal(acceptance.status,'PASS');assert.equal(acceptance.feature,'b0aa1273b907020776dec41ca0466d646e5435e2');
assert.equal(acceptance.preff.passed,202);assert.equal(acceptance.preff.failed,0);
const publication=JSON.parse(fs.readFileSync(path.join(out,'PUBLICATION.json'),'utf8'));
assert.equal(publication.status,'PASS','Root must record actual preview handoff before copying final evidence');

const required=[
 'REPORT.md','FEATURE.json','PRE_FF_RUN.json','FINAL_ACCEPTANCE.json','GENERATED_FINAL.json','GENERATED_FINAL.log',
 'SCOPE_EQUALITY.json','AB_FINAL.json','CENSUS.json','QUEUE_PLAN.json','PERFORMANCE.json','PERFORMANCE_SUMMARY.csv',
 'PERFORMANCE_NOTES.md','PERFORMANCE_INITIAL_PROBE_FAILURE.json','PERFORMANCE_INITIAL_PROBE_FAILURE.log',
 'PERFORMANCE_PROBE_CORRECTION.log','PERFORMANCE_PROBE_INHERITED_ERROR.log','EMPTY_ROSTER_PROBE_CONTROL.json','EMPTY_ROSTER_PROBE_CONTROL.log',
 'EXISTING_CATALOG_QA.log','CATALOG_LOADER_FINAL.log','CATALOG_LOADER_QA.log','CATALOG_CACHE_QA.log',
 'CATALOG_CLOSURE_INVENTORY.json','CATALOG_INVENTORY.md','CATALOG_OFFLINE_MIGRATION_REVIEW.md',
 'COMPAT_FOCUSED.log','EQUIVALENCE_FOCUSED.json','SYNTAX_API_AUDIT.json','SYNTAX_AUDIT_NOTES.md',
 'RELEASE_API_BOUNDARY.json','CSS_HAS_NOTES.json','ESBUILD_PROPERTY_ESCAPE_ISOLATION.json',
 'SCROLL_INSTANT_MINIMUM_REVIEW.md','SCROLL_INSTANT_MINIMUM_REVIEW.json','SCROLL_INSTANT_SOURCE_AUDIT.json','CATALOG_GZIP_LEVELS.json',
 'ESBUILD_PROPERTY_ESCAPE_NOTES.md','PROPERTY_CLASS_EQUIVALENCE.json','ESBUILD_TARGET_DIFFERENCES.json',
 'TEST_CHANGES.diff','tests-before-after.csv','runtime-json-imports.csv','STARTUP_FOCUSED.log','SHELL_FOCUSED.log',
 'COLD_OFFLINE_FOCUSED.log','UPDATE_FOCUSED.log','OLD_RELEASE_UPDATE.log','PRE_FF_TIMINGS.csv','PUBLICATION.json',
 'FULL_SYNTAX.log','FULL_SYNTAX.json','FULL_EQUIVALENCE.log','FULL_EQUIVALENCE.json',
 'FULL_CATALOG_LOADER.log','FULL_CATALOG_LOADER.json','FULL_CATALOG_CACHE.log','FULL_CATALOG_CACHE.json','FULL_STARTUP.log',
 'pre-ff/RESULTS.json','pre-ff/RUNTIME_MANIFEST.json','pre-ff/PACKAGING_RESULTS.json',
 'update-path/RESULTS.json','update-path/390-network.json','update-path/1440-network.json','update-focused/REPORT.json'
];
const selected=new Set(required);
for(const name of ['FULL_SOURCE_CATALOG.log','FULL_PWA_CACHE.log','FULL_COLD_OFFLINE.log','FULL_PWA_UPDATE.log','GALLERY.html'])
 if(fs.existsSync(path.join(out,name)))selected.add(name);
for(const lane of ['home','roster-dg','roster-sm'])for(const revision of ['base','head'])
 selected.add('performance-'+lane+'-'+revision+'-390.png');
function selectFiles(relative,accept){
 const directory=path.join(out,relative);assert(fs.existsSync(directory),'Expected focused evidence directory: '+relative);
 for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
  assert(!entry.isSymbolicLink(),'Evidence directories cannot contain links');
  const file=relative+'/'+entry.name;
  if(entry.isDirectory())selectFiles(file,accept);
  else if(entry.isFile()&&accept(file,entry.name))selected.add(file);
 }
}
selectFiles('RECIPES',file=>file.endsWith('.mjs')||file.endsWith('.ps1'));
selectFiles('update-path',file=>file.endsWith('.jpg'));
selectFiles('update-focused',file=>file.endsWith('.png'));
selectFiles('cold-offline-focused',(file,name)=>name==='REPORT.json'||file.endsWith('.png'));
selectFiles('startup-focused',(file,name)=>name==='REPORT.json'||name==='GRAPH.json');

const textFile=/\.(?:json|csv|md|txt|mjs|diff|log|html|js|css|patch|ps1)$/i;
const email=/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const pending=[],rows=[];
// Validate every input, privacy/size boundary and output path before writing.
for(const file of [...selected].sort()){
 assert(!path.isAbsolute(file)&&!file.includes('\\')&&!file.split('/').includes('..'),'Unsafe relative evidence path');
 assert(!/\.(?:zip|go|ndjson)$/i.test(file),'Traces, raw captures and full tooling sources are excluded');
 assert(!/(?:^|\/)(?:node_modules|\.git|profiles?|sources?|RAW)(?:\/|$)/i.test(file),'No raw/source/profile tree');
 assert(!/core-rules\.candidate|(?:^|\/)source-catalog\.json$|(?:^|\/)seeds?\//i.test(file),'No candidate, full catalog or raw seed copy');
 const source=path.resolve(out,file),destination=path.resolve(target,file);
 assert(source.startsWith(path.resolve(out)+path.sep));assert(destination.startsWith(target+path.sep));
 const stat=fs.lstatSync(source);assert(stat.isFile()&&!stat.isSymbolicLink(),'A regular evidence file is required: '+file);
 assert(stat.size<10_000_000,'Individual review file exceeds 10MB: '+file);
 const input=fs.readFileSync(source);
 let bytes=input;
 if(textFile.test(file)){
  const text=input.toString('utf8');assert(!email.test(text),'Email address present; inspect privately before publication: '+file);
  bytes=Buffer.from(text.replaceAll('\r\n','\n'));
 }
 pending.push({destination,bytes});
 rows.push({file,bytes:bytes.length,sha256:hash(bytes),sourceArchiveInput:{bytes:input.length,sha256:hash(input)}});
}
const total=rows.reduce((sum,row)=>sum+row.bytes,0);assert(total<60_000_000,'Bounded review archive exceeds 60MB');
const planned=new Set(rows.map(row=>row.file));
for(const file of ['REPORT.md','PERFORMANCE_NOTES.md','GALLERY.html'].filter(name=>planned.has(name))){
 const body=pending[rows.findIndex(row=>row.file===file)].bytes.toString('utf8');
 const links=file.endsWith('.html')?/(?:src|href)="([^"]+)"/g:/\]\(([^)]+)\)/g;
 for(const match of body.matchAll(links)){
  const href=match[1];if(/^(?:https?:|#|file:)/.test(href))continue;
  const relative=path.posix.normalize(path.posix.join(path.posix.dirname(file),href.split('#')[0]));
  assert(planned.has(relative),'Review link is absent from the bounded archive: '+file+' -> '+href);
 }
}
fs.mkdirSync(target,{recursive:true});
for(const {destination,bytes}of pending){fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,bytes);}
fs.writeFileSync(path.join(target,'ARTIFACTS.json'),JSON.stringify({schema:'browser-compat-review-archive/v1',
 feature:acceptance.feature,files:rows,totalBytes:total,
 textNewlines:'LF in review archive; exact original input bytes and SHA retained in sourceArchiveInput',
 ignoredLogFiles:rows.filter(row=>row.file.endsWith('.log')).map(row=>relativeTarget+'/'+row.file),
 stagingNote:'Repository ignores logs globally. Root must explicitly git add -f the exact ignoredLogFiles; copier performs no Git operation.',
 patchNote:'TEST_CHANGES.diff retains valid unified-diff blank context lines; do not strip those as trailing whitespace.'},null,2)+'\n');
console.log(JSON.stringify({status:'PASS',target,files:rows.length+1,totalBytes:total,ignoredLogs:rows.filter(row=>row.file.endsWith('.log')).length,
 gitOrExecPerformed:false,sourceCatalogCopied:false,rawOrTracesCopied:false}));
