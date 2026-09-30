import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..'),read=relative=>fs.readFileSync(path.join(root,relative),'utf8'),plain=value=>JSON.parse(JSON.stringify(value)),clone=value=>structuredClone(value);
const scope={console,URL,URLSearchParams,location:{href:'http://localhost/books/chaos-space-marines/reader.html',pathname:'/books/chaos-space-marines/reader.html',search:''},document:{documentElement:{dataset:{bookId:'chaos-space-marines'}},querySelectorAll:()=>[],querySelector:()=>null},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},dispatchEvent(){},addEventListener(){}};
scope.window=scope;scope.globalThis=scope;vm.createContext(scope);
for(const file of ['books/chaos-space-marines/scripts/roster-data.js','books/shared/effect-contract-runtime.js','books/shared/roster-context.js'])vm.runInContext(read(file),scope,{filename:file});

const baseline=plain(scope.WH_BOOK_ROSTER_CATALOG),ruleId='chaos-space-marines-ability-daemonic-allegiance';
const unitIds=['unit-heretic-astartes-daemon-prince','unit-heretic-astartes-daemon-prince-with-wings'];
const choices=[
  ['khorne','KHORNE'],['tzeentch','TZEENTCH'],['nurgle','NURGLE'],['slaanesh','SLAANESH']
];
const byId=(catalog,id)=>catalog.units.find(unit=>unit.id===id),contracts=catalog=>catalog.effectContracts.filter(item=>item.canonicalRecordId===ruleId);
const selectionTitle=(unit,id)=>unit.gameSelections.selections.find(item=>item.id===id)?.title;
const rawFor=(catalog,unitId,instanceId)=>{const unit=byId(catalog,unitId),models=unit.gameSelections.models.map(model=>{let defaults=unit.gameSelections.wargearDefaults.find(item=>item.modelId===model.id)?.selections||[];if(!defaults.length)defaults=[unit.gameSelections.selections.find(item=>item.familyId),unit.gameSelections.selections.find(item=>item.title==='Infernal cannon')].filter(Boolean).map(item=>({selectionId:item.id,quantity:1}));const wargear=defaults.map(item=>`${item.quantity===1?'':`${item.quantity}x `}${selectionTitle(unit,item.selectionId)}`).join(', ');return{quantity:model.min,name:model.aliases?.[0]||model.title,loadouts:[{quantity:model.min,wargear}]};});return{id:instanceId,canonicalUnitId:unitId,name:unit.title,quantity:1,points:0,wargear:models[0]?.loadouts[0]?.wargear||'',models,warlord:false};};
const effectChoices=(...rows)=>({[ruleId]:rows.map(([ownerInstanceId,choiceId])=>({ownerInstanceId,choiceId}))});
const project=(catalog,units,rows=[])=>{scope.WH_BOOK_ROSTER_CATALOG=catalog;const roster={faction:'Chaos Space Marines',declared:0,calculated:0,unitLineTotal:0,detachments:[],enhancements:[],warnings:[],units};return scope.WHArmyRosterContext.project({catalog,roster,record:{id:'csm-daemonic-allegiance',roster,effectChoices:effectChoices(...rows)},provider:{gameEffects:context=>scope.WHEffectContractRuntime.project(context)}});};
const effects=unit=>unit.effects.filter(item=>item.id.startsWith('daemonic-allegiance:')),profile=(unit,id)=>unit.effective.weaponProfiles.find(item=>item.id===id),weaponValue=(item,stat)=>item.values?.[stat]??item[stat.toLowerCase()],keywords=unit=>unit.effective.keywords;
const source=JSON.parse(read('books/chaos-space-marines/content/chaos-space-marines-codex-datasheets.en.json')).datasheets.filter(item=>unitIds.includes(item.id));
assert.equal(source.length,2,'both certified datasheets present');
for(const unit of source){const ability=unit.abilities.find(item=>item.title==='Daemonic Allegiance');assert.ok(ability,'shared canonical Daemonic Allegiance ability');assert.match(ability.text,/must select one of the keywords below/);assert.match(ability.text,/Khorne: Add 2 to the Strength/);assert.match(ability.text,/Tzeentch: Add 3 to the Attacks/);assert.match(ability.text,/Nurgle: Add 1 to its Toughness/);assert.match(ability.text,/Slaanesh: Add 2" to its Move/);}

const certify=catalog=>{
  const current=contracts(catalog);assert.equal(current.length,2,'two exact source-scoped contracts');
  assert.deepEqual(current.map(item=>item.sourceUnitId).sort(),[...unitIds].sort());
  for(const contract of current){assert.equal(contract.rosterChoice.ownerScoped,true);assert.equal(contract.rosterChoice.required,true);assert.equal(contract.rosterChoice.count,1);assert.deepEqual(contract.rosterChoice.options.map(item=>item.id),choices.map(item=>item[0]));}
  let positive=0,negative=0,recompute=0,physical=0;
  for(const unitId of unitIds){
    const instance='prince',raw=rawFor(catalog,unitId,instance),base=byId(catalog,unitId),familyId=`${unitId}-weapon-family-hellforged-weapons`,family=base.gameSelections.weaponFamilies.find(item=>item.id===familyId),infernalId=`${unitId}-profile-4c4589e7bd`;
    assert.ok(family&&family.profileIds.length===2,'exact hellforged family identity');
    for(const [choice,keyword] of choices){
      const projection=project(catalog,[clone(raw)],[[instance,choice]]),unit=projection.game.units[0];
      assert.equal(projection.effectChoiceState.state,'ready',`${choice} exact physical choice accepted`);assert.equal(projection.game.status,'ready');assert.ok(keywords(unit).includes(keyword),`${choice} exact keyword grant`);positive+=3;
      for(const [other,otherKeyword] of choices)if(other!==choice){assert.ok(!keywords(unit).includes(otherKeyword),`${choice} excludes ${other}`);negative++;}
      if(choice==='khorne'){for(const id of family.profileIds)assert.equal(Number(weaponValue(profile(unit,id),'S')),Number(weaponValue(base.gameSelections.weaponProfiles.find(item=>item.id===id),'S'))+2,'Khorne exact hellforged +2 S');assert.equal(weaponValue(profile(unit,infernalId),'A'),weaponValue(base.gameSelections.weaponProfiles.find(item=>item.id===infernalId),'A'),'Khorne leaves infernal A unchanged');positive+=2;negative++;}
      if(choice==='tzeentch'){assert.equal(Number(weaponValue(profile(unit,infernalId),'A')),Number(weaponValue(base.gameSelections.weaponProfiles.find(item=>item.id===infernalId),'A'))+3,'Tzeentch exact infernal +3 A');for(const id of family.profileIds)assert.equal(weaponValue(profile(unit,id),'S'),weaponValue(base.gameSelections.weaponProfiles.find(item=>item.id===id),'S'),'Tzeentch leaves hellforged S unchanged');positive++;negative+=2;}
      if(choice==='nurgle'){assert.equal(Number(unit.effective.stats.T),Number(base.gameSelections.stats.T)+1,'Nurgle exact +1 T');assert.equal(unit.effective.stats.M,base.gameSelections.stats.M,'Nurgle leaves M unchanged');positive++;negative++;}
      if(choice==='slaanesh'){assert.equal(Number.parseInt(unit.effective.stats.M,10),Number.parseInt(base.gameSelections.stats.M,10)+2,'Slaanesh exact +2 M');assert.equal(unit.effective.stats.T,base.gameSelections.stats.T,'Slaanesh leaves T unchanged');positive++;negative++;}
    }
    const missing=project(catalog,[clone(raw)],[]);assert.equal(missing.effectChoiceState.state,'invalid');assert.equal(missing.effectChoiceState.rejected[0].reason,'choice-required');assert.equal(missing.game.status,'invalid');assert.equal(effects(missing.game.units[0]).filter(item=>item.component!=='ability').length,0,'missing mandatory choice grants no effects');negative+=4;
    const invalid=project(catalog,[clone(raw)],[[instance,'invalid']]);assert.equal(invalid.effectChoiceState.rejected[0].reason,'unknown-option');assert.equal(invalid.game.status,'invalid');negative+=2;
    const duplicate=project(catalog,[clone(raw)],[[instance,'khorne'],[instance,'nurgle']]);assert.equal(duplicate.effectChoiceState.rejected[0].reason,'duplicate-physical-instance');assert.equal(effects(duplicate.game.units[0]).filter(item=>item.component!=='ability').length,0,'illegal multiple choice fails closed');negative+=2;
  }
  const ground=rawFor(catalog,unitIds[0],'ground'),wings=rawFor(catalog,unitIds[1],'wings'),copy=rawFor(catalog,unitIds[0],'ground-copy');
  let projection=project(catalog,[clone(ground),clone(wings),clone(copy)],[['ground','nurgle'],['wings','slaanesh'],['ground-copy','tzeentch']]);
  assert.equal(projection.effectChoiceState.state,'ready');assert.ok(keywords(projection.game.units[0]).includes('NURGLE'));assert.ok(keywords(projection.game.units[1]).includes('SLAANESH'));assert.ok(keywords(projection.game.units[2]).includes('TZEENTCH'));assert.ok(!keywords(projection.game.units[2]).includes('NURGLE'));physical+=5;
  const workflow={catalog,units:[...projection.game.units],choices:effectChoices(['ground','nurgle'],['wings','slaanesh'],['ground-copy','tzeentch']),sourceRuleId:ruleId,ownerInstanceId:'ground'};
  const changed=scope.WHArmyRosterContext.effectChoices.select({...workflow,choiceId:'khorne'});assert.equal(changed.changed,true);assert.equal(changed.choices[ruleId].find(item=>item.ownerInstanceId==='ground').choiceId,'khorne');assert.equal(changed.choices[ruleId].find(item=>item.ownerInstanceId==='wings').choiceId,'slaanesh');recompute+=3;
  projection=project(catalog,[clone(ground),clone(wings),clone(copy)],changed.choices[ruleId].map(item=>[item.ownerInstanceId,item.choiceId]));assert.ok(keywords(projection.game.units[0]).includes('KHORNE'));assert.ok(!keywords(projection.game.units[0]).includes('NURGLE'));assert.ok(keywords(projection.game.units[1]).includes('SLAANESH'));recompute+=3;
  const removed=scope.WHArmyRosterContext.effectChoices.deselect({...workflow,choices:changed.choices});assert.equal(removed.changed,true);assert.equal(removed.state,'invalid');assert.ok(removed.rejected.some(item=>item.ownerInstanceId==='ground'&&item.reason==='choice-required'));recompute+=3;
  for(const unitId of unitIds){const canonical=byId(catalog,unitId),base=byId(baseline,unitId);assert.deepEqual(canonical.gameSelections.stats,base.gameSelections.stats,'canonical base stats unchanged');assert.deepEqual(canonical.gameSelections.weaponProfiles,base.gameSelections.weaponProfiles,'canonical base weapons unchanged');negative+=2;}
  return{positive,negative,recompute,physical};
};
const controls=certify(baseline);
let mutations=0;const killed=(label,mutate)=>{const catalog=clone(baseline),current=contracts(catalog);mutate(current,catalog);assert.throws(()=>certify(catalog),undefined,`${label} mutation survived`);mutations++;};
killed('MISSING_OWNER_SCOPE',current=>delete current[0].rosterChoice.ownerScoped);
killed('OPTION_NOT_REQUIRED',current=>current[0].rosterChoice.required=false);
killed('MISSING_ALLEGIANCE',current=>current[0].rosterChoice.options.pop());
killed('WRONG_KEYWORD',current=>current[0].clauses.find(item=>item.conditions[0]?.choiceId==='nurgle'&&item.operations[0]?.type==='KEYWORD_GRANT').operations[0].canonicalTarget='KHORNE');
killed('WRONG_STAT_MODIFIER',current=>current[0].clauses.find(item=>item.conditions[0]?.choiceId==='nurgle'&&item.operations[0]?.type==='CHARACTERISTIC_ADD').operations[0].parameters.delta=2);
killed('WRONG_WEAPON_FAMILY',current=>current[0].clauses.find(item=>item.conditions[0]?.choiceId==='khorne'&&item.operations[0]?.type==='WEAPON_CHARACTERISTIC_ADD').operations[0].canonicalTarget.id='missing-family');
killed('WRONG_WEAPON_MODIFIER',current=>current[1].clauses.find(item=>item.conditions[0]?.choiceId==='tzeentch'&&item.operations[0]?.type==='WEAPON_CHARACTERISTIC_ADD').operations[0].parameters.delta=2);
assert.equal(mutations,7);
console.log(`CSM Daemonic Allegiance QA: datasheets 2/2; choices 4/4; keyword grants 4/4; stat modifiers 2/2; weapon modifiers 2/2 per datasheet; positive ${controls.positive}/${controls.positive}; negative ${controls.negative}/${controls.negative}; recompute ${controls.recompute}/${controls.recompute}; physical-instance ${controls.physical}/${controls.physical}; mutations ${mutations}/${mutations} KILLED; PASS`);
