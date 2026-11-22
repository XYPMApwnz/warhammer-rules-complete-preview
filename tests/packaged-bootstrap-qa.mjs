/** Independent package control: parse module links, never execute native factories.
 * The factual classic glossary assignment remains opaque. No stamping code is imported. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {parse} from 'acorn';
import {createQaTempDir,cleanupQaTempDir} from './helpers/qa-temp.mjs';

const here=fileURLToPath(import.meta.url),sha=value=>createHash('sha256').update(value).digest('hex');
const ORIGIN='https://package-guard.invalid/';
const oracle='glossary/generated/cache-revision.js';
const opaqueClassic=new Set(['glossary/v2/generated/index.en.js']);
const excluded=new Set([oracle,'service-worker.js','manifest.webmanifest']);
const physical=url=>{const value=decodeURIComponent(new URL(url,ORIGIN).pathname).slice(1);return !value||value.endsWith('/')?value+'index.html':value;};
const literalValue=node=>node?.type==='Literal'&&typeof node.value==='string'?node.value:node?.type==='TemplateLiteral'&&!node.expressions.length?node.quasis[0].value.cooked:null;
function walk(node,visit){if(!node||typeof node!=='object')return;if(node.type)visit(node);for(const [key,value]of Object.entries(node)){if(['start','end','loc','range'].includes(key))continue;if(Array.isArray(value))for(const child of value)walk(child,visit);else if(value&&typeof value==='object')walk(value,visit);}}

function inspectPackage(root){
  if(typeof vm.SourceTextModule!=='function')throw Error('Independent package parser requires --experimental-vm-modules');
  const report=JSON.parse(fs.readFileSync(path.join(root,'PAGES_RUNTIME_MANIFEST.json'),'utf8'));
  const allowed=new Set(report.files.map(row=>row.path));assert.equal(allowed.size,report.files.length,'Duplicate published path');
  for(const relative of allowed)assert(typeof relative==='string'&&!path.posix.isAbsolute(relative)&&!relative.includes('\\')&&relative.split('/').every(part=>part&&part!=='.'&&part!=='..'),'Unsafe package path');
  const self=Object.create(null);vm.runInNewContext(fs.readFileSync(path.join(root,oracle),'utf8'),{self},{timeout:1000,filename:oracle});
  const revision=self.WH40K_CACHE_REVISION;assert.match(revision,/^[a-f0-9]{16}$/,'Missing package publication revision');assert.equal(report.cacheRevision,revision,'Manifest and worker publication differ');
  const precache=Array.from(self.WH40K_PRECACHE||[]),core=Array.from(self.WH40K_STARTUP_CORE||[]);
  assert.equal(precache.length,221,'Full offline package must retain221 URL keys');assert.equal(new Set(precache).size,221,'Duplicate full offline cache key');
  const expectedCore=['./','./index.html','./v2/app.html','./books/shared/offline-status.js?v=4','./books/shared/offline-status.js?wh-pwa='+revision,'./books/shared/styles/offline-status.css','./v2/boot.mjs'];
  assert.deepEqual(core,expectedCore,'Startup control core must remain the exact seven keys');assert.equal(new Set(core).size,7,'Duplicate startup-core key');
  for(const url of core){
    assert(precache.includes(url),'Startup core outside full offline inventory: '+url);
    const relative=physical(url),file=path.join(root,...relative.split('/'));
    assert(allowed.has(relative),'Unpublished startup-core file: '+relative);assert(fs.existsSync(file),'Missing startup-core file: '+relative);
    const bytes=fs.readFileSync(file),asset=self.WH40K_RUNTIME_ASSETS?.[relative],manifest=report.files.find(row=>row.path===relative);
    assert(asset,'Missing startup-core integrity record: '+relative);assert.equal(asset.sha256,sha(bytes),'Startup-core SHA mismatch: '+relative);assert.equal(asset.bytes,bytes.length,'Startup-core byte count mismatch: '+relative);
    assert.equal(manifest.sha256,sha(bytes),'Manifest startup-core SHA mismatch: '+relative);
  }
  const app=fs.readFileSync(path.join(root,'v2/app.html'),'utf8'),helper=fs.readFileSync(path.join(root,'books/shared/offline-status.js'));
  const helperTag=[...app.matchAll(/<script\b[^>]*>/gi)].find(match=>/\bsrc\s*=\s*["'][^"']*books\/shared\/offline-status\.js/.test(match[0]))?.[0];
  assert(helperTag,'Initial offline helper script is absent');
  const helperSource=/\bsrc\s*=\s*(["'])(.*?)\1/i.exec(helperTag)?.[2];
  const helperUrl=new URL(helperSource.replaceAll('&amp;','&'),new URL('v2/app.html',ORIGIN));
  assert.deepEqual(helperUrl.searchParams.getAll('wh-pwa'),[],'Initial helper must not carry a publication query: its SRI-bound network-first bridge must be able to update an old controller');
  assert.deepEqual(helperUrl.searchParams.getAll('v'),['4'],'Initial helper must retain the exact v=4 bridge URL');
  assert.equal([...helperUrl.searchParams].length,1,'Unexpected initial helper query');
  const integrity=/\bintegrity\s*=\s*(["'])(.*?)\1/i.exec(helperTag)?.[2];
  assert.equal(integrity,'sha256-'+createHash('sha256').update(helper).digest('base64'),'Initial helper SRI must bind its actual packaged bytes');
  const pending=[...allowed].filter(file=>file.endsWith('.mjs')),seen=new Set(),imports=[],dynamicExpressions=[];
  let opaqueSkipped=0;
  function inspectRequest(owner,request,kind){
    if(!request.startsWith('.')&&!request.startsWith('/'))return;
    const url=new URL(request,new URL(owner,ORIGIN));assert.equal(url.origin,new URL(ORIGIN).origin,'Non-local native module import: '+owner);
    const target=physical(url.href);assert(allowed.has(target),'Unpublished native module import: '+owner+' -> '+target);
    if(!excluded.has(target)&&!target.endsWith('.html')){
      assert.deepEqual(url.searchParams.getAll('wh-pwa'),[revision],'Missing/current-revision module stamp: '+owner+' -> '+request);
      imports.push({owner,target,kind});
    }
    if(target.endsWith('.js')||target.endsWith('.mjs'))pending.push(target);
  }
  function parseModule(source,owner){
    const module=new vm.SourceTextModule(source,{identifier:owner});
    for(const request of module.dependencySpecifiers)inspectRequest(owner,request,'static-v8');
    const ast=parse(source,{ecmaVersion:'latest',sourceType:'module',allowHashBang:true});
    walk(ast,node=>{if(node.type!=='ImportExpression')return;const value=literalValue(node.source);if(value!==null)inspectRequest(owner,value,'literal-dynamic-ast');else dynamicExpressions.push({owner,start:node.start,end:node.end});});
  }
  // A SourceTextModule is constructed, never linked/evaluated. Global assignments,
  // effects, native factory calls and payload parsing cannot run through this guard.
  while(pending.length){const owner=pending.shift();if(seen.has(owner))continue;seen.add(owner);if(opaqueClassic.has(owner)){opaqueSkipped++;continue;}parseModule(fs.readFileSync(path.join(root,owner),'utf8'),owner);}
  for(const owner of [...allowed].filter(file=>file.endsWith('.html'))){
    const source=fs.readFileSync(path.join(root,owner),'utf8');
    const comments=[...source.matchAll(/<!--[\s\S]*?-->/g)].map(match=>[match.index,match.index+match[0].length]);
    for(const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
      if(comments.some(([start,end])=>match.index>=start&&match.index<end))continue;
      if(!/\btype\s*=\s*["']module["']/i.test(match[1]))continue;
      const src=/\bsrc\s*=\s*["']([^"']+)["']/i.exec(match[1]);
      if(src)inspectRequest(owner,src[1].replaceAll('&amp;','&'),'html-module-src');else parseModule(match[2],owner+'#inline-module');
    }
  }
  // Any JS bridge first discovered from an HTML module must receive the same scan.
  while(pending.length){const owner=pending.shift();if(seen.has(owner))continue;seen.add(owner);if(opaqueClassic.has(owner)){opaqueSkipped++;continue;}parseModule(fs.readFileSync(path.join(root,owner),'utf8'),owner);}
  return {status:'PASS',revision,precacheUrls:precache.length,startupCore:core,modulesParsed:seen.size-opaqueSkipped,staticImports:imports.filter(row=>row.kind==='static-v8').length,literalDynamicImports:imports.filter(row=>row.kind==='literal-dynamic-ast').length,nonliteralDynamicImports:dynamicExpressions,opaqueClassicGlossaryParsed:false,imports};
}

export function checkPackagedBootstrap(root){
  const child=spawnSync(process.execPath,['--experimental-vm-modules',here,'--scan-child',path.resolve(root)],{encoding:'utf8',maxBuffer:8*1024*1024});
  if(child.status!==0)throw Error('Packaged bootstrap guard failed: '+(child.stderr||child.stdout));
  return JSON.parse(child.stdout);
}

function selfTest(){
  const root=createQaTempDir('wh-packaged-bootstrap-'),revision='aaaaaaaaaaaaaaaa',bodies={
    'index.html':'<!doctype html><a href="./v2/app.html">Open</a>',
    'books/shared/offline-status.js':'self.fixtureHelper=true;',
    'books/shared/styles/offline-status.css':'body{margin:0}',
    'v2/boot.mjs':"import '../modules/dependency-000.mjs?wh-pwa="+revision+"'; export const load=()=>import('../modules/dependency-001.mjs?wh-pwa="+revision+"'); throw Error('Factories must never execute');",
    'service-worker.js':'self.fixtureWorker=true;',
    'glossary/v2/generated/index.en.js':'OPAQUE CLASSIC FACTUAL CORPUS: not parsed by this guard.'
  };
  const integrity='sha256-'+createHash('sha256').update(bodies['books/shared/offline-status.js']).digest('base64');
  bodies['v2/app.html']='<script src="../books/shared/offline-status.js?v=4" integrity="'+integrity+'"></script><script type="module">await import("./boot.mjs?wh-pwa='+revision+'");</script><!-- <script type="module">import "./not-a-real-module.mjs";</script> -->';
  const core=['./','./index.html','./v2/app.html','./books/shared/offline-status.js?v=4','./books/shared/offline-status.js?wh-pwa='+revision,'./books/shared/styles/offline-status.css','./v2/boot.mjs'];
  const precache=[...core];for(let n=0;n<214;n++){const relative='modules/dependency-'+String(n).padStart(3,'0')+'.mjs';bodies[relative]='throw Error("Module must never execute");export const value=1;';precache.push('./'+relative);}
  const metadata='glossary/generated/cache-revision.js';
  const put=(file,body)=>{const target=path.join(root,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,body);};
  const write=()=>{
    for(const [file,body]of Object.entries(bodies))put(file,body);
    const assets=Object.fromEntries(Object.entries(bodies).filter(([file])=>file!=='service-worker.js').map(([file,body])=>[file,{sha256:sha(body),bytes:Buffer.byteLength(body)}]));
    put(metadata,'self.WH40K_CACHE_REVISION='+JSON.stringify(revision)+';self.WH40K_PRECACHE='+JSON.stringify(precache)+';self.WH40K_STARTUP_CORE='+JSON.stringify(core)+';self.WH40K_RUNTIME_ASSETS='+JSON.stringify(assets)+';');
    const files=[...Object.keys(bodies),metadata].map(file=>{const bytes=fs.readFileSync(path.join(root,file));return {path:file,bytes:bytes.length,sha256:sha(bytes)};});put('PAGES_RUNTIME_MANIFEST.json',JSON.stringify({cacheRevision:revision,files}));
  };
  try{
    write();const initial=checkPackagedBootstrap(root);assert.equal(initial.startupCore.length,7);assert.equal(initial.precacheUrls,221);assert.equal(initial.literalDynamicImports,2);assert.equal(initial.opaqueClassicGlossaryParsed,false);
    const original=bodies['v2/boot.mjs'];bodies['v2/boot.mjs']=original.replace("dependency-000.mjs?wh-pwa="+revision,"dependency-000.mjs");write();
    assert.throws(()=>checkPackagedBootstrap(root),/Missing\/current-revision module stamp/,'Removing a static stamp must fail even with refreshed body hashes');
    bodies['v2/boot.mjs']=original.replace("dependency-001.mjs?wh-pwa="+revision,"dependency-001.mjs");write();
    assert.throws(()=>checkPackagedBootstrap(root),/Missing\/current-revision module stamp/,'Removing a literal dynamic stamp must fail even with refreshed body hashes');
    bodies['v2/boot.mjs']=original;write();fs.unlinkSync(path.join(root,'books/shared/styles/offline-status.css'));
    assert.throws(()=>checkPackagedBootstrap(root),/Missing startup-core file/,'Removing a core body must fail with its filename');
    const originalApp=bodies['v2/app.html'];bodies['v2/app.html']=originalApp.replace('offline-status.js?v=4','offline-status.js?v=4&amp;wh-pwa='+revision);write();
    assert.throws(()=>checkPackagedBootstrap(root),/Initial helper must not carry a publication query/,'Tagging the initial updater must fail even with refreshed HTML hashes');
    bodies['v2/app.html']=originalApp;
    write();assert.equal(checkPackagedBootstrap(root).status,'PASS');
    return {status:'PASS',checks:['independent-V8-static-imports','literal-dynamic-imports','no-native-module-evaluation','exact-seven-core-subset221','actual-core-body-SHA','initial-helper-SRI-and-exact-untagged-v4-URL','opaque-classic-glossary','removed-static-stamp-rejected','removed-dynamic-stamp-rejected','missing-core-body-rejected','tagged-initial-helper-rejected']};
  }finally{cleanupQaTempDir(root);}
}
if(process.argv[1]&&path.resolve(process.argv[1])===here){
  try{if(process.argv[2]==='--scan-child')console.log(JSON.stringify(inspectPackage(path.resolve(process.argv[3]))));
    else if(process.argv[2]==='--package'&&process.argv[3])console.log(JSON.stringify(checkPackagedBootstrap(process.argv[3])));
    else if(process.argv.length===2||process.argv[2]==='--self-test')console.log(JSON.stringify(selfTest()));
    else throw Error('Usage: node tests/packaged-bootstrap-qa.mjs [--self-test | --package <published-root>]');
  }catch(error){console.error(error.stack||error);process.exitCode=1;}
}
