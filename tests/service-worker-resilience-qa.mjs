import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash,webcrypto} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');

function workerRuntime(){
  const listeners={},warnings=[],cacheMatches=[],puts=[];
  let skipWaitingCalls=0;
  const behavior={fetch:async request=>new Response(String(request?.url||request).includes('cache-revision.js')?'self.WH40K_CACHE_REVISION="testrevision";':'network',{status:200}),put:async()=>{},match:async()=>undefined};
  const self={
    location:new URL('https://example.test/service-worker.js'),
    WH40K_CACHE_REVISION:'testrevision',
    WH40K_PRECACHE:['./install-one.js','./install-two.js'],
    WH40K_RUNTIME_ASSETS:Object.fromEntries(['install-one.js','install-two.js'].map(path=>[path,{sha256:createHash('sha256').update('network').digest('hex'),bytes:7}])),
    registration:{active:{}},
    clients:{claim:async()=>{},matchAll:async()=>[]},
    skipWaiting:async()=>{skipWaitingCalls+=1;},
    addEventListener(type,listener){listeners[type]=listener;}
  };
  const context=vm.createContext({
    URL,URLSearchParams,Request,Response,Promise,Set,crypto:webcrypto,
    self,
    importScripts(){},
    console:{warn(...args){warnings.push(args);}},
    fetch(request){return behavior.fetch(request);},
    caches:{
      keys:async()=>[],
      delete:async()=>true,
      open:async()=>({
        add:async()=>{},
        keys:async()=>[],
        match:async(key,options)=>{cacheMatches.push({key,options});return behavior.match(key,options);},
        async put(key,response){puts.push({key,response});return behavior.put(key,response);}
      }),
      async match(key,options){cacheMatches.push({key,options});return behavior.match(key,options);}
    }
  });
  vm.runInContext(source,context,{filename:'service-worker.js'});
  return {context,listeners,warnings,cacheMatches,puts,behavior,get skipWaitingCalls(){return skipWaitingCalls;}};
}

function fallback(runtime,url){
  runtime.context.testUrl=new URL(url);
  return vm.runInContext('navigationFallback(testUrl)',runtime.context);
}

async function fetchAndCache(runtime,request){
  runtime.context.testRequest=request;
  return vm.runInContext('fetchAndCache(testRequest)',runtime.context);
}

async function dispatchFetch(runtime,request){
  let responsePromise;
  runtime.listeners.fetch({request,respondWith(value){responsePromise=value;}});
  assert.ok(responsePromise,'Service Worker did not handle the same-origin GET');
  return responsePromise;
}

async function dispatchMessage(runtime,data){
  let reply,waited=Promise.resolve();
  runtime.listeners.message({data,ports:[{postMessage(value){reply=value;}}],waitUntil(value){waited=value;}});
  await waited;
  return reply;
}

const routing=workerRuntime();
for(const url of ['https://example.test/','https://example.test/v2/app.html','https://example.test/missing-page'])assert.equal(fallback(routing,url),'./v2/app.html','Offline navigation must return the single native entry');
assert.equal(vm.runInContext("APP_SHELL.some(url=>url.includes('roster-guides')||url.includes('/mobile/'))",routing.context),false,'Legacy UI entered mandatory shell');

const successfulWrite=workerRuntime();
const written=await fetchAndCache(successfulWrite,{url:'https://example.test/assets/example.js'});
assert.equal(await written.text(),'network','successful network response changed when the cache write succeeded');
assert.equal(successfulWrite.puts.length,1,'successful response was not written to the runtime cache');
assert.equal(successfulWrite.warnings.length,0,'successful cache write was reported as a failure');

const rejectedWrite=workerRuntime();
const writeFailure=new Error('injected cache.put rejection');
rejectedWrite.behavior.put=async()=>{throw writeFailure;};
const unhandled=[];
const recordUnhandled=reason=>unhandled.push(reason);
process.on('unhandledRejection',recordUnhandled);
try{
  const response=await dispatchFetch(rejectedWrite,{method:'GET',mode:'navigate',url:'https://example.test/books/space-marines/index.html'});
  assert.equal(response.status,200,'cache.put rejection replaced the successful network status');
  assert.equal(await response.text(),'network','cache.put rejection replaced the successful network body');
  await new Promise(resolve=>setImmediate(resolve));
}finally{
  process.off('unhandledRejection',recordUnhandled);
}
assert.equal(rejectedWrite.puts.length,1,'cache.put rejection was not injected');
assert.equal(rejectedWrite.warnings.length,1,'cache.put rejection was not reported once');
assert.match(String(rejectedWrite.warnings[0][0]),/cache write failed/i,'cache.put rejection report lacks cache-write context');
assert.equal(rejectedWrite.warnings[0][1],writeFailure,'cache.put rejection report lost the original error');
assert.deepEqual(rejectedWrite.cacheMatches,[],'cache.put rejection incorrectly activated the offline fallback chain');
assert.deepEqual(unhandled,[],'cache.put rejection escaped as an unhandled rejection');

const failedFetch=workerRuntime();
failedFetch.behavior.fetch=async()=>{throw new TypeError('injected network failure');};
failedFetch.behavior.match=async key=>key==='./books/chaos-space-marines/index.html'?new Response('cached book entry',{status:200}):undefined;
const fallbackResponse=await dispatchFetch(failedFetch,{method:'GET',mode:'navigate',url:'https://example.test/books/chaos-space-marines/index.html'});
assert.equal(await fallbackResponse.text(),'cached book entry','true network failure did not retain navigation fallback behavior');
assert.equal(failedFetch.puts.length,0,'failed network request attempted a cache write');

const lifecycle=workerRuntime();
let installed;
lifecycle.listeners.install({waitUntil(value){installed=value;}});
await installed;
assert.equal(lifecycle.skipWaitingCalls,0,'A successfully cached update activated before user confirmation');
const version=await dispatchMessage(lifecycle,{type:'GET_VERSION'});
assert.deepEqual(JSON.parse(JSON.stringify(version)),{type:'VERSION',revision:'testrevision',cacheName:'warhammer-rules-fe1d435-testrevision'},'Version query did not expose the worker cache identity');
const rejectedActivation=await dispatchMessage(lifecycle,{type:'SKIP_WAITING',revision:'wrongrevision'});
assert.equal(rejectedActivation.accepted,false,'Waiting worker accepted an activation request for another revision');
assert.equal(lifecycle.skipWaitingCalls,0,'Rejected activation request called skipWaiting');
const acceptedActivation=await dispatchMessage(lifecycle,{type:'SKIP_WAITING',revision:'testrevision'});
assert.equal(acceptedActivation.accepted,true,'Ready waiting worker rejected explicit activation');
assert.equal(lifecycle.skipWaitingCalls,1,'Explicit activation did not call skipWaiting exactly once');

console.log('Service Worker resilience QA passed: offline routes, cache-write isolation, network fallback, and explicit update activation.');
