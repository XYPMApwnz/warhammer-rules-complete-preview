import {sourceSnapshot} from '../source-refs-v2/source-refs.mjs';
/** Small assertion helper, not an effect interpreter. Independent reviewed
 * expectations and case adapters supply exact observations (numeric, ability
 * or keyword deltas). Production contracts never create the expected set. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {resolveExecutionEffect} from './recipient-execution.mjs';
export function assertSourceEffectExpectation({expectation,book,applied,observation,expectedObservation}) {
  const {source,expectedOperation}=expectation;
  const entity=book.entities.find(e=>e.id===source.canonicalId);
  assert.ok(entity,'SOURCE PRESENT: '+source.canonicalId);
  assert.equal(entity.parentId,source.ownerId,'SOURCE OWNER: '+source.canonicalId);
  assert.equal(source.field.reduce((value,key)=>value?.[key],entity.data),source.quote,'SOURCE TEXT: '+source.canonicalId);
  assert.ok(sourceSnapshot(entity),'SOURCE PROVENANCE: '+source.canonicalId);
  assert.ok(entity.ruleContract,'CONTRACT PRESENT: '+source.canonicalId);
  const effects=entity.ruleContract.clauses.filter(clause=>!expectation.expectedClauseId||clause.id===expectation.expectedClauseId)
    .flatMap(clause=>(clause.rosterEffects||[]).map(effect=>({clause,effect})))
    .filter(({effect})=>effect.operation===expectedOperation.operation&&effect.field===expectedOperation.field);
  assert.ok(effects.length,'EXECUTABLE BINDING REQUIRED: '+source.canonicalId);
  for(const {clause,effect:declaration}of effects){
    const effect=resolveExecutionEffect(entity,clause,declaration);
    assert.equal(clause.rosterClassification,'ROSTER_EXECUTABLE','Permanent obligation classified as non-executable');
    for(const [key,value]of Object.entries(expectedOperation))assert.deepEqual(effect[key],value,'TYPED OPERATION: '+key);
  }
  assert.ok(applied.length,'EXECUTOR EFFECT REQUIRED: '+source.canonicalId);
  assert.deepEqual(observation,expectedObservation,'SOURCE OBLIGATION -> EXECUTOR/PRESENTATION');
}
export function assessEffectCoverage(ledger,expectations,verifiedCaseIds){
  const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
  assert.equal(sha(ledger.historicalRows),ledger.historicalRowsSha256,'Independent historical census changed without source review');
  const ids=new Set();for(const row of ledger.historicalRows){assert.ok(row.id&&!ids.has(row.id),'Duplicate coverage identity');ids.add(row.id);}
  const verified=new Set(verifiedCaseIds),historical=expectations.filter(e=>e.auditRowId);
  const current=new Map(historical.map(e=>[e.auditRowId,e]));
  assert.equal(new Set(expectations.map(e=>e.id)).size,expectations.length,'Duplicate current test identity');
  assert.equal(current.size,historical.length,'Duplicate current source obligation');
  for(const e of expectations){
    if(e.auditRowId){
      assert.ok(ids.has(e.auditRowId),'Unreviewed source obligation');
      const accepted=ledger.historicalRows.find(row=>row.id===e.auditRowId);
      assert.equal(accepted.bookId,e.bookId);assert.equal(accepted.canonicalId,e.source.canonicalId);assert.equal(accepted.required,true);
    }else{
      const reviewed=ledger.newRequirements.filter(row=>row.caseId===e.id&&row.bookId===e.bookId&&row.canonicalId===e.source.canonicalId&&
        row.reviewDecision==='EXECUTABLE_REQUIRED'&&row.sourceEvidence);
      assert.equal(reviewed.length,1,'New expectation requires exact independent source review');
    }
    assert.ok(verified.has(e.id),'Unverified current obligation: '+e.id);
  }
  // This is an explicit extension point for reviewed requirements, not a
  // classifier that guesses obligations or accepts missing contracts as prose.
  for(const added of ledger.newRequirements){
    assert.ok(added.sourceEvidence&&added.canonicalId&&added.reviewDecision,'New requirement lacks independent review');
    if(added.reviewDecision==='EXECUTABLE_REQUIRED'){
      const reviewed=expectations.find(e=>e.id===added.caseId&&e.bookId===added.bookId&&e.source.canonicalId===added.canonicalId);
      assert.ok(reviewed&&verified.has(added.caseId),'New executable requirement has no passing effect guard');
    }
    else assert.ok(['CAPABILITY_MISSING','SOURCE_AMBIGUOUS','UNVERIFIED','BATTLE_DEPENDENT'].includes(added.reviewDecision),'Unknown requirement disposition');
  }
  const statuses={},requiredStatuses={};for(const row of ledger.historicalRows){
    const status=current.has(row.id)?'VERIFIED_BY_CURRENT_GUARD':row.baselineClassification==='EXECUTABLE_PRESENT'?'HISTORICALLY_PRESENT_NOT_RETESTED':row.baselineClassification;
    statuses[status]=(statuses[status]||0)+1;
    if(row.required)requiredStatuses[status]=(requiredStatuses[status]||0)+1;
  }
  return {freshlyVerified:verified.size,historicalRequired:ledger.historicalRows.filter(row=>row.required).length,requiredStatuses,statuses,
    newRequirementDecisions:ledger.newRequirements.map(row=>({canonicalId:row.canonicalId,decision:row.reviewDecision,
      verified:row.reviewDecision==='EXECUTABLE_REQUIRED'&&verified.has(row.caseId)})),allRequirementsPassed:false,
    completenessBoundary:'Only independently reviewed obligations are known; no arbitrary new English rule discovery. Historical PRESENT is not a fresh PASS.'};
}
