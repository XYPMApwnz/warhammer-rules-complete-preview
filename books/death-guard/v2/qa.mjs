import fs from 'node:fs';
import assert from 'node:assert/strict';
import {buildFactualV2,buildV2} from './build.mjs';
import {sourceCurrentness} from './overlay-engine.mjs';
import {assertNoMfmValues,resolveOwnedFact} from './mfm-boundary.mjs';

const read = name => JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const enrollment = read('./sources/source-enrollment.json');
const evidence = read('./sources/official-source-evidence.json');
const {base,effective} = buildFactualV2();
assert.deepEqual(buildFactualV2(),{base,effective},'Deterministic effective build');
assertNoMfmValues(base.entities); assertNoMfmValues(effective.entities);
assert.equal(effective.currentness.currentness,'CURRENT');
assert.deepEqual(effective.captureGaps,[],'Every independent source capture gap must close');
const byId = new Map(effective.entities.map(entity => [entity.id,entity]));
const baseById = new Map(base.entities.map(entity => [entity.id,entity]));
const sourceIds = new Set(effective.sources.map(source => source.id));
assert.equal(byId.size,effective.entities.length);
const corpus = JSON.parse(fs.readFileSync(new URL('../sources/waha-11e-current-2026-09-25/corpus.json',import.meta.url),'utf8'));
for (const source of corpus.datasheets) {
  const unit = byId.get(source.sourceId.replace(/^datasheet-/,'unit-'));
  assert.equal(unit.data.profileIds.length,1,'Do not flatten or invent profile identity');
  const profile = byId.get(unit.data.profileIds[0]);
  assert.deepEqual(baseById.get(unit.data.profileIds[0]).data,source.statline,'Every base characteristic comes from accepted source');
  for (const weapon of source.weapons) {
    const {sourceId,...facts} = weapon;
    assert.deepEqual(baseById.get(sourceId).data,facts,'Every base weapon field and ability comes from accepted source');
  }
  if (source.statline.INSV) assert.equal(profile.data.INSV,source.statline.INSV,'Source-backed Invulnerable Save retained');
  else assert.equal(Object.hasOwn(profile.data,'INSV'),false,'No invented Invulnerable Save');
  assert.equal(profile.data.SV,source.statline.SV,'Armour Save unchanged');
  assert.deepEqual(unit.data.weaponIds,source.weapons.map(weapon => weapon.sourceId),'No weapon identity flattening');
  assert.deepEqual(unit.data.wargearOptionIds,source.wargearOptions.map(option => option.sourceId),'No option omitted');
}
for (const entity of effective.entities) {
  assert.ok(entity.provenance.sourceId && entity.provenance.sourceRecordId && entity.provenance.pointer,'Every fact retains evidence identity');
  assert.ok(sourceIds.has(entity.provenance.sourceId),'Every factual owner resolves to an enrolled source');
  for (const proof of Object.values(entity.fieldProvenance || {})) assert.ok(sourceIds.has(proof.sourceId),'Every updated field has an enrolled source');
  if (entity.parentId) assert.ok(byId.has(entity.parentId),'Parent identity resolves');
  if (entity.data.ruleId) assert.ok(byId.has(entity.data.ruleId),'Detachment rule identity resolves');
  for (const field of ['profileIds','weaponIds','sectionIds','wargearOptionIds','ruleReferenceIds','rawFactIds','componentIds','enhancementIds','stratagemIds']) {
    for (const id of entity.data[field] || []) assert.ok(byId.has(id),`${entity.id}: unresolved ${field}/${id}`);
  }
}

// Independent accepted PDF adjudication ledger, not V1 parity/certification.
function verifySeptemberWeaponFacts(model) {
  const index = new Map(model.entities.map(entity => [entity.id,entity]));
  let fields = 0;
  for (const source of evidence.newSeptemberWeaponTable.targetInventory) for (const [field,value] of Object.entries(source.fields)) {
    const entity = index.get(source.targetId);
    assert.equal(entity.data[field],value,`${source.targetId}: accepted official p7 ${field}`);
    assert.equal(entity.fieldProvenance[field].sourceId,evidence.latestDeathGuardSource.id,'Latest source owns changed value');fields++;
  }
  assert.equal(fields,evidence.newSeptemberWeaponTable.fieldChanges);
}
verifySeptemberWeaponFacts(effective);
for (const binding of [...effective.mfm.unitBindings,...effective.mfm.detachmentBindings,...effective.mfm.enhancementBindings,...effective.mfm.paidUpgradeBindings]) {
  assert.equal(binding.owner,'CENTRALIZED_MFM');assert.equal(resolveOwnedFact(binding.mfmRecordId).id,binding.mfmRecordId);
}
assert.equal(effective.mfm.eligibilityEvidenceBindings.length,11);
for (const binding of effective.mfm.eligibilityEvidenceBindings) {
  assert.equal(binding.effectiveOwner,'CENTRALIZED_MFM');
  assert.equal(byId.get(binding.sourceEntityId).parentId,binding.sourceId);
  assert.equal(binding.sourceTextRole,'BASE_EVIDENCE_ONLY_FOR_ELIGIBILITY');
}
let mutations = 0;
const baseIntegrity = structuredClone(enrollment); baseIntegrity.acceptedBase.sha256 = '0'.repeat(64);
assert.throws(() => buildFactualV2({enrollment:baseIntegrity}),/source integrity/); mutations++;
for (const operation of enrollment.overlayOperations.filter(row => evidence.newSeptemberWeaponTable.targetInventory.some(source => source.targetId === row.targetId && Object.hasOwn(source.fields,row.field[0])))) {
  const mutant = {...enrollment,overlayOperations:enrollment.overlayOperations.filter(row => row.id !== operation.id)};
  assert.throws(() => verifySeptemberWeaponFacts(buildFactualV2({enrollment:mutant}).effective),`${operation.id}: missing overlay must fail accepted-source guard`);mutations++;
}
const wrongTarget = structuredClone(enrollment); wrongTarget.overlayOperations[0].targetId = 'unresolved-source-target';
assert.throws(() => buildFactualV2({enrollment:wrongTarget}),/unresolved target identity/); mutations++;
const ownership = structuredClone(base.entities); ownership[0].data.points = [{value:1}];
assert.throws(() => assertNoMfmValues(ownership),/duplicate MFM value ownership/); mutations++;
const pending = {...enrollment.sources[0],id:'new-applicable-update',effectiveFrom:'2026-10-02',reconciled:false};
assert.equal(sourceCurrentness([...effective.sources,pending]).currentness,'STALE'); mutations++;

// Poison only the read API in memory. The independent factual build must never
// request V1 canonical/presentation/generated files. No repository file changes.
const readFile = fs.readFileSync;
try {
  fs.readFileSync = function(file,...args) {
    const name = String(file).replaceAll('\\','/');
    if (name.endsWith('/content/death-guard-rules.en.json') || /death-guard\/scripts\/(data|roster-data|target-data)\.js$/.test(name)) throw new Error('V1 factual feedback forbidden');
    return readFile.call(this,file,...args);
  };
  assert.deepEqual(buildFactualV2(),{base,effective});
} finally {fs.readFileSync = readFile;}
const comparison = (await buildV2()).comparison;
assert.equal(comparison.comparisonOnly,true);
console.log(`DG V2 factual QA PASS: entities=${base.entities.length}, overlays=${effective.appliedOverlays.length}, mutations=${mutations}; stable identity/provenance/ownership/determinism/source currentness/no V1 feedback`);
