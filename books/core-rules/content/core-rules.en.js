(function () {
  'use strict';

  const section = (id, number, title, page, summary, blocks = [], status = 'source') => ({
    id, number, title, page, summary, blocks, status
  });

  window.CORE_RULES = Object.freeze({
    meta: {
      title: 'Core Rules',
      edition: '11E',
      language: 'EN',
      version: 'Prototype 1.1',
      source: 'WH40k 11ed Core Rules - 01.06.2026',
      notice: 'Original English content extracted from the local Core Rules PDF. No translation layer is active.'
    },
    introduction: {
      id: 'introduction',
      title: 'Introduction',
      summary: 'Welcome to the Warhammer 40,000 Core Rules and the structure of a battle.',
      paragraphs: [
        'Warhammer 40,000 is a tabletop battle game in which each player commands an army of Citadel miniatures representing the forces of the Imperium or one of its many enemies. The game unfolds in a series of battle rounds, during which each player will take a turn made up of five phases. Across these phases, the players will move their forces around the battlefield and make attacks to destroy their foes with deadly shooting and bloody hand-to-hand fighting.',
        'A battle usually lasts for five battle rounds, at the end of which, through a combination of skill, tactics and a little luck, one of the players will be crowned the victor.',
        'Each Warhammer 40,000 game is played using a mission, which you must generate before you begin. You can do so by using a Warhammer 40,000 mission deck. Each mission will tell you how to prepare for the battle and deploy your forces, as well as any additional rules that will be in effect. Crucially, it will also state what the players need to do to win!',
        'Missions will instruct players to muster an army from their collection of Citadel miniatures, and will state the total size those armies should be. A simple guide to mustering an army can be found in the Warhammer 40,000 app. Doing so is a rewarding hobby in itself, with near limitless narrative themes and unit combinations to explore for over two-dozen factions.',
        'For whichever faction you want to collect and game with, a Codex is an invaluable guide. Each Codex is the ultimate source book for that faction, filled with inspirational background, art and photography, as well as the rules representing that faction’s models and the unique fighting styles they can use on the tabletop.',
        'Finally, before playing a game of Warhammer 40,000, you will need to create a battlefield with some terrain. You can use any surface you can place your models and terrain upon; a table is ideal. Your mission will tell you the size of battlefield you should use, and guide you on the volume and placement of terrain. In doing so, players can recreate many of the 41st millennium’s nightmarish war zones, from carnivorous death worlds to war-ravaged cityscapes.',
        'The following pages contain the Core Rules that every Warhammer 40,000 player will need to know. This book is your indispensable guide to playing exciting war games that bring the grim and desperate conflicts of the 41st millennium to life. So grab your dice and tape measure, steel your resolve, and may your victories go down in legend!'
      ]
    },
    groups: [
      {
        id: 'basic-rules', title: 'Basic Rules', range: '01-06', pages: '6-25',
        description: 'The essential rules concepts, including how to use datasheets and how to move and attack with your models.',
        sections: [
          section('core-concepts', '01', 'Core Concepts', 8, 'Armies, units and models, the active player, measuring distances, dice and Battle-shock.', [
            { type: 'rule', id: 'armies-units', code: '01.01-01.03', title: 'Armies, Units and Models', text: 'Each player commands an army made up of units of models. Models in a unit move and fight together as a single group.', terms: ['active-player'] },
            { type: 'rule', id: 'measuring', code: '01.04', title: 'Measuring Distances', text: 'Distances are measured in inches. Unless otherwise stated, measure to or from the closest part of a model’s base.', terms: ['within', 'wholly-within'] },
            { type: 'rule', id: 'dice', code: '01.05', title: 'Dice', text: 'D6 means one six-sided dice. For 2D6, roll two D6 and add the results. To roll a D3, roll one D6 and halve the result, rounding up.' },
            { type: 'callout', tone: 'alert', title: 'Battle-shock', text: 'While a unit is Battle-shocked, its models have an OC characteristic of “-”, it cannot be targeted with Stratagems, and it cannot start or complete an Action.', terms: ['battle-shock', 'objective-control'] }
          ]),
          section('datasheets', '02', 'Datasheets', 10, 'Profiles, abilities, weapons, keywords, unit composition and wargear options.', [
            { type: 'stats', title: 'Model Profile', values: [['M','6″'],['T','5'],['SV','5+'],['W','1'],['LD','7+'],['OC','2']] },
            { type: 'rule', id: 'profile-meaning', code: '02.02', title: 'Profiles', text: 'Move, Toughness, Save, Wounds, Leadership and Objective Control describe how a model functions on the battlefield.', terms: ['objective-control'] },
            { type: 'weapons', title: 'Weapon Profile Example', rows: [
              ['Kustom shoota','18″','4','5+','4','0','1','RAPID FIRE 2'],
              ['Big choppa','Melee','3','3+','7','-1','2','']
            ] }
          ]),
          section('moving', '03', 'Moving', 12, 'Moving units, setting up, coherency, engagement and moving across the battlefield.', [
            { type: 'rule', id: 'moving-units', code: '03.01', title: 'Moving Units', text: 'Move one or more models in the selected unit, one at a time. A model’s base cannot move through enemy models or cross the edge of the battlefield.' },
            { type: 'rule', id: 'coherency', code: '03.03', title: 'Coherency', text: 'A unit containing more than one model must be set up and end every kind of move in coherency.', terms: ['coherency'] },
            { type: 'callout', tone: 'info', title: 'Engagement', text: 'A model’s engagement range is the area within 2″ horizontally and 5″ vertically of it.', terms: ['engagement-range'] }
          ]),
          section('making-attacks', '04', 'Making Attacks', 16, 'Selecting targets, visibility, selecting weapons and resolving attacks.', [
            { type: 'rule', id: 'select-targets', code: '04.02', title: 'Select Targets', text: 'Select an eligible target for each weapon before resolving attacks. A ranged target must normally be visible and within range.' },
            { type: 'callout', tone: 'info', title: 'Visibility', text: 'A model is visible if any part of it can be seen from any part of the observing model.', terms: ['visibility'] }
          ]),
          section('attack-sequence', '05', 'Attack Sequence', 18, 'Hit rolls, wound rolls, save rolls and inflicting damage.', [
            { type: 'steps', title: 'Resolve One Attack', steps: [
              ['01','Hit Rolls','Roll one D6 for each attack dice and compare the result with the attacking weapon’s BS or WS.'],
              ['02','Wound Rolls','Roll one D6 for each hit and compare the attack’s Strength with the target’s Toughness.'],
              ['03','Save Rolls','The defending player allocates the attack and makes a saving throw for that model.'],
              ['04','Inflict Damage','If the save fails, the model loses a number of wounds equal to the attack’s Damage.']
            ] },
            { type: 'callout', tone: 'alert', title: 'Critical Rolls', text: 'An unmodified Hit roll of 6 is a Critical Hit. An unmodified Wound roll of 6 is a Critical Wound.', terms: ['critical-hit', 'critical-wound'] }
          ]),
          section('other-concepts', '06', 'Other Concepts', 24, 'Re-rolls, roll-offs, sequencing, modifiers and rounding.')
        ]
      },
      {
        id: 'battle-round', title: 'The Battle Round', range: '07-12', pages: '26-43',
        description: 'A series of battle rounds in which each player takes a turn consisting of five phases.',
        sections: [
          section('battle-round-overview', '07', 'The Battle Round', 28, 'Battle rounds, player turns, phases and out-of-phase rules.', [
            { type: 'phase-rail', phases: [['08','Command'],['09','Movement'],['10','Shooting'],['11','Charge'],['12','Fight']] }
          ]),
          section('command-phase', '08', 'Command Phase', 30, 'Command Points, Battle-shock and Command phase rules.'),
          section('movement-phase', '09', 'Movement Phase', 32, 'Remain Stationary, Normal Move, Advance and Fall Back.'),
          section('shooting-phase', '10', 'Shooting Phase', 34, 'Selecting eligible units, selecting targets and resolving ranged attacks.'),
          section('charge-phase', '11', 'Charge Phase', 36, 'Selecting eligible units, selecting targets, Charge rolls and Charge moves.'),
          section('fight-phase', '12', 'Fight Phase', 38, 'Fights First, Pile-in moves, melee attacks and Consolidation moves.')
        ]
      },
      {
        id: 'battlefields-tactics', title: 'Battlefields and Tactics', range: '13-16', pages: '44-59',
        description: 'Terrain, objectives, Stratagems and Actions.',
        sections: [
          section('terrain', '13', 'Terrain', 46, 'Moving over terrain, visibility, cover and terrain features.', [
            { type: 'callout', tone: 'info', title: 'Benefit of Cover', text: 'Models can gain the Benefit of Cover against ranged attacks as described by the relevant terrain rules.', terms: ['benefit-of-cover'] }
          ]),
          section('objectives', '14', 'Objectives', 52, 'Objective markers, Objective Control and Level of Control.', [
            { type: 'rule', id: 'control-objective', code: '14.02', title: 'Determining Control', text: 'Add together the OC characteristics of models within range of an objective marker. The player with the greater Level of Control controls it.', terms: ['objective-control'] }
          ]),
          section('stratagems', '15', 'Stratagems', 54, 'Command Point costs, timing, targets, effects and restrictions.'),
          section('actions', '16', 'Actions', 58, 'Starting, performing and completing Actions.')
        ]
      },
      {
        id: 'advanced-rules', title: 'Advanced Rules', range: '17-23', pages: '60-75',
        description: 'Specialised unit types and units that are not yet on the battlefield.',
        sections: [
          section('monsters-vehicles', '17', 'Monsters and Vehicles', 62, 'Frames, Big Guns Never Tire and large models.'),
          section('transports', '18', 'Transports', 64, 'Transport capacity, Embark, Disembark and destroyed Transports.'),
          section('attached-units', '19', 'Attached Units', 66, 'Leader, Support, Bodyguard units and attack allocation.', [
            { type: 'rule', id: 'attached-unit', code: '19.01', title: 'Forming Attached Units', text: 'Leader and Support units can join eligible Bodyguard units during the Declare Battle Formations step.', terms: ['attached-unit'] }
          ]),
          section('strategic-reserves', '20', 'Strategic Reserves', 68, 'Placing units into Strategic Reserves and setting them up with an Ingress move.'),
          section('flying-surging', '21', 'Flying and Surging', 70, 'FLY models, MOBILE models and Surge moves.'),
          section('other-rules-abilities', '22', 'Other Rules and Abilities', 72, 'Aura, Faction, Psychic and Wargear abilities.'),
          section('aircraft', '23', 'Aircraft', 74, 'Aircraft movement, engagement, visibility and battlefield edges.')
        ]
      },
      {
        id: 'reference', title: 'Reference', range: '24-25', pages: 'Digital 11E',
        description: 'Core abilities and the rules for mustering an army.',
        sections: [
          section('core-abilities', '24', 'Core Abilities', 78, 'The most common unit and weapon abilities used in Warhammer 40,000.'),
          section('muster-armies', '25', 'Muster Armies', 0, 'Army faction, battle size, Detachment Points, unit limits, Warlord and Enhancements.')
        ]
      }
    ],
    terms: Object.freeze({
      'active-player': { title: 'Active Player', summary: 'The player who is currently resolving an action or whose turn is taking place.', rule: 'core-concepts' },
      'attached-unit': { title: 'Attached Unit', summary: 'A Leader and/or Support unit joined to a Bodyguard unit.', rule: 'attached-units' },
      'battle-shock': { title: 'Battle-shock', summary: 'A state that reduces a unit’s Objective Control and restricts Stratagems and Actions.', rule: 'core-concepts', related: ['objective-control'] },
      'benefit-of-cover': { title: 'Benefit of Cover', summary: 'A defensive benefit granted by terrain against eligible ranged attacks.', rule: 'terrain', related: ['visibility'] },
      'coherency': { title: 'Coherency', summary: 'The required spacing between models in the same unit when set up or after a move.', rule: 'moving', related: ['engagement-range'] },
      'critical-hit': { title: 'Critical Hit', summary: 'An unmodified Hit roll of 6.', rule: 'attack-sequence', related: ['critical-wound'] },
      'critical-wound': { title: 'Critical Wound', summary: 'An unmodified Wound roll of 6.', rule: 'attack-sequence', related: ['critical-hit'] },
      'engagement-range': { title: 'Engagement Range', summary: 'The area within 2″ horizontally and 5″ vertically of a model.', rule: 'moving', related: ['coherency'] },
      'objective-control': { title: 'Objective Control', summary: 'A characteristic that shows how effectively a model controls an objective.', rule: 'objectives', related: ['battle-shock'] },
      'visibility': { title: 'Visibility', summary: 'A model is visible if any part of it can be seen from any part of the observing model.', rule: 'making-attacks', related: ['benefit-of-cover'] },
      'wholly-within': { title: 'Wholly Within', summary: 'Every part of a model’s base or hull is within the specified distance.', rule: 'core-concepts', related: ['within'] },
      'within': { title: 'Within', summary: 'Any part of a model’s base or hull is within the specified distance.', rule: 'core-concepts', related: ['wholly-within'] }
    })
  });
}());
