/** Real application bytes and UI actions; no DOM or runtime-state injection.
 * The static-byte transport verifies UI acceptance, not live hosting. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';

const repo=fileURLToPath(new URL('../../../',import.meta.url));
const baseline='9c41816eb955af27b14f7ec75e1035b755ae09cf';
const files=['books/adeptus-mechanicus/v2/roster-import.mjs','books/adeptus-mechanicus/v2/roster-runtime.mjs',
  'books/adeptus-mechanicus/v2/roster-attachments.mjs','books/shared/roster-v2/context.mjs','books/shared/army-book-app-v2/datasheet-v1.mjs'];
const oldBytes=new Map(files.map(file=>['/'+file,execFileSync('git',['show',baseline+':'+file],{cwd:repo})]));
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const errors=[],missing=[],results=[];
const mime={'.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.html':'text/html','.css':'text/css',
  '.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.woff2':'font/woff2'};
const screenshots=process.env.AM_CAPTION_SCREENSHOTS;if(screenshots)fs.mkdirSync(screenshots,{recursive:true});
const header='+ FACTION KEYWORD: Imperium - Adeptus Mechanicus\n+ DETACHMENT: Haloscreed Battle Clade\n';
const rangers='10x Skitarii Rangers (85 pts): 10x Galvanic rifle, 10x Close combat weapon';
const text=header+'Char1: 1x Tech-Priest Dominus (60 pts): Macrostubber, Volkite blaster, Omnissian axe\nEnhancement: Cognitive Reinforcement (+30 pts)\n'+
  rangers+', 1x Omnispex\n'+rangers;
const selectedId='datasheet-skitarii-rangers:section:1';
async function ready(page){await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2));await page.evaluate(async()=>{
  await WarhammerAppV2.ready;await ArmyBookAppV2.ready;await ArmyBookAppV2.rosterPanel?.ready;await document.fonts.ready;
});}
async function mount(old,viewport){
  const origin=old?'http://am-caption-baseline.test':'http://am-caption-current.test',context=await browser.newContext({viewport,serviceWorkers:'block'});
  await context.route('**/*',async route=>{
    const url=new URL(route.request().url()),file=path.resolve(repo,'.'+decodeURIComponent(url.pathname));
    if(url.origin!==origin){missing.push(url.href);await route.abort();return;}
    if(url.pathname==='/favicon.ico'){await route.fulfill({status:204});return;}
    if(!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
      missing.push(url.pathname);await route.fulfill({status:404});return;
    }
    await route.fulfill({status:200,contentType:mime[path.extname(file)]||'application/octet-stream',
      body:old&&oldBytes.has(url.pathname)?oldBytes.get(url.pathname):fs.readFileSync(file)});
  });
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  await page.goto(origin+'/v2/app.html');
  await page.getByRole('link',{name:'Roster',exact:true}).click();
  await page.locator('main a[data-v2-book="adeptus-mechanicus"]').click();await ready(page);
  return {page,context};
}
async function roster(page){await page.getByRole('link',{name:'Roster',exact:true}).click();await ready(page);}
async function importText(page,value,count){await roster(page);
  await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(value);
  await page.getByRole('button',{name:'Import roster',exact:true}).click();
  await page.waitForFunction(count=>ArmyBookAppV2.roster.state?.units.length===count,count);await ready(page);
  assert.equal(await page.locator('[data-roster-bindings] select').count(),0);
}
async function open(page,id){await roster(page);await page.locator(`[data-roster-instance-id="${id}"]`)
  .getByRole('button',{name:'Effective datasheet',exact:true}).click();await ready(page);}
async function guide(page,id){await roster(page);await page.getByRole('button',{name:'Open personal guide',exact:true}).click();
  await page.locator('main a[data-target-id="roster-unit/'+id+'"]').click();await ready(page);}
async function inspect(page,id){return page.locator('main .unit-card[data-roster-instance-id="'+id+'"]').evaluate(n=>({
  text:n.innerText,composition:n.querySelector('[data-datasheet-section="composition"]').innerText,
  items:[...n.querySelectorAll('[data-selected-canonical-ids]')].map(item=>({ids:JSON.parse(item.dataset.selectedCanonicalIds),
    text:item.textContent.replace(/\s+/g,' ').trim(),href:item.querySelector('a')?.href,visible:!!item.getClientRects().length})),
  ranged:[...n.querySelectorAll('[role="row"]')].filter(row=>/Galvanic rifle|Macrostubber|Volkite blaster/.test(row.innerText)).map(row=>row.innerText),
  effectiveAbilities:[...n.querySelectorAll('[data-ability-presentation-identity]')].map(a=>({id:a.dataset.canonicalAbilityId,text:a.innerText})),
  stats:[...n.querySelectorAll('.statline')].map(s=>s.innerText)
}));}
function verify(report,{selected=false,attached=false,character=false}={}){
  const equipment=report.items.filter(item=>item.ids.includes(selectedId));assert.equal(equipment.length,selected?1:0);
  if(selected){assert.equal(equipment[0].text,'1 × omnispex');assert.equal(equipment[0].visible,true);
    assert.deepEqual(equipment[0].ids,[selectedId]);assert.ok(decodeURIComponent(equipment[0].href).includes(selectedId));
    assert.match(report.text,/Omnispex:/,'Canonical ability heading unchanged');
    assert.doesNotMatch(report.composition,/1 × ABILITIES/);
  }
  if(!character&&!selected)assert.doesNotMatch(report.text,/Omnispex:/);
  assert.ok(report.stats.length);assert.match(report.text,/Keywords/);
  assert.ok(report.ranged.length,'Selected ranged weapon rows must be rendered');
  for(const row of report.ranged){
    assert.equal(row.includes('IGNORES COVER'),selected||(attached&&character));
    assert.equal(row.includes('HEAVY'),attached||character);assert.equal(row.includes('ASSAULT'),attached||character);
  }
  assert.equal(report.effectiveAbilities.some(a=>a.id==='core-feel-no-pain'),attached);
  if(character){assert.match(report.text,/Cognitive Reinforcement/);assert.doesNotMatch(report.composition,/omnispex/i);}
  else{assert.match(report.composition,/10 models/);assert.doesNotMatch(report.text,/Cognitive Reinforcement/);}
}
async function transition(page,action){await roster(page);
  if(action==='detach')await page.locator('[data-roster-action="detach"][data-leader-instance-id="parsed-unit-1"]').click();
  else{await page.locator('[data-attachment-candidate-for="parsed-unit-2"]').selectOption('parsed-unit-1');
    await page.locator('[data-attachment-target-instance-id="parsed-unit-2"] [data-roster-action="attach"]').click();}
  await page.waitForFunction(n=>ArmyBookAppV2.roster.state.attachments.length===n,action==='detach'?0:1);await ready(page);
}
const content=report=>report.text.split('\n').map(line=>line.trim()).filter(Boolean).sort();
try{
  for(const [device,viewport]of [['desktop',{width:1440,height:900}],['phone',{width:390,height:844}]]){
    const current=await mount(false,viewport),{page}=current;await importText(page,text,3);
    await open(page,'parsed-unit-2');verify(await inspect(page,'parsed-unit-2'),{selected:true});
    await open(page,'parsed-unit-3');verify(await inspect(page,'parsed-unit-3'));
    await transition(page,'attach');await open(page,'parsed-unit-2');
    const attached=await inspect(page,'parsed-unit-2');verify(attached,{selected:true,attached:true});
    verify(await inspect(page,'parsed-unit-1'),{character:true,attached:true});
    assert.equal(await page.locator('main .unit-card').count(),2);
    if(screenshots)await page.screenshot({path:path.join(screenshots,device+'-effective.png'),fullPage:true});
    await guide(page,'parsed-unit-2');const personal=await inspect(page,'parsed-unit-2');verify(personal,{selected:true,attached:true});
    assert.deepEqual(content(personal),content(attached));
    if(screenshots)await page.screenshot({path:path.join(screenshots,device+'-personal-guide.png'),fullPage:true});
    await page.reload();await ready(page);verify(await inspect(page,'parsed-unit-2'),{selected:true,attached:true});
    await open(page,'parsed-unit-3');verify(await inspect(page,'parsed-unit-3'));
    await transition(page,'detach');await open(page,'parsed-unit-2');verify(await inspect(page,'parsed-unit-2'),{selected:true});
    assert.equal(await page.locator('main .unit-card').count(),1);await open(page,'parsed-unit-1');verify(await inspect(page,'parsed-unit-1'),{character:true});
    await transition(page,'reattach');await guide(page,'parsed-unit-2');verify(await inspect(page,'parsed-unit-2'),{selected:true,attached:true});
    verify(await inspect(page,'parsed-unit-1'),{character:true,attached:true});
    await page.reload();await ready(page);assert.deepEqual(content(await inspect(page,'parsed-unit-2')),content(attached));
    await roster(page);assert.equal(await page.locator('[data-roster-action="detach"][data-leader-instance-id="parsed-unit-1"]').count(),1);

    // An unchanged, non-caption consumer retains exactly the former fallback.
    const previous=await mount(true,viewport),other=header+'1x Onager Dunecrawler (120 pts): Neutron laser, Cognis heavy stubber, Dunecrawler legs, Broad spectrum data-tether';
    const reports=[];for(const session of [current,previous]){await importText(session.page,other,1);await open(session.page,'parsed-unit-1');reports.push(await inspect(session.page,'parsed-unit-1'));}
    assert.deepEqual(reports[0].items,reports[1].items.map(item=>({...item,href:item.href.replace('am-caption-baseline.test','am-caption-current.test')})));
    assert.deepEqual(content(reports[0]),content(reports[1]));
    results.push({device,exactCaption:'PASS',effective:'PASS',personalGuide:'PASS',selectedUnselected:'PASS',
      ownerAndInstanceIsolation:'PASS',attachDetachReattach:'PASS',reload:'PASS',noCaptionFallback:'PASS'});
    await previous.context.close();await current.context.close();
  }
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
  console.log(JSON.stringify({status:'PASS',transport:'actual static application bytes; not live hosting',results,errors,missing}));
}finally{await browser.close();}
