/** Update policy is data. The committed rebuild gate retains its existing shape. */
import path from 'node:path';
import fs from 'node:fs';
import {readBookPassport,BOOK_PASSPORT_IDS} from './book-passport.mjs';
import {generatedRebuildPlan} from './generated-rebuild-plan.mjs';

const input=(kind,value)=>({kind,value});
const coreInputs=[input('prefix','books/core-rules/content/'),input('path','books/core-rules/tools/verify_pdf_parity.mjs'),input('prefix','books/core-rules/sources/')];
// These are the existing shared producers, not a second producer chain.
const sharedInputs={
 'books/core-rules/tools/build_waha_core_corpus.py':[input('prefix','books/core-rules/sources/'),input('prefix','books/core-rules/tools/')],
 'books/core-rules/tools/build_core_candidate.py':[input('stepOutputs','books/core-rules/tools/build_waha_core_corpus.py'),input('prefix','books/core-rules/tools/'),input('prefix','books/core-rules/tests/fixtures/'),input('prefix','books/core-rules/sources/core-importer-baselines/')],
 'books/core-rules/tools/publish_core_candidate.py':[input('stepOutputs','books/core-rules/tools/build_core_candidate.py'),input('prefix','books/core-rules/tools/')],
 'books/core-rules/reader/build.mjs':[...coreInputs,input('prefix','books/core-rules/reader/'),input('path','books/shared/runtime-asset-versions.json')],
 'glossary/v2/tools/build-glossary-v2.mjs':[input('bookOutputs','*'),...coreInputs,input('prefix','glossary/v2/')],
 'books/core-rules/tests/core-waha-player-visible-reference-census-qa.mjs':[...coreInputs,input('stepOutputs','books/core-rules/reader/build.mjs'),input('prefix','books/core-rules/tests/')],
 'tools/audit/build-source-catalog-additions.mjs':[input('allOutputs','*'),input('path','books/shared/source-refs-v2/source-catalog.json'),input('prefix','books/shared/source-refs-v2/'),input('prefix','tools/audit/')],
 'tools/audit/build-source-catalog.mjs':[input('allOutputs','*'),input('path','books/shared/source-refs-v2/source-catalog.json'),input('prefix','books/shared/source-refs-v2/'),input('prefix','tools/audit/')]
};
const sharedOperations={
 'tools/audit/build-source-catalog-additions.mjs':{
  updateArgs:['--out={work}/source-catalog-delta.json','--inputs={checkout}','--baseline={head}'],checkArgs:['--check']},
 'tools/audit/build-source-catalog.mjs':{
  updateArgs:['--write','--merge={work}/source-catalog-delta.json','--inputs={checkout}'],checkArgs:['--check']}
};
const freshnessOutputs={
 'tools/audit/build-source-catalog-additions.mjs':['books/shared/source-refs-v2/source-catalog.json']
};
const globalInputs=[input('prefix','books/shared/'),input('prefix','mfm/'),input('path','package.json'),input('path','requirements-army-books.txt')];
const safe=value=>typeof value==='string'&&value&&!value.includes('\\')&&!value.includes(':')&&!path.posix.isAbsolute(value)&&!value.split('/').some(p=>p==='.'||p==='..');
export function validateUpdateInputs(inputs,{steps,label,root}){
 if(!Array.isArray(inputs)||!inputs.length)throw Error(label+': inputs must be a non-empty array');
 for(const row of inputs){
  if(!row||Object.keys(row).sort().join(',')!=='kind,value')throw Error(label+': unknown input field');
  if(!['path','prefix','stepOutputs','bookOutputs','allOutputs'].includes(row.kind))throw Error(label+': unknown input kind '+row.kind);
  if(['bookOutputs','allOutputs'].includes(row.kind)){if(row.value!=='*')throw Error(label+': invalid output group');}
  else if(!safe(row.value))throw Error(label+': unsafe input '+row.value);
  if(root&&['path','prefix'].includes(row.kind)&&!fs.existsSync(path.join(root,row.value)))throw Error(label+': unknown input path '+row.value);
  if(row.kind==='stepOutputs'&&!steps.some(s=>s.producer===row.value))throw Error(label+': unknown producer input '+row.value);
 }
}
export function bookUpdateDeclarations({root,tracked,plan=generatedRebuildPlan(tracked,{root})}={}){
 const books=BOOK_PASSPORT_IDS.map(id=>({id,passport:readBookPassport(id,{root}),inputs:[input('prefix',`books/${id}/`),...globalInputs]}));
 const shared=plan.steps.filter(s=>!BOOK_PASSPORT_IDS.includes(s.book)).map(step=>{
  const inputs=sharedInputs[step.producer];
  if(!inputs)throw Error('Book update declaration missing for shared producer: '+step.producer);
  return{step,inputs,freshnessOutputs:freshnessOutputs[step.producer]??step.outputs,operations:sharedOperations[step.producer]??{updateArgs:step.args,checkArgs:null}};
 });
 for(const book of books)validateUpdateInputs(book.inputs,{steps:plan.steps,label:'Book '+book.id,root});
 for(const row of shared){
  validateUpdateInputs(row.inputs,{steps:plan.steps,label:'Shared '+row.step.producer,root});
  if(!row.freshnessOutputs.length||row.freshnessOutputs.some(f=>!plan.files.includes(f)))throw Error('Invalid shared freshness output: '+row.step.producer);
  for(const key of Object.keys(row.operations))if(!['updateArgs','checkArgs'].includes(key))throw Error('Unknown update operation: '+row.step.producer+' '+key);
  for(const key of ['updateArgs','checkArgs'])if(row.operations[key]!==null&&(!Array.isArray(row.operations[key])||row.operations[key].some(a=>typeof a!=='string'||/\{(?!work\}|checkout\}|head\})/.test(a))))throw Error('Invalid '+key+': '+row.step.producer);
 }
 return{schema:'book-update-declarations/v1',books,shared,plan,checkSharedSteps:false};
}
function matches(input,file,declarations){
 if(input.kind==='path')return file===input.value;
 if(input.kind==='prefix')return file.startsWith(input.value);
 if(input.kind==='bookOutputs')return declarations.books.some(b=>[...b.passport.build.steps,...b.passport.build.postBuildSteps.map(p=>p.step)].some(s=>s.outputs.includes(file)));
 if(input.kind==='stepOutputs')return declarations.plan.steps.some(s=>s.producer===input.value&&s.outputs.includes(file));
 return declarations.plan.files.includes(file);
}
export const sharedStepAffected=(row,files,declarations)=>files.some(file=>row.inputs.some(input=>matches(input,file,declarations)));
export function declaredInputFiles(row,declarations,tracked){
 return tracked.filter(file=>!row.step.outputs.includes(file)&&row.inputs.some(input=>matches(input,file,declarations)));
}
export function selectBookUpdate(declarations,{books=[],all=false,changed=[]}={}){
 const ids=new Set(declarations.books.map(b=>b.id));
 if(!all&&!books.length)throw Error('Choose --book=<id> or --all');
 for(const id of books)if(!ids.has(id))throw Error('Unknown book: '+id);
 const uncovered=changed.filter(file=>!declarations.books.some(b=>b.inputs.some(i=>matches(i,file,declarations)))&&!declarations.shared.some(s=>s.inputs.some(i=>matches(i,file,declarations))));
 const full=uncovered.length>0,selected=new Set(full||all?ids:books);
 for(const b of declarations.books)if(changed.some(file=>b.inputs.some(i=>matches(i,file,declarations))))selected.add(b.id);
 for(let again=true;again;){again=false;for(const b of declarations.books)if(!selected.has(b.id)&&b.passport.inheritance.owners.some(owner=>selected.has(owner))){selected.add(b.id);again=true;}}
 const shared=new Set(),affected=new Set(changed);
 for(const step of declarations.plan.steps)if(selected.has(step.book))for(const output of step.outputs)affected.add(output);
 for(let again=true;again;){again=false;for(const row of declarations.shared)if(!shared.has(row.step.producer)&&(full||[...affected].some(f=>row.inputs.some(i=>matches(i,f,declarations))))){shared.add(row.step.producer);for(const f of row.step.outputs)affected.add(f);again=true;}}
 return{books:[...selected],steps:declarations.plan.steps.filter(s=>selected.has(s.book)||shared.has(s.producer)),shared:[...shared],uncovered,fullPlan:full,fallbackReason:uncovered.length?'Uncovered changed inputs; running the full declared plan: '+uncovered.join(', '):null};
}
