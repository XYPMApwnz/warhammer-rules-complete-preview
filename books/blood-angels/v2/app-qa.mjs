import {parseSourceFixtureJSON} from '../../../tests/helpers/source-refs-fixtures.mjs';
import {sourceSnapshot} from '../../shared/source-refs-v2/source-refs.mjs';
/** Native application wiring only; no browser or full semantic certification. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {buildApp,assertBloodAngelsAppSourceReview} from './app-build.mjs';
import {registration} from './registration.mjs';
import {assertSourceCompletenessGate,captureSourceReview} from '../../shared/roster-v2/source-completeness.mjs';
import {armyBooks} from '../../../v2/army-books.mjs';
const read=name=>parseSourceFixtureJSON(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const facts=read('./generated/effective.json'),sm=read('../../space-marines/v2/generated/effective.json');
const before=JSON.stringify([facts,sm]),payload=buildApp(),cards=new Map(payload.cards.map(card=>[card.id,card]));
const membership=read('./inherited-sm-references.json'),checks=[];
const check=(id,fn)=>{fn();checks.push({id,status:'PASS'});};
check('standard-nine-book-registration-and-existing-assets',()=>{
 assert.equal(armyBooks.length,9);assert.equal(new Set(armyBooks.map(book=>book.id)).size,9);
 assert.equal(armyBooks.at(-1),registration);assert.equal(registration.id,'blood-angels');assert.equal(payload.book.id,registration.id);
 assert.ok(fs.statSync(fileURLToPath(registration.home.cover)).size>0);
 assert.ok(fs.statSync(new URL(payload.bookPresentation.coverImage,registration.assetBaseURL)).size>0);
 assert.ok(registration.styles.every(url=>fs.statSync(fileURLToPath(url)).size>0));
});
check('exact-source-owned-corpus-and-inherited-identities',()=>{
 const ds=payload.cards.filter(card=>card.kind==='DATASHEET');assert.equal(ds.length,81);
 assert.equal(ds.filter(card=>card.identity.registryId==='blood-angels').length,14);
 assert.equal(ds.filter(card=>card.identity.registryId==='space-marines').length,67);
 for(const card of ds){const source=[...facts.entities,...sm.entities].find(row=>row.id===card.id);assert.ok(source);
  assert.equal(card.identity.canonicalId,source.id);assert.equal(card.identity.registryId,source.bookId);assert.deepEqual(sourceSnapshot(card),sourceSnapshot(source));}
 for(const row of membership.excludedOtherChapterDatasheets)assert.ok(!cards.has(row.canonicalId));
 assert.equal(payload.groups.find(group=>group.id==='army-rules').itemIds.length,3);
 assert.equal(payload.groups.find(group=>group.id==='detachments').itemIds.length,18);
 const assignments=payload.cards.filter(card=>card.kind==='ENHANCEMENT');assert.equal(assignments.length,40);
 assert.equal(assignments.filter(card=>card.fields.some(field=>field.source?.path==='/itemKind'&&field.value==='UNIT_UPGRADE')).length,8);
 assert.equal(payload.cards.filter(card=>card.kind==='STRATAGEM').length,60);
});
check('all-reference-and-related-rule-targets-resolve',()=>{
 for(const card of payload.cards)for(const id of [...card.children||[],...(card.links||[]).map(link=>link.targetId),...(card.fields||[]).flatMap(field=>field.targetIds||[])])assert.ok(cards.has(id),'Missing target '+id);
 assert.equal(payload.relatedRules.rows.length,81*100);
 for(const row of payload.relatedRules.rows){assert.equal(cards.get(row.ruleId).parentId,row.detachmentId);assert.equal(row.state,'UNKNOWN');}
});
check('limitations-and-source-review-stay-honest',()=>{
 const result=assertBloodAngelsAppSourceReview();assert.equal(result.status,'PARTIAL');assert.equal(result.classifications.UNVERIFIED,301);
 assert.equal(result.semanticCompleteness,'NOT_PROVEN');assert.equal(payload.rulePresentationLimitations.realNewRecruitExportTested,false);
 assert.equal(payload.rulePresentationLimitations.mfmReferenceOnly,10);
 assert.ok(payload.rulePresentationLimitations.importLimitations.every(row=>row.ownerId==='blood-angels'));
 assert.match(payload.rulePresentationLimitations.importLimitations[0].message,/Chainsword.*Astartes Chainsword.*Bolt Rifle Fire/);
 assert.match(payload.rulePresentationLimitations.importLimitations[1].message,/Black Rage.*OR.*BLOOD ANGELS.*CHARACTER/);
 const altered=structuredClone(facts);altered.entities[0].data.__unreviewed=true;
 // The existing source guard must still reject an unreviewed canonical block.
 assert.throws(()=>assertSourceCompletenessGate({review:read('./app-source-review.json'),books:[{
  bookId:'blood-angels',facts:altered,sourceReview:captureSourceReview('blood-angels',facts)
 }],expectations:[],registeredBookIds:[],checkAllRegistrations:false}),/UNREVIEWED_SOURCE_BLOCK/);
 assert.equal(JSON.stringify([facts,sm]),before);
});
console.log(JSON.stringify({status:'PASS',checks,coverage:{datasheets:81,owned:14,inherited:67,armyRules:3,detachments:18,enhancements:32,upgrades:8,stratagems:60},
 sourceCompleteness:'PARTIAL',semanticCompleteness:'NOT_PROVEN',realNewRecruitExportTested:false,browserVerified:false},null,2));
