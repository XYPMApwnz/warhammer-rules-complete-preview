/** Frozen-package comparison; real native saves, identical cold endpoints. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {launchChromium} from 'file:///E:/Warhammer/worktrees/browser-compat-v1/tests/helpers/browser-launch.mjs';
import {resolveAppShellUrl} from 'file:///E:/Warhammer/worktrees/browser-compat-v1/tools/cache-revision.mjs';

const root='E:/Warhammer/worktrees/browser-compat-v1';
const out='E:/Warhammer/qa-evidence/browser-compat-v1-2026-11-20';
const temporary='E:/Warhammer/qa-tmp/browser-compat';
const roots={base:'E:/Warhammer/qa-tmp/preview-v1/package-polish-6-9876164d',head:temporary+'/runtime-head'};
const hashes={base:'9876164de85f1e35aa2cf070a3eb9de662093980',head:'b0aa1273b907020776dec41ca0466d646e5435e2'};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const metadataPath='books/shared/application-v2/generated/source-metadata.v1.json';
const catalogPath='books/shared/source-refs-v2/source-catalog.json';
const storageKey=book=>'army-book-app-v2:roster:'+book;
const expectedCounts={'death-guard':8,'space-marines':3};
const resumeProbe=process.argv.includes('--cache-probe-only');
const report=resumeProbe?read(out+'/PERFORMANCE_INITIAL_PROBE_FAILURE.json'):{schema:'browser-compatible-runtime-performance/v1',status:'RUNNING',started:new Date().toISOString(),hashes,roots,
  policy:{viewport:{width:390,height:844},freshBrowserProcessAndProfileEveryMeasuredSample:true,browserHttpCache:'disabled',
    serviceWorkers:'block',network:'unthrottled loopback static HTTP, raw uncompressed response bodies; no-store on both revisions',
    cpu:'unthrottled',repetitions:3,order:'For each lane: base/head, head/base, base/head',parallelHeavyRuns:false,
    start:'Immediately before page.goto; browser launch and save preparation excluded',
    homeEndpoint:'Real Home; nine unique book cards; bootstrap/application.ready; styles including imports; fonts; decoded Home/header images; Sources caption; two animation frames',
    rosterEndpoint:'Direct ROSTER query; restored native save; every native unit article; application/roster ready; styles including imports; fonts; two animation frames',
    performanceThreshold:'None imposed by this task; all measured changes are reported',
    limitations:'Desktop installed Chromium with mobile viewport, not physical Safari/Chrome100; browser cache is cold, OS file cache is not flushed'},
  publications:{},sizes:{},seeds:{},rows:[],errors:[]};
const save=()=>fs.writeFileSync(out+'/PERFORMANCE.json',JSON.stringify(report,null,2)+'\n');
const measuredRowsHash=resumeProbe?sha(JSON.stringify(report.rows)):null;
if(resumeProbe){report.initialProbeFailure={record:'PERFORMANCE_INITIAL_PROBE_FAILURE.json',reason:report.failure,postMeasurementErrors:report.errors,
  measuredSamplesCompleted:report.rows.length,measuredRowsSha256:measuredRowsHash,
  correction:'Empty Tau has no roster; the untimed probe must not call snapshot(). The 18 measured samples are retained unchanged.'};
  delete report.failure;delete report.incompleteSample;report.errors=[];report.status='RUNNING_PROBE_ONLY';}
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(temporary,{recursive:true});save();

// Exactly one read/gzip per body and package. Report both URL totals and unique
// body totals because the existing shell can cache the same path at two URLs.
for(const [version,packageRoot]of Object.entries(roots)){
  const manifestBytes=fs.readFileSync(packageRoot+'/PAGES_RUNTIME_MANIFEST.json'),manifest=JSON.parse(manifestBytes);
  if(resumeProbe)assert.equal(sha(manifestBytes),report.publications[version].manifestSha256,'Frozen publication must not change during probe correction');
  report.publications[version]={sha:hashes[version],manifestSha256:sha(manifestBytes),contentSha256:manifest.contentSha256,
    cacheRevision:manifest.cacheRevision,allowlistSha256:manifest.allowlistSha256};
  const bodies=new Map(),files=resumeProbe?report.sizes[version].files:[];
  if(resumeProbe)for(const row of files)bodies.set(row.path,row);
  else for(const item of manifest.files){
    const bytes=fs.readFileSync(path.join(packageRoot,item.path));
    assert.equal(bytes.length,item.bytes,item.path);assert.equal(sha(bytes),item.sha256,item.path);
    const row={path:item.path,bytes:bytes.length,gzipBytes:gzipSync(bytes,{level:9}).length,sha256:item.sha256};
    bodies.set(item.path,row);files.push(row);
  }
  // INSTALL_SHELL consumes the generated list. The legacy APP_SHELL constant
  // contains only six fallback entries and is not the current mandatory list.
  const publishedCache=fs.readFileSync(packageRoot+'/glossary/generated/cache-revision.js','utf8');
  const precacheMatch=publishedCache.match(/self\.WH40K_PRECACHE=(\[[^\n]*\]);/);assert(precacheMatch);
  const urls=JSON.parse(precacheMatch[1]);assert.equal(urls.length,manifest.precacheUrls);
  const precache=urls.map(url=>{const {relative}=resolveAppShellUrl(packageRoot,url),body=bodies.get(relative);assert(body,relative);return {url,...body};});
  const unique=[...new Map(precache.map(row=>[row.path,row])).values()];
  report.sizes[version]={runtimeFiles:files.length,packageFiles:files.length+1,
    runtimeRawBytes:files.reduce((n,row)=>n+row.bytes,0),runtimeGzipBytes:files.reduce((n,row)=>n+row.gzipBytes,0),
    packageRawBytes:files.reduce((n,row)=>n+row.bytes,0)+manifestBytes.length,
    packageGzipBytes:files.reduce((n,row)=>n+row.gzipBytes,0)+gzipSync(manifestBytes,{level:9}).length,
    mandatoryUrls:urls.length,mandatoryUniqueBodies:unique.length,
    mandatoryRawBytes:precache.reduce((n,row)=>n+row.bytes,0),mandatoryGzipBytes:precache.reduce((n,row)=>n+row.gzipBytes,0),
    mandatoryUniqueRawBytes:unique.reduce((n,row)=>n+row.bytes,0),mandatoryUniqueGzipBytes:unique.reduce((n,row)=>n+row.gzipBytes,0),
    files,precache};
  report.sizes[version].mandatorySource='Published self.WH40K_PRECACHE, exactly as consumed by service-worker INSTALL_SHELL';
  console.log(JSON.stringify({phase:'sizes',version,files:files.length,packageRawBytes:report.sizes[version].packageRawBytes,
    mandatoryUrls:urls.length,mandatoryRawBytes:report.sizes[version].mandatoryRawBytes,mandatoryGzipBytes:report.sizes[version].mandatoryGzipBytes}));save();
}

const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json',
  '.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp',
  '.woff2':'font/woff2','.webmanifest':'application/manifest+json'};
let active;
const server=http.createServer((request,response)=>{
  const url=new URL(request.url,'http://local'),segments=decodeURIComponent(url.pathname).split('/').filter(Boolean),version=segments.shift(),packageRoot=roots[version];
  if(!packageRoot){response.writeHead(204).end();return;}
  const relative=segments.join('/')||'index.html',file=path.resolve(packageRoot,relative);
  const row={path:relative,method:request.method,status:200,bodyBytes:0};
  if(active?.version===version)active.requests.push(row);
  if(!file.startsWith(path.resolve(packageRoot)+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    row.status=relative==='favicon.ico'?204:404;response.writeHead(row.status).end();return;
  }
  const bytes=fs.readFileSync(file);row.bodyBytes=bytes.length;
  response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Length':bytes.length,'Cache-Control':'no-store'}).end(bytes);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
const catalogGets=()=>active.requests.filter(row=>row.path===catalogPath&&row.method==='GET').length;
const address=(version,book)=>`${origin}/${version}/v2/app.html${book?'?v2=ROSTER&book='+book:''}`;
const noErrors=()=>{assert.deepEqual(report.errors,[]);assert.deepEqual(active.requests.filter(row=>row.status>=400),[]);};
async function stylesReady(page){
  await page.waitForFunction(()=>{
    const ready=sheet=>{if(!sheet)return false;try{return [...sheet.cssRules].every(rule=>rule.type!==3||ready(rule.styleSheet));}catch{return false;}};
    return [...document.querySelectorAll('link[rel="stylesheet"]:not([disabled])')].every(link=>ready(link.sheet));
  });
  await page.evaluate(async()=>{await WarhammerAppV2.ready;await document.fonts.ready;});
}
const frames=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
async function homeReady(page){
  await page.waitForFunction(()=>{
    const main=document.querySelector('main.v2-library-home'),cards=main?.querySelectorAll('[data-v2-book]');
    return main&&cards.length===9&&new Set([...cards].map(node=>node.dataset.v2Book)).size===9&&window.WarhammerAppV2&&!document.body.hasAttribute('data-pwa-bootstrap-state');
  });
  await stylesReady(page);
  await page.evaluate(async()=>{
    const images=[...document.querySelectorAll('.v2-primary-header img,main.v2-library-home img')];
    await Promise.all(images.map(image=>image.decode()));
    if(images.some(image=>!image.complete||!image.naturalWidth))throw new Error('HOME/header image did not load');
  });
  await page.waitForFunction(()=>document.querySelectorAll('main.v2-library-home [data-v2-sources-line]').length===1&&!document.querySelector('[data-v2-sources-unavailable]'));
  await frames(page);
}
async function bookReady(page,book){
  await page.waitForFunction(id=>window.ArmyBookAppV2?.payload.book.id===id&&ArmyBookAppV2.roster,book);
  await page.evaluate(async()=>{await WarhammerAppV2.ready;await ArmyBookAppV2.rosterPanel.ready;});
}
async function rosterReady(page,book,count){
  await bookReady(page,book);
  await page.waitForFunction(({book,count})=>{
    const panel=document.querySelector('[data-roster-view]');return panel&&!panel.hasAttribute('aria-busy')&&
      ArmyBookAppV2.payload.book.id===book&&ArmyBookAppV2.roster.snapshot().units.length===count&&panel.querySelectorAll('.v2-roster-instance').length===count;
  },{book,count});
  await stylesReady(page);await frames(page);
}
function watch(page,context,label){
  page.setDefaultTimeout(30000);
  page.on('pageerror',error=>report.errors.push({label,type:'pageerror',message:error.message}));
  page.on('requestfailed',request=>report.errors.push({label,type:'requestfailed',url:request.url(),error:request.failure()?.errorText}));
  page.on('request',request=>{if(!request.url().startsWith(origin+'/'))report.errors.push({label,type:'external-request',url:request.url()});});
  return context.newCDPSession(page).then(async cdp=>{await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});});
}

const saves={};
async function prepareRealSaves(){
  const current=read(root+'/v2/fixtures/new-recruit-plain-header-v37.25.json');
  const fixtures={
    'death-guard':{path:'v2/fixtures/'+current.owner.file,sha256:current.owner.sha256},
    'space-marines':{path:'books/space-marines/v2/fixtures/newrecruit-v37.3-user-sm.txt'}
  };
  let browser,context;
  try{
    browser=await launchChromium();context=await browser.newContext({viewport:report.policy.viewport,serviceWorkers:'block'});
    const page=await context.newPage();active={version:'base',requests:[]};await watch(page,context,'untimed-baseline-save-preparation');
    for(const [book,fixture]of Object.entries(fixtures)){
      const bytes=fs.readFileSync(root+'/'+fixture.path),text=bytes.toString('utf8');if(fixture.sha256)assert.equal(sha(bytes),fixture.sha256);
      await page.goto(address('base',book),{waitUntil:'domcontentloaded'});await bookReady(page,book);
      await page.locator('[data-roster-view]').waitFor();
      const pane=page.locator('details[data-roster-import]');if(!await pane.evaluate(node=>node.open))await pane.locator(':scope > summary').click();
      await page.locator('[data-roster-input="raw-text"]').fill(text);await page.locator('[data-roster-action="review-import"]').click();
      await page.waitForFunction(()=>!document.querySelector('[data-roster-view][aria-busy="true"]'));
      const replace=page.locator('[data-roster-action="confirm-replace-roster"]');if(await replace.isVisible()){await replace.click();}
      await page.waitForFunction(()=>document.querySelector('.v2-roster-status')?.textContent==='Roster imported.');
      await rosterReady(page,book,expectedCounts[book]);
      const actual=await page.evaluate(key=>({saved:localStorage.getItem(key),state:ArmyBookAppV2.roster.snapshot()}),storageKey(book));
      assert(actual.saved);assert.deepEqual(JSON.parse(actual.saved),actual.state);assert.equal(actual.state.units.length,expectedCounts[book]);
      saves[storageKey(book)]=actual.saved;
      report.seeds[book]={fixture:fixture.path,fixtureSha256:sha(bytes),encoding:'UTF-8',storageKey:storageKey(book),
        savedBytes:Buffer.byteLength(actual.saved),savedSha256:sha(actual.saved),units:actual.state.units.length,
        unitIds:actual.state.units.map(unit=>({instanceId:unit.instanceId,canonicalUnitId:unit.canonicalUnitId})),preparedVia:'Accepted baseline public UI, READY and persisted'};
      noErrors();save();
    }
    fs.writeFileSync(temporary+'/performance-native-saves.json',JSON.stringify(saves,null,2)+'\n');
  }finally{if(context)await context.close();if(browser)await browser.close();active=null;}
}

async function probeMemoryCache(page){
  const before=catalogGets();assert.equal(before,1);
  const transitions=[];
  for(const book of ['death-guard','space-marines','tau-empire']){
    await page.locator('[data-v2-primary-nav] [data-v2-destination="HOME"]').click();await homeReady(page);
    await page.locator(`[data-v2-book="${book}"]`).click();await bookReady(page,book);
    await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();
    if(expectedCounts[book]!==undefined)await rosterReady(page,book,expectedCounts[book]);
    else {await page.locator('[data-roster-view]').waitFor();assert.equal(await page.locator('[data-roster-view] .v2-roster-instance').count(),0);
      await stylesReady(page);await frames(page);}
    transitions.push({book,units:expectedCounts[book]||0,catalogGets:catalogGets()});assert.equal(catalogGets(),1,'Full catalog remains a single in-memory load across native books/rosters');
  }
  return {untimed:true,transitions,before,after:catalogGets()};
}

try{
  if(resumeProbe){
    Object.assign(saves,read(temporary+'/performance-native-saves.json'));let browser,context;active={version:'head',requests:[]};
    try{browser=await launchChromium();context=await browser.newContext({viewport:report.policy.viewport,serviceWorkers:'block'});
      await context.addInitScript(values=>{for(const [key,value]of Object.entries(values))localStorage.setItem(key,value);},saves);
      const page=await context.newPage();await watch(page,context,'corrected-untimed-memory-probe');
      await page.goto(address('head','space-marines'),{waitUntil:'domcontentloaded'});await rosterReady(page,'space-marines',3);
      report.untimedMemoryCache=await probeMemoryCache(page);noErrors();
    }finally{if(context)await context.close();if(browser)await browser.close();active=null;}
    assert.equal(sha(JSON.stringify(report.rows)),measuredRowsHash,'The probe correction cannot replace or edit measured samples');
    report.initialProbeFailure.measuredRowsRetainedByteIdentical=true;
  }else {
    await prepareRealSaves();
    for(const [lane,book]of [['home',null],['roster-dg','death-guard'],['roster-sm','space-marines']])for(let repeat=0;repeat<3;repeat++)for(const version of repeat%2?['head','base']:['base','head']){
    let browser,context;active={version,requests:[]};const label=`${lane}/${version}/${repeat+1}`;
    try{
      browser=await launchChromium();report.browser=browser.version();context=await browser.newContext({viewport:report.policy.viewport,serviceWorkers:'block'});
      if(book)await context.addInitScript(values=>{for(const [key,value]of Object.entries(values))localStorage.setItem(key,value);},saves);
      const page=await context.newPage();await watch(page,context,label);
      const begin=performance.now();await page.goto(address(version,book),{waitUntil:'domcontentloaded'});
      if(book)await rosterReady(page,book,expectedCounts[book]);else await homeReady(page);
      const elapsedMs=performance.now()-begin;
      const requests=active.requests.map(row=>({...row})),catalogRequests=requests.filter(row=>row.path===catalogPath&&row.method==='GET');
      const expectedCatalog=lane==='home'&&version==='head'?0:1;assert.equal(catalogRequests.length,expectedCatalog,label+': catalog request ownership');
      assert.equal(requests.filter(row=>row.path===metadataPath&&row.method==='GET').length,1,label+': metadata fetched once');
      const screen=await page.evaluate(book=>({title:document.title,address:location.href,bookId:book?ArmyBookAppV2.payload.book.id:null,
        unitIds:book?ArmyBookAppV2.roster.snapshot().units.map(unit=>({instanceId:unit.instanceId,canonicalUnitId:unit.canonicalUnitId})):null,
        bookIds:book?null:[...document.querySelectorAll('main [data-v2-book]')].map(node=>node.dataset.v2Book).sort(),
        caption:document.querySelector('[data-v2-sources-line]')?.textContent||null,
        storage:Object.fromEntries(Object.keys(localStorage).filter(key=>key.startsWith('army-book-app-v2:roster:')).sort().map(key=>[key,localStorage.getItem(key)])),
        state:book?ArmyBookAppV2.roster.snapshot():null}),book);
      if(book){assert.deepEqual(screen.state,JSON.parse(saves[storageKey(book)]),label+': restored native state remains exact');assert.deepEqual(screen.storage,saves,label+': both saved roster strings remain byte-identical');}
      const storage=Object.fromEntries(Object.entries(screen.storage).map(([key,value])=>[key,{bytes:Buffer.byteLength(value),sha256:sha(value)}]));delete screen.storage;delete screen.state;
      noErrors();const row={lane,version,repeat:repeat+1,elapsedMs,requestCount:requests.length,bodyBytes:requests.reduce((n,row)=>n+row.bodyBytes,0),catalogGets:catalogRequests.length,storage,screen,requests};
      if(repeat===2){row.screenshot=`performance-${lane}-${version}-390.png`;await page.screenshot({path:out+'/'+row.screenshot,animations:'disabled'});}
      report.rows.push(row);save();console.log(JSON.stringify({lane,version,repeat:repeat+1,elapsedMs,requests:row.requestCount,bodyBytes:row.bodyBytes,catalogGets:row.catalogGets}));
      if(version==='head'&&lane==='roster-sm'&&repeat===2){row.untimedMemoryCache=await probeMemoryCache(page);noErrors();save();}
    }catch(error){report.incompleteSample={label,error:error.message,requests:active?.requests||[]};throw error;}
    finally{if(context)await context.close();if(browser)await browser.close();active=null;}
  }
  }
  const median=values=>[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];
  report.medians=Object.fromEntries(['home','roster-dg','roster-sm'].map(lane=>[lane,Object.fromEntries(['base','head'].map(version=>[version,
    Object.fromEntries(['elapsedMs','requestCount','bodyBytes','catalogGets'].map(key=>[key,median(report.rows.filter(row=>row.lane===lane&&row.version===version).map(row=>row[key]))]))]))]));
  report.changes=Object.entries(report.medians).map(([lane,row])=>({lane,baseMs:row.base.elapsedMs,headMs:row.head.elapsedMs,absoluteMs:row.head.elapsedMs-row.base.elapsedMs,percent:(row.head.elapsedMs/row.base.elapsedMs-1)*100}));
  assert.equal(report.rows.length,18);assert.deepEqual(report.errors,[]);report.status='PASS';report.finished=new Date().toISOString();save();
  console.log(JSON.stringify({status:report.status,samples:report.rows.length,changes:report.changes}));
}catch(error){report.status='FAIL';report.failure=error.message;report.finished=new Date().toISOString();save();console.error(error.stack||error);process.exitCode=1;}
finally{await new Promise(resolve=>server.close(resolve));save();}
