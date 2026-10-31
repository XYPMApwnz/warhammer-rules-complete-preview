import {launchQaBrowser} from '../tests/helpers/qa-browser.cjs';
/** Independent full-payload integration checks for the unified V2 entry point. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {decodeRoute} from '../books/shared/army-book-app-v2/route-context.mjs';
import {armyBooks} from './army-books.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';

const repo=fileURLToPath(new URL('../',import.meta.url));
const requests=[],forbidden=[],errors=[],results=[];
const types={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json',
  '.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webmanifest':'application/manifest+json'};
const registeredHomeResources=new Set(['/books/shared/offline-status.js','/books/shared/styles/offline-status.css','/glossary/generated/cache-revision.js','/service-worker.js',...armyBooks.flatMap(book=>[
  `/books/${book.id}/v2/registration.mjs`,
  '/'+path.relative(repo,fileURLToPath(book.home.cover)).split(path.sep).join('/')
])]);
const isAllowedResource=address=>registeredHomeResources.has(address)||isApplicationTestDependency(address)||/^\/v2\/[\w./-]+\.(?:html|mjs|css)$/.test(address)||
    /^\/books\/(?:death-guard|adeptus-mechanicus)\/v2\/[\w./-]+\.(?:html|mjs|json|css)$/.test(address)||
    /^\/books\/shared\/(?:application-v2|army-book-app-v2|roster-v2|rule-contract-v2)\/[\w.-]+\.(?:mjs|css)$/.test(address)||
    /^\/books\/shared\/(?:datasheet-system|unit-art)\.css$/.test(address)||
    /^\/(?:assets|books\/(?:death-guard|adeptus-mechanicus)\/assets)\/[\w./-]+\.(?:png|webp|jpe?g|svg)$/.test(address);
assert.equal(isAllowedResource('/books/chaos-space-marines/assets/chaos-space-marines-cover-480.webp'),true);
assert.equal(isAllowedResource('/books/emperors-children/assets/emperors-children-cover-480.webp'),true);
assert.equal(isAllowedResource('/books/shared/source-refs-v2/source-refs.mjs'),true,'The shared browser source reader is a declared dependency');
for(const module of ['producer-io','source-registry'])assert.equal(isAllowedResource(`/books/shared/source-refs-v2/${module}.mjs`),false,'Node-only source tooling must not be served');
for(const address of ['/books/chaos-space-marines/assets/chaos-space-marines-cover-800.webp',
  '/books/chaos-space-marines/assets/unknown.webp','/books/chaos-space-marines/scripts/data.js',
  '/books/emperors-children/assets/unknown.webp','/books/tyranids/v2/app.html'])assert.equal(isAllowedResource(address),false,'Unexpected resource admitted: '+address);
const server=http.createServer((request,response)=>{
  const address=new URL(request.url,'http://localhost').pathname;requests.push(address);
  if(address==='/favicon.ico'){response.writeHead(204);response.end();return;}
  const file=path.resolve(repo,address.slice(1));
  if(!isAllowedResource(address)||!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    forbidden.push(address);response.writeHead(404);response.end();return;
  }
  response.writeHead(200,{'Content-Type':types[path.extname(file)],'Cache-Control':'no-store'});response.end(fs.readFileSync(file));
});
const cases={
  'death-guard':{weapon:'datasheet-lord-of-contagion:weapon:1',field:'strength',value:'10',text:
`+ DETACHMENT: Paragons of Putrescence
+ DETACHMENT: Virulent Vectorium
Char1: 1x Lord of Contagion (135 pts): Manreaper
Enhancement: Furnace of Plagues
Char2: 1x Lord of Contagion (120 pts): Manreaper
3x Deathshroud Terminators (150 pts): 3x Manreaper, 3x Plaguespurt gauntlet`},
  'adeptus-mechanicus':{weapon:'datasheet-tech-priest-dominus:weapon:3',field:'skill',value:'2+',text:
`+ FACTION KEYWORD: Imperium - Adeptus Mechanicus
+ DETACHMENT: Haloscreed Battle Clade
Char1: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe
Enhancement: Cognitive Reinforcement
Char2: 1x Tech-priest Dominus (75 pts): Volkite blaster, Macrostubber, Omnissian axe
10x Skitarii Rangers (85 pts): 10x Galvanic rifle, 10x Close combat weapon`},
};
const ready=async page=>{
  await page.waitForFunction(()=>Boolean(window.WarhammerAppV2));
  await page.evaluate(async()=>{await window.WarhammerAppV2.ready;await window.ArmyBookAppV2?.rosterPanel?.ready;});
  await page.waitForFunction(()=>[...document.querySelectorAll('link[rel="stylesheet"]')].every(link=>Boolean(link.sheet)));
};
async function navigate(page,route){await page.evaluate(async route=>{await window.WarhammerAppV2.navigate(route);},route);await ready(page);}
async function active(page,id){await page.waitForFunction(id=>window.WarhammerAppV2?.activeBookId===id,id);await ready(page);
  assert.equal(await page.locator('[data-army-book-v2]').count(),id?1:0,'Exactly one book module must own the mount');}
async function geometry(page){
  const actual=await page.evaluate(()=>{
    const nav=document.querySelector('[data-v2-primary-nav]'),mount=document.querySelector('[data-v2-mount-root]');
    const n=nav.getBoundingClientRect(),content=mount.querySelector('.v2-topbar')||mount.querySelector('.v2-home > :first-child')||mount.querySelector('.v2-library-home .hero > :first-child')||mount.querySelector('.global-glossary-main > :first-child')||mount.querySelector('.v2-core-reader');
    const m=content.getBoundingClientRect();
    return {nav:{top:n.top,bottom:n.bottom},content:{top:m.top,bottom:m.bottom,tag:content.className},visible:n.width>0&&n.height>0&&n.top>=-1&&n.bottom<=innerHeight,overlap:m.top<n.bottom-1,
      overflow:document.documentElement.scrollWidth>innerWidth+1,
      active:[...nav.querySelectorAll('a[aria-current]')].map(link=>({color:getComputedStyle(link).color,background:getComputedStyle(link).backgroundColor})),
      links:[...nav.querySelectorAll('a')].map(link=>{const b=link.getBoundingClientRect();return {destination:link.dataset.v2Destination,visible:b.width>0&&b.height>0,bounds:b.right<=innerWidth+1&&b.left>=-1};})};
  });
  assert.equal(actual.visible,true,'Primary navigation is outside the viewport');
  assert.equal(actual.overlap,false,'Book content overlaps primary navigation: '+JSON.stringify(actual));
  assert.equal(actual.overflow,false,'Shell has horizontal viewport overflow');
  assert.deepEqual(actual.active,[{color:'rgb(255, 243, 215)',background:'rgb(41, 44, 51)'}],'Book styles changed neutral primary navigation');
  assert.ok(actual.links.length>=5&&actual.links.every(link=>link.visible&&link.bounds),'Primary destination links are clipped');
}
async function popupGeometry(page,selector='dialog.v2-detail-dialog[open]'){
  await page.waitForSelector(selector);await page.waitForTimeout(200);
  const box=await page.locator(selector).evaluate(node=>{const b=node.getBoundingClientRect();return {top:b.top,bottom:b.bottom,left:b.left,right:b.right,width:b.width,height:b.height,viewportWidth:innerWidth,viewportHeight:innerHeight};});
  assert.ok(box.width>0&&box.height>0&&box.left>=-1&&box.right<=box.viewportWidth+1&&box.top>=-1&&box.bottom<=box.viewportHeight+1,
    'Popup extends outside the viewport: '+JSON.stringify(box));
}
async function bookContents(page,device,book){
  const facts=()=>page.locator('main .v1-contents-pages [data-fact-id]').evaluateAll(nodes=>nodes.map(node=>node.dataset.factId).sort());
  const before=await facts();assert.ok(before.length>0,'Book landing omitted continuous Contents');
  if(device==='phone'){
    await page.locator('#navMenu').click();assert.equal(await page.locator('#navMenu').getAttribute('aria-expanded'),'true');
    assert.equal(await page.locator('#tocPanel').getAttribute('aria-hidden'),'false');
    await screenshot(page,`shell-${book}-contents-${device}`);
    await page.locator('#navMenu').click();assert.equal(await page.locator('#navMenu').getAttribute('aria-expanded'),'false');
    await page.locator('#navMenu').click();
  }
  const branch=page.locator('#tocTree [data-nav-id="nav:datasheets"] > .toc-row [data-nav-toggle]');
  await branch.click();assert.equal(await branch.getAttribute('aria-expanded'),'true','Datasheets branch did not expand');
  const category=page.locator('#tocTree [data-nav-id="nav:datasheets"] .toc-branch [data-nav-toggle]').first();
  await category.click();assert.equal(await category.getAttribute('aria-expanded'),'true','Datasheet category did not expand');
  const item=page.locator('#tocTree [data-nav-id="nav:datasheets"] button[data-canonical-id]').first();
  const id=await item.getAttribute('data-canonical-id');await item.click();
  await page.waitForFunction(id=>window.ArmyBookAppV2.navigation.state.owner==='reader'&&window.ArmyBookAppV2.navigation.state.active===id,id);
  assert.equal(new URL(page.url()).hash,encodeURIComponent(id).replace(/^/,'#'));
  assert.equal(await page.locator(`#tocTree button[data-canonical-id="${id}"]`).getAttribute('aria-current'),'location');
  if(device==='phone')assert.equal(await page.locator('#navMenu').getAttribute('aria-expanded'),'false','Selecting a Contents entry left the drawer open');
  if(device==='phone'){
    const tab=page.locator(`main .unit-card[data-card-id="${id}"] .local-tab`).first(),target=await tab.getAttribute('data-datasheet-target');
    const transition=await page.evaluate(()=>window.ArmyBookAppV2.navigation.state.transition);await tab.click();
    await page.waitForFunction(({transition,id})=>window.ArmyBookAppV2.navigation.state.transition>transition&&window.ArmyBookAppV2.navigation.state.owner==='reader'&&window.ArmyBookAppV2.navigation.state.active===id,{transition,id});
    const section=await page.locator('[id="'+target+'"]').evaluate(node=>{const nav=node.closest('.unit-card').querySelector('.local-nav'),box=nav.getBoundingClientRect();return {top:node.getBoundingClientRect().top,header:document.querySelector('#appHeader').getBoundingClientRect().bottom,viewport:innerHeight,
      nav:{top:box.top,bottom:box.bottom,position:getComputedStyle(nav).position,cssTop:getComputedStyle(nav).top,headerVariable:getComputedStyle(nav).getPropertyValue('--app-header-bottom')}};});
    assert.ok(section.top>=section.header-1&&section.top<section.viewport,'Datasheet section control did not reveal its section below book chrome');
    assert.ok(section.nav.top>=section.header-1,'Sticky section tabs overlap book chrome: '+JSON.stringify(section));
  }
  assert.deepEqual(await facts(),before,'Contents navigation replaced or dropped continuous book facts');
  await screenshot(page,`shell-${book}-section-${device}`);await geometry(page);
}
async function fact(page,c,dialog=false){
  const values=await page.locator((dialog?'dialog[open]':'[data-v2-mount-root]')+' [data-fact-id]').evaluateAll((nodes,key)=>nodes.filter(node=>node.dataset.factId===key).map(node=>JSON.parse(node.dataset.factValue)),c.weapon+'::/'+c.field);
  assert.deepEqual(values,[c.value],'Physical reference lost its effective roster value');
}
async function theme(page){return page.evaluate(()=>({body:getComputedStyle(document.body).backgroundColor,
  properties:['--book-accent','--book-panel','--book-ink'].map(name=>getComputedStyle(document.body).getPropertyValue(name)),
  logo:getComputedStyle(document.querySelector('.v2-brand-mark')).backgroundImage,
  styles:[...document.querySelectorAll('link[rel="stylesheet"]')].map(node=>node.href).sort()}));}
async function retain(page){await page.evaluate(()=>{const app=window.ArmyBookAppV2,root=document.querySelector('[data-army-book-v2]');
  window.previousModule={app,root,nodes:[...root.querySelectorAll('a,button,input,select,textarea')],html:root.innerHTML};});}
async function released(page){
  const report=await page.evaluate(()=>({destroyed:window.previousModule.app.destroyed,connected:window.previousModule.root.isConnected}));
  assert.deepEqual(report,{destroyed:true,connected:false},'Switch retained an active prior module');
  const before=await page.evaluate(()=>({url:location.href,html:document.querySelector('[data-v2-shell]').innerHTML,
    storage:JSON.stringify(Object.keys(localStorage).sort().map(key=>[key,localStorage.getItem(key)]))}));
  await page.evaluate(()=>{for(const node of window.previousModule.nodes)for(const type of ['click','input','change'])node.dispatchEvent(new Event(type,{bubbles:true,cancelable:true}));
    window.previousModule.app.open('missing');window.previousModule.app.openRoster();window.previousModule.app.openGlossary();});
  assert.deepEqual(await page.evaluate(()=>({url:location.href,html:document.querySelector('[data-v2-shell]').innerHTML,
    storage:JSON.stringify(Object.keys(localStorage).sort().map(key=>[key,localStorage.getItem(key)]))})),before,'Obsolete module mutated the live shell');
}

await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`,entry=origin+'/v2/app.html';
const installed='C:/Program Files/Google/Chrome/Application/chrome.exe';
const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||(fs.existsSync(installed)?installed:undefined);
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await launchQaBrowser(chromium,{headless:true,...(executablePath?{executablePath}:{})});
const screenshot=async(page,name)=>{if(process.env.V2_SHELL_SCREENSHOTS){fs.mkdirSync(process.env.V2_SHELL_SCREENSHOTS,{recursive:true});
  await page.screenshot({path:path.join(process.env.V2_SHELL_SCREENSHOTS,name+'.png'),fullPage:false});}};
try{
  for(const [device,viewport]of [['desktop',{width:1440,height:900}],['phone',{width:390,height:844}]]){
    const context=await browser.newContext({viewport,serviceWorkers:'block'});
    context.on('page',page=>{page.setDefaultTimeout(15000);page.on('pageerror',error=>errors.push(error.message));
      page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});});
    const homeRequestStart=requests.length;
    const page=await context.newPage();await page.goto(entry);await ready(page);await active(page,null);await geometry(page);
    await page.waitForFunction(()=>['death-guard','adeptus-mechanicus','chaos-space-marines','emperors-children'].every(id=>{
      const image=document.querySelector(`[data-v2-book="${id}"] img`);return image?.complete&&image.naturalWidth>0;
    }));
    assert.deepEqual(requests.slice(homeRequestStart).filter(address=>
      /^\/books\/(?:death-guard|adeptus-mechanicus|chaos-space-marines|emperors-children|tyranids)\/v2\//.test(address)&&!address.endsWith('/registration.mjs')),
    [],'Home loaded book factual data or roster service before book selection');
    await screenshot(page,`shell-home-${device}`);
    assert.equal(await page.locator('[data-v2-shell]').count(),1);
    for(const destination of ['HOME','CORE_RULES','ARMY_BOOK','ROSTER','GLOSSARY'])assert.equal(await page.locator(`[data-v2-primary-nav] [data-v2-destination="${destination}"]`).count(),1);
    assert.deepEqual((await page.locator('.v2-library-home [data-v2-book]').evaluateAll(nodes=>nodes.map(node=>node.dataset.v2Book))).sort(),
      armyBooks.map(book=>book.id).sort(),'Home preserves all nine registered Army Books');
    for(const book of armyBooks.map(book=>book.id))assert.ok(await page.locator(`[data-v2-book="${book}"]`).count()>0,'Home omits a registered book');
    await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();await active(page,null);
    assert.equal(new URL(page.url()).searchParams.get('v2'),'ROSTER');
    for(const destination of ['CORE_RULES','GLOSSARY']){
      await page.locator(`[data-v2-primary-nav] [data-v2-destination="${destination}"]`).click();await active(page,null);await geometry(page);
      if(destination==='GLOSSARY')assert.equal(await page.locator('[data-global-glossary] .v2-glossary').count(),1,'Global Glossary not mounted');
      else assert.equal(await page.frameLocator('.v2-core-reader').locator('.sidebar nav').count(),1,'Existing Core reader Contents not mounted');
    }
    await navigate(page,{destination:'HOME',sectionId:'army-books'});
    const urls={},themes={};
    for(const book of Object.keys(cases)){
      const bookRequestStart=requests.length;
      const c=cases[book];await page.locator(`[data-v2-book="${book}"]`).first().click();await active(page,book);await geometry(page);
      assert.deepEqual([...new Set(requests.slice(bookRequestStart).filter(address=>
        /^\/books\/(?:death-guard|adeptus-mechanicus|chaos-space-marines|emperors-children|tyranids)\/v2\/(?:generated\/|roster-boot\.mjs)/.test(address))
        .map(address=>address.split('/')[2]))],[book],'Book selection loaded another book factual payload or roster service');
      await screenshot(page,`shell-${book}-${device}`);
      await bookContents(page,device,book);
      assert.equal(new URL(page.url()).pathname,'/v2/app.html','Book selection escaped the unified shell');
      assert.equal(new URL(page.url()).searchParams.get('book'),book);
      await navigate(page,{destination:'ROSTER',bookId:book});await active(page,book);
      await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(c.text);
      await page.locator('[data-roster-action="review-import"]').click();await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state?.units?.length===3);
      if(book==='death-guard'){
        await page.locator('[data-attachment-candidate-for="parsed-unit-3"]').selectOption('parsed-unit-1');
        await page.locator('[data-attachment-target-instance-id="parsed-unit-3"] [data-roster-action="attach"]').click();
        assert.equal(await page.evaluate(()=>window.ArmyBookAppV2.roster.state.attachments.length),1);
      }
      await page.evaluate(()=>window.ArmyBookAppV2.openPersonalGuide());await page.waitForSelector('main [data-roster-nav-instance-id]');
      await page.evaluate(()=>window.ArmyBookAppV2.openInstance('parsed-unit-1'));await page.waitForSelector('main .unit-card');await geometry(page);
      await page.locator('main .ds-related-rules-button').first().click();await page.waitForSelector('dialog.v2-related-dialog[open]');
      await popupGeometry(page,'dialog.v2-related-dialog[open] .related-rules-dialog');
      await page.locator('dialog.v2-related-dialog[open] button[data-kind="enhancements"]').click();
      assert.equal(await page.locator('dialog.v2-related-dialog[open] button[data-kind="enhancements"]').getAttribute('aria-pressed'),'true');
      await screenshot(page,`shell-${book}-related-${device}`);
      await page.getByRole('button',{name:'Close compatible rules',exact:true}).click();await page.waitForSelector('dialog.v2-related-dialog[open]',{state:'hidden'});
      assert.equal(new URL(page.url()).searchParams.get('instance'),'parsed-unit-1');
      const link=page.locator(`main .weapon-name a[data-target-id="${c.weapon}"]`).first();
      const href=await link.getAttribute('href'),url=new URL(href);urls[book]=href;
      assert.equal(url.pathname,'/v2/app.html');assert.equal(url.searchParams.get('book'),book);assert.equal(url.searchParams.get('instance'),'parsed-unit-1');
      await link.click();await page.waitForSelector('dialog[open]');await fact(page,c,true);await popupGeometry(page);
      await page.goBack();await page.waitForSelector('dialog[open]',{state:'hidden'});await page.waitForSelector('main .unit-card');
      await page.goForward();await page.waitForSelector('dialog[open]');await fact(page,c,true);
      await page.goBack();await page.waitForSelector('dialog[open]',{state:'hidden'});
      const opening=context.waitForEvent('page');await link.click({modifiers:['Control']});const tab=await opening;await ready(tab);await active(tab,book);await fact(tab,c);await tab.reload();await ready(tab);await fact(tab,c);await tab.close();
      await page.goto(href);await ready(page);await active(page,book);await fact(page,c);await page.reload();await ready(page);await fact(page,c);
      await page.evaluate(()=>window.ArmyBookAppV2.openGlossary());await page.waitForSelector('.v2-glossary-result');
      const glossary=page.locator('.v2-glossary-result').first();
      assert.equal(new URL(await glossary.getAttribute('href')).pathname,'/v2/app.html','Glossary escaped unified route');
      await glossary.click();await page.waitForSelector('dialog[open]');await active(page,book);
      await page.goBack();await page.waitForSelector('dialog[open]',{state:'hidden'});await page.waitForSelector('.v2-glossary-result');
      await page.evaluate(()=>{window.ArmyBookAppV2.openLibrary();window.ArmyBookAppV2.openGlossary();});
      const longestCore=await page.evaluate(()=>window.ArmyBookAppV2.payload.cards.filter(card=>card.kind.startsWith('CORE_')).sort((a,b)=>JSON.stringify(b.fields).length-JSON.stringify(a.fields).length)[0].id);
      const coreLink=page.locator(`.v2-glossary-result[data-target-id="${longestCore}"]`);
      assert.equal(await coreLink.count(),1,'Book glossary lost its existing Core reference links');
      assert.equal(new URL(await coreLink.getAttribute('href')).pathname,'/v2/app.html');
      await coreLink.click();await page.waitForSelector('dialog[open]');await active(page,book);await popupGeometry(page);
      await screenshot(page,`shell-${book}-long-core-${device}`);
      await page.goBack();await page.waitForSelector('dialog[open]',{state:'hidden'});
      themes[book]=await theme(page);await retain(page);await navigate(page,{destination:'HOME',sectionId:'army-books'});await active(page,null);await released(page);
    }
    // Persisted rosters must survive repeated DG -> AM -> DG ownership changes.
    for(const book of ['death-guard','adeptus-mechanicus','death-guard']){
      await navigate(page,decodeRoute(urls[book]));await active(page,book);await fact(page,cases[book]);
      assert.deepEqual(await theme(page),themes[book],'Faction styles changed across remounts');
      if(book==='death-guard')assert.equal(await page.evaluate(()=>window.ArmyBookAppV2.roster.state.attachments.length),1);
      await retain(page);await navigate(page,{destination:'HOME',sectionId:'army-books'});await active(page,null);await released(page);
    }
    // Only the native shell hosts books; no retired per-book entry is registered.
    for(const book of armyBooks){
      assert.deepEqual(book.routeAliases,[],'Retired per-book alias remains: '+book.id);
      assert.equal(fs.existsSync(path.join(repo,'books',book.id,'v2/app.html')),false,'Retired per-book app HTML remains: '+book.id);
    }
    // Book and home history transitions must swap the physical owner.
    await navigate(page,{destination:'ARMY_BOOK',bookId:'death-guard'});await active(page,'death-guard');
    await navigate(page,{destination:'ARMY_BOOK',bookId:'adeptus-mechanicus'});await active(page,'adeptus-mechanicus');
    await navigate(page,{destination:'HOME',sectionId:'army-books'});await active(page,null);
    await page.goBack();await active(page,'adeptus-mechanicus');await page.goBack();await active(page,'death-guard');await page.goForward();await active(page,'adeptus-mechanicus');await geometry(page);
    assert.deepEqual(errors,[],'Shell emitted browser exceptions');
    results.push({device,home:true,integratedDestinations:true,booklessRoster:true,import:true,attachment:true,personalGuide:true,
      physicalReference:true,nativeNewTab:true,directReload:true,retiredAdaptersAbsent:true,backForward:true,lifecycle:true,theme:true,
      neutralPrimaryNavigation:true,bookContentsPreserved:true,sectionNavigation:true,relatedRules:true,popupViewport:true,longCorePopup:true,
      homeCovers:true,lazyLoading:true,resourceNegativeControls:5,overflow:false});
    await context.close();
  }
  assert.deepEqual(forbidden,[],'Shell requested a legacy or unexpected resource');
  console.log(JSON.stringify({status:'PASS',results,errors,requests:[...new Set(requests)].length,forbidden}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
