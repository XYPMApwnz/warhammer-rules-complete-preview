/** Exact independent source equality and stale/rebuild controls; no input writes. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync,execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createQaTempDir,cleanupQaTempDir} from './helpers/qa-temp.mjs';
import {BOOK_PASSPORT_IDS} from '../books/shared/tools/book-passport.mjs';
import {buildSourceMetadata,runSourceMetadataBuild,SOURCE_METADATA_OUTPUT} from '../books/shared/tools/build-source-metadata.mjs';
import {generatedRebuildPlan} from '../books/shared/tools/generated-rebuild-plan.mjs';
import {bookUpdateDeclarations,selectBookUpdate} from '../books/shared/tools/book-update-declarations.mjs';
import {withoutSourceMetadataStep} from './helpers/source-metadata-plan.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const corePath='books/core-rules/content/core-rules.digital-11e.json',releasePath='mfm/current.json';
const core=read(corePath),release=read(releasePath);
const rule=core.records.find(record=>record.code==='25.03'),table=rule.content.find(block=>block.type==='comparison-table');
const expected={schema:'application-source-metadata/v1',mfm:{version:release.version},
  core:{captureDate:core.meta.captureDate,corpusFingerprint:core.meta.corpusFingerprint,
    battleSizes:table.rows.map(row=>{
      const cells=Object.fromEntries(table.columns.map((column,index)=>[column,index===0?row.label:row.cells[index-1]]));
      return {label:cells['BATTLE SIZE'],pointsLimit:Number(cells['Points Total']),detachmentPoints:Number(cells['Detachment Points (DP)'])};
    })},books:Object.fromEntries([...BOOK_PASSPORT_IDS].sort().map(id=>{
      const passport=read(`books/${id}/book.config.json`).passport;
      return [id,{mfmVersion:read(passport.mfm.currentRelease).version}];
    }))};
const actual=buildSourceMetadata();
assert.deepEqual(actual,expected,'The entire artifact must equal independent current source/passport projections');
assert.deepEqual(read(SOURCE_METADATA_OUTPUT),expected,'The checked-in artifact must equal its source owners exactly');
assert.equal(runSourceMetadataBuild({check:true}).status,'PASS');
const sourceBefore=JSON.stringify({core,release});
const loads=new Map();
assert.deepEqual(buildSourceMetadata({readJSON:relative=>{
  loads.set(relative,(loads.get(relative)||0)+1);return read(relative);
}}),expected);
assert.ok([...loads.values()].every(count=>count===1),'Each source owner is read once even when passports share it');
assert.equal(loads.get(corePath),1);assert.equal(loads.get(releasePath),1);
assert.equal(JSON.stringify({core,release}),sourceBefore,'Projection cannot mutate accepted inputs');

// The additive output may be uncommitted while this focused test is developed.
// Only this exact owned path supplements the real index inventory for the test.
const indexed=execFileSync('git',['ls-files','--cached','-z'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024}).split('\0').filter(Boolean);
const tracked=[...new Set([...indexed,SOURCE_METADATA_OUTPUT])];
const plan=generatedRebuildPlan(tracked,{root}),baseline=read('tests/fixtures/book-passport-baseline.json').baselinePlan;
const metadataProducer='books/shared/tools/build-source-metadata.mjs';
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const assertLegacyPlan=candidate=>{
  const legacy=withoutSourceMetadataStep(candidate);
  assert.equal(legacy.steps.length,baseline.steps);
  assert.equal(legacy.files.length,baseline.files);
  assert.equal(hash(legacy),baseline.sha256,'The original immutable legacy plan hash must still match');
};
const planBefore=hash(plan);assertLegacyPlan(plan);
assert.equal(hash(plan),planBefore,'Projecting the legacy fixture must not modify the actual rebuild plan');
assert.equal(plan.steps.length,baseline.steps+1);assert.equal(plan.files.length,baseline.files+1);
const planNegativeControls=[];
for(const [name,mutate]of[
  ['legacy producer arguments',candidate=>{candidate.steps.find(step=>step.producer!==metadataProducer).args.push('--qa-unaccepted-argument');}],
  ['legacy producer output',candidate=>{
    const step=candidate.steps.find(step=>step.producer!==metadataProducer&&step.outputs.length);
    const original=step.outputs[0],changed=original+'.qa-unaccepted-output';step.outputs[0]=changed;
    candidate.files[candidate.files.indexOf(original)]=changed;
  }]
]){
  const poisoned=structuredClone(plan);mutate(poisoned);
  assert.throws(()=>assertLegacyPlan(poisoned),/original immutable legacy plan hash/,name+' cannot bypass the old fixture hash');
  planNegativeControls.push(name);
}
for(const [name,mutate]of[
  ['duplicate metadata step',candidate=>{candidate.steps.push(structuredClone(candidate.steps.find(step=>step.producer===metadataProducer)));}],
  ['wrong metadata output',candidate=>{candidate.steps.find(step=>step.producer===metadataProducer).outputs=[SOURCE_METADATA_OUTPUT+'.wrong'];}],
  ['extra metadata argument',candidate=>{candidate.steps.find(step=>step.producer===metadataProducer).args.push('--qa-extra');}],
  ['wrong metadata position',candidate=>{
    const index=candidate.steps.findIndex(step=>step.producer===metadataProducer),[step]=candidate.steps.splice(index,1);
    candidate.steps.push(step);
  }],
  ['duplicate metadata file',candidate=>{candidate.files.push(SOURCE_METADATA_OUTPUT);}],
  ['missing metadata file',candidate=>{candidate.files=candidate.files.filter(file=>file!==SOURCE_METADATA_OUTPUT);}]
]){
  const poisoned=structuredClone(plan);mutate(poisoned);
  assert.throws(()=>withoutSourceMetadataStep(poisoned),{code:'ERR_ASSERTION'},name+' must be rejected before projecting the legacy plan');
  planNegativeControls.push(name);
}
const declarations=bookUpdateDeclarations({root,tracked,plan}),metadataSelectionInputs=[releasePath,corePath,
  ...BOOK_PASSPORT_IDS.map(id=>`books/${id}/book.config.json`)];
for(const changed of metadataSelectionInputs){
  const selected=selectBookUpdate(declarations,{books:['death-guard'],changed:[changed]});
  assert.equal(selected.fullPlan,false,'Metadata input must have explicit update coverage: '+changed);
  assert.equal(selected.steps.filter(step=>step.producer===metadataProducer).length,1,'A source change automatically selects the metadata producer: '+changed);
  assert(selected.steps.find(step=>step.producer===metadataProducer).outputs.includes(SOURCE_METADATA_OUTPUT));
}

const scratch=createQaTempDir('wh-source-metadata-build-'),outputPath=path.join(scratch,'source-metadata.v1.json');
let passed=false;const mutationResults=[];
try{
  runSourceMetadataBuild({outputPath});const original=fs.readFileSync(outputPath);
  runSourceMetadataBuild({outputPath});assert.deepEqual(fs.readFileSync(outputPath),original,'Rebuilding is byte deterministic');
  const mutations=[
    {name:'MFM version',path:releasePath,change:value=>{value.version+='-source-change';}},
    {name:'Core capture date',path:corePath,change:value=>{
      const date=new Date(`${value.meta.captureDate}T00:00:00Z`);date.setUTCDate(date.getUTCDate()+1);value.meta.captureDate=date.toISOString().slice(0,10);
    }},
    {name:'Core corpus fingerprint',path:corePath,change:value=>{value.meta.corpusFingerprint=(value.meta.corpusFingerprint[0]==='0'?'1':'0')+value.meta.corpusFingerprint.slice(1);}},
    ...['Points Total','Detachment Points (DP)'].map(column=>({name:'Core table '+column,path:corePath,change:value=>{
      const selected=value.records.find(row=>row.code==='25.03').content.find(block=>block.type==='comparison-table');
      const index=selected.columns.indexOf(column)-1;selected.rows[0].cells[index]=String(Number(selected.rows[0].cells[index])+1);
    }}))
  ];
  for(const mutation of mutations){
    fs.writeFileSync(outputPath,original);
    const input=read(mutation.path);mutation.change(input);
    const readJSON=relative=>relative===mutation.path?structuredClone(input):read(relative);
    assert.throws(()=>runSourceMetadataBuild({outputPath,check:true,readJSON}),error=>error.code==='ERR_SOURCE_METADATA_STALE',mutation.name+' invalidates the old artifact');
    assert.deepEqual(fs.readFileSync(outputPath),original,'A failed check must not write generated bytes');
    runSourceMetadataBuild({outputPath,readJSON});assert.notDeepEqual(fs.readFileSync(outputPath),original,mutation.name+' must change the rebuilt artifact');
    assert.equal(runSourceMetadataBuild({outputPath,check:true,readJSON}).status,'PASS');
    mutationResults.push(mutation.name);
  }
  const selectedBook=BOOK_PASSPORT_IDS[0],configPath=`books/${selectedBook}/book.config.json`,config=read(configPath);
  const alternatePath='mfm/qa-source-metadata/current.json';config.passport.mfm.currentRelease=alternatePath;
  const alternate={...release,version:release.version+'-book-selected'};
  const readJSON=relative=>relative===configPath?config:relative===alternatePath?alternate:read(relative);
  const selected=buildSourceMetadata({readJSON});
  assert.equal(selected.mfm.version,expected.mfm.version,'A book pointer does not replace the global pointer');
  assert.equal(selected.books[selectedBook].mfmVersion,alternate.version,'The book version follows its own passport pointer');
  for(const id of BOOK_PASSPORT_IDS.filter(id=>id!==selectedBook))assert.equal(selected.books[id].mfmVersion,expected.books[id].mfmVersion);
  fs.writeFileSync(outputPath,original);
  assert.throws(()=>runSourceMetadataBuild({outputPath,check:true,readJSON}),error=>error.code==='ERR_SOURCE_METADATA_STALE');
  runSourceMetadataBuild({outputPath,readJSON});assert.notDeepEqual(fs.readFileSync(outputPath),original);
  assert.equal(runSourceMetadataBuild({outputPath,check:true,readJSON}).status,'PASS');
  mutationResults.push('Book passport release pointer');

  for(const [label,change]of [
    ['calendar date',value=>{value.meta.captureDate='2026-02-30';}],
    ['fingerprint',value=>{delete value.meta.corpusFingerprint;}],
    ['battle-size column',value=>{value.records.find(row=>row.code==='25.03').content.find(block=>block.type==='comparison-table').columns[1]='Unknown column';}],
    ['battle-size number',value=>{value.records.find(row=>row.code==='25.03').content.find(block=>block.type==='comparison-table').rows[0].cells[0]='unknown';}]
  ]){
    const invalid=structuredClone(core);change(invalid);
    assert.throws(()=>buildSourceMetadata({readJSON:relative=>relative===corePath?invalid:read(relative)}),/Source metadata:/,'Reject invalid source '+label);
  }
  assert.throws(()=>buildSourceMetadata({readJSON:relative=>relative===releasePath?{...release,version:''}:read(relative)}),/Source metadata:/);
  fs.writeFileSync(outputPath,'{}\n');
  const producer=fileURLToPath(new URL('../books/shared/tools/build-source-metadata.mjs',import.meta.url));
  const staleCLI=spawnSync(process.execPath,[producer,'--check',`--root=${root}`,`--out=${outputPath}`],{encoding:'utf8'});
  assert.equal(staleCLI.status,1,'The normal generated gate must fail on stale metadata');
  assert.match(staleCLI.stderr,/Generated source metadata is stale:/);
  assert.equal(fs.readFileSync(outputPath,'utf8'),'{}\n','The CLI check cannot write its stale output');
  const rebuildCLI=spawnSync(process.execPath,[producer,`--root=${root}`,`--out=${outputPath}`],{encoding:'utf8'});
  assert.equal(rebuildCLI.status,0,rebuildCLI.stderr);
  assert.deepEqual(fs.readFileSync(outputPath),original,'The normal CLI rebuild restores exact deterministic bytes');
  assert.equal(runSourceMetadataBuild({outputPath,check:true}).status,'PASS');
  assert.equal(JSON.stringify({core,release}),sourceBefore,'Mutation controls never write or change accepted owner objects');
  passed=true;
}finally{if(passed)cleanupQaTempDir(scratch);}
console.log(JSON.stringify({status:'PASS',books:BOOK_PASSPORT_IDS.length,sourceEquality:'whole-artifact',sourceMutations:mutationResults,
  bytes:fs.statSync(path.join(root,SOURCE_METADATA_OUTPUT)).size,normalCLIStaleRejection:true,sourceInputsWritten:false,
  generatedPlan:{steps:plan.steps.length,files:plan.files.length,unchangedLegacyHash:baseline.sha256,negativeControls:planNegativeControls,
    automaticMetadataSelectionInputs:metadataSelectionInputs.length}}));
