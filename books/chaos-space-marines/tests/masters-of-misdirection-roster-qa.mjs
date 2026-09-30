import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..'),read=file=>fs.readFileSync(path.join(root,file),'utf8'),clone=value=>structuredClone(value),plain=value=>JSON.parse(JSON.stringify(value));
const scope={console,URL,URLSearchParams};scope.window=scope;scope.globalThis=scope;vm.createContext(scope);
for(const file of ['books/shared/rule-facts.js','roster-guides/points-data.js','roster-guides/points-validator.js','books/chaos-space-marines/scripts/roster-data.js','books/shared/roster-context.js'])vm.runInContext(read(file),scope,{filename:file});
const catalog=plain(scope.WH_BOOK_ROSTER_CATALOG),ruleId='chaos-space-marines-detachment-rule-masters-of-misdirection',byId=id=>catalog.units.find(unit=>unit.id===id),contractOf=value=>value.rosterLegality.musterChoices.find(item=>item.sourceRuleId===ruleId);
const title=(unit,id)=>unit.gameSelections.selections.find(item=>item.id===id)?.title;
const raw=(unitId,id)=>{const unit=byId(unitId),models=unit.gameSelections.models.map(model=>{const defaults=unit.gameSelections.wargearDefaults.find(item=>item.modelId===model.id)?.selections||[],wargear=defaults.map(item=>`${item.quantity===1?'':`${item.quantity}x `}${title(unit,item.selectionId)}`).join(', ');return{quantity:model.min,name:model.aliases?.[0]||model.title,loadouts:[{quantity:model.min,wargear}]};});return{id,canonicalUnitId:unitId,name:unit.title,quantity:models.reduce((sum,item)=>sum+item.quantity,0),points:0,wargear:'',models,warlord:false};};
const roster=(pointsLimit,units)=>({faction:'Chaos Space Marines',pointsLimit,detachments:[{id:'deceptors',name:'Deceptors'}],enhancements:[],warnings:[],units});
const project=(pointsLimit,units,selected=[],attachments={},activeCatalog=catalog)=>{scope.WH_BOOK_ROSTER_CATALOG=activeCatalog;const source=roster(pointsLimit,units),record={id:'csm-masters-misdirection',roster:source,rosterChoices:selected.length?{[ruleId]:selected}:{},attachments};return scope.WHArmyRosterContext.project({catalog:activeCatalog,roster:source,record});};
const hasInfiltrators=(result,id)=>result.game.units.find(unit=>unit.identity.instanceId===id)?.effective.abilities.some(ability=>ability.id==='core-infiltrators')===true;

const corpus=JSON.parse(read('books/chaos-space-marines/sources/waha-11e-current-2026-09-29/corpus.json')),source=corpus.detachments.find(item=>item.sourceId==='detachment-deceptors').rule;
assert.equal(source.sourceId,'detachment-deceptors:rule');assert.match(source.text,/select a number of LEGIONARIES and CULTIST MOB units/);assert.match(source.text,/CHARACTER units attached to them \(excluding EPIC HEROES\), have the Infiltrators ability/);
assert.deepEqual(source.tables[0].rows.slice(2),[['Incursion','Up to 2 units','Up to 2 units'],['Strike Force','Up to 3 units','Up to 3 units'],['Onslaught','Up to 4 units','Up to 4 units']]);
const contract=contractOf(catalog);assert.deepEqual(contract.unitIds,['unit-legionaries','unit-cultist-mob']);assert.deepEqual(contract.abilityGrants,[{id:'core-infiltrators',title:'Infiltrators'}]);assert.deepEqual(contract.selectionGroups.map(group=>[group.id,group.unitIds,group.limits]),[['legionaries',['unit-legionaries'],[{pointsLimit:1000,maxSelected:2},{pointsLimit:2000,maxSelected:3},{pointsLimit:3000,maxSelected:4}]],['cultist-mobs',['unit-cultist-mob'],[{pointsLimit:1000,maxSelected:2},{pointsLimit:2000,maxSelected:3},{pointsLimit:3000,maxSelected:4}]]]);assert.deepEqual(contract.attachedPropagation.selector,{allKeywords:['CHARACTER'],noneKeywords:['EPIC HERO']});

let positive=0,negative=0,battle=0,detach=0,physical=0,mutations=0;
for(const [pointsLimit,max] of [[1000,2],[2000,3],[3000,4]]){
  let result=project(pointsLimit,[]);assert.equal(result.rosterChoiceState.state,'ready');battle++;
  const legionaries=Array.from({length:max},(_,index)=>raw('unit-legionaries',`legionaries-${index}`)),cultists=Array.from({length:max},(_,index)=>raw('unit-cultist-mob',`cultists-${index}`)),selected=[...legionaries,...cultists].map(unit=>unit.id);
  result=project(pointsLimit,[...legionaries,...cultists],selected);assert.equal(result.rosterChoiceState.state,'ready');assert.equal(result.game.status,'ready');for(const id of selected)assert.equal(hasInfiltrators(result,id),true);battle+=2+selected.length;
  const extra=raw('unit-legionaries','legionaries-extra');result=project(pointsLimit,[...legionaries,...cultists,extra],[...selected,extra.id]);assert.equal(result.rosterChoiceState.state,'invalid');assert.equal(result.rosterChoiceState.rejected[0].reason,'selection-limit-exceeded');battle+=2;
}

const selected=raw('unit-legionaries','selected'),unselected=raw('unit-legionaries','unselected'),ineligible=raw('unit-chosen','chosen');
let result=project(1000,[selected,unselected],[selected.id]);assert.equal(hasInfiltrators(result,'selected'),true);assert.equal(hasInfiltrators(result,'unselected'),false);positive+=2;
result=project(1000,[ineligible],[ineligible.id]);assert.equal(result.rosterChoiceState.state,'invalid');assert.equal(result.rosterChoiceState.rejected[0].reason,'ineligible-canonical-unit');negative+=2;

const lord=raw('unit-chaos-lord','lord'),epic=raw('unit-huron-blackheart','huron');
result=project(1000,[clone(selected),lord],[selected.id],{selected:['lord']});assert.equal(result.attachmentState.rejected.length,0);assert.equal(hasInfiltrators(result,'selected'),true);assert.equal(hasInfiltrators(result,'lord'),true);positive+=3;
result=project(1000,[clone(selected),epic],[selected.id],{selected:['huron']});assert.equal(result.attachmentState.rejected.length,0);assert.equal(hasInfiltrators(result,'selected'),true);assert.equal(hasInfiltrators(result,'huron'),false);negative+=2;positive++;
result=project(1000,[clone(selected),clone(unselected),lord],[selected.id],{unselected:['lord']});assert.equal(hasInfiltrators(result,'lord'),false);assert.equal(hasInfiltrators(result,'unselected'),false);negative+=2;

const duplicateA=raw('unit-legionaries','duplicate-a'),duplicateB=raw('unit-legionaries','duplicate-b');result=project(1000,[duplicateA,duplicateB],[duplicateA.id]);assert.equal(hasInfiltrators(result,'duplicate-a'),true);assert.equal(hasInfiltrators(result,'duplicate-b'),false);physical+=2;
result=project(1000,[duplicateA,duplicateB],[duplicateA.id,duplicateB.id]);assert.equal(hasInfiltrators(result,'duplicate-a'),true);assert.equal(hasInfiltrators(result,'duplicate-b'),true);physical+=2;

const attached=project(1000,[clone(selected),clone(lord)],[selected.id],{selected:['lord']}),detached=project(1000,[clone(selected),clone(lord)],[selected.id],{}),deselected=project(1000,[clone(selected),clone(lord)],[],{selected:['lord']});assert.equal(hasInfiltrators(attached,'lord'),true);assert.equal(hasInfiltrators(detached,'lord'),false);assert.equal(hasInfiltrators(detached,'selected'),true);assert.equal(hasInfiltrators(deselected,'lord'),false);assert.equal(hasInfiltrators(deselected,'selected'),false);detach+=5;
const four=Array.from({length:4},(_,index)=>raw('unit-legionaries',`size-${index}`)),fourIds=four.map(unit=>unit.id);assert.equal(project(3000,four,fourIds).game.status,'ready');assert.equal(project(1000,four,fourIds).game.status,'invalid');battle+=2;

const certify=active=>{const value=contractOf(active);assert.deepEqual(value.unitIds,['unit-legionaries','unit-cultist-mob']);assert.deepEqual(value.abilityGrants,[{id:'core-infiltrators',title:'Infiltrators'}]);assert.deepEqual(value.selectionGroups.map(group=>group.limits.map(item=>item.maxSelected)),[[2,3,4],[2,3,4]]);assert.deepEqual(value.attachedPropagation.selector,{allKeywords:['CHARACTER'],noneKeywords:['EPIC HERO']});};
const killed=(label,mutate)=>{const active=clone(catalog);mutate(contractOf(active));assert.throws(()=>certify(active),undefined,`${label} mutation survived`);mutations++;};
killed('BROADENED_ELIGIBILITY',value=>value.unitIds.push('unit-chosen'));
killed('WRONG_BATTLE_SIZE_CAP',value=>value.selectionGroups[0].limits[0].maxSelected=3);
killed('MISSING_ABILITY_GRANT',value=>value.abilityGrants=[]);
killed('MISSING_ATTACHMENT_PROPAGATION',value=>delete value.attachedPropagation);
killed('EPIC_HERO_ALLOWED',value=>value.attachedPropagation.selector.noneKeywords=[]);
killed('MISSING_CULTIST_QUOTA',value=>value.selectionGroups.pop());
assert.equal(mutations,6);
console.log(`CSM Masters of Misdirection QA: fully executable; positive ${positive}/${positive}; negative ${negative}/${negative}; battle-size ${battle}/${battle}; detach ${detach}/${detach}; physical-instance ${physical}/${physical}; mutations ${mutations}/${mutations} KILLED; PASS`);
