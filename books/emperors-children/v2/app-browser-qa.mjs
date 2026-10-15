/** Real shared application and renderer; --unified uses production boot bytes.
 * Fixtures are constructed source-backed New Recruit grammar, not real exports.
 * Browser evaluate calls inspect only; all changes use visible player controls. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {isApplicationTestDependency} from '../../shared/application-v2/browser-test-dependencies.mjs';
import {adaptGlobalGlossary} from '../../shared/army-book-app-v2/global-glossary.mjs';

const repo=fileURLToPath(new URL('../../../',import.meta.url));
const fixtures=JSON.parse(fs.readFileSync(new URL('./roster-import-fixtures.json',import.meta.url),'utf8'));
assert.match(fixtures.captureStatus,/Constructed source-backed/);
const fixture=id=>fixtures.fixtures.find(entry=>entry.id===id).text;
const unified=process.argv.includes('--unified');
const out=process.env.EC_V2_SCREENSHOTS||(unified?'E:/Warhammer/qa-artifacts/ec-v2-unified-browser':'E:/Warhammer/qa-artifacts/ec-v2-app-browser');
fs.mkdirSync(out,{recursive:true});
const entry=unified?'/v2/app.html':'/ec-v2-test.html',bootstrap='/ec-v2-test-boot.mjs';
const wrapper='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EC isolated shared V2 UI</title></head><body><script type="module" src="'+bootstrap+'"></script></body></html>';
const boot=`import {createBookRegistry} from '/books/shared/application-v2/registry.mjs';
import {createApplication} from '/books/shared/application-v2/runtime.mjs';
import {registration} from '/books/emperors-children/v2/registration.mjs';
createApplication(document,{registry:createBookRegistry([registration]),entryURL:new URL('${entry}',location.origin).href});`;
const allowed=address=>[entry,...(unified?[]:[bootstrap])].includes(address)||
 (unified&&(isApplicationTestDependency(address)||/^\/books\/(?:death-guard|adeptus-mechanicus|chaos-space-marines)\/v2\/[\w./-]+\.(?:mjs|json|css)$/.test(address)||
 /^\/books\/(?:death-guard|adeptus-mechanicus|chaos-space-marines)\/assets\/[\w./-]+\.(?:webp|png|jpe?g|svg)$/.test(address)))||
 /^\/books\/emperors-children\/v2\/[\w./-]+\.(?:mjs|json|css)$/.test(address)||
 /^\/books\/emperors-children\/assets\/emperors-children-cover-(?:480|800)\.webp$/.test(address)||
 /^\/books\/shared\/(?:application-v2|army-book-app-v2|roster-v2|rule-contract-v2)\/[\w./-]+\.(?:mjs|css|json)$/.test(address)||
 /^\/books\/shared\/(?:datasheet-system|unit-art)\.css$/.test(address)||
 /^\/assets\/[\w./-]+\.(?:webp|png|jpe?g|svg|woff2)$/.test(address);
for(const address of ['/books/emperors-children/scripts/data.js',...(!unified?['/books/death-guard/v2/registration.mjs']:[]),
 '/books/emperors-children/assets/unknown.webp','/books/tyranids/v2/app.html'])assert.equal(allowed(address),false);
const requests=[],forbidden=[],missing=[],errors=[],results=[];
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const address=new URL(req.url,'http://localhost').pathname;requests.push(address);
 if(address==='/favicon.ico'){res.writeHead(204);res.end();return;}
 if(!allowed(address)){forbidden.push(address);res.writeHead(404);res.end();return;}
 const file=path.resolve(repo,address.slice(1));
 if((unified||![entry,bootstrap].includes(address))&&(!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())){
   missing.push(address);res.writeHead(404);res.end();return;
 }
 res.writeHead(200,{'Content-Type':mime[path.extname(address)]||'application/octet-stream','Cache-Control':'no-store'});
 res.end(!unified&&address===entry?wrapper:!unified&&address===bootstrap?boot:fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
async function ready(page){
 await page.waitForFunction(()=>!!window.WarhammerAppV2);
 await page.evaluate(async()=>{await window.WarhammerAppV2.ready;await window.ArmyBookAppV2?.rosterPanel?.ready;});
 await page.waitForFunction(()=>[...document.querySelectorAll('link[rel="stylesheet"]')].every(link=>!!link.sheet));
}
async function geometry(page){
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Horizontal page overflow');
 assert.deepEqual(await page.locator('.ds-selected-loadout > li').evaluateAll(nodes=>nodes.map(node=>node.textContent.trim()).filter(text=>/^\d+\s*×\s*$/.test(text))),[],'Blank inventory entry');
}
async function roster(page){await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();await ready(page);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();}
async function imported(page,text,count){
 await roster(page);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
 await page.locator('[data-roster-action="review-import"]').click();
 if(count!==null)await page.waitForFunction(count=>window.ArmyBookAppV2.roster.state?.units?.length===count,count);
 await page.locator('[data-roster-action="review-import"]').waitFor();
}
async function effective(page,id){await page.locator(`[data-roster-instances] > [data-roster-instance-id="${id}"] [data-roster-action="show-instance"]`).click();await page.locator('main .unit-card').first().waitFor();await geometry(page);}
async function attach(page,leader='parsed-unit-1',guard='parsed-unit-2'){
 await page.locator(`[data-attachment-candidate-for="${guard}"]`).selectOption(leader);
 await page.locator(`[data-attachment-target-instance-id="${guard}"] [data-roster-action="attach"]`).click();
 await page.locator(`[data-attached-leader-instance-id="${leader}"]`).waitFor();
}
async function guide(page){await page.getByRole('button',{name:'Personal guide',exact:true}).first().click();await page.locator('main [data-roster-nav-instance-id]').first().waitFor();await geometry(page);}
async function guideUnit(page,id){await page.locator(`main [data-roster-nav-instance-id="${id}"]`).first().click();await page.locator('main .unit-card').first().waitFor();await geometry(page);}
async function units(page){return page.locator('main .unit-card').evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.rosterInstanceId,text:n.innerText})));}
async function snapshot(page){return page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());}
async function nativeFnp(page,device){
 // Real production imports and controls only. Numeric override/suppression has
 // no EC UI control and is covered separately by native-fnp-qa's executor tests.
 for(const unit of ['lucius-the-eternal','chaos-spawn']){
  await page.locator('[data-v2-primary-nav] [data-v2-destination="HOME"]').click();await ready(page);
  await page.locator('[data-v2-book="emperors-children"]').click();await ready(page);
  await page.locator(`main a.v2-library-card[data-target-id="unit-${unit}"]`).click();
  const refs=page.locator('main .unit-card .shared-abilities [data-target-id="core-feel-no-pain"]');
  assert.equal(await refs.count(),1,'Normal Army Book FNP source occurrence');assert.equal((await refs.innerText()).trim(),'Feel No Pain 5+');
 }
 await imported(page,fixture('native-fnp-physical-instances'),5);const raw=await snapshot(page);
 const check=async ids=>{
  assert.deepEqual((await units(page)).map(u=>u.id).sort(),[...ids].sort());
  for(const id of ids){
   const refs=page.locator(`main .unit-card[data-roster-instance-id="${id}"] .shared-abilities [data-target-id="core-feel-no-pain"]`);
   const expected=['parsed-unit-1','parsed-unit-2','parsed-unit-3'].includes(id)?1:0;
   assert.equal(await refs.count(),expected,'FNP MODEL owner/duplicate: '+id);
   if(expected)assert.equal((await refs.innerText()).trim(),'Feel No Pain 5+');
  }
 };
 for(const id of ['parsed-unit-1','parsed-unit-2','parsed-unit-3','parsed-unit-5']){
  await roster(page);await effective(page,id);await check([id]);await guide(page);await guideUnit(page,id);await check([id]);
 }
 await roster(page);await attach(page,'parsed-unit-1','parsed-unit-4');await effective(page,'parsed-unit-4');
 await check(['parsed-unit-1','parsed-unit-4']);await guide(page);await guideUnit(page,'parsed-unit-4');await check(['parsed-unit-1','parsed-unit-4']);
 await page.reload();await ready(page);await check(['parsed-unit-1','parsed-unit-4']);
 await page.screenshot({path:path.join(out,device+'-native-fnp-guide.png'),fullPage:true});
 await roster(page);await page.locator('[data-roster-action="detach"][data-leader-instance-id="parsed-unit-1"]').click();
 await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state.attachments.length===0);
 await effective(page,'parsed-unit-4');await check(['parsed-unit-4']);
 await roster(page);await effective(page,'parsed-unit-1');await check(['parsed-unit-1']);
 await roster(page);await attach(page,'parsed-unit-1','parsed-unit-4');await effective(page,'parsed-unit-4');await check(['parsed-unit-1','parsed-unit-4']);
 await roster(page);await effective(page,'parsed-unit-2');await check(['parsed-unit-2']);
 const direct=page.url();await page.reload();await ready(page);await check(['parsed-unit-2']);
 await guide(page);await guideUnit(page,'parsed-unit-3');await check(['parsed-unit-3']);
 await page.goto(direct);await ready(page);await check(['parsed-unit-2']);
 assert.deepEqual((await snapshot(page)).units,raw.units,'FNP presentation changed physical import');
}
async function masterOfThePageant(page,device){
 const court='detachment-court-of-the-phoenician',id=court+':rule:master-of-the-pageant';
 const facts=JSON.parse(fs.readFileSync(new URL('./generated/effective.json',import.meta.url)));
 const owner=facts.entities.find(e=>e.id===id),primary=facts.entities.find(e=>e.id===court+':rule');
 const fact=()=>page.locator(`main [data-fact-id="${id}::/text"]`);
 const checkCourt=async()=>{
  assert.equal(await page.locator(`main [data-card-id="${id}"]`).count(),1,'Missing/duplicate sibling rule');
  assert.equal(await fact().innerText(),owner.data.text,'Court lost official conditional text');
  assert.equal(await page.locator(`main [data-fact-id="${court}:rule::/text"]`).innerText(),primary.data.text,'Sensational Performance changed');
  for(const binding of owner.data.referenceBindings){
   const link=page.locator(`main [data-card-id="${id}"] a[data-target-id="${binding.targetId}"]`);await link.click();
   const popup=page.locator('dialog[open]');await popup.waitFor();
   assert.match(await popup.innerText(),new RegExp(binding.label,'i'));await page.keyboard.press('Escape');
  }
  await geometry(page);
 };
 await page.locator('[data-v2-primary-nav] [data-v2-destination="HOME"]').click();await ready(page);
 await page.locator('[data-v2-book="emperors-children"]').click();await ready(page);
 await page.locator(`main a.v2-library-card[data-target-id="${court}"]`).click();await checkCourt();
 const normalDirect=page.url();await page.reload();await ready(page);await checkCourt();
 await page.screenshot({path:path.join(out,device+'-master-army-book.png'),fullPage:false});
 // The preceding native-FNP import contains Fulgrim and Court. Every change
 // below is navigation; CP and physical import/effective values must be stable.
 const before=await snapshot(page);
 const effectiveBefore=await page.evaluate(()=>window.ArmyBookAppV2.roster.effective('parsed-unit-5'));
 await roster(page);await page.locator('[data-roster-action="open-personal-guide"]').click();
 await page.locator(`main a[data-canonical-id="${court}"]`).click();await checkCourt();
 await page.reload();await ready(page);await checkCourt();
 await page.screenshot({path:path.join(out,device+'-master-personal-guide.png'),fullPage:false});
 await roster(page);await effective(page,'parsed-unit-4');
 assert.equal(await page.locator(`main [data-card-id="${id}"]`).count(),0,'Detachment CP permission became a Bodyguard ability');
 assert.deepEqual(await snapshot(page),before);
 assert.deepEqual(await page.evaluate(()=>window.ArmyBookAppV2.roster.effective('parsed-unit-5')),effectiveBefore,'Reading conditional permission changed CP/effects');
 if(unified){
  const index=JSON.parse(fs.readFileSync(path.join(repo,'glossary/v2/generated/index.en.json'),'utf8'));
  const target=index.entries.find(e=>e.sourceOwner?.bookId==='emperors-children'&&e.sourceOwner.canonicalId===id);
  assert.ok(target);assert.deepEqual(target.facts.canonicalData,owner.data);assert.deepEqual(target.provenance,owner.provenance);
  await page.locator('[data-v2-primary-nav] [data-v2-destination="GLOSSARY"]').click();await ready(page);
  await page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill('Master of the Pageant');
  const result=page.locator(`.v2-glossary-result[data-target-id="${target.id}"]`);await result.waitFor();await result.click();
  const popup=page.locator('dialog[open]');await popup.waitFor();
  assert.deepEqual(await popup.locator('.reference-definition .reference-fact').allTextContents(),[owner.data.text]);
  await popup.getByRole('link',{name:'Open full entry',exact:true}).click();
  const article=page.locator(`main article[data-card-id="${target.id}"]`);await article.waitFor();const direct=page.url();
  for(const binding of owner.data.referenceBindings){
   const referenced=index.entries.find(e=>e.sourceOwner?.bookId==='emperors-children'&&e.sourceOwner.canonicalId===binding.targetId);
   await article.locator(`a[data-target-id="${referenced.id}"]`).click();await page.locator('dialog[open]').waitFor();
   assert.match(await page.locator('dialog[open]').innerText(),new RegExp(binding.label,'i'));await page.keyboard.press('Escape');
  }
  await page.reload();await ready(page);await article.waitFor();
  assert.deepEqual(await article.locator('.reference-definition .reference-fact').allTextContents(),[owner.data.text]);
  await page.goBack();await ready(page);await page.goForward();await ready(page);await article.waitFor();
  await page.goto(direct);await ready(page);await article.waitFor();await geometry(page);
  await page.screenshot({path:path.join(out,device+'-master-glossary.png'),fullPage:false});
 }
 await page.goto(normalDirect);await ready(page);await checkCourt();
}
async function unifiedReferences(page,device){
 const home=async()=>{await page.locator('[data-v2-primary-nav] [data-v2-destination="HOME"]').click();await ready(page);};
 const openBook=async id=>{await home();await page.locator(`[data-v2-book="${id}"]`).click();await ready(page);};
 await home();assert.deepEqual(await page.locator('[data-v2-book]').evaluateAll(nodes=>nodes.map(n=>n.dataset.v2Book)),
   ['adeptus-mechanicus','death-guard','chaos-space-marines','emperors-children']);
 const facts=JSON.parse(fs.readFileSync(new URL('./generated/effective.json',import.meta.url)));
 const quote=facts.entities.find(e=>e.id==='datasheet-lord-exultant:section:1').data.blocks[0].text;
 const normalized=text=>text.replace(/\s+/g,' ').trim();
 await openBook('emperors-children');await page.locator('main a.v2-library-card[data-target-id="unit-lord-exultant"]').click();
 assert.ok(normalized(await page.locator('main').innerText()).includes(normalized(quote)),'Army Book lost canonical ability text');
 const corpus=JSON.parse(fs.readFileSync(path.join(repo,'glossary/v2/generated/index.en.json'),'utf8'));
 const projected=adaptGlobalGlossary(corpus);
 const target=projected.cards.find(c=>c.identity.registryId==='emperors-children'&&c.identity.canonicalId==='datasheet-lord-exultant:section:1'&&c.identity.fieldPath==='/blocks/0/text');
 assert.ok(target,'EC source-owned ability field missing from Mega Glossary');
 await home();await page.locator('[data-v2-primary-nav] [data-v2-destination="GLOSSARY"]').click();await ready(page);
 await page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill('Perfectionists');
 const link=page.locator(`.v2-glossary-result[data-target-id="${target.id}"]`);await link.waitFor();const direct=await link.getAttribute('href');
 await link.click();const popup=page.locator('dialog[open]');await popup.waitFor();
 assert.deepEqual(await popup.locator('.reference-definition .reference-fact').allTextContents(),[quote],'Glossary/Army Book exact ability parity');
 await popup.getByRole('link',{name:'Open full entry',exact:true}).click();
 const article=page.locator(`main article[data-card-id="${target.id}"]`);await article.waitFor();
 assert.ok(await article.locator('a[data-target-id]').count(),'EC ability has no canonical references');
 await article.locator('a[data-target-id]').first().click();await page.locator('dialog[open]').waitFor();
 assert.ok((await page.locator('dialog[open]').innerText()).trim().length>0);await page.keyboard.press('Escape');
 await page.reload();await ready(page);assert.deepEqual(await article.locator('.reference-definition .reference-fact').allTextContents(),[quote]);
 await page.goBack();await ready(page);await page.getByRole('searchbox',{name:'Search glossary',exact:true}).waitFor();
 await page.goForward();await ready(page);await article.waitFor();
 await page.goto(direct);await ready(page);await article.waitFor();await geometry(page);
 await page.screenshot({path:path.join(out,device+'-unified-ec-glossary.png'),fullPage:false});
 // One updated profile in each view proves the deployed canonical source,
 // while full inventory/provenance parity belongs to the existing Node guard.
 await openBook('emperors-children');await page.locator('main a.v2-library-card[data-target-id="unit-noise-marines"]').click();
 assert.match(await page.locator('main .statline').first().innerText(),/W\s*3\b/);
 for(const [book,id]of [['death-guard','unit-lord-of-contagion'],['adeptus-mechanicus','unit-tech-priest-dominus'],['chaos-space-marines','unit-chaos-lord']]){
   await openBook(book);
   const previous=JSON.parse(fs.readFileSync(path.join(repo,`books/${book}/v2/generated/app-presentation.json`),'utf8'));
   const detachment=previous.cards.find(card=>card.kind==='DETACHMENT'),rule=previous.bookPresentation.records[detachment.id].ruleId;
   await page.locator(`main a.v2-library-card[data-target-id="${detachment.id}"]`).click();
   assert.equal(await page.locator(`main [data-card-id="${rule}"]`).count(),1,'Existing single-rule Detachment changed: '+book);
   await geometry(page);await openBook(book);await page.locator(`main a.v2-library-card[data-target-id="${id}"]`).click();
   await page.locator('main .unit-card').first().waitFor();await geometry(page);
 }
 await openBook('emperors-children');await roster(page);
 assert.equal((await snapshot(page)).units[0].canonicalUnitId,'unit-lord-exultant','Returning from other books lost EC roster ownership');
}

try{
 for(const [device,viewport]of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage();
  let rejectError;const pageFailure=new Promise((_,reject)=>{rejectError=reject;});pageFailure.catch(()=>{});
  page.on('pageerror',error=>{errors.push({device,error:error.message});rejectError(error);});
  page.on('console',message=>{if(message.type()==='error')errors.push({device,console:message.text()});});
  page.on('response',response=>{if(response.status()>=400)missing.push(response.url());});
  const scenario=async()=>{
   const initialRequest=requests.length;
   await page.goto(origin+entry);await ready(page);await geometry(page);
   assert.equal(await page.locator('[data-v2-book="emperors-children"]').count(),1);
   assert.equal(requests.slice(initialRequest).some(address=>/\/emperors-children\/v2\/generated\//.test(address)),false,'Home eagerly loads EC facts');
   await page.locator('[data-v2-book="emperors-children"]').click();await ready(page);
   await page.locator('main a.v2-library-card[data-target-id="unit-lord-exultant"]').click();
   await page.locator('main .unit-card').first().waitFor();await geometry(page);
   const weapon=page.locator('main .weapon-name a[data-target-id]').first();await weapon.click();
   await page.locator('dialog[open]').waitFor();assert.match(await page.locator('dialog[open]').innerText(),/pistol|spear|weapon/i);
   await page.goBack();await page.locator('dialog[open]').waitFor({state:'hidden'});
   await page.goForward();await page.locator('dialog[open]').waitFor();await page.goBack();
   await nativeFnp(page,device);
   await masterOfThePageant(page,device);
   await imported(page,fixture('character-bodyguard'),2);const rawBefore=await snapshot(page);
   await attach(page);await effective(page,'parsed-unit-2');
   let visible=await units(page);assert.deepEqual(visible.map(v=>v.id).sort(),['parsed-unit-1','parsed-unit-2']);
   assert.match(visible.find(v=>v.id==='parsed-unit-1').text,/Exalted Patron/);
   assert.match(visible.find(v=>v.id==='parsed-unit-1').text,/Lord of the Host/i);
   assert.match(visible.find(v=>v.id==='parsed-unit-1').text,/Declare Battle Formations/);
   assert.match(visible.find(v=>v.id==='parsed-unit-1').text,/Once per battle, at the start of the Fight phase/);
   assert.match(visible.find(v=>v.id==='parsed-unit-2').text,/Infractor/);
   assert.equal((await snapshot(page)).initialAttachmentStep,undefined,'Current attachment cannot fabricate timing evidence');
   assert.equal(await page.locator('main .unit-card[data-roster-instance-id="parsed-unit-1"] .shared-abilities [data-target-id="core-scouts"],main .unit-card[data-roster-instance-id="parsed-unit-1"] .shared-abilities [data-target-id="core-infiltrators"]').count(),0,'Unconfirmed Lord of the Host became permanent on Exultant MODEL');
   await guide(page);assert.equal(await page.locator('main [data-roster-nav-instance-id]').count(),2);
   await guideUnit(page,'parsed-unit-2');assert.equal((await units(page)).length,2);
   await page.reload();await ready(page);assert.equal((await snapshot(page)).attachments.length,1);
   await roster(page);await page.locator('[data-roster-action="detach"][data-leader-instance-id="parsed-unit-1"]').click();
   await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state.attachments.length===0);
   await attach(page);const after=await snapshot(page);assert.deepEqual(after.units,rawBefore.units,'Attachment mutated imported units');
   await effective(page,'parsed-unit-2');await page.screenshot({path:path.join(out,device+'-formed-unit.png'),fullPage:true});
   await imported(page,fixture('legions-physical-equipment'),5);
   await effective(page,'parsed-unit-1');assert.match(await page.locator('main').innerText(),/1 ×\s+shining aegis/);
   const aegis=await page.locator('main .statline').first().innerText();assert.match(aegis,/SV\s*3\+/);
   assert.match(aegis,/INV\s*4\+/);assert.match(await page.locator('main').innerText(),/Faction Keywords: LEGIONS OF EXCESS/);
   await guide(page);await guideUnit(page,'parsed-unit-2');const legions=await page.locator('main').innerText();
   assert.match(legions,/1 ×\s+instrument of Chaos/);assert.match(legions,/1 ×\s+daemonic icon/);assert.match(legions,/Charge/i);
   assert.match(legions,/M\s*9"/,'Charge modifier must not replace Movement');
   await page.reload();await ready(page);assert.equal((await snapshot(page)).units.length,5);
   await page.screenshot({path:path.join(out,device+'-legions-guide.png'),fullPage:true});
   const unselected=fixture('legions-physical-equipment').replace(', Shining aegis',', Living whip').replaceAll(', Instrument of Chaos','').replaceAll(', Daemonic icon','');
   await imported(page,unselected,5);await effective(page,'parsed-unit-1');
   assert.match(await page.locator('main .statline').first().innerText(),/SV\s*5\+/,'Removing selected Aegis restores ordinary Save');
   assert.doesNotMatch(await page.locator('main').innerText(),/1 ×\s+shining aegis/);
   await guide(page);await guideUnit(page,'parsed-unit-2');assert.doesNotMatch(await page.locator('main').innerText(),/1 ×\s+(?:instrument of Chaos|daemonic icon)/i);
   const noise=fixture('bsdata-model-variants').split('6x Noise Marines')[1].split('5x Tormentors')[0];
   const cacophonic=fixture('unit-upgrades')+'Char1: 1x Lord Kakophonist (70 pts): Screamer pistol, Power sword\nEnhancement: Cacophonic Accompaniment\n6x Noise Marines'+noise;
   await imported(page,cacophonic,5);await attach(page,'parsed-unit-4','parsed-unit-1');await effective(page,'parsed-unit-1');
   const formation=await units(page),character=formation.find(unit=>unit.id==='parsed-unit-4'),terminators=formation.find(unit=>unit.id==='parsed-unit-1');
   assert.ok(character&&terminators);assert.match(character.text,/IGNORES COVER/);assert.match(terminators.text,/IGNORES COVER/);
   assert.match(character.text,/Deep Strike/i);
   assert.equal(await page.locator('main .unit-card[data-roster-instance-id="parsed-unit-1"] .shared-abilities [data-target-id="core-deep-strike"]').count(),1,'Terminator intrinsic Deep Strike changed or duplicated');
   await roster(page);await page.locator('[data-roster-action="detach"][data-leader-instance-id="parsed-unit-4"]').click();
   await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state.attachments.length===0);
   await effective(page,'parsed-unit-1');assert.doesNotMatch(await page.locator('main').innerText(),/IGNORES COVER/);
   await roster(page);await attach(page,'parsed-unit-4','parsed-unit-5');await effective(page,'parsed-unit-5');
   assert.equal(await page.locator('main .unit-card[data-roster-instance-id="parsed-unit-5"] .shared-abilities [data-target-id="core-deep-strike"]').count(),0,'MODEL Deep Strike leaked to Noise Marines');
   assert.match((await units(page)).find(unit=>unit.id==='parsed-unit-5').text,/IGNORES COVER/);
   await roster(page);await effective(page,'parsed-unit-2');
   assert.match(await page.locator('main').innerText(),/Eager Patrons/);await guide(page);
   assert.match(await page.locator('main').innerText(),/Frenzied Ferocity/);assert.match(await page.locator('main').innerText(),/Beguiling Grotesquerie/);
   await imported(page,fixture('possessed-blade-missing-decision'),null);
   await page.locator('[data-roster-bindings] fieldset').first().waitFor();
   assert.match(await page.locator('.v2-roster-status').innerText(),/clarification|ambiguous/i);
   const choice=page.locator('[data-roster-bindings] select').first();
   const options=await choice.locator('option').evaluateAll(nodes=>nodes.map(n=>({value:n.value,text:n.textContent})));
   const spear=options.find(option=>/Phoenix power spear/i.test(option.text));assert.ok(spear,'Equipped canonical melee choice unavailable');
   await choice.selectOption(spear.value);await page.locator('[data-roster-action="resolve-bindings"]').click();
   await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state.units.length===1);
   await effective(page,'parsed-unit-1');assert.match(await page.locator('main').innerText(),/Possessed Blade/);
   const direct=page.url();await page.reload();await ready(page);await page.locator('main .unit-card').first().waitFor();
   await guide(page);await page.goBack();await page.locator('main .unit-card').first().waitFor();await page.goForward();await ready(page);
   await page.goto(direct);await ready(page);await geometry(page);
   if(unified)await unifiedReferences(page,device);
   results.push({device,nativeFnp:true,masterOfThePageant:true,armyBookReference:true,import:true,attachments:true,formedComponents:true,legionsEquipment:true,selectedUnselected:true,cacophonicScopes:true,lordOfTheHostTiming:true,battleConditionsVisible:true,unitUpgrades:true,possessedBladeExplicitChoice:true,guide:true,reload:true,history:true,unifiedGlossaryParity:unified,returnToExistingBooks:unified,overflow:false});
  };
  try{await Promise.race([scenario(),pageFailure]);}catch(error){
   await page.screenshot({path:path.join(out,device+'-failure.png'),fullPage:true});
   fs.writeFileSync(path.join(out,device+'-failure.json'),JSON.stringify({url:page.url(),main:await page.locator('main').innerText(),errors,missing,forbidden},null,2));
   throw error;
  }await context.close();
 }
 assert.deepEqual(forbidden,[]);assert.deepEqual(missing,[]);assert.deepEqual(errors,[]);
 console.log(JSON.stringify({status:'PASS',application:unified?'PRODUCTION_UNIFIED_V2':'ISOLATED_EC',captureStatus:fixtures.captureStatus,results,forbidden,missing,errors,screenshots:out},null,2));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
