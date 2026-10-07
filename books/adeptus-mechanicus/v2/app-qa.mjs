import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';
import {enumerateExpectedFacts,verifyCanonicalInventory,factPointer} from './app-fact-oracle.mjs';
import {createAdMechCompatibilityCompiler} from './rule-contract-context.mjs';

const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const filename=value=>String(value instanceof URL?fileURLToPath(value):value).replace(/\\/g,'/');
export const legacyClasses=Object.freeze([
  ['legacy factual content',/books\/adeptus-mechanicus\/content\//],
  ['legacy generated reader data',/books\/adeptus-mechanicus\/(?:(?:scripts|mobile)\/|(?:reader|index)\.html)/],
  ['legacy compatibility',/books\/adeptus-mechanicus\/(?:generated\/|.*(?:correction-ledger|owner-matrix))/],
  ['legacy contract sources',/books\/adeptus-mechanicus\/sources\/[^/]*(?:effect-contract|wargear-contract|structural-contract|roster-contract)/],
  ['legacy roster parser/runtime',/books\/shared\/(?:roster-parser|roster-context|effect-runtime)\.js$/],
  ['legacy glossary facts',/(?:^|\/)(?:glossary\/|glossary-data(?:\/|\.)|glossary\.js$)/]
]);
const forbidden=file=>legacyClasses.find(([,expression])=>expression.test(file));

if(process.argv.includes('--isolation')) {
  const original=fs.readFileSync,reads=[];
  fs.readFileSync=function(file,...args) {
    const name=filename(file);reads.push(name);
    if(process.argv.includes('--poison')&&forbidden(name))return args[0]?'POISONED_LEGACY_FACT':Buffer.from('POISONED_LEGACY_FACT');
    return original.call(this,file,...args);
  };
  syncBuiltinESMExports();
  const {buildApp}=await import('./app-build.mjs');
  const payload=buildApp();
  console.log(JSON.stringify({hash:hash(payload),forbidden:reads.filter(forbidden),reads}));
  process.exit(0);
}

const canonicalValue=(book,field)=>{
  const owner=book.entities.find(entity=>entity.id===field.source?.entityId);
  if(!owner)return undefined;
  return field.source.path.slice(1).split('/').filter(Boolean).map(key=>key.replace(/~1/g,'/').replace(/~0/g,'~'))
    .reduce((value,key)=>value?.[key],owner.data);
};

export function validatePresentation(payload,model,records=new Map()) {
  const census=verifyCanonicalInventory(model),expected=enumerateExpectedFacts(model);
  const cards=new Map(payload.cards.map(card=>[card.id,card]));
  assert.equal(cards.size,payload.cards.length,'WRONG_IDENTITY duplicate canonical card');
  for(const entity of model.entities) {
    const card=cards.get(entity.id);assert.ok(card,`MISSING canonical owner ${entity.id}`);
    assert.equal(card.source.entityId,entity.id,'WRONG_IDENTITY canonical owner');
    assert.equal(card.parentId,entity.parentId,'WRONG_CONTEXT canonical parent');
    if(entity.data.title||entity.data.name)assert.equal(card.title,entity.data.title||entity.data.name,'WRONG_VALUE canonical heading');
  }
  const fields=new Map();
  for(const card of cards.values())for(const field of card.fields) {
    assert.ok(!fields.has(field.id),`DUPLICATE_SEMANTIC_OUTPUT ${field.id}`);
    fields.set(field.id,{card,field});
    if(field.targetIds)for(const id of field.targetIds)assert.ok(cards.has(id),`Unresolved canonical reference ${id}`);
    const value=canonicalValue(model,field);
    if(value!==undefined)assert.deepEqual(field.value,value,`UNSOURCED_UI_FACTS / WRONG_VALUE ${field.id}`);
    else if(records.has(field.source?.entityId)) {
      const record=records.get(field.source.entityId);
      const path=field.source.path.slice(1).split('/').map(key=>key.replace(/~1/g,'/').replace(/~0/g,'~'));
      assert.deepEqual(field.value,path.reduce((value,key)=>value?.[key],record),`Wrong centralized MFM fact ${field.id}`);
    } else assert.equal(card.domain,'CORE',`UNSOURCED_UI_FACTS ${field.id}`);
  }
  const manifest=new Map(payload.factManifest.map(fact=>[fact.id,fact]));
  assert.equal(manifest.size,payload.factManifest.length,'Duplicate source manifest fact');
  for(const fact of expected) {
    const found=fields.get(fact.id);assert.ok(found,`MISSING_FROM_UI ${fact.id}`);
    assert.equal(found.field.source.entityId,fact.entityId,'WRONG_IDENTITY field owner');
    assert.equal(found.field.source.path,factPointer(fact.path),'WRONG_IDENTITY source address');
    assert.deepEqual(found.field.value,fact.value,`WRONG_VALUE ${fact.id}`);
    assert.equal(found.field.contextId,fact.contextId,`WRONG_CONTEXT ${fact.id}`);
    assert.deepEqual(manifest.get(fact.id)?.value,fact.value,`MISSING / WRONG_VALUE manifest ${fact.id}`);
    assert.deepEqual(manifest.get(fact.id)?.path,fact.path,`Wrong manifest source address ${fact.id}`);
  }
  const reachable=new Set();
  const visit=id=>{assert.ok(cards.has(id),`Unresolved tree target ${id}`);if(reachable.has(id))return;reachable.add(id);cards.get(id).children.forEach(visit);};
  payload.groups.forEach(group=>group.itemIds.forEach(visit));
  for(const entity of model.entities)assert.ok(reachable.has(entity.id),`Unreachable canonical owner ${entity.id}`);
  const contracts=model.entities.filter(entity=>entity.ruleContract);
  assert.equal(contracts.length,204,'Independent contract-owner denominator');
  for(const entity of contracts) {
    assert.ok(reachable.has(entity.id),`Rule Contract owner invisible ${entity.id}`);
    assert.ok(cards.get(entity.id).fields.length,`Empty Rule Contract presentation ${entity.id}`);
  }
  for(const [kind,count]of Object.entries(census))assert.equal(payload.cards.filter(card=>card.kind===kind).length,count,`Wrong visible ${kind} denominator`);
  return {canonicalFactsChecked:expected.length,sourceRulesVisible:contracts.length,missing:0,wrongValue:0,wrongIdentity:0,wrongContext:0,unsourcedUIFacts:0};
}

export function runIsolationQA() {
  const run=poison=>{
    const result=spawnSync(process.execPath,[fileURLToPath(import.meta.url),'--isolation',...(poison?['--poison']:[])],{encoding:'utf8',maxBuffer:16*1024*1024});
    assert.equal(result.status,0,result.stderr);return JSON.parse(result.stdout);
  };
  const baseline=run(false),poisoned=run(true);
  assert.deepEqual(baseline.forbidden,[],'Legacy factual/runtime read');
  assert.deepEqual(poisoned.forbidden,[],'Legacy factual poison reached application');
  assert.equal(hash(baseline.hash),hash(poisoned.hash),'Legacy poison changed V2 output');
  return {legacyPoisonClasses:legacyClasses.length,legacyFactualReads:0,legacyRuntimeReads:0,tracedReads:baseline.reads.length};
}

export function verifyBookCompatibility(payload,inputs) {
  const compiler=createAdMechCompatibilityCompiler(inputs.model,inputs.evaluator);
  const index=new Map(inputs.model.entities.map(entity=>[entity.id,entity]));
  const expected=compiler.compileRows({kinds:['STRATAGEM','ENHANCEMENT'],order:'UNIT_RULE',sort:true});
  const actual=new Map(payload.relatedRules.rows.map(row=>[row.unitId+'\0'+row.ruleId,row]));
  assert.equal(actual.size,34*(51+34),'Related Rules Cartesian denominator');
  for(const row of expected.rows) {
    const found=actual.get(row.unitId+'\0'+row.ruleId);assert.ok(found,'Missing compatible relationship');
    assert.equal(found.state,row.state);assert.equal(found.applicability,row.applicability);
    assert.equal(found.detachmentId,index.get(row.ruleId).ruleContract.detachmentId,'Cross-Detachment leakage');
    const selected=compiler.evaluateRule(row.unitId,row.ruleId,{detachmentId:found.detachmentId});
    assert.equal(found.selectedDetachment.state,selected.state);
    assert.equal(found.selectedDetachment.applicability,selected.applicability);
    assert.notEqual(found.state,'INVALID');assert.notEqual(found.selectedDetachment.state,'INVALID');
  }
  let contexts=0;
  for(const unit of inputs.model.entities.filter(entity=>entity.kind==='DATASHEET')) {
    for(const subject of ['MODEL','UNIT','FORMED_ATTACHED_UNIT','ROSTER'])for(const context of compiler.contextsFor(unit.id,subject)) {
      assert.deepEqual(context.roster,{},'Book mode invented roster state');
      assert.deepEqual(context.battle,{},'Book mode invented battle state');contexts++;
    }
  }
  const mixed=compiler.contextsFor('unit-servitor-battleclade','MODEL');
  assert.equal(mixed.length,2);assert.equal(mixed[0].intrinsicKeywords.has('TECH-PRIEST'),true);
  assert.equal(mixed[1].intrinsicKeywords.has('TECH-PRIEST'),false,'Mixed MODEL profile keyword leakage');
  for(const id of ['army-rule-doctrina-imperatives:introduction','army-rule-doctrina-imperatives:protector-imperative','army-rule-doctrina-imperatives:conqueror-imperative']) {
    const result=compiler.evaluateRule('unit-tech-priest-dominus',id);
    assert.equal(result.state,'UNKNOWN','Ordinary Imperative activation invented');
    assert.equal(result.applicability,'CONDITIONAL');
  }
  assert.deepEqual(new Set(payload.ruleContractIds),new Set(inputs.model.entities.filter(entity=>entity.ruleContract).map(entity=>entity.id)),'Lost canonical contract identity');
  return {relatedRuleRelations:actual.size,bookContextsChecked:contexts,mixedProfileIsolation:'PASS',ordinaryDoctrinaActivation:'CONDITIONAL'};
}

// Diagnostic comparison against independent canonical/MFM headings. These
// labels validate an explicit binding; they never construct production IDs.
function verifyMfmBindings(inputs) {
  for(const binding of inputs.mfmBindings.enhancementBindings) {
    const entity=inputs.model.entities.find(entity=>entity.id===binding.entityId);
    const cost=inputs.records.get(binding.mfmRecordId);
    const expected=entity.data.title+(entity.data.sourceTypeLabel==='UPGRADE'?' (Upgrade)':'');
    assert.equal(cost.label.toLowerCase(),expected.toLowerCase(),'Wrong canonical Enhancement/MFM cost binding');
  }
}

if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const {readAppInputs,buildApp}=await import('./app-build.mjs');
  const inputs=readAppInputs(),canonicalHash=hash(inputs.model),payload=buildApp(inputs),result=validatePresentation(payload,inputs.model,inputs.records),compatibility=verifyBookCompatibility(payload,inputs),mutations=[];
  verifyMfmBindings(inputs);
  const badPoints={...inputs,mfmBindings:structuredClone(inputs.mfmBindings)};
  const first=badPoints.mfmBindings.enhancementBindings[0],second=badPoints.mfmBindings.enhancementBindings[1];
  [first.mfmRecordId,second.mfmRecordId]=[second.mfmRecordId,first.mfmRecordId];
  assert.throws(()=>verifyMfmBindings(badPoints));mutations.push('wrong Enhancement cost owner');
  assert.equal(hash(inputs.model),canonicalHash,'Presentation mutated canonical facts/contracts');
  const sample=enumerateExpectedFacts(inputs.model)[0];
  for(const [name,mutate]of [
    ['source fact dropped',p=>{const card=p.cards.find(card=>card.fields.some(field=>field.id===sample.id));card.fields=card.fields.filter(field=>field.id!==sample.id);}],
    ['source value changed',p=>p.cards.flatMap(card=>card.fields).find(field=>field.id===sample.id).value='POISON'],
    ['canonical identity changed',p=>p.cards.find(card=>card.id===sample.entityId).id='POISON'],
    ['source evidence severed',p=>p.cards.flatMap(card=>card.fields).find(field=>field.id===sample.id).source.entityId='POISON'],
    ['fact context changed',p=>p.cards.flatMap(card=>card.fields).find(field=>field.id===sample.id).contextId='POISON'],
    ['manifest value changed',p=>p.factManifest.find(fact=>fact.id===sample.id).value='POISON'],
    ['canonical owner duplicated',p=>p.cards.push(structuredClone(p.cards[0]))]
  ]) {const clone=structuredClone(payload);mutate(clone);assert.throws(()=>validatePresentation(clone,inputs.model,inputs.records),undefined,name);mutations.push(name);}
  const model=structuredClone(inputs.model),weapon=model.entities.find(entity=>entity.kind==='WEAPON_PROFILE');
  const original=weapon.data.strength;weapon.data.strength='77';
  const changed=buildApp({...inputs,model});validatePresentation(changed,model,inputs.records);
  assert.notEqual(hash(changed),hash(payload),'Canonical V2 mutation failed to reach presentation');
  assert.equal(inputs.model.entities.find(entity=>entity.id===weapon.id).data.strength,original,'Producer mutated immutable facts');
  mutations.push('V2 source value reaches presentation');
  const generatedPoison=structuredClone(inputs.model);
  generatedPoison.compatibilityProjection={authority:'DISPOSABLE_PROJECTION',rows:[{unitId:'unit-tech-priest-dominus',ruleId:'detachment-lords-of-the-forge:enhancement:2',applicability:'NO_MATCH'}]};
  assert.equal(hash(buildApp({...inputs,model:generatedPoison})),hash(payload),'Generated pairwise output acquired factual authority');
  mutations.push('poisoned generated compatibility ignored');
  const unclassified=structuredClone(inputs.model);unclassified.entities[0].data.unrecognizedFutureFact='POISON';
  assert.throws(()=>enumerateExpectedFacts(unclassified));mutations.push('unknown canonical field fails closed');
  const census=JSON.parse(fs.readFileSync(new URL('./generated/factual-census.json',import.meta.url),'utf8'));
  assert.equal(census.sourceFactsTotal,6481);assert.equal(census.sourceFactsBound,6481);assert.equal(census.sourceFactsMissing,0);
  assert.equal(Object.values(census.factPartitions).reduce((sum,count)=>sum+count,0),6481,'Independent accepted source partition accounting');
  const contracts=JSON.parse(fs.readFileSync(new URL('./generated/rule-contract-census.json',import.meta.url),'utf8'));
  assert.equal(contracts.valid,204);assert.equal(contracts.invalidContracts,0);assert.equal(contracts.unboundSourceRules,0);assert.equal(contracts.blockedOwners,0);
  const generated=JSON.parse(fs.readFileSync(new URL('./generated/app-presentation.json',import.meta.url),'utf8'));
  assert.equal(hash(generated),hash(payload),'Disposable application output stale');
  console.log(JSON.stringify({status:'PASS',...result,...compatibility,sourceFacts:6481,contracts:204,mutations,...runIsolationQA()},null,2));
}
