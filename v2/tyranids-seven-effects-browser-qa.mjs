/** Focused player flows through unchanged main application HTTP bytes.
 * Constructed supported New Recruit text. All writes are ordinary visible UI
 * actions; evaluate is used only to inspect state, rendered facts and geometry. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {sevenEffectFixtures as fixtures} from '../books/tyranids/v2/seven-effects-fixtures.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';

const repo=fileURLToPath(new URL('../',import.meta.url));
const out=process.env.TYRANIDS_SEVEN_SCREENSHOTS||'E:/Warhammer/qa-artifacts/tyranids-seven-effects-4edfabbd-20261016/browser';
fs.mkdirSync(out,{recursive:true});
const requestedDevice=process.env.TYRANIDS_SEVEN_BROWSER_DEVICE;
assert.ok(!requestedDevice||['desktop','mobile'].includes(requestedDevice));
const devices=[['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]
  .filter(([id])=>!requestedDevice||id===requestedDevice);
const files=new Set(['/books/shared/datasheet-system.css','/books/shared/unit-art.css']);
function addFiles(relative){
  for(const entry of fs.readdirSync(path.join(repo,relative),{recursive:true,withFileTypes:true}))if(entry.isFile()){
    const address='/'+path.relative(repo,path.join(entry.parentPath,entry.name)).replaceAll('\\','/');
    if(/\.(?:mjs|js|css|json)$/.test(entry.name)&&!/(?:-qa\.|-fixtures\.|\/sources\/)/.test(address))files.add(address);
  }
}
for(const area of ['application-v2','army-book-app-v2','roster-v2','rule-contract-v2'])addFiles('books/shared/'+area);
addFiles('books/tyranids/v2');
const presentation=JSON.parse(fs.readFileSync(path.join(repo,'books/tyranids/v2/generated/app-presentation.json'),'utf8'));
const base=new URL('http://test/books/tyranids/v2/');
if(presentation.bookPresentation.coverImage)files.add(new URL(presentation.bookPresentation.coverImage,base).pathname);
for(const art of Object.values(presentation.datasheetPresentation.artwork||{}))files.add(new URL('../'+art.asset,base).pathname);
const allowed=address=>isApplicationTestDependency(address)||files.has(address);
for(const forbidden of ['/books/tyranids/scripts/roster-data.js','/books/tyranids/assets/unknown.webp',
  '/books/shared/roster-v2/unknown.mjs','/books/tau-empire/v2/registration.mjs'])assert.equal(allowed(forbidden),false);
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
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const snapshot=page=>page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());
async function ready(page){
  await page.waitForFunction(()=>!!window.WarhammerAppV2);
  await page.evaluate(async()=>{await window.WarhammerAppV2.ready;await window.ArmyBookAppV2?.rosterPanel?.ready;});
  await page.waitForFunction(()=>[...document.querySelectorAll('link[rel="stylesheet"]')].every(link=>!!link.sheet));
}
async function geometry(page){
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Horizontal page overflow');
  assert.deepEqual(await page.locator('.ds-selected-loadout > li').evaluateAll(nodes=>nodes.map(node=>node.textContent.trim()).filter(text=>/^\d+\s*×\s*$/.test(text))),[],'Blank inventory');
}
async function roster(page){
  await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();await ready(page);
  await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();
}
async function imported(page,fixture,text=fixture.text){
  await roster(page);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
  await page.locator('[data-roster-action="review-import"]').click();
  await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
  assert.match(await page.locator('.v2-roster-status').innerText(),/^Roster imported\./);
  const state=await snapshot(page);
  assert.deepEqual(state.units.map(unit=>unit.instanceId),fixture.unitIds);
  assert.deepEqual(state.units.map(unit=>unit.canonicalUnitId),fixture.canonicalUnitIds);
  assert.equal(await page.locator('[data-roster-bindings] select').count(),0,'No guessed source binding');
  await geometry(page);
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
async function observe(page){return page.evaluate(()=>window.ArmyBookAppV2.roster.projection.units.map(unit=>({
  id:unit.instanceId,canonicalId:unit.canonicalUnitId,keywords:unit.keywords,abilities:unit.abilities,applied:unit.applied,
  models:unit.profiles.map(model=>({id:model.canonicalProfileId,scope:model.scopeId,keywords:model.keywords,
    stats:Object.fromEntries(['M','T','SV','W','LD','OC','INSV'].flatMap(key=>{const value=model.profile.stats?.[key]??model.profile[key];return value===undefined?[]:[[key,value]];})),
    abilities:model.abilities,weapons:model.weapons.map(weapon=>({id:weapon.canonicalProfileId,data:weapon.data}))}))
})));}
const unit=(observed,id)=>observed.find(row=>row.id===id);
const ability=(row,id)=>(row.abilities||[]).filter(item=>item.canonicalId===id);
const fnp=row=>row.abilities.filter(item=>/^Feel No Pain(?:\s|$)/i.test(item.name));
const withoutEnhancements=text=>text.replace(/^Enhancement:.*\r?\n/gm,'');
const invasion=text=>text.replace(/^\+ DETACHMENT:.*$/m,'+ DETACHMENT: Invasion Fleet');
function stableStats(actual,baseline){
  for(const row of actual)for(const model of row.models){const before=unit(baseline,row.id).models.find(item=>item.scope===model.scope);
    assert.deepEqual(model.stats,before.stats,'Unrelated model characteristics must not change');}
}
function guardianOracle(actual,fixture,leader){
  for(const row of actual)for(const model of row.models){
    assert.deepEqual(fnp(model).map(item=>item.value),row.id===leader?[5]:[],'Guardian Organism exact leading CHARACTER MODEL only');
    if(row.id===leader)assert.equal(fnp(model)[0].name,'Feel No Pain');
  }
  assert.ok(fixture.leaders.includes(leader)||leader===null);
}
function weaponOracle(actual,baseline,fixture,selected){
  let changed=0,unchanged=0,nonPsychicBearer=0;
  for(const row of actual)for(const model of row.models){const before=unit(baseline,row.id).models.find(item=>item.scope===model.scope);
    assert.deepEqual(model.stats,before.stats);
    for(const weapon of model.weapons){const prior=before.weapons.find(item=>item.id===weapon.id);assert.ok(prior,'Physical weapon identity unchanged');
      const owner=fixture.owners?.includes(row.id)||fixture.owner===row.id;
      const psychic=prior.data.abilities.some(name=>name.toUpperCase()==='PSYCHIC');
      const eligible=owner&&(fixture.id==='elevated'?prior.data.mode==='melee':psychic);
      const expected={...prior.data};
      if(selected&&eligible){expected.ap=String(Number(prior.data.ap)-1);if(fixture.id==='power')expected.strength=String(Number(prior.data.strength)+1);changed++;}
      else unchanged++;
      if(fixture.id==='power'&&owner&&!psychic)nonPsychicBearer++;
      assert.deepEqual(weapon.data,expected,`${fixture.id}: exact source weapon delta ${row.id}/${model.id}/${weapon.id}`);
    }
  }
  assert.ok(unchanged>0,'Independent negative weapon controls');if(selected)assert.ok(changed>0);
  if(fixture.id==='power')assert.ok(nonPsychicBearer>0,'Non-psychic weapon on the same bearer remains unchanged');
}
function unitAbilityOracle(actual,baseline,id,recipients){
  for(const row of actual){assert.equal(ability(row,id).length,recipients.includes(row.id)?1:0,`Exact UNIT recipient ${row.id}/${id}`);
    for(const model of row.models)assert.deepEqual(model.abilities,unit(baseline,row.id).models.find(item=>item.scope===model.scope).abilities,'UNIT grant must not become a MODEL grant');}
  stableStats(actual,baseline);
}
function leaderBeastsOracle(actual,baseline,fixture,active){
  for(const row of actual){const prior=unit(baseline,row.id),hasKeywords=active&&fixture.keywordRecipients.includes(row.id);
    for(const keyword of ['TYRANID WARRIORS','BATTLELINE'])assert.equal(row.keywords.includes(keyword),hasKeywords||prior.keywords.includes(keyword),'Physical UNIT keyword recipient');
    for(const model of row.models){const before=prior.models.find(item=>item.scope===model.scope),expected={...before.stats};
      if(active&&fixture.invulnerableRecipients.includes(row.id))expected.INSV='5+';
      assert.deepEqual(model.stats,expected,'INSV 5+ only on named MODEL owners; ordinary SV unchanged');
      assert.deepEqual(model.keywords,before.keywords,'UNIT keywords are not copied onto physical models');
    }
  }
}
/** Reconcile rendered production values with the independently checked projection.
 * Grouped rows may represent several equal physical models; all scopes remain
 * explicitly bound and each rendered scalar is checked against every scope. */
async function presented(page,actual,{abilityId,recipients=[],subject,keywordRecipients}={}){
  const cards=await page.locator('main .unit-card').evaluateAll(nodes=>nodes.map(card=>({
    id:card.dataset.rosterInstanceId,canonicalId:card.dataset.cardId,
    abilities:[...card.querySelectorAll('[data-ability-presentation-identity]')].map(node=>({
      id:node.dataset.canonicalAbilityId,identity:node.dataset.abilityPresentationIdentity,
      params:JSON.parse(node.dataset.abilityParameters),subject:node.dataset.recipientSubject,
      scopes:JSON.parse(node.dataset.recipientScopes).map(scope=>JSON.parse(scope)),text:node.innerText})),
    profiles:[...card.querySelectorAll('.model-profile')].map(node=>({id:node.dataset.cardId,scope:node.dataset.compositionId,
      stats:Object.fromEntries([...node.querySelectorAll('.stat')].map(stat=>[stat.querySelector('b').textContent,stat.querySelector('[data-fact-id]').textContent]))})),
    groupedProfiles:[...card.querySelectorAll('[data-profile-scopes]')].map(node=>({scopes:JSON.parse(node.dataset.profileScopes),
      stats:Object.fromEntries([...node.querySelectorAll(':scope > .statline .stat')].map(stat=>[stat.querySelector('b').textContent,stat.querySelector('[data-fact-id]').textContent]))})),
    weapons:[...card.querySelectorAll('.weapon-row[data-card-id]')].map(node=>({id:node.dataset.cardId,scope:node.dataset.compositionId,
      scopes:node.dataset.weaponScopes?JSON.parse(node.dataset.weaponScopes):null,
      values:Object.fromEntries([...node.querySelectorAll('[data-label]')].map(cell=>[cell.dataset.label,cell.querySelector('.ds-effective-value').textContent]))})),
    keywordText:card.querySelector('[data-datasheet-section="keywords"]')?.innerText||'',
    keywordValues:[...card.querySelectorAll('[data-datasheet-section="keywords"] [data-fact-id]')].map(node=>node.innerText)
  })));
  assert.ok(cards.length);for(const card of cards){const observed=unit(actual,card.id);assert.ok(observed);
    assert.equal(card.canonicalId,observed.canonicalId,'Rendered physical UNIT retains canonical source identity');
    for(const model of observed.models){
      assert.ok(card.profiles.some(row=>row.id===model.id&&row.scope===model.scope)||
        card.groupedProfiles.some(group=>group.scopes.some(([id,scope])=>id===model.id&&scope===model.scope)),
      'Every physical MODEL has a rendered profile');
      for(const weapon of model.weapons)assert.ok(card.weapons.some(row=>(row.scopes||[[row.id,row.scope]])
        .some(([id,scope])=>id===weapon.id&&scope===model.scope)),'Every selected physical weapon is rendered');
    }
    for(const profile of card.profiles){const model=observed.models.find(item=>item.id===profile.id&&item.scope===profile.scope);assert.ok(model,'Rendered MODEL canonical/physical identity');
      for(const [key,value]of Object.entries(profile.stats))assert.equal(value,String(model.stats[key==='INV'?'INSV':key]));}
    for(const group of card.groupedProfiles)for(const [id,scope]of group.scopes){const model=observed.models.find(item=>item.id===id&&item.scope===scope);assert.ok(model);
      for(const [key,value]of Object.entries(group.stats))assert.equal(value,String(model.stats[key==='INV'?'INSV':key]));}
    for(const rendered of card.weapons){const scopes=rendered.scopes||[[rendered.id,rendered.scope]];
      for(const [id,scope]of scopes){const model=observed.models.find(item=>item.scope===scope),weapon=model?.weapons.find(item=>item.id===id);assert.ok(weapon,'Rendered weapon has exact physical owner');
        for(const [label,key]of Object.entries({Range:'range',A:'attacks',BS:'skill',WS:'skill',S:'strength',AP:'ap',D:'damage'}))
          if(Object.hasOwn(rendered.values,label))assert.equal(rendered.values[label],String(weapon.data[key]),'Production weapon presenter '+id+'/'+key);}}
    const identities=card.abilities.map(row=>row.identity);assert.equal(new Set(identities).size,identities.length,'Duplicate ability presentation identity');
    if(keywordRecipients?.includes(card.id))for(const keyword of ['TYRANID WARRIORS','BATTLELINE'])
      assert.ok(card.keywordValues.includes(keyword),'Granted exact canonical UNIT keyword visible '+card.id+'/'+keyword);
    if(abilityId){const rows=card.abilities.filter(row=>row.id===abilityId);assert.equal(rows.length,recipients.includes(card.id)?1:0,'No missing/duplicate/foreign visible ability '+card.id);
      for(const row of rows){assert.equal(row.subject,subject);assert.ok(row.scopes.every(scope=>scope[0]===card.id),'Physical presentation recipient');
        if(abilityId==='core-feel-no-pain'){assert.deepEqual(row.params,{value:5});assert.match(row.text,/Feel No Pain\s*5\+/i);}}}
  }
  await geometry(page);return cards;
}
async function views(page,fixture,oracle,options={},phase,ids=fixture.unitIds){
  const observed=await observe(page);oracle(observed);
  for(const id of ids){await effective(page,id);const effectiveCards=await presented(page,observed,options);
    await guide(page,id);const guideCards=await presented(page,observed,options);assert.deepEqual(guideCards,effectiveCards,'Effective and Guide preserve exact owner values');
    results.push({viewport:page.viewportSize(),case:fixture.id,phase,instance:id,cards:guideCards,status:'PASS'});}
}
async function navigation(page,fixture,oracle,options,phase){
  const before=await snapshot(page),url=page.url();await page.reload();await ready(page);oracle(await observe(page));await presented(page,await observe(page),options);
  assert.deepEqual(await snapshot(page),before,'Reload preserves selections/attachments');
  await roster(page);await page.goBack();await ready(page);await presented(page,await observe(page),options);
  await page.goForward();await ready(page);await page.goto(url);await ready(page);oracle(await observe(page));await presented(page,await observe(page),options);
  assert.deepEqual(await snapshot(page),before,'History/direct URL preserves physical state');
  results.push({viewport:page.viewportSize(),case:fixture.id,phase:phase+' reload/Back/Forward/direct URL',status:'PASS'});
}
async function sourceReference(page,fixture,id,patterns){
  const links=page.locator(`main a[data-target-id="${id}"]`);assert.ok(await links.count(),'Source rule reachable from Guide');
  await links.first().click();await page.locator('dialog[open]').waitFor();const text=await page.locator('dialog[open]').innerText();
  for(const pattern of patterns)assert.match(text,pattern);
  await page.keyboard.press('Escape');await page.locator('dialog[open]').waitFor({state:'hidden'});
  results.push({viewport:page.viewportSize(),case:fixture.id,phase:'Source reference retains complete conditional text',id,status:'PASS'});
}
async function guardian(page,device){
  const f=fixtures.guardian;await imported(page,f);const baseline=await observe(page);
  const verify=leader=>actual=>{guardianOracle(actual,f,leader);stableStats(actual,baseline);};
  const options=leader=>({abilityId:'core-feel-no-pain',subject:'MODEL',recipients:leader?[leader]:[]});
  await views(page,f,verify(null),options(null),'standalone negative');
  for(const leader of f.leaders){
    await attach(page,leader,f.bodyguard);await views(page,f,verify(leader),options(leader),'attached exact CHARACTER');
    await navigation(page,f,verify(leader),options(leader),'attached');
    await effective(page,f.bodyguard);await guide(page,f.bodyguard);
    await sourceReference(page,f,'datasheet-tyrant-guard:section:1',[/Guardian Organism/,/CHARACTER/,/Feel No Pain 5\+/]);
    await page.screenshot({path:path.join(out,`${device}-guardian-${leader}.png`),fullPage:true});
    await detach(page,leader);await views(page,f,verify(null),options(null),'detached negative', [leader,f.bodyguard,f.duplicate]);
    await attach(page,leader,f.otherBodyguard);await views(page,f,verify(leader),options(leader),'reattach independent Guard',[leader,f.bodyguard,f.otherBodyguard]);
    await detach(page,leader);
  }
  await imported(page,f);await views(page,f,verify(null),options(null),'repeat import removes attachment');
}
async function enhancementWeapons(page,device,f){
  const pairs=f.id==='elevated'?f.owners.map((id,i)=>[id,f.bodyguards[i]]):[[f.owner,f.bodyguard]];
  const bind=async()=>{for(const [leader,bodyguard]of pairs)await attach(page,leader,bodyguard);};
  await imported(page,f,withoutEnhancements(f.text));const standaloneBase=await observe(page);
  await bind();const attachedBase=await observe(page);
  await imported(page,f);let baseline=standaloneBase;
  let oracle=actual=>weaponOracle(actual,baseline,f,true);
  await views(page,f,oracle,{},'selected standalone');
  await bind();baseline=attachedBase;await views(page,f,oracle,{},'selected attached exact MODEL');
  await navigation(page,f,oracle,{},'selected attached');
  await effective(page,pairs[0][0]);await guide(page,pairs[0][0]);
  await sourceReference(page,f,f.enhancementId,f.id==='elevated'?[/Can re-roll wound rolls\./,/Have \+1 AP\./]:[/psychic weapons/,/Strength/,/Armour Penetration/]);
  await page.screenshot({path:path.join(out,`${device}-${f.id}.png`),fullPage:true});
  for(const [leader]of pairs)await detach(page,leader);baseline=standaloneBase;
  await views(page,f,oracle,{},'detach preserves MODEL-only selection',f.owners||[f.owner,f.bodyguard]);
  await imported(page,f,withoutEnhancements(f.text));oracle=actual=>weaponOracle(actual,standaloneBase,f,false);
  await views(page,f,oracle,{},'selection removed');
  await imported(page,f);oracle=actual=>weaponOracle(actual,standaloneBase,f,true);
  await views(page,f,oracle,{},'reselect no accumulation');await navigation(page,f,oracle,{},'reselect');
}
async function chameleonic(page,device){
  const f=fixtures.chameleonic;await imported(page,f,withoutEnhancements(f.text));const baseline=await observe(page);
  const verify=recipients=>actual=>unitAbilityOracle(actual,baseline,'core-stealth',recipients);
  const options=recipients=>({abilityId:'core-stealth',subject:'UNIT',recipients});
  await views(page,f,verify([]),options([]),'unselected');await imported(page,f);
  await views(page,f,verify([f.owner]),options([f.owner]),'selected standalone');
  await attach(page,f.owner,f.bodyguard);let recipients=[f.owner,f.bodyguard];
  await views(page,f,verify(recipients),options(recipients),'attached formed UNIT');await navigation(page,f,verify(recipients),options(recipients),'attached');
  await page.screenshot({path:path.join(out,`${device}-chameleonic.png`),fullPage:true});
  await detach(page,f.owner);await views(page,f,verify([f.owner]),options([f.owner]),'detached');
  await attach(page,f.owner,f.otherBodyguard);recipients=[f.owner,f.otherBodyguard];
  await views(page,f,verify(recipients),options(recipients),'reattached independent Bodyguard');
  await imported(page,f,withoutEnhancements(f.text));await views(page,f,verify([]),options([]),'removed');
  await imported(page,f);await views(page,f,verify([f.owner]),options([f.owner]),'reselected');
}
async function mindhunger(page,device){
  const f=fixtures.mindhunger;await imported(page,f,invasion(f.text));const baseline=await observe(page);
  const verify=active=>actual=>unitAbilityOracle(actual,baseline,'core-deep-strike',active?f.recipients:[]);
  const options=active=>({abilityId:'core-deep-strike',subject:'UNIT',recipients:active?f.recipients:[]});
  await views(page,f,verify(false),options(false),'wrong Detachment negative');
  await imported(page,f);await views(page,f,verify(true),options(true),'all named UNIT recipients');
  await navigation(page,f,verify(true),options(true),'Mindhunger');
  await page.screenshot({path:path.join(out,`${device}-mindhunger.png`),fullPage:true});
  await imported(page,f,invasion(f.text));await views(page,f,verify(false),options(false),'Detachment removed');
  await imported(page,f);await views(page,f,verify(true),options(true),'reimport no duplication');
}
async function leaderBeasts(page,device){
  const f=fixtures.leaderBeasts;await imported(page,f,invasion(f.text));const baseline=await observe(page);
  const verify=active=>actual=>leaderBeastsOracle(actual,baseline,f,active);
  await views(page,f,verify(false),{},'wrong Detachment baseline');await imported(page,f);
  const options={keywordRecipients:f.keywordRecipients};
  await views(page,f,verify(true),options,'physical UNIT keywords + MODEL INSV');
  for(let i=0;i<f.leaders.length;i++)await attach(page,f.leaders[i],f.bodyguards[i]);
  await views(page,f,verify(true),options,'formed UNIT without MODEL keyword leak');
  await navigation(page,f,verify(true),options,'Leader-beasts');
  await page.screenshot({path:path.join(out,`${device}-leader-beasts.png`),fullPage:true});
  for(const leader of f.leaders)await detach(page,leader);
  await attach(page,f.leaders[0],f.unrelated[1]);
  await views(page,f,verify(true),options,'Winged Prime + Gargoyles: no alien INSV',[f.leaders[0],f.unrelated[1],f.bodyguards[0]]);
  await imported(page,f,invasion(f.text));await views(page,f,verify(false),{},'removed INSV restores original SV/INSV');
  await imported(page,f);await views(page,f,verify(true),options,'reimport no accumulation');
}
let failure=null;
try{
  for(const [device,viewport]of devices){
    const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage();let reject;
    const immediateFailure=new Promise((_,fail)=>{reject=fail;});immediateFailure.catch(()=>{});
    page.on('pageerror',error=>{errors.push({device,error:error.message});reject(error);});
    page.on('console',message=>{if(message.type()==='error')errors.push({device,error:message.text()});});
    page.on('response',response=>{if(response.status()>=400)httpErrors.push({device,url:response.url(),status:response.status()});});
    page.on('requestfailed',request=>{const row={device,url:request.url(),error:request.failure()?.errorText};
      (row.error==='net::ERR_ABORTED'?navigationAborts:requestFailures).push(row);});
    const run=async()=>{
      await page.goto(origin+'/v2/app.html');await ready(page);
      assert.deepEqual((await page.locator('[data-v2-book]').evaluateAll(nodes=>nodes.map(node=>node.dataset.v2Book))).sort(),
        ['adeptus-mechanicus','chaos-space-marines','death-guard','emperors-children','tyranids']);
      await page.locator('[data-v2-book="tyranids"]').click();await ready(page);
      for(const [name,scenario]of [['guardian',()=>guardian(page,device)],['elevated',()=>enhancementWeapons(page,device,fixtures.elevated)],
        ['power',()=>enhancementWeapons(page,device,fixtures.power)],['chameleonic',()=>chameleonic(page,device)],
        ['mindhunger',()=>mindhunger(page,device)],['leaderBeasts',()=>leaderBeasts(page,device)]]){
        console.log(device+' / '+name);await scenario();
      }
    };
    try{await Promise.race([run(),immediateFailure]);}
    catch(error){await page.screenshot({path:path.join(out,`FAIL-${device}.png`),fullPage:true}).catch(()=>{});
      fs.writeFileSync(path.join(out,'failure-page.txt'),await page.locator('body').innerText().catch(()=>''));throw error;
    }finally{await context.close();}
  }
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);assert.deepEqual(forbidden,[]);assert.deepEqual(httpErrors,[]);assert.deepEqual(requestFailures,[]);
}catch(error){failure={message:error.message,stack:error.stack};throw error;
}finally{
  const report={status:failure?'FAIL':'PASS',mainApplication:'/v2/app.html',realNewRecruitExportTested:false,devices:devices.length,
    checks:results.length,results,errors,missing,forbidden,httpErrors,requestFailures,navigationAborts,requests:[...new Set(requests)],failure};
  fs.writeFileSync(path.join(out,'tyranids-seven-effects-browser-report.json'),JSON.stringify(report,null,2)+'\n');
  await browser.close();await new Promise(resolve=>server.close(resolve));
  console.log(JSON.stringify({status:report.status,devices:devices.length,checks:results.length,jsErrors:errors.length,missing:missing.length,
    forbidden:forbidden.length,httpErrors:httpErrors.length,requestFailures:requestFailures.length,realNewRecruitExportTested:false,
    report:path.join(out,'tyranids-seven-effects-browser-report.json')}));
}
