/** Real A -> B publication regression for the initial V2 loading boundary.
 * B changes only a CSS comment: gameplay and saved-roster bytes stay identical.
 * --product-root <checkout> runs this new test against an untouched older tree.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {buildPagesRuntimePackage} from '../../tools/pages-runtime-package.mjs';
import {readCacheRevision,writeCacheRevision} from '../../tools/cache-revision.mjs';
import {launchChromium} from '../helpers/browser-launch.mjs';
import {createQaEvidenceDir,createQaTempDir} from '../helpers/qa-temp.mjs';

const args=process.argv.slice(2),rootFlag=args.indexOf('--product-root');
if(args.length&&(rootFlag!==0||args.length!==2||!args[1]))throw Error('Usage: node tests/browser/pwa-bootstrap-update.mjs [--product-root <checkout>]');
const source=path.resolve(rootFlag<0?fileURLToPath(new URL('../../',import.meta.url)):args[1]);
const out=path.resolve(process.env.WH_PWA_BOOTSTRAP_OUT||createQaEvidenceDir('wh-pwa-bootstrap-'));
fs.mkdirSync(out,{recursive:true});
const workspace=createQaTempDir('wh-pwa-bootstrap-work-'),A=path.join(workspace,'A'),B=path.join(workspace,'B');
const publication=buildPagesRuntimePackage({sourceRoot:source,outRoot:A});
fs.cpSync(A,B,{recursive:true});
fs.appendFileSync(path.join(B,'books/shared/styles/offline-status.css'),'\n/* Synthetic next publication for bootstrap browser QA. */\n');
const aRevision=readCacheRevision({root:A}),bRevision=writeCacheRevision({root:B});
assert.notEqual(aRevision,bRevision,'Synthetic B must have a different publication revision');
const staleRevision='cccccccccccccccc';assert(![aRevision,bRevision].includes(staleRevision));
const report={source,publication,aRevision,bRevision,results:[]},prefix='/warhammer-rules-complete-preview/';
let generation='A',failBoot=false,holdBoot=false,staleHtmlResponses=0,staleHtmlServed=0,staleDeclaredRevision=staleRevision,browser;
const heldBoot=[];
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json'};
const server=http.createServer((request,response)=>{
  const url=new URL(request.url,'http://localhost');
  try{
    assert(url.pathname.startsWith(prefix));
    if(url.pathname===prefix+'installation-probe.html'){
      response.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});
      response.end('<!doctype html><html lang="en"><title>Installation-only QA probe</title><body>Installation only; application modules are not loaded.</body></html>');return;
    }
    const root=generation==='A'?A:B;
    let file=path.resolve(root,url.pathname.slice(prefix.length));
    assert(file===root||file.startsWith(root+path.sep));
    if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    if(holdBoot&&url.pathname.endsWith('/v2/boot.mjs')){heldBoot.push({response,file});return;}
    if(failBoot&&url.pathname.endsWith('/v2/boot.mjs')){
      response.writeHead(503,{'content-type':'text/plain','cache-control':'no-store'});response.end('Injected startup module outage');return;
    }
    let bytes=fs.readFileSync(file);
    if(staleHtmlResponses>0&&url.pathname.endsWith('/v2/app.html')){
      const original=bytes.toString('utf8'),injected=original.replace(/(WHPwaExpectedRevision\s*=\s*["'])[a-f0-9]{16}(["'])/,'$1'+staleDeclaredRevision+'$2');
      assert.notEqual(injected,original,'The stale HTML fault must change only the declared document revision');
      bytes=Buffer.from(injected,'utf8');staleHtmlResponses--;staleHtmlServed++;
    }
    response.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});
    response.end(bytes);
  }catch{response.writeHead(404);response.end('Missing runtime resource');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const entry=`http://127.0.0.1:${server.address().port}${prefix}v2/app.html`;
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function poll(page,fn,arg,timeout=15000){
  const end=Date.now()+timeout;
  while(Date.now()<end){
    try{const value=await page.evaluate(fn,arg);if(value)return value;}
    catch(error){if(!/context|navigation|destroyed/i.test(error.message))throw error;}
    await sleep(75);
  }
  const diagnosis=await page.evaluate(()=>({url:location.href,bootstrap:document.body?.dataset.pwaBootstrapState,updater:document.querySelector('[data-pwa-updater]')?.dataset.state,text:document.body?.innerText})).catch(()=>null);
  throw Error('Browser condition timed out: '+fn.toString().slice(0,160)+' '+JSON.stringify({diagnosis,worker:await worker(page).catch(()=>null),observations:await observations(page).catch(()=>null)}));
}
async function ready(page){await poll(page,()=>!!window.WarhammerAppV2&&!document.querySelector('[data-v2-loading]'));await page.evaluate(()=>WarhammerAppV2.ready);}
async function go(page,query=''){await page.goto(entry+query,{waitUntil:'load'});await ready(page);}
async function worker(page){return page.evaluate(async()=>{
  const registration=await navigator.serviceWorker.getRegistration();
  const ask=worker=>worker?new Promise(resolve=>{
    const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();resolve(null);},1500);
    channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(event.data);};
    worker.postMessage({type:'GET_VERSION'},[channel.port2]);
  }):null;
  return{active:(await ask(registration?.active))?.revision,controller:(await ask(navigator.serviceWorker.controller))?.revision,waiting:(await ask(registration?.waiting))?.revision};
});}
async function workerIs(page,revision,{waiting=false}={}){
  const end=Date.now()+15000;let last;
  while(Date.now()<end){last=await worker(page);if(waiting?last.waiting===revision:last.active===revision&&last.controller===revision)return last;await sleep(75);}
  throw Error('Worker did not reach '+revision+' '+JSON.stringify(last));
}
// Observe public browser actions across reloads; the only optional fault is an
// explicit refusal of SKIP_WAITING, leaving the real prepared B worker waiting.
async function contextFor(viewport={width:1440,height:900}){
  const context=await browser.newContext({viewport,serviceWorkers:'allow'});
  context.on('page',page=>{
    page.on('console',message=>{if(['warning','error'].includes(message.type())){report.browserMessages??=[];report.browserMessages.push({type:message.type(),text:message.text(),url:page.url()});}});
    page.on('pageerror',error=>{report.browserMessages??=[];report.browserMessages.push({type:'pageerror',text:error.stack,url:page.url()});});
    page.on('requestfailed',request=>{report.browserMessages??=[];report.browserMessages.push({type:'requestfailed',text:request.failure()?.errorText,url:request.url()});});
    page.on('response',response=>{if(response.status()>=400){report.browserMessages??=[];report.browserMessages.push({type:'response',status:response.status(),url:response.url()});}});
  });
  await context.addInitScript(()=>{
    const key='qa:pwa-bootstrap-observations',read=()=>{try{return JSON.parse(sessionStorage.getItem(key)||'{"navigations":0,"activations":[],"states":[]}');}catch{return{navigations:0,activations:[],states:[]};}};
    const record=change=>{try{const value=read();change(value);sessionStorage.setItem(key,JSON.stringify(value));}catch{/* A case deliberately blocks sessionStorage. */}};
    record(value=>value.navigations++);
    window.qaPwaActivationAttempts=[];
    if(typeof ServiceWorker==='undefined')return;
    const original=ServiceWorker.prototype.postMessage;
    ServiceWorker.prototype.postMessage=function(message,ports){
      if(message?.type==='SKIP_WAITING'){
        window.qaPwaActivationAttempts.push(message.revision);
        record(value=>value.activations.push(message.revision));
        if(sessionStorage.getItem('qa:pwa-refuse-activation')==='yes'){
          queueMicrotask(()=>ports?.[0]?.postMessage({accepted:false}));return;
        }
      }
      return original.call(this,message,ports);
    };
    let previous='';
    new MutationObserver(()=>{
      const state=document.body?.dataset.pwaBootstrapState;if(!state)return;
      const value={state,loading:!!document.querySelector('[data-v2-loading]'),text:document.querySelector('[data-v2-loading]')?.textContent||'',shell:!!document.querySelector('[data-v2-shell]')};
      const serialized=JSON.stringify(value);if(serialized!==previous){previous=serialized;record(log=>log.states.push(value));}
    }).observe(document,{attributes:true,childList:true,characterData:true,subtree:true});
  });
  return context;
}
async function observations(page){return page.evaluate(()=>JSON.parse(sessionStorage.getItem('qa:pwa-bootstrap-observations')));}
async function storage(page){return page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).sort()));}
async function seed(context){
  generation='A';failBoot=false;
  const page=await context.newPage();page.setDefaultTimeout(15000);
  await go(page);await workerIs(page,aRevision);
  await page.evaluate(()=>{localStorage.setItem('pwa-bootstrap-settings',JSON.stringify({theme:'dark',language:'en',size:17}));localStorage.setItem('pwa-bootstrap-sentinel','preserve all local data');});
  return page;
}
async function prepareB(page){
  generation='B';await page.evaluate(async()=>{const registration=await navigator.serviceWorker.getRegistration();await registration.update();});
  const state=await workerIs(page,bRevision,{waiting:true});
  assert.equal(state.active,aRevision,'A working screen must keep its active publication');
}
async function assertFailure(page,label,timeout=15000){
  await poll(page,()=>document.body.dataset.pwaBootstrapState==='failed',undefined,timeout);
  assert.equal(await page.locator('[data-pwa-updater]').getAttribute('data-state'),'startup_failed',label);
  const action=page.locator('[data-pwa-update-action]');assert.equal((await action.textContent()).trim(),'Try again');assert(await action.isEnabled(),label+' must have an enabled recovery action');
  assert.equal(await page.locator('[data-v2-shell]').count(),0,label+' must not expose a partial working shell');
  await page.screenshot({path:path.join(out,label+'.png'),fullPage:true});
}
const draft='Unfinished native V2 import\nNBSP: Blood\u00a0Angels';
async function rosterState(page){return page.evaluate(()=>({storage:Object.fromEntries(Object.entries(localStorage).sort()),snapshot:ArmyBookAppV2.roster.snapshot(),totalPoints:ArmyBookAppV2.roster.points.totalPoints,draft:document.querySelector('[data-roster-input="raw-text"]')?.value,document:window.pwaDocumentSentinel}));}

try{
  browser=await launchChromium();
  {
    const context=await contextFor({width:390,height:844});
    try{
      generation='A';const installer=await context.newPage();
      await installer.goto(entry.replace('/v2/app.html','/installation-probe.html'));
      await installer.evaluate(async()=>{await navigator.serviceWorker.register('./service-worker.js',{updateViaCache:'none'});await navigator.serviceWorker.ready;localStorage.setItem('pwa-fresh-install-setting','preserve before first application start');});
      await workerIs(installer,aRevision);const before=await storage(installer);
      assert.equal(await installer.evaluate(()=>typeof window.WarhammerAppV2),'undefined','Installation must not warm the application module graph online');
      await context.setOffline(true);
      const page=await context.newPage();await page.goto(entry,{waitUntil:'load'});await ready(page);await workerIs(page,aRevision);
      await page.locator('[data-v2-destination="ROSTER"]').click();await page.evaluate(()=>WarhammerAppV2.ready);
      assert.equal(await page.locator('[data-v2-book]').count(),9,'The first offline launch must offer all nine books without fetching lazy book payloads');
      assert.deepEqual(await storage(page),before);assert.deepEqual((await observations(page)).activations,[]);
      await page.screenshot({path:path.join(out,'fresh-install-first-offline-startup-390.png'),fullPage:true});
      report.results.push({case:'fresh installation only, no online app warmup, then first offline Home and nine-book chooser startup',status:'PASS'});
    }finally{await context.close();}
  }
  {
    const context=await contextFor({width:390,height:844});
    try{
      const installed=await seed(context),before=await storage(installed);await prepareB(installed);
      await context.setOffline(true);
      const page=await context.newPage();await page.goto(entry,{waitUntil:'load'});
      await ready(page);await workerIs(page,bRevision);
      assert.equal(await page.evaluate(()=>WHPwaExpectedRevision),bRevision,'An already prepared waiting B must open automatically even when initial offline HTML is compatible A');
      const log=await observations(page);assert.deepEqual(log.activations,[bRevision]);assert.equal(log.navigations,2,'A prepared offline update must reload exactly once');
      assert.deepEqual(await storage(page),before,'Prepared offline activation must preserve every saved setting and roster value');
      assert(log.states.some(value=>value.state==='updating'&&value.loading&&!value.shell),'Offline activation must stay inside the initial Loading boundary');
      await page.screenshot({path:path.join(out,'prepared-update-offline-before-startup-390.png'),fullPage:true});
      report.results.push({case:'already prepared waiting B auto-applies offline before a compatible cached A startup can open',status:'PASS',observations:log});
    }finally{await context.close();}
  }
  {
    const context=await contextFor();
    try{
      const installed=await seed(context),before=await storage(installed);await prepareB(installed);
      staleDeclaredRevision=aRevision;staleHtmlResponses=1;
      const page=await context.newPage();await page.goto(entry+'?v2=ROSTER&book=space-marines',{waitUntil:'load'});
      await ready(page);await workerIs(page,bRevision);
      assert.equal(await page.evaluate(()=>WHPwaExpectedRevision),bRevision,'Delayed compatible A HTML must not bypass a ready B or strand the roster route');
      const log=await observations(page);assert.deepEqual(log.activations,[bRevision]);assert.equal(log.navigations,2);
      assert.deepEqual(await storage(page),before);
      report.results.push({case:'delayed online HTML declaring active A still auto-applies prepared B before opening a roster',status:'PASS',observations:log});
    }finally{staleHtmlResponses=0;staleDeclaredRevision=staleRevision;await context.close();}
  }
  for(const [mode,viewport] of [['fresh',{width:1440,height:900}],['reload',{width:390,height:844}]]){
    const context=await contextFor(viewport);
    try{
      const installed=await seed(context),before=await storage(installed);await prepareB(installed);
      const page=mode==='fresh'?await context.newPage():installed;
      if(mode==='fresh')await page.goto(entry,{waitUntil:'load'});else await page.reload({waitUntil:'load'});
      await ready(page);await workerIs(page,bRevision);
      const log=await observations(page),updating=log.states.find(value=>value.state==='updating');
      assert(updating,'Startup mismatch must visibly enter Updating rather than remain Loading');
      assert(updating.loading,'The initial loading boundary must persist throughout automatic activation');
      assert.match(updating.text,/Updating/,'The startup message must be English Updating');
      assert.equal(updating.shell,false,'Automatic activation is limited to the initial loading screen');
      assert.deepEqual(log.activations,[bRevision],'Exactly the matching prepared publication may auto-activate');
      assert.equal(log.navigations,mode==='fresh'?2:3,'Startup activation must perform exactly one reload');
      assert.deepEqual(await storage(page),before,'Automatic startup update must preserve every localStorage entry');
      const marker=await page.evaluate(()=>Object.keys(sessionStorage).filter(key=>key.startsWith('wh40k:pwa-auto-update:')));
      assert(marker.length>0,'An automatic update must leave its once-per-version session marker');
      await page.screenshot({path:path.join(out,`startup-${mode}-${viewport.width}.png`),fullPage:true});
      await context.setOffline(true);await page.reload({waitUntil:'load'});await ready(page);await workerIs(page,bRevision);
      assert.equal(await page.locator('[data-v2-book="space-marines"]').count(),1,'Installed B home must reopen offline');
      assert.deepEqual(await storage(page),before,'Offline reopening must preserve user settings');
      assert.equal((await observations(page)).activations.length,1,'Offline reopen must not repeat activation');
      report.results.push({case:`initial ${mode} mismatch and offline reopen`,width:viewport.width,status:'PASS',observations:log});
    }finally{await context.close();}
  }

  {
    const context=await contextFor();
    try{
      const page=await seed(context);await go(page,'?v2=ROSTER&book=space-marines');
      await openImportForm(page);await page.locator('.v2-roster textarea').fill(fs.readFileSync(path.join(source,'books/space-marines/v2/fixtures/newrecruit-v37.3-user-sm.txt'),'utf8'));
      await page.getByRole('button',{name:'Import roster',exact:true}).click();
      await poll(page,()=>window.ArmyBookAppV2?.roster?.state?.units.length===3);
      await page.evaluate(()=>ArmyBookAppV2.openRoster());await openImportForm(page);await page.locator('[data-roster-input="raw-text"]').fill(draft);
      await page.evaluate(()=>{
        const input=document.querySelector('[data-roster-input="raw-text"]');input.focus();input.setSelectionRange(4,17,'backward');
        window.pwaDocumentSentinel='working A during sibling automatic update';
        history.replaceState({...history.state,pwaHistorySentinel:{unchanged:true}},'',location.href);
        window.qaWorkingNodes={shell:document.querySelector('[data-v2-shell]'),main:document.querySelector('main'),input};
      });
      const before=await rosterState(page),address=await page.evaluate(()=>({url:location.href,state:history.state,length:history.length,selection:{start:qaWorkingNodes.input.selectionStart,end:qaWorkingNodes.input.selectionEnd,direction:qaWorkingNodes.input.selectionDirection}}));
      assert(Number.isFinite(before.totalPoints)&&before.totalPoints>0,'The initial imported roster must have resolved points');
      const originalLog=await observations(page);await prepareB(page);
      const startup=await context.newPage();await startup.goto(entry,{waitUntil:'load'});await ready(startup);await workerIs(startup,bRevision);await workerIs(page,bRevision);
      await poll(page,()=>document.querySelector('[data-pwa-updater]')?.dataset.state==='changed');
      assert.deepEqual(await rosterState(page),before,'A sibling startup activation must preserve every working roster, draft and localStorage value');
      assert.deepEqual(await page.evaluate(()=>({url:location.href,state:history.state,length:history.length,selection:{start:qaWorkingNodes.input.selectionStart,end:qaWorkingNodes.input.selectionEnd,direction:qaWorkingNodes.input.selectionDirection}})),address,'Sibling activation must preserve URL, browser history and unfinished-input selection');
      assert(await page.evaluate(()=>qaWorkingNodes.shell===document.querySelector('[data-v2-shell]')&&qaWorkingNodes.main===document.querySelector('main')&&qaWorkingNodes.input===document.querySelector('[data-roster-input="raw-text"]')),'Sibling automatic activation must retain the original physical working DOM nodes');
      const afterLog=await observations(page);assert.equal(afterLog.navigations,originalLog.navigations,'Working A must not reload after another tab automatically activates B');
      assert.deepEqual(afterLog.activations,[],'Only the new startup tab may request automatic activation');
      assert.deepEqual((await observations(startup)).activations,[bRevision]);
      assert.equal(await page.evaluate(()=>WHPwaExpectedRevision),aRevision,'Existing working A must remain mounted until its user chooses to restart');
      assert(await page.locator('[data-pwa-update-action]').isEnabled(),'The retained working tab must offer manual restart');
      await page.screenshot({path:path.join(out,'working-roster-after-sibling-auto.png'),fullPage:true});
      report.results.push({case:'sibling startup auto-activation preserves working A physical DOM, history, URL, selection, roster, draft and all localStorage with manual banner',status:'PASS'});
    }finally{await context.close();}
  }

  {
    const context=await contextFor({width:390,height:844});
    try{
      const installed=await seed(context),before=await storage(installed);await prepareB(installed);
      const page=await context.newPage();await page.addInitScript(()=>{
        const blocked=window.sessionStorage;
        for(const name of ['getItem','setItem','removeItem','clear']){
          const original=Storage.prototype[name];Storage.prototype[name]=function(...args){
            if(this===blocked)throw new DOMException('Injected blocked sessionStorage','SecurityError');
            return original.apply(this,args);
          };
        }
      });
      let navigations=0;page.on('framenavigated',frame=>{if(frame===page.mainFrame())navigations++;});
      await page.goto(entry,{waitUntil:'load'});await assertFailure(page,'session-storage-blocked');
      assert.deepEqual(await page.evaluate(()=>qaPwaActivationAttempts),[],'An unavailable once-marker store must never grant automatic activation');
      assert.equal(navigations,1,'Blocked storage must not start a reload loop');
      const state=await worker(page);assert.equal(state.active,aRevision);assert.equal(state.waiting,bRevision);
      assert.deepEqual(await storage(page),before,'Blocked sessionStorage must not alter persistent settings');
      report.results.push({case:'blocked sessionStorage fails closed with actionable manual recovery and no activation or reload',status:'PASS'});
    }finally{await context.close();}
  }

  {
    const context=await contextFor({width:390,height:844});
    try{
      const installed=await seed(context),before=await storage(installed);await prepareB(installed);
      const page=await context.newPage();await page.addInitScript(()=>{
        const original=ServiceWorker.prototype.postMessage;
        ServiceWorker.prototype.postMessage=function(message,ports){
          if(message?.type==='WH_OFFLINE_PACKAGE_STATUS_QUERY'&&this.state==='installed'){
            if(!window.qaStartupInputScheduled){
              window.qaStartupInputScheduled=true;
              setTimeout(()=>{const input=document.createElement('textarea');input.id='qa-pending-startup-draft';input.value='Typed while the prepared worker was being verified';document.body.append(input);window.qaPendingStartupInput=input;input.dispatchEvent(new Event('input',{bubbles:true}));},25);
            }
            setTimeout(()=>original.call(this,message,ports),150);return;
          }
          return original.call(this,message,ports);
        };
      });
      let navigations=0;page.on('framenavigated',frame=>{if(frame===page.mainFrame())navigations++;});
      await page.goto(entry,{waitUntil:'load'});
      await poll(page,()=>!!window.qaPendingStartupInput&&document.querySelector('[data-pwa-update-action]')?.textContent==='Install and restart');
      // Let every intentionally delayed verification finish before checking that
      // the input added during those requests prevented automatic activation.
      await sleep(200);
      assert.deepEqual(await page.evaluate(()=>qaPwaActivationAttempts),[],'Input inserted during worker verification must prevent automatic activation');
      assert.equal(navigations,1,'Pending-verification input must prevent automatic reload');
      assert.equal(await page.locator('#qa-pending-startup-draft').inputValue(),'Typed while the prepared worker was being verified');
      assert(await page.evaluate(()=>qaPendingStartupInput===document.querySelector('#qa-pending-startup-draft')),'Unfinished input must retain its original physical node');
      assert(await page.locator('[data-pwa-update-action]').isEnabled(),'A ready update with unfinished input must remain a manual choice');
      const state=await worker(page);assert.equal(state.active,aRevision);assert.equal(state.waiting,bRevision);assert.deepEqual(await storage(page),before);
      report.results.push({case:'input inserted during pending worker verification prevents automatic activation and preserves draft',status:'PASS'});
    }finally{await context.close();}
  }

  {
    const context=await contextFor({width:390,height:844});
    try{
      const installed=await seed(context),before=await storage(installed);await prepareB(installed);
      const page=await context.newPage();await page.addInitScript(()=>{
        const original=ServiceWorker.prototype.postMessage;
        ServiceWorker.prototype.postMessage=function(message,ports){
          if(message?.type==='SKIP_WAITING'&&!window.qaDelayedActivationStarted){
            window.qaDelayedActivationStarted=true;
            setTimeout(()=>{
              const input=document.createElement('textarea');input.id='qa-during-activation-draft';input.value='Typed after automatic activation was requested';document.body.append(input);window.qaDuringActivationInput=input;input.dispatchEvent(new Event('input',{bubbles:true}));
            },50);
            setTimeout(()=>original.call(this,message,ports),200);return;
          }
          return original.call(this,message,ports);
        };
      });
      await page.goto(entry,{waitUntil:'load'});await assertFailure(page,'input-during-activation');await workerIs(page,bRevision);
      const log=await observations(page);
      assert(log.states.some(value=>value.state==='updating'),'The late-input case must enter automatic Updating before its input arrives');
      assert.deepEqual(log.activations,[bRevision],'The real prepared B worker must receive the delayed activation request');
      assert.equal(log.navigations,1,'Input arriving after activation starts must prevent the final automatic reload');
      assert.equal(await page.locator('#qa-during-activation-draft').inputValue(),'Typed after automatic activation was requested');
      assert(await page.evaluate(()=>qaDuringActivationInput===document.querySelector('#qa-during-activation-draft')),'Late unfinished input must retain its original physical node after B activates');
      assert.deepEqual(await storage(page),before,'Late input must not lead to changed persistent settings');
      assert.equal(await page.evaluate(()=>WHPwaExpectedRevision),bRevision);
      report.results.push({case:'input after automatic activation request permits real B activation but prevents reload and preserves draft with manual recovery',status:'PASS',observations:log});
    }finally{await context.close();}
  }

  {
    const context=await contextFor({width:390,height:844});
    try{
      const page=await seed(context),before=await storage(page);await prepareB(page);
      await page.evaluate(()=>sessionStorage.setItem('qa:pwa-refuse-activation','yes'));
      await page.reload({waitUntil:'load'});await assertFailure(page,'activation-refused');
      const first=await observations(page);assert.deepEqual(first.activations,[bRevision]);
      await page.evaluate(async()=>{
        const waiting=(await navigator.serviceWorker.getRegistration()).waiting;
        waiting.dispatchEvent(new Event('statechange'));waiting.dispatchEvent(new Event('statechange'));
      });
      await sleep(200);
      assert.deepEqual((await observations(page)).activations,first.activations,'Duplicate prepared-worker notifications must not retry a failed automatic attempt');
      await page.reload({waitUntil:'load'});await assertFailure(page,'once-marker-no-loop');
      const second=await observations(page);assert.deepEqual(second.activations,first.activations,'A failed automatic attempt must not activate again on reload');
      assert.equal(second.navigations,first.navigations+1,'Failure must not create a reload loop');
      const stillWaiting=await worker(page);assert.equal(stillWaiting.active,aRevision);assert.equal(stillWaiting.waiting,bRevision);
      assert.deepEqual(await storage(page),before);
      report.results.push({case:'refused activation, once marker, actionable failure without automatic retry',status:'PASS',observations:second});
      await page.evaluate(()=>{
        const original=ServiceWorker.prototype.postMessage;window.qaVersionQueryFailures=0;
        ServiceWorker.prototype.postMessage=function(message,ports){
          if(message?.type==='GET_VERSION'){window.qaVersionQueryFailures++;throw new Error('Injected synchronous worker version-query failure');}
          return original.call(this,message,ports);
        };
      });
      await page.locator('[data-pwa-update-action]').click();
      await poll(page,()=>window.qaVersionQueryFailures>0&&document.body.dataset.pwaBootstrapState==='failed');
      await assertFailure(page,'manual-retry-version-query-failed');
      const retryLog=await observations(page),retryStates=retryLog.states.slice(second.states.length);
      assert(retryStates.some(value=>value.state==='updating'),'Manual retry must begin its update attempt before the injected query fails');
      assert(retryStates.some(value=>value.state==='failed'),'A synchronous version-query failure must return manual retry to an actionable failure');
      assert.deepEqual(retryLog.activations,second.activations,'A failed version query must not request another activation');
      assert.equal(retryLog.navigations,second.navigations,'A failed manual query must not reload the document');
      assert.deepEqual(await storage(page),before);
      report.results.push({case:'manual Try again after refused activation handles synchronous GET_VERSION failure with enabled recovery instead of a stuck Updating screen',status:'PASS'});
    }finally{await context.close();}
  }

  {
    const context=await contextFor();
    try{
      const page=await seed(context),before=await storage(page);await prepareB(page);
      holdBoot=true;await page.reload({waitUntil:'commit'});
      await poll(page,()=>document.body.dataset.pwaBootstrapState==='failed',null,40000);
      await assertFailure(page,'boot-module-stalled');await workerIs(page,bRevision);
      const failed=await observations(page);assert.deepEqual(failed.activations,[bRevision]);
      assert.deepEqual(await storage(page),before,'A stalled startup must preserve all saved values');
      holdBoot=false;
      for(const pending of heldBoot.splice(0))if(!pending.response.destroyed){pending.response.writeHead(200,{'content-type':'text/javascript','cache-control':'no-store'});pending.response.end(fs.readFileSync(pending.file));}
      await ready(page);
      assert.notEqual(await page.locator('[data-pwa-updater]').getAttribute('data-state'),'startup_failed','A recovered working screen must not retain a disabled bootstrap failure state');
      assert.deepEqual((await observations(page)).activations,failed.activations,'Late resource recovery must not activate the worker again');
      assert.equal((await observations(page)).navigations,failed.navigations,'Late resource recovery must not reload the document automatically');
      assert.deepEqual(await storage(page),before);
      report.results.push({case:'stalled boot reaches bounded actionable failure and later resource recovery clears it without activation or reload',status:'PASS'});
    }finally{holdBoot=false;for(const pending of heldBoot.splice(0))pending.response.destroy();await context.close();}
  }

  {
    const context=await contextFor();
    try{
      const page=await seed(context),before=await storage(page);await prepareB(page);
      failBoot=true;await page.reload({waitUntil:'load'});await assertFailure(page,'boot-module-unavailable');await workerIs(page,bRevision);
      const log=await observations(page);assert.deepEqual(log.activations,[bRevision]);
      failBoot=false;await page.locator('[data-pwa-update-action]').click();await ready(page);
      assert.equal((await observations(page)).activations.length,1,'Retrying a failed module must not reactivate the same worker');
      assert.deepEqual(await storage(page),before);
      report.results.push({case:'external boot module outage, actionable retry and recovery',status:'PASS'});
    }finally{failBoot=false;await context.close();}
  }

  {
    const context=await contextFor();
    try{
      const page=await seed(context);await go(page,'?v2=ROSTER&book=space-marines');
      await openImportForm(page);await page.locator('.v2-roster textarea').fill(fs.readFileSync(path.join(source,'books/space-marines/v2/fixtures/newrecruit-v37.3-user-sm.txt'),'utf8'));
      await page.getByRole('button',{name:'Import roster',exact:true}).click();
      await poll(page,()=>window.ArmyBookAppV2?.roster?.state?.units.length===3);
      await page.evaluate(()=>ArmyBookAppV2.openRoster());await openImportForm(page);await page.locator('[data-roster-input="raw-text"]').fill(draft);
      await page.evaluate(()=>window.pwaDocumentSentinel='working A');
      const before=await rosterState(page),sibling=await context.newPage();await go(sibling,'?v2=ROSTER&book=space-marines');
      assert(Number.isFinite(before.totalPoints)&&before.totalPoints>0,'The initial imported roster must have resolved points');
      await openImportForm(sibling);await sibling.locator('[data-roster-input="raw-text"]').fill('Sibling unfinished draft');await sibling.evaluate(()=>window.pwaDocumentSentinel='sibling A');
      await prepareB(page);await page.evaluate(()=>WHOfflineStatus.check());
      await poll(page,()=>document.querySelector('[data-pwa-update-action]')?.textContent==='Install and restart');
      assert.deepEqual(await rosterState(page),before,'A ready update must preserve working roster, unfinished input and all localStorage');
      assert.deepEqual((await observations(page)).activations,[],'A working screen must require manual activation');
      assert.deepEqual((await observations(sibling)).activations,[]);
      await page.locator('[data-pwa-update-action]').click();
      await poll(page,expected=>window.WHPwaExpectedRevision===expected,bRevision);await ready(page);await workerIs(page,bRevision);
      await page.evaluate(()=>ArmyBookAppV2.openRoster());
      await poll(page,expected=>document.querySelector('[data-roster-input="raw-text"]')?.value===expected,draft);
      const after=await rosterState(page);assert.deepEqual(after.storage,before.storage);assert.deepEqual(after.snapshot,before.snapshot);assert.equal(after.totalPoints,before.totalPoints);assert.equal(after.draft,draft);
      assert.equal(await sibling.evaluate(()=>window.pwaDocumentSentinel),'sibling A','A sibling tab must not reload when another tab activates B');
      assert.equal(await sibling.locator('[data-roster-input="raw-text"]').inputValue(),'Sibling unfinished draft');
      await context.setOffline(true);await page.reload({waitUntil:'load'});await ready(page);
      assert.equal(await page.evaluate(()=>ArmyBookAppV2.roster.points.totalPoints),before.totalPoints,'Unchanged installed roster data must retain its resolved total offline');
      assert.deepEqual(await storage(page),before.storage);
      await page.screenshot({path:path.join(out,'working-roster-offline.png'),fullPage:true});
      report.results.push({case:'working roster remains manual; settings, snapshot, draft, sibling and offline roster preserved',status:'PASS'});
    }finally{await context.close();}
  }
  {
    const context=await contextFor();
    try{
      const installed=await seed(context),before=await storage(installed);await prepareB(installed);
      // Inject only after B has finished installation; its real prepared shell
      // and integrity metadata remain untouched by this response-only HTML fault.
      const injectedBefore=staleHtmlServed;staleHtmlResponses=1;
      const page=await context.newPage();await page.goto(entry,{waitUntil:'load'});await ready(page);await workerIs(page,bRevision);
      assert.equal(await page.evaluate(()=>WHPwaExpectedRevision),bRevision,'One stale document must recover to the real active publication');
      assert.equal(staleHtmlServed-injectedBefore,1,'Exactly the first startup HTML response must carry the unrelated stale revision');
      const log=await observations(page);assert.deepEqual(log.activations,[bRevision],'The verified current waiting publication must activate once despite a stale document revision');
      assert.equal(log.navigations,2,'Recovering a single stale HTML response must require exactly one automatic reload');
      assert.deepEqual(await storage(page),before);
      report.results.push({case:'one stale startup HTML revision differing from both A and B auto-activates verified ready B once then opens matching B',status:'PASS',injectedRevision:staleRevision,observations:log});
    }finally{staleHtmlResponses=0;await context.close();}
  }

  {
    const context=await contextFor({width:390,height:844});
    try{
      const installed=await seed(context),before=await storage(installed);await prepareB(installed);
      const injectedBefore=staleHtmlServed;staleHtmlResponses=Infinity;
      const page=await context.newPage(),started=performance.now();await page.goto(entry,{waitUntil:'load'});
      await assertFailure(page,'repeated-stale-html-no-loop',40000);const failureElapsedMs=performance.now()-started;
      assert(failureElapsedMs<40000,'Repeated stale HTML must reach actionable failure within forty real seconds');
      const log=await observations(page);assert.deepEqual(log.activations,[bRevision],'Repeated stale HTML must not repeat automatic activation');
      assert.equal(log.navigations,2,'A repeated stale document must stop after the single automatic reload');
      assert.equal(staleHtmlServed-injectedBefore,2,'Both startup HTML responses must have carried the stale revision');
      assert.equal(await page.evaluate(()=>WHPwaExpectedRevision),staleRevision);
      const state=await workerIs(page,bRevision);assert.equal(state.waiting,undefined,'Failure must be bounded even when B is active and no replacement worker is waiting');
      assert.deepEqual(await storage(page),before);
      staleHtmlResponses=0;await page.locator('[data-pwa-update-action]').click();await ready(page);await workerIs(page,bRevision);
      assert.equal(await page.evaluate(()=>WHPwaExpectedRevision),bRevision,'Manual recovery after restoring HTML must open the matching active publication');
      assert.deepEqual((await observations(page)).activations,[bRevision],'Manual stale-HTML recovery must reuse the active worker');
      assert.deepEqual(await storage(page),before);
      report.results.push({case:'persistent stale HTML after one automatic activation reaches actionable failure without a loop and recovers by manual retry',status:'PASS',injectedRevision:staleRevision,failureElapsedMs,observations:log});
    }finally{staleHtmlResponses=0;await context.close();}
  }
  report.status='PASS';console.log('PWA bootstrap browser PASS');
}catch(error){report.status='FAIL';report.error=error.stack;console.error(error.stack);process.exitCode=1;}
finally{
  if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
  fs.writeFileSync(path.join(out,'REPORT.json'),JSON.stringify(report,null,2)+'\n');console.log('Evidence '+out);
}

async function openImportForm(page){
  await page.locator('[data-roster-view]').waitFor();
  const raw=page.locator('[data-roster-input="raw-text"]');
  if(!await raw.isVisible())await page.locator('details[data-roster-import] > summary').filter({hasText:/^Import another roster$/}).click();
  await raw.waitFor();
}
