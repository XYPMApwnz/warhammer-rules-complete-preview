// Names are resolved only at this import boundary. Runtime facts and joins
// retain canonical IDs, physical ownership and quantities from the export.
const own = (record, key) => record && Object.hasOwn(record, key) ? record[key] : undefined;
const clone = value => structuredClone(value);
const equipmentKinds = new Set(['WARGEAR_OPTION', 'WARGEAR_FOOTNOTE', 'DATASHEET_SECTION', 'SUPPLEMENTAL_DATASHEET_RULE', 'UNIT_COMPOSITION']);
const quantity = value => Number.isSafeInteger(value) && value >= 0;

export const normalizeImportLabel = value => String(value ?? '').normalize('NFKD').replace(/\p{M}/gu,'')
  .replace(/[’‘']/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const gearNouns = {knives:'knife',weapons:'weapon',cannons:'cannon',gauntlets:'gauntlet',guns:'gun',pistols:'pistol',launchers:'launcher',
  fists:'fist',scourges:'scourge',spewers:'spewer',spitters:'spitter',blades:'blade',bolters:'bolter',swords:'sword',bells:'bell',
  flamers:'flamer',autocannons:'autocannon',cutters:'cutter',claws:'claw',tracks:'track',heads:'head',icons:'icon',instruments:'instrument'};
const gearLabel = value => normalizeImportLabel(value).replace(/^additional /,'').split(' ').map(word=>gearNouns[word] || word).join(' ');
const entryLabel = (kind,value) => normalizeImportLabel(kind==='DETACHMENT'?String(value ?? '').replace(/\s*\([^)]*\)\s*$/,''):value);
const named = entity => [entity.data?.title,entity.data?.name,...(entity.aliases || [])].filter(value=>typeof value==='string');
const plausible = (label,names) => {
  const tokens=label.split(' ').filter(word=>!['of','the','a','and','with'].includes(word));
  return tokens.length && names.some(name=> {
    const words=name.split(' ');const overlap=tokens.filter(token=>words.includes(token)).length;
    return overlap===tokens.length || overlap===words.filter(word=>!['of','the','a','and','with'].includes(word)).length || overlap>=2 && overlap>=Math.ceil(tokens.length*.6);
  });
};
function identityCandidates(entities,kind,label,ownerId) {
  const key=entryLabel(kind,label), scoped=[...entities.values()].filter(entity=>entity.kind===kind && (!ownerId || entity.parentId===ownerId));
  const names=entity=>named(entity).map(value=>entryLabel(kind,value));
  const exact=scoped.filter(entity=>names(entity).includes(key));
  return {exact,plausible:key && key!=='—'?scoped.filter(entity=>plausible(key,names(entity))):[]};
}
function selectionCandidates(entities,unit,label,weaponSelections,equipmentSelections=[]) {
  const key=gearLabel(label), groups=new Map();
  const add = (name,binding) => {
    const k=gearLabel(name);if (!k) return;
    const group=groups.get(k) || [];group.push(binding);groups.set(k,group);
  };
  // A source-named family has alternate profile facts, not alternate pieces of
  // physical equipment. Spaced mode separators exclude hyphenated base names.
  const families=new Map();
  for (const id of unit.data.weaponIds || []) {
    const weapon=entities.get(id), name=weapon?.data.name;
    if (!name) continue;
    add(name,{canonicalProfileIds:[id],canonicalEquipmentIds:[],canonicalFieldPaths:{}});
    const family=name.split(/\s+[–—-]\s+/)[0];
    if (family!==name) {const ids=families.get(family) || [];ids.push(id);families.set(family,ids);}
  }
  for (const [name,ids] of families) add(name,{canonicalProfileIds:ids,canonicalEquipmentIds:[],canonicalFieldPaths:{}});
  const options=new Map();
  for (const entity of entities.values()) if (entity.parentId===unit.id && entity.kind==='WARGEAR_OPTION') {
    // Read only the positive selection clause, never a neighbouring exclusion
    // such as "not equipped with an instrument". These existing canonical
    // option identities are also the runtime's selected-equipment references.
    const label=entity.data.text?.match(/\bcan be equipped with\s+(?:\d+\s+)?(.+?)(?:\.|\n|$)/i)?.[1];
    if (!label || label.includes(':') || /\b(?:one|any|either)\b.*\bfollowing\b|\b(?:or|and)\s+can\b/i.test(label)) continue;
    const key=gearLabel(label);
    if ((groups.get(key) || []).some(binding=>binding.canonicalProfileIds.length)) continue;
    const list=options.get(key) || [];
    list.push({canonicalProfileIds:[],canonicalEquipmentIds:[entity.id],canonicalFieldPaths:{[entity.id]:['/text']}});options.set(key,list);
  }
  for (const [name,bindings] of options) for (const binding of bindings) add(name,binding);
  for (const entity of entities.values()) if (entity.parentId===unit.id && equipmentKinds.has(entity.kind)) {
    for (const [index,block] of (entity.data.blocks || []).entries()) if (block.wargearAbility) {
      const name=block.text.split(':')[0].replace(/\s*\(Aura\)\s*$/i,'');
      const reference={entityId:entity.id,path:`/blocks/${index}/text`};
      // Ancillary display occurrences resolve at the same import boundary.
      // They reference an existing canonical block and do not become another
      // selected-equipment owner or an independently executable gameplay fact.
      if (options.has(gearLabel(name))) {
        for (const binding of options.get(gearLabel(name))) binding.sourceReferences=[...(binding.sourceReferences || []),reference];
        continue;
      }
      add(name,{canonicalProfileIds:[],canonicalEquipmentIds:[entity.id],canonicalFieldPaths:{[entity.id]:[`/blocks/${index}/text`]},sourceReferences:[reference]});
    }
  }
  // Source-backed import metadata may bind one piece of equipment to several
  // existing profiles (including ranged and melee). It defines no weapon facts.
  const declared=new Map();
  for (const binding of weaponSelections.filter(binding=>binding.ownerId===unit.id)) {
    const key=gearLabel(binding.label),list=declared.get(key)||[];
    list.push({canonicalProfileIds:[...binding.canonicalProfileIds],canonicalEquipmentIds:[],canonicalFieldPaths:{}});declared.set(key,list);
  }
  for (const [name,bindings] of declared) groups.set(name,bindings);
  const declaredEquipment=new Map();
  for(const binding of equipmentSelections.filter(binding=>binding.ownerId===unit.id)) {
    const key=gearLabel(binding.label),list=declaredEquipment.get(key)||[];
    const sourceReferences=binding.sourceReferences?.length ? [
      ...(groups.get(key)||[]).filter(candidate=>JSON.stringify(candidate.canonicalEquipmentIds)===JSON.stringify(binding.canonicalEquipmentIds)&&
        JSON.stringify(candidate.canonicalFieldPaths)===JSON.stringify(binding.canonicalFieldPaths)).flatMap(candidate=>candidate.sourceReferences||[]),
      ...clone(binding.sourceReferences)] : [];
    list.push({canonicalProfileIds:[],canonicalEquipmentIds:clone(binding.canonicalEquipmentIds),
      canonicalFieldPaths:clone(binding.canonicalFieldPaths),
      ...(sourceReferences.length?{sourceReferences:[...new Map(sourceReferences.map(ref=>[JSON.stringify(ref),clone(ref)])).values()]}:{})});declaredEquipment.set(key,list);
  }
  for(const [name,bindings] of declaredEquipment)groups.set(name,bindings);
  const unique = list => [...new Map(list.map(binding=>[JSON.stringify(binding),binding])).values()];
  return {exact:unique(groups.get(key) || []),plausible:unique([...groups].filter(([name])=>plausible(key,[name])).flatMap(([,bindings])=>bindings))};
}

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
      ...((raw.loadouts||[]).length?{aggregateLoadouts:raw.loadouts.map((loadout,k)=>({key:`${id}/aggregate/loadout/${k+1}`,
        quantity:loadout.quantity,selections:rawSelections(loadout.wargear,`${id}/aggregate/loadout/${k+1}`,'LOADOUT',loadout.quantity)}))}:{}),
      selections: [...rawSelections(raw.wargear, `${id}/unit`, 'UNIT', null),
        ...(raw.choiceLines||[]).flatMap((label,index)=>rawSelections(label,`${id}/choice/${index+1}`,'UNIT',null))]};
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

export function importNewRecruit(rawText, {parse, bindings = {}, book, rosterId, weaponSelections=[],equipmentSelections=[],optionSelections=[],deferredUnits=[]} = {}) {
  const errors = [], needsBindings = [], resolutions = [];
  let draft;
  try { draft = lexicalDraft(rawText, parse); }
  catch (error) { return {schema: 'roster-v2/import-result', status: 'INVALID', draft: null,
    roster: null, needsBindings, errors: [{code: 'INVALID_LEXICAL_INPUT', key: 'input', message: error.message}]}; }
  const issue = (code, key, message) => errors.push({code, key, message});
  const need = (kind, key, rawLabel, ownerId = null, candidates = {}) => needsBindings.push({kind, key, rawLabel, ownerId,...candidates});
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
    const scope = kind==='ENHANCEMENT' ? new Map([...entities].filter(([,entity])=>entity.kind!=='ENHANCEMENT' || detachmentIds.includes(entity.parentId))) :
      kind==='PROFILE'?new Map([...entities].filter(([id])=>entities.get(ownerId)?.data.profileIds.includes(id))):entities;
    const matches = identityCandidates(scope,kind,rawLabel,ownerId);
    if (kind==='PROFILE' && entities.get(ownerId)?.data.profileIds.length===1) matches.exact=[entities.get(entities.get(ownerId).data.profileIds[0])];
    const candidateIds=(matches.exact.length?matches.exact:matches.plausible).map(entity=>entity.id);
    if (id === undefined || id === null || id === '') {
      if (matches.exact.length===1) {
        resolutions.push({kind,key,state:'AUTO_RESOLVED',canonicalIds:[matches.exact[0].id]});return matches.exact[0];
      }
      const state=matches.exact.length>1?'AMBIGUOUS':'UNRESOLVED';
      resolutions.push({kind,key,state,canonicalIds:[]});
      const deferred=kind==='DATASHEET'?deferredUnits.find(item=>normalizeImportLabel(item.label)===normalizeImportLabel(rawLabel)):null;
      need(kind,key,rawLabel,ownerId,{candidateIds,state,...(kind==='DETACHMENT'&&!candidateIds.length?{
        reason:'DETACHMENT_MEMBERSHIP_NOT_PROVEN',
        message:'This selected Detachment has no reviewed canonical membership in this Army Book. Its selection remains unresolved; no roster changes were saved.'
      }:{}),...(deferred?{reason:deferred.reason}: {})});return null;
    }
    if (typeof id !== 'string') { issue('AMBIGUOUS_BINDING', key, 'Binding must contain one explicit canonical ID'); return null; }
    const entity = entities.get(id);
    if (!entity || entity.kind !== kind) { issue('INVALID_CANONICAL_BINDING', key, `Unknown or wrong-kind canonical ID: ${id}`); return null; }
    if (kind==='PROFILE' && ownerId && entity.parentId!==ownerId) {issue('FOREIGN_PROFILE_OWNER',key,'Model profile belongs to another unit');return null;}
    if (kind==='ENHANCEMENT' && !detachmentIds.includes(entity.parentId)) {issue('FOREIGN_ENHANCEMENT_CONTEXT',key,'Enhancement belongs to an unselected Detachment');return null;}
    // Pre-existing headerless bindings remain a trusted import API input, not
    // an editing choice offered by the production import-resolution panel.
    const headerless = kind==='DETACHMENT' && !draft.detachments.length;
    if (!headerless && !candidateIds.includes(id)) {issue('CONFLICTING_IMPORTED_IDENTITY',key,'Canonical binding does not match this imported entry');return null;}
    resolutions.push({kind,key,state:matches.exact.length===1?'AUTO_RESOLVED':'MANUAL_RESOLVED',canonicalIds:[id]});
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
    let binding = own(bindings.selections, raw.key);
    const matches=selectionCandidates(entities,unit,raw.label,weaponSelections,equipmentSelections), candidates=matches.exact.length?matches.exact:matches.plausible;
    const options=optionSelections.filter(item=>(item.ownerId===unit.id||detachmentIds.includes(item.detachmentId))&&
      normalizeImportLabel(item.label)===normalizeImportLabel(raw.label));
    if(options.length) {
      let unique=[...new Map(options.map(item=>[item.canonicalOptionId,item])).values()];
      if(binding?.canonicalOptionId) {
        unique=unique.filter(item=>item.canonicalOptionId===binding.canonicalOptionId);
        if(!unique.length){issue('CONFLICTING_IMPORTED_SELECTION',raw.key,'Canonical option does not match this imported choice');return null;}
      }
      if(unique.length!==1||matches.exact.length) {need('OPTION',raw.key,raw.label,unit.id,{state:'AMBIGUOUS',candidateIds:unique.map(item=>item.canonicalOptionId)});return null;}
      const selected=unique[0];
      if(binding&&binding.canonicalOptionId!==selected.canonicalOptionId) {issue('CONFLICTING_IMPORTED_SELECTION',raw.key,'Canonical option does not match this imported choice');return null;}
      if(raw.explicitQuantity&&raw.physicalQuantity!==1) {issue('INVALID_OPTION_QUANTITY',raw.key,'A discrete canonical choice must be selected once');return null;}
      resolutions.push({kind:'OPTION',key:raw.key,state:binding?'MANUAL_RESOLVED':'AUTO_RESOLVED',canonicalIds:[selected.canonicalOptionId]});
      return {selectionKey:raw.key,canonicalProfileIds:[],canonicalEquipmentIds:[],canonicalOptionIds:[selected.canonicalOptionId],
        selectionField:selected.selectionField,selectionCardinality:selected.selectionCardinality,physicalQuantity:1,perModelQuantity:null,
        ...(selected.exclusiveGroupId?{exclusiveGroupId:selected.exclusiveGroupId}:{}),
        quantityEvidence:clone(raw.quantityEvidence),sourceEvidence:clone(selected.evidence)};
    }
    if (!binding) {
      if (matches.exact.length===1) binding=matches.exact[0];
      else {
        const state=matches.exact.length>1?'AMBIGUOUS':'UNRESOLVED';
        resolutions.push({kind:'SELECTION',key:raw.key,state,canonicalIds:[]});
        need('SELECTION',raw.key,raw.label,unit.id,{candidates,state});return null;
      }
    }
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
    const sameIds = (a,b) => JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
    const fieldPaths = binding.canonicalFieldPaths ?? (matches.exact.length===1 && sameIds(profileIds,matches.exact[0].canonicalProfileIds) &&
      sameIds(equipmentIds,matches.exact[0].canonicalEquipmentIds) ? matches.exact[0].canonicalFieldPaths : {});
    if (!fieldPaths || typeof fieldPaths !== 'object' || Array.isArray(fieldPaths)) {issue('INVALID_SELECTION_FIELD',raw.key,'Equipment field references must use canonical ID keys');return null;}
    for (const [id,paths] of Object.entries(fieldPaths)) if (!equipmentIds.includes(id) || !Array.isArray(paths) || !paths.length || paths.some(path=>!fieldExists(entities.get(id)?.data,path))) {
      issue('INVALID_SELECTION_FIELD',raw.key,`Unresolved equipment field: ${id}`);return null;
    }
    const signature = item => JSON.stringify([[...(item.canonicalProfileIds || [])].sort(),[...(item.canonicalEquipmentIds || [])].sort(),
      Object.entries(item.canonicalFieldPaths || {}).sort(([a],[b])=>a.localeCompare(b)).map(([id,paths])=>[id,[...paths].sort()])]);
    const sourceCandidate=candidates.find(candidate=>signature(candidate)===signature({...binding,canonicalFieldPaths:fieldPaths}));
    if (!sourceCandidate) {
      issue('CONFLICTING_IMPORTED_SELECTION',raw.key,'Canonical selection does not match this imported equipment');return null;
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
    resolutions.push({kind:'SELECTION',key:raw.key,state:matches.exact.length===1?'AUTO_RESOLVED':'MANUAL_RESOLVED',canonicalIds:[...profileIds,...equipmentIds]});
    return {selectionKey: raw.key, canonicalProfileIds: [...profileIds], canonicalEquipmentIds: [...equipmentIds],
      canonicalFieldPaths: clone(fieldPaths), physicalQuantity, perModelQuantity: raw.perModelQuantity,
      ...(sourceCandidate.sourceReferences?.length?{sourceReferences:clone(sourceCandidate.sourceReferences)}:{}),
      quantityEvidence: {...clone(raw.quantityEvidence), ...(raw.physicalQuantity === null && startingStrength > 1 ? {explicitBinding: true} : {})}};
  };
  for (const raw of draft.units) {
    const unit = exact(own(bindings.units, raw.id), 'DATASHEET', raw.id, raw.name);
    if (!unit) continue;
    const startingStrength = raw.modelRows.length ? raw.modelRows.reduce((sum, row) => sum + row.quantity, 0) : raw.rawQuantity;
    // Some supported exports use 1x for the unit selection itself. Detailed
    // rows establish its model count; an explicit larger total must agree.
    if (raw.modelRows.length && raw.rawQuantity > 1 && startingStrength !== raw.rawQuantity) {
      issue('CONTRADICTORY_COMPOSITION', raw.id, 'Imported unit total disagrees with its detailed composition');
    }
    if (!Number.isSafeInteger(startingStrength) || startingStrength < 1 ||
        raw.modelRows.some(row => !quantity(row.quantity) || row.loadouts.some(loadout => !quantity(loadout.quantity)) || row.loadouts.reduce((sum, loadout) => sum + loadout.quantity, 0) > row.quantity)) {
      issue('INVALID_COMPOSITION', raw.id, 'Imported model composition is invalid');
    }
    const modelRows = [];
    const aggregateLoadouts=raw.aggregateLoadouts||[];
    if(aggregateLoadouts.some(row=>!Number.isSafeInteger(row.quantity)||row.quantity<1)||aggregateLoadouts.reduce((sum,row)=>sum+row.quantity,0)>startingStrength)
      issue('INVALID_COMPOSITION',raw.id,'Imported grouped loadouts exceed or contradict the MODEL count');
    if(aggregateLoadouts.length&&raw.modelRows.length)
      issue('AMBIGUOUS_LOADOUT_SCOPE',raw.id,'Unnamed grouped loadouts cannot be assigned to named MODEL rows');
    const rows = raw.modelRows.length ? raw.modelRows : [{key: `${raw.id}/aggregate`, name: raw.name, quantity: startingStrength, selections: [], loadouts: aggregateLoadouts}];
    for (const row of rows) {
      const explicitProfile = own(bindings.profiles, row.key);
      const declaredProfiles = unit.data?.profileIds || [];
      const profileId = explicitProfile ?? (declaredProfiles.length === 1 ? declaredProfiles[0] : undefined);
      let profile;
      if(aggregateLoadouts.length&&declaredProfiles.length!==1){
        if(explicitProfile===undefined){
          resolutions.push({kind:'PROFILE',key:row.key,state:'AMBIGUOUS',canonicalIds:[]});
          need('PROFILE',row.key,row.name,unit.id,{state:'AMBIGUOUS',candidateIds:[...declaredProfiles]});
        }else{
          const candidate=entities.get(explicitProfile);
          if(candidate?.kind!=='PROFILE'||candidate.parentId!==unit.id||!declaredProfiles.includes(candidate.id))
            issue('FOREIGN_PROFILE_OWNER',row.key,'Grouped loadout binding must identify a declared MODEL profile');
          else{profile=candidate;resolutions.push({kind:'PROFILE',key:row.key,state:'MANUAL_RESOLVED',canonicalIds:[profile.id]});}
        }
      }else profile=exact(profileId, 'PROFILE', row.key, row.name, unit.id);
      if (profile && (profile.parentId !== unit.id || !declaredProfiles.includes(profile.id))) issue('FOREIGN_PROFILE_OWNER', row.key, 'Model profile belongs to another unit');
      modelRows.push({rowId: row.key, compositionScope: raw.modelRows.length ? 'MODEL_ROW' : 'UNIT', canonicalProfileId: profile?.id || null, quantity: row.quantity,
        // Display caption only. Canonical profile/selection identities above
        // remain the sole inputs to legality, predicates and effects.
        presentationLabel: row.name,
        selections: row.selections.map(selection => bindSelection(selection, unit, startingStrength)).filter(Boolean),
        loadouts: row.loadouts.map(loadout => ({loadoutId: loadout.key, quantity: loadout.quantity,
          selections: loadout.selections.map(selection => bindSelection(selection, unit, startingStrength)).filter(Boolean)}))});
    }
    if (raw.warlord !== null && typeof raw.warlord !== 'boolean') issue('INVALID_WARLORD_IDENTITY', raw.id, 'Warlord state must identify a physical unit');
    const selections=raw.selections.map(selection=>bindSelection(selection,unit,startingStrength)).filter(Boolean);
    const optionRows=[...selections,...modelRows.flatMap(row=>[...row.selections,...row.loadouts.flatMap(loadout=>loadout.selections)])].filter(item=>item.canonicalOptionIds);
    const optionState={};
    for(const name of new Set(optionRows.map(item=>item.selectionField))) {
      const rows=optionRows.filter(item=>item.selectionField===name),ids=[...new Set(rows.flatMap(item=>item.canonicalOptionIds))];
      const cardinality=rows[0].selectionCardinality;
      if(rows.some(item=>item.selectionCardinality!==cardinality)||cardinality==='ONE'&&ids.length>1)
        issue('CONFLICTING_SELECTED_OPTION',raw.id,'Contradictory canonical option cardinality');
      optionState[name]=cardinality==='ONE'?ids[0]:ids;
    }
    for(const group of new Set(optionRows.map(item=>item.exclusiveGroupId).filter(Boolean))) {
      if(new Set(optionRows.filter(item=>item.exclusiveGroupId===group).flatMap(item=>item.canonicalOptionIds)).size>1)
        issue('CONFLICTING_SELECTED_OPTION',raw.id,'Multiple choices for an exclusive canonical selection group');
    }
    const equipmentKnown=[...selections,...modelRows.flatMap(row=>[...row.selections,...row.loadouts.flatMap(loadout=>loadout.selections)])]
      .some(item=>item.canonicalProfileIds.length||item.canonicalEquipmentIds.length);
    units.push({instanceId: raw.id, canonicalUnitId: unit.id, startingStrength, warlord: raw.warlord,
      modelRows, equipmentContextKnown:equipmentKnown, selections,
      ...optionState,
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
  return {schema: 'roster-v2/import-result', status, draft, needsBindings, errors, resolutions,
    roster: status === 'READY' ? {schema: 'roster-v2/roster', rosterId: id, bookId: book.bookId,
      detachments, detachmentIds, warlordInstanceId: warlords[0]?.instanceId || null, units, attachments: []} : null};
}
