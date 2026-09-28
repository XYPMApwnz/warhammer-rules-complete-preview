import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanonicalBuildContext} from '../../books/shared/tools/canonical-build-contract.mjs';
import {buildCanonicalBook} from '../../books/shared/tools/build-army-book.mjs';
import {loadPublicationInventory, selectPublicationBooks} from '../../books/shared/tools/publication-inventory.mjs';
import {createCanonicalMfmFacts} from '../content/canonical-mfm-facts.mjs';
import {createEffectiveMfmCatalog} from '../content/effective-mfm-catalog.mjs';
import {validateMfmCrossDomainBindings} from '../content/mfm-model-contract.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const readJson = relative => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const clone = value => structuredClone(value);
const registry = readJson('mfm/content/mfm-army-mission-bindings.json');
validateMfmCrossDomainBindings(registry);

const canonical = createCanonicalMfmFacts({repoRoot: ROOT, crossDomainBindings: registry});
const effective = createEffectiveMfmCatalog({canonicalFacts: canonical}).catalog;
assert.equal(canonical.declaredCounts.armyUnitBindings, 629);
assert.equal(canonical.declaredCounts.armyUnitReferenceOnly, 114);
assert.equal(canonical.declaredCounts.armyDetachmentBindings, 134);
assert.equal(canonical.declaredCounts.armyEnhancementBindings, 474);
assert.equal(canonical.declaredCounts.armyQualifierOwnerBindings, 16);
assert.equal(canonical.declaredCounts.missionForceDispositionBindings, 5);
assert.equal(canonical.declaredCounts.relationAdjudications, 2);
const parity = new Map(registry.parityClassifications.map(item => [item.id, item]));
assert.equal(parity.size, 6);
assert.equal(parity.get('death-guard-support-extra-army-edges').classification, 'LEGITIMATE_DIFFERENT_DOMAIN_SEMANTICS');
assert.equal(parity.get('adeptus-mechanicus-enginseer-proxy-edges').classification, 'LEGITIMATE_DIFFERENT_DOMAIN_SEMANTICS');
assert.equal(parity.get('space-marines-family-judiciar-support-targets').classification, 'STALE_ARMY_ROSTER_FACT');
assert.equal(parity.get('space-marines-family-judiciar-support-targets').targetsPerBook, 5);
assert.equal(parity.get('tyranids-model-schedule-differences').classification, 'LEGITIMATE_DIFFERENT_DOMAIN_SEMANTICS');
assert.equal(parity.get('tau-current-imperial-armour-units').classification, 'STALE_ARMY_ROSTER_FACT');
assert.equal(parity.get('tau-current-imperial-armour-units').mfmUnitReferenceIds.length, 4);
assert.deepEqual(parity.get('mfm-qualifier-owner-projection'), {id:'mfm-qualifier-owner-projection',classification:'IDENTITY_MAPPING_DEFECT',resolution:'EXPLICIT_OWNER_BINDINGS',resolvedBindingCount:16,consumerMigrationApplied:false});
for (const item of parity.values()) assert.equal(item.consumerMigrationApplied, false);

const missionFacts = readJson('missions/content/chapter-approved-2026-27.canonical.json');
const missionForceIds = new Set(missionFacts.forceDispositions.map(item => item.id));
assert.deepEqual([...new Set(Object.values(registry.forceDispositionBindings).map(item => item.missionForceDispositionId))].sort(), [...missionForceIds].sort());
assert.equal(new Set(Object.keys(registry.forceDispositionBindings)).size, 5);
for (const detachment of canonical.detachments) {
  assert.ok(/^mfm-force-disposition-[0-9a-f]{16}$/.test(detachment.mfmForceDispositionId));
  assert.ok(missionForceIds.has(detachment.missionForceDispositionId));
  assert.equal(detachment.forceDispositionId, detachment.missionForceDispositionId);
}

const models = new Map();
for (const book of selectPublicationBooks(loadPublicationInventory({root: ROOT}), 'library')) {
  const context = createCanonicalBuildContext({configPath: path.join(ROOT, book.config), repo: ROOT, args: ['--check']});
  const {effectiveBookModel} = await buildCanonicalBook(context, {projectionOnly: true});
  models.set(book.id, effectiveBookModel);
}
assert.equal(models.size, 9);

const pointByUnitReference = new Map(canonical.unitPointRecords.map(item => [item.unitReferenceId, item]));
for (const unit of canonical.unitReferences) {
  if (unit.armyBinding.bindingStatus === 'BOUND') {
    const model = models.get(unit.armyBinding.armyBookId);
    assert.ok(model, `${unit.id}: missing scoped Army model ${unit.armyBinding.armyBookId}`);
    const pointRecord = pointByUnitReference.get(unit.id);
    if (pointRecord?.status === 'LEGENDS') {
      assert.equal(unit.pricedStatuses.includes('LEGENDS'), true, `${unit.id}: Legends mapping lost explicit scope`);
    } else {
      assert.ok(model.units.some(item => item.id === unit.armyBinding.armyUnitId), `${unit.id}: unresolved explicit Army unit ${unit.armyBinding.armyUnitId}`);
    }
  } else {
    assert.ok(unit.armyBinding.reason);
    assert.equal(unit.armyBinding.armyUnitId, undefined);
  }
}
for (const detachment of canonical.detachments) {
  const model = models.get(detachment.armyBookId);
  assert.ok(model.detachments.some(item => item.id === detachment.armyDetachmentId), `${detachment.id}: unresolved explicit Army Detachment ${detachment.armyDetachmentId}`);
}
for (const enhancement of canonical.enhancementCosts) {
  const model = models.get(enhancement.armyBookId);
  assert.ok(model.enhancements.some(item => item.id === enhancement.armyEnhancementId && item.detachmentId === enhancement.armyDetachmentId), `${enhancement.id}: unresolved scoped Army Enhancement ${enhancement.armyDetachmentId}/${enhancement.armyEnhancementId}`);
}
for (const qualifier of canonical.qualifierRecords) {
  const owner = qualifier.ownerKind === 'DETACHMENT'
    ? canonical.detachments.find(item => item.id === qualifier.ownerId)
    : canonical.enhancementCosts.find(item => item.id === qualifier.ownerId);
  assert.equal(qualifier.armyOwnerId, qualifier.ownerKind === 'DETACHMENT' ? owner.armyDetachmentId : owner.armyEnhancementId);
}

const huron = canonical.leaderEligibilityRecords.find(item => item.id === 'mfm-leader-eligibility-4fca82984f8316e1');
assert.ok(huron);
assert.equal(huron.sourceConflict.decision, 'PRESERVE_MFM_PRIMARY_TARGETS_RECORD_ARMY_CONFLICT');
assert.equal(huron.sourceConflict.policy.primarySourceMalformed, false);
assert.equal(huron.sourceConflict.policy.officialFallbackUsed, false);
assert.equal(huron.sourceConflict.policy.mfmPrimaryTargetsAuthoritative, true);
assert.equal(huron.sourceConflict.policy.officialFallbackApplied, false);
assert.deepEqual(huron.targetUnitReferenceIds, huron.rawMfmTargetUnitReferenceIds);
assert.equal(huron.targetUnitReferenceIds.length, 4);
assert.equal(huron.targetUnitReferenceIds.includes('mfm-unit-ref-0e38e3f6cbaf70e3'), false);
assert.deepEqual(huron.sourceConflict.conflictingEvidenceTargetIds.map(item => item.mfmUnitReferenceId), ['mfm-unit-ref-0e38e3f6cbaf70e3']);
assert.equal(huron.sourceConflict.provenance.mfm.sourceId, 'chaos-space-marines-mfm-v1.4');
assert.equal(huron.sourceConflict.provenance.officialFactionPack.sourceId, 'chaos-space-marines-faction-pack-v1.2');

const calgar = canonical.leaderEligibilityRecords.find(item => item.id === 'mfm-leader-eligibility-75a7d23c08e86a81');
assert.ok(calgar);
assert.equal(calgar.sourceConflict.decision, 'REPAIR_MALFORMED_CAPTURE_WITH_OFFICIAL_FACTION_PACK');
assert.equal(calgar.sourceConflict.policy.primarySourceMalformed, true);
assert.equal(calgar.sourceConflict.policy.officialFallbackUsed, true);
assert.equal(calgar.sourceConflict.policy.preserveMalformedRawReference, true);
assert.equal(calgar.sourceConflict.policy.officialFallbackApplied, true);
assert.equal(calgar.rawMfmTargetUnitReferenceIds.length, 12);
assert.equal(calgar.targetUnitReferenceIds.length, 13);
assert.ok(calgar.rawMfmTargetUnitReferenceIds.includes('mfm-unit-ref-b79c5f725fbad12c'));
assert.equal(calgar.targetUnitReferenceIds.includes('mfm-unit-ref-b79c5f725fbad12c'), false);
assert.ok(effective.unitReferences.some(item => item.id === 'mfm-unit-ref-b79c5f725fbad12c'), 'effective catalog must preserve the malformed raw MFM reference as provenance');
assert.equal(calgar.sourceConflict.provenance.mfm.sourceId, 'space-marines-mfm-v1.4');
assert.equal(calgar.sourceConflict.provenance.officialFactionPack.sourceId, 'space-marines-faction-pack-v1.2');
assert.deepEqual(calgar.targetUnitReferenceIds, [
  'mfm-unit-ref-b7dd7fa8b235e1c2', 'mfm-unit-ref-c1b514e78559bb06', 'mfm-unit-ref-05bca7797609b9af',
  'mfm-unit-ref-cc975a1213681c7e', 'mfm-unit-ref-cc91785498ffcb6a', 'mfm-unit-ref-b42633b4eb2ba90c',
  'mfm-unit-ref-1d21b6b5cbc05783', 'mfm-unit-ref-40d2df239710b482', 'mfm-unit-ref-879296fa14615437',
  'mfm-unit-ref-b4d866adda123642', 'mfm-unit-ref-32ed37363ad5f0b6', 'mfm-unit-ref-2ab008222d987898',
  'mfm-unit-ref-dfd55ffb4b0ed38b'
]);

const forceCrossWire = clone(registry);
forceCrossWire.detachmentBindings[Object.keys(forceCrossWire.detachmentBindings)[0]].missionForceDispositionId = 'force-disposition-take-and-hold';
assert.throws(() => validateMfmCrossDomainBindings(forceCrossWire), /cross-wire/);
const titleJoinAttempt = clone(registry);
titleJoinAttempt.detachmentBindings[Object.keys(titleJoinAttempt.detachmentBindings)[0]].mfmForceDispositionId = undefined;
assert.throws(() => validateMfmCrossDomainBindings(titleJoinAttempt), /unknown explicit MFM Force Disposition ID/);
const renamedForceLocator = clone(registry);
renamedForceLocator.forceDispositionBindings[Object.keys(renamedForceLocator.forceDispositionBindings)[0]].sourceValue = 'RENAMED DISPLAY VALUE';
assert.throws(() => createCanonicalMfmFacts({repoRoot: ROOT, crossDomainBindings: renamedForceLocator}), /explicit Force Disposition binding does not match accepted source/);
const missingFallbackProvenance = clone(registry);
delete missingFallbackProvenance.relationAdjudications['mfm-leader-eligibility-75a7d23c08e86a81'].provenance.officialFactionPack;
assert.throws(() => validateMfmCrossDomainBindings(missingFallbackProvenance), /officialFactionPack must be an object/);
const heuristicSplitAttempt = clone(registry);
heuristicSplitAttempt.relationAdjudications['mfm-leader-eligibility-75a7d23c08e86a81'].effectiveTargetIds = heuristicSplitAttempt.relationAdjudications['mfm-leader-eligibility-75a7d23c08e86a81'].rawMfmTargetIds;
assert.throws(() => createCanonicalMfmFacts({repoRoot: ROOT, crossDomainBindings: heuristicSplitAttempt}), /effectiveTarget\.armyUnitId is required/);

const reordered = clone(registry);
for (const key of ['armyBookBindings', 'forceDispositionBindings', 'unitBindings', 'detachmentBindings', 'enhancementBindings', 'qualifierOwnerBindings', 'relationAdjudications']) reordered[key] = Object.fromEntries(Object.entries(reordered[key]).reverse());
const reorderedEffective = createEffectiveMfmCatalog({canonicalFacts: createCanonicalMfmFacts({repoRoot: ROOT, crossDomainBindings: reordered})}).catalog;
assert.equal(JSON.stringify(reorderedEffective), JSON.stringify(effective), 'MFM cross-domain output must be deterministic');

console.log('MFM_CROSS_DOMAIN_CONVERGENCE_QA=PASS');
console.log('UNIT_BINDINGS=629');
console.log('UNIT_REFERENCE_ONLY=114');
console.log('DETACHMENT_BINDINGS=134');
console.log('ENHANCEMENT_BINDINGS=474');
console.log('QUALIFIER_OWNER_BINDINGS=16');
console.log('MFM_MISSIONS_BINDING=5/5');
console.log('HURON_EFFECTIVE_TARGETS=4');
console.log('CALGAR_EFFECTIVE_TARGETS=13_OFFICIAL_FALLBACK');
