import {parseProducerJSON,prepareSourceProducer} from '../../shared/source-refs-v2/producer-io.mjs';
/** Exact accepted source references, not Chapter choices or new factual owners. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const read=name=>parseProducerJSON(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const sha=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex').toUpperCase();
// Fixed source clauses, not text-to-effect inference. Recipient identities and
// exact href/keyword proofs remain in the independently reviewed ledger.
export function chapterGrantDeclarations(conditions=read('./chapter-conditions.json')){
 const specs=[
  ['army-rule-da-2206dbc19df84c22a190','deathwing-terminators','DEATHWING','TERMINATOR units.'],
  ['army-rule-da-2206dbc19df84c22a190','deathwing-veterans','DEATHWING','BLADEGUARD ANCIENT, BLADEGUARD VETERAN SQUAD, STERNGUARD VETERAN SQUAD and VANGUARD VETERAN SQUAD WITH JUMP PACKS units.'],
  ['army-rule-da-2206dbc19df84c22a190','deathwing-transports','DEATHWING','LAND RAIDER, LAND RAIDER CRUSADER, LAND RAIDER REDEEMER, REPULSOR and REPULSOR EXECUTIONER units.'],
  ['army-rule-da-2206dbc19df84c22a190','deathwing-dreadnoughts','DEATHWING','DREADNOUGHT units.'],
  ['army-rule-da-c944806a43ff4c999f9e','ravenwing-mounted','RAVENWING','MOUNTED units.'],
  ['army-rule-da-c944806a43ff4c999f9e','ravenwing-fly-vehicles','RAVENWING','VEHICLE FLY units.']
 ];
 const result=specs.map(([ruleId,clauseId,keyword,sourceClause])=>{
  const rows=conditions.records.filter(row=>row.eligibilityEvidence.sourceClause===sourceClause&&row.grantedKeywords.includes(keyword));
  assert.ok(rows.length,'Missing reviewed Chapter recipients');
  return {ruleId,clauseId,quote:'- '+sourceClause,targetBinding:'ROSTER_UNITS',targetSubject:'UNIT',
   targetUnitIds:rows.map(row=>row.recipient.canonicalId),targetKeywords:['ADEPTUS ASTARTES'],armyContext:true,
   effects:[{operation:'GRANT_UNIT_KEYWORD',keyword,unitScope:'PHYSICAL'}]};
 });
 assert.equal(result.flatMap(row=>row.targetUnitIds).length,26);
 return result;
}
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
  assert.equal(condition.runtimeActive,true);
  assert.equal(condition.physicalContext.unitChapterKeywordRequired,false);
  assert.equal(condition.physicalContext.armyContextRequired,true);
 }
 const applicabilitySources=daFacts.entities.filter(entity=>entity.kind==='ARMY_RULE'||
  entity.kind==='DETACHMENT_RULE'&&entity.data.text.includes('Your army can include DARK ANGELS'));
 assert.deepEqual(review.applicabilityReview.sourceFields.map(row=>row.canonicalId).sort(),applicabilitySources.map(row=>row.id).sort());
 for(const proof of review.applicabilityReview.sourceFields){
  const entity=owners.get(proof.canonicalId);
  assert.equal(entity.sourceEntityId,proof.sourceEntityId);assert.equal(sha(entity.data.text),proof.fieldSha256);
  assert.deepEqual(entity.provenance,proof.provenance);
  assert.equal(sha(fs.readFileSync(new URL('../../../'+proof.provenance.document,import.meta.url),'utf8')),proof.provenance.sha256);
 }
 assert.equal(review.applicabilityReview.unitChapterKeywordRequired,false);
 assert.equal(review.applicabilityReview.armyProof,'SOURCE_FIXED_DA_MEMBER_AND_VALIDATED_CLOSED_MEMBERSHIP');
 assert.deepEqual(review.inheritedGrantDisposition,{DEATHWING_PROVEN:18,
  DEATHWING_TOTAL:conditions.records.filter(row=>row.grantedKeywords.includes('DEATHWING')).length,
  RAVENWING_PROVEN:8,RAVENWING_TOTAL:conditions.records.filter(row=>row.grantedKeywords.includes('RAVENWING')).length,activeGrants:26});
 book.rosterChapterBindings=structuredClone(review);
 return {fixedSourceChapters:16,unresolvedInheritedChapters:67,
  deathwingProofs:18,deathwingConditions:18,ravenwingProofs:8,ravenwingConditions:8,
  activeGrants:26,basis:review.applicabilityReview.armyProof,
  missingEvidence:'GENERIC_ONLY_ARMY_HAS_NO_REVIEWED_ARMY_CONTEXT_DECLARATION',
  sharedChanges:1,realNewRecruitExportTested:false};
}
