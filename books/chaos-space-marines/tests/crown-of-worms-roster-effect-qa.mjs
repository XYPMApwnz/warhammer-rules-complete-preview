import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const clone=value=>structuredClone(value);
const plain=value=>JSON.parse(JSON.stringify(value));
const scope={console,URL,URLSearchParams,location:{href:'http://localhost/books/chaos-space-marines/reader.html',pathname:'/books/chaos-space-marines/reader.html',search:''},document:{documentElement:{dataset:{bookId:'chaos-space-marines'}},querySelectorAll:()=>[],querySelector:()=>null},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},dispatchEvent(){},addEventListener(){}};
scope.window=scope;scope.globalThis=scope;vm.createContext(scope);
for(const file of ['books/shared/rule-facts.js','roster-guides/points-data.js','roster-guides/points-validator.js','books/chaos-space-marines/scripts/roster-data.js','books/shared/effect-contract-runtime.js','books/shared/roster-context.js'])vm.runInContext(read(file),scope,{filename:file});
const baseline=plain(scope.WH_BOOK_ROSTER_CATALOG),abilityIds=['chaos-space-marines-ability-warpsmith','chaos-space-marines-ability-master-of-mechanisms','chaos-space-marines-ability-enrage-machine-spirits'],baseRanges=[3,3,12],effectiveRanges=[6,6,15];
const byId=(catalog,id)=>catalog.units.find(unit=>unit.id===id);
const pointUnit=id=>Object.values(scope.WH_POINTS_CATALOG['chaos space marines'].units).find(unit=>unit.unitId===id);
const rawFor=(catalog,unitId,instanceId)=>{const unit=byId(catalog,unitId),points=pointUnit(unitId),tier=points.points[0];return{id:instanceId,canonicalUnitId:unitId,name:unit.title,quantity:tier.minModels||1,points:1,models:[]};};
const assignment=(catalog,owner='warpsmith')=>({id:'enhancement-crown-of-worms',ruleId:'enhancement-crown-of-worms',name:'Crown of Worms',ownerUnitId:owner,ownerStatus:'resolved'});
const project=(catalog,units,{assigned=true,owner='warpsmith',attachments={}}={})=>{scope.WH_BOOK_ROSTER_CATALOG=catalog;const roster={faction:'Chaos Space Marines',pointsLimit:2000,detachments:[{id:'cult-of-the-arkifane',name:'Cult of the Arkifane'}],enhancements:assigned?[assignment(catalog,owner)]:[],units,warnings:[]};return scope.WHArmyRosterContext.project({catalog,roster,record:{id:'csm-crown-ranges',attachments,roster},provider:{gameEffects:context=>scope.WHEffectContractRuntime.project(context)}}).game;};
const ranges=unit=>Object.fromEntries(unit.effective.abilities.filter(item=>abilityIds.includes(item.id)).map(item=>[item.id,item.range||null]));
const expectedRanges=Object.fromEntries(abilityIds.map((id,index)=>[id,{base:baseRanges[index],effective:effectiveRanges[index],distanceUnit:'inches'}]));
const normalizeRanges=value=>Object.fromEntries(Object.entries(value).map(([id,range])=>[id,range&&{base:range.base,effective:range.effective,distanceUnit:range.distanceUnit}]));

const pack=JSON.parse(read('books/chaos-space-marines/content/chaos-space-marines-faction-pack.en.json')),source=pack.detachments.find(item=>item.id==='cult-of-the-arkifane').enhancements.find(item=>item.id==='crown-of-worms');
assert.equal(source.text,'WARPSMITH model only. Add 3" to the range of the bearer’s Warpsmith, Master of Mechanisms and Enrage Machine Spirits abilities.','exact certified Crown of Worms source');
const canonicalBefore=plain(byId(baseline,'unit-warpsmith').gameSelections.abilities),contract=baseline.effectContracts.find(item=>item.canonicalRecordId==='enhancement-crown-of-worms'),operations=contract.clauses.flatMap(clause=>clause.operations).filter(item=>item.type==='ABILITY_RANGE_ADD');
assert.deepEqual(operations.map(item=>item.canonicalTarget.id),abilityIds,'three exact canonical ability identities');
assert.deepEqual(operations.map(item=>item.parameters.baseRange),baseRanges,'three exact source base ranges');
assert.deepEqual(operations.map(item=>item.parameters.delta),[3,3,3],'three exact +3 modifiers');

let positive=0,negative=0,physical=0,recompute=0,killed=0;
const warpsmith=rawFor(baseline,'unit-warpsmith','warpsmith'),bodyguard=rawFor(baseline,'unit-legionaries','bodyguard');
let game=project(baseline,[clone(warpsmith)],{assigned:false}),unit=game.units[0];
assert.deepEqual(plain(ranges(unit)),Object.fromEntries(abilityIds.map(id=>[id,null])),'Enhancement absent leaves base abilities unchanged');negative++;
assert.equal(unit.effective.abilities.find(item=>item.id==='chaos-space-marines-ability-dark-pacts').range,undefined,'unrelated ability unchanged');negative++;
game=project(baseline,[clone(warpsmith)]);unit=game.units[0];
assert.deepEqual(normalizeRanges(plain(ranges(unit))),expectedRanges,'exact base +3 ranges execute');positive+=3;
assert.equal(unit.effects.filter(item=>item.operation==='add-range').length,3,'exactly three ability ranges affected');positive++;
assert.equal(unit.effective.abilities.find(item=>item.id==='chaos-space-marines-ability-dark-pacts').range,undefined,'unrelated Warpsmith ability remains unchanged');negative++;
assert.deepEqual(plain(byId(baseline,'unit-warpsmith').gameSelections.abilities),canonicalBefore,'canonical base ability facts are not mutated');negative++;

game=project(baseline,[clone(warpsmith),clone(bodyguard)],{attachments:{bodyguard:['warpsmith']}});const attachedOwner=game.units.find(item=>item.identity.instanceId==='warpsmith'),attachedBody=game.units.find(item=>item.identity.instanceId==='bodyguard');
assert.deepEqual(normalizeRanges(plain(ranges(attachedOwner))),expectedRanges,'attached bearer retains exact owner-scoped ranges');positive+=3;
assert.equal(attachedBody.effective.abilities.some(item=>item.range),false,'Bodyguard does not inherit bearer ability ranges');negative++;

const duplicate=rawFor(baseline,'unit-warpsmith','warpsmith-copy');game=project(baseline,[clone(warpsmith),clone(duplicate)]);const owner=game.units.find(item=>item.identity.instanceId==='warpsmith'),copy=game.units.find(item=>item.identity.instanceId==='warpsmith-copy');
assert.deepEqual(normalizeRanges(plain(ranges(owner))),expectedRanges,'assigned physical Warpsmith receives ranges');physical++;
assert.deepEqual(plain(ranges(copy)),Object.fromEntries(abilityIds.map(id=>[id,null])),'duplicate physical Warpsmith remains unchanged');physical++;
game=project(baseline,[clone(warpsmith)],{assigned:false});assert.deepEqual(plain(ranges(game.units[0])),Object.fromEntries(abilityIds.map(id=>[id,null])),'Enhancement removal restores base ranges');recompute++;
game=project(baseline,[clone(warpsmith)]);assert.deepEqual(normalizeRanges(plain(ranges(game.units[0]))),expectedRanges,'Enhancement re-add recomputes exact ranges');recompute++;

const certify=catalog=>{const game=project(catalog,[rawFor(catalog,'unit-warpsmith','warpsmith')]),actual=normalizeRanges(plain(ranges(game.units[0])));assert.deepEqual(actual,expectedRanges);assert.equal(game.units[0].effects.filter(item=>item.operation==='add-range').length,3);};
const mutate=(label,change)=>{const catalog=clone(baseline),c=catalog.effectContracts.find(item=>item.canonicalRecordId==='enhancement-crown-of-worms');change(c.clauses[0].operations);assert.throws(()=>certify(catalog),undefined,`${label} mutation killed`);killed++;};
for(const id of abilityIds)mutate(`remove ${id}`,items=>items.splice(items.findIndex(item=>item.canonicalTarget?.id===id),1));
for(const id of abilityIds)mutate(`wrong delta ${id}`,items=>{items.find(item=>item.canonicalTarget?.id===id).parameters.delta=2;});
mutate('wrong canonical ability identity',items=>{items.find(item=>item.type==='ABILITY_RANGE_ADD').canonicalTarget.id='chaos-space-marines-ability-dark-pacts';});
assert.equal(killed,7,'all Crown mutation controls killed');
console.log(`CSM Crown of Worms ability-range QA passed: 3/3 abilities; positive ${positive}/7; negative ${negative}/5; physical ${physical}/2; recompute ${recompute}/2; mutations ${killed}/7 KILLED.`);
