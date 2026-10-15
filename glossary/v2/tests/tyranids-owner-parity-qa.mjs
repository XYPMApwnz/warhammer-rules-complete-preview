/** Focused fifth-book integration, using the existing factual owner and parity guard. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {loadGlossaryV2Inputs,assertGlossaryV2Parity} from '../content/glossary-v2-index.mjs';
import {adaptGlobalGlossary} from '../../../books/shared/army-book-app-v2/global-glossary.mjs';
import {createReferenceContract} from '../../../books/shared/army-book-app-v2/reference-contract.mjs';
import {createGlobalGlossaryContent} from '../../../books/shared/army-book-app-v2/global-glossary-content.mjs';

const root=new URL('../../../',import.meta.url);
const read=file=>JSON.parse(fs.readFileSync(new URL(file,root),'utf8'));
const inputs=await loadGlossaryV2Inputs(),index=read('glossary/v2/generated/index.en.json');
assertGlossaryV2Parity(index,inputs);
const model=inputs.armyModels.find(model=>model.book.id==='tyranids');
const facts=new Map(model.entities.map(entity=>[entity.id,entity]));
const entries=index.entries.filter(entry=>entry.sourceOwner.bookId==='tyranids');
const byId=new Map(entries.map(entry=>[entry.sourceOwner.canonicalId,entry]));
assert.equal(byId.size,entries.length,'Duplicate Tyranids factual owner');
assert.equal(byId.size,[...facts.values()].filter(fact=>fact.data.status!=='SUPERSEDED').length,'Complete Tyranids factual inventory');
for(const [id,fact] of facts){
  if(fact.data.status==='SUPERSEDED'){assert.ok(!byId.has(id),'Historical reference published as current');continue;}
  const entry=byId.get(id);assert.ok(entry,id);
  assert.deepEqual(entry.facts.canonicalData,fact.data,id+' content');
  assert.deepEqual(entry.provenance,fact.provenance,id+' provenance');
  assert.equal(entry.parent?.canonicalId,facts.has(fact.parentId||fact.ownerId)?fact.parentId||fact.ownerId:undefined,id+' owner');
}
for(const [kind,count] of Object.entries({DATASHEET:52,DETACHMENT:10,DETACHMENT_RULE:11,ENHANCEMENT:34,STRATAGEM:51,ARMY_RULE:2}))assert.equal(model.entities.filter(entity=>entity.kind===kind).length,count,kind);
const elevated='detachment-warrior-bioform-onslaught:enhancement:1';
const vanguard='detachment-vanguard-onslaught:rule:vanguard-prime';
assert.equal(byId.get(vanguard).parent.canonicalId,'detachment-vanguard-onslaught');
assert.match(byId.get(elevated).facts.text,/Can re-roll wound rolls\./);
assert.match(byId.get(elevated).facts.text,/Have \+1 AP\./);
for(const [unit,ordinal] of [['old-one-eye',1],['psychophage',2]]){
  const entry=byId.get(`datasheet-${unit}:rule-reference:${ordinal}`);
  assert.equal(entry.facts.canonicalData.label,'Feel No Pain 5+');assert.equal(entry.facts.scope,'MODEL');
  assert.deepEqual(entry.facts.recipient.modelProfileIds,[`datasheet-${unit}:profile:1`]);
}
for(const id of ['army-rule-synapse','army-rule-shadow-in-the-warp']){
  const entry=byId.get(id);assert.equal(entry.facts.conditionalOnly,true);
  for(const component of entry.facts.componentIds)assert.deepEqual(byId.get(component).facts.canonicalData,facts.get(component).data);
}
const view=createGlobalGlossaryContent(index);
const conflict=byId.get('tyranids-source-conflict-foul-spores');
assert.equal(conflict.facts.executable,false);
assert.equal(conflict.facts.classification,'UNRESOLVED_OFFICIAL_CONTRADICTION');
for(const evidence of conflict.facts.officialEvidence)assert.ok(view.project(conflict).definition.includes(evidence.text),'Conflict evidence hidden');
for(const unit of ['harpy','biovores'])for(const fact of model.entities.filter(entity=>entity.id.startsWith(`datasheet-${unit}:`)&&entity.data.status!=='SUPERSEDED'))assert.deepEqual(byId.get(fact.id).facts.canonicalData,fact.data,'Official effective value '+fact.id);
for(const entry of entries.filter(entry=>entry.mfm)){
  const central=JSON.stringify(entry.mfm);assert.ok(central.includes('v1.6'),'Current MFM provenance');
}
const projection=adaptGlobalGlossary(index),cards=new Map(projection.cards.map(card=>[card.id,card]));
const references=createReferenceContract({cards,index:projection.index});
for(const id of [elevated,vanguard]){
  const entry=byId.get(id);assert.equal(references.resolveAlias(id,{registryId:'tyranids'}),entry.id);
  assert.equal(references.resolve({registryId:'tyranids',canonicalId:id,fieldPath:'/glossary/'+entry.id})?.targetId,entry.id);
  assert.ok(view.project(entry).definition.includes(entry.facts.text),'Source text in glossary view');
}
// Only a scoped predecessor snapshot is used for regression: no new source oracle.
const previous=JSON.parse(execFileSync('git',['show','642684b4d1d33e97c75ee5a00e0aa542d1b9329d:glossary/v2/generated/index.en.json'],{cwd:root,encoding:'utf8',maxBuffer:80*1024*1024}));
const current=new Map(index.entries.map(entry=>[entry.id,entry]));
const four=['death-guard','adeptus-mechanicus','chaos-space-marines','emperors-children'];
const old=previous.entries.filter(entry=>four.includes(entry.sourceOwner.bookId));
for(const entry of old)assert.deepEqual(current.get(entry.id),entry,'Prior Army article changed '+entry.id);
let mutations=0;
const reject=(label,change)=>{const changed=structuredClone(index);change(changed);assert.throws(()=>assertGlossaryV2Parity(changed,inputs),undefined,label);mutations++;};
const find=(candidate,id)=>candidate.entries.find(entry=>entry.sourceOwner.bookId==='tyranids'&&entry.sourceOwner.canonicalId===id);
reject('missing sibling',candidate=>{candidate.entries=candidate.entries.filter(entry=>entry.id!==byId.get(vanguard).id);});
reject('truncated Elevated Might',candidate=>{find(candidate,elevated).facts.canonicalData.text='WINGED TYRANID PRIME model only.';});
reject('wrong physical FNP recipient',candidate=>{find(candidate,'datasheet-old-one-eye:rule-reference:1').facts.canonicalData.recipient.modelProfileIds=['datasheet-carnifexes:profile:1'];});
reject('wrong faction owner',candidate=>{find(candidate,elevated).sourceOwner.bookId='emperors-children';});
reject('lost provenance',candidate=>{find(candidate,vanguard).provenance=[];});
reject('duplicate canonical identity',candidate=>{candidate.entries.push(structuredClone(find(candidate,vanguard)));});
reject('stale official Harpy profile',candidate=>{find(candidate,'datasheet-harpy:profile:1').facts.canonicalData.stats.M='20+';});
const changedInputs={...inputs,armyModels:structuredClone(inputs.armyModels)};
changedInputs.armyModels.find(model=>model.book.id==='tyranids').entities.find(entity=>entity.id===elevated).data.text+=' Changed source condition.';
assert.throws(()=>assertGlossaryV2Parity(index,changedInputs),'Fresh source with stale Glossary');mutations++;
console.log(JSON.stringify({status:'PASS',tyranidsCanonicalOwners:entries.length,namedRules:11,previousArmyArticlesUnchanged:old.length,mutationControls:mutations,sourceVersion:'v1.6'}));
