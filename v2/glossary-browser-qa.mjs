/** Fresh real-browser global Glossary smoke; no standalone viewer runtime is served. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {adaptGlobalGlossary} from '../books/shared/army-book-app-v2/global-glossary.mjs';
import {createReferenceContract} from '../books/shared/army-book-app-v2/reference-contract.mjs';
import {encodeRoute,decodeRoute} from '../books/shared/army-book-app-v2/route-context.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';

const repo=fileURLToPath(new URL('../',import.meta.url));
const corpus=JSON.parse(fs.readFileSync(path.join(repo,'glossary/v2/generated/index.en.json'),'utf8'));
const projection=adaptGlobalGlossary(corpus),contract=createReferenceContract({cards:new Map(projection.cards.map(card=>[card.id,card])),index:projection.index});
const includedBooks=['death-guard','adeptus-mechanicus','chaos-space-marines'];
const excludedBooks=['emperors-children','tyranids','tau-empire','space-marines','dark-angels','blood-angels'];
const canonicalEntry=(bookId,canonicalId)=>{
  const matches=corpus.entries.filter(item=>item.domain==='ARMY'&&item.sourceOwner.bookId===bookId&&item.sourceOwner.canonicalId===canonicalId);
  assert.equal(matches.length,1,`${bookId}/${canonicalId}: exactly one canonical owner`);return matches[0];
};
for(const book of excludedBooks)assert.ok(!corpus.entries.some(item=>item.domain==='ARMY'&&item.sourceOwner.bookId===book&&
  !(item.contexts||[]).some(context=>includedBooks.includes(context.effectiveBookId))),`${book}: unsupported standalone book`);
const updatedReferences=[
  {book:'death-guard',id:'unit-lord-of-contagion',pattern:/\bT\s+7\b/,text:['Invulnerable Save 4+','Vector of Disease','While this model is leading a unit','Manreaper','UNIT COMPOSITION']},
  {book:'death-guard',id:'datasheet-lord-of-contagion:weapon:1',pattern:/\bS\s+9\b/,text:['AP -2','D 3','lethal hits']},
  {book:'death-guard',id:'datasheet-lord-of-contagion:section:1',text:['Vector of Disease','While this model is leading a unit','Unholy Resilience','once per battle']},
  {book:'adeptus-mechanicus',id:'detachment-luminen-auto-choir:stratagem:2',text:[
    'Your Movement phase, when a friendly ELECTRO-PRIESTS unit is selected to make an advance move.',
    'That move does not prevent your unit from being eligible to declare a charge.'],absent:/BATTLECLADE/},
  {book:'adeptus-mechanicus',id:'detachment-haloscreed-battle-clade:stratagem:5',text:[
    'Your Movement phase, when a friendly ADEPTUS MECHANICUS unit is selected to make a fall-back move.',
    'your unit can re-roll hazard rolls.']},
  {book:'adeptus-mechanicus',id:'faq-2',text:[
    'When I select one of Thulia Ghuld’s Icon of War abilities, when do I select the unit that ability affects?',
    'When you have selected the Icon of War ability you want to use.']},
  {book:'chaos-space-marines',id:'datasheet-legionaries:profile:1',pattern:/\bT\s+5\b/},
  {book:'chaos-space-marines',id:'datasheet-havocs:profile:1',pattern:/\bW\s+3\b/},
  {book:'chaos-space-marines',id:'datasheet-chaos-lord:weapon:4',pattern:/\bS\s+5\b/,text:['Astartes chainblade']}
];
const csmAbility=canonicalEntry('chaos-space-marines','datasheet-chaos-lord:section:1:block:0:text');
for(const book of includedBooks){
  const points=corpus.entries.filter(item=>item.domain==='ARMY'&&item.sourceOwner.bookId===book&&item.recordType==='UNIT')
    .flatMap(item=>item.mfm?.pointRecords||[]);
  assert.ok(points.length,`${book}: source-owned MFM points remain available`);
  assert.ok(points.every(point=>point.provenance.sourceVersion==='v1.6'),`${book}: stale MFM source version`);
}
const requests=[],forbidden=[],errors=[],results=[];
const types={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json',
  '.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg'};
const server=http.createServer((request,response)=>{
  const address=new URL(request.url,'http://localhost').pathname;requests.push(address);
  if(address==='/favicon.ico'){response.writeHead(204);response.end();return;}
  const allowed=isApplicationTestDependency(address)||/^\/v2\/[\w./-]+\.(?:html|mjs|css)$/.test(address)||
    /^\/books\/(?:death-guard|adeptus-mechanicus|chaos-space-marines)\/v2\/[\w./-]+\.(?:html|mjs|json|css)$/.test(address)||
    /^\/books\/shared\/(?:application-v2|army-book-app-v2|roster-v2|rule-contract-v2)\/[\w.-]+\.(?:mjs|css)$/.test(address)||
    /^\/books\/shared\/(?:datasheet-system|unit-art)\.css$/.test(address)||
    /^\/(?:assets|books\/(?:death-guard|adeptus-mechanicus|chaos-space-marines)\/assets)\/[\w./-]+\.(?:png|webp|jpe?g|svg)$/.test(address)||
    ['/glossary/index.html','/glossary/v2/compatibility.mjs','/glossary/v2/generated/index.en.json'].includes(address);
  const file=path.resolve(repo,address.slice(1));
  if(!allowed||!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    forbidden.push(address);response.writeHead(404);response.end();return;
  }
  response.writeHead(200,{'Content-Type':types[path.extname(file)],'Cache-Control':'no-store'});response.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`,entry=origin+'/v2/app.html';
const installed='C:/Program Files/Google/Chrome/Application/chrome.exe';
const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||(fs.existsSync(installed)?installed:undefined);
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
const screenshots=process.env.V2_GLOSSARY_SCREENSHOTS||'E:/Warhammer/qa-artifacts/mega-glossary-v2';fs.mkdirSync(screenshots,{recursive:true});
const ready=async page=>{
  await page.waitForFunction(()=>Boolean(window.WarhammerAppV2));await page.evaluate(async()=>{await window.WarhammerAppV2.ready;await window.ArmyBookAppV2?.rosterPanel?.ready;});
  await page.waitForFunction(()=>[...document.querySelectorAll('link[rel="stylesheet"]')].every(link=>Boolean(link.sheet)));
};
const active=async(page,id)=>{await page.waitForFunction(id=>window.WarhammerAppV2?.activeBookId===id,id);await ready(page);};
const screenshot=(page,name)=>page.screenshot({path:path.join(screenshots,name+'.png'),fullPage:false});
const global=async page=>{await active(page,null);assert.equal(await page.locator('[data-global-glossary]').count(),1);assert.equal(await page.locator('[data-army-book-v2]').count(),0);};
const search=async(page,query)=>{await page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill(query);};
const targetLink=(page,id)=>page.locator('.v2-glossary-result[data-target-id="'+id+'"]');
const article=async(page,id,dialog=false)=>{const node=page.locator((dialog?'dialog[open]':'main')+' article.v1-reference-article[data-card-id="'+id+'"]');await node.waitFor();return node;};
const topGlossary=async page=>{await page.locator('[data-v2-primary-nav] [data-v2-destination="GLOSSARY"]').click();await global(page);await page.getByRole('searchbox',{name:'Search glossary',exact:true}).waitFor();};
const geometry=async page=>{
  const report=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,
    roots:document.querySelectorAll('[data-v2-shell]').length,global:document.querySelectorAll('[data-global-glossary]').length,
    categoryLabels:[...document.querySelectorAll('[data-glossary-category]')].map(node=>node.innerText),
    text:document.querySelector('[data-global-glossary]')?.innerText||''}));
  assert.equal(report.overflow,false,'Global Glossary overflows viewport');assert.equal(report.roots,1);assert.equal(report.global,1);
  assert.ok(!report.categoryLabels.some(label=>/^[A-Z]+(?:_[A-Z]+)+$/.test(label)),'Internal category enum visible');
  assert.ok(!/CORE_MAIN_RULE|CORE_ERRATA|\[object Object\]|SUPPORT_EXCEPTION/.test(report.text),'Internal/debug labels visible');
};
const popupGeometry=async page=>{
  const box=await page.locator('dialog[open]').evaluate(node=>{const b=node.getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:innerWidth,height:innerHeight,scroll:node.scrollHeight,client:node.clientHeight};});
  assert.ok(box.left>=-1&&box.right<=box.width+1&&box.top>=-1&&box.bottom<=box.height+1,'Reference popup clips viewport '+JSON.stringify(box));
};
try {
  for(const [device,viewport]of [['desktop',{width:1440,height:900}],['phone',{width:390,height:844}]]) {
    const context=await browser.newContext({viewport,serviceWorkers:'block'});context.on('page',page=>{page.setDefaultTimeout(20000);page.on('pageerror',error=>errors.push(error.message));
      page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});});
    const homeRequestStart=requests.length;
    const page=await context.newPage();await page.goto(entry);await ready(page);
    assert.deepEqual(requests.slice(homeRequestStart).filter(address=>
      /^\/books\/(?:death-guard|adeptus-mechanicus|chaos-space-marines)\/v2\//.test(address)&&!address.endsWith('/registration.mjs')),
    [],'Home loaded book factual data or roster service before book selection');
    const home=await page.evaluate(()=>({title:document.title,html:document.querySelector('.v2-library-home').outerHTML,
      background:getComputedStyle(document.querySelector('.v2-library-home')).backgroundImage,styles:[...document.querySelectorAll('link[rel="stylesheet"]')].map(link=>link.href)}));
    await page.locator('.v2-library-home a[data-v2-shell-link][href*="v2=GLOSSARY"]').first().click();await global(page);
    assert.equal(await page.locator('.v2-search-status').innerText(),`${corpus.entries.length} entries found`);
    assert.equal(await page.locator('.v2-glossary-result').count(),120,'Initial global catalog must preserve V1 progressive loading');
    await page.getByRole('button',{name:'Show more entries',exact:true}).click();
    assert.equal(await page.locator('.v2-glossary-result').count(),240,'Progressive loading silently truncated global coverage');
    assert.equal(await page.locator('.v2-search-status').innerText(),`${corpus.entries.length} entries found`);
    assert.equal(await page.locator('[data-glossary-category=""]').getAttribute('aria-pressed'),'true');await geometry(page);
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await screenshot(page,device+'-catalog');
    const category=contract.categories().find(category=>category.label==='Core Concept');assert.ok(category);
    await page.locator('[data-glossary-category="'+category.id+'"]').click();
    const expected=contract.search('',{category:category.id}).map(entry=>entry.targetId).sort();
    assert.deepEqual(await page.locator('.v2-glossary-result').evaluateAll(nodes=>nodes.map(node=>node.dataset.targetId).sort()),expected);
    await page.locator('[data-glossary-category=""]').click();
    const deep='core::core-deep-strike';await search(page,'Deep Strike');assert.equal(await targetLink(page,deep).count(),1);
    await search(page,'core-anti-infantry');assert.equal(await targetLink(page,'core::core-anti').count(),1,'Alias search lost canonical reference');
    await search(page,'Many units have core abilities listed');assert.equal(await targetLink(page,'core::core-abilities').count(),1,'Definition search failed');
    const mainRule=contract.categories().find(category=>category.label==='Main Rule');
    await page.locator('[data-glossary-category="'+mainRule.id+'"]').click();
    await search(page,'Deep Strike');const link=targetLink(page,deep);const href=await link.getAttribute('href');
    assert.deepEqual(decodeRoute(href),decodeRoute(encodeRoute(entry,{destination:'GLOSSARY',...contract.identityFor(deep)})));
    await link.click();await article(page,deep,true);await popupGeometry(page);await screenshot(page,device+'-popup');
    const expectedDefinition=contract.resolve(deep).sections.flatMap(section=>section.fields.map(field=>field.value)).join('\n');
    assert.ok((await page.locator('dialog[open]').innerText()).includes(expectedDefinition),'Popup definition differs from enrolled canonical content');
    assert.ok((await page.locator('dialog[open]').innerText()).includes('Open full entry'));
    await page.keyboard.press('Escape');assert.equal(await page.locator('dialog[open]').count(),0);
    assert.equal(await link.evaluate(node=>node===document.activeElement),true,'Escape failed focus restoration');
    await link.click();await article(page,deep,true);await page.getByRole('button',{name:'Close rule reference',exact:true}).click();
    assert.equal(await link.evaluate(node=>node===document.activeElement),true,'Close failed focus restoration');
    await link.click();await article(page,deep,true);await page.mouse.click(2,2);assert.equal(await page.locator('dialog[open]').count(),0,'Outside click failed');
    await link.click();await article(page,deep,true);await page.getByRole('link',{name:'Open full entry',exact:true}).click();await article(page,deep);await global(page);
    assert.deepEqual(decodeRoute(page.url()),decodeRoute(href),'Popup permalink changed canonical identity');await screenshot(page,device+'-article');
    await page.reload();await ready(page);await article(page,deep);
    await page.goBack();await ready(page);await page.getByRole('searchbox',{name:'Search glossary',exact:true}).waitFor();
    assert.equal(await page.getByRole('searchbox',{name:'Search glossary',exact:true}).inputValue(),'Deep Strike','Back lost catalog search');
    assert.equal(await page.locator('[data-glossary-category="'+mainRule.id+'"]').getAttribute('aria-pressed'),'true','Back lost catalog category');
    await page.goForward();await ready(page);await article(page,deep);await page.goBack();await ready(page);
    const opening=context.waitForEvent('page');await targetLink(page,deep).click({modifiers:['Control']});const tab=await opening;await ready(tab);await article(tab,deep);await tab.reload();await ready(tab);await article(tab,deep);await tab.close();
    await page.goto(href);await ready(page);await article(page,deep);await geometry(page);
    await topGlossary(page);
    const connected=corpus.entries.find(item=>contract.resolve(item.id).references.length);
    await search(page,connected.label);const originalLink=targetLink(page,connected.id);
    await originalLink.click();await article(page,connected.id,true);
    const nested=contract.resolve(connected.id).references[0];
    await page.locator('dialog[open] .reference-links [data-target-id="'+nested.targetId+'"]').click();
    await article(page,nested.targetId,true);await page.keyboard.press('Escape');
    assert.equal(await originalLink.evaluate(node=>node===document.activeElement),true,'Nested reference lost original catalog focus');
    const longest=corpus.entries.filter(entry=>entry.domain==='CORE').sort((a,b)=>
      contract.resolve(b.id).sections.flatMap(section=>section.fields).map(field=>String(field.value)).join('').length-
      contract.resolve(a.id).sections.flatMap(section=>section.fields).map(field=>String(field.value)).join('').length)[0];
    await search(page,longest.label);await targetLink(page,longest.id).click();await article(page,longest.id,true);await popupGeometry(page);
    assert.equal(await page.locator('dialog[open]').evaluate(node=>node.scrollHeight>node.clientHeight),true,'Long reference is not internally scrollable');
    await screenshot(page,device+'-long-popup');await page.keyboard.press('Escape');
    // Registered V2 books and shared Missions remain globally reachable.
    for(const selected of [csmAbility,
      corpus.entries.find(entry=>entry.domain==='MISSIONS'&&entry.recordType==='FORCE_DISPOSITION'),
      corpus.entries.find(entry=>entry.recordType==='WEAPON_PROFILE'),
      corpus.entries.find(entry=>entry.recordType==='UNIT'&&entry.mfm?.pointRecords?.length)]) {
      assert.ok(selected);const url=encodeRoute(entry,{destination:'GLOSSARY',...contract.identityFor(selected.id)});
      await page.goto(url);await ready(page);await article(page,selected.id);assert.ok((await page.locator('main .reference-definition').innerText()).length>10,'Global nonbook entry has no readable definition');
      const related=contract.resolve(selected.id).references[0];
      if(related) {
        const reference=page.locator('main .reference-links [data-target-id="'+related.targetId+'"]');
        assert.equal(await reference.count(),1);await reference.click();await article(page,related.targetId,true);await popupGeometry(page);await page.keyboard.press('Escape');
      }
      await geometry(page);
    }
    for(const reference of updatedReferences){
      const selected=canonicalEntry(reference.book,reference.id);
      await page.goto(encodeRoute(entry,{destination:'GLOSSARY',...contract.identityFor(selected.id)}));await ready(page);
      const node=await article(page,selected.id),text=await node.innerText();
      for(const expected of reference.text||[])assert.ok(text.includes(expected),`${selected.id}: current source text missing from article`);
      if(reference.pattern)assert.match(text,reference.pattern,`${selected.id}: current profile value missing from article`);
      if(reference.absent)assert.doesNotMatch(text,reference.absent,`${selected.id}: superseded qualifier remains visible`);
      await page.reload();await ready(page);assert.equal(await (await article(page,selected.id)).innerText(),text,'Reload changed canonical reference');
      await geometry(page);
    }
    const excludedLegacyIds={
      'emperors-children':'army::emperors-children::unit::unit-noise-marines',
      tyranids:'army::tyranids::unit::unit-barbgaunts',
      'tau-empire':'army::tau-empire::unit::unit-breacher-team',
      'space-marines':'army::space-marines::unit::unit-adrax-agatone',
      'dark-angels':'army::dark-angels::unit::unit-asmodai',
      'blood-angels':'army::blood-angels::unit::unit-astorath'
    };
    for(const [book,id] of Object.entries(excludedLegacyIds)){
      await page.goto(origin+'/glossary/index.html?book='+book+'#'+encodeURIComponent(id));await ready(page);await global(page);
      assert.equal(await page.locator('main .v2-not-found').innerText(),'This reference is unavailable. Choose an entry from the Glossary.');
      assert.equal(await page.locator('main article.v1-reference-article').count(),0,`${book}: excluded link resolved to another rule`);
    }
    // Full old global IDs and contextual local aliases retain their exact target.
    for(const old of ['/glossary/index.html#'+encodeURIComponent(deep),'/glossary/index.html?book=core-rules#core-deep-strike',
      '/glossary/index.html?book=death-guard#core-deep-strike','/glossary/index.html?book=adeptus-mechanicus#datasheet-deep-strike']) {
      await page.goto(origin+old);await ready(page);await article(page,deep);assert.equal(new URL(page.url()).pathname,'/v2/app.html');
      assert.deepEqual(decodeRoute(page.url()),decodeRoute(href));
    }
    await page.goto(origin+'/glossary/index.html');await ready(page);await global(page);await page.getByRole('searchbox',{name:'Search glossary',exact:true}).waitFor();
    // Each normal book and its real imported personal guide can enter the global catalog.
    const fixtures={
      'death-guard':'+ DETACHMENT: Virulent Vectorium\nChar1: 1x Lord of Contagion (120 pts): Manreaper',
      'adeptus-mechanicus':'+ FACTION KEYWORD: Imperium - Adeptus Mechanicus\n+ DETACHMENT: Haloscreed Battle Clade\nChar1: 1x Tech-priest Dominus (75 pts): Volkite blaster, Macrostubber, Omnissian axe',
      'chaos-space-marines':'+ FACTION KEYWORD: Chaos - Chaos Space Marines\n+ DETACHMENT: Pactbound Zealots\nChar1: 1x Chaos Lord (95 pts): Daemon hammer, Plasma pistol\n  Mark of Chaos: Nurgle'};
    for(const [book,text]of Object.entries(fixtures)) {
      await page.evaluate(route=>window.WarhammerAppV2.navigate(route),{destination:'ARMY_BOOK',bookId:book});await active(page,book);
      const theme=await page.evaluate(()=>({bodyClass:document.body.className,background:getComputedStyle(document.body).backgroundColor,
        styles:[...document.querySelectorAll('link[rel="stylesheet"]')].map(node=>node.href).sort()}));
      await topGlossary(page);assert.equal(new URL(page.url()).searchParams.has('book'),false,'Top Mega Glossary retained roster/book visibility restriction');
      await search(page,'Deep Strike');await targetLink(page,deep).click();await article(page,deep,true);await page.keyboard.press('Escape');
      await page.evaluate(route=>window.WarhammerAppV2.navigate(route),{destination:'ROSTER',bookId:book});await active(page,book);
      await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);await page.locator('[data-roster-action="review-import"]').click();
      await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state?.units?.length===1);
      await page.evaluate(()=>window.ArmyBookAppV2.openPersonalGuide());await page.waitForSelector('main [data-roster-nav-instance-id]');
      await topGlossary(page);await search(page,'Deep Strike');assert.equal(await targetLink(page,deep).count(),1);
      const outside=book==='chaos-space-marines'?canonicalEntry('adeptus-mechanicus','faq-2'):csmAbility;
      await search(page,outside.label);assert.equal(await targetLink(page,outside.id).count(),1,'Personal Guide incorrectly restricted global references');
      await page.evaluate(()=>{window.previousGlossary={app:window.WarhammerAppV2.activeModule,root:document.querySelector('[data-global-glossary]'),
        controls:[...document.querySelectorAll('[data-global-glossary] a,[data-global-glossary] button,[data-global-glossary] input')]};});
      await page.evaluate(route=>window.WarhammerAppV2.navigate(route),{destination:'ARMY_BOOK',bookId:book});await active(page,book);
      assert.deepEqual(await page.evaluate(()=>({destroyed:window.previousGlossary.app.destroyed,connected:window.previousGlossary.root.isConnected})),{destroyed:true,connected:false});
      assert.equal(await page.locator('[data-global-glossary]').count(),0);assert.equal(await page.locator('link[href*="application-v2/glossary.css"]').count(),0);
      assert.deepEqual(await page.evaluate(()=>({bodyClass:document.body.className,background:getComputedStyle(document.body).backgroundColor,
        styles:[...document.querySelectorAll('link[rel="stylesheet"]')].map(node=>node.href).sort()})),theme,'Global Glossary styles contaminated book theme');
      const before=await page.evaluate(()=>({url:location.href,html:document.querySelector('[data-v2-shell]').innerHTML}));
      await page.evaluate(()=>{for(const node of window.previousGlossary.controls)for(const type of ['click','input','change'])node.dispatchEvent(new Event(type,{bubbles:true,cancelable:true}));window.previousGlossary.app.sync();});
      assert.deepEqual(await page.evaluate(()=>({url:location.href,html:document.querySelector('[data-v2-shell]').innerHTML})),before,'Destroyed Glossary handler mutated current book');
    }
    await page.locator('[data-v2-primary-nav] [data-v2-destination="HOME"]').click();await active(page,null);
    assert.deepEqual(await page.evaluate(()=>({title:document.title,html:document.querySelector('.v2-library-home').outerHTML,
      background:getComputedStyle(document.querySelector('.v2-library-home')).backgroundImage,styles:[...document.querySelectorAll('link[rel="stylesheet"]')].map(link=>link.href)})),home,'Glossary changed Home presentation');
    results.push({device,corpus:corpus.entries.length,searchTitle:true,searchAliases:true,searchDefinition:true,categories:true,
      canonicalPopup:true,fullArticle:true,closeEscapeOutsideFocus:true,nativeNewTab:true,directReload:true,backForward:true,
      legacyLinks:true,excludedLegacyUnavailable:excludedBooks.length,currentOfficialReferences:updatedReferences.length,mfmVersion:'v1.6',
      bookToGlobal:true,personalGuideToGlobal:true,scopeUnrestricted:true,lifecycleCleanup:true,themeIsolation:true,overflow:false});
    await context.close();
  }
  assert.deepEqual(errors,[],'Global Glossary raised browser exceptions');assert.deepEqual(forbidden,[],'Global Glossary loaded a legacy/unexpected runtime');
  assert.ok(!requests.some(address=>/viewer\.js|viewer\.css|glossary\/v2\/viewer/.test(address)),'Divergent standalone viewer remains active');
  console.log(JSON.stringify({status:'PASS',results,errors,forbidden,resources:[...new Set(requests)].length,screenshots}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
