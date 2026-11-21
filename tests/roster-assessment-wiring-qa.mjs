import {assertQaTempPath,cleanupQaTempDir,createQaTempDir} from './helpers/qa-temp.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {finishCanonicalBuild} from '../books/shared/tools/canonical-build-contract.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const temp=createQaTempDir('ra02-wiring-');
const versions={points:{data:9,validator:7}};
const validator='../../roster-guides/points-validator.js?v=7';
const anchor='../shared/roster-context.js?v=17';
const prefix='<script src="../../roster-guides/points-data.js?v=9"></script><script src="./unrelated.js?v=1"></script>';
const suffix='<script src="./after.js?v=1"></script>';
const single=`<script src="${anchor}"></script>`;
const urls=html=>[...html.matchAll(/<script\s+src="([^"]+)"\s*>\s*<\/script\s*>/g)].map(match=>match[1]);

function oracle(build){
  let controls=0;
  const context={root:temp,config:{id:'wiring-fixture'},runtimeVersions:versions,check:false};
  const generate=html=>{build(context,new Map([['reader.html',html]]));const result=fs.readFileSync(path.join(temp,'reader.html'),'utf8');build({...context,check:true},new Map([['reader.html',html]]));return result;};
  const ordered=(html,label)=>{
    const dependencies=urls(html);
    assert.equal(dependencies.filter(url=>url===validator).length,1,`${label}: validator exactly once`);
    assert.equal(dependencies.filter(url=>url===anchor).length,1,`${label}: context exactly once`);
    assert.deepEqual(dependencies,['../../roster-guides/points-data.js?v=9','./unrelated.js?v=1',validator,anchor,'./after.js?v=1'],`${label}: ordered dependencies`);
    assert.ok(html.startsWith(prefix)&&html.endsWith(suffix),`${label}: unrelated scripts unchanged`);
    controls++;
  };
  const expected=generate(prefix+single+suffix);ordered(expected,'single-line');
  for(const [label,tag] of [
    ['multiline-body',`<script src="${anchor}">\n</script>`],
    ['multiline-attributes',`<script\n  src="${anchor}"\n>\n</script>`],
    ['multiline-crlf',`<script\r\n\tsrc="${anchor}" >\r\n\t</script >`]
  ]){
    const result=generate(prefix+tag+suffix);ordered(result,label);
    assert.deepEqual(urls(result),urls(expected),`${label}: equivalent wiring`);
    assert.ok(result.includes(tag),`${label}: anchor formatting not rewritten`);
    assert.equal(generate(result),result,`${label}: repeated generation must not duplicate or reorder scripts`);
  }
  const existing=`<script\n src="${validator}">\n</script>`,alreadyWired=prefix+existing+`<script src="${anchor}">\n</script>`+suffix;
  assert.equal(generate(alreadyWired),alreadyWired,'existing multiline validator reference preserved');ordered(alreadyWired,'already-wired');
  for(const [label,tag] of [
    ['unrelated-script','<script src="./other-roster-context.js?v=17"></script>'],
    ['non-script',`<div src="${anchor}"></div>`],
    ['malformed',`<script src="${anchor}">`],
    ['inline-body',`<script src="${anchor}">notWhitespace()</script>`],
    ['wrong-attribute',`<script data-src="${anchor}"></script>`],
    ['nonmatching-version','<script src="../shared/roster-context.js?v=unknown"></script>']
  ]){const input=prefix+tag+suffix;assert.equal(generate(input),input,`${label}: no spurious dependency`);controls++;}
  return controls;
}

try{
  console.log(`RA02 assessment wiring: PASS (${oracle(finishCanonicalBuild)} controls)`);
  if(process.argv.includes('--mutations')){
    const source=fs.readFileSync(path.join(root,'books/shared/tools/canonical-build-contract.mjs'),'utf8');
    const currentMarker=source.split('\n').find(line=>line.includes('const marker='));
    const insertion=source.split('\n').find(line=>line.includes('assets.push')&&line.includes('points-validator.js'));
    assert.ok(currentMarker&&insertion,'exact production mutation anchors');
    const oldMarker=String.raw`      const marker=/<script src="\.\.\/shared\/roster-context\.js\?v=\d+"><\/script>/;`;
    const cases=[
      ['old-matcher',source.replace(currentMarker,oldMarker),/multiline-body: validator exactly once/],
      ['missing-validator',source.replace(insertion,''),/single-line: validator exactly once/],
      ['reversed-order',source.replace("content.replace(marker,match=>assets.join('')+match)","content.replace(marker,match=>match+assets.join(''))"),/single-line: ordered dependencies/]
    ];
    for(const [label,mutant,expected] of cases){
      assert.notEqual(mutant,source,`${label}: mutation applied`);
      const file=path.join(temp,label+'.mjs');fs.writeFileSync(file,mutant);
      const module=await import(pathToFileURL(file).href);let failure;
      try{oracle(module.finishCanonicalBuild);}catch(error){failure=error;}
      assert.ok(failure instanceof assert.AssertionError,`${label}: assertion failure required`);
      assert.match(failure.message,expected,`${label}: intended failure contract`);
      console.log(`${label}: KILLED (${failure.message.split('\n')[0]})`);
    }
    console.log(`Restored wiring oracle: PASS (${oracle(finishCanonicalBuild)} controls)`);
  }
}finally{
  assert.ok(assertQaTempPath(temp));
  assert.ok(path.basename(path.dirname(temp)).startsWith('ra02-wiring-'),'TEMP cleanup ownership');
  cleanupQaTempDir(temp);
}
