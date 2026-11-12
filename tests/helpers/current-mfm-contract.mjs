/** Only current central ownership may replace historical MFM provenance. */
import assert from 'node:assert/strict';
export function currentMfmContractExpectation(historical,{bookId,resolveOwnedFact}){
 const expected=structuredClone(historical),reference=expected.mfmReferences;
 if(reference){
  assert(reference.provenance&&reference.enhancementId,'Protected MFM reference must retain an explicit enhancement owner');
  const record=resolveOwnedFact(reference.enhancementId);
  assert(Object.isFrozen(record),'Current MFM owner must be immutable');
  assert.equal(record.factionId,bookId,'Protected contract has a foreign MFM owner');
  assert.equal(record.recordType,'MFM_ENHANCEMENT_COST','Protected contract must retain its MFM record type');
  assert.equal(record.id,reference.enhancementId);assert.equal(record.detachmentId,reference.detachmentId);
  assert.deepEqual(record.qualifierIds,reference.qualifierIds,'Protected contract qualifier identities changed');
  reference.provenance=structuredClone(record.provenance);
 }
 return expected;
}
