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
for(const file of ['books/chaos-space-marines/scripts/roster-data.js','books/shared/roster-context.js'])vm.runInContext(read(file),scope,{filename:file});

const baseline=plain(scope.WH_BOOK_ROSTER_CATALOG),ruleId='chaos-space-marines-detachment-rule-marks-of-chaos',marks=['KHORNE','TZEENTCH','NURGLE','SLAANESH','CHAOS UNDIVIDED'];
const byId=(catalog,id)=>catalog.units.find(unit=>unit.id===id),detachment=catalog=>catalog.detachments.find(item=>item.id==='pactbound-zealots'),contract=catalog=>detachment(catalog).keywordGrants.find(item=>item.sourceRuleId===ruleId);
const selectionTitle=(unit,id)=>unit.gameSelections.selections.find(item=>item.id===id)?.title;
const rawFor=(catalog,unitId,id)=>{const unit=byId(catalog,unitId),models=unit.gameSelections.models.map(model=>{const defaults=unit.gameSelections.wargearDefaults.find(item=>item.modelId===model.id)?.selections||[],wargear=defaults.map(item=>`${item.quantity===1?'':`${item.quantity}x `}${selectionTitle(unit,item.selectionId)}`).join(', ');return{quantity:model.min,name:model.aliases?.[0]||model.title,loadouts:[{quantity:model.min,wargear}]};});return{id,canonicalUnitId:unitId,name:unit.title,quantity:models.reduce((sum,item)=>sum+item.quantity,0),points:0,wargear:'',models,warlord:false};};
const choices=(...rows)=>({[ruleId]:rows.map(([instanceId,choiceId])=>({instanceId,choiceId}))});
const transportProvider=context=>context.gameUnit.identity.canonicalDatasheetId==='unit-chaos-rhino'?[{id:'test-chaos-rhino-capacity',component:'transport',operation:'set-capacity',targetInstanceId:context.gameUnit.identity.instanceId,capacity:12,restriction:{allKeywords:['HERETIC ASTARTES'],noneKeywords:['TERMINATOR','JUMP PACK','CULT OF DESTRUCTION','DAMNED']}}]:[];
const project=(catalog,units,choiceRows=[],record={})=>{scope.WH_BOOK_ROSTER_CATALOG=catalog;const roster={faction:'Chaos Space Marines',declared:0,calculated:0,unitLineTotal:0,detachments:[{id:'pactbound-zealots',name:'Pactbound Zealots'}],enhancements:[],warnings:[],units};return scope.WHArmyRosterContext.project({catalog,roster,record:{id:'csm-marks',roster,rosterChoices:choices(...choiceRows),...record},provider:{gameEffects:transportProvider}});};
const keywords=unit=>unit.effective.keywords.map(value=>value.toUpperCase());

const pack=JSON.parse(read('books/chaos-space-marines/content/chaos-space-marines-faction-pack.en.json')),source=pack.detachments.find(item=>item.id==='pactbound-zealots').rule.text;
assert.match(source,/you must select one for that unit and note it on your Army Roster/,'source requires one Mark');
assert.match(source,/cannot select the KHORNE keyword for a PSYKER unit/,'source Khorne/Psyker exclusion');
assert.match(source,/both units share the same keyword from the list above/,'source shared-Mark attachment constraint');
assert.match(source,/TRANSPORT if both of those units share the same keyword from the list above/,'source shared-Mark embarkation constraint');
const c=contract(baseline);
assert.equal(c.requiredPerEligibleUnit,true);assert.equal(c.countPerUnit,1);assert.deepEqual(c.options.map(item=>item.keyword),marks);assert.deepEqual(c.options.find(item=>item.keyword==='KHORNE').selector,{noneKeywords:['PSYKER']});assert.deepEqual(c.compatibility.map(item=>item.relation),['attachment','embarkation']);

let positive=0,negative=0,recompute=0,physical=0,mutations=0;
const legionaries=rawFor(baseline,'unit-legionaries','body'),lord=rawFor(baseline,'unit-chaos-lord','lord'),psyker=rawFor(baseline,'unit-master-of-possession','psyker'),rhino=rawFor(baseline,'unit-chaos-rhino','rhino');
let result=project(baseline,[clone(legionaries)],[]);assert.equal(result.rosterChoiceState.state,'invalid');assert.equal(result.rosterChoiceState.rejected[0].reason,'choice-required');assert.equal(result.game.status,'invalid');negative+=3;
for(const option of c.options){result=project(baseline,[clone(legionaries)],[['body',option.id]]);assert.equal(result.rosterChoiceState.state,'ready');assert.ok(keywords(result.game.units[0]).includes(option.keyword));positive+=2;}
result=project(baseline,[clone(legionaries)],[['body','invalid-mark']]);assert.equal(result.rosterChoiceState.rejected[0].reason,'unknown-option');negative++;
result=project(baseline,[clone(psyker)],[['psyker','khorne']]);assert.equal(result.rosterChoiceState.rejected[0].reason,'incompatible-option');negative++;
result=project(baseline,[clone(psyker)],[['psyker','tzeentch']]);assert.equal(result.rosterChoiceState.state,'ready');assert.ok(keywords(result.game.units[0]).includes('TZEENTCH'));positive+=2;
result=project(baseline,[clone(legionaries)],[['body','nurgle'],['body','slaanesh']]);assert.equal(result.rosterChoiceState.rejected[0].reason,'duplicate-physical-instance');negative++;
const intrinsic=rawFor(baseline,'unit-khorne-lord-of-skulls','intrinsic'),epic=rawFor(baseline,'unit-abaddon-the-despoiler','epic');result=project(baseline,[intrinsic,epic],[]);assert.equal(result.rosterChoiceState.state,'ready');positive+=2;

result=project(baseline,[clone(legionaries),clone(lord)],[['body','nurgle'],['lord','nurgle']],{attachments:{body:['lord']}});assert.deepEqual(plain(result.attachmentState.attachments),{body:['lord']});assert.equal(result.attachmentState.rejected.length,0);positive+=2;
result=project(baseline,[clone(legionaries),clone(lord)],[['body','nurgle'],['lord','slaanesh']],{attachments:{body:['lord']}});assert.equal(result.attachmentState.rejected[0].reason,'shared-keyword-mismatch');negative++;
result=project(baseline,[clone(legionaries),clone(lord)],[['body','nurgle'],['lord','slaanesh']],{attachments:{}});assert.equal(result.attachmentState.rejected.length,0);recompute++;
result=project(baseline,[clone(legionaries),clone(lord)],[['body','nurgle'],['lord','nurgle']],{attachments:{body:['lord']}});assert.equal(result.attachmentState.rejected.length,0);recompute++;

const body2=rawFor(baseline,'unit-legionaries','body-2'),lord2=rawFor(baseline,'unit-chaos-lord','lord-2');result=project(baseline,[clone(legionaries),body2,clone(lord),lord2],[['body','nurgle'],['body-2','slaanesh'],['lord','nurgle'],['lord-2','slaanesh']],{attachments:{body:['lord'],'body-2':['lord-2']}});assert.equal(result.attachmentState.rejected.length,0);physical+=2;
result=project(baseline,[clone(legionaries),body2,clone(lord),lord2],[['body','nurgle'],['body-2','slaanesh'],['lord','slaanesh'],['lord-2','slaanesh']],{attachments:{body:['lord'],'body-2':['lord-2']}});assert.equal(result.attachmentState.rejected.length,1);assert.equal(result.attachmentState.rejected[0].leaderInstanceId,'lord');physical+=2;

result=project(baseline,[clone(rhino),clone(legionaries)],[['rhino','nurgle'],['body','nurgle']],{transportAssignments:{rhino:['body']}});assert.equal(result.game.transportState.state,'valid');assert.deepEqual(plain(result.game.transportState.assignments),{rhino:['body']});assert.equal(result.game.transportState.transports[0].capacity,12);positive+=3;
result=project(baseline,[clone(rhino),clone(legionaries)],[['rhino','nurgle'],['body','khorne']],{transportAssignments:{rhino:['body']}});assert.equal(result.game.transportState.rejected[0].reason,'shared-keyword-mismatch');negative++;
const rhino2=rawFor(baseline,'unit-chaos-rhino','rhino-2');result=project(baseline,[clone(rhino),rhino2,clone(legionaries),clone(body2)],[['rhino','nurgle'],['rhino-2','slaanesh'],['body','khorne'],['body-2','slaanesh']],{transportAssignments:{rhino:['body'],'rhino-2':['body-2']}});assert.equal(result.game.transportState.rejected.length,1);assert.deepEqual(plain(result.game.transportState.assignments),{'rhino-2':['body-2']});physical+=2;
result=project(baseline,[clone(rhino),clone(legionaries)],[['rhino','nurgle'],['body','nurgle']],{transportAssignments:{}});assert.equal(result.game.transportState.state,'valid');recompute++;

const workflow={detachments:[detachment(baseline)],units:[{instanceId:'body',canonicalUnit:byId(baseline,'unit-legionaries')}],choices:{},sourceRuleId:ruleId,instanceId:'body',choiceId:'khorne'};
const selected=scope.WHArmyRosterContext.rosterChoices.select(workflow);assert.equal(selected.changed,true);assert.deepEqual(plain(selected.choices),choices(['body','khorne']));const changed=scope.WHArmyRosterContext.rosterChoices.select({...workflow,choices:selected.choices,choiceId:'nurgle'});assert.ok(changed.keywordsByInstance.body.includes('NURGLE'));assert.ok(!changed.keywordsByInstance.body.includes('KHORNE'));const removed=scope.WHArmyRosterContext.rosterChoices.deselect({...workflow,choices:changed.choices});assert.equal(removed.state,'invalid');recompute+=3;

const certify=catalog=>{const current=contract(catalog);assert.deepEqual(current.options.map(item=>item.keyword),marks);assert.equal(current.requiredPerEligibleUnit,true);assert.deepEqual(current.options.find(item=>item.id==='khorne').selector,{noneKeywords:['PSYKER']});assert.deepEqual(current.compatibility.map(item=>item.relation),['attachment','embarkation']);const compatible=project(catalog,[rawFor(catalog,'unit-legionaries','body'),rawFor(catalog,'unit-chaos-lord','lord')],[['body','nurgle'],['lord','nurgle']],{attachments:{body:['lord']}});assert.equal(compatible.attachmentState.rejected.length,0);const incompatible=project(catalog,[rawFor(catalog,'unit-master-of-possession','psyker')],[['psyker','khorne']]);assert.equal(incompatible.rosterChoiceState.state,'invalid');};
const killed=(label,mutate)=>{const catalog=clone(baseline);mutate(contract(catalog));assert.throws(()=>certify(catalog),undefined,`${label} mutation survived`);mutations++;};
killed('MISSING_MARK',value=>value.options.pop());
killed('OPTIONAL_SELECTION',value=>value.requiredPerEligibleUnit=false);
killed('KHORNE_PSYKER_ALLOWED',value=>delete value.options[0].selector);
killed('MISSING_ATTACHMENT_COMPATIBILITY',value=>value.compatibility=value.compatibility.filter(item=>item.relation!=='attachment'));
killed('MISSING_EMBARKATION_COMPATIBILITY',value=>value.compatibility=value.compatibility.filter(item=>item.relation!=='embarkation'));
assert.equal(mutations,5);
console.log(`CSM Marks of Chaos QA: fully executable; positive ${positive}/${positive}; negative ${negative}/${negative}; recompute ${recompute}/${recompute}; physical-instance ${physical}/${physical}; mutations ${mutations}/${mutations} KILLED; PASS`);
