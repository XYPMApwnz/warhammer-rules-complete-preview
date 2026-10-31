import {cleanupQaTempDir,createQaTempDir} from './helpers/qa-temp.mjs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {
  aggregateArtifactHash,captureFetchText,createCaptureSession,readSourceRegistry,requireSourceToolMode,sha256,stableJson,
  verifyCaptureManifest,verifyFrozenSource
} from '../books/shared/tools/source-ingestion-contract.mjs';
import {verifyBsdataSource} from '../books/shared/tools/verify-bsdata-source.mjs';
import {buildSourceEnrollment} from '../books/shared/tools/source-enrollment-contract.mjs';
import {buildSourceStatus} from '../books/shared/tools/source-freshness.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const packageJson=JSON.parse(read('package.json'));
const registry=readSourceRegistry();
const freshness=buildSourceStatus();
const enrollment=buildSourceEnrollment({repo:root,includeFreshnessOnly:true});
assert.equal(freshness.summary.REGISTERED_SOURCE_COUNT,registry.sources.length);
const registeredBookSources=registry.sources.filter(source=>source.book!=='shared');
const activeKeys=new Set(enrollment.rows.map(source=>`${source.book}\0${source.sourceId}`));
const registeredActiveBookSources=registeredBookSources.filter(source=>activeKeys.has(`${source.book}\0${source.sourceId}`));
const registeredPublicSources=registeredActiveBookSources.filter(source=>source.book!=='orks');
assert.equal(freshness.summary.DECLARED_SOURCE_COUNT,registeredActiveBookSources.length);
assert.equal(freshness.summary.CLASSIFIED_DECLARED_SOURCE_COUNT,registeredActiveBookSources.length);
assert.equal(freshness.summary.PUBLIC_ACTIVE_SOURCE_COUNT,registeredPublicSources.length);
assert.equal(registeredBookSources.length-registeredActiveBookSources.length,1);
assert(registry.sources.some(source=>source.sourceId==='death-guard-mfm-v1.3-capture-2026-08-27'),'Historical DG MFM v1.3 provenance must remain registered');
assert.equal(freshness.summary.FRESHNESS_ONLY_ACTIVE_SOURCE_COUNT,3);
assert.equal(freshness.summary.UNCLASSIFIED_SOURCE_COUNT,0);
assert.equal(freshness.summary.REGISTERED_WITHOUT_MANIFEST_DECLARATION_COUNT,freshness.registeredWithoutManifest.length);
assert.deepEqual(freshness.summary.BOOKS_WITH_COMPLETE_SOURCE_ENROLLMENT,['death-guard','adeptus-mechanicus','tyranids','tau-empire','emperors-children','chaos-space-marines','space-marines','dark-angels','blood-angels','orks']);
assert.deepEqual(freshness.summary.BOOKS_WITH_PARTIAL_SOURCE_ENROLLMENT,[]);
assert.deepEqual(freshness.summary.BOOKS_WITH_NO_SOURCE_ENROLLMENT,[]);
assert.equal(freshness.sources.find(source=>source.SOURCE_ID==='tau-mfm-v1.3').UPSTREAM_OBSERVATION.status,'UPDATE_AVAILABLE');
const currentMfm=freshness.sources.filter(source=>source.BOOK!=='shared'&&source.SOURCE_ID.endsWith('-mfm-v1.4'));
assert.equal(currentMfm.length,9);
assert(currentMfm.every(source=>source.UPSTREAM_OBSERVATION.status==='CURRENT'),'Only authenticated v1.4 MFM captures may claim currentness');
const active=[
  ['books/space-marines/tools/extract-codex-details.cjs','space-marines-codex-details'],
  ['books/chaos-space-marines/tools/extract-mfm.cjs','csm-mfm-v1.3'],
  ['books/tau-empire/tools/extract-mfm.cjs','tau-mfm-v1.3'],
  ['books/tau-empire/tools/extract-wargear.cjs','tau-codex-wargear'],
  ['books/tau-empire/tools/extract-codex-parity.cjs','tau-codex-parity']
];
const legacy=[
  {tool:'books/adeptus-mechanicus/tools/extract-codex-rules.cjs',inputs:['books/adeptus-mechanicus/content/adeptus-mechanicus-codex-detachments.en.json'],outputs:['books/adeptus-mechanicus/content/adeptus-mechanicus-codex-parity.en.json']},
  {tool:'books/adeptus-mechanicus/tools/extract-wargear.cjs',inputs:['books/adeptus-mechanicus/content/adeptus-mechanicus-codex-datasheets.en.json','books/adeptus-mechanicus/content/adeptus-mechanicus-rules.en.json'],outputs:['books/adeptus-mechanicus/content/adeptus-mechanicus-codex-wargear.en.json']},
  {tool:'books/adeptus-mechanicus/tools/import-wahapedia-compatible-rules.mjs',inputs:['books/adeptus-mechanicus/content/adeptus-mechanicus-codex-datasheets.en.json','books/adeptus-mechanicus/content/adeptus-mechanicus-rules.en.json','books/adeptus-mechanicus/content/adeptus-mechanicus-codex-detachments.en.json'],outputs:['books/adeptus-mechanicus/sources/wahapedia-compatible-rules.snapshot.json','books/adeptus-mechanicus/reports/compatible-rules-import-report.json']},
  {tool:'books/death-guard/tools/import-wahapedia-compatible-rules.mjs',inputs:['books/death-guard/content/death-guard-rules.en.json'],outputs:['books/death-guard/sources/wahapedia-compatible-rules.snapshot.json','books/death-guard/reports/compatible-rules-import-report.json']},
  {tool:'books/emperors-children/tools/import-wahapedia-compatible-rules.mjs',inputs:['books/emperors-children/content/emperors-children-codex-datasheets.en.json','books/emperors-children/content/emperors-children-faction-pack.en.json','books/emperors-children/content/emperors-children-codex-parity.en.json'],outputs:['books/emperors-children/sources/wahapedia-compatible-rules.snapshot.json','books/emperors-children/reports/compatible-rules-import-report.json']},
  {tool:'books/tyranids/tools/extract-codex-parity.cjs',inputs:['books/tyranids/content/tyranids-points.en.json'],outputs:['books/tyranids/content/tyranids-codex-parity.en.json']},
  {tool:'books/tyranids/tools/extract-wargear.cjs',inputs:['books/tyranids/content/tyranids-codex-datasheets.en.json'],outputs:['books/tyranids/content/tyranids-codex-wargear.en.json']},
  {tool:'books/tyranids/tools/import-wahapedia-compatible-rules.mjs',inputs:['books/tyranids/content/tyranids-codex-datasheets.en.json','books/tyranids/content/tyranids-faction-pack.en.json','books/tyranids/content/tyranids-codex-parity.en.json'],outputs:['books/tyranids/sources/wahapedia-compatible-rules.snapshot.json','books/tyranids/reports/compatible-rules-import-report.json']},
  {tool:'books/tau-empire/tools/import-wahapedia-compatible-rules.mjs',inputs:['books/tau-empire/content/tau-empire-codex-datasheets.en.json','books/tau-empire/content/tau-empire-faction-pack.en.json','books/tau-empire/content/tau-empire-codex-parity.en.json'],outputs:['books/tau-empire/sources/wahapedia-compatible-rules.snapshot.json','books/tau-empire/reports/compatible-rules-import-report.json'],verify:true}
];

const walk=directory=>fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(directory,entry.name)):[path.join(directory,entry.name)]);
const networkSourceTools=walk(path.join(root,'books')).filter(file=>/[\\/]tools[\\/]/.test(file)&&!/[\\/]shared[\\/]tools[\\/]/.test(file)&&/\.(?:mjs|cjs|js|py)$/.test(file)&&/page\.goto\(|\bfetch\s*\(|https?\.get\(|chromium\.launch\(|urlopen\(|requests\.(?:get|post)\(|captureFetchText\(|capturePage\(/.test(fs.readFileSync(file,'utf8'))).map(file=>path.relative(root,file).replaceAll(path.sep,'/')).sort();
assert.deepEqual(networkSourceTools,[...active.map(([tool])=>tool),...registry.dormantLiveTools].sort(),'Every network-capable source tool must be enrolled as frozen-capture or guarded legacy workflow');
assert.deepEqual(legacy.map(item=>item.tool).sort(),[...registry.dormantLiveTools].sort(),'Every guarded legacy workflow must have an executable safety contract');

const acceptedBefore=new Map([...registry.sources.flatMap(source=>source.artifacts.map(artifact=>artifact.path)),...legacy.flatMap(item=>item.outputs)].map(artifact=>[artifact,sha256(fs.readFileSync(path.join(root,artifact)))]));
for(const [tool] of active){
  const executable=path.join(root,tool);
  for(const [args,message] of [
    [[],/choose exactly one mode/],
    [['--capture-update'],/candidate-dir/],
    [['--check','--capture-update','--candidate-dir',root],/choose exactly one mode/],
    [['--capture-update','--candidate-dir',root],/repository root/]
  ]){
    const result=spawnSync(process.execPath,[executable,...args],{cwd:root,encoding:'utf8'});
    assert.notEqual(result.status,0,`${tool}: unsafe source mode unexpectedly succeeded`);
    assert.match(`${result.stdout}${result.stderr}`,message,`${tool}: unsafe source mode did not fail at the expected boundary`);
  }
  const checked=spawnSync(process.execPath,[executable,'--check'],{cwd:root,encoding:'utf8'});
  assert.equal(checked.status,0,`${tool}: frozen --check failed: ${checked.stderr||checked.stdout}`);
}
for(const item of legacy){
  const executable=path.join(root,item.tool),source=read(item.tool),main=source.slice(source.indexOf('async function main'));
  assert(source.includes('beginLegacyCaptureTool'),`${item.tool}: legacy live lifecycle does not use the shared capture adapter`);
  assert(source.includes('captureFetchText')||source.includes('capturePage'),`${item.tool}: live input is not retained in the capture bundle`);
  assert(main.includes('session.writeCandidate')&&main.includes('session.finalize'),`${item.tool}: candidate output is not bound and finalized`);
  assert(!/fs\.writeFileSync\s*\(/.test(main),`${item.tool}: live CLI still writes accepted files directly`);
  for(const input of item.inputs)assert(source.includes(input),`${item.tool}: normalization input is not authenticated: ${input}`);
  for(const [args,message] of [
    [[],/choose exactly one mode/],
    [['--capture-update'],/candidate-dir/],
    [['--check','--capture-update','--candidate-dir',root],/choose exactly one mode/],
    [['--capture-update','--candidate-dir',root],/repository root/],
    [['--capture-update','--candidate-dir',path.dirname(path.join(root,item.outputs[0]))],/tmp\/source-candidates/]
  ]){
    const result=spawnSync(process.execPath,[executable,...args],{cwd:root,encoding:'utf8'});
    assert.notEqual(result.status,0,`${item.tool}: unsafe legacy source mode unexpectedly succeeded`);
    assert.match(`${result.stdout}${result.stderr}`,message,`${item.tool}: unsafe legacy source mode did not fail at the expected boundary`);
  }
  const checked=spawnSync(process.execPath,[executable,'--check'],{cwd:root,encoding:'utf8'});
  if(item.verify)assert.equal(checked.status,0,`${item.tool}: offline --check failed: ${checked.stderr||checked.stdout}`);
  else{assert.notEqual(checked.status,0,`${item.tool}: legacy --check claimed freshness without retained raw evidence`);assert.match(`${checked.stdout}${checked.stderr}`,/no retained raw capture/);}
}
for(const [artifact,before] of acceptedBefore)assert.equal(sha256(fs.readFileSync(path.join(root,artifact))),before,`${artifact}: frozen verification mutated an accepted artifact`);

for(const tool of ['books/adeptus-mechanicus/tests/codex-parity.cjs','books/adeptus-mechanicus/tests/datasheet-parity.cjs']){
  const result=spawnSync(process.execPath,[path.join(root,tool)],{cwd:root,encoding:'utf8'});
  assert.notEqual(result.status,0,`${tool}: mutable live diagnostic ran without explicit mode`);
  assert.match(`${result.stdout}${result.stderr}`,/--live-diagnostic/,`${tool}: missing explicit live-diagnostic guard`);
}

for(const [tool,sourceId] of active){
  const source=read(tool),modeIndex=source.indexOf('requireSourceToolMode'),returnIndex=source.indexOf("mode.kind==='verify'");
  assert(modeIndex>=0&&returnIndex>modeIndex,`${tool}: frozen verification mode must be selected before live work`);
  assert(!/^const .*require\(['"]playwright['"]\)/m.test(source),`${tool}: Playwright must not be loaded at module scope`);
  assert(source.includes('requireSourceToolMode')&&source.includes('candidateDir'),`${tool}: live source access must require explicit candidate capture mode`);
  const verified=verifyFrozenSource(sourceId);
  assert(verified.artifacts.length>0,`${sourceId}: no frozen artifacts verified`);
}

assert.throws(()=>requireSourceToolMode([],{toolName:'probe'}),/choose exactly one mode/);
assert.throws(()=>requireSourceToolMode(['--check','--capture-update'],{toolName:'probe'}),/choose exactly one mode/);
assert.throws(()=>requireSourceToolMode(['--capture-update'],{toolName:'probe'}),/candidate-dir/);
assert.deepEqual(requireSourceToolMode(['--check'],{toolName:'probe'}),{kind:'verify'});

const temp=createQaTempDir('warhammer-source-contract-');
try{
  const artifact=path.join(temp,'accepted.json');fs.writeFileSync(artifact,'{"ok":true}\r\n');
  const sourceRegistry={schema:'warhammer-source-ingestion/v1',sources:[{sourceId:'probe',artifacts:[{path:'accepted.json',normalization:'lf',sha256:sha256('{"ok":true}\n')}]}]};
  const registryPath=path.join(temp,'registry.json');fs.writeFileSync(registryPath,JSON.stringify(sourceRegistry));
  assert.equal(verifyFrozenSource('probe',{repoRoot:temp,registryPath}).artifacts.length,1);
  fs.writeFileSync(artifact,'{"ok":false}\n');
  assert.throws(()=>verifyFrozenSource('probe',{repoRoot:temp,registryPath}),/hash mismatch/);
  fs.rmSync(artifact);
  assert.throws(()=>verifyFrozenSource('probe',{repoRoot:temp,registryPath}),/missing/);

  assert.throws(()=>createCaptureSession({repoRoot:root,sourceId:'unsafe',authority:'official',sourceType:'html',candidateDir:path.join(root,'books','unsafe-candidate'),extractorPath:'tests/source-ingestion-contract-qa.mjs'}),/tmp\/source-candidates/);
  assert.throws(()=>createCaptureSession({repoRoot:root,sourceId:'repo-root',authority:'official',sourceType:'html',candidateDir:root,extractorPath:'tests/source-ingestion-contract-qa.mjs'}),/repository root/);
  assert.throws(()=>createCaptureSession({repoRoot:root,sourceId:'repo-parent',authority:'official',sourceType:'html',candidateDir:path.dirname(root),extractorPath:'tests/source-ingestion-contract-qa.mjs'}),/contain accepted production paths/);

  const captureRepo=path.join(temp,'capture-repo');fs.mkdirSync(path.join(captureRepo,'books'),{recursive:true});
  fs.writeFileSync(path.join(captureRepo,'package.json'),'{}\n');fs.writeFileSync(path.join(captureRepo,'books','source-ingestion-contract.json'),'{}\n');
  const captureGit=(...args)=>{const result=spawnSync('git',args,{cwd:captureRepo,encoding:'utf8'});assert.equal(result.status,0,result.stderr||result.stdout);};
  captureGit('init');captureGit('config','user.name','Source Contract QA');captureGit('config','user.email','source-contract@example.invalid');captureGit('add','.');captureGit('commit','-m','fixture');
  const capture=createCaptureSession({repoRoot:captureRepo,sourceId:'probe-live',authority:'official',sourceType:'html',candidateDir:path.join(temp,'capture'),extractorPath:'package.json',localInputs:[{path:'books/source-ingestion-contract.json',kind:'config-input',owner:'source registry'}]});
  assert.equal(JSON.parse(fs.readFileSync(path.join(capture.root,'capture-state.json'),'utf8')).status,'INCOMPLETE');
  capture.captureText({requestedUrl:'https://example.invalid/requested',finalUrl:'https://example.invalid/final',content:'<html>retained</html>',name:'index'});
  capture.writeCandidate('candidate.json','{"candidate":true}\n');
  const manifest=capture.finalize(),manifestPath=path.join(capture.root,'capture-manifest.json');
  assert.deepEqual(manifest.normalizationInputs.map(input=>input.path),['books/source-ingestion-contract.json']);
  assert.equal(JSON.parse(fs.readFileSync(path.join(capture.root,'capture-state.json'),'utf8')).status,'COMPLETE');
  assert.equal(verifyCaptureManifest(manifestPath,{repoRoot:captureRepo}).aggregateManifestHash,manifest.aggregateManifestHash);
  assert.throws(()=>createCaptureSession({repoRoot:captureRepo,sourceId:'reused',authority:'official',sourceType:'html',candidateDir:path.join(temp,'capture'),extractorPath:'package.json'}),/fresh isolated destination/);
  fs.writeFileSync(path.join(capture.root,'capture-state.json'),stableJson({schema:'warhammer-source-capture-state/v1',captureId:manifest.captureId,status:'INCOMPLETE'}));
  assert.throws(()=>verifyCaptureManifest(manifestPath,{repoRoot:captureRepo}),/completion state/);
  fs.writeFileSync(path.join(capture.root,'capture-state.json'),stableJson({schema:'warhammer-source-capture-state/v1',captureId:manifest.captureId,status:'COMPLETE',manifestSha256:sha256(stableJson(manifest))}));
  const candidatePath=path.join(capture.root,manifest.normalizedArtifacts[0].path),candidateBytes=fs.readFileSync(candidatePath);
  fs.appendFileSync(candidatePath,'tampered');
  assert.throws(()=>verifyCaptureManifest(manifestPath,{repoRoot:captureRepo}),/normalized artifact hash mismatch/);
  fs.writeFileSync(candidatePath,candidateBytes);fs.rmSync(candidatePath);
  assert.throws(()=>verifyCaptureManifest(manifestPath,{repoRoot:captureRepo}),/normalized artifact is missing/);
  fs.writeFileSync(candidatePath,candidateBytes);
  fs.appendFileSync(path.join(capture.root,manifest.rawArtifacts[0].path),'tampered');
  assert.throws(()=>verifyCaptureManifest(manifestPath,{repoRoot:captureRepo}),/artifact hash mismatch/);

  const fetchCapture=createCaptureSession({repoRoot:captureRepo,sourceId:'fetch-probe',authority:'secondary',sourceType:'html',candidateDir:path.join(temp,'fetch-capture'),extractorPath:'package.json'});
  const fetched=await captureFetchText(fetchCapture,'data:text/html,%3Cmain%3Eretained%3C%2Fmain%3E',{name:'local-data-input'});
  assert.equal(fetched,'<main>retained</main>');
  fetchCapture.writeCandidate('candidate.json','{"candidate":true}\n');
  const fetchManifest=fetchCapture.finalize();
  assert.equal(fetchManifest.rawArtifacts.length,1);
  assert.equal(fetchManifest.normalizedArtifacts.length,1);
  assert.equal(verifyCaptureManifest(path.join(fetchCapture.root,'capture-manifest.json'),{repoRoot:captureRepo}).aggregateManifestHash,fetchManifest.aggregateManifestHash);

  const trackedRoot=path.join(temp,'tracked-inputs');fs.mkdirSync(trackedRoot);
  const git=(...args)=>{const result=spawnSync('git',args,{cwd:trackedRoot,encoding:'utf8'});assert.equal(result.status,0,result.stderr||result.stdout);};
  git('init');git('config','user.name','Source Contract QA');git('config','user.email','source-contract@example.invalid');
  fs.writeFileSync(path.join(trackedRoot,'extractor.mjs'),'export default true;\n');fs.writeFileSync(path.join(trackedRoot,'input.json'),'{"current":true}\n');
  git('add','.');git('commit','-m','fixture');
  const trackedCapture=createCaptureSession({repoRoot:trackedRoot,sourceId:'tracked-probe',authority:'official',sourceType:'html',candidateDir:path.join(temp,'tracked-capture'),extractorPath:'extractor.mjs',localInputs:['input.json']});
  trackedCapture.captureText({requestedUrl:'https://example.invalid/input',finalUrl:'https://example.invalid/input',content:'<html>tracked</html>',name:'tracked'});trackedCapture.writeCandidate('candidate.json','{}\n');
  const trackedManifest=trackedCapture.finalize(),trackedManifestPath=path.join(trackedCapture.root,'capture-manifest.json');
  assert.equal(verifyCaptureManifest(trackedManifestPath,{repoRoot:trackedRoot}).normalizationInputs[0].sha256,trackedManifest.normalizationInputs[0].sha256);
  fs.writeFileSync(path.join(trackedRoot,'input.json'),'{"current":false}\n');
  assert.throws(()=>verifyCaptureManifest(trackedManifestPath,{repoRoot:trackedRoot}),/repository inputs differ from HEAD/);
  fs.writeFileSync(path.join(trackedRoot,'untracked.json'),'{}\n');
  assert.throws(()=>createCaptureSession({repoRoot:trackedRoot,sourceId:'untracked-probe',authority:'official',sourceType:'html',candidateDir:path.join(temp,'untracked-capture'),extractorPath:'extractor.mjs',localInputs:['untracked.json']}),/every repository input must be tracked/);
}finally{cleanupQaTempDir(temp);}

assert.throws(()=>verifyBsdataSource({checkout:root,expectedCommit:'0'.repeat(40),inputFiles:[path.join(root,'package.json')]}),/does not match checkout HEAD/,'BSData commit mismatch must fail closed');

const smWrapper=read('books/space-marines/tools/build-bsdata-layer.py');
assert(smWrapper.includes('config["source"]["checkout"] = str(checkout)'),'Space Marines wrapper must preserve an absolute authenticated checkout in its temporary config');
assert(smWrapper.includes('faction_path = (checkout / faction).resolve()'),'Space Marines wrapper must resolve faction inputs from the configured checkout');
const smFactionPackWrapper=read('books/space-marines/tools/extract-faction-pack.mjs');
const smFactionPackExtractor=read('books/space-marines/tools/extract-faction-pack.py');
const smFactionPackVerification=smFactionPackWrapper.indexOf('const authenticated=verify({checkout');
const smFactionPackSpawn=smFactionPackWrapper.indexOf('const result=spawn(python');
assert(smFactionPackVerification>=0&&smFactionPackVerification<smFactionPackSpawn,'Space Marines Faction Pack wrapper must authenticate its BSData inputs before starting the extractor');
assert(smFactionPackWrapper.includes('validateForwardedArguments(forwardedArguments);'),'Space Marines Faction Pack wrapper must validate its forwarded operator arguments');
assert(smFactionPackWrapper.includes("configuredInput('Imperium - Space Marines.json')")&&smFactionPackWrapper.includes("configuredInput('Library - Astartes Heresy Legends.json')"),'Space Marines Faction Pack wrapper must authenticate every BSData input consumed by the extractor');
assert(!smFactionPackExtractor.includes('tmp" / "bsdata-wh40k-11e"'),'Space Marines Faction Pack extractor must not read an ambient mutable checkout');
assert(smFactionPackExtractor.includes('parser.add_argument("--bsdata-faction", type=Path, required=True)')&&smFactionPackExtractor.includes('parser.add_argument("--bsdata-library", type=Path, required=True)'),'Space Marines Faction Pack extractor must require authenticated input paths');
assert(packageJson.scripts['army-books:sources:check'].includes('node books/space-marines/tools/extract-faction-pack.mjs --check'),'Normal source checking must use the authenticated Space Marines Faction Pack wrapper');
assert(packageJson.scripts['source:check'].includes('node tests/sm-authenticated-bsdata-argument-binding-qa.mjs'),'Normal source checking must enforce the Space Marines authenticated child-argument binding');
assert(packageJson.scripts['army-books:sources:check'].includes('node books/space-marines/tools/build-related-rules.mjs --check'),'Normal source checking must verify the deterministic Space Marines Related Rules aggregate');
assert(packageJson.scripts['space-marines:build'].startsWith('node books/space-marines/tools/build-related-rules.mjs'),'Normal Space Marines build must run the sole Related Rules aggregate writer');
const smCodexDetails=read('books/space-marines/tools/extract-codex-details.cjs');
const smSessionIndex=smCodexDetails.indexOf('contract.createCaptureSession({sourceId:');
for(const input of ['datasheetsPath','packPath']){
  assert(smCodexDetails.indexOf(`path:path.relative(path.resolve(root,'../..'),${input})`,smSessionIndex)>smSessionIndex,`Space Marines codex-details must authenticate ${input}`);
  assert(smCodexDetails.indexOf(`fs.readFileSync(${input}`,smSessionIndex)>smCodexDetails.indexOf(`path:path.relative(path.resolve(root,'../..'),${input})`,smSessionIndex),`Space Marines codex-details must authenticate ${input} before reading it`);
}
assert(!smCodexDetails.includes('relatedPath')&&!smCodexDetails.includes('previousRelated'),'Space Marines codex-details must not read the final Related Rules aggregate');
assert(!smFactionPackExtractor.includes('space-marines-related-rules.en.json')&&!smFactionPackExtractor.includes('existing_related'),'Space Marines Faction Pack extractor must not read the final Related Rules aggregate');
assert(!smCodexDetails.includes("fs.readFileSync(overlayPath"),'Space Marines codex-details must not read its previous overlay as factual input');
assert(!smCodexDetails.includes("path:path.relative(path.resolve(root,'../..'),overlayPath),kind:'generated-repository-input'"),'Space Marines codex-details must not authenticate its own previous overlay as a normalization input');
const coreInputDeclaration=smCodexDetails.indexOf("path:path.relative(path.resolve(root,'../..'),coreRelatedPath)",smSessionIndex);
assert(coreInputDeclaration>smSessionIndex,'Space Marines codex-details must authenticate its Core-owned Related Rules input');
assert(smCodexDetails.indexOf('coreRuleMap(),details=[]',smSessionIndex)>coreInputDeclaration,'Space Marines codex-details must authenticate the Core-owned input before using it');
assert(!smCodexDetails.includes('adeptus-mechanicus'),'Space Marines codex-details must not consume Adeptus Mechanicus generated presentation');
for(const [tool,inputs] of [
  ['books/chaos-space-marines/tools/extract-mfm.cjs',['datasheetsPath','manifestPath']],
  ['books/tau-empire/tools/extract-mfm.cjs',['datasheetsPath']],
  ['books/tau-empire/tools/extract-wargear.cjs',['datasheetsPath']],
  ['books/tau-empire/tools/extract-codex-parity.cjs',['pointsPath','factionPackPath']]
]){
  const source=read(tool),sessionIndex=source.indexOf('contract.createCaptureSession({sourceId:');
  for(const input of inputs){
    const declaredIndex=source.indexOf(`path:path.relative(path.resolve(root,'../..'),${input})`,sessionIndex);
    assert(declaredIndex>sessionIndex,`${tool}: ${input} is not declared as an authenticated normalization input`);
    assert(source.indexOf(`fs.readFileSync(${input}`,sessionIndex)>declaredIndex,`${tool}: ${input} is read before authentication`);
  }
}
const ecIndex=read('books/emperors-children/tools/build-bsdata-enhancement-index.mjs');
assert(ecIndex.indexOf('verifyBsdataSource({checkout')<ecIndex.indexOf('const raw=fs.readFileSync(input)'),'Emperor\'s Children index must authenticate its ambient BSData input before reading it');

const normalSourceCommands=['army-books:sources:check','tau:sources:check'];
for(const name of normalSourceCommands){
  const command=packageJson.scripts[name];
  assert(command,`${name}: missing`);
  for(const [tool] of active)if(command.includes(tool))assert(command.match(new RegExp(`${tool.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')} --check`)),`${name}: ${tool} must be invoked only in frozen --check mode`);
}

const normalGraph=Object.entries(packageJson.scripts).filter(([name])=>name==='test'||name.startsWith('test:')||name.endsWith(':build')||name.endsWith(':check')||name==='army-books:sources:check').map(([,command])=>command).join('\n');
for(const dormant of registry.dormantLiveTools){
  const source=read(dormant);
  assert(source.includes('--capture-update')||source.includes('beginLegacyCaptureTool'),`${dormant}: live mode lacks an explicit update guard`);
  if(normalGraph.includes(dormant))assert(normalGraph.includes(`${dormant} --check`),`${dormant}: dormant live branch is reachable from normal scripts`);
}

for(const name of ['test','test:preview','test:full','test:release']){
  const command=packageJson.scripts[name];
  assert(!/wahapedia\.ru|warhammer-community\.com|raw\.githubusercontent\.com|\bcurl\b|\bwget\b|\bgit\s+(?:clone|fetch|pull)\b/i.test(command),`${name}: external source network command is wired into normal tests`);
}

const statusSet=new Set(registry.statuses);
for(const source of registry.sources){
  assert(statusSet.has(source.status),`${source.sourceId}: unknown status ${source.status}`);
  assert(source.acceptedRevision&&source.lastChecked&&source.acceptedHash,`${source.sourceId}: freshness identity is incomplete`);
  assert(source.status!=='LEGACY_UNVERIFIABLE'||source.rawOrigin==='UNAVAILABLE',`${source.sourceId}: legacy status must disclose unavailable raw origin`);
  const expectedHash=source.artifacts.length===1?source.artifacts[0].sha256:aggregateArtifactHash(source.artifacts);
  assert.equal(source.acceptedHash.toLowerCase(),expectedHash.toLowerCase(),`${source.sourceId}: accepted hash must identify its complete frozen artifact set`);
}

await import('./space-marines-feedback-edge-qa.mjs');

console.log(`Source ingestion contract QA passed: ${active.length} frozen live-derived sources, ${legacy.length} candidate-only legacy update tools; 0 direct accepted writers.`);
