import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {calculateCacheRevision,writeCacheRevision,verifyCacheRevision} from '../tools/cache-revision.mjs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';

const temp=fs.mkdtempSync(path.join(os.tmpdir(),'wh-cache-portability-'));
const asset=path.join(temp,'asset.js');
const binary=path.join(temp,'image.bin');
const worker=path.join(temp,'service-worker.js');
const workerSource=(version=1,eol='\n')=>[
  'const LIBRARY_FALLBACK = "./index.html";',
  'const APP_SHELL = [',
  `  "./asset.js?v=${version}",`,
  '  "./image.bin"',
  '];',
  '',
].join(eol);

try{
  fs.writeFileSync(asset,'const value = 1;\n');
  fs.writeFileSync(binary,Buffer.from([0,13,10,255]));
  fs.writeFileSync(worker,workerSource());
  const lf=calculateCacheRevision({root:temp}).revision;

  fs.writeFileSync(asset,'const value = 1;\r\n');
  fs.writeFileSync(worker,workerSource(1,'\r\n'));
  assert.equal(calculateCacheRevision({root:temp}).revision,lf,'equivalent LF/CRLF text changed cache identity');

  fs.writeFileSync(asset,'const value = 2;\r\n');
  const contentChanged=calculateCacheRevision({root:temp}).revision;
  assert.notEqual(contentChanged,lf,'text content mutation did not change cache identity');

  fs.writeFileSync(asset,'const value = 1;\r\n');
  fs.writeFileSync(worker,workerSource(2,'\r\n'));
  assert.notEqual(calculateCacheRevision({root:temp}).revision,lf,'APP_SHELL query mutation did not change cache identity');

  fs.writeFileSync(worker,workerSource(1,'\r\n'));
  fs.writeFileSync(binary,Buffer.from([0,10,255]));
  assert.notEqual(calculateCacheRevision({root:temp}).revision,lf,'binary byte mutation did not change cache identity');
  // Reviewed native runtime inputs outside legacy APP_SHELL still invalidate a release.
  const native=path.join(temp,'native');
  const write=(relative,value)=>{const file=path.join(native,relative);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,value);};
  const paths=['.nojekyll','index.html','v2/app.html','v2/boot.mjs','books/shared/application-v2/shell.css','books/test/v2/generated/app-presentation.json','glossary/v2/generated/index.en.js','glossary/v2/generated/corpus.en.json','books/core-rules/reader/index.html','books/core-rules/reader/app.js','books/core-rules/reader/search-index.json','asset.js','image.bin','service-worker.js','glossary/generated/cache-revision.js'];
  write('tools/pages-runtime-manifest.json',JSON.stringify({schema:'unified-v2-pages-runtime-allowlist/v1',files:paths.map(p=>({path:p,reasons:[{kind:'fixture'}]}))}));
  write('.nojekyll','\r\n');write('service-worker.js',workerSource());write('index.html','<!doctype html>\n');write('asset.js','const legacy=1;\n');write('image.bin',Buffer.from([0,255]));
  write('v2/app.html',`<script>window.WHPwaExpectedRevision='__WH_PWA_REVISION__';</script><script src="../books/shared/offline-status.js?wh-pwa=__WH_PWA_REVISION__"></script><script type="module" src="./boot.mjs?wh-pwa=__WH_PWA_REVISION__"></script>\n`);
  write('glossary/v2/generated/index.en.js','self.BIG_LEGACY_GLOSSARY={};\n');write('glossary/v2/generated/corpus.en.json','{"cards":[]}\n');write('books/core-rules/reader/index.html','<script src="../../../glossary/v2/generated/index.en.js?v=1"></script><script src="app.js?v=18"></script>\n');write('books/core-rules/reader/app.js','void 0;\n');write('books/core-rules/reader/search-index.json','[]\n');
  write('v2/boot.mjs','export const value=1;\n');write('books/shared/application-v2/shell.css','body { color:white; }\n');write('books/test/v2/generated/app-presentation.json','{"cards":[]}\n');write('glossary/generated/cache-revision.js',"self.WH40K_CACHE_REVISION='0000000000000000';\n");
  const initial=calculateCacheRevision({root:native});
  write('.nojekyll','\n');
  assert.equal(calculateCacheRevision({root:native}).revision,initial.revision,'stock package normalization of .nojekyll changed revision');
  for(const relative of ['v2/boot.mjs','books/shared/application-v2/shell.css','books/test/v2/generated/app-presentation.json']){
    const original=fs.readFileSync(path.join(native,relative));
    fs.appendFileSync(path.join(native,relative),' ');
    assert.notEqual(calculateCacheRevision({root:native}).revision,initial.revision,`${relative} outside APP_SHELL failed to invalidate revision`);
    fs.writeFileSync(path.join(native,relative),original);
  }
  assert.ok(initial.urls.includes('./v2/boot.mjs'),'native module is not prepared for offline startup');
  assert.ok(!initial.urls.some(url=>url.includes('app-presentation.json')),'large Army Book JSON was added to mandatory precache');
  assert.ok(!initial.urls.some(url=>url.includes('glossary/v2/generated/')),'large legacy/V2 glossary data was added to mandatory precache');
  assert.ok(initial.urls.includes('./books/core-rules/reader/app.js?v=18'),'actual Core reader script query is absent from mandatory precache');
  assert.ok(!initial.urls.includes('./books/core-rules/reader/app.js?v=17'),'obsolete Core reader script query entered mandatory precache');
  const first=writeCacheRevision({root:native}),firstArtifact=fs.readFileSync(path.join(native,'glossary/generated/cache-revision.js'),'utf8'),stamped=fs.readFileSync(path.join(native,'v2/app.html'),'utf8');
  assert.ok(!stamped.includes('__WH_PWA_REVISION__')&&stamped.includes(first),'V2 expected revision/query placeholders were not stamped');
  assert.equal(writeCacheRevision({root:native}),first,'stamping introduced circular revision changes');
  assert.equal(fs.readFileSync(path.join(native,'glossary/generated/cache-revision.js'),'utf8'),firstArtifact,'second generation was not byte deterministic');
  verifyCacheRevision({root:native});
  const sandbox={self:{}};vm.runInNewContext(firstArtifact,sandbox);
  assert.equal(sandbox.self.WH40K_RUNTIME_ASSETS['v2/boot.mjs'].sha256,createHash('sha256').update(fs.readFileSync(path.join(native,'v2/boot.mjs'))).digest('hex'),'runtime integrity hash is not actual published bytes');
  assert.match(sandbox.self.WH40K_CACHE_BYTES,/^[a-f0-9]{16}$/,'exact publication byte fingerprint is missing');
  assert.equal(sandbox.self.WH40K_CACHE_BYTES,createHash('sha256').update(JSON.stringify(Object.entries(sandbox.self.WH40K_RUNTIME_ASSETS).map(([relative,asset])=>[relative,asset.sha256,asset.bytes]))).digest('hex').slice(0,16),'byte fingerprint does not describe the ordered raw integrity inventory');
  assert.equal(sandbox.self.WH40K_RUNTIME_ASSETS['service-worker.js'],undefined,'self-referential worker asset entered runtime ledger');
  assert.equal(sandbox.self.WH40K_RUNTIME_ASSETS['glossary/generated/cache-revision.js'],undefined,'self-referential cache metadata entered runtime ledger');
  for(const relative of paths.filter(p=>/\.(?:js|mjs|css|html|json)$/.test(p)&&p!=='glossary/generated/cache-revision.js')){
    const file=path.join(native,relative);fs.writeFileSync(file,fs.readFileSync(file,'utf8').replace(/\r?\n/g,'\r\n'));
  }
  const afterEol=calculateCacheRevision({root:native});
  assert.equal(afterEol.revision,first,'reviewed native runtime EOL conversion changed portable revision');
  assert.notEqual(afterEol.cacheBytes,sandbox.self.WH40K_CACHE_BYTES,'same semantic revision reused the byte cache namespace for different CRLF/LF bodies');
  assert.equal(writeCacheRevision({root:native}),first,'raw fingerprint introduced circular semantic revision changes');
  const afterEolArtifact=fs.readFileSync(path.join(native,'glossary/generated/cache-revision.js'),'utf8');
  writeCacheRevision({root:native});
  assert.equal(fs.readFileSync(path.join(native,'glossary/generated/cache-revision.js'),'utf8'),afterEolArtifact,'raw fingerprint/stamping regeneration is not byte deterministic');
}finally{
  fs.rmSync(temp,{recursive:true,force:true});
}

console.log('Cache revision portability QA passed: EOL portability, native module/CSS/JSON invalidation, lazy large data, raw integrity hashes and idempotent V2 stamps.');
