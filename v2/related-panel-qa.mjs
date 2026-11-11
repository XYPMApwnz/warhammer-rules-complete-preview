/** Book-only compatibility, factual byte boundaries and independent examples. */
import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
import {parseProducerJSON} from '../books/shared/source-refs-v2/producer-io.mjs';
import {assertRealTargetContracts} from '../tests/helpers/stratagem-target-assertions.mjs';
import {assertRelatedPanelSnapshot,assertEnhancementExamples} from '../tests/helpers/related-panel-assertions.mjs';
import {assertCorePublicationSnapshot,publicationBoundaryHashes} from '../tests/helpers/core-publication-boundary.mjs';
const bookId=process.argv.find(a=>a.startsWith('--book='))?.slice(7),phase=process.argv.find(a=>a.startsWith('--phase='))?.slice(8)||'enhancements';
assert(['enhancements','all'].includes(phase));
const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/related-panel.json',import.meta.url),'utf8')),expected=fixture.books[bookId];assert(expected);
const bytes=fs.readFileSync(new URL('../books/'+bookId+'/v2/generated/app-presentation.json',import.meta.url)),raw=JSON.parse(bytes),payload=parseProducerJSON(bytes);
const hash=b=>createHash('sha256').update(b).digest('hex');
assertRelatedPanelSnapshot(payload);assertEnhancementExamples(payload);
const coreBoundary=assertCorePublicationSnapshot(payload,expected.coreBoundary);
const data=structuredClone(raw);delete data.relatedRules;
if(expected.newStratagemContracts){
 const ids=new Set(expected.newStratagemContracts);
 assert.equal(ids.size,51,'Exact new TARGET owners');
 assert.deepEqual(data.glossary.entries.filter(e=>ids.has(e.targetId)),expected.glossaryAdditions,'Exact permitted local glossary additions');
 assert.deepEqual(data.ruleContractIds.filter(id=>ids.has(id)),expected.newStratagemContracts,'Exact permitted contract owner additions');
 data.glossary.entries=data.glossary.entries.filter(e=>!ids.has(e.targetId));
 data.ruleContractIds=data.ruleContractIds.filter(id=>!ids.has(id));
}
assert.equal(hash(JSON.stringify(data)),expected.otherPayloadSha256,'Data outside relatedRules changed');
if(expected.wholePayloadSha256)assert.equal(hash(bytes),expected.wholePayloadSha256,'Protected AM/CSM/DG publication bytes changed');
const cards=new Map(payload.cards.map(c=>[c.id,c])),keys=new Set();
for(const row of payload.relatedRules.rows){const key=row.unitId+'\0'+row.ruleId;assert(!keys.has(key),'Duplicate pair');keys.add(key);
 assert.equal(cards.get(row.unitId)?.kind,'DATASHEET');assert(['STRATAGEM','ENHANCEMENT'].includes(cards.get(row.ruleId)?.kind));
 assert.equal(cards.get(row.ruleId).parentId,row.detachmentId);assert(['TRUE','FALSE','UNKNOWN'].includes(row.state));
}
let controls=phase==='all'?assertRealTargetContracts(bookId,expected):0;
function boundaryControl(name,mutate,pattern){
 const changed=structuredClone(payload);mutate(changed);
 assert.throws(()=>assertCorePublicationSnapshot(changed,expected.coreBoundary),error=>pattern.test(error.message),name+' must be rejected');
 controls++;
}
const coreIds=new Set(payload.cards.filter(card=>card.domain==='CORE').map(card=>card.id));
const nonCoreCard=value=>value.cards.find(card=>!coreIds.has(card.id));
const nonCoreFact=value=>value.factManifest.find(fact=>!coreIds.has(fact.cardId)&&!coreIds.has(fact.entityId));
const nonCoreTerm=value=>value.glossary.entries.find(entry=>!coreIds.has(entry.targetId));
assert(nonCoreCard(payload)&&nonCoreFact(payload)&&nonCoreTerm(payload),'Every reviewed book needs independent non-Core mutation witnesses');
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
const forged=structuredClone(payload),forgedExpected=structuredClone(expected.coreBoundary);
nonCoreCard(forged).title+=' [unreviewed]';
forgedExpected.hashes.nonCore=publicationBoundaryHashes(forged).hashes.nonCore;
assert.throws(()=>assertCorePublicationSnapshot(forged,forgedExpected),/strict non-Core baseline cannot be repinned/,'A concurrent fixture change cannot authorize non-Core drift');controls++;
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
console.log(JSON.stringify({status:'PASS',bookId,phase,rows:keys.size,negativeControls:controls,coreBoundary:coreBoundary.counts,permittedDerivedChangesOnly:true}));
