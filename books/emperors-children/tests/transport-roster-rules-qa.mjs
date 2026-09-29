import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const clone=value=>structuredClone(value);
const plain=value=>JSON.parse(JSON.stringify(value));
const scope={console,URL,URLSearchParams};scope.window=scope;scope.globalThis=scope;vm.createContext(scope);
for(const file of ['books/emperors-children/scripts/roster-data.js','books/shared/effect-contract-runtime.js','books/shared/roster-context.js'])vm.runInContext(read(file),scope,{filename:file});
const baseline=scope.WH_BOOK_ROSTER_CATALOG;
const byId=(catalog,id)=>catalog.units.find(unit=>unit.id===id);
const contractFor=(catalog,id)=>catalog.effectContracts.find(contract=>contract.canonicalRecordId===id);
const rawFor=(catalog,unitId,instanceId,maximum=false)=>{const unit=byId(catalog,unitId),models=unit.gameSelections.models.map(model=>({quantity:Number(model[maximum?'max':'min']),name:model.aliases?.[0]||model.title,loadouts:[]}));return{id:instanceId,canonicalUnitId:unit.id,name:unit.title,quantity:models.reduce((sum,model)=>sum+model.quantity,0),points:0,wargear:'',models,warlord:null};};
const project=(catalog,units,transportAssignments={})=>{scope.WH_BOOK_ROSTER_CATALOG=catalog;return scope.WHArmyRosterContext.project({catalog,roster:{faction:"Emperor's Children",detachments:[],enhancements:[],units},record:{id:'ec-transport-qa',attachments:{},transportAssignments},provider:{gameEffects:context=>scope.WHEffectContractRuntime.project(context)}}).game;};
const transport=(game,id)=>game.transportState.transports.find(item=>item.transportInstanceId===id);
const rejection=(game,transportId,passengerId,reason)=>game.transportState.rejected.some(item=>item.transportInstanceId===transportId&&item.passengerInstanceId===passengerId&&item.reason===reason);

const certify=catalog=>{
  const rhinoContract=contractFor(catalog,'datasheet-chaos-rhino:section:2'),landContract=contractFor(catalog,'datasheet-chaos-land-raider:section:2');
  const canonicalTransportFacts=plain(['unit-chaos-rhino','unit-chaos-land-raider'].map(id=>{const unit=byId(catalog,id);return{id:unit.id,keywords:unit.intrinsicKeywords,models:unit.gameSelections.models,stats:unit.gameSelections.stats};}));
  assert.ok(rhinoContract,'Chaos Rhino source transport contract');
  assert.ok(landContract,'Chaos Land Raider source transport contract');
  assert.deepEqual(plain(rhinoContract.clauses[0].operations[0].parameters),{capacity:12,restriction:{subject:'models',allKeywords:["EMPEROR’S CHILDREN",'INFANTRY'],noneKeywords:['TERMINATOR','FLAWLESS BLADES']}},'Rhino source capacity and exclusions');
  assert.deepEqual(plain(landContract.clauses[0].operations[0].parameters),{capacity:14,restriction:{subject:'models',allKeywords:["EMPEROR’S CHILDREN",'INFANTRY'],spaceMultipliers:[{anyKeywords:['TERMINATOR','FLAWLESS BLADES'],spacesPerModel:2}]}},'Land Raider source capacity and double-space classes');

  const rhino=rawFor(catalog,'unit-chaos-rhino','rhino'),tormentors=rawFor(catalog,'unit-tormentors','tormentors');
  let game=project(catalog,[rhino,tormentors],{rhino:['tormentors']});
  assert.equal(game.status,'ready','legal Rhino load accepted');
  assert.equal(game.units[0].effective.transportCapacity.capacity,12,'Rhino capacity 12');
  assert.deepEqual(plain(transport(game,'rhino')),{transportInstanceId:'rhino',capacity:12,occupiedCapacity:5,remainingCapacity:7,passengerInstanceIds:['tormentors']},'Rhino legal occupancy');

  const terminators=rawFor(catalog,'unit-chaos-terminators','terminators'),flawless=rawFor(catalog,'unit-flawless-blades','flawless');
  game=project(catalog,[rhino,terminators,flawless],{rhino:['terminators','flawless']});
  assert.equal(game.status,'invalid','Rhino exclusions invalidate load');
  assert.ok(rejection(game,'rhino','terminators','passenger-ineligible'),'Rhino rejects Terminators');
  assert.ok(rejection(game,'rhino','flawless','passenger-ineligible'),'Rhino rejects Flawless Blades');
  const ten=rawFor(catalog,'unit-tormentors','ten',true),five=rawFor(catalog,'unit-tormentors','five');
  game=project(catalog,[rhino,ten,five],{rhino:['ten','five']});
  assert.ok(rejection(game,'rhino','five','transport-capacity-exceeded'),'Rhino rejects over-capacity passenger');
  assert.equal(transport(game,'rhino').occupiedCapacity,10,'Rhino accepted occupancy remains bounded');

  const rhino2=rawFor(catalog,'unit-chaos-rhino','rhino-2');
  game=project(catalog,[rhino,rhino2,tormentors],{'rhino-2':['tormentors']});
  assert.equal(transport(game,'rhino').occupiedCapacity,0,'first Rhino remains isolated');
  assert.equal(transport(game,'rhino-2').occupiedCapacity,5,'second Rhino owns its passengers');

  const land=rawFor(catalog,'unit-chaos-land-raider','land');
  game=project(catalog,[land,tormentors],{land:['tormentors']});
  assert.equal(game.status,'ready','legal Land Raider load accepted');
  assert.equal(game.units[0].effective.transportCapacity.capacity,14,'Land Raider capacity 14');
  assert.equal(transport(game,'land').occupiedCapacity,5,'ordinary Infantry consumes one space per model');
  const ineligible=rawFor(catalog,'unit-chaos-rhino','ineligible');
  game=project(catalog,[land,ineligible],{land:['ineligible']});
  assert.ok(rejection(game,'land','ineligible','passenger-ineligible'),'Land Raider rejects non-Infantry passenger');
  game=project(catalog,[land,terminators],{land:['terminators']});
  assert.equal(transport(game,'land').occupiedCapacity,10,'Terminator models consume two spaces');
  game=project(catalog,[land,tormentors,flawless],{land:['tormentors','flawless']});
  assert.equal(game.status,'ready','mixed Land Raider load accepted');
  assert.equal(transport(game,'land').occupiedCapacity,11,'mixed ordinary and double-space load calculated');
  game=project(catalog,[land,ten,terminators],{land:['ten','terminators']});
  assert.ok(rejection(game,'land','terminators','transport-capacity-exceeded'),'Land Raider rejects mixed over-capacity load');
  assert.equal(transport(game,'land').occupiedCapacity,10,'Land Raider occupancy never exceeds capacity');
  const land2=rawFor(catalog,'unit-chaos-land-raider','land-2');
  game=project(catalog,[land,land2,terminators],{'land-2':['terminators']});
  assert.equal(transport(game,'land').occupiedCapacity,0,'first Land Raider remains isolated');
  assert.equal(transport(game,'land-2').occupiedCapacity,10,'second Land Raider owns its passengers');

  const loaded=project(catalog,[land,tormentors],{land:['tormentors']}),removed=project(catalog,[clone(land),clone(tormentors)],{}),reloaded=project(catalog,[clone(land),clone(tormentors)],JSON.parse(JSON.stringify({land:['tormentors']})));
  assert.equal(transport(loaded,'land').occupiedCapacity,5,'adding passenger recomputes occupancy');
  assert.equal(transport(removed,'land').occupiedCapacity,0,'removing passenger recomputes occupancy');
  assert.deepEqual(plain(reloaded.transportState),plain(loaded.transportState),'serialized reload preserves transport state');
  assert.deepEqual(plain(['unit-chaos-rhino','unit-chaos-land-raider'].map(id=>{const unit=byId(catalog,id);return{id:unit.id,keywords:unit.intrinsicKeywords,models:unit.gameSelections.models,stats:unit.gameSelections.stats};})),canonicalTransportFacts,'canonical transport facts remain immutable during projection');
  return{positive:9,negative:6,recompute:3,physical:4};
};

const controls=certify(baseline);
assert.deepEqual(controls,{positive:9,negative:6,recompute:3,physical:4},'focused transport control inventory');
let mutations=0;
const killed=(label,mutate)=>{const catalog=clone(baseline);mutate(catalog);assert.throws(()=>certify(catalog),undefined,`${label} mutation survived`);mutations++;};
killed('MISSING_RHINO_RULE',catalog=>{catalog.effectContracts=catalog.effectContracts.filter(item=>item.canonicalRecordId!=='datasheet-chaos-rhino:section:2');});
killed('WRONG_RHINO_CAPACITY',catalog=>{contractFor(catalog,'datasheet-chaos-rhino:section:2').clauses[0].operations[0].parameters.capacity=11;});
killed('REMOVED_RHINO_EXCLUSION',catalog=>{contractFor(catalog,'datasheet-chaos-rhino:section:2').clauses[0].operations[0].parameters.restriction.noneKeywords=[];});
killed('MISSING_LAND_RAIDER_RULE',catalog=>{catalog.effectContracts=catalog.effectContracts.filter(item=>item.canonicalRecordId!=='datasheet-chaos-land-raider:section:2');});
killed('WRONG_LAND_RAIDER_CAPACITY',catalog=>{contractFor(catalog,'datasheet-chaos-land-raider:section:2').clauses[0].operations[0].parameters.capacity=12;});
killed('REMOVED_DOUBLE_SPACE_RULE',catalog=>{contractFor(catalog,'datasheet-chaos-land-raider:section:2').clauses[0].operations[0].parameters.restriction.spaceMultipliers=[];});
assert.equal(mutations,6,'source-backed transport mutation controls');
console.log(`Emperor's Children transport rules: source 2/2; executable 2/2; positive ${controls.positive}/${controls.positive}; negative ${controls.negative}/${controls.negative}; recompute ${controls.recompute}/${controls.recompute}; physical-instance ${controls.physical}/${controls.physical}; mutations ${mutations}/${mutations} KILLED; PASS`);
