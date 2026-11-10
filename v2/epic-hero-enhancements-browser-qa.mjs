/** Player-path Core 25.04 and FAQ controls; imports through the visible UI. */
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';
const arg=name=>process.argv.find(value=>value.startsWith(name+'='))?.slice(name.length+1);
const root=path.resolve(arg('--root')||fileURLToPath(new URL('../',import.meta.url)));
const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/epic-hero-enhancements.json',import.meta.url)));
const chosen=arg('--case')||'all';
assert(['all','dg-related','titus-artificer','captain-artificer','farsight-grenades','coldstar-grenades','faq'].includes(chosen),'Unknown browser Epic scenario');
const out=createQaEvidenceDir('wh-epic-hero-enhancements-browser-');
const allowed=new Set(JSON.parse(fs.readFileSync(path.join(root,'tools/pages-runtime-manifest.json'))).files.map(row=>'/'+row.path));
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
const errors=[],missing=[],results=[];
const server=http.createServer((request,response)=>{
 const address=decodeURIComponent(new URL(request.url,'http://local').pathname),file=path.resolve(root,'.'+address);
 if(address==='/favicon.ico'){response.writeHead(204).end();return;}
 if(!file.startsWith(root+path.sep)||!allowed.has(address)&&!isApplicationTestDependency(address)||!fs.existsSync(file)){missing.push(address);response.writeHead(404).end();return;}
 response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
let browser,context,page,completed=false,current='initialization';
async function openBook(book){
 await page.goto(origin+'/v2/app.html');await page.locator('[data-v2-book="'+book+'"]').click();
 await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.roster));
}
async function importText(book,text){
 await openBook(book);
 await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();
 await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
 await page.locator('[data-roster-action="review-import"]').click();
 await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
 const replace=page.locator('[data-roster-action="confirm-replace-roster"]');if(await replace.isVisible())await replace.click();
 await page.waitForFunction(()=>document.querySelector('.v2-roster-status')?.textContent.startsWith('Roster imported.'));
 return page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());
}
async function enhancementIdentity(instanceId){
 return page.locator('.v2-roster-instance[data-roster-instance-id="'+instanceId+'"] .v2-roster-identity').evaluate(node=>{
  const term=[...node.querySelectorAll('dt')].find(term=>term.textContent.trim()==='Enhancements on this unit');
  if(!term)throw Error('Missing active Enhancement identity field');return term.nextElementSibling.textContent;
 });
}
try{
 browser=await launchChromium();context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'});page=await context.newPage();
 context.setDefaultTimeout(25000);page.on('pageerror',error=>errors.push(error.message));
 if(['all','dg-related'].includes(chosen))for(const c of [
  {unit:'unit-typhus',name:'Typhus',epic:true},{unit:'unit-mortarion',name:'Mortarion',epic:true},{unit:'unit-lord-of-contagion',name:'Lord of Contagion',epic:false}
 ]){
  current='related-'+c.unit;console.log('RUN '+current);await openBook('death-guard');
  await page.locator('main a[data-target-id="'+c.unit+'"]').first().click();
  await page.getByRole('button',{name:'Compatible Stratagems & Enhancements',exact:true}).click();
  const dialog=page.locator('dialog.v2-related-dialog[open]');await dialog.waitFor();await dialog.getByRole('button',{name:'Enhancements',exact:true}).click();
  const count=await dialog.locator('[data-related-kind="enhancements"] .v2-compatible-item').count();
  // Capture the observed panel before assertion, including the baseline's failing state.
  await page.screenshot({path:path.join(out,current+'.png')});
  if(c.epic)assert.equal(count,0,'Core 25.04: '+c.name+' must have zero compatible Enhancements/Upgrades');
  else assert(count>0,'Ordinary Lord of Contagion keeps compatible Enhancements');
  results.push({id:current,status:'PASS',count});console.log('PASS '+current);
 }
 for(const c of fixture.importCases.filter(c=>chosen==='all'||chosen===c.id)){
  current='import-'+c.id;console.log('RUN '+current);const state=await importText(c.book,c.text),unit=state.units[0];
  assert.equal(unit.canonicalUnitId,c.unitId);assert.deepEqual(unit.enhancementIds,[c.enhancementId]);assert.equal(Number(unit.raw.points),c.exportPoints);
  const active=await enhancementIdentity(unit.instanceId);
  if(c.epic){
   const warnings=page.getByText(/Core Rules 25\.04/, {exact:false});
   assert(await warnings.count()>0,'The import UI must visibly explain the Epic Hero restriction');
   const warningText=await warnings.allTextContents(),message=warningText.join('\n');
   assert(message.includes(c.unit)&&message.includes(c.enhancement),'The visible warning names the unit and Enhancement');
   assert.match(message,/not applied/i);assert.match(message,/invalid|violat|illegal/i);
   await warnings.first().scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,current+'-warning.png')});
   assert(!active.includes(c.enhancement),'The roster must not present a banned Enhancement as active');
   assert.equal(await page.locator('[data-binding-kind="ENHANCEMENT_BEARER"]').count(),0,'An Epic Hero is not offered as a manual Enhancement bearer');
  }else{
   assert(active.includes(c.enhancement),'The ordinary CHARACTER keeps its active Enhancement');
   assert.equal(await page.getByText(/Core Rules 25\.04/, {exact:false}).count(),0,'No Epic warning for ordinary CHARACTER');
  }
  await page.locator('.v2-roster-instance[data-roster-instance-id="'+unit.instanceId+'"]').getByRole('button',{name:'Effective datasheet',exact:true}).click();
  const card=page.locator('main .unit-card[data-roster-instance-id="'+unit.instanceId+'"]');await card.waitFor();
  const view=await page.evaluate(id=>window.ArmyBookAppV2.roster.effective(id),unit.instanceId);
  assert.equal(view.enhancements.some(row=>row.canonicalId===c.enhancementId),!c.epic,'Physical datasheet active Enhancement eligibility');
  if(c.epic){
   const own=await page.evaluate(id=>window.ArmyBookAppV2.roster.projection.units.find(unit=>unit.instanceId===id),unit.instanceId);
   assert(!own.enhancementIds.includes(c.enhancementId));assert(!own.applied.some(row=>row.ruleId===c.enhancementId));
  }else if(c.book==='space-marines')assert.equal(view.profiles[0].fields.find(field=>field.label==='stats').value.SV,'2+');
  else assert(view.profiles.some(model=>model.keywords.includes('GRENADES')));
  await page.screenshot({path:path.join(out,current+'-datasheet.png')});results.push({id:current,status:'PASS',epic:c.epic,activeEnhancements:view.enhancements.map(row=>row.canonicalId)});console.log('PASS '+current);
 }
 if(['all','faq'].includes(chosen)){
  current='faq-darkstrider-upgraded-pathfinder';console.log('RUN '+current);const c=fixture.faq,state=await importText(c.book,c.text);
  const leader=state.units.find(unit=>unit.canonicalUnitId===c.leaderId),bodyguard=state.units.find(unit=>unit.canonicalUnitId===c.bodyguardId);assert(leader&&bodyguard);
  const body=page.locator('.v2-roster-instance[data-roster-instance-id="'+bodyguard.instanceId+'"]');
  await body.locator('[data-attachment-candidate-for="'+bodyguard.instanceId+'"]').selectOption(leader.instanceId);
  await body.locator('[data-roster-action="attach"]').click();
  await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state.attachments.length===1);
  assert((await enhancementIdentity(bodyguard.instanceId)).includes(c.enhancement),'FAQ: the non-Epic UNIT keeps its Upgrade while led by an Epic Hero');
  assert.equal(await page.getByText(/Core Rules 25\.04/, {exact:false}).count(),0);
  const observation=await page.evaluate(({leader,bodyguard,enhancement})=>{
   const run=window.ArmyBookAppV2.roster;
   return {attachments:run.state.attachments,leaderEnhancements:run.effective(leader).enhancements.map(row=>row.canonicalId),bodyguardEnhancements:run.effective(bodyguard).enhancements.map(row=>row.canonicalId),related:run.related(bodyguard).find(row=>row.ruleId===enhancement)};
  },{leader:leader.instanceId,bodyguard:bodyguard.instanceId,enhancement:c.enhancementId});
  assert.deepEqual(observation.leaderEnhancements,[]);assert(observation.bodyguardEnhancements.includes(c.enhancementId));assert.notEqual(observation.related?.applicability,'NO_MATCH');
  await page.screenshot({path:path.join(out,current+'.png')});
  await body.locator('[data-roster-action="detach"]').click();await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state.attachments.length===0);
  assert((await enhancementIdentity(bodyguard.instanceId)).includes(c.enhancement),'Detaching does not remove a legal Upgrade');
  results.push({id:current,status:'PASS',observation});console.log('PASS '+current);
 }
 assert.deepEqual(errors,[],'No application page errors');assert.deepEqual(missing,[],'No missing packaged runtime paths');completed=true;
}catch(error){
 if(page)await page.screenshot({path:path.join(out,current+'-failure.png')}).catch(()=>{});throw error;
}finally{
 fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:completed?'PASS':'FAIL',root,chosen,current,results,errors,missing},null,2)+'\n');
 if(context)await context.close();if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
 console.log(JSON.stringify({status:completed?'PASS':'FAIL',evidence:out,checks:results.length}));
}
