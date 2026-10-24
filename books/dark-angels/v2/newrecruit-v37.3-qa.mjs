/** Corrected user export paste; only Markdown transport decoded; diagnostic mutations are not army-legality claims. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {createDarkAngelsRosterService} from './roster-import.mjs';
import {buildDarkAngelsImportBook} from './roster-import-build.mjs';
import {buildApp} from './app-build.mjs';
const bytes=fs.readFileSync(new URL('./fixtures/newrecruit-v37.3-user-da.txt',import.meta.url));
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'4070ae82ef9004d2b6d723c1125673aba8728d250d526d52ba274895f9d6fd78');
const text=bytes.toString('utf8'),book=buildDarkAngelsImportBook(),service=createDarkAngelsRosterService(book);
const result=service.import(text);assert.equal(result.status,'READY',JSON.stringify(result));
assert.equal(result.legality,'NOT_ASSESSED');assert.equal(service.state.units.length,1);
assert.equal(service.state.detachmentIds.length,19);
const unit=service.state.units[0];assert.equal(unit.startingStrength,5);
assert.equal(unit.canonicalUnitId,'unit-da-9f8f2ccbdb7d4c72857c');
assert.deepEqual(unit.modelRows.map(row=>[row.canonicalProfileId,row.quantity]),[['model-da-18d8e90b69f9453481d3',4],['model-da-0c67d8cfbdcb476a8c10',1]]);
assert.deepEqual(unit.modelRows[0].loadouts.map(row=>row.quantity),[3,1]);
assert.equal(service.points.status,'RESOLVED');assert.equal(service.points.totalPoints,200);
assert.equal(service.points.units[0].basePoints,190);
const paid=service.points.units[0].paid.options.find(row=>row.label==='Cyclone Missile Launcher');
assert.equal(paid.quantity,1);assert.equal(paid.points,10);assert.equal(paid.selections.length,1);
assert.equal(paid.selections[0].canonicalProfileIds.length,2,'Alternative firing profiles share one purchase');
assert.equal(paid.selections[0].scope.kind,'MODEL');
assert.ok(paid.selections[0].scope.modelScopeId.includes('/loadout/2'));
const dw='detachment-dw-c015c08e99c14972',rule='detachment-rule-dw-b41deacc51464866',dp='mfm-detachment-68a77cb979c24615';
assert.ok(service.state.detachmentIds.includes(dw));
assert.deepEqual(book.entities.filter(row=>row.bookId==='deathwatch').map(row=>row.id),[dw,rule]);
assert.ok(book.entities.filter(row=>row.bookId==='deathwatch').every(row=>!row.ruleContract));
assert.deepEqual(book.canonicalMembership.filter(row=>row.bookId==='deathwatch').map(row=>row.id),[dw,rule]);
const payload=buildApp();assert.equal(payload.groups.find(row=>row.id==='detachments').itemIds.length,18);
for(const [id,owner] of [[dw,'deathwatch'],[rule,'deathwatch'],[dp,'mfm']]){
 assert.equal(payload.cards.find(card=>card.id===id).identity.registryId,owner);
 assert.ok(!payload.ruleContractIds.includes(id));assert.ok(payload.groups.every(group=>!group.itemIds.includes(id)));
}
assert.deepEqual(payload.bookPresentation.records[dw].enhancementIds,[]);
assert.deepEqual(payload.bookPresentation.records[dw].stratagemIds,[]);
const saved=service.snapshot(),restored=createDarkAngelsRosterService(book);restored.load(structuredClone(saved));
assert.deepEqual(restored.snapshot(),saved);assert.deepEqual(restored.projection,service.projection);
assert.equal(service.import(text).status,'READY');assert.deepEqual(service.snapshot(),saved);
for(const changed of [text.replace('Deathwatch\u00a0Support','Unreviewed Foreign Detachment'),text+'\nEnhancement: Beacon Angelis\n',text.replace('Imperium - Adeptus Astartes - Dark Angels','Imperium - Adeptus Astartes - Blood Angels')]){
 assert.notEqual(service.import(changed).status,'READY');assert.deepEqual(service.snapshot(),saved);
}
// A changed export requires replacement confirmation in an occupied service.
// Use an empty service to isolate price authority from that existing UX gate.
const fakePoints=text.replace(/200/g,'9999'),independent=createDarkAngelsRosterService(book);
assert.equal(independent.import(fakePoints).status,'READY');assert.equal(independent.points.totalPoints,200);
const tenBytes=fs.readFileSync(new URL('./fixtures/newrecruit-v37.3-user-da-10-models.txt',import.meta.url));
assert.equal(crypto.createHash('sha256').update(tenBytes).digest('hex'),'2fa72ca975ac40144da3dc7ffaba612e25e1fa5f9be337c9627bb6127702327d');
const tenText=tenBytes.toString('utf8'),ten=createDarkAngelsRosterService(book);
assert.equal(ten.import(tenText).status,'READY');assert.equal(ten.state.units[0].startingStrength,10);
assert.equal(ten.state.detachmentIds.length,19);
assert.deepEqual(ten.state.units[0].modelRows.map(row=>row.quantity),[9,1]);
assert.deepEqual(ten.state.units[0].modelRows[0].loadouts.map(row=>row.quantity),[7,2]);
assert.equal(ten.points.status,'RESOLVED');assert.equal(ten.points.units[0].basePoints,380);assert.equal(ten.points.totalPoints,400);
const twoCyclones=ten.points.units[0].paid.options.find(row=>row.label==='Cyclone Missile Launcher');
assert.equal(twoCyclones.quantity,2);assert.equal(twoCyclones.points,20);
assert.equal(twoCyclones.selections[0].physicalQuantity,2);assert.equal(twoCyclones.selections[0].canonicalProfileIds.length,2);
const tenSnapshot=ten.snapshot(),tenReload=createDarkAngelsRosterService(book);tenReload.load(structuredClone(tenSnapshot));
assert.deepEqual(tenReload.snapshot(),tenSnapshot);assert.deepEqual(tenReload.projection,ten.projection);
assert.equal(ten.import(tenText).status,'READY');assert.deepEqual(ten.snapshot(),tenSnapshot);
console.log(JSON.stringify({status:'PASS',realExport:'SHA_PINNED_CORRECTED_USER_PASTES_V37_3',units:1,models:5,detachments:19,points:200,base:190,cyclone:10,physicalCyclone:1,secondUserExport:{models:10,points:400,cyclones:2,cyclonePoints:20},canonicalAlternativeProfiles:2,reloadReimport:'PASS',referenceOwner:'deathwatch',negativeGuards:'PASS',legality:'NOT_ASSESSED'}));
