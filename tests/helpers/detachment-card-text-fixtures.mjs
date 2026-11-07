/** Literal O-3 expectations use constructed physical snapshots, not real exports. */
import assert from 'node:assert/strict';
import {validateRoster,withRosterDetachments,changeAttachment} from '../../books/shared/roster-v2/context.mjs';
import {executeRosterEffects,validateRosterEffects} from '../../books/shared/roster-v2/effects.mjs';
import {createRuleContractSchema} from '../../books/shared/rule-contract-v2/schema.mjs';
import * as dgSchema from '../../books/death-guard/v2/rule-contract-schema.mjs';
import {createECRuleSchema} from '../../books/emperors-children/v2/rule-contract-schema.mjs';
import {createSpaceMarinesRuleSchema} from '../../books/space-marines/v2/rule-contract-schema.mjs';
import {createBloodAngelsRuleSchema} from '../../books/blood-angels/v2/rule-contract-schema.mjs';
import {createDarkAngelsRuleSchema} from '../../books/dark-angels/v2/rule-contract-schema.mjs';
import {createTauRuleSchema} from '../../books/tau-empire/v2/rule-contract-schema.mjs';
import {createTyranidsRuleSchema} from '../../books/tyranids/v2/roster-source-choices.mjs';

export const detachmentBookFiles={
  'space-marines':'roster-runtime','blood-angels':'roster-runtime','dark-angels':'roster-runtime',
  'tau-empire':'roster-import','death-guard':'rule-contract-effective','tyranids':'roster-runtime',
  'emperors-children':'roster-attachments'
};
export function detachmentSnapshot(book,spec){
  const units=spec.units.map(record=>{
    const canonical=book.entities.find(entity=>entity.id===record.unitId);
    assert(canonical?.kind==='DATASHEET','Literal fixture DATASHEET is missing: '+record.unitId);
    assert(canonical.data.profileIds.includes(record.profileId),'Literal fixture MODEL is outside its DATASHEET');
    return {instanceId:record.instanceId,canonicalUnitId:record.unitId,startingStrength:record.quantity,
      modelRows:[{rowId:'physical-row-1',canonicalProfileId:record.profileId,quantity:record.quantity,selections:[],loadouts:[]}],
      selections:[],enhancementIds:[],warlord:null};
  });
  const snapshot={schema:'roster-v2/roster',bookId:book.bookId,rosterId:'independent-o3/'+spec.id,
    detachments:[{instanceId:'detachment/1',canonicalDetachmentId:spec.detachmentId}],detachmentIds:[spec.detachmentId],
    units,attachments:[],warlordInstanceId:null};
  return spec.attachment?changeAttachment(book,snapshot,book.rosterAttachmentPolicies,'ATTACH',
    spec.attachment.leader,spec.attachment.bodyguard):snapshot;
}
export function executeDetachmentSnapshot(book,snapshot){
  const factories={'death-guard':()=>dgSchema,'emperors-children':createECRuleSchema,'space-marines':createSpaceMarinesRuleSchema,
    'blood-angels':createBloodAngelsRuleSchema,'dark-angels':()=>createDarkAngelsRuleSchema({book,state:snapshot}),
    'tau-empire':createTauRuleSchema,'tyranids':createTyranidsRuleSchema};
  const api=withRosterDetachments(factories[book.bookId]?.()||createRuleContractSchema(book.rosterSchema));
  validateRosterEffects(book,api.validatePredicate,api.evaluatePredicate);
  return executeRosterEffects(book,validateRoster(book,snapshot,book.rosterAttachmentPolicies),api);
}
