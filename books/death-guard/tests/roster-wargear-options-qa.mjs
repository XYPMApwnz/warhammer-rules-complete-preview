import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createCanonicalBuildContext} from '../../shared/tools/canonical-build-contract.mjs';
import {assertRosterUnitGameplayProjection} from '../../shared/tools/build-roster-catalog.mjs';
import {buildDeathGuardEffectiveModelInput} from '../tools/canonical-source-adapter.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..'),read=relative=>fs.readFileSync(path.join(root,relative),'utf8'),plain=value=>JSON.parse(JSON.stringify(value)),clone=value=>structuredClone(value);
const config=JSON.parse(read('books/death-guard/book.config.json')),context=createCanonicalBuildContext({repoRoot:root,configPath:path.join(root,'books/death-guard/book.config.json'),config}),model=await buildDeathGuardEffectiveModelInput(context);
const scope={window:{},URL,URLSearchParams};vm.runInNewContext(read('books/death-guard/scripts/roster-data.js'),scope);vm.runInNewContext(read('books/shared/roster-context.js'),scope);
const catalog=scope.window.WH_BOOK_ROSTER_CATALOG,api=scope.window.WHArmyRosterContext,byUnit=new Map(catalog.units.map(unit=>[unit.id,unit]));
const corpus=JSON.parse(read('books/death-guard/sources/waha-11e-current-2026-09-25/corpus.json')),sourceIds=new Set(corpus.datasheets.flatMap(unit=>(unit.wargearOptions||[]).map(option=>option.sourceId))),projectedIds=catalog.units.flatMap(unit=>unit.gameSelections.wargearOptionContracts||[]).map(option=>option.sourceId);
assert.equal(sourceIds.size,43,'certified source Wargear Option denominator');assert.equal(projectedIds.length,43,'projected Wargear Option denominator');assert.deepEqual(new Set(projectedIds),sourceIds,'source-to-runtime Wargear Option identities');

const selectionTitle=(unit,id)=>{const selection=unit.gameSelections.selections.find(item=>item.id===id);assert.ok(selection,`${unit.id}: unknown fixture selection ${id}`);return selection.title;};
const countsFor=(unit,option,minimumEligible=1)=>{
  const counts=new Map(unit.gameSelections.models.map(model=>[model.id,Number(model.min)])),target=option.when?.unitModelCountEquals||option.limit?.perModels?.models||[...counts.values()].reduce((sum,value)=>sum+value,0),eligible=unit.gameSelections.models.find(model=>option.eligibleModelIds.includes(model.id));
  if((counts.get(eligible.id)||0)<minimumEligible)counts.set(eligible.id,minimumEligible);
  let total=[...counts.values()].reduce((sum,value)=>sum+value,0);
  for(const model of [...unit.gameSelections.models].reverse())while(total<target&&counts.get(model.id)<Number(model.max)){counts.set(model.id,counts.get(model.id)+1);total++;}
  assert.equal(total,target,`${option.sourceId}: fixture composition target`);return counts;
};
const changedMap=(base,choice)=>{const result=new Map(base);for(const item of choice.remove||[]){const next=(result.get(item.selectionId)||0)-item.quantity;if(next>0)result.set(item.selectionId,next);else result.delete(item.selectionId);}for(const item of choice.add||[])result.set(item.selectionId,(result.get(item.selectionId)||0)+item.quantity);return result;};
const rawFor=(unit,applications=[],counts=null,id='dg-wargear-unit')=>{
  const seed=applications[0]?.option||unit.gameSelections.wargearOptionContracts[0],modelCounts=counts||countsFor(unit,seed),defaults=new Map(unit.gameSelections.wargearDefaults.map(item=>[item.modelId,new Map(item.selections.map(selection=>[selection.selectionId,selection.quantity]))])),models=[];
  for(const model of unit.gameSelections.models){const quantity=modelCounts.get(model.id)||0,individuals=Array.from({length:quantity},()=>new Map(defaults.get(model.id)));for(const application of applications.filter(item=>item.modelId===model.id)){const index=application.index||0;individuals[index]=application.map?new Map(application.map):changedMap(individuals[index],application.option.choices[application.choice||0]);}const groups=new Map();for(const equipment of individuals){const key=JSON.stringify([...equipment].sort(([a],[b])=>a.localeCompare(b))),entry=groups.get(key)||{quantity:0,equipment};entry.quantity++;groups.set(key,entry);}for(const group of groups.values()){const wargear=[...group.equipment].filter(([,amount])=>amount>0).map(([selectionId,amount])=>`${amount===1?'':`${amount}x `}${selectionTitle(unit,selectionId)}`).join(', ');models.push({quantity:group.quantity,name:model.title,loadouts:[{quantity:group.quantity,wargear}]});}}
  return{id,canonicalUnitId:unit.id,name:unit.title,quantity:[...modelCounts.values()].reduce((sum,value)=>sum+value,0),points:0,wargear:'',models,warlord:null};
};
const project=units=>api.project({catalog,roster:{faction:'Death Guard',declared:0,calculated:0,unitLineTotal:0,detachments:[],enhancements:[],warnings:[],units},record:{id:'dg-wargear',attachments:{}},provider:{gameEffects:()=>[]}}).game;
const accepted=(raw,label)=>{const game=project([raw]);assert.equal(game.status,'ready',label);assert.equal(game.units[0].selection.loadout.state,'resolved',label);return game.units[0];};
const rejected=(raw,label)=>{const game=project([raw]);assert.equal(game.status,'invalid',label);assert.equal(game.units[0].selection.loadout.state,'invalid',label);return game.units[0];};

let positive=0;
for(const unit of catalog.units)for(const option of unit.gameSelections.wargearOptionContracts||[]){const modelId=option.eligibleModelIds.find(id=>(countsFor(unit,option).get(id)||0)>0);accepted(rawFor(unit,[{option,modelId}],countsFor(unit,option),`positive-${positive}`),`${option.sourceId}: legal source option`);positive++;}
assert.equal(positive,43,'all source option records execute');

const plague=byUnit.get('unit-plague-marines'),pm3=plague.gameSelections.wargearOptionContracts.find(item=>item.sourceId.endsWith(':3')),pm6=plague.gameSelections.wargearOptionContracts.find(item=>item.sourceId.endsWith(':6')),marineId=pm3.eligibleModelIds[0],championId=plague.gameSelections.models.find(item=>item.id!==marineId).id,pmCounts=countsFor(plague,pm3);
const illegalReplacement=rawFor(plague,[],pmCounts,'illegal-replacement'),illegalMarine=illegalReplacement.models.find(item=>item.name==='Plague Marine'),blight=selectionTitle(plague,pm3.choices[0].add[0].selectionId);illegalMarine.loadouts[0].wargear+=`, ${blight}`;rejected(illegalReplacement,'replacement target without consuming source');
rejected(rawFor(plague,[{option:pm3,modelId:marineId,index:0},{option:pm3,modelId:marineId,index:1}],pmCounts,'per-unit-cap'),'per-unit cap');
rejected(rawFor(plague,[{option:pm3,modelId:championId}],pmCounts,'wrong-model'),'wrong model scope');
accepted(rawFor(plague,[{option:pm6,modelId:marineId,index:0},{option:pm6,modelId:marineId,index:1}],countsFor(plague,pm6,2),'valid-multi'),'valid multi-model selection');

const landRaider=byUnit.get('unit-chaos-land-raider'),lr1=landRaider.gameSelections.wargearOptionContracts[0],lrModel=lr1.eligibleModelIds[0],lrCounts=countsFor(landRaider,lr1);
const exclusiveBase=new Map(landRaider.gameSelections.wargearDefaults[0].selections.map(item=>[item.selectionId,item.quantity]));for(const choice of lr1.choices)for(const item of choice.add)exclusiveBase.set(item.selectionId,item.quantity);rejected(rawFor(landRaider,[{option:lr1,modelId:lrModel,map:exclusiveBase}],lrCounts,'exclusive'),'mutually exclusive branches');
const doubled=changedMap(new Map(landRaider.gameSelections.wargearDefaults[0].selections.map(item=>[item.selectionId,item.quantity])),lr1.choices[0]);for(const item of lr1.choices[0].add)doubled.set(item.selectionId,(doubled.get(item.selectionId)||0)+item.quantity);rejected(rawFor(landRaider,[{option:lr1,modelId:lrModel,map:doubled}],lrCounts,'per-model-cap'),'per-model cap');

const duplicateA=rawFor(plague,[{option:pm6,modelId:marineId,index:0}],countsFor(plague,pm6),'duplicate-a'),duplicateB=rawFor(plague,[],countsFor(plague,pm6),'duplicate-b'),duplicate=project([duplicateA,duplicateB]);assert.equal(duplicate.status,'ready');assert.equal(duplicate.units[0].selection.loadout.selectedProfileIds.includes(pm6.choices[0].add[0].selectionId),false);assert.notDeepEqual(plain(duplicate.units[0].selection.loadout.selectedProfileIds),plain(duplicate.units[1].selection.loadout.selectedProfileIds),'duplicate physical unit selections remain isolated');assert.notEqual(duplicate.units[0].selection.loadout,duplicate.units[1].selection.loadout,'duplicate physical loadout objects remain isolated');
const recomputed=project(clone([duplicateA,duplicateB]));assert.deepEqual(plain(recomputed),plain(duplicate),'reload/recompute preserves legal selections');

const certify=value=>assertRosterUnitGameplayProjection(model.units,model.relationGraphs,value.units,{label:'Death Guard wargear-option mutation certification',enforceCompositionConstraints:true});certify(catalog);let mutations=0;
const killed=(label,mutate)=>{const poisoned=clone(catalog);mutate(poisoned);assert.throws(()=>certify(poisoned),undefined,`${label} mutation survived`);mutations++;};
killed('REMOVED_QUANTITY_LIMIT',value=>{delete value.units.find(unit=>unit.id==='unit-plague-marines').gameSelections.wargearOptionContracts.find(item=>item.sourceId.endsWith(':3')).limit.perModels;});
killed('WRONG_MODEL_SCOPE',value=>{value.units.find(unit=>unit.id==='unit-plague-marines').gameSelections.wargearOptionContracts.find(item=>item.sourceId.endsWith(':3')).eligibleModelIds=[championId];});
killed('WRONG_REPLACEMENT_TARGET',value=>{value.units.find(unit=>unit.id==='unit-plague-marines').gameSelections.wargearOptionContracts.find(item=>item.sourceId.endsWith(':3')).choices[0].add[0].selectionId='unit-plague-marines-selection-bolt-pistol';});
killed('REMOVED_EXCLUSIVITY',value=>{const option=value.units.find(unit=>unit.id==='unit-chaos-land-raider').gameSelections.wargearOptionContracts[0];option.choices=[{remove:[],add:option.choices.flatMap(choice=>choice.add),requiresFinal:[],forbidsFinal:[],sharedUses:[]}];});
assert.equal(mutations,4,'source-backed mutation inventory');
console.log('Death Guard roster Wargear Option QA: 43/43 executable; positive 43/43; negative 6/6; physical-instance 3/3; recompute 1/1; mutations 4/4 KILLED; PASS');
