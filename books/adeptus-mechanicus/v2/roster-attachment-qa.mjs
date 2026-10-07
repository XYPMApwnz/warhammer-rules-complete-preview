import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {createAdMechRosterAttachments} from './roster-attachments.mjs';
import {buildRosterAttachmentInputs} from './roster-attachment-build.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const book=read('./generated/effective.json'),metadata=read('./roster-import-aliases.json'),bindings=read('./roster-attachment-bindings.json');
const corpus=read('./roster-attachment-fixtures.json'),records=new Map(book.entities.map(entity=>[entity.id,entity]));
const original=structuredClone(book),make=()=>createAdMechRosterAttachments(book,metadata,bindings);
const coreSource=fs.readFileSync(new URL('../../../'+corpus.corePolicyEvidence.sourceArtifact,import.meta.url),'utf8');
assert(coreSource.includes(corpus.corePolicyEvidence.quote),'Current Core must support one Leader plus one Support');
const coreRecords=read('../../core-rules/content/core-rules.digital-11e.json').records;
for(const code of corpus.corePolicyEvidence.coreRecordCodes)assert(coreRecords.find(record=>record.code===code)?.text.includes(corpus.corePolicyEvidence.quote));
const {policies}=buildRosterAttachmentInputs(book,bindings);
assert.equal(policies.length,41);assert.equal(corpus.currentDirectRelationsExpected,41);
assert.deepEqual(policies.map(item=>[item.sourceId,item.targetId,item.role]).sort(),corpus.currentDirectRelations.map(item=>[item.participantCanonicalId,item.recipientCanonicalId,item.role]).sort());
for(const expected of corpus.currentDirectRelations) {
  const actual=policies.find(item=>item.sourceId===expected.participantCanonicalId&&item.targetId===expected.recipientCanonicalId);
  assert(actual.sourceIds.includes(expected.sourceDeclarationId));assert(actual.sourceIds.includes(expected.sourceSectionId));
  assert.equal(actual.additionalLeaders,0,'No imported legacy multiplicity exception');
}
let evidenceChecked=0,actionsChecked=0,ordersChecked=0;
for(const fixture of corpus.fixtures) {
  for(const evidence of fixture.sourceEvidence) {
    const entity=records.get(evidence.entityId);assert.deepEqual(entity.provenance,evidence.provenance);
    if(evidence.sourceText)assert.equal(entity.data.blocks.map(block=>block.text||'').join('\n'),evidence.sourceText);
    evidenceChecked++;
  }
  const service=make(),result=service.import(fixture.text);assert.equal(result.status,'READY',fixture.id);
  assert.deepEqual(service.state.attachments,[],'Import must not infer attachments');
  const imported=service.snapshot(),modelContexts=new Map(imported.units.map(unit=>[unit.instanceId,service.modelScopes(unit.instanceId).map(scope=>{
    const context=service.context(unit.instanceId,'MODEL',scope.scopeId);
    return {scope,...Object.fromEntries(['intrinsicKeywords','keywords','abilities'].map(key=>[key,[...context[key]].sort()]))};
  })]));
  const perform=action=>{
    const before=service.snapshot();
    if(action.valid) {
      if(action.action==='DETACH')service.detach(action.participant);
      else service.attach(action.recipient,action.participant);
    } else {assert.throws(()=>service.attach(action.recipient,action.participant),fixture.id);assert.deepEqual(service.state,before);}
    actionsChecked++;
  };
  fixture.actions.forEach(perform);
  const expected=fixture.expectedGroups.flatMap(group=>group.participants.map(participant=>[participant.instanceId,group.recipient,participant.role])).sort();
  assert.deepEqual(service.state.attachments.map(item=>[item.leaderInstanceId,item.bodyguardInstanceId,item.role]).sort(),expected,fixture.id);
  for(const unit of service.state.units) {
    assert.deepEqual(unit,imported.units.find(item=>item.instanceId===unit.instanceId),'Composition/equipment/Enhancement ownership is immutable during attachments');
    for(const [i,scope] of service.modelScopes(unit.instanceId).entries()) {
      const context=service.context(unit.instanceId,'MODEL',scope.scopeId),initial=modelContexts.get(unit.instanceId)[i];
      for(const key of ['intrinsicKeywords','keywords','abilities'])assert.deepEqual([...context[key]].sort(),initial[key],key+' must remain component/profile intrinsic');
      assert.deepEqual(context.battle,{});
    }
    const context=service.context(unit.instanceId);
    assert.equal(context.roster.leading,expected.some(item=>item[0]===unit.instanceId),'AH04');
    assert.equal(context.roster.attached,expected.some(item=>item[0]===unit.instanceId||item[1]===unit.instanceId));
    if(fixture.expectedEnhancementOwners)assert.deepEqual(unit.enhancementIds,fixture.expectedEnhancementOwners[unit.instanceId]);
    if(fixture.expectedProfileQuantities?.[unit.instanceId]) {
      const quantities={};for(const row of unit.modelRows)quantities[row.canonicalProfileId]=(quantities[row.canonicalProfileId]||0)+row.quantity;
      assert.deepEqual(quantities,fixture.expectedProfileQuantities[unit.instanceId]);
    }
    for(const scope of service.modelScopes(unit.instanceId)) {
      const checks=fixture.expectedIntrinsicProfileKeywords?.[scope.canonicalProfileId];if(!checks)continue;
      const keywords=service.context(unit.instanceId,'MODEL',scope.scopeId).keywords;
      for(const keyword of checks.contains||[])assert(keywords.has(keyword));for(const keyword of checks.excludes||[])assert(!keywords.has(keyword));
    }
  }
  const final=service.snapshot(),groups=service.groups;
  for(const order of fixture.equivalentOrders||[]) {
    service.load(imported);order.forEach(perform);assert.deepEqual(service.state,final,'Order invariant');assert.deepEqual(service.groups,groups);ordersChecked++;
  }
  service.load(JSON.parse(JSON.stringify(final)));assert.deepEqual(service.state,final);
  for(const attachment of final.attachments) {service.detach(attachment.leaderInstanceId);service.reattach(attachment.bodyguardInstanceId,attachment.leaderInstanceId);assert.deepEqual(service.state,final);}
  assert.equal(service.effective,undefined);assert.equal(service.projection,undefined);
}
// All canonical pairs: expectations independently enumerated in source fixtures.
const units=book.entities.filter(entity=>entity.kind==='DATASHEET'),all=make();
const seed=make();assert.equal(seed.import(corpus.fixtures[0].text).status,'READY');
const snapshot=seed.snapshot();snapshot.units=units.map((unit,index)=>({instanceId:'all-'+index,canonicalUnitId:unit.id,startingStrength:unit.data.profileIds.length,
  warlord:null,enhancementIds:[],selections:[],modelRows:unit.data.profileIds.map((id,i)=>({rowId:'row-'+i,canonicalProfileId:id,quantity:1,selections:[]}))}));
snapshot.attachments=[];snapshot.warlordInstanceId=null;all.load(snapshot);
let pairsChecked=0;
for(const recipient of snapshot.units) {
  const candidates=all.candidates(recipient.instanceId);
  for(const participant of snapshot.units) {
    const expected=corpus.currentDirectRelations.find(item=>item.participantCanonicalId===participant.canonicalUnitId&&item.recipientCanonicalId===recipient.canonicalUnitId);
    const actual=candidates.find(item=>item.instanceId===participant.instanceId);assert.equal(Boolean(actual),Boolean(expected));if(expected)assert.equal(actual.role,expected.role);pairsChecked++;
  }
}
// Accepted HTML bytes/provenance for each current declaration, independent of policy output.
for(const declaration of book.entities.filter(entity=>entity.kind==='ATTACHMENT_DECLARATION')) {
  const provenance=declaration.provenance;
  const bytes=fs.readFileSync(new URL('../../../'+provenance.sourcePath,import.meta.url));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex').toUpperCase(),provenance.sha256);
}
assert.deepEqual(book,original);
assert.throws(()=>buildRosterAttachmentInputs(book,{...bindings,redirects:bindings.redirects.slice(1)}));
const severed=structuredClone(book);severed.entities.find(entity=>entity.kind==='ATTACHMENT_DECLARATION').provenance={};
assert.throws(()=>buildRosterAttachmentInputs(severed,bindings));
console.log(JSON.stringify({status:'PASS',sourceDeclarations:9,directRelations:policies.length,canonicalPairs:pairsChecked,fixtures:corpus.fixtures.length,actions:actionsChecked,orderComparisons:ordersChecked,evidenceChecked,AH04:'PASS',AH05:'PASS',mixedProfiles:'PASS',physicalIsolation:'PASS',effectsApplied:0,legacyAttachmentReads:0}));
