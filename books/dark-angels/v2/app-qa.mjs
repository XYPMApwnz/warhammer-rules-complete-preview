/** Native application wiring only; no browser or full semantic certification. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {buildApp,assertDarkAngelsAppSourceReview} from './app-build.mjs';
import {registration} from './registration.mjs';
import {armyBooks} from '../../../v2/army-books.mjs';
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const facts=read('./generated/effective.json'),sm=read('../../space-marines/v2/generated/effective.json');
const before=JSON.stringify([facts,sm]),payload=buildApp(),cards=new Map(payload.cards.map(card=>[card.id,card]));
const membership=read('./inherited-sm-references.json'),checks=[];
const check=(id,fn)=>{fn();checks.push({id,status:'PASS'});};
check('standard-eight-book-registration-and-existing-assets',()=>{
 assert.equal(armyBooks.length,8);assert.equal(new Set(armyBooks.map(book=>book.id)).size,8);
 assert.equal(armyBooks.at(-1),registration);assert.equal(registration.id,'dark-angels');assert.equal(payload.book.id,registration.id);
 assert.ok(fs.statSync(fileURLToPath(registration.home.cover)).size>0);
 assert.ok(fs.statSync(new URL(payload.bookPresentation.coverImage,registration.assetBaseURL)).size>0);
 assert.ok(registration.styles.every(url=>fs.statSync(fileURLToPath(url)).size>0));
});
check('exact-source-owned-corpus-and-inherited-identities',()=>{
 const ds=payload.cards.filter(card=>card.kind==='DATASHEET');assert.equal(ds.length,83);
 assert.equal(ds.filter(card=>card.identity.registryId==='dark-angels').length,16);
 assert.equal(ds.filter(card=>card.identity.registryId==='space-marines').length,67);
 for(const card of ds){const source=[...facts.entities,...sm.entities].find(row=>row.id===card.id);assert.ok(source);
  assert.equal(card.identity.canonicalId,source.id);assert.equal(card.identity.registryId,source.bookId);assert.deepEqual(card.provenance,source.provenance);}
 for(const row of membership.excludedOtherChapterDatasheets)assert.ok(!cards.has(row.canonicalId));
 assert.equal(payload.groups.find(group=>group.id==='army-rules').itemIds.length,5);
 assert.equal(payload.groups.find(group=>group.id==='detachments').itemIds.length,18);
 const assignments=payload.cards.filter(card=>card.kind==='ENHANCEMENT');assert.equal(assignments.length,40);
 assert.equal(assignments.filter(card=>card.fields.some(field=>field.source?.path==='/itemKind'&&field.value==='UNIT_UPGRADE')).length,10);
 assert.equal(payload.cards.filter(card=>card.kind==='STRATAGEM').length,60);
});
check('all-reference-and-related-rule-targets-resolve',()=>{
 for(const card of payload.cards)for(const id of [...card.children||[],...(card.links||[]).map(link=>link.targetId),...(card.fields||[]).flatMap(field=>field.targetIds||[])])assert.ok(cards.has(id),'Missing target '+id);
 assert.equal(payload.relatedRules.rows.length,83*100);
 for(const row of payload.relatedRules.rows){assert.equal(cards.get(row.ruleId).parentId,row.detachmentId);assert.equal(row.state,'UNKNOWN');}
});
check('limitations-and-source-review-stay-honest',()=>{
 const result=assertDarkAngelsAppSourceReview();assert.equal(result.status,'PARTIAL');assert.equal(result.classifications.UNVERIFIED,320);
 assert.equal(result.semanticCompleteness,'NOT_PROVEN');assert.equal(payload.rulePresentationLimitations.realNewRecruitExportTested,false);
 assert.equal(payload.rulePresentationLimitations.mfmReferenceOnly,10);
 assert.ok(payload.rulePresentationLimitations.importLimitations.some(row=>row.ownerId==='dark-angels'&&row.message.includes('unconfirmed Dark Angels army context')));
 assert.equal(cards.get('unit-da-efa93d33ea414d8b8f11').identity.registryId,'dark-angels');
 assert.equal(payload.rulePresentationLimitations.importLimitations[1].ownerId,'dark-angels');
 assert.ok(!payload.rulePresentationLimitations.importLimitations.some(row=>/Lazarus.*source conflict/i.test(row.message)));
 assert.equal(JSON.stringify([facts,sm]),before);
});
console.log(JSON.stringify({status:'PASS',checks,coverage:{datasheets:83,owned:16,inherited:67,armyRules:5,detachments:18,enhancements:30,upgrades:10,stratagems:60},
 sourceCompleteness:'PARTIAL',semanticCompleteness:'NOT_PROVEN',realNewRecruitExportTested:false,browserVerified:false},null,2));
