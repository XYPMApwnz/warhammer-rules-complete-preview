import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRuleContractSchema,subjects,levels,publicResult,predicateTypes} from './schema.mjs';
import {compileBookRecipients} from './recipients.mjs';

// These synthetic books deliberately share a field name with incompatible
// definitions. Neither their facts nor their registries come from a real book.
const quote='Synthetic source statement.';
const atom=(predicate,subject,contextLevel,args)=>({predicate,subject,contextLevel,
  arguments:args,evidence:{field:['text'],quote}});
const field=(key,equals,subject='UNIT',contextLevel='ROSTER')=>atom('FIELD',subject,contextLevel,{key,equals});
const fieldsA={flag:{contextLevel:'ROSTER',valueType:'boolean'},
  alphaOnly:{contextLevel:'BATTLE',valueType:'boolean'},
  attached:{contextLevel:'ROSTER',valueType:'boolean'},
  isWarlord:{contextLevel:'ROSTER',valueType:'boolean',intrinsicAllKeywords:['CHARACTER']}};
const fieldsB={flag:{contextLevel:'BATTLE',valueType:'string'},
  betaOnly:{contextLevel:'ROSTER',valueType:'boolean'}};
const abilitiesA=['Synthetic ability A'],abilitiesB=['Synthetic ability B'];
const a=createRuleContractSchema({stateFields:fieldsA,modelAbilities:abilitiesA,contractSchema:'synthetic-a/v2'});
const b=createRuleContractSchema({stateFields:fieldsB,modelAbilities:abilitiesB,contractSchema:'synthetic-b/v2'});
const context=(subject='UNIT',extra={})=>({subject,unitId:'amber:unit',modelId:'amber:profile',
  keywords:new Set(['INFANTRY']),intrinsicKeywords:new Set(['INFANTRY']),abilities:new Set(),roster:{},battle:{},...extra});
const model=(bookId,schema)=>{
  const entity={id:bookId+':rule',kind:'RULE',provenance:{sourceId:bookId+':source'},data:{text:quote}};
  entity.ruleContract={schema,ruleId:entity.id,ownerId:bookId,sourceId:entity.provenance.sourceId,
    kind:'OTHER_RULE',executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',sourceFields:[['text']],
    roles:[{id:'owner',subject:'UNIT',allegiance:'FRIENDLY',selector:atom('ALWAYS','UNIT','STATIC',{})}],conditions:[],clauses:[]};
  return {bookId,entities:[entity,{id:bookId+':unit',kind:'DATASHEET'},
    {id:bookId+':profile',kind:'PROFILE'},{id:bookId+':second-profile',kind:'PROFILE'},
    {id:bookId+':detachment',kind:'DETACHMENT'}]};
};
const amber=model('amber','synthetic-a/v2'),blue=model('blue','synthetic-b/v2');
const checks=[];
function check(name,run){run();checks.push(name);}
const evaluate=(node,extra={})=>a.evaluatePredicate(node,context(node?.subject,extra));

check('independent canonical owners and schema IDs',()=>{
  assert.deepEqual(a.validateContractDeclarations(amber),{rules:1,status:'PASS'});
  assert.deepEqual(b.validateContractDeclarations(blue),{rules:1,status:'PASS'});
  assert.throws(()=>a.validateContractDeclarations(blue),/unknown contract schema/);
  assert.throws(()=>b.validateContractDeclarations(amber),/unknown contract schema/);
  const validate=node=>a.validatePredicate(node,node.subject,amber,amber.entities[0]);
  for(const [predicate,subject,id] of [['MODEL_ID','MODEL','amber:profile'],['UNIT_ID','UNIT','amber:unit'],
    ['UNIT_ID','FORMED_ATTACHED_UNIT','amber:unit'],['BODYGUARD_ID','UNIT','amber:unit'],['DETACHMENT','ROSTER','amber:detachment']]) {
    const level=['BODYGUARD_ID','DETACHMENT'].includes(predicate)?'ROSTER':'STATIC';
    validate(atom(predicate,subject,level,{id}));
    assert.throws(()=>validate(atom(predicate,subject,level,{id:'blue:unit'})),/unresolved canonical ID/);
  }
  assert.throws(()=>validate(atom('MODEL_ID','MODEL','STATIC',{id:'amber:unit'})),/impossible identity subject/);
  const poisoned=structuredClone(amber);poisoned.entities[0].ruleContract.sourceId='wrong-source';
  assert.throws(()=>a.validateContractDeclarations(poisoned),/provenance/);
  poisoned.entities[0].ruleContract=structuredClone(amber.entities[0].ruleContract);
  poisoned.entities.push(structuredClone(poisoned.entities[0]));
  assert.throws(()=>a.validateContractDeclarations(poisoned),/duplicate independent semantic owner/);
});

check('public contract validation requires canonical recipients',()=>{
  const declaration=structuredClone(amber);
  declaration.entities[0].ruleContract.clauses.push({id:'source-clause',sourceFields:[['text']],
    roles:[],conditions:[],rosterClassification:'DISPLAY_ONLY',effectRecipientRoleIds:[]});
  assert.deepEqual(a.validateContractDeclarations(declaration),{rules:1,status:'PASS'});
  assert.throws(()=>a.validateContracts(declaration),/missing canonical recipient declaration/);
  const canonical=compileBookRecipients(declaration);
  assert.deepEqual(a.validateContracts(canonical),{rules:1,status:'PASS'});
  canonical.entities[0].ruleContract.clauses[0].effectRecipientRoleIds=[];
  assert.throws(()=>a.validateContracts(canonical),/legacy clause recipient addresses/);
});

check('MODEL UNIT FORMED_ATTACHED_UNIT ROSTER stay distinct',()=>{
  for(const subject of subjects) {
    assert.equal(evaluate(atom('ALWAYS',subject,'STATIC',{})),'TRUE');
    for(const other of subjects.filter(value=>value!==subject))
      assert.equal(a.evaluatePredicate(atom('ALWAYS',subject,'STATIC',{}),context(other)),'INVALID');
  }
  assert.equal(evaluate(atom('MODEL_KEYWORD','MODEL','STATIC',{keyword:'INFANTRY'})),'TRUE');
  assert.equal(evaluate(atom('MODEL_KEYWORD','UNIT','STATIC',{keyword:'INFANTRY'})),'INVALID');
  assert.equal(evaluate(atom('UNIT_KEYWORD','MODEL','STATIC',{keyword:'INFANTRY'})),'INVALID');
  assert.equal(evaluate(atom('UNIT_KEYWORD','FORMED_ATTACHED_UNIT','STATIC',{keyword:'CHARACTER'}),{keywords:new Set(['CHARACTER'])}),'TRUE');
  assert.equal(evaluate(atom('MODEL_KEYWORD','MODEL','STATIC',{keyword:'CHARACTER'})),'FALSE');
  assert.equal(evaluate(atom('MODEL_ID','MODEL','STATIC',{id:'amber:profile'})),'TRUE');
  assert.equal(evaluate(atom('MODEL_ID','MODEL','STATIC',{id:'amber:second-profile'})),'FALSE');
  assert.equal(evaluate(atom('MODEL_ID','MODEL','STATIC',{id:'amber:profile'}),{modelId:undefined}),'INVALID');
  assert.equal(evaluate(atom('UNIT_ID','UNIT','STATIC',{id:'amber:unit'}),{unitId:undefined}),'INVALID');
});

check('STATIC ROSTER BATTLE levels and typed availability',()=>{
  const keyword=atom('UNIT_KEYWORD','UNIT','STATIC',{keyword:'INFANTRY'});
  for(const level of levels.filter(level=>level!=='STATIC'))assert.equal(evaluate({...keyword,contextLevel:level}),'INVALID');
  assert.equal(evaluate(field('flag',true)),'UNKNOWN');
  assert.equal(evaluate(field('flag',true),{roster:{flag:true}}),'TRUE');
  assert.equal(evaluate(field('flag',true),{roster:{flag:false}}),'FALSE');
  assert.equal(evaluate(field('flag',true),{roster:{flag:'true'}}),'INVALID');
  assert.equal(evaluate(field('flag',true,'UNIT','BATTLE'),{battle:{flag:true}}),'INVALID');
  assert.equal(evaluate(field('alphaOnly',true,'UNIT','BATTLE')),'UNKNOWN');
  assert.equal(evaluate(field('alphaOnly',true,'UNIT','BATTLE'),{battle:{alphaOnly:true}}),'TRUE');
  assert.equal(evaluate(field('alphaOnly',true,'UNIT','BATTLE'),{roster:{alphaOnly:true}}),'UNKNOWN');
  assert.equal(evaluate(field('flag',true,'UNIT','STATIC')),'INVALID');
  assert.equal(evaluate(field('notDeclared',true)),'INVALID');
});

check('four-state logic and public mapping',()=>{
  const nodes={TRUE:atom('ALWAYS','UNIT','STATIC',{}),
    FALSE:atom('UNIT_KEYWORD','UNIT','STATIC',{keyword:'ABSENT'}),
    UNKNOWN:field('flag',true),INVALID:field('notDeclared',true)};
  const all=[['TRUE','FALSE','UNKNOWN','INVALID'],['FALSE','FALSE','FALSE','INVALID'],
    ['UNKNOWN','FALSE','UNKNOWN','INVALID'],['INVALID','INVALID','INVALID','INVALID']];
  const any=[['TRUE','TRUE','TRUE','INVALID'],['TRUE','FALSE','UNKNOWN','INVALID'],
    ['TRUE','UNKNOWN','UNKNOWN','INVALID'],['INVALID','INVALID','INVALID','INVALID']];
  const states=Object.keys(nodes);
  for(const [i,left] of states.entries())for(const [j,right] of states.entries()) {
    assert.equal(evaluate({op:'ALL',args:[nodes[left],nodes[right]]}),all[i][j]);
    assert.equal(evaluate({op:'ANY',args:[nodes[left],nodes[right]]}),any[i][j]);
  }
  for(const state of states)assert.equal(evaluate({op:'NOT',args:[nodes[state]]}),{TRUE:'FALSE',FALSE:'TRUE',UNKNOWN:'UNKNOWN',INVALID:'INVALID'}[state]);
  assert.deepEqual(publicResult,{TRUE:'MATCH',FALSE:'NO_MATCH',UNKNOWN:'CONDITIONAL',INVALID:'INVALID'});
  const role={subject:'UNIT',selector:nodes.TRUE};
  assert.equal(a.evaluateRole(role,[field('flag',true,'ROSTER')],context('UNIT',{roster:{flag:true}})),'TRUE');
  assert.equal(a.evaluateRole(role,[],context('MODEL')),'INVALID');
});

check('static attachment feasibility without inventing roster state',()=>{
  const leading=atom('LEADING','UNIT','ROSTER',{value:true});
  assert.equal(evaluate(leading,{capabilities:{leaderTargetIds:[]}}),'FALSE');
  assert.equal(evaluate(leading,{capabilities:{leaderTargetIds:['amber:unit']}}),'UNKNOWN');
  assert.equal(evaluate(leading,{roster:{leading:false}}),'FALSE');
  assert.equal(evaluate(leading,{roster:{leading:true}}),'TRUE');
  assert.equal(evaluate(field('attached',true),{capabilities:{canBeAttached:false}}),'FALSE');
  assert.equal(evaluate(field('attached',true),{capabilities:{canBeAttached:true}}),'UNKNOWN');
  const bodyguard=atom('BODYGUARD_ID','UNIT','ROSTER',{id:'amber:unit'});
  assert.equal(evaluate(bodyguard,{capabilities:{leaderTargetIds:[],canBeBodyguard:false}}),'FALSE');
  assert.equal(evaluate(bodyguard,{capabilities:{leaderTargetIds:[],canBeBodyguard:true}}),'UNKNOWN');
  assert.equal(evaluate(leading,{roster:{leading:false,bodyguardId:'amber:unit',attached:true}}),'FALSE');
  const count=atom('CHARACTER_MODEL_COUNT','FORMED_ATTACHED_UNIT','ROSTER',{min:2});
  for(const maxCharacterModels of [0,1])assert.equal(evaluate(count,{capabilities:{maxCharacterModels}}),'FALSE');
  assert.equal(evaluate(count,{capabilities:{maxCharacterModels:2}}),'UNKNOWN');
  assert.equal(evaluate(count,{roster:{characterModelCount:2}}),'TRUE');
  assert.equal(evaluate(count,{capabilities:{maxCharacterModels:'UNBOUNDED'}}),'INVALID');
});

check('intrinsic CHARACTER cannot be supplied by formed-unit keywords',()=>{
  const warlord=field('isWarlord',true);
  for(const roster of [{},{isWarlord:true},{isWarlord:false}])
    assert.equal(evaluate(warlord,{keywords:new Set(['CHARACTER']),roster}),'FALSE');
  const intrinsicKeywords=new Set(['CHARACTER']);
  assert.equal(evaluate(warlord,{intrinsicKeywords}),'UNKNOWN');
  assert.equal(evaluate(warlord,{intrinsicKeywords,roster:{isWarlord:true}}),'TRUE');
  assert.equal(evaluate(warlord,{intrinsicKeywords,roster:{isWarlord:false}}),'FALSE');
});

check('book registries and ability vocabularies are isolated snapshots',()=>{
  const flagA=field('flag',true),flagB=field('flag','ready','UNIT','BATTLE');
  assert.equal(a.evaluatePredicate(flagA,context('UNIT',{roster:{flag:true}})),'TRUE');
  assert.equal(b.evaluatePredicate(flagA,context('UNIT',{roster:{flag:true}})),'INVALID');
  assert.equal(b.evaluatePredicate(flagB,context('UNIT',{battle:{flag:'ready'}})),'TRUE');
  assert.equal(a.evaluatePredicate(flagB,context('UNIT',{battle:{flag:'ready'}})),'INVALID');
  assert.equal(a.evaluatePredicate(field('betaOnly',true),context()),'INVALID');
  assert.equal(b.evaluatePredicate(field('alphaOnly',true,'UNIT','BATTLE'),context()),'INVALID');
  for(const [api,own,other] of [[a,'Synthetic ability A','Synthetic ability B'],[b,'Synthetic ability B','Synthetic ability A']]) {
    const ctx=context('MODEL',{abilities:new Set([own,other])});
    assert.equal(api.evaluatePredicate(atom('MODEL_ABILITY','MODEL','STATIC',{ability:own}),ctx),'TRUE');
    assert.equal(api.evaluatePredicate(atom('MODEL_ABILITY','MODEL','STATIC',{ability:other}),ctx),'INVALID');
    const book=api===a?amber:blue;
    assert.throws(()=>api.validatePredicate(atom('MODEL_ABILITY','MODEL','STATIC',{ability:other}),'MODEL',book,book.entities[0]),/unknown static ability/);
  }
  fieldsA.flag.contextLevel='BATTLE';fieldsA.isWarlord.intrinsicAllKeywords.length=0;
  fieldsA.newField={contextLevel:'ROSTER',valueType:'boolean'};abilitiesA.push('Synthetic ability B');
  assert.equal(evaluate(flagA,{roster:{flag:true}}),'TRUE');
  assert.equal(evaluate(field('isWarlord',true),{keywords:new Set(['CHARACTER'])}),'FALSE');
  assert.equal(evaluate(field('newField',true)),'INVALID');
  assert.equal(evaluate(atom('MODEL_ABILITY','MODEL','STATIC',{ability:'Synthetic ability B'}),{abilities:new Set(['Synthetic ability B'])}),'INVALID');
  assert.throws(()=>predicateTypes.MODEL_KEYWORD.subjects.push('UNIT'),TypeError);
  assert.throws(()=>{predicateTypes.FIELD.level='STATIC';},TypeError);
});

check('malformed predicates fail closed instead of becoming UNKNOWN',()=>{
  for(const node of [null,{}, {op:'BAD',args:[]},{op:'ALL',args:[]},{op:'NOT',args:[]},
    {op:'ANY'},atom('toString','UNIT','STATIC',{}),atom('MODEL_ID','MODEL','STATIC',{}),
    {...field('flag',true),arguments:[]},atom('UNIT_KEYWORD','UNIT','STATIC',{})])assert.equal(evaluate(node),'INVALID');
  assert.equal(a.evaluatePredicate(field('flag',true),null),'INVALID');
  for(const stateFields of [[],{flag:{contextLevel:'STATIC',valueType:'boolean'}},
    {flag:{contextLevel:'ROSTER',valueType:'unknown'}},{flag:{contextLevel:'ROSTER',valueType:'boolean',intrinsicAllKeywords:[null]}}])
    assert.throws(()=>createRuleContractSchema({stateFields}));
});

// Run the same guard with only the shared schema and recipient modules present. This catches accidental
// factual imports without depending on real book data or its regression QA.
if(!process.argv.includes('--isolated')) {
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'rule-contract-kernel-'));
  const files=['schema.mjs','recipients.mjs','schema-qa.mjs'];
  try {
    for(const file of files)fs.copyFileSync(new URL(file,import.meta.url),path.join(directory,file));
    const output=execFileSync(process.execPath,[path.join(directory,'schema-qa.mjs'),'--isolated'],{encoding:'utf8',cwd:directory});
    assert.equal(JSON.parse(output).status,'PASS');
    checks.push('guards run with no book files present');
  } finally {
    for(const file of files)if(fs.existsSync(path.join(directory,file)))fs.unlinkSync(path.join(directory,file));
    fs.rmdirSync(directory);
  }
}
console.log(JSON.stringify({status:'PASS',sharedGuards:checks.length,checks}));
