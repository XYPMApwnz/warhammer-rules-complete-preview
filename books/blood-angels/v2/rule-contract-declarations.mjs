/** Explicit reviewed source occurrences, never title-selected behaviour. */
const stat=(field,value,extra={})=>({operation:'MODIFY_STAT',field,mode:'ADD',value,...extra});
const weapon=ability=>({operation:'GRANT_WEAPON_ABILITY',ability,weaponMode:'melee'});
const scouts={operation:'GRANT_ABILITY',ability:{canonicalId:'core-scouts',parameters:{range:6}},unitScope:'FORMED'};
export const declarations=[
 {ruleId:'ability-ba-3c7cd126400b4e7cb0fc',clauseId:'forlorn-hero-scouts',quote:'Forlorn Hero: This unit has Scouts 6".',targetBinding:'SOURCE_UNIT',targetSubject:'UNIT',effects:[scouts]},
 {ruleId:'ability-ba-40389ffef38645ca922a',clauseId:'fury-unbound-melee',quote:'Fury Unbound: This unit’s melee attacks have [LETHAL HITS].',targetBinding:'SOURCE_UNIT',targetSubject:'UNIT',effects:[weapon('LETHAL HITS')]},
 {ruleId:'ability-ba-7cbf2dc160514d6d83d6',clauseId:'lost-to-fury-melee',quote:'Lost to Fury: This unit’s melee attacks have [SUSTAINED HITS 1].',targetBinding:'SOURCE_UNIT',targetSubject:'UNIT',effects:[weapon('SUSTAINED HITS 1')]},
 {ruleId:'ability-ba-630ec2727ede4d3f85a2',clauseId:'blood-chalice-toughness',quote:'Blood Chalice: This unit has +1 T.',targetBinding:'SOURCE_UNIT_MODELS',targetSubject:'MODEL',formedOrPhysical:true,effects:[stat('T',1)]},
 {ruleId:'ability-ba-da87d6022de8416d9040',clauseId:'selected-relic-shield',quote:'Relic Shield: This model has +1 W.',targetBinding:'SOURCE_MODEL',targetSubject:'MODEL',equipment:true,effects:[stat('W',1)]},
 {ruleId:'ability-ba-f103714e8c8e4f6f9352',clauseId:'savage-fury-charge',quote:'Savage Fury: This unit has +1 to charge rolls.',targetBinding:'SOURCE_UNIT',targetSubject:'UNIT',effects:[{operation:'MODIFY_RULE_METRIC',field:'chargeRoll',mode:'ADD',value:1,unitScope:'FORMED'}]},
 {ruleId:'enhancement-ba-c3527131d00a41efae68',clauseId:'prescient-flash-scouts',quote:'This unit has Scouts 6".',targetBinding:'SOURCE_UNIT',targetSubject:'UNIT',effects:[scouts]},
 {ruleId:'enhancement-ba-c6832a51a86e4ae784ba',clauseId:'archtraitor-bridge-attacks',quote:'This model’s melee attacks have +2 A.',targetBinding:'SOURCE_MODEL',targetSubject:'MODEL',effects:[stat('attacks',2,{weaponMode:'melee'})]}
];
export const enhancementEligibility={
 'enhancement-ba-2e1605fc8a6b4631b096':{subject:'MODEL',keywords:['ADEPTUS ASTARTES','JUMP PACK']},
 'enhancement-ba-3cc1e896eab1460c8748':{subject:'MODEL',keywords:['ADEPTUS ASTARTES']},
 'enhancement-ba-3f19e1f57dd94fcc92ae':{subject:'MODEL',keywords:['ADEPTUS ASTARTES']},
 'enhancement-ba-9b2691d5805d46df9b88':{subject:'MODEL',keywords:['DEATH COMPANY']},
 'enhancement-ba-c3527131d00a41efae68':{subject:'MODEL',keywords:['ADEPTUS ASTARTES']},
 'enhancement-ba-c6832a51a86e4ae784ba':{subject:'MODEL',keywords:['DEATH COMPANY']},
 'enhancement-ba-e41fcde20bd649ef8d51':{subject:'MODEL',keywords:['ADEPTUS ASTARTES']},
 'enhancement-ba-e4821c7600234224bb54':{subject:'MODEL',keywords:['ADEPTUS ASTARTES','JUMP PACK']}
};
// Only the existing Assault selector context is evaluated. The complete clause
// stays TEXT_ONLY: Tactical fall-back permissions are not a calculated stat.
export const permanentDoctrineSources=[{
 ruleId:'ability-ba-eb9da07320a4443fb871',unitId:'unit-ba-92fdb23a526b4c328367',
 quote:'Warden of the Imperium Nihilus: The assault doctrine and tactical doctrine are active for this unit in addition to any other combat doctrine.',
 activeDoctrines:['ASSAULT','TACTICAL'],evaluatedContext:'ASSAULT_ONLY'
}];
