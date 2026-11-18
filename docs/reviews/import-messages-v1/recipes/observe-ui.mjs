import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import crypto from 'node:crypto';
import {launchChromium} from 'file:///E:/Warhammer/worktrees/roster-navigation-v1/tests/helpers/browser-launch.mjs';
const root='E:/Warhammer/worktrees/import-messages-v1',out='E:/Warhammer/qa-evidence/import-messages-v1-2026-11-18';
const origin='http://127.0.0.1:8765',sha='5bc1b038437fcac86966f87371760da94d7e9b38';
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'v2/fixtures',name)));
const factions=read('new-recruit-export.json').factions,modelNames=read('new-recruit-model-names.json'),safe=read('fabius-safe-import-browser.json');
const observations=[],errors=[],started=new Date().toISOString();let browser;
const persist=status=>fs.writeFileSync(path.join(out,'browser-observations.json'),JSON.stringify({schema:'import-messages-stage1-observations/v1',status,sha,started,updated:new Date().toISOString(),viewport:{width:1440,height:1000},origin,scope:'Fresh isolated contexts; existing fixture inputs and exact pre-existing test transformations only. No owner browser profile, repository file, rule data, or running preview configuration changed.',observations,errors},null,2)+'\n');
const digest=value=>crypto.createHash('sha256').update(value).digest('hex');
function snapshotDOM(root){
 const visible=node=>{if(!node||!node.getClientRects().length)return false;const s=getComputedStyle(node);return s.display!=='none'&&s.visibility!=='hidden';};
 const visibleText=[];const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let item;
 while((item=walker.nextNode()))if(item.textContent.trim()&&visible(item.parentElement)&&!['STYLE','SCRIPT'].includes(item.parentElement.tagName))visibleText.push(item.textContent.trim());
 return {text:root.innerText,visibleText,status:root.querySelector('.v2-roster-status')?.innerText,errorStyle:root.querySelector('.v2-roster-status')?.classList.contains('v2-roster-error'),
  headings:[...root.querySelectorAll('h1,h2,h3,summary,legend')].filter(visible).map(x=>({tag:x.tagName,text:x.innerText})),
  controls:[...root.querySelectorAll('button,input,textarea,select')].filter(visible).map(x=>({tag:x.tagName,text:x.tagName==='SELECT'?null:x.innerText,label:x.getAttribute('aria-label'),placeholder:x.getAttribute('placeholder'),disabled:x.disabled,action:x.dataset.rosterAction||null,options:x.tagName==='SELECT'?[...x.options].map(o=>({text:o.textContent,disabled:o.disabled})):undefined})),
  limitations:[...root.querySelectorAll('[data-roster-import-limitation]')].map(x=>({visible:visible(x),text:x.innerText})),
  clarifications:[...root.querySelectorAll('fieldset[data-binding-kind]')].map(x=>({kind:x.dataset.bindingKind,key:x.dataset.bindingKey,text:x.innerText,options:[...x.querySelectorAll('option')].map(o=>o.textContent)}))};
}
async function open(book){
 const context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'}),page=await context.newPage();page.setDefaultTimeout(25000);
 page.on('pageerror',error=>errors.push({book,message:error.message}));
 await page.goto(origin+'/v2/app.html');await page.locator('[data-v2-book="'+book+'"]').click();
 await page.waitForFunction(book=>window.ArmyBookAppV2?.payload.book.id===book&&Boolean(window.ArmyBookAppV2?.roster),book);
 await page.evaluate(async()=>await window.ArmyBookAppV2.rosterPanel.ready);await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();
 await page.locator('[data-roster-view]').waitFor();return {context,page,book};
}
async function capture(session,scenario,fixture,extra={}){
 const dom=await session.page.locator('[data-roster-view]').evaluate(snapshotDOM);
 const state=await session.page.evaluate(()=>({units:window.ArmyBookAppV2.roster.state?.units?.length||0,rosterId:window.ArmyBookAppV2.roster.state?.rosterId||null}));
 observations.push({id:session.book+'/'+scenario,book:session.book,scenario,fixture,...extra,...dom,state});persist('RUNNING');console.log(session.book+' / '+scenario+' / '+dom.status);
}
async function submit(session,text){
 const pane=session.page.locator('details[data-roster-import]');if(!await pane.evaluate(x=>x.open))await pane.locator(':scope > summary').click();
 await session.page.locator('[data-roster-input="raw-text"]').fill(text);await session.page.locator('[data-roster-action="review-import"]').click();
 await session.page.waitForFunction(()=>!document.querySelector('[data-roster-view][aria-busy="true"]'));
}
async function backupOpen(session){const pane=session.page.locator('details').filter({has:session.page.locator('summary').filter({hasText:/^Backup and restore$/})});if(!await pane.evaluate(x=>x.open))await pane.locator(':scope > summary').click();}
try{
 const response=await fetch(origin+'/');assert.equal(response.headers.get('x-preview-package'),sha,'Observe only the approved preview package');
 browser=await launchChromium();
 for(const f of factions){
  const s=await open(f.bookId);
  try{
   await capture(s,'before-input','v2/fixtures/new-recruit-export.json:factions['+f.bookId+']');
   if(f.bookId==='death-guard'){
    await backupOpen(s);await s.page.locator('[data-roster-action="reload-saved"]').click();await capture(s,'no-saved-roster','Fresh profile; existing Reload saved roster control (roster.mjs:272-274)');
    await s.page.locator('[data-roster-action="export-backup"]').click();await capture(s,'empty-backup','Fresh profile; existing Export backup control (roster.mjs:287-288)');
   }
   await submit(s,f.text);await capture(s,'fixture-import','v2/fixtures/new-recruit-export.json:factions['+f.bookId+']',{inputSha256:digest(f.text)});
   const saved=await s.page.evaluate(book=>localStorage.getItem('army-book-app-v2:roster:'+book),f.bookId);
   const foreign=f.text.replace(/^\+ FACTION KEYWORD:[^\r\n]*/m,'+ FACTION KEYWORD: A Different Army');assert.notEqual(foreign,f.text);
   await submit(s,foreign);const preserved=await s.page.evaluate(book=>localStorage.getItem('army-book-app-v2:roster:'+book),f.bookId);
   assert.equal(preserved,saved,'Refused export preserves saved bytes');await capture(s,'foreign-faction','v2/new-recruit-export-qa.mjs:45-49 (exact existing foreign-header transformation)',{inputSha256:digest(foreign),savedRosterUnchanged:true});
  }finally{await s.context.close();}
 }
 const extras=[
  {...modelNames.cases.find(x=>x.id==='company-veteran'),scenario:'ambiguous-model',fixture:'v2/fixtures/new-recruit-model-names.json: company-veteran; v2/new-recruit-model-names-qa.mjs:28-32'},
  {...safe.cases.find(x=>x.id==='p26-explicit-no-weapons'),scenario:'missing-weapons',fixture:'v2/fixtures/fabius-safe-import-browser.json: p26-explicit-no-weapons; v2/fabius-safe-import-browser-qa.mjs:104-112'},
  {...safe.cases.find(x=>x.id==='p26-compact-no-model-rows'),scenario:'missing-composition',fixture:'v2/fixtures/fabius-safe-import-browser.json: p26-compact-no-model-rows; v2/fabius-safe-import-browser-qa.mjs:115-119'},
 ];
 for(const row of extras){const s=await open(row.bookId);try{await submit(s,row.text);await capture(s,row.scenario,row.fixture,{inputSha256:digest(row.text)});}finally{await s.context.close();}}
 const old=fs.readFileSync(path.join(root,'v2/fixtures/new-recruit-v37.15-owner-death-guard.txt'),'utf8'),lines=old.split(/\r?\n/),index=lines.findIndex(x=>x.includes('Detachment Points)'));assert(index>=0);lines.splice(index+1,0,'Additional unrecognized header line');
 const header=await open('death-guard');try{await submit(header,lines.join('\n'));await capture(header,'unsupported-header','v2/card-polish-2-browser-qa.mjs:124-129, exact existing v37.15 owner mutation');}finally{await header.context.close();}
 const owner=await open('death-guard');try{
  const text=fs.readFileSync(path.join(root,'v2/fixtures/new-recruit-v37.25-owner-death-guard.txt'),'utf8');await submit(owner,text);await capture(owner,'owner-v37.25','v2/fixtures/new-recruit-v37.25-owner-death-guard.txt',{inputSha256:digest(text)});
  const select=owner.page.locator('[data-roster-warlord-select]'),option=await select.locator('option').evaluateAll(nodes=>nodes.find(x=>x.textContent==='Lord of Contagion')?.value);assert(option);
  await select.selectOption(option);await owner.page.locator('[data-roster-action="set-warlord"]').click();await capture(owner,'warlord-saved','v2/roster-navigation-browser-qa.mjs: existing owner-derived Warlord UI action');
  const state=await owner.page.evaluate(()=>window.ArmyBookAppV2.roster.state.units),target=state.find(x=>x.canonicalUnitId==='unit-deathshroud-terminators').instanceId;
  await owner.page.locator('[data-attachment-candidate-for="'+target+'"]').selectOption(option);await owner.page.locator('[data-attachment-target-instance-id="'+target+'"] [data-roster-action="attach"]').click();await capture(owner,'attached','v2/roster-navigation-browser-qa.mjs: owner Lord of Contagion → Deathshroud UI setup');
  await owner.page.locator('[data-roster-action="detach"][data-leader-instance-id="'+option+'"]').click();await capture(owner,'detached','Same accepted owner-derived attachment, existing Detach action');
  await backupOpen(owner);await owner.page.locator('[data-roster-action="reload-saved"]').click();await capture(owner,'saved-reloaded','Existing Reload saved roster control after owner fixture import');
  await submit(owner,old);await capture(owner,'replacement-required','v2/fixtures/new-recruit-v37.15-owner-death-guard.txt after v37.25; existing replacement path, no altered unit data');
  await owner.page.locator('[data-roster-action="cancel-replace-roster"]').click();await capture(owner,'replacement-cancelled','Existing Keep current roster action');
 }finally{await owner.context.close();}
 persist('COMPLETE');
}catch(error){errors.push({fatal:error.message,stack:error.stack});persist('INCOMPLETE');throw error;}finally{if(browser)await browser.close();}
console.log(JSON.stringify({status:'COMPLETE',observations:observations.length,pageErrors:errors.length}));
