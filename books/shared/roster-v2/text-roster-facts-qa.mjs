import assert from 'node:assert/strict';
import {createTextRosterFactEvaluator,validateBookTextRosterFacts} from './text-roster-facts.mjs';

// Explicitly synthetic physical groups. The source declarations exercised here
// cannot grant an ability, change a stat or establish a battle event.
const quote='This unit contains a model; while a CHARACTER model leads it, Bodyguard models from the bearer’s unit may act.';
const proof={field:['text'],quote};
function fixture(kind,key,extra={}){
  const fact={kind,key,...extra,evidence:structuredClone(proof)};
  const node={predicate:'FIELD',subject:kind==='MEMBER_OF_SOURCE_UNIT'?'MODEL':'UNIT',contextLevel:'ROSTER',
    arguments:{key,equals:true,...(extra.profileId?{profileId:extra.profileId}:{})},
    ...(extra.roleId?{roleId:extra.roleId}:{}),evidence:structuredClone(proof)};
  const clause={id:'text-clause',rosterClassification:'BATTLE_ONLY',rosterEffects:[],roles:[],conditions:[node],
    sourceFields:[['text']],textRosterFacts:[fact]};
  const rule={id:'synthetic-rule',data:{text:quote},ruleContract:{roles:[],conditions:[],clauses:[clause]}};
  const book={entities:[rule,{id:'source-stat-profile',kind:'PROFILE'},
    {id:'source-composition-member',kind:'PROFILE',data:{composition:{modelProfileSourceId:'source-stat-profile'}}},
    {id:'other-composition-member',kind:'PROFILE',data:{composition:{modelProfileSourceId:'other-stat-profile'}}}]};
  const source={instanceId:'source/1',canonicalUnitId:'source-unit',formedUnitId:'formed/1',
    profiles:[{scopeId:'source/1/profile',quantity:1,intrinsicKeywords:['TECH-PRIEST','CHARACTER']}]};
  const target={instanceId:'bodyguard/1',formedUnitId:'formed/1',profiles:[{scopeId:'bodyguard/1/profile',quantity:5,intrinsicKeywords:['INFANTRY']}]};
  const other={instanceId:'bodyguard/2',formedUnitId:null,profiles:[{scopeId:'bodyguard/2/profile',quantity:5,intrinsicKeywords:['INFANTRY']}]};
  const state={units:[{instanceId:source.instanceId,modelRows:[{canonicalProfileId:'source-composition-member',quantity:1}]}],
    attachments:[{leaderInstanceId:source.instanceId,bodyguardInstanceId:target.instanceId}]};
  const projection={units:[source,target,other],formedUnits:[{formedUnitId:'formed/1',bodyguardInstanceId:target.instanceId,
    leaderInstanceIds:[source.instanceId],memberInstanceIds:[target.instanceId,source.instanceId]}]};
  const targetContext={subject:'MODEL',modelScopeId:'bodyguard/1/profile'};
  const args={book,state,projection,records:new Map(book.entities.map(entity=>[entity.id,entity])),rule,clause,source,target,targetContext};
  return {args,node,fact,book,rule,clause,source,target,other,state,projection,targetContext,
    evaluate:()=>createTextRosterFactEvaluator(args)(node)};
}

let checks=0;
{
  const f=fixture('SOURCE_FORMED_MODEL_KEYWORD','containsTechPriestModel',{keyword:'TECH-PRIEST',roleId:'source'});
  const before=JSON.stringify(f.args);assert.equal(f.evaluate(),'TRUE');assert.equal(JSON.stringify(f.args),before,'Text facts must not mutate state or projection');
  f.source.profiles[0].intrinsicKeywords=['INFANTRY'];f.source.keywords=['TECH-PRIEST'];assert.equal(f.evaluate(),'FALSE','Aggregate UNIT keywords are not MODEL proof');
  f.target.profiles[0].intrinsicKeywords.push('TECH-PRIEST');assert.equal(f.evaluate(),'TRUE','A formed-unit MODEL is a valid source-unit membership proof');
  f.target.profiles[0].quantity=0;assert.equal(f.evaluate(),'FALSE','Zero models do not establish presence');checks++;
}
{
  const f=fixture('SOURCE_LEADER_MODEL_KEYWORD','characterModelLeadingSource',{keyword:'CHARACTER',roleId:'source'});
  // For this rule the source is the Bodyguard; the leader is the other component.
  f.state.attachments=[{leaderInstanceId:f.target.instanceId,bodyguardInstanceId:f.source.instanceId}];
  f.target.profiles[0].intrinsicKeywords=['CHARACTER'];assert.equal(f.evaluate(),'TRUE');
  f.target.profiles[0].intrinsicKeywords=['INFANTRY'];f.target.keywords=['CHARACTER'];assert.equal(f.evaluate(),'FALSE','A non-CHARACTER MODEL does not become CHARACTER through UNIT keywords');
  f.target.profiles[0].intrinsicKeywords=['CHARACTER'];f.state.attachments=[];assert.equal(f.evaluate(),'FALSE','A CHARACTER outside a leader edge is not leading this source');checks++;
}
{
  const f=fixture('SOURCE_PROFILE_PRESENT','sourceProfilePresent',{profileId:'source-stat-profile',roleId:'source'});
  assert.equal(f.evaluate(),'TRUE');f.state.units[0].modelRows[0].quantity=0;assert.equal(f.evaluate(),'FALSE');
  f.state.units[0].modelRows[0]={canonicalProfileId:'other-composition-member',quantity:1};assert.equal(f.evaluate(),'FALSE','A different source-profile binding is not proof');
  const foreignRoleNode={...f.node,roleId:'another-source'};
  assert.equal(createTextRosterFactEvaluator(f.args)(foreignRoleNode),undefined,'The declared source role cannot leak into another role');checks++;
}
{
  const f=fixture('MEMBER_OF_SOURCE_UNIT','memberOfBearerUnit');assert.equal(f.evaluate(),'TRUE');
  f.args.target=f.other;f.args.targetContext={subject:'MODEL',modelScopeId:'bodyguard/2/profile'};assert.equal(f.evaluate(),'FALSE','A duplicate component outside this group is not a member');
  f.args.target=f.target;f.args.targetContext={subject:'MODEL',modelScopeId:'source/1/profile'};assert.equal(f.evaluate(),'FALSE','A source MODEL scope is not a target MODEL scope');
  f.args.targetContext=f.targetContext;f.target.formedUnitId=null;assert.equal(f.evaluate(),'FALSE','Detach removes physical membership');checks++;
}
{
  const f=fixture('MEMBER_OF_SOURCE_UNIT','memberOfBearerUnit');
  assert.equal(createTextRosterFactEvaluator(f.args)({...f.node,contextLevel:'BATTLE'}),undefined,'A battle event cannot be supplied by a roster fact');
  delete f.clause.textRosterFacts;
  assert.equal(f.evaluate(),undefined,'Undeclared memberOfBearerUnit must remain UNKNOWN in the existing evaluator');
  assert.deepEqual(validateBookTextRosterFacts(f.book),f.book);checks++;
}
{
  const f=fixture('MEMBER_OF_SOURCE_UNIT','memberOfBearerUnit');
  f.clause.rosterEffects=[{operation:'MODIFY_STAT',field:'T',value:1}];assert.throws(()=>f.evaluate(),/non-executable BATTLE_ONLY/);
  f.clause.rosterEffects=[];f.clause.rosterClassification='ROSTER_EXECUTABLE';assert.throws(()=>f.evaluate(),/non-executable BATTLE_ONLY/);checks++;
}
{
  for(const [mutate,message]of [
    [f=>{f.fact.kind='UNKNOWN';},/unknown fact kind/],
    [f=>{f.fact.extra=true;},/unknown fact field/],
    [f=>{f.fact.evidence.quote='Not in the source';},/source quote changed/],
    [f=>{f.node.evidence.quote='A different predicate';},/exact roster predicate/],
    [f=>{f.clause.textRosterFacts.push(structuredClone(f.fact));},/duplicate fact declarations/]
  ]){const f=fixture('MEMBER_OF_SOURCE_UNIT','memberOfBearerUnit');mutate(f);assert.throws(()=>validateBookTextRosterFacts(f.book),message);}
  checks++;
}
console.log(JSON.stringify({status:'PASS',checks,synthetic:true,scope:'declared text-only roster prerequisites; no effect execution'}));
