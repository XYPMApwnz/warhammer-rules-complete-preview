/** Literal canonical executable-Detachment cases shared by native and browser
 * QA. Constructed physical snapshots are not player exports or legality claims. */
import {detachmentSnapshot} from './detachment-card-text-fixtures.mjs';
import {setTyranidsSourceChoice,trygonCharacterOptionId} from '../../books/tyranids/v2/roster-source-choices.mjs';

export const files={'adeptus-mechanicus':'roster-runtime','chaos-space-marines':'roster-runtime',
  'emperors-children':'roster-attachments','tyranids':'roster-runtime','tau-empire':'roster-import',
  'death-guard':'rule-contract-effective','space-marines':'roster-runtime','dark-angels':'roster-runtime','blood-angels':'roster-runtime'};
// Literal canonical identities and source captions are independent of the
// helper's output. Shared IDs retain Space Marines ownership in supplements.
const common=[
  ['detachment-rule-sm-05b00954e4744b59','Death Blow','unit-sm-9e163be8d4bb42c1'],
  ['detachment-rule-sm-5d279871994f428e','Lightning-fast Strike','unit-sm-0dd92e6d8ad54ee6']
];
export const cases={
  'adeptus-mechanicus':[
    ['detachment-skitarii-hunter-cohort:rule','Stealth Optimisation','unit-skitarii-rangers'],
    ['detachment-cohort-cybernetica:rule','Cyber-Psalm Programming','unit-kastelan-robots'],
    ['detachment-luminen-auto-choir:rule','Cyber-Static Canticles','unit-corpuscarii-electro-priests'],
    ['detachment-lords-of-the-forge:rule','War-Form Mantles','unit-tech-priest-dominus'],
    ['detachment-cohort-acquisitus:rule','Noospheric Recon','unit-skitarii-rangers']
  ],
  'chaos-space-marines':[
    ['detachment-pactbound-zealots:rule','Marks of Chaos','unit-legionaries'],
    ['detachment-renegade-raiders:rule','Raiders and Reavers','unit-legionaries'],
    ['detachment-chaos-cult:rule','Desperate Devotion','unit-traitor-guardsmen-squad'],
    ['detachment-cult-of-the-arkifane:rule','Soul Forge Boons','unit-chaos-rhino'],
    ['detachment-renegade-warband:rule','Slaves to None','unit-legionaries'],
    ['detachment-devotees-of-destruction:rule','Rain of Ruin','unit-havocs']
  ],
  'emperors-children':[
    ['detachment-mercurial-host:rule','Quicksilver Grace','unit-tormentors'],
    ['detachment-spectacle-of-slaughter:rule','Entitled to Victory','unit-flawless-blades']
  ],
  'tyranids':[
    ['detachment-subterranean-assault:rule','Surprise Assault','unit-trygon'],
    ['detachment-ambush-predators:rule','Mindhunger','unit-lictor'],
    ['detachment-warrior-bioform-onslaught:rule','Leader-beasts','unit-tyranid-warriors-with-ranged-bio-weapons']
  ],
  'tau-empire':[
    ['detachment-kroot-hunting-pack:keywords','KEYWORDS','unit-kroot-carnivores'],
    ['detachment-experimental-prototype-cadre:rule','Superior Craftsmanship','unit-commander-in-enforcer-battlesuit']
  ],
  'death-guard':[
    ['detachment-shamblerot-vectorium:rule','Numberless Horde','unit-poxwalkers'],
    ['detachment-paragons-of-putrescence:rule','Hypervirulent Strains','unit-lord-of-contagion'],
    ['detachment-contagion-engines:rule','Warped and Rusted Animus','unit-helbrute']
  ],
  'space-marines':[...common,['detachment-rule-sm-b0de270f61aa47ac','Shadow Tactics','unit-sm-3815e40077e44702']],
  'dark-angels':[...common,['detachment-rule-da-6a259c00bc9f4bf498ee','Black-winged Vigilance','unit-da-4649795c02b646809e13']],
  'blood-angels':common
};

export function createExecutableDetachmentSnapshot(book,ruleId,unitId){
  const rule=book.entities.find(entity=>entity.id===ruleId),unit=book.entities.find(entity=>entity.id===unitId);
  if(rule?.kind!=='DETACHMENT_RULE'||unit?.kind!=='DATASHEET')throw new TypeError('Missing literal canonical executable Detachment fixture');
  let snapshot=detachmentSnapshot(book,{id:ruleId,detachmentId:rule.parentId,
    units:[{instanceId:'physical/right',unitId,profileId:unit.data.profileIds[0],quantity:1},
      {instanceId:'physical/control',unitId,profileId:unit.data.profileIds[0],quantity:1}]});
  // Canonical profiles are selected explicitly. The lookup never selects or
  // parses weapons; these disposable snapshots exercise existing execution.
  for(const physical of snapshot.units)if(unit.data.weaponIds.length)physical.modelRows[0].selections.push({
    selectionKey:'constructed/canonical-weapons',canonicalProfileIds:[...unit.data.weaponIds],canonicalEquipmentIds:[],physicalQuantity:1,perModelQuantity:1});
  if(ruleId==='detachment-pactbound-zealots:rule')snapshot.units[0].selectedMarkId=ruleId+':mark:3';
  if(ruleId==='detachment-subterranean-assault:rule')snapshot=setTyranidsSourceChoice(book,snapshot,'physical/right',ruleId,trygonCharacterOptionId);
  return snapshot;
}
