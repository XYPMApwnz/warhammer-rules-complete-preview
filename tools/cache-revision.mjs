import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const moduleFile=fileURLToPath(import.meta.url);
export const CACHE_REVISION_RELATIVE_PATH='glossary/generated/cache-revision.js';
const sha=value=>createHash('sha256').update(value).digest('hex');
const defaultRoot=()=>path.resolve(path.dirname(moduleFile),'..');
const TEXT_EXTENSIONS=new Set(['.css','.html','.inc','.js','.json','.mjs','.svg','.txt','.webmanifest']);
export const normalizeCacheText=value=>String(value).replace(/\r\n?/g,'\n');
const canonicalAssetContent=file=>path.basename(file)==='.nojekyll'||TEXT_EXTENSIONS.has(path.extname(file).toLowerCase())?normalizeCacheText(fs.readFileSync(file,'utf8')):fs.readFileSync(file);

export function readAppShell(root=defaultRoot()){
  const serviceWorkerFile=path.join(root,'service-worker.js'),source=fs.readFileSync(serviceWorkerFile,'utf8');
  const constantsStart=source.indexOf('const LIBRARY_FALLBACK'),arrayStart=source.indexOf('const APP_SHELL = [',constantsStart),arrayEnd=source.indexOf('\n];',arrayStart);
  if(constantsStart<0||arrayStart<0||arrayEnd<0)throw new Error('Unable to locate service-worker APP_SHELL contract');
  const sandbox={};
  vm.runInNewContext(source.slice(constantsStart,arrayEnd+3)+'\nglobalThis.__APP_SHELL=APP_SHELL;',sandbox,{filename:serviceWorkerFile});
  const urls=Array.from(sandbox.__APP_SHELL||[]);
  if(!urls.length)throw new Error('APP_SHELL is empty');
  const duplicates=[...new Set(urls.filter((url,index)=>urls.indexOf(url)!==index))];
  if(duplicates.length)throw new Error('Duplicate APP_SHELL URLs: '+duplicates.join(', '));
  return {source,urls};
}

export function resolveAppShellUrl(root,url){
  if(typeof url!=='string'||!url.startsWith('./'))throw new Error('Unsupported APP_SHELL URL: '+String(url));
  const raw=url.split(/[?#]/,1)[0].slice(2);
  let relative=decodeURIComponent(raw);
  if(!relative||relative.endsWith('/'))relative+='index.html';
  const absolute=path.resolve(root,...relative.split('/')),rootPrefix=path.resolve(root)+path.sep;
  if(absolute!==path.resolve(root)&&!absolute.startsWith(rootPrefix))throw new Error('APP_SHELL URL escapes repository: '+url);
  if(!fs.existsSync(absolute)||!fs.statSync(absolute).isFile())throw new Error('Missing APP_SHELL asset: '+url+' -> '+relative);
  return {absolute,relative:relative.replaceAll('\\','/')};
}

const RUNTIME_MANIFEST_PATH='tools/pages-runtime-manifest.json';
const RUNTIME_REPORT_PATH='PAGES_RUNTIME_MANIFEST.json';
const REVISION_PLACEHOLDER='__WH_PWA_REVISION__';
const excludedIntegrityPaths=new Set([CACHE_REVISION_RELATIVE_PATH,'service-worker.js']);

function normalizeV2Revision(source){
  return normalizeCacheText(source)
    .replace(/(WHPwaExpectedRevision\s*=\s*["'])(?:__WH_PWA_REVISION__|[a-f0-9]{16})(["'])/g,'$1'+REVISION_PLACEHOLDER+'$2')
    .replace(/([?&]wh-pwa=)(?:__WH_PWA_REVISION__|[a-f0-9]{16})/g,'$1'+REVISION_PLACEHOLDER);
}
function readReviewedPaths(root,manifest){
  if(!manifest){
    const sourceFile=path.join(root,RUNTIME_MANIFEST_PATH),reportFile=path.join(root,RUNTIME_REPORT_PATH);
    if(fs.existsSync(sourceFile))manifest=JSON.parse(fs.readFileSync(sourceFile,'utf8'));
    else if(fs.existsSync(reportFile))manifest=JSON.parse(fs.readFileSync(reportFile,'utf8'));
  }
  if(!manifest)return null;
  if(!Array.isArray(manifest.files)||!manifest.files.length)throw new Error('Invalid cache runtime inventory');
  const paths=manifest.files.map(row=>row.path);
  if(new Set(paths).size!==paths.length)throw new Error('Duplicate cache runtime inventory path');
  for(const relative of paths){
    if(typeof relative!=='string'||!relative||relative.includes('\\')||path.posix.isAbsolute(relative)||relative.split('/').some(part=>!part||part==='.'||part==='..'))throw new Error('Unsafe cache runtime inventory path: '+relative);
  }
  return paths.sort();
}

/** Only startup code and small shell assets are mandatory. Book and glossary
 * payloads remain lazy, although every reviewed byte participates in revision. */
function minimalPrecache(root,paths){
  const allowed=new Set(paths),urls=new Set();
  const add=(relative,query='')=>{if(allowed.has(relative))urls.add('./'+relative+query.replace(/([?&]wh-pwa=)(?:__WH_PWA_REVISION__|[a-f0-9]{16})/g,'$1'+REVISION_PLACEHOLDER));};
  for(const relative of paths){
    if(relative.endsWith('.mjs')||/^books\/core-rules\/reader\/[^/]+\.html$/.test(relative)||relative.endsWith('.css')&&(
      relative.startsWith('books/shared/application-v2/')||relative.startsWith('books/shared/army-book-app-v2/')||
      relative.startsWith('v2/')||/\/v2\/theme\.css$/.test(relative)||relative==='books/shared/styles/offline-status.css'))add(relative);
  }
  for(const relative of ['index.html','v2/app.html','manifest.webmanifest','assets/apple-touch-icon.png','assets/icon-192.png','assets/icon-512.png','assets/icon-maskable-512.png','assets/warhammer-40000-logo-optimized.png','assets/games-workshop-logo.png','books/core-rules/reader/search-index.json','books/shared/datasheet-system.css','books/shared/unit-art.css'])add(relative);
  if(allowed.has('index.html'))urls.add('./');
  if(allowed.has('books/shared/offline-status.js')){
    add('books/shared/offline-status.js','?v=4');
    add('books/shared/offline-status.js','?wh-pwa='+REVISION_PLACEHOLDER);
  }
  // The real HTML, rather than a second hand-maintained version number, owns
  // exact Core URLs. The large legacy glossary index is deliberately excluded.
  for(const html of ['index.html','v2/app.html','books/core-rules/reader/index.html']){
    if(!allowed.has(html))continue;
    const text=fs.readFileSync(path.join(root,html),'utf8');
    for(const match of text.matchAll(/<(script|link|img)\b[^>]*?\b(?:src|href)=["']([^"']+)["'][^>]*>/gi)){
      const tag=match[0],type=match[1].toLowerCase();
      if(type==='link'&&!/rel=["']stylesheet["']/i.test(tag))continue;
      const resolved=new URL(match[2],'https://runtime.invalid/'+html);
      if(resolved.origin!=='https://runtime.invalid')continue;
      const relative=decodeURIComponent(resolved.pathname).slice(1);
      if(!allowed.has(relative)||relative==='glossary/v2/generated/index.en.js'||relative.endsWith('.json'))continue;
      if(type==='img'&&fs.statSync(path.join(root,relative)).size>250000)continue;
      add(relative,resolved.search);
    }
  }
  for(const relative of paths)if(/(?:^|\/)[^/]*cover-480\.webp$/.test(relative)||['assets/core-rules-cover-fallback.jpg','assets/tyranids-cover-fallback.jpg'].includes(relative)){
    if(fs.statSync(path.join(root,relative)).size<=250000)add(relative);
  }
  return [...urls].sort();
}

export function calculateCacheRevision({root=defaultRoot(),manifest}={}){
  const {source,urls:legacyUrls}=readAppShell(root),reviewed=readReviewedPaths(root,manifest);
  if(!reviewed){
    const assets=legacyUrls.slice().sort().map(url=>{const item=resolveAppShellUrl(root,url);return [url,item.relative,item.relative===CACHE_REVISION_RELATIVE_PATH?'self-reference':sha(canonicalAssetContent(item.absolute))];});
    return {revision:sha(JSON.stringify({schema:1,serviceWorker:sha(normalizeCacheText(source)),assets})).slice(0,16),assets,urls:legacyUrls,runtimeAssets:{},precacheBytes:assets.reduce((sum,[,relative])=>sum+(relative===CACHE_REVISION_RELATIVE_PATH?0:fs.statSync(path.join(root,relative)).size),0)};
  }
  const assets=reviewed.filter(relative=>relative!==CACHE_REVISION_RELATIVE_PATH).map(relative=>{
    const file=path.join(root,relative),content=relative==='v2/app.html'?normalizeV2Revision(fs.readFileSync(file,'utf8')):canonicalAssetContent(file);
    return ['./'+relative,relative,sha(content)];
  });
  const precache=minimalPrecache(root,reviewed);
  const revision=sha(JSON.stringify({schema:2,serviceWorker:sha(normalizeCacheText(source)),assets,precache})).slice(0,16);
  const urls=precache.map(url=>url.replaceAll(REVISION_PLACEHOLDER,revision));
  const runtimeAssets=Object.fromEntries(reviewed.filter(relative=>!excludedIntegrityPaths.has(relative)).map(relative=>{
    const raw=fs.readFileSync(path.join(root,relative));return [relative,{sha256:sha(raw),bytes:raw.length}];
  }));
  // Semantic revision stays checkout-portable. Cache namespace additionally
  // identifies exact served bytes so a failed same-semantic install cannot
  // overwrite a previous worker's immutable offline responses.
  const cacheBytes=sha(JSON.stringify(Object.entries(runtimeAssets).map(([relative,asset])=>[relative,asset.sha256,asset.bytes]))).slice(0,16);
  const uniquePrecachePaths=new Set(urls.map(url=>resolveAppShellUrl(root,url).relative));
  return {revision,cacheBytes,assets,urls,runtimeAssets,precacheBytes:[...uniquePrecachePaths].reduce((sum,relative)=>sum+fs.statSync(path.join(root,relative)).size,0)};
}
export function readCacheRevision({root=defaultRoot()}={}){
  const match=/self\.WH40K_CACHE_REVISION='([a-f0-9]{16})';/.exec(fs.readFileSync(path.join(root,CACHE_REVISION_RELATIVE_PATH),'utf8'));
  if(!match)throw new Error('Invalid cache revision artifact: '+CACHE_REVISION_RELATIVE_PATH);
  return match[1];
}
function renderCacheRevision(result){
  return "self.WH40K_CACHE_REVISION='"+result.revision+"';\n"+(result.cacheBytes?"self.WH40K_CACHE_BYTES='"+result.cacheBytes+"';\n":"")+"self.WH40K_RUNTIME_ASSETS="+JSON.stringify(result.runtimeAssets)+";\nself.WH40K_PRECACHE="+JSON.stringify(result.urls)+";\n";
}
export function verifyCacheRevision({root=defaultRoot(),manifest}={}){
  const result=calculateCacheRevision({root,manifest}),current=readCacheRevision({root});
  if(current!==result.revision)throw new Error('Stale cache revision: '+current+'; expected '+result.revision);
  if(Object.keys(result.runtimeAssets).length&&fs.readFileSync(path.join(root,CACHE_REVISION_RELATIVE_PATH),'utf8')!==renderCacheRevision(result))throw new Error('Stale runtime integrity/precache metadata');
  return result;
}
export function writeCacheRevision({root=defaultRoot(),manifest}={}){
  const {revision}=calculateCacheRevision({root,manifest}),file=path.join(root,CACHE_REVISION_RELATIVE_PATH),app=path.join(root,'v2/app.html');
  if(fs.existsSync(app)){
    const original=fs.readFileSync(app,'utf8'),stamped=original
      .replace(/(WHPwaExpectedRevision\s*=\s*["'])(?:__WH_PWA_REVISION__|[a-f0-9]{16})(["'])/g,'$1'+revision+'$2')
      .replace(/([?&]wh-pwa=)(?:__WH_PWA_REVISION__|[a-f0-9]{16})/g,'$1'+revision);
    if(stamped!==original)fs.writeFileSync(app,stamped,'utf8');
  }
  const result=calculateCacheRevision({root,manifest});
  if(result.revision!==revision)throw new Error('Revision stamp changed canonical runtime revision');
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,renderCacheRevision(result),'utf8');
  return revision;
}
if(process.argv[1]&&path.resolve(process.argv[1])===moduleFile){
  const args=new Set(process.argv.slice(2));
  try{const result=args.has('--write')?{...calculateCacheRevision(),revision:writeCacheRevision()}:args.has('--check')?verifyCacheRevision():calculateCacheRevision();console.log('Cache revision '+result.revision+' covers '+result.assets.length+' reviewed assets and '+result.urls.length+' mandatory precache URLs ('+result.precacheBytes+' bytes).');}
  catch(error){console.error(error.stack||error);process.exitCode=1;}
}
