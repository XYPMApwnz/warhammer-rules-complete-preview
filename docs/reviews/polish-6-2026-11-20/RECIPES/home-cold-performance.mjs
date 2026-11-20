/** Fixed cold-HOME comparison. Do not run before the final source freeze. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {launchChromium} from 'file:///E:/Warhammer/worktrees/polish-6-v1/tests/helpers/browser-launch.mjs';

const arg=name=>process.argv.find(value=>value.startsWith(name+'='))?.slice(name.length+1);
const metadataPath=arg('--metadata');
assert(metadataPath&&!metadataPath.startsWith('/')&&!metadataPath.includes('..'),'Pass the frozen generated metadata relative path with --metadata=...');
const probeCache=process.argv.includes('--probe-cache');
const out='E:/Warhammer/qa-evidence/polish-6-v1-2026-11-20';
const roots={base:'E:/Warhammer/qa-tmp/polish-6/runtime-50',head:'E:/Warhammer/worktrees/polish-6-v1'};
const forbidden=['books/core-rules/content/core-rules.digital-11e.json','mfm/current.json'];
const mime={'.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.html':'text/html','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.webmanifest':'application/manifest+json'};
const rows=[],errors=[];
const report={schema:'cold-home-performance/v1',started:new Date().toISOString(),roots,baseSha:'50c9a9c89d8e66e0466dbeeabc918ec1d465c87f',metadataPath,policy:{
  viewport:{width:390,height:844},freshBrowserProcessAndProfileEverySample:true,freshContextEverySample:true,serviceWorkers:'block',browserHttpCache:'disabled',
  network:'unthrottled local static HTTP; raw uncompressed bytes; Cache-Control no-store for both versions',cpu:'unthrottled',
  repetitions:3,order:'base/head; head/base; base/head',parallelHeavyRuns:false,
  start:'Immediately before page.goto',
  endpoint:'Real HOME, exactly nine unique book cards; bootstrap and application.ready complete; all active stylesheets including @imports ready; document.fonts.ready; every HOME/header image loaded and decoded; two animation frames',
  featureReadiness:'Head additionally requires exactly one successful Sources caption; baseline has no such feature',
  gate:'head median <= base median * 1.05',probeCacheUntimed:probeCache,
  limitations:'First-screen browser navigation with service workers blocked; does not time browser launch, SW installation or physical-device Safari'
},rows,errors};
const save=()=>fs.writeFileSync(path.join(out,'HOME_COLD_PERFORMANCE.json'),JSON.stringify(report,null,2)+'\n');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const inputFiles=['v2/app.html','v2/boot.mjs','books/shared/application-v2/runtime.mjs','books/shared/application-v2/home.mjs','books/shared/application-v2/source-metadata.mjs','books/shared/application-v2/shell.css',metadataPath];
report.inputHashes=Object.fromEntries(Object.entries(roots).map(([version,root])=>[version,Object.fromEntries(inputFiles.filter(file=>fs.existsSync(path.join(root,file))).map(file=>[file,hash(fs.readFileSync(path.join(root,file)))]))]));
const auditFiles=['books/shared/source-refs-v2/source-catalog.mjs','books/shared/roster-v2/keywords.mjs','books/shared/application-v2/source-metadata.mjs'];
report.jsonImportAttributeAudit=Object.fromEntries(Object.entries(roots).map(([version,root])=>[version,auditFiles.flatMap(file=>{
 if(!fs.existsSync(path.join(root,file)))return [];
 return fs.readFileSync(path.join(root,file),'utf8').split(/\r?\n/).flatMap((line,index)=>/^\s*import\b.*\.json['"].*\b(?:with|assert)\s*\{/.test(line)?[{file,line:index+1,text:line.trim()}]:[]);
})]));
if(report.jsonImportAttributeAudit.head.some(row=>row.file.endsWith('/source-metadata.mjs'))){report.status='FAIL_STATIC_IMPORT_ATTRIBUTES';report.finished=new Date().toISOString();save();assert.fail('New metadata startup module must not introduce JSON import attributes');}

let active=null;
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://local'),parts=decodeURIComponent(url.pathname).split('/').filter(Boolean),version=parts.shift(),root=roots[version];
 if(!root){if(active)active.requests.push({path:url.pathname.slice(1),method:req.method,status:204,bodyBytes:0,contentEncoding:'identity',unscoped:true});res.writeHead(204).end();return;}
 const relative=parts.join('/'),file=path.resolve(root,...parts),row={path:relative,method:req.method,status:200,bodyBytes:0,contentEncoding:'identity'};
 if(active&&active.version===version)active.requests.push(row);
 if(!file.startsWith(path.resolve(root)+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
  row.status=relative==='favicon.ico'?204:404;res.writeHead(row.status).end();return;
 }
 const bytes=fs.readFileSync(file);row.bodyBytes=bytes.length;
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Length':bytes.length,'Cache-Control':'no-store'}).end(bytes);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;

async function homeReady(page,version){
 await page.waitForFunction(()=>{
  const main=document.querySelector('main.v2-library-home'),cards=main?.querySelectorAll('[data-v2-book]');
  const readySheet=sheet=>{if(!sheet)return false;try{return [...sheet.cssRules].every(rule=>rule.type!==3||readySheet(rule.styleSheet));}catch{return false;}};
  return main&&cards.length===9&&new Set([...cards].map(node=>node.dataset.v2Book)).size===9&&window.WarhammerAppV2&&!document.body.hasAttribute('data-pwa-bootstrap-state')&&[...document.querySelectorAll('link[rel="stylesheet"]:not([disabled])')].every(link=>readySheet(link.sheet));
 });
 await page.evaluate(async()=>{
  await WarhammerAppV2.ready;await document.fonts.ready;
  const images=[...document.querySelectorAll('.v2-primary-header img,main.v2-library-home img')];
  await Promise.all(images.map(image=>image.decode()));
  if(images.some(image=>!image.complete||!image.naturalWidth))throw new Error('HOME/header image did not load');
 });
 if(version==='head')await page.waitForFunction(()=>document.querySelectorAll('main.v2-library-home [data-v2-sources-line]').length===1&&!document.querySelector('[data-v2-sources-unavailable]'));
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}

try{
 for(let repeat=0;repeat<3;repeat++)for(const version of repeat%2?['head','base']:['base','head']){
  let browser,context;active={version,requests:[]};
  try{
   browser=await launchChromium();report.browser=browser.version();
   context=await browser.newContext({viewport:report.policy.viewport,serviceWorkers:'block'});
   const page=await context.newPage();page.setDefaultTimeout(30000);
   page.on('pageerror',error=>errors.push({version,repeat:repeat+1,message:error.message}));
   page.on('request',request=>{if(!request.url().startsWith(origin+'/'))errors.push({version,repeat:repeat+1,externalStartupRequest:request.url()});});
   const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
   const begin=performance.now();await page.goto(`${origin}/${version}/v2/app.html`,{waitUntil:'domcontentloaded'});await homeReady(page,version);const elapsedMs=performance.now()-begin;
   const requests=active.requests.map(row=>({...row}));
   const screen=await page.evaluate(()=>({bookIds:[...document.querySelectorAll('main [data-v2-book]')].map(node=>node.dataset.v2Book).sort(),caption:document.querySelector('[data-v2-sources-line]')?.textContent||null,images:[...document.querySelectorAll('.v2-primary-header img,main.v2-library-home img')].map(node=>({src:new URL(node.currentSrc).pathname,complete:node.complete,width:node.naturalWidth})),resources:performance.getEntriesByType('resource').map(row=>({path:new URL(row.name).pathname,initiatorType:row.initiatorType,transferSize:row.transferSize,encodedBodySize:row.encodedBodySize,decodedBodySize:row.decodedBodySize,duration:row.duration}))}));
   const metadataGets=requests.filter(row=>row.path===metadataPath&&row.method==='GET'),rawOwnerRequests=requests.filter(row=>forbidden.includes(row.path));
   if(version==='head'){assert.equal(metadataGets.length,1,'Exactly one generated metadata GET during cold HOME');assert.deepEqual(rawOwnerRequests,[],'Cold HOME must not load full canonical Core/MFM owner files');assert(screen.caption?.startsWith('Points: Munitorum Field Manual '),'Real Sources caption is ready');}
   assert.deepEqual(requests.filter(row=>row.status>=400),[],'All startup resources are served locally');
   const row={version,repeat:repeat+1,elapsedMs,requestCount:requests.length,bodyBytes:requests.reduce((sum,row)=>sum+row.bodyBytes,0),metadataGets:metadataGets.length,rawOwnerRequests,requests,screen};
   rows.push(row);save();console.log(JSON.stringify({version,repeat:repeat+1,elapsedMs,requestCount:row.requestCount,bodyBytes:row.bodyBytes,metadataGets:row.metadataGets}));
   if(probeCache){
    await page.locator('[data-v2-primary-nav] [data-v2-destination="ARMY_BOOK"]').click();await page.waitForFunction(()=>document.querySelector('main h1')?.textContent==='Army Books');
    await page.locator('[data-v2-primary-nav] [data-v2-destination="HOME"]').click();await homeReady(page,version);
    row.untimedCacheProbe={route:'HOME → Army Books library → HOME',metadataGets:active.requests.filter(row=>row.path===metadataPath&&row.method==='GET').length};
    if(version==='head')assert.equal(row.untimedCacheProbe.metadataGets,1,'Metadata is fetched only once across Home navigation');save();
   }
  }catch(error){report.incompleteSample={version,repeat:repeat+1,requests:active?.requests||[],error:error.message};throw error;}
  finally{if(context)await context.close();if(browser)await browser.close();active=null;}
 }
 const median=values=>values.toSorted((a,b)=>a-b)[Math.floor(values.length/2)];
 report.medians=Object.fromEntries(Object.keys(roots).map(version=>[version,Object.fromEntries(['elapsedMs','requestCount','bodyBytes'].map(key=>[key,median(rows.filter(row=>row.version===version).map(row=>row[key]))]))]));
 report.ratio=report.medians.head.elapsedMs/report.medians.base.elapsedMs;
 assert.deepEqual(rows.filter(row=>row.version==='head').map(row=>row.screen.bookIds),rows.filter(row=>row.version==='base').map(row=>row.screen.bookIds),'All nine native book cards remain identical');
 assert.deepEqual(errors,[]);report.status=report.ratio<=1.05?'PASS':'FAIL_THRESHOLD';report.finished=new Date().toISOString();save();console.log(JSON.stringify({status:report.status,medians:report.medians,ratio:report.ratio}));assert.equal(report.status,'PASS','Cold HOME must remain within +5% of exact baseline 50');
}catch(error){report.status=report.status||'FAIL';report.failure=error.message;report.finished=new Date().toISOString();save();throw error;}
finally{await new Promise(resolve=>server.close(resolve));save();}
