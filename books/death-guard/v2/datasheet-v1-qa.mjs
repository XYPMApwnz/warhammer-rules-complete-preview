import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {buildApp,readAppInputs} from './app-build.mjs';
import {enumerateExpectedFacts} from './app-fact-oracle.mjs';
import {validatePresentation} from './app-qa.mjs';

// This QA intentionally owns no V1 factual input. It checks the independent
// canonical fact oracle, the V2 presentation envelope, and the frozen V1-style
// navigation dependency boundary consumed by the datasheet renderer.
const base='296ecc02542c366fd73065f591745e629a0c24ce';
const directory=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(directory,'../../..');
const navigationFiles=[
  'books/shared/army-book-app-v2/navigation-v1.mjs',
  'books/shared/army-book-app-v2/navigation-v1-controller.mjs',
  'books/shared/army-book-app-v2/navigation-v1-targets.mjs',
  'books/shared/army-book-app-v2/navigation-v1.css'
];
for(const file of navigationFiles){
  const expected=execFileSync('git',['show',`${base}:${file}`],{cwd:repo,encoding:'utf8'}).replaceAll('\r\n','\n');
  const actual=fs.readFileSync(path.join(repo,file),'utf8').replaceAll('\r\n','\n');
  assert.equal(actual,expected,`Navigation baseline changed: ${file}`);
}

const portCss=fs.readFileSync(path.join(repo,'books/shared/army-book-app-v2/datasheet-v1.css'),'utf8');
for(const asset of ['datasheet-system.css','unit-art.css']){
  assert.ok(portCss.includes(`@import url("../${asset}");`),`Actual V1 stylesheet disconnected: ${asset}`);
  const file='books/shared/'+asset;
  assert.equal(fs.readFileSync(path.join(repo,file),'utf8').replaceAll('\r\n','\n'),
    execFileSync('git',['show',`${base}:${file}`],{cwd:repo,encoding:'utf8'}).replaceAll('\r\n','\n'),`Shared V1 stylesheet changed: ${asset}`);
}

const inputs=readAppInputs(),payload=buildApp(inputs);
const validation=validatePresentation(payload,inputs.model,inputs.records);
const expected=enumerateExpectedFacts(inputs.model,inputs.records);
assert.equal(expected.length,3654,'Canonical visible-fact census changed');
assert.equal(validation.facts,expected.length);

const cards=new Map(payload.cards.map(card=>[card.id,card]));
const datasheets=inputs.model.entities.filter(entity=>entity.kind==='DATASHEET');
assert.equal(datasheets.length,36,'Datasheet census changed');
for(const unit of datasheets){
  const card=cards.get(unit.id);
  assert.ok(card&&card.kind==='DATASHEET',`Missing canonical datasheet ${unit.id}`);
  for(const id of [...unit.data.profileIds,...unit.data.weaponIds,...unit.data.sectionIds]){
    assert.ok(cards.has(id),`Missing canonical datasheet child ${unit.id}/${id}`);
    assert.equal(cards.get(id).parentId,unit.id,`Wrong canonical datasheet child owner ${id}`);
  }
}

const value=(id,key)=>inputs.model.entities.find(entity=>entity.id===id)?.data?.[key];
assert.equal(value('datasheet-lord-of-contagion:weapon:1','attacks'),'5');
assert.equal(value('datasheet-lord-of-contagion:weapon:1','strength'),'9');
assert.equal(value('datasheet-lord-of-contagion:weapon:2','attacks'),'10');
assert.equal(value('datasheet-lord-of-contagion:weapon:2','strength'),'6');
assert.deepEqual(value('datasheet-lord-of-contagion:weapon:1','abilities'),['lethal hits']);
assert.deepEqual(value('datasheet-lord-of-contagion:weapon:2','abilities'),['lethal hits']);

const sourceRules=new Map(inputs.model.entities.map(entity=>[entity.id,entity.ruleContract]).filter(([,contract])=>contract));
for(const id of ['datasheet-lord-of-contagion:section:1','datasheet-deathshroud-terminators:section:1','detachment-paragons-of-putrescence:rule','detachment-virulent-vectorium:enhancement:2']){
  assert.ok(sourceRules.get(id)?.clauses?.some(clause=>clause.rosterClassification==='ROSTER_EXECUTABLE'),`Missing executable source oracle ${id}`);
}

console.log(JSON.stringify({status:'PASS',visibleFacts:expected.length,datasheets:datasheets.length,navigationBaseline:base,navigationFiles:navigationFiles.length,actualV1Styles:2,megaBaseOracle:'PASS'},null,2));
