/** Synthetic orchestration controls; no source facts or book policies are replaced. */
import assert from 'node:assert/strict';
import {createRuleContractSchema} from '../rule-contract-v2/schema.mjs';
import {compileRecipientFixture} from './recipient-fixture.mjs';
import {prepareRosterConditionExecution,createRosterConditionContext} from './condition-context.mjs';
import {executeRosterEffects} from './effects.mjs';

const clone=structuredClone,evidence={field:['text'],quote:'Synthetic independent and prerequisite ability sources.'};
const checks=[];
const check=(name,run)=>{run();checks.push(name);};
const ability={canonicalId:'scouts',parameters:{distance:6}};
function fixture({native=false,independent=false,dependent=true,target='SOURCE_MODEL'}={}){
  const args={key:'ledBodyguardHasAbility',ruleId:'dependent',canonicalId:'scouts',parameters:{distance:6}};
  const rosterSchema={conditionFields:[{key:args.key,arguments:{ruleId:args.ruleId,canonicalId:args.canonicalId,parameters:args.parameters},
    contextLevel:'ROSTER',valueType:'boolean'}]},schema=createRuleContractSchema(rosterSchema);
  const book={bookId:'execution-fixture',rosterSchema,entities:[{id:'detachment',kind:'DETACHMENT',data:{title:'Fixture'}},
    {id:'relation',kind:'SOURCE_RELATION',data:{}}],rosterAttachmentPolicies:[
      {sourceId:'leader',targetId:'body',role:'LEADER',additionalLeaders:0,sourceIds:['relation']}],
    rosterProfileBindings:[],rosterReferenceSemantics:{'native-body':{abilities:native?[clone(ability)]:[]}},
    rosterAbilityReferences:{scouts:{id:'scouts',title:'Scouts',parameters:{distance:{type:'number',min:0}}}},
    conditionComputations:[{key:args.key,arguments:{ruleId:args.ruleId,canonicalId:args.canonicalId,parameters:args.parameters},
      kind:'LED_BODYGUARD_ABILITY',canonicalId:'scouts',parameters:{distance:6}}]};
  for(const id of ['leader','body']){
    book.entities.push({id,kind:'DATASHEET',data:{title:id,keywords:id==='leader'?['CHARACTER']:[],factionKeywords:[],
      profileIds:[id+'-model'],weaponIds:[],ruleReferenceIds:id==='body'?['native-body']:[]}},
    {id:id+'-model',kind:'PROFILE',parentId:id,data:{name:id,M:'6"',T:'4',LD:'6+',OC:'1'}});
    book.rosterProfileBindings.push({unitId:id,profileId:id+'-model',intrinsicKeywords:id==='leader'?['CHARACTER']:[],
      abilities:native&&id==='body'?[clone(ability)]:[],referenceIds:[]});
  }
  const rule=(id,parent,conditions,binding)=>({id,kind:'DATASHEET_ABILITY',parentId:parent,
    provenance:{sourceId:'synthetic-source/'+id},data:{title:id,text:evidence.quote},ruleContract:{schema:'rule-contract/v2',
      ruleId:id,ownerId:parent,sourceId:'synthetic-source/'+id,kind:'DATASHEET_ABILITY',executionMode:'DECLARATIVE_APPLICABILITY',
      contextLevel:'ROSTER',roles:[],conditions:[],sourceFields:[['text']],clauses:[{id:id+'/clause',roles:[],conditions:[],
        sourceFields:[['text']],rosterClassification:'ROSTER_EXECUTABLE',rosterEffects:[{id:id+'/effect',operation:'GRANT_ABILITY',
          targetBinding:binding,targetSubject:'MODEL',ability:clone(ability),conditions,lifetime:'ROSTER',evidence:clone(evidence),sourceFields:[['text']]}]}]}});
  if(independent)book.entities.push(rule('independent','body',[],'SOURCE_UNIT_MODELS'));
  if(dependent)book.entities.push(rule('dependent','leader',[{binding:'SOURCE',predicate:{predicate:'FIELD',subject:'UNIT',
    contextLevel:'ROSTER',arguments:{...args,equals:true},evidence:clone(evidence)}}],target));
  const raw=(instanceId,id)=>({instanceId,canonicalUnitId:id,startingStrength:1,warlord:null,enhancementIds:[],selections:[],
    modelRows:[{rowId:'row',canonicalProfileId:id+'-model',quantity:1,selections:[],loadouts:[]}]});
  const state={schema:'roster-v2/roster',bookId:book.bookId,rosterId:'orchestration',warlordInstanceId:null,
    detachments:[{instanceId:'d',canonicalDetachmentId:'detachment'}],detachmentIds:['detachment'],
    units:[raw('leader-a','leader'),raw('body-a','body'),raw('body-b','body')],
    attachments:[{leaderInstanceId:'leader-a',bodyguardInstanceId:'body-a',role:'LEADER'}]};
  return {book:compileRecipientFixture(book,schema),state};
}
const has=(projection,id)=>projection.units.find(unit=>unit.instanceId===id).profiles.every(model=>
  model.abilities.some(row=>row.canonicalId==='scouts'&&row.parameters.distance===6));
function run(input){let calls=0;const before=JSON.stringify(input),contexts=[];
  const next=prepareRosterConditionExecution(input.book,input.state,{createContext:(book,state,options)=>{
    calls++;contexts.push(options?.abilityProjection);return createRosterConditionContext(book,state,options);}});
  assert.equal(JSON.stringify(input),before,'Execution mutates canonical inputs');return {...next,calls,contexts};}

check('one pass without an executed typed prerequisite, even if an unused computation exists',()=>{
  const input=fixture({independent:true,dependent:false}),next=run(input);
  assert.equal(next.passes,1);assert.equal(next.calls,1);assert.equal(next.contexts[0],undefined);
  assert.deepEqual(next.projection,executeRosterEffects(input.book,next.state,createRosterConditionContext(input.book,next.state)));
});
check('two passes preserve native Bodyguard ability and exact physical recipients',()=>{
  const next=run(fixture({native:true}));assert.equal(next.passes,2);assert.equal(next.calls,2);
  assert.equal(next.contexts[0],undefined);assert(next.contexts[1]);assert(has(next.projection,'leader-a'));
  assert.equal(has(next.contexts[1],'leader-a'),false,'Dependent grant must be absent from prerequisite pass');
});
check('independent grants establish the current prerequisite; dependent grants cannot enable themselves',()=>{
  const positive=run(fixture({independent:true}));assert(has(positive.contexts[1],'body-a'));assert(has(positive.projection,'leader-a'));
  const circular=run(fixture({target:'SOURCE_FORMED_MODELS'}));assert.equal(has(circular.contexts[1],'body-a'),false);
  assert.equal(has(circular.projection,'leader-a'),false);assert.equal(has(circular.projection,'body-a'),false);
});
check('reload, detach and Bodyguard replacement never consume an earlier projection',()=>{
  const input=fixture({native:true}),first=run(input);assert(has(first.projection,'leader-a'));
  const changed=clone(input);changed.book.rosterReferenceSemantics['native-body'].abilities=[];
  assert.equal(has(run(changed).projection,'leader-a'),false);
  changed.state.attachments[0].bodyguardInstanceId='body-b';assert.equal(has(run(changed).projection,'leader-a'),false);
  const detached=clone(input);detached.state.attachments=[];assert.equal(has(run(detached).projection,'leader-a'),false);
  assert.deepEqual(run(input).projection,first.projection);
});
check('admission and both pass failures leave inputs intact and never return a partial generation',()=>{
  const input=fixture({independent:true}),before=JSON.stringify(input);
  const invalid=clone(input.state);delete invalid.units[0].warlord;
  let calls=0;assert.throws(()=>prepareRosterConditionExecution(input.book,invalid,{createContext:()=>{calls++;}}),/warlord/i);assert.equal(calls,0);
  assert.throws(()=>prepareRosterConditionExecution(input.book,input.state,{validateSelections:()=>{throw new TypeError('selection rejection');}}),/selection rejection/);
  assert.throws(()=>prepareRosterConditionExecution(input.book,input.state,{createContext:()=>{throw new TypeError('after validation');}}),/after validation/);
  for(const where of ['after first pass','second pass interpreter']){
    let passes=0;assert.throws(()=>prepareRosterConditionExecution(input.book,input.state,{createContext:(book,state,options)=>{
      passes++;if(passes===2&&where==='after first pass')throw new TypeError(where);
      const context=createRosterConditionContext(book,state,options);
      return passes!==2?context:{...context,evaluatePredicate:()=>{throw new TypeError(where);}};
    }}),error=>error instanceof TypeError&&error.message===where);assert.equal(passes,2);
  }
  assert.equal(JSON.stringify(input),before);
});
console.log(JSON.stringify({status:'PASS',checks,independentInterpreter:'executeRosterEffects',bookBranches:0}));
