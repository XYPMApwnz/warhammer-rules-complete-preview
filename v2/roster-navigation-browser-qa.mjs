/** Public roster navigation controls, native applicability and exact source text.
 * Run this browser suite sequentially. Page-side writes below are explicit QA
 * controls: a delegating call counter and the named foreign-Detachment mutation.
 * Backup inputs exercise the public restore boundary, never private UI state.
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {armyBooks} from './army-books.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';

const arg=name=>process.argv.find(value=>value.startsWith(name+'='))?.slice(name.length+1);
const own=fileURLToPath(new URL('../',import.meta.url));
const root=path.resolve(arg('--root')||process.env.ROSTER_NAVIGATION_ROOT||own);
const out=path.resolve(arg('--out')||process.env.ROSTER_NAVIGATION_EVIDENCE_DIR||createQaEvidenceDir('wh-roster-navigation-'));
const widths=(arg('--widths')||'390,1440').split(',').map(Number),mutation=arg('--mutation');
assert(widths.length&&widths.every(width=>Number.isInteger(width)&&width>0),'Valid --widths');
assert(!mutation||mutation==='foreign-detachment','Only --mutation=foreign-detachment is supported');
const books=armyBooks.filter(book=>!arg('--book')||book.id===arg('--book'));assert(books.length,'Known --book');
const read=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const hash=value=>createHash('sha256').update(typeof value==='string'||Buffer.isBuffer(value)?value:JSON.stringify(value)).digest('hex');
const norm=value=>String(value).replace(/\s+/g,' ').trim();
const sweep=read('v2/fixtures/sweep-polish-v1.json');
const selected={'adeptus-mechanicus':'input-0045','chaos-space-marines':'input-0120','emperors-children':'input-0421',
  'space-marines':'additional-0012','blood-angels':'additional-0010','dark-angels':'additional-0011'};
const ownerBytes=fs.readFileSync(path.join(root,'v2/fixtures/new-recruit-v37.25-owner-death-guard.txt'));
assert.equal(hash(ownerBytes),read('v2/fixtures/new-recruit-plain-header-v37.25.json').owner.sha256,'Original owner export bytes');
const oldSaveBytes=fs.readFileSync(new URL('./fixtures/roster-navigation-saved-v2.json',import.meta.url));
assert.equal(hash(oldSaveBytes),'08b65ce335f84cbb0b481501db023a3a3a518a7dd16c75cbbb6fdaba32b1fefe','Accepted c477 snapshot fixture bytes');
const oldSaves=JSON.parse(oldSaveBytes);assert.equal(oldSaves.baseCommit,'c477d20aaa16f850b56f18aa878d6b5fb8b4057f');
const tau=read('v2/fixtures/csm-tau-recipient-gaps-v1-browser.json').find(book=>book.bookId==='tau-empire').browserCases.find(row=>row.id==='csm-tau-gaps-v1:tau:18');
const tyr=read('v2/fixtures/unit-recipient-scope-browser.json').find(book=>book.bookId==='tyranids').browserCases.find(row=>row.id==='unit-no-scope:vicious-insight');
const fixtures=[{book:'death-guard',id:'owner-v37.25-two-explicit-attachments',text:ownerBytes.toString('utf8'),owner:true},
  ...Object.entries(selected).map(([book,id])=>{const row=sweep.cases.find(row=>row.id===id);assert.equal(row.bookId,book);return {book,id,text:row.text,attachment:row.attachment};}),
  {book:'tau-empire',id:tau.id,text:tau.text,attachment:{leader:'parsed-unit-1',target:'parsed-unit-2'}},
  {book:'tyranids',id:tyr.id,text:tyr.text,attachment:{leader:'parsed-unit-1',target:'parsed-unit-2'}}];
assert.equal(new Set(fixtures.map(row=>row.book)).size,9,'Nine independent existing sample inputs');
fs.mkdirSync(out,{recursive:true});
const report={schema:'roster-navigation-browser-qa/v1',status:'RUNNING',root,widths,mutation:mutation||null,
  fixtures:fixtures.map(({text,...fixture})=>({...fixture,textSha256:hash(text)})),checks:[],observations:[],screenshots:[],errors:[],missing:[]};
const save=()=>fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify(report,null,2)+'\n');save();
const allowed=new Set(read('tools/pages-runtime-manifest.json').files.map(row=>'/'+row.path));
const mime={'.mjs':'text/javascript','.js':'text/javascript','.html':'text/html','.json':'application/json','.css':'text/css',
  '.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{
  const address=decodeURIComponent(new URL(req.url,'http://local').pathname),file=path.resolve(root,'.'+address);
  if(address==='/favicon.ico'){res.writeHead(204).end();return;}
  if(!file.startsWith(root+path.sep)||(!allowed.has(address)&&!isApplicationTestDependency(address))||!fs.existsSync(file)){
    report.missing.push(address);res.writeHead(404).end();return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
let browser,page,current,mutationInjected=false;
async function check(name,action){try{const detail=await action();report.checks.push({...current,name,status:'PASS',detail});save();}
  catch(error){report.checks.push({...current,name,status:'FAIL',error:error.message});save();throw error;}}
async function frames(){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
async function settle(){await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));await frames();}
async function ready(book){await page.waitForFunction(id=>window.ArmyBookAppV2?.payload.book.id===id&&ArmyBookAppV2.roster,book);
  await page.evaluate(async()=>{await WarhammerAppV2.ready;await ArmyBookAppV2.rosterPanel.ready;});await settle();}
async function snapshot(){return page.evaluate(()=>ArmyBookAppV2.roster.snapshot());}
async function closeDrawer(){if(await page.locator('#navMenu').getAttribute('aria-expanded')==='true'){await page.keyboard.press('Escape');await frames();}}
async function setup(){await closeDrawer();await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();await page.locator('[data-roster-view]').waitFor();await settle();}
async function importForm(){const input=page.locator('[data-roster-input="raw-text"]');if(!await input.isVisible())await page.locator('details[data-roster-import] > summary').click();await input.waitFor();return input;}
async function importText(text){await setup();await(await importForm()).fill(text);await page.locator('[data-roster-action="review-import"]').click();await settle();
  const replace=page.locator('[data-roster-action="confirm-replace-roster"]');if(await replace.isVisible()){await replace.click();await settle();}
  assert.match(await page.locator('.v2-roster-status').innerText(),/^Roster imported\./);}
async function restoreBackup(state){const details=page.locator('details').filter({has:page.locator('input[type="file"]')});
  if(!await details.evaluate(node=>node.open))await details.locator(':scope > summary').click();
  await details.locator('input[type="file"]').setInputFiles({name:'roster-navigation-qa.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(state))});await settle();
  assert.match(await page.locator('.v2-roster-status').innerText(),/^Roster backup restored\./);}
async function attach(leader,target){const article=page.locator(`.v2-roster-instance[data-roster-instance-id="${target}"]`);
  await article.locator('[data-attachment-candidate-for]').selectOption(leader);await article.locator('[data-roster-action="attach"]').click();await settle();
  assert((await snapshot()).attachments.some(edge=>edge.leaderInstanceId===leader&&edge.bodyguardInstanceId===target));}
async function guide(){await setup();await page.locator('[data-roster-action="open-personal-guide"]').click();await page.locator('main h1').filter({hasText:/Personal guide/}).waitFor();await frames();}
async function revealControl(control){
  if(current.width<=760&&await page.locator('#navMenu').getAttribute('aria-expanded')!=='true')await page.locator('#navMenu').click();
  const ancestors=await control.evaluate(node=>{const ids=[];for(let parent=node.closest('[data-nav-id]')?.parentElement?.closest('[data-nav-id]');parent;parent=parent.parentElement?.closest('[data-nav-id]'))ids.push(parent.dataset.navId);return ids.reverse();});
  for(const id of ancestors){
    const node=page.locator(`#tocTree [data-nav-id=${JSON.stringify(id)}] > .toc-row > [data-nav-toggle]`);
    if(await node.getAttribute('aria-expanded')!=='true')await node.click();}
  await control.waitFor({state:'visible'});return control;
}
async function unitCard(id,{keyboard=false}={}){const control=page.locator(`#tocTree [data-roster-nav-instance-id="${id}"]`);await revealControl(control);
  if(keyboard){await control.focus();await page.keyboard.press('Enter');}else await control.click();
  await page.waitForFunction(id=>new URL(location.href).searchParams.get('instance')===id,id);
  const card=page.locator(`main .unit-card[data-roster-instance-id="${id}"]`).first();await card.waitFor();await frames();return card;}
async function shot(name,locator=page){const file=[current.book,current.width,name].join('-')+'.png';await locator.screenshot({path:path.join(out,file),animations:'disabled'});report.screenshots.push({...current,name,file});save();}
function displayNames(state,cards){
  const names=new Map();for(const unit of state.units){const peers=state.units.filter(other=>other.canonicalUnitId===unit.canonicalUnitId),title=cards.get(unit.canonicalUnitId).title;
    if(peers.length===1){names.set(unit.instanceId,title);continue;}
    const shape=entry=>JSON.stringify(Object.entries((entry.modelRows||[]).reduce((rows,row)=>{rows[row.canonicalProfileId]=(rows[row.canonicalProfileId]||0)+row.quantity;return rows;},{})).sort());
    const identical=peers.filter(other=>shape(other)===shape(unit)),count=unit.modelRows.reduce((sum,row)=>sum+row.quantity,0);
    names.set(unit.instanceId,`${title} (${count} ${count===1?'model':'models'})${identical.length>1?' #'+(identical.indexOf(unit)+1):''}`);
  }return names;
}
async function assertSourceFields(locator,card){
  const actual=await locator.locator('[data-fact-id]').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.factId,value:node.dataset.factValue,entityId:node.dataset.entityId,contextId:node.dataset.contextId,text:node.textContent})));
  const required=card.fields.filter(field=>field.presentation==='heading'||field.type==='heading'||
    ['/cp','/category','/semanticContent'].includes(field.source?.path)||/^\/lines\/\d+\/(label|text)$/.test(field.source?.path||''));
  assert(required.length,'Canonical source fields exist: '+card.id);
  for(const field of required){const row=actual.find(row=>row.id===field.id);assert(row,'Complete canonical field rendered: '+field.id);
    assert.equal(row.value,JSON.stringify(field.value),'Exact original value: '+field.id);
    if(field.source?.entityId)assert.equal(row.entityId,field.source.entityId,'Original field owner');
    if(field.contextId)assert.equal(row.contextId,field.contextId,'Original field context');
    assert(norm(row.text).includes(norm(field.displayValue??field.value)),'Complete visible source text: '+field.id);
  }
  if(card.kind==='STRATAGEM'){const cp=card.fields.find(field=>field.source?.path==='/cp');assert(cp,'Canonical CP field');
    assert.equal(norm(await locator.locator('.cp').innerText()),norm(cp.displayValue??cp.value),'Exact canonical CP');}
  return required.length;
}
async function inspectStratagems(card,id,cards){
  const expected=await page.evaluate(id=>{const service=ArmyBookAppV2.roster,related=service.related(id),rows=Array.isArray(related)?related:related.rows||[];
    return rows.filter(row=>row.kind==='STRATAGEM'&&service.state.detachmentIds.includes(row.detachmentId)&&['MATCH','CONDITIONAL'].includes(row.applicability))
      .map(row=>({id:row.ruleId,detachmentId:row.detachmentId,applicability:row.applicability}));},id);
  const pane=card.locator('details[data-datasheet-section="stratagems"]');
  if(await pane.count()&&!await pane.evaluate(node=>node.open))await pane.locator(':scope > summary').click();
  await frames();
  if(mutation&&!mutationInjected){const state=await snapshot(),foreign=[...cards.values()].find(rule=>rule.kind==='STRATAGEM'&&!state.detachmentIds.includes(rule.parentId));assert(foreign,'Mutation requires a foreign Detachment rule');
    await card.evaluate((root,rule)=>{let section=root.querySelector('[data-datasheet-section="stratagems"]');
      if(!section){section=document.createElement('section');section.dataset.datasheetSection='stratagems';root.append(section);}
      const injected=document.createElement('article');injected.dataset.ruleId=rule.id;injected.dataset.detachmentId=rule.parentId;injected.dataset.applicability='CONDITIONAL';injected.textContent=rule.title;section.append(injected);
    },foreign);mutationInjected=true;}
  const section=card.locator('[data-datasheet-section="stratagems"]');
  const actual=await section.locator('[data-rule-id][data-applicability]').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.ruleId,detachmentId:node.dataset.detachmentId,applicability:node.dataset.applicability})));
  const ordered=rows=>rows.toSorted((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
  assert.deepEqual(ordered(actual),ordered(expected),'Exact native Detachment Stratagem rows; no foreign Detachment or Core additions');
  assert.equal(await card.locator('.local-tab').filter({hasText:/^Stratagems$/}).count(),expected.length?1:0,'Tab follows the expanded result');
  if(!expected.length)assert.equal(await section.count(),0,'No eligible rows removes both empty section and tab');
  let fields=0;for(const row of expected){const source=cards.get(row.id);assert.equal(source.kind,'STRATAGEM');assert.notEqual(source.domain,'CORE');
    fields+=await assertSourceFields(section.locator(`[data-rule-id=${JSON.stringify(row.id)}]`),source);}
  assert.equal(await card.locator('.ds-related-rules-button').count(),0,'Physical card has no old Compatible panel button');
  assert(!/Available enhancements/i.test(await card.innerText()),'Unassigned Enhancements are absent from the physical card');
  return {instanceId:id,rows:expected,sourceFields:fields};
}

try{
  browser=await launchChromium();
  for(const book of books){
    current={book:book.id,width:390};const legacy=oldSaves.books.find(row=>row.bookId===book.id);assert(legacy,'Old saved roster for '+book.id);
    const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
    const savedPage=await context.newPage(),key='army-book-app-v2:roster:'+book.id,value=JSON.stringify(legacy.snapshot);
    await context.addInitScript(({key,value})=>{if(!localStorage.getItem(key))localStorage.setItem(key,value);},{key,value});
    try{await check('accepted-c477-saved-roster-opens-without-migration',async()=>{
      await savedPage.goto(origin+'/v2/app.html');await savedPage.locator(`[data-v2-book="${book.id}"]`).click();
      const admitted=async()=>{await savedPage.waitForFunction(id=>window.ArmyBookAppV2?.payload.book.id===id,book.id);
        await savedPage.evaluate(()=>ArmyBookAppV2.rosterPanel.ready);assert.deepEqual(await savedPage.evaluate(()=>ArmyBookAppV2.roster.snapshot()),legacy.snapshot,'All old snapshot fields and attachments remain exact');
        assert.equal(await savedPage.evaluate(key=>localStorage.getItem(key),key),value,'Saved bytes are unchanged');};
      await admitted();await savedPage.reload();await admitted();return {baseCommit:oldSaves.baseCommit,bytes:Buffer.byteLength(value),units:legacy.snapshot.units.length};
    });}finally{await context.close();}
  }
  for(const book of books)for(const width of widths){current={book:book.id,width};const fixture=fixtures.find(row=>row.book===book.id);
    const payload=read(`books/${book.id}/v2/generated/app-presentation.json`),cards=new Map(payload.cards.map(card=>[card.id,card]));
    const context=await browser.newContext({viewport:{width,height:844},serviceWorkers:'block'});page=await context.newPage();page.setDefaultTimeout(30000);
    page.on('pageerror',error=>report.errors.push({...current,message:error.message}));
    try{
      await page.goto(origin+'/v2/app.html');await page.locator(`[data-v2-book="${book.id}"]`).click();await ready(book.id);await importText(fixture.text);
      let state=await snapshot();const names=displayNames(state,cards);
      await check('completed-import-folds-and-reopens-with-original-text',async()=>{
        assert.equal(await page.locator('details[data-roster-import]').evaluate(node=>node.open),false);
        assert.equal(await page.locator('[data-roster-input="raw-text"]').inputValue(),fixture.text);await importForm();
        assert.equal(await page.locator('[data-roster-input="raw-text"]').inputValue(),fixture.text);return {units:state.units.length};});
      if(fixture.owner){assert.equal(state.units.length,8);const one=(canonical,count)=>{const rows=state.units.filter(unit=>unit.canonicalUnitId===canonical&&(count===undefined||unit.startingStrength===count));assert.equal(rows.length,1);return rows[0].instanceId;};
        await attach(one('unit-lord-of-contagion'),one('unit-deathshroud-terminators'));await attach(one('unit-biologus-putrifier'),one('unit-plague-marines',10));
      }else if(fixture.attachment)await attach(fixture.attachment.leader,fixture.attachment.target);
      state=await snapshot();
      await check('single-physical-character-warlord-control-and-exact-roundtrip',async()=>{
        assert.equal(await page.locator('[data-roster-warlord]').count(),1);assert.equal(await page.locator('.v2-roster-instance dt').filter({hasText:/^Warlord$/}).count(),0);
        assert.equal(await page.locator('[data-roster-warlord-select]').inputValue(),state.warlordInstanceId||'','Imported Warlord is shown');
        const eligible=await page.evaluate(()=>ArmyBookAppV2.roster.state.units.filter(unit=>{const effective=ArmyBookAppV2.roster.effective(unit.instanceId);
          return effective.physicalKeywords.includes('CHARACTER')||effective.profiles.some(profile=>profile.ownerInstanceId===unit.instanceId&&profile.quantity>0&&profile.keywords.includes('CHARACTER'));}).map(unit=>unit.instanceId));
        assert(eligible.length,'The explicit sample includes a physical CHARACTER');
        const options=await page.locator('[data-roster-warlord-select] option').evaluateAll(nodes=>nodes.filter(node=>node.value&&!node.disabled).map(node=>node.value));assert.deepEqual(options.toSorted(),eligible.toSorted());
        const absent=structuredClone(state);absent.warlordInstanceId=null;absent.units.forEach(unit=>{unit.warlord=null;});await restoreBackup(absent);
        assert.equal(await page.locator('[data-roster-warlord-select]').inputValue(),'');const chosen=fixture.owner?state.units.find(unit=>unit.canonicalUnitId==='unit-lord-of-contagion').instanceId:eligible[0];
        await page.locator('[data-roster-warlord-select]').selectOption(chosen);await page.locator('[data-roster-action="set-warlord"]').click();await settle();
        const expected=structuredClone(absent);expected.warlordInstanceId=chosen;expected.units.forEach(unit=>{unit.warlord=unit.instanceId===chosen;});assert.deepEqual(await snapshot(),expected,'Only existing Warlord fields change');
        const saved=await page.evaluate(book=>JSON.parse(localStorage.getItem('army-book-app-v2:roster:'+book)),book.id);assert.deepEqual(saved,expected,'Same native snapshot is saved');
        assert.equal(await page.locator('#tocTree .roster-warlord').evaluate(node=>node.closest('[data-roster-nav-instance-id]').dataset.rosterNavInstanceId),chosen,'Warlord selection updates the existing menu immediately');
        await page.reload();await ready(book.id);await setup();assert.deepEqual(await snapshot(),expected,'Reload preserves all other fields and attachments');
        assert.equal(await page.evaluate(()=>ArmyBookAppV2.rosterPanel.importedMetadata),null,'Saved native snapshots have no import-header metadata; a prior limit is never borrowed');
        // An explicit export marker is a separate public-import control. The
        // original fixture stays untouched, and the exact attached state is
        // restored through the public backup boundary after this observation.
        const lines=fixture.text.split('\n'),headers=lines.flatMap((line,index)=>/^(?:Char\d+:\s*)?\d+x /.test(line.trim())?[index]:[]);
        assert.equal(headers.length,state.units.length,'One supported unit header per physical input');
        lines.splice(headers[state.units.findIndex(unit=>unit.instanceId===chosen)]+1,0,'• Warlord');
        await importText(lines.join('\n'));assert.equal(await page.locator('[data-roster-warlord-select]').inputValue(),chosen,'Explicit imported Warlord marker is selected');
        assert.equal((await snapshot()).warlordInstanceId,chosen);await restoreBackup(expected);assert.deepEqual(await snapshot(),expected);
        return {chosen,eligible,keys:Object.keys(expected),snapshotSha256:hash(expected)};
      });
      state=await snapshot();
      await check('failed-and-pending-import-text-remains-open-without-state-loss',async()=>{
        const before=await snapshot(),saved=await page.evaluate(book=>localStorage.getItem('army-book-app-v2:roster:'+book),book.id);
        const draft='Not a New Recruit export — pending correction';await(await importForm()).fill(draft);await page.locator('[data-roster-action="review-import"]').click();await settle();
        assert.equal(await page.locator('details[data-roster-import]').evaluate(node=>node.open),true);assert.equal(await page.locator('[data-roster-input="raw-text"]').inputValue(),draft);
        assert.deepEqual(await snapshot(),before);assert.equal(await page.evaluate(book=>localStorage.getItem('army-book-app-v2:roster:'+book),book.id),saved);
        const backup=page.locator('details').filter({has:page.locator('[data-roster-action="reload-saved"]')});if(!await backup.evaluate(node=>node.open))await backup.locator(':scope > summary').click();
        await page.locator('[data-roster-action="reload-saved"]').click();await settle();assert.equal(await page.locator('[data-roster-input="raw-text"]').inputValue(),draft);assert.equal(await page.locator('details[data-roster-import]').evaluate(node=>node.open),true);
        const changed=fixture.text.replace(/\((\d+) pts\)/,(_all,points)=>`(${Number(points)+1} pts)`);assert.notEqual(changed,fixture.text);
        await(await importForm()).fill(changed);await page.locator('[data-roster-action="review-import"]').click();await settle();
        assert.equal(await page.locator('[data-roster-action="confirm-replace-roster"]').count(),1,'Changed valid input requires replacement confirmation');
        assert.deepEqual(await snapshot(),before);await page.locator('[data-roster-action="cancel-replace-roster"]').click();await settle();
        assert.equal(await page.locator('[data-roster-input="raw-text"]').inputValue(),changed);assert.equal(await page.locator('details[data-roster-import]').evaluate(node=>node.open),true);assert.deepEqual(await snapshot(),before);
        return {draftRetained:true,replacementDeclined:true};
      });
      await guide();
      await check('menu-physical-groups-names-crown-and-bottom-actions',async()=>{
        const menu=page.locator('#navMenu'),opened=width<=760&&await menu.getAttribute('aria-expanded')!=='true';
        if(opened){await menu.click();await frames();}
        const points=await page.evaluate(()=>ArmyBookAppV2.roster.points),summary=await page.locator('[data-roster-summary]').innerText();
        if(points?.status==='UNRESOLVED')assert.match(summary,/Points unresolved/,'A partial native total remains explicitly unresolved');
        else {const values=state.units.map(unit=>unit.raw?.points??unit.points),total=Number.isFinite(points?.totalPoints)?points.totalPoints:values.every(Number.isFinite)?values.reduce((a,b)=>a+b,0):null;
          if(total!==null)assert(summary.includes(total+' pts'),`Saved roster summary shows the existing total without an invented battle limit: expected ${total} pts, rendered ${JSON.stringify(summary)}`);}
        const entries=await page.locator('#tocTree [data-roster-nav-instance-id]').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.rosterNavInstanceId,text:node.textContent.replace(/^[↳\s]+/,'').replace(/\s*♛\s*$/,'').trim()})));
        assert.deepEqual(entries.map(row=>row.id).toSorted(),state.units.map(unit=>unit.instanceId).toSorted());for(const row of entries)assert.equal(row.text,names.get(row.id));
        assert(entries.every(row=>!/(?:\b\d+\s*(?:pts|points)\b|[$£])/i.test(row.text)),'Physical menu labels contain no prices');
        assert(!/Mega Glossary/.test(await page.locator('#tocPanel').innerText()));
        assert.deepEqual(await page.locator('.toc-bottom-shortcuts > button').allTextContents(),['Full Army Book','Attachment Setup']);
        const groups=await page.locator('#tocTree .roster-attachment-group').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.rosterAttachmentGroup,members:[...node.querySelectorAll('.roster-attachment-members > [data-roster-attachment-role]')].map(member=>({id:member.querySelector('[data-roster-nav-instance-id]').dataset.rosterNavInstanceId,role:member.dataset.rosterAttachmentRole}))})));
        assert.equal(groups.length,new Set(state.attachments.map(edge=>edge.bodyguardInstanceId)).size);
        for(const group of groups){assert.deepEqual(group.members[0],{id:group.id,role:'bodyguard'});const edges=state.attachments.filter(edge=>edge.bodyguardInstanceId===group.id);
          const expected=edges.toSorted((a,b)=>Number(['SUPPORT','SUPPORT_EXCEPTION'].includes(a.role))-Number(['SUPPORT','SUPPORT_EXCEPTION'].includes(b.role))).map(edge=>({id:edge.leaderInstanceId,role:['SUPPORT','SUPPORT_EXCEPTION'].includes(edge.role)?'support':'leader'}));
          assert.deepEqual(group.members.slice(1),expected);}
        assert.equal(await page.locator('#tocTree .roster-warlord').count(),1);assert.equal(await page.locator('#tocTree .roster-warlord').evaluate(node=>node.closest('[data-roster-nav-instance-id]').dataset.rosterNavInstanceId),state.warlordInstanceId);
        await shot('guide-menu-selected-warlord');if(opened){await menu.click();await frames();}
        return {entries,groups,warlord:state.warlordInstanceId};
      });
      if(width<=760)await check('mobile-units-enter-escape-focus',async()=>{
        const menu=page.locator('#navMenu');assert.equal(await menu.getAttribute('aria-label'),'Units');assert.match(await menu.innerText(),/^Units/);
        await menu.focus();await page.keyboard.press('Enter');await frames();assert.equal(await menu.getAttribute('aria-expanded'),'true');assert.equal(await page.evaluate(()=>document.querySelector('#tocPanel').contains(document.activeElement)),true);
        await page.keyboard.press('Escape');await frames();assert.equal(await menu.getAttribute('aria-expanded'),'false');assert.equal(await menu.evaluate(node=>node===document.activeElement),true);return {enterOpens:true,escapeReturnsFocus:true};
      });
      const focus=fixture.owner?state.units.find(unit=>unit.canonicalUnitId==='unit-deathshroud-terminators').instanceId:fixture.attachment?.target||state.units[0].instanceId;
      await page.evaluate(()=>{const service=ArmyBookAppV2.roster,related=service.related;window.__rosterNavigationRelatedCalls=[];
        service.related=function(...args){window.__rosterNavigationRelatedCalls.push(args[0]);return related.apply(this,args);};});
      const focused=await unitCard(focus,{keyboard:true});
      await check('lazy-stratagem-first-open-and-repeat-cache',async()=>{
        assert.deepEqual(await page.evaluate(()=>window.__rosterNavigationRelatedCalls),[],'Card render makes zero related() calls');
        const pane=focused.locator('details[data-datasheet-section="stratagems"]');assert.equal(await pane.count(),1,'Initial lazy header exists');assert.equal(await pane.evaluate(node=>node.open),false);
        assert.equal(await focused.locator('.local-tab').filter({hasText:/^Stratagems$/}).count(),1,'Initial local tab exists');
        await pane.locator(':scope > summary').click();await frames();assert.deepEqual(await page.evaluate(()=>window.__rosterNavigationRelatedCalls),[focus],'Exactly this physical component is resolved once');
        if(await pane.count()){
          await pane.locator(':scope > summary').click();await focused.locator('.local-tab').filter({hasText:/^Stratagems$/}).click();await frames();
          assert.equal(await pane.evaluate(node=>node.open),true,'The local card menu expands the same lazy section');
          assert.deepEqual(await page.evaluate(()=>window.__rosterNavigationRelatedCalls),[focus],'Repeat expansion through the local menu reuses the current state cache');
        }
        return {instanceId:focus,calls:await page.evaluate(()=>window.__rosterNavigationRelatedCalls)};
      });
      for(const unit of state.units){const card=await unitCard(unit.instanceId);
        await check('physical-card-stratagems-'+unit.instanceId,()=>inspectStratagems(card,unit.instanceId,cards));
        assert.equal(await card.locator('.v2-roster-identity dt').filter({hasText:/^Starting Strength$/}).count(),0);}
      await shot('physical-card');await guide();
      await check('guide-all-core-reference-inventory-and-canonical-text',async()=>{
        const core=payload.cards.filter(card=>card.domain==='CORE'&&card.kind==='CORE_MAIN_RULE'&&card.fields.some(field=>field.source?.path==='/semanticContent'&&String(field.value).split('\n').some(line=>line.trim()==='Core Stratagem')));assert(core.length,'Published Core Stratagem references');
        const ids=await page.locator('#tocTree [data-nav-id="nav:core-stratagems"] [data-canonical-id]').evaluateAll(nodes=>nodes.map(node=>node.dataset.canonicalId));assert.deepEqual(ids.toSorted(),core.map(card=>card.id).toSorted(),'Every Core Stratagem is readable without applicability filtering');
        for(const source of core){const control=page.locator(`#tocTree [data-canonical-id=${JSON.stringify(source.id)}]`);await revealControl(control);await control.click();await frames();
          const rendered=page.locator(`main [data-card-id=${JSON.stringify(source.id)}]`).first();await rendered.waitFor();await assertSourceFields(rendered,source);}
        return {coreIds:ids};
      });
      await check('full-book-keeps-compatible-panel-and-roster-bottom-return',async()=>{
        const full=page.locator('.toc-bottom-shortcuts > button').filter({hasText:/^Full Army Book$/});await revealControl(page.locator('#tocTree [data-roster-nav-instance-id]').first());await full.click();await frames();
        const unit=state.units[0],control=page.locator(`#tocTree [data-canonical-id=${JSON.stringify(unit.canonicalUnitId)}]`);await revealControl(control);await control.click();await frames();
        const normal=page.locator(`main .unit-card[data-card-id=${JSON.stringify(unit.canonicalUnitId)}]`).first();await normal.waitFor();assert.equal(await normal.getAttribute('data-roster-instance-id'),null);
        await normal.getByRole('button',{name:'Compatible Stratagems & Enhancements',exact:true}).click();const dialog=page.locator('dialog.v2-related-dialog[open]');await dialog.waitFor();
        assert.match(await dialog.innerText(),/Compatible Stratagems.*Enhancements/);await dialog.locator('button').filter({hasText:/[×✕]/}).first().click();
        await setup();assert.deepEqual(await snapshot(),state,'Full-book navigation does not mutate the roster');return {fullBookCompatible:true};
      });
      report.observations.push({...current,state,projection:await page.evaluate(()=>ArmyBookAppV2.roster.projection)});await shot('attachment-setup');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'No horizontal page overflow');
    }catch(error){await page.screenshot({path:path.join(out,`failure-${book.id}-${width}.png`)}).catch(()=>{});throw error;}
    finally{await context.close();}
    console.log('Roster navigation '+book.id+' '+width+' complete');
  }
  assert.deepEqual(report.errors,[],'Browser errors');assert.deepEqual(report.missing,[],'Runtime files available');
  assert(!mutation,'Mutation control must fail the exact native-row guard');report.status='PASS';
}catch(error){report.status='FAIL';report.failure={message:error.message,stack:error.stack};throw error;}
finally{report.finished=new Date().toISOString();save();if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
console.log(JSON.stringify({status:report.status,checks:report.checks.length,out}));
