/** Narrow source-owned reference membership; constructed import is not a real-export certification. */
import assert from 'node:assert/strict';
import {buildSpaceMarinesContracts} from './rule-contract-build.mjs';
import {buildSpaceMarinesImportBook} from './roster-import-build.mjs';
import {createSpaceMarinesRosterService} from './roster-import.mjs';
import {buildDetachmentReferences,deathwatchDetachmentId} from './detachment-reference-build.mjs';
import {buildApp} from './app-build.mjs';
import {buildGameplayPresentation} from './gameplay-presentation-build.mjs';
import {buildDetachmentReferences as buildBAReferences} from '../../blood-angels/v2/detachment-reference-build.mjs';

const built=buildSpaceMarinesContracts(),before=JSON.stringify(built),book=buildSpaceMarinesImportBook({built});
const reference=buildDetachmentReferences(built.native),ids=reference.entities.map(row=>row.id);
assert.deepEqual(ids,[deathwatchDetachmentId,'detachment-rule-dw-b41deacc51464866']);
assert.equal(reference.review.permission.document,'books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html');
assert.equal(reference.review.permission.pointer,'/html/body/div/div[1]/div[3]/div[41]');
assert.equal(reference.review.permission.sha256,'DD7420597CCC235859B9326F146964746EFFBC8A48752DA4D622BC99DEE1BED7');
assert.equal(reference.review.execution,'TEXT_ONLY_SOURCE_BACKED');
assert.equal(reference.review.legality,'NOT_ASSESSED');
assert.deepEqual(book.entities.filter(row=>row.bookId==='deathwatch'),reference.entities);
assert.deepEqual(book.canonicalMembership.filter(row=>row.bookId==='deathwatch'),reference.membership);
const expectedNative=structuredClone(built.book.entities);
for(const binding of book.importBindings.enhancements.filter(row=>row.sourceCorrection))
 expectedNative.find(row=>row.id===binding.id).data.scope=binding.scope;
assert.deepEqual(book.entities.filter(row=>row.bookId==='space-marines'),expectedNative);
assert.ok(reference.entities.every(row=>!row.ruleContract));
assert.ok(!book.entities.some(row=>row.bookId==='deathwatch'&&['DATASHEET','ENHANCEMENT','STRATAGEM','ARMY_RULE'].includes(row.kind)));
assert.equal(book.entities.filter(row=>row.kind==='DATASHEET').length,85);
assert.equal(book.entities.filter(row=>row.kind==='DETACHMENT'&&row.bookId==='space-marines').length,21);
assert.equal(book.importBindings.enhancements.length,built.book.entities.filter(row=>row.kind==='ENHANCEMENT').length);
assert.deepEqual(book.importBindings.factionIdentityLabels,['Imperium - Adeptus Astartes - Space Marines']);
assert.deepEqual(book.mfm.detachmentBindings.at(-1),reference.binding);
assert.deepEqual(book.mfmImportReferences.partitions.detachmentBindings.at(-1),reference.binding);
assert.deepEqual(book.mfmImportReferences.nativePoints.detachments.at(-1),reference.points);
assert.equal(reference.binding.mfmRecordId,'mfm-detachment-68a77cb979c24615');
assert.equal(JSON.stringify(built),before,'Import membership mutated its producer');
// Shared extraction must preserve the already reviewed BA ownership and binding.
const ba=buildBAReferences(built.native);
assert.deepEqual(ba.entities,reference.entities);assert.deepEqual(ba.binding,reference.binding);assert.deepEqual(ba.points,reference.points);
assert.equal(ba.review.permission.document,'books/blood-angels/v2/sources/raw/wahapedia-blood-angels-main.html');
assert.equal(ba.review.permission.pointer,'/html/body/div/div[1]/div[3]/div[25]');

const fixture='+ FACTION KEYWORD: Space Marines\n+ DETACHMENT: Deathwatch Support\n5x Intercessor Squad (999 pts)\n• 4x Intercessor\n• 1x Intercessor Sergeant\n';
const service=createSpaceMarinesRosterService(book),accepted=service.import(fixture);
assert.equal(accepted.status,'READY',JSON.stringify({errors:accepted.errors,needs:accepted.needsBindings}));
assert.deepEqual(service.state.detachmentIds,[deathwatchDetachmentId]);
assert.deepEqual(service.state.mfmDetachmentRecordIds,[reference.binding.mfmRecordId]);
assert.equal(service.points.detachmentPoints[0].value,reference.points.detachmentPoints);
assert.equal(accepted.legality,'NOT_ASSESSED');
const saved=service.snapshot();
const unknown=service.import(fixture.replace('Deathwatch Support','Unreviewed Foreign Detachment'));
assert.equal(unknown.status,'NEEDS_BINDINGS');
assert.equal(unknown.needsBindings.find(row=>row.kind==='DETACHMENT')?.reason,'DETACHMENT_MEMBERSHIP_NOT_PROVEN');
assert.deepEqual(service.snapshot(),saved,'Unreviewed reference replaced saved roster');
const excluded=service.import(fixture+'Enhancement: Beacon Angelis\n');
assert.equal(excluded.status,'NEEDS_BINDINGS');assert.deepEqual(service.snapshot(),saved);

const native=buildGameplayPresentation(),payload=buildApp(),nativeIds=new Set(native.cards.map(row=>row.id));
assert.deepEqual(payload.cards.filter(row=>nativeIds.has(row.id)),native.cards,'Native app cards changed');
assert.deepEqual(payload.factManifest.filter(row=>nativeIds.has(row.cardId)),native.factManifest);
assert.deepEqual(payload.groups,native.groups,'Reference membership changed browse groups');
assert.equal(payload.groups.find(row=>row.id==='detachments').itemIds.length,21);
const extra=payload.cards.filter(row=>!nativeIds.has(row.id)),extraIds=new Set(extra.map(row=>row.id));
const record=reference.native.deathwatch.payload.bookPresentation.records[deathwatchDetachmentId];
assert.deepEqual([...extraIds].sort(),[...ids,record.pointRecordId,...record.qualifierRecordIds].sort());
assert.ok(payload.groups.every(group=>group.itemIds.every(id=>!extraIds.has(id))));
for(const id of ids){
 const card=extra.find(row=>row.id===id),entity=reference.entities.find(row=>row.id===id);
 assert.deepEqual(card.provenance,entity.provenance);assert.equal(card.identity.registryId,'deathwatch');
 assert.equal(card.identity.canonicalId,id);assert.ok(!payload.ruleContractIds.includes(id));
}
assert.deepEqual(payload.bookPresentation.records[deathwatchDetachmentId].enhancementIds,[]);
assert.deepEqual(payload.bookPresentation.records[deathwatchDetachmentId].stratagemIds,[]);
assert.ok(payload.relatedRules.rows.every(row=>!ids.includes(row.detachmentId)));
console.log(JSON.stringify({status:'PASS',consumerBook:'space-marines',canonicalOwner:'deathwatch',referenceEntities:ids,
 primaryDetachments:21,datasheets:85,execution:'TEXT_ONLY_SOURCE_BACKED',legality:'NOT_ASSESSED',
 sourceFingerprintPinned:true,baReferenceUnchanged:true,negativeMembershipRejected:true,extraPresentationCards:extra.length,
 actualNewRecruitExportTested:false}));
