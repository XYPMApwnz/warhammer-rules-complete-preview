/** Main Unified V2 real application bytes. All changes use visible UI controls.
 * evaluate calls inspect state/geometry only. No fake DOM or storage writes. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {isApplicationTestDependency} from '../../shared/application-v2/browser-test-dependencies.mjs';
import {fixtures,pairs,make,captureStatus} from './roster-ui-fixtures.mjs';
import {buildTyranidsImportBook} from './roster-import-build.mjs';
import {createTyranidsRosterImport} from './roster-import.mjs';
const importBook=buildTyranidsImportBook();
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const out=process.env.TYRANIDS_V2_SCREENSHOTS||'E:/Warhammer/qa-artifacts/tyranids-v2-unified-browser';
fs.mkdirSync(out,{recursive:true});
const entry='/v2/app.html';
const books=['death-guard','adeptus-mechanicus','chaos-space-marines','emperors-children','tyranids'];
const allowed=url=>isApplicationTestDependency(url)||/^\/books\/adeptus-mechanicus\/assets\/unit-images\/[a-z0-9-]+\.webp$/.test(url)||['/books/adeptus-mechanicus/assets/mechanicus-logo.png','/books/adeptus-mechanicus/assets/mechanicus-cover-800.webp'].includes(url)||/^\/books\/chaos-space-marines\/assets\/source-die-[1-6]\.png$/.test(url)||/^\/books\/death-guard\/assets\/unit-images\/[a-z0-9-]+\.png$/.test(url)||/^\/v2\/[\w./-]+\.(?:html|mjs|css)$/.test(url)||
 /^\/books\/(?:death-guard|adeptus-mechanicus|chaos-space-marines|emperors-children|tyranids)\/v2\/[\w./-]+\.(?:html|mjs|json|css)$/.test(url)||
 /^\/books\/(?:chaos-space-marines|emperors-children|tyranids)\/assets\/(?:chaos-space-marines|emperors-children|tyranids)-cover-(?:480|800)\.webp$/.test(url)||
 /^\/books\/shared\/(?:application-v2|army-book-app-v2|roster-v2|rule-contract-v2)\/[\w./-]+\.(?:mjs|css|json)$/.test(url)||
 /^\/books\/shared\/(?:datasheet-system|unit-art)\.css$/.test(url)||/^\/assets\/[\w./-]+\.(?:webp|png|jpe?g|svg|woff2)$/.test(url);
for(const url of ['/books/tyranids/scripts/data.js','/books/tyranids/sources/corpus.json','/books/tau-empire/v2/registration.mjs','/books/tyranids/assets/unknown.webp'])assert.equal(allowed(url),false);
const missing=[],forbidden=[],errors=[],results=[];
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost').pathname;if(url==='/favicon.ico'){res.writeHead(204);res.end();return;}
 if(!allowed(url)){if(!forbidden.includes(url))console.error('Forbidden QA resource: '+url);forbidden.push(url);res.writeHead(404);res.end();return;}
 const file=path.resolve(repo,url.slice(1));if(!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)){missing.push(url);res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(fs.readFileSync(file));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
async function ready(page){await page.waitForFunction(()=>!!window.WarhammerAppV2);await page.evaluate(async()=>{await window.WarhammerAppV2.ready;await window.ArmyBookAppV2?.rosterPanel?.ready;});await page.waitForFunction(()=>[...document.querySelectorAll('link[rel="stylesheet"]')].every(l=>!!l.sheet));}
async function geometry(page){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Page overflow');assert.deepEqual(await page.locator('.ds-selected-loadout > li').evaluateAll(nodes=>nodes.map(n=>n.textContent.trim()).filter(t=>/^\d+\s*×\s*$/.test(t))),[],'Blank inventory');}
async function roster(page){await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();await ready(page);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();}
async function imported(page,text,count){await roster(page);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);await page.locator('[data-roster-action="review-import"]').click();const expected=createTyranidsRosterImport(importBook).import(text);assert.equal(expected.status,'READY');await page.waitForFunction(x=>window.ArmyBookAppV2.roster.state?.rosterId===x.id&&window.ArmyBookAppV2.roster.state?.units?.length===x.count,{id:expected.roster.rosterId,count});assert.deepEqual((await snapshot(page)).units,expected.roster.units);await geometry(page);}
async function effective(page,id){await page.locator(`[data-roster-instances] > [data-roster-instance-id="${id}"] [data-roster-action="show-instance"]`).click();await page.locator('main .unit-card').first().waitFor();await geometry(page);}
async function attach(page,leader,guard){await page.locator(`[data-attachment-candidate-for="${guard}"]`).selectOption(leader);await page.locator(`[data-attachment-target-instance-id="${guard}"] [data-roster-action="attach"]`).click();await page.locator(`[data-attached-leader-instance-id="${leader}"]`).waitFor();}
async function detach(page,leader){await page.locator(`[data-roster-action="detach"][data-leader-instance-id="${leader}"]`).click();await page.waitForFunction(id=>!window.ArmyBookAppV2.roster.state.attachments.some(a=>a.leaderInstanceId===id),leader);}
async function guide(page,id){await page.getByRole('button',{name:'Personal guide',exact:true}).first().click();await page.locator(`main [data-roster-nav-instance-id="${id}"]`).first().click();await page.locator('main .unit-card').first().waitFor();await geometry(page);}
const snapshot=page=>page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());
const shown=page=>page.locator('main .unit-card').evaluateAll(ns=>ns.map(n=>({id:n.dataset.rosterInstanceId,text:n.innerText})));
async function history(page){const direct=page.url();await page.reload();await ready(page);await page.locator('main .unit-card').first().waitFor();await roster(page);await page.goBack();await ready(page);await page.locator('main .unit-card').first().waitFor();await page.goForward();await ready(page);await page.goto(direct);await ready(page);await page.locator('main .unit-card').first().waitFor();await geometry(page);}
async function normal(page,target){await page.locator('[data-v2-primary-nav] [data-v2-destination="HOME"]').click();await ready(page);await page.locator('[data-v2-book="tyranids"]').click();await ready(page);await page.locator(`main a.v2-library-card[data-target-id="${target}"]`).click();await geometry(page);}
async function elevated(page){const before=page.url();await page.locator('main a[data-target-id="detachment-warrior-bioform-onslaught:enhancement:1"]').first().click();const popup=page.locator('dialog[open]');await popup.waitFor();const text=await popup.innerText();assert.match(text,/Can re-roll wound rolls\./);assert.match(text,/Have \+1 AP\./);await page.keyboard.press('Escape');await popup.waitFor({state:'hidden'});await page.waitForURL(before);}
async function fnp(page,expected){for(const unit of await shown(page)){const refs=page.locator(`main .unit-card[data-roster-instance-id="${unit.id}"] .shared-abilities [data-target-id="core-feel-no-pain"]`);assert.equal(await refs.count(),expected.includes(unit.id)?1:0,'FNP owner/duplicate '+unit.id);if(expected.includes(unit.id))assert.equal((await refs.innerText()).trim(),'Feel No Pain 5+');}}

async function inventory(page){
 const data=JSON.parse(fs.readFileSync(new URL('./generated/app-presentation.json',import.meta.url),'utf8'));
 const cards=new Map(data.cards.map(c=>[c.id,c])),facts=JSON.parse(fs.readFileSync(new URL('./generated/effective.json',import.meta.url),'utf8'));
 for(const [kind,total]of Object.entries({DATASHEET:52,DETACHMENT:10,DETACHMENT_RULE:11,ENHANCEMENT:34,STRATAGEM:51}))assert.equal(facts.entities.filter(e=>e.kind===kind).length,total);
 for(const group of ['datasheets','detachments'])for(const id of data.groups.find(g=>g.id===group).itemIds)assert.equal(await page.locator(`main a.v2-library-card[data-target-id="${id}"]`).count(),1,'Reachable source inventory '+id);
 for(const id of data.groups.find(g=>g.id==='detachments').itemIds){await normal(page,id);for(const child of cards.get(id).children.filter(id=>['DETACHMENT_RULE','ENHANCEMENT','STRATAGEM'].includes(cards.get(id)?.kind)))assert.equal(await page.locator(`main [data-card-id="${child}"]`).count(),1,'Missing/duplicate visible Detachment child '+child);}
}

async function openBook(page,book){await page.locator('[data-v2-primary-nav] [data-v2-destination="HOME"]').click();await ready(page);await page.locator(`[data-v2-book="${book}"]`).click();await ready(page);assert.equal(await page.evaluate(()=>window.WarhammerAppV2.activeBookId),book);}
async function glossaryEntry(page,book,id,query){
 const index=JSON.parse(fs.readFileSync(path.join(repo,'glossary/v2/generated/index.en.json'),'utf8'));
 const matches=index.entries.filter(e=>e.sourceOwner?.bookId===book&&e.sourceOwner.canonicalId===id);assert.equal(matches.length,1,'Single canonical Glossary owner '+id);const target=matches[0];
 const facts=JSON.parse(fs.readFileSync(path.join(repo,`books/${book}/v2/generated/effective.json`),'utf8'));
 const owner=facts.entities.find(e=>e.id===id);assert.ok(owner);assert.deepEqual(target.facts.canonicalData,owner.data);assert.deepEqual(target.provenance,owner.provenance);
 await page.locator('[data-v2-primary-nav] [data-v2-destination="GLOSSARY"]').click();await ready(page);
 await page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill(query);
 await page.locator(`.v2-glossary-result[data-target-id="${target.id}"]`).click();await page.locator('dialog[open]').waitFor();
 if(owner.data.text)assert.ok((await page.locator('dialog[open]').innerText()).includes(owner.data.text),'Canonical text lost '+id);
 await page.getByRole('link',{name:'Open full entry',exact:true}).click();const article=page.locator(`main article[data-card-id="${target.id}"]`);await article.waitFor();
 const direct=page.url(),text=await article.innerText();await page.reload();await ready(page);assert.equal(await article.innerText(),text);
 await page.goBack();await ready(page);await page.goForward();await ready(page);await article.waitFor();await page.goto(direct);await ready(page);await article.waitFor();await geometry(page);
}
async function glossaryChecks(page){
 for(const [id,label] of [['detachment-vanguard-onslaught:rule:vanguard-prime','Vanguard Prime'],['detachment-warrior-bioform-onslaught:enhancement:1','Elevated Might'],['army-rule-synapse','Synapse'],['army-rule-shadow-in-the-warp','Shadow in the Warp']])await glossaryEntry(page,'tyranids',id,label);
}
async function existingBooks(page){
 const samples={
 'death-guard':'+ DETACHMENT: Virulent Vectorium\nChar1: 1x Lord of Contagion (120 pts): Manreaper',
 'adeptus-mechanicus':'+ FACTION KEYWORD: Imperium - Adeptus Mechanicus\n+ DETACHMENT: Haloscreed Battle Clade\nChar1: 1x Tech-priest Dominus (75 pts): Volkite blaster, Macrostubber, Omnissian axe',
 'chaos-space-marines':'+ FACTION KEYWORD: Chaos - Chaos Space Marines\n+ DETACHMENT: Pactbound Zealots\nChar1: 1x Chaos Lord (95 pts): Daemon hammer, Plasma pistol\n  Mark of Chaos: Nurgle'};
 for(const [book,text]of Object.entries(samples)){
  await openBook(page,book);await roster(page);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);await page.locator('[data-roster-action="review-import"]').click();await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state?.units?.length===1);
  await effective(page,'parsed-unit-1');await guide(page,'parsed-unit-1');await history(page);
  await page.locator('[data-v2-primary-nav] [data-v2-destination="GLOSSARY"]').click();await ready(page);await page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill({'death-guard':'Vector of Disease','adeptus-mechanicus':'Objective Scouted','chaos-space-marines':'Lord of Chaos'}[book]);assert.ok(await page.locator('.v2-glossary-result').count()>0,'Existing book glossary search');
 }
 await openBook(page,'emperors-children');await roster(page);
 const fixture=JSON.parse(fs.readFileSync(path.join(repo,'books/emperors-children/v2/roster-import-fixtures.json'),'utf8')).fixtures.find(f=>f.id==='native-fnp-physical-instances');
 await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(fixture.text);await page.locator('[data-roster-action="review-import"]').click();await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state?.units?.length===5);
 for(const id of ['parsed-unit-1','parsed-unit-2','parsed-unit-3']){await roster(page);await effective(page,id);await fnp(page,[id]);await guide(page,id);await fnp(page,[id]);}
 await roster(page);await attach(page,'parsed-unit-1','parsed-unit-4');await effective(page,'parsed-unit-4');await fnp(page,['parsed-unit-1']);await guide(page,'parsed-unit-4');await fnp(page,['parsed-unit-1']);await history(page);
 await roster(page);await detach(page,'parsed-unit-1');await effective(page,'parsed-unit-4');await fnp(page,[]);
 const court='detachment-court-of-the-phoenician',id=court+':rule:master-of-the-pageant';
 const facts=JSON.parse(fs.readFileSync(path.join(repo,'books/emperors-children/v2/generated/effective.json'),'utf8')),owner=facts.entities.find(e=>e.id===id);
 const check=async()=>{assert.equal(await page.locator(`main [data-fact-id="${id}::/text"]`).innerText(),owner.data.text);assert.equal(await page.locator(`main [data-card-id="${court}:rule"]`).count(),1);};
 await openBook(page,'emperors-children');await page.locator(`main a.v2-library-card[data-target-id="${court}"]`).click();await check();
 await roster(page);await page.locator('[data-roster-action="open-personal-guide"]').click();await page.locator(`main a[data-canonical-id="${court}"]`).click();await check();await page.reload();await ready(page);await check();
 await glossaryEntry(page,'emperors-children',id,'Master of the Pageant');
}

try{for(const [device,viewport]of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]] ){
 const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage();let reject;
 const failure=new Promise((_,r)=>{reject=r;});failure.catch(()=>{});
 page.on('pageerror',e=>{errors.push({device,error:e.message});reject(e);});page.on('console',m=>{if(m.type()==='error')errors.push({device,error:m.text()});});page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});
 const run=async()=>{
 await page.goto(origin+entry);await ready(page);await geometry(page);
 assert.deepEqual((await page.locator('[data-v2-book]').evaluateAll(ns=>ns.map(n=>n.dataset.v2Book))).sort(),[...books].sort(),'Exactly five Home books');
 await page.locator('[data-v2-book="tyranids"]').click();await ready(page);await inventory(page);await roster(page);
 await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(
   '+ FACTION KEYWORD: Tyranids\n+ DETACHMENT: Invasion Fleet\n1x Broodlord (80 pts)\n• 1x Broodlord: Impossible foreign weapon\n');
 await page.locator('[data-roster-action="review-import"]').click();
 await page.getByRole('status').filter({hasText:'clarification'}).waitFor();
 assert.equal(await page.evaluate(()=>window.ArmyBookAppV2.roster.state),null,'Unresolved selection was guessed');
 if(process.argv.includes('--negative-only')){results.push({device,unresolvedImport:'NEEDS_BINDINGS',rosterLoaded:false});return;}
 await normal(page,'detachment-vanguard-onslaught');assert.match(await page.locator('main').innerText(),/Questing Tendrils/);assert.match(await page.locator('main').innerText(),/Vanguard Prime/);
 await normal(page,'detachment-warrior-bioform-onslaught');let text=await page.locator('main').innerText();assert.match(text,/Can re-roll wound rolls\./);assert.match(text,/Have \+1 AP\./);
 await normal(page,'unit-harpy');assert.doesNotMatch((await page.locator('main .unit-card .shared-abilities').allTextContents()).join(' '),/Hover/);
 await normal(page,'unit-biovores');assert.match(await page.locator('main').innerText(),/does my unit lose hidden\?/);assert.match(await page.locator('main section[data-card-id="faq-biovores-seed-spore-mines-hidden-v1.3"]').innerText(),/No\./);
 await normal(page,'unit-venomthropes');assert.match(await page.locator('main section[data-card-id="tyranids-source-conflict-foul-spores"]').innerText(),/Unresolved source conflict/);
 await normal(page,'unit-broodlord');const reference=page.locator('main .weapon-name a[data-target-id]').first();await reference.click();await page.locator('dialog[open]').waitFor();await page.goBack();await page.locator('dialog[open]').waitFor({state:'hidden'});await page.goForward();await page.locator('dialog[open]').waitFor();await page.goBack();
 for(const fixture of fixtures){console.log(device+' scenario '+fixture.id);
  await imported(page,fixture.text,fixture.count);const before=await snapshot(page);
  if(['A','B','C','E','G'].includes(fixture.id))await attach(page,'parsed-unit-1','parsed-unit-2');
  const id=['A','B','C','E','G'].includes(fixture.id)?'parsed-unit-2':'parsed-unit-1';await effective(page,id);
  if(fixture.id==='B'){await elevated(page);assert.equal(await page.evaluate(()=>window.ArmyBookAppV2.roster.effective('parsed-unit-1').applied.some(a=>a.ruleId==='detachment-warrior-bioform-onslaught:enhancement:1')),false,'Unimplemented Elevated Might claimed executable');}
  if(fixture.id==='E')await fnp(page,['parsed-unit-1']);
  if(fixture.id==='G'){const cards=await shown(page);assert.match(cards.find(u=>u.id==='parsed-unit-2').text,/M\s*10"/);assert.match(cards.find(u=>u.id==='parsed-unit-1').text,/M\s*10"/);}
  if(fixture.id==='H'){assert.deepEqual(await page.evaluate(()=>window.ArmyBookAppV2.roster.projection.units.find(u=>u.instanceId==='parsed-unit-1').metrics.detectionRange),{modifier:-3});assert.equal(await page.evaluate(()=>window.ArmyBookAppV2.roster.projection.units.find(u=>u.instanceId==='parsed-unit-2').metrics.detectionRange),undefined);await page.locator('main a[data-target-id="detachment-ambush-predators:enhancement:2"]').first().click();await page.locator('dialog[open]').waitFor();assert.match(await page.locator('dialog[open]').innerText(),/3/);await page.keyboard.press('Escape');await page.locator('dialog[open]').waitFor({state:'hidden'});await page.locator('main .unit-card').first().waitFor();}
  if(fixture.id==='D'){text=await page.locator('main').innerText();assert.match(text,/ANTI-CHARACTER 2\+/);}
  await guide(page,id);if(fixture.id==='B')await elevated(page);if(fixture.id==='E')await fnp(page,['parsed-unit-1']);await history(page);
  assert.deepEqual((await snapshot(page)).units,before.units,'Navigation changed import');
  for(let i=1;i<=fixture.count;i++){await roster(page);await effective(page,`parsed-unit-${i}`);await guide(page,`parsed-unit-${i}`);if(fixture.id==='E')await fnp(page,i===1||i===2?['parsed-unit-1']:['parsed-unit-'+i]);}
  if(['A','B','C','E','G'].includes(fixture.id)){await roster(page);await detach(page,'parsed-unit-1');await effective(page,'parsed-unit-2');assert.equal((await shown(page)).length,1);if(fixture.id==='E')await fnp(page,[]);await roster(page);await attach(page,'parsed-unit-1','parsed-unit-2');await effective(page,'parsed-unit-2');}
  await page.screenshot({path:path.join(out,`${device}-${fixture.id}.png`),fullPage:true});
  // Selection changes are made by editing/reimporting the actual supported export.
  if(['A','B','D','G','H'].includes(fixture.id)){const unselected=fixture.text.replace(/^Enhancement:.*\n/gm,'');await imported(page,unselected,fixture.count);assert.ok((await snapshot(page)).units.every(u=>u.enhancementIds.length===0));await effective(page,'parsed-unit-1');await guide(page,'parsed-unit-1');}
  if(fixture.id==='F'){const changed=fixture.text.replace('Acid spray','Rupture cannon');await imported(page,changed,fixture.count);await effective(page,'parsed-unit-1');assert.match(await page.locator('main').innerText(),/Rupture cannon/);await guide(page,'parsed-unit-1');}
 }
 for(const [leader,bodyguard]of pairs){await imported(page,make('Invasion Fleet',[leader,bodyguard,leader,bodyguard]),4);const initial=await snapshot(page);await attach(page,'parsed-unit-1','parsed-unit-2');await effective(page,'parsed-unit-2');assert.deepEqual((await shown(page)).map(u=>u.id).sort(),['parsed-unit-1','parsed-unit-2']);await roster(page);await effective(page,'parsed-unit-4');assert.deepEqual((await shown(page)).map(u=>u.id),['parsed-unit-4']);await roster(page);await detach(page,'parsed-unit-1');await attach(page,'parsed-unit-1','parsed-unit-4');await effective(page,'parsed-unit-4');assert.deepEqual((await shown(page)).map(u=>u.id).sort(),['parsed-unit-1','parsed-unit-4']);await history(page);assert.deepEqual((await snapshot(page)).units,initial.units);}
 await glossaryChecks(page);await existingBooks(page);await normal(page,'unit-broodlord');
 results.push({device,application:'MAIN_UNIFIED_V2',fiveBooks:true,glossary:true,existingFourBookFlows:true,scenarios:fixtures.map(f=>f.id),attachmentPairs:7,nativeFnp:true,elevatedText:true,guide:true,reloadHistory:true,selectionReimport:true,overflow:false});
 };
 try{await Promise.race([run(),failure]);}catch(e){await page.screenshot({path:path.join(out,device+'-failure.png'),fullPage:true});fs.writeFileSync(path.join(out,device+'-failure.json'),JSON.stringify({url:page.url(),main:await page.locator('main').innerText(),errors,missing,forbidden},null,2));throw e;}finally{await context.close();}
 }fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({results,errors,missing,forbidden},null,2));assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);assert.deepEqual(forbidden,[]);console.log(JSON.stringify({status:'PASS',captureStatus,results,errors,missing,forbidden,screenshots:out},null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
