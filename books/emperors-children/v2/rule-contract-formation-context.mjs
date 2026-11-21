/** Source-owned historical formation binding; physical computation is shared. */
import {createRosterConditionBinding} from '../../shared/roster-v2/condition-binding.mjs';
import {weaponChoiceInputs} from './rule-contract-choice-context.mjs';
import {validateInstrumentSelections} from './roster-equipment-context.mjs';

export function createFormationContext(book,state,schema){
 validateInstrumentSelections(book,state);
 const binding=(book.conditionComputations||Object.values(book.rosterContextBindings||{})).find(row=>row.kind==='INITIAL_ATTACHMENT');
 return createRosterConditionBinding({book,state,schema,rosterDetachments:true,
  inputs:[...weaponChoiceInputs(),{key:'initialAttachmentBattleline',binding,messages:{
   step:'Unconfirmed initial attachment timing',missing:'Missing Declare Battle Formations snapshot',malformed:'Malformed initial snapshot'}}]});
}
