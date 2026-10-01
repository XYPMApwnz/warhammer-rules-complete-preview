import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(directory,'../../..');
const readJson = file => JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const sourcePath = 'books/death-guard/v2/sources/gw-death-guard-faction-pack-2026-09-30.pdf';
const sourceId = 'gw-death-guard-faction-pack-v1.3-2026-09-30';
const instructionId = 'datasheet-defiler:profile-selection:1';
const groups = [
  {profileGroupId:'datasheet-defiler:profile-group:1',profileIds:['datasheet-defiler:weapon:6','datasheet-defiler:weapon:7']},
  {profileGroupId:'datasheet-defiler:profile-group:2',profileIds:['datasheet-defiler:weapon:11','datasheet-defiler:weapon:12']}
];
const exactInstruction = 'Before selecting targets for this weapon, select one of its profiles to make attacks with.';
let proof;

function inspectAcceptedSource() {
  if (proof) return proof;
  const bytes = fs.readFileSync(path.join(root,sourcePath));
  const sha256 = createHash('sha256').update(bytes).digest('hex').toUpperCase();
  const enrollment = readJson('books/death-guard/v2/sources/source-enrollment.json');
  assert.equal(enrollment.sources.find(source => source.id === sourceId)?.sha256,sha256,'Pinned PDF source integrity');
  const bundled = path.join(os.homedir(),'.cache','codex-runtimes','codex-primary-runtime','dependencies','python','python.exe');
  const python = process.env.PYTHON || (fs.existsSync(bundled) ? bundled : 'python3');
  const script = `import json,pdfplumber,sys
with pdfplumber.open(sys.argv[1]) as pdf:
 p=pdf.pages[4]
 # The source arrows are small six-point vector paths. Read their actual
 # geometry, then recover the weapon-name text on each arrow's row.
 arrows=[c for c in p.curves if len(c['pts'])==6 and c['x0']<30 and 8<c['x1']-c['x0']<10 and 4<c['bottom']-c['top']<5]
 rows=[]
 for a in sorted(arrows,key=lambda c:c['top']):
  center=(a['top']+a['bottom'])/2
  chars=[c for c in p.chars if 32<c['x0']<190 and c['top']<=center<=c['bottom']]
  rows.append({'arrowTop':a['top'],'text':''.join(c['text'] for c in sorted(chars,key=lambda c:c['x0']))})
 print(json.dumps({'text':p.extract_text(),'arrowRows':rows}))`;
  const extracted = JSON.parse(execFileSync(python,['-X','utf8','-c',script,path.join(root,sourcePath)],{encoding:'utf8',maxBuffer:1024*1024}));
  assert.ok(extracted.text.includes(exactInstruction),'Exact selection instruction exists in accepted PDF');
  const corpus = readJson('books/death-guard/sources/waha-11e-current-2026-09-25/corpus.json');
  const unit = corpus.datasheets.find(record => record.sourceId === 'datasheet-defiler');
  const weaponIndex = new Map(unit.weapons.map(weapon => [weapon.sourceId,weapon]));
  const profileIds = groups.flatMap(group => group.profileIds);
  const profileRows = extracted.arrowRows.filter(row => !row.text.trimStart().startsWith('Before selecting'));
  assert.equal(profileRows.length,profileIds.length,'All and only arrow-marked weapon profiles accounted for');
  for (const [index,id] of profileIds.entries()) {
    assert.ok(profileRows[index].text.startsWith(weaponIndex.get(id).name),'PDF arrow binds exact accepted weapon row');
  }
  proof = {sha256,profileRows,weaponIndex};
  return proof;
}

export function assertProfileSelectionFacts(model) {
  const accepted = inspectAcceptedSource();
  const index = new Map(model.entities.map(entity => [entity.id,entity]));
  const instruction = index.get(instructionId);
  assert.ok(instruction,'Source-backed profile-selection instruction missing');
  assert.equal(instruction.type,'weapon-profile-selection');
  assert.equal(instruction.parentId,'unit-defiler','Exact source datasheet scope');
  assert.equal(instruction.data.text,exactInstruction,'Exact profile-selection semantics');
  assert.deepEqual(instruction.data.profileGroups,groups,'All four bindings and two stable profile groups preserved');
  assert.ok(index.get('unit-defiler').data.rawFactIds.includes(instructionId),'Unit owns instruction through stable ID');
  assert.equal(instruction.provenance.sourceId,sourceId,'Exact authoritative source identity');
  assert.equal(instruction.provenance.sourceRecordId,instructionId);
  assert.equal(instruction.provenance.documentPath,sourcePath);
  assert.equal(instruction.provenance.sha256,accepted.sha256,'Accepted raw source hash');
  assert.equal(instruction.provenance.page,5,'Exact PDF page');
  assert.equal(instruction.provenance.pointer,'pdf/page/5/profile-selection-note');
  const bindings = groups.flatMap(group => group.profileIds.map(profileId => ({profileId,profileGroupId:group.profileGroupId})));
  assert.deepEqual(instruction.provenance.profileBindings.map(({profileId,profileGroupId}) => ({profileId,profileGroupId})),bindings,'Every source arrow retains its canonical binding');
  for (const [position,binding] of instruction.provenance.profileBindings.entries()) {
    assert.ok(Math.abs(binding.arrowTop-accepted.profileRows[position].arrowTop)<0.0001,'Arrow geometry retained');
    const weapon = index.get(binding.profileId);
    assert.ok(weapon && index.get('unit-defiler').data.weaponIds.includes(binding.profileId),'Profile identity resolves inside exact owning unit');
  }
}

export function runProfileSelectionQa(base,effective) {
  for (const model of [base,effective]) assertProfileSelectionFacts(model);
  let mutations = 0;
  for (const model of [base,effective]) {
    const reject = mutation => {
      const changed = structuredClone(model);
      const instruction = changed.entities.find(entity => entity.id === instructionId);
      mutation(changed,instruction);
      assert.throws(() => assertProfileSelectionFacts(changed)); mutations++;
    };
    reject(changed => {changed.entities=changed.entities.filter(entity => entity.id!==instructionId);});
    reject((changed,instruction) => {instruction.data.text='Select a profile.';});
    reject((changed,instruction) => {instruction.data.profileGroups[0].profileIds.pop();});
    reject((changed,instruction) => {instruction.data.profileGroups[0].profileIds[0]='datasheet-defiler:weapon:1';});
    reject((changed,instruction) => {instruction.data.profileGroups[0].profileGroupId='datasheet-defiler:profile-group:2';});
    reject((changed,instruction) => {instruction.provenance.sourceId='dg-waha-2026-09-25';});
    reject((changed,instruction) => {instruction.provenance.profileBindings[0].profileId='datasheet-defiler:weapon:1';});
    reject((changed,instruction) => {instruction.provenance.page=6;});
    reject(changed => {const unit=changed.entities.find(entity=>entity.id==='unit-defiler');unit.data.rawFactIds=unit.data.rawFactIds.filter(id=>id!==instructionId);});
    reject((changed,instruction) => {instruction.parentId='unit-plague-marines';});
  }
  return {sourceLeaves:5,profileGroups:groups.length,profileBindings:groups.flatMap(group=>group.profileIds).length,mutations};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const {buildFactualV2} = await import('./build.mjs');
  const {base,effective} = buildFactualV2();
  console.log(`DG V2 profile selection QA PASS: ${JSON.stringify(runProfileSelectionQa(base,effective))}`);
}
