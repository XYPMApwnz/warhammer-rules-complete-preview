/** Reviewed Stage4B source spans. These policies never simulate battle events.
 * Source text and provenance are bound from the unchanged mechanical ledger.
 */
export const activeConditionalPolicyKinds=Object.freeze(['QUALIFIED_FNP','REROLL','INCOMING_MODIFIER','IGNORE_MODIFIERS']);
export const conditionalPolicyDeclarations=Object.freeze([
 {recordId:'review/ability-da-57f090f793034b989e2a/text/0:86',kind:'QUALIFIED_FNP',recipientScope:'FORMED_UNIT',payload:{threshold:4,damageKinds:['PSYCHIC_ATTACK','MORTAL_WOUND']}},
 {recordId:'review/ability-da-7a6bf94476794dfcbaa6/text/0:86',kind:'QUALIFIED_FNP',recipientScope:'FORMED_UNIT',payload:{threshold:4,damageKinds:['PSYCHIC_ATTACK','MORTAL_WOUND']}},
 {recordId:'review/ability-da-7dbc5ddbc014411bb290/text/0:95',kind:'QUALIFIED_FNP',recipientScope:'FORMED_UNIT',payload:{threshold:3,damageKinds:['PSYCHIC_ATTACK','MORTAL_WOUND']}},
 {recordId:'review/ability-da-8db740d71770467d858e/text/0:162',kind:'QUALIFIED_FNP',recipientScope:'AURA_UNRESOLVED',activationReferenceId:'ability-da-2ed6377b2f794e0ea8af',payload:{threshold:5,damageKinds:['PSYCHIC_ATTACK','MORTAL_WOUND']},aura:{range:6,allegiance:'FRIENDLY',unitKeyword:'DARK ANGELS'}},
 {recordId:'review/ability-da-4d018955efb84dfc9751/text/0:66',kind:'REROLL',recipientScope:'FORMED_UNIT',payload:{roll:'HIT',results:'ALL',weaponMode:'melee'}},
 {recordId:'review/ability-da-531bbeae023c4f4fa766/text/110:135',kind:'REROLL',recipientScope:'AURA_UNRESOLVED',activationReferenceId:'ability-da-2ed6377b2f794e0ea8af',payload:{roll:'HIT',results:'ONES',weaponMode:'melee'},aura:{range:6,allegiance:'FRIENDLY',unitKeyword:'DARK ANGELS'}},
 {recordId:'review/ability-da-531bbeae023c4f4fa766/text/136:163',kind:'REROLL',recipientScope:'AURA_UNRESOLVED',activationReferenceId:'ability-da-2ed6377b2f794e0ea8af',payload:{roll:'WOUND',results:'ONES',weaponMode:'melee'},aura:{range:6,allegiance:'FRIENDLY',unitKeyword:'DARK ANGELS'}},
 {recordId:'review/enhancement-da-822dfec678424ec293c2/text/46:81',kind:'REROLL',recipientScope:'FORMED_UNIT',payload:{roll:'CHARGE',results:'ALL'}},
 {recordId:'review/enhancement-da-fb83cfb304e74056b819/text/86:125',kind:'REROLL',recipientScope:'FORMED_UNIT',payload:{roll:'WEAPON_ATTACKS',results:'ALL'}},
 {recordId:'review/enhancement-da-fb83cfb304e74056b819/text/126:141',kind:'REROLL',recipientScope:'FORMED_UNIT',payload:{roll:'HAZARD',results:'ALL'}},
 {recordId:'review/ability-da-490661bbb1ff4d45a4b8/text/0:111',kind:'INCOMING_MODIFIER',recipientScope:'FORMED_UNIT',payload:{field:'WOUND_ROLL',mode:'ADD',value:-1,comparison:'ATTACK_STRENGTH_GT_TARGET_TOUGHNESS'}},
 {recordId:'review/ability-da-6fefb0cfda4848bf9dd1/text/48:107',kind:'INCOMING_MODIFIER',recipientScope:'FORMED_UNIT',payload:{field:'HIT_ROLL',mode:'ADD',value:-1,weaponMode:'melee'}},
 {recordId:'review/ability-da-7f665e6bf3f0492b91ee/text/0:87',kind:'INCOMING_MODIFIER',recipientScope:'FORMED_UNIT',payload:{field:'WOUND_ROLL',mode:'ADD',value:-1,weaponMode:'ranged'}},
 {recordId:'review/ability-da-a17359d95b4b4ff4a606/text/14:56',kind:'INCOMING_MODIFIER',recipientScope:'FORMED_UNIT',payload:{field:'DAMAGE',mode:'ADD',value:-1}},
 {recordId:'review/ability-da-4c9ca538c02844aa9c2a/text/56:68',kind:'IGNORE_MODIFIERS',recipientScope:'FORMED_UNIT',payload:{fields:['BS','WS'],optional:true}},
 {recordId:'review/ability-da-4c9ca538c02844aa9c2a/text/69:81',kind:'IGNORE_MODIFIERS',recipientScope:'FORMED_UNIT',payload:{fields:['HIT_ROLL'],optional:true}},
 {recordId:'review/ability-da-a17359d95b4b4ff4a606/text/57:138',kind:'STRATAGEM_TARGET_RESTRICTION',recipientScope:'FORMED_UNIT',payload:{action:'PROHIBIT',stratagemId:'stratagem-sm-d642d4d85db04dc9',ownerBookId:'space-marines'}}
]);
