import {launchQaBrowser} from '../../../tests/helpers/qa-browser.cjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {allowRosterDependencies} from './roster-browser-dependencies.mjs';
import {buildApp,readAppInputs} from './app-build.mjs';
import {enumerateExpectedFacts,assertUpgradeLabelFacts} from './app-fact-oracle.mjs';
import {expectedDisplay,legacyClasses,validatePresentation} from './app-qa.mjs';

const {chromium}=createRequire(import.meta.url)('playwright');
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const screenshots=process.env.ARMY_APP_V2_SCREENSHOTS;
if(screenshots)fs.mkdirSync(screenshots,{recursive:true});
const appURL='/v2/app.html?v2=ARMY_BOOK&book=death-guard&registry=death-guard';
const app='/v2/app.html',payloadPath='/books/death-guard/v2/generated/app-presentation.json';
const inputs=readAppInputs(),payload=buildApp(inputs);
validatePresentation(payload,inputs.model,inputs.records);
const expected=enumerateExpectedFacts(inputs.model,inputs.records).map(fact=>({...fact,display:expectedDisplay(fact,inputs.model,inputs.records)}));
assert.equal(expected.length,3654+assertUpgradeLabelFacts(expected),'Original canonical census plus four official Upgrade labels');
const entities=new Map(inputs.model.entities.map(entity=>[entity.id,entity]));
const recordType=id=>inputs.records.get(id)?.recordType;
const leaderException=entity=>entity?.kind==='DATASHEET_SECTION'&&entity.data.title==='LEADER'&&entity.data.blocks.some(block=>block.text.split('\n').filter(line=>!/^This model can be attached/.test(line)&&!/^\s*-\s/.test(line)).join('\n').trim());
const isPlayerDatasheetFact=fact=>{
  const entity=entities.get(fact.entityId),kind=entity?.kind||recordType(fact.entityId),path=fact.path;
  if(kind==='DATASHEET'||kind==='PROFILE')return true;
  if(kind==='WEAPON_PROFILE')return path[0]!=='mode'&&(path[0]!=='abilities'||path.length>1);
  if(kind==='MODEL_BASE')return path[0]==='text';
  if(kind==='DATASHEET_SECTION'){
    if(path[0]==='title')return true;
    if(path[0]==='blocks'&&path[2]==='text')return entity.data.title!=='LEADER'||leaderException(entity);
    return path[0]==='qualifications'&&path.at(-1)==='sourceText';
  }
  if(['WARGEAR_OPTION','SUPPLEMENTAL_DATASHEET_RULE','WARGEAR_FOOTNOTE'].includes(kind))return path[0]==='text';
  if(kind==='RULE_REFERENCE')return path[0]==='label';
  if(kind==='WEAPON_PROFILE_SELECTION')return path[0]==='text'||path.at(-2)==='profileIds';
  if(kind==='MFM_UNIT_POINTS')return path[0]==='pointSchedules'&&(
    path[2]==='entries'&&['sourceLabel','value'].includes(path[4])||
    path[2]==='sourceLabel'&&inputs.records.get(fact.entityId).pointSchedules.length>1);
  if(kind==='MFM_PAID_UPGRADE')return ['sourceLabel','value'].includes(path[0]);
  if(kind==='MFM_LEADER_ELIGIBILITY')return path[0]==='targetUnitReferenceIds';
  return false;
};
const playerExpected=expected.filter(isPlayerDatasheetFact);
assert.equal(playerExpected.length,2281,'Player datasheet fact classification changed');

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
const browser=await launchQaBrowser(chromium,{headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
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
    await page.goto(origin+appURL);await page.waitForFunction(()=>!!window.ArmyBookAppV2?.rosterPanel);await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);

    // The ordinary player journey is intentionally curated. It must contain
    // every player fact and no source-layout, binding, empty-value or MFM
    // bookkeeping tail.
    const factsSeen=new Map();let v1Datasheets=0;
    for(const rootId of inputs.model.entities.filter(entity=>entity.kind==='DATASHEET').map(entity=>entity.id)){
      const observed=await page.evaluate(id=>{
        window.ArmyBookAppV2.open(id);
        const main=document.querySelector('main');
        return {v1:main.querySelector('.v2-current-card')?.classList.contains('unit-card')||false,
          facts:[...main.querySelectorAll('[data-fact-id]')].map(node=>({id:node.dataset.factId,value:JSON.parse(node.dataset.factValue),entityId:node.dataset.entityId,contextId:node.dataset.contextId,text:node.textContent,visible:!!node.getClientRects().length,cardId:node.closest('[data-card-id]')?.dataset.cardId||''})),
          genericTail:main.querySelectorAll('.unit-card .v2-field-sections, .unit-card .v2-fields, .unit-card .v2-field').length,
          inlineRelated:main.querySelectorAll('.unit-card .v2-compatible').length,
          relatedFooter:main.querySelectorAll('.unit-card > .ds-related-rules').length,
          overflow:document.documentElement.scrollWidth>innerWidth+1};
      },rootId);
      assert.equal(observed.overflow,false,`${device} page overflow ${rootId}`);
      assert.equal(observed.v1,true,`${device} non-V1 datasheet ${rootId}`);v1Datasheets++;
      assert.equal(observed.genericTail,0,`${device} generic source tail ${rootId}`);
      assert.equal(observed.inlineRelated,0,`${device} inline Related Rules rows ${rootId}`);
      assert.equal(observed.relatedFooter,1,`${device} missing compact Related Rules footer ${rootId}`);
      for(const fact of observed.facts){assert.ok(!factsSeen.has(fact.id),`${device} duplicate visible owner ${fact.id}`);factsSeen.set(fact.id,fact);}
    }
    assert.equal(v1Datasheets,36,`${device} V1 datasheet census`);
    const missing=playerExpected.filter(fact=>!factsSeen.has(fact.id)).map(fact=>fact.id);
    const extra=[...factsSeen.keys()].filter(id=>!playerExpected.some(fact=>fact.id===id));
    assert.equal(factsSeen.size,playerExpected.length,`${device} PLAYER_FACT_MISMATCH missing=${JSON.stringify(missing.slice(0,30))} extra=${JSON.stringify(extra.slice(0,30))}`);
    for(const fact of playerExpected){
      const observed=factsSeen.get(fact.id);assert.ok(observed,`${device} missing ${fact.id}`);
      assert.deepEqual(observed.value,fact.value,`${device} WRONG_VALUE ${fact.id}`);
      if(entities.get(fact.entityId)?.kind!=='RULE_REFERENCE'&&(entities.get(fact.entityId)?.kind!=='WEAPON_PROFILE_SELECTION'||fact.path.at(-2)!=='profileIds'))if(entities.get(fact.entityId)?.kind!=='DATASHEET_SECTION'||fact.path[0]!=='title'){
        if(entities.get(fact.entityId)?.data?.title!=='LEADER')assert.equal(observed.text,fact.display,`${device} visible WRONG_VALUE ${fact.id}`);
      }
      assert.equal(observed.entityId,fact.entityId,`${device} WRONG_IDENTITY ${fact.id}`);
      assert.equal(observed.contextId,fact.contextId,`${device} WRONG_CONTEXT ${fact.id}`);
      const factEntity=entities.get(fact.entityId),mergedSection=factEntity?.kind==='DATASHEET_SECTION'&&(factEntity.data.title==='LEADER'||['title','qualifications'].includes(fact.path[0])&&factEntity.data.title==='ABILITIES'),scheduleHeading=recordType(fact.entityId)==='MFM_UNIT_POINTS'&&fact.path[2]==='sourceLabel',expectedOwner=mergedSection?factEntity.parentId:scheduleHeading?fact.contextId:fact.entityId===inputs.model.bookId?fact.contextId:fact.entityId;
      assert.equal(observed.cardId,expectedOwner,`${device} WRONG_OWNER ${fact.id}`);
      assert.equal(observed.visible,true,`${device} hidden ${fact.id}`);
    }

    // Source inspection is an explicit QA action. It is lossless and exact,
    // but is never appended to an ordinary datasheet.
    const evidenceAll=await page.evaluate(()=>{
      window.ArmyBookAppV2.renderAllForQA();const main=document.querySelector('main');
      return [...main.querySelectorAll('[data-fact-id]')].map(node=>({id:node.dataset.factId,value:JSON.parse(node.dataset.factValue),entityId:node.dataset.entityId,contextId:node.dataset.contextId,text:node.textContent,visible:!!node.getClientRects().length,cardId:node.closest('[data-card-id]')?.dataset.cardId||''}));
    });
    const sourceIds=new Set(expected.map(fact=>fact.id)),evidence=evidenceAll.filter(fact=>sourceIds.has(fact.id));
    assert.equal(evidence.length,expected.length,`${device} source-evidence census`);
    const evidenceById=new Map();for(const fact of evidence){assert.ok(!evidenceById.has(fact.id),`${device} duplicate evidence ${fact.id}`);evidenceById.set(fact.id,fact);}
    for(const fact of expected){const observed=evidenceById.get(fact.id);assert.ok(observed,`${device} evidence missing ${fact.id}`);assert.deepEqual(observed.value,fact.value,`${device} evidence WRONG_VALUE ${fact.id}`);assert.equal(observed.text,fact.display,`${device} evidence WRONG_DISPLAY ${fact.id}`);assert.equal(observed.entityId,fact.entityId);assert.equal(observed.contextId,fact.contextId);assert.equal(observed.cardId,fact.entityId===inputs.model.bookId?fact.contextId:fact.entityId);assert.equal(observed.visible,true,`${device} hidden evidence ${fact.id}`);}

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

    // Formal Core bindings open the canonical V2 rule, never a copied V1
    // paragraph or a title/prose lookup.
    const deepStrike=shell.locator('a[data-target-id="core-deep-strike"]').first();assert.equal(await deepStrike.count(),1);
    await deepStrike.click();await page.waitForSelector('dialog.v2-detail-dialog[open]');
    const deepPopup=page.locator('dialog.v2-detail-dialog[open] [data-card-id="core-deep-strike"]');assert.equal(await deepPopup.count(),1);
    for(const field of payload.cards.find(card=>card.id==='core-deep-strike').fields){
      const node=deepPopup.locator(`[data-fact-id="${field.id}"]`);assert.equal(await node.count(),1);assert.deepEqual(JSON.parse(await node.getAttribute('data-fact-value')),field.value);
    }
    await page.getByRole('button',{name:'Close rule reference',exact:true}).click();await page.waitForSelector('dialog.v2-detail-dialog[open]',{state:'hidden'});

    // Related Rules is a compact footer action. Rows exist only while its own
    // native dialog is open and canonical references still use the detail
    // dialog above Related Rules, returning to its exact rule action.
    assert.equal(await shell.locator(':scope > .ds-related-rules .ds-related-rules-button').count(),1);
    await page.evaluate(()=>window.ArmyBookAppV2.openRelatedRules('unit-lord-of-contagion'));
    await page.waitForSelector('dialog.v2-related-dialog[open]');
    const relatedDialog=page.locator('dialog.v2-related-dialog[open]');assert.ok(await relatedDialog.locator('.v2-compatible-item').count()>0);
    assert.equal(await page.locator('main .v2-compatible-item').count(),0);
    const relatedReference=relatedDialog.locator('a.v2-reference').first();assert.ok(await relatedReference.count()>0);await relatedReference.click();
    await page.waitForSelector('dialog.v2-detail-dialog[open]');assert.equal(await page.locator('dialog.v2-related-dialog[open]').count(),1);
    await page.getByRole('button',{name:'Close rule reference',exact:true}).click();await page.waitForSelector('dialog.v2-detail-dialog[open]',{state:'hidden'});
    await relatedDialog.locator('.related-rules-close').click();

    // Multi-copy schedules stay grouped: the same model-count captions have
    // different prices in each tier and are meaningless if flattened.
    await page.evaluate(()=>window.ArmyBookAppV2.open('unit-deathshroud-terminators'));
    const costs=page.locator('main > .unit-card .ds-cost');
    for(const [index,label,values] of [[0,'YOUR 1ST TO 2ND UNITS COST',[150,305]],[1,'YOUR 3RD + UNIT COSTS',[160,315]]]){
      const heading=costs.locator(`[data-fact-id$="/pointSchedules/${index}/sourceLabel"]`);assert.equal(await heading.count(),1);assert.equal(await heading.textContent(),label);
      const tier=heading.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ds-cost-schedule ")][1]');assert.equal(await tier.count(),1);
      for(const [entry,value] of values.entries())assert.equal(JSON.parse(await tier.locator(`[data-fact-id$="/pointSchedules/${index}/entries/${entry}/value"]`).getAttribute('data-fact-value')),value);
      assert.equal(await tier.locator(`[data-fact-id*="/pointSchedules/${1-index}/entries/"]`).count(),0);
    }

    assert.equal(await page.evaluate(text=>window.ArmyBookAppV2.roster.import(text).status,mega),'READY');
    await page.evaluate(()=>{const app=window.ArmyBookAppV2,r=app.roster,s=r.snapshot();s.warlordInstanceId='parsed-unit-1';s.units.forEach(unit=>unit.warlord=unit.instanceId==='parsed-unit-1');r.load(s);r.attach('parsed-unit-1','parsed-unit-2');app.rosterPanel.refresh();app.openPersonalGuide();app.openInstance('parsed-unit-1');});
    await page.waitForFunction(()=>document.querySelector('main > .unit-card')?.dataset.rosterInstanceId==='parsed-unit-1');
    const lord=page.locator('main > .unit-card[data-roster-instance-id="parsed-unit-1"]');
    const lordText=await lord.innerText();assert.match(lordText,/Warlord/i);assert.match(lordText,/Furnace of Plagues/i);assert.match(lordText,/Leading:\s*Deathshroud Terminators/i);assert.doesNotMatch(lordText,/Deathshroud Terminators #/i);
    assert.deepEqual(new Set(await page.evaluate(()=>window.ArmyBookAppV2.roster.state.detachmentIds)),new Set(['detachment-paragons-of-putrescence','detachment-virulent-vectorium']));
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
    const captions=['Deathshroud Terminator Champion · 1 model','Deathshroud Terminator · 2 models'];
    assert.deepEqual(await shroud.locator('.model-profile > .ds-composition-scope').allTextContents(),captions,`${device} detailed profile captions`);
    assert.deepEqual((await shroud.locator('.profile-base > .ds-base-scope').allTextContents()).map(text=>text.replace(/ · $/,'')),captions,`${device} scoped Base captions`);
    for(const id of ['datasheet-deathshroud-terminators:weapon:1',...shroudWeapons]){
      assert.deepEqual(await shroud.locator(`[data-card-id="${id}"] .ds-composition-scope`).allTextContents(),captions,`${device} detailed weapon captions ${id}`);
      assert.deepEqual(await shroud.locator(`[data-card-id="${id}"] .ds-weapon-quantity`).allTextContents(),[' ×1',' ×2'],`${device} scoped quantities ${id}`);
    }
    assert.doesNotMatch(await shroud.innerText(),/parsed-unit-|\/model-row\/|\/LOADOUT\/|\/PROFILE\//,'Internal composition identity leaked');
    const scopeState=await page.evaluate(()=>({backup:window.ArmyBookAppV2.roster.snapshot(),effective:window.ArmyBookAppV2.roster.effective('parsed-unit-2')}));
    await page.evaluate(snapshot=>window.ArmyBookAppV2.roster.load(JSON.parse(JSON.stringify(snapshot))),scopeState.backup);
    assert.deepEqual(await page.evaluate(()=>window.ArmyBookAppV2.roster.effective('parsed-unit-2')),scopeState.effective,'Caption backup roundtrip altered effects');
    assert.deepEqual(await page.evaluate(()=>window.ArmyBookAppV2.roster.state.units[1].modelRows.map(row=>row.presentationLabel)),['Deathshroud Terminator Champion','Deathshroud Terminator']);
    if(screenshots){
      await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(screenshots,device+'-deathshroud-profiles.png')});
      await shroud.locator('.weapon-group').first().evaluate(node=>node.scrollIntoView({block:'start'}));await page.screenshot({path:path.join(screenshots,device+'-deathshroud-weapons.png')});
    }
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
    assert.equal(await page.locator(`dialog[open] [data-card-id="${shroudWeapons[0]}"] .ds-composition-scope`).textContent(),captions[1],'Effective popup lost composition caption');
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
    await page.reload();await page.waitForFunction(()=>!!window.ArmyBookAppV2?.rosterPanel);
    await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);
    await page.evaluate(()=>window.ArmyBookAppV2.openInstance('parsed-unit-2'));
    assert.deepEqual(await page.locator('main .model-profile > .ds-composition-scope').allTextContents(),captions,'Saved/reloaded composition captions lost');
    // Old backups lack captions. Never infer Champion ownership from quantity.
    const saved=await page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());
    await page.evaluate(snapshot=>{for(const row of snapshot.units[1].modelRows)delete row.presentationLabel;window.ArmyBookAppV2.roster.load(snapshot);window.ArmyBookAppV2.openInstance('parsed-unit-2');},structuredClone(saved));
    assert.deepEqual(await page.locator('main .model-profile > .ds-composition-scope').allTextContents(),['Composition group 1 · 1 model','Composition group 2 · 2 models']);
    assert.deepEqual(await page.evaluate(()=>window.ArmyBookAppV2.roster.effective('parsed-unit-2')),scopeState.effective,'Display captions affected roster-known semantics');
    await page.evaluate(snapshot=>{window.ArmyBookAppV2.roster.load(snapshot);window.ArmyBookAppV2.openInstance('parsed-unit-2');},saved);

    const globals=await page.evaluate(()=>({projection:typeof window.WH_ARMY_ROSTER_PROJECTION,game:typeof window.WH_ARMY_ROSTER_GAME_PROJECTION,context:typeof window.WH_ARMY_ROSTER_CONTEXT,guide:typeof window.DG_ROSTER_GUIDE,legacyRelated:typeof window.WHArmyRelatedRules}));
    assert.deepEqual(globals,{projection:'undefined',game:'undefined',context:'undefined',guide:'undefined',legacyRelated:'undefined'});
    assert.deepEqual(errors,[],`${device} browser errors`);
    results.push({device,status:'PASS',playerFacts:factsSeen.size,sourceEvidenceFacts:evidence.length,v1Datasheets,markup:'V1',megaBreakdowns:4,fnp:'PASS',physicalScopes:4,compositionCaptions:'PASS',captionRoundtrip:'PASS',legacyCaptionFallback:'PASS',popup:'EFFECTIVE',attachmentControls:2,legacyGlobals:0});
    await context.close();
  }
  assert.deepEqual(legacyRequests,[],'Legacy factual/runtime/compatibility browser read');
  assert.deepEqual(unexpected,[],'Unexpected browser dependency');
  console.log(JSON.stringify({status:'PASS',results,sourceFacts:expected.length,playerDatasheetFacts:playerExpected.length,legacyReads:0,requestedPaths:[...new Set(requests)]},null,2));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
