/** Focused UI acceptance against unchanged working-tree application bytes.
 * Static-byte transport exercises the browser, not live hosting. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const repo=fileURLToPath(new URL('../../../',import.meta.url));
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,
  executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const evidence=process.env.AM_V14_SCREENSHOTS||'E:/Warhammer/qa-artifacts/am-official-v1.4-20261014';
fs.mkdirSync(evidence,{recursive:true});
const origin='http://am-official-v14.test';
const chant='detachment-luminen-auto-choir:stratagem:2',guided='detachment-haloscreed-battle-clade:stratagem:5';
const faq='faq-2',sourceId='gw-am-faction-pack-v1.4';
const currentWhen={
  [chant]:'Your Movement phase, when a friendly ELECTRO-PRIESTS unit is selected to make an advance move.',
  [guided]:'Your Movement phase, when a friendly ADEPTUS MECHANICUS unit is selected to make a fall-back move.'
};
const currentEffect={
  [chant]:'That move does not prevent your unit from being eligible to declare a charge.',
  [guided]:'• If your unit is a HALO OVERRIDE unit, your unit can re-roll hazard rolls.\n• That fall-back move does not prevent your unit from:\n  • Being eligible to shoot.\n  • Being eligible to declare a charge.'
};
const question='When I select one of Thulia Ghuld’s Icon of War abilities, when do I select the unit that ability affects?';
const answer='When you have selected the Icon of War ability you want to use.';
const errors=[],missing=[],results=[];
const mime={'.mjs':'text/javascript','.js':'text/javascript','.html':'text/html','.json':'application/json','.css':'text/css',
  '.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.woff2':'font/woff2'};
const normalized=value=>value.replace(/\s+/g,' ').trim();
const safe=()=>{assert.deepEqual(errors,[],'Browser JavaScript errors');assert.deepEqual(missing,[],'Missing application resources');};
async function ready(page){
  await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2));
  await page.evaluate(async()=>{await WarhammerAppV2.ready;await ArmyBookAppV2.ready;
    await ArmyBookAppV2.rosterPanel?.ready;await document.fonts.ready;});safe();
}
async function contents(page,id){
  const menu=page.getByRole('button',{name:'Open navigation',exact:true});
  if(await menu.isVisible())await menu.click();
  const target=page.locator('#tocPanel [data-nav-target="'+id+'"]');
  const ancestors=await target.evaluate(node=>{
    const ids=[];for(let parent=node.closest('[data-nav-id]')?.parentElement;parent;parent=parent.parentElement)
      if(parent.matches('[data-nav-id]'))ids.unshift(parent.dataset.navId);return ids;
  });
  for(const ancestor of ancestors){
    const toggle=page.locator('#tocPanel [data-nav-id="'+ancestor+'"] > .toc-row [data-nav-toggle]');
    if(await toggle.count()&&await toggle.getAttribute('aria-expanded')==='false')await toggle.click();
  }
  await target.click();await ready(page);
}
async function fields(scope,id){
  const get=async pointer=>scope.locator('[data-fact-id="'+id+'::'+pointer+'"]').evaluateAll(nodes=>nodes
    .filter(node=>node.getClientRects().length).map(node=>node.textContent));
  if(id===faq){
    assert.ok((await get('/title')).some(value=>normalized(value)===question));
    assert.ok((await get('/text')).some(value=>normalized(value)===answer));
  }else{
    assert.ok((await get('/lines/0/text')).some(value=>normalized(value)===normalized(currentWhen[id])),'Exact current WHEN '+id);
    assert.ok((await get('/lines/2/text')).some(value=>normalized(value)===normalized(currentEffect[id])),'Exact current EFFECT '+id);
    const text=await scope.innerText();assert.doesNotMatch(text,/BATTLECLADE|Desperate Escape|just after an ADEPTUS MECHANICUS unit/);
  }
}
async function roster(page){await page.locator('[data-v2-primary-nav]').getByRole('link',{name:'Roster',exact:true}).click();await ready(page);}
async function importRoster(page,text,count){
  await roster(page);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
  await page.getByRole('button',{name:'Import roster',exact:true}).click();
  await page.waitForFunction(count=>ArmyBookAppV2.roster.state?.units.length===count,count);await ready(page);
  assert.equal(await page.locator('[data-roster-bindings] select').count(),0);
}
async function effective(page,instance){
  await roster(page);await page.locator('[data-roster-instance-id="'+instance+'"]')
    .getByRole('button',{name:'Effective datasheet',exact:true}).click();await ready(page);
}
async function related(page,instance,id,device,label){
  await page.locator('main .ds-related-rules-button').click();
  const dialog=page.locator('dialog.v2-related-dialog[open]');await dialog.waitFor();
  const rule=dialog.locator('[data-rule-id="'+id+'"]');
  assert.equal(await rule.count(),1);assert.equal(await rule.getAttribute('data-applicability'),'CONDITIONAL');
  assert.equal(await page.evaluate(({instance,id})=>ArmyBookAppV2.roster.related(instance).find(row=>row.ruleId===id).applicability,
    {instance,id}),'CONDITIONAL');
  assert.ok(await rule.isVisible());
  await rule.locator('[data-target-id="'+id+'"]').click();
  const detail=page.locator('dialog.v2-detail-dialog[open]');await detail.waitFor();await fields(detail,id);
  const record=detail.locator('[data-card-id="'+id+'"]').first();
  assert.ok(JSON.parse(await record.getAttribute('data-source-ids')).includes(sourceId));
  await page.screenshot({path:path.join(evidence,device+'-'+label+'-viewport.png'),fullPage:false});
  await page.getByRole('button',{name:'Close rule reference',exact:true}).click();
  await page.getByRole('button',{name:'Close compatible rules',exact:true}).click();
  assert.equal(await page.evaluate(()=>ArmyBookAppV2.roster.projection.units
    .flatMap(unit=>unit.applied).filter(effect=>[...['detachment-luminen-auto-choir:stratagem:2',
      'detachment-haloscreed-battle-clade:stratagem:5','faq-2']].includes(effect.ruleId)).length),0);
}
try{
  for(const[device,viewport]of [['desktop',{width:1440,height:900}],['phone',{width:390,height:844}]]){
    const context=await browser.newContext({viewport,serviceWorkers:'block'});
    await context.route('**/*',async route=>{
      const url=new URL(route.request().url()),file=path.resolve(repo,'.'+decodeURIComponent(url.pathname));
      if(url.origin!==origin){missing.push(url.href);await route.abort();return;}
      if(url.pathname==='/favicon.ico'){await route.fulfill({status:204});return;}
      if(!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
        missing.push(url.pathname);await route.fulfill({status:404});return;}
      await route.fulfill({status:200,contentType:mime[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
    });
    const page=await context.newPage();page.setDefaultTimeout(15000);
    page.on('pageerror',error=>errors.push(device+': '+error.message));
    page.on('console',message=>{if(message.type()==='error')errors.push(device+': '+message.text());});
    await page.goto(origin+'/v2/app.html');
    await page.locator('[data-v2-primary-nav]').getByRole('link',{name:'Army Books',exact:true}).click();
    await page.locator('main a[data-v2-book="adeptus-mechanicus"]').click();await ready(page);
    for(const[id,detachment]of [[chant,'detachment-luminen-auto-choir'],[guided,'detachment-haloscreed-battle-clade']]){
      await contents(page,'nav:'+detachment+':STRATAGEM');
      const record=page.locator('main [data-card-id="'+id+'"]');await record.scrollIntoViewIfNeeded();await fields(record,id);
      await record.locator('a[data-target-id="'+id+'"]').click();
      const popup=page.locator('dialog.v2-detail-dialog[open]');await popup.waitFor();await fields(popup,id);
      assert.ok(JSON.parse(await popup.locator('[data-card-id="'+id+'"]').getAttribute('data-source-ids')).includes(sourceId));
      await page.screenshot({path:path.join(evidence,device+'-'+(id===chant?'chant-book':'guided-book')+'-viewport.png'),fullPage:false});
      await popup.getByRole('link',{name:'Open this entry',exact:true}).click();await ready(page);
      const direct=page.url();await page.reload();await ready(page);await fields(page.locator('main [data-card-id="'+id+'"]'),id);
      await page.goBack();await ready(page);await page.goForward();await ready(page);
      await page.goto(direct);await ready(page);await fields(page.locator('main [data-card-id="'+id+'"]'),id);
    }
    await contents(page,faq);await fields(page.locator('main [data-card-id="'+faq+'"]'),faq);
    await contents(page,'official-update-reference:faq-2');
    const reference=page.locator('main [data-card-id="official-update-reference:faq-2"]');
    assert.match(await reference.innerText(),/Official update · Page 19/);
    await reference.locator('[data-target-id="faq-2"]').click();
    await fields(page.locator('dialog.v2-detail-dialog[open]'),faq);
    await page.screenshot({path:path.join(evidence,device+'-thulia-faq-viewport.png'),fullPage:false});
    await page.getByRole('button',{name:'Close rule reference',exact:true}).click();
    await importRoster(page,'+ DETACHMENT: Luminen Auto-choir\n\n5x Corpuscarii Electro-priests (65 pts)\n5x Fulgurite Electro-priests (70 pts)',2);
    for(const instance of ['parsed-unit-1','parsed-unit-2']){
      await effective(page,instance);await related(page,instance,chant,device,'chant-'+instance);
    }
    await importRoster(page,'+ DETACHMENT: Haloscreed Battle Clade\n\n10x Skitarii Rangers (85 pts): 10x Galvanic rifle, 10x Close combat weapon',1);
    await effective(page,'parsed-unit-1');await related(page,'parsed-unit-1',guided,device,'guided-effective');
    await roster(page);await page.getByRole('button',{name:'Open personal guide',exact:true}).click();
    await page.locator('main a[data-target-id="roster-unit/parsed-unit-1"]').click();await ready(page);
    await related(page,'parsed-unit-1',guided,device,'guided-personal-guide');
    await page.reload();await ready(page);await related(page,'parsed-unit-1',guided,device,'guided-guide-reload');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    safe();results.push({device,normalBook:'PASS',officialFAQ:'PASS',directReloadHistory:'PASS',
      chantTwoEligibleUnits:'CONDITIONAL',guidedEffective:'PASS',guidedGuide:'PASS',battleExecution:0});
    await context.close();
  }
  safe();const report={status:'PASS',transport:'current application static bytes; not live hosting',results,errors,missing};
  fs.writeFileSync(path.join(evidence,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await browser.close();}
