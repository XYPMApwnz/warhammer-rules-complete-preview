import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRuleContractSchema} from './schema.mjs';
import {mergeContractDeclarations,inspectDeclarationEvidence,bindClauseCondition,
  createContractClause,bindDeclarationClauses,bindAttackTarget,bindDurationRecipients,
  bindCanonicalContract,validateContractBinding} from './bindings.mjs';

// Independently authored typed input. Evidence is checked literally, never parsed.
const text='Synthetic target not engaged; excluding VEHICLE. Synthetic effect until boundary.';
const evidence={field:['text'],quote:text};
const atom=(predicate,subject,contextLevel,args)=>({predicate,subject,contextLevel,arguments:args,evidence});
const always=subject=>atom('ALWAYS',subject,'STATIC',{});
const role=(id,subject)=>({id,subject,allegiance:'FRIENDLY',selector:always(subject),conditions:[]});
const kernel=createRuleContractSchema({contractSchema:'synthetic/v2',
  stateFields:{engaged:{contextLevel:'BATTLE',valueType:'boolean'}}});
function fixture(bookId) {
  const entity={id:bookId+':rule',parentId:bookId+':detachment',kind:'STRATAGEM',
    provenance:{sourceId:bookId+':source'},data:{text,cp:1}};
  const model={bookId,entities:[entity,{id:entity.parentId,kind:'DETACHMENT'}]};
  const primary=role('target','UNIT'),bearer=role('bearer','MODEL'),other=role('other-bearer','MODEL'),event=role('event','ROSTER');
  primary.selector={op:'NOT',args:[atom('UNIT_KEYWORD','UNIT','STATIC',{keyword:'VEHICLE'})]};
  primary.conditions=[atom('FIELD','UNIT','BATTLE',{key:'engaged',equals:false})];
  const clause=createContractClause({id:bookId+':effect',roles:[bearer,other,event],
    conditions:[{...atom('FIELD','MODEL','BATTLE',{key:'engaged',equals:false}),roleId:'bearer'}],
    sourceFields:[['text']],operation:'SYNTHETIC_EFFECT',effectRecipientRoleIds:['bearer','event']});
  const start=text.indexOf('until boundary');
  const duration=bindDurationRecipients(entity.id,{field:['text'],quote:text},[
    {id:bookId+':expiry',endpoint:'EXPLICIT_SOURCE_BOUNDARY',evidence:{field:['text'],quote:'until boundary'},
      sourceOccurrence:{start,end:start+'until boundary'.length},sourceFields:[['text']]}],[clause]);
  const declaration={kind:'STRATAGEM',executionMode:'BATTLE_ACTION',contextLevel:'BATTLE',
    detachmentId:entity.parentId,cp:1,timing:{conditions:[],sourceFields:[['text']]},
    roles:[primary,bearer,other,event],conditions:[],clauses:[clause],duration,restrictions:[],sourceFields:[['text']]};
  const input={entity,bookId,schema:'synthetic/v2',declaration,
    currentness:{status:'CURRENT',sourceIds:[entity.provenance.sourceId]},
    index:new Map(model.entities.map(record=>[record.id,record]))};
  entity.ruleContract=bindCanonicalContract(input);
  return {input,model,contract:entity.ruleContract};
}
const a=fixture('amber'),b=fixture('blue');
const checks=[],mutations=[];
const check=(name,run)=>{run();checks.push(name);};
const guard=(test,contract)=>{
  validateContractBinding(test.input,contract);
  kernel.validateContractDeclarations({...test.model,entities:test.model.entities.map(entity=>
    entity.id===test.input.entity.id?{...entity,ruleContract:contract}:entity)});
};
function mutation(name,change) {
  const contract=structuredClone(a.contract);
  change(contract);
  assert.throws(()=>guard(a,contract),undefined,name);
  mutations.push(name);
}
check('canonical construction, provenance, independent books and immutable input',()=>{
  for (const test of [a,b]) {
    guard(test,test.contract);
    assert.equal(test.contract.ruleId,test.input.entity.id);
    assert.deepEqual(test.contract.currentness,test.input.currentness);
    assert.deepEqual(test.contract.roles,test.input.declaration.roles);
    assert.equal(inspectDeclarationEvidence(test.input.declaration,test.input.index,test.input.entity),'BATTLE');
  }
  a.contract.roles[0].conditions.push(always('UNIT'));
  assert.equal(a.input.declaration.roles[0].conditions.length,1);
  assert.equal(b.contract.roles[0].conditions.length,1);
  a.contract.roles[0].conditions.pop();
  const invalid={...a.input,declaration:{...a.input.declaration,ruleId:'invented'}};
  assert.throws(()=>bindCanonicalContract(invalid),/cannot replace canonical/);
});
check('TARGET prerequisite and STATIC exclusion preserve evaluation',()=>{
  const target=a.contract.roles[0];
  const context=(keywords,battle)=>({subject:'UNIT',keywords:new Set(keywords),battle});
  assert.equal(kernel.evaluateRole(target,[],context([],{})),'UNKNOWN');
  assert.equal(kernel.evaluateRole(target,[],context([],{engaged:true})),'FALSE');
  assert.equal(kernel.evaluateRole(target,[],context([],{engaged:false})),'TRUE');
  assert.equal(kernel.evaluateRole(target,[],context(['VEHICLE'],{})),'FALSE');
  const dropped=structuredClone(target);dropped.conditions=[];
  assert.equal(kernel.evaluateRole(dropped,[],context([],{engaged:true})),'TRUE');
});
check('owner default and exact same-subject participant binding',()=>{
  const owner=role('owner','MODEL'),recipient=role('recipient','MODEL');
  const condition=atom('FIELD','MODEL','BATTLE',{key:'engaged',equals:false});
  assert.deepEqual(bindClauseCondition(structuredClone(condition),owner,[recipient]),condition);
  const explicit={...condition,roleId:'recipient'};
  assert.deepEqual(bindClauseCondition(structuredClone(explicit),owner,[recipient]),explicit);
  assert.throws(()=>bindClauseCondition({...condition,roleId:'missing'},owner,[recipient]),/Unresolved/);
  assert.throws(()=>bindClauseCondition({...condition,subject:'UNIT',roleId:'recipient'},owner,[recipient]),/subject differs/);
  const declaration={roles:[owner],sourceFields:[['text']],clauses:[
    createContractClause({id:'event',roles:[recipient],conditions:[explicit],sourceFields:[['other']]})]};
  bindDeclarationClauses(declaration);
  assert.deepEqual(declaration.sourceFields,[['text'],['other']]);
  assert.equal(declaration.clauses[0].conditions[0].roleId,'recipient');
});
check('explicit attack target and recipient validation',()=>{
  const actor=role('actor','MODEL'),recipient={...role('enemy','UNIT'),allegiance:'ENEMY'};
  const clause=createContractClause({id:'attack',roles:[actor],conditions:[],sourceFields:[['text']],effectRecipientRoleIds:['actor']});
  bindAttackTarget({recipient,actor,clause});
  assert.equal(recipient.actorRoleId,actor.id);
  assert.equal(clause.roles[1],recipient);
  assert.throws(()=>bindAttackTarget({recipient,actor:role('other','MODEL'),clause}),/missing/);
  assert.throws(()=>createContractClause({...clause,effectRecipientRoleIds:['missing']}),/recipient/);
});
check('lifetime includes MODEL and ROSTER recipients without subject filtering',()=>{
  const lifetime=a.contract.duration[0];
  assert.deepEqual(lifetime.roleIds,['bearer','event']);
  assert.deepEqual(lifetime.bindings,[{clauseId:'amber:effect',roleIds:['bearer','event']}]);
  const unspecified={id:'unspecified',endpoint:'NOT_EXPLICIT',inferredExpiry:false,sourceFields:[['text']]};
  assert.deepEqual(bindDurationRecipients('rule',{field:['text'],quote:text},[unspecified],[]),[unspecified]);
});
check('separate source occurrences bind only their declared clause scopes',()=>{
  const source={field:['text'],quote:'First until alpha. Second until beta.'};
  const scopes=['First until alpha.','Second until beta.'];
  const clauses=scopes.map((quote,index)=>createContractClause({id:'effect:'+index,
    roles:[role('recipient:'+index,'UNIT')],conditions:[],sourceFields:[source.field],
    effectRecipientRoleIds:['recipient:'+index],lifetimeEvidence:{field:source.field,quote}}));
  const declarations=['until alpha','until beta'].map((quote,index)=>({id:'expiry:'+index,
    endpoint:'EXPLICIT_SOURCE_BOUNDARY',evidence:{field:source.field,quote},
    sourceOccurrence:{start:source.quote.indexOf(quote),end:source.quote.indexOf(quote)+quote.length},sourceFields:[source.field]}));
  const bound=bindDurationRecipients('rule',source,declarations,clauses);
  assert.deepEqual(bound.map(value=>value.bindings.map(binding=>binding.clauseId)),[['effect:0'],['effect:1']]);
  delete clauses[0].lifetimeEvidence;
  assert.throws(()=>bindDurationRecipients('rule',source,declarations,clauses),/multiple lifetimes/);
});
check('evidence is exact and cannot cross book registries',()=>{
  for (const evidence of [{field:['missing'],quote:text},{field:['text'],quote:'invented'},
    {field:['text'],quote:text,otherEntityId:'blue:rule'}]) {
    assert.throws(()=>inspectDeclarationEvidence({evidence},a.input.index,a.input.entity));
  }
});
check('duplicate canonical semantic owner rejection',()=>{
  assert.equal(mergeContractDeclarations([new Map([['amber:rule',a.input.declaration]]),
    new Map([['blue:rule',b.input.declaration]])]).size,2);
  assert.throws(()=>mergeContractDeclarations([new Map([['same',{}]]),new Map([['same',{}]])]),/semantic owner/);
  const duplicate={...a.model,entities:[...a.model.entities,structuredClone(a.model.entities[0])]};
  assert.throws(()=>kernel.validateContractDeclarations(duplicate),/duplicate independent semantic owner/);
});
mutation('TARGET prerequisite removed',contract=>{contract.roles[0].conditions=[];});
mutation('STATIC exclusion moved to BATTLE',contract=>{contract.roles[0].selector.args[0].contextLevel='BATTLE';});
mutation('MODEL subject changed to UNIT',contract=>{contract.roles[1].subject='UNIT';});
mutation('UNIT subject changed to MODEL',contract=>{contract.roles[0].subject='MODEL';});
mutation('condition bound to wrong same-subject role',contract=>{contract.clauses[0].conditions[0].roleId='other-bearer';});
mutation('duration detached from ROSTER recipient',contract=>{contract.duration[0].bindings[0].roleIds.pop();});
mutation('duration detached from MODEL recipient',contract=>{contract.duration[0].bindings[0].roleIds.shift();});
mutation('duration binding removed entirely',contract=>{contract.duration[0].bindings=[];});
mutation('source binding severed',contract=>{contract.sourceId='other-source';});
mutation('currentness provenance severed',contract=>{contract.currentness.sourceIds=[];});
mutation('evidence binding severed',contract=>{delete contract.roles[0].conditions[0].evidence;});
mutation('canonical owner identity changed',contract=>{contract.ruleId='blue:rule';});
assert.throws(()=>mergeContractDeclarations([new Map([[a.contract.ruleId,a.input.declaration]]),
  new Map([[a.contract.ruleId,structuredClone(a.input.declaration)]])]),/semantic owner/);
mutations.push('duplicate semantic owner');

// Execute from a directory containing only the shared kernel, binder and this QA.
// No book data, declarations or repository imports can satisfy these guards.
if (!process.argv.includes('--isolated-child')) {
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'typed-bindings-qa-'));
  try {
    for (const file of ['schema.mjs','recipients.mjs','bindings.mjs','bindings-qa.mjs'])
      fs.copyFileSync(new URL(file,import.meta.url),path.join(directory,file));
    const result=JSON.parse(execFileSync(process.execPath,[path.join(directory,'bindings-qa.mjs'),'--isolated-child'],{encoding:'utf8'}));
    assert.equal(result.status,'PASS');
  } finally {fs.rmSync(directory,{recursive:true,force:true});}
}
console.log(JSON.stringify({status:'PASS',sharedGuardGroups:checks.length,mutationsDetected:mutations.length,
  sharedGuardsRunWithoutBookData:'PASS',checks,mutations},null,2));
