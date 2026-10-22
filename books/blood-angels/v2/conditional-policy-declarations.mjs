/** Source-backed conditional displays only: no simulated rolls or attacks. */
export const conditionalPolicyDeclarations=[
 {recordId:'review/ability-ba-1d205c52ba9d49fbbcfd/text/12:67',kind:'REROLL',recipientScope:'FORMED_UNIT',payload:{roll:'HIT',results:'ONES',weaponMode:'melee'}},
 {recordId:'review/ability-ba-72b0b3cfecf1494fab5e/text/12:67',kind:'REROLL',recipientScope:'FORMED_UNIT',payload:{roll:'HIT',results:'ONES',weaponMode:'melee'}},
 {recordId:'review/ability-ba-9c4c7122376a4a73b2b0/text/12:67',kind:'REROLL',recipientScope:'FORMED_UNIT',payload:{roll:'HIT',results:'ONES',weaponMode:'melee'}},
 {recordId:'review/ability-ba-dde72ebbc35a41cba614/text/12:67',kind:'REROLL',recipientScope:'FORMED_UNIT',payload:{roll:'HIT',results:'ONES',weaponMode:'melee'}},
 {recordId:'review/ability-ba-de9ed78c7327410a8010/text/12:67',kind:'REROLL',recipientScope:'FORMED_UNIT',payload:{roll:'HIT',results:'ONES',weaponMode:'melee'}},
 {recordId:'review/ability-ba-44df419581d3449eaff9/text/0:62',kind:'INCOMING_MODIFIER',recipientScope:'FORMED_UNIT',payload:{field:'DAMAGE',mode:'ADD',value:-1}},
 {recordId:'review/ability-ba-458e6e2c7c07492ea9ca/text/0:73',kind:'INCOMING_MODIFIER',recipientScope:'FORMED_UNIT',payload:{field:'HIT_ROLL',mode:'ADD',value:-1,weaponMode:'melee'}},
 {recordId:'review/ability-ba-cfcc3c874e5644a8adb5/text/0:109',kind:'INCOMING_MODIFIER',recipientScope:'FORMED_UNIT',payload:{field:'WOUND_ROLL',mode:'ADD',value:-1,comparison:'ATTACK_STRENGTH_GT_TARGET_TOUGHNESS'}},
 {recordId:'review/ability-ba-16b14dac906045e3a48b/text/0:57',kind:'REROLL',recipientScope:'FORMED_UNIT',payload:{roll:'ADVANCE',results:'ALL'}},
 {recordId:'review/detachment-rule-ba-10c56bef78b24440bb5f/text/59:88',kind:'REROLL',recipientScope:'ROSTER_UNITS',recipientKeywords:['BLOOD ANGELS','CHARACTER'],payload:{roll:'HIT',results:'ONES'}},
 {recordId:'review/detachment-rule-ba-10c56bef78b24440bb5f/text/89:120',kind:'REROLL',recipientScope:'ROSTER_UNITS',recipientKeywords:['BLOOD ANGELS','CHARACTER'],payload:{roll:'WOUND',results:'ONES'}},
 {recordId:'review/enhancement-ba-3f19e1f57dd94fcc92ae/text/44:107',kind:'ATTACK_TARGET_RESTRICTION',recipientScope:'FORMED_UNIT',payload:{action:'PROHIBIT',attackKind:'SNAP_SHOOTING',referenceId:'core-rule-15-09-snap-shooting'},
  coreDependency:{id:'core-rule-15-09-snap-shooting',code:'15.09',quote:'You cannot re-roll hit rolls.',sourceContentHash:'E0983D78F2F6BC1144DC4437249D74FF961A915079E3503BFD057B4009719173'}},
 {recordId:'review/enhancement-ba-9b2691d5805d46df9b88/text/53:137',kind:'ACTION_CP_MODIFIER',recipientScope:'FORMED_UNIT',payload:{action:'HEROIC_INTERVENTION',mode:'ADD',value:-1,referenceId:'core-rule-15-11-heroic-intervention'},
  coreDependency:{id:'core-rule-15-11-heroic-intervention',code:'15.11',quote:'WHEN: End of your opponent’s Charge phase.',sourceContentHash:'91B5BDA042E5F65407109036C392BA5B4E43B67F5ACE50EC0E0B5D38DF1056A5'}}
];
