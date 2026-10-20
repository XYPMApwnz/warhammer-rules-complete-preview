/** Isolated structural enrollment through the existing shared completeness gate. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {assertSourceCompletenessGate,captureSourceReview} from '../../shared/roster-v2/source-completeness.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const review=read('./source-review.json');
const main=read('./generated/effective.json'),cross=read('./generated/cross-owner-references.json');
const books=[{bookId:'space-marines',facts:main,sourceReview:captureSourceReview('space-marines',main),executionBook:null},
  {bookId:'deathwatch',facts:cross,sourceReview:captureSourceReview('space-marines',cross),executionBook:null}];
const input={review,books,expectations:[],registeredBookIds:[],checkAllRegistrations:false};
const result=assertSourceCompletenessGate(input);
assert.equal(result.status,'PARTIAL');
assert.equal(result.inventoryStatus,'PROVEN');
assert.equal(result.semanticCompleteness,'NOT_PROVEN');
assert.equal(result.executableBindingsChecked,0);
assert.equal(result.classifications.UNVERIFIED,main.entities.length+cross.entities.length);
let controls=0;
const reject=(mutate,pattern)=>{
  const candidate=structuredClone(input);mutate(candidate);
  assert.throws(()=>assertSourceCompletenessGate(candidate),pattern);controls++;
};
reject(x=>{const e=structuredClone(x.books[0].facts.entities[0]);e.id='new-unreviewed-source-record';x.books[0].facts.entities.push(e);},/UNREVIEWED_SOURCE_RULE/);
reject(x=>{x.books[0].facts.entities.find(e=>e.kind==='DATASHEET_ABILITY').data.text+=' lost condition';},/UNREVIEWED_SOURCE_BLOCK/);
reject(x=>x.books[0].facts.entities.splice(0,1),/UNREVIEWED_SOURCE_REMOVAL/);
reject(x=>{x.books[0].facts.entities.find(e=>e.parentId).parentId='wrong-physical-owner';},/WRONG_CLASSIFICATION_OWNER/);
reject(x=>{x.books[0].sourceReview.artifacts[0].sha256='0'.repeat(64);},/UNREVIEWED_SOURCE_REVISION/);
reject(x=>{x.review.books['space-marines'].blocks[0].clauses=[];},/UNREVIEWED_SOURCE_RULE/);
reject(x=>{const b=x.review.books['space-marines'].blocks.find(e=>e.kind==='DETACHMENT_RULE');b.clauses[0].classification='EXECUTABLE_REQUIRED';},/INDEPENDENT_EXPECTATION_MISSING/);
console.log(JSON.stringify({...result,negativeControls:controls,globalRegistrationChanged:false,
  scope:'Stage2A complete factual block pinning only; whole-block UNVERIFIED is not semantic clause certification.'}));
