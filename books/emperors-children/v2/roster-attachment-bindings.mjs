/** EC attachment identities are references to central MFM, never keyword joins. */
import assert from 'node:assert/strict';
import {consumeMfm,resolveOwnedFact} from './mfm-boundary.mjs';
import {getRecordedSourceIdentity,sourceSnapshot} from '../../shared/source-refs-v2/source-refs.mjs';
const clone=structuredClone;
export const exaltedId='detachment-court-of-the-phoenician:enhancement:2';

export function buildECAttachmentBindings(book,mfm=consumeMfm(book.entities)) {
  const records=new Map(book.entities.map(e=>[e.id,e]));
  const policies=mfm.leaderEligibilityBindings.flatMap(binding=>{
    const owned=resolveOwnedFact(binding.mfmRecordId),section=records.get(binding.sourceEntityId);
    assert.equal(owned.recordType,'MFM_LEADER_ELIGIBILITY');
    assert.equal(section?.parentId,binding.sourceUnitId);
    assert.ok(getRecordedSourceIdentity(section,{book})&&sourceSnapshot(section,{book})?.document);
    return binding.targetUnitIds.map(targetId=>{
      assert.equal(records.get(targetId)?.kind,'DATASHEET');
      return {sourceId:binding.sourceUnitId,targetId,role:'LEADER',additionalLeaders:0,
        sourceIds:[binding.sourceEntityId],mfmReferenceId:binding.mfmRecordId};
    });
  });
  assert.equal(policies.length,8);assert.equal(new Set(policies.map(p=>p.sourceId+'/'+p.targetId)).size,8);
  const rule=records.get(exaltedId),binding=mfm.qualifierBindings.find(b=>b.entityId===exaltedId);
  const qualifier=resolveOwnedFact(binding?.mfmRecordId);
  assert.equal(rule?.parentId,'detachment-court-of-the-phoenician');
  assert.equal(rule.data.text,'LORD EXULTANT model only. Add 1" to the Move characteristic of the bearer.');
  assert.equal(qualifier.kind,'LEADER');assert.deepEqual(qualifier.values,['FLAWLESS BLADES']);
  assert.equal(qualifier.ownerId,resolveOwnedFact(mfm.enhancementBindings.find(b=>b.entityId===exaltedId).mfmRecordId).id);
  assert.ok(!policies.some(p=>p.sourceId==='unit-lord-exultant'&&p.targetId==='unit-flawless-blades'));
  const adjudications=[{ruleId:exaltedId,classification:'D_UNDERDETERMINED',status:'UNRESOLVED',
    proposedSourceId:'unit-lord-exultant',proposedTargetId:'unit-flawless-blades',applied:false,
    decision:'LEADER: FLAWLESS BLADES does not establish whether the tag grants attachment or restricts eligibility. No extra relation is enrolled. The explicit MODEL Move +1 rule is unchanged; army legality is not assessed.',
    qualifier:{mfmReferenceId:qualifier.id,label:qualifier.label,provenance:clone(qualifier.provenance)},
    evidence:[{entityId:rule.id,field:['text'],quote:rule.data.text,provenance:sourceSnapshot(rule,{book})},
      {entityId:'datasheet-lord-exultant:section:3',provenance:sourceSnapshot(records.get('datasheet-lord-exultant:section:3'),{book})},
      {document:'books/emperors-children/v2/sources/emperors-children-faction-pack-v1.3.pdf',page:5,
        sha256:'18A192A36C22468368D957AAC3EB230A40C8F7BBFAEFA46372D8918422B0B49A',
        quote:'LORD EXULTANT model only. Add 1" to the Move characteristic of the bearer.'},
      {document:'mfm/sources/v1.6/emperors-children.html',line:269,
        sha256:'C00C12EAF3A065958DCF1298B21B46E26BC6DF0868A1F084919712BD98DD2EBD',quote:'LEADER: FLAWLESS BLADES'}]}];
  return {policies,adjudications};
}
