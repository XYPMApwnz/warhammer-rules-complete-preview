// The isolated guard child allocates no temporary files and imports no repository helper.
const {cleanupQaTempDir,createQaTempDir}=process.argv.includes('--isolated-child')?{}:await import('../../../tests/helpers/qa-temp.mjs');
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRuleContractSchema} from './schema.mjs';
import {createCompatibilityCompiler} from './compatibility.mjs';
import {compileBookRecipients} from './recipients.mjs';
import {buildAttachmentFeasibility} from '../roster-v2/compatibility-feasibility.mjs';

const evaluator=createRuleContractSchema({modelAbilities:['ABILITY_X'],stateFields:{
  isWarlord:{contextLevel:'ROSTER',valueType:'boolean',intrinsicAllKeywords:['CHARACTER']},
  otherFriendlyUnit:{contextLevel:'ROSTER',valueType:'boolean'}}});
const evidence={field:['text'],quote:'Synthetic source evidence.'};
const atom=(predicate,subject,contextLevel,args)=>({predicate,subject,contextLevel,arguments:args,evidence});
const keyword=(subject,value)=>atom(subject==='MODEL'?'MODEL_KEYWORD':'UNIT_KEYWORD',subject,'STATIC',{keyword:value});
function fixture(prefix='amber') {
  const id=value=>prefix+':'+value,entities=[],profileBindings=[];
  for (const [name,keywords,profileKeywords] of [
    ['mixed',['MIXED'],[['KEYWORD_X'],['KEYWORD_Y']]],
    ['character',['CHARACTER'],[['CHARACTER']]],
    ['bodyguard',['BODYGUARD'],[['BODYGUARD']]]]) {
    const profileIds=profileKeywords.map((_,index)=>id(name+':profile:'+index));
    const unit={id:id(name),kind:'DATASHEET',data:{keywords,factionKeywords:[],profileIds,ruleReferenceIds:[]}};
    entities.push(unit);
    profileKeywords.forEach((keywords,index)=>{
      entities.push({id:profileIds[index],kind:'PROFILE',parentId:unit.id,data:{}});
      profileBindings.push({unitId:unit.id,profileId:profileIds[index],intrinsicKeywords:keywords,
        abilities:name==='mixed'&&index===1?['ABILITY_X']:[]});
    });
  }
  for (const name of ['main','other']) entities.push({id:id(name),kind:'DETACHMENT'});
  const rule=(name,subject,selector,kind='STRATAGEM',conditions=[])=>{
    const entity={id:id(name),parentId:id('main'),kind,provenance:{sourceId:id('source')},data:{text:evidence.quote,cp:1}};
    const role={id:'primary',subject,allegiance:'FRIENDLY',selector,conditions};
    entity.ruleContract={schema:'rule-contract/v2',ruleId:entity.id,ownerId:entity.parentId,sourceId:entity.provenance.sourceId,
      kind,executionMode:kind==='STRATAGEM'?'BATTLE_ACTION':'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',
      detachmentId:entity.parentId,roles:[role],conditions:[atom('DETACHMENT','ROSTER','ROSTER',{id:entity.parentId})],clauses:[],sourceFields:[['text']],
      ...(kind==='STRATAGEM'?{cp:1,timing:{conditions:[]},duration:[],restrictions:[]}:{})};
    entities.push(entity);return entity;
  };
  rule('x','MODEL',keyword('MODEL','KEYWORD_X'));
  rule('split','MODEL',{op:'ALL',args:[keyword('MODEL','KEYWORD_X'),keyword('MODEL','KEYWORD_Y')]});
  rule('second','MODEL',atom('MODEL_ID','MODEL','STATIC',{id:id('mixed:profile:1')}));
  rule('ability','MODEL',atom('MODEL_ABILITY','MODEL','STATIC',{ability:'ABILITY_X'}));
  rule('owner','UNIT',keyword('UNIT','BODYGUARD'),'ENHANCEMENT');
  rule('warlord','MODEL',keyword('MODEL','CHARACTER'),'ENHANCEMENT',[atom('FIELD','MODEL','ROSTER',{key:'isWarlord',equals:true})]);
  rule('formation','FORMED_ATTACHED_UNIT',keyword('FORMED_ATTACHED_UNIT','CHARACTER'));
  const grant=rule('grant','UNIT',atom('ALWAYS','UNIT','STATIC',{}),'DETACHMENT_RULE');
  grant.ruleContract.clauses.push({id:'grant',sourceFields:[['text']],roles:[],conditions:[],
    keywordProjection:{subject:'UNIT',selector:keyword('UNIT','BODYGUARD'),keyword:'BONUS'}});
  rule('bonus','UNIT',keyword('UNIT','BONUS'));
  const recipient=rule('recipient','UNIT',keyword('UNIT','BODYGUARD'));
  recipient.ruleContract.roles.push({id:'secondary',subject:'UNIT',allegiance:'FRIENDLY',purpose:'SECONDARY_TARGET',binding:'INDEPENDENT_ENTITY',
    selector:keyword('UNIT','BODYGUARD'),conditions:[atom('FIELD','UNIT','ROSTER',{key:'otherFriendlyUnit',equals:true})]});
  recipient.ruleContract.compatibilityRoleIds=['primary'];
  // These are producer declarations; the real compatibility consumer receives
  // their compiled canonical recipient contract, with no legacy fallback.
  const book=compileBookRecipients({bookId:prefix,entities,rosterAttachmentPolicies:[{sourceId:id('character'),targetId:id('bodyguard'),additionalLeaders:0}]});
  book.compatibilityFeasibility=buildAttachmentFeasibility(book,profileBindings.map(row=>({...row,maxModels:1})));
  const options={book,evaluator,profileBindings,referenceSemantics:{},attachmentRelations:book.rosterAttachmentPolicies};
  return {id,book,options,compiler:createCompatibilityCompiler(options)};
}
const a=fixture(),b=fixture('blue'),checks=[];
const check=(name,run)=>{run();checks.push(name);};
const selected={detachmentId:a.id('main')};
const evaluate=(unit,rule,options=selected)=>a.compiler.evaluateRule(a.id(unit),a.id(rule),options);
check('each MODEL profile is evaluated independently',()=>{
  const result=evaluate('mixed','x');
  assert.equal(result.applicability,'MATCH');
  assert.deepEqual(result.roles[0].profileResults,[{profileId:a.id('mixed:profile:0'),state:'TRUE'},
    {profileId:a.id('mixed:profile:1'),state:'FALSE'}]);
  assert.equal(evaluate('mixed','split').applicability,'NO_MATCH');
  assert.deepEqual(evaluate('mixed','second').roles[0].profileResults.map(row=>row.state),['FALSE','TRUE']);
  assert.deepEqual(evaluate('mixed','ability').roles[0].profileResults.map(row=>row.state),['FALSE','TRUE']);
  assert.throws(()=>a.compiler.context(a.id('mixed'),'MODEL',selected),/explicit MODEL profile/i);
  assert.throws(()=>evaluate('mixed','x',{...selected,profileId:'missing'}),/Unresolved explicit MODEL/);
});
check('invalid profile bindings and cross-book identities fail closed',()=>{
  for (const change of [rows=>rows.pop(),rows=>rows.push(rows[0]),rows=>{rows[0].profileId='missing';},
    rows=>{rows[0].unitId=b.id('mixed');},rows=>{delete rows[0].intrinsicKeywords;}]) {
    const options={...a.options,profileBindings:structuredClone(a.options.profileBindings)};
    change(options.profileBindings);assert.throws(()=>createCompatibilityCompiler(options));
  }
  assert.throws(()=>b.compiler.contextsFor(a.id('mixed'),'UNIT'));
  const options={...a.options,profileBindings:structuredClone(a.options.profileBindings)};
  const isolated=createCompatibilityCompiler(options);options.profileBindings[0].intrinsicKeywords.push('KEYWORD_Y');
  assert.equal(isolated.evaluateRule(a.id('mixed'),a.id('split'),selected).state,'FALSE');
});
check('reference abilities require explicit profile ownership',()=>{
  const book=structuredClone(a.book),bindings=structuredClone(a.options.profileBindings);
  const referenceId=a.id('reference');
  book.entities.push({id:referenceId,kind:'RULE_REFERENCE',data:{label:'Display label is irrelevant'}});
  book.entities.find(entity=>entity.id===a.id('mixed')).data.ruleReferenceIds=[referenceId];
  for (const row of bindings.filter(row=>row.unitId===a.id('mixed'))) {
    delete row.abilities;
    row.referenceIds=row.profileId.endsWith(':1')?[referenceId]:[];
  }
  const compiler=createCompatibilityCompiler({...a.options,book,profileBindings:bindings,referenceSemantics:{[referenceId]:['ABILITY_X']}});
  assert.deepEqual(compiler.evaluateRule(a.id('mixed'),a.id('ability'),selected).roles[0].profileResults.map(row=>row.state),['FALSE','TRUE']);
  assert.throws(()=>createCompatibilityCompiler({...a.options,book,profileBindings:bindings}),/Missing explicit .* reference semantics/);
  delete bindings[0].referenceIds;
  assert.throws(()=>createCompatibilityCompiler({...a.options,book,profileBindings:bindings}),/Explicit MODEL reference/);
});
check('book mode invents neither roster nor battle state',()=>{
  const context=a.compiler.contextsFor(a.id('character'),'MODEL')[0];
  assert.deepEqual(context.roster,{});assert.deepEqual(context.battle,{});
  assert.equal(context.subject,'MODEL');
  assert.equal(evaluate('character','warlord').state,'UNKNOWN');
  assert.equal(evaluate('character','warlord',{...selected,availableContext:()=>({roster:{isWarlord:true}})}).state,'UNKNOWN');
  const formed=a.compiler.context(a.id('bodyguard'),'FORMED_ATTACHED_UNIT');
  assert.equal(formed.subject,'FORMED_ATTACHED_UNIT');
  assert.equal(formed.unknownKeywords.has('CHARACTER'),true);
  assert.equal(a.compiler.contextsFor(a.id('bodyguard'),'MODEL')[0].keywords.has('CHARACTER'),false);
});
check('selected vs unspecified Detachment and possible grants',()=>{
  assert.equal(evaluate('mixed','x',{}).applicability,'CONDITIONAL');
  assert.equal(evaluate('mixed','x',{detachmentId:a.id('other')}).applicability,'NO_MATCH');
  assert.equal(evaluate('bodyguard','bonus',{}).applicability,'CONDITIONAL');
  assert.equal(evaluate('bodyguard','bonus').applicability,'MATCH');
  assert.equal(evaluate('bodyguard','bonus',{detachmentId:a.id('other')}).applicability,'NO_MATCH');
  assert.throws(()=>evaluate('mixed','x',{detachmentId:'missing'}),/Invalid canonical Detachment/);
  assert.equal(evaluate('mixed','x',{detachmentIds:[a.id('main'),a.id('other')]}).state,'TRUE');
  assert.equal(evaluate('mixed','x',{detachmentIds:[]}).state,'FALSE');
});
const instances=[{instanceId:'character-1',canonicalUnitId:a.id('character')},
  {instanceId:'guard-1',canonicalUnitId:a.id('bodyguard')},{instanceId:'guard-2',canonicalUnitId:a.id('bodyguard')}];
function availableContext(candidate,subject) {
  const unit=a.book.entities.find(entity=>entity.id===candidate.canonicalUnitId);
  const binding=a.options.profileBindings.find(row=>row.profileId===candidate.profileId);
  const own=subject==='MODEL'?binding.intrinsicKeywords:unit.data.keywords;
  const roster={...(candidate.instanceId==='character-1'?{isWarlord:true}:{}),attached:true,leading:candidate.instanceId==='character-1'};
  return {subject,unitId:unit.id,...(binding?{modelId:binding.profileId}:{}),roster,battle:{},
    keywords:new Set(subject==='MODEL'?own:[...own,'CHARACTER','BODYGUARD',...(candidate.instanceId==='guard-1'?['BONUS']:[])]),
    abilities:new Set(binding?.abilities||[]),owner:{unitId:unit.id,keywords:new Set([...own,...(candidate.instanceId==='guard-1'?['BONUS']:[])]),unknownKeywords:new Set()}};
}
const rosterOptions=instanceId=>({mode:'ROSTER',instanceId,instances,detachmentIds:[a.id('main')],availableContext});
check('physical Enhancement owner never inherits formed-unit identity',()=>{
  assert.equal(evaluate('character','owner',rosterOptions('character-1')).state,'FALSE');
  assert.equal(evaluate('bodyguard','owner',rosterOptions('guard-1')).state,'TRUE');
  assert.equal(evaluate('character','warlord',rosterOptions('character-1')).state,'TRUE');
  assert.equal(evaluate('bodyguard','formation',rosterOptions('guard-1')).state,'TRUE');
  assert.throws(()=>evaluate('character','owner',{...rosterOptions('character-1'),availableContext:(candidate,subject)=>
    ({...availableContext(candidate,subject),owner:{unitId:a.id('bodyguard')}})}),/Physical owner identity/);
  assert.throws(()=>evaluate('character','owner',{...rosterOptions('character-1'),availableContext:(candidate,subject)=>
    ({...availableContext(candidate,subject),unitId:'missing'})}),/Unresolved available UNIT/);
  const global=a.compiler.context(a.id('character'),'ROSTER',{...rosterOptions('character-1'),
    availableContext:()=>({subject:'ROSTER',roster:{detachmentId:a.id('main')}})});
  assert.equal(global.subject,'ROSTER');assert.equal(global.roster.detachmentId,a.id('main'));
});
check('duplicate instance contexts and recipient existence remain isolated',()=>{
  assert.equal(evaluate('bodyguard','bonus',rosterOptions('guard-1')).state,'TRUE');
  assert.equal(evaluate('bodyguard','bonus',rosterOptions('guard-2')).state,'FALSE');
  assert.equal(evaluate('bodyguard','recipient',rosterOptions('guard-1')).state,'TRUE');
  assert.equal(evaluate('bodyguard','recipient',{...rosterOptions('guard-1'),instances:[instances[1]]}).state,'FALSE');
  assert.throws(()=>evaluate('bodyguard','recipient',{...rosterOptions('guard-1'),instances:[{canonicalUnitId:a.id('bodyguard')}]}),/physical recipient/i);
  const rows=a.compiler.compileRows({kinds:['STRATAGEM'],instances,contextForRule:()=>rosterOptions('ignored')}).rows;
  const bonus=rows.filter(row=>row.ruleId===a.id('bonus')&&row.unitId===a.id('bodyguard'));
  assert.deepEqual(bonus.map(row=>[row.instanceId,row.state]),[['guard-1','TRUE'],['guard-2','FALSE']]);
});
check('manual authoritative pairwise maps are rejected',()=>{
  const alias={ruleId:a.id('x'),state:'TRUE'};
  for (const value of [
    [{unitId:a.id('mixed'),ruleId:a.id('x'),state:'TRUE'}],
    {[a.id('mixed')]:{[a.id('x')]:'MATCH'}},
    {[a.id('x')]:{[a.id('mixed')]:false}},
    new Map([[a.id('mixed'),new Map([[a.id('x'),'MATCH']])]]),
    {firstUnscopedOccurrence:alias,[a.id('mixed')]:alias}
  ]) assert.throws(()=>createCompatibilityCompiler({...a.options,book:{...a.book,answers:value}}),/pairwise/);
  assert.throws(()=>createCompatibilityCompiler({...a.options,manualPairs:[]}),/Unsupported compiler input/);
});
check('generated results are disposable, poison-resistant and deterministic',()=>{
  const config={kinds:['STRATAGEM','ENHANCEMENT'],sort:true,contextForRule:()=>selected};
  const baseline=a.compiler.compileRows(config);
  const poisoned=structuredClone(baseline);poisoned.rows[0].state='FALSE';
  const book={...a.book,generatedCompatibility:poisoned};
  const rebuild=()=>createCompatibilityCompiler({...a.options,book}).compileRows(config);
  assert.deepEqual(rebuild(),baseline);
  delete book.generatedCompatibility;
  assert.deepEqual(rebuild(),baseline);assert.deepEqual(rebuild(),rebuild());
  assert.equal(baseline.authority,'DISPOSABLE_PROJECTION');
});
if (!process.argv.includes('--isolated-child')) {
  const directory=createQaTempDir('compatibility-qa-');
  try {
    for (const folder of ['rule-contract-v2','roster-v2']) fs.mkdirSync(path.join(directory,folder));
    for (const file of ['rule-contract-v2/schema.mjs','rule-contract-v2/recipients.mjs','rule-contract-v2/compatibility.mjs','rule-contract-v2/compatibility-qa.mjs',
      'roster-v2/compatibility-context.mjs','roster-v2/compatibility-feasibility.mjs'])
      fs.copyFileSync(new URL('../'+file,import.meta.url),path.join(directory,file));
    const result=JSON.parse(execFileSync(process.execPath,[path.join(directory,'rule-contract-v2/compatibility-qa.mjs'),'--isolated-child'],{encoding:'utf8'}));
    assert.equal(result.status,'PASS');
  } finally {cleanupQaTempDir(directory);}
}
console.log(JSON.stringify({status:'PASS',sharedGuardGroups:checks.length,sharedGuardsRunWithoutBookData:'PASS',checks},null,2));
