/** Player-path formation defaults, faction rejection and incomplete-export copy. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';

const arg=name=>process.argv.find(value=>value.startsWith(name+'='))?.slice(name.length+1);
const root=path.resolve(arg('--root')||fileURLToPath(new URL('../',import.meta.url)));
const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/fabius-safe-import-browser.json',import.meta.url)));
const chosen=arg('--case')||'all';
assert.ok(['all','fabius','ec','faction','equipment','composition'].includes(chosen),'Unknown safe-import browser scenario');
const out=createQaEvidenceDir('wh-fabius-safe-import-browser-');
const allowed=new Set(JSON.parse(fs.readFileSync(path.join(root,'tools/pages-runtime-manifest.json'))).files.map(row=>'/'+row.path));
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
const errors=[],missing=[],results=[];
const server=http.createServer((request,response)=>{
 const address=decodeURIComponent(new URL(request.url,'http://local').pathname),file=path.resolve(root,'.'+address);
 if(address==='/favicon.ico'){response.writeHead(204).end();return;}
 if(!file.startsWith(root+path.sep)||!allowed.has(address)&&!isApplicationTestDependency(address)||!fs.existsSync(file)){
  missing.push(address);response.writeHead(404).end();return;
 }
 response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const item=id=>{const row=fixture.cases.find(row=>row.id===id);assert.ok(row,'Missing exact fixture '+id);return row;};
const names={'adeptus-mechanicus':'Adeptus Mechanicus','death-guard':'Death Guard','chaos-space-marines':'Chaos Space Marines'};
const ownFaction={...names};
const forbiddenFaction="Xenos - T'au Empire";
let browser,context,page,current='initialization',completed=false;
const snapshot=()=>page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());
const effective=id=>page.evaluate(id=>window.ArmyBookAppV2.roster.effective(id),id);
const field=(record,label)=>record.fields.find(field=>field.label===label)?.value;
const toughness=view=>view.profiles.map(model=>Number(field(model,'stats').T));
const melee=view=>view.weapons.filter(weapon=>field(weapon,'mode')==='melee').map(weapon=>({id:weapon.id,scopeId:weapon.scopeId||null,strength:Number(field(weapon,'strength'))}));
const has=view=>view.profiles.flatMap(model=>model.abilities).map(ability=>({id:ability.canonicalId,parameters:ability.parameters}));
async function settled(){await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));}
async function roster(){await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();}
async function open(book){
 await page.goto(origin+'/v2/app.html');await page.locator('[data-v2-book="'+book+'"]').click();
 await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.roster));
 await page.evaluate(async()=>await window.ArmyBookAppV2.rosterPanel?.ready);await roster();
}
async function submit(text,{ready=true}={}){
 await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
 await page.locator('[data-roster-action="review-import"]').click();await settled();
 const replace=page.locator('[data-roster-action="confirm-replace-roster"]');if(await replace.isVisible()){await replace.click();await settled();}
 const status=await page.locator('.v2-roster-status').innerText();
 if(ready)assert.ok(status.startsWith('Roster imported.'),'Expected a READY UI import: '+status);
 return status;
}
async function attach(leader='parsed-unit-1',bodyguard='parsed-unit-2'){
 await roster();await page.locator('[data-attachment-candidate-for="'+bodyguard+'"]').selectOption(leader);
 await page.locator('[data-attachment-target-instance-id="'+bodyguard+'"] [data-roster-action="attach"]').click();await settled();
 await page.waitForFunction(({leader,bodyguard})=>window.ArmyBookAppV2.roster.state.attachments.some(edge=>edge.leaderInstanceId===leader&&edge.bodyguardInstanceId===bodyguard),{leader,bodyguard});
}
async function detach(){
 await roster();await page.locator('[data-roster-action="detach"][data-leader-instance-id="parsed-unit-1"]').click();await settled();
 await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state.attachments.length===0);
}
async function card(id){
 await roster();await page.locator('[data-roster-instance-id="'+id+'"]').getByRole('button',{name:'Effective datasheet',exact:true}).click();
 const value=page.locator('main .unit-card[data-roster-instance-id="'+id+'"]').first();await value.waitFor();return value;
}
async function screenshot(name,node){if(node)await node.scrollIntoViewIfNeeded();const file=path.join(out,name+'.png');await page.screenshot({path:file});return file;}
function noHistory(state){assert.equal(state.initialAttachments,undefined,'Implicit formation must not write an explicit snapshot');assert.equal(state.initialAttachmentStep,undefined,'Implicit formation must not invent a named history step');}
async function visibleT(card,value){
 const displayed=await card.locator('.statline .stat').evaluateAll(nodes=>nodes.filter(node=>node.querySelector('b')?.textContent==='T').map(node=>node.querySelector('span')?.textContent.trim()));
 assert.ok(displayed.length>0,'Toughness must be visible on the card');assert.ok(displayed.every(text=>Number(text)===value),'Visible Toughness must be '+value+': '+displayed.join(','));
}
async function fabius(width){
 const c=item('p20-fabius-initial');await open(c.bookId);await submit(c.text);
 const before=await effective('parsed-unit-2'),source=await effective('parsed-unit-1');assert.ok(toughness(before).every(value=>value===5));assert.ok(melee(before).length>0);
 let body=await card('parsed-unit-2');await visibleT(body,5);const shots=[await screenshot('fabius-before-'+width,body)];
 await attach();noHistory(await snapshot());const attached=await effective('parsed-unit-2');
 assert.ok(toughness(attached).every(value=>value===6),'Fabius must give all Bodyguard models T6');
 assert.deepEqual(melee(attached),melee(before).map(weapon=>({...weapon,strength:weapon.strength+1})),'Only the selected Bodyguard melee Strength changes by +1');
 assert.deepEqual(toughness(await effective('parsed-unit-1')),toughness(source),'Fabius and Surgeon Acolyte do not borrow the Bodyguard Toughness increase');
 body=await card('parsed-unit-2');await visibleT(body,6);shots.push(await screenshot('fabius-attached-'+width,body));
 await detach();noHistory(await snapshot());const after=await effective('parsed-unit-2');assert.deepEqual(toughness(after),toughness(before));assert.deepEqual(melee(after),melee(before));
 body=await card('parsed-unit-2');await visibleT(body,5);shots.push(await screenshot('fabius-detached-'+width,body));
 results.push({case:'fabius',width,status:'PASS',before:{toughness:toughness(before),melee:melee(before)},attached:{toughness:toughness(attached),melee:melee(attached)},after:{toughness:toughness(after),melee:melee(after)},screenshots:shots});
}
async function ec(width){
 const c=item('ec-initial-formation');await open(c.bookId);await submit(c.text);
 const absent=view=>assert.ok(!has(view).some(ability=>['core-scouts','core-infiltrators'].includes(ability.id)),'No initial attachment means no formation grants');
 absent(await effective('parsed-unit-1'));await attach();noHistory(await snapshot());const granted=await effective('parsed-unit-1');
 assert.ok(has(granted).some(ability=>ability.id==='core-infiltrators'));assert.ok(has(granted).some(ability=>ability.id==='core-scouts'&&ability.parameters.distance===6));
 absent(await effective('parsed-unit-2'));
 const unit=await card('parsed-unit-1');assert.ok(await unit.locator('[data-target-id="core-scouts"]').count()>0,'Scouts grant must be shown');assert.ok(await unit.locator('[data-target-id="core-infiltrators"]').count()>0,'Infiltrators grant must be shown');
 const shot=await screenshot('ec-attached-'+width,unit);await detach();absent(await effective('parsed-unit-1'));noHistory(await snapshot());
 results.push({case:'ec',width,status:'PASS',abilities:has(granted),screenshots:[shot]});
}
async function faction(width,book){
 const c=item('p30-foreign-header-'+book);await open(book);await submit(c.text.replace(forbiddenFaction,ownFaction[book]));const before=await snapshot();
 const message=await submit(c.text,{ready:false});assert.ok(message.includes(forbiddenFaction),'Foreign-faction warning must name the declared faction');assert.ok(message.includes(names[book]),'Foreign-faction warning must name the open book');
 assert.ok(!message.startsWith('Roster imported.'),'A foreign-faction export must be refused');assert.deepEqual(await snapshot(),before,'A refused import must preserve the saved roster');
 const shot=await screenshot('foreign-'+book+'-'+width,page.locator('.v2-roster-status'));results.push({case:'faction',book,width,status:'PASS',message,snapshotUnchanged:true,screenshots:[shot]});
}
async function equipment(width){
 const c=item('p26-explicit-no-weapons');await open(c.bookId);await submit(c.text);const state=await snapshot(),view=await effective('parsed-unit-2');
 assert.equal(view.weapons.length,0,'Missing exported weapon selections must not invent a loadout');
 const importHint=page.locator('[data-import-hint="weapons"][data-import-hint-instance-id="parsed-unit-2"]');await importHint.waitFor();
 assert.match(await importHint.innerText(),/export.*does not specify weapons.*New Recruit.*equipment included/i);
 const shots=[await screenshot('missing-equipment-import-'+width,importHint)],unit=await card('parsed-unit-2');
 const hint=unit.locator('[data-import-hint="weapons"]');assert.equal(await hint.count(),1,'An empty Weapons section needs a single human explanation');
 assert.match(await hint.innerText(),/export.*does not specify weapons.*New Recruit.*equipment included/i);assert.equal(await unit.locator('.weapon-row:not(.weapon-head)').count(),0);
 assert.deepEqual(await snapshot(),state,'Showing an incomplete-export hint must not change roster data');shots.push(await screenshot('missing-equipment-card-'+width,hint));
 results.push({case:'equipment',width,status:'PASS',weapons:0,screenshots:shots});
}
async function composition(width){
 const complete=item('p26-explicit-no-weapons'),incomplete=item('p26-compact-no-model-rows');await open(complete.bookId);await submit(complete.text);const before=await snapshot();
 await submit(incomplete.text,{ready:false});const hint=page.locator('[data-import-hint="composition"]').first();await hint.waitFor();
 assert.match(await hint.innerText(),/how many models of each type.*quantity for each model type/i);assert.deepEqual(await snapshot(),before,'Unclear composition must not replace the saved roster');
 const shot=await screenshot('missing-composition-'+width,hint);results.push({case:'composition',width,status:'PASS',snapshotUnchanged:true,screenshots:[shot]});
}
try{
 browser=await launchChromium();
 for(const width of [390,1440])for(const entry of [
  ['fabius',()=>fabius(width)],['ec',()=>ec(width)],
  ...Object.keys(names).map(book=>['faction',()=>faction(width,book),book]),
  ['equipment',()=>equipment(width)],['composition',()=>composition(width)]
 ]){
  if(chosen!=='all'&&chosen!==entry[0])continue;
  current=entry[0]+'-'+(entry[2]||'')+'-'+width;console.log('RUN '+current);
  context=await browser.newContext({viewport:{width,height:1000},serviceWorkers:'block'});context.setDefaultTimeout(25000);page=await context.newPage();page.on('pageerror',error=>errors.push({case:current,error:error.message}));
  try{await entry[1]();}
  catch(error){
   const screenshotPath=path.join(out,current+'-failure.png');await page.screenshot({path:screenshotPath}).catch(()=>{});
   results.push({case:entry[0],book:entry[2]||null,width,status:'FAIL',error:error.message,screenshots:[screenshotPath],url:page.url()});throw error;
  }finally{await context.close();context=null;}
  console.log('PASS '+current);
 }
 assert.deepEqual(errors,[],'No application page errors');assert.deepEqual(missing,[],'No missing declared runtime resources');completed=true;
}catch(error){
 if(page&&!page.isClosed())await page.screenshot({path:path.join(out,current+'-failure.png')}).catch(()=>{});throw error;
}finally{
 fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:completed?'PASS':'FAIL',root,chosen,current,results,errors,missing},null,2)+'\n');
 if(context)await context.close();if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
 console.log(JSON.stringify({status:completed?'PASS':'FAIL',evidence:out,checks:results.length}));
}
