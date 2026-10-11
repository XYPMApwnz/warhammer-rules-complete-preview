/** Shared canonical roster compatibility view. No rule execution or inferred battle state. */
import {evaluateRequiredRecipients,includeRecipientFeasibility,evaluateCompatibilityRole} from './compatibility-feasibility.mjs';
import {enhancementOwnerContext} from './compatibility-context.mjs';
const any = values=>values.includes('INVALID')?'INVALID':values.includes('TRUE')?'TRUE':values.includes('UNKNOWN')?'UNKNOWN':'FALSE';
export function projectRosterRelated({book,state,projection,context,evaluateRole,publicResult},instanceId,detachmentId=null) {
  const records=new Map(book.entities.map(entity=>[entity.id,entity]));
  if (detachmentId && records.get(detachmentId)?.kind!=='DETACHMENT') throw new TypeError('Unresolved filter Detachment');
  const unit = projection.units.find(u=>u.instanceId===instanceId);if (!unit) throw new TypeError('Unresolved physical related context');
  const rows = [];
  for (const rule of book.entities.filter(e=>['STRATAGEM','ENHANCEMENT'].includes(e.ruleContract?.kind))) {
    const contract=rule.ruleContract;
    if (!state.detachmentIds.includes(contract.detachmentId)) continue;
    if (detachmentId && contract.detachmentId!==detachmentId) continue;
    const roleIds=contract.compatibilityRoleIds || [contract.roles[0]?.id];
    const roleContexts=(candidate,role)=>(role.subject==='MODEL'?
      candidate.profiles.map(m=>context(candidate.instanceId,'MODEL',m.scopeId)):
      [context(candidate.instanceId,role.subject)]).filter(Boolean).map(context=>enhancementOwnerContext(contract,context));
    const states=contract.roles.filter(role=>roleIds.includes(role.id)).map(role=>{
      return any(roleContexts(unit,role).map(context=>evaluateCompatibilityRole(contract,role,context,
        {evaluateRole,contextsForRole:primary=>projection.units.flatMap(candidate=>roleContexts(candidate,primary))})));
    });
    const recipient=evaluateRequiredRecipients(contract,unit.canonicalUnitId,state.units,
      {book,evaluateRole,sourceInstanceId:instanceId,contextFor:(candidate,subject)=>context(candidate.instanceId,subject)});
    const result=includeRecipientFeasibility(any(states),recipient);
    if (result==='INVALID') throw new TypeError('Invalid roster-aware rule: '+rule.id);
    rows.push({unitId:unit.canonicalUnitId,instanceId,ruleId:rule.id,detachmentId:contract.detachmentId,kind:contract.kind,state:result,applicability:publicResult[result]});
  }
  return rows;
}
