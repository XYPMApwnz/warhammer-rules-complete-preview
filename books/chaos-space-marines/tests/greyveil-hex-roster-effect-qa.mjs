import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const clone=value=>structuredClone(value);
const plain=value=>JSON.parse(JSON.stringify(value));
const scope={console,window:{},globalThis:null};scope.globalThis=scope;scope.window=scope;vm.createContext(scope);
for(const file of ['books/chaos-space-marines/scripts/roster-data.js','books/shared/effect-contract-runtime.js','books/shared/roster-context.js'])vm.runInContext(read(file),scope,{filename:file});
const baseline=scope.WH_BOOK_ROSTER_CATALOG;
const byId=(catalog,id)=>catalog.units.find(unit=>unit.id===id);
const contract=(catalog,id)=>catalog.effectContracts.find(item=>item.canonicalRecordId===id);
const selectionTitle=(unit,id)=>unit.gameSelections.selections.find(item=>item.id===id)?.title;
const rawFor=(catalog,unitId,instanceId)=>{const unit=byId(catalog,unitId),models=unit.gameSelections.models.map(model=>{const defaults=unit.gameSelections.wargearDefaults.find(item=>item.modelId===model.id)?.selections||[],wargear=defaults.map(item=>`${item.quantity===1?'':`${item.quantity}x `}${selectionTitle(unit,item.selectionId)}`).join(', ');return{quantity:model.min,name:model.aliases?.[0]||model.title,loadouts:[{quantity:model.min,wargear}]};});return{id:instanceId,canonicalUnitId:unit.id,name:unit.title,quantity:models.reduce((sum,item)=>sum+item.quantity,0),points:0,wargear:'',models,warlord:false};};
const enhancement=(catalog,owner)=>({input:{ownerStatus:'resolved',ownerUnitId:owner},catalog:catalog.enhancements.find(item=>item.id==='enhancement-greyveil-hex')});
const project=(catalog,units,{assigned=true,attachments={}}={})=>{scope.WH_BOOK_ROSTER_CATALOG=catalog;const roster={faction:'Chaos Space Marines',declared:0,calculated:0,unitLineTotal:0,detachments:[{id:'nightmare-hunt',name:'Nightmare Hunt'}],enhancements:[],warnings:[],units},enhancements=assigned?[enhancement(catalog,'lord')]:[];return scope.WHArmyRosterContext.project({catalog,roster,record:{id:'csm-greyveil',roster,attachments},provider:{gameEffects:context=>scope.WHEffectContractRuntime.project({...context,enhancements})}}).game;};
const stealth=unit=>unit.effective.abilities.find(item=>item.id==='core-stealth'&&item.sourceEffectId==='greyveil:stealth');
const restriction=unit=>unit.effective.targetingRestrictions?.find(item=>item.id==='enhancement-greyveil-hex-targeting-restriction');
const exactRestriction={id:'enhancement-greyveil-hex-targeting-restriction',attacker:'enemy',attackMode:'ranged',restriction:'cannot-target',maximumRange:18,distanceUnit:'inches',appliesWhen:{subject:'target-unit',relation:'within-range',object:'objective-marker',controller:'owner'},sourceEffectId:'greyveil-hex-ranged-targeting-restriction'};

const pack=JSON.parse(read('books/chaos-space-marines/content/chaos-space-marines-faction-pack.en.json'));
const source=pack.detachments.find(item=>item.id==='nightmare-hunt').enhancements.find(item=>item.id==='greyveil-hex');
assert.equal(source.text,'CHAOS LORD model only. Models in the bearer’s unit have the Stealth ability.\nWhile the bearer’s unit is within range of one or more objective markers you control, that unit can only be selected as the target of a ranged attack if the attacking model is within 18".','Greyveil Hex exact certified source wording');

const certify=catalog=>{
  const greyveil=contract(catalog,'enhancement-greyveil-hex'),operation=greyveil.clauses[0].operations.find(item=>item.id==='greyveil-hex-ranged-targeting-restriction');
  assert.equal(greyveil.scope,'owner-or-attached-group','Greyveil follows the bearer’s formed unit');
  assert.ok(greyveil.clauses[0].operations.some(item=>item.id==='greyveil:stealth'&&item.type==='ABILITY_GRANT'&&item.canonicalTarget==='core-stealth'),'existing Stealth operation remains unchanged');
  assert.deepEqual(plain(operation),{id:'greyveil-hex-ranged-targeting-restriction',canonicalTarget:'enhancement-greyveil-hex-targeting-restriction',parameters:{attacker:'enemy',attackMode:'ranged',restriction:'cannot-target',maximumRange:18,distanceUnit:'inches',appliesWhen:{subject:'target-unit',relation:'within-range',object:'objective-marker',controller:'owner'}},type:'TARGETING_RESTRICTION_GRANT'},'exact conditional 18-inch targeting restriction');
  assert.equal(greyveil.source.sourceId,'chaos-space-marines-faction-pack-v1.2','Greyveil accepted current factual owner');

  let positive=0,negative=0,detach=0,recompute=0,physical=0;
  const lord=rawFor(catalog,'unit-chaos-lord','lord'),body=rawFor(catalog,'unit-legionaries','body'),bodyCopy=rawFor(catalog,'unit-legionaries','body-copy'),lordCopy=rawFor(catalog,'unit-chaos-lord','lord-copy');
  let game=project(catalog,[clone(lord)],{}),owner=game.units[0];
  assert.ok(stealth(owner),'Enhancement present preserves Stealth');positive++;
  assert.deepEqual(plain(restriction(owner)),exactRestriction,'Enhancement present executes exact targeting restriction');positive++;
  game=project(catalog,[clone(lord)],{assigned:false});owner=game.units[0];
  assert.equal(stealth(owner),undefined,'Enhancement absent has no Enhancement-origin Stealth');negative++;
  assert.equal(restriction(owner),undefined,'Enhancement absent has no targeting restriction');negative++;

  game=project(catalog,[clone(lord),clone(body),clone(bodyCopy),clone(lordCopy)],{attachments:{body:['lord']}});owner=game.units[0];const attached=game.units[1],unrelated=game.units[2],duplicate=game.units[3];
  for(const unit of [owner,attached]){assert.ok(stealth(unit),'formed unit receives Stealth');positive++;assert.deepEqual(plain(restriction(unit)),exactRestriction,'formed unit receives exact 18-inch restriction');positive++;}
  for(const unit of [unrelated,duplicate]){assert.equal(stealth(unit),undefined,'unrelated or duplicate physical unit has no Greyveil Stealth');physical++;assert.equal(restriction(unit),undefined,'unrelated or duplicate physical unit has no Greyveil restriction');physical++;}

  game=project(catalog,[clone(lord),clone(body)]);owner=game.units[0];const detachedBody=game.units[1];
  assert.ok(stealth(owner),'detach retains Stealth on bearer');detach++;
  assert.deepEqual(plain(restriction(owner)),exactRestriction,'detach retains restriction on bearer');detach++;
  assert.equal(stealth(detachedBody),undefined,'detach removes Stealth from former Bodyguard');detach++;
  assert.equal(restriction(detachedBody),undefined,'detach removes restriction from former Bodyguard');detach++;
  game=project(catalog,[clone(lord),clone(body)],{attachments:{body:['lord']}});assert.ok(stealth(game.units[1]),'reattach restores Stealth');recompute++;assert.deepEqual(plain(restriction(game.units[1])),exactRestriction,'reattach restores exact restriction');recompute++;
  return{positive,negative,detach,recompute,physical};
};

const controls=certify(baseline);
assert.deepEqual(controls,{positive:6,negative:2,detach:4,recompute:2,physical:4},'focused control inventory');
let mutations=0;
const killed=(label,mutate)=>{const catalog=clone(baseline);mutate(catalog);assert.throws(()=>certify(catalog),undefined,`${label} mutation survived`);mutations++;};
killed('MISSING_TARGETING_RESTRICTION',catalog=>{contract(catalog,'enhancement-greyveil-hex').clauses[0].operations=contract(catalog,'enhancement-greyveil-hex').clauses[0].operations.filter(item=>item.id!=='greyveil-hex-ranged-targeting-restriction');});
killed('WRONG_RANGE_THRESHOLD',catalog=>{contract(catalog,'enhancement-greyveil-hex').clauses[0].operations.find(item=>item.id==='greyveil-hex-ranged-targeting-restriction').parameters.maximumRange=12;});
killed('WRONG_ATTACK_MODE',catalog=>{contract(catalog,'enhancement-greyveil-hex').clauses[0].operations.find(item=>item.id==='greyveil-hex-ranged-targeting-restriction').parameters.attackMode='melee';});
killed('WRONG_OBJECTIVE_CONDITION',catalog=>{contract(catalog,'enhancement-greyveil-hex').clauses[0].operations.find(item=>item.id==='greyveil-hex-ranged-targeting-restriction').parameters.appliesWhen.controller='opponent';});
killed('WRONG_UNIT_SCOPE',catalog=>{contract(catalog,'enhancement-greyveil-hex').scope='owner';});
killed('MISSING_STEALTH',catalog=>{contract(catalog,'enhancement-greyveil-hex').clauses[0].operations=contract(catalog,'enhancement-greyveil-hex').clauses[0].operations.filter(item=>item.id!=='greyveil:stealth');});
assert.equal(mutations,6,'source-backed mutation controls');
console.log(`CSM Greyveil Hex: fully executable; positive ${controls.positive}/${controls.positive}; negative ${controls.negative}/${controls.negative}; detach ${controls.detach}/${controls.detach}; recompute ${controls.recompute}/${controls.recompute}; physical-instance ${controls.physical}/${controls.physical}; mutations ${mutations}/${mutations} KILLED; PASS`);
