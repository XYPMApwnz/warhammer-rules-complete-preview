import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanonicalMfmFacts} from '../content/canonical-mfm-facts.mjs';
import {createEffectiveMfmCatalog, MFM_SCOPES} from '../content/effective-mfm-catalog.mjs';
import {validateCanonicalMfmFacts, validateMfmIdentityRegistry} from '../content/mfm-model-contract.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const FACTIONS = [
  'death-guard', 'adeptus-mechanicus', 'tyranids', 'tau-empire',
  'emperors-children', 'chaos-space-marines', 'space-marines',
  'dark-angels', 'blood-angels'
];
const ID_PATTERN = /^mfm-(?:unit-ref|pricing-group|unit-points|paid-upgrade|leader-eligibility|support-eligibility|detachment|enhancement|qualifier)-[0-9a-f]{16}$/;
const FORCE_DISPOSITION_ID = new Map([
  ['RECONNAISSANCE', 'force-disposition-reconnaissance'],
  ['DISRUPTION', 'force-disposition-disruption'],
  ['PRIORITY ASSETS', 'force-disposition-priority-assets'],
  ['PURGE THE FOE', 'force-disposition-purge-the-foe'],
  ['TAKE AND HOLD', 'force-disposition-take-and-hold']
]);
const readJson = relative => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const clone = value => structuredClone(value);
const sourceKey = (...parts) => parts.join('\0');

const registry = readJson('mfm/content/mfm-v1.5-scoped.identity-registry.json');
validateMfmIdentityRegistry(registry);
const canonical = createCanonicalMfmFacts({repoRoot: ROOT, identityRegistry: registry});
validateCanonicalMfmFacts(canonical);
assert.ok(Object.isFrozen(canonical), 'canonical MFM root must be immutable');
assert.ok(Object.isFrozen(canonical.unitPointRecords[0].pointSchedules), 'canonical nested facts must be immutable');

const partitions = [
  'pricingGroups', 'unitReferences', 'unitPointRecords', 'paidUpgradeRecords',
  'leaderEligibilityRecords', 'supportEligibilityRecords', 'detachments',
  'enhancementCosts', 'qualifierRecords'
];
const records = partitions.flatMap(partition => canonical[partition]);
assert.equal(new Set(records.map(record => record.id)).size, records.length, 'canonical IDs must be globally unique');
for (const record of records) {
  assert.match(record.id, ID_PATTERN);
  assert.ok(record.label);
  assert.ok(record.recordType);
  assert.ok(Array.isArray(record.aliases));
  assert.ok(Array.isArray(record.references));
  const dependency=record.provenance.sourceVersion==='v1.5';
  assert.equal(record.provenance.sourceVersion, dependency?'v1.5':'v1.4');
  assert.equal(record.provenance.currentness, 'CURRENT');
  assert.equal(record.provenance.currentnessCutoff, dependency?'2026-09-30':'2026-09-22');
  assert.equal(record.provenance.authority, 'OFFICIAL_GAMES_WORKSHOP_LIVE_MFM');
  assert.ok(record.provenance.sourceCaptureSha256);
  assert.ok(record.provenance.sourceLocator);
}

const byFaction = new Map(FACTIONS.map(faction => [faction, {
  capture: readJson(registry.factionBindings.find(binding => binding.factionId === faction).sourceCapturePath),
  binding: registry.factionBindings.find(binding => binding.factionId === faction)
}]));
assert.equal(registry.factionBindings.length, 9);
assert.equal(canonical.sourceSnapshots.length, 11);

let sourceUnitCount = 0;
let sourceSchedules = 0;
let sourceRows = 0;
let sourcePaid = 0;
let sourceLeaderRecords = 0;
let sourceLeaderEdges = 0;
let sourceSupportRecords = 0;
let sourceSupportEdges = 0;
let currentLeaderRecords = 0;
let currentLeaderEdges = 0;
let currentSupportRecords = 0;
let currentSupportEdges = 0;
let sourceDetachments = 0;
let sourceEnhancements = 0;
let sourceQualifiers = 0;
let sourceGroupCount = 0;

for (const [factionId, {capture, binding}] of byFaction) {
  assert.ok(binding, `${factionId}: missing identity binding`);
  assert.equal(capture.factionId, factionId);
  const migrated=!['space-marines','dark-angels','blood-angels'].includes(factionId);
  assert.equal(capture.version, migrated?'v1.5':'v1.4');
  assert.equal(capture.currentness, 'CURRENT');
  assert.equal(capture.currentnessCutoff, migrated?'2026-09-30':'2026-09-22');
  assert.equal(capture.captureSha256, binding.sourceCaptureSha256);
  const snapshot = canonical.sourceSnapshots.find(item => item.factionId === factionId);
  assert.ok(snapshot);
  assert.equal(snapshot.captureSha256, capture.captureSha256);
  assert.equal(snapshot.sourceId, `${factionId}-mfm-${migrated?'v1.5':'v1.4'}`);

  const groups = new Set(capture.sourceGroups);
  assert.equal(groups.size, capture.sourceGroups.length, `${factionId}: duplicate declared pricing group`);
  for (const unit of capture.units) assert.ok(groups.has(unit.sourceGroup), `${factionId}/${unit.title}: undeclared pricing group`);
  sourceGroupCount += groups.size;
  const groupBindings = new Map(binding.groupBindings.map(item => [item.sourceLabel, item]));
  assert.deepEqual([...groupBindings.keys()].sort(), [...groups].sort());
  for (const sourceLabel of groups) {
    const group = canonical.pricingGroups.find(item => item.id === groupBindings.get(sourceLabel).id);
    assert.ok(group);
    assert.equal(group.factionId, factionId);
    assert.equal(group.sourceLabel, sourceLabel);
    const sourceStatuses = [...new Set(capture.units.filter(unit => unit.sourceGroup === sourceLabel).map(unit => unit.status))];
    assert.equal(sourceStatuses.length, 1, `${factionId}/${sourceLabel}: pricing group status must be explicit and uniform`);
    assert.equal(group.status, sourceStatuses[0]);
  }

  const sourceUnits = new Map(capture.units.map(unit => [unit.title, unit]));
  assert.equal(sourceUnits.size, capture.units.length, `${factionId}: priced source unit identity collision`);
  const relationTargets = new Set(capture.units.flatMap(unit => Object.values(unit.relations ?? {}).flat()));
  const expectedReferences = new Set([...sourceUnits.keys(), ...relationTargets]);
  const unitBindings = new Map(binding.unitBindings.map(item => [item.sourceTitle, item]));
  assert.deepEqual([...unitBindings.keys()].sort(), [...expectedReferences].sort());

  for (const [sourceTitle, unitBinding] of unitBindings) {
    const sourceUnit = sourceUnits.get(sourceTitle);
    const reference = canonical.unitReferences.find(item => item.id === unitBinding.unitReferenceId);
    assert.ok(reference);
    assert.equal(reference.factionId, factionId);
    assert.equal(reference.label, sourceTitle);
    assert.equal(reference.referenceOnly, !sourceUnit);
    if (!sourceUnit) continue;

    sourceUnitCount += 1;
    sourceSchedules += sourceUnit.pointSchedules.length;
    sourceRows += sourceUnit.pointSchedules.reduce((sum, schedule) => sum + schedule.entries.length, 0);
    sourcePaid += (sourceUnit.paidOptions ?? []).length;
    const pointRecord = canonical.unitPointRecords.find(item => item.id === unitBinding.unitPointRecordId);
    assert.ok(pointRecord);
    assert.equal(pointRecord.factionId, factionId);
    assert.equal(pointRecord.unitReferenceId, reference.id);
    assert.equal(pointRecord.pricingGroupId, groupBindings.get(sourceUnit.sourceGroup).id);
    assert.equal(pointRecord.sourceGroup, sourceUnit.sourceGroup);
    assert.equal(pointRecord.status, sourceUnit.status);
    assert.deepEqual(pointRecord.pointSchedules, sourceUnit.pointSchedules);

    const paidByLocator = new Map(canonical.paidUpgradeRecords
      .filter(item => item.unitPointRecordId === pointRecord.id)
      .map(item => [sourceKey(item.sourceGroup, item.sourceLabel), item]));
    assert.equal(paidByLocator.size, (sourceUnit.paidOptions ?? []).length);
    for (const option of sourceUnit.paidOptions ?? []) {
      const paid = paidByLocator.get(sourceKey(option.sourceGroup, option.sourceLabel));
      assert.ok(paid);
      assert.equal(paid.value, option.value);
      assert.equal(paid.label, option.title);
    }

    for (const [kind, partition] of [['leader', 'leaderEligibilityRecords'], ['support', 'supportEligibilityRecords']]) {
      const targets = sourceUnit.relations?.[kind] ?? [];
      if (targets.length) {
        if (kind === 'leader') {
          sourceLeaderRecords += 1;
          sourceLeaderEdges += targets.length;
          if (sourceUnit.status === 'CURRENT') { currentLeaderRecords += 1; currentLeaderEdges += targets.length; }
        } else {
          sourceSupportRecords += 1;
          sourceSupportEdges += targets.length;
          if (sourceUnit.status === 'CURRENT') { currentSupportRecords += 1; currentSupportEdges += targets.length; }
        }
        const relation = canonical[partition].find(item => item.sourceUnitPointRecordId === pointRecord.id);
        assert.ok(relation);
        assert.equal(relation.status, sourceUnit.status);
        assert.deepEqual(relation.rawMfmTargetUnitReferenceIds, targets.map(title => unitBindings.get(title).unitReferenceId));
        if (!relation.sourceConflict) assert.deepEqual(relation.targetUnitReferenceIds, relation.rawMfmTargetUnitReferenceIds);
      } else {
        assert.equal(canonical[partition].some(item => item.sourceUnitPointRecordId === pointRecord.id), false);
      }
    }
  }

  const detachmentBindings = new Map(binding.detachmentBindings.map(item => [item.sourceTitle, item]));
  assert.deepEqual([...detachmentBindings.keys()].sort(), capture.detachments.map(item => item.title).sort());
  for (const sourceDetachment of capture.detachments) {
    sourceDetachments += 1;
    sourceEnhancements += sourceDetachment.enhancements.length;
    sourceQualifiers += sourceDetachment.qualifiers.length;
    const detachmentBinding = detachmentBindings.get(sourceDetachment.title);
    const detachment = canonical.detachments.find(item => item.id === detachmentBinding.id);
    assert.ok(detachment);
    assert.equal(detachment.factionId, factionId);
    assert.equal(detachment.detachmentPoints, sourceDetachment.detachmentPoints);
    assert.deepEqual(detachment.forceDispositionIds,[...(sourceDetachment.forceDispositions??[sourceDetachment.forceDisposition])].map(value=>FORCE_DISPOSITION_ID.get(value)));
    assert.deepEqual(
      canonical.qualifierRecords.filter(item => item.ownerId === detachment.id).map(item => [item.kind, item.values]).sort(),
      sourceDetachment.qualifiers.map(item => [item.kind, [item.value]]).sort(),
      `${factionId}/${sourceDetachment.title}: Detachment qualifier parity`
    );
    const enhancementBindings = new Map(detachmentBinding.enhancementBindings.map(item => [item.sourceTitle, item]));
    assert.deepEqual([...enhancementBindings.keys()].sort(), sourceDetachment.enhancements.map(item => item.title).sort());
    for (const sourceEnhancement of sourceDetachment.enhancements) {
      sourceQualifiers += sourceEnhancement.qualifiers.length;
      const enhancementBinding = enhancementBindings.get(sourceEnhancement.title);
      const enhancement = canonical.enhancementCosts.find(item => item.id === enhancementBinding.id);
      assert.ok(enhancement);
      assert.equal(enhancement.detachmentId, detachment.id);
      assert.equal(enhancement.value, sourceEnhancement.value);
      assert.deepEqual(
        canonical.qualifierRecords.filter(item => item.ownerId === enhancement.id).map(item => [item.kind, item.values]).sort(),
        sourceEnhancement.qualifiers.map(item => [item.kind, item.values]).sort(),
        `${factionId}/${sourceDetachment.title}/${sourceEnhancement.title}: Enhancement qualifier parity`
      );
    }
  }
}

assert.deepEqual(canonical.declaredCounts, {
  targetOnlyUnitReferences: 46,
  sourceSnapshots: 11,
  pricingGroups: 29,
  unitReferences: 745,
  unitPointRecords: 699,
  pointSchedules: 902,
  pointRows: 1142,
  paidUpgradeRecords: 35,
  leaderEligibilityRecords: 148,
  leaderEdges: 653,
  supportEligibilityRecords: 45,
  supportEdges: 258,
  detachments: 134,
  enhancementCosts: 474,
  qualifierRecords: 16,
  armyUnitBindings: 629,
  armyUnitReferenceOnly: 114,
  armyDetachmentBindings: 134,
  armyEnhancementBindings: 474,
  armyQualifierOwnerBindings: 16,
  missionForceDispositionBindings: 5,
  relationAdjudications: 2
});
assert.equal(sourceGroupCount, 27);
assert.equal(sourceUnitCount, 697);
assert.equal(sourceSchedules, 899);
assert.equal(sourceRows, 1136);
assert.equal(sourcePaid, 35);
assert.equal(sourceLeaderRecords, 148);
assert.equal(sourceLeaderEdges, 652);
assert.equal(sourceSupportRecords, 45);
assert.equal(sourceSupportEdges, 258);
assert.equal(sourceDetachments, 134);
assert.equal(sourceEnhancements, 474);
assert.equal(sourceQualifiers, 16);
assert.deepEqual([currentLeaderRecords, currentLeaderEdges], [120, 564]);
assert.deepEqual([currentSupportRecords, currentSupportEdges], [36, 226]);

const canonicalBefore = JSON.stringify(canonical);
const current = createEffectiveMfmCatalog({canonicalFacts: canonical});
assert.equal(JSON.stringify(canonical), canonicalBefore, 'effective assembly must not mutate canonical facts');
assert.equal(current.catalog.scope, MFM_SCOPES.CURRENT);
assert.equal(current.catalog.unitPointRecords.length, 546);
assert.equal(current.catalog.unitPointRecords.reduce((sum, item) => sum + item.pointSchedules.length, 0), 749);
assert.equal(current.catalog.unitPointRecords.reduce((sum, item) => sum + item.pointSchedules.reduce((inner, schedule) => inner + schedule.entries.length, 0), 0), 964);
assert.equal(current.catalog.paidUpgradeRecords.length, 35);
assert.equal(current.catalog.leaderEligibilityRecords.length, 120);
assert.equal(current.catalog.leaderEligibilityRecords.reduce((sum, item) => sum + item.targetUnitReferenceIds.length, 0), 565);
assert.equal(current.catalog.supportEligibilityRecords.length, 36);
assert.equal(current.catalog.supportEligibilityRecords.reduce((sum, item) => sum + item.targetUnitReferenceIds.length, 0), 226);
assert.equal(current.catalog.unitPointRecords.some(item => item.status === 'LEGENDS'), false);
assert.equal(current.catalog.pricingGroups.some(item => item.status === 'LEGENDS'), false);

const withLegends = createEffectiveMfmCatalog({canonicalFacts: canonical, scope: MFM_SCOPES.CURRENT_AND_LEGENDS});
assert.equal(withLegends.catalog.unitPointRecords.length, 699);
assert.equal(withLegends.catalog.leaderEligibilityRecords.length, 148);
assert.equal(withLegends.catalog.leaderEligibilityRecords.reduce((sum, item) => sum + item.targetUnitReferenceIds.length, 0), 653);
assert.equal(withLegends.catalog.supportEligibilityRecords.length, 45);
assert.equal(withLegends.catalog.pricingGroups.length, 29);
assert.ok(withLegends.catalog.unitPointRecords.some(item => item.status === 'LEGENDS'));
assert.ok(Object.isFrozen(current.catalog));
assert.ok(Object.isFrozen(current.catalog.unitPointRecords[0].pointSchedules));

const shuffled = clone(canonical);
for (const partition of ['sourceSnapshots', ...partitions]) shuffled[partition].reverse();
const shuffledCurrent = createEffectiveMfmCatalog({canonicalFacts: shuffled});
assert.equal(JSON.stringify(shuffledCurrent.catalog), JSON.stringify(current.catalog), 'effective MFM output must be deterministic across canonical input ordering');

const renamed = clone(canonical);
for (const partition of partitions) for (const record of renamed[partition]) record.label = `Renamed ${record.id}`;
const renamedCurrent = createEffectiveMfmCatalog({canonicalFacts: renamed});
assert.deepEqual(
  renamedCurrent.catalog.leaderEligibilityRecords.map(item => item.targetUnitReferenceIds),
  current.catalog.leaderEligibilityRecords.map(item => item.targetUnitReferenceIds),
  'display labels cannot authorize Leader joins'
);
assert.deepEqual(
  renamedCurrent.catalog.detachments.map(item => [item.id, item.detachmentPoints, item.forceDispositionIds]),
  current.catalog.detachments.map(item => [item.id, item.detachmentPoints, item.forceDispositionIds]),
  'display labels cannot authorize Detachment facts'
);

const duplicateId = clone(canonical);
duplicateId.unitPointRecords[1].id = duplicateId.unitPointRecords[0].id;
assert.throws(() => validateCanonicalMfmFacts(duplicateId), /duplicate canonical MFM ID/);
const missingGroup = clone(canonical);
missingGroup.unitPointRecords[0].pricingGroupId = 'mfm-pricing-group-0000000000000000';
assert.throws(() => validateCanonicalMfmFacts(missingGroup), /invalid pricing-group reference/);
const sourceLocatorDrift = clone(registry);
sourceLocatorDrift.factionBindings[0].unitBindings[0].sourceTitle = 'UNACCEPTED RENAMED SOURCE LOCATOR';
assert.throws(() => createCanonicalMfmFacts({repoRoot: ROOT, identityRegistry: sourceLocatorDrift}), /identity coverage mismatch/);
const duplicateRegistryId = clone(registry);
duplicateRegistryId.factionBindings[0].unitBindings[1].unitReferenceId = duplicateRegistryId.factionBindings[0].unitBindings[0].unitReferenceId;
assert.throws(() => validateMfmIdentityRegistry(duplicateRegistryId), /duplicate registry ID/);

console.log('MFM_DOMAIN_CONVERGENCE_QA=PASS');
console.log('SOURCE_TO_CANONICAL_COVERAGE=COMPLETE');
console.log('UNMODELED_ACCEPTED_MFM_FACTS=0');
console.log('CURRENT_LEADER_EFFECTIVE=120/565');
console.log('CURRENT_LEADER_SOURCE_CAPTURE=120/564');
console.log('CURRENT_SUPPORT_PARITY=36/226');
console.log('MFM_GLOSSARY_READY=YES');
