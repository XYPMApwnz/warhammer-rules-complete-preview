import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parse} from '../../shared/roster-v2/parser.mjs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {lexicalDraft, importNewRecruit} from '../../shared/roster-v2/import.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(directory, '../../..');
const book = JSON.parse(fs.readFileSync(path.join(directory, 'generated/rule-contract-effective.json'), 'utf8'));
const detachmentId = 'detachment-virulent-vectorium';
const bindingsFor = units => ({detachmentId, units, selections: {}, enhancements: {}});
const run = (text, bindings, rosterId = 'import-control') => importNewRecruit(text, {parse, bindings, book, rosterId});
const ready = result => { assert.equal(result.status, 'READY', JSON.stringify(result)); return result.roster; };
let controls = 0;
const control = fn => { fn(); controls++; };

control(() => {
  const text = '20x Poxwalkers (120 pts)';
  const pending = run(text, {});
  assert.equal(pending.status, 'NEEDS_BINDINGS');
  assert.equal(pending.roster, null);
  assert(!pending.needsBindings.some(item => item.key === 'parsed-unit-1')); // Unit resolved; headerless Detachment is unavailable.
  const roster = ready(run(text, bindingsFor({'parsed-unit-1': 'unit-poxwalkers'})));
  assert.equal(roster.units[0].startingStrength, 20);
  assert.equal(roster.units[0].modelRows[0].canonicalProfileId, 'datasheet-poxwalkers:profile:default');
  assert.equal(roster.units[0].warlord, null);
  assert.equal(roster.warlordInstanceId, null); // No mandatory-Warlord builder validation.
});

control(() => {
  const aggregate = ready(run('5x Plague Marines (90 pts)', bindingsFor({'parsed-unit-1': 'unit-plague-marines'})));
  const detailed = ready(run('1x Plague Marines (90 pts)\n• 1x Plague Champion\n• 4x Plague Marines', bindingsFor({'parsed-unit-1': 'unit-plague-marines'})));
  assert.equal(aggregate.units[0].startingStrength, detailed.units[0].startingStrength);
  assert.equal(detailed.units[0].raw.quantity, 1);
  assert.deepEqual(detailed.units[0].modelRows.map(row => row.quantity), [1, 4]);
});

control(() => {
  const text = '+ DETACHMENT: Virulent Vectorium\n+ WARLORD: Char2: Biologus Putrifier\n+ ENHANCEMENT: Daemon Weapon of Nurgle (on Char1: Biologus Putrifier)\nChar1: 1x Biologus Putrifier (50 pts)\nChar2: 1x Biologus Putrifier (50 pts): Warlord';
  const draft = lexicalDraft(text, parse), bindings = bindingsFor({'parsed-unit-1': 'unit-biologus-putrifier', 'parsed-unit-2': 'unit-biologus-putrifier'});
  assert.equal(draft.enhancements[0].ownerUnitId, 'parsed-unit-1');
  bindings.enhancements[draft.enhancements[0].key] = 'detachment-virulent-vectorium:enhancement:1';
  const roster = ready(run(text, bindings));
  assert.deepEqual(roster.units.map(unit => unit.instanceId), ['parsed-unit-1', 'parsed-unit-2']);
  assert.equal(new Set(roster.units.map(unit => unit.instanceId)).size, 2);
  assert.deepEqual(roster.units.map(unit => unit.warlord), [false, true]);
  assert.equal(roster.warlordInstanceId, 'parsed-unit-2');
  assert.deepEqual(roster.units[0].enhancementIds, ['detachment-virulent-vectorium:enhancement:1']);
  assert.deepEqual(roster.units[1].enhancementIds, []);
  const backup = JSON.parse(JSON.stringify({text, bindings, roster}));
  assert.deepEqual(ready(run(backup.text, backup.bindings)), backup.roster);
  assert.equal(run(text, {}).status, 'READY');
});

control(() => {
  const text = '1x Plague Marines (90 pts)\n• 2x Plague Marines: 2x Boltgun\n• 3x Plague Marines\n2 with Boltgun';
  const draft = lexicalDraft(text, parse), bindings = bindingsFor({'parsed-unit-1': 'unit-plague-marines'});
  const rowSelection = draft.units[0].modelRows[0].selections[0];
  const loadoutSelection = draft.units[0].modelRows[1].loadouts[0].selections[0];
  bindings.selections[rowSelection.key] = {canonicalProfileIds: ['datasheet-plague-marines:weapon:2']};
  bindings.selections[loadoutSelection.key] = {canonicalProfileIds: ['datasheet-plague-marines:weapon:2']};
  const roster = ready(run(text, bindings));
  assert.equal(roster.units[0].startingStrength, 5);
  assert.equal(roster.units[0].modelRows[0].selections[0].perModelQuantity, 2);
  assert.equal(roster.units[0].modelRows[0].selections[0].physicalQuantity, 4);
  assert.equal(roster.units[0].modelRows[1].loadouts[0].selections[0].physicalQuantity, 2);
  assert.equal(roster.units[0].modelRows[1].loadouts[0].quantity, 2);
});

control(() => {
  const text = '1x Plague Marines (90 pts)\n• 5x Plague Marines: Plasma gun';
  const draft = lexicalDraft(text, parse), bindings = bindingsFor({'parsed-unit-1': 'unit-plague-marines'});
  const key = draft.units[0].modelRows[0].selections[0].key;
  bindings.selections[key] = {canonicalProfileIds: ['datasheet-plague-marines:weapon:7', 'datasheet-plague-marines:weapon:8']};
  const selected = ready(run(text, bindings)).units[0].modelRows[0].selections[0];
  assert.equal(selected.physicalQuantity, 5); // Alternative profiles do not double selected weapon quantity.
  assert.equal(selected.canonicalProfileIds.length, 2);
});

control(() => {
  const text = '5x Plague Marines (90 pts): Boltgun', draft = lexicalDraft(text, parse);
  const bindings = bindingsFor({'parsed-unit-1': 'unit-plague-marines'}), key = draft.units[0].selections[0].key;
  bindings.selections[key] = {canonicalProfileIds: ['datasheet-plague-marines:weapon:2']};
  assert.equal(run(text, bindings).status, 'NEEDS_BINDINGS');
  assert(run(text, bindings).needsBindings.some(item => item.kind === 'SELECTION_QUANTITY'));
  bindings.selections[key].physicalQuantity = 5;
  assert.equal(ready(run(text, bindings)).units[0].selections[0].physicalQuantity, 5);
});

control(() => {
  const text = '1x Plague Marines (90 pts)\n• 5x Plague Marines: 0x Boltgun', draft = lexicalDraft(text, parse);
  const bindings = bindingsFor({'parsed-unit-1': 'unit-plague-marines'}), key = draft.units[0].modelRows[0].selections[0].key;
  bindings.selections[key] = {canonicalProfileIds: ['datasheet-plague-marines:weapon:2']};
  assert.equal(ready(run(text, bindings)).units[0].modelRows[0].selections[0].physicalQuantity, 0);
  bindings.selections[key].physicalQuantity = 1;
  assert(run(text, bindings).errors.some(error => error.code === 'CONFLICTING_SELECTION_QUANTITY'));
});

control(() => {
  const text = '1x Plague Marines (90 pts)\n• 1x Plague Champion: Icon of Despair', draft = lexicalDraft(text, parse);
  const bindings = bindingsFor({'parsed-unit-1': 'unit-plague-marines'}), key = draft.units[0].modelRows[0].selections[0].key;
  const source = book.entities.find(entity => entity.id === 'datasheet-plague-marines:wargear:8');
  assert.match(source.data.text, /1 icon of despair/);
  bindings.selections[key] = {canonicalEquipmentIds: [source.id]};
  assert.equal(run(text, bindings).status, 'READY');
  assert(!run(text, bindings).needsBindings.some(item => item.kind === 'SELECTION_FIELD'));
  bindings.selections[key] = {canonicalEquipmentIds: [source.id], canonicalFieldPaths: {[source.id]: ['/text']}};
  const selected = ready(run(text, bindings)).units[0].modelRows[0].selections[0];
  assert.deepEqual(selected.canonicalEquipmentIds, [source.id]);
  assert.equal(selected.physicalQuantity, 1);
  bindings.selections[key].canonicalFieldPaths[source.id] = ['/blocks/999/text'];
  assert(run(text, bindings).errors.some(error => error.code === 'INVALID_SELECTION_FIELD'));
});

control(() => {
  const text = '1x Plague Marines (90 pts): Boltgun', draft = lexicalDraft(text, parse);
  const bindings = bindingsFor({'parsed-unit-1': 'unit-plague-marines'}), key = draft.units[0].selections[0].key;
  bindings.selections[key] = {canonicalProfileIds: ['datasheet-biologus-putrifier:weapon:1']};
  assert(run(text, bindings).errors.some(error => error.code === 'FOREIGN_SELECTION_OWNER'));
  bindings.selections[key] = {canonicalEquipmentIds: ['datasheet-biologus-putrifier:section:1']};
  assert(run(text, bindings).errors.some(error => error.code === 'FOREIGN_SELECTION_OWNER'));
});

control(() => {
  const bindings = bindingsFor({'parsed-unit-1': 'unit-plague-marines'});
  bindings.profiles = {'parsed-unit-1/aggregate': 'datasheet-poxwalkers:profile:default'};
  assert(run('5x Plague Marines (90 pts)', bindings).errors.some(error => error.code === 'FOREIGN_PROFILE_OWNER'));
});

control(() => {
  const text = '1x Biologus Putrifier (50 pts)\nEnhancement: Daemon Weapon of Nurgle';
  const bindings = bindingsFor({'parsed-unit-1': 'unit-biologus-putrifier'});
  bindings.enhancements['enhancement/1'] = 'detachment-shamblerot-vectorium:enhancement:1';
  assert(run(text, bindings).errors.some(error => error.code === 'FOREIGN_ENHANCEMENT_CONTEXT'));
});

control(() => {
  const text = '+ ENHANCEMENT: Daemon Weapon of Nurgle (on Char1: Biologus Putrifier)\nChar1: 1x Biologus Putrifier (50 pts)\nChar1: 1x Biologus Putrifier (50 pts)';
  const bindings = bindingsFor({'parsed-unit-1': 'unit-biologus-putrifier', 'parsed-unit-2': 'unit-biologus-putrifier'});
  bindings.enhancements['enhancement/1'] = 'detachment-virulent-vectorium:enhancement:1';
  assert(run(text, bindings).errors.some(error => error.code === 'UNRESOLVED_ENHANCEMENT_OWNER'));
});

control(() => {
  const text = 'Char1: 1x Biologus Putrifier (50 pts): Warlord\nChar2: 1x Biologus Putrifier (50 pts): Warlord';
  const bindings = bindingsFor({'parsed-unit-1': 'unit-biologus-putrifier', 'parsed-unit-2': 'unit-biologus-putrifier'});
  assert(run(text, bindings).errors.some(error => error.code === 'AMBIGUOUS_WARLORD_IDENTITY'));
  assert.equal(run(text, bindings).roster, null);
});

control(() => {
  const text = '20x Definitely Not a Canonical Title (120 pts)';
  const bindings = bindingsFor({'parsed-unit-1': 'unit-poxwalkers'});
  assert.equal(run(text, bindings).status, 'INVALID'); // Unknown text cannot be rebound to an unrelated unit.
  assert.equal(ready(run('20x Poxwalkers (120 pts)', bindingsFor({}))).units[0].canonicalUnitId,'unit-poxwalkers');
  bindings.units['parsed-unit-1'] = 'unit-does-not-exist';
  assert(run(text, bindings).errors.some(error => error.code === 'INVALID_CANONICAL_BINDING'));
  bindings.units['parsed-unit-1'] = ['unit-poxwalkers', 'unit-plague-marines'];
  assert(run(text, bindings).errors.some(error => error.code === 'AMBIGUOUS_BINDING'));
});

control(() => {
  const text = '1x Plague Marines (90 pts)\n• 2x Plague Marines\n3 with Boltgun';
  const bindings = bindingsFor({'parsed-unit-1': 'unit-plague-marines'});
  assert(run(text, bindings).errors.some(error => error.code === 'INVALID_COMPOSITION'));
  assert.equal(importNewRecruit('{}', {parse, bindings, book}).status, 'INVALID'); // No unsupported native JSON claim.
});

control(() => {
  const text = '20x Poxwalkers (120 pts)', bindings = bindingsFor({'parsed-unit-1': 'unit-poxwalkers'});
  const first = importNewRecruit(text, {parse, bindings, book});
  const second = importNewRecruit(text, {parse, bindings, book});
  assert.deepEqual(first, second);
  assert.notEqual(ready(run(text, bindings, 'roster-a')).rosterId, ready(run(text, bindings, 'roster-b')).rosterId);
  const poison = cloneBook();
  for (const entity of poison.entities) if (entity.data?.title) entity.data.title = 'Legacy title poison';
  assert.equal(importNewRecruit(text, {parse, bindings, book: poison}).status,'INVALID'); // Boundary labels must match; runtime IDs never depend on them.
});

control(() => {
  const text = '20x Poxwalkers (120 pts)', bindings = bindingsFor({'parsed-unit-1': 'unit-poxwalkers'});
  assert.equal(importNewRecruit(text, {parse, bindings: null, book}).status, 'INVALID');
  assert.equal(importNewRecruit(text, {parse, bindings: {...bindings, units: []}, book}).status, 'INVALID');
  const noBookIdentity = cloneBook();
  delete noBookIdentity.bookId;
  assert.equal(importNewRecruit(text, {parse, bindings, book: noBookIdentity}).status, 'INVALID');
  const malformedStoredMapping = JSON.parse(JSON.stringify(bindings));
  malformedStoredMapping.units['parsed-unit-1'] = 'unit-unresolved-stored-id';
  assert.equal(importNewRecruit(text, {parse, bindings: malformedStoredMapping, book}).roster, null);
});

function cloneBook() { return structuredClone(book); }
console.log(JSON.stringify({status: 'PASS', controls, legacyFactualReads: 0, titleIdentityFallbacks: 0}));
