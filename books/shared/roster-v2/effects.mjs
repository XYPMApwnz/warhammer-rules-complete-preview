import {formRoster, predicateContext, refreshFormedKeywords, selections} from './context.mjs';
import {enhancementOwnerContext} from './compatibility-context.mjs';
const clone = value => structuredClone(value);
const operations = new Set(['MODIFY_STAT','GRANT_WEAPON_ABILITY','GRANT_MODEL_ABILITY','GRANT_ABILITY','GRANT_UNIT_KEYWORD','GRANT_MODEL_KEYWORD','REMOVE_KEYWORD','MODIFY_RULE_METRIC']);
const bindingSubjects = {SOURCE_MODEL:'MODEL',SOURCE_UNIT:'UNIT',SOURCE_UNIT_MODELS:'MODEL',SOURCE_FORMED_MODELS:'MODEL',LEADERS_OF_SOURCE:'MODEL',ROSTER_UNITS:'UNIT'};
// Current Core 02.02.01: threshold/AP improvements are signed arithmetic;
// bounds apply to the combined result, never to each modifier contribution.
const numericDomain = {
  BS:{field:'skill',weaponMode:'ranged',min:2,max:6,suffix:'+'},
  WS:{field:'skill',weaponMode:'melee',min:2,max:6,suffix:'+'},
  range:{field:'range',weaponMode:'ranged',min:1,suffix:'"'},
  ap:{field:'ap',max:0,suffix:''},
  INSV:{field:'INSV',subject:'MODEL',min:2,suffix:'+'}
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
  const records = new Map(book.entities.map(e => [e.id,e]));
  for (const entity of book.entities.filter(e=>e.ruleContract)) for (const clause of entity.ruleContract.clauses) {
    if (!['ROSTER_EXECUTABLE','BATTLE_ONLY','DISPLAY_ONLY','NOT_AN_EFFECT'].includes(clause.rosterClassification)) throw new TypeError('Unclassified roster clause');
    if ((clause.rosterEffects.length > 0) !== (clause.rosterClassification === 'ROSTER_EXECUTABLE')) throw new TypeError('Execution classification mismatch');
    const ids = new Set();
    for (const effect of clause.rosterEffects) {
      if (!effect.id || ids.has(effect.id) || !operations.has(effect.operation) || bindingSubjects[effect.targetBinding] !== effect.targetSubject || !effect.lifetime) throw new TypeError('Malformed roster effect');
      ids.add(effect.id);
      let proof = entity.data; for (const key of effect.evidence?.field || []) proof = proof?.[key];
      if (!effect.evidence?.quote || typeof proof !== 'string' || !proof.includes(effect.evidence.quote)) throw new TypeError('Unproven roster effect');
      if (effect.operation === 'MODIFY_STAT') {
        const domain=numericDomain[effect.field];
        if ((!domain && !['M','T','LD','OC','attacks','strength','damage'].includes(effect.field)) ||
            !['ADD','SET'].includes(effect.mode) || !Number.isFinite(effect.value) ||
            domain && (!Number.isSafeInteger(effect.value) || domain.subject && effect.targetSubject!==domain.subject ||
              domain.weaponMode && effect.weaponMode!==domain.weaponMode || effect.field==='INSV' && effect.weaponMode!==undefined))
          throw new TypeError('Invalid characteristic operation');
      }
      if (effect.canonicalContribution) {
        const origin=effect.canonicalContribution,canonical=records.get(origin.ruleId);
        if (!['MODIFY_STAT','GRANT_WEAPON_ABILITY'].includes(effect.operation) ||
            !canonical?.ruleContract?.clauses.some(clause=>clause.id===origin.clauseId) ||
            Object.keys(origin).some(key=>!['ruleId','clauseId'].includes(key)))
          throw new TypeError('Unresolved canonical effect contribution');
      }
      if (effect.operation === 'MODIFY_RULE_METRIC' && (!['contagionRange','detectionRange'].includes(effect.field) || effect.mode !== 'ADD' || !Number.isFinite(effect.value))) throw new TypeError('Invalid metric operation');
      if (effect.operation === 'GRANT_UNIT_KEYWORD' && (effect.targetSubject !== 'UNIT' || typeof effect.keyword !== 'string' || !effect.keyword)) throw new TypeError('Invalid UNIT keyword grant');
      if (effect.operation === 'GRANT_MODEL_KEYWORD' && (effect.targetSubject !== 'MODEL' || typeof effect.keyword !== 'string' || !effect.keyword)) throw new TypeError('Invalid MODEL keyword grant');
      if (effect.operation === 'REMOVE_KEYWORD' && (!['MODEL','UNIT'].includes(effect.targetSubject) || typeof effect.keyword !== 'string' || !effect.keyword)) throw new TypeError('Invalid scoped keyword removal');
      if (effect.operation === 'GRANT_MODEL_ABILITY' && (effect.targetSubject !== 'MODEL' || effect.ability?.name !== 'Feel No Pain' || !Number.isInteger(effect.ability.value) || effect.ability.value < 2 || effect.ability.value > 6)) throw new TypeError('Invalid MODEL ability');
      if (effect.operation === 'GRANT_ABILITY') validateAbilityGrant(book,effect);
      if (effect.operation === 'GRANT_WEAPON_ABILITY' && (typeof effect.ability !== 'string' || !effect.ability)) throw new TypeError('Invalid weapon ability');
      for (const id of [...(effect.weaponIds||[]),...(effect.excludeWeaponIds||[]),...(effect.equipmentRequirement?.excludeWeaponIds||[])]) if (records.get(id)?.kind !== 'WEAPON_PROFILE') throw new TypeError('Unresolved weapon identity');
      const sourceOwners = entity.kind==='ENHANCEMENT' && evaluatePredicate ? book.entities.filter(e=>e.kind==='DATASHEET').filter(unit=>unit.data.profileIds.some(id=> {
        const ownerRole=entity.ruleContract.roles.find(r=>r.id===entity.ruleContract.assignment.ownerRoleId);
        return evaluatePredicate(ownerRole.selector,{subject:ownerRole.subject,unitId:unit.id,modelId:id,keywords:new Set([...unit.data.keywords,...unit.data.factionKeywords]),abilities:new Set(),roster:{},battle:{}})==='TRUE';
      })).map(unit=>unit.id) : [entity.parentId];
      if (['SOURCE_MODEL','SOURCE_UNIT','SOURCE_UNIT_MODELS'].includes(effect.targetBinding)) {
        for (const id of [...(effect.weaponIds||[]),...(effect.excludeWeaponIds||[]),...(effect.equipmentRequirement?.excludeWeaponIds||[]),...(effect.equipmentRequirement?.equipmentId?[effect.equipmentRequirement.equipmentId]:[])]) {
          if (!sourceOwners.includes(records.get(id)?.parentId)) throw new TypeError('Foreign selected equipment owner');
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
/** Each clause is evaluated independently; no BATTLE action is ever executed. */
export function executeRosterEffects(book, state, {evaluatePredicate}) {
  const result = formRoster(book,state), records = new Map(book.entities.map(e=>[e.id,e]));
  const pending = [];
  for (const rule of book.entities.filter(e=>e.ruleContract)) {
    if (rule.ruleContract.detachmentId && !state.detachmentIds.includes(rule.ruleContract.detachmentId)) continue;
    const sources = rule.kind === 'ENHANCEMENT' ? result.units.filter(u=>u.enhancementIds.includes(rule.id)) : rule.kind === 'DETACHMENT_RULE' ? [null] : result.units.filter(u=>u.canonicalUnitId === rule.parentId);
    for (const source of sources) for (const clause of rule.ruleContract.clauses) {
      if (source && rule.kind === 'ENHANCEMENT' && rule.ruleContract.assignment) {
        const ownerRole=rule.ruleContract.roles.find(role=>role.id===rule.ruleContract.assignment.ownerRoleId);
        const context = enhancementOwnerContext(rule.ruleContract,predicateContext(state,result,source.instanceId,ownerRole.subject));
        const eligible = evaluatePredicate(rule.ruleContract.assignment.selector,context);
        if (eligible === 'INVALID') throw new TypeError('Invalid Enhancement owner context');
        if (eligible !== 'TRUE') continue;
      }
      if (clause.rosterClassification === 'BATTLE_ONLY') {
        for (const unit of source ? [source] : result.units) unit.conditional.push({ruleId:rule.id,clauseId:clause.id,state:'UNKNOWN',reason:clause.rosterClassificationNote.reason});
      }
      for (const effect of clause.rosterEffects) pending.push({rule,clause,effect,source});
    }
  }
  const targets = (source,effect) => {
    if (effect.targetBinding === 'ROSTER_UNITS') return result.units.map(unit=>({unit}));
    if (!source) throw new TypeError('Missing source physical instance');
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
  const eligible = ({rule,clause,effect,source}, target) => {
    const knownEquipment=effect.equipmentRequirement&&source?equipmentSatisfied(book,source,effect.equipmentRequirement):undefined;
    const extra = knownEquipment===undefined?{}:{equipmentRequirementSatisfied:knownEquipment};
    for (const condition of effect.conditions) {
      const subject = leaves(condition.predicate)[0].subject;
      const participant = condition.binding === 'SOURCE' ? source : target.unit;
      const ctx = predicateContext(state,result,participant?.instanceId,subject,condition.binding === 'TARGET' ? target.model?.scopeId : undefined,condition.binding === 'SOURCE' ? extra : {});
      if (!ctx) return false;
      if (effect.operation==='GRANT_ABILITY' && effect.unitScope==='PHYSICAL' && subject==='UNIT') {
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
    const {rule,clause,effect,source}=item;
    if (!conditionsChecked && !eligible(item,target)) return;
    const mutate = (object,key,after,targetModelId,targetWeaponId,weaponScope,recordUnchanged=false) => {
      const before = clone(object[key] ?? null);
      if (JSON.stringify(before) === JSON.stringify(after) && !recordUnchanged) return;
      object[key] = clone(after);
      target.unit.applied.push({ruleId:rule.id,clauseId:clause.id,effectId:effect.id,sourceInstanceId:source?.instanceId || null,targetInstanceId:target.unit.instanceId,
        targetModelInstanceId:targetModelId || null,targetProfileId:targetWeaponId ? weaponScope?.canonicalProfileId || null : target.model?.canonicalProfileId || null,targetCompositionId:targetWeaponId ? weaponScope?.scopeId || null : target.model?.scopeId || null,targetWeaponProfileId:targetWeaponId || null,operation:effect.operation,field:key,before,after:clone(after),sourceFields:clone(effect.sourceFields),lifetime:effect.lifetime,
        ...(effect.operation==='GRANT_ABILITY'?{targetAbilityId:effect.ability.canonicalId,abilityParameters:clone(effect.ability.parameters)}:{}),
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
    };
    const physicalAbility=effect.operation==='GRANT_ABILITY' && effect.unitScope==='PHYSICAL';
    const marker = `${rule.id}/${effect.id}/${source?.instanceId || 'roster'}/${target.model?.scopeId || (!physicalAbility && target.unit.formedUnitId) || target.unit.instanceId}`;
    if (processed.has(marker)) return;
    processed.add(marker);
    const group=effect.targetSubject==='UNIT' && !physicalAbility?result.formedUnits.find(g=>g.formedUnitId===target.unit.formedUnitId):null;
    const unitRecipients=group?result.units.filter(u=>group.memberInstanceIds.includes(u.instanceId)):[target.unit];
    if (effect.operation === 'GRANT_UNIT_KEYWORD') for (const unit of unitRecipients) {
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
    else if (effect.operation === 'GRANT_MODEL_ABILITY') {
      const existing = target.model.abilities.find(a=>a.name === effect.ability.name), next = clone(target.model.abilities.filter(a=>a.name !== effect.ability.name));
      next.push({name:effect.ability.name,value:Math.min(existing?.value ?? Infinity,effect.ability.value)});
      mutate(target.model,'abilities',next,target.model.modelInstanceId);
    } else if (effect.operation === 'MODIFY_RULE_METRIC') {
      if (group) { const metric=group.metrics[effect.field] || {modifier:0};group.metrics[effect.field]={modifier:metric.modifier+effect.value,...(effect.max?{max:Math.min(metric.max??Infinity,effect.max)}:{})}; }
      for (const unit of unitRecipients) {
        const object = target.model ? target.model.metrics : unit.metrics, before = object[effect.field] || {modifier:0};
        const original=target.unit;target.unit=unit;
        mutate(object,effect.field,{modifier:before.modifier + effect.value,...((effect.max || before.max) ? {max:Math.min(effect.max ?? Infinity,before.max ?? Infinity)} : {})},target.model?.modelInstanceId);
        target.unit=original;
      }
    } else if (effect.operation === 'MODIFY_STAT' && ['M','T','LD','OC','INSV'].includes(effect.field)) {
      if(effect.field==='INSV' && target.model.profile.INSV===undefined) {
        const referenceId=target.model.profile.invulnerableSaveId;
        if(referenceId) {
          const reference=records.get(referenceId);
          if(reference?.kind!=='INVULNERABLE_SAVE' || reference.parentId!==target.unit.canonicalUnitId ||
              !reference.data.profileIds.includes(target.model.canonicalProfileId))throw new TypeError('Unresolved invulnerable profile scope');
          target.model.profile.INSV=reference.data.value;
        }
      }
      if(!contributionUsed(target.model.scopeId))modifyCharacteristic(target.model.profile,effect.field,target.model.modelInstanceId);
    }
    else {
      const weaponRecipients=target.model?[target.unit]:unitRecipients;
      for (const unit of weaponRecipients) {
      const original=target.unit;target.unit=unit;
      const weapons = target.model ? [...target.model.weapons,...(effect.operation==='MODIFY_STAT' && unit.profiles.length>1 ? [] : unit.weapons)] : [...unit.weapons,...unit.profiles.flatMap(m=>m.weapons)];
      for (const weapon of weapons) {
        if (effect.weaponMode && weapon.data.mode !== effect.weaponMode || effect.weaponIds && !effect.weaponIds.includes(weapon.canonicalProfileId) || effect.excludeWeaponIds?.includes(weapon.canonicalProfileId)) continue;
        const weaponMarker = `${rule.id}/${effect.id}/${source?.instanceId || 'roster'}/${target.unit.instanceId}/${target.unit.weapons.includes(weapon) ? 'unit' : weapon.scopeId}/${weapon.selectionKey}/${weapon.canonicalProfileId}`;
        if (processed.has(weaponMarker)) continue; processed.add(weaponMarker);
        if(contributionUsed(`${unit.weapons.includes(weapon)?'unit':weapon.scopeId}/${weapon.selectionKey}/${weapon.canonicalProfileId}`))continue;
        if (effect.operation === 'GRANT_WEAPON_ABILITY') mutate(weapon.data,'abilities',weapon.data.abilities.some(ability=>ability.toUpperCase()===effect.ability.toUpperCase())?[...weapon.data.abilities]:[...weapon.data.abilities,effect.ability],weapon.modelInstanceId,weapon.canonicalProfileId,target.unit.weapons.includes(weapon)?null:target.model || target.unit.profiles.find(profile=>profile.scopeId===weapon.scopeId));
        else modifyCharacteristic(weapon.data,numericDomain[effect.field]?.field || effect.field,weapon.modelInstanceId,weapon.canonicalProfileId,target.unit.weapons.includes(weapon)?null:target.model || target.unit.profiles.find(profile=>profile.scopeId===weapon.scopeId));
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
    const bound=keyword.reduce((n,item)=>n+targets(item.source,item.effect).length,0)+1;
    for (let pass=0;pass<=bound;pass++) {
      const before=signature();
      if (seen.has(before)) throw new TypeError('Scoped keyword conditions did not converge');
      seen.add(before);
      // Conditions observe the previous complete projection, never a partial
      // ordering of grants/removals. Rebuild active contributions each pass.
      const active=keyword.flatMap(item=>targets(item.source,item.effect).filter(target=>eligible(item,target)).map(target=>({item,target})));
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
      for (const item of keyword) for (const target of targets(item.source,item.effect)) apply(item,target);
      refreshFormedKeywords(result);
      if (before === processed.size) break;
      if (pass === keyword.length) throw new TypeError('Keyword fixed point did not converge');
    }
  }
  const remaining=pending.filter(p=>!keywordOperations.has(p.effect.operation));
  if(remaining.some(p=>numericDomain[p.effect.field] || p.effect.canonicalContribution))
    remaining.sort((a,b)=>(numericDomain[a.effect.field]&&a.effect.mode==='SET'?0:1)-(numericDomain[b.effect.field]&&b.effect.mode==='SET'?0:1) ||
      a.rule.id.localeCompare(b.rule.id,'en') || a.effect.id.localeCompare(b.effect.id,'en') || (a.source?.instanceId||'').localeCompare(b.source?.instanceId||'','en'));
  for (const item of remaining) for (const target of targets(item.source,item.effect)) apply(item,target);
  for(const [object,fields]of numericValues)for(const [field,value]of fields)for(const row of value.rows)row.finalValue=clone(object[field]);
  for (const unit of result.units) {
    unit.conditional = unit.conditional.filter((row,i,rows)=>rows.findIndex(r=>r.ruleId===row.ruleId&&r.clauseId===row.clauseId&&r.reason===row.reason)===i);
    for (const model of unit.profiles) {
      for (const [field,metric] of Object.entries(unit.metrics)) {
        const own = model.metrics[field] || {modifier:0};
        model.metrics[field] = {modifier:own.modifier+metric.modifier,...((own.max||metric.max)?{max:Math.min(own.max??Infinity,metric.max??Infinity)}:{})};
      }
    }
  }
  return result;
}
