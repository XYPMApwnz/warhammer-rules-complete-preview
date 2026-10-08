import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRuleContractSchema} from '../rule-contract-v2/schema.mjs';
import {createCompatibilityCompiler} from '../rule-contract-v2/compatibility.mjs';
import {buildAttachmentFeasibility,evaluateCompatibilityRole,requiredRecipientRoles} from './compatibility-feasibility.mjs';

const evidence={field:['text'],quote:'If the primary has SIGNAL, you may also target a secondary.'};
const keyword=word=>({predicate:'UNIT_KEYWORD',subject:'UNIT',contextLevel:'STATIC',arguments:{keyword:word},evidence});
const evaluator=createRuleContractSchema({stateFields:{ready:{contextLevel:'BATTLE',valueType:'boolean'}}});
const primary={id:'primary',subject:'UNIT',allegiance:'FRIENDLY',purpose:'TARGET',selector:keyword('PRIMARY'),conditions:[
  {predicate:'FIELD',subject:'UNIT',contextLevel:'BATTLE',arguments:{key:'ready',equals:true},evidence}]};
const secondary={id:'secondary',subject:'UNIT',allegiance:'FRIENDLY',purpose:'TARGET',optional:true,
  selector:keyword('SECONDARY'),conditions:[],prerequisites:[{roleId:'primary',condition:{...keyword('SIGNAL'),roleId:'primary'}}]};
const contract={schema:'rule-contract/v2',ruleId:'rule',ownerId:'detachment',sourceId:'source',kind:'STRATAGEM',
  executionMode:'BATTLE_ACTION',contextLevel:'BATTLE',roles:[primary,secondary],compatibilityRoleIds:['primary','secondary'],
  conditions:[],clauses:[{id:'clause',roles:[structuredClone(primary),structuredClone(secondary)],conditions:[],sourceFields:[['text']]}],
  sourceFields:[['text']],cp:1,timing:{},duration:[],restrictions:[]};
const names=[['primary',['PRIMARY']],['signal',['PRIMARY','SIGNAL']],['secondary',['SECONDARY']],['unrelated',['SECONDARY','SIGNAL']]];
const book={bookId:'synthetic',rosterAttachmentPolicies:[],entities:[{id:'detachment',kind:'DETACHMENT'},
  {id:'rule',kind:'STRATAGEM',parentId:'detachment',provenance:{sourceId:'source'},data:{text:evidence.quote,cp:1},ruleContract:contract},
  ...names.flatMap(([id,keywords])=>[{id,kind:'DATASHEET',data:{keywords,factionKeywords:[],ruleReferenceIds:[],profileIds:[id+':profile']}},
    {id:id+':profile',kind:'PROFILE',parentId:id,data:{}}])]};
const profileBindings=names.map(([unitId,intrinsicKeywords])=>({unitId,profileId:unitId+':profile',intrinsicKeywords,abilities:[],maxModels:1}));
book.compatibilityFeasibility=buildAttachmentFeasibility(book,profileBindings);
const context=(id,battle={})=>({subject:'UNIT',unitId:id,keywords:new Set(names.find(row=>row[0]===id)[1]),roster:{},battle});
const evaluate=(role,candidates,battle={})=>evaluateCompatibilityRole(contract,role,context('secondary',battle),
  {evaluateRole:evaluator.evaluateRole,contextsForRole:()=>candidates.map(id=>context(id,battle))});
const checks=[];const check=(name,run)=>{run();checks.push(name);};
check('optional secondary without a dependency is unchanged',()=>{
  const plain=structuredClone(secondary);delete plain.prerequisites;
  assert.equal(evaluate(plain,[]),'TRUE');assert.deepEqual(requiredRecipientRoles({roles:[plain],clauses:[]}),[]);
});
check('PRIMARY keyword gates only the optional secondary',()=>{
  assert.equal(evaluate(secondary,['primary']),'FALSE');
  assert.equal(evaluate(secondary,['signal']),'UNKNOWN');
  assert.equal(evaluate(secondary,['signal'],{ready:true}),'TRUE');
  assert.equal(evaluate(secondary,['signal'],{ready:false}),'FALSE');
  assert.equal(evaluate(secondary,['unrelated']),'FALSE','SECONDARY keywords cannot satisfy PRIMARY eligibility');
  assert.deepEqual(requiredRecipientRoles(contract),[],'Optional target must not become mandatory');
});
check('compiler preserves primary-only and book-vs-roster branches',()=>{
  const compiler=createCompatibilityCompiler({book,evaluator,profileBindings,referenceSemantics:{},attachmentRelations:[]});
  const query=(actor,ids,battle={})=>compiler.evaluateRule(actor,'rule',{mode:'ROSTER',instanceId:actor,instances:ids.map(id=>({instanceId:id,canonicalUnitId:id})),
    availableContext:candidate=>({...context(candidate.canonicalUnitId,battle),instanceId:candidate.instanceId,owner:{unitId:candidate.canonicalUnitId,keywords:context(candidate.canonicalUnitId).keywords,unknownKeywords:new Set()}})});
  assert.equal(query('secondary',['secondary']).state,'FALSE');
  assert.equal(query('secondary',['secondary','primary']).state,'FALSE');
  assert.equal(query('secondary',['secondary','signal']).state,'UNKNOWN');
  assert.equal(query('secondary',['secondary','signal'],{ready:true}).state,'TRUE');
  assert.equal(query('primary',['primary']).state,'UNKNOWN','A non-qualifying PRIMARY may still be the ordinary target');
  assert.equal(compiler.evaluateRule('secondary','rule').state,'UNKNOWN');
});
check('wrong role/subject/context/evidence and cycles fail closed',()=>{
  evaluator.validateContracts(book);
  for(const mutate of [r=>{r.prerequisites[0].roleId='missing';},r=>{r.prerequisites[0].condition.roleId='secondary';},
    r=>{r.prerequisites[0].condition.subject='MODEL';},r=>{r.prerequisites[0].condition.contextLevel='BATTLE';},
    r=>{delete r.prerequisites[0].condition.evidence;}]) {
    const changed=structuredClone(book);mutate(changed.entities.find(e=>e.id==='rule').ruleContract.roles[1]);
    assert.throws(()=>evaluator.validateContracts(changed));
  }
  const cycle=structuredClone(book),rule=cycle.entities.find(e=>e.id==='rule').ruleContract;
  rule.roles[0].prerequisites=[{roleId:'secondary',condition:{...keyword('SECONDARY'),roleId:'secondary'}}];
  assert.throws(()=>evaluator.validateContracts(cycle),/cyclic/);
  const lost=structuredClone(book);delete lost.entities.find(e=>e.id==='rule').ruleContract.clauses[0].roles[1].prerequisites;
  assert.throws(()=>evaluator.validateContracts(lost),/drift/);
  const dropped=structuredClone(secondary);delete dropped.prerequisites;
  assert.throws(()=>assert.equal(evaluate(dropped,[]),'FALSE'));
});
if(!process.argv.includes('--isolated-child')) {
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'dependent-roles-qa-'));
  try {
    for(const folder of ['roster-v2','rule-contract-v2'])fs.mkdirSync(path.join(temporary,folder));
    for(const file of ['roster-v2/dependent-roles-qa.mjs','roster-v2/compatibility-feasibility.mjs','roster-v2/compatibility-context.mjs',
      'rule-contract-v2/schema.mjs','rule-contract-v2/compatibility.mjs'])fs.copyFileSync(new URL('../'+file,import.meta.url),path.join(temporary,file));
    assert.equal(JSON.parse(execFileSync(process.execPath,[path.join(temporary,'roster-v2/dependent-roles-qa.mjs'),'--isolated-child'],{encoding:'utf8'})).status,'PASS');
  } finally {assert.equal(path.dirname(path.resolve(temporary)),path.resolve(os.tmpdir()));fs.rmSync(temporary,{recursive:true,force:true});}
}
console.log(JSON.stringify({status:'PASS',sharedGuardsRunWithoutBookData:'PASS',checks}));
