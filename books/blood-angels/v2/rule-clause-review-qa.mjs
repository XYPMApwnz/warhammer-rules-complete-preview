/** Source-first, non-overlapping coverage and hostile mutation controls.
 * The denominator is the accepted factual source population, not runtime effects. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {buildBloodAngelsContracts} from './rule-contract-build.mjs';
import {declarations} from './rule-contract-declarations.mjs';
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const sha=value=>createHash('sha256').update(value).digest('hex').toUpperCase();
const facts=read('./generated/effective.json'),review=read('./rule-clause-review.json'),native=read('./native-ability-review.json');
const byId=new Map(facts.entities.map(e=>[e.id,e]));
const kinds=new Set(['DATASHEET_ABILITY','RULE_REFERENCE','INVULNERABLE_SAVE','SOURCE_RELATION','DETACHMENT_RULE','ENHANCEMENT','STRATAGEM','WARGEAR_OPTION']);
const expected=facts.entities.filter(e=>kinds.has(e.kind));
assert.equal(facts.entities.length,301);assert.equal(expected.length,141);
assert.equal(review.records.length,233);assert.equal(new Set(review.records.map(r=>r.id)).size,233);
assert.deepEqual([...review.reviewedSourceIds].sort(),expected.map(e=>e.id).sort());
assert.equal(review.factualFingerprint,sha(JSON.stringify(facts)));
const categoryExpected={DATASHEET_ABILITY:54,DETACHMENT_RULE:9,ENHANCEMENT:17,INVULNERABLE_SAVE:9,RULE_REFERENCE:45,SOURCE_RELATION:20,STRATAGEM:53,WARGEAR_OPTION:26};
assert.deepEqual(review.coverage.categories,categoryExpected);
const sourceDocuments=new Set();
for(const e of expected){
 const field=e.kind==='SOURCE_RELATION'?'rawText':'text',text=e.data[field];assert.equal(typeof text,'string');
 const records=review.records.filter(r=>r.canonicalId===e.id),ranges=[...records.map(r=>({...r.sourceOccurrence,quote:r.quote})),...review.layoutOnly.filter(r=>r.canonicalId===e.id)];
 assert.ok(ranges.length,'Empty source partition '+e.id);const covered=new Set();
 for(const r of ranges){assert.equal(text.slice(r.start,r.end),r.quote);assert.ok(r.end>r.start);
  for(let n=r.start;n<r.end;n++){assert.ok(!covered.has(n),'Double-counted source character '+e.id+'/'+n);covered.add(n);}}
 for(let n=0;n<text.length;n++)assert.ok(/\s/.test(text[n])||covered.has(n),'Uncovered mechanical source character '+e.id+'/'+n);
 for(const r of records){assert.equal(r.sourceFieldSha256,sha(text));assert.equal(r.contextQuote,text);assert.equal(r.sourceEntityId,e.sourceEntityId);
  assert.deepEqual(r.sourceProvenance,e.provenance);assert.deepEqual(r.field,[field]);assert.equal(r.ownerId,e.parentId||'blood-angels');}
 if(!sourceDocuments.has(e.provenance.document)){sourceDocuments.add(e.provenance.document);assert.equal(sha(fs.readFileSync(new URL('../../../'+e.provenance.document,import.meta.url))),e.provenance.sha256);}
}
assert.equal(expected.filter(e=>e.kind==='DATASHEET_ABILITY').length,31);
assert.equal(expected.filter(e=>e.kind==='DATASHEET_ABILITY'&&e.data.supplemental).length,2);
assert.equal(expected.filter(e=>e.kind==='WARGEAR_OPTION').length,26);
assert.equal(native.nativeAbilities.length,20);assert.equal(native.invulnerablePanels.length,9);
for(const p of native.nativeAbilities){const e=byId.get(p.id);assert.equal(e.kind,'RULE_REFERENCE');assert.equal(e.parentId,p.ownerId);
 assert.equal(e.data.text,p.quote);assert.equal(sha(p.quote),p.sourceFieldSha256);assert.deepEqual(e.provenance,p.provenance);
 assert.deepEqual(byId.get(p.ownerId).data.profileIds,p.modelProfileIds);}
const excluded=new Set((review.excludedSourceRecords||[]).map(r=>r.canonicalId||r.id));
assert.equal(excluded.size,160);assert.deepEqual([...new Set([...review.reviewedSourceIds,...excluded])].sort(),facts.entities.map(e=>e.id).sort());
const statuses=Object.fromEntries(['EXECUTABLE_PROVEN','TEXT_ONLY_SOURCE_BACKED','NOT_PROVEN'].map(status=>[status,review.records.filter(r=>r.status===status).length]));
assert.deepEqual(review.coverage.classifications,statuses);
const unsupported=review.records.filter(r=>r.status==='NOT_PROVEN');assert.equal(unsupported.length,9);
for(const e of facts.entities.filter(e=>e.kind==='DATASHEET_ABILITY'&&e.data.title==='Black Rage')){
 assert.ok(e.data.text.includes('or not within 12"'));assert.ok(unsupported.some(r=>r.canonicalId===e.id&&r.quote.includes('or not within')));
}
const built=buildBloodAngelsContracts(),mutations=[];
const reject=(id,fn)=>{assert.throws(fn,undefined,id);mutations.push(id);};
const badStatus=structuredClone(review);badStatus.records.find(r=>r.status==='TEXT_ONLY_SOURCE_BACKED').status='EXECUTABLE_PROVEN';
reject('text-only-promoted-without-proof',()=>buildBloodAngelsContracts({review:badStatus}));
const badSource=structuredClone(review);badSource.records[0].sourceEntityId='fabricated-source';reject('severed-source-binding',()=>buildBloodAngelsContracts({review:badSource}));
const badQuote=structuredClone(review);badQuote.records[0].quote+=' altered';reject('mutated-source-quote',()=>buildBloodAngelsContracts({review:badQuote}));
const badType=structuredClone(declarations);badType[0].effects[0].operation='INVENTED_INCOMING_DAMAGE';reject('unsupported-operation',()=>buildBloodAngelsContracts({inputs:badType}));
for(const e of built.book.entities.filter(e=>e.bookId==='blood-angels'))for(const c of e.ruleContract?.clauses||[])for(const effect of c.rosterEffects||[]){
 assert.notEqual(effect.operation,'GRANT_UNIT_KEYWORD','No source-reviewed BA Chapter/DOOMED/GRACE grants in this stage');
 assert.ok(!['DEATHWING','RAVENWING','DOOMED','GRACE','BLOOD ANGELS'].includes(effect.keyword));
}
assert.equal(built.artifact.executed.length,8,'Independent static-lowering denominator');
console.log(JSON.stringify({status:'PASS',sourceOwners:expected.length,clauses:233,classifications:statuses,
 completeSourceCharacterPartition:true,sourceDocuments:sourceDocuments.size,nativeCoreProofs:20,nativeInSv:9,typedLowerings:8,mutationControls:mutations},null,2));
