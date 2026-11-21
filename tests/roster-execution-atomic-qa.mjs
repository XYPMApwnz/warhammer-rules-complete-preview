/** Fault injection uses disposable books/evaluators, never accepted artifacts. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=process.argv.find(arg=>arg.startsWith('--root='))?.slice(7)||fileURLToPath(new URL('../',import.meta.url));
const load=file=>import(pathToFileURL(path.join(root,file))),clone=structuredClone;
const observed=service=>JSON.stringify({snapshot:service.snapshot(),state:service.state,projection:service.projection,
  context:service.state.units.map(unit=>service.context(unit.instanceId)),
  effective:service.state.units.map(unit=>service.effective(unit.instanceId)),related:service.state.units.map(unit=>service.related(unit.instanceId))},
  (_key,value)=>value instanceof Set?[...value]:value);
const checks=[];
const csm=await load('books/chaos-space-marines/v2/roster-runtime-qa.mjs');
const {createCSMBrowserRoster}=await load('books/chaos-space-marines/v2/roster-boot.mjs');
const fixture=csm.fixtures.find(row=>row.owner==='detachment-chaos-cult:enhancement:4');assert(fixture);
const faultBook=clone(csm.book),rule=faultBook.entities.find(row=>row.id===fixture.owner),effect=rule.ruleContract.clauses.find(row=>row.id===fixture.clauseId).rosterEffects.find(effect=>
  effect.conditions.some(condition=>condition.predicate.arguments?.key==='attached'&&condition.predicate.arguments.equals===true));assert(effect);
// The typed prerequisite remains intact. Only its test-clone operation is made
// capable of failing on application, after the independent first pass succeeds.
delete effect.ability;Object.assign(effect,{operation:'MODIFY_STAT',field:'M',mode:'ADD',value:1});
const state=csm.imported(fixture),source=state.units[0],profile=faultBook.entities.find(row=>row.id===source.modelRows[0].canonicalProfileId);
const bodyguard=state.units[fixture.attachments[0].bodyguardOrdinal-1],reference='synthetic-atomic-scouts';
faultBook.entities.push({id:reference,kind:'RULE_REFERENCE',parentId:bodyguard.canonicalUnitId,
  provenance:{sourceId:'synthetic-fault-injection'},data:{label:'Scouts 6 (synthetic fault input)'}});
faultBook.rosterReferenceSemantics[reference]={abilities:[{canonicalId:'core-scouts',parameters:{distance:6}}]};
faultBook.entities.find(row=>row.id===bodyguard.canonicalUnitId).data.ruleReferenceIds.push(reference);
if(profile.data.stats)profile.data.stats.M='INVALID_TEST_EXPRESSION';else profile.data.M='INVALID_TEST_EXPRESSION';
const service=createCSMBrowserRoster(faultBook,csm.importBook,csm.bindings);service.load(state);const before=observed(service);
const target=state.units[fixture.attachments[0].bodyguardOrdinal-1].instanceId;
assert.throws(()=>service.attach(source.instanceId,target),error=>error instanceof TypeError&&
  error.message==='Unsupported characteristic expression: INVALID_TEST_EXPRESSION'&&error.stack.includes('executeRosterEffects'));
assert.equal(observed(service),before,'Second-pass CSM failure published a partial generation');checks.push('CSM second-pass interpreter failure preserves snapshot/state/context/projection/effective/related');
const invalid=clone(state);invalid.units[0].modelRows[0].canonicalProfileId='foreign-profile';
assert.throws(()=>service.load(invalid),/profile|canonical/i);assert.equal(observed(service),before);checks.push('CSM admission rejection preserves all observations');

const {buildECRosterAttachmentBook}=await load('books/emperors-children/v2/roster-attachment-build.mjs');
const {createECRosterAttachments}=await load('books/emperors-children/v2/roster-attachments.mjs');
const {createECBrowserRoster}=await load('books/emperors-children/v2/roster-boot.mjs');
const {book,schema}=buildECRosterAttachmentBook();let armed=false;
const guarded={...schema,evaluatePredicate:(node,context)=>{if(armed)throw new TypeError('Injected EC interpreter failure');return schema.evaluatePredicate(node,context);}};
const input=JSON.parse(fs.readFileSync(path.join(root,'books/emperors-children/v2/roster-import-fixtures.json'))).fixtures.find(row=>row.id==='character-bodyguard').text;
const ec=createECRosterAttachments(book,guarded);assert.equal(ec.import(input).status,'READY');
const snapshot=ec.snapshot(),ecObserved=()=>JSON.stringify({snapshot:ec.snapshot(),state:ec.state,projection:ec.projection,
  context:ec.state.units.map(unit=>ec.context(unit.instanceId)),effective:ec.state.units.map(unit=>ec.effective(unit.instanceId))},(_key,value)=>value instanceof Set?[...value]:value);
const ecBefore=ecObserved();armed=true;
assert.throws(()=>ec.load(snapshot),error=>error instanceof TypeError&&error.message==='Injected EC interpreter failure'&&error.stack.includes('executeRosterEffects'));
armed=false;assert.equal(ecObserved(),ecBefore);checks.push('EC interpreter failure preserves its entire published generation');
const browser=createECBrowserRoster(book);assert.equal(browser.import(input).status,'READY');const allBefore=observed(browser);
const history=browser.snapshot();history.initialAttachmentStep='UNCONFIRMED';history.initialAttachments=[];
assert.throws(()=>browser.load(history),/Unconfirmed initial attachment timing/);assert.equal(observed(browser),allBefore);
checks.push('EC historical attachment rejection preserves browser effective and related');
const choice=browser.snapshot();choice.units[0].selectedUpgradeIds=['foreign-choice'];
assert.throws(()=>browser.load(choice),/choice|option/i);assert.equal(observed(browser),allBefore);checks.push('EC foreign weapon decision preserves browser effective and related');
console.log(JSON.stringify({status:'PASS',checks,scope:'Fault-injection controls, not gameplay facts',root}));
