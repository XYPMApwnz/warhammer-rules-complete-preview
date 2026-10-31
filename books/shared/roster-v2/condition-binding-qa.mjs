/** Focused synthetic contracts for the shared binder, not book certification. */
import assert from 'node:assert/strict';
import {createRosterConditionBinding} from './condition-binding.mjs';
import {createRuleContractSchema} from '../rule-contract-v2/schema.mjs';
import {findConditionValue,setConditionValue} from '../rule-contract-v2/conditions.mjs';
import {createRosterConditionContext} from './condition-context.mjs';
import {createEquippedWeaponChoiceConditionContext,createInitialAttachmentConditionContext} from './physical-condition-context.mjs';

const clone=structuredClone;
let checks=0;
const check=(name,run)=>{run();checks++;};
const field=(key,equals=true,parameters={},subject='MODEL')=>({predicate:'FIELD',subject,contextLevel:'ROSTER',arguments:{key,equals,...parameters}});
const always={predicate:'ALWAYS',subject:'MODEL',contextLevel:'STATIC',arguments:{}};
const condition=(context,key,parameters={})=>findConditionValue(context.roster,{key,...parameters});
const unit=(instanceId,canonicalUnitId='unit',quantity=2)=>({instanceId,canonicalUnitId,startingStrength:quantity,
  warlord:false,enhancementIds:[],selections:[],modelRows:[{rowId:'row',canonicalProfileId:canonicalUnitId+'-model',quantity,selections:[]} ]});
const state={schema:'roster-v2/roster',bookId:'synthetic',rosterId:'test',detachments:[{instanceId:'d',canonicalDetachmentId:'detachment'}],
  detachmentIds:['detachment'],units:[unit('first'),unit('second')],attachments:[]};
const data=(profileId,keywords=[])=>({title:profileId,keywords,factionKeywords:[],profileIds:[profileId],weaponIds:[],ruleReferenceIds:[]});
const book={bookId:'synthetic',entities:[{id:'detachment',kind:'DETACHMENT',data:{}},
  {id:'unit',kind:'DATASHEET',data:data('unit-model')},{id:'unit-model',kind:'PROFILE',parentId:'unit',data:{name:'Model'}},
  {id:'equipment',kind:'WARGEAR_OPTION',parentId:'unit',data:{text:'Equipment'}}],rosterAttachmentPolicies:[]};
const context=(instanceId='first',subject='MODEL')=>({subject,instanceId,unitId:'unit',modelId:'unit-model',
  modelScopeId:`${instanceId}/row/PROFILE/row`,owner:{unitId:'unit'},roster:{},battle:{},keywords:new Set(),abilities:new Set()});
const schema=createRuleContractSchema({stateFields:{attached:{contextLevel:'ROSTER',valueType:'boolean'},
  smEquipmentBearerSatisfied:{contextLevel:'ROSTER',valueType:'boolean'},
  smPhysicalUnitInstanceId:{contextLevel:'ROSTER',valueType:'string'},smPhysicalModelScopeId:{contextLevel:'ROSTER',valueType:'string'},
  smPermanentAssaultSource:{contextLevel:'ROSTER',valueType:'boolean'},
  daAncientPresent:{contextLevel:'ROSTER',valueType:'boolean'},daArmyMembershipProven:{contextLevel:'ROSTER',valueType:'boolean'},
  daPhysicalChapter:{contextLevel:'ROSTER',valueType:'string'},daChapterContextStatus:{contextLevel:'ROSTER',valueType:'string'}}});
const equipmentInput=(quantityProof='POSITIVE_SELECTION',clearUnrequestedEquipment=true)=>({key:'equipmentBearerSatisfied',arguments:{quantityProof},clearUnrequestedEquipment});
const equipmentArgs={equipmentId:'equipment',quantityProof:'POSITIVE_SELECTION'};
const equipment=field('equipmentBearerSatisfied',true,equipmentArgs);
const selectedState=clone(state);
selectedState.units[0].modelRows[0].selections=[{selectionKey:'item',canonicalEquipmentIds:['equipment'],canonicalProfileIds:[],
  canonicalFieldPaths:{equipment:['/text']},physicalQuantity:1}];

check('NONE preserves the kernel and does not add roster detachment behavior',()=>{
  const bound=createRosterConditionBinding({schema,inputs:[]});
  assert.equal(bound.evaluatePredicate,schema.evaluatePredicate);assert.equal(bound.evaluateRole,schema.evaluateRole);
  const ctx=context();assert.equal(bound.bindContext(ctx),ctx);
  const node={predicate:'DETACHMENT',subject:'MODEL',contextLevel:'ROSTER',arguments:{id:'detachment'}};
  ctx.roster.detachmentIds=['detachment'];assert.equal(bound.evaluatePredicate(node,ctx),'UNKNOWN');
});

check('explicit roster Detachment wrapper preserves evaluator position and validates its switch',()=>{
  const ctx=context();ctx.roster.detachmentIds=['detachment'];
  const node={predicate:'DETACHMENT',subject:'MODEL',contextLevel:'ROSTER',arguments:{id:'detachment'}};
  const bound=createRosterConditionBinding({schema,rosterDetachments:true});
  assert.equal(bound.bindContext(ctx),ctx);
  assert.equal(bound.evaluatePredicate(node,ctx),'TRUE');
  assert.equal(bound.evaluatePredicate({...node,arguments:{id:'other'}},ctx),'FALSE');
  assert.throws(()=>createRosterConditionBinding({schema,rosterDetachments:'true'}),/must be boolean/);
});

check('legacy context retains raw keys, skips context fields and deletes unknown values',()=>{
  const legacy={...book,rosterSchema:{},rosterContextBindings:{
    kept:{kind:'CONTEXT_FIELD'},mark:{kind:'SELECTED_MARK',markId:'mark-id'},
    assigned:{kind:'ENHANCEMENT_ASSIGNED',ruleId:'enhancement-id'}}};
  const legacyState=clone(state),ctx=context();ctx.roster={kept:true,mark:true,assigned:true};
  // These FIELD predicates exercise the retained raw-key schema fallback.
  legacy.rosterSchema={stateFields:Object.fromEntries(['kept','mark','assigned'].map(key=>[key,{contextLevel:'ROSTER',valueType:'boolean'}]))};
  const bound=createRosterConditionContext(legacy,legacyState,{abilityProjection:{units:[]}});
  assert.equal(bound.evaluatePredicate(field('kept'),ctx),'TRUE');
  assert.equal(bound.evaluatePredicate(field('mark'),ctx),'UNKNOWN');
  assert.equal(bound.evaluatePredicate(field('assigned'),ctx),'FALSE');
  assert.deepEqual(ctx.roster,{kept:true,mark:true,assigned:true});
});

check('no physical state does not invent equipment or instance evidence',()=>{
  const bound=createRosterConditionBinding({book,schema,inputs:[equipmentInput()]});
  const ctx=context();assert.equal(bound.evaluatePredicate(equipment,ctx),'UNKNOWN');assert.deepEqual(ctx.roster,{});
});

check('invalid descriptors cannot invent defaults, override computers or carry callbacks',()=>{
  const bind=inputs=>createRosterConditionBinding({book,schema,inputs});
  assert.throws(()=>bind([{key:'not-a-condition'}]),/unknown condition/);
  assert.throws(()=>bind([{...equipmentInput(),clearUnrequestedEquipment:undefined}]),/clearing policy/);
  assert.throws(()=>bind([{...equipmentInput(),arguments:{quantityProof:'GUESS'}}]),/equipment proof/);
  assert.throws(()=>bind([{key:'selectedUpgrade',kind:'PROFILE_PRESENT',arguments:{selectionGroupId:'rule',selectionMode:'VALIDATED_EQUIPPED_WEAPON'}}]),/mismatch/);
  assert.throws(()=>bind([{key:'selectedSourceChoice',arguments:{ruleId:'rule'},selectionField:'selectedChoiceIds',defaultValue:'invented-option'}]),/default/);
  assert.throws(()=>bind([{key:'attached',kind:'CONTEXT_FIELD',compute:()=>true}]),/callbacks/);
});

check('equipment parameters and repeated physical instances remain distinct',()=>{
  const bound=createRosterConditionBinding({book,state:selectedState,schema,inputs:[equipmentInput()]});
  assert.equal(bound.evaluatePredicate(equipment,context('first')),'TRUE');
  assert.equal(bound.evaluatePredicate(equipment,context('second')),'FALSE');
  assert.equal(bound.evaluatePredicate(field('equipmentBearerSatisfied',true,{...equipmentArgs,equipmentId:'other'}),context()),'FALSE');
  const ctx=context();assert.equal(bound.evaluatePredicate(equipment,ctx),'TRUE');assert.deepEqual(ctx.roster,{});
  assert.equal(bound.evaluatePredicate({...equipment,arguments:{...equipment.arguments,equals:'true'}},ctx),'INVALID');
});

check('uniform physical group does not inherit positive-only equipment proof',()=>{
  const bound=createRosterConditionBinding({book,state:selectedState,schema,inputs:[equipmentInput('UNIFORM_PHYSICAL_GROUP')]});
  const uniform=field('equipmentBearerSatisfied',true,{...equipmentArgs,quantityProof:'UNIFORM_PHYSICAL_GROUP'});
  assert.equal(bound.evaluatePredicate(uniform,context()),'FALSE');
  const full=clone(selectedState);full.units[0].modelRows[0].selections[0].physicalQuantity=2;
  assert.equal(createRosterConditionBinding({book,state:full,schema,inputs:[equipmentInput('UNIFORM_PHYSICAL_GROUP')]}).evaluatePredicate(uniform,context()),'TRUE');
});

check('role evaluation and logical trees retain whole-context granularity',()=>{
  const bound=createRosterConditionBinding({book,state:selectedState,schema,inputs:[equipmentInput()]});
  assert.equal(bound.evaluatePredicate(equipment,context()),'TRUE');
  assert.equal(bound.evaluatePredicate({op:'ALL',args:[always,equipment]},context()),'UNKNOWN');
  assert.equal(bound.evaluateRole({subject:'MODEL',selector:equipment},[],context()),'UNKNOWN');
  assert.equal(bound.evaluateRole({subject:'MODEL',selector:always},[],context()),'TRUE');
});

check('clearUnrequestedEquipment remains an explicit policy and is nonmutating',()=>{
  const ctx=context();setConditionValue(ctx.roster,{key:'equipmentBearerSatisfied',...equipmentArgs},true);
  ctx.roster.smEquipmentBearerSatisfied=true;
  const before=clone(ctx.roster),make=clear=>createRosterConditionBinding({book,state:selectedState,schema,inputs:[equipmentInput('POSITIVE_SELECTION',clear)]});
  assert.equal(condition(make(true).bindContext(ctx),'equipmentBearerSatisfied',equipmentArgs).present,false);
  assert.equal(make(true).bindContext(ctx).roster.smEquipmentBearerSatisfied,undefined);
  assert.equal(condition(make(false).bindContext(ctx),'equipmentBearerSatisfied',equipmentArgs).value,true);
  assert.deepEqual(ctx.roster,before);
});

check('binding dispatch uses descriptor type, never the book identifier',()=>{
  const foreign={...book,bookId:'a-completely-different-owner'};
  const bound=createRosterConditionBinding({book:foreign,state:selectedState,schema,inputs:[equipmentInput()]});
  assert.equal(bound.evaluatePredicate(equipment,context()),'TRUE');
});

const presenceInput={key:'physicalProfilePresent',presenceBindings:{reviewed:{unitId:'unit',profileId:'unit-model'}},
  chapterFacts:[{instanceId:'first',canonicalUnitId:'unit',status:'CHAPTER_CONTEXT_PROVEN',chapter:'REVIEWED',armyApplicability:{status:'ARMY_PROVEN'}}],armyProvenStatus:'ARMY_PROVEN'};
check('verified presence and chapter clear spoofed extras, matching physical owner and subject',()=>{
  const bound=createRosterConditionBinding({book,state,schema,inputs:[presenceInput]});
  const ctx=context('second','UNIT');ctx.roster.physicalChapter='SPOOFED';ctx.roster.reviewedArmyMembershipProven=true;
  const result=bound.bindContext(ctx);
  assert.equal(condition(result,'physicalChapter').present,false);
  assert.equal(condition(result,'reviewedArmyMembershipProven').value,false);
  assert.equal(condition(bound.bindContext(context('first','UNIT')),'physicalChapter').value,'REVIEWED');
  assert.equal(condition(bound.bindContext(context('first','MODEL')),'physicalChapter').present,false);
  const wrong=context('first','UNIT');wrong.owner.unitId='foreign';assert.equal(condition(bound.bindContext(wrong),'physicalChapter').present,false);
  assert.equal(condition(result,'physicalProfilePresent',{unitId:'unit',profileId:'unit-model'}).value,true);
  assert.equal(ctx.roster.physicalChapter,'SPOOFED');
  const noState=createRosterConditionBinding({book,schema,inputs:[presenceInput]}).bindContext(ctx);
  assert.equal(condition(noState,'reviewedArmyMembershipProven').present,false);
  assert.equal(condition(noState,'physicalProfilePresent',{unitId:'unit',profileId:'unit-model'}).present,false);
});

check('source equipment is unit-local and identity projection may be disabled',()=>{
  const sourceState=clone(state);sourceState.units[0].selections=[{sourceEquipmentIdentity:'reviewed-item',physicalQuantity:1}];
  const inputs=[{key:'sourceEquipmentSelected',arguments:{sourceEquipmentIdentity:'reviewed-item'},physicalIdentity:false}];
  const bound=createRosterConditionBinding({book,state:sourceState,schema,inputs});
  assert.equal(condition(bound.bindContext(context()),'sourceEquipmentSelected',{sourceEquipmentIdentity:'reviewed-item'}).value,true);
  assert.equal(condition(bound.bindContext(context('second')),'sourceEquipmentSelected',{sourceEquipmentIdentity:'reviewed-item'}).value,false);
  assert.equal(condition(bound.bindContext(context()),'physicalUnitInstanceId').present,false);
});

check('explicit empty default precedes selected source choice without cross-instance leakage',()=>{
  const choiceState=clone(state);choiceState.units[0].selectedChoiceIds=['option'];
  const input={key:'selectedSourceChoice',arguments:{ruleId:'choice-rule'},selectionField:'selectedChoiceIds',defaultValue:''};
  const bound=createRosterConditionBinding({book,state:choiceState,schema,inputs:[input]});
  assert.equal(condition(bound.bindContext(context()),'selectedSourceChoice',{ruleId:'choice-rule'}).value,'option');
  assert.equal(condition(bound.bindContext(context('second')),'selectedSourceChoice',{ruleId:'choice-rule'}).value,'');
  const noState=createRosterConditionBinding({book,schema,inputs:[input]});
  const ctx=context();setConditionValue(ctx.roster,{key:'selectedSourceChoice',ruleId:'choice-rule'},'existing');
  assert.equal(condition(noState.bindContext(ctx),'selectedSourceChoice',{ruleId:'choice-rule'}).value,'existing');
  assert.equal(condition(noState.bindContext(context()),'selectedSourceChoice',{ruleId:'choice-rule'}).value,'');
  const nextState=clone(choiceState);delete nextState.units[0].selectedChoiceIds;
  const next=createRosterConditionBinding({book,state:nextState,schema,inputs:[input]});
  assert.equal(condition(next.bindContext(context()),'selectedSourceChoice',{ruleId:'choice-rule'}).value,'');
  assert.equal(condition(bound.bindContext(context()),'selectedSourceChoice',{ruleId:'choice-rule'}).value,'option');
});

check('declared CSM computation consumes an external ability projection without changing either pass',()=>{
  const args={ruleId:'leader-rule',canonicalId:'core-scouts',parameters:{distance:6}};
  const binding={key:'ledBodyguardHasAbility',arguments:args,kind:'LED_BODYGUARD_ABILITY',canonicalId:args.canonicalId,parameters:args.parameters};
  const computationBook={...book,rosterSchema:{conditionFields:[{key:binding.key,arguments:args,contextLevel:'ROSTER',valueType:'boolean'}]},conditionComputations:[binding]};
  const attached=clone(state);attached.attachments=[{leaderInstanceId:'first',bodyguardInstanceId:'second',role:'LEADER'}];
  const projection={units:[{instanceId:'second',abilities:[{canonicalId:'core-scouts',parameters:{distance:6}}],profiles:[]}]};
  const node=field(binding.key,true,args),kernel=createRuleContractSchema(computationBook.rosterSchema),snapshot=clone(projection);
  const bound=createRosterConditionBinding({book:computationBook,state:attached,schema:kernel,inputs:[binding],abilityProjection:projection});
  const reference=createRosterConditionContext(computationBook,attached,{abilityProjection:projection});
  assert.equal(bound.evaluatePredicate(node,context()),'TRUE');assert.equal(bound.evaluatePredicate(node,context()),reference.evaluatePredicate(node,context()));
  const without={units:[{instanceId:'second',abilities:[],profiles:[]}]};
  assert.equal(createRosterConditionBinding({book:computationBook,state:attached,schema:kernel,inputs:[binding],abilityProjection:without}).evaluatePredicate(node,context()),'FALSE');
  assert.equal(bound.evaluatePredicate(node,context('second')),'FALSE');assert.deepEqual(projection,snapshot);
  assert.equal(createRosterConditionBinding({book:computationBook,schema:kernel,inputs:[binding]}).evaluatePredicate(node,context()),'UNKNOWN');
});

check('equipped weapon choice then historical attachment preserves reviewed wrapper order',()=>{
  const ecBook=clone(book);ecBook.entities.push({id:'bodyguard',kind:'DATASHEET',data:data('bodyguard-model',['BATTLELINE'])},
    {id:'bodyguard-model',kind:'PROFILE',parentId:'bodyguard',data:{name:'Bodyguard'}},
    {id:'blade-rule',kind:'ENHANCEMENT',parentId:'detachment',data:{},ruleContract:{assignment:{selector:always}}},
    {id:'sword',kind:'WEAPON_PROFILE',parentId:'unit',data:{mode:'melee'}},
    {id:'blade-choice',kind:'UPGRADE_OPTION',parentId:'unit',data:{unitId:'unit',weaponProfileId:'sword'}});
  ecBook.entities.find(e=>e.id==='unit').data.weaponIds=['sword'];
  ecBook.rosterSelectionOptions=[ecBook.entities.find(e=>e.id==='blade-choice')];
  ecBook.rosterAttachmentPolicies=[{sourceId:'unit',targetId:'bodyguard',role:'LEADER',additionalLeaders:0,sourceIds:['reviewed']}];
  const ecState={...clone(state),units:[unit('first','unit',1),unit('second','bodyguard',1)],attachments:[]};
  const owner=ecState.units[0];owner.warlord=true;ecState.warlordInstanceId='first';owner.enhancementIds=['blade-rule'];owner.selectedUpgradeIds=['blade-choice'];
  owner.modelRows[0].selections=[{selectionKey:'sword',canonicalProfileIds:['sword'],canonicalEquipmentIds:[],physicalQuantity:1},
    {selectionKey:'choice',canonicalOptionIds:['blade-choice'],canonicalProfileIds:[],canonicalEquipmentIds:[],physicalQuantity:1,
      selectionField:'selectedUpgradeIds',selectionCardinality:'MANY'}];
  ecState.initialAttachmentStep='DECLARE';ecState.initialAttachments=[{leaderInstanceId:'first',bodyguardInstanceId:'second',role:'LEADER'}];
  const history={step:'DECLARE',profileId:'unit-model',sourceId:'unit',bodyguardKeywords:['BATTLELINE']};
  const messages={list:'list',unknown:'unknown',agreement:'agreement',one:'one',duplicate:'duplicate',equipment:'equipment',owner:'owner',bearer:'bearer',physical:'physical',weapon:'weapon',step:'step',missing:'missing',malformed:'malformed'};
  const choiceArgs={key:'selectedUpgrade',selectionGroupId:'blade-rule',selectionMode:'VALIDATED_EQUIPPED_WEAPON'};
  const inputs=[{...choiceArgs,arguments:{selectionGroupId:'blade-rule',selectionMode:'VALIDATED_EQUIPPED_WEAPON'},messages},
    {key:'initialAttachmentBattleline',binding:history,messages}];
  const bound=createRosterConditionBinding({book:ecBook,state:ecState,schema,inputs});
  const reference=createInitialAttachmentConditionContext(ecBook,ecState,{binding:history,conditionArguments:{key:'initialAttachmentBattleline'},messages,
    bindContext:createEquippedWeaponChoiceConditionContext(ecBook,ecState,schema,{ruleId:'blade-rule',conditionArguments:choiceArgs,messages})});
  assert.deepEqual(bound.bindContext(context()).roster,reference(context()).roster);
  assert.deepEqual(createRosterConditionBinding({book:ecBook,state:ecState,schema,inputs:[...inputs].reverse()}).bindContext(context()).roster,reference(context()).roster);
  assert.equal(condition(bound.bindContext(context()),'selectedUpgrade',choiceArgs).value,'blade-choice');
  assert.equal(condition(bound.bindContext(context()),'initialAttachmentBattleline').value,true);
  const detachmentEligibilityBook=clone(ecBook);
  detachmentEligibilityBook.entities.find(entity=>entity.id==='blade-rule').ruleContract.assignment.selector=
    {predicate:'DETACHMENT',subject:'MODEL',contextLevel:'ROSTER',arguments:{id:'detachment'}};
  for(const rosterDetachments of [false,true])assert.throws(()=>createRosterConditionBinding({
    book:detachmentEligibilityBook,state:ecState,schema,inputs,rosterDetachments}),/bearer/,
    'Equipped eligibility must keep the original schema even when final evaluation wraps Detachments');
  const missingHistory=clone(ecState);delete missingHistory.initialAttachmentStep;delete missingHistory.initialAttachments;
  assert.equal(condition(createRosterConditionBinding({book:ecBook,state:missingHistory,schema,inputs}).bindContext(context()),'initialAttachmentBattleline').present,false);
  const invalid=clone(ecState);invalid.initialAttachmentStep='WRONG';
  assert.throws(()=>createRosterConditionBinding({book:ecBook,state:invalid,schema,inputs}),/step/);
  assert.equal(condition(bound.bindContext(context()),'initialAttachmentBattleline').value,true);
});

console.log(`Shared roster condition binding: PASS (${checks} focused contracts)`);
