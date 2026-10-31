import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {launchQaBrowser} from '../tests/helpers/qa-browser.cjs';
/** Focused native/granted FNP player flow in the real main Unified V2 shell.
 * Constructed supported New Recruit text; no DOM, runtime or storage writes. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {nativeFnpFixture as fixture} from '../books/adeptus-mechanicus/v2/native-fnp-fixtures.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';

const repo=fileURLToPath(new URL('../',import.meta.url));
const out=process.env.ADMECH_FNP_SCREENSHOTS||createQaEvidenceDir('admech-fnp-browser-qa-');
fs.mkdirSync(out,{recursive:true});
const selectedDevice=process.env.ADMECH_FNP_BROWSER_DEVICE;
assert.ok(!selectedDevice||['desktop','mobile'].includes(selectedDevice));
const devices=[['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]
  .filter(([name])=>!selectedDevice||selectedDevice===name);
const files=new Set(['/books/shared/datasheet-system.css','/books/shared/unit-art.css',
  '/books/adeptus-mechanicus/assets/mechanicus-logo.png']);
function addFiles(relative){
  for(const entry of fs.readdirSync(path.join(repo,relative),{recursive:true,withFileTypes:true}))if(entry.isFile()){
    const address='/'+path.relative(repo,path.join(entry.parentPath,entry.name)).replaceAll('\\','/');
    if(/\.(?:mjs|js|css|json)$/.test(entry.name)&&!/(?:-qa\.|-fixtures\.|\/sources\/)/.test(address))files.add(address);
  }
}
for(const area of ['application-v2','army-book-app-v2','roster-v2','rule-contract-v2'])addFiles('books/shared/'+area);
addFiles('books/adeptus-mechanicus/v2');
const payload=JSON.parse(fs.readFileSync(path.join(repo,'books/adeptus-mechanicus/v2/generated/app-presentation.json'),'utf8'));
const base=new URL('http://test/books/adeptus-mechanicus/v2/');
if(payload.bookPresentation.coverImage)files.add(new URL(payload.bookPresentation.coverImage,base).pathname);
for(const art of Object.values(payload.datasheetPresentation.artwork))files.add(new URL('../'+art.asset,base).pathname);
const allowed=address=>isApplicationTestDependency(address)||files.has(address);
for(const forbidden of ['/books/adeptus-mechanicus/scripts/roster-data.js','/books/adeptus-mechanicus/assets/unknown.webp',
  '/books/shared/roster-v2/unknown.mjs','/books/tyranids/v2/generated/app-presentation.json'])
  assert.equal(allowed(forbidden),false,'Forbidden-resource negative control');
const requests=[],forbidden=[],missing=[],errors=[],httpErrors=[],requestFailures=[],navigationAborts=[],results=[];
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json',
  '.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff2':'font/woff2'};
const server=http.createServer((request,response)=>{
  const address=decodeURIComponent(new URL(request.url,'http://localhost').pathname);requests.push(address);
  if(address==='/favicon.ico'){response.writeHead(204);response.end();return;}
  if(!allowed(address)){forbidden.push(address);response.writeHead(404);response.end();return;}
  const file=path.resolve(repo,'.'+address);
  if(!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    missing.push(address);response.writeHead(404);response.end();return;
  }
  response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  response.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`,{chromium}=createRequire(import.meta.url)('playwright');
const browser=await launchQaBrowser(chromium,{headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const ids=[fixture.leader,fixture.fulgurite,fixture.corpuscarii,fixture.fulguriteDuplicate,fixture.corpuscariiDuplicate,fixture.unrelated];
const native=[fixture.fulgurite,fixture.corpuscarii,fixture.fulguriteDuplicate,fixture.corpuscariiDuplicate];
const canonicalProfiles={
  [fixture.leader]:'datasheet-tech-priest-dominus:profile:default',
  [fixture.fulgurite]:'datasheet-fulgurite-electro-priests:profile:default',
  [fixture.corpuscarii]:'datasheet-corpuscarii-electro-priests:profile:default',
  [fixture.fulguriteDuplicate]:'datasheet-fulgurite-electro-priests:profile:default',
  [fixture.corpuscariiDuplicate]:'datasheet-corpuscarii-electro-priests:profile:default',
  [fixture.unrelated]:'datasheet-skitarii-rangers:profile:default'
};
const grantSource='datasheet-tech-priest-dominus:section:1';
const fnpSelector='[data-ability-presentation-identity][data-canonical-ability-id="core-feel-no-pain"]';
const expectedValue=(id,bodyguard)=>bodyguard&&[fixture.leader,bodyguard].includes(id)?4:native.includes(id)?5:null;
const snapshot=page=>page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());
async function ready(page){
  await page.waitForFunction(()=>!!window.WarhammerAppV2);
  await page.evaluate(async()=>{await window.WarhammerAppV2.ready;await window.ArmyBookAppV2?.rosterPanel?.ready;});
  await page.waitForFunction(()=>[...document.querySelectorAll('link[rel="stylesheet"]')].every(link=>!!link.sheet));
}
async function roster(page){
  await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();await ready(page);
  await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();
}
async function imported(page){
  await roster(page);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(fixture.text);
  await page.locator('[data-roster-action="review-import"]').click();
  await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
  assert.match(await page.locator('.v2-roster-status').innerText(),/^Roster imported\./);
  assert.deepEqual((await snapshot(page)).units.map(unit=>unit.instanceId),ids);
  assert.equal(await page.locator('[data-roster-bindings] select').count(),0,'Source-backed unambiguous fixture must import without guessed binding');
}
async function ordinaryBook(page){
  for(const unit of ['unit-fulgurite-electro-priests','unit-corpuscarii-electro-priests']){
    const card=page.locator(`main .unit-card[data-card-id="${unit}"]`);
    await card.scrollIntoViewIfNeeded();
    const nativeReference=card.locator('[data-target-id="core-feel-no-pain"]');
    assert.equal(await nativeReference.count(),1,'Ordinary Army Book retains its one canonical native occurrence');
    assert.match(await nativeReference.innerText(),/Feel No Pain\s*5\+/i);
    assert.equal(await card.getAttribute('data-roster-instance-id'),null,'Ordinary source fact is not a roster override');
    results.push({viewport:page.viewportSize(),phase:'ordinary Army Book native 5+',unit,status:'PASS'});
  }
}
async function effective(page,id){
  await roster(page);await page.locator(`[data-roster-instances] > [data-roster-instance-id="${id}"] [data-roster-action="show-instance"]`).click();
  await page.locator('main .unit-card').first().waitFor();
}
async function guide(page,id){
  await page.getByRole('button',{name:'Personal guide',exact:true}).first().click();
  await page.locator(`main [data-roster-nav-instance-id="${id}"]`).first().click();await page.locator('main .unit-card').first().waitFor();
}
async function attach(page,bodyguard){
  await roster(page);await page.locator(`[data-attachment-candidate-for="${bodyguard}"]`).selectOption(fixture.leader);
  await page.locator(`[data-attachment-target-instance-id="${bodyguard}"] [data-roster-action="attach"]`).click();
  await page.locator(`[data-attached-leader-instance-id="${fixture.leader}"]`).waitFor();
}
async function detach(page){
  await roster(page);await page.locator(`[data-roster-action="detach"][data-leader-instance-id="${fixture.leader}"]`).click();
  await page.locator(`[data-attached-leader-instance-id="${fixture.leader}"]`).waitFor({state:'hidden'});
}
async function runtimeObservation(page){return page.evaluate(()=>window.ArmyBookAppV2.roster.projection.units.map(unit=>({
  id:unit.instanceId,models:unit.profiles.map(model=>({canonicalId:model.canonicalProfileId,scopeId:model.scopeId,
    fnp:model.abilities.filter(ability=>/^Feel No Pain(?:\s|$)/i.test(ability.name)),
    otherAbilities:model.abilities.filter(ability=>!/^Feel No Pain(?:\s|$)/i.test(ability.name)),
    profile:model.profile,weapons:model.weapons.map(weapon=>[weapon.canonicalProfileId,weapon.data])}))
})));}
function verifyRuntime(observed,bodyguard,baseline){
  for(const unit of observed){
    const expected=expectedValue(unit.id,bodyguard);assert.ok(unit.models.length,'Exact physical MODEL scopes survive');
    for(const model of unit.models){
      assert.equal(model.canonicalId,canonicalProfiles[unit.id]);
      assert.deepEqual(model.fnp.map(ability=>ability.value),expected===null?[]:[expected],`Numeric MODEL bag ${unit.id}/${model.scopeId}`);
      if(expected!==null)assert.equal(model.fnp[0].name,'Feel No Pain','No numeric parameter hidden in the ability name');
      if(baseline){const before=baseline.find(row=>row.id===unit.id).models.find(row=>row.scopeId===model.scopeId);
        assert.deepEqual(model.profile,before.profile,'Ordinary Save, Invulnerable Save and all other characteristics unchanged');
        assert.deepEqual(model.weapons,before.weapons);assert.deepEqual(model.otherAbilities,before.otherAbilities,'Independent native abilities survive');}
    }
  }
}
async function verify(page,bodyguard,phase,baseline){
  const observed=await runtimeObservation(page);verifyRuntime(observed,bodyguard,baseline);
  const cards=await page.locator('main .unit-card').evaluateAll((nodes,selector)=>nodes.map(card=>({
    id:card.dataset.rosterInstanceId,rows:[...card.querySelectorAll(selector)].map(node=>({
      identity:node.dataset.abilityPresentationIdentity,params:JSON.parse(node.dataset.abilityParameters),
      subject:node.dataset.recipientSubject,scopes:JSON.parse(node.dataset.recipientScopes).map(scope=>JSON.parse(scope)),text:node.innerText
    })),otherReferences:[...card.querySelectorAll('.shared-abilities [data-target-id]')]
      .filter(link=>link.dataset.targetId!=='core-feel-no-pain').map(link=>[link.dataset.targetId,link.innerText])
  })),fnpSelector);
  assert.ok(cards.length);const rowIdentities=[];
  for(const card of cards){
    const expected=expectedValue(card.id,bodyguard),models=observed.find(unit=>unit.id===card.id).models;
    assert.equal(card.rows.length,expected===null?0:1,`${phase}/${card.id}: exactly one current FNP, no contradictory 4+/5+`);
    if(expected!==null){const row=card.rows[0];rowIdentities.push(row.identity);
      assert.deepEqual(row.params,{value:expected});assert.equal(row.subject,'MODEL');
      assert.match(row.text,new RegExp(`Feel No Pain\\s*:?\\s*${expected}\\+`,'i'));
      assert.deepEqual(row.scopes.map(scope=>scope[0]),models.map(()=>card.id));
      assert.deepEqual(row.scopes.map(scope=>scope[1]),models.map(()=>canonicalProfiles[card.id]));
      assert.deepEqual(row.scopes.map(scope=>scope[2]).sort(),models.map(model=>model.scopeId).sort());
    }
    assert.ok(card.otherReferences.some(([id])=>id==='army-rule-doctrina-imperatives'),'Independent Doctrina Imperatives reference retained');
    if(card.id===fixture.leader)assert.ok(card.otherReferences.some(([id])=>id==='core-leader'),'Independent Leader ability retained');
    if(card.id===fixture.unrelated)assert.ok(card.otherReferences.some(([id])=>id==='core-scouts'),'Independent Scouts ability retained');
  }
  assert.equal(new Set(rowIdentities).size,rowIdentities.length);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Horizontal page overflow');
  results.push({viewport:page.viewportSize(),phase,bodyguard,cards,status:'PASS'});
}
async function verifyAll(page,bodyguard,phase,baseline){
  for(const id of ids){await effective(page,id);await verify(page,bodyguard,`${phase} / Effective ${id}`,baseline);
    await guide(page,id);await verify(page,bodyguard,`${phase} / Guide ${id}`,baseline);}
}
async function sourceReferences(page,bodyguard,baseline){
  await effective(page,bodyguard);
  await page.locator(`main .unit-card[data-roster-instance-id="${bodyguard}"] ${fnpSelector} [data-target-id="core-feel-no-pain"]`).click();
  await page.locator('dialog[open]').waitFor();assert.match(await page.locator('dialog[open]').innerText(),/Feel No Pain/i);
  await page.goBack();await page.locator('dialog[open]').waitFor({state:'hidden'});
  await page.locator(`main .unit-card[data-roster-instance-id="${fixture.leader}"] [data-target-id="${grantSource}"]`).filter({hasText:'Lord of the Machine Cult'}).click();
  await page.locator('dialog[open]').waitFor();const text=(await page.locator('dialog[open]').innerText()).replace(/\s+/g,' ');
  assert.match(text,/Lord of the Machine Cult/);assert.match(text,/Feel No Pain 5\+/);assert.match(text,/ELECTRO-PRIESTS/);assert.match(text,/Feel No Pain 4\+/);
  await page.goBack();await page.locator('dialog[open]').waitFor({state:'hidden'});
  await verify(page,bodyguard,'source-reference return',baseline);
}
async function navigation(page,bodyguard,baseline){
  await effective(page,bodyguard);await guide(page,bodyguard);const before=await snapshot(page),url=page.url();
  await page.reload();await ready(page);await verify(page,bodyguard,'reload',baseline);assert.deepEqual(await snapshot(page),before);
  await page.goBack();await ready(page);await page.goForward();await ready(page);await verify(page,bodyguard,'Back/Forward',baseline);
  await page.locator('[data-v2-primary-nav] [data-v2-destination="HOME"]').click();await ready(page);
  await page.goto(url);await ready(page);await verify(page,bodyguard,'direct URL',baseline);assert.deepEqual(await snapshot(page),before);
}
let failure=null;
try{
  for(const [device,viewport]of devices){
    const context=await browser.newContext({viewport}),page=await context.newPage();
    page.on('pageerror',error=>errors.push({device,error:error.message}));
    page.on('console',message=>{if(message.type()==='error')errors.push({device,error:message.text()});});
    page.on('response',response=>{if(response.status()>=400)httpErrors.push({device,url:response.url(),status:response.status()});});
    page.on('requestfailed',request=>{const row={device,url:request.url(),error:request.failure()?.errorText};
      (row.error==='net::ERR_ABORTED'?navigationAborts:requestFailures).push(row);});
    try{
      await page.goto(origin+'/v2/app.html');await ready(page);await page.locator('[data-v2-book="adeptus-mechanicus"]').click();await ready(page);
      await ordinaryBook(page);
      await imported(page);const baseline=await runtimeObservation(page);await verifyAll(page,null,'native baseline 5+',baseline);
      for(const bodyguard of [fixture.fulgurite,fixture.corpuscarii]){
        await attach(page,bodyguard);await verifyAll(page,bodyguard,'Dominus attached 4+',baseline);
        await sourceReferences(page,bodyguard,baseline);await navigation(page,bodyguard,baseline);
        await page.screenshot({path:path.join(out,`${device}-${bodyguard}-guide.png`),fullPage:true});
        await detach(page);await verifyAll(page,null,'detached baseline 5+',baseline);
        await attach(page,bodyguard);await effective(page,bodyguard);await verify(page,bodyguard,'reattached 4+',baseline);
        await guide(page,bodyguard);await verify(page,bodyguard,'reattached guide 4+',baseline);await detach(page);
      }
      await imported(page);await verifyAll(page,null,'repeat import preserves native 5+',baseline);
      await attach(page,fixture.fulguriteDuplicate);await verifyAll(page,fixture.fulguriteDuplicate,'grant reassigned to independent duplicate',baseline);
      await navigation(page,fixture.fulguriteDuplicate,baseline);
      await page.screenshot({path:path.join(out,`${device}-independent-duplicate.png`),fullPage:true});
    }catch(error){await page.screenshot({path:path.join(out,`FAIL-${device}.png`),fullPage:true}).catch(()=>{});
      fs.writeFileSync(path.join(out,'failure-page.txt'),await page.locator('body').innerText().catch(()=>''));throw error;
    }finally{await context.close();}
  }
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);assert.deepEqual(forbidden,[]);assert.deepEqual(httpErrors,[]);assert.deepEqual(requestFailures,[]);
}catch(error){failure={message:error.message,stack:error.stack};throw error;
}finally{
  const report={status:failure?'FAIL':'PASS',mainApplication:'/v2/app.html',realNewRecruitExportTested:false,
    devices:devices.length,checks:results.length,results,errors,missing,forbidden,httpErrors,requestFailures,navigationAborts,requests:[...new Set(requests)],failure};
  fs.writeFileSync(path.join(out,'admech-fnp-browser-report.json'),JSON.stringify(report,null,2)+'\n');
  await browser.close();await new Promise(resolve=>server.close(resolve));
  console.log(JSON.stringify({status:report.status,devices:devices.length,checks:results.length,jsErrors:errors.length,missing:missing.length,
    forbidden:forbidden.length,httpErrors:httpErrors.length,requestFailures:requestFailures.length,realNewRecruitExportTested:false,
    report:path.join(out,'admech-fnp-browser-report.json')}));
}
