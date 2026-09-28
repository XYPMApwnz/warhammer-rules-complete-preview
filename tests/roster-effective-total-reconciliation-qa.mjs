import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {createEffectiveMfmArmyProjection} from '../books/shared/tools/effective-mfm-army-projection.mjs';

const scope={window:{}};vm.createContext(scope);
for(const file of ['books/shared/rule-facts.js','roster-guides/points-data.js','roster-guides/points-validator.js'])vm.runInContext(fs.readFileSync(file,'utf8'),scope,{filename:file});
const {WH_POINTS_CATALOG,WHRosterPoints}=scope.window,faction='tyranids',catalog=WH_POINTS_CATALOG[faction],effective=createEffectiveMfmArmyProjection(faction).pointsForArmyBook(faction);
const sha=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
assert.equal(sha(effective),'0b1739aba15d104d4cb394daf1416b14dd0c4892fd0df062c4900ee40b6739c8','central Tyranids MFM facts changed');
assert.equal(effective.enhancements.length,34,'current Tyranids MFM Enhancement denominator');
const enhancements=new Map(Object.values(catalog.enhancements).map(item=>[item.id,item]));
assert.equal(enhancements.size,34,'points consumer must expose 34 canonical Enhancements');
const units=[...new Map(Object.values(catalog.units).map(item=>[item.unitId,item])).values()];
const rosterUnit=(definition,id='owner')=>({id,canonicalUnitId:definition.unitId,name:definition.title,quantity:definition.points[0].minModels||1,models:[],wargear:''});
const assignment=(enhancement,ownerId='owner')=>({id:enhancement.id,name:enhancement.title,ownerUnitId:ownerId,ownerStatus:'resolved',exportedCost:enhancement.value+99});
const detachment=enhancement=>({id:enhancement.detachmentId,name:enhancement.detachment});
const ownerFor=enhancement=>units.find(unit=>{const roster={units:[rosterUnit(unit)],detachments:[detachment(enhancement)],enhancements:[assignment(enhancement)]},direct=WHRosterPoints.assessEnhancements(roster,faction).assignments[0]?.assessment?.ownerEligibility;if(direct==='valid')return true;return WHRosterPoints.assessEnhancements(roster,faction,undefined,{keywordOverrides:{owner:['CHARACTER']}}).assignments[0]?.assessment?.ownerEligibility==='valid';});
const pointValue=unit=>unit.points[0].value;
const checked=({rosterUnits,enhancement=null,declared,unitLineTotal})=>WHRosterPoints.check({units:rosterUnits,detachments:enhancement?[detachment(enhancement)]:[],enhancements:enhancement?[assignment(enhancement,rosterUnits[0].id)]:[],declared,unitLineTotal},faction);

const noEnhancementUnit=units.find(unit=>unit.unitId==='unit-hive-tyrant'),noEnhancementPoints=pointValue(noEnhancementUnit),noEnhancement=checked({rosterUnits:[rosterUnit(noEnhancementUnit)],declared:noEnhancementPoints,unitLineTotal:noEnhancementPoints});
assert.equal(noEnhancement.total,noEnhancementPoints);assert.equal(noEnhancement.exportMatches,true);

let passed=0;const costValues=new Set();
for(const source of effective.enhancements){
  const enhancement=enhancements.get(source.id);assert.ok(enhancement,`missing consumer Enhancement ${source.id}`);assert.equal(enhancement.value,source.value,`${source.id}: exact MFM cost`);assert.equal(enhancement.detachmentId,source.detachmentId,`${source.id}: exact Detachment identity`);
  const owner=ownerFor(enhancement);assert.ok(owner,`${source.id}: no canonical eligible owner fixture`);const base=pointValue(owner),roster=checked({rosterUnits:[rosterUnit(owner)],enhancement,declared:base+source.value,unitLineTotal:base});
  assert.equal(roster.total,base+source.value,`${source.id}: authoritative total`);assert.equal(roster.difference,0,`${source.id}: declared difference`);assert.equal(roster.exportMatches,true,`${source.id}: complete total reconciles`);assert.equal(roster.enhancements.length,1,`${source.id}: one assignment`);costValues.add(source.value);passed++;
}
assert.equal(passed,34);assert.deepEqual([...costValues].sort((a,b)=>a-b),[10,15,20,25,30]);

const controlEnhancement=enhancements.get(effective.enhancements.find(item=>item.id==='adaptive-biology')?.id)||enhancements.values().next().value,controlOwner=ownerFor(controlEnhancement),controlBase=pointValue(controlOwner);
const secondDefinition=units.find(unit=>unit.unitId!==controlOwner.unitId),secondBase=pointValue(secondDefinition),multiUnits=[rosterUnit(controlOwner,'owner'),rosterUnit(secondDefinition,'peer')];
const multi=checked({rosterUnits:multiUnits,enhancement:controlEnhancement,declared:controlBase+secondBase+controlEnhancement.value,unitLineTotal:controlBase+secondBase});assert.equal(multi.total,controlBase+secondBase+controlEnhancement.value);assert.equal(multi.exportMatches,true);
const wrong=checked({rosterUnits:[rosterUnit(controlOwner)],enhancement:controlEnhancement,declared:controlBase+controlEnhancement.value+1,unitLineTotal:controlBase});assert.equal(wrong.exportMatches,false);assert.equal(wrong.difference,-1);
const removed=checked({rosterUnits:[rosterUnit(controlOwner)],declared:controlBase,unitLineTotal:controlBase});assert.equal(removed.total,controlBase);assert.equal(removed.exportMatches,true);
const duplicate=[rosterUnit(controlOwner,'copy-a'),rosterUnit(controlOwner,'copy-b')],duplicateCheck=WHRosterPoints.check({units:duplicate,detachments:[detachment(controlEnhancement)],enhancements:[assignment(controlEnhancement,'copy-a')],declared:2*controlBase+controlEnhancement.value,unitLineTotal:2*controlBase},faction);assert.equal(duplicateCheck.total,2*controlBase+controlEnhancement.value);assert.equal(duplicateCheck.enhancements.length,1);assert.equal(duplicateCheck.exportMatches,true);

const tyrannofex=units.find(unit=>unit.unitId==='unit-tyrannofex'),paidOwner=ownerFor(controlEnhancement),paidRoster=[{...rosterUnit(paidOwner,'owner')},{...rosterUnit(tyrannofex,'tfex'),wargear:'Rupture cannon'}],paidExpected=pointValue(paidOwner)+170+20+controlEnhancement.value,paid=WHRosterPoints.check({units:paidRoster,detachments:[detachment(controlEnhancement)],enhancements:[assignment(controlEnhancement,'owner')],declared:paidExpected,unitLineTotal:pointValue(paidOwner)+170},faction);assert.equal(paid.total,paidExpected);assert.equal(paid.exportMatches,true,'other supported MFM costs remain in complete reconciliation');

const mutations=[
  ['unit-line-only declared',checked({rosterUnits:[rosterUnit(controlOwner)],enhancement:controlEnhancement,declared:controlBase,unitLineTotal:controlBase}).exportMatches],
  ['wrong declared accepted',wrong.exportMatches],
  ['removed Enhancement kept stale',removed.total!==controlBase],
  ['duplicate physical cost multiplication',duplicateCheck.total!==2*controlBase+controlEnhancement.value],
  ['raw exported cost substituted',multi.total===controlBase+secondBase+(controlEnhancement.value+99)],
  ['paid MFM option omitted',paid.total!==paidExpected]
];
for(const [name,survived] of mutations)assert.equal(survived,false,`${name} mutation survived`);
console.log('Roster effective-total reconciliation QA: Tyranids Enhancements 34/34; no/one/multi/remove/physical/paid-option controls PASS; mutations 6/6 KILLED.');
