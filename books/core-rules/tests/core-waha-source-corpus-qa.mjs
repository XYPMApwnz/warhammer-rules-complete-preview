#!/usr/bin/env node

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const sourceDir = existsSync(join(here, 'waha-core-corpus.v1.json'))
  ? here
  : join(here, '..', 'sources', 'waha-core-2026-09-25');
const corpusPath = process.argv[2] ?? join(sourceDir, 'waha-core-corpus.v1.json');
const manifestPath = process.argv[3] ?? join(sourceDir, 'waha-core-corpus.manifest.json');
const defectsPath = join(sourceDir, 'known-source-defects.v1.json');
const corpusRaw = readFileSync(corpusPath);
const manifestRaw = readFileSync(manifestPath);
const golden = JSON.parse(corpusRaw);
const manifest = JSON.parse(manifestRaw);
const defects = JSON.parse(readFileSync(defectsPath));

const EXPECTED_FINGERPRINT = '7AD0124845D23DB5CAADEE077732F8BDB6ECD9B2D713E6977F7917BBE0B14D5F';
const EXPECTED = {
  core: { numbered: 177, faq: 66, errata: 6, uru: 0, total: 249 },
  appendix: { numbered: 106, faq: 0, errata: 1, uru: 5, total: 112 },
  effective: { numbered: 275, faq: 66, errata: 7, uru: 5, total: 353, numberedOverlap: 8 },
};

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex').toUpperCase();
}

function withoutHash(value, key = 'contentHash') {
  const copy = structuredClone(value);
  delete copy[key];
  return copy;
}

function verifyContent(content, label) {
  assert.equal(content.contentHash, sha256(canonical(withoutHash(content))), `${label}: content hash`);
}

function pageInventory(page) {
  return {
    numbered: page.numbered.length,
    faq: page.faqs.length,
    errata: page.errata.length,
    uru: page.universalRulesUpdates.length,
    total: page.numbered.length + page.faqs.length + page.errata.length + page.universalRulesUpdates.length,
  };
}

function verifyUnitHashes(page) {
  const ids = new Set();
  for (const unit of page.numbered) {
    assert(!ids.has(unit.id), `${page.id}: duplicate unit id ${unit.id}`);
    ids.add(unit.id);
    assert(unit.occurrences.length > 0, `${unit.id}: no source occurrence`);
    for (const [index, occurrence] of unit.occurrences.entries()) {
      verifyContent(occurrence.content, `${unit.id}.occurrence-${index + 1}`);
    }
    assert.equal(unit.contentHash, sha256(canonical(unit.occurrences)), `${unit.id}: unit hash`);
  }
  for (const [field, kind] of [['faqs', 'faq'], ['errata', 'errata'], ['universalRulesUpdates', 'uru']]) {
    for (const unit of page[field]) {
      assert(!ids.has(unit.id), `${page.id}: duplicate unit id ${unit.id}`);
      ids.add(unit.id);
      verifyContent(unit.content, unit.id);
      const payload = kind === 'errata' ? { label: unit.label, content: unit.content } : unit.content;
      assert.equal(unit.contentHash, sha256(canonical(payload)), `${unit.id}: unit hash`);
    }
  }
}

function verify(corpus) {
  assert.equal(corpus.schema, 'waha-11e-core-corpus/v1');
  assert.deepEqual(corpus.pages.map((page) => page.id), ['core', 'appendix']);
  for (const page of corpus.pages) verifyUnitHashes(page);
  assert.deepEqual(pageInventory(corpus.pages[0]), EXPECTED.core, 'core owner inventory');
  assert.deepEqual(pageInventory(corpus.pages[1]), EXPECTED.appendix, 'appendix owner inventory');
  assert.deepEqual(corpus.effective.counts, EXPECTED.effective, 'effective inventory');

  const coreCodes = new Set(corpus.pages[0].numbered.map((unit) => unit.code));
  const appendixCodes = new Set(corpus.pages[1].numbered.map((unit) => unit.code));
  const overlap = [...coreCodes].filter((code) => appendixCodes.has(code)).sort();
  assert.deepEqual(overlap, corpus.effective.numberedOverlapCodes, 'numbered overlap codes');
  assert.equal(new Set([...coreCodes, ...appendixCodes]).size, EXPECTED.effective.numbered);

  const fingerprintInput = withoutHash(corpus, 'fingerprint');
  assert.equal(corpus.fingerprint, sha256(canonical(fingerprintInput)), 'corpus fingerprint');
  assert.equal(corpus.fingerprint, EXPECTED_FINGERPRINT, 'pinned corpus fingerprint');
}

function allContents(corpus) {
  return corpus.pages.flatMap((page) => [
    ...page.numbered.flatMap((unit) => unit.occurrences.map((occurrence) => occurrence.content)),
    ...page.faqs.map((unit) => unit.content),
    ...page.errata.map((unit) => unit.content),
    ...page.universalRulesUpdates.map((unit) => unit.content),
  ]);
}

function mutation(name, mutate) {
  const candidate = structuredClone(golden);
  mutate(candidate);
  assert.throws(() => verify(candidate), undefined, `${name} escaped corpus QA`);
}

assert.equal(manifest.schema, 'waha-11e-core-corpus-manifest/v1');
assert.equal(manifest.corpusFingerprint, EXPECTED_FINGERPRINT);
assert.equal(manifest.corpusFileSha256, sha256(corpusRaw));
assert.deepEqual(manifest.counts.core, golden.pages[0].counts);
assert.deepEqual(manifest.counts.appendix, golden.pages[1].counts);
assert.deepEqual(manifest.counts.effective, golden.effective.counts);
assert.deepEqual(manifest.numberedOverlapCodes, golden.effective.numberedOverlapCodes);
assert.deepEqual(manifest.unresolvedReferences, golden.sourceDiagnostics.unresolvedReferences);
assert.deepEqual(
  manifest.unresolvedReferences.map((ref) => ref.rawTarget),
  ['/wh40k11ed/the-rules/core-rules/#Assault-'],
  'the pinned source has one known dangling source link',
);
verify(golden);
assert.equal(defects.schema,'waha-core-known-source-defects/v1');
assert.equal(defects.corpusBinding.corpusFingerprint,EXPECTED_FINGERPRINT);
assert.deepEqual(defects.defects.map(item=>item.kind).sort(),['KNOWN_SOURCE_MARKUP_DEFECT','KNOWN_SOURCE_NAVIGATION_DEFECT','KNOWN_SOURCE_SEMANTIC_ANOMALY']);
for(const defect of defects.defects){
  const unit=golden.pages.flatMap(page=>[...page.numbered,...page.faqs,...page.errata,...page.universalRulesUpdates]).find(item=>item.id===defect.source.unitId);
  assert(unit,`${defect.id}: missing bound source unit`);
  assert.equal(unit.contentHash,defect.source.unitContentHash,`${defect.id}: stale unit hash`);
  const occurrence=(unit.occurrences||[]).find(item=>item.sourceOrder===defect.source.sourceOrder);
  assert(occurrence,`${defect.id}: missing bound occurrence`);
  assert.equal(occurrence.content.contentHash,defect.source.occurrenceContentHash,`${defect.id}: stale occurrence hash`);
}

mutation('missing rule', (c) => c.pages[0].numbered.splice(1, 1));
mutation('text omission', (c) => {
  const content = allContents(c).find((item) => item.text.length > 80);
  content.text = content.text.slice(0, -20);
});
mutation('numeric change', (c) => {
  const content = allContents(c).find((item) => /\d/.test(item.text));
  content.text = content.text.replace(/\d/, (digit) => String((Number(digit) + 1) % 10));
});
mutation('condition or negation change', (c) => {
  const content = allContents(c).find((item) => /\bnot\b/i.test(item.text));
  content.text = content.text.replace(/\bnot\b/i, '');
});
mutation('exception removal', (c) => {
  const content = allContents(c).find((item) => /\b(?:except|unless)\b/i.test(item.text));
  content.text = content.text.replace(/\b(?:except|unless)\b/i, '');
});
mutation('list item removal', (c) => {
  const content = allContents(c).find((item) => item.lists.some((list) => list.items.length));
  content.lists.find((list) => list.items.length).items.pop();
});
mutation('table row removal', (c) => {
  const content = allContents(c).find((item) => item.tables.length);
  content.tables.pop();
});
mutation('reference target change', (c) => {
  const content = allContents(c).find((item) => item.references.length);
  const ref = content.references[0];
  const field = 'target' in ref ? 'target' : 'selector';
  ref[field] = `${ref[field]}-mutated`;
});
mutation('unsourced extra', (c) => {
  const extra = structuredClone(c.pages[0].faqs[0]);
  extra.id = `${extra.id}-UNSOURCED`;
  c.pages[0].faqs.push(extra);
});

console.log(`CORE_CORPUS_QA=PASS fingerprint=${golden.fingerprint} mutations=9`);
