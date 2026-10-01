/** Independent application parity oracle. Canonical V2 entity.data,
 * entity.qualifications and supplied centralized MFM records are factual inputs.
 * No presentation imports.
 * Addresses identify fields within their existing canonical owner, never a new
 * gameplay entity. Unknown fields fail closed instead of silently disappearing.
 */
const fail = message => { throw new Error(`Army Book App V2 fact oracle: ${message}`); };
export const factPointer = path => '/' + path.map(key => String(key).replace(/~/g, '~0').replace(/\//g, '~1')).join('/');
export const factIdentity = (entityId, path) => `${entityId}::${factPointer(path)}`;
const patterns = rules => rules.map(([pattern, reason]) => [new RegExp(`^(?:${pattern})$`), reason]);
const commonDataExclusions = patterns([
  ['/(?:order|sourceOrder)', 'presentation ordering'],
  ['/(?:class|filterId|detachmentCode)', 'presentation classification or navigation code'],
  ['/(?:url|sourceBadges)(?:/.*)?', 'source URL or source publication metadata'],
  ['/(?:profileIds|weaponIds|sectionIds|wargearOptionIds|ruleReferenceIds|rawFactIds|componentIds|ruleId|enhancementIds|stratagemIds)(?:/.*)?', 'canonical child references; gameplay facts are enumerated on their canonical child owner'],
  ['/visuals(?:/.*)?', 'source illustration asset paths; numerical rules are covered by text and tables'],
  ['/flavor', 'non-gameplay narrative'],
  ['/sourceUpdateIds(?:/.*)?', 'source directive provenance references'],
  ['/tableSourceOccurrences(?:/.*)?', 'table capture provenance and duplicate layout wrapper references'],
  ['/tables/[0-9]+/sourceId', 'table evidence address within the existing rule owner'],
  ['/clauses/[0-9]+/sourceLeafId', 'source evidence address within the existing introduction owner']
]);
const entityVisible = Object.freeze({
  PROFILE: ['/(?:M|T|SV|W|LD|OC|INSV)'],
  WEAPON_PROFILE: ['/(?:name|mode|range|attacks|skill|strength|ap|damage)', '/abilities(?:/[0-9]+)?'],
  DATASHEET_SECTION: ['/title', '/blocks/[0-9]+/(?:text|wargearAbility)'],
  RULE_REFERENCE: ['/label'],
  MODEL_BASE: ['/(?:text|scope)'],
  DATASHEET: ['/title', '/(?:keywords|factionKeywords)/[0-9]+'],
  WARGEAR_OPTION: ['/text'],
  SUPPLEMENTAL_DATASHEET_RULE: ['/text'],
  WARGEAR_FOOTNOTE: ['/text'],
  ARMY_RULE_COMPONENT: ['/(?:title|text)', '/table/[0-9]+/[0-9]+'],
  ARMY_RULE: ['/(?:title|text)'],
  DETACHMENT: ['/title'],
  DETACHMENT_RULE: ['/(?:title|text)', '/tables/[0-9]+/rows/[0-9]+/[0-9]+'],
  ENHANCEMENT: ['/(?:title|text)'],
  STRATAGEM: ['/(?:title|cp|category)', '/lines/[0-9]+/(?:label|text)'],
  SOURCE_ERRATUM: ['/(?:title|text|directive|operation)', '/targetBindings/[0-9]+/targetId', '/targetBindings/[0-9]+/field/[0-9]+'],
  BOOK_USAGE_RULES: ['/clauses/[0-9]+/text'],
  WEAPON_PROFILE_SELECTION: ['/text', '/profileGroups/[0-9]+/profileGroupId', '/profileGroups/[0-9]+/profileIds/[0-9]+']
});
const structuralEmpty = patterns([
  ['/tables', 'no rule tables in this canonical rule'],
  ['/(?:keywords|factionKeywords)', 'no keyword entries'],
  ['/table', 'no table cells'],
  ['/blocks', 'no section block entries'],
  ['/lines', 'no Stratagem line entries'],
  ['/clauses', 'no introduction clause entries']
]);
const mfmCommonExcluded = patterns([
  ['/(?:id|recordType|factionId|armyBookId)', 'canonical record identity/type/owner context'],
  ['/(?:aliases|references|provenance)(?:/.*)?', 'identity aliases, record graph references or source provenance'],
  ['/(?:unitReferenceId|pricingGroupId|unitPointRecordId|sourceUnitPointRecordId|sourceUnitReferenceId|detachmentId|armyDetachmentId|armyEnhancementId|ownerId|armyOwnerId)', 'existing canonical owner or central binding context'],
  ['/(?:mfmForceDispositionIds|missionForceDispositionIds)(?:/.*)?', 'cross-domain identity binding duplicates; forceDispositionIds is the effective gameplay reference'],
  ['/(?:enhancementCostIds|qualifierIds)(?:/.*)?', 'canonical child references; child gameplay fields are enumerated separately'],
  ['/rawMfmTargetUnitReferenceIds(?:/.*)?', 'raw-source relation evidence duplicate; targetUnitReferenceIds is the effective target vector']
]);
const mfmVisible = Object.freeze({
  MFM_UNIT_POINTS: ['/label', '/(?:status|sourceGroup)', '/pointSchedules/[0-9]+/(?:sourceLabel|minCopies|maxCopies)', '/pointSchedules/[0-9]+/entries/[0-9]+/(?:sourceLabel|minModels|maxModels|value)'],
  MFM_PAID_UPGRADE: ['/(?:label|status|sourceGroup|sourceLabel|value)'],
  MFM_LEADER_ELIGIBILITY: ['/(?:label|status)', '/targetUnitReferenceIds(?:/[0-9]+)?'],
  MFM_SUPPORT_ELIGIBILITY: ['/(?:label|status)', '/targetUnitReferenceIds(?:/[0-9]+)?'],
  MFM_DETACHMENT: ['/(?:label|detachmentPoints)', '/forceDispositionIds/[0-9]+'],
  MFM_ENHANCEMENT_COST: ['/(?:label|value)'],
  MFM_QUALIFIER: ['/(?:label|ownerKind|kind)', '/values/[0-9]+']
});
const entityEnvelopeExclusions = Object.freeze({
  id: 'existing canonical owner identity',
  kind: 'canonical entity classification; the gameplay data are enumerated separately',
  parentId: 'canonical parent identity and context; not a competing gameplay fact',
  provenance: 'source evidence and capture provenance',
  fieldProvenance: 'per-field source evidence and overlay provenance',
  type: 'legacy classification alias of WEAPON_PROFILE_SELECTION',
  ruleContract: 'derived Rule Contract V2 semantics, identity bindings and source references; player-facing declarations remain canonical data/qualifications'
});
const qualificationVisible = visibleSpecification([
  '/qualifications/[0-9]+/value/(?:sourceText|inflictsMortalWoundsEveryTurn|contagionRangeCap)'
]);
const qualificationExcluded = patterns([
  ['/qualifications/[0-9]+/(?:field|sourceId|provenance)(?:/.*)?', 'qualification target field address, source identity or source provenance'],
  ['/qualifications/[0-9]+/value/(?:qualificationId|faqId|verifiedFields)(?:/.*)?', 'qualification identity or official field-confirmation evidence; not a gameplay value']
]);
function visibleSpecification(specifications) {
  return patterns(specifications.map(specification => [specification, 'player-visible gameplay fact']));
}
function validateQualification(entity, qualification, index) {
  const label = `${entity.id}/qualifications/${index}`;
  if (!qualification || typeof qualification !== 'object' || Array.isArray(qualification)) fail(`malformed qualification ${label}`);
  const required = ['field', 'value', 'sourceId', 'provenance'];
  if (Object.keys(qualification).some(key => !required.includes(key)) || required.some(key => !Object.hasOwn(qualification, key))) fail(`unknown/missing qualification shape ${label}`);
  if (!Array.isArray(qualification.field) || !qualification.field.length || qualification.field.some(key => typeof key !== 'string' && !Number.isInteger(key)) || !qualification.sourceId || !qualification.provenance || typeof qualification.provenance !== 'object' || Array.isArray(qualification.provenance)) fail(`malformed qualification metadata ${label}`);
  if (qualification.field.reduce((value, key) => value?.[key], entity.data) === undefined) fail(`qualification addresses absent data field ${label}`);
  const value = qualification.value;
  if (!value || typeof value !== 'object' || Array.isArray(value) || !Object.keys(value).length) fail(`malformed qualification value ${label}`);
  const allowed = ['qualificationId', 'faqId', 'verifiedFields', 'sourceText', 'inflictsMortalWoundsEveryTurn', 'contagionRangeCap'];
  if (Object.keys(value).some(key => !allowed.includes(key))) fail(`unknown qualification value field ${label}`);
  for (const field of ['qualificationId', 'faqId', 'sourceText']) if (Object.hasOwn(value, field) && typeof value[field] !== 'string') fail(`malformed qualification ${field} ${label}`);
  if (Object.hasOwn(value, 'verifiedFields') && (!Array.isArray(value.verifiedFields) || !value.verifiedFields.length || value.verifiedFields.some(field => typeof field !== 'string' || !Object.hasOwn(entity.data, field)))) fail(`malformed confirmation field references ${label}`);
  if (Object.hasOwn(value, 'inflictsMortalWoundsEveryTurn') && typeof value.inflictsMortalWoundsEveryTurn !== 'boolean') fail(`malformed FAQ qualification flag ${label}`);
  if (Object.hasOwn(value, 'contagionRangeCap') && (typeof value.contagionRangeCap !== 'number' || !Number.isFinite(value.contagionRangeCap))) fail(`malformed contagion cap qualification ${label}`);
}
const matches = (rules, pointer) => rules.find(([expression]) => expression.test(pointer));
const visiblePatterns = specifications => patterns(specifications.map(specification => [specification, 'player-visible gameplay fact']));
/** Returns leaf facts; exclusions are available on result.exclusions. `path`
 * addresses entity.data by default, entity.qualifications when beginning with
 * 'qualifications', raw central MFM records, or book.mfm for relation facts.
 * Meaningful empty weapon ability/eligibility vectors remain explicit facts.
 */
export function enumerateExpectedFacts(model, mfmRecords) {
  if (!Array.isArray(model?.entities) || !(mfmRecords instanceof Map)) fail('canonical model and Map of owned MFM records required');
  const facts = [], exclusions = [], identities = new Set(), entities = new Map();
  const add = (entityId, path, value, contextId, extras = {}) => {
    const id = factIdentity(entityId, path);
    if (identities.has(id)) fail(`duplicate factual field identity ${id}`);
    identities.add(id);
    facts.push({id, entityId, path: [...path], value: structuredClone(value), contextId, ...extras});
  };
  const walk = (entityId, value, path, contextId, visible, excluded, extras) => {
    const pointer = factPointer(path), exclusion = matches(excluded, pointer);
    if (exclusion) { exclusions.push({entityId, path: [...path], reason: exclusion[1]}); return; }
    if (Array.isArray(value)) {
      if (!value.length) {
        if (matches(visible, pointer)) add(entityId, path, value, contextId, extras);
        else if (matches(structuralEmpty, pointer)) exclusions.push({entityId, path: [...path], reason: matches(structuralEmpty, pointer)[1]});
        else fail(`unclassified empty field ${entityId}${pointer}`);
        return;
      }
      value.forEach((entry, index) => walk(entityId, entry, [...path, index], contextId, visible, excluded, extras));
    } else if (value !== null && typeof value === 'object') {
      if (!Object.keys(value).length) fail(`unclassified empty object ${entityId}${pointer}`);
      for (const [key, entry] of Object.entries(value)) walk(entityId, entry, [...path, key], contextId, visible, excluded, extras);
    } else if (matches(visible, pointer)) add(entityId, path, value, contextId, extras);
    else fail(`unclassified canonical field ${entityId}${pointer}`);
  };
  for (const entity of model.entities) {
    if (!entity.id || entities.has(entity.id)) fail(`duplicate/missing canonical identity ${entity.id}`);
    entities.set(entity.id, entity);
    if (!entityVisible[entity.kind]) fail(`unknown canonical entity kind ${entity.kind}`);
    for (const key of Object.keys(entity)) {
      if (key === 'data' || key === 'qualifications') continue;
      const reason = entityEnvelopeExclusions[key];
      if (!reason) fail(`unknown canonical entity envelope field ${entity.id}/${key}`);
      if (key === 'type' && (entity.kind !== 'WEAPON_PROFILE_SELECTION' || entity.type !== 'weapon-profile-selection')) fail(`unknown canonical type alias ${entity.id}/${entity.type}`);
      exclusions.push({entityId: entity.id, path: [key], reason});
    }
    walk(entity.id, entity.data, [], entity.parentId || entity.id, visiblePatterns(entityVisible[entity.kind]), commonDataExclusions, {ownerType: 'CANONICAL_V2'});
    if (Object.hasOwn(entity, 'qualifications')) {
      if (!Array.isArray(entity.qualifications)) fail(`malformed qualification collection ${entity.id}`);
      for (const [index, qualification] of entity.qualifications.entries()) {
        validateQualification(entity, qualification, index);
        walk(entity.id, qualification, ['qualifications', index], entity.parentId || entity.id, qualificationVisible, qualificationExcluded, {ownerType: 'CANONICAL_V2', sourceContainer: 'ENTITY_QUALIFICATIONS'});
      }
    }
  }
  const bindingFields = ['unitBindings', 'detachmentBindings', 'enhancementBindings', 'paidUpgradeBindings'];
  const centralContexts = new Map(), required = new Set();
  for (const field of bindingFields) for (const binding of model.mfm?.[field] || []) {
    if (!entities.has(binding.entityId)) fail(`unresolved MFM binding owner ${binding.entityId}`);
    required.add(binding.mfmRecordId); centralContexts.set(binding.mfmRecordId, binding.entityId);
  }
  for (const [index, relation] of (model.mfm?.relations || []).entries()) {
    if (!entities.has(relation.sourceId) || !entities.has(relation.targetId)) fail(`unresolved relation endpoints ${relation.sourceId}/${relation.targetId}`);
    const ownerId = relation.mfmRecordId || relation.sourceEntityId;
    if (relation.mfmRecordId) { required.add(relation.mfmRecordId); centralContexts.set(relation.mfmRecordId, relation.sourceId); }
    else if (!entities.has(ownerId)) fail(`unresolved relation qualification owner ${ownerId}`);
    for (const [field, value] of Object.entries(relation)) {
      const path = ['mfm', 'relations', index, field];
      if (['role', 'sourceId', 'targetId', 'qualification'].includes(field)) add(model.bookId, path, value, relation.sourceId, {ownerType: relation.owner, factualOwnerId: ownerId});
      else if (['entityId', 'mfmRecordId', 'recordType', 'owner', 'sourceEntityId', 'provenance', 'acceptedBindingEvidence'].includes(field)) exclusions.push({entityId: model.bookId, path, reason: 'relation canonical owner/binding/provenance metadata'});
      else fail(`unclassified relation field ${field}`);
    }
  }
  // Follow all gameplay-bearing child bindings independently of payload output.
  for (const id of required) {
    const record = mfmRecords.get(id);
    if (!record || record.id !== id || record.factionId !== model.bookId) fail(`missing or wrong-scope central record ${id}`);
    for (const childId of [...(record.qualifierIds || []), ...(record.enhancementCostIds || [])]) {
      required.add(childId);
      if (!centralContexts.has(childId)) centralContexts.set(childId, centralContexts.get(id));
    }
  }
  for (const id of required) {
    const record = mfmRecords.get(id);
    if (!mfmVisible[record.recordType]) fail(`unknown owned central record type ${record.recordType}`);
    walk(id, record, [], centralContexts.get(id), visiblePatterns(mfmVisible[record.recordType]), mfmCommonExcluded, {ownerType: 'CENTRALIZED_MFM'});
  }
  Object.defineProperty(facts, 'exclusions', {value: exclusions, enumerable: false});
  return facts;
}
