import {formRoster, predicateContext, refreshFormedKeywords, selections} from './context.mjs';
const clone = value => structuredClone(value);
const operations = new Set(['MODIFY_STAT','GRANT_WEAPON_ABILITY','GRANT_MODEL_ABILITY','GRANT_UNIT_KEYWORD','MODIFY_RULE_METRIC']);
const bindingSubjects = {SOURCE_MODEL:'MODEL',SOURCE_UNIT:'UNIT',SOURCE_UNIT_MODELS:'MODEL',SOURCE_FORMED_MODELS:'MODEL',LEADERS_OF_SOURCE:'MODEL',ROSTER_UNITS:'UNIT'};
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
      if (effect.operation === 'MODIFY_STAT' && (!['M','T','LD','OC','attacks','strength','damage'].includes(effect.field) || !['ADD','SET'].includes(effect.mode) || !Number.isFinite(effect.value))) throw new TypeError('Invalid characteristic operation');
      if (effect.operation === 'MODIFY_RULE_METRIC' && (!['contagionRange','detectionRange'].includes(effect.field) || effect.mode !== 'ADD' || !Number.isFinite(effect.value))) throw new TypeError('Invalid metric operation');
      if (effect.operation === 'GRANT_UNIT_KEYWORD' && (effect.targetSubject !== 'UNIT' || typeof effect.keyword !== 'string' || !effect.keyword)) throw new TypeError('Invalid UNIT keyword grant');
      if (effect.operation === 'GRANT_MODEL_ABILITY' && (effect.targetSubject !== 'MODEL' || effect.ability?.name !== 'Feel No Pain' || !Number.isInteger(effect.ability.value) || effect.ability.value < 2 || effect.ability.value > 6)) throw new TypeError('Invalid MODEL ability');
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
  const raw = String(before), suffix = raw.endsWith('"') ? '"' : raw.endsWith('+') && /^\d+\+$/.test(raw) ? '+' : '';
  if (effect.mode === 'SET') return `${effect.value}${suffix}`;
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
        const context = predicateContext(state,result,source.instanceId,ownerRole.subject);
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
  const apply = ({rule,clause,effect,source}, target) => {
    const knownEquipment=effect.equipmentRequirement&&source?equipmentSatisfied(book,source,effect.equipmentRequirement):undefined;
    const extra = knownEquipment===undefined?{}:{equipmentRequirementSatisfied:knownEquipment};
    for (const condition of effect.conditions) {
      const subject = leaves(condition.predicate)[0].subject;
      const participant = condition.binding === 'SOURCE' ? source : target.unit;
      const ctx = predicateContext(state,result,participant?.instanceId,subject,condition.binding === 'TARGET' ? target.model?.scopeId : undefined,condition.binding === 'SOURCE' ? extra : {});
      if (!ctx) return;
      const status = evaluatePredicate(condition.predicate,ctx);
      if (status === 'INVALID') throw new TypeError('Invalid roster predicate: '+rule.id+'/'+effect.id);
      if (status !== 'TRUE') { if (status === 'UNKNOWN') target.unit.conditional.push({ruleId:rule.id,clauseId:clause.id,state:status,reason:'Roster context unavailable'}); return; }
    }
    const mutate = (object,key,after,targetModelId,targetWeaponId,weaponScope) => {
      const before = clone(object[key] ?? null);
      if (JSON.stringify(before) === JSON.stringify(after)) return;
      object[key] = clone(after);
      target.unit.applied.push({ruleId:rule.id,clauseId:clause.id,effectId:effect.id,sourceInstanceId:source?.instanceId || null,targetInstanceId:target.unit.instanceId,
        targetModelInstanceId:targetModelId || null,targetProfileId:targetWeaponId ? weaponScope?.canonicalProfileId || null : target.model?.canonicalProfileId || null,targetCompositionId:targetWeaponId ? weaponScope?.scopeId || null : target.model?.scopeId || null,targetWeaponProfileId:targetWeaponId || null,operation:effect.operation,field:key,before,after:clone(after),sourceFields:clone(effect.sourceFields),lifetime:effect.lifetime});
    };
    const marker = `${rule.id}/${effect.id}/${source?.instanceId || 'roster'}/${target.model?.scopeId || target.unit.formedUnitId || target.unit.instanceId}`;
    if (processed.has(marker)) return;
    processed.add(marker);
    const group=effect.targetSubject==='UNIT'?result.formedUnits.find(g=>g.formedUnitId===target.unit.formedUnitId):null;
    const unitRecipients=group?result.units.filter(u=>group.memberInstanceIds.includes(u.instanceId)):[target.unit];
    if (effect.operation === 'GRANT_UNIT_KEYWORD') for (const unit of unitRecipients) {
      const original=target.unit;target.unit=unit;
      mutate(unit,'keywords',[...new Set([...unit.keywords,effect.keyword])].sort());target.unit=original;
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
    } else if (effect.operation === 'MODIFY_STAT' && ['M','T','LD','OC'].includes(effect.field)) mutate(target.model.profile,effect.field,changeStat(target.model.profile[effect.field],effect),target.model.modelInstanceId);
    else {
      const weaponRecipients=target.model?[target.unit]:unitRecipients;
      for (const unit of weaponRecipients) {
      const original=target.unit;target.unit=unit;
      const weapons = target.model ? [...target.model.weapons,...unit.weapons] : [...unit.weapons,...unit.profiles.flatMap(m=>m.weapons)];
      for (const weapon of weapons) {
        if (effect.weaponMode && weapon.data.mode !== effect.weaponMode || effect.weaponIds && !effect.weaponIds.includes(weapon.canonicalProfileId) || effect.excludeWeaponIds?.includes(weapon.canonicalProfileId)) continue;
        const weaponMarker = `${rule.id}/${effect.id}/${source?.instanceId || 'roster'}/${target.unit.instanceId}/${target.unit.weapons.includes(weapon) ? 'unit' : weapon.scopeId}/${weapon.selectionKey}/${weapon.canonicalProfileId}`;
        if (processed.has(weaponMarker)) continue; processed.add(weaponMarker);
        if (effect.operation === 'GRANT_WEAPON_ABILITY') mutate(weapon.data,'abilities',weapon.data.abilities.some(ability=>ability.toUpperCase()===effect.ability.toUpperCase())?[...weapon.data.abilities]:[...weapon.data.abilities,effect.ability],weapon.modelInstanceId,weapon.canonicalProfileId,target.unit.weapons.includes(weapon)?null:target.model || target.unit.profiles.find(profile=>profile.scopeId===weapon.scopeId));
        else mutate(weapon.data,effect.field,changeStat(weapon.data[effect.field],effect),weapon.modelInstanceId,weapon.canonicalProfileId,target.unit.weapons.includes(weapon)?null:target.model || target.unit.profiles.find(profile=>profile.scopeId===weapon.scopeId));
      }
      target.unit=original;
      }
    }
  };
  // Monotone keyword grants establish the known vocabulary before dependent effects.
  const keyword = pending.filter(p=>p.effect.operation === 'GRANT_UNIT_KEYWORD');
  for (let pass = 0; pass <= keyword.length; pass++) {
    const before = processed.size;
    for (const item of keyword) for (const target of targets(item.source,item.effect)) apply(item,target);
    refreshFormedKeywords(result);
    if (before === processed.size) break;
    if (pass === keyword.length) throw new TypeError('Keyword fixed point did not converge');
  }
  for (const item of pending.filter(p=>p.effect.operation !== 'GRANT_UNIT_KEYWORD')) for (const target of targets(item.source,item.effect)) apply(item,target);
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
