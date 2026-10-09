import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';
import {createHash} from 'node:crypto';
import {enumerateExpectedFacts} from './app-fact-oracle.mjs';

const ownFile=fileURLToPath(import.meta.url);
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const filename=value=>String(value instanceof URL?fileURLToPath(value):value).replace(/\\/g,'/');
export const isLegacyGlossary=file=>/(?:^|\/)glossary\/|(?:^|\/)glossary-data(?:\/|\.)|core-fact-projection\.mjs/.test(filename(file));
const isDisposableIndex=file=>/books\/death-guard\/v2\/generated\/glossary-(?:index|v2)\.json$/.test(filename(file));

// Patch before loading production modules. Existing legacy Glossary and its
// generated V2 replacement are unavailable as factual inputs in both processes.
if(process.argv.includes('--isolation')) {
  const read=fs.readFileSync,reads=[],poison=process.argv.includes('--poison');
  fs.readFileSync=function(file,...args){const name=filename(file);reads.push(name);if(poison&&(isLegacyGlossary(name)||isDisposableIndex(name)))return args[0]?'{"POISONED_LEGACY_GLOSSARY_DEFINITION":true}':Buffer.from('POISONED_LEGACY_GLOSSARY_DEFINITION');return read.call(this,file,...args);};
  syncBuiltinESMExports();
  const {buildGlossaryProjection,readGlossaryInputs}=await import('./glossary-build.mjs');
  const {buildApp}=await import('./app-build.mjs');
  const inputs=readGlossaryInputs(),projected=buildGlossaryProjection(inputs.model,inputs.coreCatalog);
  const payload=buildApp();
  console.log(JSON.stringify({hash:sha({projected,payload}),legacyReads:reads.filter(isLegacyGlossary),disposableIndexReads:reads.filter(isDisposableIndex),reads}));
  process.exit(0);
}

export function resolvePointer(value,pointer) {
  assert.equal(typeof pointer,'string','Source field address must be a JSON pointer');
  assert.ok(pointer.startsWith('/'),'Source field address must be absolute');
  return pointer.slice(1).split('/').map(key=>key.replace(/~1/g,'/').replace(/~0/g,'~')).reduce((current,key)=>current?.[key],value);
}

export function expectedGlossaryTargets(model,coreCatalog) {
  return new Set([...model.entities.filter(entity=>entity.ruleContract||entity.kind==='DETACHMENT').map(entity=>entity.id),...coreCatalog.records.filter(record=>['FULL_CONTENT','SOURCE_CONFLICT'].includes(record.state)).map(record=>record.id)]);
}

export function expectedNamedAbilityAliases(model) {
  const aliases=[];
  for(const entity of model.entities.filter(entity=>entity.kind==='DATASHEET_SECTION'||entity.kind==='SUPPLEMENTAL_DATASHEET_RULE')) {
    for(const [i,block] of (entity.data.blocks||[]).entries()) {
      const match=String(block.text||'').match(/^([^:\n]{1,160}):/);
      // The accepted Leader paragraphs use a colon before their unit list;
      // that sentence is an instruction, rather than a named ability heading.
      if(match&&!/^This model can be attached to the following units?$/.test(match[1]))aliases.push({targetId:entity.id,label:match[1].trim(),fieldPath:`/blocks/${i}/text`});
    }
    const match=String(entity.data.text||'').match(/^([^:\n]{1,160}):/);
    if(match)aliases.push({targetId:entity.id,label:match[1].trim(),fieldPath:'/text'});
  }
  return aliases;
}

// Canonical public fields, selected by source meaning. Evidence envelopes,
// capture structures and metadata do not become competing definitions.
export function expectedCoreFields(record) {
  const fields=new Map();
  const scalarLeaves=(value,parts)=>{
    if(value===null||value===undefined)return;
    if(Array.isArray(value)){for(const [i,item] of value.entries())scalarLeaves(item,[...parts,i]);return;}
    if(typeof value==='object'){for(const [key,item] of Object.entries(value))scalarLeaves(item,[...parts,key]);return;}
    const pointer='/'+parts.map(part=>String(part).replace(/~/g,'~0').replace(/\//g,'~1')).join('/');fields.set(pointer,value);
  };
  scalarLeaves(record.title,['title']);
  if(record.code)scalarLeaves(record.code,['code']);
  if(record.state==='SOURCE_CONFLICT'){
    assert.equal(record.sourceConflict.status,'UNRESOLVED_ACCEPTED_SOURCE_CONFLICT');
    assert.equal(record.semanticContent,null,'Unresolved source conflict cannot have an effective winner');
    scalarLeaves(record.sourceConflict.notice,['sourceConflict','notice']);
    record.sourceConflict.occurrences.forEach((occurrence,i)=>{
      scalarLeaves(occurrence.title,['sourceConflict','occurrences',i,'title']);
      scalarLeaves(occurrence.presentationText,['sourceConflict','occurrences',i,'presentationText']);
    });
  } else if(!record.relationships?.sourceRuleId) {
    if(record.semanticContent!==null&&record.semanticContent!==undefined)scalarLeaves(record.semanticContent,['semanticContent']);
    else if(record.sourceStructure?.text)scalarLeaves(record.sourceStructure.text,['sourceStructure','text']);
  }
  for(const key of ['operation','parameters','overrides'])scalarLeaves(record[key],[key]);
  return fields;
}

/** Independent source/identity oracle: the index carries navigation metadata,
 * while each definition field resolves to its existing canonical source owner. */
export function validateGlossarySources(index,cards,model,coreCatalog) {
  assert.ok(Array.isArray(index.entries),'Missing disposable Glossary entries');
  const byId=new Map(cards.map(card=>[card.id,card]));
  assert.equal(byId.size,cards.length,'Duplicate canonical cards');
  const entries=new Map();
  const canonical=new Map([...model.entities.map(entity=>[entity.id,entity.data]),...coreCatalog.records.map(record=>[record.id,record])]);
  for(const entry of index.entries) {
    assert.ok(!entries.has(entry.targetId),'Duplicate Glossary canonical target');
    assert.ok(byId.has(entry.targetId),'Glossary target outside the canonical card map');
    assert.ok(canonical.has(entry.targetId),'Glossary manufactured a factual owner');
    assert.ok(Object.keys(entry).every(key=>['targetId','label','category','contextLabel','aliases'].includes(key)),'Glossary copied definitions or gameplay fields');
    for(const key of ['label','category','contextLabel'])assert.equal(typeof entry[key],'string',`Missing presentation ${key}`);
    assert.ok(entry.label.trim(),'Empty Glossary label');
    assert.ok(Array.isArray(entry.aliases),'Missing explicit presentation aliases');
    const aliasKeys=new Set();
    for(const alias of entry.aliases) {
      assert.ok(Object.keys(alias).every(key=>['label','fieldPath','presentationOnly'].includes(key)),'Alias copied factual data');
      assert.equal(alias.presentationOnly,true,'Alias cannot be a competing factual identity');
      assert.equal(typeof alias.label,'string');assert.ok(alias.label.trim());
      const key=JSON.stringify([alias.label,alias.fieldPath||null]);assert.ok(!aliasKeys.has(key),'Duplicate presentation alias');aliasKeys.add(key);
      if(alias.fieldPath) {
        const source=resolvePointer(canonical.get(entry.targetId),alias.fieldPath);
        assert.equal(typeof source,'string','Alias addresses absent/non-text canonical data');
        assert.ok(source.includes(alias.label),'Alias label not present at its canonical field address');
        assert.ok(byId.get(entry.targetId).fields.some(field=>field.source?.entityId===entry.targetId&&field.source.path===alias.fieldPath),'Alias field omitted from its canonical popup');
      }
    }
    entries.set(entry.targetId,entry);
  }
  assert.deepEqual(new Set(entries.keys()),expectedGlossaryTargets(model,coreCatalog),'Glossary source census differs from canonical rule owners');
  assert.deepEqual(index.entries.map(entry=>entry.targetId),[...entries.keys()].sort(),'Glossary order must be deterministic canonical identity order');
  const namedAliases=expectedNamedAbilityAliases(model);
  for(const expected of namedAliases)assert.ok(entries.get(expected.targetId)?.aliases.some(alias=>alias.label===expected.label&&alias.fieldPath===expected.fieldPath&&alias.presentationOnly),'Missing named ability presentation alias '+JSON.stringify(expected));
  const core=new Map(coreCatalog.records.map(record=>[record.id,record]));
  let coreFields=0;
  for(const card of cards.filter(card=>card.domain==='CORE')) {
    const record=core.get(card.id);assert.ok(record&&['FULL_CONTENT','SOURCE_CONFLICT'].includes(record.state),'Core popup outside the existing accepted catalog');
    assert.equal(card.title,record.title,'Core factual title changed');
    const expectedFields=expectedCoreFields(record),observedFields=new Set();
    for(const field of card.fields) {
      assert.equal(field.source.entityId,record.id,'Core definition changed factual owner');
      assert.equal(field.id,`${record.id}::${field.source.path}`,'Core fact identity changed');assert.equal(field.contextId,record.id,'Core fact context changed');
      assert.ok(!observedFields.has(field.source.path),'Duplicate Core factual path');observedFields.add(field.source.path);
      assert.deepEqual(field.value,resolvePointer(record,field.source.path),'Core popup changed canonical source value');coreFields++;
    }
    assert.deepEqual(observedFields,new Set(expectedFields.keys()),'Core definition/operation/parameter field census incomplete '+record.id);
    const relatedIds=Object.values(record.relationships||{}).flat().filter(Boolean);
    assert.deepEqual(card.links.map(link=>link.targetId).sort(),relatedIds.sort(),'Core canonical relationship census incomplete '+record.id);
    if(record.relationships?.sourceRuleId) {
      assert.ok(card.links.some(link=>link.targetId===record.relationships.sourceRuleId)||card.fields.some(field=>field.targetIds?.includes(record.relationships.sourceRuleId)),'Derived Core alias lacks its existing definition owner');
      assert.ok(!card.fields.some(field=>field.source.path==='/semanticContent'),'Derived Core alias duplicated its owner definition');
    } else if(record.semanticContent!==null)assert.ok(card.fields.some(field=>field.source.path==='/semanticContent'&&field.value===record.semanticContent),'Core definition omitted from canonical popup');
  }
  assert.deepEqual(new Set(cards.filter(card=>card.domain==='CORE').map(card=>card.id)),new Set(coreCatalog.records.filter(record=>['FULL_CONTENT','SOURCE_CONFLICT'].includes(record.state)).map(record=>record.id)),'Incomplete Core canonical card census');
  return {entries:entries.size,dgCanonicalTargets:model.entities.filter(entity=>entity.ruleContract||entity.kind==='DETACHMENT').length,coreCanonicalTargets:coreCatalog.records.filter(record=>['FULL_CONTENT','SOURCE_CONFLICT'].includes(record.state)).length,namedAbilityAliases:namedAliases.length,coreFields};
}

export function validateGlossarySearch(index,searchGlossary) {
  const targets=new Set(index.entries.map(entry=>entry.targetId));
  const check=query=>{
    const result=searchGlossary(index,query);assert.ok(Array.isArray(result));
    assert.equal(new Set(result.map(entry=>entry.targetId)).size,result.length,'Search duplicates a canonical target');
    for(const hit of result) {
      assert.ok(targets.has(hit.targetId),'Search creates a noncanonical result');
      const entry=index.entries.find(entry=>entry.targetId===hit.targetId);
      assert.ok(hit.matchedLabel===entry.label||entry.aliases.some(alias=>alias.label===hit.matchedLabel),'Search match label is outside the source-bound presentation index');
      if(hit.matchedFieldPath)assert.ok(entry.aliases.some(alias=>alias.label===hit.matchedLabel&&alias.fieldPath===hit.matchedFieldPath),'Search lost the named ability field context');
    }
    return result;
  };
  assert.deepEqual(new Set(check('').map(entry=>entry.targetId)),targets,'Empty search does not expose the full Glossary');
  let queries=1;
  for(const entry of index.entries)for(const label of [entry.label,...entry.aliases.map(alias=>alias.label)]) {
    assert.ok(check(label).some(hit=>hit.targetId===entry.targetId),'Exact label/alias is unsearchable: '+entry.targetId+' '+label);queries++;
  }
  assert.deepEqual(check('ZXQ_NO_CANONICAL_GLOSSARY_TERM_5489'),[],'Unknown query leaks stale results');queries++;
  return queries;
}

export function validateDgUnchanged(payload,model,records,baseline) {
  const dgCards=payload.cards.filter(card=>card.domain!=='CORE');
  assert.deepEqual(dgCards,baseline.cards,'Glossary changed existing DG Reader cards');
  assert.deepEqual(payload.factManifest,baseline.factManifest,'Glossary changed existing DG source facts');
  assert.deepEqual(payload.groups,baseline.groups,'Glossary changed existing Reader navigation');
  assert.deepEqual(payload.relatedRules,baseline.relatedRules,'Glossary changed Related Rules');
  const expected=enumerateExpectedFacts(model,records);
  assert.equal(expected.length,3654,'DG source denominator changed');
  const fields=new Map(dgCards.flatMap(card=>card.fields.map(field=>[field.id,{card,field}])));
  assert.equal(fields.size,expected.length);
  for(const fact of expected) {
    const found=fields.get(fact.id);assert.ok(found,'DG fact missing after Glossary '+fact.id);
    assert.deepEqual(found.field.value,fact.value);assert.equal(found.field.source.entityId,fact.entityId);assert.equal(found.field.contextId,fact.contextId);
    assert.equal(found.card.id,fact.entityId===model.bookId?fact.contextId:fact.entityId);
  }
  return {dgFacts:expected.length,dgCards:dgCards.length};
}

if(process.argv[1]===ownFile) {
  const {readGlossaryInputs,buildGlossaryProjection,writeGlossary}=await import('./glossary-build.mjs');
  const {searchGlossary,validateGlossary}=await import('../../shared/army-book-app-v2/glossary.mjs');
  const {buildApp,readAppInputs}=await import('./app-build.mjs');
  const {projectArmyBook}=await import('../../shared/army-book-app-v2/project.mjs');
  const {buildRelatedRules}=await import('./related-rules-build.mjs');
  const inputs=readGlossaryInputs(),appInputs=readAppInputs();
  const projected=buildGlossaryProjection(inputs.model,inputs.coreCatalog),payload=buildApp();
  const result=validateGlossarySources(projected.index,payload.cards,inputs.model,inputs.coreCatalog);
  validateGlossary(projected.index,payload.cards);
  assert.deepEqual(payload.glossary,projected.index,'App did not embed the disposable source projection');
  const baseline=projectArmyBook(appInputs.model,appInputs.records,{title:'Death Guard',edition:'11th Edition'});baseline.relatedRules=buildRelatedRules(appInputs.model);
  Object.assign(result,validateDgUnchanged(payload,appInputs.model,appInputs.records,baseline));
  result.searchQueries=validateGlossarySearch(projected.index,searchGlossary);
  const renamed=structuredClone(inputs.model);
  for(const entity of renamed.entities)if(entity.data.title)entity.data.title='COLLIDING_PRESENTATION_TITLE';
  assert.deepEqual(new Set(buildGlossaryProjection(renamed,inputs.coreCatalog).index.entries.map(entry=>entry.targetId)),expectedGlossaryTargets(inputs.model,inputs.coreCatalog),'Title collisions changed authoritative Glossary identity');
  const reordered={...inputs.model,entities:[...inputs.model.entities].reverse()};
  assert.deepEqual(buildGlossaryProjection(reordered,inputs.coreCatalog).index,projected.index,'Source iteration order changed canonical Glossary identity/order');
  const changedCore={...inputs.coreCatalog,records:inputs.coreCatalog.records.map(record=>({...record,title:'COLLIDING_CORE_TITLE'}))};
  assert.deepEqual(new Set(buildGlossaryProjection(inputs.model,changedCore).index.entries.map(entry=>entry.targetId)),expectedGlossaryTargets(inputs.model,inputs.coreCatalog),'Core title collisions changed authoritative identity');
  const mutations=[];
  for(const [name,mutate] of [
    ['unknown canonical target',index=>index.entries[0].targetId='NON_CANONICAL_OWNER'],
    ['duplicate canonical target',index=>index.entries.push(structuredClone(index.entries[0]))],
    ['missing accepted rule owner',index=>index.entries.pop()],
    ['copied gameplay definition',index=>index.entries[0].definition='Invented gameplay text'],
    ['factual alias identity',index=>index.entries[0].aliases.push({label:'Invalid alias',presentationOnly:false})],
    ['wrong named ability address',index=>{const entry=index.entries.find(entry=>entry.aliases.some(alias=>alias.fieldPath));entry.aliases.find(alias=>alias.fieldPath).fieldPath='/MISSING_SOURCE_FIELD';}]
  ]) {
    const bad=structuredClone(projected.index);mutate(bad);assert.throws(()=>validateGlossarySources(bad,payload.cards,inputs.model,inputs.coreCatalog),undefined,name);mutations.push(name);
  }
  for(const [name,mutate] of [
    ['missing Core definition field',cards=>{const card=cards.find(card=>card.domain==='CORE'&&card.fields.some(field=>field.source.path==='/semanticContent'));card.fields.splice(card.fields.findIndex(field=>field.source.path==='/semanticContent'),1);}],
    ['missing Core operation/parameter field',cards=>{const card=cards.find(card=>card.domain==='CORE'&&card.fields.some(field=>/^\/(?:operation|parameters|overrides)(?:\/|$)/.test(field.source.path)));card.fields.splice(card.fields.findIndex(field=>/^\/(?:operation|parameters|overrides)(?:\/|$)/.test(field.source.path)),1);}],
    ['wrong Core definition value',cards=>cards.find(card=>card.domain==='CORE').fields[0].value='POISONED_CANONICAL_VALUE'],
    ['wrong Core factual owner',cards=>cards.find(card=>card.domain==='CORE').fields[0].source.entityId='NON_CANONICAL_OWNER'],
    ['missing Core canonical relationship',cards=>cards.find(card=>card.domain==='CORE'&&card.links.length).links.pop()]
  ]) {
    const bad=structuredClone(payload.cards);mutate(bad);assert.throws(()=>validateGlossarySources(projected.index,bad,inputs.model,inputs.coreCatalog),undefined,name);mutations.push(name);
  }
  const changedDg=structuredClone(inputs.model),ability=changedDg.entities.find(entity=>entity.ruleContract?.kind==='DATASHEET_ABILITY'&&entity.data.blocks?.length);
  ability.data.blocks[0].text='CANONICAL_DG_ABILITY_POISON_5489';
  // This probes the presentation boundary. The independent applicability
  // compiler correctly rejects gameplay text with stale predicate evidence.
  const dgPoisonApp=projectArmyBook(changedDg,appInputs.records,{title:'Death Guard',edition:'11th Edition'});
  assert.equal(dgPoisonApp.cards.find(card=>card.id===ability.id).fields.find(field=>field.source.path==='/blocks/0/text').value,ability.data.blocks[0].text,'Canonical DG source change did not reach the shared popup owner');
  const coreSource=inputs.coreCatalog.records.find(record=>record.semanticContent&&!record.relationships?.sourceRuleId),changedDefinition={...inputs.coreCatalog,records:inputs.coreCatalog.records.map(record=>record.id===coreSource.id?{...record,semanticContent:'CANONICAL_CORE_DEFINITION_POISON_5489'}:record)};
  const corePoison=buildGlossaryProjection(inputs.model,changedDefinition);
  assert.equal(corePoison.coreCards.find(card=>card.id===coreSource.id).fields.find(field=>field.source.path==='/semanticContent').value,'CANONICAL_CORE_DEFINITION_POISON_5489','Canonical Core definition change did not reach its existing popup owner');
  const isolation=poison=>{const p=spawnSync(process.execPath,[ownFile,'--isolation',...(poison?['--poison']:[])],{encoding:'utf8',maxBuffer:12*1024*1024});assert.equal(p.status,0,p.stderr);return JSON.parse(p.stdout);};
  const clean=isolation(false),poisoned=isolation(true);
  assert.deepEqual(clean.legacyReads,[]);assert.deepEqual(poisoned.legacyReads,[]);assert.deepEqual(clean.disposableIndexReads,[]);assert.deepEqual(poisoned.disposableIndexReads,[]);assert.equal(clean.hash,poisoned.hash,'Legacy/generated index poison changed the canonical build');
  const tempRoot=process.env.GLOSSARY_V2_QA_TMPDIR||os.tmpdir();fs.mkdirSync(tempRoot,{recursive:true});
  const temporary=fs.mkdtempSync(path.join(tempRoot,'glossary-v2-')),outputPath=path.join(temporary,'glossary-index.json');
  try {
    writeGlossary({outputPath});const first=fs.readFileSync(outputPath,'utf8');
    fs.unlinkSync(outputPath);writeGlossary({outputPath});assert.equal(fs.readFileSync(outputPath,'utf8'),first,'Deleted disposable index did not regenerate deterministically');
    fs.writeFileSync(outputPath,'{"POISONED_DISPOSABLE_INDEX":true}');writeGlossary({outputPath});assert.equal(fs.readFileSync(outputPath,'utf8'),first,'Disposable index poison retained competing facts');
    writeGlossary({check:true,outputPath});
  } finally {if(fs.existsSync(outputPath))fs.unlinkSync(outputPath);fs.rmdirSync(temporary);}
  console.log(JSON.stringify({status:'PASS',...result,mutations,canonicalIdentityDespiteTitleCollisions:'PASS',sourceOrderIndependent:'PASS',canonicalDgAbilityPoison:'REFLECTED',canonicalCoreDefinitionPoison:'REFLECTED',legacyGlossaryReads:0,disposableIndexReads:0,legacyPoison:'PASS',indexDeletionRebuild:'PASS',definitionsInIndex:0},null,2));
}
