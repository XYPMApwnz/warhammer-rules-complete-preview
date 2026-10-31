import {createQaEvidenceDir} from '../../../tests/helpers/qa-temp.mjs';
import {launchQaBrowser} from '../../../tests/helpers/qa-browser.cjs';
/** Main Unified V2 consumer acceptance. Ordinary user actions only; evaluate
 * inspects DOM/runtime/storage, never changes them. Constructed INPUT is
 * explicitly separate from genuine New Recruit export evidence. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const repo=fileURLToPath(new URL('../../../',import.meta.url));
const out=process.env.SM_APP_BROWSER_OUT||createQaEvidenceDir('app-browser-qa-');
fs.mkdirSync(out,{recursive:true});
const prefix='/warhammer-rules-complete-preview';
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const payload=read(new URL('./generated/app-presentation.json',import.meta.url));
const facts=read(new URL('./generated/effective.json',import.meta.url));
const result={status:'RUNNING',realNewRecruitExportTested:false,results:[],screenshots:[],requests:[],errors:[]};
const types={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json',
  '.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const server=http.createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
  if(pathname==='/favicon.ico'||pathname===prefix+'/favicon.ico'){response.writeHead(204);response.end();return;}
  const address=pathname.startsWith(prefix+'/')?pathname.slice(prefix.length):pathname;
  const file=path.resolve(repo,'.'+address);
  if(!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    response.writeHead(404);response.end();return;
  }
  response.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  response.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await launchQaBrowser(chromium,{headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
let page,device;
const record=(name,detail={})=>{result.results.push({device,name,status:'PASS',...detail});console.log(device+' '+name+' PASS');};
async function ready(){
  await page.waitForFunction(()=>Boolean(window.WarhammerAppV2));
  await page.evaluate(async()=>{await window.WarhammerAppV2.ready;await window.ArmyBookAppV2?.rosterPanel?.ready;});
}
async function shot(name){const file=device+'-'+name+'.png';await page.screenshot({path:path.join(out,file),fullPage:false});result.screenshots.push(file);}
async function roster(){await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();await ready();await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();}
const state=()=>page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());
async function importText(text,{replace=true}={}){
  await roster();await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
  await page.locator('[data-roster-action="review-import"]').click();
  await page.waitForFunction(()=>!document.querySelector('[data-roster-view][aria-busy="true"]'));
  if(replace&&await page.locator('[data-roster-action="confirm-replace-roster"]').count()){
    await page.locator('[data-roster-action="confirm-replace-roster"]').click();
    await page.waitForFunction(()=>!document.querySelector('[data-roster-view][aria-busy="true"]'));
  }
  return page.locator('.v2-roster-status').innerText();
}
async function effective(id){await roster();await page.locator(`[data-roster-instances] > [data-roster-instance-id="${id}"] [data-roster-action="show-instance"]`).click();await page.locator('main .unit-card').first().waitFor();}
async function guide(id){await roster();await page.locator('[data-roster-action="open-personal-guide"]').click();await page.locator(`main [data-roster-nav-instance-id="${id}"]`).first().click();await page.locator('main .unit-card').first().waitFor();}
async function attach(leader,target){await roster();await page.locator(`[data-attachment-candidate-for="${target}"]`).selectOption(leader);await page.locator(`[data-attachment-target-instance-id="${target}"] [data-roster-action="attach"]`).click();await page.locator(`[data-attached-leader-instance-id="${leader}"]`).waitFor();}
async function detach(leader){await roster();await page.locator(`[data-roster-action="detach"][data-leader-instance-id="${leader}"]`).click();await page.waitForFunction(id=>!window.ArmyBookAppV2.roster.state.attachments.some(row=>row.leaderInstanceId===id),leader);}
async function geometry(){
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Horizontal overflow');
  assert.equal(await page.locator('img').evaluateAll(nodes=>nodes.some(node=>node.complete&&node.naturalWidth===0)),false,'Broken image');
}
async function bookHome(){await page.locator('[data-v2-primary-nav] [data-v2-destination="HOME"]').click();await page.locator('[data-v2-book="space-marines"]').click();await ready();await page.locator('[data-army-book-v2]').waitFor();}
async function openCanonical(id){
  await bookHome();const direct=page.locator(`main a.v2-library-card[data-target-id="${id}"]`);
  if(await direct.count())await direct.first().click();
  else{
    const parent=facts.entities.find(entity=>entity.id===id)?.parentId;assert.ok(parent,'Missing source rule owner');
    await page.locator(`main a.v2-library-card[data-target-id="${parent}"]`).first().click();
  }
  await page.locator(`main [data-card-id="${id}"]`).first().waitFor();
  await page.locator(`main [data-card-id="${id}"]`).first().scrollIntoViewIfNeeded();
}
async function physicalParity(fixture){
  const actual=await state();assert.equal(actual.units.length,fixture.physicalUnits);
  assert.equal(new Set(actual.units.map(unit=>unit.instanceId)).size,fixture.physicalUnits);
  assert.equal(actual.units.reduce((sum,unit)=>sum+unit.startingStrength,0),fixture.models);
  for(const [n,expected]of fixture.units.entries()){
    const unit=actual.units[n];assert.equal(unit.canonicalUnitId,expected.canonicalUnitId);assert.equal(unit.startingStrength,expected.models);
    assert.equal(unit.modelRows.length,expected.modelRows.length);
    const checkSelections=(selected,expectedRows)=>{
      assert.equal(selected.length,expectedRows.length,'Extra/default/omitted selection');
      for(const expected of expectedRows){
        const match=selected.filter(selection=>expected.canonicalIds.every(id=>[...selection.canonicalProfileIds,...selection.canonicalEquipmentIds].includes(id)));
        assert.equal(match.length,1,'Wrong selected identity');assert.equal(match[0].physicalQuantity,expected.quantity);
        assert.ok(match[0].quantityEvidence,'Quantity provenance lost');
      }
    };
    checkSelections(unit.selections,expected.unitInventory);
    for(const [i,row]of unit.modelRows.entries()){
      const expectedRow=expected.modelRows[i];assert.equal(row.quantity,expectedRow.quantity);assert.equal(row.compositionMemberId,expectedRow.memberId);
      checkSelections(row.selections,expectedRow.weapons);
    }
    assert.deepEqual(unit.enhancementIds,expected.enhancement?[expected.enhancement]:[]);
  }
  assert.deepEqual(actual.detachmentIds,fixture.detachmentIds);return actual;
}
async function staticEffects(fixture,route){
  for(const expected of fixture.effectExpectations){
    await (route==='Effective'?effective:guide)(expected.instanceId);
    if(expected.unitMetric){
      const node=page.locator(`main .ds-effective-unit-metric[data-unit-metric="${expected.unitMetric}"]`);
      assert.equal(await node.count(),1);assert.equal(await node.getAttribute('data-metric-modifier'),String(expected.modifier));
      assert.equal(await node.getAttribute('data-recipient-subject'),'UNIT');
      const sources=JSON.parse(await node.getAttribute('data-metric-sources'));assert.deepEqual(sources.map(source=>source.ruleId).sort(),[...expected.sources].sort());
      for(const source of expected.sources)assert.ok(await node.locator(`[data-target-id="${source}"]`).count(),'Visible source link absent');
      assert.ok((await node.innerText()).includes(String(expected.modifier)));
      assert.equal(await page.locator('main .model-profile .ds-effective-unit-metric').count(),0);
      await node.scrollIntoViewIfNeeded();await shot(route.toLowerCase()+'-'+expected.unitMetric+'-'+expected.instanceId);
      if(expected.advanceRoll){
        assert.equal(await page.locator('main [data-unit-metric="advanceRoll"]').count(),0);
        assert.match(await page.locator('main').innerText(),/Advance.+Charge|Advance[\s\S]+charge/i,'Full Advance condition text lost');
      }
    }else{
      const row=page.locator(`main .weapon-row[data-card-id="${expected.weaponId}"]`).first();await row.waitFor();
      for(const [field,label]of Object.entries({strength:'S',ap:'AP'})){
        const cell=row.locator(`[data-label="${label}"]`);assert.equal((await cell.locator('[data-fact-id]').first().innerText()).trim(),expected.effective[field]);
      }
      if(expected.source){
        const traces=await row.locator('.ds-modifier-breakdown').evaluateAll(nodes=>nodes.map(node=>JSON.parse(node.dataset.ruleIds)));
        assert.ok(traces.some(ids=>ids.includes(expected.source)),'Physical modifier trace lost its source');
        const source=page.locator(`main [data-enhancement-owner-instance-id="${expected.instanceId}"][data-card-id="${expected.source}"]`);
        assert.equal(await source.count(),1);assert.match(await source.innerText(),/MODEL bearer: Captain/);
        assert.ok((await source.innerText()).includes(facts.entities.find(entity=>entity.id===expected.source).data.text));
        // Existing numeric breakdowns show arithmetic. Their named source and
        // full condition text are in Selected Enhancements, not inline links.
        result.numericModifierSourceUI='SELECTED_ENHANCEMENT_SECTION_NOT_INLINE_NAMED_LINK';
        await source.scrollIntoViewIfNeeded();await shot(route.toLowerCase()+'-enhancement-source');
      }
    }
    await geometry();record(route+' source-backed effect',{instanceId:expected.instanceId});
  }
  await shot(route.toLowerCase()+'-effects');
}
try{
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
    device=viewport.width===1440?'desktop':'mobile';const context=await browser.newContext({viewport});page=await context.newPage();page.setDefaultTimeout(25000);
    page.on('pageerror',error=>result.errors.push({device,type:'js',message:error.message}));
    page.on('console',message=>{if(message.type()==='error')result.errors.push({device,type:'console',message:message.text()});});
    page.on('response',response=>{result.requests.push({device,url:response.url(),status:response.status()});if(response.status()>=400)result.errors.push({device,type:'http',url:response.url(),status:response.status()});});
    page.on('requestfailed',request=>{if(request.failure()?.errorText!=='net::ERR_ABORTED')result.errors.push({device,type:'request',url:request.url(),message:request.failure()?.errorText});});
    await page.goto(origin+prefix+'/v2/app.html');await ready();assert.equal(await page.locator('[data-v2-book]').count(),7);await geometry();await shot('home-seven');record('Home 7/7');
    await page.locator('[data-v2-book="space-marines"]').click();await ready();await page.locator('[data-army-book-v2]').waitFor();await geometry();await shot('sm-home');
    const library=await page.locator('main a.v2-library-card[data-target-id]').evaluateAll(nodes=>nodes.map(node=>node.dataset.targetId));
    for(const kind of ['DATASHEET','DETACHMENT','ENHANCEMENT','STRATAGEM']){
      const ids=facts.entities.filter(entity=>entity.kind===kind).map(entity=>entity.id);
      if(['DATASHEET','DETACHMENT'].includes(kind))for(const id of ids)assert.ok(library.includes(id),'Missing visible library link '+id);
      const rendered=await page.locator('main .v1-contents-pages [data-card-id]').evaluateAll(nodes=>nodes.map(node=>node.dataset.cardId));
      for(const id of ids)assert.ok(rendered.includes(id),'Missing actual reader record '+id);
      record(kind+' library coverage',{count:ids.length});
    }
    for(const kind of ['DATASHEET','DETACHMENT','ENHANCEMENT','STRATAGEM']){
      const entity=facts.entities.find(entity=>entity.kind===kind);await openCanonical(entity.id);await geometry();await shot(kind.toLowerCase());
      const visible=await page.locator(`main [data-card-id="${entity.id}"]`).first().innerText();assert.ok(visible.includes(entity.data.title));
      record(kind+' reader');
    }
    const fixtureFile=process.env.SM_APP_BROWSER_FIXTURES||path.join(out,'../browser-fixtures.json');
    const fixtures=read(fixtureFile);
    // Scenario-specific checks below use frozen constructed INPUT and source
    // expectations, never values computed by the tested runtime as EXPECTED.
    const fixed=fixtures.staticRoster;if(!fixed)throw new Error('Missing source-backed browser fixtures');
    const status=await importText(fixed.text);assert.match(status,/^Roster imported\./);await physicalParity(fixed);record('constructed physical import',{units:fixed.physicalUnits,models:fixed.models});
    result.fixtureKeys=Object.keys(fixtures);
    await shot('import');
    await staticEffects(fixed,'Effective');await staticEffects(fixed,'Guide');
    // Every imported unit is opened through both real user-facing routes.
    for(let n=0;n<fixed.units.length;n++)for(const route of ['Effective','Guide']){
      await (route==='Effective'?effective:guide)('parsed-unit-'+(n+1));
      const visible=await page.locator('main').innerText();assert.ok(visible.includes(fixed.units[n].title));
      const expectedWeapons=new Map();for(const row of fixed.units[n].modelRows)for(const weapon of row.weapons)for(const id of weapon.canonicalIds)expectedWeapons.set(id,(expectedWeapons.get(id)||0)+weapon.quantity);
      for(const [id,quantity]of expectedWeapons){
        const rows=page.locator(`main .weapon-row[data-card-id="${id}"] .ds-weapon-quantity`);
        const actual=await rows.evaluateAll(nodes=>nodes.reduce((sum,node)=>sum+Number(node.textContent.replace(/\D/g,'')),0));
        assert.equal(actual,quantity,'Visible selected weapon quantity differs');
      }
      record(route+' physical wargear',{instanceId:'parsed-unit-'+(n+1)});
    }
    const edge=fixed.attachments[0];await attach(edge.leaderInstanceId,edge.bodyguardInstanceId);const attached=await state();assert.equal(attached.attachments.length,1);
    for(const route of ['Effective','Guide']){
      await (route==='Effective'?effective:guide)(edge.bodyguardInstanceId);
      const visible=await page.locator('main').innerText();assert.ok(visible.includes('Laurels of Triumph'));assert.ok(visible.includes('Captain'));assert.ok(visible.includes('Intercessor'));
      await shot(route.toLowerCase()+'-formation');record(route+' attached formation');
    }
    await importText(fixed.text);assert.deepEqual(await state(),attached);record('identical reimport preserves attachment');
    await page.reload();await ready();await roster();assert.deepEqual(await state(),attached);record('reload preserves physical roster');
    await detach(edge.leaderInstanceId);const detached=await state();await importText(fixed.text);assert.deepEqual(await state(),detached);record('explicit detach preserved');
    await attach(edge.leaderInstanceId,edge.bodyguardInstanceId);record('reattach');
    const stable=await state();await importText(fixtures.paidCombined.text,{replace:false});assert.ok(await page.locator('[data-roster-action="confirm-replace-roster"]').count());assert.deepEqual(await state(),stable);
    await page.locator('[data-roster-action="cancel-replace-roster"]').click();assert.deepEqual(await state(),stable);record('changed-input cancellation atomic');
    await importText(fixtures.paidCombined.text);await physicalParity(fixtures.paidCombined);
    const points=await page.evaluate(()=>window.ArmyBookAppV2.roster.points);
    assert.equal(points.status,'RESOLVED');assert.deepEqual(points.units.map(unit=>unit.paid.totalPaidPoints),fixtures.paidCombined.expectedPaidPerUnit);
    for(const [n,expected]of fixtures.paidCombined.units.entries())assert.equal(points.units[n].basePoints,expected.basePointsSource.value);
    const expectedTotal=fixtures.paidCombined.units.reduce((sum,unit)=>sum+unit.basePointsSource.value,0)+fixtures.paidCombined.expectedPaidPerUnit.reduce((a,b)=>a+b,0);
    assert.equal(points.totalPoints,expectedTotal);record('all eight paid options selected/unselected',{runtimePoints:expectedTotal,aggregateRosterTotalUi:'NOT_PRESENT_EXISTING_UI'});
    for(let n=0;n<fixtures.paidCombined.units.length;n+=2){
      await effective('parsed-unit-'+(n+1));const visible=await page.locator('main').innerText();assert.ok(visible.includes(fixtures.paidCombined.units[n].unitInventory[0].label));
      assert.ok(await page.locator('main .ds-paid-upgrade').count(),'Source-backed paid cost reference absent');
    }
    await shot('paid-equipment');
    const paidSaved=await state();await importText(fixtures.paidCombined.text);assert.deepEqual(await state(),paidSaved);record('paid inventory reimport');
    for(const fixture of fixtures.cato){
      await importText(fixture.text);await physicalParity(fixture);await attach(fixture.attachment.leaderInstanceId,fixture.attachment.bodyguardInstanceId);
      assert.equal((await state()).attachments[0].role,fixture.attachment.role);
      const caption=(fixture.attachment.role==='SUPPORT'?'Supported by':'Led by')+' Cato Sicarius';
      assert.ok((await page.locator(`[data-attachment-target-instance-id="${fixture.attachment.bodyguardInstanceId}"]`).innerText()).includes(caption));
      await effective(fixture.attachment.bodyguardInstanceId);assert.ok((await page.locator('main').innerText()).includes(caption));
      await guide(fixture.attachment.bodyguardInstanceId);assert.ok((await page.locator('main').innerText()).includes(caption));record(fixture.id,{role:fixture.attachment.role,visibleCaption:caption});
      const ownCaption=(fixture.attachment.role==='SUPPORT'?'Supporting':'Leading')+': Victrix Honour Guard';
      for(const route of ['Effective','Guide']){await (route==='Effective'?effective:guide)(fixture.attachment.leaderInstanceId);assert.ok((await page.locator('main').innerText()).includes(ownCaption));}
      await detach(fixture.attachment.leaderInstanceId);await attach(fixture.attachment.leaderInstanceId,fixture.attachment.bodyguardInstanceId);
      assert.equal((await state()).attachments[0].role,fixture.attachment.role);record(fixture.id+' detach/reattach');
    }
    await importText(fixtures.upgrade.text);await physicalParity(fixtures.upgrade);
    for(const route of ['Effective','Guide'])for(const [id,granted]of [[fixtures.upgrade.positive,true],[fixtures.upgrade.negative,false]]){
      await (route==='Effective'?effective:guide)(id);const visible=await page.locator('main').innerText();
      assert.equal(visible.toUpperCase().includes(fixtures.upgrade.expectedGrant.toUpperCase()),granted,'UNIT Upgrade leaks to independent recipient');
      record(route+' UNIT Upgrade isolation',{instanceId:id});
    }
    await roster();const valid=await state(),storage=await page.evaluate(()=>localStorage.getItem('army-book-app-v2:roster:space-marines'));
    const invalidStatus=await importText(fixtures.negativeUpgrade.text);assert.ok(!invalidStatus.startsWith('Roster imported.'));assert.deepEqual(await state(),valid);
    assert.equal(await page.evaluate(()=>localStorage.getItem('army-book-app-v2:roster:space-marines')),storage);record('invalid Upgrade import preserves runtime and storage');
    await effective(fixtures.upgrade.positive);const effectUrl=page.url();await page.goBack();await ready();await page.goForward();await ready();assert.equal(page.url(),effectUrl);record('Back/Forward');
    await page.locator('[data-v2-primary-nav] [data-v2-destination="GLOSSARY"]').click();await page.locator('[data-global-glossary]').waitFor();await geometry();
    const search=page.locator('[data-global-glossary] input[type="search"]');await search.fill('Laurels of Triumph');
    await page.getByRole('link',{name:/Laurels of Triumph/}).first().click();
    await page.getByRole('link',{name:'Open full entry',exact:true}).click();
    assert.match(await page.locator('main').innerText(),/Laurels of Triumph/);await shot('mega-glossary');record('Mega Glossary source reference');
    const glossary=read(new URL('../../../glossary/v2/generated/index.en.json',import.meta.url));
    const sourceWeapons=fixtures.staticRoster.units[0].modelRows[0].weapons;
    for(const weapon of sourceWeapons){
      const source=facts.entities.find(entity=>entity.id===weapon.canonicalIds[0]);
      const entry=glossary.entries.find(entry=>entry.sourceOwner.bookId==='space-marines'&&entry.sourceOwner.canonicalId===source.id);
      assert.ok(entry,'Missing source-owned glossary weapon');
      const expectedMode=source.data.range==='Melee'?'melee':'ranged';
      if(expectedMode==='ranged')assert.equal(entry.facts.mode,'ranged');
      else assert.ok(entry.facts.mode===undefined||entry.facts.mode==='melee');
      await page.locator('[data-v2-primary-nav] [data-v2-destination="GLOSSARY"]').click();
      await page.locator('[data-global-glossary] input[type="search"]').fill(source.data.name);
      await page.locator(`main a[data-target-id="${entry.id}"]`).first().click();
      await page.getByRole('link',{name:'Open full entry',exact:true}).click();
      const visible=await page.locator('main').innerText();assert.ok(visible.includes(source.data.name));
      assert.match(visible,new RegExp('^'+expectedMode+'\\s*·','im'),'Glossary weapon type differs from source Range');
      await shot('glossary-'+expectedMode);record('Mega Glossary '+expectedMode+' weapon');
    }
    await page.locator('[data-v2-primary-nav] [data-v2-destination="GLOSSARY"]').click();
    await page.locator('[data-global-glossary] input[type="search"]').fill('Cato Sicarius');
    const cato=glossary.entries.find(entry=>entry.sourceOwner.bookId==='space-marines'&&entry.sourceOwner.canonicalId==='unit-sm-02d5dee4717544ad');
    await page.locator(`main a[data-target-id="${cato.id}"]`).first().click();
    await page.getByRole('link',{name:'Open full entry',exact:true}).click();
    const catoVisible=await page.locator('main').innerText();
    assert.ok(catoVisible.includes('Leader (conditional; Marneus Calgar absent in army): Victrix Honour Guard'));
    assert.ok(catoVisible.includes('Support (conditional; Marneus Calgar present in army): Victrix Honour Guard'));
    assert.ok(catoVisible.includes('Army context not evaluated.'));
    assert.ok(!/^Leader: Victrix Honour Guard$/m.test(catoVisible)&&!/^Support: Victrix Honour Guard$/m.test(catoVisible));
    await shot('glossary-cato-conditional');record('Mega Glossary conditional Cato roles');
    await context.close();
  }
  assert.deepEqual(result.errors,[],'Browser errors/missing resources');
  assert.deepEqual([...new Set(result.results.map(row=>row.device))].sort(),['desktop','mobile']);
  assert.ok(result.requests.every(row=>new URL(row.url).pathname.startsWith(prefix+'/')),'A resource escaped the project prefix');
  assert.ok(!result.requests.some(row=>/\/books\/space-marines\/(?:scripts|reader\.html|index\.html)/.test(row.url)),'Legacy dependency requested');
  result.status='PASS';
}catch(error){result.status='FAIL';result.failure={message:error.message,stack:error.stack};if(page&&!page.isClosed()){await shot('failure');fs.writeFileSync(path.join(out,'FAILURE_DOM.txt'),await page.locator('body').innerText());}process.exitCode=1;}
finally{fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify(result,null,2)+'\n');await browser.close();await new Promise(resolve=>server.close(resolve));}
console.log(JSON.stringify({status:result.status,checks:result.results.length,errors:result.errors.length,evidence:out}));
