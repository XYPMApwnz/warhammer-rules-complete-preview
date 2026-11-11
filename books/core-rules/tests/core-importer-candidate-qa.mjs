/** Candidate-only Core importer controls. This test never activates candidate data. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolveQaPython} from '../../../tests/helpers/qa-python.cjs';
import {createQaTempDir,cleanupQaTempDir,qaTempEnvironment} from '../../../tests/helpers/qa-temp.mjs';

const repoRoot=fileURLToPath(new URL('../../../',import.meta.url));
const fixtureFile=fileURLToPath(new URL('./fixtures/core-importer-baseline-v1.json',import.meta.url));
const fixtureSHA256='d2f86449b838fd7afe3447508a0734ed845444ea60c52e9c9b6837871f3c3274';
const redistributionFile=fileURLToPath(new URL('./fixtures/core-importer-redistributions-v1.json',import.meta.url));
const redistributionSHA256='03f23bd77b04323b5ef2db7f8cde49fd0b75ef601b749319bfcedce99668b27e';
const sourceChangesFile=fileURLToPath(new URL('./fixtures/core-importer-source-changes-v1.json',import.meta.url));
const sourceChangesSHA256='28a14915508f0c5fae79c7282bf36f9f66d3b7428378c5cd75f913d17757091e';
const representationsFile=fileURLToPath(new URL('./fixtures/core-importer-representations-v1.json',import.meta.url));
const representationsSHA256='9449079b5851cd50374563da051d6095e5439718d6e6af6ba0c23f78d8dc8ac8';
const faqIdentitiesFile=fileURLToPath(new URL('./fixtures/core-importer-faq-identities-v1.json',import.meta.url));
const faqIdentitiesSHA256='991066fe27e1c53d3ec5059abb09eea9aae8c8419e4520eeed2c42ae86674705';
const exceptionFactsFile=fileURLToPath(new URL('./fixtures/core-importer-exception-facts-v1.json',import.meta.url));
const exceptionFactsSHA256='ea0b65fafbf9010db513a744f9015cbc80a57b19a98af5c723640346610b4ac2';
const ownerBoundariesFile=fileURLToPath(new URL('./fixtures/core-importer-owner-boundaries-v1.json',import.meta.url));
const ownerBoundariesSHA256='ca294ee97b53ba534672b618d0b8425d5cd28211c0a5ade2d81a93403256e6df';
const historicalBoundaryFile=fileURLToPath(new URL('./fixtures/core-importer-warehouse-boundary-v1.json',import.meta.url));
const historicalBoundarySHA256='015775d73d58e4f06171faee69bdcc41213b4c74c2121c5684e3e8fa337ee8ab';
const historicalSourceFile=fileURLToPath(new URL('../sources/core-importer-baselines/7b15dc36.v1.json',import.meta.url));
const historicalSourceSHA256='075d31795979cbe8feb7ac999d013134a4fe09fc40dd4dbddb0d8d97e83196c0';
export const sha256=value=>createHash('sha256').update(value).digest('hex');
export const normalizeCandidateText=value=>String(value??'').normalize('NFKC')
 .replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-')
 .replace(/•/g,'').replace(/\s+/g,'').toLowerCase();
export const candidateSentences=value=>String(value??'').split(/\r?\n+|(?<=[.!?])\s+/)
 .map(text=>text.trim()).filter(Boolean);
const digest=value=>sha256(normalizeCandidateText(value));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const artifactNames=['waha-core-corpus.v1.json','waha-core-corpus.manifest.json',
 'waha-core-corpus.census.json','core-rules.candidate.v1.json'];
const newIDs=[
 'core-rule-01-02-12-replacing-one-model-with-another','core-rule-01-04-06-drawing-a-line',
 'core-rule-25-04-01-select-detachments','core-rule-25-04-02-select-units',
 'core-rule-25-04-03-attach-leaders-and-support-units','core-rule-25-04-04-select-enhancements',
 'core-faq-waha-067','core-faq-waha-068','core-faq-waha-069','core-faq-waha-070',
 'core-faq-waha-071','core-faq-waha-072','core-faq-waha-073','core-waha-errata-07-01'];
const protectedOrigins=new Map([
 ...['core-rule-01-02-03-revived-and-adding-models-to-a-unit','core-rule-08-02-01-command-points',
 'core-rule-15-05-explosives','core-rule-15-06-crushing-impact','core-rule-17-03-shooting-at-engaged-monsters-and-vehicles',
 'core-errata-01-02-03','core-errata-08-02-01','faq-no-ranged-weapons-eligible-to-shoot',
 'faq-blast-during-close-quarters-shooting','faq-blast-against-engaged-monster-vehicle',
 'faq-overrun-fight-without-fight-eligibility','faq-embark-after-scout-move',
 'uru-2026-07-22-stratagem-cp-cost','uru-2026-07-22-stratagem-reuse',
 'uru-2026-07-22-defensive-stratagem-range','uru-2026-07-22-identical-destroyed-unit',
 'uru-2026-08-26-disembark-move-types'].map(id=>[id,'BASELINE_OFFICIAL_UNCHANGED']),
 ...['core-active-player','core-attached-unit','core-critical-hit','core-critical-wound','core-engagement-range',
 'core-objective-control','core-wholly-within','core-within','core-bodyguard'].map(id=>[id,'BASELINE_CONCEPT_UNCHANGED']),
 ['core-support','BASELINE_PRESENTATION_EXCEPTION']]);

export function loadHistoricalSourceBaseline(file=historicalSourceFile){
 const bytes=fs.readFileSync(file);
 assert.equal(sha256(bytes),historicalSourceSHA256,'Historical Core baseline fixture integrity failure');
 const source=JSON.parse(bytes);
 assert.equal(source.schema,'core-importer-historical-source-baseline/v1');
 assert.equal(source.baselineHead,'7b15dc36425ac577b6928837ec9983409972e278');
 assert.equal(source.view.records.length,371);
 return source;
}

function historicalDigital(){
 const artifact=loadHistoricalSourceBaseline().artifacts.digital;
 const bytes=Buffer.from(artifact.base64,'base64');
 assert.equal(bytes.length,artifact.bytes);
 assert.equal(sha256(bytes).toUpperCase(),artifact.sha256);
 assert.equal(createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex'),artifact.gitBlob);
 return JSON.parse(bytes);
}

export function loadAcceptedBaseline(){
 const bytes=fs.readFileSync(fixtureFile);
 assert.equal(sha256(bytes),fixtureSHA256,'Changed immutable accepted Core baseline fixture');
 const fixture=JSON.parse(bytes);
 assert.equal(fixture.baselineHead,'7b15dc36425ac577b6928837ec9983409972e278');
 assert.equal(fixture.records.length,277);assert.equal(fixture.canonicalRecords.length,371);
 for(const row of fixture.records){
  assert.equal(digest(row.text),row.normalizedTextSHA256,'Changed baseline semantic evidence '+row.id);
  assert.equal(normalizeCandidateText(row.text).length,row.normalizedCharacters);
  for(const sentence of row.sentences)assert.equal(digest(sentence.text),sentence.normalizedSHA256);
  for(const source of row.sources)assert.equal(digest(source.text),source.normalizedTextSHA256);
 }
 for(const row of fixture.exceptions){
  const record=fixture.records.find(record=>record.id===row.id);
  assert(record&&record.normalizedTextSHA256===row.baselineSemanticSHA256);
  assert.equal(record.acceptedDigitalRecordSHA256,row.baselineDigitalRecordSHA256);
  assert.equal(digest(row.sentence),row.normalizedSentenceSHA256);
  assert(record.sentences.some(sentence=>sentence.normalizedSHA256===row.normalizedSentenceSHA256));
  assert(row.reason&&row.evidence.acceptedBlob&&row.evidence.corpusBlob);
 }
 assert.equal(fixture.exceptions.filter(row=>!row.baselineContained).length,60);
 assert.equal(new Set(fixture.exceptions.filter(row=>!row.baselineContained).map(row=>row.id)).size,11);
 for(const row of fixture.effectiveExceptions){
  const record=fixture.canonicalRecords.find(record=>record.id===row.id);
  assert.equal(record.baselineSemanticSHA256,row.baselineSemanticSHA256);
  assert.equal(record.baselineCanonicalRecordSHA256,row.baselineCanonicalRecordSHA256);
  assert(record.sentences.some(sentence=>sentence.text===row.sentence&&sentence.normalizedSHA256===row.normalizedSentenceSHA256));
 }
 assert.equal(fixture.effectiveExceptions.filter(row=>!row.baselineContained).length,58);
 assert.equal(new Set(fixture.effectiveExceptions.filter(row=>!row.baselineContained).map(row=>row.id)).size,10);
 assert.equal(Object.keys(fixture.protectedRecords).length,27);
 for(const [id,record]of Object.entries(fixture.protectedRecords)){
  const evidence=fixture.canonicalRecords.find(row=>row.id===id);
  assert.equal(sha256(JSON.stringify(record)),evidence.baselineCanonicalRecordSHA256);
 }
 return fixture;
}

export function loadApprovedRedistributions(baseline=loadAcceptedBaseline()){
 const bytes=fs.readFileSync(redistributionFile);
 assert.equal(sha256(bytes),redistributionSHA256,'Changed explicit approved Core redistributions');
 const fixture=JSON.parse(bytes);assert.equal(fixture.baselineHead,baseline.baselineHead);
 for(const row of fixture.records){
  const original=baseline.canonicalRecords.find(record=>record.id===row.id);
  assert.equal(row.baselineSemanticSHA256,original?.baselineSemanticSHA256);
  for(const sentence of row.removedSentences){
   assert.equal(digest(sentence.text),sentence.normalizedSentenceSHA256);
   assert(original.sentences.some(old=>old.text===sentence.text&&old.normalizedSHA256===sentence.normalizedSentenceSHA256));
   assert(sentence.destinationId&&sentence.destinationSourceUnitId);
   assert(sentence.destinationAnchor||Number.isInteger(sentence.destinationSourceOrder),'An unanchored owner needs an exact source order');
  }
 }
 return fixture.records;
}

export function loadApprovedSourceChanges(baseline=loadAcceptedBaseline()){
 const bytes=fs.readFileSync(sourceChangesFile);
 assert.equal(sha256(bytes),sourceChangesSHA256,'Changed explicit source-wording cases');
 const fixture=JSON.parse(bytes);assert.equal(fixture.baselineHead,baseline.baselineHead);
 assert.deepEqual(fixture.records.map(row=>row.id),[
  'core-rule-09-07-01-desperate-escape-test','core-rule-18-07-shock-disembark-move','core-rule-21-02-surge-move']);
 for(const row of fixture.records){
  const old=baseline.canonicalRecords.find(record=>record.id===row.id);
  assert.deepEqual(row.beforeSourceTextSHA256,old.sources.map(source=>source.normalizedTextSHA256).sort());
  for(const source of [...row.beforeSourceBodies,...row.afterSourceBodies])assert.equal(digest(source.text),source.normalizedTextSHA256);
  for(const sentence of row.changedSentences){
   assert.equal(digest(sentence.text),sentence.normalizedSentenceSHA256);
   assert(old.sentences.some(previous=>previous.text===sentence.text));
   assert(row.beforeSourceBodies.some(source=>normalizeCandidateText(source.text).includes(normalizeCandidateText(sentence.text))));
   assert(!row.afterSourceBodies.some(source=>normalizeCandidateText(source.text).includes(normalizeCandidateText(sentence.text))));
  }
 }
 return fixture.records;
}

export function loadRepresentationPermissions(baseline=loadAcceptedBaseline()){
 const bytes=fs.readFileSync(representationsFile);
 assert.equal(sha256(bytes),representationsSHA256,'Changed exact typed comparison representations');
 const fixture=JSON.parse(bytes),accepted=historicalDigital();
 assert.equal(fixture.baselineHead,baseline.baselineHead);assert.equal(fixture.records.length,6);
 for(const row of fixture.records){
  const record=accepted.records[row.baselineRecordIndex],table=record.content[row.blockIndex];
  assert.equal(sha256(JSON.stringify(record)),baseline.records.find(record=>record.id===row.id).acceptedDigitalRecordSHA256);
  assert.equal(sha256(JSON.stringify(table)),row.baselineTypedBlockSHA256);
  assert.deepEqual(table,fixture.acceptedTypedBlock);
  assert.equal(row.column,table.columns[row.columnIndex]);
  assert.equal(row.cell,table.rows[row.rowIndex].cells[row.columnIndex]);
  assert.equal(row.rowLabel,table.rows[row.rowIndex].label);
  assert.equal(row.sentence,row.column+': '+row.cell);
 }
 return fixture.records;
}

function loadAuthoredFAQIdentities(baseline){
 const bytes=fs.readFileSync(faqIdentitiesFile);
 assert.equal(sha256(bytes),faqIdentitiesSHA256,'Changed authored FAQ identities');
 const fixture=JSON.parse(bytes);assert.equal(fixture.records.length,73);
 assert.equal(new Set(fixture.records.map(row=>row.id)).size,73);
 assert.equal(fixture.records.filter(row=>row.baselineIdentity).length,66);
 for(const row of fixture.records.filter(row=>row.baselineIdentity)){
  const old=baseline.canonicalRecords.find(record=>record.id===row.id);
  assert.equal(normalizeCandidateText(row.question),normalizeCandidateText(old?.question));
 }
 return fixture.records;
}

function loadExceptionFacts(baseline){
 const bytes=fs.readFileSync(exceptionFactsFile);
 assert.equal(sha256(bytes),exceptionFactsSHA256,'Changed current-fact conditions for baseline representations');
 const fixture=JSON.parse(bytes);assert.equal(fixture.records.length,58);
 const result=new Map();
 for(const row of fixture.records){
  const accepted=baseline.effectiveExceptions.find(exception=>exception.id===row.id&&exception.normalizedSentenceSHA256===row.normalizedSentenceSHA256);
  assert(accepted&&!accepted.baselineContained);
  assert.equal(row.baselineCanonicalRecordSHA256,accepted.baselineCanonicalRecordSHA256);
  assert.equal(row.baselineSentence,accepted.sentence);
  assert(row.requiredTableRows.length||row.currentTextWitnesses.length,'A baseline exception needs a current fact witness');
  if(row.acceptedTypedBlocks){
    const digital=historicalDigital();
   const record=digital.records.find(record=>record.code==='05.02');
   assert.equal(sha256(JSON.stringify(record)),baseline.records.find(record=>record.code==='05.02').acceptedDigitalRecordSHA256);
   assert.deepEqual(row.acceptedTypedBlocks.list,record.content.find(block=>block.type==='list'));
   assert.deepEqual(row.acceptedTypedBlocks.matrix,record.content.find(block=>block.type==='matrix'));
  }
  result.set(row.id+'#'+row.normalizedSentenceSHA256,row);
 }
 return result;
}

function unchangedCurrentFacts(rule,sources){
 if(!rule)return false;
 return sources.some(source=>{
  const rows=(source.tables||[]).map(row=>row.filter(Boolean).map(normalizeCandidateText));
  const tableMatches=rule.requiredTableRows.every(expected=>rows.some(actual=>same(actual,expected.map(normalizeCandidateText))));
  const textMatches=!rule.currentTextWitnesses.length||rule.currentTextWitnesses.some(text=>normalizeCandidateText(source.text).includes(normalizeCandidateText(text)));
  return tableMatches&&textMatches;
 });
}

export function auditExplicitOwnerBoundaries({candidate,corpus,baseline=loadAcceptedBaseline()}){
 const bytes=fs.readFileSync(ownerBoundariesFile);
 assert.equal(sha256(bytes),ownerBoundariesSHA256,'Changed explicit repeated-code owner boundaries');
 const fixture=JSON.parse(bytes),units=sourceIndex(corpus),failures=[],rows=[];
 assert.equal(fixture.baselineHead,baseline.baselineHead);
 for(const policy of fixture.records){
  const record=candidate.records.find(record=>record.id===policy.id);
  const locator=record?.sourceLocators?.find(locator=>locator.sourceUnitId===policy.sourceUnitId&&locator.anchor===policy.anchor);
  const unit=units.get(policy.sourceUnitId),occurrence=locator&&unit?.occurrences.find(row=>row.stableDomId===policy.anchor&&row.sourceOrder===locator.sourceOrder&&row.content.contentHash===locator.sourceContentHash);
  if(!occurrence){failures.push({code:'MISSING_EXPLICIT_SOURCE_OWNER',id:policy.id});continue;}
  if(typeof occurrence.ownedHtml!=='string'||!occurrence.ownedHtml){failures.push({code:'MISSING_BOUNDED_SOURCE_FRAGMENT',id:policy.id});continue;}
  for(const anchor of policy.forbiddenOwnerAnchors){
   const escaped=anchor.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
   if(new RegExp('\\bid\\s*=\\s*["\']'+escaped+'["\']','i').test(occurrence.ownedHtml))
    failures.push({code:'SOURCE_SCOPE_CONTAINS_FOREIGN_OWNER',id:policy.id,foreignAnchor:anchor});
  }
  for(const foreign of policy.forbiddenSourceSentences){
   const original=baseline.canonicalRecords.find(record=>record.id===foreign.id);
   assert(original.sentences.some(sentence=>sentence.normalizedSHA256===foreign.normalizedSHA256));
   if(normalizeCandidateText(occurrence.content.text).includes(normalizeCandidateText(foreign.text)))
    failures.push({code:'SOURCE_SCOPE_CONTAINS_FOREIGN_OWNER_SENTENCE',id:policy.id,foreignId:foreign.id,sentence:foreign.text});
  }
  rows.push({id:policy.id,sourceUnitId:policy.sourceUnitId,anchor:policy.anchor,
   sourceOrder:occurrence.sourceOrder,sourceContentHash:occurrence.content.contentHash,
   sourceCharacters:normalizeCandidateText(occurrence.content.text).length});
 }
 return {status:failures.length?'FAIL':'PASS',failures,rows};
}

function sourceIndex(corpus){
 const entries=[];
 for(const page of corpus.pages||[])for(const partition of ['numbered','faqs','errata','universalRulesUpdates'])
  for(const unit of page[partition]||[])entries.push({...unit,pageID:page.id||unit.page,partition});
 assert.equal(new Set(entries.map(unit=>unit.id)).size,entries.length,'Duplicate candidate corpus unit identity');
 return new Map(entries.map(unit=>[unit.id,unit]));
}
function boundSources(record,units){
 const sources=[];
 for(const id of record.sourceUnitIds||[]){
  const unit=units.get(id);if(!unit)continue;
  const locators=(record.sourceLocators||[]).filter(locator=>!locator.sourceUnitId||locator.sourceUnitId===id);
  const occurrences=unit.occurrences?.length?unit.occurrences:[{stableDomId:unit.anchor||unit.stableDomId,
   sourceOrder:unit.sourceOrder,headingHierarchy:unit.headingHierarchy,content:unit.content}];
  for(const occurrence of occurrences){
   if(locators.length&&!locators.some(locator=>(!locator.anchor||locator.anchor===occurrence.stableDomId)&&
    (locator.sourceOrder===undefined||locator.sourceOrder===occurrence.sourceOrder)&&
    (!locator.sourceContentHash||locator.sourceContentHash===occurrence.content?.contentHash||locator.sourceContentHash===unit.contentHash)))continue;
   if(typeof occurrence.content?.text!=='string')continue;
   sources.push({sourceUnitId:id,anchor:occurrence.stableDomId||null,text:occurrence.content.text,
    tables:occurrence.content.tables||[],
    normalizedTextSHA256:digest(occurrence.content.text),hierarchy:occurrence.headingHierarchy||unit.headingHierarchy||[],
    sourceOrder:occurrence.sourceOrder,sourceContentHash:occurrence.content.contentHash,sourceUnitContentHash:unit.contentHash,
    ownerCode:unit.ownerCode||unit.code||null});
  }
 }
 return sources;
}

function locatorFailures(record,units,captureDate){
 const errors=[];
 if(!record.sourceLocators?.length)return ['MISSING_SOURCE_LOCATORS'];
 for(const locator of record.sourceLocators){
  const unit=units.get(locator.sourceUnitId);
  if(!unit||!record.sourceUnitIds.includes(locator.sourceUnitId)){errors.push('FOREIGN_SOURCE_LOCATOR');continue;}
  const occurrences=unit.occurrences?.length?unit.occurrences:[{stableDomId:unit.stableDomId,
   sourceOrder:unit.sourceOrder,content:unit.content}];
  const occurrence=occurrences.find(row=>row.sourceOrder===locator.sourceOrder&&
   (!locator.anchor||locator.anchor===row.stableDomId));
  const expectedHash=unit.occurrences?.length?occurrence?.content?.contentHash:unit.contentHash;
  if(!occurrence||locator.sourceContentHash!==expectedHash||locator.sourceUnitContentHash!==unit.contentHash)
   errors.push('STALE_SOURCE_LOCATOR');
  if(locator.snapshotDate!==captureDate||locator.page!==unit.page||locator.url!==unit.pageUrl)
   errors.push('CHANGED_CAPTURE_LOCATOR');
 }
 return errors;
}

function ownerFailures(record,units,old){
 const errors=[];
 for(const id of record.sourceUnitIds||[]){
  const unit=units.get(id);if(!unit)continue;
  if(unit.kind==='NUMBERED_RULE'&&unit.code!==(record.internalLocator||record.code))errors.push('OWN_SOURCE_RULE_CODE_MISMATCH');
  if(['FAQ','ERRATUM'].includes(unit.kind)&&unit.ownerCode!==record.code)errors.push('OWN_SOURCE_CONTEXT_MISMATCH');
  if(unit.kind==='UNIVERSAL_RULE_UPDATE'&&old&&!same(record.sourceUnitIds,old.sourceUnitIds))errors.push('CHANGED_AUTHORED_UNIVERSAL_SOURCE_OWNER');
 }
 const explicitAnchor=old?.sourceProvenance?.sourceNode?.anchor;
 if(explicitAnchor&&!record.sourceLocators.some(locator=>locator.anchor===explicitAnchor))errors.push('CHANGED_EXPLICIT_SOURCE_NODE_IDENTITY');
 return errors;
}

/** Exact ID/sentence exceptions; never a record-wide or fingerprint exemption. */
export function auditCoreCandidate({candidate,corpus,baseline=loadAcceptedBaseline(),redistributions=[],sourceChanges=[]}){
 const failures=[],rows=[],usedExceptions=[],shorteningEvidence=[],sourceChangeEvidence=[],missingSentences=[];
 const fail=(code,record,detail={})=>failures.push({code,id:record?.id||null,...detail});
 const units=sourceIndex(corpus),oldCanonical=new Map(baseline.canonicalRecords.map(record=>[record.id,record])),records=new Map();
 const explicitOwners=auditExplicitOwnerBoundaries({candidate,corpus,baseline});
 failures.push(...explicitOwners.failures);
 const exceptions=new Map(baseline.effectiveExceptions.map(row=>[row.id+'#'+row.normalizedSentenceSHA256,row]));
 const factRules=loadExceptionFacts(baseline);
 for(const row of loadRepresentationPermissions(baseline))exceptions.set(row.id+'#'+digest(row.sentence),{
  ...row,currentFactKey:row.id+'#'+digest(row.cell)});
 for(const record of candidate.records||[]){if(records.has(record.id))fail('DUPLICATE_CANONICAL_ID',record);records.set(record.id,record);}
 const authoredChanges=new Map(loadApprovedSourceChanges(baseline).map(row=>[row.id,row])),verifiedChangedSentences=new Map();
 for(const row of sourceChanges){
  const record=records.get(row.id),authored=authoredChanges.get(row.id),old=oldCanonical.get(row.id);
  if(!authored||!same(row,authored)){fail('UNAPPROVED_SOURCE_CHANGE_CASE',record||{id:row.id});continue;}
  const sources=record?boundSources(record,units):[],before=old.sources.map(source=>source.normalizedTextSHA256).sort(),after=sources.map(source=>source.normalizedTextSHA256).sort();
  if(!same(before,row.beforeSourceTextSHA256)||!same(after,row.afterSourceTextSHA256)||same(before,after)){
   fail('INVALID_SOURCE_CHANGE_SHORTENING_PROOF',record||{id:row.id});continue;
  }
  verifiedChangedSentences.set(row.id,new Set(row.changedSentences.map(sentence=>sentence.normalizedSentenceSHA256)));
  sourceChangeEvidence.push({id:row.id,reason:row.reason,beforeSourceBodies:row.beforeSourceBodies,
   afterSourceBodies:sources,changedSentences:row.changedSentences});
 }
 for(const id of oldCanonical.keys())if(!records.has(id))fail('MISSING_BASELINE_ID',{id});
 for(const id of newIDs)if(!records.has(id))fail('MISSING_REQUIRED_NEW_ID',{id});
 const allowedIDs=new Set([...oldCanonical.keys(),...newIDs]);
 for(const record of records.values())if(!allowedIDs.has(record.id))fail('UNREVIEWED_CANONICAL_ID',record);
 if(records.size!==385)fail('UNEXPECTED_CANONICAL_COUNT',null,{expected:385,actual:records.size});
 for(const identity of loadAuthoredFAQIdentities(baseline)){
  const record=records.get(identity.id);
  if(!record||normalizeCandidateText(record.question)!==normalizeCandidateText(identity.question)||
   record.code!==identity.ownerCode||!same(record.sourceUnitIds,[identity.sourceId]))
   fail('CHANGED_AUTHORED_FAQ_IDENTITY',record||{id:identity.id});
 }
 for(const record of records.values()){
  const old=oldCanonical.get(record.id),sources=boundSources(record,units);
  if(typeof record.text!=='string'){fail('INVALID_CANDIDATE_BODY',record);continue;}
  if(old&&old.recordType!==record.recordType)fail('CHANGED_BASELINE_RECORD_TYPE',record,{before:old.recordType,after:record.recordType});
  const protectedOrigin=protectedOrigins.get(record.id);
  if(protectedOrigin){
   if(record.origin!==protectedOrigin)fail('CHANGED_PROTECTED_ORIGIN',record,{expected:protectedOrigin,actual:record.origin});
   const text=old?.text;
   if(record.text!==text)fail('CHANGED_PROTECTED_BASELINE_TEXT',record);
   if(!same(record.sourceUnitIds||[],old?.sourceUnitIds||[]))fail('CHANGED_PROTECTED_BASELINE_BINDING',record);
   if(!same(record.provenance,old?.sourceProvenance))fail('CHANGED_PROTECTED_BASELINE_PROVENANCE',record);
   for(const [key,value]of Object.entries(baseline.protectedRecords[record.id]||{})){
    const expected=key==='text'?old?.text:value;
    if(!same(record[key],expected))fail('CHANGED_PROTECTED_BASELINE_FIELD',record,{field:key});
   }
   rows.push({id:record.id,status:'PROTECTED_EXACT_BASELINE',origin:record.origin});continue;
  }
  if(record.origin!=='CAPTURED_WAHAPEDIA')fail('UNREVIEWED_ORIGIN',record,{origin:record.origin});
  for(const code of locatorFailures(record,units,candidate.captureDate))fail(code,record);
  for(const code of ownerFailures(record,units,old))fail(code,record);
  if(!sources.length){fail('MISSING_BOUND_SOURCE',record);continue;}
  const normalized=normalizeCandidateText(record.text),sentences=candidateSentences(record.text);
  if(!normalized&&old?.text)fail('EMPTY_CANDIDATE_BODY',record);
  let missing=0;
  for(const sentence of sentences){
   if(sources.some(source=>normalizeCandidateText(source.text).includes(normalizeCandidateText(sentence))))continue;
   const key=record.id+'#'+digest(sentence),exception=exceptions.get(key);
   const eligible=exception&&unchangedCurrentFacts(factRules.get(exception.currentFactKey||key),sources);
   missingSentences.push({id:record.id,sentenceSHA256:digest(sentence),sentence,
    disposition:eligible?'EXACT_BASELINE_REPRESENTATION':exception?'BASELINE_REPRESENTATION_SOURCE_CHANGED':'NEW_UNSUPPORTED_SENTENCE',
    reason:exception?.reason||null});
   if(eligible){usedExceptions.push({id:record.id,sentenceSHA256:digest(sentence),reason:exception.reason});continue;}
   missing++;fail('SENTENCE_OUTSIDE_BOUND_SOURCE',record,{sentence,normalizedSentenceSHA256:digest(sentence),boundSources:sources.map(source=>({sourceUnitId:source.sourceUnitId,anchor:source.anchor}))});
  }
  rows.push({id:record.id,status:missing?'FAIL':'PASS',sentences:sentences.length,boundSources:sources.map(source=>({sourceUnitId:source.sourceUnitId,anchor:source.anchor,normalizedTextSHA256:source.normalizedTextSHA256}))});
  const oldText=old?.text;
  if(typeof oldText!=='string'||normalized.length>=normalizeCandidateText(oldText).length)continue;
  const redistribution=redistributions.find(row=>row.id===record.id),sourceChange=sourceChanges.find(row=>row.id===record.id);
  if(redistribution){
   if(!sources.some(source=>source.sourceUnitId===redistribution.sourceUnitId&&source.anchor===redistribution.sourceAnchor&&source.hierarchy.some(h=>h.id===redistribution.sectionAnchor)))fail('REDISTRIBUTION_SOURCE_HIERARCHY_MISMATCH',record);
   const oldSentences=old?.sentences||candidateSentences(oldText).map(text=>({text,normalizedSHA256:digest(text)}));
   const removed=oldSentences.filter(sentence=>!normalized.includes(normalizeCandidateText(sentence.text)));
   const declared=new Map(redistribution.removedSentences.map(sentence=>[sentence.normalizedSentenceSHA256,sentence]));
   for(const sentence of removed){
    const declaration=declared.get(sentence.normalizedSHA256),destination=declaration&&records.get(declaration.destinationId);
    if(!declaration||declaration.text!==sentence.text||!destination){fail('UNAPPROVED_REMOVED_SENTENCE',record,{sentence:sentence.text});continue;}
    const destinationSources=boundSources(destination,units),token=normalizeCandidateText(sentence.text);
    if(!normalizeCandidateText(destination.text).includes(token))fail('REDISTRIBUTED_TEXT_LOST',record,{sentence:sentence.text,destinationId:destination.id});
    if(!destinationSources.some(source=>source.sourceUnitId===declaration.destinationSourceUnitId&&source.anchor===declaration.destinationAnchor&&
     (declaration.destinationSourceOrder===undefined||source.sourceOrder===declaration.destinationSourceOrder)&&
     normalizeCandidateText(source.text).includes(token)&&source.hierarchy.some(h=>h.id===redistribution.sectionAnchor)))fail('REDISTRIBUTION_WRONG_SOURCE_OWNER',record,{sentence:sentence.text,destinationId:destination.id,sectionAnchor:redistribution.sectionAnchor});
   }
   const affected=[record.id,...new Set(redistribution.removedSentences.map(sentence=>sentence.destinationId))],union=affected.map(id=>normalizeCandidateText(records.get(id)?.text||''));
   for(const id of affected){const previous=oldCanonical.get(id);if(!previous)continue;for(const sentence of previous.sentences)if(!union.some(text=>text.includes(normalizeCandidateText(sentence.text)))&&!verifiedChangedSentences.get(id)?.has(sentence.normalizedSHA256))fail('AFFECTED_UNION_LOST_BASELINE_SENTENCE',{id},{sentence:sentence.text,affected});}
   shorteningEvidence.push({id:record.id,kind:'EXPLICIT_REDISTRIBUTION',before:normalizeCandidateText(oldText).length,after:normalized.length,removed:removed.map(sentence=>sentence.normalizedSHA256),affected,sectionAnchor:redistribution.sectionAnchor});
  }else if(sourceChange&&verifiedChangedSentences.has(record.id)){
   const previousSources=old?.sources||[];
   const oldHashes=previousSources.map(source=>source.normalizedTextSHA256).sort(),newHashes=sources.map(source=>source.normalizedTextSHA256).sort();
   if(sourceChange.kind!=='ACTUAL_SOURCE_TEXT_CHANGED'||!same(oldHashes,sourceChange.beforeSourceTextSHA256)||!same(newHashes,sourceChange.afterSourceTextSHA256)||same(oldHashes,newHashes)||!sourceChange.reason)fail('INVALID_SOURCE_CHANGE_SHORTENING_PROOF',record);
   else{
    for(const sentence of old.sentences)if(!normalized.includes(normalizeCandidateText(sentence.text))&&!verifiedChangedSentences.get(record.id).has(sentence.normalizedSHA256))fail('SOURCE_CHANGE_LOST_UNCHANGED_SENTENCE',record,{sentence:sentence.text});
    shorteningEvidence.push({id:record.id,kind:sourceChange.kind,reason:sourceChange.reason,before:normalizeCandidateText(oldText).length,after:normalized.length,beforeSources:previousSources,afterSources:sources});
   }
  }else fail('SHORTENED_BASELINE_WITHOUT_SOURCE_CHANGE',record,{before:normalizeCandidateText(oldText).length,after:normalized.length});
 }
 const baselineFailSet=baseline.effectiveExceptions.filter(row=>!row.baselineContained).map(row=>({id:row.id,sentenceSHA256:row.normalizedSentenceSHA256,reason:row.reason}));
 const baselineFailIDs=new Set(baselineFailSet.map(row=>row.id));
 const ratchet={baselineFailedRecords:baselineFailIDs.size,baselineMissingSentences:baselineFailSet.length,
  baselineFailSet,exactTypedTransformPermissions:loadRepresentationPermissions(baseline).map(row=>({id:row.id,sentenceSHA256:digest(row.sentence),reason:row.reason})),
  candidateMissingSentenceSet:missingSentences,
  candidateFailedRecordSubsetOfBaseline:missingSentences.every(row=>baselineFailIDs.has(row.id)),
  candidateSentenceSubsetOfExactPermissions:missingSentences.every(row=>exceptions.has(row.id+'#'+row.sentenceSHA256)),
  everyReusedExceptionHasUnchangedCurrentFacts:missingSentences.every(row=>row.disposition==='EXACT_BASELINE_REPRESENTATION')};
 if(!ratchet.candidateFailedRecordSubsetOfBaseline||!ratchet.candidateSentenceSubsetOfExactPermissions||!ratchet.everyReusedExceptionHasUnchangedCurrentFacts)
  fail('BASELINE_FAILURE_RATCHET_VIOLATION',null);
 return {status:failures.length?'FAIL':'PASS',canonicalRecords:records.size,baselineIDs:oldCanonical.size,
  failures,rows,acceptedExceptionSentences:usedExceptions,shorteningEvidence,sourceChangeEvidence,ratchet,explicitOwners};
}

export function assertDeterministicArtifacts(first,second){
 for(const file of artifactNames)assert(fs.readFileSync(path.join(first,file)).equals(fs.readFileSync(path.join(second,file))),
  'Non-deterministic candidate artifact: '+file);
 return artifactNames.map(file=>({file,sha256:sha256(fs.readFileSync(path.join(first,file)))}));
}

export function auditRawCoreCandidate({candidate,corpus,baseline=loadAcceptedBaseline()}){
 const units=sourceIndex(corpus),canonical=new Set(candidate.records.map(record=>record.id)),failures=[];
 assert(Array.isArray(candidate.rawRecords)&&candidate.rawRecords.length,'Missing raw source-owner records');
 const rawIDs=new Set(),expectedRaw=[...canonical].filter(id=>{
  const protectedRecord=baseline.protectedRecords[id];
  return !protectedRecord||(protectedRecord.recordType!=='CORE_CONCEPT'&&protectedRecord.sourceUnitIds?.length);
 });
 for(const record of candidate.rawRecords){
  if(rawIDs.has(record.id))failures.push({code:'DUPLICATE_RAW_CANONICAL_ID',id:record.id});
  rawIDs.add(record.id);
 }
 for(const id of expectedRaw)if(!rawIDs.has(id))failures.push({code:'MISSING_RAW_SOURCE_VARIANT',id});
 for(const id of rawIDs)if(!expectedRaw.includes(id))failures.push({code:'UNREVIEWED_RAW_SOURCE_VARIANT',id});
 for(const record of candidate.rawRecords){
  if(!canonical.has(record.id))failures.push({code:'UNBOUND_RAW_CANONICAL_ID',id:record.id});
  const sources=boundSources(record,units);
  for(const code of locatorFailures(record,units,candidate.captureDate))failures.push({code,id:record.id});
  for(const code of ownerFailures(record,units,baseline.canonicalRecords.find(row=>row.id===record.id)))failures.push({code,id:record.id});
  if(!sources.length){failures.push({code:'MISSING_RAW_BOUND_SOURCE',id:record.id});continue;}
  for(const sentence of candidateSentences(record.text))if(!sources.some(source=>normalizeCandidateText(source.text).includes(normalizeCandidateText(sentence))))
   failures.push({code:'RAW_SENTENCE_OUTSIDE_BOUND_SOURCE',id:record.id,sentence});
 }
 return {status:failures.length?'FAIL':'PASS',records:candidate.rawRecords.length,failures};
}

function main(){
 const started=Date.now();
 const option=name=>process.argv.slice(2).find(value=>value.startsWith(name+'='))?.slice(name.length+1);
 for(const arg of process.argv.slice(2))assert(arg.startsWith('--out='),'Unknown candidate QA option: '+arg);
 const baseline=loadAcceptedBaseline(),redistributions=loadApprovedRedistributions(baseline),sourceChanges=loadApprovedSourceChanges(baseline);
 const temp=createQaTempDir('core-importer-candidate-qa-');
 const python=resolveQaPython(),env={...qaTempEnvironment(),PYTHONDONTWRITEBYTECODE:'1'};
 const producer=path.join(repoRoot,'books/core-rules/tools/build_core_candidate.py');
 const runs=[path.join(temp,'first'),path.join(temp,'second')];
 const report={schema:'core-importer-candidate-qa/v1',baselineHead:baseline.baselineHead,
  commands:[],negativeControls:[],status:'RUNNING'};
 const execute=(file,args)=>{
  const command={runtime:python,file,args},began=Date.now();report.commands.push(command);
  try{
   command.stdout=execFileSync(python,[file,...args],{cwd:repoRoot,env,encoding:'utf8',maxBuffer:16*1024*1024});
   return command.stdout;
  }catch(error){command.stderr=String(error.stderr||'');throw error;}
  finally{command.elapsedMs=Date.now()-began;}
 };
 try{
  for(const dir of runs)execute(producer,['--write','--with-corpus','--out='+dir]);
  report.deterministicArtifacts=assertDeterministicArtifacts(...runs);
  execute(producer,['--check','--with-corpus','--out='+runs[0]]);
  const candidate=JSON.parse(fs.readFileSync(path.join(runs[0],'core-rules.candidate.v1.json')));
  const corpus=JSON.parse(fs.readFileSync(path.join(runs[0],'waha-core-corpus.v1.json')));
  assert.equal(candidate.schema,'core-rules-candidate/v1');
  assert.equal(candidate.status,'CANDIDATE_ONLY_NOT_ACTIVE');
  assert.equal(candidate.baselineHead,baseline.baselineHead);
  const audit=value=>auditCoreCandidate({candidate:value,corpus,baseline,redistributions,sourceChanges});
  report.canonical=audit(candidate);report.raw=auditRawCoreCandidate({candidate,corpus});
  assert.equal(report.canonical.status,'PASS','Candidate boundary/identity/shortening failure: '+JSON.stringify(report.canonical.failures));
  assert.equal(report.raw.status,'PASS','Raw candidate owner-boundary failure: '+JSON.stringify(report.raw.failures));
  function expectedFailure(name,result,expected){
   assert(result.failures.some(expected),'Negative control was not detected: '+name+' '+JSON.stringify(result.failures));
   report.negativeControls.push({name,status:'PASS',failures:result.failures});
  }
  function control(name,mutate,expected){
   const changed=structuredClone(candidate);mutate(changed);
   expectedFailure(name,audit(changed),expected);
  }
  control('drop-old-canonical-id',value=>{value.records=value.records.filter(record=>record.id!=='core-rule-01-01-armies');},
   row=>row.code==='MISSING_BASELINE_ID'&&row.id==='core-rule-01-01-armies');
  control('foreign-sentence-on-excepted-record',value=>{
   value.records.find(record=>record.id==='core-rule-01-02-01-starting-strength-and-half-strength').text+='\nA synthetic unrelated comet repairs every vehicle to seventeen wounds.';
  },row=>row.code==='SENTENCE_OUTSIDE_BOUND_SOURCE'&&row.sentence.includes('synthetic unrelated comet'));
  control('shortened-13-05-tooltip-shadow',value=>{
   value.records.find(record=>record.id==='core-rule-13-05-dense').text='Dense terrain is an obstacle to even the largest war machines, and can shelter entire squads from enemy sight.';
  },row=>row.code==='SHORTENED_BASELINE_WITHOUT_SOURCE_CHANGE'&&row.id==='core-rule-13-05-dense');
  control('protected-support-foreign-sentence',value=>{
   value.records.find(record=>record.id==='core-support').text+='\nA synthetic unrelated comet repairs every vehicle to seventeen wounds.';
  },row=>row.code==='CHANGED_PROTECTED_BASELINE_TEXT'&&row.id==='core-support');
  control('protected-official-baseline-field',value=>{
   value.records.find(record=>record.id==='core-errata-01-02-03').semanticContent='Synthetic changed official rule.';
  },row=>row.code==='CHANGED_PROTECTED_BASELINE_FIELD'&&row.id==='core-errata-01-02-03');
  control('authored-faq-identity-not-array-position',value=>{
   const first=value.records.find(record=>record.id==='core-faq-waha-001'),second=value.records.find(record=>record.id==='core-faq-waha-002');
   [first.id,second.id]=[second.id,first.id];
  },row=>row.code==='CHANGED_AUTHORED_FAQ_IDENTITY');
  control('stale-source-locator',value=>{
   value.records.find(record=>record.id==='core-rule-20-03-01-set-up-as-reinforcements').sourceLocators[0].sourceContentHash='invented';
  },row=>row.code==='STALE_SOURCE_LOCATOR');
  control('another-bound-unit-is-not-the-owner',value=>{
   const target=value.records.find(record=>record.id==='core-rule-13-05-dense');
   const foreign=value.rawRecords.find(record=>record.recordType==='MAIN_RULE'&&record.code==='13.04');
   assert(foreign);
   Object.assign(target,{text:foreign.text,sourceUnitIds:structuredClone(foreign.sourceUnitIds),
    sourceLocators:structuredClone(foreign.sourceLocators)});
  },row=>row.code==='OWN_SOURCE_RULE_CODE_MISMATCH'&&row.id==='core-rule-13-05-dense');
  control('lost-approved-relocated-sentence',value=>{
   const target=value.records.find(record=>record.id==='core-rule-21-03-flying-models');
   const sentence='It makes an advance move with a maximum distance of 16".';
   assert(target.text.includes(sentence),'Missing authored relocation mutation witness');
   target.text=target.text.replace(sentence,'');
  },row=>row.code==='REDISTRIBUTED_TEXT_LOST'&&row.id==='core-rule-21-01-surge-moves');
  control('wrong-core-leader-physical-occurrence-160',value=>{
   const target=value.records.find(record=>record.id==='core-leader'),unit=sourceIndex(corpus).get('waha-core-rule-24-22');
   const later=unit.occurrences.find(occurrence=>occurrence.sourceOrder===160);
   assert(later&&!later.headingHierarchy.some(heading=>heading.id==='Attached-Units'));
   Object.assign(target.sourceLocators[0],{sourceOrder:160,anchor:later.stableDomId,
    sourceContentHash:later.content.contentHash,hierarchy:later.headingHierarchy});
  },row=>row.code==='REDISTRIBUTION_WRONG_SOURCE_OWNER'&&row.id==='core-rule-19-01-forming-attached-units');
  const rawPoison=structuredClone(candidate);
  rawPoison.rawRecords.find(record=>record.id==='core-rule-01-02-01-starting-strength-and-half-strength').text+='\nA synthetic unrelated comet repairs every vehicle to seventeen wounds.';
  expectedFailure('foreign-raw-sentence-no-baseline-exemptions',auditRawCoreCandidate({candidate:rawPoison,corpus,baseline}),
   row=>row.code==='RAW_SENTENCE_OUTSIDE_BOUND_SOURCE');
  const unknown=structuredClone(candidate);
  unknown.records.find(record=>record.id==='core-rule-13-05-dense').text='Dense terrain is an obstacle to even the largest war machines, and can shelter entire squads from enemy sight.';
  expectedFailure('unknown-rule-cannot-claim-source-change',auditCoreCandidate({candidate:unknown,corpus,baseline,redistributions,
   sourceChanges:[...sourceChanges,{...sourceChanges[0],id:'core-rule-13-05-dense'}]}),
   row=>row.code==='UNAPPROVED_SOURCE_CHANGE_CASE'&&row.id==='core-rule-13-05-dense');
  const changedSource=structuredClone(corpus),changedUnit=sourceIndex(changedSource).get('waha-appendix-rule-19-04-01');
  const oldWording='that attached unit does not continue to benefit from them';
  assert(changedUnit.occurrences[0].content.text.includes(oldWording));
  // Keep trusted locator hashes in this synthetic control: the sentence guard
  // must independently reject removed source wording even on an excepted ID.
  changedUnit.occurrences[0].content.text=changedUnit.occurrences[0].content.text.replace(oldWording,'that attached unit continues to benefit from them');
  expectedFailure('baseline-exception-cannot-mask-removed-current-source-fact',auditCoreCandidate({candidate,corpus:changedSource,baseline,redistributions,sourceChanges}),
   row=>row.code==='SENTENCE_OUTSIDE_BOUND_SOURCE'&&row.id==='core-rule-19-04-01-only-in-death-does-duty-end');
  const changedTable=structuredClone(corpus),woundSource=sourceIndex(changedTable).get('waha-core-rule-05-02');
  const twice=woundSource.occurrences[0].content.tables.find(row=>row.length===2&&row[0].startsWith('Strength is TWICE'));
  assert(twice&&normalizeCandidateText(twice[1])==='2+');twice[1]='9 +';
  expectedFailure('baseline-table-exception-cannot-mask-changed-result',auditCoreCandidate({candidate,corpus:changedTable,baseline,redistributions,sourceChanges}),
   row=>row.code==='SENTENCE_OUTSIDE_BOUND_SOURCE'&&row.id==='core-rule-05-02-wound-rolls');
  const repeatedUnits=sourceIndex(corpus),force=candidate.records.find(record=>record.id==='core-rule-09-07-01-desperate-escape'),
   test=candidate.records.find(record=>record.id==='core-rule-09-07-01-desperate-escape-test');
  const forceSources=boundSources(force,repeatedUnits),testSources=boundSources(test,repeatedUnits);
  const foreignTestSentence=candidateSentences(testSources[0].text).find(sentence=>normalizeCandidateText(sentence).length>60&&
   !forceSources.some(source=>normalizeCandidateText(source.text).includes(normalizeCandidateText(sentence))));
  assert(foreignTestSentence,'No distinct same-code owner mutation witness');
  control('same-code-foreign-owner-sentence',value=>{
   value.records.find(record=>record.id===force.id).text+='\n'+foreignTestSentence;
  },row=>row.code==='SENTENCE_OUTSIDE_BOUND_SOURCE'&&row.id===force.id);
  const poisonedScopes=structuredClone(corpus),poisonedCandidate=structuredClone(candidate),
   forceOccurrence=sourceIndex(poisonedScopes).get('waha-core-rule-09-07-01').occurrences.find(occurrence=>occurrence.stableDomId==='Desperate-Escape');
  forceOccurrence.ownedHtml+='<h4 id="Desperate-Escape-Test">Foreign same-code owner</h4>';
  forceOccurrence.content.text+=' '+foreignTestSentence;
  poisonedCandidate.records.find(record=>record.id===force.id).text+='\n'+foreignTestSentence;
  expectedFailure('same-code-source-and-candidate-overcapture',auditCoreCandidate({candidate:poisonedCandidate,corpus:poisonedScopes,baseline,redistributions,sourceChanges}),
   row=>row.code==='SOURCE_SCOPE_CONTAINS_FOREIGN_OWNER'&&row.id===force.id);
  const legacyFile=path.join(temp,'legacy-digital.json');
  execute(path.join(repoRoot,'books/core-rules/tools/import_wahapedia_11e.py'),[
   path.join(repoRoot,'books/core-rules/sources/waha-core-2026-11-11/core-rules.html'),legacyFile]);
  const legacy=JSON.parse(fs.readFileSync(legacyFile));
  const baseRecord=legacy.records.find(record=>record.code==='20.03.01');
  assert.equal(baseRecord?.text,baseline.canonicalRecords.find(record=>record.id==='core-rule-20-03-01-set-up-as-reinforcements').text,
   'The unchanged accepted base CLI is not the historical warehouse regression');
  report.unchangedBaseCli={code:'20.03.01',characters:baseRecord.text.length,correctBaselineBody:true};
  const historicalBytes=fs.readFileSync(historicalBoundaryFile);
  assert.equal(sha256(historicalBytes),historicalBoundarySHA256,'Changed authenticated historical boundary fixture');
  const historical=JSON.parse(historicalBytes),replayFile=path.join(temp,'warehouse-boundary-replay.json');
  assert.equal(sha256(historical.headingRecordSource),historical.provenance.functionSHA256);
  const replay=`import hashlib, importlib.util, json, sys
from pathlib import Path
from lxml import html
fixture=json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
root=Path(sys.argv[2])
formatter=root/fixture['baselineFormatter']['file']
assert hashlib.sha256(formatter.read_bytes().replace(b'\\r\\n',b'\\n')).hexdigest()==fixture['baselineFormatter']['sha256']
spec=importlib.util.spec_from_file_location('accepted_baseline_formatter',formatter)
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
namespace=dict(vars(module))
namespace.update(fixture['globals'])
exec(fixture['headingRecordSource'],namespace)
raw=(root/fixture['rawInput']['file']).read_bytes()
assert hashlib.sha256(raw).hexdigest()==fixture['rawInput']['sha256']
document=html.fromstring(raw,parser=html.HTMLParser(encoding='utf-8'))
headings=document.xpath('//*[@id=$anchor]',anchor=fixture['heading']['anchor'])
assert len(headings)==1 and headings[0].tag==fixture['heading']['tag']
record=namespace['heading_record'](headings[0])
assert record['code']==fixture['heading']['code']
Path(sys.argv[3]).write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\\n',encoding='utf-8')
`;
  execute('-c',[replay,historicalBoundaryFile,repoRoot,replayFile]);
  const bad=JSON.parse(fs.readFileSync(replayFile));
  assert(bad.text.length>baseRecord.text.length&&bad.text.includes('Disable Ads'),'Authenticated warehouse boundary did not overflow into the captured footer');
  report.warehouseBoundaryReplay={label:historical.label,provenance:historical.provenance,
   rawInput:historical.rawInput,heading:historical.heading,characters:bad.text.length,textSHA256:sha256(bad.text)};
  control('warehouse-boundary-replay-20-03-01',value=>{
   value.records.find(record=>record.id==='core-rule-20-03-01-set-up-as-reinforcements').text=bad.text;
  },row=>row.code==='SENTENCE_OUTSIDE_BOUND_SOURCE'&&row.id==='core-rule-20-03-01-set-up-as-reinforcements');
  const mutated=path.join(temp,'mutated-artifacts');fs.cpSync(runs[0],mutated,{recursive:true});
  fs.appendFileSync(path.join(mutated,'core-rules.candidate.v1.json'),'\n');
  assert.throws(()=>assertDeterministicArtifacts(runs[0],mutated),/Non-deterministic candidate artifact: core-rules.candidate.v1.json/);
  report.negativeControls.push({name:'deterministic-byte-mutation',status:'PASS'});
  const badHistorical=path.join(temp,'tampered-historical-source.json');
  fs.writeFileSync(badHistorical,Buffer.concat([fs.readFileSync(historicalSourceFile),Buffer.from('\n')]));
  assert.throws(()=>loadHistoricalSourceBaseline(badHistorical),/Historical Core baseline fixture integrity failure/);
  const rejectHistorical=`import sys\nfrom pathlib import Path\nsys.path.insert(0,${JSON.stringify(path.join(repoRoot,'books/core-rules/tools'))})\nfrom build_core_candidate import load_historical_baseline\nload_historical_baseline(Path(sys.argv[1]))\n`;
  assert.throws(()=>execute('-c',[rejectHistorical,badHistorical]),error=>{
   assert(String(error.stderr).includes('Historical Core baseline fixture integrity failure'));
   return true;
  });
  report.negativeControls.push({name:'tampered-historical-source-baseline',status:'PASS',producerRejected:true});
  report.status='PASS';
 }catch(error){report.status='FAIL';report.error={message:error.message,stack:error.stack};throw error;}
 finally{
  report.elapsedMs=Date.now()-started;
  if(option('--out'))fs.writeFileSync(option('--out'),JSON.stringify(report,null,2)+'\n');
  cleanupQaTempDir(temp);
 }
 console.log(JSON.stringify({status:report.status,canonicalRecords:report.canonical.canonicalRecords,
  rawRecords:report.raw.records,deterministicArtifacts:report.deterministicArtifacts.length,
  baselineExceptions:report.canonical.acceptedExceptionSentences.length,
  shorteningEvidence:report.canonical.shorteningEvidence,elapsedMs:report.elapsedMs,
  negativeControls:report.negativeControls.map(row=>({name:row.name,status:row.status}))}));
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
