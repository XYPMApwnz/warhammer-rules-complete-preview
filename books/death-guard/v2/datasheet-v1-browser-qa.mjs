import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {allowRosterDependencies} from './roster-browser-dependencies.mjs';
import {buildApp,readAppInputs} from './app-build.mjs';
import {enumerateExpectedFacts} from './app-fact-oracle.mjs';
import {expectedDisplay,legacyClasses,validatePresentation} from './app-qa.mjs';

const {chromium}=createRequire(import.meta.url)('playwright');
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const app='/books/death-guard/v2/app.html',payloadPath='/books/death-guard/v2/generated/app-presentation.json';
const inputs=readAppInputs(),payload=buildApp(inputs);
validatePresentation(payload,inputs.model,inputs.records);
const expected=enumerateExpectedFacts(inputs.model,inputs.records).map(fact=>({...fact,display:expectedDisplay(fact,inputs.model,inputs.records)}));
assert.equal(expected.length,3654,'Canonical visible-fact census changed');

const allowed=new Map([[app,'text/html'],[payloadPath,'application/json'],
  ['/books/shared/army-book-app-v2/runtime.mjs','text/javascript'],['/books/shared/army-book-app-v2/glossary.mjs','text/javascript'],
  ['/books/shared/army-book-app-v2/styles.css','text/css']]);
allowRosterDependencies(allowed);
const requests=[],legacyRequests=[],unexpected=[];
const type=file=>file.endsWith('.css')?'text/css':file.endsWith('.png')?'image/png':file.endsWith('.webp')?'image/webp':'application/octet-stream';
const server=http.createServer((req,res)=>{
  const address=new URL(req.url,'http://localhost').pathname;requests.push(address);
  if(legacyClasses.some(([,pattern])=>pattern.test(address))){legacyRequests.push(address);res.writeHead(200,{'Content-Type':'application/json'});res.end('{"POISONED_LEGACY_FACT":true}');return;}
  const asset=address.startsWith('/books/death-guard/assets/unit-images/')&&fs.existsSync(path.join(repo,address.slice(1)));
  if(!allowed.has(address)&&!asset){if(address!=='/favicon.ico')unexpected.push(address);res.writeHead(404);res.end();return;}
  res.writeHead(200,{'Content-Type':allowed.get(address)||type(address),'Cache-Control':'no-store'});
  res.end(address===payloadPath?JSON.stringify(payload):fs.readFileSync(path.join(repo,address.slice(1))));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const results=[];
const normalize=value=>String(value).replace(/\s+/g,' ').trim().toUpperCase();
const mega=`+ FACTION KEYWORD: Chaos - Death Guard
+ DETACHMENT: Paragons of Putrescence, Virulent Vectorium (Hypervirulent Strains)
+ TOTAL ARMY POINTS: 285pts
+ ENHANCEMENT: Furnace of Plagues (on Char1: Lord of Contagion)
Char1: 1x Lord of Contagion (135 pts): Manreaper
Enhancement: Furnace of Plagues (+25 pts)
3x Deathshroud Terminators (150 pts)
• 1x Deathshroud Terminator Champion: Manreaper, Plaguespurt gauntlet
• 2x Deathshroud Terminator: 2 with Manreaper, Plaguespurt gauntlet`;
const lordWeapons=['datasheet-lord-of-contagion:weapon:1','datasheet-lord-of-contagion:weapon:2'];
const shroudWeapons=['datasheet-deathshroud-terminators:weapon:2','datasheet-deathshroud-terminators:weapon:3'];
const lordProfile=inputs.model.entities.find(entity=>entity.id==='unit-lord-of-contagion').data.profileIds[0];

try{
  for(const [device,viewport] of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
    const context=await browser.newContext({viewport,...(device==='phone'?{isMobile:true,hasTouch:true}:{})}),page=await context.newPage(),errors=[];
    page.setDefaultTimeout(15000);
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('404'))errors.push(message.text());});
    await page.goto(origin+app);await page.waitForFunction(()=>!!window.ArmyBookAppV2?.rosterPanel);await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);

    // Every canonical fact is still rendered through the ordinary root-entry
    // journey. This is independent of the renderer's field enumeration.
    const factsSeen=new Map(),cardsSeen=new Set();let v1Datasheets=0;
    for(const rootId of payload.groups.flatMap(group=>group.itemIds)){
      const observed=await page.evaluate(id=>{
        window.ArmyBookAppV2.open(id);
        const main=document.querySelector('main');
        return {v1:main.querySelector('.v2-current-card')?.classList.contains('unit-card')||false,
          facts:[...main.querySelectorAll('[data-fact-id]')].map(node=>({id:node.dataset.factId,value:JSON.parse(node.dataset.factValue),entityId:node.dataset.entityId,contextId:node.dataset.contextId,text:node.textContent,visible:!!node.getClientRects().length,cardId:node.closest('[data-card-id]')?.dataset.cardId||''})),
          cards:[...main.querySelectorAll('[data-card-id]')].map(node=>node.dataset.cardId),overflow:document.documentElement.scrollWidth>innerWidth+1};
      },rootId);
      assert.equal(observed.overflow,false,`${device} page overflow ${rootId}`);
      if(inputs.model.entities.find(entity=>entity.id===rootId)?.kind==='DATASHEET'){assert.equal(observed.v1,true,`${device} non-V1 datasheet ${rootId}`);v1Datasheets++;}
      for(const fact of observed.facts){assert.ok(!factsSeen.has(fact.id),`${device} duplicate visible owner ${fact.id}`);factsSeen.set(fact.id,fact);}
      observed.cards.forEach(id=>cardsSeen.add(id));
    }
    assert.equal(v1Datasheets,36,`${device} V1 datasheet census`);
    const missing=expected.filter(fact=>!factsSeen.has(fact.id)).map(fact=>fact.id);
    assert.equal(factsSeen.size,expected.length,`${device} MISSING_FROM_UI ${JSON.stringify(missing.slice(0,50))}`);
    assert.equal(cardsSeen.size,payload.cards.filter(card=>card.domain!=='CORE').length,`${device} visible card census`);
    for(const fact of expected){
      const observed=factsSeen.get(fact.id);assert.ok(observed,`${device} missing ${fact.id}`);
      assert.deepEqual(observed.value,fact.value,`${device} WRONG_VALUE ${fact.id}`);
      assert.equal(observed.text,fact.display,`${device} visible WRONG_VALUE ${fact.id}`);
      assert.equal(observed.entityId,fact.entityId,`${device} WRONG_IDENTITY ${fact.id}`);
      assert.equal(observed.contextId,fact.contextId,`${device} WRONG_CONTEXT ${fact.id}`);
      assert.equal(observed.cardId,fact.entityId===inputs.model.bookId?fact.contextId:fact.entityId,`${device} WRONG_OWNER ${fact.id}`);
      assert.equal(observed.visible,true,`${device} hidden ${fact.id}`);
    }

    await page.evaluate(()=>window.ArmyBookAppV2.open('unit-lord-of-contagion'));
    const shell=page.locator('main > article.unit-card');
    assert.equal(await shell.getAttribute('data-card-id'),'unit-lord-of-contagion');
    assert.equal(await shell.locator(':scope > .unit-header').count(),1);
    assert.ok(await shell.locator(':scope > .local-nav .local-tab').count()>=5);
    assert.equal(await shell.locator('.statline').count(),1);
    assert.equal(await shell.locator('.weapon-table .weapon-row:not(.weapon-head)').count(),2);
    assert.ok(await shell.locator('section.unit-part').count()>=5);
    const layout=await shell.evaluate(card=>{const arsenal=card.querySelector('.ds-arsenal').getBoundingClientRect(),support=card.querySelector('.ds-support').getBoundingClientRect(),nav=card.querySelector(':scope > .local-nav'),style=getComputedStyle(nav);return {arsenal:{left:arsenal.left,top:arsenal.top,width:arsenal.width},support:{left:support.left,top:support.top,width:support.width},nav:{display:style.display,position:style.position,overflowX:style.overflowX}};});
    if(device==='desktop'){assert.ok(layout.support.left>layout.arsenal.left+layout.arsenal.width/2,'Desktop arsenal/support columns collapsed');assert.ok(Math.abs(layout.support.top-layout.arsenal.top)<=1);assert.equal(layout.nav.display,'none');}
    else{assert.ok(Math.abs(layout.support.left-layout.arsenal.left)<=1,'Phone columns did not stack');assert.ok(layout.support.top>=layout.arsenal.top);assert.equal(layout.nav.position,'sticky');assert.match(layout.nav.overflowX,/auto|scroll/);}
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);

    if(device==='phone'){
      const targetId=await shell.locator('[data-datasheet-section="composition"]').getAttribute('id');
      await shell.locator(`[data-datasheet-target="${targetId}"]`).click();
      await page.waitForFunction(()=>window.ArmyBookAppV2.navigation.state.owner==='reader');
      const destination=await page.evaluate(id=>({top:document.getElementById(id).getBoundingClientRect().top,
        line:document.getElementById('appHeader').getBoundingClientRect().bottom+document.querySelector('main .local-nav').getBoundingClientRect().height+18}),targetId);
      assert.ok(Math.abs(destination.top-destination.line)<3,'V1 phone section menu hidden beneath sticky navigation');
    }

    assert.equal(await page.evaluate(text=>window.ArmyBookAppV2.roster.import(text).status,mega),'READY');
    await page.evaluate(()=>{const app=window.ArmyBookAppV2,r=app.roster,s=r.snapshot();s.warlordInstanceId='parsed-unit-1';s.units.forEach(unit=>unit.warlord=unit.instanceId==='parsed-unit-1');r.load(s);r.attach('parsed-unit-1','parsed-unit-2');app.rosterPanel.refresh();app.openPersonalGuide();app.openInstance('parsed-unit-1');});
    await page.waitForFunction(()=>document.querySelector('main > .unit-card')?.dataset.rosterInstanceId==='parsed-unit-1');
    const lord=page.locator('main > .unit-card[data-roster-instance-id="parsed-unit-1"]');
    const lordText=await lord.innerText();assert.match(lordText,/Warlord/i);assert.match(lordText,/Furnace of Plagues/i);assert.match(lordText,/Attached to Deathshroud Terminators #1/i);assert.match(lordText,/Paragons of Putrescence/i);assert.match(lordText,/Virulent Vectorium/i);
    const expectedChanges=[
      [lordWeapons[0],'attacks','6','5','1'],[lordWeapons[0],'strength','10','9','1'],
      [lordWeapons[1],'attacks','11','10','1'],[lordWeapons[1],'strength','7','6','1']
    ];
    for(const [id,field,effective,base,modifier] of expectedChanges){
      const fact=lord.locator(`[data-card-id="${id}"] [data-fact-id="${id}::/${field}"]`);assert.equal(await fact.count(),1);
      assert.equal(JSON.parse(await fact.getAttribute('data-fact-value')),effective);
      const cell=fact.locator('xpath=..');assert.equal(await cell.getAttribute('data-roster-base-value'),base);assert.equal(await cell.getAttribute('data-roster-modifier'),modifier);
      assert.match(normalize(await cell.textContent()),new RegExp(`${base}\\s*\\+\\s*${modifier}`));
    }
    const fnp=lord.locator(`[data-card-id="${lordProfile}"] [data-fact-id*="/rosterAbilities/"]`).filter({hasText:'4+'});
    assert.equal(await fnp.count(),1);assert.deepEqual(JSON.parse(await fnp.getAttribute('data-fact-value')),{name:'Feel No Pain',value:4});assert.equal(await fnp.textContent(),'4+');assert.match(normalize(await fnp.locator('xpath=..').textContent()),/FEEL NO PAIN:?\s*4\+/);
    for(const id of lordWeapons){
      const abilities=await lord.locator(`[data-card-id="${id}"] [data-fact-id*="/abilities/"]`).evaluateAll(nodes=>nodes.map(node=>JSON.parse(node.dataset.factValue).toUpperCase()));
      assert.deepEqual(new Set(abilities),new Set(['LETHAL HITS','SUSTAINED HITS 1','LANCE','DEVASTATING WOUNDS']));
    }

    // The physical/scope-aware weapon link opens the native V2 dialog with
    // the effective projection for that exact row.
    const strike=lord.locator(`[data-card-id="${lordWeapons[0]}"]`);const strikeScope=await strike.getAttribute('data-composition-id');
    await strike.locator('a[data-popup-identity]').click();await page.waitForSelector('dialog[open]');
    const popup=page.locator('dialog[open] [data-card-id="'+lordWeapons[0]+'"]');assert.equal(await popup.getAttribute('data-roster-instance-id'),'parsed-unit-1');assert.equal(await popup.getAttribute('data-composition-id'),strikeScope);
    assert.equal(JSON.parse(await popup.locator(`[data-fact-id="${lordWeapons[0]}::/attacks"]`).getAttribute('data-fact-value')),'6');
    await page.getByRole('button',{name:'Close rule reference',exact:true}).click();await page.waitForSelector('dialog[open]',{state:'hidden'});

    await page.evaluate(()=>window.ArmyBookAppV2.openInstance('parsed-unit-2'));await page.waitForFunction(()=>document.querySelector('main > .unit-card')?.dataset.rosterInstanceId==='parsed-unit-2');
    const shroud=page.locator('main > .unit-card[data-roster-instance-id="parsed-unit-2"]');
    for(const id of shroudWeapons){
      const rows=shroud.locator(`[data-card-id="${id}"]`);assert.equal(await rows.count(),2,`${device} grouped physical scope ${id}`);
      const scopes=await rows.evaluateAll(nodes=>nodes.map(node=>node.dataset.compositionId));assert.equal(new Set(scopes).size,2);
      for(let index=0;index<2;index++){
        const abilities=await rows.nth(index).locator('[data-fact-id*="/abilities/"]').evaluateAll(nodes=>nodes.map(node=>JSON.parse(node.dataset.factValue).toUpperCase()));
        assert.ok(abilities.includes('SUSTAINED HITS 1')&&abilities.includes('LANCE'));assert.equal(abilities.includes('DEVASTATING WOUNDS'),false,'Furnace leaked to Deathshroud');
      }
    }
    const shroudScope=shroud.locator(`[data-card-id="${shroudWeapons[0]}"]`).nth(1),compositionId=await shroudScope.getAttribute('data-composition-id');
    await shroudScope.locator('a[data-popup-identity]').click();await page.waitForSelector('dialog[open]');
    assert.equal(await page.locator(`dialog[open] [data-card-id="${shroudWeapons[0]}"]`).getAttribute('data-composition-id'),compositionId);
    await page.getByRole('button',{name:'Close rule reference',exact:true}).click();await page.waitForSelector('dialog[open]',{state:'hidden'});

    // Exercise the actual V2 Attachment Setup controls, not an internal
    // legacy projection or a direct service call.
    await page.evaluate(()=>window.ArmyBookAppV2.openRoster());await page.waitForSelector('main .v2-roster-instance[data-roster-instance-id="parsed-unit-2"]');
    await page.locator('main .v2-roster-instance[data-roster-instance-id="parsed-unit-2"] [data-roster-action="detach"][data-leader-instance-id="parsed-unit-1"]').click();
    await page.waitForFunction(()=>!window.ArmyBookAppV2.roster.state.attachments.length);
    await page.evaluate(()=>window.ArmyBookAppV2.openInstance('parsed-unit-1'));await page.waitForFunction(()=>document.querySelector('main > .unit-card')?.dataset.rosterInstanceId==='parsed-unit-1');
    assert.doesNotMatch(await page.locator('main > .unit-card').innerText(),/Feel No Pain\s*4\+/i);
    await page.evaluate(()=>window.ArmyBookAppV2.openRoster());await page.waitForSelector('main .v2-roster-instance[data-roster-instance-id="parsed-unit-2"]');
    const bodyguard=page.locator('main .v2-roster-instance[data-roster-instance-id="parsed-unit-2"]');await bodyguard.locator('[data-attachment-candidate-for="parsed-unit-2"]').selectOption('parsed-unit-1');await bodyguard.locator('[data-roster-action="attach"]').click();
    await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state.attachments.some(row=>row.leaderInstanceId==='parsed-unit-1'&&row.bodyguardInstanceId==='parsed-unit-2'));

    const globals=await page.evaluate(()=>({projection:typeof window.WH_ARMY_ROSTER_PROJECTION,game:typeof window.WH_ARMY_ROSTER_GAME_PROJECTION,context:typeof window.WH_ARMY_ROSTER_CONTEXT,guide:typeof window.DG_ROSTER_GUIDE,legacyRelated:typeof window.WHArmyRelatedRules}));
    assert.deepEqual(globals,{projection:'undefined',game:'undefined',context:'undefined',guide:'undefined',legacyRelated:'undefined'});
    assert.deepEqual(errors,[],`${device} browser errors`);
    results.push({device,status:'PASS',visibleFacts:factsSeen.size,v1Datasheets,markup:'V1',megaBreakdowns:4,fnp:'PASS',physicalScopes:4,popup:'EFFECTIVE',attachmentControls:2,legacyGlobals:0});
    await context.close();
  }
  assert.deepEqual(legacyRequests,[],'Legacy factual/runtime/compatibility browser read');
  assert.deepEqual(unexpected,[],'Unexpected browser dependency');
  console.log(JSON.stringify({status:'PASS',results,visibleFacts:expected.length,legacyReads:0,requestedPaths:[...new Set(requests)]},null,2));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
