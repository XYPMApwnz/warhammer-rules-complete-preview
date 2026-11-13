/** The independent source reader must retain pinned bytes and overlay guards. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readAcceptedSourceCorpus} from './accepted-source-corpus.mjs';
import {readBookPassport} from '../../books/shared/tools/book-passport.mjs';
import {createQaTempDir,cleanupQaTempDir} from './qa-temp.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const corpusPath='books/death-guard/sources/waha-11e-current-2026-09-25/corpus.json';
const enrollmentPath='books/death-guard/v2/sources/source-enrollment.json';
const enrollment=JSON.parse(fs.readFileSync(path.join(root,enrollmentPath),'utf8'));
const officialInputPath=readBookPassport('death-guard',{root}).official.input;
const updates=JSON.parse(fs.readFileSync(path.join(root,officialInputPath),'utf8'));
const operation=updates.entries.find(row=>row.id==='gw-death-guard-faction-pack-v1.3-2026-09-30:operation:055');
assert.ok(operation,'Previously accepted Death Approaches correction');
const original=JSON.parse(fs.readFileSync(path.join(root,corpusPath),'utf8'));
const section=corpus=>corpus.datasheets.flatMap(row=>row.sections).find(row=>row.sourceId===operation.target.id);
assert.equal(section(original).blocks[1].text,operation.expectedBefore);
assert.equal(section(readAcceptedSourceCorpus(root,corpusPath,enrollmentPath,officialInputPath)).blocks[1].text,operation.after);
const scratch=createQaTempDir('wh-accepted-corpus-qa-');
try{
 for(const file of new Set([corpusPath,enrollmentPath,officialInputPath,...enrollment.sources.flatMap(source=>source.path?[source.path]:[])])){
  const target=path.join(scratch,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,file),target);
 }
 const corpusFile=path.join(scratch,corpusPath),ledgerFile=path.join(scratch,officialInputPath);
 const raw=fs.readFileSync(corpusFile);fs.appendFileSync(corpusFile,' ');
 assert.throws(()=>readAcceptedSourceCorpus(scratch,corpusPath,enrollmentPath,officialInputPath),/corpus integrity/);fs.writeFileSync(corpusFile,raw);
 const source=enrollment.sources.find(row=>row.id===operation.source.id),document=path.join(scratch,source.path);
 const bytes=fs.readFileSync(document);fs.appendFileSync(document,' ');
 assert.throws(()=>readAcceptedSourceCorpus(scratch,corpusPath,enrollmentPath,officialInputPath),/source integrity/);fs.writeFileSync(document,bytes);
 const bad=structuredClone(updates);bad.entries.find(row=>row.id===operation.id).expectedBefore+=' invalid';
 fs.writeFileSync(ledgerFile,JSON.stringify(bad));
 assert.throws(()=>readAcceptedSourceCorpus(scratch,corpusPath,enrollmentPath,officialInputPath),/GW update no longer matches/);
 bad.entries.find(row=>row.id===operation.id).expectedBefore=operation.expectedBefore;
 bad.entries.find(row=>row.id===operation.id).provenance.page=0;
 fs.writeFileSync(ledgerFile,JSON.stringify(bad));
 assert.throws(()=>readAcceptedSourceCorpus(scratch,corpusPath,enrollmentPath,officialInputPath),/page locator/);
 console.log('Accepted source corpus: PASS (existing correction, 4 negative integrity/locator controls)');
}finally{cleanupQaTempDir(scratch);}
