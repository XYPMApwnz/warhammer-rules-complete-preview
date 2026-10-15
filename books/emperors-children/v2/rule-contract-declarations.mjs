/** Reviewed EC source occurrences, not a migration of the legacy effect list.
 * Only these ten rules are lowered. Other rules have not been assessed here. */
const text=['text'], block=['blocks',0,'text'];
const stat=(field,value,extra={})=>({operation:'MODIFY_STAT',field,mode:'ADD',value,...extra});
const weapon=(ability,extra={})=>({operation:'GRANT_WEAPON_ABILITY',ability,...extra});
const melee={weaponMode:'melee'};

export const declarations=[
  {ruleId:'datasheet-lord-exultant:section:1',name:'Perfectionists',kind:'DATASHEET_ABILITY',field:block,
    ownerId:'unit-lord-exultant',profileId:'datasheet-lord-exultant:profile:1',leading:true,
    quote:'Perfectionists: While this model is leading a unit, weapons equipped by models in that unit have the [LETHAL HITS] ability.',
    targetBinding:'SOURCE_FORMED_MODELS',effects:[weapon('LETHAL HITS')]},
  {ruleId:'datasheet-lord-kakophonist:section:1',name:'Obsessive Annunciation',kind:'DATASHEET_ABILITY',field:block,
    ownerId:'unit-lord-kakophonist',profileId:'datasheet-lord-kakophonist:profile:1',leading:true,
    quote:'Obsessive Annunciation: While this model is leading a unit, ranged weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability.',
    targetBinding:'SOURCE_FORMED_MODELS',effects:[weapon('SUSTAINED HITS 1',{weaponMode:'ranged'})]},
  {ruleId:'detachment-spectacle-of-slaughter:rule',name:'Entitled to Victory',kind:'DETACHMENT_RULE',field:text,
    ownerId:'detachment-spectacle-of-slaughter',keyword:'FLAWLESS BLADES',
    quote:'Friendly FLAWLESS BLADES units have Fights First',targetBinding:'ROSTER_UNITS',
    effects:[{operation:'GRANT_ABILITY',ability:{canonicalId:'core-fights-first',parameters:{}},unitScope:'FORMED'}]},
  {ruleId:'detachment-court-of-the-phoenician:enhancement:2',name:'Exalted Patron',kind:'ENHANCEMENT',field:text,
    ownerId:'detachment-court-of-the-phoenician',keywords:['LORD EXULTANT'],
    quote:'LORD EXULTANT model only. Add 1" to the Move characteristic of the bearer.',
    targetBinding:'SOURCE_MODEL',effects:[stat('M',1)]},
  {ruleId:'detachment-court-of-the-phoenician:enhancement:4',name:'Spiritsliver',kind:'ENHANCEMENT',field:text,
    ownerId:'detachment-court-of-the-phoenician',keywords:['EMPEROR’S CHILDREN','DAEMON PRINCE'],
    quote:'EMPEROR’S CHILDREN DAEMON PRINCE model only. Add 1 to the Strength and Attacks characteristics of the bearer’s melee weapons.',
    targetBinding:'SOURCE_MODEL',effects:[stat('strength',1,melee),stat('attacks',1,melee)]},
  {ruleId:'detachment-frenzied-host:enhancement:1',name:'Euphoric Crown',kind:'ENHANCEMENT',field:text,
    ownerId:'detachment-frenzied-host',keywords:['LORD EXULTANT'],
    quote:'LORD EXULTANT model only. This model’s melee attacks have +1 S.',
    targetBinding:'SOURCE_MODEL',effects:[stat('strength',1,melee)]},
  {ruleId:'detachment-frenzied-host:enhancement:2',name:'Howling Plate',kind:'ENHANCEMENT',field:text,
    ownerId:'detachment-frenzied-host',keywords:['LORD EXULTANT'],
    quote:'LORD EXULTANT model only. This unit’s ranged attacks have +1 AP.',
    targetBinding:'SOURCE_UNIT',effects:[stat('ap',-1,{weaponMode:'ranged'})]},
  {ruleId:'detachment-peerless-bladesmen:enhancement:3',name:'Distortion',kind:'ENHANCEMENT',field:text,
    ownerId:'detachment-peerless-bladesmen',keywords:['EMPEROR’S CHILDREN'],
    quote:'EMPEROR’S CHILDREN model only. Add 1 to the Attacks and Damage characteristics of melee weapons equipped by the bearer.',
    targetBinding:'SOURCE_MODEL',effects:[stat('attacks',1,melee),stat('damage',1,melee)]},
  {ruleId:'detachment-coterie-of-the-conceited:enhancement:2',name:'Pledge of Dark Glory',kind:'ENHANCEMENT',field:text,
    ownerId:'detachment-coterie-of-the-conceited',keywords:['EMPEROR’S CHILDREN'],leading:true,
    quote:'EMPEROR’S CHILDREN model only. While the bearer is leading a unit, improve the Leadership and Objective Control characteristics of models in that unit by 1.',
    targetBinding:'SOURCE_FORMED_MODELS',effects:[stat('LD',-1),stat('OC',1)]},
  {ruleId:'detachment-slaaneshs-chosen:enhancement:4',name:'Slayer of Champions',kind:'ENHANCEMENT',field:text,
    ownerId:'detachment-slaaneshs-chosen',keywords:['EMPEROR’S CHILDREN'],
    quote:'EMPEROR’S CHILDREN model only. The bearer’s melee weapons have the [PRECISION] ability, and each time the bearer makes a melee attack that targets a CHARACTER unit, improve the Strength and Armour Penetration characteristics of that attack by 1.',
    executableQuote:'The bearer’s melee weapons have the [PRECISION] ability',
    targetBinding:'SOURCE_MODEL',effects:[weapon('PRECISION',melee)],
    battleQuote:'each time the bearer makes a melee attack that targets a CHARACTER unit, improve the Strength and Armour Penetration characteristics of that attack by 1.'}
];
