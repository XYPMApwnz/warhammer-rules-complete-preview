/** F1: source-backed text-only Detachment recipients in the real main app.
 * Constructed New Recruit input and normal import/attachment/Guide controls.
 * Browser evaluation reads evidence only; it never patches state or the DOM. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';
import {chargeFixtures} from './charge-qa-fixtures.mjs';

const repo=path.resolve(process.env.F1_BROWSER_ROOT||fileURLToPath(new URL('../',import.meta.url)));
const out=path.resolve(process.env.F1_BROWSER_SCREENSHOTS||fs.mkdtempSync(path.join(os.tmpdir(),'wh-f1-recipients-browser-')));
const sourceRepo=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
assert.ok(out!==sourceRepo&&!out.startsWith(sourceRepo+path.sep),'Browser evidence must be outside the repository');
fs.mkdirSync(out,{recursive:true});
const am='adeptus-mechanicus',dg='death-guard',csm='chaos-space-marines';
const forge='detachment-lords-of-the-forge:rule',halo='detachment-haloscreed-battle-clade:rule',fly='detachment-flyblown-host:rule';
const dominusProfile='datasheet-tech-priest-dominus:profile:default';
const underseerProfile='datasheet-servitor-battleclade:profile:servitor-underseer';
const amRoster=detachment=>`+ FACTION KEYWORD: Imperium - Adeptus Mechanicus
${detachment?'+ DETACHMENT: '+detachment+'\n':''}Char1: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe
Char2: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe
9x Servitor Battleclade (110 pts)
• 1x Servitor Underseer: Mechanicus pistol, Dataspikes
• 2x Gun Servitor: 2 with Heavy arc rifle, Servo-claw
• 6x Combat Servitor: 6 with Phosphor blaster, Servo-claw
10x Skitarii Rangers (85 pts): 10x Galvanic rifle, 10x Close combat weapon
10x Skitarii Rangers (85 pts): 10x Galvanic rifle, 10x Close combat weapon`;
const dgRoster=detachment=>`+ FACTION KEYWORD: Chaos - Death Guard
${detachment?'+ DETACHMENT: '+detachment+'\n':''}7x Plague Marines (125 pts)
• 6x Plague Marine
    4 with Boltgun, Plague knives
    2 with Plague knives, Plasma gun
• 1x Plague Champion: Boltgun, Plague knives
5x Blightlord Terminators (185 pts)`;
const books='(?:adeptus-mechanicus|death-guard|chaos-space-marines|emperors-children|blood-angels|dark-angels|space-marines|tau-empire|tyranids)';
const runtimePaths=new Set(JSON.parse(fs.readFileSync(path.join(repo,'tools/pages-runtime-manifest.json'),'utf8')).files.map(row=>'/'+row.path));
const allowed=address=>!/(?:\/sources\/|-qa\.|-fixtures\.)/.test(address)&&(
  runtimePaths.has(address)||isApplicationTestDependency(address)||new RegExp('^/books/'+books+'/v2/[\\w./-]+\\.(?:mjs|js|json|css)$').test(address)||
  new RegExp('^/books/'+books+'/assets/[\\w./-]+\\.(?:png|webp|jpe?g|svg)$').test(address)||
  /^\/books\/shared\/(?:application-v2|army-book-app-v2|roster-v2|rule-contract-v2)\/[\w./-]+\.(?:mjs|js|json|css)$/.test(address)||
  ['/books/shared/datasheet-system.css','/books/shared/unit-art.css'].includes(address));
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json',
  '.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg'};
const results=[],errors=[],missing=[],requestFailures=[],screenshots=[];
const server=http.createServer((request,response)=>{
  const requested=decodeURIComponent(new URL(request.url,'http://localhost').pathname),address=requested==='/'?'/index.html':requested;
  if(address==='/favicon.ico'){response.writeHead(204);response.end();return;}
  const file=path.resolve(repo,'.'+address);
  if(!allowed(address)||!file.startsWith(repo+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    missing.push(address);response.writeHead(404);response.end();return;
  }
  response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  response.end(fs.readFileSync(file));
});
const norm=value=>String(value).replace(/\s+/g,' ').replace(/[‘’]/g,"'").trim();
const ready=page=>page.waitForFunction(()=>window.ArmyBookAppV2?.roster);
async function roster(page){
  await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();
  await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();
}
async function imported(page,text,expectedIds){
  await roster(page);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
  await page.locator('[data-roster-action="review-import"]').click();
  await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
  assert.match(await page.locator('.v2-roster-status').innerText(),/^Roster imported\./);
  const state=await page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());
  if(Array.isArray(expectedIds))assert.deepEqual(state.units.map(unit=>unit.canonicalUnitId),expectedIds,'Public import resolved the intended physical units');else assert.equal(state.units.length,expectedIds,'Existing source fixture imported documented unit count');
  return state;
}
async function guide(page,instance){
  await roster(page);await page.getByRole('button',{name:'Open personal guide',exact:true}).click();
  await page.locator('main a[data-target-id="roster-unit/'+instance+'"]').click();
  await page.locator('main .unit-card[data-roster-instance-id="'+instance+'"]').waitFor();
  assert.doesNotMatch(await page.locator('main').innerText(),/:rule:table:|table-\d+-row-\d+|source-clause-/i,'Personal Guide visible text contains no internal table or clause IDs');
}
async function attach(page,leader,bodyguard){
  await roster(page);
  await page.locator('[data-attachment-candidate-for="'+bodyguard+'"]').selectOption(leader);
  await page.locator('[data-attachment-target-instance-id="'+bodyguard+'"] [data-roster-action="attach"]').click();
  await page.locator('[data-attached-leader-instance-id="'+leader+'"]').waitFor();
}
const attachDominus=page=>attach(page,'parsed-unit-1','parsed-unit-4');
async function rows(page,ruleId,clauseId){const found=await page.locator('main .ds-conditional-policy').evaluateAll((nodes,{ruleId,clauseId})=>nodes.flatMap(node=>{
  const source=JSON.parse(node.dataset.policySource||'{}');if(source.ruleId!==ruleId||source.clauseId!==clauseId)return [];
  return [{source,cardInstance:node.closest('.unit-card')?.dataset.rosterInstanceId||null,
    execution:node.dataset.execution,classification:node.dataset.rosterClassification,subject:node.dataset.recipientSubject,
    instances:JSON.parse(node.dataset.recipientInstanceIds||'[]'),models:JSON.parse(node.dataset.recipientModelScopeIds||'[]'),
    selectionStatus:node.dataset.selectionStatus,text:node.innerText,clauseText:(node.querySelector('[data-detachment-clause-text]')||node.querySelector('p:last-child'))?.textContent,
    applies:[...node.querySelectorAll('p')].map(p=>p.innerText).filter(text=>text.startsWith('Applies to:')),
    options:[...node.querySelectorAll('[data-detachment-options] [data-option-table-id]')].map(option=>({tableId:option.dataset.optionTableId,rowIndex:Number(option.dataset.optionRowIndex),clauseId:option.dataset.optionClauseId,text:option.textContent})),
    sourceLinks:[...node.querySelectorAll('a[data-target-id]')].map(a=>a.dataset.targetId),visible:Boolean(node.getClientRects().length)}];
}),{ruleId,clauseId});
  for(const row of found.filter(row=>row.selectionStatus)){const canonical=await page.evaluate(({instance,ruleId,clauseId})=>window.ArmyBookAppV2.roster.projection.units.find(unit=>unit.instanceId===instance)?.conditional.find(row=>row.ruleId===ruleId&&row.clauseId===clauseId&&row.detachmentText)?.detachmentText.text,{instance:row.cardInstance,ruleId,clauseId});assert.equal(row.clauseText,canonical,'Visible F1 clause text equals the exact canonical source-bound text');}return found;
}
async function observation(page){return page.evaluate(()=>window.ArmyBookAppV2.roster.projection.units.map(unit=>({
  id:unit.instanceId,canonicalId:unit.canonicalUnitId,keywords:unit.keywords,metrics:unit.metrics,
  models:unit.profiles.map(model=>({id:model.canonicalProfileId,scope:model.scopeId,keywords:model.keywords,
    profile:model.profile,abilities:model.abilities,quantity:model.quantity})),
  applied:unit.applied.map(row=>({ruleId:row.ruleId,clauseId:row.clauseId,operation:row.operation,field:row.field}))
})));}
function modelExpected(observed,instance,profile){
  const unit=observed.find(row=>row.id===instance);assert.ok(unit);
  const models=unit.models.filter(model=>model.id===profile);assert.equal(models.length,1,'One independently identified MODEL scope');
  return models[0];
}
async function sourceLink(page,ruleId,clauseId,quote){
  const all=page.locator('main .ds-conditional-policy');
  const index=await all.evaluateAll((nodes,{ruleId,clauseId})=>nodes.findIndex(node=>{
    const source=JSON.parse(node.dataset.policySource||'{}');return source.ruleId===ruleId&&source.clauseId===clauseId;
  }),{ruleId,clauseId});assert.ok(index>=0);
  await all.nth(index).locator('a[data-target-id="'+ruleId+'"]').click();
  await page.locator('dialog[open]').waitFor();
  assert.ok(norm(await page.locator('dialog[open]').innerText()).includes(norm(quote)),'Source dialog contains accepted rule text');
  await page.keyboard.press('Escape');
}
async function shot(page,device,name){
  const file=path.join(out,`${device}-${name}.png`);await page.screenshot({path:file,fullPage:true});screenshots.push(file);
}
async function assertModelText(page,instance,profile,label,stage,{absent=false}={}){
  await guide(page,instance);const found=await rows(page,forge,'baffling-data-screed');
  assert.equal(found.length,absent?0:1,stage+': Baffling count');
  if(!absent){const row=found[0],runtime=await observation(page),model=modelExpected(runtime,instance,profile);
    assert.equal(row.cardInstance,instance,stage+': exact physical component owns MODEL rule');
    assert.equal(row.subject,'MODEL');assert.equal(row.execution,'CONDITIONAL_TEXT_ONLY');assert.equal(row.classification,'BATTLE_ONLY');
    assert.deepEqual(row.instances,[instance]);assert.deepEqual(row.models,[model.scope]);
    assert.equal(row.selectionStatus,'ABILITY_PRESENT');assert.equal(row.visible,true);
    assert.match(row.text,/Baffling Data Screed/);assert.match(row.text,/Not automatically calculated/i);
    assert.doesNotMatch(row.text,/Selection not recorded/);
    assert.equal(row.applies.length,1);assert.ok(row.applies[0].includes(label),stage+': visible recipient label');
    assert.doesNotMatch(row.applies[0],/Skitarii Rangers|Combat Servitor|Gun Servitor/);
    assert.ok(row.sourceLinks.includes(forge));
    assert.equal(model.profile.INSV,'4+','Existing invulnerable save remains 4+');
    assert.deepEqual(model.abilities.filter(a=>a.name==='Feel No Pain').map(a=>a.value),[5],'Existing FNP remains 5+');
    const visible=page.locator('main .unit-card[data-roster-instance-id="'+instance+'"]');
    const values=await visible.locator('[data-card-id="'+profile+'"] [data-fact-id]').evaluateAll(nodes=>nodes
      .filter(node=>node.dataset.factId.endsWith('::/INSV')).map(node=>JSON.parse(node.dataset.factValue)));
    assert.ok(values.length&&values.every(value=>value==='4+'),'Visible MODEL invulnerable save stays 4+');
    const fnp=await visible.locator('[data-ability-presentation-identity][data-canonical-ability-id="core-feel-no-pain"]')
      .evaluateAll(nodes=>nodes.map(node=>({params:JSON.parse(node.dataset.abilityParameters),text:node.innerText})));
    assert.ok(fnp.some(row=>row.params.value===5&&/Feel No Pain\s*:?\s*5\+/i.test(row.text)),'Visible existing FNP5 retained');
    assert.ok(!model.abilities.some(a=>/Baffling/i.test(a.name)),'Text rendering does not add a computed ability');
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Horizontal overflow');
  results.push({stage,instance,expected:absent?'ABSENT':'MODEL_ABILITY_PRESENT',rows:found,status:'PASS'});
}
async function assertEligibility(page,instance,ruleId,clauseId,{wanted,quote,label,stage}){
  await guide(page,instance);const found=await rows(page,ruleId,clauseId);assert.equal(found.length,wanted?1:0,stage+': eligibility count');
  if(wanted){const row=found[0];assert.equal(row.subject,'UNIT');assert.equal(row.selectionStatus,'ELIGIBLE_FOR_SELECTION');
    assert.equal(row.execution,'CONDITIONAL_TEXT_ONLY');assert.equal(row.classification,'BATTLE_ONLY');assert.deepEqual(row.models,[]);assert.deepEqual(row.instances,[instance]);
    assert.equal(row.visible,true);assert.match(row.text,/Selection not recorded/);assert.match(row.text,/Not automatically calculated|Not automatically resolved/i);
    assert.ok(norm(row.text).includes(norm(quote)));assert.ok(row.applies.some(text=>text.includes(label)));
    assert.ok(row.sourceLinks.includes(ruleId));
    const runtime=await observation(page),unit=runtime.find(unit=>unit.id===instance);
    assert.ok(!unit.keywords.includes('HALO OVERRIDE'),'No unrecorded keyword selection is applied');
    assert.ok(!unit.models.some(model=>model.abilities.some(a=>/Infiltrators/i.test(a.name))),'No unrecorded Infiltrators grant is applied');
    assert.ok(!unit.applied.some(effect=>effect.ruleId===ruleId),'Selection does not generate executable effects');
    assert.doesNotMatch(row.text,/Selected —|Selection recorded|Effect applied/);
  }
  results.push({stage,instance,expected:wanted?'ELIGIBLE_NOT_SELECTED':'ABSENT',rows:found,status:'PASS'});
}
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
let browser;
const amUnits=['unit-tech-priest-dominus','unit-tech-priest-dominus','unit-servitor-battleclade','unit-skitarii-rangers','unit-skitarii-rangers'];
try{
  assert.ok(!process.env.F1_BROWSER_DEVICE||['desktop','mobile'].includes(process.env.F1_BROWSER_DEVICE),'Unknown browser device filter');
  assert.ok(!process.env.F1_BROWSER_CASE||['Lords MODEL recipients','wrong AM Detachment','Haloscreed eligibility only','Haloscreed wrong Detachment','Flyblown Host','Virulent Vectorium','CSM daemonkin source binding','CSM wrong Detachment','EC native fixture','DG Omega','blood-angels existing export','dark-angels existing export','space-marines existing export','tau-empire existing fixture','tyranids existing fixture','CSM Creations table selection','CSM Huron table selection'].includes(process.env.F1_BROWSER_CASE),'Unknown browser case filter');
  browser=await launchChromium();
  for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]
    .filter(([device])=>!process.env.F1_BROWSER_DEVICE||process.env.F1_BROWSER_DEVICE===device)){
    const filter=process.env.F1_BROWSER_CASE;
    const run=async(book,name,work)=>{const context=await browser.newContext({viewport}),page=await context.newPage();page.setDefaultTimeout(20000);
      if(filter&&filter!==name){await context.close();return;}
      page.on('pageerror',error=>errors.push({device,name,error:error.message}));
      page.on('requestfailed',request=>{if(!request.failure()?.errorText.includes('ERR_ABORTED'))requestFailures.push({url:request.url(),error:request.failure()?.errorText});});
      try{await page.goto(origin+'/v2/app.html');await page.locator('[data-v2-book="'+book+'"]').click();await ready(page);await work(page);
        console.log('PASS '+device+' '+name);
      }catch(error){const diagnostic={url:page.url(),body:await page.locator('body').innerText().catch(()=>''),missing:[...missing],errors:[...errors]};
        results.push({device,name,status:'FAIL',error:error.stack,diagnostic});console.error(device+' '+name+': '+error.stack+'\n'+JSON.stringify(diagnostic));process.exitCode=1;throw error;
      }finally{await context.close();}
    };
    await run(am,'Lords MODEL recipients',async page=>{
      await imported(page,amRoster('Lords of the Forge'),amUnits);
      await assertModelText(page,'parsed-unit-2',dominusProfile,'Dominus',device+' standalone Dominus');
      await sourceLink(page,forge,'baffling-data-screed','Friendly TECH-PRIEST models have the following ability:');
      await shot(page,device,'forge-standalone-dominus');
      await assertModelText(page,'parsed-unit-3',underseerProfile,'Servitor Underseer',device+' Underseer');
      const runtime=await observation(page),battle=runtime.find(unit=>unit.id==='parsed-unit-3');
      assert.equal(battle.models.filter(model=>model.keywords.includes('TECH-PRIEST')).length,1);
      assert.ok(battle.models.filter(model=>model.id!==underseerProfile).every(model=>!model.keywords.includes('TECH-PRIEST')));
      await shot(page,device,'forge-underseer');
      await assertModelText(page,'parsed-unit-5',null,null,device+' independent Rangers',{absent:true});
      await attachDominus(page);
      await assertModelText(page,'parsed-unit-1',dominusProfile,'Dominus',device+' attached Dominus');
      await shot(page,device,'forge-attached-dominus');
      await guide(page,'parsed-unit-4');const attached=await rows(page,forge,'baffling-data-screed');
      assert.equal(attached.length,1,'Formed unit shows one MODEL-only row');assert.equal(attached[0].cardInstance,'parsed-unit-1');
      assert.deepEqual(attached[0].instances,['parsed-unit-1']);assert.doesNotMatch(attached[0].applies.join(' '),/Skitarii Rangers/);
      assert.equal(await page.locator('main .unit-card[data-roster-instance-id="parsed-unit-4"] .ds-conditional-policy[data-recipient-subject="MODEL"]').count(),0,'Formed UNIT keywords never confer MODEL-only text on Bodyguard');
      await shot(page,device,'forge-rangers-no-model-leak');
      await page.reload();await ready(page);await assertModelText(page,'parsed-unit-1',dominusProfile,'Dominus',device+' reload attached Dominus');
      await roster(page);await page.locator('[data-roster-action="detach"][data-leader-instance-id="parsed-unit-1"]').click();
      await assertModelText(page,'parsed-unit-4',null,null,device+' detached Rangers',{absent:true});
      await attach(page,'parsed-unit-1','parsed-unit-5');await assertModelText(page,'parsed-unit-1',dominusProfile,'Dominus',device+' reattached Dominus');
      await assertModelText(page,'parsed-unit-4',null,null,device+' former Bodyguard remains absent',{absent:true});
    });
    for(const detachment of ['Haloscreed Battle Clade'])await run(am,'wrong AM Detachment',async page=>{
      await imported(page,amRoster(detachment),amUnits);
      for(const instance of ['parsed-unit-2','parsed-unit-3','parsed-unit-5'])await assertModelText(page,instance,null,null,device+' no Forge '+instance,{absent:true});
    });
    await run(am,'Haloscreed eligibility only',async page=>{
      await imported(page,amRoster('Haloscreed Battle Clade'),amUnits);
      for(const instance of ['parsed-unit-2','parsed-unit-3','parsed-unit-5'])await assertEligibility(page,instance,halo,'halo-override-selection',{
        wanted:true,quote:'select one or more ADEPTUS MECHANICUS units',label:instance==='parsed-unit-2'?'Dominus':instance==='parsed-unit-3'?'Servitor Battleclade':'Skitarii Rangers',stage:device+' Haloscreed '+instance});
      await sourceLink(page,halo,'halo-override-selection','Until the start of your next Command phase, those units gain the HALO OVERRIDE keyword.');
      await shot(page,device,'haloscreed-selection-not-recorded');
    });
    for(const detachment of ['Lords of the Forge'])await run(am,'Haloscreed wrong Detachment',async page=>{
      await imported(page,amRoster(detachment),amUnits);await assertEligibility(page,'parsed-unit-5',halo,'halo-override-selection',{wanted:false,stage:device+' no Haloscreed'});
    });
    for(const detachment of ['Flyblown Host','Virulent Vectorium'])await run(dg,detachment,async page=>{
      await imported(page,dgRoster(detachment),['unit-plague-marines','unit-blightlord-terminators']);
      const wanted=detachment==='Flyblown Host';
      await assertEligibility(page,'parsed-unit-1',fly,'selected-infiltrators',{wanted,quote:'you can select up to two friendly PLAGUE MARINES units',label:'Plague Marines',stage:device+' '+detachment+' Plague Marines'});
      if(wanted){await sourceLink(page,fly,'selected-infiltrators','Those units have Infiltrators.');await shot(page,device,'flyblown-selection-not-recorded');}
      await assertEligibility(page,'parsed-unit-2',fly,'selected-infiltrators',{wanted:false,stage:device+' '+detachment+' Blightlord negative'});
    });
    const daemonkin=chargeFixtures.find(fixture=>fixture.id==='csm-daemonkin');
    assert.ok(daemonkin,'Existing reviewed CSM fixture missing');
    const veteranRule='detachment-veterans-of-the-long-war:rule',veteranClause='source-clause-1-1';
    const csmUnits=['unit-master-of-possession','unit-master-of-possession','unit-legionaries','unit-legionaries','unit-chaos-lord'];
    await run(csm,'CSM daemonkin source binding',async page=>{
      await imported(page,daemonkin.text,csmUnits);await attach(page,daemonkin.source,daemonkin.bodyguard);
      for(const instance of [daemonkin.source,daemonkin.bodyguard,'parsed-unit-2']){
        await guide(page,instance);const found=await rows(page,veteranRule,veteranClause),runtime=await observation(page);
        const wanted=instance==='parsed-unit-2'?['parsed-unit-2']:[daemonkin.source,daemonkin.bodyguard];
        assert.deepEqual(found.map(row=>row.cardInstance).toSorted(),wanted.toSorted(),'Actual CSM adapter keeps MODEL text on every proven physical component');
        for(const row of found){const unit=runtime.find(unit=>unit.id===row.cardInstance);
          assert.equal(row.subject,'MODEL');assert.equal(row.classification,'BATTLE_ONLY');assert.equal(row.selectionStatus,'CONDITIONAL');
          assert.equal(row.execution,'CONDITIONAL_TEXT_ONLY');assert.deepEqual(row.instances,[row.cardInstance]);
          assert.deepEqual(row.models.toSorted(),unit.models.map(model=>model.scope).toSorted());
          assert.ok(row.models.length);assert.ok(row.visible);assert.ok(row.sourceLinks.includes(veteranRule));
          assert.ok(norm(row.text).includes('makes an attack that targets your focus of hatred, you can re-roll the Hit roll.'));
          assert.match(row.text,/Not automatically calculated/);
        }
        assert.equal(runtime.find(unit=>unit.id===daemonkin.source).metrics.chargeRoll.modifier,1,'Existing actual Daemonkin charge modifier retained');
        assert.equal(runtime.find(unit=>unit.id===daemonkin.bodyguard).metrics.chargeRoll.modifier,1,'Existing actual attached charge recipient retained');
        results.push({device,stage:'CSM actual daemonkin '+instance,expected:wanted,rows:found,status:'PASS'});
      }
      await sourceLink(page,veteranRule,veteranClause,'excluding DAMNED models');
      await shot(page,device,'csm-daemonkin-source-binding');
    });
    await run(csm,'CSM wrong Detachment',async page=>{
      await imported(page,daemonkin.text.replace('Veterans of the Long War','Renegade Raiders'),csmUnits);
      await guide(page,daemonkin.source);assert.equal((await rows(page,veteranRule,veteranClause)).length,0,'CSM wrong Detachment excludes Veterans text');
      results.push({device,stage:'CSM wrong Detachment',expected:'ABSENT',status:'PASS'});
    });

    for(const [detachment,name,rule,optionCount]of [['Creations of Bile','CSM Creations table selection','detachment-creations-of-bile:rule',6],["Huron's Marauders",'CSM Huron table selection','detachment-huron-s-marauders:rule',2]])await run(csm,name,async page=>{
      const text=daemonkin.text.replace('Veterans of the Long War',detachment)+'\n'+
        '10x Cultist Mob (50 pts)\n• 1x Cultist Champion: Autopistol, Brutal assault weapon\n• 9x Chaos Cultist: Autopistol, Brutal assault weapon\n'+
        '1x Heretic Astartes Daemon Prince (100 pts): Infernal cannon, Hellforged weapons\nDaemonic Allegiance: Khorne\n';
      await imported(page,text,[...csmUnits,'unit-cultist-mob','unit-heretic-astartes-daemon-prince']);
      await guide(page,'parsed-unit-1');const found=await rows(page,rule,'source-clause-1-1');assert.equal(found.length,1,'One source-first lead group');
      assert.equal(found[0].selectionStatus,'ELIGIBLE_FOR_SELECTION');assert.match(found[0].text,/Selection not recorded/);assert.doesNotMatch(found[0].text,/Ability available|Effect applied|Selected —/);
      // Option count and canonical cells are read from the verified projection;
      // renderer evidence must retain every source option inside its lead group.
      const options=await page.evaluate(({rule})=>window.ArmyBookAppV2.roster.projection.units[0].conditional.find(row=>row.ruleId===rule&&row.clauseId==='source-clause-1-1').detachmentText.tableOptions,{rule});
      assert.equal(options.length,optionCount);assert.equal(found[0].options.length,optionCount);for(const option of options){const shown=found[0].options.find(row=>row.tableId===option.tableId&&row.rowIndex===option.rowIndex&&row.clauseId===option.clauseId);assert.ok(shown,'Canonical table id, row and clause are retained as evidence attributes');assert.equal(shown.text,option.text,'Grouped option preserves exact canonical cells');}
      assert.equal(await page.locator('main .ds-conditional-policy[data-conditional-policy="DETACHMENT_TEXT"]').count(),1,'Options are not duplicated as separate granted abilities');
      for(const id of detachment==='Creations of Bile'?['parsed-unit-6','parsed-unit-7']:['parsed-unit-7']){await guide(page,id);assert.equal(await page.locator('main .ds-conditional-policy[data-conditional-policy="DETACHMENT_TEXT"]').count(),0,'Real DAMNED/non-INFANTRY unit cannot acquire selected table options');}
      await guide(page,'parsed-unit-1');results.push({device,stage:name,lead:found,options,negatives:detachment==='Creations of Bile'?['DAMNED Cultist Mob','non-INFANTRY Daemon Prince']:['non-INFANTRY Daemon Prince'],status:'PASS'});await shot(page,device,name.includes('Creations')?'csm-creations-table-selection':'csm-huron-table-selection');
    });
    await run('emperors-children','EC native fixture',async page=>{
      const fixture=JSON.parse(fs.readFileSync(path.join(repo,'books/emperors-children/v2/roster-import-fixtures.json'),'utf8')).fixtures.find(row=>row.id==='bsdata-model-variants');
      assert.ok(fixture);await imported(page,fixture.text.replace('Carnival of Excess','Mercurial Host'),['unit-noise-marines','unit-tormentors']);
      for(const instance of ['parsed-unit-1','parsed-unit-2']){await guide(page,instance);const found=await rows(page,'detachment-mercurial-host:rule','advance-roll');
        assert.equal(found.length,1);assert.equal(found[0].subject,'UNIT');assert.deepEqual(found[0].instances,[instance]);assert.equal(found[0].classification,'BATTLE_ONLY');
        assert.match(found[0].text,/Not automatically calculated/);assert.ok(found[0].sourceLinks.includes('detachment-mercurial-host:rule'));
        results.push({device,stage:'EC native '+instance,rows:found,status:'PASS'});}
      await shot(page,device,'ec-native-source-binding');
    });
    await run(dg,'DG Omega',async page=>{
      const text=fs.readFileSync(path.join(repo,'books/death-guard/v2/fixtures/omega-megaroster.txt'),'utf8');await imported(page,text,38);
      await assertEligibility(page,'parsed-unit-1',fly,'selected-infiltrators',{wanted:true,quote:'you can select up to two friendly PLAGUE MARINES units',label:'Plague Marines',stage:device+' Omega standalone PM'});
      await attach(page,'parsed-unit-27','parsed-unit-1');await guide(page,'parsed-unit-1');
      const attached=await rows(page,fly,'selected-infiltrators');assert.ok(attached.length);for(const row of attached){assert.equal(row.subject,'UNIT');assert.deepEqual(row.instances.toSorted(),['parsed-unit-1','parsed-unit-27'].toSorted());assert.equal(row.selectionStatus,'ELIGIBLE_FOR_SELECTION');}
      const before=await page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());await page.reload();await ready(page);assert.deepEqual(await page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot()),before);
      await guide(page,'parsed-unit-1');assert.deepEqual(await rows(page,fly,'selected-infiltrators'),attached,'Actual persisted Omega retains full UNIT recipient proof');
      await roster(page);await page.locator('[data-roster-action="detach"][data-leader-instance-id="parsed-unit-27"]').click();
      await assertEligibility(page,'parsed-unit-1',fly,'selected-infiltrators',{wanted:true,quote:'you can select up to two friendly PLAGUE MARINES units',label:'Plague Marines',stage:device+' Omega detached PM'});
      results.push({device,stage:'DG Omega attached/reload/detach',rows:attached,status:'PASS'});await shot(page,device,'dg-omega-source-binding');
    });
    const tauText='+ FACTION KEYWORD: T’au Empire\n+ DETACHMENT: Kauyon\n+ DETACHMENT: Kroot Hunting Pack\n'+
      '1x Darkstrider (100 pts)\n• 1x Darkstrider: 1x Shade\n'+
      '1x Commander In Coldstar Battlesuit (100 pts)\n• 1x Commander in Coldstar Battlesuit: 1x Plasma rifle\nEnhancement: Precision of the Patient Hunter\n'+
      '3x Crisis Fireknife Battlesuits (100 pts)\n• 1x Crisis Fireknife Shas’vre: 1x Plasma rifle\n• 2x Crisis Fireknife Shas’ui: 1x Plasma rifle\n'+
      '10x Kroot Carnivores (100 pts)\n• 1x Long-quill: 1x Kroot rifle\n• 9x Kroot Carnivores: 1x Kroot rifle\n';
    const tyrText='+ FACTION KEYWORD: Tyranids\n+ DETACHMENT: Invasion Fleet\n'+['Acid spray','Rupture cannon','Fleshborer hive'].map((weapon,i)=>`1x Tyrannofex (${i===1?190:180} pts)\n• 1x Tyrannofex: ${weapon}, Stinger salvoes, Powerful limbs\n`).join('');
    const broadFixtures=[
      {book:'blood-angels',name:'blood-angels existing export',file:'books/blood-angels/v2/fixtures/newrecruit-v37.2-user-redemptor.txt',count:1},
      {book:'dark-angels',name:'dark-angels existing export',file:'books/dark-angels/v2/fixtures/newrecruit-v37.3-user-da.txt',count:1},
      {book:'space-marines',name:'space-marines existing export',file:'books/space-marines/v2/fixtures/newrecruit-v37.3-user-sm.txt',count:3},
      {book:'tau-empire',name:'tau-empire existing fixture',text:tauText,count:4},
      {book:'tyranids',name:'tyranids existing fixture',text:tyrText,count:3}
    ];
    for(const fixture of broadFixtures)await run(fixture.book,fixture.name,async page=>{
      const state=await imported(page,fixture.file?fs.readFileSync(path.join(repo,fixture.file),'utf8'):fixture.text,fixture.count),evidence=[];
      for(const physical of state.units){await guide(page,physical.instanceId);
        const expected=await page.evaluate(instance=>{const unit=window.ArmyBookAppV2.roster.projection.units.find(unit=>unit.instanceId===instance);return {
          f1:unit.conditional.filter(row=>row.detachmentText),typed:unit.conditional.filter(row=>row.policy).map(row=>({ruleId:row.ruleId,clauseId:row.clauseId,kind:row.policy.kind,payload:row.policy.payload}))};},physical.instanceId);
        for(const row of expected.f1){const found=await rows(page,row.ruleId,row.clauseId);assert.ok(found.some(item=>item.cardInstance===physical.instanceId));for(const shown of found){assert.equal(shown.classification,'BATTLE_ONLY');assert.match(shown.text,/Not automatically calculated|Selection not recorded/);}}
        if(!expected.f1.length)assert.equal(await page.locator('main .unit-card[data-roster-instance-id="'+physical.instanceId+'"] .ds-conditional-policy[data-selection-status]').count(),0,'No unsupported F1 appears without eligible source clauses');
        for(const typed of expected.typed)assert.ok((await rows(page,typed.ruleId,typed.clauseId)).length,'Existing typed source remains visible');
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
        evidence.push({instanceId:physical.instanceId,canonicalId:physical.canonicalUnitId,...expected,sourceApplicability:expected.f1.length?'ELIGIBLE':'N/A: physical fixture has no eligible F1 clause'});
      }
      results.push({device,stage:fixture.name,actualExport:Boolean(fixture.file),evidence,status:'PASS'});await shot(page,device,fixture.book+'-existing-fixture');
    });

  }
  assert.equal(errors.length,0,'Uncaught browser errors');assert.equal(missing.length,0,'Missing or disallowed runtime resource');
  assert.equal(requestFailures.length,0,'Failed runtime resource');
  assert.ok(results.length,'No browser assertion was executed');
}finally{
  console.log('F1 browser evidence: '+out);
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({browser:browser?.version(),root:repo,
    realNewRecruitExportTested:false,viewports:[{width:1440,height:1000},{width:390,height:844}],
    filters:{device:process.env.F1_BROWSER_DEVICE||null,case:process.env.F1_BROWSER_CASE||null},
    limitations:[{scenario:'No selected Detachment',status:'NOT_RUN',reason:'The public New Recruit import requires a resolved Detachment; an empty state is not a valid player fixture. Wrong selected Detachment controls test exclusion through the real UI.'}],
    results,errors,missing,requestFailures,screenshots},null,2)+'\n');
  if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
}
