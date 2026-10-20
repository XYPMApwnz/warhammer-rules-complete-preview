/**
 * Reviewed lowering of explicit source occurrences. Canonical identities and
 * full source text remain owned by the Stage 2A factual foundation.
 * No effect is inferred from a title, a unit name, or a matching weapon label.
 */
const stat=(field,value,mode='ADD',extra={})=>({operation:'MODIFY_STAT',field,mode,value,...extra});
const weapon=(ability,weaponMode)=>({operation:'GRANT_WEAPON_ABILITY',ability,...(weaponMode?{weaponMode}:{})});
const grant=(canonicalId,parameters={},unitScope='FORMED')=>({operation:'GRANT_ABILITY',ability:{canonicalId,parameters},unitScope});
const fnp=value=>({operation:'GRANT_MODEL_ABILITY',ability:{name:'Feel No Pain',value}});
const rows=[];
const add=(ruleId,clauseId,ownerId,quote,targetBinding,targetSubject,effects,extra={})=>rows.push({
  ruleId,clauseId,ownerId,field:['text'],quote,targetBinding,targetSubject,effects,...extra});

// The source grants these to the unit; the existing SOURCE_UNIT mechanism
// includes its attached formation without leaking into another physical unit.
add('ability-sm-046203ae581f416e','ranged-assault','unit-sm-f9d22ec2aff840de',
  'This unit’s ranged attacks have [ASSAULT]','SOURCE_UNIT','UNIT',[weapon('ASSAULT','ranged')]);
add('ability-sm-046203ae581f416e','melee-lance','unit-sm-f9d22ec2aff840de',
  'This unit’s melee attacks have [LANCE].','SOURCE_UNIT','UNIT',[weapon('LANCE','melee')]);
for(const [id,owner] of [
  ['ability-sm-779fefc8580f4b31','unit-sm-536d38b5ac7645dc'],
  ['ability-sm-846fc84a9f914844','unit-sm-4cd4bf89720c4fa0'],
  ['ability-sm-9d616a4674ec4997','unit-sm-ff2af9c56daa4536'],
  ['ability-sm-d0e46ad8ba424e4c','unit-sm-b994e641eaea4060']
])add(id,'litany-melee-lance',owner,'This unit’s melee attacks have [Lance].',
  'SOURCE_UNIT','UNIT',[weapon('LANCE','melee')]);
add('ability-sm-dec499b740e84d6b','spear-ranged-assault','unit-sm-70b477e461b5487a',
  'This unit’s ranged attacks have [Assault].','SOURCE_UNIT','UNIT',[weapon('ASSAULT','ranged')]);
add('ability-sm-683740758e7c490c','grav-chutes-deep-strike','unit-sm-5d6184dd92154615',
  'Grav-chutes: This unit has Deep Strike.','SOURCE_UNIT','UNIT',[grant('core-deep-strike')],{equipment:true});
add('ability-sm-7d0c729bd52143f9','orbital-comms-scouts','unit-sm-4fce70f042cc4e5d',
  'Orbital Comms Array: This unit has Scouts 6".','SOURCE_UNIT','UNIT',[grant('core-scouts',{range:6})],{equipment:true});
add('ability-sm-b954019b08c44c19','tempormortis-fights-first','unit-sm-a2a8db8a9f124a7f',
  'Tempormortis: This unit has Fights First.','SOURCE_UNIT','UNIT',[grant('core-fights-first')]);
add('ability-sm-b165097313314e4e','honour-company-objective-control','unit-sm-eb2d6ede583e4473',
  'Honour of the Company: This unit has +1 OC.','SOURCE_FORMED_MODELS','MODEL',[stat('OC',1)],{formedOrPhysicalModels:true});
add('ability-sm-30c57ce03186422e','trifold-stealth','unit-sm-55f195878fab446f',
  'Trifold Path of Shadow: This unit has:\n- Stealth.','SOURCE_UNIT','UNIT',[grant('core-stealth')]);
add('ability-sm-30c57ce03186422e','trifold-detection','unit-sm-55f195878fab446f',
  'Trifold Path of Shadow: This unit has:\n- Stealth.\n- -3" detection range.',
  'SOURCE_UNIT','UNIT',[{operation:'MODIFY_RULE_METRIC',field:'detectionRange',mode:'ADD',value:-3}]);
add('ability-sm-a228df25b2964c6c','chameleoline-detection','unit-sm-4ff82a9b79db48da',
  'Chameleoline Cloaks: This unit has -3" detection range.','SOURCE_UNIT','UNIT',
  [{operation:'MODIFY_RULE_METRIC',field:'detectionRange',mode:'ADD',value:-3}]);

// Equipment grants require a selected, source-backed equipment occurrence.
// SOURCE_MODEL additionally requires its exact physical MODEL recipient.
for(const [id,owner,value,quote] of [
  ['ability-sm-431f22d15f7545b4','unit-sm-b994e641eaea4060',1,'Relic Shield: This model has +1 W.'],
  ['ability-sm-8c9e7e37a8494c1d','unit-sm-99eb03d4f2d448e2',1,'Relic Shield: This model has +1 W.'],
  ['ability-sm-daf87042d20348dd','unit-sm-e595c56eab2f493b',1,'Relic Shield: This model has +1 W.'],
  ['ability-sm-aa81f0067a3140de','unit-sm-5ce71f2f4e5e4ebb',1,'Storm Shield: This model has +1 W.']
])add(id,'shield-extra-wound',owner,quote,'SOURCE_MODEL','MODEL',[stat('W',value)],{equipment:true});
add('ability-sm-097567b13c02404d','storm-shield-invulnerable','unit-sm-4660f547cc3744b0',
  'Storm Shield: This model has a 4+ InSv.','SOURCE_MODEL','MODEL',[stat('INSV',4,'SET')],{equipment:true});
add('ability-sm-63d4ca967fa64b79','combat-shield-invulnerable','unit-sm-74c53544aa694147',
  'Combat Shield: This model has 5+ InSv.','SOURCE_MODEL','MODEL',[stat('INSV',5,'SET')],{equipment:true});
add('ability-sm-68f84cbf74d9438b','shield-dome-invulnerable','unit-sm-4fce70f042cc4e5d',
  'Shield Dome: This unit has 5+ InSv.','SOURCE_FORMED_MODELS','MODEL',[stat('INSV',5,'SET')],{equipment:true,formedOrPhysicalModels:true});

// Detachment applicability is supplied by the existing contract/runtime gate.
add('detachment-rule-sm-05b00954e4744b59','death-blow-charge','detachment-sm-0a8e3fa989c9415e',
  'Friendly ADEPTUS ASTARTES TERMINATOR units have +1 to charge rolls.',
  'ROSTER_UNITS','UNIT',[{operation:'MODIFY_RULE_METRIC',field:'chargeRoll',mode:'ADD',value:1,unitScope:'FORMED'}],
  {targetKeywords:['ADEPTUS ASTARTES','TERMINATOR']});
add('detachment-rule-sm-5d279871994f428e','lightning-fast-movement','detachment-sm-53f689af321a4813',
  'Friendly ADEPTUS ASTARTES MOUNTED/SPEEDER units have +2" M.',
  'ROSTER_MODELS','MODEL',[stat('M',2)],
  {containingUnitScope:'FORMED',recipientUnitKeywords:['ADEPTUS ASTARTES'],recipientUnitAnyKeywords:['MOUNTED','SPEEDER']});
add('detachment-rule-sm-b0de270f61aa47ac','shadow-tactics-stealth','detachment-sm-39d8ec1f10c44b7b',
  'Friendly ADEPTUS ASTARTES units have Stealth.','ROSTER_UNITS','UNIT',[grant('core-stealth')],
  {targetKeywords:['ADEPTUS ASTARTES']});
add('detachment-rule-sm-b0de270f61aa47ac','shadow-tactics-detection','detachment-sm-39d8ec1f10c44b7b',
  'Friendly PHOBOS/SCOUT SQUAD units have -3" detection range.','ROSTER_UNITS','UNIT',
  [{operation:'MODIFY_RULE_METRIC',field:'detectionRange',mode:'ADD',value:-3}],
  {targetAnyKeywords:['PHOBOS','SCOUT SQUAD']});

// Enhancement effects below require the separately reviewed assignment selector.
add('enhancement-sm-2e657d2b65ed41fd','war-tempered-melee','detachment-sm-a8cfc50e15b94756',
  'This model’s melee attacks have:\n- +1 S.\n- +1 D.','SOURCE_MODEL','MODEL',
  [stat('strength',1,'ADD',{weaponMode:'melee'}),stat('damage',1,'ADD',{weaponMode:'melee'})]);
for(const [id,owner] of [
  ['enhancement-sm-33db6f7f8bc04d0c','detachment-sm-6341f5a9b9584677'],
  ['enhancement-sm-4291db0993f24db5','detachment-sm-c894db94673d43e8']
])add(id,'armour-save-and-fnp',owner,'This model has:\n- 2+ Sv.\n- Feel No Pain 5+.',
  'SOURCE_MODEL','MODEL',[stat('SV',2,'SET'),fnp(5)]);
add('enhancement-sm-5f35bb72c3a14bf0','flesh-toughness-and-fnp','detachment-sm-f72202c27ad448ea',
  'This model:\n- Has +1 T.\n- Has Feel No Pain 5+.','SOURCE_MODEL','MODEL',[stat('T',1),fnp(5)]);
add('enhancement-sm-7aeb998517e94f4d','veteran-ranged-sustained','detachment-sm-c894db94673d43e8',
  'This unit’s ranged attacks have [Sustained Hits 1].','SOURCE_UNIT','UNIT',[weapon('SUSTAINED HITS 1','ranged')]);
add('enhancement-sm-839dc39b99364e56','hunters-eye-ranged','detachment-sm-93b1ca6a193d41af',
  'This unit’s ranged attacks:\n- Have [IGNORES COVER].\n- Have [SUSTAINED HITS 1].',
  'SOURCE_UNIT','UNIT',[weapon('IGNORES COVER','ranged'),weapon('SUSTAINED HITS 1','ranged')]);
add('enhancement-sm-f2a5e85d052342cd','champion-melee-lethal','detachment-sm-0a8e3fa989c9415e',
  'This unit’s melee attacks have [Lethal Hits].','SOURCE_UNIT','UNIT',[weapon('LETHAL HITS','melee')]);
add('enhancement-sm-a6d2243e7dab403e','gunnery-ranged-heavy','detachment-sm-519d6649ea174733',
  'This unit’s ranged attacks have [Heavy].','SOURCE_UNIT','UNIT',[weapon('HEAVY','ranged')]);
add('enhancement-sm-928cd50003a8461e','blackwing-infiltrators','detachment-sm-39d8ec1f10c44b7b',
  'This unit has Infiltrators.','SOURCE_UNIT','UNIT',[grant('core-infiltrators')]);
add('enhancement-sm-07e95c69297b4d6f','relentless-scouts','detachment-sm-8f297dd604a24b1c',
  'This unit has Scouts 5".','SOURCE_UNIT','UNIT',[grant('core-scouts',{range:5})]);
add('enhancement-sm-1ba9914b76954183','spearpoint-scouts','detachment-sm-624df9cefb95455f',
  'This unit has Scouts 6".','SOURCE_UNIT','UNIT',[grant('core-scouts',{range:6})]);
add('enhancement-sm-dcbae3c2b6534ac1','immovable-objective-control','detachment-sm-edbad6d9c5a44991',
  'This unit has +1 OC.','SOURCE_FORMED_MODELS','MODEL',[stat('OC',1)],{formedOrPhysicalModels:true});
// These are independent static bullets. Their other conditional bullets remain
// separate non-executable source clauses in the coverage ledger.
add('enhancement-sm-4fce0dc37bd14c6f','honour-ranged-lethal','detachment-sm-bf8f2dd8d7dc4073',
  'This unit’s ranged attacks have [Lethal Hits].','SOURCE_UNIT','UNIT',[weapon('LETHAL HITS','ranged')]);
add('enhancement-sm-37140db132394ce3','redoubtable-invulnerable','detachment-sm-519d6649ea174733',
  'Has 5+ InSv.','SOURCE_FORMED_MODELS','MODEL',[stat('INSV',5,'SET')],{formedOrPhysicalModels:true});
add('enhancement-sm-4c07c7ad03a44355','standard-static-stats','detachment-sm-6341f5a9b9584677',
  'This model has:\n- +1 OC and Ld.\n- Feel No Pain 5+.',
  'SOURCE_MODEL','MODEL',[stat('OC',1),stat('LD',-1),fnp(5)]);
// Both abilities are MODEL-only, not a grant to the bodyguard formation.
add('enhancement-sm-16dc6ab9b09f4bd2','umbral-model-abilities','detachment-sm-39d8ec1f10c44b7b',
  'This model has:\n- Fights First.\n- Lone Operative.','SOURCE_MODEL','MODEL',
  [{operation:'GRANT_ABILITY',ability:{canonicalId:'core-fights-first',parameters:{}}},
   {operation:'GRANT_ABILITY',ability:{canonicalId:'core-lone-operative',parameters:{}}}]);

// Exact accepted weapon occurrence identities carry the [PSYCHIC]/[TORRENT]
// qualification. These lists are source-bound and audited, never title matches.
export const weaponQualifierBindings={
  masterForgedPsychicExclusions:[
    'weapon-sm-0528ec22f40f4e24','weapon-sm-132cd13a68ba4929',
    'weapon-sm-1e00be38156541ec','weapon-sm-4e2c60ee42944338',
    'weapon-sm-57c866094fe448ea','weapon-sm-835b6a9bad7d4ab6',
    'weapon-sm-88955398d8344953','weapon-sm-8d5fa8ae33a44e11',
    'weapon-sm-8ddc9bc061da4f91','weapon-sm-c022a6cbab224d8f',
    'weapon-sm-d1e8373308e64d69','weapon-sm-ddbc0642408e4c2c',
    'weapon-sm-ef91e4d8964546a9'
  ],
  immolatorTorrentWeapons:[
    'weapon-sm-1a4b85c4e1744643','weapon-sm-1fa2210813a34533',
    'weapon-sm-2151d9faddeb41c7','weapon-sm-285173fe645f4293',
    'weapon-sm-2f75918bd3334a56','weapon-sm-3b942920239e4c49',
    'weapon-sm-74a1a4fa62934e81','weapon-sm-7f76e5867ad74a29',
    'weapon-sm-9a1bfb0fbaa440a1','weapon-sm-9c1fa811bce44a89',
    'weapon-sm-c44931e7667a46f9','weapon-sm-cf3899d9a34b4728',
    'weapon-sm-d6d2797f82b940f5','weapon-sm-de892d63485b4252',
    'weapon-sm-e4a56c925f9b445b','weapon-sm-ee51d87c8ab8423c',
    'weapon-sm-ffc835dcf52b4211'
  ]
};
add('enhancement-sm-6d3f4024b9f14a67','master-forged-firearms','detachment-sm-bf8f2dd8d7dc4073',
  'This model’s ranged attacks (excluding [Psychic] attacks) have +1 A, S, AP and D.',
  'SOURCE_MODEL','MODEL',[
    stat('attacks',1,'ADD',{weaponMode:'ranged',excludeWeaponIds:weaponQualifierBindings.masterForgedPsychicExclusions}),
    stat('strength',1,'ADD',{weaponMode:'ranged',excludeWeaponIds:weaponQualifierBindings.masterForgedPsychicExclusions}),
    stat('ap',-1,'ADD',{weaponMode:'ranged',excludeWeaponIds:weaponQualifierBindings.masterForgedPsychicExclusions}),
    stat('damage',1,'ADD',{weaponMode:'ranged',excludeWeaponIds:weaponQualifierBindings.masterForgedPsychicExclusions})
  ]);
add('enhancement-sm-bb65f6f6f8834a96','immolator-torrent-attacks','detachment-sm-a8cfc50e15b94756',
  'This unit’s [TORRENT] weapons have +1 A.','SOURCE_UNIT','UNIT',
  [stat('attacks',1,'ADD',{weaponIds:weaponQualifierBindings.immolatorTorrentWeapons})]);

// The shared executor accepts UNIT detection metrics, but the current Effective
// and Personal presenters only project UNIT chargeRoll. Keep these UNIT rules
// text-only until that shared presentation capability is separately approved.
export const unsupportedPresentationClauses=rows.filter(row=>['trifold-detection','chameleoline-detection','shadow-tactics-detection'].includes(row.clauseId));
export const declarations=rows.filter(row=>!unsupportedPresentationClauses.includes(row));
export const pendingPhysicalBindings=[
  {ruleId:'enhancement-sm-1599eafe5bab4e91',ownerId:'detachment-sm-9310c9a221094584',
    field:['eligibilityText'],quote:'ADEPTUS ASTARTES unit only.',status:'NOT_PROVEN',
    reason:'Accepted factual scope is MODEL while the source eligibility is UNIT. No assignment subject is guessed.'},
  {ruleId:'enhancement-sm-32c4e009e6c84003',ownerId:'detachment-sm-9310c9a221094584',
    field:['eligibilityText'],quote:'ADEPTUS ASTARTES unit only.',status:'NOT_PROVEN',
    reason:'Accepted factual scope is MODEL while the source eligibility is UNIT. No assignment subject is guessed.'}
];

/** Exact source-identity assignment selectors, completed below from reviewed
 * source eligibility fields; source text remains an evidence string. */
export const enhancementEligibility={
  "enhancement-sm-06c2219935a945b2": {
    "subject": "UNIT",
    "keywords": [
      "ADEPTUS ASTARTES"
    ],
    "eligibilityEvidence": "- Chogorian HuntmasterUPGRADE\nADEPTUS ASTARTES MOUNTED/SPEEDER unit only. When this unit is selected to make an ingress move, treat the current battle round number as being one higher than it actually is.",
    "anyKeywords": [
      "MOUNTED",
      "SPEEDER"
    ]
  },
  "enhancement-sm-07e95c69297b4d6f": {
    "subject": "MODEL",
    "keywords": [
      "GRAVIS"
    ],
    "eligibilityEvidence": "- Relentless Advance\nGRAVIS model only. This unit has Scouts 5\"."
  },
  "enhancement-sm-0dc5fa69dcde4daf": {
    "subject": "MODEL",
    "keywords": [
      "PHOBOS"
    ],
    "eligibilityEvidence": "- Coronal Susurrant\nPHOBOS model only. Each enemy unit (excluding MONSTER/VEHICLE units) engaged with this unit cannot be targeted by controlling player stratagems."
  },
  "enhancement-sm-10ccd3b868bf41e2": {
    "subject": "MODEL",
    "keywords": [
      "CAPTAIN"
    ],
    "eligibilityEvidence": "- Damocles-class Uplink\nCAPTAIN model only. In your Movement phase, if this unit is embarked within a TRANSPORT unit, you can select one friendly ADEPTUS ASTARTES INFANTRY unit within 6\" of that TRANSPORT unit and select one combat doctrine. That combat doctrine is active for that INFANTRY unit."
  },
  "enhancement-sm-1599eafe5bab4e91": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES"
    ],
    "eligibilityEvidence": "- Castellum Omnivox\nADEPTUS ASTARTES unit only. When this unit makes a advance/fall-back move, that move does not prevent this unit from being eligible to start an action.",
    "unresolved": true,
    "reason": "SOURCE_SCOPE_CONFLICT: source UNIT eligibility differs from accepted MODEL scope"
  },
  "enhancement-sm-16dc6ab9b09f4bd2": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES",
      "INFANTRY"
    ],
    "eligibilityEvidence": "- Umbral Raptor\nADEPTUS ASTARTES INFANTRY model only. This model has:\n- Fights First.\n- Lone Operative."
  },
  "enhancement-sm-1ba9914b76954183": {
    "subject": "MODEL",
    "keywords": [
      "TACTICUS"
    ],
    "eligibilityEvidence": "- Spearpoint War Leader\nTACTICUS model only. This unit has Scouts 6\"."
  },
  "enhancement-sm-28614fb697744ed6": {
    "subject": "UNIT",
    "keywords": [
      "DREADNOUGHT"
    ],
    "eligibilityEvidence": "- Artificer SarcophagusUPGRADE\nDREADNOUGHT unit only. Attacks that target this unit have -1 D."
  },
  "enhancement-sm-2e55051da6594198": {
    "subject": "MODEL",
    "keywords": [
      "TACTICUS"
    ],
    "eligibilityEvidence": "- Tempered in Battle (Aura)\nTACTICUS model only. Friendly ADEPTUS ASTARTES units within 6\" of this model can re-roll leadership rolls."
  },
  "enhancement-sm-2e657d2b65ed41fd": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES"
    ],
    "eligibilityEvidence": "- War Tempered Artifice\nADEPTUS ASTARTES model only. This model’s melee attacks have:\n- +1 S.\n- +1 D."
  },
  "enhancement-sm-32c4e009e6c84003": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES"
    ],
    "eligibilityEvidence": "- Spy-skull Data Link\nADEPTUS ASTARTES unit only. This unit’s ranged weapons have [IGNORES COVER].",
    "unresolved": true,
    "reason": "SOURCE_SCOPE_CONFLICT: source UNIT eligibility differs from accepted MODEL scope"
  },
  "enhancement-sm-33db6f7f8bc04d0c": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES"
    ],
    "eligibilityEvidence": "- Artificer Armour\nADEPTUS ASTARTES model only. This model has:\n- 2+ Sv.\n- Feel No Pain 5+."
  },
  "enhancement-sm-342e2e30f21f4ea7": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES"
    ],
    "eligibilityEvidence": "- Defensive Mastery\nADEPTUS ASTARTES model only. When both players have deployed their armies, you can redeploy up to three friendly ADEPTUS ASTARTES INFANTRY units. When doing so, you can set those units up in strategic reserves, regardless of how many units are already in strategic reserves."
  },
  "enhancement-sm-35af1f923ecc47a3": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES"
    ],
    "eligibilityEvidence": "- Oath of Macragge\nADEPTUS ASTARTES model only. This model’s melee attacks have:\n- +1 S and AP.\n- Or: If the assault doctrine is active for this unit, +2 S and AP."
  },
  "enhancement-sm-37140db132394ce3": {
    "subject": "UNIT",
    "keywords": [
      "ADEPTUS ASTARTES",
      "VEHICLE"
    ],
    "eligibilityEvidence": "- Redoubtable Machine SpiritUPGRADE\nADEPTUS ASTARTES VEHICLE unit only (excluding DEDICATED TRANSPORT/FLY/WALKER units). This unit:\n- Has 5+ InSv.\n- At the end of your Command phase, heals 1 wound.",
    "excludeKeywords": [
      "DEDICATED TRANSPORT",
      "FLY",
      "WALKER"
    ]
  },
  "enhancement-sm-38b8b31ab2ce47de": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES",
      "INFANTRY"
    ],
    "eligibilityEvidence": "- Linebreaker Onslaught\nADEPTUS ASTARTES INFANTRY model only. If this unit disembarked this turn:\n- This unit can re-roll charge rolls.\n- Enemy units cannot target this unit with snap shooting attacks."
  },
  "enhancement-sm-4291db0993f24db5": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES"
    ],
    "eligibilityEvidence": "- Armour of Antoninus\nADEPTUS ASTARTES model only. This model has:\n- 2+ Sv.\n- Feel No Pain 5+."
  },
  "enhancement-sm-4333125f97a645c6": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES"
    ],
    "eligibilityEvidence": "- Adamantine Mantle\nADEPTUS ASTARTES model only. Attacks allocated to this model have -1 D."
  },
  "enhancement-sm-4c07c7ad03a44355": {
    "subject": "MODEL",
    "keywords": [
      "ANCIENT"
    ],
    "eligibilityEvidence": "- Standard of the Emperor Ascendant\nANCIENT model only. This model has:\n- +1 OC and Ld.\n- Feel No Pain 5+.\n- The following ability:\nAncient Exhortation (Once per battle, per army): When this unit is selected to fight, you can use this ability. If you do, this unit’s melee attacks have +1 A until the end of the phase."
  },
  "enhancement-sm-4fce0dc37bd14c6f": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES"
    ],
    "eligibilityEvidence": "- Honour of Vigilance\nADEPTUS ASTARTES model only.\n- This unit’s ranged attacks have [Lethal Hits].\n- If the devastator doctrine is active for this unit, this unit can re-roll advance rolls."
  },
  "enhancement-sm-5f35bb72c3a14bf0": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES"
    ],
    "eligibilityEvidence": "- The Flesh is Weak\nADEPTUS ASTARTES model only. This model:\n- Has +1 T.\n- Has Feel No Pain 5+."
  },
  "enhancement-sm-60ab5885f6294e78": {
    "subject": "MODEL",
    "keywords": [
      "PHOBOS"
    ],
    "eligibilityEvidence": "- Venator Omni-auspex\nPHOBOS model only. This unit’s attacks that target a hidden unit can:\n- Re-roll wound rolls of 1.\n- Or: If the assault doctrine is active for this unit, re-roll wound rolls of 1 and 2."
  },
  "enhancement-sm-6230db0cdc954fdd": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES",
      "TERMINATOR"
    ],
    "eligibilityEvidence": "- Corporeum Reliquary\nADEPTUS ASTARTES TERMINATOR model only. In your first Movement phase, this unit can make an ingress move."
  },
  "enhancement-sm-6d3f4024b9f14a67": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES"
    ],
    "eligibilityEvidence": "- Master-forged Firearms\nADEPTUS ASTARTES INFANTRY/MOUNTED model only. This model’s ranged attacks (excluding [Psychic] attacks) have +1 A, S, AP and D.",
    "anyKeywords": [
      "INFANTRY",
      "MOUNTED"
    ]
  },
  "enhancement-sm-706d31ce137f45ed": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES"
    ],
    "eligibilityEvidence": "- Hunter's Instincts\nADEPTUS ASTARTES model only. In your first Movement phase, this unit can make an ingress move."
  },
  "enhancement-sm-7aeb998517e94f4d": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES"
    ],
    "eligibilityEvidence": "- Veteran of Behemoth\nADEPTUS ASTARTES model only. This unit’s ranged attacks have [Sustained Hits 1]."
  },
  "enhancement-sm-7b4f677483594724": {
    "subject": "UNIT",
    "keywords": [
      "DREADNOUGHT"
    ],
    "eligibilityEvidence": "- Venerable Champion (Aura)UPGRADE\nDREADNOUGHT unit only. While a friendly ADEPTUS ASTARTES INFANTRY/MOUNTED unit is within 6\" of this unit, that unit’s attacks can re-roll hit rolls of 1."
  },
  "enhancement-sm-7cb5acef68494f69": {
    "subject": "UNIT",
    "keywords": [
      "ADEPTUS ASTARTES",
      "MOUNTED"
    ],
    "eligibilityEvidence": "- Supercharged EnginesUPGRADE\nADEPTUS ASTARTES MOUNTED unit only. This unit can re-roll advance rolls."
  },
  "enhancement-sm-839dc39b99364e56": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES"
    ],
    "eligibilityEvidence": "- Hunter's Eye\nADEPTUS ASTARTES model only. This unit’s ranged attacks:\n- Have [IGNORES COVER].\n- Have [SUSTAINED HITS 1]."
  },
  "enhancement-sm-89cb52bb94b4419d": {
    "subject": "MODEL",
    "keywords": [
      "PHOBOS"
    ],
    "eligibilityEvidence": "- Execute and Redeploy\nPHOBOS model only. In your Shooting phase, after this unit has shot, if this unit is unengaged, this unit can make a normal move of up to 6\". If it does, this unit is not eligible to declare a charge until the end of the turn."
  },
  "enhancement-sm-90130970a79d4ac0": {
    "subject": "MODEL",
    "keywords": [
      "GRAVIS"
    ],
    "eligibilityEvidence": "- Indefatigable Fortitude\nGRAVIS model only. Attacks that target this unit with a S greater than this unit’s T have -1 to wound rolls."
  },
  "enhancement-sm-90544ca326d243be": {
    "subject": "MODEL",
    "keywords": [
      "APOTHECARY BIOLOGIS"
    ],
    "eligibilityEvidence": "- Narthecis Gauntlet\nAPOTHECARY BIOLOGIS model only. in your Command phase, this unit heals D3+1 wounds."
  },
  "enhancement-sm-90b7ccf121e34215": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES"
    ],
    "eligibilityEvidence": "- Imperium's Sword\nADEPTUS ASTARTES model only. This model has the following weapon:\nMELEE WEAPONS\nRANGE\nA\nWS\nS\nAP\nD\nImperium’s Sword\nImperium’s Sword\nMelee\n6\n2+\n7\n-3\n3"
  },
  "enhancement-sm-928cd50003a8461e": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES",
      "INFANTRY"
    ],
    "eligibilityEvidence": "- Blackwing Shroud\nADEPTUS ASTARTES INFANTRY model only. This unit has Infiltrators."
  },
  "enhancement-sm-96a03924178349b9": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES"
    ],
    "eligibilityEvidence": "- Laurels of Triumph\nADEPTUS ASTARTES model only. This model’s melee attacks have:\n- +1 S and AP.\n- Or: If the assault doctrine is active for this unit, +2 S and AP."
  },
  "enhancement-sm-9b0e68b4f3284c34": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES"
    ],
    "eligibilityEvidence": "- Forged in Battle\nAdeptus Astartes model only. This unit can ignore modifiers to:\n- BS.\n- WS.\n- Hit rolls."
  },
  "enhancement-sm-9c7f16cb33a54e71": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES"
    ],
    "eligibilityEvidence": "- Laurels of Vigilance\nADEPTUS ASTARTES model only.(Once per battle round, per army) When you use the Fire Overwatch/Heroic Intervention stratagem, if you target a friendly ADEPTUS ASTARTES BATTLELINE unit within 12\" of this model with that stratagem, that use is -1 CP."
  },
  "enhancement-sm-9d44d0978b974773": {
    "subject": "UNIT",
    "keywords": [
      "ADEPTUS ASTARTES",
      "INFANTRY"
    ],
    "eligibilityEvidence": "- Furious AssaultUPGRADE\nADEPTUS ASTARTES INFANTRY unit only. This unit’s melee attacks have [Sustained Hits 1: non-Monster/Vehicle]."
  },
  "enhancement-sm-9e05cb93e43e43ee": {
    "subject": "MODEL",
    "keywords": [
      "CAPTAIN"
    ],
    "eligibilityEvidence": "- Student of the Codex\nCAPTAIN model only. The tactical doctrine is active for this unit in addition to any other combat doctrine."
  },
  "enhancement-sm-9ee25efedeef41be": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES"
    ],
    "eligibilityEvidence": "- Stormseer's Wisdom\nADEPTUS ASTARTES model only. This unit can re-roll advance rolls."
  },
  "enhancement-sm-a6d2243e7dab403e": {
    "subject": "UNIT",
    "keywords": [
      "ADEPTUS ASTARTES",
      "VEHICLE"
    ],
    "eligibilityEvidence": "- Gunnery HonoursUPGRADE\nADEPTUS ASTARTES VEHICLE unit only (excluding DEDICATED TRANSPORT/FLY/WALKER units). This unit’s ranged attacks have [Heavy].",
    "excludeKeywords": [
      "DEDICATED TRANSPORT",
      "FLY",
      "WALKER"
    ]
  },
  "enhancement-sm-a872c96c64354de3": {
    "subject": "MODEL",
    "keywords": [
      "PHOBOS"
    ],
    "eligibilityEvidence": "- Seal of Shrouding\nPHOBOS model only. Enemy units cannot target this unit with snap shooting attacks."
  },
  "enhancement-sm-a9b5f170cd214ef8": {
    "subject": "UNIT",
    "keywords": [
      "ADEPTUS ASTARTES",
      "SPEEDER"
    ],
    "eligibilityEvidence": "- Auspex Triangulation ShrinesUPGRADE\nADEPTUS ASTARTES SPEEDER unit only. At the start of your Shooting phase, select one visible enemy unit within 12\" of this unit. That enemy unit is spotted:\n- While a unit is spotted, that unit has +3\" detection range."
  },
  "enhancement-sm-b83286afe07645eb": {
    "subject": "MODEL",
    "keywords": [
      "TECHMARINE"
    ],
    "eligibilityEvidence": "- Target Augury Web\nTECHMARINE model only. In your movement phase, at the start or end of this unit’s move, you can select one friendly ADEPTUS ASTARTES VEHICLE model within 3\" of this unit. That VEHICLE model’s attacks have [LETHAL HITS] until the start of your next Command phase"
  },
  "enhancement-sm-bb65f6f6f8834a96": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES"
    ],
    "eligibilityEvidence": "- Immolator\nADEPTUS ASTARTES model only. This unit’s [TORRENT] weapons have +1 A."
  },
  "enhancement-sm-bc9c1fa646c54bb0": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES"
    ],
    "eligibilityEvidence": "- Spearpoint Paragon\nADEPTUS ASTARTES model only. This model’s melee attacks have:\n- +1 S and AP.\n- Or: If this unit made a charge move this turn, +2 S and AP."
  },
  "enhancement-sm-cb0f3a594ea44264": {
    "subject": "MODEL",
    "keywords": [
      "TECHMARINE"
    ],
    "eligibilityEvidence": "- Adept of the Omnissiah\nTECHMARINE model only. (Once per battle round, per army) When an enemy unit targets a friendly ADEPTUS ASTARTES VEHICLE unit within 6\" of this unit, you can use this ability. If you do, that VEHICLE unit has Feel No Pain 5+ until that enemy unit has attacked."
  },
  "enhancement-sm-cfb520ff879f4733": {
    "subject": "MODEL",
    "keywords": [
      "CAPTAIN"
    ],
    "eligibilityEvidence": "- Adept of the Codex\nCAPTAIN model only. The tactical doctrine is active for this unit in addition to any other combat doctrine."
  },
  "enhancement-sm-d79a770177054671": {
    "subject": "MODEL",
    "keywords": [
      "TACTICUS"
    ],
    "eligibilityEvidence": "- Cyber-familiar\nTACTICUS model only. When both players have deployed their armies, you can redeploy up to three friendly ADEPTUS ASTARTES INFANTRY units. When doing so, you can set those units up in strategic reserves, regardless of how many units are already in strategic reserves."
  },
  "enhancement-sm-db9dd5a127854fa2": {
    "subject": "MODEL",
    "keywords": [
      "PHOBOS"
    ],
    "eligibilityEvidence": "- Venator Omni-auspex\nPHOBOS model only. This unit’s attacks that target a hidden unit can:\n- Re-roll wound rolls of 1.\n- Or: If the assault doctrine is active for this unit, re-roll wound rolls of 1-2."
  },
  "enhancement-sm-dbbcb94020ba4223": {
    "subject": "MODEL",
    "keywords": [
      "GRAVIS"
    ],
    "eligibilityEvidence": "- Honour Indefatigable\nGRAVIS model only. (Once per battle, per army) At the end of a phase in which this model is destroyed, roll one D6:\n- On a 2+, set this model back up on the battlefield as close as possible to where it was destroyed, unengaged, with 3 wounds remaining."
  },
  "enhancement-sm-dcbae3c2b6534ac1": {
    "subject": "UNIT",
    "keywords": [
      "GRAVIS"
    ],
    "eligibilityEvidence": "- Immovable ConquerorsUPGRADE\nGRAVIS unit only. This unit has +1 OC."
  },
  "enhancement-sm-e5c04a1c3f6444b7": {
    "subject": "MODEL",
    "keywords": [
      "TACTICUS"
    ],
    "eligibilityEvidence": "- Martial Paragon\nTACTICUS model only. This unit’s attacks can:\n- Re-roll one hit roll.\n- Re-roll one wound roll."
  },
  "enhancement-sm-f2a5e85d052342cd": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES",
      "TERMINATOR"
    ],
    "eligibilityEvidence": "- Champion of the First Company\nADEPTUS ASTARTES TERMINATOR model only. This unit’s melee attacks have [Lethal Hits]."
  },
  "enhancement-sm-f44cee5f5e3049ed": {
    "subject": "MODEL",
    "keywords": [
      "CAPTAIN"
    ],
    "eligibilityEvidence": "- Tactical Insight\nCAPTAIN model only. The tactical doctrine is active for this unit in addition to any other combat doctrine."
  },
  "enhancement-sm-fb4229dbc220421a": {
    "subject": "MODEL",
    "keywords": [
      "ADEPTUS ASTARTES"
    ],
    "eligibilityEvidence": "- Master of the Machine War\nADEPTUS ASTARTES model only. In your Movement phase, you can select one visible friendly ADEPTUS ASTARTES VEHICLE unit within 6\" of this model and then select the devastator doctrine or tactical doctrine. That doctrine is active for that VEHICLE unit until the start of your next Command phase."
  }
};
