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
const config=JSON.parse(read('books/emperors-children/book.config.json'));
const context=createCanonicalBuildContext({repoRoot:root,configPath:path.join(root,'books/emperors-children/book.config.json'),config});
const {effectiveBookModel:model}=await buildCanonicalBook(context,{projectionOnly:true});
const scope={window:{},URL,URLSearchParams};
vm.runInNewContext(read('books/emperors-children/scripts/roster-data.js'),scope);
vm.runInNewContext(read('books/shared/roster-context.js'),scope);
const catalog=scope.window.WH_BOOK_ROSTER_CATALOG,api=scope.window.WHArmyRosterContext;

const sourceById=new Map(model.units.map(unit=>[unit.id,unit]));
const catalogById=new Map(catalog.units.map(unit=>[unit.id,unit]));
assert.equal(sourceById.size,23,'certified Emperor\'s Children composition denominator');
assert.equal(catalog.compositionConstraints,true,'composition constraints enabled');
assert.equal(catalog.statProfiles,true,'stat-profile projection enabled');
assert.equal(catalog.preserveMultipartStatProfiles,true,'multipart source-profile identities preserved');

const expectedModels=unitId=>canonicalRosterModelsFor(sourceById.get(unitId),{enforceCompositionConstraints:true});
const expectedProfiles=unitId=>canonicalStatProfilesForUnit(sourceById.get(unitId),{preserveMultipartProfiles:true});
const profileUnitIds=['unit-noise-marines','unit-seekers'];
const certifyCatalog=value=>{
  const byId=new Map(value.units.map(unit=>[unit.id,unit]));
  assert.equal(byId.size,23,'Roster catalog unit denominator');
  for(const unitId of sourceById.keys()){
    const current=byId.get(unitId);
    assert.ok(current,`${unitId}: roster unit exists`);
    assert.deepEqual(plain(current.gameSelections.models),plain(expectedModels(unitId)),`${unitId}: source-backed canonical composition`);
  }
  for(const unitId of profileUnitIds)assert.deepEqual(
    plain(byId.get(unitId).gameSelections.statProfiles),plain(expectedProfiles(unitId)),`${unitId}: source-backed profile identities and characteristics`
  );
};
certifyCatalog(catalog);
assert.equal(profileUnitIds.flatMap(expectedProfiles).length,4,'four multipart physical profiles');
assert.equal(profileUnitIds.flatMap(unitId=>expectedProfiles(unitId).slice(1)).reduce((sum,profile)=>sum+['M','T','Sv','W','Ld','OC'].filter(key=>profile.stats[key]!==undefined).length,0),12,'12 previously absent certified profile characteristic bindings');

const rawUnit=(unit,models,instanceId='parsed-unit-1')=>({
  id:instanceId,canonicalUnitId:unit.id,name:unit.title,quantity:models.reduce((sum,item)=>sum+item.quantity,0),points:0,wargear:'',
  models:models.map(item=>({quantity:item.quantity,name:item.name,wargear:'',loadouts:[]})),warlord:null
});
const rosterFor=units=>({faction:"Emperor's Children",declared:0,calculated:0,unitLineTotal:0,detachments:[],enhancements:[],warnings:[],units});
const project=units=>api.project({catalog,roster:rosterFor(units),record:{id:'ec-roster-composition-profile-qa',attachments:{}},provider:{gameEffects:()=>[]}}).game;
const boundary=(unitId,key)=>catalogById.get(unitId).gameSelections.models.map(item=>({name:item.aliases[0]||item.title,quantity:Number(item[key])}));
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
for(const unitId of sourceById.keys()){
  const minimum=boundary(unitId,'min'),maximum=boundary(unitId,'max');
  assertAccepted(unitId,minimum,'minimum legal composition');positive++;
  assertAccepted(unitId,maximum,'maximum legal composition');positive++;
  const below=clone(minimum);below[0].quantity--;assertRejected(unitId,below,'below minimum');negative++;
  const above=clone(maximum);above[0].quantity++;assertRejected(unitId,above,'above maximum');negative++;
}
const multipartIds=[...sourceById.keys()].filter(unitId=>expectedModels(unitId).length>1);
assert.equal(multipartIds.length,7,'seven multipart composition records');
for(const unitId of multipartIds){
  const invalid=boundary(unitId,'min'),fixedIndex=expectedModels(unitId).findIndex(item=>item.min===1&&item.max===1),otherIndex=fixedIndex===0?1:0;
  invalid[fixedIndex].quantity--;invalid[otherIndex].quantity++;
  assertRejected(unitId,invalid,'invalid model mixture');negative++;
}

for(const unitId of profileUnitIds){
  const game=assertAccepted(unitId,boundary(unitId,'min'),'profile fixture');positive++;
  const actual=game.units[0].effective.statProfiles,expected=expectedProfiles(unitId);
  assert.deepEqual(plain(actual),plain(expected.map(({id,title,stats})=>({id,title,stats}))),`${unitId}: exact physical profile stat bindings`);
  assert.equal(Object.isFrozen(actual),true,`${unitId}: effective profile collection immutable`);
  assert.equal(new Set(actual.map(profile=>profile.id)).size,2,`${unitId}: physical profile identities remain distinct`);
}
const noiseProfiles=project([rawUnit(catalogById.get('unit-noise-marines'),boundary('unit-noise-marines','min'))]).units[0].effective.statProfiles;
assert.deepEqual(plain(noiseProfiles.find(profile=>profile.title==='Disharmonist').stats),plain(noiseProfiles.find(profile=>profile.title==='Noise Marines').stats),'Noise Marine source-equivalent profiles stay separately bound');
const seekerProfiles=project([rawUnit(catalogById.get('unit-seekers'),boundary('unit-seekers','min'))]).units[0].effective.statProfiles;
assert.deepEqual(plain(seekerProfiles.find(profile=>profile.title==='Seeker').stats),plain(seekerProfiles.find(profile=>profile.title==='Heartseeker').stats),'Seeker source-equivalent profiles stay separately bound');

const duplicateUnit=catalogById.get('unit-noise-marines'),duplicateModels=boundary(duplicateUnit.id,'min');
const duplicates=project([rawUnit(duplicateUnit,duplicateModels,'parsed-unit-1'),rawUnit(duplicateUnit,duplicateModels,'parsed-unit-2')]);
assert.equal(duplicates.status,'ready','duplicate physical units remain legal');
assert.notEqual(duplicates.units[0].selection.composition,duplicates.units[1].selection.composition,'composition instances are isolated');
assert.notEqual(duplicates.units[0].effective.statProfiles,duplicates.units[1].effective.statProfiles,'profile instances are isolated');
assert.deepEqual(plain(duplicates.units[0].effective.statProfiles),plain(duplicates.units[1].effective.statProfiles),'duplicate profile facts remain equal');

let mutations=0;
const killed=(label,mutate)=>{const poisoned=clone(catalog);mutate(poisoned);assert.throws(()=>certifyCatalog(poisoned),undefined,`${label} mutation survived`);mutations++;};
killed('MISSING_MODEL_IDENTITY',value=>{value.units.find(unit=>unit.id==='unit-noise-marines').gameSelections.models.pop();});
killed('WRONG_QUANTITY_BOUND',value=>{value.units.find(unit=>unit.id==='unit-infractors').gameSelections.models[1].max--;});
killed('INVALID_MIXTURE_ACCEPTED',value=>{value.units.find(unit=>unit.id==='unit-seekers').gameSelections.models[1].min=0;});
killed('MISSING_PROFILE_CHARACTERISTIC',value=>{delete value.units.find(unit=>unit.id==='unit-noise-marines').gameSelections.statProfiles[0].stats.W;});
killed('CHARACTERISTIC_ON_WRONG_PROFILE',value=>{const noise=value.units.find(unit=>unit.id==='unit-noise-marines').gameSelections.statProfiles[0],seeker=value.units.find(unit=>unit.id==='unit-seekers').gameSelections.statProfiles[0];[noise.stats.M,seeker.stats.M]=[seeker.stats.M,noise.stats.M];});

assert.equal(positive,48,'positive composition/profile controls');
assert.equal(negative,53,'negative composition controls');
assert.equal(mutations,5,'source-backed mutation controls');
console.log("Emperor's Children roster composition/profile QA: composition 23/23; profile characteristic bindings 12/12; positive 48/48; negative 53/53; physical-instance 4/4; mutations 5/5 KILLED; PASS");
