/** Canonical MODEL suppression: synthetic source and registry only. */
import assert from 'node:assert/strict';
import {createRuleContractSchema} from '../rule-contract-v2/schema.mjs';
import {changeAttachment,validateRoster,withRosterDetachments} from './context.mjs';
import {executeRosterEffects,validateRosterEffects} from './effects.mjs';
import {createRosterRuntime} from './runtime.mjs';
import {buildAttachmentFeasibility} from './compatibility-feasibility.mjs';
import {projectAbilityPresentation} from '../army-book-app-v2/ability-presentation.mjs';

const clone=value=>structuredClone(value),id=name=>'synthetic-suppression:'+name;
const evidence={field:['text'],quote:'Eligible models suppress the designated canonical ability while this source applies.'};
const atom=(predicate,subject,args,contextLevel='STATIC')=>({predicate,subject,contextLevel,arguments:args,evidence:clone(evidence)});
const evaluator=withRosterDetachments(createRuleContractSchema({stateFields:{leading:{contextLevel:'ROSTER',valueType:'boolean'}}}));
const canonical=name=>({canonicalId:id(name),name:'Identical display caption',parameters:{}});
function fixture({global=false,leading=false,abilityId=id('ability-a')}={}) {
  const entities=['main','other'].map(name=>({id:id(name),kind:'DETACHMENT',data:{title:name}})),rosterProfileBindings=[];
  for(const [name,profiles]of [['mixed',['eligible','sibling']],['leader',['leader-profile']]]) {
    entities.push({id:id(name),kind:'DATASHEET',data:{title:name,profileIds:profiles.map(id),keywords:name==='leader'?['CHARACTER']:['BODYGUARD'],
      factionKeywords:[],ruleReferenceIds:[id(name+'-reference')],weaponIds:[],sectionIds:[],wargearOptionIds:[]}});
    entities.push({id:id(name+'-reference'),kind:'RULE_REFERENCE',parentId:id(name),data:{text:'Identical display caption',armyRuleId:id('ability-a')}});
    for(const profile of profiles) {
      entities.push({id:id(profile),kind:'PROFILE',parentId:id(name),data:{name:profile,W:'3',M:'6"'}});
      rosterProfileBindings.push({unitId:id(name),profileId:id(profile),intrinsicKeywords:profile==='eligible'?['ELIGIBLE']:[],referenceIds:[id(name+'-reference')]});
    }
  }
  for(const name of ['ability-a','ability-b'])entities.push({id:id(name),kind:'ARMY_RULE',data:{title:'Identical display caption',text:'Canonical source remains readable.'}});
  const selector=atom('MODEL_KEYWORD','MODEL',{keyword:'ELIGIBLE'}),owner=atom('UNIT_ID','UNIT',{id:id('mixed')});
  const effect={id:id('remove'),operation:'REMOVE_ABILITY',ability:{canonicalId:abilityId},targetSubject:'MODEL',
    targetBinding:global?'ROSTER_MODELS':'SOURCE_UNIT_MODELS',conditions:[{binding:'TARGET',predicate:selector},
      ...(leading?[{binding:'SOURCE',predicate:atom('FIELD','UNIT',{key:'leading',equals:true},'ROSTER')}]:[])],
    evidence:clone(evidence),sourceFields:[['text']],lifetime:'WHILE_SOURCE_APPLIES',
    ...(global?{containingUnitScope:'PHYSICAL',recipientSelectors:{unit:atom('ALWAYS','UNIT',{}),model:clone(selector)}}:{})};
  entities.push({id:id('source'),kind:global?'DETACHMENT_RULE':'ENHANCEMENT',parentId:id('main'),data:{text:evidence.quote},provenance:{sourceId:id('source-proof')},
    ruleContract:{schema:'rule-contract/v2',ruleId:id('source'),ownerId:id('main'),sourceId:id('source-proof'),kind:global?'DETACHMENT_RULE':'ENHANCEMENT',
      executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',detachmentId:id('main'),sourceFields:[['text']],conditions:[],
      roles:global?[]:[{id:'owner',subject:'UNIT',allegiance:'FRIENDLY',selector:owner,conditions:[]}],
      ...(!global?{assignment:{ownerRoleId:'owner',selector:clone(owner)}}:{}),
      clauses:[{id:id('clause'),sourceFields:[['text']],roles:[],conditions:[],rosterClassification:'ROSTER_EXECUTABLE',rosterEffects:[effect]}]}});
  const book={bookId:id('book'),entities,rosterProfileBindings,
    rosterAbilityReferences:Object.fromEntries(['ability-a','ability-b'].map(name=>[id(name),{id:id(name),title:'Identical display caption',parameters:{}}])),
    rosterReferenceSemantics:Object.fromEntries(['mixed','leader'].map(name=>[id(name+'-reference'),{abilities:[canonical('ability-a'),canonical('ability-b')]}])),
    rosterAttachmentPolicies:[{sourceId:id('leader'),targetId:id('mixed'),role:'LEADER',additionalLeaders:0,sourceIds:[id('relation')]}]};
  const unit=(instanceId,name,assigned=false)=>({instanceId,canonicalUnitId:id(name),startingStrength:name==='mixed'?2:1,
    modelRows:(name==='mixed'?['eligible','sibling']:['leader-profile']).map(profile=>({rowId:profile,canonicalProfileId:id(profile),quantity:1,selections:[],loadouts:[]})),
    enhancementIds:assigned?[id('source')]:[],selections:[],warlord:null});
  const state={schema:'roster-v2/roster',bookId:book.bookId,rosterId:id('roster'),detachments:[{instanceId:'d',canonicalDetachmentId:id('main')}],detachmentIds:[id('main')],
    units:[unit('a','mixed',!global),unit('b','mixed'),unit('leader','leader')],attachments:[],warlordInstanceId:null};
  return {book,state,effect};
}
const model=(result,instance='a',profile='eligible')=>result.units.find(unit=>unit.instanceId===instance).profiles.find(row=>row.canonicalProfileId===id(profile));
const has=(model,name)=>model.abilities.some(ability=>ability.canonicalId===id(name));
function execute(book,state) {
  const snapshot=JSON.stringify({book,state});evaluator.validateContracts(book);validateRosterEffects(book,evaluator.validatePredicate,evaluator.evaluatePredicate);
  const result=executeRosterEffects(book,validateRoster(book,state,book.rosterAttachmentPolicies),evaluator);
  assert.equal(JSON.stringify({book,state}),snapshot);return result;
}
function verify(abilityId=id('ability-a')) {
  const {book,state}=fixture({abilityId}),result=execute(book,state);
  assert.equal(has(model(result),'ability-a'),false,'Designated canonical ability must be suppressed');
  assert.equal(has(model(result),'ability-b'),true,'Same display title is an independent canonical ability');
  assert.equal(has(model(result,'a','sibling'),'ability-a'),true);assert.equal(has(model(result,'b'),'ability-a'),true);
  const proof=result.units[0].applied[0];assert.equal(proof.targetAbilityId,id('ability-a'));assert.equal(proof.ruleId,id('source'));
  assert.equal(proof.sourceInstanceId,'a');assert.equal(proof.targetInstanceId,'a');assert.equal(proof.targetProfileId,id('eligible'));
  assert.equal(proof.targetCompositionId,model(result).scopeId);assert.deepEqual(proof.sourceFields,[['text']]);
  assert.ok(proof.before.some(ability=>ability.canonicalId===id('ability-a')));assert.ok(!proof.after.some(ability=>ability.canonicalId===id('ability-a')));
  const removed=clone(state);removed.units[0].enhancementIds=[];assert.equal(has(model(execute(book,removed)),'ability-a'),true);
  removed.units[0].enhancementIds=[id('source')];assert.deepEqual(execute(book,removed),result);
  // A friendly component must not inherit another component's intrinsic selector.
  const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader','a');
  assert.equal(has(model(execute(book,attached),'leader','leader-profile'),'ability-a'),true);
  assert.equal(has(model(execute(book,attached)),'ability-a'),false);
  assert.deepEqual(execute(book,changeAttachment(book,attached,book.rosterAttachmentPolicies,'DETACH','leader')),result);
  assert.deepEqual(execute(book,clone(state)),result);
  return {book,state,result};
}
const {book,state,result}=verify();
assert.throws(()=>verify(id('ability-b')),/Designated canonical ability/,'Wrong canonical ID escaped focused QA');
const global=fixture({global:true}),globalResult=execute(global.book,global.state);
assert.equal(has(model(globalResult),'ability-a'),false);assert.equal(has(model(globalResult,'b'),'ability-a'),false);
assert.equal(has(model(globalResult,'a','sibling'),'ability-a'),true);
const switched=clone(global.state);switched.detachmentIds=[id('other')];switched.detachments=[{instanceId:'d',canonicalDetachmentId:id('other')}];
assert.equal(has(model(execute(global.book,switched)),'ability-a'),true);assert.deepEqual(execute(global.book,global.state),globalResult);
const dependent=fixture({global:true});dependent.effect.conditions.push({binding:'TARGET',predicate:atom('FIELD','UNIT',{key:'leading',equals:true},'ROSTER')});
// A MODEL recipient condition must remain MODEL-scoped; do not borrow UNIT state.
assert.throws(()=>execute(dependent.book,dependent.state),/Wrong effect target predicate subject/);
const leaderConditional=fixture({global:true});leaderConditional.effect.conditions.push({binding:'TARGET',predicate:atom('FIELD','MODEL',{key:'leading',equals:true},'ROSTER')});
assert.equal(has(model(execute(leaderConditional.book,leaderConditional.state)),'ability-a'),true);
const joined=changeAttachment(leaderConditional.book,leaderConditional.state,leaderConditional.book.rosterAttachmentPolicies,'ATTACH','leader','a');
assert.equal(has(model(execute(leaderConditional.book,joined),'a'),'ability-a'),true,'Bodyguard is not LEADING');
const joinedModel=leaderConditional.book.rosterProfileBindings.find(row=>row.profileId===id('leader-profile'));joinedModel.intrinsicKeywords=['ELIGIBLE'];
assert.equal(has(model(execute(leaderConditional.book,joined),'leader','leader-profile'),'ability-a'),false);
assert.equal(has(model(execute(leaderConditional.book,changeAttachment(leaderConditional.book,joined,leaderConditional.book.rosterAttachmentPolicies,'DETACH','leader')),'leader','leader-profile'),'ability-a'),true);

book.compatibilityFeasibility=buildAttachmentFeasibility(book,book.rosterProfileBindings.map(binding=>({
  unitId:binding.unitId,profileId:binding.profileId,intrinsicKeywords:binding.intrinsicKeywords,maxModels:1})));
const service=createRosterRuntime(book,evaluator);service.load(state);const effective=service.effective('a');
assert.deepEqual(effective.profiles[0].suppressedAbilityIds,[id('ability-a')]);
const profiles=result.units[0].profiles.map(row=>({id:row.canonicalProfileId,scopeId:row.scopeId,quantity:row.quantity,abilities:row.abilities,suppressedAbilityIds:row.suppressedAbilityIds}));
const refs=[{canonicalId:id('ability-a'),parameters:{},group:'ARMY RULES',label:'Identical display caption'}];
const plan=projectAbilityPresentation({instanceId:'a',profiles,references:refs});assert.equal(plan.otherReferences.length,0);
assert.ok(plan.profiles.find(row=>row.id===id('sibling')).abilities.some(ability=>ability.canonicalId===id('ability-a')));
assert.equal(plan.profiles.find(row=>row.id===id('sibling')).abilities.filter(ability=>ability.canonicalId===id('ability-a')).length,1);
assert.ok(!plan.profiles.find(row=>row.id===id('eligible')).abilities.some(ability=>ability.canonicalId===id('ability-a')));
const masked=profiles.map(row=>({...row,suppressedAbilityIds:[id('ability-a')]}));
assert.equal(projectAbilityPresentation({instanceId:'a',profiles:masked,references:refs}).otherReferences.length,0);
const coreReference={...refs[0],group:'CORE ABILITIES',runtimeEntryId:'canonical-occurrence'};
const corePlan=projectAbilityPresentation({instanceId:'a',profiles:masked.map(row=>({...row,abilities:[{id:'canonical-occurrence',name:'Different caption'}]})),references:[coreReference]});
assert.equal(corePlan.core.length,0);assert.ok(corePlan.profiles.every(row=>!row.abilities.length));
const staticCorePlan=projectAbilityPresentation({instanceId:'a',profiles:masked,references:[{...coreReference,runtimeEntryId:undefined}]});
assert.ok(!staticCorePlan.core.some(ability=>ability.canonicalId===id('ability-a')),'A static reference cannot reseed a suppressed ability');
const unitOwned=projectAbilityPresentation({instanceId:'a',profiles:masked,unitAbilities:[canonical('ability-a')],references:refs});
assert.equal(unitOwned.core.filter(ability=>ability.canonicalId===id('ability-a')).length,1);
assert.equal(unitOwned.core.find(ability=>ability.canonicalId===id('ability-a')).subject,'UNIT','MODEL suppression must preserve independently owned UNIT ability');
const sameProfile=projectAbilityPresentation({instanceId:'a',profiles:[
  {...masked[0],id:'shared-profile',scopeId:'first'},
  {...profiles[1],id:'shared-profile',scopeId:'second'}],references:refs});
assert.equal(sameProfile.profiles[0].abilities.some(ability=>ability.canonicalId===id('ability-a')),false);
assert.equal(sameProfile.profiles[1].abilities.some(ability=>ability.canonicalId===id('ability-a')),true);
const allSuppressed=fixture();allSuppressed.book.rosterReferenceSemantics[id('mixed-reference')].abilities=[canonical('ability-a')];
allSuppressed.effect.conditions=[];
allSuppressed.book.compatibilityFeasibility=book.compatibilityFeasibility;
const allService=createRosterRuntime(allSuppressed.book,evaluator);allService.load(allSuppressed.state);
assert.ok(!allService.effective('a').abilities.some(row=>row.id===id('mixed-reference')));
assert.ok(allService.effective('b').abilities.some(row=>row.id===id('mixed-reference')));
// Suppression stays effective even when an independent source grants the same ID.
const grantOrder=fixture(),grant=clone(grantOrder.book.entities.find(row=>row.id===id('source')));
grant.id=id('other-grant');grant.ruleContract.ruleId=grant.id;
const grantEffect=grant.ruleContract.clauses[0].rosterEffects[0];grantEffect.id=id('grant');grantEffect.operation='GRANT_ABILITY';grantEffect.ability={canonicalId:id('ability-a'),parameters:{}};
grantOrder.book.entities.push(grant);grantOrder.state.units[0].enhancementIds.push(grant.id);
const grantedThenRemoved=execute(grantOrder.book,grantOrder.state);
assert.equal(has(model(grantedThenRemoved),'ability-a'),false);
grantOrder.book.entities.reverse();assert.deepEqual(execute(grantOrder.book,grantOrder.state),grantedThenRemoved);
assert.ok(book.entities.some(row=>row.id===id('ability-a')));assert.ok(book.rosterReferenceSemantics[id('mixed-reference')].abilities.some(row=>row.canonicalId===id('ability-a')));
const invalid=fixture();invalid.effect.ability.canonicalId='unbound-id';assert.throws(()=>execute(invalid.book,invalid.state),/Unresolved canonical MODEL ability/);
const unitRemoval=fixture();unitRemoval.effect.targetSubject='UNIT';unitRemoval.effect.targetBinding='SOURCE_UNIT';assert.throws(()=>execute(unitRemoval.book,unitRemoval.state),/canonical MODEL ability/);
console.log(JSON.stringify({status:'PASS',canonicalIdentity:true,sameNamedIndependentAbility:true,mixedProfileScope:true,physicalIsolation:true,attachDetach:true,
  removeRestore:true,mutationRejected:true,canonicalFactsImmutable:true,scopedPresentation:true,armyFactualReads:0}));
