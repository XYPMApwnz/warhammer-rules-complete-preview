/** Source-closed text contracts, protected executable clauses and fail-closed review. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseProducerJSON,prepareSourceProducer,serializeSourceJSON} from '../books/shared/source-refs-v2/producer-io.mjs';
import {appendReviewedTextCoverage,reviewedTextFields,textFieldPointer,textCoverageHash} from '../books/shared/rule-contract-v2/reviewed-text-coverage.mjs';

const bookId=process.argv.find(arg=>arg.startsWith('--book='))?.slice(7);
assert(['tyranids','emperors-children'].includes(bookId),'Explicit supported coverage book required');
const base=new URL('../books/'+bookId+'/v2/',import.meta.url),read=name=>parseProducerJSON(fs.readFileSync(new URL(name,base),'utf8'));
const review=read('text-rule-review.json'),baseline=read('text-rule-baseline.json'),facts=prepareSourceProducer(read('generated/effective.json'));
const producer=await import(new URL('rule-contract-build.mjs',base));
const built=bookId==='tyranids'?producer.buildTyranidsContracts():producer.buildECContracts();
const {book,contracts,schema}=built;
const encoded=serializeSourceJSON(built.artifact),published=parseProducerJSON(encoded),raw=JSON.parse(encoded);
const publishedContracts=new Map(published.contracts.map(c=>[c.ruleId,c]));
const rawContracts=new Map(raw.contracts.map(c=>[c.ruleId,c]));
const old=new Map(baseline.contracts.map(c=>[c.ruleId,c])),index=new Map(book.entities.map(e=>[e.id,e]));
const hash=value=>textCoverageHash(JSON.stringify(value));
const fields=reviewedTextFields(book);
assert.equal(review.records.length,fields.length);
for(const {entity,field,text}of fields){
 assert(entity.ruleContract?.clauses.some(c=>c.sourceFields.some(f=>JSON.stringify(f)===JSON.stringify(field))),
  'Missing canonical source paragraph contract '+entity.id+textFieldPointer(field));
 const row=review.records.find(r=>r.ruleId===entity.id&&JSON.stringify(r.field)===JSON.stringify(field));
 assert.equal(row.quote,text);assert.equal(row.sourceFieldSha256,textCoverageHash(text));
}
const appended=[];
for(const [id,prior]of old){
 const current=publishedContracts.get(id);
 for(const clause of prior.clauses)assert.equal(hash(rawContracts.get(id).clauses.find(c=>c.id===clause.id)),clause.rawSha256,'Published source-refs clause bytes changed '+id+'/'+clause.id);
 if(hash(current)===prior.sha256){assert.equal(hash(rawContracts.get(id)),prior.rawSha256,'Published original contract bytes changed');continue;}
 assert.equal(bookId,'emperors-children','Existing Tyranids contract changed');
 assert.equal(hash(Object.fromEntries(Object.entries(current).filter(([k])=>!['clauses','sourceFields'].includes(k)))),prior.withoutClausesAndFieldsSha256,
  'Existing contract participant, condition, source or metadata changed');
 for(const clause of prior.clauses)assert.equal(hash(current.clauses.find(c=>c.id===clause.id)),clause.sha256,'Existing executable clause changed '+id+'/'+clause.id);
 for(const field of prior.sourceFields)assert(current.sourceFields.some(f=>JSON.stringify(f)===JSON.stringify(field)));
 appended.push({ruleId:id,clauses:current.clauses.filter(c=>!prior.clauses.some(p=>p.id===c.id)).map(c=>c.id),existingClausesByteIdentical:true});
}
assert.equal(appended.length,bookId==='tyranids'?0:5);assert.equal(appended.flatMap(r=>r.clauses).length,bookId==='tyranids'?0:6);
let addedClauses=0;
for(const contract of contracts)for(const clause of contract.clauses){
 if(old.get(contract.ruleId)?.clauses.some(c=>c.id===clause.id))continue;
 addedClauses++;assert.equal(clause.rosterEffects.length,0);assert(['BATTLE_ONLY','DISPLAY_ONLY','NOT_AN_EFFECT'].includes(clause.rosterClassification));
 assert(!clause.conditionalPolicy&&!clause.f1RecipientIds?.length,'Text coverage introduced a policy/F1 path');
 assert.notEqual(index.get(contract.ruleId).kind,'STRATAGEM');
 if(clause.rosterClassification==='BATTLE_ONLY')assert(clause.conditions.some(p=>p.predicate==='FIELD'&&p.contextLevel==='BATTLE'));
}
const count=kind=>book.entities.filter(e=>e.kind===kind).filter(e=>e.ruleContract||e.data.componentIds?.every(id=>index.get(id)?.ruleContract)).length;
assert.equal(count('ENHANCEMENT'),34);assert.equal(count('DETACHMENT_RULE'),11);assert.equal(count('ARMY_RULE'),2);
const abilities=fields.filter(r=>r.entity.kind==='DATASHEET_SECTION'&&r.entity.data.title==='ABILITIES');
assert.equal(abilities.length,bookId==='tyranids'?79:41);
schema.validateContracts(book);

// Independent carrier oracle: literal source restrictions, factual MODEL
// keyword groups and native-reference recipients; never formed-unit keywords.
const carrierChecks=[];
for(const [id,spec]of Object.entries(review.enhancementOwners)){
 const entity=index.get(id),role=entity.ruleContract.roles[0],restriction=spec.restriction.quote,matches=[];
 for(const unit of book.entities.filter(e=>e.kind==='DATASHEET'))for(const profileId of unit.data.profileIds){
  const profile=index.get(profileId),binding=book.rosterProfileBindings?.find(b=>b.profileId===profileId);
  const keywords=new Set(binding?.intrinsicKeywords||[...unit.data.keywords,...unit.data.factionKeywords]);
  const context={subject:role.subject,modelId:profileId,unitId:unit.id,keywords,roster:{},battle:{}};
  const actual=schema.evaluateRole(role,[],context);assert(['TRUE','FALSE'].includes(actual),'Carrier eligibility must be statically proven');
  let expected;
  const contains=(...keys)=>keys.every(k=>keywords.has(k));
  if(bookId==='tyranids'){
   const rules={
    'TYRANIDS model only.':()=>contains('TYRANIDS'),
    'TYRANIDS SYNAPSE model only.':()=>contains('TYRANIDS','SYNAPSE'),
    'TYRANIDS MONSTER model only.':()=>contains('TYRANIDS','MONSTER'),
    'VANGUARD INVADER model only.':()=>contains('VANGUARD INVADER'),
    'WINGED TYRANID PRIME/TYRANID PRIME WITH LASH WHIP model only.':()=>contains('WINGED TYRANID PRIME')||contains('TYRANID PRIME WITH LASH WHIP'),
    'TYRANIDS model only (excluding MONSTERS models).':()=>contains('TYRANIDS')&&!contains('MONSTER'),
    'TYRANIDS model with the Deep Strike ability only.':()=>contains('TYRANIDS')&&unit.data.ruleReferenceIds.some(ref=>{const r=index.get(ref).data;return r.label==='Deep Strike'&&!r.conditionalOnly&&r.recipient.modelProfileIds.includes(profileId);}),
    'NEUROLICTOR/LICTOR/VON RYAN’S LEAPERS unit only.':()=>['unit-neurolictor','unit-lictor','unit-von-ryans-leapers'].includes(unit.id)
   };assert(rules[restriction],'Unreviewed independent Tyranids carrier restriction');expected=rules[restriction]();
  }else{
   const rules={
    'EMPEROR’S CHILDREN model only.':()=>contains('EMPEROR’S CHILDREN'),
    'EMPEROR’S CHILDREN INFANTRY model only.':()=>contains('EMPEROR’S CHILDREN','INFANTRY'),
    'EMPEROR’S CHILDREN or KEEPER OF SECRETS model only.':()=>contains('EMPEROR’S CHILDREN')||contains('KEEPER OF SECRETS'),
    'LORD EXULTANT model only.':()=>contains('LORD EXULTANT'),
    'EMPEROR’S CHILDREN DAEMON PRINCE model only.':()=>contains('EMPEROR’S CHILDREN','DAEMON PRINCE'),
    'LORD KAKOPHONIST model only.':()=>contains('LORD KAKOPHONIST')
   };assert(rules[restriction],'Unreviewed independent EC carrier restriction');expected=rules[restriction]();
  }
  assert.equal(actual==='TRUE',expected,id+': incompatible physical carrier '+profileId);
  if(expected)matches.push(profileId);
 }
 assert(matches.length,'No proven carrier for '+id);carrierChecks.push({ruleId:id,restriction,matches:[...new Set(matches)]});
}

function working(){
 const value=structuredClone(book);
 for(const e of value.entities){
  if(!old.has(e.id))delete e.ruleContract;
  else {e.ruleContract.clauses=e.ruleContract.clauses.filter(c=>old.get(e.id).clauses.some(p=>p.id===c.id));e.ruleContract.sourceFields=structuredClone(old.get(e.id).sourceFields);}
 }
 return value;
}
let controls=0;
function rejected(change,pattern){const r=structuredClone(review);change(r);assert.throws(()=>appendReviewedTextCoverage({book:working(),facts,review:r,contracts:[],currentness:{}}),pattern);controls++;}
rejected(r=>r.factualFingerprint='0'.repeat(64),/Unreviewed factual/);
rejected(r=>r.records.push(structuredClone(r.records[0])),/duplicate reviewed text/);
rejected(r=>r.records.pop(),/coverage incomplete/);
rejected(r=>r.records[0].quote+=' poison',/paragraph changed/);
rejected(r=>r.records[0].sourceFieldSha256='0'.repeat(64),/fingerprint changed/);
rejected(r=>r.records.find(c=>!c.preserveExisting).classification='ROSTER_EXECUTABLE',/Unclassified/);
rejected(r=>{const id=Object.keys(r.enhancementOwners)[0];delete r.enhancementOwners[id];},/owner eligibility/);
rejected(r=>r.records[0].ruleId='unreviewed-foreign-owner',/Unresolved/);
rejected(r=>r.records.find(c=>c.preserveExisting).preserveExisting=false,/explicit source review/);
rejected(r=>r.records.find(c=>!c.preserveExisting).preserveExisting=true,/Preserved contract/);
console.log(JSON.stringify({status:'PASS',bookId,coverage:{enhancements:34,detachmentRules:11,armyRules:2,abilities:abilities.length},
 contracts:contracts.length,protectedContracts:old.size,addedClauses,appended,carrierChecks,negativeControls:controls}));
