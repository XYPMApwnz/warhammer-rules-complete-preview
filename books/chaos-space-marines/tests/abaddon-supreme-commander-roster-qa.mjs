import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..'),read=file=>fs.readFileSync(path.join(root,file),'utf8'),clone=value=>structuredClone(value),plain=value=>JSON.parse(JSON.stringify(value));
const scope={console,URL,URLSearchParams};scope.window=scope;scope.globalThis=scope;vm.createContext(scope);
for(const file of ['books/chaos-space-marines/scripts/roster-data.js','books/shared/roster-context.js'])vm.runInContext(read(file),scope,{filename:file});
const baseline=plain(scope.WH_BOOK_ROSTER_CATALOG),byId=(catalog,id)=>catalog.units.find(unit=>unit.id===id);
const rawFor=(catalog,unitId,instanceId,warlord=false)=>{const unit=byId(catalog,unitId),models=unit.gameSelections.models.map(model=>({quantity:Number(model.min),name:model.aliases?.[0]||model.title,loadouts:[]}));return{id:instanceId,canonicalUnitId:unitId,name:unit.title,quantity:models.reduce((sum,item)=>sum+item.quantity,0),points:0,wargear:'',models,warlord};};
const project=(catalog,units)=>{scope.WH_BOOK_ROSTER_CATALOG=catalog;const roster={faction:'Chaos Space Marines',detachments:[],enhancements:[],warnings:[],units};return scope.WHArmyRosterContext.project({catalog,roster,record:{id:'csm-abaddon-supreme',roster}});};
const source=JSON.parse(read('books/chaos-space-marines/content/chaos-space-marines-codex-datasheets.en.json')),abaddonSource=source.datasheets.find(item=>item.id==='unit-abaddon-the-despoiler'),ability=abaddonSource.abilities.find(item=>item.title==='Supreme Commander');
assert.equal(ability.text,'If this model is in your army, it must be your WARLORD.','certified canonical Supreme Commander fact unchanged');
const contract=baseline.rosterLegality.mandatoryWarlords.find(item=>item.id==='abaddon-supreme-commander');assert.deepEqual(contract,{id:'abaddon-supreme-commander',sourceRuleId:'chaos-space-marines-ability-supreme-commander',unitIds:['unit-abaddon-the-despoiler']});
const abaddon=rawFor(baseline,'unit-abaddon-the-despoiler','abaddon',true),lord=rawFor(baseline,'unit-chaos-lord','lord');
let result=project(baseline,[clone(abaddon)]);assert.equal(result.game.status,'ready','Abaddon present and Warlord valid');
result=project(baseline,[{...clone(abaddon),warlord:false},{...clone(lord),warlord:true}]);assert.equal(result.game.status,'invalid','another Warlord rejected while Abaddon present');assert.equal(result.game.legality.issues[0].reason,'mandatory-warlord');
result=project(baseline,[{...clone(lord),warlord:true}]);assert.equal(result.game.status,'ready','Abaddon absent leaves normal Warlord legality unchanged');
result=project(baseline,[clone(abaddon),rawFor(baseline,'unit-abaddon-the-despoiler','abaddon-2',false)]);assert.equal(result.game.status,'invalid','duplicate physical Abaddon fails closed');assert.equal(result.game.legality.issues[0].reason,'duplicate-mandatory-warlord-unit');
const absent=project(baseline,[{...clone(lord),warlord:true}]),added=project(baseline,[{...clone(lord),warlord:true},{...clone(abaddon),warlord:false}]),reassigned=project(baseline,[{...clone(lord),warlord:false},clone(abaddon)]),removed=project(baseline,[{...clone(lord),warlord:true}]);assert.equal(absent.game.status,'ready');assert.equal(added.game.status,'invalid');assert.equal(reassigned.game.status,'ready');assert.equal(removed.game.status,'ready');
assert.equal(abaddonSource.abilities.find(item=>item.title==='Supreme Commander').text,'If this model is in your army, it must be your WARLORD.','runtime does not mutate canonical source fact');

let mutations=0;const killed=(label,mutate,assertion)=>{const catalog=clone(baseline);mutate(catalog);assertion(catalog);mutations++;};
killed('MISSING_CONTRACT',catalog=>catalog.rosterLegality.mandatoryWarlords=[],catalog=>assert.equal(project(catalog,[{...rawFor(catalog,'unit-abaddon-the-despoiler','abaddon',false)},{...rawFor(catalog,'unit-chaos-lord','lord',true)}]).game.status,'ready'));
killed('WRONG_IDENTITY',catalog=>catalog.rosterLegality.mandatoryWarlords[0].unitIds=['unit-chaos-lord'],catalog=>assert.equal(project(catalog,[{...rawFor(catalog,'unit-abaddon-the-despoiler','abaddon',false)},{...rawFor(catalog,'unit-chaos-lord','lord',true)}]).game.status,'ready'));
killed('DUPLICATE_NOT_FAIL_CLOSED',catalog=>catalog.rosterLegality.mandatoryWarlords[0].unitIds=[],catalog=>assert.equal(project(catalog,[rawFor(catalog,'unit-abaddon-the-despoiler','abaddon',true),rawFor(catalog,'unit-abaddon-the-despoiler','abaddon-2',false)]).game.status,'ready'));
assert.equal(mutations,3);
console.log(`CSM Abaddon Supreme Commander QA: fully executable; positive 2/2; negative 3/3; recompute 4/4; physical-instance 2/2; mutations ${mutations}/${mutations} KILLED; PASS`);
