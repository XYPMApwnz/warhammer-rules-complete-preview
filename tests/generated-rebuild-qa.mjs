/** Real Git checkouts exercise exact comparison and dirty-source rejection. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync,execFileSync} from 'node:child_process';
import {createQaTempDir,cleanupQaTempDir,qaTempEnvironment,createQaEvidenceDir} from './helpers/qa-temp.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const temp=createQaTempDir('wh-generated-rebuild-controls-');
const out=createQaEvidenceDir('wh-generated-rebuild-controls-evidence-');
const module=new URL('../books/shared/tools/check-generated-rebuild.mjs',import.meta.url).href;
const file='books/core-rules/reader/search-index.json';
const producer='books/core-rules/reader/build.mjs';
const original=fs.readFileSync(path.join(root,file)),rows=[];
let completed=false;
try{
  // The wrapper changes only the disposable clone's output after its real build.
  const corruptProducer=path.join(temp,'corrupt-output.mjs');
  fs.writeFileSync(corruptProducer,`import fs from 'node:fs';import {spawnSync} from 'node:child_process';
const run=spawnSync(process.execPath,[${JSON.stringify(producer)}],{stdio:'inherit'});
if(run.status!==0)process.exit(run.status??1);
fs.appendFileSync(${JSON.stringify(file)},' ');
`);
  for(const corrupt of [false,true]){
    const evidence=path.join(out,corrupt?'stale':'fresh');
    const plan={files:[file],excluded:[],steps:[{book:'core',producer:corrupt?corruptProducer:producer,args:[],runtime:'node',outputs:[file]}]};
    const source=`import {checkGeneratedRebuild} from ${JSON.stringify(module)};await checkGeneratedRebuild(${JSON.stringify({root,out:evidence,plan})});`;
    const run=spawnSync(process.execPath,['--input-type=module','-e',source],{encoding:'utf8',env:qaTempEnvironment(),maxBuffer:16*1024*1024});
    assert(fs.existsSync(evidence),run.stderr);
    fs.writeFileSync(path.join(evidence,'command.log'),run.stdout+run.stderr);
    const result=JSON.parse(fs.readFileSync(path.join(evidence,'RESULTS.json')));
    assert.equal(run.status,corrupt?1:0,run.stderr);
    assert.equal(result.status,corrupt?'BLOCKED':'PASS');
    assert.equal(result.checkout.head,execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim());
    assert(fs.readFileSync(path.join(root,file)).equals(original),'The source generated output was modified');
    if(corrupt){
      assert.equal(result.steps[0].status,'STALE');assert.equal(result.steps[0].differences[0].file,file);
      assert(run.stderr.includes(`Stale generated file ${file}; rebuild with: node ${corruptProducer}`));
    }
    rows.push({control:corrupt?'tampered clone output after real producer':'matching real producer output',exitCode:run.status,status:'PASS',command:[process.execPath,'--input-type=module','-e',source],evidence});
  }
  // A genuine clone provides a dirty-input control without synthetic commits.
  const dirty=path.join(temp,'dirty-checkout'),cloneLog=path.join(out,'dirty-checkout.log'),fd=fs.openSync(cloneLog,'w');
  try{
    execFileSync('git',['clone','--local','--no-hardlinks','--config','core.autocrlf=false',root,dirty],{stdio:['ignore',fd,fd]});
  }finally{fs.closeSync(fd);}
  fs.appendFileSync(path.join(dirty,file),' ');
  const evidence=path.join(out,'dirty');
  const source=`import {checkGeneratedRebuild} from ${JSON.stringify(module)};await checkGeneratedRebuild(${JSON.stringify({root:dirty,out:evidence})});`;
  const run=spawnSync(process.execPath,['--input-type=module','-e',source],{encoding:'utf8',env:qaTempEnvironment()});
  fs.writeFileSync(path.join(out,'dirty-command.log'),run.stdout+run.stderr);
  assert.equal(run.status,1);assert.match(run.stderr,/requires a clean working tree/);
  assert(!fs.existsSync(evidence),'Dirty-source rejection must precede scratch/evidence preparation');
  rows.push({control:'dirty tracked source rejected before clone/build',exitCode:run.status,status:'PASS'});
  completed=true;
  console.log(JSON.stringify({status:'PASS',controls:rows.length,evidence:out}));
}finally{
  fs.writeFileSync(path.join(out,'CONTROLS.json'),JSON.stringify({status:completed?'PASS':'FAIL',rows},null,2)+'\n');
  cleanupQaTempDir(temp);
}
