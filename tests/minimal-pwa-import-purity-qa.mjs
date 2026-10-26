import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {pathToFileURL,fileURLToPath} from 'node:url';
// Read-only real adapters; no constructed faction facts or exports.
const root=fileURLToPath(new URL('../',import.meta.url)).replace(/[\\\/]$/,'');
const books=['death-guard','adeptus-mechanicus','chaos-space-marines','emperors-children','tyranids','tau-empire','space-marines','dark-angels','blood-angels'];
const files=books.map(b=>`books/${b}/v2/${b==='adeptus-mechanicus'?'roster-runtime':'roster-boot'}.mjs`).concat(['books/core-rules/reader/mount.mjs']);
const effects=[],reads=[];
for(const key of ['window','document','localStorage','sessionStorage'])Object.defineProperty(globalThis,key,{configurable:true,get(){effects.push('read:'+key);throw new Error('Browser global touched at module evaluation: '+key);}});
for(const key of ['addEventListener','setTimeout','setInterval'])globalThis[key]=()=>{effects.push('call:'+key);throw new Error('External call: '+key);};
globalThis.fetch=async url=>{
 const u=new URL(url);assert.equal(u.protocol,'file:');const p=fileURLToPath(u);assert.ok(p.startsWith(path.resolve(root)+path.sep));reads.push(path.relative(root,p));return new Response(fs.readFileSync(p),{headers:{'content-type':'application/json'}});
};
const globalKeysBefore=Reflect.ownKeys(globalThis).map(String).sort();const modules=[];
for(const file of files){const before=reads.length;const m=await import(pathToFileURL(path.join(root,file)).href);assert.equal(reads.length,before,'Module evaluation fetched data');modules.push(m);}
assert.deepEqual(Reflect.ownKeys(globalThis).map(String).sort(),globalKeysBefore,'Module evaluation changed global keys');assert.deepEqual(effects,[]);
const factories=[];
for(let i=0;i<books.length;i++){
 const before=reads.length;const service=await modules[i].createBrowserRoster();
 factories.push({book:books[i],status:'PASS',readOnlyInputs:reads.slice(before),state:service.state??null});
 assert.deepEqual(effects,[],'Factory touched browser state');
 assert.equal(service.state??null,null,'Factory prepared a user roster before mount');
}
const report={status:'PASS',scope:'Actual unchanged roster-boot entry graphs for nine books plus Core mount, Node ESM evaluation; browser globals and timers trapped. No runtime browser/network mutation performed.',moduleEvaluationExternalEffects:effects,moduleEvaluationFetchedData:false,globalKeysChanged:false,factories,limits:'Does not prove future published modules have no side effects. Does not test mixed-version semantic compatibility or prevent execution of a future module before a post-check.'};
console.log(JSON.stringify(report,null,2));
