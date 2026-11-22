importScripts("./glossary/generated/cache-revision.js");
const CACHE_PREFIX = "warhammer-rules-fe1d435-";
const CACHE_NAME = `${CACHE_PREFIX}${self.WH40K_CACHE_REVISION || "fallback"}${self.WH40K_CACHE_BYTES?"-"+self.WH40K_CACHE_BYTES:""}`;
const APP_SHELL_BATCH_SIZE = 4;
const LIBRARY_FALLBACK = "./v2/app.html";
const APP_SHELL = [
  "./",
  "./index.html",
  "./v2/app.html",
  "./manifest.webmanifest",
  "./books/shared/offline-status.js?v=4",
  "./books/shared/styles/offline-status.css?v=2"
];
function navigationFallback() { return LIBRARY_FALLBACK; }

const INSTALL_SHELL = self.WH40K_PRECACHE || [];
const STARTUP_CORE = self.WH40K_STARTUP_CORE || INSTALL_SHELL;
const RUNTIME_ASSETS = self.WH40K_RUNTIME_ASSETS || {};
const preparedDownloads=new Map();
let coreProof={coreReady:false,coreCompleted:0,coreTotal:STARTUP_CORE.length};
let preparationTask=null,startupCompleted=false,releasePreparation;
const startupCompletion=new Promise(resolve=>{releasePreparation=resolve;});

async function rollingPrepare(urls,visit){
  let next=0,failure;
  const runner=async()=>{while(!failure&&next<urls.length){const url=urls[next++];try{await visit(url);}catch(error){failure=error;}}};
  await Promise.all(Array.from({length:Math.min(APP_SHELL_BATCH_SIZE,urls.length)},runner));
  if(failure)throw failure;
}
function validatePreparationInventory(){
  if(!INSTALL_SHELL.length||!STARTUP_CORE.length)throw new Error('Mandatory offline code inventory is missing');
  if(!Number.isSafeInteger(APP_SHELL_BATCH_SIZE)||APP_SHELL_BATCH_SIZE<1||APP_SHELL_BATCH_SIZE>8)throw new Error('Invalid offline preparation concurrency');
  const full=new Set(INSTALL_SHELL);
  if(full.size!==INSTALL_SHELL.length||new Set(STARTUP_CORE).size!==STARTUP_CORE.length||STARTUP_CORE.some(url=>!full.has(url)))throw new Error('Startup core must be an exact subset of the offline inventory');
}
async function preparedResponse(url){
  const item=publicationPath(url);if(!item)return;
  const canonical=new URL('./'+item,self.location.href).href;
  for(const name of [CACHE_NAME,DATA_CACHE_NAME]){
    const cache=await caches.open(name),response=await cache.match(url.href)||await cache.match(canonical);
    if(await matchesPublishedAsset(url,response))return response;
  }
}
async function downloadPublished(request){
  const url=new URL(request.url||request,self.location.href),item=publicationPath(url);
  const cached=await preparedResponse(url);if(cached)return cached;
  let task=preparedDownloads.get(item);
  if(!task){
    task=(async()=>{
      const response=await fetch(new Request(url,{cache:'no-store'}));
      if(!response.ok)throw new Error('Published content is unavailable: '+item);
      if(!await matchesPublishedAsset(url,response))throw Object.assign(new Error('Published content changed during preparation: '+item),{publicationChanged:true});
      const mandatory=INSTALL_SHELL.some(entry=>publicationPath(new URL(entry,self.location.href))===item);
      const name=url.pathname.endsWith('.json')&&!mandatory?DATA_CACHE_NAME:CACHE_NAME;
      try{await (await caches.open(name)).put(new URL('./'+item,self.location.href).href,response.clone());}
      catch(error){console.warn('Service Worker cache write failed',error);}
      return response;
    })();
    preparedDownloads.set(item,task);
  }
  try{return (await task).clone();}finally{if(preparedDownloads.get(item)===task)preparedDownloads.delete(item);}
}
async function prepareEntry(relative){
  const url=new URL(relative,self.location.href),cache=await caches.open(CACHE_NAME);
  const existing=await cache.match(url.href);if(await matchesPublishedAsset(url,existing))return;
  const response=await downloadPublished(url);
  await cache.put(url.href,response);
  if(!await matchesPublishedAsset(url,await cache.match(url.href)))throw new Error('Offline storage verification failed: '+relative);
}
async function verifyCore(){
  const cache=await caches.open(CACHE_NAME);let count=0;
  for(const relative of STARTUP_CORE){const url=new URL(relative,self.location.href);if(await matchesPublishedAsset(url,await cache.match(url.href)))count++;}
  coreProof={coreReady:STARTUP_CORE.length>0&&count===STARTUP_CORE.length,coreCompleted:count,coreTotal:STARTUP_CORE.length};
  return coreProof;
}
async function cacheStartupCore(){
  validatePreparationInventory();
  await setOfflinePackageStatus(self.registration.active?'updating':'preparing',0);
  try{
    let completed=0;await rollingPrepare(STARTUP_CORE,async url=>{await prepareEntry(url);await setOfflinePackageStatus(offlinePackageStatus.status,++completed);});
    if(!(await verifyCore()).coreReady)throw new Error('Startup core is incomplete');
    await setOfflinePackageStatus(STARTUP_CORE.length===INSTALL_SHELL.length?'ready':'preparing',STARTUP_CORE.length);
  }catch(error){await setOfflinePackageStatus('error',offlinePackageStatus.completed,error);throw error;}
}
function prepareOffline({afterStartup=false}={}){
  if(preparationTask)return preparationTask;
  preparationTask=(async()=>{
    validatePreparationInventory();
    if(afterStartup&&!startupCompleted)await new Promise(resolve=>{const timer=setTimeout(resolve,30000);startupCompletion.then(()=>{clearTimeout(timer);resolve();});});
    // A fully verified immutable package is already usable offline. Reopening
    // it must not turn Ready into an error just because the freshness oracle
    // is unreachable; no download or version choice is needed in this case.
    const prepared=await caches.open(CACHE_NAME);let alreadyComplete=true;
    for(const relative of INSTALL_SHELL){const url=new URL(relative,self.location.href);if(!await matchesPublishedAsset(url,await prepared.match(url.href))){alreadyComplete=false;break;}}
    if(alreadyComplete){await verifyCore();await setOfflinePackageStatus('ready',INSTALL_SHELL.length);return;}
    await assertCacheRevisionFresh();
    if(!(await verifyCore()).coreReady)await cacheStartupCore();
    const cache=await caches.open(CACHE_NAME),remaining=[];let completed=0;
    for(const relative of INSTALL_SHELL){const url=new URL(relative,self.location.href);if(await matchesPublishedAsset(url,await cache.match(url.href)))completed++;else remaining.push(relative);}
    await setOfflinePackageStatus('preparing',completed);
    await rollingPrepare(remaining,async url=>{await prepareEntry(url);await setOfflinePackageStatus('preparing',++completed);});
    await assertCacheRevisionFresh();
    await setOfflinePackageStatus('ready',INSTALL_SHELL.length);
  })().catch(async error=>{
    await setOfflinePackageStatus('error',offlinePackageStatus.completed,error);
    if(error.publicationChanged)for(const client of await self.clients.matchAll({type:'window',includeUncontrolled:true}))client.postMessage({type:'WH_PWA_DATA_CHANGED'});
    return {status:'error'};
  }).finally(()=>{preparationTask=null;});
  return preparationTask;
}

async function assertCacheRevisionFresh() {
  const response = await fetch(new URL("./glossary/generated/cache-revision.js", self.location.href), {cache: "no-store"});
  if (!response.ok) throw new Error(`Cache revision check failed with ${response.status}`);
  const source = await response.text();
  const revision = source.match(/WH40K_CACHE_REVISION\s*=\s*["']([^"']+)["']/)?.[1];
  if (!revision || revision !== self.WH40K_CACHE_REVISION) throw Object.assign(new Error("Imported cache revision is stale"),{publicationChanged:true});
}

const OFFLINE_PACKAGE_STATUS = "WH_OFFLINE_PACKAGE_STATUS";
const OFFLINE_PACKAGE_QUERY = "WH_OFFLINE_PACKAGE_STATUS_QUERY";
const VERSION_QUERY = "GET_VERSION";
const VERSION_RESPONSE = "VERSION";
const ACTIVATE_UPDATE = "SKIP_WAITING";
const MIGRATE_V2_DATA = "WH_PWA_MIGRATE_V2_DATA";
let offlinePackageSequence = 0;
// A ServiceWorker object can outlive a terminated/restarted worker global.
const offlinePackageInstance=[...crypto.getRandomValues(new Uint8Array(16))].map(value=>value.toString(16).padStart(2,'0')).join('');
let offlinePackageStatus = {status: "idle", completed: 0, total: INSTALL_SHELL.length, error: null};
function offlinePackagePayload() {return {type: OFFLINE_PACKAGE_STATUS, revision: self.WH40K_CACHE_REVISION, cacheBytes:self.WH40K_CACHE_BYTES, statusInstance:offlinePackageInstance, sequence: offlinePackageSequence, ...offlinePackageStatus,...coreProof};}
function versionPayload(extra={}) {return {type: VERSION_RESPONSE, revision: self.WH40K_CACHE_REVISION, cacheBytes:self.WH40K_CACHE_BYTES, cacheName: CACHE_NAME, ...extra};}
async function broadcastOfflinePackageStatus() {const clients=await self.clients.matchAll({type:"window",includeUncontrolled:true}),payload=offlinePackagePayload();for(const client of clients)client.postMessage(payload);}
async function setOfflinePackageStatus(status,completed,error=null){offlinePackageSequence+=1;offlinePackageStatus={status,completed,total:INSTALL_SHELL.length,error:error?String(error.message||error):null};await broadcastOfflinePackageStatus();return offlinePackagePayload();}
async function currentOfflinePackageStatus(){
  await verifyCore();
  if(offlinePackageStatus.status!=="idle")return offlinePackagePayload();
  const cache=await caches.open(CACHE_NAME);let completed=0;
  // Worker memory can disappear independently of CacheStorage. Key presence
  // alone cannot restore the claim that a complete offline package is valid.
  for(const relative of INSTALL_SHELL){const url=new URL(relative,self.location.href);if(await matchesPublishedAsset(url,await cache.match(url.href)))completed++;}
  offlinePackageSequence+=1;offlinePackageStatus={status:completed===INSTALL_SHELL.length?"ready":"error",completed,total:INSTALL_SHELL.length,error:null};
  return offlinePackagePayload();
}
self.addEventListener("message",event=>{
  const reply=payload=>{if(event.ports[0])event.ports[0].postMessage(payload);else if(event.source)event.source.postMessage(payload);};
  if(event.data?.type===OFFLINE_PACKAGE_QUERY){event.waitUntil(currentOfflinePackageStatus().then(reply));return;}
  if(event.data?.type===VERSION_QUERY){reply(versionPayload());return;}
  if(['WH_PWA_PREPARE_OFFLINE','WH_PWA_BOOTSTRAP_COMPLETE'].includes(event.data?.type)){
    if(event.data.revision!==self.WH40K_CACHE_REVISION){reply({accepted:false});return;}
    if(event.data.type==='WH_PWA_BOOTSTRAP_COMPLETE'){startupCompleted=true;releasePreparation();}
    reply({accepted:true});event.waitUntil(prepareOffline({afterStartup:event.data.afterStartup===true}));return;
  }
  // Sent to registration.active on every application startup, not to a
  // waiting worker. A failed activation migration can therefore be retried.
  if(event.data?.type===MIGRATE_V2_DATA){event.waitUntil(migrateV2Data().then(reply));return;}
  if(event.data?.type!==ACTIVATE_UPDATE)return;
  event.waitUntil((async()=>{
    // A waiting worker can be stopped/restarted by the browser. Recover its
    // existing prepared-cache status instead of relying on lost memory state.
    const status=event.data.revision===self.WH40K_CACHE_REVISION?await currentOfflinePackageStatus():null;
    const accepted=status?.coreReady===true;
    reply(versionPayload({accepted:Boolean(accepted)}));
    if(accepted)await self.skipWaiting();
  })());
});

self.addEventListener("install", (event) => {
  event.waitUntil(assertCacheRevisionFresh().then(cacheStartupCore));
});

self.addEventListener("activate",event=>{
  const activatingWorker=self.registration.active;
  event.waitUntil(migrateV2Data(activatingWorker).then(()=>self.clients.claim()));
});

function publicationPath(url){
  const scope=new URL('./',self.location.href);
  if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return null;
  const item=decodeURIComponent(url.pathname.slice(scope.pathname.length));
  return !item||item.endsWith('/')?item+'index.html':item;
}
async function matchesPublishedAsset(url,response){
  const asset=RUNTIME_ASSETS[publicationPath(url)];if(!asset||!response?.ok)return false;
  const bytes=await response.clone().arrayBuffer();
  const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(value=>value.toString(16).padStart(2,'0')).join('');
  return hash===asset.sha256;
}
function mutableV2(url){
  return /\.(?:mjs|css|json)$/.test(url.pathname)||url.pathname.includes('/v2/')||url.pathname.includes('/books/core-rules/reader/')||url.pathname.endsWith('/books/shared/offline-status.js');
}
const DATA_CACHE_NAME=CACHE_NAME+'-data';
let migrationTask;
function migrateV2Data(activatingWorker=null){
  // Only serialize concurrent copies in this worker. No persistent client or
  // version state; after any failure the next startup performs the same scan.
  if(migrationTask)return migrationTask;
  migrationTask=transferV2Data(activatingWorker).catch(error=>{
    console.warn('Service Worker V2 data migration failed; old caches retained',error);
    return {status:'failed',error:String(error.message||error)};
  }).finally(()=>{migrationTask=null;});
  return migrationTask;
}
async function currentMigrationOwner(activatingWorker){
  const active=self.registration.active;
  if(!active||self.registration.installing||self.registration.waiting)return false;
  // During this worker's own activate event, messaging itself could wait for
  // activation to finish. Its captured registration object is sufficient here.
  if(active===activatingWorker)return true;
  if(active.state!=='activated')return false;
  const payload=await new Promise(resolve=>{
    const channel=new MessageChannel();
    const finish=value=>{clearTimeout(timer);channel.port1.close();resolve(value);};
    const timer=setTimeout(()=>finish(null),5000);
    channel.port1.onmessage=event=>finish(event.data);
    try{active.postMessage({type:VERSION_QUERY},[channel.port2]);}catch{finish(null);}
  });
  return self.registration.active===active&&!self.registration.installing&&!self.registration.waiting&&payload?.cacheName===CACHE_NAME;
}
async function transferV2Data(activatingWorker){
  const keys=await caches.keys();
  const old=keys.filter(name=>name.startsWith(CACHE_PREFIX)&&name!==CACHE_NAME&&name!==DATA_CACHE_NAME);
  // Never remove a newly prepared cache belonging to another pending update.
  if(!old.length)return {status:'complete',transferred:0};
  if(!await currentMigrationOwner(activatingWorker))return {status:'deferred'};
  if(!Object.keys(RUNTIME_ASSETS).length)throw new Error('Publication integrity inventory missing');
  const transferred=new Set();let destination;
  for(const name of old){
    const source=await caches.open(name);
    for(const request of await source.keys()){
      const url=new URL(request.url),item=publicationPath(url);
      // Native V2 JSON plus the lazy definition data used by the Core reader.
      // Other JavaScript, V1 and unlisted resources are not carried forward.
      if(!item||(!/(?:^|\/)v2\/.*\.json$/.test(item)&&item!=='glossary/v2/generated/index.en.js'&&item!=='books/shared/source-refs-v2/source-catalog.json')||!RUNTIME_ASSETS[item])continue;
      const response=await source.match(request);
      if(!response)throw new Error('Old cached response disappeared: '+item);
      if(!await matchesPublishedAsset(url,response))continue;
      const target=new URL('./'+item,self.location.href).href;
      destination ||= await caches.open(DATA_CACHE_NAME);
      if(!await matchesPublishedAsset(url,await destination.match(target)))await destination.put(target,response);
      transferred.add(target);
    }
  }
  // Read back every migrated body from its final cache. Copy success alone
  // is insufficient. No book/UI/gameplay validation belongs in this worker.
  for(const target of transferred){
    if(!await matchesPublishedAsset(new URL(target),await destination.match(target)))throw new Error('Migrated data verification failed: '+target);
  }
  // This boundary is reached only after all compatible V2 bodies were verified.
  // Delete this application's obsolete caches, including V1; leave other apps.
  for(const name of old){
    if(!await currentMigrationOwner(activatingWorker))return {status:'deferred'};
    await caches.delete(name);
  }
  return {status:'complete',transferred:transferred.size};
}
async function fetchAndCache(request,cacheKey=request,event=null){
  const response=await fetch(request);
  if(response.ok){
    const url=new URL(request.url||request,self.location.href),mutable=mutableV2(url);
    // Never overwrite a prepared offline body with another publication's bytes.
    // Online responses remain network-first; the application checks its version
    // before using loaded payloads/factories. No JavaScript is intercepted/re-written.
    const listed=RUNTIME_ASSETS[publicationPath(url)];
    const compatible=listed?await matchesPublishedAsset(url,response):!mutable;
    if(mutable&&url.pathname.endsWith('.json')&&!compatible){
      const client=event?.clientId&&await self.clients.get(event.clientId);
      client?.postMessage({type:'WH_PWA_DATA_CHANGED'});
      return new Response('Published data changed. Confirm an update before using it.',{status:409,headers:{'content-type':'text/plain'}});
    }
    if(compatible){
      try{await (await caches.open(url.pathname.endsWith('.json')?DATA_CACHE_NAME:CACHE_NAME)).put(cacheKey,response.clone());}
      catch(error){console.warn('Service Worker cache write failed',error);}
    }
  }
  return response;
}
function freshnessResource(url){
  return /\/(?:service-worker\.js|manifest\.webmanifest|PAGES_RUNTIME_MANIFEST\.json)$/.test(url.pathname)||url.pathname.endsWith('/glossary/generated/cache-revision.js');
}
function revisionTaggedAsset(url){
  return url.searchParams.has('wh-pwa')&&!freshnessResource(url)&&!url.pathname.endsWith('/')&&!url.pathname.endsWith('.html');
}
async function taggedAsset(request,event){
  const url=new URL(request.url);
  const tags=url.searchParams.getAll('wh-pwa'),current=tags.length===1&&tags[0]===self.WH40K_CACHE_REVISION;
  try{
    // A different tag cannot borrow this worker's manifest or current cache.
    // It still goes to the network, but only its own active worker may certify it.
    if(!current){await fetch(new Request(request,{cache:'no-store'}));throw Object.assign(new Error('Requested publication is not active'),{publicationChanged:true});}
    if(!RUNTIME_ASSETS[publicationPath(url)])throw Object.assign(new Error('Resource is not in the current publication'),{publicationChanged:true});
    return await downloadPublished(request);
  }catch(error){
    if(!error.publicationChanged){
      // Network loss or unavailable storage is not evidence of a new release.
      // A foreign revision may never borrow this worker's offline bodies.
      const cached=current&&await preparedResponse(url);if(cached)return cached;
      return new Response('This content is not ready offline. Reconnect and try again.',{status:503,headers:{'content-type':'text/plain'}});
    }
    const client=event?.clientId&&await self.clients.get(event.clientId);client?.postMessage({type:'WH_PWA_DATA_CHANGED'});
    return new Response('Published content changed. Confirm an update before using it.',{status:409,headers:{'content-type':'text/plain'}});
  }
}
async function compatibleOffline(request){
  const url=new URL(request.url),item=publicationPath(url),keys=await caches.keys();
  const names=[CACHE_NAME,DATA_CACHE_NAME,...keys.filter(name=>name.startsWith(CACHE_PREFIX)&&name!==CACHE_NAME&&name!==DATA_CACHE_NAME)];
  for(const name of names){
    if(!keys.includes(name))continue;
    const cache=await caches.open(name);
    const response=await cache.match(request)||await cache.match(new URL('./'+item,self.location.href).href);
    if(await matchesPublishedAsset(url,response))return response;
  }
  return new Response('A compatible offline copy is not available. Reconnect to update this content.',{status:503,headers:{'content-type':'text/plain'}});
}
async function legacyCached(request,options){
  // Retention must not make an older response outrank the current prepared copy.
  return (await (await caches.open(CACHE_NAME)).match(request,options))||caches.match(request,options);
}
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;
  // Never serve a cached version oracle. Unique query values also bypass the
  // exact-request cache-first behavior of the previously published worker.
  if(freshnessResource(url)){
    event.respondWith(url.pathname.endsWith('/manifest.webmanifest')?
      fetchAndCache(new Request(request,{cache:'no-store'}),request,event).catch(()=>compatibleOffline(request)):
      fetch(new Request(request,{cache:'no-store'})));return;
  }
  if(revisionTaggedAsset(url)){event.respondWith(taggedAsset(request,event));return;}
  if(mutableV2(url)){
    event.respondWith(fetchAndCache(new Request(request,{cache:'no-store'}),request,event).catch(()=>compatibleOffline(request)));return;
  }
  if(request.mode==='navigate'){
    event.respondWith(fetchAndCache(request).catch(async()=>
      (await legacyCached(request))||(await legacyCached(request,{ignoreSearch:true}))||legacyCached(navigationFallback(url))));return;
  }
  // Untagged addresses stay network-first; only offline failure permits fallback.
  event.respondWith(fetchAndCache(request).catch(()=>RUNTIME_ASSETS[publicationPath(url)]?compatibleOffline(request):legacyCached(request)));
});
