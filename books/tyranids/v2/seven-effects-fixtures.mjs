/** Supported New Recruit TEXT, constructed from accepted unit/model records.
 * These are not captured user exports. No browser state or output is patched. */
import {make} from './roster-ui-fixtures.mjs';
const unit=(n)=>`parsed-unit-${n}`;
function fixture(id,detachment,units,bindings={}){
  return {id,detachment,detachmentId:'detachment-'+detachment.toLowerCase().replaceAll(' ','-'),
    text:make(detachment,units).replaceAll('Neurotyrant: Psychic scream\n','Neurotyrant: Psychic scream, Neurotyrant claws and lashes\n'),unitIds:units.map((_,i)=>unit(i+1)),
    canonicalUnitIds:units.map(x=>Array.isArray(x)?x[0]:x),realExport:false,...bindings};
}
export const sevenEffectsFixtures=[
  fixture('guardian','Invasion Fleet',['unit-hive-tyrant','unit-the-swarmlord','unit-neurotyrant','unit-tyrant-guard','unit-tyrant-guard','unit-hive-tyrant'],
    {leaders:[unit(1),unit(2),unit(3)],bodyguard:unit(4),otherBodyguard:unit(5),duplicate:unit(6)}),
  fixture('elevated','Warrior Bioform Onslaught',[
    ['unit-winged-tyranid-prime','detachment-warrior-bioform-onslaught:enhancement:1'],
    ['unit-tyranid-prime-with-lash-whip','detachment-warrior-bioform-onslaught:enhancement:1'],
    'unit-tyranid-warriors-with-melee-bio-weapons','unit-tyranid-warriors-with-ranged-bio-weapons','unit-winged-tyranid-prime','unit-tyranid-prime-with-lash-whip'],
    {owners:[unit(1),unit(2)],bodyguards:[unit(3),unit(4)],duplicates:[unit(5),unit(6)],enhancementId:'detachment-warrior-bioform-onslaught:enhancement:1'}),
  fixture('power','Synaptic Nexus',[
    ['unit-neurotyrant','detachment-synaptic-nexus:enhancement:1'],'unit-tyrant-guard','unit-neurotyrant','unit-hive-tyrant'],
    {owner:unit(1),bodyguard:unit(2),duplicate:unit(3),unrelated:unit(4),enhancementId:'detachment-synaptic-nexus:enhancement:1'}),
  fixture('chameleonic','Vanguard Onslaught',[
    ['unit-winged-tyranid-prime','detachment-vanguard-onslaught:enhancement:2'],'unit-gargoyles','unit-winged-tyranid-prime','unit-gargoyles'],
    {owner:unit(1),bodyguard:unit(2),duplicate:unit(3),otherBodyguard:unit(4),enhancementId:'detachment-vanguard-onslaught:enhancement:2'}),
  fixture('mindhunger','Ambush Predators',['unit-deathleaper','unit-lictor','unit-neurolictor','unit-von-ryans-leapers','unit-lictor'],
    {recipients:[unit(1),unit(2),unit(3),unit(5)],unrelated:unit(4)}),
  fixture('leaderBeasts','Warrior Bioform Onslaught',['unit-winged-tyranid-prime','unit-tyranid-prime-with-lash-whip',
    'unit-tyranid-warriors-with-ranged-bio-weapons','unit-tyranid-warriors-with-melee-bio-weapons','unit-neurotyrant','unit-gargoyles','unit-winged-tyranid-prime'],
    {leaders:[unit(1),unit(2)],bodyguards:[unit(3),unit(4)],keywordRecipients:[unit(3),unit(4)],
      invulnerableRecipients:[unit(1),unit(2),unit(3),unit(4),unit(7)],unrelated:[unit(5),unit(6)]})
];
export const sevenEffectFixtures=Object.fromEntries(sevenEffectsFixtures.map(f=>[f.id,f]));
