import {resolveRecipient} from '../rule-contract-v2/recipients.mjs';

const legacyAddressFields=['targetBinding','targetSubject','unitScope','recipientSelectors','containingUnitScope',
  'targetRoleId','recipientRoleId','recipientRoleIds','recipientIds'];
export const executionBindingSubjects=Object.freeze({SOURCE_MODEL:'MODEL',SOURCE_UNIT:'UNIT',SOURCE_UNIT_MODELS:'MODEL',
  SOURCE_FORMED_MODELS:'MODEL',LEADERS_OF_SOURCE:'MODEL',ROSTER_UNITS:'UNIT',ROSTER_MODELS:'MODEL'});
/** Resolve only canonical recipient references. These aliases are a disposable
 * execution view for the existing operations, never a second canonical format.
 * In particular an absent scope stays absent: old unscoped metric projection
 * has observable behaviour distinct from an explicitly scoped UNIT metric. */
export function resolveExecutionEffect(rule,clause,effect) {
  if(clause?.recipientStatus!=='RECORDED'||!effect||typeof effect.recipientId!=='string'||!effect.recipientId||
      legacyAddressFields.some(field=>Object.hasOwn(effect,field)))
    throw new TypeError('Roster effect requires a canonical recipient reference');
  const recipient=resolveRecipient(rule,clause,effect.recipientId);
  if(!recipient||!['MODEL','UNIT'].includes(recipient.who)||executionBindingSubjects[recipient.from]!==recipient.who||
      recipient.side!=='FRIENDLY'||recipient.how!=='ROSTER')
    throw new TypeError('Executable effect requires a friendly roster recipient');
  return {...effect,targetBinding:recipient.from,targetSubject:recipient.who,
    ...(recipient.scope===undefined?{}:{unitScope:recipient.scope}),
    ...(recipient.recipientSelectors===undefined?{}:{recipientSelectors:recipient.recipientSelectors}),
    ...(recipient.containingUnitScope===undefined?{}:{containingUnitScope:recipient.containingUnitScope})};
}
