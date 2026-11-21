/** Constructed source-backed New Recruit TEXT; not captured user exports. */
import fs from 'node:fs';
import {getCurrentMfmSource} from '../../../mfm/content/current-mfm-release.mjs';
import assert from 'node:assert/strict';
import {buildTyranidsImportBook} from './roster-import-build.mjs';
import {createTyranidsRosterImport} from './roster-import.mjs';
const facts=JSON.parse(fs.readFileSync(new URL('./generated/effective.json',import.meta.url)));
const mfm=JSON.parse(fs.readFileSync(new URL('../../../'+getCurrentMfmSource('tyranids').capturePath,import.meta.url)));
const records=new Map(facts.entities.map(e=>[e.id,e])),book=buildTyranidsImportBook();
const norm=s=>s.toUpperCase().replace(/[’']/g,'').replace(/[^A-Z0-9]+/g,' ').trim();
const currentUnitPoints=(id,copyOrdinal,equipment=[])=>{
 const members=facts.entities.filter(e=>e.kind==='COMPOSITION_MEMBER'&&e.parentId===id),count=members.reduce((n,m)=>n+m.data.quantity.min,0);
 const row=mfm.units.find(u=>u.status==='CURRENT'&&norm(u.title)===norm(records.get(id).data.title));
 const tiers=row.pointSchedules.filter(s=>(s.minCopies??1)<=copyOrdinal&&(s.maxCopies??Infinity)>=copyOrdinal)
  .flatMap(s=>s.entries).filter(e=>count>=e.minModels&&count<=e.maxModels);
 assert.equal(tiers.length,1,'Current MFM needs one price tier for '+id+' copy '+copyOrdinal);
 return tiers[0].value+equipment.reduce((total,name)=>{
  const options=(row.paidOptions||[]).filter(option=>norm(option.title)===norm(name));
  assert(options.length<=1,'Current MFM paid equipment must be unambiguous: '+name);
  return total+(options[0]?.value||0);
 },0);
};
export const captureStatus='Constructed source-backed New Recruit TEXT fixtures; REAL_NEW_RECRUIT_EXPORT_TESTED=NO';
export function block(id,enhancement){
 const members=facts.entities.filter(e=>e.kind==='COMPOSITION_MEMBER'&&e.parentId===id),count=members.reduce((n,m)=>n+m.data.quantity.min,0);
 const row=mfm.units.find(u=>u.status==='CURRENT'&&norm(u.title)===norm(records.get(id).data.title));
 const tier=row.pointSchedules.filter(s=>(s.minCopies??1)<=1&&(s.maxCopies??Infinity)>=1).flatMap(s=>s.entries).find(e=>count>=e.minModels&&count<=e.maxModels);
 assert.ok(tier,id);
 const gear={'unit-hive-tyrant':'Heavy venom cannon, Monstrous scything talons','unit-trygon':'Bio-electric pulse, Trygon scything talons','unit-norn-emissary':'Psychic Tendril, Monstrous scything talons, Monstrous rending claws'};
 const text=id==='unit-hyperadapted-raveners'?`5x Hyperadapted Raveners (${tier.value} pts)\n• 1x Ravener Prime: Prime claws and talons\n• 3x Raveners: Ravener heavy claws and talons\n• 1x Raveners: Venom bolt, Ravener heavy claws and talons\n`:
 `${count}x ${records.get(id).data.title} (${tier.value} pts)\n`+members.map(m=>{
  const binding=book.importBindings.compositions.find(c=>c.id===m.id||c.memberId===m.id),weapon=records.get(binding?.allowedProfileIds?.[0]);
  return `• ${m.data.quantity.min}x ${m.data.name}${gear[id]?': '+gear[id]:weapon?': '+weapon.data.name:''}\n`;
 }).join('');
 return text+(enhancement?`Enhancement: ${records.get(enhancement).data.title}\n`:'');
}
export const header=det=>`+ FACTION KEYWORD: Tyranids\n+ DETACHMENT: ${det}\n`;
export const make=(det,units)=>header(det)+units.map(u=>Array.isArray(u)?block(...u):block(u)).join('');
export const pairs=[['unit-broodlord','unit-genestealers'],['unit-old-one-eye','unit-carnifexes'],['unit-neurotyrant','unit-zoanthropes'],['unit-hive-tyrant','unit-tyrant-guard'],['unit-tyranid-prime-with-lash-whip','unit-tyranid-warriors-with-melee-bio-weapons'],['unit-winged-tyranid-prime','unit-gargoyles'],['unit-hyperadapted-raveners','unit-raveners']];
export const fixtures=[
 {id:'A',text:make('Invasion Fleet',[['unit-hive-tyrant','detachment-invasion-fleet:enhancement:4'],'unit-tyrant-guard','unit-broodlord','unit-genestealers','unit-genestealers'])},
 {id:'B',text:make('Warrior Bioform Onslaught',[['unit-tyranid-prime-with-lash-whip','detachment-warrior-bioform-onslaught:enhancement:1'],'unit-tyranid-warriors-with-melee-bio-weapons','unit-tyranid-prime-with-lash-whip'])},
 {id:'C',text:make('Invasion Fleet',['unit-neurotyrant','unit-zoanthropes','unit-neurogaunts','unit-hyperadapted-raveners','unit-raveners'])},
 {id:'D',text:make('Talons of the Norn-Queen',[['unit-norn-emissary','detachment-talons-of-the-norn-queen:enhancement:1'],['unit-norn-assimilator','detachment-talons-of-the-norn-queen:enhancement:2'],'unit-norn-emissary'])},
 {id:'E',text:make('Invasion Fleet',['unit-old-one-eye','unit-carnifexes','unit-psychophage','unit-psychophage'])},
 {id:'F',text:header('Invasion Fleet')+['Acid spray','Rupture cannon','Fleshborer hive'].map((w,i)=>`1x Tyrannofex (${currentUnitPoints('unit-tyrannofex',i+1,[w])} pts)\n• 1x Tyrannofex: ${w}, Stinger salvoes, Powerful limbs\n`).join('')},
 {id:'G',text:make('Unending Swarm',[['unit-broodlord','detachment-unending-swarm:enhancement:1'],'unit-genestealers','unit-genestealers'])},
 {id:'H',text:make('Ambush Predators',[['unit-von-ryans-leapers','detachment-ambush-predators:enhancement:2'],'unit-von-ryans-leapers'])}
];
for(const fixture of fixtures){const result=createTyranidsRosterImport(book).import(fixture.text);assert.equal(result.status,'READY',JSON.stringify({id:fixture.id,needs:result.needsBindings,errors:result.errors}));fixture.count=result.roster.units.length;}
