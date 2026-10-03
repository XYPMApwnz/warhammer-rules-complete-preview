import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {buildApp} from './app-build.mjs';
import {allowRosterDependencies} from './roster-browser-dependencies.mjs';

// Browser proof for the V1 Related Rules and popup presentation port. The
// application still receives every rule, relation and effective value from its
// V2 payload/services; V1 files are deliberately unavailable to the browser.
const {chromium}=createRequire(import.meta.url)('playwright');
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const appPath='/books/death-guard/v2/app.html';
const payloadPath='/books/death-guard/v2/generated/app-presentation.json';
const payload=buildApp();
const rows=payload.relatedRules.rows;
const cards=new Map(payload.cards.map(card=>[card.id,card]));
const detachments=payload.cards.filter(card=>card.kind==='DETACHMENT').map(card=>card.id);
const unitId='unit-lord-of-contagion';
const furnaceId='detachment-virulent-vectorium:enhancement:2';
const stratagemId='detachment-virulent-vectorium:stratagem:2';
const deepStrikeId='core-deep-strike';
const longRuleId='core-rule-04-03-resolve-attacks';
const lordWeaponId='datasheet-lord-of-contagion:weapon:1';
assert.equal(cards.get(furnaceId)?.title,'Furnace of Plagues');
assert.equal(cards.get(deepStrikeId)?.title,'DEEP STRIKE');
assert.equal(cards.get(lordWeaponId)?.title,'Manreaper – strike');

const allowed=new Map([
  [appPath,'text/html'],[payloadPath,'application/json'],
  ['/books/shared/army-book-app-v2/runtime.mjs','text/javascript'],
  ['/books/shared/army-book-app-v2/glossary.mjs','text/javascript'],
  ['/books/shared/army-book-app-v2/styles.css','text/css']
]);
allowRosterDependencies(allowed);
const requests=[],unexpected=[];
const server=http.createServer((request,response)=>{
  const address=new URL(request.url,'http://localhost').pathname;requests.push(address);
  if(!allowed.has(address)){
    if(address!=='/favicon.ico')unexpected.push(address);
    response.writeHead(address==='/favicon.ico'?404:200,{'Content-Type':'application/json','Cache-Control':'no-store'});
    response.end('{"POISONED_V1_RUNTIME":true}');return;
  }
  response.writeHead(200,{'Content-Type':allowed.get(address),'Cache-Control':'no-store'});
  response.end(address===payloadPath?JSON.stringify(payload):fs.readFileSync(path.join(repo,address.slice(1))));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});

const mega=`+ FACTION KEYWORD: Chaos - Death Guard
+ DETACHMENT: Paragons of Putrescence, Virulent Vectorium (Hypervirulent Strains)
+ TOTAL ARMY POINTS: 285pts
+ ENHANCEMENT: Furnace of Plagues (on Char1: Lord of Contagion)
Char1: 1x Lord of Contagion (135 pts): Manreaper
Enhancement: Furnace of Plagues (+25 pts)
3x Deathshroud Terminators (150 pts)
• 1x Deathshroud Terminator Champion: Manreaper, Plaguespurt gauntlet
• 2x Deathshroud Terminator: 2 with Manreaper, Plaguespurt gauntlet`;

const expectedRows=(detachmentId,kind)=>rows.filter(row=>row.unitId===unitId&&row.kind===kind&&(!detachmentId||row.detachmentId===detachmentId))
  .filter(row=>['MATCH','CONDITIONAL'].includes((detachmentId?row.selectedDetachment:row).applicability))
  .map(row=>row.ruleId).sort();
const ready=async page=>{await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.rosterPanel));await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);};
const focused=locator=>locator.evaluate(node=>new Promise(resolve=>{
  const started=performance.now();
  const check=()=>{if(document.activeElement===node)resolve(true);else if(performance.now()-started>1000)resolve(false);else requestAnimationFrame(check);};check();
}));
const visibleRows=dialog=>dialog.locator('.v2-compatible-item').evaluateAll(nodes=>nodes.filter(node=>node.getClientRects().length).map(node=>({
  ruleId:node.dataset.ruleId,detachmentId:node.dataset.detachmentId,applicability:node.dataset.applicability,
  targetId:node.querySelector('a[data-target-id]')?.dataset.targetId,cardId:node.closest('[data-card-id]')?.dataset.cardId||node.querySelector('[data-card-id]')?.dataset.cardId||''
})));
const tracks=locator=>locator.evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(' ').filter(Boolean).length);
const clickBackdrop=locator=>locator.evaluate(node=>node.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,clientX:1,clientY:1})));
const results=[];
let step='startup';

async function waitRelatedClosed(page){await page.waitForSelector('dialog.v2-related-dialog[open]',{state:'hidden'});}
async function waitPopupClosed(page){await page.waitForSelector('dialog.v2-detail-dialog[open]',{state:'hidden'});}
async function openRelated(trigger,page){await trigger.click();await page.waitForSelector('dialog.v2-related-dialog.related-rules-layer[open]');return page.locator('dialog.v2-related-dialog[open]');}
async function openPopup(source,page,id){await source.click();await page.waitForSelector(`dialog.v2-detail-dialog.term-popup.v2-book-detail[open] [data-card-id="${id}"]`);return page.locator('dialog.v2-detail-dialog[open]');}

async function relatedCloseContract(page,trigger){
  step='related/close-button';let dialog=await openRelated(trigger,page);
  assert.equal(await dialog.locator('.related-rules-dialog').count(),1);assert.equal(await dialog.locator('.related-rules-close').count(),1);
  await dialog.locator('.related-rules-close').click();await waitRelatedClosed(page);assert.equal(await focused(trigger),true,'Related close button did not restore its trigger');
  step='related/escape';dialog=await openRelated(trigger,page);await page.keyboard.press('Escape');await waitRelatedClosed(page);assert.equal(await focused(trigger),true,'Related Escape did not restore its trigger');
  step='related/backdrop';dialog=await openRelated(trigger,page);await clickBackdrop(dialog);await waitRelatedClosed(page);assert.equal(await focused(trigger),true,'Related backdrop did not restore its trigger');
}

async function popupCloseContract(page,source,id){
  step='popup/close-button';let dialog=await openPopup(source,page,id);
  await dialog.locator('.popup-close').click();await waitPopupClosed(page);assert.equal(await focused(source),true,'Popup close button did not restore its exact source');
  step='popup/escape';dialog=await openPopup(source,page,id);await page.keyboard.press('Escape');await waitPopupClosed(page);assert.equal(await focused(source),true,'Popup Escape did not restore its exact source');
  step='popup/backdrop';dialog=await openPopup(source,page,id);await clickBackdrop(dialog);await waitPopupClosed(page);assert.equal(await focused(source),true,'Popup backdrop did not restore its exact source');
}

try{
  for(const[device,viewport]of[['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
    const phone=device==='phone';step=device+'/boot';
    const context=await browser.newContext({viewport,serviceWorkers:'block',...(phone?{isMobile:true,hasTouch:true}:{})});
    const page=await context.newPage();page.setDefaultTimeout(15000);const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error'&&!/favicon|404/i.test(message.text()))errors.push(message.text());});
    await page.goto(origin+appPath);await ready(page);
    await page.evaluate(id=>window.ArmyBookAppV2.open(id),unitId);
    await page.waitForSelector(`main [data-card-id="${unitId}"]`);
    const unit=page.locator(`main [data-card-id="${unitId}"]`).first();
    const trigger=unit.locator('.ds-related-rules-button');assert.equal(await trigger.count(),1,device+' missing Related Rules trigger');
    await relatedCloseContract(page,trigger);

    step=device+'/full-book-related';
    const related=await openRelated(trigger,page),panel=related.locator(':scope > .related-rules-dialog'),body=panel.locator('.related-rules-body');
    const presentation=await panel.evaluate(node=>{const style=getComputedStyle(node),layer=getComputedStyle(node.parentElement),heading=getComputedStyle(node.querySelector('header h2')),body=node.querySelector('.related-rules-body'),bodyStyle=getComputedStyle(body),rect=node.getBoundingClientRect();return{
      layerPosition:layer.position,layerInset:[layer.top,layer.right,layer.bottom,layer.left],layerDisplay:layer.display,
      borderTopWidth:style.borderTopWidth,borderRadius:style.borderRadius,display:style.display,rows:style.gridTemplateRows,width:rect.width,height:rect.height,
      headingFamily:heading.fontFamily,bodyOverflow:bodyStyle.overflowY,bodyOverscroll:bodyStyle.overscrollBehaviorY
    };});
    assert.equal(presentation.layerPosition,'fixed');assert.deepEqual(presentation.layerInset,['0px','0px','0px','0px']);assert.equal(presentation.layerDisplay,'grid');
    assert.equal(presentation.borderTopWidth,'4px');assert.equal(presentation.borderRadius,'0px');assert.equal(presentation.display,'grid');assert.match(presentation.headingFamily,/Georgia|serif/i);
    assert.equal(presentation.bodyOverflow,'auto');assert.equal(presentation.bodyOverscroll,'contain');
    assert.ok(Math.abs(presentation.width-(phone?374:1180))<3,device+' actual V1 Related width');
    assert.ok(Math.abs(presentation.height-(phone?772:900))<3,device+' actual V1 Related height');
    const tabs=related.locator('.full-related-tabs button');assert.equal(await tabs.count(),2);assert.deepEqual((await tabs.evaluateAll(nodes=>nodes.map(node=>node.dataset.kind))).sort(),['enhancements','stratagems']);
    const stratTab=related.locator('.full-related-tabs [data-kind="stratagems"]');
    const enhancementTab=related.locator('.full-related-tabs [data-kind="enhancements"]');
    assert.equal(await stratTab.getAttribute('aria-pressed'),'true');assert.equal(await enhancementTab.getAttribute('aria-pressed'),'false');assert.equal(await enhancementTab.isVisible(),true);
    const filter=related.locator('details.full-related-filter');assert.equal(await filter.count(),1,'Full-book Related must keep the Detachment filter');
    const choices=filter.locator('[data-detachment]');assert.deepEqual((await choices.evaluateAll(nodes=>nodes.map(node=>node.dataset.detachment))).sort(),['',...detachments].sort());

    const assertTab=async(kind,detachmentId)=>{
      const tab=related.locator(`.full-related-tabs [data-kind="${kind.toLowerCase()}s"]`);await tab.click();assert.equal(await tab.getAttribute('aria-pressed'),'true');
      const actual=await visibleRows(related);assert.deepEqual(actual.map(row=>row.ruleId).sort(),expectedRows(detachmentId,kind),`${device} ${kind} ${detachmentId||'all'} canonical rows`);
      assert.ok(actual.every(row=>row.targetId===row.ruleId&&row.cardId===row.ruleId),`${device} ${kind} rendered a summary/index identity instead of the canonical card`);
      assert.ok(actual.every(row=>['MATCH','CONDITIONAL'].includes(row.applicability)),`${device} ${kind} exposed NO_MATCH`);
      if(detachmentId)assert.ok(actual.every(row=>row.detachmentId===detachmentId),`${device} ${kind} leaked an unselected Detachment`);
    };
    await assertTab('STRATAGEM','');
    const stratGrid=related.locator('.related-detachment:not([hidden]) [data-related-kind="stratagems"]:not([hidden])').first();
    assert.equal(await tracks(stratGrid),phone?1:2,device+' actual V1 Stratagem columns');
    await assertTab('ENHANCEMENT','');
    const enhancementGrid=related.locator('.related-detachment:not([hidden]) [data-related-kind="enhancements"]:not([hidden])').first();
    assert.equal(await tracks(enhancementGrid),phone?1:2,device+' actual V1 Enhancement columns');
    for(const detachmentId of detachments){
      await filter.locator(`[data-detachment="${detachmentId}"]`).evaluate(node=>node.click());
      await assertTab('STRATAGEM',detachmentId);await assertTab('ENHANCEMENT',detachmentId);
    }
    await filter.locator('[data-detachment=""]').evaluate(node=>node.click());await assertTab('STRATAGEM','');
    assert.equal(await related.locator('[data-applicability="NO_MATCH"], [data-match-state="no-match"]').count(),0,device+' Related DOM retained NO_MATCH cards');
    assert.doesNotMatch(await related.innerText(),/NO_MATCH/i);

    step=device+'/related-long-scroll';
    const pageY=await page.evaluate(()=>scrollY),scroll=await body.evaluate(node=>{const before=node.scrollTop;node.scrollTop=node.scrollHeight;return{before,after:node.scrollTop,scrollHeight:node.scrollHeight,clientHeight:node.clientHeight};});
    assert.ok(scroll.scrollHeight>scroll.clientHeight&&scroll.after>scroll.before,device+' Related body did not own long scrolling');assert.equal(await page.evaluate(()=>scrollY),pageY,device+' Related scrolling moved the book');

    // Canonical Enhancement and Stratagem popups originate in Related Rules,
    // keep it open underneath, and return focus to the exact rule link.
    await filter.locator('[data-detachment="detachment-virulent-vectorium"]').evaluate(node=>node.click());
    for(const[kind,id,cardClass]of[['enhancements',furnaceId,'enhancement'],['stratagems',stratagemId,'stratagem']]){
      await related.locator(`.full-related-tabs [data-kind="${kind}"]`).click();const source=related.locator(`a[data-target-id="${id}"]`);assert.equal(await source.count(),1);
      const popup=await openPopup(source,page,id);assert.equal(await related.getAttribute('open'),'');assert.equal(await popup.locator(`[data-card-id="${id}"].${cardClass}`).count(),1);
      assert.equal(decodeURIComponent((await page.evaluate(()=>location.hash)).slice(1)),id);
      await popup.locator('.popup-close').click();await waitPopupClosed(page);assert.equal(await related.getAttribute('open'),'');assert.equal(await focused(source),true,`${device} ${id} did not restore exact Related link focus`);
    }
    await related.locator('.related-rules-close').click();await waitRelatedClosed(page);

    step=device+'/canonical-popup';
    const deepSource=unit.locator(`a[data-target-id="${deepStrikeId}"]`).first();assert.equal(await deepSource.count(),1);
    let popup=await openPopup(deepSource,page,deepStrikeId);
    const popupPresentation=await popup.evaluate(node=>{const style=getComputedStyle(node),card=node.querySelector('[data-card-id]'),title=getComputedStyle(card.querySelector('h2,h3')),close=node.querySelector('.popup-close'),closeStyle=getComputedStyle(close),fields=getComputedStyle(card.querySelector('.v2-fields')),field=getComputedStyle(card.querySelector('.v2-field')),rect=node.getBoundingClientRect();return{width:rect.width,height:rect.height,borderTopWidth:style.borderTopWidth,borderRadius:style.borderRadius,overflowY:style.overflowY,titleFamily:title.fontFamily,titleSize:title.fontSize,closeWidth:closeStyle.width,closeHeight:closeStyle.height,termDetail:card.classList.contains('v1-term-detail'),fieldsDisplay:fields.display,fieldDisplay:field.display};});
    assert.ok(Math.abs(popupPresentation.width-(phone?362:560))<3,device+' actual V1 term-popup width');assert.equal(popupPresentation.borderTopWidth,'4px');assert.equal(popupPresentation.borderRadius,'0px');assert.match(popupPresentation.titleFamily,/Georgia|serif/i);assert.equal(popupPresentation.closeWidth,'36px');assert.equal(popupPresentation.closeHeight,'36px');assert.equal(popupPresentation.termDetail,true);assert.equal(popupPresentation.fieldsDisplay,'block');assert.equal(popupPresentation.fieldDisplay,'block');
    const deepIdentity=await deepSource.getAttribute('data-popup-identity');
    await popup.locator('.popup-close').click();await waitPopupClosed(page);assert.equal(await focused(deepSource),true,JSON.stringify(await page.evaluate(({id,identity})=>({active:document.activeElement?.outerHTML?.slice(0,180),targetCount:document.querySelectorAll(`main [data-target-id="${CSS.escape(id)}"]`).length,identityCount:[...document.querySelectorAll('main [data-popup-identity]')].filter(node=>node.dataset.popupIdentity===identity).length,hash:location.hash}),{id:deepStrikeId,identity:deepIdentity})));
    await popupCloseContract(page,deepSource,deepStrikeId);

    // The continuous full book contains the same Core link in many units.
    // Return to this exact datasheet's trigger after its DOM is recreated.
    step=device+'/full-book-popup-focus';
    await page.evaluate(()=>window.ArmyBookAppV2.openLibrary());
    const bookSource=page.locator(`main [data-card-id="${unitId}"] a[data-target-id="${deepStrikeId}"]`).first();
    popup=await openPopup(bookSource,page,deepStrikeId);
    await popup.locator('.popup-close').click();await waitPopupClosed(page);
    assert.equal(await focused(bookSource),true,'Full-book popup focused another datasheet sharing the same Core rule');
    await page.evaluate(id=>window.ArmyBookAppV2.open(id),unitId);

    step=device+'/popup-long-scroll';
    await page.evaluate(id=>window.ArmyBookAppV2.showDetail(id),longRuleId);await page.waitForSelector(`dialog.v2-detail-dialog.term-popup[open] [data-card-id="${longRuleId}"]`);
    popup=page.locator('dialog.v2-detail-dialog[open]');const popupBody=popup.locator('.v2-dialog-content');const beforeY=await page.evaluate(()=>scrollY);
    const popupScroll=await popupBody.evaluate(node=>{node.scrollTop=node.scrollHeight;return{top:node.scrollTop,scrollHeight:node.scrollHeight,clientHeight:node.clientHeight,overflow:getComputedStyle(node).overflowY};});
    assert.ok(popupScroll.scrollHeight>popupScroll.clientHeight&&popupScroll.top>0,device+' long popup did not use its internal scroll area');assert.equal(popupScroll.overflow,'auto');assert.equal(await page.evaluate(()=>scrollY),beforeY,device+' popup scroll moved the book');
    await page.keyboard.press('Escape');await waitPopupClosed(page);

    step=device+'/roster-related';
    assert.equal(await page.evaluate(text=>window.ArmyBookAppV2.roster.import(text).status,mega),'READY');
    await page.evaluate(()=>{const app=window.ArmyBookAppV2;app.rosterPanel.refresh();app.openPersonalGuide();app.openInstance('parsed-unit-1');});
    await page.waitForFunction(()=>document.querySelector('main > .unit-card')?.dataset.rosterInstanceId==='parsed-unit-1');
    const rosterUnit=page.locator('main > .unit-card[data-roster-instance-id="parsed-unit-1"]'),rosterTrigger=rosterUnit.locator('.ds-related-rules-button');
    const rosterRelated=await openRelated(rosterTrigger,page);assert.equal(await rosterRelated.locator('.full-related-filter').count(),0,'Roster Related must hide the manual Detachment filter');
    const imported=await page.evaluate(()=>window.ArmyBookAppV2.roster.state.detachmentIds.slice().sort());
    assert.deepEqual(imported,['detachment-paragons-of-putrescence','detachment-virulent-vectorium']);
    assert.deepEqual((await rosterRelated.locator('.related-detachment[data-detachment-id]').evaluateAll(nodes=>[...new Set(nodes.map(node=>node.dataset.detachmentId))].sort())),imported,'Roster Related omitted an imported Detachment');
    const rosterExpected=await page.evaluate(instanceId=>{const app=window.ArmyBookAppV2,unit=app.roster.state.units.find(row=>row.instanceId===instanceId),answer=app.roster.related(instanceId,null),rows=Array.isArray(answer)?answer:answer.rows||[];return Object.fromEntries(['STRATAGEM','ENHANCEMENT'].map(kind=>[kind,rows.filter(row=>row.kind===kind&&['MATCH','CONDITIONAL'].includes(row.applicability)&&(kind!=='ENHANCEMENT'||unit.enhancementIds.includes(row.ruleId))).map(row=>row.ruleId).sort()]));},'parsed-unit-1');
    for(const kind of ['STRATAGEM','ENHANCEMENT']){
      await rosterRelated.locator(`.full-related-tabs [data-kind="${kind.toLowerCase()}s"]`).click();const actual=await visibleRows(rosterRelated);
      assert.deepEqual(actual.map(row=>row.ruleId).sort(),rosterExpected[kind],`${device} roster ${kind} rows`);assert.ok(actual.every(row=>imported.includes(row.detachmentId)));assert.ok(actual.every(row=>row.applicability!=='NO_MATCH'));
    }
    assert.deepEqual(rosterExpected.ENHANCEMENT,[furnaceId]);assert.equal(await rosterRelated.locator('[data-applicability="NO_MATCH"], [data-match-state="no-match"]').count(),0);
    await rosterRelated.locator('.related-rules-close').click();await waitRelatedClosed(page);

    step=device+'/effective-weapon-popup';
    const weapon=rosterUnit.locator(`[data-card-id="${lordWeaponId}"]`),scopeId=await weapon.getAttribute('data-composition-id'),weaponSource=weapon.locator('a[data-popup-identity]'),popupIdentity=await weaponSource.getAttribute('data-popup-identity');
    popup=await openPopup(weaponSource,page,lordWeaponId);const projected=popup.locator(`[data-card-id="${lordWeaponId}"]`);
    assert.deepEqual(JSON.parse(popupIdentity),[lordWeaponId,'parsed-unit-1',scopeId]);assert.equal(await projected.getAttribute('data-popup-identity'),popupIdentity);
    assert.equal(await projected.getAttribute('data-roster-instance-id'),'parsed-unit-1');assert.equal(await projected.getAttribute('data-composition-id'),scopeId);
    for(const[field,value,base,modifier]of[['attacks','6','5','1'],['strength','10','9','1']]){
      const fact=projected.locator(`[data-fact-id="${lordWeaponId}::/${field}"]`);assert.equal(JSON.parse(await fact.getAttribute('data-fact-value')),value);const cell=fact.locator('xpath=..');assert.equal(await cell.getAttribute('data-roster-base-value'),base);assert.equal(await cell.getAttribute('data-roster-modifier'),modifier);
    }
    await popup.locator('.popup-close').click();await waitPopupClosed(page);assert.equal(await focused(weaponSource),true,'Effective weapon popup did not restore its scoped source');

    const globals=await page.evaluate(()=>({related:typeof window.WHArmyRelatedRules,popups:typeof window.WHPopupController,guide:typeof window.DG_ROSTER_GUIDE,terms:typeof window.CORE_GLOSSARY}));
    assert.deepEqual(globals,{related:'undefined',popups:'undefined',guide:'undefined',terms:'undefined'});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,device+' horizontal overflow');
    assert.deepEqual(errors,[],device+' browser errors');
    results.push({device,viewport,status:'PASS',related:{tabs:2,fullBookFilters:detachments.length+1,stratagemColumns:phone?1:2,enhancementColumns:phone?1:2,longScroll:'PASS'},popups:{canonical:[deepStrikeId,furnaceId,stratagemId],closePaths:3,longScroll:'PASS',effectiveWeapon:{id:lordWeaponId,instanceId:'parsed-unit-1',scopeId}},roster:{detachments:imported,noMatch:0,enhancements:rosterExpected.ENHANCEMENT},legacyReads:0});
    await context.close();
  }
  assert.deepEqual(unexpected,[],'V2 requested an unallowlisted/V1 dependency');
  assert.ok(!requests.some(address=>/\/books\/death-guard\/(?:reader\.html|mobile\/|scripts\/)|\/books\/shared\/(?:army-related-rules|popup-content|popup-rule-actions|controllers\/popup-controller|styles\/(?:content|popups))/.test(address)),'V2 loaded a legacy Related Rules/popup dependency');
  console.log(JSON.stringify({status:'PASS',scope:'Actual V1 Related Rules and popup presentation port',results,legacyReads:0,requestedPaths:[...new Set(requests)]},null,2));
}catch(error){throw new Error(`${step}: ${error.message}`,{cause:error});}
finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
