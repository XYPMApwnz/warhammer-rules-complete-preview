/** Optional SW availability must not promise a retry without a usable worker. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../books/shared/offline-status.js',import.meta.url),'utf8');
const revision='aaaaaaaaaaaaaaaa',base='https://example.test/warhammer-rules-complete-preview/';
const denied=name=>Object.assign(new Error('Injected browser policy denial'),{name});
function element(){return {children:[],dataset:{},attributes:{},style:{setProperty(){}},classList:{add(){},remove(){}},hidden:false,textContent:'',
  append(...children){this.children.push(...children);},setAttribute(name,value){this.attributes[name]=String(value);},addEventListener(){},remove(){this.removed=true;}};}
function harness({missing=false,getterDenied=false,registrationDenial=null,lookupDenial=null,online=true,workerMode=null,failedPreparations=0}={}){
  const header=element(),panel=element(),loading=element(),rootListeners=new Map(),workerListeners=new Map(),timers=new Set();
  const controls=new Map(['[data-pwa-update-status]','[data-pwa-update-action]','[data-pwa-installed-version]','[data-pwa-available-row]','[data-pwa-available-version]'].map(key=>[key,element()]));
  panel.querySelector=key=>controls.get(key);let registrations=0,lookups=0,getterReads=0,preparations=0,sequence=1;
  const bootstrap=!workerMode;
  const payload=status=>({type:'WH_OFFLINE_PACKAGE_STATUS',status,revision,completed:status==='ready'?10:7,total:10,sequence,
    ...(workerMode==='legacy'?{}:{coreReady:true,coreTotal:7,coreCompleted:7,cacheBytes:'bbbbbbbbbbbbbbbb'})});
  const worker=workerMode?{state:'activated',addEventListener(){},postMessage(message,[port]){
    if(message.type==='WH_PWA_PREPARE_OFFLINE'){preparations++;sequence++;port.postMessage(payload(preparations<=failedPreparations?'error':'ready'));}
    else if(message.type==='WH_OFFLINE_PACKAGE_STATUS_QUERY')port.postMessage(payload('error'));
    else throw Error('Unexpected worker request '+message.type);
  }}:null;
  const registration=worker?{active:worker,updateViaCache:'none',addEventListener(){},update:async()=>{}}:undefined;
  const container={controller:worker,getRegistration:async()=>{lookups++;if(lookupDenial)throw denied(lookupDenial);return registration;},
    register:async()=>{registrations++;throw denied(registrationDenial||'TypeError');},addEventListener:(name,listener)=>workerListeners.set(name,listener)};
  const navigator={onLine:online};
  if(!missing)Object.defineProperty(navigator,'serviceWorker',{get(){getterReads++;if(getterDenied)throw denied('SecurityError');return container;}});
  const window={WHPwaExpectedRevision:revision,addEventListener:(name,listener)=>rootListeners.set(name,listener)};
  const document={readyState:'loading',currentScript:{dataset:{serviceWorker:'../service-worker.js'},src:base+'books/shared/offline-status.js',hasAttribute:()=>bootstrap},body:{dataset:{}},
    querySelector:key=>key==='[data-pwa-updater]'?panel:key==='[data-v2-mount-root]'?{children:[]}:key==='[data-v2-loading]'?!loading.removed&&loading:key==='header.app-header, header.topbar, header.v2-primary-header'?header:null,
    querySelectorAll:()=>[],createElement:()=>element()};
  class Channel{constructor(){this.port1={onmessage:null,close(){}};this.port2={postMessage:data=>queueMicrotask(()=>this.port1.onmessage?.({data})),close(){}};}}
  const context={window,document,navigator,location:new URL(base+'v2/app.html'),URL,AbortController,MessageChannel:Channel,
    sessionStorage:{getItem:()=>null,setItem(){}},MutationObserver:class{observe(){}},console:{warn(){}},addEventListener(){},requestAnimationFrame:fn=>fn(),
    setTimeout:(callback,delay)=>{const timer={callback,delay};timers.add(timer);return timer;},clearTimeout:timer=>timers.delete(timer)};
  vm.runInNewContext(source,context);
  return {window,navigator,header,panel,timers,rootListeners,get registrations(){return registrations;},get lookups(){return lookups;},get getterReads(){return getterReads;},get preparations(){return preparations;},
    get visible(){return header.children.some(node=>!node.hidden);},get text(){return header.children[0]?.children[0]?.textContent;},get status(){return header.children[0]?.dataset.state;},
    query:()=>window.WHOfflineStatus.query(),event:name=>rootListeners.get(name)?.(),runTimer(delay){const timer=[...timers].find(item=>item.delay===delay);assert(timer,'Expected retry timer');timers.delete(timer);timer.callback();}};
}
async function until(predicate){const end=Date.now()+1000;while(!predicate()){assert(Date.now()<end,'Availability control did not settle');await new Promise(resolve=>setImmediate(resolve));}}
const results=[];
async function test(name,fn){await fn();results.push({name,status:'PASS'});}

for(const mode of ['missing','getterDenied'])await test(mode+' API opens online-only without an indicator',async()=>{
  const h=harness({[mode]:true});await h.window.WHOfflineStatus.ready;
  assert.equal(h.visible,false);assert.equal(h.header.children.length,0);assert.equal(h.registrations,0);
  if(mode==='getterDenied')assert.equal(h.getterReads,1);
});

for(const name of ['SecurityError','NotAllowedError','NotSupportedError'])await test(name+' registration rejection stays quiet and opens the online shell',async()=>{
  const h=harness({registrationDenial:name});await until(()=>h.panel.dataset.unavailable==='true');await h.window.WHOfflineStatus.ready;
  assert.equal(h.registrations,1);assert.equal(h.getterReads,1);assert.equal(h.visible,false);assert.equal(h.header.children.length,0);
  h.window.WHOfflineStatus.completeBootstrap();h.event('focus');h.event('online');await new Promise(resolve=>setImmediate(resolve));
  assert.equal(h.registrations,1,'Policy denial must not generate background registration loops');assert.equal(h.visible,false);
  assert.equal([...h.timers].filter(timer=>[15000,30000].includes(timer.delay)).length,0);
});

await test('denied getRegistration does not escape or promise offline recovery',async()=>{
  const h=harness({lookupDenial:'SecurityError'});await until(()=>h.panel.dataset.unavailable==='true');await h.window.WHOfflineStatus.ready;
  assert.equal(h.lookups,2,'Existing-registration recovery remains attempted');assert.equal(h.registrations,0);assert.equal(h.visible,false);
});

await test('registration network failure without a worker does not claim background retry',async()=>{
  const h=harness({registrationDenial:'TypeError'});await until(()=>h.panel.dataset.unavailable==='true');await h.window.WHOfflineStatus.ready;
  assert.equal(h.registrations,1);assert.equal(h.visible,false);assert.equal(h.header.children.length,0);
});

await test('an actual resumable worker retains the timed recovery and Ready transition',async()=>{
  const h=harness({workerMode:'modern'});await h.query();assert.equal(h.text,'Offline access not ready — will retry');assert.equal(h.visible,true);
  h.runTimer(15000);await until(()=>h.status==='ready');assert.equal(h.preparations,1);assert.equal(h.text,'Ready for offline use');
  assert.equal([...h.timers].filter(timer=>[15000,30000].includes(timer.delay)).length,0);
});

await test('exhausted timed retries stop promising another automatic attempt until a real recovery event',async()=>{
  const h=harness({workerMode:'modern',failedPreparations:3});await h.query();
  h.runTimer(15000);await until(()=>h.preparations===1);await new Promise(resolve=>setImmediate(resolve));
  h.runTimer(30000);await until(()=>h.preparations===2);await new Promise(resolve=>setImmediate(resolve));
  assert.equal(h.visible,false,'An exhausted automatic retry budget must not leave a permanent retry promise');
  assert.equal([...h.timers].filter(timer=>[15000,30000].includes(timer.delay)).length,0);
  h.event('online');await until(()=>h.preparations===3);await new Promise(resolve=>setImmediate(resolve));
  assert.equal(h.visible,true,'A connectivity recovery resets the existing retry budget');assert.equal(h.text,'Offline access not ready — will retry');
  h.runTimer(15000);await until(()=>h.status==='ready');assert.equal(h.preparations,4);
});

await test('offline interruption with a real worker retains recovery when connectivity returns',async()=>{
  const h=harness({workerMode:'modern',online:false});await h.query();assert.equal(h.text,'Offline access not ready — will retry');
  assert.equal([...h.timers].some(timer=>timer.delay===15000),false);h.navigator.onLine=true;h.event('online');
  await until(()=>h.status==='ready');assert.equal(h.preparations,1);assert.equal(h.text,'Ready for offline use');
});

await test('a legacy worker without resumable preparation does not promise an unsupported retry',async()=>{
  const h=harness({workerMode:'legacy'});await h.query();assert.equal(h.visible,false);assert.notEqual(h.text,'Offline access not ready — will retry');
  assert.equal([...h.timers].some(timer=>timer.delay===15000),false);
});

console.log(JSON.stringify({status:'PASS',checks:results.length,choice:'Hide the optional indicator when SW support/permission or resumable preparation is unavailable; no persistent unsupported message.',results},null,2));
