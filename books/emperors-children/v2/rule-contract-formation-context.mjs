/** EC input binding only. All predicates, grants and recompute remain in shared
 * V2. No current attachment is inferred to have occurred at a historical step. */
import assert from 'node:assert/strict';
import {validateRoster,withRosterDetachments} from '../../shared/roster-v2/context.mjs';

export function createFormationContext(book,state,schema) {
  const binding=book.rosterContextBindings?.lordOfHostDeclaredBattleline;
  const kernel=withRosterDetachments(schema),records=new Map(book.entities.map(e=>[e.id,e]));
  let initial;
  if(state.initialAttachmentStep!==undefined) {
    assert.equal(state.initialAttachmentStep,binding?.step,'Unconfirmed initial attachment timing');
    assert.ok(Array.isArray(state.initialAttachments),'Missing Declare Battle Formations snapshot');
    // Same source-owned attachment policies validate historical evidence. It
    // is independent of the current formation; no invented expiry on detach.
    initial=validateRoster(book,{...state,attachments:structuredClone(state.initialAttachments)},book.rosterAttachmentPolicies).attachments;
  } else if(state.initialAttachments!==undefined) {
    assert.ok(Array.isArray(state.initialAttachments),'Malformed initial snapshot');
    // An undated snapshot does not establish the named source timing.
  }
  const bind=context=>{
    if(!binding||context?.subject!=='MODEL'||context.modelId!==binding.profileId)return context;
    const roster={...context.roster};delete roster.lordOfHostDeclaredBattleline;
    if(initial!==undefined) {
      const unit=state.units.find(u=>u.instanceId===context.instanceId);
      const edge=initial.find(e=>e.leaderInstanceId===unit?.instanceId);
      const bodyguard=state.units.find(u=>u.instanceId===edge?.bodyguardInstanceId),data=records.get(bodyguard?.canonicalUnitId)?.data;
      roster.lordOfHostDeclaredBattleline=unit?.canonicalUnitId===binding.sourceId&&Boolean(data&&
        binding.bodyguardKeywords.every(keyword=>[...data.keywords,...data.factionKeywords].includes(keyword)));
    }
    return {...context,roster};
  };
  return {...kernel,evaluatePredicate:(node,context)=>kernel.evaluatePredicate(node,bind(context)),
    evaluateRole:(role,conditions,context)=>kernel.evaluateRole(role,conditions,bind(context))};
}
