/** Book-only compatibility, factual byte boundaries and independent examples. */
import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
import {parseProducerJSON} from '../books/shared/source-refs-v2/producer-io.mjs';
import {assertRelatedPanelSnapshot,assertEnhancementExamples} from '../tests/helpers/related-panel-assertions.mjs';
const bookId=process.argv.find(a=>a.startsWith('--book='))?.slice(7),phase=process.argv.find(a=>a.startsWith('--phase='))?.slice(8)||'enhancements';
assert(['enhancements','all'].includes(phase));
const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/related-panel.json',import.meta.url),'utf8')),expected=fixture.books[bookId];assert(expected);
const bytes=fs.readFileSync(new URL('../books/'+bookId+'/v2/generated/app-presentation.json',import.meta.url)),raw=JSON.parse(bytes),payload=parseProducerJSON(bytes);
const hash=b=>createHash('sha256').update(b).digest('hex');
assertRelatedPanelSnapshot(payload);assertEnhancementExamples(payload);
const data=structuredClone(raw);delete data.relatedRules;
assert.equal(hash(JSON.stringify(data)),expected.otherPayloadSha256,'Data outside relatedRules changed');
if(expected.wholePayloadSha256)assert.equal(hash(bytes),expected.wholePayloadSha256,'Protected AM/CSM/DG publication bytes changed');
const cards=new Map(payload.cards.map(c=>[c.id,c])),keys=new Set();
for(const row of payload.relatedRules.rows){const key=row.unitId+'\0'+row.ruleId;assert(!keys.has(key),'Duplicate pair');keys.add(key);
 assert.equal(cards.get(row.unitId)?.kind,'DATASHEET');assert(['STRATAGEM','ENHANCEMENT'].includes(cards.get(row.ruleId)?.kind));
 assert.equal(cards.get(row.ruleId).parentId,row.detachmentId);assert(['TRUE','FALSE','UNKNOWN'].includes(row.state));
}
let controls=0;
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
console.log(JSON.stringify({status:'PASS',bookId,phase,rows:keys.size,negativeControls:controls,onlyRelatedRulesChanged:true}));
