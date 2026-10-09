/** V1 visual oracle, live V2 routes, synthetic registry shelves and book style isolation. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const repo=fileURLToPath(new URL('../',import.meta.url));
const base='b7db5f316eda422408f46e709c0918d25c4da806';
const artifacts=process.env.V2_HOME_SCREENSHOTS||'E:/Warhammer/qa-artifacts/v1-home-port';
fs.mkdirSync(artifacts,{recursive:true});
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webmanifest':'application/manifest+json'};
const forbidden=[],errors=[],reports=[],screenshots=[];
const requests={current:[],baseline:[],reference:[]};
const baselineFiles=new Map();
for(const file of ['books/shared/application-v2/runtime.mjs','books/shared/application-v2/shell.css','books/death-guard/v2/registration.mjs','books/adeptus-mechanicus/v2/registration.mjs']) {
  baselineFiles.set('/'+file,execFileSync('git',['show',base+':'+file],{cwd:repo}));
}
const syntheticHTML=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><script type="module">
import {createBookRegistry} from '/books/shared/application-v2/registry.mjs';
import {createHomePresenter} from '/books/shared/application-v2/home.mjs';
let loads=0;
const entry=(id,shelf,order)=>({id,title:'Synthetic '+id,loadPayload:async()=>{loads++;throw Error('Home loaded facts');},
 home:{shelf,order,label:'Independent reference',accent:'#789abc',cover:new URL('/assets/death-guard-cover-480.webp',location.href).href,coverAlt:'Synthetic cover'}});
const xenos={id:'xenos',title:'Xenos',subtitle:'Future category from book metadata',order:50};
const archive={id:'archive',title:'Independent archive',subtitle:'Another future category',order:40};
const entries=[entry('synthetic-z',xenos,20),entry('synthetic-a',xenos,10),entry('synthetic-archive',archive,1),{id:'synthetic-default',title:'Default book',loadPayload:async()=>{loads++;}}];
function render(definitions){const registry=createBookRegistry(definitions),presenter=createHomePresenter({document,registry,entryURL:new URL('/v2/app.html',location.href).href});
 document.querySelector('main')?.remove();document.body.append(presenter.render({destination:'HOME'}));
 return [...document.querySelectorAll('[data-home-shelf]')].map(shelf=>({id:shelf.dataset.homeShelf,books:[...shelf.querySelectorAll('[data-v2-book]')].map(book=>book.dataset.v2Book)}));}
window.syntheticHome={entries,render,get loads(){return loads;}};window.syntheticHome.initial=render(entries);
</script></body></html>`;
function makeServer(mode){return http.createServer((request,response)=>{
  const address=new URL(request.url,'http://localhost').pathname;requests[mode].push(address);
  if(address==='/favicon.ico'){response.writeHead(204);response.end();return;}
  if(mode==='current'&&address==='/synthetic-home.html'){response.writeHead(200,{'Content-Type':'text/html'});response.end(syntheticHTML);return;}
  const referenceAllowed=mode==='reference'&&(address==='/'||address==='/index.html'||address==='/manifest.webmanifest'||address==='/books/shared/styles/offline-status.css');
  const allowed=referenceAllowed||/^\/v2\/[\w./-]+\.(?:html|mjs|css)$/.test(address)||
    /^\/books\/(?:death-guard|adeptus-mechanicus)\/v2\/[\w./-]+\.(?:html|mjs|json|css)$/.test(address)||
    /^\/books\/shared\/(?:application-v2|army-book-app-v2|roster-v2|rule-contract-v2)\/[\w.-]+\.(?:mjs|css)$/.test(address)||
    /^\/books\/shared\/(?:datasheet-system|unit-art)\.css$/.test(address)||
    /^\/(?:assets|books\/[\w-]+\/assets)\/[\w./-]+\.(?:png|webp|jpe?g|svg)$/.test(address);
  const normalized=address==='/'?'/index.html':address,file=path.resolve(repo,normalized.slice(1));
  if(!allowed||!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    forbidden.push({mode,address});response.writeHead(404);response.end();return;
  }
  response.writeHead(200,{'Content-Type':mime[path.extname(file)],'Cache-Control':'no-store'});
  response.end(mode==='baseline'&&baselineFiles.has(normalized)?baselineFiles.get(normalized):fs.readFileSync(file));
});}
const servers=Object.fromEntries(['current','baseline','reference'].map(mode=>[mode,makeServer(mode)]));
await Promise.all(Object.values(servers).map(server=>new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))));
const origins=Object.fromEntries(Object.entries(servers).map(([mode,server])=>[mode,`http://127.0.0.1:${server.address().port}`]));
const {chromium}=createRequire(import.meta.url)('playwright');
const installed='C:/Program Files/Google/Chrome/Application/chrome.exe';
const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||(fs.existsSync(installed)?installed:undefined);
const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
const ready=async page=>{
  await page.waitForFunction(()=>Boolean(window.WarhammerAppV2));await page.evaluate(async()=>{await window.WarhammerAppV2.ready;await window.ArmyBookAppV2?.rosterPanel?.ready;});
  await page.waitForFunction(()=>[...document.querySelectorAll('link[rel="stylesheet"]')].every(link=>Boolean(link.sheet)));
};
const navigate=async(page,route)=>{await page.evaluate(async route=>{await window.WarhammerAppV2.navigate(route);},route);await ready(page);};
async function screenshot(page,name){const file=path.join(artifacts,name+'.png');await page.screenshot({path:file,fullPage:true});screenshots.push(file);}
async function homeStyle(page,selector){return page.locator(selector).first().evaluate(node=>{const style=getComputedStyle(node);return {fontFamily:style.fontFamily,fontSize:style.fontSize,fontWeight:style.fontWeight,letterSpacing:style.letterSpacing,color:style.color,lineHeight:style.lineHeight};});}
async function bookSnapshot(page,book){
  const id=book==='death-guard'?'unit-lord-of-contagion':'unit-tech-priest-dominus';
  await page.evaluate(id=>window.ArmyBookAppV2.open(id),id);await ready(page);await page.evaluate(()=>scrollTo(0,0));
  await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    (await import('/books/shared/army-book-app-v2/datasheet-v1-layout.mjs')).flushDatasheetLayouts(document.querySelector('[data-army-book-v2]'));
  });
  const result=await page.evaluate(()=>{
    const root=document.querySelector('[data-army-book-v2]'),nodes=[document.body,root,...root.querySelectorAll('#appHeader,#tocPanel,#main,.unit-card h2,.unit-card h3,.unit-card .weapon-table,.unit-card th,.unit-card td,.unit-card .keywords')];
    const properties=['color','backgroundColor','backgroundImage','fontFamily','fontSize','fontWeight','lineHeight','borderTopColor','borderTopWidth','display','position','paddingTop','paddingRight','paddingBottom','paddingLeft','gap','maxWidth'];
    return {text:root.innerText,styles:nodes.map(node=>{const style=getComputedStyle(node),box=node.getBoundingClientRect();return {tag:node.tagName,className:node.className,
      values:properties.map(name=>[name,style[name]]),box:[box.x,box.y,box.width,box.height].map(value=>Math.round(value*100)/100)};}),
      bodyClass:document.body.className,roots:document.querySelectorAll('[data-army-book-v2]').length};
  });
  assert.equal(result.roots,1);return result;
}
try{
  for(const [device,viewport]of [['desktop',{width:1440,height:900}],['phone',{width:390,height:844}],['800',{width:800,height:900}],['801',{width:801,height:900}]]){
    const context=await browser.newContext({viewport,serviceWorkers:'block'});
    context.on('page',page=>{page.setDefaultTimeout(20000);page.on('pageerror',error=>errors.push({device,message:error.message}));});
    const referenceContext=await browser.newContext({viewport,serviceWorkers:'block',javaScriptEnabled:false});
    const reference=await referenceContext.newPage();
    // Render untouched V1 HTML/CSS/assets as the visual oracle, never execute its application/update scripts.
    await reference.route('**/*',route=>route.request().resourceType()==='script'?route.abort():route.continue());
    await reference.goto(origins.reference+'/index.html');
    await reference.evaluate(()=>{for(const image of document.images)image.loading='eager';});
    await reference.waitForFunction(()=>[...document.images].every(image=>image.complete&&image.naturalWidth>0));
    await reference.evaluate(()=>Promise.all([...document.images].map(image=>image.decode())));
    if(device==='desktop'||device==='phone')await screenshot(reference,'v1-home-'+device+'-reference');
    const factRequestsBefore=requests.current.filter(address=>address.includes('/generated/')).length;
    const page=await context.newPage();await page.goto(origins.current+'/v2/app.html');await ready(page);
    assert.equal(await page.locator('.v2-library-home').count(),1,'Single scoped Home root required');
    assert.equal(await page.locator('[data-v2-shell]').count(),1);assert.equal(await page.locator('.v2-primary-header').count(),1,'No duplicate V1 topbar');
    assert.equal(await page.locator('.v2-library-home .hero').count(),1);assert.equal(await page.locator('.v2-library-home .support').count(),1);assert.equal(await page.locator('.v2-library-home .footer').count(),1);
    assert.deepEqual(await page.locator('[data-home-shelf]').evaluateAll(nodes=>nodes.map(node=>node.dataset.homeShelf)),['rules-tools','imperium','chaos']);
    assert.deepEqual(await page.locator('[data-home-shelf="imperium"] [data-v2-book]').evaluateAll(nodes=>nodes.map(node=>node.dataset.v2Book)),['adeptus-mechanicus']);
    assert.deepEqual(await page.locator('[data-home-shelf="chaos"] [data-v2-book]').evaluateAll(nodes=>nodes.map(node=>node.dataset.v2Book)),['death-guard']);
    assert.equal(await page.locator('[data-home-shelf="rules-tools"] .book').count(),3);
    assert.equal(requests.current.filter(address=>address.includes('/generated/')).length,factRequestsBefore,'Initial Home loaded factual payloads');
    const links=await page.locator('.v2-library-home a').evaluateAll(nodes=>nodes.filter(node=>new URL(node.href).origin===location.origin).map(node=>({path:new URL(node.href).pathname,query:new URL(node.href).search,hash:new URL(node.href).hash})));
    assert.ok(links.length>=5&&links.every(link=>link.path==='/v2/app.html'),'Legacy Home navigation link');
    for(const [destination,book,registry,hash]of [['CORE_RULES',null,'core-rules',''],['ARMY_BOOK','death-guard','death-guard',''],['ARMY_BOOK','adeptus-mechanicus','adeptus-mechanicus',''],['ROSTER',null,null,''],['GLOSSARY',null,null,'#view-glossary']]){
      assert.ok(links.some(link=>{const query=new URLSearchParams(link.query);return query.get('v2')===destination&&query.get('book')===book&&query.get('registry')===registry&&link.hash===hash;}),'Missing canonical route '+destination+'/'+book);
    }
    const text=await page.locator('.v2-library-home').innerText();assert.ok(!/Verification build|Audit run|Refresh due|Active roster effects|Source status/i.test(text),'Stale implementation/status labels');
    for(const selector of ['.hero h1','.eyebrow','.section-head h2','.shelf-head h3','.book-copy strong','.book-copy small']){
      assert.deepEqual(await homeStyle(page,'.v2-library-home '+selector),await homeStyle(reference,selector),'V1 typography/color mismatch '+selector+' at '+device);
    }
    const geometry=await page.evaluate(()=>{
      const root=document.querySelector('.v2-library-home'),row=root.querySelector('[data-home-shelf="rules-tools"] .book-row'),book=row.querySelector('.book'),cover=book.querySelector('.cover'),head=root.querySelector('.shelf-head');
      const rect=cover.getBoundingClientRect(),header=document.querySelector('.v2-primary-header').getBoundingClientRect(),hero=root.querySelector('.hero').getBoundingClientRect();
      return {overflow:document.documentElement.scrollWidth>innerWidth+1,cardWidth:book.getBoundingClientRect().width,coverRatio:rect.width/rect.height,rowWidth:row.clientWidth,rowScroll:row.scrollWidth,
        snap:getComputedStyle(row).scrollSnapType,headDirection:getComputedStyle(head).flexDirection,backgroundSize:getComputedStyle(root).backgroundSize,
        rings:getComputedStyle(root.querySelector('.hero'),'::before').content,headerOverlap:hero.top<header.bottom-1,
        nav:[...document.querySelectorAll('[data-v2-primary-nav] a')].map(node=>{const box=node.getBoundingClientRect();return box.width>0&&box.left>=0&&box.right<=innerWidth+1&&box.bottom<=header.bottom+1;})};
    });
    assert.equal(geometry.overflow,false);assert.ok(Math.abs(geometry.coverRatio-.8)<.01,'Cover must keep V1 4:5 ratio');assert.equal(geometry.headerOverlap,false);assert.ok(geometry.nav.length===5&&geometry.nav.every(Boolean),'Top navigation clipped');
    assert.ok(geometry.backgroundSize.startsWith('42px 42px, 42px 42px'),'V1 grid missing');assert.notEqual(geometry.rings,'none','Decorative hero rings missing');
    assert.equal(geometry.headDirection,viewport.width<=800?'column':'row');assert.equal(geometry.snap,'x mandatory');
    assert.ok(Math.abs(geometry.cardWidth-(viewport.width<=800?Math.min(viewport.width*.76,280):Math.max(220,Math.min(viewport.width*.25,286))))<1,'V1 responsive card width changed');
    await page.locator('.v2-library-home .book').first().scrollIntoViewIfNeeded();
    const card=page.locator('.v2-library-home .book').first();await page.mouse.move(1,1);await card.hover();await page.waitForTimeout(250);
    assert.equal(await card.evaluate(node=>getComputedStyle(node).transform),'matrix(1, 0, 0, 1, 0, -4)','V1 hover motion missing');
    await page.mouse.move(1,1);await card.focus();await page.waitForTimeout(250);assert.equal(await card.evaluate(node=>getComputedStyle(node).transform),'matrix(1, 0, 0, 1, 0, -4)','V1 keyboard-focus motion missing');
    if(viewport.width<=800){
      assert.ok(geometry.rowScroll>geometry.rowWidth,'Mobile rules shelf cannot scroll');
      const scroll=await page.locator('[data-home-shelf="rules-tools"] .book-row').evaluate(async node=>{node.scrollTo({left:node.scrollWidth,behavior:'instant'});await new Promise(resolve=>requestAnimationFrame(resolve));return node.scrollLeft;});
      assert.ok(scroll>0,'Mobile shelf scroll action failed');
      await page.locator('[data-home-shelf="rules-tools"] .book-row').evaluate(node=>node.scrollTo({left:0,behavior:'instant'}));
    }
    await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0);});await page.waitForTimeout(250);await screenshot(page,'v2-home-'+device+'-ported');
    if(device==='desktop'||device==='phone'){
      const baseline=await context.newPage();await baseline.goto(origins.baseline+'/v2/app.html');await ready(baseline);
      const baselineHomeBody=await baseline.evaluate(()=>({color:getComputedStyle(document.body).color,background:getComputedStyle(document.body).backgroundColor}));
      for(const book of ['death-guard','adeptus-mechanicus']){
        await page.locator(`[data-v2-book="${book}"]`).click();await ready(page);assert.equal(await page.evaluate(()=>window.WarhammerAppV2.activeBookId),book);
        await navigate(baseline,{destination:'ARMY_BOOK',bookId:book,registryId:book});
        const current=await bookSnapshot(page,book),before=await bookSnapshot(baseline,book);
        if(JSON.stringify(current)!==JSON.stringify(before)){
          fs.writeFileSync(path.join(artifacts,`isolation-${book}-${device}.json`),JSON.stringify({currentURL:page.url(),baselineURL:baseline.url(),current,before},null,2));
          fs.writeFileSync(path.join(artifacts,`isolation-current-${book}-${device}.html`),await page.content());
          fs.writeFileSync(path.join(artifacts,`isolation-baseline-${book}-${device}.html`),await baseline.content());
        }
        assert.deepEqual(current,before,'Home CSS leaked into '+book+' '+device);
        assert.equal(await page.locator('.v2-library-home').count(),0,'Prior Home DOM retained inside book');
        await page.locator('[data-v2-primary-nav] [data-v2-destination="HOME"]').click();await ready(page);
        await navigate(baseline,{destination:'HOME'});
        assert.equal(await page.locator('.v2-library-home').count(),1);assert.equal(await page.locator('[data-army-book-v2]').count(),0,'Prior book root retained');
        assert.deepEqual(await page.evaluate(()=>({color:getComputedStyle(document.body).color,background:getComputedStyle(document.body).backgroundColor})),baselineHomeBody,'Home altered global body theme');
      }
      await page.goto(origins.current+'/synthetic-home.html');await page.waitForFunction(()=>Boolean(window.syntheticHome));
      const synthetic=await page.evaluate(()=>({initial:window.syntheticHome.initial,reversed:window.syntheticHome.render([...window.syntheticHome.entries].reverse()),loads:window.syntheticHome.loads,
        hrefs:[...document.querySelectorAll('[data-v2-book]')].map(node=>({id:node.dataset.v2Book,url:node.href}))}));
      assert.deepEqual(synthetic.initial,synthetic.reversed,'Metadata ordering depends on registration order');assert.equal(synthetic.loads,0,'Home presenter loaded factual data');
      assert.deepEqual(synthetic.initial.find(shelf=>shelf.id==='xenos')?.books,['synthetic-a','synthetic-z'],'Future category/order failed');
      assert.deepEqual(synthetic.initial.find(shelf=>shelf.id==='archive')?.books,['synthetic-archive']);
      assert.ok(synthetic.initial.some(shelf=>shelf.books.includes('synthetic-default')),'Metadata-free registration lost');
      assert.ok(synthetic.initial.every(shelf=>shelf.id==='rules-tools'||shelf.books.length>0),'Empty book shelf');
      assert.ok(synthetic.hrefs.every(({id,url})=>new URL(url).searchParams.get('book')===id),'Synthetic route identities changed');
    }
    reports.push({device,geometry,styleIsolation:device==='desktop'||device==='phone'?'PASS':'not repeated'});await context.close();await referenceContext.close();
  }
  assert.deepEqual(errors,[],'Browser exceptions');assert.deepEqual(forbidden,[],'Unexpected/legacy dependencies');
  assert.ok(!requests.current.some(address=>/offline-status|service-worker|roster-guides|\/scripts\/|\/glossary\//.test(address)),'V1 runtime requested by V2');
  console.log(JSON.stringify({status:'PASS',base,checks:reports,legacyRuntimeReads:0,bookStyleLeakage:0,syntheticFutureShelf:'PASS',syntheticRegistryOrder:'PASS',screenshots,distinctCurrentRequests:new Set(requests.current).size},null,2));
}finally{await browser.close();await Promise.all(Object.values(servers).map(server=>new Promise(resolve=>server.close(resolve))));}
