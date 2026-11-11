/** New producer metadata can be explicitly exported, never guessed or replaced. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {compileBookSourceRefs,sourceContentId} from '../books/shared/source-refs-v2/source-refs.mjs';
import {exportSourceCatalogAdditions} from '../tools/audit/build-source-catalog-additions.mjs';
import {mergeSourceRegistry,assertAppendOnlyRegistry} from '../tools/audit/build-source-catalog.mjs';
import {createQaTempDir,cleanupQaTempDir,createQaEvidenceDir} from './helpers/qa-temp.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const temp=createQaTempDir('source-additions-qa-'),out=createQaEvidenceDir('source-additions-qa-');
const file='books/qa-core/v2/generated/metadata.json',target=path.join(temp,file);
const empty=()=>({documents:{},layouts:{},contexts:{},bindings:{}});
const sample=compileBookSourceRefs({bookId:'qa-core',record:{id:'qa-rule',provenance:{
 sourceId:'qa-core-source',document:'https://example.invalid/accepted-core',
 sourceDate:'2026-11-11',sourceLocator:'Explicit captured source locator',sha256:'a'.repeat(64)
}}},{registry:{rows:[{sourceId:'qa-core-source',document:'https://example.invalid/accepted-core'}]}});
const rows=[];let completed=false;
fs.mkdirSync(path.dirname(target),{recursive:true});
const write=value=>fs.writeFileSync(target,JSON.stringify(value)+'\n');write(sample);
const bytes=fs.readFileSync(target);
const run=(catalog=empty(),before={})=>exportSourceCatalogAdditions({root,inputRoot:temp,files:[file],catalog,baselineOutputs:{[file]:before}});
try{
 const first=run(),second=run();assert.deepEqual(first.delta,second.delta,'Identical producer inputs must give identical delta bytes');
 for(const kind of ['documents','layouts','contexts','bindings'])assert(first.counts[kind]>0,'The literal source fixture must exercise '+kind);
 rows.push({control:'explicit fresh definitions exported deterministically',status:'PASS',counts:first.counts});
 const merged=mergeSourceRegistry(empty(),first.delta);assertAppendOnlyRegistry(empty(),merged);
 const repeated=run(merged);assert(Object.values(repeated.counts).every(n=>n===0),'The same outputs after the merge must give an empty delta');
 rows.push({control:'repeat after explicit merge gives empty delta',status:'PASS'});
 assert(Object.values(run(empty(),sample).counts).every(n=>n===0),'Accepted local declarations must stay local');
 rows.push({control:'accepted local metadata is not implicitly migrated',status:'PASS'});
 const tampered=structuredClone(sample),context=Object.keys(tampered.sourceContextCatalog)[0];
 tampered.sourceContextCatalog[context].value='A forged context';write(tampered);
 assert.throws(()=>run(),/Source catalog content changed/);
 rows.push({control:'changed context under an existing content ID rejected',status:'PASS'});
 const missing=structuredClone(sample);delete missing.sourceContextCatalog[context];write(missing);
 assert.throws(()=>run(),/Missing source contexts/);
 rows.push({control:'missing definition rejected without pool fallback',status:'PASS'});
 const opaque=structuredClone(sample);opaque.record.sourceBindings=sourceContentId('bindings',sample.record.sourceBindings);write(opaque);
 assert.throws(()=>run(),/Missing source bindings entry/);
 rows.push({control:'unresolved opaque binding ID is never reconstructed',status:'PASS'});
 write(sample);assert(fs.readFileSync(target).equals(bytes));
 const damaged=structuredClone(first.delta),id=Object.keys(damaged.contexts)[0];damaged.contexts[id].value='Changed old registry entry';
 assert.throws(()=>mergeSourceRegistry(merged,damaged),/Changed registry entry bytes/);
 rows.push({control:'old registry entry replacement rejected',status:'PASS'});
 assert(fs.readFileSync(target).equals(bytes),'Exporter must not rewrite producer outputs');
 const native=exportSourceCatalogAdditions({root});
 assert.equal(native.checked.length,97);assert(Object.values(native.counts).every(n=>n===0),'Native producer metadata requires an explicit reviewed delta merge');
 rows.push({control:'all 97 current producer outputs have no pending additions',status:'PASS'});
 completed=true;console.log(JSON.stringify({status:'PASS',controls:rows.length,files:native.checked.length,evidence:out}));
}finally{
 fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:completed?'PASS':'FAIL',rows},null,2)+'\n');
 cleanupQaTempDir(temp);
}
