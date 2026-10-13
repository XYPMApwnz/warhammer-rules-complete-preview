// Source-valid physical rows; repeated units are unselected negative controls.
export const equipmentCaptionRoster = `+ FACTION KEYWORD: Chaos - Death Guard
+ DETACHMENT: Virulent Vectorium
3x Deathshroud Terminators (140 pts)
• 1x Deathshroud Champion: Manreaper, Plaguespurt gauntlet, Icon of Despair
• 2x Deathshroud Terminators: 2 with Manreaper, Plaguespurt gauntlet
3x Deathshroud Terminators (140 pts)
• 1x Deathshroud Champion: Manreaper, Plaguespurt gauntlet
• 2x Deathshroud Terminators: 2 with Manreaper, Plaguespurt gauntlet
5x Plague Marines (90 pts)
• 1x Plague Champion: Boltgun, Plague knives
• 1x Plague Marine: Boltgun, Plague knives, Icon of Despair
• 3x Plague Marines: 3 with Boltgun, Plague knives
5x Plague Marines (90 pts)
• 1x Plague Champion: Boltgun, Plague knives
• 4x Plague Marines: 4 with Boltgun, Plague knives
3x Plague Drones (100 pts)
• 1x Plaguebringer: Death’s heads, Foul mouthparts, Plaguesword
• 1x Plague Drone: Death’s heads, Foul mouthparts, Plaguesword, Instrument of Chaos
• 1x Plague Drone: Death’s heads, Foul mouthparts, Plaguesword, Daemonic Icon
3x Plague Drones (100 pts)
• 1x Plaguebringer: Death’s heads, Foul mouthparts, Plaguesword
• 2x Plague Drones: 2 with Death’s heads, Foul mouthparts, Plaguesword
10x Plaguebearers (100 pts)
• 1x Plagueridden: Plaguesword
• 1x Plaguebearer: Plaguesword, Instrument of Chaos
• 1x Plaguebearer: Plaguesword, Daemonic Icon
• 7x Plaguebearers: 7 with Plaguesword
10x Plaguebearers (100 pts)
• 1x Plagueridden: Plaguesword
• 9x Plaguebearers: 9 with Plaguesword
1x Lord of Contagion (100 pts): Manreaper
1x Biologus Putrifier (50 pts): Hyper blight grenades, Injector pistol, Plague knives`;

// Explicit accepted source addresses, not denominators inferred from bindings.
export const equipmentCaptionCases = [
  {slug:'deathshroud-terminators',file:'Deathshroud-Terminators.html',option:2,label:'icon of despair',unit:1,row:1,
    instruction:'The Deathshroud Champion can be equipped with 1 icon of despair.'},
  {slug:'plague-marines',file:'Plague-Marines.html',option:8,label:'icon of despair',unit:3,row:2,
    instruction:'One Plague Marine equipped with a boltgun can be equipped with 1 icon of despair. This model’s boltgun cannot be replaced.'},
  {slug:'plague-drones',file:'Plague-Drones.html',option:1,label:'instrument of Chaos',unit:5,row:2,
    instruction:'1 Plague Drone that is not equipped with a daemonic icon can be equipped with 1 instrument of Chaos.'},
  {slug:'plague-drones',file:'Plague-Drones.html',option:2,label:'daemonic icon',unit:5,row:3,
    instruction:'1 Plague Drone that is not equipped with an instrument of Chaos can be equipped with 1 daemonic icon.'},
  {slug:'plaguebearers',file:'Plaguebearers.html',option:1,label:'instrument of Chaos',unit:7,row:2,
    instruction:'1 Plaguebearer that is not equipped with a daemonic icon can be equipped with 1 instrument of Chaos.'},
  {slug:'plaguebearers',file:'Plaguebearers.html',option:2,label:'daemonic icon',unit:7,row:3,
    instruction:'1 Plaguebearer that is not equipped with an instrument of Chaos can be equipped with 1 daemonic icon.'}
];

export function withoutEquipmentCaptions(value) {
  if(Array.isArray(value))return value.map(withoutEquipmentCaptions);
  if(!value||typeof value!=='object')return value;
  return Object.fromEntries(Object.entries(value).flatMap(([key,item])=>{
    if(key==='sourceReferences'){
      const references=item.filter(reference=>!reference.caption);
      return references.length?[[key,withoutEquipmentCaptions(references)]]:[];
    }
    return [[key,withoutEquipmentCaptions(item)]];
  }));
}
