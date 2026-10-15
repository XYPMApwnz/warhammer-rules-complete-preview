/** Constructed New Recruit text, not a real player's export. Exact selected
 * source equipment and physical duplicates exercise the two Charge sources. */
const legionaries=`5x Legionaries (95 pts)
• 1x Aspiring Champion: Bolt pistol, Boltgun, Close combat weapon
• 4x Legionaries: Bolt pistol, Boltgun, Close combat weapon`;
const master=`1x Master of Possession (65 pts)
• 1x Master of Possession: Bolt pistol, Rite of Possession, Staff of possession`;
const lord=`1x Chaos Lord (95 pts)
• 1x Chaos Lord: Plasma pistol, Daemon hammer`;
export const csmChargeFixtures=[
  {id:'daemonkin',ruleId:'datasheet-master-of-possession:section:1:block:0:text',
    sourceText:'Daemonkin (Psychic): While this model is leading a unit, add 1 to Advance and Charge rolls made for that unit.',
    standalone:0,text:['+ FACTION KEYWORD: Chaos - Chaos Space Marines',
      '+ DETACHMENT: Veterans of the Long War',master,master,legionaries,legionaries,lord,'Created with newrecruit.eu'].join('\n\n')},
  {id:'empyric-symbiote',ruleId:'detachment-renegade-warband:enhancement:4',
    sourceText:'HERETIC ASTARTES model only. Add 1 to Advance and Charge rolls made for the bearer’s unit.',
    standalone:1,text:['+ FACTION KEYWORD: Chaos - Chaos Space Marines',
      '+ DETACHMENT: Renegade Warband',lord.replace('\n','\nEnhancement: Empyric Symbiote\n'),
      lord,legionaries,legionaries,'Created with newrecruit.eu'].join('\n\n')}
];
