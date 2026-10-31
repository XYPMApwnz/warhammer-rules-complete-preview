import {launchQaBrowser} from '../../../tests/helpers/qa-browser.cjs';
import assert from 'node:assert/strict';
import {allowRosterDependencies} from './roster-browser-dependencies.mjs';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {buildApp,readAppInputs} from './app-build.mjs';
import {readGlossaryInputs,buildGlossaryProjection} from './glossary-build.mjs';
import {projectArmyBook} from '../../shared/army-book-app-v2/project.mjs';
import {createReferenceContract} from '../../shared/army-book-app-v2/reference-contract.mjs';
import {enumerateExpectedFacts} from './app-fact-oracle.mjs';
import {expectedDisplay} from './app-qa.mjs';
import {isLegacyGlossary,validateGlossarySources} from './glossary-qa.mjs';
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';

const {chromium}=createRequire(import.meta.url)('playwright');
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const payload=buildApp(),inputs=readAppInputs(),glossaryInputs=readGlossaryInputs();
const census=validateGlossarySources(payload.glossary,payload.cards,inputs.model,glossaryInputs.coreCatalog);
const cards=new Map(payload.cards.map(card=>[card.id,card]));
const references=createReferenceContract({cards,index:payload.glossary});
const referenceIds=id=>{
  const model=references.resolve(id);
  const fields=[model.titleField,...model.sections.flatMap(section=>section.fields.filter(field=>field.presentation!=='caption'&&!/^\/lines\/\d+\/label$/.test(field.source?.path||'')))].filter(Boolean);
  for(const section of model.sections)for(const field of section.fields)if(field.captionFactId)fields.push(section.card.fields.find(item=>item.id===field.captionFactId));
  const pointId=payload.bookPresentation?.records[id]?.pointRecordId;
  const point=cards.get(pointId)?.fields.find(field=>field.source?.path==='/value');if(point)fields.push(point);
  return new Set(fields.filter(Boolean).map(field=>field.id));
};
const sourceFacts=new Map(enumerateExpectedFacts(inputs.model,inputs.records).map(fact=>[fact.id,{...fact,display:expectedDisplay(fact,inputs.model,inputs.records)}]));
for(const card of payload.cards.filter(card=>card.domain==='CORE'))for(const field of card.fields)sourceFacts.set(field.id,{id:field.id,entityId:field.source.entityId,contextId:field.contextId,value:field.value,display:field.displayValue===undefined?(typeof field.value==='object'?JSON.stringify(field.value):String(field.value)):String(field.displayValue)});
const descendants=id=>{const found=new Set(),visit=id=>{assert.ok(!found.has(id),'Duplicate canonical popup child');found.add(id);cards.get(id).children.forEach(visit);};visit(id);return found;};
// The book presenter has one normal location for a semantic fact. Duplicate
// MFM names/source confirmations and internal erratum patch addresses stay in
// source evidence. book-v1-browser-qa independently proves all 51 omissions.
const normalField=field=>{
  const record=inputs.records.get(field.source.entityId),entity=inputs.model.entities.find(entity=>entity.id===field.source.entityId),pointer=field.source.path;
  if(['MFM_DETACHMENT','MFM_ENHANCEMENT_COST'].includes(record?.recordType)&&pointer==='/label')return false;
  if(entity?.kind==='ARMY_RULE_COMPONENT'&&pointer.startsWith('/qualifications/'))return false;
  return !(entity?.kind==='SOURCE_ERRATUM'&&(/^\/(?:directive|operation)$/.test(pointer)||pointer.startsWith('/targetBindings/')));
};
const forceBindings=createEffectiveMfmCatalog().catalog.crossDomainBindings.forceDispositionBindings;
for(const fact of sourceFacts.values()){
  const record=inputs.records.get(fact.entityId);
  if(record?.recordType==='MFM_DETACHMENT'&&fact.path?.[0]==='forceDispositionIds')fact.display=forceBindings[record.mfmForceDispositionIds[fact.path[1]]].sourceValue;
}
const expectedIds=id=>new Set([...descendants(id)].flatMap(id=>cards.get(id).fields.filter(normalField).map(field=>field.id)));
const appURL='/v2/app.html?v2=ARMY_BOOK&book=death-guard&registry=death-guard';
const appPath='/v2/app.html',payloadPath='/books/death-guard/v2/generated/app-presentation.json';
const allowed=new Map([[appPath,'text/html'],[payloadPath,'application/json'],['/books/shared/army-book-app-v2/runtime.mjs','text/javascript'],['/books/shared/army-book-app-v2/glossary.mjs','text/javascript'],['/books/shared/army-book-app-v2/styles.css','text/css']]);
allowRosterDependencies(allowed);
const requests=[],legacyRequests=[];
let servedPayload=payload;
const server=http.createServer((request,response)=>{
  const address=new URL(request.url,'http://localhost').pathname;requests.push(address);
  if(!allowed.has(address)) {
    if(address!=='/favicon.ico')legacyRequests.push(address);
    response.writeHead(address==='/favicon.ico'?404:200,{'Content-Type':'application/json'});response.end('{"POISONED_LEGACY_GLOSSARY_DEFINITIONS":true}');return;
  }
  response.writeHead(200,{'Content-Type':allowed.get(address),'Cache-Control':'no-store'});
  response.end(address===payloadPath?JSON.stringify(servedPayload):fs.readFileSync(path.join(repo,address.slice(1))));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await launchQaBrowser(chromium,{headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const screenshots=process.env.ARMY_APP_V2_SCREENSHOTS;
if(screenshots)fs.mkdirSync(screenshots,{recursive:true});
let activePage=null,activeStep='startup';
const ready=page=>page.waitForFunction(()=>!!window.ArmyBookAppV2);
const observe=(page,scope)=>page.evaluate(scope=>{
  const root=document.querySelector(scope);if(!root)throw new Error('Missing canonical observation '+scope);
  const article=root.dataset.cardId?root:root.querySelector('[data-card-id]');
  // V1 column balancing may place disjoint fields of one canonical section in
  // separate ability cards. Observe the complete logical record, not only its
  // first presentation fragment. Exact IDs/values and duplicate checks remain.
  const roots=scope==='main .v2-current-card'
    ? [...document.querySelectorAll('main [data-card-id]')].filter(node=>node.dataset.cardId===article?.dataset.cardId)
    : [root];
  const nodes=[...new Set(roots.flatMap(node=>[...node.querySelectorAll('[data-fact-id]')]))];
  return {reference:Boolean(root.matches('.v1-reference-article')||root.querySelector('.v1-reference-article')),targetId:article?.dataset.cardId,text:article?.textContent,facts:nodes.map(node=>({id:node.dataset.factId,value:JSON.parse(node.dataset.factValue),entityId:node.dataset.entityId,contextId:node.dataset.contextId,text:node.textContent,cardId:node.closest('[data-card-id]').dataset.cardId,visible:!!node.getClientRects().length})).sort((a,b)=>a.id.localeCompare(b.id)),dialogs:document.querySelectorAll('dialog[open]').length,overflow:document.documentElement.scrollWidth>innerWidth+1};
},scope);
const expectedReaderIds=id=>{
  const card=cards.get(id);if(card?.kind!=='DATASHEET_SECTION')return expectedIds(id);
  return new Set(card.fields.filter(field=>/^\/blocks\/\d+\/text$/.test(field.source?.path||'')||/^\/qualifications\/\d+\/value\/sourceText$/.test(field.source?.path||'')).map(field=>field.id));
};
const referenceDisplay=fact=>{
  // A structured table is the one public representation of its cells. Its
  // flattened capture line remains in the raw source fact, not in visible prose.
  const owner=cards.get(fact.entityId),tables=new Map();
  for(const field of owner?.fields || [])if(field.presentation==='table-cell'){
    if(!tables.has(field.table.id))tables.set(field.table.id,[]);tables.get(field.table.id).push(field);
  }
  const echoes=new Set([...tables.values()].map(fields=>fields.toSorted((a,b)=>a.table.row-b.table.row||a.table.column-b.table.column).map(field=>String(field.value)).join('')));
  return fact.display.split('\n').filter(line=>!echoes.has(line.trim())).join('\n');
};
const assertFacts=(observed,id,{reader=false}={})=>{
  assert.equal(observed.targetId,id,activeStep+' canonical popup resolver');
  assert.equal(observed.overflow,false,activeStep+' horizontal overflow');
  assert.equal(new Set(observed.facts.map(fact=>fact.id)).size,observed.facts.length,activeStep+' duplicate factual owner');
  assert.deepEqual(new Set(observed.facts.map(fact=>fact.id)),observed.reference?referenceIds(id):reader?expectedReaderIds(id):expectedIds(id),activeStep+' incomplete canonical definition');
  for(const node of observed.facts) {
    const fact=sourceFacts.get(node.id);assert.ok(fact,activeStep+' unsourced visible fact '+node.id);
    assert.deepEqual(node.value,fact.value,activeStep+' wrong canonical value '+node.id);assert.equal(node.text,observed.reference?referenceDisplay(fact):fact.display,activeStep+' wrong visible text '+node.id);
    assert.equal(node.entityId,fact.entityId);assert.equal(node.contextId,fact.contextId);assert.equal(node.visible,true,activeStep+' hidden canonical field');
    assert.equal(node.cardId,fact.entityId===inputs.model.bookId?fact.contextId:fact.entityId);
  }
};
// Source footer/permalink chrome may differ between popup and page. Compare
// the complete canonical player definition, identity and actual field text.
// Reader/Related shells may retain construction metadata. Compare the public
// definition fields, while assertFacts separately validates every rendered fact.
const comparable=observed=>({targetId:observed.targetId,facts:observed.facts.filter(fact=>referenceIds(observed.targetId).has(fact.id))});
const digest=observed=>createHash('sha256').update(JSON.stringify(comparable(observed))).digest('hex');
const results=[];
const sourceSensitivityOnly=process.argv.includes('--source-sensitivity-only');
try {
  for(const [device,viewport] of (sourceSensitivityOnly?[]:[['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]])) {
    const context=await browser.newContext({viewport,...(device==='phone'?{isMobile:true,hasTouch:true}:{})});
    const page=await context.newPage(),errors=[];activePage=page;
    page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('404'))errors.push(message.text());});
    await page.goto(origin+appURL+'#unit-plague-marines');await ready(page);
    activeStep=device+'/actual-open-close';
    if(device==='phone')await page.getByRole('button',{name:'Open navigation',exact:true}).click();
    await page.getByRole('button',{name:'Mega Glossary',exact:true}).click();await page.waitForSelector('main .v2-glossary');
    assert.equal(await page.evaluate(()=>location.hash),'#view-glossary');assert.equal(await page.locator('main [data-fact-id]').count(),0,'Glossary duplicated canonical definitions');
    assert.equal(await page.locator('.v2-glossary-result').count(),payload.glossary.entries.length);
    if(device==='phone')assert.equal(await page.getByRole('button',{name:'Open navigation',exact:true}).getAttribute('aria-expanded'),'false');
    await page.getByRole('button',{name:'Close glossary',exact:true}).click();assert.equal(await page.locator('main > article').getAttribute('data-card-id'),'unit-plague-marines');
    let searchChecks=0,popupChecks=0,aliasPopupChecks=0,readerParityChecks=0,relatedParityChecks=0;
    const snapshots=new Map(),visibleFacts=new Set(),coreVisibleFacts=new Set(),targetHashes=[];
    const search=async(query,expectedTarget)=>{
      await page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill(query);
      const ids=await page.locator('main .v2-glossary-result').evaluateAll(nodes=>nodes.map(node=>node.dataset.targetId));
      assert.deepEqual(ids,references.search(query).map(entry=>entry.targetId),activeStep+' exact search result parity');
      assert.equal(new Set(ids).size,ids.length,activeStep+' duplicate/stale canonical search results');
      if(expectedTarget)assert.ok(ids.includes(expectedTarget),activeStep+' exact alias missing target '+expectedTarget);
      assert.equal(await page.locator('main [data-fact-id]').count(),0,'Search rendered competing definitions');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,activeStep+' glossary overflow');
      assert.deepEqual(errors,[],activeStep+' runtime error');searchChecks++;
    };
    for(const [i,entry] of payload.glossary.entries.entries()) {
      activeStep=device+'/canonical-glossary/'+entry.targetId;
      await page.evaluate(()=>window.ArmyBookAppV2.openGlossary());
      await search(entry.label,entry.targetId);
      await page.locator('.v2-glossary-result').evaluateAll((nodes,id)=>nodes.find(node=>node.dataset.targetId===id).setAttribute('data-qa-glossary-target','current'),entry.targetId);
      await page.locator('[data-qa-glossary-target="current"]').click();await page.waitForSelector('dialog[open]');
      const popup=await observe(page,'dialog[open]');assertFacts(popup,entry.targetId);assert.equal(popup.dialogs,1,activeStep+' double popup');
      popup.facts.forEach(fact=>{visibleFacts.add(fact.id);if(cards.get(fact.cardId).domain==='CORE')coreVisibleFacts.add(fact.id);});
      snapshots.set(entry.targetId,comparable(popup));
      // Actual popup permalink resolves to the existing canonical Reader entry.
      await page.locator('dialog[open] .v2-permalink').first().click();await page.waitForSelector('dialog[open]',{state:'hidden'});
      const reader=await observe(page,'main .v2-current-card');assertFacts(reader,entry.targetId);assert.deepEqual(comparable(reader),comparable(popup),activeStep+' Reader/Glossary same full definition');readerParityChecks++;
      await page.goBack();await page.waitForSelector('dialog[open]');assert.deepEqual(comparable(await observe(page,'dialog[open]')),comparable(popup));
      await page.goBack();await page.waitForSelector('dialog[open]',{state:'hidden'});await page.waitForSelector('main .v2-glossary');
      assert.equal(await page.getByRole('searchbox',{name:'Search glossary',exact:true}).inputValue(),entry.label,activeStep+' stale/lost query on Back');
      for(const alias of entry.aliases) {
        await search(alias.label,entry.targetId);
        await page.locator('.v2-glossary-result').evaluateAll((nodes,id)=>nodes.find(node=>node.dataset.targetId===id).setAttribute('data-qa-alias-target','current'),entry.targetId);
        await page.locator('[data-qa-alias-target="current"]').click();await page.waitForSelector('dialog[open]');
        const aliasPopup=await observe(page,'dialog[open]');assertFacts(aliasPopup,entry.targetId);assert.equal(aliasPopup.dialogs,1);assert.deepEqual(comparable(aliasPopup),comparable(popup),'Named/Core alias changed its existing canonical popup definition');
        await page.keyboard.press('Escape');await page.waitForSelector('dialog[open]',{state:'hidden'});assert.equal(await page.getByRole('searchbox',{name:'Search glossary',exact:true}).inputValue(),alias.label,'Alias popup lost its search query');aliasPopupChecks++;
      }
      popupChecks++;targetHashes.push({targetId:entry.targetId,facts:popup.facts.length,hash:digest(popup)});
      if((i+1)%100===0)console.log(JSON.stringify({device,stage:'glossary-canonical-census',completed:i+1,total:payload.glossary.entries.length,status:'PASS'}));
    }
    const expectedCoreFacts=new Set(payload.cards.filter(card=>card.domain==='CORE').flatMap(card=>[...referenceIds(card.id)]));
    assert.deepEqual(coreVisibleFacts,expectedCoreFacts,device+' complete Core glossary field census');
    for(const query of ['','foul infusion','FÓUL INFUSION','Nurgle’s Gift','lethal hits','deep-strike','ZXQ_NO_CANONICAL_GLOSSARY_TERM_5489']) {
      activeStep=device+'/normalized-search/'+query;await search(query);
    }
    // Every actual Related rule link resolves to the exact Reader/Glossary card.
    const relatedIds=[...new Set(payload.relatedRules.rows.filter(row=>['MATCH','CONDITIONAL'].includes(row.applicability)).map(row=>row.ruleId))];
    for(const ruleId of relatedIds) {
      activeStep=device+'/related-parity/'+ruleId;
      const row=payload.relatedRules.rows.find(row=>row.ruleId===ruleId&&['MATCH','CONDITIONAL'].includes(row.applicability));
      await page.evaluate(id=>{window.ArmyBookAppV2.open(id);window.ArmyBookAppV2.openRelatedRules(id);},row.unitId);await page.waitForSelector('dialog.v2-related-dialog[open]');
      await page.locator('dialog.v2-related-dialog[open] .full-related-filter summary').click();await page.locator('dialog.v2-related-dialog[open] .full-related-filter button[data-detachment=""]').click();
      await page.locator(`dialog.v2-related-dialog[open] .full-related-tabs button[data-kind="${cards.get(ruleId).kind==='ENHANCEMENT'?'enhancements':'stratagems'}"]`).click();
      await page.locator('dialog.v2-related-dialog[open] .v2-compatible-item a').evaluateAll((nodes,id)=>nodes.find(node=>node.dataset.targetId===id).setAttribute('data-qa-related-target','current'),ruleId);
      await page.locator('[data-qa-related-target="current"]').click();await page.waitForSelector('dialog[open]');
      // The V1 Related Rules layer remains beneath its definition popup.
      const related=await observe(page,'dialog.v2-detail-dialog[open]');assertFacts(related,ruleId);assert.deepEqual(comparable(related),snapshots.get(ruleId),activeStep+' Related/Glossary full definition mismatch');
      await page.keyboard.press('Escape');await page.waitForSelector('dialog.v2-detail-dialog[open]',{state:'hidden'});await page.locator('dialog.v2-related-dialog[open] .related-rules-close').click();relatedParityChecks++;
    }
    // Query and popup history survive refresh and both directions of navigation.
    const named=payload.glossary.entries.find(entry=>entry.aliases.some(alias=>alias.label==='Foul Infusion'));
    const derived=glossaryInputs.coreCatalog.records.find(record=>record.relationships?.sourceRuleId);
    const historyCases=[{entry:named,label:'Foul Infusion'},{entry:payload.glossary.entries.find(entry=>entry.targetId==='army-rule-nurgles-gift'),label:'Nurgle’s Gift (Aura)'},{entry:payload.glossary.entries.find(entry=>entry.targetId==='detachment-paragons-of-putrescence:enhancement:1')},{entry:payload.glossary.entries.find(entry=>entry.targetId==='detachment-tallyband-summoners:stratagem:3')},{entry:payload.glossary.entries.find(entry=>entry.targetId===derived.id)}];
    let historyChecks=0,reloadChecks=0;
    for(const item of historyCases) {
      assert.ok(item.entry,'Missing accepted history control');const {targetId}=item.entry,query=item.label||item.entry.label;activeStep=device+'/history/'+targetId;
      await page.evaluate(()=>window.ArmyBookAppV2.openGlossary());await search(query,targetId);
      await page.locator('.v2-glossary-result').evaluateAll((nodes,id)=>nodes.find(node=>node.dataset.targetId===id).setAttribute('data-qa-history-target','current'),targetId);
      await page.locator('[data-qa-history-target="current"]').click();await page.waitForSelector('dialog[open]');
      await page.reload();await ready(page);await page.waitForSelector('dialog[open]');assertFacts(await observe(page,'dialog[open]'),targetId);assert.equal(await page.getByRole('searchbox',{name:'Search glossary',exact:true}).inputValue(),query);reloadChecks++;
      await page.goBack();await page.waitForSelector('dialog[open]',{state:'hidden'});assert.equal(await page.getByRole('searchbox',{name:'Search glossary',exact:true}).inputValue(),query);
      await page.goForward();await page.waitForSelector('dialog[open]');assertFacts(await observe(page,'dialog[open]'),targetId);await page.keyboard.press('Escape');await page.waitForSelector('dialog[open]',{state:'hidden'});historyChecks++;
      await page.reload();await ready(page);await page.waitForSelector('main .v2-glossary');assert.equal(await page.getByRole('searchbox',{name:'Search glossary',exact:true}).inputValue(),query);reloadChecks++;
      await page.evaluate(()=>window.ArmyBookAppV2.openGlossary());assert.equal(await page.getByRole('searchbox',{name:'Search glossary',exact:true}).inputValue(),'','Fresh Glossary open must clear prior query');
      await page.goto(origin+appURL+'#'+encodeURIComponent(targetId));await ready(page);assertFacts(await observe(page,'main .v2-current-card'),targetId,{reader:true});await page.reload();await ready(page);assertFacts(await observe(page,'main .v2-current-card'),targetId,{reader:true});reloadChecks++;
    }
    activeStep=device+'/glossary-deep-link';await page.goto(origin+appURL.replace('v2=ARMY_BOOK','v2=GLOSSARY')+'#view-glossary');await ready(page);assert.equal(await page.getByRole('searchbox',{name:'Search glossary',exact:true}).inputValue(),'');assert.equal(await page.locator('.v2-glossary-result').count(),census.entries);await page.reload();await ready(page);assert.equal(await page.locator('.v2-glossary-result').count(),census.entries);reloadChecks++;
    await search('Foul Infusion',named.targetId);
    if(screenshots)await page.screenshot({path:path.join(screenshots,device+'-glossary.png'),animations:'disabled'});
    await page.locator('.v2-glossary-result').first().click();await page.waitForSelector('dialog[open]');
    if(screenshots)await page.screenshot({path:path.join(screenshots,device+'-glossary-popup.png'),animations:'disabled'});
    assert.deepEqual(errors,[],device+' uncaught runtime errors');
    results.push({device,viewport,status:'PASS',entries:census.entries,searchChecks,canonicalPopupChecks:popupChecks,aliasPopupChecks,readerParityChecks,relatedParityChecks,coreVisibleFacts:coreVisibleFacts.size,totalVisibleRuleFacts:visibleFacts.size,historyChecks,reloadChecks,duplicateTargets:0,staleResults:0,doublePopups:0,horizontalOverflow:0,runtimeErrors:0,targetHashes});
    console.log(JSON.stringify({device,stage:'completed',entries:census.entries,searchChecks,canonicalPopupChecks:popupChecks,aliasPopupChecks,readerParityChecks,relatedParityChecks,coreVisibleFacts:coreVisibleFacts.size,historyChecks,reloadChecks,status:'PASS'}));
    await context.close();activePage=null;
  }
  if(!sourceSensitivityOnly)assert.deepEqual(results[0].targetHashes,results[1].targetHashes,'Desktop/phone canonical Glossary definitions differ');
  // Positive source controls pass through the factual presentation boundary.
  // Applicability stays on its already validated snapshot; no stale predicate
  // evidence is treated as a fresh gameplay contract during this probe.
  const poisonedModel=structuredClone(inputs.model),abilityId='datasheet-biologus-putrifier:section:1',stratagemId='detachment-virulent-vectorium:stratagem:2';
  const ability=poisonedModel.entities.find(entity=>entity.id===abilityId),stratagem=poisonedModel.entities.find(entity=>entity.id===stratagemId);
  assert.ok(ability&&stratagem,'Missing explicit source sensitivity owner');
  ability.data.blocks[0].text='Foul Infusion: CANONICAL_DG_ABILITY_POISON_5489';
  const effectIndex=stratagem.data.lines.findIndex(line=>line.label==='EFFECT');assert.ok(effectIndex>=0);
  stratagem.data.lines[effectIndex].text='CANONICAL_DG_STRATAGEM_POISON_5489';
  const coreSource=glossaryInputs.coreCatalog.records.find(record=>record.recordType==='MAIN_RULE'&&record.semanticContent);
  const poisonedCore={...glossaryInputs.coreCatalog,records:glossaryInputs.coreCatalog.records.map(record=>record.id===coreSource.id?{...record,semanticContent:'CANONICAL_CORE_DEFINITION_POISON_5489'}:record)};
  const poisonedGlossary=buildGlossaryProjection(poisonedModel,poisonedCore);
  servedPayload=projectArmyBook(poisonedModel,inputs.records,payload.book);servedPayload.cards.push(...poisonedGlossary.coreCards);servedPayload.glossary=poisonedGlossary.index;servedPayload.relatedRules=payload.relatedRules;
  servedPayload.datasheetPresentation=payload.datasheetPresentation;
  servedPayload.bookPresentation=payload.bookPresentation;
  const sensitivity=[{targetId:abilityId,query:'Foul Infusion',path:'/blocks/0/text',value:ability.data.blocks[0].text},{targetId:stratagemId,query:stratagem.data.title,path:`/lines/${effectIndex}/text`,value:stratagem.data.lines[effectIndex].text},{targetId:coreSource.id,query:coreSource.title,path:'/semanticContent',value:'CANONICAL_CORE_DEFINITION_POISON_5489'}];
  const sourcePoisonResults=[];
  for(const [device,viewport] of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]) {
    const context=await browser.newContext({viewport,...(device==='phone'?{isMobile:true,hasTouch:true}:{})}),page=await context.newPage(),errors=[];activePage=page;
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(origin+appURL);await ready(page);
    for(const control of sensitivity) {
      activeStep=device+'/source-sensitivity/'+control.targetId;
      await page.evaluate(id=>window.ArmyBookAppV2.open(id),control.targetId);
      const selector=`[data-fact-id="${control.targetId}::${control.path}"]`;
      assert.equal(await page.locator('main '+selector).textContent(),control.value,'Canonical source change absent from Reader');
      const reader=await observe(page,'main .v2-current-card');
      await page.evaluate(()=>window.ArmyBookAppV2.openGlossary());await page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill(control.query);
      await page.locator('.v2-glossary-result').evaluateAll((nodes,id)=>nodes.find(node=>node.dataset.targetId===id).setAttribute('data-qa-poison-target','current'),control.targetId);
      await page.locator('[data-qa-poison-target="current"]').click();await page.waitForSelector('dialog[open]');
      assert.equal(await page.locator('dialog[open] '+selector).textContent(),control.value,'Canonical source change absent from Glossary popup');
      assert.deepEqual(comparable(await observe(page,'dialog[open]')),comparable(reader),'Source sensitivity lost shared canonical popup definition');
      await page.keyboard.press('Escape');await page.waitForSelector('dialog[open]',{state:'hidden'});
      if(control.targetId===stratagemId) {
        const row=payload.relatedRules.rows.find(row=>row.ruleId===stratagemId&&['MATCH','CONDITIONAL'].includes(row.applicability));assert.ok(row,'Missing canonical Related sensitivity control');
        await page.evaluate(id=>{window.ArmyBookAppV2.open(id);window.ArmyBookAppV2.openRelatedRules(id);},row.unitId);await page.locator('dialog.v2-related-dialog[open] .full-related-filter summary').click();await page.locator('dialog.v2-related-dialog[open] .full-related-filter button[data-detachment=""]').click();
        await page.locator(`dialog.v2-related-dialog[open] .full-related-tabs button[data-kind="stratagems"]`).click();
        await page.locator('dialog.v2-related-dialog[open] .v2-compatible-item a').evaluateAll((nodes,id)=>nodes.find(node=>node.dataset.targetId===id).setAttribute('data-qa-poison-related','current'),stratagemId);
        await page.locator('[data-qa-poison-related="current"]').click();await page.waitForSelector('dialog.v2-detail-dialog[open]');assert.equal(await page.locator('dialog.v2-detail-dialog[open] '+selector).textContent(),control.value);assert.deepEqual(comparable(await observe(page,'dialog.v2-detail-dialog[open]')),comparable(reader),'Source sensitivity lost Related/Reader/Glossary shared definition');await page.keyboard.press('Escape');await page.waitForSelector('dialog.v2-detail-dialog[open]',{state:'hidden'});await page.locator('dialog.v2-related-dialog[open] .related-rules-close').click();
      }
    }
    assert.deepEqual(errors,[],device+' source sensitivity runtime errors');sourcePoisonResults.push({device,canonicalDgAbility:'VISIBLE',canonicalCoreDefinition:'VISIBLE',canonicalStratagemReaderRelatedGlossary:'IDENTICAL',status:'PASS'});await context.close();activePage=null;
  }
  assert.deepEqual(legacyRequests,[],'Legacy Glossary/runtime factual request');assert.equal(requests.filter(isLegacyGlossary).length,0);
  const report={status:'PASS',scope:sourceSensitivityOnly?'SOURCE_SENSITIVITY_ONLY':'FULL',census,results:results.map(({targetHashes,...result})=>result),sourcePoisonResults,desktopPhoneDefinitionParity:sourceSensitivityOnly?'NOT_RUN':true,legacyGlossaryReads:0,legacyPoison:'PASS',requestedPaths:[...new Set(requests)]};
  if(screenshots)fs.writeFileSync(path.join(screenshots,'glossary-browser-report.json'),JSON.stringify({...report,targetHashes:results[0]?.targetHashes},null,2));
  console.log(JSON.stringify(report,null,2));
}catch(error) {
  if(screenshots){fs.writeFileSync(path.join(screenshots,'glossary-browser-failure.json'),JSON.stringify({step:activeStep,message:error.message,stack:error.stack,actual:error.actual,expected:error.expected,url:activePage?.url()},null,2));if(activePage)await activePage.screenshot({path:path.join(screenshots,'glossary-browser-failure.png'),animations:'disabled'}).catch(()=>{});}
  throw error;
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
