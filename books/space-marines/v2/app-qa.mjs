import {parseSourceFixtureJSON,sourceFixture} from '../../../tests/helpers/source-refs-fixtures.mjs';
import {sourceSnapshot,sourceDeclarationView} from '../../shared/source-refs-v2/source-refs.mjs';
/** Focused application assembly guard. Independent source identities and values
 * stay on the accepted factual owner; this verifies their presentation routes. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {buildApp,writeApp,assertSpaceMarinesAppSourceReview} from './app-build.mjs';
import {buildGameplayPresentation} from './gameplay-presentation-build.mjs';
import {registration} from './registration.mjs';
const read=name=>parseSourceFixtureJSON(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
// Compare the publication JSON domain: undefined constructor placeholders are
// omitted by the existing JSON writer; every recorded value is retained.
const publicationView=value=>JSON.parse(JSON.stringify(sourceDeclarationView(value)));
const facts=read('./generated/effective.json'),payload=buildApp(),native=publicationView(buildGameplayPresentation());
const cards=new Map(payload.cards.map(card=>[card.id,card])),original=new Map(native.cards.map(card=>[card.id,card]));
assert.equal(cards.size,payload.cards.length);
// Native publication and the resolution closure of imported references are
// separate sets. These exact references retain their existing canonical owners.
const referenceIds=['detachment-dw-c015c08e99c14972','detachment-rule-dw-b41deacc51464866','mfm-detachment-68a77cb979c24615'];
const referenceSource=publicationView(read('./generated/deathwatch-mfm-presentation.json'));
const cross=read('./generated/cross-owner-references.json'),importBook=read('./generated/roster-import.json');
assert.equal(original.size,2325);
function assertReferenceBoundary(view,book=importBook){
  view=publicationView(view);book=sourceDeclarationView(book);
  const index=new Map(view.cards.map(card=>[card.id,card]));
  assert.equal(index.size,view.cards.length,'Duplicate app identity');
  assert.deepEqual(view.cards.filter(card=>original.has(card.id)),native.cards,'Native presentation changed');
  assert.deepEqual(view.factManifest.filter(field=>original.has(field.cardId)),native.factManifest,'Native ownership changed');
  assert.deepEqual(view.cards.filter(card=>!original.has(card.id)).map(card=>card.id).sort(),[...referenceIds].sort(),'Unexpected reference cards');
  assert.deepEqual(view.factManifest.filter(field=>!original.has(field.cardId)),referenceSource.factManifest.filter(field=>referenceIds.includes(field.cardId)));
  assert.deepEqual(view.groups,native.groups,'Reference enrolled in native browsing');
  assert.deepEqual(view.ruleContractIds,native.ruleContractIds,'Reference enrolled for execution');
  for(const row of view.relatedRules.rows)assert.ok(!referenceIds.includes(row.ruleId)&&!referenceIds.includes(row.detachmentId),'Reference enrolled as a related gameplay rule');
  for(const id of referenceIds){
    const card=index.get(id),source=referenceSource.cards.find(row=>row.id===id);
    assert.deepEqual(card.identity,{registryId:id===referenceIds[2]?'mfm':'deathwatch',canonicalId:id});
    for(const key of ['kind','parentId','provenance','fields'])assert.deepEqual(key==='provenance'?sourceSnapshot(card):card[key],key==='provenance'?sourceSnapshot(source):source[key],'Reference source changed: '+key);
    assert.deepEqual(card.children,source.children.filter(child=>referenceIds.includes(child)));
    assert.deepEqual(card.links,source.links.filter(link=>referenceIds.includes(link.targetId)));
    assert.ok(!card.ruleContract,'Executable reference card');
  }
  assert.ok(index.get(referenceIds[2]).fields.some(field=>field.source.path==='/detachmentPoints'&&field.value===1));
  const expectedMembership=referenceIds.slice(0,2).map(id=>{
    const entity=cross.entities.find(row=>row.id===id);
    assert.equal(entity.bookId,'deathwatch');
    return {id,bookId:entity.bookId,sourceEntityId:entity.sourceEntityId};
  });
  assert.deepEqual(book.canonicalMembership.filter(row=>row.bookId!=='space-marines'),expectedMembership);
  assert.deepEqual(book.entities.filter(row=>row.bookId!=='space-marines').map(row=>row.id).sort(),referenceIds.slice(0,2).sort());
  for(const id of referenceIds.slice(0,2)){
    const entity=book.entities.find(row=>row.id===id),source=cross.entities.find(row=>row.id===id);
    assert.equal(entity.bookId,'deathwatch');assert.equal(entity.kind,source.kind);
    assert.equal(entity.sourceEntityId,source.sourceEntityId);assert.deepEqual(sourceSnapshot(entity),sourceSnapshot(source));
    assert.ok(!entity.ruleContract,'Executable reference entity');
    const record=view.bookPresentation.records[id];
    assert.ok(!record.enhancementIds?.length&&!record.stratagemIds?.length,'Foreign assignments enrolled');
  }
  assert.equal(book.rosterDetachmentReferenceReview.execution,'TEXT_ONLY_SOURCE_BACKED');
  assert.equal(book.rosterDetachmentReferenceReview.legality,'NOT_ASSESSED');
  for(const card of view.cards)for(const id of [...card.children||[],...(card.links||[]).map(link=>link.targetId),...(card.fields||[]).flatMap(field=>field.targetIds||[])])assert.ok(index.has(id),'Unresolved reference target');
}
assertReferenceBoundary(payload);
// Mutations exercise the same boundary as the positive check. No production
// fixture, canonical fact or pre-existing gameplay expectation is changed.
let negativeGuards=0;
const reject=(view,book)=>{assert.throws(()=>assertReferenceBoundary(view,book),assert.AssertionError);negativeGuards++;};
const changeCard=(id,patch)=>({...payload,cards:payload.cards.map(card=>{
  if(card.id!==id)return card;
  const changed=structuredClone(card),ordinary={...patch};
  if(Object.hasOwn(ordinary,'provenance')){sourceFixture(changed).provenance=ordinary.provenance;delete ordinary.provenance;}
  return {...changed,...ordinary};
})});
reject({...payload,cards:payload.cards.filter(card=>card.id!==native.cards[0].id)});
reject(changeCard(native.cards[0].id,{title:'Unreviewed native change'}));
for(const kind of ['DATASHEET','ENHANCEMENT','STRATAGEM','DETACHMENT_RULE'])
  reject({...payload,cards:[...payload.cards,{id:'unreviewed-foreign-reference',kind,identity:{registryId:'deathwatch'}}]});
reject(changeCard(referenceIds[0],{identity:{registryId:'space-marines',canonicalId:referenceIds[0]}}));
reject(changeCard(referenceIds[0],{provenance:{sourceId:'unreviewed'}}));
reject(changeCard(referenceIds[2],{fields:[]}));
reject({...payload,ruleContractIds:[...payload.ruleContractIds,referenceIds[1]]});
reject({...payload,groups:payload.groups.map((group,i)=>i?group:{...group,itemIds:[...group.itemIds,referenceIds[0]]})});
reject({...payload,relatedRules:{...payload.relatedRules,rows:[...payload.relatedRules.rows,{ruleId:referenceIds[1],detachmentId:referenceIds[0]}]}});
reject(payload,{...importBook,canonicalMembership:importBook.canonicalMembership.filter(row=>row.id!==referenceIds[0])});
reject(payload,{...importBook,entities:importBook.entities.map(row=>row.id===referenceIds[1]?{...row,ruleContract:{unreviewed:true}}:row)});
for(const entity of facts.entities){
  const card=cards.get(entity.id);assert.ok(card,'Missing canonical app card '+entity.id);
  assert.equal(card.parentId,entity.parentId);assert.deepEqual(sourceSnapshot(card),sourceSnapshot(entity));
  for(const field of card.fields)assert.ok(field.source?.entityId&&field.source?.path,'Unowned field');
}
const expected={DATASHEET:85,DETACHMENT:21,DETACHMENT_RULE:24,STRATAGEM:84};
for(const [kind,count]of Object.entries(expected))assert.equal(payload.cards.filter(card=>original.has(card.id)&&card.kind===kind).length,count);
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
  referenceCards:referenceIds.length,negativeGuards,
  datasheets:85,detachments:21,detachmentRuleBlocks:24,enhancements:47,upgrades:9,stratagems:84,
  paidOptions:8,relatedRules:payload.relatedRules.rows.length,coverAssets:2,sourceCompleteness:'PARTIAL',
  semanticCompleteness:'NOT_PROVEN',realNewRecruitExportTested:false,
  appSha256:crypto.createHash('sha256').update(fs.readFileSync(new URL('./generated/app-presentation.json',import.meta.url))).digest('hex')}));
