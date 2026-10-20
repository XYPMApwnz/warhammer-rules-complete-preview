/** SM5B-UI-POINTS-UNRESOLVED regression. Constructed New Recruit INPUT,
 * ordinary main V2 UI actions; evaluate is read-only and never changes state.
 * Source: accepted SM MFM v1.6, Impulsor / per Orbital Comms Array (10 pts).
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const repo=fileURLToPath(new URL('../../../',import.meta.url));
const out=process.env.SM_POINTS_BROWSER_OUT||path.join(repo,'tmp/sm-unresolved-points-browser');
fs.mkdirSync(out,{recursive:true});
const baseline=process.argv.includes('--baseline');
const header='+ FACTION KEYWORD: Space Marines\n+ DETACHMENT: Gladius Task Force\n';
const unknown='1x Impulsor (9999 pts)\n• 1x Impulsor\n';
const known='1x Impulsor (9999 pts)\n• 1x Impulsor: 1x Armoured Hull, 1x Storm Bolters\n';
const selected='1x Impulsor (9999 pts)\n• 1x Impulsor: 1x Armoured Hull, 1x Storm Bolters, 1x Orbital Comms Array\n';
const fixtures={unknown:header+unknown,resolved:header+selected+known,repeated:header+unknown+selected,
  // Established lifecycle QA transport: selected UNIT quantity is known,
  // while no particular Terminator MODEL is declared as bearer.
  unitEquipment:header+'5x Terminator Assault Squad (9999 pts): 1x Storm Shield\n• 1x Terminator Sergeant\n• 4x Terminator\n'};
const result={defect:'SM5B-UI-POINTS-UNRESOLVED',mode:baseline?'BEFORE_FIX':'AFTER_FIX',realNewRecruitExportTested:false,results:[],screenshots:[],errors:[]};
const prefix='/warhammer-rules-complete-preview';
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{
  const url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(url.endsWith('/favicon.ico')){res.writeHead(204);res.end();return;}
  const local=url.startsWith(prefix+'/')?url.slice(prefix.length):url;
  const file=path.resolve(repo,'.'+local);
  if(!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
let page,device;
const ready=()=>page.evaluate(async()=>{await window.WarhammerAppV2?.ready;await window.ArmyBookAppV2?.rosterPanel?.ready;});
async function roster(){await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();await ready();await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();}
async function importText(text){
  await roster();await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);await page.locator('[data-roster-action="review-import"]').click();
  await page.waitForFunction(()=>!document.querySelector('[data-roster-view][aria-busy="true"]'));
  if(await page.locator('[data-roster-action="confirm-replace-roster"]').count()){await page.locator('[data-roster-action="confirm-replace-roster"]').click();await page.waitForFunction(()=>!document.querySelector('[data-roster-view][aria-busy="true"]'));}
  assert.match(await page.locator('.v2-roster-status').innerText(),/^Roster imported\./);
}
async function route(name,id='parsed-unit-1'){
  await roster();
  if(name==='Effective')await page.locator(`[data-roster-instances] > [data-roster-instance-id="${id}"] [data-roster-action="show-instance"]`).click();
  if(name==='Guide'){await page.locator('[data-roster-action="open-personal-guide"]').click();await page.locator(`main [data-roster-nav-instance-id="${id}"]`).first().click();}
  if(name!=='Roster')await page.locator('main .unit-card').first().waitFor();
}
async function check(name,fn){try{const actual=await fn();result.results.push({device,name,status:'PASS',actual});console.log(device+' '+name+' PASS');}catch(error){result.results.push({device,name,status:'FAIL',error:error.message});await screenshot('FAIL-'+name);console.log(device+' '+name+' FAIL '+error.message);}}
async function screenshot(name){const file=device+'-'+name+'.png';await page.screenshot({path:path.join(out,file),fullPage:false});result.screenshots.push(file);}
async function warning(name,id='parsed-unit-1'){
  await route(name,id);
  const nodes=page.locator('main [data-roster-points-status="UNRESOLVED"]');
  assert.ok(await nodes.count()>0,'Visible unresolved points warning is missing');
  const text=(await nodes.allInnerTexts()).join('\n');
  assert.match(text,/Points unresolved/i);assert.match(text,/Points cannot be calculated reliably/i);assert.match(text,/Impulsor/);
  assert.equal(await nodes.locator(`[data-roster-points-unit-id="${id}"]`).count()>0,true,'Warning must identify the exact physical UNIT');
  const costRecordId=await page.evaluate(instanceId=>window.ArmyBookAppV2.roster.points.unresolved.find(issue=>issue.unitInstanceId===instanceId).costRecordIds[0],id);
  assert.ok(costRecordId);const option=nodes.locator(`[data-roster-points-option-id="${costRecordId}"]`);
  assert.ok(await option.count()>0,'Warning must retain the proven canonical MFM option identity');assert.match((await option.allInnerTexts()).join('\n'),/Orbital Comms Array/);
  const reasons=await nodes.locator('[data-roster-points-reason]').allInnerTexts();
  assert.ok(reasons.length>0&&reasons.every(value=>value.trim()&&!/[A-Z]{3,}_[A-Z_]+/.test(value)),'Reasons must be readable, not engine enum strings');
  assert.ok(await nodes.first().isVisible());await nodes.first().scrollIntoViewIfNeeded();
  // A normal scroll action keeps the warning heading below the sticky shell.
  if(device==='desktop')await page.mouse.wheel(0,-160);
  await screenshot('unknown-'+name);
  return {text};
}
try{
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
    device=viewport.width===1440?'desktop':'mobile';const context=await browser.newContext({viewport});page=await context.newPage();page.setDefaultTimeout(20000);
    page.on('pageerror',error=>result.errors.push({device,type:'js',message:error.message}));
    page.on('response',response=>{if(response.status()>=400)result.errors.push({device,type:'http',status:response.status(),url:response.url()});});
    page.on('requestfailed',request=>{if(request.failure()?.errorText!=='net::ERR_ABORTED')result.errors.push({device,type:'request',url:request.url(),message:request.failure()?.errorText});});
    await page.goto('http://127.0.0.1:'+server.address().port+prefix+'/v2/app.html');await page.waitForFunction(()=>Boolean(window.WarhammerAppV2));await ready();await page.locator('[data-v2-book="space-marines"]').click();await ready();
    await importText(fixtures.unknown);
    for(const name of ['Roster','Effective','Guide'])await check('original-six-'+name,()=>warning(name));
    if(baseline){await context.close();continue;}
    await check('runtime-null-preserved',async()=>{const points=await page.evaluate(()=>window.ArmyBookAppV2.roster.points);assert.equal(points.status,'UNRESOLVED');assert.equal(points.totalPoints,null);return points;});
    await roster();await page.getByText('Backup and restore',{exact:true}).click();
    const downloadPromise=page.waitForEvent('download');await page.locator('[data-roster-action="export-backup"]').click();
    const download=await downloadPromise;const backupFile=path.join(out,device+'-unknown-backup.json');await download.saveAs(backupFile);
    await check('snapshot-physical-state',async()=>{const backup=JSON.parse(fs.readFileSync(backupFile,'utf8'));assert.equal(backup.units.length,1);assert.equal(backup.units[0].canonicalUnitId,'unit-sm-4fce70f042cc4e5d');return {units:backup.units.length,canonicalId:backup.units[0].canonicalUnitId};});
    await page.reload();await ready();
    for(const name of ['Roster','Effective','Guide'])await check('reload-'+name,()=>warning(name));
    await importText(fixtures.unknown);
    for(const name of ['Roster','Effective','Guide'])await check('identical-reimport-'+name,()=>warning(name));
    await check('invalid-import-preserves-state-and-snapshot',async()=>{
      const before=await page.evaluate(()=>({state:window.ArmyBookAppV2.roster.snapshot(),saved:localStorage.getItem('army-book-app-v2:roster:space-marines')}));
      await roster();await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill('Not a New Recruit roster');await page.locator('[data-roster-action="review-import"]').click();
      await page.waitForFunction(()=>!document.querySelector('[data-roster-view][aria-busy="true"]'));
      const after=await page.evaluate(()=>({state:window.ArmyBookAppV2.roster.snapshot(),saved:localStorage.getItem('army-book-app-v2:roster:space-marines')}));
      assert.deepEqual(after,before);return {activePreserved:true,snapshotPreserved:true};
    });
    for(const name of ['Roster','Effective','Guide'])await check('invalid-import-keeps-warning-'+name,()=>warning(name));
    await importText(fixtures.resolved);
    for(const name of ['Roster','Effective','Guide'])await check('resolved-'+name,async()=>{await route(name);assert.equal(await page.locator('main [data-roster-points-status="UNRESOLVED"]').count(),0);return {warning:false};});
    await check('resolved-exact-total',async()=>{const points=await page.evaluate(()=>window.ArmyBookAppV2.roster.points);assert.equal(points.status,'RESOLVED');assert.equal(points.totalPoints,150);return points;});
    await roster();
    const backupPane=page.locator('details').filter({has:page.getByText('Backup and restore',{exact:true})});
    if(await backupPane.getAttribute('open')===null)await page.getByText('Backup and restore',{exact:true}).click();
    await page.getByLabel('Restore a V2 roster backup',{exact:true}).setInputFiles(backupFile);
    await page.waitForFunction(()=>document.querySelector('.v2-roster-status')?.textContent==='Roster backup restored.');
    for(const name of ['Roster','Effective','Guide'])await check('snapshot-restore-'+name,()=>warning(name));
    await roster();if(await backupPane.getAttribute('open')===null)await page.getByText('Backup and restore',{exact:true}).click();
    await page.locator('[data-roster-action="reload-saved"]').click();await page.waitForFunction(()=>document.querySelector('.v2-roster-status')?.textContent==='Saved roster reloaded and validated.');
    for(const name of ['Roster','Effective','Guide'])await check('load-recompute-'+name,()=>warning(name));
    await importText(fixtures.repeated);
    for(const name of ['Roster','Effective','Guide'])await check('repeated-unknown-'+name,()=>warning(name));
    for(const name of ['Effective','Guide'])await check('repeated-resolved-recipient-'+name,async()=>{await route(name,'parsed-unit-2');assert.equal(await page.locator('main [data-roster-points-status="UNRESOLVED"]').count(),0,'Resolved repeated UNIT receives another UNIT warning');});
    await check('repeated-instance-attribution',async()=>{await roster();const warnings=page.locator('main [data-roster-points-status="UNRESOLVED"]');assert.equal(await warnings.locator('[data-roster-points-unit-id="parsed-unit-2"]').count(),0);assert.ok(await warnings.locator('[data-roster-points-unit-id="parsed-unit-1"]').count()>0);return {unresolvedInstance:'parsed-unit-1',resolvedInstance:'parsed-unit-2'};});
    await importText(fixtures.resolved);
    for(const name of ['Roster','Effective','Guide'])await check('equipment-choice-change-clears-'+name,async()=>{await route(name);assert.equal(await page.locator('main [data-roster-points-status="UNRESOLVED"]').count(),0);});
    await importText(fixtures.unitEquipment);
    await check('unit-equipment-unknown-model-bearer',async()=>{
      const state=await page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot()),points=await page.evaluate(()=>window.ArmyBookAppV2.roster.points);
      const unit=state.units[0],equipment=unit.selections.filter(selection=>selection.canonicalEquipmentIds.includes('ability-sm-aa81f0067a3140de'));
      assert.equal(equipment.length,1);assert.equal(equipment[0].physicalQuantity,1);
      assert.equal(unit.modelRows.flatMap(row=>row.selections).filter(selection=>selection.canonicalEquipmentIds.includes('ability-sm-aa81f0067a3140de')).length,0,'Unknown MODEL bearer must not be invented');
      assert.equal(points.status,'RESOLVED');assert.equal(points.totalPoints,175);
      const paid=points.units[0].paid.options.find(option=>option.quantity===1);assert.equal(paid.selections[0].scope.kind,'UNIT');assert.equal(paid.selections[0].scope.modelScopeId,null);
      const wounds=await page.evaluate(()=>window.ArmyBookAppV2.roster.projection.units[0].profiles.map(row=>row.profile.stats.W));
      assert.ok(wounds.length>0&&wounds.every(value=>value==='3'),'Unknown bearer must not receive MODEL W+1');
      return {status:points.status,totalPoints:points.totalPoints,quantity:1,bearer:'UNKNOWN'};
    });
    for(const name of ['Roster','Effective','Guide'])await check('unit-equipment-no-false-warning-'+name,async()=>{await route(name);assert.equal(await page.locator('main [data-roster-points-status="UNRESOLVED"]').count(),0);});
    await context.close();
  }
}catch(error){result.fatal={message:error.message,stack:error.stack};console.error(error.stack);}
finally{await browser.close();await new Promise(resolve=>server.close(resolve));result.counts={PASS:result.results.filter(row=>row.status==='PASS').length,FAIL:result.results.filter(row=>row.status==='FAIL').length};result.status=result.fatal||result.counts.FAIL||result.errors.length?'FAIL':'PASS';fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify(result,null,2)+'\n');}
if(result.status!=='PASS')process.exitCode=1;
