import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {launchChromium} from '../helpers/browser-launch.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const index=JSON.parse(fs.readFileSync(path.join(root,'glossary/v2/generated/index.en.json'),'utf8'));
const byId=new Map(index.entries.map(entry=>[entry.id,entry]));
const enhancement='army::space-marines::enhancement::1st-company-task-force::1st-company-task-force-iron-resolve';
const stratagem='army::space-marines::stratagem::1st-company-task-force::1st-company-task-force-armour-of-contempt';
const scopedWeapon='army::adeptus-mechanicus::weapon_profile::unit-cybernetica-datasmith::unit-cybernetica-datasmith-profile-9c2ab1e5d9';
const oathCompatibilityId='space-marines-army-rule-oath-of-moment';
const oathId='army::space-marines::army_rule::army-rule-oath-of-moment';
const mortarionsHammerId='army::death-guard::detachment::detachment-mortarions-hammer';
const structuredAmIds=['army::adeptus-mechanicus::army_rule::army-rule-doctrina','army::adeptus-mechanicus::ability::datasheet-canticles-of-the-omnissiah'];
const admechUpdateId='army::adeptus-mechanicus::update::rules-updates';
const redeployId='missions::mission-sequence-redeploy-units';
const createBattlefieldId='missions::mission-sequence-create-battlefield';
const primaryMissionId='missions::primary-death-trap';
const delayingActionId='missions::primary-delaying-action';
const secondaryMissionId='missions::secondary-plunder';
const twistIds=['missions::twist-night-fighting','missions::twist-mirrored-world'];
const forceDispositionId='missions::force-disposition-disruption';
const matchupId='missions::force-disposition-matchup-disruption--priority-assets';
const deploymentIds=['missions::deployment-crucible-of-battle','missions::deployment-dawn-of-war','missions::deployment-hammer-and-anvil'];
const terrainLayoutIds=['missions::terrain-layout-disruption--disruption-a','missions::terrain-layout-priority-assets--priority-assets-b','missions::terrain-layout-purge-the-foe--reconnaissance-c'];
const compact=value=>String(value).replace(/\s+/g,' ').trim();
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
const server=createServer((request,response)=>{try{
  if(request.url==='/favicon.ico'){response.writeHead(204).end();return;}
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(request.url,'http://local').pathname));
  assert(file.startsWith(root+path.sep));if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  response.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(response);
}catch{response.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,browser=await launchChromium(),observations=[];
try{
  for(const viewport of [{name:'phone',width:390,height:844},{name:'desktop',width:1440,height:900}]){
    const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
    await page.route(/https:\/\/wahapedia\.ru\/wh40k11ed\/img\/maps\/cards\/CA7_.*\.png/,route=>route.fulfill({status:200,contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64')}));
    await page.route(/https:\/\/game-datamissions\.com\/assets\/11th\/layouts\/with-measurements\/.*\.png/,route=>route.fulfill({status:200,contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64')}));
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});

    await page.goto(`${base}/glossary/index.html`);
    await page.waitForFunction(()=>window.WH40K_GLOSSARY?.counts?.standalone===1813);
    assert.equal(await page.locator('#termCount').innerText(),'1813',`${viewport.name}: standalone browse count`);
    assert.equal(await page.locator('.term-button').count(),121,`${viewport.name}: bounded initial browse plus load-more`);
    await page.locator('#search').fill('transport');await page.waitForTimeout(180);
    const preferred=page.locator('.term-button').first();assert.match(await preferred.innerText(),/Transport Capacity/i,`${viewport.name}: preferred alias result`);
    await preferred.click();await page.locator('body.article-open').waitFor();
    assert.equal(decodeURIComponent(new URL(page.url()).hash.slice(1)),'core::core-rule-18-01-transport-capacity',`${viewport.name}: preferred alias identity`);
    await page.goBack();await page.locator('body:not(.article-open)').waitFor();

    await page.goto(`${base}/glossary/index.html`);await page.locator('#search').fill('Power fist');await page.waitForTimeout(180);
    assert((await page.locator('.term-qualifier').count())>1,`${viewport.name}: duplicate weapon labels need visible context`);
    assert.equal(new URL(page.url()).hash,'',`${viewport.name}: ambiguous label must not auto-open an arbitrary profile`);

    await page.goto(`${base}/glossary/index.html`);await page.locator('#search').fill('Oath of Moment');await page.waitForTimeout(180);
    const oathSearch=page.locator('.term-button').filter({hasText:'Oath of Moment'}).first();await oathSearch.waitFor();await oathSearch.click();await page.locator('body.article-open').waitFor();
    assert.equal(decodeURIComponent(new URL(page.url()).hash.slice(1)),oathId,`${viewport.name}: Oath search identity`);

    for(const id of [scopedWeapon,enhancement,stratagem]){
      await page.goto(`${base}/glossary/index.html#${encodeURIComponent(id)}`);await page.locator('body.article-open').waitFor();
      assert.equal(await page.locator('#termDetail h2').innerText(),byId.get(id).label,`${viewport.name}: direct V2 article ${id}`);
    }
    await page.goto(`${base}/glossary/index.html#${encodeURIComponent(redeployId)}`);await page.locator('body.article-open').waitFor();
    const redeployArticle=compact(await page.locator('#termDetail .definition').last().innerText());
    assert.match(redeployArticle,/after both armies have been deployed/i,`${viewport.name}: Redeploy timing`);
    assert.match(redeployArticle,/Starting with the Attacker, players alternate/i,`${viewport.name}: Redeploy ordering`);
    assert.match(redeployArticle,/Strategic Reserves points limit/i,`${viewport.name}: Redeploy reserve exception`);
    assert.doesNotMatch(redeployArticle,/RESOLVE_REDEPLOY|ALTERNATE_REDEPLOYS|REDEPLOY_TO_STRATEGIC_RESERVES/,`${viewport.name}: Redeploy raw operation codes hidden`);
    await page.evaluate(termId=>{const trigger=document.createElement('button');trigger.type='button';trigger.dataset.autolink='';trigger.dataset.term=termId;trigger.textContent='Redeploy Units';document.querySelector('#termDetail').append(trigger);},redeployId);
    await page.locator(`[data-autolink][data-term="${redeployId}"]`).click();const redeployPopup=page.locator('#termPopup[open]');await redeployPopup.waitFor();
    assert.equal(compact(await page.locator('#termPopupSummary').innerText()),redeployArticle,`${viewport.name}: Redeploy popup/article parity`);
    await page.locator('#termPopupClose').click();
    await page.goto(`${base}/glossary/index.html#${encodeURIComponent(createBattlefieldId)}`);await page.locator('body.article-open').waitFor();
    const battlefieldArticle=compact(await page.locator('#termDetail .definition').last().innerText());
    assert.match(battlefieldArticle,/60" by 44" battlefield/i,`${viewport.name}: battlefield size`);
    assert.match(battlefieldArticle,/on 1, 2, 3, 4, 5, use one central objective; on 6, use two central objectives, each 6" from the battlefield centre/i,`${viewport.name}: central objective roll`);
    assert.match(battlefieldArticle,/After a roll-off, players alternate placing terrain features/i,`${viewport.name}: terrain ordering`);
    assert.match(battlefieldArticle,/terrain objective at each objective point/i,`${viewport.name}: terrain objective placement`);
    assert.doesNotMatch(battlefieldArticle,/BATTLEFIELD_SIZE|CENTRAL_OBJECTIVE_ROLL|ALTERNATING_TERRAIN|TERRAIN_OBJECTIVE_AT/,`${viewport.name}: battlefield raw operation codes hidden`);
    for(const control of [
      {id:primaryMissionId,expected:/OBJECTIVE ACTION — Booby Trap[\s\S]*FAQ \/ CLARIFICATION/i},
      {id:secondaryMissionId,expected:/ELIGIBILITY[\s\S]*WHEN DRAWN[\s\S]*OBJECTIVE ACTION — Plunder[\s\S]*FAQ \/ CLARIFICATION/i}
    ]){
      await page.goto(`${base}/glossary/index.html#${encodeURIComponent(control.id)}`);await page.locator('body.article-open').waitFor();
      const article=compact(await page.locator('#termDetail .definition').last().innerText());
      assert.match(article,control.expected,`${viewport.name}: structured Mission card article ${control.id}`);
      assert.doesNotMatch(article,/SOURCE_RULE_TEXT|ADD_TO_PREVIOUS_AWARD|APPEND_CLARIFICATION/,`${viewport.name}: Mission card internal codes hidden`);
      await page.evaluate(termId=>{const trigger=document.createElement('button');trigger.type='button';trigger.dataset.autolink='';trigger.dataset.term=termId;trigger.textContent='Mission card';document.querySelector('#termDetail').append(trigger);},control.id);
      await page.locator(`[data-autolink][data-term="${control.id}"]`).click();await page.locator('#termPopup[open]').waitFor();
      assert.equal(compact(await page.locator('#termPopupSummary').innerText()),article,`${viewport.name}: Mission card popup/article parity ${control.id}`);
      await page.locator('#termPopupClose').click();
    }
    await page.goto(`${base}/glossary/index.html#${encodeURIComponent(delayingActionId)}`);await page.locator('body.article-open').waitFor();
    const delayingActionArticle=compact(await page.locator('#termDetail .definition').last().innerText());
    assert.match(delayingActionArticle,/FORCE DISPOSITION CONTEXT PLAYER: Disruption OPPONENT: Purge the Foe/i,`${viewport.name}: Delaying Action directed relation`);
    assert.match(delayingActionArticle,/CORE RULE REFERENCES 5\. End of Command Phase Level of Control/i,`${viewport.name}: Delaying Action Core references`);
    await page.locator('.connection-details > summary').click();
    for(const target of ['missions::force-disposition-disruption','missions::force-disposition-purge-the-foe','core::core-rule-08-05-end-of-command-phase','core::core-rule-14-02-level-of-control'])assert(await page.locator('.reference-card').filter({hasText:byId.get(target).label}).count(),`${viewport.name}: Delaying Action clickable target ${target}`);
    await page.locator('.reference-card').filter({hasText:byId.get('core::core-rule-14-02-level-of-control').label}).click();
    assert.equal(decodeURIComponent(new URL(page.url()).hash.slice(1)),'core::core-rule-14-02-level-of-control',`${viewport.name}: Delaying Action Core navigation identity`);
    await page.goBack();await page.locator('body.article-open').waitFor();
    assert.equal(decodeURIComponent(new URL(page.url()).hash.slice(1)),delayingActionId,`${viewport.name}: Delaying Action Back navigation identity`);
    for(const id of twistIds){
      await page.goto(`${base}/glossary/index.html#${encodeURIComponent(id)}`);await page.locator('body.article-open').waitFor();
      const article=compact(await page.locator('#termDetail .definition').last().innerText());
      if(id.endsWith('night-fighting'))assert.match(article,/not visible to enemy models unless they are within 18"[\s\S]*INDIRECT FIRE TARGETING RANGE LIMIT: 18"/i,`${viewport.name}: structured Twist article`);
      else{
        assert.match(article,/RANDOM SELECTION: D6\. Reroll results: 6\./i,`${viewport.name}: Mirrored World proven D6 metadata`);
        assert.match(article,/ROLL-TO-OPTION MAPPING: Unresolved in accepted evidence\./i,`${viewport.name}: Mirrored World evidence limitation`);
      }
      await page.evaluate(termId=>{const trigger=document.createElement('button');trigger.type='button';trigger.dataset.autolink='';trigger.dataset.term=termId;trigger.textContent='Twist';document.querySelector('#termDetail').append(trigger);},id);
      await page.locator(`[data-autolink][data-term="${id}"]`).click();await page.locator('#termPopup[open]').waitFor();
      assert.equal(compact(await page.locator('#termPopupSummary').innerText()),article,`${viewport.name}: Twist popup/article parity ${id}`);
      await page.locator('#termPopupClose').click();
    }
    for(const control of [
      {id:forceDispositionId,expected:/EFFECTIVE DETACHMENT ASSIGNMENTS[\s\S]*DIRECTED PRIMARY MISSION MATRIX[\s\S]*PLAYER: Disruption \| OPPONENT: Priority Assets \| PRIMARY MISSION: Locate and Deny/i},
      {id:matchupId,expected:/Disruption ↔ Priority Assets[\s\S]*PLAYER: Disruption \| OPPONENT: Priority Assets \| PRIMARY MISSION: Locate and Deny[\s\S]*PLAYER: Priority Assets \| OPPONENT: Disruption \| PRIMARY MISSION: Extract Relic[\s\S]*Layout A[\s\S]*Layout B[\s\S]*Layout C/i}
    ]){
      await page.goto(`${base}/glossary/index.html#${encodeURIComponent(control.id)}`);await page.locator('body.article-open').waitFor();
      const article=compact(await page.locator('#termDetail .definition').last().innerText());
      assert.match(article,control.expected,`${viewport.name}: structural Mission article ${control.id}`);
      await page.evaluate(termId=>{const trigger=document.createElement('button');trigger.type='button';trigger.dataset.autolink='';trigger.dataset.term=termId;trigger.textContent='Mission relation';document.querySelector('#termDetail').append(trigger);},control.id);
      await page.locator(`[data-autolink][data-term="${control.id}"]`).click();await page.locator('#termPopup[open]').waitFor();
      assert.equal(compact(await page.locator('#termPopupSummary').innerText()),article,`${viewport.name}: structural Mission popup/article parity ${control.id}`);
      await page.locator('#termPopupClose').click();
    }
    for(const id of deploymentIds){
      const expected=byId.get(id),registration=expected.facts.geometry.sourceRegistration;
      await page.goto(`${base}/glossary/index.html#${encodeURIComponent(id)}`);await page.locator('body.article-open').waitFor();
      const image=page.locator('#termDetail .deployment-reference img');await image.waitFor();
      assert.equal(await image.getAttribute('src'),registration.url,`${viewport.name}: ${id} registered source visual`);
      await page.waitForFunction(()=>{const image=document.querySelector('#termDetail .deployment-reference img');return image?.complete&&image.naturalWidth>0;});
      assert.equal(await image.getAttribute('alt'),`${expected.label} deployment reference`,`${viewport.name}: ${id} visual alternative text`);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),`${viewport.name}: ${id} must not cause page-wide horizontal overflow`);
      const article=compact(await page.locator('#termDetail .definition').last().innerText());
      assert.match(article,/BATTLEFIELD 60\" × 44\"\./,`${viewport.name}: ${id} battlefield dimensions`);
      assert.match(article,/remain pending digitization\./,`${viewport.name}: ${id} pending geometry status`);
      await page.evaluate(termId=>{const trigger=document.createElement('button');trigger.type='button';trigger.dataset.autolink='';trigger.dataset.term=termId;trigger.textContent='Deployment';document.querySelector('#termDetail').append(trigger);},id);
      await page.locator(`[data-autolink][data-term="${id}"]`).click();await page.locator('#termPopup[open]').waitFor();
      assert.equal(compact(await page.locator('#termPopupSummary').innerText()),article,`${viewport.name}: ${id} popup/article parity`);
      await page.locator('#termPopupClose').click();
    }
    for(const id of terrainLayoutIds){
      const expected=byId.get(id),facts=expected.facts;
      await page.goto(`${base}/glossary/index.html#${encodeURIComponent(id)}`);await page.locator('body.article-open').waitFor();
      const image=page.locator('#termDetail .terrain-layout-reference img');await image.waitFor();
      assert.equal(await image.getAttribute('src'),facts.visualReferences.measurements.url,`${viewport.name}: ${id} accepted measurements visual`);
      await page.waitForFunction(()=>{const image=document.querySelector('#termDetail .terrain-layout-reference img');return image?.complete&&image.naturalWidth>0;});
      assert.equal(await image.getAttribute('alt'),`${expected.label} measured terrain layout reference`,`${viewport.name}: ${id} visual alternative text`);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),`${viewport.name}: ${id} must not cause page-wide horizontal overflow`);
      const article=compact(await page.locator('#termDetail .definition').last().innerText());
      assert(article.includes(`LAYOUT VARIANT ${facts.variant}`),`${viewport.name}: ${id} variant`);
      assert.match(article,/BATTLEFIELD 44\" × 60\"\./,`${viewport.name}: ${id} battlefield dimensions`);
      assert(article.includes(byId.get(`missions::${facts.matchupId}`).label),`${viewport.name}: ${id} matchup`);
      assert.match(article,/remain pending digitization\./,`${viewport.name}: ${id} pending geometry status`);
      await page.evaluate(termId=>{const trigger=document.createElement('button');trigger.type='button';trigger.dataset.autolink='';trigger.dataset.term=termId;trigger.textContent='Terrain Layout';document.querySelector('#termDetail').append(trigger);},id);
      await page.locator(`[data-autolink][data-term="${id}"]`).click();await page.locator('#termPopup[open]').waitFor();
      assert.equal(compact(await page.locator('#termPopupSummary').innerText()),article,`${viewport.name}: ${id} popup/article parity`);
      await page.locator('#termPopupClose').click();
    }
    await page.goto(`${base}/glossary/index.html#${encodeURIComponent(forceDispositionId)}`);await page.locator('body.article-open').waitFor();
    await page.evaluate(()=>document.querySelector('.search-another').click());await page.locator('#search').fill('Disruption and Priority Assets');await page.waitForTimeout(180);
    await page.locator('.term-button').filter({hasText:'Disruption and Priority Assets',has:page.locator('small',{hasText:'Force Disposition Matchup'})}).click();await page.locator('body.article-open').waitFor();
    assert.equal(decodeURIComponent(new URL(page.url()).hash.slice(1)),matchupId,`${viewport.name}: Force Disposition to matchup navigation`);
    const chainLayoutId='missions::terrain-layout-disruption--priority-assets-a';
    await page.locator('.connection-details > summary').click();
    await page.locator('.reference-card').filter({hasText:byId.get(chainLayoutId).label}).click();
    assert.equal(decodeURIComponent(new URL(page.url()).hash.slice(1)),chainLayoutId,`${viewport.name}: matchup to Terrain Layout navigation`);
    await page.goBack();await page.locator('body.article-open').waitFor();
    assert.equal(decodeURIComponent(new URL(page.url()).hash.slice(1)),matchupId,`${viewport.name}: Terrain Layout Back returns to matchup`);
    await page.goto(`${base}/glossary/index.html#${encodeURIComponent(mortarionsHammerId)}`);await page.locator('body.article-open').waitFor();
    const mortarionsHammerArticle=await page.locator('#termDetail').innerText();
    assert.match(mortarionsHammerArticle,/Miasmic Bombardment/i,`${viewport.name}: Mortarion’s Hammer rule projection`);
    assert.match(mortarionsHammerArticle,/Incursion \| 1[\s\S]*Strike Force \| 2[\s\S]*Onslaught \| 3/,`${viewport.name}: Mortarion’s Hammer battle-size table`);
    for(const id of structuredAmIds){
      await page.goto(`${base}/glossary/index.html#${encodeURIComponent(id)}`);await page.locator('body.article-open').waitFor();
      const article=compact(await page.locator('#termDetail .definition').last().innerText()),facts=byId.get(id).facts;
      if(facts.openingText)assert(article.includes(compact(facts.openingText)),`${viewport.name}: ${id} article opening text`);
      for(const option of facts.options)for(const rule of [option.text,...(option.effects||[])].filter(Boolean))assert(article.includes(compact(rule)),`${viewport.name}: ${id} complete article option ${option.id}`);
    }
    await page.goto(`${base}/glossary/index.html#${encodeURIComponent(admechUpdateId)}`);await page.locator('body.article-open').waitFor();
    const admechUpdateArticle=compact(await page.locator('#termDetail .definition').last().innerText());
    assert.match(admechUpdateArticle,/ACCEPTED UPDATE — PAGE 17[\s\S]*Cyber-psalm Programming[\s\S]*RESULTING EFFECTIVE RULE[\s\S]*Add 2" to the Move characteristic/i,`${viewport.name}: AM Update page 17 resulting rule`);
    assert.match(admechUpdateArticle,/ACCEPTED UPDATE — PAGE 18[\s\S]*Belisarius Cawl[\s\S]*RESULTING EFFECTIVE RULE[\s\S]*At the start of your Command phase[\s\S]*Solar atomiser/i,`${viewport.name}: AM Update page 18 resulting rule`);
    await page.evaluate(termId=>{const trigger=document.createElement('button');trigger.type='button';trigger.dataset.autolink='';trigger.dataset.term=termId;trigger.textContent='Faction Pack Rules Updates';document.querySelector('#termDetail').append(trigger);},admechUpdateId);
    await page.locator(`[data-autolink][data-term="${admechUpdateId}"]`).click();await page.locator('#termPopup[open]').waitFor();
    assert.equal(compact(await page.locator('#termPopupSummary').innerText()),admechUpdateArticle,`${viewport.name}: AM Update popup/article parity`);
    await page.locator('#termPopupClose').click();

    await page.goto(`${base}/books/core-rules/reader/monsters-vehicles.html`);
    const coreTrigger=page.locator('[data-term="core-blast"]').first();await coreTrigger.click();await page.locator('#termDialog[open]').waitFor();
    assert.equal(await page.locator('#termDialog').getAttribute('data-open-term'),'core::core-blast',`${viewport.name}: Core click identity`);
    assert.equal(compact(await page.locator('#termSummary').innerText()),compact(byId.get('core::core-blast').facts.semanticContent),`${viewport.name}: Core popup facts`);
    await page.locator('#termClose').click();await page.locator('#searchButton').click();await page.locator('#searchInput').fill('deep strike');
    const coreSearch=page.locator('#searchResults a').filter({hasText:'DEEP STRIKE'}).first();await coreSearch.waitFor();
    assert.match(await coreSearch.getAttribute('href'),/core%3A%3Acore-deep-strike/,`${viewport.name}: Core search V2 identity`);

    await page.goto(`${base}/books/death-guard/reader.html?view=${viewport.name==='phone'?'mobile':'full'}#army-rule-nurgles-gift`);
    await page.waitForFunction(()=>Boolean(window.DG_APP?.popups));
    for(const id of ['contagion-range','afflicted','skullsquirm-blight','rattlejoint-ague','scabrous-soulrot']){
      const trigger=page.locator(`[data-glossary-v2-source="${id}"]`).first();await trigger.waitFor();
      const resolved=await trigger.getAttribute('data-term');assert.equal(resolved,`army::death-guard::army_rule_component::army-rule-nurgles-gift::${id}`,`${viewport.name}: ${id} scoped identity`);
      await trigger.click();await page.locator(`.term-popup[data-popup-term="${resolved}"]`).waitFor();
      assert.match(await page.locator(`.term-popup[data-popup-term="${resolved}"]`).innerText(),new RegExp(byId.get(resolved).label,'i'),`${viewport.name}: ${id} popup`);
      await page.keyboard.press('Escape');
    }

    await page.goto(`${base}/books/adeptus-mechanicus/reader.html?view=${viewport.name==='phone'?'mobile':'full'}#army-rule-doctrina`);
    await page.waitForFunction(()=>Boolean(window.DG_APP?.popups));
    for(const id of structuredAmIds){
      await page.evaluate(termId=>window.DG_APP.popups.open(termId,document.querySelector('.document')),id);
      const popup=page.locator(`.term-popup[data-popup-term="${id}"]`);await popup.waitFor();
      const popupText=compact(await popup.innerText()),facts=byId.get(id).facts;
      if(facts.openingText)assert(popupText.includes(compact(facts.openingText)),`${viewport.name}: ${id} popup opening text`);
      for(const option of facts.options)for(const rule of [option.text,...(option.effects||[])].filter(Boolean))assert(popupText.includes(compact(rule)),`${viewport.name}: ${id} complete popup option ${option.id}`);
      await page.keyboard.press('Escape');
    }

    await page.goto(`${base}/books/space-marines/reader.html?view=${viewport.name==='phone'?'mobile':'full'}#unit-captain-in-terminator-armour`);
    try{await page.waitForFunction(()=>Boolean(window.DG_APP?.popups),null,{timeout:8000});}catch(error){const state=await page.evaluate(()=>({href:location.href,ready:document.readyState,glossary:Boolean(window.WH40K_GLOSSARY),app:Boolean(window.DG_APP),body:document.body.innerText.slice(0,120)}));throw new Error(`${viewport.name}: Army app did not initialize: ${errors.join(' | ')||error.message}; ${JSON.stringify(state)}`);}
    const coreAbility=page.locator('#unit-captain-in-terminator-armour [data-term="core::core-deep-strike"]').first();await coreAbility.waitFor();await coreAbility.click();
    await page.locator('.term-popup[data-popup-term="core::core-deep-strike"]').waitFor();
    assert.match(await page.locator('.term-popup[data-popup-term="core::core-deep-strike"]').innerText(),/DEEP STRIKE/i,`${viewport.name}: Army Core popup`);
    await page.keyboard.press('Escape');
    const localAbility=page.locator('#unit-captain-in-terminator-armour [data-term="army::space-marines::ability::space-marines-ability-unstoppable-valour"]').first();await localAbility.waitFor();await localAbility.click();
    await page.locator('.term-popup[data-popup-term="army::space-marines::ability::space-marines-ability-unstoppable-valour"]').waitFor();
    assert.match(await page.locator('.term-popup').last().innerText(),/Unstoppable Valour/i,`${viewport.name}: local Army popup`);
    await page.keyboard.press('Escape');

    for(const book of ['space-marines','dark-angels','blood-angels']){
      await page.goto(`${base}/books/${book}/reader.html?view=${viewport.name==='phone'?'mobile':'full'}#army-rule-oath-of-moment`);
      await page.waitForFunction(()=>Boolean(window.DG_APP?.popups));
      const oathTrigger=page.locator(`[data-glossary-v2-source="${oathCompatibilityId}"]`).first();await oathTrigger.waitFor();
      assert.equal(await oathTrigger.getAttribute('data-term'),oathId,`${viewport.name}/${book}: Oath trigger identity`);
      await oathTrigger.click();const oathPopup=page.locator(`.term-popup[data-popup-term="${oathId}"]`);await oathPopup.waitFor();
      const fullEntry=oathPopup.getByRole('link',{name:'Glossary entry'});const href=await fullEntry.getAttribute('href');
      assert.equal(decodeURIComponent(new URL(href,base).hash.slice(1)),oathId,`${viewport.name}/${book}: popup/viewer identity`);
      await page.keyboard.press('Escape');
    }
    for(const control of [
      {book:'chaos-space-marines',unit:'unit-masters-of-the-maelstrom',term:'chaos-space-marines-ability-support'},
      {book:'space-marines',unit:'unit-cato-sicarius',term:'space-marines-ability-support-3'},
      {book:'space-marines',unit:'unit-wardens-of-ultramar',term:'space-marines-ability-support-4'}
    ]){
      await page.goto(`${base}/books/${control.book}/reader.html?view=${viewport.name==='phone'?'mobile':'full'}#${control.unit}`);
      await page.waitForFunction(()=>Boolean(window.DG_APP?.popups));
      const trigger=page.locator(`[data-glossary-v2-source="${control.term}"]`).first();await trigger.waitFor();
      assert.equal(await trigger.getAttribute('data-term'),'core::core-rule-19-01-forming-attached-units',`${viewport.name}/${control.term}: Core Support identity`);
      await trigger.click();const popup=page.locator('.term-popup[data-popup-term="core::core-rule-19-01-forming-attached-units"]');await popup.waitFor();
      assert.match(await popup.innerText(),/Forming Attached Units/i,`${viewport.name}/${control.term}: Core Support popup`);
      const href=await popup.getByRole('link',{name:'Glossary entry'}).getAttribute('href');
      assert.equal(decodeURIComponent(new URL(href,base).hash.slice(1)),'core::core-rule-19-01-forming-attached-units',`${viewport.name}/${control.term}: popup/viewer identity`);
      await page.keyboard.press('Escape');
    }
    observations.push({viewport:viewport.name,corePopup:true,armyPopup:true,standalone:1813,scoped:index.counts.scopedChildren});
    assert.deepEqual(errors,[],`${viewport.name}: browser errors`);await context.close();
  }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}

console.log(`Glossary V2 production browser smoke passed: ${observations.map(item=>item.viewport).join(' + ')}, Core/Army popups, browse/search/aliases, duplicate labels, Enhancement/Stratagem/scoped weapon articles.`);
