import {isApplicationTestDependency} from '../../shared/application-v2/browser-test-dependencies.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

// Public, real-text workflow. Canonical containment and assignment independently
// define the expected personal-book corpus; the personal filter is not the oracle.
const directory=path.dirname(fileURLToPath(import.meta.url)),repo=path.resolve(directory,'../../..');
const read=name=>JSON.parse(fs.readFileSync(path.join(directory,name),'utf8'));
const book=read('generated/effective.json'),payload=read('generated/app-presentation.json');
const records=new Map(book.entities.map(record=>[record.id,record]));
const original=new Map(['generated/effective.json','generated/rule-contracts.json','generated/roster-runtime.json','generated/app-presentation.json']
  .map(name=>[name,fs.readFileSync(path.join(directory,name))]));
const halo='detachment-haloscreed-battle-clade',forge='detachment-lords-of-the-forge';
const selected=[halo,forge],assigned=[halo+':enhancement:2',forge+':enhancement:2'];
const expectedUnits=['unit-tech-priest-dominus','unit-tech-priest-dominus','unit-servitor-battleclade','unit-skitarii-rangers','unit-skitarii-rangers'];
const expectedStratagems=book.entities.filter(record=>record.kind==='STRATAGEM'&&selected.includes(record.parentId)).map(record=>record.id).sort();
assert.ok(expectedStratagems.length,'Canonical Stratagem denominator empty');
const text=`+ FACTION KEYWORD: Imperium - Adeptus Mechanicus
+ DETACHMENT: Haloscreed Battle Clade, Lords of the Forge
+ WARLORD: Char1: Tech-priest Dominus
Char1: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe
Enhancement: Cognitive Reinforcement
Char2: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe
Enhancement: TL-4Ø9
9x Servitor Battleclade (110 pts)
• 1x Servitor Underseer: Mechanicus pistol, Dataspikes
• 2x Gun Servitor: 2 with Heavy arc rifle, Servo-claw
• 6x Combat Servitor: 6 with Phosphor blaster, Servo-claw
10x Skitarii Rangers (85 pts): 10x Galvanic rifle, 10x Close combat weapon
10x Skitarii Rangers (85 pts): 10x Galvanic rifle, 10x Close combat weapon`;
const appURL='/v2/app.html?v2=ARMY_BOOK&book=adeptus-mechanicus&registry=adeptus-mechanicus';
const app='/v2/app.html',requests=[],legacy=[];
const forbidden=url=>!isApplicationTestDependency(url)&&(/\/books\/death-guard\/(?!assets\/)/.test(url)||/\/books\/adeptus-mechanicus\/(?!v2\/|assets\/)/.test(url)||
  /target-data|compatible-rules\.json|correction-ledger|enhancement-owner|\/glossary\/(?:data|generated)|\/shared\/(?:roster-parser|effect-runtime|roster-context)\./.test(url));
const allowed=url=>isApplicationTestDependency(url)||url===app||/^\/books\/adeptus-mechanicus\/v2\/(?:theme\.css|[\w.-]+\.mjs|roster-import-aliases\.json|generated\/(?:app-presentation|roster-runtime)\.json)$/.test(url)||
  /^\/books\/shared\/(?:army-book-app-v2|rule-contract-v2|roster-v2)\/[\w.-]+\.(?:mjs|css)$/.test(url)||
  /^\/books\/shared\/(?:datasheet-system|unit-art)\.css$/.test(url)||/^\/(?:books\/adeptus-mechanicus\/assets|assets)\/[\w./-]+\.(?:webp|png|jpe?g|svg)$/.test(url);
const server=http.createServer((request,response)=>{
  const url=new URL(request.url,'http://localhost').pathname;
  if(forbidden(url)){legacy.push(url);response.writeHead(200,{'Content-Type':'text/javascript'});response.end('throw new Error("LEGACY_POISON");');return;}
  if(!allowed(url)){if(url!=='/favicon.ico')requests.push(url);response.writeHead(404);response.end();return;}
  const extension=path.extname(url),types={'.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.html':'text/html','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
  response.writeHead(200,{'Content-Type':types[extension]||'image/jpeg','Cache-Control':'no-store'});response.end(fs.readFileSync(path.join(repo,url.slice(1))));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const screenshots=process.env.ARMY_APP_V2_SCREENSHOTS;if(screenshots)fs.mkdirSync(screenshots,{recursive:true});
const results=[];
try{
 for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
  const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[];let controls=0;
  page.on('pageerror',error=>errors.push(error.message));page.setDefaultTimeout(15000);
  await page.goto(`http://127.0.0.1:${server.address().port}${appURL}`);
  await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.rosterPanel));await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);
  await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
  await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
  await page.locator('[data-roster-action="review-import"]').click();
  await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state?.units?.length===5);
  assert.equal(await page.locator('[data-roster-bindings] select').count(),0,'Canonical reconstruction requested');
  const state=await page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());
  assert.deepEqual(state.units.map(unit=>unit.canonicalUnitId),expectedUnits);assert.deepEqual(new Set(state.detachmentIds),new Set(selected));
  assert.deepEqual(state.units.map(unit=>unit.enhancementIds),[[assigned[0]],[assigned[1]],[],[],[]]);
  assert.equal(state.units[0].warlord,true);assert.notEqual(state.units[1].warlord,true);controls+=5;
  await page.locator('[data-attachment-candidate-for="parsed-unit-3"]').selectOption('parsed-unit-1');
  await page.locator('[data-attachment-target-instance-id="parsed-unit-3"] [data-roster-action="attach"]').click();
  await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state.attachments.length===1);
  await page.locator('[data-roster-action="open-personal-guide"]').click();
  await page.waitForFunction(()=>new URLSearchParams(location.search).has('roster'));
  const personalUrl=page.url();
  const homeLinks=await page.locator('main [data-canonical-id]').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.canonicalId,instance:node.dataset.rosterNavInstanceId||null,text:node.innerText})));
  assert.deepEqual(homeLinks.filter(link=>link.instance).map(link=>link.instance).sort(),state.units.map(unit=>unit.instanceId).sort());
  assert.ok(homeLinks.some(link=>link.text==='Tech-priest Dominus #1'));assert.ok(homeLinks.some(link=>link.text==='Tech-priest Dominus #2'));
  assert.deepEqual(homeLinks.filter(link=>records.get(link.id)?.kind==='DETACHMENT').map(link=>link.id).sort(),selected.toSorted());
  assert.deepEqual(homeLinks.filter(link=>records.get(link.id)?.kind==='ENHANCEMENT').map(link=>link.id).sort(),assigned.toSorted());controls+=5;
  const nav=await page.locator('#tocPanel [data-canonical-id]').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.canonicalId,instance:node.dataset.rosterNavInstanceId||null})));
  assert.deepEqual(nav.filter(link=>link.instance).map(link=>link.instance).sort(),state.units.map(unit=>unit.instanceId).sort());
  assert.deepEqual(nav.filter(link=>records.get(link.id)?.kind==='DETACHMENT').map(link=>link.id).sort(),selected.toSorted());controls+=2;
  // A Contents branch is a complete continuous personal publication, not a
  // second canonical-only book or an empty rules-only view. Phone branches
  // expand in-place; reload of the same canonical branch exercises its route.
  if(device==='desktop')await page.locator('#tocPanel [data-nav-target="nav:detachments"]').click();
  else {await page.goto(personalUrl.split('#')[0]+'#'+encodeURIComponent('nav:detachments'));
    await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.rosterPanel));await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);}
  await page.waitForSelector('main .v1-contents-pages');
  const continuousInstances=await page.locator('main .v1-contents-pages .unit-card[data-roster-instance-id]').evaluateAll(nodes=>nodes.map(node=>node.dataset.rosterInstanceId));
  assert.deepEqual(continuousInstances.toSorted(),state.units.map(unit=>unit.instanceId).toSorted(),device+': Contents lost physical effective datasheets');controls++;
  const continuousIds=await page.locator('main .v1-contents-pages [data-card-id]').evaluateAll(nodes=>nodes.map(node=>node.dataset.cardId));
  assert.deepEqual(continuousIds.filter(id=>records.get(id)?.kind==='DETACHMENT').sort(),selected.toSorted());
  assert.deepEqual(continuousIds.filter(id=>records.get(id)?.kind==='ENHANCEMENT').sort(),assigned.toSorted());
  assert.deepEqual(continuousIds.filter(id=>records.get(id)?.kind==='STRATAGEM').sort(),expectedStratagems);controls+=3;
  for(const [instance,value]of [['parsed-unit-1','2+'],['parsed-unit-2','3+']]){
    const rendered=await page.locator(`main .unit-card[data-roster-instance-id="${instance}"] [data-card-id="datasheet-tech-priest-dominus:weapon:5"] [data-fact-id]`)
      .evaluateAll(nodes=>nodes.filter(node=>node.dataset.factId.endsWith('::/skill')).map(node=>({value:JSON.parse(node.dataset.factValue),text:node.innerText})));
    assert.ok(rendered.length&&rendered.every(row=>row.value===value&&row.text.trim().startsWith(value)),'Continuous book lost exact effective owner value '+instance);controls++;
  }
  if(screenshots)await page.screenshot({path:path.join(screenshots,`admech-personal-guide-${device}-contents.png`),fullPage:true});
  const open=async instance=>{await page.evaluate(instance=>window.ArmyBookAppV2.openInstance(instance),instance);
    await page.waitForFunction(instance=>document.querySelector('main .v2-current-card')?.dataset.rosterInstanceId===instance,instance);};
  const fields=async(id,pointer)=>page.locator(`main [data-card-id="${id}"] [data-fact-id]`).evaluateAll((nodes,pointer)=>nodes.filter(node=>node.dataset.factId.endsWith('::'+pointer)&&node.getClientRects().length).map(node=>({value:JSON.parse(node.dataset.factValue),text:node.innerText})),pointer);
  const field=async(id,pointer,value)=>{const rows=await fields(id,pointer);assert.ok(rows.length,device+': missing '+id+pointer);assert.ok(rows.every(row=>row.value===value&&row.text.trim().startsWith(String(value))),device+': wrong rendered '+id+pointer+' '+JSON.stringify(rows));controls++;};
  // Real Contents click, including the phone drawer. The physical route must
  // preserve #1/#2 identity rather than choosing the first canonical copy.
  if(device==='phone')await page.getByRole('button',{name:'Open navigation',exact:true}).click();
  await page.locator('#tocPanel [data-roster-nav-instance-id="parsed-unit-2"]').click();
  await page.waitForFunction(()=>document.querySelector('main .v2-current-card')?.dataset.rosterInstanceId==='parsed-unit-2');controls++;
  const contribution=forge+':enhancement:2:weapon:1';
  assert.equal(await page.locator(`main [data-card-id="${contribution}"]`).count(),1);
  await field('datasheet-tech-priest-dominus:weapon:5','/skill','3+');
  await open('parsed-unit-1');await field('datasheet-tech-priest-dominus:weapon:5','/skill','2+');
  assert.equal(await page.locator(`main [data-card-id="${contribution}"]`).count(),0);
  assert.match(await page.locator('main').innerText(),/HEAVY/);assert.match(await page.locator('main').innerText(),/ASSAULT/);controls+=4;
  await field('datasheet-tech-priest-dominus:weapon:6','/ap','-2');
  await open('parsed-unit-3');
  assert.equal(await page.locator('main [data-card-id="datasheet-servitor-battleclade:profile:servitor-underseer"]').count(),1);
  assert.equal(await page.locator('main [data-card-id="datasheet-servitor-battleclade:profile:combat-and-gun-servitors"]').count(),2);
  assert.match(await page.locator('main').innerText(),/Servitor Underseer/);assert.match(await page.locator('main').innerText(),/Gun Servitor/);assert.match(await page.locator('main').innerText(),/Combat Servitor/);controls+=5;
  await field('datasheet-servitor-battleclade:weapon:1','/skill','3+');
  await field('datasheet-servitor-battleclade:profile:servitor-underseer','/INSV','4+');
  const keywordState=await page.evaluate(()=>window.ArmyBookAppV2.roster.effective('parsed-unit-3'));
  assert.ok(keywordState.keywords.includes('TECH-PRIEST'));
  assert.ok(keywordState.profiles.filter(profile=>profile.id.endsWith(':servitor-underseer')).every(profile=>profile.keywords.includes('TECH-PRIEST')));
  assert.ok(keywordState.profiles.filter(profile=>profile.id.endsWith(':combat-and-gun-servitors')).every(profile=>!profile.keywords.includes('TECH-PRIEST')));controls+=3;
  if(screenshots)await page.screenshot({path:path.join(screenshots,`admech-personal-guide-${device}-mixed-profiles.png`),fullPage:true});
  // Selected Detachment pages may include only assigned Enhancements; all their
  // canonical Stratagem cards remain available irrespective of battle state.
  const observedStratagems=[];
  for(const id of selected){await page.evaluate(id=>window.ArmyBookAppV2.open(id),id);
    const ids=await page.locator('main [data-card-id]').evaluateAll(nodes=>nodes.map(node=>node.dataset.cardId));
    assert.deepEqual(ids.filter(id=>records.get(id)?.kind==='ENHANCEMENT').sort(),assigned.filter(enhancement=>records.get(enhancement).parentId===id).sort());
    observedStratagems.push(...ids.filter(id=>records.get(id)?.kind==='STRATAGEM'));controls++;}
  assert.deepEqual(observedStratagems.sort(),expectedStratagems);controls++;
  for(const forbiddenId of ['detachment-rad-zone-corps','unit-onager-dunecrawler',halo+':enhancement:3','detachment-rad-zone-corps:stratagem:1']){
    await page.evaluate(id=>window.ArmyBookAppV2.open(id),forbiddenId);
    assert.equal(await page.locator(`main [data-card-id="${forbiddenId}"]`).count(),0,device+': forbidden personal record rendered '+forbiddenId);controls++;
  }
  // Actual Related Rules DOM is compared against typed public evaluation for
  // this exact instance, then independently checked for scope, states, owners.
  let conditional=0;
  for(const unit of state.units){
    await open(unit.instanceId);await page.locator('main .ds-related-rules-button').click();
    await page.waitForSelector('dialog.v2-related-dialog[open]');
    assert.equal(await page.locator('dialog[open] .full-related-filter').count(),0);
    const expected=await page.evaluate(instance=>window.ArmyBookAppV2.roster.related(instance),unit.instanceId);
    const visible=await page.locator('dialog[open] [data-rule-id]').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.ruleId,state:node.dataset.applicability,detachment:node.dataset.detachmentId})));
    const wanted=expected.filter(row=>selected.includes(row.detachmentId)&&['MATCH','CONDITIONAL'].includes(row.applicability)&&(row.kind!=='ENHANCEMENT'||unit.enhancementIds.includes(row.ruleId))).map(row=>({id:row.ruleId,state:row.applicability,detachment:row.detachmentId}));
    assert.deepEqual(visible.toSorted((a,b)=>a.id.localeCompare(b.id)),wanted.toSorted((a,b)=>a.id.localeCompare(b.id)));
    assert.equal(new Set(visible.map(row=>row.id)).size,visible.length);assert.ok(visible.every(row=>selected.includes(row.detachment)&&['MATCH','CONDITIONAL'].includes(row.state)));
    conditional+=visible.filter(row=>row.state==='CONDITIONAL').length;
    if(screenshots&&unit.instanceId==='parsed-unit-3')await page.screenshot({path:path.join(screenshots,`admech-personal-guide-${device}-related-rules.png`),fullPage:true});
    await page.locator('dialog[open] [data-kind="enhancements"]').click();
    const shownEnhancements=await page.locator('dialog[open] [data-related-kind="enhancements"] [data-rule-id]').evaluateAll(nodes=>nodes.filter(node=>node.getClientRects().length).map(node=>node.dataset.ruleId));
    assert.ok(shownEnhancements.every(id=>unit.enhancementIds.includes(id)));controls+=5;
    await page.getByRole('button',{name:'Close compatible rules',exact:true}).click();
  }
  assert.ok(conditional>0,'Battle prerequisites disappeared from Related Rules');controls++;
  // Presentation must also reject INVALID rows at its service boundary, even
  // though a real invalid contract already fails closed in the evaluator.
  // Poison only this test's disposable service output, never source/contracts.
  await page.evaluate(()=>{
    const service=window.ArmyBookAppV2.roster;window.personalGuideQaRelated=service.related;
    service.related=(...args)=>window.personalGuideQaRelated(...args).map((row,index)=>({...row,
      state:index%2?'INVALID':'FALSE',applicability:index%2?'INVALID':'NO_MATCH'}));
  });
  try{
    await open('parsed-unit-1');await page.locator('main .ds-related-rules-button').click();
    await page.waitForSelector('dialog.v2-related-dialog[open]');
    assert.equal(await page.locator('dialog[open] [data-rule-id]').count(),0,'NO_MATCH/INVALID leaked into Related Rules');controls++;
    await page.getByRole('button',{name:'Close compatible rules',exact:true}).click();
  }finally{await page.evaluate(()=>{window.ArmyBookAppV2.roster.related=window.personalGuideQaRelated;delete window.personalGuideQaRelated;});}
  // Canonical popup with effective instance/scope, including existing weapon
  // contribution identity rather than a new definition or generic bucket.
  await open('parsed-unit-2');
  await page.evaluate(id=>window.ArmyBookAppV2.showDetail(id),contribution);
  await page.waitForSelector('dialog.v2-detail-dialog[open]');
  assert.equal(await page.locator(`dialog[open] [data-card-id="${contribution}"]`).count(),1);controls++;
  await page.getByRole('button',{name:'Close rule reference',exact:true}).click();
  await page.evaluate(()=>window.ArmyBookAppV2.showDetail('core-leader'));await page.waitForSelector('dialog.v2-detail-dialog[open]');
  assert.equal(await page.locator('dialog[open] [data-card-id="core-leader"]').count(),1);
  assert.match(await page.locator('dialog[open]').innerText(),/Leader/i);controls+=2;
  await page.getByRole('button',{name:'Close rule reference',exact:true}).click();
  // Detach through unchanged setup, then return to guide: only former linked
  // recipient loses Enhancement-granted BS/weapon abilities.
  await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
  await page.locator('[data-roster-action="detach"]').first().click();
  await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state.attachments.length===0);
  await page.locator('[data-roster-action="open-personal-guide"]').click();
  await open('parsed-unit-3');await field('datasheet-servitor-battleclade:weapon:1','/skill','4+');
  await open('parsed-unit-1');await field('datasheet-tech-priest-dominus:weapon:5','/skill','2+');
  await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
  await page.locator('[data-attachment-candidate-for="parsed-unit-3"]').selectOption('parsed-unit-1');
  await page.locator('[data-attachment-target-instance-id="parsed-unit-3"] [data-roster-action="attach"]').click();
  await page.locator('[data-roster-action="open-personal-guide"]').click();await open('parsed-unit-3');
  await field('datasheet-servitor-battleclade:weapon:1','/skill','3+');
  const deep=page.url();await page.reload();await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.rosterPanel));await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);
  await page.waitForFunction(()=>document.querySelector('main .v2-current-card')?.dataset.rosterInstanceId==='parsed-unit-3');assert.equal(page.url(),deep);controls++;
  await open('parsed-unit-4');await open('parsed-unit-5');await page.goBack();
  await page.waitForFunction(()=>document.querySelector('main .v2-current-card')?.dataset.rosterInstanceId==='parsed-unit-4');
  await page.goForward();await page.waitForFunction(()=>document.querySelector('main .v2-current-card')?.dataset.rosterInstanceId==='parsed-unit-5');controls+=2;
  assert.doesNotMatch(await page.locator('main').innerText(),/parsed-unit-|SUPPORT_EXCEPTION|\bCURRENT\b|targetUnitReferenceIds/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);controls+=3;
  if(screenshots)await page.screenshot({path:path.join(screenshots,`admech-personal-guide-${device}.png`),fullPage:true});
  results.push({device,status:'PASS',controls,physicalInstances:5,selectedDetachments:selected.length,assignedEnhancements:assigned.length,selectedStratagems:expectedStratagems.length,conditionalRules:conditional,deepLinkReloadBackForward:'PASS',legacyRuntimeReads:0});
  await context.close();
 }
 assert.deepEqual(legacy,[]);assert.deepEqual(requests,[]);
 for(const [name,bytes]of original)assert.deepEqual(fs.readFileSync(path.join(directory,name)),bytes,'Browser modified canonical/effective inputs');
 console.log(JSON.stringify({status:'PASS',results,legacyRuntimeReads:0,canonicalFactsImmutable:true}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
