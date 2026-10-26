/** Physical state survives a version guard refusing a destination transition.
 * Real book registrations/factories are used; only the version answers are
 * injected. This is a presenter test, not proof that import() is atomic. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const books=['death-guard','adeptus-mechanicus','chaos-space-marines','emperors-children','tyranids','tau-empire','space-marines','dark-angels','blood-angels'];
const html=`<!doctype html><html><head><meta charset="utf-8"></head><body><script type="module">
import {createApplication} from '/books/shared/application-v2/runtime.mjs';
import {createBookRegistry} from '/books/shared/application-v2/registry.mjs';
import {armyBooks} from '/v2/army-books.mjs';
window.loadCounts={};
const registrations=armyBooks.map(book=>({...book,
loadPayload:async()=>{(loadCounts[book.id]??={payload:0,roster:0}).payload++;return book.loadPayload();},
createRoster:async()=>{(loadCounts[book.id]??={payload:0,roster:0}).roster++;const service=await book.createRoster();if(window.delayedBook===book.id)await new Promise(resolve=>{window.releaseDelayedBook=resolve;});return service;}}));
createApplication(document,{registry:createBookRegistry(registrations),entryURL:new URL('/__pwa_guard_test__.html',location.href).href});
</script></body></html>`;
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
let failTauPayload=false;
let heldCorePath=null,releaseCore=null,coreRequested=null;
const server=http.createServer(async(request,response)=>{
  const address=new URL(request.url,'http://local').pathname;
  if(address===heldCorePath){coreRequested?.();await new Promise(resolve=>{releaseCore=resolve;});}
  if(failTauPayload&&address==='/books/tau-empire/v2/generated/app-presentation.json'){response.writeHead(503);response.end('Injected payload failure');return;}
  if(address==='/__pwa_guard_test__.html'){response.writeHead(200,{'content-type':'text/html'});response.end(html);return;}
  if(address==='/favicon.ico'){response.writeHead(204);response.end();return;}
  const file=path.resolve(root,'.'+decodeURIComponent(address));
  if(!file.startsWith(path.resolve(root)+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){response.writeHead(404);response.end();return;}
  response.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});response.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await launchChromium(),results=[];
try{
  const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();page.setDefaultTimeout(60000);
  await page.goto(origin+'/__pwa_guard_test__.html?v2=ROSTER&book=space-marines&registry=space-marines#view-roster');
  await page.waitForFunction(()=>window.WarhammerAppV2?.activeBookId==='space-marines');
  await page.evaluate(async()=>{await WarhammerAppV2.ready;await ArmyBookAppV2.rosterPanel.ready;});
  const fixture=fs.readFileSync(path.join(root,'books/space-marines/v2/fixtures/newrecruit-v37.3-user-sm.txt'),'utf8');
  await page.locator('[data-roster-input="raw-text"]').fill(fixture);await page.locator('[data-roster-action="review-import"]').click();
  await page.waitForFunction(()=>ArmyBookAppV2.roster.state?.units.length===3);
  async function capture(){
    await page.evaluate(()=>{
      window.kept={api:ArmyBookAppV2,node:document.querySelector('[data-army-book-v2]'),raw:document.querySelector('[data-roster-input="raw-text"]'),state:JSON.stringify(ArmyBookAppV2.roster.snapshot()),storage:JSON.stringify(Object.entries(localStorage).sort()),address:location.href,historyState:JSON.stringify(history.state),title:document.title};
      kept.raw.value='Unfinished user import — preserve Unicode spaces';
    });
  }
  async function guarded(route,answers,name,expectedFailureNotices=0){
    await capture();
    const before=await page.evaluate(()=>JSON.stringify(loadCounts));
    await page.evaluate(({route,answers})=>{
      window.guardCalls=0;window.guardAnswers=answers;window.loadFailureNotices=0;
      window.WHOfflineStatus={checkRunningVersion:async()=>{guardCalls++;const answer=guardAnswers.shift();if(answer==='throw')throw new Error('Version unavailable');return answer===true;},reportLoadFailure(){window.loadFailureNotices++;}};
      return WarhammerAppV2.navigate(route);
    },{route,answers});
    const actual=await page.evaluate(()=>({
      sameAPI:ArmyBookAppV2===kept.api,sameNode:kept.node.isConnected,sameRaw:kept.raw===document.querySelector('[data-roster-input="raw-text"]'),
      raw:kept.raw.value,state:JSON.stringify(ArmyBookAppV2.roster.snapshot()),storage:JSON.stringify(Object.entries(localStorage).sort()),
      oldState:kept.state,oldStorage:kept.storage,calls:guardCalls,counts:JSON.stringify(loadCounts),iframes:document.querySelectorAll('iframe').length,notices:loadFailureNotices,
      address:location.href,oldAddress:kept.address,historyState:JSON.stringify(history.state),oldHistoryState:kept.historyState
    }));
    assert.equal(actual.sameAPI,true,name);assert.equal(actual.sameNode,true,name);assert.equal(actual.sameRaw,true,name);
    assert.equal(actual.raw,'Unfinished user import — preserve Unicode spaces',name);assert.equal(actual.state,actual.oldState,name);assert.equal(actual.storage,actual.oldStorage,name);
    assert.equal(actual.address,actual.oldAddress,'Denied transition changed the reading URL');assert.equal(actual.historyState,actual.oldHistoryState,'Denied transition changed reading history state');
    assert.equal(actual.calls,answers.length,name);
    assert.equal(actual.notices,expectedFailureNotices,'Load failure notification count changed');
    if(answers[0]!==true)assert.equal(actual.counts,before,'A denied pre-check started a book loader');
    results.push({name,status:'PASS',calls:actual.calls});
  }
  await guarded({destination:'ROSTER',bookId:'tau-empire'},[false],'pre-check refuses without loading');
  await guarded({destination:'ROSTER',bookId:'tau-empire'},['throw'],'failed version check preserves current state');
  for(const bookId of books.filter(book=>book!=='space-marines'))await guarded({destination:'ROSTER',bookId},[true,false],bookId+' real post-check refuses before mount');
  await guarded({destination:'GLOSSARY'},[true,false],'Glossary JSON rejected before mount');
  await guarded({destination:'CORE_RULES',registryId:'core-rules'},[true,false],'Core imported module rejected before iframe creation');
  assert.equal(await page.locator('iframe').count(),0);
  // Stable transitions retain the ordinary mount semantics.
  await page.evaluate(()=>{window.WHOfflineStatus={checkRunningVersion:async()=>true};return WarhammerAppV2.navigate({destination:'ROSTER',bookId:'blood-angels'});});
  await page.waitForFunction(()=>WarhammerAppV2.activeBookId==='blood-angels');await page.evaluate(()=>ArmyBookAppV2.rosterPanel.ready);
  const ba=fs.readFileSync(path.join(root,'books/blood-angels/v2/fixtures/newrecruit-v37.2-user-redemptor.txt'),'utf8');
  await page.locator('[data-roster-input="raw-text"]').fill(ba);await page.locator('[data-roster-action="review-import"]').click();await page.waitForFunction(()=>ArmyBookAppV2.roster.state?.units.length===1);
  await guarded({destination:'ROSTER',bookId:'space-marines'},[true,false],'space-marines real post-check refuses before mount');
  results.push({name:'all nine actual roster factories covered',status:'PASS'});
  // Keeping the old module alive also means returning to it must invalidate a
  // pending foreign load; its later completion is not a fresh navigation.
  await capture();
  await page.evaluate(()=>{window.WHOfflineStatus={checkRunningVersion:async()=>true};window.delayedBook='tau-empire';window.pendingBook=WarhammerAppV2.navigate({destination:'ROSTER',bookId:'tau-empire'});});
  await page.waitForFunction(()=>typeof window.releaseDelayedBook==='function');
  await page.evaluate(()=>WarhammerAppV2.navigate({destination:'ROSTER',bookId:'blood-angels'}));
  await page.evaluate(async()=>{window.releaseDelayedBook();await window.pendingBook;window.delayedBook=null;});
  assert.deepEqual(await page.evaluate(()=>({book:WarhammerAppV2.activeBookId,same:ArmyBookAppV2===kept.api,raw:kept.raw.value,connected:kept.raw.isConnected})),
    {book:'blood-angels',same:true,raw:'Unfinished user import — preserve Unicode spaces',connected:true});
  results.push({name:'returning to current book cancels an outstanding foreign load',status:'PASS'});
  failTauPayload=true;
  try{await guarded({destination:'ROSTER',bookId:'tau-empire'},[true,true],'loader failure preserves current state even while version oracle allows it',1);}
  finally{failTauPayload=false;}
  // The Core import may finish before its iframe HTML. Keep the old book
  // alive and the candidate hidden until ready AND a final version check.
  await capture();heldCorePath='/books/core-rules/reader/moving.html';
  const coreRequest=new Promise(resolve=>{coreRequested=resolve;});
  await page.evaluate(()=>{
    window.versionCurrent=true;window.guardCalls=0;
    window.WHOfflineStatus={checkRunningVersion:async()=>{guardCalls++;return versionCurrent;}};
    window.pendingCore=WarhammerAppV2.navigate({destination:'CORE_RULES',registryId:'core-rules',chapterId:'moving'});
  });
  await Promise.race([coreRequest,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Core iframe request did not start')),15000))]);
  assert.equal(await page.locator('[data-core-reader]').count(),1);assert.equal(await page.locator('[data-core-reader]').isVisible(),false,'Unconfirmed Core candidate became visible');
  assert.deepEqual(await page.evaluate(()=>({same:ArmyBookAppV2===kept.api,connected:kept.raw.isConnected,title:document.title,oldTitle:kept.title})),
    await page.evaluate(()=>({same:true,connected:true,title:kept.title,oldTitle:kept.title})));
  await page.evaluate(()=>{window.versionCurrent=false;});releaseCore();heldCorePath=null;coreRequested=null;
  await page.evaluate(()=>pendingCore);
  const late=await page.evaluate(()=>({sameAPI:ArmyBookAppV2===kept.api,sameRaw:document.querySelector('[data-roster-input="raw-text"]')===kept.raw,raw:kept.raw.value,
    state:JSON.stringify(ArmyBookAppV2.roster.snapshot())===kept.state,storage:JSON.stringify(Object.entries(localStorage).sort())===kept.storage,
    address:location.href===kept.address,history:JSON.stringify(history.state)===kept.historyState,title:document.title===kept.title,iframes:document.querySelectorAll('iframe').length,calls:guardCalls}));
  assert.deepEqual(late,{sameAPI:true,sameRaw:true,raw:'Unfinished user import — preserve Unicode spaces',state:true,storage:true,address:true,history:true,title:true,iframes:0,calls:3});
  results.push({name:'Core late HTML version flip destroys only the hidden candidate',status:'PASS'});
  await page.evaluate(()=>{window.versionCurrent=true;return WarhammerAppV2.navigate({destination:'CORE_RULES',registryId:'core-rules',chapterId:'moving'});});
  assert.equal(await page.locator('[data-core-reader]').isVisible(),true);assert.equal(await page.locator('iframe').count(),1);
  await page.evaluate(()=>WarhammerAppV2.navigate({destination:'CORE_RULES',registryId:'core-rules',chapterId:'shooting-phase'}));
  assert.equal(new URL(page.url()).searchParams.get('chapter'),'shooting-phase');assert.equal(await page.locator('[data-core-reader]').isVisible(),true);
  await page.evaluate(()=>history.back());await page.waitForURL(url=>url.searchParams.get('chapter')==='moving');await page.evaluate(()=>WarhammerAppV2.ready);
  assert.equal(await page.locator('[data-core-reader]').isVisible(),true);assert.equal(await page.locator('iframe').count(),1);
  await page.evaluate(()=>history.forward());await page.waitForURL(url=>url.searchParams.get('chapter')==='shooting-phase');await page.evaluate(()=>WarhammerAppV2.ready);
  assert.equal(await page.locator('[data-core-reader]').isVisible(),true);assert.equal(await page.locator('iframe').count(),1);
  results.push({name:'Committed Core remains visible through stable routes and Back/Forward',status:'PASS'});
  await context.close();
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
console.log(JSON.stringify({status:'PASS',scope:'Version-guard presenter behavior; ESM evaluation race remains a separate test',results},null,2));
