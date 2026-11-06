/** Real import controls and saved MODEL identities, desktop and mobile. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),out=createQaEvidenceDir('wh-model-names-browser-');
const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/new-recruit-model-names.json',import.meta.url)));
const cases=['assault-sergeant','death-company','fire-warrior'].map(id=>fixture.cases.find(c=>c.id===id));
cases.unshift({id:'derived-tournament',bookId:'chaos-space-marines',text:fs.readFileSync(new URL('./fixtures/new-recruit-model-names-tournament-csm.txt',import.meta.url),'utf8'),unitCount:13});
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
async function open(page,bookId){
 await page.goto(origin+'/v2/app.html');await page.locator(`[data-v2-book="${bookId}"]`).click();
 await page.waitForFunction(()=>window.ArmyBookAppV2?.roster);
 await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();
 await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();
}
let browser,completed=false;
try{
 browser=await launchChromium();
 for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]])for(const c of cases){
  const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage();
  context.setDefaultTimeout(20000);page.on('pageerror',error=>errors.push(error.message));
  try{
   await open(page,c.bookId);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(c.text);
   await page.locator('[data-roster-action="review-import"]').click();
   await page.waitForFunction(()=>document.querySelector('.v2-roster-status')?.textContent.startsWith('Roster imported.'));
   const state=await page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());
   assert.equal(state.units.length,c.unitCount||1);assert.equal(state.attachments.length,0);
   assert.equal(await page.locator('.v2-roster-instance').count(),state.units.length);
   if(c.expectedProfiles)assert.deepEqual(state.units[0].modelRows.map(m=>m.canonicalProfileId),c.expectedProfiles);
   assert.deepEqual(await page.evaluate(bookId=>JSON.parse(localStorage.getItem('army-book-app-v2:roster:'+bookId)),c.bookId),state);
   await page.screenshot({path:path.join(out,device+'-'+c.id+'.png')});
   await open(page,c.bookId);assert.deepEqual(await page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot()),state,'Saved MODEL choices survive reopening');
   results.push({device,id:c.id,bookId:c.bookId,status:'PASS',units:state.units.length,profileIds:state.units.flatMap(u=>u.modelRows.map(m=>m.canonicalProfileId))});
   console.log('PASS '+device+' '+c.id+' UI import and saved physical models');
  }catch(error){await page.screenshot({path:path.join(out,device+'-'+c.id+'-failure.png')}).catch(()=>{});throw error;}
  finally{await context.close();}
 }
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);completed=true;
}finally{
 fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:completed?'PASS':'FAIL',results,errors,missing},null,2)+'\n');
 if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
}
