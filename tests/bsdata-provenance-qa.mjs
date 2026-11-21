import {cleanupQaTempDir,createQaTempDir} from './helpers/qa-temp.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const extractor=path.join(repo,'books','shared','tools','extract-bsdata-11e.mjs');
const root=createQaTempDir('bsdata-provenance-');
const run=(command,args,cwd=root)=>spawnSync(command,args,{cwd,encoding:'utf8'});
const output=result=>`${result.stdout||''}\n${result.stderr||''}`;
try{
  assert.equal(run('git',['init','-q']).status,0);
  assert.equal(run('git',['config','user.email','qa@example.invalid']).status,0);
  assert.equal(run('git',['config','user.name','QA']).status,0);
  fs.writeFileSync(path.join(root,'Faction.json'),JSON.stringify({catalogue:{id:'fixture',name:'Fixture',selectionEntries:[],sharedSelectionEntries:[],sharedSelectionEntryGroups:[],sharedProfiles:[],sharedRules:[],categoryEntries:[],costTypes:[]}},null,2));
  assert.equal(run('git',['add','Faction.json']).status,0);
  assert.equal(run('git',['commit','-qm','fixture']).status,0);
  const head=run('git',['rev-parse','HEAD']).stdout.trim();
  const config={schema:1,faction:{id:'fixture',title:'Fixture'},source:{repository:'fixture',commit:head},inputs:[{role:'faction',path:'Faction.json'}],outputs:{snapshot:'snapshot.json',datasheets:'datasheets.json',points:'points.json'},filters:{blockedBranches:[],excludeNamePatterns:[],excludeNames:[],excludePrimaryCategories:[],imperialArmourNames:[]},enhancements:{detachments:[]}};
  const configPath=path.join(root,'config.json');
  fs.writeFileSync(configPath,JSON.stringify(config,null,2));

  const good=run(process.execPath,[extractor,configPath]);
  assert.equal(good.status,0,output(good));
  assert.equal(JSON.parse(fs.readFileSync(path.join(root,'snapshot.json'),'utf8')).source.commit,head);
  for(const file of ['snapshot.json','datasheets.json','points.json']){
    const outputPath=path.join(root,file);
    fs.writeFileSync(outputPath,fs.readFileSync(outputPath,'utf8').replace(/\n/g,'\r\n'));
  }
  const crlfCheck=run(process.execPath,[extractor,configPath,'--check']);
  assert.equal(crlfCheck.status,0,output(crlfCheck));

  config.source.commit='0'.repeat(40);fs.writeFileSync(configPath,JSON.stringify(config,null,2));
  const mismatch=run(process.execPath,[extractor,configPath]);
  assert.notEqual(mismatch.status,0,output(mismatch));
  assert.match(output(mismatch),/configured commit .* does not match checkout HEAD/);

  config.source.commit=head;fs.writeFileSync(configPath,JSON.stringify(config,null,2));
  fs.appendFileSync(path.join(root,'Faction.json'),'\n');
  const dirty=run(process.execPath,[extractor,configPath]);
  assert.notEqual(dirty.status,0,output(dirty));
  assert.match(output(dirty),/configured inputs differ from HEAD/);
  assert.equal(run('git',['checkout','--','Faction.json']).status,0);

  const external=createQaTempDir('bsdata-external-');
  const secondary=createQaTempDir('bsdata-secondary-');
  try{
    for(const checkout of [external,secondary]){
      assert.equal(run('git',['init','-q'],checkout).status,0);
      assert.equal(run('git',['config','user.email','qa@example.invalid'],checkout).status,0);
      assert.equal(run('git',['config','user.name','QA'],checkout).status,0);
    }
    fs.copyFileSync(path.join(root,'Faction.json'),path.join(external,'Faction.json'));
    fs.copyFileSync(path.join(root,'Faction.json'),path.join(secondary,'Library.json'));
    assert.equal(run('git',['add','Faction.json'],external).status,0);assert.equal(run('git',['commit','-qm','external'],external).status,0);
    assert.equal(run('git',['add','Library.json'],secondary).status,0);assert.equal(run('git',['commit','-qm','secondary'],secondary).status,0);
    const externalHead=run('git',['rev-parse','HEAD'],external).stdout.trim(),secondaryHead=run('git',['rev-parse','HEAD'],secondary).stdout.trim();
    fs.copyFileSync(path.join(root,'Faction.json'),path.join(root,'Derived.json'));
    assert.equal(run('git',['add','Derived.json']).status,0);assert.equal(run('git',['commit','-qm','derived input']).status,0);
    config.source={repository:'fixture',checkout:external,commit:externalHead};
    config.inputs=[
      {role:'faction',path:path.join(external,'Faction.json')},
      {role:'library',path:path.join(secondary,'Library.json'),provenance:{checkout:secondary,commit:secondaryHead}},
      {role:'enhancement-index',path:'Derived.json',provenance:{kind:'repository-generated',checkout:root,producer:'fixture-builder'}}
    ];
    fs.writeFileSync(configPath,JSON.stringify(config,null,2));
    const grouped=run(process.execPath,[extractor,configPath]);
    assert.equal(grouped.status,0,output(grouped));
    const documents=JSON.parse(fs.readFileSync(path.join(root,'snapshot.json'),'utf8')).documents;
    assert.deepEqual(documents[1].provenance,{repository:'fixture',commit:secondaryHead});
    assert.deepEqual(documents[2].provenance,{kind:'repository-generated',producer:'fixture-builder'});
    fs.appendFileSync(path.join(root,'Derived.json'),'\n');
    const dirtyDerived=run(process.execPath,[extractor,configPath]);
    assert.notEqual(dirtyDerived.status,0,output(dirtyDerived));
    assert.match(output(dirtyDerived),/repository inputs differ from HEAD/);
  }finally{
    cleanupQaTempDir(external);cleanupQaTempDir(secondary);
  }

  const nongit=createQaTempDir('bsdata-nongit-');
  try{
    fs.writeFileSync(path.join(nongit,'Faction.json'),'{}');
    config.source.checkout=nongit;config.inputs=[{role:'faction',path:path.join(nongit,'Faction.json')}];fs.writeFileSync(configPath,JSON.stringify(config,null,2));
    const invalid=run(process.execPath,[extractor,configPath]);
    assert.notEqual(invalid.status,0,output(invalid));
    assert.match(output(invalid),/BSData source verification failed/);
  }finally{cleanupQaTempDir(nongit);}
}finally{cleanupQaTempDir(root);}

console.log('BSData checkout provenance QA passed: exact HEAD, tracked clean inputs, mismatch and non-Git rejection.');
