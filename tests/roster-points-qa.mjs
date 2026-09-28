import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context={window:{}};
vm.createContext(context);
for(const file of ['books/shared/roster-parser.js','books/shared/rule-facts.js','roster-guides/points-data.js','roster-guides/points-validator.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
const {WHRosterParser,WH_POINTS_CATALOG,WHRosterPoints}=context.window;
assert.equal(Object.keys(WH_POINTS_CATALOG).length,9);
assert.equal(Object.keys(WH_POINTS_CATALOG['death guard'].units).length,36);
for(const title of ['death guard chaos lord','death guard chaos lord in terminator armour','death guard cultists','death guard possessed','death guard sorcerer in terminator armour'])assert.equal(WH_POINTS_CATALOG['death guard'].units[title],undefined,`${title} [Legends] must not enter the current Death Guard roster catalogue`);
assert.equal(new Set(Object.values(WH_POINTS_CATALOG['death guard'].enhancements).map(item=>item.id)).size,30);
assert.equal(Object.keys(WH_POINTS_CATALOG['adeptus mechanicus'].units).length,34);
assert.equal(new Set(Object.values(WH_POINTS_CATALOG['adeptus mechanicus'].enhancements).map(item=>item.title)).size,34);
assert.equal(Object.keys(WH_POINTS_CATALOG['t au empire'].units).length,43);
assert.equal(new Set(Object.values(WH_POINTS_CATALOG['t au empire'].enhancements).map(item=>item.title)).size,23);
assert.equal(Object.keys(WH_POINTS_CATALOG['emperor s children'].units).length,23);
assert.equal(Object.keys(WH_POINTS_CATALOG['emperor s children'].detachments).length,10);
assert.equal(new Set(Object.values(WH_POINTS_CATALOG['emperor s children'].enhancements).map(item=>item.title)).size,34);
assert.equal(Object.keys(WH_POINTS_CATALOG['space marines'].units).length,103);
assert.equal(Object.keys(WH_POINTS_CATALOG['space marines'].detachments).length,23);

const poxwalkersById=Object.values(WH_POINTS_CATALOG['death guard'].units).find(unit=>unit.unitId==='unit-poxwalkers');
assert.ok(poxwalkersById,'canonical points fixture requires Poxwalkers');
const renamedCanonicalUnit={id:'physical-poxwalkers',canonicalUnitId:'unit-poxwalkers',quantity:10,name:'Renamed Poxwalkers',models:[]};
const renamedCanonicalCheck=WHRosterPoints.check({units:[renamedCanonicalUnit],detachments:[],enhancements:[],declared:0,unitLineTotal:0},'death guard');
assert.equal(renamedCanonicalCheck.unresolved.length,0,'canonical Datasheet ID must survive a display-title rename');
assert.equal(renamedCanonicalCheck.total,poxwalkersById.points.find(row=>row.minModels===10&&row.maxModels===10).value);
const wrongCanonicalCheck=WHRosterPoints.check({units:[{...renamedCanonicalUnit,canonicalUnitId:'unit-not-real',name:'Poxwalkers'}],detachments:[],enhancements:[],declared:0,unitLineTotal:0},'death guard');
assert.deepEqual([...wrongCanonicalCheck.unresolved],['Unit: Poxwalkers'],'an explicit unknown canonical Datasheet ID must fail closed without title fallback');

const catalogUnitsById=faction=>new Map(Object.values(WH_POINTS_CATALOG[faction].units).map(unit=>[unit.id,unit]));
const catalogRelation=(faction,sourceId,kind,targetId)=>{
  const source=catalogUnitsById(faction).get(sourceId);
  assert.ok(source,`${faction}: missing catalogue unit ${sourceId}`);
  return (source.relations?.[kind]||[]).filter(item=>item.unitId===targetId);
};
const sharedR3bSupport=[
  ['unit-ancient','unit-tactical-squad'],
  ['unit-apothecary','unit-tactical-squad'],
  ['unit-lieutenant','unit-tactical-squad'],
  ['unit-ancient-in-terminator-armor','unit-terminator-squad']
];
const darkAngelsR3bSupport=[
  ['unit-ancient','unit-inner-circle-companions'],
  ['unit-apothecary','unit-inner-circle-companions'],
  ['unit-lieutenant','unit-inner-circle-companions'],
  ['unit-ancient-in-terminator-armor','unit-deathwing-knights'],
  ['unit-ancient-in-terminator-armor','unit-deathwing-terminator-squad']
];
const assertR3bSupport=(faction,sourceId,targetId)=>{
  const direct=catalogRelation(faction,sourceId,'canSupport',targetId);
  const inverse=catalogRelation(faction,targetId,'canBeSupportedBy',sourceId);
  assert.equal(direct.length,1,`${faction}: support ${sourceId}>${targetId}`);
  assert.equal(inverse.length,1,`${faction}: inverse ${targetId}<${sourceId}`);
  assert.equal(direct[0].maxCharacters,2,`${faction}: support capacity ${sourceId}>${targetId}`);
  assert.equal(inverse[0].maxCharacters,2,`${faction}: inverse capacity ${targetId}<${sourceId}`);
};
let r3bEffectiveManifestations=0;
for(const faction of ['space marines','dark angels','blood angels'])for(const [sourceId,targetId] of sharedR3bSupport){
  assertR3bSupport(faction,sourceId,targetId);
  r3bEffectiveManifestations++;
}
for(const [sourceId,targetId] of darkAngelsR3bSupport){
  assertR3bSupport('dark angels',sourceId,targetId);
  r3bEffectiveManifestations++;
  for(const faction of ['space marines','blood angels']){
    assert.equal(catalogRelation(faction,sourceId,'canSupport',targetId).length,0,`${faction}: DA-local support leak ${sourceId}>${targetId}`);
    const target=catalogUnitsById(faction).get(targetId);
    if(target)assert.equal(catalogRelation(faction,targetId,'canBeSupportedBy',sourceId).length,0,`${faction}: DA-local inverse leak ${targetId}<${sourceId}`);
  }
}
assert.equal(r3bEffectiveManifestations,17,'Roster Guides must expose all 17 effective R3B support manifestations');
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
  [1025,'Revolting Regeneration',150,'persistent',1020],
  [1020,'Furnace of Plagues',145,'furnace',1015],
  [1005,'Daemon Weapon of Nurgle',130,'critical-hit-5',1000]
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
  assert.equal(result.exportMatches,currentTotal===declared,'authoritative reconciliation must follow current total, not exported unit lines');
  assert.equal(result.unresolved.length,0);
  assert.equal(result.enhancements.find(item=>item.name===name).effect,effect);
}

assert.ok(Object.values(WH_POINTS_CATALOG['death guard'].enhancements).every(item=>item.effect),'every Death Guard Enhancement must declare a presentation mode');
const deathGuardMfmEnhancements={
  cornucophagus:35,
  'final ingredient':20,
  'needle of nurgle':25,
  'visions of virulence':15,
  'lancet of the worldsore':15,
  'parasitic woe reaper':15,
  'face of death':10,
  'helm of the fly king':20,
  'vile vigour':15,
  'warprot talisman':30,
  'insectile murmuration':15,
  plagueveil:15,
  'bilemaw blight':10,
  'eye of affliction':20,
  'shriekworm familiar':15,
  'tendrilous emissions':30,
  'host of the hybridised pox':40,
  'rejuvenating swarm':20,
  'lord of the walking pox':15,
  sorrowsyphon:10,
  'talisman of burgeoning':25,
  'witherbone pipes':25,
  'beckoning blight':20,
  'entropic knell':15,
  'fell harvester':10,
  'tome of bounteous blessings':20,
  'arch contaminator':25,
  'daemon weapon of nurgle':10,
  'furnace of plagues':25,
  'revolting regeneration':30
};
assert.deepEqual(
  [...new Set(Object.values(WH_POINTS_CATALOG['death guard'].enhancements).map(item=>item.title.toLowerCase().replace(/-/g,' ')))].sort(),
  Object.keys(deathGuardMfmEnhancements).sort(),
  'Death Guard Enhancement catalogue must exactly match MFM v1.1'
);
for(const [name,cost] of Object.entries(deathGuardMfmEnhancements)){
  assert.equal(WH_POINTS_CATALOG['death guard'].enhancements[name].value,cost,`${name} MFM v1.1 cost`);
}

const mechanicus=WHRosterPoints.check({units:[{quantity:10,name:'Skitarii Rangers',models:[]}],declared:85,unitLineTotal:85,enhancements:[]},'adeptus mechanicus');
assert.equal(mechanicus.total,85);
assert.equal(mechanicus.difference,0);

const starscytheRoster=WHRosterParser.parse(`FACTION KEYWORD: Xenos - T'au Empire
TOTAL ARMY POINTS: 325pts
1x Crisis Starscythe Battlesuits (105 pts)
• 3x Crisis Starscythe Battlesuit
    1 with T'au flamer
1x Crisis Starscythe Battlesuits (105 pts)
• 3x Crisis Starscythe Battlesuit
    1 with T'au flamer
1x Crisis Starscythe Battlesuits (115 pts)
• 3x Crisis Starscythe Battlesuit
    1 with T'au flamer`);
assert.deepEqual(Array.from(starscytheRoster.units,unit=>unit.quantity),[1,1,1],'unit quantity remains the physical selection-copy quantity');
assert.deepEqual(Array.from(starscytheRoster.units,unit=>unit.models.reduce((sum,model)=>sum+model.quantity,0)),[3,3,3],'model records preserve the physical model count');
for(const [count,expected] of [[1,105],[2,210],[3,325]]){
  const roster={...starscytheRoster,units:starscytheRoster.units.slice(0,count),declared:expected,unitLineTotal:expected};
  const result=WHRosterPoints.check(roster,'t au empire');
  assert.equal(result.total,expected,`Starscythe copy ${count} must use physical model count while retaining occurrence-tier pricing and paid wargear`);
  assert.equal(result.unresolved.length,0);
}
const legacyStarscythe=WHRosterPoints.check({units:[{quantity:3,name:'Crisis Starscythe Battlesuits',models:[]}],declared:100,unitLineTotal:100,enhancements:[]},'t au empire');
assert.equal(legacyStarscythe.total,100,'unit.quantity remains the fallback when no model records exist');
assert.equal(legacyStarscythe.unresolved.length,0);
const mortarionPoints=WHRosterPoints.check({units:[{quantity:1,name:'Mortarion',models:[]}],declared:375,unitLineTotal:375,enhancements:[]},'death guard');
assert.equal(mortarionPoints.total,375,'single-model fallback remains supported');
const defilerPoints=WHRosterPoints.check({units:[{quantity:1,name:'Defiler',models:[]}],declared:300,unitLineTotal:300,enhancements:[]},'chaos space marines');
assert.equal(defilerPoints.total,300,'copy-tier schedules without model-count clauses remain supported');
for(const quantity of [undefined,0,-1,1.5,Number.NaN]){
  const malformed=WHRosterPoints.check({units:[{quantity:1,name:'Crisis Starscythe Battlesuits',models:[{quantity,name:'Crisis Starscythe Battlesuit',wargear:'',loadouts:[]}]}],declared:0,unitLineTotal:0,enhancements:[]},'t au empire');
  assert.equal(malformed.total,0,`invalid physical model quantity ${String(quantity)} must not resolve a model-count tier`);
  assert.equal(malformed.unresolved.length,1);
}
const malformedModels=WHRosterPoints.check({units:[{quantity:1,name:'Crisis Starscythe Battlesuits',models:{quantity:3}}],declared:0,unitLineTotal:0,enhancements:[]},'t au empire');
assert.equal(malformedModels.total,0,'non-array model composition must fail closed for model-count tiers');
assert.equal(malformedModels.unresolved.length,1);
const matchingFallbackQuantity=WHRosterPoints.check({units:[{quantity:3,name:'Crisis Starscythe Battlesuits',models:[{quantity:0,name:'Crisis Starscythe Battlesuit',wargear:'',loadouts:[]}]}],declared:0,unitLineTotal:0,enhancements:[]},'t au empire');
assert.equal(matchingFallbackQuantity.total,0,'malformed explicit models must not fall back to a matching unit.quantity tier');
assert.equal(matchingFallbackQuantity.unresolved.length,1);
const splitModelStarscythe=WHRosterPoints.check({units:[{quantity:1,name:'Crisis Starscythe Battlesuits',models:[
  {quantity:1,name:'Crisis Starscythe Battlesuit',wargear:'',loadouts:[{quantity:1,wargear:"T'au flamer"}]},
  {quantity:2,name:'Crisis Starscythe Battlesuit',wargear:'',loadouts:[]}
]}],declared:105,unitLineTotal:105,enhancements:[]},'t au empire');
assert.equal(splitModelStarscythe.total,105,'physical model count must sum all model records while preserving paid wargear');
assert.equal(splitModelStarscythe.unresolved.length,0);

const fixtureDefinition={title:'Bounded Unit',points:[{label:'1 model',value:100}],wargear:[{label:'upgrade',value:10}]};
const fixtureCatalog={fixture:{units:{'bounded unit':fixtureDefinition},enhancements:{},detachments:{}}};
const fixturePoints=catalog=>{
  const scope={window:{WHRuleFacts:{normalizeKeyword:value=>String(value).toUpperCase()},WH_POINTS_CATALOG:catalog}};
  vm.runInNewContext(fs.readFileSync('roster-guides/points-validator.js','utf8'),scope,{filename:'roster-guides/points-validator.js'});
  return scope.window.WHRosterPoints;
};
const boundedRoster=quantity=>({units:[{id:'bounded',quantity:1,name:'Bounded Unit',models:[{quantity:1,name:'Bounded Unit',loadouts:[{quantity,wargear:'upgrade'}]}]}],declared:110,unitLineTotal:110,enhancements:[],detachments:[]});
const validBounds=fixturePoints(fixtureCatalog).check(boundedRoster(1),'fixture');
assert.equal(validBounds.total,110,'safe structured quantities and point values must remain valid');
assert.equal(validBounds.unresolved.length,0);
for(const quantity of ['1',0,-1,1.5,Number.NaN,Number.POSITIVE_INFINITY,Number.MAX_SAFE_INTEGER+1]){
  const rejected=fixturePoints(fixtureCatalog).check(boundedRoster(quantity),'fixture');
  assert.equal(rejected.total,0,`invalid loadout quantity ${String(quantity)} must not alter the total`);
  assert.equal(rejected.unresolved.length,1);
}
for(const value of ['100',-1,1.5,Number.NaN,Number.POSITIVE_INFINITY,Number.MAX_SAFE_INTEGER+1]){
  const invalidDefinition={...fixtureDefinition,points:[{label:'1 model',value}]};
  const rejected=fixturePoints({fixture:{units:{'bounded unit':invalidDefinition},enhancements:{},detachments:{}}}).check(boundedRoster(1),'fixture');
  assert.equal(rejected.total,0,`invalid catalog point value ${String(value)} must not be priced`);
  assert.equal(rejected.unresolved.length,1);
}
for(const maxOwners of ['3',0,1.5,Number.POSITIVE_INFINITY,Number.MAX_SAFE_INTEGER+1]){
  const enhancement={id:'enhancement-bounded',title:'Bounded Upgrade',value:10,assignment:{maxOwners,enhancementChoices:1}};
  const catalog={fixture:{units:{'bounded unit':fixtureDefinition},enhancements:{'bounded upgrade':enhancement},detachments:{}}};
  const rejected=fixturePoints(catalog).check({...boundedRoster(1),enhancements:[{name:'Bounded Upgrade'}]},'fixture');
  assert.equal(rejected.total,110,`invalid Enhancement owner bound ${String(maxOwners)} must not be priced`);
  assert.equal(rejected.unresolved.length,1);
}
const inheritedCatalog=Object.create({fixture:fixtureCatalog.fixture});
assert.equal(fixturePoints(inheritedCatalog).check(boundedRoster(1),'fixture').total,null,'inherited faction catalog must be unavailable');
const inheritedUnits=Object.create({'bounded unit':fixtureDefinition});
const inheritedUnitResult=fixturePoints({fixture:{units:inheritedUnits,enhancements:{},detachments:{}}}).check(boundedRoster(1),'fixture');
assert.equal(inheritedUnitResult.total,0,'inherited unit definition must not be priced');
assert.equal(inheritedUnitResult.unresolved.length,1);
const inheritedEnhancements=Object.create({'borrowed upgrade':{id:'enhancement-borrowed',title:'Borrowed Upgrade',value:10}});
const inheritedEnhancementResult=fixturePoints({fixture:{units:{'bounded unit':fixtureDefinition},enhancements:inheritedEnhancements,detachments:{}}}).check({...boundedRoster(1),enhancements:[{name:'Borrowed Upgrade'}]},'fixture');
assert.equal(inheritedEnhancementResult.total,110,'inherited Enhancement must not be priced');
assert.equal(inheritedEnhancementResult.unresolved.length,1);
const inheritedDetachments=Object.create({'borrowed detachment':{title:'Borrowed Detachment',detachmentPoints:1}});
const inheritedDetachmentResult=fixturePoints({fixture:{units:{'bounded unit':fixtureDefinition},enhancements:{},detachments:inheritedDetachments}}).check({...boundedRoster(1),detachments:[{name:'Borrowed Detachment'}]},'fixture');
assert.equal(inheritedDetachmentResult.detachmentPoints,0,'inherited Detachment must not be priced');
assert.equal(inheritedDetachmentResult.detachmentWarnings.length,1);
const emperorChildrenRoster=WHRosterParser.parse(`FACTION KEYWORD: Chaos - Emperor's Children
BATTLE SIZE: 3. Strike Force (2000 Point limit)
DETACHMENT: Coterie of the Conceited, Carnival of Excess
TOTAL ARMY POINTS: 330pts
1x Defiler (330 pts): Heavy reaper autocannon, Hades lascannon`);
const emperorChildrenCheck=WHRosterPoints.check(emperorChildrenRoster,'emperor s children');
assert.equal(emperorChildrenRoster.pointsLimit,2000);
assert.equal(emperorChildrenCheck.total,330,"Emperor's Children roster points must include both current Defiler options");
assert.equal(emperorChildrenCheck.unresolved.length,0);
assert.equal(emperorChildrenCheck.detachmentPoints,5);
assert.equal(emperorChildrenCheck.detachmentPointLimit,3);
assert.match(emperorChildrenCheck.detachmentWarnings[0],/5\/3 DP/,'Strike Force must reject more than 3 Detachment Points');
const legalIncursion=WHRosterParser.parse(`FACTION KEYWORD: Chaos - Emperor's Children
BATTLE SIZE: 2. Incursion (1000 Point limit)
DETACHMENT: Elegant Brutes, Frenzied Host
TOTAL ARMY POINTS: 0pts`);
const legalIncursionCheck=WHRosterPoints.check(legalIncursion,'emperor s children');
assert.equal(legalIncursionCheck.detachmentPoints,2);
assert.equal(legalIncursionCheck.detachmentPointLimit,2);
assert.deepEqual([...legalIncursionCheck.detachmentWarnings],[],'Incursion must allow up to 2 Detachment Points');
const rosterUnit=(id,name,quantity=1)=>({id,name,quantity,models:[]});
const ownedEnhancement=(name,ownerUnitId)=>({name,ownerUnitId,ownerStatus:'resolved'});
const enhancementLookupRoster=(enhancement,unit,detachment)=>({units:[unit],detachments:[{name:detachment}],enhancements:[enhancement],declared:0,unitLineTotal:0});
const assertEnhancementLookup=(label,faction,enhancement,unit,detachment,id,cost)=>{
  const result=WHRosterPoints.check(enhancementLookupRoster(enhancement,unit,detachment),faction);
  assert.equal(result.unresolved.length,0,`${label}: exact Enhancement name must resolve`);
  assert.equal(result.enhancements[0]?.id,id,`${label}: canonical Enhancement identity`);
  assert.equal(result.enhancements[0]?.currentCost,cost,`${label}: current Enhancement cost`);
  return result;
};
const surgeon=rosterUnit('surgeon','Plague Surgeon'),blightbringer=rosterUnit('blightbringer','Noxious Blightbringer');
for(const name of ['Needle of Nurgle','Needle of Nurgle - 25 pts']){
  assertEnhancementLookup(`Death Guard object ${name}`,'death guard',ownedEnhancement(name,surgeon.id),surgeon,'Champions of Contagion','enhancement-needle-of-nurgle',25);
  assertEnhancementLookup(`Death Guard string ${name}`,'death guard',name,surgeon,'Champions of Contagion','enhancement-needle-of-nurgle',25);
}
for(const name of ['Witherbone Pipes','Witherbone Pipes - 25 pts'])assertEnhancementLookup(`Death Guard object ${name}`,'death guard',ownedEnhancement(name,blightbringer.id),blightbringer,'Shamblerot Vectorium','enhancement-witherbone-pipes',25);
const deathGuardEnhancementScope={window:{WHRosterParser,WH_POINTS_CATALOG}};
vm.runInNewContext(fs.readFileSync('books/shared/roster-enhancements.js','utf8'),deathGuardEnhancementScope,{filename:'books/shared/roster-enhancements.js'});
for(const [name,id] of [['Needle of Nurgle - 25 pts','enhancement-needle-of-nurgle'],['Witherbone Pipes - 25 pts','enhancement-witherbone-pipes']])assert.equal(deathGuardEnhancementScope.window.WHRosterEnhancements.enriched({enhancements:[ownedEnhancement(name,'owner')]})[0].id,id,`${name}: shared Death Guard enrichment must preserve canonical identity`);
const eagerOwner={...rosterUnit('flawless','Flawless Blades'),models:[{quantity:3,name:'Flawless Blade',loadouts:[]}]};
assertEnhancementLookup("Emperor's Children object Eager Patrons - 20 pts",'emperor s children',ownedEnhancement('Eager Patrons - 20 pts',eagerOwner.id),eagerOwner,'Spectacle of Slaughter','enhancement-eager-patrons',20);
const unknownEnhancement=WHRosterPoints.check(enhancementLookupRoster(ownedEnhancement('Unknown Relic - 99 pts',surgeon.id),surgeon,'Champions of Contagion'),'death guard');
assert.equal(unknownEnhancement.enhancements.length,0,'unknown suffixed Enhancement must fail closed');
assert.deepEqual([...unknownEnhancement.unresolved],['Enhancement Detachment: Unknown Relic']);
const wrongNeedleDetachment=assertEnhancementLookup('Needle wrong Detachment','death guard',ownedEnhancement('Needle of Nurgle - 25 pts',surgeon.id),surgeon,'Virulent Vectorium','enhancement-needle-of-nurgle',25);
assert.equal(wrongNeedleDetachment.enhancements[0].ownerEligibility,'invalid');
assert.equal(wrongNeedleDetachment.enhancements[0].ownerMessage,'Enhancement is not available in the selected Detachment');
const deathGuardMfm=JSON.parse(fs.readFileSync('books/death-guard/sources/official-mfm-v1.3.json','utf8'));
const deathGuardRules=JSON.parse(fs.readFileSync('books/death-guard/content/death-guard-rules.en.json','utf8'));
const mortarionDetachment=deathGuardRules.sections.find(section=>section.id==='detachment-mortarions-hammer');
assert.equal(mortarionDetachment.title,'Mortarion’s Hammer','canonical source Detachment identity');
assert.ok(deathGuardRules.glossary.some(item=>item.id==='mortarions-hammer'&&item.sectionId==='mortarions-hammer-rule'),'published Mortarion’s Hammer slug must remain canonical');
const mortarionEnhancementIds=['enhancement-bilemaw-blight','enhancement-eye-of-affliction','enhancement-shriekworm-familiar','enhancement-tendrilous-emissions'],mortarionPointIdentities=deathGuardMfm.enhancements.filter(item=>mortarionEnhancementIds.includes(item.id));
assert.equal(mortarionPointIdentities.length,4,'MFM identity bridge must cover all four Mortarion’s Hammer Enhancements');
assert.ok(mortarionPointIdentities.every(item=>item.detachment==='MORTARION’S HAMMER'&&item.sourceTitle===item.title),'MFM identity bridge must retain exact source titles and Detachment');
for(const identity of mortarionPointIdentities){const published=WH_POINTS_CATALOG['death guard'].enhancements[identity.sourceTitle.toLowerCase()];assert.equal(published.id,identity.id);assert.equal(published.detachment,'MORTARION’S HAMMER');assert.equal(published.canonicalDetachmentId,'detachment-mortarions-hammer');}
const plaguecaster=rosterUnit('plaguecaster','Malignant Plaguecaster');
const bilemaw=assertEnhancementLookup('Mortarion’s Hammer Bilemaw path','death guard',ownedEnhancement('Bilemaw Blight - 10 pts',plaguecaster.id),plaguecaster,'Mortarion’s Hammer','enhancement-bilemaw-blight',10);
assert.equal(bilemaw.enhancements[0].ownerEligibility,'valid');
const wrongBilemaw=assertEnhancementLookup('Mortarion’s Hammer wrong Detachment','death guard',ownedEnhancement('Bilemaw Blight - 10 pts',plaguecaster.id),plaguecaster,'Virulent Vectorium','enhancement-bilemaw-blight',10);
assert.equal(wrongBilemaw.enhancements[0].ownerEligibility,'invalid');
assert.equal(wrongBilemaw.enhancements[0].ownerMessage,'Enhancement is not available in the selected Detachment');
const deathLordsDetachment=deathGuardRules.sections.find(section=>section.id==='detachment-death-lords-chosen');
assert.equal(deathLordsDetachment.title,'Death Lord’s Chosen','canonical Death Lord’s Chosen Detachment identity');
const deathLordsEnhancementIds=['enhancement-face-of-death','enhancement-helm-of-the-fly-king','enhancement-vile-vigour','enhancement-warprot-talisman'],deathLordsPointIdentities=deathGuardMfm.enhancements.filter(item=>deathLordsEnhancementIds.includes(item.id));
assert.equal(deathLordsPointIdentities.length,4,'MFM identity bridge must cover all four Death Lord’s Chosen Enhancements');
assert.ok(deathLordsPointIdentities.every(item=>item.detachment==='DEATH LORD’S CHOSEN'&&item.sourceTitle),'Death Lord’s Chosen bridge must retain exact canonical source titles and Detachment');
for(const identity of deathLordsPointIdentities){const published=WH_POINTS_CATALOG['death guard'].enhancements[identity.sourceTitle.toLowerCase()];assert.equal(published.id,identity.id);assert.equal(published.detachment,'DEATH LORD’S CHOSEN');assert.equal(published.canonicalDetachmentId,'detachment-death-lords-chosen');}
const warprotOwner=rosterUnit('warprot-lord','Lord of Virulence');
const warprot=assertEnhancementLookup('Death Lord’s Chosen Warprot path','death guard',ownedEnhancement('Warprot Talisman - 30 pts',warprotOwner.id),warprotOwner,'Death Lord’s Chosen','enhancement-warprot-talisman',30);
assert.equal(warprot.enhancements[0].ownerEligibility,'valid');
const wrongWarprot=assertEnhancementLookup('Death Lord’s Chosen wrong Detachment','death guard',ownedEnhancement('Warprot Talisman - 30 pts',warprotOwner.id),warprotOwner,'Virulent Vectorium','enhancement-warprot-talisman',30);
assert.equal(wrongWarprot.enhancements[0].ownerEligibility,'invalid');
assert.equal(wrongWarprot.enhancements[0].ownerMessage,'Enhancement is not available in the selected Detachment');
const upgradeRoster=count=>{
  const owners=[
    rosterUnit('drone-a','Foetid Bloat-drone'),
    rosterUnit('drone-b','Foetid Bloat-drone'),
    rosterUnit('drone-c','Foetid Bloat-drone'),
    rosterUnit('helbrute','Helbrute')
  ].slice(0,count);
  return {units:owners,detachments:[{name:'Contagion Engines'}],enhancements:owners.map(owner=>ownedEnhancement('Parasitic Woe-Reaper',owner.id)),declared:0,unitLineTotal:0};
};
const threeUpgrades=WHRosterPoints.check(upgradeRoster(3),'death guard');
assert.equal(threeUpgrades.enhancementAssignments,3,'one Upgrade can have three owners');
assert.equal(threeUpgrades.enhancementChoices,1,'three Upgrade owners consume one Enhancement choice');
assert.equal(threeUpgrades.enhancements.filter(item=>item.ownerEligibility==='valid').length,3);
assert.equal(threeUpgrades.enhancements.reduce((sum,item)=>sum+item.currentCost,0),45,'Upgrade points are paid once per owner');
const parsedTripleUpgrade=WHRosterParser.parse(`FACTION KEYWORD: Chaos - Death Guard
DETACHMENT: Contagion Engines
TOTAL ARMY POINTS: 345pts
1x Foetid Bloat-drone (100 pts)
Enhancement: Parasitic Woe-Reaper (+15 pts)
1x Foetid Bloat-drone (100 pts)
Enhancement: Parasitic Woe-Reaper (+15 pts)
1x Foetid Bloat-drone (100 pts)
Enhancement: Parasitic Woe-Reaper (+15 pts)`);
assert.equal(parsedTripleUpgrade.enhancements.length,3,'parser must preserve three legal owners of one Upgrade');
assert.equal(new Set(parsedTripleUpgrade.enhancements.map(item=>item.ownerUnitId)).size,3,'Upgrade assignments must not collapse by name');
assert.equal(WHRosterPoints.check(parsedTripleUpgrade,'death guard').enhancementChoices,1);
const fourUpgrades=WHRosterPoints.check(upgradeRoster(4),'death guard');
assert.equal(fourUpgrades.enhancementAssignments,4);
assert.equal(fourUpgrades.enhancementChoices,1);
assert.match(fourUpgrades.enhancements[3].ownerMessage,/limit exceeded/i,'the fourth Upgrade owner must be invalid');
assert.ok(fourUpgrades.enhancementWarnings.some(message=>/4\/3/.test(message)));

const epicRoster={units:[rosterUnit('mortarion','Mortarion')],detachments:[{name:'Virulent Vectorium'}],enhancements:[ownedEnhancement('Daemon Weapon of Nurgle','mortarion')],declared:0,unitLineTotal:0};
assert.match(WHRosterPoints.check(epicRoster,'death guard').enhancements[0].ownerMessage,/Epic Hero/);
const raiderUpgrade={units:[rosterUnit('raiders','Serberys Raiders',3)],detachments:[{name:'Cohort Acquisitus'}],enhancements:[ownedEnhancement('Stealth-screened Cybercanids Upgrade','raiders')],declared:0,unitLineTotal:0};
assert.equal(WHRosterPoints.check(raiderUpgrade,'adeptus mechanicus').enhancements[0].ownerEligibility,'valid');
const rangersInvalid={units:[rosterUnit('rangers','Skitarii Rangers',10)],detachments:[{name:'Rad-zone Corps'}],enhancements:[ownedEnhancement('Malphonic Susurrus','rangers')],declared:0,unitLineTotal:0};
assert.match(WHRosterPoints.check(rangersInvalid,'adeptus mechanicus').enhancements[0].ownerMessage,/Invalid Enhancement owner/);
const tauUpgrade={units:[rosterUnit('ghostkeel','Ghostkeel Battlesuit')],detachments:[{name:'Advanced Acquisition Cadre'}],enhancements:[ownedEnhancement('Unmasking Suite Upgrade','ghostkeel')],declared:0,unitLineTotal:0};
assert.equal(WHRosterPoints.check(tauUpgrade,'t au empire').enhancements[0].ownerEligibility,'valid');
const tauStandard={units:[rosterUnit('ghostkeel','Ghostkeel Battlesuit')],detachments:[{name:'Experimental Prototype Cadre'}],enhancements:[ownedEnhancement('Thermoneutronic Projector','ghostkeel')],declared:0,unitLineTotal:0};
assert.match(WHRosterPoints.check(tauStandard,'t au empire').enhancements[0].ownerMessage,/Invalid Enhancement owner/);
const fourChoices={units:[rosterUnit('lord','Death Guard Chaos Lord')],detachments:[{name:'Virulent Vectorium'}],enhancements:['Daemon Weapon of Nurgle','Furnace of Plagues','Arch Contaminator','Revolting Regeneration'].map(name=>ownedEnhancement(name,'lord')),declared:0,unitLineTotal:0};
assert.match(WHRosterPoints.check(fourChoices,'death guard').enhancementWarnings.at(-1),/choice limit exceeded/i);

const mechanicusRoster=WHRosterParser.parse(`FACTION KEYWORD: Imperium - Adeptus Mechanicus
DETACHMENT: Haloscreed Battle Clade
TOTAL ARMY POINTS: 840pts
ENHANCEMENT: Sanctified Ordnance (on Char1: Tech-Priest Manipulus)
NUMBER OF UNITS: 4
Char1: 1x Tech-Priest Manipulus (70 pts): Magnarail lance
Enhancement: Sanctified Ordnance (+10 pts)
4x Kastelan Robots (320 pts): Incendine combustor, Kastelan fist
6x Kataphron Breachers (310 pts): Heavy arc rifle, Hydraulic claw
2x Ironstrider Ballistarii (140 pts): Twin cognis lascannon`);
assert.equal(mechanicusRoster.faction,'Imperium - Adeptus Mechanicus');
assert.equal(mechanicusRoster.enhancements[0].ownerStatus,'resolved');
const mechanicusCheck=WHRosterPoints.check(mechanicusRoster,'adeptus mechanicus');
assert.equal(mechanicusCheck.total,860,'current total includes the current unit-size tier, Enhancement and paid lascannons');
assert.equal(mechanicusCheck.difference,20);
assert.equal(mechanicusCheck.enhancements[0].effect,'ranged-range-6');

const unresolved=WHRosterParser.parse(`+ FACTION KEYWORD: Chaos — Death Guard\n+ TOTAL ARMY POINTS: 120pts\n+ ENHANCEMENT: Furnace of Plagues (on Char9: Missing Owner)\n1x Lord of Contagion (120 pts): Manreaper`);
assert.equal(unresolved.enhancements[0].ownerStatus,'unresolved');
assert.match(unresolved.warnings[0],/owner could not be resolved/);

const duplicateOwners=WHRosterParser.parse(`FACTION KEYWORD: Chaos - Death Guard
TOTAL ARMY POINTS: 280pts
ENHANCEMENT: Furnace of Plagues (on Char1: Lord of Contagion), Furnace of Plagues (on Char2: Lord of Virulence)
Char1: 1x Lord of Contagion (145 pts): Manreaper
Enhancement: Furnace of Plagues (+25 pts)
Char2: 1x Lord of Virulence (135 pts): Heavy plague fist
Enhancement: Furnace of Plagues (+25 pts)`);
assert.equal(duplicateOwners.faction,'Chaos - Death Guard','metadata must work without a leading plus');
assert.equal(duplicateOwners.declared,280);
assert.equal(duplicateOwners.enhancements.length,2);
assert.ok(duplicateOwners.enhancements.every(item=>item.ownerStatus==='resolved'),'same Enhancement name on distinct resolved owners is not ambiguous');

const conflictingOwner=WHRosterParser.parse(`FACTION KEYWORD: Chaos - Death Guard
TOTAL ARMY POINTS: 280pts
ENHANCEMENT: Furnace of Plagues (on Char1: Lord of Contagion)
Char1: 1x Lord of Contagion (120 pts): Manreaper
Char2: 1x Lord of Virulence (160 pts): Heavy plague fist
Enhancement: Furnace of Plagues (+25 pts)`);
assert.equal(conflictingOwner.enhancements.length,1,'conflicting header and inline copies remain one priced Enhancement');
assert.equal(conflictingOwner.enhancements[0].ownerStatus,'ambiguous');
assert.deepEqual([...conflictingOwner.enhancements[0].ownerCandidates],['Lord of Contagion','Lord of Virulence']);
assert.match(conflictingOwner.warnings[0],/conflicts between header and inline metadata/);

const csmCatalog=WH_POINTS_CATALOG['chaos space marines'];
assert.equal(Object.keys(csmCatalog.units).length,54,'CSM points catalog must expose current Datasheets only');
for(const title of ['khorne berzerkers','noise marines','plague marines','rubric marines'])assert.equal(csmCatalog.units[title],undefined,`${title} must not enter the CSM points catalog`);
const duplicateWarp=csmCatalog.enhancements['warp fuelled thrusters'];
assert.ok(Array.isArray(duplicateWarp)&&duplicateWarp.length===2,'duplicate Enhancement titles must retain detachment-qualified identities');
assert.equal(new Set(duplicateWarp.map(item=>item.id)).size,2);
const csmOwner=rosterUnit('jump-lord','Chaos Lord with Jump Pack');
const csmRoster=detachment=>({units:[csmOwner],detachments:[{name:detachment}],enhancements:[ownedEnhancement('Warp-Fuelled Thrusters',csmOwner.id)],declared:0,unitLineTotal:0});
const nightmareWarp=WHRosterPoints.check(csmRoster('Nightmare Hunt'),'chaos space marines');
assert.equal(nightmareWarp.enhancements[0].id,'enhancement-nightmare-hunt-warp-fuelled-thrusters');
assert.equal(nightmareWarp.enhancements[0].ownerEligibility,'valid');
const dreadWarp=WHRosterPoints.check(csmRoster('Dread Talons'),'chaos space marines');
assert.equal(dreadWarp.enhancements[0].id,'enhancement-dread-talons-warp-fuelled-thrusters');
assert.equal(dreadWarp.enhancements[0].ownerEligibility,'valid');
await import('./points-consumer-convergence-qa.mjs');
await import('./point-tier-contract-qa.mjs');
console.log('Roster parser and points QA passed.');
