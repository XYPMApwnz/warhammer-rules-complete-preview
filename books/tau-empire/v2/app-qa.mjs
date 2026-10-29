import {parseSourceFixtureJSON} from '../../../tests/helpers/source-refs-fixtures.mjs';
import {sourceSnapshot} from '../../shared/source-refs-v2/source-refs.mjs';
/** Targeted isolated presentation parity, fail-closed controls and adapter checks. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {buildApp,writeApp,assertTauAppSourceReview} from './app-build.mjs';
import {buildTauImportBook} from './roster-import-build.mjs';
import {createTauBrowserRoster} from './roster-boot.mjs';
import {resolveOwnedFact} from './mfm-boundary.mjs';
import {validateGlossary} from '../../shared/army-book-app-v2/glossary.mjs';
import {assertSourceCompletenessGate,captureSourceReview} from '../../shared/roster-v2/source-completeness.mjs';
const read=name=>parseSourceFixtureJSON(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const book=buildTauImportBook(),original=JSON.stringify(book),facts=read('./generated/effective.json'),index=new Map(facts.entities.map(e=>[e.id,e]));
const payload=writeApp({check:true}),cards=new Map(payload.cards.map(c=>[c.id,c]));
assert.equal(cards.size,payload.cards.length,'Duplicate canonical presentation card');
for(const [kind,count]of [['DATASHEET',43],['PROFILE',44],['DETACHMENT',7],['DETACHMENT_RULE',9],['ENHANCEMENT',23],['STRATAGEM',31]])assert.equal(payload.cards.filter(c=>c.kind===kind).length,count,kind+' count');
assert.equal(payload.book.mfmVersion,'v1.6');
const value=(source,path)=>path.slice(1).split('/').reduce((current,key)=>current?.[key.replaceAll('~1','/').replaceAll('~0','~')],source);
export function assertPresentationParity(candidate){
  const seen=new Set();
  for(const card of candidate.cards)for(const field of card.fields){
    if(!index.has(field.source.entityId)&&!field.source.entityId.startsWith('mfm-'))continue;
    const owner=index.get(field.source.entityId)||resolveOwnedFact(field.source.entityId);
    assert.deepEqual(field.value,value(owner.data||owner,field.source.path),'Factual presentation mismatch '+field.id);seen.add(field.id);
  }
  for(const e of facts.entities){
    const card=candidate.cards.find(c=>c.id===e.id);assert.ok(card,'Missing canonical presentation '+e.id);
    assert.deepEqual(sourceSnapshot(card),sourceSnapshot(e),'Missing source provenance');
    assert.deepEqual(sourceSnapshot(card,{slot:'fieldProvenance'}),sourceSnapshot(e,{slot:'fieldProvenance'})||{},'Missing official field provenance');
    for(const [i,block]of(e.data.blocks||[]).entries())if(typeof block.text==='string')assert.ok(seen.has(e.id+'::/blocks/'+i+'/text'),'Missing source block '+e.id);
    if(typeof e.data.text==='string')assert.ok(seen.has(e.id+'::/text'),'Missing canonical text '+e.id);
    if(e.kind==='WEAPON_PROFILE')for(const key of ['range','attacks','skill','strength','ap','damage'])assert.ok(seen.has(e.id+'::/'+key),'Missing weapon characteristic');
    if(e.kind==='MODEL_PROFILE')for(const key of Object.keys(e.data.stats))assert.ok(seen.has(e.id+'::/stats/'+key),'Missing model characteristic');
  }return true;
}
assertPresentationParity(payload);validateGlossary(payload.glossary,payload.cards);
for(const e of facts.entities.filter(e=>e.kind==='RULE_REFERENCE')){
  const field=cards.get(e.id).fields.find(f=>f.source.path==='/label'),binding=payload.datasheetPresentation.referenceBindings.fields[field.id];
  assert.equal(binding.length,1);assert.ok(cards.has(binding[0].targetId));assert.equal(binding[0].end,e.data.label.length);
}
for(const e of facts.entities.filter(e=>['ERRATA','FAQ'].includes(e.kind)))assert.ok(payload.groups.find(g=>g.id==='updates').itemIds.includes(e.id),'Unreachable official update');
for(const e of facts.entities.filter(e=>e.kind==='DETACHMENT')){
  const record=payload.bookPresentation.records[e.id];assert.deepEqual(record.ruleIds||[record.ruleId],e.data.ruleIds);
  assert.deepEqual(record.enhancementIds,e.data.enhancementIds);assert.deepEqual(record.stratagemIds,e.data.stratagemIds);assert.ok(record.pointRecordId);
}
assert.deepEqual(payload.groups.find(g=>g.id==='equipment').itemIds,facts.entities.filter(e=>e.kind==='EQUIPMENT_RULE').map(e=>e.id));
assert.equal(assertTauAppSourceReview(book).semanticCompleteness,'NOT_PROVEN');
let mutations=0;
const wrong=structuredClone(payload),weapon=wrong.cards.find(c=>c.kind==='WEAPON_PROFILE');weapon.fields.find(f=>f.source.path==='/strength').value='999';assert.throws(()=>assertPresentationParity(wrong),/Factual presentation mismatch/);mutations++;
const missing=structuredClone(payload),enhancement=missing.cards.find(c=>c.kind==='ENHANCEMENT');enhancement.fields=enhancement.fields.filter(f=>f.source.path!=='/text');assert.throws(()=>assertPresentationParity(missing),/Missing canonical text/);mutations++;
const duplicate=structuredClone(book);duplicate.entities.push(structuredClone(duplicate.entities[0]));assert.throws(()=>buildApp(duplicate),/Duplicate canonical entity/);mutations++;
const review=read('./app-source-review.json'),inputs={review,books:[{bookId:'tau-empire',facts,executionBook:book,sourceReview:captureSourceReview('tau-empire',facts)}],expectations:[],registeredBookIds:[],checkAllRegistrations:false};
const changed=structuredClone(inputs);changed.books[0].facts.entities.find(e=>e.kind==='ENHANCEMENT').data.text+=' changed';assert.throws(()=>assertSourceCompletenessGate(changed),/UNREVIEWED_SOURCE_BLOCK/);mutations++;
const added=structuredClone(inputs);const addedEntity=structuredClone(added.books[0].facts.entities[0]);addedEntity.id+='-unreviewed';added.books[0].facts.entities.push(addedEntity);assert.throws(()=>assertSourceCompletenessGate(added),/UNREVIEWED_SOURCE_RULE/);mutations++;
// Existing Stage 4 constructed format: aggregate quantity2 remains the input authority.
const prototypeText=['+ FACTION KEYWORD: T’au Empire','+ DETACHMENT: Experimental Prototype Cadre','1x Commander In Coldstar Battlesuit (100 pts)','• 1x Commander in Coldstar Battlesuit: 2x T’au flamer','Enhancement: Thermoneutronic Projector',''].join('\n');
const service=createTauBrowserRoster(book);assert.equal(service.import(prototypeText).status,'READY');
const unit=service.state.units[0],choice=service.sourceChoices(unit.instanceId)[0];assert.ok(choice.options.length);service.setSourceChoice(unit.instanceId,choice.id,choice.options[0].id);
let effective=service.effective(unit.instanceId),weapons=effective.weapons.filter(w=>w.id==='datasheet-commander-in-coldstar-battlesuit:weapon:9');
assert.equal(weapons.length,2);assert.deepEqual(weapons.map(w=>w.physicalQuantity),[1,1]);assert.deepEqual(weapons.map(w=>w.fields.find(f=>f.label==='strength')?.value),['6','4']);
assert.deepEqual(weapons.map(w=>w.fields.find(f=>f.label==='range')?.value),['18"','18"']);
const snapshot=service.snapshot();service.load(snapshot);assert.deepEqual(service.snapshot(),snapshot);service.setSourceChoice(unit.instanceId,choice.id,null);
assert.equal(service.effective(unit.instanceId).weapons.filter(w=>w.id==='datasheet-commander-in-coldstar-battlesuit:weapon:9').length,1);
service.setSourceChoice(unit.instanceId,choice.id,choice.options[0].id);assert.equal(service.import(prototypeText).status,'READY');assert.deepEqual(service.snapshot(),snapshot,'Reimport lost confirmed source choice');
assert.throws(()=>service.setSourceChoice(unit.instanceId,choice.id,'invented'),/Unconfirmed/);assert.deepEqual(service.snapshot(),snapshot);
assert.equal(JSON.stringify(book),original,'Presentation/adapter mutated factual input');
console.log(JSON.stringify({status:'PASS',datasheets:43,profiles:44,detachments:7,detachmentRules:9,enhancements:23,stratagems:31,sourceBlocks:744,mutationControls:mutations,adapter:'prototype-aggregate-choice-remove-reimport-snapshot',sourceCompleteness:'PARTIAL_STRUCTURAL_ONLY',frontendVerified:false,REAL_NEW_RECRUIT_EXPORT_TESTED:false}));
