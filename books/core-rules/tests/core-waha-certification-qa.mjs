#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createEffectiveCoreCatalog} from '../content/effective-core-catalog.mjs';

const coreRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot=path.join(coreRoot,'sources','waha-core-2026-09-25');
const corpus=JSON.parse(fs.readFileSync(path.join(sourceRoot,'waha-core-corpus.v1.json'),'utf8'));
const census=JSON.parse(fs.readFileSync(path.join(sourceRoot,'waha-core-player-visible-reference-census.v1.json'),'utf8'));
const defects=JSON.parse(fs.readFileSync(path.join(sourceRoot,'known-source-defects.v1.json'),'utf8'));
const catalog=createEffectiveCoreCatalog();
const byId=new Map(catalog.records.map(record=>[record.id,record]));
const normalize=value=>String(value||'').normalize('NFKC').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-').replace(/•/g,'').replace(/\s+/g,'').toLowerCase();
const sourceUnits=new Map();
for(const page of corpus.pages)for(const field of ['numbered','faqs','errata','universalRulesUpdates'])for(const unit of page[field])sourceUnits.set(unit.id,unit);

assert.equal(corpus.fingerprint,'7AD0124845D23DB5CAADEE077732F8BDB6ECD9B2D713E6977F7917BBE0B14D5F');
assert.equal(catalog.wahaCorpusFingerprint,corpus.fingerprint);
assert.equal(catalog.sourceMappings.length,353);
assert.equal(sourceUnits.size,361,'physical owner inventory must retain eight numbered overlaps');
const effectiveSourceIds=new Set(catalog.sourceMappings.map(mapping=>mapping.sourceEffectiveId));
assert.equal(effectiveSourceIds.size,353);
for(const mapping of catalog.sourceMappings){
  assert(mapping.sourceUnitIds.length&&mapping.canonicalIds.length,`${mapping.sourceEffectiveId}: incomplete binding`);
  for(const sourceId of mapping.sourceUnitIds)assert(sourceUnits.has(sourceId),`${mapping.sourceEffectiveId}: unknown source ${sourceId}`);
  for(const canonicalId of mapping.canonicalIds){
    const record=byId.get(canonicalId);
    assert(record,`${mapping.sourceEffectiveId}: unknown canonical ${canonicalId}`);
    assert(mapping.sourceUnitIds.some(id=>(record.sourceUnitIds||[]).includes(id)),`${mapping.sourceEffectiveId}: canonical record lost source identity`);
  }
}

const sourceLinked=new Set(catalog.sourceMappings.flatMap(mapping=>mapping.canonicalIds));
for(const record of catalog.records){
  const externalOfficial=record.provenance?.authorityLevel==='GLOBAL_OFFICIAL'||record.provenance?.sourceClass?.includes('OFFICIAL')||record.provenance?.strongerCurrentGw||record.provenance?.effectiveOverride;
  const acceptedPresentation=record.recordType==='CORE_CONCEPT'&&record.provenance?.sourceClass==='ACCEPTED_CORE_PRESENTATION';
  const derivedFromOwnedRule=record.recordType==='CORE_CONCEPT'&&sourceLinked.has(record.relationships?.sourceRuleId);
  assert(sourceLinked.has(record.id)||externalOfficial||acceptedPresentation||derivedFromOwnedRule,`${record.id}: unsourced canonical record`);
}

const structuredCount=corpus.pages.reduce((total,page)=>total+page.counts.gameplayListItems+page.counts.seeAlsoItems+page.counts.tableRows+page.counts.faqTableRows+page.counts.notes+page.counts.examples,0);
assert.equal(structuredCount,948);
assert.equal(census.counts.total,1087);
assert.equal(census.counts.currentlyCanonicalResolved,1087);
assert.equal(census.counts.currentlyPlayerNavigable,1087);
assert.equal(census.counts.expectedAfterCatalogRepair,0);
assert.equal(census.counts.byStatus.RESOLVED_PLAYER_NAVIGABLE,1086);
assert.equal(census.counts.byStatus.KNOWN_SOURCE_NAVIGATION_DEFECT_RESOLVED,1);
assert.equal(census.entries.filter(entry=>!entry.canonicalId||!entry.playerV2Id||!entry.playerReaderPath).length,0);
assert.equal(census.counts.uniqueReferenceEdges,925);

assert.deepEqual(catalog.sourceDefects,defects.defects);
const anomaly=catalog.getByCode('18.07');
assert(anomaly.provenance.sourceAdjudications.some(item=>item.kind==='KNOWN_SOURCE_SEMANTIC_ANOMALY'));
assert(normalize(anomaly.sourceStructure.text).includes(normalize(anomaly.semanticContent)),'18.07 exact accepted Waha wording must remain the effective operational content');
assert.equal(catalog.sourceDefects.filter(item=>item.kind==='KNOWN_SOURCE_SEMANTIC_ANOMALY').length,1);
assert.equal(catalog.sourceDefects.filter(item=>item.kind==='KNOWN_SOURCE_NAVIGATION_DEFECT').length,1);
assert.equal(catalog.sourceDefects.filter(item=>item.kind==='KNOWN_SOURCE_MARKUP_DEFECT').length,1);

const pending=['01.02.06','12.08','13.09','18.04.01','18.05','18.06','18.07','22.03.01'];
for(const code of pending)assert(catalog.getByCode(code)?.state==='FULL_CONTENT',`${code}: certified source unit remains pending`);

const sourceConflicts=catalog.mainRules.filter(record=>record.state==='SOURCE_CONFLICT');
assert.deepEqual(sourceConflicts.map(record=>record.code),['09.07.01'],'accepted unresolved conflict inventory changed without source review');
assert.equal(sourceConflicts[0].semanticContent,null,'unresolved source conflict cannot be certified as current gameplay text');
assert.equal(sourceConflicts[0].sourceConflict.status,'UNRESOLVED_ACCEPTED_SOURCE_CONFLICT');
console.log(JSON.stringify({
  status:'CORE_WAHA_SOURCE_ACCOUNTED_WITH_UNRESOLVED_CONFLICT',sourceUnitsAccounted:catalog.sourceMappings.length,canonicalRuleUnits:catalog.records.length,
  acceptedStructuredFacts:structuredCount,acceptedReferenceOccurrences:census.entries.length,
  effectiveMainRules:catalog.mainRules.filter(record=>record.state==='FULL_CONTENT').length,unresolvedSourceConflicts:sourceConflicts.map(record=>({id:record.id,status:record.sourceConflict.status})),
  referenceOccurrences:1087,uniqueReferenceEdges:925,referencesExact:1086,sourceDefectReferencesResolved:1,
  knownSourceSemanticAnomalies:1,knownSourceNavigationDefects:1,knownSourceMarkupDefects:1
}));
