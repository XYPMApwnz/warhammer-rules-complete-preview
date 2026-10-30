import {parseProducerJSON,serializeSourceJSON} from '../../shared/source-refs-v2/producer-io.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {normalizeDeathGuardCorpus} from './normalize.mjs';
import {preserveFoundationFacts} from './foundation-facts.mjs';
import {applyOverlays,sourceCurrentness} from './overlay-engine.mjs';
import {consumeMfm,assertNoMfmValues} from './mfm-boundary.mjs';
import {createEffectiveMfmArmyProjection} from '../../shared/tools/effective-mfm-army-projection.mjs';
import {compareV1Facts,loadV1ComparisonModel} from './compare-v1.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(directory,'../../..');
const read = file => parseProducerJSON(fs.readFileSync(path.join(root,file),'utf8'));
const sha = value => createHash('sha256').update(value).digest('hex').toUpperCase();
const corpusPath = 'books/death-guard/sources/waha-11e-current-2026-09-25/corpus.json';
const hubPath = 'books/death-guard/v2/sources/accepted-waha-pages/death-guard.html';

export function buildFactualV2({enrollment = read('books/death-guard/v2/sources/source-enrollment.json')} = {}) {
  const corpus = read(corpusPath), rawHubHtml = fs.readFileSync(path.join(root,hubPath));
  assert.equal(enrollment.acceptedBase?.path,corpusPath,'Explicit accepted base identity required');
  const baseSource = {id:'dg-waha-2026-09-25',type:'WAHA_CAPTURE',versionOrDate:corpus.captureDate,authority:'ACCEPTED_WAHA',
    path:corpusPath,sha256:enrollment.acceptedBase.sha256,effectiveFrom:corpus.captureDate,status:'CURRENT',
    url:corpus.pages.find(page => page.file === 'death-guard.html').url,provenance:{corpusFingerprint:corpus.corpusFingerprint},reconciled:true};
  const mfmMetadata = createEffectiveMfmArmyProjection('death-guard').sourceMetadata;
  const mfmSource = {id:`centralized-death-guard-mfm-${mfmMetadata.version}`,type:'CENTRALIZED_MFM_REFERENCE',versionOrDate:mfmMetadata.version,authority:'CENTRALIZED_MFM',
    ...(mfmMetadata.version==='v1.6'?{effectiveDate:null,verifiedAt:mfmMetadata.verifiedAt,currentnessCutoff:mfmMetadata.currentnessCutoff}:
      {effectiveFrom:mfmMetadata.currentnessCutoff}),
    status:'CURRENT',url:'https://mfm.warhammer-community.com/en/death-guard',provenance:{module:'books/shared/tools/effective-mfm-army-projection.mjs'},reconciled:true};
  const sources = [baseSource,mfmSource,...enrollment.sources];
  for (const source of sources.filter(source => source.path)) assert.equal(sha(fs.readFileSync(path.join(root,source.path))),source.sha256.toUpperCase(),`${source.id}: source integrity`);
  for (const page of corpus.pages) assert.equal(sha(fs.readFileSync(path.join(root,'books/death-guard/v2/sources/accepted-waha-pages',page.file))),page.sha256,`${page.file}: original pinned capture integrity`);
  for (const supplement of enrollment.normalizationSupplements || []) {
    const proof = supplement.provenance;
    for (const [index,file] of proof.sourcePaths.entries()) assert.equal(sha(fs.readFileSync(path.join(root,file))),proof.sha256s[index].toUpperCase(),'Supplemental normalization source integrity');
  }
  const rawPages = Object.fromEntries(corpus.pages.map(page => [page.file,fs.readFileSync(path.join(root,'books/death-guard/v2/sources/accepted-waha-pages',page.file))]));
  const normalized = normalizeDeathGuardCorpus(corpus,{rawHubHtml,rawHubPath:hubPath,rawPages,normalizationSupplements:enrollment.normalizationSupplements || []});
  const ledger=read('books/death-guard/v2/foundation-closure.json');
  const profileSelectionEvidence=read('books/death-guard/v2/sources/profile-selection-evidence.json');
  const foundationPaths=new Set([...ledger.leaves.map(leaf=>leaf.sourceArtifact),...profileSelectionEvidence.records.map(record=>record.provenance.documentPath)]);
  const foundationRawSources=Object.fromEntries([...foundationPaths].map(file=>[file,fs.readFileSync(path.join(root,file))]));
  const base=preserveFoundationFacts(normalized,{ledger,rawSources:foundationRawSources,profileSelectionEvidence});
  assertNoMfmValues(base.entities);
  const projected = applyOverlays(base,sources,enrollment.overlayOperations);
  assertNoMfmValues(projected.entities);
  const mfm = consumeMfm(projected.entities);
  assert.equal(mfm.source.version,mfmSource.versionOrDate,'Central MFM source version must match enrolled reference');
  assert.equal(mfm.source.currentnessCutoff,mfmSource.currentnessCutoff||mfmSource.effectiveFrom,'Central MFM observation cutoff must match enrolled reference');
  const unresolvedGaps = base.captureGaps.filter(gap => !projected.appliedOverlays.some(operation => operation.targetId === gap.entityId && JSON.stringify(operation.field) === JSON.stringify(gap.field)));
  const blockers = [...(enrollment.blockingItems || []),...unresolvedGaps];
  const official = sources.filter(source => source.authority === 'OFFICIAL_GW' && source.type === 'OFFICIAL_PDF' && source.status === 'CURRENT').sort((a,b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
  const effective = {...projected,schema:'dg-v2-effective/v1',sources,mfm,
    currentness:sourceCurrentness(sources,{blockingItems:blockers,lastReconciledSource:official.find(source => source.reconciled)?.id || null}),
    productionSwitched:false,rosterV2Started:false};
  return {base,effective};
}

export async function buildV2(options) {
  const {base,effective} = buildFactualV2(options);
  // V1 is read only and only reached after independently building V2 facts.
  const v1EffectiveModel = await loadV1ComparisonModel(root);
  const comparison = compareV1Facts(effective,read('books/death-guard/content/death-guard-rules.en.json'),{v1EffectiveModel});
  return {base,effective,comparison};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await buildV2(), check = process.argv.includes('--check');
  const outputDir = path.join(directory,'generated');
  if (!check) fs.mkdirSync(outputDir,{recursive:true});
  for (const [name,value] of Object.entries(result)) {
    const file = path.join(outputDir,`${name}.json`), text = serializeSourceJSON(value);
    if (check) assert.equal(fs.readFileSync(file,'utf8'),text,`${name}: deterministic output drift`); else fs.writeFileSync(file,text);
  }
  console.log(JSON.stringify({canonicalEntities:result.base.entities.length,overlayOperations:result.effective.appliedOverlays.length,
    currentness:result.effective.currentness,comparison:result.comparison.summary || result.comparison.counters},null,2));
}
