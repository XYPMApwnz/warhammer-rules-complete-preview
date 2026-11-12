/** Update selection follows reviewed declarations without changing the rebuild gate. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {BOOK_PASSPORT_IDS,readBookPassport} from '../books/shared/tools/book-passport.mjs';
import {generatedRebuildPlan} from '../books/shared/tools/generated-rebuild-plan.mjs';
import {bookUpdateDeclarations,selectBookUpdate,validateUpdateInputs,validateUpdateOperations} from '../books/shared/tools/book-update-declarations.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const tracked=execFileSync('git',['ls-tree','-r','--name-only','-z','HEAD'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024}).split('\0').filter(Boolean);
const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/book-passport-baseline.json',import.meta.url),'utf8'));
const plan=generatedRebuildPlan(tracked,{root});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
assert.equal(plan.steps.length,baseline.baselinePlan.steps,'Update metadata must not add or remove gate producers');
assert.equal(plan.files.length,baseline.baselinePlan.files,'Update metadata must not change gate coverage');
assert.equal(sha(JSON.stringify(plan)),baseline.baselinePlan.sha256,'Update metadata must preserve the exact accepted rebuild plan');

const results=[],mutations=[];
for(const id of BOOK_PASSPORT_IDS){
 const config=JSON.parse(fs.readFileSync(path.join(root,'books',id,'book.config.json'),'utf8'));
 const passport=readBookPassport(id,{root,config});
 assert.equal(passport.qa.onInputChange.currentMfmRelease,'qa:mfm-current','MFM changes must select the reviewed current-release suite');
 assert(passport.build.steps.some(s=>s.outputs.includes(passport.update.reportArtifact))||passport.build.postBuildSteps.some(p=>p.step.outputs.includes(passport.update.reportArtifact)),`${id}: report input must be a declared producer output`);
 const reject=(name,field,mutate,reason)=>{
  const poisoned=structuredClone(config);mutate(poisoned);
  assert.throws(()=>readBookPassport(id,{root,config:poisoned}),error=>{
   assert(error instanceof Error);
   assert(error.message.includes('Book passport '+id+':'),`${name}: missing book name: ${error.message}`);
   assert(error.message.includes(field),`${name}: missing field ${field}: ${error.message}`);
   assert(reason.test(error.message),`${name}: wrong diagnostic: ${error.message}`);
   return true;
  },`${id}: ${name} mutation must be rejected`);
  mutations.push({book:id,control:name,field,status:'REJECTED'});
 };
 reject('missing-trigger-map','passport.qa.onInputChange',c=>{delete c.passport.qa.onInputChange;},/required field is missing/);
 reject('missing-current-MFM-trigger','passport.qa.onInputChange.currentMfmRelease',c=>{delete c.passport.qa.onInputChange.currentMfmRelease;},/required field is missing/);
 reject('unknown-trigger','passport.qa.onInputChange.unregisteredInput',c=>{c.passport.qa.onInputChange.unregisteredInput='qa:mfm-current';},/unknown field/);
 reject('unknown-trigger-script','passport.qa.onInputChange.currentMfmRelease',c=>{c.passport.qa.onInputChange.currentMfmRelease='qa:nonexistent-book-update-suite';},/unknown QA script/);
 reject('unknown-update-field','passport.update.unregisteredField',c=>{c.passport.update.unregisteredField=true;},/unknown field/);
 reject('missing-report-artifact','passport.update.reportArtifact',c=>{delete c.passport.update.reportArtifact;},/required field is missing/);
 reject('undeclared-report-artifact','passport.update.reportArtifact',c=>{c.passport.update.reportArtifact=`books/${id}/v2/generated/undeclared-book-update-report.json`;},/not a declared book output/);
 results.push({book:id,status:'PASS',script:passport.qa.script,changedMfmScript:passport.qa.onInputChange.currentMfmRelease,reportArtifact:passport.update.reportArtifact});
}

const label='Shared declaration mutation';
function rejectInput(name,inputs,reason){
 assert.throws(()=>validateUpdateInputs(inputs,{root,steps:plan.steps,label}),error=>{
  assert(error instanceof Error&&error.message.startsWith(label+':'),`${name}: missing declaration label`);
  assert(reason.test(error.message),`${name}: wrong diagnostic: ${error.message}`);
  return true;
 },`${name}: invalid update input survived`);
 mutations.push({control:name,status:'REJECTED'});
}
rejectInput('empty-input-list',[],/non-empty array/);
rejectInput('unknown-input-field',[{kind:'path',value:'package.json',extra:true}],/unknown input field/);
rejectInput('unknown-input-kind',[{kind:'inferredFromFileName',value:'package.json'}],/unknown input kind/);
rejectInput('unknown-output-group',[{kind:'bookOutputs',value:'some-books'}],/invalid output group/);
rejectInput('unknown-producer',[{kind:'stepOutputs',value:'books/shared/tools/nonexistent-update-producer.mjs'}],/unknown producer input/);
for(const value of ['../outside.json','/books/outside.json','C:/outside.json','books\\outside.json'])
 rejectInput('unsafe-input-path '+value,[{kind:'path',value}],/unsafe input/);
rejectInput('nonexistent-input-path',[{kind:'path',value:'books/shared/nonexistent-book-update-input.json'}],/input path/);
rejectInput('nonexistent-input-prefix',[{kind:'prefix',value:'books/nonexistent-book-update-input/'}],/input path/);

const declarations=bookUpdateDeclarations({root,tracked,plan});
const stabilization=declarations.shared.find(row=>row.operations.rebuildAfterChange);
assert.deepEqual(stabilization.operations.rebuildAfterChange,{scope:'selected-plan',maxPasses:2});
for(const [name,mutate]of[
 ['unbounded-rebuild',ops=>{ops.rebuildAfterChange.maxPasses=Infinity;}],
 ['unknown-rebuild-scope',ops=>{ops.rebuildAfterChange.scope='guessed-producers';}],
 ['unknown-rebuild-field',ops=>{ops.rebuildAfterChange.extra=true;}],
 ['unknown-operation',ops=>{ops.arbitraryCommand=[];}]
]){const ops=structuredClone(stabilization.operations);mutate(ops);assert.throws(()=>validateUpdateOperations(ops,{step:stabilization.step,label:name}),new RegExp(name+':'));mutations.push({control:name,status:'REJECTED'});}
assert.deepEqual(declarations.books.map(b=>b.id),BOOK_PASSPORT_IDS,'All nine public books must have update declarations');
const reader='books/core-rules/reader/build.mjs';
const glossary='glossary/v2/tools/build-glossary-v2.mjs';
const registry=['tools/audit/build-source-catalog-additions.mjs','tools/audit/build-source-catalog.mjs'];
const dg=selectBookUpdate(declarations,{books:['death-guard'],changed:['books/death-guard/content/official-update-ledger.en.json']});
assert.deepEqual(dg.books,['death-guard'],'A local DG update must not rebuild unrelated Army Books');
assert(dg.shared.includes(glossary),'Changed book outputs must refresh the shared glossary');
for(const producer of registry)assert(dg.shared.includes(producer),'Changed book outputs must validate their registry: '+producer);
assert(!dg.shared.includes(reader),'A local Army change must not rebuild the unchanged Core reader');
assert.equal(dg.fullPlan,false);
const sm=selectBookUpdate(declarations,{books:['space-marines']});
assert.deepEqual(new Set(sm.books),new Set(['space-marines','blood-angels','dark-angels']),'SM updates must include both supplements through declared ownership');
assert(!sm.shared.includes(reader));
const all=selectBookUpdate(declarations,{all:true});
assert.deepEqual(new Set(all.books),new Set(BOOK_PASSPORT_IDS));
assert(!all.shared.includes(reader),'--all books does not mean unchanged Core');
const core=selectBookUpdate(declarations,{books:['death-guard'],changed:['books/core-rules/content/core-rules.digital-11e.json']});
assert(core.shared.includes(reader),'A changed Core input must select its reader');
const mfm=selectBookUpdate(declarations,{books:['death-guard'],changed:['mfm/current.json']});
assert.deepEqual(new Set(mfm.books),new Set(BOOK_PASSPORT_IDS),'The shared current MFM input affects all declared books');
assert(!mfm.shared.includes(reader),'MFM does not alter Core reader inputs');
const unknown='unregistered-input-for-book-update.json';
const fallback=selectBookUpdate(declarations,{books:['death-guard'],changed:[unknown]});
assert.equal(fallback.fullPlan,true,'An uncovered changed input requires the full existing plan');
assert.deepEqual(fallback.uncovered,[unknown]);
assert.equal(fallback.fallbackReason,'Uncovered changed inputs; running the full declared plan: '+unknown);
assert.deepEqual(fallback.steps,plan.steps,'Fallback must use the complete declared plan, in its original order');
assert.throws(()=>selectBookUpdate(declarations,{books:['unregistered-book']}),/Unknown book: unregistered-book/);
assert.throws(()=>selectBookUpdate(declarations),/Choose --book=<id> or --all/);

console.log(JSON.stringify({status:'PASS',books:results,negativeControls:mutations.length,mutations,
 selection:{dg:dg.steps.length,smBooks:sm.books,allBooks:all.books.length,coreReaderOnCoreChange:core.shared.includes(reader),mfmBooks:mfm.books.length,fallbackReason:fallback.fallbackReason},
 unchangedGate:{steps:plan.steps.length,files:plan.files.length,sha256:sha(JSON.stringify(plan))}},null,2));
