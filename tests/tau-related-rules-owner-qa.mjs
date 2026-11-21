import {cleanupQaTempDir,createQaTempDir} from './helpers/qa-temp.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildRelatedRules,loadAuthenticatedInputs,serializeRelatedRules,validateContracts} from '../books/tau-empire/tools/build-related-rules.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const bookRoot=path.join(root,'books','tau-empire');
const outputRelative=path.join('content','tau-empire-related-rules.en.json');
const outputPath=path.join(bookRoot,outputRelative);
const artifactPath=path.join(bookRoot,'sources','tau-empire-related-rules-contracts.v1.json');
const producerPath=path.join(bookRoot,'tools','build-related-rules.mjs');
const accepted=JSON.parse(fs.readFileSync(artifactPath,'utf8'));
const tracked=JSON.parse(fs.readFileSync(outputPath,'utf8'));
const producer=fs.readFileSync(producerPath,'utf8');

assert.equal(accepted.schema,'tau-related-rules-contracts/v1');
assert.equal(accepted.stratagems.length,7,'accepted Faction Pack Stratagem contract count');
assert.equal(accepted.enhancements.length,23,'accepted Enhancement contract count');
assert.equal(new Set(accepted.stratagems.map(item=>item.id)).size,7,'Stratagem contracts must resolve exactly once');
assert.equal(new Set(accepted.enhancements.map(item=>item.id)).size,23,'Enhancement contracts must resolve exactly once');
assert.deepEqual(buildRelatedRules(),tracked,'accepted inputs must reproduce tracked T’au Related Rules semantics');
assert.equal(serializeRelatedRules(buildRelatedRules()),fs.readFileSync(outputPath,'utf8'),'accepted inputs must reproduce tracked T’au Related Rules bytes');

const buildBody=producer.slice(producer.indexOf('export function buildRelatedRules'),producer.indexOf('export function serializeRelatedRules'));
assert.doesNotMatch(buildBody,/tau-empire-related-rules\.en\.json|outputPath/,'producer build path must not read its generated output');
assert.doesNotMatch(producer,/ByTitle|titleKey|\.title\s*===|\.title\s*==/,'owner resolution must not use display-title fallback');

for(const item of accepted.enhancements)assert.equal(item.confidence,'source-limited',`${item.id}: source-limited confidence must remain explicit`);
const strike=accepted.enhancements.find(item=>item.id==='enhancement-strike-swiftly');
assert(strike,'Strike Swiftly accepted contract is missing');
assert.equal(strike.confidenceDetail,'SOURCE_LIMITED_MEDIUM');
assert.deepEqual(strike.owner.selector.unitIds,[
  'unit-cadre-fireblade',
  'unit-commander-in-coldstar-battlesuit',
  'unit-commander-in-enforcer-battlesuit',
  'unit-ethereal',
  'unit-firesight-team',
  'unit-kroot-flesh-shaper',
  'unit-kroot-lone-spear',
  'unit-kroot-trail-shaper',
  'unit-kroot-war-shaper',
  'unit-commander-in-crisis-battlesuit'
],'Strike Swiftly must retain the exact accepted S7 owner set');
assert(strike.sourceRefs.some(item=>item.sourceId==='faction-pack-v1.0'));
assert(strike.sourceRefs.some(item=>item.sourceId==='faction-pack-v1.1'));
assert(strike.sourceRefs.some(item=>item.sourceId==='codex-parity'));
assert(strike.sourceRefs.some(item=>item.sourceId==='pinned-bsdata'&&item.locator.selectionId==='34f8-64e7-2649-37c1'));

const authenticated=loadAuthenticatedInputs();
const mutation=change=>{
  const copy=structuredClone(authenticated);
  change(copy.accepted);
  return()=>validateContracts(copy);
};
assert.throws(mutation(value=>value.stratagems.pop()),/expected exactly 7 accepted Faction Pack Stratagem contracts/);
assert.throws(mutation(value=>value.stratagems.push(structuredClone(value.stratagems[0]))),/expected exactly 7|duplicate contract/);
assert.throws(mutation(value=>value.stratagems[0].id='unknown-stratagem'),/missing or unknown Faction Pack Stratagem contract/);
assert.throws(mutation(value=>value.stratagems[0].detachmentId='wrong-detachment'),/wrong Detachment/);
assert.throws(mutation(value=>value.enhancements[0].owner.selector.unitIds=['unit-unknown-owner']),/unknown canonical owner ID/);
assert.throws(mutation(value=>value.enhancements[0].sourceRefs=[]),/no source locator/);
assert.throws(mutation(value=>value.enhancements[0].assignment.maxOwners=1),/conflicting owner\/assignment contract/);

const makeBundle=()=>{
  const temp=createQaTempDir('tau-related-rules-owner-');
  for(const relative of ['sources/tau-empire-related-rules-contracts.v1.json',...Object.values(accepted.sourceBindings).map(item=>item.path)]){
    const source=path.join(bookRoot,...relative.split('/'));
    const destination=path.join(temp,...relative.split('/'));
    fs.mkdirSync(path.dirname(destination),{recursive:true});
    fs.copyFileSync(source,destination);
  }
  return temp;
};

let absentBundle,poisonedBundle;
try{
  absentBundle=makeBundle();
  assert.equal(fs.existsSync(path.join(absentBundle,outputRelative)),false,'absent-output test must start without prior generated output');
  assert.deepEqual(buildRelatedRules({bookRoot:absentBundle}),tracked,'missing prior output must not affect the accepted build');

  poisonedBundle=makeBundle();
  const poisonedPath=path.join(poisonedBundle,outputRelative);
  fs.mkdirSync(path.dirname(poisonedPath),{recursive:true});
  fs.writeFileSync(poisonedPath,JSON.stringify({
    schema:1,
    faction:"T'au Empire",
    stratagems:{'marker-beacon':{v:1,roles:[{id:'wrong-owner'}],conditions:['wrong-condition'],undeclared:true}},
    enhancements:{'enhancement-strike-swiftly':{assignment:{maxOwners:999},undeclared:true}}
  },null,2));
  assert.deepEqual(buildRelatedRules({bookRoot:poisonedBundle}),tracked,'poisoned prior output must have no influence on the accepted build');

  const sourceBinding=accepted.sourceBindings['codex-parity'];
  fs.appendFileSync(path.join(poisonedBundle,...sourceBinding.path.split('/')),'\n');
  assert.throws(()=>buildRelatedRules({bookRoot:poisonedBundle}),/codex-parity hash mismatch/,'changed accepted source bytes must fail closed');

  const contractBundle=makeBundle();
  try{
    fs.appendFileSync(path.join(contractBundle,'sources','tau-empire-related-rules-contracts.v1.json'),'\n');
    assert.throws(()=>buildRelatedRules({bookRoot:contractBundle}),/accepted contract artifact hash mismatch/,'changed contract bytes must fail closed');
  }finally{
    cleanupQaTempDir(contractBundle);
  }
}finally{
  for(const temp of [absentBundle,poisonedBundle])if(temp)cleanupQaTempDir(temp);
}

console.log('PASS T’au accepted Related Rules owner: 7 Stratagems, 23 Enhancements, absent and poisoned prior output ignored.');
