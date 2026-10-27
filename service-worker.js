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
const RUNTIME_ASSETS = self.WH40K_RUNTIME_ASSETS || {};
async function cacheAppShell() {
  if(!INSTALL_SHELL.length)throw new Error('Mandatory offline code inventory is missing');
  const mode=self.registration.active?'updating':'preparing';let completed=0;
  await setOfflinePackageStatus(mode,completed);
  const cache=await caches.open(CACHE_NAME);
  try{
    for(let index=0;index<INSTALL_SHELL.length;index+=APP_SHELL_BATCH_SIZE){
      const batch=INSTALL_SHELL.slice(index,index+APP_SHELL_BATCH_SIZE);
      await Promise.all(batch.map(async url=>{
        const response=await fetch(new URL(url,self.location.href),{cache:'no-store'});
        if(!await matchesPublishedAsset(new URL(url,self.location.href),response))throw new Error('Offline code changed during installation: '+url);
        await cache.put(new URL(url,self.location.href).href,response);
      }));
      completed+=batch.length;await setOfflinePackageStatus(mode,completed);
    }
  }catch(error){await setOfflinePackageStatus('error',completed,error);throw error;}
  await setOfflinePackageStatus('ready',INSTALL_SHELL.length);
}

async function assertCacheRevisionFresh() {
  const response = await fetch(new URL("./glossary/generated/cache-revision.js", self.location.href), {cache: "no-store"});
  if (!response.ok) throw new Error(`Cache revision check failed with ${response.status}`);
  const source = await response.text();
  const revision = source.match(/WH40K_CACHE_REVISION\s*=\s*["']([^"']+)["']/)?.[1];
  if (!revision || revision !== self.WH40K_CACHE_REVISION) throw new Error("Imported cache revision is stale");
}

const OFFLINE_PACKAGE_STATUS = "WH_OFFLINE_PACKAGE_STATUS";
const OFFLINE_PACKAGE_QUERY = "WH_OFFLINE_PACKAGE_STATUS_QUERY";
const VERSION_QUERY = "GET_VERSION";
const VERSION_RESPONSE = "VERSION";
const ACTIVATE_UPDATE = "SKIP_WAITING";
const MIGRATE_V2_DATA = "WH_PWA_MIGRATE_V2_DATA";
let offlinePackageSequence = 0;
let offlinePackageStatus = {status: "idle", completed: 0, total: INSTALL_SHELL.length, error: null};
function offlinePackagePayload() {return {type: OFFLINE_PACKAGE_STATUS, revision: self.WH40K_CACHE_REVISION, sequence: offlinePackageSequence, ...offlinePackageStatus};}
function versionPayload(extra={}) {return {type: VERSION_RESPONSE, revision: self.WH40K_CACHE_REVISION, cacheName: CACHE_NAME, ...extra};}
async function broadcastOfflinePackageStatus() {const clients=await self.clients.matchAll({type:"window",includeUncontrolled:true}),payload=offlinePackagePayload();for(const client of clients)client.postMessage(payload);}
async function setOfflinePackageStatus(status,completed,error=null){offlinePackageSequence+=1;offlinePackageStatus={status,completed,total:INSTALL_SHELL.length,error:error?String(error.message||error):null};await broadcastOfflinePackageStatus();return offlinePackagePayload();}
async function currentOfflinePackageStatus(){
  if(offlinePackageStatus.status!=="idle")return offlinePackagePayload();
  const cache=await caches.open(CACHE_NAME),cached=new Set((await cache.keys()).map(request=>request.url));
  const completed=INSTALL_SHELL.reduce((count,url)=>count+cached.has(new URL(url,self.location.href).href),0);
  offlinePackageSequence+=1;offlinePackageStatus={status:completed===INSTALL_SHELL.length?"ready":"error",completed,total:INSTALL_SHELL.length,error:null};
  return offlinePackagePayload();
}
self.addEventListener("message",event=>{
  const reply=payload=>{if(event.ports[0])event.ports[0].postMessage(payload);else if(event.source)event.source.postMessage(payload);};
  if(event.data?.type===OFFLINE_PACKAGE_QUERY){event.waitUntil(currentOfflinePackageStatus().then(reply));return;}
  if(event.data?.type===VERSION_QUERY){reply(versionPayload());return;}
  // Sent to registration.active on every application startup, not to a
  // waiting worker. A failed activation migration can therefore be retried.
  if(event.data?.type===MIGRATE_V2_DATA){event.waitUntil(migrateV2Data().then(reply));return;}
  if(event.data?.type!==ACTIVATE_UPDATE)return;
  event.waitUntil((async()=>{
    // A waiting worker can be stopped/restarted by the browser. Recover its
    // existing prepared-cache status instead of relying on lost memory state.
    const status=event.data.revision===self.WH40K_CACHE_REVISION?await currentOfflinePackageStatus():null;
    const accepted=status?.status==="ready"&&status.completed===INSTALL_SHELL.length;
    reply(versionPayload({accepted:Boolean(accepted)}));
    if(accepted)await self.skipWaiting();
  })());
});

self.addEventListener("install", (event) => {
  event.waitUntil(assertCacheRevisionFresh().then(cacheAppShell));
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
      if(!item||(!/(?:^|\/)v2\/.*\.json$/.test(item)&&item!=='glossary/v2/generated/index.en.js')||!RUNTIME_ASSETS[item])continue;
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
    const compatible=!mutable||await matchesPublishedAsset(url,response);
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
  if(url.pathname.endsWith('/glossary/generated/cache-revision.js')){
    event.respondWith(fetch(new Request(request,{cache:'no-store'})));return;
  }
  if(mutableV2(url)){
    event.respondWith(fetchAndCache(new Request(request,{cache:'no-store'}),request,event).catch(()=>compatibleOffline(request)));return;
  }
  if(request.mode==='navigate'){
    event.respondWith(fetchAndCache(request).catch(async()=>
      (await legacyCached(request))||(await legacyCached(request,{ignoreSearch:true}))||legacyCached(navigationFallback(url))));return;
  }
  event.respondWith(legacyCached(request).then(cached=>cached||fetchAndCache(request)));
});
