/** Real text import -> explicit bearer/attachment input -> shared interpreter.
 * No synthetic physical inventories or presentation adapter are execution input. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {buildCSMRosterRuntimeBook} from './roster-runtime-build.mjs';
import {buildCSMImportBook} from './roster-import-build.mjs';
import {buildImportedEffectFixtures} from './roster-imported-effect-fixtures.mjs';
import {createCSMRosterImport} from './roster-import.mjs';
import {createCSMRosterRuntime} from './roster-runtime.mjs';
import {formRoster} from '../../shared/roster-v2/context.mjs';
import {deferredClause} from './roster-effect-build.mjs';

export const clone=structuredClone;
export const book=buildCSMRosterRuntimeBook(),importBook=buildCSMImportBook();
export const bindings=JSON.parse(fs.readFileSync(new URL('./roster-attachment-bindings.json',import.meta.url),'utf8'));
export const fixtures=buildImportedEffectFixtures(book);
export const rows=(projection,fixture)=>projection.units.flatMap(unit=>unit.applied).filter(row=>
  row.ruleId===fixture.owner&&row.clauseId===fixture.clauseId);
export const unit=(projection,id)=>projection.units.find(unit=>unit.instanceId===id);
export function imported(fixture) {
  const result=createCSMRosterImport(importBook).import(fixture.text);
  assert.equal(result.status,'READY','Real text import failed: '+fixture.id);
  const state=result.roster,rule=book.entities.find(entity=>entity.id===fixture.owner);
  // Explicit test input: assigning a known Enhancement's physical MODEL bearer.
  // This is not inferred by runtime from a first profile, title or unit keyword.
  if(rule.kind==='ENHANCEMENT'&&rule.ruleContract.assignment) {
    const source=state.units[fixture.sourceOrdinal-1];
    const candidates=unit(formRoster(book,state),source.instanceId).profiles.filter(profile=>
      profile.canonicalProfileId===fixture.bearerProfileId&&profile.quantity===1);
    assert.equal(candidates.length,1,'Explicit fixture bearer is ambiguous');
    source.enhancementAssignments=[{enhancementId:rule.id,modelScopeId:candidates[0].scopeId}];
  }
  return state;
}
export function runtime(fixture,inputBook=book) {
  const service=createCSMRosterRuntime(inputBook,importBook,bindings);
  service.load(imported(fixture));
  for(const edge of fixture.attachments)service.attach(service.state.units[edge.bodyguardOrdinal-1].instanceId,
    service.state.units[edge.leaderOrdinal-1].instanceId);
  // Only this fixture explicitly declares start-of-battle attachment history.
  // Ordinary attach does not synthesize historical or battle-state inputs.
  if(fixture.initialAttachments)service.load({...service.snapshot(),initialAttachments:clone(service.snapshot().attachments)});
  return service;
}
const numeric=value=>Number.parseInt(value);
export function checkEffects(projection,fixture,state) {
  const applied=rows(projection,fixture),rule=book.entities.find(entity=>entity.id===fixture.owner);
  assert.ok(applied.length,'Missing positive execution: '+fixture.id);
  const source=state.units[fixture.sourceOrdinal-1];
  for(const row of applied) {
    const physicalSource=['ENHANCEMENT','UPGRADE_OPTION'].includes(rule.kind)?source:
      state.units.find(raw=>raw.instanceId===row.sourceInstanceId);
    const currentFormed=new Set([physicalSource?.instanceId,...state.attachments.filter(edge=>edge.leaderInstanceId===physicalSource?.instanceId)
      .map(edge=>edge.bodyguardInstanceId)]);
    const matches=fixture.expectedOperations.filter(effect=>effect.operation===row.operation&&
      (effect.field===undefined||effect.field===row.field));
    assert.ok(matches.length,'Unexpected operation: '+fixture.id);
    assert.ok(matches.some(effect=>{
      if(effect.targetBinding==='SOURCE_MODEL')return row.targetInstanceId===physicalSource?.instanceId&&
        (rule.kind==='ENHANCEMENT'?row.targetProfileId===fixture.bearerProfileId:
          physicalSource.modelRows.some(model=>model.canonicalProfileId===row.targetProfileId));
      if(effect.targetBinding==='SOURCE_UNIT'&&effect.unitScope==='FORMED')return currentFormed.has(row.targetInstanceId);
      if(effect.targetBinding==='SOURCE_UNIT'||effect.targetBinding==='SOURCE_UNIT_MODELS')return row.targetInstanceId===physicalSource?.instanceId;
      if(effect.targetBinding==='SOURCE_FORMED_MODELS')return currentFormed.has(row.targetInstanceId);
      return ['ROSTER_MODELS','ROSTER_UNITS','LEADERS_OF_SOURCE'].includes(effect.targetBinding);
    }),'Recipient escaped canonical binding: '+fixture.id);
    if(['ENHANCEMENT','UPGRADE_OPTION'].includes(rule.kind))assert.equal(row.sourceInstanceId,source.instanceId,'Wrong physical source');
    if(rule.kind==='ENHANCEMENT'||rule.kind==='UPGRADE_OPTION')assert.ok(!state.units.slice(1,2).some(other=>other.instanceId===row.targetInstanceId),'Duplicate owner leakage');
    const effect=matches[0];
    if(row.operation==='MODIFY_STAT') {
      if(effect.mode==='SET')assert.equal(numeric(row.after),effect.value,'Numeric SET oracle');
      else if(/^-?\d+["+]?$/.test(String(row.before)))assert.equal(numeric(row.after),numeric(row.before)+effect.value,'Numeric ADD oracle');
      else {const match=String(row.before).match(/^(\d*D\d+)(?:\+(\d+))?$/i);assert.ok(match,'Unknown source numeric expression');
        const value=Number(match[2]||0)+effect.value;assert.equal(row.after,match[1]+(value?`+${value}`:''));}
    }
    if(row.operation==='GRANT_ABILITY')assert.ok(row.after.some(ability=>ability.canonicalId===effect.ability.canonicalId&&
      JSON.stringify(ability.parameters)===JSON.stringify(effect.ability.parameters)),'Wrong canonical ability/parameters');
    if(row.operation==='GRANT_MODEL_ABILITY')assert.ok(row.after.some(ability=>ability.name===effect.ability.name&&ability.value<=effect.ability.value));
    if(row.operation==='GRANT_WEAPON_ABILITY')assert.ok(row.after.includes(effect.ability),'Wrong weapon ability');
    if(['GRANT_MODEL_KEYWORD','GRANT_UNIT_KEYWORD'].includes(row.operation))assert.ok(row.after.includes(effect.keyword),'Wrong keyword');
    if(row.operation==='REMOVE_ABILITY')assert.ok(!row.after.some(ability=>ability.canonicalId===effect.ability.canonicalId),'Target ability still present');
    if(row.operation==='MODIFY_ABILITY_RANGE')assert.equal(row.after,row.before+effect.value,'Wrong specific canonical range');
    if(row.operation==='MODIFY_RULE_METRIC')assert.deepEqual(row.after,{modifier:(row.before?.modifier||0)+effect.value},'Wrong typed UNIT metric');
    assert.ok(row.sourceFields.length&&row.lifetime,'Missing execution provenance');
  }
  // Each source operation family must execute, while mutually exclusive
  // standalone/formed bindings are intentionally alternate execution paths.
  for(const effect of fixture.expectedOperations)assert.ok(applied.some(row=>row.operation===effect.operation&&
    (effect.field===undefined||row.field===effect.field)),'Missing declared operation family: '+fixture.id);
  return applied;
}
export function removeSelection(state,id) {
  for(const raw of state.units) {
    if(raw.selectedMarkId===id)delete raw.selectedMarkId;
    for(const participant of [raw,...raw.modelRows]) {
      if(participant.selectedUpgradeIds)participant.selectedUpgradeIds=participant.selectedUpgradeIds.filter(value=>value!==id);
      participant.selections=(participant.selections||[]).filter(selection=>!selection.canonicalOptionIds?.includes(id));
      for(const loadout of participant.loadouts||[])loadout.selections=loadout.selections.filter(selection=>!selection.canonicalOptionIds?.includes(id));
    }
  }
  return state;
}
export async function run() {
  const original=JSON.stringify(book),canonical=JSON.stringify(importBook),matrix=[],checks={removeRestore:0,detachment:0,attachments:0};
  const valid=new Set(book.rosterEffectCensus.lowered);
  for(const fixture of fixtures) {
    const service=runtime(fixture),state=service.snapshot(),projection=service.projection;
    const applied=checkEffects(projection,fixture,state),source=state.units[0];
    const rule=book.entities.find(entity=>entity.id===fixture.owner);
    assert.deepEqual(state.units.map(raw=>raw.modelRows.map(row=>[row.canonicalProfileId,row.quantity])),
      imported(fixture).units.map(raw=>raw.modelRows.map(row=>[row.canonicalProfileId,row.quantity])),'Composition mutated');
    for(const row of projection.units.flatMap(unit=>unit.applied))assert.ok(valid.has(`${row.ruleId}::${row.clauseId}`),'Non-roster clause executed');
    service.load(clone(state));assert.deepEqual(service.projection,projection,'Non-deterministic rebuild');
    if(rule.kind==='ENHANCEMENT') {
      const removed=clone(state);removed.units[0].enhancementIds=[];removed.units[0].enhancementAssignments=[];
      // A conditional attachment permission is removed with its owning edge.
      if(fixture.owner==='detachment-murdertalon-raiders:enhancement:2')removed.attachments=[];
      service.load(removed);assert.equal(rows(service.projection,fixture).length,0,'Removed Enhancement still executes');
      service.load(state);assert.deepEqual(service.projection,projection);checks.removeRestore++;
    }
    if(rule.kind==='UPGRADE_OPTION') {
      service.load(removeSelection(clone(state),fixture.owner));assert.equal(rows(service.projection,fixture).length,0,'Unselected option executes');
      service.load(state);assert.deepEqual(service.projection,projection);checks.removeRestore++;
    }
    if(rule.ruleContract.detachmentId) {
      const removed=clone(state),detachmentId=rule.ruleContract.detachmentId;
      removed.detachments=[{instanceId:'replacement-detachment',canonicalDetachmentId:detachmentId==='detachment-veterans-of-the-long-war'?
        'detachment-deceptors':'detachment-veterans-of-the-long-war'}];removed.detachmentIds=removed.detachments.map(item=>item.canonicalDetachmentId);
      removed.attachments=[];
      for(const raw of removed.units){raw.enhancementIds=[];raw.enhancementAssignments=[];
        if(raw.selectedMarkId)removeSelection(removed,raw.selectedMarkId);}
      service.load(removed);assert.equal(rows(service.projection,fixture).length,0,'Unselected Detachment executes');
      service.load(state);assert.deepEqual(service.projection,projection);checks.detachment++;
    }
    const recipient=state.units[2],policy=recipient&&book.rosterAttachmentPolicies.find(policy=>
      policy.sourceId===source.canonicalUnitId&&policy.targetId===recipient.canonicalUnitId);
    if(policy) {
      const detached=clone(state);detached.attachments=[];service.load(detached);
      service.attach(recipient.instanceId,source.instanceId);const attached=service.projection;
      const targets=rows(attached,fixture);
      if(rule.kind==='ENHANCEMENT'&&fixture.expectedOperations.every(effect=>effect.targetBinding==='SOURCE_MODEL'))
        assert.ok(targets.every(row=>row.targetInstanceId===source.instanceId&&row.targetProfileId===fixture.bearerProfileId),'Bearer-only attachment leakage');
      service.detach(source.instanceId);assert.deepEqual(service.projection,runtimeFromState(detached).projection,'Detach did not rebuild from source');
      service.reattach(recipient.instanceId,source.instanceId);assert.deepEqual(service.projection,attached,'Reattach changed effective result');
      checks.attachments++;
    }
    matrix.push({CLAUSE_ID:fixture.id,OWNER:fixture.owner,SOURCE_EVIDENCE:fixture.sourceEvidence,
      SOURCE_CLAUSE:fixture.sourceClause,NEW_RECRUIT_TEXT:fixture.text,
      ROSTER_PREREQUISITES:{detachments:state.detachments,attachments:state.attachments,
        ...(state.initialAttachments?{initialAttachments:state.initialAttachments}:{}),
        importedChoices:state.units.map(raw=>({instanceId:raw.instanceId,canonicalUnitId:raw.canonicalUnitId,
          modelRows:raw.modelRows,selections:raw.selections,enhancementIds:raw.enhancementIds,
          enhancementAssignments:raw.enhancementAssignments,selectedMarkId:raw.selectedMarkId,selectedUpgradeIds:raw.selectedUpgradeIds}))},
      PHYSICAL_SOURCE_INSTANCE:rule.kind==='DETACHMENT_RULE'?null:source.instanceId,
      EXPECTED_RECIPIENT:fixture.expectedOperations.map(effect=>({binding:effect.targetBinding,subject:effect.targetSubject,
        candidatePhysicalInstances:effect.targetBinding.startsWith('ROSTER_')?state.units.map(raw=>raw.instanceId):
          effect.targetBinding==='SOURCE_FORMED_MODELS'||effect.targetBinding==='SOURCE_UNIT'&&effect.unitScope==='FORMED'?[source.instanceId,...state.attachments
            .filter(edge=>edge.leaderInstanceId===source.instanceId).map(edge=>edge.bodyguardInstanceId)]:
          effect.targetBinding==='LEADERS_OF_SOURCE'?state.attachments.filter(edge=>edge.bodyguardInstanceId===source.instanceId)
            .map(edge=>edge.leaderInstanceId):rule.kind==='ENHANCEMENT'||rule.kind==='UPGRADE_OPTION'?[source.instanceId]:
          state.units.filter(raw=>raw.canonicalUnitId===source.canonicalUnitId).map(raw=>raw.instanceId),
        sourceBackedConditions:effect.conditions,
        ...(effect.recipientSelectors?{recipientSelectors:effect.recipientSelectors}:{}),
        ...(effect.targetBinding==='SOURCE_MODEL'?{instanceId:source.instanceId,
          profileIds:rule.kind==='ENHANCEMENT'?[fixture.bearerProfileId]:source.modelRows.map(row=>row.canonicalProfileId)}:{})})),
      EXPECTED_EFFECT:fixture.expectedOperations,ACTUAL_EFFECT:applied,RESULT:'PASS'});
  }
  assert.deepEqual(new Set(matrix.map(row=>row.CLAUSE_ID)),valid);assert.equal(matrix.length,60);
  assert.deepEqual(book.rosterEffectCensus.deferred,[deferredClause]);
  for(const rule of book.entities)for(const clause of rule.ruleContract?.clauses||[])
    if(!valid.has(`${rule.id}::${clause.id}`))assert.deepEqual(clause.rosterEffects,[],'Non-executable payload');
  assert.equal(JSON.stringify(book),original,'Canonical runtime book mutated');assert.equal(JSON.stringify(importBook),canonical,'Import facts mutated');
  const artifact={schema:'roster-v2/source-execution-audit',sourceHead:'9439c9cc93da26ad916f9ce6941905e0619c5adc',
    executable:matrix.length,deferred:[deferredClause],
    battleBoundary:{contractClauses:book.entities.flatMap(rule=>rule.ruleContract?.clauses||[]).length,
      runtimeBattleOnlyClauses:book.entities.flatMap(rule=>rule.ruleContract?.clauses||[]).filter(clause=>clause.rosterClassification==='BATTLE_ONLY').length,
      note:'Explicit battle-only classifications are preserved from canonical declarations. Every non-executable contract clause has an empty effect payload.'},
    checks,matrix};
  const path=new URL('./audit/roster-execution-matrix.json',import.meta.url),text=JSON.stringify(artifact,null,2)+'\n';
  if(process.argv.includes('--write')){fs.mkdirSync(new URL('./audit/',import.meta.url),{recursive:true});fs.writeFileSync(path,text);}
  else assert.equal(fs.readFileSync(path,'utf8'),text,'Stale imported execution matrix');
  console.log(JSON.stringify({status:'PASS',realImportedClauses:matrix.length,effects:matrix.reduce((sum,row)=>sum+row.ACTUAL_EFFECT.length,0),...checks,
    deferred:[deferredClause],battleEffectLeakage:0,canonicalMutation:0}));
  return artifact;
}
export function runtimeFromState(state,inputBook=book){const service=createCSMRosterRuntime(inputBook,importBook,bindings);service.load(state);return service;}
if(process.argv[1]&&fileURLToPath(import.meta.url)===fs.realpathSync(process.argv[1]))await run();
