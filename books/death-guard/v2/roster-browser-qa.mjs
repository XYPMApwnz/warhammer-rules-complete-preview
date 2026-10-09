import {allowApplicationTestDependencies} from '../../shared/application-v2/browser-test-dependencies.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

// A bounded UI integration fixture: every imported gameplay reference is resolved
// automatically at the boundary, and every attachment uses a physical ID.
const {chromium}=createRequire(import.meta.url)('playwright');
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const payload=JSON.parse(fs.readFileSync(path.join(repo,'books/death-guard/v2/generated/app-presentation.json'),'utf8'));
const cards=new Map(payload.cards.map(card=>[card.id,card]));
const appPath='/books/death-guard/v2/app.html';
const detachmentId='detachment-virulent-vectorium';
const enhancementId=detachmentId+':enhancement:2';
const plagueSurgeId=detachmentId+':stratagem:3';
const silentBodyguardId='datasheet-deathshroud-terminators:section:1';
const infusionId='datasheet-biologus-putrifier:section:1';
const boltgunId='datasheet-plague-marines:weapon:2';
const meltagunId='datasheet-plague-marines:weapon:4';
const knivesId='datasheet-biologus-putrifier:weapon:3';
const unitIds=['unit-biologus-putrifier','unit-lord-of-contagion','unit-foul-blightspawn','unit-deathshroud-terminators','unit-deathshroud-terminators','unit-plague-marines','unit-plague-marines'];
const ids={bio:'parsed-unit-1',lord:'parsed-unit-2',foul:'parsed-unit-3',dsA:'parsed-unit-4',dsB:'parsed-unit-5',pmA:'parsed-unit-6',pmB:'parsed-unit-7'};
const fixture=[
  '+ DETACHMENT: Virulent Vectorium',
  '+ WARLORD: Char2: Lord of Contagion',
  '+ ENHANCEMENT: Furnace of Plagues (on Char1: Biologus Putrifier)',
  'Char1: 1x Biologus Putrifier (50 pts): Plague knives',
  'Char2: 1x Lord of Contagion (100 pts): Warlord',
  'Char3: 1x Foul Blightspawn (50 pts)',
  '3x Deathshroud Terminators (140 pts)',
  '3x Deathshroud Terminators (140 pts)',
  '5x Plague Marines (90 pts): 4x Boltgun, 1x Meltagun',
  '5x Plague Marines (90 pts): 4x Boltgun, 1x Meltagun'
].join('\n');
const allowed=new Map([
  [appPath,'text/html'],
  ['/books/death-guard/v2/generated/app-presentation.json','application/json'],
  ['/books/death-guard/v2/generated/rule-contract-effective.json','application/json'],
  ['/books/death-guard/v2/roster-boot.mjs','text/javascript'],
  ['/books/death-guard/v2/rule-contract-schema.mjs','text/javascript'],
  ['/books/shared/rule-contract-v2/schema.mjs','text/javascript'],
  ['/books/death-guard/v2/rule-contract-state-fields.mjs','text/javascript'],
  ['/books/shared/army-book-app-v2/runtime.mjs','text/javascript'],
  ...['navigation-v1.mjs','navigation-v1-controller.mjs','navigation-v1-targets.mjs'].map(file=>['/books/shared/army-book-app-v2/'+file,'text/javascript']),
  ['/books/shared/army-book-app-v2/personal.mjs','text/javascript'],
  ['/books/shared/army-book-app-v2/roster.mjs','text/javascript'],
  ['/books/shared/army-book-app-v2/glossary.mjs','text/javascript'],
  ['/books/shared/army-book-app-v2/styles.css','text/css'],['/books/shared/army-book-app-v2/navigation-v1.css','text/css'],
  ['/books/shared/roster-v2/runtime.mjs','text/javascript'],
  ['/books/shared/roster-v2/import.mjs','text/javascript'],
  ['/books/shared/roster-v2/context.mjs','text/javascript'],
  ['/books/shared/roster-v2/effects.mjs','text/javascript'],
  // V2-owned text decoder; all canonical resolution remains at import boundary.
  ['/books/shared/roster-v2/parser.mjs','text/javascript']
]);
const requests=[],legacyRequests=[];
allowApplicationTestDependencies(allowed);
const server=http.createServer((request,response)=>{
  const address=new URL(request.url,'http://localhost').pathname;requests.push(address);
  if(!allowed.has(address)) {
    if(address!=='/favicon.ico')legacyRequests.push(address);
    response.writeHead(address==='/favicon.ico'?404:200,{'Content-Type':'application/json'});
    response.end('{"POISONED_LEGACY_FACTUAL_RUNTIME":true}');return;
  }
  response.writeHead(200,{'Content-Type':allowed.get(address),'Cache-Control':'no-store'});
  response.end(fs.readFileSync(path.join(repo,address.slice(1))));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const evidence=process.env.ARMY_APP_V2_SCREENSHOTS || fs.mkdtempSync(path.join(os.tmpdir(),'dg-roster-browser-v2-'));
fs.mkdirSync(evidence,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
let activePage,activeStep='startup';
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const descendants=id=>{
  const result=new Set();
  const visit=id=>{assert.ok(cards.has(id),'Missing canonical card '+id);assert.ok(!result.has(id),'Duplicate child '+id);result.add(id);cards.get(id).children.forEach(visit);};
  visit(id);return result;
};
const expectedFacts=id=>[...descendants(id)].flatMap(id=>cards.get(id).fields.map(field=>({id:field.id,value:field.value,entityId:field.source.entityId,contextId:field.contextId,cardId:id}))).sort((a,b)=>a.id.localeCompare(b.id));
const observeFacts=(page,scope)=>page.evaluate(scope=>{
  const root=document.querySelector(scope);if(!root)throw new Error('Missing observation '+scope);
  const article=root.matches('article')?root:root.querySelector('article');
  return {targetId:article?.dataset.cardId,text:article?.textContent,facts:[...root.querySelectorAll('[data-fact-id]')].map(node=>({id:node.dataset.factId,value:JSON.parse(node.dataset.factValue),entityId:node.dataset.entityId,contextId:node.dataset.contextId,cardId:node.closest('[data-card-id]').dataset.cardId,visible:!!node.getClientRects().length})).sort((a,b)=>a.id.localeCompare(b.id)),dialogs:document.querySelectorAll('dialog[open]').length};
},scope);
const ready=async page=>{await page.waitForFunction(()=>!!window.ArmyBookAppV2?.rosterPanel);await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);};
const settled=async page=>{
  await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
  assert.equal(await page.locator('.v2-roster-error').count(),0,activeStep+' caught UI error: '+await page.locator('.v2-roster-status').allTextContents());
};
const noOverflow=async page=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,activeStep+' horizontal overflow');
const snapshot=page=>page.evaluate(()=>({state:window.ArmyBookAppV2.roster.snapshot(),projection:window.ArmyBookAppV2.roster.projection,effective:Object.fromEntries(window.ArmyBookAppV2.roster.state.units.map(unit=>[unit.instanceId,window.ArmyBookAppV2.roster.effective(unit.instanceId)]))}));
const physical=(page,id)=>page.locator(`[data-roster-instance-id="${id}"]`).first();
const modelFnp=unit=>unit.profiles.flatMap(profile=>profile.abilities.filter(ability=>ability.name==='Feel No Pain'));
const field=(weapon,key)=>weapon.fields.find(field=>field.label===key)?.value;
const weapon=(state,id,canonicalId)=>{const weapons=state.effective[id].weapons.filter(weapon=>weapon.id===canonicalId);assert.equal(weapons.length,1,activeStep+' ambiguous physical weapon');return weapons[0];};
const hasAbility=(weapon,name)=>field(weapon,'abilities').some(ability=>ability.toLowerCase()===name.toLowerCase());
const results=[];
try {
  for(const [device,viewport] of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]) {
    const context=await browser.newContext({viewport,acceptDownloads:true,...(device==='phone'?{isMobile:true,hasTouch:true}:{})});
    const page=await context.newPage(),errors=[];activePage=page;
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('404'))errors.push(message.text());});
    await page.goto(origin+appPath);await ready(page);
    assert.equal(await page.evaluate(()=>window.ArmyBookAppV2.roster.state),null,'No-roster boot invented a roster');
    const readerCensus=async label=>{
      await page.evaluate(()=>window.ArmyBookAppV2.openLibrary());
      activeStep=device+'/'+label;const observed=new Map();
      for(const id of payload.groups.flatMap(group=>group.itemIds)) {
        await page.evaluate(id=>window.ArmyBookAppV2.open(id),id);
        const observation=await observeFacts(page,'main > article');assert.equal(observation.targetId,id);
        assert.deepEqual(observation.facts.map(({visible,...fact})=>fact),expectedFacts(id),label+' canonical Reader fields');
        observation.facts.forEach(fact=>{assert.equal(fact.visible,true,label+' hidden fact');observed.set(fact.id,fact);});
        await noOverflow(page);
      }
      assert.deepEqual(new Set(observed.keys()),new Set(payload.factManifest.map(fact=>fact.id)),label+' full DG manifest');
      return [...observed.values()].sort((a,b)=>a.id.localeCompare(b.id));
    };
    const before=await readerCensus('reader-before-roster');
    await page.evaluate(()=>window.ArmyBookAppV2.open('unit-biologus-putrifier'));
    await page.locator('main .v2-detachment-filter').selectOption('');
    for(const ruleId of [enhancementId,plagueSurgeId])assert.equal(await page.locator(`main .v2-compatible-item[data-rule-id="${ruleId}"]`).getAttribute('data-applicability'),'CONDITIONAL','No-roster Related silently invented owner or Warlord facts');
    activeStep=device+'/actual-open-roster';
    if(device==='phone')await page.getByRole('button',{name:'Open navigation',exact:true}).click();
    await page.getByRole('button',{name:'Roster',exact:true}).click();await page.waitForSelector('main [data-roster-view]');
    assert.equal(await page.evaluate(()=>location.hash),'#view-roster');await noOverflow(page);
    if(device==='phone')assert.equal(await page.getByRole('button',{name:'Open navigation',exact:true}).getAttribute('aria-expanded'),'false');
    await page.locator('[data-roster-input="raw-text"]').fill(fixture);
    await page.locator('[data-roster-action="review-import"]').click();await settled(page);
    assert.equal(await page.locator('fieldset[data-binding-kind]').count(),0,'Unambiguous import requires canonical choices');
    assert.equal(await page.locator('[data-roster-bindings] select').count(),0);
    const bindings=[];
    const imported=await snapshot(page);
    assert.equal(imported.state.units.length,7);assert.equal(new Set(imported.state.units.map(unit=>unit.instanceId)).size,7);
    assert.deepEqual(imported.state.units.map(unit=>unit.canonicalUnitId),unitIds);
    assert.deepEqual(imported.state.units.map(unit=>unit.startingStrength),[1,1,1,3,3,5,5]);
    assert.deepEqual(imported.state.detachmentIds,[detachmentId]);assert.equal(imported.state.warlordInstanceId,ids.lord);
    assert.deepEqual(imported.state.units.map(unit=>unit.enhancementIds),[[enhancementId],[],[],[],[],[],[]]);
    assert.deepEqual(await page.locator('[data-roster-instance-id]').evaluateAll(nodes=>nodes.map(node=>({instanceId:node.dataset.rosterInstanceId,canonicalId:node.dataset.canonicalUnitId}))),unitIds.map((canonicalId,i)=>({instanceId:'parsed-unit-'+(i+1),canonicalId})));
    for(const id of [ids.pmA,ids.pmB]){assert.equal(weapon(imported,id,boltgunId).physicalQuantity,4);assert.equal(weapon(imported,id,meltagunId).physicalQuantity,1);assert.equal(field(weapon(imported,id,boltgunId),'strength'),'5');assert.equal(field(weapon(imported,id,boltgunId),'ap'),'-1');assert.equal(hasAbility(weapon(imported,id,meltagunId),'LETHAL HITS'),false);}
    const enhanced=weapon(imported,ids.bio,knivesId);
    assert.equal(field(enhanced,'strength'),'6');assert.equal(field(enhanced,'attacks'),'5');assert.ok(hasAbility(enhanced,'DEVASTATING WOUNDS'));
    assert.equal(imported.effective[ids.bio].applied.filter(row=>row.ruleId===enhancementId).length,3);
    for(const id of Object.values(ids).filter(id=>id!==ids.bio))assert.ok(imported.effective[id].applied.every(row=>row.ruleId!==enhancementId),'Enhancement leaked to another physical owner');
    const effectiveParity=async()=>{
      const current=await snapshot(page);
      for(const id of Object.values(ids)) {
        await page.evaluate(id=>window.ArmyBookAppV2.openInstance(id),id);
        for(const record of [...current.effective[id].profiles,...current.effective[id].weapons]) {
          const profile=physical(page,id).locator(`article[data-card-id="${record.id}"]${record.scopeId?`[data-composition-id="${record.scopeId}"]`:''}`);
          assert.equal(await profile.count(),1,activeStep+' duplicate/missing physical effective profile');
          for(const item of record.fields) {
            if(item.label==='order')continue; // Non-player source ordering metadata.
            const factId=item.label==='Base'?cards.get(record.id).children.find(child=>cards.get(child).kind==='MODEL_BASE')+'::/text':record.id+'::/'+item.label;
            if(Array.isArray(item.value)){
              assert.deepEqual(await profile.locator('[data-fact-id^="'+factId+'/"]').evaluateAll(ns=>ns.map(n=>JSON.parse(n.dataset.factValue))),item.value);
            }else{
              const cell=profile.locator('[data-fact-id="'+factId+'"]');assert.equal(await cell.count(),1,'Missing effective UI field '+item.label);
              assert.deepEqual(JSON.parse(await cell.getAttribute('data-fact-value')),item.value);
            }
          }
          if(record.abilities?.length)for(const ability of record.abilities){const text=await profile.textContent();assert.ok(text.includes(ability.name+': '+ability.value),'Missing effective model ability');}
          else assert.equal((await profile.textContent()).includes('Feel No Pain:'),false,'Stale model ability in UI');
        }
        const own=current.state.units.find(unit=>unit.instanceId===id);
        assert.deepEqual(await physical(page,id).locator('[data-fact-id^="'+own.canonicalUnitId+'::/keywords/"]').evaluateAll(ns=>ns.map(n=>JSON.parse(n.dataset.factValue))),current.effective[id].keywords);
        assert.deepEqual(current.effective[id].intrinsicKeywords,cards.get(own.canonicalUnitId).fields.filter(f=>f.source?.path.startsWith('/keywords/')||f.source?.path.startsWith('/factionKeywords/')).map(f=>f.value));
        const identity=await physical(page,id).locator('.v2-roster-identity > div').evaluateAll(nodes=>Object.fromEntries(nodes.map(node=>[node.querySelector('dt').textContent,node.querySelector('dd').textContent])));
        assert.equal(identity['Starting Strength'],String(own.startingStrength));assert.equal(identity.Warlord,own.warlord===null||own.warlord===undefined?'Unknown':own.warlord?'Yes':'No');
        assert.deepEqual(await physical(page,id).locator('.v2-roster-identity [data-target-id]').evaluateAll(nodes=>nodes.map(node=>node.dataset.targetId)),own.enhancementIds);
        for(const selection of own.selections) {
          const selected=physical(page,id).locator(`[data-selection-key="${selection.selectionKey}"]`);
          assert.equal(await selected.count(),1);assert.equal(await selected.locator('strong').first().textContent(),`${selection.physicalQuantity} selected · `);
          assert.deepEqual(await selected.locator('a[data-target-id]').evaluateAll(nodes=>nodes.map(node=>node.dataset.targetId)),[...selection.canonicalProfileIds,...selection.canonicalEquipmentIds]);
        }
      }
      await noOverflow(page);assert.deepEqual(errors,[],activeStep+' runtime errors');await page.evaluate(()=>window.ArmyBookAppV2.openRoster());return current;
    };
    await effectiveParity();
    console.log(JSON.stringify({device,stage:'automatic-import',instances:7,bindings:bindings.length,status:'PASS'}));
    let attachmentActions=0,relatedChecks=0,popupChecks=0,reloadChecks=0;
    const related=async(instanceId,detId)=>{
      activeStep=device+'/related/'+instanceId+'/'+(detId||'ALL');
      await page.evaluate(id=>window.ArmyBookAppV2.openInstance(id),instanceId);
      const root=physical(page,instanceId).locator(`[data-roster-related-instance-id="${instanceId}"]`);
      await root.getByRole('combobox',{name:'Related rules detachment',exact:true}).selectOption(detId||'');await settled(page);
      const rows=await page.evaluate(({instanceId,detId})=>window.ArmyBookAppV2.roster.related(instanceId,detId),{instanceId,detId:detId||null});
      const actual=await root.locator('li[data-rule-id]').evaluateAll(nodes=>nodes.map(node=>({ruleId:node.dataset.ruleId,applicability:node.dataset.applicability})));
      const owner=(await snapshot(page)).state.units.find(unit=>unit.instanceId===instanceId);
      assert.deepEqual(actual,rows.filter(row=>['MATCH','CONDITIONAL'].includes(row.applicability)&&(row.kind!=='ENHANCEMENT'||owner.enhancementIds.includes(row.ruleId))).map(({ruleId,applicability})=>({ruleId,applicability})),activeStep+' stale or incorrect visible Related rows');
      assert.equal(new Set(actual.map(row=>row.ruleId)).size,actual.length,activeStep+' duplicate Related rules');
      await noOverflow(page);relatedChecks++;return rows;
    };
    const applicabilityControls=async()=>{
      const bioRows=await related(ids.bio,detachmentId),pmRows=await related(ids.pmA,detachmentId),lordRows=await related(ids.lord,detachmentId);
      assert.equal(bioRows.find(row=>row.ruleId===enhancementId).applicability,'MATCH');assert.equal(pmRows.find(row=>row.ruleId===enhancementId).applicability,'NO_MATCH');
      assert.equal(lordRows.find(row=>row.ruleId===plagueSurgeId).applicability,'CONDITIONAL');assert.equal(bioRows.find(row=>row.ruleId===plagueSurgeId).applicability,'NO_MATCH');
    };
    await applicabilityControls();
    const attach=async(leader,bodyguard)=>{
      activeStep=device+'/attach/'+leader+'/'+bodyguard;
      await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
      const button=physical(page,bodyguard).locator('[data-roster-action="attach"]');
      await button.locator('..').locator('select').selectOption(leader);await button.click();await settled(page);attachmentActions++;return effectiveParity();
    };
    const detach=async leader=>{activeStep=device+'/detach/'+leader;await page.evaluate(()=>window.ArmyBookAppV2.openRoster());await page.locator('[data-roster-action="detach"][data-leader-instance-id="'+leader+'"]').click();await settled(page);attachmentActions++;return effectiveParity();};
    const fnpControl=(current,owner)=>{
      for(const id of Object.values(ids))assert.deepEqual(modelFnp(current.effective[id]),id===ids.lord&&owner?[{name:'Feel No Pain',value:4}]:[],activeStep+' Silent Bodyguard FNP leaked or remained stale');
      const provenance=current.effective[ids.lord].applied.filter(row=>row.ruleId===silentBodyguardId&&row.operation==='GRANT_MODEL_ABILITY');
      assert.equal(provenance.length,owner?1:0);
      if(owner){assert.equal(provenance[0].sourceInstanceId,owner);assert.equal(provenance[0].targetInstanceId,ids.lord);assert.equal(provenance[0].targetModelInstanceId,current.effective[ids.lord].profiles[0].modelInstanceId);assert.ok(provenance[0].sourceFields.length);assert.equal(provenance[0].lifetime,'WHILE_LEADING_SOURCE_UNIT');}
    };
    fnpControl(imported,null);
    fnpControl(await attach(ids.lord,ids.dsA),ids.dsA);
    fnpControl(await detach(ids.lord),null);
    fnpControl(await attach(ids.lord,ids.dsB),ids.dsB);
    fnpControl(await detach(ids.lord),null);
    fnpControl(await attach(ids.lord,ids.dsA),ids.dsA);
    await attach(ids.bio,ids.pmA);let attached=await attach(ids.foul,ids.pmA);
    const group=attached.effective[ids.pmA].formedUnit;
    assert.deepEqual(new Set(group.leaderInstanceIds),new Set([ids.bio,ids.foul]));assert.equal(group.startingStrength,7);
    assert.ok(attached.effective[ids.pmA].keywords.includes('CHARACTER'));assert.ok(!attached.effective[ids.pmA].intrinsicKeywords.includes('CHARACTER'));
    assert.ok(attached.effective[ids.pmB].keywords.every(keyword=>keyword!=='CHARACTER'));
    assert.ok(hasAbility(weapon(attached,ids.pmA,meltagunId),'LETHAL HITS'));assert.equal(hasAbility(weapon(attached,ids.pmB,meltagunId),'LETHAL HITS'),false);
    const infusion=attached.effective[ids.pmA].applied.find(row=>row.ruleId===infusionId&&row.targetWeaponProfileId===meltagunId);
    assert.ok(infusion,'Missing formed-model weapon grant provenance');assert.equal(infusion.sourceInstanceId,ids.bio);assert.equal(infusion.targetInstanceId,ids.pmA);assert.ok(infusion.sourceFields.length);
    const removed=await detach(ids.bio);assert.equal(hasAbility(weapon(removed,ids.pmA,meltagunId),'LETHAL HITS'),false);assert.ok(removed.effective[ids.pmA].applied.every(row=>row.ruleId!==infusionId));
    attached=await attach(ids.bio,ids.pmA);assert.ok(hasAbility(weapon(attached,ids.pmA,meltagunId),'LETHAL HITS'));fnpControl(attached,ids.dsA);
    for(const id of Object.values(ids)) {
      await page.evaluate(id=>window.ArmyBookAppV2.openInstance(id),id);
      const filter=physical(page,id).getByRole('combobox',{name:'Related rules detachment',exact:true});
      assert.deepEqual(await filter.locator('option').evaluateAll(nodes=>nodes.map(node=>node.value)),['',detachmentId]);
      assert.deepEqual(await page.evaluate(id=>window.ArmyBookAppV2.roster.related(id,'detachment-paragons-of-putrescence'),id),[]);
      for(const det of [null,detachmentId,null])await related(id,det);
    }
    await applicabilityControls();
    // Both physical-unit keyword scopes are read from the typed service, rather
    // than borrowing the CHARACTER keyword from an attached leader model.
    const scopes=await page.evaluate(id=>{const r=window.ArmyBookAppV2.roster;const unit=r.projection.units.find(unit=>unit.instanceId===id);const has=values=>values instanceof Set?values.has('CHARACTER'):values.includes('CHARACTER');return {unitCharacter:has(r.context(id,'UNIT').keywords),modelCharacter:has(r.context(id,'MODEL',unit.profiles[0].scopeId).keywords)};},ids.pmA);
    assert.equal(scopes.unitCharacter,true);assert.equal(scopes.modelCharacter,false);
    // Expand actual provenance and verify its physical source/target evidence.
    activeStep=device+'/visible-provenance';
    await page.evaluate(id=>window.ArmyBookAppV2.openInstance(id),ids.lord);
    const provenance=physical(page,ids.lord).locator('[data-effective-instance-id] li').filter({has:page.locator(`[data-target-id="${silentBodyguardId}"]`)}).filter({has:page.locator('[data-applied-field="abilities"]')});
    assert.equal(await provenance.count(),1);await provenance.getByText('Effect provenance',{exact:true}).click();
    assert.ok((await provenance.textContent()).includes(ids.dsA));assert.ok((await provenance.textContent()).includes(ids.lord));await noOverflow(page);
    if(evidence)await page.screenshot({path:path.join(evidence,device+'-roster.png'),animations:'disabled'});
    const durable=await snapshot(page);
    const popup=async(instanceId,targetId,relatedOnly=false)=>{
      activeStep=device+'/canonical-popup/'+targetId;
      await page.evaluate(id=>window.ArmyBookAppV2.openInstance(id),instanceId);
      // Physical profile details must match the effective card the player just
      // opened. Source rule definitions retain the canonical factual contract.
      const expected=['PROFILE','WEAPON_PROFILE'].includes(cards.get(targetId).kind)
        ? (await observeFacts(page,`main article[data-card-id="${targetId}"][data-roster-instance-id="${instanceId}"]`)).facts.map(({visible,...fact})=>fact)
        : expectedFacts(targetId);
      const source=physical(page,instanceId).locator(relatedOnly?'[data-roster-related-instance-id]':'[data-roster-context-instance-id]');
      const link=source.locator(`[data-target-id="${targetId}"]:visible`).first();await link.click();await page.waitForSelector('dialog[open]');
      const observation=await observeFacts(page,'dialog[open]');assert.equal(observation.targetId,targetId);assert.equal(observation.dialogs,1);
      assert.deepEqual(observation.facts.map(({visible,...fact})=>fact),expected);assert.ok(observation.facts.every(fact=>fact.visible));
      assert.deepEqual(await snapshot(page),durable,'Opening a source popup changed physical effects');await noOverflow(page);popupChecks++;return observation;
    };
    const sourcePopup=await popup(ids.lord,silentBodyguardId);
    if(evidence)await page.screenshot({path:path.join(evidence,device+'-roster-popup.png'),animations:'disabled'});
    await page.goBack();await page.waitForSelector('dialog[open]',{state:'hidden'});await page.waitForSelector('main [data-roster-context-instance-id]');
    await page.goForward();await page.waitForSelector('dialog[open]');assert.deepEqual(await observeFacts(page,'dialog[open]'),sourcePopup);assert.deepEqual(await snapshot(page),durable);
    await page.reload();await ready(page);await page.waitForSelector('dialog[open]');assert.deepEqual(await observeFacts(page,'dialog[open]'),sourcePopup);assert.deepEqual(await snapshot(page),durable);reloadChecks++;
    await page.keyboard.press('Escape');await page.waitForSelector('dialog[open]',{state:'hidden'});await effectiveParity();
    await popup(ids.bio,enhancementId);await page.keyboard.press('Escape');await page.waitForSelector('dialog[open]',{state:'hidden'});
    await popup(ids.pmA,meltagunId);await page.keyboard.press('Escape');await page.waitForSelector('dialog[open]',{state:'hidden'});
    await popup(ids.bio,enhancementId,true);await page.keyboard.press('Escape');await page.waitForSelector('dialog[open]',{state:'hidden'});
    await popup(ids.lord,plagueSurgeId,true);await page.keyboard.press('Escape');await page.waitForSelector('dialog[open]',{state:'hidden'});
    activeStep=device+'/backup';
    await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
    await page.getByText('Backup and restore',{exact:true}).click();
    const downloaded=page.waitForEvent('download');await page.locator('[data-roster-action="export-backup"]').click();const download=await downloaded;
    const backup=path.join(evidence,device+'-roster-backup.json');await download.saveAs(backup);assert.deepEqual(JSON.parse(fs.readFileSync(backup,'utf8')),durable.state);
    assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('army-book-app-v2:roster:death-guard'))),durable.state);
    await detach(ids.lord);assert.equal(modelFnp((await snapshot(page)).effective[ids.lord]).length,0);
    await page.getByLabel('Restore a V2 roster backup',{exact:true}).setInputFiles(backup);await settled(page);assert.deepEqual(await snapshot(page),durable,'Backup did not restore the same typed state/effects');await effectiveParity();
    await page.locator('[data-roster-action="reload-saved"]').click();await settled(page);assert.deepEqual(await snapshot(page),durable,'Saved reload differs from restored backup');
    await page.reload();await ready(page);await page.waitForSelector('main [data-roster-view]');assert.deepEqual(await snapshot(page),durable,'Local storage restore changed deterministic effects');reloadChecks++;await effectiveParity();
    const after=await readerCensus('reader-after-roster');assert.deepEqual(after,before,'Roster mutated canonical Reader facts');
    await page.evaluate(()=>window.ArmyBookAppV2.open('unit-biologus-putrifier'));await page.locator('main .v2-detachment-filter').selectOption('');
    for(const ruleId of [enhancementId,plagueSurgeId])assert.equal(await page.locator(`main .v2-compatible-item[data-rule-id="${ruleId}"]`).getAttribute('data-applicability'),'CONDITIONAL','Roster rewrote the Reader-only compatibility context');
    await page.goto(origin+appPath+'#view-roster');await ready(page);await effectiveParity();assert.deepEqual(await snapshot(page),durable,'Roster deep link lost persisted state');
    await page.reload();await ready(page);await effectiveParity();assert.deepEqual(await snapshot(page),durable);reloadChecks++;
    assert.deepEqual(errors,[]);assert.deepEqual(legacyRequests,[],'Browser requested a legacy factual/runtime dependency');
    results.push({device,viewport,status:'PASS',physicalInstances:7,manualCanonicalSelections:bindings.length,canonicalUnits:unitIds,readerFactsBefore:before.length,readerFactsAfter:after.length,readerRoots:payload.groups.flatMap(group=>group.itemIds).length,attachmentActions,relatedChecks,canonicalPopupChecks:popupChecks,reloadChecks,backupChecks:3,stateHash:digest(durable.state),effectsHash:digest(durable.projection),readerHash:digest(before),horizontalOverflow:0,runtimeErrors:0,staleEffects:0,duplicateRelatedRows:0});
    console.log(JSON.stringify(results.at(-1)));await context.close();activePage=null;
  }
  assert.equal(results[0].stateHash,results[1].stateHash,'Desktop/phone physical identities differ');assert.equal(results[0].effectsHash,results[1].effectsHash,'Desktop/phone deterministic effects differ');assert.equal(results[0].readerHash,results[1].readerHash,'Desktop/phone canonical Reader fields differ');
  const report={status:'PASS',scope:'Bounded DG Roster/Effect V2 browser integration',results,legacyRequests,requests:[...new Set(requests)].sort(),lexicalParserRequests:requests.filter(request=>request==='/books/shared/roster-v2/parser.mjs').length,evidence};
  fs.writeFileSync(path.join(evidence,'roster-browser-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:'PASS',devices:results.length,legacyRequests:legacyRequests.length,evidence}));
} catch(error) {
  if(activePage)await activePage.screenshot({path:path.join(evidence,'roster-browser-failure.png'),animations:'disabled'}).catch(()=>{});
  fs.writeFileSync(path.join(evidence,'roster-browser-report.json'),JSON.stringify({status:'FAIL',step:activeStep,message:error.message,stack:error.stack,results,legacyRequests,requests:[...new Set(requests)].sort()},null,2)+'\n');
  throw error;
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
