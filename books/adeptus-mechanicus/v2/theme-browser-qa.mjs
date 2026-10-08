import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

// Frozen pre-theme product: compare real rendered geometry and DG pixels,
// rather than accepting shared class names as proof of presentation parity.
const baseline=process.env.ARMY_THEME_BASE||'1be5802405c92d4295a3caa9ede6e97f649d42a0';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const out=process.env.ARMY_APP_V2_SCREENSHOTS||fs.mkdtempSync(path.join(os.tmpdir(),'army-theme-'));
fs.mkdirSync(out,{recursive:true});
const changed=new Set(execFileSync('git',['diff','--name-only','--diff-filter=M',baseline,'--'],{cwd:repo,encoding:'utf8'}).trim().split(/\r?\n/));
const originals=new Map([...changed].filter(name=>name&&!name.endsWith('theme-browser-qa.mjs')).map(name=>[name,
  execFileSync('git',['show',`${baseline}:${name}`],{cwd:repo,maxBuffer:30e6})]));
const reads=[],errors=[],missing=[],results=[];
const server=http.createServer((request,response)=>{
  let url=decodeURI(new URL(request.url,'http://localhost').pathname),old=url.startsWith('/baseline/');
  if(old)url=url.slice('/baseline'.length);
  const name=url.slice(1),file=path.resolve(repo,name);
  reads.push({old,url});
  if(!file.startsWith(repo+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){if(url!=='/favicon.ico')missing.push(url);response.writeHead(404);response.end();return;}
  response.writeHead(200,{'Content-Type':({'.html':'text/html','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'image/jpeg','Cache-Control':'no-store'});
  response.end(old&&originals.has(name)?originals.get(name):fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const {chromium}=createRequire(import.meta.url)('playwright');
const {PNG}=createRequire(import.meta.url)('pngjs');
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const amText=`+ FACTION KEYWORD: Imperium - Adeptus Mechanicus
+ DETACHMENT: Haloscreed Battle Clade, Lords of the Forge
Char1: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe
Enhancement: Cognitive Reinforcement
Char2: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe
Enhancement: TL-4Ø9
9x Servitor Battleclade (110 pts)
• 1x Servitor Underseer: Mechanicus pistol, Dataspikes
• 2x Gun Servitor: 2 with Heavy arc rifle, Servo-claw
• 6x Combat Servitor: 6 with Phosphor blaster, Servo-claw
10x Skitarii Rangers (85 pts): 10x Galvanic rifle, 10x Close combat weapon`;
const dgText=`+ FACTION KEYWORD: Chaos - Death Guard
+ DETACHMENT: Paragons of Putrescence, Virulent Vectorium
Char1: 1x Lord of Contagion (135 pts): Manreaper
Enhancement: Furnace of Plagues (+25 pts)
3x Deathshroud Terminators (150 pts)
• 1x Deathshroud Terminator Champion: Manreaper, Plaguespurt gauntlet
• 2x Deathshroud Terminator: 2 with Manreaper, Plaguespurt gauntlet`;
const ready=async page=>{
  await page.waitForFunction(()=>!!window.ArmyBookAppV2?.rosterPanel);
  await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);
  await page.waitForFunction(()=>[...document.styleSheets].some(sheet=>sheet.href?.endsWith('popup-v1.css')));
};
const settled=async page=>{
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(image=>image.decode().catch(()=>{})));});
  await page.waitForTimeout(220);
};
const open=async(page,id)=>{await page.evaluate(id=>window.ArmyBookAppV2.open(id),id);await settled(page);};
const observation=async page=>page.evaluate(()=>{
  const scope=document.querySelector('dialog[open]')||document.querySelector('main');
  return {text:scope.innerText,facts:[...scope.querySelectorAll('[data-fact-id]')].map(n=>[n.dataset.factId,n.dataset.factValue]),
    boxes:[...scope.querySelectorAll('*')].filter(n=>n.tagName!=='STYLE'&&n.getClientRects().length).map(n=>{
      const r=n.getBoundingClientRect();return [n.tagName,n.className,Math.round(r.x*100),Math.round(r.y*100),Math.round(r.width*100),Math.round(r.height*100)];
    }),width:innerWidth,scrollWidth:document.documentElement.scrollWidth};
});
const paint=async(page,selector)=>page.locator(selector).first().evaluate(n=>{
  const s=getComputedStyle(n);return {ink:s.color,background:s.backgroundColor,accent:s.getPropertyValue('--green').trim()||s.getPropertyValue('--v2-green').trim()||s.getPropertyValue('--v1-nav-green').trim()};
});
try{
 for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
  for(const book of ['adeptus-mechanicus','death-guard']){
   const am=book==='adeptus-mechanicus',contexts=[],pages=[],readStart=reads.length;
   for(const old of [true,false]){
    const context=await browser.newContext({viewport,reducedMotion:'reduce',hasTouch:device==='phone'});
    const page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',error=>errors.push({device,book,old,error:error.message}));
    await page.goto(origin+(old?'/baseline':'')+`/books/${book}/v2/app.html`);await ready(page);await settled(page);
    contexts.push(context);pages.push(page);
   }
   const capture=async(name,selector,{layout=true}={})=>{
    const fullPage=!['army-book','popup','related-rules'].includes(name);
    if(fullPage)for(const page of pages)await page.evaluate(()=>{document.activeElement?.blur();scrollTo({top:0,behavior:'instant'});});
    for(const page of pages)await settled(page);
    const observations=await Promise.all(pages.map(observation));
    assert.deepEqual(observations[1].facts,observations[0].facts,`${book}/${name}: factual output changed`);
    assert.equal(observations[1].text,observations[0].text,`${book}/${name}: player text changed`);
    if(layout)assert.deepEqual(observations[1].boxes,observations[0].boxes,`${book}/${name}: layout changed`);
    assert.ok(observations[1].scrollWidth<=viewport.width+1,`${book}/${name}: horizontal overflow`);
    const filename=`${am?'admech':'dg'}-${device}-${name}.png`;
    const current=await pages[1].screenshot({path:path.join(out,filename),animations:'disabled',fullPage});
    let pixelDifference=null;
    if(!am){const old=await pages[0].screenshot({path:path.join(out,`baseline-${filename}`),animations:'disabled',fullPage});
      if(!current.equals(old)){
        const styles=await Promise.all(pages.map(page=>page.evaluate(()=>[...document.querySelectorAll('*')].filter(n=>n.getClientRects().length).map(n=>{
          return [n.tagName,n.className,...['','::before','::after'].flatMap(pseudo=>{
            const s=getComputedStyle(n,pseudo);return ['content','color','background','borderColor','boxShadow','filter','outline'].map(p=>s[p]);
          })];
        }))));
        assert.deepEqual(styles[1],styles[0],`${book}/${device}/${name}: DG computed paint changed`);
        const a=PNG.sync.read(old),b=PNG.sync.read(current);assert.equal(a.width,b.width);assert.equal(a.height,b.height);
        let maxChannelDelta=0,differentPixels=0;
        for(let i=0;i<a.data.length;i+=4){let delta=0;for(let j=0;j<4;j++)delta=Math.max(delta,Math.abs(a.data[i+j]-b.data[i+j]));maxChannelDelta=Math.max(maxChannelDelta,delta);if(delta)differentPixels++;}
        pixelDifference={maxChannelDelta,differentPixels,totalPixels:a.width*a.height};
        // Chromium may round blended gradients by up to two channel values across
        // otherwise identical paints. Never allow geometry/text/paint changes.
        assert.ok(maxChannelDelta<=2&&differentPixels/(a.width*a.height)<.01,`${book}/${device}/${name}: DG pixels changed`);
      }
    }
    const colors=await paint(pages[1],selector);
    if(am&&colors.accent)assert.ok(colors.accent.includes('#8cbcff'),`${name}: inherited faction accent ${colors.accent}`);
    results.push({device,book,surface:name,layout:layout?'UNCHANGED':'EXISTING_COVER_LAYOUT',dgPixels:am?'N/A':pixelDifference?'GRADIENT_ROUNDING_ONLY':'IDENTICAL',pixelDifference,colors,screenshot:path.join(out,filename)});
   };
   await capture('army-book','.v2-hero',{layout:!am});
   if(am){
    assert.ok(await pages[1].locator('.v2-brand-mark').evaluate(n=>getComputedStyle(n).backgroundImage.includes('mechanicus-logo.png')),'Missing book emblem');
    assert.ok(await pages[1].locator('.toc-heading').evaluate(n=>getComputedStyle(n,'::before').content.includes('MARS')),'Inherited legion decoration');
    for(const id of ['army-rule-doctrina-imperatives','detachment-haloscreed-battle-clade','detachment-haloscreed-battle-clade:enhancement:2']){
      for(const page of pages)await open(page,id);
      await capture(id.replaceAll(':','-'),'main .v2-book-record');
    }
   }
   for(const page of pages)await open(page,am?'unit-tech-priest-dominus':'unit-lord-of-contagion');
   await capture('datasheet','main .unit-card');
   for(const page of pages)await open(page,am?'unit-servitor-battleclade':'unit-deathshroud-terminators');
   await capture('mixed-profile','main .unit-card');
   if(am)for(const page of pages)assert.ok(await page.locator('main .model-profile').count()>1,'Mixed profiles were flattened');
   for(const page of pages){await page.locator('main .weapon-button').first().click();await page.waitForSelector('dialog.v2-detail-dialog[open]');}
   await capture('popup','dialog.v2-detail-dialog[open]');
   for(const page of pages){await page.keyboard.press('Escape');await page.locator('main .ds-related-rules-button').click();await page.waitForSelector('dialog.v2-related-dialog[open]');}
   await capture('related-rules','dialog.v2-related-dialog[open]');
   for(const page of pages){await page.keyboard.press('Escape');await page.evaluate(()=>window.ArmyBookAppV2.openGlossary());await page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill('Deep Strike');}
   await capture('glossary','main .v2-glossary');
   for(const page of pages){
    await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
    await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(am?amText:dgText);
    await page.locator('[data-roster-action="review-import"]').click();
    await page.waitForFunction(count=>window.ArmyBookAppV2.roster.state?.units.length===count,am?4:2);
    assert.equal(await page.locator('[data-roster-bindings] select').count(),0,'Unexpected manual identity reconstruction');
    const receiving=am?'parsed-unit-3':'parsed-unit-2';
    await page.locator(`[data-attachment-candidate-for="${receiving}"]`).selectOption('parsed-unit-1');
    await page.locator(`[data-attachment-target-instance-id="${receiving}"] [data-roster-action="attach"]`).click();
   }
   await capture('roster-setup','main .v2-roster');
   for(const page of pages){await page.locator('[data-roster-action="open-personal-guide"]').click();await page.evaluate(()=>window.ArmyBookAppV2.openInstance('parsed-unit-1'));}
   await capture('personal-guide','main .unit-card');
   if(am){
    for(const page of pages){await page.locator('main .weapon-button').first().click();await page.waitForSelector('dialog.v2-detail-dialog[open]');}
    await capture('effective-popup','dialog.v2-detail-dialog[open]');
    const requests=reads.slice(readStart).filter(r=>!r.old).map(r=>r.url);
    // All assets used by this book are local faction or neutral shared assets.
    assert.ok(!requests.some(url=>url.includes('/death-guard/')),'Death Guard asset requested by AdMech');
   }
   for(const context of contexts)await context.close();
  }
 }
 assert.deepEqual(errors,[],'Uncaught browser error');
 assert.deepEqual(missing,[],'Missing local theme asset/dependency');
 fs.writeFileSync(path.join(out,'theme-results.json'),JSON.stringify({baseline,results,errors},null,2));
 console.log(JSON.stringify({status:'PASS',surfaces:results.length,dgPixelComparisons:results.filter(r=>r.book==='death-guard').length,admechLayoutComparisons:results.filter(r=>r.book==='adeptus-mechanicus'&&r.layout==='UNCHANGED').length,output:out}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
