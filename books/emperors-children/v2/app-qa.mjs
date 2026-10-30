import {parseSourceFixtureJSON} from '../../../tests/helpers/source-refs-fixtures.mjs';
/** Bounded presentation parity and fail-closed controls; no source re-audit. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildApp,writeApp} from './app-build.mjs';
import {buildECContracts} from './rule-contract-build.mjs';
import {resolveOwnedFact} from './mfm-boundary.mjs';
import {validateGlossary} from '../../shared/army-book-app-v2/glossary.mjs';
import {registration} from './registration.mjs';
const read=name=>parseSourceFixtureJSON(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const built=buildECContracts(),before=JSON.stringify(built),payload=writeApp({check:true});
const facts=read('./generated/effective.json'),index=new Map(facts.entities.map(entity=>[entity.id,entity]));
const cards=new Map(payload.cards.map(card=>[card.id,card]));
assert.equal(cards.size,payload.cards.length,'Duplicate canonical card');
for(const [kind,count]of [['DATASHEET',23],['DETACHMENT',10],['ARMY_RULE',2],['ENHANCEMENT',34],['STRATAGEM',51]])
  assert.equal(payload.cards.filter(card=>card.kind===kind).length,count,kind+' inventory');
assert.equal(payload.ruleContractIds.length,26);assert.equal(payload.book.mfmVersion,'v1.6');
const value=(source,path)=>path.slice(1).split('/').reduce((current,key)=>current?.[key.replaceAll('~1','/').replaceAll('~0','~')],source);
export function assertPresentationParity(candidate){
  const seen=new Set();
  for(const card of candidate.cards)for(const field of card.fields){
    if(!index.has(field.source.entityId)&&!field.source.entityId.startsWith('mfm-'))continue;
    const owner=index.get(field.source.entityId)||resolveOwnedFact(field.source.entityId);
    assert.deepEqual(field.value,value(owner.data||owner,field.source.path),'Factual presentation mismatch '+field.id);
    seen.add(field.id);
  }
  for(const entity of facts.entities.filter(entity=>['DATASHEET_SECTION','WARGEAR_OPTION','ENHANCEMENT','STRATAGEM','MODEL_PROFILE','WEAPON_PROFILE','COMPOSITION_MEMBER'].includes(entity.kind))){
    const card=candidate.cards.find(card=>card.id===entity.id);assert.ok(card,'Missing canonical presentation '+entity.id);
    for(const [i,block]of (entity.data.blocks||[]).entries())if(typeof block.text==='string')assert.ok(seen.has(entity.id+`::/blocks/${i}/text`),'Missing source block '+entity.id);
    if(entity.kind==='COMPOSITION_MEMBER')assert.ok(seen.has(entity.id+'::/sourceText'),'Missing composition member '+entity.id);
    if(typeof entity.data.text==='string')assert.ok(seen.has(entity.id+'::/text'),'Missing canonical rule text '+entity.id);
    if(entity.kind==='WEAPON_PROFILE')for(const key of ['range','attacks','skill','strength','ap','damage'])assert.ok(seen.has(entity.id+'::/'+key),'Missing weapon characteristic');
  }
  return true;
}
assertPresentationParity(payload);
for(const section of facts.entities.filter(entity=>entity.kind==='DATASHEET_SECTION'&&entity.data.memberIds?.length)){
  const card=cards.get(section.id);for(const id of section.data.memberIds)assert.ok(card.fields.some(field=>field.source.entityId===id&&field.source.path==='/sourceText'));
}
for(const entity of facts.entities.filter(entity=>entity.kind==='MODEL_PROFILE'))for(const key of Object.keys(entity.data.stats)){
  const field=cards.get(entity.id).fields.find(field=>field.source.path==='/stats/'+key);assert.ok(field);assert.equal(field.presentationPath,'/'+key);
}
for(const entity of facts.entities.filter(entity=>entity.kind==='RULE_REFERENCE')){
  const card=cards.get(entity.id),field=card.fields.find(field=>field.source.path==='/label'),bindings=payload.datasheetPresentation.referenceBindings.fields[field.id];
  assert.equal(bindings.length,1);assert.ok(cards.has(bindings[0].targetId));assert.equal(bindings[0].end,entity.data.label.length);
}
for(const entity of facts.entities.filter(entity=>['FAQ','ERRATA','SOURCE_UPDATE_REFERENCE'].includes(entity.kind)))
  assert.ok(payload.groups.find(group=>group.id==='updates').itemIds.includes(entity.id),'Unreachable official update');
for(const entity of facts.entities.filter(entity=>entity.kind==='DETACHMENT')){
  const record=payload.bookPresentation.records[entity.id];assert.deepEqual(record.enhancementIds,entity.data.enhancementIds);assert.deepEqual(record.stratagemIds,entity.data.stratagemIds);
  const rule=cards.get(record.ruleId);assert.equal(rule.parentId,entity.id);assert.ok(record.pointRecordId);
}
const upgrades=payload.cards.filter(card=>card.kind==='ENHANCEMENT').flatMap(card=>card.fields.filter(field=>field.presentationPath==='/sourceTypeLabel'));
assert.equal(upgrades.length,3);
for(const field of upgrades){const owner=resolveOwnedFact(field.source.entityId);assert.equal(field.value,value(owner,field.source.path));
  assert.equal(field.displayValue,field.value.slice(field.sourceSpan.start,field.sourceSpan.end));assert.equal(field.displayValue,'Upgrade');}
const table=facts.entities.find(entity=>entity.kind==='STRUCTURED_RULE_TABLE');
assert.equal(cards.get(table.parentId).fields.filter(field=>field.presentation==='table-cell').length,table.data.rows.flat().length);
validateGlossary(payload.glossary,payload.cards);
assert.equal(registration.id,facts.bookId);assert.ok(registration.styles[0].endsWith('/theme.css'));
assert.ok(fs.existsSync(new URL('../assets/emperors-children-cover-800.webp',import.meta.url)));
assert.ok(fs.existsSync(new URL('../assets/emperors-children-cover-480.webp',import.meta.url)));
assert.equal(payload.attachmentAdjudications.length,1);assert.equal(payload.attachmentAdjudications[0].applied,false);
assert.equal(JSON.stringify(built),before,'Presentation mutated source owner');
let mutations=0;
const mismatch=structuredClone(payload);mismatch.cards.find(card=>card.id==='datasheet-noise-marines:profile:1').fields.find(field=>field.source.path==='/stats/W').value='2';
assert.throws(()=>assertPresentationParity(mismatch),/Factual presentation mismatch/);mutations++;
const missing=structuredClone(payload);missing.cards.find(card=>card.id==='datasheet-lord-exultant:section:4').fields=missing.cards.find(card=>card.id==='datasheet-lord-exultant:section:4').fields.filter(field=>field.source.path!=='/blocks/0/text');
assert.throws(()=>assertPresentationParity(missing),/Missing source block/);mutations++;
const duplicate=buildECContracts();duplicate.book.entities.push(structuredClone(duplicate.book.entities[0]));assert.throws(()=>buildApp(duplicate),/Duplicate canonical entity/);mutations++;
console.log(JSON.stringify({status:'PASS',datasheets:23,detachments:10,enhancements:34,stratagems:51,contracts:26,
  compositionMembers:30,ruleReferences:54,updates:46,mutations,canonicalFactsUnchanged:true,registrationId:registration.id}));
