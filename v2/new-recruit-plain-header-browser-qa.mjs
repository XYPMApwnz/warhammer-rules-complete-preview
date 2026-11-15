/** The owner's exact v37.15 export, pasted and persisted through player UI. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {parse} from '../books/shared/roster-v2/parser.mjs';
import {fileURLToPath} from 'node:url';
import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),out=createQaEvidenceDir('wh-plain-header-browser-');
const text=fs.readFileSync(new URL('./fixtures/new-recruit-v37.15-owner-death-guard.txt',import.meta.url),'utf8');
const current=JSON.parse(fs.readFileSync(new URL('./fixtures/new-recruit-plain-header-v37.25.json',import.meta.url)));
const ownerBytes=fs.readFileSync(new URL('./fixtures/'+current.owner.file,import.meta.url)),owner=ownerBytes.toString('utf8');
assert.equal(createHash('sha256').update(ownerBytes).digest('hex'),current.owner.sha256);
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
async function openRoster(page,bookId='death-guard'){
 await page.goto(origin+'/v2/app.html');await page.locator('[data-v2-book="'+bookId+'"]').click();
 await page.waitForFunction(id=>window.ArmyBookAppV2?.roster&&window.ArmyBookAppV2.payload.book.id===id,bookId);
 await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();
 await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();
}
async function submit(page,text){
 await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
 await page.locator('[data-roster-action="review-import"]').click();
 await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy=true]'));
 const replace=page.locator('[data-roster-action="confirm-replace-roster"]');
 if(await replace.count()){await replace.click();await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy=true]'));}
}
async function assertPresentationReused(page,bookId){
 const usage=await page.evaluate(id=>({requests:performance.getEntriesByType('resource').filter(row=>new URL(row.name).pathname==='/books/'+id+'/v2/generated/app-presentation.json').length,
  parses:window.__plainHeaderPresentationParses}),bookId);
 assert.equal(usage.requests,1,bookId+': importing must reuse the already loaded presentation');
 assert.equal(usage.parses,1,bookId+': importing must not parse the presentation again');
 return usage;
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
  await page.addInitScript(()=>{
   window.__plainHeaderPresentationParses=0;const json=Response.prototype.json;
   Response.prototype.json=function(...args){if(new URL(this.url,location.href).pathname.endsWith('/generated/app-presentation.json'))window.__plainHeaderPresentationParses++;return json.apply(this,args);};
  });
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
   await submit(page,owner);
   assert.match(await page.locator('.v2-roster-status').innerText(),/^Roster imported\./);
   const imported=await page.evaluate(text=>({state:ArmyBookAppV2.roster.snapshot(),metadata:ArmyBookAppV2.roster.draft(text).metadata}),owner);
   assert.equal(imported.state.units.length,8);
   assert.deepEqual(imported.state.detachmentIds,['detachment-shamblerot-vectorium','detachment-virulent-vectorium']);
   for(const [key,value]of Object.entries({declared:760,pointsLimit:2000,battleSize:'Strike Force',disposition:'Disruption'}))assert.equal(imported.metadata[key],value,key);
   assert.equal(parse(owner,{forceDispositions:['Disruption']}).exportMatches,true);
   await assertPresentationReused(page,'death-guard');
   assert(!/Detachment Points limit exceeded/.test(await page.locator('main').innerText()),'No new native DP legality warning');
   await page.screenshot({path:path.join(out,device+'-owner-v37.25-import.png'),fullPage:true});
   const deathshroud=imported.state.units.find(unit=>unit.canonicalUnitId==='unit-deathshroud-terminators');assert(deathshroud);
   await page.locator('.v2-roster-instance[data-roster-instance-id="'+deathshroud.instanceId+'"]').getByRole('button',{name:'Effective datasheet',exact:true}).click();
   const card=page.locator('main .unit-card[data-roster-instance-id="'+deathshroud.instanceId+'"]');
   assert.match(await card.innerText(),/Icon of Despair/,'The selected Icon is visible on Deathshroud Terminators');
   await card.getByText(/Icon of Despair/).first().scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(out,device+'-owner-v37.25-icon.png'),fullPage:false});
   results.push({device,status:'PASS',version:'v37.25',units:8,metadata:imported.metadata,iconOfDespair:true,dpWarning:'not implemented, backlog'});
   await page.evaluate(()=>ArmyBookAppV2.openRoster());
   const saved=await page.evaluate(()=>localStorage.getItem('army-book-app-v2:roster:death-guard'));
   for(const denied of current.rejectionCases){
    await submit(page,denied.text);
    const help=page.locator('[data-import-hint="plain-header"]');await help.waitFor();
    assert.match(await page.locator('.v2-roster-status').innerText(),/The export header could not be recognized/);
    assert.match(await help.innerText(),/exactly three nonempty lines/);assert.match(await help.innerText(),/Five-line example/);
    assert.match(await help.innerText(),/Strike Force \(2,000 Points\)/);
    assert.deepEqual(await page.evaluate(()=>ArmyBookAppV2.roster.snapshot()),imported.state,'Rejected header preserves active roster');
    assert.equal(await page.evaluate(()=>localStorage.getItem('army-book-app-v2:roster:death-guard')),saved,'Rejected header preserves exact saved bytes');
   }
   await page.screenshot({path:path.join(out,device+'-unrecognized-header-help.png'),fullPage:false});
   for(const derived of current.derived){
    await openRoster(page,derived.bookId);
    for(const variant of ['plainText','reversedText']){
     await submit(page,derived[variant]);assert.match(await page.locator('.v2-roster-status').innerText(),/^Roster imported\./);
     const actual=await page.evaluate(text=>({state:ArmyBookAppV2.roster.snapshot(),metadata:ArmyBookAppV2.roster.draft(text).metadata}),derived[variant]);
     assert.deepEqual(actual.state.detachmentIds,derived.expectedDetachmentIds);
     assert.equal(actual.metadata.pointsLimit,2000);assert.equal(actual.metadata.declared,derived.declared);
     assert.equal(actual.metadata.battleSize,'Strike Force');assert.equal(actual.metadata.disposition,derived.disposition);
     if(['death-guard','space-marines'].includes(derived.bookId))await assertPresentationReused(page,derived.bookId);
     results.push({device,book:derived.bookId,variant,status:'PASS'});
    }
   }
   console.log('PASS '+device+' exact owner export, two visible detachments, nine saved/restored units');
  }catch(error){await page.screenshot({path:path.join(out,device+'-failure.png')}).catch(()=>{});throw error;}
  finally{await context.close();}
 }
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);completed=true;
}finally{
 fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:completed?'PASS':'FAIL',results,errors,missing},null,2)+'\n');
 if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
}
