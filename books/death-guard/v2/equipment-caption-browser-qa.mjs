/** Real application bytes through the existing static-byte browser transport.
 * This is UI acceptance, not live-hosting certification. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {equipmentCaptionRoster as text,equipmentCaptionCases as cases} from './equipment-caption-fixtures.mjs';

const repo=fileURLToPath(new URL('../../../',import.meta.url)),origin='http://dg-equipment-caption.test';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const errors=[],missing=[],results=[];
const mime={'.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.html':'text/html','.css':'text/css',
  '.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.woff2':'font/woff2'};
const screenshotDir=process.env.DG_CAPTION_SCREENSHOTS;
if(screenshotDir)fs.mkdirSync(screenshotDir,{recursive:true});
async function ready(page){await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2));
  await page.evaluate(async()=>{await window.ArmyBookAppV2.ready;await window.ArmyBookAppV2.rosterPanel?.ready;});}
async function roster(page){await page.getByRole('link',{name:'Roster',exact:true}).click();await ready(page);}
async function open(page,id){await roster(page);await page.locator(`[data-roster-instance-id="${id}"]`)
  .getByRole('button',{name:'Effective datasheet',exact:true}).click();await ready(page);}
async function guide(page,id){await roster(page);await page.getByRole('button',{name:'Open personal guide',exact:true}).click();
  await page.locator(`main a[data-target-id="roster-unit/${id}"]`).click();await ready(page);}
async function inspect(page,id){return page.evaluate(id=>{
  const unit=window.ArmyBookAppV2.roster.state.units.find(unit=>unit.instanceId===id);
  const root=[...document.querySelectorAll('main .unit-card')].find(node=>node.dataset.rosterInstanceId===id);
  if(!root)throw Error('Missing physical component '+id);
  return {items:[...root.querySelectorAll('li[data-selected-canonical-ids]')]
    .filter(node=>JSON.parse(node.dataset.selectedCanonicalIds).some(id=>id.includes(':wargear:')))
    .map(node=>({text:node.textContent,visible:node.getClientRects().length>0,
      ids:JSON.parse(node.dataset.selectedCanonicalIds),row:node.closest('[data-composition-row-id]')?.dataset.compositionRowId})),
    equipment:[...unit.selections,...unit.modelRows.flatMap(row=>[...row.selections,...row.loadouts.flatMap(loadout=>loadout.selections)])]
      .filter(selection=>selection.canonicalEquipmentIds.length),
    overflow:document.documentElement.scrollWidth>window.innerWidth};
},id);}
function verify(report,n){
  const expected=cases.filter(c=>c.unit===n);
  assert.equal(report.items.length,expected.length,'No missing, unselected or duplicate equipment');
  for(const c of expected){const id=`datasheet-${c.slug}:wargear:${c.option}`,actual=report.items.filter(item=>item.ids.includes(id));
    assert.equal(actual.length,1);assert.equal(actual[0].text,'1 × '+c.label);assert.equal(actual[0].visible,true);
    assert.equal(actual[0].row,`parsed-unit-${n}/model-row/${c.row}`,'Physical row ownership retained');
    const selections=report.equipment.filter(selection=>selection.canonicalEquipmentIds.includes(id));
    assert.equal(selections.length,1);assert.equal(selections[0].physicalQuantity,1);
    assert.equal(selections[0].sourceReferences.filter(ref=>ref.caption).length,1);
  }
  assert.equal(report.overflow,false);
}
async function transition(page,action,leader,bodyguard,expected){
  await roster(page);
  if(action==='detach')await page.locator(`[data-roster-action="detach"][data-leader-instance-id="${leader}"]`).click();
  else {await page.locator(`[data-attachment-candidate-for="${bodyguard}"]`).selectOption(leader);
    await page.locator(`[data-attachment-target-instance-id="${bodyguard}"] [data-roster-action="attach"]`).click();}
  await page.waitForFunction(n=>window.ArmyBookAppV2.roster.state.attachments.length===n,expected);await ready(page);
}
try{
  for(const [device,viewport] of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
    const context=await browser.newContext({viewport,serviceWorkers:'block'});
    await context.route('**/*',async route=>{const url=new URL(route.request().url()),file=path.resolve(repo,'.'+decodeURIComponent(url.pathname));
      if(url.origin!==origin){await route.abort();return;}
      if(url.pathname==='/favicon.ico'){await route.fulfill({status:204});return;}
      if(!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
        missing.push(url.pathname);await route.fulfill({status:404,body:'Missing application file'});return;}
      await route.fulfill({status:200,contentType:mime[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
    });
    const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
    await page.goto(origin+'/v2/app.html?v2=ARMY_BOOK&registry=death-guard');await ready(page);await roster(page);
    await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
    await page.locator('[data-roster-action="review-import"]').click();
    await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state?.units.length===10);
    await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));await ready(page);
    const imported=await page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());
    for(const n of [1,2,3,4,5,6,7,8,9,10]){
      await open(page,'parsed-unit-'+n);verify(await inspect(page,'parsed-unit-'+n),n);
      await guide(page,'parsed-unit-'+n);verify(await inspect(page,'parsed-unit-'+n),n);
      await page.reload();await ready(page);verify(await inspect(page,'parsed-unit-'+n),n);
      assert.deepEqual(await page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot()),imported,'Reload preserves physical import state');
      if(screenshotDir&&[1,5].includes(n)){
        await page.locator('main .unit-card .ds-composition-member').first().scrollIntoViewIfNeeded();
        await page.screenshot({path:path.join(screenshotDir,device+'-unit-'+n+'.png'),fullPage:false});
      }
    }
    for(const [leader,bodyguard] of [['parsed-unit-9','parsed-unit-1'],['parsed-unit-10','parsed-unit-3']]){
      for(const action of ['attach','detach','reattach']){
        await transition(page,action,leader,bodyguard,action==='detach'?0:1);
        await open(page,bodyguard);verify(await inspect(page,bodyguard),Number(bodyguard.split('-').at(-1)));
        if(action==='detach')await open(page,leader);
        verify(await inspect(page,leader),Number(leader.split('-').at(-1)));
        await guide(page,bodyguard);verify(await inspect(page,bodyguard),Number(bodyguard.split('-').at(-1)));
        await page.reload();await ready(page);verify(await inspect(page,bodyguard),Number(bodyguard.split('-').at(-1)));
      }
      // Return to independent instances before testing the next formation.
      await transition(page,'detach',leader,bodyguard,0);
    }
    results.push({device,captions:'6/6',effectiveDatasheet:'PASS',personalGuide:'PASS',reload:'PASS',
      selectedUnselected:'PASS',ownersAndInstances:'PASS',attachDetachReattach:'PASS'});
    await context.close();
  }
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
  console.log(JSON.stringify({status:'PASS',transport:'real static bytes; not live hosting',results,errors,missing}));
}finally{await browser.close();}
