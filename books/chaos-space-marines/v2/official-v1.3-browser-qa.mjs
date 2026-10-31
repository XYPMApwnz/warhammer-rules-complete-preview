import {createQaEvidenceDir} from '../../../tests/helpers/qa-temp.mjs';
import {launchQaBrowser} from '../../../tests/helpers/qa-browser.cjs';
/** Real production bytes and UI actions; static transport is not live hosting. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const out=process.env.CSM_V13_SCREENSHOTS||createQaEvidenceDir('official-v1.3-browser-qa-');
fs.mkdirSync(out,{recursive:true});
const origin='http://csm-v13.test';
const text=`+ FACTION KEYWORD: Chaos - Chaos Space Marines
+ DETACHMENT: Pactbound Zealots
+ WARLORD: Char1: Chaos Lord
Char1: 1x Chaos Lord (95 pts): Warlord, Plasma pistol, Astartes chainblade, Mark: Nurgle
5x Legionaries (95 pts): Mark: Nurgle
• 1x Aspiring Champion: Bolt pistol, Boltgun, Close combat weapon, Chaos icon
• 4x Legionary: Bolt pistol, Boltgun, Close combat weapon
5x Havocs (135 pts): Mark: Nurgle
• 1x Havoc Champion: Boltgun, Astartes chainsword
• 4x Havoc: Havoc lascannon, Close combat weapon`;
const mime={'.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.html':'text/html','.css':'text/css',
  '.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const browser=await launchQaBrowser(chromium,{headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const results=[];
async function scenario(device,viewport){
  const errors=[],missing=[],steps=[];
  const context=await browser.newContext({viewport,serviceWorkers:'block'});
  await context.route('**/*',async route=>{
    const url=new URL(route.request().url()),file=path.resolve(repo,'.'+decodeURIComponent(url.pathname));
    if(url.origin!==origin||!file.startsWith(path.resolve(repo)+path.sep)){missing.push(url.href);await route.abort();return;}
    if(url.pathname==='/favicon.ico'){await route.fulfill({status:204});return;}
    if(!fs.existsSync(file)||!fs.statSync(file).isFile()){missing.push(url.pathname);await route.fulfill({status:404});return;}
    await route.fulfill({status:200,contentType:mime[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
  });
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  async function ready(){await page.waitForFunction(()=>window.ArmyBookAppV2);await page.evaluate(async()=>{await WarhammerAppV2.ready;await ArmyBookAppV2.ready;await ArmyBookAppV2.rosterPanel?.ready;await document.fonts.ready;});assert.deepEqual(errors,[]);}
  async function roster(){await page.getByRole('link',{name:'Roster',exact:true}).click();await ready();await page.locator('[data-roster-view]').waitFor();}
  async function open(id){await roster();await page.locator(`[data-roster-instance-id="${id}"]`).getByRole('button',{name:'Effective datasheet',exact:true}).click();await ready();await page.locator(`main .unit-card[data-roster-instance-id="${id}"]`).waitFor();}
  async function inspect(label,ids){
    const units=await page.locator('main .unit-card').evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.rosterInstanceId,text:n.innerText,
      stats:[...n.querySelectorAll('.statline')].map(x=>x.innerText),
      weapons:[...n.querySelectorAll('.weapon-row:not(.weapon-head)')].map(x=>({id:x.dataset.cardId,text:x.innerText})),
      facts:[...n.querySelectorAll('[data-fact-id]')].map(x=>({id:x.dataset.factId,text:x.textContent.trim()})),
      inventory:[...n.querySelectorAll('[data-selected-canonical-ids]')].map(x=>({ids:JSON.parse(x.dataset.selectedCanonicalIds),text:x.textContent.trim()}))})));
    assert.deepEqual(new Set(units.map(u=>u.id)),new Set(ids));
    for(const unit of units){
      assert.ok(unit.stats.length>0,'Missing MODEL stats');
      const toughness=unit.facts.filter(f=>f.id.endsWith('/T'));
      assert.ok(toughness.length>0&&toughness.every(f=>f.text==='5'),'Updated T5 must be visible on every physical MODEL');
      const rows=unit.weapons;
      const expected=unit.id==='parsed-unit-1'?{'datasheet-chaos-lord:weapon:4':['5','-1']}:
        unit.id==='parsed-unit-2'?{'datasheet-legionaries:weapon:2':['5','-1'],'datasheet-legionaries:weapon:3':['5','-1']}:
        {'datasheet-havocs:weapon:1':['5','-1'],'datasheet-havocs:weapon:15':['5','-1'],'datasheet-havocs:weapon:5':['12','-3']};
      for(const [id,values] of Object.entries(expected)){
        const row=rows.find(r=>r.id===id);assert.ok(row,'Missing selected weapon '+id);
        const strength=unit.facts.filter(f=>f.id.startsWith(id+'::')&&f.id.endsWith('/strength'));
        const ap=unit.facts.filter(f=>f.id.startsWith(id+'::')&&f.id.endsWith('/ap'));
        assert.ok(strength.some(f=>f.text===values[0]),'Wrong rendered Strength '+JSON.stringify(row));
        assert.ok(ap.some(f=>f.text.replace(/[−‑]/g,'-')===values[1]),'Wrong rendered AP '+JSON.stringify(row));
      }
      if(unit.id==='parsed-unit-3'){
        assert.ok(unit.facts.some(f=>f.id.endsWith('/W')&&f.text==='3'),'Havocs W3 missing');
        assert.ok(!rows.some(r=>/bolt pistol/i.test(r.text)),'Invented Havocs Bolt pistol');
      }
      if(unit.id==='parsed-unit-1')assert.equal(rows.filter(r=>/Astartes chainblade/.test(r.text)).length,1);
      if(unit.id==='parsed-unit-2')assert.equal(unit.inventory.filter(row=>/1\s*×\s*Chaos icon/.test(row.text)).length,1);
      assert.ok(unit.inventory.every(row=>!/^\d+\s*×\s*$/.test(row.text)));
    }
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
    assert.equal(overflow,false);assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
    steps.push({label,url:page.url(),units});return units;
  }
  async function attach(){await roster();await page.locator('[data-attachment-candidate-for="parsed-unit-2"]').selectOption('parsed-unit-1');await page.locator('[data-attachment-target-instance-id="parsed-unit-2"] [data-roster-action="attach"]').click();await page.waitForFunction(()=>ArmyBookAppV2.roster.state.attachments.length===1);}
  try{
    await page.goto(origin+'/v2/app.html');await page.getByRole('link',{name:'Roster',exact:true}).click();await page.locator('main a[data-v2-book="chaos-space-marines"]').click();await ready();
    await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);await page.getByRole('button',{name:'Import roster',exact:true}).click();
    await page.waitForFunction(()=>ArmyBookAppV2.roster.state?.units.length===3);await ready();await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
    const state=await page.evaluate(()=>ArmyBookAppV2.roster.snapshot());
    await page.screenshot({path:path.join(out,device+'-roster.png')});
    for(const id of ['parsed-unit-1','parsed-unit-2','parsed-unit-3']){await open(id);await inspect('independent '+id,[id]);await page.screenshot({path:path.join(out,device+'-'+id+'.png'),fullPage:true});}
    await attach();await open('parsed-unit-2');const formed=await inspect('attached Effective',['parsed-unit-1','parsed-unit-2']);
    await roster();await page.getByRole('button',{name:'Open personal guide',exact:true}).click();await page.locator('main a[data-target-id="roster-unit/parsed-unit-2"]').click();await ready();
    const guide=await inspect('Personal Guide formed',['parsed-unit-1','parsed-unit-2']);assert.deepEqual(guide,formed);
    await page.screenshot({path:path.join(out,device+'-guide.png'),fullPage:true});
    await page.reload();await ready();assert.deepEqual(await inspect('Guide reload',['parsed-unit-1','parsed-unit-2']),formed);
    await roster();await page.getByRole('button',{name:'Open personal guide',exact:true}).click();await page.locator('main a[data-target-id="roster-unit/parsed-unit-3"]').click();await ready();await inspect('Guide Havocs',['parsed-unit-3']);
    await page.goBack();await ready();await page.goForward();await ready();await inspect('history Havocs',['parsed-unit-3']);
    await roster();await page.locator('[data-roster-action="detach"][data-leader-instance-id="parsed-unit-1"]').click();await page.waitForFunction(()=>ArmyBookAppV2.roster.state.attachments.length===0);
    await open('parsed-unit-2');await inspect('detached',['parsed-unit-2']);await attach();await open('parsed-unit-2');assert.deepEqual(await inspect('reattached',['parsed-unit-1','parsed-unit-2']),formed);
    await page.reload();await ready();await inspect('Effective reload',['parsed-unit-1','parsed-unit-2']);
    const final=await page.evaluate(()=>ArmyBookAppV2.roster.snapshot());assert.deepEqual(final.units,state.units,'Reload/attachment changed imported selections');
    for(const [id,weapons]of [['unit-chaos-lord',{'datasheet-chaos-lord:weapon:4':['5','-1']}],
      ['unit-legionaries',{'datasheet-legionaries:weapon:2':['5','-1'],'datasheet-legionaries:weapon:3':['5','-1'],'datasheet-legionaries:weapon:17':['5','-1']}],
      ['unit-havocs',{'datasheet-havocs:weapon:1':['5','-1'],'datasheet-havocs:weapon:15':['5','-1'],
        'datasheet-havocs:weapon:12':['7','-2'],'datasheet-havocs:weapon:13':['8','-3']}]] ){
      await page.goto(origin+'/v2/app.html?v2=ARMY_BOOK&registry=chaos-space-marines#'+id);await ready();
      const card=page.locator(`main .unit-card[data-card-id="${id}"]`);await card.waitFor();
      for(const field of await card.locator('[data-fact-id$="/T"]').allTextContents())assert.equal(field.trim(),'5');
      assert.ok(await card.locator('[data-fact-id$="/T"]').count());
      if(id==='unit-havocs')for(const field of await card.locator('[data-fact-id$="/W"]').allTextContents())assert.equal(field.trim(),'3');
      for(const [weapon,[s,ap]]of Object.entries(weapons)){
        assert.equal((await card.locator(`[data-fact-id="${weapon}::/strength"]`).textContent()).trim(),s);
        assert.equal((await card.locator(`[data-fact-id="${weapon}::/ap"]`).textContent()).trim().replace(/[−‑]/g,'-'),ap);
      }
      await page.reload();await ready();await card.waitFor();
      await page.screenshot({path:path.join(out,device+'-book-'+id+'.png'),fullPage:true});
      steps.push({label:'normal Army Book direct URL/reload '+id,url:page.url()});
    }
    await roster();assert.deepEqual(await page.evaluate(()=>ArmyBookAppV2.roster.snapshot().units),state.units);
    assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
    results.push({device,status:'PASS',steps:steps.length,errors,missing});
    fs.writeFileSync(path.join(out,device+'-evidence.json'),JSON.stringify({results:results.at(-1),steps},null,2));
  }catch(error){fs.writeFileSync(path.join(out,device+'-failure.json'),JSON.stringify({message:error.message,url:page.url(),errors,missing,body:await page.locator('body').innerText()},null,2));await page.screenshot({path:path.join(out,device+'-failure.png'),fullPage:true});throw error;}
  finally{await context.close();}
}
try{for(const [device,viewport]of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]])await scenario(device,viewport);console.log(JSON.stringify({status:'PASS',transport:'production static bytes; not live hosting',results,out}));}
finally{await browser.close();}
