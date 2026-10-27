/** Native publication dependency closure and exact mandatory URL checks. */
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
import {armyBooks} from '../v2/army-books.mjs';
import {readAppShell,resolveAppShellUrl,calculateCacheRevision} from '../tools/cache-revision.mjs';
import {validateRuntimeManifest} from '../tools/pages-runtime-package.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const manifest=JSON.parse(read('tools/pages-runtime-manifest.json')),allowed=validateRuntimeManifest(manifest),dependencies=[];
const resolve=(relative,request,admitted=allowed)=>{const u=new URL(request,'https://runtime.invalid/'+relative);if(u.origin!=='https://runtime.invalid')return;const dependency=decodeURIComponent(u.pathname).slice(1);assert(admitted.has(dependency),`Unlisted native dependency: ${relative} -> ${dependency}`);assert(fs.existsSync(path.join(root,dependency)),`Missing native dependency: ${relative} -> ${dependency}`);return dependency;};
for(const relative of allowed){
 assert(fs.statSync(path.join(root,relative)).isFile(),'Non-file publication input '+relative);
 if(!relative.endsWith('.mjs'))continue;const source=read(relative),requests=[...source.matchAll(/(?:\b(?:import|export)\s+(?:[^;"']*?\s+from\s*)?|\bimport\s*\()\s*["'](\.[^"']+)["']/g)].map(m=>m[1]);
 for(const m of source.matchAll(/new\s+URL\(\s*["']([^"']+)["']\s*,\s*import\.meta\.url\s*\)/g))if(!m[1].endsWith('/'))requests.push(m[1]);
 for(const request of requests)if(request.startsWith('.'))dependencies.push({from:relative,to:resolve(relative,request)});
}
const shell=readAppShell(root);assert.equal(shell.urls.length,new Set(shell.urls).size);for(const url of shell.urls){const {relative}=resolveAppShellUrl(root,url);assert(allowed.has(relative),'Mandatory URL not in runtime manifest '+url);}
const revision=calculateCacheRevision({root});assert(revision.assets.length>=allowed.size-1);assert(revision.urls.length>0);for(const p of ['books/shared/datasheet-system.css','books/shared/unit-art.css'])assert(revision.urls.includes('./'+p),'Missing mandatory native CSS '+p);
assert(revision.urls.includes('./books/core-rules/reader/app.js?v=18'),'Exact active Core script query missing');assert(!revision.urls.includes('./books/core-rules/reader/app.js?v=17'),'Obsolete Core script query remains');assert(!revision.urls.some(u=>u.includes('glossary/v2/generated/')),'Large glossary data must remain lazy');
for(const b of armyBooks)assert(allowed.has(`books/${b.id}/v2/generated/app-presentation.json`));
const missing=new Set(allowed);missing.delete('v2/army-books.mjs');assert.throws(()=>resolve('v2/boot.mjs','./army-books.mjs',missing),/Unlisted/,'missing module negative control');assert.throws(()=>resolve('v2/boot.mjs','./invented.mjs'),/Unlisted/,'invented module negative control');
assert(![...allowed].some(p=>p.startsWith('books/orks/')||p.startsWith('roster-guides/')),'Retired/held runtime re-enrolled');
console.log(JSON.stringify({status:'PASS',books:armyBooks.length,runtimeFiles:allowed.size,moduleEdges:dependencies.length,mandatoryUrls:revision.urls.length,scope:'Native V2 dependencies; no legacy publication producers or freshness subprocesses'}));
