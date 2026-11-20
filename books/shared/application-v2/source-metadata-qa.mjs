import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createSourceMetadataLoader,formatSourcesLine,projectCoreSourceMetadata,projectCoreBattleSizes,createSourcesLine} from './source-metadata.mjs';
import {BOOK_PASSPORT_IDS,readBookPassport} from '../tools/book-passport.mjs';
import {getBookPassport} from '../roster-v2/keywords.mjs';

const read=path=>JSON.parse(fs.readFileSync(new URL('../../../'+path,import.meta.url),'utf8'));
const corePath='books/core-rules/content/core-rules.digital-11e.json',releasePath='mfm/current.json';
const canonical=read(corePath),release=read(releasePath),rawBefore=JSON.stringify(canonical);
const actual=projectCoreSourceMetadata(canonical),rule=canonical.records.find(row=>row.code==='25.03');
assert.equal(actual.captureDate,canonical.meta.captureDate,'Capture metadata must come from the canonical owner, never catalog.asOf');
assert.equal(actual.corpusFingerprint,canonical.meta.corpusFingerprint);
const table=rule.content.find(block=>block.type==='comparison-table');
for(const [index,row]of table.rows.entries()){
  assert.equal(actual.battleSizes[index].label,row.label);
  assert.equal(actual.battleSizes[index].pointsLimit,Number(row.cells[table.columns.indexOf('Points Total')-1]));
  assert.equal(actual.battleSizes[index].detachmentPoints,Number(row.cells[table.columns.indexOf('Detachment Points (DP)')-1]));
}
assert.equal(JSON.stringify(canonical),rawBefore,'Source metadata projection must not alter accepted source data');
const reordered=structuredClone(rule),reorderedTable=reordered.content.find(block=>block.type==='comparison-table');
[reorderedTable.columns[1],reorderedTable.columns[2]]=[reorderedTable.columns[2],reorderedTable.columns[1]];
for(const row of reorderedTable.rows)[row.cells[0],row.cells[1]]=[row.cells[1],row.cells[0]];
assert.deepEqual(projectCoreBattleSizes(reordered),actual.battleSizes,'Source headings, rather than hardcoded positions, own the numbers');
assert.throws(()=>projectCoreBattleSizes({code:'other',content:rule.content}),/source unavailable/);
assert.throws(()=>projectCoreSourceMetadata({...canonical,meta:{...canonical.meta,captureDate:'2026-02-30'}}),/metadata unavailable/);

const urls=[],rootURL='https://example.test/library/',passports=new Map(BOOK_PASSPORT_IDS.map(id=>[id,readBookPassport(id)]));
for(const id of BOOK_PASSPORT_IDS){
  assert.deepEqual(getBookPassport(id),passports.get(id),'Reused runtime passports must remain the owner JSON: '+id);
  assert.equal(getBookPassport(id),getBookPassport(id),'Passport reuse must not parse or copy a config');
}
assert.equal(getBookPassport('unregistered'),undefined);

const originalFetch=globalThis.fetch,productionRequests=[];
try{
  globalThis.fetch=async url=>{productionRequests.push(url.href);throw new Error('Production metadata must reuse imported owners');};
  const production=createSourceMetadataLoader({readPassport:getBookPassport});
  const [metadata,core,...selectedBooks]=await Promise.all([production.global(),production.core(),...BOOK_PASSPORT_IDS.map(id=>production.book(id))]);
  assert.equal(metadata.mfmVersion,release.version);
  assert.equal(metadata.coreCaptureDate,canonical.meta.captureDate);
  assert.equal(metadata.coreCorpusFingerprint,canonical.meta.corpusFingerprint);
  assert.deepEqual(core,actual);
  for(const [index,id]of BOOK_PASSPORT_IDS.entries())assert.equal(selectedBooks[index].mfmVersion,read(passports.get(id).mfm.currentRelease).version);
  assert.deepEqual(productionRequests,[],'Production consumers must not fetch or parse the imported canonical owners again');
  assert.equal(await production.core(),core,'Production consumers share the projected Core context');
  let alternateParses=0;
  globalThis.fetch=async url=>{
    productionRequests.push(url.href);
    return {ok:true,json:async()=>{alternateParses++;return {...release,version:release.version+'-alternate-owner'};}};
  };
  const alternatePath='mfm/alternate/current.json',alternate=createSourceMetadataLoader({rootURL,
    readPassport:()=>({schema:'army-book-passport/v1',mfm:{currentRelease:alternatePath}})});
  const [selected,selectedAgain]=await Promise.all([alternate.book('synthetic-book'),alternate.book('synthetic-book')]);
  assert.equal(selected.mfmVersion,release.version+'-alternate-owner');
  assert.deepEqual(selectedAgain,selected);
  assert.deepEqual(productionRequests,[new URL(alternatePath,rootURL).href],'A noncanonical passport pointer must use the normal reader');
  assert.equal(alternateParses,1,'A noncanonical release is still fetched and parsed once');
}finally{globalThis.fetch=originalFetch;}

const responses=new Map([[corePath,canonical],[releasePath,release]]);
for(const passport of passports.values())if(!responses.has(passport.mfm.currentRelease))responses.set(passport.mfm.currentRelease,read(passport.mfm.currentRelease));
const fetch=async url=>{
  assert.ok(url.href.startsWith(rootURL),'Metadata requests must honor the application deployment root');
  const relative=url.href.slice(rootURL.length);urls.push(relative);
  if(!responses.has(relative))return {ok:false};
  return {ok:true,json:async()=>structuredClone(responses.get(relative))};
};
const loader=createSourceMetadataLoader({fetch,rootURL,readPassport:getBookPassport});
const [global,...books]=await Promise.all([loader.global(),...BOOK_PASSPORT_IDS.map(id=>loader.book(id)),loader.core()]);
assert.equal(global.mfmVersion,release.version);
assert.equal(global.coreCaptureDate,canonical.meta.captureDate);
assert.equal(global.coreCorpusFingerprint,canonical.meta.corpusFingerprint);
for(const [index,id]of BOOK_PASSPORT_IDS.entries())assert.equal(books[index].mfmVersion,responses.get(passports.get(id).mfm.currentRelease).version,id+' must select its passport release owner');
assert.equal(urls.filter(path=>path===corePath).length,1,'Concurrent consumers share one canonical Core read');
for(const path of new Set(passports.values().map(passport=>passport.mfm.currentRelease)))assert.equal(urls.filter(url=>url===path).length,1,'Shared release pointers are read once');
assert.ok(urls.every(path=>path===corePath||path.endsWith('/current.json')),'No book payload, full raw corpus or duplicate config fetch may be used');
assert.equal(await loader.core(),await loader.core(),'Core metadata identity is cached for the application lifetime');

const sourceLine=formatSourcesLine(global),mutatedCore=structuredClone(canonical);
const nextDate=new Date(`${canonical.meta.captureDate}T00:00:00Z`);nextDate.setUTCDate(nextDate.getUTCDate()+1);
mutatedCore.meta.captureDate=nextDate.toISOString().slice(0,10);
mutatedCore.meta.corpusFingerprint=canonical.meta.corpusFingerprint.split('').reverse().join('');
responses.set(releasePath,{...release,version:release.version+'-source-mutation'});
const releaseChanged=await createSourceMetadataLoader({fetch,rootURL}).global();
assert.notEqual(formatSourcesLine(releaseChanged),sourceLine,'Changing only the MFM owner must update the line');
assert.equal(releaseChanged.coreCaptureDate,global.coreCaptureDate);
responses.set(releasePath,release);responses.set(corePath,mutatedCore);
const changedLoader=createSourceMetadataLoader({fetch,rootURL,readPassport:id=>passports.get(id)}),changed=await changedLoader.global();
assert.notEqual(formatSourcesLine(changed),sourceLine,'Changing only the Core capture owner must update the line without editing presentation metadata');
assert.equal(changed.mfmVersion,global.mfmVersion);
assert.equal(changed.coreCaptureDate,mutatedCore.meta.captureDate);
assert.equal(changed.coreCorpusFingerprint,mutatedCore.meta.corpusFingerprint);
assert.ok(formatSourcesLine(releaseChanged).includes(releaseChanged.mfmVersion));
const ownPath='mfm/alternate/current.json',ownPassport={schema:'army-book-passport/v1',mfm:{currentRelease:ownPath}};
responses.set(ownPath,{...release,version:release.version+'-passport-selected'});
const selected=createSourceMetadataLoader({fetch,rootURL,readPassport:()=>ownPassport});
assert.equal((await selected.book('synthetic-book')).mfmVersion,responses.get(ownPath).version,'A book must follow its own passport rather than the global pointer');
await assert.rejects(selected.book('../wrong'),/Invalid source metadata book/);

let failures=1;
const retry=createSourceMetadataLoader({rootURL,fetch:async url=>{
  if(url.href.endsWith(releasePath)&&failures-- >0)return {ok:false};
  return fetch(url);
}});
await assert.rejects(retry.global(),/metadata unavailable/);
assert.equal((await retry.global()).mfmVersion,responses.get(releasePath).version,'A temporary metadata load failure must be retryable');

const document={createElement:tag=>({tagName:tag,dataset:{}})},line=createSourcesLine(document,global);
assert.equal(line.textContent,sourceLine);assert.equal(line.dataset.v2SourcesLine,'');assert.equal(line.tagName,'p');
assert.throws(()=>formatSourcesLine({mfmVersion:release.version,coreCaptureDate:'unavailable'}),/metadata unavailable/);
console.log(JSON.stringify({status:'PASS',books:BOOK_PASSPORT_IDS.length,coreReads:1,sourceMutationChangesLine:true,battleSizes:actual.battleSizes.length}));
