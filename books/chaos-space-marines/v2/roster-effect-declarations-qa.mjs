import assert from 'node:assert/strict';
import {buildCSMContracts} from './rule-contract-build.mjs';
import {buildCSMRosterEffectBook,executableClauses,deferredClause} from './roster-effect-build.mjs';
import {evaluateCSMRosterDeclarations} from './roster-effect-context.mjs';
import {clauseFixture} from './roster-effect-fixture.mjs';
import {changeAttachment} from '../../shared/roster-v2/context.mjs';

const clone=structuredClone,built=buildCSMContracts(),original=JSON.stringify(built.book),book=buildCSMRosterEffectBook(built);
const snapshot=JSON.stringify(book),seen=new Set(),results=[];
const rows=(result,ruleId,clauseId)=>result.units.flatMap(u=>u.applied).filter(r=>r.ruleId===ruleId&&r.clauseId===clauseId);
for(const {rule:canonical,clause:typed} of executableClauses(built)) {
  const fixture=clauseFixture(book,canonical.id,typed.id),{state,rule,clause}=fixture;
  const result=evaluateCSMRosterDeclarations(book,state),applied=rows(result,rule.id,clause.id);
  assert.ok(applied.length,'Executable clause did not apply: '+rule.id+'::'+clause.id);
  for(const row of applied) {
    const effect=clause.rosterEffects.find(e=>e.id===row.effectId);
    assert.ok(effect,'Unbound effective operation');
    assert.equal(row.ruleId,effect.provenance.canonicalRuleId);assert.equal(row.clauseId,effect.provenance.canonicalClauseId);
    assert.ok(effect.provenance.sourceEvidence.length);assert.ok(effect.lifetime&&effect.sourceFields.length);
    if(['ENHANCEMENT','UPGRADE_OPTION'].includes(rule.kind))assert.equal(row.sourceInstanceId,'a','Source physical ownership leaked: '+rule.id);
    else if(rule.kind!=='DETACHMENT_RULE')assert.ok(row.targetInstanceId===row.sourceInstanceId||
      state.attachments.some(edge=>edge.leaderInstanceId===row.sourceInstanceId&&edge.bodyguardInstanceId===row.targetInstanceId),
      'Datasheet effect crossed unrelated physical instances: '+rule.id);
    if(effect.operation==='MODIFY_STAT') {
      if(effect.mode==='SET')assert.equal(Number.parseInt(row.after),effect.value,'Effective numeric SET changed');
      else if(/^-?\d+["+]?$/.test(String(row.before)))
        assert.equal(Number.parseInt(row.after),Number.parseInt(row.before)+effect.value,'Effective numeric ADD changed');
      else assert.ok(row.after!==row.before,'Dice-expression modifier was dropped');
    }
    if(effect.operation==='GRANT_ABILITY')assert.ok(row.after.some(a=>a.canonicalId===effect.ability.canonicalId&&JSON.stringify(a.parameters)===JSON.stringify(effect.ability.parameters)));
    if(effect.operation==='GRANT_WEAPON_ABILITY')assert.ok(row.after.includes(effect.ability));
    if(effect.operation==='GRANT_MODEL_ABILITY')assert.ok(row.after.some(a=>a.name===effect.ability.name&&a.value<=effect.ability.value));
    if(effect.operation==='GRANT_MODEL_KEYWORD'||effect.operation==='GRANT_UNIT_KEYWORD')assert.ok(row.after.includes(effect.keyword));
    if(effect.operation==='REMOVE_ABILITY')assert.ok(!row.after.some(a=>a.canonicalId===effect.ability.canonicalId));
    if(effect.operation==='MODIFY_ABILITY_RANGE')assert.equal(row.after,row.before+effect.value);
  }
  if(['ENHANCEMENT','UPGRADE_OPTION'].includes(rule.kind))assert.ok(!applied.some(r=>['b','unrelated'].includes(r.targetInstanceId)),'Unrelated physical instance changed');
  const again=evaluateCSMRosterDeclarations(book,clone(state));assert.deepEqual(again,result,'Rebuild is not deterministic');
  if(rule.kind==='ENHANCEMENT') {
    const removed=clone(state);removed.units[0].enhancementIds=[];removed.units[0].enhancementAssignments=[];
    assert.equal(rows(evaluateCSMRosterDeclarations(book,removed),rule.id,clause.id).length,0,'Removed Enhancement still executes');
    assert.deepEqual(evaluateCSMRosterDeclarations(book,state),result);
  }
  if(rule.kind==='UPGRADE_OPTION') {
    const removed=clone(state);removed.units[0].selectedUpgradeIds=[];
    assert.equal(rows(evaluateCSMRosterDeclarations(book,removed),rule.id,clause.id).length,0,'Unselected Upgrade still executes');
    assert.deepEqual(evaluateCSMRosterDeclarations(book,state),result);
  }
  if(rule.ruleContract.detachmentId) {
    const removed=clone(state);removed.detachmentIds=['detachment-veterans-of-the-long-war'];removed.detachments=[{instanceId:'detachment/1',canonicalDetachmentId:removed.detachmentIds[0]}];
    if(rule.kind==='ENHANCEMENT') {
      assert.throws(()=>evaluateCSMRosterDeclarations(book,removed),/Unresolved Enhancement context/);
      removed.units[0].enhancementIds=[];removed.units[0].enhancementAssignments=[];removed.units[0].selectedMarkId=null;
    }
    if(rule.id==='detachment-pactbound-zealots:rule') {
      assert.throws(()=>evaluateCSMRosterDeclarations(book,removed),/Unresolved selected canonical Mark/);
      for(const unit of removed.units)unit.selectedMarkId=null;
    }
    assert.equal(rows(evaluateCSMRosterDeclarations(book,removed),rule.id,clause.id).length,0,'Unselected Detachment still executes');
    assert.deepEqual(evaluateCSMRosterDeclarations(book,state),result);
  }
  const policy=book.rosterAttachmentPolicies.find(p=>p.sourceId===state.units[0].canonicalUnitId&&p.targetId===state.units.find(u=>u.instanceId==='bodyguard')?.canonicalUnitId);
  if(policy) {
    const attached=state.attachments.length?state:changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','a','bodyguard');
    const formed=evaluateCSMRosterDeclarations(book,attached),effect=clause.rosterEffects[0];
    if(rule.kind==='ENHANCEMENT'&&effect.targetBinding==='SOURCE_UNIT_MODELS')assert.ok(rows(formed,rule.id,clause.id).some(r=>r.targetInstanceId==='bodyguard'),'Current bearer UNIT did not include attached members: '+rule.id);
    if(effect.targetBinding==='SOURCE_MODEL')assert.ok(!rows(formed,rule.id,clause.id).some(r=>r.targetInstanceId==='bodyguard'),'Bearer MODEL escaped into bodyguard');
    const detached=changeAttachment(book,attached,book.rosterAttachmentPolicies,'DETACH','a');
    const restored=changeAttachment(book,detached,book.rosterAttachmentPolicies,'ATTACH','a','bodyguard');
    assert.deepEqual(evaluateCSMRosterDeclarations(book,restored),formed,'Attach/detach/reattach changed result');
  }
  seen.add(`${rule.id}::${clause.id}`);results.push({id:`${rule.id}::${clause.id}`,operationsApplied:applied.length});
}
assert.deepEqual(seen,new Set(book.rosterEffectCensus.lowered));assert.equal(seen.size,58);
assert.deepEqual(book.rosterEffectCensus.deferred,[deferredClause]);
assert.equal(book.entities.find(r=>r.id==='army-rule-cult-of-the-dark-gods').ruleContract.clauses.flatMap(c=>c.rosterEffects).length,0);
assert.equal(book.entities.find(r=>r.id==='detachment-huron-s-marauders:enhancement:1').ruleContract.clauses[0].rosterClassification,'DISPLAY_ONLY');
for(const r of book.entities)for(const c of r.ruleContract?.clauses||[])if(c.rosterClassification!=='ROSTER_EXECUTABLE')assert.deepEqual(c.rosterEffects,[]);
assert.equal(JSON.stringify(book),snapshot,'Canonical runtime input mutated');assert.equal(JSON.stringify(built.book),original);
console.log(JSON.stringify({status:'PASS',expressible:seen.size,deferred:[deferredClause],sourceBound:true,deterministic:true,
  physicalIsolation:true,attachDetach:true,removeRestore:true,battleEffectLeakage:0,results}));
