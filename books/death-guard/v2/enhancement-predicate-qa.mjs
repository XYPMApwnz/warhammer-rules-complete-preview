import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {buildRuleContractV2,entityContext} from './rule-contract-build.mjs';
import {bindClauseCondition} from './rule-contract-enhancements.mjs';
import {evaluatePredicate,evaluateRole,publicResult,validateContracts} from './rule-contract-schema.mjs';

const directory=path.dirname(fileURLToPath(import.meta.url));
let census;
export function enhancementSourceCensus() {
  if (!census) {
    const bundled=path.join(os.homedir(),'.cache','codex-runtimes','codex-primary-runtime','dependencies','python','python.exe');
    const python=process.env.PYTHON||(fs.existsSync(bundled)?bundled:'python3');
    // Fresh raw HTML/PDF census, independently source-adjudicated expectations.
    // Neither the producer nor a generated contract supplies the denominator.
    census=JSON.parse(execFileSync(python,['-X','utf8',path.join(directory,'enhancement-predicate-source-qa.py')],{encoding:'utf8'}));
  }
  return census;
}
const semantics=value=>{
  if (Array.isArray(value)) return value.map(semantics);
  if (!value||typeof value!=='object') return value;
  return Object.fromEntries(Object.entries(value).filter(([key])=>!['evidence','sourceQuote'].includes(key)).map(([key,child])=>[key,semantics(child)]));
};
const roleShape=role=>({id:role.id,subject:role.subject,allegiance:role.allegiance,selector:semantics(role.selector),...(role.conditions?{conditions:semantics(role.conditions)}:{})});
const contractShape=contract=>({roles:contract.roles.map(roleShape),conditions:semantics(contract.conditions),clauses:contract.clauses.map(clause=>({id:clause.id,roles:clause.roles.map(roleShape),conditions:semantics(clause.conditions)}))});
function predicates(value,prefix=[]) {
  const result=[];
  const visit=(node,at)=>{
    if (!node||typeof node!=='object') return;
    if (node.predicate) result.push({node,at});
    for (const [key,child] of Object.entries(node)) if (child&&typeof child==='object') visit(child,[...at,key]);
  };
  visit(value,prefix);return result;
}
const get=(value,at)=>at.reduce((node,key)=>node[key],value);
export function assertEnhancementPredicateContexts(model) {
  const source=enhancementSourceCensus(),entities=model.entities.filter(entity=>entity.kind==='ENHANCEMENT');
  validateContracts(model);
  assert.deepEqual(new Set(entities.map(entity=>entity.id)),new Set(source.records.map(row=>row.id)),'Independent complete Enhancement source denominator');
  let predicateCount=0;
  for (const row of source.records) {
    const entity=entities.find(entity=>entity.id===row.id),contract=entity.ruleContract;
    assert.equal(entity.parentId,row.parentId,'Source Detachment identity');
    assert.equal(entity.data.text,row.sourceProof.text,'Accepted current Enhancement text');
    const actual=contractShape(contract),expected=semantics(row.expected);
    assert.deepEqual(actual,expected,`${row.id}: wrong predicate subject/context/role or invented/dropped attachment prerequisite`);
    assert.equal(contract.assignment.ownerRoleId,expected.roles[0].id,'Assignment owner role identity');
    assert.equal(contract.assignment.contextLevel,'ROSTER','Assignment context');
    assert.equal(contract.assignment.detachmentId,row.parentId,'Assignment Detachment identity');
    assert.deepEqual(semantics(contract.assignment.selector),expected.roles[0].selector,'Assignment cannot widen a source owner selector');
    predicateCount+=predicates(expected).length;
  }
  return {enhancementsScanned:source.records.length,predicatesChecked:predicateCount,wrongSubject:0,wrongContext:0,inventedAttachmentRequirement:0,droppedAttachmentRequirement:0,unresolved:0};
}

function run() {
  const model=buildRuleContractV2(),source=enhancementSourceCensus(),parity=assertEnhancementPredicateContexts(model),mutations=[];
  const contract=(m,id)=>m.entities.find(entity=>entity.id===id).ruleContract;
  const reject=(label,edit,guard=assertEnhancementPredicateContexts)=>{
    const changed=structuredClone(model);edit(changed);assert.throws(()=>guard(changed),undefined,label);mutations.push(label);
  };
  for (const row of source.records) for (const {node,at} of [...predicates(row.expected),...predicates(row.expected.roles[0].selector,['assignment','selector'])]) {
    reject(`subject ${row.id}/${at.join('/')}`,m=>{get(contract(m,row.id),at).subject=node.subject==='UNIT'?'FORMED_ATTACHED_UNIT':node.subject==='FORMED_ATTACHED_UNIT'?'UNIT':node.subject==='MODEL'?'UNIT':'MODEL';});
    reject(`context ${row.id}/${at.join('/')}`,m=>{get(contract(m,row.id),at).contextLevel=node.contextLevel==='BATTLE'?'ROSTER':'BATTLE';});
  }
  let coordinatedOwnerMutations=0;
  for (const row of source.records) {
    reject(`coordinated MODEL/UNIT owner confusion ${row.id}`,m=>{
      const actual=contract(m,row.id),owner=actual.roles[0],old=owner.subject,subject=old==='MODEL'?'UNIT':'MODEL';
      owner.subject=subject;
      for (const {node} of predicates(owner.selector)) {
        node.subject=subject;
        if (node.predicate===old+'_KEYWORD') node.predicate=subject+'_KEYWORD';
      }
      actual.assignment.selector=structuredClone(owner.selector);
      for (const {node} of predicates(actual.conditions)) if (node.subject===old) node.subject=subject;
      for (const clause of actual.clauses) for (const condition of clause.conditions) if (!condition.roleId||condition.roleId===owner.id) for (const {node} of predicates(condition)) node.subject=subject;
      validateContracts(m);
    });coordinatedOwnerMutations++;
  }
  // A coordinated subject change can satisfy schema types but still contradict
  // the source. Check BOTH directions for every unit/led-unit participant.
  let coordinatedScopeMutations=0;
  for (const row of source.records) for (const [index,clause] of row.expected.clauses.entries()) for (const role of clause.roles) {
    if (!['UNIT','FORMED_ATTACHED_UNIT'].includes(role.subject)) continue;
    reject(`unsupported coordinated scope ${row.id}/${clause.id}/${role.id}`,m=>{
      const actual=contract(m,row.id).clauses[index],participant=actual.roles.find(r=>r.id===role.id),subject=role.subject==='UNIT'?'FORMED_ATTACHED_UNIT':'UNIT';
      participant.subject=subject;
      for (const {node} of predicates(participant)) node.subject=subject;
      for (const condition of actual.conditions) if (condition.roleId===role.id) for (const {node} of predicates(condition)) node.subject=subject;
      validateContracts(m); // Structural consistency alone is insufficient.
    });coordinatedScopeMutations++;
  }
  const swarm='detachment-paragons-of-putrescence:enhancement:1';
  const swarmPredicate=m=>contract(m,swarm).clauses[0].conditions[0];
  for (const [label,edit] of [
    ['old mismatched formed/owner contract',m=>{Object.assign(swarmPredicate(m),{subject:'FORMED_ATTACHED_UNIT',roleId:'eligible-owner'});}],
    ['UNIT predicate silently changed to formed',m=>{swarmPredicate(m).subject='FORMED_ATTACHED_UNIT';}],
    ['unknown predicate role',m=>{swarmPredicate(m).roleId='unresolved-role';}],
    ['missing mixed-subject role',m=>{delete swarmPredicate(m).roleId;}],
    ['misbound owner role',m=>{swarmPredicate(m).roleId='eligible-owner';}]
  ]) reject(label,edit,validateContracts);
  const mist='detachment-death-lords-chosen:enhancement:4';
  for (const op of ['ALL','ANY','NOT']) reject(`nested ${op} same-subject identity misbinding`,m=>{
    const role=contract(m,mist).clauses[0].roles.find(role=>role.id==='attacking-model');
    role.conditions=[{op,args:[{...role.conditions[0],roleId:'eligible-owner'}]}];
  },validateContracts);
  reject('same MODEL bearer/Bodyguard identity confused',m=>{
    contract(m,'detachment-shamblerot-vectorium:enhancement:3').clauses[1].conditions[0].roleId='affected-bodyguard-model';
    validateContracts(m);
  });
  reject('invented leading requirement for ordinary unit',m=>{
    const entity=m.entities.find(entity=>entity.id===swarm);
    entity.ruleContract.conditions.push({predicate:'LEADING',subject:'MODEL',contextLevel:'ROSTER',arguments:{value:true},evidence:{field:['text'],quote:entity.data.text}});
  });
  let attachmentMutations=0;
  for (const row of source.records) for (const {node,at} of predicates(row.expected)) if (['LEADING','BODYGUARD_ID'].includes(node.predicate)) {
    reject(`dropped attachment ${row.id}/${at.join('/')}`,m=>{
      const actual=get(contract(m,row.id),at);
      Object.assign(actual,{predicate:'ALWAYS',contextLevel:'STATIC',arguments:{}});
    });attachmentMutations++;
  }
  const owner={id:'eligible-owner',subject:'MODEL'},unit={id:'affected-unit',subject:'UNIT'};
  const declaration={predicate:'FIELD',roleId:unit.id,contextLevel:'BATTLE',arguments:{key:'attackStrengthExceedsUnitToughness',equals:true}};
  assert.equal(bindClauseCondition(structuredClone(declaration),owner,[unit]).subject,'UNIT');
  assert.throws(()=>bindClauseCondition({...declaration,roleId:'missing'},owner,[unit]));
  assert.throws(()=>bindClauseCondition({...declaration,subject:'FORMED_ATTACHED_UNIT'},owner,[unit]));
  assert.throws(()=>bindClauseCondition({...declaration,roleId:undefined,subject:'UNIT'},owner,[unit,{id:'another-unit',subject:'UNIT'}]));
  const bearerEvent=bindClauseCondition({predicate:'FIELD',subject:'MODEL'},owner,[{id:'bodyguard',subject:'MODEL'}]);
  assert.equal(bearerEvent.roleId,undefined,'Same subject never implies the same physical model');

  const predicate=swarmPredicate(model),affected=contract(model,swarm).clauses[0].roles[0];
  const ownerContract=contract(model,swarm),eligible=entityContext(model,model.entities.find(entity=>entity.id==='unit-biologus-putrifier'),'MODEL',ownerContract.detachmentId);
  assert.equal(evaluateRole(ownerContract.roles[0],ownerContract.conditions,eligible),'TRUE','Ordinary eligible bearer');
  // No roster/attachment context is supplied. The predicate remains a BATTLE
  // UNIT predicate; no roster execution or combat simulation is introduced.
  const ordinary={subject:'UNIT',battle:{attackStrengthExceedsUnitToughness:true}};
  assert.equal(evaluatePredicate(predicate,ordinary),'TRUE');
  assert.equal(evaluateRole(affected,[predicate],ordinary),'TRUE');
  assert.equal(publicResult[evaluateRole(affected,[predicate],ordinary)],'MATCH');
  assert.equal(evaluateRole(affected,[predicate],{...ordinary,roster:{leading:false}}),'TRUE','Known unattached state cannot disable a generic UNIT condition');
  ordinary.battle.attackStrengthExceedsUnitToughness=false;
  assert.equal(evaluateRole(affected,[predicate],ordinary),'FALSE');
  delete ordinary.battle.attackStrengthExceedsUnitToughness;
  assert.equal(evaluateRole(affected,[predicate],ordinary),'UNKNOWN');
  ordinary.battle.attackStrengthExceedsUnitToughness='true';
  assert.equal(evaluateRole(affected,[predicate],ordinary),'INVALID');
  assert.equal(evaluatePredicate(predicate,{subject:'FORMED_ATTACHED_UNIT',battle:{attackStrengthExceedsUnitToughness:true}}),'INVALID','UNIT and formed subjects cannot be interchanged');
  const formed=contract(model,'detachment-death-lords-chosen:enhancement:2').clauses[1].conditions[0];
  assert.equal(evaluatePredicate(formed,{subject:'FORMED_ATTACHED_UNIT',battle:{unitAdvanceRoll:true}}),'TRUE');
  assert.equal(evaluatePredicate(formed,{subject:'UNIT',battle:{unitAdvanceRoll:true}}),'INVALID','Source-supported led subject stays formed');
  console.log(JSON.stringify({status:'PASS',...parity,assignmentPredicatesChecked:source.records.reduce((n,row)=>n+predicates(row.expected.roles[0].selector).length,0),sourceSummary:source.summary,mutations:mutations.length,coordinatedScopeMutations,coordinatedOwnerMutations,attachmentMutations,schemaNegativeControls:8,producerNegativeControls:3,rejuvenatingSwarm:{ordinaryUnit:'TRUE/MATCH',forbiddenState:'FALSE/NO_MATCH',unavailableBattle:'UNKNOWN/CONDITIONAL',malformedBattle:'INVALID',noAttachmentRequired:true}},null,2));
}
if (process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) run();
