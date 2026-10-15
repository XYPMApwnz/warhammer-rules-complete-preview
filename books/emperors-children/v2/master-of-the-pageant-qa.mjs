/** Single factual owner, conditional Guide, unchanged CP and stale publication. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {buildApp} from './app-build.mjs';
import {buildECContracts} from './rule-contract-build.mjs';
import {buildECRosterAttachmentBook} from './roster-attachment-build.mjs';
import {createECBrowserRoster} from './roster-boot.mjs';
import {projectPersonalBook} from '../../shared/army-book-app-v2/personal.mjs';
import {assertGlossaryV2Parity,loadGlossaryV2Inputs} from '../../../glossary/v2/content/glossary-v2-index.mjs';

const read=file=>JSON.parse(fs.readFileSync(new URL(file,import.meta.url),'utf8'));
const id='detachment-court-of-the-phoenician:rule:master-of-the-pageant',court='detachment-court-of-the-phoenician';
const facts=read('./generated/effective.json'),owner=facts.entities.find(e=>e.id===id),built=buildECContracts(),payload=buildApp(built);
const card=payload.cards.find(c=>c.id===id),ruleIds=payload.bookPresentation.records[court].ruleIds;
assert.deepEqual(ruleIds,[court+':rule',id]);assert.equal(card.parentId,court);
assert.equal(card.fields.find(f=>f.source.path==='/text').value,owner.data.text);
assert.equal(card.fields.find(f=>f.source.path==='/text').source.entityId,id);
assert.deepEqual(card.provenance,owner.provenance);
assert.deepEqual(card.links,owner.data.referenceBindings);
let mutations=0;
for(const mutate of [book=>book.entities.find(e=>e.id===court).data.ruleIds.push(id),
 book=>book.entities.find(e=>e.id===court).data.ruleIds[1]='detachment-carnival-of-excess:rule',
 book=>book.entities.find(e=>e.id===id).data.referenceBindings[0].targetId='detachment-carnival-of-excess:stratagem:1']){
 const bad=buildECContracts();mutate(bad.book);assert.throws(()=>buildApp(bad));mutations++;
}
assert.equal(built.contracts.length,26);assert.ok(!built.book.entities.find(e=>e.id===id).ruleContract);
assert.ok(!built.contracts.some(contract=>JSON.stringify(contract).includes(id)));
const book=buildECRosterAttachmentBook().book,service=createECBrowserRoster(book);
const text=read('./roster-import-fixtures.json').fixtures.find(f=>f.id==='native-fnp-physical-instances').text;
assert.equal(service.import(text).status,'READY');const snapshot=service.snapshot();
assert.ok(projectPersonalBook(payload,snapshot).allowedIds.has(id));
assert.ok(service.projection.units.every(unit=>!unit.applied.some(row=>row.ruleId===id)));
for(const row of service.projection.units)assert.equal(row.metrics?.cp,undefined);
assert.deepEqual(service.snapshot(),snapshot);
const original=JSON.parse(execFileSync('git',['show','273b8bd3ce8ef5844e4c2518b61b4e6189e1ed8d:books/emperors-children/v2/generated/effective.json'],{maxBuffer:20e6}));
for(const entity of original.entities){
 const current=facts.entities.find(e=>e.id===entity.id);assert.ok(current,'Existing canonical fact lost');
 const expected=structuredClone(entity);if(expected.id===court)expected.data.ruleIds.push(id);
 assert.deepEqual(current,expected,'Unrelated factual/gameplay change '+entity.id);
}
assert.equal(facts.entities.length,original.entities.length+1);
const index=read('../../../glossary/v2/generated/index.en.json');
const entries=index.entries.filter(e=>e.sourceOwner?.bookId==='emperors-children'&&e.sourceOwner.canonicalId===id);
assert.equal(entries.length,1);assert.deepEqual(entries[0].facts.canonicalData,owner.data);
assert.deepEqual(entries[0].provenance,owner.provenance);
for(const binding of owner.data.referenceBindings)assert.ok(entries[0].canonicalReferences.some(ref=>ref.canonicalId===binding.targetId));
// Use the existing publication invariant, including an actual removed fact.
const stale=structuredClone(index);stale.entries=stale.entries.filter(e=>e.sourceOwner?.canonicalId!==id);
const inputs=await loadGlossaryV2Inputs();assertGlossaryV2Parity(index,inputs);
assert.throws(()=>assertGlossaryV2Parity(stale,inputs),'Stale guard accepted a missing canonical rule');
mutations++;
console.log(JSON.stringify({status:'PASS',canonicalOwner:id,courtRules:2,conditionalGuide:true,contracts:26,
  automaticCP:false,singleGlossaryOwner:true,missingRuleStaleGuard:true,unrelatedFactsChanged:0,mutations}));
