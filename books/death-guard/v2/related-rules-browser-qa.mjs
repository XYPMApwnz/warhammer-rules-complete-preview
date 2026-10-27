import assert from 'node:assert/strict';
import {allowRosterDependencies} from './roster-browser-dependencies.mjs';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {buildApp} from './app-build.mjs';

const {chromium}=createRequire(import.meta.url)('playwright');
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const appURL='/v2/app.html?v2=ARMY_BOOK&book=death-guard&registry=death-guard';
const appPath='/v2/app.html';
const payloadPath='/books/death-guard/v2/generated/app-presentation.json';
const payload=buildApp();
assert.equal(payload.relatedRules?.schema,'army-book-related-rules/v2');
const rows=payload.relatedRules.rows;
assert.ok(Array.isArray(rows)&&rows.length>0,'Missing compiled relations');
const units=payload.cards.filter(card=>card.kind==='DATASHEET').map(card=>card.id);
const detachments=payload.cards.filter(card=>card.kind==='DETACHMENT').map(card=>card.id);
assert.equal(detachments.length,9);
assert.ok(rows.every(row=>units.includes(row.unitId)),'Relation unit missing from canonical cards');
assert.equal(rows.filter(row=>row.kind==='STRATAGEM').length,units.length*45);
assert.equal(rows.filter(row=>row.kind==='ENHANCEMENT').length,units.length*30);
const allowed=new Map([[appPath,'text/html'],[payloadPath,'application/json'],['/books/shared/army-book-app-v2/runtime.mjs','text/javascript'],['/books/shared/army-book-app-v2/glossary.mjs','text/javascript'],['/books/shared/army-book-app-v2/styles.css','text/css']]);
allowRosterDependencies(allowed);
const requests=[],legacyRequests=[];
const server=http.createServer((request,response)=>{
  const address=new URL(request.url,'http://localhost').pathname;
  requests.push(address);
  if (!allowed.has(address)) {
    if (address!=='/favicon.ico') legacyRequests.push(address);
    response.writeHead(address==='/favicon.ico'?404:200,{'Content-Type':'application/json'});
    response.end('{"POISONED_LEGACY_COMPATIBILITY":true}');return;
  }
  response.writeHead(200,{'Content-Type':allowed.get(address),'Cache-Control':'no-store'});
  response.end(address===payloadPath?JSON.stringify(payload):fs.readFileSync(path.join(repo,address.slice(1))));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const screenshots=process.env.ARMY_APP_V2_SCREENSHOTS;
if (screenshots) fs.mkdirSync(screenshots,{recursive:true});
const expectedRows=(unitId,detachmentId='')=>rows.filter(row=>row.unitId===unitId&&(!detachmentId||row.detachmentId===detachmentId))
  .map(row=>({...row,...(detachmentId?row.selectedDetachment:{})}))
  .filter(row=>row.applicability==='MATCH'||row.applicability==='CONDITIONAL');
const signature=row=>[row.ruleId,row.kind,row.detachmentId,row.applicability].join('|');
const results=[];
try {
  for (const [device,viewport] of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]) {
    const context=await browser.newContext({viewport,...(device==='phone'?{hasTouch:true,isMobile:true}:{})});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(origin+appURL);await page.waitForFunction(()=>!!window.ArmyBookAppV2);
    let queries=0,visibleRelations=0,hiddenNegativeControls=0;
    const observedStates=new Set();
    // Every supported canonical unit is queried through the same normal reader flow.
    for (const unitId of units) {
      await page.evaluate(id=>{window.ArmyBookAppV2.open(id);window.ArmyBookAppV2.openRelatedRules(id);},unitId);await page.waitForSelector('dialog.v2-related-dialog[open]');
      for (const detachmentId of ['',...detachments]) {
        const observed=await page.evaluate(({unitId,detachmentId})=>{
          const section=document.querySelector(`dialog.v2-related-dialog[open] .v2-compatible[data-unit-id="${unitId}"]`);
          if (!section) return {missing:true};
          const filter=section.querySelector('.v2-detachment-filter');
          filter.value=detachmentId;filter.dispatchEvent(new Event('change',{bubbles:true}));
          const current=document.querySelector(`dialog.v2-related-dialog[open] .v2-compatible[data-unit-id="${unitId}"]`);
          return {
            selected:current.querySelector('.v2-detachment-filter').value,
            options:[...current.querySelector('.v2-detachment-filter').options].map(option=>option.value),
            groups:[...current.querySelectorAll('[data-rule-kind]')].map(group=>group.dataset.ruleKind),
            items:[...current.querySelectorAll('.v2-compatible-item')].map(item=>({ruleId:item.dataset.ruleId,kind:item.closest('[data-rule-kind]')?.dataset.ruleKind,detachmentId:item.dataset.detachmentId,applicability:item.dataset.applicability,targetId:item.querySelector('a.v2-reference')?.dataset.targetId,href:item.querySelector('a.v2-reference')?.getAttribute('href'),badge:item.querySelector('.v2-applicability')?.textContent,visible:!!item.getClientRects().length})),
            text:current.textContent,
            overflow:document.documentElement.scrollWidth>innerWidth+1
          };
        },{unitId,detachmentId});
        assert.ok(!observed.missing,`${device} missing related section ${unitId}`);
        assert.equal(observed.selected,detachmentId);
        assert.deepEqual([...observed.options].sort(),['',...detachments].sort());
        assert.deepEqual([...new Set(observed.groups)].sort(),['ENHANCEMENT','STRATAGEM']);
        const expected=expectedRows(unitId,detachmentId);
        assert.deepEqual(observed.items.map(signature).sort(),expected.map(signature).sort(),`${device} ${unitId} filter ${detachmentId||'All'} relation parity`);
        assert.equal(new Set(observed.items.map(item=>item.ruleId)).size,observed.items.length,`${device} duplicated rule identity`);
        assert.equal(observed.overflow,false,`${device} overflow ${unitId}`);
        for (const item of observed.items) {
          assert.equal(item.visible,true,`${device} invisible result ${item.ruleId}`);
          assert.equal(item.targetId,item.ruleId,`${device} popup identity ${item.ruleId}`);
          assert.equal(decodeURIComponent(item.href.slice(1)),item.ruleId);
          assert.equal(item.badge,item.applicability==='MATCH'?'Match':'Conditional',`${device} missing state badge`);
          if (detachmentId) assert.equal(item.detachmentId,detachmentId,'Cross-Detachment leakage');
          observedStates.add(item.applicability);
        }
        assert.match(observed.text,/roster/i,'Missing explanation of unavailable roster facts');
        assert.match(observed.text,/battle/i,'Missing explanation of unavailable battle facts');
        hiddenNegativeControls+=rows.filter(row=>row.unitId===unitId&&(!detachmentId||row.detachmentId===detachmentId)&&(detachmentId?row.selectedDetachment:row).applicability==='NO_MATCH').length;
        queries++;visibleRelations+=observed.items.length;
      }
      await page.getByRole('button',{name:'Close compatible rules',exact:true}).click();await page.waitForSelector('dialog.v2-related-dialog[open]',{state:'hidden'});
    }
    assert.ok(observedStates.has('MATCH')&&observedStates.has('CONDITIONAL'),`${device} missing representative states`);
    assert.ok(hiddenNegativeControls>0,`${device} missing NO_MATCH control`);
    // A static Army Book filter is presentation state only. It must neither
    // rewrite a physical roster dialog nor survive a main-route replacement.
    await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);
    const rosterText='+ DETACHMENT: Virulent Vectorium\nChar1: 1x Lord of Contagion (110 pts): Manreaper';
    assert.equal(await page.evaluate(text=>window.ArmyBookAppV2.roster.import(text).status,rosterText),'READY');
    await page.evaluate(()=>{const app=window.ArmyBookAppV2;app.setRelatedDetachment('detachment-paragons-of-putrescence');app.openPersonalGuide();app.openInstance('parsed-unit-1');});
    await page.waitForFunction(()=>document.querySelector('main .v2-current-card')?.dataset.rosterInstanceId==='parsed-unit-1');await page.evaluate(()=>window.ArmyBookAppV2.openRelatedRules('unit-lord-of-contagion','parsed-unit-1'));
    await page.waitForSelector('dialog.v2-related-dialog[open] [data-roster-related-instance-id="parsed-unit-1"]');
    const rosterRelated=()=>page.locator('dialog.v2-related-dialog[open] .v2-compatible').evaluate(section=>({selected:section.querySelector('.v2-detachment-filter').value,items:[...section.querySelectorAll('.v2-compatible-item')].map(item=>[item.dataset.ruleId,item.dataset.applicability,item.dataset.detachmentId])}));
    const rosterBefore=await rosterRelated();await page.evaluate(()=>window.ArmyBookAppV2.setRelatedDetachment('detachment-tallyband-summoners'));assert.deepEqual(await rosterRelated(),rosterBefore,`${device} book filter rewrote roster Related Rules`);
    await page.getByRole('button',{name:'Close compatible rules',exact:true}).click();
    await page.evaluate(()=>{const app=window.ArmyBookAppV2;app.openInstance('parsed-unit-1');app.openRelatedRules('unit-lord-of-contagion','parsed-unit-1');});await page.waitForSelector('dialog.v2-related-dialog[open]');await page.evaluate(()=>window.ArmyBookAppV2.openRoster());await page.waitForSelector('dialog.v2-related-dialog[open]',{state:'hidden'});await page.evaluate(()=>window.ArmyBookAppV2.openLibrary());
    // Repaired TARGET prerequisites cannot turn missing battle context into MATCH.
    for (const ruleId of ['detachment-tallyband-summoners:stratagem:3','detachment-tallyband-summoners:stratagem:6','detachment-contagion-engines:stratagem:3']) {
      const relation=rows.find(row=>row.ruleId===ruleId&&row.selectedDetachment.applicability==='CONDITIONAL');
      assert.ok(relation,`Missing repaired prerequisite control ${ruleId}`);
      await page.evaluate(id=>{window.ArmyBookAppV2.open(id);window.ArmyBookAppV2.openRelatedRules(id);},relation.unitId);
      await page.locator('dialog.v2-related-dialog[open] .v2-detachment-filter').selectOption(relation.detachmentId);
      assert.equal(await page.locator(`dialog.v2-related-dialog[open] .v2-compatible-item[data-rule-id="${ruleId}"]`).getAttribute('data-applicability'),'CONDITIONAL');
      await page.getByRole('button',{name:'Close compatible rules',exact:true}).click();
    }
    // A selected known Detachment can resolve an otherwise unknown scope to MATCH.
    const match=rows.find(row=>row.applicability==='CONDITIONAL'&&row.selectedDetachment.applicability==='MATCH');
    assert.ok(match,'Missing selected-Detachment MATCH control');
    await page.evaluate(id=>{window.ArmyBookAppV2.open(id);window.ArmyBookAppV2.openRelatedRules(id);},match.unitId);
    await page.locator('dialog.v2-related-dialog[open] .v2-detachment-filter').selectOption('');
    assert.equal(await page.locator(`dialog.v2-related-dialog[open] .v2-compatible-item[data-rule-id="${match.ruleId}"]`).getAttribute('data-applicability'),'CONDITIONAL');
    await page.locator('dialog.v2-related-dialog[open] .v2-detachment-filter').selectOption(match.detachmentId);
    assert.equal(await page.locator(`dialog.v2-related-dialog[open] .v2-compatible-item[data-rule-id="${match.ruleId}"]`).getAttribute('data-applicability'),'MATCH');
    await page.getByRole('button',{name:'Close compatible rules',exact:true}).click();
    // Both rule kinds open their SAME canonical card; history retains background and filter.
    for (const kind of ['STRATAGEM','ENHANCEMENT']) {
      const candidate=rows.find(row=>row.kind===kind&&row.selectedDetachment.applicability!=='NO_MATCH');
      await page.evaluate(id=>{window.ArmyBookAppV2.open(id);window.ArmyBookAppV2.openRelatedRules(id);},candidate.unitId);
      await page.locator('dialog.v2-related-dialog[open] .v2-detachment-filter').selectOption(candidate.detachmentId);
      await page.locator(`dialog.v2-related-dialog[open] .v2-compatible-item[data-rule-id="${candidate.ruleId}"] a.v2-reference`).click();
      await page.waitForSelector('dialog.v2-detail-dialog[open]');
      assert.equal(await page.locator('dialog.v2-detail-dialog article').first().getAttribute('data-card-id'),candidate.ruleId);
      assert.equal(await page.locator('main > article').getAttribute('data-card-id'),candidate.unitId);
      assert.equal(await page.evaluate(()=>decodeURIComponent(location.hash.slice(1))),candidate.ruleId);
      await page.goBack();await page.waitForSelector('dialog.v2-detail-dialog[open]',{state:'hidden'});
      await page.evaluate(id=>window.ArmyBookAppV2.openRelatedRules(id),candidate.unitId);assert.equal(await page.locator('dialog.v2-related-dialog[open] .v2-detachment-filter').inputValue(),candidate.detachmentId);await page.getByRole('button',{name:'Close compatible rules',exact:true}).click();
      await page.goForward();await page.waitForSelector('dialog.v2-detail-dialog[open]');
      assert.equal(await page.locator('dialog.v2-detail-dialog article').first().getAttribute('data-card-id'),candidate.ruleId);
      await page.keyboard.press('Escape');await page.waitForSelector('dialog.v2-detail-dialog[open]',{state:'hidden'});
      await page.evaluate(id=>window.ArmyBookAppV2.openRelatedRules(id),candidate.unitId);
      assert.equal(await page.locator('dialog.v2-related-dialog[open] .v2-detachment-filter').inputValue(),candidate.detachmentId);
      assert.equal(await page.locator('dialog.v2-related-dialog[open] .v2-compatible-item').count(),expectedRows(candidate.unitId,candidate.detachmentId).length);
      await page.getByRole('button',{name:'Close compatible rules',exact:true}).click();
    }
    await page.evaluate(id=>{window.ArmyBookAppV2.open(id);window.ArmyBookAppV2.openRelatedRules(id);},match.unitId);
    await page.locator('dialog.v2-related-dialog[open] .v2-detachment-filter').selectOption('');
    await page.locator('dialog.v2-related-dialog[open] .v2-compatible').scrollIntoViewIfNeeded();
    if (screenshots) await page.screenshot({path:path.join(screenshots,`${device}-related-rules.png`),animations:'disabled'});
    assert.deepEqual(errors,[],`${device} browser errors`);
    results.push({device,status:'PASS',units:units.length,filterQueries:queries,visibleRelations,hiddenNoMatchControls:hiddenNegativeControls,crossDetachmentLeakage:0,popupIdentity:'PASS',history:'PASS',missingBattleControls:'PASS',selectedDetachment:'PASS',rosterFilterIsolation:'PASS',routeClose:'PASS'});
    await context.close();
  }
  assert.deepEqual(legacyRequests,[],'Legacy compatibility/runtime/Glossary request');
  console.log(JSON.stringify({status:'PASS',results,legacyCompatibilityReads:0,legacyPoison:'PASS',sharedDesktopPhoneRuntime:'PASS',requestedPaths:[...new Set(requests)]},null,2));
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
