/** A committed activation must not replace the report's older publication truth. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {parseProducerJSON} from '../books/shared/source-refs-v2/producer-io.mjs';
import {readBookPassport,BOOK_PASSPORT_IDS} from '../books/shared/tools/book-passport.mjs';
import {publishedMfmSnapshot} from '../books/shared/tools/book-update-snapshots.mjs';
import {readCurrentMfmRelease} from '../mfm/content/current-mfm-release.mjs';
import {createQaTempDir,cleanupQaTempDir,qaTempEnvironment} from './helpers/qa-temp.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),release=readCurrentMfmRelease({repoRoot:root}),rows=[];
for(const id of BOOK_PASSPORT_IDS){
 const passport=readBookPassport(id,{root}),payload=parseProducerJSON(fs.readFileSync(path.join(root,passport.update.reportArtifact),'utf8'));
 const snapshot=publishedMfmSnapshot({root,head,bookId:id,passport,payload,sourceRegistryPath:release.sourceRegistryPath});
 const own=release.factions.find(f=>f.bookId===id),capture=JSON.parse(fs.readFileSync(path.join(root,own.capturePath),'utf8'));
 assert.equal(snapshot.capture.captureSha256,capture.captureSha256);rows.push({book:id,method:snapshot.method,version:snapshot.capture.version});
}
const scratch=createQaTempDir('wh-book-update-snapshot-'),copy=path.join(scratch,'checkout');
try{
 execFileSync('git',['clone','--local','--no-hardlinks','--config','core.autocrlf=false',root,copy],{env:qaTempEnvironment(),stdio:'pipe'});
 const pointer=JSON.parse(fs.readFileSync(path.join(copy,'mfm/current.json'),'utf8'));
 // A deliberately incomplete synthetic activation tests only historical report
 // selection. It is never passed to source authentication or a factual builder.
 pointer.version='v1.999';fs.writeFileSync(path.join(copy,'mfm/current.json'),JSON.stringify(pointer,null,2)+'\n');
 const identity={...qaTempEnvironment(),GIT_AUTHOR_NAME:'Synthetic QA',GIT_AUTHOR_EMAIL:'qa@example.invalid',GIT_COMMITTER_NAME:'Synthetic QA',GIT_COMMITTER_EMAIL:'qa@example.invalid'};
 execFileSync('git',['add','mfm/current.json'],{cwd:copy,env:identity});execFileSync('git',['commit','-m','test: synthetic pointer changed without rebuilding publication'],{cwd:copy,env:identity,stdio:'pipe'});
 const changedHead=execFileSync('git',['rev-parse','HEAD'],{cwd:copy,encoding:'utf8'}).trim();
 for(const id of BOOK_PASSPORT_IDS){const passport=readBookPassport(id,{root}),payload=parseProducerJSON(fs.readFileSync(path.join(root,passport.update.reportArtifact),'utf8'));
  const snapshot=publishedMfmSnapshot({root:copy,head:changedHead,bookId:id,passport,payload,sourceRegistryPath:release.sourceRegistryPath});
  assert.equal(snapshot.capture.version,release.version,'Committed pointer must not hide prices in the older HEAD publication');
 }
 console.log(JSON.stringify({status:'PASS',books:rows,committedPointerDoesNotReplacePublicationBaseline:true}));
}finally{cleanupQaTempDir(scratch);}
