/** Constructed source-backed New Recruit grammar, never a claimed real export.
 * Existing reviewed equipment fixtures supply physical bearer rows. Point
 * annotations are import metadata, not an independent MFM price oracle. */
import fs from 'node:fs';
import {equipmentCaptionRoster} from '../books/death-guard/v2/equipment-caption-fixtures.mjs';
import {csmChargeFixtures} from '../books/chaos-space-marines/v2/charge-roll-fixtures.mjs';
const ec=JSON.parse(fs.readFileSync(new URL('../books/emperors-children/v2/roster-import-fixtures.json',import.meta.url),'utf8'));
const legions=ec.fixtures.find(f=>f.id==='legions-physical-equipment').text;
const block=(text,title)=>text.split(/\n(?=\d+x )/).find(part=>new RegExp(`^\\d+x ${title} \\(`).test(part));
function equipment(id,book,title,roster,header){
  const selected=block(roster,title);if(!selected)throw new TypeError('Missing reviewed equipment fixture '+title);
  const without=selected.replaceAll(', Instrument of Chaos','');
  return {id,bookId:book,text:[header,selected,without.replaceAll(/, Daemonic [Ii]con/g,''),without].join('\n'),
    disabledText:[header,without,without.replaceAll(/, Daemonic [Ii]con/g,''),without].join('\n'),
    source:'parsed-unit-1',enabled:['parsed-unit-1'],negative:['parsed-unit-2','parsed-unit-3'],equipment:true};
}
const ruststalkers=`5x Sicarian Ruststalkers (60 pts)
• 1x Sicarian Ruststalker Princeps: Transonic blades
• 4x Sicarian Ruststalker: Transonic blades`;
const rangers=`10x Skitarii Rangers (85 pts)
• 1x Skitarii Ranger Alpha: Galvanic rifle, Close combat weapon
• 9x Skitarii Ranger: Galvanic rifle, Close combat weapon`;
const amHeader='+ FACTION KEYWORD: Imperium - Adeptus Mechanicus\n+ DETACHMENT: Haloscreed Battle Clade';
export const chargeFixtures=[
  equipment('dg-drones','death-guard','Plague Drones',equipmentCaptionRoster,'+ FACTION KEYWORD: Chaos - Death Guard\n+ DETACHMENT: Tallyband Summoners'),
  equipment('dg-bearers','death-guard','Plaguebearers',equipmentCaptionRoster,'+ FACTION KEYWORD: Chaos - Death Guard\n+ DETACHMENT: Tallyband Summoners'),
  {id:'am-gait',bookId:'adeptus-mechanicus',text:[amHeader,ruststalkers,ruststalkers,rangers].join('\n'),
    disabledText:[amHeader,rangers,rangers,rangers].join('\n'),source:'parsed-unit-1',enabled:['parsed-unit-1','parsed-unit-2'],negative:['parsed-unit-3']},
  ...csmChargeFixtures.map(f=>({id:f.id==='daemonkin'?'csm-daemonkin':'csm-symbiote',bookId:'chaos-space-marines',text:f.text,
    disabledText:f.text.replace('Enhancement: Empyric Symbiote\n',''),source:'parsed-unit-1',bodyguard:'parsed-unit-3',otherBodyguard:'parsed-unit-4',
    enabled:['parsed-unit-1','parsed-unit-3'],negative:['parsed-unit-2','parsed-unit-4',...(f.id==='daemonkin'?['parsed-unit-5']:[])],standalone:f.standalone})),
  equipment('ec-daemonettes','emperors-children','Daemonettes',legions,"+ FACTION KEYWORD: Chaos - Emperor's Children\n+ DETACHMENT: Carnival of Excess"),
  equipment('ec-seekers','emperors-children','Seekers',legions,"+ FACTION KEYWORD: Chaos - Emperor's Children\n+ DETACHMENT: Carnival of Excess")
];
