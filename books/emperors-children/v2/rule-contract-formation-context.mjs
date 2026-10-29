/** Source-owned historical formation binding; physical computation is shared. */
import {withRosterDetachments} from '../../shared/roster-v2/context.mjs';
import {createInitialAttachmentConditionContext} from '../../shared/roster-v2/physical-condition-context.mjs';
import {weaponChoiceContext} from './rule-contract-choice-context.mjs';
import {validateInstrumentSelections} from './roster-equipment-context.mjs';

export function createFormationContext(book,state,schema){
 validateInstrumentSelections(book,state);
 const binding=(book.conditionComputations||Object.values(book.rosterContextBindings||{})).find(row=>row.kind==='INITIAL_ATTACHMENT');
 const kernel=withRosterDetachments(schema),bind=createInitialAttachmentConditionContext(book,state,{binding,
  conditionArguments:{key:'initialAttachmentBattleline'},bindContext:weaponChoiceContext(book,state,schema),messages:{
   step:'Unconfirmed initial attachment timing',missing:'Missing Declare Battle Formations snapshot',malformed:'Malformed initial snapshot'}});
 return {...kernel,evaluatePredicate:(node,context)=>kernel.evaluatePredicate(node,bind(context)),
  evaluateRole:(role,conditions,context)=>kernel.evaluateRole(role,conditions,bind(context))};
}
