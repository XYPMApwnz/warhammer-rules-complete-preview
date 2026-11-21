import {createQaEvidenceDir} from '../../../tests/helpers/qa-temp.mjs';
import {launchQaBrowser} from '../../../tests/helpers/qa-browser.cjs';
/** Actual registered CSM application: no fixture payload or presentation adapter. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const repo=fileURLToPath(new URL('../../../',import.meta.url));
const out=process.env.CSM_PERSONAL_SCREENSHOTS||createQaEvidenceDir('personal-guide-browser-qa-');
fs.mkdirSync(out,{recursive:true});
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const attachmentFixtures=read('./roster-attachment-fixtures.json').fixtures;
const optionFixture=read('./roster-import-fixtures.json').fixtures[0];
// These enrolled source-backed inputs provide text and explicit bearer choices;
// actual effective values and rendered inventories are evaluated afresh below.
const matrix=read('./audit/roster-execution-matrix.json').matrix;
const mime={'.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.html':'text/html',
  '.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'};
const missing=[],errors=[],screenshots=[],results=[];
const server=http.createServer((request,response)=>{
  const address=decodeURIComponent(new URL(request.url,'http://localhost').pathname),file=path.resolve(repo,'.'+address);
  if(address==='/favicon.ico'){response.writeHead(204);response.end();return;}
  if(!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){
    missing.push(address);response.writeHead(404);response.end();return;
  }
  response.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');response.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await launchQaBrowser(chromium,{headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const ready=async page=>{
  await page.waitForFunction(()=>!!window.WarhammerAppV2);
  await page.evaluate(async()=>{await window.WarhammerAppV2.ready;await window.ArmyBookAppV2?.rosterPanel?.ready;});
};
const settle=async page=>{await page.evaluate(async()=>{
  await document.fonts.ready;await Promise.all([...document.images].map(image=>image.decode().catch(()=>{})));
  const {flushDatasheetLayouts}=await import('/books/shared/army-book-app-v2/datasheet-v1-layout.mjs');
  flushDatasheetLayouts(document.querySelector('main'));
});await page.waitForTimeout(50);};
const shot=async(page,name)=>{await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await settle(page);const file=path.join(out,name+'.png');await page.screenshot({path:file,fullPage:true});screenshots.push(file);};
async function clean(page){
  const report=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,
    text:document.querySelector('main')?.innerText||''}));
  assert.ok(report.width<=report.viewport+1,'Page-wide overflow '+JSON.stringify(report));
  assert.ok(!/Active roster effects|Effective unit keywords|\[object Object\]|v1\.5-scoped-six|MODIFY_MODEL_CHARACTERISTIC|GRANT_MODEL_ABILITY/.test(report.text),'Internal presentation content');
}
async function importText(page,text,count){
  await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
  await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
  await page.locator('[data-roster-action="review-import"]').click();
  await page.waitForFunction(count=>window.ArmyBookAppV2.roster.state?.units.length===count,count);
  await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
}
async function attach(page,bodyguard,leader){
  await page.locator(`[data-attachment-candidate-for="parsed-unit-${bodyguard}"]`).selectOption('parsed-unit-'+leader);
  await page.locator(`[data-attachment-target-instance-id="parsed-unit-${bodyguard}"] [data-roster-action="attach"]`).click();
  await page.waitForFunction(id=>window.ArmyBookAppV2.roster.state.attachments.some(edge=>edge.leaderInstanceId===id),'parsed-unit-'+leader);
}
async function open(page,id){await page.evaluate(id=>window.ArmyBookAppV2.openInstance(id),id);await ready(page);await page.waitForSelector('main .unit-card');await settle(page);}
async function inspect(page){return page.evaluate(()=>{
  const app=window.ArmyBookAppV2;
  return [...document.querySelectorAll('main .unit-card')].map(root=>{
    const id=root.dataset.rosterInstanceId,unit=app.roster.state.units.find(unit=>unit.instanceId===id),effective=app.roster.effective(id);
    return {id,title:root.querySelector('h3')?.textContent,text:root.innerText,
      profiles:[...root.querySelectorAll('.ds-effective-profile-group,.model-profile')]
        .filter(row=>row.matches('.ds-effective-profile-group')||!row.closest('.ds-effective-profile-group'))
        .flatMap(row=>row.dataset.profileScopes?JSON.parse(row.dataset.profileScopes):[[row.dataset.cardId,row.dataset.compositionId||null]]),
      expectedProfiles:effective.profiles.map(profile=>[profile.id,profile.scopeId]),
      weapons:[...new Set([...root.querySelectorAll('.weapon-row:not(.weapon-head)')].map(row=>row.dataset.cardId))].sort(),
      expectedWeapons:[...new Set(effective.weapons.map(weapon=>weapon.id))].sort(),
      selectedIds:[...new Set([...root.querySelectorAll('[data-selected-canonical-ids]')].flatMap(line=>JSON.parse(line.dataset.selectedCanonicalIds)))].sort(),
      expectedSelectedIds:[...new Set([...(unit.selections||[]),...unit.modelRows.flatMap(row=>[...(row.selections||[]),...(row.loadouts||[]).flatMap(loadout=>loadout.selections||[])])]
        .filter(selection=>selection.physicalQuantity>0).flatMap(selection=>[...(selection.canonicalProfileIds||[]),...(selection.canonicalEquipmentIds||[])]))].sort(),
      composition:root.querySelector('[data-datasheet-section="composition"]')?.innerText,
      sharedRuleIds:[...root.querySelectorAll('.shared-abilities [data-target-id]')].map(link=>link.dataset.targetId),
      statlines:root.querySelectorAll('.statline').length,
      applied:effective.applied.map(row=>[row.ruleId,row.clauseId,row.operation]),
      conditional:effective.conditional.map(row=>[row.ruleId,row.clauseId,row.reason])};
  });
});}
async function verify(page,expectedMembers){
  const rows=await inspect(page);
  if(expectedMembers)assert.deepEqual(new Set(rows.map(row=>row.id)),new Set(expectedMembers));
  for(const row of rows){
    assert.deepEqual(row.weapons,row.expectedWeapons,row.id+' exact effective weapon identities');
    assert.deepEqual(row.selectedIds,row.expectedSelectedIds,row.id+' selected inventory');
    assert.deepEqual(new Set(row.profiles.map(value=>JSON.stringify(value))),new Set(row.expectedProfiles.map(value=>JSON.stringify(value))),row.id+' physical MODEL scopes');
    assert.ok(row.composition&&row.statlines>0,row.id+' complete composition/statline');
    assert.ok(row.sharedRuleIds.filter(id=>id==='army-rule-dark-pacts').length<=1,row.id+' duplicate Dark Pacts');
  }
  await clean(page);return rows;
}
async function related(page,id){
  const expected=await page.evaluate(id=>{
    const app=window.ArmyBookAppV2,unit=app.roster.state.units.find(unit=>unit.instanceId===id),related=app.roster.related(id);
    return (Array.isArray(related)?related:related.rows).filter(row=>app.roster.state.detachmentIds.includes(row.detachmentId)&&
      (row.kind!=='ENHANCEMENT'||unit.enhancementIds.includes(row.ruleId))&&['MATCH','CONDITIONAL'].includes(row.applicability)).map(row=>row.ruleId);
  },id);
  await page.locator(`main .unit-card[data-roster-instance-id="${id}"] .ds-related-rules-button`).click();
  await page.waitForSelector('dialog.v2-related-dialog[open]');
  for(const kind of ['stratagems','enhancements']){
    await page.locator(`dialog.v2-related-dialog[open] button[data-kind="${kind}"]`).click();
    const visible=await page.locator('dialog.v2-related-dialog[open] [data-rule-id]').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.ruleId,applicability:node.dataset.applicability})));
    assert.ok(visible.every(row=>expected.includes(row.id)&&['MATCH','CONDITIONAL'].includes(row.applicability)),'Related Rules wrong owner/state');
  }
  await page.getByRole('button',{name:'Close compatible rules',exact:true}).click();
}
async function verifyMark(page,word) {
  const bags=await page.locator('main .unit-card [data-datasheet-section="keywords"]').evaluateAll(sections=>sections.map(section=>
    [...section.querySelectorAll('p')].map(line=>({label:line.querySelector('b')?.textContent.replace(/:$/,''),
      words:[...line.querySelectorAll('span[data-fact-id]')].map(span=>span.textContent)}))));
  assert.ok(bags.length,'Actual rendered Keywords section exists');
  for(const groups of bags) {
    const unit=groups.find(group=>group.label==='Keywords');assert.ok(unit);
    assert.deepEqual(unit.words.filter(keyword=>['KHORNE','TZEENTCH','NURGLE','SLAANESH','CHAOS UNDIVIDED'].includes(keyword)),[word]);
    assert.ok(groups.filter(group=>group.label!=='Keywords').every(group=>!group.words.includes(word)),
      'Selected UNIT Mark must not be shown as a MODEL or Faction keyword');
  }
}
try {
  for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
    const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage();page.setDefaultTimeout(20000);
    context.on('page',tab=>tab.on('pageerror',error=>errors.push(error.message)));
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(origin+'/v2/app.html');await ready(page);
    await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();await ready(page);
    await page.locator('[data-v2-book="chaos-space-marines"]').click();await ready(page);
    assert.equal(new URL(page.url()).searchParams.get('book'),'chaos-space-marines');
    const fixture=attachmentFixtures.find(fixture=>fixture.id==='duplicate-leader-support-ownership');
    await importText(page,fixture.text,6);await clean(page);if(device==='desktop')await shot(page,'csm-roster-after-import-desktop');
    await attach(page,5,1);await attach(page,5,3);
    await page.locator('[data-roster-instance-id="parsed-unit-5"] [data-roster-action="show-instance"]').click();
    const formed=await verify(page,['parsed-unit-5','parsed-unit-1','parsed-unit-3']);
    assert.ok(formed.find(row=>row.id==='parsed-unit-5').composition.includes('Aspiring Champion'));
    if(device==='desktop')await shot(page,'csm-formed-character-bodyguard-desktop');
    await related(page,'parsed-unit-1');
    const weapon=page.locator('main .unit-card[data-roster-instance-id="parsed-unit-1"] .weapon-name a').first(),href=await weapon.getAttribute('href'),weaponId=await weapon.getAttribute('data-target-id');
    assert.equal(new URL(href).searchParams.get('instance'),'parsed-unit-1');
    await weapon.click();await page.waitForSelector('dialog.v2-detail-dialog[open]');
    assert.equal(await page.locator('dialog.v2-detail-dialog[open]').getAttribute('data-canonical-id'),weaponId);
    await page.goBack();await page.waitForSelector('dialog.v2-detail-dialog[open]',{state:'hidden'});
    await page.goForward();await page.waitForSelector('dialog.v2-detail-dialog[open]');await page.goBack();
    const tab=await context.newPage();await tab.goto(href);await ready(tab);
    await tab.waitForSelector(`[data-fact-id="${weaponId}::/name"]`);await clean(tab);await tab.reload();await ready(tab);
    await tab.waitForSelector(`[data-fact-id="${weaponId}::/name"]`);await tab.close();
    await page.bringToFront();
    const direct=page.url();await page.reload();await ready(page);await verify(page,['parsed-unit-5','parsed-unit-1','parsed-unit-3']);assert.equal(page.url(),direct);
    await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
    await page.locator('[data-roster-action="detach"][data-leader-instance-id="parsed-unit-1"]').click();
    await open(page,'parsed-unit-5');await verify(page,['parsed-unit-5','parsed-unit-3']);
    await open(page,'parsed-unit-1');await verify(page,['parsed-unit-1']);
    await page.evaluate(()=>window.ArmyBookAppV2.openRoster());await attach(page,5,1);await open(page,'parsed-unit-5');
    assert.deepEqual(await verify(page,['parsed-unit-5','parsed-unit-1','parsed-unit-3']),formed,'Reattach presentation determinism');
    await page.evaluate(()=>window.ArmyBookAppV2.openRoster());await page.locator('[data-roster-action="open-personal-guide"]').click();
    await page.waitForSelector('main [data-roster-nav-instance-id]');await clean(page);
    await shot(page,device==='desktop'?'csm-personal-guide-desktop':'csm-personal-guide-phone');
    await open(page,'parsed-unit-2');await verify(page,['parsed-unit-2']);if(device==='desktop')await shot(page,'csm-ordinary-effective-datasheet-desktop');
    const mixed=attachmentFixtures.find(fixture=>fixture.id==='mixed-profile-components');await importText(page,mixed.text,2);await attach(page,2,1);await open(page,'parsed-unit-2');
    const mixedRows=await verify(page,['parsed-unit-2','parsed-unit-1']);
    assert.equal(mixedRows.find(row=>row.id==='parsed-unit-1').expectedProfiles.length,4);
    assert.ok(mixedRows.find(row=>row.id==='parsed-unit-1').statlines>1,'Distinct mixed statlines lost');
    if(device==='desktop')await shot(page,'csm-mixed-profile-effective-datasheet-desktop');
    await importText(page,optionFixture.text,8);
    await open(page,'parsed-unit-7');const khorne=(await verify(page,['parsed-unit-7']))[0];
    await open(page,'parsed-unit-8');const nurgle=(await verify(page,['parsed-unit-8']))[0];
    assert.notEqual(khorne.text,nurgle.text,'Different Allegiance state became identical');
    assert.ok(!khorne.text.includes('Tzeentch: Add')&&!khorne.text.includes('Nurgle: Add')&&!khorne.text.includes('Slaanesh: Add'),'Unselected Allegiance content');
    const range=matrix.find(row=>row.OWNER==='detachment-cult-of-the-arkifane:enhancement:4');await importText(page,range.NEW_RECRUIT_TEXT,4);
    await open(page,'parsed-unit-1');const enhanced=(await verify(page,['parsed-unit-1']))[0];
    await open(page,'parsed-unit-2');const base=(await verify(page,['parsed-unit-2']))[0];
    assert.ok(enhanced.text.includes('within 6"')&&enhanced.text.includes('within 15"'),'Canonical ability effective ranges not visible');
    assert.ok(base.text.includes('within 3"')&&base.text.includes('within 12"'),'Duplicate base ability changed');
    const abilityURL=await page.evaluate(()=>{
      const app=window.ArmyBookAppV2,ability=app.roster.effective('parsed-unit-1').abilities.find(ability=>ability.abilityRangeField);
      return app.routeURL(ability.id,true,{instanceId:'parsed-unit-1',scopeId:ability.scopeId,profileId:ability.profileId});
    });
    const abilityTab=await context.newPage();await abilityTab.goto(abilityURL);await ready(abilityTab);
    await abilityTab.waitForFunction(()=>document.querySelector('main')?.innerText.includes('within 6"'));
    await abilityTab.reload();await ready(abilityTab);
    assert.ok((await abilityTab.locator('main').innerText()).includes('within 6"'),'Effective ability range lost after direct reload');
    await clean(abilityTab);await abilityTab.close();await page.bringToFront();
    const marks=matrix.find(row=>row.CLAUSE_ID==='detachment-pactbound-zealots:rule::source-clause-1-1');
    for(const word of ['KHORNE','TZEENTCH','NURGLE','SLAANESH','CHAOS UNDIVIDED']) {
      await importText(page,marks.NEW_RECRUIT_TEXT.replaceAll('Mark: KHORNE','Mark: '+word),4);
      await open(page,'parsed-unit-1');await verifyMark(page,word);await clean(page);
      await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
      await page.locator('[data-roster-action="open-personal-guide"]').click();
      await page.locator('main [data-roster-nav-instance-id="parsed-unit-1"]').click();
      await ready(page);await page.waitForSelector('main .unit-card');await verifyMark(page,word);await clean(page);
      await page.reload();await ready(page);await verifyMark(page,word);
    }
    const breadth=[];
    for(const row of matrix){
      await page.evaluate(()=>window.ArmyBookAppV2.openRoster());await ready(page);
      await page.evaluate(row=>{
        const app=window.ArmyBookAppV2,service=app.roster,enhancementBearers={};
        for(const choice of row.ROSTER_PREREQUISITES.importedChoices)for(const assignment of choice.enhancementAssignments||[])
          enhancementBearers[JSON.stringify([choice.instanceId,assignment.enhancementId])]=assignment.modelScopeId;
        const result=service.import(row.NEW_RECRUIT_TEXT,{enhancementBearers});
        if(result.status!=='READY')throw new Error('Matrix input no longer importable: '+row.CLAUSE_ID);
        const state=service.snapshot();
        for(const choice of row.ROSTER_PREREQUISITES.importedChoices){const unit=state.units.find(unit=>unit.instanceId===choice.instanceId);
          if(choice.enhancementAssignments)unit.enhancementAssignments=structuredClone(choice.enhancementAssignments);}
        service.load(state);
        for(const edge of row.ROSTER_PREREQUISITES.attachments)service.attach(edge.leaderInstanceId,edge.bodyguardInstanceId);
        if(row.ROSTER_PREREQUISITES.initialAttachments)service.load({...service.snapshot(),initialAttachments:structuredClone(row.ROSTER_PREREQUISITES.initialAttachments)});
        const separator=row.CLAUSE_ID.lastIndexOf('::'),clause=row.CLAUSE_ID.slice(separator+2);
        if(!service.state.units.some(unit=>service.effective(unit.instanceId).applied.some(change=>change.ruleId===row.OWNER&&change.clauseId===clause)))throw new Error('Missing real application effect: '+row.CLAUSE_ID);
        window.localStorage.setItem('army-book-app-v2:roster:chaos-space-marines',JSON.stringify(service.snapshot()));
        app.openInstance(row.PHYSICAL_SOURCE_INSTANCE);
      },row);
      await ready(page);await settle(page);await verify(page);breadth.push(row.CLAUSE_ID);
    }
    assert.equal(new Set(breadth).size,61);
    assert.deepEqual(errors,[]);results.push({device,status:'PASS',realUIImport:true,realUIAttachments:true,effectClauses:breadth.length,canonicalPopup:true,
      directReload:true,backForward:true,newTab:true,mixed:true,removeRestore:true,selectedMarkKeywords:'5/5',markEffectiveDatasheets:true,markPersonalGuide:true});await context.close();
  }
  assert.deepEqual(missing,[],'Required resource 404');
  const report={status:'PASS',productionRegistration:true,adapters:0,results,screenshots,errors,missing};
  fs.writeFileSync(path.join(out,'csm-personal-guide-browser-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
