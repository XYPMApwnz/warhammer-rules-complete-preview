import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildApp,readAppInputs} from './app-build.mjs';
import {runIsolationQA,validatePresentation} from './app-qa.mjs';
import {buildGlossary,searchGlossary,validateGlossary} from '../../shared/army-book-app-v2/glossary.mjs';

// The source owners establish the census. The disposable index owns no facts.
const inputs=readAppInputs(),before=JSON.stringify(inputs),payload=buildApp(inputs);
const projected=buildGlossary({model:inputs.model,coreCatalog:inputs.coreCatalog});
assert.equal(JSON.stringify(inputs),before,'Glossary build mutated canonical inputs');
assert.deepEqual(payload.glossary,projected.index,'App omitted or substituted the shared index');
assert.equal(fs.readFileSync(new URL('./generated/app-presentation.json',import.meta.url),'utf8'),JSON.stringify(payload,null,2)+'\n','Generated glossary drift');
assert.deepEqual(buildApp(inputs),payload,'Nondeterministic glossary rebuild');
const cards=new Map(payload.cards.map(card=>[card.id,card]));
const expected=new Set([
  ...inputs.model.entities.filter(entity=>entity.ruleContract||entity.kind==='DETACHMENT').map(entity=>entity.id),
  ...inputs.coreCatalog.records.map(record=>record.id)
]);
assert.deepEqual(new Set(payload.glossary.entries.map(entry=>entry.targetId)),expected,'Missing canonical glossary owner');
const validation=validateGlossary(payload.glossary,payload.cards);
const pointer=(value,path)=>path.slice(1).split('/').map(key=>key.replaceAll('~1','/').replaceAll('~0','~')).reduce((child,key)=>child?.[key],value);
const canonical=new Map(inputs.model.entities.map(entity=>[entity.id,entity.data]));
let aliases=0,queries=0;
for(const entry of payload.glossary.entries){
  assert.deepEqual(Object.keys(entry).sort(),['aliases','category','contextLabel','label','targetId'],'Glossary became a factual catalog');
  for(const label of [entry.label,...entry.aliases.map(alias=>alias.label)]){
    const hits=searchGlossary(payload.glossary,label);
    assert.equal(new Set(hits.map(hit=>hit.targetId)).size,hits.length,'Duplicate search targets');
    assert.ok(hits.some(hit=>hit.targetId===entry.targetId),'Unsearchable canonical label/alias');queries++;
  }
  for(const alias of entry.aliases){
    assert.equal(alias.presentationOnly,true);
    if(alias.fieldPath){
      assert.ok(pointer(canonical.get(entry.targetId),alias.fieldPath)?.includes(alias.label),'Alias lacks canonical source wording');
      assert.ok(cards.get(entry.targetId).fields.some(field=>field.source?.path===alias.fieldPath),'Alias lost popup field');
    }
    aliases++;
  }
}
for(const [label,targetId]of Object.entries(inputs.coreCatalog.aliases||{})){
  assert.ok(searchGlossary(payload.glossary,label).some(hit=>hit.targetId===targetId),'Core alias changed canonical owner');
}
assert.deepEqual(searchGlossary(payload.glossary,'UNKNOWN_GLOSSARY_QUERY_79317'),[]);
assert.deepEqual(payload.cards.filter(card=>card.domain==='CORE'),projected.coreCards,'Glossary changed Core reference definitions');
let mutations=0;
const reject=change=>{const index=structuredClone(payload.glossary);change(index);assert.throws(()=>validateGlossary(index,payload.cards));mutations++;};
reject(index=>index.entries.push(structuredClone(index.entries[0])));
reject(index=>index.entries[0].targetId='unknown-canonical-target');
reject(index=>index.entries[0].text='Competing factual definition');
reject(index=>index.entries[0].aliases.push({label:'Unknown source alias',fieldPath:'/absent',presentationOnly:true}));
// A missing payload index is the production regression, independently of counts.
assert.ok(payload.glossary?.entries.length>0,'No active Glossary index');
const parity=validatePresentation(payload,inputs.model,inputs.records);
const isolation=runIsolationQA();
console.log(JSON.stringify({status:'PASS',...validation,aliases,searchQueries:queries,mutations,
  deterministicRebuild:'PASS',sourceParity:parity,...isolation}));
