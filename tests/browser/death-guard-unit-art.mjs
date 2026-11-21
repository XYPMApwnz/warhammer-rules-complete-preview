import {createQaEvidenceDir} from '../helpers/qa-temp.mjs';
import {launchChromium} from '../helpers/browser-launch.mjs';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdir,readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const screenshots=createQaEvidenceDir('dg-unit-art-');
await mkdir(screenshots,{recursive:true});
const manifest=JSON.parse(await readFile(path.join(root,'books/death-guard/presentation/unit-images.json'),'utf8'));
const artIds=Object.keys(manifest.units);
const types={'.css':'text/css','.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.webmanifest':'application/manifest+json'};
const server=createServer(async(request,response)=>{try{const url=new URL(request.url,'http://localhost');if(url.pathname==='/favicon.ico'){response.statusCode=204;response.end();return;}let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));assert.ok(file===root||file.startsWith(root+path.sep));if((await stat(file)).isDirectory())file=path.join(file,'index.html');response.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');response.end(await readFile(file));}catch{response.statusCode=404;response.end('Not found');}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await launchChromium();
const representatives=new Map([
  ['unit-typhus','typhus-mobile.png'],
  ['unit-mortarion','mortarion-mobile.png'],
  ['unit-chaos-land-raider','chaos-land-raider-mobile.png'],
  ['unit-plague-marines','plague-marines-mobile.png'],
  ['unit-nurglings','nurglings-mobile.png']
]);
const observe=page=>{const errors=[],failed=[];page.on('pageerror',error=>errors.push(error.message));page.on('requestfailed',request=>failed.push(request.url()));return{errors,failed};};
const ready=(page,id)=>page.waitForFunction(target=>document.documentElement.dataset.mountedTarget===target&&document.querySelector(`#${CSS.escape(target)} .unit-art-background img`),id,{timeout:20000});
const visualState=(page,id)=>page.evaluate(target=>{
  const card=document.getElementById(target),header=card.querySelector('.unit-header'),figure=card.querySelector('.unit-art-background'),image=figure.querySelector('img'),title=card.querySelector('.unit-name,.unit-header h3'),titleLayer=title.parentElement,points=header.querySelector('.points,.unit-status'),nav=card.querySelector('.local-nav'),statline=card.querySelector('.statline');
  const hs=getComputedStyle(header),fs=getComputedStyle(figure),is=getComputedStyle(image),ts=getComputedStyle(titleLayer),ps=getComputedStyle(points),hr=header.getBoundingClientRect(),nr=nav.getBoundingClientRect(),sr=statline.getBoundingClientRect(),pr=points.getBoundingClientRect(),display=figure.style.display;figure.style.display='none';const headerHeightWithoutArt=header.getBoundingClientRect().height;figure.style.display=display;
  return{mounted:document.documentElement.dataset.mountedTarget,cards:document.querySelectorAll('.unit-card').length,arts:document.querySelectorAll('.unit-art,.unit-art-background').length,imageDecoded:image.complete&&image.naturalWidth>0,position:fs.position,z:Number(fs.zIndex),opacity:Number(fs.opacity),filter:is.filter,objectFit:is.objectFit,objectPosition:is.objectPosition,headerOverflow:hs.overflow,titleZ:Number(ts.zIndex),pointsZ:Number(ps.zIndex),pointsBackground:ps.backgroundColor,pointsWidth:pr.width,pointsCells:points.querySelectorAll('.ds-cost-cell').length||1,headerWidth:hr.width,headerHeight:hr.height,headerHeightWithoutArt,navAfterHeader:nr.top>=hr.bottom-1,statlineAfterNav:sr.top>=nr.bottom-1,horizontalOverflow:document.documentElement.scrollWidth-innerWidth};
},id);
const assertVisual=(state,id)=>{
  assert.equal(state.mounted,id,`${id}: mounted target`);assert.equal(state.cards,1,`${id}: Phone card count`);assert.equal(state.arts,1,`${id}: art region count`);assert.equal(state.imageDecoded,true,`${id}: image decode`);
  assert.equal(state.position,'absolute',`${id}: background positioning`);assert.equal(state.z,0,`${id}: background z-index`);assert.ok(state.opacity>=.17&&state.opacity<=.19,`${id}: Phone opacity ${state.opacity}`);assert.match(state.filter,/brightness\(0\.58\).*saturate\(0\.72\).*contrast\(1\.08\)/,`${id}: darkening filter`);assert.equal(state.objectFit,'contain',`${id}: aspect-ratio preservation`);assert.match(state.objectPosition,/100%|right/,`${id}: right alignment`);
  assert.equal(state.headerOverflow,'hidden',`${id}: hero clipping`);assert.ok(state.titleZ>state.z&&state.pointsZ>state.z,`${id}: interface stacking`);assert.match(state.pointsBackground,/rgba?\(/,`${id}: cost background`);assert.ok(state.pointsWidth<=Math.min(state.pointsCells===1?311:521,state.headerWidth)+1,`${id}: bounded cost width`);assert.ok(Math.abs(state.headerHeight-state.headerHeightWithoutArt)<=1,`${id}: artwork changed hero height`);assert.equal(state.navAfterHeader,true,`${id}: tabs shifted`);assert.equal(state.statlineAfterNav,true,`${id}: statline shifted`);assert.ok(state.horizontalOverflow<=1,`${id}: horizontal overflow`);
};

try{
  const phone=await browser.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  try{
    const page=await phone.newPage(),observed=observe(page);page.setDefaultTimeout(20000);
    for(const id of artIds){
      await page.goto(`${origin}/books/death-guard/reader.html?view=mobile#${id}`,{waitUntil:'domcontentloaded'});await ready(page,id);const image=page.locator(`#${id} .unit-art-background img`);await image.evaluate(node=>node.decode());const state=await visualState(page,id);assertVisual(state,id);
      if(representatives.has(id)){await page.locator(`#${id}`).evaluate(node=>node.scrollIntoView({block:'start'}));await page.evaluate(()=>new Promise(requestAnimationFrame));await page.screenshot({path:path.join(screenshots,representatives.get(id))});console.log(`PASS Phone visual ${id}`);}
    }
    await page.goto(`${origin}/books/adeptus-mechanicus/reader.html?view=mobile#unit-skitarii-marshal`,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.documentElement.dataset.mountedTarget==='unit-skitarii-marshal'&&document.querySelector('#unit-skitarii-marshal .unit-art-background img'),null,{timeout:20000});const am=await page.evaluate(()=>{const card=document.getElementById('unit-skitarii-marshal'),header=card.querySelector('.unit-header'),figure=card.querySelector('.unit-art-background'),image=figure.querySelector('img');return{overflow:getComputedStyle(header).overflow,z:Number(getComputedStyle(figure).zIndex),opacity:Number(getComputedStyle(figure).opacity),filter:getComputedStyle(image).filter,fit:getComputedStyle(image).objectFit};});assert.deepEqual(am,{overflow:'hidden',z:0,opacity:.18,filter:'brightness(0.58) saturate(0.72) contrast(1.08)',fit:'contain'},'AM reference changed');await page.locator('#unit-skitarii-marshal').evaluate(node=>node.scrollIntoView({block:'start'}));await page.evaluate(()=>new Promise(requestAnimationFrame));await page.screenshot({path:path.join(screenshots,'am-skitarii-marshal-mobile-reference.png')});
    assert.deepEqual(observed.errors,[],'Phone console errors');assert.deepEqual(observed.failed,[],'Phone failed requests');console.log('PASS Phone DG background art 32/32 and AM reference');
  }finally{await phone.close();}

  const desktop=await browser.newContext({serviceWorkers:'block',viewport:{width:1280,height:720}});
  try{
    const page=await desktop.newPage(),observed=observe(page);page.setDefaultTimeout(20000);await page.goto(`${origin}/books/death-guard/reader.html?view=full#unit-mortarion`,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>Boolean(window.DG_APP?.navigation&&document.querySelectorAll('.unit-card').length===36),null,{timeout:20000});assert.equal(await page.locator('.unit-art-background img').count(),32,'Desktop art count');assert.equal(await page.locator('.unit-art img').count(),0,'Desktop foreground art returned');
    for(const id of representatives.keys()){const image=page.locator(`#${id} .unit-art-background img`);await image.scrollIntoViewIfNeeded();await image.evaluate(node=>node.decode());const state=await page.evaluate(target=>{const card=document.getElementById(target),header=card.querySelector('.unit-header'),figure=card.querySelector('.unit-art-background'),image=figure.querySelector('img'),points=header.querySelector('.points,.unit-status'),hs=getComputedStyle(header),fs=getComputedStyle(figure),is=getComputedStyle(image),ps=getComputedStyle(points);return{overflow:hs.overflow,z:Number(fs.zIndex),opacity:Number(fs.opacity),filter:is.filter,fit:is.objectFit,pointsZ:Number(ps.zIndex),overflowX:document.documentElement.scrollWidth-innerWidth};},id);assert.equal(state.overflow,'hidden',`${id}: Desktop clipping`);assert.equal(state.z,0,`${id}: Desktop z-index`);assert.ok(state.opacity>=.21&&state.opacity<=.23,`${id}: Desktop opacity`);assert.match(state.filter,/brightness\(0\.58\)/,`${id}: Desktop darkening`);assert.equal(state.fit,'contain',`${id}: Desktop ratio`);assert.ok(state.pointsZ>state.z,`${id}: Desktop cost stacking`);assert.ok(state.overflowX<=1,`${id}: Desktop overflow`);}
    await page.locator('#unit-mortarion').evaluate(node=>{document.documentElement.style.scrollBehavior='auto';node.scrollIntoView({block:'start'});});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.screenshot({path:path.join(screenshots,'mortarion-desktop.png')});assert.deepEqual(observed.errors,[],'Desktop console errors');assert.deepEqual(observed.failed,[],'Desktop failed requests');console.log('PASS Desktop representative DG background art');
  }finally{await desktop.close();}

  const offline=await browser.newContext({serviceWorkers:'allow',viewport:{width:390,height:844}});
  try{
    const page=await offline.newPage(),observed=observe(page);await page.goto(`${origin}/index.html?dg-art-offline=2`);await page.evaluate(async()=>{const limit=promise=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Service Worker readiness timeout')),30000))]);await limit(navigator.serviceWorker.ready);if(!navigator.serviceWorker.controller)await limit(new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true})));});if(!await page.evaluate(()=>Boolean(navigator.serviceWorker.controller)))await page.reload();const cached=await page.evaluate(async()=>{const keys=await caches.keys(),cache=await caches.open(keys[0]),requests=await cache.keys();return requests.map(request=>new URL(request.url).pathname);});assert.equal(cached.filter(url=>url.startsWith('/books/death-guard/assets/unit-images/')).length,32,'offline DG art inventory');await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));await page.goto(`${origin}/books/death-guard/reader.html?view=mobile#unit-typhus`,{waitUntil:'domcontentloaded'});await ready(page,'unit-typhus');const image=page.locator('#unit-typhus .unit-art-background img');await image.evaluate(node=>node.decode());assert.equal((await visualState(page,'unit-typhus')).imageDecoded,true,'offline Typhus decode');assert.deepEqual(observed.errors,[],'offline console errors');assert.deepEqual(observed.failed,[],'offline failed requests');console.log('PASS DG background art after physical origin shutdown');
  }finally{await offline.close();}
  console.log(`Death Guard unit art browser QA: PASS; screenshots ${screenshots}`);
}finally{await browser.close();if(server.listening)await new Promise(resolve=>server.close(resolve));}
