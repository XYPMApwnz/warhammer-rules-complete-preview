import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {declarations,pendingPhysicalBindings,unsupportedPresentationClauses} from './rule-contract-declarations.mjs';
import {nativeAbilityReview,nativeInvulnerableReview} from './native-ability-bindings.mjs';
import {physicalStaticBindings} from './roster-static-model-bindings.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const sha=value=>createHash('sha256').update(value).digest('hex').toUpperCase();
const supplemental=new Set(['PSYCHIC ABILITIES','TRANSPORT','SUPREME COMMANDER']);
const kinds=new Set(['DATASHEET_ABILITY','RULE_REFERENCE','INVULNERABLE_SAVE','ARMY_RULE',
  'DETACHMENT_RULE','ENHANCEMENT','STRATAGEM','SOURCE_RELATION']);
const sort=values=>[...values].sort();
const at=(value,field)=>field.reduce((v,key)=>v?.[key],value);
const statuses=['EXECUTABLE_PROVEN','TEXT_ONLY_SOURCE_BACKED','NOT_PROVEN'];

/** The reviewed transcription is checked against facts, never runtime outputs. */
export function validateClauseReview(review=read('./rule-clause-review.json'),facts=read('./generated/effective.json'),{
  typedBindings=declarations,nativeAbilityBindings=nativeAbilityReview,nativeProfileBindings=nativeInvulnerableReview
}={}){
  assert.equal(review.bookId,'space-marines');
  assert.equal(review.factualFingerprint,sha(JSON.stringify(facts)),'Accepted facts changed without review');
  const index=new Map(facts.entities.map(e=>[e.id,e]));
  const required=facts.entities.filter(e=>kinds.has(e.kind)||e.kind==='DATASHEET_SECTION'&&supplemental.has(e.data.title));
  assert.deepEqual(sort(review.sourceOwners.map(e=>e.id)),sort(required.map(e=>e.id)),'Mechanical source owner omitted or invented');
  assert.equal(new Set(review.records.map(e=>e.id)).size,review.records.length,'Duplicate clause identity');
  const classes=Object.fromEntries(statuses.map(status=>[status,0])),categories={},byCategory={};
  const occupied=new Map();
  for(const row of review.records){
    const fact=index.get(row.canonicalId);assert.ok(fact,'Unknown canonical source');
    assert.equal(fact.bookId,'space-marines','Foreign factual owner');
    assert.equal(row.ownerId,fact.parentId||facts.bookId,'Physical/canonical source owner changed');
    assert.equal(row.sourceIdentity,fact.sourceEntityId,'Source occurrence identity changed');
    const text=at(fact.data,row.field);assert.equal(typeof text,'string');
    assert.equal(row.contextQuote,text,'Conditions or full source context discarded');
    assert.equal(sha(text),row.sourceFieldSha256,'Source field fingerprint changed');
    assert.equal(row.sourceQuote,row.quote);assert.equal(sha(row.quote),row.sourceQuoteSha256);
    const {start,end}=row.sourceOccurrence;
    assert.ok(Number.isInteger(start)&&Number.isInteger(end)&&start>=0&&end>start&&end<=text.length);
    assert.equal(text.slice(start,end),row.quote,'Literal source occurrence changed');
    assert.equal(row.id,`${fact.id}#${row.field.join('/')}:${start}-${end}`,'Clause is not its guarded source occurrence');
    assert.deepEqual(row.provenance,fact.provenance,'Source provenance changed');
    assert.deepEqual(row.officialFieldProvenance,fact.fieldProvenance||{},'Official field provenance changed');
    assert.ok(statuses.includes(row.status));assert.equal(row.classification,row.status);
    assert.ok(row.explanation&&row.activationConditions&&row.recipientScope&&row.recipientScopeText);
    if(row.status==='EXECUTABLE_PROVEN'){
      const proof=row.executionEvidence;
      assert.ok(proof?.source&&proof.runtimeQA,'Executable classification lacks concrete binding/runtime evidence');
      if(proof.kind==='TYPED_EFFECT'){
        assert.equal(proof.contractId,row.canonicalId);assert.ok(proof.clauseIds?.length);
        for(const id of proof.clauseIds){
          const binding=typedBindings.find(binding=>binding.ruleId===row.canonicalId&&binding.clauseId===id);
          assert.ok(binding&&binding.effects.length,'Reviewed executable typed binding was removed');
          assert.deepEqual(binding.field,row.field);
          assert.ok(binding.quote.includes(row.quote),'Partial effect was presented as a complete executable source clause');
          assert.equal(binding.ownerId,row.ownerId);
        }
      }else if(proof.kind==='PHYSICAL_TYPED_EFFECT'){
        const binding=physicalStaticBindings.find(binding=>binding.ruleId===row.canonicalId);
        assert.ok(binding,'Missing physical typed binding');
        assert.equal(binding.quote,row.quote);assert.equal(binding.sourceUnitId,row.ownerId);
        assert.deepEqual(binding.field,row.field);assert.deepEqual(binding.sourceEvidence,row.provenance);
        assert.equal(binding.operation,'GRANT_MODEL_ABILITY');assert.deepEqual(binding.ability,{name:'Feel No Pain',value:4});
        assert.equal(binding.recipientKeyword,'CHARACTER');assert.equal(binding.excludeExactSourceModel,true);
        assert.equal(index.get(binding.sourceProfileId)?.parentId,row.ownerId);
      }else if(proof.kind==='NATIVE_ABILITY'){
        const binding=nativeAbilityBindings.find(binding=>binding.id===row.canonicalId);
        assert.ok(binding&&binding.status==='EXECUTABLE_PROVEN','Reviewed executable native ability binding was removed');
        assert.equal(binding.quote,row.quote);assert.equal(proof.nativeReferenceId,binding.id);
        assert.equal(proof.canonicalAbilityId,binding.canonicalAbilityId);
        assert.equal(binding.ownerId,row.ownerId);
        assert.deepEqual(proof.modelProfileIds,binding.modelProfileIds);
      }else if(proof.kind==='NATIVE_PROFILE'){
        const binding=nativeProfileBindings.find(binding=>binding.id===row.canonicalId);
        assert.ok(binding,'Reviewed executable native profile binding was removed');
        assert.ok(!binding.data.conditionText||binding.data.scopeQualification==='EXPLICIT_NAMED_MODEL',
          'Conditional melee-only save was made unconditional');
        assert.deepEqual(binding.data,fact.data);assert.equal(binding.ownerId,row.ownerId);
        assert.deepEqual(proof.modelProfileIds,binding.data.sourceProfileIds);
      }else assert.fail('Unknown executable proof class');
    }
    if(row.status==='NOT_PROVEN'){
      const pending=pendingPhysicalBindings.find(binding=>binding.ruleId===row.canonicalId);
      assert.ok(pending,'Invented unresolved source dependency');
      assert.equal(at(fact.data,pending.field).includes(pending.quote),true);
      assert.equal(row.unresolvedReason,pending.reason);
    }
    for(const lowering of row.partialLowerings||[]){
      const binding=typedBindings.find(binding=>binding.ruleId===row.canonicalId&&binding.clauseId===lowering.clauseId);
      assert.ok(binding&&text.includes(binding.quote),'Partial lowering binding was removed');
      assert.equal(lowering.quote,binding.quote);
    }
    if(row.unsupportedPresentation){
      const missing=unsupportedPresentationClauses.find(binding=>binding.ruleId===row.canonicalId&&
        binding.clauseId===row.unsupportedPresentation.clauseId);
      assert.ok(missing&&text.includes(missing.quote));
      assert.equal(row.status,'TEXT_ONLY_SOURCE_BACKED','Missing recipient presentation was hidden behind executable PASS');
    }
    if(fact.kind==='INVULNERABLE_SAVE')assert.deepEqual(row.recipientProfileIds,fact.data.sourceProfileIds,'Invented InSv recipient');
    const ranges=occupied.get(fact.id)||[];
    assert.ok(ranges.every(range=>end<=range.start||start>=range.end),'Overlapping duplicate semantic source clauses');
    ranges.push({start,end});occupied.set(fact.id,ranges);
    classes[row.status]++;categories[row.category]=(categories[row.category]||0)+1;
    byCategory[row.category]??=Object.fromEntries(statuses.map(status=>[status,0]));byCategory[row.category][row.status]++;
  }
  for(const source of review.sourceOwners){
    const fact=index.get(source.id),text=at(fact.data,source.field);
    assert.equal(source.ownerId,fact.parentId||facts.bookId);assert.equal(source.kind,fact.kind);
    assert.equal(source.sourceFieldSha256,sha(text));
    assert.deepEqual(source.clauseIds,review.records.filter(row=>row.canonicalId===source.id).map(row=>row.id));
    assert.ok(source.clauseIds.length,'Source has no reviewed operative clauses');
    const accounted=new Uint8Array(text.length);
    for(const row of review.records.filter(row=>row.canonicalId===source.id))accounted.fill(1,row.sourceOccurrence.start,row.sourceOccurrence.end);
    for(const row of review.excludedSegments.filter(row=>row.canonicalId===source.id)){
      assert.equal(text.slice(row.sourceOccurrence.start,row.sourceOccurrence.end),row.quote);
      assert.ok(row.reason);accounted.fill(1,row.sourceOccurrence.start,row.sourceOccurrence.end);
    }
    for(const row of review.nestedSourceOverlaps.filter(row=>row.canonicalId===source.id)){
      const nested=index.get(row.coveredByCanonicalId);assert.equal(nested.parentId,source.id);
      assert.equal(text.slice(row.sourceOccurrence.start,row.sourceOccurrence.end),nested.data.text);
      assert.ok(review.sourceOwners.some(s=>s.id===nested.id));
      accounted.fill(1,row.sourceOccurrence.start,row.sourceOccurrence.end);
    }
    for(let i=0;i<text.length;i++)assert.ok(accounted[i]||/\s/.test(text[i]),`Unreviewed source text: ${source.id}:${i}`);
  }
  assert.equal(review.nestedSourceOverlaps.length,3,'Nested source ownership coverage changed');
  assert.deepEqual(sort(review.datasheetCoverage.map(e=>e.id)),sort(facts.entities.filter(e=>e.kind==='DATASHEET').map(e=>e.id)));
  for(const row of review.datasheetCoverage){
    for(const [key,kind] of [['abilityIds','DATASHEET_ABILITY'],['nativeReferenceIds','RULE_REFERENCE']])
      assert.deepEqual(row[key],facts.entities.filter(e=>e.parentId===row.id&&e.kind===kind).map(e=>e.id));
  }
  assert.deepEqual(sort(review.detachmentCoverage.map(e=>e.id)),sort(facts.entities.filter(e=>e.kind==='DETACHMENT').map(e=>e.id)));
  for(const row of review.detachmentCoverage)for(const field of ['ruleIds','enhancementIds','stratagemIds'])
    assert.deepEqual(row[field],index.get(row.id).data[field]);
  const weapons=facts.entities.filter(e=>e.kind==='WEAPON_PROFILE');
  assert.deepEqual(sort(review.nativeWeaponInventory.map(e=>e.id)),sort(weapons.map(e=>e.id)));
  for(const row of review.nativeWeaponInventory){const e=index.get(row.id);assert.equal(row.ownerId,e.parentId);
    assert.deepEqual(row.abilities,e.data.abilities);assert.equal(row.sourceWeaponCellText,e.data.sourceWeaponCellText);assert.deepEqual(row.provenance,e.provenance);}
  assert.equal(review.coverage.clauses,review.records.length);assert.equal(review.coverage.sourceOwners,required.length);
  assert.deepEqual(review.coverage.classifications,classes);assert.deepEqual(review.coverage.categories,categories);
  if(review.coverage.classificationsByCategory)assert.deepEqual(review.coverage.classificationsByCategory,byCategory);
  assert.equal(review.coverage.nativeWeaponProfiles,weapons.length);
  assert.equal(review.coverage.nativeWeaponAbilityOccurrences,weapons.reduce((n,e)=>n+e.data.abilities.length,0));
  assert.equal(review.coverage.reviewedTypedLowerings,typedBindings.length);
  assert.equal(review.coverage.reviewedPhysicalLowerings,physicalStaticBindings.length);
  assert.equal(review.coverage.fullyCoveredTypedSourceClauses,review.records.filter(row=>row.executionEvidence?.kind==='TYPED_EFFECT').length);
  assert.equal(review.coverage.fullyCoveredPhysicalSourceClauses,review.records.filter(row=>row.executionEvidence?.kind==='PHYSICAL_TYPED_EFFECT').length);
  assert.equal(review.coverage.partialLoweringSourceClauses,review.records.filter(row=>row.partialLowerings?.length).length);
  // Verify accepted source bytes still match the upstream provenance pins. Full
  // RAW/effective text parity remains the independently established foundation QA.
  const files=new Map(required.map(e=>[e.provenance.document,e.provenance.sha256]));
  for(const [document,hash] of files)assert.equal(sha(fs.readFileSync(new URL('../../../'+document,import.meta.url))),hash);
  return {sourceOwners:required.length,clauses:review.records.length,classifications:classes,categories,classificationsByCategory:byCategory,
    structuralDatasheets:review.datasheetCoverage.length,structuralDetachments:review.detachmentCoverage.length,
    nestedOverlaps:review.nestedSourceOverlaps.length,nativeWeaponProfiles:weapons.length};
}

export function runClauseReviewQA(){
  const review=read('./rule-clause-review.json'),facts=read('./generated/effective.json');
  const report=validateClauseReview(review,facts),mutations=[];
  function fails(name,edit){const mutated=structuredClone(review);edit(mutated);assert.throws(()=>validateClauseReview(mutated,facts),undefined,name);mutations.push(name);}
  fails('missing clause',r=>r.records.pop());
  fails('missing source owner',r=>r.sourceOwners.pop());
  fails('wrong physical/canonical owner',r=>r.records[0].ownerId='other-unit');
  fails('wrong exact source quote',r=>r.records[0].quote+=' fabricated');
  fails('source conditions lost',r=>r.records[0].contextQuote=r.records[0].quote);
  fails('phantom executable status',r=>{const a=r.records.find(a=>a.status!=='EXECUTABLE_PROVEN');a.status=a.classification='EXECUTABLE_PROVEN';a.executionEvidence=null;});
  fails('duplicate source clause',r=>r.records.push(structuredClone(r.records[0])));
  fails('nested source alias lost',r=>r.nestedSourceOverlaps.pop());
  fails('wrong model save recipient',r=>r.records.find(a=>a.category==='INVULNERABLE_SAVE').recipientProfileIds=['other-model']);
  fails('native weapon ability removed',r=>r.nativeWeaponInventory.find(a=>a.abilities.length).abilities.pop());
  fails('detachment ownership lost',r=>r.detachmentCoverage[0].enhancementIds=[]);
  fails('factual source changed without review',r=>r.factualFingerprint='unreviewed');
  fails('stale typed coverage summary',r=>r.coverage.reviewedTypedLowerings--);
  fails('stale physical coverage summary',r=>r.coverage.reviewedPhysicalLowerings--);
  const typed=review.records.find(row=>row.executionEvidence?.kind==='TYPED_EFFECT');
  const native=review.records.find(row=>row.executionEvidence?.kind==='NATIVE_ABILITY');
  const profile=review.records.find(row=>row.executionEvidence?.kind==='NATIVE_PROFILE');
  if(typed){
    assert.throws(()=>validateClauseReview(review,facts,{typedBindings:declarations.filter(binding=>
      !(binding.ruleId===typed.canonicalId&&typed.executionEvidence.clauseIds.includes(binding.clauseId)))}));
    mutations.push('removed typed source binding');
    fails('partial source clause falsely executable',r=>{const row=r.records.find(row=>row.executionEvidence?.kind==='TYPED_EFFECT');
      row.executionEvidence.clauseIds=['undeclared-effect'];});
  }
  if(native){assert.throws(()=>validateClauseReview(review,facts,{nativeAbilityBindings:nativeAbilityReview.filter(binding=>binding.id!==native.canonicalId)}));
    mutations.push('removed native ability binding');}
  if(profile){assert.throws(()=>validateClauseReview(review,facts,{nativeProfileBindings:nativeInvulnerableReview.filter(binding=>binding.id!==profile.canonicalId)}));
    mutations.push('removed native model stat binding');}
  return {...report,mutationControls:{pass:mutations.length,total:mutations.length,names:mutations}};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1])console.log(JSON.stringify(runClauseReviewQA(),null,2));
