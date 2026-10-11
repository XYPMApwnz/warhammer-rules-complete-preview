import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {createCSMRosterAttachments} from './roster-attachments.mjs';
import {buildCSMAttachmentInputs} from './roster-attachment-build.mjs';
import {runAttachmentFixture} from './roster-attachment-fixture-runner.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const book=read('./generated/roster-import.json'),bindings=read('./roster-attachment-bindings.json'),original=structuredClone(book);
const records=new Map(book.entities.map(entity=>[entity.id,entity]));
const {book:adapted,policies}=buildCSMAttachmentInputs(book,bindings);
const make=()=>createCSMRosterAttachments(book,bindings),fixtures=read('./roster-attachment-fixtures.json').fixtures;
const relations=book.entities.filter(entity=>entity.kind==='ATTACHMENT_RELATION');
assert.equal(relations.length,58);assert.equal(policies.length,59);
assert.equal(bindings.declarations.length+bindings.redirects.length,21);
assert.equal(policies.filter(policy=>policy.role==='SUPPORT').length,7);
assert(policies.every(policy=>policy.additionalLeaders===0));
const hashes=new Map();
for(const id of new Set([...policies.flatMap(policy=>policy.sourceIds),...bindings.constraints.flatMap(item=>item.sourceIds)])) {
  for(const source of records.get(id).provenance.sourceEvidence) {
    if(!hashes.has(source.document))hashes.set(source.document,crypto.createHash('sha256').update(fs.readFileSync(new URL('../../../'+source.document,import.meta.url))).digest('hex'));
    assert.equal(hashes.get(source.document),source.sha256.toLowerCase(),'Enrolled attachment evidence must match source bytes');
  }
}
for(const relation of relations)assert(policies.some(policy=>policy.sourceId===relation.parentId&&policy.targetId===relation.data.recipientId&&policy.sourceIds.includes(relation.id)));
for(const declaration of book.entities.filter(entity=>entity.kind==='ATTACHMENT_DECLARATION'))assert(policies.some(policy=>policy.sourceIds.includes(declaration.id)));
const unit=(canonical,index)=>({instanceId:'physical/'+index,canonicalUnitId:canonical.id,warlord:null,enhancementIds:[],selections:[],
  startingStrength:canonical.data.profileIds.reduce((sum,id)=>sum+records.get(id).data.composition.quantity.min,0),
  modelRows:canonical.data.profileIds.map((id,i)=>({rowId:'row/'+i,canonicalProfileId:id,quantity:records.get(id).data.composition.quantity.min,selections:[]}))});
const datasheets=book.entities.filter(entity=>entity.kind==='DATASHEET');
const base={schema:'roster-v2/roster',bookId:book.bookId,rosterId:'all-native-pairs',detachments:[{instanceId:'det',canonicalDetachmentId:'detachment-veterans-of-the-long-war'}],warlordInstanceId:null,units:datasheets.map(unit),attachments:[]};
const all=make();all.load(base);
for(const target of base.units) {
  const expected=relations.filter(relation=>relation.data.recipientId===target.canonicalUnitId).map(relation=>base.units.find(unit=>unit.canonicalUnitId===relation.parentId).instanceId).sort();
  assert.deepEqual(all.candidates(target.instanceId).map(item=>item.instanceId).sort(),expected,'Canonical eligibility for '+target.canonicalUnitId);
}
for(const relation of relations) {
  const source=base.units.find(unit=>unit.canonicalUnitId===relation.parentId),target=base.units.find(unit=>unit.canonicalUnitId===relation.data.recipientId);
  all.attach(target.instanceId,source.instanceId);assert.equal(all.groups.length,1);
  all.detach(source.instanceId);assert.deepEqual(all.state.units,base.units);assert.equal(all.groups.length,0);
}
const results=[];
for(const fixture of fixtures) {
  const service=make(),result=runAttachmentFixture(service,fixture);results.push({fixture:fixture.id,result});
  assert.deepEqual(service.state.units,result.initial.units,'Attachments must preserve exact physical selections/composition/Enhancement ownership');
  const snapshot=service.snapshot();service.load(JSON.parse(JSON.stringify(snapshot)));assert.deepEqual(service.snapshot(),snapshot);
  for(const unit of result.initial.units)assert.equal(service.context(unit.instanceId).roster.leading,service.state.attachments.some(item=>item.leaderInstanceId===unit.instanceId));
  if(fixture.orderControl) {
    const left=make(),right=make();left.import(fixture.text);right.import(fixture.text);
    for(const [recipient,participant] of fixture.orderControl)left.attach(result.initial.units[recipient-1].instanceId,result.initial.units[participant-1].instanceId);
    for(const [recipient,participant] of [...fixture.orderControl].reverse())right.attach(result.initial.units[recipient-1].instanceId,result.initial.units[participant-1].instanceId);
    assert.deepEqual(left.snapshot(),right.snapshot());assert.deepEqual(left.groups,right.groups);
    assert.equal(left.groups[0].memberInstanceIds.length,3);
    const frozen=left.snapshot();
    for(const participant of [1,3])assert.throws(()=>left.attach(result.initial.units[4].instanceId,result.initial.units[participant].instanceId));
    assert.deepEqual(left.snapshot(),frozen);
    assert.equal(left.context(result.initial.units[5].instanceId).roster.attached,false,'Duplicate Bodyguard remains separate');
    assert.deepEqual(left.state.units.map(unit=>unit.enhancementIds),result.initial.units.map(unit=>unit.enhancementIds));
  }
  if(fixture.id==='mixed-profile-components') {
    const commune=result.initial.units[0],cultists=result.initial.units[1];
    assert.deepEqual(commune.modelRows.map(row=>row.quantity),[1,1,1,2]);assert.deepEqual(cultists.modelRows.map(row=>row.quantity),[3,5]);
    const scopes=service.modelScopes(commune.instanceId);
    for(const scope of scopes) {
      const keywords=service.context(commune.instanceId,'MODEL',scope.scopeId).keywords;
      assert.equal(keywords.has('CHARACTER'),scope.canonicalProfileId.endsWith(':member:1'));
      assert.equal(keywords.has('PSYKER'),scope.canonicalProfileId.endsWith(':member:2'));
    }
    assert(service.context(cultists.instanceId).keywords.has('CHARACTER'));
    for(const scope of service.modelScopes(cultists.instanceId))assert(!service.context(cultists.instanceId,'MODEL',scope.scopeId).keywords.has('CHARACTER'));
  }
  if(fixture.id.startsWith('conditional-')) {
    const initial=result.initial,owner=initial.units[0].instanceId,other=initial.units[1].instanceId,target=initial.units[2].instanceId;
    service.load(initial);assert.deepEqual(service.candidates(target).map(item=>item.instanceId),[owner]);assert.throws(()=>service.attach(target,other));
    const absent=structuredClone(initial);absent.units[0].enhancementIds=[];service.load(absent);assert.equal(service.candidates(target).length,0);
    service.load(initial);service.attach(target,owner);assert.deepEqual(service.state,result.trace[0].state);
  }
  if(fixture.id==='selected-marks') {
    service.load(result.initial);
    const ids=result.initial.units.map(unit=>unit.instanceId);
    assert.deepEqual(service.candidates(ids[3]).map(item=>item.instanceId),ids.slice(0,2));assert.throws(()=>service.attach(ids[3],ids[2]));
    service.attach(ids[3],ids[0]);service.attach(ids[3],ids[1]);
    const tampered=service.snapshot();tampered.units[0].selections=[];tampered.units[0].modelRows.forEach(row=>{row.selections=[];});
    assert.throws(()=>service.load(tampered),'Missing selected Mark must not be supplied by formed-unit union');
  }
  for(const field of ['effective','projection','related','applyEffects'])assert.equal(service[field],undefined);
}
assert.deepEqual(book,original,'Canonical facts remain immutable');
const damaged=structuredClone(bindings);damaged.declarations[0].role='SUPPORT';assert.throws(()=>buildCSMAttachmentInputs(book,damaged));
const missing=structuredClone(bindings);missing.redirects.pop();assert.throws(()=>buildCSMAttachmentInputs(book,missing));
const wrongMark=structuredClone(bindings);wrongMark.constraints[0].optionKeywords['detachment-pactbound-zealots:rule:mark:1']='NURGLE';
assert.throws(()=>buildCSMAttachmentInputs(book,wrongMark),'Selected option bindings must agree with canonical facts');
assert.equal(adapted.rosterProfileBindings.length,78);
console.log(JSON.stringify({status:'PASS',declarations:'21/21',baseRelations:58,conditionalPairs:1,conditionalSourcePermissions:2,allNativePairs:54*54,
  relationTransitions:58,fixtures:fixtures.length,AH04:'PASS',AH05:'PASS',orderIndependence:'PASS',mixedProfiles:'PASS',PactboundRestriction:'PASS',
  exactEnhancementAttachmentPermission:'PASS',sourceDocuments:hashes.size,effectsExecuted:0,effectiveDatasheetsBuilt:0,personalGuide:0}));
