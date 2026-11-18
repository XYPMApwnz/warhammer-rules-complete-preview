/** Existing exports and source-backed fixtures through public native UI paths.
 * No roster grammar, rule, point, recipient or import-result expectation changes.
 * --mutation=label/option are explicit negative controls of player-copy scanning.
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {assertPlayerImportCopy,collectPlayerImportCopy} from '../tests/helpers/import-copy-assertions.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';

const arg=name=>process.argv.find(value=>value.startsWith(name+'='))?.slice(name.length+1);
const root=path.resolve(arg('--root')||fileURLToPath(new URL('../',import.meta.url)));
const out=path.resolve(arg('--out')||createQaEvidenceDir('wh-import-messages-browser-'));
const widths=(arg('--widths')||'390,1440').split(',').map(Number),mutation=arg('--mutation');
assert(widths.length&&widths.every(width=>Number.isSafeInteger(width)&&width>0));
assert(!mutation||['label','option'].includes(mutation),'Known copy mutation');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const factions=read('v2/fixtures/new-recruit-export.json').factions.filter(row=>!arg('--book')||row.bookId===arg('--book'));
assert(factions.length,'Known --book');
const company=read('v2/fixtures/new-recruit-model-names.json').cases.find(row=>row.id==='company-veteran');
const incomplete=read('v2/fixtures/fabius-safe-import-browser.json').cases.find(row=>row.id==='p26-compact-no-model-rows');
const owner=fs.readFileSync(path.join(root,'v2/fixtures/new-recruit-v37.15-owner-death-guard.txt'),'utf8');
const galleryBooks=new Set(['death-guard','blood-angels','dark-angels','tau-empire']);
const hash=text=>createHash('sha256').update(text).digest('hex');
const expectedInitial='No roster is loaded. Paste your New Recruit text export and select Import roster.';
const expectedHeader='The export header could not be read. Export the complete list as text from New Recruit and try again.';
const report={schema:'import-messages-browser-qa/v1',root,widths,mutation:mutation||null,status:'RUNNING',checks:[],screenshots:[],errors:[],missing:[],inputs:[]};
fs.mkdirSync(out,{recursive:true});
const save=()=>fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify(report,null,2)+'\n');save();
const allowed=new Set(read('tools/pages-runtime-manifest.json').files.map(row=>'/'+row.path));
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.webmanifest':'application/manifest+json'};
const server=http.createServer((request,response)=>{
  const address=decodeURIComponent(new URL(request.url,'http://local').pathname),file=path.resolve(root,'.'+address);
  if(address==='/favicon.ico'){response.writeHead(204).end();return;}
  if(!file.startsWith(root+path.sep)||!allowed.has(address)&&!isApplicationTestDependency(address)||!fs.existsSync(file)){
    report.missing.push(address);response.writeHead(404).end();return;
  }
  response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
let browser,page,current,mutationInjected=false;
const status=()=>page.locator('.v2-roster-status').innerText();
async function settled(){await page.waitForFunction(()=>!document.querySelector('[data-roster-view][aria-busy="true"]'));}
async function check(name,action){
  try{const detail=await action();report.checks.push({...current,name,status:'PASS',detail});save();return detail;}
  catch(error){report.checks.push({...current,name,status:'FAIL',error:error.message});save();throw error;}
}
async function open(book){
  await page.goto(origin+'/v2/app.html');await page.locator(`[data-v2-book=${JSON.stringify(book)}]`).click();
  await page.waitForFunction(book=>window.ArmyBookAppV2?.payload.book.id===book&&ArmyBookAppV2.roster,book);
  await page.evaluate(async()=>{await WarhammerAppV2.ready;await ArmyBookAppV2.rosterPanel.ready;});
  await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();await settled();
}
async function form(){
  const pane=page.locator('details[data-roster-import]');
  if(!await pane.evaluate(node=>node.open))await pane.locator(':scope > summary').click();
  return page.locator('[data-roster-input="raw-text"]');
}
async function submit(text,{ready=false}={}){
  await(await form()).fill(text);await page.locator('[data-roster-action="review-import"]').click();await settled();
  if(ready){const replace=page.locator('[data-roster-action="confirm-replace-roster"]');if(await replace.isVisible()){await replace.click();await settled();}assert.equal(await status(),'Roster imported.');}
  return status();
}
async function observed(){return page.evaluate(()=>({snapshot:ArmyBookAppV2.roster.state,storage:localStorage.getItem(ArmyBookAppV2.rosterPanel.storageKey)}));}
async function shot(name){
  if(!galleryBooks.has(current.book)&&!name.startsWith('choices-'))return;
  await page.locator('[data-roster-view]').scrollIntoViewIfNeeded();await page.evaluate(()=>scrollTo(0,0));
  const file=`${current.book}-${current.width}-${name}.png`;
  await page.screenshot({path:path.join(out,file),animations:'disabled'});
  report.screenshots.push({...current,name,file});save();
}
async function expandDetails(){
  // Use public summary controls, including header guidance and app-authored
  // option/quantity details. RAW export textarea values remain uninspected.
  const details=page.locator('[data-roster-view] details');
  for(let i=0;i<await details.count();i++){
    const node=details.nth(i);if(await node.isVisible()&&!await node.evaluate(value=>value.open))await node.locator(':scope > summary').click();
  }
}
async function guard({expand=true}={}){
  if(expand)await expandDetails();
  if(mutation&&!mutationInjected){
    if(mutation==='label')await page.locator('.v2-roster-status').evaluate(node=>node.textContent='NOT_PROVEN source entry');
    else await page.locator('[data-roster-view]').evaluate(node=>{const select=document.createElement('select'),option=document.createElement('option');option.textContent='Choice parsed-unit-900';select.append(option);node.append(select);});
    mutationInjected=true;
  }
  const records=await page.locator('[data-roster-view]').evaluate(collectPlayerImportCopy);
  return {checkedCopyRecords:assertPlayerImportCopy(records)};
}
async function backupPane(){
  const pane=page.locator('details').filter({has:page.locator('[data-roster-action="export-backup"]')});
  if(!await pane.evaluate(node=>node.open))await pane.locator(':scope > summary').click();return pane;
}
async function unresolvedControl(text){
  const before=await observed();await submit(text);
  // Repeat the same public unresolved native call to inspect exact candidates.
  // NEEDS_BINDINGS is non-committing; neither current nor saved bytes may change.
  const native=await page.evaluate(text=>{const value=ArmyBookAppV2.roster.import(text,{});return {status:value.status,needs:value.needsBindings||[]};},text);
  assert.equal(native.status,'NEEDS_BINDINGS');assert.deepEqual(await observed(),before);
  for(const need of native.needs){
    const field=page.locator(`fieldset[data-binding-key=${JSON.stringify(need.key)}][data-binding-kind=${JSON.stringify(need.kind)}]`);
    if(!await field.count())continue;const select=field.locator('select');if(!await select.count())continue;
    const expected=['SELECTION','ENHANCEMENT_BEARER'].includes(need.kind)?need.candidates.map((candidate,index)=>need.kind==='SELECTION'?String(index):candidate.id):need.candidateIds;
    assert.deepEqual(await select.locator('option').evaluateAll(nodes=>nodes.filter(node=>node.value).map(node=>node.value)),expected,'Exact native candidate IDs and order retained');
    assert.equal(await select.getAttribute('aria-label'),'Choose a match for '+await field.locator('legend').innerText());
  }
  return {nativeStatus:native.status,needs:native.needs.map(need=>({kind:need.kind,candidates:need.candidates?.length??need.candidateIds?.length??0})),...await guard()};
}
function existingConstant(file,first,next,name){
  const source=fs.readFileSync(path.join(root,file),'utf8'),start=source.indexOf(first),end=source.indexOf(next,start);
  assert(start>=0&&end>start,'Existing literal fixture definition');const definition=source.slice(start,end);
  assert(!/\b(?:import|require|process|fs|service)\s*(?:\(|\.)/.test(definition),'Only existing input literal definitions are evaluated');
  return Function(definition+';return '+name+';')();
}
const choices=[
  {book:'tau-empire',name:'student',fixture:'books/tau-empire/v2/physical-choice-qa.mjs: studentText',text:()=>existingConstant('books/tau-empire/v2/physical-choice-qa.mjs','const source=','const imported=','studentText')},
  {book:'tau-empire',name:'prototype',fixture:'books/tau-empire/v2/app-qa.mjs: prototypeText',text:()=>existingConstant('books/tau-empire/v2/app-qa.mjs','const prototypeText=','const service=createTauBrowserRoster','prototypeText')},
  {book:'tyranids',name:'trygon',fixture:'books/tyranids/v2/roster-ui-qa.mjs: choiceText',text:()=>existingConstant('books/tyranids/v2/roster-ui-qa.mjs','const choiceText=','const newChoiceService=','choiceText')}
];
try{
  browser=await launchChromium();
  ordinaryBooks:for(const fixture of factions)for(const width of widths){
    current={book:fixture.bookId,width,scenario:'ordinary-export'};
    report.inputs.push({book:fixture.bookId,fixture:'v2/fixtures/new-recruit-export.json:'+fixture.sourceFixture,sha256:hash(fixture.text)});
    const context=await browser.newContext({viewport:{width,height:width<=760?844:900},serviceWorkers:'block',acceptDownloads:true});page=await context.newPage();page.setDefaultTimeout(30000);
    page.on('pageerror',error=>report.errors.push({...current,error:error.message}));
    try{
      await open(fixture.bookId);
      await check('before-input-copy-and-placement',async()=>{
        assert.equal(await status(),expectedInitial);
        const pane=page.locator('details[data-roster-import]');assert.doesNotMatch(await pane.innerText(),/Import limitations|Rules and points|Source and physical|Chapter context/);
        const notes=page.locator('[data-roster-known-limitations]');
        if(await notes.count()){
          assert.equal(await notes.locator(':scope > summary').innerText(),'Known limitations of this Army Book');assert.equal(await notes.evaluate(node=>node.open),false);
          assert.equal(await notes.evaluate(node=>Boolean(document.querySelector('[data-roster-instances]').compareDocumentPosition(node)&Node.DOCUMENT_POSITION_FOLLOWING)),true,'General limitations follow Setup');
        }
        assert.doesNotMatch(await page.locator('[data-roster-view]').innerText(),/has not yet been checked against a real|authentic .* export has not been verified/);
        await shot('before-input');return guard();
      });
      await check('empty-input-is-error-without-roster',async()=>{
        await submit('');assert.equal(await status(),'No units could be imported. Paste the complete New Recruit text export and try again.');
        assert.equal((await observed()).snapshot,null);return guard();
      });
      await check('successful-import-exact-short-status',async()=>{
        await submit(fixture.text,{ready:true});assert.equal(await page.locator('details[data-roster-import]').evaluate(node=>node.open),false);
        assert.equal(await page.locator('[data-roster-input="raw-text"]').inputValue(),fixture.text,'The original export remains available');
        assert.doesNotMatch(await page.locator('[data-roster-view]').innerText(),/MFM base points|None imported|\b\d+ imported units\b|Enhancements on this unit/);
        const state=(await observed()).snapshot;assert(state.units.length);assert.equal(await page.locator('.v2-roster-instance').count(),state.units.length);
        const summary=page.locator('[data-roster-instances] > section').first();assert.match(await summary.innerText(),new RegExp('\\b'+state.units.length+' '+(state.units.length===1?'unit\\.':'units\\.')));
        for(const unit of state.units)if(!unit.enhancementIds?.length)assert.equal(await page.locator(`[data-roster-instance-id=${JSON.stringify(unit.instanceId)}] dt`).filter({hasText:/^Enhancements$/}).count(),0,'No empty Enhancement field');
        const eligible=await page.locator('[data-roster-warlord-select] option').evaluateAll(nodes=>nodes.filter(node=>node.value&&!node.disabled).map(node=>node.value));
        assert.equal(await page.locator('[data-roster-action="set-warlord"]').count(),eligible.length?1:0,'Save Warlord exists only with eligible candidates');
        await shot('success');return {units:state.units.length,warlordCandidates:eligible.length,...await guard()};
      });
      await check('warlord-and-attachment-statuses',async()=>{
        const select=page.locator('[data-roster-warlord-select]'),value=await select.inputValue();
        const next=await select.locator('option').evaluateAll((nodes,value)=>nodes.find(node=>node.value&&!node.disabled&&node.value!==value)?.value,value);
        if(next){await select.selectOption(next);await page.locator('[data-roster-action="set-warlord"]').click();await settled();assert.equal(await status(),'Warlord saved.');assert.equal((await observed()).snapshot.warlordInstanceId,next);}
        const candidates=page.locator('[data-attachment-candidate-for]');let attached=false;
        for(let i=0;i<await candidates.count();i++){
          const target=candidates.nth(i),leader=await target.locator('option').evaluateAll(nodes=>nodes.find(node=>node.value)?.value);if(!leader)continue;
          const id=await target.getAttribute('data-attachment-candidate-for'),before=(await observed()).snapshot;
          await target.selectOption(leader);await target.locator('xpath=ancestor::article[1]').locator('[data-roster-action="attach"]').click();await settled();
          assert.equal(await status(),'Character or Support attached.');assert((await observed()).snapshot.attachments.some(edge=>edge.leaderInstanceId===leader&&edge.bodyguardInstanceId===id));
          await page.locator(`[data-roster-action="detach"][data-leader-instance-id=${JSON.stringify(leader)}]`).click();await settled();
          assert.equal(await status(),'Character or Support detached.');assert.deepEqual((await observed()).snapshot,before,'Detach restores the prior native state exactly');attached=true;break;
        }
        return {warlordSaved:Boolean(next),attachmentRoundtrip:attached,...await guard()};
      });
      await check('backup-download-reload-restore-short-statuses',async()=>{
        const before=await observed();await backupPane();const pending=page.waitForEvent('download');await page.locator('[data-roster-action="export-backup"]').click();const download=await pending;
        assert.equal(await status(),'Backup downloaded.');assert.deepEqual(JSON.parse(fs.readFileSync(await download.path(),'utf8')),before.snapshot);
        await page.locator('[data-roster-action="reload-saved"]').click();await settled();assert.equal(await status(),'Saved roster reloaded.');assert.deepEqual(await observed(),before);
        await backupPane();await page.locator('input[type="file"]').setInputFiles({name:'existing-roster-backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(before.snapshot))});await settled();
        assert.equal(await status(),'Roster backup restored.');assert.deepEqual(await observed(),before);return guard();
      });
      if(fixture.bookId==='death-guard')await check('existing-owner-export-replacement-can-be-kept',async()=>{
        const before=await observed();await submit(owner);
        const cancel=page.locator('[data-roster-action="cancel-replace-roster"]');
        assert.equal(await cancel.count(),1,'A different existing owner roster requires explicit replacement confirmation');
        assert.equal(await page.locator('[data-roster-action="confirm-replace-roster"]').count(),1);
        assert.match(await page.locator('[data-roster-view]').innerText(),/Replacing this roster clears manual attachments\./);
        await cancel.click();await settled();assert.equal(await status(),'Current roster kept.');assert.deepEqual(await observed(),before);return guard();
      });
      await check('foreign-faction-refusal-preserves-saved-bytes',async()=>{
        const before=await observed(),foreign=fixture.text.replace(/^\+ FACTION KEYWORD:[^\r\n]*/m,'+ FACTION KEYWORD: A Different Army');assert.notEqual(foreign,fixture.text,'Same existing foreign-header control as new-recruit-export-qa');
        await submit(foreign);const title=await page.evaluate(()=>ArmyBookAppV2.payload.book.title);
        assert.equal(await status(),`This list is for A Different Army, but ${title} is open. Open the matching Army Book and import it there.`);
        assert.deepEqual(await observed(),before);await shot('refusal');return guard();
      });
      if(['space-marines','blood-angels','dark-angels'].includes(fixture.bookId))await check('existing-company-veteran-clarification-exact-candidates',async()=>{
        const result=await unresolvedControl(company.text);assert(result.needs.some(need=>need.kind==='PROFILE'&&need.candidates>1),'Existing ambiguous model fixture still needs an exact profile choice');
        assert.doesNotMatch(await page.locator('[data-roster-view]').innerText(),/Matching source entry|This label needs clarification/);
        await shot('clarification');return result;
      });
      if(fixture.bookId==='tau-empire')await check('existing-incomplete-composition-clarification',async()=>{
        const result=await unresolvedControl(incomplete.text);assert(result.needs.some(need=>need.kind==='COMPOSITION_MEMBER'));
        assert.equal(await page.locator('[data-import-hint="composition"]').count()>0,true);await shot('clarification');return result;
      });
      if(fixture.bookId==='death-guard')await check('existing-unsupported-header-details',async()=>{
        const lines=owner.split(/\r?\n/),index=lines.findIndex(line=>line.includes('Detachment Points)'));assert(index>=0);lines.splice(index+1,0,'Additional unrecognized header line');
        const before=await observed();await submit(lines.join('\n'));assert.equal(await status(),expectedHeader);assert.deepEqual(await observed(),before);
        const help=page.locator('[data-import-hint="plain-header"]'),details=help.locator('details');assert.equal(await details.evaluate(node=>node.open),false);
        assert.equal(await details.locator(':scope > summary').innerText(),'Details');await shot('clarification');await details.locator(':scope > summary').click();
        assert.deepEqual(await help.locator('pre').allTextContents(),['Unnamed list (950 Points)\nDeath Guard\nContagion Engines and Paragons of Putrescence (2 Detachment Points)','Unnamed list (760 Points)\nDeath Guard\nShamblerot Vectorium and Virulent Vectorium (5 Detachment Points)\nDisruption\nStrike Force (2,000 Points)']);
        assert.doesNotMatch(await help.innerText(),/exactly three nonempty lines|header could not be recognized/);return guard();
      });
    }catch(error){report.errors.push({...current,error:error.message,stack:error.stack});await page.screenshot({path:path.join(out,`${fixture.bookId}-${width}-FAIL.png`),animations:'disabled'}).catch(()=>{});}
    finally{await context.close();save();}
    if(mutation)break ordinaryBooks;
  }
  if(!mutation)for(const fixture of choices.filter(row=>factions.some(book=>book.bookId===row.book)))for(const width of widths){
    current={book:fixture.book,width,scenario:'choices-'+fixture.name};const text=fixture.text();report.inputs.push({book:fixture.book,fixture:fixture.fixture,sha256:hash(text)});
    const context=await browser.newContext({viewport:{width,height:width<=760?844:900},serviceWorkers:'block'});page=await context.newPage();page.setDefaultTimeout(30000);
    page.on('pageerror',error=>report.errors.push({...current,error:error.message}));
    try{
      await open(fixture.book);await submit(text,{ready:true});
      await check('native-choice-values-and-human-captions',async()=>{
        const native=await page.evaluate(()=>ArmyBookAppV2.roster.state.units.flatMap(unit=>ArmyBookAppV2.roster.sourceChoices(unit.instanceId).map(choice=>({instanceId:unit.instanceId,...choice}))));assert(native.length);
        const captions=[];
        for(const choice of native){
          const field=page.locator(`[data-roster-source-choices-for=${JSON.stringify(choice.instanceId)}] [data-source-choice-id=${JSON.stringify(choice.id)}]`).filter({has:page.locator('select')});assert.equal(await field.count(),1);
          const select=field.locator('select');const actual=await select.locator('option').evaluateAll(nodes=>nodes.map(node=>({value:node.value,title:node.textContent})));
          assert.deepEqual(actual.map(row=>row.value),['',...choice.options.map(row=>row.id)],'Only choice captions change; exact values/count/order retained');
          assert.equal(await select.inputValue(),choice.value||'');assert(actual.every(row=>row.title.trim()));assert.equal(new Set(actual.filter(row=>row.value).map(row=>row.title)).size,choice.options.length,'Distinct physical choices retain distinct captions');captions.push(...actual.map(row=>row.title));
        }
        if(fixture.name==='student'){assert(captions.some(label=>label.includes('Kroot Carnivores (10 models) #1')));assert(captions.some(label=>label.includes('Kroot Carnivores (10 models) #2')));}
        await shot('choices-'+fixture.name);return {choices:native.length,captions,...await guard()};
      });
    }catch(error){report.errors.push({...current,error:error.message,stack:error.stack});await page.screenshot({path:path.join(out,`${fixture.book}-${width}-${fixture.name}-FAIL.png`),animations:'disabled'}).catch(()=>{});}
    finally{await context.close();save();}
  }
}catch(error){report.errors.push({...current,error:error.stack||error.message});throw error;}finally{
  if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
  report.status=report.errors.length||report.missing.length||report.checks.some(row=>row.status==='FAIL')?'FAIL':'PASS';save();
  const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const pairs=new Map();for(const shot of report.screenshots){const key=shot.book+' / '+shot.name;if(!pairs.has(key))pairs.set(key,[]);pairs.get(key).push(shot);}
  fs.writeFileSync(path.join(out,'GALLERY.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Import messages — browser evidence</title><style>body{font:16px system-ui;background:#161b17;color:#eee;margin:24px}a{color:#cbe498}.pair{display:flex;align-items:flex-start;gap:16px}figure{margin:0;width:49%;min-width:0}img{max-width:100%;height:auto;border:1px solid #64795e}h2{margin-top:36px}figcaption{padding:8px} @media(max-width:700px){.pair{display:block}figure{width:100%}}</style><h1>Import messages</h1><p>Existing accepted exports and source-backed clarification controls. Screenshots: 390 and 1440 pixels. <a href="RESULTS.json">Exact checks and fixture provenance</a>.</p>'+[...pairs].map(([key,shots])=>'<section><h2>'+escape(key)+'</h2><div class="pair">'+shots.sort((a,b)=>a.width-b.width).map(shot=>'<figure><figcaption>'+shot.width+' px</figcaption><img loading="lazy" src="'+encodeURIComponent(shot.file)+'" alt="'+escape(key+' at '+shot.width+' pixels')+'"></figure>').join('')+'</div></section>').join(''));
}
console.log(JSON.stringify({status:report.status,checks:report.checks.length,failures:report.checks.filter(row=>row.status==='FAIL').length,errors:report.errors.length,missing:report.missing.length,out}));
assert.equal(report.status,'PASS','Import message browser QA failed; inspect '+path.join(out,'RESULTS.json'));
