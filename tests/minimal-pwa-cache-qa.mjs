/** Transport/cache policy tests. These are not faction facts or real exports. */
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {createHash,webcrypto} from 'node:crypto';
const source=fs.readFileSync(new URL('../service-worker.js',import.meta.url),'utf8');
const base='https://example.test/warhammer-rules-complete-preview/',prefix='warhammer-rules-fe1d435-',current=prefix+'aaaaaaaaaaaaaaaa',old=prefix+'previous';
const code='books/test/v2/module.mjs',data='books/test/v2/generated/payload.json';
const bodies={[code]:'CODE_A',[data]:'DATA_A','legacy-book.html':'CURRENT_V1'};
const assets=Object.fromEntries(Object.entries(bodies).map(([path,body])=>[path,{sha256:createHash('sha256').update(body).digest('hex'),bytes:Buffer.byteLength(body)}]));
const results=[];async function test(name,fn){await fn();results.push({name,status:'PASS'});}
function worker(options={}){
 const stores=options.stores||new Map(),listeners={},messages=[],warnings=[];let activation=0;
 const behavior={fetch:async request=>new Response(new URL(request.url||request,base).pathname.endsWith('cache-revision.js')?"self.WH40K_CACHE_REVISION='aaaaaaaaaaaaaaaa';":bodies[new URL(request.url||request,base).pathname.slice(new URL(base).pathname.length)]||'missing'),quota:false,corrupt:false,missingRead:false,afterPut:null};
 const key=request=>new URL(request.url||request,base).href;
 function cache(name){if(!stores.has(name))stores.set(name,new Map());const values=stores.get(name);return {
  async match(request,options){if(behavior.missingRead&&name.endsWith('-data'))return;const address=key(request);if(values.has(address))return values.get(address).clone();if(options?.ignoreSearch){for(const [url,value]of values)if(url.split('?')[0]===address.split('?')[0])return value.clone();}},
  async put(request,response){if(behavior.quota)throw new DOMException('Injected storage full','QuotaExceededError');values.set(key(request),behavior.corrupt?new Response('CORRUPTED_WRITE'):response.clone());behavior.afterPut?.();},
  async keys(){return [...values.keys()].map(url=>new Request(url));}
 };}
 const self={WH40K_CACHE_REVISION:'aaaaaaaaaaaaaaaa',WH40K_CACHE_BYTES:options.cacheBytes,WH40K_PRECACHE:options.precache||['./'+code],WH40K_RUNTIME_ASSETS:options.assets||assets,location:new URL(base+'service-worker.js'),registration:{active:{}},clients:{claim:async()=>{},matchAll:async()=>[],get:async()=>({postMessage:value=>messages.push(value)})},skipWaiting:async()=>{activation++;},addEventListener:(name,fn)=>listeners[name]=fn};
 const caches={open:async name=>cache(name),keys:async()=>[...stores.keys()],delete:async name=>stores.delete(name),async match(request,options){for(const name of stores.keys()){const value=await cache(name).match(request,options);if(value)return value;}}};
 const context=vm.createContext({MessageChannel,setTimeout,clearTimeout,self,URL,URLSearchParams,Request,Response,Promise,Set,Map,Uint8Array,crypto:webcrypto,console:{warn:(...args)=>warnings.push(args)},importScripts(){},fetch:request=>behavior.fetch(request),caches});
 vm.runInContext(source,context);const currentName=vm.runInContext('CACHE_NAME',context);self.registration.active={state:'activated',postMessage(message,ports){ports[0].postMessage({cacheName:currentName});}};
 async function request(path,options={}){let promise;listeners.fetch({clientId:'test-document',request:options.mode==='navigate'?{url:base+path,method:'GET',mode:'navigate'}:new Request(base+path),respondWith:value=>promise=value});return promise;}
 async function migrate(){let task,reply;listeners.message({data:{type:'WH_PWA_MIGRATE_V2_DATA'},ports:[{postMessage:value=>reply=value}],waitUntil:value=>task=value});await task;return reply;}
 return {stores,listeners,behavior,messages,warnings,cache,request,migrate,self,currentName,get activation(){return activation;}};
}
await test('V2 code is network-first and does not poison the prepared offline copy',async()=>{
 const w=worker();await w.cache(current).put(base+code,new Response('CODE_A'));w.behavior.fetch=async()=>new Response('CODE_B');
 assert.equal(await (await w.request(code)).text(),'CODE_B');assert.equal(await (await w.cache(current).match(base+code)).text(),'CODE_A');
});
await test('offline code is an exact compatible publication body',async()=>{
 const w=worker();await w.cache(current).put(base+code,new Response('CODE_A'));w.behavior.fetch=async()=>{throw new TypeError('network down');};
 assert.equal(await (await w.request(code)).text(),'CODE_A');
});
await test('foreign JSON is rejected before a consumer can parse it',async()=>{
 const w=worker();await w.cache(old).put(base+data,new Response('DATA_A'));w.behavior.fetch=async()=>new Response('DATA_B');
 assert.equal((await w.request(data)).status,409);assert.equal(w.messages[0].type,'WH_PWA_DATA_CHANGED');assert.equal(await (await w.cache(old).match(base+data)).text(),'DATA_A');
});
await test('a valid but foreign JSON document is also rejected before parsing',async()=>{
 const w=worker();w.behavior.fetch=async()=>new Response(JSON.stringify({book:{id:'transport-only'},revision:'B'}),{headers:{'content-type':'application/json'}});
 assert.equal((await w.request(data)).status,409);
});
await test('an unchanged old book remains accessible offline after activation',async()=>{
 const w=worker();await w.cache(old).put(base+data,new Response('DATA_A'));let activated;w.listeners.activate({waitUntil:value=>activated=value});await activated;
 w.behavior.fetch=async()=>{throw new TypeError('offline');};assert.equal(await (await w.request(data)).text(),'DATA_A');assert.equal(w.stores.has(old),false);assert.equal(await (await w.cache(current+'-data').match(base+data)).text(),'DATA_A');
});
await test('an incompatible old offline JSON is not substituted',async()=>{
 const w=worker();await w.cache(old).put(base+data,new Response('FOREIGN_DATA'));w.behavior.fetch=async()=>{throw new TypeError('offline');};assert.equal((await w.request(data)).status,503);
});
await test('failed cache writes do not replace a successful network response or erase old books',async()=>{
 const w=worker();await w.cache(old).put(base+data,new Response('DATA_A'));w.behavior.quota=true;assert.equal(await (await w.request(code)).text(),'CODE_A');assert.equal(w.warnings.length,1);assert.equal(await (await w.cache(old).match(base+data)).text(),'DATA_A');
});
await test('quota failure during install cannot activate or delete the previous cache',async()=>{
 const w=worker();await w.cache(old).put(base+data,new Response('DATA_A'));w.behavior.quota=true;let install;
 w.listeners.install({waitUntil:value=>install=value});await assert.rejects(install,/storage full/);
 let reply,task;w.listeners.message({data:{type:'SKIP_WAITING',revision:'aaaaaaaaaaaaaaaa'},ports:[{postMessage:value=>reply=value}],waitUntil:value=>task=value});if(task)await task;
 assert.equal(reply.accepted,false);assert.equal(w.activation,0);assert.ok(w.stores.has(old));
});
await test('the version oracle bypasses a stale cache even for the same URL',async()=>{
 const w=worker(),path='glossary/generated/cache-revision.js?version-check=fresh';await w.cache(old).put(base+path,new Response('OLD_ORACLE'));w.behavior.fetch=async()=>new Response('FRESH_ORACLE');assert.equal(await (await w.request(path)).text(),'FRESH_ORACLE');
});
await test('current V1 fallback outranks retained previous copies',async()=>{
 const w=worker();await w.cache(old).put(base+'legacy-book.html',new Response('OLD_V1'));await w.cache(current).put(base+'legacy-book.html',new Response('CURRENT_V1'));w.behavior.fetch=async()=>{throw new TypeError('offline');};assert.equal(await (await w.request('legacy-book.html',{mode:'navigate'})).text(),'CURRENT_V1');
});
await test('same semantic revision and different raw bytes cannot overwrite an active cache during a failed install',async()=>{
 const stores=new Map(),oldBody='CODE_A\r\n',newBody='CODE_A\n',hash=body=>({sha256:createHash('sha256').update(body).digest('hex'),bytes:Buffer.byteLength(body)});
 const a=worker({stores,cacheBytes:'1111111111111111',assets:{[code]:hash(oldBody)}});
 const b=worker({stores,cacheBytes:'2222222222222222',assets:{[code]:hash(newBody),'required-two.js':hash('second')},precache:['./'+code,'./required-two.js']});
 assert.notEqual(a.currentName,b.currentName);await a.cache(a.currentName).put(base+code,new Response(oldBody));
 b.behavior.fetch=async request=>{if(new URL(request.url||request,base).pathname.endsWith('cache-revision.js'))return new Response("self.WH40K_CACHE_REVISION='aaaaaaaaaaaaaaaa';");if(String(request.url||request).includes('required-two'))throw new TypeError('interrupted install');return new Response(newBody);};
 let install;b.listeners.install({waitUntil:value=>install=value});await assert.rejects(install,/interrupted install/);
 // The parallel first download may finish after the rejecting second download.
 await new Promise(resolve=>setTimeout(resolve,10));
 assert.equal(await (await a.cache(a.currentName).match(base+code)).text(),oldBody);
 a.behavior.fetch=async()=>{throw new TypeError('offline');};assert.equal(await (await a.request(code)).text(),oldBody);
});
await test('migration drops changed and non-publication data, V1 and own old caches but not unrelated caches',async()=>{
 const w=worker(),other='other-application';
 await w.cache(old).put(base+data+'?old=1',new Response('DATA_A'));
 await w.cache(old+'-data').put(base+data,new Response('CHANGED'));
 await w.cache(old).put(base+'books/foreign/v2/unknown.json',new Response('UNKNOWN'));
 await w.cache(old).put(base+'legacy-book.html',new Response('OLD_V1'));
 await w.cache(other).put(base+'other',new Response('OTHER'));
 const result=await w.migrate();assert.equal(result.status,'complete');assert.equal(result.transferred,1);
 assert.equal(w.stores.has(old),false);assert.equal(w.stores.has(old+'-data'),false);assert.ok(w.stores.has(other));
 assert.deepEqual([...w.stores.get(current+'-data').keys()],[base+data]);
});
await test('copy failure keeps every old cache, next startup message retries without another activation',async()=>{
 const w=worker();await w.cache(old).put(base+data,new Response('DATA_A'));await w.cache(old+'-v1').put(base+'legacy-book.html',new Response('OLD_V1'));
 w.behavior.quota=true;assert.equal((await w.migrate()).status,'failed');assert.ok(w.stores.has(old));assert.ok(w.stores.has(old+'-v1'));
 w.behavior.quota=false;const restarted=worker({stores:w.stores});assert.equal((await restarted.migrate()).status,'complete');assert.equal(w.stores.has(old),false);assert.equal(w.stores.has(old+'-v1'),false);
 w.behavior.fetch=async()=>{throw new TypeError('offline');};assert.equal(await (await w.request(data)).text(),'DATA_A');
});
await test('a missing or corrupted destination prevents deletion even after cache.put succeeds',async()=>{
 const w=worker();await w.cache(old).put(base+data,new Response('DATA_A'));w.behavior.corrupt=true;
 assert.equal((await w.migrate()).status,'failed');assert.ok(w.stores.has(old));
 w.behavior.corrupt=false;w.behavior.missingRead=true;assert.equal((await w.migrate()).status,'failed');assert.ok(w.stores.has(old));
 w.behavior.missingRead=false;assert.equal((await w.migrate()).status,'complete');assert.equal(w.stores.has(old),false);
});
await test('another installing or waiting publication defers cleanup',async()=>{
 const w=worker();await w.cache(old).put(base+data,new Response('DATA_A'));
 for(const field of ['installing','waiting']){w.self.registration[field]={state:'installed'};assert.equal((await w.migrate()).status,'deferred');assert.ok(w.stores.has(old));delete w.self.registration[field];}
 assert.equal((await w.migrate()).status,'complete');
});
await test('an update starting during transfer prevents deletion of its prepared cache',async()=>{
 const w=worker();await w.cache(old).put(base+data,new Response('DATA_A'));
 w.behavior.afterPut=()=>{w.self.registration.installing={state:'installing'};};
 assert.equal((await w.migrate()).status,'deferred');assert.ok(w.stores.has(old));
 delete w.self.registration.installing;w.behavior.afterPut=null;assert.equal((await w.migrate()).status,'complete');
});
await test('a superseded worker cannot delete the newly active publication cache',async()=>{
 const w=worker();const future=prefix+'bbbbbbbbbbbbbbbb';await w.cache(old).put(base+data,new Response('DATA_A'));await w.cache(future).put(base+code,new Response('CODE_B'));
 w.self.registration.active={state:'activated',postMessage(message,ports){ports[0].postMessage({cacheName:future});}};
 assert.equal((await w.migrate()).status,'deferred');assert.ok(w.stores.has(future));assert.ok(w.stores.has(old));
});
await test('activation during transfer cannot let the superseded worker clean the new cache',async()=>{
 const w=worker();const future=prefix+'bbbbbbbbbbbbbbbb';await w.cache(old).put(base+data,new Response('DATA_A'));await w.cache(future).put(base+code,new Response('CODE_B'));
 w.behavior.afterPut=()=>{w.self.registration.active={state:'activated',postMessage(message,ports){ports[0].postMessage({cacheName:future});}};};
 assert.equal((await w.migrate()).status,'deferred');assert.ok(w.stores.has(future));assert.ok(w.stores.has(old));
});
await test('missing publication integrity inventory never permits old-cache deletion',async()=>{
 const w=worker({assets:{}});await w.cache(old).put(base+data,new Response('DATA_A'));
 assert.equal((await w.migrate()).status,'failed');assert.ok(w.stores.has(old));
});
await test('each published Army Book uses the same hash-only migration boundary',async()=>{
 const books=['death-guard','adeptus-mechanicus','chaos-space-marines','emperors-children','tyranids','tau-empire','space-marines','dark-angels','blood-angels'];
 const inventory=Object.fromEntries(books.map(book=>[`books/${book}/v2/generated/app-presentation.json`,{sha256:createHash('sha256').update(book).digest('hex'),bytes:book.length}]));
 const w=worker({assets:inventory});for(const book of books)await w.cache(old).put(base+`books/${book}/v2/generated/app-presentation.json`,new Response(book));
 assert.equal((await w.migrate()).transferred,9);assert.equal(w.stores.has(old),false);
 for(const book of books)assert.equal(await (await w.cache(current+'-data').match(base+`books/${book}/v2/generated/app-presentation.json`)).text(),book);
});
await test('restarted waiting worker accepts explicit consent only for a complete current prepared shell',async()=>{
 const stores=new Map(),prepared=worker({stores});await prepared.cache(current).put(base+code,new Response('CODE_A'));
 async function activate(w,revision){let reply,task;w.listeners.message({data:{type:'SKIP_WAITING',revision},ports:[{postMessage:value=>reply=value}],waitUntil:value=>task=value});await task;return reply;}
 const resumed=worker({stores});assert.equal((await activate(resumed,'aaaaaaaaaaaaaaaa')).accepted,true);assert.equal(resumed.activation,1);
 const wrong=worker({stores});assert.equal((await activate(wrong,'wrong-publication')).accepted,false);assert.equal(wrong.activation,0);
 const incomplete=worker({stores,precache:['./'+code,'./missing-shell.mjs']});assert.equal((await activate(incomplete,'aaaaaaaaaaaaaaaa')).accepted,false);assert.equal(incomplete.activation,0);
});
await test('migration is idempotent and never fetches books',async()=>{
 const w=worker();await w.cache(old).put(base+data,new Response('DATA_A'));w.behavior.fetch=async()=>{throw new Error('Migration must not fetch');};
 assert.equal((await w.migrate()).status,'complete');assert.equal((await w.migrate()).status,'complete');assert.equal(await (await w.cache(current+'-data').match(base+data)).text(),'DATA_A');
});
console.log(JSON.stringify({status:'PASS',checks:results.length,results},null,2));
