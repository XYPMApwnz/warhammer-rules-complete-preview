/** Player-authored cosmetics requirements; the same assertions reject the base.
 * Inputs use the ordinary UI. Evaluation reads DOM/state only. */
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';
import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';
const own=fileURLToPath(new URL('../',import.meta.url)),arg=name=>process.argv.find(a=>a.startsWith(name+'='))?.slice(name.length+1);
const root=path.resolve(arg('--root')||own),negative=process.argv.includes('--negative-control');
const out=arg('--out')||createQaEvidenceDir('wh-cards-cosmetics-');fs.mkdirSync(out,{recursive:true});
const headerFixtures=JSON.parse(fs.readFileSync(path.join(own,'v2/fixtures/new-recruit-plain-header.json'))).derived;
const ownerDG=fs.readFileSync(path.join(own,'v2/fixtures/new-recruit-v37.15-owner-death-guard.txt'),'utf8');
const books=['adeptus-mechanicus','blood-angels','dark-angels','chaos-space-marines','death-guard','emperors-children','space-marines','tau-empire','tyranids'];
const textFor=book=>book==='death-guard'?ownerDG:book==='tau-empire'?headerFixtures.find(c=>c.bookId===book).plainText:
 ['space-marines','blood-angels','dark-angels'].includes(book)?
 `Cosmetic fixture (2000 Points)\n\n${{'space-marines':'Space Marines','blood-angels':'Blood Angels','dark-angels':'Dark Angels'}[book]}\nGravis Linebreaker Force (1 Detachment Point)\n\n1x Captain in Gravis Armour (0 pts)\nEnhancement: Relentless Advance (+0 pts)\n5x Heavy Intercessor Squad (0 pts)\n• 1x Heavy Intercessor Sergeant\n• 4x Heavy Intercessor\n`:
 headerFixtures.find(c=>c.bookId===book).plainText;
const allowed=new Set(JSON.parse(fs.readFileSync(path.join(root,'tools/pages-runtime-manifest.json'))).files.map(r=>'/'+r.path));
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
const errors=[],missing=[],rows=[],observations=[],screenshots=[];
const server=http.createServer((req,res)=>{const address=decodeURIComponent(new URL(req.url,'http://local').pathname),file=path.resolve(root,'.'+address);
 if(address==='/favicon.ico'){res.writeHead(204).end();return;}
 if(!file.startsWith(root+path.sep)||!allowed.has(address)&&!isApplicationTestDependency(address)||!fs.existsSync(file)){missing.push(address);res.writeHead(404).end();return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(fs.readFileSync(file));});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const roster=async page=>{await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();};
async function imported(page,text){await roster(page);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);await page.locator('[data-roster-action="review-import"]').click();
 await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
 const replace=page.locator('[data-roster-action="confirm-replace-roster"]');if(await replace.isVisible())await replace.click();
 await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
 assert.match(await page.locator('.v2-roster-status').innerText(),/^Roster imported\./,'Fixture must import through ordinary controls');}
async function effective(page,id){await roster(page);await page.locator(`[data-roster-instance-id="${id}"]`).getByRole('button',{name:'Effective datasheet',exact:true}).click();
 const card=page.locator(`main .unit-card[data-roster-instance-id="${id}"]`);await card.waitFor();await page.evaluate(()=>document.fonts.ready);
 await page.waitForFunction(()=>Boolean(document.querySelector('main .unit-card.ds-layout')));return card;}
async function shot(page,node,id){
 await (id.startsWith('p1-')?node.locator('h2').first():node).scrollIntoViewIfNeeded();await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const file=path.join(out,id+'.png');await page.screenshot({path:file,fullPage:false});screenshots.push({id,file});}
async function check(item,book,width,fn){try{await fn();rows.push({item,book,width,status:'PASS'});}catch(e){rows.push({item,book,width,status:'FAIL',error:e.message});if(!negative)throw e;}}
async function game(page,book,width){const value=await page.evaluate(()=>{const r=window.ArmyBookAppV2.roster;return {state:r.snapshot(),projection:r.projection,points:r.points,effective:r.state.units.map(u=>r.effective(u.instanceId))};});
 observations.push({book,width,sha256:createHash('sha256').update(JSON.stringify(value)).digest('hex'),value});}
let browser,complete=false;
try{
 browser=await launchChromium();
 for(const book of books.filter(b=>!arg('--book')||b===arg('--book'))){
  console.log('RUN cosmetics '+book);
  const context=await browser.newContext({viewport:{width:1200,height:1000},serviceWorkers:'block'}),page=await context.newPage();context.setDefaultTimeout(25000);page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(origin+'/v2/app.html');await page.locator(`[data-v2-book="${book}"]`).click();await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.roster));
   await imported(page,textFor(book));
   if(['space-marines','blood-angels','dark-angels'].includes(book)){
    await page.locator('[data-attachment-candidate-for="parsed-unit-2"]').selectOption('parsed-unit-1');
    await page.locator('[data-attachment-target-instance-id="parsed-unit-2"] [data-roster-action="attach"]').click();
    await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state.attachments.length===1);
   }
   for(const width of [390,1200,1600]){
    await page.setViewportSize({width,height:1000});await roster(page);await game(page,book,width);
    await shot(page,page.locator('.v2-roster-pane').first(),`p1-${book}-${width}`);
    await check(1,book,width,async()=>{const text=await page.locator('.v2-roster-pane').first().innerText();assert.doesNotMatch(text,/NOT_PROVEN|\bMFM\b|source OR|constructed-input|canonical|binding/i);
     if(book==='blood-angels'){assert(text.includes('saved roster is kept'));assert(text.includes('not yet been checked against a real Blood Angels export'));assert(text.includes('any one of its listed conditions'));}
     if(book==='dark-angels'){assert(text.includes('A confirmed Dark Angels unit must be in the roster'));assert(text.includes('not yet been checked against a real Dark Angels export'));}});
    await shot(page,page.locator('.v2-roster-instance').first(),`p6-${book}-${width}`);
    await check(6,book,width,async()=>{const labels=await page.locator('.v2-roster-identity').evaluateAll(nodes=>nodes.map(n=>{const dt=[...n.querySelectorAll('dt')].find(x=>x.textContent==='Warlord');return dt?.nextElementSibling?.textContent;}));
     if(book==='death-guard')assert.deepEqual(labels,['No','Yes','No','No','No','No','No','No','No']);else assert(labels.length&&labels.every(x=>x==='Not set'));});
    const first=await effective(page,'parsed-unit-1');
    await check(5,book,width,async()=>assert.equal(await first.locator('.ds-arsenal .ability').count(),0,'Datasheet abilities must stay out of Weapons in every book'));
    await check(2,book,width,async()=>{const lists=await first.locator('[data-datasheet-section="keywords"] > p:not(.ds-keyword-source)').allTextContents();assert(lists.length);for(const list of lists)assert(!list.includes('Source:'),'Keyword list precedes separate source notes');});
    const conditional=first.locator('[data-datasheet-section="conditional-policies"]');
    if(await conditional.count()){
     await shot(page,conditional,`p3-census-${book}-${width}`);
     await check(3,book,width,async()=>{const captions=await conditional.locator('p').evaluateAll(nodes=>nodes.filter(n=>n.textContent.startsWith('Source:')).map(n=>n.textContent+' / '+(n.nextElementSibling?.textContent.startsWith('Applies to:')?n.nextElementSibling.textContent:'')));assert.equal(new Set(captions).size,captions.length,'Identical source/recipient captions are not repeated in any book');});
    }
    if(book==='death-guard'){
     let card=await effective(page,'parsed-unit-1');
     await shot(page,card.locator('.ds-main-grid'),`p5-dg-${width}`);
     await check(5,book,width,async()=>{for(const name of ['Foul Infusion','Extraction of Fresh Disease']){const item=card.locator('.ability').filter({hasText:name}).first();assert(await item.count(),name);assert(await item.evaluate(n=>Boolean(n.closest('.ds-support'))),'Datasheet ability must be in Abilities column: '+name);}});
     for(const w of width===1200?[1024,1200,1440]:[width]){
      await page.setViewportSize({width:w,height:1000});await card.locator('.weapon-table').first().scrollIntoViewIfNeeded();await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      const table=card.locator('.weapon-table').first();await shot(page,table,`p4-dg-${w}`);
      await check(4,book,w,async()=>{const geometry=await card.locator('.weapon-table').evaluateAll(tables=>tables.map(t=>{const b=t.getBoundingClientRect();return {left:b.left,right:b.right,rows:[...t.querySelectorAll('.weapon-row:not(.weapon-head)')].map(row=>({cells:[...row.querySelectorAll(':scope > [data-label]')].map(c=>({label:c.dataset.label,right:c.getBoundingClientRect().right,left:c.getBoundingClientRect().left,width:c.getBoundingClientRect().width,visible:!!c.getClientRects().length&&getComputedStyle(c).visibility!=='hidden',text:c.innerText})),melee:[...row.querySelectorAll('[data-label="Range"] [data-fact-id]')].filter(s=>s.textContent==='Melee').map(s=>{const r=document.createRange();r.selectNodeContents(s);return r.getClientRects().length;})}))};}));
       for(const t of geometry)for(const r of t.rows){assert.deepEqual(r.cells.map(c=>c.label),['Range','A',r.cells[2].label,'S','AP','D']);assert(['BS','WS'].includes(r.cells[2].label));for(const c of r.cells){assert(c.visible&&c.width>0&&c.text.trim(),'Every weapon statistic must be visible');assert(c.right<=t.right+1,'Right edge of '+c.label+' must fit table');assert(c.right<=w+1,'Right edge of '+c.label+' must fit viewport');}for(const lines of r.melee)assert.equal(lines,1,'Melee must occupy one line');}});
      await check(4,book,w,async()=>{const lines=await card.locator('[data-label="Range"] [data-fact-id]').evaluateAll(nodes=>nodes.filter(n=>n.textContent==='Melee').map(n=>{const range=document.createRange();range.selectNodeContents(n);return range.getClientRects().length;}));assert(lines.length,'A melee range must be present');for(const count of lines)assert.equal(count,1,'Melee must occupy one line independently of table clipping');});
     }
     await page.setViewportSize({width,height:1000});card=await effective(page,'parsed-unit-7');const keywords=card.locator('[data-datasheet-section="keywords"]');await shot(page,keywords,`p2-dg-${width}`);
     await check(2,book,width,async()=>{const lines=await keywords.locator(':scope > p').allTextContents();assert(lines[0].includes('CONTAGION ENGINE'));assert(lines[0].includes('FLY'));assert(!lines[0].includes('Source:'));const note=keywords.locator('.ds-keyword-source').filter({hasText:'Warped and Rusted Animus'});assert(await note.count());assert((await note.innerText()).includes('Applies to: Foetid Bloat-drone'));});
    }
    if(book==='tau-empire'){
     const card=await effective(page,'parsed-unit-1'),policies=card.locator('[data-datasheet-section="conditional-policies"]');await shot(page,policies,`p3-tau-${width}`);
     await check(3,book,width,async()=>{const source=policies.locator('p').filter({hasText:/^Source: Killing Blow/});assert.equal(await source.count(),1,'One source caption per rule/recipient');const applies=policies.locator('p').filter({hasText:/^Applies to: AX-1-0 Tiger Shark/});assert.equal(await applies.count(),1,'One recipient caption per rule');});
     await shot(page,card.locator('.ds-main-grid'),`p5-tau-${width}`);
     await check(5,book,width,async()=>{const ability=card.locator('.ability').filter({hasText:'Titan Hunter'}).first();assert(await ability.count());assert(await ability.evaluate(n=>Boolean(n.closest('.ds-support'))));});
    }
    if(['space-marines','blood-angels','dark-angels'].includes(book)){
     const card=await effective(page,'parsed-unit-1'),enhancement=card.locator('[data-datasheet-section="enhancements"]');await shot(page,enhancement,`p7-${book}-${width}`);
     await check(7,book,width,async()=>{const text=await enhancement.innerText();assert(!text.includes('- Relentless Advance'));const restriction=enhancement.locator('.ds-enhancement-restriction');assert.equal(await restriction.innerText(),'GRAVIS model only.');assert(text.includes('This unit has Scouts 5".'));});
     const bodyguard=await effective(page,'parsed-unit-2'),attached=bodyguard.locator('[data-attached-rule-id="enhancement-sm-07e95c69297b4d6f"]');await shot(page,attached,`p7-attached-${book}-${width}`);
     await check(7,book,width,async()=>{const text=await attached.innerText();assert(!text.includes('- Relentless Advance'));assert.equal(await attached.locator('.ds-enhancement-restriction').innerText(),'GRAVIS model only.');assert(text.includes('This unit has Scouts 5".'));assert(text.includes('Source: Captain In Gravis Armour'));});
    }
    if(book==='emperors-children'){
     const card=await effective(page,'parsed-unit-1');await shot(page,card.locator('.ds-profile-strip'),`p8-ec-${width}`);
     await check(8,book,width,async()=>{const links=card.locator('[data-modifier-source-rule-id="datasheet-daemonettes:section:1"]');assert(await links.count(),'Executed icon modifier provenance must be visible');for(const link of await links.all())assert.equal(await link.innerText(),'Daemonic Icon');});
    }
    if(book==='chaos-space-marines'){
     const menu=page.getByRole('button',{name:'Open navigation',exact:true});
     if(!await page.getByRole('button',{name:'Full Army Book',exact:true}).isVisible())await menu.click();
     await page.getByRole('button',{name:'Full Army Book',exact:true}).click();
     if(await menu.isVisible()&&await menu.getAttribute('aria-expanded')==='true')await menu.click();
     await page.locator('main a[data-target-id="detachment-murdertalon-raiders"]').first().click();
     const rule=page.locator('main [data-card-id="detachment-murdertalon-raiders:rule"]').first();
     await rule.waitFor();await shot(page,rule,`p9-csm-${width}`);
     await check(9,book,width,async()=>{const text=await rule.innerText();assert(!text.includes('- Prey on the Weak'));assert(text.includes('- Friendly HERETIC ASTARTES INFANTRY FLY'));assert(text.includes('- When an enemy unit'));});
    }
   }
  }catch(e){await page.screenshot({path:path.join(out,book+'-setup-or-case-failure.png')}).catch(()=>{});throw e;}finally{await context.close();}
 }
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
 if(negative&&!arg('--book'))for(const item of [1,2,3,4,5,6,7,8])assert(rows.some(r=>r.item===item&&r.status==='FAIL'),'Base must fail requirement '+item);
 complete=true;
}finally{
 fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:complete?'PASS':'FAIL',mode:negative?'BASELINE_NEGATIVE_CONTROLS':'FEATURE',root,rows,errors,missing,screenshots},null,2)+'\n');
 fs.writeFileSync(path.join(out,'GAMEPLAY_OBSERVATIONS.json'),JSON.stringify(observations,null,2)+'\n');
 if(browser)await browser.close();await new Promise(r=>server.close(r));
}
console.log(JSON.stringify({status:'PASS',rows:rows.length,failures:rows.filter(r=>r.status==='FAIL').length,evidence:out}));
