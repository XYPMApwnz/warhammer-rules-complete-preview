import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {readAppInputs,buildApp} from './app-build.mjs';
import {allowRosterDependencies} from './roster-browser-dependencies.mjs';
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';
import {projectArmyBook} from '../../shared/army-book-app-v2/project.mjs';
import {projectBookPresentation} from '../../shared/army-book-app-v2/book-v1-projection.mjs';
import {enumerateExpectedFacts} from './app-fact-oracle.mjs';

const {chromium}=createRequire(import.meta.url)('playwright');
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const appPath='/books/death-guard/v2/app.html',payloadPath='/books/death-guard/v2/generated/app-presentation.json';
const inputs=readAppInputs(),payload=buildApp(inputs);
const kinds=new Set(['BOOK_USAGE_RULES','ARMY_RULE','ARMY_RULE_COMPONENT','DETACHMENT','DETACHMENT_RULE','ENHANCEMENT','STRATAGEM','SOURCE_ERRATUM']);
const sourceEntities=inputs.model.entities.filter(entity=>kinds.has(entity.kind));
const forceBindings=createEffectiveMfmCatalog().catalog.crossDomainBindings.forceDispositionBindings;

// Independent denominator: read accepted effective entities and central MFM
// bindings, never the presentation projection or rendered card field list.
function expectedPlayerFacts(model,records){
  const expected=[];
  const contextIds=new Map(model.entities.map(entity=>[entity.id,entity.parentId||entity.id]));
  for(const key of ['detachmentBindings','enhancementBindings'])for(const binding of model.mfm[key])contextIds.set(binding.mfmRecordId,binding.entityId);
  const add=(entityId,pointer,value,display=value)=>expected.push({id:entityId+'::'+pointer,entityId,contextId:contextIds.get(entityId),value,text:String(display)});
  for(const entity of model.entities.filter(entity=>kinds.has(entity.kind))){
    const {id,data}=entity;
    for(const key of ['title','text'])if(data[key]!==undefined)add(id,'/'+key,data[key]);
    for(const [index,clause] of (data.clauses||[]).entries())if(clause.text!==undefined)add(id,`/clauses/${index}/text`,clause.text);
    for(const [row,cells] of (data.table||[]).entries())for(const [column,value]of cells.entries())add(id,`/table/${row}/${column}`,value);
    for(const [index,table]of(data.tables||[]).entries())for(const[row,cells]of(table.rows||[]).entries())for(const[column,value]of cells.entries())add(id,`/tables/${index}/rows/${row}/${column}`,value);
    if(entity.kind==='STRATAGEM'){
      add(id,'/cp',data.cp);add(id,'/category',data.category);
      for(const[index,line]of data.lines.entries())for(const key of ['label','text'])add(id,`/lines/${index}/${key}`,line[key]);
    }
    if(entity.kind==='ENHANCEMENT'){
      const binding=model.mfm.enhancementBindings.find(binding=>binding.entityId===id),record=records.get(binding.mfmRecordId);
      add(record.id,'/value',record.value);
    }
    if(entity.kind==='DETACHMENT'){
      const binding=model.mfm.detachmentBindings.find(binding=>binding.entityId===id),record=records.get(binding.mfmRecordId);
      add(record.id,'/detachmentPoints',record.detachmentPoints);
      record.forceDispositionIds.forEach((value,index)=>add(record.id,`/forceDispositionIds/${index}`,value,forceBindings[record.mfmForceDispositionIds[index]].sourceValue));
    }
  }
  assert.equal(new Set(expected.map(fact=>fact.id)).size,expected.length,'Oracle identity collision');
  return expected;
}
const expected=expectedPlayerFacts(inputs.model,inputs.records);
assert.equal(expected.length,594,'Independent normal player atom census');
// All 645 source-evidence atoms are retained. The 51 not repeated in ordinary
// display have explicit canonical proofs, rather than blanket exclusion.
const evidenceOwnerIds=new Set([...sourceEntities.map(entity=>entity.id),...inputs.model.mfm.detachmentBindings.map(binding=>binding.mfmRecordId),...inputs.model.mfm.enhancementBindings.map(binding=>binding.mfmRecordId)]);
const sourceEvidence=enumerateExpectedFacts(inputs.model,inputs.records).filter(fact=>evidenceOwnerIds.has(fact.entityId));
const playerIds=new Set(expected.map(fact=>fact.id));
const omitted=sourceEvidence.filter(fact=>!playerIds.has(fact.id));
assert.equal(sourceEvidence.length,645);assert.equal(omitted.length,51);
const omissionProofs={duplicateMfmName:0,duplicateQualification:0,erratumDirectiveBindings:0};
for(const fact of omitted){
  if(fact.path.length===1&&fact.path[0]==='label'&&inputs.records.has(fact.entityId)){
    const binding=[...inputs.model.mfm.detachmentBindings,...inputs.model.mfm.enhancementBindings].find(binding=>binding.mfmRecordId===fact.entityId);
    assert.ok(binding,'MFM label without canonical owner binding');assert.ok(playerIds.has(binding.entityId+'::/title'));
    assert.equal(inputs.records.get(fact.entityId).label,fact.value);omissionProofs.duplicateMfmName++;continue;
  }
  const entity=inputs.model.entities.find(entity=>entity.id===fact.entityId);
  if(fact.path[0]==='qualifications'){
    const qualification=entity.qualifications[fact.path[1]].value;assert.ok(entity.data.text.includes(qualification.sourceText),'Qualification source wording absent from player text');
    assert.ok(qualification.sourceText.includes(String(qualification.contagionRangeCap)+'"'),'Cap/source text disagreement');omissionProofs.duplicateQualification++;continue;
  }
  if(entity.kind==='SOURCE_ERRATUM'&&['directive','operation','targetBindings'].includes(fact.path[0])){
    assert.equal(entity.data.operation,'REPLACE');assert.equal(entity.data.directive,'Change to:');assert.ok(entity.data.text.includes(entity.data.directive));
    for(const binding of entity.data.targetBindings){const target=inputs.model.entities.find(target=>target.id===binding.targetId);assert.ok(target);const value=binding.field.reduce((record,key)=>record?.[key],target.data);assert.equal(typeof value,'string');assert.ok(entity.data.text.includes(value),'Bound update target text absent from visible directive');}
    omissionProofs.erratumDirectiveBindings++;continue;
  }
  assert.fail('Unclassified player omission: '+fact.id);
}
assert.deepEqual(omissionProofs,{duplicateMfmName:39,duplicateQualification:2,erratumDirectiveBindings:10});
const census=Object.fromEntries([...kinds].map(kind=>[kind,sourceEntities.filter(entity=>entity.kind===kind).length]));
assert.equal(census.STRATAGEM,45);assert.equal(census.ENHANCEMENT,30);assert.equal(census.DETACHMENT,9);
assert.equal(census.DETACHMENT_RULE,9);assert.equal(census.ARMY_RULE,2);assert.equal(census.ARMY_RULE_COMPONENT,5);assert.equal(census.SOURCE_ERRATUM,5);

const allowed=new Map([[appPath,'text/html'],[payloadPath,'application/json'],['/books/shared/army-book-app-v2/runtime.mjs','text/javascript'],['/books/shared/army-book-app-v2/glossary.mjs','text/javascript'],['/books/shared/army-book-app-v2/styles.css','text/css']]);
allowRosterDependencies(allowed);
let servedPayload=payload,legacyPoison='LEGACY_POISON_A';
const requests=[],forbidden=[];
const server=http.createServer((req,res)=>{
  const address=new URL(req.url,'http://localhost').pathname;requests.push(address);
  if(!allowed.has(address)){
    if(address!=='/favicon.ico')forbidden.push(address);
    res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({legacyPoison}));return;
  }
  res.writeHead(200,{'Content-Type':allowed.get(address),'Cache-Control':'no-store'});
  res.end(address===payloadPath?JSON.stringify(servedPayload):fs.readFileSync(path.join(repo,address.slice(1))));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const ready=page=>page.waitForFunction(()=>!!window.ArmyBookAppV2&&!!document.querySelector('main .v1-contents-pages'));
const observe=page=>page.locator('main .v1-contents-pages').evaluate(root=>({
  facts:[...root.querySelectorAll('[data-fact-id]')].map(node=>({id:node.dataset.factId,value:JSON.parse(node.dataset.factValue),text:node.textContent,entityId:node.dataset.entityId,contextId:node.dataset.contextId,owner:node.closest('[data-card-id]')?.dataset.cardId,visible:!!node.getClientRects().length})),
  generic:[...root.querySelectorAll('.v2-card')].filter(node=>!node.closest('.unit-card')).map(node=>node.dataset.cardId),
  records:[...root.querySelectorAll('.v2-book-record')].map(node=>({id:node.dataset.cardId,classes:node.className})),
  overflow:document.documentElement.scrollWidth>innerWidth+1
}));
function assertFacts(observed,oracle,label){
  const ids=new Set(oracle.map(fact=>fact.id)),actual=observed.facts.filter(fact=>ids.has(fact.id));
  for(const fact of oracle){
    const matches=actual.filter(actual=>actual.id===fact.id);assert.equal(matches.length,1,`${label} missing/duplicate ${fact.id}`);
    const match=matches[0];assert.deepEqual(match.value,fact.value,`${label} WRONG_VALUE ${fact.id}`);
    assert.equal(match.text,fact.text,`${label} WRONG_DISPLAY ${fact.id}`);assert.equal(match.entityId,fact.entityId,`${label} WRONG_IDENTITY ${fact.id}`);
    assert.equal(match.contextId,fact.contextId,`${label} WRONG_CONTEXT ${fact.id}`);
    assert.equal(match.owner,fact.entityId,`${label} WRONG_OWNER ${fact.id}`);assert.equal(match.visible,true,`${label} HIDDEN ${fact.id}`);
  }
  assert.deepEqual(observed.generic,[],`${label} generic player book renderer`);assert.equal(observed.overflow,false,`${label} horizontal overflow`);
}
const results=[];
try{
  for(const[device,viewport]of[['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
    const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[];page.setDefaultTimeout(10000);
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(origin+appPath+'#start');await ready(page);await page.waitForTimeout(150);
    const observed=await observe(page);assertFacts(observed,expected,device);
    const cover=page.locator('main .v2-hero[data-book-artwork]');
    assert.equal(await cover.count(),1,`${device} missing faction cover`);
    const artwork=await cover.getAttribute('data-book-artwork');
    assert.equal(new URL(artwork).pathname,'/assets/death-guard-cover.jpg');
    assert.ok((await cover.evaluate(node=>getComputedStyle(node).backgroundImage)).includes(artwork),`${device} cover not rendered`);
    const coverResponse=await page.request.get(artwork);assert.equal(coverResponse.status(),200);assert.match(coverResponse.headers()['content-type'],/image\/jpeg/);
    for(const entity of sourceEntities.filter(entity=>entity.kind==='SOURCE_ERRATUM')){
      const ids=await page.locator(`main [data-card-id="${entity.id}"] .source`).evaluate(node=>JSON.parse(node.dataset.sourceIds));assert.ok(ids.includes(entity.provenance.sourceId),`${device} current update provenance missing ${entity.id}`);
    }
    for(const entity of sourceEntities){const rows=observed.records.filter(row=>row.id===entity.id);assert.equal(rows.length,1,`${device} canonical record duplicate ${entity.id}`);}
    assert.equal(await page.locator('main .detachment.content-group').count(),9);
    assert.equal(await page.locator('main .stratagem.surface').count(),45);
    assert.equal(await page.locator('main .enhancement.surface').count(),30);
    for(const entity of sourceEntities.filter(entity=>entity.kind==='STRATAGEM')){
      assert.equal(await page.locator(`main [data-card-id="${entity.id}"] .cp`).textContent(),String(entity.data.cp),`${device} complete CP diamond display`);
      const colors={'battle tactic stratagem':'#247090','strategic ploy stratagem':'#507f72','wargear stratagem':'#a77b32','epic deed stratagem':'#a83338'};
      const category=Object.keys(colors).find(category=>entity.data.category.toLowerCase().endsWith(category));
      // Some accepted categories contain only the Detachment name. Preserve
      // that source text and the neutral V1 rail rather than inventing a type.
      assert.equal(await page.locator(`main [data-card-id="${entity.id}"]`).evaluate(node=>getComputedStyle(node).getPropertyValue('--strat-color').trim()),category?colors[category]:'#756f61',`${device} V1 Stratagem rail colour`);
    }
    const columns=await page.locator('main .stratagem-grid').first().evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(' ').length);
    assert.equal(columns,device==='desktop'?2:1,`${device} actual V1 Stratagem grid`);
    for(const selector of ['main .content-group .category-title','main .enhancement h4','main .stratagem h3']){
      const font=await page.locator(selector).first().evaluate(node=>getComputedStyle(node).fontFamily);assert.match(font,/Georgia|serif/i,`${device} V1 title typography ${selector}`);
    }
    const shell=await page.locator('body').evaluate(node=>getComputedStyle(node).backgroundColor);assert.ok(!['rgb(242, 241, 235)','rgb(255, 254, 249)'].includes(shell),`${device} light admin shell`);
    // The same canonical record is opened through Reader, Related Rules and
    // Glossary. No summary/index copy may become a factual detail owner.
    const strat=sourceEntities.find(entity=>entity.kind==='STRATAGEM'),enh=sourceEntities.find(entity=>entity.kind==='ENHANCEMENT');
    const detail=async id=>{await page.waitForSelector('dialog[open]');const card=page.locator(`dialog[open] [data-card-id="${id}"]`).first();assert.equal(await card.count(),1);return card.locator('[data-fact-id]').evaluateAll(nodes=>nodes.map(node=>[node.dataset.factId,node.dataset.factValue,node.textContent]));};
    for(const entity of [strat,enh]){
      await page.locator(`main [data-card-id="${entity.id}"] a.v2-reference[data-target-id="${entity.id}"]`).first().click();const reader=await detail(entity.id);await page.keyboard.press('Escape');
      await page.evaluate(()=>window.ArmyBookAppV2.openGlossary());await page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill(entity.data.title);
      await page.locator(`.v2-glossary-result[data-target-id="${entity.id}"]`).click();assert.deepEqual(await detail(entity.id),reader,`${device} Glossary detail identity`);await page.keyboard.press('Escape');
      await page.goto(origin+appPath+'#start');await ready(page);
      const relation=payload.relatedRules.rows.find(row=>row.ruleId===entity.id&&['MATCH','CONDITIONAL'].includes(row.applicability));
      if(relation){await page.evaluate(id=>window.ArmyBookAppV2.openRelatedRules(id),relation.unitId);await page.locator(`dialog[open] a.v2-reference[data-target-id="${entity.id}"]`).click();assert.deepEqual(await detail(entity.id),reader,`${device} Related Rules detail identity`);await page.keyboard.press('Escape');}
    }
    // Selected book record and popup remain dark even without any datasheet.
    await page.goto(origin+appPath+'#army-rule-nurgles-gift');await page.waitForFunction(()=>!!window.ArmyBookAppV2);
    await page.evaluate(()=>window.ArmyBookAppV2.open('army-rule-pact-of-decay'));
    assert.equal(await page.locator('main .v2-card').count(),0,`${device} selected generic book record`);
    assert.deepEqual(errors,[],`${device} uncaught errors`);
    results.push({device,playerFacts:expected.length,records:sourceEntities.length,gridColumns:columns,overflow:false,canonicalPopup:'PASS',status:'PASS'});await context.close();
  }
  // Isolated mutation controls exercise the actual DOM. Canonical source text,
  // structured CP and central MFM price must all reach the same presenter.
  const mutatedModel=structuredClone(inputs.model),mutatedRecords=new Map([...inputs.records].map(([id,record])=>[id,structuredClone(record)]));
  // All these records have source-backed contracts. Changing source text while
  // leaving semantic evidence untouched must fail upstream. This test bypasses
  // contract compilation only in test isolation to exercise the presentation
  // projection boundary; baseline Related Rules answers are kept unchanged.
  const introduction=mutatedModel.entities.find(entity=>entity.kind==='BOOK_USAGE_RULES');introduction.data.clauses[0].text='V2_CANONICAL_RULE_MUTATION_721';
  const strat=mutatedModel.entities.find(entity=>entity.kind==='STRATAGEM');strat.data.cp='9CP';strat.ruleContract.cp='9CP';
  const enh=mutatedModel.entities.find(entity=>entity.kind==='ENHANCEMENT');const binding=mutatedModel.mfm.enhancementBindings.find(binding=>binding.entityId===enh.id);mutatedRecords.get(binding.mfmRecordId).value=99;
  assert.throws(()=>buildApp({...inputs,model:mutatedModel,records:mutatedRecords}),/source atom without exact evidence/,'Upstream source integrity must fail closed');
  const mutatedPresentation=projectArmyBook(mutatedModel,mutatedRecords,payload.book);
  servedPayload={...payload,...mutatedPresentation,cards:[...mutatedPresentation.cards,...payload.cards.filter(card=>card.domain==='CORE')],bookPresentation:projectBookPresentation(mutatedModel,mutatedRecords)};
  const page=await browser.newPage();await page.goto(origin+appPath+'#start');await ready(page);const mutated=await observe(page);
  assertFacts(mutated,expectedPlayerFacts(mutatedModel,mutatedRecords),'V2 mutation');
  assert.throws(()=>assertFacts(mutated,expected,'Dropped/changed player fact'),/WRONG_VALUE|WRONG_DISPLAY/,'Canonical mutation must fail source parity');
  servedPayload=payload;legacyPoison='LEGACY_POISON_B';await page.reload();await ready(page);assertFacts(await observe(page),expected,'Legacy disconnect/poison');await page.close();
  assert.deepEqual(forbidden,[],'Legacy/unexpected runtime factual dependency');
  console.log(JSON.stringify({status:'PASS',census,playerFacts:expected.length,bookSourceEvidenceFacts:sourceEvidence.length,omissionProofs,results,mutations:{canonicalText:'DETECTED_AND_REFLECTED',structuredCp:'DETECTED_AND_REFLECTED',centralMfmPrice:'DETECTED_AND_REFLECTED',upstreamSourceIntegrity:'FAIL_CLOSED'},legacyPoison:'PASS',v1FactualReads:0,requestedPaths:[...new Set(requests)]},null,2));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
