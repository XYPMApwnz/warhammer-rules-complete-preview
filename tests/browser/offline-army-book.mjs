/** Actual published worker/cache: unseen offline, saved offline, online failure. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {buildPagesRuntimePackage} from '../../tools/pages-runtime-package.mjs';
import {armyBooks} from '../../v2/army-books.mjs';
import {launchChromium} from '../helpers/browser-launch.mjs';
import {createQaTempDir,createQaEvidenceDir} from '../helpers/qa-temp.mjs';
import {waitForPreparedOffline} from '../helpers/prepared-offline.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url));
const out=path.resolve(process.env.WH_OFFLINE_BOOK_OUT||createQaEvidenceDir('offline-army-book-'));
fs.mkdirSync(out,{recursive:true});
const runtime=path.join(createQaTempDir('offline-army-book-'),'runtime');
const publication=buildPagesRuntimePackage({sourceRoot:root,outRoot:runtime});
const prefix='/warhammer-rules-complete-preview/';
const types={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
let refusedBook=null,browser,currentPage;
const requests=[],report={publication,results:[],pageErrors:[]};
const server=http.createServer((request,response)=>{
  const url=new URL(request.url,'http://localhost');
  try{
    if(url.pathname==='/favicon.ico'){response.writeHead(204).end();return;}
    assert(url.pathname.startsWith(prefix));
    const relative=decodeURIComponent(url.pathname.slice(prefix.length))||'index.html';
    const file=path.resolve(runtime,relative);
    assert(file.startsWith(runtime+path.sep));
    if(refusedBook&&relative===`books/${refusedBook}/v2/generated/app-presentation.json`){
      requests.push({book:refusedBook,status:503,path:relative});
      response.writeHead(503,{'cache-control':'no-store'}).end('Injected online book failure');return;
    }
    response.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream','cache-control':'no-cache'});
    fs.createReadStream(file).on('error',()=>response.destroy()).pipe(response);
  }catch{response.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const entry=`http://127.0.0.1:${server.address().port}${prefix}v2/app.html`;
const offlineText="This Army Book isn't saved for offline use yet. Open it once while online, then it will work offline.";
const onlineText='The Army Book could not be loaded. Return Home and try again.';
async function go(page,id){
  await page.goto(entry+(id?'?book='+id:''),{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.WarhammerAppV2);
  await page.evaluate(()=>WarhammerAppV2.ready);
}
async function mounted(page,id){
  await page.waitForFunction(id=>WarhammerAppV2.activeBookId===id,id);
  assert.equal(await page.locator('.unit-card').count()>0,true,'Native library has no datasheets');
  assert.equal(await page.getByText(offlineText,{exact:true}).count(),0);
  return page.locator('.unit-card').count();
}
function observe(page){currentPage=page;page.on('pageerror',error=>report.pageErrors.push(error.stack));}
try{
  browser=await launchChromium();
  for(const width of [390,1440]){
    // Full shell installed; no book has ever been opened or payload fetched.
    const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'allow'});
    try{
      const page=await context.newPage();observe(page);await go(page);
      await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
      await waitForPreparedOffline(page);
      const payloads=await page.evaluate(async()=>{
        const keys=await caches.keys(),result=[];
        for(const key of keys)for(const request of await(await caches.open(key)).keys())if(request.url.includes('/generated/app-presentation.json'))result.push(request.url);
        return result;
      });
      assert.deepEqual(payloads,[],'Unseen-book control already contains a book payload');
      await context.setOffline(true);
      for(const book of armyBooks){
        await go(page,book.id);
        assert.equal(await page.locator('main h1').innerText(),'Army Book unavailable');
        assert.equal(await page.locator('.v2-home-intro').innerText(),offlineText);
        assert.equal(await page.getByText(onlineText,{exact:true}).count(),0);
        assert.equal(await page.locator('.unit-card').count(),0);
        const home=page.getByRole('link',{name:'Back to Home',exact:true});
        assert.equal(await home.count(),1);await home.click();
        await page.waitForFunction(()=>WarhammerAppV2.activeBookId===null&&!!document.querySelector('[data-v2-book]'));
        assert.equal(await page.locator('[data-v2-book]').count(),9);
        report.results.push({width,book:book.id,case:'unseen offline book: exact explanation and working Home action',status:'PASS'});
        if(book.id==='death-guard'){
          await go(page,book.id);await page.screenshot({path:path.join(out,`${width}-unseen-offline.png`),fullPage:true});
        }
      }
      // Warm the exact native data online, then really reload each book offline.
      for(const book of armyBooks){
        await context.setOffline(false);await go(page,book.id);const onlineCount=await mounted(page,book.id);
        await context.setOffline(true);await go(page,book.id);const offlineCount=await mounted(page,book.id);
        assert.equal(offlineCount,onlineCount,'Offline datasheet count differs');
        report.results.push({width,book:book.id,case:'previously opened book reopens offline',datasheets:offlineCount,status:'PASS'});
      }
    }finally{await context.close();}
    // Fresh online profile cannot satisfy the refused data from a warm SW cache.
    for(const book of armyBooks){
      const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
      try{
        const page=await context.newPage();observe(page);refusedBook=book.id;
        const before=requests.length;await go(page,book.id);
        assert(requests.slice(before).some(row=>row.book===book.id&&row.status===503),'Fault did not hit the real book payload');
        assert.equal(await page.locator('.v2-home-intro').innerText(),onlineText);
        assert.equal(await page.getByText(offlineText,{exact:true}).count(),0);
        const retry=page.getByRole('button',{name:'Try again',exact:true});assert.equal(await retry.count(),1);
        if(book.id==='death-guard')await page.screenshot({path:path.join(out,`${width}-online-error.png`),fullPage:true});
        refusedBook=null;await retry.click();await mounted(page,book.id);
        report.results.push({width,book:book.id,case:'online failure retains exact old text and retry recovers',status:'PASS'});
      }finally{refusedBook=null;await context.close();}
    }
  }
  assert.deepEqual(report.pageErrors,[],'Unexpected page exceptions');
  report.status='PASS';console.log('Offline Army Book browser PASS: 54 cases across nine books at 390/1440.');
}catch(error){
  report.status='FAIL';report.error=error.stack;process.exitCode=1;console.error(error.stack);
  if(currentPage&&!currentPage.isClosed()){
    try{fs.writeFileSync(path.join(out,'failure.html'),await currentPage.content());}catch{}
  }
}finally{
  await browser?.close();await new Promise(resolve=>server.close(resolve));
  fs.writeFileSync(path.join(out,'REPORT.json'),JSON.stringify(report,null,2)+'\n');
  console.log('Evidence '+out);
}
