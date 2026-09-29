import {launchChromium} from '../helpers/browser-launch.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createRosterFixture} from '../helpers/roster-fixtures.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const fixtureScope=vm.createContext({window:{}});
for(const file of ['books/chaos-space-marines/scripts/roster-data.js','roster-guides/points-data.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),fixtureScope,{filename:file});
const catalog=fixtureScope.window.WH_BOOK_ROSTER_CATALOG,pointsCatalog=fixtureScope.window.WH_POINTS_CATALOG['chaos space marines'];
const legionaries=catalog.units.find(unit=>unit.id==='unit-legionaries'),chaosIconSelection=legionaries.gameSelections.selections.find(selection=>selection.id==='unit-legionaries-selection-chaos-icon'),chaosIconIds=chaosIconSelection?.wargearAbilityIds||[];
assert.equal(chaosIconIds.length,1,'Chaos Icon selection must own exactly one canonical wargear ability');
const chaosIconId=chaosIconIds[0],chaosIconAbility=legionaries.gameSelections.wargearAbilities.find(ability=>ability.id===chaosIconId);
assert.ok(chaosIconAbility?.legacyIds?.includes('unit-legionaries-wargear-ability-chaos-icon'),'Chaos Icon canonical ability must preserve its historical compatibility identity');
const fixture=(id,detachmentId,units,attachments={})=>createRosterFixture({catalog,pointsCatalog,id,detachmentId,units,attachments,factionPrefix:'Chaos - '}).record;
const types={'.css':'text/css','.html':'text/html','.js':'text/javascript','.json':'application/json','.mjs':'text/javascript','.png':'image/png','.webp':'image/webp'};
const screenshotDir=path.join(os.tmpdir(),`csm-real-front-${process.pid}`);
fs.mkdirSync(screenshotDir,{recursive:true});
const screenshots=[];
const server=http.createServer((request,response)=>{const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname),file=path.resolve(root,pathname.replace(/^\/+/, '')||'index.html');if(file!==root&&!file.startsWith(`${root}${path.sep}`)){response.writeHead(403).end();return;}try{const stat=fs.statSync(file),target=stat.isDirectory()?path.join(file,'index.html'):file;response.writeHead(200,{'content-type':types[path.extname(target)]||'application/octet-stream'});fs.createReadStream(target).pipe(response);}catch{response.writeHead(404).end();}});
await new Promise((resolve,reject)=>server.listen(0,'127.0.0.1',error=>error?reject(error):resolve()));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await launchChromium();
const attachedRecord=fixture('csm-attached','creations-of-bile',[
  {datasheetId:'unit-fabius-bile',instanceId:'parsed-unit-1',selectionIds:['unit-fabius-bile-selection-surgeon-acolytes-tools','unit-fabius-bile-selection-xyclos-needler','unit-fabius-bile-selection-rod-of-torment']},
  {datasheetId:'unit-master-of-executions',instanceId:'parsed-unit-2',selectionIds:['unit-master-of-executions-selection-axe-of-dismemberment','unit-master-of-executions-selection-bolt-pistol']},
  {datasheetId:'unit-legionaries',instanceId:'parsed-unit-3',quantity:10,selectionIds:['unit-legionaries-selection-bolt-pistol','unit-legionaries-selection-boltgun','unit-legionaries-selection-close-combat-weapon','unit-legionaries-selection-chaos-icon']},
  {datasheetId:'unit-legionaries',instanceId:'parsed-unit-4',quantity:10,selectionIds:['unit-legionaries-selection-bolt-pistol','unit-legionaries-selection-boltgun','unit-legionaries-selection-close-combat-weapon']},
],{'parsed-unit-3':['parsed-unit-1','parsed-unit-2']});
const communeRecord=fixture('csm-commune','chaos-cult',[
  {datasheetId:'unit-dark-commune',instanceId:'parsed-unit-1'},
  {datasheetId:'unit-accursed-cultists',instanceId:'parsed-unit-2',quantity:16},
],{'parsed-unit-2':['parsed-unit-1']});
const crownRecord=fixture('csm-crown','cult-of-the-arkifane',[{datasheetId:'unit-warpsmith',instanceId:'parsed-unit-1',selectionIds:['unit-warpsmith-selection-forge-weapon','unit-warpsmith-selection-flamer-tendril','unit-warpsmith-selection-melta-tendril','unit-warpsmith-weapon-family-plasma-pistol-selection'],enhancementId:'enhancement-crown-of-worms'}]);
const tzagullaRecord=fixture('csm-tzagulla','warpstrike-champions',[{datasheetId:'unit-chaos-lord-in-terminator-armour',instanceId:'parsed-unit-1',selectionIds:['unit-chaos-lord-in-terminator-armour-selection-chainfist','unit-chaos-lord-in-terminator-armour-selection-combi-bolter'],enhancementId:'enhancement-tzagulla'}]);
const bearerRecord=fixture('csm-bearer','creations-of-bile',[
  {datasheetId:'unit-chaos-lord',instanceId:'parsed-unit-1',selectionIds:['unit-chaos-lord-selection-daemon-hammer','unit-chaos-lord-weapon-family-plasma-pistol-selection'],enhancementId:'enhancement-living-carapace'},
  {datasheetId:'unit-chaos-lord',instanceId:'parsed-unit-2',selectionIds:['unit-chaos-lord-selection-daemon-hammer','unit-chaos-lord-weapon-family-plasma-pistol-selection']},
]);
const loadoutRecord=fixture('csm-loadout','devotees-of-destruction',[{datasheetId:'unit-havocs',instanceId:'parsed-unit-1',quantity:5,selectionIds:['unit-havocs-selection-astartes-chainsword','unit-havocs-weapon-family-plasma-gun-selection',{id:'unit-havocs-selection-havoc-lascannon',quantity:2},{id:'unit-havocs-selection-havoc-autocannon',quantity:2}]}]);
const renegadeFixture=createRosterFixture({catalog,pointsCatalog,id:'csm-renegade',detachmentId:'renegade-warband',factionPrefix:'Chaos - ',units:[{datasheetId:'unit-chosen',instanceId:'parsed-unit-1',quantity:5,selectionIds:['unit-chosen-selection-bolt-pistol','unit-chosen-selection-boltgun','unit-chosen-selection-accursed-weapon']}]}),renegadeRecord=renegadeFixture.record,renegadeTitle=renegadeFixture.detachments[0].title;
const arkifaneRecord=fixture('csm-arkifane','cult-of-the-arkifane',[{datasheetId:'unit-chaos-predator-destructor',instanceId:'parsed-unit-1',selectionIds:['unit-chaos-predator-destructor-selection-armoured-tracks','unit-chaos-predator-destructor-selection-predator-autocannon','unit-chaos-predator-destructor-selection-combi-bolter','unit-chaos-predator-destructor-selection-havoc-launcher']}]);
const pactboundRecord=fixture('csm-live','pactbound-zealots',[{datasheetId:'unit-legionaries',instanceId:'parsed-unit-1',quantity:5,selectionIds:['unit-legionaries-selection-bolt-pistol','unit-legionaries-selection-boltgun','unit-legionaries-selection-close-combat-weapon']}]);
const pregameRecord=fixture('csm-pregame','creations-of-bile',[{datasheetId:'unit-chosen',instanceId:'parsed-unit-1',quantity:5,selectionIds:['unit-chosen-selection-bolt-pistol','unit-chosen-selection-boltgun','unit-chosen-selection-accursed-weapon']}]);
const soulRecord=fixture('csm-soul-link','deceptors',[{datasheetId:'unit-sorcerer',instanceId:'parsed-unit-1',selectionIds:['unit-sorcerer-selection-bolt-pistol','unit-sorcerer-selection-force-weapon','unit-sorcerer-weapon-family-infernal-gaze-selection'],enhancementId:'enhancement-soul-link'}]);

async function open(saved,instanceId,canonicalId,viewport={width:390,height:844}) {
  const context=await browser.newContext({serviceWorkers:'block',viewport});
  await context.addInitScript(value=>localStorage.setItem('wh40k-rosters-v1',JSON.stringify([value])),saved);
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`${origin}/books/chaos-space-marines/reader.html?view=mobile&roster=${saved.id}&rosterInstance=${instanceId}#${canonicalId}`,{waitUntil:'networkidle'});
  await page.waitForFunction(id=>window.WH_ARMY_ROSTER_GAME_PROJECTION?.units.some(unit=>unit.identity.instanceId===id)&&document.querySelector(`.unit-card.roster-game-view[data-roster-instance="${id}"]`),instanceId);
  return{context,page,errors};
}

const state=(page,id)=>page.evaluate(instanceId=>{const unit=window.WH_ARMY_ROSTER_GAME_PROJECTION.units.find(item=>item.identity.instanceId===instanceId),card=document.querySelector(`.unit-card.roster-game-view[data-roster-instance="${instanceId}"]`),layoutVisible=node=>Boolean(node&&getComputedStyle(node).display!=='none'&&node.getBoundingClientRect().height),visible=node=>Boolean(node&&!node.hidden&&layoutVisible(node)),rows=[...card.querySelectorAll('.weapon-row:not(.weapon-head)')],ids=[...document.querySelectorAll('[id]')].map(node=>node.id);return{unit,text:card.innerText,refs:[...card.querySelectorAll('[data-roster-canonical-reference-id]')].map(node=>({id:node.dataset.rosterCanonicalReferenceId,title:node.querySelector('h5')?.textContent.trim()||'',text:node.querySelector('p')?.textContent.trim()||'',source:node.querySelector('.roster-game-ability-source')?.textContent.trim()||''})),active:card.querySelector('.roster-game-effects')?.innerText||'',darkPactPresentation:[...card.querySelectorAll('[data-ability-class="faction"] [data-term="chaos-space-marines-ability-dark-pacts"]')].map(node=>({hidden:node.hidden,display:getComputedStyle(node).display,height:node.getBoundingClientRect().height})),visibleWeapons:rows.filter(visible).map(row=>row.querySelector('.weapon-name')?.textContent.trim()||row.innerText.split('\n')[0]),hiddenWeapons:rows.filter(row=>!visible(row)).map(row=>({name:row.querySelector('.weapon-name')?.textContent.trim()||row.innerText.split('\n')[0],hidden:row.hidden,display:getComputedStyle(row).display,height:row.getBoundingClientRect().height})),composition:[...card.querySelectorAll('.unit-part')].find(part=>part.textContent.includes('Unit Composition'))?.innerText||'',mounted:document.querySelectorAll('.unit-card.roster-game-view').length,synthetic:card.querySelectorAll('[data-roster-derived-note]').length,duplicateIds:[...new Set(ids.filter((value,index)=>ids.indexOf(value)!==index))]};},id);
async function shot(page,name){const target=path.join(screenshotDir,`${name}.png`);await page.screenshot({path:target,fullPage:true});screenshots.push(target);}

try {
  const bodyView=await open(attachedRecord,'parsed-unit-3','unit-legionaries'),body=await state(bodyView.page,'parsed-unit-3');
  assert.equal(body.unit.effective.stats.T,'5');
  assert.ok(body.unit.effects.some(effect=>effect.source?.id==='chaos-space-marines-ability-enhanced-warriors'));
  assert.ok(body.refs.some(ref=>ref.id==='chaos-space-marines-ability-warp-sighted-butcher'&&ref.source==='Master of Executions'));
  assert.equal(body.synthetic,0);assert.equal(body.mounted,1);assert.deepEqual(body.duplicateIds,[]);assert.deepEqual(bodyView.errors,[]);
  await shot(bodyView.page,'01-attached-bodyguard');await bodyView.context.close();

  const duplicateView=await open(attachedRecord,'parsed-unit-4','unit-legionaries'),duplicate=await state(duplicateView.page,'parsed-unit-4');
  assert.equal(duplicate.unit.effective.stats.T,'4');
  assert.equal(duplicate.refs.some(ref=>ref.id==='chaos-space-marines-ability-warp-sighted-butcher'),false);
  await shot(duplicateView.page,'02-duplicate-isolation');await duplicateView.context.close();

  const detachedView=await open({...attachedRecord,id:'csm-detached',attachments:{}},'parsed-unit-3','unit-legionaries'),detached=await state(detachedView.page,'parsed-unit-3');
  assert.equal(detached.unit.effective.stats.T,'4');assert.equal(detached.refs.some(ref=>ref.id==='chaos-space-marines-ability-warp-sighted-butcher'),false);await detachedView.context.close();

  const communeView=await open(communeRecord,'parsed-unit-2','unit-accursed-cultists'),commune=await state(communeView.page,'parsed-unit-2');
  assert.ok(commune.refs.some(ref=>ref.id==='chaos-space-marines-ability-faithful-flock'&&ref.source==='Dark Commune'));
  assert.equal(commune.unit.effective.stats.Invulnerable,'5+');
  assert.doesNotMatch(commune.active,/Faithful Flock/);await shot(communeView.page,'03-canonical-ability');await communeView.context.close();

  const crownView=await open(crownRecord,'parsed-unit-1','unit-warpsmith'),crown=await state(crownView.page,'parsed-unit-1');
  const crownCanonical=await crownView.page.evaluate(()=>window.WH_BOOK_ROSTER_CATALOG.enhancements.find(item=>item.id==='enhancement-crown-of-worms').text.replace(/\s+/g,' ').trim());
  assert.ok(crown.text.replace(/\s+/g,' ').includes(crownCanonical));
  assert.equal(crown.unit.effects.filter(effect=>effect.source?.id==='enhancement-crown-of-worms'&&effect.operation==='reference').length,1);
  assert.equal(crown.unit.effects.filter(effect=>effect.source?.id==='enhancement-crown-of-worms'&&effect.operation==='add-range').length,3);
  assert.deepEqual(Object.fromEntries(crown.unit.effective.abilities.filter(ability=>ability.range).map(ability=>[ability.id,ability.range.effective])),{'chaos-space-marines-ability-warpsmith':6,'chaos-space-marines-ability-master-of-mechanisms':6,'chaos-space-marines-ability-enrage-machine-spirits':15});assert.equal(crown.synthetic,0);
  await shot(crownView.page,'04-crown-of-worms');await crownView.context.close();

  const tzagullaView=await open(tzagullaRecord,'parsed-unit-1','unit-chaos-lord-in-terminator-armour'),tzagulla=await state(tzagullaView.page,'parsed-unit-1');
  assert.ok(tzagulla.unit.effects.some(effect=>effect.source?.id==='enhancement-tzagulla'&&effect.operation==='add-stat'&&effect.component==='weapon'));
  assert.ok(tzagulla.refs.some(ref=>ref.id==='enhancement-tzagulla'));
  assert.equal(tzagulla.unit.effects.some(effect=>effect.source?.id==='enhancement-tzagulla'&&effect.field==='D'),false);
  await shot(tzagullaView.page,'05-tzagulla-class-c');await tzagullaView.context.close();

  const bearerView=await open(bearerRecord,'parsed-unit-1','unit-chaos-lord'),bearer=await state(bearerView.page,'parsed-unit-1');
  assert.ok(bearer.unit.effects.some(effect=>effect.source?.id==='enhancement-living-carapace'));
  const bearerEffectiveW=bearer.unit.effective.stats.W;await shot(bearerView.page,'06-bearer-only');await bearerView.context.close();
  const plainView=await open(bearerRecord,'parsed-unit-2','unit-chaos-lord'),plain=await state(plainView.page,'parsed-unit-2');
  assert.notEqual(plain.unit.effective.stats.W,bearerEffectiveW);assert.equal(plain.unit.effects.some(effect=>effect.source?.id==='enhancement-living-carapace'),false);
  await plainView.page.goto(`${origin}/books/chaos-space-marines/reader.html?view=mobile&roster=${bearerRecord.id}&rosterInstance=parsed-unit-1#unit-chaos-lord`,{waitUntil:'networkidle'});await plainView.page.waitForSelector('.unit-card.roster-game-view[data-roster-instance="parsed-unit-1"]');
  await plainView.page.goBack({waitUntil:'networkidle'});await plainView.page.waitForSelector('.unit-card.roster-game-view[data-roster-instance="parsed-unit-2"]');const backState=await state(plainView.page,'parsed-unit-2');assert.equal(backState.mounted,1);assert.equal(backState.unit.effects.some(effect=>effect.source?.id==='enhancement-living-carapace'),false);
  await plainView.page.goForward({waitUntil:'networkidle'});await plainView.page.waitForSelector('.unit-card.roster-game-view[data-roster-instance="parsed-unit-1"]');await plainView.page.reload({waitUntil:'networkidle'});await plainView.page.waitForSelector('.unit-card.roster-game-view[data-roster-instance="parsed-unit-1"]');const reloaded=await state(plainView.page,'parsed-unit-1');assert.equal(reloaded.mounted,1);assert.ok(reloaded.unit.effects.some(effect=>effect.source?.id==='enhancement-living-carapace'));await shot(plainView.page,'07-history-reload');await plainView.context.close();

  const loadoutView=await open(loadoutRecord,'parsed-unit-1','unit-havocs',{width:1280,height:900}),loadout=await state(loadoutView.page,'parsed-unit-1');
  assert.ok(loadout.visibleWeapons.some(name=>/lascannon/i.test(name)));assert.ok(loadout.visibleWeapons.some(name=>/autocannon/i.test(name)));
  assert.ok(loadout.hiddenWeapons.some(row=>/missile launcher|heavy bolter|reaper chaincannon/i.test(row.name)));
  assert.equal(loadout.hiddenWeapons.some(row=>row.display!=='none'||row.height!==0),false);
  await shot(loadoutView.page,'08-selected-weapons');await loadoutView.context.close();

  const iconView=await open(attachedRecord,'parsed-unit-3','unit-legionaries'),icon=await state(iconView.page,'parsed-unit-3');
  assert.ok(icon.unit.selection.loadout.selectedWargearAbilityIds.includes(chaosIconId));
  assert.match(icon.text,/Chaos Icon/i);await iconView.context.close();
  const noIconView=await open(attachedRecord,'parsed-unit-4','unit-legionaries'),noIcon=await state(noIconView.page,'parsed-unit-4');
  assert.equal(noIcon.unit.selection.loadout.selectedWargearAbilityIds.includes(chaosIconId),false);await noIconView.context.close();

  const renegadeView=await open(renegadeRecord,'parsed-unit-1','unit-chosen'),renegade=await state(renegadeView.page,'parsed-unit-1');
  assert.ok(renegade.refs.some(ref=>ref.id==='chaos-space-marines-detachment-rule-slaves-to-none'));
  assert.ok(renegade.unit.effects.some(effect=>effect.source?.id==='renegade-warband'));
  assert.equal(renegade.unit.effective.abilities.some(ability=>ability.id==='chaos-space-marines-ability-dark-pacts'||ability.title==='Dark Pacts'),false);
  assert.deepEqual(renegade.darkPactPresentation,[],'removed Dark Pacts ability must not retain a hidden presentation artifact');
  assert.match(renegade.active,new RegExp(`${renegadeTitle} → Dark Pacts removed`));
  assert.doesNotMatch(renegade.active,/Slaves to None/);await shot(renegadeView.page,'09-detachment-class-c');await renegadeView.context.close();

  const arkifaneView=await open(arkifaneRecord,'parsed-unit-1','unit-chaos-predator-destructor'),arkifane=await state(arkifaneView.page,'parsed-unit-1');
  assert.ok(arkifane.unit.effective.keywords.includes('DAEMON'));assert.ok(arkifane.unit.effective.keywords.includes('SOUL FORGE'));
  assert.equal(arkifane.unit.effective.stats.Invulnerable,'5+');await arkifaneView.context.close();

  const liveView=await open(pactboundRecord,'parsed-unit-1','unit-legionaries'),live=await state(liveView.page,'parsed-unit-1');
  assert.equal(live.unit.effects.some(effect=>effect.operation==='grant-tag'&&['LETHAL HITS','SUSTAINED HITS 1'].includes(effect.tag)),false);
  assert.doesNotMatch(live.active,/LETHAL HITS|SUSTAINED HITS/);await shot(liveView.page,'10-live-state-fail-closed');await liveView.context.close();

  const pregameView=await open(pregameRecord,'parsed-unit-1','unit-chosen'),pregame=await state(pregameView.page,'parsed-unit-1');
  assert.equal(pregame.unit.effects.some(effect=>/experimental|augmentation/i.test(effect.source?.id||'')),false);await pregameView.context.close();
  const soulView=await open(soulRecord,'parsed-unit-1','unit-sorcerer'),soul=await state(soulView.page,'parsed-unit-1');
  assert.equal(soul.unit.effects.some(effect=>effect.source?.id==='enhancement-soul-link'&&effect.operation!=='reference'),false);await soulView.context.close();

  const compositionView=await open(attachedRecord,'parsed-unit-4','unit-legionaries'),composition=await state(compositionView.page,'parsed-unit-4');
  assert.match(composition.text,/10 models/i);assert.doesNotMatch(composition.composition,/1 Aspiring Champion|4[–-]9 Legionaries/i);await compositionView.context.close();

  const normal=await browser.newContext({serviceWorkers:'block',viewport:{width:390,height:844}}),normalPage=await normal.newPage();await normalPage.goto(`${origin}/books/chaos-space-marines/reader.html?view=mobile#unit-legionaries`);await normalPage.waitForSelector('#unit-legionaries');const normalState=await normalPage.evaluate(()=>({game:document.querySelector('#unit-legionaries').classList.contains('roster-game-view'),derived:document.querySelectorAll('#unit-legionaries .roster-modified,#unit-legionaries [data-roster-canonical-reference-id]').length,composition:document.querySelector('#legionaries-composition')?.innerText||''}));assert.equal(normalState.game,false);assert.equal(normalState.derived,0);assert.match(normalState.composition,/Aspiring Champion|Legionaries/);await normal.close();

  console.log(`CSM production-shaped real-front conformance QA: PASS\n${JSON.stringify({engine:'Chromium (Microsoft Edge)',rawFixtures:10,scenarios:15,mobile:14,desktop:1,screenshots},null,2)}`);
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
