// Shared, browser-safe source declarations. Catalogs contain normalized values;
// layouts contain structure and references only, never legacy provenance copies.
import {catalogValue,catalogBinding} from './source-catalog.mjs';
export const SOURCE_SCHEMA = 'source-refs/v1';
export const sourceBundleKeys = Object.freeze(['sourceRefs', 'sourceBindings', 'sourceOwnership', 'sourceSchema', 'sourceRefCatalog', 'sourceLayoutCatalog', 'sourceContextCatalog']);
const contexts = new WeakMap();
const pools = { refs: new Map(), layouts: new Map(), contexts: new Map() };
const knownDocuments = new Map(), knownSourceIds = new Set();
const immutableEntries=new WeakMap(),registeredBooks=new WeakSet(),validatedRecords=new WeakMap(),resolvedRefs=new WeakMap();
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;};
let defaultRegistry;
let verifiedRead;
// Mutable inline catalogs are rechecked on reads. Shared entries are verified
// before first use and frozen; immutable identities can then be reused safely.
function catalogRead(operation) {
  const previous=verifiedRead;verifiedRead=new Map();
  try{return operation();}finally{verifiedRead=previous;}
}
export function setDefaultSourceRegistry(registry) { const previous = defaultRegistry; defaultRegistry = registry; return previous; }
const slots = new Set(['provenance', 'sourceProvenance', 'effectProvenance', 'mfmProvenance', 'sourceEvidence', 'fieldProvenance', 'currentness', 'sourceId']);
const identityKeys = new Set(['canonicalRuleId', 'canonicalOwnerId', 'canonicalClauseId', 'sourceId', 'sourceEntityId', 'sourceRecordId', 'sourceLineIndex']);
const documentKeys = new Set(['document', 'sourcePath', 'documentPath', 'corpusDocument', 'sourceDocument']);
const locatorKinds = { pointer: 'POINTER', path: 'POINTER', selector: 'TEXT_LOCATION', xpath: 'XPATH', page: 'PDF_PAGE', pages: 'PDF_PAGE', line: 'TEXT_LOCATION', bbox: 'PDF_BBOX', location: 'TEXT_LOCATION', rawLocator: 'TEXT_LOCATION', sourceLocator: 'TEXT_LOCATION', sourcePointer: 'POINTER', markerSelector: 'TEXT_LOCATION', templateSelector: 'TEXT_LOCATION', weaponRowSelector: 'TEXT_LOCATION', responsiveDuplicateMarkerSelectors: 'TEXT_LOCATION' };
const currentnessKeys = new Set(['sourceVersion', 'effectiveDate', 'observedAt', 'acceptedBaseHead']);
function sourceIdDocument(value) {
  return typeof value.sourceId === 'string' && /^(books\/|core\/|mfm\/|https?:)/.test(value.sourceId) &&
    !Object.keys(value).some(key => documentKeys.has(key) && typeof value[key] === 'string') &&
    Object.keys(value).some(key => own(locatorKinds, key));
}
function referenceFields(value) {
  if (!Object.keys(value).some(key => documentKeys.has(key) && typeof value[key] === 'string') && !sourceIdDocument(value)) return [];
  return Object.keys(value).filter(key => documentKeys.has(key) || key === 'sourceId' || /sha256$/i.test(key) || own(locatorKinds, key) || currentnessKeys.has(key) || key === 'effectiveFrom' || key === 'authority' || key === 'authorityLevel');
}
const clone = value => value === undefined ? undefined : structuredClone(value);
const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const bindingsFor = record => {
 if(typeof record?.sourceBindings==='string'&&record.sourceBindings.startsWith('bindings-'))return lookup('bindings',record.sourceBindings);
 if(record?.sourceBindings?.$schema===SOURCE_SCHEMA)return record.sourceBindings;
 if(Array.isArray(record?.sourceRefs)&&record.sourceRefs.length)throw new Error('Invalid source reference bindings');
 return undefined;
};
export const getSourceBindings=record=>bindingsFor(record);
/** Clone mutable canonical facts while sharing immutable source declarations.
 * Native JSON books contain no mutable source state. Other object types retain
 * structuredClone semantics; no selector, recipient or effect is evaluated. */
export function cloneSourceBook(value){
 const seen=new Map(),metadata=new Set(['sourceRefs','sourceBindings','sourceOwnership','fieldProvenance']);
 function copy(node){
  if(!node||typeof node!=='object')return node;
  if(seen.has(node))return seen.get(node);
  if(!Array.isArray(node)&&Object.getPrototypeOf(node)!==Object.prototype&&Object.getPrototypeOf(node)!==null)return structuredClone(node);
  const out=Array.isArray(node)?new Array(node.length):{};seen.set(node,out);
  const shared=typeof node.sourceBindings==='string'&&node.sourceBindings.startsWith('bindings-');
  for(const key of Object.keys(node))out[key]=shared&&metadata.has(key)?freeze(node[key]):copy(node[key]);
  return out;
 }return copy(value);
}
function stable(value) {
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (plain(value)) return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
// Content IDs are verified before trusting an entry. Only frozen values under
// the same verified identity may be reused. Collision checks retain exact bytes.
function digest(value) {
  const text = stable(value); let a = 2166136261, b = 2246822519;
  for (let i = 0; i < text.length; i++) { const c = text.charCodeAt(i); a = Math.imul(a ^ c, 16777619); b = Math.imul(b ^ c, 3266489917); }
  return `${(a >>> 0).toString(16).padStart(8, '0')}${(b >>> 0).toString(16).padStart(8, '0')}`;
}
function idFor(kind, value) { return `${kind}-${digest(value)}`; }
export const sourceContentId=idFor;
function publish(kind, id, value) {
  if (id !== idFor(kind, value)) throw new Error(`Source catalog content changed: ${id}`);
  const known = pools[kind].get(id);
  if (known && known!==value && stable(known) !== stable(value)) throw new Error(`Source catalog collision: ${id}`);
  pools[kind].set(id, value);
  if (kind === 'refs' && typeof value.sourceId === 'string') {
    knownSourceIds.add(value.sourceId);
    if (typeof value.document === 'string') { const ids = knownDocuments.get(value.document) || new Set(); ids.add(value.sourceId); knownDocuments.set(value.document, ids); }
  }
}
function catalogFor(book, kind) {
  return book?.[kind === 'refs' ? 'sourceRefCatalog' : kind === 'layouts' ? 'sourceLayoutCatalog' : 'sourceContextCatalog'];
}
function lookup(kind, id, book) {
  const local = catalogFor(book, kind);
  const shared=kind==='bindings'?catalogBinding(id):catalogValue(kind,id);
  const value = local && own(local, id) ? local[id] : shared || pools[kind]?.get(id);
  if (!value) throw new Error(`Missing source ${kind} entry: ${id}`);
  if(immutableEntries.get(value)===kind+':'+id)return value;
  if(shared===value){
    if(immutableEntries.get(value)!==kind+':'+id){if(id!==idFor(kind,value))throw new Error(`Source catalog content changed: ${id}`);freeze(value);immutableEntries.set(value,kind+':'+id);}
    return value;
  }
  const key=kind+':'+id;
  if(verifiedRead?.get(key)===value)return value;
  publish(kind, id, value);
  verifiedRead?.set(key,value);
  return value;
}
function contextFor(record, book) { return record?.sourceSchema === SOURCE_SCHEMA ? record : book || contexts.get(record); }
function sourceSlot(value, key, record) {
  if (!slots.has(key)) return false;
  if (key === 'sourceId' && !(record?.ruleId && record?.ownerId || typeof record?.schema === 'string' && record.schema.startsWith('rule-contract/') || Object.keys(record || {}).some(field => documentKeys.has(field)))) return false;
  if (key === 'currentness' && !plain(value)) return false;
  // This sourceEvidence is a quotation, not a document declaration.
  if (key === 'sourceEvidence' && plain(value) && own(value, 'field') && own(value, 'quote') && Object.keys(value).every(k => k === 'field' || k === 'quote')) return false;
  return value !== undefined;
}
function stratagemIds(root) {
  const records = [];
  function collect(value) { if (!value || typeof value !== 'object') return; if (value.id || value.ruleId) records.push(value); for (const child of Object.values(value)) collect(child); }
  collect(root);
  const excluded = new Set(records.filter(value => value.kind === 'STRATAGEM' || value.ruleContract?.kind === 'STRATAGEM').flatMap(value => [value.id, value.ruleId]).filter(Boolean));
  let changed = true;
  while (changed) { changed = false; for (const value of records) if ([value.parentId, value.ownerId, value.ruleId].some(id => excluded.has(id))) for (const id of [value.id, value.ruleId]) if (id && !excluded.has(id)) { excluded.add(id); changed = true; } }
  return excluded;
}
function excludedRecord(value, excluded, key) {
  return value?.kind === 'STRATAGEM' || value?.ruleContract?.kind === 'STRATAGEM' || [value?.id, value?.ruleId, value?.ownerId, key].some(id => excluded.has(id));
}
function resolveIdentity(registry, document, recordedSourceId) {
  if (typeof registry?.resolve === 'function') return registry.resolve(document, recordedSourceId);
  const rows = registry?.rows || registry?.registryRows || (registry ? [] : [...(knownDocuments.get(document) || [])].map(sourceId => ({ sourceId, document })));
  const exact = rows.filter(row => row.document === document || row.path === document);
  const candidates = [...new Set(exact.map(row => row.sourceId).filter(Boolean))].sort();
  if (recordedSourceId && exact.some(row => row.sourceId === recordedSourceId)) return { sourceId: recordedSourceId, status: 'RECORDED_REGISTERED_ID' };
  if (document === undefined && recordedSourceId && rows.some(row => row.sourceId === recordedSourceId)) return { sourceId: recordedSourceId, status: 'RECORDED_REGISTERED_ID' };
  if (!registry && document === undefined && knownSourceIds.has(recordedSourceId)) return { sourceId: recordedSourceId, status: 'RECORDED_REGISTERED_ID' };
  if (candidates.length === 1) return { sourceId: candidates[0], status: 'UNIQUE_DOCUMENT_REGISTRY_MATCH' };
  return { sourceId: null, status: 'UNRESOLVED_SOURCE', reason: candidates.length ? 'AMBIGUOUS_DOCUMENT' : 'UNREGISTERED_DOCUMENT', ...(candidates.length ? { candidates } : {}) };
}
export function compileBookSourceRefs(input, { registry } = {}) {
  registry ||= defaultRegistry;
  if (!input || typeof input !== 'object') return clone(input);
  if (input.sourceSchema === SOURCE_SCHEMA) { const output = clone(input); registerBookSources(output); return output; }
  const output = clone(input), excluded = stratagemIds(output);
  const catalogs = { refs: {}, layouts: {}, contexts: {} };
  function intern(kind, value) { const id = idFor(kind, value); publish(kind, id, value); catalogs[kind][id] = value; return id; }
  function binding(kind, value, path = []) { return { type: 'VALUE', pool: kind, id: intern(kind, value), path }; }
  function encode(value, label = '', ownerIds = []) {
    if (Array.isArray(value)) return { type: 'ARRAY', items: value.map(child => encode(child, label, ownerIds)) };
    if (!plain(value)) return binding('contexts', { kind: identityKeys.has(label) ? 'IDENTITY' : 'ATTRIBUTE', field: label, ...(value === undefined ? { valueType: 'UNDEFINED' } : { value }) }, ['value']);
    const fields = new Map(), docs = [];
    for (const key of Object.keys(value)) if ((documentKeys.has(key) || key === 'path' && /^(books\/|core\/|mfm\/|https?:)/.test(value[key])) && typeof value[key] === 'string') docs.push(key);
    const sourceIdPath = sourceIdDocument(value);
    if (sourceIdPath) docs.unshift('sourceId');
    let main = docs.find(key => key !== 'corpusDocument') || docs[0];
    const byDocument = new Map(docs.map(key => [key, { document: value[key], documentRole: key === 'corpusDocument' ? 'CORPUS' : 'DOCUMENT' }]));
    for (const key of docs) {
      const resolution = resolveIdentity(registry, value[key], !sourceIdPath && typeof value.sourceId === 'string' ? value.sourceId : undefined);
      const ref = byDocument.get(key); ref.sourceId = resolution.sourceId ?? null;
      if (resolution.status === 'UNRESOLVED_SOURCE') ref.resolution = resolution;
      fields.set(key, [key, ['document']]);
    }
    const identity = typeof value.sourceId === 'string' && !ownerIds.includes(value.sourceId) ? resolveIdentity(registry, undefined, value.sourceId) : undefined;
    if (!main && (identity?.sourceId || Object.keys(value).some(key => ['sha256', 'textSha256'].includes(key) || own(locatorKinds, key) && !(key === 'path' && typeof value.entityId === 'string')))) {
      main = '$source';
      const resolution = resolveIdentity(registry, undefined, typeof value.sourceId === 'string' ? value.sourceId : undefined);
      byDocument.set(main, { sourceId: resolution.sourceId ?? null, ...(resolution.status === 'UNRESOLVED_SOURCE' ? { resolution } : {}) });
    }
    // Captured entity IDs share this historical field name with document IDs.
    // Only an exact registered document identity belongs on the document ref;
    // all other identities retain their original typed context below.
    if (main && typeof value.sourceId === 'string' && !ownerIds.includes(value.sourceId) && byDocument.get(main).sourceId === value.sourceId) {
      fields.set('sourceId', [main, ['sourceId']]);
    }
    const assign = (field, doc, target, transformed) => {
      if (!doc || !own(value, field)) return;
      const ref = byDocument.get(doc); ref[target] = transformed === undefined ? clone(value[field]) : transformed;
      fields.set(field, [doc, [target]]);
    };
    // A document-path alias has historically carried a fragment hash named
    // sha256. Preserve that name/value as context without claiming file bytes.
    if (!sourceIdPath) assign('sha256', main, 'sha256');
    assign('textSha256', main, 'textSha256');
    assign('corpusSha256', docs.includes('corpusDocument') ? 'corpusDocument' : undefined, 'sha256');
    const sourceHashDocument=docs.includes('sourceDocument')?'sourceDocument':undefined;
    const sourceHashRef=byDocument.get(sourceHashDocument);
    assign('sourceSha256',sourceHashDocument,sourceHashRef?.sha256!==undefined&&sourceHashRef.sha256!==value.sourceSha256?'sourceSha256':'sha256');
    // Other hash names can describe different files or semantic fragments.
    // Keep their purpose and bytes in contexts without inventing a pairing.
    assign('authority', main, 'authority'); assign('authorityLevel', main, 'authorityLevel');
    for (const [field, kind] of Object.entries(locatorKinds)) if (own(value, field) && !docs.includes(field) && value[field] !== null && main) {
      const doc = ['pointer', 'sourcePointer'].includes(field) && docs.includes('corpusDocument') ? 'corpusDocument' : main;
      const ref = byDocument.get(doc); ref.locators ||= []; const index = ref.locators.length;
      const pointerKind = typeof value[field] === 'string' && value[field].startsWith('raw:') ? 'TEXT_LOCATION' : docs.includes('corpusDocument') || /\.json(?:$|#)/.test(byDocument.get(doc)?.document || '') ? 'JSON_POINTER' : /\.html?(?:$|#)/.test(byDocument.get(doc)?.document || '') ? 'HTML_POINTER' : 'TEXT_LOCATION';
      ref.locators.push({ kind: kind === 'POINTER' ? pointerKind : kind, value: clone(value[field]) }); fields.set(field, [doc, ['locators', index, 'value']]);
    }
    for (const field of currentnessKeys) if (own(value, field) && main) {
      const ref = byDocument.get(main); ref.currentness ||= {}; ref.currentness[field] = clone(value[field]); fields.set(field, [main, ['currentness', field]]);
    }
    const ids = new Map([...byDocument].map(([key, ref]) => [key, intern('refs', ref)]));
    const paired = Array.isArray(value.sourcePaths) && Array.isArray(value.sha256s) && value.sourcePaths.length === value.sha256s.length;
    const pairIds = paired ? value.sourcePaths.map((document, index) => {
      const resolution = resolveIdentity(registry, document, value.sourceId);
      return intern('refs', { sourceId: resolution.sourceId ?? null, document, documentRole: 'DOCUMENT', sha256: value.sha256s[index], ...(resolution.status === 'UNRESOLVED_SOURCE' ? { resolution } : {}) });
    }) : [];
    const sourceIds = label === 'currentness' && Array.isArray(value.sourceIds) && value.sourceIds.every(id => typeof id === 'string') ? value.sourceIds.map(recordedSourceId => {
      const resolution = resolveIdentity(registry, undefined, recordedSourceId);
      return resolution.sourceId ? intern('refs', { sourceId: resolution.sourceId }) : undefined;
    }) : undefined;
    return { type: 'OBJECT', entries: Object.entries(value).map(([key, child]) => {
      const field = fields.get(key);
      if (paired && (key === 'sourcePaths' || key === 'sha256s')) return [key, { type: 'ARRAY', items: pairIds.map(id => ({ type: 'VALUE', pool: 'refs', id, path: [key === 'sourcePaths' ? 'document' : 'sha256'] })) }];
      if (key === 'sourceIds' && sourceIds) return [key, { type: 'ARRAY', items: sourceIds.map((id, index) => id ? { type: 'VALUE', pool: 'refs', id, path: ['sourceId'] } : binding('contexts', { kind: 'IDENTITY', field: 'sourceId', value: value.sourceIds[index] }, ['value'])) }];
      return [key, field ? { type: 'VALUE', pool: 'refs', id: ids.get(field[0]), path: field[1] } : encode(child, key, ownerIds)];
    }) };
  }
  function refsFrom(layout, result = []) {
    if (layout.type === 'VALUE' && layout.pool === 'refs' && !result.includes(layout.id)) result.push(layout.id);
    if (layout.type === 'ARRAY') for (const item of layout.items) refsFrom(item, result);
    if (layout.type === 'OBJECT') for (const [, child] of layout.entries) refsFrom(child, result);
    return result;
  }
  function bindLayout(encoded, recordRefs) {
    const refs = [], contextIds = [];
    function template(node) {
      if (node.type === 'VALUE') {
        let index;
        if (node.pool === 'refs') {
          let recordIndex = recordRefs.indexOf(node.id);
          if (recordIndex < 0) { recordIndex = recordRefs.length; recordRefs.push(node.id); }
          index = refs.length; refs.push(recordIndex);
        } else { index = contextIds.length; contextIds.push(node.id); }
        return { type: 'VALUE', pool: node.pool, index, path: node.path };
      }
      if (node.type === 'ARRAY') return { type: 'ARRAY', items: node.items.map(template) };
      return { type: 'OBJECT', entries: node.entries.map(([key, child]) => [key, template(child)]) };
    }
    return { layout: intern('layouts', template(encoded)), refs, contexts: contextIds };
  }
  function walk(value, key) {
    if (!value || typeof value !== 'object' || excludedRecord(value, excluded, key)) return;
    if (Array.isArray(value)) { for (const item of value) walk(item); return; }
    const entries = Object.entries(value), bindings = {}, refs = [], ownership = {};
    const fields = referenceFields(value), fieldSet = new Set(fields);
    if (fields.length) {
      if (own(value, 'recordReference')) throw new Error('Source normalization key collision: recordReference');
      const subset = Object.fromEntries(entries.filter(([field]) => fieldSet.has(field)));
      bindings.recordReference = { ...bindLayout(encode(subset, 'recordReference', [value.id, value.ruleId, value.ownerId].filter(Boolean)), refs), fields };
      for (const field of fields) delete value[field];
    }
    let fieldMap;
    for (const [field, child] of entries) {
      if (fieldSet.has(field)) continue;
      if (sourceSlot(child, field, value)) {
        const layout = encode(child, field, [value.id, value.ruleId, value.ownerId].filter(Boolean)); bindings[field] = bindLayout(layout, refs);
        if (field === 'fieldProvenance' && plain(child)) fieldMap = Object.fromEntries(layout.entries.map(([key, item]) => [key, refsFrom(item).map(ref => ({ ref }))]));
        if (plain(child)) {
          const identity = Object.fromEntries(Object.entries(child).filter(([key]) => ['canonicalRuleId', 'canonicalOwnerId', 'canonicalClauseId'].includes(key)));
          if (Object.keys(identity).length) ownership[field] = identity;
        }
        if (field === 'sourceId' && [value.id, value.ruleId, value.ownerId].includes(child)) ownership[field] = { canonicalSourceId: child };
        delete value[field];
      } else walk(child, field);
    }
    if (Object.keys(bindings).length) {
      if (own(value, 'sourceRefs') || own(value, 'sourceBindings')) throw new Error('Source normalization key collision');
      // Order is restored by the layout, including source keys between ordinary keys.
      bindings.$schema = SOURCE_SCHEMA; bindings.$order = entries.map(([field]) => field);
      value.sourceRefs = refs.map(ref => ({ ref })); value.sourceBindings = bindings;
      if (fieldMap) value.fieldProvenance = fieldMap;
      if (Object.keys(ownership).length) value.sourceOwnership = ownership;
    }
  }
  walk(output);
  if (!Object.keys(catalogs.layouts).length) return output;
  output.sourceSchema = SOURCE_SCHEMA;
  output.sourceRefCatalog = catalogs.refs; output.sourceLayoutCatalog = catalogs.layouts; output.sourceContextCatalog = catalogs.contexts;
  registerBookSources(output);
  return output;
}
export function registerBookSources(book) {
  if (!book || typeof book !== 'object') return book;
  if(registeredBooks.has(book))return book;
  for (const kind of ['refs', 'layouts', 'contexts']) for (const [id, value] of Object.entries(catalogFor(book, kind) || {})) publish(kind, id, value);
  function walk(value) {
    if (!value || typeof value !== 'object') return;
    contexts.set(value, book);
    for (const [key, child] of Object.entries(value)) if (!['sourceRefCatalog', 'sourceLayoutCatalog', 'sourceContextCatalog'].includes(key)) walk(child);
  }
  // Published snapshots use immutable shared catalogs; no graph registration
  // or source copying is necessary in repeated roster execution.
  if(book.sourceRefCatalog||book.sourceLayoutCatalog||book.sourceContextCatalog)walk(book);
  registeredBooks.add(book);return book;
}
function resolvedReference(item){
 if(!item?.documentId)return item?.ref;
 if(resolvedRefs.has(item))return resolvedRefs.get(item);
 if(Object.hasOwn(item,'ref'))throw new Error('Conflicting source reference representation');
 const doc=lookup('documents',item.documentId),ref={...doc,...Object.fromEntries(Object.entries(item).filter(([key])=>!['documentId','referenceId'].includes(key)))};
 const id=idFor('refs',ref);if(item.referenceId!==id)throw new Error('Source reference content changed');publish('refs',id,ref);freeze(ref);freeze(item);immutableEntries.set(ref,'refs:'+id);resolvedRefs.set(item,id);return id;
}
function referenceId(record, binding, index) {
  const at = binding.refs[index];
  if (!Number.isInteger(at) || at < 0 || !record.sourceRefs?.[at]) throw new Error('Invalid source reference index');
  const id=resolvedReference(record.sourceRefs[at]);if(!id)throw new Error('Invalid source reference index');return id;
}
function decode(layout, binding, record, book) {
  if (layout.type === 'VALUE') {
    const id = layout.pool === 'refs' ? referenceId(record, binding, layout.index) : binding.contexts[layout.index];
    let value = lookup(layout.pool, id, book); for (const key of layout.path) value = value[key]; return clone(value);
  }
  if (layout.type === 'ARRAY') return layout.items.map(item => decode(item, binding, record, book));
  if (layout.type === 'OBJECT') return Object.fromEntries(layout.entries.map(([key, item]) => [key, decode(item, binding, record, book)]));
  throw new Error('Invalid source layout');
}
export function sourceSnapshot(record, { book, slot = 'provenance' } = {}) {
  return clone(snapshotValue(record,{book,slot}));
}
function snapshotValue(record,options={}){
 return catalogRead(()=>{
  if(!record||typeof record!=='object')return undefined;
  validateBindings(record,contextFor(record,options.book));const state=validatedRecords.get(record),slot=options.slot||'provenance';
  if(state?.snapshots.has(slot))return state.snapshots.get(slot);
  const value=sourceSnapshotChecked(record,options);if(state)state.snapshots.set(slot,freeze(value));return value;
 });
}
function sourceSnapshotChecked(record, { book, slot = 'provenance' } = {}) {
  if (!record || typeof record !== 'object') return undefined;
  validateBindings(record, contextFor(record, book));
  const context = contextFor(record, book), binding = bindingsFor(record)?.[slot];
  if (binding && own(record, slot) && slot !== 'fieldProvenance') throw new Error(`Legacy source shadow field: ${slot}`);
  if (binding) return decode(lookup('layouts', binding.layout, context), binding, record, context);
  // A holder such as source, suppressionProvenance or another proof name may
  // contain its own normalized record reference rather than a parent slot.
  return sourceDeclarationViewChecked(record[slot], { book: context });
}
function fieldMapFor(record, binding, book) {
  const layout = lookup('layouts', binding.layout, book);
  if (layout.type !== 'OBJECT') return undefined;
  return Object.fromEntries(layout.entries.map(([key, item]) => {
    const ids = []; function collect(node) { if (node.type === 'VALUE' && node.pool === 'refs') { const id = referenceId(record, binding, node.index); if (!ids.includes(id)) ids.push(id); } if (node.type === 'ARRAY') node.items.forEach(collect); if (node.type === 'OBJECT') node.entries.forEach(([, child]) => collect(child)); } collect(item); return [key, ids.map(ref => ({ ref }))];
  }));
}
function ownershipFor(record, binding, slot, book) {
  const value = decode(lookup('layouts', binding.layout, book), binding, record, book);
  const result = plain(value) ? Object.fromEntries(Object.entries(value).filter(([key]) => ['canonicalRuleId', 'canonicalOwnerId', 'canonicalClauseId'].includes(key))) : {};
  if (slot === 'sourceId' && [record.id, record.ruleId, record.ownerId].includes(value)) result.canonicalSourceId = value;
  return result;
}
function validateBindings(record, book) {
  const bindings = bindingsFor(record);
  if (!bindings) {validatedRecords.delete(record);return;}
  for(const slot of Object.keys(bindings))if(!slot.startsWith('$')&&slot!=='fieldProvenance'&&Object.hasOwn(record,slot))throw new Error(`Legacy source shadow field: ${slot}`);
  if(bindings.recordReference)for(const field of bindings.recordReference.fields||[])if(Object.hasOwn(record,field))throw new Error(`Legacy source shadow field: ${field}`);
  const signature=[record.sourceBindings,record.sourceRefs,record.sourceOwnership,record.fieldProvenance,record.id,record.ruleId,record.ownerId];
  const cached=validatedRecords.get(record);
  if(cached&&cached.signature.every((value,index)=>value===signature[index])&&!book?.sourceRefCatalog&&!book?.sourceLayoutCatalog&&!book?.sourceContextCatalog)return;
  validatedRecords.delete(record);
  const used = new Set(), ownership = {};
  for (const [slot, binding] of Object.entries(bindings)) if (!slot.startsWith('$')) {
    if (own(record, slot) && slot !== 'fieldProvenance') throw new Error(`Legacy source shadow field: ${slot}`);
    const layout = lookup('layouts', binding.layout, book);
    if (slot === 'recordReference') {
      if (layout.type !== 'OBJECT' || !Array.isArray(binding.fields) || JSON.stringify(binding.fields) !== JSON.stringify(layout.entries.map(([field]) => field))) throw new Error('Source record reference fields changed');
      for (const field of binding.fields) if (own(record, field)) throw new Error(`Legacy source shadow field: ${field}`);
    }
    function check(node) { if (node.type === 'VALUE') { if (node.pool === 'refs') { used.add(binding.refs[node.index]); lookup('refs', referenceId(record, binding, node.index), book); } else lookup('contexts', binding.contexts[node.index], book); } if (node.type === 'ARRAY') node.items.forEach(check); if (node.type === 'OBJECT') node.entries.forEach(([, child]) => check(child)); }
    check(layout);
    const identity = ownershipFor(record, binding, slot, book); if (Object.keys(identity).length) ownership[slot] = identity;
  }
  if (!Array.isArray(record.sourceRefs) || record.sourceRefs.some((item, index) => !plain(item) || (!item.documentId&&Object.keys(item).join() !== 'ref') || !used.has(index))) throw new Error('Source reference bindings changed');
  if (bindings.fieldProvenance && JSON.stringify(record.fieldProvenance) !== JSON.stringify(fieldMapFor(record, bindings.fieldProvenance, book))) throw new Error('Field source reference bindings changed');
  if (JSON.stringify(record.sourceOwnership || {}) !== JSON.stringify(ownership)) throw new Error('Canonical source ownership changed');
  if(!book?.sourceRefCatalog&&!book?.sourceLayoutCatalog&&!book?.sourceContextCatalog){freeze(record.sourceRefs);freeze(record.sourceBindings);freeze(record.sourceOwnership);freeze(record.fieldProvenance);validatedRecords.set(record,{signature,snapshots:new Map()});}
}
export function sourceDeclarationView(input, { book } = {}) {
  return catalogRead(()=>sourceDeclarationViewChecked(input,{book}));
}
function sourceDeclarationViewChecked(input, { book } = {}) {
  const context = contextFor(input, book) || input;
  function visit(value) {
    if (!value || typeof value !== 'object') return clone(value);
    if (Array.isArray(value)) return value.map(visit);
    const local = value.sourceSchema === SOURCE_SCHEMA ? value : context;
    const bindings = bindingsFor(value);
    if (bindings) validateBindings(value, local);
    const metadata = new Set(value.sourceSchema === SOURCE_SCHEMA ? sourceBundleKeys : bindings ? ['sourceRefs', 'sourceBindings', 'sourceOwnership'] : []);
    const result = {};
    const reference = bindings?.recordReference ? decode(lookup('layouts', bindings.recordReference.layout, local), bindings.recordReference, value, local) : undefined;
    let order = bindings?.$order || Object.keys(value);
    // A copied source bundle can be spread into a new presentation record.
    // Its source-only order belongs at the spread position, not before the
    // ordinary fields of the receiving record.
    const boundKey = key => own(bindings || {}, key) || own(reference || {}, key);
    if (bindings && order.every(boundKey) &&
        Object.keys(value).some(key => !metadata.has(key) && !boundKey(key))) {
      let inserted = false;
      order = Object.keys(value).flatMap(key => {
        if (metadata.has(key)) { if (inserted) return []; inserted = true; return bindings.$order; }
        return boundKey(key) ? [] : [key];
      });
    }
    for (const key of order) {
      if (reference && own(reference, key)) result[key] = clone(reference[key]);
      else if (bindings && !key.startsWith('$') && bindings[key]) result[key] = decode(lookup('layouts', bindings[key].layout, local), bindings[key], value, local);
      else if (!metadata.has(key) && own(value, key)) result[key] = visit(value[key]);
    }
    // Consumers can add ordinary runtime fields after source normalization.
    for (const key of Object.keys(value)) if (!own(result, key) && !metadata.has(key)) result[key] = visit(value[key]);
    return result;
  }
  return visit(input);
}
function layoutFor(record, { book, slot, fieldPath } = {}) {
  const context = contextFor(record, book);
  const selected = slot || (fieldPath !== undefined ? 'fieldProvenance' : undefined);
  const bindings = bindingsFor(record);
  const values = selected ? [bindings?.[selected]].filter(Boolean) : Object.entries(bindings || {}).filter(([key]) => !key.startsWith('$')).map(([, binding]) => binding);
  let layouts = values.map(binding => ({ binding, layout: lookup('layouts', binding.layout, context) }));
  if (fieldPath !== undefined) layouts = layouts.flatMap(({ binding, layout }) => layout.type === 'OBJECT' ? layout.entries.filter(([key]) => key === fieldPath).map(([, value]) => ({ binding, layout: value })) : []);
  return { context, layouts };
}
export function readSourceRefs(record, options = {}) {
  return catalogRead(()=>readSourceRefsChecked(record,options));
}
function readSourceRefsChecked(record, options = {}) {
  if (!record || typeof record !== 'object') return [];
  if (!bindingsFor(record) && !record.sourceSchema) {
    const wrapper = compileBookSourceRefs(record);
    if (!bindingsFor(wrapper) && wrapper.sourceSchema !== SOURCE_SCHEMA) return [];
    return readSourceRefs(wrapper, { ...options, book: wrapper });
  }
  const { context, layouts } = layoutFor(record, options), ids = [];
  validateBindings(record, context);
  function collect(layout, binding) {
    if (layout.type === 'VALUE' && layout.pool === 'refs') ids.push(referenceId(record, binding, layout.index));
    if (layout.type === 'ARRAY') layout.items.forEach(item => collect(item, binding));
    if (layout.type === 'OBJECT') {
      const direct = new Set();
      for (const [, value] of layout.entries) {
        if (value.type === 'VALUE' && value.pool === 'refs') { const id = referenceId(record, binding, value.index); if (!direct.has(id)) { direct.add(id); ids.push(id); } }
        else collect(value, binding);
      }
    }
  }
  layouts.forEach(({ layout, binding }) => collect(layout, binding)); return ids.map(id => ({ id, ...clone(lookup('refs', id, context)) }));
}
export function hasRecordedSourceEvidence(record, options = {}) {
  if (readSourceRefs(record, options).length) return true;
  const value = sourceSnapshot(record, options);
  if (typeof value === 'string') return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return plain(value) && Object.keys(value).length > 0;
}
export function sameSourceEvidence(a, b, { book, slot = 'provenance', otherSlot = slot } = {}) {
  return JSON.stringify(snapshotValue(a, { book, slot })) === JSON.stringify(snapshotValue(b, { book, slot: otherSlot }));
}
export function getRecordedSourceIdentity(record, options = {}) {
  const value = snapshotValue(record, options);
  if (options.slot === 'sourceId') return clone(value);
  return plain(value) && own(value, 'sourceId') ? clone(value.sourceId) : undefined;
}
export const readSourceMetadata = getSourceContext;
export function getSourceContext(record, options = {}) {
  const value = snapshotValue(record, options);
  if (!plain(value)) return {};
  const result = {};
  for (const [key, child] of Object.entries(value)) if (!documentKeys.has(key) && !['sha256', 'textSha256', 'corpusSha256', 'authority', 'authorityLevel', 'pointer', 'xpath', 'page', 'bbox', 'location', 'sourceEvidence'].includes(key)) result[key] = clone(child);
  return result;
}
export function copySourceEvidence(source, { book, slot = 'provenance', targetSlot = slot } = {}) {
  let context = contextFor(source, book), record = source, binding = bindingsFor(source)?.[slot];
  if (!binding) {
    const value = sourceSnapshot(source, { book, slot });
    if (value === undefined) return {};
    context = compileBookSourceRefs({ provenance: value }); record = context; binding = context.sourceBindings.provenance;
  }
  validateBindings(record, context);
  if(typeof source.sourceBindings==='string'){
    const refs=[],indices=binding.refs.map(index=>{let at=refs.indexOf(source.sourceRefs[index]);if(at<0){at=refs.length;refs.push(source.sourceRefs[index]);}return at;});
    const copied={...binding,refs:indices};
    const bundle={sourceRefs:refs,sourceBindings:{[targetSlot]:copied,$schema:SOURCE_SCHEMA,$order:targetSlot==='recordReference'?binding.fields:[targetSlot]},sourceSchema:SOURCE_SCHEMA};
    if(targetSlot==='fieldProvenance')bundle.fieldProvenance=fieldMapFor(bundle,copied,bundle);
    const ownership=ownershipFor(bundle,copied,targetSlot,bundle);if(Object.keys(ownership).length)bundle.sourceOwnership={[targetSlot]:ownership};
    return bundle;
  }
  const copied = { layout: binding.layout, refs: [], contexts: clone(binding.contexts), ...(binding.fields ? { fields: clone(binding.fields) } : {}) };
  const bundle = { sourceRefs: [], sourceBindings: { [targetSlot]: copied, $schema: SOURCE_SCHEMA, $order: targetSlot === 'recordReference' ? clone(binding.fields) : [targetSlot] }, sourceSchema: SOURCE_SCHEMA, sourceRefCatalog: {}, sourceLayoutCatalog: {}, sourceContextCatalog: {} };
  bundle.sourceLayoutCatalog[binding.layout] = clone(lookup('layouts', binding.layout, context));
  for (let i = 0; i < binding.refs.length; i++) {
    const id = referenceId(record, binding, i); let index = bundle.sourceRefs.findIndex(item => item.ref === id);
    if (index < 0) { index = bundle.sourceRefs.length; bundle.sourceRefs.push({ ref: id }); }
    copied.refs.push(index); bundle.sourceRefCatalog[id] = clone(lookup('refs', id, context));
  }
  for (const id of binding.contexts) bundle.sourceContextCatalog[id] = clone(lookup('contexts', id, context));
  if (targetSlot === 'fieldProvenance') bundle.fieldProvenance = fieldMapFor(bundle, copied, bundle);
  const ownership = ownershipFor(bundle, copied, targetSlot, bundle); if (Object.keys(ownership).length) bundle.sourceOwnership = { [targetSlot]: ownership };
  registerBookSources(bundle);
  if (book && bindingsFor(source)?.[slot]) {
    delete bundle.sourceRefCatalog; delete bundle.sourceLayoutCatalog; delete bundle.sourceContextCatalog;
    contexts.set(bundle, book);
  }
  return bundle;
}
export function mergeSourceEvidence(...bundles) {
  const result = { sourceRefs: [], sourceBindings: { $schema: SOURCE_SCHEMA, $order: [] }, sourceSchema: SOURCE_SCHEMA, sourceRefCatalog: {}, sourceLayoutCatalog: {}, sourceContextCatalog: {} };
  for (const bundle of bundles) {
    if (!bundle || !bindingsFor(bundle)) continue;
    const indices = (bundle.sourceRefs || []).map(item => {const id=resolvedReference(item);let index = result.sourceRefs.findIndex(ref => resolvedReference(ref)===id); if (index < 0) { index = result.sourceRefs.length; result.sourceRefs.push(item.documentId?item:clone(item)); } return index; });
    for (const [slot, binding] of Object.entries(bundle.sourceBindings)) if (!slot.startsWith('$')) {
      const mapped = { ...clone(binding), refs: binding.refs.map(index => indices[index]) };
      if (result.sourceBindings[slot] && stable(result.sourceBindings[slot]) !== stable(mapped)) throw new Error(`Conflicting source slot: ${slot}`);
      result.sourceBindings[slot] = mapped;
    }
    for (const slot of bundle.sourceBindings.$order) if (!result.sourceBindings.$order.includes(slot)) result.sourceBindings.$order.push(slot);
    for (const key of ['sourceRefCatalog', 'sourceLayoutCatalog', 'sourceContextCatalog']) Object.assign(result[key], clone(bundle[key] || {}));
    if (bundle.fieldProvenance) result.fieldProvenance = clone(bundle.fieldProvenance);
    if (bundle.sourceOwnership) result.sourceOwnership = { ...result.sourceOwnership, ...clone(bundle.sourceOwnership) };
  }
  if (!result.sourceBindings.$order.length) return {};
  registerBookSources(result); return result;
}
