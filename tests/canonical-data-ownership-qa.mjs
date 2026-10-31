import {cleanupQaTempDir,createQaTempDir} from './helpers/qa-temp.mjs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const readJson=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const run=(command,args)=>spawnSync(command,args,{cwd:repo,encoding:'utf8'});
const output=result=>`${result.stdout||''}\n${result.stderr||''}`;
const rejected=(result,pattern)=>{assert.notEqual(result.status,0,output(result));assert.match(output(result),pattern);};
const bundledPython=path.join(os.homedir(),'.cache','codex-runtimes','codex-primary-runtime','dependencies','python','python.exe');
const python=process.env.PYTHON||(fs.existsSync(bundledPython)?bundledPython:'python');
const runPython=args=>run(python,['-B',...args]);

const ecRoot=path.join(repo,'books','emperors-children');
const smRoot=path.join(repo,'books','space-marines');
const ecBook=readJson(path.join(ecRoot,'book.config.json'));
const smBook=readJson(path.join(smRoot,'book.config.json'));
const ecCanonical=path.resolve(ecRoot,ecBook.sources.codexDatasheets);
const smCanonical=path.resolve(smRoot,smBook.sources.codexDatasheets);
assert.equal(path.basename(ecCanonical),'emperors-children-codex-datasheets.en.json');
assert.equal(path.basename(smCanonical),'space-marines-codex-datasheets.en.json');
assert.ok(fs.existsSync(ecCanonical));
assert.ok(fs.existsSync(smCanonical));

const before={ec:hash(ecCanonical),sm:hash(smCanonical)};
const extractor=path.join(repo,'books','shared','tools','extract-bsdata-11e.mjs');
const ecConfig=readJson(path.join(ecRoot,'sources','bsdata-extract.config.json'));
assert.equal(ecConfig.writePolicy?.mode,'candidate-only');

const fixtureRoot=createQaTempDir('canonical-ownership-');
try{
  const configPath=path.join(fixtureRoot,'ec-config.json');
  fs.writeFileSync(configPath,JSON.stringify({
    schema:1,
    faction:{id:'emperors-children',title:"Emperor's Children"},
    writePolicy:{mode:'candidate-only'},
    source:{repository:'fixture',commit:'fixture'},
    inputs:[{role:'faction',path:'missing-input.json'}],
    outputs:{snapshot:'snapshot.json',datasheets:'datasheets.json',points:'points.json'},
    filters:{blockedBranches:[],excludeNamePatterns:[],excludeNames:[],excludePrimaryCategories:[],imperialArmourNames:[]},
    enhancements:{detachments:[]}
  },null,2));

  rejected(run(process.execPath,[extractor,configPath]),/write-run requires --candidate-dir/);
  rejected(run(process.execPath,[extractor,configPath,'--candidate-dir',path.join(repo,'docs','candidate')]),/outside approved roots/);
  const ecRawTraversal=`${repo}${path.sep}tmp${path.sep}candidates${path.sep}emperors-children${path.sep}..${path.sep}..${path.sep}arch0-ec-traversal-outside`;
  rejected(run(process.execPath,[extractor,configPath,'--candidate-dir',ecRawTraversal]),/outside approved roots/);

  const approvedTemp=path.join(fixtureRoot,'ec-candidate');
  const tempResult=run(process.execPath,[extractor,configPath,'--candidate-dir',approvedTemp]);
  rejected(tempResult,/ENOENT|no such file/i);
  assert.doesNotMatch(output(tempResult),/outside approved roots|requires --candidate-dir/);

  const approvedRepo=path.join(repo,'tmp','candidates','emperors-children','ownership-qa');
  const repoResult=run(process.execPath,[extractor,configPath,'--candidate-dir',approvedRepo]);
  rejected(repoResult,/ENOENT|no such file/i);
  assert.doesNotMatch(output(repoResult),/outside approved roots|requires --candidate-dir/);

  const nonOptInPath=path.join(fixtureRoot,'non-opt-in-config.json');
  const nonOptIn=readJson(configPath);
  delete nonOptIn.writePolicy;
  fs.writeFileSync(nonOptInPath,JSON.stringify(nonOptIn,null,2));
  const nonOptInResult=run(process.execPath,[extractor,nonOptInPath]);
  rejected(nonOptInResult,/ENOENT|no such file/i);
  assert.doesNotMatch(output(nonOptInResult),/requires --candidate-dir/);

  const smScript=path.join(smRoot,'tools','build-bsdata-layer.py');
  rejected(runPython([smScript]),/write-run requires --candidate-dir/);
  rejected(runPython([smScript,'--candidate-dir',path.join(repo,'docs','candidate')]),/outside approved roots/);
  const smRawTraversal=`${repo}${path.sep}tmp${path.sep}candidates${path.sep}space-marines${path.sep}..${path.sep}..${path.sep}arch0-sm-traversal-outside`;
  rejected(runPython([smScript,'--candidate-dir',smRawTraversal]),/outside approved roots/);

  const pythonProbe=[
    'import importlib.util, pathlib, sys',
    `p=pathlib.Path(${JSON.stringify(smScript)})`,
    "s=importlib.util.spec_from_file_location('sm_candidate_guard',p)",
    'm=importlib.util.module_from_spec(s)',
    's.loader.exec_module(m)',
    'print(m.validate_candidate_destination(sys.argv[1]))'
  ].join(';');
  for(const approved of [path.join(fixtureRoot,'sm-candidate'),path.join(repo,'tmp','candidates','space-marines','ownership-qa')]){
    const result=runPython(['-c',pythonProbe,approved]);
    assert.equal(result.status,0,output(result));
  }

  const builder=fs.readFileSync(path.join(repo,'books','shared','tools','build-army-book.mjs'),'utf8');
  assert.match(builder,/readJson\(config\.sources\.codexDatasheets\)/);
  assert.deepEqual({ec:hash(ecCanonical),sm:hash(smCanonical)},before);
}finally{
  cleanupQaTempDir(fixtureRoot);
}

console.log('Canonical data ownership QA passed');
