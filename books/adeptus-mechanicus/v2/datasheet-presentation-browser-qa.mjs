import {createQaEvidenceDir} from '../../../tests/helpers/qa-temp.mjs';
import {launchQaBrowser} from '../../../tests/helpers/qa-browser.cjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const baseline='022790fe28a2ef474655ab9a27e8ace1b9800728';
const out=process.env.ARMY_APP_V2_SCREENSHOTS||createQaEvidenceDir('datasheet-presentation-');
fs.mkdirSync(out,{recursive:true});
const originals=new Map(['books/shared/army-book-app-v2/datasheet-v1.mjs','books/shared/army-book-app-v2/datasheet-v1.css']
  .map(name=>[name,execFileSync('git',['show',`${baseline}:${name}`],{cwd:repo,maxBuffer:2e6})]));
const payload=JSON.parse(fs.readFileSync(path.join(repo,'books/adeptus-mechanicus/v2/generated/app-presentation.json')));
const cards=new Map(payload.cards.map(card=>[card.id,card]));
const errors=[],results=[];
const server=http.createServer((request,response)=>{
  let name=decodeURI(new URL(request.url,'http://localhost').pathname).slice(1),old=name.startsWith('baseline/');
  if(old)name=name.slice('baseline/'.length);
  const file=path.resolve(repo,name);
  if(!file.startsWith(repo+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){response.writeHead(404);response.end();return;}
  const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
  response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'image/jpeg','Cache-Control':'no-store'});
  response.end(old&&originals.has(name)?originals.get(name):fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const require=createRequire(import.meta.url),{chromium}=require('playwright'),{PNG}=require('pngjs');
const browser=await launchQaBrowser(chromium,{headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const ready=async page=>{
  await page.waitForFunction(()=>!!window.ArmyBookAppV2?.rosterPanel);
  await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);
};
const settled=async page=>{
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(image=>image.decode().catch(()=>{})));document.activeElement?.blur();scrollTo({top:0,behavior:'instant'});});
  await page.waitForTimeout(180);
};
const open=async(page,id)=>{await page.evaluate(id=>window.ArmyBookAppV2.open(id),id);await settled(page);};
const clean=async page=>{
  const root=page.locator('main .unit-card');
  assert.equal(await root.locator('.ds-effect-summary').count(),0,'Diagnostic effect list exposed');
  assert.equal(await root.locator('.ds-base-note,.ds-arsenal .profile-base,.ds-profile-strip .profile-base').count(),0,'Base metadata interrupts weapons');
  assert.doesNotMatch(await root.innerText(),/Active roster effects|Effective unit keywords|parsed-unit-|SUPPORT_EXCEPTION|\bCURRENT\b/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Horizontal overflow');
};
const importRoster=async(page,text,receiving)=>{
  await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
  await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
  await page.locator('[data-roster-action="review-import"]').click();
  await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state?.units.length===2);
  assert.equal(await page.locator('[data-roster-bindings] select').count(),0);
  await page.locator(`[data-attachment-candidate-for="${receiving}"]`).selectOption('parsed-unit-1');
  await page.locator(`[data-attachment-target-instance-id="${receiving}"] [data-roster-action="attach"]`).click();
  await page.locator('[data-roster-action="open-personal-guide"]').click();
  await page.evaluate(()=>window.ArmyBookAppV2.openInstance('parsed-unit-1'));await settled(page);
};
const amText=`+ FACTION KEYWORD: Imperium - Adeptus Mechanicus
+ DETACHMENT: Haloscreed Battle Clade, Lords of the Forge
Char1: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe
Enhancement: Cognitive Reinforcement
9x Servitor Battleclade (110 pts)
• 1x Servitor Underseer: Mechanicus pistol, Dataspikes
• 2x Gun Servitor: 2 with Heavy arc rifle, Servo-claw
• 6x Combat Servitor: 6 with Phosphor blaster, Servo-claw`;
const dgText=`+ FACTION KEYWORD: Chaos - Death Guard
+ DETACHMENT: Paragons of Putrescence, Virulent Vectorium
Char1: 1x Lord of Contagion (135 pts): Manreaper
Enhancement: Furnace of Plagues (+25 pts)
3x Deathshroud Terminators (150 pts)
• 1x Deathshroud Terminator Champion: Manreaper, Plaguespurt gauntlet
• 2x Deathshroud Terminator: 2 with Manreaper, Plaguespurt gauntlet`;
try{
 for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
  const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin+'/v2/app.html?v2=ARMY_BOOK&book=adeptus-mechanicus&registry=adeptus-mechanicus');await ready(page);
  for(const unit of payload.cards.filter(card=>card.kind==='DATASHEET')){
    await open(page,unit.id);await clean(page);
    const root=page.locator('main .unit-card');
    // Preserve every original source paragraph, including attachment exceptions,
    // scoped composition, wargear options and profile-selection instructions.
    for(const child of unit.children.map(id=>cards.get(id))){
      for(const field of child.fields.filter(field=>/^\/blocks\/\d+\/text$/.test(field.source?.path||''))){
        const text=await root.evaluate((root,id)=>[...root.querySelectorAll('[data-fact-id]')].find(n=>n.dataset.factId===id)?.textContent,field.id);
        assert.equal(text,field.value,`Lost source-backed paragraph ${field.id}`);
      }
      if(child.kind==='PROFILE')for(const baseId of child.children.filter(id=>cards.get(id).kind==='MODEL_BASE')){
        const base=root.locator(`[data-card-id="${baseId}"]`);
        assert.equal(await base.count(),1,'Base duplicated or removed');
        assert.equal(await base.locator('xpath=ancestor::details').count(),1,'Base not optional');
        assert.equal(await base.locator('xpath=ancestor::*[@data-datasheet-section="composition"]').count(),1,'Base outside composition');
        for(const field of cards.get(baseId).fields)assert.ok((await base.textContent()).includes(field.value),'Lost base note');
      }
      if(child.referenceCardIds?.some(id=>cards.get(id).kind==='ATTACHMENT_DECLARATION'))
        assert.equal(await root.locator(`[data-card-id="${child.id}"] .book-rule-references`).count(),0,'Repeated attachment list');
      if(child.kind==='MFM_UNIT_POINTS')for(const field of child.fields.filter(field=>field.source.path.endsWith('/value'))){
        const shown=await root.evaluate((root,id)=>[...root.querySelectorAll('.ds-cost [data-fact-id]')].find(n=>n.dataset.factId===id)?.textContent,field.id);
        assert.equal(shown,String(field.value),'Lost tier/count points value');
      }
    }
    if(unit.id==='unit-servitor-battleclade'){
      assert.equal(await root.locator('.model-profile').count(),2,'Mixed profiles flattened');
      assert.match(await root.innerText(),/Servitor Underseer/i);assert.match(await root.innerText(),/Combat Servitors and Gun Servitors/i);
      assert.deepEqual(await root.locator('.ds-cost-schedule > small').allTextContents(),['Units 1–2','Units 3+']);
      assert.deepEqual(await root.locator('.ds-cost-cell strong').allTextContents(),['75 pts','85 pts']);
    }
  }
  for(const [id,name]of [['unit-tech-priest-dominus','dominus-normal'],['unit-servitor-battleclade','servitor-battleclade']]){
    await open(page,id);await page.screenshot({path:path.join(out,`${device}-${name}.png`),fullPage:true});
  }
  await importRoster(page,amText,'parsed-unit-2');await clean(page);
  assert.match(await page.locator('.ds-roster-context').innerText(),/Cognitive Reinforcement/);
  assert.match(await page.locator('.ds-roster-context').innerText(),/Leading: Servitor Battleclade/);
  assert.match(await page.locator('main .unit-card').innerText(),/Feel No Pain\s*5\+/i);
  assert.equal(await page.locator('main [data-datasheet-section="keywords"] b').first().innerText(),'Keywords');
  for(const id of ['datasheet-tech-priest-dominus:weapon:5','datasheet-tech-priest-dominus:weapon:6']){
    const row=page.locator(`main .weapon-row[data-card-id="${id}"]`);
    assert.equal(await row.locator('[data-label="BS"],[data-label="WS"]').innerText(),'2+\n3+ − 1');
  }
  const ranged=page.locator('main .weapon-row[data-card-id="datasheet-tech-priest-dominus:weapon:5"]');
  assert.match(await ranged.innerText(),/HEAVY/);assert.match(await ranged.innerText(),/ASSAULT/);
  await page.screenshot({path:path.join(out,`${device}-dominus-personal.png`),fullPage:true});
  await context.close();

  // Exact frozen-base DG text, geometry and pixel comparisons, normal + mega.
  const contexts=[],pages=[];
  for(const old of [true,false]){
    const ctx=await browser.newContext({viewport,reducedMotion:'reduce'}),p=await ctx.newPage();
    p.on('pageerror',error=>errors.push(error.message));
    await p.goto(origin+(old?'/baseline/books/death-guard/v2/app.html':'/v2/app.html?v2=ARMY_BOOK&book=death-guard&registry=death-guard'));await ready(p);contexts.push(ctx);pages.push(p);
  }
  for(const surface of ['unit-lord-of-contagion','unit-deathshroud-terminators','personal-lord']){
    for(const p of pages){if(surface==='personal-lord')await importRoster(p,dgText,'parsed-unit-2');else await open(p,surface);}
    const observations=await Promise.all(pages.map(p=>p.locator('main .unit-card').evaluate(root=>({text:root.innerText,
      facts:[...root.querySelectorAll('[data-fact-id]')].map(n=>[n.dataset.factId,n.dataset.factValue]),
      boxes:[...root.querySelectorAll('*')].filter(n=>n.getClientRects().length).map(n=>{const r=n.getBoundingClientRect();return [n.tagName,n.className,...[r.x,r.y,r.width,r.height].map(v=>Math.round(v*100))];})}))));
    assert.deepEqual(observations[1],observations[0],`DG changed: ${device}/${surface}`);
    const images=await Promise.all(pages.map(p=>p.screenshot({animations:'disabled',fullPage:true})));
    const [a,b]=images.map(value=>PNG.sync.read(value));assert.equal(a.width,b.width);assert.equal(a.height,b.height);
    let delta=0,count=0;for(let i=0;i<a.data.length;i+=4){let d=0;for(let j=0;j<4;j++)d=Math.max(d,Math.abs(a.data[i+j]-b.data[i+j]));delta=Math.max(delta,d);if(d)count++;}
    assert.ok(delta<=2&&count/(a.width*a.height)<.01,`DG visual change ${device}/${surface}`);
  }
  for(const ctx of contexts)await ctx.close();
  results.push({device,normalDatasheets:34,sourceParagraphs:'PRESERVED',tieredPoints:'PRESERVED',diagnostics:0,duplicateAttachmentLists:0,
    baseInWeapons:0,effectiveValues:'PASS',mixedProfiles:'PASS',dgPresentation:'UNCHANGED'});
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({baseline,results},null,2));
 console.log(JSON.stringify({status:'PASS',results,screenshots:out}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
