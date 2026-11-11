/** Candidate-only development must not change any accepted production byte. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createQaTempDir,cleanupQaTempDir,createQaEvidenceDir} from '../../../tests/helpers/qa-temp.mjs';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const fixturePath=new URL('../../../tests/fixtures/core-importer-production-v1.json',import.meta.url);
const fixtureBytes=fs.readFileSync(fixturePath);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
assert.equal(sha(fixtureBytes),'fd52f2bb9f7e2de1c02a8df7bb34addf45a32649aa58ff387161ff0c8cd1dab3',
 'Review the immutable production baseline before changing this fixture');
const fixture=JSON.parse(fixtureBytes);
assert.equal(fixture.schema,'core-importer-production-isolation/v1');
assert.equal(fixture.baseline,'7b15dc36425ac577b6928837ec9983409972e278');
const candidatePrefix='books/core-rules/sources/waha-core-2026-11-11/';

export function assertProductionUnchanged(checkout,files=fixture.protectedFiles){
 for(const row of files){
  const file=path.join(checkout,row.file);
  assert(fs.existsSync(file),'PRODUCTION_MISSING: '+row.file);
  const bytes=fs.readFileSync(file);
  assert.equal(bytes.length,row.bytes,'PRODUCTION_CHANGED: '+row.file);
  assert.equal(sha(bytes),row.sha256,'PRODUCTION_CHANGED: '+row.file);
 }
 return files.length;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const evidence=createQaEvidenceDir('wh-core-importer-isolation-');
 const temp=createQaTempDir('wh-core-importer-isolation-');
 const rows=[];
 let completed=false;
 try{
  const checked=assertProductionUnchanged(root);
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'tools/pages-runtime-manifest.json')));
  assert(!manifest.files.some(row=>row.path.startsWith(candidatePrefix)),
   'The candidate capture and candidate outputs must not be published');
  assert(!(manifest.publicSourceDownloads||[]).some(file=>file.startsWith(candidatePrefix)),
   'The candidate must not replace the accepted public source download');
  rows.push({control:'all accepted production bytes and runtime allowlist unchanged',status:'PASS',files:checked});
  for(const [name,file,mutate]of[
   ['changed production digital snapshot','books/core-rules/content/core-rules.digital-11e.json',bytes=>Buffer.concat([bytes,Buffer.from('\n')])],
   ['reader connected to candidate','books/core-rules/reader/build.mjs',bytes=>Buffer.concat([bytes,Buffer.from("\nimport '../sources/waha-core-2026-11-11/core-rules.candidate.v1.json' with {type:'json'};\n")])],
   ['candidate added to runtime publication','tools/pages-runtime-manifest.json',bytes=>{
    const value=JSON.parse(bytes);
    value.files.push({path:candidatePrefix+'core-rules.candidate.v1.json',reasons:[{kind:'unaccepted-candidate'}]});
    return Buffer.from(JSON.stringify(value)+'\n');
   }]
  ]){
   const accepted=fixture.protectedFiles.find(row=>row.file===file);
   assert(accepted,'The negative control must name a protected production file');
   const target=path.join(temp,file);
   fs.mkdirSync(path.dirname(target),{recursive:true});
   fs.writeFileSync(target,mutate(fs.readFileSync(path.join(root,file))));
   assert.throws(()=>assertProductionUnchanged(temp,[accepted]),error=>{
    assert.match(error.message,/PRODUCTION_CHANGED/);
    assert(error.message.includes(file),'The rejected mutation must identify its production file');
    return true;
   },name+' must fail');
   rows.push({control:name,status:'PASS',mutationRejected:true,file});
  }
  assertProductionUnchanged(root);
  completed=true;
  console.log(JSON.stringify({status:'PASS',productionFiles:checked,negativeControls:rows.length-1,evidence}));
 }finally{
  fs.writeFileSync(path.join(evidence,'RESULTS.json'),JSON.stringify({status:completed?'PASS':'FAIL',baseline:fixture.baseline,rows},null,2)+'\n');
  cleanupQaTempDir(temp);
 }
}
