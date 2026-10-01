import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadLeadingRuntime, sourceModelsForUnit, runLeadingStateControls} from './helpers/tau-leading-state-controls.mjs';

const root = new URL('../', import.meta.url);
const read = file => JSON.parse(fs.readFileSync(new URL(file, root), 'utf8'));
const fixture = read('tests/fixtures/tau-leading-state.json');
const corpus = read(fixture.sourcePath);
const normalize = text => String(text).replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
const attachmentWords = /\bleading\b|\battached\b|\bled by\b/i;
const candidates = [];
const add = (sourceId, text, blockOrdinal = null, kind = 'gameplay') => {
  if (attachmentWords.test(text)) candidates.push({sourceId, text, blockOrdinal, kind});
};

// Derive the denominator from accepted gameplay evidence, never effect contracts
// or certification counts. Attachment eligibility sections are construction facts,
// not effects conditional on a character currently leading a unit.
for (const rule of corpus.armyRules) {
  if (rule.text) add(rule.sourceId, rule.text);
  for (const component of rule.components || []) add(component.sourceId, component.text);
}
for (const detachment of corpus.detachments) {
  add(detachment.rule.sourceId, detachment.rule.text);
  for (const enhancement of detachment.enhancements) add(enhancement.sourceId, enhancement.text);
  for (const stratagem of detachment.stratagems) {
    for (const line of stratagem.lines) add(stratagem.sourceId, line.text, line.label, 'stratagem');
  }
}
for (const datasheet of corpus.datasheets) {
  for (const section of datasheet.sections) {
    if (['LEADER', 'ATTACHED UNIT'].includes(section.title.toUpperCase())) continue;
    section.blocks.forEach((block, index) => add(section.sourceId, block.text, index + 1));
  }
}

const key = row => `${row.sourceId}|${row.blockOrdinal ?? ''}`;
const excluded = fixture.excludedBattleStateRecords;
for (const exclusion of excluded) {
  assert.equal(candidates.filter(row => key(row) === key(exclusion)).length, 1, 'Every battle-state exclusion must resolve to one accepted source record');
}
for (const candidate of candidates) {
  const exclusion = excluded.find(row => key(row) === key(candidate));
  if (exclusion) {
    assert.equal(normalize(candidate.text), normalize(exclusion.sourceText), 'Re-adjudicate changed battle-state exclusion');
    assert.equal(candidate.kind, 'stratagem');
  }
}
const leading = candidates.filter(candidate => !excluded.some(row => key(row) === key(candidate)));
assert.deepEqual(leading.map(key).sort(), fixture.records.map(key).sort(), 'Every accepted leading-state source record must have an independent fixture');
assert.equal(new Set(fixture.records.map(key)).size, fixture.records.length, 'Do not flatten multiple abilities within a section');

const loaded = loadLeadingRuntime('tau-empire');
let cases = 0;
for (const record of fixture.records) {
  const source = leading.find(row => key(row) === key(record));
  assert.equal(normalize(source.text), normalize(record.sourceText), `${record.title}: source prerequisite/scope changed`);
  assert.match(record.sourceText, /while (?:this model|the bearer) is leading a unit/i);
  assert.ok(record.requiredState && record.targetScope);
  const contract = loaded.catalog.effectContracts.find(row => row.canonicalRecordId === record.spec.sourceId);
  assert.ok(contract, `${record.title}: executable contract missing`);
  assert.deepEqual(Array.from(new Set(contract.clauses.flatMap(clause => clause.operations.map(operation => operation.id)))).sort(),
    [...record.spec.operationIds].sort(), `${record.title}: cover all executable operations`);
  const spec = {...record.spec,
    ownerModels:sourceModelsForUnit(loaded, record.spec.ownerUnitId),
    bodyguardModels:sourceModelsForUnit(loaded, record.spec.bodyguardUnitId)};
  runLeadingStateControls({loaded, spec});
  cases += 7;
  console.log(`PASS ${record.title}: seven states, exact physical scope, duplicate isolation`);
}
console.log(`T'au leading-state source records=${leading.length}; checked=${fixture.records.length}; correct=${fixture.records.length}; incorrect=0; unresolved=0; state cases=${cases}`);
console.log('Seven rules project numeric/tag effects; seven propagate source-backed conditional references. Unsupported battle-state predicates are not simulated.');

// A rule applying to the bearer's unit without a leading prerequisite must keep
// its standalone effect. This rules out repairing the shared attached-group
// fallback by suppressing every unattached enhancement.
for (const control of fixture.negativePrerequisiteControls) {
  const source = corpus.detachments.flatMap(row => row.enhancements).find(row => row.sourceId === control.sourceId);
  assert.equal(normalize(source.text), normalize(control.sourceText));
  assert.ok(!attachmentWords.test(source.text));
  runLeadingStateControls({loaded, spec:{sourceId:'enhancement-kroothawk-flock',
    enhancementId:'enhancement-kroothawk-flock', ownerUnitId:'unit-kroot-trail-shaper', bodyguardUnitId:'unit-kroot-carnivores',
    operationIds:['kroothawk-cover','canonical-enhancement-kroothawk-flock'], standaloneTargets:['parsed-unit-1'],
    ownerModels:sourceModelsForUnit(loaded,'unit-kroot-trail-shaper'), bodyguardModels:sourceModelsForUnit(loaded,'unit-kroot-carnivores')}});
}
console.log('Unconditional Kroothawk Flock negative-prerequisite control: seven states PASS');
