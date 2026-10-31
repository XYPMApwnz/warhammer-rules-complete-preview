import {cleanupQaTempDir,createQaTempDir,getQaTmpRoot} from '../../../tests/helpers/qa-temp.mjs';
/** Bounded V2 factual-owner parity; this is not a new independent source audit. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {loadGlossaryV2Inputs,createGlossaryV2Index,assertGlossaryV2Parity} from '../content/glossary-v2-index.mjs';
import {assertV2ArmyBookParity,V2_ARMY_BOOK_IDS} from '../content/army-v2-projection.mjs';
import {createGlobalGlossaryContent} from '../../../books/shared/army-book-app-v2/global-glossary-content.mjs';
import {adaptGlobalGlossary} from '../../../books/shared/army-book-app-v2/global-glossary.mjs';
import {createReferenceContract} from '../../../books/shared/army-book-app-v2/reference-contract.mjs';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=relative=>JSON.parse(fs.readFileSync(path.join(repo,relative),'utf8'));
const inputs=await loadGlossaryV2Inputs(),index=createGlossaryV2Index(inputs);
const published=read('glossary/v2/generated/index.en.json');
assertGlossaryV2Parity(published,inputs);
assert.deepEqual(index.supportedArmyBooks,V2_ARMY_BOOK_IDS);
const precedingSeven=JSON.parse(execFileSync('git',['show','c21b5881a8d38be02cf56fe0428ce8841a7cba76:glossary/v2/generated/index.en.json'],{cwd:repo,encoding:'utf8',maxBuffer:100*1024*1024}));
const currentEntries=new Map(index.entries.map(article=>[article.id,article]));
for(const article of precedingSeven.entries){
  const current=currentEntries.get(article.id);assert.ok(current,'Predecessor canonical record lost '+article.id);
  for(const field of ['label','facts','provenance','fieldProvenance','sourceOwner','currentness'])assert.deepEqual(current[field],article[field],'Predecessor canonical fact changed '+article.id+'/'+field);
  for(const reference of article.canonicalReferences)assert.ok(current.canonicalReferences.some(item=>JSON.stringify(item)===JSON.stringify(reference)),'Predecessor reference lost '+article.id);
  for(const context of article.contexts)assert.ok(current.contexts.some(item=>JSON.stringify(item)===JSON.stringify(context)),'Predecessor context lost '+article.id);
  if(article.domain==='ARMY')assert.deepEqual({...current,contexts:article.contexts},article,'Seven predecessor Army facts/references changed '+article.id);
}
const daFacts=read('books/dark-angels/v2/generated/effective.json').entities;
const daEntries=index.entries.filter(article=>article.sourceOwner.bookId==='dark-angels');
assert.deepEqual(new Set(daEntries.map(article=>article.sourceOwner.canonicalId)),new Set(daFacts.map(entity=>entity.id)),'Only independently owned DA factual records may be added');
assert.ok(daEntries.every(article=>!article.sourceOwner.canonicalId.includes('-sm-')),'Inherited SM references duplicated as DA owners');
const excludedBooks=new Set(index.entries.filter(entry=>entry.domain==='ARMY').map(entry=>entry.sourceOwner.bookId).filter(book=>!V2_ARMY_BOOK_IDS.includes(book)));
assert.ok(index.entries.every(entry=>entry.domain!=='ARMY'||!excludedBooks.has(entry.sourceOwner.bookId)),'Unconnected standalone Army Book leaked into V2');
const centralKinds=new Set(['POINTS_SCHEDULE_ROW','PAID_WARGEAR_COST','DETACHMENT_ROSTER_METADATA','ENHANCEMENT_COST_QUALIFIERS','ALLIED_POINTS_DEPENDENCY','ATTACHMENT_RELATION']);
const ownerKey=(book,id)=>book+'\0'+id;
const armyEntries=index.entries.filter(entry=>entry.domain==='ARMY');
const army=new Map(armyEntries.map(entry=>[ownerKey(entry.sourceOwner.bookId,entry.sourceOwner.canonicalId),entry]));
assert.equal(army.size,armyEntries.length,'Duplicated canonical Army owner');
let canonicalFacts=0;
const expectedArmyKeys=new Set();
for(const model of inputs.armyModels)for(const entity of model.entities){
  if(centralKinds.has(entity.kind)||entity.data.status==='SUPERSEDED')continue;
  const key=ownerKey(model.book.id,entity.id),entry=army.get(key);expectedArmyKeys.add(key);
  assert.ok(entry,'Missing canonical V2 Glossary record '+key);
  assert.deepEqual(entry.facts.canonicalData,entity.data,'Canonical data mismatch '+key);
  assert.deepEqual(entry.provenance,entity.provenance,'Canonical provenance mismatch '+key);
  assert.equal(entry.sourceOwner.interface,model.factualInterface);
  const owner=entity.parentId||entity.ownerId;
  const parent=model.entities.some(candidate=>candidate.id===owner)?owner:null;
  assert.equal(entry.parent?.canonicalId||null,parent,'Wrong physical/canonical owner '+key);
  canonicalFacts++;
}
assert.deepEqual(new Set(army.keys()),expectedArmyKeys,'Missing/extra canonical Army inventory');
const entry=(book,id)=>{const result=army.get(ownerKey(book,id));assert.ok(result,book+'/'+id);return result;};

// These compare source-owned annotations, not a freshly regenerated projection
// against itself. A builder that drops metadata and regenerates must still fail.
function verifySourceAnnotations(publication){
  const articles=new Map(publication.entries.filter(record=>record.domain==='ARMY').map(record=>[ownerKey(record.sourceOwner.bookId,record.sourceOwner.canonicalId),record]));
  let dgFieldSources=0;
  for(const model of inputs.armyModels)for(const entity of model.entities){
    const article=articles.get(ownerKey(model.book.id,entity.id));if(!article)continue;
    assert.deepEqual(article.fieldProvenance,entity.fieldProvenance,'Field-level official provenance lost '+model.book.id+'/'+entity.id);
    assert.deepEqual(article.facts.qualifications,entity.qualifications,'Canonical qualification lost '+model.book.id+'/'+entity.id);
    if(model.book.id==='death-guard'&&entity.fieldProvenance)dgFieldSources++;
  }
  return dgFieldSources;
}
assert.equal(verifySourceAnnotations(published),75,'All 75 reviewed DG field-provenance findings');

// Exact question/answer independently read from accepted raw Waha and official
// Faction Pack v1.3 p8; it is not an expectation extracted from an effect contract.
const pbcFAQ='Q: Does the Plagueburst Crawler’s Spore-laced Shock Waves ability inflict mortal wounds every turn to units affected by the ability?\nA: No.';
const officialDG='books/death-guard/v2/sources/gw-death-guard-faction-pack-2026-09-30.pdf';
assert.equal(createHash('sha256').update(fs.readFileSync(path.join(repo,officialDG))).digest('hex'),'ebf3f985bad14fe61b0224fc0ba35bab952d4306ab5691629b599114086cb2dd');
const rawPBC=fs.readFileSync(path.join(repo,'books/death-guard/v2/sources/accepted-waha-pages/Plagueburst-Crawler.html'),'utf8').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
assert.ok(rawPBC.includes(pbcFAQ.replace(/\s+/g,' ')),'Accepted raw FAQ source changed; explicit source review required');
const pbcSource=inputs.armyModels.find(model=>model.book.id==='death-guard').entities.find(entity=>entity.id==='datasheet-plagueburst-crawler:section:1');
assert.equal(pbcSource.qualifications[0].value.sourceText,pbcFAQ);
assert.equal(pbcSource.qualifications[0].sourceId,'gw-death-guard-faction-pack-v1.3-2026-09-30');
assert.equal(pbcSource.qualifications[0].provenance.page,8);
const pbcId=entry('death-guard',pbcSource.id).id;
function verifyFAQPresentation(publication){
  const pbc=publication.entries.find(record=>record.id===pbcId);
  assert.equal(pbc.parent.canonicalId,'unit-plagueburst-crawler');
  assert.equal(publication.entries.filter(record=>record.sourceOwner.bookId==='death-guard'&&record.sourceOwner.canonicalId===pbcSource.id).length,1,'FAQ acquired a duplicate factual owner');
  const content=createGlobalGlossaryContent(publication);
  for(const article of [pbc,publication.entries.find(record=>record.sourceOwner.bookId==='death-guard'&&record.sourceOwner.canonicalId==='unit-plagueburst-crawler')]){
    const definition=content.project(article).definition;
    assert.equal(definition.split(pbcFAQ).length-1,1,'Full FAQ must appear once in owner/Unit article');
  }
  assert.ok(pbc.searchableContent.includes(pbcFAQ),'FAQ question/answer missing from search');
  const projected=adaptGlobalGlossary(publication),cards=new Map(projected.cards.map(card=>[card.id,card]));
  const contract=createReferenceContract({cards,index:projected.index});
  const fieldId=pbcId+'::/blocks/0/text',resolved=contract.resolve(fieldId);
  const faqField=resolved.sections.flatMap(section=>section.fields).filter(field=>field.value===pbcFAQ);
  assert.equal(faqField.length,1,'Named ability popup loses or duplicates its FAQ');
  assert.deepEqual(faqField[0].source,{entityId:pbcSource.id,path:'/qualifications/0/value/sourceText'});
  assert.deepEqual(faqField[0].provenance,{sourceId:pbcSource.qualifications[0].sourceId,...pbcSource.qualifications[0].provenance});
  assert.deepEqual(cards.get(pbcId).fieldProvenance,pbcSource.fieldProvenance);
}
verifyFAQPresentation(published);
const display=createGlobalGlossaryContent(index);
for(const article of armyEntries)assert.ok(display.project(article).definition,'Empty canonical Army article '+article.id);
// Sixth-book integration reuses T’au effective facts, never its executable declarations
// as an independent content oracle. All five predecessor Army articles stay byte-for-byte equal.
const tau=inputs.armyModels.find(model=>model.book.id==='tau-empire');
const tauEntries=armyEntries.filter(record=>record.sourceOwner.bookId==='tau-empire');
for(const [kind,count]of Object.entries({DATASHEET:43,MODEL_PROFILE:44,DETACHMENT:7,DETACHMENT_RULE:9,ENHANCEMENT:23,STRATAGEM:31,EQUIPMENT_RULE:5}))
  assert.equal(tau.entities.filter(entity=>entity.kind===kind).length,count,'T’au canonical '+kind+' inventory');
for(const fact of tau.entities.filter(entity=>['ARMY_RULE_COMPONENT','DETACHMENT_RULE','ENHANCEMENT','EQUIPMENT_RULE','ERRATA','FAQ'].includes(entity.kind))){
  const article=entry('tau-empire',fact.id);
  if(fact.data.text)assert.ok(display.project(article).definition.includes(fact.data.text),'T’au complete text '+fact.id);
}
for(const fact of tau.entities.filter(entity=>entity.kind==='COMPOSITION_MEMBER')){
  const article=entry('tau-empire',fact.id);
  assert.equal(article.facts.sourceText,fact.data.sourceText??fact.data.text,'T’au composition presentation must preserve the canonical text');
  assert.equal(display.project(article).definition,fact.data.sourceText??fact.data.text,'T’au composition popup must display its full canonical text');
}
const tauProjection=adaptGlobalGlossary(index),tauReference=createReferenceContract({cards:new Map(tauProjection.cards.map(card=>[card.id,card])),index:tauProjection.index});
for(const article of tauEntries){
  const canonicalId=article.sourceOwner.canonicalId;
  const aliases=tauProjection.cards.filter(card=>card.identity?.registryId==='tau-empire'&&card.identity?.canonicalId===canonicalId);
  assert.equal(tauReference.resolveAlias(canonicalId,{registryId:'tau-empire'}),aliases.length>1?null:article.id,'T’au canonical alias must resolve uniquely or fail closed for multiple field views '+canonicalId);
  assert.equal(tauReference.resolve(tauReference.identityFor(article.id))?.targetId,article.id,'T’au direct reference '+canonicalId);
}
// DA membership reuses original SM identities and adds consumer placements only.
const daModel=inputs.armyModels.find(model=>model.book.id==='dark-angels');
for(const fact of daModel.entities){
  const article=entry('dark-angels',fact.id);
  if(['ARMY_RULE','DETACHMENT_RULE','ENHANCEMENT','STRATAGEM','DATASHEET_ABILITY'].includes(fact.kind)&&fact.data.text)assert.ok(display.project(article).definition.includes(fact.data.text),'Complete DA source text '+fact.id);
  assert.equal(tauReference.resolve(tauReference.identityFor(article.id))?.targetId,article.id,'DA owned direct reference '+fact.id);
}
for(const fact of daModel.referenceEntities){
  const article=entry(fact.bookId,fact.id);
  assert.ok(article.contexts.some(context=>context.effectiveBookId==='dark-angels'&&context.sourceBookId==='space-marines'),'Inherited consumer context missing '+fact.id);
  if(fact.kind==='DATASHEET')assert.equal(tauReference.resolveAlias(fact.id,{registryId:'dark-angels'}),article.id,'Inherited UNIT reference must resolve to original SM owner');
}
const noMembership=structuredClone(inputs.armyModels);
noMembership.find(model=>model.book.id==='dark-angels').referenceEntities.push(structuredClone(inputs.armyModels.find(model=>model.book.id==='space-marines').entities.find(entity=>entity.kind==='DATASHEET'&&!daModel.referenceEntities.some(ref=>ref.id===entity.id))));
assert.throws(()=>assertV2ArmyBookParity(noMembership),assert.AssertionError,'Foreign Chapter reference must fail closed');
// Seventh-owner integration preserves the exact prior six factual articles.
const sm=inputs.armyModels.find(model=>model.book.id==='space-marines');
const smEntries=armyEntries.filter(record=>record.sourceOwner.bookId==='space-marines');
assert.equal(smEntries.length,sm.entities.length,'One SM Glossary article per existing source owner');
for(const [kind,count]of Object.entries({DATASHEET:85,MODEL_PROFILE:117,DETACHMENT:21,DETACHMENT_RULE:24,ENHANCEMENT:56,STRATAGEM:84,WEAPON_PROFILE:386}))
  assert.equal(sm.entities.filter(entity=>entity.kind===kind).length,count,'Accepted SM '+kind+' inventory');
for(const fact of sm.entities.filter(entity=>['DATASHEET_ABILITY','ARMY_RULE','DETACHMENT_RULE','ENHANCEMENT','STRATAGEM'].includes(entity.kind)))
  if(fact.data.text)assert.ok(display.project(entry('space-marines',fact.id)).definition.includes(fact.data.text),'Complete SM source text '+fact.id);
for(const profile of sm.entities.filter(entity=>entity.kind==='MODEL_PROFILE')){
  const saves=sm.entities.filter(save=>save.kind==='INVULNERABLE_SAVE'&&save.parentId===profile.parentId&&save.data.sourceProfileIds.includes(profile.id)&&(!save.data.conditionText||save.data.scopeQualification==='EXPLICIT_NAMED_MODEL'));
  assert.ok(saves.length<=1);
  assert.equal(entry('space-marines',profile.id).facts.stats.INSV,saves[0]?.data.value,'Native static invulnerable scope '+profile.id);
}
const precedingSix=JSON.parse(execFileSync('git',['show','3e0c219f1210284a912faba71d46f3afa9710cea:glossary/v2/generated/index.en.json'],{cwd:repo,encoding:'utf8',maxBuffer:100*1024*1024}));
const currentById=new Map(index.entries.map(article=>[article.id,article]));
const priorFormatterSource=execFileSync('git',['show','3e0c219f1210284a912faba71d46f3afa9710cea:books/shared/army-book-app-v2/global-glossary-content.mjs'],{cwd:repo,encoding:'utf8'});
const {createGlobalGlossaryContent:priorFormatter}=await import('data:text/javascript;base64,'+Buffer.from(priorFormatterSource).toString('base64'));
const priorDisplay=priorFormatter(precedingSix);

for(const article of precedingSix.entries.filter(article=>article.domain==='ARMY'))
  assert.deepEqual({...currentById.get(article.id),contexts:article.contexts},article,'Six predecessor Army facts/provenance/references changed '+article.id);
for(const article of precedingSix.entries.filter(article=>article.domain==='ARMY'))
  assert.deepEqual(display.project(currentById.get(article.id)).mfm.lines,priorDisplay.project(article).mfm.lines,'Six predecessor MFM display changed '+article.id);

const predecessor=JSON.parse(execFileSync('git',['show','f5e3ebc5ff5d57674e842f47656a59c39c0c58f0:glossary/v2/generated/index.en.json'],{cwd:repo,encoding:'utf8',maxBuffer:100*1024*1024}));
const fiveBooks=V2_ARMY_BOOK_IDS.filter(book=>book!=='tau-empire'),currentArticles=new Map(index.entries.map(article=>[article.id,article]));
const previousArmyArticles=predecessor.entries.filter(article=>fiveBooks.includes(article.sourceOwner.bookId));
for(const article of previousArmyArticles)assert.deepEqual({...currentArticles.get(article.id),contexts:article.contexts},article,'Prior Army canonical text/provenance/references changed '+article.id);
for(const model of inputs.armyModels)for(const unit of model.entities.filter(entity=>entity.kind==='DATASHEET')){
  const projected=entry(model.book.id,unit.id),rendered=display.project(projected).definition;
  for(const ability of projected.facts.ruleFacts.abilities)if(ability.text&&ability.title&&ability.title!==ability.id)assert.ok(rendered.includes(ability.title),'Canonical ability heading lost '+ability.id);
  for(const profile of projected.facts.profiles)if(profile.stats.INSV)assert.ok(rendered.includes('Invulnerable Save '+profile.stats.INSV),'Profile save missing from Unit article '+profile.canonicalId);
  if(unit.data.keywordScopesId){
    const scopes=model.entities.find(entity=>entity.id===unit.data.keywordScopesId).data.scopes;
    assert.deepEqual(projected.facts.factionKeywords,[...new Set(scopes.filter(scope=>scope.label==='FACTION KEYWORDS').flatMap(scope=>scope.keywords))]);
    assert.deepEqual(projected.facts.keywords,[...new Set(scopes.filter(scope=>scope.label!=='FACTION KEYWORDS').flatMap(scope=>scope.keywords))]);
  }
}
for(const component of inputs.armyModels.find(model=>model.book.id==='chaos-space-marines').entities.filter(entity=>entity.kind==='NAMED_RULE_COMPONENT'))assert.ok(display.project(entry('chaos-space-marines','unit-abaddon-the-despoiler')).definition.includes(component.data.text),'Source-owned nested Warmaster component lost');
assert.ok(display.project(entry('adeptus-mechanicus','unit-tech-priest-dominus')).definition.includes('Invulnerable Save 5+'));
let multiDispositionControls=0,scheduleControls=0;
for(const article of armyEntries){
  if(article.recordType==='DETACHMENT'){
    const references=article.canonicalReferences.filter(reference=>reference.relationType==='FORCE_DISPOSITION');
    if(references.length>1){for(const reference of references)assert.ok(display.project(article).definition.includes(index.entries.find(target=>target.id===reference.id).label),'Additional Force Disposition missing '+article.id);multiDispositionControls++;}
    for(const rule of article.facts.detachmentRules||[])for(const block of rule.content||[])if(block.text)assert.ok(display.project(article).definition.includes(block.text),'Canonical Detachment content omitted '+rule.id);
  }
  const lines=display.project(article).mfm.lines;
  for(const points of article.mfm?.pointRecords||[])for(const schedule of points.pointSchedules||[]){
    if(schedule.sourceLabel)assert.ok(lines.includes(schedule.sourceLabel),'MFM schedule source qualifier hidden '+article.id);
    if(Number.isFinite(schedule.minCopies))assert.ok(lines.includes('Units '+schedule.minCopies+(schedule.maxCopies==null?'+':schedule.maxCopies===schedule.minCopies?'':'–'+schedule.maxCopies)),'MFM unit-copy bounds hidden '+article.id);
    scheduleControls++;
  }
}
assert.ok(multiDispositionControls>0&&scheduleControls>0,'Real MFM disposition/schedule controls were not exercised');

// Literal current official controls retained by the existing bounded v1.4 QA.
const amWhen='Your Movement phase, when a friendly ELECTRO-PRIESTS unit is selected to make an advance move.';
const amGuidedWhen='Your Movement phase, when a friendly ADEPTUS MECHANICUS unit is selected to make a fall-back move.';
const amGuidedEffect='• If your unit is a HALO OVERRIDE unit, your unit can re-roll hazard rolls.\n• That fall-back move does not prevent your unit from:\n  • Being eligible to shoot.\n  • Being eligible to declare a charge.';
const chant=entry('adeptus-mechanicus','detachment-luminen-auto-choir:stratagem:2').facts.canonicalData;
assert.equal(chant.lines.find(line=>line.label==='WHEN').text,amWhen);
assert.equal(chant.lines.find(line=>line.label==='EFFECT').text,'That move does not prevent your unit from being eligible to declare a charge.');
assert.ok(!JSON.stringify(chant).includes('BATTLECLADE'),'Old Chant qualifier leaked into Glossary');
const guided=entry('adeptus-mechanicus','detachment-haloscreed-battle-clade:stratagem:5').facts.canonicalData;
assert.equal(guided.lines.find(line=>line.label==='WHEN').text,amGuidedWhen);
assert.equal(guided.lines.find(line=>line.label==='EFFECT').text,amGuidedEffect);
const faq=entry('adeptus-mechanicus','faq-2').facts.canonicalData;
assert.equal(faq.title,'When I select one of Thulia Ghuld’s Icon of War abilities, when do I select the unit that ability affects?');
assert.equal(faq.text,'When you have selected the Icon of War ability you want to use.');

// Reuse the already reviewed explicit profile inventory, not runtime-derived counts.
const officialQA=fs.readFileSync(path.join(repo,'books/chaos-space-marines/v2/official-v1.3-qa.py'),'utf8');
const expectedText=officialQA.match(/^EXPECTED = (\{[\s\S]*?^\})/m);
assert.ok(expectedText,'Existing reviewed CSM v1.3 literal profile inventory missing');
const csmExpected=JSON.parse(expectedText[1]);
for(const [id,fields]of Object.entries(csmExpected)){
  const data=entry('chaos-space-marines',id).facts.canonicalData;
  for(const [field,wanted]of Object.entries(fields))assert.equal(data.stats?.[field]??data[field],wanted,'CSM official profile not reflected in Glossary '+id+'/'+field);
}
assert.equal(entry('chaos-space-marines','datasheet-legionaries:profile:1').facts.canonicalData.stats.T,'5');
assert.equal(entry('chaos-space-marines','datasheet-havocs:profile:1').facts.canonicalData.stats.W,'3');
assert.equal(entry('chaos-space-marines','datasheet-chaos-lord:weapon:4').facts.canonicalData.strength,'5');
const lordWeapons=armyEntries.filter(record=>record.sourceOwner.bookId==='chaos-space-marines'&&record.parent?.canonicalId==='unit-chaos-lord'&&record.recordType==='WEAPON_PROFILE');
assert.equal(lordWeapons.filter(record=>record.label==='Astartes chainblade').length,1,'Chaos Lord duplicate chainblade');
assert.ok(!armyEntries.some(record=>record.sourceOwner.bookId==='chaos-space-marines'&&record.parent?.canonicalId==='unit-havocs'&&record.recordType==='WEAPON_PROFILE'&&/bolt pistol/i.test(record.label)),'Orphan correction invented a Havocs bolt pistol');

// EC is projected from the same effective owner as its Army Book, including
// the exact already-reviewed v1.3 profile inventory and current rule conditions.
const ecEntries=armyEntries.filter(record=>record.sourceOwner.bookId==='emperors-children');
for(const [type,count]of Object.entries({UNIT:23,DETACHMENT:10,ENHANCEMENT:34,STRATAGEM:51}))assert.equal(ecEntries.filter(record=>record.recordType===type).length,count,'EC exact '+type+' inventory');
const ecModels={
  'datasheet-chaos-terminators:profile:1':['T','6'],'datasheet-lord-kakophonist:profile:1':['T','6'],
  'datasheet-lucius-the-eternal:profile:1':['T','6'],'datasheet-infractors:profile:1':['T','5'],
  'datasheet-lord-exultant:profile:1':['T','5'],'datasheet-sorcerer:profile:1':['T','5'],
  'datasheet-tormentors:profile:1':['T','5'],'datasheet-noise-marines:profile:1':['W','3']
};
for(const [id,[field,value]]of Object.entries(ecModels))assert.equal(entry('emperors-children',id).facts.canonicalData.stats[field],value,'EC official model profile '+id);
const ecQA=fs.readFileSync(path.join(repo,'books/emperors-children/v2/foundation-qa.py'),'utf8');
const ecWeaponLiteral=ecQA.match(/^WEAPON_TARGETS = (\{[\s\S]*?^\})/m);assert.ok(ecWeaponLiteral,'Reviewed EC v1.3 weapon inventory missing');
const ecWeapons=JSON.parse(ecWeaponLiteral[1].replace(/,\s*}/g,'}'));assert.equal(Object.keys(ecWeapons).length,17);
for(const [id,fields]of Object.entries(ecWeapons))for(const [field,value]of Object.entries(fields))assert.equal(entry('emperors-children',id).facts.canonicalData[field],value,'EC official weapon profile '+id+'/'+field);
const frantic=entry('emperors-children','detachment-frenzied-host:rule').facts.canonicalData.text;
assert.ok(frantic.includes('BATTLELINE models')&&frantic.includes('until the end of the turn'),'Frantic Focus source model condition/duration lost');
const surge=entry('emperors-children','detachment-slaaneshs-chosen:stratagem:6').facts.canonicalData.lines;
assert.equal(surge.find(line=>line.label==='WHEN').text,'Your opponent\u2019s Shooting phase, when an enemy unit that targeted a friendly unengaged EMPEROR\u2019S CHILDREN CHARACTER unit this phase has shot.');
assert.equal(surge.find(line=>line.label==='TARGET').text,'That EMPEROR\u2019S CHILDREN CHARACTER unit.');
assert.ok(surge.find(line=>line.label==='EFFECT').text.includes('not your army\u2019s Favoured Champions'));
const host=entry('emperors-children','datasheet-lord-exultant:section:4');
assert.ok(host.facts.canonicalData.blocks[0].text.includes('Declare Battle Formations step'));
assert.equal(host.parent.canonicalId,'unit-lord-exultant');
assert.ok(!ecEntries.some(record=>record.recordType==='UPGRADE_OPTION'),'Contract weapon decisions became separate factual owners');

// Every augmented current MFM value keeps the central record, version and provenance.
const catalog=inputs.mfmCatalog,centralRecords=new Map();
for(const partition of ['unitPointRecords','paidUpgradeRecords','leaderEligibilityRecords','supportEligibilityRecords','detachments','enhancementCosts','qualifierRecords'])for(const record of catalog[partition])centralRecords.set(record.id,record);
const augmented=new Map();
const collect=value=>{
  if(!value||typeof value!=='object')return;
  if(value.id&&centralRecords.has(value.id)){
    const copy=structuredClone(value);delete copy.targetEntryIds;delete copy.referenceOnlyTargetIds;
    assert.deepEqual(copy,centralRecords.get(value.id),'MFM central factual mismatch '+value.id);
    assert.equal(copy.provenance.sourceVersion,'v1.6','Old source version in Glossary MFM');
    assert.equal(copy.provenance.effectiveDate,null,'Invented MFM effective date');
    augmented.set(value.id,copy);return;
  }
  for(const child of Object.values(value))collect(child);
};
for(const record of index.entries){collect(record.mfm);for(const context of record.contexts||[])collect(context.mfm);if(record.domain==='MFM')collect(record.facts);}
const boundRecordIds=new Set(inputs.armyModels.flatMap(model=>Object.keys(model.mfmIdentityBindings)));
for(const partition of ['unitPointRecords','paidUpgradeRecords','detachments','enhancementCosts'])for(const record of catalog[partition]){
  if(boundRecordIds.has(record.id))assert.ok(augmented.has(record.id),'Missing connected MFM owner '+record.id);
}
for(const partition of ['leaderEligibilityRecords','supportEligibilityRecords','qualifierRecords'])for(const record of catalog[partition]){
  if(V2_ARMY_BOOK_IDS.includes(record.factionId)&&(!record.armyBookId||V2_ARMY_BOOK_IDS.includes(record.armyBookId)))assert.ok(augmented.has(record.id),'Missing MFM eligibility/qualifier '+record.id);
}
const dependencyRefs=catalog.unitReferences.filter(record=>V2_ARMY_BOOK_IDS.includes(record.crossFactionDependency?.consumerArmyBookId));
const dependencyPoints=catalog.unitPointRecords.filter(record=>dependencyRefs.some(reference=>reference.id===record.unitReferenceId));
assert.deepEqual(new Set(index.entries.filter(record=>record.domain==='MFM').map(record=>record.sourceOwner.canonicalId)),new Set(dependencyPoints.map(record=>record.id)),'Missing/extra source-owned allied dependencies');
assert.equal(dependencyPoints.length,2,'Reviewed CSM allied points dependencies');
for(const id of dependencyPoints.map(record=>record.id))assert.ok(augmented.has(id));
assert.ok([...augmented.values()].every(record=>V2_ARMY_BOOK_IDS.includes(record.armyBookId||record.factionId)||dependencyPoints.some(dependency=>dependency.id===record.id)),'Standalone excluded MFM faction content leaked');

const aliasOnly=new Set(['core-errata-15-05','core-errata-15-06']);
const expectedCore=inputs.coreCatalog.records.filter(record=>['FULL_CONTENT','SOURCE_CONFLICT'].includes(record.state)&&!aliasOnly.has(record.id));
assert.deepEqual(new Set(index.entries.filter(record=>record.domain==='CORE').map(record=>record.sourceOwner.canonicalId)),new Set(expectedCore.map(record=>record.id)),'Core canonical inventory changed');
const missionPartitions=['forceDispositions','primaryMissions','secondaryMissions','deployments','twists','missionSequenceRules','missionReferenceRules','forceDispositionMatchups','terrainLayouts'];
const expectedMissionIds=new Set(inputs.missionCatalogs.flatMap(catalog=>missionPartitions.flatMap(partition=>catalog[partition].map(record=>record.id))));
assert.deepEqual(new Set(index.entries.filter(record=>record.domain==='MISSIONS'&&record.recordType!=='FAQ_CLARIFICATION').map(record=>record.sourceOwner.canonicalId)),expectedMissionIds,'Mission canonical inventory changed');

let mutations=0;
function rejected(action,label){let error;try{action();}catch(cause){error=cause;}assert.ok(error&&error.code==='ERR_ASSERTION','Comparator failed to detect '+label);mutations++;}
function publicationMutation(label,mutate){const changed=structuredClone(index);mutate(changed);rejected(()=>assertGlossaryV2Parity(changed,inputs),label);}
function annotationMutation(label,mutate,verify=verifySourceAnnotations){const changed=structuredClone(index);mutate(changed);rejected(()=>verify(changed),label);}
publicationMutation('missing native SM owner',publication=>{publication.entries=publication.entries.filter(record=>record.sourceOwner.canonicalId!==sm.entities.find(entity=>entity.kind==='STRATAGEM').id);});
publicationMutation('lost native SM complete Stratagem',publication=>{publication.entries.find(record=>record.sourceOwner.bookId==='space-marines'&&record.recordType==='STRATAGEM').facts.lines=[];});
publicationMutation('wrong native SM equipment category',publication=>{publication.entries.find(record=>record.sourceOwner.bookId==='space-marines'&&record.recordType==='WARGEAR_ABILITY').recordType='ABILITY';});

// The static Glossary discloses both source-backed alternatives. It has no
// army context and must never choose one role or present both as unconditional.
const catoCanonical='unit-sm-02d5dee4717544ad',marneusCanonical='unit-sm-1af70808102d4286';
const catoId=entry('space-marines',catoCanonical).id;
const centralCatoRelations=[...catalog.leaderEligibilityRecords,...catalog.supportEligibilityRecords]
  .filter(record=>record.roleConditionProvenance?.armyRule?.ownerUnitId===catoCanonical);
assert.equal(centralCatoRelations.length,2);
function verifyConditionalRoles(publication){
  const cato=publication.entries.find(article=>article.id===catoId);
  const marneus=publication.entries.find(article=>article.sourceOwner.bookId==='space-marines'&&article.sourceOwner.canonicalId===marneusCanonical);
  const relations=[...cato.mfm.leaderRelations,...cato.mfm.supportRelations];
  for(const expected of centralCatoRelations){
    const actual=relations.find(record=>record.id===expected.id);assert.ok(actual);
    assert.deepEqual(actual.roleCondition,expected.roleCondition,'Conditional role predicate changed');
    assert.deepEqual(actual.roleConditionProvenance,expected.roleConditionProvenance,'Conditional role lost exact source proof');
  }
  const lines=createGlobalGlossaryContent(publication).project(cato).mfm.lines;
  assert.ok(lines.includes('Leader (conditional; '+marneus.label+' absent in army): Victrix Honour Guard'));
  assert.ok(lines.includes('Support (conditional; '+marneus.label+' present in army): Victrix Honour Guard'));
  assert.ok(lines.includes('Army context not evaluated.'));
  assert.ok(lines.includes('Condition source: '+centralCatoRelations[0].roleConditionProvenance.armyRule.sourceText));
  assert.ok(!lines.some(line=>/^Leader:|^Support:/.test(line)),'No unconditional Cato role without army context');
}
verifyConditionalRoles(index);
for(const mutate of [
  publication=>{delete publication.entries.find(article=>article.id===catoId).mfm.leaderRelations[0].roleConditionProvenance;},
  publication=>{publication.entries.find(article=>article.id===catoId).mfm.leaderRelations[0].roleCondition.expectedPresent=true;},
  publication=>{publication.entries.find(article=>article.id===catoId).mfm.supportRelations[0].roleConditionProvenance.armyRule.triggerUnitId=catoCanonical;},
  publication=>{delete publication.entries.find(article=>article.id===catoId).mfm.supportRelations[0].roleCondition;}
]){const copy=structuredClone(index);mutate(copy);rejected(()=>verifyConditionalRoles(copy),'lost/misleading conditional role proof');}
const noConditionProof=structuredClone(index),noProofCato=noConditionProof.entries.find(article=>article.id===catoId);
delete noProofCato.mfm.leaderRelations[0].roleConditionProvenance;
const unresolvedRoleLines=createGlobalGlossaryContent(noConditionProof).project(noProofCato).mfm.lines;
assert.ok(unresolvedRoleLines.includes('Leader (conditional; source condition unresolved): Victrix Honour Guard'));
assert.ok(!unresolvedRoleLines.some(line=>/^Leader:/.test(line)));
const pbcArticle=publication=>publication.entries.find(record=>record.id===pbcId);
annotationMutation('removed field-level provenance after rebuild',publication=>{delete pbcArticle(publication).fieldProvenance;});
annotationMutation('wrong exact official page',publication=>{pbcArticle(publication).fieldProvenance['blocks/0/text'].page=7;});
annotationMutation('removed canonical FAQ qualification',publication=>{delete pbcArticle(publication).facts.qualifications;});
annotationMutation('FAQ data present but owner presentation loses it',publication=>{delete pbcArticle(publication).facts.semanticContent;},verifyFAQPresentation);
annotationMutation('FAQ not searchable',publication=>{pbcArticle(publication).searchableContent=pbcArticle(publication).label;},verifyFAQPresentation);
annotationMutation('wrong FAQ owner',publication=>{pbcArticle(publication).parent.canonicalId='unit-chaos-rhino';},verifyFAQPresentation);
const legionaryId=entry('chaos-space-marines','datasheet-legionaries:profile:1').id;
const profile=publication=>publication.entries.find(record=>record.id===legionaryId);
publicationMutation('stale numerical value',publication=>{profile(publication).facts.canonicalData.stats.T='4';});
publicationMutation('missing owner',publication=>{publication.entries=publication.entries.filter(record=>record.id!==legionaryId);});
publicationMutation('extra/duplicate owner',publication=>{publication.entries.push(structuredClone(profile(publication)));});
publicationMutation('wrong canonical owner',publication=>{profile(publication).sourceOwner.bookId='death-guard';});
publicationMutation('lost provenance',publication=>{profile(publication).provenance=[];});
publicationMutation('wrong displayed normalized profile',publication=>{profile(publication).facts.stats.T='4';});
publicationMutation('wrong MFM points',publication=>{publication.entries.find(record=>record.mfm?.pointRecords?.length).mfm.pointRecords[0].pointSchedules[0].entries[0].value++;});
publicationMutation('wrong MFM source version',publication=>{publication.entries.find(record=>record.mfm?.pointRecords?.length).mfm.pointRecords[0].provenance.sourceVersion='v1.5';});
publicationMutation('wrong canonical caption',publication=>{profile(publication).label='Wrong profile';});
publicationMutation('stale EC official profile',publication=>{publication.entries.find(record=>record.sourceOwner.bookId==='emperors-children'&&record.sourceOwner.canonicalId==='datasheet-noise-marines:profile:1').facts.canonicalData.stats.W='2';});
publicationMutation('EC ability lost formation timing',publication=>{publication.entries.find(record=>record.id===host.id).facts.canonicalData.blocks[0].text='This model has Infiltrators.';});
const changedModels=structuredClone(inputs.armyModels),changedModel=changedModels.find(model=>model.book.id==='chaos-space-marines');
changedModel.entities.find(entity=>entity.id==='datasheet-legionaries:profile:1').data.stats.T='4';
rejected(()=>assertV2ArmyBookParity(changedModels),'canonical/Army Book mismatch');
const wrongOwner=structuredClone(inputs.armyModels);
wrongOwner.find(model=>model.book.id==='chaos-space-marines').entities.find(entity=>entity.id==='datasheet-legionaries:profile:1').ownerId='unit-chaos-lord';
rejected(()=>assertV2ArmyBookParity(wrongOwner),'canonical/Army Book wrong owner');
rejected(()=>assertV2ArmyBookParity(inputs.armyModels,{published:bookId=>{
  const payload=structuredClone(inputs.armyModels.find(model=>model.book.id===bookId).appPayload);
  payload.factManifest[0].value='STALE';return payload;
}}),'stale Army Book projection');
const changedInputs={...inputs,armyModels:structuredClone(inputs.armyModels)};
const changedSource=changedInputs.armyModels.find(model=>model.book.id==='chaos-space-marines');
changedSource.entities.find(entity=>entity.id==='datasheet-legionaries:profile:1').data.stats.T='4';
changedSource.appPayload.factManifest.find(field=>field.entityId==='datasheet-legionaries:profile:1'&&field.path.join('/')==='stats/T').value='4';
changedSource.appPayload.cards.find(card=>card.id==='datasheet-legionaries:profile:1').fields.find(field=>field.source.path==='/stats/T').value='4';
assertV2ArmyBookParity(changedInputs.armyModels,{published:bookId=>changedInputs.armyModels.find(model=>model.book.id===bookId).appPayload});
rejected(()=>assertGlossaryV2Parity(index,changedInputs),'source change with matching fresh Army Book cannot leave old Glossary');
const changedECInputs={...inputs,armyModels:structuredClone(inputs.armyModels)};
const changedEC=changedECInputs.armyModels.find(model=>model.book.id==='emperors-children');
changedEC.entities.find(entity=>entity.id==='datasheet-noise-marines:profile:1').data.stats.W='2';
changedEC.appPayload.factManifest.find(field=>field.entityId==='datasheet-noise-marines:profile:1'&&field.path.join('/')==='stats/W').value='2';
changedEC.appPayload.cards.find(card=>card.id==='datasheet-noise-marines:profile:1').fields.find(field=>field.source.path==='/stats/W').value='2';
assertV2ArmyBookParity(changedECInputs.armyModels,{published:bookId=>changedECInputs.armyModels.find(model=>model.book.id===bookId).appPayload});
rejected(()=>assertGlossaryV2Parity(index,changedECInputs),'fresh EC source/Army Book cannot leave old Glossary');
const digest=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const artifacts=['index.en.json','index.en.js'].map(name=>path.join(repo,'glossary/v2/generated',name));
const beforeHashes=artifacts.map(digest),temporary=createQaTempDir('v2-glossary-stale-');
try{
  const stale=structuredClone(index);stale.entries.find(record=>record.sourceOwner.bookId==='emperors-children'&&record.sourceOwner.canonicalId==='datasheet-noise-marines:profile:1').facts.canonicalData.stats.W='2';
  const publicationFile=path.join(temporary,'stale-index.json');fs.writeFileSync(publicationFile,JSON.stringify(stale));
  let error;try{execFileSync(process.execPath,['glossary/v2/tools/build-glossary-v2.mjs','--core-only','--check','--publication='+publicationFile],{cwd:repo,encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:16*1024*1024});}catch(cause){error=cause;}
  assert.ok(error&&error.status!==0&&/Stale non-Core factual publication/.test(error.stderr||''),'Scoped CLI failed to reject stale Army publication');mutations++;
}finally{
  assert.ok(path.resolve(temporary).startsWith(path.resolve(getQaTmpRoot())+path.sep),'Unexpected temporary cleanup path');
  cleanupQaTempDir(temporary);
}
assert.deepEqual(artifacts.map(digest),beforeHashes,'Scoped --check modified generated publications');
console.log(JSON.stringify({status:'PASS',armyBooks:V2_ARMY_BOOK_IDS,canonicalOwners:canonicalFacts,dgFieldProvenance:75,pbcFAQOwnerAndNamedPopup:true,csmOfficialProfiles:Object.keys(csmExpected).length,ecOfficialModels:Object.keys(ecModels).length,ecOfficialWeapons:Object.keys(ecWeapons).length,mfmRecords:augmented.size,sourceOwnedDependencies:dependencyPoints.length,coreRecords:expectedCore.length,missionRecords:expectedMissionIds.size,mutationControls:mutations}));
