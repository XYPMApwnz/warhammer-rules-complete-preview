// Disposable presentation/search projection. Definitions remain in canonical cards.
export const GLOSSARY_SCHEMA = 'army-book-glossary/v2';

const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const human = value => String(value).replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
  .replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
const pointer = path => '/' + path.map(p => String(p).replaceAll('~', '~0').replaceAll('/', '~1')).join('/');
const labelOf = entity => entity.data?.title || entity.data?.name || entity.label || human(entity.kind);

export function normalizeGlossaryQuery(value) {
  return String(value ?? '').normalize('NFKD').replace(/\p{M}/gu, '')
    .toLowerCase().replace(/['’‘]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function namedPrefix(text) {
  if (typeof text !== 'string') return null;
  const match = text.match(/^([^:\n]{1,120}):\s+\S/);
  if (!match || !/^[\p{L}]/u.test(match[1])) return null;
  // This is a display-heading recognizer, never a factual identity resolver.
  if (/^(?:each|every|this|that|before|while|if|for|when|after|in|at|until|select|you|change|add|replace)\b/i.test(match[1])) return null;
  return match[1].trim();
}

function entryAliases(entity) {
  const aliases = [];
  const add = (label, path) => {
    if (label) aliases.push({label, fieldPath: pointer(path), presentationOnly: true});
  };
  for (const [i, block] of (entity.data?.blocks || []).entries()) {
    add(namedPrefix(block.text), ['blocks', i, 'text']);
  }
  if (entity.kind === 'SUPPLEMENTAL_DATASHEET_RULE') add(namedPrefix(entity.data?.text), ['text']);
  return aliases;
}

function projectCore(coreCatalog) {
  if (!coreCatalog || !Array.isArray(coreCatalog.records)) throw new Error('Missing effective Core catalog');
  const records = coreCatalog.records;
  const ids = new Set(records.map(record => record.id));
  if (ids.size !== records.length) throw new Error('Duplicate effective Core identity');
  const coreCards = [], coreFactManifest = [];
  for (const record of records) {
    const sourceConflict=record.state==='SOURCE_CONFLICT'&&record.sourceConflict?.status==='UNRESOLVED_ACCEPTED_SOURCE_CONFLICT';
    if (!record.id || !record.title || (record.state !== 'FULL_CONTENT'&&!sourceConflict)) throw new Error(`Unavailable Core record: ${record.id}`);
    const card = {id: record.id, kind: `CORE_${record.recordType}`, title: record.title,
      domain: 'CORE', parentId: null, contextId: record.id, source: {entityId: record.id},
      provenance: structuredClone(record.provenance), children: [], fields: [], links: []};
    const add = (path, value, label, type = 'text') => {
      const sourcePath = pointer(path), id = `${record.id}::${sourcePath}`;
      card.fields.push({id, label, value: structuredClone(value), type, contextId: record.id,
        source: {entityId: record.id, path: sourcePath}});
      coreFactManifest.push({id, entityId: record.id, path, value: structuredClone(value),
        cardId: record.id, contextId: record.id, ownerType: record.recordType});
    };
    const walk = (value, path) => {
      if (value === null || value === undefined) return;
      if (Array.isArray(value)) { value.forEach((item, i) => walk(item, [...path, i])); return; }
      if (typeof value === 'object') { for (const [key, item] of Object.entries(value)) walk(item, [...path, key]); return; }
      add(path, value, path.map(human).join(' · '));
    };
    add(['title'], record.title, 'Title', 'heading');
    if (record.code) add(['code'], record.code, 'Code');
    // An existing derived concept points to its existing definition owner.
    // It does not acquire another independent presentation definition.
    const sourceRuleId = record.relationships?.sourceRuleId;
    if(sourceConflict){
      if(record.semanticContent!==null||!record.sourceConflict.notice||!record.sourceConflict.occurrences?.length)throw new Error(`Invalid unresolved Core source conflict: ${record.id}`);
      add(['sourceConflict','notice'],record.sourceConflict.notice,'Accepted source conflict');
      record.sourceConflict.occurrences.forEach((occurrence,i)=>{
        add(['sourceConflict','occurrences',i,'title'],occurrence.title,'Source variant');
        add(['sourceConflict','occurrences',i,'presentationText'],occurrence.presentationText,'Source variant text');
      });
    } else if (!sourceRuleId && record.semanticContent !== null && record.semanticContent !== undefined) {
      add(['semanticContent'], record.semanticContent, 'Rule');
    } else if (!sourceRuleId && record.sourceStructure?.text) {
      add(['sourceStructure', 'text'], record.sourceStructure.text, 'Source note');
    }
    for (const key of ['operation', 'parameters', 'overrides']) walk(record[key], [key]);
    for (const [relation, value] of Object.entries(record.relationships || {})) {
      for (const targetId of Array.isArray(value) ? value : [value]) {
        if (!targetId) continue;
        if (!ids.has(targetId)) throw new Error(`Unresolved Core relationship: ${record.id} -> ${targetId}`);
        card.links.push({targetId, label: relation==='faqIds'?'FAQ':human(relation), ...(relation==='sourceRuleId'?{relation}:{})});
      }
    }
    coreCards.push(card);
  }
  return {coreCards, coreFactManifest};
}

export function buildGlossary({model, coreCatalog}) {
  if (!model || !Array.isArray(model.entities)) throw new Error('Missing effective Army Book');
  const entities = new Map(model.entities.map(entity => [entity.id, entity]));
  if (entities.size !== model.entities.length) throw new Error('Duplicate canonical Army Book identity');
  const entries = [];
  for (const entity of model.entities) {
    if (!entity.ruleContract && entity.kind !== 'DETACHMENT') continue;
    if (entity.ruleContract && entity.ruleContract.ruleId !== entity.id) throw new Error(`Rule identity mismatch: ${entity.id}`);
    const parent = entity.parentId ? entities.get(entity.parentId) : null;
    if (entity.parentId && !parent) throw new Error(`Missing canonical parent: ${entity.id}`);
    entries.push({targetId: entity.id, label: labelOf(entity), category: entity.kind,
      contextLabel: parent ? labelOf(parent) : 'Army Book', aliases: entryAliases(entity)});
  }
  const {coreCards, coreFactManifest} = projectCore(coreCatalog);
  const coreEntries = new Map();
  for (const record of coreCatalog.records) {
    const entry = {targetId: record.id, label: record.title, category: `CORE_${record.recordType}`,
      contextLabel: 'Core Rules', aliases: []};
    coreEntries.set(record.id, entry);
    entries.push(entry);
  }
  for (const [label, targetId] of Object.entries(coreCatalog.aliases || {})) {
    const entry = coreEntries.get(targetId);
    if (!entry) throw new Error(`Unresolved Core alias: ${label} -> ${targetId}`);
    entry.aliases.push({label, presentationOnly: true});
  }
  for (const record of coreCatalog.records) {
    for (const label of record.compatibilityAliases || []) coreEntries.get(record.id).aliases.push({label, presentationOnly: true});
  }
  for (const entry of entries) {
    entry.aliases = entry.aliases.filter((alias, i, all) => all.findIndex(item => item.label === alias.label && item.fieldPath === alias.fieldPath) === i)
      .sort((a, b) => compare(a.label, b.label) || compare(a.fieldPath || '', b.fieldPath || ''));
  }
  entries.sort((a, b) => compare(a.targetId, b.targetId));
  const index = {schema: GLOSSARY_SCHEMA, authority: 'DISPOSABLE_PROJECTION', entries};
  if (new Set(entries.map(entry => entry.targetId)).size !== entries.length) throw new Error('Duplicate glossary target');
  return {index, coreCards, coreFactManifest};
}

export function validateGlossary(index, cards) {
  if (index?.schema !== GLOSSARY_SCHEMA || index.authority !== 'DISPOSABLE_PROJECTION' || !Array.isArray(index.entries)) throw new Error('Invalid glossary index');
  const byId = new Map(cards.map(card => [card.id, card]));
  if (byId.size !== cards.length) throw new Error('Duplicate canonical presentation identity');
  const seen = new Set();
  for (const entry of index.entries) {
    if (seen.has(entry.targetId)) throw new Error(`Duplicate glossary target: ${entry.targetId}`);
    seen.add(entry.targetId);
    const card = byId.get(entry.targetId);
    if (!card) throw new Error(`Unresolved glossary target: ${entry.targetId}`);
    if (typeof entry.label !== 'string' || !entry.label || typeof entry.category !== 'string' || typeof entry.contextLabel !== 'string' || !Array.isArray(entry.aliases)) throw new Error(`Malformed glossary entry: ${entry.targetId}`);
    if (Object.keys(entry).some(key => !['targetId', 'label', 'category', 'contextLabel', 'aliases'].includes(key))) throw new Error(`Factual copy in glossary entry: ${entry.targetId}`);
    for (const alias of entry.aliases) {
      if (typeof alias.label !== 'string' || !alias.label || alias.presentationOnly !== true ||
          (alias.match !== undefined && !['EXACT', 'NORMALIZED'].includes(alias.match)) ||
          (alias.fieldPath !== undefined && (typeof alias.fieldPath !== 'string' || !alias.fieldPath.startsWith('/'))) ||
          Object.keys(alias).some(key => !['label', 'fieldPath', 'presentationOnly', 'match'].includes(key))) throw new Error(`Malformed glossary alias: ${entry.targetId}`);
      if (alias.fieldPath && !card.fields.some(field => field.source?.entityId === entry.targetId && field.source?.path === alias.fieldPath)) throw new Error(`Unresolved glossary alias field: ${entry.targetId}${alias.fieldPath}`);
    }
  }
  return {entries: seen.size, unresolvedTargets: 0, unresolvedAliases: 0, factualCopies: 0};
}

export function searchGlossary(index, query) {
  if (index?.schema !== GLOSSARY_SCHEMA) throw new Error('Invalid glossary index');
  const normalized = normalizeGlossaryQuery(query);
  const results = [];
  for (const entry of index.entries) {
    const candidates = [{label: entry.label}, ...entry.aliases];
    let best = null;
    for (const candidate of candidates) {
      const value = normalizeGlossaryQuery(candidate.label);
      if (normalized && !value.includes(normalized)) continue;
      const score = value === normalized ? 0 : value.startsWith(normalized) ? 1 : 2;
      if (!best || score < best.score) best = {...candidate, score};
    }
    if (best) results.push({...entry, matchedLabel: best.label,
      ...(best.fieldPath ? {matchedFieldPath: best.fieldPath} : {}), score: best.score});
  }
  results.sort((a, b) => a.score - b.score || compare(a.label, b.label) || compare(a.contextLabel, b.contextLabel) || compare(a.targetId, b.targetId));
  return results.map(({score, ...entry}) => entry);
}
