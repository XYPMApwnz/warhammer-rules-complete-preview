import {cleanupQaTempDir,createQaTempDir} from './helpers/qa-temp.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const relativeRoot=path.join('books','adeptus-mechanicus');
const canonical=path.join(root,relativeRoot,'content','adeptus-mechanicus-codex-datasheets.en.json');
const fixture=createQaTempDir('am-datasheet-owner-');
const fixtureRoot=path.join(fixture,relativeRoot);
const copy=relative=>{
  const source=path.join(root,relativeRoot,relative),target=path.join(fixtureRoot,relative);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.copyFileSync(source,target);
};
const copyRepoPath=relative=>{
  const source=path.join(root,relative),target=path.join(fixture,relative);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.cpSync(source,target,{recursive:true});
};
const run=()=>spawnSync(process.execPath,[path.join(fixtureRoot,'tools','extract-datasheets.mjs')],{cwd:fixture,encoding:'utf8'});
const output=path.join(fixtureRoot,'content','adeptus-mechanicus-codex-datasheets.en.json');

try{
  for(const file of ['book.config.json','tools/extract-datasheets.mjs','tools/source-hash.mjs','sources/bsdata-adeptus-mechanicus-11e.json','content/adeptus-mechanicus-points.en.json'])copy(file);
  copyRepoPath('books/shared/tools/army-core-ability-binding.mjs');
  copyRepoPath('books/shared/content/army-ability-source-bindings.v1.json');
  copyRepoPath('books/shared/canonical-content-v2/effective-content.mjs');
  copyRepoPath('books/core-rules/content');
  copyRepoPath('books/core-rules/sources/waha-core-2026-09-25');
  // Core construction validates its bound page-image evidence as well as its
  // modules. Stage only the assets declared by the existing source bindings.
  const coreContent=path.join('books','core-rules','content');
  const coreEvidence=JSON.parse(fs.readFileSync(path.join(root,coreContent,'core-effective-bindings.v1.json'),'utf8'));
  for(const evidence of coreEvidence.pageImageEvidence)copyRepoPath(path.join(coreContent,evidence.artifact));

  const absent=run();
  assert.equal(absent.status,0,`${absent.stdout||''}${absent.stderr||''}`);
  const expected=fs.readFileSync(canonical,'utf8');
  assert.equal(fs.readFileSync(output,'utf8'),expected,'AM Datasheet producer cannot reconstruct the canonical snapshot without its previous output');

  const poisoned=JSON.parse(expected);
  poisoned.datasheets[0].id='poisoned-previous-output';
  poisoned.datasheets[0].composition='poisoned previous composition';
  poisoned.datasheets[0].invulnerable='99+';
  poisoned.datasheets[0].undeclaredFact='poison';
  fs.writeFileSync(output,`${JSON.stringify(poisoned,null,2)}\n`);
  const rerun=run();
  assert.equal(rerun.status,0,`${rerun.stdout||''}${rerun.stderr||''}`);
  assert.equal(fs.readFileSync(output,'utf8'),expected,'AM Datasheet producer retained facts from a poisoned previous output');

  // Sensitivity control: mutate only the disposable producer to take its
  // datasheets from the poisoned previous output. It must execute normally,
  // then fail the same exact-output ownership comparison used above.
  const stagedProducer=path.join(fixtureRoot,'tools','extract-datasheets.mjs');
  const producer=fs.readFileSync(stagedProducer,'utf8'),anchor='const output=`${JSON.stringify(result,null,2)}\\n`;';
  assert.equal(producer.split(anchor).length,2,'Ownership mutation anchor must resolve exactly once');
  fs.writeFileSync(stagedProducer,producer.replace(anchor,
    "if(fs.existsSync(outputPath))result.datasheets=JSON.parse(fs.readFileSync(outputPath,'utf8')).datasheets;\n"+anchor));
  fs.writeFileSync(output,`${JSON.stringify(poisoned,null,2)}\n`);
  const mutated=run();
  assert.equal(mutated.status,0,`${mutated.stdout||''}${mutated.stderr||''}`);
  assert.throws(()=>assert.equal(fs.readFileSync(output,'utf8'),expected,
    'AM Datasheet producer retained facts from a poisoned previous output'),assert.AssertionError,
    'Source ownership assertion must reject a producer that consumes previous generated facts');
}finally{
  cleanupQaTempDir(fixture);
}

console.log('AM Datasheet source ownership QA passed: absent and poisoned previous outputs reconstruct identically; previous-output ownership mutation detected.');
