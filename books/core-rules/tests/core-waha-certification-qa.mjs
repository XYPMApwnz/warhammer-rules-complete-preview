#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createEffectiveCoreCatalog} from '../content/effective-core-catalog.mjs';

const coreRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot=path.join(coreRoot,'sources','waha-core-2026-11-11');
const corpus=JSON.parse(fs.readFileSync(path.join(sourceRoot,'waha-core-corpus.v1.json'),'utf8'));
const census=JSON.parse(fs.readFileSync(path.join(sourceRoot,'waha-core-player-visible-reference-census.v1.json'),'utf8'));
const defects=JSON.parse(fs.readFileSync(path.join(sourceRoot,'known-source-defects.v1.json'),'utf8'));
const catalog=createEffectiveCoreCatalog();
const acceptedCandidate=JSON.parse(fs.readFileSync(path.join(sourceRoot,'core-rules.candidate.v1.json'),'utf8'));
const historical=JSON.parse(fs.readFileSync(path.join(coreRoot,'sources','core-importer-baselines','7b15dc36.v1.json'),'utf8'));
const byId=new Map(catalog.records.map(record=>[record.id,record]));
const normalize=value=>String(value||'').normalize('NFKC').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-').replace(/•/g,'').replace(/\s+/g,'').toLowerCase();
const sourceUnits=new Map();
for(const page of corpus.pages)for(const field of ['numbered','faqs','errata','universalRulesUpdates'])for(const unit of page[field])sourceUnits.set(unit.id,unit);

assert.equal(corpus.fingerprint,'2E39280BEB3D0C92F87F4F3DB231CA3BC40192C12575AF998E5D2A2DB684C14A');
assert.equal(catalog.wahaCorpusFingerprint,corpus.fingerprint);
assert.equal(catalog.acceptedSourceRegistry.sources.find(source=>source.sourceId==='waha-core-corpus-2026-11-11')?.corpusFingerprint,catalog.wahaCorpusFingerprint,'the active source registry must authenticate the same November corpus as the catalog');
assert.equal(catalog.sourceMappings.length,368);
assert.equal(sourceUnits.size,379,'physical owner inventory must retain eleven numbered overlaps');
const effectiveSourceIds=new Set(catalog.sourceMappings.map(mapping=>mapping.sourceEffectiveId));
assert.equal(effectiveSourceIds.size,368);
for(const mapping of catalog.sourceMappings){
  assert(mapping.sourceUnitIds.length&&mapping.canonicalIds.length,`${mapping.sourceEffectiveId}: incomplete binding`);
  for(const sourceId of mapping.sourceUnitIds)assert(sourceUnits.has(sourceId),`${mapping.sourceEffectiveId}: unknown source ${sourceId}`);
  for(const canonicalId of mapping.canonicalIds){
    const record=byId.get(canonicalId);
    assert(record,`${mapping.sourceEffectiveId}: unknown canonical ${canonicalId}`);
    if(record.id==='core-support'){
      const accepted=acceptedCandidate.records.find(item=>item.id==='core-support');
      const baseline=historical.view.records.find(item=>item.id==='core-support');
      assert.deepEqual(mapping.sourceUnitIds,['waha-core-rule-24-34'],'SUPPORT must map only from its newly numbered, same-meaning source owner');
      assert.deepEqual(record.sourceUnitIds,['waha-core-rule-24-22','waha-core-rule-24-23'],'SUPPORT must preserve its exact accepted historical binding');
      for(const [key,value] of Object.entries(baseline))assert.deepEqual(record[key],value,`SUPPORT changed accepted baseline field ${key}`);
      assert.equal(record.semanticContent,accepted.text,'SUPPORT changed accepted Task A wording');
      const fresh=sourceUnits.get('waha-core-rule-24-34');
      assert(fresh.occurrences.every(occurrence=>normalize(occurrence.content.text).includes(normalize(record.semanticContent))),'fresh SUPPORT owner does not contain the complete accepted wording');
    }else assert(mapping.sourceUnitIds.some(id=>(record.sourceUnitIds||[]).includes(id)),`${mapping.sourceEffectiveId}: canonical record lost source identity`);
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
assert.equal(structuredCount,990);
assert.equal(census.counts.total,1104);
assert.equal(census.counts.currentlyCanonicalResolved,1104);
assert.equal(census.counts.currentlyPlayerNavigable,1104);
assert.equal(census.counts.expectedAfterCatalogRepair,0);
assert.equal(census.counts.byStatus.RESOLVED_PLAYER_NAVIGABLE,1103);
assert.equal(census.counts.byStatus.KNOWN_SOURCE_NAVIGATION_DEFECT_RESOLVED,1);
assert.equal(census.entries.filter(entry=>!entry.canonicalId||!entry.playerV2Id||!entry.playerReaderPath).length,0);
assert.equal(census.counts.uniqueReferenceEdges,556,'unique physical owner/reference witnesses must match the independently enumerated capture');

assert.deepEqual(catalog.sourceDefects,defects.defects);
const shock=catalog.getByCode('18.07');
assert(!(shock.provenance.sourceAdjudications||[]).some(item=>item.kind==='KNOWN_SOURCE_SEMANTIC_ANOMALY'));
assert(normalize(shock.sourceStructure.text).includes(normalize(shock.semanticContent)),'18.07 exact accepted fresh Waha wording must remain the effective operational content');
assert.equal(catalog.sourceDefects.filter(item=>item.kind==='KNOWN_SOURCE_SEMANTIC_ANOMALY').length,0,'fresh captured wording resolves the former After Moving anomaly');
assert.equal(catalog.sourceDefects.filter(item=>item.kind==='KNOWN_SOURCE_NAVIGATION_DEFECT').length,1);
assert.equal(catalog.sourceDefects.filter(item=>item.kind==='KNOWN_SOURCE_MARKUP_DEFECT').length,1);

const pending=['01.02.06','12.08','13.09','18.04.01','18.05','18.06','18.07','22.03.01'];
for(const code of pending)assert(catalog.getByCode(code)?.state==='FULL_CONTENT',`${code}: certified source unit remains pending`);

const sourceConflicts=catalog.mainRules.filter(record=>record.state==='SOURCE_CONFLICT');
assert.deepEqual(sourceConflicts,[],'distinct source nodes must not be classified as competing versions');
assert.equal(catalog.getByCode('09.07.01'),null,'ambiguous source citation must not pick an owner');
for(const anchor of ['Desperate-Escape-Test','Desperate-Escape'])assert.equal(catalog.getByAnchor(anchor)?.state,'FULL_CONTENT');
console.log(JSON.stringify({
  status:'CORE_WAHA_SOURCE_ACCOUNTED',sourceUnitsAccounted:catalog.sourceMappings.length,canonicalRuleUnits:catalog.records.length,
  acceptedStructuredFacts:structuredCount,acceptedReferenceOccurrences:census.entries.length,
  effectiveMainRules:catalog.mainRules.filter(record=>record.state==='FULL_CONTENT').length,unresolvedSourceConflicts:sourceConflicts.map(record=>({id:record.id,status:record.sourceConflict.status})),
  referenceOccurrences:1104,uniqueReferenceEdges:556,referencesExact:1103,sourceDefectReferencesResolved:1,
  knownSourceSemanticAnomalies:0,knownSourceNavigationDefects:1,knownSourceMarkupDefects:1
}));
