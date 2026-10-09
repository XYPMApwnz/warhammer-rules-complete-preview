import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createEffectiveCoreCatalog} from '../../../books/core-rules/content/effective-core-catalog.mjs';
import {rebuildCoreGlossaryProjection} from '../content/glossary-v2-index.mjs';
import {createGlobalGlossaryContent} from '../../../books/shared/army-book-app-v2/global-glossary-content.mjs';
import {adaptGlobalGlossary} from '../../../books/shared/army-book-app-v2/global-glossary.mjs';
import {buildGlossary} from '../../../books/shared/army-book-app-v2/glossary.mjs';
import {createReferenceContract} from '../../../books/shared/army-book-app-v2/reference-contract.mjs';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
// This publication is only an identity/placement container for untouched domains.
// No existing Core payload is used as an expected factual value.
const publication=JSON.parse(fs.readFileSync(path.join(repo,'glossary/v2/generated/index.en.json'),'utf8'));
const before=JSON.stringify(publication);
const catalog=createEffectiveCoreCatalog();
const rebuilt=rebuildCoreGlossaryProjection(publication,{coreCatalog:catalog});
const core=rebuilt.entries.filter(entry=>entry.domain==='CORE');
const coreById=new Map(core.map(entry=>[entry.id,entry]));
const aliasOnly=new Set(['core-errata-15-05','core-errata-15-06']);
const expected=catalog.records.filter(record=>!aliasOnly.has(record.id));
assert.equal(core.length,368);
assert.deepEqual(new Set(core.map(entry=>entry.id)),new Set(expected.map(record=>'core::'+record.id)),'scoped build dropped canonical Core identities');
assert.equal(JSON.stringify(publication),before,'scoped build mutated its input container');
const nonCore=value=>value.entries.filter(entry=>entry.domain!=='CORE');
assert.equal(JSON.stringify(nonCore(rebuilt)),JSON.stringify(nonCore(publication)),'non-Core entries changed byte-for-byte');
for(const record of expected){
  const entry=coreById.get('core::'+record.id);
  const facts=structuredClone(record);
  for(const field of ['publicationRecord','compatibilityIdentity','referenceUrl','runtimeTitle'])delete facts[field];
  assert.deepEqual(entry.facts,facts,`${record.id}: old publication facts contaminated fresh canonical projection`);
  assert.equal(entry.label,record.title,`${record.id}: stale display label survived rebuild`);
  assert.deepEqual(entry.provenance,record.provenance,`${record.id}: provenance diverges from canonical facts`);
  assert.equal(entry.currentness.state,record.state,`${record.id}: availability state changed`);
  const expectedReferences=Object.entries(record.relationships||{}).flatMap(([relationType,ids])=>(Array.isArray(ids)?ids:[ids]).filter(Boolean).map(id=>`${relationType}|${id}`)).sort();
  assert.deepEqual(entry.canonicalReferences.map(reference=>`${reference.relationType}|${reference.canonicalId}`).sort(),expectedReferences,`${record.id}: canonical relations changed`);
  const previous=publication.entries.find(candidate=>candidate.id===entry.id);
  for(const alias of previous.aliases)assert(entry.aliases.includes(alias),`${record.id}: cross-domain identity alias lost`);
  assert.deepEqual(entry.contexts,previous.contexts,`${record.id}: cross-domain occurrence placement lost`);
}
const poisoned=structuredClone(publication);
for(const entry of poisoned.entries.filter(entry=>entry.domain==='CORE')){
  entry.facts={text:'OLD_CORE_FACT_POISON',semanticContent:'OLD_CORE_FACT_POISON'};
  entry.label='OLD_CORE_LABEL_POISON';entry.searchableContent='OLD_CORE_SEARCH_POISON';
  entry.canonicalReferences=[{id:'core::not-a-canonical-owner',canonicalId:'not-a-canonical-owner',domain:'CORE',relationType:'UNPROVEN'}];
  entry.provenance={sourceClass:'OLD_CORE_PROVENANCE_POISON'};
  entry.currentness={state:'OLD_CORE_STATE_POISON'};
}
assert.deepEqual(rebuildCoreGlossaryProjection(poisoned,{coreCatalog:catalog}),rebuilt,'stale Core publication payload remained a factual input');
assert.deepEqual(rebuildCoreGlossaryProjection(rebuilt,{coreCatalog:catalog}),rebuilt,'scoped Core rebuild is not idempotent');
const factualContext=structuredClone(publication);
factualContext.entries.find(entry=>entry.domain==='CORE').contexts.push({effectiveBookId:'synthetic-book',factOverrides:{semanticContent:'CONTEXT_FACT_POISON'}});
assert.throws(()=>rebuildCoreGlossaryProjection(factualContext,{coreCatalog:catalog}),/factual overrides/i,'cross-domain placement metadata can override canonical Core facts');
const inventoryPoison=structuredClone(publication);
inventoryPoison.entries=inventoryPoison.entries.filter(entry=>entry.id!=='core::core-deep-strike');
assert.throws(()=>rebuildCoreGlossaryProjection(inventoryPoison,{coreCatalog:catalog}),/identity inventory changed/i,'scoped rebuild silently changes unrelated identity inventory');

const conflict=catalog.getByCode('09.07.01');
assert.equal(conflict.semanticContent,null);
const conflictEntry=coreById.get('core::'+conflict.id);
const content=createGlobalGlossaryContent({entries:core});
const projected=content.project(conflictEntry);
assert(projected.definition.includes(conflict.sourceConflict.notice),'global content adapter lost unresolved conflict notice');
for(const occurrence of conflict.sourceConflict.occurrences)assert(projected.definition.includes(occurrence.presentationText),'global content adapter dropped an accepted source variant');
assert.equal(projected.summary,conflict.sourceConflict.notice,'global search summary presents one disputed source as current');
const adapted=adaptGlobalGlossary({...rebuilt,entries:core});
const globalContract=createReferenceContract({cards:new Map(adapted.cards.map(card=>[card.id,card])),index:adapted.index,registryId:'mega-glossary'});
const globalResolved=globalContract.resolve(conflictEntry.id);
const definitionText=globalResolved.sections.flatMap(section=>section.fields.map(field=>field.value)).join('\n');
assert(definitionText.includes(conflict.sourceConflict.notice),'canonical global reference resolver lost conflict notice');
for(const occurrence of conflict.sourceConflict.occurrences)assert(definitionText.includes(occurrence.presentationText),'canonical global reference resolver lost accepted variant');
assert.equal(globalResolved.identity.canonicalId,conflict.id);
assert.equal(globalContract.resolveAlias('core-deep-strike'),'core::core-deep-strike','canonical alias no longer resolves');
const attached=coreById.get('core::core-rule-19-01-forming-attached-units');
for(const alias of ['chaos-space-marines-ability-support','space-marines-ability-support-3','space-marines-ability-support-4']){
  assert(attached.aliases.includes(alias),`${alias}: external book-owned reference metadata lost`);
  assert.equal(globalContract.resolveAlias(alias),attached.id,`${alias}: external book alias no longer resolves`);
}
const local=buildGlossary({model:{entities:[]},coreCatalog:catalog});
const localContract=createReferenceContract({cards:new Map(local.coreCards.map(card=>[card.id,card])),index:local.index});
const localResolved=localContract.resolve(conflict.id,new Set());
assert(localResolved,'canonical Core reference became unavailable in empty personal-book scope');
const localText=localResolved.sections.flatMap(section=>section.fields.map(field=>field.value)).join('\n');
assert(localText.includes(conflict.sourceConflict.notice));
for(const occurrence of conflict.sourceConflict.occurrences)assert(localText.includes(occurrence.presentationText),'Army Book Core resolver dropped source variant');
assert(!localResolved.sections.some(section=>section.fields.some(field=>field.source.path==='/semanticContent')),'local reference resolver fabricated adjudicated semantics');

execFileSync(process.execPath,[path.join(repo,'glossary/v2/tools/build-glossary-v2.mjs'),'--core-only','--check'],{stdio:'pipe'});
console.log(JSON.stringify({status:'PASS',canonicalCoreEntries:core.length,canonicalCoreRecords:catalog.records.length,nonCoreEntriesUnchanged:nonCore(rebuilt).length,publicationPoisonRejected:true,identityAliasesPreserved:true,contextFactOverridesRejected:true,sourceConflictGlobalAndBookReferences:'PASS',scopedCliCheck:'PASS'}));
