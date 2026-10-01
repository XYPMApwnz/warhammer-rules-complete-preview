import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:http';
import {launchChromium} from '../helpers/browser-launch.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const server=createServer((request,response)=>{
  try{
    let file=path.resolve(root,'.'+new URL(request.url,'http://localhost').pathname);
    assert.ok(file.startsWith(root+path.sep));
    if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    response.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
    response.setHeader('Cache-Control','no-store');response.end(fs.readFileSync(file));
  }catch{response.writeHead(404);response.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`,key='wh40k-rosters-v1',errors=[];
const sourceText=detailed=>`+ FACTION KEYWORD: T'au Empire
+ BATTLE SIZE: Strike Force (2000 Point limit)
+ TOTAL ARMY POINTS: 470pts
20x Kroot Carnivores (135 pts)${detailed?'\n• 1x Long-quill\n• 19x Kroot Carnivore':''}
10x Kroot Carnivores (65 pts)${detailed?'\n• 1x Long-quill\n• 9x Kroot Carnivore':''}
1x Kroot War Shaper (75 pts)
1x Kroot War Shaper (75 pts)
1x Kroot Trail Shaper (60 pts)
1x Kroot Flesh Shaper (60 pts)`;
const expected={'parsed-unit-1':['parsed-unit-3','parsed-unit-5']};
const stored=page=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'[]')[0],key);
const editor=(page,body)=>page.locator(`select[data-attachment-bodyguard="${body}"]`);
async function selectCharacter(page,body,leader){
  const select=editor(page,body).filter({has:page.locator(`option[value="${leader}"]`)});
  await select.selectOption(leader);
}
const verify=async page=>assert.deepEqual((await stored(page)).attachments,expected);
async function reader(page){
  await page.locator('[data-open-roster]').click();
  await page.waitForFunction(()=>Boolean(window.WH_ARMY_ROSTER_PROJECTION));
  const projected=await page.evaluate(()=>{
    const projection=window.WH_ARMY_ROSTER_PROJECTION;
    return {attachments:projection.attachmentState.attachments,counts:projection.game.units.slice(0,2).map(unit=>unit.selection.modelCount.value),leaders:projection.game.units[0].attachments.leaders.map(unit=>unit.instanceId)};
  });
  assert.deepEqual(projected,{attachments:expected,counts:[20,10],leaders:expected['parsed-unit-1']});
}
let browser;
try{
  browser=await launchChromium();
  for(const detailed of [false,true]){
    const context=await browser.newContext({serviceWorkers:'block',acceptDownloads:true});
    const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
    await page.goto(origin+'/roster-guides/index.html');
    await page.locator('#roster-input').fill(sourceText(detailed));
    await page.locator('#roster-form button[type="submit"]').click();
    await selectCharacter(page,'parsed-unit-1','parsed-unit-3');
    assert.equal(await editor(page,'parsed-unit-1').locator('option[value="parsed-unit-4"]').count(),0,'Same canonical Leader remains illegal');
    await selectCharacter(page,'parsed-unit-1','parsed-unit-5');await verify(page);
    assert.equal(await editor(page,'parsed-unit-1').locator('option[value="parsed-unit-6"]').count(),0,'Third Leader remains illegal');
    assert.equal(await editor(page,'parsed-unit-2').locator('option[value="parsed-unit-3"]').count(),0,'Physical Leader cannot join both Bodyguards');
    await selectCharacter(page,'parsed-unit-2','parsed-unit-4');
    assert.equal(await editor(page,'parsed-unit-2').locator('option[value="parsed-unit-6"]').count(),0,'Below threshold remains one Leader');
    await selectCharacter(page,'parsed-unit-2','remove:parsed-unit-4');await verify(page);
    await selectCharacter(page,'parsed-unit-1','remove:parsed-unit-5');
    await selectCharacter(page,'parsed-unit-1','parsed-unit-5');await verify(page);
    await page.reload();await page.locator('[data-edit-attachments]').click();await verify(page);
    assert.equal(await editor(page,'parsed-unit-1').locator('option[value="parsed-unit-5"]').count(),1,'Reload retains legal second Leader');
    const downloading=page.waitForEvent('download');await page.locator('[data-export-roster]').click();
    const stream=await(await downloading).createReadStream(),chunks=[];for await(const chunk of stream)chunks.push(chunk);
    const backup=Buffer.concat(chunks);assert.deepEqual(JSON.parse(backup.toString()).attachments,expected);
    await reader(page);await context.close();
    const fresh=await browser.newContext({serviceWorkers:'block'}),restored=await fresh.newPage();
    restored.on('pageerror',error=>errors.push(error.message));
    await restored.goto(origin+'/roster-guides/index.html');
    await restored.locator('#import-roster-file').setInputFiles({name:'starting-strength.json',mimeType:'application/json',buffer:backup});
    await restored.locator('[data-edit-attachments]').click();await verify(restored);
    assert.equal((await stored(restored)).sourceText,sourceText(detailed));
    await selectCharacter(restored,'parsed-unit-1','remove:parsed-unit-5');
    await selectCharacter(restored,'parsed-unit-1','parsed-unit-5');await verify(restored);
    await reader(restored);await fresh.close();
    console.log(`PASS ${detailed?'detailed 1+19':'aggregate 20'}: UI attachment legality, negatives, physical isolation, detach/re-attach, reload, backup and effective reader`);
  }
  assert.deepEqual(errors,[]);
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
