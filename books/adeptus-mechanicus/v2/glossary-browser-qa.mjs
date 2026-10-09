import {isApplicationTestDependency} from '../../shared/application-v2/browser-test-dependencies.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {validateGlossary} from '../../shared/army-book-app-v2/glossary.mjs';

import {createReferenceContract} from '../../shared/army-book-app-v2/reference-contract.mjs';

// Exercise the shipped browser payload, not a second search/detail engine or a
// generated source replacement. Normal builds remain the producer's job.
const directory=path.dirname(fileURLToPath(import.meta.url)),repo=path.resolve(directory,'../../..');
const payload=JSON.parse(fs.readFileSync(path.join(directory,'generated/app-presentation.json'),'utf8'));
assert.ok(payload.glossary,'AdMech presentation payload has no glossary index');
const census=validateGlossary(payload.glossary,payload.cards);
const cards=new Map(payload.cards.map(card=>[card.id,card]));
const references=createReferenceContract({cards,index:payload.glossary});
const core=payload.glossary.entries.find(entry=>entry.targetId==='core-deep-strike');
const named=payload.glossary.entries.find(entry=>entry.aliases.some(alias=>alias.fieldPath));
assert.ok(core&&named,'Missing canonical Core / source-heading alias controls');
const namedAlias=named.aliases.find(alias=>alias.fieldPath);
const original=new Map(['generated/effective.json','generated/rule-contracts.json','generated/roster-runtime.json','generated/app-presentation.json']
  .map(name=>[name,fs.readFileSync(path.join(directory,name))]));
const text=`+ FACTION KEYWORD: Imperium - Adeptus Mechanicus
+ DETACHMENT: Haloscreed Battle Clade, Lords of the Forge
Char1: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe
Enhancement: Cognitive Reinforcement
Char2: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe
Enhancement: TL-4Ø9
9x Servitor Battleclade (110 pts)
• 1x Servitor Underseer: Mechanicus pistol, Dataspikes
• 2x Gun Servitor: 2 with Heavy arc rifle, Servo-claw
• 6x Combat Servitor: 6 with Phosphor blaster, Servo-claw
10x Skitarii Rangers (85 pts): 10x Galvanic rifle, 10x Close combat weapon`;
const app='/books/adeptus-mechanicus/v2/app.html',requests=[],legacy=[],unexpected=[];
const forbidden=url=>!isApplicationTestDependency(url)&&(/\/books\/death-guard\/(?!assets\/)/.test(url)||/\/books\/adeptus-mechanicus\/(?!v2\/|assets\/)/.test(url)||
  /target-data|compatible-rules\.json|correction-ledger|enhancement-owner|\/glossary\/(?:data|generated)|\/shared\/(?:roster-parser|effect-runtime|roster-context)\./.test(url));
const allowed=url=>isApplicationTestDependency(url)||url===app||/^\/books\/adeptus-mechanicus\/v2\/(?:theme\.css|[\w.-]+\.mjs|roster-import-aliases\.json|generated\/(?:app-presentation|roster-runtime)\.json)$/.test(url)||
  /^\/books\/shared\/(?:army-book-app-v2|rule-contract-v2|roster-v2)\/[\w.-]+\.(?:mjs|css)$/.test(url)||
  /^\/books\/shared\/(?:datasheet-system|unit-art)\.css$/.test(url)||/^\/(?:books\/adeptus-mechanicus\/assets|assets)\/[\w./-]+\.(?:webp|png|jpe?g|svg)$/.test(url);
const server=http.createServer((request,response)=>{
  const url=new URL(request.url,'http://localhost').pathname;requests.push(url);
  if(forbidden(url)){legacy.push(url);response.writeHead(200,{'Content-Type':'text/javascript'});response.end('throw new Error("LEGACY_GLOSSARY_POISON");');return;}
  if(!allowed(url)){if(url!=='/favicon.ico')unexpected.push(url);response.writeHead(404);response.end();return;}
  const types={'.mjs':'text/javascript','.css':'text/css','.json':'application/json','.html':'text/html','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
  response.writeHead(200,{'Content-Type':types[path.extname(url)]||'image/jpeg','Cache-Control':'no-store'});
  response.end(fs.readFileSync(path.join(repo,url.slice(1))));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const screenshots=process.env.ARMY_APP_V2_SCREENSHOTS;if(screenshots)fs.mkdirSync(screenshots,{recursive:true});
const ready=async page=>{await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.rosterPanel));await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);};
const results=[];let currentPage,step='startup';
try{
 for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
  const context=await browser.newContext({viewport,...(device==='phone'?{isMobile:true,hasTouch:true}:{})}),page=await context.newPage(),errors=[];
  currentPage=page;page.setDefaultTimeout(15000);page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin+app+'#unit-tech-priest-dominus');await ready(page);
  const visibleResults=()=>page.locator('main .v2-glossary-result').evaluateAll(nodes=>nodes.map(node=>node.dataset.targetId));
  const search=async(query,expectedId,expectedScope=null)=>{
    await page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill(query);
    const ids=await visibleResults();
    const expected=references.search(query,{allowedIds:expectedScope}).map(entry=>entry.targetId);
    assert.deepEqual(ids,expected,`${step}: search results differ from canonical index`);
    assert.equal(new Set(ids).size,ids.length,`${step}: duplicate canonical result`);
    if(expectedId)assert.ok(ids.includes(expectedId),`${step}: missing canonical target ${expectedId}`);
  };
  const noDebug=async()=>{
    const text=await page.locator('main').innerText();
    assert.doesNotMatch(text,/\b(?:CORE_MAIN_RULE|CORE_ERRATA|MODEL_ABILITY|DATASHEET_SECTION|SUPPLEMENTAL_DATASHEET_RULE|SUPPORT_EXCEPTION|CURRENT)\b|parsed-unit-|datasheet-[a-z-]+:/,'Machine-facing Glossary label');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${step}: horizontal overflow`);
  };
  const canonicalPopup=async(id)=>{
    await page.waitForSelector('dialog.v2-detail-dialog[open]');
    assert.equal(await page.locator('dialog.v2-detail-dialog[open]').getAttribute('data-canonical-id'),id,`${step}: wrong canonical popup`);
    assert.equal(await page.locator('dialog[open]').count(),1,`${step}: duplicate open dialog`);
    const observation=await page.locator('dialog.v2-detail-dialog[open]').evaluate(dialog=>({
      text:dialog.innerText,facts:[...dialog.querySelectorAll('[data-fact-id]')].map(node=>({id:node.dataset.factId,value:JSON.parse(node.dataset.factValue)})),
      rect:{left:dialog.getBoundingClientRect().left,right:dialog.getBoundingClientRect().right,bottom:dialog.getBoundingClientRect().bottom,top:dialog.getBoundingClientRect().top},
      width:innerWidth,height:innerHeight
    }));
    assert.doesNotMatch(observation.text,/\b(?:CORE_MAIN_RULE|CORE_ERRATA|SUPPORT_EXCEPTION|CURRENT)\b|parsed-unit-/,'Internal labels in canonical popup');
    assert.ok(!observation.text.includes('This entry is not in this army book'),`${step}: unresolved popup`);
    assert.ok(observation.rect.left>=-1&&observation.rect.right<=observation.width+1&&observation.rect.top>=-1&&observation.rect.bottom<=observation.height+1,`${step}: clipped popup`);
    for(const fact of observation.facts){
      const owner=cards.get(fact.id.slice(0,fact.id.indexOf('::')));
      const canonical=owner?.fields.find(field=>field.id===fact.id);
      assert.ok(canonical,`${step}: noncanonical definition fact ${fact.id}`);assert.deepEqual(fact.value,canonical.value,`${step}: canonical value mismatch`);
    }
    assert.ok(observation.facts.length,`${step}: empty canonical popup`);
    return observation.facts.toSorted((a,b)=>a.id.localeCompare(b.id));
  };
  const closePopup=async(method,id)=>{
    if(method==='close')await page.getByRole('button',{name:'Close rule reference',exact:true}).click();
    else if(method==='escape')await page.keyboard.press('Escape');
    else{
      const box=await page.locator('dialog.v2-detail-dialog[open]').boundingBox();
      const candidates=[[1,1],[1,viewport.height-1],[viewport.width-1,viewport.height-1]];
      const point=candidates.find(([x,y])=>x<box.x||x>box.x+box.width||y<box.y||y>box.y+box.height);
      assert.ok(point,'No backdrop click surface');await page.mouse.click(...point);
    }
    await page.waitForSelector('dialog.v2-detail-dialog[open]',{state:'hidden'});
    await page.waitForFunction(id=>document.activeElement?.matches('.v2-glossary-result')&&document.activeElement.dataset.targetId===id,id);
  };
  step=device+'/full-book-open';
  if(device==='phone')await page.getByRole('button',{name:'Open navigation',exact:true}).click();
  await page.getByRole('button',{name:'Mega Glossary',exact:true}).click();
  await page.waitForSelector('main .v2-glossary');assert.equal(await page.evaluate(()=>location.hash),'#view-glossary');
  assert.equal((await visibleResults()).length,census.entries);assert.equal(await page.locator('main [data-fact-id]').count(),0,'Glossary copied canonical definitions');await noDebug();
  if(device==='phone')assert.equal(await page.getByRole('button',{name:'Open navigation',exact:true}).getAttribute('aria-expanded'),'false');
  let aliasChecks=0,canonicalChecks=0;
  // Every canonical entry is reachable in the actual detail resolver. Alias
  // queries are independently fed through the real search input as well.
  for(const entry of payload.glossary.entries){
    step=device+'/canonical/'+entry.targetId;await search(entry.label,entry.targetId);
    await page.locator(`main .v2-glossary-result[data-target-id="${entry.targetId}"]`).click();
    await canonicalPopup(entry.targetId);await closePopup('escape',entry.targetId);canonicalChecks++;
    for(const alias of entry.aliases){step=device+'/alias/'+alias.label;await search(alias.label,entry.targetId);aliasChecks++;}
    if(canonicalChecks%100===0)console.log(JSON.stringify({device,stage:'canonical-glossary',canonicalChecks,aliasChecks,status:'PASS'}));
  }
  for(const [entry,query]of [[core,core.label],[named,namedAlias.label]]){
    step=device+'/history-and-close/'+entry.targetId;await search(query,entry.targetId);
    const link=page.locator(`main .v2-glossary-result[data-target-id="${entry.targetId}"]`);
    await link.click();const facts=await canonicalPopup(entry.targetId);
    await page.reload();await ready(page);assert.deepEqual(await canonicalPopup(entry.targetId),facts);assert.equal(await page.getByRole('searchbox',{name:'Search glossary',exact:true}).inputValue(),query);
    await page.goBack();await page.waitForSelector('dialog[open]',{state:'hidden'});
    await page.goForward();assert.deepEqual(await canonicalPopup(entry.targetId),facts);
    // Reload reconstructs a permalink popup without a live origin element.
    // Check history closure here; focus restoration belongs to fresh clicks.
    await page.keyboard.press('Escape');await page.waitForSelector('dialog[open]',{state:'hidden'});
    for(const method of ['escape','close','outside']){await link.click();await canonicalPopup(entry.targetId);await closePopup(method,entry.targetId);}
    if(screenshots){await page.screenshot({path:path.join(screenshots,`admech-glossary-${device}-${entry===core?'core':'alias'}-search.png`)});
      await link.click();await canonicalPopup(entry.targetId);await page.screenshot({path:path.join(screenshots,`admech-glossary-${device}-${entry===core?'core':'alias'}-popup.png`)});await closePopup('close',entry.targetId);}
  }
  step=device+'/glossary-close-and-deep-link';
  await page.getByRole('button',{name:'Close glossary',exact:true}).click();await page.waitForSelector('main .v2-glossary',{state:'hidden'});
  await page.evaluate(()=>window.ArmyBookAppV2.openGlossary());assert.equal(await page.getByRole('searchbox',{name:'Search glossary',exact:true}).inputValue(),'');
  await page.keyboard.press('Escape');await page.waitForSelector('main .v2-glossary',{state:'hidden'});
  await page.goto(origin+app+'#view-glossary');await ready(page);assert.equal((await visibleResults()).length,census.entries);
  await page.reload();await ready(page);assert.equal((await visibleResults()).length,census.entries);await noDebug();
  for(const query of ['deep-strike','DÉEP STRIKE','ZXQ_NO_SUCH_GLOSSARY_TERM_8426']){step=device+'/normalized-search/'+query;await search(query);}
  step=device+'/personal-import';await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
  await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);await page.locator('[data-roster-action="review-import"]').click();
  await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state?.units?.length===4);
  assert.equal(await page.locator('[data-roster-bindings] select').count(),0,'Manual roster reconstruction requested');
  await page.locator('[data-attachment-candidate-for="parsed-unit-3"]').selectOption('parsed-unit-1');
  await page.locator('[data-attachment-target-instance-id="parsed-unit-3"] [data-roster-action="attach"]').click();
  await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state.attachments.length===1);
  await page.locator('[data-roster-action="open-personal-guide"]').click();await page.waitForFunction(()=>new URLSearchParams(location.search).has('roster'));
  const personalBase=page.url().split('#')[0];
  // The personal book's independently expected rule owners derive from exact
  // selected Detachments, imported units and assigned Enhancements, plus Core.
  const state=await page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());
  const imported=new Set(state.units.map(unit=>unit.canonicalUnitId)),selected=new Set(state.detachmentIds),assigned=new Set(state.units.flatMap(unit=>unit.enhancementIds));
  const scope=new Set();
  for(const card of payload.cards){
    let owner=card;
    while(owner?.parentId)owner=cards.get(owner.parentId);
    if(imported.has(owner?.id)||selected.has(owner?.id)&&!['ENHANCEMENT'].includes(card.kind)||assigned.has(card.id)||card.kind==='ARMY_RULE'||card.id.startsWith('army-rule-'))scope.add(card.id);
    if(card.kind==='ENHANCEMENT'&&!assigned.has(card.id))scope.delete(card.id);
  }
  step=device+'/personal-glossary';
  if(device==='phone')await page.getByRole('button',{name:'Open navigation',exact:true}).click();
  await page.getByRole('button',{name:'Mega Glossary',exact:true}).click();await page.waitForSelector('main .v2-glossary');await noDebug();
  await search('',null,scope);const personalIds=await visibleResults();
  assert.ok(personalIds.includes(core.targetId),'Personal Glossary lost clean Core definitions');
  assert.ok(personalIds.includes('detachment-haloscreed-battle-clade:enhancement:2'),'Assigned Enhancement missing');
  assert.ok(!personalIds.includes('detachment-rad-zone-corps'),'Unselected Detachment leaked');
  assert.ok(!personalIds.includes('detachment-haloscreed-battle-clade:enhancement:3'),'Unassigned Enhancement leaked');
  for(const entry of payload.glossary.entries.filter(entry=>personalIds.includes(entry.targetId))){
    await search(entry.label,entry.targetId,scope);
    for(const alias of entry.aliases)await search(alias.label,entry.targetId,scope);
  }
  for(const entry of [core,payload.glossary.entries.find(entry=>entry.targetId==='detachment-haloscreed-battle-clade:enhancement:2')]){
    await search(entry.label,entry.targetId,scope);await page.locator(`main .v2-glossary-result[data-target-id="${entry.targetId}"]`).click();await canonicalPopup(entry.targetId);await closePopup('escape',entry.targetId);
  }
  await page.goto(personalBase+'#view-glossary');await ready(page);assert.equal(await page.locator('main .v2-glossary').count(),1);
  await page.reload();await ready(page);assert.ok((await visibleResults()).includes(core.targetId));await noDebug();
  if(screenshots)await page.screenshot({path:path.join(screenshots,`admech-personal-glossary-${device}.png`)});
  assert.deepEqual(errors,[],device+': uncaught browser errors');
  results.push({device,viewport,status:'PASS',canonicalPopupChecks:canonicalChecks,aliasSearchChecks:aliasChecks,personalEntries:personalIds.length,
    canonicalTargetsUnique:true,deepLinkReloadBackForward:true,closeEscapeOutsideFocusRestore:true,internalLabels:0,overflow:0,runtimeErrors:0});
  console.log(JSON.stringify(results.at(-1)));await context.close();currentPage=null;
 }
 assert.deepEqual(legacy,[],'Legacy AdMech factual/runtime requests');assert.deepEqual(unexpected,[],'Unexpected browser input path');
 for(const [name,bytes]of original)assert.ok(bytes.equals(fs.readFileSync(path.join(directory,name))),'Browser QA modified '+name);
 const report={status:'PASS',census,results,legacyReads:0,requestedPaths:[...new Set(requests)]};
 if(screenshots)fs.writeFileSync(path.join(screenshots,'admech-glossary-browser-report.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
}catch(error){
 if(screenshots){fs.writeFileSync(path.join(screenshots,'admech-glossary-browser-failure.json'),JSON.stringify({step,message:error.message,stack:error.stack,url:currentPage?.url(),actual:error.actual,expected:error.expected},null,2));
   if(currentPage)await currentPage.screenshot({path:path.join(screenshots,'admech-glossary-browser-failure.png')}).catch(()=>{});}
 throw error;
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
