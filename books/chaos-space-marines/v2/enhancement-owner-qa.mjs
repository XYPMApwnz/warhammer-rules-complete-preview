/** G2 consumer probes only. In-memory lowering is deliberately not a CSM
 * executable declaration catalog, import adapter, or UI implementation. */
import assert from 'node:assert/strict';
import {buildCSMContracts} from './rule-contract-build.mjs';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {formRoster} from '../../shared/roster-v2/context.mjs';
import {buildAttachmentFeasibility} from '../../shared/roster-v2/compatibility-feasibility.mjs';
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';
import {setConditionValue,translateFieldArguments} from '../../shared/rule-contract-v2/conditions.mjs';

const clone=structuredClone, built=buildCSMContracts(), factualSnapshot=JSON.stringify(built.facts);
const cases=[['pactbound-zealots',2,1],['pactbound-zealots',4,1],['creations-of-bile',1,1],
  ['creations-of-bile',4,1],['huron-s-marauders',1,1],['huron-s-marauders',4,1],
  ['renegade-raiders',3,1],['deceptors',1,1],['deceptors',3,1],['chaos-cult',4,1],
  ['cult-of-the-arkifane',2,1],['renegade-warband',2,1],['fellhammer-siege-host',2,1],
  ['cabal-of-chaos',1,1],['cabal-of-chaos',1,2]];
const rows=[];
for(const [detachment,number,clauseNumber] of cases){
  const ruleId=`detachment-${detachment}:enhancement:${number}`, clauseId=`roster-clause-${clauseNumber}`;
  const book=clone(built.book), records=new Map(book.entities.map(entity=>[entity.id,entity]));
  for(const entity of book.entities)delete entity.ruleContract;
  book.rosterProfileBindings=clone(built.profileBindings);
  book.rosterReferenceSemantics={};book.rosterAbilityReferences={};
  for(const unit of book.entities.filter(entity=>entity.kind==='DATASHEET')){
    unit.data.weaponIds=[...(unit.data.weaponProfileIds||[])];
    unit.data.sectionIds=[];unit.data.wargearOptionIds=[];unit.data.ruleReferenceIds=[];
    for(const profileId of unit.data.profileIds){
      const profile=records.get(profileId);profile.data={name:profile.data.composition.name,...profile.data.stats};
    }
  }
  book.rosterAttachmentPolicies=book.rosterAttachmentPolicies.map(policy=>({...policy,
    role:policy.role.toUpperCase(),sourceIds:[policy.sourceEntityId]}));
  book.compatibilityFeasibility=buildAttachmentFeasibility(book,built.composition);
  const source=built.book.entities.find(entity=>entity.id===ruleId),rule=records.get(ruleId);
  rule.ruleContract=clone(source.ruleContract);
  const contract=rule.ruleContract,clause=contract.clauses.find(row=>row.id===clauseId);
  assert.ok(clause?.evidence?.quote&&rule.data.text.includes(clause.evidence.quote));
  assert.ok(rule.provenance.sourceEvidence.length,'Actual canonical source provenance required');
  const owner=contract.roles.find(role=>role.id===contract.assignment.ownerRoleId);
  contract.assignment.selector={op:'ALL',args:[clone(owner.selector),...clone(owner.conditions)]};
  contract.clauses=[clause];
  const recipient=clause.roles.find(role=>role.id===clause.effect.recipientRoleId);
  const base={targetSubject:recipient.subject,targetBinding:recipient.binding,conditions:clause.conditions.map(predicate=>({binding:'SOURCE',predicate:clone(predicate)})),
    evidence:clone(clause.evidence),sourceFields:clone(clause.sourceFields),lifetime:'WHILE_ASSIGNED'};
  const params=clone(clause.effect.parameters),effects=[];
  function abilityReference(ability){
    book.rosterAbilityReferences[ability.canonicalId]={id:ability.canonicalId,title:ability.canonicalId,
      parameters:Object.fromEntries(Object.entries(ability.parameters).map(([key])=>[key,{type:'number',min:0}]))};
  }
  function add(operation,parameters){
    const effect={...clone(base),id:`${ruleId}/${clauseId}/${effects.length}`,operation,...parameters};
    if(operation==='GRANT_ABILITY')abilityReference(effect.ability);
    effects.push(effect);
  }
  if(params.canonicalRuleReferences){
    for(const canonicalId of params.canonicalRuleReferences){
      assert.ok(records.has(canonicalId),'Grant uses an existing canonical rule identity');
      add('GRANT_ABILITY',{ability:{canonicalId,parameters:{}},unitScope:'FORMED'});
    }
  }else if(clause.operation==='MODIFY_STAT'){
    for(const field of params.fields||[params.field])add('MODIFY_STAT',
      {field,mode:params.mode,value:params.value,...(params.weaponMode?{weaponMode:params.weaponMode}:{})});
    if(params.alsoWeaponAbility)add('GRANT_WEAPON_ABILITY',{ability:params.alsoWeaponAbility,weaponMode:params.weaponMode});
  }else if(params.abilities){for(const ability of params.abilities)add(clause.operation,{ability});}
  else add(clause.operation,params);
  // Exercise source-defined bearer-unit recipients using existing disjoint
  // bindings. This QA lowering does not alter the deferred production clauses.
  for(const effect of [...effects])if(effect.targetBinding==='SOURCE_UNIT_MODELS'){
    const attached=value=>({binding:'SOURCE',predicate:{predicate:'FIELD',subject:'MODEL',contextLevel:'ROSTER',
      arguments:{key:'attached',equals:value},evidence:clone(clause.evidence)}});
    effect.conditions.push(attached(false));
    const formed={...clone(effect),id:effect.id+'/formed',targetBinding:'SOURCE_FORMED_MODELS'};
    formed.conditions[formed.conditions.length-1]=attached(true);effects.push(formed);
  }
  clause.rosterClassification='ROSTER_EXECUTABLE';clause.rosterEffects=effects;

  function physical(instanceId,canonicalUnitId,assigned=false){
    const canonical=records.get(canonicalUnitId);
    const modelRows=canonical.data.profileIds.map((canonicalProfileId,i)=>{
      const original=built.book.entities.find(entity=>entity.id===canonicalProfileId);
      const quantity=original.data.composition.quantity.min;
      // Selected exact canonical profiles are explicit test input; never infer
      // per-model weapons from an aggregate imported inventory.
      const weaponIds=canonicalUnitId==='unit-dark-apostle'
        ? (i===0?['datasheet-dark-apostle:weapon:1','datasheet-dark-apostle:weapon:2']:['datasheet-dark-apostle:weapon:3'])
        : ['ranged','melee'].map(mode=>canonical.data.weaponIds.find(id=>records.get(id).data.mode===mode)).filter(Boolean);
      return {rowId:`row-${i}`,canonicalProfileId,quantity,compositionScope:'MODEL_ROW',loadouts:[],
        selections:weaponIds.map(id=>({selectionKey:id,canonicalProfileIds:[id],canonicalEquipmentIds:[],physicalQuantity:quantity}))};
    });
    return {instanceId,canonicalUnitId,startingStrength:modelRows.reduce((sum,row)=>sum+row.quantity,0),
      modelRows,selections:[],enhancementIds:assigned?[ruleId]:[],warlord:null};
  }
  const state={schema:'roster-v2/roster',bookId:book.bookId,rosterId:'csm-g2-consumer',
    detachmentIds:[contract.detachmentId],units:[physical('a','unit-dark-apostle',true),
      physical('b','unit-dark-apostle'),physical('bodyguard','unit-legionaries')],attachments:[],warlordInstanceId:null};
  const ownerScope=formRoster(book,state).units[0].profiles[0].scopeId;
  state.units[0].enhancementAssignments=[{enhancementId:ruleId,modelScopeId:ownerScope}];
  const known={scouts:true};
  const evaluator=createRuleContractSchema({stateFields:{...built.schema.stateFields,attached:{contextLevel:'ROSTER',valueType:'boolean'}},
    modelAbilities:built.schema.modelAbilities});
  const evaluatePredicate=(node,context)=>{
    if(!context)return 'INVALID';
    // Selected Mark and prerequisite snapshots are explicit isolated QA input,
    // not executable production normalization or invented battle activation.
    const keywords=new Set(context.keywords||[]);
    if(context.instanceId==='a'&&context.modelId===state.units[0].modelRows[0].canonicalProfileId){
      if(detachment==='pactbound-zealots')keywords.add(number===2?'SLAANESH':'KHORNE');
    }
    const roster={...context.roster};
    setConditionValue(roster,translateFieldArguments({key:`ledBodyguardHasScouts6:${ruleId}`,equals:true},{book}),known.scouts);
    setConditionValue(roster,translateFieldArguments({key:`enhancementAssigned:${ruleId}`,equals:true},{book}),context.instanceId==='a'&&
      context.modelId===state.units[0].modelRows[0].canonicalProfileId);
    return evaluator.evaluatePredicate(node,{...context,keywords,intrinsicKeywords:keywords,roster});
  };
  const runtime=createRosterRuntime(book,{...evaluator,evaluatePredicate});
  const snapshot=JSON.stringify(book);
  if(detachment==='chaos-cult')state.attachments=[{leaderInstanceId:'a',bodyguardInstanceId:'bodyguard',role:'LEADER'}];
  runtime.load(state);
  const active=runtime.projection,actual=active.units.find(unit=>unit.instanceId==='a');
  const applied=active.units.flatMap(unit=>unit.applied).filter(row=>row.ruleId===ruleId);
  assert.ok(applied.length,`Audited G2 clause must execute: ${ruleId}::${clauseId}`);
  assert.ok(applied.every(row=>row.sourceInstanceId==='a'),'Exact physical Enhancement owner provenance');
  assert.equal(active.units.find(unit=>unit.instanceId==='b').applied.length,0,'Duplicate physical owner remains unchanged');
  if(base.targetBinding==='SOURCE_MODEL')assert.ok(applied.every(row=>row.targetCompositionId===ownerScope),
    'Bearer-only output must not affect a sibling profile');
  for(const effect of effects){
    const effectRows=applied.filter(row=>row.effectId===effect.id);
    if(effect.targetBinding==='SOURCE_UNIT_MODELS'&&detachment==='chaos-cult'||
      effect.targetBinding==='SOURCE_FORMED_MODELS'&&detachment!=='chaos-cult')continue;
    assert.ok(effectRows.length,`Every lowered operation executes: ${effect.id}`);
    for(const row of effectRows){
      if(effect.operation==='MODIFY_STAT')assert.equal(Number.parseInt(row.after),Number.parseInt(row.before)+effect.value);
      if(effect.operation==='GRANT_MODEL_KEYWORD')assert.ok(row.after.includes(effect.keyword));
      if(effect.operation==='GRANT_WEAPON_ABILITY')assert.ok(row.after.includes(effect.ability));
      if(effect.operation==='GRANT_MODEL_ABILITY')assert.ok(row.after.some(ability=>ability.name==='Feel No Pain'&&ability.value===5));
      if(effect.operation==='GRANT_ABILITY')assert.ok(row.after.some(ability=>ability.canonicalId===effect.ability.canonicalId&&
        JSON.stringify(ability.parameters)===JSON.stringify(effect.ability.parameters)));
    }
  }
  const removed=runtime.snapshot();removed.units[0].enhancementIds=[];removed.units[0].enhancementAssignments=[];
  runtime.load(removed);assert.equal(runtime.projection.units.flatMap(unit=>unit.applied).length,0);
  runtime.load(state);assert.deepEqual(runtime.projection,active,'Remove/restore deterministic');
  if(detachment==='chaos-cult'){
    runtime.detach('a');assert.equal(runtime.projection.units.flatMap(unit=>unit.applied).length,0);
    runtime.attach('a','bodyguard');assert.deepEqual(runtime.projection,active,'Source-dependent grant restores after reattachment');
    known.scouts=false;runtime.load(state);assert.equal(runtime.projection.units.flatMap(unit=>unit.applied).length,0);
    known.scouts=true;runtime.load(state);
  }else{
    runtime.attach('a','bodyguard');assert.ok(runtime.projection.units.find(unit=>unit.instanceId==='a').applied.length);
    const bodyguard=runtime.projection.units.find(unit=>unit.instanceId==='bodyguard');
    if(base.targetBinding==='SOURCE_UNIT_MODELS'||base.targetSubject==='UNIT')
      assert.ok(bodyguard.applied.some(row=>row.ruleId===ruleId),'Source-defined bearer-unit recipients include attached Bodyguards');
    else assert.equal(bodyguard.applied.length,0,'Bearer-only effect must not transfer to Bodyguard');
    runtime.detach('a');assert.deepEqual(runtime.projection,active,'Attachment does not transfer exact owner');
  }
  assert.equal(JSON.stringify(book),snapshot,'In-memory canonical input remains immutable');
  rows.push({owner:ruleId,clause:clauseId,operationCount:effects.length,status:'PASS'});
}
assert.equal(rows.length,15);assert.equal(JSON.stringify(built.facts),factualSnapshot,'Current CSM source facts unchanged');
console.log(JSON.stringify({status:'PASS',currentSourceConsumers:rows.length,productionDeclarationsAdded:0,
  exactBearerScope:true,duplicateIsolation:true,removeRestore:true,attachmentScope:true,canonicalFactsImmutable:true,rows}));
