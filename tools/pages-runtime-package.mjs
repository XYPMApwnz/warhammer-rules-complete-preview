/** Publication packaging only. Browser facts and runtime files are copied verbatim;
 * only the existing offline/cache producers stamp their declared outputs. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {readAppShell,resolveAppShellUrl,verifyCacheRevision,writeCacheRevision,normalizeCacheText} from './cache-revision.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const manifestPath=path.join(here,'pages-runtime-manifest.json');
const reportName='PAGES_RUNTIME_MANIFEST.json';
const generated=new Set(['service-worker.js','glossary/generated/cache-revision.js','v2/app.html']);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>JSON.stringify(value,null,2)+'\n';
const relativeFile=(root,relative)=>{
  if(typeof relative!=='string'||!relative||relative.includes('\\')||path.posix.isAbsolute(relative)||relative.split('/').some(part=>!part||part==='.'||part==='..'))throw new Error('Unsafe manifest path: '+relative);
  const absolute=path.resolve(root,...relative.split('/'));
  if(!absolute.startsWith(path.resolve(root)+path.sep))throw new Error('Manifest path escapes root');
  return absolute;
};
const allFiles=root=>fs.readdirSync(root,{withFileTypes:true}).flatMap(entry=>{
  const file=path.join(root,entry.name);
  if(entry.isSymbolicLink())throw new Error('Publication must not contain symlinks: '+file);
  return entry.isDirectory()?allFiles(file):[file];
});

export function validateRuntimeManifest(manifest){
  if(manifest.schema!=='unified-v2-pages-runtime-allowlist/v1'||!Array.isArray(manifest.files)||!manifest.files.length)throw new Error('Invalid runtime allowlist');
  const paths=manifest.files.map(row=>row.path),allowed=new Set(paths);
  if(allowed.size!==paths.length)throw new Error('Duplicate runtime allowlist path');
  const publicDownloads=new Set(manifest.publicSourceDownloads||[]);
  for(const row of manifest.files){
    relativeFile(here,row.path);
    if(!Array.isArray(row.reasons)||!row.reasons.length)throw new Error('Missing dependency evidence: '+row.path);
    if(/^(?:tools|tests|docs|\.git|\.github)\//.test(row.path)||/(?:^|\/)(?:AGENTS\.md|[^/]*-qa\.(?:mjs|js|py)|[^/]*-fixtures\.(?:json|mjs))$/.test(row.path))throw new Error('Development file in publication: '+row.path);
    if(row.path.includes('/sources/')&&!publicDownloads.has(row.path))throw new Error('Unreviewed source publication: '+row.path);
  }
  for(const entry of manifest.entrypoints||[])if(!allowed.has(entry))throw new Error('Missing public entrypoint: '+entry);
  for(const download of publicDownloads)if(!allowed.has(download))throw new Error('Missing public download: '+download);
  return allowed;
}

/** Fail on a newly introduced literal module/resource dependency absent from
 * the reviewed allowlist. Data-driven asset sets remain explicit manifest rows. */
function checkModuleClosure(root,allowed){
  for(const relative of allowed){
    if(!relative.endsWith('.mjs'))continue;
    const source=fs.readFileSync(relativeFile(root,relative),'utf8');
    const requests=[...source.matchAll(/(?:\b(?:import|export)\s+(?:[^;"']*?\s+from\s*)?|\bimport\s*\()\s*["'](\.[^"']+)["']/g)].map(match=>match[1]);
    for(const match of source.matchAll(/new\s+URL\(\s*["']([^"']+)["']\s*,\s*import\.meta\.url\s*\)/g))if(!match[1].endsWith('/'))requests.push(match[1]);
    for(const request of requests){
      if(!request.startsWith('.'))continue;
      const resolved=new URL(request,'https://runtime.invalid/'+relative);
      const dependency=decodeURIComponent(resolved.pathname).slice(1);
      if(!allowed.has(dependency))throw new Error('Unlisted browser module/resource: '+relative+' -> '+dependency);
    }
  }
}

export function buildPagesRuntimePackage({sourceRoot=path.resolve(here,'..'),outRoot,manifestFile=manifestPath,check=false}={}){
  if(!outRoot)throw new Error('Explicit --out directory is required');
  sourceRoot=path.resolve(sourceRoot);outRoot=path.resolve(outRoot);
  if(outRoot===sourceRoot||sourceRoot.startsWith(outRoot+path.sep))throw new Error('Output cannot overwrite source or contain source');
  const manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8')),allowed=validateRuntimeManifest(manifest);
  for(const relative of allowed){
    const file=relativeFile(sourceRoot,relative),stat=fs.lstatSync(file);
    if(!stat.isFile()||stat.isSymbolicLink())throw new Error('Non-regular runtime input: '+relative);
  }
  checkModuleClosure(sourceRoot,allowed);
  // Every mandatory shell URL belongs to the native V2 publication.
  for(const url of readAppShell(sourceRoot).urls){
    const {relative}=resolveAppShellUrl(sourceRoot,url);
    if(!allowed.has(relative))throw new Error('Existing precache file omitted: '+url);
  }
  if(!check){
    if(fs.existsSync(outRoot)&&fs.readdirSync(outRoot).length)throw new Error('Refusing to overwrite a non-empty publish directory');
    fs.mkdirSync(outRoot,{recursive:true});
    for(const relative of [...allowed].sort()){
      const target=relativeFile(outRoot,relative);fs.mkdirSync(path.dirname(target),{recursive:true});
      if(relative==='.nojekyll')fs.writeFileSync(target,normalizeCacheText(fs.readFileSync(relativeFile(sourceRoot,relative),'utf8')),'utf8');
      else fs.copyFileSync(relativeFile(sourceRoot,relative),target);
    }
    writeCacheRevision({root:outRoot,manifest});
  }
  const files=[...allowed].sort().map(relative=>{
    // The static Pages marker has no gameplay data. Normalize its checkout-only
    // CRLF difference so Windows and Linux produce the same publication hash.
    const raw=fs.readFileSync(relativeFile(sourceRoot,relative));
    const input=relative==='.nojekyll'?Buffer.from(normalizeCacheText(raw.toString('utf8'))):raw;
    const published=fs.readFileSync(relativeFile(outRoot,relative));
    if(!generated.has(relative)&&!input.equals(published))throw new Error('Runtime input changed during packaging: '+relative);
    return {path:relative,bytes:published.length,sha256:hash(published),inputSha256:hash(input),
      ...(relative==='.nojekyll'?{inputNormalization:'CHECKOUT_EOL_TO_LF'}:{}),
      producer:generated.has(relative)?'EXISTING_OFFLINE_OR_CACHE_PRODUCER':relative==='.nojekyll'?'STATIC_MARKER_LF':'VERBATIM_RUNTIME_INPUT'};
  });
  const cache=verifyCacheRevision({root:outRoot,manifest});
  const unexpected=allFiles(outRoot).map(file=>path.relative(outRoot,file).replaceAll('\\','/')).filter(file=>!allowed.has(file)&&file!==reportName);
  if(unexpected.length)throw new Error('Unlisted publication files: '+unexpected.join(', '));
  const report={schema:'unified-v2-pages-runtime-package/v1',allowlistSha256:hash(normalizeCacheText(fs.readFileSync(manifestFile,'utf8'))),fileCount:files.length,
    runtimeBytes:files.reduce((sum,file)=>sum+file.bytes,0),contentSha256:hash(JSON.stringify(files.map(({path,bytes,sha256})=>({path,bytes,sha256})))),
    cacheRevision:cache.revision,precacheUrls:cache.urls.length,publicSourceDownloads:manifest.publicSourceDownloads,files};
  const expected=json(report),reportFile=path.join(outRoot,reportName);
  if(check){if(fs.readFileSync(reportFile,'utf8')!==expected)throw new Error('Stale publication manifest');}
  else fs.writeFileSync(reportFile,expected,'utf8');
  if(report.runtimeBytes+Buffer.byteLength(expected)>=1_000_000_000)throw new Error('Pages package exceeds 1GB');
  return {...report,publishedBytes:report.runtimeBytes+Buffer.byteLength(expected)};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const args=process.argv.slice(2),value=key=>args.includes(key)?args[args.indexOf(key)+1]:undefined;
    const report=buildPagesRuntimePackage({sourceRoot:value('--source'),outRoot:value('--out'),manifestFile:value('--manifest'),check:args.includes('--check')});
    console.log(JSON.stringify({status:'PASS',files:report.fileCount,publishedBytes:report.publishedBytes,contentSha256:report.contentSha256,cacheRevision:report.cacheRevision,precacheUrls:report.precacheUrls,checked:args.includes('--check')}));
  }catch(error){console.error(error.stack||error);process.exitCode=1;}
}
