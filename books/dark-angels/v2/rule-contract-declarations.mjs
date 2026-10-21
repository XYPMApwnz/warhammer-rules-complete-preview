/** Explicit source-reviewed DA lowering. IDs are persistent source bindings;
 * neither titles nor sentence parsing select an operation. */
const stat=(field,value,extra={})=>({operation:'MODIFY_STAT',field,mode:'ADD',value,...extra});
const weapon=(ability,weaponMode)=>({operation:'GRANT_WEAPON_ABILITY',ability,...(weaponMode?{weaponMode}:{})});
export const declarations=[
 {ruleId:'ability-da-7cd58c9465f544f08e8b',clauseId:'supreme-grand-master',quote:'Supreme Grand Master: This unit’s attacks have [SUSTAINED HITS 1].',targetBinding:'SOURCE_UNIT',targetSubject:'UNIT',effects:[weapon('SUSTAINED HITS 1')]},
 {ruleId:'ability-da-594a7ae294c948b39173',clauseId:'book-of-salvation',quote:'Book of Salvation: This unit’s melee attacks have +1 A.',targetBinding:'SOURCE_UNIT',targetSubject:'UNIT',effects:[stat('attacks',1,{weaponMode:'melee'})]},
 {ruleId:'ability-da-6fefb0cfda4848bf9dd1',clauseId:'braziers-stealth',quote:'This unit has Stealth.',targetBinding:'SOURCE_UNIT',targetSubject:'UNIT',effects:[{operation:'GRANT_ABILITY',ability:{canonicalId:'core-stealth',parameters:{}},unitScope:'FORMED'}]},
 {ruleId:'ability-da-95887a48130640feaf11',clauseId:'lion-helm',quote:'The Lion Helm: This unit has 4+ InSv.',targetBinding:'SOURCE_UNIT_MODELS',targetSubject:'MODEL',equipment:true,formedOrPhysical:true,effects:[{operation:'MODIFY_STAT',field:'INSV',mode:'SET',value:4}]},
 {ruleId:'ability-da-4d1396f4342347baa772',clauseId:'astartes-banner',quote:'Astartes Banner: While this unit contains a RAVENWING ANCIENT, this unit has +1 OC.',targetBinding:'SOURCE_UNIT_MODELS',targetSubject:'MODEL',formedOrPhysical:true,presence:'daAncientPresent',effects:[stat('OC',1)]},
 {ruleId:'ability-da-61ae3e245d824682a480',clauseId:'honour-or-death-charge',quote:'This unit has +1 to advance rolls and charge rolls.',targetBinding:'SOURCE_UNIT',targetSubject:'UNIT',presence:'daChampionPresent',partial:true,effects:[{operation:'MODIFY_RULE_METRIC',field:'chargeRoll',mode:'ADD',value:1,unitScope:'FORMED'}]},
 {ruleId:'enhancement-da-9dcd451b895a4cfea19f',clauseId:'ancient-weapons',quote:'This model’s melee attacks:\n- Have +2 S.\n- Have +1 AP.',targetBinding:'SOURCE_MODEL',targetSubject:'MODEL',effects:[stat('strength',2,{weaponMode:'melee'}),stat('ap',-1,{weaponMode:'melee'})]},
 {ruleId:'detachment-rule-da-6a259c00bc9f4bf498ee',clauseId:'black-winged-cover',quote:'Friendly RAVENWING FLY units’ ranged attacks have [IGNORES COVER].',targetBinding:'ROSTER_UNITS',targetSubject:'UNIT',targetKeywords:['RAVENWING','FLY'],effects:[weapon('IGNORES COVER','ranged')]},
 {ruleId:'detachment-rule-da-6a259c00bc9f4bf498ee',clauseId:'outrider-battleline',quote:'Friendly OUTRIDER SQUAD units have BATTLELINE.',targetBinding:'ROSTER_UNITS',targetSubject:'UNIT',targetUnitIds:['unit-sm-0dd92e6d8ad54ee6'],effects:[{operation:'GRANT_UNIT_KEYWORD',keyword:'BATTLELINE',unitScope:'PHYSICAL'}]}
];
export const enhancementEligibility={
 'enhancement-da-3c2c519eaabc48088aa4':{subject:'UNIT',keywords:['RAVENWING'],anyKeywords:['FLY','MOUNTED']},
 'enhancement-da-fb83cfb304e74056b819':{subject:'UNIT',unitIds:['unit-da-48fe8c59ed2449e1a36b']},
 'enhancement-da-468d9a93dc9a47f2a229':{subject:'MODEL',keywords:['ADEPTUS ASTARTES']},
 'enhancement-da-9dcd451b895a4cfea19f':{subject:'MODEL',keywords:['ADEPTUS ASTARTES']},
 'enhancement-da-4e1c055c3dfe4754bd0c':{subject:'MODEL',keywords:['DEATHWING']},
 'enhancement-da-aaf27210de7e47a792f7':{subject:'MODEL',keywords:['DEATHWING']},
 'enhancement-da-6504b6d091f844b68c1a':{subject:'MODEL',keywords:['DEATHWING'],abilities:['Deep Strike']},
 'enhancement-da-822dfec678424ec293c2':{subject:'MODEL',keywords:['RAVENWING']}
};
export const physicalPresenceBindings={
 daAncientPresent:{unitId:'unit-da-467009b00bb9402dadee',profileId:'model-da-9bdc9ba0422949849ecc'},
 daChampionPresent:{unitId:'unit-da-467009b00bb9402dadee',profileId:'model-da-d9a85659ae224494b0a7'}
};
export const recipientIdentityProofs=[{
 ruleId:'detachment-rule-da-6a259c00bc9f4bf498ee',canonicalId:'unit-sm-0dd92e6d8ad54ee6',
 sourceEntityId:'sm-source-370bcca7a77a4f20',sourceAnchor:'Outrider-Squad',
 sourceHref:'/wh40k11ed/factions/space-marines/Outrider-Squad',
 sourceDocument:'books/dark-angels/v2/sources/raw/wahapedia-dark-angels-main.html',
 sourceSha256:'67E319B48234DFE7CA854A66E3408146FE637ACB4722AC1DFBC5FC86847DE3DC',
 sourcePointer:'/html/body/div/div[1]/div[3]/div[22]/div[2]/div[2]/a[2]'
}];
