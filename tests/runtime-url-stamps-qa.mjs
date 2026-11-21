/** Publication tag controls; tiny transport fixtures, never faction facts. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {createQaTempDir,cleanupQaTempDir} from './helpers/qa-temp.mjs';
import {stampRuntimeText,stampResourceUrl,helperSri} from '../tools/runtime-url-stamps.mjs';
import {buildPagesRuntimePackage} from '../tools/pages-runtime-package.mjs';
import {calculateCacheRevision,writeCacheRevision,verifyCacheRevision} from '../tools/cache-revision.mjs';

const revision='aaaaaaaaaaaaaaaa',other='bbbbbbbbbbbbbbbb',hash=value=>createHash('sha256').update(value).digest('hex');
const allowed=new Set(['v2/app.html','v2/boot.mjs','v2/lazy.mjs','shared/leaf.mjs','shared/theme.css','data/facts.json','assets/test.webp','service-worker.js','manifest.webmanifest','glossary/generated/cache-revision.js','books/shared/offline-status.js']);
const source=[
  "import value from '../shared/leaf.mjs';",
  "export {value} from '../shared/leaf.mjs';",
  "const lazy=()=>import('./lazy.mjs');",
  'const template=()=>import(`./lazy.mjs`);',
  "const data=new URL('../data/facts.json?q=1#part',import.meta.url);",
  "const prose=\"import '../shared/leaf.mjs'; url('../assets/test.webp')\";",
  "const dynamic=value=>import(value);"
].join('\n');
const stamped=stampRuntimeText(source,'v2/boot.mjs',{allowed,revision});
assert.equal(stamped.rewrites.length,5);assert.equal(stamped.unresolved.length,1);
assert(stamped.text.includes("const prose=\"import '../shared/leaf.mjs'; url('../assets/test.webp')\";"));
assert(stamped.text.includes('../data/facts.json?q=1&wh-pwa='+revision+'#part'));
assert.equal(stampRuntimeText(stamped.text,'v2/boot.mjs',{allowed,revision}).text,stamped.text,'Stamping must be idempotent');
assert(stampRuntimeText(stamped.text,'v2/boot.mjs',{allowed,revision:other}).text.includes('wh-pwa='+other));
assert(!stampRuntimeText(stamped.text,'v2/boot.mjs',{allowed,revision:other}).text.includes('wh-pwa='+revision));
for(const value of ['../v2/app.html','../service-worker.js','../manifest.webmanifest','../glossary/generated/cache-revision.js','https://elsewhere.invalid/shared/leaf.mjs','#same','data:text/plain,hello'])assert.equal(stampResourceUrl(value,'v2/boot.mjs',allowed,revision),value);
assert.equal(stampResourceUrl('unlisted.mjs','v2/boot.mjs',allowed,revision),'unlisted.mjs');
assert.throws(()=>stampResourceUrl('./lazy.mjs','v2/boot.mjs',allowed,'unsafe'),/Invalid publication URL revision/);
const css="/* url('../assets/test.webp') */\n@import './theme.css';\n.x{content:\"url('../assets/test.webp')\";background:url('../assets/test.webp')}";
const styled=stampRuntimeText(css,'shared/styles.css',{allowed,revision});
assert.equal(styled.rewrites.length,2);assert(styled.text.includes("/* url('../assets/test.webp') */"));assert(styled.text.includes('content:"url(\'../assets/test.webp\')"'));
const html='<!-- <script src="../shared/leaf.mjs"></script> --><script type="application/json">{"text":"import x from \'../shared/leaf.mjs\'"}</script><script type="module">import "../shared/leaf.mjs";</script><link rel="stylesheet" href="../shared/theme.css"><img src="../assets/test.webp">';
const page=stampRuntimeText(html,'v2/app.html',{allowed,revision});assert.equal(page.rewrites.length,3);assert(page.text.startsWith('<!-- <script src="../shared/leaf.mjs"></script> -->'));
assert.equal(stampRuntimeText('{"rule":"import value from \'../shared/leaf.mjs\'"}','data/facts.json',{allowed,revision}).rewrites.length,0);

const temp=createQaTempDir('wh-runtime-url-stamps-');
try{
  const root=path.join(temp,'source'),out=path.join(temp,'package');fs.mkdirSync(root);
  const files={
    'index.html':'<!doctype html><a href="./v2/app.html">Open</a>',
    'v2/app.html':"<!doctype html><script>window.WHPwaExpectedRevision='__WH_PWA_REVISION__';</script><script src=\"../books/shared/offline-status.js?wh-pwa=__WH_PWA_REVISION__\"></script><script type=\"module\">await import('./boot.mjs');</script>",
    'v2/boot.mjs':source,'v2/lazy.mjs':'export default 1;',
    'shared/leaf.mjs':'export const value=1;',
    'shared/theme.css':".x{background:url('../assets/test.webp')}",
    'books/shared/offline-status.js':"self.ownedBootstrap=true;\n",
    'books/shared/styles/offline-status.css':'body{margin:0}',
    'data/facts.json':'{"text":"Rule text is unchanged","value":7}',
    'assets/test.webp':Buffer.from([0,1,2,255]),
    'manifest.webmanifest':'{"icons":[]}',
    'books/core-rules/reader/index.html':'<script src="app.js?v=18"></script>',
    'books/core-rules/reader/app.js':'self.readerFixture=true;',
    'service-worker.js':'const LIBRARY_FALLBACK="./v2/app.html";\nconst APP_SHELL = [\n "./index.html"\n];\n',
    'glossary/generated/cache-revision.js':"self.WH40K_CACHE_REVISION='0000000000000000';\n"
  };
  for(const [relative,body]of Object.entries(files)){const file=path.join(root,relative);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,body);}
  const manifest={schema:'unified-v2-pages-runtime-allowlist/v1',files:Object.keys(files).map(path=>({path,reasons:[{kind:'test-fixture'}]})),entrypoints:['index.html','v2/app.html','service-worker.js','manifest.webmanifest']};
  const manifestFile=path.join(root,'tools/pages-runtime-manifest.json');fs.mkdirSync(path.dirname(manifestFile));fs.writeFileSync(manifestFile,JSON.stringify(manifest));
  const before=Object.fromEntries(Object.keys(files).map(file=>[file,hash(fs.readFileSync(path.join(root,file)))]));
  const publication=buildPagesRuntimePackage({sourceRoot:root,outRoot:out,manifestFile});
  assert.deepEqual(Object.fromEntries(Object.keys(files).map(file=>[file,hash(fs.readFileSync(path.join(root,file)))])),before,'Packaging must never rewrite source/Node imports');
  assert(fs.readFileSync(path.join(out,'data/facts.json')).equals(fs.readFileSync(path.join(root,'data/facts.json'))));
  assert(fs.readFileSync(path.join(out,'assets/test.webp')).equals(fs.readFileSync(path.join(root,'assets/test.webp'))));
  assert(publication.urlStamping.rewrites>=7);assert.equal(publication.startupCore.length,7);
  const app=fs.readFileSync(path.join(out,'v2/app.html'),'utf8');assert(app.includes('integrity="'+helperSri(Buffer.from(files['books/shared/offline-status.js']))+'"'));
  assert(app.includes('src="../books/shared/offline-status.js?v=4"'),'Updater stays network-first under a worker from an older publication');
  const metadata={self:{}};vm.runInNewContext(fs.readFileSync(path.join(out,'glossary/generated/cache-revision.js'),'utf8'),metadata);
  assert.equal(metadata.self.WH40K_STARTUP_CORE.length,7);assert(metadata.self.WH40K_STARTUP_CORE.every(url=>metadata.self.WH40K_PRECACHE.includes(url)));
  assert.equal(metadata.self.WH40K_RUNTIME_ASSETS['v2/boot.mjs'].sha256,hash(fs.readFileSync(path.join(out,'v2/boot.mjs'))));
  const portable=calculateCacheRevision({root,manifest}).revision;assert.equal(portable,publication.cacheRevision,'Source and tagged package must share one semantic revision');
  const sourceKeys=calculateCacheRevision({root,manifest}).urls.map(url=>url.replaceAll(publication.cacheRevision,'REVISION'));
  const packageKeys=calculateCacheRevision({root:out,manifest}).urls.map(url=>url.replaceAll(publication.cacheRevision,'REVISION'));
  assert.deepEqual(packageKeys,sourceKeys,'HTML ampersand encoding must not add tagged mandatory cache keys');
  assert(packageKeys.includes('./books/core-rules/reader/app.js?v=18'));
  assert.deepEqual(buildPagesRuntimePackage({sourceRoot:root,outRoot:out,manifestFile,check:true}),publication);
  const again=path.join(temp,'again');assert.deepEqual(buildPagesRuntimePackage({sourceRoot:root,outRoot:again,manifestFile}),publication);
  const boot=path.join(out,'v2/boot.mjs'),original=fs.readFileSync(boot);fs.appendFileSync(boot,'\n// negative corruption\n');
  assert.throws(()=>buildPagesRuntimePackage({sourceRoot:root,outRoot:out,manifestFile,check:true}),/Runtime input changed/);fs.writeFileSync(boot,original);
  const old=fs.readFileSync(path.join(out,'glossary/generated/cache-revision.js'));assert.equal(writeCacheRevision({root:out,manifest}),publication.cacheRevision);assert(old.equals(fs.readFileSync(path.join(out,'glossary/generated/cache-revision.js'))));verifyCacheRevision({root:out,manifest});
  const tagged=fs.readFileSync(boot,'utf8');fs.appendFileSync(path.join(out,'shared/leaf.mjs'),'\n// next publication\n');
  const next=writeCacheRevision({root:out,manifest});assert.notEqual(next,publication.cacheRevision);assert(!fs.readFileSync(boot,'utf8').includes('wh-pwa='+publication.cacheRevision));assert(fs.readFileSync(boot,'utf8').includes('wh-pwa='+next));
  assert(tagged.includes('wh-pwa='+publication.cacheRevision));verifyCacheRevision({root:out,manifest});
  console.log(JSON.stringify({status:'PASS',scope:'URL-literal-only AST edits, unchanged source/factual JSON, exact transformed package checks, corruption rejection, seven-key coherent startup core, SRI, deterministic cycle-free restamping',rewrites:publication.urlStamping.rewrites}));
}finally{cleanupQaTempDir(temp);}
