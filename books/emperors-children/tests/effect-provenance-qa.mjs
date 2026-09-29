import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const readJson=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const clone=value=>structuredClone(value);
const source=readJson('books/emperors-children/sources/emperors-children-effect-contracts.v1.json');
const pack=readJson('books/emperors-children/content/emperors-children-faction-pack.en.json');
const scope={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'books/emperors-children/scripts/roster-data.js'),'utf8'),scope);
const generated=scope.window.WH_BOOK_ROSTER_CATALOG;
const expected={
  'emperors-children-detachment-rule-sensational-performance':{detachmentId:'court-of-the-phoenician',title:'Sensational Performance',semanticHash:'db6929a5e2c197eee3827fa688940870cd27b98d03c250e2fdb878166a7884f9'},
  'emperors-children-detachment-rule-eager-to-kill':{detachmentId:'elegant-brutes',title:'Eager to Kill',semanticHash:'b06cf37a015d28d638133944f09e1591496d990972646fa148d5250c1fb4d0df'},
  'emperors-children-detachment-rule-frantic-focus':{detachmentId:'frenzied-host',title:'Frantic Focus',semanticHash:'5ab8db29108da716ceb92fd45deb40c92d8a00befc73cdbbe0a6c972e280c119'},
  'emperors-children-detachment-rule-entitled-to-victory':{detachmentId:'spectacle-of-slaughter',title:'Entitled to Victory',semanticHash:'a0cc34118dd182c7350b2aa66c927347614448e75ebcee3437383c64d7f6c98e'}
};
const semanticHash=contract=>{const value=clone(contract);delete value.source;delete value.confidence;return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');};
const contractById=(contracts,id)=>contracts.find(contract=>contract.canonicalRecordId===id);

const certify=(acceptedPack,contracts,catalog)=>{
  assert.equal(acceptedPack.meta.version,'1.2','accepted Faction Pack version');
  assert.equal(acceptedPack.provenance.sourceId,'emperors-children-faction-pack-v1.2','accepted Faction Pack owner identity');
  for(const [id,record] of Object.entries(expected)){
    const owner=acceptedPack.detachments.find(detachment=>detachment.id===record.detachmentId);
    assert.ok(owner,`${id}: accepted detachment owner exists`);
    assert.equal(owner.rule.title,record.title,`${id}: exact accepted factual rule owner`);
    const contract=contractById(contracts,id),published=contractById(catalog.effectContracts,id);
    assert.ok(contract,`${id}: active source contract exists`);
    assert.equal(contract.detachmentId,record.detachmentId,`${id}: canonical Detachment identity`);
    assert.equal(contract.source.sourceId,acceptedPack.provenance.sourceId,`${id}: current accepted source identity`);
    assert.equal(contract.source.locator,`books/emperors-children/content/emperors-children-faction-pack.en.json#${id}`,`${id}: exact current owner locator`);
    assert.equal(contract.confidence,'VERIFIED_FROZEN',`${id}: accepted source confidence`);
    assert.equal(/codex-parity|codex-transcription/i.test(`${contract.source.sourceId} ${contract.source.locator}`),false,`${id}: retired owner absent`);
    assert.equal(semanticHash(contract),record.semanticHash,`${id}: gameplay contract is byte-equivalent after excluding provenance`);
    assert.deepEqual(JSON.parse(JSON.stringify(published)),JSON.parse(JSON.stringify(contract)),`${id}: generated active contract matches factual contract`);
  }
  return{current:Object.keys(expected).length,retired:0};
};

const controls=certify(pack,source.contracts,generated);
assert.deepEqual(controls,{current:4,retired:0},'four current owner bindings and no retired bindings');
let mutations=0;
const killed=(label,mutate)=>{const changedPack=clone(pack),changedContracts=clone(source.contracts),changedCatalog=clone(generated);mutate(changedPack,changedContracts,changedCatalog);assert.throws(()=>certify(changedPack,changedContracts,changedCatalog),undefined,`${label} mutation survived`);mutations++;};
for(const id of Object.keys(expected))killed(`RETIRED_OWNER_${id}`,(_pack,contracts,catalog)=>{for(const contract of [contractById(contracts,id),contractById(catalog.effectContracts,id)])contract.source={sourceId:'emperors-children-codex-transcription',locator:`books/emperors-children/content/emperors-children-codex-parity.en.json#${id}`};});
killed('MISSING_ACCEPTED_FACTUAL_OWNER',acceptedPack=>{acceptedPack.detachments=acceptedPack.detachments.filter(detachment=>detachment.id!=='court-of-the-phoenician');});
killed('GAMEPLAY_PAYLOAD_CHANGED',(_pack,contracts,catalog)=>{for(const contract of [contractById(contracts,'emperors-children-detachment-rule-eager-to-kill'),contractById(catalog.effectContracts,'emperors-children-detachment-rule-eager-to-kill')])contract.selector.unitIds=['unit-flawless-blades'];});
assert.equal(mutations,6,'provenance and semantic-equivalence mutation controls');
console.log(`Emperor's Children effect provenance: current owners ${controls.current}/4; retired owners ${controls.retired}; semantic delta 0; mutations ${mutations}/${mutations} KILLED; PASS`);
