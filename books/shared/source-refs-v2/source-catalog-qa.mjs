/** Actual published-source metadata and cold-load tamper controls. No full QA. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {readSourceRefs,sourceSnapshot,cloneSourceBook,getSourceBindings} from './source-refs.mjs';
import {catalogValue} from './source-catalog.mjs';
const here=fileURLToPath(new URL('./',import.meta.url));
const book=JSON.parse(fs.readFileSync(new URL('../../chaos-space-marines/v2/generated/roster-runtime.json',import.meta.url)));
let actual;
function walk(value){if(!value||typeof value!=='object'||actual)return;if(value.sourceRefs?.[0]?.documentId&&value.sourceRefs[0].locators?.length&&value.sourceBindings){actual=value;return;}for(const child of Object.values(value))walk(child);}
walk(book);assert.ok(actual,'Actual source-bound CSM record with a locator');
const controls=[],reject=(name,change)=>{
 const record=structuredClone(actual);readSourceRefs(record,{book});
 if(name==='mutable shared locator denied')assert.throws(()=>change(record),TypeError,name);
 else{change(record);assert.throws(()=>readSourceRefs(record,{book}),/source|Source|Invalid/,name);}
 controls.push({name,status:'REJECTED'});
};
reject('locator changed after first read',record=>{record.sourceRefs=structuredClone(record.sourceRefs);record.sourceRefs[0].locators[0].value='unaccepted-location';});
reject('unregistered document pointer',record=>{record.sourceRefs=structuredClone(record.sourceRefs);record.sourceRefs[0].documentId='documents-0000000000000000';});
reject('reference content anchor removed',record=>{record.sourceRefs=structuredClone(record.sourceRefs);delete record.sourceRefs[0].referenceId;});
reject('binding identity replaced',record=>{record.sourceBindings='bindings-0000000000000000';});
reject('legacy proof shadow after cache',record=>{record.provenance={sourceId:'unaccepted-shadow'};});
reject('mutable shared locator denied',record=>{record.sourceRefs[0].locators[0].value='unaccepted-location';});
const bindings=getSourceBindings(actual),layoutId=Object.entries(bindings).find(([slot])=>!slot.startsWith('$'))[1].layout;
sourceSnapshot(actual);const trustedLayout=catalogValue('layouts',layoutId);assert.ok(Object.isFrozen(trustedLayout));
assert.throws(()=>sourceSnapshot({sourceSchema:'source-refs/v1',sourceRefs:[],sourceBindings:{$schema:'source-refs/v1',$order:['provenance'],provenance:{layout:'layouts-0000000000000000',refs:[],contexts:[]}},sourceLayoutCatalog:{'layouts-0000000000000000':trustedLayout}}),/Source catalog content changed/);
controls.push({name:'immutable value cannot alias a different content identity',status:'REJECTED'});
const native=structuredClone(book),shared=cloneSourceBook(book);
assert.deepEqual(shared,native,'Source sharing must preserve every ordinary field and key order');
const sourceIndex=book.entities.findIndex(entity=>typeof entity.sourceBindings==='string'&&entity.sourceRefs?.length);
assert.ok(sourceIndex>=0);assert.equal(shared.entities[sourceIndex].sourceRefs,book.entities[sourceIndex].sourceRefs);
assert.ok(Object.isFrozen(shared.entities[sourceIndex].sourceRefs));
shared.entities[sourceIndex].data.__cloneProbe=true;assert.ok(!Object.hasOwn(book.entities[sourceIndex].data,'__cloneProbe'),'Mutable gameplay fields remain isolated');
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'wh-source-catalog-negative-'));
const baseCatalog=JSON.parse(fs.readFileSync(path.join(here,'source-catalog.json')));
const documentId=actual.sourceRefs[0].documentId,bindingId=actual.sourceBindings;
assert.ok(typeof bindingId==='string');
let passed=false;
try{
 for(const [name,mutate]of [
  ['document hash changed',catalog=>{const table=Object.values(catalog.documents).find(table=>table[documentId]);table[documentId].sha256='0'.repeat(64);} ],
  ['binding tuple changed',catalog=>{catalog.bindings[bindingId][0].push('unaccepted-field');}],
  ['layout changed',catalog=>{catalog.layouts[catalog.bindings[bindingId][1][0][1]].type='UNACCEPTED';}]
 ]){
  const folder=path.join(scratch,String(controls.length));fs.mkdirSync(folder);
  for(const file of ['source-refs.mjs','source-catalog.mjs'])fs.copyFileSync(path.join(here,file),path.join(folder,file));
  const catalog=structuredClone(baseCatalog);mutate(catalog);
  fs.writeFileSync(path.join(folder,'source-catalog.json'),JSON.stringify(catalog));
  fs.writeFileSync(path.join(folder,'record.json'),JSON.stringify(actual));
  const script=`import fs from 'node:fs';import {readSourceRefs,sourceSnapshot} from ${JSON.stringify(pathToFileURL(path.join(folder,'source-refs.mjs')).href)};const record=JSON.parse(fs.readFileSync(${JSON.stringify(path.join(folder,'record.json'))}));readSourceRefs(record);sourceSnapshot(record);`;
  const result=spawnSync(process.execPath,['--input-type=module','-e',script],{encoding:'utf8'});
  assert.notEqual(result.status,0,name+' must reject a cold load');assert.match(result.stderr,/Source catalog content changed|Source reference content changed/);
  controls.push({name,status:'REJECTED'});
 }
 passed=true;
}finally{
 if(passed){assert.ok(path.resolve(scratch).startsWith(path.resolve(os.tmpdir())+path.sep+'wh-source-catalog-negative-'));fs.rmSync(scratch,{recursive:true});}
 else console.error('Preserved failed control: '+scratch);
}
console.log(JSON.stringify({status:'PASS',controls,sharedSourceMetadata:true,mutableFactsIsolated:true}));
