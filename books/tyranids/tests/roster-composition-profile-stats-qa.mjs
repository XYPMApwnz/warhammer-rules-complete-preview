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
const config=JSON.parse(read('books/tyranids/book.config.json'));
const context=createCanonicalBuildContext({repoRoot:root,configPath:path.join(root,'books/tyranids/book.config.json'),config});
const {effectiveBookModel:model}=await buildCanonicalBook(context,{projectionOnly:true});
const scope={window:{},URL,URLSearchParams};
vm.runInNewContext(read('books/tyranids/scripts/roster-data.js'),scope);
vm.runInNewContext(read('books/shared/roster-context.js'),scope);
const catalog=scope.window.WH_BOOK_ROSTER_CATALOG,api=scope.window.WHArmyRosterContext;

const multipartIds=[
  'unit-hyperadapted-raveners',
  'unit-neurogaunts',
  'unit-tyranid-warriors-with-melee-bio-weapons',
  'unit-tyranid-warriors-with-ranged-bio-weapons',
  'unit-zoanthropes'
];
const sourceById=new Map(model.units.map(unit=>[unit.id,unit]));
const catalogById=new Map(catalog.units.map(unit=>[unit.id,unit]));
assert.equal(catalog.compositionConstraints,true,'Tyranids composition constraints enabled');
assert.deepEqual(plain(catalog.units.filter(unit=>unit.gameSelections.models.length>1).map(unit=>unit.id)),multipartIds,'exact multipart composition class');

const expectedModels=unitId=>canonicalRosterModelsFor(sourceById.get(unitId),{enforceCompositionConstraints:true});
const certifyCatalog=value=>{
  const byId=new Map(value.units.map(unit=>[unit.id,unit]));
  for(const unitId of multipartIds){
    const current=byId.get(unitId);
    assert.ok(current,`${unitId}: roster unit exists`);
    assert.deepEqual(plain(current.gameSelections.models),plain(expectedModels(unitId)),`${unitId}: source-backed canonical composition`);
  }
  const raveners=byId.get('unit-hyperadapted-raveners');
  assert.deepEqual(plain(raveners.gameSelections.statProfiles),plain(canonicalStatProfilesForUnit(sourceById.get(raveners.id))),'Hyperadapted Raveners canonical stat profiles');
  const neuro=byId.get('unit-neurogaunts');
  assert.deepEqual(plain(neuro.gameSelections.compositionRules),plain(sourceById.get(neuro.id).rosterCompositionRules),'Neurogaunts conditional composition rule');
};
certifyCatalog(catalog);

const rawUnit=(unit,models,instanceId='parsed-unit-1')=>({
  id:instanceId,canonicalUnitId:unit.id,name:unit.title,quantity:models.reduce((sum,item)=>sum+item.quantity,0),points:0,wargear:'',models:models.map(item=>({quantity:item.quantity,name:item.name,wargear:'',loadouts:[]})),warlord:null
});
const rosterFor=units=>({faction:'Tyranids',declared:0,calculated:0,unitLineTotal:0,detachments:[],enhancements:[],warnings:[],units});
const project=units=>api.project({catalog,roster:rosterFor(units),record:{id:'tyranids-roster-gap-qa',attachments:{}},provider:{gameEffects:()=>[]}}).game;
const modelRows=(unitId,key)=>catalogById.get(unitId).gameSelections.models.map(item=>({name:item.aliases.find(alias=>!/^\d+\s*[-–]\s*\d+\s+/.test(alias))||item.title,quantity:Number(item[key])}));
const assertAccepted=(unitId,models,label)=>{
  const unit=catalogById.get(unitId),game=project([rawUnit(unit,models)]),composition=game.units[0].selection.composition;
  assert.equal(game.status,'ready',`${unitId}: ${label} game status`);
  assert.equal(composition.state,'resolved',`${unitId}: ${label} composition state`);
  assert.equal(composition.models.reduce((sum,item)=>sum+item.quantity,0),models.reduce((sum,item)=>sum+item.quantity,0),`${unitId}: ${label} model count`);
  assert.ok(composition.models.every(item=>item.canonicalModelId),`${unitId}: ${label} exact canonical model identities`);
  return game;
};
const assertRejected=(unitId,models,label)=>{
  const unit=catalogById.get(unitId),game=project([rawUnit(unit,models)]),composition=game.units[0].selection.composition;
  assert.equal(game.status,'invalid',`${unitId}: ${label} game status`);
  assert.equal(composition.state,'invalid',`${unitId}: ${label} composition state`);
  assert.ok(composition.unresolved.length,`${unitId}: ${label} rejection reason`);
};

let positive=0,negative=0;
for(const unitId of multipartIds){
  const minimum=modelRows(unitId,'min'),maximum=modelRows(unitId,'max');
  if(unitId==='unit-neurogaunts'){
    minimum[0].quantity=1;minimum[1].quantity=10;
    maximum[0].quantity=2;maximum[1].quantity=20;
  }
  assertAccepted(unitId,minimum,'minimum legal composition');positive++;
  assertAccepted(unitId,maximum,'maximum legal composition');positive++;
  const below=clone(minimum);below[1].quantity--;
  assertRejected(unitId,below,'below minimum');negative++;
  const above=clone(maximum);above[1].quantity++;
  assertRejected(unitId,above,'above maximum');negative++;
  const wrong=clone(minimum);wrong[0].quantity=0;wrong[1].quantity++;
  assertRejected(unitId,wrong,'invalid model mixture');negative++;
}

const neuroMin=modelRows('unit-neurogaunts','min');
neuroMin[0].quantity=1;neuroMin[1].quantity=19;assertAccepted('unit-neurogaunts',neuroMin,'one Nodebeast below condition');positive++;
const neuroWrong=clone(neuroMin);neuroWrong[0].quantity=2;assertRejected('unit-neurogaunts',neuroWrong,'second Nodebeast without twenty Neurogaunts');negative++;
const neuroExact=clone(neuroMin);neuroExact[0].quantity=2;neuroExact[1].quantity=20;assertAccepted('unit-neurogaunts',neuroExact,'second Nodebeast with twenty Neurogaunts');positive++;
const neuroThree=clone(neuroExact);neuroThree[0].quantity=3;assertRejected('unit-neurogaunts',neuroThree,'third Nodebeast');negative++;

const ravenerUnit=catalogById.get('unit-hyperadapted-raveners');
const ravenerModels=[{name:'Ravener Prime',quantity:1},{name:'Ravener',quantity:4}];
const ravenerGame=assertAccepted(ravenerUnit.id,ravenerModels,'profile-stat fixture');positive++;
const statProfiles=ravenerGame.units[0].effective.statProfiles;
assert.equal(statProfiles.length,2,'two distinct effective stat profiles');
const prime=statProfiles.find(profile=>profile.title==='Ravener Prime'),raveners=statProfiles.find(profile=>profile.title==='Ravener');
assert.ok(prime&&raveners,'profile identities remain distinct');
assert.deepEqual(plain(prime.stats),{M:'10"',T:'5',Sv:'4+',W:'6',Ld:'7+',OC:'1',Invulnerable:''},'Ravener Prime source stats');
assert.deepEqual(plain(raveners.stats),{M:'10"',T:'5',Sv:'4+',W:'3',Ld:'8+',OC:'1',Invulnerable:''},'Ravener source stats');
assert.notEqual(prime.stats.W,raveners.stats.W,'distinct Wounds remain distinct');
assert.notEqual(prime.stats.Ld,raveners.stats.Ld,'distinct Leadership remains distinct');
assert.equal(Object.isFrozen(statProfiles),true,'stat profile collection is immutable');
assert.equal(Object.isFrozen(prime.stats),true,'stat profile facts are immutable');

const duplicates=project([
  rawUnit(ravenerUnit,ravenerModels,'parsed-unit-1'),
  rawUnit(ravenerUnit,ravenerModels,'parsed-unit-2')
]);
assert.equal(duplicates.status,'ready','duplicate physical instances are valid');
assert.notEqual(duplicates.units[0].selection.composition,duplicates.units[1].selection.composition,'composition instances are isolated');
assert.notEqual(duplicates.units[0].effective.statProfiles,duplicates.units[1].effective.statProfiles,'stat profile instances are isolated');
assert.deepEqual(plain(duplicates.units[0].effective.statProfiles),plain(duplicates.units[1].effective.statProfiles),'duplicate facts remain equal');

let mutations=0;
const killed=(label,mutate)=>{const poisoned=clone(catalog);mutate(poisoned);assert.throws(()=>certifyCatalog(poisoned),undefined,`${label} mutation survived`);mutations++;};
killed('MISSING_MODEL_IDENTITY',value=>{value.units.find(unit=>unit.id==='unit-zoanthropes').gameSelections.models.pop();});
killed('WRONG_MIXTURE',value=>{value.units.find(unit=>unit.id==='unit-neurogaunts').gameSelections.compositionRules[0].requires.modelId='unit-wrong-model';});
killed('WRONG_QUANTITY_BOUND',value=>{value.units.find(unit=>unit.id==='unit-hyperadapted-raveners').gameSelections.models[1].max=5;});
killed('MISSING_PROFILE_CHARACTERISTIC',value=>{delete value.units.find(unit=>unit.id==='unit-hyperadapted-raveners').gameSelections.statProfiles[0].stats.W;});
killed('CHARACTERISTIC_ON_WRONG_PROFILE',value=>{const profiles=value.units.find(unit=>unit.id==='unit-hyperadapted-raveners').gameSelections.statProfiles;[profiles[0].stats.W,profiles[1].stats.W]=[profiles[1].stats.W,profiles[0].stats.W];});

assert.equal(positive,13,'positive composition/profile controls');
assert.equal(negative,17,'negative composition controls');
assert.equal(mutations,5,'source-backed mutation controls');
console.log('Tyranids roster composition/profile QA: composition 5/5; profile characteristics 12/12; positive 13/13; negative 17/17; physical-instance 5/5; mutations 5/5 KILLED; PASS');

