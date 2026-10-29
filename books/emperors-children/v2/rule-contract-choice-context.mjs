/** Source-owned choice identity and diagnostics; physical computation is shared. */
import {createEquippedWeaponChoiceConditionContext} from '../../shared/roster-v2/physical-condition-context.mjs';
import {bladeId} from './rule-contract-schema.mjs';

export function weaponChoiceContext(book,state,schema){
 return createEquippedWeaponChoiceConditionContext(book,state,schema,{ruleId:bladeId,
  conditionArguments:{key:'selectedUpgrade',selectionGroupId:bladeId,selectionMode:'VALIDATED_EQUIPPED_WEAPON'},messages:{
   list:'Malformed canonical choice list',unknown:'Unknown canonical choice',agreement:'Canonical choice state and selection disagree',
   one:'Select exactly one Possessed Blade weapon',duplicate:'Duplicate Possessed Blade selection',
   equipment:'Weapon decision cannot add equipment or multiple choices',owner:'Foreign weapon choice owner',
   bearer:'Ambiguous Possessed Blade MODEL bearer',physical:'Weapon choice has no physical bearer binding',
   weapon:'Selected Possessed Blade weapon is not equipped by the bearer'}});
}
