import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {buildApp,readAppInputs} from './app-build.mjs';
import {enumerateExpectedFacts} from './app-fact-oracle.mjs';
import {validatePresentation} from './app-qa.mjs';
import {buildDatasheetReferenceBindings} from './presentation-reference-build.mjs';

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
assert.equal(expected.length,3654,'Canonical source-fact census changed');
assert.equal(validation.facts,expected.length);

// The source-evidence census and the player datasheet census are deliberately
// different contracts. The former is lossless. The latter admits only fields
// that a player needs, plus the exact accepted attachment exception prose;
// identity bindings and source-layout classifiers remain available through the
// explicit evidence surface instead of becoming a generic datasheet tail.
const entities=new Map(inputs.model.entities.map(entity=>[entity.id,entity]));
const recordType=id=>inputs.records.get(id)?.recordType;
const leaderException=entity=>{
  if(entity?.kind!=='DATASHEET_SECTION'||entity.data.title!=='LEADER')return false;
  return entity.data.blocks.some(block=>block.text.split('\n').filter(line=>!/^This model can be attached/.test(line)&&!/^\s*-\s/.test(line)).join('\n').trim());
};
const isPlayerDatasheetFact=fact=>{
  const entity=entities.get(fact.entityId),kind=entity?.kind||recordType(fact.entityId),path=fact.path;
  if(kind==='DATASHEET'||kind==='PROFILE')return true;
  if(kind==='WEAPON_PROFILE')return path[0]!=='mode'&&(path[0]!=='abilities'||path.length>1);
  if(kind==='MODEL_BASE')return path[0]==='text';
  if(kind==='DATASHEET_SECTION'){
    if(path[0]==='title')return true;
    if(path[0]==='blocks'&&path[2]==='text')return entity.data.title!=='LEADER'||leaderException(entity);
    return path[0]==='qualifications'&&path.at(-1)==='sourceText';
  }
  if(['WARGEAR_OPTION','SUPPLEMENTAL_DATASHEET_RULE','WARGEAR_FOOTNOTE'].includes(kind))return path[0]==='text';
  if(kind==='RULE_REFERENCE')return path[0]==='label';
  if(kind==='WEAPON_PROFILE_SELECTION')return path[0]==='text'||path.at(-2)==='profileIds';
  if(kind==='MFM_UNIT_POINTS')return path[0]==='pointSchedules'&&(
    path[2]==='entries'&&['sourceLabel','value'].includes(path[4])||
    path[2]==='sourceLabel'&&inputs.records.get(fact.entityId).pointSchedules.length>1);
  if(kind==='MFM_PAID_UPGRADE')return ['sourceLabel','value'].includes(path[0]);
  if(kind==='MFM_LEADER_ELIGIBILITY')return path[0]==='targetUnitReferenceIds';
  return false;
};
const playerFacts=expected.filter(isPlayerDatasheetFact);
assert.equal(playerFacts.length,2281,'Player datasheet fact classification changed');
assert.equal(expected.filter(fact=>entities.get(fact.entityId)?.kind==='WEAPON_PROFILE'&&fact.path[0]==='mode').length,146);
assert.equal(expected.filter(fact=>entities.get(fact.entityId)?.kind==='DATASHEET_SECTION'&&fact.path.at(-1)==='wargearAbility').length,126);
assert.equal(expected.filter(fact=>entities.get(fact.entityId)?.kind==='MODEL_BASE'&&fact.path[0]==='scope').length,36);
assert.equal(expected.filter(fact=>entities.get(fact.entityId)?.kind==='WEAPON_PROFILE_SELECTION'&&fact.path[0]==='profileGroups').length,6);
assert.equal(expected.filter(fact=>recordType(fact.entityId)==='MFM_UNIT_POINTS'&&['status','sourceGroup'].includes(fact.path[0])).length,72);

const cards=new Map(payload.cards.map(card=>[card.id,card]));
const referenceFields=payload.cards.filter(card=>card.kind==='RULE_REFERENCE').flatMap(card=>card.fields.filter(field=>field.source.path==='/label'));
assert.equal(referenceFields.length,36);
let references=0;
for(const field of referenceFields){
  const bindings=payload.datasheetPresentation.referenceBindings.fields[field.id];
  assert.ok(bindings.length,'Missing formal reference bindings: '+field.id);
  let end=0;
  for(const binding of bindings){
    assert.ok(binding.start>=end&&binding.end>binding.start&&binding.end<=field.value.length,'Invalid reference span: '+field.id);
    assert.ok(cards.has(binding.targetId),'Unavailable canonical reference: '+binding.targetId);
    if(field.value.slice(binding.start,binding.end)==='Deep Strike')assert.equal(binding.targetId,'core-deep-strike');
    end=binding.end;references++;
  }
}
assert.equal(references,89);
assert.throws(()=>buildDatasheetReferenceBindings(payload.cards.filter(card=>card.id!=='core-deep-strike')),/Unavailable canonical presentation target/);
const unknownReference=structuredClone(payload.cards);
unknownReference.find(card=>card.kind==='RULE_REFERENCE').fields.find(field=>field.source.path==='/label').value+=', UNKNOWN FORMAL REFERENCE';
assert.throws(()=>buildDatasheetReferenceBindings(unknownReference),/Unsupported formal rule reference/);
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

console.log(JSON.stringify({status:'PASS',sourceFacts:expected.length,playerDatasheetFacts:playerFacts.length,datasheets:datasheets.length,canonicalReferenceBindings:references,referenceRejectionControls:2,navigationBaseline:base,navigationFiles:navigationFiles.length,actualV1Styles:2,megaBaseOracle:'PASS'},null,2));
