/** Independent corpus/identity guards. The global enrolled corpus is never modified. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {adaptGlobalGlossary,globalGlossaryCounts} from '../books/shared/army-book-app-v2/global-glossary.mjs';
import {createReferenceContract} from '../books/shared/army-book-app-v2/reference-contract.mjs';
import {validateGlossary} from '../books/shared/army-book-app-v2/glossary.mjs';
import {encodeRoute,decodeRoute} from '../books/shared/army-book-app-v2/route-context.mjs';

const corpus=JSON.parse(fs.readFileSync(new URL('../glossary/v2/generated/index.en.json',import.meta.url),'utf8'));
const immutable=JSON.stringify(corpus),projection=adaptGlobalGlossary(corpus);
const cards=new Map(projection.cards.map(card=>[card.id,card]));
const contract=createReferenceContract({cards,index:projection.index});
const fieldViews=corpus.entries.flatMap(entry=>(entry.presentation?.referenceFields||[]).map(field=>({entry,field,id:entry.id+'::'+field.path})));
const projectedTotal=corpus.entries.length+fieldViews.length;
assert.equal(projection.cards.length,projectedTotal);
assert.equal(projection.index.entries.length,projectedTotal);
assert.deepEqual(projection.counts,globalGlossaryCounts(corpus));
assert.deepEqual(validateGlossary(projection.index,projection.cards),{entries:projectedTotal,unresolvedTargets:0,unresolvedAliases:0,factualCopies:0});
assert.deepEqual([...cards.keys()].sort(),[...corpus.entries.map(entry=>entry.id),...fieldViews.map(field=>field.id)].sort());
const identities=new Set(),definitions=[];
for(const original of corpus.entries) {
  const model=contract.resolve(original.id),identity=contract.identityFor(original.id);
  assert.ok(model,'Missing projected reference '+original.id);
  assert.equal(identity.canonicalId,original.sourceOwner.canonicalId);
  assert.equal(identity.registryId,original.sourceOwner.bookId||({CORE:'core-rules',MISSIONS:'missions',MFM:'mfm'}[original.domain])||original.domain.toLowerCase());
  assert.ok(identity.fieldPath,'Subentry identity lost '+original.id);
  const key=JSON.stringify(identity);assert.ok(!identities.has(key),'Qualified identity collision '+key);identities.add(key);
  assert.equal(contract.resolve(identity).targetId,original.id);
  assert.equal(decodeRoute(encodeRoute('https://example.invalid/v2/app.html',{destination:'GLOSSARY',...identity})).fieldPath,identity.fieldPath);
  assert.ok(!/^[A-Z]+(?:_[A-Z]+)+$/.test(model.category),'Internal category label '+model.category);
  assert.ok(model.sections.some(section=>section.fields.length)||Object.keys(cards.get(original.id).referenceVisuals||{}).length,'Empty canonical article '+original.id);
  assert.ok(model.sections.flatMap(section=>section.fields).every(field=>! /\b[A-Z]+(?:_[A-Z]+)+\b/.test(String(field.value))),'Internal enums in projected definition '+original.id);
  definitions.push(model.sections.flatMap(section=>section.fields.map(field=>field.value)).join('\n'));
}
for(const {entry,field,id}of fieldViews) {
  const identity=contract.identityFor(id),key=JSON.stringify(identity);
  assert.ok(!identities.has(key),'Qualified field identity collision '+key);identities.add(key);
  assert.deepEqual(identity,{registryId:entry.sourceOwner.bookId,canonicalId:entry.sourceOwner.canonicalId,fieldPath:field.path});
  assert.equal(contract.resolve(identity)?.targetId,id);
  assert.equal(decodeRoute(encodeRoute('https://example.invalid/v2/app.html',{destination:'GLOSSARY',...identity})).fieldPath,field.path);
  assert.deepEqual(cards.get(id).fields[0].source,{entityId:entry.sourceOwner.canonicalId,path:field.path});
}
assert.equal(JSON.stringify(corpus),immutable,'Display adaptation mutated corpus');
assert.equal(contract.search('').length,projectedTotal);
for(const category of contract.categories()) {
  assert.ok(!category.label.includes('_'));
  const results=contract.search('',{category:category.id});assert.ok(results.length,'Empty category '+category.id);
  assert.ok(results.every(entry=>entry.categoryLabel===category.label),'Category escaped filter '+category.label);
}
const deep=corpus.entries.find(entry=>entry.id==='core::core-deep-strike');assert.ok(deep);
assert.ok(contract.search(deep.label).some(entry=>entry.targetId===deep.id));
const alias=corpus.entries.find(entry=>entry.id==='core::core-anti');assert.ok(alias.aliases.length);
assert.ok(contract.search(alias.aliases[1]).some(entry=>entry.targetId===alias.id),'Alias search omitted canonical target');
assert.ok(contract.search('Many units have core abilities listed').some(entry=>entry.targetId==='core::core-abilities'),'Definition search failed');

// Synthetic independent owners deliberately reuse local IDs and alias labels.
const entry=(id,registryId,canonicalId,termId)=>({id,domain:'ARMY',recordType:'ABILITY',label:'Independent '+id,aliases:['shared-alias'],
  sourceOwner:{bookId:registryId,canonicalId},facts:{text:'Definition '+id,termId},canonicalReferences:[],contexts:[]});
const synthetic={schema:corpus.schema,entries:[entry('qualified-a','registry-a','errata-1','term-a'),entry('qualified-b','registry-b','errata-1','term-b'),
  entry('qualified-a-field','registry-a','errata-1','term-a-field')]};
const p=adaptGlobalGlossary(synthetic),c=createReferenceContract({cards:new Map(p.cards.map(card=>[card.id,card])),index:p.index});
assert.equal(c.resolveAlias('shared-alias'),null,'Cross-registry ambiguous alias must fail closed');
assert.equal(c.resolveAlias('shared-alias',{registryId:'registry-a'}),null,'Same-registry subentry ambiguity must fail closed');
assert.equal(c.resolveAlias('shared-alias',{registryId:'registry-b'}),'qualified-b');
assert.equal(c.resolveAlias('term-a',{registryId:'registry-a'}),'qualified-a');
assert.equal(c.resolveAlias('term-a',{registryId:'registry-b'}),null,'Alias escaped owner registry');
for(const id of ['qualified-a','qualified-b','qualified-a-field'])assert.equal(c.resolve(c.identityFor(id)).targetId,id);
assert.equal(c.resolve({registryId:'registry-a',canonicalId:'errata-1'}),null,'Missing field identity must not pick arbitrary subentry');
assert.equal(c.resolve({registryId:'registry-b',canonicalId:'errata-1',fieldPath:c.identityFor('qualified-a').fieldPath}),null);
assert.throws(()=>adaptGlobalGlossary({...synthetic,entries:[synthetic.entries[0],synthetic.entries[0]]}),/Duplicate/);
const duplicate=p.cards.map(card=>({...card,identity:c.identityFor('qualified-a')}));
assert.throws(()=>createReferenceContract({cards:new Map(duplicate.map(card=>[card.id,card])),index:p.index}),/Duplicate qualified/);
// Registry factories have no mutable cross-book alias cache.
const other=adaptGlobalGlossary({schema:corpus.schema,entries:[entry('independent','registry-other','errata-1','term-a')]});
const otherContract=createReferenceContract({cards:new Map(other.cards.map(card=>[card.id,card])),index:other.index});
assert.equal(otherContract.resolveAlias('term-a'),'independent');assert.equal(c.resolveAlias('term-a'),'qualified-a');
const precise=adaptGlobalGlossary({schema:corpus.schema,entries:[
  {...entry('exact-upper','registry-precise','Rule-A','explicit-a'),aliases:['Exact-Alias']},
  {...entry('exact-lower','registry-precise','rule-a','explicit-b'),aliases:['exact-alias'],presentation:{preferredMatchLabels:['Exact-Alias','Rule-A']}}
]});
const preciseContract=createReferenceContract({cards:new Map(precise.cards.map(card=>[card.id,card])),index:precise.index});
assert.equal(preciseContract.resolveAlias('Rule-A',{registryId:'registry-precise'}),'exact-upper','Exact canonical ID lost to normalized label collision');
assert.equal(preciseContract.resolveAlias('rule-a',{registryId:'registry-precise'}),'exact-lower');
assert.equal(preciseContract.resolveAlias('Exact-Alias',{registryId:'registry-precise'}),'exact-upper','Explicit alias lost to preferred presentation label');
assert.equal(preciseContract.resolveAlias('exact-alias',{registryId:'registry-precise'}),'exact-lower');
assert.equal(validateGlossary(precise.index,precise.cards).unresolvedAliases,0);
const brokenAlias=structuredClone(precise.index);brokenAlias.entries[0].aliases[0].match='TITLE_GAMEPLAY_LOOKUP';
assert.throws(()=>validateGlossary(brokenAlias,precise.cards),/Malformed glossary alias/,'Unknown alias match policy must fail closed');
const misplacedFact=structuredClone(precise.index);misplacedFact.entries[0].gameplayDefinition='not an index-owned fact';
assert.throws(()=>validateGlossary(misplacedFact,precise.cards),/Factual copy/);
assert.equal(contract.resolveAlias('core-deep-strike',{registryId:'death-guard'}),'core::core-deep-strike','Core aliases must remain available in book context');
for(const terrain of projection.cards.filter(card=>card.kind==='TERRAIN_LAYOUT')) {
  const members=terrain.referenceVisuals.terrainLayoutReference?.memberIds;assert.ok(members?.length,'Terrain reference lost canonical Force Disposition bindings');
  const related=contract.resolve(terrain.id).references.map(reference=>reference.targetId);
  for(const id of members)assert.ok(related.includes(id),'Terrain member reference omitted '+terrain.id+' -> '+id);
}
assert.equal(JSON.stringify(corpus),immutable);
console.log(JSON.stringify({status:'PASS',corpus:projection.counts,qualifiedIdentities:identities.size,canonicalResolution:true,
  categories:contract.categories().length,titleAliasDefinition:true,namespaceCollision:true,subentryIsolation:true,crossRegistryIsolation:true,
  ambiguousAliasesFailClosed:true,immutable:true}));
