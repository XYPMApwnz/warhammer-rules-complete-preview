/** Constructed player UI cases; no additional export grammar or game rules. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';
import {parseProducerJSON} from '../books/shared/source-refs-v2/producer-io.mjs';
import {files,cases,createExecutableDetachmentSnapshot} from '../tests/helpers/executable-detachment-cases.mjs';
const arg=name=>process.argv.find(value=>value.startsWith(name+'='))?.slice(name.length+1);
const root=path.resolve(arg('--root')||fileURLToPath(new URL('../',import.meta.url))),chosen=arg('--case')||'all';
assert.ok(['all','death-blow','lion','plain','inventory'].includes(chosen));
const observe=process.argv.includes('--observe-only'),mutation=arg('--mutation');
const out=createQaEvidenceDir('wh-card-polish-2-browser-'),results=[],errors=[],missing=[];
const allowed=new Set(JSON.parse(fs.readFileSync(path.join(root,'tools/pages-runtime-manifest.json'))).files.map(row=>'/'+row.path));
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
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
const read=file=>parseProducerJSON(fs.readFileSync(path.join(root,file),'utf8'));
const norm=text=>text.replace(/\s+/g,' ').trim(),count=(text,quote)=>norm(text).split(norm(quote)).length-1;
const deathBlow={book:'space-marines',ruleId:'detachment-rule-sm-05b00954e4744b59',instance:'parsed-unit-1',
 text:'+ FACTION KEYWORD: Space Marines\n+ DETACHMENT: Terminator Storm Force\n5x Terminator Squad (170 pts)\n• 5x Terminator: 5 with Storm bolter, Power fist'};
const lion=JSON.parse(fs.readFileSync(new URL('./fixtures/card-texts.json',import.meta.url))).cases.find(row=>row.id==='p43-lion-candidate');
const owner=fs.readFileSync(new URL('./fixtures/new-recruit-v37.15-owner-death-guard.txt',import.meta.url),'utf8');
let browser,context,page,current,completed=false;
async function settled(){await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));}
async function open(book){
 await page.goto(origin+'/v2/app.html');await page.locator('[data-v2-book="'+book+'"]').click();
 await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.roster));
 await page.evaluate(async()=>await window.ArmyBookAppV2.rosterPanel?.ready);
 await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();
}
async function submit(text,ready=true){
 await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
 await page.locator('[data-roster-action="review-import"]').click();await settled();
 const status=await page.locator('.v2-roster-status').innerText();
 if(ready)assert.ok(status.startsWith('Roster imported.'),'Constructed UI import is READY: '+status);
 return status;
}
async function card(id){
 await page.locator('[data-roster-instance-id="'+id+'"]').getByRole('button',{name:'Effective datasheet',exact:true}).click();
 const node=page.locator('main .unit-card[data-roster-instance-id="'+id+'"]').first();await node.waitFor();return node;
}
async function shot(name,node){await node.scrollIntoViewIfNeeded();const file=path.join(out,name+'.png');await page.screenshot({path:file});return file;}
async function runDeathBlow(width){
 await open(deathBlow.book);await submit(deathBlow.text);const node=await card(deathBlow.instance);
 const rule=read('books/space-marines/v2/generated/roster-runtime.json').entities.find(row=>row.id===deathBlow.ruleId);
 const view=await page.evaluate(id=>window.ArmyBookAppV2.roster.effective(id),deathBlow.instance);
 assert.equal(view.unitMetrics.chargeRoll.modifier,1,'Existing charge-roll effect remains +1');
 if(mutation==='remove-rule-text')await node.locator('[data-executable-detachment-rule-id]').evaluateAll(nodes=>nodes.forEach(node=>node.remove()));
 const source=node.locator('[data-executable-detachment-rule-id="'+rule.id+'"]'),occurrences=count(await node.innerText(),rule.data.text);
 if(!observe){
  assert.equal(occurrences,1,'One complete Death Blow source text on the physical card');
  assert.equal(await source.count(),1);assert.ok(await source.isVisible());
  const metric=node.locator('[data-unit-metric="chargeRoll"]');assert.equal(await metric.count(),1,'The separate charge modifier is retained');
  assert.ok((await metric.innerText()).includes('+1'));assert.ok((await metric.innerText()).includes('Death Blow'));
  const id=await source.getAttribute('id'),ref=metric.locator('[data-policy-text-ref="'+id+'"]');assert.equal(await ref.count(),1,'Effect links to full source');
  assert.equal(await page.locator('[id="'+id+'"]').count(),1,'Source ID is unique in the document');
  assert.equal(await ref.evaluate(link=>link.closest('.unit-card')===document.getElementById(link.dataset.policyTextRef).closest('.unit-card')),true);
  const provenance=JSON.parse(await source.getAttribute('data-executable-source-provenance'));assert.ok(provenance.sourceId);
 }
 return {case:'death-blow',width,fullTextOccurrences:occurrences,effects:view.applied.filter(row=>row.ruleId===rule.id),screenshots:[await shot('death-blow-'+width,occurrences?source:node)]};
}
async function runLion(width){
 await open(lion.bookId);await submit(lion.text);const node=await card('parsed-unit-2');
 const view=await page.evaluate(()=>window.ArmyBookAppV2.roster.effective('parsed-unit-2'));
 const rows=view.conditional.filter(row=>row.activationContext);assert.equal(rows.length,3,'Three separate conditional effects remain');
 const choice=rows[0].activationContext,occurrences=count(await node.innerText(),choice.text);
 if(mutation==='remove-choice-text')await node.locator('[data-battle-choice-text]').evaluateAll(nodes=>nodes.forEach(node=>node.remove()));
 if(!observe){
  const source=node.locator('[data-battle-choice-text="'+choice.canonicalId+'"]');
  assert.equal(await source.count(),1,'One complete physical battle-choice source');assert.ok(await source.isVisible());
  assert.equal(count(await node.innerText(),choice.text),1,'Battle-choice text is not repeated across effects');
  const links=node.locator('[data-battle-choice-ref="'+choice.canonicalId+'"]');assert.equal(await links.count(),3,'Each effect keeps its named required choice');
  const id=await source.getAttribute('id');
  for(const link of await links.all()){
   assert.equal(await link.innerText(),choice.label);assert.equal(await link.getAttribute('href'),'#'+id);
   assert.equal(await link.evaluate(link=>link.closest('.unit-card')===document.getElementById(link.dataset.policyTextRef)?.closest('.unit-card')),true);
  }
  assert.equal(await page.locator('[id="'+id+'"]').count(),1);
  const native=read('books/dark-angels/v2/generated/roster-runtime.json').entities.find(row=>row.id===choice.canonicalId);
  assert.equal(norm(await source.innerText()),norm(native.data.text),'Complete choice source is retained');
  for(const link of await node.locator('a[data-policy-text-ref]').all()){
   const target=await link.getAttribute('data-policy-text-ref');
   const text=node.locator('[id="'+target+'"]');
   assert.equal(await text.count(),1,'Every independent rule/choice link resolves on its own physical card');
   assert.ok(await text.isVisible(),'Every linked rule/choice source is visible');
   assert.equal(await page.locator('[id="'+target+'"]').count(),1,'Every linked source has a unique document ID');
   assert.equal(await link.getAttribute('href'),'#'+target);
  }
 }
 return {case:'lion',width,fullTextOccurrences:occurrences,separateEffects:rows.length,screenshots:[await shot('lion-choice-'+width,node.locator('[data-battle-choice-text]').first().or(node).first())]};
}
async function runPlain(width){
 await open('death-guard');await submit(owner);
 const before=await page.evaluate(()=>({state:window.ArmyBookAppV2.roster.snapshot(),storage:localStorage.getItem('army-book-app-v2:roster:death-guard')}));
 const lines=owner.split(/\r?\n/),index=lines.findIndex(line=>line.includes('Detachment Points)'));
 assert.ok(index>=0);lines.splice(index+1,0,'Additional unrecognized header line');const status=await submit(lines.join('\n'),false);
 const after=await page.evaluate(()=>({state:window.ArmyBookAppV2.roster.snapshot(),storage:localStorage.getItem('army-book-app-v2:roster:death-guard')}));
 assert.deepEqual(after,before,'Unsupported header changes neither current nor persisted roster');
 const help=page.locator('[data-import-hint="plain-header"]');
 if(mutation==='remove-header-help')await help.evaluateAll(nodes=>nodes.forEach(node=>node.remove()));
 if(!observe){
  assert.match(status,/header could not be recognized/);assert.match(status,/current roster and saved roster were not changed/);
  assert.equal(await help.count(),1);assert.ok(await help.isVisible());
  assert.match(await help.innerText(),/exactly three nonempty lines/);assert.match(await help.innerText(),/New Recruit/);assert.match(await help.innerText(),/site owner/);
  const example=help.locator('pre');assert.equal((await example.innerText()).split('\n').length,3);
  const bounds=await example.boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width,'Three-line example fits the viewport');
 }
 return {case:'plain',width,status,explanationCount:await help.count(),savedRosterUnchanged:true,screenshots:[await shot('plain-four-lines-'+width,page.locator('.v2-roster-status'))]};
}
async function runInventory(book){
 await open(book);const native=read(`books/${book}/v2/generated/${files[book]}.json`);
 const publication=read(`books/${book}/v2/generated/app-presentation.json`);
 for(const [ruleId,title,unitId]of cases[book]){
  current=book+'/'+ruleId;
  await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();
  const state=createExecutableDetachmentSnapshot(native,ruleId,unitId);
  if(['space-marines','blood-angels','dark-angels'].includes(book))for(const unit of state.units)
   for(const row of unit.modelRows)row.selections=[]; // Unit grants/modifiers require no equipment selection.
  if(ruleId==='detachment-rule-da-6a259c00bc9f4bf498ee')for(const unit of state.units){
   const weapon=native.entities.find(row=>row.kind==='WEAPON_PROFILE'&&row.parentId===unitId&&row.data.mode==='ranged');assert.ok(weapon);
   unit.modelRows[0].selections=[{selectionKey:'explicit/canonical-ranged-weapon',canonicalProfileIds:[weapon.id],canonicalEquipmentIds:[],
    physicalQuantity:1,perModelQuantity:1,quantityEvidence:{selectedQuantity:1,modelQuantity:1}}];
  }
  // These import adapters also require explicit source composition and item
  // count evidence on a loaded snapshot. Select the canonical minimum-size
  // composition here; this is constructed QA, not omitted-export inference.
  if(['emperors-children','tau-empire','tyranids'].includes(book))for(const unit of state.units){
   const members=native.entities.filter(row=>row.kind==='COMPOSITION_MEMBER'&&row.parentId===unit.canonicalUnitId);
   const original=unit.modelRows;
   unit.modelRows=members.filter(member=>member.data.quantity.min>0).map((member,index)=>{
    const quantity=member.data.quantity.min;
    const prior=original.find(row=>row.canonicalProfileId===member.data.modelProfileId);
    return {rowId:members.length===1&&prior?prior.rowId:'canonical-member-'+index,canonicalProfileId:member.data.modelProfileId,compositionMemberId:member.id,quantity,loadouts:[],
     selections:members.length===1&&prior?prior.selections.filter(selection=>selection.canonicalOptionIds?.length):[]};
   });
   unit.startingStrength=unit.modelRows.reduce((sum,row)=>sum+row.quantity,0);
   if(book==='tau-empire'){
    const weapon=native.entities.find(row=>row.kind==='WEAPON_PROFILE'&&row.parentId===unit.canonicalUnitId);
    if(weapon)for(const row of unit.modelRows)row.selections.push({selectionKey:'explicit/canonical-first-weapon',canonicalProfileIds:[weapon.id],canonicalEquipmentIds:[],
     physicalQuantity:row.quantity,perModelQuantity:1,quantityEvidence:{selectedQuantity:1,modelQuantity:row.quantity}});
   }
  }
  await page.evaluate(async state=>{
   const result=await window.ArmyBookAppV2.roster.load(state);
   if(result?.ok===false)throw Error(JSON.stringify(result));window.ArmyBookAppV2.rosterPanel.refresh();
  },state);await settled();
  const node=await card('physical/right'),before=await page.evaluate(()=>window.ArmyBookAppV2.roster.projection);
  const source=node.locator('[data-executable-detachment-rule-id="'+ruleId+'"]');
  assert.equal(await source.count(),1,book+'/'+title+': one full physical source, including mixed F1/executable rules');
  assert.ok(await source.isVisible());
  const canonical=publication.cards.find(row=>row.id===ruleId);
  const fields=canonical.fields.filter(field=>typeof field.value==='string'&&
    (['/text','/semanticContent'].includes(field.presentationPath??field.source?.path)||/^\/clauses\/\d+\/text$/.test(field.presentationPath??field.source?.path??'')));
  assert.ok(fields.length,'Independent canonical source prose');
  if(ruleId==='detachment-shamblerot-vectorium:rule'){
   // The accepted source represents this table twice (flattened prose and
   // typed cells). The existing book renderer retains the real table once.
   for(const paragraph of [
    'In your Command phase in each of the following battle rounds, depending on your chosen battle size, add a new POXWALKERS unit with a Starting Strength of 10 to your army, in Strategic Reserves.',
    'POXWALKERS units from your army gain the BATTLELINE keyword.'
   ])assert.equal(count(await node.innerText(),paragraph),1,'Complete Numberless Horde prose appears once');
   const cells=canonical.fields.filter(field=>field.presentation==='table-cell');assert.equal(cells.length,8);
   for(const field of cells){const cell=source.locator('[data-fact-id="'+field.id+'"]');assert.equal(await cell.count(),1);assert.equal(await cell.innerText(),field.value);}
  }else for(const quote of new Set(fields.map(field=>field.value)))assert.equal(count(await node.innerText(),quote),1,
    book+'/'+title+': full canonical paragraph shown once, not repeated by a mixed battle-only clause');
  const id=await source.getAttribute('id');assert.equal(await page.locator('[id="'+id+'"]').count(),1);
  assert.deepEqual(await page.evaluate(()=>window.ArmyBookAppV2.roster.projection),before,'Rendering does not mutate gameplay');
  results.push({case:'inventory',book,ruleId,title,width:1440,status:'PASS',canonicalFields:fields.map(field=>field.id)});
 }
}
let failure;
try{
 browser=await launchChromium();
 for(const width of [390,1440])for(const [name,run]of [['death-blow',runDeathBlow],['lion',runLion],['plain',runPlain]]){
  if(chosen!=='all'&&chosen!==name)continue;current=name+'-'+width;
  context=await browser.newContext({viewport:{width,height:1000},serviceWorkers:'block'});context.setDefaultTimeout(25000);
  page=await context.newPage();page.on('pageerror',error=>errors.push({case:current,error:error.message}));
  try{results.push({...await run(width),status:observe?'OBSERVED':'PASS'});console.log((observe?'OBSERVED ':'PASS ')+current);}
  catch(error){const file=path.join(out,current+'-failure.png');await page.screenshot({path:file}).catch(()=>{});results.push({case:current,status:'FAIL',error:error.message,stack:error.stack,screenshots:[file],url:page.url()});throw error;}
  finally{await context.close();context=null;}
 }
 if(chosen==='all'||chosen==='inventory')for(const book of Object.keys(cases)){
  context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'});context.setDefaultTimeout(25000);
  page=await context.newPage();page.on('pageerror',error=>errors.push({case:current,error:error.message}));
  try{await runInventory(book);console.log('PASS inventory '+book);}
  catch(error){const file=path.join(out,'inventory-'+book+'-failure.png');await page.screenshot({path:file}).catch(()=>{});results.push({case:current,status:'FAIL',error:error.message,stack:error.stack,screenshots:[file]});throw error;}
  finally{await context.close();context=null;}
 }
 assert.deepEqual(errors,[],'No application errors');assert.deepEqual(missing,[],'All requested assets are published');completed=true;
}catch(error){failure=error;}
finally{
 fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:completed?(observe?'OBSERVED':'PASS'):'FAIL',root,current,mutation,results,errors,missing},null,2)+'\n');
 if(context)await context.close();if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
 console.log(JSON.stringify({status:completed?(observe?'OBSERVED':'PASS'):'FAIL',out,checks:results.length}));
}
if(failure)throw failure;
