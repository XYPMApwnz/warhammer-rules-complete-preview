import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context={window:{}};
vm.createContext(context);
for(const file of ['books/shared/roster-parser.js','roster-guides/points-data.js','roster-guides/points-validator.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
const {WHRosterParser,WH_POINTS_CATALOG,WHRosterPoints}=context.window;
assert.equal(Object.keys(WH_POINTS_CATALOG['death guard'].units).length,36);
assert.equal(Object.keys(WH_POINTS_CATALOG['death guard'].enhancements).length,30);
assert.equal(Object.keys(WH_POINTS_CATALOG['adeptus mechanicus'].units).length,39);

const common=(declared,header,lordPoints)=>`+++++++++++++++++++++++++++++++++++++++++++++++
+ FACTION KEYWORD: Chaos - Death Guard
+ DETACHMENT: Virulent Vectorium (Worldblight)
+ FORCE DISPOSITION: Priority Assets
+ TOTAL ARMY POINTS: ${declared}pts
+ ENHANCEMENT: ${header} (on Char2: Lord of Contagion)
+ NUMBER OF UNITS: 9
++++++++++++++++++++++++++++++++++++++++++++++
Char1: 1x Biologus Putrifier (60 pts): Hyper blight grenades, Injector pistol, Plague knives
Char2: 1x Lord of Contagion (${lordPoints} pts): Manreaper
Enhancement: ${header} (+${lordPoints-120} pts)
Char3: 1x Malignant Plaguecaster (60 pts): Bolt pistol, Corrupted staff, Plague Wind
10x Plague Marines (180 pts)
• 9x Plague Marine
    1 with Boltgun, Plague knives
    2 with Plague knives, Plague spewer
    4 with Heavy plague weapon, Plague knives
    2 with Plague knives, Plasma gun
• 1x Plague Champion: Plasma gun, Power fist
1x Chaos Rhino (75 pts): Armoured tracks, Combi-bolter
3x Deathshroud Terminators (160 pts)
• 1x Deathshroud Terminator Champion: Manreaper, Plaguespurt gauntlet
• 2x Deathshroud Terminator: 2 with Manreaper, Plaguespurt gauntlet
1x Foetid Bloat-drone (100 pts): Plague probe, Fleshmower
1x Foetid Bloat-drone with heavy blight launcher (140 pts): Heavy blight launcher, Plague probe
Enhancement: Parasitic Woe-Reaper (+15 pts)
1x Myphitic Blight-hauler (100 pts): Bile spurt, Gnashing maw, Missile launcher, Multi-melta`;

for(const [declared,name,lordPoints,effect,currentTotal] of [
  [1025,'Revolting Regeneration',150,'persistent',1015],
  [1020,'Furnace of Plagues',145,'furnace',1020],
  [1005,'Daemon Weapon of Nurgle',130,'critical-hit-5',1005]
]){
  const roster=WHRosterParser.parse(common(declared,name,lordPoints));
  assert.equal(roster.units.length,9);
  assert.equal(roster.unitLineTotal,declared);
  assert.equal(roster.exportMatches,true);
  assert.equal(roster.enhancements.length,2,'header and inline copies must reconcile while Woe-Reaper remains present');
  const lord=roster.units.find(unit=>unit.sourceRef==='Char2');
  const primary=roster.enhancements.find(item=>item.name===name);
  const woe=roster.enhancements.find(item=>item.name==='Parasitic Woe-Reaper');
  assert.equal(primary.ownerUnitId,lord.id);
  assert.equal(primary.exportedCost,lordPoints-120);
  assert.equal(primary.ownerStatus,'resolved');
  assert.equal(woe.ownerName,'Foetid Bloat-drone with heavy blight launcher');
  assert.equal(woe.exportedCost,15);
  const result=WHRosterPoints.check(roster,'death guard');
  assert.equal(result.total,currentTotal);
  assert.equal(result.difference,currentTotal-declared);
  assert.equal(result.exportMatches,true);
  assert.equal(result.unresolved.length,0);
  assert.equal(result.enhancements.find(item=>item.name===name).effect,effect);
}

assert.ok(Object.values(WH_POINTS_CATALOG['death guard'].enhancements).every(item=>item.effect),'every Death Guard Enhancement must declare a presentation mode');
for(const [name,cost] of Object.entries({
  'revolting regeneration':20,
  'lancet of the worldsore':20,
  'insectile murmuration':20,
  plagueveil:25,
  'rejuvenating swarm':15,
  'host of the hybridised pox':20
}))assert.equal(WH_POINTS_CATALOG['death guard'].enhancements[name].value,cost,`${name} current cost`);

const mechanicus=WHRosterPoints.check({units:[{quantity:10,name:'Skitarii Rangers',models:[]}],declared:85,unitLineTotal:85,enhancements:[]},'adeptus mechanicus');
assert.equal(mechanicus.total,85);
assert.equal(mechanicus.difference,0);

const unresolved=WHRosterParser.parse(`+ FACTION KEYWORD: Chaos — Death Guard\n+ TOTAL ARMY POINTS: 120pts\n+ ENHANCEMENT: Furnace of Plagues (on Char9: Missing Owner)\n1x Lord of Contagion (120 pts): Manreaper`);
assert.equal(unresolved.enhancements[0].ownerStatus,'unresolved');
assert.match(unresolved.warnings[0],/owner could not be resolved/);
console.log('Roster parser and points QA passed.');
