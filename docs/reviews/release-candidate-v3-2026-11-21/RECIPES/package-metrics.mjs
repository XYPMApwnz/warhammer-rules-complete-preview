import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {resolveAppShellUrl} from 'file:///E:/Warhammer/qa-tmp/release-candidate/candidate/tools/cache-revision.mjs';
const out='E:/Warhammer/qa-evidence/release-candidate-v3-2026-11-21';
const root='E:/Warhammer/qa-tmp/release-candidate/runtime-e3db1b34';
const hash=b=>createHash('sha256').update(b).digest('hex');
const manifestBytes=fs.readFileSync(root+'/PAGES_RUNTIME_MANIFEST.json');
const manifest=JSON.parse(manifestBytes);
assert(manifestBytes.equals(fs.readFileSync('E:/Warhammer/qa-evidence/browser-compat-v1-2026-11-20/pre-ff/RUNTIME_MANIFEST.json')),'Candidate runtime differs from the 202/202 accepted publication');
const files=new Map(manifest.files.map(row=>[row.path,row]));
for(const row of manifest.files){const bytes=fs.readFileSync(path.join(root,row.path));assert.equal(bytes.length,row.bytes);assert.equal(hash(bytes),row.sha256);}
const cacheText=fs.readFileSync(root+'/glossary/generated/cache-revision.js','utf8');
const match=cacheText.match(/self\.WH40K_PRECACHE=(\[[^\n]*\]);/);assert(match);
const urls=JSON.parse(match[1]);assert.equal(urls.length,manifest.precacheUrls);
const gzip=new Map();
const precache=urls.map(url=>{const {relative}=resolveAppShellUrl(root,url);const row=files.get(relative);assert(row);if(!gzip.has(relative))gzip.set(relative,gzipSync(fs.readFileSync(path.join(root,relative)),{level:9}).length);return{url,path:relative,bytes:row.bytes,gzipBytes:gzip.get(relative),sha256:row.sha256};});
const unique=[...new Map(precache.map(row=>[row.path,row])).values()];
const report={status:'PASS',root,candidate:'e3db1b345eca989436eea7af758900eee7795203',runtimeFiles:manifest.fileCount,physicalFiles:manifest.fileCount+1,
 runtimeBytes:manifest.runtimeBytes,manifestBytes:manifestBytes.length,publishedBytes:manifest.runtimeBytes+manifestBytes.length,
 aggregateSha256:manifest.contentSha256,manifestFileSha256:hash(manifestBytes),cacheRevision:manifest.cacheRevision,
 precache:{urls:urls.length,urlBodyBytes:precache.reduce((n,row)=>n+row.bytes,0),urlBodyGzipBytes:precache.reduce((n,row)=>n+row.gzipBytes,0),
 uniqueBodies:unique.length,uniqueBytes:unique.reduce((n,row)=>n+row.bytes,0),uniqueGzipBytes:unique.reduce((n,row)=>n+row.gzipBytes,0),gzipLevel:9,entries:precache},
 accepted202JobRuntime:{sha:'b0aa1273b907020776dec41ca0466d646e5435e2',manifestByteIdentical:true,all456BodiesVerified:true}};
fs.writeFileSync(out+'/PACKAGE_METRICS.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,precache:{...report.precache,entries:undefined}}));
