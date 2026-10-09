import {isApplicationTestDependency} from '../../shared/application-v2/browser-test-dependencies.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

// These expectations are transcribed from current canonical source clauses,
// rather than from applied-effect/debug output. Every value below is asserted
// in the normal personal-guide DOM and its canonical popup where relevant.
const directory=path.dirname(fileURLToPath(import.meta.url)),repo=path.resolve(directory,'../../..');
const read=name=>JSON.parse(fs.readFileSync(path.join(directory,name),'utf8'));
const book=read('generated/roster-runtime.json'),records=new Map(book.entities.map(e=>[e.id,e]));
const originalFiles=new Map(['generated/effective.json','generated/rule-contracts.json','generated/roster-runtime.json','generated/app-presentation.json']
  .map(name=>[name,fs.readFileSync(path.join(directory,name))]));
const sourceExpectations=[
 ['detachment-haloscreed-battle-clade:enhancement:2','The Conqueror Imperative and Protector Imperative are both active for the bearer’s unit.'],
 ['detachment-haloscreed-battle-clade:enhancement:3','Add 6" to the range characteristic of ranged weapons equipped by models in the bearer’s unit'],
 ['detachment-eradication-cohort:enhancement:4','Add 2 to the Attacks characteristic of melee weapons equipped by the bearer'],
 ['detachment-lords-of-the-forge:rule','Friendly TECH-PRIEST models have:\n- 4+ InSv.\n- Feel No Pain 5+.'],
 ['detachment-skitarii-hunter-cohort:enhancement:2','The bearer, and models in any unit they are leading, have the Infiltrators and Scouts 6" abilities.'],
 ['detachment-cohort-acquisitus:enhancement:2','This unit has Lone Operative 15".'],
 ['detachment-haloscreed-battle-clade:enhancement:1','HALO OVERRIDE'],
 ['detachment-cohort-cybernetica:rule','Add 2" to the Move characteristic of models in LEGIO CYBERNETICA units from your army.'],
 ['detachment-lords-of-the-forge:enhancement:2','This model has the following weapon:']
];
for(const [id,quote]of sourceExpectations)assert.ok(records.get(id).data.text.includes(quote),`Current-source expectation changed: ${id}`);
const unit=(instanceId,name,enhancementIds=[])=>{
  const canonicalUnitId='unit-'+name,owner=records.get(canonicalUnitId),mixed=owner.data.profileIds.length>1;
  return {instanceId,canonicalUnitId,startingStrength:mixed?9:1,warlord:null,enhancementIds,equipmentContextKnown:true,
    modelRows:owner.data.profileIds.map((canonicalProfileId,i)=>({rowId:instanceId+'/row-'+i,canonicalProfileId,
      quantity:mixed&&i===1?8:1,selections:[],loadouts:[]})),
    selections:owner.data.weaponIds.map((canonicalProfileId,i)=>({selectionKey:instanceId+'/weapon-'+i,
      canonicalProfileIds:[canonicalProfileId],canonicalEquipmentIds:[],physicalQuantity:1}))};
};
const snapshot=(units,detachmentIds)=>({schema:'roster-v2/roster',bookId:book.bookId,rosterId:'admech-visible-effects',units,
  detachmentIds,detachments:detachmentIds.map((id,i)=>({instanceId:'detachment-'+i,canonicalDetachmentId:id})),attachments:[],warlordInstanceId:null});
const app='/books/adeptus-mechanicus/v2/app.html';
const forbidden=address=>!isApplicationTestDependency(address)&&(/\/books\/death-guard\/(?!assets\/)/.test(address)||
  /\/books\/adeptus-mechanicus\/(?!v2\/|assets\/)/.test(address)||
  /(?:target-data|compatible-rules\.json|correction-ledger|enhancement-owner|\/glossary\/(?:data|generated)|\/shared\/(?:roster-parser|effect-runtime|roster-context)\.)/.test(address));
const allowed=address=>isApplicationTestDependency(address)||address===app||/^\/books\/adeptus-mechanicus\/v2\/(?:theme\.css|[\w.-]+\.mjs|roster-import-aliases\.json|generated\/(?:app-presentation|roster-runtime)\.json)$/.test(address)||
  /^\/books\/shared\/(?:army-book-app-v2|rule-contract-v2|roster-v2)\/[\w.-]+\.(?:mjs|css)$/.test(address)||
  /^\/books\/shared\/(?:datasheet-system|unit-art)\.css$/.test(address)||
  /^\/(?:books\/adeptus-mechanicus\/assets|assets)\/[\w./-]+\.(?:webp|png|jpe?g|svg)$/.test(address);
const forbiddenRequests=[],unexpectedRequests=[];
const server=http.createServer((request,response)=>{
  const address=new URL(request.url,'http://localhost').pathname;
  if(forbidden(address)){forbiddenRequests.push(address);response.writeHead(200,{'Content-Type':'text/javascript'});response.end('throw new Error("POISONED_LEGACY_RUNTIME");');return;}
  if(!allowed(address)){if(address!=='/favicon.ico')unexpectedRequests.push(address);response.writeHead(404);response.end();return;}
  const mime=address.endsWith('.mjs')?'text/javascript':address.endsWith('.css')?'text/css':address.endsWith('.html')?'text/html':address.endsWith('.json')?'application/json':address.endsWith('.svg')?'image/svg+xml':address.endsWith('.png')?'image/png':address.endsWith('.webp')?'image/webp':'image/jpeg';
  response.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'});response.end(fs.readFileSync(path.join(repo,address.slice(1))));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const screenshots=process.env.ARMY_APP_V2_SCREENSHOTS;if(screenshots)fs.mkdirSync(screenshots,{recursive:true});
const results=[];
try{
 for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
  const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[];let checks=0;
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}${app}`);
  await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.rosterPanel));await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);
  assert.equal(await page.evaluate(()=>window.ArmyBookAppV2.roster.state),null,'Book startup invented roster state');
  const api=async(fn,arg)=>page.evaluate(fn,arg);
  const open=async id=>{await api(id=>{window.ArmyBookAppV2.openPersonalGuide();window.ArmyBookAppV2.openInstance(id);},id);
    await page.waitForFunction(id=>document.querySelector('main .v2-current-card')?.dataset.rosterInstanceId===id,id);};
  const load=async state=>api(state=>window.ArmyBookAppV2.roster.load(state),state);
  const attach=async(source,target)=>api(([source,target])=>window.ArmyBookAppV2.roster.attach(source,target),[source,target]);
  const detach=async source=>api(source=>window.ArmyBookAppV2.roster.detach(source),source);
  const inspect=async(id,detail=false)=>page.locator(`${detail?'dialog[open]':'main'} [data-card-id="${id}"]`).evaluateAll(nodes=>nodes.filter(n=>n.getClientRects().length).map(node=>({
    text:node.innerText,fields:[...node.querySelectorAll('[data-fact-id]')].filter(f=>f.closest('[data-card-id]')===node&&f.getClientRects().length)
      .map(f=>({path:f.dataset.factId.split('::')[1],value:JSON.parse(f.dataset.factValue),text:f.innerText}))})));
  const surfaces=async id=>{const main=await inspect(id);assert.ok(main.length,`${device} missing visible canonical card ${id}`);
    await api(id=>window.ArmyBookAppV2.showDetail(id),id);await page.waitForSelector('dialog.v2-detail-dialog[open]');
    const detail=await inspect(id,true);assert.ok(detail.length,`${device} missing canonical popup ${id}`);
    await page.getByRole('button',{name:'Close rule reference',exact:true}).click();await page.waitForSelector('dialog.v2-detail-dialog[open]',{state:'hidden'});
    return [main,detail];};
  const field=async(id,pointer,value)=>{for(const observed of await surfaces(id)){
    const found=observed.flatMap(row=>row.fields.filter(f=>f.path===pointer));assert.ok(found.length,`${device} missing ${id}${pointer}`);
    assert.ok(found.every(f=>f.value===value),`${device} wrong visible ${id}${pointer}: ${JSON.stringify(found)}`);
    assert.ok(found.every(f=>f.text.trim().startsWith(String(value))),`${device} DOM metadata differs from actual displayed value ${id}${pointer}: ${JSON.stringify(found)}`);checks++;}};
  const ability=async(id,name,present=true)=>{for(const observed of await surfaces(id)){
    const wanted=name.toUpperCase();for(const row of observed){const found=row.fields.some(f=>f.path.startsWith('/abilities/')&&String(f.value).toUpperCase()===wanted);
      assert.equal(found,present,`${device} visible weapon ability ${id}/${name}`);}checks++;}};
  const natural=async(id,pattern,present=true)=>{for(const observed of await surfaces(id)){
    assert.equal(observed.some(row=>pattern.test(row.text)),present,`${device} missing normal presentation ${id}: ${pattern}`);checks++;}};
  const modelAbility=async(id,canonicalId,parameters,pattern,present=true)=>{
    const rows=await page.locator('main [data-ability-presentation-identity]').evaluateAll((nodes,{id,canonicalId,parameters})=>nodes.filter(node=>
      node.dataset.canonicalAbilityId===canonicalId&&JSON.stringify(JSON.parse(node.dataset.abilityParameters))===JSON.stringify(parameters)&&
      JSON.parse(node.dataset.recipientScopes).some(scope=>JSON.parse(scope)[1]===id)).map(node=>node.innerText),{id,canonicalId,parameters});
    assert.equal(rows.length,present?1:0,`${device} exact MODEL ability ${id}/${canonicalId} must render once`);
    if(present)assert.match(rows[0],pattern);checks++;
    const popup=(await surfaces(id)).at(-1);assert.equal(popup.some(row=>pattern.test(row.text)),present,`${device} popup MODEL ability ${id}/${canonicalId}`);checks++;
  };
  const usable=async()=>{
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${device} horizontal overflow`);
    assert.doesNotMatch(await page.locator('main').innerText(),/parsed-unit-|SUPPORT_EXCEPTION|targetUnitReferenceIds|\bCURRENT\b/);checks++;
  };

  // Real text import and Bodyguard-first attachment controls, without manual
  // canonical selectors or direct writes to the roster snapshot.
  const text=`+ FACTION KEYWORD: Imperium - Adeptus Mechanicus\n+ DETACHMENT: Haloscreed Battle Clade, Lords of the Forge\nChar1: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe\nEnhancement: Cognitive Reinforcement\n9x Servitor Battleclade (110 pts)\n• 1x Servitor Underseer: Mechanicus pistol, Dataspikes\n• 2x Gun Servitor: 2 with Heavy arc rifle, Servo-claw\n• 6x Combat Servitor: 6 with Phosphor blaster, Servo-claw`;
  await api(()=>window.ArmyBookAppV2.openRoster());
  await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
  await page.locator('[data-roster-action="review-import"]').click();
  await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state?.units?.length===2);
  assert.equal(await page.locator('[data-roster-bindings] select').count(),0,'Unambiguous import asked for canonical reconstruction');
  await page.locator('[data-attachment-candidate-for="parsed-unit-2"]').selectOption('parsed-unit-1');
  await page.locator('[data-attachment-target-instance-id="parsed-unit-2"] [data-roster-action="attach"]').click();
  await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state.attachments.length===1);
  await page.locator('[data-roster-action="open-personal-guide"]').click();await open('parsed-unit-1');
  await field('datasheet-tech-priest-dominus:weapon:5','/skill','2+');
  await field('datasheet-tech-priest-dominus:weapon:6','/skill','2+');
  await ability('datasheet-tech-priest-dominus:weapon:5','HEAVY');await ability('datasheet-tech-priest-dominus:weapon:5','ASSAULT');
  await modelAbility('datasheet-tech-priest-dominus:profile:default','core-feel-no-pain',{value:5},/Feel No Pain\s*:?\s*5\+/i);await usable();
  await open('parsed-unit-2');await field('datasheet-servitor-battleclade:weapon:1','/skill','3+');await usable();
  if(screenshots)await page.screenshot({path:path.join(screenshots,`admech-effective-${device}-imported-servitors.png`),fullPage:true});

  // Permanent numeric effects and two copies of the same physical datasheet.
  const halo='detachment-haloscreed-battle-clade',erad='detachment-eradication-cohort',forge='detachment-lords-of-the-forge';
  const state=snapshot([unit('owner','tech-priest-dominus',[halo+':enhancement:2',halo+':enhancement:3']),unit('duplicate','tech-priest-dominus'),
    unit('body','servitor-battleclade'),unit('other-body','servitor-battleclade')],[halo]);
  await load(state);await attach('owner','body');await open('owner');
  for(const id of ['datasheet-tech-priest-dominus:weapon:1','datasheet-tech-priest-dominus:weapon:5']){
    await field(id,'/skill','2+');await field(id,'/range','30"');await ability(id,'HEAVY');await ability(id,'ASSAULT');
  }
  await field('datasheet-tech-priest-dominus:weapon:6','/skill','2+');await field('datasheet-tech-priest-dominus:weapon:6','/ap','-2');
  await open('duplicate');await field('datasheet-tech-priest-dominus:weapon:5','/skill','3+');await field('datasheet-tech-priest-dominus:weapon:5','/range','24"');
  await ability('datasheet-tech-priest-dominus:weapon:5','ASSAULT',false);
  await open('body');await field('datasheet-servitor-battleclade:weapon:1','/range','36"');await field('datasheet-servitor-battleclade:weapon:1','/skill','3+');
  await detach('owner');await open('body');await field('datasheet-servitor-battleclade:weapon:1','/range','30"');await field('datasheet-servitor-battleclade:weapon:1','/skill','4+');
  await attach('owner','body');await open('body');await field('datasheet-servitor-battleclade:weapon:1','/range','36"');await usable();

  await load(snapshot([unit('owner','skitarii-marshal',[erad+':enhancement:1',erad+':enhancement:3',erad+':enhancement:4']),
    unit('duplicate','skitarii-marshal'),unit('body','skitarii-rangers')],[erad]));
  await attach('owner','body');await open('owner');
  await field('datasheet-skitarii-marshal:weapon:2','/attacks','6');await field('datasheet-skitarii-marshal:weapon:2','/skill','2+');
  await field('datasheet-skitarii-marshal:weapon:2','/ap','-2');await field('datasheet-skitarii-marshal:weapon:2','/damage','2');
  await field('datasheet-skitarii-marshal:weapon:1','/range','18"');await field('datasheet-skitarii-marshal:weapon:1','/strength','7');
  await open('duplicate');await field('datasheet-skitarii-marshal:weapon:2','/ap','-1');

  // Global MODEL selectors must display Underseer-only defenses rather than
  // inheriting TECH-PRIEST onto sibling Combat/Gun Servitor profiles.
  const contributed=forge+':enhancement:2:weapon:1';
  const weaponState=snapshot([unit('owner','tech-priest-dominus',[forge+':enhancement:2']),unit('duplicate','tech-priest-dominus'),unit('body','servitor-battleclade')],[forge]);
  await load(weaponState);await attach('owner','body');await open('owner');
  for(const key of ['range','attacks','skill','strength','ap','damage'])await field(contributed,'/'+key,records.get(contributed).data[key]);
  await open('duplicate');assert.equal((await inspect(contributed)).length,0,'Canonical weapon leaked to duplicate');checks++;
  await open('body');assert.equal((await inspect(contributed)).length,0,'Canonical weapon leaked through attachment');checks++;
  await modelAbility('datasheet-servitor-battleclade:profile:servitor-underseer','core-feel-no-pain',{value:5},/Feel No Pain\s*:?\s*5\+/i);
  await modelAbility('datasheet-servitor-battleclade:profile:combat-and-gun-servitors','core-feel-no-pain',{value:5},/Feel No Pain\s*:?\s*5\+/i);
  // Dominus grants FNP to the whole led unit; detach leaves only the global
  // TECH-PRIEST Underseer grant, making profile isolation observable.
  await detach('owner');await open('body');
  await modelAbility('datasheet-servitor-battleclade:profile:servitor-underseer','core-feel-no-pain',{value:5},/Feel No Pain\s*:?\s*5\+/i);
  await modelAbility('datasheet-servitor-battleclade:profile:combat-and-gun-servitors','core-feel-no-pain',{value:5},/Feel No Pain\s*:?\s*5\+/i,false);
  await field('datasheet-servitor-battleclade:profile:servitor-underseer','/INSV','4+');
  await natural('datasheet-servitor-battleclade:profile:combat-and-gun-servitors',/INV\s*6\+/i);
  if(screenshots)await page.screenshot({path:path.join(screenshots,`admech-effective-${device}-mixed-profiles.png`),fullPage:true});
  await api(()=>{const r=window.ArmyBookAppV2.roster,s=r.snapshot();s.units.find(u=>u.instanceId==='owner').enhancementIds=[];r.load(s);});
  await open('owner');assert.equal((await inspect(contributed)).length,0);checks++;
  await api(id=>{const r=window.ArmyBookAppV2.roster,s=r.snapshot();s.units.find(u=>u.instanceId==='owner').enhancementIds=[id];r.load(s);},forge+':enhancement:2');
  await open('owner');await field(contributed,'/strength',records.get(contributed).data.strength);

  const hunter='detachment-skitarii-hunter-cohort';
  await load(snapshot([unit('owner','skitarii-marshal',[hunter+':enhancement:2']),unit('body','skitarii-vanguard'),unit('duplicate','skitarii-vanguard')],[hunter]));
  await attach('owner','body');await open('body');
  await modelAbility('datasheet-skitarii-vanguard:profile:default','core-scouts',{distance:6},/Scouts\s*6"/i);await modelAbility('datasheet-skitarii-vanguard:profile:default','core-infiltrators',{},/Infiltrators/i);
  await open('duplicate');await modelAbility('datasheet-skitarii-vanguard:profile:default','core-scouts',{distance:6},/Scouts\s*6"/i,false);
  const acquisitus='detachment-cohort-acquisitus';
  await load(snapshot([unit('owner','serberys-raiders',[acquisitus+':enhancement:2']),unit('duplicate','serberys-raiders')],[acquisitus]));
  await open('owner');assert.match(await page.locator('main').innerText(),/Lone Operative\s*15"/i);checks++;
  await open('duplicate');assert.doesNotMatch(await page.locator('main').innerText(),/Lone Operative\s*15"/i);checks++;

  await load(snapshot([unit('owner','cybernetica-datasmith',[halo+':enhancement:1']),unit('duplicate','cybernetica-datasmith'),unit('robots','kastelan-robots')],[halo,'detachment-cohort-cybernetica']));
  await open('owner');assert.match(await page.locator('main').innerText(),/INFANTRY/);checks++;
  await attach('owner','robots');await open('robots');await field('datasheet-kastelan-robots:profile:default','/stats/M','8"');
  assert.match(await page.locator('main').innerText(),/HALO OVERRIDE/);checks++;
  await detach('owner');await open('robots');assert.doesNotMatch(await page.locator('main').innerText(),/HALO OVERRIDE/);checks++;
  await usable();

  // Battle clauses cannot change ordinary book values or create permanent AP.
  await load(snapshot([unit('ordinary','tech-priest-dominus')],['detachment-rad-zone-corps']));await open('ordinary');
  await field('datasheet-tech-priest-dominus:weapon:5','/skill','3+');await ability('datasheet-tech-priest-dominus:weapon:5','ASSAULT',false);
  await field('datasheet-tech-priest-dominus:weapon:6','/ap','-2');await usable();
  assert.deepEqual(errors,[],`${device} uncaught runtime errors`);
  results.push({device,status:'PASS',visibleControls:checks,realImport:'PASS',bodyguardFirstAttachment:'PASS',profileIsolation:'PASS',effectivePopupIdentity:'PASS',battleEffectLeakage:0});
  await context.close();
 }
 assert.deepEqual(forbiddenRequests,[],'V1 factual/runtime request');assert.deepEqual(unexpectedRequests,[],'Undeclared frontend dependency');
 for(const [name,value]of originalFiles)assert.deepEqual(fs.readFileSync(path.join(directory,name)),value,'Browser QA changed canonical/generated inputs');
 console.log(JSON.stringify({status:'PASS',results,legacyRuntimeReads:0,canonicalFactsImmutable:true}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
