import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {withRosterDetachments} from '../../shared/roster-v2/context.mjs';
import * as evaluator from './rule-contract-schema.mjs';

const book = JSON.parse(fs.readFileSync(new URL('./generated/rule-contract-effective.json',import.meta.url),'utf8'));
const canonicalBefore = JSON.stringify(book);
const parser = {window:{}};vm.createContext(parser);
vm.runInContext(fs.readFileSync(new URL('../../shared/roster-parser.js',import.meta.url),'utf8'),parser);
const api = {...evaluator,parse:parser.window.WHRosterParser.parse};
const make = () => createRosterRuntime(book,api);
const F = 'detachment-flyblown-host', P = 'detachment-paragons-of-putrescence', C = 'detachment-contagion-engines';
const triple = [F,P,C];
const norm = text => text.replace(/[‘’]/g,"'").replace(/\s+/g,' ').trim().toLowerCase();
const accepted = norm(fs.readFileSync(new URL('./sources/accepted-waha-pages/death-guard.html',import.meta.url),'utf8').replace(/<[^>]*>/g,' ')) +
  norm(fs.readFileSync(new URL('./sources/gw-death-guard-faction-pack-2026-09-30.txt',import.meta.url),'utf8'));
for (const quote of ['Friendly DEATH GUARD CHARACTER units have +3" to their Contagion Range',
  'Friendly CONTAGION ENGINE units’ ranged attacks have [ASSAULT]', 'This unit has MOBILE', 'This unit has -3" detection range']) {
  assert(accepted.includes(norm(quote)),`Accepted source control missing: ${quote}`);
}
const text = ['+ DETACHMENT: Flyblown Host','+ DETACHMENT: Paragons of Putrescence','+ DETACHMENT: Contagion Engines',
  '+ ENHANCEMENT: Plagueveil (on Char1: Plague Marines)',
  '+ ENHANCEMENT: Lancet of the Worldsore (on Char5: Helbrute)',
  'Char1: 5x Plague Marines (90 pts): 1x Meltagun, 4x Boltgun, 5x Plague knives',
  'Char2: 10x Plague Marines (180 pts): 9x Boltgun, 10x Plague knives',
  'Char3: 1x Biologus Putrifier (50 pts)', 'Char4: 1x Biologus Putrifier (50 pts)',
  'Char5: 1x Helbrute (120 pts): 1x Multi-melta', 'Char6: 1x Helbrute (120 pts): 1x Multi-melta'].join('\n');
const service = make(), draft = service.draft(text);
const helbruteWeapon = book.entities.find(e=>e.kind==='WEAPON_PROFILE' && e.parentId==='unit-helbrute' && e.data.name==='Multi-melta').id;
const bindings = {detachments:Object.fromEntries(triple.map((id,index)=>[`detachment/${index+1}`,id])),
  units:Object.fromEntries(['unit-plague-marines','unit-plague-marines','unit-biologus-putrifier','unit-biologus-putrifier','unit-helbrute','unit-helbrute'].map((id,index)=>[`parsed-unit-${index+1}`,id])),
  enhancements:{'enhancement/1':F+':enhancement:2','enhancement/2':C+':enhancement:2'},selections:{}};
const weapons = {'Meltagun':'datasheet-plague-marines:weapon:4','Boltgun':'datasheet-plague-marines:weapon:2','Plague knives':'datasheet-plague-marines:weapon:13','Multi-melta':helbruteWeapon};
// Test-only lexical labels describe the explicit canonical mapping the user
// supplies. Production identity resolution never uses these labels.
for (const unit of draft.units) for (const selection of unit.selections) bindings.selections[selection.key] = {canonicalProfileIds:[weapons[selection.label]]};
let checks = 0;
const check = fn => {fn();checks++;};
check(()=>assert.equal(service.import(text,bindings).status,'READY'));
check(()=>{
  const comma = text.replace('+ DETACHMENT: Flyblown Host\n+ DETACHMENT: Paragons of Putrescence\n+ DETACHMENT: Contagion Engines',
    '+ DETACHMENT: Flyblown Host, Paragons of Putrescence, Contagion Engines');
  const result = make().import(comma,bindings);
  assert.equal(result.status,'READY');assert.deepEqual(result.roster.detachmentIds,triple);
  const repeated = make().import(text.replace('+ DETACHMENT: Contagion Engines','+ DETACHMENT: Contagion Engines\n+ DETACHMENT: Paragons of Putrescence'),
    {...bindings,detachments:{...bindings.detachments,'detachment/4':P}});
  assert.equal(repeated.status,'READY');assert.equal(repeated.roster.detachments.length,4);assert.deepEqual(repeated.roster.detachmentIds,triple);
});
const unit = id => service.projection.units.find(u=>u.instanceId===`parsed-unit-${id}`);
const sourceRules = new Map(book.entities.map(e=>[e.id,e]));
const assertSelection = () => {
  assert.deepEqual(service.state.detachmentIds,triple);
  assert.equal(service.state.detachments.length,3);
  assert(!Object.hasOwn(service.state,'detachmentId'));
  for (const target of service.projection.units) for (const row of [...target.applied,...target.conditional]) {
    const owner = sourceRules.get(row.ruleId)?.ruleContract?.detachmentId;
    if (owner) assert(triple.includes(owner),`Unselected effect: ${row.ruleId}`);
  }
};
check(assertSelection);
check(()=>{
  assert.equal(unit(1).metrics.detectionRange.modifier,-3);
  assert.equal(unit(2).metrics.detectionRange,undefined);
  assert(unit(5).keywords.includes('MOBILE'));assert(!unit(6).keywords.includes('MOBILE'));
  for (const id of [5,6]) {
    assert(unit(id).keywords.includes('CONTAGION ENGINE'));
    assert(unit(id).weapons.every(w=>w.data.abilities.includes('ASSAULT')));
  }
  for (const id of [1,2,3,4]) assert(!unit(id).keywords.includes('CONTAGION ENGINE'));
  assert.equal(unit(3).metrics.contagionRange.modifier,3);
  assert.equal(unit(1).metrics.contagionRange,undefined);
});
check(()=>{
  service.attach('parsed-unit-3','parsed-unit-1');assertSelection();
  assert.equal(unit(1).metrics.contagionRange.modifier,3);
  assert.equal(unit(1).metrics.detectionRange.modifier,-3);
  assert.equal(unit(2).metrics.contagionRange,undefined);
  assert.equal(unit(2).metrics.detectionRange,undefined);
  assert(unit(1).weapons.every(w=>w.data.abilities.some(ability=>norm(ability)==='lethal hits')));
  assert(!unit(2).applied.some(row=>row.ruleId==='datasheet-biologus-putrifier:section:1'));
  const before = service.projection;
  service.detach('parsed-unit-3');assert.equal(unit(1).metrics.contagionRange,undefined);
  service.attach('parsed-unit-3','parsed-unit-1');assert.deepEqual(service.projection,before);
});
check(()=>{
  for (const target of service.state.units) {
    const rows = service.related(target.instanceId);
    assert(rows.every(row=>triple.includes(row.detachmentId)));
    assert.equal(new Set(rows.map(row=>row.ruleId)).size,rows.length);
    for (const id of triple) assert.deepEqual(service.related(target.instanceId,id),rows.filter(row=>row.detachmentId===id));
    assert.deepEqual(service.related(target.instanceId,'detachment-virulent-vectorium'),[]);
    assert(rows.every(row=>row.state!=='INVALID'));
  }
  assert(service.related('parsed-unit-1').some(row=>row.detachmentId===F && row.applicability==='CONDITIONAL'));
  assert(service.related('parsed-unit-3').some(row=>row.detachmentId===P && row.applicability==='CONDITIONAL'));
  assert(service.related('parsed-unit-5').some(row=>row.detachmentId===C && row.applicability==='MATCH'));
});
check(()=>{
  const snapshot = JSON.parse(JSON.stringify(service.snapshot())), before = service.projection;
  const restored = make();restored.load(snapshot);assert.deepEqual(restored.projection,before);
  const reimport = make();assert.equal(reimport.import(text,JSON.parse(JSON.stringify(bindings))).status,'READY');
  reimport.attach('parsed-unit-3','parsed-unit-1');assert.deepEqual(reimport.projection,before);
});
check(()=>{
  const partial = structuredClone(bindings);delete partial.detachments['detachment/2'];
  const result = make().import(text,partial);assert.equal(result.status,'NEEDS_BINDINGS');assert.equal(result.roster,null);
  assert(result.needsBindings.some(need=>need.key==='detachment/2'));
  const invalid = structuredClone(bindings);invalid.detachments['detachment/2']='detachment-unknown';
  assert.equal(make().import(text,invalid).status,'INVALID');
  assert.equal(make().import(text,{...bindings,detachmentId:F}).status,'INVALID');
  const foreign = structuredClone(bindings);foreign.enhancements['enhancement/1']='detachment-virulent-vectorium:enhancement:2';
  assert.equal(make().import(text,foreign).status,'INVALID');
});
check(()=>{
  for (const edit of [state=>state.detachments[1].canonicalDetachmentId='unknown',state=>state.detachments[1].instanceId=state.detachments[0].instanceId,
    state=>state.detachmentIds.pop(),state=>state.detachmentId=F,state=>state.units[0].enhancementIds.push('detachment-virulent-vectorium:enhancement:2')]) {
    const bad=service.snapshot();edit(bad);assert.throws(()=>make().load(bad));
  }
});
check(()=>{
  // Repeated imported occurrences do not stack the same semantic rule twice.
  const repeated=service.snapshot();repeated.detachments.push({instanceId:'repeat',canonicalDetachmentId:P});
  const again=make();again.load(repeated);assert.deepEqual(again.projection.units,service.projection.units);
});
let singleRegressions = 0;
for (const detachment of book.entities.filter(e=>e.kind==='DETACHMENT')) check(()=>{
  const legacy = service.snapshot();delete legacy.detachments;delete legacy.detachmentIds;legacy.detachmentId=detachment.id;
  for (const u of legacy.units) u.enhancementIds=[];
  const plural=structuredClone(legacy);delete plural.detachmentId;
  plural.detachments=[{instanceId:'detachment/1',canonicalDetachmentId:detachment.id}];plural.detachmentIds=[detachment.id];
  const old=make(),current=make();old.load(legacy);current.load(plural);
  assert.deepEqual(old.state,current.state);assert.deepEqual(old.projection,current.projection);
  for (const u of current.state.units) assert.deepEqual(old.related(u.instanceId),current.related(u.instanceId));
  singleRegressions++;
});
check(()=>{
  const typed=withRosterDetachments(evaluator), context={subject:'ROSTER',roster:{detachmentIds:triple},battle:{}};
  const predicate=id=>({predicate:'DETACHMENT',subject:'ROSTER',contextLevel:'ROSTER',arguments:{id}});
  assert.equal(typed.evaluatePredicate({op:'ALL',args:[predicate(F),predicate(P),predicate(C)]},context),'TRUE');
  assert.equal(typed.evaluatePredicate(predicate('detachment-virulent-vectorium'),context),'FALSE');
  assert.equal(typed.evaluatePredicate({...predicate(F),contextLevel:'STATIC'},context),'INVALID');
  assert.equal(typed.evaluatePredicate(predicate(F),{...context,roster:{}}),'UNKNOWN');
  assert.equal(typed.evaluatePredicate({op:'NOT',args:[predicate(F)]},context),'FALSE');
  assert.equal(typed.evaluateRole({subject:'UNIT',selector:{predicate:'ALWAYS',subject:'UNIT',contextLevel:'STATIC'},conditions:[]},[predicate(F),predicate(P)],{...context,subject:'UNIT'}),'TRUE');
});
assert.equal(JSON.stringify(book),canonicalBefore);
console.log(JSON.stringify({status:'PASS',checks,singleDetachmentRegressions:singleRegressions,multiDetachmentImport:'PASS',threeDgDetachments:'PASS',
  detachmentComposition:'PASS',unselectedDetachmentLeakage:0,enhancementOwnerIsolation:'PASS',rosterCompatibleRules:'PASS',roundtrip:'PASS',canonicalDelta:0}));
