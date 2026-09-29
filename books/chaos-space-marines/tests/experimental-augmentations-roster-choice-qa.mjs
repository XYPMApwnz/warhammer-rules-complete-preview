import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const clone=value=>structuredClone(value),plain=value=>JSON.parse(JSON.stringify(value));
const scope={console,URL,URLSearchParams,location:{href:'http://localhost/books/chaos-space-marines/reader.html',pathname:'/books/chaos-space-marines/reader.html',search:''},document:{documentElement:{dataset:{bookId:'chaos-space-marines'}},querySelectorAll:()=>[],querySelector:()=>null},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},dispatchEvent(){},addEventListener(){}};
scope.window=scope;scope.globalThis=scope;vm.createContext(scope);
for(const file of ['books/shared/rule-facts.js','roster-guides/points-data.js','roster-guides/points-validator.js','books/chaos-space-marines/scripts/roster-data.js','books/shared/effect-contract-runtime.js','books/shared/roster-context.js'])vm.runInContext(read(file),scope,{filename:file});
const baseline=plain(scope.WH_BOOK_ROSTER_CATALOG),ruleId='chaos-space-marines-detachment-rule-experimental-augmentations';
const byId=(catalog,id)=>catalog.units.find(unit=>unit.id===id),contract=catalog=>catalog.effectContracts.find(item=>item.canonicalRecordId===ruleId);
const selectionTitle=(unit,id)=>unit.gameSelections.selections.find(item=>item.id===id)?.title;
const rawFor=(catalog,unitId,instanceId)=>{const unit=byId(catalog,unitId),models=unit.gameSelections.models.map(model=>{const defaults=unit.gameSelections.wargearDefaults.find(item=>item.modelId===model.id)?.selections||[],wargear=defaults.map(item=>`${item.quantity===1?'':`${item.quantity}x `}${selectionTitle(unit,item.selectionId)}`).join(', ');return{quantity:model.min,name:model.aliases?.[0]||model.title,loadouts:[{quantity:model.min,wargear}]};});return{id:instanceId,canonicalUnitId:unitId,name:unit.title,quantity:models.reduce((sum,item)=>sum+item.quantity,0),points:0,wargear:'',models,warlord:false};};
const choices=(...ids)=>({[ruleId]:ids.map(choiceId=>({choiceId}))});
const project=(catalog,units,choiceIds=[],detachment=true)=>{scope.WH_BOOK_ROSTER_CATALOG=catalog;const roster={faction:'Chaos Space Marines',declared:0,calculated:0,unitLineTotal:0,detachments:detachment?[{id:'creations-of-bile',name:'Creations of Bile'}]:[],enhancements:[],warnings:[],units};return scope.WHArmyRosterContext.project({catalog,roster,record:{id:'csm-experimental-augmentations',roster,effectChoices:choices(...choiceIds)},provider:{gameEffects:context=>scope.WHEffectContractRuntime.project(context)}}).game;};
const profile=(unit,mode)=>unit.effective.weaponProfiles.find(item=>item.mode===mode),effects=unit=>unit.effects.filter(item=>item.id.startsWith('experimental-augmentations:'));

const pack=JSON.parse(read('books/chaos-space-marines/content/chaos-space-marines-faction-pack.en.json')),source=pack.detachments.find(item=>item.id==='creations-of-bile').rule;
assert.match(source.text,/either select one from the list below, or randomly determine two by rolling two D6/,'exact source selection count and random alternative');
assert.match(source.text,/HERETIC ASTARTES INFANTRY models \(excluding DAMNED models\).*until the end of the battle/s,'exact source target, exclusion and duration');
const expectedOptions=[
  ['cholinergic-accelerants','Cholinergic Accelerants','weapon','melee','A',1],
  ['hyperadrenal-infusion','Hyperadrenal Infusion','stat',null,'M',2],
  ['paraneural-reactions','Paraneural Reactions','weapon','melee','WS',-1],
  ['supracutaneous-chitination','Supracutaneous Chitination','stat',null,'T',1],
  ['macrotensile-sinews','Macrotensile Sinews','weapon','melee','S',1],
  ['ophthalmic-enhancement','Ophthalmic Enhancement','weapon','ranged','BS',-1]
];
const c=contract(baseline);assert.deepEqual(c.rosterChoice,{kind:'option',count:1,required:true,options:expectedOptions.map(([id,title])=>({id,title}))},'six exact source choices and mandatory one-choice path');
assert.equal(c.scope,'unit');assert.deepEqual(c.selector,{allKeywords:['HERETIC ASTARTES','INFANTRY'],noneKeywords:['DAMNED']});

let positive=0,negative=0,recompute=0,physical=0,mutations=0;
const legionaries=rawFor(baseline,'unit-legionaries','legionaries'),copy=rawFor(baseline,'unit-legionaries','legionaries-copy'),damned=rawFor(baseline,'unit-cultist-mob','damned');
let game=project(baseline,[clone(legionaries)],[]),unit=game.units[0];assert.equal(effects(unit).length,0,'no choice produces no persistent augmentation');negative++;
const workflowInput={catalog:baseline,units:game.units,choices:{},sourceRuleId:ruleId,detachmentIds:['creations-of-bile']};
assert.equal(scope.WHArmyRosterContext.effectChoices.sanitize(workflowInput).state,'invalid','source-mandated choice is reported missing');negative++;
assert.equal(scope.WHArmyRosterContext.effectChoices.sanitize({...workflowInput,detachmentIds:['cult-of-the-arkifane']}).state,'ready','choice is not required outside its exact Detachment');negative++;
for(const [id,title,component,mode,field,delta] of expectedOptions){
  const selected=scope.WHArmyRosterContext.effectChoices.select({...workflowInput,choiceId:id});assert.equal(selected.changed,true,`${title} selectable`);assert.deepEqual(plain(selected.choices),choices(id));
  game=project(baseline,[clone(legionaries),clone(copy),clone(damned)],[id]);const first=game.units[0],second=game.units[1],excluded=game.units[2],effect=effects(first);
  assert.equal(effect.length,1,`${title} creates one exact persistent modifier`);assert.equal(effect[0].component,component);assert.equal(effect[0].targetId,mode||field);positive++;
  if(component==='stat')assert.notEqual(first.effective.stats[field],byId(baseline,'unit-legionaries').gameSelections.stats[field],`${title} changes only ${field}`);
  else {const changed=profile(first,mode),other=profile(first,mode==='melee'?'ranged':'melee');assert.notEqual(changed.values[field],profile(project(baseline,[clone(legionaries)],[]).units[0],mode).values[field],`${title} changes exact weapon characteristic`);assert.deepEqual(other.values,profile(project(baseline,[clone(legionaries)],[]).units[0],mode==='melee'?'ranged':'melee').values,`${title} leaves unrelated weapon mode unchanged`);negative++;}
  assert.equal(effects(second).length,1,'duplicate eligible physical unit resolves independently');physical++;
  assert.equal(effects(excluded).length,0,'DAMNED physical unit remains excluded');physical++;
  assert.equal(effect[0].delta,delta,`${title} exact modifier`);
}
const invalid=scope.WHArmyRosterContext.effectChoices.sanitize({...workflowInput,choices:choices('invalid-option')});assert.equal(invalid.state,'invalid');assert.equal(invalid.rejected[0].reason,'unknown-option');negative++;
game=project(baseline,[clone(legionaries)],['cholinergic-accelerants','hyperadrenal-infusion']);assert.equal(effects(game.units[0]).length,0,'multiple manual choices rejected by runtime');negative++;
const picked=scope.WHArmyRosterContext.effectChoices.select({...workflowInput,choiceId:'hyperadrenal-infusion'}),removed=scope.WHArmyRosterContext.effectChoices.deselect({...workflowInput,choices:picked.choices});assert.equal(removed.changed,true);assert.equal(removed.state,'invalid','removing mandatory choice restores missing-choice state');
game=project(baseline,[clone(legionaries)],['hyperadrenal-infusion']);assert.equal(game.units[0].effective.stats.M,'8"','Move choice applies exact +2 inches');recompute++;
game=project(baseline,[clone(legionaries)],['supracutaneous-chitination']);assert.equal(game.units[0].effective.stats.M,'6"');assert.equal(game.units[0].effective.stats.T,'5','changing choice recomputes from canonical base');recompute+=2;
game=project(baseline,[clone(legionaries)],[],false);assert.equal(effects(game.units[0]).length,0,'removing detachment removes augmentation');recompute++;
assert.deepEqual(byId(baseline,'unit-legionaries').gameSelections.stats,{M:'6"',T:'4',Sv:'3+',W:'2',Ld:'6+',OC:'2',Invulnerable:'',Base:'32mm'},'canonical base stats unchanged');negative++;

const certify=catalog=>{const current=contract(catalog);assert.deepEqual(current.rosterChoice.options.map(item=>item.id),expectedOptions.map(item=>item[0]));assert.deepEqual(current.selector,{allKeywords:['HERETIC ASTARTES','INFANTRY'],noneKeywords:['DAMNED']});for(const [id,,,mode,field,delta] of expectedOptions){const game=project(catalog,[rawFor(catalog,'unit-legionaries','legionaries'),rawFor(catalog,'unit-cultist-mob','damned')],[id]),effect=effects(game.units[0]);assert.equal(effect.length,1);assert.equal(effect[0].delta,delta);assert.equal(effect[0].targetId,mode||field);assert.equal(effects(game.units[1]).length,0);}};
const killed=(label,mutate)=>{const catalog=clone(baseline);mutate(contract(catalog));assert.throws(()=>certify(catalog),undefined,`${label} mutation survived`);mutations++;};
killed('MISSING_CHOICE',value=>value.rosterChoice.options.pop());
killed('WRONG_SELECTION_COUNT',value=>value.rosterChoice.count=2);
killed('WRONG_SELECTOR',value=>value.selector.noneKeywords=[]);
killed('WRONG_STAT_TARGET',value=>value.clauses.find(item=>item.conditions[0]?.choiceId==='hyperadrenal-infusion').operations[0].canonicalTarget='T');
killed('WRONG_WEAPON_MODE',value=>value.clauses.find(item=>item.conditions[0]?.choiceId==='ophthalmic-enhancement').operations[0].canonicalTarget='melee');
killed('WRONG_MODIFIER',value=>value.clauses.find(item=>item.conditions[0]?.choiceId==='cholinergic-accelerants').operations[0].parameters.delta=2);
assert.equal(mutations,6);
console.log(`CSM Experimental Augmentations QA: 6/6 choices executable; positive ${positive}/${positive}; negative ${negative}/${negative}; recompute ${recompute}/${recompute}; physical-instance ${physical}/${physical}; mutations ${mutations}/6 KILLED; PASS`);
