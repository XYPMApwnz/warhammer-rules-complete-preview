/** Translate 3: exact rendered text through native import, physical roster
 * actions, Personal Guide and the normal Service Worker transport. No renderer
 * or source reader is mocked. Run baseline and feature with one shared fixture
 * file; --compare BASELINE.json compares the complete text observations. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';

const source=fileURLToPath(new URL('../',import.meta.url));
const argv=process.argv.slice(2),values=name=>argv.flatMap((value,index)=>value===name?[argv[index+1]]:[]),value=name=>values(name)[0];
const root=path.resolve(value('--root')||source),output=value('--out'),prepare=value('--write-fixtures'),comparison=value('--compare');
const onlyNoospheric=argv.includes('--only-noospheric');
const selectedCases=values('--case'),selectedBooks=value('--books')?.split(',')||[];
const skipNoospheric=argv.includes('--skip-noospheric');
assert.ok(output||prepare,'Use --out JSON or --write-fixtures JSON');
const cmp=(a,b)=>a<b?-1:a>b?1:0,clone=structuredClone;
const sha=value=>createHash('sha256').update(value).digest('hex');
const stable=value=>JSON.stringify(value&&typeof value==='object'&&!Array.isArray(value)?Object.fromEntries(Object.keys(value).sort(cmp).map(key=>[key,value[key]])):value);
const bookIds=['adeptus-mechanicus','blood-angels','chaos-space-marines','dark-angels','death-guard','emperors-children','space-marines','tau-empire','tyranids'];
assert.ok(selectedBooks.every(id=>bookIds.includes(id)),'Unknown selected book');
const selected=fixture=>(!selectedBooks.length||selectedBooks.includes(fixture.bookId))&&(!selectedCases.length||selectedCases.includes(fixture.id));

function prepareFixtures(destination){
 fs.mkdirSync(path.dirname(path.resolve(destination)),{recursive:true});
 const files={books:destination+'.books.json',csm:destination+'.csm.json'};
 for(const [family,script]of [['books','v2/conditions-book-parity.mjs'],['csm','v2/conditions-csm-parity.mjs']]){
  const result=spawnSync(process.execPath,[path.join(source,script),'--root',root,'--write-fixtures',files[family]],{cwd:source,encoding:'utf8',maxBuffer:32*1024*1024});
  assert.equal(result.status,0,'Existing source-backed fixture preparation failed: '+script+'\n'+result.stderr);
 }
 const cases=JSON.parse(fs.readFileSync(files.books,'utf8')).map(row=>({...row,family:'native-book'}));
 cases.push(...JSON.parse(fs.readFileSync(files.csm,'utf8')).map(row=>({...row,bookId:'chaos-space-marines',family:'csm-import'})));
 // The source-backed charge corpus includes actual CSM detachment text cases
 // which are battle-only and therefore absent from the executable-effect 61.
 return import('./charge-qa-fixtures.mjs').then(({chargeFixtures})=>{
  for(const fixture of chargeFixtures.filter(row=>row.bookId==='chaos-space-marines'))cases.push({...fixture,id:'F1-F2/'+fixture.id,family:'charge'});
  const daemon=chargeFixtures.find(row=>row.id==='csm-daemonkin');assert.ok(daemon);
  for(const detachment of ['Creations of Bile',"Huron's Marauders"]){
   const text=daemon.text.replace('Veterans of the Long War',detachment)+'\n'+
    '10x Cultist Mob (50 pts)\n• 1x Cultist Champion: Autopistol, Brutal assault weapon\n• 9x Chaos Cultist: Autopistol, Brutal assault weapon\n'+
    '1x Heretic Astartes Daemon Prince (100 pts): Infernal cannon, Hellforged weapons\nDaemonic Allegiance: Khorne\n';
   cases.push({bookId:'chaos-space-marines',id:'F1/table/'+detachment,text,family:'detachment-table'});
  }
  cases.sort((a,b)=>cmp(a.bookId,b.bookId)||cmp(a.id,b.id));
  const snapshots=[];for(const file of values('--states')){
   const parsed=JSON.parse(fs.readFileSync(file,'utf8'));
   for(const scenario of parsed.scenarios||[])if(scenario.state){
    const bookId=scenario.bookId||scenario.state.bookId;assert.ok(bookIds.includes(bookId));
    snapshots.push({bookId,id:scenario.id,state:scenario.state,family:'existing-native-snapshot'});
   }
  }
  snapshots.sort((a,b)=>cmp(a.bookId,b.bookId)||cmp(a.id,b.id));
  const result={schema:'source-refs-browser-fixtures/v1',bookIds,cases,snapshots,
   provenance:'Existing native text recipes and optional saved physical scenario snapshots. No new gameplay rule, recipient or field value is inferred.'};
  fs.writeFileSync(destination,JSON.stringify(result,null,2)+'\n');return result;
 });
}
if(prepare){const fixtures=await prepareFixtures(path.resolve(prepare));console.log(JSON.stringify({status:'PASS',cases:fixtures.cases.length,snapshots:fixtures.snapshots.length,output:prepare}));process.exit(0);}
assert.ok(value('--fixtures'),'Prepare one shared --fixtures JSON before comparing roots');
const fixtures=JSON.parse(fs.readFileSync(value('--fixtures'),'utf8'));
assert.deepEqual([...new Set(fixtures.cases.map(row=>row.bookId))].sort(cmp),bookIds.slice().sort(cmp),'All nine books must have real imports');
const out=path.resolve(output),shots=out.replace(/\.json$/i,'')+'-screenshots';fs.mkdirSync(path.dirname(out),{recursive:true});
const prefix='/source-refs-parity/',mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
const manifestFile=path.join(root,fs.existsSync(path.join(root,'PAGES_RUNTIME_MANIFEST.json'))?'PAGES_RUNTIME_MANIFEST.json':'tools/pages-runtime-manifest.json');
const allowed=new Set(JSON.parse(fs.readFileSync(manifestFile,'utf8')).files.map(row=>row.path));
const errors=[],missing=[],requests=[],snapshots=[],textCatalog=new Map(),tableChecks=[],screenshots=[],importObservations=[];
const importTimings=[],timingOutput=value('--timing-out');
const completedNoospheric=new Set();
const resume=value('--resume');
if(resume){
 const saved=JSON.parse(fs.readFileSync(resume,'utf8'));assert.equal(saved.schema,'source-refs-browser-parity/v1');assert.ok(saved.observations,'Resume requires actual completed text observations');
 assert.deepEqual(saved.errors,[],'Do not resume a checkpoint with application exceptions');assert.deepEqual(saved.missing,[],'Do not resume missing runtime resources');
 if(saved.fixtureSha256)assert.equal(saved.fixtureSha256,sha(fs.readFileSync(value('--fixtures'))),'Resume fixtures changed');
 if(saved.runtimeManifestSha256)assert.equal(saved.runtimeManifestSha256,sha(fs.readFileSync(manifestFile)),'Resume runtime changed');
 for(const viewport of ['desktop','mobile'])if(['ONLINE','OFFLINE'].every(phase=>saved.observations.tableChecks.some(row=>row.viewport===viewport&&row.phase===phase))&&['online','offline'].every(frame=>saved.observations.snapshots.some(row=>row.viewport===viewport&&row.id==='Noospheric/normal-worker'&&row.frame===frame)))completedNoospheric.add(viewport);
 importObservations.push(...saved.observations.imports.filter(row=>!row.scenario.includes('/Noospheric/')||completedNoospheric.has(row.scenario.split('/')[0])));
 snapshots.push(...saved.observations.snapshots.filter(row=>row.id!=='Noospheric/normal-worker'||completedNoospheric.has(row.viewport)));
 tableChecks.push(...saved.observations.tableChecks.filter(row=>completedNoospheric.has(row.viewport)));
 screenshots.push(...(saved.screenshots||[]).filter(file=>completedNoospheric.has(path.basename(file).split('-')[0])));
 for(const [id,text]of Object.entries(saved.observations.texts))textCatalog.set(id,text);
}
let active=null;
const server=http.createServer((request,response)=>{
 try{
  const url=new URL(request.url,'http://localhost');if(url.pathname==='/favicon.ico'){response.writeHead(204).end();return;}
  assert.ok(url.pathname.startsWith(prefix));let relative=decodeURIComponent(url.pathname.slice(prefix.length));if(!relative||relative.endsWith('/'))relative+='index.html';
  assert.ok(allowed.has(relative),'Resource outside reviewed runtime: '+relative);
  const file=path.resolve(root,relative);assert.ok(file.startsWith(path.resolve(root)+path.sep));
  requests.push(relative);response.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});response.end(fs.readFileSync(file));
 }catch(error){missing.push({scenario:active,path:request.url,error:error.message});response.writeHead(404).end('Unavailable runtime resource');}
});
await new Promise(resolve=>server.listen(Number(value('--port')||0),'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}${prefix}`,entry=origin+'v2/app.html';
const browser=await launchChromium();
const poll=async(page,fn,arg,timeout=60000)=>page.waitForFunction(fn,arg,{timeout});
async function ready(page){await poll(page,()=>!!window.WarhammerAppV2);await page.evaluate(async()=>{await window.WarhammerAppV2.ready;await window.ArmyBookAppV2?.rosterPanel?.ready;});}
async function book(page,id){await page.goto(entry+'?v2=ROSTER&book='+id,{waitUntil:'load'});await ready(page);await poll(page,()=>!!window.ArmyBookAppV2?.roster);}
async function roster(page){await page.evaluate(()=>window.ArmyBookAppV2.openRoster());await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();}
async function worker(page){
 await poll(page,()=>!!navigator.serviceWorker.controller);
 await poll(page,()=>navigator.serviceWorker.getRegistration().then(registration=>registration?.active?.state==='activated'&&!registration.installing&&!registration.waiting));
}
function intern(text){assert.equal(typeof text,'string');const id=sha(Buffer.from(text,'utf8'));if(textCatalog.has(id))assert.equal(textCatalog.get(id),text);else textCatalog.set(id,text);return id;}
async function stableCardLayout(page){
 await page.waitForFunction(()=>[...document.querySelectorAll('link[rel="stylesheet"]')].every(link=>!!link.sheet));
 await page.evaluate(async()=>{
  await document.fonts.ready;
  const {flushDatasheetLayouts}=await import(new URL('../books/shared/army-book-app-v2/datasheet-v1-layout.mjs',location.href));
  const main=document.querySelector('main');flushDatasheetLayouts(main);
  let revision=0;const changed=()=>revision++;
  const mutations=new MutationObserver(changed),resizes=new ResizeObserver(changed);
  mutations.observe(main,{childList:true,subtree:true,characterData:true});
  for(const node of main.querySelectorAll('.unit-card,.ds-arsenal,.ds-support'))resizes.observe(node);
  const frame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
  try{for(let attempt=0;attempt<60;attempt++){const before=revision;await frame();await frame();if(before===revision)return;}throw new Error('Datasheet layout did not become quiet for two frames');}
  finally{mutations.disconnect();resizes.disconnect();}
 });
}
async function imported(page,fixture){
 const bindingSelections=[];
 await roster(page);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(fixture.text);
 await page.locator('[data-roster-action="review-import"]').click();await poll(page,()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
 if(!/^Roster imported\./.test(await page.locator('.v2-roster-status').innerText())){
  const bindings=fixture.bindings||{};for(const group of Object.values(bindings))for(const [key,choice]of Object.entries(group||{})){
   assert.equal(typeof choice,'string','This fixture requires a source-backed explicit identity selection');
   await page.locator('[data-binding-key='+JSON.stringify(key)+'] select').selectOption(choice);
   bindingSelections.push({key,choice,reason:'EXPLICIT_FIXTURE_BINDING'});
  }
  if(fixture.family==='csm-import'&&fixture.bearerProfileId){
   const key=JSON.stringify(['parsed-unit-'+fixture.sourceOrdinal,fixture.owner]);
   const field=page.locator('fieldset[data-binding-kind="ENHANCEMENT_BEARER"][data-binding-key='+JSON.stringify(key)+']');
   if(await field.count()){
    const source=JSON.parse(fs.readFileSync(path.join(root,'books',fixture.bookId,'v2/generated/roster-runtime.json'),'utf8')).entities.find(row=>row.id===fixture.bearerProfileId);
    assert.ok(source,'The fixture bearer must identify an existing canonical profile');
    const title=source.data.composition?.name||source.data.name||source.displayName;
    const choices=await field.locator('option').evaluateAll((nodes,title)=>nodes.filter(node=>node.value&&node.textContent===title).map(node=>node.value),title);
    assert.equal(choices.length,1,'The explicit fixture profile must identify exactly one displayed physical bearer; no guessing');
    await field.locator('select').selectOption(choices[0]);bindingSelections.push({key,choice:choices[0],canonicalProfileId:fixture.bearerProfileId,reason:'EXPLICIT_FIXTURE_BEARER'});
   }
  }
  const confirm=page.locator('[data-roster-action="resolve-bindings"]');
  if(bindingSelections.length&&await confirm.count()&&await confirm.isEnabled()){
   await confirm.click();await poll(page,()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
  }
 }
 const status=await page.locator('.v2-roster-status').innerText(),accepted=/^Roster imported\./.test(status);
 const visible=await page.locator('main').evaluate(main=>({textContent:main.textContent,innerText:main.innerText}));
 importObservations.push({scenario:active,bookId:fixture.bookId,id:fixture.id,accepted,status,bindingSelections,textContent:intern(visible.textContent),innerText:intern(visible.innerText),cardsAvailable:accepted});
 if(!accepted)return false;
 return true;
}
async function capture(page,viewport,id,frame,{onlyUnits=false}={}){
 await page.evaluate(()=>window.ArmyBookAppV2.openPersonalGuide());
 await page.locator('main').waitFor();
 const state=await page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());
 const targets=onlyUnits?[]:await page.locator('main a[data-target-id]').evaluateAll(nodes=>[...new Set(nodes.map(node=>node.dataset.targetId))].filter(id=>id&&!id.startsWith('roster-unit/')));
 const cards=[];
 for(const target of [...targets,...state.units.map(unit=>'roster-unit/'+unit.instanceId)]){
  const opened=await page.evaluate(target=>target.startsWith('roster-unit/')?window.ArmyBookAppV2.openInstance(target.slice(12)):window.ArmyBookAppV2.open(target),target);
  assert.notEqual(opened,false,'An actual Personal Guide target was not resolvable: '+target);
  if(target.startsWith('roster-unit/'))await page.locator('main .unit-card[data-roster-instance-id='+JSON.stringify(target.slice(12))+']').waitFor();
  await stableCardLayout(page);
  const text=await page.locator('main').evaluate(main=>({textContent:main.textContent,innerText:main.innerText,
   sources:[...main.querySelectorAll('p,small')].map(node=>node.innerText).filter(text=>/^Sources?:/.test(text)),
   appliesTo:[...main.querySelectorAll('p,small')].map(node=>node.innerText).filter(text=>/^Applies to:/.test(text))}));
  cards.push({target,textContent:intern(text.textContent),innerText:intern(text.innerText),sourceLabels:text.sources,appliesToLabels:text.appliesTo});
 }
 snapshots.push({viewport,id,frame,bookId:state.bookId,cards});
 return state;
}
async function sourceTable(page,viewport,phase){
 await page.evaluate(()=>window.ArmyBookAppV2.openInstance('parsed-unit-3'));
 await stableCardLayout(page);
 const card=page.locator('main .unit-card[data-roster-instance-id="parsed-unit-3"]');await card.waitFor();
 const outer=card.locator('[data-detachment-rule-id="detachment-haloscreed-battle-clade:rule"]');
 const fields=outer.locator('[data-detachment-field-text]'),tables=outer.locator('table[data-detachment-source-table]');
 assert.equal(await fields.count(),1,'Noospheric source prose is shown once');assert.equal(await tables.count(),1,'Noospheric source table is shown once');
 const table=await outer.evaluate(node=>{
  const field=node.querySelector('[data-detachment-field-text]'),table=node.querySelector('table[data-detachment-source-table]'),tokens=[];
  function visit(current){if(current===table){tokens.push({kind:'TABLE'});return;}if(current.nodeType===Node.TEXT_NODE){tokens.push({kind:'TEXT',text:current.textContent});return;}for(const child of current.childNodes)visit(child);}
  visit(field);const position=tokens.findIndex(token=>token.kind==='TABLE');
  return {inline:field.contains(table),before:tokens.slice(0,position).map(token=>token.text||'').join(''),after:tokens.slice(position+1).map(token=>token.text||'').join(''),
   cells:[...table.querySelectorAll('tr')].map(row=>[...row.querySelectorAll('th,td')].map(cell=>cell.textContent)),
   textContent:node.textContent,innerText:node.innerText};
 });
 assert.equal(table.inline,true,'The table must retain its source-bound inline position');
 assert.match(table.before,/as follows:\s*$/,'The table immediately follows the recorded source boundary');
 assert.deepEqual(table.cells,[['INCURSION:','1 UNIT'],['STRIKE FORCE','2 UNITS'],['ONSLAUGHT','3 UNITS']]);
 tableChecks.push({viewport,phase,inline:table.inline,before:intern(table.before),after:intern(table.after),cells:table.cells,textContent:intern(table.textContent),innerText:intern(table.innerText)});
 return table;
}
async function operations(page,fixture,viewport,id){
 const state=await page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());let pair;
 if(fixture.omega)pair={leader:'parsed-unit-27',bodyguard:'parsed-unit-1'};
 else if(fixture.attachments?.length){for(const edge of fixture.attachments){const current=await page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());
   await page.evaluate(({leader,bodyguard})=>window.ArmyBookAppV2.roster.attach(leader,bodyguard),{leader:current.units[edge.leaderOrdinal-1].instanceId,bodyguard:current.units[edge.bodyguardOrdinal-1].instanceId});
   await capture(page,viewport,id,'attached/'+edge.leaderOrdinal);
  }}
 else if(fixture.bodyguard&&fixture.source)pair={leader:fixture.source,bodyguard:fixture.bodyguard};
 else pair=await page.evaluate(()=>{const s=window.ArmyBookAppV2.roster;for(const unit of s.snapshot().units){const candidate=s.candidates?.(unit.instanceId)?.[0];if(candidate)return {leader:unit.instanceId,bodyguard:candidate.instanceId};}return null;});
 if(pair){
  await page.evaluate(({leader,bodyguard})=>window.ArmyBookAppV2.roster.attach(leader,bodyguard),pair);await capture(page,viewport,id,'attached');
  await page.evaluate(()=>{const s=window.ArmyBookAppV2.roster;s.load(s.snapshot());});await capture(page,viewport,id,'reload-attached');
  if(fixture.bookId==='emperors-children'){
   await page.evaluate(()=>{const s=window.ArmyBookAppV2.roster;s.load({...s.snapshot(),initialAttachmentStep:'DECLARE_BATTLE_FORMATIONS',initialAttachments:structuredClone(s.snapshot().attachments)});});
   await capture(page,viewport,id,'dated-initial-formation');
  }
  await page.evaluate(leader=>window.ArmyBookAppV2.roster.detach(leader),pair.leader);await capture(page,viewport,id,'detached');
  const target=await page.evaluate(({leader,previous})=>window.ArmyBookAppV2.roster.candidates?.(leader)?.find(row=>row.instanceId!==previous)?.instanceId||previous,{leader:pair.leader,previous:pair.bodyguard});
  await page.evaluate(({leader,target})=>window.ArmyBookAppV2.roster.reattach(leader,target),{leader:pair.leader,target});await capture(page,viewport,id,'reattached');
 }
 if(fixture.initialAttachments){await page.evaluate(()=>{const s=window.ArmyBookAppV2.roster;s.load({...s.snapshot(),initialAttachments:structuredClone(s.snapshot().attachments)});});await capture(page,viewport,id,'initial-history');}
 for(const choice of [...(fixture.sourceChoices||[]),...(fixture.sourceChoice?[fixture.sourceChoice]:[])]){
  await page.evaluate(choice=>window.ArmyBookAppV2.roster.setSourceChoice(choice.source,choice.ruleId,choice.value),choice);await capture(page,viewport,id,'source-choice/'+choice.source);
 }
 await page.evaluate(()=>{const s=window.ArmyBookAppV2.roster;s.load(s.snapshot());});await capture(page,viewport,id,'reload');
 assert.equal(state.bookId,fixture.bookId);
}
function firstDifference(a,b,p=''){
 if(Object.is(a,b))return null;
 if(!a||!b||typeof a!=='object'||typeof b!=='object')return {path:p,before:a,after:b};
 const ak=Object.keys(a).sort(cmp),bk=Object.keys(b).sort(cmp);if(stable(ak)!==stable(bk))return {path:p,beforeKeys:ak,afterKeys:bk};
 for(const key of ak){const found=firstDifference(a[key],b[key],p+'/'+key);if(found)return found;}return null;
}
const networkFailures=[];let diagnosticPage=null;
const report={schema:'source-refs-browser-parity/v1',status:'RUNNING',scope:onlyNoospheric?'NOOSPHERIC_DIAGNOSTIC':'FULL_CORPUS',fixtureSha256:sha(fs.readFileSync(value('--fixtures'))),runtimeManifestSha256:sha(fs.readFileSync(manifestFile)),...(resume?{resumedObservations:resume}:{}),transport:'Normal localhost Service Worker; no cache injection or mocked renderer',observations:null,errors,missing,screenshots,networkFailures};
function checkpoint(){
 if(selectedBooks.length||selectedCases.length){report.scope='SELECTED_FIXTURES';report.selectedBookIds=selectedBooks;report.selectedCaseIds=selectedCases;report.selectedFixtures=fixtures.cases.filter(selected).length;}
 report.observations={imports:importObservations,snapshots:[...snapshots].sort((a,b)=>cmp(a.viewport,b.viewport)||cmp(a.bookId,b.bookId)||cmp(a.id,b.id)||cmp(a.frame,b.frame)),texts:Object.fromEntries([...textCatalog].sort(([a],[b])=>cmp(a,b))),tableChecks};
 report.counts={books:new Set(snapshots.map(row=>row.bookId)).size,sourceFixtures:fixtures.cases.length,savedSnapshotFixtures:(fixtures.snapshots||[]).length,acceptedImports:importObservations.filter(row=>row.accepted).length,rejectedOrPendingImports:importObservations.filter(row=>!row.accepted).length,scenarioViews:snapshots.length,cardViews:snapshots.reduce((n,row)=>n+row.cards.length,0),uniqueTextBytes:[...textCatalog.values()].reduce((n,text)=>n+Buffer.byteLength(text,'utf8'),0)};
 report.partialSnapshotCount=snapshots.length;fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
}
try{
 for(const [viewport,size]of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]){
  if(value('--viewport')&&value('--viewport')!==viewport)continue;
  const completedFixtures=new Set(importObservations.filter(row=>row.scenario.startsWith(viewport+'/')).map(row=>row.scenario));
  if(!onlyNoospheric&&completedNoospheric.has(viewport)&&fixtures.cases.every(row=>completedFixtures.has(viewport+'/'+row.bookId+'/'+row.id))&&!(fixtures.snapshots||[]).length){console.log('REUSED COMPLETE CHECKPOINT '+viewport);continue;}
  const context=await browser.newContext({viewport:size,serviceWorkers:'allow'}),page=await context.newPage();page.setDefaultTimeout(60000);
  diagnosticPage=page;
  page.on('requestfailed',request=>{const failure={scenario:active,url:request.url(),errorText:request.failure()?.errorText};networkFailures.push(failure);console.error('REQUEST_FAILED '+JSON.stringify(failure));});
  page.on('pageerror',error=>errors.push({scenario:active,message:error.message}));
  try{
   await page.goto(entry);await ready(page);await worker(page);
   const completed=new Set(importObservations.filter(row=>row.scenario.startsWith(viewport+'/')).map(row=>row.scenario));
   for(const fixture of onlyNoospheric?[]:fixtures.cases.filter(row=>selected(row)&&!completed.has(viewport+'/'+row.bookId+'/'+row.id))){
    active=viewport+'/'+fixture.bookId+'/'+fixture.id;
    await page.evaluate(()=>localStorage.clear());await book(page,fixture.bookId);
    const importStarted=performance.now(),accepted=await imported(page,fixture);
    importTimings.push({bookId:fixture.bookId,id:fixture.id,viewport,accepted,elapsedMs:performance.now()-importStarted});
    if(timingOutput)fs.writeFileSync(timingOutput,JSON.stringify(importTimings,null,2)+'\n');
    if(!accepted){console.log('CAPTURED IMPORT REJECTION/PENDING '+active);if(importObservations.length%10===0)checkpoint();continue;}
    await capture(page,viewport,fixture.bookId+'/'+fixture.id,'imported');await operations(page,fixture,viewport,fixture.bookId+'/'+fixture.id);
    console.log('CAPTURED '+active);
    if(importObservations.length%10===0)checkpoint();
   }
   for(const fixture of onlyNoospheric?[]:fixtures.snapshots||[]){
    active=viewport+'/saved/'+fixture.bookId+'/'+fixture.id;
    await page.evaluate(()=>localStorage.clear());await book(page,fixture.bookId);
    await page.evaluate(state=>window.ArmyBookAppV2.roster.load(state),fixture.state);
    await capture(page,viewport,'saved/'+fixture.bookId+'/'+fixture.id,'loaded-saved-state');console.log('CAPTURED '+active);
   }
   if(skipNoospheric||completedNoospheric.has(viewport))continue;
   const noosphere=fixtures.cases.find(row=>row.bookId==='adeptus-mechanicus'&&row.id==='F2/AM-1');assert.ok(noosphere,'Existing AM-1 text fixture is required');
   active=viewport+'/Noospheric/online';await page.evaluate(()=>localStorage.clear());await book(page,noosphere.bookId);assert.equal(await imported(page,noosphere),true,'The reviewed AM-1 scenario must import to show Noospheric Transference');
   const onlineState=await capture(page,viewport,'Noospheric/normal-worker','online',{onlyUnits:true});const onlineTable=await sourceTable(page,viewport,'ONLINE');
   fs.mkdirSync(shots,{recursive:true});let image=path.join(shots,viewport+'-noospheric-online.png');await page.screenshot({path:image,fullPage:true});screenshots.push(image);
   await worker(page);await poll(page,async()=>{const url=new URL('books/adeptus-mechanicus/v2/generated/roster-runtime.json',new URL('../',location.href));return Boolean(await caches.match(url));});
   const offlineURL=page.url();await context.setOffline(true);const offline=page;offline.setDefaultTimeout(60000);
   const offlineFailures=[];offline.on('requestfailed',request=>offlineFailures.push({url:request.url(),error:request.failure()?.errorText}));
   offline.on('pageerror',error=>errors.push({scenario:active,message:error.message}));active=viewport+'/Noospheric/offline';
   try{await offline.goto(offlineURL,{waitUntil:'load'});await ready(offline);await poll(offline,()=>!!window.ArmyBookAppV2?.roster,undefined,onlyNoospheric?10000:60000);}
   catch(error){report.offlineDiagnostics||=[];report.offlineDiagnostics.push({viewport,failedRequests:offlineFailures,...await offline.evaluate(async()=>({url:location.href,title:document.title,text:document.querySelector('main')?.innerText||document.body.innerText,cacheEntries:await Promise.all((await caches.keys()).map(async name=>({name,urls:(await(await caches.open(name)).keys()).map(request=>request.url)})))}))});throw error;}
   assert.deepEqual(await offline.evaluate(()=>window.ArmyBookAppV2.roster.snapshot()),onlineState,'Offline reload must preserve the exact saved physical roster');
   await capture(offline,viewport,'Noospheric/normal-worker','offline',{onlyUnits:true});const offlineTable=await sourceTable(offline,viewport,'OFFLINE');assert.deepEqual(offlineTable,onlineTable,'Offline Noospheric source text, cells and inline placement changed');
   image=path.join(shots,viewport+'-noospheric-offline.png');await offline.screenshot({path:image,fullPage:true});screenshots.push(image);await offline.close();
  }catch(error){try{report.failurePage=await page.evaluate(()=>({url:location.href,title:document.title,text:document.querySelector('main')?.innerText||document.body.innerText}));console.error('FAILURE_PAGE '+JSON.stringify(report.failurePage));}catch{}throw error;}finally{await context.close();}
 }
 assert.deepEqual(errors,[],'No application exception is allowed');assert.deepEqual(missing,[],'Every real runtime resource must resolve');
 const texts=Object.fromEntries([...textCatalog].sort(([a],[b])=>cmp(a,b)));
 report.observations={imports:importObservations,snapshots:snapshots.sort((a,b)=>cmp(a.viewport,b.viewport)||cmp(a.bookId,b.bookId)||cmp(a.id,b.id)||cmp(a.frame,b.frame)),texts,tableChecks};
 report.counts={books:new Set(snapshots.map(row=>row.bookId)).size,sourceFixtures:fixtures.cases.length,savedSnapshotFixtures:(fixtures.snapshots||[]).length,acceptedImports:importObservations.filter(row=>row.accepted).length,rejectedOrPendingImports:importObservations.filter(row=>!row.accepted).length,scenarioViews:snapshots.length,cardViews:snapshots.reduce((n,row)=>n+row.cards.length,0),uniqueTextBytes:[...textCatalog.values()].reduce((n,text)=>n+Buffer.byteLength(text,'utf8'),0)};
 if(comparison){const baseline=JSON.parse(fs.readFileSync(comparison,'utf8'));assert.equal(baseline.status,'PASS');const difference=firstDifference(baseline.observations,report.observations);assert.equal(difference,null,'Exact rendered byte parity failed: '+JSON.stringify(difference));report.comparison={status:'PASS',zeroDifference:true};}
 report.status=onlyNoospheric?'DIAGNOSTIC_PASS':'PASS';console.log(JSON.stringify({status:report.status,...report.counts,comparison:report.comparison||null,output:out}));
}catch(error){report.status='FAIL';report.failureScenario=active;report.error=error.stack;if(diagnosticPage&&!diagnosticPage.isClosed())try{report.failurePage=await diagnosticPage.evaluate(()=>({url:location.href,title:document.title,text:document.querySelector('main')?.innerText||document.body.innerText}));console.error('FAILURE_PAGE '+JSON.stringify(report.failurePage));}catch{}process.exitCode=1;console.error(error.stack);}
finally{checkpoint();await browser.close();await new Promise(resolve=>server.close(resolve));}
