import fs from 'node:fs';
import assert from 'node:assert/strict';
import {buildAdMechContracts,readJson} from './rule-contract-build.mjs';
import {buildRosterRuntimeBook} from './roster-build.mjs';
import {createAdMechRosterRuntime} from './roster-runtime.mjs';
import {projectInstanceCards} from '../../shared/army-book-app-v2/personal.mjs';

const built=buildAdMechContracts(),book=buildRosterRuntimeBook(built),id='datasheet-sicarian-ruststalkers:section:1';
const source=JSON.parse(fs.readFileSync(new URL('../sources/waha-11e-current-2026-09-25/corpus.json',import.meta.url),'utf8'));
const captured=source.datasheets.find(u=>u.sourceId==='datasheet-sicarian-ruststalkers').sections.find(s=>s.sourceId===id).blocks[0].text;
assert.equal(captured,'Optimised Gait: Add 1 to Advance and Charge rolls made for this unit. While this unit is within 6" of one or more friendly ADEPTUS MECHANICUS BATTLELINE units, add 2 to Advance and Charge rolls made for this unit instead.');
const index=new Map(book.entities.map(e=>[e.id,e])),rule=index.get(id),clauses=rule.ruleContract.clauses;
assert.equal(rule.data.blocks[0].text,captured);assert.deepEqual(clauses.map(c=>c.id),['base-charge','block-1']);
assert.equal(clauses[0].rosterClassificationNote.capabilityMissing[0].status,'CAPABILITY_MISSING');
assert.equal(clauses[1].rosterClassification,'BATTLE_ONLY');assert.deepEqual(clauses[1].rosterEffects,[]);
assert.ok(clauses[1].evidence.quote.startsWith('While this unit is within 6"'));
const payload=readJson('generated/app-presentation.json'),cards=new Map(payload.cards.map(c=>[c.id,c]));
const text='+ FACTION KEYWORD: Imperium - Adeptus Mechanicus\n+ DETACHMENT: Haloscreed Battle Clade\n5x Sicarian Ruststalkers (100 pts)\n5x Sicarian Ruststalkers (100 pts)\n10x Skitarii Rangers (100 pts)';
const make=(candidate=book)=>createAdMechRosterRuntime(candidate,readJson('roster-import-aliases.json'));
const runtime=make();assert.equal(runtime.import(text).status,'READY');const snapshot=runtime.snapshot(),projection=runtime.projection;
function verify(service){
  for(const [i,unit]of service.projection.units.entries()){
    const expected=i<2?1:0;assert.equal(unit.metrics.chargeRoll?.modifier??0,expected);
    const view=service.effective(unit.instanceId),root=projectInstanceCards(cards,service.state.units[i],view).get(unit.canonicalUnitId)[0];
    assert.equal(root.rosterUnitMetrics.filter(m=>m.key==='chargeRoll').length,expected);
    if(expected){assert.equal(root.rosterUnitMetrics[0].displayValue,'+1');assert.equal(root.rosterUnitMetrics[0].sources[0].ruleId,id);
      assert.ok(view.conditional.some(c=>c.ruleId===id&&c.clauseId==='block-1'));}
    for(const model of unit.profiles){assert.deepEqual(model.profile,index.get(model.canonicalProfileId).data);assert.equal(model.metrics.chargeRoll,undefined);}
    for(const weapon of [...unit.weapons,...unit.profiles.flatMap(p=>p.weapons)])assert.deepEqual(weapon.data,index.get(weapon.canonicalProfileId).data);
  }
}
verify(runtime);runtime.load(snapshot);assert.deepEqual(runtime.projection,projection);verify(runtime);
const fresh=make();fresh.load(JSON.parse(JSON.stringify(snapshot)));assert.deepEqual(fresh.projection,projection);verify(fresh);
let mutations=0;
for(const change of [c=>{c.rosterClassification='BATTLE_ONLY';c.rosterEffects=[];},c=>c.rosterEffects[0].value=2,c=>c.rosterEffects[0].targetBinding='ROSTER_UNITS']){
 const bad=structuredClone(book);change(bad.entities.find(e=>e.id===id).ruleContract.clauses[0]);
 assert.throws(()=>{const test=make(bad);test.load(snapshot);verify(test);});mutations++;
}
console.log(JSON.stringify({status:'PASS',baseCharge:1,conditionalProximityNotApplied:true,advanceCapabilityExplicit:true,independentInstances:2,unrelatedUnit:0,mutations,productionPresentation:true,unchangedModelAndWeaponFacts:true,reload:true}));
