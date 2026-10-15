/** Independent source expectations, real text importer and existing runtime.
 * Browser/presentation acceptance is separately owned by cross-book QA. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildCSMRosterRuntimeBook} from './roster-runtime-build.mjs';
import {buildCSMImportBook} from './roster-import-build.mjs';
import {createCSMRosterRuntime} from './roster-runtime.mjs';
import {csmChargeFixtures} from './charge-roll-fixtures.mjs';

const book=buildCSMRosterRuntimeBook(),importBook=buildCSMImportBook();
const bindings=JSON.parse(fs.readFileSync(new URL('./roster-attachment-bindings.json',import.meta.url),'utf8'));
const clone=structuredClone,records=new Map(book.entities.map(entity=>[entity.id,entity]));
const snapshot=JSON.stringify(book),facts=JSON.stringify(importBook),results=[];
const metric=(projection,id)=>projection.units.find(unit=>unit.instanceId===id).metrics.chargeRoll?.modifier||0;
const characteristics=projection=>projection.units.map(unit=>({id:unit.instanceId,profiles:unit.profiles.map(profile=>({
  id:profile.canonicalProfileId,profile:profile.profile,weapons:profile.weapons}))}));
function run(fixture,inputBook=book) {
  const service=createCSMRosterRuntime(inputBook,importBook,bindings),imported=service.import(fixture.text);
  assert.equal(imported.status,'READY');
  const [source,duplicate,bodyguard,other]=service.state.units.map(unit=>unit.instanceId);
  const initial=service.snapshot(),baseline=characteristics(service.projection);
  const verify=(values)=>{
    const projection=service.projection;
    for(const [id,value] of [[source,values[0]],[duplicate,0],[bodyguard,values[1]],[other,values[2]]])
      assert.equal(metric(projection,id),value,`${fixture.id}: wrong physical UNIT Charge modifier ${id}`);
    for(const unit of projection.units)for(const profile of unit.profiles)
      assert.equal(profile.metrics?.chargeRoll,undefined,'UNIT Charge copied to MODEL');
    assert.deepEqual(characteristics(projection),baseline,'Charge changed a characteristic/weapon');
    const expected=[source,...(values[1]?[bodyguard]:[]),...(values[2]?[other]:[])].filter(id=>metric(projection,id)>0);
    const applied=projection.units.flatMap(unit=>unit.applied).filter(row=>row.ruleId===fixture.ruleId);
    assert.deepEqual(new Set(applied.map(row=>row.targetInstanceId)),new Set(expected));
    for(const row of applied) {
      assert.equal(row.operation,'MODIFY_RULE_METRIC');assert.equal(row.field,'chargeRoll');
      assert.equal(row.sourceInstanceId,source);assert.equal(row.targetModelInstanceId,null);
      assert.deepEqual(row.after,{modifier:1});assert.ok(row.sourceFields.length);
    }
    service.load(service.snapshot());assert.deepEqual(service.projection,projection,'Recompute accumulated Charge');
  };
  verify([fixture.standalone,0,0]);
  service.attach(bodyguard,source);verify([1,1,0]);
  const attached=service.snapshot(),reloaded=createCSMRosterRuntime(inputBook,importBook,bindings);
  reloaded.load(JSON.parse(JSON.stringify(attached)));assert.deepEqual(reloaded.projection,service.projection,'Serialized reload drift');
  service.detach(source);verify([fixture.standalone,0,0]);
  service.attach(other,source);verify([1,0,1]);
  service.reattach(bodyguard,source);verify([1,1,0]);
  if(fixture.id==='empyric-symbiote') {
    const removed=clone(attached);removed.units[0].enhancementIds=[];removed.units[0].enhancementAssignments=[];
    service.load(removed);verify([0,0,0]);service.load(attached);verify([1,1,0]);
    const wrongDetachment=clone(initial);wrongDetachment.detachmentIds=['detachment-veterans-of-the-long-war'];
    wrongDetachment.detachments=[{instanceId:'detachment/1',canonicalDetachmentId:wrongDetachment.detachmentIds[0]}];
    assert.throws(()=>service.load(wrongDetachment),/Enhancement|Detachment|detachment|enhancement/);
  } else {
    service.load(initial);service.attach(bodyguard,service.state.units[4].instanceId);
    verify([0,0,0]); // An attached Chaos Lord is not a Master of Possession.
  }
  return {id:fixture.id,source:'PASS',standalone:fixture.standalone,formed:1,physicalIsolation:'PASS',
    removeRestore:'PASS',detachReattach:'PASS',serializedReload:'PASS',modelAndWeaponCharacteristics:'UNCHANGED'};
}
for(const fixture of csmChargeFixtures) {
  const rule=records.get(fixture.ruleId);
  assert.equal(rule.data.text,fixture.sourceText,'Independent source expectation drift');
  assert.ok(rule.provenance.sourceEvidence.length);
  const charge=rule.ruleContract.clauses.find(clause=>clause.id==='charge-roll-clause');
  assert.equal(charge.rosterClassification,'ROSTER_EXECUTABLE');
  assert.equal(charge.rosterEffects.length,1);
  const advance=rule.ruleContract.clauses.find(clause=>clause.id!=='charge-roll-clause');
  assert.equal(advance.productClassification,'ROSTER_KNOWN');
  assert.equal(advance.capabilityRequirement.status,'CAPABILITY_MISSING');
  assert.equal(advance.capabilityRequirement.characteristic,'Advance roll');
  assert.deepEqual(advance.rosterEffects,[]);
  results.push(run(fixture));
  for(const mutation of ['missing-binding','wrong-value','wrong-recipient','wrong-owner']) {
    const changed=clone(book),owner=changed.entities.find(entity=>entity.id===fixture.ruleId);
    const clause=owner.ruleContract.clauses.find(clause=>clause.id==='charge-roll-clause'),effect=clause.rosterEffects[0];
    if(mutation==='missing-binding'){clause.rosterEffects=[];clause.rosterClassification='DISPLAY_ONLY';}
    if(mutation==='wrong-value')effect.value=2;
    if(mutation==='wrong-recipient')effect.unitScope='PHYSICAL';
    if(mutation==='wrong-owner') {
      if(fixture.id==='daemonkin')effect.conditions.find(condition=>condition.predicate.predicate==='MODEL_ID').predicate.arguments.id='datasheet-chaos-lord:section:2:member:1';
      else owner.ruleContract.assignment.selector={predicate:'MODEL_ID',subject:'MODEL',contextLevel:'STATIC',
        arguments:{id:'datasheet-master-of-possession:section:2:member:1'},evidence:effect.evidence};
    }
    assert.throws(()=>run(fixture,changed),/wrong physical UNIT Charge modifier/,
      `${fixture.id}: ${mutation} escaped the source expectation comparator`);
  }
}
assert.equal(JSON.stringify(book),snapshot);assert.equal(JSON.stringify(importBook),facts);
console.log(JSON.stringify({status:'PASS',cases:results,mutationsRejected:8,
  unsupportedAdvance:'EXPLICIT_CAPABILITY_MISSING',sharedExecutorChanged:false,realNewRecruitExportTested:false}));
