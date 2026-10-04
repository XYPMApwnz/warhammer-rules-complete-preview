import assert from 'node:assert/strict';
import {parse} from '../../shared/roster-v2/parser.mjs';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {buildRuleContractV2} from './rule-contract-build.mjs';
import * as evaluator from './rule-contract-schema.mjs';

// Permanent product guard for an intentionally army-illegal but runtime-valid
// formed unit: an upgraded Bodyguard and two distinct enhanced Characters.
// The roster runtime executes imported state; it is not an army-list validator.
const book = buildRuleContractV2();
const make = () => createRosterRuntime(book, {...evaluator, parse});
const records = new Map(book.entities.map(entity => [entity.id, entity]));

const PM = 'unit-plague-marines';
const NOX = 'unit-noxious-blightbringer';
const CASTER = 'unit-malignant-plaguecaster';
const PM_PROFILE = 'datasheet-plague-marines:profile:default';
const NOX_PROFILE = 'datasheet-noxious-blightbringer:profile:default';
const CASTER_PROFILE = 'datasheet-malignant-plaguecaster:profile:default';
const PM_KNIFE = 'datasheet-plague-marines:weapon:13';
const NOX_BELL = 'datasheet-noxious-blightbringer:weapon:3';
const CASTER_STAFF = 'datasheet-malignant-plaguecaster:weapon:4';
const FLYBLOWN = 'detachment-flyblown-host';
const VIRULENT = 'detachment-virulent-vectorium';
const PLAGUEVEIL = 'detachment-flyblown-host:enhancement:2';
const FURNACE = 'detachment-virulent-vectorium:enhancement:2';
const REGENERATION = 'detachment-virulent-vectorium:enhancement:4';
const NOX_RULE = 'datasheet-noxious-blightbringer:section:1';
const NOX_SUPPORT = 'datasheet-noxious-blightbringer:section:3';

const normalized = value => String(value).replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
const rule = id => {
  const entity = records.get(id);
  assert(entity, `Missing canonical rule ${id}`);
  return entity;
};
const effects = id => rule(id).ruleContract.clauses.flatMap(clause => clause.rosterEffects);
const projectionUnit = (service, instanceId) => {
  const unit = service.projection.units.find(candidate => candidate.instanceId === instanceId);
  assert(unit, `Missing physical unit ${instanceId}`);
  return unit;
};
const selectedWeapon = (service, instanceId, canonicalProfileId) => {
  const unit = projectionUnit(service, instanceId);
  const weapon = [...unit.weapons, ...unit.profiles.flatMap(profile => profile.weapons)]
    .find(candidate => candidate.canonicalProfileId === canonicalProfileId);
  assert(weapon, `Missing selected weapon ${instanceId}/${canonicalProfileId}`);
  return weapon;
};
const hasWeaponAbility = (weapon, ability) => weapon.data.abilities.some(value => normalized(value) === normalized(ability));
const feelNoPain = (service, instanceId) => projectionUnit(service, instanceId).profiles
  .flatMap(profile => profile.abilities)
  .filter(ability => ability.name === 'Feel No Pain')
  .map(ability => ability.value);
const movement = (service, instanceId) => projectionUnit(service, instanceId).profiles.map(profile => profile.profile.M);
const detectionRange = (service, instanceId) => projectionUnit(service, instanceId).metrics.detectionRange;
const applied = (service, ruleId) => service.projection.units.flatMap(unit => unit.applied).filter(row => row.ruleId === ruleId);

function unit(instanceId, canonicalUnitId, canonicalProfileId, startingStrength, weaponId, enhancementIds = []) {
  return {
    instanceId,
    canonicalUnitId,
    startingStrength,
    warlord: false,
    enhancementIds,
    selections: [{
      selectionKey: `${instanceId}/weapon`,
      label: records.get(weaponId).data.name,
      physicalQuantity: canonicalUnitId === PM ? startingStrength : 1,
      canonicalProfileIds: [weaponId],
      canonicalEquipmentIds: []
    }],
    modelRows: [{
      rowId: `${instanceId}/row`,
      canonicalProfileId,
      quantity: startingStrength,
      compositionScope: 'UNIT',
      selections: [],
      loadouts: []
    }]
  };
}

// The active builder must retain the canonical identities, source statements,
// and typed recipient semantics that make the runtime expectations below true.
assert.equal(rule(PLAGUEVEIL).data.title, 'Plagueveil');
assert.equal(rule(PLAGUEVEIL).parentId, FLYBLOWN);
assert(normalized(rule(PLAGUEVEIL).data.text).includes(normalized('PLAGUE MARINES unit only. This unit has -3" detection range.')));
assert.deepEqual(effects(PLAGUEVEIL).map(effect => ({
  operation: effect.operation,
  targetBinding: effect.targetBinding,
  targetSubject: effect.targetSubject,
  field: effect.field,
  mode: effect.mode,
  value: effect.value
})), [{operation: 'MODIFY_RULE_METRIC', targetBinding: 'SOURCE_UNIT', targetSubject: 'UNIT', field: 'detectionRange', mode: 'ADD', value: -3}]);

assert.equal(rule(FURNACE).data.title, 'Furnace of Plagues');
assert.equal(rule(FURNACE).parentId, VIRULENT);
assert(normalized(rule(FURNACE).data.text).includes(normalized("Add 1 to the Strength and Attacks characteristics of the bearers melee weapons, and the bearer's melee weapons have the [DEVASTATING WOUNDS] ability.")));
assert.deepEqual(effects(FURNACE).map(effect => [effect.operation, effect.targetBinding, effect.targetSubject, effect.weaponMode, effect.field || effect.ability]), [
  ['MODIFY_STAT', 'SOURCE_MODEL', 'MODEL', 'melee', 'strength'],
  ['MODIFY_STAT', 'SOURCE_MODEL', 'MODEL', 'melee', 'attacks'],
  ['GRANT_WEAPON_ABILITY', 'SOURCE_MODEL', 'MODEL', 'melee', 'DEVASTATING WOUNDS']
]);

assert.equal(rule(REGENERATION).data.title, 'Revolting Regeneration');
assert.equal(rule(REGENERATION).parentId, VIRULENT);
assert(normalized(rule(REGENERATION).data.text).includes(normalized('The bearer has the Feel No Pain 5+ ability.')));
assert.deepEqual(effects(REGENERATION).map(effect => [effect.operation, effect.targetBinding, effect.targetSubject, effect.ability.name, effect.ability.value]), [
  ['GRANT_MODEL_ABILITY', 'SOURCE_MODEL', 'MODEL', 'Feel No Pain', 5]
]);

const noxMovement = effects(NOX_RULE);
assert(noxMovement.some(effect => effect.operation === 'MODIFY_STAT' && effect.targetBinding === 'SOURCE_FORMED_MODELS' && effect.targetSubject === 'MODEL' && effect.field === 'M' && effect.mode === 'ADD' && effect.value === 1));
const supportPolicy = book.rosterAttachmentPolicies.find(policy => policy.sourceId === NOX && policy.targetId === PM);
assert.deepEqual(supportPolicy, {
  sourceId: NOX,
  targetId: PM,
  role: 'SUPPORT_EXCEPTION',
  additionalLeaders: 1,
  distinctCanonicalLeaders: true,
  sourceIds: ['mfm-leader-eligibility-fbc571ead1f0c887', NOX_SUPPORT]
});
assert(normalized(rule(NOX_SUPPORT).data.blocks[0].text).includes(normalized('even if one other Leader unit has already been attached to it')));
assert.deepEqual(book.rosterAttachmentPolicies.find(policy => policy.sourceId === CASTER && policy.targetId === PM), {
  sourceId: CASTER,
  targetId: PM,
  role: 'LEADER',
  additionalLeaders: 0,
  distinctCanonicalLeaders: true,
  sourceIds: ['mfm-leader-eligibility-91238681895d2483']
});

const roster = {
  schema: 'roster-v2/roster',
  bookId: book.bookId,
  rosterId: 'multiple-enhancements-product-qa',
  detachments: [
    {instanceId: 'detachment/flyblown', canonicalDetachmentId: FLYBLOWN},
    {instanceId: 'detachment/virulent', canonicalDetachmentId: VIRULENT}
  ],
  detachmentIds: [FLYBLOWN, VIRULENT],
  warlordInstanceId: null,
  units: [
    unit('pm-a', PM, PM_PROFILE, 5, PM_KNIFE, [PLAGUEVEIL]),
    unit('nox-a', NOX, NOX_PROFILE, 1, NOX_BELL, [REGENERATION]),
    unit('caster-a', CASTER, CASTER_PROFILE, 1, CASTER_STAFF, [FURNACE]),
    unit('pm-b', PM, PM_PROFILE, 5, PM_KNIFE),
    unit('nox-b', NOX, NOX_PROFILE, 1, NOX_BELL),
    unit('caster-b', CASTER, CASTER_PROFILE, 1, CASTER_STAFF)
  ],
  attachments: []
};

const service = make();
service.load(roster);
assert.deepEqual(new Set(service.state.detachmentIds), new Set([FLYBLOWN, VIRULENT]));
const owners = service.state.units.filter(entry => entry.enhancementIds.length).map(entry => [entry.instanceId, entry.enhancementIds[0]]);
assert.deepEqual(owners, [['pm-a', PLAGUEVEIL], ['nox-a', REGENERATION], ['caster-a', FURNACE]]);
assert.equal(new Set(owners.map(([instanceId]) => instanceId)).size, 3);
assert.equal(new Set(owners.map(([, enhancementId]) => enhancementId)).size, 3);

// Both attachments are source-valid. Their combination with three Enhancements
// is deliberately accepted as imported product state despite army legality.
service.attach('caster-a', 'pm-a');
service.attach('nox-a', 'pm-a');
service.attach('caster-b', 'pm-b');
service.attach('nox-b', 'pm-b');
const groupA = service.projection.formedUnits.find(group => group.bodyguardInstanceId === 'pm-a');
const groupB = service.projection.formedUnits.find(group => group.bodyguardInstanceId === 'pm-b');
assert.deepEqual(groupA.memberInstanceIds, ['pm-a', 'caster-a', 'nox-a']);
assert.deepEqual(groupB.memberInstanceIds, ['pm-b', 'caster-b', 'nox-b']);

for (const id of ['pm-a', 'nox-a', 'caster-a', 'pm-b', 'nox-b', 'caster-b']) assert.deepEqual(movement(service, id), ['6"']);

const staffA = selectedWeapon(service, 'caster-a', CASTER_STAFF);
assert.equal(staffA.data.strength, '7');
assert.equal(staffA.data.attacks, '5');
assert(hasWeaponAbility(staffA, 'DEVASTATING WOUNDS'));
for (const [instanceId, weaponId, strength, attacks] of [
  ['pm-a', PM_KNIFE, '5', '3'],
  ['nox-a', NOX_BELL, '4', '5'],
  ['pm-b', PM_KNIFE, '5', '3'],
  ['nox-b', NOX_BELL, '4', '5'],
  ['caster-b', CASTER_STAFF, '6', '4']
]) {
  const weapon = selectedWeapon(service, instanceId, weaponId);
  assert.equal(weapon.data.strength, strength);
  assert.equal(weapon.data.attacks, attacks);
  assert(!hasWeaponAbility(weapon, 'DEVASTATING WOUNDS'));
}
assert.deepEqual(feelNoPain(service, 'nox-a'), [5]);
for (const id of ['pm-a', 'caster-a', 'pm-b', 'nox-b', 'caster-b']) assert.deepEqual(feelNoPain(service, id), []);

// UNIT effects follow the actual formed unit, but remain backed by the physical
// Enhancement owner. Duplicate copies in the other formed unit stay isolated.
for (const id of ['pm-a', 'nox-a', 'caster-a']) assert.deepEqual(detectionRange(service, id), {modifier: -3});
for (const id of ['pm-b', 'nox-b', 'caster-b']) assert.equal(detectionRange(service, id), undefined);
const plagueveilProof = applied(service, PLAGUEVEIL);
assert.deepEqual(new Set(plagueveilProof.map(row => row.sourceInstanceId)), new Set(['pm-a']));
assert.deepEqual(new Set(plagueveilProof.map(row => row.targetInstanceId)), new Set(['pm-a', 'nox-a', 'caster-a']));
const furnaceProof = applied(service, FURNACE);
assert.equal(furnaceProof.length, 3);
assert(furnaceProof.every(row => row.sourceInstanceId === 'caster-a' && row.targetInstanceId === 'caster-a' && row.targetWeaponProfileId === CASTER_STAFF));
const regenerationProof = applied(service, REGENERATION);
assert.equal(regenerationProof.length, 1);
assert(regenerationProof.every(row => row.sourceInstanceId === 'nox-a' && row.targetInstanceId === 'nox-a'));
for (const enhancementId of [PLAGUEVEIL, FURNACE, REGENERATION]) {
  assert(!applied(service, enhancementId).some(row => row.targetInstanceId.endsWith('-b')));
}

const attachedProjection = service.projection;
const backup = JSON.parse(JSON.stringify(service.snapshot()));
const restored = make();
restored.load(backup);
assert.deepEqual(restored.projection, attachedProjection);

restored.detach('nox-a');
for (const id of ['pm-a', 'caster-a', 'nox-a']) assert.deepEqual(movement(restored, id), ['5"']);
assert.deepEqual(feelNoPain(restored, 'nox-a'), [5], 'Bearer-only Enhancement survives detachment without leaking');
assert.equal(selectedWeapon(restored, 'caster-a', CASTER_STAFF).data.strength, '7');
restored.reattach('nox-a', 'pm-a');
assert.deepEqual(restored.projection, attachedProjection);

restored.detach('caster-a');
assert.deepEqual(movement(restored, 'caster-a'), ['5"']);
assert.equal(selectedWeapon(restored, 'caster-a', CASTER_STAFF).data.strength, '7', 'Bearer-only Furnace survives detachment');
assert.equal(selectedWeapon(restored, 'pm-a', PM_KNIFE).data.strength, '5');
restored.reattach('caster-a', 'pm-a');
assert.deepEqual(restored.projection, attachedProjection);

console.log(JSON.stringify({
  status: 'PASS',
  activeV2Build: true,
  importedDetachments: 2,
  enhancementOwners: 3,
  formedGroups: 2,
  mixedEnhancementFormedUnit: 'ALLOWED',
  sourceValidAttachments: 'PASS',
  bearerIsolation: 'PASS',
  duplicateCopyIsolation: 'PASS',
  detachReattach: 'PASS',
  backupReload: 'PASS'
}));
