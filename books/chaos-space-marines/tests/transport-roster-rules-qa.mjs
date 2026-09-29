import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const clone=value=>structuredClone(value),plain=value=>JSON.parse(JSON.stringify(value));
const scope={console,URL,URLSearchParams};scope.window=scope;scope.globalThis=scope;vm.createContext(scope);
for(const file of ['books/chaos-space-marines/scripts/roster-data.js','books/shared/effect-contract-runtime.js','books/shared/roster-context.js'])vm.runInContext(read(file),scope,{filename:file});
const baseline=scope.WH_BOOK_ROSTER_CATALOG;
const byId=(catalog,id)=>catalog.units.find(unit=>unit.id===id),contractFor=(catalog,id)=>catalog.effectContracts.find(contract=>contract.canonicalRecordId===id);
const rawFor=(catalog,unitId,instanceId,maximum=false)=>{const unit=byId(catalog,unitId),models=unit.gameSelections.models.map(model=>({quantity:Number(model[maximum?'max':'min']),name:model.aliases?.[0]||model.title,loadouts:[]}));return{id:instanceId,canonicalUnitId:unit.id,name:unit.title,quantity:models.reduce((sum,model)=>sum+model.quantity,0),points:0,wargear:'',models,warlord:null};};
const project=(catalog,units,transportAssignments={})=>{scope.WH_BOOK_ROSTER_CATALOG=catalog;return scope.WHArmyRosterContext.project({catalog,roster:{faction:'Chaos Space Marines',detachments:[],enhancements:[],units},record:{id:'csm-transport-qa',attachments:{},transportAssignments},provider:{gameEffects:context=>scope.WHEffectContractRuntime.project(context)}}).game;};
const transport=(game,id)=>game.transportState.transports.find(item=>item.transportInstanceId===id),rejection=(game,transportId,passengerId,reason)=>game.transportState.rejected.some(item=>item.transportInstanceId===transportId&&item.passengerInstanceId===passengerId&&item.reason===reason);

const source=JSON.parse(read('books/chaos-space-marines/content/chaos-space-marines-codex-datasheets.en.json'));
assert.equal(source.datasheets.find(item=>item.id==='unit-chaos-rhino').relations.transport[0],'This model has a transport capacity of 12 Heretic Astartes Infantry models. It cannot transport Terminator, Jump Pack, Mutilators, Obliterators or Possessed models.');
assert.equal(source.datasheets.find(item=>item.id==='unit-chaos-land-raider').relations.transport[0],'This model has a transport capacity of 12 Heretic Astartes Infantry (excluding Obliterator and Jump Pack models). Each Possessed, Mutilators and Terminator model takes up the space of 2 models.');

const certify=catalog=>{
  const rhinoContract=contractFor(catalog,'datasheet-chaos-rhino:section:2'),landContract=contractFor(catalog,'datasheet-chaos-land-raider:section:2');
  assert.ok(rhinoContract,'Chaos Rhino current source transport contract');assert.ok(landContract,'Chaos Land Raider current source transport contract');
  assert.deepEqual(plain(rhinoContract.clauses[0].operations[0].parameters),{capacity:12,restriction:{subject:'models',allKeywords:['HERETIC ASTARTES','INFANTRY'],noneKeywords:['TERMINATOR','JUMP PACK','MUTILATORS','OBLITERATORS','POSSESSED']}},'Rhino exact capacity and exclusions');
  assert.deepEqual(plain(landContract.clauses[0].operations[0].parameters),{capacity:12,restriction:{subject:'models',allKeywords:['HERETIC ASTARTES','INFANTRY'],noneKeywords:['OBLITERATORS','JUMP PACK'],spaceMultipliers:[{anyKeywords:['POSSESSED','MUTILATORS','TERMINATOR'],spacesPerModel:2}]}},'Land Raider exact capacity, exclusions and double-space classes');
  const canonical=plain(['unit-chaos-rhino','unit-chaos-land-raider'].map(id=>({id,keywords:byId(catalog,id).intrinsicKeywords,stats:byId(catalog,id).gameSelections.stats})));
  const rhino=rawFor(catalog,'unit-chaos-rhino','rhino'),legionaries=rawFor(catalog,'unit-legionaries','legionaries');let game=project(catalog,[rhino,legionaries],{rhino:['legionaries']});
  assert.equal(game.status,'ready');assert.equal(game.units[0].effective.transportCapacity.capacity,12);assert.equal(transport(game,'rhino').occupiedCapacity,5);
  for(const [unitId,id] of [['unit-chaos-terminator-squad','terminators'],['unit-warp-talons','jump'],['unit-mutilators','mutilators'],['unit-obliterators','obliterators'],['unit-possessed','possessed']]){const passenger=rawFor(catalog,unitId,id);game=project(catalog,[clone(rhino),passenger],{rhino:[id]});assert.ok(rejection(game,'rhino',id,'passenger-ineligible'),`Rhino rejects ${unitId}`);}
  const twenty=rawFor(catalog,'unit-cultist-mob','twenty',true);game=project(catalog,[clone(rhino),twenty],{rhino:['twenty']});assert.ok(rejection(game,'rhino','twenty','transport-capacity-exceeded'));
  const rhino2=rawFor(catalog,'unit-chaos-rhino','rhino-2');game=project(catalog,[clone(rhino),rhino2,clone(legionaries)],{'rhino-2':['legionaries']});assert.equal(transport(game,'rhino').occupiedCapacity,0);assert.equal(transport(game,'rhino-2').occupiedCapacity,5);

  const land=rawFor(catalog,'unit-chaos-land-raider','land');game=project(catalog,[land,clone(legionaries)],{land:['legionaries']});assert.equal(game.status,'ready');assert.equal(game.units[0].effective.transportCapacity.capacity,12);assert.equal(transport(game,'land').occupiedCapacity,5);
  for(const [unitId,id] of [['unit-warp-talons','land-jump'],['unit-obliterators','land-obliterators']]){const passenger=rawFor(catalog,unitId,id);game=project(catalog,[clone(land),passenger],{land:[id]});assert.ok(rejection(game,'land',id,'passenger-ineligible'));}
  const possessed=rawFor(catalog,'unit-possessed','possessed'),lord=rawFor(catalog,'unit-chaos-lord','lord');game=project(catalog,[clone(land),possessed],{land:['possessed']});assert.equal(transport(game,'land').occupiedCapacity,10,'Possessed consume double space');
  game=project(catalog,[clone(land),clone(possessed),lord],{land:['possessed','lord']});assert.equal(game.status,'ready');assert.equal(transport(game,'land').occupiedCapacity,11,'mixed double and ordinary load');
  game=project(catalog,[clone(land),clone(legionaries),clone(possessed)],{land:['legionaries','possessed']});assert.ok(rejection(game,'land','possessed','transport-capacity-exceeded'));assert.equal(transport(game,'land').occupiedCapacity,5);
  const land2=rawFor(catalog,'unit-chaos-land-raider','land-2');game=project(catalog,[clone(land),land2,clone(possessed)],{'land-2':['possessed']});assert.equal(transport(game,'land').occupiedCapacity,0);assert.equal(transport(game,'land-2').occupiedCapacity,10);
  const loaded=project(catalog,[clone(land),clone(legionaries)],{land:['legionaries']}),removed=project(catalog,[clone(land),clone(legionaries)],{}),reloaded=project(catalog,[clone(land),clone(legionaries)],JSON.parse(JSON.stringify({land:['legionaries']})));assert.equal(transport(loaded,'land').occupiedCapacity,5);assert.equal(transport(removed,'land').occupiedCapacity,0);assert.deepEqual(plain(reloaded.transportState),plain(loaded.transportState));
  assert.deepEqual(plain(['unit-chaos-rhino','unit-chaos-land-raider'].map(id=>({id,keywords:byId(catalog,id).intrinsicKeywords,stats:byId(catalog,id).gameSelections.stats}))),canonical,'canonical transport facts immutable');
  return{positive:8,negative:9,recompute:3,physical:4};
};

const controls=certify(baseline);assert.deepEqual(controls,{positive:8,negative:9,recompute:3,physical:4});
let mutations=0;const killed=(label,mutate)=>{const catalog=clone(baseline);mutate(catalog);assert.throws(()=>certify(catalog),undefined,`${label} mutation survived`);mutations++;};
killed('MISSING_RHINO_RULE',catalog=>catalog.effectContracts=catalog.effectContracts.filter(item=>item.canonicalRecordId!=='datasheet-chaos-rhino:section:2'));
killed('WRONG_RHINO_CAPACITY',catalog=>contractFor(catalog,'datasheet-chaos-rhino:section:2').clauses[0].operations[0].parameters.capacity=11);
killed('REMOVED_RHINO_EXCLUSIONS',catalog=>contractFor(catalog,'datasheet-chaos-rhino:section:2').clauses[0].operations[0].parameters.restriction.noneKeywords=[]);
killed('MISSING_LAND_RAIDER_RULE',catalog=>catalog.effectContracts=catalog.effectContracts.filter(item=>item.canonicalRecordId!=='datasheet-chaos-land-raider:section:2'));
killed('REMOVED_LAND_RAIDER_EXCLUSION',catalog=>contractFor(catalog,'datasheet-chaos-land-raider:section:2').clauses[0].operations[0].parameters.restriction.noneKeywords=[]);
killed('REMOVED_DOUBLE_SPACE',catalog=>contractFor(catalog,'datasheet-chaos-land-raider:section:2').clauses[0].operations[0].parameters.restriction.spaceMultipliers=[]);
assert.equal(mutations,6);
console.log(`CSM transport rules: source 2/2; executable 2/2; positive ${controls.positive}/${controls.positive}; negative ${controls.negative}/${controls.negative}; recompute ${controls.recompute}/${controls.recompute}; physical-instance ${controls.physical}/${controls.physical}; mutations ${mutations}/${mutations} KILLED; PASS`);
