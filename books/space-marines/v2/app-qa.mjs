/** Focused application assembly guard. Independent source identities and values
 * stay on the accepted factual owner; this verifies their presentation routes. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {buildApp,writeApp,assertSpaceMarinesAppSourceReview} from './app-build.mjs';
import {buildGameplayPresentation} from './gameplay-presentation-build.mjs';
import {registration} from './registration.mjs';
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const facts=read('./generated/effective.json'),payload=buildApp(),native=buildGameplayPresentation();
const cards=new Map(payload.cards.map(card=>[card.id,card])),original=new Map(native.cards.map(card=>[card.id,card]));
assert.equal(cards.size,payload.cards.length);
assert.deepEqual(payload.cards,native.cards,'Application assembly changed native facts/presentation');
assert.deepEqual(payload.factManifest,native.factManifest,'Application assembly changed factual ownership');
for(const entity of facts.entities){
  const card=cards.get(entity.id);assert.ok(card,'Missing canonical app card '+entity.id);
  assert.equal(card.parentId,entity.parentId);assert.deepEqual(card.provenance,entity.provenance);
  for(const field of card.fields)assert.ok(field.source?.entityId&&field.source?.path,'Unowned field');
}
const expected={DATASHEET:85,DETACHMENT:21,DETACHMENT_RULE:24,STRATAGEM:84};
for(const [kind,count]of Object.entries(expected))assert.equal(payload.cards.filter(card=>card.kind===kind).length,count);
const enhancements=facts.entities.filter(row=>row.kind==='ENHANCEMENT');
assert.equal(enhancements.filter(row=>row.data.itemKind==='UNIT_UPGRADE').length,9);
assert.equal(enhancements.filter(row=>row.data.itemKind!=='UNIT_UPGRADE').length,47);
for(const det of facts.entities.filter(row=>row.kind==='DETACHMENT')){
  const record=payload.bookPresentation.records[det.id];
  assert.deepEqual(record.enhancementIds,det.data.enhancementIds);
  assert.deepEqual(record.stratagemIds,det.data.stratagemIds);
  assert.ok(record.pointRecordId&&cards.has(record.pointRecordId));
  for(const id of [...record.enhancementIds,...record.stratagemIds,...(record.ruleIds||[record.ruleId])]){
    assert.equal(cards.get(id)?.parentId,det.id,'Foreign Chapter/Detachment child');
  }
}
assert.equal(payload.groups.find(group=>group.id==='army-rules').itemIds.length,3);
assert.equal(payload.groups.find(group=>group.id==='source-conditions').itemIds.length,2);
assert.equal(payload.relatedRules.rows.length,85*(47+9+84));
for(const row of payload.relatedRules.rows){
  assert.equal(cards.get(row.ruleId).parentId,row.detachmentId);
  assert.equal(row.state,'UNKNOWN');assert.equal(row.selectedDetachment.state,'UNKNOWN');
}
const costCards=payload.cards.filter(card=>card.kind==='MFM_PAID_UPGRADE');assert.equal(costCards.length,8);
for(const card of costCards)assert.ok(card.fields.some(field=>field.source.path==='/value'&&Number.isFinite(field.value)));
assert.equal(payload.book.mfmVersion,'v1.6');
assert.ok(!payload.cards.some(card=>card.provenance?.sourceId?.startsWith('deathwatch')));
assert.equal(payload.sourceCompleteness.status,'PARTIAL');assert.equal(payload.sourceCompleteness.semanticCompleteness,'NOT_PROVEN');
assert.deepEqual(assertSpaceMarinesAppSourceReview(),payload.sourceCompleteness);
assert.equal(payload.rulePresentationLimitations.realNewRecruitExportTested,false);
assert.equal(payload.rulePresentationLimitations.mfmReferenceOnly,21);
assert.equal(payload.rulePresentationLimitations.unprovenChapterKeywordBindings,26);
assert.equal(registration.id,'space-marines');assert.equal(registration.home.shelf.id,'imperium');
for(const url of [registration.home.cover,...registration.styles])assert.ok(fs.existsSync(new URL(url)),'Missing registered asset');
const hero=new URL(payload.bookPresentation.coverImage,registration.assetBaseURL);assert.ok(fs.existsSync(hero),'Missing hero');
const first=JSON.stringify(writeApp({check:true})),second=JSON.stringify(buildApp());assert.equal(first,second,'Nondeterministic app');
console.log(JSON.stringify({status:'PASS',nativeCardsUnchanged:original.size,canonicalCards:facts.entities.length,
  datasheets:85,detachments:21,detachmentRuleBlocks:24,enhancements:47,upgrades:9,stratagems:84,
  paidOptions:8,relatedRules:payload.relatedRules.rows.length,coverAssets:2,sourceCompleteness:'PARTIAL',
  semanticCompleteness:'NOT_PROVEN',realNewRecruitExportTested:false,
  appSha256:crypto.createHash('sha256').update(fs.readFileSync(new URL('./generated/app-presentation.json',import.meta.url))).digest('hex')}));
