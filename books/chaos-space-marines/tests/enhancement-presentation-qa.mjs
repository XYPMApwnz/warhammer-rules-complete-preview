import {launchQaBrowser} from '../../../tests/helpers/qa-browser.cjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const mime={'.css':'text/css','.html':'text/html','.js':'text/javascript','.json':'application/json','.mjs':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp'};
const server=http.createServer((request,response)=>{
  const requested=decodeURIComponent(new URL(request.url,'http://localhost').pathname),file=path.resolve(root,`.${requested==='/'?'/index.html':requested}`);
  if(requested==='/favicon.ico'){response.writeHead(204).end();return;}
  if(!file.startsWith(root)||!fs.existsSync(file)||!fs.statSync(file).isFile()){response.writeHead(404).end('Not found');return;}
  response.setHeader('content-type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(response);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,browser=await launchQaBrowser(chromium,{channel:'chrome',headless:true});
const unit='Chaos Lord with Jump Pack',cardId='unit-chaos-lord-with-jump-pack',route='chaos-lord-with-jump-pack';
const nightmare={detachment:'Nightmare Hunt',ruleId:'enhancement-nightmare-hunt-warp-fuelled-thrusters',text:/opponent.s Fight phase/i};
const dread={detachment:'Dread Talons',ruleId:'enhancement-dread-talons-warp-fuelled-thrusters',text:/opponent.s turn/i};
const effects=[
  {title:'Touched by the Warp',detachment:'Cabal of Chaos',unit:'Chaos Lord',points:90,effect:'psyker-psychic-weapons',kind:'keywords-weapons'},
  {title:'Conduit of Chaos',detachment:'Cabal of Chaos',unit:'Heretic Astartes Daemon Prince',points:180,effect:'melee-lance',kind:'melee-tag',tag:'LANCE'},
  {title:'Crown of Worms',detachment:'Cult of the Arkifane',unit:'Warpsmith',points:60,effect:'ability-range-plus-3',kind:'note',note:/(?:\+|Add )3[”"].*Warpsmith.*Master of Mechanisms.*Enrage Machine Spirits/i},
  {title:'Surgical Precision',detachment:'Creations of Bile',unit:'Chaos Lord',points:90,effect:'melee-precision',kind:'melee-tag',tag:'PRECISION'},
  {title:'Living Carapace',detachment:'Creations of Bile',unit:'Chaos Lord',points:90,effect:'wounds-plus-1-feel-no-pain-5',kind:'wounds-fnp'},
  {title:'Cursed Fang',detachment:'Deceptors',unit:'Chaos Lord',points:90,effect:'melee-ap-plus-1-precision',kind:'melee-ap-precision'},
  {title:'Shroud of Obfuscation',detachment:'Deceptors',unit:'Chaos Lord',points:90,effect:'stealth-lone-operative',kind:'abilities'},
  {title:'Iron Artifice',detachment:'Fellhammer Siege-host',unit:'Chaos Lord',points:90,effect:'anti-vehicle-fortification-4',kind:'all-tags'},
  {title:'Invigorated Mechatendrils',detachment:'Soulforged Warpack',unit:'Warpsmith',points:60,effect:'move-plus-4',kind:'move'},
  {title:'Shadowcowl Talisman',detachment:'Murdertalon Raiders',unit:'Chaos Lord with Jump Pack',points:80,effect:'unit-invulnerable-save-5',kind:'invulnerable',note:/CHAOS LORD WITH JUMP PACK model only.*5\+ InSv/i},
  {title:'Pact of Cursed Pinions',detachment:'Murdertalon Raiders',unit:'Chaos Lord with Jump Pack',points:80,effect:'daemon-melee-attacks-plus-1',kind:'daemon-attacks'},
  {title:'Tzagulla',detachment:'Warpstrike Champions',unit:'Chaos Lord in Terminator Armour',points:85,effect:'weapons-attacks-strength-ap-plus-1',kind:'all-stats'}
];

const rosterSource=({detachments=[nightmare.detachment],enhancement=true,second=false,unresolved=false})=>`+ FACTION KEYWORD: Chaos - Chaos Space Marines
+ DETACHMENT: ${detachments.join('\n+ DETACHMENT: ')}
+ TOTAL ARMY POINTS: ${80*(second?2:1)+(enhancement?20:0)}pts
${unresolved?'+ ENHANCEMENT: Warp-fuelled Thrusters (on Char9: Missing Owner)\n':''}Char1: 1x ${unit} (80 pts)
${enhancement&&!unresolved?'Enhancement: Warp-fuelled Thrusters (+20 pts)\n':''}${second?`Char2: 1x ${unit} (80 pts)\n`:''}`;

async function savedRoster(page,source){
  await page.goto(`${base}/roster-guides/index.html`);
  await page.locator('#roster-input').fill(source);await page.locator('#roster-form button[type="submit"]').click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('wh40k-rosters-v1')||'[]').length===1);
  return page.evaluate(()=>JSON.parse(localStorage.getItem('wh40k-rosters-v1'))[0].id);
}
const article=page=>page.locator(`#${cardId} .roster-enhancement`);
async function openDesktop(page,id){
  await page.goto(`${base}/books/chaos-space-marines/reader.html?roster=${id}#${cardId}`);
  await page.locator(`#${cardId}[data-roster-selected="true"]`).waitFor();
  await page.locator(`[data-nav-target="${cardId}"]`).evaluate(node=>node.click());
  await page.waitForFunction(id=>window.DG_APP?.navigation?.active===id,cardId);
}
async function assignedCompatibleIds(page){
  await page.locator(`#${cardId} .related-rules-trigger`).click();
  await page.locator('.related-rules-layer:not([hidden])').waitFor();
  await page.locator('.related-rules-layer .full-related-content').waitFor();
  const tab=page.locator('.related-rules-layer [data-kind="enhancements"]');if(await tab.isVisible())await tab.click();
  return page.locator('.related-rules-layer .enhancement:not([hidden])').evaluateAll(nodes=>nodes.map(node=>node.dataset.ruleId).sort());
}
const guideEnhancementIds=(page,canonicalUnitId)=>page.evaluate(id=>{const guide=window.CSM_ROSTER_GUIDE,instances=new Set((guide?.units||[]).filter(unit=>unit.canonicalDatasheetId===id).map(unit=>unit.instanceId));return(guide?.enhancements||[]).filter(item=>item.active&&instances.has(item.ownerUnitId)).map(item=>item.id);},canonicalUnitId);
async function identity(candidate,other){
  const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1280,height:900}}),page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(String(error)));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  const id=await savedRoster(page,rosterSource({detachments:[candidate.detachment]}));
  await openDesktop(page,id);
  assert.equal(await article(page).getAttribute('data-roster-enhancement-rule-id'),candidate.ruleId);
  assert.match(await article(page).innerText(),/Warp-fuelled Thrusters[\s\S]*20 pts included/i);assert.match(await article(page).innerText(),candidate.text);
  assert.equal(await page.locator(`#${cardId} [data-roster-derived-effect]`).count(),0);
  assert.deepEqual(await guideEnhancementIds(page,cardId),[candidate.ruleId]);
  assert.deepEqual(await assignedCompatibleIds(page),[candidate.ruleId]);
  assert.equal(await page.locator(`.related-rules-layer [data-rule-id="${other.ruleId}"]:visible`).count(),0);
  await page.locator('.related-rules-layer .related-rules-close').click();
  await page.locator('[data-view-switch]').click();await page.waitForURL(url=>url.pathname.endsWith('/reader.html')&&url.searchParams.get('roster')===id&&url.hash===`#${cardId}`);
  await page.setViewportSize({width:390,height:844});await page.locator(`#${cardId}[data-roster-selected="true"]`).waitFor();
  assert.equal(await article(page).getAttribute('data-roster-enhancement-rule-id'),candidate.ruleId);assert.match(await article(page).innerText(),candidate.text);
  assert.equal(await page.locator(`#${cardId} [data-roster-derived-effect]`).count(),0);
  assert.equal(errors.length,0,`${candidate.detachment} console errors: ${errors.join(' | ')}`);await context.close();
}
const slug=value=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const loadouts={
  'Chaos Lord':'Daemon hammer, Plasma pistol',
  'Heretic Astartes Daemon Prince':'Hellforged weapons, Infernal cannon',
  Warpsmith:'Flamer tendril, Forge weapon, Melta tendril, Plasma pistol',
  'Chaos Lord with Jump Pack':'Power fist, Plasma pistol',
  'Chaos Lord in Terminator Armour':'Combi-bolter, Exalted weapon'
};
const changed=(base,value,amount)=>{const inches=base.endsWith('"'),raw=inches?base.slice(0,-1):base,match=raw.match(/^(\d*D\d+)([+-]\d+)?$/i);if(/^-?\d+$/.test(raw))return value===`${Number(raw)+amount}${inches?'"':''}`;if(!match)return false;const bonus=Number(match[2]||0)+amount;return value===`${match[1]}${bonus>0?`+${bonus}`:bonus<0?bonus:''}${inches?'"':''}`;};
async function verifyMutation(page,candidate,card){
  const scope=`#${card}`,article=page.locator(`${scope} [data-roster-enhancement="${slug(candidate.title).replace(/-/g,' ')}"]`);
  const canonicalId=`enhancement-${slug(candidate.title)}`;
  assert.equal(await article.getAttribute('data-roster-canonical-enhancement-id'),canonicalId);assert.match(await article.innerText(),new RegExp(candidate.title,'i'));
  assert.ok(await page.locator(scope).evaluate((node,id)=>window.WH_ARMY_ROSTER_GAME_PROJECTION.units.find(unit=>unit.identity.canonicalDatasheetId===node.id)?.effects.some(effect=>effect.canonicalReference?.id===id||effect.source?.id===id),canonicalId));
  if(candidate.note)assert.match(await article.innerText(),candidate.note);
  if(candidate.kind==='note-only')assert.equal(await page.locator(`${scope} .roster-modified, ${scope} .roster-derived-keyword, ${scope} .roster-derived-ability`).count(),0);
  if(candidate.kind==='keywords-weapons'){assert.equal(await page.locator(`${scope} [id$="-keywords"] .keyword-list`).getByText('PSYKER',{exact:true}).count(),1);assert.equal(await page.locator(`${scope} .weapon-row:not(.weapon-head)`).evaluateAll(rows=>{const selected=rows.filter(row=>!row.hidden&&getComputedStyle(row).display!=='none');return selected.length>0&&selected.every(row=>/PSYCHIC/i.test(row.querySelector('.weapon-tags')?.textContent||''));}),true);}
  if(candidate.kind==='melee-tag')assert.equal(await page.locator(`${scope} .weapon-group`).filter({has:page.locator('h5', {hasText:/^Melee Weapons$/i})}).locator('.weapon-row:not(.weapon-head):not([hidden])').evaluateAll((rows,tag)=>rows.length>0&&rows.every(row=>new RegExp(tag,'i').test(row.querySelector('.weapon-tags')?.textContent||'')),candidate.tag),true);
  if(candidate.kind==='wounds-fnp'){const stat=page.locator(`${scope} .stat[data-source-field="stats.W"] span`);assert.equal(changed(await stat.getAttribute('data-roster-base-value'),await stat.textContent(),1),true);assert.equal(await page.locator(scope).evaluate(node=>window.WH_ARMY_ROSTER_GAME_PROJECTION.units.find(unit=>unit.identity.canonicalDatasheetId===node.id)?.effective.abilities.some(ability=>ability.title==='Feel No Pain 5+')),true);}
  if(candidate.kind==='melee-ap-precision'){const rows=page.locator(`${scope} .weapon-group`).filter({has:page.locator('h5',{hasText:/^Melee Weapons$/i})}).locator('.weapon-row:not(.weapon-head):not([hidden])');assert.equal(await rows.evaluateAll((nodes)=>nodes.length>0&&nodes.every(row=>{const cell=row.querySelector('[data-label="AP"]');return cell?.dataset.rosterBaseValue&&Number(cell.textContent)===Number(cell.dataset.rosterBaseValue)-1&&/PRECISION/i.test(row.querySelector('.weapon-tags')?.textContent||'');})),true);}
  if(candidate.kind==='abilities'){assert.equal(await page.locator(scope).evaluate(node=>{const abilities=window.WH_ARMY_ROSTER_GAME_PROJECTION.units.find(unit=>unit.identity.canonicalDatasheetId===node.id)?.effective.abilities||[];return['Stealth','Lone Operative'].every(label=>abilities.some(ability=>ability.title===label));}),true);}
  if(candidate.kind==='all-tags')assert.equal(await page.locator(`${scope} .weapon-row:not(.weapon-head):not([hidden])`).evaluateAll(rows=>rows.length>0&&rows.every(row=>/ANTI-VEHICLE 4\+/i.test(row.querySelector('.weapon-tags')?.textContent||'')&&/ANTI-FORTIFICATION 4\+/i.test(row.querySelector('.weapon-tags')?.textContent||''))),true);
  if(candidate.kind==='move'){const stat=page.locator(`${scope} .stat[data-source-field="stats.M"] span`);assert.equal(changed(await stat.getAttribute('data-roster-base-value'),await stat.textContent(),4),true);}
  if(candidate.kind==='daemon-attacks'){assert.equal(await page.locator(`${scope} [id$="-keywords"] .keyword-list`).getByText('DAEMON',{exact:true}).count(),1);assert.equal(await page.locator(`${scope} .weapon-group`).filter({has:page.locator('h5',{hasText:/^Melee Weapons$/i})}).locator('.weapon-row:not(.weapon-head):not([hidden]) [data-label="A"][data-roster-base-value]').evaluateAll(nodes=>nodes.length>0&&nodes.every(node=>{const raw=node.dataset.rosterBaseValue,match=raw.match(/^(\d*D\d+)([+-]\d+)?$/i);return /^\d+$/.test(raw)?Number(node.textContent)===Number(raw)+1:match&&node.textContent===`${match[1]}+${Number(match[2]||0)+1}`;})),true);}
  if(candidate.kind==='all-stats')assert.equal(await page.locator(`${scope} .weapon-row:not(.weapon-head):not([hidden])`).evaluateAll(rows=>rows.length>0&&rows.every(row=>['A','S','AP'].every(field=>row.querySelector(`[data-label="${field}"]`)?.dataset.rosterBaseValue))),true);
}
async function effectSmoke(candidate){
  const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1280,height:900}}),page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(String(error)));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  const source=`+ FACTION KEYWORD: Chaos - Chaos Space Marines\n+ DETACHMENT: ${candidate.detachment}\n+ TOTAL ARMY POINTS: ${candidate.points+20}pts\nChar1: 1x ${candidate.unit} (${candidate.points} pts): ${loadouts[candidate.unit]}\nEnhancement: ${candidate.title} (+20 pts)\n`,id=await savedRoster(page,source),card=`unit-${slug(candidate.unit)}`,route=slug(candidate.unit);
  await page.goto(`${base}/books/chaos-space-marines/reader.html?roster=${id}#${card}`);await page.locator(`#${card}[data-roster-selected="true"]`).waitFor();await page.locator(`[data-nav-target="${card}"]`).evaluate(node=>node.click());await verifyMutation(page,candidate,card);
  const switchLink=page.locator('[data-view-switch]');await switchLink.click();await page.waitForURL(url=>url.pathname.endsWith('/reader.html')&&url.searchParams.get('roster')===id&&url.hash===`#${card}`);await page.setViewportSize({width:390,height:844});await page.locator(`#${card}[data-roster-selected="true"]`).waitFor();await verifyMutation(page,candidate,card);
  assert.equal(errors.length,0,`${candidate.title} console errors: ${errors.join(' | ')}`);await context.close();
}

try{
  await identity(nightmare,dread);await identity(dread,nightmare);
  for(const candidate of effects)await effectSmoke(candidate);

  const duplicate=await browser.newContext({serviceWorkers:'block'}),duplicatePage=await duplicate.newPage();
  let id=await savedRoster(duplicatePage,rosterSource({second:true}));
  for(const target of [`${base}/books/chaos-space-marines/reader.html?roster=${id}#${cardId}`,`${base}/books/chaos-space-marines/mobile/${route}.html?roster=${id}`]){
    await duplicatePage.goto(target);await duplicatePage.locator(`#${cardId}[data-roster-selected="true"]`).waitFor();if(target.includes('/mobile/'))assert.match(duplicatePage.url(),/\/reader\.html\?roster=/);
    const duplicateState=await duplicatePage.evaluate(({cardId,ruleId})=>{const units=window.WH_ARMY_ROSTER_GAME_PROJECTION.units.filter(unit=>unit.identity.canonicalDatasheetId===cardId);return{units:units.length,effectOwners:units.filter(unit=>unit.effects.some(effect=>effect.canonicalReference?.id===ruleId||effect.source?.id===ruleId)).length};},{cardId,ruleId:nightmare.ruleId});
    assert.deepEqual(duplicateState,{units:2,effectOwners:1});assert.equal(await duplicatePage.locator(`#${cardId} [data-roster-derived-effect]`).count(),0);
  }
  await duplicate.close();

  const safety=await browser.newContext({serviceWorkers:'block'}),safetyPage=await safety.newPage();
  id=await savedRoster(safetyPage,rosterSource({unresolved:true}));await openDesktop(safetyPage,id);
  assert.equal(await article(safetyPage).count(),0);assert.equal(await safetyPage.locator(`#${cardId} [data-roster-derived-effect]`).count(),0);
  assert.deepEqual(await guideEnhancementIds(safetyPage,cardId),[]);
  await safety.close();

  const ambiguous=await browser.newContext({serviceWorkers:'block'}),ambiguousPage=await ambiguous.newPage();
  id=await savedRoster(ambiguousPage,rosterSource({detachments:[nightmare.detachment,dread.detachment]}));await openDesktop(ambiguousPage,id);
  assert.equal(await ambiguousPage.locator(`#${cardId} [data-roster-enhancement-rule-id]`).count(),0);
  assert.deepEqual(await guideEnhancementIds(ambiguousPage,cardId),[]);
  assert.deepEqual(await assignedCompatibleIds(ambiguousPage),[]);await ambiguous.close();

  const unassigned=await browser.newContext({serviceWorkers:'block'}),unassignedPage=await unassigned.newPage();
  id=await savedRoster(unassignedPage,rosterSource({enhancement:false}));await openDesktop(unassignedPage,id);
  assert.equal(await article(unassignedPage).count(),0);assert.deepEqual(await assignedCompatibleIds(unassignedPage),[]);await unassigned.close();
  console.log('CSM Enhancement QA passed: 12 classified effects, qualified identity, Desktop/Phone bearer presentation, duplicate, unresolved, ambiguous and unassigned safety.');
}finally{
  await browser.close();await new Promise(resolve=>server.close(resolve));
}
