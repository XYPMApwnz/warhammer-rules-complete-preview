import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRuleContractSchema} from '../rule-contract-v2/schema.mjs';
import {createCompatibilityCompiler} from '../rule-contract-v2/compatibility.mjs';
import {buildAttachmentFeasibility,evaluateRequiredRecipients} from './compatibility-feasibility.mjs';

// Standalone synthetic books: no army records, parser or factual fixtures.
const evidence={field:['text'],quote:'Two friendly units and a friendly beacon.'};
const evaluator=createRuleContractSchema({stateFields:{ready:{contextLevel:'BATTLE',valueType:'boolean'},
  otherFriendlyUnit:{contextLevel:'ROSTER',valueType:'boolean'}}});
const keyword=word=>({predicate:'UNIT_KEYWORD',subject:'UNIT',contextLevel:'STATIC',arguments:{keyword:word},evidence});
const ready={predicate:'FIELD',subject:'UNIT',contextLevel:'BATTLE',arguments:{key:'ready',equals:true},evidence};
const role=(id,word,purpose='TARGET')=>({id,subject:'UNIT',allegiance:'FRIENDLY',purpose,required:true,
  evidence,selector:keyword(word),conditions:[ready]});
const units=[['trooper',['TROOPER']],['beacon',['BEACON']],['both',['TROOPER','BEACON']],['other',[]]];
const entities=units.flatMap(([id,keywords])=>[
  {id,kind:'DATASHEET',data:{keywords,factionKeywords:[],profileIds:[id+':profile'],ruleReferenceIds:[]}},
  {id:id+':profile',kind:'PROFILE',parentId:id,data:{}}
]);
const pair={roles:[role('first','TROOPER'),{...role('second','TROOPER'),distinctFromRoleIds:['first']}],compatibilityRoleIds:['first','second'],clauses:[]};
const anchor={roles:[role('first','TROOPER'),role('beacon','BEACON','ANCHOR')],compatibilityRoleIds:['first'],clauses:[]};
entities.push({id:'detachment',kind:'DETACHMENT'});
for(const [id,contract]of [['pair',pair],['anchor',anchor]])entities.push({id,kind:'STRATAGEM',parentId:'detachment',
  provenance:{sourceId:'synthetic-source'},data:{text:evidence.quote,cp:1},ruleContract:{
    schema:'rule-contract/v2',ruleId:id,ownerId:'detachment',sourceId:'synthetic-source',kind:'STRATAGEM',
    executionMode:'BATTLE_ACTION',contextLevel:'BATTLE',sourceFields:[['text']],conditions:[],
    cp:1,timing:{conditions:[]},duration:[],restrictions:[],...contract}});
const book={bookId:'synthetic',entities,rosterAttachmentPolicies:[]};
const profileBindings=units.map(([unitId,intrinsicKeywords])=>({unitId,profileId:unitId+':profile',intrinsicKeywords,abilities:[],maxModels:1}));
book.compatibilityFeasibility=buildAttachmentFeasibility(book,profileBindings);
const make=(instanceId,canonicalUnitId='trooper',formedUnitId=null)=>({instanceId,canonicalUnitId,formedUnitId});
const first=make('first'),second=make('second'),beacon=make('beacon','beacon');
const contextFor=(candidate,subject,battle={})=>({subject,unitId:candidate.canonicalUnitId,
  instanceId:candidate.instanceId,formedUnitId:candidate.formedUnitId,
  keywords:new Set(entities.find(e=>e.id===candidate.canonicalUnitId).data.keywords),roster:{},battle,
  owner:{unitId:candidate.canonicalUnitId}});
const evaluate=(contract,candidates,battle={})=>evaluateRequiredRecipients(contract,'trooper',candidates,
  {book,evaluateRole:evaluator.evaluateRole,sourceInstanceId:'first',contextFor:(candidate,subject)=>contextFor(candidate,subject,battle)});
const checks=[];
const check=(name,run)=>{run();checks.push(name);};
check('missing mandatory TARGET and ANCHOR prove FALSE',()=>{
  assert.equal(evaluate(pair,[]),'FALSE');assert.equal(evaluate(pair,[first]),'FALSE');
  assert.equal(evaluate(anchor,[first]),'FALSE');assert.equal(evaluate(anchor,[first,make('unrelated','other')]),'FALSE');
});
check('distinct physical copies of the same canonical unit suffice',()=>{
  assert.equal(evaluate(pair,[first,second]),'UNKNOWN');
  assert.equal(evaluate(pair,[first,second],{ready:true}),'TRUE');
  assert.equal(evaluate(pair,[first,{...first,profileId:'a'},{...first,profileId:'b'}]),'FALSE','Profile enumeration is not additional units');
});
check('two attached components count as one UNIT',()=>{
  const merged=[{...first,formedUnitId:'formed'}, {...second,formedUnitId:'formed'}];
  assert.equal(evaluate(pair,merged),'FALSE');
  assert.equal(evaluate(pair,[...merged,make('third')]),'UNKNOWN');
  assert.equal(evaluate(pair,[second,first]),evaluate(pair,[first,second]));
});
check('battle UNKNOWN remains feasible and a friendly anchor may be the actor',()=>{
  assert.equal(evaluate(anchor,[first,beacon]),'UNKNOWN');
  assert.equal(evaluate(anchor,[first,beacon],{ready:true}),'TRUE');
  const both=make('first','both');assert.equal(evaluate(anchor,[both]),'UNKNOWN');
  assert.equal(evaluate(pair,[make('first','other'),second,make('third')]),'FALSE','An unrelated actor cannot borrow two other targets');
});
check('optional, enemy and nonphysical roles do not become roster prerequisites',()=>{
  for(const patch of [{required:false},{optional:true,required:undefined},{allegiance:'ENEMY'},{subject:'ROSTER'}]) {
    const contract={roles:[{...role('unused','BEACON','ANCHOR'),...patch}],clauses:[]};
    assert.equal(evaluate(contract,[]),'TRUE');
  }
  assert.equal(evaluate({roles:[{...role('created','BEACON','CREATED_OUTPUT')}],clauses:[]},[]),'TRUE');
});
check('existing clause-local linked recipients remain mandatory without a purpose label',()=>{
  const recipient={...role('linked','BEACON'),binding:'INDEPENDENT_ENTITY',conditions:[{
    predicate:'FIELD',subject:'UNIT',contextLevel:'ROSTER',arguments:{key:'otherFriendlyUnit',equals:true},evidence}]};
  delete recipient.required;delete recipient.purpose;
  const contract={roles:[],clauses:[{roles:[recipient],effectRecipientRoleIds:['linked']}]};
  assert.equal(evaluate(contract,[first]),'FALSE');assert.equal(evaluate(contract,[first,beacon]),'TRUE');
  for(const purpose of ['TARGET','ANCHOR']) {
    const local={roles:[],clauses:[{roles:[role('local','BEACON',purpose)]}]};
    assert.equal(evaluate(local,[first]),'FALSE');assert.equal(evaluate(local,[first,beacon]),'UNKNOWN');
  }
});
check('book feasibility permits potential duplicate copies without inventing battle state',()=>{
  const compiler=createCompatibilityCompiler({book,evaluator,profileBindings,referenceSemantics:{},attachmentRelations:[]});
  assert.equal(compiler.evaluateRule('trooper','pair').state,'UNKNOWN');
  const instances=[first,second];
  const availableContext=(candidate,subject)=>contextFor(instances.find(row=>row.instanceId===candidate.instanceId),subject);
  const options={mode:'ROSTER',instanceId:'first',instances,availableContext};
  assert.equal(compiler.evaluateRule('trooper','pair',options).state,'UNKNOWN');
  for(const row of instances)row.formedUnitId='formed';
  assert.equal(compiler.evaluateRule('trooper','pair',options).state,'FALSE','Compiler must use available formed identity');
});
check('malformed role bindings and invalid evaluation fail closed',()=>{
  for(const ids of [['missing'],['second'],['first','first']]) {
    const mutated=structuredClone(pair);mutated.roles[1].distinctFromRoleIds=ids;
    assert.throws(()=>evaluate(mutated,[first,second]),/recipient role binding/);
  }
  const invalid=structuredClone(pair);invalid.roles[1].conditions=[{predicate:'INVALID'}];
  assert.equal(evaluate(invalid,[first,second]),'INVALID');
  for(const mutate of [b=>{b.entities.find(e=>e.id==='pair').ruleContract.roles[1].distinctFromRoleIds=['missing'];},
    b=>{delete b.entities.find(e=>e.id==='pair').ruleContract.roles[1].evidence;}]){
    const mutated=structuredClone(book);mutate(mutated);assert.throws(()=>evaluator.validateContracts(mutated));
  }
});
check('lost existence/cardinality bindings are detected by expected outcomes',()=>{
  const dropped=structuredClone(anchor);dropped.roles[1].required=false;
  assert.throws(()=>assert.equal(evaluate(dropped,[first]),'FALSE'));
  const merged=[{...first,formedUnitId:'formed'},{...second,formedUnitId:'formed'}];
  const collapsed=structuredClone(pair);delete collapsed.roles[1].distinctFromRoleIds;
  assert.throws(()=>assert.equal(evaluate(collapsed,merged),'FALSE'));
});
if(!process.argv.includes('--isolated-child')) {
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'required-recipients-qa-'));
  try {
    for(const folder of ['roster-v2','rule-contract-v2'])fs.mkdirSync(path.join(temporary,folder));
    for(const file of ['roster-v2/required-recipients-qa.mjs','roster-v2/compatibility-feasibility.mjs','roster-v2/compatibility-context.mjs',
      'rule-contract-v2/schema.mjs','rule-contract-v2/compatibility.mjs'])
      fs.copyFileSync(new URL('../'+file,import.meta.url),path.join(temporary,file));
    const child=JSON.parse(execFileSync(process.execPath,[path.join(temporary,'roster-v2/required-recipients-qa.mjs'),'--isolated-child'],{encoding:'utf8'}));
    assert.equal(child.status,'PASS');
  } finally {
    assert.equal(path.dirname(path.resolve(temporary)),path.resolve(os.tmpdir()));
    fs.rmSync(temporary,{recursive:true,force:true});
  }
}
console.log(JSON.stringify({status:'PASS',sharedGuardsRunWithoutBookData:'PASS',checks}));
