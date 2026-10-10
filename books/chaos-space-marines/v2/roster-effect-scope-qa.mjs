/** Independent expected-output and mutation controls for the declaration layer.
 * Inputs use canonical identities; no importer or legacy CSM producer is used. */
import assert from 'node:assert/strict';
import {buildCSMRosterEffectBook} from './roster-effect-build.mjs';
import {evaluateCSMRosterDeclarations} from './roster-effect-context.mjs';
import {physical,fixtureState,assignBearer,clauseFixture} from './roster-effect-fixture.mjs';
import {changeAttachment,formRoster} from '../../shared/roster-v2/context.mjs';

const book=buildCSMRosterEffectBook(),snapshot=JSON.stringify(book),clone=structuredClone,checks=[];
const project=(state,input=book)=>evaluateCSMRosterDeclarations(input,state);
const unit=(result,id)=>result.units.find(u=>u.instanceId===id);
const applied=(result,id)=>result.units.flatMap(u=>u.applied).filter(r=>r.ruleId===id);
const stat=(profile,field)=>profile.profile.stats?.[field]??profile.profile[field];
function test(name,fn){fn();checks.push(name);}
function mutation(name,mutate,oracle){const altered=clone(book);mutate(altered);assert.throws(()=>oracle(altered),undefined,name);checks.push(name);}

test('Bearer MODEL and owned weapon inventory exclude siblings and aggregate selections',()=>{
  const id='detachment-pactbound-zealots:enhancement:4';
  const a=physical(book,'a','unit-dark-apostle',[id]),b=physical(book,'b','unit-dark-apostle');
  a.selectedMarkId='detachment-pactbound-zealots:rule:mark:1';
  const state=fixtureState(book,'detachment-pactbound-zealots',[a,b,physical(book,'bodyguard','unit-legionaries')]);
  assignBearer(book,state,'a',id,a.modelRows[0].canonicalProfileId);
  const yes=project(state),base=formRoster(book,state),owner=unit(yes,'a').profiles[0];
  assert.ok(applied(yes,id).length);
  assert.ok(applied(yes,id).every(r=>r.targetCompositionId===owner.scopeId));
  assert.deepEqual(unit(yes,'a').profiles[1].weapons,unit(base,'a').profiles[1].weapons);
  assert.equal(unit(yes,'b').applied.filter(r=>r.ruleId===id).length,0);
  const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','a','bodyguard');
  assert.equal(unit(project(attached),'bodyguard').applied.filter(r=>r.ruleId===id).length,0);
  const unknown=clone(state);unknown.units[0].selections=clone(a.modelRows[0].selections);
  unknown.units[0].modelRows[0].selections=[];
  assert.equal(applied(project(unknown),id).length,0,'Aggregate equipment must not fabricate a mixed-profile bearer inventory');
  const restored=project(state);assert.deepEqual(restored,yes);
});

const bearerUnitIds=[
  'detachment-renegade-raiders:enhancement:3','detachment-dread-talons:enhancement:2',
  'detachment-nightmare-hunt:enhancement:1','detachment-nightmare-hunt:enhancement:4',
  'detachment-chaos-cult:enhancement:4','detachment-cult-of-the-arkifane:enhancement:2',
  'detachment-renegade-warband:enhancement:2','detachment-murdertalon-raiders:enhancement:1'];
for(const id of bearerUnitIds)test('Current bearer UNIT scope: '+id,()=>{
  const {state}=clauseFixture(book,id,'roster-clause-1');
  const attached=state.attachments.length?state:changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','a','bodyguard');
  const result=project(attached),rows=applied(result,id);
  assert.ok(rows.some(r=>r.targetInstanceId==='bodyguard'),'Missing bearer-unit recipient: '+id);
  assert.ok(rows.every(r=>['a','bodyguard'].includes(r.targetInstanceId)),'Unrelated bearer-unit recipient: '+id);
  // Already stronger canonical saves need no contribution on the bearer.
  if(id!=='detachment-murdertalon-raiders:enhancement:1')assert.ok(rows.some(r=>r.targetInstanceId==='a'),'Missing bearer: '+id);
  assert.ok(!rows.some(r=>['b','unrelated'].includes(r.targetInstanceId)));
  const detached=changeAttachment(book,attached,book.rosterAttachmentPolicies,'DETACH','a');
  assert.equal(unit(project(detached),'bodyguard').applied.filter(r=>r.ruleId===id).length,0);
  const reattached=changeAttachment(book,detached,book.rosterAttachmentPolicies,'ATTACH','a','bodyguard');
  assert.deepEqual(project(reattached),result);
});

test('Huron ninth scope binding is display-only, without executing battle permissions',()=>{
  const rule=book.entities.find(e=>e.id==='detachment-huron-s-marauders:enhancement:1'),clause=rule.ruleContract.clauses[0];
  assert.equal(clause.rosterClassification,'DISPLAY_ONLY');assert.deepEqual(clause.rosterEffects,[]);
  assert.equal(clause.rosterReferenceBinding.standaloneBinding,'SOURCE_UNIT');
  assert.equal(clause.rosterReferenceBinding.attachedBinding,'SOURCE_FORMED_MODELS');
  assert.deepEqual(clause.rosterReferenceBinding.canonicalRuleReferences,clause.effect.parameters.canonicalRuleReferences);
});

test('Independent physical roster order does not change global or bearer-unit results',()=>{
  for(const id of ['detachment-cult-of-the-arkifane:rule','detachment-renegade-raiders:enhancement:3']){
    const {state}=clauseFixture(book,id,'roster-clause-1');
    if(id.includes('enhancement'))state.attachments=[{leaderInstanceId:'a',bodyguardInstanceId:'bodyguard',role:'LEADER'}];
    const changed=clone(state);changed.units.reverse();
    const normalize=result=>({...result,units:[...result.units].sort((a,b)=>a.instanceId.localeCompare(b.instanceId))});
    assert.deepEqual(normalize(project(changed)),normalize(project(state)));
  }
});

test('Traitor Ogryn presence grants FNP only to the canonical CHARACTER profile',()=>{
  const id='datasheet-traitor-enforcer:section:1:block:1:text';
  const state=fixtureState(book,'detachment-veterans-of-the-long-war',[physical(book,'a','unit-traitor-enforcer')]);
  const result=project(state),profiles=unit(result,'a').profiles;
  assert.ok(profiles[0].abilities.some(a=>a.name==='Feel No Pain'&&a.value===4));
  assert.ok(!profiles[1].abilities.some(a=>a.name==='Feel No Pain'&&a.value===4));
  state.units[0].modelRows.splice(1,1);state.units[0].startingStrength=1;
  assert.equal(applied(project(state),id).length,0);
});

test('Helbrute exact equipped pair modifies only the two additional melee profiles',()=>{
  const id='datasheet-helbrute:section:1:block:1:text';
  const {state}=clauseFixture(book,id,'equipped-melee-attacks');
  const result=project(state),rows=applied(result,id);
  assert.deepEqual(new Set(rows.map(r=>r.targetWeaponProfileId)),new Set(['datasheet-helbrute:weapon:11','datasheet-helbrute:weapon:12']));
  assert.ok(rows.every(r=>Number.parseInt(r.after)===Number.parseInt(r.before)+2));
  const remove=clone(state);remove.units.forEach(u=>u.modelRows[0].selections.pop());
  assert.equal(applied(project(remove),id).length,0);
  assert.deepEqual(project(state),result);
});

const woundsId='detachment-creations-of-bile:enhancement:2';
const woundsState=clauseFixture(book,woundsId,'roster-clause-1').state;
function woundsOracle(input){
  const base=formRoster(book,woundsState),result=project(woundsState,input);
  assert.equal(Number.parseInt(stat(unit(result,'a').profiles[0],'W')),Number.parseInt(stat(unit(base,'a').profiles[0],'W'))+1);
  assert.deepEqual(unit(result,'b').profiles,unit(base,'b').profiles);
}
test('Independent Wounds +1 oracle and duplicate ownership',()=>woundsOracle(book));
mutation('Numeric value mutation is detected',input=>{
  input.entities.find(e=>e.id===woundsId).ruleContract.clauses[0].rosterEffects[0].value=2;
},woundsOracle);
mutation('Physical Enhancement assignment mutation is detected',input=>{
  input.entities.find(e=>e.id===woundsId).ruleContract.assignment.selector={predicate:'ALWAYS',subject:'MODEL',contextLevel:'STATIC',arguments:{}};
  // A changed owner selector cannot allow this Enhancement on a non-CHAOS LORD.
},input=>{
  const state=fixtureState(input,'detachment-creations-of-bile',[physical(input,'a','unit-dark-apostle',[woundsId])]);
  assignBearer(input,state,'a',woundsId,state.units[0].modelRows[0].canonicalProfileId);
  assert.equal(applied(project(state,input),woundsId).length,0);
});
mutation('Recipient selector mutation is detected',input=>{
  const clause=input.entities.find(e=>e.id==='datasheet-traitor-enforcer:section:1:block:1:text').ruleContract.clauses[0];
  clause.rosterEffects[0].conditions=clause.rosterEffects[0].conditions.filter(c=>c.binding!=='TARGET');
},input=>{
  const state=fixtureState(input,'detachment-veterans-of-the-long-war',[physical(input,'a','unit-traitor-enforcer')]);
  assert.ok(!unit(project(state,input),'a').profiles[1].abilities.some(a=>a.name==='Feel No Pain'&&a.value===4));
});
mutation('Bearer-unit binding narrowed to bearer mutation is detected',input=>{
  const clause=input.entities.find(e=>e.id==='detachment-renegade-raiders:enhancement:3').ruleContract.clauses[0];
  for(const effect of clause.rosterEffects)effect.targetBinding='SOURCE_MODEL';
},input=>{
  const {state}=clauseFixture(input,'detachment-renegade-raiders:enhancement:3','roster-clause-1');
  const attached=changeAttachment(input,state,input.rosterAttachmentPolicies,'ATTACH','a','bodyguard');
  assert.ok(unit(project(attached,input),'bodyguard').applied.some(r=>r.ruleId==='detachment-renegade-raiders:enhancement:3'));
});
assert.equal(JSON.stringify(book),snapshot);
console.log(JSON.stringify({status:'PASS',guards:checks.length,checks,canonicalImmutable:true,battleExecution:false}));
