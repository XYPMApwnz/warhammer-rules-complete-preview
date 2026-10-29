/** Source-first coverage and mutation QA. Literal spans partition source text;
 * statuses must refer to a proven typed/native lowering, never merely its title. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {buildDarkAngelsContracts} from './rule-contract-build.mjs';
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex').toUpperCase();
const facts=read('./generated/effective.json'),review=read('./rule-clause-review.json'),byId=new Map(facts.entities.map(entity=>[entity.id,entity]));
const kinds=new Set(['DATASHEET_ABILITY','RULE_REFERENCE','INVULNERABLE_SAVE','SOURCE_RELATION','ARMY_RULE','DETACHMENT_RULE','ENHANCEMENT','STRATAGEM']);
const expected=facts.entities.filter(entity=>kinds.has(entity.kind)||entity.id==='section-da-c36cec25932b4675ab25');
assert.equal(expected.length,131);
assert.deepEqual([...review.reviewedSourceIds].sort(),expected.map(entity=>entity.id).sort());
let checkedSourceBytes=0;
for(const document of new Set(expected.map(entity=>entity.provenance.document))){
 const source=expected.find(entity=>entity.provenance.document===document).provenance;
 assert.equal(sha(fs.readFileSync(new URL('../../../'+document,import.meta.url))),source.sha256);checkedSourceBytes++;
}
for(const entity of expected){
 const field=entity.kind==='SOURCE_RELATION'?'rawText':'text',text=entity.data[field];
 const ranges=[...review.records.filter(row=>row.canonicalId===entity.id).map(row=>({...row.sourceOccurrence,quote:row.quote})),
  ...review.layoutOnly.filter(row=>row.canonicalId===entity.id)];
 const covered=new Set();
 for(const range of ranges){
  assert.equal(text.slice(range.start,range.end),range.quote);
  for(let offset=range.start;offset<range.end;offset++){
   assert.ok(!covered.has(offset),'Double-counted source span');covered.add(offset);
  }
 }
 for(let offset=0;offset<text.length;offset++)assert.ok(/\s/.test(text[offset])||covered.has(offset),'Unaccounted source character '+entity.id+'/'+offset);
 for(const row of review.records.filter(row=>row.canonicalId===entity.id)){
  assert.equal(row.sourceFieldSha256,sha(text));assert.equal(row.contextQuote,text);
  assert.deepEqual(row.sourceProvenance,entity.provenance);assert.deepEqual(row.field,[field]);
 }
}
assert.equal(expected.filter(entity=>entity.kind==='DATASHEET_ABILITY'&&entity.data.supplemental).length,5);
const built=buildDarkAngelsContracts(),clone=structuredClone;
let mutations=0;
const reject=fn=>{assert.throws(fn);mutations++;};
const falseReview=clone(review);falseReview.records.find(row=>row.status==='TEXT_ONLY_SOURCE_BACKED').status='EXECUTABLE_PROVEN';
reject(()=>buildDarkAngelsContracts({review:falseReview}));
const severed=clone(review);severed.records[0].sourceEntityId='unproven-source';reject(()=>buildDarkAngelsContracts({review:severed}));
const changedText=clone(review);changedText.records[0].quote+=' altered';reject(()=>buildDarkAngelsContracts({review:changedText}));
const badLowering=clone((await import('./rule-contract-declarations.mjs')).declarations);
badLowering[0].effects[0].operation='INCOMING_WOUND_MODIFIER';reject(()=>buildDarkAngelsContracts({inputs:badLowering}));
for(const entity of built.book.entities.filter(entity=>entity.bookId==='dark-angels'))for(const clause of entity.ruleContract?.clauses||[])
 for(const effect of clause.rosterEffects){
  assert.notEqual(effect.operation,'GRANT_MODEL_ABILITY','Qualified DA FNP must not become unqualified numeric FNP');
  if(['DEATHWING','RAVENWING'].includes(effect.keyword)){
   assert.equal(entity.kind,'ARMY_RULE');assert.equal(effect.unitScope,'PHYSICAL');
   assert.ok(effect.conditions.some(condition=>condition.predicate.arguments?.key==='reviewedArmyMembershipProven'));
  }
 }
assert.equal(built.artifact.executed.length,16);assert.equal(built.artifact.coverage.clauses,252);
console.log(JSON.stringify({status:'PASS',sourceOwners:expected.length,clauses:review.records.length,
 classifications:review.coverage.classifications,completeNonOverlappingSourceCoverage:true,
 checkedRawDocuments:checkedSourceBytes,typedLowerings:16,fullyCovered:16,partialChargeOnly:0,mutationControls:mutations}));
