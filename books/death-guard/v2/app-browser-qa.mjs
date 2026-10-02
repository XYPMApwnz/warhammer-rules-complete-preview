import assert from 'node:assert/strict';
import {allowRosterDependencies} from './roster-browser-dependencies.mjs';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {buildApp,readAppInputs} from './app-build.mjs';
import {enumerateExpectedFacts} from './app-fact-oracle.mjs';
import {expectedDisplay,validatePresentation,legacyClasses} from './app-qa.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const appPath='/books/death-guard/v2/app.html';
const payloadPath='/books/death-guard/v2/generated/app-presentation.json';
const inputs=readAppInputs(),payload=buildApp(inputs);
validatePresentation(payload,inputs.model,inputs.records);
const expected=enumerateExpectedFacts(inputs.model,inputs.records).map(f=>({...f,display:expectedDisplay(f,inputs.model,inputs.records)}));
const allowed=new Map([[appPath,'text/html'],[payloadPath,'application/json'],['/books/shared/army-book-app-v2/runtime.mjs','text/javascript'],['/books/shared/army-book-app-v2/glossary.mjs','text/javascript'],['/books/shared/army-book-app-v2/styles.css','text/css']]);
allowRosterDependencies(allowed);
const requests=[],legacyRequests=[];
let servedPayload=payload;
const server=http.createServer((req,res)=>{
  const address=new URL(req.url,'http://localhost').pathname;requests.push(address);
  if (legacyClasses.some(([,re])=>re.test(address))) {legacyRequests.push(address);res.writeHead(200,{'Content-Type':'application/json'});res.end('{"POISONED_LEGACY":true}');return;}
  if (!allowed.has(address)) {res.writeHead(404);res.end();return;}
  res.writeHead(200,{'Content-Type':allowed.get(address),'Cache-Control':'no-store'});
  res.end(address===payloadPath?JSON.stringify(servedPayload):fs.readFileSync(path.join(repo,address.slice(1))));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const screenshotDirectory=process.env.ARMY_APP_V2_SCREENSHOTS;
if (screenshotDirectory) fs.mkdirSync(screenshotDirectory,{recursive:true});
const results=[];
try {
  for (const [device,viewport] of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]) {
    const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('404'))errors.push(message.text());});
    await page.goto(origin+appPath);await page.waitForFunction(()=>!!window.ArmyBookAppV2);
    const factsSeen=new Map(),cardsSeen=new Set();
    // Navigate actual root entries. Their children are rendered through the normal runtime.
    for (const rootId of payload.groups.flatMap(g=>g.itemIds)) {
      const observed=await page.evaluate(id=>{
        window.ArmyBookAppV2.open(id);
        const main=document.querySelector('main');
        return {facts:[...main.querySelectorAll('[data-fact-id]')].map(node=>({id:node.dataset.factId,value:JSON.parse(node.dataset.factValue),entityId:node.dataset.entityId,contextId:node.dataset.contextId,text:node.textContent,visible:!!node.getClientRects().length,cardId:node.closest('[data-card-id]').dataset.cardId})),cards:[...main.querySelectorAll('[data-card-id]')].map(n=>n.dataset.cardId),overflow:document.documentElement.scrollWidth>innerWidth+1};
      },rootId);
      assert.equal(observed.overflow,false,`${device} page overflow ${rootId}`);
      for (const f of observed.facts) {assert.ok(!factsSeen.has(f.id),`${device} duplicate visible owner ${f.id}`);factsSeen.set(f.id,f);}
      observed.cards.forEach(id=>cardsSeen.add(id));
    }
    assert.equal(factsSeen.size,expected.length,`${device} MISSING_FROM_UI`);assert.equal(cardsSeen.size,payload.cards.filter(card=>card.domain!=='CORE').length);
    for (const fact of expected) {
      const observed=factsSeen.get(fact.id);assert.ok(observed,`${device} missing ${fact.id}`);
      assert.deepEqual(observed.value,fact.value,`${device} WRONG_VALUE ${fact.id}`);
      assert.equal(observed.text,fact.display,`${device} visible WRONG_VALUE ${fact.id}`);
      assert.equal(observed.entityId,fact.entityId,`${device} WRONG_IDENTITY ${fact.id}`);
      assert.equal(observed.contextId,fact.contextId,`${device} WRONG_CONTEXT ${fact.id}`);
      assert.equal(observed.cardId,fact.entityId===inputs.model.bookId?fact.contextId:fact.entityId);
      assert.equal(observed.visible,true,`${device} hidden ${fact.id}`);
    }
    // Deep links survive refresh, then normal canonical links and browser history.
    await page.goto(origin+appPath+'#unit-plague-marines');await page.waitForFunction(()=>!!window.ArmyBookAppV2);
    assert.equal(await page.locator('main .v2-current-card').getAttribute('data-card-id'),'unit-plague-marines');
    const boltgun=page.locator('[data-card-id="datasheet-plague-marines:weapon:2"]');
    assert.equal(await boltgun.locator('[data-fact-id$="::/strength"]').textContent(),'5');assert.equal(await boltgun.locator('[data-fact-id$="::/ap"]').textContent(),'-1');
    await page.evaluate(()=>window.ArmyBookAppV2.open('unit-defiler'));
    const selection=page.locator('[data-card-id="datasheet-defiler:profile-selection:1"]');
    assert.equal(await selection.locator('[data-fact-id*="/profileIds/"]').count(),4);
    assert.equal(await page.locator('main [data-fact-id$="::/INSV"]').first().textContent(),'5+');
    assert.ok(await page.locator('main [data-fact-id$="::/text"]').allTextContents().then(texts=>texts.some(t=>t.includes('⌀'))),'Base absent');
    const profileRef=selection.locator('a.v2-reference').first();
    const target=await profileRef.getAttribute('data-target-id');await profileRef.click();
    await page.waitForSelector('dialog[open]');
    assert.equal(await page.locator('dialog article').first().getAttribute('data-card-id'),target);
    await page.keyboard.press('Escape');await page.waitForSelector('dialog[open]',{state:'hidden'});
    await page.goBack();await page.waitForFunction(()=>document.querySelector('main > article')?.dataset.cardId==='unit-plague-marines');
    await page.goForward();await page.waitForFunction(()=>document.querySelector('main > article')?.dataset.cardId==='unit-defiler');
    if (device==='phone') {
      await page.getByRole('button',{name:'Open navigation'}).click();assert.equal(await page.locator('main').evaluate(n=>n.inert),true);
      await page.getByRole('searchbox').fill('Nomadic');assert.equal(await page.locator('.v2-search-result').count(),0);
      await page.getByRole('searchbox').fill('Plague Marines');assert.ok(await page.locator('.v2-search-result').count()>0);
      await page.locator('.v2-search-result').first().click();assert.equal(await page.locator('main').evaluate(n=>n.inert),false);
      await page.getByRole('button',{name:'Open navigation'}).click();await page.keyboard.press('Escape');assert.equal(await page.locator('main').evaluate(n=>n.inert),false);
    } else {
      await page.getByRole('button',{name:'Collapse navigation'}).click();assert.ok(await page.locator('body').evaluate(n=>n.classList.contains('nav-collapsed')));
      await page.getByRole('button',{name:'Expand navigation'}).click();
      await page.getByRole('searchbox').fill('Stinking Mire');assert.ok(await page.locator('.v2-search-result').count()>0);await page.getByRole('searchbox').fill('');
    }
    await page.evaluate(()=>window.ArmyBookAppV2.open('unit-plague-marines'));
    if (device==='phone') await page.waitForFunction(()=>document.querySelector('#tocPanel').getBoundingClientRect().right<=1);
    if (screenshotDirectory) await page.screenshot({path:path.join(screenshotDirectory,`${device}-plague-marines.png`),animations:'disabled'});
    await page.evaluate(()=>window.ArmyBookAppV2.open('detachment-virulent-vectorium:stratagem:2'));
    const labels=await page.locator('main [data-fact-id$="/label"]').allTextContents();
    for (const label of ['WHEN','TARGET','EFFECT']) assert.ok(labels.includes(label),`${device} Stratagem ${label}`);
    if (screenshotDirectory) await page.screenshot({path:path.join(screenshotDirectory,`${device}-stratagem.png`),animations:'disabled'});
    assert.deepEqual(errors,[],`${device} browser errors`);
    results.push({device,status:'PASS',visibleFacts:factsSeen.size,visibleCards:cardsSeen.size,missing:0,wrongValue:0,wrongIdentity:0,wrongContext:0,navigation:'PASS',popup:'PASS'});
    await context.close();
  }
  // A changed V2 source value reaches the actual Reader. No legacy factual files are served.
  const poisoned=structuredClone(inputs.model);poisoned.entities.find(e=>e.id==='datasheet-plague-marines:weapon:2').data.strength='77';
  servedPayload=buildApp({model:poisoned,records:inputs.records});
  const page=await browser.newPage();await page.goto(origin+appPath+'#unit-plague-marines');await page.waitForFunction(()=>!!window.ArmyBookAppV2);
  assert.equal(await page.locator('[data-fact-id="datasheet-plague-marines:weapon:2::/strength"]').textContent(),'77');await page.close();
  assert.deepEqual(legacyRequests,[],'V1/Glossary browser factual read');
  assert.ok(requests.every(request=>allowed.has(request)||request==='/favicon.ico'),'Unexpected runtime dependency');
  console.log(JSON.stringify({status:'PASS',results,v1FactualReads:0,legacyGlossaryFactualReads:0,legacyPoison:'PASS',v2FactPoison:'VISIBLE_77',sharedRuntime:'PASS',requestedPaths:[...new Set(requests)]},null,2));
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
