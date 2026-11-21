/** Synthetic browser primitives for the new staged-PWA controls. No book facts. */
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash,webcrypto} from 'node:crypto';
const source=fs.readFileSync(new URL('../../service-worker.js',import.meta.url),'utf8');
export const workerBase='https://example.test/warhammer-rules-complete-preview/';
export const revisionA='aaaaaaaaaaaaaaaa',revisionB='bbbbbbbbbbbbbbbb';
export const asset=body=>({sha256:createHash('sha256').update(body).digest('hex'),bytes:Buffer.byteLength(body)});
export function stagedWorker({revision=revisionA,bodies={'books/test/v2/module.mjs':'CODE_A'},precache,core,stores=new Map()}={}){
  const listeners={},messages=[],warnings=[],downloads=[];
  const behavior={quota:false,corrupt:false,fetch:async request=>{
    const url=new URL(request.url||request,workerBase),relative=url.pathname.slice(new URL(workerBase).pathname.length);
    downloads.push(url.href);
    if(relative==='glossary/generated/cache-revision.js')return new Response(`self.WH40K_CACHE_REVISION='${revision}';`);
    return new Response(bodies[relative]||'UNLISTED');
  }};
  const address=request=>new URL(request.url||request,workerBase).href;
  function cache(name){if(!stores.has(name))stores.set(name,new Map());const entries=stores.get(name);return{
    async match(request,options){const key=address(request);if(entries.has(key))return entries.get(key).clone();if(options?.ignoreSearch)for(const [url,value]of entries)if(url.split('?')[0]===key.split('?')[0])return value.clone();},
    async put(request,response){if(behavior.quota)throw new DOMException('Injected storage full','QuotaExceededError');entries.set(address(request),behavior.corrupt?new Response('CORRUPTED_WRITE'):response.clone());},
    async keys(){return [...entries.keys()].map(url=>new Request(url));}
  };}
  const caches={open:async name=>cache(name),keys:async()=>[...stores.keys()],delete:async name=>stores.delete(name),async match(request,options){for(const name of stores.keys()){const response=await cache(name).match(request,options);if(response)return response;}}};
  let activation=0;
  const self={location:new URL(workerBase+'service-worker.js'),WH40K_CACHE_REVISION:revision,WH40K_CACHE_BYTES:'1111111111111111',
    WH40K_RUNTIME_ASSETS:Object.fromEntries(Object.entries(bodies).map(([key,value])=>[key,asset(value)])),
    WH40K_PRECACHE:precache||Object.keys(bodies).map(key=>'./'+key),...(core?{WH40K_STARTUP_CORE:core}:{}),
    registration:{active:{}},clients:{claim:async()=>{},matchAll:async()=>[{postMessage:value=>messages.push(value)}],get:async()=>({postMessage:value=>messages.push(value)})},
    skipWaiting:async()=>{activation++;},addEventListener:(name,fn)=>{listeners[name]=fn;}};
  const context=vm.createContext({MessageChannel,setTimeout,clearTimeout,self,URL,URLSearchParams,Request,Response,Promise,Set,Map,Uint8Array,crypto:webcrypto,console:{warn:(...args)=>warnings.push(args)},importScripts(){},fetch:request=>behavior.fetch(request),caches});
  vm.runInContext(source,context);
  const name=vm.runInContext('CACHE_NAME',context);
  self.registration.active={state:'activated',postMessage(message,ports){ports[0].postMessage({cacheName:name});}};
  const install=async()=>{let task;listeners.install({waitUntil:value=>{task=value;}});return task;};
  const send=(type,data={})=>{let task,response;listeners.message({data:{type,revision,...data},ports:[{postMessage:value=>{response=value;}}],waitUntil:value=>{task=value;}});return{get response(){return response;},task};};
  const query=async()=>{const message=send('WH_OFFLINE_PACKAGE_STATUS_QUERY');await message.task;return message.response;};
  const request=relative=>{let response;listeners.fetch({clientId:'synthetic-window',request:new Request(new URL(relative,workerBase)),respondWith:value=>{response=value;}});return response;};
  return{behavior,cache,caches,stores,listeners,messages,warnings,downloads,self,name,install,send,query,request,get activation(){return activation;}};
}
