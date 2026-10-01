import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

// A bounded UI integration fixture: every imported gameplay reference is chosen
// using a canonical option value, and every attachment uses a physical ID.
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
  '5x Plague Marines (90 pts): Boltgun, 1x Meltagun',
  '5x Plague Marines (90 pts): Boltgun, 1x Meltagun'
].join('\n');
const allowed=new Map([
  [appPath,'text/html'],
  ['/books/death-guard/v2/generated/app-presentation.json','application/json'],
  ['/books/death-guard/v2/generated/rule-contract-effective.json','application/json'],
  ['/books/death-guard/v2/roster-boot.mjs','text/javascript'],
  ['/books/death-guard/v2/rule-contract-schema.mjs','text/javascript'],
  ['/books/death-guard/v2/rule-contract-state-fields.mjs','text/javascript'],
  ['/books/shared/army-book-app-v2/runtime.mjs','text/javascript'],
  ['/books/shared/army-book-app-v2/roster.mjs','text/javascript'],
  ['/books/shared/army-book-app-v2/glossary.mjs','text/javascript'],
  ['/books/shared/army-book-app-v2/styles.css','text/css'],
  ['/books/shared/roster-v2/runtime.mjs','text/javascript'],
  ['/books/shared/roster-v2/import.mjs','text/javascript'],
  ['/books/shared/roster-v2/context.mjs','text/javascript'],
  ['/books/shared/roster-v2/effects.mjs','text/javascript'],
  // This existing dependency parses text labels only; it supplies no book facts.
  ['/books/shared/roster-parser.js','text/javascript']
]);
const requests=[],legacyRequests=[];
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
  assert.equal(await page.locator('.v2-roster-error').count(),0,activeStep+' caught UI error: '+await page.locator('.v2-roster-status').textContent());
};
const noOverflow=async page=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,activeStep+' horizontal overflow');
const snapshot=page=>page.evaluate(()=>({state:window.ArmyBookAppV2.roster.snapshot(),projection:window.ArmyBookAppV2.roster.projection,effective:Object.fromEntries(window.ArmyBookAppV2.roster.state.units.map(unit=>[unit.instanceId,window.ArmyBookAppV2.roster.effective(unit.instanceId)]))}));
const physical=(page,id)=>page.locator(`[data-roster-instance-id="${id}"]`);
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
    if(device==='phone')await page.getByRole('button',{name:'Open book navigation',exact:true}).click();
    await page.getByRole('button',{name:'Roster',exact:true}).click();await page.waitForSelector('main [data-roster-view]');
    assert.equal(await page.evaluate(()=>location.hash),'#view-roster');await noOverflow(page);
    if(device==='phone')assert.equal(await page.getByRole('button',{name:'Open book navigation',exact:true}).getAttribute('aria-expanded'),'false');
    await page.locator('[data-roster-input="raw-text"]').fill(fixture);
    await page.locator('[data-roster-action="review-import"]').click();await settled(page);
    const initial=await page.locator('fieldset[data-binding-kind]').evaluateAll(nodes=>nodes.map(node=>({kind:node.dataset.bindingKind,key:node.dataset.bindingKey,value:node.querySelector('select')?.value})));
    assert.equal(await page.evaluate(()=>window.ArmyBookAppV2.roster.state),null,'Imported labels were automatically joined to factual identities');
    assert.equal(initial.filter(need=>need.kind==='DATASHEET').length,7,'Missing physical unit bindings');
    assert.ok(initial.some(need=>need.kind==='DETACHMENT'));assert.ok(initial.some(need=>need.kind==='ENHANCEMENT'));
    assert.ok(initial.every(need=>need.value===''),'A title label preselected a gameplay identity');
    const bindings=[];
    for(let round=0;round<5&&await page.locator('fieldset[data-binding-kind]').count();round++) {
      activeStep=device+'/import-binding-round-'+round;
      const needs=await page.locator('fieldset[data-binding-kind]').evaluateAll(nodes=>nodes.map(node=>({kind:node.dataset.bindingKind,key:node.dataset.bindingKey})));
      for(const need of needs) {
        const form=page.locator(`fieldset[data-binding-kind="${need.kind}"][data-binding-key="${need.key}"]`);
        let value;
        if(need.kind==='DETACHMENT')value=detachmentId;
        else if(need.kind==='DATASHEET')value=unitIds[Number(need.key.replace('parsed-unit-',''))-1];
        else if(need.kind==='ENHANCEMENT')value=enhancementId;
        else if(need.kind==='SELECTION') {
          value=need.key.startsWith(ids.bio+'/')?knivesId:need.key.endsWith('/selection/1')?boltgunId:meltagunId;
          assert.ok([ids.bio+'/unit/selection/1',ids.pmA+'/unit/selection/1',ids.pmA+'/unit/selection/2',ids.pmB+'/unit/selection/1',ids.pmB+'/unit/selection/2'].includes(need.key),'Unexpected fixture selection '+need.key);
          await form.getByRole('listbox',{name:'Canonical weapon profiles',exact:true}).selectOption([value]);
          await form.getByRole('listbox',{name:'Canonical equipment facts',exact:true}).selectOption([]);
        } else if(need.kind==='SELECTION_QUANTITY') {
          assert.ok([ids.pmA+'/unit/selection/1',ids.pmB+'/unit/selection/1'].includes(need.key),'Unexpected physical quantity owner '+need.key);
          value=5;await form.getByRole('spinbutton',{name:'Physical quantity',exact:true}).fill(String(value));
        } else throw new Error('Unexpected fixture binding kind '+need.kind+' '+need.key);
        if(['DETACHMENT','DATASHEET','ENHANCEMENT'].includes(need.kind)){assert.ok(value,'Missing exact canonical binding');await form.locator('select').selectOption(value);assert.equal(await form.locator('select').inputValue(),value);}
        bindings.push({...need,value});
      }
      await noOverflow(page);await page.locator('[data-roster-action="resolve-bindings"]').click();await settled(page);
    }
    assert.equal(await page.locator('fieldset[data-binding-kind]').count(),0,'Unresolved fixture bindings');
    const imported=await snapshot(page);
    assert.equal(imported.state.units.length,7);assert.equal(new Set(imported.state.units.map(unit=>unit.instanceId)).size,7);
    assert.deepEqual(imported.state.units.map(unit=>unit.canonicalUnitId),unitIds);
    assert.deepEqual(imported.state.units.map(unit=>unit.startingStrength),[1,1,1,3,3,5,5]);
    assert.equal(imported.state.detachmentId,detachmentId);assert.equal(imported.state.warlordInstanceId,ids.lord);
    assert.deepEqual(imported.state.units.map(unit=>unit.enhancementIds),[[enhancementId],[],[],[],[],[],[]]);
    assert.deepEqual(await page.locator('[data-roster-instance-id]').evaluateAll(nodes=>nodes.map(node=>({instanceId:node.dataset.rosterInstanceId,canonicalId:node.dataset.canonicalUnitId}))),unitIds.map((canonicalId,i)=>({instanceId:'parsed-unit-'+(i+1),canonicalId})));
    for(const id of [ids.pmA,ids.pmB]){assert.equal(weapon(imported,id,boltgunId).physicalQuantity,5);assert.equal(weapon(imported,id,meltagunId).physicalQuantity,1);assert.equal(field(weapon(imported,id,boltgunId),'strength'),'5');assert.equal(field(weapon(imported,id,boltgunId),'ap'),'-1');assert.equal(hasAbility(weapon(imported,id,meltagunId),'LETHAL HITS'),false);}
    const enhanced=weapon(imported,ids.bio,knivesId);
    assert.equal(field(enhanced,'strength'),'6');assert.equal(field(enhanced,'attacks'),'5');assert.ok(hasAbility(enhanced,'DEVASTATING WOUNDS'));
    assert.equal(imported.effective[ids.bio].applied.filter(row=>row.ruleId===enhancementId).length,3);
    for(const id of Object.values(ids).filter(id=>id!==ids.bio))assert.ok(imported.effective[id].applied.every(row=>row.ruleId!==enhancementId),'Enhancement leaked to another physical owner');
    const effectiveParity=async()=>{
      const current=await snapshot(page);
      for(const id of Object.values(ids)) {
        const ui=physical(page,id).locator(`[data-effective-instance-id="${id}"]`);
        for(const record of [...current.effective[id].profiles,...current.effective[id].weapons]) {
          const profile=ui.locator(`[data-effective-id="${record.id}"]${record.scopeId?`[data-composition-id="${record.scopeId}"]`:record.modelInstanceId?`[data-model-instance-id="${record.modelInstanceId}"]`:':not([data-model-instance-id])'}`);
          assert.equal(await profile.count(),1,activeStep+' duplicate/missing physical effective profile');
          for(const item of record.fields) {
            const cell=profile.locator(`[data-effective-field="${item.label}"]`);
            assert.equal(await cell.count(),1,'Missing effective UI field '+item.label);
            if(typeof item.value!=='object')assert.equal(await cell.textContent(),String(item.value));
          }
          if(record.abilities?.length)for(const ability of record.abilities){const text=await profile.locator('[data-effective-model-abilities]').textContent();assert.ok(text.includes(ability.name)&&text.includes(String(ability.value)),'Missing effective model ability');}
          else assert.equal(await profile.locator('[data-effective-model-abilities]').count(),0,'Stale model ability in UI');
        }
        for(const [subject,keywords] of [['INTRINSIC_UNIT',current.effective[id].intrinsicKeywords],['UNIT',current.effective[id].keywords]])assert.deepEqual(await ui.locator(`[data-keyword-subject="${subject}"] span`).allTextContents(),keywords);
        const own=current.state.units.find(unit=>unit.instanceId===id);
        const identity=await physical(page,id).locator('.v2-roster-identity > div').evaluateAll(nodes=>Object.fromEntries(nodes.map(node=>[node.querySelector('dt').textContent,node.querySelector('dd').textContent])));
        assert.equal(identity['Starting Strength'],String(own.startingStrength));assert.equal(identity.Warlord,own.warlord===null||own.warlord===undefined?'Unknown':own.warlord?'Yes':'No');
        assert.deepEqual(await physical(page,id).locator('.v2-roster-identity [data-target-id]').evaluateAll(nodes=>nodes.map(node=>node.dataset.targetId)),own.enhancementIds);
        for(const selection of own.selections) {
          const selected=physical(page,id).locator(`[data-selection-key="${selection.selectionKey}"]`);
          assert.equal(await selected.count(),1);assert.equal(await selected.locator('strong').first().textContent(),`${selection.physicalQuantity} selected · `);
          assert.deepEqual(await selected.locator('a[data-target-id]').evaluateAll(nodes=>nodes.map(node=>node.dataset.targetId)),[...selection.canonicalProfileIds,...selection.canonicalEquipmentIds]);
        }
      }
      await noOverflow(page);assert.deepEqual(errors,[],activeStep+' runtime errors');return current;
    };
    await effectiveParity();
    console.log(JSON.stringify({device,stage:'explicit-import',instances:7,bindings:bindings.length,status:'PASS'}));
    let attachmentActions=0,relatedChecks=0,popupChecks=0,reloadChecks=0;
    const related=async(instanceId,detId)=>{
      activeStep=device+'/related/'+instanceId+'/'+(detId||'ALL');
      const root=physical(page,instanceId).locator(`[data-roster-related-instance-id="${instanceId}"]`);
      await root.getByRole('combobox',{name:'Related rules detachment',exact:true}).selectOption(detId||'');await settled(page);
      const rows=await page.evaluate(({instanceId,detId})=>window.ArmyBookAppV2.roster.related(instanceId,detId),{instanceId,detId:detId||null});
      const actual=await root.locator('li[data-rule-id]').evaluateAll(nodes=>nodes.map(node=>({ruleId:node.dataset.ruleId,applicability:node.dataset.applicability})));
      assert.deepEqual(actual,rows.filter(row=>['MATCH','CONDITIONAL'].includes(row.applicability)).map(({ruleId,applicability})=>({ruleId,applicability})),activeStep+' stale or incorrect visible Related rows');
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
      const button=physical(page,leader).locator('[data-roster-action="attach"]');
      await button.locator('..').locator('select').selectOption(bodyguard);await button.click();await settled(page);attachmentActions++;return effectiveParity();
    };
    const detach=async leader=>{activeStep=device+'/detach/'+leader;await physical(page,leader).locator('[data-roster-action="detach"]').click();await settled(page);attachmentActions++;return effectiveParity();};
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
    for(const id of Object.values(ids))for(const det of [null,detachmentId,'detachment-paragons-of-putrescence',null])await related(id,det);
    await applicabilityControls();
    // Both physical-unit keyword scopes are read from the typed service, rather
    // than borrowing the CHARACTER keyword from an attached leader model.
    const scopes=await page.evaluate(id=>{const r=window.ArmyBookAppV2.roster;const unit=r.projection.units.find(unit=>unit.instanceId===id);const has=values=>values instanceof Set?values.has('CHARACTER'):values.includes('CHARACTER');return {unitCharacter:has(r.context(id,'UNIT').keywords),modelCharacter:has(r.context(id,'MODEL',unit.profiles[0].scopeId).keywords)};},ids.pmA);
    assert.equal(scopes.unitCharacter,true);assert.equal(scopes.modelCharacter,false);
    // Expand actual provenance and verify its physical source/target evidence.
    activeStep=device+'/visible-provenance';
    const provenance=physical(page,ids.lord).locator('[data-effective-instance-id] li').filter({has:page.locator(`[data-target-id="${silentBodyguardId}"]`)}).filter({has:page.locator('[data-applied-field="abilities"]')});
    assert.equal(await provenance.count(),1);await provenance.getByText('Effect provenance',{exact:true}).click();
    assert.ok((await provenance.textContent()).includes(ids.dsA));assert.ok((await provenance.textContent()).includes(ids.lord));await noOverflow(page);
    if(evidence)await page.screenshot({path:path.join(evidence,device+'-roster.png'),animations:'disabled'});
    const durable=await snapshot(page);
    const popup=async(instanceId,targetId,relatedOnly=false)=>{
      activeStep=device+'/canonical-popup/'+targetId;
      const source=relatedOnly?physical(page,instanceId).locator('[data-roster-related-instance-id]'):physical(page,instanceId);
      const link=source.locator(`[data-target-id="${targetId}"]`).first();await link.click();await page.waitForSelector('dialog[open]');
      const observation=await observeFacts(page,'dialog[open]');assert.equal(observation.targetId,targetId);assert.equal(observation.dialogs,1);
      assert.deepEqual(observation.facts.map(({visible,...fact})=>fact),expectedFacts(targetId));assert.ok(observation.facts.every(fact=>fact.visible));
      assert.deepEqual(await snapshot(page),durable,'Opening a source popup changed physical effects');await noOverflow(page);popupChecks++;return observation;
    };
    const sourcePopup=await popup(ids.lord,silentBodyguardId);
    if(evidence)await page.screenshot({path:path.join(evidence,device+'-roster-popup.png'),animations:'disabled'});
    await page.goBack();await page.waitForSelector('dialog[open]',{state:'hidden'});await page.waitForSelector('main [data-roster-view]');
    await page.goForward();await page.waitForSelector('dialog[open]');assert.deepEqual(await observeFacts(page,'dialog[open]'),sourcePopup);assert.deepEqual(await snapshot(page),durable);
    await page.reload();await ready(page);await page.waitForSelector('dialog[open]');assert.deepEqual(await observeFacts(page,'dialog[open]'),sourcePopup);assert.deepEqual(await snapshot(page),durable);reloadChecks++;
    await page.keyboard.press('Escape');await page.waitForSelector('dialog[open]',{state:'hidden'});await effectiveParity();
    await popup(ids.bio,enhancementId);await page.keyboard.press('Escape');await page.waitForSelector('dialog[open]',{state:'hidden'});
    await popup(ids.pmA,meltagunId);await page.keyboard.press('Escape');await page.waitForSelector('dialog[open]',{state:'hidden'});
    await popup(ids.bio,enhancementId,true);await page.keyboard.press('Escape');await page.waitForSelector('dialog[open]',{state:'hidden'});
    await popup(ids.lord,plagueSurgeId,true);await page.keyboard.press('Escape');await page.waitForSelector('dialog[open]',{state:'hidden'});
    activeStep=device+'/backup';
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
    results.push({device,viewport,status:'PASS',physicalInstances:7,explicitBindings:bindings.length,canonicalUnits:unitIds,readerFactsBefore:before.length,readerFactsAfter:after.length,readerRoots:payload.groups.flatMap(group=>group.itemIds).length,attachmentActions,relatedChecks,canonicalPopupChecks:popupChecks,reloadChecks,backupChecks:3,stateHash:digest(durable.state),effectsHash:digest(durable.projection),readerHash:digest(before),horizontalOverflow:0,runtimeErrors:0,staleEffects:0,duplicateRelatedRows:0});
    console.log(JSON.stringify(results.at(-1)));await context.close();activePage=null;
  }
  assert.equal(results[0].stateHash,results[1].stateHash,'Desktop/phone physical identities differ');assert.equal(results[0].effectsHash,results[1].effectsHash,'Desktop/phone deterministic effects differ');assert.equal(results[0].readerHash,results[1].readerHash,'Desktop/phone canonical Reader fields differ');
  const report={status:'PASS',scope:'Bounded DG Roster/Effect V2 browser integration',results,legacyRequests,requests:[...new Set(requests)].sort(),lexicalParserRequests:requests.filter(request=>request==='/books/shared/roster-parser.js').length,evidence};
  fs.writeFileSync(path.join(evidence,'roster-browser-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:'PASS',devices:results.length,legacyRequests:legacyRequests.length,evidence}));
} catch(error) {
  if(activePage)await activePage.screenshot({path:path.join(evidence,'roster-browser-failure.png'),animations:'disabled'}).catch(()=>{});
  fs.writeFileSync(path.join(evidence,'roster-browser-report.json'),JSON.stringify({status:'FAIL',step:activeStep,message:error.message,stack:error.stack,results,legacyRequests,requests:[...new Set(requests)].sort()},null,2)+'\n');
  throw error;
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
