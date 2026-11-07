/** A supplied execution book must replace the disk input before any read. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createQaTempDir,createQaEvidenceDir,cleanupQaTempDir,assertQaTempPath} from './helpers/qa-temp.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const temporary=createQaTempDir('wh-source-review-execution-'),copy=path.join(temporary,'checkout');
const out=createQaEvidenceDir('wh-source-review-execution-evidence-'),results=[];
let completed=false;
try{
  fs.mkdirSync(copy,{recursive:true});
  for(const relative of execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean)){
    const target=path.join(copy,relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,relative),target);
  }
  const {parseProducerJSON}=await import(pathToFileURL(path.join(copy,'books/shared/source-refs-v2/producer-io.mjs')));
  const {assertBookSourceReview}=await import(pathToFileURL(path.join(copy,'books/shared/roster-v2/source-completeness.mjs')));
  const read=file=>JSON.parse(fs.readFileSync(path.join(copy,file),'utf8'));
  const cases=[
    {bookId:'adeptus-mechanicus',expectation:read('books/adeptus-mechanicus/v2/native-fnp-source-expectations.json')},
    {bookId:'tyranids',expectation:read('books/tyranids/v2/seven-effects-source-expectations.json').cases.find(item=>item.id==='tyr-guardian')}
  ];
  for(const {bookId,expectation}of cases){
    assert(expectation&&expectation.bookId===bookId,'Independent source obligation missing');
    const runtime=path.join(copy,`books/${bookId}/v2/generated/roster-runtime.json`);
    const executionBook=parseProducerJSON(fs.readFileSync(runtime,'utf8'));
    const before=assertBookSourceReview(bookId,{executionBook});
    assert.equal(before.inventoryStatus,'PROVEN');assert.equal(before.status,'PARTIAL');
    const corrupted=structuredClone(executionBook),entity=corrupted.entities.find(item=>item.id===expectation.source.canonicalId);
    const operations=expectation.expectedOperations||[expectation.expectedOperation];
    const candidates=entity.ruleContract.clauses.filter(clause=>(!expectation.expectedClauseId||clause.id===expectation.expectedClauseId)&&
      clause.rosterEffects?.some(effect=>operations.some(expected=>effect.operation===expected.operation&&effect.field===expected.field&&
        (expected.keyword===undefined||effect.keyword===expected.keyword))));
    assert(candidates.length>0,'Remove the independently required executable clauses');
    const removedClauseIds=candidates.map(clause=>clause.id);
    entity.ruleContract.clauses=entity.ruleContract.clauses.filter(clause=>!removedClauseIds.includes(clause.id));
    const rejected=error=>error.message.startsWith('EXECUTABLE_MISSING:');
    assert.throws(()=>assertBookSourceReview(bookId,{executionBook:corrupted}),rejected,'Expected error before removing the disk input');
    assertQaTempPath(runtime);fs.unlinkSync(runtime);
    assert.deepEqual(assertBookSourceReview(bookId,{executionBook}),before,'Missing unused runtime changed the source-review result');
    results.push({bookId,case:'supplied executionBook with absent disk runtime',status:'PASS'});
    assert.throws(()=>assertBookSourceReview(bookId,{executionBook:corrupted}),rejected,'Corrupted executionBook failed for the wrong reason');
    results.push({bookId,case:'required clause removed from supplied executionBook',status:'PASS',detected:'EXECUTABLE_MISSING',removedClauseIds});
    assert.throws(()=>assertBookSourceReview(bookId),error=>error.code==='ENOENT'&&path.resolve(error.path)===path.resolve(runtime),'Missing disk runtime without an override must still fail');
    results.push({bookId,case:'absent disk runtime without executionBook',status:'PASS',detected:'ENOENT'});
  }
  completed=true;console.log(JSON.stringify({status:'PASS',checks:results.length,evidence:out,results}));
}finally{
  fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:completed?'PASS':'FAIL',results},null,2)+'\n');
  cleanupQaTempDir(temporary);
}
