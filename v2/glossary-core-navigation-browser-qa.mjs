import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
/** Core-aware reference navigation stays optional: metadata failure cannot disable Glossary. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {encodeRoute} from '../books/shared/army-book-app-v2/route-context.mjs';

const repo=fileURLToPath(new URL('../',import.meta.url));
const out=process.env.WH_CORE_NAV_BROWSER_EVIDENCE||createQaEvidenceDir('core-glossary-navigation-');
fs.mkdirSync(out,{recursive:true});
const corpus=JSON.parse(fs.readFileSync(path.join(repo,'glossary/v2/generated/index.en.json'),'utf8'));
const placements=JSON.parse(fs.readFileSync(path.join(repo,'books/core-rules/reader/search-index.json'),'utf8'));
const controls=[['Deep Strike','core-deep-strike'],['Leader','core-leader'],['Lone Operative','core-lone-operative'],['Advance','core-rule-09-06-advance-move'],['Coherency','core-rule-03-03-coherency']];
const concepts=[['Engagement Range','core-engagement-range'],['Critical Hit','core-critical-hit'],['Wholly Within','core-wholly-within'],['Within','core-within'],['Active Player','core-active-player'],['Objective Control','core-objective-control'],['Attached Unit','core-attached-unit'],['Critical Wound','core-critical-wound']];
const books=['death-guard','adeptus-mechanicus','chaos-space-marines','emperors-children','tyranids','tau-empire','space-marines','dark-angels','blood-angels'];
const types={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg'};
const server=http.createServer((request,response)=>{try{
  if(request.url==='/favicon.ico'){response.writeHead(204).end();return;}
  let file=path.resolve(repo,'.'+new URL(request.url,'http://local').pathname);
  assert(file.startsWith(path.resolve(repo)+path.sep));
  if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  response.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(response);
}catch{response.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`,entry=`${origin}/v2/app.html`;
const report={status:'RUNNING',results:[],metadata:[],errors:[],missing:[]};
const browser=await launchChromium();
const ready=async page=>{await page.waitForFunction(()=>window.WarhammerAppV2);await page.evaluate(()=>window.WarhammerAppV2.ready);};
const navigate=async(page,route)=>{await page.evaluate(async route=>await window.WarhammerAppV2.navigate(route),route);await ready(page);};
const child=async page=>(await page.locator('iframe.v2-core-reader').elementHandle()).contentFrame();
const article=(page,id)=>page.locator(`.global-glossary-main article.v1-reference-article[data-card-id="${id}"]`);
const popupArticle=(page,id)=>page.locator(`dialog.term-popup[open] article.v1-reference-article[data-card-id="${id}"]`);
const status=async(page,value)=>page.locator(`[data-core-navigation-status="${value}"]`).waitFor();
const glossaryURL=id=>{const owner=corpus.entries.find(entry=>entry.id===id)?.sourceOwner;assert(owner,id);return encodeRoute(entry,{destination:'GLOSSARY',registryId:owner.bookId||'core-rules',canonicalId:owner.canonicalId,fieldPath:'/glossary/'+id.replaceAll('~','~0').replaceAll('/','~1')});};
const corePlacement=canonical=>{const placement=placements.find(item=>item.id===canonical);assert(placement,canonical);return {chapter:placement.url.split('.html')[0],section:placement.url.split('#')[1]};};
async function coreLocation(page,canonical){
  const place=corePlacement(canonical);await ready(page);
  assert.equal(new URL(page.url()).searchParams.get('v2'),'CORE_RULES');
  assert.equal(new URL(page.url()).hash,'#'+canonical);assert.equal(new URL(page.url()).searchParams.get('chapter'),place.chapter);
  await(await child(page)).locator('#'+place.section).waitFor();
}
async function popup(page,query,canonical){
  await page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill(query);
  const first=page.locator('.global-glossary-main a[data-target-id]').first();await first.waitFor();
  assert.equal(await first.getAttribute('data-target-id'),'core::'+canonical,query+' definition first');await first.click();
  await page.locator('dialog.term-popup[open]').waitFor();const view=popupArticle(page,'core::'+canonical);await view.waitFor();
  assert((await view.innerText()).length>150,query+' full definition');return view;
}
function observe(page,{metadataFault=false}={}){
  page.on('pageerror',error=>report.errors.push(error.message));
  page.on('response',response=>{if(response.status()>=400&&!response.url().endsWith('/favicon.ico')&&!(metadataFault&&response.url().endsWith('/books/core-rules/reader/search-index.json')))report.missing.push(response.url());});
}
try{
  for(const width of (process.env.WH_CORE_NAV_BROWSER_METADATA_ONLY?[]:[1440,390])){
    const context=await browser.newContext({viewport:{width,height:width===390?844:900},serviceWorkers:'block'}),page=await context.newPage();observe(page);
    const row={width,glossary:[],reader:[],concepts:[],books:[],negative:[]};report.results.push(row);
    await page.goto(entry);await ready(page);
    for(const [query,canonical] of controls){
      await navigate(page,{destination:'GLOSSARY'});await status(page,'READY');const view=await popup(page,query,canonical);
      const open=view.getByRole('link',{name:'Open in Core Rules',exact:true});assert.equal(await open.count(),1);const href=await open.getAttribute('href');
      await page.screenshot({path:path.join(out,`${width}-${canonical}-popup.png`)});await open.click();await page.waitForURL(href);await coreLocation(page,canonical);
      await page.reload();await coreLocation(page,canonical);await page.goBack();await page.getByRole('searchbox',{name:'Search glossary',exact:true}).waitFor();
      assert.equal(await page.getByRole('searchbox',{name:'Search glossary',exact:true}).inputValue(),query);await page.goForward();await coreLocation(page,canonical);
      row.glossary.push({query,canonical,definitionFirst:true,fullDefinition:true,coreAction:true,reload:true,historyQuery:true});
    }
    await page.goto(glossaryURL('core::core-deep-strike'));await article(page,'core::core-deep-strike').waitFor();await status(page,'READY');
    assert.equal(await article(page,'core::core-deep-strike').getByRole('link',{name:'Open in Core Rules'}).count(),1);
    await page.reload();await article(page,'core::core-deep-strike').waitFor();await status(page,'READY');row.directGlossaryReload=true;
    for(const [query,canonical] of controls){
      await navigate(page,{destination:'CORE_RULES',registryId:'core-rules',chapterId:'core-abilities'});const frame=await child(page);
      await frame.locator('#searchButton').click();await frame.locator('#searchInput').fill(query);const first=frame.locator('#searchResults a').first();await first.waitFor();
      const href=new URL(await first.getAttribute('href'),entry);assert.equal(href.searchParams.get('v2'),'CORE_RULES');assert.equal(href.hash,'#'+canonical);
      await first.click();await page.waitForURL(url=>url.hash==='#'+canonical);await coreLocation(page,canonical);assert.equal(await page.locator('[data-global-glossary]').count(),0);row.reader.push({query,canonical,status:'PASS'});
    }
    // Source-owned concepts have full definitions but no standalone Reader placement.
    // Both entry modes use the same qualified canonical REFERENCE contract.
    const standalone=await context.newPage();observe(standalone);
    await standalone.goto(`${origin}/books/core-rules/reader/core-abilities.html`);
    await standalone.locator('#searchButton').click();
    for(const [query,canonical] of concepts){
      const source=corpus.entries.find(item=>item.id==='core::'+canonical);
      assert.equal(source?.recordType,'CORE_CONCEPT',query+' accepted concept identity');
      assert.equal(source.sourceOwner.canonicalId,canonical);
      assert.equal(placements.some(item=>item.id===canonical),false,'do not fabricate a Reader placement');
      await standalone.locator('#searchInput').fill(query);
      await standalone.waitForFunction(id=>[...document.querySelectorAll('#searchResults a')].some(link=>new URL(link.href).searchParams.get('field')==='/glossary/core::'+id),canonical);
      const standaloneHref=await standalone.locator('#searchResults a').evaluateAll((nodes,id)=>nodes.find(link=>new URL(link.href).searchParams.get('field')==='/glossary/core::'+id).href,canonical);
      assert.equal(new URL(standaloneHref).pathname,'/v2/app.html');assert.equal(new URL(standaloneHref).searchParams.get('v2'),'REFERENCE');assert.equal(decodeURIComponent(new URL(standaloneHref).hash.slice(1)),canonical);
      await navigate(page,{destination:'CORE_RULES',registryId:'core-rules',chapterId:'core-abilities'});const readerURL=page.url(),frame=await child(page);
      await frame.locator('#searchButton').click();await frame.locator('#searchInput').fill(query);
      await frame.waitForFunction(id=>[...document.querySelectorAll('#searchResults a')].some(link=>decodeURIComponent(new URL(link.href).hash.slice(1))===id),canonical);
      const target=await frame.locator('#searchResults a').evaluateAll((nodes,id)=>nodes.findIndex(link=>decodeURIComponent(new URL(link.href).hash.slice(1))===id),canonical);
      const link=frame.locator('#searchResults a').nth(target),referenceURL=await link.getAttribute('href');
      assert.equal(new URL(referenceURL).searchParams.get('v2'),'REFERENCE');assert.equal(new URL(referenceURL).hash,'#'+canonical);
      assert.equal(new URL(referenceURL).searchParams.get('field'),'/glossary/core::'+canonical);
      await link.click();await page.waitForURL(referenceURL);await article(page,'core::'+canonical).waitFor();
      const definition=await article(page,'core::'+canonical).locator('.reference-definition').innerText();
      const normalize=value=>value.replace(/\s+/g,' ').trim();assert(normalize(definition).includes(normalize(source.facts.semanticContent)),query+' complete canonical definition');
      await status(page,'READY');assert.equal(await article(page,'core::'+canonical).getByRole('link',{name:'Open in Core Rules'}).count(),0,'unplaced concept has no false Core action');
      await page.goBack();await page.waitForURL(readerURL);await ready(page);await page.locator('iframe.v2-core-reader').waitFor();
      await page.goForward();await page.waitForURL(referenceURL);await article(page,'core::'+canonical).waitFor();
      await page.reload();await article(page,'core::'+canonical).waitFor();assert.equal(new URL(page.url()).hash,'#'+canonical);
      await page.screenshot({path:path.join(out,`${width}-${canonical}-fallback.png`)});
      await page.goto(standaloneHref);await article(page,'core::'+canonical).waitFor();
      assert(normalize(await article(page,'core::'+canonical).locator('.reference-definition').innerText()).includes(normalize(source.facts.semanticContent)),query+' direct canonical definition');
      row.concepts.push({query,canonical,standaloneTarget:new URL(standaloneHref).search+new URL(standaloneHref).hash,referenceTarget:new URL(referenceURL).search+new URL(referenceURL).hash,fullCanonicalDefinition:true,backForwardReload:true});
    }
    await standalone.close();
    await navigate(page,{destination:'CORE_RULES',registryId:'core-rules',chapterId:'core-concepts'});
    let battleFrame=await child(page);
    const battleSource=corpus.entries.find(item=>item.id==='core::core-rule-01-07-battle-shock-rolls');assert(battleSource);
    await battleFrame.locator('details').evaluateAll(nodes=>nodes.forEach(node=>node.open=true));
    await battleFrame.locator('[data-term="core-rule-01-07-battle-shock-rolls"]').first().click();
    const battleLink=battleFrame.locator('#termFull');await battleLink.waitFor({state:'visible'});
    const battleURL=await battleLink.getAttribute('href');assert.equal(new URL(battleURL).searchParams.get('v2'),'REFERENCE');
    assert.equal(new URL(battleURL).searchParams.get('field'),'/glossary/core::core-rule-01-07-battle-shock-rolls');
    await battleLink.click();const battleArticle=article(page,battleSource.id);await battleArticle.waitFor();
    assert((await battleArticle.locator('.reference-definition').innerText()).replace(/\s+/g,' ').includes(battleSource.facts.semanticContent.replace(/\s+/g,' ')));
    await page.reload();await battleArticle.waitFor();await page.screenshot({path:path.join(out,`${width}-battle-shock-article.png`)});
    row.battleShockFullArticle=true;
    // A reading-context round trip uses the existing popup/history contracts.
    await navigate(page,{destination:'CORE_RULES',registryId:'core-rules',chapterId:'monsters-vehicles'});const readingURL=page.url();let reading=await child(page);
    await reading.locator('[data-term="core-blast"]').first().click();await reading.locator('#termFull').click();await article(page,'core::core-blast').waitFor();await status(page,'READY');
    await article(page,'core::core-blast').getByRole('link',{name:'Open in Core Rules'}).click();await page.waitForURL(url=>url.searchParams.get('v2')==='CORE_RULES');await coreLocation(page,'core-blast');
    await page.goBack();await article(page,'core::core-blast').waitFor();await page.goBack();await page.waitForURL(readingURL);await ready(page);reading=await child(page);
    await reading.locator('#termDialog[open]').waitFor();assert.equal(await reading.locator('#termDialog').getAttribute('data-open-term'),'core::core-blast');row.readingContextRoundTrip=true;
    await navigate(page,{destination:'GLOSSARY'});await page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill('zzzz-invented-no-rule-zzzz');assert.equal(await page.locator('.global-glossary-main a[data-target-id]').count(),0);
    for(const [id,hasAction] of [['core::core-active-player',false],['army::adeptus-mechanicus::datasheet_section::unit-tech-priest-dominus::datasheet-tech-priest-dominus:section:3',false],['army::chaos-space-marines::core_ability_membership::unit-abaddon-the-despoiler::datasheet-abaddon-the-despoiler:rule-reference:1',true]]){
      await page.goto(glossaryURL(id));await article(page,id).waitFor();await status(page,'READY');const action=article(page,id).getByRole('link',{name:'Open in Core Rules'});assert.equal(await action.count(),Number(hasAction));
      if(hasAction){assert.equal(new URL(await action.getAttribute('href')).hash,'#core-deep-strike');await action.click();await page.waitForURL(url=>url.searchParams.get('v2')==='CORE_RULES');await coreLocation(page,'core-deep-strike');}
      row.negative.push({id,hasAction});
    }
    for(const book of books){
      const owned=corpus.entries.filter(item=>item.domain==='ARMY'&&item.sourceOwner.bookId===book);
      const ownedIds=owned.map(item=>item.sourceOwner.canonicalId);assert(ownedIds.length,book+' source samples');
      await navigate(page,{destination:'ARMY_BOOK',bookId:book,registryId:book});await page.waitForFunction(()=>window.ArmyBookAppV2?.payload?.book);
      assert.equal(await page.evaluate(()=>window.ArmyBookAppV2.payload.book.id),book);
      const sample=await page.evaluate(ownedIds=>{const payload=window.ArmyBookAppV2.payload;const entries=payload.glossary.entries.filter(item=>ownedIds.includes(item.targetId));const record=['ARMY_RULE','ARMY_RULE_COMPONENT','DETACHMENT_RULE','STRATAGEM'].map(kind=>entries.find(item=>item.category===kind)).find(Boolean)||entries[0];return record&&{targetId:record.targetId,label:record.label};},ownedIds);assert(sample,book+' explicit source-owned Glossary sample');
      await page.evaluate(()=>window.ArmyBookAppV2.openGlossary());await page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill(sample.label);
      await page.locator(`a[data-target-id="${sample.targetId}"]`).first().waitFor();row.books.push({book,targetId:sample.targetId,query:sample.label});
    }
    await navigate(page,{destination:'CORE_RULES',registryId:'core-rules',chapterId:'movement-phase'});let frame=await child(page);
    await frame.locator('a.rule-reference[href*="aircraft"]').click();await page.waitForURL(url=>url.searchParams.get('chapter')==='aircraft');await ready(page);frame=await child(page);
    assert.equal(await frame.locator('#rule-23-01').count(),1);assert.equal(await frame.locator('#rule-23-02').count(),1);assert.equal(await frame.locator('#termDialog[open]').count(),0);row.b1Aircraft=true;
    await context.close();fs.writeFileSync(path.join(out,'REPORT.json'),JSON.stringify(report,null,2));
  }
  // These failures are deliberately limited to optional Core navigation metadata.
  // The same current corpus/definitions/search/reference navigation must stay usable.
  const faults=['http404','networkAbort','malformedJSON','invalidArray','invalidObject','emptyArray','foreignOrigin','delayed','success'];
  for(const [width,fault] of [1440,390].flatMap(width=>faults.map(fault=>[width,fault]))){
    const context=await browser.newContext({viewport:{width,height:width===390?844:900},serviceWorkers:'block'}),page=await context.newPage();observe(page,{metadataFault:true});
    let release;const gate=new Promise(resolve=>release=resolve);
    if(fault!=='success')await context.route('**/books/core-rules/reader/search-index.json',async route=>{
      if(fault==='delayed'){await gate;await route.continue();return;}
      if(fault==='networkAbort'){await route.abort('failed');return;}
      const body={http404:'not found',malformedJSON:'{bad json',invalidArray:JSON.stringify([{id:'core-deep-strike',url:'missing.html#invented'}]),invalidObject:'{}',emptyArray:'[]',foreignOrigin:JSON.stringify([{id:'core-deep-strike',url:'https://foreign.invalid/core.html#rule-24-09'}])}[fault];
      await route.fulfill({status:fault==='http404'?404:200,contentType:'application/json',body});
    });
    await page.goto(encodeRoute(entry,{destination:'GLOSSARY'}));await page.getByRole('searchbox',{name:'Search glossary',exact:true}).waitFor();
    await status(page,fault==='delayed'?'LOADING':fault==='success'?'READY':'UNAVAILABLE');
    const diagnostic=await page.locator('[data-core-navigation-status]').evaluate(node=>({status:node.dataset.coreNavigationStatus,reason:node.dataset.coreNavigationError||null}));
    if(diagnostic.status==='UNAVAILABLE')assert(diagnostic.reason?.length,'failure reason remains observable');
    const view=await popup(page,'Deep Strike','core-deep-strike');assert.equal(await view.getByRole('link',{name:'Open in Core Rules'}).count(),Number(fault==='success'));
    await view.getByRole('link',{name:'Open full entry',exact:true}).click();await article(page,'core::core-deep-strike').waitFor();
    assert.equal(await article(page,'core::core-deep-strike').getByRole('link',{name:'Open in Core Rules'}).count(),Number(fault==='success'));
    assert.equal(await page.getByText('Glossary unavailable',{exact:true}).count(),0);
    await page.getByRole('button',{name:'Glossary',exact:true}).click();await page.getByRole('searchbox',{name:'Search glossary',exact:true}).waitFor();
    await popup(page,'Coherency','core-rule-03-03-coherency');
    if(fault==='delayed'){
      const before=await page.evaluate(()=>({url:location.href,history:history.length,query:document.querySelector('input[aria-label="Search glossary"]').value,popup:document.querySelector('dialog.term-popup[open] article').dataset.cardId}));
      release();await status(page,'READY');await popupArticle(page,'core::core-rule-03-03-coherency').getByRole('link',{name:'Open in Core Rules'}).waitFor();
      assert.deepEqual(await page.evaluate(()=>({url:location.href,history:history.length,query:document.querySelector('input[aria-label="Search glossary"]').value,popup:document.querySelector('dialog.term-popup[open] article').dataset.cardId})),before,'late actions must preserve URL/history/query/popup');
    }
    report.metadata.push({width,fault,diagnostic,status:'PASS',search:true,definitions:true,referenceArticle:true,glossaryNavigation:true,coreActions:fault==='delayed'?'absent while LOADING, present after READY':fault==='success'?'present':'absent'});
    await context.close();fs.writeFileSync(path.join(out,'REPORT.json'),JSON.stringify(report,null,2));
  }
  // Required corpus failures retain the existing explicit error path.
  for(const fault of ['http404','malformedJSON']){
    const context=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'}),page=await context.newPage();
    page.on('pageerror',error=>report.errors.push(error.message));
    await context.route('**/glossary/v2/generated/index.en.json',route=>route.fulfill({status:fault==='http404'?404:200,contentType:'application/json',body:fault==='http404'?'not found':'{bad json'}));
    await page.goto(encodeRoute(entry,{destination:'GLOSSARY'}));await page.getByRole('heading',{name:'Glossary unavailable',exact:true}).waitFor();
    assert.equal(await page.getByRole('searchbox',{name:'Search glossary',exact:true}).count(),0,'required corpus failure must not invent an empty catalog');
    report.metadata.push({width:1440,fault:'requiredCorpus-'+fault,status:'PASS',expected:'existing Glossary unavailable error path'});await context.close();
  }
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.missing,[]);report.status='PASS';
}catch(error){report.status='FAIL';report.error=error.stack;report.failureState=[];for(const context of browser.contexts())for(const page of context.pages()){try{report.failureState.push(await page.evaluate(()=>({url:location.href,text:document.querySelector('main')?.innerText?.slice(0,2500),route:window.WarhammerAppV2?.currentRoute,revision:window.WHPwaExpectedRevision})));}catch{}}throw error;}
finally{await browser.close();await new Promise(resolve=>server.close(resolve));fs.writeFileSync(path.join(out,'REPORT.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify({status:report.status,viewports:report.results.map(row=>({width:row.width,controls:row.glossary.length,reader:row.reader.length,concepts:row.concepts.length,books:row.books.length})),metadata:report.metadata,evidence:out}));
