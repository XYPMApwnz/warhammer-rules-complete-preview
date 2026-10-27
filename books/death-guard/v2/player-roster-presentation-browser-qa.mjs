import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {allowRosterDependencies} from './roster-browser-dependencies.mjs';

// Exercise ordinary production screens, not the source/debug census renderer.
const {chromium}=createRequire(import.meta.url)('playwright');
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const appURL='/v2/app.html?v2=ARMY_BOOK&book=death-guard&registry=death-guard';
const app='/v2/app.html';
const payload=JSON.parse(fs.readFileSync(path.join(repo,'books/death-guard/v2/generated/app-presentation.json'),'utf8'));
const allowed=new Map([[app,'text/html'],
  ['/books/death-guard/v2/generated/app-presentation.json','application/json'],
  ['/books/shared/army-book-app-v2/runtime.mjs','text/javascript'],
  ['/books/shared/army-book-app-v2/glossary.mjs','text/javascript'],
  ['/books/shared/army-book-app-v2/styles.css','text/css']]);
allowRosterDependencies(allowed);
const unexpected=[];
const server=http.createServer((request,response)=>{
  const address=new URL(request.url,'http://localhost').pathname;
  if(!allowed.has(address)){if(address!=='/favicon.ico')unexpected.push(address);response.writeHead(404);response.end();return;}
  response.writeHead(200,{'Content-Type':allowed.get(address),'Cache-Control':'no-store'});
  response.end(fs.readFileSync(path.join(repo,address.slice(1))));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const screenshots=process.env.ARMY_APP_V2_SCREENSHOTS||fs.mkdtempSync(path.join(os.tmpdir(),'dg-player-presentation-'));
fs.mkdirSync(screenshots,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const mega=`+ DETACHMENT: Paragons of Putrescence, Virulent Vectorium (Hypervirulent Strains)
+ WARLORD: Char1: Lord of Contagion
Char1: 1x Lord of Contagion (135 pts): Manreaper
Enhancement: Furnace of Plagues (+25 pts)
3x Deathshroud Terminators (150 pts): 3x Manreaper, 3x Plaguespurt gauntlet`;
const support=`+ DETACHMENT: Virulent Vectorium
Char1: 1x Biologus Putrifier (50 pts)
Char2: 1x Malignant Plaguecaster (60 pts)
5x Plague Marines (90 pts): 1x Meltagun, 4x Boltgun, 5x Plague knives
10x Plague Marines (180 pts): 2x Meltagun, 8x Boltgun, 10x Plague knives`;
const internalText=/\bCURRENT\b|SUPPORT_EXCEPTION|\b(?:parsed-unit-\d+|unit-[a-z][a-z0-9-]*|datasheet-[a-z][a-z0-9:-]*|detachment-[a-z][a-z0-9:-]*|gw-death-guard-[a-z0-9.-]+|waha-dg-[a-z0-9.-]+)\b/;
const privateIds=new Set(payload.cards.map(card=>card.id));
function collectSourceIds(value){
  if(!value||typeof value!=='object')return;
  for(const[key,child]of Object.entries(value)){if(key==='sourceId'&&typeof child==='string')privateIds.add(child);else collectSourceIds(child);}
}
collectSourceIds(payload);
async function noInternalText(page,selector,label){
  const text=await page.locator(selector).innerText();assert.equal(internalText.test(text),false,`${label}: ${text.match(internalText)?.[0]}`);
  assert.deepEqual([...privateIds].filter(id=>text.toLowerCase().includes(id.toLowerCase())),[],`${label}: visible canonical/source identifiers`);
}
async function readable(page,selector,label){
  const observation=await page.locator(selector).evaluate(root=>{
    const rgba=color=>{const v=color.match(/[\d.]+/g)?.map(Number)||[0,0,0];return [...v.slice(0,3),v[3]??1];};
    const blend=(front,back)=>front.slice(0,3).map((value,i)=>value*front[3]+back[i]*(1-front[3]));
    const background=node=>{const chain=[];for(let p=node;p;p=p.parentElement)chain.push(p);let color=[255,255,255];for(const p of chain.reverse())color=blend(rgba(getComputedStyle(p).backgroundColor),color);return color;};
    const luminance=color=>color.map(c=>c/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0);
    const checked=[];const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
      const node=walker.currentNode.parentElement,value=walker.currentNode.textContent.trim();
      if(!value||node.closest('style,script,option')||!node.getClientRects().length)continue;
      const style=getComputedStyle(node);if(style.visibility!=='visible')continue;
      const bg=background(node),fg=blend(rgba(style.color),bg),a=luminance(fg),b=luminance(bg);
      const ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05),large=parseFloat(style.fontSize)>=24||(parseFloat(style.fontSize)>=18.66&&parseInt(style.fontWeight)>=700);
      checked.push({text:value.slice(0,100),ratio,minimum:large?3:4.5});
    }
    return {checked,overflow:document.documentElement.scrollWidth>innerWidth+1};
  });
  assert.ok(observation.checked.length,`${label}: no visible text checked`);
  assert.deepEqual(observation.checked.filter(item=>item.ratio+.01<item.minimum),[],`${label}: unreadable text`);
  assert.equal(observation.overflow,false,`${label}: horizontal overflow`);
  return observation.checked.length;
}
const ready=async page=>{await page.waitForFunction(()=>!!window.ArmyBookAppV2?.rosterPanel);await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);};
const settled=page=>page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy=true]'));
const results=[];
try{
  for(const[device,viewport]of[['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
    const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(origin+appURL+'#start');await ready(page);
    await noInternalText(page,'main',device+' full book');
    const popupIds=payload.cards.filter(card=>['ARMY_RULE','DETACHMENT_RULE','ENHANCEMENT','STRATAGEM','SOURCE_ERRATUM'].includes(card.kind)).map(card=>card.id);
    popupIds.push('core-deep-strike');
    for(const id of popupIds){
      await page.evaluate(id=>window.ArmyBookAppV2.showDetail(id),id);
      const dialog=page.locator('dialog.v2-detail-dialog[open]');await noInternalText(page,'dialog.v2-detail-dialog[open]',device+' popup '+id);
      assert.equal(await dialog.locator('[data-card-id]').first().getAttribute('data-card-id'),id,'Canonical popup identity lost');
      await page.keyboard.press('Escape');
    }
    await page.evaluate(()=>window.ArmyBookAppV2.openRoster());await settled(page);
    let textChecks=await readable(page,'main .v2-roster[data-roster-view]',device+' empty import');
    await page.screenshot({path:path.join(screenshots,device+'-import.png')});
    await page.locator('[data-roster-input="raw-text"]').fill('+ DETACHMENT: Virulent Vectorium\n1x Unknown imported unit (1 pts)');
    await page.locator('[data-roster-action="review-import"]').click();await settled(page);
    await noInternalText(page,'main',device+' unresolved import');textChecks+=await readable(page,'main .v2-roster[data-roster-view]',device+' unresolved import');
    await page.locator('[data-roster-input="raw-text"]').fill(mega);await page.locator('[data-roster-action="review-import"]').click();await settled(page);
    await page.locator('[data-attachment-candidate-for="parsed-unit-2"]').selectOption('parsed-unit-1');
    await page.locator('[data-roster-instance-id="parsed-unit-2"] [data-roster-action="attach"]').click();await settled(page);
    await page.locator('main details').evaluateAll(nodes=>nodes.forEach(node=>node.open=true));
    await noInternalText(page,'main',device+' attachment setup');textChecks+=await readable(page,'main .v2-roster[data-roster-view]',device+' attachment setup');
    const before=await page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());
    assert.equal(before.attachments.length,1);assert.equal(before.detachmentIds.length,2);
    await page.locator('[data-roster-instances]').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(screenshots,device+'-attachments.png')});
    await page.locator('[data-roster-action="open-personal-guide"]').click();
    await noInternalText(page,'main',device+' personal guide');textChecks+=await readable(page,'main .v2-library-sections',device+' personal guide links');
    await page.screenshot({path:path.join(screenshots,device+'-personal-guide.png')});
    await page.locator('main .v2-card-link').filter({hasText:/^Lord of Contagion$/}).click();
    await noInternalText(page,'main',device+' effective Lord');
    assert.match(await page.locator('main .unit-card').innerText(),/Feel No Pain\s+4\+/i);
    assert.deepEqual(await page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot()),before,'Presentation changed roster state');
    await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
    await page.locator('[data-roster-input="raw-text"]').fill(support);await page.locator('[data-roster-action="review-import"]').click();await settled(page);
    for(const id of ['parsed-unit-1','parsed-unit-2']){
      await page.locator('[data-attachment-candidate-for="parsed-unit-3"]').selectOption(id);
      await page.locator('[data-roster-instance-id="parsed-unit-3"] [data-roster-action="attach"]').click();await settled(page);
    }
    const state=await page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());
    assert.ok(state.attachments.some(a=>a.role==='SUPPORT_EXCEPTION'),'Support control did not reach support role');
    await noInternalText(page,'main',device+' Leader + Support + duplicate units');textChecks+=await readable(page,'main .v2-roster[data-roster-view]',device+' support setup');
    assert.match(await page.locator('main').innerText(),/Plague Marines #1/);assert.match(await page.locator('main').innerText(),/Plague Marines #2/);
    assert.match(await page.locator('main').innerText(),/Supported by/);
    const invalid=structuredClone(state);invalid.units[0].canonicalUnitId='unit-private-probe';
    await page.locator('main details').evaluateAll(nodes=>nodes.forEach(node=>node.open=true));
    await page.locator('input[type="file"]').setInputFiles({name:'invalid-roster.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(invalid))});await settled(page);
    assert.equal(await page.locator('.v2-roster-error').count(),1,'Invalid backup did not fail closed');
    await noInternalText(page,'main',device+' invalid backup');textChecks+=await readable(page,'main .v2-roster[data-roster-view]',device+' backup error');
    assert.deepEqual(await page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot()),state,'Invalid backup changed imported state');
    assert.deepEqual(errors,[],device+' browser errors');results.push({device,textChecks,popupsChecked:popupIds.length,internalLabelsVisible:0,status:'PASS'});
    await context.close();
  }
  assert.deepEqual(unexpected,[],'Unexpected legacy dependency');
  console.log(JSON.stringify({status:'PASS',results,screenshots},null,2));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
