import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import crypto from 'node:crypto';
import {launchChromium} from 'file:///E:/Warhammer/worktrees/roster-navigation-v1/tests/helpers/browser-launch.mjs';
const root='E:/Warhammer/worktrees/import-messages-v1',out='E:/Warhammer/qa-evidence/import-messages-v1-2026-11-18',origin='http://127.0.0.1:8765';
const original=fs.readFileSync('E:/Warhammer/qa-tmp/import-messages/observe-ui.mjs','utf8'),start=original.indexOf('function snapshotDOM(root){'),end=original.indexOf('\nasync function open(',start);
const snapshotDOM=Function(original.slice(start,end)+';return snapshotDOM;')();
const observations=[],errors=[],read=n=>JSON.parse(fs.readFileSync(path.join(root,'v2/fixtures',n))),hash=t=>crypto.createHash('sha256').update(t).digest('hex');
const persist=status=>fs.writeFileSync(path.join(out,'browser-supplement.json'),JSON.stringify({status,sha:'5bc1b038437fcac86966f87371760da94d7e9b38',observations,errors},null,2)+'\n');
let browser;
async function open(book){let context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'}),page=await context.newPage();page.setDefaultTimeout(25000);page.on('pageerror',x=>errors.push(x.message));await page.goto(origin+'/v2/app.html');await page.locator('[data-v2-book="'+book+'"]').click();await page.waitForFunction(book=>window.ArmyBookAppV2?.payload.book.id===book&&window.ArmyBookAppV2?.roster,book);await page.evaluate(async()=>await window.ArmyBookAppV2.rosterPanel.ready);await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();return{context,page,book};}
async function capture(s,scenario,fixture,extra={}){observations.push({id:s.book+'/'+scenario,book:s.book,scenario,fixture,...extra,...await s.page.locator('[data-roster-view]').evaluate(snapshotDOM)});persist('RUNNING');console.log(s.book+' / '+scenario);}
async function submit(s,text){await s.page.locator('[data-roster-input="raw-text"]').fill(text);await s.page.locator('[data-roster-action="review-import"]').click();await s.page.waitForFunction(()=>!document.querySelector('[data-roster-view][aria-busy="true"]'));}
function constant(file,first,next,name){const value=fs.readFileSync(path.join(root,file),'utf8'),a=value.indexOf(first),b=value.indexOf(next,a);assert(a>=0&&b>a);const definition=value.slice(a,b);assert(!/\b(?:import|require|process|fs|service)\s*(?:\(|\.)/.test(definition));return Function(definition+';return '+name+';')();}
try{
 assert.equal((await fetch(origin+'/')).headers.get('x-preview-package'),'5bc1b038437fcac86966f87371760da94d7e9b38');browser=await launchChromium();
 const empty=await open('space-marines');try{await submit(empty,'');await capture(empty,'empty-import','books/shared/roster-v2/import.mjs:271; empty input through existing Import roster control');}finally{await empty.context.close();}
 const backup=await open('death-guard');try{
  const snapshot=read('roster-navigation-saved-v2.json').books.find(x=>x.bookId==='death-guard').snapshot;
  const pane=backup.page.locator('details').filter({has:backup.page.locator('summary').filter({hasText:/^Backup and restore$/})});await pane.locator(':scope > summary').click();
  await backup.page.locator('input[type=file]').setInputFiles({name:'existing-dg-backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(snapshot))});await backup.page.waitForFunction(()=>document.querySelector('.v2-roster-status')?.textContent.startsWith('Roster backup restored.'));
  await capture(backup,'backup-restored','v2/fixtures/roster-navigation-saved-v2.json: death-guard snapshot; unchanged schema/fields');
  await backup.page.locator('[data-roster-action="export-backup"]').click();await capture(backup,'backup-exported','Existing Export backup action on exact accepted snapshot');
 }finally{await backup.context.close();}
 const epic=read('epic-hero-enhancements.json').importCases.find(x=>x.id==='titus-artificer'),s=await open(epic.book);try{await submit(s,epic.text);await capture(s,'epic-enhancement','v2/fixtures/epic-hero-enhancements.json: titus-artificer',{inputSha256:hash(epic.text)});}finally{await s.context.close();}
 const student=constant('books/tau-empire/v2/physical-choice-qa.mjs','const source=','const imported=','studentText');
 const tyr=constant('books/tyranids/v2/roster-ui-qa.mjs','const choiceText=','const newChoiceService=','choiceText');
 const prototype=constant('books/tau-empire/v2/app-qa.mjs','const prototypeText=','const service=createTauBrowserRoster','prototypeText');
 for(const row of [{book:'tau-empire',id:'student-options',text:student,fixture:'books/tau-empire/v2/physical-choice-qa.mjs:21-27 exact existing studentText'}, {book:'tau-empire',id:'prototype-options',text:prototype,fixture:'books/tau-empire/v2/app-qa.mjs:55-59 exact existing prototypeText'}, {book:'tyranids',id:'trygon-options',text:tyr,fixture:'books/tyranids/v2/roster-ui-qa.mjs:92-96 exact existing choiceText'}]){
  const session=await open(row.book);try{await submit(session,row.text);await capture(session,row.id,row.fixture,{inputSha256:hash(row.text)});const field=session.page.locator('[data-roster-source-choices-for] [data-source-choice-id]').filter({has:session.page.locator('select')}).first();
   if(await field.count()){const select=field.locator('select'),value=await select.locator('option').evaluateAll(nodes=>nodes.find(x=>x.value)?.value);if(value){await select.selectOption(value);await field.locator('[data-roster-action="set-source-choice"]').click();await capture(session,row.id+'-saved',row.fixture+'; existing first declared native option, unchanged option value');}}
  }finally{await session.context.close();}
 }
 persist('COMPLETE');
}catch(error){errors.push({message:error.message,stack:error.stack});persist('INCOMPLETE');throw error;}finally{if(browser)await browser.close();}
console.log(JSON.stringify({status:'COMPLETE',observations:observations.length,pageErrors:errors.length}));
