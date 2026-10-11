/** Roster UNIT instances. Composition/profile scopes are not individual-model simulations. */
const copy = value => structuredClone(value);
const assert = (value, message) => { if (!value) throw new TypeError(message); };
const positive = value => Number.isSafeInteger(value) && value > 0;
/** Legacy scalar snapshots are migrated only at the input boundary. Instances
 * preserve imported occurrences; the canonical set controls rule membership. */
function normalizeDetachments(input) {
  const state = copy(input);
  if (!state) return state;
  if (state.detachments === undefined) {
    const ids = state.detachmentIds ?? (state.detachmentId === undefined ? [] : [state.detachmentId]);
    assert(Array.isArray(ids), 'Invalid Detachment collection');
    state.detachments = ids.map((canonicalDetachmentId, index) => ({instanceId:`detachment/${index+1}`,canonicalDetachmentId}));
  }
  assert(Array.isArray(state.detachments) && state.detachments.length, 'Missing imported Detachments');
  const ids = [...new Set(state.detachments.map(item => item?.canonicalDetachmentId))];
  if (state.detachmentIds !== undefined) assert(Array.isArray(state.detachmentIds) && JSON.stringify(state.detachmentIds) === JSON.stringify(ids), 'Contradictory Detachment identities');
  if (state.detachmentId !== undefined) assert(ids.length === 1 && ids[0] === state.detachmentId, 'Contradictory legacy Detachment identity');
  state.detachmentIds = ids;
  delete state.detachmentId;
  return state;
}
/** Resolve membership at the roster boundary, then delegate all selector,
 * boolean, subject and result semantics to the existing Rule Contract engine.
 * Contracts and their scalar build/browsing context remain unchanged. */
export function withRosterDetachments(api) {
  const bind = (node, context) => {
    if (node?.op) return {...node,args:node.args.map(child => bind(child,context))};
    if (node?.predicate !== 'DETACHMENT' || !Object.hasOwn(context.roster || {},'detachmentIds')) return node;
    const ids = context.roster.detachmentIds;
    assert(Array.isArray(ids) && ids.every(id => typeof id === 'string'), 'Invalid roster Detachment context');
    const state = api.evaluatePredicate(node,{...context,roster:{...context.roster,detachmentId:ids.includes(node.arguments?.id)?node.arguments.id:null}});
    if (!['TRUE','FALSE'].includes(state)) return node;
    const known = {predicate:'ALWAYS',subject:node.subject,contextLevel:'STATIC',arguments:{}};
    return state === 'TRUE' ? known : {op:'NOT',args:[known]};
  };
  return {...api,
    evaluatePredicate:(node,context) => api.evaluatePredicate(bind(node,context),context),
    evaluateRole:(role,conditions,context) => api.evaluateRole({...role,selector:bind(role.selector,context),conditions:(role.conditions || []).map(node=>bind(node,context))},
      conditions.map(node=>bind(node,node.subject==='ROSTER'?{...context,subject:'ROSTER'}:context)),context)};
}
export function validateRoster(book, state, policies) {
  state = normalizeDetachments(state);
  assert(state?.schema === 'roster-v2/roster' && state.bookId === book.bookId, 'Invalid roster domain');
  assert(typeof state.rosterId === 'string' && state.rosterId.length, 'Missing physical namespace');
  const records = new Map(book.entities.map(e => [e.id, e]));
  const detachmentInstances = new Set();
  for (const item of state.detachments) {
    assert(typeof item.instanceId === 'string' && item.instanceId.length && !detachmentInstances.has(item.instanceId), 'Duplicate or missing Detachment instance');
    detachmentInstances.add(item.instanceId);
    assert(records.get(item.canonicalDetachmentId)?.kind === 'DETACHMENT', 'Unresolved Detachment');
  }
  assert(Array.isArray(state.units) && state.units.length && Array.isArray(state.attachments), 'Invalid physical collection');
  const ids = new Set();
  for (const unit of state.units) {
    assert(typeof unit.instanceId === 'string' && !ids.has(unit.instanceId), 'Duplicate physical instance'); ids.add(unit.instanceId);
    const canonical = records.get(unit.canonicalUnitId);
    assert(canonical?.kind === 'DATASHEET' && positive(unit.startingStrength), 'Unresolved canonical unit/composition');
    const validOption=id=>{
      let record=records.get(id);const visited=new Set();
      if(record?.kind!=='UPGRADE_OPTION')return false;
      while(record&&!visited.has(record.id)) {
        if(record.id===canonical.id||state.detachmentIds.includes(record.id))return true;
        visited.add(record.id);record=records.get(record.parentId);
      }
      return false;
    };
    assert(Array.isArray(unit.modelRows) && unit.modelRows.length, 'Missing profile composition');
    assert(unit.modelRows.reduce((n, row) => n + row.quantity, 0) === unit.startingStrength, 'Starting Strength contradicts composition');
    const rows = new Set();
    for (const row of unit.modelRows) {
      assert(typeof row.rowId === 'string' && !rows.has(row.rowId), 'Duplicate MODEL row'); rows.add(row.rowId);
      assert(row.compositionScope === undefined || ['UNIT','MODEL_ROW'].includes(row.compositionScope), 'Invalid composition scope');
      assert(positive(row.quantity) && canonical.data.profileIds.includes(row.canonicalProfileId), 'Invalid MODEL profile/quantity');
      assert((row.loadouts || []).reduce((n, loadout) => n + loadout.quantity, 0) <= row.quantity, 'Overlapping model loadouts');
      const loadoutIds = new Set();
      for (const loadout of row.loadouts || []) {
        assert(typeof loadout.loadoutId==='string' && loadout.loadoutId.length && !loadoutIds.has(loadout.loadoutId), 'Missing or duplicate composition loadout identity');
        loadoutIds.add(loadout.loadoutId);
        assert(Number.isSafeInteger(loadout.quantity) && loadout.quantity >= 0, 'Invalid model loadout quantity');
      }
    }
    const exclusiveOptions=new Map();
    for (const selection of selections(unit)) {
      assert(Number.isSafeInteger(selection.physicalQuantity) && selection.physicalQuantity >= 0, 'Invalid physical equipment quantity');
      const optionIds=selection.canonicalOptionIds||[];
      assert(Array.isArray(optionIds)&&new Set(optionIds).size===optionIds.length&&optionIds.every(validOption),'Unresolved selected option');
      if(optionIds.length) {
        assert(/^selected[A-Z]\w*Ids?$/.test(selection.selectionField)&&['ONE','MANY'].includes(selection.selectionCardinality),'Invalid canonical option field/cardinality');
        const value=unit[selection.selectionField];
        assert(selection.selectionCardinality==='ONE'?optionIds.length===1&&value===optionIds[0]:
          Array.isArray(value)&&new Set(value).size===value.length&&value.every(validOption)&&optionIds.every(id=>value.includes(id)),'Contradictory selected option state');
      }
      if(selection.exclusiveGroupId) {
        assert(optionIds.length===1&&records.get(optionIds[0]).parentId===selection.exclusiveGroupId,'Invalid exclusive selection group');
        assert(!exclusiveOptions.has(selection.exclusiveGroupId)||exclusiveOptions.get(selection.exclusiveGroupId)===optionIds[0],'Contradictory exclusive choices');
        exclusiveOptions.set(selection.exclusiveGroupId,optionIds[0]);
      }
      assert(Array.isArray(selection.canonicalProfileIds) && Array.isArray(selection.canonicalEquipmentIds) && selection.canonicalProfileIds.length + selection.canonicalEquipmentIds.length + optionIds.length > 0, 'Unresolved selected equipment');
      for (const id of selection.canonicalProfileIds) assert(canonical.data.weaponIds.includes(id) && records.get(id)?.kind === 'WEAPON_PROFILE', 'Foreign weapon profile');
      for (const id of selection.canonicalEquipmentIds) assert(records.get(id)?.parentId === canonical.id && ['WARGEAR_OPTION','WARGEAR_FOOTNOTE','DATASHEET_SECTION','SUPPLEMENTAL_DATASHEET_RULE','UNIT_COMPOSITION'].includes(records.get(id)?.kind), 'Foreign equipment owner');
      for (const [id, paths] of Object.entries(selection.canonicalFieldPaths || {})) for (const pointer of paths) {
        let value = records.get(id)?.data;
        assert(selection.canonicalEquipmentIds.includes(id) && typeof pointer === 'string' && pointer.startsWith('/'), 'Invalid equipment field identity');
        for (const part of pointer.slice(1).split('/').map(p => p.replaceAll('~1','/').replaceAll('~0','~'))) value = value?.[part];
        assert(value !== undefined, 'Unresolved equipment field');
      }
      // Optional source occurrences are canonical display references only.
      // Existing snapshots without these references remain valid; a consumer
      // must not infer their identity from a title or gameplay prose.
      if (selection.sourceReferences !== undefined) {
        assert(Array.isArray(selection.sourceReferences), 'Invalid equipment source references');
        const seenReferences=new Set();
        for (const reference of selection.sourceReferences) {
          const record=records.get(reference?.entityId),match=typeof reference?.path==='string' && reference.path.match(/^\/blocks\/(0|[1-9]\d*)\/text$/);
          assert(record?.parentId===canonical.id && ['WARGEAR_OPTION','WARGEAR_FOOTNOTE','DATASHEET_SECTION','SUPPLEMENTAL_DATASHEET_RULE'].includes(record.kind) && match, 'Foreign equipment source reference');
          const block=record.data.blocks?.[Number(match[1])],key=reference.entityId+reference.path;
          assert(block?.wargearAbility===true && typeof block.text==='string' && !seenReferences.has(key), 'Unresolved equipment source reference');
          seenReferences.add(key);
        }
      }
    }
    assert(unit.warlord === null || typeof unit.warlord === 'boolean', 'Invalid imported Warlord state');
    assert(Array.isArray(unit.enhancementIds) && new Set(unit.enhancementIds).size === unit.enhancementIds.length, 'Invalid Enhancement ownership');
    for (const id of unit.enhancementIds) assert(records.get(id)?.kind === 'ENHANCEMENT' && state.detachmentIds.includes(records.get(id)?.parentId), 'Unresolved Enhancement context');
    // Optional exact bearer selections refer to existing physical composition
    // scopes. They supplement ownership; they never assign an Enhancement.
    if (unit.enhancementAssignments !== undefined) {
      assert(Array.isArray(unit.enhancementAssignments), 'Invalid Enhancement bearer assignments');
      const assigned = new Set();
      for (const assignment of unit.enhancementAssignments) {
        assert(assignment && Object.keys(assignment).every(key => ['enhancementId','modelScopeId'].includes(key)) &&
          unit.enhancementIds.includes(assignment.enhancementId) && !assigned.has(assignment.enhancementId) &&
          typeof assignment.modelScopeId === 'string' && assignment.modelScopeId.length,
          'Invalid or duplicate Enhancement bearer assignment');
        assigned.add(assignment.enhancementId);
      }
    }
  }
  const warlords = state.units.filter(u => u.warlord === true);
  assert(warlords.length <= 1 && (warlords[0]?.instanceId || null) === state.warlordInstanceId, 'Ambiguous imported Warlord identity');
  const empty = {...state, attachments: []};
  for (const attachment of state.attachments) {
    const result = attachmentCheck(book, empty, policies, attachment.leaderInstanceId, attachment.bodyguardInstanceId);
    assert(result.valid && (!attachment.role || result.role === attachment.role), result.reason || 'Invalid attachment role');
    empty.attachments.push(copy(attachment));
  }
  return copy(state);
}
export function selections(unit) {
  return [...(unit.selections || []), ...(unit.modelRows || []).flatMap(row => [...(row.selections || []), ...(row.loadouts || []).flatMap(loadout => loadout.selections || [])])];
}
export function attachmentCheck(book, state, policies, leaderInstanceId, bodyguardInstanceId) {
  const bad = reason => ({valid:false, reason});
  const source = state.units.find(u => u.instanceId === leaderInstanceId), target = state.units.find(u => u.instanceId === bodyguardInstanceId);
  if (!source || !target || source === target) return bad('Distinct physical Leader and Bodyguard required');
  if (state.attachments.some(a => a.leaderInstanceId === leaderInstanceId || a.bodyguardInstanceId === leaderInstanceId || a.leaderInstanceId === bodyguardInstanceId)) return bad('Physical instance already belongs to a formed unit');
  const relation = policies.find(p => p.sourceId === source.canonicalUnitId && p.targetId === target.canonicalUnitId);
  if (!relation) return bad('No canonical attachment relation');
  if (!attachmentPermission(book,state,relation,source,target)) return bad('Canonical attachment prerequisite not satisfied');
  const sourceIds=[...new Set([...relation.sourceIds,...(book.rosterAttachmentConstraints||[])
    .filter(constraint=>state.detachmentIds.includes(constraint.detachmentId)).flatMap(constraint=>constraint.sourceIds)])];
  const existing = state.attachments.filter(a => a.bodyguardInstanceId === bodyguardInstanceId);
  const all = [...existing.map(a => state.units.find(u => u.instanceId === a.leaderInstanceId)), source];
  if (all.length > 1) {
    const relations=all.map(unit=>policies.find(policy=>policy.sourceId===unit.canonicalUnitId&&policy.targetId===target.canonicalUnitId));
    if (relations.some(policy=>policy.role==='SUPPORT')) {
      // Ordinary Support is a separate Core role, not an extra-Leader
      // exception. Each role has one slot; explicit book exceptions retain
      // their existing interpretation below.
      if (relations.some(policy=>!['LEADER','SUPPORT'].includes(policy.role)) ||
          relations.filter(policy=>policy.role==='SUPPORT').length>1 ||
          relations.filter(policy=>policy.role==='LEADER').length>1) return bad('Canonical Leader/Support capacity exceeded');
      return {valid:true,role:relation.role,sourceIds};
    }
    const allowed = all.some(u => policies.some(p => p.sourceId === u.canonicalUnitId && p.targetId === target.canonicalUnitId && p.additionalLeaders === 1));
    if (!allowed || all.length > 2) return bad('Canonical Leader capacity exceeded');
    if (new Set(all.map(u => u.canonicalUnitId)).size !== all.length) return bad('Duplicate canonical Leader excluded');
  }
  return {valid:true, role:relation.role, sourceIds};
}
export function changeAttachment(book, state, policies, action, leaderId, bodyguardId) {
  assert(state?.units.some(u=>u.instanceId===leaderId), 'Unresolved physical attachment identity');
  const next = copy(state);
  if (action === 'DETACH' || action === 'REATTACH') next.attachments = next.attachments.filter(a => a.leaderInstanceId !== leaderId);
  if (action === 'ATTACH' || action === 'REATTACH') {
    const result = attachmentCheck(book, next, policies, leaderId, bodyguardId);
    assert(result.valid, result.reason);
    next.attachments.push({leaderInstanceId:leaderId,bodyguardInstanceId:bodyguardId,role:result.role});
  } else assert(action === 'DETACH', 'Unknown attachment action');
  next.attachments.sort((a,b) => a.leaderInstanceId.localeCompare(b.leaderInstanceId,'en'));
  return validateRoster(book,next,policies);
}
export function formRoster(book, state) {
  const records = new Map(book.entities.map(e => [e.id,e]));
  const profileBindings = book.rosterProfileBindings === undefined ? null : new Map();
  if (profileBindings) {
    assert(Array.isArray(book.rosterProfileBindings), 'Invalid intrinsic MODEL bindings');
    for (const binding of book.rosterProfileBindings) {
      const unit = records.get(binding.unitId), profile = records.get(binding.profileId);
      assert(unit?.kind === 'DATASHEET' && profile?.kind === 'PROFILE' && profile.parentId === unit.id &&
        unit.data.profileIds.includes(profile.id) && !profileBindings.has(profile.id) &&
        Array.isArray(binding.intrinsicKeywords) && binding.intrinsicKeywords.every(key => typeof key === 'string' && key),
        'Unresolved or duplicate intrinsic MODEL binding');
      profileBindings.set(profile.id, binding);
    }
    for (const unit of book.entities.filter(e => e.kind === 'DATASHEET'))
      assert(unit.data.profileIds.every(id => profileBindings.has(id)), 'Incomplete intrinsic MODEL bindings');
  }
  const units = state.units.map(raw => {
    const canonical = records.get(raw.canonicalUnitId), keywords = [...canonical.data.keywords,...canonical.data.factionKeywords];
    // One semantic MODEL profile per imported composition/loadout group. Quantity
    // never creates physical infantry IDs. Singleton units already identify their
    // sole model; explicit one-model rows can additionally identify that row.
    const profiles = raw.modelRows.flatMap(row => {
      const allocated = (row.loadouts || []).reduce((n,item)=>n+item.quantity,0);
      const groups = [...(row.loadouts || []).map(item=>({kind:'LOADOUT',key:item.loadoutId,quantity:item.quantity,selections:item.selections})),
        {kind:'PROFILE',key:row.rowId,quantity:row.quantity-allocated,selections:[]}].filter(group=>group.quantity>0);
      return groups.map(group => {
        const scopeId = `${raw.instanceId}/${row.rowId}/${group.kind}/${group.key}`;
        const modelInstanceId = raw.startingStrength===1 ? raw.instanceId :
          row.compositionScope==='MODEL_ROW' && row.quantity===1 ? `${state.rosterId}/${raw.instanceId}/${row.rowId}` : null;
        const selected = [...row.selections,...group.selections];
        const weapons = [...row.selections.map(selection=>({selection,count:row.quantity})),
          ...group.selections.map(selection=>({selection,count:group.quantity}))].flatMap(({selection:s,count})=> {
          if (!s.physicalQuantity) return [];
          const physicalQuantity = (s.perModelQuantity ?? s.physicalQuantity/count)*group.quantity;
          if (s.canonicalProfileIds.length) assert(Number.isSafeInteger(physicalQuantity), 'Ambiguous grouped weapon quantity');
          return s.canonicalProfileIds.map(id=>({modelInstanceId,scopeId,canonicalProfileId:id,physicalQuantity,selectionKey:s.selectionKey,data:copy(records.get(id).data)}));
        });
        return {subject:'MODEL',scopeId,quantity:group.quantity,modelInstanceId,unitInstanceId:raw.instanceId,
          canonicalProfileId:row.canonicalProfileId,canonicalUnitId:raw.canonicalUnitId,
          ...(profileBindings ? {intrinsicKeywords:[...profileBindings.get(row.canonicalProfileId).intrinsicKeywords]} : {}),
          keywords:[...(profileBindings?.get(row.canonicalProfileId).intrinsicKeywords || keywords)],
          profile:copy(records.get(row.canonicalProfileId).data),abilities:canonical.data.ruleReferenceIds.flatMap(id=>copy(book.rosterReferenceSemantics?.[id]?.abilities || [])),metrics:{},
          selections:copy(selected),weapons};
      });
    });
    const modelVocabulary = profileBindings ? new Set(canonical.data.profileIds.flatMap(id => profileBindings.get(id).intrinsicKeywords)) : null;
    const unitKeywords = modelVocabulary ? [...new Set([...keywords.filter(key => !modelVocabulary.has(key)),
      ...profiles.flatMap(profile => profile.keywords)])].sort() : [...keywords];
    return {...copy(raw),subject:'UNIT',intrinsicKeywords:[...keywords],keywords:unitKeywords,profiles,metrics:{},applied:[],conditional:[],
      weapons:(raw.selections || []).flatMap(s => s.physicalQuantity ? s.canonicalProfileIds.map(id => ({modelInstanceId:raw.startingStrength===1?raw.instanceId:null,canonicalProfileId:id,physicalQuantity:s.physicalQuantity,selectionKey:s.selectionKey,data:copy(records.get(id).data)})) : [])};
  });
  const formedUnits = [];
  for (const bodyguardId of [...new Set(state.attachments.map(a => a.bodyguardInstanceId))].sort()) {
    const leaders = state.attachments.filter(a => a.bodyguardInstanceId === bodyguardId).map(a => a.leaderInstanceId).sort();
    const members = [bodyguardId,...leaders];
    const group = {subject:'FORMED_ATTACHED_UNIT',formedUnitId:`${state.rosterId}/formed/${bodyguardId}`,bodyguardInstanceId:bodyguardId,
      leaderInstanceIds:leaders,memberInstanceIds:members,startingStrength:members.reduce((n,id)=>n+units.find(u=>u.instanceId===id).startingStrength,0),keywords:[],metrics:{}};
    formedUnits.push(group);
    for (const unit of units.filter(u => members.includes(u.instanceId))) unit.formedUnitId = group.formedUnitId;
  }
  const projection = {schema:'roster-v2/effective',rosterId:state.rosterId,detachments:copy(state.detachments),detachmentIds:[...state.detachmentIds],units,formedUnits};
  refreshFormedKeywords(projection);
  return projection;
}
export function refreshFormedKeywords(projection) {
  for (const group of projection.formedUnits) group.keywords = [...new Set(group.memberInstanceIds.flatMap(id=>projection.units.find(u=>u.instanceId===id).keywords))].sort();
}
export function predicateContext(state, projection, unitId, subject, modelId, extra = {}) {
  if (subject === 'ROSTER') return {subject,roster:{detachmentIds:[...state.detachmentIds],...extra},battle:{}};
  const unit = projection.units.find(u => u.instanceId === unitId);
  assert(unit, 'Unresolved physical context');
  const group = projection.formedUnits.find(g => g.formedUnitId === unit.formedUnitId);
  if (subject === 'FORMED_ATTACHED_UNIT' && !group) return null;
  const model = modelId ? unit.profiles.find(m => m.scopeId === modelId || m.modelInstanceId === modelId) : unit.profiles.length===1 ? unit.profiles[0] : null;
  if (subject==='MODEL' && !model) return null;
  const members = group ? projection.units.filter(u=>group.memberInstanceIds.includes(u.instanceId)) : [unit];
  const roster = {detachmentIds:[...state.detachmentIds],leading:Boolean(group?.leaderInstanceIds.includes(unitId)),attached:Boolean(group),
    bodyguardId:group ? projection.units.find(u=>u.instanceId===group.bodyguardInstanceId).canonicalUnitId : null,
    characterModelCount:members.reduce((n,u)=>n+u.profiles.filter(m=>m.keywords.includes('CHARACTER')).reduce((count,m)=>count+m.quantity,0),0),
    hasFriendlyCharacterLeader:Boolean(group?.leaderInstanceIds.some(id=>projection.units.find(u=>u.instanceId===id).intrinsicKeywords.includes('CHARACTER'))),
    hasAtLeastTwoLeaderUnits:(group?.leaderInstanceIds.length || 0)>=2,
    modelFromYourArmy:true,isBodyguardModel:Boolean(group&&group.bodyguardInstanceId===unitId),
    ...extra};
  // Imported identity belongs to this physical roster entry. Neither leading
  // a Warlord nor sharing its formed-unit keywords confers Warlord ownership.
  if(typeof unit.warlord==='boolean')roster.isWarlord=unit.warlord;
  else delete roster.isWarlord;
  const abilityNames = (subject==='MODEL'?[model]:members.flatMap(u=>u.profiles)).flatMap(m=>m.abilities.map(a=>a.name));
  if(subject!=='MODEL')abilityNames.push(...((subject==='FORMED_ATTACHED_UNIT'?group.abilities:unit.abilities) || []).map(ability=>ability.name));
  return {subject,instanceId:unit.instanceId,formedUnitId:group?.formedUnitId||null,
    unitId:subject==='MODEL'?unit.canonicalUnitId:group?projection.units.find(u=>u.instanceId===group.bodyguardInstanceId).canonicalUnitId:unit.canonicalUnitId,
    owner:{unitId:unit.canonicalUnitId,keywords:new Set(subject==='MODEL'?model.keywords:unit.keywords),unknownKeywords:new Set()},
    modelId:model?.canonicalProfileId,intrinsicKeywords:new Set(subject==='MODEL' ? model.intrinsicKeywords || unit.intrinsicKeywords : unit.intrinsicKeywords),keywords:new Set(subject==='MODEL'?model?.keywords:group?group.keywords:unit.keywords),abilities:new Set(abilityNames),roster,battle:{}};
}

// Typed, book-bound roster prerequisites. This checks attachment permission;
// it does not grant keywords, execute effects or change component facts.
export function attachmentPermission(book,state,policy,source,target) {
  const detachedIds=state.detachmentIds||[];
  if(policy.availability&&!policy.availability.some(requirement=>
    detachedIds.includes(requirement.detachmentId)&&source.enhancementIds.includes(requirement.enhancementId)))return false;
  if(!book.rosterAttachmentConstraints?.length)return true;
  const records=new Map(book.entities.map(entity=>[entity.id,entity]));
  const keywords=(unit,constraint)=>{
    const data=records.get(unit.canonicalUnitId).data;
    return new Set([...data.keywords,...data.factionKeywords,
      ...selections(unit).flatMap(selection=>(selection.canonicalOptionIds||[]).map(id=>constraint.optionKeywords[id]).filter(Boolean))]);
  };
  for(const constraint of book.rosterAttachmentConstraints||[]) {
    if(!detachedIds.includes(constraint.detachmentId))continue;
    const left=keywords(source,constraint),right=keywords(target,constraint);
    if(!constraint.sharedKeywords.some(keyword=>left.has(keyword)&&right.has(keyword)))return false;
  }
  return true;
}

export function validateAttachmentConditions(book,policies) {
  const records=new Map(book.entities.map(entity=>[entity.id,entity]));
  const assert=(condition,message)=>{if(!condition)throw new TypeError(message);};
  for(const policy of policies)if(policy.availability!==undefined) {
    assert(Array.isArray(policy.availability)&&policy.availability.length,'Empty attachment availability');
    for(const requirement of policy.availability)assert(
      records.get(requirement.detachmentId)?.kind==='DETACHMENT'&&
      records.get(requirement.enhancementId)?.kind==='ENHANCEMENT'&&
      records.get(requirement.enhancementId).parentId===requirement.detachmentId&&
      policy.sourceIds.includes(requirement.enhancementId),'Unbound attachment availability');
  }
  for(const constraint of book.rosterAttachmentConstraints||[])assert(
    records.get(constraint.detachmentId)?.kind==='DETACHMENT'&&
    Array.isArray(constraint.sharedKeywords)&&constraint.sharedKeywords.length&&
    constraint.sharedKeywords.every(keyword=>typeof keyword==='string'&&keyword)&&
    constraint.optionKeywords&&Object.entries(constraint.optionKeywords).every(([id,keyword])=>
      records.get(id)?.kind==='UPGRADE_OPTION'&&constraint.sharedKeywords.includes(keyword))&&
    Array.isArray(constraint.sourceIds)&&constraint.sourceIds.length&&constraint.sourceIds.every(id=>records.has(id)),
    'Unbound attachment constraint');
}
