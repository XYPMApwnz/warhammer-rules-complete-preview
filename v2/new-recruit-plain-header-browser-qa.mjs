/** The owner's exact v37.15 export, pasted and persisted through player UI. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),out=createQaEvidenceDir('wh-plain-header-browser-');
const text=fs.readFileSync(new URL('./fixtures/new-recruit-v37.15-owner-death-guard.txt',import.meta.url),'utf8');
const allowed=new Set(JSON.parse(fs.readFileSync(path.join(root,'tools/pages-runtime-manifest.json'))).files.map(row=>'/'+row.path));
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
const errors=[],missing=[],results=[];
const server=http.createServer((request,response)=>{
 const address=decodeURIComponent(new URL(request.url,'http://local').pathname),file=path.resolve(root,'.'+address);
 if(address==='/favicon.ico'){response.writeHead(204).end();return;}
 if(!file.startsWith(path.resolve(root)+path.sep)||!allowed.has(address)&&!isApplicationTestDependency(address)||!fs.existsSync(file)){
  missing.push(address);response.writeHead(404).end();return;
 }
 response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
async function openRoster(page){
 await page.goto(origin+'/v2/app.html');await page.locator('[data-v2-book="death-guard"]').click();
 await page.waitForFunction(()=>window.ArmyBookAppV2?.roster);
 await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();
 await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();
}
async function inspect(page){
 assert.equal(await page.locator('.v2-roster-instance').count(),9,'Nine actual roster articles');
 const rows=page.locator('[data-roster-detachments] li');assert.equal(await rows.count(),2);
 assert.deepEqual(await rows.evaluateAll(nodes=>nodes.map(node=>node.dataset.canonicalDetachmentId)),['detachment-contagion-engines','detachment-paragons-of-putrescence']);
 assert.deepEqual(await rows.allTextContents(),['Contagion Engines','Paragons of Putrescence']);
 for(const item of await rows.all())assert(await item.isVisible(),'Each selected Detachment is rendered');
 const state=await page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());
 assert.equal(state.units.length,9);assert.equal(state.warlordInstanceId,'parsed-unit-2');assert.equal(state.units[1].canonicalUnitId,'unit-lord-of-contagion');
 assert.equal(state.units[3].startingStrength,10);assert.equal(state.units[5].startingStrength,3);assert.equal(state.attachments.length,0);
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('army-book-app-v2:roster:death-guard')));
 assert.deepEqual(saved,state,'Import is actually saved in browser storage');return state;
}
let browser,completed=false;
try{
 browser=await launchChromium();
 for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage();
  context.setDefaultTimeout(20000);page.on('pageerror',error=>errors.push(error.message));
  try{
   await openRoster(page);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
   await page.locator('[data-roster-action="review-import"]').click();
   await page.waitForFunction(()=>document.querySelector('.v2-roster-status')?.textContent.startsWith('Roster imported.'));
   const original=await inspect(page);
   await page.locator('[data-roster-detachments]').scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(out,device+'-owner-import.png'),fullPage:true});
   await openRoster(page);await page.waitForFunction(()=>window.ArmyBookAppV2?.roster?.state?.units.length===9);
   assert.deepEqual(await inspect(page),original,'Saved physical state survives reopening');
   results.push({device,status:'PASS',units:9,detachments:original.detachmentIds,warlord:'unit-lord-of-contagion',attachments:0,savedAndRestored:true});
   console.log('PASS '+device+' exact owner export, two visible detachments, nine saved/restored units');
  }catch(error){await page.screenshot({path:path.join(out,device+'-failure.png')}).catch(()=>{});throw error;}
  finally{await context.close();}
 }
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);completed=true;
}finally{
 fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:completed?'PASS':'FAIL',results,errors,missing},null,2)+'\n');
 if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
}
