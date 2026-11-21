/** Revision-scoped transport controls; no canonical/gameplay expectations. */
import assert from 'node:assert/strict';
import {stagedWorker,workerBase,revisionA,revisionB} from './helpers/pwa-worker-harness.mjs';
const code='books/test/v2/module.mjs',marked=code+'?wh-pwa='+revisionA;
const results=[];const test=async(name,fn)=>{await fn();results.push({name,status:'PASS'});};
await test('current tagged code uses only a hash-verified current cache without a download',async()=>{
  const w=stagedWorker();await w.cache(w.name).put(workerBase+code,new Response('CODE_A'));
  w.behavior.fetch=async()=>assert.fail('Verified current bytes must not be downloaded twice');
  assert.equal(await(await w.request(marked)).text(),'CODE_A');assert.equal(await(await w.cache(w.name).match(workerBase+code)).text(),'CODE_A');
});
await test('corrupted current cache is never served and is repaired by a verified network response',async()=>{
  const w=stagedWorker();await w.cache(w.name).put(workerBase+code,new Response('CORRUPTED_WRITE'));
  assert.equal(await(await w.request(marked)).text(),'CODE_A');assert.equal(w.downloads.length,1);
  assert.equal(await(await w.cache(w.name).match(workerBase+code)).text(),'CODE_A');
});
await test('foreign tagged JavaScript is refused before execution and cannot poison the cache',async()=>{
  const w=stagedWorker();w.behavior.fetch=async()=>new Response('CODE_B');
  assert.equal((await w.request(marked)).status,409);assert.equal(w.messages[0].type,'WH_PWA_DATA_CHANGED');assert.equal(await w.cache(w.name).match(workerBase+code),undefined);
  assert.equal((await w.request('books/test/v2/unlisted.mjs?wh-pwa='+revisionA)).status,409);
});
await test('new active publication downloads its own code rather than reusing the previous revision',async()=>{
  const a=stagedWorker();await a.cache(a.name).put(workerBase+code,new Response('CODE_A'));
  const b=stagedWorker({revision:revisionB,bodies:{[code]:'CODE_B'},stores:a.stores});
  assert.notEqual(a.name,b.name);assert.equal(await(await b.request(code+'?wh-pwa='+revisionB)).text(),'CODE_B');assert.equal(b.downloads.length,1);
  assert.equal(await(await a.cache(a.name).match(workerBase+code)).text(),'CODE_A');
  assert.equal(await(await b.cache(b.name).match(workerBase+code)).text(),'CODE_B');
});
await test('a tag belonging to another worker cannot borrow its cache or manifest',async()=>{
  const w=stagedWorker();await w.cache(w.name).put(workerBase+code,new Response('CODE_A'));
  assert.equal((await w.request(code+'?wh-pwa='+revisionB)).status,409);assert.equal(w.downloads.length,1);
  assert.equal(await(await w.cache(w.name).match(workerBase+code)).text(),'CODE_A');
});
await test('duplicate or ambiguous publication tags cannot borrow a verified current cache',async()=>{
  for(const other of [revisionA,revisionB]){
    const w=stagedWorker();await w.cache(w.name).put(workerBase+code,new Response('CODE_A'));
    const ambiguous=marked+'&wh-pwa='+other;assert.equal((await w.request(ambiguous)).status,409);assert.equal(w.downloads.length,1);
    w.behavior.fetch=async()=>{throw new TypeError('Offline');};assert.equal((await w.request(ambiguous)).status,503);
  }
});
await test('untagged addresses retain exact CODE_B network-first behavior',async()=>{
  const w=stagedWorker();await w.cache(w.name).put(workerBase+code,new Response('CODE_A'));w.behavior.fetch=async()=>new Response('CODE_B');
  assert.equal(await(await w.request(code)).text(),'CODE_B');assert.equal(await(await w.cache(w.name).match(workerBase+code)).text(),'CODE_A');
});
await test('HTML, install manifest, worker script and freshness oracles never use tagged cache-first',async()=>{
  for(const file of ['v2/app.html','manifest.webmanifest','service-worker.js','PAGES_RUNTIME_MANIFEST.json','glossary/generated/cache-revision.js']){
    const w=stagedWorker({bodies:{[file]:'OLD'}});await w.cache(w.name).put(workerBase+file,new Response('OLD'));w.behavior.fetch=async()=>new Response('FRESH');
    assert.equal(await(await w.request(file+'?wh-pwa='+revisionA)).text(),'FRESH',file);
  }
});
await test('offline failure without a compatible tagged body is explicit and not a false update',async()=>{
  const w=stagedWorker();w.behavior.fetch=async()=>{throw new TypeError('Network unavailable');};
  assert.equal((await w.request(marked)).status,503);assert.equal(w.messages.length,0);
});
await test('core can be installed and activated while the full offline inventory remains incomplete',async()=>{
  const core='./'+code,lazy='books/test/v2/lazy.mjs';const w=stagedWorker({bodies:{[code]:'CODE_A',[lazy]:'LAZY_A'},core:[core]});
  await w.install();let status=await w.query();assert.equal(status.coreReady,true);assert.equal(status.status,'preparing');assert.equal(status.completed,1);assert.equal(status.total,2);
  const activation=w.send('SKIP_WAITING');await activation.task;assert.equal(activation.response.accepted,true);assert.equal(w.activation,1);
  const prepare=w.send('WH_PWA_PREPARE_OFFLINE',{afterStartup:true});await Promise.resolve();assert.equal(w.downloads.some(url=>url.endsWith('/'+lazy)),false);
  const complete=w.send('WH_PWA_BOOTSTRAP_COMPLETE');await complete.task;await prepare.task;status=await w.query();assert.equal(status.status,'ready');assert.equal(status.completed,2);
  assert.equal(await(await w.cache(w.name).match(workerBase+lazy)).text(),'LAZY_A');
});
await test('non-core interruption keeps the verified core and resumes without redownloading it',async()=>{
  const lazy='books/test/v2/lazy.mjs',w=stagedWorker({bodies:{[code]:'CODE_A',[lazy]:'LAZY_A'},core:['./'+code]});await w.install();
  const normal=w.behavior.fetch;w.behavior.fetch=async request=>{if(String(request.url||request).includes(lazy))throw new TypeError('Disconnected');return normal(request);};
  await w.send('WH_PWA_PREPARE_OFFLINE').task;let status=await w.query();assert.equal(status.status,'error');assert.equal(status.coreReady,true);
  w.behavior.fetch=normal;await w.send('WH_PWA_PREPARE_OFFLINE').task;status=await w.query();assert.equal(status.status,'ready');
  assert.equal(w.downloads.filter(url=>new URL(url).pathname.endsWith('/'+code)).length,1);
});
await test('background publication change refuses foreign bytes and never reports offline ready',async()=>{
  const lazy='books/test/v2/lazy.mjs',w=stagedWorker({bodies:{[code]:'CODE_A',[lazy]:'LAZY_A'},core:['./'+code]});await w.install();
  w.behavior.fetch=async request=>new Response(String(request.url||request).includes('cache-revision.js')?`self.WH40K_CACHE_REVISION='${revisionA}';`:'FOREIGN_B');
  await w.send('WH_PWA_PREPARE_OFFLINE').task;const status=await w.query();assert.equal(status.status,'error');assert.equal(status.coreReady,true);assert.equal(await w.cache(w.name).match(workerBase+lazy),undefined);
  assert(w.messages.some(message=>message.type==='WH_PWA_DATA_CHANGED'));
});
await test('core corruption refuses activation',async()=>{
  const w=stagedWorker({core:['./'+code]});w.behavior.corrupt=true;await assert.rejects(w.install(),/verification/);
  const activation=w.send('SKIP_WAITING');await activation.task;assert.equal(activation.response.accepted,false);assert.equal(w.activation,0);
});
await test('a completely verified offline package stays Ready without a network oracle',async()=>{
  const lazy='books/test/v2/lazy.mjs',w=stagedWorker({bodies:{[code]:'CODE_A',[lazy]:'LAZY_A'},core:['./'+code]});
  await w.install();await w.send('WH_PWA_PREPARE_OFFLINE').task;
  w.behavior.fetch=async()=>assert.fail('A prepared offline revisit must not require the network');
  await w.send('WH_PWA_BOOTSTRAP_COMPLETE').task;assert.equal((await w.query()).status,'ready');
  assert.equal(w.messages.some(message=>message.status==='error'),false);
});
await test('a restarted worker cannot announce Ready from corrupt non-core cache keys',async()=>{
  const lazy='books/test/v2/lazy.mjs',options={bodies:{[code]:'CODE_A',[lazy]:'LAZY_A'},core:['./'+code]};
  const first=stagedWorker(options);await first.install();await first.send('WH_PWA_PREPARE_OFFLINE').task;
  await first.cache(first.name).put(workerBase+lazy,new Response('CORRUPT'));
  const restarted=stagedWorker({...options,stores:first.stores});
  const status=await restarted.query();assert.equal(status.coreReady,true);assert.equal(status.status,'error');assert.equal(status.completed,1);assert.equal(status.total,2);
  await restarted.send('WH_PWA_PREPARE_OFFLINE').task;assert.equal((await restarted.query()).status,'ready');
});
await test('rolling preparation never exceeds four simultaneous downloads',async()=>{
  const files=Object.fromEntries(Array.from({length:12},(_,index)=>['books/test/v2/code-'+index+'.mjs','BODY_'+index]));
  const w=stagedWorker({bodies:files,core:['./books/test/v2/code-0.mjs']});await w.install();
  const normal=w.behavior.fetch;let active=0,maximum=0;
  w.behavior.fetch=async request=>{if(String(request.url||request).includes('cache-revision.js'))return normal(request);active++;maximum=Math.max(maximum,active);await new Promise(resolve=>setImmediate(resolve));active--;return normal(request);};
  await w.send('WH_PWA_PREPARE_OFFLINE').task;assert.equal((await w.query()).status,'ready');assert.equal(maximum,4);
});
console.log(JSON.stringify({status:'PASS',checks:results.length,results},null,2));
