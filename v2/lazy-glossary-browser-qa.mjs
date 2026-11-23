/** Exact prose-link parity and first-display boundaries in the real book UI. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {createBrowserPhases} from '../tests/helpers/browser-phases.mjs';
import {armyBooks} from './army-books.mjs';
const arg=name=>process.argv.find(value=>value.startsWith(name+'='))?.slice(name.length+1);
const root=path.resolve(arg('--root')||fileURLToPath(new URL('../',import.meta.url)));
const base=arg('--base')&&path.resolve(arg('--base'));
const out=path.resolve(arg('--out')||createQaEvidenceDir('wh-lazy-glossary-'));
const widths=(arg('--widths')||'390,1440').split(',').map(Number);
const books=armyBooks.filter(book=>!arg('--book')||book.id===arg('--book'));
const mutation=arg('--mutation');assert(!mutation||mutation==='eager','Only eager-decoration negative control is supported');
const roots={head:root,...(base?{base}:{})};fs.mkdirSync(out,{recursive:true});
const phases=createBrowserPhases(path.join(out,'PHASES.json'));
let phaseContext={};
const phase=(name,operation,extra={},timeoutMs=30000)=>phases.run(name,operation,{...phaseContext,...extra},timeoutMs);
const mime={'.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.html':'text/html','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'};
const errors=[],rows=[];
const server=http.createServer((req,res)=>{const parts=decodeURIComponent(new URL(req.url,'http://local').pathname).split('/').filter(Boolean),source=roots[parts.shift()];if(!source){res.writeHead(204).end();return;}const file=path.resolve(source,parts.join('/'));if(!file.startsWith(source+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(fs.readFileSync(file));});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const frames=(page,extra={})=>phase('frame-sync',()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))),extra);
const snapshot=(page,selector)=>phase('snapshot',()=>page.locator(selector).evaluateAll(nodes=>nodes.map(node=>({text:node.textContent,cardId:node.closest('[data-card-id]')?.dataset.cardId,factId:node.closest('[data-fact-id]')?.dataset.factId,targetId:node.dataset.targetId,address:new URL(node.href).search+new URL(node.href).hash})).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))));
async function captureFailureState(page){
 const state={schema:'browser-state/v1',...phaseContext,pageClosed:page.isClosed(),rendererResponsive:false,readyState:'unavailable',visibilityState:'unavailable'};
 try{if(!state.pageClosed){const value=await phase('failure-state',()=>page.evaluate(()=>({readyState:document.readyState,visibilityState:document.visibilityState,hasFocus:document.hasFocus(),boundaryPhase:window.__qaLazyGlossaryPhase?.phase,boundaryOrdinal:window.__qaLazyGlossaryPhase?.ordinal})),{},2000);
  state.rendererResponsive=true;state.readyState=['loading','interactive','complete'].includes(value.readyState)?value.readyState:'unknown';state.visibilityState=['visible','hidden','prerender'].includes(value.visibilityState)?value.visibilityState:'unknown';state.hasFocus=value.hasFocus===true;
  if(['boundary-before','boundary-ready','frame-sync','boundary-after','boundary-complete'].includes(value.boundaryPhase))state.boundaryPhase=value.boundaryPhase;
  if(Number.isSafeInteger(value.boundaryOrdinal)&&value.boundaryOrdinal>0&&value.boundaryOrdinal<=10000)state.boundaryOrdinal=value.boundaryOrdinal;
 }}catch{}
 try{fs.writeFileSync(path.join(out,'BROWSER_STATE.json'),JSON.stringify(state,null,2)+'\n');}catch{}
}
async function showEveryCard(page){
 const changed=await phase('boundary-sweep',()=>page.locator('main').evaluate(async main=>{
  const changes=[],trace=[],boundaries=[...main.querySelectorAll('[data-rule-term-state]')];let ordinal=0;
  for(const node of boundaries){
   ordinal++;window.__qaLazyGlossaryPhase={phase:'boundary-before',ordinal};
   if(!node.getClientRects().length||node.closest('details:not([open])'))continue;
   const before=node.getBoundingClientRect(),ownerBefore=ArmyBookAppV2.navigation.state.owner;
   node.scrollIntoView({block:'center',behavior:'instant'});
   window.__qaLazyGlossaryPhase={phase:'boundary-ready',ordinal};
   await new Promise((resolve,reject)=>{const started=performance.now();let settled=false;
    const fail=()=>{if(settled)return;settled=true;clearTimeout(timer);reject(new Error('First-show term decoration did not finish: '+(node.dataset.cardId||node.className)+' / '+node.dataset.ruleTermState+' / '+ArmyBookAppV2.navigation.state.owner));};
    const timer=setTimeout(fail,10000),ready=()=>{
     if(settled)return;
     if(node.dataset.ruleTermState==='ready'){settled=true;clearTimeout(timer);return resolve();}
     if(performance.now()-started>10000)return fail();
     requestAnimationFrame(ready);
    };ready();});
   window.__qaLazyGlossaryPhase={phase:'frame-sync',ordinal};
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   window.__qaLazyGlossaryPhase={phase:'boundary-after',ordinal};
   const after=node.getBoundingClientRect();
   if(trace.length<5)trace.push({id:node.dataset.cardId,ownerBefore,ownerAfter:ArmyBookAppV2.navigation.state.owner,top:after.top,bottom:after.bottom,state:node.dataset.ruleTermState,links:node.querySelectorAll('.rule-term-link').length,headerBottom:document.querySelector('#appHeader').getBoundingClientRect().bottom});
   if(Math.abs(before.width-after.width)>0.5||Math.abs(before.height-after.height)>0.5)changes.push({id:node.dataset.cardId,unit:node.matches('.unit-card'),before:{width:before.width,height:before.height},after:{width:after.width,height:after.height}});
  }
  window.__qaLazyGlossaryPhase={phase:'boundary-complete',ordinal};
  return {changes,trace,book:ArmyBookAppV2.payload.book.id,width:innerWidth};
 }));
 fs.writeFileSync(path.join(out,'reveal-trace-'+changed.book+'-'+changed.width+'.json'),JSON.stringify(changed,null,2));
 await frames(page);return changed.changes;
}
async function contentsTarget(page,id,width){
 const title=await phase('contents-title',()=>page.evaluate(id=>ArmyBookAppV2.payload.cards.find(card=>card.id===id).title,id));
 await phase('snapshot',()=>page.evaluate(id=>{window.__qaContentsNode=document.querySelector(`main .unit-card[data-card-id="${id}"]`);},id));
 const before=await phase('contents-before',()=>page.locator(`main .unit-card[data-card-id="${id}"]`).first().evaluate(node=>({height:node.getBoundingClientRect().height,width:node.getBoundingClientRect().width})));
 if(width<=760)await phase('contents-navigate',()=>page.locator('#navMenu').click());
 await phase('contents-navigate',()=>page.getByRole('searchbox',{name:'Search the army book',exact:true}).fill(title));
 await phase('contents-navigate',()=>page.locator(`.v2-search-result[data-target-id="${id}"]`).click());
 try{await phase('contents-settle',()=>page.waitForFunction(id=>ArmyBookAppV2.navigation.state.owner==='reader'&&ArmyBookAppV2.navigation.state.active===id,id));}
 catch(error){
  try{const state=await phase('contents-diagnostics',()=>page.evaluate(id=>{const api=ArmyBookAppV2,card=[...document.querySelectorAll('main .unit-card')].find(node=>node.dataset.cardId===id),box=card?.getBoundingClientRect();return {id,address:location.href,scrollY,viewport:{width:innerWidth,height:innerHeight},navigation:{...api.navigation.state},target:box&&{top:box.top,bottom:box.bottom,height:box.height,documentTop:box.top+scrollY},inset:document.querySelector('#appHeader').getBoundingClientRect().bottom+18,ranges:api.navigation.geometry.ranges.map(row=>({id:row.item.id,top:row.top,bottom:row.bottom,measurable:row.measurable}))};},id));
   fs.writeFileSync(path.join(out,`contents-timeout-${width}.json`),JSON.stringify(state,null,2));await phase('screenshot',()=>page.screenshot({path:path.join(out,`contents-timeout-${width}.png`),animations:'disabled'}));}catch{}
  throw error;
 }
 await frames(page);
 const geometry=await phase('contents-geometry',()=>page.locator(`main .unit-card[data-card-id="${id}"]`).first().evaluate(node=>{const rect=node.getBoundingClientRect(),header=document.querySelector('#appHeader').getBoundingClientRect();return {top:rect.top,inset:header.bottom+18,height:rect.height,width:rect.width,links:node.querySelectorAll('.rule-term-link').length};}));
 assert(Math.abs(geometry.top-geometry.inset)<=2,'Contents reaches the actual first-shown card after decoration');
 assert(geometry.links>0,'The destination receives exact term links before Contents settles');
 assert.equal(await phase('snapshot',()=>page.evaluate(id=>window.__qaContentsNode===document.querySelector(`main .unit-card[data-card-id="${id}"]`),id)),true,'Controlled Contents navigation retains the existing canonical card DOM');
 await phase('screenshot',()=>page.screenshot({path:path.join(out,`contents-${id.replace(/[^a-z0-9-]/gi,'_')}-${width}.png`),animations:'disabled'}));
 return {before,after:geometry};
}
let browser,failure;
try{browser=await phase('browser-launch',()=>launchChromium());
for(const book of books)for(const width of widths){const result={book:book.id,width,views:{}};
 phaseContext={book:book.id,width};
 for(const version of Object.keys(roots)){
  const context=await phase('context-open',()=>browser.newContext({viewport:{width,height:844},serviceWorkers:'block'})),page=await phase('page-open',()=>context.newPage());page.setDefaultTimeout(30000);page.on('pageerror',error=>errors.push({book:book.id,width,version,message:error.message}));
  let contextFailure;
  try{await phase('book-open',()=>page.goto(`${origin}/${version}/v2/app.html`));await phase('book-open',()=>page.locator(`[data-v2-book="${book.id}"]`).click());await phase('book-open',()=>page.waitForFunction(id=>window.ArmyBookAppV2?.payload.book.id===id&&document.querySelector('main .unit-card'),book.id));await frames(page);
   if(version==='head'){
   const repeatLayout=await phase('snapshot',()=>page.evaluate(async()=>{
    const {flushDatasheetLayouts}=await import(new URL('../books/shared/army-book-app-v2/datasheet-v1-layout.mjs',location.href));
    const main=document.querySelector('main');flushDatasheetLayouts(main);
    const observer=new MutationObserver(()=>{});observer.observe(main,{childList:true,subtree:true});
    try{flushDatasheetLayouts(main);return observer.takeRecords().length;}finally{observer.disconnect();}
   }));
   assert.equal(repeatLayout,0,'Repeated settled datasheet layout must not move the existing rule/profile nodes');
   }
   const id=await phase('contents-title',()=>page.evaluate(()=>ArmyBookAppV2.payload.cards.find(card=>card.kind==='DATASHEET'&&document.querySelector(`main .unit-card[data-card-id="${card.id}"] .ability p`))?.id));assert.ok(id);
   let geometry=null,flowChanges=[];
   if(version==='head'){
    if(mutation==='eager')await showEveryCard(page);
    const unshown=await phase('snapshot',()=>page.locator(`main .unit-card[data-card-id="${id}"] .rule-term-link`).count());
    assert.equal(unshown,0,'Unshown datasheet prose must remain undecorated at book open');
    geometry=await contentsTarget(page,id,width);
   }
   if(version==='head')flowChanges=await showEveryCard(page);
   const full=await snapshot(page,'main .rule-term-link');assert(full.length>0,'Rendered book has enrolled prose links');
   await phase('select-card',()=>page.locator(`.v2-library-card[data-target-id="${id}"]`).click());await phase('select-card',()=>page.locator('main .v2-current-card').waitFor());await frames(page);
   const selected=await snapshot(page,'main .rule-term-link');assert(selected.length>0,'First-show selected card has exact prose links');
   const link=page.locator('main .rule-term-link').first();await phase('dialog-open',()=>link.click());await phase('dialog-open',()=>page.locator('dialog.v2-detail-dialog[open]').waitFor());await frames(page);
   const dialog=await snapshot(page,'dialog.v2-detail-dialog[open] .rule-term-link');
   const permalink=page.locator('dialog[open] .v2-permalink');assert.equal(await phase('dialog-links',()=>permalink.count()),1);
   await phase('dialog-close',()=>permalink.click());await phase('dialog-close',()=>page.locator('dialog.v2-detail-dialog[open]').waitFor({state:'hidden'}));await frames(page);
   const reference=await snapshot(page,'main .rule-term-link');
   result.views[version]={full,selected,dialog,reference};
   if(version==='head')result.geometry={target:geometry,flowChanges};
  }catch(error){contextFailure=error;await captureFailureState(page);throw error;}
  finally{try{await phase('context-close',()=>context.close());}catch(error){await captureFailureState(page);if(!contextFailure)throw error;}}
 }
 if(base)for(const view of ['full','selected','dialog','reference'])assert.deepEqual(result.views.head[view],result.views.base[view],`${book.id}/${width}/${view}: exact player link target, text and fact ownership parity`);
 rows.push(result);fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:'RUNNING',rows,errors},null,2));console.log(JSON.stringify({book:book.id,width,counts:Object.fromEntries(Object.entries(result.views.head).map(([key,value])=>[key,value.length])),status:'PASS'}));
}
assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:'PASS',rows,errors},null,2));
}catch(error){failure=error;fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:'FAIL',message:error.message,rows,errors},null,2));throw error;}
finally{let closeFailure;try{if(browser)await phase('browser-close',()=>browser.close());}catch(error){closeFailure=error;}
 try{await phase('server-close',()=>new Promise(r=>server.close(r)));}catch(error){closeFailure??=error;}
 if(closeFailure&&!failure)throw closeFailure;
}
