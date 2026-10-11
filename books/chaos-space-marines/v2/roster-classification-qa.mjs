/** Classification preservation, not battle execution or a new dispatch path. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildCSMContracts} from './rule-contract-build.mjs';
import {buildCSMRosterRuntimeBook} from './roster-runtime-build.mjs';
import {executableClauses,deferredClause} from './roster-effect-build.mjs';
import {buildCSMImportBook} from './roster-import-build.mjs';
import {createCSMRosterImport} from './roster-import.mjs';
import {createCSMRosterRuntime} from './roster-runtime.mjs';
import {createCSMCompatibilityCompiler} from './rule-contract-context.mjs';

const clauseRows=book=>book.entities.flatMap(owner=>(owner.ruleContract?.clauses||[])
  .map(clause=>({id:`${owner.id}::${clause.id}`,owner,clause})));
const battleDeclared=({owner,clause})=>clause.rosterClassification==='BATTLE_ONLY'||
  clause.productClassification==='BATTLE_ONLY'||owner.ruleContract.executionMode==='BATTLE_ACTION';

// Generic normalization invariant: explicit semantic classification cannot be
// discarded by a fallback category. No source-backed override is declared here.
function assertBattlePreserved(source,normalized) {
  const result=new Map(clauseRows(normalized).map(row=>[row.id,row.clause]));
  for(const row of clauseRows(source).filter(battleDeclared)) {
    assert.equal(result.get(row.id)?.rosterClassification,'BATTLE_ONLY','Battle-only classification lost: '+row.id);
    assert.deepEqual(result.get(row.id).rosterEffects,[],'Battle-only executable payload: '+row.id);
  }
}

// Independent non-army controls cover each supported semantic declaration and
// reject the original downgrade, without title, prose or book-ID joins.
const synthetic={entities:[
  {id:'synthetic-roster-rule',ruleContract:{clauses:[{id:'clause',rosterClassification:'BATTLE_ONLY'}]}},
  {id:'synthetic-product-rule',ruleContract:{clauses:[{id:'clause',productClassification:'BATTLE_ONLY'}]}},
  {id:'synthetic-action-rule',ruleContract:{executionMode:'BATTLE_ACTION',clauses:[{id:'clause'}]}}
]};
const normalized=structuredClone(synthetic);
for(const {clause} of clauseRows(normalized)){clause.rosterClassification='BATTLE_ONLY';clause.rosterEffects=[];}
assertBattlePreserved(synthetic,normalized);
for(const {id} of clauseRows(normalized)) {
  const mutation=structuredClone(normalized);
  clauseRows(mutation).find(row=>row.id===id).clause.rosterClassification='DISPLAY_ONLY';
  assert.throws(()=>assertBattlePreserved(synthetic,mutation),/Battle-only classification lost/);
}

const built=buildCSMContracts(),book=buildCSMRosterRuntimeBook(),snapshot=JSON.stringify(book);
const canonicalSnapshot=JSON.stringify(built.book),canonicalRows=clauseRows(built.book),runtimeRows=clauseRows(book);
const restored=canonicalRows.filter(row=>row.clause.rosterClassification==='BATTLE_ONLY');
const runtimeIndex=new Map(runtimeRows.map(row=>[row.id,row]));
assertBattlePreserved(built.book,book);
assert.equal(restored.length,111);
const counts=runtimeRows.reduce((out,{clause})=>{out[clause.rosterClassification]=(out[clause.rosterClassification]||0)+1;return out;},{});
assert.equal(runtimeRows.length,408);
assert.deepEqual(counts,{DISPLAY_ONLY:30,BATTLE_ONLY:304,NOT_AN_EFFECT:17,ROSTER_EXECUTABLE:57});
const executable=new Set(executableClauses(built).map(({rule,clause})=>`${rule.id}::${clause.id}`));
assert.deepEqual(new Set(runtimeRows.filter(row=>row.clause.rosterEffects.length).map(row=>row.id)),executable);
assert.equal(executable.size,57);
for(const row of runtimeRows)if(!executable.has(row.id))assert.deepEqual(row.clause.rosterEffects,[]);
for(const row of restored) {
  const result=runtimeIndex.get(row.id).clause;
  assert.deepEqual(result.evidence,row.clause.evidence);
  assert.deepEqual(result.sourceFields,row.clause.sourceFields);
  assert.deepEqual(result.roles,row.clause.roles);
  assert.deepEqual(result.conditions,row.clause.conditions);
}
const downgrade=structuredClone(book);
clauseRows(downgrade).find(row=>row.id===restored[0].id).clause.rosterClassification='DISPLAY_ONLY';
assert.throws(()=>assertBattlePreserved(built.book,downgrade),/Battle-only classification lost/);

for(const id of ['detachment-huron-s-marauders:enhancement:1::roster-clause-1',
  'detachment-renegade-warband:rule::mustering-clause',deferredClause]) {
  assert.equal(runtimeIndex.get(id).clause.rosterClassification,'DISPLAY_ONLY');
  assert.deepEqual(runtimeIndex.get(id).clause.rosterEffects,[]);
}
assert.deepEqual(book.rosterDeferred.map(row=>row.id),[deferredClause]);

// Actual text import supplies every native owning datasheet. The lexical points
// values are parser inputs, not assertions about canonical/MFM costs. No battle
// state, Enhancement, Mark, equipment or attachment is invented for this probe.
const importBook=buildCSMImportBook(),records=new Map(importBook.entities.map(entity=>[entity.id,entity]));
const units=importBook.entities.filter(entity=>entity.kind==='DATASHEET');
const text='+ FACTION KEYWORD: Chaos - Chaos Space Marines\n+ DETACHMENT: Veterans of the Long War\n\n'+
  units.map(unit=>{
    const models=unit.data.profileIds.map(id=>records.get(id));
    return `${models.reduce((n,model)=>n+model.data.composition.quantity.min,0)}x ${unit.data.title} (100 pts)\n`+
      models.map(model=>`• ${model.data.composition.quantity.min}x ${model.data.name}`).join('\n');
  }).join('\n\n');
const imported=createCSMRosterImport(importBook).import(text);
assert.equal(imported.status,'READY');assert.equal(imported.roster.units.length,54);
const bindings=JSON.parse(fs.readFileSync(new URL('./roster-attachment-bindings.json',import.meta.url),'utf8'));
const service=createCSMRosterRuntime(book,importBook,bindings);service.load(imported.roster);
const projection=service.projection,compiler=createCSMCompatibilityCompiler(built,built.schema.evaluator);
const canonicalIndex=new Map(built.book.entities.map(entity=>[entity.id,entity]));
let runtimeUnknown=0,referenceUnknown=0;
for(const row of restored) {
  const targets=projection.units.filter(unit=>unit.canonicalUnitId===row.owner.parentId);
  if(targets.length) {
    for(const unit of targets)assert.ok(unit.conditional.some(entry=>entry.ruleId===row.owner.id&&
      entry.clauseId===row.clause.id&&entry.state==='UNKNOWN'),'Missing physical conditional: '+row.id);
    runtimeUnknown++;
  }else {
    // Preserve the existing reference route for Army Rules and nested named
    // components. Never fabricate parents or add global Army Rule dispatch.
    let parent=row.owner;
    while(parent&&parent.kind!=='DATASHEET')parent=canonicalIndex.get(parent.parentId);
    const unitId=parent?.id||built.facts.entities.find(entity=>
      entity.kind==='ARMY_RULE_MEMBERSHIP'&&entity.data.armyRuleId===row.owner.id)?.ownerId;
    assert.ok(unitId,'Unresolved canonical reference recipient: '+row.id);
    const result=compiler.evaluateRule(unitId,row.owner.id);
    assert.equal(result.state,'UNKNOWN');assert.equal(result.applicability,'CONDITIONAL');
    referenceUnknown++;
  }
  assert.ok(!projection.units.some(unit=>unit.applied.some(entry=>entry.ruleId===row.owner.id&&entry.clauseId===row.clause.id)));
}
assert.equal(runtimeUnknown,106);assert.equal(referenceUnknown,5);
const darkPacts=runtimeIndex.get('army-rule-dark-pacts::source-clause');
assert.equal(darkPacts.clause.rosterClassification,'BATTLE_ONLY');
assert.deepEqual(darkPacts.clause.rosterEffects,[]);
for(const unit of projection.units)for(const entry of unit.applied)
  assert.ok(executable.has(`${entry.ruleId}::${entry.clauseId}`),'Non-roster clause executed');
assert.equal(JSON.stringify(book),snapshot);assert.equal(JSON.stringify(built.book),canonicalSnapshot);
console.log(JSON.stringify({status:'PASS',total:408,counts,restored:restored.length,lost:0,
  runtimeUnknown,referenceUnknown,darkPactsConditional:'PASS',executableSetDelta:0,battleEffectLeakage:0,
  syntheticDowngradeMutationsRejected:3,actualDowngradeMutationRejected:true,trueDisplayOnly:'PASS',deferredG1:'PASS'}));
