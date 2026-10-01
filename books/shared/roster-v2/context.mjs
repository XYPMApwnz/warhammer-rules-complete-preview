/** Physical roster state. Canonical records are read-only inputs, never mutable state. */
const copy = value => structuredClone(value);
const assert = (value, message) => { if (!value) throw new TypeError(message); };
const positive = value => Number.isSafeInteger(value) && value > 0;
export function validateRoster(book, state, policies) {
  assert(state?.schema === 'roster-v2/roster' && state.bookId === book.bookId, 'Invalid roster domain');
  assert(typeof state.rosterId === 'string' && state.rosterId.length, 'Missing physical namespace');
  const records = new Map(book.entities.map(e => [e.id, e]));
  assert(records.get(state.detachmentId)?.kind === 'DETACHMENT', 'Unresolved Detachment');
  assert(Array.isArray(state.units) && state.units.length && Array.isArray(state.attachments), 'Invalid physical collection');
  const ids = new Set();
  for (const unit of state.units) {
    assert(typeof unit.instanceId === 'string' && !ids.has(unit.instanceId), 'Duplicate physical instance'); ids.add(unit.instanceId);
    const canonical = records.get(unit.canonicalUnitId);
    assert(canonical?.kind === 'DATASHEET' && positive(unit.startingStrength), 'Unresolved canonical unit/composition');
    assert(Array.isArray(unit.modelRows) && unit.modelRows.length, 'Missing MODEL composition');
    assert(unit.modelRows.reduce((n, row) => n + row.quantity, 0) === unit.startingStrength, 'Starting Strength contradicts composition');
    const rows = new Set();
    for (const row of unit.modelRows) {
      assert(typeof row.rowId === 'string' && !rows.has(row.rowId), 'Duplicate MODEL row'); rows.add(row.rowId);
      assert(positive(row.quantity) && canonical.data.profileIds.includes(row.canonicalProfileId), 'Invalid MODEL profile/quantity');
      assert((row.loadouts || []).reduce((n, loadout) => n + loadout.quantity, 0) <= row.quantity, 'Overlapping model loadouts');
      for (const loadout of row.loadouts || []) assert(Number.isSafeInteger(loadout.quantity) && loadout.quantity >= 0, 'Invalid model loadout quantity');
    }
    for (const selection of selections(unit)) {
      assert(Number.isSafeInteger(selection.physicalQuantity) && selection.physicalQuantity >= 0, 'Invalid physical equipment quantity');
      assert(Array.isArray(selection.canonicalProfileIds) && Array.isArray(selection.canonicalEquipmentIds) && selection.canonicalProfileIds.length + selection.canonicalEquipmentIds.length > 0, 'Unresolved selected equipment');
      for (const id of selection.canonicalProfileIds) assert(canonical.data.weaponIds.includes(id) && records.get(id)?.kind === 'WEAPON_PROFILE', 'Foreign weapon profile');
      for (const id of selection.canonicalEquipmentIds) assert(records.get(id)?.parentId === canonical.id && ['WARGEAR_OPTION','WARGEAR_FOOTNOTE','DATASHEET_SECTION','SUPPLEMENTAL_DATASHEET_RULE'].includes(records.get(id)?.kind), 'Foreign equipment owner');
      for (const [id, paths] of Object.entries(selection.canonicalFieldPaths || {})) for (const pointer of paths) {
        let value = records.get(id)?.data;
        assert(selection.canonicalEquipmentIds.includes(id) && typeof pointer === 'string' && pointer.startsWith('/'), 'Invalid equipment field identity');
        for (const part of pointer.slice(1).split('/').map(p => p.replaceAll('~1','/').replaceAll('~0','~'))) value = value?.[part];
        assert(value !== undefined, 'Unresolved equipment field');
      }
    }
    assert(unit.warlord === null || typeof unit.warlord === 'boolean', 'Invalid imported Warlord state');
    assert(Array.isArray(unit.enhancementIds) && new Set(unit.enhancementIds).size === unit.enhancementIds.length, 'Invalid Enhancement ownership');
    for (const id of unit.enhancementIds) assert(records.get(id)?.kind === 'ENHANCEMENT' && records.get(id)?.parentId === state.detachmentId, 'Unresolved Enhancement context');
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
  const existing = state.attachments.filter(a => a.bodyguardInstanceId === bodyguardInstanceId);
  const all = [...existing.map(a => state.units.find(u => u.instanceId === a.leaderInstanceId)), source];
  if (all.length > 1) {
    const allowed = all.some(u => policies.some(p => p.sourceId === u.canonicalUnitId && p.targetId === target.canonicalUnitId && p.additionalLeaders === 1));
    if (!allowed || all.length > 2) return bad('Canonical Leader capacity exceeded');
    if (new Set(all.map(u => u.canonicalUnitId)).size !== all.length) return bad('Duplicate canonical Leader excluded');
  }
  return {valid:true, role:relation.role, sourceIds:relation.sourceIds};
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
  const units = state.units.map(raw => {
    const canonical = records.get(raw.canonicalUnitId), keywords = [...canonical.data.keywords,...canonical.data.factionKeywords];
    const models = raw.modelRows.flatMap(row => Array.from({length:row.quantity},(_,i) => {
      let offset = 0, loadout;
      for (const item of row.loadouts || []) { if (i >= offset && i < offset + item.quantity) loadout = item; offset += item.quantity; }
      const selected = [...row.selections,...(loadout?.selections || [])];
      return {subject:'MODEL',modelInstanceId:`${state.rosterId}/${raw.instanceId}/${row.rowId}/${i+1}`,unitInstanceId:raw.instanceId,
        canonicalProfileId:row.canonicalProfileId,canonicalUnitId:raw.canonicalUnitId,keywords:[...keywords],
        profile:copy(records.get(row.canonicalProfileId).data),abilities:canonical.data.ruleReferenceIds.flatMap(id=>copy(book.rosterReferenceSemantics?.[id]?.abilities || [])),metrics:{},
        selections:copy(selected),weapons:selected.flatMap(s => s.physicalQuantity ? s.canonicalProfileIds.map(id => ({modelInstanceId:`${state.rosterId}/${raw.instanceId}/${row.rowId}/${i+1}`,canonicalProfileId:id,physicalQuantity:s.perModelQuantity ?? s.physicalQuantity,selectionKey:s.selectionKey,data:copy(records.get(id).data)})) : [])};
    }));
    return {...copy(raw),subject:'UNIT',intrinsicKeywords:[...keywords],keywords:[...keywords],models,metrics:{},applied:[],conditional:[],
      weapons:(raw.selections || []).flatMap(s => s.physicalQuantity ? s.canonicalProfileIds.map(id => ({canonicalProfileId:id,physicalQuantity:s.physicalQuantity,selectionKey:s.selectionKey,data:copy(records.get(id).data)})) : [])};
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
  const projection = {schema:'roster-v2/effective',rosterId:state.rosterId,detachmentId:state.detachmentId,units,formedUnits};
  refreshFormedKeywords(projection);
  return projection;
}
export function refreshFormedKeywords(projection) {
  for (const group of projection.formedUnits) group.keywords = [...new Set(group.memberInstanceIds.flatMap(id=>projection.units.find(u=>u.instanceId===id).keywords))].sort();
}
export function predicateContext(state, projection, unitId, subject, modelId, extra = {}) {
  if (subject === 'ROSTER') return {subject,roster:{detachmentId:state.detachmentId,...extra},battle:{}};
  const unit = projection.units.find(u => u.instanceId === unitId);
  assert(unit, 'Unresolved physical context');
  const group = projection.formedUnits.find(g => g.formedUnitId === unit.formedUnitId);
  if (subject === 'FORMED_ATTACHED_UNIT' && !group) return null;
  const model = modelId ? unit.models.find(m => m.modelInstanceId === modelId) : unit.models[0];
  const members = group ? projection.units.filter(u=>group.memberInstanceIds.includes(u.instanceId)) : [unit];
  const roster = {detachmentId:state.detachmentId,leading:Boolean(group?.leaderInstanceIds.includes(unitId)),attached:Boolean(group),
    bodyguardId:group ? projection.units.find(u=>u.instanceId===group.bodyguardInstanceId).canonicalUnitId : null,
    characterModelCount:members.reduce((n,u)=>n+u.models.filter(m=>m.keywords.includes('CHARACTER')).length,0),
    hasFriendlyCharacterLeader:Boolean(group?.leaderInstanceIds.some(id=>projection.units.find(u=>u.instanceId===id).intrinsicKeywords.includes('CHARACTER'))),
    hasAtLeastTwoLeaderUnits:(group?.leaderInstanceIds.length || 0)>=2,
    modelFromYourArmy:true,isBodyguardModel:Boolean(group&&group.bodyguardInstanceId===unitId),
    isWarlord:subject==='MODEL' ? unit.warlord : members.some(u=>u.warlord===true),...extra};
  if (unit.warlord === null && subject === 'MODEL') delete roster.isWarlord;
  const abilityNames = (subject==='MODEL'?[model]:members.flatMap(u=>u.models)).flatMap(m=>m.abilities.map(a=>a.name));
  return {subject,unitId:subject==='MODEL'?unit.canonicalUnitId:group?projection.units.find(u=>u.instanceId===group.bodyguardInstanceId).canonicalUnitId:unit.canonicalUnitId,
    modelId:model?.canonicalProfileId,keywords:new Set(subject==='MODEL'?model?.keywords:group?group.keywords:unit.keywords),abilities:new Set(abilityNames),roster,battle:{}};
}
