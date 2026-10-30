import {validateConditionalPolicy,validateConditionalPolicyDeclaration,appendConditionalPolicy} from './conditional-policy.mjs';
import {formRoster, predicateContext, refreshFormedKeywords, selections} from './context.mjs';
import {enhancementOwnerContext} from './compatibility-context.mjs';
import {validateBookRecipients} from '../rule-contract-v2/recipients.mjs';
import {resolveExecutionEffect,executionBindingSubjects as bindingSubjects} from './recipient-execution.mjs';
import {getRecordedSourceIdentity,copySourceEvidence} from '../source-refs-v2/source-refs.mjs';
const clone = value => structuredClone(value);
const operations = new Set(['MODIFY_STAT','GRANT_WEAPON_ABILITY','GRANT_MODEL_ABILITY','GRANT_ABILITY','REMOVE_ABILITY','MODIFY_ABILITY_RANGE','GRANT_UNIT_KEYWORD','GRANT_MODEL_KEYWORD','REMOVE_KEYWORD','MODIFY_RULE_METRIC','CONTRIBUTE_WEAPON_PROFILE']);
// Current Core 02.02.01: threshold/AP improvements are signed arithmetic;
// bounds apply to the combined result, never to each modifier contribution.
const numericDomain = {
  BS:{field:'skill',weaponMode:'ranged',min:2,max:6,suffix:'+'},
  WS:{field:'skill',weaponMode:'melee',min:2,max:6,suffix:'+'},
  range:{field:'range',weaponMode:'ranged',min:1,suffix:'"'},
  ap:{field:'ap',max:0,suffix:''},
  SV:{field:'SV',subject:'MODEL',modes:['SET'],min:2,suffix:'+'},
  INSV:{field:'INSV',subject:'MODEL',min:2,suffix:'+'},
  W:{field:'W',subject:'MODEL',suffix:''}
};
const immutableCharacteristic=value=>['-','*','N/A'].includes(value);
/** Canonical references and parameter declarations are supplied by the book.
 * No ability title or source sentence selects runtime behaviour. */
function validateAbilityGrant(book,effect) {
  const ability=effect.ability, reference=book.rosterAbilityReferences?.[ability?.canonicalId];
  if (!['MODEL','UNIT'].includes(effect.targetSubject) || !reference || reference.id!==ability.canonicalId ||
      typeof reference.title!=='string' || !reference.title || !reference.parameters ||
      !ability.parameters || typeof ability.parameters!=='object' || Array.isArray(ability.parameters))
    throw new TypeError('Unresolved canonical ability grant');
  if (effect.targetSubject==='UNIT' ? !['PHYSICAL','FORMED'].includes(effect.unitScope) : effect.unitScope!==undefined)
    throw new TypeError('Invalid ability recipient scope');
  if (Object.keys(ability.parameters).some(key=>!Object.hasOwn(reference.parameters,key)) ||
      Object.keys(reference.parameters).some(key=>!Object.hasOwn(ability.parameters,key)))
    throw new TypeError('Unresolved canonical ability parameter');
  for (const [key,parameter] of Object.entries(reference.parameters)) {
    const value=ability.parameters[key];
    if (parameter.type!=='number' || !Number.isFinite(value) ||
        parameter.min!==undefined && value<parameter.min || parameter.max!==undefined && value>parameter.max)
      throw new TypeError('Invalid canonical ability parameter');
  }
}
function canonicalAbility(book,effect) {
  return {canonicalId:effect.ability.canonicalId,name:book.rosterAbilityReferences[effect.ability.canonicalId].title,
    parameters:Object.fromEntries(Object.entries(effect.ability.parameters).sort(([a],[b])=>a.localeCompare(b,'en')))};
}
function grantedAbilities(before,ability) {
  const key=value=>JSON.stringify([value.canonicalId,value.parameters]);
  const result=clone(before || []);
  if (!result.some(value=>key(value)===key(ability))) result.push(ability);
  return result.sort((a,b)=>key(a).localeCompare(key(b),'en'));
}
export function validateRosterEffects(book, validatePredicate, evaluatePredicate) {
  validateBookRecipients(book);
  return validateEffectOperations(book,validatePredicate,evaluatePredicate,resolveExecutionEffect,validateConditionalPolicy);
}
/** Producer-input validation only, before recipient compilation. Runtime callers
 * must use validateRosterEffects; canonical effects cannot enter this path. */
export function validateRosterEffectDeclarations(book,validatePredicate,evaluatePredicate) {
  if(book.entities.some(rule=>rule.kind!=='STRATAGEM'&&rule.ruleContract?.kind!=='STRATAGEM'&&
      rule.ruleContract?.clauses.some(clause=>Object.hasOwn(clause,'recipients')||Object.hasOwn(clause,'recipientStatus'))))
    throw new TypeError('Producer validation requires uncompiled recipient declarations');
  const declarationEffect=(_rule,_clause,effect)=>{
    if(Object.hasOwn(effect,'recipientId')||Object.hasOwn(effect,'recipientIds'))
      throw new TypeError('Producer validation requires uncompiled roster effect declarations');
    return effect;
  };
  return validateEffectOperations(book,validatePredicate,evaluatePredicate,declarationEffect,validateConditionalPolicyDeclaration);
}
function validateEffectOperations(book,validatePredicate,evaluatePredicate,effectView,validatePolicy) {
  const records = new Map(book.entities.map(e => [e.id,e]));
  for (const entity of book.entities.filter(e=>e.ruleContract)) for (const clause of entity.ruleContract.clauses) {
    if (!['ROSTER_EXECUTABLE','BATTLE_ONLY','DISPLAY_ONLY','NOT_AN_EFFECT'].includes(clause.rosterClassification)) throw new TypeError('Unclassified roster clause');
    if ((clause.rosterEffects.length > 0) !== (clause.rosterClassification === 'ROSTER_EXECUTABLE')) throw new TypeError('Execution classification mismatch');
    validatePolicy(book,entity,clause);
    const ids = new Set();
    for (const declaration of clause.rosterEffects) {
      const effect=effectView(entity,clause,declaration);
      if (!effect.id || ids.has(effect.id) || !operations.has(effect.operation) || bindingSubjects[effect.targetBinding] !== effect.targetSubject || !effect.lifetime) throw new TypeError('Malformed roster effect');
      ids.add(effect.id);
      // Root Army Rules have no physical source instance. Only actual global
      // executable clauses opt into dispatch; text/battle-only roots retain
      // their previous behaviour. Source-bound effects cannot use this path.
      if (entity.kind==='ARMY_RULE' && !entity.parentId &&
          (!['ROSTER_UNITS','ROSTER_MODELS'].includes(effect.targetBinding) ||
           effect.conditions.some(condition=>condition.binding==='SOURCE')))
        throw new TypeError('Root Army Rule requires global targets without a physical source');
      let proof = entity.data; for (const key of effect.evidence?.field || []) proof = proof?.[key];
      if (!effect.evidence?.quote || typeof proof !== 'string' || !proof.includes(effect.evidence.quote)) throw new TypeError('Unproven roster effect');
      if (effect.operation === 'MODIFY_STAT') {
        const domain=numericDomain[effect.field];
        if ((!domain && !['M','T','LD','OC','attacks','strength','damage'].includes(effect.field)) ||
            !['ADD','SET'].includes(effect.mode) || !Number.isFinite(effect.value) ||
            domain && (!Number.isSafeInteger(effect.value) || domain.modes && (!domain.modes.includes(effect.mode) || effect.value<domain.min) ||
              domain.subject && effect.targetSubject!==domain.subject ||
              domain.weaponMode && effect.weaponMode!==domain.weaponMode || domain.subject==='MODEL' && effect.weaponMode!==undefined))
          throw new TypeError('Invalid characteristic operation');
      }
      if (effect.canonicalContribution) {
        const origin=effect.canonicalContribution,canonical=records.get(origin.ruleId);
        if (!['MODIFY_STAT','GRANT_WEAPON_ABILITY'].includes(effect.operation) ||
            !canonical?.ruleContract?.clauses.some(clause=>clause.id===origin.clauseId) ||
            Object.keys(origin).some(key=>!['ruleId','clauseId'].includes(key)))
          throw new TypeError('Unresolved canonical effect contribution');
      }
      if (effect.operation === 'MODIFY_RULE_METRIC' && effect.field==='criticalHitThreshold') {
        if (effect.mode!=='SET' || !Number.isSafeInteger(effect.value) || effect.value<2 || effect.value>6 ||
            effect.max!==undefined || effect.weaponMode!==undefined && !['melee','ranged'].includes(effect.weaponMode) ||
            effect.targetSubject==='MODEL' && effect.unitScope!==undefined ||
            effect.targetSubject==='UNIT' && !['PHYSICAL','FORMED'].includes(effect.unitScope))
          throw new TypeError('Invalid typed Critical Hit threshold');
      } else if (effect.operation === 'MODIFY_RULE_METRIC' && (!['contagionRange','detectionRange','chargeRoll','advanceRoll'].includes(effect.field) || effect.mode !== 'ADD' || !Number.isFinite(effect.value))) throw new TypeError('Invalid metric operation');
      if (effect.operation === 'MODIFY_RULE_METRIC' && ['chargeRoll','advanceRoll'].includes(effect.field) &&
          (effect.targetSubject!=='UNIT' || !['PHYSICAL','FORMED'].includes(effect.unitScope) ||
           !Number.isSafeInteger(effect.value) || effect.max!==undefined || effect.weaponMode!==undefined || effect.weaponIds!==undefined))
        throw new TypeError(`Invalid typed UNIT ${effect.field==='chargeRoll'?'Charge':'Advance'}-roll modifier`);
      if (effect.operation==='MODIFY_RULE_METRIC' && effect.field==='detectionRange' && effect.unitScope!==undefined &&
          (effect.targetSubject!=='UNIT'||!['PHYSICAL','FORMED'].includes(effect.unitScope)||!Number.isSafeInteger(effect.value)||
           effect.weaponMode!==undefined||effect.weaponIds!==undefined||effect.max!==undefined))
        throw new TypeError('Invalid scoped UNIT Detection-range modifier');
      if (effect.operation === 'GRANT_UNIT_KEYWORD' && (effect.targetSubject !== 'UNIT' || typeof effect.keyword !== 'string' || !effect.keyword || (effect.unitScope !== undefined && !['FORMED','PHYSICAL'].includes(effect.unitScope)))) throw new TypeError('Invalid UNIT keyword grant');
      if (effect.operation === 'GRANT_MODEL_KEYWORD' && (effect.targetSubject !== 'MODEL' || typeof effect.keyword !== 'string' || !effect.keyword)) throw new TypeError('Invalid MODEL keyword grant');
      if (effect.operation === 'REMOVE_KEYWORD' && (!['MODEL','UNIT'].includes(effect.targetSubject) || typeof effect.keyword !== 'string' || !effect.keyword)) throw new TypeError('Invalid scoped keyword removal');
      if (effect.operation === 'GRANT_MODEL_ABILITY' && (effect.targetSubject !== 'MODEL' || effect.ability?.name !== 'Feel No Pain' || !Number.isInteger(effect.ability.value) || effect.ability.value < 2 || effect.ability.value > 6)) throw new TypeError('Invalid MODEL ability');
      if (effect.operation === 'GRANT_ABILITY') validateAbilityGrant(book,effect);
      if (effect.operation === 'REMOVE_ABILITY') {
        const reference=book.rosterAbilityReferences?.[effect.ability?.canonicalId];
        if(effect.targetSubject!=='MODEL' || effect.unitScope!==undefined ||
            !reference || reference.id!==effect.ability.canonicalId ||
            Object.keys(effect.ability).some(key=>key!=='canonicalId'))
          throw new TypeError('Unresolved canonical MODEL ability suppression');
      }
      if (effect.operation === 'MODIFY_ABILITY_RANGE') {
        const canonicalId=effect.ability?.canonicalId,reference=book.rosterAbilityReferences?.[canonicalId];
        const binding=reference?.rangeBinding,record=records.get(canonicalId);
        const text=Array.isArray(binding?.field)?binding.field.reduce((value,key)=>value?.[key],record?.data):undefined;
        if(effect.targetSubject!=='MODEL'||effect.unitScope!==undefined||effect.mode!=='ADD'||
            !Number.isSafeInteger(effect.value)||effect.value<=0||reference?.id!==canonicalId||
            Object.keys(effect.ability||{}).some(key=>key!=='canonicalId')||
            reference?.parameters?.range?.type!=='number'||typeof text!=='string'||!binding.field.length||
            !Number.isSafeInteger(binding.baseValue)||binding.baseValue<0||
            !Number.isSafeInteger(binding.start)||!Number.isSafeInteger(binding.end)||
            binding.start<0||binding.end<=binding.start||binding.end>text.length||
            text.slice(binding.start,binding.end)!==`${binding.baseValue}"`)
          throw new TypeError('Unresolved canonical MODEL ability range binding');
      }
      if (effect.operation === 'GRANT_WEAPON_ABILITY' && (typeof effect.ability !== 'string' || !effect.ability)) throw new TypeError('Invalid weapon ability');
      if (effect.operation==='CONTRIBUTE_WEAPON_PROFILE') {
        const weapon=records.get(effect.weaponProfileId);
        if (entity.kind!=='ENHANCEMENT' || effect.targetBinding!=='SOURCE_MODEL' ||
            !entity.ruleContract.assignment || weapon?.kind!=='WEAPON_PROFILE' || weapon.parentId!==entity.id ||
            !entity.data.weaponIds?.includes(weapon.id)) throw new TypeError('Unresolved canonical weapon contribution owner');
        if (['weapon','profile','data','definition','physicalQuantity'].some(key=>Object.hasOwn(effect,key)))
          throw new TypeError('Weapon contribution must reference canonical facts');
        if (!['ranged','melee'].includes(effect.weaponMode ?? weapon.data.mode) ||
            effect.weaponMode!==undefined && weapon.data.mode!==undefined && effect.weaponMode!==weapon.data.mode)
          throw new TypeError('Unresolved canonical weapon mode');
      } else if (effect.weaponProfileId!==undefined) throw new TypeError('Weapon contribution identity on a different operation');
      if (effect.targetBinding==='ROSTER_MODELS') {
        const selectors=effect.recipientSelectors;
        if (!selectors || Object.keys(selectors).length!==2 || !selectors.unit || !selectors.model ||
            !['PHYSICAL','FORMED'].includes(effect.containingUnitScope)) throw new TypeError('Missing global MODEL recipient scope');
        if (!Array.isArray(book.rosterProfileBindings)) throw new TypeError('Global MODEL recipients require explicit intrinsic profile bindings');
        for (const [key,subject] of [['unit','UNIT'],['model','MODEL']]) {
          validatePredicate(selectors[key],subject,book,entity);
          if (leaves(selectors[key]).some(predicate=>predicate.contextLevel==='BATTLE')) throw new TypeError('Battle selector in executable MODEL recipients');
        }
      } else if (effect.recipientSelectors!==undefined || effect.containingUnitScope!==undefined)
        throw new TypeError('Global MODEL selectors on a different binding');
      for (const id of [...(effect.weaponIds||[]),...(effect.excludeWeaponIds||[]),...(effect.equipmentRequirement?.excludeWeaponIds||[])]) if (records.get(id)?.kind !== 'WEAPON_PROFILE') throw new TypeError('Unresolved weapon identity');
      const sourceOwners = entity.kind==='ENHANCEMENT' && evaluatePredicate ? book.entities.filter(e=>e.kind==='DATASHEET').filter(unit=>unit.data.profileIds.some(id=> {
        const ownerRole=entity.ruleContract.roles.find(r=>r.id===entity.ruleContract.assignment.ownerRoleId);
        return evaluatePredicate(ownerRole.selector,{subject:ownerRole.subject,unitId:unit.id,modelId:id,keywords:new Set([...unit.data.keywords,...unit.data.factionKeywords]),abilities:new Set(),roster:{},battle:{}})==='TRUE';
      })).map(unit=>unit.id) : [entity.parentId];
      if (['SOURCE_MODEL','SOURCE_UNIT','SOURCE_UNIT_MODELS'].includes(effect.targetBinding)) {
        for (const id of [...(effect.weaponIds||[]),...(effect.excludeWeaponIds||[]),...(effect.equipmentRequirement?.excludeWeaponIds||[]),...(effect.equipmentRequirement?.equipmentId?[effect.equipmentRequirement.equipmentId]:[])]) {
          const record=records.get(id),ownContribution=record?.kind==='WEAPON_PROFILE' && record.parentId===entity.id && entity.data.weaponIds?.includes(id);
          if (!sourceOwners.includes(record?.parentId) && !ownContribution) throw new TypeError('Foreign selected equipment owner');
        }
      }
      for (const condition of effect.conditions) {
        if (!['SOURCE','TARGET'].includes(condition.binding)) throw new TypeError('Unresolved effect participant');
        validatePredicate(condition.predicate, condition.predicate.subject || condition.predicate.args?.[0]?.subject, book, entity);
        const leaves = node => node.op ? node.args.flatMap(leaves) : [node];
        if (condition.binding==='TARGET' && leaves(condition.predicate).some(p=>p.subject!==effect.targetSubject)) throw new TypeError('Wrong effect target predicate subject');
        if (leaves(condition.predicate).some(p=>p.contextLevel === 'BATTLE')) throw new TypeError('Battle predicate in executable roster operation');
      }
    }
  }
  return true;
}
const leaves = node => node.op ? node.args.flatMap(leaves) : [node];
function equipmentSatisfied(book, unit, requirement) {
  const selected = selections(unit), records = new Map(book.entities.map(e=>[e.id,e]));
  if (!selected.length && unit.equipmentContextKnown !== true) return undefined;
  if (requirement.kind === 'EQUIPMENT_PRESENT') {
    const path = '/' + requirement.sourceFieldPath.join('/');
    return selected.some(s=>s.physicalQuantity > 0 && s.canonicalEquipmentIds.includes(requirement.equipmentId) && (s.canonicalFieldPaths?.[requirement.equipmentId] || []).includes(path));
  }
  if (requirement.kind === 'WEAPON_COUNT') {
    return selected.reduce((n,s)=>n+(s.canonicalProfileIds.some(id=>records.get(id).data.mode===requirement.weaponMode && !requirement.excludeWeaponIds.includes(id)) ? s.physicalQuantity : 0),0) === requirement.equals;
  }
  throw new TypeError('Unknown equipment requirement');
}
function changeStat(before, effect) {
  if (numericDomain[effect.field] && before==null && effect.mode!=='SET') throw new TypeError('Missing characteristic base');
  const raw = String(before), suffix = raw.endsWith('"') ? '"' : raw.endsWith('+') && /^\d+\+$/.test(raw) ? '+' : '';
  if (effect.mode === 'SET') return `${effect.value}${numericDomain[effect.field]?.suffix ?? suffix}`;
  const numeric = raw.match(/^(-?\d+)(["+]?)$/);
  if (numeric) return `${Number(numeric[1])+effect.value}${numeric[2]}`;
  const dice = raw.match(/^(\d*D\d+)(?:\s*\+\s*(\d+))?$/i);
  if (dice) { const modifier = Number(dice[2] || 0) + effect.value; return dice[1] + (modifier ? (modifier > 0 ? '+' : '') + modifier : ''); }
  throw new TypeError('Unsupported characteristic expression: ' + raw);
}
/** Logical addresses inside one disposable projection, never physical serial IDs. */
export const weaponPartitionKey=(request,role)=>JSON.stringify(['weapon-quantity-portion',request.unitInstanceId,
  request.scopeId,request.selectionKey,request.canonicalProfileId,request.sourceRuleId,role]);

/** A book supplies a confirmed decision, not weapon values or replacement rows.
 * Only the derived inventory changes; the validated imported state stays intact. */
function partitionWeapons(book,state,projection,resolveWeaponPartitions){
  if(!resolveWeaponPartitions)return;
  const requests=resolveWeaponPartitions({state:structuredClone(state),projection:structuredClone(projection)});
  if(!Array.isArray(requests))throw new TypeError('Invalid projection weapon partitions');
  const records=new Map(book.entities.map(entity=>[entity.id,entity])),seen=new Set();
  for(const request of requests){
    if(!request||Array.isArray(request)||Object.keys(request).length!==5||
      !['unitInstanceId','scopeId','selectionKey','canonicalProfileId','sourceRuleId'].every(key=>Object.hasOwn(request,key))||
      !['unitInstanceId','selectionKey','canonicalProfileId','sourceRuleId'].every(key=>typeof request[key]==='string'&&request[key])||
      request.scopeId!==null&&(typeof request.scopeId!=='string'||!request.scopeId))throw new TypeError('Invalid projection partition reference');
    const unit=projection.units.find(unit=>unit.instanceId===request.unitInstanceId),rule=records.get(request.sourceRuleId);
    const assignment=unit?.enhancementAssignments?.find(row=>row.enhancementId===request.sourceRuleId);
    const model=unit?.profiles.find(row=>row.scopeId===assignment?.modelScopeId);
    if(rule?.kind!=='ENHANCEMENT'||!getRecordedSourceIdentity(rule,{book})||!unit?.enhancementIds.includes(rule.id)||
      !state.detachmentIds.includes(rule.parentId)||model?.quantity!==1||
      request.scopeId!==model.scopeId&&!(request.scopeId===null&&unit.startingStrength===1))
      throw new TypeError('Unconfirmed projection partition source/owner');
    const container=request.scopeId===null?unit:model;
    const matches=container.weapons.filter(row=>row.selectionKey===request.selectionKey);
    const selection=container.selections.find(row=>row.selectionKey===request.selectionKey);
    const marker=JSON.stringify([unit.instanceId,request.scopeId,request.selectionKey]);
    if(seen.has(marker)||matches.length!==1||matches[0].canonicalProfileId!==request.canonicalProfileId||
      matches[0].physicalQuantity!==2||matches[0].quantityPartition||!selection||selection.physicalQuantity!==2||
      selection.canonicalProfileIds.length!==1||selection.canonicalProfileIds[0]!==request.canonicalProfileId||
      (request.scopeId!==null&&selection.perModelQuantity!==2)||
      !selection.quantityEvidence||selection.quantityEvidence.selectedQuantity!==2)
      throw new TypeError('Unresolved, conflicting or non-conserving projection partition');
    seen.add(marker);
    const parent=matches[0],parts=['selected','remainder'].map(role=>({...structuredClone(parent),physicalQuantity:1,
      selectionKey:weaponPartitionKey(request,role),quantityPartition:{role,originalQuantity:2,sourceSelectionKey:parent.selectionKey,
        sourceRuleId:rule.id,...copySourceEvidence(rule,{book,targetSlot:'sourceProvenance'}),sourceSelection:structuredClone(selection)}}));
    if(parts.reduce((sum,row)=>sum+row.physicalQuantity,0)!==parent.physicalQuantity||
      parts.some(part=>container.weapons.some(row=>row.selectionKey===part.selectionKey)))
      throw new TypeError('Duplicated or non-conserving projection partition');
    container.weapons.splice(container.weapons.indexOf(parent),1,...parts);
  }
}
/** Each clause is evaluated independently; no BATTLE action is ever executed. */
export function executeRosterEffects(book, state, {evaluatePredicate,resolveWeaponSelection,resolveWeaponPartitions}) {
  const result = formRoster(book,state), records = new Map(book.entities.map(e=>[e.id,e]));
  // Explicit UNIT scope opts into UNIT presentation. Legacy unscoped range
  // contracts retain their existing MODEL mirrors until separately reviewed.
  const scopedDetectionUnits=new Set();
  partitionWeapons(book,state,result,resolveWeaponPartitions);
  const pending = [];
  for (const rule of book.entities.filter(e=>e.ruleContract)) {
    if (rule.ruleContract.detachmentId && !state.detachmentIds.includes(rule.ruleContract.detachmentId)) continue;
    const globalArmyRule=rule.kind==='ARMY_RULE' && !rule.parentId && rule.ruleContract.kind==='ARMY_RULE' &&
      rule.ruleContract.clauses.some(clause=>clause.rosterEffects.length>0);
    const sources = rule.kind === 'ENHANCEMENT' ? result.units.filter(u=>u.enhancementIds.includes(rule.id)) : rule.kind === 'DETACHMENT_RULE' || globalArmyRule ? [null] : result.units.filter(u=>u.canonicalUnitId === rule.parentId);
    for (const source of sources) {
      let ownerModel = null;
      if (source && rule.kind === 'ENHANCEMENT' && rule.ruleContract.assignment) {
        const ownerRole=rule.ruleContract.roles.find(role=>role.id===rule.ruleContract.assignment.ownerRoleId);
        const assignment=source.enhancementAssignments?.find(item=>item.enhancementId===rule.id);
        if (assignment && ownerRole.subject!=='MODEL') throw new TypeError('MODEL bearer assignment on a non-MODEL Enhancement');
        const models=ownerRole.subject==='MODEL' ? source.profiles.filter(model=>!assignment || model.scopeId===assignment.modelScopeId) : [];
        if (assignment && (models.length!==1 || models[0].quantity!==1)) throw new TypeError('Unresolved physical Enhancement bearer');
        const contexts=ownerRole.subject==='MODEL'
          ? models.map(model=>predicateContext(state,result,source.instanceId,'MODEL',model.scopeId))
          : [predicateContext(state,result,source.instanceId,ownerRole.subject)];
        const statuses=contexts.map(context=>evaluatePredicate(rule.ruleContract.assignment.selector,enhancementOwnerContext(rule.ruleContract,context)));
        if (statuses.includes('INVALID')) throw new TypeError('Invalid Enhancement owner context');
        if (ownerRole.subject==='MODEL' && statuses.includes('UNKNOWN')) {
          for (const clause of rule.ruleContract.clauses) source.conditional.push({ruleId:rule.id,clauseId:clause.id,state:'UNKNOWN',reason:'Enhancement owner context unavailable'});
          continue;
        }
        if (!statuses.includes('TRUE')) continue;
        if (ownerRole.subject==='MODEL') {
          const eligible=models.filter((model,index)=>statuses[index]==='TRUE');
          if (eligible.length!==1 || eligible[0].quantity!==1) throw new TypeError('Ambiguous physical Enhancement bearer');
          ownerModel=eligible[0];
        }
      }
      for (const clause of rule.ruleContract.clauses) {
        appendConditionalPolicy(result,rule,clause,source,ownerModel);
        if (clause.rosterClassification === 'BATTLE_ONLY' && rule.kind!=='DETACHMENT_RULE') {
          for (const unit of source ? [source] : result.units) unit.conditional.push({ruleId:rule.id,clauseId:clause.id,state:'UNKNOWN',reason:clause.rosterClassificationNote.reason});
        }
        for (const effect of clause.rosterEffects) pending.push({rule,clause,effect:resolveExecutionEffect(rule,clause,effect),source,ownerModel});
      }
    }
  }
  const targets = ({source,effect,rule,ownerModel}) => {
    if (effect.targetBinding === 'ROSTER_UNITS') return result.units.map(unit=>({unit}));
    if (effect.targetBinding === 'ROSTER_MODELS') return result.units.flatMap(unit=>unit.profiles.map(model=>({unit,model})));
    if (!source) throw new TypeError('Missing source physical instance');
    if (effect.operation==='CONTRIBUTE_WEAPON_PROFILE' || effect.targetBinding==='SOURCE_MODEL' && ownerModel) {
      if (!ownerModel) throw new TypeError('Unresolved physical weapon bearer');
      return [{unit:source,model:ownerModel}];
    }
    if (effect.targetBinding === 'SOURCE_UNIT') return [{unit:source}];
    const group = result.formedUnits.find(g=>g.formedUnitId === source.formedUnitId);
    const selected = effect.targetBinding === 'SOURCE_FORMED_MODELS' ? group ? result.units.filter(u=>group.memberInstanceIds.includes(u.instanceId)) : [] : effect.targetBinding === 'LEADERS_OF_SOURCE' ? group && group.bodyguardInstanceId === source.instanceId ? result.units.filter(u=>group.leaderInstanceIds.includes(u.instanceId)) : [] : [source];
    if (!['SOURCE_MODEL','SOURCE_UNIT_MODELS','SOURCE_FORMED_MODELS','LEADERS_OF_SOURCE'].includes(effect.targetBinding)) throw new TypeError('Unknown target binding');
    return selected.flatMap(unit=>unit.profiles.map(model=>({unit,model})));
  };
  const processed = new Set();
  const numericValues=new Map();
  const scopedKeywords = pending.some(p => ['GRANT_MODEL_KEYWORD','REMOVE_KEYWORD'].includes(p.effect.operation));
  // Keyword contributions are derived from immutable starting bags. A UNIT
  // override never rewrites MODEL facts; removing one MODEL contribution does
  // not remove an identical contribution supplied by another profile.
  const keywordBases = new Map(result.units.map(unit => {
    const modelKeys = new Set(unit.profiles.flatMap(model => model.keywords));
    return [unit,{unit:[...unit.keywords],own:unit.keywords.filter(key => !modelKeys.has(key)),
      models:new Map(unit.profiles.map(model => [model,[...model.keywords]]))}];
  }));
  const keywordDeltas = new Map();
  const resetKeywords = () => {
    keywordDeltas.clear();
    for (const [unit,base] of keywordBases) {
      unit.keywords=[...base.unit];
      keywordDeltas.set(unit,{grants:new Set(),removals:new Set()});
      for (const [model,keys] of base.models) {
        model.keywords=[...keys];
        keywordDeltas.set(model,{grants:new Set(),removals:new Set()});
      }
    }
    refreshFormedKeywords(result);
  };
  resetKeywords();
  const derivedUnitKeywords = unit => {
    const delta=keywordDeltas.get(unit),base=keywordBases.get(unit);
    return [...new Set([...base.own,...unit.profiles.flatMap(model=>model.keywords),...delta.grants])]
      .filter(key=>!delta.removals.has(key)).sort();
  };
  const eligible = ({rule,clause,effect,source,ownerModel}, target) => {
    if (effect.targetBinding==='ROSTER_MODELS') {
      // UNIT membership and MODEL identity are separate selectors. Only the
      // explicitly formed UNIT scope shares attachment keywords; MODEL context
      // always comes from this exact imported profile/composition scope.
      const unitContext=predicateContext(state,result,target.unit.instanceId,'UNIT');
      if (effect.containingUnitScope==='PHYSICAL') {
        unitContext.unitId=target.unit.canonicalUnitId;
        unitContext.keywords=new Set(target.unit.keywords);
      }
      const modelContext=predicateContext(state,result,target.unit.instanceId,'MODEL',target.model.scopeId);
      const statuses=[];
      for (const [predicate,context] of [[effect.recipientSelectors.unit,unitContext],[effect.recipientSelectors.model,modelContext]]) {
        if (!context) throw new TypeError('Unresolved global MODEL recipient context');
        const status=evaluatePredicate(predicate,context);
        if (status==='INVALID') throw new TypeError('Invalid global MODEL recipient selector: '+rule.id+'/'+effect.id);
        statuses.push(status);
      }
      if (statuses.includes('FALSE')) return false;
      if (statuses.includes('UNKNOWN')) {
        target.unit.conditional.push({ruleId:rule.id,clauseId:clause.id,state:'UNKNOWN',reason:'Roster recipient context unavailable'});
        return false;
      }
    }
    const knownEquipment=effect.equipmentRequirement&&source?equipmentSatisfied(book,source,effect.equipmentRequirement):undefined;
    const extra = knownEquipment===undefined?{}:{equipmentRequirementSatisfied:knownEquipment};
    for (const condition of effect.conditions) {
      const subject = leaves(condition.predicate)[0].subject;
      const participant = condition.binding === 'SOURCE' ? source : target.unit;
      const ctx = predicateContext(state,result,participant?.instanceId,subject,condition.binding === 'TARGET' ? target.model?.scopeId : ownerModel?.scopeId,condition.binding === 'SOURCE' ? extra : {});
      if (!ctx) return false;
      if ((effect.operation==='GRANT_ABILITY' || effect.operation==='GRANT_UNIT_KEYWORD'||
          effect.operation==='MODIFY_RULE_METRIC'&&effect.field==='detectionRange') && effect.unitScope==='PHYSICAL' && subject==='UNIT') {
        ctx.unitId=participant.canonicalUnitId;
        ctx.keywords=new Set(participant.keywords);
      }
      const status = evaluatePredicate(condition.predicate,ctx);
      if (status === 'INVALID') throw new TypeError('Invalid roster predicate: '+rule.id+'/'+effect.id);
      if (status !== 'TRUE') { if (status === 'UNKNOWN') target.unit.conditional.push({ruleId:rule.id,clauseId:clause.id,state:status,reason:'Roster context unavailable'}); return false; }
    }
    return true;
  };
  const apply = (item, target, conditionsChecked=false) => {
    const {rule,clause,effect,source,ownerModel}=item;
    if (!conditionsChecked && !eligible(item,target)) return;
    const mutate = (object,key,after,targetModelId,targetWeaponId,weaponScope,recordUnchanged=false) => {
      const before = clone(object[key] ?? null);
      if (JSON.stringify(before) === JSON.stringify(after) && !recordUnchanged) return;
      object[key] = clone(after);
      target.unit.applied.push({ruleId:rule.id,clauseId:clause.id,effectId:effect.id,sourceInstanceId:source?.instanceId || null,targetInstanceId:target.unit.instanceId,
        ...(ownerModel && (source.profiles.length>1 || source.enhancementAssignments?.length) ? {
          sourceProfileId:ownerModel.canonicalProfileId,sourceCompositionId:ownerModel.scopeId,sourceModelInstanceId:ownerModel.modelInstanceId} : {}),
        targetModelInstanceId:targetModelId || null,targetProfileId:targetWeaponId ? weaponScope?.canonicalProfileId || null : target.model?.canonicalProfileId || null,targetCompositionId:targetWeaponId ? weaponScope?.scopeId || null : target.model?.scopeId || null,targetWeaponProfileId:targetWeaponId || null,operation:effect.operation,field:key,before,after:clone(after),sourceFields:clone(effect.sourceFields),lifetime:effect.lifetime,
        ...(['GRANT_ABILITY','REMOVE_ABILITY','MODIFY_ABILITY_RANGE'].includes(effect.operation)?{targetAbilityId:effect.ability.canonicalId,
          ...(effect.operation==='GRANT_ABILITY'?{abilityParameters:clone(effect.ability.parameters)}:{})}:{}),
        ...(effect.canonicalContribution?{canonicalContribution:clone(effect.canonicalContribution)}:{})});
      return target.unit.applied.at(-1);
    };
    const contributionUsed=(scope)=>{
      if(!effect.canonicalContribution)return false;
      const origin=effect.canonicalContribution;
      const key=`canonical/${origin.ruleId}/${origin.clauseId}/${target.unit.instanceId}/${scope}/${effect.field || effect.ability}`;
      if(processed.has(key))return true;
      processed.add(key);return false;
    };
    const modifyCharacteristic=(object,key,modelId,weaponId,weaponScope)=>{
      const domain=numericDomain[effect.field];
      if(!numericValues.has(object))numericValues.set(object,new Map());
      const values=numericValues.get(object),previous=values.get(key),rawBefore=previous?.raw ?? object[key];
      if(domain && immutableCharacteristic(rawBefore))return;
      const rawAfter=changeStat(rawBefore,effect);
      let after=rawAfter;
      if(domain) {
        const match=rawAfter.match(/^(-?\d+)(["+]?)$/);
        if(!match)throw new TypeError('Unsupported typed characteristic');
        after=`${Math.min(domain.max ?? Infinity,Math.max(domain.min ?? -Infinity,Number(match[1])))}${domain.suffix}`;
      }
      const rows=previous?.rows || [];
      values.set(key,{raw:rawAfter,rows});
      const row=mutate(object,key,after,modelId,weaponId,weaponScope,Boolean(domain));
      if(row && domain){row.characteristic=effect.field;row.rawBefore=rawBefore ?? null;row.rawAfter=rawAfter;rows.push(row);}
      return row;
    };
    const physicalUnit=(effect.operation==='GRANT_ABILITY' || effect.operation==='GRANT_UNIT_KEYWORD' ||
      effect.operation==='MODIFY_RULE_METRIC' && ['chargeRoll','advanceRoll','criticalHitThreshold','detectionRange'].includes(effect.field)) && effect.unitScope==='PHYSICAL';
    const marker = `${rule.id}/${effect.id}/${source?.instanceId || 'roster'}/${target.model?.scopeId || (!physicalUnit && target.unit.formedUnitId) || target.unit.instanceId}`;
    if (processed.has(marker)) return;
    processed.add(marker);
    const group=effect.targetSubject==='UNIT' && !physicalUnit?result.formedUnits.find(g=>g.formedUnitId===target.unit.formedUnitId):null;
    const unitRecipients=group?result.units.filter(u=>group.memberInstanceIds.includes(u.instanceId)):[target.unit];
    if (effect.operation==='CONTRIBUTE_WEAPON_PROFILE') {
      const profile=records.get(effect.weaponProfileId);
      if(target.model.weapons.some(weapon=>weapon.canonicalProfileId===profile.id))return;
      const data=clone(profile.data);
      if(data.mode===undefined)data.mode=effect.weaponMode;
      target.model.weapons.push({modelInstanceId:target.model.modelInstanceId,scopeId:target.model.scopeId,
        canonicalProfileId:profile.id,physicalQuantity:1,selectionKey:JSON.stringify([rule.id,effect.id]),data,
        contributedBy:{ruleId:rule.id,effectId:effect.id}});
      target.unit.applied.push({ruleId:rule.id,clauseId:clause.id,effectId:effect.id,sourceInstanceId:source.instanceId,
        targetInstanceId:target.unit.instanceId,targetModelInstanceId:target.model.modelInstanceId,
        targetProfileId:target.model.canonicalProfileId,targetCompositionId:target.model.scopeId,targetWeaponProfileId:profile.id,
        operation:effect.operation,field:'weapons',before:null,after:{canonicalProfileId:profile.id,physicalQuantity:1},
        sourceFields:clone(effect.sourceFields),lifetime:effect.lifetime});
    }
    else if (effect.operation === 'GRANT_UNIT_KEYWORD') for (const unit of unitRecipients) {
      const original=target.unit;target.unit=unit;
      keywordDeltas.get(unit).grants.add(effect.keyword);
      mutate(unit,'keywords',scopedKeywords ? derivedUnitKeywords(unit) : [...new Set([...unit.keywords,effect.keyword])].sort());target.unit=original;
    }
    else if (effect.operation === 'GRANT_MODEL_KEYWORD' || effect.operation === 'REMOVE_KEYWORD') {
      if (effect.targetSubject === 'MODEL') {
        const delta=keywordDeltas.get(target.model),base=keywordBases.get(target.unit).models.get(target.model);
        (effect.operation==='REMOVE_KEYWORD'?delta.removals:delta.grants).add(effect.keyword);
        mutate(target.model,'keywords',[...new Set([...base,...delta.grants])].filter(key=>!delta.removals.has(key)).sort(),target.model.modelInstanceId);
        target.unit.keywords=derivedUnitKeywords(target.unit);
      } else for (const unit of unitRecipients) {
        const original=target.unit;target.unit=unit;
        keywordDeltas.get(unit).removals.add(effect.keyword);
        mutate(unit,'keywords',derivedUnitKeywords(unit));target.unit=original;
      }
    }
    else if (effect.operation === 'GRANT_ABILITY') {
      const ability=canonicalAbility(book,effect);
      if (effect.targetSubject==='MODEL')
        mutate(target.model,'abilities',grantedAbilities(target.model.abilities,ability),target.model.modelInstanceId,undefined,undefined,true);
      else {
        for (const unit of unitRecipients) {
          const original=target.unit;target.unit=unit;
          mutate(unit,'abilities',grantedAbilities(unit.abilities,ability),undefined,undefined,undefined,true);
          target.unit=original;
        }
        if (group) group.abilities=grantedAbilities(group.abilities,ability);
      }
    }
    else if (effect.operation === 'REMOVE_ABILITY') {
      // A mask belongs to this effective MODEL scope, never to the canonical
      // rule or another component. Presentation also consumes it for static
      // reference occurrences which do not have a runtime ability entry.
      const canonicalId=effect.ability.canonicalId;
      target.model.suppressedAbilityIds=[...new Set([...(target.model.suppressedAbilityIds||[]),canonicalId])].sort();
      mutate(target.model,'abilities',target.model.abilities.filter(ability=>ability.canonicalId!==canonicalId),
        target.model.modelInstanceId,undefined,undefined,true);
    }
    else if (effect.operation === 'MODIFY_ABILITY_RANGE') {
      const canonicalId=effect.ability.canonicalId,binding=book.rosterAbilityReferences[canonicalId].rangeBinding;
      const owned=target.model.abilities.filter(ability=>ability.canonicalId===canonicalId);
      if(owned.length>1)throw new TypeError('Ambiguous canonical MODEL ability range owner');
      if(!owned.length)return; // A modifier cannot grant an absent ability.
      const ability=owned[0],before=ability.parameters?.range;
      if(!Number.isSafeInteger(before)||before<0||!ability.rangePresentation&&before!==binding.baseValue)
        throw new TypeError('Unresolved canonical MODEL ability base range');
      const row=mutate(ability.parameters,'range',before+effect.value,target.model.modelInstanceId);
      const canonicalText=binding.field.reduce((value,key)=>value[key],records.get(canonicalId).data);
      ability.rangePresentation={field:clone(binding.field),baseValue:binding.baseValue,
        text:canonicalText.slice(0,binding.start)+`${ability.parameters.range}"`+canonicalText.slice(binding.end)};
      if(row){row.baseValue=binding.baseValue;row.targetAbilitySource={entityId:canonicalId,field:clone(binding.field)};}
    }
    else if (effect.operation === 'GRANT_MODEL_ABILITY') {
      const existing = target.model.abilities.find(a=>a.name === effect.ability.name), next = clone(target.model.abilities.filter(a=>a.name !== effect.ability.name));
      next.push({name:effect.ability.name,value:Math.min(existing?.value ?? Infinity,effect.ability.value)});
      mutate(target.model,'abilities',next,target.model.modelInstanceId);
    } else if (effect.operation === 'MODIFY_RULE_METRIC' && effect.field!=='criticalHitThreshold') {
      if (group) { const metric=group.metrics[effect.field] || {modifier:0};group.metrics[effect.field]={modifier:metric.modifier+effect.value,...(effect.max?{max:Math.min(metric.max??Infinity,effect.max)}:{})}; }
      for (const unit of unitRecipients) {
        const scopedDetection=effect.field==='detectionRange'&&effect.targetSubject==='UNIT'&&['PHYSICAL','FORMED'].includes(effect.unitScope);
        if(scopedDetection)scopedDetectionUnits.add(unit);
        const object = target.model ? target.model.metrics : unit.metrics, before = object[effect.field] || {modifier:0};
        const original=target.unit;target.unit=unit;
        mutate(object,effect.field,{modifier:before.modifier + effect.value,...((effect.max || before.max) ? {max:Math.min(effect.max ?? Infinity,before.max ?? Infinity)} : {})},target.model?.modelInstanceId,undefined,undefined,scopedDetection);
        target.unit=original;
      }
    } else if (effect.operation === 'MODIFY_STAT' && ['M','T','SV','W','LD','OC','INSV'].includes(effect.field)) {
      const profile=target.model.profile,nested=Object.hasOwn(profile.stats || {},effect.field);
      if(nested && Object.hasOwn(profile,effect.field))throw new TypeError('Duplicate MODEL characteristic owner');
      const characteristics=nested?profile.stats:profile;
      if(effect.field==='INSV' && characteristics.INSV===undefined) {
        const referenceId=profile.invulnerableSaveId;
        if(referenceId) {
          const reference=records.get(referenceId);
          if(reference?.kind!=='INVULNERABLE_SAVE' || reference.parentId!==target.unit.canonicalUnitId ||
              !reference.data.profileIds.includes(target.model.canonicalProfileId))throw new TypeError('Unresolved invulnerable profile scope');
          characteristics.INSV=reference.data.value;
        }
      }
      if(!contributionUsed(target.model.scopeId)) {
        const row=modifyCharacteristic(characteristics,effect.field,target.model.modelInstanceId);
        if(row && nested)row.targetFieldPath=['stats',effect.field];
      }
    }
    else {
      const weaponRecipients=target.model?[target.unit]:unitRecipients;
      for (const unit of weaponRecipients) {
      const original=target.unit;target.unit=unit;
      // An aggregate selection does not prove which mixed-profile MODEL owns
      // the weapon. Exact bearer effects require a bound MODEL inventory.
      const exactBearerWeapons=ownerModel && effect.targetBinding==='SOURCE_MODEL';
      const weapons = target.model ? [...target.model.weapons,...(unit.profiles.length>1 && (effect.operation==='MODIFY_STAT' || exactBearerWeapons) ? [] : unit.weapons)] : [...unit.weapons,...unit.profiles.flatMap(m=>m.weapons)];
      // Optional book-owned decisions narrow existing operations, never their
      // canonical eligibility. Undefined preserves all-matching modifiers;
      // null explicitly withholds a selected-weapon effect without fallback.
      const choice=resolveWeaponSelection?.({rule,effect,source,ownerModel});
      if(choice===null){
        unit.conditional.push({ruleId:rule.id,clauseId:clause.id,state:'UNKNOWN',reason:'Physical weapon selection unavailable'});
        target.unit=original;continue;
      }
      let chosen;
      if(choice!==undefined){
        if(!choice || Array.isArray(choice) || Object.keys(choice).length!==4 ||
            !['unitInstanceId','scopeId','selectionKey','canonicalProfileId'].every(key=>Object.hasOwn(choice,key)) ||
            !['unitInstanceId','selectionKey','canonicalProfileId'].every(key=>typeof choice[key]==='string'&&choice[key]) ||
            choice.scopeId!==null && (typeof choice.scopeId!=='string'||!choice.scopeId) ||
            !exactBearerWeapons || ownerModel.quantity!==1 || source!==unit || target.model!==ownerModel ||
            choice.unitInstanceId!==source.instanceId ||
            choice.scopeId!==ownerModel.scopeId && !(choice.scopeId===null&&source.startingStrength===1))
          throw new TypeError('Invalid physical weapon selection owner/scope');
        const matches=weapons.filter(weapon=>(weapon.scopeId??null)===choice.scopeId &&
          weapon.selectionKey===choice.selectionKey && weapon.canonicalProfileId===choice.canonicalProfileId);
        if(matches.length!==1 || matches[0].physicalQuantity!==1 ||
            effect.weaponMode && matches[0].data.mode!==effect.weaponMode ||
            effect.weaponIds && !effect.weaponIds.includes(choice.canonicalProfileId) ||
            effect.excludeWeaponIds?.includes(choice.canonicalProfileId))
          throw new TypeError('Unresolved or aggregate physical weapon selection');
        chosen=matches[0];
      }
      for (const weapon of weapons) {
        if(chosen && weapon!==chosen)continue;
        if (effect.weaponMode && weapon.data.mode !== effect.weaponMode || effect.weaponIds && !effect.weaponIds.includes(weapon.canonicalProfileId) || effect.excludeWeaponIds?.includes(weapon.canonicalProfileId)) continue;
        const weaponMarker = `${rule.id}/${effect.id}/${source?.instanceId || 'roster'}/${target.unit.instanceId}/${target.unit.weapons.includes(weapon) ? 'unit' : weapon.scopeId}/${weapon.selectionKey}/${weapon.canonicalProfileId}`;
        if (processed.has(weaponMarker)) continue; processed.add(weaponMarker);
        if(contributionUsed(`${unit.weapons.includes(weapon)?'unit':weapon.scopeId}/${weapon.selectionKey}/${weapon.canonicalProfileId}`))continue;
        const appliedStart=unit.applied.length;
        if (effect.operation==='MODIFY_RULE_METRIC' && effect.field==='criticalHitThreshold') {
          // A passive attack threshold is neither BS/WS nor a MODEL metric.
          // Keep each source contribution even when another grant is stronger.
          mutate(weapon.data,'criticalHitThreshold',Math.min(weapon.data.criticalHitThreshold??6,effect.value),weapon.modelInstanceId,weapon.canonicalProfileId,
            target.unit.weapons.includes(weapon)?null:target.model || target.unit.profiles.find(profile=>profile.scopeId===weapon.scopeId),true);
        }
        else if (effect.operation === 'GRANT_WEAPON_ABILITY') mutate(weapon.data,'abilities',weapon.data.abilities.some(ability=>ability.toUpperCase()===effect.ability.toUpperCase())?[...weapon.data.abilities]:[...weapon.data.abilities,effect.ability],weapon.modelInstanceId,weapon.canonicalProfileId,target.unit.weapons.includes(weapon)?null:target.model || target.unit.profiles.find(profile=>profile.scopeId===weapon.scopeId));
        else modifyCharacteristic(weapon.data,numericDomain[effect.field]?.field || effect.field,weapon.modelInstanceId,weapon.canonicalProfileId,target.unit.weapons.includes(weapon)?null:target.model || target.unit.profiles.find(profile=>profile.scopeId===weapon.scopeId));
        // Address every emitted weapon contribution, including all-matching
        // modifiers. This records the existing recipient; it never reapplies it.
        for(const row of unit.applied.slice(appliedStart)){
          row.targetWeaponSelectionKey=weapon.selectionKey;row.targetWeaponScopeId=weapon.scopeId??null;
        }
      }
      target.unit=original;
      }
    }
  };
  const keywordOperations = new Set(['GRANT_UNIT_KEYWORD','GRANT_MODEL_KEYWORD','REMOVE_KEYWORD']);
  const keyword = pending.filter(p=>keywordOperations.has(p.effect.operation));
  if (scopedKeywords) {
    const rank={GRANT_UNIT_KEYWORD:0,GRANT_MODEL_KEYWORD:1,REMOVE_KEYWORD:2};
    keyword.sort((a,b)=>rank[a.effect.operation]-rank[b.effect.operation] ||
      a.rule.id.localeCompare(b.rule.id,'en') || a.effect.id.localeCompare(b.effect.id,'en') ||
      (a.source?.instanceId||'').localeCompare(b.source?.instanceId||'','en'));
    const signature=()=>JSON.stringify(result.units.map(unit=>[unit.instanceId,[...unit.keywords].sort(),
      unit.profiles.map(model=>[model.scopeId,[...model.keywords].sort()])]));
    const seen=new Set();
    const bound=keyword.reduce((n,item)=>n+targets(item).length,0)+1;
    for (let pass=0;pass<=bound;pass++) {
      const before=signature();
      if (seen.has(before)) throw new TypeError('Scoped keyword conditions did not converge');
      seen.add(before);
      // Conditions observe the previous complete projection, never a partial
      // ordering of grants/removals. Rebuild active contributions each pass.
      const active=keyword.flatMap(item=>targets(item).filter(target=>eligible(item,target)).map(target=>({item,target})));
      resetKeywords();processed.clear();
      for (const unit of result.units) unit.applied=[];
      for (const {item,target} of active) apply(item,target,true);
      refreshFormedKeywords(result);
      if (signature()===before) break;
      if (pass===bound) throw new TypeError('Scoped keyword conditions did not converge');
    }
  } else {
    // Preserve the established grant-only path and its existing DG projections.
    for (let pass = 0; pass <= keyword.length; pass++) {
      const before = processed.size;
      for (const item of keyword) for (const target of targets(item)) apply(item,target);
      refreshFormedKeywords(result);
      if (before === processed.size) break;
      if (pass === keyword.length) throw new TypeError('Keyword fixed point did not converge');
    }
  }
  // Build the effective inventory before applying modifiers/grants to weapons.
  const contributions=pending.filter(p=>p.effect.operation==='CONTRIBUTE_WEAPON_PROFILE')
    .sort((a,b)=>a.rule.id.localeCompare(b.rule.id,'en') || a.effect.id.localeCompare(b.effect.id,'en') || a.source.instanceId.localeCompare(b.source.instanceId,'en'));
  for(const item of contributions)for(const target of targets(item))apply(item,target);
  const remaining=pending.filter(p=>!keywordOperations.has(p.effect.operation) &&
    !['CONTRIBUTE_WEAPON_PROFILE','REMOVE_ABILITY','MODIFY_ABILITY_RANGE'].includes(p.effect.operation));
  if(remaining.some(p=>numericDomain[p.effect.field] || p.effect.canonicalContribution))
    remaining.sort((a,b)=>(numericDomain[a.effect.field]&&a.effect.mode==='SET'?0:1)-(numericDomain[b.effect.field]&&b.effect.mode==='SET'?0:1) ||
      a.rule.id.localeCompare(b.rule.id,'en') || a.effect.id.localeCompare(b.effect.id,'en') || (a.source?.instanceId||'').localeCompare(b.source?.instanceId||'','en'));
  for (const item of remaining) for (const target of targets(item)) apply(item,target);
  const abilityRanges=pending.filter(p=>p.effect.operation==='MODIFY_ABILITY_RANGE').sort((a,b)=>
    a.rule.id.localeCompare(b.rule.id,'en') || a.effect.id.localeCompare(b.effect.id,'en') ||
    (a.source?.instanceId||'').localeCompare(b.source?.instanceId||'','en'));
  for(const item of abilityRanges)for(const target of targets(item))apply(item,target);
  // Suppression wins over grants for the same canonical ability while active.
  // Rebuild starts from immutable facts, so removing its condition restores it.
  const suppressions=pending.filter(p=>p.effect.operation==='REMOVE_ABILITY').sort((a,b)=>
    a.rule.id.localeCompare(b.rule.id,'en') || a.effect.id.localeCompare(b.effect.id,'en') ||
    (a.source?.instanceId||'').localeCompare(b.source?.instanceId||'','en'));
  for(const item of suppressions)for(const target of targets(item))apply(item,target);
  for(const [object,fields]of numericValues)for(const [field,value]of fields)for(const row of value.rows)row.finalValue=clone(object[field]);
  // Recipient text observes the final roster vocabulary, including existing
  // typed keyword effects, without changing any of those computations.
  for(const rule of book.entities.filter(entity=>entity.kind==='DETACHMENT_RULE'&&entity.ruleContract))
    for(const clause of rule.ruleContract.clauses)if(!clause.conditionalPolicy)
      appendConditionalPolicy(result,rule,clause,null,null,book,evaluatePredicate);
  for (const unit of result.units) {
    unit.conditional = unit.conditional.filter((row,i,rows)=>rows.findIndex(r=>r.ruleId===row.ruleId&&r.clauseId===row.clauseId&&r.reason===row.reason&&Boolean(r.policy)===Boolean(row.policy)&&
      Boolean(r.detachmentText)===Boolean(row.detachmentText)&&(!row.detachmentText||JSON.stringify(r.detachmentText)===JSON.stringify(row.detachmentText)&&JSON.stringify(r.recipientModelScopeIds)===JSON.stringify(row.recipientModelScopeIds))&&
      (!row.policy||r.sourceInstanceId===row.sourceInstanceId&&r.sourceModelScopeId===row.sourceModelScopeId))===i);
    for (const model of unit.profiles) {
      for (const [field,metric] of Object.entries(unit.metrics)) {
        if(['chargeRoll','advanceRoll'].includes(field)||field==='detectionRange'&&scopedDetectionUnits.has(unit))continue;
        const own = model.metrics[field] || {modifier:0};
        model.metrics[field] = {modifier:own.modifier+metric.modifier,...((own.max||metric.max)?{max:Math.min(own.max??Infinity,metric.max??Infinity)}:{})};
      }
    }
  }
  return result;
}
