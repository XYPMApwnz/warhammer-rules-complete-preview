/** Stages 5/6: real application bytes and ordinary visible UI actions.
 * evaluate calls inspect state, source payload and rendered DOM only. No state,
 * storage, DOM, CSS or computed-value injection is permitted by this QA. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const out=process.env.TAU_V2_BROWSER_EVIDENCE||'E:/Warhammer/qa-artifacts/recovery-tau-v2-stage5-20261019';
const previous=process.env.TAU_V2_STAGE4G_EVIDENCE||'E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4g-final-20261019';
const requestedGroups=process.env.TAU_V2_BROWSER_GROUPS?.split(',');
const mainApplication=process.env.TAU_V2_BROWSER_MAIN==='1';
const applicationPath=mainApplication?'/v2/app.html':'/books/tau-empire/v2/app.html';
fs.mkdirSync(out,{recursive:true});
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const facts=read('./generated/effective.json'),records=new Map(facts.entities.map(entity=>[entity.id,entity]));
const sourceOracle=read('./rule-contract-expectations.json').deferredSelectionExpectations.find(row=>row.id==='prototype-weapon-choice');
const fixed=id=>fs.readFileSync(path.join(previous,id+'.txt'),'utf8');
const normalize=text=>String(text).replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
const header='+ FACTION KEYWORD: T’au Empire\n+ DETACHMENT: Mont\'ka\n';
const broadside=counts=>counts.length+'x Broadside Battlesuits (100 pts)\n'+counts.map((count,index)=>
  '• 1x Broadside '+(index?'Shas’ui':'Shas’vre')+(count?': '+count+'x Shield Drone':'')+'\n').join('');
const shieldInput=header+broadside([2,1,0])+broadside([0,0,0]).replace('(100 pts)','(100 pts): 2x Shield Drone');
const result={schema:'tau-v2-isolated-browser-qa/v1',mainApplication,applicationPath,startedAt:new Date().toISOString(),
  qaSHA256:createHash('sha256').update(fs.readFileSync(fileURLToPath(import.meta.url))).digest('hex').toUpperCase(),REAL_NEW_RECRUIT_EXPORT_TESTED:'NO',
  assertions:'CONSTRUCTED_INPUT_AND_EXISTING_INDEPENDENT_SOURCE_EXPECTATIONS',results:[],errors:[],missing:[],visited:[],screenshots:[]};
const server=http.createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
  if(pathname==='/favicon.ico'){response.writeHead(204);response.end();return;}
  const file=path.resolve(repo,'.'+pathname);
  if(!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    result.missing.push({url:pathname,status:404});response.writeHead(404);response.end();return;
  }
  const mime={'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.json':'application/json',
    '.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
  response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  response.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
let playwright,playwrightRequire=createRequire(import.meta.url);
try{playwright=playwrightRequire('playwright');}catch{
  const runtime=process.env.PLAYWRIGHT_NODE_MODULES||path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
  playwrightRequire=createRequire(path.join(runtime,'package.json'));playwright=playwrightRequire('playwright');
}
let browser;
async function ready(page){
  await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2));
  await page.evaluate(async()=>{await window.WarhammerAppV2?.ready;await window.ArmyBookAppV2.rosterPanel?.ready;});
  await page.waitForFunction(()=>[...document.querySelectorAll('link[rel="stylesheet"]')].every(link=>Boolean(link.sheet)));
}
async function geometry(page){
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Horizontal page overflow');
  assert.deepEqual(await page.locator('.ds-selected-loadout > li').evaluateAll(nodes=>nodes.map(node=>node.textContent.trim()).filter(text=>/^\d+\s*×\s*$/.test(text))),[],'Empty equipment caption');
}
async function screenshot(page,id){const file=path.join(out,id+'.png');await page.screenshot({path:file,fullPage:true});result.screenshots.push(file);}
async function roster(page){
  const primary=page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]');
  if(await primary.count())await primary.click();
  else{
    const shortcuts=page.locator('.toc-shortcuts button');
    const control=shortcuts.filter({hasText:/^(Roster|Attachment Setup)$/}).first();
    if(!await control.isVisible())await page.getByRole('button',{name:'Open navigation',exact:true}).click();
    await control.click();
  }
  await ready(page);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();
}
const snapshot=page=>page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());
async function imported(page,text,count){
  await roster(page);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
  await page.locator('[data-roster-action="review-import"]').click();
  await page.waitForFunction(()=>!document.querySelector('[data-roster-view][aria-busy="true"]'));
  assert.equal(await page.locator('.v2-roster-status.v2-roster-error').count(),0,'Import action error');
  assert.match(await page.locator('.v2-roster-status').innerText(),/Roster imported/,'Actual import completed');
  await page.waitForFunction(({count,text})=>{const service=window.ArmyBookAppV2.roster,state=service.state;
    return state?.units?.length===count&&[...document.querySelectorAll('[role="status"]')].some(node=>/imported|ready|saved/i.test(node.textContent));
  },{count,text});
  const state=await snapshot(page);assert.equal(state.units.length,count);assert.equal(new Set(state.units.map(unit=>unit.instanceId)).size,count);
  await geometry(page);return state;
}
async function effective(page,id){await roster(page);await page.locator(`[data-roster-instances] > [data-roster-instance-id="${id}"] [data-roster-action="show-instance"]`).click();await page.locator('main .unit-card').first().waitFor();await geometry(page);}
async function guide(page,id){
  await roster(page);await page.locator('[data-roster-action="open-personal-guide"]').click();
  await page.locator(`main [data-roster-nav-instance-id="${id}"]`).first().click();
  await page.locator('main .unit-card').first().waitFor();await geometry(page);
}
async function sourceChoice(page,owner,ruleId,value){
  await roster(page);const field=page.locator(`[data-roster-instance-id="${owner}"] [data-source-choice-id="${ruleId}"]`).first();
  await field.locator('select').selectOption(value??'');await field.locator('[data-roster-action="set-source-choice"]').click();
  await page.getByRole('status').filter({hasText:'Source selection saved.'}).waitFor();
}
async function attach(page,leader,guard){
  await roster(page);await page.locator(`[data-attachment-candidate-for="${guard}"]`).selectOption(leader);
  await page.locator(`[data-attachment-target-instance-id="${guard}"] [data-roster-action="attach"]`).click();
  await page.locator(`[data-attached-leader-instance-id="${leader}"]`).waitFor();
}
async function backupControls(page){
  const pane=page.locator('details').filter({has:page.getByText('Backup and restore',{exact:true})});
  if(!await pane.evaluate(node=>node.open))await pane.locator('summary').click();
}
async function detach(page,leader){await roster(page);await page.locator(`[data-roster-action="detach"][data-leader-instance-id="${leader}"]`).click();await page.waitForFunction(id=>!window.ArmyBookAppV2.roster.state.attachments.some(row=>row.leaderInstanceId===id),leader);}
async function normal(page,id){
  const home=page.locator('[data-v2-primary-nav] [data-v2-destination="HOME"]');
  if(await home.count()){await home.click();await page.locator('[data-v2-book="tau-empire"]').click();}
  else await page.locator('.v2-brand').click();
  await ready(page);
  await page.locator(`main a.v2-library-card[data-target-id="${id}"]`).first().click();
  await page.locator(`main [data-card-id="${id}"]`).first().waitFor();await geometry(page);
}
async function shownWeapons(page,weaponId){return page.locator('main .weapon-row:not(.weapon-head)').evaluateAll((nodes,id)=>nodes.filter(node=>
  node.dataset.cardId===id||node.querySelector('.weapon-name [data-target-id]')?.dataset.targetId===id).map(node=>({
    quantity:Number(node.querySelector('.ds-weapon-quantity')?.textContent.replace(/\D/g,'')),text:node.innerText,
    cells:Object.fromEntries([...node.querySelectorAll('[data-label]')].map(cell=>[cell.dataset.label,{value:cell.querySelector('.ds-effective-value')?.textContent,
      trace:cell.querySelector('.ds-modifier-breakdown')?.textContent||null}]))})),weaponId);}
async function assertPrototype(page,index,selected){
  const weaponId=sourceOracle.eligibleWeaponIds[index].find(id=>records.get(id)?.parentId==='unit-commander-in-coldstar-battlesuit');
  const base=records.get(weaponId).data,rows=await shownWeapons(page,weaponId),deltas=sourceOracle.expectedDeltas[index];
  assert.equal(rows.length,selected?2:1,'Selected and remainder visible profile rows');
  assert.equal(rows.reduce((sum,row)=>sum+row.quantity,0),2,'Original quantity conserved in visible UI');
  const fields={strength:'S',attacks:'A',ap:'AP',damage:'D'};
  for(const [position,row]of rows.sort((a,b)=>Number(b.cells.S.value)-Number(a.cells.S.value)).entries()){
    const modified=selected&&position===0;
    for(const [field,label]of Object.entries(fields)){
      const delta=modified?(deltas[field]||0):0;
      assert.equal(row.cells[label].value,delta?String(Number(base[field])+delta):String(base[field]),label+' source value');
      if(!modified)assert.equal(row.cells[label].trace,null,'No Prototype trace on remainder');
      else if(deltas[field])assert.ok(row.cells[label].trace,'Selected Prototype trace');
    }
    assert.equal(row.cells.Range.value,(Number(base.range.replace('"',''))+6)+'"','Superior Craftsmanship source +6 Range');
    assert.equal(normalize(row.cells.Range.trace),normalize(base.range+' + 6"'),'One ordinary Range trace per occurrence');
  }
  return rows;
}
try{
  browser=await playwright.chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  result.browserVersion=browser.version();result.playwrightVersion=playwrightRequire('playwright/package.json').version;
  for(const [device,viewport]of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
    const context=await browser.newContext({viewport,reducedMotion:'reduce',acceptDownloads:true}),page=await context.newPage();
    page.setDefaultTimeout(12000);page.on('pageerror',error=>result.errors.push({device,error:error.message}));
    page.on('console',message=>{if(message.type()==='error')result.errors.push({device,error:message.text()});});
    page.on('requestfailed',request=>result.missing.push({device,url:request.url(),failure:request.failure()}));
    page.on('response',response=>{if(response.status()>=400)result.missing.push({device,url:response.url(),status:response.status()});});
    page.on('framenavigated',frame=>{if(frame===page.mainFrame())result.visited.push({device,url:frame.url()});});
    async function group(id,fn){if(requestedGroups&&!requestedGroups.includes(id))return;console.log(device+' '+id);try{await fn();result.results.push({device,id,status:'PASS'});}
      catch(error){const evidence=path.join(out,`${device}-${id}-failure.json`);fs.writeFileSync(evidence,JSON.stringify({error:error.stack,url:page.url(),text:await page.locator('body').innerText()},null,2));
        await screenshot(page,`${device}-${id}-failure`);result.results.push({device,id,status:'FAIL',error:error.message,evidence});}}
    await page.goto(origin+applicationPath);await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2)||Boolean(document.querySelector('[data-v2-book="tau-empire"]')));
    if(!await page.evaluate(()=>Boolean(window.ArmyBookAppV2)))await page.locator('[data-v2-book="tau-empire"]').click();await ready(page);
    if(mainApplication)await group('main-home-six-books',async()=>{
      const expected=['death-guard','adeptus-mechanicus','chaos-space-marines','emperors-children','tyranids','tau-empire'];
      await page.locator('[data-v2-primary-nav] [data-v2-destination="HOME"]').click();
      const books=await page.locator('[data-v2-book]').evaluateAll(nodes=>nodes.map(node=>node.dataset.v2Book));
      assert.deepEqual(books.sort(),expected.slice().sort(),'Exactly six unique main Home registrations');await geometry(page);await screenshot(page,device+'-main-home-six-books');
      for(const book of expected){
        await page.locator(`[data-v2-book="${book}"]`).click();await ready(page);
        assert.equal(await page.evaluate(()=>window.WarhammerAppV2.activeBookId),book);assert.ok(await page.locator('[data-army-book-v2]').count());
        assert.equal(new URL(page.url()).pathname,'/v2/app.html','Main shell entry retained');
        await page.locator('[data-v2-primary-nav] [data-v2-destination="HOME"]').click();
      }
      await page.locator('[data-v2-book="tau-empire"]').click();await ready(page);
    });
    if(mainApplication)await group('main-cross-book-roster-persistence',async()=>{
      const state=await imported(page,fixed('prototype-0'),1),owner=state.units[0].instanceId,ruleId=sourceOracle.canonicalIds[0];
      const select=page.locator(`[data-roster-instance-id="${owner}"] select[data-source-choice-id="${ruleId}"]`);
      const option=await select.locator('option').evaluateAll(nodes=>nodes.map(node=>node.value).find(Boolean));assert.ok(option);
      await sourceChoice(page,owner,ruleId,option);const saved=await snapshot(page);
      for(const book of ['emperors-children','death-guard','tau-empire']){
        await page.locator('[data-v2-primary-nav] [data-v2-destination="HOME"]').click();await page.locator(`[data-v2-book="${book}"]`).click();await ready(page);
        assert.equal(await page.evaluate(()=>window.WarhammerAppV2.activeBookId),book);
      }
      assert.deepEqual(await snapshot(page),saved,'Cross-book navigation retains exact T’au roster and physical source choice');
      await effective(page,owner);await assertPrototype(page,0,true);await page.reload();await ready(page);
      assert.deepEqual(await snapshot(page),saved,'Main-shell reload retains roster after cross-book navigation');await assertPrototype(page,0,true);
      await guide(page,owner);await assertPrototype(page,0,true);await screenshot(page,device+'-main-cross-book-persisted-guide');
    });
    if(mainApplication)await group('main-mega-glossary-tau',async()=>{
      const corpus=JSON.parse(fs.readFileSync(path.join(repo,'glossary/v2/generated/index.en.json'),'utf8'));
      const tau=corpus.entries.filter(entry=>entry.domain==='ARMY'&&entry.sourceOwner.bookId==='tau-empire');
      assert.ok(tau.length,'T’au factual owner registered in actual main glossary corpus');
      const ids=['army-rule-for-the-greater-good','army-rule-for-the-greater-good:definition','detachment-kroot-hunting-pack:rule:skirmish-fighters',sourceOracle.canonicalIds[0]];
      for(const id of ids){
        const entries=tau.filter(entry=>entry.sourceOwner.canonicalId===id);assert.equal(entries.length,1,'One canonical factual owner '+id);
        const entry=entries[0];assert.ok(entry.provenance.length||Object.keys(entry.provenance).length,'Source provenance '+id);
        await page.locator('[data-v2-primary-nav] [data-v2-destination="GLOSSARY"]').click();
        await page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill(entry.label);
        const link=page.locator(`.v2-glossary-result[data-target-id="${entry.id}"]`);await link.waitFor();
        const direct=await link.getAttribute('href');assert.equal(new URL(direct,page.url()).pathname,'/v2/app.html');
        await link.click();const article=page.locator(`dialog[open] article[data-card-id="${entry.id}"]`);await article.waitFor();
        const expected=records.get(id);for(const clause of [expected.data.text,...(expected.data.blocks||[]).map(block=>block.text)].filter(Boolean))
          assert.ok(normalize(await article.innerText()).includes(normalize(clause)),'Complete canonical text '+id);
        await article.getByRole('link',{name:'Open full entry',exact:true}).click();
        await page.locator(`main article[data-card-id="${entry.id}"]`).waitFor();await geometry(page);await screenshot(page,device+'-main-glossary-'+id.replace(/[^a-z0-9]+/g,'-'));
        await page.reload();await page.waitForFunction(()=>Boolean(window.WarhammerAppV2));await page.evaluate(async()=>{await window.WarhammerAppV2.ready;});
        await page.locator(`main article[data-card-id="${entry.id}"]`).waitFor();
        const reference=page.locator(`main article[data-card-id="${entry.id}"] .reference-links [data-target-id]`).first();
        if(await reference.count()){
          const target=await reference.getAttribute('data-target-id');await reference.click();
          await page.locator(`dialog[open] article[data-card-id="${target}"]`).waitFor();await page.keyboard.press('Escape');
          await page.locator('dialog[open]').waitFor({state:'hidden'});
        }
      }
      await page.locator('[data-v2-primary-nav] [data-v2-destination="HOME"]').click();await page.locator('[data-v2-book="tau-empire"]').click();await ready(page);
    });
    await group('source-content',async()=>{
      const counts=await page.evaluate(()=>Object.fromEntries(['DATASHEET','PROFILE','DETACHMENT','DETACHMENT_RULE','ENHANCEMENT','STRATAGEM'].map(kind=>[kind,window.ArmyBookAppV2.payload.cards.filter(card=>card.kind===kind).length])));
      assert.deepEqual(counts,{DATASHEET:43,PROFILE:44,DETACHMENT:7,DETACHMENT_RULE:9,ENHANCEMENT:23,STRATAGEM:31});
      for(const entity of facts.entities.filter(entity=>['DATASHEET','DETACHMENT','ARMY_RULE'].includes(entity.kind))){
        console.log(device+' source '+entity.id);
        await normal(page,entity.id);assert.ok(normalize(await page.locator('main').innerText()).includes(normalize(entity.data.title)),entity.id+' visible');
        if(entity.kind==='DATASHEET')assert.ok(await page.locator('main .statline').count(),'Statline '+entity.id);
      }
      await normal(page,'unit-commander-in-coldstar-battlesuit');const reference=page.locator('main .weapon-name a[data-target-id]').first();await reference.click();
      await page.locator('dialog[open]').waitFor();assert.ok((await page.locator('dialog[open]').innerText()).length>30);await page.keyboard.press('Escape');
      await page.locator('dialog[open]').waitFor({state:'hidden'});await screenshot(page,device+'-source-datasheet');
    });
    await group('full-rule-texts',async()=>{
      for(const owner of facts.entities.filter(entity=>entity.kind==='DETACHMENT')){
        await normal(page,owner.id);const visible=normalize(await page.locator('main').innerText());
        for(const entity of facts.entities.filter(entity=>entity.parentId===owner.id&&['DETACHMENT_RULE','ENHANCEMENT','STRATAGEM'].includes(entity.kind))){
          const expected=entity.kind==='STRATAGEM'?entity.data.lines.map(line=>line.text):[entity.data.text];
          for(const text of expected.filter(Boolean))assert.ok(visible.includes(normalize(text)),'Complete source text '+entity.id);
        }
      }
    });
    await group('search-navigation-and-source-popup',async()=>{
      await normal(page,'unit-darkstrider');const input=page.getByRole('searchbox',{name:'Search the army book',exact:true});
      if(!await input.isVisible())await page.getByRole('button',{name:'Open navigation',exact:true}).click();
      await input.fill('Darkstrider');await page.locator('#tocTree button[data-target-id="unit-darkstrider"]').first().click();
      await page.locator('main [data-card-id="unit-darkstrider"]').waitFor();
      if(!await input.isVisible())await page.getByRole('button',{name:'Open navigation',exact:true}).click();
      await input.fill('');const drawer=page.locator('#navMenu[aria-label="Close navigation"]');if(await drawer.isVisible())await drawer.click();
      const reference=page.locator('main .weapon-name a[data-target-id]').first();await reference.click();await page.locator('dialog[open]').waitFor();
      await page.goBack();await page.locator('dialog[open]').waitFor({state:'hidden'});await page.goForward();await page.locator('dialog[open]').waitFor();
      await page.keyboard.press('Escape');await page.locator('dialog[open]').waitFor({state:'hidden'});await geometry(page);await screenshot(page,device+'-search-and-source');
    });
    for(let index=0;index<3;index++)await group('prototype-'+index,async()=>{
      const input=fixed('prototype-'+index),state=await imported(page,input,1),owner=state.units[0].instanceId,ruleId=sourceOracle.canonicalIds[index];
      const select=page.locator(`[data-roster-instance-id="${owner}"] select[data-source-choice-id="${ruleId}"]`);
      const options=await select.locator('option').evaluateAll(nodes=>nodes.map(node=>node.value).filter(Boolean));assert.ok(options.length,'Prototype equipment choice exposed');
      await sourceChoice(page,owner,ruleId,options[0]);await effective(page,owner);await assertPrototype(page,index,true);
      assert.ok(normalize(await page.locator('main').innerText()).includes(normalize(records.get(ruleId).data.text)),'Full Prototype Enhancement in Effective');await screenshot(page,device+'-prototype-'+index+'-effective');
      await guide(page,owner);await assertPrototype(page,index,true);assert.ok(normalize(await page.locator('main').innerText()).includes(normalize(records.get(ruleId).data.text)),'Full Prototype Enhancement in Guide');const saved=await snapshot(page);
      const weaponSelections=saved.units[0].modelRows.flatMap(row=>[...row.selections,...(row.loadouts||[]).flatMap(loadout=>loadout.selections)]).filter(selection=>selection.canonicalProfileIds.length);
      assert.equal(weaponSelections.length,1);assert.equal(weaponSelections[0].physicalQuantity,2);assert.ok(!JSON.stringify(saved).includes('weapon-quantity-portion'));
      const direct=page.url();await page.reload();await ready(page);assert.deepEqual(await snapshot(page),saved);await assertPrototype(page,index,true);
      await page.goBack();await ready(page);await page.goForward();await ready(page);await page.goto(direct);await ready(page);
      await sourceChoice(page,owner,ruleId,null);await effective(page,owner);await assertPrototype(page,index,false);
      await sourceChoice(page,owner,ruleId,options[0]);await imported(page,input,1);await effective(page,owner);await assertPrototype(page,index,true);
      await roster(page);await backupControls(page);const [download]=await Promise.all([page.waitForEvent('download'),page.locator('[data-roster-action="export-backup"]').click()]);
      const file=path.join(out,device+'-prototype-'+index+'-backup.json');await download.saveAs(file);assert.deepEqual(JSON.parse(fs.readFileSync(file,'utf8')),await snapshot(page));
      await sourceChoice(page,owner,ruleId,null);await roster(page);await backupControls(page);await page.getByLabel('Restore a V2 roster backup',{exact:true}).setInputFiles(file);
      await page.waitForFunction(({owner,ruleId})=>window.ArmyBookAppV2.roster.state.units.find(unit=>unit.instanceId===owner).selectedTauWeaponChoiceIds?.some(id=>id.startsWith(ruleId)),{owner,ruleId});
      await effective(page,owner);await assertPrototype(page,index,true);
    });
    await group('shield-marker-physical-owners',async()=>{
      await imported(page,shieldInput,2);
      const values=await page.evaluate(()=>window.ArmyBookAppV2.roster.projection.units.map(unit=>unit.profiles.map(model=>Number(model.profile.stats.W))));
      assert.deepEqual(values,[[10,9,8],[8,8,8]],'Source baseW8 + independently stated MODEL counts; unknown UNIT inventory unallocated');
      for(const id of ['parsed-unit-1','parsed-unit-2']){
        const expected=id==='parsed-unit-1'?[8,9,10]:[8];
        for(const display of [effective,guide]){
          await display(page,id);assert.match(await page.locator('main').innerText(),/Shield Drone/i);
          const visibleW=await page.locator('main .statline .stat').evaluateAll(nodes=>[...new Set(nodes.filter(node=>node.querySelector('b')?.textContent==='W').map(node=>Number(node.querySelector('span')?.textContent)))].sort((a,b)=>a-b));
          assert.deepEqual(visibleW,expected,'Real visible per-MODEL W panels');
        }
      }
      await screenshot(page,device+'-unknown-shield-inventory');
      const marker=header+'1x Commander In Coldstar Battlesuit (100 pts)\n• 1x Commander in Coldstar Battlesuit: 1x Marker Drone\n'+
        '1x Commander In Coldstar Battlesuit (100 pts)\n• 1x Commander in Coldstar Battlesuit\n';
      await imported(page,marker,2);assert.deepEqual(await page.evaluate(()=>window.ArmyBookAppV2.roster.projection.units.map(unit=>unit.keywords.includes('MARKERLIGHT'))),[true,false]);
      await effective(page,'parsed-unit-1');assert.match(await page.locator('main').innerText(),/MARKERLIGHT/);await guide(page,'parsed-unit-1');
      await imported(page,marker.replace(': 1x Marker Drone',''),2);assert.deepEqual(await page.evaluate(()=>window.ArmyBookAppV2.roster.projection.units.map(unit=>unit.keywords.includes('MARKERLIGHT'))),[false,false]);
      await imported(page,fixed('unknown-drone-bearer'),2);assert.deepEqual(await page.evaluate(()=>window.ArmyBookAppV2.roster.projection.units.map(unit=>unit.keywords.includes('MARKERLIGHT'))),[true,false]);
      assert.ok((await snapshot(page)).units[0].modelRows.every(row=>row.selections.length===0),'UNIT drone inventory never fabricates MODEL bearer');
    });
    await group('student-independent-sources',async()=>{
      await imported(page,fixed('student-independent-sources'),4);const ruleId='detachment-auxiliary-cadre:enhancement:1';
      await sourceChoice(page,'parsed-unit-1',ruleId,JSON.stringify(['parsed-unit-3']));await sourceChoice(page,'parsed-unit-2',ruleId,JSON.stringify(['parsed-unit-4']));
      const grants=()=>page.evaluate(ruleId=>window.ArmyBookAppV2.roster.projection.units.filter(unit=>['parsed-unit-3','parsed-unit-4'].includes(unit.instanceId)).map(unit=>
        unit.applied.filter(row=>row.ruleId===ruleId&&row.operation==='GRANT_ABILITY').map(row=>row.sourceInstanceId)),ruleId);
      assert.deepEqual(await grants(),[['parsed-unit-1'],['parsed-unit-2']]);
      for(const id of ['parsed-unit-3','parsed-unit-4']){await effective(page,id);assert.match(await page.locator('main').innerText(),/Deep Strike/i);await guide(page,id);assert.match(await page.locator('main').innerText(),/Deep Strike/i);}
      await screenshot(page,device+'-student-guide');const saved=await snapshot(page);await page.reload();await ready(page);assert.deepEqual(await snapshot(page),saved);
      await sourceChoice(page,'parsed-unit-1',ruleId,null);assert.deepEqual(await grants(),[[],['parsed-unit-2']]);
      await sourceChoice(page,'parsed-unit-1',ruleId,JSON.stringify(['parsed-unit-4']));assert.deepEqual(await grants(),[[],['parsed-unit-1','parsed-unit-2']]);
      await roster(page);await backupControls(page);await page.locator('[data-roster-action="reload-saved"]').click();assert.deepEqual(await grants(),[[],['parsed-unit-1','parsed-unit-2']]);
    });
    await group('conditional-and-typed-limitations',async()=>{
      const text='+ FACTION KEYWORD: T’au Empire\n+ DETACHMENT: Kauyon\n+ DETACHMENT: Kroot Hunting Pack\n'+
        '1x Darkstrider (100 pts)\n• 1x Darkstrider: 1x Shade\n'+
        '1x Commander In Coldstar Battlesuit (100 pts)\n• 1x Commander in Coldstar Battlesuit: 1x Plasma rifle\nEnhancement: Precision of the Patient Hunter\n'+
        '3x Crisis Fireknife Battlesuits (100 pts)\n• 1x Crisis Fireknife Shas’vre: 1x Plasma rifle\n• 2x Crisis Fireknife Shas’ui: 1x Plasma rifle\n'+
        '10x Kroot Carnivores (100 pts)\n• 1x Long-quill: 1x Kroot rifle\n• 9x Kroot Carnivores: 1x Kroot rifle\n';
      await imported(page,text,4);
      const cases=[['parsed-unit-1','datasheet-darkstrider:section:1'],['parsed-unit-2','detachment-kauyon:enhancement:2'],['parsed-unit-3','datasheet-crisis-fireknife-battlesuits:section:1']];
      for(const [unitId,ruleId]of cases){
        const rule=records.get(ruleId),expected=rule.data.text?[rule.data.text]:rule.data.blocks.map(block=>block.text);
        for(const display of [effective,guide]){
          await display(page,unitId);const visible=normalize(await page.locator('main').innerText());
          for(const clause of expected)assert.ok(visible.includes(normalize(clause)),'Full conditional text '+ruleId);
          const actual=await page.evaluate(id=>{const unit=window.ArmyBookAppV2.roster.projection.units.find(unit=>unit.instanceId===id);
            return unit.profiles.flatMap(model=>model.weapons).map(weapon=>({id:weapon.canonicalProfileId,skill:weapon.data.skill}));},unitId);
          for(const weapon of actual)assert.equal(weapon.skill,records.get(weapon.id).data.skill,'No fake BS/WS substitution for typed Hit/Wound/reroll limitation');
        }
      }
      await normal(page,'army-rule-for-the-greater-good');
      const armyText=normalize(await page.locator('main').innerText());
      for(const component of facts.entities.filter(entity=>entity.kind==='ARMY_RULE_COMPONENT'&&entity.parentId==='army-rule-for-the-greater-good'))
        if(component.data.text)assert.ok(armyText.includes(normalize(component.data.text)),'For the Greater Good full conditional text');
      await normal(page,'detachment-kroot-hunting-pack');assert.ok(normalize(await page.locator('main').innerText()).includes(normalize(records.get('detachment-kroot-hunting-pack:rule:skirmish-fighters').data.text)));
      await guide(page,'parsed-unit-4');const skirmish=page.locator('main a[data-target-id="detachment-kroot-hunting-pack:rule:skirmish-fighters"]').first();
      if(await skirmish.count()){await skirmish.click();await page.locator('dialog[open]').waitFor();assert.ok(normalize(await page.locator('dialog[open]').innerText()).includes(normalize(records.get('detachment-kroot-hunting-pack:rule:skirmish-fighters').data.text)));await page.keyboard.press('Escape');}
      else{await roster(page);await page.locator('[data-roster-action="open-personal-guide"]').click();await page.locator('main [data-target-id="detachment-kroot-hunting-pack"]').first().click();assert.ok(normalize(await page.locator('main').innerText()).includes(normalize(records.get('detachment-kroot-hunting-pack:rule:skirmish-fighters').data.text)));}
      await screenshot(page,device+'-conditional-rules');
    });
    await group('kroot-twenty-two-leaders',async()=>{
      await imported(page,fixed('kroot-two-leaders20'),3);await attach(page,'parsed-unit-2','parsed-unit-1');await attach(page,'parsed-unit-3','parsed-unit-1');
      const formed=await snapshot(page);assert.equal(formed.attachments.length,2);
      await page.reload();await ready(page);assert.deepEqual((await snapshot(page)).attachments,formed.attachments,'Both attachment decisions persist across reload');
      await roster(page);await backupControls(page);await page.locator('[data-roster-action="reload-saved"]').click();
      await page.waitForFunction(()=>!document.querySelector('[data-roster-view][aria-busy="true"]'));
      assert.deepEqual((await snapshot(page)).attachments,formed.attachments,'Both attachments reload from saved roster');
      await effective(page,'parsed-unit-1');assert.equal(await page.locator('main .unit-card').count(),3);
      await guide(page,'parsed-unit-1');assert.equal(await page.locator('main .unit-card').count(),3);await screenshot(page,device+'-kroot-two-leaders');
      await detach(page,'parsed-unit-2');assert.equal((await snapshot(page)).attachments.length,1);await attach(page,'parsed-unit-2','parsed-unit-1');assert.equal((await snapshot(page)).attachments.length,2);
      const saved=await snapshot(page);await imported(page,fixed('kroot-two-leaders20'),3);assert.deepEqual((await snapshot(page)).units,saved.units);
    });
    await group('invalid-import-preserves-state',async()=>{
      const before=await snapshot(page);await roster(page);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(header+'1x Unconfirmed foreign unit (1 pts)\n');
      await page.locator('[data-roster-action="review-import"]').click();await page.getByRole('status').filter({hasText:/clarification|read safely|not.*import/i}).first().waitFor();assert.deepEqual(await snapshot(page),before);
    });
    await geometry(page);await context.close();
  }
  result.status=result.results.some(row=>row.status==='FAIL')||result.errors.length||result.missing.length?'FAIL':'PASS';
}catch(error){result.status='BLOCKED';result.error=error.stack;}
finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));result.finishedAt=new Date().toISOString();
  result.groupCounts={total:result.results.length,pass:result.results.filter(row=>row.status==='PASS').length,fail:result.results.filter(row=>row.status==='FAIL').length};
  const content=JSON.stringify(result,null,2);fs.writeFileSync(path.join(out,'app-browser-qa.json'),content);
  fs.writeFileSync(path.join(out,'app-browser-qa-'+result.startedAt.replace(/[:.]/g,'-')+'.json'),content);}
console.log(JSON.stringify({status:result.status,groups:result.groupCounts,results:result.results,errors:result.errors,missing:result.missing,
  browserVersion:result.browserVersion,playwrightVersion:result.playwrightVersion,evidence:path.join(out,'app-browser-qa.json')},null,2));if(result.status!=='PASS')process.exitCode=1;
