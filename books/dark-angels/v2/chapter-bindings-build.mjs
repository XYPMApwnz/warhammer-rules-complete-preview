/** Exact accepted source references, not Chapter choices or new factual owners. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const sha=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex').toUpperCase();
export function bindDarkAngelsChapterSources(book,{review=read('./chapter-source-review.json'),
 daFacts=read('./generated/effective.json'),smFacts=read('../../space-marines/v2/generated/effective.json')}={}){
 const owners=new Map([...daFacts.entities,...smFacts.entities].map(entity=>[entity.id,entity]));
 const source=owners.get(review.definition.canonicalId),proof=review.definition;
 assert.equal(source?.id,'army-rule-sm-0fc8f686c793466d');assert.equal(source.bookId,proof.sourceOwner);
 assert.equal(source.sourceEntityId,proof.sourceEntityId);assert.equal(sha(source.data.text),proof.fieldSha256);
 assert.deepEqual(source.provenance,proof.provenance);
 assert.equal(sha(fs.readFileSync(new URL('../../../'+proof.provenance.document,import.meta.url),'utf8')),proof.provenance.sha256);
 const admitted=new Map(book.entities.filter(entity=>entity.kind==='DATASHEET').map(entity=>[entity.id,entity]));
 assert.equal(admitted.size,83);
 const seen=new Set();
 for(const [known,rows]of [[true,review.known],[false,review.unresolved]])for(const binding of rows){
  const entity=admitted.get(binding.canonicalUnitId),canonical=owners.get(binding.canonicalUnitId);
  assert.ok(entity&&canonical&&!seen.has(entity.id),'Unresolved/duplicate Chapter source member');seen.add(entity.id);
  assert.equal(entity.bookId,binding.sourceOwner);assert.equal(entity.sourceEntityId,binding.sourceEntityId);
  assert.deepEqual(entity.provenance,binding.provenance);assert.deepEqual(entity.data.factionKeywords,canonical.data.factionKeywords);
  assert.equal(sha(canonical.data.factionKeywords),binding.sourceFieldSha256);
  if(known){
   assert.equal(binding.keywordIndex,1);assert.equal(binding.chapter,'DARK ANGELS');
   assert.deepEqual(canonical.data.factionKeywords,['ADEPTUS ASTARTES',binding.chapter]);
   assert.equal(binding.keywordPointer,entity.provenance.pointer+'/div[3]/div[2]/span/span[2]');
  }else assert.deepEqual(canonical.data.factionKeywords,['ADEPTUS ASTARTES']);
 }
 assert.equal(seen.size,admitted.size);assert.equal(review.known.length,16);assert.equal(review.unresolved.length,67);
 const conditions=read('./chapter-conditions.json');
 for(const condition of conditions.records){
  assert.ok(review.unresolved.some(binding=>binding.canonicalUnitId===condition.recipient.canonicalId));
  const recipient=owners.get(condition.recipient.canonicalId);
  assert.equal(recipient.bookId,condition.recipient.sourceOwner);assert.equal(recipient.sourceEntityId,condition.recipient.sourceEntityId);
  assert.deepEqual(recipient.provenance,condition.recipient.provenance);
  assert.equal(condition.runtimeActive,false);
 }
 assert.deepEqual(review.inheritedGrantDisposition,{DEATHWING_PROVEN:0,
  DEATHWING_TOTAL:conditions.records.filter(row=>row.grantedKeywords.includes('DEATHWING')).length,
  RAVENWING_PROVEN:0,RAVENWING_TOTAL:conditions.records.filter(row=>row.grantedKeywords.includes('RAVENWING')).length,activeGrants:0});
 book.rosterChapterBindings=structuredClone(review);
 return {fixedSourceChapters:16,unresolvedInheritedChapters:67,
  deathwingProofs:0,deathwingConditions:18,ravenwingProofs:0,ravenwingConditions:8,
  activeGrants:0,basis:'EXPLICIT_SECOND_DATASHEET_FACTION_KEYWORD',
  missingEvidence:'NO_REVIEWED_PER_PHYSICAL_UNIT_CHAPTER_DECLARATION_FOR_GENERIC_SM',
  sharedChanges:0,realNewRecruitExportTested:false};
}
