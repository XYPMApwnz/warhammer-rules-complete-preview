import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
/** Main Unified V2, real application bytes and visible player actions only.
 * These source-backed New Recruit fixtures are constructed, not real exports. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {parseSourceFixtureJSON} from '../tests/helpers/source-refs-fixtures.mjs';
import {getRecordedSourceIdentity} from '../books/shared/source-refs-v2/source-refs.mjs';
import {chargeFixtures} from './charge-qa-fixtures.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';

const repo=fileURLToPath(new URL('../',import.meta.url));
const out=process.env.CHARGE_V2_SCREENSHOTS||createQaEvidenceDir('wh-charge-browser-');
fs.mkdirSync(out,{recursive:true});
const requirements=JSON.parse(fs.readFileSync(new URL('../books/shared/roster-v2/charge-source-expectations.json',import.meta.url),'utf8')).cases;
const sourceBooks=new Map();
function sourceBook(id){
  if(!sourceBooks.has(id)){
    const file={'death-guard':'rule-contract-effective','adeptus-mechanicus':'roster-runtime','chaos-space-marines':'roster-runtime','emperors-children':'roster-attachments'}[id];
    sourceBooks.set(id,parseSourceFixtureJSON(fs.readFileSync(path.join(repo,`books/${id}/v2/generated/${file}.json`),'utf8')));
  }
  return sourceBooks.get(id);
}
assert.equal(chargeFixtures.length,7);assert.deepEqual(chargeFixtures.map(c=>c.id).sort(),requirements.map(c=>c.id).sort());
const selectedIds=process.env.CHARGE_BROWSER_CASES?.split(',');
if(selectedIds)assert.ok(selectedIds.length&&selectedIds.every(id=>chargeFixtures.some(fixture=>fixture.id===id)),'Unknown focused browser fixture');
const fixtures=selectedIds?chargeFixtures.filter(fixture=>selectedIds.includes(fixture.id)):chargeFixtures;
const device=process.env.CHARGE_BROWSER_DEVICE;
assert.ok(!device||['desktop','mobile'].includes(device),'Unknown focused browser viewport');
const viewports=[...(!device||device==='desktop'?[{width:1440,height:900}]:[]),...(!device||device==='mobile'?[{width:390,height:844}]:[])];
// Concrete files in the existing V2 dependency roots, plus the exact declared
// artwork. No legacy script, arbitrary book assets or byte substitution.
const files=new Set(['/index.html','/assets/apple-touch-icon.png','/books/shared/datasheet-system.css','/books/shared/unit-art.css',
  '/books/adeptus-mechanicus/assets/mechanicus-logo.png',
  ...[1,2,3,4,5,6].map(value=>`/books/chaos-space-marines/assets/source-die-${value}.png`)]);
const addFiles=relative=>{
  for(const entry of fs.readdirSync(path.join(repo,relative),{recursive:true,withFileTypes:true}))if(entry.isFile()){
    const absolute=path.join(entry.parentPath,entry.name),address='/'+path.relative(repo,absolute).replaceAll('\\','/');
    if(/\.(?:mjs|js|css|json)$/.test(entry.name)&&!/(?:-qa\.|-fixtures\.|\/sources\/)/.test(address))files.add(address);
  }
};
for(const area of ['application-v2','army-book-app-v2','roster-v2','rule-contract-v2','source-refs-v2'])addFiles('books/shared/'+area);
for(const book of [...new Set(chargeFixtures.map(c=>c.bookId))]){
  addFiles('books/'+book+'/v2');
  const payload=JSON.parse(fs.readFileSync(path.join(repo,'books',book,'v2/generated/app-presentation.json'),'utf8'));
  const base=new URL('http://test/books/'+book+'/v2/');
  if(payload.bookPresentation.coverImage)files.add(new URL(payload.bookPresentation.coverImage,base).pathname);
  for(const art of Object.values(payload.datasheetPresentation.artwork))files.add(new URL('../'+art.asset,base).pathname);
}
const allowed=address=>isApplicationTestDependency(address)||files.has(address);
for(const forbidden of ['/books/death-guard/scripts/data.js','/books/emperors-children/scripts/roster-data.js',
  '/books/tyranids/v2/generated/app-presentation.json','/books/chaos-space-marines/assets/unknown.webp',
  '/books/shared/roster-v2/unknown.mjs'])assert.equal(allowed(forbidden),false,'Forbidden-resource negative control');
const errors=[],missing=[],forbidden=[],requests=[],results=[],httpErrors=[],requestFailures=[],navigationAborts=[];
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json',
  '.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff2':'font/woff2'};
const server=http.createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname),address=pathname==='/'?'/index.html':pathname;requests.push(address);
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
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await launchChromium();
const normalize=text=>text.replace(/\s+/g,' ').trim();
const metricSelector='main .ds-effective-unit-metric[data-unit-metric="chargeRoll"]';
async function ready(page){
  await page.waitForFunction(()=>!!window.WarhammerAppV2);
  await page.evaluate(async()=>{await window.WarhammerAppV2.ready;await window.ArmyBookAppV2?.rosterPanel?.ready;});
  await page.waitForFunction(()=>[...document.querySelectorAll('link[rel="stylesheet"]')].every(link=>!!link.sheet));
}
async function roster(page){
  await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();await ready(page);
  await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();
}
async function imported(page,fixture,text){
  await roster(page);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
  await page.locator('[data-roster-action="review-import"]').click();
  await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
  const replace=page.locator('[data-roster-action="confirm-replace-roster"]');
  if(await replace.count()){await replace.click();await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));}
  assert.match(await page.locator('.v2-roster-status').innerText(),/^Roster imported\./,fixture.id+' import must be READY');
  assert.equal(await page.evaluate(()=>window.ArmyBookAppV2.roster.state.bookId),fixture.bookId);
  assert.deepEqual(await page.evaluate(()=>window.ArmyBookAppV2.roster.state.units.map(unit=>unit.instanceId).sort()),
    [...new Set([...fixture.enabled,...fixture.negative])].sort(),'Every explicit source and negative physical instance must survive import');
}
async function effective(page,id){
  await roster(page);await page.locator(`[data-roster-instances] > [data-roster-instance-id="${id}"] [data-roster-action="show-instance"]`).click();
  await page.locator('main .unit-card').first().waitFor();
}
async function guide(page,id){
  await page.getByRole('button',{name:'Personal guide',exact:true}).first().click();
  await page.locator(`main [data-roster-nav-instance-id="${id}"]`).first().click();await page.locator('main .unit-card').first().waitFor();
}
async function attach(page,leader,bodyguard){
  await roster(page);await page.locator(`[data-attachment-candidate-for="${bodyguard}"]`).selectOption(leader);
  await page.locator(`[data-attachment-target-instance-id="${bodyguard}"] [data-roster-action="attach"]`).click();
  await page.locator(`[data-attached-leader-instance-id="${leader}"]`).waitFor();
}
async function detach(page,leader){
  await roster(page);await page.locator(`[data-roster-action="detach"][data-leader-instance-id="${leader}"]`).click();
  await page.locator(`[data-attached-leader-instance-id="${leader}"]`).waitFor({state:'hidden'});
}
const snapshot=page=>page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());
async function combat(page){return page.evaluate(()=>window.ArmyBookAppV2.roster.projection.units.map(unit=>({
  id:unit.instanceId,canonicalId:unit.canonicalUnitId,
  profiles:unit.profiles.map(model=>({id:model.canonicalProfileId,scope:model.scopeId,M:model.profile.stats?.M??model.profile.M,
    weapons:model.weapons.map(weapon=>[weapon.canonicalProfileId,weapon.data])})),
  weapons:unit.weapons.map(weapon=>[weapon.canonicalProfileId,weapon.data])
})));}
function unchangedCombat(before,after){
  for(const current of after){const original=before.find(unit=>unit.id===current.id&&unit.canonicalId===current.canonicalId);
    if(original)assert.deepEqual(current,original,'Charge activation/removal/attachment cannot alter Movement or selected weapon profiles');}
}
async function verify(page,fixture,enabled,phase){
  const requirement=requirements.find(r=>r.id===fixture.id),visible=await page.locator('main .unit-card').evaluateAll(nodes=>nodes.map(node=>node.dataset.rosterInstanceId));
  const recipients=visible.filter(id=>enabled.includes(id)),nodes=page.locator(metricSelector);
  assert.equal(await nodes.count(),0,fixture.id+' '+phase+' source text replaces the UNIT annotation');
  for(const recipient of recipients){
    const current=await page.evaluate(id=>window.ArmyBookAppV2.roster.effective(id),recipient);
    assert.equal(current.unitMetrics.chargeRoll.modifier,requirement.presentation.value,'Unchanged computed UNIT value');
    const sources=current.unitMetricSources.filter(source=>source.field==='chargeRoll');
    assert.equal(sources.length,1,'No repeated contribution from multiple MODEL profiles');
    const source=sources[0];assert.equal(source.ruleId,requirement.source.canonicalId);
    assert.equal(source.sourceInstanceId,fixture.id==='am-gait'?recipient:fixture.source);
    assert.equal(source.operation,requirement.expectedOperation.operation);assert.equal(source.field,'chargeRoll');
    assert.equal(source.unitScope,'FORMED');assert.equal(source.targetModelInstanceId,null);
    assert.equal(source.targetInstanceId,recipient);
    assert.deepEqual(source.sourceFields,[requirement.source.field]);
    assert.ok(getRecordedSourceIdentity(source,{book:sourceBook(fixture.bookId)}),'Canonical source identity remains proven');
    const card=page.locator('main .unit-card[data-roster-instance-id="'+recipient+'"]');
    const fieldId=requirement.source.canonicalId+'::/'+requirement.source.field.join('/');
    const texts=await card.locator('[data-fact-id]').evaluateAll((nodes,id)=>nodes.filter(node=>node.dataset.factId===id&&node.getClientRects().length).map(node=>node.textContent),fieldId);
    const attached=await card.locator('[data-attached-rule-id="'+requirement.source.canonicalId+'"]').evaluateAll(nodes=>nodes.filter(node=>node.getClientRects().length).map(node=>node.querySelector('h5').textContent+':'+node.querySelector('[data-attached-rule-text]').textContent));
    assert.ok([...texts,...attached].some(text=>text.includes(requirement.source.quote)),'Original source text is visible on this recipient card');
  }
  assert.equal(await page.locator('main .model-profile .ds-effective-unit-metric').count(),0,'Charge is not a MODEL bonus');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Page horizontal overflow');
  const state=await page.evaluate(()=>({units:window.ArmyBookAppV2.roster.projection.units.map(unit=>({id:unit.instanceId,
    modifier:unit.metrics.chargeRoll?.modifier??0,modelModifiers:unit.profiles.map(model=>model.metrics.chargeRoll??null)})),
    chargeRollResult:window.ArmyBookAppV2.roster.projection.chargeRollResult}));
  for(const unit of state.units){assert.equal(unit.modifier,enabled.includes(unit.id)?requirement.expectedDelta:0,fixture.id+' exact physical runtime recipient '+unit.id);
    assert.ok(unit.modelModifiers.every(value=>value===null));}
  assert.equal(state.chargeRollResult,undefined,'No automatic Charge roll');
  results.push({fixture:fixture.id,viewport:page.viewportSize(),phase,visible,recipients,modifier:recipients.length?1:0,status:'PASS'});
}
async function verifyAll(page,fixture,enabled,phase){
  const ids=(await snapshot(page)).units.map(unit=>unit.instanceId);
  for(const id of ids){await effective(page,id);await verify(page,fixture,enabled,phase+' / Effective '+id);
    await guide(page,id);await verify(page,fixture,enabled,phase+' / Guide '+id);}
}
async function navigation(page,fixture,enabled){
  await effective(page,fixture.source);await guide(page,fixture.source);
  const before=await snapshot(page),url=page.url();
  await page.reload();await ready(page);await verify(page,fixture,enabled,'reload');assert.deepEqual(await snapshot(page),before);
  await page.goBack();await ready(page);await page.goForward();await ready(page);await verify(page,fixture,enabled,'Back/Forward');
  await page.locator('[data-v2-primary-nav] [data-v2-destination="HOME"]').click();await ready(page);
  await page.goto(url);await ready(page);await verify(page,fixture,enabled,'direct URL');assert.deepEqual(await snapshot(page),before);
  const requirement=requirements.find(r=>r.id===fixture.id);
  await page.locator(`main .unit-card [data-target-id="${requirement.source.canonicalId}"]`).first().click();
  await page.locator('dialog[open]').waitFor();assert.ok(normalize(await page.locator('dialog[open]').innerText()).includes(normalize(requirement.source.quote)),
    'The inline source links to its complete unchanged rule, including conditional clauses');
  await page.goBack();await page.locator('dialog[open]').waitFor({state:'hidden'});await verify(page,fixture,enabled,'source reference return');
  await page.screenshot({path:path.join(out,`${page.viewportSize().width}-${fixture.id}.png`),fullPage:true});
}
let failure=null;
try{
  for(const viewport of viewports)for(const fixture of fixtures){
    const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage();
    page.on('pageerror',error=>errors.push({fixture:fixture.id,viewport,error:error.message}));
    page.on('console',message=>{if(message.type()==='error')errors.push({fixture:fixture.id,viewport,error:message.text()});});
    page.on('response',response=>{if(response.status()>=400)httpErrors.push({fixture:fixture.id,viewport,url:response.url(),status:response.status()});});
    page.on('requestfailed',request=>{
      const row={fixture:fixture.id,viewport,url:request.url(),error:request.failure()?.errorText};
      // Page/route changes intentionally cancel in-flight requests. Keep an
      // auditable record; all other failed transports are acceptance failures.
      (row.error==='net::ERR_ABORTED'?navigationAborts:requestFailures).push(row);
    });
    try{
      await page.goto(origin+'/v2/app.html');await ready(page);await page.locator(`[data-v2-book="${fixture.bookId}"]`).click();await ready(page);
      if(!fixture.bodyguard){
        await imported(page,fixture,fixture.disabledText);await verifyAll(page,fixture,[],'baseline / Instrument not selected or source absent');
        await imported(page,fixture,fixture.text);const baseCombat=await combat(page);await verifyAll(page,fixture,fixture.enabled,'enabled');
        await imported(page,fixture,fixture.disabledText);await verifyAll(page,fixture,[],'removed');unchangedCombat(baseCombat,await combat(page));
        await imported(page,fixture,fixture.text);await verifyAll(page,fixture,fixture.enabled,'reselected');unchangedCombat(baseCombat,await combat(page));
        await navigation(page,fixture,fixture.enabled);unchangedCombat(baseCombat,await combat(page));
      }else{
        await imported(page,fixture,fixture.text);const baseCombat=await combat(page),standalone=fixture.standalone?[fixture.source]:[];
        await verifyAll(page,fixture,standalone,'standalone');
        await attach(page,fixture.source,fixture.bodyguard);await verifyAll(page,fixture,fixture.enabled,'attached');unchangedCombat(baseCombat,await combat(page));
        await detach(page,fixture.source);await verifyAll(page,fixture,standalone,'detached');unchangedCombat(baseCombat,await combat(page));
        await attach(page,fixture.source,fixture.otherBodyguard);await verifyAll(page,fixture,[fixture.source,fixture.otherBodyguard],'reattached to independent Bodyguard');
        await detach(page,fixture.source);await attach(page,fixture.source,fixture.bodyguard);
        const wrongLeader=fixture.id==='csm-daemonkin'?'parsed-unit-5':'parsed-unit-2';
        await attach(page,wrongLeader,fixture.otherBodyguard);await verifyAll(page,fixture,fixture.enabled,'independent Character without source');
        unchangedCombat(baseCombat,await combat(page));await detach(page,wrongLeader);
        if(fixture.id==='csm-daemonkin')await detach(page,fixture.source);else await imported(page,fixture,fixture.disabledText);
        await verifyAll(page,fixture,[],'source gate removed');unchangedCombat(baseCombat,await combat(page));
        await imported(page,fixture,fixture.text);await attach(page,fixture.source,fixture.bodyguard);await verifyAll(page,fixture,fixture.enabled,'source gate restored');
        await navigation(page,fixture,fixture.enabled);unchangedCombat(baseCombat,await combat(page));
      }
    }catch(error){await page.screenshot({path:path.join(out,`FAIL-${viewport.width}-${fixture.id}.png`),fullPage:true}).catch(()=>{});
      fs.writeFileSync(path.join(out,'failure-page.txt'),await page.locator('body').innerText().catch(()=>''));throw error;
    }finally{await context.close();}
  }
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);assert.deepEqual(forbidden,[]);
  assert.deepEqual(httpErrors,[]);assert.deepEqual(requestFailures,[]);
}catch(error){failure={message:error.message,stack:error.stack};throw error;
}finally{
  const report={status:failure?'FAIL':'PASS',mainApplication:'/v2/app.html',fixtures:fixtures.length,devices:viewports.length,checks:results.length,
    realNewRecruitExportTested:false,results,errors,missing,forbidden,httpErrors,requestFailures,navigationAborts,requests:[...new Set(requests)],failure};
  fs.writeFileSync(path.join(out,'charge-effects-browser-report.json'),JSON.stringify(report,null,2)+'\n');
  await browser.close();await new Promise(resolve=>server.close(resolve));
  console.log(JSON.stringify({status:report.status,fixtures:fixtures.length,devices:viewports.length,checks:results.length,jsErrors:errors.length,missing:missing.length,
    forbidden:forbidden.length,httpErrors:httpErrors.length,requestFailures:requestFailures.length,
    realNewRecruitExportTested:false,report:path.join(out,'charge-effects-browser-report.json')}));
}
