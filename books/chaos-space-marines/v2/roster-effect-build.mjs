/** Book-owned lowering of reviewed typed clauses. No source sentence is parsed
 * here and this module does not connect import, UI, or Army Rule dispatch. */
import assert from 'node:assert/strict';
import {buildCSMContracts,readJson} from './rule-contract-build.mjs';
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';
import {validateRosterEffects} from '../../shared/roster-v2/effects.mjs';
import {buildAttachmentFeasibility} from '../../shared/roster-v2/compatibility-feasibility.mjs';

const clone=structuredClone;
export const deferredClause='army-rule-cult-of-the-dark-gods::source-clause';
export const selectedMarkClause='detachment-pactbound-zealots:rule::source-clause-1-1';
const leaves=node=>node.op?node.args.flatMap(leaves):[node];
const all=args=>args.length===1?args[0]:{op:'ALL',args};
const field=(key,subject,equals,evidence)=>({predicate:'FIELD',subject,contextLevel:'ROSTER',arguments:{key,equals},evidence:clone(evidence)});

export function executableClauses(built) {
  return built.book.entities.flatMap(rule=>(rule.ruleContract?.clauses||[])
    .filter(clause=>(clause.productClassification==='ROSTER_KNOWN'&&clause.operation)||clause.semanticEffects?.length||`${rule.id}::${clause.id}`===selectedMarkClause)
    .map(clause=>({rule,clause})));
}

export function buildCSMRosterEffectBook(built=buildCSMContracts()) {
  const before=JSON.stringify(built),book=clone(built.book),records=new Map(book.entities.map(e=>[e.id,e]));
  const sourceUnit=entity=>{
    const visited=new Set();
    while(entity&&entity.kind!=='DATASHEET') {
      assert.ok(!visited.has(entity.id),'Cyclic canonical source ownership');visited.add(entity.id);
      entity=records.get(entity.parentId);
    }
    return entity?.id;
  };
  book.rosterProfileBindings=clone(built.profileBindings);
  book.rosterAttachmentPolicies=book.rosterAttachmentPolicies.map(policy=>({...policy,
    role:policy.role.toUpperCase(),sourceIds:[policy.sourceEntityId]}));
  book.compatibilityFeasibility=buildAttachmentFeasibility(book,built.composition);
  book.rosterAbilityReferences={};book.rosterReferenceSemantics={};book.rosterContextBindings={};
  const referenceBindings=readJson('roster-reference-bindings.json');
  book.rosterSchema={stateFields:clone(built.schema.stateFields),modelAbilities:[...built.schema.modelAbilities]};
  const registerField=(key,type,binding)=>{
    const spec={contextLevel:'ROSTER',valueType:type};
    if(book.rosterSchema.stateFields[key])assert.deepEqual(book.rosterSchema.stateFields[key],spec);
    book.rosterSchema.stateFields[key]=spec;
    if(book.rosterContextBindings[key])assert.deepEqual(book.rosterContextBindings[key],binding);
    book.rosterContextBindings[key]=clone(binding);
  };
  const registerAbility=(id,parameters={},rangeBinding)=>{
    const previous=book.rosterAbilityReferences[id];
    const reference={id,title:records.get(id)?.displayName||referenceBindings.abilities[id]?.title||id,
      parameters:Object.fromEntries(Object.keys(parameters).map(key=>[key,{type:'number',min:0}])),
      ...(rangeBinding?{rangeBinding:clone(rangeBinding)}:{})};
    if(previous)assert.deepEqual(previous,reference,'Canonical ability registry drift');
    book.rosterAbilityReferences[id]=reference;
  };
  // Exact accepted membership -> canonical ability and parameter. Source-label
  // equality validates evidence; it never chooses or joins an ability identity.
  for(const binding of referenceBindings.memberships) {
    const member=records.get(binding.referenceId),reference=referenceBindings.abilities[binding.canonicalId];
    assert.equal(member?.kind,'RULE_REFERENCE');assert.ok(reference);
    assert.equal(member.data.label,binding.sourceLabel,'Canonical membership evidence drift');
    registerAbility(binding.canonicalId,binding.parameters);
    book.rosterReferenceSemantics[member.id]={abilities:[{canonicalId:binding.canonicalId,name:reference.title,
      parameters:clone(binding.parameters),...(binding.canonicalId==='core-feel-no-pain'?{value:binding.parameters.value}:{})}]};
  }
  // Dark Pacts memberships already carry an explicit canonical rule address.
  for(const entity of book.entities.filter(e=>e.kind==='RULE_REFERENCE'&&e.data.armyRuleId)) {
    const id=entity.data.armyRuleId;assert.ok(records.has(id));registerAbility(id);
    book.rosterReferenceSemantics[entity.id]={abilities:[{canonicalId:id,name:records.get(id).displayName,parameters:{}}]};
  }
  for(const unit of book.entities.filter(e=>e.kind==='DATASHEET')) {
    unit.data.weaponIds=clone(unit.data.weaponProfileIds);
    unit.data.sectionIds=[];unit.data.wargearOptionIds=[];
    for(const id of unit.data.profileIds) {
      const profile=records.get(id);
      profile.data={...profile.data,name:profile.data.composition.name};
    }
  }
  for(const rule of book.entities.filter(e=>e.ruleContract)) {
    const contract=rule.ruleContract;
    if(rule.kind==='ENHANCEMENT') {
      const owner=contract.roles.find(role=>role.id===contract.assignment.ownerRoleId);
      contract.assignment.selector=all([clone(owner.selector),...clone(owner.conditions)]);
      registerField(`enhancementAssigned:${rule.id}`,'boolean',{kind:'ENHANCEMENT_ASSIGNED',ruleId:rule.id});
    }
    for(const clause of contract.clauses) {
      clause.rosterEffects=[];
      clause.rosterClassification=clause.rosterClassification==='BATTLE_ONLY'||clause.productClassification==='BATTLE_ONLY'||contract.executionMode==='BATTLE_ACTION'
        ?'BATTLE_ONLY':clause.productClassification==='NOT_EFFECT'?'NOT_AN_EFFECT':'DISPLAY_ONLY';
      clause.rosterClassificationNote={reason:clause.rosterClassification};
    }
  }
  book.rosterDeferred=[{id:deferredClause,reason:'Allied canonical recipients, cross-registry roster dependencies and Army Faction input are not connected.'}];
  // Huron grants references to conditional battle permissions. Preserve current
  // UNIT scope for future presentation; do not execute their battle payloads.
  const huron=records.get('detachment-huron-s-marauders:enhancement:1');
  huron.ruleContract.clauses[0].rosterReferenceBinding={sourceBinding:'SOURCE_MODEL',
    standaloneBinding:'SOURCE_UNIT',attachedBinding:'SOURCE_FORMED_MODELS',subject:'UNIT',
    canonicalRuleReferences:clone(huron.ruleContract.clauses[0].effect.parameters.canonicalRuleReferences)};

  for(const {rule:canonical,clause:typed} of executableClauses(built)) {
    const rule=records.get(canonical.id),contract=rule.ruleContract;
    const clause=contract.clauses.find(c=>c.id===typed.id);
    const role=id=>clause.roles.find(r=>r.id===id)||contract.roles.find(r=>r.id===id);
    if(`${rule.id}::${clause.id}`===selectedMarkClause) {
      const recipient=role(typed.effect.recipientRoleId);
      assert.equal(typed.productClassification,'ROSTER_KNOWN');
      assert.equal(recipient.subject,'UNIT');assert.equal(recipient.binding,'ROSTER_UNITS');
      const marks=book.entities.filter(e=>e.kind==='UPGRADE_OPTION'&&e.data.selectionRuleId===rule.id);
      const eligibilityKey=`needsMarkSelection:${rule.id}`;
      registerField(eligibilityKey,'boolean',{kind:'MARK_SELECTION_ELIGIBLE',keywords:marks.map(mark=>mark.data.keyword)});
      for(const mark of marks) {
        const conditions=[{binding:'TARGET',predicate:clone(recipient.selector)},
          {binding:'TARGET',predicate:field(eligibilityKey,'UNIT',true,clause.evidence)},
          {binding:'TARGET',predicate:field(`sourceBackedUnitMark:${mark.data.keyword}`,'UNIT',true,clause.evidence)}];
        if(mark.data.keyword==='KHORNE')conditions.push({binding:'TARGET',predicate:{op:'NOT',args:[{
          predicate:'UNIT_KEYWORD',subject:'UNIT',contextLevel:'STATIC',arguments:{keyword:'PSYKER'},
          evidence:{field:['content',0,'text'],quote:'You cannot select the KHORNE keyword for a PSYKER unit.'}}]}});
        clause.rosterEffects.push({id:`${rule.id}::${clause.id}/${mark.id}`,operation:'GRANT_UNIT_KEYWORD',
          keyword:mark.data.keyword,unitScope:'PHYSICAL',targetSubject:'UNIT',targetBinding:'ROSTER_UNITS',
          conditions,evidence:clone(clause.evidence),sourceFields:clone(clause.sourceFields),lifetime:'WHILE_SELECTED',
          provenance:{canonicalRuleId:rule.id,canonicalOwnerId:canonical.ownerId,canonicalClauseId:clause.id,
            selectedMarkId:mark.id,sourceEvidence:clone(canonical.provenance.sourceEvidence)}});
      }
      clause.executionImplemented=true;clause.rosterClassification='ROSTER_EXECUTABLE';
      clause.rosterClassificationNote={reason:'Explicit source-backed UNIT Mark selected in the physical roster.'};
      continue;
    }
    const owner=clause.roles.find(r=>r.purpose==='OWNER')||contract.roles.find(r=>r.purpose==='OWNER');
    const lifetime=contract.duration?.find(d=>d.bindings?.some(b=>b.clauseId===clause.id));
    // UPGRADE_OPTION canonical ownership is a declaration, whereas the existing
    // shared physical dispatcher consumes the owning DATASHEET. Keep both
    // addresses explicitly in this disposable runtime view, without new IDs.
    if(rule.kind==='UPGRADE_OPTION') {
      rule.canonicalOwnerId=canonical.parentId;contract.canonicalOwnerId=canonical.ruleContract.ownerId;
      rule.parentId=sourceUnit(rule);contract.ownerId=rule.parentId;
      assert.ok(rule.parentId,'Unresolved Upgrade physical source');
    }
    const effects=typed.semanticEffects||[{operation:typed.operation,recipientRoleId:typed.effect.recipientRoleId,
      ...clone(typed.effect.parameters)}];
    const add=(semantic,parameters)=>{
      const recipient=role(semantic.recipientRoleId),conditions=[];
      assert.ok(recipient&&owner!==undefined||rule.kind==='DETACHMENT_RULE');
      const effect={id:`${rule.id}::${clause.id}/effect-${clause.rosterEffects.length+1}`,
        operation:semantic.operation,targetSubject:recipient.subject,targetBinding:recipient.binding,
        ...clone(parameters),conditions,evidence:clone(clause.evidence),sourceFields:clone(clause.sourceFields),
        lifetime:lifetime?.endpoint||(rule.kind==='ENHANCEMENT'?'WHILE_ASSIGNED':rule.kind==='UPGRADE_OPTION'?'WHILE_SELECTED':
          rule.kind==='DETACHMENT_RULE'?'WHILE_DETACHMENT_SELECTED':'WHILE_CONDITION_SATISFIED'),
        provenance:{canonicalRuleId:rule.id,canonicalOwnerId:canonical.ownerId,canonicalClauseId:clause.id,
          sourceEvidence:clone(canonical.provenance.sourceEvidence),semanticEvidence:clone(semantic.evidence||clause.evidence),
          sourceSelector:clone(owner?.selector),recipientSelector:clone(recipient.selector),
          ...(typed.lifetimeEvidence?{lifetimeEvidence:clone(typed.lifetimeEvidence)}:{}),
          ...(lifetime?{durationBinding:clone(lifetime)}:{})}};
      if(effect.operation==='GRANT_ABILITY') {
        registerAbility(effect.ability.canonicalId,effect.ability.parameters);
        if(effect.targetSubject==='UNIT')effect.unitScope='FORMED';
      }
      if(effect.operation==='REMOVE_ABILITY')registerAbility(effect.ability.canonicalId);
      if(effect.operation==='MODIFY_ABILITY_RANGE') {
        const {field,start,end,baseValue}=clause.abilityRangeBinding;
        registerAbility(effect.ability.canonicalId,{range:baseValue},{field,start,end,baseValue});
        const id=effect.ability.canonicalId,unit=records.get(sourceUnit(records.get(id)));
        if(!unit.data.ruleReferenceIds.includes(id))unit.data.ruleReferenceIds.push(id);
        book.rosterReferenceSemantics[id]={abilities:[{canonicalId:id,name:records.get(id).displayName,parameters:{range:baseValue}}]};
      }
      const bindCondition=(node,binding)=>{
        if(node.op)node.subject=leaves(node)[0].subject;
        for(const leaf of leaves(node))if(leaf.predicate==='FIELD') {
          const key=leaf.arguments.key;
          if(key.startsWith('selectedUpgrade:'))registerField(key,'string',{kind:'SELECTED_OPTION',declarationId:key.slice('selectedUpgrade:'.length)});
          else if(key.startsWith('containsProfile:'))registerField(key,'boolean',{kind:'PROFILE_PRESENT',profileId:key.slice('containsProfile:'.length)});
          else if(key==='attachedAtBattleStart')registerField(key,'boolean',{kind:'INITIAL_ATTACHMENT'});
          else if(key==='isBodyguardComponentOfSource') {
            // Existing component-relative roster field, derived by shared context.
            leaf.arguments.key='isBodyguardModel';registerField('isBodyguardModel','boolean',{kind:'CONTEXT_FIELD'});
          } else if(key.startsWith('ledBodyguardHasScouts6:'))registerField(key,'boolean',
            {kind:'LED_BODYGUARD_ABILITY',canonicalId:'core-scouts',parameters:{distance:6}});
          else if(key==='twoAdditionalMeleeWeaponsEquipped') {
            leaf.arguments.key='equipmentRequirementSatisfied';registerField('equipmentRequirementSatisfied','boolean',{kind:'CONTEXT_FIELD'});
          }
        }
        conditions.push({binding,predicate:node});
      };
      // Static owner identity is established by source dispatch or the exact
      // Enhancement owner selector. MODEL source roles without assignments are
      // evaluated on each candidate target profile, never on a mixed UNIT.
      if(owner&&rule.kind!=='ENHANCEMENT'&&owner.subject==='MODEL')bindCondition(clone(owner.selector),'TARGET');
      for(const condition of typed.conditions||[])bindCondition(clone(condition),
        condition.roleId===recipient.id&&owner?.id!==recipient.id?'TARGET':'SOURCE');
      for(const condition of recipient.conditions||[])if(!(typed.conditions||[]).some(c=>JSON.stringify(c)===JSON.stringify(condition)))
        bindCondition(clone(condition),'TARGET');
      const selector=clone(recipient.selector);
      // Membership FIELDs in typed roles denote the explicit composition
      // binding, not a second free boolean whose availability can be invented.
      const membership=leaves(selector).every(p=>p.predicate==='FIELD'&&
        /^(memberOfOwnerUnit:|memberOfSelectedUnit:)/.test(p.arguments.key));
      if(effect.targetBinding==='ROSTER_MODELS') {
        const unitRole=clause.roles.find(r=>r.subject==='UNIT'&&r.purpose==='RECIPIENT');
        effect.recipientSelectors={unit:unitRole?clone(unitRole.selector):{predicate:'ALWAYS',subject:'UNIT',contextLevel:'STATIC',arguments:{},evidence:clone(clause.evidence)},
          model:membership?{predicate:'ALWAYS',subject:'MODEL',contextLevel:'STATIC',arguments:{},evidence:clone(clause.evidence)}:selector};
        effect.containingUnitScope='FORMED';
      }else if(!membership&&recipient.id!==owner?.id)bindCondition(selector,'TARGET');
      if(effect.field==='INSV'&&effect.mode==='SET') {
        const key=`needsInvulnerableSave:${effect.value}`;
        registerField(key,'boolean',{kind:'SAVE_IMPROVEMENT',value:effect.value});
        bindCondition(field(key,'MODEL',true,clause.evidence),'TARGET');
      }
      if(effect.targetBinding==='SOURCE_UNIT_MODELS'&&rule.kind==='ENHANCEMENT') {
        effect.conditions.push({binding:'SOURCE',predicate:field('attached','MODEL',false,clause.evidence)});
        const formed=clone(effect);formed.id+='/formed';formed.targetBinding='SOURCE_FORMED_MODELS';
        formed.conditions.at(-1).predicate.arguments.equals=true;
        clause.rosterEffects.push(effect,formed);
      }else clause.rosterEffects.push(effect);
    };
    for(const semantic of effects) {
      const {operation,recipientRoleId,evidence,targetSubject,...parameters}=semantic;
      if(operation==='MODIFY_STAT') {
        const {fields,fieldValues,alsoWeaponAbility,scope,sourceScope,...rest}=parameters;
        for(const [key,value] of Object.entries(fieldValues||Object.fromEntries((fields||[rest.field]).map(k=>[k,rest.value]))))
          add(semantic,{...rest,field:key,value});
        if(alsoWeaponAbility)add({...semantic,operation:'GRANT_WEAPON_ABILITY'},{ability:alsoWeaponAbility,weaponMode:rest.weaponMode});
      }else if(parameters.abilities)for(const ability of parameters.abilities)add(semantic,{ability,...(parameters.weaponMode?{weaponMode:parameters.weaponMode}:{})});
      else {delete parameters.sourceScope;add(semantic,parameters);}
    }
    clause.rosterClassification='ROSTER_EXECUTABLE';
  }
  registerField('attached','boolean',{kind:'CONTEXT_FIELD'});
  const marks=book.entities.filter(e=>e.kind==='UPGRADE_OPTION'&&e.data.selectionRuleId);
  for(const mark of marks)for(const subject of ['Model','Unit'])registerField(`sourceBacked${subject}Mark:${mark.data.keyword}`,'boolean',
    {kind:'SELECTED_MARK',markId:mark.id});
  const evaluator=createRuleContractSchema(book.rosterSchema);
  evaluator.validateContracts(book);validateRosterEffects(book,evaluator.validatePredicate,evaluator.evaluatePredicate);
  assert.equal(JSON.stringify(built),before,'Lowering mutated canonical facts/contracts');
  const clauses=book.entities.flatMap(r=>(r.ruleContract?.clauses||[]).filter(c=>c.rosterEffects.length).map(c=>`${r.id}::${c.id}`));
  assert.equal(clauses.length,58);assert.ok(!clauses.includes(deferredClause));
  book.rosterEffectCensus={executable:59,lowered:clauses,deferred:[deferredClause]};
  return book;
}
