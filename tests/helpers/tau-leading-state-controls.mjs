import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../../', import.meta.url);
const clone = value => JSON.parse(JSON.stringify(value));
const exact = (rows, id, kind) => {
  const matches = (rows || []).filter(row => row.id === id);
  assert.equal(matches.length, 1, `${kind}: ${id} must resolve exactly once`);
  return matches[0];
};
const normalized = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// Equipment comes from accepted default composition, never all available
// weapon profiles. Explicit fixtures can override quantities for valid variants.
export function sourceModelsForUnit(loaded, unitId) {
  const unit = exact(loaded.catalog.units, unitId, 'default equipment owner');
  const book = loaded.catalog.book.id;
  const config = JSON.parse(fs.readFileSync(new URL(`books/${book}/book.config.json`, root), 'utf8'));
  const read = relative => JSON.parse(fs.readFileSync(new URL(`books/${book}/${relative}`, root), 'utf8'));
  let composition = '';
  if (config.sources.codexWargear) composition = read(config.sources.codexWargear).units?.find(row => row.title === unit.title)?.composition || '';
  if (!composition && config.sources.wahaCurrentCorpus) {
    const record = read(config.sources.wahaCurrentCorpus).datasheets?.find(row => normalized(row.title) === normalized(unit.title));
    composition = (record?.sections || []).filter(row => normalized(row.title) === 'unit composition')
      .flatMap(row => row.blocks || []).map(row => row.text || '').join('\n');
  }
  const equipment = [...composition.matchAll(/([^\n.]+?)\s+(?:is|are) equipped with:\s*([^\.]+)/gi)]
    .map(match => ({subject:normalized(match[1]).replace(/^(?:the|every|this)\s+/, '').replace(/^\d+\s+/, ''),
      wargear:match[2].trim().split(';').map(value => value.trim().replace(/^(\d+)\s+/, '$1x ')).join(', ')}));
  return (unit.gameSelections?.models || []).map(model => {
    const defaults = (unit.gameSelections.wargearDefaults || []).filter(row => row.modelId === model.id);
    let wargear;
    if (defaults.length === 1) wargear = defaults[0].selections.map(row => `${row.quantity > 1 ? `${row.quantity}x ` : ''}${exact(unit.gameSelections.selections, row.selectionId, 'default selection').title}`).join(', ');
    else {
      const names = [model.title, ...(model.aliases || [])].map(name => normalized(name).replace(/^\d+(?: \d+)?\s+/, '').replace(/s$/, ''));
      const own = equipment.filter(row => names.includes(row.subject.replace(/s$/, '')));
      const common = equipment.filter(row => ['model','models'].includes(row.subject));
      const candidates = own.length ? own : common;
      assert.equal(candidates.length, 1, `${unit.id}/${model.id}: accepted default equipment is ambiguous or missing`);
      wargear = candidates[0].wargear;
    }
    let quantity = Number(model.min);
    if (!Number.isSafeInteger(quantity)) {
      const names = [model.title, ...(model.aliases || [])].map(normalized);
      let counts = [];
      for (const name of names) {
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`^(\\d+)(?: \\d+)? ${escaped}s?$`);
        counts = composition.split(/[.\n]/).map(normalized).map(line => line.match(pattern))
          .filter(Boolean).map(match => Number(match[1]));
        if (counts.length) break;
      }
      const distinct = [...new Set(counts)];
      assert.equal(distinct.length, 1, `${unit.id}/${model.id}: accepted source minimum quantity unavailable or ambiguous`);
      quantity = distinct[0];
    }
    assert.ok(Number.isSafeInteger(quantity) && quantity > 0, `${unit.id}: source minimum quantity unavailable`);
    return {name:model.aliases?.find(name => !/^\d/.test(name)) || model.title, quantity, wargear};
  });
}

// The provider is the same shared contract runtime used by production roster
// filters. No synthetic effects or replacement catalog facts are introduced.
export function loadLeadingRuntime(book) {
  assert.equal(book, 'tau-empire', 'This permanent guard covers only the T\'au leading-state class');
  const scope = {URLSearchParams, CustomEvent: class {}, dispatchEvent() {}};
  scope.window = scope;
  for (const file of ['books/shared/rule-facts.js', 'roster-guides/points-data.js',
    'roster-guides/points-validator.js', `books/${book}/scripts/roster-data.js`,
    'books/shared/roster-parser.js', 'books/shared/effect-contract-runtime.js',
    'books/shared/roster-context.js']) {
    vm.runInNewContext(fs.readFileSync(new URL(file, root), 'utf8'), scope, {filename:file});
  }
  return {scope, catalog:scope.WH_BOOK_ROSTER_CATALOG, api:scope.WHArmyRosterContext,
    provider:{gameEffects:context => scope.WHEffectContractRuntime.project(context)}};
}

function modelRows(unit, supplied, selections) {
  if (supplied) {
    assert.ok(supplied.length, `${unit.id}: source-backed model cohorts required`);
    for (const row of supplied) {
      assert.ok(Number.isSafeInteger(row.quantity) && row.quantity > 0);
      assert.equal(typeof row.name, 'string');
      assert.equal(typeof row.wargear, 'string');
    }
    return clone(supplied);
  }
  const models = unit.gameSelections?.models || [];
  assert.equal(models.length, 1, `${unit.id}: multipart fixture requires explicit source-backed cohorts`);
  assert.equal(models[0].min, 1, `${unit.id}: quantity requires explicit source-backed cohorts`);
  assert.equal(models[0].max, 1, `${unit.id}: quantity requires explicit source-backed cohorts`);
  assert.ok(selections?.length, `${unit.id}: source-backed selected equipment required`);
  return [{name:models[0].title, quantity:1, wargear:selections.map(id =>
    exact(unit.gameSelections.selections, id, 'equipment').title).join(', ')}];
}

export function createLeadingRecord(loaded, spec) {
  const {catalog, scope} = loaded;
  const owner = exact(catalog.units, spec.ownerUnitId, 'owner');
  const body = exact(catalog.units, spec.bodyguardUnitId, 'bodyguard');
  const ownerModels = modelRows(owner, spec.ownerModels, spec.ownerSelections);
  const bodyModels = modelRows(body, spec.bodyguardModels, spec.bodyguardSelections);
  const specs = [owner, body, owner, body];
  const models = [ownerModels, bodyModels, ownerModels, bodyModels];
  const ids = ['parsed-unit-1', 'parsed-unit-2', 'parsed-unit-3', 'parsed-unit-4'];
  const enhancement = spec.enhancementId && exact(catalog.enhancements, spec.enhancementId, 'enhancement');
  const detachmentId = spec.detachmentId || enhancement?.detachmentId;
  const detachment = detachmentId && exact(catalog.detachments, detachmentId, 'detachment');
  const lines = [`+ FACTION KEYWORD: ${catalog.book.title}`,
    ...(detachment ? [`+ DETACHMENT: ${detachment.title}`] : [])];
  specs.forEach((unit, index) => {
    const quantity = models[index].reduce((sum, model) => sum + model.quantity, 0);
    lines.push(`${quantity}x ${unit.title} (100 pts)`);
    for (const model of models[index]) lines.push(`• ${model.quantity}x ${model.name}: ${model.wargear}`);
    if (index === 0 && enhancement) lines.push(`Enhancement: ${enhancement.title} (+${enhancement.value} pts)`);
  });
  const sourceText = lines.join('\n');
  const roster = scope.WHRosterParser.parse(sourceText, {identityHints:{units:specs.map((unit,index) =>
    ({id:ids[index], canonicalUnitId:unit.id}))}});
  assert.deepEqual(clone(roster.units.map(unit => unit.id)), ids);
  return {id:`leading-control-${spec.sourceId}`, sourceText, roster, attachments:{}, ...clone(spec.recordExtras || {})};
}

// Specs bind a source-derived record and individual operation IDs. Source census
// owns equipment/composition and expected target scope, rather than this helper
// inferring those facts from the contracts being tested.
export function runLeadingStateControls({loaded, spec, assertClosed = true}) {
  const {api, catalog, provider, scope} = loaded;
  const ownerId = 'parsed-unit-1', bodyId = 'parsed-unit-2';
  const sourceOwnerId = spec.sourceOwner === 'bodyguard' ? bodyId : ownerId;
  const record = createLeadingRecord(loaded, spec);
  const project = value => api.project({catalog, provider, record:value, roster:value.roster});
  const evidence = projection => clone(projection.game.units.flatMap(unit => unit.effects
    .filter(effect => effect.source?.id === spec.sourceId && spec.operationIds.includes(effect.id))
    .map(effect => ({id:effect.id, owner:effect.source.ownerInstanceId,
      target:effect.targetInstanceId, state:effect.state || 'resolved'}))));
  const workflowInput = projection => ({units:projection.units.map(item =>
    ({instanceId:item.raw.id, canonicalUnit:item.catalogUnit, rosterUnit:item.raw})),
    attachments:projection.record.attachments, enhancements:projection.roster.enhancements,
    enhancementCatalog:catalog});
  const unattached = project(record);
  for (const unit of unattached.game.units) {
    assert.equal(unit.selection.composition.state, 'resolved', `${spec.sourceId}: fixture composition must resolve`);
    assert.equal(unit.selection.loadout.weaponResolution.state, 'resolved', `${spec.sourceId}: fixture weapons must resolve`);
  }
  const attachedState = api.attachments.attach({...workflowInput(unattached),
    bodyguardInstanceId:bodyId, leaderInstanceId:ownerId});
  assert.equal(attachedState.changed, true, `${spec.sourceId}: fixture attachment must be legal`);
  const attachedRecord = {...record, attachments:clone(attachedState.attachments)};
  const attached = project(attachedRecord);
  const detachedState = api.attachments.detach({...workflowInput(attached),
    bodyguardInstanceId:bodyId, leaderInstanceId:ownerId});
  assert.equal(detachedState.changed, true);
  const detached = project({...record, attachments:clone(detachedState.attachments)});
  const reattachedState = api.attachments.attach({...workflowInput(detached),
    bodyguardInstanceId:bodyId, leaderInstanceId:ownerId});
  assert.equal(reattachedState.changed, true);
  const reattached = project({...record, attachments:clone(reattachedState.attachments)});
  const invalid = project({...record, attachments:{'parsed-unit-3':[ownerId]}});
  assert.ok(invalid.attachmentState.rejected.some(row => row.leaderInstanceId === ownerId),
    `${spec.sourceId}: wrong bodyguard must actually be rejected`);
  const reloaded = project(clone(attachedRecord));
  // Mirrors source-text reparse with identityHints used by backup ingestion.
  // These are consumer roundtrips; actual browser/storage controls run separately.
  const backup = clone(attachedRecord);
  backup.roster = scope.WHRosterParser.parse(backup.sourceText, {identityHints:backup.roster});
  const imported = project(backup);
  const phases = {unattached, attached, detached, reattached, invalid, reloaded, imported};
  const observations = Object.fromEntries(Object.entries(phases).map(([phase,p]) => [phase,evidence(p)]));
  const expected = spec.expectedTargets || ((spec.targetScope || 'attached-group') === 'bearer' ? [ownerId] : [ownerId,bodyId]);
  const expectedRows = spec.operationIds.flatMap(id => (spec.operationTargets?.[id] || expected)
    .map(target => ({id,owner:sourceOwnerId,target})));
  const standaloneRows = spec.operationIds.flatMap(id => (spec.standaloneOperationTargets?.[id] || spec.standaloneTargets || [])
    .map(target => ({id,owner:sourceOwnerId,target})));
  const sort = rows => Array.from(rows, ({id,owner,target}) => `${id}|${owner}|${target}`).sort();
  if (assertClosed) {
    for (const phase of ['unattached','detached','invalid']) assert.deepEqual(sort(observations[phase]), sort(standaloneRows), `${spec.sourceId}: ${phase}`);
    for (const phase of ['attached','reattached','reloaded','imported']) assert.deepEqual(sort(observations[phase]), sort(expectedRows), `${spec.sourceId}: ${phase} exact physical targets`);
    for (const [phase,p] of Object.entries(phases)) {
      assert.equal(p.compatibility.state, 'compatible', `${spec.sourceId}: ${phase} faction compatibility`);
      for (const row of evidence(p)) assert.ok(!['parsed-unit-3','parsed-unit-4'].includes(row.target), `${spec.sourceId}: duplicate isolation`);
    }
    const effective = projection => clone(projection.game.units.map(unit => unit.effective));
    assert.deepEqual(effective(detached), effective(unattached), `${spec.sourceId}: detach restores effective datasheets`);
    for (const phase of ['reattached','reloaded','imported']) assert.deepEqual(effective(phases[phase]), effective(attached), `${spec.sourceId}: ${phase} effective datasheets`);
  }
  return {sourceId:spec.sourceId, observations, expected:expectedRows,
    limitations:['Imported fixture points are placeholders; points validation is outside this leading-state guard.',
      'Reload and backup use production parser/project consumers; browser UI/storage is verified separately.']};
}
