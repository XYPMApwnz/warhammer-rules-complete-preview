/** One-off historical F1 A -> B acceptance; intentionally not a mandatory suite.
 * Permanent update coverage is tests/browser/pwa-update-flow.mjs (test:pwa-update).
 * Build separate baseline/feature packages with tools/pages-runtime-package.mjs,
 * set F1_PWA_BASELINE_PACKAGE, F1_PWA_FEATURE_PACKAGE and F1_PWA_OUT to their
 * external paths, then run: node v2/detachment-recipient-pwa-qa.mjs.
 * Browser selection uses WH_PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH via the existing
 * browser-launch helper. Only normal import/attachment/update controls change
 * application state; packages are never generated into the repository. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {readCacheRevision} from '../tools/cache-revision.mjs';

const A=process.env.F1_PWA_BASELINE_PACKAGE,B=process.env.F1_PWA_FEATURE_PACKAGE,out=process.env.F1_PWA_OUT;
assert.ok(A&&B&&out,'Set F1_PWA_BASELINE_PACKAGE, F1_PWA_FEATURE_PACKAGE and F1_PWA_OUT');
fs.mkdirSync(out,{recursive:true});
const aRevision=readCacheRevision({root:A}),bRevision=readCacheRevision({root:B});
assert.notEqual(aRevision,bRevision,'The feature must be a distinct publication');
const prefix='/warhammer-rules-complete-preview/',results=[],errors=[],requestFailures=[],diagnostics=[];let stage='setup';
let generation='A';
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json'};
const server=http.createServer((request,response)=>{
  try{
    const address=new URL(request.url,'http://localhost').pathname;
    assert.ok(address.startsWith(prefix));
    const root=path.resolve(generation==='A'?A:B);
    let file=path.resolve(root,address.slice(prefix.length));
    assert.ok(file===root||file.startsWith(root+path.sep));
    if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    response.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});
    response.end(fs.readFileSync(file));
  }catch{response.writeHead(404);response.end('Missing runtime resource');}
});
const rosterText=`+ FACTION KEYWORD: Imperium - Adeptus Mechanicus
+ DETACHMENT: Lords of the Forge
Char1: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe
10x Skitarii Rangers (85 pts): 10x Galvanic rifle, 10x Close combat weapon`;
const ready=page=>page.waitForFunction(()=>window.WarhammerAppV2&&window.ArmyBookAppV2?.roster);
const state=page=>page.evaluate(()=>({snapshot:ArmyBookAppV2.roster.snapshot(),
  storage:Object.fromEntries(Object.entries(localStorage).sort())}));
async function worker(page){return page.evaluate(async()=>{
  const registration=await navigator.serviceWorker.getRegistration();
  const revision=worker=>worker?new Promise(resolve=>{
    const channel=new MessageChannel(),timer=setTimeout(()=>resolve(null),3000);
    channel.port1.onmessage=event=>{clearTimeout(timer);resolve(event.data?.revision);};
    worker.postMessage({type:'GET_VERSION'},[channel.port2]);
  }):null;
  return {active:await revision(registration?.active),waiting:await revision(registration?.waiting),
    controller:await revision(navigator.serviceWorker.controller)};
});}
async function guide(page){
  await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();
  await page.getByRole('button',{name:'Open personal guide',exact:true}).click();
  await page.locator('main a[data-target-id="roster-unit/parsed-unit-2"]').click();
  await page.locator('main .unit-card[data-roster-instance-id="parsed-unit-1"]').waitFor();
}
const forgeRows=page=>page.locator('main .ds-conditional-policy').evaluateAll(nodes=>nodes.flatMap(node=>{
  const source=JSON.parse(node.dataset.policySource||'{}');
  return source.ruleId==='detachment-lords-of-the-forge:rule'&&source.clauseId==='baffling-data-screed'?
    [{instance:node.closest('.unit-card')?.dataset.rosterInstanceId,subject:node.dataset.recipientSubject,
      recipients:JSON.parse(node.dataset.recipientInstanceIds),text:node.innerText}]:[];
}));
async function assertFeature(page){
  const rows=await forgeRows(page);assert.equal(rows.length,1);
  assert.equal(rows[0].instance,'parsed-unit-1');assert.equal(rows[0].subject,'MODEL');
  assert.deepEqual(rows[0].recipients,['parsed-unit-1']);assert.match(rows[0].text,/Baffling Data Screed/);
  assert.doesNotMatch(rows[0].text,/Not automatically calculated|Selection not recorded|Conditional rule|model count unresolved/);
  assert.equal(await page.locator('main .unit-card[data-roster-instance-id="parsed-unit-2"] .ds-conditional-policy[data-recipient-subject="MODEL"]').count(),0);
}

// A full shell navigation can require the ordinary book-selection control.
// Reopening that book is user navigation, never application-state injection.
async function reopened(page){
 await page.waitForFunction(()=>window.WarhammerAppV2,{timeout:30000});
 if(!await page.evaluate(()=>Boolean(window.ArmyBookAppV2?.roster))){const choice=page.locator('[data-v2-book="adeptus-mechanicus"]');if(await choice.isVisible())await choice.click();}
 await ready(page);await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.roster?.state?.units?.length));
}
async function diagnostic(page,width,error){
 const screenshot=path.join(out,`${width}-${stage}-failure.png`);await page.screenshot({path:screenshot,fullPage:true}).catch(()=>{});
 const details=await page.evaluate(async()=>({url:location.href,title:document.title,body:document.body.innerText,
  shellReady:Boolean(window.WarhammerAppV2),bookReady:Boolean(window.ArmyBookAppV2?.roster),expectedRevision:window.WHPwaExpectedRevision||null,
  bookButtonPresent:Boolean(document.querySelector('[data-v2-book="adeptus-mechanicus"]')),
  cacheInventory:await Promise.all((await caches.keys()).map(async name=>{const cache=await caches.open(name),keys=await cache.keys();return {name,count:keys.length,app:keys.filter(request=>/v2\/app|adeptus-mechanicus|shared\/(?:army-book|application|roster)/.test(request.url)).map(request=>request.url)};}))})).catch(failure=>({diagnosticFailure:failure.message}));
 const record={stage,width,error:error.stack,screenshot,...details,worker:await worker(page).catch(failure=>({error:failure.message})),requestFailures:requestFailures.filter(row=>row.stage===stage),errors:errors.filter(row=>row.stage===stage)};
 diagnostics.push(record);fs.writeFileSync(path.join(out,`${width}-${stage}-diagnostic.json`),JSON.stringify(record,null,2)+'\n');return record;
}
const sameOfflineFailure=(a,b)=>Boolean(a&&b&&a.shellReady===b.shellReady&&a.bookReady===b.bookReady&&
 String(a.body).replace(/[a-f0-9]{16}/g,'REVISION')===String(b.body).replace(/[a-f0-9]{16}/g,'REVISION'));

let browser,status='NOT_RUN';
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const entry=`http://127.0.0.1:${server.address().port}${prefix}v2/app.html`;
try{
  browser=await launchChromium();
  for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
    generation='A';
    const context=await browser.newContext({viewport,serviceWorkers:'allow'}),page=await context.newPage();
    page.setDefaultTimeout(60000);page.on('pageerror',error=>errors.push({stage,width:viewport.width,error:error.message}));
    page.on('requestfailed',request=>requestFailures.push({stage,width:viewport.width,url:request.url(),error:request.failure()?.errorText}));
    try{
      stage='baseline-online';await page.goto(entry);await page.locator('[data-v2-book="adeptus-mechanicus"]').click();await ready(page);
      await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
      assert.equal((await worker(page)).active,aRevision);
      await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();
      await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(rosterText);
      await page.locator('[data-roster-action="review-import"]').click();
      await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
      assert.match(await page.locator('.v2-roster-status').innerText(),/^Roster imported\./);
      await page.locator('[data-attachment-candidate-for="parsed-unit-2"]').selectOption('parsed-unit-1');
      await page.locator('[data-attachment-target-instance-id="parsed-unit-2"] [data-roster-action="attach"]').click();
      await page.locator('[data-attached-leader-instance-id="parsed-unit-1"]').waitFor();
      const before=await state(page);assert.equal(before.snapshot.attachments.length,1);
      await guide(page);assert.deepEqual(await forgeRows(page),[],'Baseline has no F1 MODEL row');

      let baselineOffline=null;
      stage='baseline-offline';await context.setOffline(true);
      try{await page.reload();await reopened(page);assert.deepEqual(await state(page),before);await guide(page);assert.deepEqual(await forgeRows(page),[]);
       baselineOffline={status:'PASS',worker:await worker(page)};await page.screenshot({path:path.join(out,`${viewport.width}-baseline-offline-guide.png`),fullPage:true});
      }catch(error){baselineOffline={status:'FAIL',diagnostic:await diagnostic(page,viewport.width,error)};}
      results.push({viewport,phase:'baseline-offline',...baselineOffline});
      stage='baseline-online-restored';await context.setOffline(false);await page.goto(entry);await reopened(page);assert.deepEqual(await state(page),before,'Offline baseline probe must preserve existing stored physical roster');await guide(page);

      // The idle updater panel is intentionally hidden. Its public check API
      // discovers an update; activation still requires the visible consent UI.
      stage='manual-update';generation='B';await page.evaluate(()=>WHOfflineStatus.check());
      await page.locator('[data-pwa-updater][data-state="ready"]').waitFor();
      const waiting=await worker(page);assert.equal(waiting.active,aRevision);assert.equal(waiting.waiting,bRevision);
      assert.deepEqual(await state(page),before,'Waiting publication preserves the roster and stored state');
      await page.getByRole('button',{name:'Install and restart',exact:true}).click();
      await page.waitForFunction(revision=>window.WHPwaExpectedRevision===revision,bRevision);await ready(page);
      await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.roster?.state?.units?.length));
      assert.equal((await worker(page)).controller,bRevision);
      assert.deepEqual(await state(page),before,'Confirmed update preserves physical roster, attachments and localStorage');
      await guide(page);await assertFeature(page);
      const onlineShot=path.join(out,`${viewport.width}-updated-guide.png`);await page.screenshot({path:onlineShot,fullPage:true});
      results.push({viewport,phase:'manual-update',status:'PASS',manualConsent:true,rosterAndAttachmentsPreserved:true,updatedText:true,screenshots:[onlineShot]});
      stage='feature-offline';await context.setOffline(true);
      try{await page.reload();await reopened(page);
      await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.roster?.state?.units?.length));
      assert.deepEqual(await state(page),before,'Offline reload preserves current V2 state');
      await guide(page);await assertFeature(page);
      const offlineShot=path.join(out,`${viewport.width}-updated-offline-guide.png`);await page.screenshot({path:offlineShot,fullPage:true});
      results.push({viewport,phase:'feature-offline',status:'PASS',offline:true,screenshots:[offlineShot]});
      }catch(error){const failure=await diagnostic(page,viewport.width,error);if(baselineOffline.status==='FAIL'&&sameOfflineFailure(baselineOffline.diagnostic,failure))results.push({viewport,phase:'feature-offline',status:'PRE_EXISTING_BASELINE_FAILURE',diagnostic:failure,limitation:'Offline reopening fails identically on baseline A; online explicit update and roster preservation are separately PASS.'});else throw error;}
    }catch(error){await diagnostic(page,viewport.width,error);throw error;}finally{await context.close();}
  }
  assert.deepEqual(errors.filter(row=>!['baseline-offline','feature-offline'].includes(row.stage)),[]);status=results.some(row=>row.status==='PRE_EXISTING_BASELINE_FAILURE')?'PARTIAL_PRE_EXISTING_OFFLINE_FAILURE':'PASS';if(status!=='PASS')process.exitCode=2;console.log(JSON.stringify({status,aRevision,bRevision,results}));
}catch(error){status='FAIL';console.error(error.stack);process.exitCode=1;}
finally{
  fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status,aRevision,bRevision,results,errors,requestFailures,diagnostics,realNewRecruitExportTested:false},null,2)+'\n');
  if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
}
