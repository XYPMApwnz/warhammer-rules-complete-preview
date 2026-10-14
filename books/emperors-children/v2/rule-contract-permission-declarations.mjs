/** Existing canonical rules granted as passive permission references. Their
 * conditional payloads remain source-backed declarations, never battle actions. */
export const permissionDeclarations=[
  {ruleId:'detachment-mercurial-host:rule',name:'Quicksilver Grace',kind:'DETACHMENT_RULE',
    ownerId:'detachment-mercurial-host',targetBinding:'ROSTER_UNITS',keyword:'EMPEROR’S CHILDREN',
    quote:'You can re-roll Advance rolls made for EMPEROR’S CHILDREN units from your army.',
    event:{id:'advance-roll',subject:'UNIT',key:'unitAdvanceRoll',quote:'Advance rolls made for EMPEROR’S CHILDREN units from your army'},
    restrictions:['You can re-roll','EMPEROR’S CHILDREN units from your army']},
  {ruleId:'detachment-court-of-the-phoenician:enhancement:1',name:'Tears of the Phoenix',kind:'ENHANCEMENT',
    ownerId:'detachment-court-of-the-phoenician',targetBinding:'SOURCE_UNIT',keywords:['EMPEROR’S CHILDREN'],
    quote:'EMPEROR’S CHILDREN model only. Each time a model in the bearer’s unit makes a melee attack, you can ignore any or all modifiers to that attack’s Weapon Skill characteristic and any or all modifiers to the Hit roll and Wound roll.',
    event:{id:'melee-attack',subject:'MODEL',key:'meleeAttack',quote:'Each time a model in the bearer’s unit makes a melee attack'},
    restrictions:['melee attack','you can ignore any or all modifiers','Weapon Skill characteristic','Hit roll and Wound roll']},
  {ruleId:'detachment-mercurial-host:enhancement:4',name:'Loathsome Dexterity',kind:'ENHANCEMENT',
    ownerId:'detachment-mercurial-host',targetBinding:'SOURCE_UNIT',keywords:['EMPEROR’S CHILDREN'],
    quote:'EMPEROR’S CHILDREN model only. Each time a model in the bearer’s unit makes a Normal, Advance or Fall Back move, it can move through enemy models. When doing so, it can move within Engagement Range of such models but cannot end that move within Engagement Range of them, and any Desperate Escape test is automatically passed.',
    event:{id:'movement',subject:'MODEL',key:'normalAdvanceFallBackMove',quote:'Each time a model in the bearer’s unit makes a Normal, Advance or Fall Back move'},
    restrictions:['Normal, Advance or Fall Back move','through enemy models','can move within Engagement Range',
      'cannot end that move within Engagement Range of them','any Desperate Escape test is automatically passed']},
  {ruleId:'detachment-peerless-bladesmen:enhancement:1',name:'Faultless Opportunist',kind:'ENHANCEMENT',
    ownerId:'detachment-peerless-bladesmen',targetBinding:'SOURCE_UNIT',keywords:[],
    // The current official replacement omits the historical faction prefix.
    // MODEL bearer and Detachment ownership remain; do not invent a restriction.
    quote:'You can target this unit with the Heroic Intervention stratagem, regardless of any other uses of that stratagem this phase. If you do:\n- That use is -1 CP.\n- That use does not prevent any uses of that stratagem on other units this phase.',
    event:{id:'heroic-intervention',subject:'UNIT',key:'heroicInterventionSelected',quote:'You can target this unit with the Heroic Intervention stratagem'},
    coreReferenceId:'core-rule-15-11-heroic-intervention',
    restrictions:['regardless of any other uses of that stratagem this phase','If you do:',
      'That use is -1 CP.','That use does not prevent any uses of that stratagem on other units this phase.']},
  {ruleId:'detachment-carnival-of-excess:enhancement:1',name:'Empyric Suffusion',kind:'ENHANCEMENT',
    ownerId:'detachment-carnival-of-excess',targetBinding:'SOURCE_UNIT',keywords:['EMPEROR’S CHILDREN'],
    quote:'EMPEROR’S CHILDREN model only. When you target this unit with the Heroic Intervention stratagem, that use is -1 CP.',
    event:{id:'heroic-intervention',subject:'UNIT',key:'heroicInterventionSelected',quote:'When you target this unit with the Heroic Intervention stratagem'},
    coreReferenceId:'core-rule-15-11-heroic-intervention',restrictions:['When you target this unit','that use is -1 CP.']}
];

export const permissionStateFields=Object.fromEntries(permissionDeclarations.map(({event})=>
  [event.key,{contextLevel:'BATTLE',valueType:'boolean'}]));
