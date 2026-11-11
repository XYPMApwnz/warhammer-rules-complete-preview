/** Accept only the reviewed Core switch; preserve every unrelated production byte. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createQaTempDir,cleanupQaTempDir,createQaEvidenceDir} from '../../../tests/helpers/qa-temp.mjs';
import {assertAppendOnlyRegistry} from '../../../tools/audit/build-source-catalog.mjs';
import {decodeSourceJSON,assertCorePublicationSnapshot,publicationBaselineForFile} from '../../../tests/helpers/core-publication-boundary.mjs';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const fixturePath=new URL('../../../tests/fixtures/core-importer-production-v1.json',import.meta.url);
const approvalPath=new URL('./fixtures/core-switch-production-v1.json',import.meta.url);
const fixtureBytes=fs.readFileSync(fixturePath);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const historicalFixtureSHA='fd52f2bb9f7e2de1c02a8df7bb34addf45a32649aa58ff387161ff0c8cd1dab3';
const approvalSHA='808e470d72b78274673e7a28afa1c11c7434fcdfcab8d2dc90b0b8491d6d55a1';
const baseline='8ab6787ce503171d852a86f52ffb20467b315959';
const candidatePrefix='books/core-rules/sources/waha-core-2026-11-11/';
const acceptedCorpus=candidatePrefix+'waha-core-corpus.v1.json';
const historicalPrefix='books/core-rules/sources/core-importer-baselines/';
const registryFile='books/shared/source-refs-v2/source-catalog.json';
const digestPattern=/^[0-9a-f]{64}$/;
assert.equal(sha(fixtureBytes),historicalFixtureSHA,'The immutable Task A production baseline changed');
const fixture=JSON.parse(fixtureBytes);
assert.equal(fixture.schema,'core-importer-production-isolation/v1');
assert.equal(fixture.baseline,'7b15dc36425ac577b6928837ec9983409972e278');
const oldFiles=new Map(fixture.protectedFiles.map(row=>[row.file,row]));
const git=(...args)=>execFileSync('git',args,{cwd:root,maxBuffer:16*1024*1024});
const tree=new Map(git('ls-tree','-r','-z',baseline).toString('utf8').split('\0').filter(Boolean).map(row=>{
 const [metadata,file]=row.split('\t');return[file,metadata.split(' ')[2]];
}));
for(const row of fixture.protectedFiles)assert.equal(tree.get(row.file),row.gitBlob,'The inherited production baseline is not byte-identical at '+baseline+': '+row.file);

export function loadApprovedCoreChanges(file=approvalPath){
 const bytes=fs.readFileSync(file);
 assert.equal(sha(bytes),approvalSHA,'Review the exact Core-only production change list before updating its pin');
 const value=JSON.parse(bytes);
 assert.equal(value.schema,'core-switch-production-boundary/v1');assert.equal(value.baseline,baseline);
 assert.equal(value.status,'ACCEPTED','The exact Core production changes must be reviewed before isolation can pass');
 assert.equal(value.baselineTree,git('rev-parse',baseline+'^{tree}').toString().trim());
 assert.equal(value.historicalProductionFixture.file,'tests/fixtures/core-importer-production-v1.json');
 assert.equal(value.historicalProductionFixture.baseline,fixture.baseline);
 assert.equal(value.historicalProductionFixture.sha256,historicalFixtureSHA);
 assert.equal(value.historicalProductionFixture.unchangedRowsVerifiedAgainstBaseline,oldFiles.size);
 assert.equal(value.acceptedCorpus.file,acceptedCorpus);
 assert.equal(value.acceptedCorpus.gitBlob,tree.get(acceptedCorpus));
 assert(digestPattern.test(value.acceptedCorpus.sha256));
 const acceptedBytes=git('cat-file','blob',value.acceptedCorpus.gitBlob);
 assert.equal(value.acceptedCorpus.bytes,acceptedBytes.length,'The accepted corpus bytes must remain the Task A Git artifact');
 assert.equal(value.acceptedCorpus.sha256,sha(acceptedBytes),'The accepted corpus hash must remain the Task A Git artifact');
 const seen=new Set();
 for(const row of value.changes){
  assert(row.file&&!row.file.includes('\\')&&!/[?*\[\]{}]/.test(row.file)&&!path.posix.isAbsolute(row.file)&&
   path.posix.normalize(row.file)===row.file&&!row.file.split('/').some(part=>part==='..'||part==='.'||!part),'Core changes must name exact normalized literal files');
  assert(!seen.has(row.file),'Duplicate approved Core production file: '+row.file);seen.add(row.file);
  assert.equal(row.beforeSha256,oldFiles.get(row.file)?.sha256??null,'Incorrect prior production hash: '+row.file);
  assert(digestPattern.test(row.afterSha256)&&Number.isInteger(row.afterBytes)&&row.afterBytes>0,'Missing accepted bytes/hash: '+row.file);
  assert(row.reason&&row.authorization,'Every changed file needs its exact reason and owner-authorized scope');
  assert.notEqual(row.file,acceptedCorpus,'The accepted Task A corpus cannot be waived as a production delta');
  assert(['CORE_INPUT','CORE_OUTPUT','CORE_EVIDENCE','CORE_MIXED_PAYLOAD','APPEND_ONLY_CORE_REGISTRY','PUBLICATION_MANIFEST'].includes(row.category),'Unknown Core change category: '+row.file);
  if(publicationBaselineForFile(row.file))assert.equal(row.category,'CORE_MIXED_PAYLOAD','An application publication must retain its immutable non-Core proof: '+row.file);
  if(row.category==='CORE_MIXED_PAYLOAD'){
   assert(row.proof?.file&&digestPattern.test(row.proof.sha256)&&row.proof.entry,'Mixed payload changes need their authenticated independent Core-only proof');
  }
  if(row.file===registryFile)assert.equal(row.category,'APPEND_ONLY_CORE_REGISTRY','The source registry requires entry-by-entry preservation');
 }
 return value;
}

function assertMixedPayloadProof(checkout,row){
 const bytes=fs.readFileSync(path.join(checkout,row.proof.file));
 assert.equal(sha(bytes),row.proof.sha256,'Stale Core-only mixed-payload proof: '+row.file);
 const proof=JSON.parse(bytes),entry=proof.entries?.find(value=>value.id===row.proof.entry&&value.file===row.file);
 assert(entry&&entry.status==='PASS','Missing Core-only comparison for '+row.file);
 assert.equal(entry.afterSha256,row.afterSha256,'The proof describes another publication: '+row.file);
 assert(Array.isArray(entry.unchangedParts)&&entry.unchangedParts.length,'A mixed-payload proof must preserve explicit non-Core parts');
 for(const part of entry.unchangedParts){
  assert(part.name&&digestPattern.test(part.beforeSha256));
  assert.equal(part.afterSha256,part.beforeSha256,'A non-Core part changed: '+row.file+' / '+part.name);
 }
 const before=publicationBaselineForFile(row.file);
 if(before){
  const payload=decodeSourceJSON(fs.readFileSync(path.join(checkout,row.file)),{sourceRoot:checkout});
  assert.equal(payload.book.id,before.bookId,'The mixed publication moved another book into '+row.file);
  const expected=JSON.parse(fs.readFileSync(path.join(checkout,'v2/fixtures/related-panel.json'))).books[payload.book.id]?.coreBoundary;
  const actual=assertCorePublicationSnapshot(payload,expected);
  const names=['nonCore','relatedRules','nonCoreCards','nonCoreFactManifest','glossaryOutsideCore','rest'];
  assert.deepEqual(entry.unchangedParts.map(part=>part.name).sort(),[...names].sort(),'The mixed publication proof must cover every non-Core component');
  for(const part of entry.unchangedParts){
   assert.equal(part.beforeSha256,before.hashes[part.name],'The proof changed its immutable baseline: '+row.file+' / '+part.name);
   assert.equal(part.afterSha256,actual.hashes[part.name],'The proof does not match the current publication: '+row.file+' / '+part.name);
  }
  assert.equal(entry.beforeCoreSha256,before.hashes.core);assert.equal(entry.afterCoreSha256,actual.hashes.core);
 }
}

export function assertProductionUnchanged(checkout,files=fixture.protectedFiles,approval=loadApprovedCoreChanges()){
 const changes=new Map(approval.changes.map(row=>[row.file,row]));
 for(const previous of files){
  const row=changes.get(previous.file),expected=row?{bytes:row.afterBytes,sha256:row.afterSha256}:previous;
  const file=path.join(checkout,previous.file);assert(fs.existsSync(file),'PRODUCTION_MISSING: '+previous.file);
  const bytes=fs.readFileSync(file);
  assert.equal(bytes.length,expected.bytes,'PRODUCTION_CHANGED: '+previous.file);
  assert.equal(sha(bytes),expected.sha256,'PRODUCTION_CHANGED: '+previous.file);
  if(row?.category==='CORE_MIXED_PAYLOAD')assertMixedPayloadProof(checkout,row);
  if(row?.category==='APPEND_ONLY_CORE_REGISTRY'){
   assertAppendOnlyRegistry(JSON.parse(git('show',baseline+':'+previous.file)),JSON.parse(bytes));
  }
 }
 return files.length;
}

export function assertAcceptedCoreCorpus(checkout,approval=loadApprovedCoreChanges()){
 const bytes=fs.readFileSync(path.join(checkout,acceptedCorpus));
 assert.equal(bytes.length,approval.acceptedCorpus.bytes,'ACCEPTED_CORE_CORPUS_CHANGED: '+acceptedCorpus);
 assert.equal(sha(bytes),approval.acceptedCorpus.sha256,'ACCEPTED_CORE_CORPUS_CHANGED: '+acceptedCorpus);
}

export function assertCorePublicationBoundary(manifest,approval=loadApprovedCoreChanges()){
 const changes=new Map(approval.changes.map(row=>[row.file,row]));
 const files=manifest.files.map(row=>row.path),downloads=manifest.publicSourceDownloads||[];
 for(const file of [...files,...downloads]){
  assert(!(file.startsWith(candidatePrefix)&&file!==acceptedCorpus)&&!file.startsWith(historicalPrefix),
   'UNACCEPTED_CORE_SOURCE_PUBLICATION: '+file);
  assert(oldFiles.has(file)||file===acceptedCorpus||changes.has(file),'UNLISTED_PRODUCTION_PUBLICATION: '+file);
 }
 assert.equal(files.filter(file=>file===acceptedCorpus).length,1,'The accepted Core corpus must be published exactly once');
 assert.equal(downloads.filter(file=>file===acceptedCorpus).length,1,'The accepted Core corpus must have its source download');
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const evidence=createQaEvidenceDir('wh-core-importer-isolation-');
 const temp=createQaTempDir('wh-core-importer-isolation-'),rows=[];let completed=false;
 try{
  const approval=loadApprovedCoreChanges(),checked=assertProductionUnchanged(root,fixture.protectedFiles,approval);
  // Explicit new production files have the same exact-byte rule as old ones.
  for(const row of approval.changes.filter(row=>!oldFiles.has(row.file))){
   const bytes=fs.readFileSync(path.join(root,row.file));assert.equal(bytes.length,row.afterBytes,'PRODUCTION_CHANGED: '+row.file);
   assert.equal(sha(bytes),row.afterSha256,'PRODUCTION_CHANGED: '+row.file);
   if(row.category==='CORE_MIXED_PAYLOAD')assertMixedPayloadProof(root,row);
  }
  assertAcceptedCoreCorpus(root,approval);
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'tools/pages-runtime-manifest.json')));
  assertCorePublicationBoundary(manifest,approval);
  rows.push({control:'only the literal reviewed Core changes differ from the authenticated production baseline',status:'PASS',files:checked,changed:approval.changes.length});
  for(const [name,file,append]of[
   ['changed production digital snapshot','books/core-rules/content/core-rules.digital-11e.json','\n'],
   ['reader connected directly to the historical candidate','books/core-rules/reader/build.mjs',"\nimport '../sources/waha-core-2026-11-11/core-rules.candidate.v1.json' with {type:'json'};\n"],
   ['foreign non-Core production mutation','books/death-guard/v2/generated/base.json','\n'],
   ['unlisted Core production mutation','books/core-rules/content/core-rules.source.en.js','\n']
  ]){
   const previous=oldFiles.get(file);assert(previous,'The negative control must name a protected file');
   if(name.includes('foreign')||name.includes('unlisted'))assert(!approval.changes.some(row=>row.file===file),'The immutable control must not be approved as a Core delta');
   const target=path.join(temp,file);fs.mkdirSync(path.dirname(target),{recursive:true});
   fs.writeFileSync(target,Buffer.concat([fs.readFileSync(path.join(root,file)),Buffer.from(append)]));
   assert.throws(()=>assertProductionUnchanged(temp,[previous],approval),error=>{
    assert.match(error.message,/PRODUCTION_CHANGED/);assert(error.message.includes(file));return true;
   },name+' must fail');rows.push({control:name,status:'PASS',mutationRejected:true,file});
  }
  for(const name of ['core-rules.candidate.v1.json','core-rules.html','rules-appendix.html','waha-core-corpus.manifest.json','waha-core-corpus.census.json','source-identities.v1.json','candidate-identities.v1.json','source-boundaries.v1.json','known-source-defects.v1.json','waha-core-player-visible-reference-census.v1.json']){
   const poisoned=structuredClone(manifest),file=candidatePrefix+name;
   poisoned.files.push({path:file,reasons:[{kind:'unaccepted-candidate'}]});
   assert.throws(()=>assertCorePublicationBoundary(poisoned,approval),error=>error.message.includes('UNACCEPTED_CORE_SOURCE_PUBLICATION: '+file));
   poisoned.files.pop();poisoned.publicSourceDownloads.push(file);
   assert.throws(()=>assertCorePublicationBoundary(poisoned,approval),error=>error.message.includes('UNACCEPTED_CORE_SOURCE_PUBLICATION: '+file));
   rows.push({control:'unaccepted Core artifact stays unpublished',status:'PASS',mutationRejected:true,file});
  }
  assertProductionUnchanged(root,fixture.protectedFiles,approval);completed=true;
  console.log(JSON.stringify({status:'PASS',productionFiles:checked,approvedCoreChanges:approval.changes.length,negativeControls:rows.length-1,evidence}));
 }finally{
  fs.writeFileSync(path.join(evidence,'RESULTS.json'),JSON.stringify({status:completed?'PASS':'FAIL',baseline,historicalProductionBaseline:fixture.baseline,rows},null,2)+'\n');cleanupQaTempDir(temp);
 }
}
