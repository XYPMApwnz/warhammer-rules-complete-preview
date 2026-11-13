import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {projectLibraryDataVersions,appendLibraryDataVersions} from './library-currentness-build.mjs';
import {BOOK_PASSPORT_IDS,readBookPassport} from '../tools/book-passport.mjs';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';
import {readCurrentMfmRelease} from '../../../mfm/content/current-mfm-release.mjs';

const fixture={coreCatalog:{asOf:'2026-11-11'},mfmRelease:{version:'v9.0'},officialUpdates:{entries:[
  {source:{version:'v1.1',effectiveFrom:'2026-07-01'}},
  {source:{version:'v1.2',effectiveFrom:'2026-10-01'}},
  {source:{version:'v1.2',effectiveFrom:'2026-10-01'}}]}};
const before=JSON.stringify(fixture);
assert.deepEqual(projectLibraryDataVersions(fixture),{coreSnapshotDate:'2026-11-11',mfmVersion:'v9.0',officialUpdates:[{version:'v1.2',date:'2026-10-01'}]},'Three source labels must retain separate owners; latest corrections are deduplicated by version/date');
assert.equal(JSON.stringify(fixture),before,'Metadata projection must not mutate sources');
assert.deepEqual(projectLibraryDataVersions({...fixture,officialUpdates:{entries:[]}}).officialUpdates,[],'A book without applied correction entries must not invent a date');
assert.deepEqual(projectLibraryDataVersions({...fixture,officialUpdates:null}).officialUpdates,[]);
assert.deepEqual(projectLibraryDataVersions({...fixture,officialUpdates:{entries:[{source:{version:'v3'}}]}}).officialUpdates,[{version:'v3',date:null}],'An undated official version stays undated');
assert.deepEqual(projectLibraryDataVersions({...fixture,officialUpdates:{entries:[...fixture.officialUpdates.entries,{source:{version:'undated'}}]}}).officialUpdates,[{version:'undated',date:null},{version:'v1.2',date:'2026-10-01'}],'Undated sources must not be assumed older than a known date');
assert.throws(()=>projectLibraryDataVersions({...fixture,coreCatalog:{}}),/Core snapshot date/);
assert.throws(()=>projectLibraryDataVersions({...fixture,mfmRelease:{}}),/current MFM version/);
assert.throws(()=>projectLibraryDataVersions({...fixture,officialUpdates:{entries:[{source:{}}]}}),/source version/);
assert.throws(()=>projectLibraryDataVersions({...fixture,officialUpdates:{entries:[{source:{version:'v1',effectiveFrom:'not a date'}}]}}),/source version/);

const root=fileURLToPath(new URL('../../../',import.meta.url)),coreCatalog=createEffectiveCoreCatalog(),release=readCurrentMfmRelease();
const results=[];
for(const id of BOOK_PASSPORT_IDS){
 const passport=readBookPassport(id),official=passport.official.input?JSON.parse(fs.readFileSync(path.join(root,passport.official.input),'utf8')):null;
 const payload={book:{id,title:id},cards:[],factManifest:[]};
 const source=JSON.stringify(payload),actual=appendLibraryDataVersions(payload,{coreCatalog});
 assert.equal(actual,payload);
 assert.deepEqual(actual.book.dataVersions,projectLibraryDataVersions({coreCatalog,mfmRelease:release,officialUpdates:official}));
 const withoutVersions=structuredClone(actual);delete withoutVersions.book.dataVersions;
 assert.equal(JSON.stringify(withoutVersions),source,'Library labels must not change cards or facts: '+id);
 const latest=[...(official?.entries||[])].map(e=>e.source.effectiveFrom).filter(Boolean).sort().at(-1);
 for(const update of actual.book.dataVersions.officialUpdates)if(update.date)assert.equal(update.date,latest,'Only the newest dated correction is labelled: '+id);
 assert.equal(actual.book.dataVersions.coreSnapshotDate,coreCatalog.asOf);
 assert.equal(actual.book.dataVersions.mfmVersion,release.version);
 results.push({book:id,...actual.book.dataVersions});
}
console.log(JSON.stringify({status:'PASS',books:results.length,sourceMutation:false,results}));
