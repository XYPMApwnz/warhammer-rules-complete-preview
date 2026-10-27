import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createEffectiveMfmArmyProjection} from '../books/shared/tools/effective-mfm-army-projection.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const books=['death-guard','adeptus-mechanicus','tyranids','tau-empire','emperors-children','chaos-space-marines'];
const configPath=bookId=>path.join(root,'books',bookId,'book.config.json');
const readConfig=bookId=>JSON.parse(fs.readFileSync(configPath(bookId),'utf8'));
const activeOverrides=config=>[
  ...Object.keys(config.dependencyDatasheets?.pointOverrides||{}).map(id=>`unit:${id}`),
  ...Object.keys(config.dependencyDetachments?.pointOverridesById||{}).map(id=>`detachment:${id}`),
  ...Object.keys(config.dependencyDetachments?.pointOverrides||{}).map(id=>`detachment-title:${id}`)
];

const probe=process.argv.find(value=>value.startsWith('--probe='))?.slice('--probe='.length);
if(probe){
  const [bookId,kind]=probe.split(':'),target=path.resolve(configPath(bookId)),original=fs.readFileSync;
  fs.readFileSync=function(file,...args){
    const content=original.call(this,file,...args);
    if(path.resolve(String(file))!==target)return content;
    const config=JSON.parse(String(content));
    if(kind==='unit')(config.dependencyDatasheets??={}).pointOverrides={'unit-poison':{title:'Poison',points:[{label:'1 model',value:9999,minModels:1,maxModels:1}]}};
    else if(kind==='detachment')(config.dependencyDetachments??={}).pointOverridesById={'detachment-poison':{detachmentPoints:9999}};
    else throw new Error(`unknown numeric ownership probe ${kind}`);
    return args[0]?.includes?.('b')?Buffer.from(JSON.stringify(config)):JSON.stringify(config);
  };
  const {buildCanonicalBook}=await import(`${pathToFileURL(path.join(root,'books/shared/tools/build-army-book.mjs')).href}?numeric-owner-probe=${kind}`);
  const {createCanonicalBuildContext}=await import('../books/shared/tools/canonical-build-contract.mjs');
  await buildCanonicalBook(createCanonicalBuildContext({configPath:target,args:['--check']}),{projectionOnly:true});
  console.log(`${bookId} ${kind} config poison ignored by production build`);
}else{
  for(const bookId of books)assert.deepEqual(activeOverrides(readConfig(bookId)),[],`${bookId}: active config still competes with centralized MFM numeric ownership`);

  const producer=fs.readFileSync(path.join(root,'books/shared/tools/build-army-book.mjs'),'utf8');
  assert.doesNotMatch(producer,/dependencyPointOverrides|validateDependencyPointOverride|pointOverridesById|dependencyDetachmentScope\.pointOverrides/,'shared Army producer still consumes config numeric overrides after centralized MFM');

  for(const probeName of ['death-guard:unit','chaos-space-marines:detachment']){
    const child=spawnSync(process.execPath,[fileURLToPath(import.meta.url),`--probe=${probeName}`],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
    assert.equal(child.status,0,`${probeName} mutation survived or changed the production build:\n${child.stdout}\n${child.stderr}`);
  }

  console.log('MFM numeric ownership QA passed: 6/6 scoped configs have zero active competitors; schedule and Detachment Points config poisons have zero production influence.');
}
