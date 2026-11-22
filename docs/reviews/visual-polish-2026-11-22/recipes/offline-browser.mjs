/** Package-only optional-SW browser coverage. Never substitutes app data/worker. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createResponder} from './runtime-server.mjs';

const option=name=>process.argv.find(value=>value.startsWith(name+'='))?.slice(name.length+1);
assert(option('--root'),'Pass --root=<already built runtime package>');
const root=path.resolve(option('--root'));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'PAGES_RUNTIME_MANIFEST.json'),'utf8'));
assert.equal(manifest.schema,'unified-v2-pages-runtime-package/v1');
const published=new Set(manifest.files.map(row=>row.path));published.add('PAGES_RUNTIME_MANIFEST.json');
const label=option('--label')||'after';assert(/^[a-z0-9-]+$/.test(label));
const evidence='E:/Warhammer/qa-evidence/visual-polish-v1-2026-11-22';
const out=path.join(evidence,'offline-browser-'+label);
const temporary='E:/Warhammer/qa-tmp/visual-polish/offline-browser-'+label+'-profiles';
assert(!fs.existsSync(out),'Use a fresh output label');assert(!fs.existsSync(temporary),'Use fresh browser profiles');
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(temporary,{recursive:true});fs.mkdirSync(temporary+'/os-temp');
for(const key of ['TMP','TEMP','TMPDIR'])process.env[key]=temporary+'/os-temp';
const {chromium}=createRequire('E:/Warhammer/worktrees/visual-polish-v1/package.json')('playwright');
const prefix='/warhammer-rules-complete-preview/',records=[];
const responder=createResponder(()=>({root,label:manifest.contentSha256}),{prefix,records});
const server=responder.http();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
assert(![8765,8443].includes(server.address().port),'Never bind the owner preview ports');
const origin=`http://127.0.0.1:${server.address().port}`,entry=origin+prefix+'v2/app.html';
const report={schema:'visual-polish-offline-browser/v1',status:'RUNNING',root,package:manifest.contentSha256,revision:manifest.cacheRevision,
  mode:'Fresh Chrome persistent profiles at 390/1440; optional browser capability is the only simulated input.',
  scope:'Missing API, denied API getter, SecurityError registration, plus actual normal worker Ready.',cases:[]};
const save=()=>fs.writeFileSync(out+'/RESULTS.json',JSON.stringify(report,null,2)+'\n','utf8');save();
const modes=['missing-api','getter-denied','registration-denied','normal'];
let context,page,current;
async function ready(){
  await page.waitForFunction(()=>!!window.WarhammerAppV2&&!document.querySelector('[data-v2-loading]'));
  await page.evaluate(()=>WarhammerAppV2.ready);
}
async function indicator(){return page.evaluate(()=>Array.from(document.querySelectorAll('[data-offline-package-status]')).map(node=>{
  const style=getComputedStyle(node),rect=node.getBoundingClientRect();
  const visible=!node.hidden&&style.display!=='none'&&style.visibility!=='hidden'&&style.opacity!=='0'&&rect.width>0&&rect.height>0;
  return {hidden:node.hidden,visible,state:node.dataset.state||null,text:node.querySelector('.offline-package-label')?.textContent||''};
}));}
async function assertOnlineOnly(mode){
  const value=await indicator();assert(value.every(node=>!node.visible),'An online-only browser must have no offline-status indicator');
  assert.equal((await page.locator('body').innerText()).includes('Offline access not ready — will retry'),false);
  const observations=await page.evaluate(()=>({...window.__qaOfflineAvailability}));
  assert.equal(observations.registerCalls,mode==='registration-denied'?1:0,'Only the deliberate denied registration may be attempted');
  if(mode==='getter-denied')assert(observations.getterReads>=1);
  const updater=page.locator('[data-pwa-updater]');
  if(mode==='registration-denied'){assert.equal(await updater.getAttribute('data-unavailable'),'true');assert.equal(await updater.isVisible(),false);}
  else assert.equal(await updater.count(),0);
  return {indicator:value,observations,updaterHidden:true};
}
async function fullReady(){
  await page.waitForFunction(async expected=>{
    const worker=navigator.serviceWorker.controller;if(!worker)return false;
    const ask=type=>new Promise(resolve=>{const channel=new MessageChannel(),timer=setTimeout(()=>resolve(null),3000);channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(event.data);};worker.postMessage({type},[channel.port2]);});
    const version=await ask('GET_VERSION'),status=await ask('WH_OFFLINE_PACKAGE_STATUS_QUERY');
    return version?.revision===expected.revision&&status?.revision===expected.revision&&status.status==='ready'&&status.completed===status.total&&status.total===expected.total;
  },{revision:manifest.cacheRevision,total:manifest.precacheUrls},{timeout:120000});
  return page.evaluate(async()=>{
    const worker=navigator.serviceWorker.controller;
    return new Promise(resolve=>{const channel=new MessageChannel();channel.port1.onmessage=event=>{channel.port1.close();resolve(event.data);};worker.postMessage({type:'WH_OFFLINE_PACKAGE_STATUS_QUERY'},[channel.port2]);});
  });
}

try{
 for(const width of [390,1440])for(const mode of modes){
  current={width,mode,status:'RUNNING',pageErrors:[],consoleErrors:[],failedRequests:[],steps:[],screenshots:[]};report.cases.push(current);save();
  context=await chromium.launchPersistentContext(temporary+'/'+width+'-'+mode,{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,
    viewport:{width,height:width===390?844:1000},isMobile:width===390,hasTouch:width===390,serviceWorkers:'allow'});
  await context.addInitScript(mode=>{
    const observed=window.__qaOfflineAvailability={mode,registerCalls:0,getterReads:0};
    if(typeof ServiceWorkerContainer==='function'){
      const register=ServiceWorkerContainer.prototype.register;
      ServiceWorkerContainer.prototype.register=function(...args){
        observed.registerCalls++;
        if(mode==='registration-denied')return Promise.reject(new DOMException('Injected browser policy denial','SecurityError'));
        return register.apply(this,args);
      };
    }
    if(mode==='missing-api'){
      let prototype=navigator;
      while(prototype){if(Object.prototype.hasOwnProperty.call(prototype,'serviceWorker'))delete prototype.serviceWorker;prototype=Object.getPrototypeOf(prototype);}
      observed.apiAbsent=!('serviceWorker' in navigator);
    }else if(mode==='getter-denied'){
      Object.defineProperty(Navigator.prototype,'serviceWorker',{configurable:true,get(){observed.getterReads++;throw new DOMException('Injected browser policy getter denial','SecurityError');}});
    }
  },mode);
  page=context.pages()[0]||await context.newPage();page.setDefaultTimeout(30000);const row=current;
  page.on('pageerror',error=>row.pageErrors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')row.consoleErrors.push(message.text());});
  page.on('requestfailed',request=>row.failedRequests.push({url:request.url(),failure:request.failure()}));
  const shot=async suffix=>{const file=width+'-'+mode+'-'+suffix+'.jpg';await page.screenshot({path:path.join(out,file),type:'jpeg',quality:80,fullPage:false});current.screenshots.push(file);};
  console.log(width+' '+mode+' Home');let start=performance.now();
  await page.goto(entry,{waitUntil:'domcontentloaded'});await ready();
  assert.equal(await page.locator('[data-v2-book]').count(),9);assert.equal(await page.locator('[data-v2-loading]').count(),0);
  if(mode!=='normal')current.onlineOnly=await assertOnlineOnly(mode);
  else current.preparedWorker=await fullReady();
  if(mode==='missing-api')assert.equal(current.onlineOnly.observations.apiAbsent,true);
  current.steps.push({name:'Home without blank/loading screen',status:'PASS',elapsedMs:Math.round(performance.now()-start),bookLinks:9});
  await shot('home');save();
  console.log(width+' '+mode+' Death Guard');start=performance.now();
  await page.locator('[data-v2-book="death-guard"]').click();await ready();
  await page.waitForFunction(()=>window.ArmyBookAppV2?.payload?.book?.id==='death-guard');
  await page.evaluate(async()=>{await ArmyBookAppV2.rosterPanel?.ready;await document.fonts.ready;});
  const library=await page.evaluate(()=>({book:ArmyBookAppV2.payload.book.id,expected:ArmyBookAppV2.payload.groups.reduce((sum,group)=>sum+group.itemIds.length,0),shown:document.querySelectorAll('main .v2-library-card').length}));
  assert(library.expected>0);assert.equal(library.shown,library.expected);assert.equal(library.book,'death-guard');
  if(mode!=='normal'){
    const before=await assertOnlineOnly(mode);
    await page.evaluate(()=>{window.dispatchEvent(new Event('online'));window.dispatchEvent(new Event('focus'));});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const after=await assertOnlineOnly(mode);assert.equal(after.observations.registerCalls,before.observations.registerCalls,'Browser-policy denial must not create a focus/online retry loop');
    current.afterRecoveryEvents=after;
  }
  current.steps.push({name:'Online native DG library',status:'PASS',elapsedMs:Math.round(performance.now()-start),...library});await shot('library');
  await page.waitForLoadState('networkidle');
  assert.deepEqual(current.pageErrors,[]);assert.deepEqual(current.consoleErrors,[]);assert.deepEqual(current.failedRequests,[]);
  current.status='PASS';await context.close();context=null;save();
 }
 report.status='PASS';
}catch(error){
 report.status='FAIL';report.error=error.stack;process.exitCode=1;console.error(error.stack);
 if(page&&!page.isClosed()){
  await page.screenshot({path:out+'/FAILURE.jpg',type:'jpeg',quality:80}).catch(()=>{});
  report.failureView=await page.evaluate(()=>({url:location.href,loading:document.querySelector('[data-v2-loading]')?.textContent||null,application:!!window.WarhammerAppV2,
    indicator:Array.from(document.querySelectorAll('[data-offline-package-status]')).map(node=>({hidden:node.hidden,text:node.querySelector('.offline-package-label')?.textContent,state:node.dataset.state})),observations:window.__qaOfflineAvailability})).catch(()=>null);
 }
}finally{
 await context?.close();responder.close();server.closeAllConnections?.();await new Promise(resolve=>server.close(resolve));
 report.network={requests:records.length,httpFailures:records.filter(row=>row.status>=400),unpublishedSuccessfulResources:records.filter(row=>row.status===200&&row.relative&&!published.has(row.relative))};
 if(report.network.httpFailures.length||report.network.unpublishedSuccessfulResources.length){report.status='FAIL';process.exitCode=1;}
 fs.writeFileSync(out+'/NETWORK.json',JSON.stringify(records,null,2)+'\n','utf8');save();console.log(JSON.stringify({status:report.status,out}));
}
