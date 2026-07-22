(function () {
  'use strict';
  window.CORE_BASIC_LAYOUTS=Object.freeze({
    introduction:{
      type:'introduction',
      pages:[4,5],
      lead:'Welcome to the Warhammer 40,000 Core Rules. The following pages contain everything you need to know in order to wage battle across the war-torn galaxy of the 41st millennium.',
      paragraphs:[
        'Warhammer 40,000 is a tabletop battle game in which each player commands an army of Citadel miniatures representing the forces of the Imperium or one of its many enemies. The game unfolds in a series of battle rounds, during which each player will take a turn made up of five phases. Across these phases, the players will move their forces around the battlefield and make attacks to destroy their foes with deadly shooting and bloody hand-to-hand fighting.',
        'A battle usually lasts for five battle rounds, at the end of which, through a combination of skill, tactics and a little luck, one of the players will be crowned the victor.',
        'Each Warhammer 40,000 game is played using a mission, which you must generate before you begin. You can do so by using a Warhammer 40,000 mission deck. Each mission will tell you how to prepare for the battle and deploy your forces, as well as any additional rules that will be in effect. Crucially, it will also state what the players need to do to win!',
        'Missions will instruct players to muster an army from their collection of Citadel miniatures, and will state the total size those armies should be. A simple guide to mustering an army can be found in the Warhammer 40,000 app. Doing so is a rewarding hobby in itself, with near limitless narrative themes and unit combinations to explore for over two-dozen factions.',
        'For whichever faction you want to collect and game with, a Codex is an invaluable guide. Each Codex is the ultimate source book for that faction, filled with inspirational background, art and photography, as well as the rules representing that faction’s models and the unique fighting styles they can use on the tabletop.',
        'Finally, before playing a game of Warhammer 40,000, you will need to create a battlefield with some terrain. You can use any surface you can place your models and terrain upon; a table is ideal. Your mission will tell you the size of battlefield you should use, and guide you on the volume and placement of terrain. In doing so, players can recreate many of the 41st millennium’s nightmarish war zones, from carnivorous death worlds to war-ravaged cityscapes.',
        'The following pages contain the Core Rules that every Warhammer 40,000 player will need to know. This book is your indispensable guide to playing exciting war games that bring the grim and desperate conflicts of the 41st millennium to life. So grab your dice and tape measure, steel your resolve, and may your victories go down in legend!'
      ],
      aside:{
        title:'WARHAMMER 40,000: THE APP',
        paragraphs:[
          'The Warhammer 40,000 app is the best companion to your games of Warhammer 40,000! As well as including enhanced Core Rules with expanded reference features, the app allows you to easily create an army roster and access your faction’s rules.',
          'The Warhammer 40,000 app is also the best place to get the very latest updates for your faction, from additional background to brand new rules.',
          'On the following pages, references to additional app content are highlighted in green, as shown below:',
          '► Example App Reference',
          'Scan the code below to get started with the Warhammer 40,000 app.'
        ]
      }
    },
    'core-concepts':{
      type:'concepts',
      lead:'Before you learn how to move your warriors across the battlefield and attack the enemy in deadly firefights and bloody close combat, this section introduces some core concepts that underpin every Warhammer 40,000 battle.',
      cutoff:{'01.07':'SEE ALSO'},
      aside:{title:'BATTLEFIELD MORALE',text:'The morale and organisation of troops can waver and break during battle. This is checked using battle-shock rolls, most commonly in the Command phase. Failing such a roll represents the unit’s courage faltering due to taking casualties or through other disruption, reducing its battlefield effectiveness. Similarly, some rules will require you to check a unit’s readiness by making a leadership roll.'}
    },
    datasheets:{
      type:'datasheet',
      lead:'Each unit has a datasheet that explains how it functions in battle. Here you will learn how to use datasheets when preparing your army and playing games.',
      overrides:{
        '02.05':'Datasheets have a list of keywords, separated into faction keywords and other keywords. The former are used when deciding which models to include in your army, but otherwise both are functionally the same. Keywords appear in full capitals, in KEYWORD BOLD.\n\nSome rules are linked to one or more keywords. For example, a rule might say that it applies to INFANTRY units. This means it only applies to units that have the INFANTRY keyword. Singular and plural instances of the same keyword function in the same way.'
      },
      visuals:[{after:'02.05',src:'assets/crops/datasheet-boyz.jpg',label:'ANNOTATED DATASHEET // ORIGINAL PDF PAGE 11',className:'datasheet-visual'}]
    },
    moving:{
      type:'illustrated',
      lead:'During a battle, you will move your models by picking them up and changing their position on the battlefield. The principles of movement are explained here.',
      cutoff:{'03.01':'++ WE WILL NOT SIMPLY ENDURE','03.04':'WHAT IS COHERENCY?'},
      visuals:[
        {after:'03.01',src:'assets/crops/moving-straight.jpg',label:'MOVING IN A STRAIGHT LINE // ORIGINAL PDF PAGE 13'},
        {after:'03.01',src:'assets/crops/moving-rotation.jpg',label:'ROTATING // ORIGINAL PDF PAGE 13'},
        {after:'03.04',src:'assets/crops/coherency.jpg',label:'COHERENCY // ORIGINAL PDF PAGE 15'},
        {after:'03.04',src:'assets/crops/engagement.jpg',label:'ENGAGEMENT // ORIGINAL PDF PAGE 15'}
      ]
    },
    'making-attacks':{
      type:'procedure',
      lead:'During the battle, your units will shoot at and fight the enemy, making attacks with their weapons each time they do so. This section explains how to make attacks with your models.',
      cutoff:{'04.02':'Each time a unit shoots or fights'},
      replacements:{'04.03':[{from:/SEE ALSO[\s\S]*?IDENTICAL ATTACKS/,to:'IDENTICAL ATTACKS'}]}
    },
    'attack-sequence':{
      type:'sequence',
      lead:'Whenever models make attacks, you will follow the sequence detailed in this section to find out if they inflict damage.',
      cutoff:{'05.02':'SEE ALSO','05.04':'1. SELECT WEAPONS'},
      visuals:[
        {after:'05.02',src:'assets/crops/hit-roll-table.jpg',label:'HIT ROLLS // ORIGINAL PDF PAGE 18'},
        {after:'05.02',src:'assets/crops/wound-roll-table.jpg',label:'WOUND ROLLS // ORIGINAL PDF PAGE 18'},
        {after:'05.04',src:'assets/crops/save-roll-table.jpg',label:'CHECK SAVE ROLL // ORIGINAL PDF PAGE 19'},
        {after:'05.04',src:'assets/crops/example-making-attacks.jpg',label:'MAKING ATTACKS // ORIGINAL PDF PAGE 20'},
        {after:'05.04',src:'assets/crops/example-attack-dice.jpg',label:'RESOLVING ATTACK DICE AND OTHER ATTACKS // ORIGINAL PDF PAGE 21'},
        {after:'05.04',src:'assets/crops/example-attached-unit.jpg',label:'ATTACKING ATTACHED UNITS // ORIGINAL PDF PAGE 22'},
        {after:'05.04',src:'assets/crops/example-allocation-groups.jpg',label:'ALLOCATION GROUPS // ORIGINAL PDF PAGE 23'}
      ]
    },
    'other-concepts':{
      type:'concepts',
      lead:'This section contains some additional rules concepts that are most frequently used while making attacks.',
      cutoff:{'06.03':'MODEL VISIBLE'},
      visuals:[{after:'06.01',src:'assets/crops/visibility.jpg',label:'VISIBILITY EXAMPLES // ORIGINAL PDF PAGE 25',className:'visibility-visual'}]
    }
  });
}());
