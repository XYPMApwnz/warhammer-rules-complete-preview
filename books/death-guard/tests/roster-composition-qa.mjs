import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createCanonicalBuildContext} from '../../shared/tools/canonical-build-contract.mjs';
import {canonicalRosterModelsFor} from '../../shared/tools/build-roster-catalog.mjs';
import {buildDeathGuardEffectiveModelInput} from '../tools/canonical-source-adapter.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const clone=value=>structuredClone(value);
const plain=value=>JSON.parse(JSON.stringify(value));
const config=JSON.parse(read('books/death-guard/book.config.json'));
const context=createCanonicalBuildContext({repoRoot:root,configPath:path.join(root,'books/death-guard/book.config.json'),config});
const model=await buildDeathGuardEffectiveModelInput(context);
const scope={window:{},URL,URLSearchParams};vm.runInNewContext(read('books/death-guard/scripts/roster-data.js'),scope);vm.runInNewContext(read('books/shared/roster-context.js'),scope);
const catalog=scope.window.WH_BOOK_ROSTER_CATALOG,api=scope.window.WHArmyRosterContext;

const sourceById=new Map(model.units.map(unit=>[unit.id,unit]));
assert.equal(sourceById.size,36,'certified Death Guard composition denominator');

const expectedModels=unit=>canonicalRosterModelsFor(sourceById.get(unit.id),{enforceCompositionConstraints:true});
const certifyCatalog=value=>{
  assert.equal(value.units.length,36,'Roster catalog unit denominator');
  for(const unit of value.units)assert.deepEqual(plain(unit.gameSelections.models),plain(expectedModels(unit)),`${unit.id}: source-backed composition contract`);
};
certifyCatalog(catalog);

const rawUnit=(unit,models,instanceId='parsed-unit-1')=>({
  id:instanceId,canonicalUnitId:unit.id,name:unit.title,quantity:models.reduce((sum,item)=>sum+item.quantity,0),points:0,wargear:'',models:models.map(item=>({quantity:item.quantity,name:item.name,wargear:'',loadouts:[]})),warlord:null
});
const rosterFor=units=>({faction:'Death Guard',declared:0,calculated:0,unitLineTotal:0,detachments:[],enhancements:[],warnings:[],units});
const project=units=>api.project({catalog,roster:rosterFor(units),record:{id:'dg-composition',attachments:{}},provider:{gameEffects:()=>[]}}).game;
const boundary=(unit,key)=>unit.gameSelections.models.map(model=>({name:model.title,quantity:Number(model[key])}));
const assertAccepted=(unit,models,label)=>{
  const game=project([rawUnit(unit,models)]),composition=game.units[0].selection.composition;
  assert.equal(game.status,'ready',`${unit.id}: ${label} game status`);
  assert.equal(composition.state,'resolved',`${unit.id}: ${label} composition state`);
  assert.deepEqual(plain(composition.models.map(item=>[item.canonicalModelId,item.quantity])),plain(models.map(item=>[unit.gameSelections.models.find(model=>model.title===item.name).id,item.quantity])),`${unit.id}: ${label} canonical model mixture`);
};
const assertRejected=(unit,models,label)=>{
  const game=project([rawUnit(unit,models)]),composition=game.units[0].selection.composition;
  assert.equal(game.status,'invalid',`${unit.id}: ${label} game status`);
  assert.equal(composition.state,'invalid',`${unit.id}: ${label} composition state`);
  assert.ok(composition.unresolved.length,`${unit.id}: ${label} rejection reason`);
};

let positive=0,negative=0;
for(const unit of catalog.units){
  const minimum=boundary(unit,'min'),maximum=boundary(unit,'max');
  assertAccepted(unit,minimum,'minimum');positive++;
  assertAccepted(unit,maximum,'maximum');positive++;
  const below=clone(minimum);below[0].quantity--;
  assertRejected(unit,below,'below minimum');negative++;
  const above=clone(maximum);above[0].quantity++;
  assertRejected(unit,above,'above maximum');negative++;
}

const mixed=catalog.units.filter(unit=>unit.gameSelections.models.length>1);
assert.equal(mixed.length,5,'mixed-composition source class');
for(const unit of mixed){
  const invalid=boundary(unit,'min');invalid[0].quantity--;invalid[1].quantity++;
  assertRejected(unit,invalid,'invalid model mixture');negative++;
}
assert.equal(catalog.units.filter(unit=>unit.gameSelections.models.length===1&&unit.gameSelections.models[0].min===1&&unit.gameSelections.models[0].max===1).length,26,'single-model source class');

const poxwalkers=catalog.units.find(unit=>unit.id==='unit-poxwalkers');
const duplicateRoster=[rawUnit(poxwalkers,[{name:'Poxwalker',quantity:10}],'parsed-unit-1'),rawUnit(poxwalkers,[{name:'Poxwalker',quantity:20}],'parsed-unit-2')];
const duplicate=project(duplicateRoster);
assert.deepEqual(plain(duplicate.units.map(unit=>unit.selection.composition.models[0].quantity)),[10,20],'duplicate physical instances preserve independent composition');
assert.notEqual(duplicate.units[0].selection.composition,duplicate.units[1].selection.composition,'duplicate physical composition objects are isolated');
assert.equal(Object.isFrozen(duplicate.units[0].selection.composition.models),true,'first physical composition is immutable');
assert.equal(Object.isFrozen(duplicate.units[1].selection.composition.models),true,'second physical composition is immutable');
const recomputed=project(clone(duplicateRoster));
assert.deepEqual(JSON.parse(JSON.stringify(recomputed)),JSON.parse(JSON.stringify(duplicate)),'reload/recompute preserves composition');

let mutations=0;
const killed=(label,mutate)=>{const poisoned=clone(catalog);mutate(poisoned);assert.throws(()=>certifyCatalog(poisoned),undefined,`${label} mutation survived`);mutations++;};
killed('MISSING_MIN',value=>{delete value.units.find(unit=>unit.id==='unit-poxwalkers').gameSelections.models[0].min;});
killed('WRONG_MAX',value=>{value.units.find(unit=>unit.id==='unit-poxwalkers').gameSelections.models[0].max=19;});
killed('MISSING_MODEL_IDENTITY',value=>{value.units.find(unit=>unit.id==='unit-plague-marines').gameSelections.models.pop();});
killed('WRONG_MODEL_IDENTITY',value=>{value.units.find(unit=>unit.id==='unit-plague-marines').gameSelections.models[0].id='unit-wrong-model';});
killed('WRONG_MODEL_MIXTURE',value=>{value.units.find(unit=>unit.id==='unit-plague-marines').gameSelections.models[0].min=0;});

assert.equal(positive,72,'positive boundary controls');
assert.equal(negative,77,'negative boundary and mixture controls');
assert.equal(mutations,5,'composition mutation inventory');
console.log('Death Guard roster composition QA: 36/36 executable; positive 72/72; negative 77/77; physical-instance 4/4; recompute 1/1; mutations 5/5 KILLED; PASS');
