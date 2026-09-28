import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createCanonicalBuildContext} from '../../shared/tools/canonical-build-contract.mjs';
import {buildCanonicalBook} from '../../shared/tools/build-army-book.mjs';
import {canonicalRosterModelsFor} from '../../shared/tools/build-roster-catalog.mjs';
import {canonicalStatProfilesForUnit} from '../../shared/tools/canonical-unit-stats.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const clone=value=>structuredClone(value);
const plain=value=>JSON.parse(JSON.stringify(value));
const config=JSON.parse(read('books/tau-empire/book.config.json'));
const context=createCanonicalBuildContext({repoRoot:root,configPath:path.join(root,'books/tau-empire/book.config.json'),config});
const {effectiveBookModel:model}=await buildCanonicalBook(context,{projectionOnly:true});
const scope={window:{},URL,URLSearchParams};
vm.runInNewContext(read('books/tau-empire/scripts/roster-data.js'),scope);
vm.runInNewContext(read('books/shared/roster-context.js'),scope);
const catalog=scope.window.WH_BOOK_ROSTER_CATALOG,api=scope.window.WHArmyRosterContext;

const multipartIds=[
  'unit-breacher-team','unit-strike-team','unit-the-twin-lance','unit-kroot-carnivores',
  'unit-kroot-farstalkers','unit-pathfinder-team','unit-stealth-battlesuits','unit-vespid-stingwings',
  'unit-broadside-battlesuits','unit-crisis-fireknife-battlesuits',
  'unit-crisis-starscythe-battlesuits','unit-crisis-sunforge-battlesuits'
];
const sourceById=new Map(model.units.map(unit=>[unit.id,unit]));
const catalogById=new Map(catalog.units.map(unit=>[unit.id,unit]));
assert.equal(catalog.compositionConstraints,true,'T’au composition constraints enabled');
assert.equal(catalog.statProfiles,true,'T’au stat-profile projection enabled');
assert.equal(catalog.preserveMultipartStatProfiles,true,'T’au multipart source-profile identities preserved');
assert.deepEqual(plain(model.units.filter(unit=>unit.composition?.length>1).map(unit=>unit.id)),multipartIds,'exact multipart composition class');

const expectedModels=unitId=>canonicalRosterModelsFor(sourceById.get(unitId),{enforceCompositionConstraints:true});
const expectedProfiles=unitId=>canonicalStatProfilesForUnit(sourceById.get(unitId),{preserveMultipartProfiles:true});
const certifyCatalog=value=>{
  const byId=new Map(value.units.map(unit=>[unit.id,unit]));
  for(const unitId of multipartIds){
    const current=byId.get(unitId);
    assert.ok(current,`${unitId}: roster unit exists`);
    assert.deepEqual(plain(current.gameSelections.models),plain(expectedModels(unitId)),`${unitId}: source-backed canonical composition`);
    assert.deepEqual(plain(current.gameSelections.statProfiles),plain(expectedProfiles(unitId)),`${unitId}: source-backed profile identities and characteristics`);
  }
};
certifyCatalog(catalog);
assert.equal(multipartIds.flatMap(expectedProfiles).length,20,'20 multipart source profiles');
assert.equal(multipartIds.flatMap(expectedProfiles).reduce((sum,profile)=>sum+['M','T','Sv','W','Ld','OC'].filter(key=>profile.stats[key]!==undefined).length,0),120,'120 source profile characteristics');

const rawUnit=(unit,models,instanceId='parsed-unit-1')=>({
  id:instanceId,canonicalUnitId:unit.id,name:unit.title,quantity:models.reduce((sum,item)=>sum+item.quantity,0),points:0,wargear:'',models:models.map(item=>({quantity:item.quantity,name:item.name,wargear:'',loadouts:[]})),warlord:null
});
const rosterFor=units=>({faction:"T'au Empire",declared:0,calculated:0,unitLineTotal:0,detachments:[],enhancements:[],warnings:[],units});
const project=(units,sourceCatalog=catalog)=>api.project({catalog:sourceCatalog,roster:rosterFor(units),record:{id:'tau-roster-composition-profile-qa',attachments:{}},provider:{gameEffects:()=>[]}}).game;
const modelRows=(unitId,key)=>catalogById.get(unitId).gameSelections.models.map(item=>({name:item.aliases[0]||item.title,quantity:Number(item[key])}));
const assertAccepted=(unitId,models,label)=>{
  const game=project([rawUnit(catalogById.get(unitId),models)]),composition=game.units[0].selection.composition;
  assert.equal(game.status,'ready',`${unitId}: ${label} game status`);
  assert.equal(composition.state,'resolved',`${unitId}: ${label} composition state`);
  assert.ok(composition.models.every(item=>item.canonicalModelId),`${unitId}: ${label} canonical model identities`);
  return game;
};
const assertRejected=(unitId,models,label)=>{
  const game=project([rawUnit(catalogById.get(unitId),models)]),composition=game.units[0].selection.composition;
  assert.equal(game.status,'invalid',`${unitId}: ${label} game status`);
  assert.equal(composition.state,'invalid',`${unitId}: ${label} composition state`);
  assert.ok(composition.unresolved.length,`${unitId}: ${label} rejection reason`);
};

let positive=0,negative=0;
for(const unitId of multipartIds){
  const minimum=modelRows(unitId,'min'),maximum=modelRows(unitId,'max');
  assertAccepted(unitId,minimum,'minimum legal composition');positive++;
  assertAccepted(unitId,maximum,'maximum legal composition');positive++;
  const required=minimum.findIndex(item=>item.quantity>0),other=(required+1)%minimum.length;
  const below=clone(minimum);below[required].quantity--;assertRejected(unitId,below,'below minimum');negative++;
  const above=clone(maximum);above[0].quantity++;assertRejected(unitId,above,'above maximum');negative++;
  const wrong=clone(minimum);wrong[required].quantity--;wrong[other].quantity++;assertRejected(unitId,wrong,'invalid model mixture');negative++;
}

const farstalkers=catalogById.get('unit-kroot-farstalkers'),farstalkerModels=modelRows(farstalkers.id,'min');
const first=assertAccepted(farstalkers.id,farstalkerModels,'profile fixture');
const effectiveProfiles=first.units[0].effective.statProfiles;
assert.equal(effectiveProfiles.length,2,'Farstalkers retain two physical profile identities');
const hounds=effectiveProfiles.find(profile=>profile.title==='Kroot Hounds'),others=effectiveProfiles.find(profile=>profile.title==='Farstalkers & Kill-broker');
assert.ok(hounds&&others,'Farstalker source profiles remain exact');
assert.equal(hounds.stats.M,'12"','Hound Movement remains profile-scoped');
assert.equal(others.stats.M,'7"','Farstalker Movement remains profile-scoped');
assert.equal(hounds.stats.OC,'0','Hound OC remains profile-scoped');
assert.equal(others.stats.OC,'1','Farstalker OC remains profile-scoped');

const duplicates=project([
  rawUnit(farstalkers,farstalkerModels,'parsed-unit-1'),
  rawUnit(farstalkers,farstalkerModels,'parsed-unit-2')
]);
assert.equal(duplicates.status,'ready','duplicate physical units remain legal');
assert.notEqual(duplicates.units[0].selection.composition,duplicates.units[1].selection.composition,'composition instances are isolated');
assert.notEqual(duplicates.units[0].effective.statProfiles,duplicates.units[1].effective.statProfiles,'profile instances are isolated');
assert.deepEqual(plain(duplicates.units[0].effective.statProfiles),plain(duplicates.units[1].effective.statProfiles),'duplicate profile facts remain equal');
assert.equal(Object.isFrozen(duplicates.units[0].effective.statProfiles),true,'effective profile collection is immutable');

let mutations=0;
const killed=(label,mutate)=>{const poisoned=clone(catalog);mutate(poisoned);assert.throws(()=>certifyCatalog(poisoned),undefined,`${label} mutation survived`);mutations++;};
killed('MISSING_MODEL_IDENTITY',value=>{value.units.find(unit=>unit.id==='unit-breacher-team').gameSelections.models.pop();});
killed('WRONG_QUANTITY_BOUND',value=>{value.units.find(unit=>unit.id==='unit-kroot-carnivores').gameSelections.models[0].max++;});
killed('WRONG_MIXTURE',value=>{value.units.find(unit=>unit.id==='unit-kroot-farstalkers').gameSelections.models[1].min--;});
killed('MISSING_PROFILE_CHARACTERISTIC',value=>{delete value.units.find(unit=>unit.id==='unit-kroot-farstalkers').gameSelections.statProfiles[0].stats.M;});
killed('CHARACTERISTIC_ON_WRONG_PROFILE',value=>{const profiles=value.units.find(unit=>unit.id==='unit-kroot-farstalkers').gameSelections.statProfiles;[profiles[0].stats.OC,profiles[1].stats.OC]=[profiles[1].stats.OC,profiles[0].stats.OC];});

assert.equal(positive,24,'positive composition controls');
assert.equal(negative,36,'negative composition controls');
assert.equal(mutations,5,'source-backed mutation controls');
console.log("T'au roster composition/profile QA: composition 12/12; profile characteristics 120/120; positive 24/24; negative 36/36; physical-instance 4/4; mutations 5/5 KILLED; PASS");
