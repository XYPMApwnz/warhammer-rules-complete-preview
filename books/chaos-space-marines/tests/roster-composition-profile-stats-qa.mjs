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
const config=JSON.parse(read('books/chaos-space-marines/book.config.json'));
const context=createCanonicalBuildContext({repoRoot:root,configPath:path.join(root,'books/chaos-space-marines/book.config.json'),config});
const {effectiveBookModel:model}=await buildCanonicalBook(context,{projectionOnly:true});
const scope={window:{},URL,URLSearchParams};
vm.runInNewContext(read('books/chaos-space-marines/scripts/roster-data.js'),scope);
vm.runInNewContext(read('books/shared/roster-context.js'),scope);
const catalog=scope.window.WH_BOOK_ROSTER_CATALOG,api=scope.window.WHArmyRosterContext;

const sourceById=new Map(model.units.map(unit=>[unit.id,unit]));
const catalogById=new Map(catalog.units.map(unit=>[unit.id,unit]));
const multipartIds=model.units.filter(unit=>(unit.composition||[]).length>1).map(unit=>unit.id);
const profileUnitIds=model.units.filter(unit=>(unit.profiles||[]).length>1).map(unit=>unit.id);
assert.equal(sourceById.size,54,'certified CSM composition denominator');
assert.equal(catalog.compositionConstraints,true,'CSM composition constraints enabled');
assert.equal(catalog.statProfiles,true,'CSM stat-profile projection enabled');
assert.equal(catalog.preserveMultipartStatProfiles,true,'CSM multipart source-profile identities preserved');
assert.equal(multipartIds.length,17,'17 multipart composition records');
assert.equal(profileUnitIds.length,15,'15 multipart physical-profile datasheets');

const expectedModels=unitId=>canonicalRosterModelsFor(sourceById.get(unitId),{enforceCompositionConstraints:true});
const expectedProfiles=unitId=>canonicalStatProfilesForUnit(sourceById.get(unitId),{preserveMultipartProfiles:true});
const certifyCatalog=value=>{
  const byId=new Map(value.units.map(unit=>[unit.id,unit]));
  assert.equal(byId.size,54,'Roster catalog unit denominator');
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
assert.equal(profileUnitIds.reduce((sum,unitId)=>sum+expectedProfiles(unitId).length-1,0),20,'20 additional physical profiles');
assert.equal(profileUnitIds.reduce((sum,unitId)=>sum+expectedProfiles(unitId).slice(1).reduce(
  (inner,profile)=>inner+['M','T','Sv','W','Ld','OC'].filter(key=>profile.stats[key]!==undefined).length,0
),0),120,'120 previously absent certified profile characteristic bindings');

const rawUnit=(unit,models,instanceId='parsed-unit-1')=>({
  id:instanceId,canonicalUnitId:unit.id,name:unit.title,quantity:models.reduce((sum,item)=>sum+item.quantity,0),points:0,wargear:'',
  models:models.map(item=>({quantity:item.quantity,name:item.name,wargear:'',loadouts:[]})),warlord:null
});
const rosterFor=units=>({faction:'Chaos Space Marines',declared:0,calculated:0,unitLineTotal:0,detachments:[],enhancements:[],warnings:[],units});
const project=units=>api.project({catalog,roster:rosterFor(units),record:{id:'csm-roster-composition-profile-qa',attachments:{}},provider:{gameEffects:()=>[]}}).game;
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
for(const unitId of multipartIds){
  const invalid=boundary(unitId,'min');
  const fixed=expectedModels(unitId).findIndex(item=>item.min===item.max&&item.min>0);
  const from=fixed>=0?fixed:0,to=from===0?1:0;
  invalid[from].quantity--;invalid[to].quantity++;
  assertRejected(unitId,invalid,'invalid model mixture');negative++;
}

const darkApostle=assertAccepted('unit-dark-apostle',boundary('unit-dark-apostle','min'),'profile fixture');positive++;
const apostleProfiles=darkApostle.units[0].effective.statProfiles;
const apostle=apostleProfiles.find(profile=>profile.title==='Dark Apostle'),disciple=apostleProfiles.find(profile=>profile.title==='Dark Disciple');
assert.ok(apostle&&disciple,'Dark Apostle physical profiles remain exact');
assert.equal(apostle.stats.W,'4','Dark Apostle Wounds stay on the bearer profile');
assert.equal(disciple.stats.W,'1','Dark Disciple Wounds stay on the disciple profile');
assert.equal(apostle.stats.Ld,'5+','Dark Apostle Leadership stays on the bearer profile');
assert.equal(disciple.stats.Ld,'7+','Dark Disciple Leadership stays on the disciple profile');

const warpTalons=assertAccepted('unit-warp-talons',boundary('unit-warp-talons','min'),'equal-stat profile fixture');positive++;
assert.deepEqual(plain(warpTalons.units[0].effective.statProfiles.map(profile=>profile.title)),['Warp Talon Champion','Warp Talons'],
  'equal-stat physical profile identities are not flattened');

const duplicateUnit=catalogById.get('unit-dark-apostle'),duplicateModels=boundary(duplicateUnit.id,'min');
const duplicates=project([rawUnit(duplicateUnit,duplicateModels,'parsed-unit-1'),rawUnit(duplicateUnit,duplicateModels,'parsed-unit-2')]);
assert.equal(duplicates.status,'ready','duplicate physical units remain legal');
assert.notEqual(duplicates.units[0].selection.composition,duplicates.units[1].selection.composition,'composition instances are isolated');
assert.notEqual(duplicates.units[0].effective.statProfiles,duplicates.units[1].effective.statProfiles,'profile instances are isolated');
assert.deepEqual(plain(duplicates.units[0].effective.statProfiles),plain(duplicates.units[1].effective.statProfiles),'duplicate profile facts remain equal');

let mutations=0;
const killed=(label,mutate)=>{const poisoned=clone(catalog);mutate(poisoned);assert.throws(()=>certifyCatalog(poisoned),undefined,`${label} mutation survived`);mutations++;};
killed('MISSING_MODEL_IDENTITY',value=>{value.units.find(unit=>unit.id==='unit-dark-apostle').gameSelections.models.pop();});
killed('WRONG_QUANTITY_BOUND',value=>{value.units.find(unit=>unit.id==='unit-legionaries').gameSelections.models[1].max--;});
killed('INVALID_MIXTURE_ACCEPTED',value=>{value.units.find(unit=>unit.id==='unit-dark-commune').gameSelections.models[1].min=0;});
killed('MISSING_PROFILE_CHARACTERISTIC',value=>{delete value.units.find(unit=>unit.id==='unit-dark-apostle').gameSelections.statProfiles[0].stats.W;});
killed('CHARACTERISTIC_ON_WRONG_PROFILE',value=>{const profiles=value.units.find(unit=>unit.id==='unit-dark-apostle').gameSelections.statProfiles;[profiles[0].stats.Ld,profiles[1].stats.Ld]=[profiles[1].stats.Ld,profiles[0].stats.Ld];});

assert.equal(positive,110,'positive composition/profile controls');
assert.equal(negative,125,'negative composition controls');
assert.equal(mutations,5,'source-backed mutation controls');
console.log('CSM roster composition/profile QA: composition 54/54; profile bindings 120/120; positive 110/110; negative 125/125; physical-instance 4/4; mutations 5/5 KILLED; PASS');
