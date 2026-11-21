import {createQaEvidenceDir} from '../../../tests/helpers/qa-temp.mjs';
import {launchQaBrowser} from '../../../tests/helpers/qa-browser.cjs';
/** Focused isolated SM consumer of the existing V2 reader/import UI.
 * Constructed source-backed INPUT; no application registration or state injection.
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {buildSpaceMarinesImportBook} from './roster-import-build.mjs';
import {buildGameplayPresentation} from './gameplay-presentation-build.mjs';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const out=process.env.SM_STATIC_BROWSER_OUT||createQaEvidenceDir('static-gameplay-browser-qa-');fs.mkdirSync(out,{recursive:true});
const book=buildSpaceMarinesImportBook(),payload=buildGameplayPresentation(),index=new Map(book.entities.map(row=>[row.id,row]));
const ids=['unit-sm-55f195878fab446f','unit-sm-4ff82a9b79db48da','unit-sm-8ef63e7da6444869','unit-sm-e595c56eab2f493b'];
const input='+ FACTION KEYWORD: Space Marines\n+ DETACHMENT: Shadowmark Talon\n'+ids.map(id=>{
 const members=book.importBindings.compositions.filter(row=>row.ownerId===id&&row.quantity.min>0),total=members.reduce((sum,row)=>sum+row.quantity.min,0);
 return total+'x '+index.get(id).data.title+' (9999 pts)\n'+members.map(row=>'• '+row.quantity.min+'x '+index.get(row.id).data.name+'\n').join('');
}).join('');
const html=`<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/books/shared/army-book-app-v2/styles.css"></head><body><script type="module">
import {mount} from '/books/shared/army-book-app-v2/runtime.mjs';
import {createSpaceMarinesRosterService} from '/books/space-marines/v2/roster-import.mjs';
const inputs=await fetch('/fixture.json').then(response=>response.json());
const app=mount(document,inputs.payload,{roster:createSpaceMarinesRosterService(inputs.book)});
await app.rosterPanel.ready;app.openRoster();window.reviewReady=true;
</script></body></html>`;
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png'};
const errors=[],requests=[],results=[];
const server=http.createServer((request,response)=>{
 const address=new URL(request.url,'http://localhost').pathname;requests.push(address);response.setHeader('Cache-Control','no-store');
 if(address==='/favicon.ico'){response.writeHead(204);response.end();return;}
 if(address==='/review.html'){response.setHeader('Content-Type','text/html');response.end(html);return;}
 if(address==='/fixture.json'){response.setHeader('Content-Type','application/json');response.end(JSON.stringify({book,payload}));return;}
 const allowed=address.startsWith('/books/shared/')||address.startsWith('/books/space-marines/v2/')||address.startsWith('/books/space-marines/assets/');
 const file=path.resolve(root,'.'+address);
 if(!allowed||!file.startsWith(path.resolve(root)+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){response.writeHead(404);response.end('Not a native test dependency');return;}
 response.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');response.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await launchQaBrowser(chromium,{headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const context=await browser.newContext({viewport}),page=await context.newPage();page.setDefaultTimeout(20000);
  page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  page.on('response',response=>{if(response.status()>=400)errors.push(response.status()+' '+response.url());});
  page.on('requestfailed',request=>{if(request.failure()?.errorText!=='net::ERR_ABORTED')errors.push(request.url()+' '+request.failure()?.errorText);});
  await page.goto(`http://127.0.0.1:${server.address().port}/review.html`);await page.waitForFunction(()=>window.reviewReady===true);
  await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(input);
  await page.locator('[data-roster-action="review-import"]').click();await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
  assert.match(await page.locator('.v2-roster-status').innerText(),/^Roster imported\./);
  for(let n=0;n<ids.length;n++)for(const route of ['Effective','Guide']){
   const instanceId='parsed-unit-'+(n+1);
   await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
   await page.locator(`[data-roster-instances] > [data-roster-instance-id="${instanceId}"] [data-roster-action="show-instance"]`).click();
   if(route==='Guide'){await page.getByRole('button',{name:'Personal guide',exact:true}).first().click();await page.locator(`main [data-roster-nav-instance-id="${instanceId}"]`).first().click();}
   const key=n===3?'chargeRoll':'detectionRange',value=n<2?-6:n===2?-3:1;
   const node=page.locator(`main .ds-effective-unit-metric[data-unit-metric="${key}"]`);await node.waitFor();
   assert.equal(await node.count(),1);assert.equal(await node.getAttribute('data-metric-modifier'),String(value));
   assert.equal(await node.getAttribute('data-recipient-subject'),'UNIT');
   const sources=JSON.parse(await node.getAttribute('data-metric-sources'));assert.equal(sources.length,n<2?2:1);
   assert.ok(sources.every(row=>row.provenance.sourceId&&row.sourceFields.length));
   const visible=await node.innerText();assert.ok(visible.includes(n===3?'Charge-roll modifier: +1':`Detection Range modifier: ${value}"`));
   for(const source of sources){const link=node.locator(`[data-target-id="${source.ruleId}"]`);assert.ok(await link.count());assert.notEqual((await link.innerText()).trim(),source.ruleId);}
   assert.equal(await page.locator('main .model-profile .ds-effective-unit-metric').count(),0);
   await page.screenshot({path:path.join(out,`${viewport.width}-${route}-${n+1}.png`),fullPage:true});
   results.push({viewport,route,instanceId,key,value,sources:sources.map(row=>({ruleId:row.ruleId,physicalSource:row.sourceInstanceId})),status:'PASS'});
  }
  await context.close();
 }
 assert.deepEqual(errors,[]);assert.ok(!requests.some(file=>file.includes('/space-marines/scripts/')));
 fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:'PASS',checks:results.length,results,errors,constructedInput:input,scope:'ISOLATED_EXISTING_V2_CONSUMER_NOT_MAIN_APP_REGISTRATION',realNewRecruitExportTested:false},null,2)+'\n');
 console.log(JSON.stringify({status:'PASS',checks:results.length,desktop:true,mobile:true,realImportUi:true,errors:0,mainRegistration:false,evidence:out}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
