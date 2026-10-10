import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {encodeRoute} from '../books/shared/army-book-app-v2/route-context.mjs';

const repo=fileURLToPath(new URL('../',import.meta.url)),reader=path.join(repo,'books/core-rules/reader');
const routes=fs.readdirSync(reader).filter(file=>file.endsWith('.html'));
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg'};
const errors=[],missing=[],results=[],screenshots=fs.mkdtempSync(path.join(os.tmpdir(),'core-v2-mount-'));
const server=createServer((request,response)=>{try{
  const pathname=new URL(request.url,'http://local').pathname;
  if(pathname==='/favicon.ico'){response.writeHead(204).end();return;}
  let file=path.resolve(repo,'.'+decodeURIComponent(pathname));assert(file.startsWith(path.resolve(repo)+path.sep));
  if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  response.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(response);
}catch{response.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`,entry=`${origin}/v2/app.html`,browser=await launchChromium();
const core={destination:'CORE_RULES',registryId:'core-rules'};
const ready=async page=>{await page.waitForFunction(()=>!!window.WarhammerAppV2);await page.evaluate(()=>window.WarhammerAppV2.ready);};
const child=async page=>(await page.locator('iframe.v2-core-reader').elementHandle()).contentFrame();
const navigate=async(page,route)=>{await page.evaluate(route=>window.WarhammerAppV2.navigate(route),route);await ready(page);};
try{
  for(const width of [1440,390]){
    const context=await browser.newContext({viewport:{width,height:width===390?844:900},serviceWorkers:'block'});
    context.setDefaultTimeout(15000);
    context.on('page',page=>{
      page.on('pageerror',error=>errors.push(`${width}: ${error.message}`));
      page.on('response',response=>{if(response.status()>=400&&!response.url().endsWith('/favicon.ico'))missing.push(response.url());});
    });
    const page=await context.newPage();
    await page.goto(entry);await ready(page);
    await page.locator('[data-home-tool="core-rules"],.book[href*="v2=CORE_RULES"]').first().click();await ready(page);
    assert.equal(await page.locator('[data-core-reader]').count(),1,'Home did not mount Core');
    let frame=await child(page);assert(await frame.locator('.sidebar').count());
    await page.screenshot({path:path.join(screenshots,`${width}-core-root.png`)});
    const historyLength=await page.evaluate(()=>history.length);
    if(width===390)await frame.locator('#navButton').click();
    await frame.locator('.sidebar a[href*="chapter=shooting-phase"]').click();await ready(page);
    assert.equal(new URL(page.url()).searchParams.get('chapter'),'shooting-phase');
    assert.equal(await page.evaluate(()=>history.length),historyLength+1,'Child navigation added an extra history entry');
    await page.evaluate(()=>history.back());await page.waitForURL(url=>url.searchParams.get('v2')==='CORE_RULES'&&!url.searchParams.has('chapter'));await ready(page);
    await page.evaluate(()=>history.forward());await page.waitForURL(url=>url.searchParams.get('chapter')==='shooting-phase');await ready(page);
    for(const file of routes){
      await navigate(page,{...core,chapterId:file==='index.html'?null:file.slice(0,-5)});frame=await child(page);
      const original=fs.readFileSync(path.join(reader,file),'utf8');
      assert(await frame.evaluate(html=>new DOMParser().parseFromString(html,'text/html').querySelector('main').textContent===document.querySelector('main').textContent,original),`${file}: reader text differs from certified standalone presentation`);
      await frame.locator('details').evaluateAll(nodes=>nodes.forEach(node=>node.open=true));
      const metrics=await frame.evaluate(async()=>{
        const images=[...document.querySelectorAll('main img')];for(const img of images){img.loading='eager';await img.decode();}
        return {width:innerWidth,pageWidth:document.documentElement.scrollWidth,images:images.every(img=>img.naturalWidth>0),text:document.querySelector('main').innerText};
      });
      assert.equal(metrics.width,width);assert(metrics.pageWidth<=width+1,`${file}: child page overflows`);assert(metrics.images,`${file}: broken diagram`);
      assert(!/CORE_MAIN_RULE|CORE_ERRATA|\[object Object\]|Errata\s+Show\s+[\d.]+\s*-\s*(?:Change|Add)/.test(metrics.text),`${file}: internal/applied instructions visible`);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Shell page overflows');
      const geometry=await page.locator('iframe').evaluate(node=>({top:node.getBoundingClientRect().top,header:document.querySelector('.v2-primary-header').getBoundingClientRect().bottom,bottom:node.getBoundingClientRect().bottom,height:innerHeight}));
      assert(geometry.top>=geometry.header-1&&geometry.bottom<=geometry.height+1,'Core viewport overlaps shell navigation');
    }
    const deep={...core,chapterId:'fight-phase',sectionId:'rule-12-08',canonicalId:'core-rule-12-08-consolidation-move'},deepURL=encodeRoute(entry,deep);
    await page.goto(deepURL);await ready(page);frame=await child(page);
    assert.equal(await frame.locator('#rule-12-08').count(),1);
    await page.reload();await ready(page);assert.equal(page.url(),deepURL);
    const newPage=await context.newPage();await newPage.goto(deepURL);await ready(newPage);assert.equal(await (await child(newPage)).locator('#rule-12-08').count(),1);await newPage.close();
    frame=await child(page);
    const sectionLink=frame.locator('.on-page a').first(),sectionURL=await sectionLink.getAttribute('href');
    assert.equal(new URL(sectionURL).pathname,'/v2/app.html');assert(new URL(sectionURL).searchParams.get('section'));
    if(width===390)await frame.locator('#navButton').click();
    const sectionOpening=context.waitForEvent('page');await sectionLink.click({modifiers:['Control']});const sectionTab=await sectionOpening;await ready(sectionTab);
    assert.equal(new URL(sectionTab.url()).pathname,'/v2/app.html');await sectionTab.close();
    if(width===390)await frame.locator('#navButton').click();
    await sectionLink.click();await ready(page);frame=await child(page);
    await frame.locator('.on-page a').first().evaluate(link=>{
      const target=document.querySelector(link.dataset.readerSection);target.scrollIntoView({block:'center',behavior:'instant'});
    });
    await frame.waitForFunction(()=>!!document.querySelector('.on-page a[aria-current]'));
    await page.goto(encodeRoute(entry,{...core,chapterId:'fight-phase',sectionId:'rule-12-08'}));await ready(page);
    assert.equal(await (await child(page)).locator('#rule-12-08').count(),1,'Section-only direct URL failed');
    await navigate(page,{...core,chapterId:'monsters-vehicles'});frame=await child(page);
    await frame.locator('[data-term="core-blast"]').first().click();
    await navigate(page,{...core,chapterId:'monsters-vehicles'});frame=await child(page);
    assert.equal(await frame.locator('dialog[open]').count(),0,'Fresh same-chapter route retained an old popup');
    await frame.locator('[data-term="core-blast"]').first().click();assert.equal(await frame.locator('#termDialog').getAttribute('data-open-term'),'core::core-blast');
    const fullRule=frame.locator('#termRule');await fullRule.waitFor({state:'visible'});
    assert.equal(new URL(await fullRule.getAttribute('href')).hash,'#core-blast','Full rule link lost canonical identity');
    const popupPromise=context.waitForEvent('page');await fullRule.click({modifiers:['Control']});const native=await popupPromise;await ready(native);assert.equal(new URL(native.url()).pathname,'/v2/app.html');assert.equal(await (await child(native)).locator('#rule-24-05').count(),1);await native.close();
    await frame.locator('[data-term="core-blast"]').first().click();
    await fullRule.click();await ready(page);assert.equal(await (await child(page)).locator('#rule-24-05').count(),1);
    await page.evaluate(()=>history.back());await page.waitForURL(url=>url.searchParams.get('chapter')==='monsters-vehicles');await ready(page);frame=await child(page);
    await frame.locator('#termDialog[open]').waitFor();assert.equal(await frame.locator('#termDialog').getAttribute('data-open-term'),'core::core-blast','Back did not restore original Core popup');
    await frame.locator('#termFull').click();await ready(page);assert.equal(await page.locator('[data-global-glossary]').count(),1,'Core article did not use existing shared reference presenter');assert.equal(await page.locator('iframe').count(),0);
    const article=await page.locator('.global-glossary-main').innerText();assert(/\bBlast\b/i.test(article),article);
    await page.evaluate(()=>history.back());await page.waitForURL(url=>url.searchParams.get('v2')==='CORE_RULES');await ready(page);frame=await child(page);await frame.locator('#termDialog[open]').waitFor();await frame.locator('#termClose').click();
    for(const chapterId of ['shooting-phase','fight-phase']){
      await navigate(page,{...core,chapterId});frame=await child(page);const icon=frame.locator('main img.rule-marker');assert.equal(await icon.count(),1);await icon.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(screenshots,`${width}-${chapterId}.png`)});
    }
    // Same root lifecycle, alternating both book modules and Core; no parent Core CSS.
    for(const bookId of ['death-guard','adeptus-mechanicus']){
      await page.evaluate(()=>window.oldCore=window.WarhammerAppV2.activeModule);
      await navigate(page,{destination:'ARMY_BOOK',bookId,registryId:bookId});
      assert(await page.evaluate(()=>window.oldCore.destroyed));assert.equal(await page.locator('iframe,[data-core-reader]').count(),0);
      assert.equal(await page.locator('link[href*="core-rules/reader/"]').count(),0);
      assert.equal(await page.locator('[data-army-book-v2]').count(),1);assert.equal(await page.evaluate(()=>!!window.WH40K_GLOSSARY||!!window.WHPageState),false,'Core globals leaked into host');
      await navigate(page,core);assert.equal(await page.locator('iframe').count(),1);
    }
    const old=await context.newPage();await old.goto(`${origin}/books/core-rules/reader/moving.html#rule-03-01`);assert.equal(await old.locator('#rule-03-01').count(),1);assert.equal(await old.locator('[data-v2-shell]').count(),0);await old.close();
    await page.evaluate(async()=>{
      const app=window.WarhammerAppV2;
      await Promise.all(['moving','shooting-phase','fight-phase'].map(chapterId=>app.navigate({destination:'CORE_RULES',registryId:'core-rules',chapterId})).concat(app.navigate({destination:'HOME'})));
    });
    assert.equal(await page.locator('iframe').count(),0,'An obsolete chapter load remounted Core after Home');
    await navigate(page,core);
    await page.evaluate(()=>{window.oldCore=window.WarhammerAppV2.activeModule;window.WarhammerAppV2.destroy();});assert(await page.evaluate(()=>window.oldCore.destroyed));assert.equal(page.frames().length,1);assert.equal(await page.locator('[data-v2-shell]').count(),0);
    results.push({width,routes:routes.length,standaloneDOMParity:true,history:true,newTab:true,popupRestore:true,sharedArticles:true,legacyLinks:true,lifecycle:true,styleLeakage:0});await context.close();
  }
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
  console.log(JSON.stringify({status:'PASS',results,screenshots}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
