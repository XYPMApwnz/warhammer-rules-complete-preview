import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildSourceEnrollment} from '../books/shared/tools/source-enrollment-contract.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const json=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const stable=value=>`${JSON.stringify(value,null,2)}\n`;
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const copy=(fromRoot,toRoot,relative)=>{const target=path.join(toRoot,relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(fromRoot,relative),target);};
const copyTree=(fromRoot,toRoot,relative)=>{const source=path.join(fromRoot,relative);if(fs.existsSync(source))fs.cpSync(source,path.join(toRoot,relative),{recursive:true});};
const publication=json('books/publication-inventory.json');
const registry=json('books/source-ingestion-contract.json');
const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'warhammer-source-enrollment-'));

try{
  copy(root,fixture,'books/publication-inventory.json');
  copy(root,fixture,'books/source-ingestion-contract.json');
  for(const book of publication.books){
    copy(root,fixture,book.config);
    copy(root,fixture,`books/${book.id}/sources/source-manifest.json`);
    copyTree(root,fixture,`books/${book.id}/tools`);
    copyTree(root,fixture,`books/${book.id}/tests`);
    const sourceDirectory=path.join(root,'books',book.id,'sources');
    for(const entry of fs.readdirSync(sourceDirectory,{withFileTypes:true}))if(entry.isFile()&&entry.name.endsWith('.config.json'))copy(root,fixture,`books/${book.id}/sources/${entry.name}`);
    if(book.mobile)copy(root,fixture,`books/${book.id}/mobile/build.mjs`);
  }
  for(const source of registry.sources.filter(source=>source.book!=='shared'))for(const artifact of source.artifacts)copy(root,fixture,artifact.path);

  const run=()=>buildSourceEnrollment({repo:fixture,includeFreshnessOnly:true});
  const baseline=run();
  assert.equal(baseline.publicBooks.length,9);
  const declaredPublicActive=publication.books.filter(book=>book.library).reduce((sum,book)=>{
    const manifestValue=json(`books/${book.id}/sources/source-manifest.json`),sources=manifestValue.sources||manifestValue.layers||[];
    return sum+sources.filter(source=>source.active!==false).length;
  },0);
  assert.equal(baseline.publicBooks.reduce((sum,book)=>sum+book.active,0),declaredPublicActive);
  assert.deepEqual(baseline.freshnessOnlyBooks.map(book=>book.book),['orks']);
  assert.equal(baseline.freshnessOnlyBooks[0].active,3);
  assert.equal(baseline.rows.length,declaredPublicActive+baseline.freshnessOnlyBooks.reduce((sum,book)=>sum+book.active,0));
  for(const status of ['SOURCE_LIMITED','LEGACY_UNVERIFIABLE']){
    const expected=registry.sources.filter(source=>source.book!=='orks'&&source.book!=='shared'&&source.status===status).length;
    assert.equal(baseline.rows.filter(row=>row.status===status&&row.book!=='orks').length,expected);
  }
  assert(baseline.rows.filter(row=>row.status==='LEGACY_UNVERIFIABLE').every(row=>['UNKNOWN','UPDATE_AVAILABLE'].includes(row.upstreamCurrentness)));
  assert.equal(baseline.rows.find(row=>row.sourceId==='tau-mfm-v1.3').upstreamCurrentness,'UPDATE_AVAILABLE');
  const currentMfm=baseline.rows.filter(row=>row.sourceId.endsWith('-mfm-v1.4'));
  assert.equal(currentMfm.length,9);
  assert(currentMfm.every(row=>row.upstreamCurrentness==='CURRENT'));

  const manifest=book=>`books/${book}/sources/source-manifest.json`;
  const mutate=(relative,change,pattern)=>{
    const file=path.join(fixture,relative),before=fs.readFileSync(file);
    try{const value=JSON.parse(before);change(value);fs.writeFileSync(file,stable(value));assert.throws(run,pattern);}
    finally{fs.writeFileSync(file,before);}
  };

  mutate(manifest('tau-empire'),value=>value.layers=value.layers.filter(source=>source.sourceId!=='tau-codex-wargear'),/actual build source is omitted from manifest/);
  {
    const manifestFile=path.join(fixture,manifest('tau-empire')),registryFile=path.join(fixture,'books/source-ingestion-contract.json');
    const beforeManifest=fs.readFileSync(manifestFile),beforeRegistry=fs.readFileSync(registryFile);
    try{
      const manifestValue=JSON.parse(beforeManifest),registryValue=JSON.parse(beforeRegistry);
      manifestValue.layers=manifestValue.layers.filter(source=>source.sourceId!=='tau-codex-wargear');
      registryValue.sources=registryValue.sources.filter(source=>source.sourceId!=='tau-codex-wargear');
      fs.writeFileSync(manifestFile,stable(manifestValue));fs.writeFileSync(registryFile,stable(registryValue));
      assert.throws(run,/actual build source is omitted from manifest/,'removing a live parser source from both declarations must not yield complete enrollment');
    }finally{fs.writeFileSync(manifestFile,beforeManifest);fs.writeFileSync(registryFile,beforeRegistry);}
  }
  mutate('books/source-ingestion-contract.json',value=>delete value.sources.find(source=>source.sourceId==='tau-codex-wargear').status,/source is not classified/);
  mutate('books/source-ingestion-contract.json',value=>{
    const bytes=Buffer.from('{"dead":true}\n');
    const artifact='books/tau-empire/sources/dead-active-source.json';
    fs.writeFileSync(path.join(fixture,artifact),bytes);
    value.sources.push({book:'tau-empire',sourceId:'tau-dead-active-source',authority:'accepted-review',sourceType:'structured-contract',acceptedRevision:'probe',acceptedHash:hash(bytes),lastChecked:'2026-09-14',upstreamUpdateKnown:false,upstreamCurrentness:'N/A',status:'REVIEW_REQUIRED',rawOrigin:'TEST_PROBE',reproducible:'repository-artifact',artifacts:[{path:artifact,normalization:'lf',sha256:hash(bytes)}]});
  },/registered sources are not actively declared/);
  {
    const manifestFile=path.join(fixture,manifest('tau-empire')),registryFile=path.join(fixture,'books/source-ingestion-contract.json');
    const beforeManifest=fs.readFileSync(manifestFile),beforeRegistry=fs.readFileSync(registryFile),bytes=Buffer.from('{"dead":true}\n'),artifact='books/tau-empire/sources/dead-active-source.json';
    try{
      fs.writeFileSync(path.join(fixture,artifact),bytes);
      const manifestValue=JSON.parse(beforeManifest),registryValue=JSON.parse(beforeRegistry);
      manifestValue.layers.push({id:'tau-dead-active-source',sourceId:'tau-dead-active-source',active:true,sourceType:'structured-contract',lifecycle:'ACCEPTED_SOURCE',factsOwned:['dead-probe'],consumers:['COMPATIBLE_RULES'],paths:[artifact]});
      registryValue.sources.push({book:'tau-empire',sourceId:'tau-dead-active-source',authority:'accepted-review',sourceType:'structured-contract',acceptedRevision:'probe',acceptedHash:hash(bytes),lastChecked:'2026-09-14',upstreamUpdateKnown:false,upstreamCurrentness:'N/A',status:'SOURCE_LIMITED',rawOrigin:'TEST_PROBE',reproducible:'repository-artifact',artifacts:[{path:artifact,normalization:'lf',sha256:hash(bytes)}]});
      fs.writeFileSync(manifestFile,stable(manifestValue));fs.writeFileSync(registryFile,stable(registryValue));
      assert.throws(run,/active source has no declared consumer graph reference/);
    }finally{fs.writeFileSync(manifestFile,beforeManifest);fs.writeFileSync(registryFile,beforeRegistry);fs.rmSync(path.join(fixture,artifact),{force:true});}
  }
  mutate('books/source-ingestion-contract.json',value=>value.sources.find(source=>source.sourceId==='tau-codex-wargear').artifacts[0].sha256='0'.repeat(64),/hash mismatch/);
  mutate('books/source-ingestion-contract.json',value=>value.sources.find(source=>source.sourceId==='tau-codex-wargear').book='tyranids',/registered sources are not actively declared|active manifest sources are not registered/);
  mutate(manifest('tau-empire'),value=>value.layers.find(source=>source.sourceId==='tau-codex-wargear').paths=['../outside.json'],/normalized repository-relative path/);
  fs.writeFileSync(path.join(fixture,'books/tau-empire/reader.html'),'poison');
  mutate(manifest('tau-empire'),value=>value.layers.find(source=>source.sourceId==='tau-codex-wargear').paths=['books/tau-empire/reader.html'],/generated output is mislabeled as accepted source/);
  mutate(manifest('tau-empire'),value=>value.layers.find(source=>source.sourceId==='tau-codex-wargear').consumers=[],/consumers are incomplete/);
  mutate('books/source-ingestion-contract.json',value=>{const source=value.sources.find(source=>source.sourceId==='tau-codex-wargear');source.status='VERIFIED_CURRENT';source.upstreamCurrentness='CURRENT';},/CURRENT requires a verified upstream observation/);
  mutate(manifest('dark-angels'),value=>value.sourceDependencies=[],/source dependency set does not match book config/);
  mutate(manifest('dark-angels'),value=>value.sourceDependencies[0].ownerBookId='blood-angels',/invalid source dependency owner/);
  mutate(manifest('chaos-space-marines'),value=>value.layers=value.layers.filter(source=>source.sourceId!=='csm-codex-secondary-consensus'),/actual build source is omitted from manifest/);
  mutate('books/publication-inventory.json',value=>value.books.find(book=>book.id==='orks').library=true,/source enrollment scope FRESHNESS_ONLY does not match publication scope PUBLIC_BOOK/);

  for(const book of ['space-marines','dark-angels']){
    const retained=json(`${manifest(book)}`);const historical=retained.layers.find(source=>source.id==='faction-pack-v1.0');
    assert.equal(historical.active,false);assert.equal(historical.lifecycle,'HISTORICAL_EVIDENCE');
    assert(!registry.sources.some(source=>source.book===book&&source.sourceId==='faction-pack-v1.0'));
  }
  const csm=json(manifest('chaos-space-marines'));
  assert(csm.layers.some(source=>source.sourceId==='csm-codex-secondary-consensus'));
  assert.equal(csm.secondaryConsensus.sourceId,'csm-codex-secondary-consensus');
  console.log(`Source enrollment QA passed: ${declaredPublicActive} public owners, 3 Orks freshness owners, exact manifest/status/classification equality and 15 adversarial controls.`);
}finally{fs.rmSync(fixture,{recursive:true,force:true});}
