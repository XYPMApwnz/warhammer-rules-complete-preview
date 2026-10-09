/** Real accepted DG/AM payloads, independent browser resource ownership instrumentation. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const repo=fileURLToPath(new URL('../../../',import.meta.url));
const errors=[],forbidden=[],results=[];
const html=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Host shell</title><link rel="stylesheet" href="/books/shared/army-book-app-v2/styles.css">
<link rel="stylesheet" href="/books/shared/army-book-app-v2/datasheet-v1.css">
<link rel="stylesheet" href="/books/shared/army-book-app-v2/book-v1.css"></head>
<body class="host-theme"><button id="host-focus">Host focus</button><aside id="host-sentinel">Preserved host shell</aside><div id="mount-root"></div>
<script type="module">
import {mount} from '/books/shared/army-book-app-v2/runtime.mjs';
import {createBrowserRoster as dg} from '/books/death-guard/v2/roster-boot.mjs';
import {createBrowserRoster as am} from '/books/adeptus-mechanicus/v2/roster-runtime.mjs';
const books=['death-guard','adeptus-mechanicus'];
const payloads=Object.fromEntries(await Promise.all(books.map(async id=>[id,await (await fetch('/books/'+id+'/v2/generated/app-presentation.json')).json()])));
window.lifecycleHarness={mount,payloads,createRoster:{'death-guard':dg,'adeptus-mechanicus':am}};
</script></body></html>`;
const server=http.createServer((request,response)=>{
  const address=new URL(request.url,'http://localhost').pathname;
  if(address==='/lifecycle.html'){response.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});response.end(html);return;}
  if(address==='/favicon.ico'){response.writeHead(204);response.end();return;}
  const allowed=/^\/books\/(?:death-guard|adeptus-mechanicus)\/v2\/[\w./-]+\.(?:mjs|json|css)$/.test(address)||
    /^\/books\/shared\/(?:army-book-app-v2|roster-v2|rule-contract-v2)\/[\w.-]+\.(?:mjs|css)$/.test(address)||
    /^\/books\/shared\/(?:datasheet-system|unit-art)\.css$/.test(address)||
    /^\/(?:assets|books\/(?:death-guard|adeptus-mechanicus)\/assets)\/[\w./-]+\.(?:png|webp|jpe?g|svg)$/.test(address);
  const file=path.resolve(repo,address.slice(1));
  if(!allowed||!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    forbidden.push(address);response.writeHead(404);response.end();return;
  }
  const types={'.mjs':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml',
    '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'};
  response.writeHead(200,{'Content-Type':types[path.extname(file)],'Cache-Control':'no-store'});response.end(fs.readFileSync(file));
});

// Installed before the app, with no dependency on its lifecycle implementation.
function instrument(){
  const probe={epoch:0,listeners:[],observers:[],frames:new Map(),timers:new Map(),callbacks:[]};
  const listenersByTarget=new WeakMap();
  const enter=(epoch,callback,self,args)=>{const prior=probe.epoch;probe.epoch=epoch;try{return callback.apply(self,args);}finally{probe.epoch=prior;}};
  const add=EventTarget.prototype.addEventListener,remove=EventTarget.prototype.removeEventListener;
  const capture=options=>typeof options==='boolean'?options:Boolean(options?.capture);
  EventTarget.prototype.addEventListener=function(type,callback,options){
    if(!probe.epoch||!callback)return add.call(this,type,callback,options);
    let registrations=listenersByTarget.get(this);
    if(!registrations){registrations=[];listenersByTarget.set(this,registrations);}
    const existing=registrations.find(item=>item.active&&item.type===type&&item.callback===callback&&item.capture===capture(options));
    if(existing)return;
    const record={epoch:probe.epoch,target:this,type,callback,capture:capture(options),active:true};
    record.wrapper=function(...args){if(options?.once)record.active=false;return enter(record.epoch,
      typeof callback==='function'?callback:callback.handleEvent,typeof callback==='function'?this:callback,args);};
    probe.listeners.push(record);registrations.push(record);return add.call(this,type,record.wrapper,options);
  };
  EventTarget.prototype.removeEventListener=function(type,callback,options){
    const record=listenersByTarget.get(this)?.find(item=>item.active&&item.type===type&&item.callback===callback&&item.capture===capture(options));
    if(record){record.active=false;return remove.call(this,type,record.wrapper,options);}
    return remove.call(this,type,callback,options);
  };
  for(const name of ['MutationObserver','ResizeObserver','IntersectionObserver','PerformanceObserver']){
    const Native=window[name];if(!Native)continue;
    window[name]=class extends Native{
      constructor(callback){
        const record={epoch:probe.epoch,type:name,targets:new Set(),callback,instance:null,stack:new Error().stack};
        super((...args)=>enter(record.epoch,callback,undefined,args));record.instance=this;this.__probeRecord=record;probe.observers.push(record);
      }
      observe(target,...args){this.__probeRecord.targets.add(target);return super.observe(target,...args);}
      unobserve(target){this.__probeRecord.targets.delete(target);return super.unobserve(target);}
      disconnect(){this.__probeRecord.targets.clear();return super.disconnect();}
    };
  }
  for(const [schedule,cancel,collection,recurring]of [['requestAnimationFrame','cancelAnimationFrame','frames'],
    ['setTimeout','clearTimeout','timers'],['setInterval','clearInterval','timers',true]]){
    const nativeSchedule=window[schedule].bind(window),nativeCancel=window[cancel].bind(window);
    window[schedule]=function(callback,...args){
      if(!probe.epoch||typeof callback!=='function')return nativeSchedule(callback,...args);
      const record={epoch:probe.epoch,callback,id:null,kind:collection};
      record.id=nativeSchedule((...values)=>{if(!recurring)probe[collection].delete(record.id);return enter(record.epoch,callback,window,values);},...args);
      probe[collection].set(record.id,record);probe.callbacks.push(record);return record.id;
    };
    window[cancel]=id=>{probe[collection].delete(id);return nativeCancel(id);};
  }
  probe.resources=epoch=>({
    globalListeners:probe.listeners.filter(item=>item.epoch===epoch&&item.active&&(item.target===window||item.target===document)).length,
    listeners:probe.listeners.filter(item=>item.epoch===epoch&&item.active).length,
    observers:probe.observers.filter(item=>item.epoch===epoch&&item.targets.size).map(item=>item.type),
    frames:[...probe.frames.values()].filter(item=>item.epoch===epoch).length,
    timers:[...probe.timers.values()].filter(item=>item.epoch===epoch).length,
  });
  window.lifecycleProbe=probe;
}
const cases={
  'death-guard':{weapon:'datasheet-lord-of-contagion:weapon:1',field:'strength',effective:'10',text:
`+ DETACHMENT: Paragons of Putrescence
+ DETACHMENT: Virulent Vectorium
Char1: 1x Lord of Contagion (135 pts): Manreaper
Enhancement: Furnace of Plagues
Char2: 1x Lord of Contagion (120 pts): Manreaper
3x Deathshroud Terminators (150 pts): 3x Manreaper, 3x Plaguespurt gauntlet`},
  'adeptus-mechanicus':{weapon:'datasheet-tech-priest-dominus:weapon:3',field:'skill',effective:'2+',text:
`+ FACTION KEYWORD: Imperium - Adeptus Mechanicus
+ DETACHMENT: Haloscreed Battle Clade
Char1: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe
Enhancement: Cognitive Reinforcement
Char2: 1x Tech-priest Dominus (75 pts): Volkite blaster, Macrostubber, Omnissian axe
10x Skitarii Rangers (85 pts): 10x Galvanic rifle, 10x Close combat weapon`},
};
async function mountBook(page,book,epoch,{reset=true,customRoot=false}={}){
  await page.evaluate(async({book,epoch,reset,customRoot})=>{
    const harness=window.lifecycleHarness;
    if(reset)history.replaceState(null,'','/books/'+book+'/v2/app.html');
    const roster=await harness.createRoster[book]();
    document.querySelector('#host-focus').focus();
    const styles=book==='adeptus-mechanicus'?[new URL('/books/adeptus-mechanicus/v2/theme.css',location.href).href]:[];
    window.lifecycleProbe.epoch=epoch;
    try{
      const app=harness.mount(document,harness.payloads[book],{roster,styles,...(customRoot?{root:document.querySelector('#mount-root')}:{})});
      // Tag API-driven view changes as well as event-driven changes. A separate proxy
      // target respects the frozen public API's non-configurable property invariants.
      window.currentApp=new Proxy({}, {get(_target,key){const value=app[key];if(typeof value!=='function')return value;
        return (...args)=>{const previous=window.lifecycleProbe.epoch;window.lifecycleProbe.epoch=epoch;
          try{return value.apply(app,args);}finally{window.lifecycleProbe.epoch=previous;}};}});
      await app.rosterPanel.ready;
    }
    finally{window.lifecycleProbe.epoch=0;}
  },{book,epoch,reset,customRoot});
  await page.waitForFunction(()=>[...document.querySelectorAll('head link[rel="stylesheet"]')].every(link=>Boolean(link.sheet)));
  await page.waitForTimeout(30);
}
async function assertEffective(page,c,dialog){
  const root=dialog?'dialog[open]':'main';
  const values=await page.locator(`${root} [data-fact-id="${c.weapon}::/${c.field}"]`).evaluateAll(nodes=>nodes.map(node=>JSON.parse(node.dataset.factValue)));
  assert.deepEqual(values,[c.effective],'Persistent roster + route must reconstruct the same effective reference');
}
async function snapshot(page){return page.evaluate(()=>({url:location.href,history:JSON.stringify(history.state),
  storage:JSON.stringify(Object.keys(localStorage).sort().map(key=>[key,localStorage.getItem(key)])),
  body:document.body.innerHTML,title:document.title,classes:document.body.className,head:document.head.innerHTML,
  focus:document.activeElement?.id||document.activeElement?.tagName,
  theme:{background:getComputedStyle(document.body).backgroundColor,
    properties:['--book-accent','--book-panel','--book-ink'].map(name=>getComputedStyle(document.body).getPropertyValue(name))}}));}
async function themeSignature(page){return page.evaluate(()=>({
  body:getComputedStyle(document.body).backgroundColor,
  properties:['--book-accent','--book-panel','--book-ink'].map(name=>getComputedStyle(document.body).getPropertyValue(name)),
  header:getComputedStyle(document.querySelector('.v2-topbar')).backgroundColor,
  logo:getComputedStyle(document.querySelector('.v2-brand-mark')).backgroundImage,
  images:[...document.querySelectorAll('[data-army-book-v2] img')].map(node=>node.getAttribute('src')).sort(),
}));}

await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const installed='C:/Program Files/Google/Chrome/Application/chrome.exe';
const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||(fs.existsSync(installed)?installed:undefined);
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
try{
  for(const [device,viewport]of [['desktop',{width:1440,height:900}],['phone',{width:390,height:844}]]){
    const context=await browser.newContext({viewport,serviceWorkers:'block'});
    await context.addInitScript(instrument);
    const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',error=>errors.push(error.message));
    await page.goto(origin+'/lifecycle.html');await page.waitForFunction(()=>Boolean(window.lifecycleHarness));
    const baseline=await snapshot(page),epochs=[],effectiveURLs={},themes={};
    for(let cycle=0;cycle<10;cycle++)for(const book of ['death-guard','adeptus-mechanicus']){
      const epoch=epochs.length+1,c=cases[book];epochs.push(epoch);
      await mountBook(page,book,epoch,{customRoot:cycle%2===1});
      assert.equal(await page.locator('#host-sentinel').count(),1,'Mount removed the host shell');
      assert.equal(await page.locator('[data-army-book-v2]').count(),1);
      assert.equal(await page.locator('head link[rel="stylesheet"]').count(),book==='adeptus-mechanicus'?10:9);
      const activeEpochs=await page.evaluate(()=>[...new Set(window.lifecycleProbe.observers.filter(item=>item.epoch&&item.targets.size).map(item=>item.epoch))]);
      assert.deepEqual(activeEpochs,[epoch],'Observer ownership must belong to exactly the active mount');
      const globalEpochs=await page.evaluate(()=>[...new Set(window.lifecycleProbe.listeners.filter(item=>item.active&&(item.target===window||item.target===document)).map(item=>item.epoch))]);
      assert.deepEqual(globalEpochs,[epoch],'Global event handlers must belong to exactly the active mount');
      if(cycle===0){
        await page.evaluate(()=>window.currentApp.openRoster());
        await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(c.text);
        await page.locator('[data-roster-action="review-import"]').click();
        await page.waitForFunction(()=>window.currentApp.roster.state?.units?.length===3);
        if(book==='death-guard'){
          await page.locator('[data-attachment-candidate-for="parsed-unit-3"]').selectOption('parsed-unit-1');
          await page.locator('[data-attachment-target-instance-id="parsed-unit-3"] [data-roster-action="attach"]').click();
        }
      }
      await page.evaluate(()=>window.currentApp.openInstance('parsed-unit-1'));
      await page.locator(`main .weapon-name a[data-target-id="${c.weapon}"]`).first().click();
      await page.waitForSelector('dialog[open]');await assertEffective(page,c,true);
      const theme=await themeSignature(page);
      if(book==='adeptus-mechanicus')assert.ok(theme.logo.includes('/books/adeptus-mechanicus/assets/mechanicus-logo.png'));
      else assert.ok(!theme.logo.includes('/books/adeptus-mechanicus/'),'DG retained the AM faction mark');
      if(cycle===0)themes[book]=theme;
      else assert.deepEqual(theme,themes[book],'Switching books contaminated faction colors or image assets');
      effectiveURLs[book]=page.url();
      const before=await snapshot(page);
      const report=await page.evaluate(epoch=>{
        const app=window.currentApp,shell=document.querySelector('[data-army-book-v2]');
        window.retained={app,shell,nodes:[...shell.querySelectorAll('button,a,input,select,textarea,dialog')],html:shell.innerHTML};
        app.destroy();app.destroy();window.retained.html=shell.innerHTML;
        return {destroyed:app.destroyed,globalReleased:window.ArmyBookAppV2===undefined,resources:window.lifecycleProbe.resources(epoch),
          bodyClass:document.body.className,title:document.title,focusInOldShell:shell.contains(document.activeElement),shellConnected:shell.isConnected};
      },epoch);
      assert.equal(report.destroyed,true);assert.equal(report.globalReleased,true);assert.equal(report.shellConnected,false);assert.equal(report.focusInOldShell,false);
      assert.equal(report.bodyClass,baseline.classes);assert.equal(report.title,baseline.title);
      assert.deepEqual(report.resources,{globalListeners:0,listeners:0,observers:[],frames:0,timers:0},'Destroy left live presentation resources');
      const after=await snapshot(page);
      assert.equal(after.url,before.url,'Destroy changed URL');assert.equal(after.history,before.history,'Destroy changed history');
      assert.equal(after.storage,before.storage,'Destroy changed persistent roster');
      assert.equal(after.body,baseline.body,'Mount/destroy grew or altered host DOM');assert.equal(after.head,baseline.head,'Owned styles leaked');
      assert.deepEqual(after.theme,baseline.theme,'Destroy retained faction colors or background');
      assert.deepEqual(await page.evaluate(()=>window.lifecycleProbe.observers.filter(item=>item.targets.size&&!item.stack.includes('InjectedScript')).map(item=>({type:item.type,epoch:item.epoch,stack:item.stack}))),[],
        'Unattributed observer survived destruction');
      // Retain old nodes and replay queued observer/frame/timer callbacks after destruction.
      await page.evaluate(epoch=>{
        const probe=window.lifecycleProbe;
        for(const item of probe.observers.filter(item=>item.epoch===epoch))item.callback([],item.instance);
        for(const item of probe.callbacks.filter(item=>item.epoch===epoch))item.callback(1234);
        for(const item of probe.listeners.filter(item=>item.epoch===epoch))item.wrapper.call(item.target,
          item.type==='keydown'?new KeyboardEvent('keydown',{key:'Escape',cancelable:true}):new Event(item.type,{cancelable:true}));
        for(const node of window.retained.nodes){
          for(const type of ['click','input','change','keydown','cancel','load'])node.dispatchEvent(new Event(type,{cancelable:true,bubbles:true}));
        }
        dispatchEvent(new Event('resize'));dispatchEvent(new Event('scroll'));dispatchEvent(new PopStateEvent('popstate'));dispatchEvent(new HashChangeEvent('hashchange'));
        document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
        for(const name of ['open','showDetail','openInstance','openRelatedRules','setRelatedDetachment'])window.retained.app[name]('absent');
        for(const name of ['library','openLibrary','openRoster','openGlossary','closeGlossary','openPersonalGuide','renderAllForQA'])window.retained.app[name]();
      },epoch);
      await page.waitForTimeout(30);
      assert.deepEqual(await snapshot(page),after,'Destroyed app responded to retained nodes or obsolete callbacks');
      assert.equal(await page.evaluate(()=>window.retained.shell.innerHTML),await page.evaluate(()=>window.retained.html),'Destroyed detached shell mutated');
      assert.equal(await page.locator('dialog').count(),0);assert.equal(await page.locator('[data-army-book-v2]').count(),0);
      await page.evaluate(()=>{window.retained=null;window.currentApp=null;});
    }
    // Clear transient history and rebuild each effective reference from URL + saved roster.
    for(const book of ['death-guard','adeptus-mechanicus']){
      await page.evaluate(url=>history.replaceState(null,'',url),effectiveURLs[book]);
      const epoch=epochs.length+1;epochs.push(epoch);await mountBook(page,book,epoch,{reset:false});
      assert.equal(await page.locator('dialog[open]').count(),0);await assertEffective(page,cases[book],false);
      await page.evaluate(()=>window.currentApp.destroy());
    }
    // A replacement global owned by the host must survive destruction.
    const epoch=epochs.length+1;epochs.push(epoch);await mountBook(page,'death-guard',epoch);
    assert.equal(await page.evaluate(()=>{const replacement={host:true};window.ArmyBookAppV2=replacement;window.currentApp.destroy();return window.ArmyBookAppV2===replacement;}),true);
    await page.evaluate(()=>delete window.ArmyBookAppV2);
    // Defer real saved-roster loading, destroy immediately, then settle the old ready promise.
    const deferredEpoch=epochs.length+1;epochs.push(deferredEpoch);
    await page.evaluate(async epoch=>{
      history.replaceState(null,'','/books/death-guard/v2/app.html');
      const harness=window.lifecycleHarness,service=await harness.createRoster['death-guard']();
      let release;const gate=new Promise(resolve=>release=resolve);
      const delayed=new Proxy(service,{get(target,key){if(key==='load')return async value=>{await gate;return target.load(value);};return Reflect.get(target,key,target);}});
      window.lifecycleProbe.epoch=epoch;
      try{window.deferredApp=harness.mount(document,harness.payloads['death-guard'],{roster:delayed});}
      finally{window.lifecycleProbe.epoch=0;}
      window.deferredShell=document.querySelector('[data-army-book-v2]');window.deferredApp.destroy();
      window.deferredHTML=window.deferredShell.innerHTML;window.releaseDeferred=release;
    },deferredEpoch);
    const deferredBefore=await snapshot(page);
    await page.evaluate(async()=>{window.releaseDeferred();await window.deferredApp.rosterPanel.ready;});await page.waitForTimeout(40);
    assert.deepEqual(await snapshot(page),deferredBefore,'Deferred roster.ready resurrected a destroyed mount');
    assert.equal(await page.evaluate(()=>window.deferredShell.innerHTML===window.deferredHTML),true,'Deferred roster loading mutated retained detached UI');
    for(const old of epochs)assert.deepEqual(await page.evaluate(epoch=>window.lifecycleProbe.resources(epoch),old),
      {globalListeners:0,listeners:0,observers:[],frames:0,timers:0},'Old resource set survived later mounts');
    results.push({device,cycles:10,mounts:epochs.length,rootAppend:true,styles:true,themeIsolation:true,allListeners:true,observerOwnership:true,
      cancelledCallbacks:true,retainedNodes:true,focusCleanup:true,doubleDestroy:true,persistence:true,effectiveRemount:true,deferredReady:true,globalOwnership:true});
    await context.close();
  }
  assert.deepEqual(errors,[]);assert.deepEqual(forbidden,[]);
  console.log(JSON.stringify({status:'PASS',results,errors,forbidden}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
