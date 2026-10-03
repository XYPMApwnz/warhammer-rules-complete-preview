import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {parse} from '../../shared/roster-v2/parser.mjs';
import {fileURLToPath} from 'node:url';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import * as evaluator from './rule-contract-schema.mjs';
import {parseSourceHtml, sourceNodeText} from './raw-source.mjs';

// Permanent controls for physical UNIT identity and grouped MODEL semantics.
// Expected quantities, recipients and characteristics below are fixed controls,
// independent of the producer's projection or generated QA denominators.
const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(directory, '../../..');
const book = JSON.parse(fs.readFileSync(path.join(directory, 'generated/rule-contract-effective.json'), 'utf8'));
const api = {...evaluator, parse};
const make = () => createRosterRuntime(book, api);
const normalized = value => String(value).replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
const currentOfficial = normalized(fs.readFileSync(path.join(directory, 'sources/gw-death-guard-faction-pack-2026-09-30.txt'), 'utf8'));
const sourceCases = [
  ['Biologus-Putrifier.html', 'weapons equipped by models in that unit have the [LETHAL HITS] ability'],
  ['Noxious-Blightbringer.html', 'add 1" to the Move characteristic of models in that unit'],
  ['Deathshroud-Terminators.html', 'that CHARACTER model has the Feel No Pain 4+ ability'],
  ['Plaguebearers.html', 'Models in the bearer’s unit have a Leadership characteristic of 6+'],
  ['death-guard.html', 'Add 1 to the Strength and Attacks characteristics of the bearers melee weapons'],
  ['death-guard.html', 'The bearer has the Feel No Pain 5+ ability'],
  ['Plague-Marines.html', 'Icon of Despair']
];
for (const [file, quote] of sourceCases) {
  const raw = fs.readFileSync(path.join(directory, 'sources/accepted-waha-pages', file), 'utf8');
  assert(normalized(sourceNodeText(raw, parseSourceHtml(raw))).includes(normalized(quote)) || currentOfficial.includes(normalized(quote)), `Accepted source missing: ${file}: ${quote}`);
}
const PM = 'unit-plague-marines', PM_PROFILE = 'datasheet-plague-marines:profile:default';
const MELTA = 'datasheet-plague-marines:weapon:4', BOLT = 'datasheet-plague-marines:weapon:2', KNIFE = 'datasheet-plague-marines:weapon:13';
const LAUNCHER = 'datasheet-plague-marines:weapon:1';
const MANREAPER = 'datasheet-lord-of-contagion:weapon:1';
const BIO_RULE = 'datasheet-biologus-putrifier:section:1';
const NOX_RULE = 'datasheet-noxious-blightbringer:section:1';
const FURNACE = 'detachment-virulent-vectorium:enhancement:2';
const REGEN = 'detachment-virulent-vectorium:enhancement:4';
let controls = 0, mutations = 0, invalidBackups = 0;
const control = fn => { fn(); controls++; };
const projected = (service, id) => service.projection.units.find(unit => unit.instanceId === id);
const allWeapons = unit => [...unit.weapons, ...unit.profiles.flatMap(profile => profile.weapons)];
const ability = (weapon, name) => weapon.data.abilities.some(value => normalized(value) === normalized(name));
const gear = (service, instance, id) => allWeapons(projected(service, instance)).filter(weapon => weapon.canonicalProfileId === id);
const everyField = (service, instance, field, value) => assert(projected(service, instance).profiles.every(profile => profile.profile[field] === value), `${instance}/${field}=${value}`);
const quantity = (unit, id) => allWeapons(unit).filter(weapon => weapon.canonicalProfileId === id).reduce((total, weapon) => total + weapon.physicalQuantity, 0);
const field = (profile, key) => profile.fields.find(row => row.label === key)?.value;
const mutateReject = (value, mutate, validate) => {
  const poisoned = structuredClone(value); mutate(poisoned);
  assert.throws(() => validate(poisoned), assert.AssertionError); mutations++;
};

function importText(text, units, selectionBindings = {}, enhancements = {}) {
  const service = make();
  const draft = service.draft(text);
  const bindings = {detachmentId: 'detachment-virulent-vectorium', units, selections: {}, enhancements};
  for (const unit of draft.units) {
    const selected = [...unit.selections, ...unit.modelRows.flatMap(row => [...row.selections, ...row.loadouts.flatMap(loadout => loadout.selections)])];
    for (const selection of selected) {
      const binding = selectionBindings[`${unit.id}/${selection.label}`] || selectionBindings[selection.label];
      assert(binding, `Fixture lacks explicit canonical gear binding: ${unit.id}/${selection.label}`);
      bindings.selections[selection.key] = structuredClone(binding);
    }
  }
  const result = service.import(text, bindings);
  assert.equal(result.status, 'READY', JSON.stringify(result));
  return service;
}
const standardGear = {
  'Blight launcher': {canonicalProfileIds: [LAUNCHER]}, Meltagun: {canonicalProfileIds: [MELTA]}, Boltgun: {canonicalProfileIds: [BOLT]},
  'Plague knives': {canonicalProfileIds: [KNIFE]},
  'Icon of Despair': {canonicalEquipmentIds: ['datasheet-plague-marines:wargear:8'], canonicalFieldPaths: {'datasheet-plague-marines:wargear:8': ['/text']}}
};
const main = () => importText('Char1: 1x Biologus Putrifier (50 pts)\n5x Plague Marines (90 pts): 1x Meltagun, 4x Boltgun, 5x Plague knives', {
  'parsed-unit-1': 'unit-biologus-putrifier', 'parsed-unit-2': PM
}, standardGear);

function assertAggregate(unit, expectedStrength, expectedGear) {
  assert.equal(unit.startingStrength, expectedStrength);
  assert.equal(unit.profiles.length, 1, 'Starting Strength must not materialize individual models');
  assert.equal(unit.profiles[0].quantity, expectedStrength);
  assert.equal(unit.profiles[0].canonicalProfileId, PM_PROFILE);
  assert.equal(unit.profiles[0].modelInstanceId, null, 'Aggregate infantry has no proven individual model owner');
  assert.equal(typeof unit.profiles[0].scopeId, 'string');
  assert.equal(unit.models, undefined, 'Projection uses grouped profile scopes');
  assert.equal(new Set(unit.profiles.map(profile => profile.scopeId)).size, unit.profiles.length);
  for (const [id, count] of expectedGear) {
    assert.equal(quantity(unit, id), count, `Physical gear quantity: ${id}`);
    assert(unit.weapons.some(weapon => weapon.canonicalProfileId === id));
  }
  for (const weapon of unit.weapons) assert.equal(weapon.modelInstanceId, null, 'Unit aggregate gear cannot acquire a fictional model owner');
}
function assertBioRecipients(unit, enabled, expectedStrength = 5, expectedGear = [[MELTA, 1], [BOLT, 4], [KNIFE, 5]]) {
  assertAggregate(unit, expectedStrength, expectedGear);
  const meltas = allWeapons(unit).filter(weapon => weapon.canonicalProfileId === MELTA);
  assert(meltas.length);
  assert(meltas.every(weapon => ability(weapon, 'LETHAL HITS') === enabled));
  if (enabled) {
    assert(allWeapons(unit).every(weapon => ability(weapon, 'LETHAL HITS')), 'Every selected weapon must retain the source-defined granted ability');
    const proof = unit.applied.filter(row => row.ruleId === BIO_RULE && row.targetWeaponProfileId === MELTA);
    assert.equal(proof.length, 1, 'One provenance record per grouped aggregate weapon effect');
    assert.equal(proof[0].sourceInstanceId, 'parsed-unit-1');
    assert.equal(proof[0].targetInstanceId, unit.instanceId);
    assert.equal(proof[0].targetModelInstanceId, null, 'Aggregate provenance must not invent an owner');
    assert.equal(proof[0].targetProfileId, null, 'Unit aggregate gear has no proven MODEL profile owner');
    assert.equal(proof[0].targetCompositionId, null);
  } else assert(!unit.applied.some(row => row.ruleId === BIO_RULE));
}

control(() => {
  const service = main(), pm = 'parsed-unit-2';
  assertBioRecipients(projected(service, pm), false);
  service.attach('parsed-unit-1', pm);
  assertBioRecipients(projected(service, pm), true);
  const effective = service.effective(pm);
  assert.equal(effective.profiles.length, 1);
  assert.equal(effective.profiles[0].quantity, 5);
  assert.equal(effective.profiles[0].id, PM_PROFILE);
  assert.equal(effective.profiles[0].ownerInstanceId, pm);
  assert.equal(effective.profiles[0].modelInstanceId, null);
  assert(effective.weapons.every(weapon => weapon.ownerInstanceId === pm));
  assert(!/model\s+\d+/i.test(effective.profiles[0].title), 'Display cannot label grouped scopes as numbered individuals');
  for (const [id, count] of [[MELTA, 1], [BOLT, 4], [KNIFE, 5]]) {
    assert.equal(effective.weapons.filter(weapon => weapon.id === id).reduce((n, weapon) => n + weapon.physicalQuantity, 0), count);
    assert(effective.weapons.filter(weapon => weapon.id === id).every(weapon => weapon.modelInstanceId === null));
  }
  assert.equal(service.projection.formedUnits[0].startingStrength, 6);
  const before = service.projection;
  service.load(JSON.parse(JSON.stringify(service.snapshot())));
  assert.deepEqual(service.projection, before, 'Snapshot round trip deterministically preserves quantities, scope identities and effects');
  service.detach('parsed-unit-1'); assertBioRecipients(projected(service, pm), false);
  service.reattach('parsed-unit-1', pm); assertBioRecipients(projected(service, pm), true);
  const good = projected(service, pm);
  mutateReject(good, unit => {unit.weapons.find(weapon => weapon.canonicalProfileId === MELTA).physicalQuantity = 0;}, unit => assertBioRecipients(unit, true));
  mutateReject(good, unit => {unit.weapons[0].modelInstanceId = 'fictional/model/1';}, unit => assertBioRecipients(unit, true));
  mutateReject(good, unit => {unit.applied.find(row => row.ruleId === BIO_RULE && row.targetWeaponProfileId === MELTA).targetModelInstanceId = 'fictional/model/1';}, unit => assertBioRecipients(unit, true));
});

control(() => {
  const service = importText('Char1: 1x Biologus Putrifier (50 pts)\nChar2: 1x Noxious Blightbringer (50 pts)\n5x Plague Marines (90 pts): 1x Meltagun, 4x Boltgun, 5x Plague knives, 1x Icon of Despair\n10x Plague Marines (180 pts): 2x Meltagun, 1x Blight launcher, 7x Boltgun, 10x Plague knives', {
    'parsed-unit-1': 'unit-biologus-putrifier', 'parsed-unit-2': 'unit-noxious-blightbringer', 'parsed-unit-3': PM, 'parsed-unit-4': PM
  }, standardGear);
  service.attach('parsed-unit-1', 'parsed-unit-3');
  service.attach('parsed-unit-2', 'parsed-unit-4');
  const validateIsolation = projection => {
    const first = projection.units.find(unit => unit.instanceId === 'parsed-unit-3'), second = projection.units.find(unit => unit.instanceId === 'parsed-unit-4');
    assertBioRecipients(first, true);
    assertAggregate(second, 10, [[MELTA, 2], [LAUNCHER, 1], [BOLT, 7], [KNIFE, 10]]);
    assert(allWeapons(second).filter(weapon => weapon.canonicalProfileId === MELTA).every(weapon => !ability(weapon, 'LETHAL HITS')));
    assert.equal(first.profiles[0].profile.M, '5"');
    assert.equal(second.profiles[0].profile.M, '6"');
    assert(!first.applied.some(row => row.ruleId === NOX_RULE));
    assert(!second.applied.some(row => row.ruleId === BIO_RULE));
    assert.equal(quantity(first, LAUNCHER), 0);
    assert.equal(quantity(second, LAUNCHER), 1);
    const firstGroup = projection.formedUnits.find(group => group.bodyguardInstanceId === first.instanceId);
    const secondGroup = projection.formedUnits.find(group => group.bodyguardInstanceId === second.instanceId);
    assert.deepEqual(firstGroup.memberInstanceIds, ['parsed-unit-3','parsed-unit-1']);
    assert.deepEqual(secondGroup.memberInstanceIds, ['parsed-unit-4','parsed-unit-2']);
    assert.notDeepEqual(firstGroup.keywords, secondGroup.keywords, 'Different attached Character keyword contexts remain isolated');
    assert.equal(first.selections.filter(selection => selection.canonicalEquipmentIds.includes('datasheet-plague-marines:wargear:8')).length, 1);
    assert.equal(second.selections.filter(selection => selection.canonicalEquipmentIds.includes('datasheet-plague-marines:wargear:8')).length, 0);
  };
  validateIsolation(service.projection);
  mutateReject(service.projection, projection => {projection.units.find(unit => unit.instanceId === 'parsed-unit-4').weapons.find(weapon => weapon.canonicalProfileId === MELTA).data.abilities.push('LETHAL HITS');}, validateIsolation);
  service.reattach('parsed-unit-1', 'parsed-unit-4');
  assertBioRecipients(projected(service, 'parsed-unit-3'), false);
  assertBioRecipients(projected(service, 'parsed-unit-4'), true, 10, [[MELTA, 2], [LAUNCHER, 1], [BOLT, 7], [KNIFE, 10]]);
});

control(() => {
  for (const strength of [5, 10, 20, 100]) {
    const service = importText(`${strength}x Plague Marines (90 pts): ${strength}x Boltgun`, {'parsed-unit-1': PM}, standardGear);
    assertAggregate(projected(service, 'parsed-unit-1'), strength, [[BOLT, strength]]);
    assert.equal(service.effective('parsed-unit-1').profiles.length, 1);
  }
});

control(() => {
  const service = importText('1x Plague Marines (90 pts)\n• 1x Plague Champion: Meltagun, Plague knives\n• 4x Plague Marines: Boltgun, Plague knives\nChar1: 1x Noxious Blightbringer (50 pts)', {'parsed-unit-1': PM, 'parsed-unit-2': 'unit-noxious-blightbringer'}, standardGear);
  const unit = projected(service, 'parsed-unit-1');
  assert.equal(unit.startingStrength, 5);
  assert.deepEqual(unit.profiles.map(profile => profile.quantity), [1, 4], 'Imported row groups remain rows instead of five materialized models');
  assert(unit.profiles.every(profile => profile.canonicalProfileId === PM_PROFILE), 'Import row grouping cannot create canonical profile identities');
  assert.equal(typeof unit.profiles[0].modelInstanceId, 'string');
  assert.equal(unit.profiles[1].modelInstanceId, null);
  for (const profile of unit.profiles) for (const weapon of profile.weapons) assert.equal(weapon.modelInstanceId, profile.modelInstanceId, 'Explicit row gear preserves its proven grouped or individual owner');
  assert.equal(quantity(unit, MELTA), 1); assert.equal(quantity(unit, BOLT), 4); assert.equal(quantity(unit, KNIFE), 5);
  const effective = service.effective('parsed-unit-1');
  assert.deepEqual(effective.profiles.map(profile => profile.quantity), [1, 4]);
  assert([...effective.profiles, ...effective.weapons].every(record => record.ownerInstanceId === 'parsed-unit-1'));
  for (const [id, count] of [[MELTA, 1], [BOLT, 4], [KNIFE, 5]]) assert.equal(effective.weapons.filter(weapon => weapon.id === id).reduce((n, weapon) => n + weapon.physicalQuantity, 0), count);
  assert.equal(service.context('parsed-unit-1', 'MODEL'), null, 'Multiple semantic scopes require an explicit selector');
  for (const profile of unit.profiles) {
    const context = service.context('parsed-unit-1', 'MODEL', profile.scopeId);
    assert.equal(context.modelId, PM_PROFILE);
    assert(!context.keywords.has('CHARACTER'));
  }
  assert.equal(service.context('parsed-unit-1', 'MODEL', unit.profiles[0].modelInstanceId).modelId, PM_PROFILE);
  const validateIndividual = value => {assert.equal(value.profiles[1].modelInstanceId, null); assert.equal(value.profiles.length, 2);};
  mutateReject(unit, value => {value.profiles[1].modelInstanceId = 'invented/4-model-row/1';}, validateIndividual);
  service.attach('parsed-unit-2', 'parsed-unit-1');
  const validateMovement = value => assert(value.profiles.every(profile => profile.profile.M === '6"'), 'Formed MODEL effect must update every imported semantic profile scope');
  validateMovement(projected(service, 'parsed-unit-1'));
  mutateReject(projected(service, 'parsed-unit-1'), value => {value.profiles[1].profile.M = '5"';}, validateMovement);
  service.detach('parsed-unit-2'); everyField(service, 'parsed-unit-1', 'M', '5"');
  const before = service.projection; service.load(JSON.parse(JSON.stringify(service.snapshot()))); assert.deepEqual(service.projection, before);
});

control(() => {
  const service = importText('1x Plague Marines (90 pts)\n• 5x Plague Marines: Plague knives\n2 with Meltagun', {'parsed-unit-1': PM}, standardGear);
  const unit = projected(service, 'parsed-unit-1');
  assert.equal(unit.profiles.reduce((n, profile) => n + profile.quantity, 0), 5);
  assert.equal(unit.profiles.length, 2, 'Explicit partial loadout creates two semantic scopes');
  assert(unit.profiles.every(profile => profile.modelInstanceId === null));
  assert.equal(quantity(unit, MELTA), 2);
  assert.equal(quantity(unit, KNIFE), 5, 'Shared row gear must split physical quantity across loadout scopes without loss or duplication');
  const beforeState = service.snapshot(), beforeProjection = service.projection;
  const rejectBackup = mutate => {
    const backup = JSON.parse(JSON.stringify(beforeState)); mutate(backup.units[0].modelRows[0]);
    assert.throws(() => service.load(backup), /Missing or duplicate composition loadout identity/);
    assert.deepEqual(service.snapshot(), beforeState, 'Rejected backup cannot replace validated state');
    assert.deepEqual(service.projection, beforeProjection, 'Rejected backup cannot partially replace the effective projection');
    invalidBackups++;
  };
  rejectBackup(row => {delete row.loadouts[0].loadoutId;});
  rejectBackup(row => {row.loadouts[0].loadoutId = '';});
  rejectBackup(row => {row.loadouts.push(structuredClone(row.loadouts[0]));});
  const sharedKey = JSON.parse(JSON.stringify(beforeState));
  sharedKey.units[0].modelRows[0].loadouts[0].loadoutId = sharedKey.units[0].modelRows[0].rowId;
  service.load(sharedKey);
  const scoped = projected(service, 'parsed-unit-1');
  assert.equal(scoped.profiles.length, 2);
  assert.equal(new Set(scoped.profiles.map(profile => profile.scopeId)).size, 2, 'A loadout and base profile sharing a key remain distinct semantic scopes');
  assert.equal(quantity(scoped, MELTA), 2); assert.equal(quantity(scoped, KNIFE), 5);
  const after = service.projection; service.load(JSON.parse(JSON.stringify(service.snapshot()))); assert.deepEqual(service.projection, after);
});

control(() => {
  const text = '10x Plaguebearers (110 pts): 1x Daemonic Icon\n10x Plaguebearers (110 pts)';
  const service = importText(text, {'parsed-unit-1': 'unit-plaguebearers', 'parsed-unit-2': 'unit-plaguebearers'}, {
    'Daemonic Icon': {canonicalEquipmentIds: ['datasheet-plaguebearers:wargear:2'], canonicalFieldPaths: {'datasheet-plaguebearers:wargear:2': ['/text']}}
  });
  everyField(service, 'parsed-unit-1', 'LD', '6+'); everyField(service, 'parsed-unit-2', 'LD', '7+');
  const wrongField = service.snapshot(); wrongField.units[0].selections[0].canonicalFieldPaths = {'datasheet-plaguebearers:wargear:2': ['/order']};
  service.load(wrongField); everyField(service, 'parsed-unit-1', 'LD', '7+');
  const zero = service.snapshot(); zero.units[0].selections[0].canonicalFieldPaths = {'datasheet-plaguebearers:wargear:2': ['/text']}; zero.units[0].selections[0].physicalQuantity = 0;
  service.load(zero); everyField(service, 'parsed-unit-1', 'LD', '7+');
});

control(() => {
  const service = importText('+ WARLORD: Char1: Lord of Contagion\n+ ENHANCEMENT: Furnace of Plagues (on Char1: Lord of Contagion)\n+ ENHANCEMENT: Revolting Regeneration (on Char1: Lord of Contagion)\nChar1: 1x Lord of Contagion (100 pts): 1x Manreaper\nChar2: 1x Lord of Contagion (100 pts): 1x Manreaper\n3x Deathshroud Terminators (150 pts)\n3x Deathshroud Terminators (150 pts)\n5x Plague Marines (90 pts)', {
    'parsed-unit-1': 'unit-lord-of-contagion', 'parsed-unit-2': 'unit-lord-of-contagion', 'parsed-unit-3': 'unit-deathshroud-terminators', 'parsed-unit-4': 'unit-deathshroud-terminators', 'parsed-unit-5': PM
  }, {Manreaper: {canonicalProfileIds: [MANREAPER,'datasheet-lord-of-contagion:weapon:2']}}, {'enhancement/1': FURNACE, 'enhancement/2': REGEN});
  const fnp = instance => projected(service, instance).profiles.flatMap(profile => profile.abilities).filter(value => value.name === 'Feel No Pain');
  const enhancedWeapon = gear(service, 'parsed-unit-1', MANREAPER)[0], ordinaryWeapon = gear(service, 'parsed-unit-2', MANREAPER)[0];
  assert.equal(enhancedWeapon.data.strength, '10'); assert.equal(enhancedWeapon.data.attacks, '6'); assert(ability(enhancedWeapon, 'DEVASTATING WOUNDS'));
  assert.equal(ordinaryWeapon.data.strength, '9'); assert.equal(ordinaryWeapon.data.attacks, '5'); assert(!ability(ordinaryWeapon, 'DEVASTATING WOUNDS'));
  assert.deepEqual(fnp('parsed-unit-1'), [{name: 'Feel No Pain', value: 5}]); assert.deepEqual(fnp('parsed-unit-2'), []);
  assert.equal(projected(service, 'parsed-unit-1').profiles[0].modelInstanceId, 'parsed-unit-1', 'Single-model unit identity is meaningful');
  assert.throws(() => service.attach('parsed-unit-1', 'parsed-unit-5'), /canonical attachment relation/);
  service.attach('parsed-unit-1', 'parsed-unit-3');
  assert.deepEqual(fnp('parsed-unit-1'), [{name: 'Feel No Pain', value: 4}]);
  for (const instance of ['parsed-unit-2', 'parsed-unit-3', 'parsed-unit-4']) assert.deepEqual(fnp(instance), []);
  const sourceProof = projected(service, 'parsed-unit-1').applied.find(row => row.ruleId === 'datasheet-deathshroud-terminators:section:1');
  assert.equal(sourceProof.targetModelInstanceId, 'parsed-unit-1');
  assert.equal(sourceProof.sourceInstanceId, 'parsed-unit-3');
  assert.equal(sourceProof.targetProfileId, 'datasheet-lord-of-contagion:profile:default');
  const bodyModel = service.context('parsed-unit-3', 'MODEL'), leaderModel = service.context('parsed-unit-1', 'MODEL');
  const assertModelContext = context => {assert.equal(context.modelId, 'datasheet-deathshroud-terminators:profile:default'); assert(!context.keywords.has('CHARACTER')); assert.equal(context.roster.isWarlord, false);};
  assertModelContext(bodyModel);
  assert(service.context('parsed-unit-3', 'UNIT').keywords.has('CHARACTER'));
  assert(leaderModel.keywords.has('CHARACTER')); assert.equal(leaderModel.roster.isWarlord, true);
  assert.equal(service.context('parsed-unit-2', 'MODEL').roster.isWarlord, false);
  assert.equal(evaluator.evaluatePredicate({predicate: 'MODEL_ID', subject: 'MODEL', contextLevel: 'STATIC', arguments: {id: 'datasheet-lord-of-contagion:profile:default'}}, leaderModel), 'TRUE');
  assert.equal(evaluator.evaluatePredicate({predicate: 'MODEL_KEYWORD', subject: 'MODEL', contextLevel: 'STATIC', arguments: {keyword: 'CHARACTER'}}, bodyModel), 'FALSE');
  mutateReject({modelId: bodyModel.modelId, keywords: [...bodyModel.keywords], roster: bodyModel.roster}, context => {context.keywords.push('CHARACTER');}, context => assertModelContext({...context, keywords: new Set(context.keywords)}));
  assert.throws(() => service.attach('parsed-unit-2', 'parsed-unit-3'), /capacity/);
  service.detach('parsed-unit-1'); assert.deepEqual(fnp('parsed-unit-1'), [{name: 'Feel No Pain', value: 5}]);
  service.reattach('parsed-unit-1', 'parsed-unit-4'); assert.deepEqual(fnp('parsed-unit-1'), [{name: 'Feel No Pain', value: 4}]);
  assert.equal(projected(service, 'parsed-unit-3').formedUnitId, undefined);
  const effective = service.effective('parsed-unit-1'); assert.equal(field(effective.profiles[0], 'T'), projected(service, 'parsed-unit-1').profiles[0].profile.T);
  const before = service.projection; service.load(JSON.parse(JSON.stringify(service.snapshot()))); assert.deepEqual(service.projection, before);
});

console.log(JSON.stringify({status: 'PASS', sourceControls: sourceCases.length, scenarioControls: controls, mutationControls: mutations, invalidBackupControls: invalidBackups,
  aggregateModelMaterialization: 0, fictionalAggregateOwners: 0, physicalWeaponQuantityConservation: 'PASS', attachmentOwnerIsolation: 'PASS'}));
