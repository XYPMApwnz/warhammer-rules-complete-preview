/** Passport routes must be complete and strict without changing accepted inputs. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {BOOK_PASSPORT_IDS,bookPassportSchema,readBookPassport} from '../books/shared/tools/book-passport.mjs';
import {generatedRebuildPlan} from '../books/shared/tools/generated-rebuild-plan.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/book-passport-baseline.json',import.meta.url)));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const configs=new Map(BOOK_PASSPORT_IDS.map(id=>[id,JSON.parse(fs.readFileSync(path.join(root,'books',id,'book.config.json'),'utf8'))]));
assert.equal(baseline.schema,'book-passport-baseline/v1');
assert.equal(baseline.base,'913cfef538bc96b7f2d9b55e21995c631cabffeb');
assert.deepEqual(BOOK_PASSPORT_IDS,baseline.bookIds,'Public book identity/order changed');
assert.equal(configs.size,9,'All nine books need the same passport schema');
const results=[],controls={};
const fieldPath=parts=>parts.reduce((text,part)=>typeof part==='number'?`${text}[${part}]`:text?text+'.'+part:part,'');
const at=(value,parts)=>parts.reduce((host,key)=>host[key],value);
function reject(id,kind,parts,mutate,reason){
 const config=structuredClone(configs.get(id));mutate(config);
 assert.throws(()=>readBookPassport(id,{root,config}),error=>{
  assert(error instanceof Error,`${id}: ${kind} did not produce an Error`);
  assert(error.message.includes('Book passport '+id+':'),`${kind}: missing book name in ${error.message}`);
  assert(error.message.includes(fieldPath(parts)),`${kind}: missing field ${fieldPath(parts)} in ${error.message}`);
  assert(error.message.includes(reason),`${kind}: wrong diagnostic ${error.message}`);
  return true;
 },`${id}: ${kind} mutation survived`);
 controls[kind]=(controls[kind]||0)+1;
}
function schemaControls(id,value,rule,parts){
 if(rule.type==='nullable'){if(value!==null)schemaControls(id,value,rule.rule,parts);return;}
 if(rule.type==='object'){
  reject(id,'unknown-passport-field',[...parts,'unexpectedPassportField'],config=>{
   at(config,parts).unexpectedPassportField=true;
  },'unknown field');
  for(const[key,child]of Object.entries(rule.fields)){
   reject(id,'missing-passport-field',[...parts,key],config=>{delete at(config,parts)[key];},'required field is missing');
   schemaControls(id,value[key],child,[...parts,key]);
  }
 }else if(rule.type==='array')value.forEach((item,index)=>schemaControls(id,item,rule.items,[...parts,index]));
}
for(const id of BOOK_PASSPORT_IDS){
 const config=configs.get(id),expected=baseline.books.find(row=>row.id===id);
 assert(expected,`${id}: missing immutable baseline`);
 const oldBytes=execFileSync('git',['show',baseline.base+':'+expected.configPath],{cwd:root,maxBuffer:16*1024*1024});
 assert.equal(sha(oldBytes),expected.gitBytesSha256,`${id}: baseline Git config bytes changed`);
 const oldConfig=JSON.parse(oldBytes),legacy={...config};delete legacy.passport;
 assert.deepEqual(Object.keys(legacy),expected.legacyKeys,`${id}: added or removed an existing config field`);
 assert.equal(sha(JSON.stringify(oldConfig)),expected.legacyPayloadSha256,`${id}: fixture does not describe the base config`);
 assert.equal(sha(JSON.stringify(legacy)),expected.legacyPayloadSha256,`${id}: existing config values/order changed`);
 for(const[key,value]of Object.entries(legacy))assert.equal(sha(JSON.stringify(value)),expected.legacyFieldSha256[key],`${id}: legacy ${key} changed`);
 const before=JSON.stringify(config),passport=readBookPassport(id,{root,config});
 assert.deepEqual(passport,config.passport,`${id}: reading passport transformed declarations`);
 assert.equal(JSON.stringify(config),before,`${id}: reader modified its input`);
 assert.deepEqual(readBookPassport(id,{root}),passport,`${id}: file and explicit config readers disagree`);
 passport.build.steps[0].args.push('--synthetic-reader-isolation-control');
 assert.deepEqual(readBookPassport(id,{root,config}),config.passport,`${id}: returned passport aliases source config`);
 schemaControls(id,config.passport,bookPassportSchema,['passport']);
 reject(id,'missing-passport',['passport'],c=>{delete c.passport;},'required field is missing');
 reject(id,'unknown-config-field',['unexpectedConfigField'],c=>{c.unexpectedConfigField=true;},'unknown field');
 reject(id,'unknown-build-path',['passport','build','steps',0,'producer'],c=>{
  c.passport.build.steps[0].producer=`books/${id}/v2/nonexistent-passport-producer.mjs`;
 },'unknown build path');
 for(const unsafe of ['../book.config.json','/books/outside.json','C:/outside.json','books/../outside.json','books//outside.json','books\\outside.json'])
  reject(id,'unsafe-path',['passport','sources','enrollment'],c=>{c.passport.sources.enrollment=unsafe;},'unsafe repository path');
 reject(id,'duplicate-output',['passport','build','steps','outputs'],c=>{
  const first=c.passport.build.steps[0];first.outputs.push(first.outputs[0]);
 },'duplicate output');
 reject(id,'foreign-step-owner',['passport','build','steps','book'],c=>{
  c.passport.build.steps[0].book='foreign-book';
 },'producer belongs to another book');
 reject(id,'foreign-output-owner',['passport','build','steps','outputs'],c=>{
  c.passport.build.steps[0].outputs[0]='books/foreign-book/v2/generated/effective.json';
 },'output belongs to another book');
 reject(id,'foreign-config-owner',['id'],c=>{c.id='foreign-book';},'config owner does not match requested book');
 reject(id,'wrong-producer-runtime',['passport','build','steps','runtime'],c=>{
  const first=c.passport.build.steps[0];first.runtime=first.runtime==='python'?'node':'python';
 },'runtime does not match producer');
 results.push({book:id,status:'PASS',producers:config.passport.build.steps.length,legacyFields:expected.legacyKeys.length});
}
const tracked=execFileSync('git',['ls-tree','-r','--name-only','-z',baseline.base],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024}).split('\0').filter(Boolean);
const plan=generatedRebuildPlan(tracked,{root});
assert.equal(plan.steps.length,baseline.baselinePlan.steps,'Producer count changed');
assert.equal(plan.files.length,baseline.baselinePlan.files,'Compared output count changed');
assert.equal(sha(JSON.stringify(plan)),baseline.baselinePlan.sha256,'Producer order, arguments, outputs or comparison policy changed from the immutable baseline');
console.log(JSON.stringify({status:'PASS',books:results,controls,negativeControls:Object.values(controls).reduce((sum,value)=>sum+value,0),baseline:baseline.base,unchangedPlan:{steps:plan.steps.length,files:plan.files.length,sha256:baseline.baselinePlan.sha256}},null,2));
