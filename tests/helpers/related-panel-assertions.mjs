/** Exact projection regression plus owner-authored compatibility controls. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
const fixture=JSON.parse(fs.readFileSync(new URL('../../v2/fixtures/related-panel.json',import.meta.url),'utf8'));
export const relatedHash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function assertRelatedPanelSnapshot(payload){
 const expected=fixture.books[payload.book.id];assert(expected,'Missing related-panel book expectation');
 assert.equal(relatedHash(payload.relatedRules.rows),expected.rowsSha256,'Exact reviewed related rows changed');
}
export function assertEnhancementExamples(payload){
 const book=payload.book.id,rows=payload.relatedRules.rows;
 for(const [bookId,unitId,ruleId]of fixture.noEnhancements)if(book===bookId){
  const selected=rows.filter(row=>row.unitId===unitId&&row.kind==='ENHANCEMENT');
  assert.equal(selected.length,fixture.books[book].enhancements);
  assert(selected.every(row=>row.applicability==='NO_MATCH'&&row.selectedDetachment.applicability==='NO_MATCH'),'Non-bearer cannot borrow a CHARACTER from an attachment');
 }
 for(const c of fixture.enhancements.filter(row=>row.bookId===book)){
  const row=rows.find(row=>row.unitId===c.unitId&&row.ruleId===c.ruleId);assert(row,'Missing independent carrier example');
  assert.equal(row.applicability,c.expected);assert.equal(row.selectedDetachment.applicability,c.expected);
 }
}
