/** Isolated EC registration on the real shared application and renderer.
 * Fixtures are constructed source-backed New Recruit grammar, not real exports.
 * Browser evaluate calls inspect only; all changes use visible player controls. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const repo=fileURLToPath(new URL('../../../',import.meta.url));
const fixtures=JSON.parse(fs.readFileSync(new URL('./roster-import-fixtures.json',import.meta.url),'utf8'));
assert.match(fixtures.captureStatus,/Constructed source-backed/);
const fixture=id=>fixtures.fixtures.find(entry=>entry.id===id).text;
const out=process.env.EC_V2_SCREENSHOTS||'E:/Warhammer/qa-artifacts/ec-v2-app-browser';
fs.mkdirSync(out,{recursive:true});
const entry='/ec-v2-test.html',bootstrap='/ec-v2-test-boot.mjs';
const wrapper='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EC isolated shared V2 UI</title></head><body><script type="module" src="'+bootstrap+'"></script></body></html>';
const boot=`import {createBookRegistry} from '/books/shared/application-v2/registry.mjs';
import {createApplication} from '/books/shared/application-v2/runtime.mjs';
import {registration} from '/books/emperors-children/v2/registration.mjs';
createApplication(document,{registry:createBookRegistry([registration]),entryURL:new URL('${entry}',location.origin).href});`;
const allowed=address=>[entry,bootstrap].includes(address)||
 /^\/books\/emperors-children\/v2\/[\w./-]+\.(?:mjs|json|css)$/.test(address)||
 /^\/books\/emperors-children\/assets\/emperors-children-cover-(?:480|800)\.webp$/.test(address)||
 /^\/books\/shared\/(?:application-v2|army-book-app-v2|roster-v2|rule-contract-v2)\/[\w./-]+\.(?:mjs|css|json)$/.test(address)||
 /^\/books\/shared\/(?:datasheet-system|unit-art)\.css$/.test(address)||
 /^\/assets\/[\w./-]+\.(?:webp|png|svg|woff2)$/.test(address);
for(const address of ['/books/emperors-children/scripts/data.js','/books/death-guard/v2/registration.mjs',
 '/books/emperors-children/assets/unknown.webp','/books/tyranids/v2/app.html'])assert.equal(allowed(address),false);
const requests=[],forbidden=[],missing=[],errors=[],results=[];
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const address=new URL(req.url,'http://localhost').pathname;requests.push(address);
 if(address==='/favicon.ico'){res.writeHead(204);res.end();return;}
 if(!allowed(address)){forbidden.push(address);res.writeHead(404);res.end();return;}
 const file=path.resolve(repo,address.slice(1));
 if(![entry,bootstrap].includes(address)&&(!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())){
   missing.push(address);res.writeHead(404);res.end();return;
 }
 res.writeHead(200,{'Content-Type':mime[path.extname(address)]||'application/octet-stream','Cache-Control':'no-store'});
 res.end(address===entry?wrapper:address===bootstrap?boot:fs.readFileSync(file));
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
   results.push({device,armyBookReference:true,import:true,attachments:true,formedComponents:true,legionsEquipment:true,selectedUnselected:true,cacophonicScopes:true,lordOfTheHostTiming:true,battleConditionsVisible:true,unitUpgrades:true,possessedBladeExplicitChoice:true,guide:true,reload:true,history:true,overflow:false});
  };
  try{await Promise.race([scenario(),pageFailure]);}catch(error){
   await page.screenshot({path:path.join(out,device+'-failure.png'),fullPage:true});
   fs.writeFileSync(path.join(out,device+'-failure.json'),JSON.stringify({url:page.url(),main:await page.locator('main').innerText(),errors,missing,forbidden},null,2));
   throw error;
  }await context.close();
 }
 assert.deepEqual(forbidden,[]);assert.deepEqual(missing,[]);assert.deepEqual(errors,[]);
 console.log(JSON.stringify({status:'PASS',captureStatus:fixtures.captureStatus,results,forbidden,missing,errors,screenshots:out},null,2));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
