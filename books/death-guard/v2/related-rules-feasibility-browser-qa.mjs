import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {buildApp} from './app-build.mjs';
import {allowRosterDependencies} from './roster-browser-dependencies.mjs';

const {chromium}=createRequire(import.meta.url)('playwright');
const root=fileURLToPath(new URL('../../../',import.meta.url)),payload=buildApp();
const app='/books/death-guard/v2/app.html',data='/books/death-guard/v2/generated/app-presentation.json';
const allowed=new Map([[app,'text/html'],[data,'application/json'],['/books/shared/army-book-app-v2/runtime.mjs','text/javascript'],['/books/shared/army-book-app-v2/glossary.mjs','text/javascript'],['/books/shared/army-book-app-v2/styles.css','text/css']]);
allowRosterDependencies(allowed);
const forbidden=[];
const server=http.createServer((request,response)=>{
  const address=new URL(request.url,'http://localhost').pathname;
  if(!allowed.has(address)){if(address!=='/favicon.ico')forbidden.push(address);response.writeHead(404);response.end();return;}
  response.writeHead(200,{'Content-Type':allowed.get(address),'Cache-Control':'no-store'});
  response.end(address===data?JSON.stringify(payload):fs.readFileSync(path.join(root,address.slice(1))));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const mobile='detachment-champions-of-contagion:stratagem:5',champions='detachment-champions-of-contagion';
const source=JSON.parse(fs.readFileSync(new URL('../sources/waha-11e-current-2026-09-25/corpus.json',import.meta.url),'utf8'));
const mfm=JSON.parse(fs.readFileSync(new URL('../sources/official-mfm-v1.5.json',import.meta.url),'utf8'));
const normalize=text=>text.toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();
const labels=new Map(source.datasheets.map(sheet=>[normalize(sheet.title),sheet.sourceId.replace(/^datasheet-/,'unit-')]));
const outgoing=new Map(source.datasheets.map(sheet=>[labels.get(normalize(sheet.title)),new Set()]));
for(const record of mfm.units.filter(r=>r.status==='CURRENT'&&r.sourceGroup==='UNITS'&&r.relations?.leader))for(const target of record.relations.leader)outgoing.get(labels.get(normalize(record.title))).add(labels.get(normalize(target)));
const enhancements=source.detachments.flatMap(d=>d.enhancements);
const walking=enhancements.find(e=>/If the bearer is leading a POXWALKER unit/.test(e.text)).sourceId;
const talisman=enhancements.find(e=>/^DEATH GUARD model only\. While the bearer is leading a unit, add 1 to the Toughness/.test(e.text)).sourceId;
const shamblerot=walking.split(':')[0],wall=source.detachments.flatMap(d=>d.stratagems).find(s=>/\band one friendly\b/i.test(s.lines.find(l=>l.label==='TARGET')?.text||'')).sourceId;
const results=[];
try{
  for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
    const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}${app}`);
    await page.waitForFunction(()=>!!window.ArmyBookAppV2?.rosterPanel);
    await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);
    const dialog=page.locator('dialog.v2-related-dialog[open]');
    const visible=()=>dialog.locator('.v2-compatible-item').evaluateAll(nodes=>nodes.filter(node=>node.getClientRects().length).map(node=>({ruleId:node.dataset.ruleId,applicability:node.dataset.applicability,detachmentId:node.dataset.detachmentId})));
    const close=async()=>{await dialog.locator('.related-rules-close').click();await page.waitForSelector('dialog.v2-related-dialog[open]',{state:'hidden'});};
    let bookQueries=0;
    // All canonical datasheets reach the actual current V1-style dialog.
    for(const card of payload.cards.filter(card=>card.kind==='DATASHEET')){
      await page.evaluate(id=>{const app=window.ArmyBookAppV2;app.open(id);app.openRelatedRules(id);},card.id);
      await page.waitForSelector('dialog.v2-related-dialog[open]');
      await dialog.locator(`button[data-detachment="${champions}"]`).evaluate(node=>node.click());
      const actual=await visible(),expected=payload.relatedRules.rows.filter(row=>row.unitId===card.id&&row.detachmentId===champions&&row.kind==='STRATAGEM'&&['MATCH','CONDITIONAL'].includes(row.selectedDetachment.applicability)).map(row=>({ruleId:row.ruleId,applicability:row.selectedDetachment.applicability,detachmentId:row.detachmentId}));
      assert.deepEqual(actual,expected,`${device}/${card.id}: static feasibility reaches rendered dialog`);
      assert.equal(await dialog.locator('[data-applicability="NO_MATCH"]').count(),0);
      bookQueries++;await close();
    }
    // Source-derived leading feasibility, including genuine unknown positives.
    let leadingQueries=0;
    for(const sheet of source.datasheets.filter(s=>s.factionKeywords.includes('DEATH GUARD')&&s.keywords.includes('CHARACTER')))for(const [ruleId,possible]of [[walking,outgoing.get(labels.get(normalize(sheet.title))).has('unit-poxwalkers')],[talisman,outgoing.get(labels.get(normalize(sheet.title))).size>0]]) {
      const unitId=labels.get(normalize(sheet.title));
      await page.evaluate(id=>{window.ArmyBookAppV2.open(id);window.ArmyBookAppV2.openRelatedRules(id);},unitId);
      await dialog.waitFor();await dialog.locator(`button[data-detachment="${shamblerot}"]`).evaluate(node=>node.click());
      await dialog.locator('[data-kind="enhancements"]').click();
      const item=(await visible()).find(row=>row.ruleId===ruleId);
      assert.equal(item?.applicability??null,possible?'CONDITIONAL':null,`${device}/${unitId}: source-backed leading feasibility`);
      leadingQueries++;await close();
    }
    const lord='Char1: 1x Lord of Contagion (110 pts): Manreaper',guard='3x Deathshroud Terminators (150 pts)';
    let rosterQueries=0;
    for(const [units,attach,expected]of [[lord,false,null],[lord+'\n'+guard,false,'CONDITIONAL'],[lord+'\n'+guard,true,null]]){
      await page.evaluate(({units,attach})=>{
        const app=window.ArmyBookAppV2;
        if(app.roster.import('+ DETACHMENT: Champions of Contagion\n'+units).status!=='READY')throw new Error('Import failed');
        if(attach)app.roster.attach('parsed-unit-1','parsed-unit-2');
        app.openPersonalGuide();app.openInstance('parsed-unit-1');
      },{units,attach});
      await page.waitForFunction(()=>document.querySelector('main > .unit-card')?.dataset.rosterInstanceId==='parsed-unit-1');
      await page.locator('main > .unit-card .ds-related-rules-button').click();
      await page.waitForSelector('dialog.v2-related-dialog[open]');
      const items=await visible(),item=items.find(row=>row.ruleId===mobile);
      assert.equal(item?.applicability??null,expected,device+' mandatory physical recipient');
      assert(items.every(row=>row.detachmentId===champions&&row.applicability!=='NO_MATCH'));
      rosterQueries++;await close();
    }
    // A known roster is a collection of actual recipients, not future battle
    // reinforcements. Pox self-targeting remains possible absent distinctness.
    for(const [units,expected]of [['5x Plague Marines (90 pts)',null],['5x Plague Marines (90 pts)\n10x Poxwalkers (50 pts)','CONDITIONAL'],['10x Poxwalkers (50 pts)','CONDITIONAL']]) {
      await page.evaluate(units=>{const app=window.ArmyBookAppV2;assertImport(app.roster.import('+ DETACHMENT: Shamblerot Vectorium\n'+units));app.openPersonalGuide();app.openInstance('parsed-unit-1');function assertImport(result){if(result.status!=='READY')throw new Error('Import failed');}},units);
      await page.waitForFunction(()=>document.querySelector('main > .unit-card')?.dataset.rosterInstanceId==='parsed-unit-1');
      await page.locator('main > .unit-card .ds-related-rules-button').click();await dialog.waitFor();
      await dialog.locator('[data-kind="stratagems"]').click();
      assert.equal((await visible()).find(row=>row.ruleId===wall)?.applicability??null,expected,device+' mandatory secondary target');
      rosterQueries++;await close();
    }
    await page.evaluate(()=>{const app=window.ArmyBookAppV2;if(app.roster.import('+ DETACHMENT: Shamblerot Vectorium\nChar1: 1x Noxious Blightbringer (50 pts)\nEnhancement: Lord of the Walking Pox (+15 pts)\n10x Poxwalkers (50 pts)').status!=='READY')throw new Error('Import failed');});
    for(const attached of [false,true,false,true]) {
      await page.evaluate(attached=>{const app=window.ArmyBookAppV2;if(attached)app.roster.attach('parsed-unit-1','parsed-unit-2');else if(app.roster.state.attachments.length)app.roster.detach('parsed-unit-1');app.openPersonalGuide();app.openInstance('parsed-unit-1');},attached);
      await page.waitForFunction(()=>document.querySelector('main > .unit-card')?.dataset.rosterInstanceId==='parsed-unit-1');
      await page.locator('main > .unit-card .ds-related-rules-button').click();await dialog.waitFor();await dialog.locator('[data-kind="enhancements"]').click();
      assert.equal((await visible()).find(row=>row.ruleId===walking)?.applicability??null,attached?'CONDITIONAL':null,device+' actual leading state');
      rosterQueries++;await close();
    }
    assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    results.push({device,bookQueries,leadingQueries,rosterQueries,status:'PASS'});await context.close();
  }
  assert.deepEqual(forbidden,[]);console.log(JSON.stringify({status:'PASS',results,legacyReads:0}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
