/** Book-only compatibility, factual byte boundaries and independent examples. */
import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
import {parseProducerJSON} from '../books/shared/source-refs-v2/producer-io.mjs';
import {assertRealTargetContracts} from '../tests/helpers/stratagem-target-assertions.mjs';
import {assertRelatedPanelSnapshot,assertEnhancementExamples} from '../tests/helpers/related-panel-assertions.mjs';
import {assertCorePublicationSnapshot,assertHistoricalCorePublicationSnapshot,publicationBoundaryHashes} from '../tests/helpers/core-publication-boundary.mjs';
import {CORE_TRANSITION_COMMIT,readCoreTransitionFile,readCoreTransitionJSON} from '../tests/helpers/core-transition-history.mjs';
const bookId=process.argv.find(a=>a.startsWith('--book='))?.slice(7),phase=process.argv.find(a=>a.startsWith('--phase='))?.slice(8)||'enhancements';
assert(['enhancements','all'].includes(phase));
const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/related-panel.json',import.meta.url),'utf8')),expected=fixture.books[bookId];assert(expected);
const historicalFixture=JSON.parse(readCoreTransitionFile('v2/fixtures/related-panel.json')),historicalExpected=historicalFixture.books[bookId];assert(historicalExpected);
const publicationFile='books/'+bookId+'/v2/generated/app-presentation.json';
const bytes=fs.readFileSync(new URL('../'+publicationFile,import.meta.url)),payload=parseProducerJSON(bytes);
const historicalBytes=readCoreTransitionFile(publicationFile),historicalRaw=JSON.parse(historicalBytes),historicalPayload=readCoreTransitionJSON(publicationFile);
const hash=b=>createHash('sha256').update(b).digest('hex');
assertRelatedPanelSnapshot(payload);assertEnhancementExamples(payload);
const coreBoundary=assertCorePublicationSnapshot(payload);
const historicalCoreBoundary=assertHistoricalCorePublicationSnapshot(historicalPayload,historicalExpected.coreBoundary);
const data=structuredClone(historicalRaw);delete data.relatedRules;
if(historicalExpected.newStratagemContracts){
 const ids=new Set(historicalExpected.newStratagemContracts);
 assert.equal(ids.size,51,'Exact new TARGET owners');
 assert.deepEqual(data.glossary.entries.filter(e=>ids.has(e.targetId)),historicalExpected.glossaryAdditions,'Exact permitted local glossary additions');
 assert.deepEqual(data.ruleContractIds.filter(id=>ids.has(id)),historicalExpected.newStratagemContracts,'Exact permitted contract owner additions');
 data.glossary.entries=data.glossary.entries.filter(e=>!ids.has(e.targetId));
 data.ruleContractIds=data.ruleContractIds.filter(id=>!ids.has(id));
}
assert.equal(hash(JSON.stringify(data)),historicalExpected.otherPayloadSha256,'Historical data outside relatedRules changed');
if(historicalExpected.wholePayloadSha256)assert.equal(hash(historicalBytes),historicalExpected.wholePayloadSha256,'Historical protected AM/CSM/DG publication bytes changed');
const cards=new Map(payload.cards.map(c=>[c.id,c])),keys=new Set();
for(const row of payload.relatedRules.rows){const key=row.unitId+'\0'+row.ruleId;assert(!keys.has(key),'Duplicate pair');keys.add(key);
 assert.equal(cards.get(row.unitId)?.kind,'DATASHEET');assert(['STRATAGEM','ENHANCEMENT'].includes(cards.get(row.ruleId)?.kind));
 assert.equal(cards.get(row.ruleId).parentId,row.detachmentId);assert(['TRUE','FALSE','UNKNOWN'].includes(row.state));
}
let controls=phase==='all'?assertRealTargetContracts(bookId,expected):0;
function boundaryControl(name,mutate,pattern){
 const changed=structuredClone(historicalPayload);mutate(changed);
 assert.throws(()=>assertHistoricalCorePublicationSnapshot(changed,historicalExpected.coreBoundary),error=>pattern.test(error.message),name+' must be rejected historically');
 controls++;
}
const coreIds=new Set(historicalPayload.cards.filter(card=>card.domain==='CORE').map(card=>card.id));
const nonCoreCard=value=>value.cards.find(card=>!coreIds.has(card.id));
const nonCoreFact=value=>value.factManifest.find(fact=>!coreIds.has(fact.cardId)&&!coreIds.has(fact.entityId));
const nonCoreTerm=value=>value.glossary.entries.find(entry=>!coreIds.has(entry.targetId));
assert(nonCoreCard(historicalPayload)&&nonCoreFact(historicalPayload)&&nonCoreTerm(historicalPayload),'Every reviewed book needs independent non-Core mutation witnesses');
boundaryControl('non-Core card text',value=>{nonCoreCard(value).title+=' [unreviewed]';},/NON_CORE_PUBLICATION_CHANGED/);
boundaryControl('non-Core fact value',value=>{nonCoreFact(value).value='UNREVIEWED_NON_CORE_FACT';},/NON_CORE_PUBLICATION_CHANGED/);
boundaryControl('non-Core glossary text',value=>{nonCoreTerm(value).label+=' [unreviewed]';},/NON_CORE_PUBLICATION_CHANGED/);
boundaryControl('relatedRules',value=>{
 const row=value.relatedRules.rows[0];row.applicability=row.applicability==='NO_MATCH'?'CONDITIONAL':'NO_MATCH';
},/NON_CORE_PUBLICATION_CHANGED/);
boundaryControl('remaining book data',value=>{value.book.title+=' [unreviewed]';},/NON_CORE_PUBLICATION_CHANGED/);
boundaryControl('foreign card disguised as Core',value=>{nonCoreCard(value).domain='CORE';},/CORE_DOMAIN_ID_MISMATCH/);
boundaryControl('foreign fact disguised as Core',value=>{nonCoreFact(value).domain='CORE';},/CORE_DOMAIN_ID_MISMATCH/);
boundaryControl('non-Core source attribution',value=>{
 const card=value.cards.find(card=>!coreIds.has(card.id)&&card.provenance)||nonCoreCard(value);
 if(Array.isArray(card.provenance)){assert(card.provenance.length);card.provenance[0]={...card.provenance[0],unreviewedSource:'SYNTHETIC_FOREIGN_SOURCE'};}
 else if(card.provenance)card.provenance.unreviewedSource='SYNTHETIC_FOREIGN_SOURCE';
 else card.source={...card.source,unreviewedSource:'SYNTHETIC_FOREIGN_SOURCE'};
},/NON_CORE_PUBLICATION_CHANGED/);
boundaryControl('unreviewed Core publication text',value=>{value.cards.find(card=>card.domain==='CORE').title+=' [unreviewed]';},/CORE_PUBLICATION_CHANGED_WITHOUT_REVIEW/);
boundaryControl('URU identity is Core without a core-prefix',value=>{
 const card=value.cards.find(card=>card.kind==='CORE_UNIVERSAL_RULE_UPDATE');assert(card);card.domain='ARMY';
},/CORE_DOMAIN_ID_MISMATCH/);
const forged=structuredClone(historicalPayload),forgedExpected=structuredClone(historicalExpected.coreBoundary);
nonCoreCard(forged).title+=' [unreviewed]';
forgedExpected.hashes.nonCore=publicationBoundaryHashes(forged,{historical:true}).hashes.nonCore;
assert.throws(()=>assertHistoricalCorePublicationSnapshot(forged,forgedExpected),/strict non-Core baseline cannot be repinned/,'A concurrent fixture change cannot authorize historical non-Core drift');controls++;
const changedCurrent=structuredClone(payload);
changedCurrent.cards.find(card=>card.domain!=='CORE').title+=' [later book update]';
assertCorePublicationSnapshot(changedCurrent);
const changedCurrentCore=structuredClone(payload);
changedCurrentCore.cards.find(card=>card.domain==='CORE').title+=' [not in current Core catalog]';
assert.throws(()=>assertCorePublicationSnapshot(changedCurrentCore),/CORE_PUBLICATION_DOES_NOT_MATCH_CURRENT_CATALOG/,'Live Core must match its current catalog');controls++;
for(const [name,mutate]of [
 ['card',value=>{value.cards.find(card=>card.domain!=='CORE').domain='CORE';}],
 ['fact',value=>{value.factManifest.find(fact=>!coreIds.has(fact.cardId)&&!coreIds.has(fact.entityId)).domain='CORE';}],
 ['URU',value=>{value.cards.find(card=>card.kind==='CORE_UNIVERSAL_RULE_UPDATE').domain='ARMY';}]
]){
 const changed=structuredClone(payload);mutate(changed);
 assert.throws(()=>assertCorePublicationSnapshot(changed),/CORE_DOMAIN_ID_MISMATCH/,'Live '+name+' ownership must be rejected');controls++;
}
if(fixture.noEnhancements.some(c=>c[0]===bookId)){
 const unit=fixture.noEnhancements.find(c=>c[0]===bookId)[1],bad=structuredClone(payload);
 bad.relatedRules.rows.find(r=>r.unitId===unit&&r.kind==='ENHANCEMENT').applicability='CONDITIONAL';
 assert.throws(()=>assertEnhancementExamples(bad));controls++;
}
const corrupt=structuredClone(payload);corrupt.relatedRules.rows[0].unitId='unrelated-canonical-unit';assert.throws(()=>assertRelatedPanelSnapshot(corrupt));controls++;
if(phase==='all')for(const c of fixture.stratagems.filter(c=>c.bookId===bookId)){
 const row=payload.relatedRules.rows.find(r=>r.unitId===c.unitId&&r.ruleId===c.ruleId);assert(row,'Missing literal TARGET example');
 assert.equal(row.applicability,c.expected);assert.equal(row.selectedDetachment.applicability,c.expected);
}
console.log(JSON.stringify({status:'PASS',bookId,phase,rows:keys.size,negativeControls:controls,coreBoundary:coreBoundary.counts,historicalCoreBoundary:historicalCoreBoundary.counts,historicalTransitionCommit:CORE_TRANSITION_COMMIT,currentCoreMatchesCatalog:true}));
