import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {buildFactualV2} from './build.mjs';
import {runSourceIntegrityQa} from './source-integrity-qa.mjs';
import {assertProfileSelectionFacts,runProfileSelectionQa} from './profile-selection-qa.mjs';
import {assertSourceTableFacts,enumerateSourceTableFacts,runTableFactMutations,runSyntheticTableControls} from './table-facts-qa.mjs';

const directory=path.dirname(fileURLToPath(import.meta.url));
const ledger=JSON.parse(fs.readFileSync(path.join(directory,'foundation-closure.json'),'utf8'));
const bundled=path.join(os.homedir(),'.cache','codex-runtimes','codex-primary-runtime','dependencies','python','python.exe');
const python=process.env.PYTHON || (fs.existsSync(bundled)?bundled:'python3');
const source=JSON.parse(execFileSync(python,['-X','utf8',path.join(directory,'foundation-source-qa.py')],{encoding:'utf8'}));

export function assertFoundationFacts(model) {
  const index=new Map(model.entities.map(entity=>[entity.id,entity]));
  assert.equal(index.size,model.entities.length,'No duplicate canonical identity');
  assert.deepEqual(model.sourceAccounting.leaves,ledger.leaves,'Every previously missing source leaf accounted exactly once, including non-gameplay classifications');
  const intro=index.get('book-death-guard:introduction');
  assert.equal(intro?.kind,'BOOK_USAGE_RULES');
  assert.deepEqual(intro.data.clauses.map(clause=>clause.text),source.introduction,'Independent raw Introduction semantics');
  const erratum=index.get('source-erratum:dg-waha:0005');
  assert.equal(erratum?.kind,'SOURCE_ERRATUM');
  assert.equal(erratum.data.title,source.erratum.title,'Exact raw update scope');
  assert.equal(erratum.data.directive,source.erratum.directive,'Exact raw replacement directive');
  assert.equal(erratum.data.text,source.erratum.text,'Every accepted erratum body element preserved');
  assert.equal(erratum.data.operation,'REPLACE','Change to is replacement, not an additive rule');
  assert.deepEqual(erratum.data.targetBindings,[{targetId:'detachment-mortarions-hammer:stratagem:6',field:['lines',1,'text']},{targetId:'detachment-mortarions-hammer:stratagem:6',field:['lines',2,'text']}],'Exact source TARGET/EFFECT scope');
  assert.deepEqual(index.get('detachment-mortarions-hammer:stratagem:6').data.sourceUpdateIds,[erratum.id],'One explicit update reference');
  for (const leaf of ledger.leaves.filter(leaf=>leaf.classification==='GAMEPLAY_FACT')) {
    const binding=leaf.canonicalBinding;
    assert.ok(binding && index.has(binding.entityId),'Every gameplay leaf has an explicit factual owner');
    let value=index.get(binding.entityId).data;
    for (const field of binding.field) value=value?.[field];
    assert.equal(value,binding.expectedProfileId || leaf.rawValue,'Exact source leaf value/physical-profile identity');
  }
  assertProfileSelectionFacts(model);
  assertSourceTableFacts(model,enumerateSourceTableFacts());
}

export function runFoundationQa() {
  const integrity=runSourceIntegrityQa(),{base,effective}=buildFactualV2();
  assertFoundationFacts(base);assertFoundationFacts(effective);
  let closureMutations=0;
  for (const model of [base,effective]) {
    for (const leaf of ledger.leaves.filter(leaf=>leaf.classification==='GAMEPLAY_FACT')) {
      const mutant=structuredClone(model),binding=leaf.canonicalBinding;
      let host=mutant.entities.find(entity=>entity.id===binding.entityId).data;
      for (const key of binding.field.slice(0,-1)) host=host[key];
      delete host[binding.field.at(-1)];
      assert.throws(()=>assertFoundationFacts(mutant));closureMutations++;
    }
    for (const classification of ['GAMEPLAY_FACT','REFERENCE_METADATA','SOURCE_NAVIGATION','PRESENTATION_METADATA','NON_GAMEPLAY']) {
      const mutant=structuredClone(model);
      const leaf=mutant.sourceAccounting.leaves.find(leaf=>leaf.classification===classification);
      leaf.classification='UNCLASSIFIED';
      assert.throws(()=>assertFoundationFacts(mutant));closureMutations++;
    }
    for (const change of [
      mutant=>{mutant.entities.find(entity=>entity.id==='source-erratum:dg-waha:0005').data.operation='ADD';},
      mutant=>{mutant.entities.find(entity=>entity.id==='source-erratum:dg-waha:0005').data.targetBindings[0].targetId='detachment-mortarions-hammer:stratagem:1';},
      mutant=>{mutant.sourceAccounting.leaves.pop();}
    ]) {const mutant=structuredClone(model);change(mutant);assert.throws(()=>assertFoundationFacts(mutant));closureMutations++;}
  }
  const profiles=runProfileSelectionQa(base,effective);
  const tables=runTableFactMutations(base,enumerateSourceTableFacts()).length+runTableFactMutations(effective,enumerateSourceTableFacts()).length;
  const synthetic=runSyntheticTableControls();
  return {previousMissing:ledger.leaves.length,classifications:source.categories,gameplayFactMissingAfter:0,unclassified:0,wrongSourceBindings:0,duplicateOwners:0,wrongIdentity:0,
    mutations:integrity.mutations+profiles.mutations+tables+closureMutations,integrityMutations:integrity.mutations,profileMutations:profiles.mutations,tableMutations:tables,closureMutations,syntheticControls:synthetic};
}

if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) console.log('DG V2 factual foundation QA PASS: '+JSON.stringify(runFoundationQa()));
