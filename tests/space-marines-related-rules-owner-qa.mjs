import {cleanupQaTempDir,createQaTempDir} from './helpers/qa-temp.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadAcceptedRelatedRulesInputs,validateAcceptedRelatedRulesContracts} from '../books/space-marines/tools/space-marines-related-rules-contract.mjs';
import {buildRelatedRules,buildRelatedRulesFromInputs,loadRelatedRulesBuildInputs,serializeRelatedRules} from '../books/space-marines/tools/build-related-rules.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const bookRoot=path.join(root,'books','space-marines');
const inputs=loadAcceptedRelatedRulesInputs({bookRoot,authenticateRepository:false});
const validated=validateAcceptedRelatedRulesContracts(inputs);
const outputPath=path.join(bookRoot,'content','space-marines-related-rules.en.json');
const tracked=JSON.parse(fs.readFileSync(outputPath,'utf8'));
const built=buildRelatedRules({bookRoot,authenticateRepository:false});

assert.equal(validated.supplementalContracts.length,28,'supplemental Enhancement contract count');
assert.equal(new Set(validated.supplementalContracts.map(item=>item.id)).size,28,'supplemental contracts resolve exactly once');
assert.equal(validated.supplementalContracts.filter(item=>item.tags.includes('UPGRADE')).length,3,'unit Upgrade contract count');
assert(validated.supplementalContracts.every(item=>item.confidence.assignment==='SOURCE_LIMITED'),'assignment evidence confidence must remain source-limited');

const mutation=change=>{
  const copy=structuredClone(inputs);
  change(copy.accepted);
  return()=>validateAcceptedRelatedRulesContracts(copy);
};
assert.throws(mutation(value=>value.enhancements.pop()),/expected exactly 28 supplemental Enhancement contracts/);
assert.throws(mutation(value=>value.enhancements.push(structuredClone(value.enhancements[0]))),/expected exactly 28|duplicate supplemental/);
assert.throws(mutation(value=>value.enhancements[0].id='unknown-enhancement'),/missing or unknown supplemental Enhancement contract/);
assert.throws(mutation(value=>value.enhancements[0].detachmentId='wrong-detachment'),/wrong Detachment or identity/);
assert.throws(mutation(value=>value.enhancements[0].sourceRefs=[]),/bind all accepted evidence classes/);
assert.throws(mutation(value=>value.enhancements[0].confidence.assignment='VERIFIED_FROZEN'),/assignment confidence must remain SOURCE_LIMITED/);
assert.throws(mutation(value=>value.enhancements.find(item=>item.id==='bellicose-weapon-spirits').assignment.maxOwners=1),/conflicting owner\/assignment contract/);
assert.throws(mutation(value=>value.enhancements.find(item=>item.id==='spy-skull-data-link').id='spy-skull-datalink'),/missing or unknown supplemental Enhancement contract/);

const artifact=JSON.parse(fs.readFileSync(path.join(bookRoot,'sources','space-marines-related-rules-contracts.v1.json'),'utf8'));
assert.equal(Object.values(artifact.enhancements).some(item=>'title' in item||'text' in item||'points' in item),false,'accepted contract must not duplicate display, rule text, or points facts');

assert.deepEqual(built,tracked,'accepted inputs must reproduce tracked Space Marines Related Rules semantics');
assert.equal(serializeRelatedRules(built),fs.readFileSync(outputPath,'utf8'),'accepted inputs must reproduce tracked Space Marines Related Rules bytes');
assert.equal(Object.keys(built.stratagems).length,123);
assert.equal(Object.keys(built.enhancements).length,87);
assert(built.enhancements['spy-skull-data-link'],'canonical Spy-skull identity missing');
assert.equal(built.enhancements['spy-skull-datalink'],undefined,'stale Spy-skull identity survived');
assert.equal(validated.supplementalContracts.filter(item=>!item.tags.includes('UPGRADE')).every(item=>built.enhancements[item.id].owner.selector.allKeywords?.length),true,'formerly unresolved Enhancement owner remains empty');

const speederIds=['unit-land-speeder','unit-storm-speeder-hailstrike','unit-storm-speeder-hammerstrike','unit-storm-speeder-thunderstrike'];
for(const id of ['bellicose-weapon-spirits','raptorial-cogitator-core']){
  assert.deepEqual(built.enhancements[id],{tags:['UPGRADE'],owner:{subject:'unit',selector:{unitIds:speederIds}},assignment:{maxOwners:3,enhancementChoices:1,payPointsPerOwner:true}},`${id}: exact unit Upgrade contract`);
}
assert.deepEqual(built.enhancements['death-in-the-dark'],{tags:['UPGRADE'],owner:{subject:'unit',selector:{allKeywords:['INFANTRY','PHOBOS']}},assignment:{maxOwners:3,enhancementChoices:1,payPointsPerOwner:true}},'death-in-the-dark: exact unit Upgrade contract');

const codexExtractor=fs.readFileSync(path.join(bookRoot,'tools','extract-codex-details.cjs'),'utf8');
const packExtractor=fs.readFileSync(path.join(bookRoot,'tools','extract-faction-pack.py'),'utf8');
const aggregateBuilder=fs.readFileSync(path.join(bookRoot,'tools','build-related-rules.mjs'),'utf8');
assert.doesNotMatch(codexExtractor,/space-marines-related-rules\.en\.json|previousRelated|structuredClone\(previous/,'SM-FB-02 final aggregate feedback remains');
assert.doesNotMatch(packExtractor,/space-marines-related-rules\.en\.json|existing_related|combined_related/,'SM-FB-04 final aggregate feedback remains');
assert.doesNotMatch(aggregateBuilder,/ByTitle|titleKey|\.title\s*===|\.title\s*==/,'owner resolution must not use display-title fallback');
const writerSources=fs.readdirSync(path.join(bookRoot,'tools')).filter(name=>/\.(?:mjs|cjs|js|py)$/.test(name)).map(name=>({name,source:fs.readFileSync(path.join(bookRoot,'tools',name),'utf8')}));
const aggregateWriters=writerSources.filter(item=>item.source.includes("const outputPath=path.join(defaultBookRoot,'content','space-marines-related-rules.en.json')")&&item.source.includes('fs.writeFileSync(outputPath,output'));
assert.deepEqual(aggregateWriters.map(item=>item.name),['build-related-rules.mjs'],'final aggregate must have exactly one writer');

const makeBundle=()=>{
  const temp=createQaTempDir('sm-related-rules-owner-');
  const relatives=['sources/space-marines-related-rules-contracts.v1.json','content/space-marines-faction-pack-related-rules.component.json',...Object.values(artifact.sourceBindings).map(item=>item.path)];
  for(const relative of new Set(relatives)){
    const source=path.join(bookRoot,...relative.split('/')),destination=path.join(temp,...relative.split('/'));
    fs.mkdirSync(path.dirname(destination),{recursive:true});
    fs.copyFileSync(source,destination);
  }
  return temp;
};

let absentBundle,poisonBundle;
try{
  absentBundle=makeBundle();
  const absentOutput=path.join(absentBundle,'content','space-marines-related-rules.en.json');
  assert.equal(fs.existsSync(absentOutput),false,'absent aggregate probe must start without previous output');
  assert.deepEqual(buildRelatedRules({bookRoot:absentBundle,authenticateRepository:false}),tracked,'missing prior aggregate influenced rebuild');

  poisonBundle=makeBundle();
  const poisonOutput=path.join(poisonBundle,'content','space-marines-related-rules.en.json');
  fs.writeFileSync(poisonOutput,JSON.stringify({schema:1,faction:'Space Marines',sourceId:'poison',fakeTopLevel:true,stratagems:{'poisoned-pack':{},'poisoned-codex':{}},enhancements:{'poisoned-enhancement':{owner:{subject:'wrong'}}}},null,2));
  assert.deepEqual(buildRelatedRules({bookRoot:poisonBundle,authenticateRepository:false}),tracked,'poisoned prior aggregate influenced rebuild');
}finally{
  for(const temp of [absentBundle,poisonBundle])if(temp)cleanupQaTempDir(temp);
}

const buildInputs=loadRelatedRulesBuildInputs({bookRoot,authenticateRepository:false});
const mutate=change=>{const copy=structuredClone(buildInputs);change(copy);return()=>buildRelatedRulesFromInputs(copy);};
assert.throws(mutate(value=>{const entries=Object.entries(value.packComponent.stratagems);delete value.packComponent.stratagems[entries[0][0]];value.packComponent.stratagems['unknown-count-preserving-stratagem']=entries[0][1];}),/does not exactly cover accepted Stratagem identities/,'count-preserving identity substitution must fail');
assert.throws(mutate(value=>{value['codex-overlay'].detachments[0].enhancements[0].id='enhancement-avenging-angel';}),/expected 87 unique source Enhancement identities/,'duplicate canonical Enhancement identity must fail');
assert.throws(mutate(value=>{value.accepted.enhancements.find(item=>item.id==='spy-skull-data-link').detachmentId='wrong-detachment';}),/supplemental Detachment conflict/,'conflicting owner contract must fail');
assert.equal(serializeRelatedRules(buildRelatedRulesFromInputs(buildInputs)),serializeRelatedRules(buildRelatedRulesFromInputs(buildInputs)),'two rebuilds must be byte-identical');
const reordered=structuredClone(buildInputs);
reordered.packComponent.stratagems=Object.fromEntries(Object.entries(reordered.packComponent.stratagems).reverse());
reordered['faction-pack-canonical'].detachments.reverse();
reordered['codex-overlay'].detachments.reverse();
assert.equal(serializeRelatedRules(buildRelatedRulesFromInputs(reordered)),serializeRelatedRules(buildRelatedRulesFromInputs(buildInputs)),'producer/component order must not affect aggregate');

console.log('PASS Space Marines Related Rules owner: 81 Pack + 42 Codex Stratagems, 87 Enhancements, absent/poison prior aggregate ignored.');
