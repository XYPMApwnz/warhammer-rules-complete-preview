/** Small dist-only acceptance requested by the owner; no source/runtime edits. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {createResponder} from './runtime-server.mjs';
const evidence='E:/Warhammer/qa-evidence/release-candidate-v5-2026-11-22';
const temporary='E:/Warhammer/qa-tmp/release-candidate-v5';
const source=temporary+'/clean-room-clone',root=temporary+'/clean-room-runner/dist-pages';
const candidate=JSON.parse(fs.readFileSync(evidence+'/CANDIDATE.json','utf8'));
const manifest=JSON.parse(fs.readFileSync(root+'/PAGES_RUNTIME_MANIFEST.json','utf8'));
assert.equal(execFileSync('git',['rev-parse','HEAD'],{cwd:source,encoding:'utf8'}).trim(),candidate.candidate);
assert.equal(execFileSync('git',['status','--porcelain'],{cwd:source,encoding:'utf8'}).trim(),'');
assert.equal(manifest.contentSha256,'f975aa7a6c68073dd86c46b512e9cc1b8664209abce937fad128e91616095af5');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const owner=JSON.parse(fs.readFileSync(source+'/v2/fixtures/new-recruit-plain-header-v37.25.json','utf8')).owner;
const fixture=fs.readFileSync(path.join(source,'v2/fixtures',owner.file));assert.equal(hash(fixture),owner.sha256);
const out=evidence+'/browser';assert(!fs.existsSync(out));fs.mkdirSync(out);
const profiles=temporary+'/browser-profiles';assert(!fs.existsSync(profiles));fs.mkdirSync(profiles);
const osTemp=profiles+'/os-temp';fs.mkdirSync(osTemp);for(const key of ['TEMP','TMP','TMPDIR'])process.env[key]=osTemp;
const {chromium}=createRequire(source+'/package.json')('playwright');
const records=[],prefix='/warhammer-rules-complete-preview/';
const responder=createResponder(()=>({root,label:candidate.candidate}),{prefix,records});
const server=responder.http();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
assert(![8765,8443].includes(server.address().port));
const origin=`http://127.0.0.1:${server.address().port}`,entry=origin+prefix;
const report={schema:'release-candidate-v5-smoke/v1',status:'RUNNING',candidate:candidate.candidate,
  package:manifest.contentSha256,fixture:{file:owner.file,sha256:owner.sha256,encoding:owner.encoding},
  browser:'Installed Chrome, headless Chromium; mobile viewport emulation is not a physical-device check',
  scope:'Only Home, one Army Book (Death Guard), authentic owner DG v37.25 import at 390 and 1440.',cases:[]};
const save=()=>fs.writeFileSync(out+'/RESULTS.json',JSON.stringify(report,null,2)+'\n');save();
let context;
try{
  for(const width of [390,1440]){
    const row={width,status:'RUNNING',steps:[],screenshots:[],pageErrors:[],consoleErrors:[],failedRequests:[]};report.cases.push(row);
    context=await chromium.launchPersistentContext(profiles+'/'+width,{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,
      viewport:{width,height:width===390?844:1000},isMobile:width===390,hasTouch:width===390,serviceWorkers:'allow'});
    const page=context.pages()[0]||await context.newPage();page.setDefaultTimeout(60000);
    let phase='home';
    page.on('pageerror',error=>row.pageErrors.push({phase,message:error.message}));
    page.on('console',message=>{if(message.type()==='error')row.consoleErrors.push({phase,message:message.text()});});
    page.on('requestfailed',request=>row.failedRequests.push({phase,url:request.url(),failure:request.failure()}));
    const step=async(name,body)=>{phase=name;const begin=performance.now();console.log(width+' '+name);const result=await body();row.steps.push({name,status:'PASS',elapsedMs:Math.round(performance.now()-begin),result});save();};
    const ready=async()=>{await page.waitForFunction(()=>!!window.WarhammerAppV2&&!document.querySelector('[data-v2-loading]'));await page.evaluate(()=>WarhammerAppV2.ready);};
    const native=async()=>{await page.waitForFunction(()=>window.ArmyBookAppV2?.payload?.book?.id==='death-guard');await page.evaluate(async()=>{await WarhammerAppV2.ready;await ArmyBookAppV2.rosterPanel?.ready;await document.fonts.ready;});};
    const shot=async name=>{const file=width+'-'+name+'.jpg';await page.screenshot({path:out+'/'+file,type:'jpeg',quality:76,fullPage:false});row.screenshots.push(file);};
    await step('home',async()=>{await page.goto(entry,{waitUntil:'domcontentloaded'});await ready();assert.equal(await page.locator('[data-v2-book]').count(),9);await shot('home');return{bookLinks:9};});
    await step('death-guard-library',async()=>{
      await page.locator('[data-v2-book="death-guard"]').click();await ready();await native();
      const view=await page.evaluate(()=>({book:ArmyBookAppV2.payload.book.id,expected:ArmyBookAppV2.payload.groups.reduce((n,g)=>n+g.itemIds.length,0),shown:document.querySelectorAll('main .v2-library-card').length}));
      assert.equal(view.book,'death-guard');assert(view.expected>0);assert.equal(view.shown,view.expected);await shot('death-guard');return view;
    });
    await step('authentic-DG-v37.25-import',async()=>{
      await page.goto(entry+'v2/app.html?v2=ROSTER&book=death-guard',{waitUntil:'domcontentloaded'});await ready();await native();
      const details=page.locator('details[data-roster-import]');if(!await details.evaluate(node=>node.open))await details.locator(':scope > summary').click();
      await page.locator('[data-roster-input="raw-text"]').fill(fixture.toString('utf8'));
      await page.locator('[data-roster-action="review-import"]').click();
      await page.waitForFunction(()=>document.querySelector('.v2-roster-status')?.textContent==='Roster imported.'&&ArmyBookAppV2.roster.state.units.length===8);
      assert.equal(await page.locator('[data-roster-instance-id]').count(),8);await shot('DG-import');
      return{status:'READY',message:await page.locator('.v2-roster-status').innerText(),units:8};
    });
    assert.deepEqual(row.pageErrors,[]);assert.deepEqual(row.consoleErrors,[]);assert.deepEqual(row.failedRequests,[]);
    row.status='PASS';await context.close();context=null;save();
  }
  report.status='PASS';
}catch(error){report.status='FAIL';report.error=error.stack;process.exitCode=1;console.error(error.stack);if(context){const page=context.pages()[0];await page?.screenshot({path:out+'/FAILURE.jpg',type:'jpeg',quality:78}).catch(()=>{});}}
finally{
  await context?.close();responder.close();server.closeAllConnections?.();await new Promise(resolve=>server.close(resolve));
  report.network={requests:records.length,httpFailures:records.filter(row=>row.status>=400)};
  if(report.network.httpFailures.length){report.status='FAIL';process.exitCode=1;}
  save();fs.writeFileSync(out+'/NETWORK.json',JSON.stringify(records,null,2)+'\n');console.log(JSON.stringify({status:report.status,out}));
}
