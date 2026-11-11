import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createQaTempDir,cleanupQaTempDir} from '../../../tests/helpers/qa-temp.mjs';

const coreRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const repoRoot=path.resolve(coreRoot,'../..');
const temporary=createQaTempDir('core-see-also-regression-');
const stagedCore=path.join(temporary,'books/core-rules');
const stagedReader=path.join(stagedCore,'reader');
const fixed="if(seeAlso&&line!=='PROFILES AND WEAPONS'){flush();seeAlso=false;}";
const old="if(seeAlso&&line!=='PROFILES AND WEAPONS')seeAlso=false;";
const paragraph='An ordinary paragraph follows the reference list.';

function inspect(html,ownerId,targetId){
  const card=html.match(new RegExp(`<article[^>]*data-rule-id="${ownerId}"[^>]*>[\\s\\S]*?<\\/article>`))?.[0];
  assert(card,'synthetic owning card is missing');
  assert.match(card,/<h4 class="see-also">See also<\/h4>/,'SEE ALSO heading must survive a following ordinary paragraph');
  assert.match(card,new RegExp(`<h4 class="see-also">See also<\\/h4><ul><li><button[^>]*data-term="${targetId}"[^>]*>Using Stratagems<\\/button><\\/li><\\/ul><p>${paragraph}<\\/p>`),'source reference must remain a real popup button and the following paragraph must stay separate');
}

try{
  fs.mkdirSync(stagedReader,{recursive:true});
  for(const folder of ['content','sources','tools'])fs.cpSync(path.join(coreRoot,folder),path.join(stagedCore,folder),{recursive:true});
  for(const file of ['build.mjs','term-bindings.mjs','presentation.mjs','presentation-bindings.json'])fs.copyFileSync(path.join(coreRoot,'reader',file),path.join(stagedReader,file));
  fs.mkdirSync(path.join(temporary,'books/shared'),{recursive:true});
  fs.cpSync(path.join(repoRoot,'books/shared/canonical-content-v2'),path.join(temporary,'books/shared/canonical-content-v2'),{recursive:true});
  fs.copyFileSync(path.join(repoRoot,'books/shared/runtime-asset-versions.json'),path.join(temporary,'books/shared/runtime-asset-versions.json'));
  const bindings=JSON.parse(fs.readFileSync(path.join(stagedCore,'content/core-effective-bindings.v1.json')));
  for(const image of bindings.pageImageEvidence){
    const target=path.resolve(stagedCore,'content',image.artifact);
    fs.mkdirSync(path.dirname(target),{recursive:true});
    fs.copyFileSync(path.resolve(coreRoot,'content',image.artifact),target);
  }
  const file=path.join(stagedCore,'content/core-rules.digital-11e.json');
  const snapshot=JSON.parse(fs.readFileSync(file));
  const synthetic=snapshot.records.find(record=>record.code==='02.01');
  synthetic.text=`SEE ALSO\n• Using Stratagems 15.01\n${paragraph}`;
  delete synthetic.content;
  fs.writeFileSync(file,JSON.stringify(snapshot,null,2)+'\n');
  const identities=JSON.parse(fs.readFileSync(path.join(stagedCore,'content/core-identities.v1.json')));
  const build=()=>{
    execFileSync(process.execPath,[path.join(stagedReader,'build.mjs')],{cwd:temporary,stdio:'pipe'});
    return fs.readFileSync(path.join(stagedReader,'datasheets.html'),'utf8');
  };
  inspect(build(),identities.rules['02.01'],identities.rules['15.01']);
  const builder=path.join(stagedReader,'build.mjs'),source=fs.readFileSync(builder,'utf8');
  assert.equal(source.split(fixed).length-1,1,'the actual reader must contain exactly one approved flush-before-reset path');
  fs.writeFileSync(builder,source.replace(fixed,old));
  assert.throws(()=>inspect(build(),identities.rules['02.01'],identities.rules['15.01']),/SEE ALSO heading must survive/,'restoring the old reset-before-flush implementation must fail the same behavioral assertion');
  console.log(JSON.stringify({status:'PASS',actualReaderBuilds:2,syntheticReference:'15.01',separateFollowingParagraph:true,oldImplementationMutation:'FAIL_AS_EXPECTED'}));
}finally{
  cleanupQaTempDir(temporary);
}
