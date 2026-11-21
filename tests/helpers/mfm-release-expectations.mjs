import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {readCurrentMfmRelease} from '../../mfm/content/current-mfm-release.mjs';

const read=(root,relative)=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const sourceId=source=>source.ingestionSourceId||source.sourceId||source.id;
const records=manifest=>[...(manifest.layers||[]),...(manifest.sources||[])];

// The original twenty historical identities stay literal in each calling test.
// Release history may only extend that accepted set with authenticated, archived
// MFM captures; deriving expectations from arbitrary inactive rows would hide a
// mistaken retirement or a missing declaration.
export function mfmReleaseExpectations(root,legacyHistoricalIds){
  const release=readCurrentMfmRelease({repoRoot:root});
  const registry=read(root,release.sourceRegistryPath);
  const publicBooks=read(root,'books/publication-inventory.json').books.filter(book=>book.library).map(book=>book.id).sort();
  const factions=release.factions,dependencies=release.dependencies;
  assert.equal(factions.length,9,'Current MFM must enroll exactly nine faction captures');
  assert.deepEqual(factions.map(row=>row.bookId).sort(),publicBooks,'Current MFM faction owners must be the nine public books');
  assert.equal(dependencies.length,2,'Current MFM must enroll both CSM dependencies');
  assert(dependencies.every(row=>row.bookId==='chaos-space-marines'),'MFM dependency captures must retain their CSM consumer');
  const currentFactionIds=factions.map(row=>row.sourceId),currentDependencyIds=dependencies.map(row=>row.sourceId);
  const currentIds=new Set([...currentFactionIds,...currentDependencyIds]);
  assert.equal(currentIds.size,11,'Current MFM source identities must be distinct');
  const history=read(root,'mfm/releases.json');
  assert.equal(history.schema,'mfm-release-history/v1');
  assert(Array.isArray(history.releases),'MFM archived releases must be an array');
  if(release.version!=='v1.6')assert(history.releases.length>0,'A selected newer MFM release must retain activation history');
  if(history.releases.length)assert.equal(history.releases[0].version,'v1.6','Activation history must retain its original v1.6 entry');
  for(const [index,entry]of history.releases.entries())assert.equal(entry.activatedRelease,history.releases[index+1]?.version??release.version,'Archived release must identify the exact successor activation');
  const archivedIds=new Set(),versions=new Set();
  for(const archived of history.releases){
    assert.match(archived.version,/^v\d+\.\d+$/,'Archived MFM version must be explicit');
    assert.notEqual(archived.version,release.version,'Current MFM release cannot be archived');
    assert(!versions.has(archived.version),`Duplicate archived MFM release ${archived.version}`);versions.add(archived.version);
    assert.equal(typeof archived.activatedAt,'string','Archived MFM activation time is required');
    assert(Number.isFinite(Date.parse(archived.activatedAt)),'Archived MFM activation time must be valid');
    assert(Array.isArray(archived.sourceIds),'Archived MFM source identities must be explicit');
    assert.equal(archived.sourceIds.length,11,'Archived MFM release must retain nine faction and two dependency captures');
    assert.equal(new Set(archived.sourceIds).size,11,'Archived MFM source identities must be distinct');
    for(const id of archived.sourceIds){
      assert(!currentIds.has(id),`Current MFM source cannot be historical: ${id}`);
      assert(!archivedIds.has(id),`MFM source is archived more than once: ${id}`);archivedIds.add(id);
      const matches=registry.sources.filter(source=>source.sourceId===id);
      assert.equal(matches.length,1,`Archived MFM source must remain registered exactly once: ${id}`);
      const source=matches[0];
      assert(publicBooks.includes(source.book),`Archived MFM source must retain a book owner: ${id}`);
      assert.equal(source.acceptedRevision,archived.version,`Archived MFM source version mismatch: ${id}`);
      assert.equal(source.sourceType,'official-web-capture',`Archived MFM source type mismatch: ${id}`);
      assert(source.artifacts.length>0,`Archived MFM raw artifacts are required: ${id}`);
      for(const artifact of source.artifacts){
        assert(artifact.path.startsWith(`mfm/sources/${archived.version}/`),`Archived MFM artifact is outside its release: ${artifact.path}`);
        assert(fs.statSync(path.join(root,artifact.path)).isFile(),`Archived MFM raw artifact must exist: ${artifact.path}`);
      }
      const config=read(root,`books/${source.book}/book.config.json`);
      const manifest=read(root,path.posix.join('books',source.book,config.sources.manifest));
      const declarations=records(manifest).filter(row=>sourceId(row)===id);
      assert.equal(declarations.length,1,`Archived MFM declaration must remain exactly once: ${id}`);
      assert.equal(declarations[0].active,false,`Archived MFM declaration must be inactive: ${id}`);
      assert.equal(declarations[0].lifecycle,'HISTORICAL_EVIDENCE',`Archived MFM declaration must remain historical evidence: ${id}`);
    }
    assert.deepEqual(archived.sourceIds.filter(id=>publicBooks.some(book=>id===`${book}-mfm-${archived.version}`)).sort(),
      publicBooks.map(book=>`${book}-mfm-${archived.version}`).sort(),'Archived release must retain every faction capture');
  }
  return {release,currentFactionIds,currentDependencyIds,
    historicalIds:[...new Set([...legacyHistoricalIds,...archivedIds])].sort()};
}
