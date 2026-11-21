import {createQaEvidenceDir} from '../../../tests/helpers/qa-temp.mjs';
import {launchQaBrowser} from '../../../tests/helpers/qa-browser.cjs';
/** Selected options remain roster state/Keywords, never empty physical inventory. */
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';import {createRequire} from 'node:module';import {execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const repo=fileURLToPath(new URL('../../../',import.meta.url)),origin='http://csm-player.test';
const rootOut=process.env.CSM_BLANK_INVENTORY_SCREENSHOTS||createQaEvidenceDir('csm-inventory-');
const browser=await launchQaBrowser(chromium,{headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const baselineBytes=execFileSync('git',['show','6e6be74824deb64fd1a32762e9bc3f9b4ac68278:books/shared/army-book-app-v2/effective-datasheet-presentation.mjs'],{cwd:repo});
const results=[];
async function scenario(device,viewport){
const out=path.join(rootOut,device);fs.mkdirSync(out,{recursive:true});
const text=`+ FACTION KEYWORD: Chaos - Chaos Space Marines
+ DETACHMENT: Pactbound Zealots
+ WARLORD: Char1: Chaos Lord
Char1: 1x Chaos Lord (95 pts): Warlord, Plasma pistol, Daemon hammer, Mark: Nurgle
5x Legionaries (95 pts): Mark: Nurgle
• 1x Aspiring Champion: Bolt pistol, Boltgun, Close combat weapon, Chaos icon
• 4x Legionary: Bolt pistol, Boltgun, Close combat weapon
Char2: 1x Chaos Lord (95 pts): Plasma pistol, Power fist, Mark: Khorne`;
fs.writeFileSync(out+'/imported-roster.txt',text);const errors=[],missing=[],steps=[];
const context=await browser.newContext({viewport,serviceWorkers:'block'});
const mime={'.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.html':'text/html','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
await context.route('**/*',async route=>{const u=new URL(route.request().url()),file=path.resolve(repo,'.'+decodeURIComponent(u.pathname));if(u.origin!==origin){missing.push(u.href);await route.abort();return;}if(u.pathname==='/favicon.ico'){await route.fulfill({status:204});return;}if(!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){missing.push(u.pathname);await route.fulfill({status:404});return;}await route.fulfill({status:200,contentType:mime[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});});
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
async function ready(){await page.waitForFunction(()=>window.ArmyBookAppV2);await page.evaluate(async()=>{await WarhammerAppV2.ready;await ArmyBookAppV2.ready;await ArmyBookAppV2.rosterPanel?.ready;await document.fonts.ready;});}
async function roster(){await page.getByRole('link',{name:'Roster',exact:true}).click();await ready();await page.locator('[data-roster-view]').waitFor();}
async function effective(id){await roster();await page.locator(`[data-roster-instance-id="${id}"]`).getByRole('button',{name:'Effective datasheet',exact:true}).click();await ready();await page.locator(`main .unit-card[data-roster-instance-id="${id}"]`).waitFor();}
const markWords=['KHORNE','TZEENTCH','NURGLE','SLAANESH','CHAOS UNDIVIDED'];
async function inspect(expectedIds,label){
 const data=await page.locator('main .unit-card').evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.rosterInstanceId,text:n.innerText,
 stats:[...n.querySelectorAll('.statline')].map(s=>s.innerText),weapons:[...n.querySelectorAll('.weapon-name')].map(w=>w.innerText),
 inventoryRows:[...n.querySelectorAll('[data-selected-canonical-ids]')].map(e=>({ids:JSON.parse(e.dataset.selectedCanonicalIds),text:e.textContent.trim()})),
 abilities:[...n.querySelectorAll('.ability-list')].map(a=>a.innerText),composition:n.querySelector('[data-datasheet-section="composition"]')?.innerText,
 equipment:[...n.querySelectorAll('[data-selected-canonical-ids]')].filter(e=>JSON.parse(e.dataset.selectedCanonicalIds).some(id=>!id.includes(':weapon:'))).map(e=>({text:e.textContent.trim(),ids:JSON.parse(e.dataset.selectedCanonicalIds),owner:e.closest('[data-canonical-profile-id]')?.dataset.canonicalProfileId,visible:!!e.getClientRects().length})),
 keywordGroups:[...n.querySelectorAll('[data-datasheet-section="keywords"] p')].map(p=>({label:p.querySelector('b')?.textContent.replace(/:$/,''),words:[...p.querySelectorAll('span[data-fact-id]')].map(s=>s.textContent)})),html:n.outerHTML})));
 const physical=await page.evaluate(()=>ArmyBookAppV2.roster.projection.units.map(u=>({id:u.instanceId,keywords:u.keywords,models:u.profiles.map(p=>({id:p.id,keywords:p.keywords}))})));
 steps.push({label,url:page.url(),components:data,physical});fs.writeFileSync(out+'/observations.json',JSON.stringify(steps,null,2));
 assert.deepEqual(new Set(data.map(c=>c.id)),new Set(expectedIds),label+' physical components');
 for(const c of data){for(const item of c.inventoryRows){assert.ok(item.ids.length,'No option-only/empty inventory row');assert.ok(item.text.replace(/^\d+\s*×\s*/,'').trim(),'Every physical item has a caption');}assert.ok(c.stats.length&&c.stats.every(s=>/\d/.test(s)));assert.ok(c.weapons.length);assert.ok(c.abilities.some(a=>a.trim()));assert.match(c.composition||'',/Unit Composition/);
  const word=c.id==='parsed-unit-3'?'KHORNE':'NURGLE';const group=c.keywordGroups.find(g=>g.label==='Keywords');assert.ok(group,'Visible UNIT Keywords');assert.deepEqual(group.words.filter(w=>markWords.includes(w)),[word]);
  assert.ok(c.keywordGroups.filter(g=>g.label!=='Keywords').every(g=>!g.words.some(w=>markWords.includes(w))),'No Mark in Faction/MODEL keywords');
  if(c.id==='parsed-unit-2'){assert.match(c.text,/Legionaries/);assert.match(c.composition,/5 models/);assert.match(c.composition,/Aspiring Champion/);assert.match(c.composition,/4 × Legionary/);assert.ok(c.weapons.some(w=>/Boltgun/.test(w)));assert.ok(c.weapons.some(w=>/Close combat weapon/.test(w)));assert.equal(c.equipment.length,1);assert.equal(c.equipment[0].text,'1 × Chaos icon');assert.equal(c.equipment[0].visible,true);assert.equal(c.equipment[0].owner,'datasheet-legionaries:section:2:member:1');assert.match(c.text,/Chaos Icon:/);}
  else{assert.match(c.text,/Chaos Lord/);assert.match(c.composition,/1 model/);assert.equal(c.equipment.length,0,'Icon does not migrate to Character');assert.ok(c.weapons.some(w=>c.id==='parsed-unit-1'?/Daemon hammer/.test(w):/Power fist/.test(w)));assert.ok(c.weapons.some(w=>/Plasma pistol/.test(w)));}
 }
 for(const u of physical){assert.deepEqual(u.keywords.filter(w=>markWords.includes(w)),[u.id==='parsed-unit-3'?'KHORNE':'NURGLE'],'Mark belongs to selected physical UNIT');assert.ok(u.models.every(m=>!m.keywords.some(w=>markWords.includes(w))),'UNIT Mark never rewrites MODEL bags');}
 return data;
}
function content(cards){return cards.map(c=>({id:c.id,lines:c.text.split('\n').map(s=>s.trim()).filter(Boolean).sort()})).sort((a,b)=>a.id.localeCompare(b.id));}
async function attach(){await roster();await page.locator('[data-attachment-candidate-for="parsed-unit-2"]').selectOption('parsed-unit-1');await page.locator('[data-attachment-target-instance-id="parsed-unit-2"] [data-roster-action="attach"]').click();await page.waitForFunction(()=>ArmyBookAppV2.roster.state.attachments.length===1);await ready();}
try{
 await page.goto(origin+'/v2/app.html');await page.waitForSelector('a[href*="v2=ROSTER"]');await page.getByRole('link',{name:'Roster',exact:true}).click();await page.locator('main a[data-v2-book="chaos-space-marines"]').click();await ready();
 await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);await page.getByRole('button',{name:'Import roster',exact:true}).click();await page.waitForFunction(()=>ArmyBookAppV2.roster.state?.units.length===3);await ready();await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
 await page.screenshot({path:out+'/01-roster-imported.png'});fs.writeFileSync(out+'/import-ui.txt',await page.locator('main').innerText());
 await effective('parsed-unit-1');await inspect(['parsed-unit-1'],'independent Character');await effective('parsed-unit-2');await inspect(['parsed-unit-2'],'independent Bodyguard');await effective('parsed-unit-3');await inspect(['parsed-unit-3'],'independent Khorne control');
 await attach();await effective('parsed-unit-2');const formed=await inspect(['parsed-unit-1','parsed-unit-2'],'attached Effective Datasheet');await page.screenshot({path:out+'/02-effective-formed.png',fullPage:true});
 await roster();await page.getByRole('button',{name:'Open personal guide',exact:true}).click();await page.locator('main h1').filter({hasText:'Personal guide'}).waitFor();await page.screenshot({path:out+'/03-personal-guide.png'});await page.locator('main a[data-target-id="roster-unit/parsed-unit-2"]').click();await ready();const guide=await inspect(['parsed-unit-1','parsed-unit-2'],'Personal Guide unit');assert.deepEqual(content(guide),content(formed),'Guide preserves complete displayed content');await page.screenshot({path:out+'/03a-personal-guide-formed.png',fullPage:true});
 await page.reload();await ready();const reload=await inspect(['parsed-unit-1','parsed-unit-2'],'reload');assert.deepEqual(content(reload),content(formed));
 await roster();await page.locator('[data-roster-action="detach"][data-leader-instance-id="parsed-unit-1"]').click();await page.waitForFunction(()=>ArmyBookAppV2.roster.state.attachments.length===0);await effective('parsed-unit-2');await inspect(['parsed-unit-2'],'detached Bodyguard');await effective('parsed-unit-1');await inspect(['parsed-unit-1'],'detached Character');
 await attach();await effective('parsed-unit-2');const restored=await inspect(['parsed-unit-1','parsed-unit-2'],'reattached Effective Datasheet');assert.deepEqual(content(restored),content(formed),'Reattach restores same displayed content');
 await page.reload();await ready();await inspect(['parsed-unit-1','parsed-unit-2'],'reattached reload');await effective('parsed-unit-3');await inspect(['parsed-unit-3'],'Khorne control after reattach');await roster();await page.locator('[data-roster-action="detach"][data-leader-instance-id="parsed-unit-1"]').waitFor();await page.screenshot({path:out+'/04-returned-roster.png'});
 // Real baseline application bytes must reproduce the blank row, while the
 // current runtime state/effects stay identical. No state or DOM substitution.
 const finalState=await page.evaluate(()=>({state:ArmyBookAppV2.roster.snapshot(),projection:ArmyBookAppV2.roster.projection}));
 const previous=await browser.newContext({viewport,serviceWorkers:'block'});
 await previous.route('**/*',async route=>{const u=new URL(route.request().url()),file=path.resolve(repo,'.'+decodeURIComponent(u.pathname));
  if(u.origin!==origin||!file.startsWith(path.resolve(repo)+path.sep)){missing.push(u.href);await route.abort();return;}
  if(u.pathname==='/favicon.ico'){await route.fulfill({status:204});return;}
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){missing.push(u.pathname);await route.fulfill({status:404});return;}
  await route.fulfill({status:200,contentType:mime[path.extname(file)]||'application/octet-stream',body:u.pathname==='/books/shared/army-book-app-v2/effective-datasheet-presentation.mjs'?baselineBytes:fs.readFileSync(file)});
 });
 const old=await previous.newPage();old.on('pageerror',e=>errors.push(e.message));old.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await old.goto(origin+'/v2/app.html');await old.getByRole('link',{name:'Roster',exact:true}).click();await old.locator('main a[data-v2-book="chaos-space-marines"]').click();
 await old.waitForFunction(()=>window.ArmyBookAppV2);await old.evaluate(()=>ArmyBookAppV2.rosterPanel.ready);
 await old.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);await old.getByRole('button',{name:'Import roster',exact:true}).click();
 await old.waitForFunction(()=>ArmyBookAppV2.roster.state?.units.length===3);
 await old.locator('[data-attachment-candidate-for="parsed-unit-2"]').selectOption('parsed-unit-1');await old.locator('[data-attachment-target-instance-id="parsed-unit-2"] [data-roster-action="attach"]').click();
 await old.waitForFunction(()=>ArmyBookAppV2.roster.state.attachments.length===1);
 assert.deepEqual(await old.evaluate(()=>({state:ArmyBookAppV2.roster.snapshot(),projection:ArmyBookAppV2.roster.projection})),finalState,'No import/effect/gameplay delta');
 await old.locator('[data-roster-instance-id="parsed-unit-2"]').getByRole('button',{name:'Effective datasheet',exact:true}).click();
 await old.waitForSelector('main .unit-card[data-roster-instance-id="parsed-unit-2"]');
 const empty=await old.locator('main [data-selected-canonical-ids="[]"]').allTextContents();assert.ok(empty.length>0,'Regression control must detect original defect');assert.ok(empty.every(t=>/^1\s*×\s*$/.test(t)));
 await previous.close();
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);fs.writeFileSync(out+'/result.json',JSON.stringify({status:'USER_SCENARIO_PASS',transport:'Actual application static bytes; not live hosting',steps:steps.map(({components,...s})=>({...s,components:components.map(c=>c.id)})),errors,missing},null,2));results.push({device,status:'PASS',steps:steps.length,emptyInventoryRows:0,marksAndOwners:'PASS',semanticBaselineEquality:true,baselineDefectDetected:true,errors,missing,evidence:out});
}catch(e){fs.writeFileSync(out+'/failure.json',JSON.stringify({message:e.message,url:page.url(),errors,missing,body:await page.locator('body').innerText()},null,2));await page.screenshot({path:out+'/failure.png',fullPage:true});throw e;}finally{await context.close();}
}
try{for(const [device,viewport] of [['desktop',{width:1440,height:900}],['phone',{width:390,height:844}]])await scenario(device,viewport);
console.log(JSON.stringify({status:'PASS',transport:'real static application bytes; not live hosting',results}));}finally{await browser.close();}
