import {isApplicationTestDependency} from '../../shared/application-v2/browser-test-dependencies.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const repo=fileURLToPath(new URL('../../../',import.meta.url));
const originals=new Map(['effective','rule-contracts','roster-runtime','app-presentation'].map(name=>{
  const file=path.join(repo,'books/adeptus-mechanicus/v2/generated/'+name+'.json');return [file,fs.readFileSync(file)];
}));
const text=`+ FACTION KEYWORD: Imperium - Adeptus Mechanicus
+ DETACHMENT: Lords of the Forge
10x Skitarii Rangers (85 pts): 10x Galvanic rifle, 10x Close combat weapon
10x Skitarii Rangers (85 pts): 9x Galvanic rifle, 1x Plasma caliver, 10x Close combat weapon
1x Onager Dunecrawler (120 pts): Neutron laser, Dunecrawler legs
1x Onager Dunecrawler (120 pts): Eradication beamer, Dunecrawler legs
Char1: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe
Enhancement: TL-4Ø9
Char2: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe
9x Servitor Battleclade (110 pts)
• 1x Servitor Underseer: Mechanicus pistol, Dataspikes
• 2x Gun Servitor: 2 with Heavy arc rifle, Servo-claw
• 6x Combat Servitor: 6 with Phosphor blaster, Servo-claw`;
const errors=[],forbidden=[];
const server=http.createServer((request,response)=>{
  const pathname=new URL(request.url,'http://localhost').pathname;
  if(!isApplicationTestDependency(pathname)&&!/^\/books\/(?:adeptus-mechanicus\/(?:v2|assets)\/|shared\/(?:army-book-app-v2|roster-v2|rule-contract-v2)\/|shared\/(?:datasheet-system|unit-art)\.css$)/.test(pathname)&&!pathname.startsWith('/assets/')){
    if(pathname!=='/favicon.ico')forbidden.push(pathname);response.writeHead(404);response.end();return;
  }
  const file=path.resolve(repo,'.'+pathname);
  if(!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)){response.writeHead(404);response.end();return;}
  const types={'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png'};
  response.writeHead(200,{'Content-Type':types[path.extname(file)]||'image/jpeg','Cache-Control':'no-store'});response.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const results=[];
try{
 for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
  const context=await browser.newContext({viewport}),page=await context.newPage();page.setDefaultTimeout(15000);
  page.on('pageerror',error=>errors.push(device+': '+error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/books/adeptus-mechanicus/v2/app.html`);
  await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.rosterPanel));await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);
  // Book mode retains every canonical alternative and canonical popup.
  for(const [unit,suffix,options]of [['skitarii-rangers',4,[4,5]],['onager-dunecrawler',3,[3,4]]]){
    await page.evaluate(unit=>window.ArmyBookAppV2.open('unit-'+unit),unit);
    for(const id of options)assert.equal(await page.locator(`main .ds-profile-selection [data-target-id="datasheet-${unit}:weapon:${id}"]`).count(),1);
    await page.locator(`main .ds-profile-selection [data-target-id="datasheet-${unit}:weapon:${suffix}"]`).click();
    await page.waitForSelector('dialog.v2-detail-dialog[open]');
    assert.equal(await page.locator(`dialog[open] .popup-weapon-profile[data-card-id="datasheet-${unit}:weapon:${suffix}"]`).count(),1);
    await page.getByRole('button',{name:'Close rule reference',exact:true}).click();
  }
  await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
  await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
  await page.locator('[data-roster-action="review-import"]').click();
  await page.waitForSelector('[data-roster-action="open-personal-guide"]').catch(async error=>{throw new Error(error.message+'\n'+await page.locator('main').innerText());});
  assert.equal(await page.locator('[data-roster-bindings] select').count(),0);
  await page.locator('[data-roster-action="open-personal-guide"]').click();
  const state=await page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());assert.equal(state.units.length,7);
  const contribution='detachment-lords-of-the-forge:enhancement:2:weapon:1';
  // Continuous Contents also contains multiple physical copies of one sheet.
  await page.goto(page.url().split('#')[0]+'#'+encodeURIComponent('nav:detachments'));
  await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.rosterPanel));await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);
  await page.waitForSelector('main .v1-contents-pages');
  for(const [instance,id]of [['parsed-unit-2','datasheet-skitarii-rangers:weapon:4'],['parsed-unit-4','datasheet-onager-dunecrawler:weapon:3']]){
    await page.locator(`main .unit-card[data-roster-instance-id="${instance}"] .ds-profile-selection [data-target-id="${id}"]`).click();
    await page.waitForSelector('dialog.v2-detail-dialog[open]');
    assert.equal(await page.locator(`dialog[open] .popup-weapon-profile[data-card-id="${id}"][data-roster-instance-id="${instance}"]`).count(),1);
    await page.getByRole('button',{name:'Close rule reference',exact:true}).click();
  }
  const cases=[
    [1,'skitarii-rangers',[3,8],[],[4,5]],
    [2,'skitarii-rangers',[3,4,5,8],[4,5],[]],
    [3,'onager-dunecrawler',[5,8],[],[3,4]],
    [4,'onager-dunecrawler',[3,4,8],[3,4],[5]],
    [5,'tech-priest-dominus',[3,5,6],[],[1,2]],
    [6,'tech-priest-dominus',[3,5,6],[],[1,2]],
    [7,'servitor-battleclade',[1,4,6,7,8],[],[2,3,5]]
  ];
  let controls=0;
  const close=()=>page.getByRole('button',{name:'Close rule reference',exact:true}).click();
  for(const [index,unit,selected,selection,absent]of cases){
    const instanceId='parsed-unit-'+index,prefix='datasheet-'+unit+':weapon:';
    await page.evaluate(id=>window.ArmyBookAppV2.openInstance(id),instanceId);
    await page.waitForFunction(id=>document.querySelector('main .v2-current-card')?.dataset.rosterInstanceId===id,instanceId);
    const wanted=selected.map(id=>prefix+id).concat(index===5?[contribution]:[]).sort();
    const actual=await page.locator('main .weapon-row[data-card-id]').evaluateAll(nodes=>[...new Set(nodes.map(node=>node.dataset.cardId))].sort());
    assert.deepEqual(actual,wanted,device+': exact inventory '+instanceId);controls++;
    const links=await page.locator('main .ds-profile-selection [data-target-id]').evaluateAll(nodes=>nodes.map(node=>node.dataset.targetId).sort());
    assert.deepEqual(links,selection.map(id=>prefix+id).sort(),device+': selection options '+instanceId);controls++;
    for(const id of absent){assert.equal(await page.locator(`main [data-card-id="${prefix+id}"]`).count(),0);controls++;}
    for(const id of selection){
      const link=page.locator(`main .ds-profile-selection [data-target-id="${prefix+id}"]`),identity=JSON.parse(await link.getAttribute('data-popup-identity'));
      assert.equal(identity[1],instanceId);await link.click();await page.waitForSelector('dialog.v2-detail-dialog[open]');
      const popup=page.locator(`dialog[open] .popup-weapon-profile[data-card-id="${prefix+id}"]`);
      assert.equal(await popup.count(),1);assert.equal(await popup.getAttribute('data-roster-instance-id'),instanceId);
      assert.equal(JSON.parse(await popup.getAttribute('data-popup-identity'))[2],identity[2]);await close();controls++;
    }
    const target=index===5?contribution:prefix+selected[0];
    await page.locator(`main .weapon-row[data-card-id="${target}"] .weapon-button`).first().click();
    await page.waitForSelector('dialog.v2-detail-dialog[open]');
    assert.equal(await page.locator(`dialog[open] .popup-weapon-profile[data-card-id="${target}"][data-roster-instance-id="${instanceId}"]`).count(),1);await close();controls++;
    // Deep-link/programmatic requests cannot bypass inventory or profile scope.
    for(const id of [prefix+absent[0],...(index===6?[contribution]:[])].filter(id=>!id.endsWith('undefined'))){
      await page.evaluate(id=>window.ArmyBookAppV2.showDetail(id),id);await page.waitForSelector('dialog.v2-detail-dialog[open]');
      assert.equal(await page.locator('dialog[open] .popup-weapon-profile').count(),0);assert.match(await page.locator('dialog[open]').innerText(),/not available/);await close();controls++;
    }
    await page.evaluate(id=>window.ArmyBookAppV2.showDetail(id,{scopeId:'missing-scope'}),target);
    await page.waitForSelector('dialog.v2-detail-dialog[open]');assert.equal(await page.locator('dialog[open] .popup-weapon-profile').count(),0);await close();controls++;
  }
  const mixed=await page.locator('main .weapon-row[data-card-id]').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.cardId,scope:node.dataset.compositionId,text:node.innerText})));
  assert(mixed.filter(row=>row.id.endsWith(':weapon:8')).length===2);
  assert(mixed.every(row=>row.scope),'Mixed-profile weapon scope lost');controls++;
  const sharedWeapon=page.locator('main .weapon-row[data-card-id="datasheet-servitor-battleclade:weapon:8"] .weapon-button');
  for(let index=0;index<2;index++){
    const scope=JSON.parse(await sharedWeapon.nth(index).getAttribute('data-popup-identity'))[2];
    await sharedWeapon.nth(index).click();await page.waitForSelector('dialog.v2-detail-dialog[open]');
    assert.equal(await page.locator('dialog[open] .popup-weapon-profile').count(),1);
    assert.equal(await page.locator('dialog[open] .popup-weapon-profile').getAttribute('data-composition-id'),scope);await close();controls++;
  }
  if(process.env.ARMY_APP_V2_SCREENSHOTS){
    fs.mkdirSync(process.env.ARMY_APP_V2_SCREENSHOTS,{recursive:true});
    await page.screenshot({path:path.join(process.env.ARMY_APP_V2_SCREENSHOTS,`am06-${device}-mixed.png`),fullPage:true});
    await page.evaluate(()=>window.ArmyBookAppV2.openInstance('parsed-unit-4'));
    await page.waitForFunction(()=>document.querySelector('main .v2-current-card')?.dataset.rosterInstanceId==='parsed-unit-4');
    await page.screenshot({path:path.join(process.env.ARMY_APP_V2_SCREENSHOTS,`am06-${device}-selected.png`),fullPage:true});
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  results.push({device,controls,status:'PASS'});await context.close();
 }
 assert.deepEqual(errors,[]);assert.deepEqual(forbidden,[]);
 for(const [file,bytes]of originals)assert.deepEqual(fs.readFileSync(file),bytes,'Canonical/runtime data mutated');
 console.log(JSON.stringify({status:'PASS',AM06:'PASS',results,legacyReads:forbidden.length,canonicalFactsImmutable:true}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
