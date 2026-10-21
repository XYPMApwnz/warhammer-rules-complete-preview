/** Standalone synthetic guards for shared roster keyword operations.
 * These fixtures express reviewed typed facts; their prose is evidence only.
 * MODEL targets are imported composition/profile groups, never invented models.
 */
import assert from 'node:assert/strict';
import {createRuleContractSchema} from '../rule-contract-v2/schema.mjs';
import {changeAttachment,predicateContext,validateRoster,withRosterDetachments} from './context.mjs';
import {executeRosterEffects,validateRosterEffects} from './effects.mjs';

const evaluator=withRosterDetachments(createRuleContractSchema({stateFields:{
  leading:{contextLevel:'ROSTER',valueType:'boolean'},
  equipmentRequirementSatisfied:{contextLevel:'ROSTER',valueType:'boolean'},
  syntheticBattleFlag:{contextLevel:'BATTLE',valueType:'boolean'}
}}));
const checks=[];
const check=(name,run)=>{run();checks.push(name);};
const clone=value=>structuredClone(value);
const id=name=>'synthetic-keywords:'+name;
const evidence={field:['text'],quote:'Reviewed synthetic keyword operation and selector evidence.'};
const atom=(predicate,subject,arguments_,contextLevel='STATIC')=>
  ({predicate,subject,arguments:arguments_,contextLevel,evidence:clone(evidence)});
const targetProfile=name=>({binding:'TARGET',predicate:atom('MODEL_ID','MODEL',{id:id(name)})});
const rosterGate=()=>({binding:'SOURCE',predicate:atom('DETACHMENT','UNIT',{id:id('main')},'ROSTER')});
const keyword=(subject,value)=>atom(subject==='MODEL'?'MODEL_KEYWORD':'UNIT_KEYWORD',subject,{keyword:value});

function fixture() {
  const entities=[{id:id('main'),kind:'DETACHMENT',data:{title:'Synthetic Detachment'}}];
  const rosterProfileBindings=[];
  for(const [name,unitKeywords,profiles] of [
    ['mixed',['UNIT_NATIVE','SHARED'],[['profile-a',['PROFILE_A','SHARED']],['profile-b',['PROFILE_B','SHARED']]]],
    ['leader',['CHARACTER','LEADER_NATIVE'],[['leader-profile',['CHARACTER','LEADER_NATIVE']]]]
  ]) {
    const unitId=id(name);
    entities.push({id:unitId,kind:'DATASHEET',data:{title:name,keywords:unitKeywords,factionKeywords:[],
      profileIds:profiles.map(([profile])=>id(profile)),ruleReferenceIds:[],weaponIds:[]}});
    for(const [profile,intrinsicKeywords] of profiles) {
      entities.push({id:id(profile),parentId:unitId,kind:'PROFILE',data:{name:profile,M:'6"',T:'4',LD:'6+',OC:'1'}});
      rosterProfileBindings.push({unitId,profileId:id(profile),intrinsicKeywords,abilities:[],referenceIds:[]});
    }
  }
  entities.push({id:id('equipment'),parentId:id('mixed'),kind:'WARGEAR_FOOTNOTE',data:{text:'Synthetic selected equipment.'}});
  const book={bookId:id('book'),entities,rosterProfileBindings,
    rosterAttachmentPolicies:[{sourceId:id('leader'),targetId:id('mixed'),role:'LEADER',additionalLeaders:0,sourceIds:[id('relation')]}]};
  const unit=(instanceId,name)=>({instanceId,canonicalUnitId:id(name),startingStrength:name==='mixed'?4:1,
    modelRows:(name==='mixed'?['profile-a','profile-b']:['leader-profile']).map(profile=>({
      rowId:profile,canonicalProfileId:id(profile),quantity:name==='mixed'?2:1,selections:[],loadouts:[]})),
    selections:[],enhancementIds:[],warlord:false});
  const state={schema:'roster-v2/roster',bookId:book.bookId,rosterId:'synthetic-roster',
    detachments:[{instanceId:'detachment/1',canonicalDetachmentId:id('main')}],detachmentIds:[id('main')],
    units:[unit('alpha','mixed'),unit('beta','mixed'),unit('leader','leader')],attachments:[],warlordInstanceId:null};
  return {book,state};
}
function rule(book,name,{operation='GRANT_MODEL_KEYWORD',keyword:word='BONUS',targetSubject='MODEL',
  targetBinding='SOURCE_UNIT_MODELS',parent='mixed',conditions=[],...extra}={}) {
  const entity={id:id(name),parentId:id(parent),kind:parent==='main'?'DETACHMENT_RULE':'DATASHEET_ABILITY',
    provenance:{sourceId:id('source/'+name)},data:{title:name,text:evidence.quote}};
  const effect={id:name+'/effect',operation,keyword:word,targetSubject,targetBinding,conditions,
    evidence:clone(evidence),sourceFields:[['text']],lifetime:'ROSTER',...extra};
  entity.ruleContract={schema:'rule-contract/v2',ruleId:entity.id,ownerId:entity.parentId,
    sourceId:entity.provenance.sourceId,kind:entity.kind,executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',
    ...(parent==='main'?{detachmentId:id('main')}:{}),roles:[],conditions:[],sourceFields:[['text']],
    clauses:[{id:name+'/clause',roles:[],conditions:[],sourceFields:[['text']],rosterClassification:'ROSTER_EXECUTABLE',rosterEffects:[effect]}]};
  book.entities.push(entity);
  return effect;
}
function execute(book,state) {
  const canonicalBefore=clone(book),rosterBefore=clone(state);
  evaluator.validateContracts(book);
  validateRosterEffects(book,evaluator.validatePredicate,evaluator.evaluatePredicate);
  const result=executeRosterEffects(book,validateRoster(book,state,book.rosterAttachmentPolicies),evaluator);
  assert.deepEqual(book,canonicalBefore,'Keyword effects mutated canonical facts');
  assert.deepEqual(state,rosterBefore,'Keyword effects mutated saved physical-instance state');
  return result;
}
const unit=(projection,instanceId='alpha')=>projection.units.find(row=>row.instanceId===instanceId);
const profile=(projection,name,instanceId='alpha')=>unit(projection,instanceId).profiles.find(row=>row.canonicalProfileId===id(name));
function matches(state,projection,instanceId,subject,word,profileName) {
  const scope=profileName?profile(projection,profileName,instanceId).scopeId:undefined;
  return evaluator.evaluatePredicate(keyword(subject,word),predicateContext(state,projection,instanceId,subject,scope));
}
function applied(projection,name,instanceId='alpha') {
  return unit(projection,instanceId).applied.filter(row=>row.ruleId===id(name));
}
function assertProof(book,row,name,{instanceId='alpha',profileName=null,operation='GRANT_MODEL_KEYWORD',word='BONUS'}={}) {
  const entity=book.entities.find(item=>item.id===id(name));
  assert.equal(row.ruleId,entity.id);
  assert.equal(row.clauseId,name+'/clause');
  assert.equal(row.effectId,name+'/effect');
  assert.equal(row.sourceInstanceId,instanceId);
  assert.equal(row.targetInstanceId,instanceId);
  assert.equal(row.operation,operation);
  assert.equal(row.field,'keywords');
  assert.deepEqual(row.sourceFields,[['text']]);
  assert.equal(row.lifetime,'ROSTER');
  assert.ok(entity.provenance.sourceId);
  assert.equal(entity.ruleContract.sourceId,entity.provenance.sourceId);
  assert.ok(entity.data.text.includes(evidence.quote));
  assert.equal(row.targetProfileId,profileName?id(profileName):null);
  if(profileName) {
    assert.equal(row.targetModelInstanceId,null,'Quantity-two profile group is not an individual model');
    assert.ok(row.targetCompositionId.includes(instanceId+'/'+profileName+'/'));
  }
  assert.ok(Array.isArray(row.before)&&Array.isArray(row.after));
  assert.notDeepEqual(row.before,row.after);
  assert.equal(row.before.includes(word),operation==='REMOVE_KEYWORD');
  assert.equal(row.after.includes(word),operation!=='REMOVE_KEYWORD');
}
const semantic=projection=>({
  units:projection.units.map(row=>({instanceId:row.instanceId,keywords:[...row.keywords].sort(),
    profiles:row.profiles.map(model=>({scopeId:model.scopeId,quantity:model.quantity,keywords:[...model.keywords].sort()}))
      .sort((a,b)=>a.scopeId.localeCompare(b.scopeId)),
    applied:row.applied.map(item=>clone(item)).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))
  })).sort((a,b)=>a.instanceId.localeCompare(b.instanceId)),
  formedUnits:projection.formedUnits.map(row=>({id:row.formedUnitId,keywords:[...row.keywords].sort()})).sort((a,b)=>a.id.localeCompare(b.id))
});

check('explicit profile bindings preserve mixed MODEL identities and UNIT contributions',()=>{
  const {book,state}=fixture(),projection=execute(book,state);
  assert.equal(matches(state,projection,'alpha','MODEL','PROFILE_A','profile-a'),'TRUE');
  assert.equal(matches(state,projection,'alpha','MODEL','PROFILE_A','profile-b'),'FALSE');
  assert.equal(matches(state,projection,'alpha','MODEL','UNIT_NATIVE','profile-a'),'FALSE');
  assert.equal(matches(state,projection,'alpha','UNIT','PROFILE_A'),'TRUE');
  assert.equal(matches(state,projection,'alpha','UNIT','PROFILE_B'),'TRUE');
  assert.equal(matches(state,projection,'alpha','UNIT','UNIT_NATIVE'),'TRUE');
  assert.equal(predicateContext(state,projection,'alpha','MODEL'),null,'Mixed scopes require a concrete profile group');
  assert.ok(unit(projection).profiles.every(row=>row.quantity===2&&row.modelInstanceId===null));
});
check('legacy books retain uniform profile keywords when explicit bindings are absent',()=>{
  const {book,state}=fixture();delete book.rosterProfileBindings;
  const projection=execute(book,state);
  assert.deepEqual(profile(projection,'profile-a').keywords,profile(projection,'profile-b').keywords);
  assert.equal(matches(state,projection,'alpha','MODEL','UNIT_NATIVE','profile-b'),'TRUE');
});
check('MODEL grant selects a profile group, contributes to UNIT, and records typed source proof',()=>{
  const {book,state}=fixture();rule(book,'profile-grant',{conditions:[targetProfile('profile-a')]});
  const projection=execute(book,state);
  assert.equal(matches(state,projection,'alpha','MODEL','BONUS','profile-a'),'TRUE');
  assert.equal(matches(state,projection,'alpha','MODEL','BONUS','profile-b'),'FALSE');
  assert.equal(matches(state,projection,'alpha','UNIT','BONUS'),'TRUE');
  assert.equal(applied(projection,'profile-grant').length,1);
  assertProof(book,applied(projection,'profile-grant')[0],'profile-grant',{profileName:'profile-a'});
});
check('duplicate canonical units keep independent physical targets and provenance',()=>{
  const {book,state}=fixture();rule(book,'duplicates',{conditions:[targetProfile('profile-a')]});
  const projection=execute(book,state);
  for(const instanceId of ['alpha','beta']) {
    const rows=applied(projection,'duplicates',instanceId);assert.equal(rows.length,1);
    assertProof(book,rows[0],'duplicates',{instanceId,profileName:'profile-a'});
  }
  assert.notEqual(profile(projection,'profile-a','alpha').scopeId,profile(projection,'profile-a','beta').scopeId);
  assert.equal(applied(projection,'duplicates','leader').length,0);
});
check('MODEL removal preserves another profile contribution of the same keyword',()=>{
  const {book,state}=fixture();rule(book,'remove-a',{operation:'REMOVE_KEYWORD',keyword:'SHARED',
    conditions:[rosterGate(),targetProfile('profile-a')]});
  const projection=execute(book,state);
  assert.equal(matches(state,projection,'alpha','MODEL','SHARED','profile-a'),'FALSE');
  assert.equal(matches(state,projection,'alpha','MODEL','SHARED','profile-b'),'TRUE');
  assert.equal(matches(state,projection,'alpha','UNIT','SHARED'),'TRUE');
  assertProof(book,applied(projection,'remove-a')[0],'remove-a',{operation:'REMOVE_KEYWORD',word:'SHARED',profileName:'profile-a'});
});
check('UNIT removal preserves MODEL predicates and profile keywords',()=>{
  const {book,state}=fixture();rule(book,'remove-unit',{operation:'REMOVE_KEYWORD',keyword:'SHARED',
    targetSubject:'UNIT',targetBinding:'SOURCE_UNIT',conditions:[rosterGate()]});
  const projection=execute(book,state);
  assert.equal(matches(state,projection,'alpha','UNIT','SHARED'),'FALSE');
  for(const name of ['profile-a','profile-b']) assert.equal(matches(state,projection,'alpha','MODEL','SHARED',name),'TRUE');
  assertProof(book,applied(projection,'remove-unit')[0],'remove-unit',{operation:'REMOVE_KEYWORD',word:'SHARED'});
});
check('removing the last MODEL contribution removes its UNIT keyword without touching intrinsic UNIT facts',()=>{
  const {book,state}=fixture();rule(book,'remove-only',{operation:'REMOVE_KEYWORD',keyword:'PROFILE_A',
    conditions:[rosterGate(),targetProfile('profile-a')]});
  const projection=execute(book,state);
  assert.equal(matches(state,projection,'alpha','MODEL','PROFILE_A','profile-a'),'FALSE');
  assert.equal(matches(state,projection,'alpha','UNIT','PROFILE_A'),'FALSE');
  assert.equal(matches(state,projection,'alpha','UNIT','UNIT_NATIVE'),'TRUE');
});
check('equipment removal gates distinguish selected, known absent, and unknown equipment',()=>{
  const {book,state}=fixture();rule(book,'equipment-remove',{operation:'REMOVE_KEYWORD',keyword:'PROFILE_A',
    conditions:[{binding:'SOURCE',predicate:atom('FIELD','UNIT',{key:'equipmentRequirementSatisfied',equals:true},'ROSTER')},targetProfile('profile-a')],
    equipmentRequirement:{kind:'EQUIPMENT_PRESENT',equipmentId:id('equipment'),sourceFieldPath:['text']}});
  const knownAbsent=clone(state);unit(knownAbsent).equipmentContextKnown=true;
  const selected=clone(state);unit(selected).selections=[{selectionKey:'synthetic-selected',physicalQuantity:1,
    canonicalProfileIds:[],canonicalEquipmentIds:[id('equipment')],canonicalFieldPaths:{[id('equipment')]:['/text']}}];
  assert.equal(matches(selected,execute(book,selected),'alpha','MODEL','PROFILE_A','profile-a'),'FALSE');
  assert.equal(matches(knownAbsent,execute(book,knownAbsent),'alpha','MODEL','PROFILE_A','profile-a'),'TRUE');
  const unknown=execute(book,state);
  assert.equal(matches(state,unknown,'alpha','MODEL','PROFILE_A','profile-a'),'TRUE');
  assert.ok(unit(unknown).conditional.some(row=>row.ruleId===id('equipment-remove')&&row.state==='UNKNOWN'));
});
check('selected equipment identity is independent of evidence and exact physical ownership',()=>{
  const {book,state}=fixture();
  rule(book,'equipment-evidence',{operation:'REMOVE_KEYWORD',keyword:'PROFILE_A',
    conditions:[{binding:'SOURCE',predicate:atom('FIELD','UNIT',{key:'equipmentRequirementSatisfied',equals:true},'ROSTER')},targetProfile('profile-a')],
    equipmentRequirement:{kind:'EQUIPMENT_PRESENT',equipmentId:id('equipment'),sourceFieldPath:['text']}});
  const source=book.entities.find(e=>e.id===id('equipment-evidence'));
  source.kind='DATASHEET_SECTION';
  source.data.blocks=[{text:evidence.quote,wargearAbility:true}];
  for(const instance of state.units)instance.equipmentContextKnown=true;
  const selected={selectionKey:'selected-equipment',physicalQuantity:1,canonicalProfileIds:[],
    canonicalEquipmentIds:[id('equipment')],canonicalFieldPaths:{[id('equipment')]:['/text']}};
  unit(state).selections=[clone(selected)];
  const expected=execute(book,state);
  assert.equal(matches(state,expected,'alpha','MODEL','PROFILE_A','profile-a'),'FALSE');
  assert.equal(matches(state,expected,'beta','MODEL','PROFILE_A','profile-a'),'TRUE');
  assert.equal(applied(expected,'equipment-evidence','alpha').length,1);
  assert.equal(applied(expected,'equipment-evidence','beta').length,0);
  assertProof(book,applied(expected,'equipment-evidence')[0],'equipment-evidence',
    {operation:'REMOVE_KEYWORD',word:'PROFILE_A',profileName:'profile-a'});
  const evidenceOnly=clone(state);
  unit(evidenceOnly).selections=[{selectionKey:'source-clause-only',physicalQuantity:1,canonicalProfileIds:[],
    canonicalEquipmentIds:[source.id],canonicalFieldPaths:{[source.id]:['/blocks/0/text']},
    sourceReferences:[{entityId:source.id,path:'/blocks/0/text'}]}];
  assert.equal(matches(evidenceOnly,execute(book,evidenceOnly),'alpha','MODEL','PROFILE_A','profile-a'),'TRUE',
    'Source evidence was incorrectly accepted as selected equipment');
  const absent=clone(state);unit(absent).selections=[];
  assert.equal(matches(absent,execute(book,absent),'alpha','MODEL','PROFILE_A','profile-a'),'TRUE');
  const zero=clone(state);unit(zero).selections[0].physicalQuantity=0;
  assert.equal(matches(zero,execute(book,zero),'alpha','MODEL','PROFILE_A','profile-a'),'TRUE');
  assert.deepEqual(execute(book,state),expected,'Re-adding equipment accumulated an effect');
  const reordered=clone(state);reordered.units.reverse();
  assert.deepEqual(semantic(execute(book,reordered)),semantic(expected),'Instance order changed ownership');
});
check('attachment, detach, and reattach rebuild MODEL grants and formed UNIT contributions',()=>{
  const {book,state}=fixture();rule(book,'formation-grant',{parent:'leader',targetBinding:'SOURCE_FORMED_MODELS',keyword:'FORMED_BONUS',
    conditions:[{binding:'SOURCE',predicate:atom('FIELD','UNIT',{key:'leading',equals:true},'ROSTER')}]});
  const base=execute(book,state);
  assert.ok(base.units.every(row=>!row.keywords.includes('FORMED_BONUS')));
  const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader','alpha');
  const first=execute(book,attached);
  assert.ok(unit(first,'alpha').profiles.every(row=>row.keywords.includes('FORMED_BONUS')));
  assert.ok(!unit(first,'beta').keywords.includes('FORMED_BONUS'));
  assert.ok(first.formedUnits[0].keywords.includes('FORMED_BONUS'));
  const detached=changeAttachment(book,attached,book.rosterAttachmentPolicies,'DETACH','leader');
  assert.deepEqual(semantic(execute(book,detached)),semantic(base));
  const reattached=changeAttachment(book,attached,book.rosterAttachmentPolicies,'REATTACH','leader','beta');
  const second=execute(book,reattached);
  assert.ok(!unit(second,'alpha').keywords.includes('FORMED_BONUS'));
  assert.ok(unit(second,'beta').profiles.every(row=>row.keywords.includes('FORMED_BONUS')));
  const restored=changeAttachment(book,reattached,book.rosterAttachmentPolicies,'REATTACH','leader','alpha');
  assert.deepEqual(semantic(execute(book,restored)),semantic(first));
  assert.deepEqual(state.attachments,[],'Input roster must remain unchanged');
});
check('MODEL grants establish UNIT vocabulary for dependent grants independent of rule ordering',()=>{
  const {book,state}=fixture();rule(book,'dependent',{operation:'GRANT_UNIT_KEYWORD',keyword:'DEPENDENT',targetSubject:'UNIT',targetBinding:'SOURCE_UNIT',
    conditions:[{binding:'TARGET',predicate:keyword('UNIT','BONUS')}]});
  rule(book,'seed',{conditions:[targetProfile('profile-a')]});
  const projection=execute(book,state);
  assert.equal(matches(state,projection,'alpha','UNIT','DEPENDENT'),'TRUE');
  const reordered=clone(book);reordered.entities.reverse();
  assert.deepEqual(semantic(execute(reordered,state)),semantic(projection));
});
check('SOURCE_MODEL retains an imported singleton identity and leaves other physical entries unchanged',()=>{
  const {book,state}=fixture();rule(book,'singleton',{parent:'leader',targetBinding:'SOURCE_MODEL'});
  const projection=execute(book,state),rows=applied(projection,'singleton','leader');
  assert.equal(rows.length,1);
  assert.equal(rows[0].sourceInstanceId,'leader');
  assert.equal(rows[0].targetModelInstanceId,'leader');
  assert.equal(rows[0].targetProfileId,id('leader-profile'));
  assert.equal(matches(state,projection,'leader','MODEL','BONUS','leader-profile'),'TRUE');
  assert.ok(['alpha','beta'].every(instanceId=>!unit(projection,instanceId).keywords.includes('BONUS')));
});
check('LEADERS_OF_SOURCE affects only the actual attached Leader profile',()=>{
  const {book,state}=fixture();rule(book,'leader-target',{targetBinding:'LEADERS_OF_SOURCE'});
  const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader','alpha');
  const projection=execute(book,attached),rows=applied(projection,'leader-target','leader');
  assert.equal(rows.length,1);
  assert.equal(rows[0].sourceInstanceId,'alpha');
  assert.equal(rows[0].targetInstanceId,'leader');
  assert.equal(rows[0].targetProfileId,id('leader-profile'));
  assert.equal(rows[0].targetModelInstanceId,'leader');
  assert.equal(matches(attached,projection,'leader','MODEL','BONUS','leader-profile'),'TRUE');
  assert.equal(matches(attached,projection,'alpha','MODEL','BONUS','profile-a'),'FALSE');
  assert.equal(matches(attached,projection,'alpha','UNIT','BONUS'),'TRUE','Attached UNIT receives Leader contribution');
  assert.ok(!unit(projection,'beta').keywords.includes('BONUS'));
});
check('ROSTER_UNITS UNIT grants record roster origin and never confer MODEL keywords',()=>{
  const {book,state}=fixture();rule(book,'roster-target',{parent:'main',operation:'GRANT_UNIT_KEYWORD',targetSubject:'UNIT',targetBinding:'ROSTER_UNITS'});
  const projection=execute(book,state);
  for(const instanceId of ['alpha','beta','leader']) {
    const rows=applied(projection,'roster-target',instanceId);assert.equal(rows.length,1);
    assert.equal(rows[0].sourceInstanceId,null);
    assert.equal(rows[0].targetInstanceId,instanceId);
    assert.equal(rows[0].targetProfileId,null);
    assert.equal(rows[0].targetModelInstanceId,null);
    assert.ok(unit(projection,instanceId).keywords.includes('BONUS'));
    assert.ok(unit(projection,instanceId).profiles.every(row=>!row.keywords.includes('BONUS')));
  }
});
check('attachment-dependent removals rebuild from intrinsic MODEL facts after detach and reattach',()=>{
  const {book,state}=fixture();rule(book,'formation-remove',{parent:'leader',operation:'REMOVE_KEYWORD',keyword:'SHARED',targetBinding:'SOURCE_FORMED_MODELS',
    conditions:[{binding:'SOURCE',predicate:atom('FIELD','UNIT',{key:'leading',equals:true},'ROSTER')}]});
  const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader','alpha');
  const first=execute(book,attached);
  assert.ok(unit(first,'alpha').profiles.every(row=>!row.keywords.includes('SHARED')));
  assert.ok(unit(first,'beta').profiles.every(row=>row.keywords.includes('SHARED')));
  const detached=changeAttachment(book,attached,book.rosterAttachmentPolicies,'DETACH','leader');
  assert.deepEqual(semantic(execute(book,detached)),semantic(execute(book,state)));
  const reattached=changeAttachment(book,attached,book.rosterAttachmentPolicies,'REATTACH','leader','beta');
  const next=execute(book,reattached);
  assert.ok(unit(next,'alpha').profiles.every(row=>row.keywords.includes('SHARED')));
  assert.ok(unit(next,'beta').profiles.every(row=>!row.keywords.includes('SHARED')));
});
check('a removed effective keyword cannot activate a dependent grant regardless of rule order',()=>{
  const {book,state}=fixture();rule(book,'removed-dependency',{operation:'GRANT_UNIT_KEYWORD',keyword:'INVALID_DEPENDENCY',targetSubject:'UNIT',targetBinding:'SOURCE_UNIT',
    conditions:[{binding:'TARGET',predicate:keyword('UNIT','PROFILE_A')}]});
  rule(book,'remove-dependency',{operation:'REMOVE_KEYWORD',keyword:'PROFILE_A',conditions:[rosterGate(),targetProfile('profile-a')]});
  const projection=execute(book,state);
  assert.equal(matches(state,projection,'alpha','UNIT','PROFILE_A'),'FALSE');
  assert.equal(matches(state,projection,'alpha','UNIT','INVALID_DEPENDENCY'),'FALSE');
  assert.equal(applied(projection,'removed-dependency').length,0);
  const reordered=clone(book);reordered.entities.reverse();
  assert.deepEqual(semantic(execute(reordered,state)),semantic(projection));
});
check('nonconverging keyword conditions fail closed instead of returning an arbitrary state',()=>{
  const {book,state}=fixture();rule(book,'unstable',{conditions:[targetProfile('profile-a'),
    {binding:'TARGET',predicate:{op:'NOT',args:[keyword('MODEL','BONUS')]}}]});
  assert.throws(()=>execute(book,state),/converg|cycl/i);
});
check('independent effects are deterministic under source, unit, and rule order changes',()=>{
  const {book,state}=fixture();rule(book,'independent-a',{conditions:[targetProfile('profile-a')]});
  rule(book,'independent-b',{keyword:'OTHER_BONUS',conditions:[targetProfile('profile-b')]});
  const expected=semantic(execute(book,state));
  const reorderedBook=clone(book);reorderedBook.entities.reverse();reorderedBook.rosterProfileBindings.reverse();
  const reorderedState=clone(state);reorderedState.units.reverse();
  assert.deepEqual(semantic(execute(reorderedBook,reorderedState)),expected);
  assert.deepEqual(semantic(execute(book,state)),expected,'Repeated execution rebuilds from intrinsic source facts');
});
check('no-op removals produce no fabricated before/after change',()=>{
  const {book,state}=fixture();rule(book,'remove-absent',{operation:'REMOVE_KEYWORD',keyword:'ABSENT',conditions:[rosterGate()]});
  assert.ok(execute(book,state).units.every(row=>row.applied.length===0));
});
check('wrong keyword operation scopes and unresolved typed MODEL selectors fail validation',()=>{
  for(const options of [
    {operation:'GRANT_MODEL_KEYWORD',targetSubject:'UNIT',targetBinding:'SOURCE_UNIT'},
    {operation:'REMOVE_KEYWORD',targetSubject:'MODEL',targetBinding:'SOURCE_UNIT',conditions:[rosterGate()]},
    {conditions:[{binding:'TARGET',predicate:keyword('UNIT','UNIT_NATIVE')}]},
    {conditions:[targetProfile('missing-profile')]}
  ]) {
    const {book,state}=fixture();rule(book,'invalid',options);assert.throws(()=>execute(book,state));
  }
});
check('unresolved, duplicate, foreign, and incomplete explicit profile bindings fail closed',()=>{
  for(const mutate of [
    rows=>rows.pop(),rows=>rows.push(clone(rows[0])),rows=>{rows[0].profileId=id('missing-profile');},
    rows=>{rows[0].unitId=id('leader');},rows=>{delete rows[0].intrinsicKeywords;}
  ]) {
    const {book,state}=fixture();mutate(book.rosterProfileBindings);assert.throws(()=>execute(book,state));
  }
});
check('battle conditions and fabricated source evidence cannot authorize roster keyword removals',()=>{
  const battle=fixture();rule(battle.book,'battle-remove',{operation:'REMOVE_KEYWORD',conditions:[{
    binding:'SOURCE',predicate:atom('FIELD','UNIT',{key:'syntheticBattleFlag',equals:true},'BATTLE')}]});
  assert.throws(()=>execute(battle.book,battle.state));
  const falseProof=fixture();const effect=rule(falseProof.book,'false-proof');effect.evidence.quote='Unreviewed invented text.';
  assert.throws(()=>execute(falseProof.book,falseProof.state));
});

check('absent and explicit FORMED UNIT scope preserve recipients, context, deduplication and provenance',()=>{
  for(const targetBinding of ['SOURCE_UNIT','ROSTER_UNITS']) {
    const {book,state}=fixture();
    const effect=rule(book,'formed-default',{parent:targetBinding==='SOURCE_UNIT'?'leader':'main',
      operation:'GRANT_UNIT_KEYWORD',targetSubject:'UNIT',targetBinding,
      conditions:[{binding:'TARGET',predicate:keyword('UNIT','UNIT_NATIVE')}]});
    const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader','alpha');
    for(const input of [state,attached]) {
      delete effect.unitScope;
      const expected=execute(book,input);
      effect.unitScope='FORMED';
      assert.deepEqual(execute(book,input),expected,'Explicit FORMED must preserve the entire default projection');
      if(input===attached) {
        assert.ok(unit(expected,'leader').keywords.includes('BONUS'));
        assert.ok(unit(expected,'alpha').keywords.includes('BONUS'));
        assert.equal(applied(expected,'formed-default','alpha').length,1);
        assert.equal(applied(expected,'formed-default','leader').length,1);
      }
    }
  }
});
check('PHYSICAL SOURCE_UNIT uses own SOURCE identity and keywords without changing MODEL or sibling bags',()=>{
  const {book,state}=fixture();
  rule(book,'physical-source',{parent:'leader',operation:'GRANT_UNIT_KEYWORD',targetSubject:'UNIT',
    targetBinding:'SOURCE_UNIT',unitScope:'PHYSICAL',conditions:[
      {binding:'SOURCE',predicate:atom('UNIT_ID','UNIT',{id:id('leader')})},
      {binding:'SOURCE',predicate:keyword('UNIT','CHARACTER')}]});
  rule(book,'borrowed-source',{parent:'leader',operation:'GRANT_UNIT_KEYWORD',keyword:'BORROWED',targetSubject:'UNIT',
    targetBinding:'SOURCE_UNIT',unitScope:'PHYSICAL',conditions:[{binding:'SOURCE',predicate:keyword('UNIT','UNIT_NATIVE')}]});
  const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader','alpha');
  const projection=execute(book,attached);
  assert.ok(unit(projection,'leader').keywords.includes('BONUS'));
  assertProof(book,applied(projection,'physical-source','leader')[0],'physical-source',
    {instanceId:'leader',operation:'GRANT_UNIT_KEYWORD'});
  for(const instanceId of ['alpha','beta'])assert.ok(!unit(projection,instanceId).keywords.includes('BONUS'));
  assert.ok(projection.units.every(row=>!row.keywords.includes('BORROWED')));
  assert.ok(projection.units.every(row=>row.profiles.every(model=>!model.keywords.includes('BONUS'))));
  assert.ok(projection.formedUnits[0].keywords.includes('BONUS'),'Physical contribution must update the formed UNIT union');
});
check('PHYSICAL ROSTER_UNITS TARGET conditions work with null source and do not borrow formed identity',()=>{
  for(const [predicate,recipients] of [
    [atom('UNIT_ID','UNIT',{id:id('leader')}),['leader']],
    [atom('UNIT_ID','UNIT',{id:id('mixed')}),['alpha','beta']],
    [keyword('UNIT','CHARACTER'),['leader']],
    [keyword('UNIT','UNIT_NATIVE'),['alpha','beta']],
    [atom('FIELD','UNIT',{key:'leading',equals:true},'ROSTER'),['leader']]
  ]) {
    const {book,state}=fixture();
    rule(book,'physical-target',{parent:'main',operation:'GRANT_UNIT_KEYWORD',targetSubject:'UNIT',
      targetBinding:'ROSTER_UNITS',unitScope:'PHYSICAL',conditions:[{binding:'TARGET',predicate}]});
    const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader','alpha');
    const projection=execute(book,attached);
    for(const row of projection.units) {
      assert.equal(row.keywords.includes('BONUS'),recipients.includes(row.instanceId),row.instanceId);
      assert.ok(row.profiles.every(model=>!model.keywords.includes('BONUS')));
      const proof=applied(projection,'physical-target',row.instanceId);
      assert.equal(proof.length,recipients.includes(row.instanceId)?1:0);
      if(proof.length) {
        assert.equal(proof[0].sourceInstanceId,null);
        assert.equal(proof[0].targetInstanceId,row.instanceId);
        assert.equal(proof[0].targetProfileId,null);
        assert.deepEqual(proof[0].sourceFields,[['text']]);
      }
    }
  }
});
check('PHYSICAL grants deduplicate by physical instance including two recipients in one formation',()=>{
  const {book,state}=fixture();
  rule(book,'all-physical',{parent:'main',operation:'GRANT_UNIT_KEYWORD',targetSubject:'UNIT',
    targetBinding:'ROSTER_UNITS',unitScope:'PHYSICAL'});
  const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader','alpha');
  const projection=execute(book,attached);
  for(const row of projection.units) {
    assert.equal(row.keywords.filter(word=>word==='BONUS').length,1);
    assert.equal(applied(projection,'all-physical',row.instanceId).length,1);
    assert.ok(row.profiles.every(model=>!model.keywords.includes('BONUS')));
  }
  assert.equal(projection.formedUnits[0].keywords.filter(word=>word==='BONUS').length,1);
  const reorderedBook=clone(book);reorderedBook.entities.reverse();
  const reorderedState=clone(attached);reorderedState.units.reverse();
  assert.deepEqual(semantic(execute(reorderedBook,reorderedState)),semantic(projection));
  rule(book,'same-keyword',{parent:'main',operation:'GRANT_UNIT_KEYWORD',targetSubject:'UNIT',
    targetBinding:'ROSTER_UNITS',unitScope:'PHYSICAL'});
  const duplicate=execute(book,attached);
  for(const row of duplicate.units) {
    assert.equal(row.keywords.filter(word=>word==='BONUS').length,1);
    assert.equal(applied(duplicate,'same-keyword',row.instanceId).length,0,'Identical final keyword does not fabricate another change');
  }
});
check('PHYSICAL attachment-dependent grants rebuild without stale component or union keywords',()=>{
  const {book,state}=fixture();
  rule(book,'physical-leading',{parent:'leader',operation:'GRANT_UNIT_KEYWORD',targetSubject:'UNIT',
    targetBinding:'SOURCE_UNIT',unitScope:'PHYSICAL',conditions:[
      {binding:'SOURCE',predicate:atom('FIELD','UNIT',{key:'leading',equals:true},'ROSTER')}]});
  const base=execute(book,state);
  const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader','alpha');
  const first=execute(book,attached);
  assert.ok(unit(first,'leader').keywords.includes('BONUS'));
  assert.ok(!unit(first,'alpha').keywords.includes('BONUS'));
  const detached=changeAttachment(book,attached,book.rosterAttachmentPolicies,'DETACH','leader');
  assert.deepEqual(execute(book,detached),base);
  const restored=changeAttachment(book,detached,book.rosterAttachmentPolicies,'ATTACH','leader','alpha');
  assert.deepEqual(execute(book,restored),first);
  const moved=changeAttachment(book,attached,book.rosterAttachmentPolicies,'REATTACH','leader','beta');
  const next=execute(book,moved);
  assert.ok(!unit(next,'alpha').keywords.includes('BONUS'));
  assert.ok(!unit(next,'beta').keywords.includes('BONUS'));
  assert.ok(unit(next,'leader').keywords.includes('BONUS'));
  assert.ok(next.formedUnits.find(group=>group.memberInstanceIds.includes('beta')).keywords.includes('BONUS'));
});
check('identical physical Leaders keep independent attachment eligibility and keyword provenance',()=>{
  const {book,state}=fixture();
  const duplicate=clone(state.units.find(row=>row.instanceId==='leader'));
  duplicate.instanceId='leader-copy';state.units.push(duplicate);
  rule(book,'physical-duplicate',{parent:'leader',operation:'GRANT_UNIT_KEYWORD',targetSubject:'UNIT',
    targetBinding:'SOURCE_UNIT',unitScope:'PHYSICAL',conditions:[
      {binding:'SOURCE',predicate:atom('FIELD','UNIT',{key:'leading',equals:true},'ROSTER')}]});
  const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader','alpha');
  const first=execute(book,attached);
  assert.ok(unit(first,'leader').keywords.includes('BONUS'));
  assert.ok(!unit(first,'leader-copy').keywords.includes('BONUS'));
  const reordered=clone(attached);reordered.units.reverse();
  assert.deepEqual(semantic(execute(book,reordered)),semantic(first));
  const detached=changeAttachment(book,attached,book.rosterAttachmentPolicies,'DETACH','leader');
  const switched=changeAttachment(book,detached,book.rosterAttachmentPolicies,'ATTACH','leader-copy','alpha');
  const next=execute(book,switched);
  assert.ok(!unit(next,'leader').keywords.includes('BONUS'));
  assert.ok(unit(next,'leader-copy').keywords.includes('BONUS'));
  assertProof(book,applied(next,'physical-duplicate','leader-copy')[0],'physical-duplicate',
    {instanceId:'leader-copy',operation:'GRANT_UNIT_KEYWORD'});
  assert.ok(!unit(next,'alpha').keywords.includes('BONUS'));
});
check('PHYSICAL keyword conditions retain fixed-point dependencies and physical MODEL contributions',()=>{
  const {book,state}=fixture();
  rule(book,'model-seed',{keyword:'SEED',conditions:[targetProfile('profile-a')]});
  rule(book,'physical-dependent',{parent:'main',operation:'GRANT_UNIT_KEYWORD',targetSubject:'UNIT',
    targetBinding:'ROSTER_UNITS',unitScope:'PHYSICAL',conditions:[{binding:'TARGET',predicate:keyword('UNIT','SEED')}]});
  const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader','alpha');
  const expected=execute(book,attached);
  for(const instanceId of ['alpha','beta']) {
    assert.ok(unit(expected,instanceId).keywords.includes('BONUS'));
    assert.ok(unit(expected,instanceId).profiles.every(model=>!model.keywords.includes('BONUS')));
  }
  assert.ok(!unit(expected,'leader').keywords.includes('BONUS'),'Leader cannot borrow the formed union SEED');
  const reordered=clone(book);reordered.entities.reverse();
  const reversed=clone(attached);reversed.units.reverse();
  assert.deepEqual(semantic(execute(reordered,reversed)),semantic(expected));
  rule(book,'remove-seed',{operation:'REMOVE_KEYWORD',keyword:'SEED',conditions:[rosterGate(),targetProfile('profile-a')]});
  assert.ok(execute(book,attached).units.every(row=>!row.keywords.includes('BONUS')),
    'Removed MODEL contribution cannot enable a PHYSICAL UNIT grant');
});
check('PHYSICAL grants preserve grant-only fixed points without borrowing sibling contributions',()=>{
  const {book,state}=fixture();
  rule(book,'unit-seed',{parent:'leader',operation:'GRANT_UNIT_KEYWORD',keyword:'SEED',targetSubject:'UNIT',
    targetBinding:'SOURCE_UNIT',unitScope:'PHYSICAL'});
  rule(book,'unit-dependent',{parent:'main',operation:'GRANT_UNIT_KEYWORD',targetSubject:'UNIT',
    targetBinding:'ROSTER_UNITS',unitScope:'PHYSICAL',conditions:[{binding:'TARGET',predicate:keyword('UNIT','SEED')}]});
  const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader','alpha');
  const expected=execute(book,attached);
  assert.ok(unit(expected,'leader').keywords.includes('BONUS'));
  for(const instanceId of ['alpha','beta'])assert.ok(!unit(expected,instanceId).keywords.includes('BONUS'));
  const reordered=clone(book);reordered.entities.reverse();
  assert.deepEqual(semantic(execute(reordered,attached)),semantic(expected));
});
check('UNIT keyword scope accepts only absent, FORMED or PHYSICAL and rejects battle execution',()=>{
  for(const unitScope of [undefined,'FORMED','PHYSICAL']) {
    const {book,state}=fixture();rule(book,'valid-scope',{operation:'GRANT_UNIT_KEYWORD',targetSubject:'UNIT',
      targetBinding:'SOURCE_UNIT',unitScope});assert.ok(execute(book,state));
  }
  for(const unitScope of [null,'',false,0,'INVALID',{},[]]) {
    const {book,state}=fixture();rule(book,'invalid-scope',{operation:'GRANT_UNIT_KEYWORD',targetSubject:'UNIT',
      targetBinding:'SOURCE_UNIT',unitScope});assert.throws(()=>execute(book,state),/Invalid UNIT keyword grant/);
  }
  const {book,state}=fixture();rule(book,'physical-battle',{operation:'GRANT_UNIT_KEYWORD',targetSubject:'UNIT',
    targetBinding:'SOURCE_UNIT',unitScope:'PHYSICAL',conditions:[{
      binding:'TARGET',predicate:atom('FIELD','UNIT',{key:'syntheticBattleFlag',equals:true},'BATTLE')}]});
  assert.throws(()=>execute(book,state));
  const nonExecuting=fixture();
  rule(nonExecuting.book,'battle-reference',{operation:'GRANT_UNIT_KEYWORD',targetSubject:'UNIT',
    targetBinding:'SOURCE_UNIT',unitScope:'PHYSICAL'});
  const clause=nonExecuting.book.entities.at(-1).ruleContract.clauses[0];
  clause.rosterClassification='BATTLE_ONLY';clause.rosterEffects=[];
  clause.rosterClassificationNote={reason:'Synthetic battle-only rule remains conditional.'};
  const projection=execute(nonExecuting.book,nonExecuting.state);
  assert.ok(projection.units.every(row=>!row.keywords.includes('BONUS')));
  assert.ok(unit(projection,'alpha').conditional.some(row=>row.ruleId===id('battle-reference')&&row.state==='UNKNOWN'));
});

check('root Army Rule dispatch preserves exact physical recipients and source attribution',()=>{
  const {book,state}=fixture();
  rule(book,'root-army',{operation:'GRANT_UNIT_KEYWORD',targetSubject:'UNIT',targetBinding:'ROSTER_UNITS',
    unitScope:'PHYSICAL',conditions:[{binding:'TARGET',predicate:keyword('UNIT','UNIT_NATIVE')}]});
  const root=book.entities.at(-1);delete root.parentId;root.kind='ARMY_RULE';
  Object.assign(root.ruleContract,{kind:'ARMY_RULE',ownerId:book.bookId});
  const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader','alpha');
  const projection=execute(book,attached);
  for(const instanceId of ['alpha','beta']){
    assert.ok(unit(projection,instanceId).keywords.includes('BONUS'));
    assert.ok(unit(projection,instanceId).profiles.every(model=>!model.keywords.includes('BONUS')));
    const traces=applied(projection,'root-army',instanceId);assert.equal(traces.length,1);
    assert.equal(traces[0].sourceInstanceId,null);assert.equal(traces[0].targetInstanceId,instanceId);
    assert.equal(traces[0].clauseId,'root-army/clause');assert.deepEqual(traces[0].sourceFields,[['text']]);
  }
  assert.ok(!unit(projection,'leader').keywords.includes('BONUS'));
  assert.deepEqual(execute(book,attached),projection);
  for(const targetBinding of ['SOURCE_UNIT','SOURCE_UNIT_MODELS']){
    const invalid=clone(book);invalid.entities.at(-1).ruleContract.clauses[0].rosterEffects[0].targetBinding=targetBinding;
    if(targetBinding==='SOURCE_UNIT_MODELS'){
      const effect=invalid.entities.at(-1).ruleContract.clauses[0].rosterEffects[0];
      effect.targetSubject='MODEL';effect.operation='GRANT_MODEL_KEYWORD';delete effect.unitScope;
    }
    assert.throws(()=>execute(invalid,state),/Root Army Rule requires global targets/);
  }
});
check('root Army Rule TARGET FIELD fails closed for false and unknown',()=>{
  for(const value of [undefined,false,true]){
    const {book,state}=fixture();
    rule(book,'root-field',{operation:'GRANT_UNIT_KEYWORD',targetSubject:'UNIT',targetBinding:'ROSTER_UNITS',unitScope:'PHYSICAL',
      conditions:[{binding:'TARGET',predicate:atom('FIELD','UNIT',{key:'equipmentRequirementSatisfied',equals:true},'ROSTER')}]});
    const root=book.entities.at(-1);delete root.parentId;root.kind='ARMY_RULE';
    Object.assign(root.ruleContract,{kind:'ARMY_RULE',ownerId:book.bookId});
    const schema={...evaluator,evaluatePredicate:(node,context)=>evaluator.evaluatePredicate(node,
      {...context,roster:{...context.roster,...(value===undefined?{}:{equipmentRequirementSatisfied:value})}})};
    validateRosterEffects(book,schema.validatePredicate,schema.evaluatePredicate);
    const projection=executeRosterEffects(book,validateRoster(book,state,book.rosterAttachmentPolicies),schema);
    assert.ok(projection.units.every(row=>row.keywords.includes('BONUS')===(value===true)));
  }
});
check('non-executable root and parented Army components retain previous dispatch',()=>{
  for(const parented of [false,true]){
    const {book,state}=fixture();
    rule(book,'army-component',{parent:'main',operation:'GRANT_UNIT_KEYWORD',targetSubject:'UNIT',targetBinding:'ROSTER_UNITS',unitScope:'PHYSICAL'});
    const root=book.entities.at(-1);root.kind='ARMY_RULE';root.ruleContract.kind='ARMY_RULE';
    delete root.ruleContract.detachmentId;
    if(!parented){delete root.parentId;root.ruleContract.ownerId=book.bookId;
      const clause=root.ruleContract.clauses[0];clause.rosterEffects=[];clause.rosterClassification='BATTLE_ONLY';
      clause.rosterClassificationNote={reason:'Unknown battle action'};}
    const projection=execute(book,state);
    assert.ok(projection.units.every(row=>!row.keywords.includes('BONUS')&&row.conditional.length===0));
  }
});
console.log(JSON.stringify({status:'PASS',checks:checks.length,names:checks},null,2));
