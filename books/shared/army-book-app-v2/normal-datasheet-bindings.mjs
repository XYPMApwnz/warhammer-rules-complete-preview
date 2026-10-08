/** Normal-book presentation relations. Facts and roster projections stay immutable. */
export function buildNormalDatasheetBindings(model, records, bindings = {}) {
  const entities = new Map(model.entities.map(entity => [entity.id, entity]));
  const requireEntity = (id, kind, unitId) => {
    const entity = entities.get(id);
    if (!entity || kind && entity.kind !== kind || unitId && entity.parentId !== unitId)
      throw new TypeError('Invalid canonical presentation binding: ' + id);
    return entity;
  };
  const selections = new Map(), costs = new Map(), abilities = new Map();
  const addSelection = selection => {
    requireEntity(selection.unitId, 'DATASHEET');
    if (!selection.groupId || !selection.text || !selection.profileIds?.length)
      throw new TypeError('Incomplete profile selection binding');
    const profiles = selection.profileIds.map(id => requireEntity(id, 'WEAPON_PROFILE', selection.unitId));
    if (new Set(selection.profileIds).size !== profiles.length || new Set(profiles.map(p => p.data.mode)).size !== 1)
      throw new TypeError('Invalid profile selection scope');
    const key = JSON.stringify([selection.unitId, selection.groupId]);
    const previous = selections.get(key);
    if (previous && (previous.text !== selection.text || JSON.stringify(previous.profileIds) !== JSON.stringify(selection.profileIds)))
      throw new TypeError('Conflicting profile selection binding');
    if (!previous) selections.set(key, structuredClone(selection));
  };
  for (const entity of model.entities.filter(entity => entity.kind === 'WEAPON_PROFILE_SELECTION')) {
    for (const group of entity.data.profileGroups || entity.data.groups || []) addSelection({
      unitId: entity.parentId, instructionId: entity.id,
      groupId: group.profileGroupId || group.id,
      profileIds: group.profileIds || group.weaponProfileIds,
      text: entity.data.text, source: entity.provenance
    });
  }
  for (const binding of bindings.profileSelections || []) {
    if (!binding.source?.sourceId || !binding.source.pointer || !binding.source.sha256)
      throw new TypeError('Missing profile selection source evidence');
    addSelection(binding);
  }
  for (const binding of bindings.optionCosts || []) {
    requireEntity(binding.unitId, 'DATASHEET');
    const item = requireEntity(binding.itemId, null, binding.unitId);
    if (!['WEAPON_PROFILE', 'WARGEAR_OPTION'].includes(item.kind)) throw new TypeError('Invalid priced option kind');
    for (const id of binding.optionIds || []) requireEntity(id, 'WARGEAR_OPTION', binding.unitId);
    const cost = records.get(binding.costRecordId);
    if (cost?.recordType !== 'MFM_PAID_UPGRADE' || !Number.isFinite(cost.value))
      throw new TypeError('Unresolved canonical option cost: ' + binding.costRecordId);
    // A unit-reference binding is authoritative when supplied by the book.
    const unitBinding = model.mfm?.unitBindings?.find(entry => entry.entityId === binding.unitId);
    const unitPoints = unitBinding && records.get(unitBinding.mfmRecordId);
    if (unitPoints && cost.unitReferenceId !== unitPoints.unitReferenceId)
      throw new TypeError('Wrong canonical option cost owner');
    const key = JSON.stringify([binding.unitId, binding.itemId]);
    const previous = costs.get(key);
    if (previous && previous.costRecordId !== binding.costRecordId) throw new TypeError('Conflicting option cost binding');
    if (!previous) costs.set(key, {...structuredClone(binding), valueField: {
      id: cost.id + '::/value', label: 'Points', value: cost.value, type: 'text',
      contextId: binding.unitId, source: {entityId: cost.id, path: '/value'}
    }});
  }
  for (const binding of bindings.boundAbilities || []) {
    requireEntity(binding.unitId, 'DATASHEET');
    const item = requireEntity(binding.itemId, null, binding.unitId);
    if (!['WEAPON_PROFILE', 'WARGEAR_OPTION'].includes(item.kind)) throw new TypeError('Invalid ability item kind');
    const rule = requireEntity(binding.ruleId, null, binding.unitId);
    if (binding.fieldPath !== '/text' || typeof rule.data.text !== 'string')
      throw new TypeError('Invalid bound ability field');
    const previous = abilities.get(binding.ruleId);
    if (previous && previous.itemId !== binding.itemId) throw new TypeError('Conflicting ability item binding');
    if (!previous) abilities.set(binding.ruleId, structuredClone(binding));
  }
  return {basePlacement: 'composition', profileSelections: [...selections.values()],
    optionCosts: [...costs.values()], boundAbilities: [...abilities.values()]};
}

/** Personal Guide deliberately retains its existing projection and layout. */
export const selectsNormalDatasheetBindings = (config, instanceId) => instanceId ? null : config.normal;
