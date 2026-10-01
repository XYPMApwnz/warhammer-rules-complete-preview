import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {syncBuiltinESMExports} from 'node:module';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {enumerateExpectedFacts} from './app-fact-oracle.mjs';

const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const legacyClasses=Object.freeze([
  ['DG content',/books\/death-guard\/content\//],
  ['DG reader data and HTML',/books\/death-guard\/(?:(?:scripts|mobile)\/|(?:reader|index)\.html)/],
  ['DG generated/compatibility',/books\/death-guard\/(?:generated\/|.*(?:compatible-rules|compatibility|owner-matrix|correction-ledger))/],
  ['DG V1 effects',/books\/death-guard\/.*(?:effect-contract|wargear-contract|roster-data|target-data)/],
  ['legacy Glossary',/(?:^|\/)(?:glossary\/|glossary-data(?:\/|\.)|glossary\.js$)/]
]);
const legacyClass=file=>legacyClasses.find(([,expression])=>expression.test(file));
const filename=value=>String(value instanceof URL?fileURLToPath(value):value).replace(/\\/g,'/');

// Fresh process: poison every forbidden legacy factual read before production modules load.
if (process.argv.includes('--isolation')) {
  const poisoned=process.argv.includes('--poison'),read=fs.readFileSync,reads=[];
  fs.readFileSync=function(file,...args){const name=filename(file);reads.push(name);if(poisoned&&legacyClass(name))return args[0]?'{"POISONED_LEGACY_FACT":true}':Buffer.from('POISONED_LEGACY_FACT');return read.call(this,file,...args);};
  syncBuiltinESMExports();
  const {buildApp}=await import('./app-build.mjs');
  const payload=buildApp();
  const forbidden=reads.filter(legacyClass);
  console.log(JSON.stringify({hash:hash(payload),forbidden,reads}));
  process.exit(0);
}

export function expectedDisplay(fact,model,records) {
  const e=new Map(model.entities.map(entity=>[entity.id,entity]));
  const title=entity=>entity.data?.title||entity.data?.name||entity.label||String(entity.kind||entity.recordType).replace(/_/g,' ').replace(/([a-z])([A-Z])/g,'$1 $2');
  if (typeof fact.value==='boolean'&&fact.path.at(-1)==='wargearAbility') return fact.value?'Wargear ability':'Datasheet ability';
  if (Array.isArray(fact.value)&&!fact.value.length) return fact.path.at(-1)==='abilities'?'No weapon abilities':'None';
  if (typeof fact.value==='string') {
    if (e.has(fact.value)) return title(e.get(fact.value));
    if (records.has(fact.value)) return records.get(fact.value).label;
    const binding=model.mfm.unitBindings.find(b=>records.get(b.mfmRecordId).unitReferenceId===fact.value)||model.mfm.enhancementBindings.find(b=>b.armyEnhancementId===fact.value);
    if (binding) return title(e.get(binding.entityId));
  }
  return typeof fact.value==='object'?JSON.stringify(fact.value):String(fact.value);
}

export function validatePresentation(payload,model,records) {
  // Core records are a separate canonical domain consumed by Glossary. This
  // unchanged oracle proves the original Army Book fields and graph in full;
  // glossary-qa independently verifies every added Core record/field.
  assert.equal(new Set(payload.cards.map(card=>card.id)).size,payload.cards.length,'WRONG_IDENTITY duplicate cross-domain card');
  payload={...payload,cards:payload.cards.filter(card=>card.domain!=='CORE')};
  const expected=enumerateExpectedFacts(model,records),cards=new Map(payload.cards.map(c=>[c.id,c]));
  assert.equal(cards.size,payload.cards.length,'WRONG_IDENTITY duplicate card');
  assert.deepEqual(new Set(cards.keys()),new Set([...model.entities.map(e=>e.id),...records.keys()]),'WRONG_IDENTITY card universe');
  for (const entity of model.entities) {
    const card=cards.get(entity.id);
    assert.equal(card.title,entity.data.title||entity.data.name||String(entity.kind).replace(/_/g,' ').replace(/([a-z])([A-Z])/g,'$1 $2'),'WRONG_VALUE navigation title');
    assert.equal(card.kind,entity.kind,'WRONG_CONTEXT card kind');
    assert.equal(card.parentId,entity.parentId,'WRONG_CONTEXT canonical parent');
  }
  for (const [id,record] of records) {assert.equal(cards.get(id).title,record.label,'WRONG_VALUE central title');assert.equal(cards.get(id).kind,record.recordType,'WRONG_CONTEXT central type');}
  const fields=new Map();
  for (const card of cards.values()) {
    for (const id of [...card.children,...card.links.map(l=>l.targetId),...card.fields.flatMap(f=>f.targetIds||[])]) assert.ok(cards.has(id),'WRONG_IDENTITY reference');
    for (const id of card.children) assert.equal(cards.get(id).parentId,card.id,'WRONG_CONTEXT child placement');
    for (const f of card.fields) {assert.ok(!fields.has(f.id),'Duplicate field');fields.set(f.id,{card,field:f});}
  }
  assert.equal(fields.size,expected.length,'MISSING_FROM_UI field count');
  const manifest=new Map(payload.factManifest.map(f=>[f.id,f]));
  assert.equal(manifest.size,expected.length,'MISSING_FROM_UI manifest');
  for (const fact of expected) {
    const found=fields.get(fact.id);assert.ok(found,`MISSING_FROM_UI ${fact.id}`);
    const {card,field}=found;
    assert.deepEqual(field.value,fact.value,`WRONG_VALUE ${fact.id}`);
    assert.equal(field.source.entityId,fact.entityId,`WRONG_IDENTITY ${fact.id}`);
    const escaped='/'+fact.path.map(k=>String(k).replace(/~/g,'~0').replace(/\//g,'~1')).join('/');
    assert.equal(field.source.path,escaped,`WRONG_IDENTITY field address ${fact.id}`);
    assert.equal(field.contextId,fact.contextId,`WRONG_CONTEXT ${fact.id}`);
    assert.equal(card.id,fact.entityId===model.bookId?fact.contextId:fact.entityId,`WRONG_CONTEXT card ${fact.id}`);
    assert.equal(field.displayValue===undefined?(typeof field.value==='object'?JSON.stringify(field.value):String(field.value)):String(field.displayValue),expectedDisplay(fact,model,records),`WRONG_VALUE displayed ${fact.id}`);
    const m=manifest.get(fact.id);assert.ok(m);assert.deepEqual(m.value,fact.value);assert.equal(m.contextId,fact.contextId);assert.equal(m.cardId,card.id);
  }
  // Every field must be reachable through the normal book navigation, not just QA mounting.
  const seen=new Set(),visit=id=>{assert.ok(!seen.has(id),`Duplicate/cyclic visible owner ${id}`);seen.add(id);cards.get(id).children.forEach(visit);};
  payload.groups.forEach(g=>g.itemIds.forEach(visit));
  assert.equal(seen.size,cards.size,'Unreachable player-visible card');
  for (const kind of ['STRATAGEM','ENHANCEMENT','DETACHMENT_RULE']) for (const entity of model.entities.filter(e=>e.kind===kind)) assert.ok(entity.ruleContract,'Required Rule Contract V2 input missing');
  for (const binding of model.mfm.eligibilityEvidenceBindings) assert.match(cards.get(binding.sourceEntityId).note,/Base source evidence/,'Base eligibility evidence incorrectly presented as current');
  return {facts:expected.length,cards:cards.size,missing:0,wrongValue:0,wrongIdentity:0,wrongContext:0};
}

export function runProjectionQA() {
  const isolation=poison=>{
    const result=spawnSync(process.execPath,[fileURLToPath(import.meta.url),'--isolation',...(poison?['--poison']:[])],{encoding:'utf8',maxBuffer:8*1024*1024});
    assert.equal(result.status,0,result.stderr);return JSON.parse(result.stdout);
  };
  const baseline=isolation(false),poisoned=isolation(true);
  assert.deepEqual(baseline.forbidden,[],'V1 factual read');assert.deepEqual(poisoned.forbidden,[],'Legacy poison reached');assert.equal(baseline.hash,poisoned.hash,'Legacy poison changed V2');
  return {legacyPoisonClasses:legacyClasses.length,v1FactualReads:0,legacyGlossaryFactualReads:0,buildReads:baseline.reads};
}

if (process.argv[1]===fileURLToPath(import.meta.url)) {
  const {readAppInputs,buildApp}=await import('./app-build.mjs');
  const inputs=readAppInputs(),payload=buildApp(inputs),result=validatePresentation(payload,inputs.model,inputs.records),mutations=[];
  for (const [name,mutate] of [
    ['missing visible fact',p=>p.cards[0].fields.pop()],
    ['wrong visible value',p=>p.cards[0].fields[0].value='POISON'],
    ['wrong navigation title',p=>p.cards[0].title='POISON'],
    ['wrong display value',p=>p.cards[0].fields[0].displayValue='POISON'],
    ['wrong canonical owner',p=>p.cards[0].fields[0].source.entityId='POISON'],
    ['wrong context',p=>p.cards[0].fields[0].contextId='POISON'],
    ['poisoned manifest',p=>p.factManifest[0].value='POISON'],
    ['duplicate semantic owner',p=>p.cards.push(structuredClone(p.cards[0]))],
    ['unreachable card',p=>p.groups[2].itemIds.pop()]
  ]) {const clone=structuredClone(payload);mutate(clone);assert.throws(()=>validatePresentation(clone,inputs.model,inputs.records),undefined,name);mutations.push(name);}
  for (const [name,mutate] of [
    ['unknown canonical data field',m=>m.entities[0].data.futureGameplayField=1],
    ['unknown canonical envelope field',m=>m.entities[0].futureGameplayField=1],
    ['unknown qualification field',m=>m.entities.find(e=>e.qualifications).qualifications[0].value.futureGameplayField=1]
  ]) {const clone=structuredClone(inputs.model);mutate(clone);assert.throws(()=>enumerateExpectedFacts(clone,inputs.records),undefined,name);mutations.push(name);}
  const centralPoison=new Map([...inputs.records].map(([id,record])=>[id,structuredClone(record)]));centralPoison.values().next().value.futureGameplayField=1;
  assert.throws(()=>enumerateExpectedFacts(inputs.model,centralPoison));mutations.push('unknown central MFM field');
  const modelPoison=structuredClone(inputs.model),weapon=modelPoison.entities.find(e=>e.id==='datasheet-plague-marines:weapon:2');
  assert.equal(weapon.data.strength,'5');assert.equal(weapon.data.ap,'-1');weapon.data.strength='77';
  const changed=buildApp({model:modelPoison,records:inputs.records});validatePresentation(changed,modelPoison,inputs.records);assert.notEqual(hash(changed),hash(payload),'V2 fact poison not reflected');mutations.push('V2 weapon strength reflected');
  for (const kind of ['DATASHEET','DETACHMENT','ENHANCEMENT','STRATAGEM']) assert.equal(payload.cards.filter(c=>c.kind===kind).length,{DATASHEET:36,DETACHMENT:9,ENHANCEMENT:30,STRATAGEM:45}[kind]);
  const shared=new URL('../../shared/army-book-app-v2/',import.meta.url);
  for (const file of ['project.mjs','runtime.mjs']) assert.doesNotMatch(fs.readFileSync(new URL(file,shared),'utf8'),/death-guard|plague-marines|defiler|mortarion|compatible-rules\.json|legacy-glossary|(?:\.\.\/)+glossary\/|scripts\/data/i,'Book-specific/V1 factual dependency');
  const isolation=runProjectionQA();
  const generated=JSON.parse(fs.readFileSync(new URL('./generated/app-presentation.json',import.meta.url),'utf8'));assert.equal(hash(generated),hash(payload),'Generated output stale');
  console.log(JSON.stringify({status:'PASS',...result,mutations,legacyPoisonClasses:isolation.legacyPoisonClasses,v1FactualReads:0,legacyGlossaryFactualReads:0,titleOrProseFactualJoins:0,deathGuardGameplayBranches:0,tracedBuildReads:isolation.buildReads.length},null,2));
}
