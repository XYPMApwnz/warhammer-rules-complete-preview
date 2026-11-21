import {cleanupQaTempDir,createQaTempDir,getQaTmpRoot} from '../../../tests/helpers/qa-temp.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {isDeepStrictEqual} from 'node:util';
import {buildCSMContracts,compileCSMContracts,artifacts,readJson,declarationFiles,directory} from './rule-contract-build.mjs';
import {rejectPairwiseAuthority} from '../../shared/rule-contract-v2/compatibility.mjs';

const root=path.resolve(directory,'../../..'),facts=readJson('generated/effective.json'),snapshot=JSON.stringify(facts);
const inputs=declarationFiles.map(readJson),built=buildCSMContracts({facts,inputs:structuredClone(inputs)});
const compiled=compileCSMContracts(built),outputs=artifacts(built,compiled);
assert.equal(JSON.stringify(facts),snapshot,'Immutable factual foundation changed');
assert.equal(built.classifications.size,inputs.reduce((n,input)=>n+input.owners.length,0));
assert.equal(built.book.entities.filter(entity=>entity.ruleContract).length,built.declarations.size);
assert.equal(compiled.summary.INVALID,0);
for(const row of compiled.projection.rows) {
  if(built.classifications.get(row.ruleId).status==='BATTLE_ONLY_NO_RUNTIME_NEEDED')
    assert.notEqual(row.applicability,'MATCH','Unknown battle state was made active: '+row.ruleId);
}

// Every factual record belongs either to the independent semantic census or to
// its explicit fact/reference partition. No generated pairwise answer is input.
assert.deepEqual(new Set(built.inventory.map(row=>row.id)),new Set(facts.entities.map(entity=>entity.id)));
for(const entity of built.book.entities)assert.ok(!Object.hasOwn(entity,'rosterEffects'));
assert.equal(facts.ruleContractsStarted,false);
assert.equal(facts.rosterRuntimeStarted,false);

// Source statlines and composition roles are deliberately different sets.
const members=facts.entities.filter(entity=>entity.kind==='COMPOSITION_MEMBER');
assert.deepEqual(new Set(built.profileBindings.map(row=>row.profileId)),new Set(members.map(row=>row.id)));
const sourceIndex=new Map(facts.entities.map(entity=>[entity.id,entity]));
let scopeChecks=0;
for(const member of members) {
  const row=built.profileBindings.find(row=>row.profileId===member.id);
  const expected=facts.entities.filter(entity=>['KEYWORD_MEMBERSHIP','FACTION_KEYWORD'].includes(entity.kind)&&
    entity.ownerId===member.ownerId&&entity.data.compositionMemberSourceIds.includes(member.id)).map(entity=>entity.data.keyword);
  assert.deepEqual(new Set(row.intrinsicKeywords),new Set(expected));
  const context=compiled.compiler.context(row.unitId,'MODEL',{profileId:row.profileId});
  assert.deepEqual(context.intrinsicKeywords,new Set(expected));
  assert.deepEqual(context.roster,{});
  assert.deepEqual(context.battle,{});
  assert.equal(context.modelId,member.id);
  assert.ok(sourceIndex.has(member.data.composition.modelProfileSourceId));
  scopeChecks++;
}

// Validate actual statically impossible, unknown and invalid predicate states.
const evaluator=built.schema.evaluator;
const profiles=built.profileBindings;
const modelContext=compiled.compiler.context(profiles[0].unitId,'MODEL',{profileId:profiles[0].profileId});
assert.equal(evaluator.evaluatePredicate({predicate:'MODEL_KEYWORD',subject:'MODEL',contextLevel:'STATIC',
  arguments:{keyword:'SYNTHETIC_ABSENT_KEYWORD'}},modelContext),'FALSE');
assert.equal(evaluator.evaluatePredicate({predicate:'MODEL_ID',subject:'MODEL',contextLevel:'STATIC',
  arguments:{id:profiles[0].profileId}},modelContext),'TRUE');
assert.equal(evaluator.evaluatePredicate({predicate:'MODEL_ID',subject:'UNIT',contextLevel:'STATIC',
  arguments:{id:profiles[0].profileId}},modelContext),'INVALID');
for(const [key,spec] of Object.entries(built.schema.stateFields)) {
  const node={predicate:'FIELD',subject:'MODEL',contextLevel:spec.contextLevel,
    arguments:{key,equals:spec.valueType==='boolean'?true:spec.valueType==='number'?1:'SYNTHETIC_VALUE'}};
  if(!spec.intrinsicAllKeywords)assert.equal(evaluator.evaluatePredicate(node,modelContext),'UNKNOWN');
}

// Physical input is supplied only by the test; no importer/effects are wired.
const physical=(id,subject,fields={})=>({subject,instanceId:id,unitId:profiles[0].unitId,
  ...(subject==='MODEL'?{modelId:profiles[0].profileId}:{}),keywords:new Set(profiles[0].intrinsicKeywords),
  abilities:new Set(),owner:{unitId:profiles[0].unitId,instanceId:id,keywords:new Set(profiles[0].intrinsicKeywords),unknownKeywords:new Set()},
  roster:fields,battle:{}});
for(const subject of ['MODEL','UNIT','FORMED_ATTACHED_UNIT','ROSTER']) {
  const context=compiled.compiler.context(profiles[0].unitId,subject,{mode:'ROSTER',profileId:profiles[0].profileId,
    instanceId:'physical-a',availableContext:(_identity,kind)=>physical('physical-a',kind)});
  assert.equal(context.subject,subject);
  assert.equal(context.instanceId,'physical-a');
}
assert.throws(()=>compiled.compiler.context(profiles[0].unitId,'MODEL',{mode:'ROSTER',profileId:profiles[0].profileId,
  instanceId:'physical-a',availableContext:(_identity,kind)=>physical('physical-b',kind)}),/identity|owner/i);
assert.throws(()=>compiled.compiler.context(profiles[0].unitId,'MODEL',{mode:'ROSTER',profileId:profiles[0].profileId,
  instanceId:'physical-a',availableContext:(_identity,kind)=>({...physical('physical-a',kind),modelId:'FOREIGN_PROFILE'})}),/profile identity/i);
for(const entity of built.book.entities.filter(entity=>entity.ruleContract?.detachmentId)) {
  assert.equal(compiled.compiler.evaluateRule(profiles[0].unitId,entity.id,{detachmentIds:[]}).applicability,
    'NO_MATCH','Unselected Detachment entered applicability');
}

// Canonical Army Rule membership is a static relationship, not a guessed
// roster field. Optional mark assignments must remain unavailable in book mode.
const pacts=built.declarations.get('army-rule-dark-pacts');
assert.equal(pacts.roles[0].selector.op,'ANY');
assert.deepEqual(new Set(pacts.roles[0].selector.args.map(node=>node.arguments.id)),new Set(facts.entities
  .filter(entity=>entity.kind==='ARMY_RULE_MEMBERSHIP'&&entity.data.armyRuleId==='army-rule-dark-pacts')
  .map(entity=>entity.ownerId)));
for(const node of pacts.roles[0].selector.args)assert.equal(node.contextLevel,'STATIC');
for(const [key,spec] of Object.entries(built.schema.stateFields))if(key.startsWith('sourceBackedModelMark:'))
  assert.equal(spec.contextLevel,'ROSTER');
for(const row of built.classifications.values())if(row.declaration?.assignment) {
  const role=row.declaration.roles.find(role=>role.id===row.declaration.assignment.ownerRoleId);
  assert.equal(role.subject,'MODEL');
  const key='enhancementAssigned:'+row.ruleId;
  const condition=role.conditions.find(node=>node.predicate==='FIELD'&&node.arguments.key===key);
  assert.ok(condition,'Physical Enhancement assignment prerequisite missing');
  const ownerContext={...modelContext,roster:{[key]:true},instanceId:'owner-a'};
  const otherContext={...modelContext,roster:{[key]:false},instanceId:'owner-b'};
  assert.equal(evaluator.evaluatePredicate(condition,ownerContext),'TRUE');
  assert.equal(evaluator.evaluatePredicate(condition,otherContext),'FALSE');
}

const mutationInputs=()=>structuredClone(inputs);
let mutations=0;
const rejects=fn=>{assert.throws(fn);mutations++;};
rejects(()=>{const changed=mutationInputs();changed[0].owners.pop();buildCSMContracts({inputs:changed});});
rejects(()=>{const changed=mutationInputs();changed[0].owners.push(structuredClone(changed[0].owners[0]));buildCSMContracts({inputs:changed});});
rejects(()=>{const changed=mutationInputs(),row=changed.flatMap(input=>input.owners).find(row=>row.declaration);
  row.evidence[0].quote='SOURCE_EVIDENCE_SEVERED';buildCSMContracts({inputs:changed});});
rejects(()=>{const changed=mutationInputs(),row=changed.flatMap(input=>input.owners).find(row=>row.declaration);
  row.declaration.sourceFields=[['ABSENT_CANONICAL_FIELD']];buildCSMContracts({inputs:changed});});
rejects(()=>{const changed=mutationInputs(),row=changed.flatMap(input=>input.owners).find(row=>row.declaration?.detachmentId);
  row.declaration.detachmentId='UNRESOLVED_DETACHMENT';buildCSMContracts({inputs:changed});});
rejects(()=>{const changed=structuredClone(built.book),entity=changed.entities.find(entity=>entity.ruleContract);
  entity.ruleContract.sourceId='SEVERED';evaluator.validateContracts(changed);});
rejects(()=>{const changed=structuredClone(built.book),entity=changed.entities.find(entity=>entity.ruleContract);
  entity.ruleContract.roles[0].subject=entity.ruleContract.roles[0].subject==='MODEL'?'UNIT':'MODEL';evaluator.validateContracts(changed);});
rejects(()=>{const changed=structuredClone(built.book);
  changed.authoritativeAnswers={[profiles[0].unitId]:{[built.declarations.keys().next().value]:'MATCH'}};rejectPairwiseAuthority(changed);});
rejects(()=>{const changed=mutationInputs(),row=changed.flatMap(input=>input.owners).find(row=>row.blockers);
  row.blockers[0].evidence.quote='UNPROVEN_CAPABILITY_CONSUMER';buildCSMContracts({inputs:changed});});
rejects(()=>{const changed=mutationInputs(),row=changed.flatMap(input=>input.owners).find(row=>row.declaration);
  row.declaration.clauses[0].rosterEffects=[];buildCSMContracts({inputs:changed});});
rejects(()=>{const changed=mutationInputs(),row=changed.flatMap(input=>input.owners).find(row=>
  row.declaration?.clauses.some(clause=>clause.semanticEffects?.length));
  row.declaration.clauses.find(clause=>clause.semanticEffects?.length).semanticEffects[0].recipientRoleId='FOREIGN_MODEL';
  buildCSMContracts({inputs:changed});});
assert.ok(isDeepStrictEqual(compiled.projection,compileCSMContracts(buildCSMContracts()).projection),'Rebuild not deterministic');

// Closed import/read set: no legacy CSM, other army facts or earlier QA artifacts.
const temporary=createQaTempDir('csm-contract-source-only-');
assert.ok(path.resolve(temporary).startsWith(path.resolve(getQaTmpRoot())+path.sep));
try {
  const files=[...declarationFiles.map(name=>'books/chaos-space-marines/v2/'+name),
    ...['rule-contract-build.mjs','rule-contract-context.mjs','identity-bindings.json','generated/effective.json'].map(name=>'books/chaos-space-marines/v2/'+name),
    ...['schema.mjs','bindings.mjs','compatibility.mjs'].map(name=>'books/shared/rule-contract-v2/'+name),
    ...['compatibility-context.mjs','compatibility-feasibility.mjs'].map(name=>'books/shared/roster-v2/'+name)];
  for(const file of files) {
    const target=path.join(temporary,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,file),target);
  }
  const entry=pathToFileURL(path.join(temporary,'books/chaos-space-marines/v2/rule-contract-build.mjs')).href;
  const script=`import {buildCSMContracts,compileCSMContracts,artifacts} from ${JSON.stringify(entry)};
    const built=buildCSMContracts(); console.log(JSON.stringify(artifacts(built,compileCSMContracts(built))));`;
  const result=JSON.parse(execFileSync(process.execPath,['--input-type=module','-e',script],{cwd:temporary,encoding:'utf8',maxBuffer:32*1024*1024}));
  assert.ok(isDeepStrictEqual(result,outputs),'Closed canonical-input contract build differs');
} finally {cleanupQaTempDir(temporary);}

for(const [name,value] of Object.entries(outputs))assert.equal(
  fs.readFileSync(path.join(directory,'generated',name+'.json'),'utf8'),JSON.stringify(value,null,2)+'\n',
  'Generated semantic artifact differs from current declarations: '+name);

console.log(JSON.stringify({status:'PASS',owners:built.classifications.size,validContracts:built.declarations.size,
  counts:outputs['rule-contract-census'].counts,compatibility:compiled.summary,modelScopeChecks:scopeChecks,
  mutationsRejected:mutations,closedCanonicalInputBuild:'PASS',legacyContractReads:0,
  rosterEffectDeclarations:0,newRuntimeCapabilities:0,armyBookUI:0}));
