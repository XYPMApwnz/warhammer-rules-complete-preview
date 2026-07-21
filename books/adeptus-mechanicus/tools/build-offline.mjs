import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const shell=[
  './','./index.html','./manifest.webmanifest','./assets/mechanicus-logo.png',
  './styles/tokens.css','./styles/layout.css','./styles/navigation.css','./styles/content.css','./styles/popups.css','./styles/mechanicus.css',
  './scripts/data.js','./scripts/navigation-controller.js','./scripts/popup-controller.js','./scripts/journey-controller.js','./scripts/ui-controllers.js','./scripts/app.js'
];
const files=shell.filter(file=>file!=='./').map(file=>file.slice(2));
const hash=crypto.createHash('sha256');
for(const file of files)hash.update(file).update(fs.readFileSync(path.join(root,file)));
const version=hash.digest('hex').slice(0,12);
const output=`const CACHE_PREFIX='adeptus-mechanicus-rules-v1-';
const CACHE=CACHE_PREFIX+'${version}';
const SHELL=${JSON.stringify(shell)};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==location.origin)return;
  event.respondWith(caches.match(event.request,{ignoreSearch:true}).then(cached=>cached||fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
    return response;
  }).catch(()=>event.request.mode==='navigate'?caches.match('./index.html'):Response.error())));
});
`;
const target=path.join(root,'service-worker.js');
if(process.argv.includes('--check')){
  if(!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==output){console.error('service-worker.js is stale');process.exit(1);}
  console.log(`Offline cache is current: ${version}`);
}else{
  fs.writeFileSync(target,output,'utf8');
  console.log(`Generated service-worker.js: ${version}`);
}
