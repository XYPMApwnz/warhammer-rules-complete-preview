import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';
import {createQaTempDir,cleanupQaTempDir} from './helpers/qa-temp.mjs';
import {mfmReleaseExpectations} from './helpers/mfm-release-expectations.mjs';
import {readCurrentMfmRelease} from '../mfm/content/current-mfm-release.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
// Accepted before the shared current-release pointer. This independent literal
// must not be derived from the registry: deleting a source from both registry
// and enrollment must still fail the exact historical-membership assertion.
const BASELINE_HISTORICAL_IDS=[
  'adeptus-mechanicus-mfm-v1.4','adeptus-mechanicus-mfm-v1.5',
  'blood-angels-mfm-v1.4',
  'chaos-space-marines-mfm-v1.4','chaos-space-marines-mfm-v1.5','csm-mfm-v1.3',
  'dark-angels-mfm-v1.4',
  'death-guard-mfm-v1.3-capture-2026-08-27','death-guard-mfm-v1.4','death-guard-mfm-v1.5',
  'emperors-children-mfm-v1.3','emperors-children-mfm-v1.4','emperors-children-mfm-v1.5',
  'space-marines-mfm-v1.4',
  'tau-empire-mfm-v1.4','tau-empire-mfm-v1.5','tau-mfm-v1.3',
  'tyranids-mfm-v1.3','tyranids-mfm-v1.4','tyranids-mfm-v1.5'
];
const read=(directory,relative)=>JSON.parse(fs.readFileSync(path.join(directory,relative),'utf8'));
const write=(directory,relative,value)=>{
  const target=path.join(directory,relative);fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,`${JSON.stringify(value,null,2)}\n`);
};
const copy=(directory,relative)=>{
  const target=path.join(directory,relative);fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.copyFileSync(path.join(root,relative),target);
};
const identity=source=>source.ingestionSourceId||source.sourceId||source.id;
const records=manifest=>[...(manifest.layers||[]),...(manifest.sources||[])];
const manifestPath=(directory,book)=>path.posix.join('books',book,read(directory,`books/${book}/book.config.json`).sources.manifest);
const started=performance.now(),results=[];
const fixture=createQaTempDir('warhammer-mfm-release-history-');

function checkHistory(){
  const expected=mfmReleaseExpectations(fixture,BASELINE_HISTORICAL_IDS);
  const registry=read(fixture,expected.release.sourceRegistryPath);
  const manifests=new Map(read(fixture,'books/publication-inventory.json').books.map(book=>
    [book.id,records(read(fixture,manifestPath(fixture,book.id)))]));
  const actual=registry.sources.filter(source=>source.book!=='shared'
    &&manifests.get(source.book)?.some(row=>identity(row)===source.sourceId&&row.active===false)).map(source=>source.sourceId).sort();
  assert.deepEqual(actual,expected.historicalIds,
    'Historical source identities must equal the accepted baseline plus authenticated archives');
  return expected;
}

function mutation(name,files,change,pattern){
  const before=new Map(files.map(relative=>[relative,fs.readFileSync(path.join(fixture,relative))]));
  let message;
  try{
    change();
    assert.throws(()=>{try{checkHistory();}catch(error){message=error.message;throw error;}},pattern,name);
    results.push({case:name,status:'PASS',mutationRejected:true,message});
  }finally{for(const [relative,bytes] of before)fs.writeFileSync(path.join(fixture,relative),bytes);}
}

try{
  assert.equal(BASELINE_HISTORICAL_IDS.length,20);
  const release=readCurrentMfmRelease({repoRoot:root}),history=read(root,'mfm/releases.json');
  for(const relative of ['books/publication-inventory.json',release.sourceRegistryPath,'mfm/current.json',
    'mfm/releases.json',release.identityRegistryPath,release.crossDomainBindingsPath])copy(fixture,relative);
  for(const book of read(root,'books/publication-inventory.json').books){
    copy(fixture,book.config);copy(fixture,manifestPath(root,book.id));
  }
  const currentIds=[...release.factions,...release.dependencies].map(row=>row.sourceId);
  const rawIds=new Set([...currentIds,...history.releases.flatMap(row=>row.sourceIds)]);
  for(const source of read(root,release.sourceRegistryPath).sources.filter(row=>rawIds.has(row.sourceId)))
    for(const artifact of source.artifacts)copy(fixture,artifact.path);
  const current=checkHistory();
  assert.equal(current.historicalIds.length,20+history.releases.length*11);
  results.push({case:'selected-current-release',status:'PASS',version:release.version,
    factionSources:current.currentFactionIds.length,dependencySources:current.currentDependencyIds.length,
    historicalSources:current.historicalIds.length});

  mutation('bad-current-pointer',['mfm/current.json'],()=>{
    const value=read(fixture,'mfm/current.json');value.factions[0].sourceId='unregistered-mfm-'+release.version;
    write(fixture,'mfm/current.json',value);
  },/MFM current pointer: faction source mismatch/);

  const baselineId=BASELINE_HISTORICAL_IDS[0];
  const baselineSource=read(fixture,release.sourceRegistryPath).sources.find(row=>row.sourceId===baselineId);
  assert(baselineSource,'Accepted historical source must exist before its deletion control');
  const baselineManifest=manifestPath(fixture,baselineSource.book);
  mutation('deleted-accepted-historical-source',[release.sourceRegistryPath,baselineManifest],()=>{
    const registry=read(fixture,release.sourceRegistryPath);registry.sources=registry.sources.filter(row=>row.sourceId!==baselineId);
    write(fixture,release.sourceRegistryPath,registry);
    const manifest=read(fixture,baselineManifest);
    for(const field of ['layers','sources'])if(manifest[field])manifest[field]=manifest[field].filter(row=>identity(row)!==baselineId);
    write(fixture,baselineManifest,manifest);
  },/Historical source identities must equal the accepted baseline plus authenticated archives/);

  // Synthetic metadata-only next release exercises archive transitions. It is
  // not a capture, authenticity substitute, or accepted gameplay/MFM output.
  const nextVersion=`v1.${Number(release.version.split('.')[1])+1}`;
  const replace=value=>{
    if(typeof value==='string')return value.replaceAll(release.version,nextVersion);
    if(Array.isArray(value))return value.map(replace);
    if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,child])=>[key,replace(child)]));
    return value;
  };
  const next=replace(release);
  write(fixture,next.identityRegistryPath,replace(read(fixture,release.identityRegistryPath)));
  write(fixture,next.crossDomainBindingsPath,replace(read(fixture,release.crossDomainBindingsPath)));
  const registry=read(fixture,release.sourceRegistryPath);
  for(const old of registry.sources.filter(row=>currentIds.includes(row.sourceId))){
    const added=replace(old);registry.sources.push(added);
    for(const artifact of added.artifacts){
      const previous=artifact.path.replaceAll(nextVersion,release.version);
      const target=path.join(fixture,artifact.path);fs.mkdirSync(path.dirname(target),{recursive:true});
      fs.copyFileSync(path.join(fixture,previous),target);
    }
    const relative=manifestPath(fixture,old.book),manifest=read(fixture,relative);
    const declaration=records(manifest).find(row=>identity(row)===old.sourceId);
    assert(declaration,`Source declaration missing before archive transition: ${old.sourceId}`);
    const addedDeclaration=replace(declaration);
    declaration.active=false;declaration.lifecycle='HISTORICAL_EVIDENCE';
    const field=manifest.layers?.includes(declaration)?'layers':'sources';manifest[field].push(addedDeclaration);
    write(fixture,relative,manifest);
  }
  write(fixture,release.sourceRegistryPath,registry);
  write(fixture,'mfm/releases.json',{...history,releases:[...history.releases,
    {version:release.version,activatedRelease:nextVersion,activatedAt:'2026-11-12T12:00:00.000Z',sourceIds:currentIds}]});
  write(fixture,'mfm/current.json',next);
  const archived=checkHistory();
  assert.equal(archived.historicalIds.length,current.historicalIds.length+11);
  assert.deepEqual(archived.historicalIds,[...new Set([...current.historicalIds,...currentIds])].sort());
  results.push({case:'synthetic-next-release-archives-all-eleven-sources',status:'PASS',version:nextVersion,
    historicalBefore:current.historicalIds.length,historicalAfter:archived.historicalIds.length});

  mutation('unregistered-archive-entry',['mfm/releases.json'],()=>{
    const value=read(fixture,'mfm/releases.json');value.releases.at(-1).sourceIds[0]='unregistered-mfm-'+release.version;
    write(fixture,'mfm/releases.json',value);
  },/Archived MFM source must remain registered exactly once/);

  const oldId=currentIds[0],oldSource=registry.sources.find(row=>row.sourceId===oldId);
  const oldManifest=manifestPath(fixture,oldSource.book);
  mutation('archived-source-still-active',[oldManifest],()=>{
    const value=read(fixture,oldManifest);records(value).find(row=>identity(row)===oldId).active=true;
    write(fixture,oldManifest,value);
  },/Archived MFM declaration must be inactive/);

  console.log(JSON.stringify({test:'mfm-release-history-qa',status:'PASS',negativeControls:4,
    elapsedMs:Math.round(performance.now()-started),results},null,2));
}finally{cleanupQaTempDir(fixture);}
