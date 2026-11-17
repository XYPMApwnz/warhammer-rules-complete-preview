/** Canonical one-rule dialogs and unchanged physical roster facts, nine books. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {inspectPlayerDialog,assertPlayerDialog} from '../tests/helpers/player-dialog-assertions.mjs';
import {armyBooks} from './army-books.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';
const own=fileURLToPath(new URL('../',import.meta.url)),arg=name=>process.argv.find(value=>value.startsWith(name+'='))?.slice(name.length+1);
const root=path.resolve(arg('--root')||process.env.RULE_POPUPS_ROOT||own),out=path.resolve(arg('--out')||createQaEvidenceDir('wh-rule-popups-'));
const observe=process.argv.includes('--observe-only'),widths=(arg('--widths')||'390,1440').split(',').map(Number);
const mutation=arg('--mutation');assert(!mutation||mutation==='old-label','Only the explicit old-label control is supported');
const books=armyBooks.filter(book=>!arg('--book')||book.id===arg('--book'));
const constructed=JSON.parse(fs.readFileSync(new URL('./fixtures/rule-popups-browser.json',import.meta.url),'utf8')),allWeaponCases=constructed.cases,equipmentCases=constructed.equipmentCases;
for(const fixture of [...allWeaponCases,...equipmentCases])assert.equal(createHash('sha256').update(fixture.text).digest('hex'),fixture.textSha256,'Original source-backed fixture bytes');
assert(books.length&&widths.every(width=>width>0));fs.mkdirSync(out,{recursive:true});
const allowed=new Set(JSON.parse(fs.readFileSync(path.join(own,'tools/pages-runtime-manifest.json'),'utf8')).files.map(row=>'/'+row.path));
const mime={'.mjs':'text/javascript','.js':'text/javascript','.html':'text/html','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
const missing=[],errors=[],rows=[],shots=[],links=[],equipment=[],timings=[],observations=[];
const server=http.createServer((req,res)=>{const address=decodeURIComponent(new URL(req.url,'http://local').pathname),file=path.resolve(root,'.'+address);
  if(address==='/favicon.ico'){res.writeHead(204).end();return;}
  if(!file.startsWith(root+path.sep)||(!allowed.has(address)&&!isApplicationTestDependency(address))||!fs.existsSync(file)){missing.push(address);res.writeHead(404).end();return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(fs.readFileSync(file));});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
const norm=value=>String(value).replace(/\s+/g,' ').trim();
const style='.v2-primary-header,#appHeader,.v2-skip {visibility:hidden!important}.local-nav{position:static!important}';
let browser,page,current,complete=false;
async function check(name,fn){try{const detail=await fn();rows.push({...current,name,status:'PASS',detail});}catch(error){rows.push({...current,name,status:'FAIL',error:error.message});if(!observe)throw error;}}
async function screenshot(name,locator=page){const file=current.book+'-'+current.width+'-'+name+'.png';await locator.screenshot({path:path.join(out,file),animations:'disabled',style});shots.push({...current,name,file});}
async function settle(){await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));}
async function roster(){await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();}
async function importText(text){await roster();await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);await page.locator('[data-roster-action="review-import"]').click();await settle();const replace=page.locator('[data-roster-action="confirm-replace-roster"]');if(await replace.isVisible()){await replace.click();await settle();}assert.match(await page.locator('.v2-roster-status').innerText(),/^Roster imported\./);}
async function effective(instanceId){await roster();await page.locator(`.v2-roster-instance[data-roster-instance-id="${instanceId}"]`).getByRole('button',{name:'Effective datasheet',exact:true}).click();const card=page.locator(`main .unit-card[data-roster-instance-id="${instanceId}"]`).first();await card.waitFor();return card;}
try{
 browser=await launchChromium();
 for(const book of books){
  const payload=JSON.parse(fs.readFileSync(path.join(root,'books',book.id,'v2/generated/app-presentation.json'),'utf8')),cards=new Map(payload.cards.map(card=>[card.id,card]));
  let sample;
  if(book.id==='death-guard')sample={id:'datasheet-deathshroud-terminators:section:1',path:'/blocks/0/text',title:'Silent Bodyguard'};
  else for(const entry of payload.glossary.entries){const card=cards.get(entry.targetId);
   const alias=entry.aliases?.find(alias=>alias.fieldPath&&/^\/blocks\/\d+\/text$/.test(alias.fieldPath));
   if(alias){sample={id:card.id,path:alias.fieldPath,title:alias.label};break;}
   if(['ABILITY','WARGEAR_ABILITY','DATASHEET_SECTION'].includes(card.kind)&&card.fields.some(field=>field.source?.path==='/text')){sample={id:card.id,path:'/text',title:entry.label};break;}
  }
  assert(sample,'Current canonical named ability exists: '+book.id);
  const canonical=cards.get(sample.id).fields.find(field=>field.source?.path===sample.path);assert(canonical);
  for(const width of widths){
   current={book:book.id,width};const context=await browser.newContext({viewport:{width,height:1000},serviceWorkers:'block'});page=await context.newPage();page.setDefaultTimeout(25000);page.on('pageerror',error=>errors.push({...current,message:error.message}));
   try{
    await page.goto(origin+'/v2/app.html');const begin=performance.now();await page.locator(`[data-v2-book="${book.id}"]`).click();
    await page.waitForFunction(id=>window.ArmyBookAppV2?.payload.book.id===id&&document.querySelector('main .unit-card'),book.id);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    timings.push({...current,stage:'book-first-render',elapsedMs:performance.now()-begin});
    const count=await page.locator('main .rule-term-link').count();links.push({...current,fullBookLinks:count});
    await check('full-inline-ability-titles-are-not-buttons',async()=>{
     const found=await page.locator('main .ability').evaluateAll(nodes=>nodes.flatMap(node=>[...node.querySelectorAll('p > a:first-child')].filter(link=>link.textContent.endsWith(':')&&link.nextSibling?.textContent.trim()).map(link=>({text:link.textContent,card:link.closest('[data-card-id]')?.dataset.cardId}))));
     assert.deepEqual(found,[]);return {checked:await page.locator('main .ability').count()};
    });
    if(book.id==='death-guard'){
     const full=page.locator('main .unit-card[data-card-id="unit-deathshroud-terminators"]').first();await screenshot('full-book-abilities',full);
     const old=full.locator('.ability a').filter({hasText:'Silent Bodyguard:'});
     if(await old.count()){await old.click();await page.locator('dialog[open]').waitFor();await screenshot('inline-title-result',page.locator('dialog[open]'));await page.getByRole('button',{name:'Close rule reference',exact:true}).click();}
     else{await full.locator('.ds-inline-rule-title').filter({hasText:'Silent Bodyguard:'}).click();assert.equal(await page.locator('dialog[open]').count(),0,'Full inline text has no redundant popup');await screenshot('inline-title-result',full.locator('[data-datasheet-section="abilities"]'));}
    }
    await page.evaluate(query=>ArmyBookAppV2.openGlossary(query),sample.title);const search=page.getByRole('searchbox',{name:'Search glossary',exact:true});await search.fill(sample.title);
    const reference=page.locator('.v2-glossary-result').filter({hasText:sample.title}).filter({visible:true});
    const selected=await reference.evaluateAll((nodes,{id,field})=>nodes.findIndex(node=>node.dataset.targetId===id&&(!new URL(node.href).searchParams.get('field')||new URL(node.href).searchParams.get('field')===field)),{id:sample.id,field:sample.path});
    assert(selected>=0,'Existing abbreviated glossary link for '+sample.title);await reference.nth(selected).click();const dialog=page.locator('dialog.v2-detail-dialog[open]');await dialog.waitFor();
    await check('one-exact-rule-complete-canonical-text',async()=>{
     assert.equal(await dialog.getAttribute('data-canonical-id'),sample.id);const text=await dialog.innerText();
     const split=canonical.value.indexOf(':'),body=split>0?canonical.value.slice(split+1):canonical.value;
     assert(norm(text).includes(norm(body)),'Complete canonical rule body');
     const fields=await dialog.locator('[data-fact-id]').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.factId,value:node.dataset.factValue,entityId:node.dataset.entityId,contextId:node.dataset.contextId,ownerId:node.closest('[data-card-id]')?.dataset.cardId})));
     assert(fields.some(field=>field.id===canonical.id&&field.value===JSON.stringify(canonical.value)),'Original canonical value retained');
     const displayed=fields.find(field=>field.id===canonical.id);assert.equal(displayed.entityId,canonical.source.entityId);assert.equal(displayed.contextId,canonical.contextId);assert.equal(displayed.ownerId,canonical.source.entityId,'Canonical owner and context retained');
     const siblings=cards.get(sample.id).fields.filter(field=>/^\/blocks\/\d+\/text$/.test(field.source?.path||'')&&field.id!==canonical.id);
     for(const sibling of siblings)assert(!text.includes(sibling.value),'Sibling rule excluded: '+sibling.id);
     return {ruleId:sample.id,fieldPath:sample.path,title:sample.title};
    });
    if(mutation==='old-label')await page.evaluate(()=>{const span=document.createElement('span');span.textContent='Rule';document.querySelector('dialog[open]').append(span);});
    await check('dialog-public-labels-and-named-actions',()=>assertPlayerDialog(page));await screenshot('ability-popup',dialog);
    if(!observe){
     await page.evaluate(()=>{const span=document.createElement('span');span.dataset.qaMutation='';span.textContent='Rule';document.querySelector('dialog[open]').append(span);});
     const mutated=await page.evaluate(inspectPlayerDialog);assert(mutated.leaks.some(leak=>leak.text==='Rule'),'Old-label mutation must fail');
     await assert.rejects(()=>assertPlayerDialog(page),/Player dialog contains technical text or unnamed controls/,'The actual dialog guard must reject the old label');
     await page.evaluate(()=>document.querySelector('[data-qa-mutation]').remove());rows.push({...current,name:'old-label-mutation-rejected',status:'PASS',detail:mutated.leaks});
    }
    await dialog.getByRole('button',{name:'Close rule reference',exact:true}).click();
    if(book.id==='death-guard'){
     const matrix=[['core-feel-no-pain','Core ability'],
      [payload.groups.find(group=>group.id==='army-rules').itemIds[0],'Army rule'],
      [payload.cards.find(card=>card.kind==='DETACHMENT_RULE').id,'Detachment rule'],
      [payload.cards.find(card=>card.kind==='ENHANCEMENT').id,'Enhancement'],
      [payload.cards.find(card=>card.kind==='STRATAGEM').id,'Stratagem'],
      ['datasheet-deathshroud-terminators:section:1','Wargear ability','Icon of Despair (Aura)']];
     for(const [id,type,label]of matrix){
      const title=label||cards.get(id).title;await page.evaluate(query=>ArmyBookAppV2.openGlossary(query),title);await page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill(title);
      const link=page.locator(`.v2-glossary-result[data-target-id="${id}"]`);assert.equal(await link.count(),1);await link.click();await dialog.waitFor();
      await check('human-popup-type-'+type,async()=>{assert((await dialog.locator('.reference-context').first().innerText()).startsWith(type));await assertPlayerDialog(page);return {id,type};});
      await dialog.getByRole('button',{name:'Close rule reference',exact:true}).click();
     }
    }
    for(const fixture of allWeaponCases.filter(fixture=>fixture.bookId===book.id)){
     await importText(fixture.text);const card=await effective(fixture.instanceId);
     await check('one-summary-for-both-ranged-and-melee',async()=>{
      assert.equal(await card.getAttribute('data-card-id'),fixture.unitId);
      const result=await card.evaluate((root,ruleId)=>({modes:[...root.querySelectorAll('.weapon-table')].map(table=>table.getAttribute('aria-label')),
       lines:[...root.querySelectorAll('[data-gained-weapon-summary]')].filter(line=>{const source=JSON.parse(line.dataset.gainedSourceIdentity);return (source.canonicalRuleId||source.ruleId)===ruleId;}).map(line=>line.textContent),
       nativeFont:root.querySelector('.weapon-tag')&&getComputedStyle(root.querySelector('.weapon-tag')).font,
       gainedFonts:[...root.querySelectorAll('.weapon-tags .ds-gained-chip')].map(chip=>getComputedStyle(chip).font),
       wraps:[...root.querySelectorAll('.weapon-tags .ds-gained-chip')].map(chip=>{const range=document.createRange();range.selectNodeContents(chip);return [...range.getClientRects()].map(rect=>rect.top);})}),fixture.ruleId);
      assert(result.modes.some(mode=>mode.startsWith('ranged'))&&result.modes.some(mode=>mode.startsWith('melee')),'Both selected weapon modes are present');
      assert.equal(result.lines.length,1,'One physical source summary covers every ranged and melee group');assert(result.lines[0].startsWith('All weapons: '));
      if(book.id==='tyranids')assert(result.lines[0].includes('SUSTAINED HITS 1'));else for(const label of ['+1 A','+1 S','−1 AP'])assert(result.lines[0].includes(label),'Every independent numeric effect remains readable: '+label);
      assert(result.nativeFont&&result.gainedFonts.length);assert(result.gainedFonts.every(font=>font===result.nativeFont),'Gained and native weapon chips use the same font');
      if(width===1440)assert(result.wraps.every(lines=>new Set(lines.map(top=>Math.round(top))).size<=1),'Gained chip labels do not wrap on desktop');
      return result;
     });
     observations.push({...current,input:fixture.id,value:await page.evaluate(()=>{const r=ArmyBookAppV2.roster;return {state:r.snapshot(),points:r.points,effective:r.state.units.map(unit=>r.effective(unit.instanceId))};})});
     await screenshot('all-weapons-summary',card.locator('[data-datasheet-section="profile"]'));
    }
    for(const fixture of equipmentCases.filter(fixture=>fixture.bookId===book.id)){
     await importText(fixture.text);const card=await effective(fixture.instanceId),item=card.locator('[data-datasheet-section="composition"] [data-selected-canonical-ids]').filter({hasText:new RegExp(fixture.selectionText,'i')});assert.equal(await item.count(),1);
     const selectionIds=JSON.parse(await item.getAttribute('data-selected-canonical-ids'));assert(selectionIds.includes(fixture.equipmentId),'Original selected equipment identity is retained');
     await item.locator('a').click();await dialog.waitFor();
     await check('explicit-contract-equipment-effect',async()=>{
      assert.equal(await dialog.getAttribute('data-canonical-id'),fixture.ruleId);assert.equal(await dialog.locator('[data-rule-field-path]').getAttribute('data-rule-field-path'),fixture.fieldPath);
      assert.equal(await dialog.locator('[data-rule-type]').getAttribute('data-rule-type'),'Wargear');assert.equal(await dialog.locator('.reference-title').innerText(),fixture.title);
      const field=cards.get(fixture.ruleId).fields.find(field=>field.source?.path===fixture.fieldPath),text=await dialog.innerText();
      assert(norm(text).includes(norm(field.value.slice(field.value.indexOf(':')+1))),'Complete source effect, without the construction permission');assert(!text.includes('can be equipped with'));await assertPlayerDialog(page);
      return {itemId:fixture.equipmentId,ruleId:fixture.ruleId,fieldPath:fixture.fieldPath};
     });
     await screenshot('bound-equipment-popup',dialog);await dialog.getByRole('button',{name:'Close rule reference',exact:true}).click();
    }
    if(book.id==='death-guard'){
     const text=fs.readFileSync(path.join(own,'v2/fixtures/new-recruit-v37.25-owner-death-guard.txt'),'utf8');
     await importText(text);
     const units=await page.evaluate(()=>ArmyBookAppV2.roster.state.units),leader=units.find(unit=>unit.canonicalUnitId==='unit-lord-of-contagion'),guard=units.find(unit=>unit.canonicalUnitId==='unit-deathshroud-terminators');assert(leader&&guard);
     await page.locator(`[data-attachment-candidate-for="${guard.instanceId}"]`).selectOption(leader.instanceId);await page.locator(`[data-attachment-target-instance-id="${guard.instanceId}"] [data-roster-action="attach"]`).click();await settle();
     observations.push({...current,value:await page.evaluate(()=>{const r=ArmyBookAppV2.roster;return {state:r.snapshot(),projection:r.projection,points:r.points,effective:r.state.units.map(unit=>r.effective(unit.instanceId))};})});
     const guardCard=await effective(guard.instanceId);await screenshot('deathshroud-abilities',guardCard.locator('[data-datasheet-section="abilities"]'));
     await check('gained-source-popup-keeps-exact-source-field',async()=>{
      const chip=guardCard.locator('.weapon-tags button.ds-gained-chip').filter({hasText:'+ LANCE'}).first();await chip.click();
      const tooltip=guardCard.locator('.ds-gained-tooltip:not([hidden])');await tooltip.waitFor();
      const link=tooltip.locator('a[data-target-id="datasheet-lord-of-contagion:section:1"]');assert.equal(await link.count(),1);await link.click();await dialog.waitFor();
      assert.equal(await dialog.locator('[data-rule-field-path]').getAttribute('data-rule-field-path'),'/blocks/0/text');
      const sourceField=cards.get('datasheet-lord-of-contagion:section:1').fields.find(field=>field.source?.path==='/blocks/0/text');
      assert(norm(await dialog.innerText()).includes(norm(sourceField.value.slice(sourceField.value.indexOf(':')+1))));
      assert.equal(await dialog.locator('.ds-rule-popup-source').innerText(),'From Lord of Contagion');await assertPlayerDialog(page);
      return {ruleId:'datasheet-lord-of-contagion:section:1',fieldPath:'/blocks/0/text'};
     });
     if(await dialog.isVisible()){await screenshot('gained-source-popup',dialog);await dialog.getByRole('button',{name:'Close rule reference',exact:true}).click();}
     const composition=guardCard.locator('[data-datasheet-section="composition"]');await screenshot('deathshroud-composition',composition);
     const item=composition.locator('[data-selected-canonical-ids]').filter({hasText:/icon of despair/i});assert.equal(await item.count(),1,'One selected Icon occurrence');
     const itemLink=item.locator('a');assert.equal(await itemLink.count(),1);await itemLink.click();await dialog.waitFor();
     await check('equipment-opens-bound-effect-not-choice',async()=>{
      assert.equal(await itemLink.innerText(),'Icon of Despair (Aura)');
      assert.equal(await dialog.locator('[data-rule-type]').getAttribute('data-rule-type'),'Wargear');
      assert.equal(await dialog.getAttribute('data-canonical-id'),'datasheet-deathshroud-terminators:section:1');
      assert.equal(await dialog.locator('[data-rule-field-path]').getAttribute('data-rule-field-path'),'/blocks/2/text');
      const shown=await dialog.innerText();assert(shown.includes('worsen the Leadership characteristic'));assert(!shown.includes('can be equipped with'));await assertPlayerDialog(page);return {text:shown};
     });
     if(await dialog.isVisible()){
      await screenshot('icon-effect-popup',dialog);
      if(!observe)await check('named-book-action-opens-source-without-changing-roster',async()=>{
       const before=await page.evaluate(()=>JSON.stringify(ArmyBookAppV2.roster.snapshot()));
       const beforeTerms=await dialog.locator('a.rule-term-link').evaluateAll(nodes=>nodes.map(node=>node.dataset.targetId));
       await dialog.getByRole('link',{name:'Open in Army Book',exact:true}).click();await page.locator('main .v1-contents-pages').waitFor();
       assert.equal(new URL(page.url()).searchParams.get('roster'),null,'Full Army Book is not a filtered personal view');assert.equal(await page.locator('dialog[open]').count(),0);
       assert.equal(await page.locator('main .rule-term-link').count(),count,'Full-book term targets are rebuilt after leaving personal scope');
       assert.equal(await page.evaluate(()=>JSON.stringify(ArmyBookAppV2.roster.snapshot())),before,'Reading source does not alter the physical roster');
       await page.goBack();await dialog.waitFor();assert.equal(await dialog.getAttribute('data-canonical-id'),'datasheet-deathshroud-terminators:section:1');
       assert.equal(await dialog.locator('[data-rule-field-path]').getAttribute('data-rule-field-path'),'/blocks/2/text');
       assert.deepEqual(await dialog.locator('a.rule-term-link').evaluateAll(nodes=>nodes.map(node=>node.dataset.targetId)),beforeTerms,'Back restores the same scoped exact term targets');return {rosterUnchanged:true,canonicalSourceRestored:true};
      });
      await dialog.getByRole('button',{name:'Close rule reference',exact:true}).click();
     }
     const leaderCard=await effective(leader.instanceId);await screenshot('lord-gained-rules',leaderCard.locator('[data-datasheet-section="gained-rules"]'));
     await check('no-dangling-granted-core-controls',async()=>{
      assert.equal(await leaderCard.locator('.ds-gained-rule-links').count(),0);
      const source=leaderCard.locator('[data-attached-rule-id="datasheet-deathshroud-terminators:section:1"]').filter({hasText:/^Silent Bodyguard/});
      const fnp=source.locator('a[data-target-id="core-feel-no-pain"]');assert.equal(await fnp.count(),1);assert.equal(await fnp.innerText(),'Feel No Pain 4+');
      assert(norm(await source.innerText()).includes(norm('that CHARACTER model has the Feel No Pain 4+ ability.')));return {canonicalId:'core-feel-no-pain',insideCanonicalSource:true};
     });
     equipment.push({...current,selections:await page.evaluate(()=>ArmyBookAppV2.roster.state.units.flatMap(unit=>unit.selections?.map(selection=>({unitId:unit.canonicalUnitId,selection}))||[]))});
    }
   }catch(error){await page.screenshot({path:path.join(out,'failure-'+book.id+'-'+width+'.png')}).catch(()=>{});fs.writeFileSync(path.join(out,'failure-'+book.id+'-'+width+'.txt'),await page.locator('main').innerText().catch(()=>error.stack));throw error;}
   finally{await context.close();}
   console.log('Rule popups '+book.id+' '+width+' complete');
  }
 }
 assert.deepEqual(errors,[],'Browser errors');assert.deepEqual(missing,[],'Runtime files available');complete=true;
}catch(error){await page?.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});rows.push({...current,name:'execution',status:'FAIL',error:error.stack});throw error;}
finally{
 fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:complete&&!rows.some(row=>row.status==='FAIL')?'PASS':observe&&complete?'OBSERVED':'FAIL',root,rows,links,timings,equipment,shots,errors,missing},null,2)+'\n');
 fs.writeFileSync(path.join(out,'GAMEPLAY_OBSERVATIONS.json'),JSON.stringify(observations,null,2)+'\n');
 if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
}
console.log(JSON.stringify({status:observe?'OBSERVED':'PASS',checks:rows.length,evidence:out}));
