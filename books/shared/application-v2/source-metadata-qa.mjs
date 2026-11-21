import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createSourceMetadataLoader,formatSourcesLine,createSourcesLine} from './source-metadata.mjs';
import {BOOK_PASSPORT_IDS,readBookPassport} from '../tools/book-passport.mjs';
import {projectCoreBattleSizes} from '../tools/build-source-metadata.mjs';
const read=file=>JSON.parse(fs.readFileSync(new URL('../../../'+file,import.meta.url),'utf8'));
const path='books/shared/application-v2/generated/source-metadata.v1.json';
const metadata=read(path),canonical=read('books/core-rules/content/core-rules.digital-11e.json'),release=read('mfm/current.json');
const rawBefore=JSON.stringify(canonical),rule=canonical.records.find(row=>row.code==='25.03'),table=rule.content.find(block=>block.type==='comparison-table');
assert.equal(metadata.core.captureDate,canonical.meta.captureDate);
assert.equal(metadata.core.corpusFingerprint,canonical.meta.corpusFingerprint);
assert.equal(metadata.mfm.version,release.version);
for(const id of BOOK_PASSPORT_IDS)assert.equal(metadata.books[id].mfmVersion,read(readBookPassport(id).mfm.currentRelease).version);
for(const [index,row]of table.rows.entries())assert.deepEqual(metadata.core.battleSizes[index],{
 label:row.label,pointsLimit:Number(row.cells[table.columns.indexOf('Points Total')-1]),detachmentPoints:Number(row.cells[table.columns.indexOf('Detachment Points (DP)')-1])});
const reordered=structuredClone(rule),other=reordered.content.find(block=>block.type==='comparison-table');
[other.columns[1],other.columns[2]]=[other.columns[2],other.columns[1]];
for(const row of other.rows)[row.cells[0],row.cells[1]]=[row.cells[1],row.cells[0]];
assert.deepEqual(projectCoreBattleSizes(reordered),metadata.core.battleSizes,'Source headings still own the table numbers');
assert.equal(JSON.stringify(canonical),rawBefore);
let requests=0,parses=0;
const fetch=async url=>{assert(url.href.endsWith('/'+path));requests++;return {ok:true,json:async()=>{parses++;return structuredClone(metadata);}};};
const loader=createSourceMetadataLoader({fetch});
const [global,core,...books]=await Promise.all([loader.global(),loader.core(),...BOOK_PASSPORT_IDS.map(id=>loader.book(id))]);
assert.equal(requests,1);assert.equal(parses,1,'Every concurrent consumer shares one fetch and parse');
assert.equal(global.mfmVersion,release.version);assert.equal(global.coreCaptureDate,canonical.meta.captureDate);assert.equal(global.coreCorpusFingerprint,canonical.meta.corpusFingerprint);
assert.deepEqual(core,metadata.core);assert.equal(await loader.core(),core);
for(const [index,id]of BOOK_PASSPORT_IDS.entries())assert.equal(books[index].mfmVersion,metadata.books[id].mfmVersion);
const sourceLine=formatSourcesLine(global);
async function changed(mutator){const value=structuredClone(metadata);mutator(value);return createSourceMetadataLoader({fetch:async()=>({ok:true,json:async()=>value})});}
const releaseChanged=await changed(value=>{value.mfm.version+='-changed';});
assert.notEqual(formatSourcesLine(await releaseChanged.global()),sourceLine,'MFM metadata change updates the line');
const dateChanged=await changed(value=>{value.core.captureDate='2026-11-12';});
assert.notEqual(formatSourcesLine(await dateChanged.global()),sourceLine,'Core capture metadata change updates the line');
const selected=await changed(value=>{value.books['synthetic-book']={mfmVersion:'v9.0-passport-selected'};});
assert.equal((await selected.book('synthetic-book')).mfmVersion,'v9.0-passport-selected','Per-book generated ownership is not replaced by the global version');
await assert.rejects(loader.book('../wrong'),/Invalid source metadata book/);
await assert.rejects(loader.book('unregistered'),/metadata unavailable for book/);
for(const poison of [value=>{delete value.schema;},value=>{value.core.captureDate='2026-02-30';},value=>{value.core.battleSizes[0].detachmentPoints=null;},value=>{delete value.books;}]){
 const invalid=await changed(poison);await assert.rejects(invalid.global(),/metadata unavailable or invalid/);
}
let failures=1;
const retry=createSourceMetadataLoader({fetch:async url=>failures-- >0?{ok:false}:fetch(url)});
await assert.rejects(retry.global(),/metadata unavailable/);assert.equal((await retry.global()).mfmVersion,release.version);
const oldFetch=globalThis.fetch;let defaultRequests=0;
try{globalThis.fetch=async url=>{defaultRequests++;return fetch(url);};const defaults=createSourceMetadataLoader();await defaults.global();await defaults.book(BOOK_PASSPORT_IDS[0]);assert.equal(defaultRequests,1);}finally{globalThis.fetch=oldFetch;}
const document={createElement:tag=>({tagName:tag,dataset:{}})},line=createSourcesLine(document,global);
assert.equal(line.textContent,sourceLine);assert.equal(line.dataset.v2SourcesLine,'');assert.equal(line.tagName,'p');
assert.throws(()=>formatSourcesLine({mfmVersion:release.version,coreCaptureDate:'unavailable'}),/metadata unavailable/);
const runtime=fs.readFileSync(new URL('./source-metadata.mjs',import.meta.url),'utf8');
assert.doesNotMatch(runtime,/\bimport[^;]*\bwith\s*\{/,'Metadata runtime needs no JSON import attributes');
assert.doesNotMatch(runtime,/core-rules\.digital-11e\.json|mfm\/current\.json/,'The browser never requests the full source owners for metadata');
console.log(JSON.stringify({status:'PASS',books:BOOK_PASSPORT_IDS.length,fetches:1,parses:1,sourceMutationChangesLine:true,battleSizes:core.battleSizes.length}));
