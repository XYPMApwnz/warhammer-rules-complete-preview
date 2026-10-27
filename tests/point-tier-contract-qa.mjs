import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {pointTierContract as tiers} from '../books/shared/tools/point-tier-contract.mjs';
import {catalog,rawCatalog} from '../books/shared/points/build.mjs';
import {createRosterFixture} from './helpers/roster-fixtures.mjs';

const plain=value=>JSON.parse(JSON.stringify(value));
const multiUnits=[];
let tierCount=0,structuredBefore=0;
const normalizedByBook=new Map();

for(const [book,records] of Object.entries(rawCatalog))for(const [key,unit] of Object.entries(records.units))if(unit.points?.length>1){
  const published=catalog[book].units[key];
  multiUnits.push({book,key,raw:unit,published});
  tierCount+=unit.points.length;
  if(unit.points.every(tiers.structuredTier))structuredBefore++;
  else{
    const current=normalizedByBook.get(book)||{units:0,tiers:0};
    current.units++;current.tiers+=unit.points.length;normalizedByBook.set(book,current);
  }
  assert.deepEqual(published.points.map(row=>[row.label,row.value]),unit.points.map(row=>[row.label,row.value]),`${book} ${unit.id}: point labels/values changed during normalization`);
  tiers.validateStructuredTiers(published.points);
  const modelLimit=Math.max(...published.points.map(row=>row.maxModels))+1;
  const copyLimit=Math.max(4,...published.points.flatMap(row=>[row.minCopies||1,row.maxCopies||0]).map(value=>value+1));
  const reached=new Set();
  for(let quantity=1;quantity<=modelLimit;quantity++)for(let copy=1;copy<=copyLimit;copy++){
    const oldMatches=unit.points.map((row,index)=>tiers.labelTierMatches(row,quantity,copy)?index:-1).filter(index=>index>=0);
    const newMatches=published.points.map((row,index)=>tiers.structuredTierMatches(row,quantity,copy)?index:-1).filter(index=>index>=0);
    assert.deepEqual(newMatches,oldMatches,`${book} ${unit.id}: label/structure mismatch for quantity ${quantity}, copy ${copy}`);
    assert.ok(newMatches.length<=1,`${book} ${unit.id}: overlapping structured tiers for quantity ${quantity}, copy ${copy}`);
    newMatches.forEach(index=>reached.add(index));
  }
  assert.equal(reached.size,published.points.length,`${book} ${unit.id}: not every authored tier is reachable`);
  assert.equal(published.points.filter(row=>tiers.structuredTierMatches(row,modelLimit,1)).length,0,`${book} ${unit.id}: impossible model quantity must resolve zero tiers`);
}

assert.equal(multiUnits.length,288,'multi-tier unit inventory');
assert.equal(tierCount,697,'multi-tier row inventory');
assert.equal(structuredBefore,271,'pre-normalization structured unit inventory');
assert.deepEqual(plain(Object.fromEntries(normalizedByBook)),{
  'death guard':{units:17,tiers:38},
},'only the Death Guard compatibility inventory requires normalization');

assert.throws(()=>tiers.normalizeTiers([
  {label:'1-2 models',value:10},
  {label:'2-3 models',value:20},
]),/overlap/,'overlapping point tiers must fail validation');
const pox=plain(catalog['death guard'].units.poxwalkers.points);
delete pox[0].maxModels;
assert.throws(()=>tiers.validateStructuredTiers(pox),/missing structured bounds/,'removing a required structured bound must fail validation');
const wrongModel=plain(catalog['death guard'].units.poxwalkers.points);
wrongModel[0].minModels++;
assert.throws(()=>tiers.validateStructuredTiers(wrongModel),/(missing structured bounds|disagrees with its label)/,'wrong model bound must fail validation');
const wrongCopy=plain(catalog['death guard'].units['deathshroud terminators'].points);
wrongCopy[0].minCopies++;
assert.throws(()=>tiers.validateStructuredTiers(wrongCopy),/disagrees with its label/,'wrong copy bound must fail validation');
const labelDisagreement=plain(catalog['death guard'].units.poxwalkers.points);
labelDisagreement[0].label='11 models';
assert.throws(()=>tiers.validateStructuredTiers(labelDisagreement),/disagrees with its label/,'label and structured bounds disagreement must fail validation');

const resolve=(book,key,quantity,copy=1)=>{
  const matches=catalog[book].units[key].points.filter(row=>tiers.structuredTierMatches(row,quantity,copy));
  assert.equal(matches.length,1,`${book} ${key}: ${quantity} models, copy ${copy}`);
  return matches[0].value;
};
assert.deepEqual([10,20].map(quantity=>resolve('death guard','poxwalkers',quantity)),[65,130]);
assert.deepEqual([5,7,10].map(quantity=>resolve('death guard','plague marines',quantity)),[90,125,180]);
assert.deepEqual([3,5,10].map(quantity=>resolve('death guard','blightlord terminators',quantity)),[115,180,360]);
assert.deepEqual([[3,1],[6,1],[3,3],[6,3]].map(([quantity,copy])=>resolve('death guard','deathshroud terminators',quantity,copy)),[160,305,170,315]);
assert.deepEqual([1,2,3].map(copy=>resolve('death guard','chaos land raider',1,copy)),[220,220,240]);
assert.deepEqual([3,6].map(quantity=>resolve('adeptus mechanicus','kataphron breachers',quantity)),[150,310]);
assert.deepEqual([[1,1],[2,1],[3,1],[1,3],[2,3],[3,3]].map(([quantity,copy])=>resolve('adeptus mechanicus','ironstrider ballistarii',quantity,copy)),[80,160,250,95,175,265]);
assert.deepEqual([[2,1],[4,1],[2,2],[4,2]].map(([quantity,copy])=>resolve('adeptus mechanicus','kastelan robots',quantity,copy)),[150,300,180,330]);
assert.deepEqual([1,2,3,4].map(copy=>resolve('adeptus mechanicus','skorpius dunerider',1,copy)),[75,75,75,85]);
assert.equal(resolve('chaos space marines','chosen',5),135,'CSM structured control');
assert.equal(resolve('t au empire','kroot carnivores',10),65,"T'au structured control");
assert.equal(resolve('tyranids','hormagaunts',10),70,'Tyranids structured control');

const load=(file,key)=>{const scope={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),scope,{filename:file});return scope.window[key];};
const publishedPoints=load('books/shared/points/points-data.js','WH_POINTS_CATALOG');
const fixture=(book,catalogKey,units)=>createRosterFixture({catalog:load(`books/${book}/scripts/roster-data.js`,'WH_BOOK_ROSTER_CATALOG'),pointsCatalog:publishedPoints[catalogKey],id:'point-tier-probe',units});
const specs=(id,quantities)=>quantities.map((quantity,index)=>({instanceId:`parsed-unit-${index+1}`,datasheetId:id,quantity}));
assert.deepEqual(fixture('death-guard','death guard',specs('unit-poxwalkers',[10,20])).units.map(unit=>unit.points),[65,130]);
assert.deepEqual(fixture('death-guard','death guard',specs('unit-plague-marines',[5,7,10])).units.map(unit=>unit.points),[90,125,180]);
assert.deepEqual(fixture('death-guard','death guard',specs('unit-blightlord-terminators',[3,5,10])).units.map(unit=>unit.points),[115,180,360]);
assert.deepEqual(fixture('death-guard','death guard',specs('unit-deathshroud-terminators',[3,3,3])).units.map(unit=>unit.points),[160,160,170]);
assert.deepEqual(fixture('adeptus-mechanicus','adeptus mechanicus',specs('unit-kataphron-breachers',[3,6])).units.map(unit=>unit.points),[150,310]);
assert.deepEqual(fixture('adeptus-mechanicus','adeptus mechanicus',specs('unit-skorpius-dunerider',[1,1,1,1])).units.map(unit=>unit.points),[75,75,75,85]);

console.log('OVERLAPPING_TIER_MUTATION: KILLED');
console.log('MISSING_STRUCTURED_BOUND_MUTATION: KILLED');
console.log('WRONG_MODEL_BOUND_MUTATION: KILLED');
console.log('WRONG_COPY_BOUND_MUTATION: KILLED');
console.log('LABEL_STRUCTURED_DISAGREEMENT_MUTATION: KILLED');
console.log('Point-tier contract QA: 288/288 units, 697/697 tiers PASS; 271 -> 288 structured units; DG 17/38 normalized.');
