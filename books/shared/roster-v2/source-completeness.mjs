/** Review metadata gate, never a factual producer or an English rule interpreter.
 * Whole factual blocks are pinned independently of executable contracts. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {armyBooks} from '../../../v2/army-books.mjs';
import {resolveExecutionEffect} from './recipient-execution.mjs';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const reviewPath='books/shared/roster-v2/source-completeness-review.json';
const read=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
export const stableJson=value=>JSON.stringify(value,(_,item)=>item&&typeof item==='object'&&!Array.isArray(item)
  ?Object.fromEntries(Object.keys(item).sort().map(key=>[key,item[key]])):item);
export const reviewFingerprint=value=>createHash('sha256').update(stableJson(value)).digest('hex');
const bytesFingerprint=bytes=>createHash('sha256').update(bytes).digest('hex');
const fail=(code,detail)=>{throw new Error(code+': '+detail);};
const requireValue=(condition,code,detail)=>{if(!condition)fail(code,detail);};
const classifications=new Set(['EXECUTABLE_REQUIRED','BATTLE_DEPENDENT','CAPABILITY_MISSING','SOURCE_AMBIGUOUS','UNVERIFIED','NOT_AN_EFFECT']);
const historicalCensus=read('books/shared/roster-v2/source-effect-coverage-baseline.json');
export const canonicalBlockFingerprint=entity=>reviewFingerprint(entity);
const provenanceSourceIds=provenance=>{
  const ids=new Set(),visit=value=>{
    if(Array.isArray(value))value.forEach(visit);
    else if(value&&typeof value==='object'){
      if(typeof value.sourceId==='string')ids.add(value.sourceId);
      Object.values(value).forEach(visit);
    }
  };
  visit(provenance);return [...ids].sort();
};

/** Enrollment plus actual enrolled/provenance artifacts, not stored SHA claims.
 * No captures, baseline refreshes, source edits or network requests occur here. */
export function captureSourceReview(bookId,facts=read(`books/${bookId}/v2/generated/effective.json`)) {
  const enrollmentPath=`books/${bookId}/v2/sources/${bookId==='death-guard'?'source-enrollment':'enrollment'}.json`;
  const enrollment=read(enrollmentPath),files=new Set([enrollmentPath]);
  const visit=value=>{
    if(typeof value==='string'&&/^(?:books|mfm|roster-guides)\//.test(value)){
      const relative=value.split('#')[0],absolute=path.resolve(root,relative);
      if(absolute.startsWith(path.resolve(root)+path.sep)&&fs.existsSync(absolute)&&fs.statSync(absolute).isFile())files.add(relative);
    }else if(Array.isArray(value))value.forEach(visit);
    else if(value&&typeof value==='object')Object.values(value).forEach(visit);
  };
  visit(enrollment);facts.entities.forEach(entity=>visit(entity.provenance));
  return {enrollmentPath,enrollmentFingerprint:reviewFingerprint(enrollment),artifacts:[...files].sort().map(relative=>({
    path:relative,sha256:bytesFingerprint(fs.readFileSync(path.join(root,relative)))
  }))};
}
export function loadIndependentExpectations(review=read(reviewPath)) {
  const result=[];
  for(const relative of review.independentExpectationSources||[]){
    const input=read(relative);
    for(const expectation of input.cases||[input])result.push({...expectation,expectationPath:relative});
  }
  return result;
}
export function loadSourceCompletenessInputs({bookIds=armyBooks.map(book=>book.id)}={}) {
  const review=read(reviewPath),books=bookIds.map(bookId=>{
    requireValue(review.books[bookId],'UNREVIEWED_ARMY_BOOK',bookId);
    const facts=read(`books/${bookId}/v2/generated/effective.json`);
    const runtimeFile=bookId==='death-guard'?'rule-contract-effective':bookId==='emperors-children'?'roster-attachments':bookId==='tau-empire'?'roster-import':'roster-runtime';
    return {bookId,facts,executionBook:read(`books/${bookId}/v2/generated/${runtimeFile}.json`),sourceReview:captureSourceReview(bookId,facts)};
  });
  return {review,books,expectations:loadIndependentExpectations(review),registeredBookIds:armyBooks.map(book=>book.id)};
}

function assertExecutable(clause,expectation,book) {
  const entity=book?.entities.find(entity=>entity.id===expectation.source.canonicalId);
  requireValue(entity,'EXECUTABLE_MISSING',clause.id+' canonical/runtime source');
  requireValue(entity.parentId===expectation.source.ownerId,'WRONG_SOURCE_OWNER',clause.id);
  requireValue(entity.ruleContract,'EXECUTABLE_MISSING',clause.id+' contract');
  const field=expectation.source.field.reduce((value,key)=>value?.[key],entity.data);
  requireValue(field===expectation.source.quote,'INDEPENDENT_SOURCE_MISMATCH',clause.id);
  const clauses=entity.ruleContract.clauses.filter(item=>!expectation.expectedClauseId||item.id===expectation.expectedClauseId);
  const operations=expectation.expectedOperations||[expectation.expectedOperation];
  requireValue(operations.length>0&&operations.every(expected=>expected&&typeof expected.operation==='string'),
    'INDEPENDENT_EXPECTATION_INVALID',clause.id+' typed operation');
  for(const expected of operations){
    const candidates=clauses.flatMap(item=>(item.rosterEffects||[]).filter(effect=>effect.operation===expected.operation&&effect.field===expected.field&&
      (expected.keyword===undefined||effect.keyword===expected.keyword)).map(effect=>({item,effect})));
    requireValue(candidates.length,'EXECUTABLE_MISSING',clause.id+' '+expected.operation);
    for(const {item,effect:declaration}of candidates){
      const effect=resolveExecutionEffect(entity,item,declaration);
      requireValue(item.rosterClassification==='ROSTER_EXECUTABLE','EXECUTABLE_MISSING',clause.id+' non-executable clause');
      for(const [key,value]of Object.entries(expected))requireValue(stableJson(effect[key])===stableJson(value),'INDEPENDENT_EFFECT_MISMATCH',clause.id+' '+key);
      requireValue(['MODEL','UNIT'].includes(effect.targetSubject)&&typeof effect.targetBinding==='string','RECIPIENT_MISSING',clause.id);
    }
  }
  // A native numeric occurrence and its grant are separate bindings. Their
  // exact occurrence identities remain source-owned; captions do not join them.
  for(const native of expectation.nativeSources||[]){
    const seed=book.rosterReferenceSemantics?.[native.canonicalId]?.abilities?.find(ability=>ability.id===native.entryId);
    requireValue(seed?.value===expectation.nativeValue&&seed.name==='Feel No Pain','EXECUTABLE_MISSING',clause.id+' native '+native.entryId);
  }
}

/** Pure, injectable comparison used by normal builds and in-memory mutations.
 * An explicit UNVERIFIED disposition is a limitation, never semantic PASS. */
export function assertSourceCompletenessGate({review,books,expectations,registeredBookIds,
  verifiedIds=[],requireRuntime=false,checkAllRegistrations=true}) {
  requireValue(review.schema==='source-to-contract-review/v1','INVALID_REVIEW_SCHEMA',review.schema);
  requireValue(review.fingerprintBasis==='COMPLETE_CANONICAL_ENTITY_V1','INVALID_REVIEW_SCHEMA','canonical fingerprint basis');
  if(checkAllRegistrations){
    requireValue(new Set(registeredBookIds).size===registeredBookIds.length,'DUPLICATE_ARMY_BOOK','registry');
    for(const id of registeredBookIds)requireValue(review.books[id],'UNREVIEWED_ARMY_BOOK',id);
    requireValue(Object.keys(review.books).every(id=>registeredBookIds.includes(id)),'REVIEW_REGISTRY_MISMATCH','retired/omitted owner');
  }
  const statuses={},allClauses=[],seenClauses=new Set(),bookIds=new Set(books.map(book=>book.bookId));
  let blockCount=0;
  for(const input of books){
    const reviewed=review.books[input.bookId];requireValue(reviewed,'UNREVIEWED_ARMY_BOOK',input.bookId);
    requireValue(stableJson(reviewed.sourceReview)===stableJson(input.sourceReview),'UNREVIEWED_SOURCE_REVISION',input.bookId);
    const blocks=new Map(reviewed.blocks.map(block=>[block.canonicalId,block])),current=new Set();
    requireValue(blocks.size===reviewed.blocks.length,'DUPLICATE_SOURCE_BLOCK',input.bookId);
    for(const entity of input.facts.entities){
      requireValue(!current.has(entity.id),'DUPLICATE_SOURCE_BLOCK',input.bookId+'/'+entity.id);current.add(entity.id);
      const block=blocks.get(entity.id);requireValue(block,'UNREVIEWED_SOURCE_RULE',input.bookId+'/'+entity.id);
      requireValue(block.kind===entity.kind&&block.owner===(entity.parentId??entity.ownerId??null),
        'WRONG_CLASSIFICATION_OWNER',input.bookId+'/'+entity.id+' block kind/owner');
      requireValue(block.fingerprint===canonicalBlockFingerprint(entity),'UNREVIEWED_SOURCE_BLOCK',input.bookId+'/'+entity.id);
      requireValue(block.provenance.canonicalFactId===entity.id&&block.provenance.sha256===reviewFingerprint(entity.provenance),'UNREVIEWED_SOURCE_BLOCK',entity.id+' provenance');
      requireValue(stableJson(block.provenance.sourceIds)===stableJson(provenanceSourceIds(entity.provenance)),
        'UNREVIEWED_SOURCE_BLOCK',entity.id+' provenance source IDs');
      requireValue(block.clauses.length,'UNREVIEWED_SOURCE_RULE',entity.id+' classification missing');
      for(const clause of block.clauses){
        requireValue(clause.canonicalId===entity.id,'WRONG_CLASSIFICATION_OWNER',clause.id);
        allClauses.push({clause,book:input.executionBook,bookId:input.bookId});
      }
      blockCount++;
    }
    for(const id of blocks.keys())requireValue(current.has(id),'UNREVIEWED_SOURCE_REMOVAL',input.bookId+'/'+id);
    for(const clause of reviewed.orphanClauses||[]){
      requireValue(clause.canonicalId===null&&clause.classification==='SOURCE_AMBIGUOUS','INVALID_ORPHAN_REVIEW',clause.id);
      allClauses.push({clause,book:input.executionBook,bookId:input.bookId});
    }
  }
  const expectedById=new Map(expectations.map(item=>[item.id,item]));
  requireValue(expectedById.size===expectations.length,'DUPLICATE_EXPECTATION','case ID');
  // The accepted census independently pins semantic row identities. A block
  // fingerprint alone cannot detect deletion of one reviewed sibling clause
  // while another clause remains. Do not reconstruct this list from contracts.
  requireValue(bytesFingerprint(Buffer.from(JSON.stringify(historicalCensus.historicalRows)))===historicalCensus.historicalRowsSha256,
    'HISTORICAL_CENSUS_CHANGED','accepted row integrity');
  requireValue(review.authority.censusSha256===historicalCensus.auditCsvSha256,
    'HISTORICAL_CENSUS_CHANGED','review authority');
  const historicalRows=historicalCensus.historicalRows.filter(row=>bookIds.has(row.bookId));
  const historicalById=new Map(historicalRows.map(row=>[row.id,row]));
  requireValue(historicalById.size===historicalRows.length,'HISTORICAL_CENSUS_CHANGED','duplicate row identity');
  const reviewedRows=new Map();
  for(const {clause,bookId}of allClauses){
    if(clause.reviewReference?.kind!=='ACCEPTED_HISTORICAL_CENSUS')continue;
    const row=historicalById.get(clause.reviewReference.auditRowId);
    requireValue(row&&!reviewedRows.has(row.id),'HISTORICAL_REVIEW_MISMATCH',clause.id+' unknown/duplicate row');
    requireValue(clause.id===row.id&&bookId===row.bookId&&clause.canonicalId===row.canonicalId&&
      clause.sourceClauseIdentity===row.clause&&clause.semanticClauseIdentity===row.id+'::'+row.clause&&
      clause.historicalClassification===row.baselineClassification&&clause.historicallyRequired===row.required&&
      clause.reviewReference.csvSha256===historicalCensus.auditCsvSha256,
      'HISTORICAL_REVIEW_MISMATCH',clause.id+' accepted identity/classification');
    const independent=expectedById.get(clause.independentExpectation?.caseId);
    if(!independent&&clause.classification!=='EXECUTABLE_REQUIRED'){
      const allowed=row.baselineClassification==='CAPABILITY_MISSING'?['CAPABILITY_MISSING']:
        row.baselineClassification==='SOURCE_AMBIGUOUS'?['SOURCE_AMBIGUOUS']:
        row.baselineClassification==='DECLARATIVE_CORRECT'?['BATTLE_DEPENDENT','UNVERIFIED']:['UNVERIFIED'];
      requireValue(allowed.includes(clause.classification),'UNREVIEWED_CLASSIFICATION_CHANGE',clause.id);
    }
    reviewedRows.set(row.id,clause);
  }
  for(const row of historicalRows)requireValue(reviewedRows.has(row.id),'HISTORICAL_REVIEW_MISSING',row.id);
  const executable=[];
  for(const {clause,book,bookId}of allClauses){
    requireValue(!seenClauses.has(bookId+'\0'+clause.id),'DUPLICATE_SEMANTIC_CLAUSE',clause.id);seenClauses.add(bookId+'\0'+clause.id);
    requireValue(classifications.has(clause.classification)&&clause.sourceIdentity&&clause.semanticClauseIdentity&&
      clause.explanation&&Object.hasOwn(clause,'owner')&&clause.recipient&&clause.activationConditions&&clause.reviewReference,
    'UNREVIEWED_CLAUSE',clause.id);
    statuses[clause.classification]=(statuses[clause.classification]||0)+1;
    requireValue(!clause.historicallyRequired||!['BATTLE_DEPENDENT','NOT_AN_EFFECT'].includes(clause.classification),
      'REQUIRED_CLASSIFICATION_MISMATCH',clause.id+' accepted roster-known requirement');
    if(clause.classification!=='EXECUTABLE_REQUIRED')continue;
    const reference=clause.independentExpectation,expectation=expectedById.get(reference?.caseId);
    requireValue(expectation,'INDEPENDENT_EXPECTATION_MISSING',clause.id);
    const {expectationPath,...independent}=expectation;
    requireValue(expectationPath===reference.path&&reviewFingerprint(independent)===reference.sha256,'UNREVIEWED_EXPECTATION',clause.id);
    requireValue(expectation.bookId===bookId&&expectation.source.canonicalId===clause.canonicalId&&clause.owner===expectation.source.ownerId,
      'WRONG_SOURCE_OWNER',clause.id);
    requireValue(clause.linkedImplementation?.canonicalId===clause.canonicalId,'EXECUTABLE_MISSING',clause.id+' implementation link');
    assertExecutable(clause,expectation,book);executable.push(expectation.id);
    if(requireRuntime)requireValue(verifiedIds.includes(expectation.id),'RUNTIME_PRESENTATION_NOT_VERIFIED',clause.id);
  }
  // Independent expected obligations cannot be downgraded by editing only the
  // classification list. They come from separately accepted source expectations.
  for(const expectation of expectations.filter(item=>bookIds.has(item.bookId))){
    const matches=allClauses.filter(({clause})=>clause.independentExpectation?.caseId===expectation.id);
    requireValue(matches.length===1&&matches[0].clause.classification==='EXECUTABLE_REQUIRED','REQUIRED_CLASSIFICATION_MISMATCH',expectation.id);
  }
  return {status:'PARTIAL',inventoryStatus:'PROVEN',books:books.length,blocks:blockCount,clauses:allClauses.length,
    classifications:statuses,executableVerified:requireRuntime?executable.length:0,executableBindingsChecked:executable.length,
    semanticCompleteness:'NOT_PROVEN',historicalEvidence:'Retained, not automatically promoted to current semantic PASS'};
}
export function assertBookSourceReview(bookId,{executionBook}={}) {
  const inputs=loadSourceCompletenessInputs({bookIds:[bookId]});
  if(executionBook)inputs.books[0].executionBook=executionBook;
  return assertSourceCompletenessGate({...inputs,checkAllRegistrations:false});
}
