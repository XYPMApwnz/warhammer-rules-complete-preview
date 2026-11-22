/** Status ordering across worker-global restarts. Uses the real helper and public
 * query/message paths; the small DOM is only a status-indicator test surface. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {MessageChannel} from 'node:worker_threads';

const source=fs.readFileSync(new URL('../books/shared/offline-status.js',import.meta.url),'utf8');
const revision='aaaaaaaaaaaaaaaa',instanceA='11111111111111111111111111111111',instanceB='22222222222222222222222222222222';
const base='https://example.test/warhammer-rules-complete-preview/';
function payload({instance=instanceA,sequence=1,status='preparing',completed=7,legacy=false}={}){
  return {type:'WH_OFFLINE_PACKAGE_STATUS',revision,status,completed,total:10,sequence,
    ...(legacy?{}:{statusInstance:instance,coreReady:true,coreCompleted:7,coreTotal:7,cacheBytes:'3333333333333333'})};
}
function element(){return {children:[],dataset:{},attributes:{},style:{setProperty(){}},classList:{add(){},remove(){}},hidden:false,textContent:'',
  append(...nodes){this.children.push(...nodes);},setAttribute(name,value){this.attributes[name]=String(value);}};}
function harness(initial){
  const header=element(),listeners=new Map(),timers=new Set(),ports=new Set(),pending=[];
  let current=initial,defer=false,requests=0;
  const worker={state:'activated',postMessage(message,[port]){
    assert.equal(message.type,'WH_OFFLINE_PACKAGE_STATUS_QUERY','Only status queries are needed by these ordering controls');requests++;ports.add(port);
    const response={...current},reply=()=>{port.postMessage(response);port.close();ports.delete(port);};
    if(defer)pending.push(reply);else queueMicrotask(reply);
  }};
  const registration={active:worker};
  const navigator={onLine:false,serviceWorker:{controller:worker,getRegistration:async()=>registration,addEventListener:(name,listener)=>listeners.set(name,listener)}};
  const document={readyState:'loading',currentScript:{dataset:{serviceWorker:'../service-worker.js'},src:base+'books/shared/offline-status.js',hasAttribute:()=>false},
    createElement:()=>element(),querySelector:selector=>selector==='header.app-header, header.topbar, header.v2-primary-header'?header:null};
  const window={WHPwaExpectedRevision:revision,addEventListener(){}};
  vm.runInNewContext(source,{window,document,navigator,location:new URL(base+'v2/app.html'),URL,AbortController,MessageChannel,
    console:{warn(){}},addEventListener(){},requestAnimationFrame:callback=>callback(),
    setTimeout:(callback,delay)=>{const timer=setTimeout(callback,delay);timer.unref();timers.add(timer);return timer;},clearTimeout:timer=>{clearTimeout(timer);timers.delete(timer);}});
  return {worker,query:()=>window.WHOfflineStatus.query(),setCurrent:value=>{current=value;},broadcast:value=>listeners.get('message')({source:worker,data:value}),
    get requests(){return requests;},get status(){return header.children[0]?.dataset.state;},get text(){return header.children[0]?.children[0]?.textContent;},
    get percent(){return header.children[0]?.children[1]?.attributes['aria-valuenow'];},setDeferred:value=>{defer=value;},reply:index=>pending.splice(index,1)[0](),
    destroy(){for(const timer of timers)clearTimeout(timer);for(const port of ports)port.close();}};
}
async function until(predicate){const deadline=Date.now()+1000;while(!predicate()){assert(Date.now()<deadline,'Status query did not settle');await new Promise(resolve=>setTimeout(resolve,1));}}
const results=[];
async function test(name,fn){await fn();results.push({name,status:'PASS'});}

await test('a restarted global adopts low sequence only after the current-worker query',async()=>{
  const h=harness(payload({sequence:900,status:'error',completed:9}));
  try{
    await h.query();assert.equal(h.status,'error');assert.equal(h.text,'Offline access not ready — will retry');
    const preparing=payload({instance:instanceB,sequence:1});h.setCurrent(preparing);h.broadcast(preparing);
    assert.equal(h.status,'error','An unverified new-instance broadcast must not reset ordering itself');
    await until(()=>h.status==='preparing');assert.equal(h.requests,2);assert.equal(h.text,'Preparing offline access…');
    const ready=payload({instance:instanceB,sequence:2,status:'ready',completed:10});h.setCurrent(ready);h.broadcast(ready);
    assert.equal(h.status,'ready');assert.equal(h.text,'Ready for offline use');assert.equal(h.percent,'100');
  }finally{h.destroy();}
});

await test('late old-instance and malformed broadcasts cannot replace current Ready',async()=>{
  const h=harness(payload({sequence:900,status:'error',completed:9}));
  try{
    await h.query();const ready=payload({instance:instanceB,sequence:1,status:'ready',completed:10});h.setCurrent(ready);await h.query();
    h.broadcast(payload({instance:instanceA,sequence:999,status:'error',completed:8}));
    assert.equal(h.status,'ready');await until(()=>h.requests===3);await new Promise(resolve=>setTimeout(resolve,5));
    assert.equal(h.status,'ready');assert.equal(h.text,'Ready for offline use');assert.equal(h.requests,3,'One late incarnation requires only one authoritative refresh');
    h.broadcast(payload({instance:'malformed',sequence:1000,status:'error'}));h.broadcast(payload({legacy:true,sequence:1001,status:'error'}));
    assert.equal(h.status,'ready');assert.equal(h.requests,3,'Malformed/missing instance cannot downgrade an adopted instance');
  }finally{h.destroy();}
});

await test('a late authoritative reply cannot undo a newer authoritative incarnation',async()=>{
  const h=harness(payload({sequence:900,status:'error',completed:9}));
  try{
    await h.query();h.setDeferred(true);const oldQuery=h.query();await until(()=>h.requests===2);
    h.setCurrent(payload({instance:instanceB,sequence:1,status:'ready',completed:10}));const newQuery=h.query();await until(()=>h.requests===3);
    h.reply(1);await newQuery;assert.equal(h.status,'ready');h.reply(0);await oldQuery;
    assert.equal(h.status,'ready');assert.equal(h.text,'Ready for offline use');
  }finally{h.destroy();}
});

await test('legacy workers retain strict sequence ordering without instance metadata',async()=>{
  const h=harness(payload({legacy:true,sequence:10}));
  try{
    await h.query();assert.equal(h.status,'preparing');
    h.broadcast(payload({legacy:true,sequence:9,status:'ready',completed:10}));assert.equal(h.status,'preparing');
    h.broadcast(payload({legacy:true,sequence:11,status:'ready',completed:10}));assert.equal(h.status,'ready');
    h.broadcast(payload({legacy:true,sequence:10,status:'error',completed:8}));assert.equal(h.status,'ready');assert.equal(h.requests,1);
  }finally{h.destroy();}
});
console.log(JSON.stringify({status:'PASS',checks:results.length,results},null,2));
