import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const plain=value=>JSON.parse(JSON.stringify(value));
const clone=value=>structuredClone(value);
const scope={console};scope.window=scope;scope.globalThis=scope;vm.createContext(scope);
for(const file of ['books/chaos-space-marines/scripts/roster-data.js','books/shared/effect-contract-runtime.js','books/shared/roster-context.js'])vm.runInContext(read(file),scope,{filename:file});

const baseline=plain(scope.WH_BOOK_ROSTER_CATALOG),unitId='unit-traitor-enforcer',enforcerModelId='unit-traitor-enforcer-model-8a65f1f14b',ogrynModelId='unit-traitor-enforcer-model-e85cc6b611',abilityId='chaos-space-marines-ability-mutated-bodyguard',fnpId='core-feel-no-pain';
const byId=(catalog,id)=>catalog.units.find(unit=>unit.id===id);
const source=JSON.parse(read('books/chaos-space-marines/content/chaos-space-marines-codex-datasheets.en.json')).datasheets.find(unit=>unit.id===unitId);
assert.equal(source.abilities.find(ability=>ability.sourceAbilityId==='3a6a-659b-9b4f-9935')?.text,'While this unit contains a Traitor Ogryn model, CHARACTER models in this unit have the Feel No Pain 4+ ability.','exact certified Mutated Bodyguard source');

const rawFor=(catalog,id,{ogryn=true,instanceId='traitor-enforcer'}={})=>{const unit=byId(catalog,id),models=unit.gameSelections.models.filter(model=>ogryn||model.id!==ogrynModelId).map(model=>({quantity:Number(model.min),name:model.title,wargear:'',loadouts:[]}));return{id:instanceId,canonicalUnitId:id,name:unit.title,quantity:models.reduce((sum,item)=>sum+item.quantity,0),points:0,wargear:'',models,warlord:null};};
const project=(catalog,units,attachments={})=>{scope.WH_BOOK_ROSTER_CATALOG=catalog;const roster={faction:'Chaos Space Marines',pointsLimit:2000,detachments:[],enhancements:[],units,warnings:[]};return scope.WHArmyRosterContext.project({catalog,roster,record:{id:'csm-mutated-bodyguard',attachments,roster},provider:{gameEffects:context=>scope.WHEffectContractRuntime.project(context)}}).game;};
const physicalAbilities=unit=>plain(unit.effective.physicalModelAbilities||[]);
const fnpFor=(unit,modelId)=>physicalAbilities(unit).find(model=>model.canonicalModelId===modelId)?.abilities.find(ability=>ability.id===fnpId)||null;

const certify=catalog=>{
  const canonical=byId(catalog,unitId),contract=catalog.effectContracts.find(item=>item.canonicalRecordId===abilityId);
  assert.ok(contract,'Mutated Bodyguard structured contract');
  assert.deepEqual(contract.clauses[0].conditions[0].selector.physicalComposition.contains,[{modelId:ogrynModelId,minQuantity:1}],'canonical Traitor Ogryn composition predicate');
  assert.deepEqual(contract.clauses[0].operations[0].parameters.physicalModelSelector,{allKeywords:['CHARACTER']},'physical CHARACTER model selector');
  assert.equal(contract.clauses[0].operations[0].parameters.value,'4+','exact FNP value');
  assert.equal(canonical.gameSelections.abilities.some(ability=>ability.id===fnpId),false,'canonical base abilities contain no FNP');

  let positive=0,negative=0,recompute=0,physical=0;
  const complete=rawFor(catalog,unitId),without=rawFor(catalog,unitId,{ogryn:false,instanceId:'without-ogryn'}),unrelated=rawFor(catalog,'unit-cultist-mob',{instanceId:'unrelated'});
  let game=project(catalog,[complete]),unit=game.units[0],effect=unit.effects.find(item=>item.id==='mutated-bodyguard-character-feel-no-pain');
  assert.ok(effect,'composition-triggered effect executes');
  assert.equal(effect.targets.length,1,'only one physical CHARACTER model targeted');
  assert.equal(effect.targets[0].canonicalModelId,enforcerModelId,'Traitor Enforcer physical model targeted');
  assert.equal(fnpFor(unit,enforcerModelId)?.title,'Feel No Pain 4+','Traitor Enforcer gains FNP 4+');positive+=2;
  assert.equal(fnpFor(unit,ogrynModelId),null,'Traitor Ogryn does not receive CHARACTER-only grant');
  assert.equal(unit.effective.abilities.some(ability=>ability.id===fnpId),false,'grant is not flattened to unit ability state');negative+=2;

  game=project(catalog,[without]);unit=game.units[0];
  assert.equal(fnpFor(unit,enforcerModelId),null,'without Traitor Ogryn no FNP grant');
  assert.equal(unit.effects.some(item=>item.id==='mutated-bodyguard-character-feel-no-pain'),false,'condition false emits no effect');negative+=2;

  game=project(catalog,[complete,unrelated]);const owner=game.units.find(item=>item.identity.instanceId==='traitor-enforcer'),other=game.units.find(item=>item.identity.instanceId==='unrelated');
  assert.ok(fnpFor(owner,enforcerModelId),'owning physical unit receives FNP');
  assert.equal((other.effective.physicalModelAbilities||[]).length,0,'unrelated physical unit unaffected');physical+=2;

  const duplicate=rawFor(catalog,unitId,{ogryn:false,instanceId:'traitor-enforcer-copy'});game=project(catalog,[complete,duplicate]);
  assert.ok(fnpFor(game.units[0],enforcerModelId),'complete physical instance receives FNP');
  assert.equal(fnpFor(game.units[1],enforcerModelId),null,'duplicate canonical instance remains isolated');physical+=2;

  const guardsmen=rawFor(catalog,'unit-traitor-guardsmen-squad',{instanceId:'guardsmen'});game=project(catalog,[complete,guardsmen],{guardsmen:['traitor-enforcer']});
  assert.ok(fnpFor(game.units.find(item=>item.identity.instanceId==='traitor-enforcer'),enforcerModelId),'formed-unit source Character receives FNP');
  assert.equal((game.units.find(item=>item.identity.instanceId==='guardsmen').effective.physicalModelAbilities||[]).length,0,'non-CHARACTER Bodyguard models receive no grant');positive++;negative++;

  const again=project(catalog,[clone(complete)]).units[0];assert.deepEqual(physicalAbilities(again),physicalAbilities(project(catalog,[clone(complete)]).units[0]),'reload/recompute preserves correct state');recompute++;
  assert.equal(fnpFor(project(catalog,[clone(without)]).units[0],enforcerModelId),null,'removing Ogryn recomputes away FNP');recompute++;
  assert.ok(fnpFor(project(catalog,[clone(complete)]).units[0],enforcerModelId),'adding Ogryn recomputes FNP');recompute++;
  assert.deepEqual(plain(canonical.gameSelections.abilities),plain(byId(baseline,unitId).gameSelections.abilities),'canonical base abilities remain unchanged');negative++;
  return{positive,negative,recompute,physical};
};

const controls=certify(baseline);assert.deepEqual(controls,{positive:3,negative:6,recompute:3,physical:4},'focused control inventory');
let mutations=0;const killed=(label,mutate)=>{const catalog=clone(baseline),contract=catalog.effectContracts.find(item=>item.canonicalRecordId===abilityId);mutate(contract);assert.throws(()=>certify(catalog),undefined,`${label} mutation survived`);mutations++;};
killed('MISSING_OGRYN_CONDITION',contract=>{contract.clauses[0].conditions=[];});
killed('WRONG_COMPOSITION_ID',contract=>{contract.clauses[0].conditions[0].selector.physicalComposition.contains[0].modelId=enforcerModelId;});
killed('WRONG_MODEL_ROLE',contract=>{contract.clauses[0].operations[0].parameters.physicalModelSelector.allKeywords=['INFANTRY'];});
killed('WRONG_FNP_VALUE',contract=>{contract.clauses[0].operations[0].parameters.value='5+';});
killed('FLATTEN_TO_UNIT',contract=>{delete contract.clauses[0].operations[0].parameters.physicalModelSelector;});
assert.equal(mutations,5,'Mutated Bodyguard mutation controls');
console.log(`CSM Mutated Bodyguard QA passed: positive ${controls.positive}/${controls.positive}; negative ${controls.negative}/${controls.negative}; recompute ${controls.recompute}/${controls.recompute}; physical-instance ${controls.physical}/${controls.physical}; mutations ${mutations}/${mutations} KILLED.`);
