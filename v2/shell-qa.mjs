/** Registry isolation and real shell hosting with synthetic book inputs only. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {createBookRegistry} from '../books/shared/application-v2/registry.mjs';
import {resolveApplicationRoute,applicationRouteURL,legacyBookURL} from '../books/shared/application-v2/routes.mjs';
import {decodeRoute,normalizeRoute} from '../books/shared/army-book-app-v2/route-context.mjs';
import {createSyntheticPersonalFixture} from '../books/shared/army-book-app-v2/personal-datasheet-qa.mjs';

const repo=fileURLToPath(new URL('../',import.meta.url));
const definitions=['synthetic-a','synthetic-b','synthetic-third'].map(id=>({id,title:'Independent '+id,
  loadPayload:async()=>({book:{id}}),createRoster:async()=>null,styles:[],assetBaseURL:'https://example.invalid/'+id+'/',routeAliases:['/legacy/'+id+'/app.html']}));
const registry=createBookRegistry(definitions);
assert.deepEqual(registry.entries.map(entry=>entry.id),definitions.map(entry=>entry.id));
for(const definition of definitions){assert.equal(registry.get(definition.id).id,definition.id);assert.equal(registry.has(definition.id),true);
  assert.equal(registry.forPath('/legacy/'+definition.id+'/app.html')?.id,definition.id);}
assert.equal(registry.has('unregistered'),false);assert.ok(!registry.get('unregistered'));assert.ok(!registry.forPath('/unregistered/app.html'));
assert.throws(()=>createBookRegistry([definitions[0],definitions[0]]),'Duplicate registry IDs must fail closed');
assert.throws(()=>createBookRegistry([definitions[0],{...definitions[1],routeAliases:definitions[0].routeAliases}]),'An alias cannot belong to two books');
assert.ok(Object.isFrozen(registry)&&Object.isFrozen(registry.entries)&&Object.isFrozen(registry.entries[0]));
const base='https://example.invalid/v2/app.html?display=compact';
assert.equal(resolveApplicationRoute(base,registry).destination,'HOME');
for(const route of [{destination:'HOME',sectionId:'army-books'},{destination:'CORE_RULES',registryId:'core-rules'},{destination:'GLOSSARY'}]){
  const url=applicationRouteURL(base,route),resolved=resolveApplicationRoute(url,registry);
  assert.equal(resolved.destination,route.destination);assert.equal(resolved.module,false);assert.equal(new URL(url).searchParams.get('display'),'compact');
}
const rosterSelection=applicationRouteURL(base,{destination:'ROSTER'});
assert.equal(resolveApplicationRoute(rosterSelection,registry).module,false);assert.equal(new URL(rosterSelection).searchParams.has('book'),false);
const physical={destination:'REFERENCE',bookId:'synthetic-third',registryId:'synthetic-third',rosterId:'roster/α',
  instanceId:'instance/%2F/Ж',scopeId:'instance/%2F/Ж/row 1',profileId:'profile/α',canonicalId:'weapon/#?%+Ж',fieldPath:'/skill'};
const physicalURL=applicationRouteURL(base,physical);
assert.deepEqual(decodeRoute(physicalURL),normalizeRoute(physical));assert.equal(resolveApplicationRoute(physicalURL,registry).bookId,'synthetic-third');
const legacy=new URL(physicalURL);legacy.pathname='/legacy/synthetic-third/app.html';legacy.searchParams.delete('book');
const adapted=legacyBookURL(legacy.href,base,'synthetic-third');
assert.deepEqual(decodeRoute(adapted),normalizeRoute(physical));assert.equal(new URL(adapted).pathname,'/v2/app.html');
for(const url of [base+'&v2=HOME&v2=ROSTER',base+'&book=unregistered',base+'&v2=UNIT_INSTANCE',base+'&v2=CORE_RULES&registry=foreign',
  base+'&v2=HOME&book=synthetic-a',base+'&v2=GLOSSARY#unbound-canonical-id'])assert.throws(()=>resolveApplicationRoute(url,registry),'Invalid shell context was accepted: '+url);

const fixtures=definitions.map(({id,title})=>{
  const fixture=createSyntheticPersonalFixture(id,false),payload=fixture.payload;
  payload.book.title=title;payload.bookPresentation={schema:'army-book-app-v2/book-v1-presentation',records:{}};
  return {id,title,payload,unitId:fixture.id('unit'),weaponId:fixture.id('selected-weapon')};
});
const html=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Synthetic host</title></head>
<body><aside id="host-sentinel">Host owned content</aside><div id="host-root"></div><script type="module">
import {createApplication} from '/books/shared/application-v2/runtime.mjs';
import {createBookRegistry} from '/books/shared/application-v2/registry.mjs';
const fixtures=await(await fetch('/fixtures.json')).json();
const loads=[],gates=new Map();
const entries=fixtures.map(fixture=>({id:fixture.id,title:fixture.title,styles:[],assetBaseURL:new URL('/synthetic-assets/'+fixture.id+'/',location.href).href,
 routeAliases:['/legacy/'+fixture.id+'/app.html'],createRoster:async()=>null,
 async loadPayload(){loads.push(fixture.id);if(gates.has(fixture.id))await gates.get(fixture.id).promise;return structuredClone(fixture.payload);}}));
const registry=createBookRegistry(entries);
window.synthetic={fixtures,loads,registry,gates,createApplication,
 defer(id){let release;const promise=new Promise(resolve=>release=resolve);gates.set(id,{promise,release});},
 mount(){return createApplication(document,{registry,entryURL:new URL('/v2/app.html',location.href).href,root:document.querySelector('#host-root')});}};
window.synthetic.app=window.synthetic.mount();
</script></body></html>`;
const requests=[],forbidden=[],errors=[],results=[];
const server=http.createServer((request,response)=>{
  const address=new URL(request.url,'http://localhost').pathname;requests.push(address);
  if(address==='/favicon.ico'){response.writeHead(204);response.end();return;}
  if(address==='/v2/app.html'){response.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});response.end(html);return;}
  if(address==='/fixtures.json'){response.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});response.end(JSON.stringify(fixtures));return;}
  const allowed=/^\/books\/shared\/(?:application-v2|army-book-app-v2|roster-v2|rule-contract-v2)\/[\w.-]+\.(?:mjs|css)$/.test(address)||
    /^\/books\/shared\/(?:datasheet-system|unit-art)\.css$/.test(address);
  const file=path.resolve(repo,address.slice(1));
  if(!allowed||!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    forbidden.push(address);response.writeHead(404);response.end();return;
  }
  response.writeHead(200,{'Content-Type':file.endsWith('.css')?'text/css':'text/javascript','Cache-Control':'no-store'});response.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const installed='C:/Program Files/Google/Chrome/Application/chrome.exe';
const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||(fs.existsSync(installed)?installed:undefined);
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
const ready=async page=>{await page.waitForFunction(()=>Boolean(window.synthetic?.app));await page.evaluate(()=>window.synthetic.app.ready);
  await page.waitForFunction(()=>[...document.querySelectorAll('link[rel="stylesheet"]')].every(link=>Boolean(link.sheet)));};
const neutralNavigation=async page=>assert.deepEqual(await page.locator('[data-v2-primary-nav] a[aria-current]').evaluateAll(nodes=>nodes.map(node=>({color:getComputedStyle(node).color,background:getComputedStyle(node).backgroundColor}))),
  [{color:'rgb(255, 243, 215)',background:'rgb(41, 44, 51)'}],'Synthetic module changed neutral primary navigation');
const navigate=async(page,route)=>{await page.evaluate(route=>window.synthetic.app.navigate(route),route);await ready(page);};
try{
  for(const [device,viewport]of [['desktop',{width:1440,height:900}],['phone',{width:390,height:844}]]){
    const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage();page.setDefaultTimeout(15000);
    page.on('pageerror',error=>errors.push(error.message));await page.goto(origin+'/v2/app.html');await ready(page);
    await neutralNavigation(page);
    assert.deepEqual(await page.evaluate(()=>window.synthetic.loads),[],'Home eagerly loaded a book');
    assert.equal(await page.locator('#host-sentinel').innerText(),'Host owned content');
    const baseline=await page.evaluate(()=>({title:document.title,bodyClass:document.body.className,
      head:[...document.head.children].map(node=>node.outerHTML),storage:JSON.stringify(localStorage)}));
    // A third registration works with the same real shell/module, with no production book registration.
    for(const fixture of fixtures){
      await page.locator(`[data-v2-book="${fixture.id}"]`).first().click();await ready(page);
      assert.equal(await page.evaluate(()=>window.synthetic.app.activeBookId),fixture.id);
      await neutralNavigation(page);
      assert.equal(await page.locator('[data-army-book-v2]').count(),1);
      assert.equal(await page.locator('#host-sentinel').count(),1);
      await navigate(page,{destination:'ARMY_BOOK',bookId:fixture.id,canonicalId:fixture.unitId});
      assert.equal(await page.locator(`main .unit-card[data-card-id="${fixture.unitId}"]`).count(),1);
      assert.equal(await page.locator('main .v2-current-card').getAttribute('data-card-id'),fixture.unitId);
      assert.equal(new URL(page.url()).pathname,'/v2/app.html');
      await page.evaluate(()=>{window.oldModule=window.synthetic.app.activeModule;});
      await navigate(page,{destination:'HOME',sectionId:'army-books'});
      assert.equal(await page.evaluate(()=>window.oldModule.destroyed),true);
      assert.equal(await page.locator('[data-army-book-v2]').count(),0);
      assert.equal(await page.evaluate(()=>window.synthetic.app.activeBookId),null);
      assert.equal(await page.evaluate(()=>JSON.stringify(localStorage)),baseline.storage,'Synthetic reader invented persisted roster state');
    }
    assert.deepEqual(await page.evaluate(()=>[...new Set(window.synthetic.loads)]),fixtures.map(fixture=>fixture.id));
    // Out-of-order async loads must never remount an obsolete selected book.
    await page.evaluate(()=>{window.synthetic.defer('synthetic-a');window.pendingA=window.synthetic.app.navigate({destination:'ARMY_BOOK',bookId:'synthetic-a'});});
    await page.waitForFunction(()=>window.synthetic.loads.filter(id=>id==='synthetic-a').length>1);
    await navigate(page,{destination:'ARMY_BOOK',bookId:'synthetic-third'});
    await page.evaluate(async()=>{window.synthetic.gates.get('synthetic-a').release();await window.pendingA;});
    assert.equal(await page.evaluate(()=>window.synthetic.app.activeBookId),'synthetic-third','A late old payload replaced the new book');
    assert.equal(await page.locator('[data-army-book-v2]').count(),1);
    // Destroying while a payload is loading must prevent later DOM/API resurrection.
    await page.evaluate(()=>{window.synthetic.defer('synthetic-b');window.pendingB=window.synthetic.app.navigate({destination:'ARMY_BOOK',bookId:'synthetic-b'});});
    await page.waitForFunction(()=>window.synthetic.loads.filter(id=>id==='synthetic-b').length>1);
    await page.evaluate(async()=>{window.synthetic.app.destroy();window.synthetic.app.destroy();window.synthetic.gates.get('synthetic-b').release();await window.pendingB;});
    assert.equal(await page.locator('[data-v2-shell],[data-army-book-v2]').count(),0,'Destroyed shell resurrected after async payload resolution');
    assert.equal(await page.locator('#host-sentinel').count(),1);
    assert.equal(await page.locator('#host-root').innerHTML(),'');
    const after=await page.evaluate(()=>({title:document.title,bodyClass:document.body.className,head:[...document.head.children].map(node=>node.outerHTML),storage:JSON.stringify(localStorage)}));
    assert.equal(after.bodyClass,'');assert.equal(after.title,'Synthetic host');assert.equal(after.storage,baseline.storage);
    assert.equal(after.head.some(html=>html.includes('rel="stylesheet"')),false,'Shell or book styles survived destruction');
    assert.deepEqual(errors,[],'Synthetic shell emitted browser errors');
    results.push({device,syntheticRegistrations:3,thirdBook:true,lazyLoading:true,isolation:true,staleLoad:true,destroyDuringLoad:true,hostPreserved:true,neutralPrimaryNavigation:true});
    await context.close();
  }
  assert.deepEqual(forbidden,[],'Synthetic shell read a factual or non-platform dependency');
  console.log(JSON.stringify({status:'PASS',armyFactualReads:0,registry:true,duplicateRejection:true,results,errors,requests:[...new Set(requests)].length}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
