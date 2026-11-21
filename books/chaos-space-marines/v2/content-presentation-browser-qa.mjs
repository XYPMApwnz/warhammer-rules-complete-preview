import {launchQaBrowser} from '../../../tests/helpers/qa-browser.cjs';
/** The seven audited normal-book presentation occurrences, in the real V2 app. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=fileURLToPath(new URL('../../../',import.meta.url));
const out=process.env.ARMY_APP_V2_SCREENSHOTS;
if(out)fs.mkdirSync(out,{recursive:true});
const mime={'.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
const server=http.createServer((request,response)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(request.url,'http://local').pathname));
  if(!file.startsWith(root)||!fs.existsSync(file)||!fs.statSync(file).isFile()){response.writeHead(404).end();return;}
  response.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');response.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}/v2/app.html?v2=ARMY_BOOK&registry=chaos-space-marines`;
const browser=await launchQaBrowser(chromium,{headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const errors=[],results=[];
try{
  for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
    const page=await browser.newPage({viewport});page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base);await page.waitForSelector('main .v1-contents-pages');
    const card=id=>page.locator(`main [data-card-id="${id}"]`).first();
    const nightmare=card('detachment-nightmare-hunt').locator('.detachment-qualifiers');
    assert.match(await nightmare.innerText(),/Unique: NIGHTMARE/);
    for(const id of ['unit-master-of-executions','unit-masters-of-the-maelstrom']){
      assert.equal(await card(id).locator('[data-datasheet-section="leader"] h4').innerText(),'Support');
    }
    const composition=card('unit-masters-of-the-maelstrom').locator('[data-datasheet-section="composition"]');
    const bases=await composition.locator('[data-fact-id*="::/text"]').allTextContents();
    const exceptional=bases.find(text=>text.includes('The Enforcer:'));
    assert.match(exceptional,/Captain Sargotta: ⌀40mm; The Enforcer: ⌀32mm/);
    assert.doesNotMatch(await composition.innerText(),/40mmThe Enforcer/);
    const deceptors=card('detachment-deceptors:rule');
    const geometry=await deceptors.locator('.source-fact-table').evaluate(table=>{
      const r=table.rows,rect=cell=>{const b=cell.getBoundingClientRect();return {x:b.x,right:b.right,bottom:b.bottom};};
      return {rowSpan:r[0].cells[0].rowSpan,colSpan:r[0].cells[1].colSpan,
        battle:rect(r[0].cells[0]),number:rect(r[0].cells[1]),legionaries:rect(r[1].cells[0]),cultists:rect(r[1].cells[1]),
        left:rect(r[2].cells[1]),right:rect(r[2].cells[2])};
    });
    assert.equal(geometry.rowSpan,2);assert.equal(geometry.colSpan,2);
    const close=(a,b)=>assert.ok(Math.abs(a-b)<1,'Source table header/value scope');
    close(geometry.legionaries.x,geometry.left.x);close(geometry.cultists.x,geometry.right.x);
    close(geometry.number.x,geometry.legionaries.x);close(geometry.number.right,geometry.cultists.right);
    close(geometry.battle.bottom,geometry.legionaries.bottom);
    const tyrannical=card('detachment-huron-s-marauders:rule');
    const choices=await tyrannical.locator('[data-fact-id*="::/rows/0/0"]').allTextContents();
    assert.ok(choices.some(text=>/^Huron’s Elite\n\nHand-picked[\s\S]+\n\nEach time/.test(text)));
    assert.ok(choices.some(text=>/^Mobile Marauders\n\nThe Red Corsairs[\s\S]+\n\nThis unit[\s\S]+\n\nDesigner’s Note:/.test(text)));
    assert.doesNotMatch(await tyrannical.innerText(),/EliteHand-picked|MaraudersThe Red|arms\.Each time|aggression\.This unit|Back\.Designer/);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    if(out){
      for(const [name,area]of [['nightmare-hunt',card('detachment-nightmare-hunt').locator('.detachment-title').locator('..')],
        ['master-of-executions-support',card('unit-master-of-executions').locator('[data-datasheet-section="leader"]')],
        ['masters-of-maelstrom-support',card('unit-masters-of-the-maelstrom').locator('[data-datasheet-section="leader"]')],
        ['masters-of-maelstrom-bases',composition],['deceptors-header',deceptors],['tyrannical-blocks',tyrannical]]){
        // The qualifier header needs a compact crop rather than the entire Detachment.
        if(name==='nightmare-hunt'){
          const heading=card('detachment-nightmare-hunt').locator('.detachment-title');await heading.scrollIntoViewIfNeeded();
          const box=await heading.boundingBox();await page.screenshot({path:path.join(out,`${name}-${device}.png`),clip:{x:Math.max(0,box.x),y:Math.max(0,box.y),width:Math.min(box.width,viewport.width),height:Math.min(190,viewport.height-box.y)}});
        }else await area.screenshot({path:path.join(out,`${name}-${device}.png`)});
      }
    }
    // Normal route and direct/reloaded route must expose the same corrected fields.
    for(const id of ['detachment-nightmare-hunt','unit-master-of-executions','unit-masters-of-the-maelstrom','detachment-deceptors:rule','detachment-huron-s-marauders:rule']){
      const expected=await card(id).innerText();await page.goto(base+'#'+encodeURIComponent(id));await page.waitForSelector(`main [data-card-id="${id}"]`);
      assert.equal(await card(id).innerText(),expected);await page.reload();await page.waitForSelector(`main [data-card-id="${id}"]`);assert.equal(await card(id).innerText(),expected);
    }
    results.push({device,confirmedOccurrences:7,geometry,overflow:false,directReload:'PASS'});await page.close();
  }
  assert.deepEqual(errors,[]);if(out)fs.writeFileSync(path.join(out,'content-presentation-browser.json'),JSON.stringify(results,null,2)+'\n');
  console.log(JSON.stringify({status:'PASS',viewports:2,confirmedOccurrences:7,errors}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
