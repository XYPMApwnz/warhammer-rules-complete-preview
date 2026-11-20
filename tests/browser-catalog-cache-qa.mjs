/** The newly lazy catalog retains the existing exact-body migration boundary. */
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash,webcrypto} from 'node:crypto';

const source=fs.readFileSync(new URL('../service-worker.js',import.meta.url),'utf8');
const base='https://example.test/warhammer-rules-complete-preview/';
const old='warhammer-rules-fe1d435-previous';
const catalog='books/shared/source-refs-v2/source-catalog.json';
const body='{"sourceCatalog":"accepted-current-bytes"}\n';
const asset=value=>({sha256:createHash('sha256').update(value).digest('hex'),bytes:Buffer.byteLength(value)});
const catalogAsset=asset(body),results=[];
const test=async(name,check)=>{await check();results.push({name,status:'PASS'});};

// A transport-only cache fixture executes the real worker. It contains no Army
// facts and does not substitute application catalog or roster behavior.
function worker({assets={[catalog]:catalogAsset},stores=new Map(),workerSource=source}={}){
 const listeners={},warnings=[];
 const behavior={quota:false,corrupt:false,missingRead:false,fetch:async()=>{throw new TypeError('offline');}};
 const key=request=>new URL(request.url||request,base).href;
 function cache(name){
  if(!stores.has(name))stores.set(name,new Map());const values=stores.get(name);
  return {
   async match(request){if(behavior.missingRead&&name.endsWith('-data'))return;return values.get(key(request))?.clone();},
   async put(request,response){
    if(behavior.quota)throw new DOMException('Injected storage full','QuotaExceededError');
    values.set(key(request),behavior.corrupt?new Response('CORRUPTED_WRITE'):response.clone());
   },
   async keys(){return [...values.keys()].map(url=>new Request(url));}
  };
 }
 const self={WH40K_CACHE_REVISION:'aaaaaaaaaaaaaaaa',WH40K_PRECACHE:[],WH40K_RUNTIME_ASSETS:assets,
  location:new URL('service-worker.js',base),registration:{active:{}},
  clients:{claim:async()=>{},matchAll:async()=>[],get:async()=>({postMessage(){}})},skipWaiting:async()=>{},
  addEventListener:(name,listener)=>{listeners[name]=listener;}};
 const caches={open:async name=>cache(name),keys:async()=>[...stores.keys()],delete:async name=>stores.delete(name),
  async match(request){for(const name of stores.keys()){const value=await cache(name).match(request);if(value)return value;}}};
 const context=vm.createContext({self,caches,URL,URLSearchParams,Request,Response,Promise,Set,Map,Uint8Array,
  MessageChannel,setTimeout,clearTimeout,crypto:webcrypto,console:{warn:(...args)=>warnings.push(args)},
  importScripts(){},fetch:request=>behavior.fetch(request)});
 vm.runInContext(workerSource,context);const current=vm.runInContext('CACHE_NAME',context);
 self.registration.active={state:'activated',postMessage(message,ports){ports[0].postMessage({cacheName:current});}};
 return {stores,cache,behavior,warnings,current,
  async migrate(){let task,result;listeners.message({data:{type:'WH_PWA_MIGRATE_V2_DATA'},
   ports:[{postMessage:value=>{result=value;}}],waitUntil:value=>{task=value;}});await task;return result;},
  async request(relative){let task;listeners.fetch({clientId:'catalog-offline',request:new Request(base+relative),
   respondWith:value=>{task=value;}});return task;}
 };
}

async function acceptedCatalog(workerSource=source){
 const lookalike='books/shared/source-refs-v2/source-catalog.other.json';
 const shared='books/shared/other-source-metadata.json';
 const w=worker({workerSource,assets:{[catalog]:catalogAsset,[lookalike]:catalogAsset,[shared]:catalogAsset}});
 await w.cache(old).put(base+catalog+'?previous=1',new Response(body));
 await w.cache(old).put(base+lookalike,new Response(body));await w.cache(old).put(base+shared,new Response(body));
 await w.cache('unrelated-application').put(base+'foreign',new Response('KEEP'));
 const result=await w.migrate();assert.equal(result.status,'complete');assert.equal(result.transferred,1);
 assert.equal(w.stores.has(old),false);assert.equal(w.stores.has('unrelated-application'),true);
 assert.deepEqual([...w.stores.get(w.current+'-data').keys()],[base+catalog]);
 assert.equal(await(await w.cache(w.current+'-data').match(base+catalog)).text(),body);
 assert.equal(await w.cache(w.current+'-data').match(base+lookalike),undefined);
 assert.equal(await w.cache(w.current+'-data').match(base+shared),undefined);
 assert.equal(await(await w.request(catalog+'?previous=1')).text(),body,'Offline access uses exact compatible migrated bytes');
}
await test('only the exact unchanged lazy catalog migrates to a canonical URL and remains offline-readable',()=>acceptedCatalog());
await test('changed and unlisted catalog bodies cannot migrate or become offline fallbacks',async()=>{
 for(const [label,assets,value]of [['changed',{[catalog]:catalogAsset},'STALE_CATALOG'],['unlisted',{'unrelated.txt':asset('OTHER')},body]]){
  const w=worker({assets});await w.cache(old).put(base+catalog,new Response(value));
  const result=await w.migrate();assert.equal(result.status,'complete',label);assert.equal(result.transferred,0,label);
  assert.equal(await w.cache(w.current+'-data').match(base+catalog),undefined,label);
  assert.equal((await w.request(catalog)).status,503,label);
 }
});
await test('quota failure retains every old cache and the next startup retries without another activation',async()=>{
 const stores=new Map(),w=worker({stores});await w.cache(old).put(base+catalog+'?v=old',new Response(body));
 await w.cache(old+'-data').put(base+'legacy-book.html',new Response('OLD'));
 w.behavior.quota=true;assert.equal((await w.migrate()).status,'failed');assert.ok(stores.has(old));assert.ok(stores.has(old+'-data'));
 const next=worker({stores});assert.equal((await next.migrate()).status,'complete');assert.equal(stores.has(old),false);assert.equal(stores.has(old+'-data'),false);
 assert.equal(await(await next.request(catalog)).text(),body);
});
await test('corrupted destination SHA prevents old-cache deletion and a verified retry recovers',async()=>{
 const w=worker();await w.cache(old).put(base+catalog,new Response(body));w.behavior.corrupt=true;
 assert.equal((await w.migrate()).status,'failed');assert.ok(w.stores.has(old));
 w.behavior.corrupt=false;assert.equal((await w.migrate()).status,'complete');assert.equal(w.stores.has(old),false);
 assert.equal(await(await w.request(catalog)).text(),body);
});
await test('missing destination read-back prevents old-cache deletion',async()=>{
 const w=worker();await w.cache(old).put(base+catalog,new Response(body));w.behavior.missingRead=true;
 assert.equal((await w.migrate()).status,'failed');assert.ok(w.stores.has(old));
 w.behavior.missingRead=false;assert.equal((await w.migrate()).status,'complete');assert.equal(w.stores.has(old),false);
});
await test('migration never fetches the lazy catalog and repeats idempotently',async()=>{
 const w=worker();await w.cache(old).put(base+catalog,new Response(body));
 w.behavior.fetch=()=>assert.fail('Migration must not fetch a catalog or book');
 assert.equal((await w.migrate()).transferred,1);assert.equal((await w.migrate()).transferred,0);
 assert.equal(await(await w.cache(w.current+'-data').match(base+catalog)).text(),body);
});
await test('negative control: removing the exact catalog exception rejects the valid migration scenario',async()=>{
 const token="&&item!=='books/shared/source-refs-v2/source-catalog.json'";
 assert.equal(source.split(token).length,2,'One exact migration exception is required');
 await assert.rejects(acceptedCatalog(source.replace(token,'')),{code:'ERR_ASSERTION'});
});
console.log(JSON.stringify({status:'PASS',checks:results.length,sourceCatalogPath:catalog,oldTestExpectationsChanged:false,
 shaGuardsRetained:true,exactPathOnly:true,results}));
