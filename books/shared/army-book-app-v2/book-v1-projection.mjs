/** Disposable V1 book layout over canonical/effective V2 records.
 * Existing presentation fields retain their IDs, values and factual owner.
 * This module selects layout and canonical relationships; it interprets no rules.
 */
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';

const supportedKinds = new Set([
  'BOOK_USAGE_RULES', 'ARMY_RULE', 'ARMY_RULE_COMPONENT', 'DETACHMENT',
  'DETACHMENT_RULE', 'ENHANCEMENT', 'STRATAGEM', 'SOURCE_ERRATUM'
]);
const clone = value => structuredClone(value);
const ownedField = (entity, owned, path, label, value) => ({
  id: `${owned.id}::${path}`, label, value: clone(value), type: 'text',
  contextId: entity.id, source: {entityId: owned.id, path}
});

export function projectBookPresentation(model, ownedRecords) {
  const entities = new Map(model.entities.map(entity => [entity.id, entity]));
  if (entities.size !== model.entities.length) throw new Error('Duplicate book presentation identity');
  const forceBindings = createEffectiveMfmCatalog().catalog.crossDomainBindings.forceDispositionBindings;
  const detachmentBindings = new Map(model.mfm.detachmentBindings.map(binding => [binding.entityId, binding]));
  const enhancementBindings = new Map(model.mfm.enhancementBindings.map(binding => [binding.entityId, binding]));
  const records = {};
  const requireEntity = (id, kind, parentId) => {
    const entity = entities.get(id);
    if (!entity || entity.kind !== kind || entity.parentId !== parentId) {
      throw new Error(`Unresolved/wrong book presentation relationship: ${id}`);
    }
    return id;
  };
  for (const entity of model.entities) {
    if (!supportedKinds.has(entity.kind)) continue;
    const record = records[entity.id] = {
      id: entity.id, kind: entity.kind, parentId: entity.parentId,
      contextId: entity.parentId || entity.id, source: {entityId: entity.id},
      provenance: clone(entity.provenance || {}),
      fieldProvenance: clone(entity.fieldProvenance || {}),
      tables: []
    };
    if (Array.isArray(entity.data.table)) record.tables.push({
      id: `${entity.id}::/table`, path: '/table'
    });
    for (const [tableIndex, table] of (entity.data.tables || []).entries()) {
      record.tables.push({
        id: `${entity.id}::/tables/${tableIndex}/rows`, path: `/tables/${tableIndex}/rows`,
        ...(table.columns ? {columns: clone(table.columns)} : {})
      });
    }
    if (entity.kind === 'ARMY_RULE') record.componentIds = (entity.data.componentIds || [])
      .map(id => requireEntity(id, 'ARMY_RULE_COMPONENT', entity.id));
    if (entity.kind === 'DETACHMENT') {
      record.ruleId = requireEntity(entity.data.ruleId, 'DETACHMENT_RULE', entity.id);
      if(entity.data.ruleIds?.length>1) {
        if(new Set(entity.data.ruleIds).size!==entity.data.ruleIds.length||entity.data.ruleIds[0]!==record.ruleId)
          throw new Error('Duplicate/inconsistent Detachment rule presentation');
        record.ruleIds=entity.data.ruleIds.map(id=>requireEntity(id,'DETACHMENT_RULE',entity.id));
      }
      record.enhancementIds = entity.data.enhancementIds.map(id => requireEntity(id, 'ENHANCEMENT', entity.id));
      record.stratagemIds = entity.data.stratagemIds.map(id => requireEntity(id, 'STRATAGEM', entity.id));
    }
    const binding = entity.kind === 'DETACHMENT' ? detachmentBindings.get(entity.id)
      : entity.kind === 'ENHANCEMENT' ? enhancementBindings.get(entity.id) : null;
    if (entity.kind === 'DETACHMENT' || entity.kind === 'ENHANCEMENT') {
      if (!binding || !ownedRecords.has(binding.mfmRecordId)) throw new Error(`Missing bound MFM presentation owner: ${entity.id}`);
      const owned = ownedRecords.get(binding.mfmRecordId);
      record.pointRecordId = owned.id;
      record.qualifierRecordIds = clone(owned.qualifierIds || []);
      for (const id of record.qualifierRecordIds) if (!ownedRecords.has(id)) throw new Error(`Unresolved MFM qualifier: ${id}`);
      record.mfmProvenance = clone(owned.provenance);
      if (entity.kind === 'ENHANCEMENT') record.pointsFieldId = `${owned.id}::/value`;
      else {
        record.detachmentPoints = ownedField(entity, owned, '/detachmentPoints', 'Detachment Points', owned.detachmentPoints);
        record.forceDispositions = (owned.mfmForceDispositionIds || []).map((id, index) => {
          const force = forceBindings[id];
          if (!force || force.missionForceDispositionId !== owned.forceDispositionIds[index]) {
            throw new Error(`Unresolved/wrong MFM Force Disposition binding: ${id}`);
          }
          return {...ownedField(entity, owned, `/forceDispositionIds/${index}`, 'Force Disposition', owned.forceDispositionIds[index]), displayValue: force.sourceValue};
        });
      }
    }
  }
  return {schema: 'army-book-app-v2/book-v1-presentation', records};
}
