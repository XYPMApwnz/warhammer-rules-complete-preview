/** Targeted publication boundary tests. No factual or source producer runs. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {buildPagesRuntimePackage,validateRuntimeManifest} from './pages-runtime-package.mjs';
import {checkSourceClosureTree} from '../books/shared/source-refs-v2/source-closure-qa.mjs';

const args=process.argv.slice(2),value=key=>args[args.indexOf(key)+1];
const sourceRoot=value('--source'),published=value('--published'),work=value('--work');
if(!sourceRoot||!published||!work)throw new Error('--source, --published and --work are required');
if(fs.existsSync(work))throw new Error('QA work directory must be new');
fs.mkdirSync(work,{recursive:true});
const manifestFile=new URL('./pages-runtime-manifest.json',import.meta.url);
const manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8')),results=[];
const check=(name,fn)=>{fn();results.push({name,status:'PASS'});console.log(name+' PASS');};
const clone=()=>structuredClone(manifest);
let first,second;
check('published-output-verbatim-and-fresh',()=>{
  first=buildPagesRuntimePackage({sourceRoot,outRoot:published,check:true});
  assert.equal(checkSourceClosureTree(published,{packaged:true}).status,'PASS');
});
const rebuilt=path.join(work,'rebuilt');
check('independent-deterministic-build',()=>{
  second=buildPagesRuntimePackage({sourceRoot,outRoot:rebuilt});
  assert.deepEqual(second,first);
  assert.equal(fs.readFileSync(path.join(rebuilt,'PAGES_RUNTIME_MANIFEST.json'),'utf8'),fs.readFileSync(path.join(published,'PAGES_RUNTIME_MANIFEST.json'),'utf8'));
});
check('allowlist-checkout-CRLF-LF-identical-package',()=>{
  const windowsManifest=path.join(work,'allowlist-crlf.json');
  fs.writeFileSync(windowsManifest,(JSON.stringify(manifest,null,2)+'\n').replace(/\n/g,'\r\n'));
  assert.deepEqual(buildPagesRuntimePackage({sourceRoot,outRoot:path.join(work,'crlf-rebuilt'),manifestFile:windowsManifest}),first);
});
check('refuse-source-overwrite',()=>assert.throws(()=>buildPagesRuntimePackage({sourceRoot,outRoot:sourceRoot}),/overwrite source/));
check('refuse-nonempty-output',()=>assert.throws(()=>buildPagesRuntimePackage({sourceRoot,outRoot:rebuilt}),/non-empty/));
check('reject-duplicate-allowlist-entry',()=>{const m=clone();m.files.push(m.files[0]);assert.throws(()=>validateRuntimeManifest(m),/Duplicate/);});
check('reject-path-traversal',()=>{const m=clone();m.files.push({path:'../escape',reasons:[{kind:'negative'}]});assert.throws(()=>validateRuntimeManifest(m),/Unsafe/);});
check('reject-development-qa-publication',()=>{const m=clone();m.files.push({path:'tests/integration-qa.mjs',reasons:[{kind:'negative'}]});assert.throws(()=>validateRuntimeManifest(m),/Development/);});
check('reject-unreviewed-raw-capture-publication',()=>{const m=clone();m.files.push({path:'books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html',reasons:[{kind:'negative'}]});assert.throws(()=>validateRuntimeManifest(m),/Unreviewed source/);});
check('preserve-existing-public-source-download',()=>{
  const m=clone();m.files=m.files.filter(row=>!m.publicSourceDownloads.includes(row.path));
  assert.throws(()=>validateRuntimeManifest(m),/Missing public download/);
});
check('reject-missing-browser-module-before-copy',()=>{
  const m=clone();m.files=m.files.filter(row=>row.path!=='books/shared/roster-v2/runtime.mjs');
  const file=path.join(work,'missing-module.json');fs.writeFileSync(file,JSON.stringify(m));
  assert.throws(()=>buildPagesRuntimePackage({sourceRoot,outRoot:path.join(work,'must-not-copy'),manifestFile:file}),/Unlisted browser module/);
  assert.equal(fs.existsSync(path.join(work,'must-not-copy')),false);
});
const runtime=path.join(rebuilt,'v2/army-books.mjs'),original=fs.readFileSync(runtime);
check('reject-runtime-content-corruption',()=>{
  fs.appendFileSync(runtime,'\n// negative control\n');
  try{assert.throws(()=>buildPagesRuntimePackage({sourceRoot,outRoot:rebuilt,check:true}),/Runtime input changed/);}finally{fs.writeFileSync(runtime,original);}
});
const extra=path.join(rebuilt,'unlisted.txt');
check('reject-unlisted-published-file',()=>{
  fs.writeFileSync(extra,'negative control');
  try{assert.throws(()=>buildPagesRuntimePackage({sourceRoot,outRoot:rebuilt,check:true}),/Unlisted publication files/);}finally{fs.unlinkSync(extra);}
});
check('restored-negative-fixture-still-fresh',()=>buildPagesRuntimePackage({sourceRoot,outRoot:rebuilt,check:true}));
const report={status:'PASS',checks:results.length,results,contentSha256:first.contentSha256,publishedBytes:first.publishedBytes,cacheRevision:first.cacheRevision,scope:'Runtime-only output boundary; browser QA is separate'};
fs.writeFileSync(path.join(work,'RESULTS.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
