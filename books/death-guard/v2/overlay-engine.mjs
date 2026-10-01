import assert from 'node:assert/strict';

const clone = value => structuredClone(value);
const forbidden = new Set(['__proto__','prototype','constructor']);
const key = operation => `${operation.targetId}\0${operation.field.join('/')}`;

export function validateRegistry(sources) {
  const ids = new Set();
  for (const source of sources) {
    assert.ok(source.id && !ids.has(source.id),`Duplicate independent source ownership: ${source.id}`);
    ids.add(source.id);
    for (const field of ['type','versionOrDate','authority','effectiveFrom','status']) assert.ok(source[field],`${source.id}: missing ${field}`);
    assert.ok(['CURRENT','SUPERSEDED'].includes(source.status),`${source.id}: ambiguous lifecycle`);
    assert.ok(source.url || source.provenance,`${source.id}: provenance required`);
    if (source.path) assert.match(source.sha256,/^[a-f0-9]{64}$/i,`${source.id}: integrity required`);
  }
  return new Map(sources.map(source => [source.id,source]));
}

export function applyOverlays(base,sources,operations) {
  const registry = validateRegistry(sources), model = clone(base);
  const entities = new Map(model.entities.map(entity => [entity.id,entity]));
  assert.equal(entities.size,model.entities.length,'Duplicate canonical identity');
  const operationIds = new Set(), currentWrites = new Map(), applied = [];
  const ordered = [...operations].sort((a,b) => a.effectiveFrom.localeCompare(b.effectiveFrom) || a.id.localeCompare(b.id));
  for (const operation of ordered) {
    const source = registry.get(operation.sourceId);
    assert.ok(source && source.authority === 'OFFICIAL_GW',`${operation.id}: accepted official overlay source required`);
    assert.ok(!operationIds.has(operation.id),`Duplicate overlay operation: ${operation.id}`); operationIds.add(operation.id);
    assert.equal(operation.effectiveFrom,source.effectiveFrom,`${operation.id}: ambiguous effective date`);
    assert.ok(operation.provenance && Object.keys(operation.provenance).length,`${operation.id}: evidence locator required`);
    assert.ok(['ADD','REPLACE','REMOVE','QUALIFY'].includes(operation.operation),'Unsupported overlay operation');
    assert.ok(Array.isArray(operation.field) && operation.field.length && operation.field.every(part => Number.isSafeInteger(part) && part >= 0 || typeof part === 'string' && part && !forbidden.has(part)),'Explicit safe field path required');
    const entity = entities.get(operation.targetId);
    assert.ok(entity,`${operation.id}: unresolved target identity ${operation.targetId}`);
    const overlapping = [...currentWrites.values()].filter(previous => previous.targetId === operation.targetId &&
      previous.field.slice(0,Math.min(previous.field.length,operation.field.length)).every((part,index) => String(part) === String(operation.field[index])));
    for (const previous of overlapping) {
      const previousSource = registry.get(previous.sourceId);
      assert.ok(source.supersedes?.includes(previous.sourceId) && previousSource.status === 'SUPERSEDED',`${operation.id}: conflicting current overlays or ambiguous precedence`);
    }
    currentWrites.set(key(operation),operation);
    let host = entity.data;
    for (const part of operation.field.slice(0,-1)) {
      assert.ok(host && Object.hasOwn(host,part) && typeof host[part] === 'object',`${operation.id}: unresolved field path`);
      host = host[part];
    }
    const field = operation.field.at(-1), exists = Object.hasOwn(host,field), before = clone(host[field]);
    if (Object.hasOwn(operation,'expectedBefore')) assert.deepEqual(before,operation.expectedBefore,`${operation.id}: source baseline contradiction`);
    if (operation.operation === 'ADD') {
      if (exists && Array.isArray(host[field])) {
        const additions = Array.isArray(operation.value) ? operation.value : [operation.value];
        for (const value of additions) if (!host[field].some(item => JSON.stringify(item) === JSON.stringify(value))) host[field].push(clone(value));
      } else {assert.ok(!exists,`${operation.id}: duplicate independent ownership`); host[field] = clone(operation.value);}
    }
    if (operation.operation === 'REPLACE') {assert.ok(exists,`${operation.id}: replacement target missing`); host[field] = clone(operation.value);}
    if (operation.operation === 'REMOVE') {assert.ok(exists,`${operation.id}: removal target missing`); delete host[field];}
    if (operation.operation === 'QUALIFY') {
      assert.ok(exists,`${operation.id}: qualification target missing`);
      entity.qualifications ||= []; entity.qualifications.push({field:clone(operation.field),value:clone(operation.value),sourceId:source.id,provenance:clone(operation.provenance)});
    }
    entity.fieldProvenance ||= {};
    entity.fieldProvenance[operation.field.join('/')] = {sourceId:source.id,effectiveFrom:source.effectiveFrom,operationId:operation.id,...clone(operation.provenance)};
    applied.push({id:operation.id,targetId:entity.id,field:clone(operation.field),operation:operation.operation,baseValue:before,effectiveValue:clone(host[field]),...(operation.operation === 'QUALIFY' ? {qualificationValue:clone(operation.value)} : {}),sourceId:source.id,provenance:clone(operation.provenance)});
  }
  return {...model,appliedOverlays:applied};
}

export function sourceCurrentness(sources,{blockingItems = [],lastReconciledSource = null} = {}) {
  validateRegistry(sources);
  const official = sources.filter(source => source.authority === 'OFFICIAL_GW' && source.status === 'CURRENT' && source.type !== 'OFFICIAL_NEWS')
    .sort((a,b) => b.effectiveFrom.localeCompare(a.effectiveFrom) || a.id.localeCompare(b.id));
  const pending = official.filter(source => source.reconciled !== true);
  return {baseSourceVersion:sources.find(source => source.type === 'WAHA_CAPTURE')?.versionOrDate || null,
    latestApplicableOfficialSource:official[0]?.id || null,lastReconciledSource,
    currentness:blockingItems.length ? 'BLOCKED' : pending.length ? 'STALE' : 'CURRENT',
    pendingSourceIds:pending.map(source => source.id),blockingItems:clone(blockingItems)};
}
