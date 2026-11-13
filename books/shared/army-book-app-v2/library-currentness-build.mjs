/** Build-only presentation metadata. It does not certify an entire book as current. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readBookPassport} from '../tools/book-passport.mjs';
import {readCurrentMfmRelease} from '../../../mfm/content/current-mfm-release.mjs';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';

const defaultRoot=fileURLToPath(new URL('../../../',import.meta.url));
const compare=(a,b)=>a<b?-1:a>b?1:0;
const date=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value);

export function projectLibraryDataVersions({coreCatalog,mfmRelease,officialUpdates}) {
  if(!date(coreCatalog?.asOf))throw Error('Library metadata: Core snapshot date is missing');
  if(typeof mfmRelease?.version!=='string'||!mfmRelease.version)throw Error('Library metadata: current MFM version is missing');
  if(officialUpdates!==null&&(!officialUpdates||!Array.isArray(officialUpdates.entries)))throw Error('Library metadata: invalid official update entries');
  const sources=(officialUpdates?.entries||[]).map(entry=>entry.source);
  for(const source of sources) {
    if(typeof source?.version!=='string'||!source.version||source.effectiveFrom!==undefined&&!date(source.effectiveFrom))throw Error('Library metadata: invalid official update source version/date');
  }
  const dates=sources.map(source=>source.effectiveFrom).filter(Boolean).sort();
  const latestDate=dates.at(-1);
  // Undated evidence cannot be silently ordered before a dated release.
  const selected=sources.filter(source=>!source.effectiveFrom||source.effectiveFrom===latestDate);
  const updates=[...new Map(selected.map(source=>[JSON.stringify([source.version,source.effectiveFrom||null]),{version:source.version,date:source.effectiveFrom||null}])).values()]
    .sort((a,b)=>compare(a.date||'',b.date||'')||compare(a.version,b.version));
  return {coreSnapshotDate:coreCatalog.asOf,mfmVersion:mfmRelease.version,officialUpdates:updates};
}

export function appendLibraryDataVersions(payload,{root=defaultRoot,coreCatalog}={}) {
  const passport=readBookPassport(payload.book.id,{root});
  const officialUpdates=passport.official.input?JSON.parse(fs.readFileSync(path.join(root,passport.official.input),'utf8')):null;
  if(officialUpdates&&officialUpdates.bookId!==payload.book.id)throw Error('Library metadata: official update book mismatch');
  payload.book.dataVersions=projectLibraryDataVersions({
    coreCatalog:coreCatalog||createEffectiveCoreCatalog({root:path.join(root,'books/core-rules/content')}),
    mfmRelease:readCurrentMfmRelease({repoRoot:root}),officialUpdates});
  return payload;
}
