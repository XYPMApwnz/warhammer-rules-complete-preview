import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {validateRosterEffects} from '../../shared/roster-v2/effects.mjs';
import * as evaluator from './rule-contract-schema.mjs';
import {parseSourceHtml, sourceNodeText} from './raw-source.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(directory, '../../..');
const book = JSON.parse(fs.readFileSync(path.join(directory, 'generated/rule-contract-effective.json'), 'utf8'));
const byId = new Map(book.entities.map(entity => [entity.id, entity]));
const parserContext = {window: {}};
vm.createContext(parserContext);
vm.runInContext(fs.readFileSync(path.join(root, 'books/shared/roster-parser.js'), 'utf8'), parserContext);
const api = {...evaluator, parse: parserContext.window.WHRosterParser.parse};
const make = (input = book) => createRosterRuntime(input, api);
const normalized = text => String(text).replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
const rawCache = new Map();
function sourceText(file) {
  if (!rawCache.has(file)) {
    const content = fs.readFileSync(path.join(directory, 'sources/accepted-waha-pages', file), 'utf8');
    rawCache.set(file, normalized(sourceNodeText(content, parseSourceHtml(content))));
  }
  return rawCache.get(file);
}
const currentOfficial = normalized(fs.readFileSync(path.join(directory, 'sources/gw-death-guard-faction-pack-2026-09-30.txt'), 'utf8'));
// Independent, fixed accepted-source expectations. This list neither imports
// producer declarations nor obtains its denominator from generated QA reports.
const sourceCases = [
  ['datasheet-biologus-putrifier:section:1','source-clause-1','Biologus-Putrifier.html','weapons equipped by models in that unit have the [LETHAL HITS] ability'],
  ['datasheet-deathshroud-terminators:section:1','source-clause-1','Deathshroud-Terminators.html','that CHARACTER model has the Feel No Pain 4+ ability'],
  ['datasheet-helbrute:section:1','source-clause-2','Helbrute.html','add 2 to the Attacks characteristic of those two weapons'],
  ['datasheet-icon-bearer:section:1','source-clause-1','Icon-Bearer.html','add 1 to the Objective Control characteristic of models in that unit'],
  ['datasheet-lord-of-contagion:section:1','source-clause-1','Lord-of-Contagion.html','melee weapons equipped by models in that unit have the [SUSTAINED HITS 1] and [LANCE] abilities'],
  ['datasheet-lord-of-poxes:section:1','source-clause-1','Lord-of-Poxes.html','Add 3" to the range of this model’s Contagion Range'],
  ['datasheet-noxious-blightbringer:section:1','source-clause-1','Noxious-Blightbringer.html','add 1" to the Move characteristic of models in that unit'],
  ['datasheet-plague-drones:section:1','source-clause-2','Plague-Drones.html','Models in the bearer’s unit have a Leadership characteristic of 6+'],
  ['datasheet-plaguebearers:section:1','source-clause-2','Plaguebearers.html','Models in the bearer’s unit have a Leadership characteristic of 6+'],
  ['detachment-virulent-vectorium:enhancement:2','weapon-modifiers','death-guard.html','Add 1 to the Strength and Attacks characteristics of the bearers melee weapons'],
  ['detachment-virulent-vectorium:enhancement:4','feel-no-pain','death-guard.html','The bearer has the Feel No Pain 5+ ability'],
  ['detachment-shamblerot-vectorium:enhancement:1','objective-control','death-guard.html','add 1 to the Objective Control characteristic of models in that unit'],
  ['detachment-shamblerot-vectorium:enhancement:3','plague-wind-damage','death-guard.html','add 1 to the Damage characteristic of the bearer’s Plague Wind weapon'],
  ['detachment-shamblerot-vectorium:enhancement:4','poxwalkers-toughness','death-guard.html','add 1 to the Toughness characteristic of POXWALKERS models in that unit'],
  ['detachment-tallyband-summoners:enhancement:2','melee-attacks','death-guard.html','Add 2 to the Attacks characteristic of the bearer’s melee weapons'],
  ['detachment-death-lords-chosen:enhancement:2','movement','death-guard.html','add 1" to the Movement characteristic of models in that unit'],
  ['detachment-contagion-engines:enhancement:2','mobile','death-guard.html','This unit has MOBILE'],
  ['detachment-flyblown-host:enhancement:2','detection-range','death-guard.html','This unit has -3" detection range'],
  ['detachment-shamblerot-vectorium:rule','battleline','death-guard.html','POXWALKERS units from your army gain the BATTLELINE keyword'],
  ['detachment-paragons-of-putrescence:rule','contagion-range','death-guard.html','Friendly DEATH GUARD CHARACTER units have +3" to their Contagion Range'],
  ['detachment-contagion-engines:rule','grant-contagion-engine','death-guard.html','units have CONTAGION ENGINE'],
  ['detachment-contagion-engines:rule','ranged-assault','death-guard.html','Friendly CONTAGION ENGINE units’ ranged attacks have [ASSAULT]']
];
for (const [id, clauseId, file, quote] of sourceCases) {
  assert(sourceText(file).includes(normalized(quote)) || currentOfficial.includes(normalized(quote)), `Accepted source expectation missing: ${id}/${clauseId}`);
  assert(byId.get(id)?.ruleContract.clauses.some(clause => clause.id === clauseId), `Missing existing canonical clause: ${id}/${clauseId}`);
}
const expectedPaths = new Set(sourceCases.map(([id, clause]) => `${id}/${clause}`));
// Operation semantics independently transcribed from the same source passages.
// Ordinal correspondence is sourceCases order, never generated effect order.
const sourceOperations = [
  ['GRANT_WEAPON_ABILITY|SOURCE_FORMED_MODELS|LETHAL HITS'],
  ['GRANT_MODEL_ABILITY|LEADERS_OF_SOURCE|Feel No Pain:4'],
  ['MODIFY_STAT|SOURCE_MODEL|attacks:ADD:2'],
  ['MODIFY_STAT|SOURCE_FORMED_MODELS|OC:ADD:1'],
  ['GRANT_WEAPON_ABILITY|SOURCE_FORMED_MODELS|SUSTAINED HITS 1','GRANT_WEAPON_ABILITY|SOURCE_FORMED_MODELS|LANCE'],
  ['MODIFY_RULE_METRIC|SOURCE_MODEL|contagionRange:ADD:3:12'],
  ['MODIFY_STAT|SOURCE_FORMED_MODELS|M:ADD:1'],
  ['MODIFY_STAT|SOURCE_UNIT_MODELS|LD:SET:6'],
  ['MODIFY_STAT|SOURCE_UNIT_MODELS|LD:SET:6'],
  ['MODIFY_STAT|SOURCE_MODEL|strength:ADD:1','MODIFY_STAT|SOURCE_MODEL|attacks:ADD:1','GRANT_WEAPON_ABILITY|SOURCE_MODEL|DEVASTATING WOUNDS'],
  ['GRANT_MODEL_ABILITY|SOURCE_MODEL|Feel No Pain:5'],
  ['MODIFY_STAT|SOURCE_FORMED_MODELS|OC:ADD:1'],
  ['MODIFY_STAT|SOURCE_MODEL|damage:ADD:1'],
  ['MODIFY_STAT|SOURCE_FORMED_MODELS|T:ADD:1'],
  ['MODIFY_STAT|SOURCE_MODEL|attacks:ADD:2'],
  ['MODIFY_STAT|SOURCE_FORMED_MODELS|M:ADD:1'],
  ['GRANT_UNIT_KEYWORD|SOURCE_UNIT|MOBILE'],
  ['MODIFY_RULE_METRIC|SOURCE_UNIT|detectionRange:ADD:-3'],
  ['GRANT_UNIT_KEYWORD|ROSTER_UNITS|BATTLELINE'],
  ['MODIFY_RULE_METRIC|ROSTER_UNITS|contagionRange:ADD:3:12'],
  ['GRANT_UNIT_KEYWORD|ROSTER_UNITS|CONTAGION ENGINE'],
  ['GRANT_WEAPON_ABILITY|ROSTER_UNITS|ASSAULT']
];
const operationSignature = effect => [effect.operation,effect.targetBinding,
  effect.field ? [effect.field,effect.mode,effect.value,...(effect.max === undefined ? [] : [effect.max])].join(':') :
  effect.keyword || (typeof effect.ability === 'string' ? effect.ability : `${effect.ability.name}:${effect.ability.value}`)].join('|');
for (const [[ruleId,clauseId],i] of sourceCases.map((record,index)=>[record,index])) {
  const clause = byId.get(ruleId).ruleContract.clauses.find(clause=>clause.id===clauseId);
  assert.deepEqual(clause.rosterEffects.map(operationSignature).sort(), [...sourceOperations[i]].sort(), `Source operation parity: ${ruleId}/${clauseId}`);
}
const actualPaths = new Set(book.entities.flatMap(entity => (entity.ruleContract?.clauses || []).filter(clause => clause.rosterClassification === 'ROSTER_EXECUTABLE').map(clause => `${entity.id}/${clause.id}`)));
assert.deepEqual(actualPaths, expectedPaths, 'Source-backed executable clause class coverage');
const covered = new Set(), coveredEffects = new Set();
let scenarios = 0;
function capture(service) {
  for (const unit of service.projection.units) for (const applied of unit.applied) {
    covered.add(`${applied.ruleId}/${applied.clauseId}`);
    coveredEffects.add(`${applied.ruleId}/${applied.effectId}`);
  }
}
function row(instance, canonicalUnitId, count, weapons = []) {
  return {rowId: `${instance}/row`, quantity: count,
    canonicalProfileId: byId.get(canonicalUnitId).data.profileIds[0], loadouts: [],
    selections: weapons.map((id, i) => ({selectionKey: `${instance}/weapon/${i}`, canonicalProfileIds: [id], canonicalEquipmentIds: [],
      canonicalFieldPaths: {}, perModelQuantity: 1, physicalQuantity: count}))};
}
function unit(instanceId, canonicalUnitId, count = 1, options = {}) {
  return {instanceId, canonicalUnitId, startingStrength: count, warlord: options.warlord ?? false,
    modelRows: options.rows || [row(instanceId, canonicalUnitId, count, options.weapons || [])],
    selections: options.selections || [], enhancementIds: options.enhancements || []};
}
function state(units, detachmentId = 'detachment-virulent-vectorium') {
  return {schema: 'roster-v2/roster', rosterId: 'runtime-qa', bookId: book.bookId, detachmentId,
    warlordInstanceId: units.find(unit => unit.warlord)?.instanceId || null, units, attachments: []};
}
function scenario(run) { run(); scenarios++; }
const projected = (service, id) => service.projection.units.find(unit => unit.instanceId === id);
const weapon = (service, instance, id) => projected(service, instance).models.flatMap(model => model.weapons).find(weapon => weapon.canonicalProfileId === id);
const hasAbility = (weapon, name) => weapon.data.abilities.some(ability => normalized(ability) === normalized(name));
const assertAll = (service, instance, field, value) => assert(projected(service, instance).models.every(model => model.profile[field] === value));

scenario(() => {
  const service = make();
  const text = '+ WARLORD: Char2: Lord of Contagion\nChar1: 1x Biologus Putrifier (50 pts)\nChar2: 1x Lord of Contagion (100 pts)';
  assert.equal(service.import(text, {detachmentId: 'detachment-virulent-vectorium', units: {'parsed-unit-1': 'unit-biologus-putrifier', 'parsed-unit-2': 'unit-lord-of-contagion'}}).status, 'READY');
  assert.equal(service.related('parsed-unit-1').find(row => row.ruleId === 'detachment-virulent-vectorium:stratagem:3').state, 'FALSE');
  assert.equal(service.related('parsed-unit-2').find(row => row.ruleId === 'detachment-virulent-vectorium:stratagem:3').state, 'UNKNOWN');
  const snapshot = JSON.parse(JSON.stringify(service.snapshot())); service.load(snapshot);
  assert.equal(service.context('parsed-unit-2', 'MODEL').roster.isWarlord, true);
  assert.equal(service.context('parsed-unit-1', 'MODEL').roster.isWarlord, false);
});

scenario(() => {
  const bodyguard = unit('pm', 'unit-plague-marines', 5, {rows: [row('pm/melta', 'unit-plague-marines', 1, ['datasheet-plague-marines:weapon:4']), row('pm/bolt', 'unit-plague-marines', 4, ['datasheet-plague-marines:weapon:2'])]});
  const service = make(); service.load(state([unit('bio', 'unit-biologus-putrifier'), unit('bio2', 'unit-biologus-putrifier'), bodyguard, unit('pm2', 'unit-plague-marines', 5, {weapons: ['datasheet-plague-marines:weapon:4']})]));
  assert(!hasAbility(weapon(service, 'pm', 'datasheet-plague-marines:weapon:4'), 'LETHAL HITS'));
  service.attach('bio', 'pm');
  assert(hasAbility(weapon(service, 'pm', 'datasheet-plague-marines:weapon:4'), 'LETHAL HITS'));
  assert(!hasAbility(weapon(service, 'pm2', 'datasheet-plague-marines:weapon:4'), 'LETHAL HITS'));
  for (const candidate of projected(service, 'pm').models.flatMap(model => model.weapons)) assert.equal(new Set(candidate.data.abilities.map(normalized)).size, candidate.data.abilities.length);
  assert.throws(() => service.attach('bio2', 'pm'), /Duplicate canonical Leader/);
  capture(service);
  service.detach('bio'); assert(!hasAbility(weapon(service, 'pm', 'datasheet-plague-marines:weapon:4'), 'LETHAL HITS'));
  service.reattach('bio', 'pm'); assert(hasAbility(weapon(service, 'pm', 'datasheet-plague-marines:weapon:4'), 'LETHAL HITS'));
  service.load(JSON.parse(JSON.stringify(service.snapshot())));
  assert.equal(service.projection.formedUnits[0].startingStrength, 6);
});

scenario(() => {
  const service = make(); service.load(state([unit('loc', 'unit-lord-of-contagion', 1, {weapons: ['datasheet-lord-of-contagion:weapon:1'], enhancements: ['detachment-virulent-vectorium:enhancement:4']}), unit('loc2', 'unit-lord-of-contagion'), unit('ds', 'unit-deathshroud-terminators', 3, {weapons: ['datasheet-deathshroud-terminators:weapon:2']}), unit('ds2', 'unit-deathshroud-terminators', 3)]));
  assert.deepEqual(projected(service, 'loc').models[0].abilities.filter(ability => ability.name === 'Feel No Pain'), [{name: 'Feel No Pain', value: 5}]);
  service.attach('loc', 'ds');
  assert.deepEqual(projected(service, 'loc').models[0].abilities.filter(ability => ability.name === 'Feel No Pain'), [{name: 'Feel No Pain', value: 4}]);
  assert(!projected(service, 'ds').models.some(model => model.abilities.some(ability => ability.name === 'Feel No Pain')));
  assert(!projected(service, 'loc2').models[0].abilities.some(ability => ability.name === 'Feel No Pain'));
  assert(hasAbility(weapon(service, 'ds', 'datasheet-deathshroud-terminators:weapon:2'), 'LANCE'));
  assert(hasAbility(weapon(service, 'ds', 'datasheet-deathshroud-terminators:weapon:2'), 'SUSTAINED HITS 1'));
  assert(service.context('ds', 'UNIT').keywords.has('CHARACTER'));
  assert(!service.context('ds', 'MODEL').keywords.has('CHARACTER'));
  assert.equal(service.context('loc', 'UNIT').unitId, 'unit-deathshroud-terminators');
  assert.equal(service.context('loc', 'MODEL').modelId, 'datasheet-lord-of-contagion:profile:default');
  assert.equal(evaluator.evaluatePredicate({predicate: 'UNIT_ID', subject: 'UNIT', contextLevel: 'STATIC', arguments: {id: 'unit-deathshroud-terminators'}}, service.context('loc', 'UNIT')), 'TRUE');
  assert.equal(evaluator.evaluatePredicate({predicate: 'MODEL_ID', subject: 'MODEL', contextLevel: 'STATIC', arguments: {id: 'datasheet-lord-of-contagion:profile:default'}}, service.context('loc', 'MODEL')), 'TRUE');
  assert.equal(evaluator.evaluatePredicate({predicate: 'MODEL_ID', subject: 'MODEL', contextLevel: 'STATIC', arguments: {id: 'datasheet-lord-of-contagion:profile:default'}}, service.context('ds', 'UNIT')), 'INVALID');
  assert.throws(() => service.attach('loc2', 'ds'), /capacity/);
  capture(service); service.detach('loc');
  assert.deepEqual(projected(service, 'loc').models[0].abilities.filter(ability => ability.name === 'Feel No Pain'), [{name: 'Feel No Pain', value: 5}]);
  assert(!hasAbility(weapon(service, 'ds', 'datasheet-deathshroud-terminators:weapon:2'), 'LANCE'));
});

scenario(() => {
  const service = make(); service.load(state([unit('icon', 'unit-icon-bearer'), unit('poxlord', 'unit-lord-of-poxes'), unit('third', 'unit-biologus-putrifier'), unit('pm', 'unit-plague-marines', 5), unit('pm2', 'unit-plague-marines', 5)]));
  service.attach('poxlord', 'pm'); service.attach('icon', 'pm');
  assert.throws(() => service.attach('third', 'pm'), /capacity/);
  assert.equal(service.state.attachments.length, 2); assertAll(service, 'pm', 'OC', '3');
  assertAll(service, 'pm2', 'OC', '2'); assertAll(service, 'icon', 'OC', '2');
  capture(service); service.detach('icon'); assertAll(service, 'pm', 'OC', '2');
  service.reattach('icon', 'pm2'); assertAll(service, 'pm2', 'OC', '3'); assertAll(service, 'pm', 'OC', '2');
});

scenario(() => {
  const service = make(); service.load(state([unit('poxlord', 'unit-lord-of-poxes'), unit('other', 'unit-biologus-putrifier'), unit('pm', 'unit-plague-marines', 5), unit('pm2', 'unit-plague-marines', 5)], 'detachment-paragons-of-putrescence'));
  assert.equal(projected(service, 'poxlord').models[0].metrics.contagionRange.modifier, 6);
  assert.equal(projected(service, 'other').models[0].metrics.contagionRange.modifier, 3);
  assert.equal(projected(service, 'pm').models[0].metrics.contagionRange, undefined);
  service.attach('poxlord', 'pm');
  assert.equal(projected(service, 'pm').models[0].metrics.contagionRange.modifier, 3);
  assert.equal(projected(service, 'poxlord').models[0].metrics.contagionRange.modifier, 6);
  assert.equal(projected(service, 'poxlord').models[0].metrics.contagionRange.max, 12);
  assert.equal(service.projection.formedUnits[0].metrics.contagionRange.modifier, 3, 'Global UNIT modifier applies once to the formed group');
  assert.equal(projected(service, 'pm2').models[0].metrics.contagionRange, undefined);
  capture(service); service.detach('poxlord'); assert.equal(projected(service, 'pm').models[0].metrics.contagionRange, undefined);
});

scenario(() => {
  const service = make(); service.load(state([unit('h', 'unit-helbrute', 1, {weapons: ['datasheet-helbrute:weapon:10','datasheet-helbrute:weapon:11','datasheet-helbrute:weapon:12']}), unit('h2', 'unit-helbrute', 1, {weapons: ['datasheet-helbrute:weapon:10','datasheet-helbrute:weapon:11']})]));
  assert.equal(weapon(service, 'h', 'datasheet-helbrute:weapon:11').data.attacks, '7');
  assert.equal(weapon(service, 'h', 'datasheet-helbrute:weapon:12').data.attacks, '6');
  assert.equal(weapon(service, 'h', 'datasheet-helbrute:weapon:10').data.attacks, '5');
  assert.equal(weapon(service, 'h2', 'datasheet-helbrute:weapon:11').data.attacks, '5');
  capture(service);
});

scenario(() => {
  const service = make(); service.load(state([unit('nox', 'unit-noxious-blightbringer'), unit('pm', 'unit-plague-marines', 5), unit('pm2', 'unit-plague-marines', 5)]));
  assertAll(service, 'pm', 'M', '5"'); service.attach('nox', 'pm');
  assertAll(service, 'pm', 'M', '6"'); assertAll(service, 'nox', 'M', '6"'); assertAll(service, 'pm2', 'M', '5"');
  assert(projected(service, 'nox').conditional.some(row => row.state === 'UNKNOWN'));
  capture(service); service.detach('nox'); assertAll(service, 'pm', 'M', '5"');
});

for (const [slug, count] of [['plague-drones', 3], ['plaguebearers', 10]]) scenario(() => {
  const selected = {selectionKey: 'icon', canonicalProfileIds: [], canonicalEquipmentIds: [`datasheet-${slug}:wargear:2`], canonicalFieldPaths: {[`datasheet-${slug}:wargear:2`]: ['/text']}, physicalQuantity: 1};
  const service = make(); service.load(state([unit('with', `unit-${slug}`, count, {selections: [selected]}), unit('without', `unit-${slug}`, count)]));
  assertAll(service, 'with', 'LD', '6+'); assertAll(service, 'without', 'LD', '7+'); capture(service);
  const cleared = service.snapshot(); cleared.units[0].selections[0].physicalQuantity = 0; service.load(cleared);
  assertAll(service, 'with', 'LD', '7+');
});

scenario(() => {
  const service = make(); service.load(state([unit('enhanced', 'unit-lord-of-contagion', 1, {weapons: ['datasheet-lord-of-contagion:weapon:1'], enhancements: ['detachment-virulent-vectorium:enhancement:2','detachment-virulent-vectorium:enhancement:4']}), unit('ordinary', 'unit-lord-of-contagion', 1, {weapons: ['datasheet-lord-of-contagion:weapon:1']})]));
  const enhanced = weapon(service, 'enhanced', 'datasheet-lord-of-contagion:weapon:1');
  assert.equal(enhanced.data.strength, '10'); assert.equal(enhanced.data.attacks, '6'); assert(hasAbility(enhanced, 'DEVASTATING WOUNDS'));
  assert.equal(weapon(service, 'ordinary', 'datasheet-lord-of-contagion:weapon:1').data.strength, '9');
  assert.deepEqual(projected(service, 'enhanced').models[0].abilities.filter(ability => ability.name === 'Feel No Pain'), [{name: 'Feel No Pain', value: 5}]); capture(service);
});

scenario(() => {
  const service = make(); service.load(state([unit('nox', 'unit-noxious-blightbringer', 1, {enhancements: ['detachment-shamblerot-vectorium:enhancement:1']}), unit('caster', 'unit-malignant-plaguecaster', 1, {weapons: ['datasheet-malignant-plaguecaster:weapon:2'], enhancements: ['detachment-shamblerot-vectorium:enhancement:3','detachment-shamblerot-vectorium:enhancement:4']}), unit('pox', 'unit-poxwalkers', 20), unit('pox2', 'unit-poxwalkers', 10), unit('pm', 'unit-plague-marines', 5)], 'detachment-shamblerot-vectorium'));
  assert.equal(weapon(service, 'caster', 'datasheet-malignant-plaguecaster:weapon:2').data.damage, 'D3');
  service.attach('nox', 'pox'); service.attach('caster', 'pox');
  assertAll(service, 'pox', 'OC', '2'); assertAll(service, 'pox', 'T', '5');
  assertAll(service, 'caster', 'T', '6'); assertAll(service, 'nox', 'T', '6');
  assert.equal(weapon(service, 'caster', 'datasheet-malignant-plaguecaster:weapon:2').data.damage, 'D3+1');
  assert(projected(service, 'pox').keywords.includes('BATTLELINE')); assert(projected(service, 'pox2').keywords.includes('BATTLELINE'));
  assert(!projected(service, 'pm').applied.some(row => row.ruleId === 'detachment-shamblerot-vectorium:rule'));
  capture(service); service.reattach('caster', 'pm');
  assert.equal(weapon(service, 'caster', 'datasheet-malignant-plaguecaster:weapon:2').data.damage, 'D3');
  assertAll(service, 'pox', 'T', '4');
});

scenario(() => {
  const service = make(); service.load(state([unit('fell', 'unit-lord-of-contagion', 1, {weapons: ['datasheet-lord-of-contagion:weapon:1'], enhancements: ['detachment-tallyband-summoners:enhancement:2']})], 'detachment-tallyband-summoners'));
  assert.equal(weapon(service, 'fell', 'datasheet-lord-of-contagion:weapon:1').data.attacks, '7'); capture(service);
});

scenario(() => {
  const service = make(); service.load(state([unit('vile', 'unit-lord-of-contagion', 1, {enhancements: ['detachment-death-lords-chosen:enhancement:2']}), unit('ds', 'unit-deathshroud-terminators', 3)], 'detachment-death-lords-chosen'));
  assertAll(service, 'ds', 'M', '5"'); service.attach('vile', 'ds'); assertAll(service, 'ds', 'M', '6"'); assertAll(service, 'vile', 'M', '6"'); capture(service);
});

scenario(() => {
  const service = make(); service.load(state([unit('h', 'unit-helbrute', 1, {weapons: ['datasheet-helbrute:weapon:9'], enhancements: ['detachment-contagion-engines:enhancement:2']}), unit('h2', 'unit-helbrute', 1, {weapons: ['datasheet-helbrute:weapon:9']}), unit('haulers', 'unit-myphitic-blight-hauler', 2, {weapons: ['datasheet-myphitic-blight-hauler:weapon:1']}), unit('pm', 'unit-plague-marines', 5, {weapons: ['datasheet-plague-marines:weapon:2']})], 'detachment-contagion-engines'));
  assert(projected(service, 'h').keywords.includes('MOBILE')); assert(!projected(service, 'h2').keywords.includes('MOBILE'));
  for (const instance of ['h', 'h2', 'haulers']) {
    assert(projected(service, instance).keywords.includes('CONTAGION ENGINE'));
    for (const model of projected(service, instance).models) for (const weapon of model.weapons) assert(hasAbility(weapon, 'ASSAULT'));
  }
  assert(!projected(service, 'pm').keywords.includes('CONTAGION ENGINE')); assert(!hasAbility(weapon(service, 'pm', 'datasheet-plague-marines:weapon:2'), 'ASSAULT'));
  capture(service);
});

scenario(() => {
  const service = make(); service.load(state([unit('veiled', 'unit-plague-marines', 5, {enhancements: ['detachment-flyblown-host:enhancement:2']}), unit('bio', 'unit-biologus-putrifier'), unit('ordinary', 'unit-plague-marines', 5)], 'detachment-flyblown-host'));
  assert.equal(projected(service, 'veiled').models[0].metrics.detectionRange.modifier, -3);
  assert.equal(projected(service, 'ordinary').models[0].metrics.detectionRange, undefined);
  assert.equal(projected(service, 'bio').models[0].metrics.detectionRange, undefined);
  service.attach('bio', 'veiled');
  assert.equal(projected(service, 'bio').models[0].metrics.detectionRange.modifier, -3);
  assert.equal(projected(service, 'veiled').models[0].metrics.detectionRange.modifier, -3);
  capture(service); service.detach('bio');
  assert.equal(projected(service, 'bio').models[0].metrics.detectionRange, undefined);
  assert.equal(projected(service, 'veiled').models[0].metrics.detectionRange.modifier, -3);
});

scenario(() => {
  const service = make();
  assert.equal(service.import('1x Plaguebearers (110 pts)', {detachmentId:'detachment-virulent-vectorium',units:{'parsed-unit-1':'unit-plaguebearers'}}).status, 'READY');
  assertAll(service,'parsed-unit-1','LD','7+');
  assert(projected(service,'parsed-unit-1').conditional.some(row=>row.ruleId==='datasheet-plaguebearers:section:1' && row.clauseId==='source-clause-2' && row.state==='UNKNOWN'));
  const snapshot = service.snapshot();
  snapshot.units[0].selections = [{selectionKey:'explicit-zero',canonicalProfileIds:[],canonicalEquipmentIds:['datasheet-plaguebearers:wargear:2'],canonicalFieldPaths:{'datasheet-plaguebearers:wargear:2':['/text']},physicalQuantity:0}];
  snapshot.units[0].equipmentContextKnown=true;
  service.load(snapshot);
  assertAll(service,'parsed-unit-1','LD','7+');
  assert(!projected(service,'parsed-unit-1').conditional.some(row=>row.ruleId==='datasheet-plaguebearers:section:1' && row.clauseId==='source-clause-2'));
});

assert.deepEqual(covered, expectedPaths, 'Every independently enumerated source clause has a positive runtime control');
const expectedEffects = new Set(book.entities.flatMap(entity => (entity.ruleContract?.clauses || []).flatMap(clause => clause.rosterEffects.map(effect => `${entity.id}/${effect.id}`))));
assert.deepEqual(coveredEffects, expectedEffects, 'All operations within the source-backed clause controls executed');
assert.equal(coveredEffects.size, sourceOperations.flat().length, 'Independent source operation denominator');

let negatives = 0;
const reject = mutate => { const poisoned = structuredClone(book); mutate(poisoned); assert.throws(() => validateRosterEffects(poisoned, evaluator.validatePredicate, evaluator.evaluatePredicate)); negatives++; };
const effect = input => input.entities.find(entity => entity.id === 'datasheet-lord-of-poxes:section:1').ruleContract.clauses.find(clause => clause.id === 'source-clause-1').rosterEffects[0];
reject(input => { effect(input).targetSubject = 'UNIT'; });
reject(input => { effect(input).operation = 'INVENTED_OPERATION'; });
reject(input => { effect(input).evidence.quote = 'Invented source assertion'; });
reject(input => { effect(input).conditions = [{binding: 'SOURCE', predicate: {predicate: 'INVENTED_PREDICATE', subject: 'MODEL', contextLevel: 'STATIC', arguments: {}, evidence: effect(input).evidence}}]; });
reject(input => { input.entities.find(entity => entity.id === 'detachment-shamblerot-vectorium:enhancement:3').ruleContract.clauses.find(clause => clause.id === 'plague-wind-damage').rosterEffects[0].weaponIds = ['datasheet-plague-marines:weapon:2']; });

scenario(() => {
  const input = structuredClone(book), service = make(input), fixture = state([unit('lord', 'unit-lord-of-poxes')]);
  service.load(fixture); const before = service.projection;
  globalThis.WH_DG_DATA = {poison: true}; globalThis.WHRosterContext = {get() {throw new Error('Legacy factual read');}};
  input.entities.find(entity => entity.id === 'datasheet-lord-of-poxes:profile:default').data.T = '999';
  service.load(JSON.parse(JSON.stringify(fixture))); assert.deepEqual(service.projection, before);
  delete globalThis.WH_DG_DATA; delete globalThis.WHRosterContext;
  const clone = make(); clone.load(fixture); assert.deepEqual(clone.projection, before);
});

console.log(JSON.stringify({status: 'PASS', sourceClauses: expectedPaths.size, operationsExecuted: coveredEffects.size,
  scenarios, negativeControls: negatives, legacyRuntimeAuthority: 0, deterministicRecompute: 'PASS'}));
