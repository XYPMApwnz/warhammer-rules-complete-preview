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
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const appPath='/books/death-guard/v2/app.html';
const payloadPath='/books/death-guard/v2/generated/app-presentation.json';
const inputs=readAppInputs(),payload=buildApp(inputs);
validatePresentation(payload,inputs.model,inputs.records);
const expected=enumerateExpectedFacts(inputs.model,inputs.records).map(f=>({...f,display:expectedDisplay(f,inputs.model,inputs.records)}));
const cards=new Map(payload.cards.map(card=>[card.id,card])),datasheetCardIds=new Set();
const collectDatasheet=id=>{if(datasheetCardIds.has(id))return;datasheetCardIds.add(id);for(const child of cards.get(id)?.children||[])collectDatasheet(child);};
for(const card of payload.cards.filter(card=>card.kind==='DATASHEET'))collectDatasheet(card.id);
const entities=new Map(inputs.model.entities.map(entity=>[entity.id,entity]));
// Normal V1 cards do not print a second name for the bound MFM record, an
// already-displayed source confirmation, or the internal erratum patch address.
// The source-evidence census above still checks every one of these fields.
const presentationOnlyDuplicate=fact=>{
  const entity=entities.get(fact.entityId),record=inputs.records.get(fact.entityId),pointer='/'+fact.path.join('/');
  if(['MFM_DETACHMENT','MFM_ENHANCEMENT_COST'].includes(record?.recordType)&&pointer==='/label')return true;
  if(entity?.kind==='ARMY_RULE_COMPONENT'&&pointer.startsWith('/qualifications/')){
    const confirmation=entity.qualifications[fact.path[1]].value;
    assert.ok(entity.data.text.includes(confirmation.sourceText),'Source confirmation no longer present in rule text');
    return true;
  }
  return entity?.kind==='SOURCE_ERRATUM'&&(/^\/(?:directive|operation)$/.test(pointer)||pointer.startsWith('/targetBindings/'));
};
const normalNonDatasheetExpected=expected.filter(fact=>!datasheetCardIds.has(fact.entityId)&&!String(fact.contextId).startsWith('unit-')&&!presentationOnlyDuplicate(fact));
const forceBindings=createEffectiveMfmCatalog().catalog.crossDomainBindings.forceDispositionBindings;
const normalDisplay=fact=>{
  const record=inputs.records.get(fact.entityId);
  if(record?.recordType==='MFM_DETACHMENT'&&fact.path[0]==='forceDispositionIds'){
    const bound=forceBindings[record.mfmForceDispositionIds[fact.path[1]]];
    assert.equal(bound.missionForceDispositionId,fact.value);return bound.sourceValue;
  }
  const entity=entities.get(fact.entityId);
  if(fact.path.length===1&&fact.path[0]==='text'&&entity?.data.tables?.length){
    const tableEchoes=entity.data.tables.map(table=>table.rows.flat().join(''));
    return fact.value.split('\n').filter(line=>!tableEchoes.includes(line.trim())).join('\n');
  }
  return fact.display;
};
const nonDatasheetRoots=payload.groups.flatMap(group=>group.itemIds).filter(id=>cards.get(id)?.kind!=='DATASHEET');
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
    // Lossless source inspection is explicit QA, not the ordinary curated
    // datasheet journey. The dedicated datasheet browser QA separately proves
    // the complete player-facing subset and absence of metadata tails.
    const observedEvidence=await page.evaluate(()=>{
      window.ArmyBookAppV2.renderAllForQA();const main=document.querySelector('main');
      return {facts:[...main.querySelectorAll('[data-fact-id]')].map(node=>({id:node.dataset.factId,value:JSON.parse(node.dataset.factValue),entityId:node.dataset.entityId,contextId:node.dataset.contextId,text:node.textContent,visible:!!node.getClientRects().length,cardId:node.closest('[data-card-id]').dataset.cardId})),cards:main.querySelectorAll(':scope > [data-card-id]').length,overflow:document.documentElement.scrollWidth>innerWidth+1};
    });
    assert.equal(observedEvidence.overflow,false,`${device} source-evidence overflow`);
    assert.equal(observedEvidence.cards,payload.cards.length,`${device} source-evidence card census`);
    const expectedIds=new Set(expected.map(fact=>fact.id)),factsSeen=new Map();
    for(const fact of observedEvidence.facts.filter(fact=>expectedIds.has(fact.id))){assert.ok(!factsSeen.has(fact.id),`${device} duplicate source evidence ${fact.id}`);factsSeen.set(fact.id,fact);}
    assert.equal(factsSeen.size,expected.length,`${device} SOURCE_EVIDENCE_MISSING`);
    for (const fact of expected) {
      const observed=factsSeen.get(fact.id);assert.ok(observed,`${device} missing ${fact.id}`);
      assert.deepEqual(observed.value,fact.value,`${device} WRONG_VALUE ${fact.id}`);
      assert.equal(observed.text,fact.display,`${device} visible WRONG_VALUE ${fact.id}`);
      assert.equal(observed.entityId,fact.entityId,`${device} WRONG_IDENTITY ${fact.id}`);
      assert.equal(observed.contextId,fact.contextId,`${device} WRONG_CONTEXT ${fact.id}`);
      assert.equal(observed.cardId,fact.entityId===inputs.model.bookId?fact.contextId:fact.entityId);
      assert.equal(observed.visible,true,`${device} hidden ${fact.id}`);
    }
    // Ordinary navigation checks each source-backed player field once in the
    // explicit V1 book shell; all internal bindings remain covered above.
    const normalExpectedIds=new Set(normalNonDatasheetExpected.map(fact=>fact.id)),normalFacts=new Map();
    for(const rootId of nonDatasheetRoots){const observed=await page.evaluate(id=>{window.ArmyBookAppV2.open(id);const main=document.querySelector('main');return {facts:[...main.querySelectorAll('[data-fact-id]')].map(node=>({id:node.dataset.factId,value:JSON.parse(node.dataset.factValue),entityId:node.dataset.entityId,contextId:node.dataset.contextId,text:node.textContent,visible:!!node.getClientRects().length,cardId:node.closest('[data-card-id]')?.dataset.cardId||''})),overflow:document.documentElement.scrollWidth>innerWidth+1};},rootId);assert.equal(observed.overflow,false,`${device} non-datasheet overflow ${rootId}`);for(const fact of observed.facts.filter(fact=>normalExpectedIds.has(fact.id))){assert.ok(!normalFacts.has(fact.id),`${device} duplicate normal non-datasheet fact ${fact.id}`);normalFacts.set(fact.id,fact);}}
    const normalMissing=normalNonDatasheetExpected.filter(fact=>!normalFacts.has(fact.id)).map(fact=>fact.id);assert.equal(normalFacts.size,normalNonDatasheetExpected.length,`${device} NORMAL_NON_DATASHEET_MISSING ${JSON.stringify(normalMissing.slice(0,30))}`);
    for(const fact of normalNonDatasheetExpected){const observed=normalFacts.get(fact.id);assert.deepEqual(observed.value,fact.value,`${device} normal WRONG_VALUE ${fact.id}`);assert.equal(observed.text,normalDisplay(fact),`${device} normal WRONG_DISPLAY ${fact.id}`);assert.equal(observed.entityId,fact.entityId);assert.equal(observed.contextId,fact.contextId);assert.equal(observed.cardId,fact.entityId===inputs.model.bookId?fact.contextId:fact.entityId);assert.equal(observed.visible,true,`${device} hidden normal fact ${fact.id}`);}
    // Deep links survive refresh, then normal canonical links and browser history.
    await page.goto(origin+appPath+'#unit-plague-marines');await page.waitForFunction(()=>!!window.ArmyBookAppV2);
    assert.equal(await page.locator('main .v2-current-card').getAttribute('data-card-id'),'unit-plague-marines');
    const boltgun=page.locator('[data-card-id="datasheet-plague-marines:weapon:2"]');
    assert.equal(await boltgun.locator('[data-fact-id$="::/strength"]').textContent(),'5');assert.equal(await boltgun.locator('[data-fact-id$="::/ap"]').textContent(),'-1');
    await page.evaluate(()=>window.ArmyBookAppV2.open('unit-defiler'));
    const selection=page.locator('[data-card-id="datasheet-defiler:profile-selection:1"]');
    assert.equal(await selection.locator('[data-fact-id$="::/text"]').count(),1);
    assert.equal(await selection.locator('[data-fact-id*="/profileIds/"]').count(),4);
    assert.doesNotMatch(await selection.innerText(),/datasheet-defiler:weapon:/i);
    for(const label of ['Heavy missile launcher – krak','Heavy missile launcher – frag','Shearing claws – strike','Shearing claws – sweep'])assert.ok((await selection.innerText()).includes(label));
    assert.equal(await page.locator('main [data-fact-id$="::/INSV"]').first().textContent(),'5+');
    assert.ok(await page.locator('main [data-fact-id$="::/text"]').allTextContents().then(texts=>texts.some(t=>t.includes('⌀'))),'Base absent');
    const profileRef=page.locator('[data-card-id="datasheet-defiler:weapon:6"] a[data-popup-identity]').first();
    const target='datasheet-defiler:weapon:6';await profileRef.click();
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
    results.push({device,status:'PASS',sourceEvidenceFacts:factsSeen.size,sourceEvidenceCards:observedEvidence.cards,normalNonDatasheetFacts:normalFacts.size,missing:0,wrongValue:0,wrongIdentity:0,wrongContext:0,navigation:'PASS',popup:'PASS'});
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
