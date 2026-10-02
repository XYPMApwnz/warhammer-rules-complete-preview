// Raw New Recruit text is parsed by an injected lexical parser. Canonical facts
// are resolved exclusively through explicit IDs and their existing ownership.
const own = (record, key) => record && Object.hasOwn(record, key) ? record[key] : undefined;
const clone = value => structuredClone(value);
const equipmentKinds = new Set(['WARGEAR_OPTION', 'WARGEAR_FOOTNOTE', 'DATASHEET_SECTION', 'SUPPLEMENTAL_DATASHEET_RULE']);
const quantity = value => Number.isSafeInteger(value) && value >= 0;

function splitGear(value) {
  const parts = [], text = String(value || '');
  let depth = 0, start = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '(' || text[i] === '[') depth++;
    if (text[i] === ')' || text[i] === ']') depth = Math.max(0, depth - 1);
    if (text[i] === ',' && depth === 0) { parts.push(text.slice(start, i)); start = i + 1; }
  }
  parts.push(text.slice(start));
  return parts.map(item => item.trim()).filter(Boolean);
}

function rawSelections(value, key, scope, modelQuantity) {
  return splitGear(value).map((rawText, i) => {
    const prefix = rawText.match(/^(\d+)\s*(?:[x×]\s*|\s+)(\S.*)$/i);
    const selectedQuantity = prefix ? Number(prefix[1]) : 1;
    const scoped = scope !== 'UNIT';
    return {key: `${key}/selection/${i + 1}`, rawText, label: prefix ? prefix[2].trim() : rawText,
      explicitQuantity: Boolean(prefix), perModelQuantity: scoped ? selectedQuantity : null,
      physicalQuantity: scoped ? selectedQuantity * modelQuantity : prefix ? selectedQuantity : null,
      quantityEvidence: {scope, modelQuantity: scoped ? modelQuantity : null, selectedQuantity,
        explicitSelectedQuantity: Boolean(prefix)}};
  });
}

export function lexicalDraft(rawText, parse) {
  if (typeof parse !== 'function') throw new TypeError('An independent lexical parse function is required');
  const sourceText = String(rawText ?? ''), parsed = parse(sourceText);
  if (!parsed || !Array.isArray(parsed.units)) throw new TypeError('Malformed lexical parser result');
  const units = parsed.units.map((raw, i) => {
    const id = `parsed-unit-${i + 1}`;
    if (raw.id && raw.id !== id) throw new TypeError('Lexical physical unit identity changed');
    const modelRows = (raw.models || []).map((row, j) => {
      const key = `${id}/model-row/${j + 1}`;
      return {key, name: row.name, quantity: row.quantity,
        selections: rawSelections(row.wargear, key, 'MODEL_ROW', row.quantity),
        loadouts: (row.loadouts || []).map((loadout, k) => ({key: `${key}/loadout/${k + 1}`,
          quantity: loadout.quantity,
          selections: rawSelections(loadout.wargear, `${key}/loadout/${k + 1}`, 'LOADOUT', loadout.quantity)}))};
    });
    return {id, name: raw.name, sourceRef: raw.sourceRef || '', rawQuantity: raw.quantity,
      points: raw.points, warlord: raw.warlord ?? null, modelRows,
      selections: rawSelections(raw.wargear, `${id}/unit`, 'UNIT', null)};
  });
  const enhancements = (parsed.enhancements || []).map((item, i) => ({...clone(item), key: `enhancement/${i + 1}`}));
  const metadata = {};
  for (const key of ['faction', 'detachment', 'detachments', 'disposition', 'declared', 'battleSize', 'pointsLimit', 'unitLineTotal']) {
    if (parsed[key] !== undefined) metadata[key] = clone(parsed[key]);
  }
  const importedDetachments = parsed.detachments ?? (parsed.detachment && parsed.detachment !== '—' ? [{label:parsed.detachment}] : []);
  if (!Array.isArray(importedDetachments)) throw new TypeError('Malformed imported Detachment collection');
  const detachments = Array.from(importedDetachments,(item, index) => ({...clone(item),key:`detachment/${index+1}`}));
  return {schema: 'roster-v2/lexical-draft', sourceText, metadata, detachments, units, enhancements,
    warnings: [...(parsed.warnings || [])]};
}

function defaultRosterId(text) {
  let hash = 14695981039346656037n;
  for (const byte of new TextEncoder().encode(text)) hash = BigInt.asUintN(64, (hash ^ BigInt(byte)) * 1099511628211n);
  return `import-${hash.toString(16).padStart(16, '0')}`;
}

function fieldExists(data, pointer) {
  if (typeof pointer !== 'string' || !pointer.startsWith('/')) return false;
  let value = data;
  for (const part of pointer.slice(1).split('/').map(token => token.replaceAll('~1', '/').replaceAll('~0', '~'))) {
    if (value === null || typeof value !== 'object' || !Object.hasOwn(value, part)) return false;
    value = value[part];
  }
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

export function importNewRecruit(rawText, {parse, bindings = {}, book, rosterId} = {}) {
  const errors = [], needsBindings = [];
  let draft;
  try { draft = lexicalDraft(rawText, parse); }
  catch (error) { return {schema: 'roster-v2/import-result', status: 'INVALID', draft: null,
    roster: null, needsBindings, errors: [{code: 'INVALID_LEXICAL_INPUT', key: 'input', message: error.message}]}; }
  const issue = (code, key, message) => errors.push({code, key, message});
  const need = (kind, key, rawLabel, ownerId = null) => needsBindings.push({kind, key, rawLabel, ownerId});
  if (!book || !Array.isArray(book.entities) || typeof book.bookId !== 'string' || !book.bookId) issue('INVALID_BOOK', 'book', 'An effective canonical book with a canonical book ID is required');
  if (!bindings || typeof bindings !== 'object' || Array.isArray(bindings)) {
    issue('INVALID_BINDINGS', 'bindings', 'Explicit binding dictionaries are required');
    bindings = {};
  }
  for (const key of ['detachments', 'units', 'profiles', 'selections', 'enhancements']) {
    if (bindings[key] !== undefined && (!bindings[key] || typeof bindings[key] !== 'object' || Array.isArray(bindings[key]))) {
      issue('INVALID_BINDINGS', key, 'Explicit bindings must use a key-to-ID dictionary');
    }
  }
  const entities = new Map((book?.entities || []).map(entity => [entity.id, entity]));
  if (entities.size !== (book?.entities || []).length) issue('INVALID_BOOK', 'book', 'Duplicate canonical identity');
  if (!draft.units.length) issue('EMPTY_IMPORT', 'units', 'No supported New Recruit unit lines found');
  // Parser diagnostics concern contradictory imported identity metadata, not
  // army-building legality. An absent Warlord is allowed and remains unknown.
  if (draft.warnings.some(warning => /Warlord (?:metadata|owner)/i.test(warning))) {
    issue('AMBIGUOUS_WARLORD_IDENTITY', 'warlord', 'Lexical parser could not resolve imported Warlord identity');
  }
  const exact = (id, kind, key, rawLabel, ownerId) => {
    if (id === undefined || id === null || id === '') { need(kind, key, rawLabel, ownerId); return null; }
    if (typeof id !== 'string') { issue('AMBIGUOUS_BINDING', key, 'Binding must contain one explicit canonical ID'); return null; }
    const entity = entities.get(id);
    if (!entity || entity.kind !== kind) { issue('INVALID_CANONICAL_BINDING', key, `Unknown or wrong-kind canonical ID: ${id}`); return null; }
    return entity;
  };
  // Headerless supported exports still need one explicit canonical selection.
  // Never collapse multiple imported occurrences into the legacy scalar binding.
  const importedDetachments = draft.detachments.length ? draft.detachments : [{key:'detachment/1',label:draft.metadata.detachment}];
  if (bindings.detachmentId !== undefined && importedDetachments.length !== 1) issue('AMBIGUOUS_DETACHMENT_BINDING','detachments','A scalar binding cannot resolve multiple imported Detachments');
  for (const key of Object.keys(bindings.detachments || {})) if (!importedDetachments.some(item=>item.key===key)) issue('FOREIGN_DETACHMENT_BINDING',key,'Detachment binding does not identify an imported occurrence');
  const detachments = importedDetachments.map(raw => {
    const explicit = own(bindings.detachments,raw.key);
    if (explicit !== undefined && bindings.detachmentId !== undefined && explicit !== bindings.detachmentId) issue('CONFLICTING_DETACHMENT_BINDING',raw.key,'Legacy and instance Detachment bindings disagree');
    const detachment = exact(explicit ?? (importedDetachments.length===1?bindings.detachmentId:undefined),'DETACHMENT',raw.key,raw.label);
    return {instanceId:raw.key,canonicalDetachmentId:detachment?.id || null};
  });
  const detachmentIds = [...new Set(detachments.map(item=>item.canonicalDetachmentId).filter(Boolean))];
  const units = [];
  const bindSelection = (raw, unit, startingStrength) => {
    const binding = own(bindings.selections, raw.key);
    if (!binding) { need('SELECTION', raw.key, raw.label, unit.id); return null; }
    if (typeof binding !== 'object' || Array.isArray(binding)) { issue('AMBIGUOUS_BINDING', raw.key, 'Selection requires an explicit canonical binding'); return null; }
    const profileIds = binding.canonicalProfileIds ?? [], equipmentIds = binding.canonicalEquipmentIds ?? [];
    if (!Array.isArray(profileIds) || !Array.isArray(equipmentIds) || !profileIds.length && !equipmentIds.length ||
        [...profileIds, ...equipmentIds].some(id => typeof id !== 'string') || new Set([...profileIds, ...equipmentIds]).size !== profileIds.length + equipmentIds.length) {
      issue('INVALID_SELECTION_BINDING', raw.key, 'Selection IDs must be explicit, nonempty and unique'); return null;
    }
    for (const id of profileIds) {
      const profile = entities.get(id);
      if (profile?.kind !== 'WEAPON_PROFILE' || profile.parentId !== unit.id || !unit.data?.weaponIds?.includes(id)) issue('FOREIGN_SELECTION_OWNER', raw.key, `Weapon profile is not owned by this unit: ${id}`);
    }
    for (const id of equipmentIds) {
      const equipment = entities.get(id);
      if (!equipmentKinds.has(equipment?.kind) || equipment.parentId !== unit.id) issue('FOREIGN_SELECTION_OWNER', raw.key, `Equipment fact is not owned by this unit: ${id}`);
    }
    const fieldPaths = binding.canonicalFieldPaths ?? {};
    if (!fieldPaths || typeof fieldPaths !== 'object' || Array.isArray(fieldPaths)) issue('INVALID_SELECTION_FIELD', raw.key, 'Equipment field references must use canonical ID keys');
    else for (const [id, paths] of Object.entries(fieldPaths)) {
      if (!equipmentIds.includes(id) || !Array.isArray(paths) || !paths.length || paths.some(path => !fieldExists(entities.get(id)?.data, path))) issue('INVALID_SELECTION_FIELD', raw.key, `Unresolved equipment field: ${id}`);
    }
    for (const id of equipmentIds) {
      const equipment = entities.get(id);
      if ((equipment?.data?.blocks?.length || 0) > 1 && !own(fieldPaths, id)) {
        need('SELECTION_FIELD', raw.key, raw.label, id);
      }
    }
    let physicalQuantity = raw.physicalQuantity;
    if (physicalQuantity === null && startingStrength === 1) physicalQuantity = 1;
    if (physicalQuantity === null) {
      if (binding.physicalQuantity === undefined) { need('SELECTION_QUANTITY', raw.key, raw.label, unit.id); return null; }
      physicalQuantity = binding.physicalQuantity;
    } else if (binding.physicalQuantity !== undefined && binding.physicalQuantity !== physicalQuantity) {
      issue('CONFLICTING_SELECTION_QUANTITY', raw.key, 'Binding contradicts imported physical quantity');
    }
    if (!quantity(physicalQuantity)) issue('INVALID_SELECTION_QUANTITY', raw.key, 'Physical selected quantity must be a nonnegative safe integer');
    return {selectionKey: raw.key, canonicalProfileIds: [...profileIds], canonicalEquipmentIds: [...equipmentIds],
      canonicalFieldPaths: clone(fieldPaths), physicalQuantity, perModelQuantity: raw.perModelQuantity,
      quantityEvidence: {...clone(raw.quantityEvidence), ...(raw.physicalQuantity === null && startingStrength > 1 ? {explicitBinding: true} : {})}};
  };
  for (const raw of draft.units) {
    const unit = exact(own(bindings.units, raw.id), 'DATASHEET', raw.id, raw.name);
    if (!unit) continue;
    const startingStrength = raw.modelRows.length ? raw.modelRows.reduce((sum, row) => sum + row.quantity, 0) : raw.rawQuantity;
    if (!Number.isSafeInteger(startingStrength) || startingStrength < 1 ||
        raw.modelRows.some(row => !quantity(row.quantity) || row.loadouts.some(loadout => !quantity(loadout.quantity)) || row.loadouts.reduce((sum, loadout) => sum + loadout.quantity, 0) > row.quantity)) {
      issue('INVALID_COMPOSITION', raw.id, 'Imported model composition is invalid');
    }
    const modelRows = [];
    const rows = raw.modelRows.length ? raw.modelRows : [{key: `${raw.id}/aggregate`, name: raw.name, quantity: startingStrength, selections: [], loadouts: []}];
    for (const row of rows) {
      const explicitProfile = own(bindings.profiles, row.key);
      const declaredProfiles = unit.data?.profileIds || [];
      const profileId = explicitProfile ?? (declaredProfiles.length === 1 ? declaredProfiles[0] : undefined);
      const profile = exact(profileId, 'PROFILE', row.key, row.name, unit.id);
      if (profile && (profile.parentId !== unit.id || !declaredProfiles.includes(profile.id))) issue('FOREIGN_PROFILE_OWNER', row.key, 'Model profile belongs to another unit');
      modelRows.push({rowId: row.key, compositionScope: raw.modelRows.length ? 'MODEL_ROW' : 'UNIT', canonicalProfileId: profile?.id || null, quantity: row.quantity,
        selections: row.selections.map(selection => bindSelection(selection, unit, startingStrength)).filter(Boolean),
        loadouts: row.loadouts.map(loadout => ({loadoutId: loadout.key, quantity: loadout.quantity,
          selections: loadout.selections.map(selection => bindSelection(selection, unit, startingStrength)).filter(Boolean)}))});
    }
    if (raw.warlord !== null && typeof raw.warlord !== 'boolean') issue('INVALID_WARLORD_IDENTITY', raw.id, 'Warlord state must identify a physical unit');
    units.push({instanceId: raw.id, canonicalUnitId: unit.id, startingStrength, warlord: raw.warlord,
      modelRows, equipmentContextKnown: Boolean(raw.selections.length || raw.modelRows.some(row=>row.selections.length || row.loadouts.some(loadout=>loadout.selections.length))), selections: raw.selections.map(selection => bindSelection(selection, unit, startingStrength)).filter(Boolean),
      enhancementIds: [], raw: {name: raw.name, quantity: raw.rawQuantity, points: raw.points, sourceRef: raw.sourceRef}});
  }
  const byInstance = new Map(units.map(unit => [unit.instanceId, unit]));
  for (const raw of draft.enhancements) {
    const enhancement = exact(own(bindings.enhancements, raw.key), 'ENHANCEMENT', raw.key, raw.name);
    if (enhancement && detachmentIds.length && !detachmentIds.includes(enhancement.parentId)) issue('FOREIGN_ENHANCEMENT_CONTEXT', raw.key, 'Enhancement belongs to an unselected Detachment');
    const owner = byInstance.get(raw.ownerUnitId);
    if (raw.ownerStatus !== 'resolved' || !draft.units.some(unit => unit.id === raw.ownerUnitId)) issue('UNRESOLVED_ENHANCEMENT_OWNER', raw.key, 'Imported Enhancement physical owner is unresolved or ambiguous');
    else if (enhancement && owner) owner.enhancementIds.push(enhancement.id);
  }
  const warlords = units.filter(unit => unit.warlord === true);
  if (warlords.length > 1) issue('AMBIGUOUS_WARLORD_IDENTITY', 'warlord', 'Imported Warlord identity refers to multiple physical instances');
  const id = rosterId ?? defaultRosterId(draft.sourceText);
  if (typeof id !== 'string' || !id.trim()) issue('INVALID_ROSTER_ID', 'rosterId', 'Roster physical namespace is required');
  const status = errors.length ? 'INVALID' : needsBindings.length ? 'NEEDS_BINDINGS' : 'READY';
  return {schema: 'roster-v2/import-result', status, draft, needsBindings, errors,
    roster: status === 'READY' ? {schema: 'roster-v2/roster', rosterId: id, bookId: book.bookId,
      detachments, detachmentIds, warlordInstanceId: warlords[0]?.instanceId || null, units, attachments: []} : null};
}
