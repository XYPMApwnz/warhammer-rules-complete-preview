/** Native denominator, exact debt and real-code mutation controls. No producers. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {collectNativeInventory,sourceSnapshot} from '../tools/markup-census/native-inventory.mjs';
import {checkMarkup,decisionKey,KINDS} from '../tools/markup-census/check.mjs';
import {probeConditionComputers} from '../tools/markup-census/computers.mjs';
import {parseProducerJSON} from '../books/shared/source-refs-v2/producer-io.mjs';
import {verifyMarkupEvidence} from '../tools/markup-census/evidence.mjs';

const root=fileURLToPath(new URL('../',import.meta.url)),directory=path.join(root,'tools/markup-census');
const read=name=>JSON.parse(fs.readFileSync(path.join(directory,name+'.v1.json'),'utf8'));
const started=performance.now(),inventory=await collectNativeInventory({root});
const registry=read('decisions'),baseline=read('debt-baseline'),debt=read('debt'),closures=read('closures'),retirements=read('retirements');
const computerAvailability=await probeConditionComputers({inventory,root});
const verifyEvidence=(evidence,row)=>verifyMarkupEvidence({root,evidence,row});
const input={inventory,registry,baseline,debt,closures,retirements,computerAvailability,verifyEvidence};
const result=checkMarkup(input);
// These exact numbers certify the introducing decision ledger, not every
// future reviewed source release. Current HEAD must satisfy the actual registry
// and native denominator below; adding a reviewed rule must not require repins.
const INITIAL='4d49446d8068e57cfa143a698886922a803a0690';
const original=JSON.parse(execFileSync('git',['show',INITIAL+':tools/markup-census/decisions.v1.json'],
 {cwd:root,encoding:'utf8',maxBuffer:16*1024*1024}));
assert.equal(original.records.length,2724,'Accepted initial physical source denominator');
const categories=['EXECUTED','RECIPIENTS_ONLY','TEXT_ONLY_INTENDED','GAP','UNKNOWN'];
const counts=rows=>Object.fromEntries(categories.map(category=>[category,rows.filter(row=>row.category===category).length]));
assert.deepEqual(counts(original.records),{EXECUTED:812,RECIPIENTS_ONLY:1478,TEXT_ONLY_INTENDED:218,GAP:45,UNKNOWN:171},
 'The introducing ledger changes only the authorized Insectile debt from the accepted census');
assert.equal(original.records.filter(row=>row.partial).length,126,'Accepted initial partial marker count');
assert.equal(original.records.filter(row=>!['GAP','UNKNOWN'].includes(row.category)).length,2508);
const retiredKeys=new Set(retirements.records.map(decisionKey));
const current=registry.records.filter(row=>!retiredKeys.has(decisionKey(row)));
assert.equal(result.N,inventory.rows.length,'Complete current native denominator');
assert.equal(result.N,current.length,'Every current decision has a native source');
assert.deepEqual(result.counts,counts(current),'Exact current categories, not frozen release counts');
assert.equal(result.partial,current.filter(row=>row.partial).length);
assert.deepEqual(result.debt,{original:baseline.records.length,active:debt.records.length,closed:closures.records.length});
assert.equal(result.resolved.count,result.N-result.counts.GAP-result.counts.UNKNOWN);
assert.equal(result.summary.length,inventory.books.length*KINDS.length);
assert.equal(inventory.books.length,9);
for(const book of inventory.books){
 assert(book.nativeReads.length,'The actual browser factory must read a native artifact: '+book.book);
 assert(book.nativeReads.includes(book.nativeInput),'The observed native input must be the browser factory input: '+book.book);
}
assert.equal(new Set(inventory.rows.map(decisionKey)).size,result.N);
assert.equal(baseline.records.filter(row=>row.category==='GAP').length,46);
assert.equal(baseline.records.filter(row=>row.category==='UNKNOWN').length,171);
const controls=[];
const reject=(name,code,overrides)=>{
 assert.throws(()=>checkMarkup({...input,...overrides}),error=>error.message.includes('Markup census '+code+':'),
  name+' must fail closed with '+code);
 controls.push({name,code,status:'DETECTED'});
};
const decisionIndex=registry.records.findIndex(row=>row.category==='RECIPIENTS_ONLY'&&row.kind==='ABILITY');
const changeDecision=mutate=>{
 const copy={...registry,records:[...registry.records]},row=structuredClone(copy.records[decisionIndex]);
 copy.records[decisionIndex]=row;mutate(row);return copy;
};
reject('missing reviewed category','UNCLASSIFIED',{registry:changeDecision(row=>{delete row.category;})});
reject('stale accepted source fingerprint','STALE_DECISION',{registry:changeDecision(row=>{row.sourceFingerprint='0'.repeat(64);})});
reject('new GAP outside exact named debt','NEW_DEBT',{registry:changeDecision(row=>{row.category='GAP';})});

// Delete an actual dispatch case in memory. All imports still use the same real
// dependencies; no second implementation or invented roster value is supplied.
const computationFile=path.join(root,'books/shared/roster-v2/condition-computations.mjs');
let code=fs.readFileSync(computationFile,'utf8');
assert.equal(code.split("case 'INITIAL_ATTACHMENT':").length-1,1,'One exact native case for the negative control');
code=code.replace("case 'INITIAL_ATTACHMENT':","case 'REMOVED_INITIAL_ATTACHMENT':");
code=code.replace(/\bfrom\s+(['"])(\.[^'"]+)\1/g,(_all,_quote,specifier)=>'from '+JSON.stringify(new URL(specifier,pathToFileURL(computationFile)).href));
const removed=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const missingComputer=await probeConditionComputers({inventory,root,compute:removed.computeRosterCondition});
assert.equal(missingComputer.find(row=>row.kind==='INITIAL_ATTACHMENT').available,false);
assert(inventory.rows.some(row=>registry.records.find(d=>decisionKey(d)===decisionKey(row))?.category==='EXECUTED'&&
 row.conditions.some(c=>c.declaredComputation?.kind==='INITIAL_ATTACHMENT')),'Mutation must affect a real EXECUTED source rule');
reject('actual INITIAL_ATTACHMENT computer removed from EXECUTED','MISSING_COMPUTER',{computerAvailability:missingComputer});

const bindingFile=path.join(root,'books/shared/roster-v2/condition-binding.mjs');
let bindingCode=fs.readFileSync(bindingFile,'utf8');
assert.equal(bindingCode.split("case 'equipmentBearerSatisfied':").length-1,1);
bindingCode=bindingCode.replace("case 'equipmentBearerSatisfied':","case 'REMOVED_equipmentBearerSatisfied':")
 .replace(/\bfrom\s+(['"])(\.[^'"]+)\1/g,(_all,_quote,specifier)=>'from '+JSON.stringify(new URL(specifier,pathToFileURL(bindingFile)).href));
const removedBinder=await import('data:text/javascript;base64,'+Buffer.from(bindingCode).toString('base64'));
const physicalMissing=await probeConditionComputers({inventory,root,bind:removedBinder.createRosterConditionBinding});
assert(physicalMissing.some(row=>row.key==='equipmentBearerSatisfied'&&!row.available));
reject('actual physical-equipment binder removed from EXECUTED','MISSING_COMPUTER',{computerAvailability:physicalMissing});

// Lose a real source field, then obtain the field metadata from the same native
// source-snapshot reader. Existing record IDs/names cannot hide that loss.
const sourceRow=inventory.rows.find(row=>row.sourceFields.some(field=>JSON.stringify(field)==='["text"]')&&row.sourceField?.[0]==='text');
assert(sourceRow);
const native=parseProducerJSON(fs.readFileSync(path.join(root,sourceRow.nativeInput),'utf8'));
const source=structuredClone((native.book||native).entities.find(entity=>entity.id===sourceRow.sourceEntityId));
assert.equal(typeof source.data.text,'string');delete source.data.text;
const lost=sourceSnapshot(source),changed={...sourceRow,sourceSnapshot:{...sourceRow.sourceSnapshot,
 fields:lost.fields.map(field=>({...field,present:true}))}};
reject('actual accepted source text field lost','SOURCE_FIELD_LOSS',{inventory:{...inventory,
 rows:inventory.rows.map(row=>row===sourceRow?changed:row)}});
const excluded=inventory.exclusions.find(row=>row.ambiguous&&row.kind==='DATASHEET_SECTION');
assert(excluded);
const extra={...excluded,id:'unreviewed-named-section',reason:'Unclassified new named source ability'};
reject('new named rule cannot hide in a known excluded native kind','INCOMPLETE_DENOMINATOR',{inventory:{...inventory,exclusions:[...inventory.exclusions,extra]}});
const blockRow=inventory.rows.find(row=>row.book==='adeptus-mechanicus'&&row.kind==='ABILITY'&&row.sourceField?.[0]==='blocks');
const sourceOwner=inventory.sourceEntities.find(row=>row.book===blockRow.book&&row.id===blockRow.sourceEntityId);
const newField={field:['extraRules',0,'text'],valueFingerprint:'1'.repeat(64),type:'string'};
reject('new source rule field outside the recognized blocks is not omitted','INCOMPLETE_DENOMINATOR',{inventory:{...inventory,
 sourceEntities:inventory.sourceEntities.map(row=>row===sourceOwner?{...row,fields:[...row.fields,newField]}:row)}});
reject('new native rule without decision','UNCLASSIFIED',{inventory:{...inventory,rows:[...inventory.rows,{...inventory.rows[0],id:'unreviewed-new-rule'}]}});
reject('duplicate physical rule occurrence','DUPLICATE_ID',{inventory:{...inventory,rows:[...inventory.rows,inventory.rows[0]]}});
reject('accepted rule disappears without retirement','SOURCE_FIELD_LOSS',{inventory:{...inventory,rows:inventory.rows.slice(1)}});
reject('historical debt item deleted to improve percentage','BASELINE_CHANGED',{baseline:{...baseline,records:baseline.records.slice(1)}});
reject('active debt removed without evidence','UNEXPLAINED_DEBT_REMOVAL',{debt:{...debt,records:debt.records.slice(1)}});
reject('closure without a fixture','MISSING_CLOSURE_EVIDENCE',{closures:{...closures,records:closures.records.map(row=>({...row,evidence:row.evidence.filter(evidence=>evidence.kind!=='fixture')}))}});
reject('unrelated test cannot close debt','MISSING_CLOSURE_EVIDENCE',{verifyEvidence:()=>false});
reject('real unrelated test/common-word identity cannot close debt','MISSING_CLOSURE_EVIDENCE',{closures:{...closures,records:closures.records.map(row=>({...row,
 evidence:row.evidence.map((evidence,i)=>i===0?{kind:'test',path:'tests/markup-census-qa.mjs',identity:'assert'}:evidence)}))}});
console.log(JSON.stringify({status:'PASS',N:result.N,counts:result.counts,partial:result.partial,
 nativeFactories:inventory.books.map(book=>({book:book.book,reads:book.nativeReads})),controls,elapsedMs:Math.round(performance.now()-started)}));
