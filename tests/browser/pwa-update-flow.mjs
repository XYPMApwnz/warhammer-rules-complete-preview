import {launchChromium} from '../helpers/browser-launch.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const updaterMarkup=fs.readFileSync(path.join(root,'index.html'),'utf8').match(/<section class="pwa-update-panel"[\s\S]*?<\/section>/)?.[0];
assert.ok(updaterMarkup,'Root Library updater markup was not found');
const clientSource=fs.readFileSync(path.join(root,'books/shared/offline-status.js'),'utf8');
const clientCss=fs.readFileSync(path.join(root,'books/shared/styles/offline-status.css'),'utf8');
const productionWorker=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
const appShell=['./','./index.html','./books/shared/offline-status.js?v=4','./books/shared/styles/offline-status.css?v=2','./death-approaches.html','./required-b.js'];
const workerTemplate=productionWorker.replace(/const APP_SHELL = \[[\s\S]*?\n\];/,`const APP_SHELL = ${JSON.stringify(appShell,null,2)};`);
assert.notEqual(workerTemplate,productionWorker,'Fixture could not replace APP_SHELL deterministically');

const revisions={A:'aaaaaaaaaaaaaaaa',B:'bbbbbbbbbbbbbbbb'};
let generation='A',legacyRoot=false,failRequired=false,requiredGate=null,serviceWorkerGate=null,serviceWorkerRequests=0,requiredRequests=0;
const serviceWorkerWaiters=[],requiredWaiters=[];
function gate(){let release;const promise=new Promise(resolve=>{release=resolve;});return{promise,release};}
function signal(waiters){for(const resolve of waiters.splice(0))resolve();}
function nextRequest(count,previous,waiters){return count()>previous?Promise.resolve():new Promise(resolve=>waiters.push(resolve));}
function fixtureHtml(){
  if(legacyRoot&&generation==='A')return '<!doctype html><html><body><header></header><main><h1>Legacy Library generation A</h1></main><script>navigator.serviceWorker.register("/service-worker.js")</script></body></html>';
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/books/shared/styles/offline-status.css?v=2"></head><body><header class="topbar"></header>${updaterMarkup}<main><h1>Library generation ${generation}</h1></main><script>sessionStorage.pwaLoads=String(Number(sessionStorage.pwaLoads||0)+1)</script><script src="/books/shared/offline-status.js?v=4" data-service-worker="/service-worker.js"></script></body></html>`;
}
function send(response,status,type,body){response.writeHead(status,{'content-type':type,'cache-control':'no-store'});response.end(body);}
const server=http.createServer(async(request,response)=>{
  const url=new URL(request.url,'http://localhost');
  if(url.pathname==='/service-worker.js'){
    serviceWorkerRequests+=1;signal(serviceWorkerWaiters);if(serviceWorkerGate){const current=serviceWorkerGate;serviceWorkerGate=null;await current.promise;}
    return send(response,200,'text/javascript; charset=utf-8',`${workerTemplate}\n// fixture-generation:${generation}\n`);
  }
  if(url.pathname==='/glossary/generated/cache-revision.js'){
    const bodies={'index.html':fixtureHtml(),'books/shared/offline-status.js':clientSource,'books/shared/styles/offline-status.css':clientCss,
      'death-approaches.html':`<!doctype html><title>Death Approaches</title><main>${generation==='A'?'At the start of the battle round, spread the sickness.':'In your Movement phase, spread the sickness.'}</main>`,
      'required-b.js':`self.fixtureRequired=${JSON.stringify(generation)};`};
    const assets=Object.fromEntries(Object.entries(bodies).map(([path,body])=>[path,{sha256:createHash('sha256').update(body).digest('hex'),bytes:Buffer.byteLength(body)}]));
    return send(response,200,'text/javascript; charset=utf-8',`self.WH40K_CACHE_REVISION=${JSON.stringify(revisions[generation])};self.WH40K_PRECACHE=${JSON.stringify(appShell)};self.WH40K_RUNTIME_ASSETS=${JSON.stringify(assets)};`);
  }
  if(url.pathname==='/'||url.pathname==='/index.html')return send(response,200,'text/html; charset=utf-8',fixtureHtml());
  if(url.pathname==='/books/shared/offline-status.js')return send(response,200,'text/javascript; charset=utf-8',clientSource);
  if(url.pathname==='/books/shared/styles/offline-status.css')return send(response,200,'text/css; charset=utf-8',clientCss);
  if(url.pathname==='/death-approaches.html'){
    const wording=generation==='A'?'At the start of the battle round, spread the sickness.':'In your Movement phase, spread the sickness.';
    return send(response,200,'text/html; charset=utf-8',`<!doctype html><title>Death Approaches</title><main>${wording}</main>`);
  }
  if(url.pathname==='/required-b.js'){
    requiredRequests+=1;signal(requiredWaiters);if(requiredGate)await requiredGate.promise;
    if(generation==='B'&&failRequired)return send(response,503,'text/plain','injected required asset failure');
    return send(response,200,'text/javascript; charset=utf-8',`self.fixtureRequired=${JSON.stringify(generation)};`);
  }
  send(response,404,'text/plain','not found');
});
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await launchChromium();

async function workerRevision(page,selector='active'){
  return page.evaluate(async selector=>{
    const registration=await navigator.serviceWorker.getRegistration();
    const worker=registration?.[selector]||navigator.serviceWorker.controller;
    if(!worker)return null;
    return new Promise(resolve=>{const channel=new MessageChannel();channel.port1.onmessage=event=>resolve(event.data?.revision||null);worker.postMessage({type:'GET_VERSION'},[channel.port2]);});
  },selector);
}
async function cacheNames(page){return page.evaluate(()=>caches.keys());}
async function installA(context){
  generation='A';failRequired=false;requiredGate=null;serviceWorkerGate=null;
  const page=await context.newPage();
  await page.goto(`${origin}/index.html`);
  await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
  await page.waitForFunction(revision=>document.querySelector('[data-pwa-installed-version]')?.textContent===revision,revisions.A);
  assert.equal(await workerRevision(page),revisions.A,'Generation A did not become the active worker');
  return page;
}
async function resetScenario(){generation='A';legacyRoot=false;failRequired=false;requiredGate=null;serviceWorkerGate=null;}

try{
  const bootstrapContext=await browser.newContext({serviceWorkers:'allow',viewport:{width:320,height:800}});
  try{
    legacyRoot=true;generation='A';
    const oldPage=await bootstrapContext.newPage();await oldPage.goto(`${origin}/index.html`);await oldPage.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
    assert.equal(await oldPage.locator('[data-pwa-updater]').count(),0,'Legacy release fixture unexpectedly contained the new updater');
    generation='B';legacyRoot=false;await oldPage.close();
    const currentPage=await bootstrapContext.newPage();await currentPage.goto(`${origin}/index.html`);await currentPage.locator('[data-pwa-updater]').waitFor();
    await currentPage.waitForFunction(revision=>document.querySelector('[data-pwa-updater]')?.dataset.state==='ready'&&document.querySelector('[data-pwa-available-version]')?.textContent===revision,revisions.B);
    assert.equal(await workerRevision(currentPage),revisions.A,'Generation B activated without confirmation during first-release bootstrap');
    await currentPage.getByRole('button',{name:'Install and restart'}).click();
    await currentPage.waitForFunction(revision=>document.querySelector('[data-pwa-installed-version]')?.textContent===revision,revisions.B);
    assert.equal(await workerRevision(currentPage),revisions.B,'Generation B did not control the Library after first-release confirmation');
    console.log('PWA UPDATE QA: first-release close/reopen bootstrap needs no storage reset PASS');
  }finally{await bootstrapContext.close();await resetScenario();}

  const noUpdateContext=await browser.newContext({serviceWorkers:'allow',viewport:{width:320,height:800}});
  try{
    const page=await installA(noUpdateContext);
    assert.equal(await page.getByRole('button',{name:'Check for updates'}).count(),1,'Root updater is not exposed as one accessible button');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),true,'Root updater overflows the 320px viewport');
    const loads=Number(await page.evaluate(()=>sessionStorage.pwaLoads));
    const before=serviceWorkerRequests,swGate=gate();serviceWorkerGate=swGate;
    await page.evaluate(()=>{const button=document.querySelector('[data-pwa-update-action]');button.click();button.click();button.click();});
    await page.waitForFunction(()=>document.querySelector('[data-pwa-updater]')?.dataset.state==='checking');
    await nextRequest(()=>serviceWorkerRequests,before,serviceWorkerWaiters);
    assert.equal(serviceWorkerRequests,before+1,'Repeated Check clicks created duplicate service-worker update requests');
    swGate.release();
    await page.waitForFunction(()=>document.querySelector('[data-pwa-updater]')?.dataset.state==='up_to_date');
    assert.equal(serviceWorkerRequests,before+1,'One manual check performed more than one update request');
    assert.equal(Number(await page.evaluate(()=>sessionStorage.pwaLoads)),loads,'No-update check reloaded the page');
    assert.deepEqual(await cacheNames(page),[`warhammer-rules-fe1d435-${revisions.A}`],'No-update check changed the active cache generation');
    console.log('PWA UPDATE QA: no update and multiple-click race PASS');
  }finally{await noUpdateContext.close();await resetScenario();}

  const automaticContext=await browser.newContext({serviceWorkers:'allow',viewport:{width:320,height:800}});
  try{
    const page=await installA(automaticContext),loads=Number(await page.evaluate(()=>sessionStorage.pwaLoads));
    generation='B';
    await page.reload();
    await page.waitForFunction(revision=>document.querySelector('[data-pwa-updater]')?.dataset.state==='ready'&&document.querySelector('[data-pwa-available-version]')?.textContent===revision,revisions.B);
    assert.equal(await workerRevision(page),revisions.A,'Quiet startup check activated generation B');
    assert.equal(Number(await page.evaluate(()=>sessionStorage.pwaLoads)),loads+1,'Quiet startup check forced an additional reload');
    console.log('PWA UPDATE QA: quiet startup check surfaces a waiting update without activation PASS');
  }finally{await automaticContext.close();await resetScenario();}

  const successContext=await browser.newContext({serviceWorkers:'allow',viewport:{width:320,height:800}});
  try{
    const page=await installA(successContext),loads=Number(await page.evaluate(()=>sessionStorage.pwaLoads));
    const sibling=await successContext.newPage();await sibling.goto(`${origin}/index.html`);await sibling.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
    await sibling.waitForFunction(revision=>document.querySelector('[data-pwa-installed-version]')?.textContent===revision,revisions.A);
    const siblingLoads=Number(await sibling.evaluate(()=>sessionStorage.pwaLoads));
    // Finish initial quiet checks before changing the server generation.
    // The test must not gate a startup update and then wait for a disabled button.
    await sibling.evaluate(()=>WHOfflineStatus.check());await page.bringToFront();await page.evaluate(()=>WHOfflineStatus.check());
    generation='B';requiredGate=gate();const requiredBefore=requiredRequests;
    await page.locator('[data-pwa-update-action]').click();
    await page.waitForFunction(()=>document.querySelector('[data-pwa-updater]')?.dataset.state==='downloading');
    await nextRequest(()=>requiredRequests,requiredBefore,requiredWaiters);
    assert.equal(await workerRevision(page),revisions.A,'Generation B replaced A before completing its cache');
    assert.match(await page.evaluate(()=>fetch('/death-approaches.html').then(response=>response.text())),/At the start of the battle round/,'Generation A stopped serving cached content during B install');
    assert.ok((await cacheNames(page)).includes(`warhammer-rules-fe1d435-${revisions.A}`),'Generation A cache was deleted during B install');
    requiredGate.release();requiredGate=null;
    await page.waitForFunction(revision=>document.querySelector('[data-pwa-updater]')?.dataset.state==='ready'&&document.querySelector('[data-pwa-available-version]')?.textContent===revision,revisions.B);
    assert.equal(await workerRevision(page),revisions.A,'Generation B activated before user confirmation');
    const waitingCaches=await cacheNames(page);
    assert.ok(waitingCaches.includes(`warhammer-rules-fe1d435-${revisions.A}`),'Generation A cache was deleted while B waited');
    assert.ok(waitingCaches.includes(`warhammer-rules-fe1d435-${revisions.B}`),'READY was shown without a generation B cache');
    assert.equal(await page.evaluate(async name=>(await (await caches.open(name)).keys()).length,`warhammer-rules-fe1d435-${revisions.B}`),appShell.length,'READY was shown before every generation B asset was cached');
    await page.getByRole('button',{name:'Install and restart'}).click();
    await page.waitForFunction(({revision,loads})=>document.querySelector('[data-pwa-installed-version]')?.textContent===revision&&Number(sessionStorage.pwaLoads)===loads+1,{revision:revisions.B,loads});
    await sibling.waitForFunction(revision=>document.querySelector('[data-pwa-installed-version]')?.textContent===revision,revisions.B);
    assert.equal(await sibling.locator('h1').textContent(),'Library generation A','A different tab was reloaded without its user confirmation');
    assert.equal(await workerRevision(page),revisions.B,'Generation B did not control the restarted page');
    assert.equal(await workerRevision(sibling),revisions.B,'Generation B did not control the restarted sibling page');
    // Await Cache Storage in Node: Promise-returning waitForFunction is not
    // reliable with the bundled browser adapter. Keep the actual assertion below.
    const deletionDeadline=Date.now()+15000;
    while((await cacheNames(page)).includes(`warhammer-rules-fe1d435-${revisions.A}`)&&Date.now()<deletionDeadline)await new Promise(resolve=>setTimeout(resolve,100));
    assert.equal((await cacheNames(page)).includes(`warhammer-rules-fe1d435-${revisions.A}`),false,'Obsolete cache survived successful migration');
    assert.ok((await cacheNames(page)).includes(`warhammer-rules-fe1d435-${revisions.B}`),'New prepared cache was not retained');
    assert.equal(Number(await page.evaluate(()=>sessionStorage.pwaLoads)),loads+1,'Confirmed update did not reload exactly once');
    assert.equal(Number(await sibling.evaluate(()=>sessionStorage.pwaLoads)),siblingLoads,'Sibling page reloaded without explicit confirmation');
    await successContext.setOffline(true);
    await page.goto(`${origin}/death-approaches.html`);
    await page.getByText('In your Movement phase, spread the sickness.').waitFor();
    console.log('PWA UPDATE QA: successful two-generation update, manual sibling consent, obsolete cache cleanup and current offline page PASS');
  }finally{await successContext.close();await resetScenario();}

  const failedContext=await browser.newContext({serviceWorkers:'allow',viewport:{width:320,height:800}});
  try{
    const page=await installA(failedContext);
    generation='B';failRequired=true;
    await page.locator('[data-pwa-update-action]').click();
    await page.waitForFunction(()=>document.querySelector('[data-pwa-updater]')?.dataset.state==='failed');
    assert.equal(await workerRevision(page),revisions.A,'Failed B install replaced active A');
    assert.equal(await page.evaluate(async()=>Boolean((await navigator.serviceWorker.getRegistration()).waiting)),false,'Failed B install became ready/waiting');
    assert.ok((await cacheNames(page)).includes(`warhammer-rules-fe1d435-${revisions.A}`),'Failed B install deleted A cache');
    await failedContext.setOffline(true);
    await page.goto(`${origin}/death-approaches.html`);
    await page.getByText('At the start of the battle round, spread the sickness.').waitFor();
    await page.goto(`${origin}/index.html`);
    await page.getByRole('button',{name:'Check for updates'}).click();
    await page.waitForFunction(()=>document.querySelector('[data-pwa-updater]')?.dataset.state==='failed');
    assert.equal(await page.getByRole('button',{name:'Retry'}).count(),1,'Offline check did not expose a retry action');
    assert.ok((await cacheNames(page)).includes(`warhammer-rules-fe1d435-${revisions.A}`),'Offline retry deleted the installed cache');
    await page.getByRole('heading',{name:'Library generation A'}).waitFor();
    console.log('PWA UPDATE QA: failed install and offline retry preserve generation A PASS');
  }finally{await failedContext.close();}
}finally{
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
