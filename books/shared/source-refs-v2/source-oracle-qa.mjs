/** Actual canonical inputs and source-severing controls for every migrated
 * independent oracle/source-review guard. Expectations are not presentation output. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {sourceDeclarationView,sourceSnapshot} from './source-refs.mjs';
import {finalizeSourceOutput} from './producer-io.mjs';
import {sourceFixture} from '../../../tests/helpers/source-refs-fixtures.mjs';
import {enumerateExpectedFacts as amOracle} from '../../adeptus-mechanicus/v2/app-fact-oracle.mjs';
import {readAppInputs as amInputs} from '../../adeptus-mechanicus/v2/app-build.mjs';
import {enumerateExpectedFacts as dgOracle} from '../../death-guard/v2/app-fact-oracle.mjs';
import {readAppInputs as dgInputs} from '../../death-guard/v2/app-build.mjs';
import {validateSpaceMarinesRosterCorrections} from '../../space-marines/v2/roster-source-review.mjs';
import {loadSourceCompletenessInputs,assertSourceCompletenessGate} from '../roster-v2/source-completeness.mjs';

const root=new URL('../../../',import.meta.url),read=file=>JSON.parse(fs.readFileSync(new URL(file,root),'utf8'));
const controls=[],oracles=[];
const reject=(oracle,mutation,run,pattern)=>{assert.throws(run,pattern,oracle+': '+mutation);controls.push({oracle,mutation,status:'REJECTED'});};
const am=finalizeSourceOutput(amInputs().model),amFacts=amOracle(am);
assert.deepEqual(amFacts,amOracle(sourceDeclarationView(am)),'AM source encoding changed independent facts');
for(const key of ['sourceId','sourcePath']){
  const changed=structuredClone(am),entity=changed.entities[0];
  delete sourceFixture(entity,{book:changed}).provenance[key];
  reject('AM application oracle','missing '+key,()=>amOracle(changed),/Severed source evidence/);
}
oracles.push({path:'books/adeptus-mechanicus/v2/app-fact-oracle.mjs',positive:'PASS',facts:amFacts.length});

const dgInput=dgInputs(),dg=finalizeSourceOutput(dgInput.model),dgFacts=dgOracle(dg,dgInput.records);
assert.deepEqual(dgFacts,dgOracle(sourceDeclarationView(dg),dgInput.records),'DG source encoding changed independent facts');
const alteredDG=sourceDeclarationView(dg),qualified=alteredDG.entities.find(entity=>entity.qualifications?.length);
assert.ok(qualified,'Actual accepted DG qualification required');
delete qualified.qualifications[0].provenance;
reject('DG application oracle','missing qualification source proof',()=>dgOracle(finalizeSourceOutput(alteredDG),dgInput.records),/qualification|provenance/i);
oracles.push({path:'books/death-guard/v2/app-fact-oracle.mjs',positive:'PASS',facts:dgFacts.facts?.length??dgFacts.length});

const sm=read('books/space-marines/v2/generated/effective.json'),review=read('books/space-marines/v2/roster-source-corrections.json');
validateSpaceMarinesRosterCorrections(review,{facts:sm});
const proof=review.corrections[0].sourceProof[0];assert.ok(proof?.canonicalId);
for(const key of ['sha256','pointer']){
  const changed=structuredClone(sm),entity=changed.entities.find(entity=>entity.id===proof.canonicalId);
  assert.ok(sourceSnapshot(entity,{book:changed})?.[key]);
  sourceFixture(entity,{book:changed}).provenance[key]='unaccepted-source-proof';
  reject('SM physical source review','changed '+key,()=>validateSpaceMarinesRosterCorrections(review,{facts:changed}),/Source provenance changed/);
}
oracles.push({path:'books/space-marines/v2/roster-source-review.mjs',positive:'PASS'});

const sourceInput=loadSourceCompletenessInputs({bookIds:['adeptus-mechanicus']});
const gate=input=>assertSourceCompletenessGate({...input,checkAllRegistrations:false});
assert.equal(gate(sourceInput).inventoryStatus,'PROVEN');
for(const key of ['sourceId','sha256']){
  const changed=structuredClone(sourceInput),book=changed.books[0].facts;
  const entity=book.entities.find(entity=>sourceSnapshot(entity,{book})?.[key]);assert.ok(entity);
  sourceFixture(entity,{book}).provenance[key]='unaccepted-source-proof';
  reject('Independent source completeness','changed '+key,()=>gate(changed),/UNREVIEWED_SOURCE_BLOCK/);
}
oracles.push({path:'books/shared/roster-v2/source-completeness.mjs',positive:'PROVEN',semanticStatus:'PARTIAL'});
console.log(JSON.stringify({schema:'source-oracle-negative-proof/v1',status:'PASS',oracles,controls},null,2));
