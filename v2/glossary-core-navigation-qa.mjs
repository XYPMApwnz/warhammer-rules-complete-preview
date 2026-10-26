import assert from 'node:assert/strict';
import fs from 'node:fs';
import {adaptGlobalGlossary} from '../books/shared/army-book-app-v2/global-glossary.mjs';
import {createReferenceContract} from '../books/shared/army-book-app-v2/reference-contract.mjs';
import {createReaderNavigation,createCoreReferenceRoutes} from '../books/core-rules/reader/mount.mjs';
import {encodeRoute,decodeRoute} from '../books/shared/army-book-app-v2/route-context.mjs';

const corpus=JSON.parse(fs.readFileSync(new URL('../glossary/v2/generated/index.en.json',import.meta.url),'utf8'));
const projection=adaptGlobalGlossary(corpus),cards=new Map(projection.cards.map(card=>[card.id,card]));
const contract=createReferenceContract({cards,index:projection.index});
const reader=new URL('../books/core-rules/reader/',import.meta.url);
const navigation=createReaderNavigation({chapterURLs:fs.readdirSync(reader).filter(file=>file.endsWith('.html')),
  placements:JSON.parse(fs.readFileSync(new URL('search-index.json',reader),'utf8'))});
const routes=createCoreReferenceRoutes(corpus,navigation);
const chapterURLs=fs.readdirSync(reader).filter(file=>file.endsWith('.html'));
for(const placements of [null,{},[],[null],[{id:'invented',url:'https://foreign.invalid/core-abilities.html#rule-24-09'}]]){
  assert.throws(()=>createReaderNavigation({chapterURLs,placements}),'Invalid or absent placements must not establish a route');
}
const controls=[['Deep Strike','core-deep-strike','rule-24-09'],['Leader','core-leader','rule-24-22'],
  ['Lone Operative','core-lone-operative','rule-24-24'],['Advance','core-rule-09-06-advance-move','rule-09-06'],
  ['Coherency','core-rule-03-03-coherency','rule-03-03']];
for(const [query,id,sectionId] of controls){
  const results=contract.search(query),first=results[0];
  assert.equal(contract.identityFor(first.targetId).canonicalId,id,query);
  assert(contract.resolve(first.targetId).sections.some(section=>section.fields.some(field=>String(field.value).length>query.length)),`${query} must have its definition`);
  const route=routes.routeFor(first.targetId);
  assert.equal(route.canonicalId,id);assert.equal(route.sectionId,sectionId);
  assert.equal(decodeRoute(encodeRoute('https://example.invalid/v2/app.html',route)).canonicalId,id);
  assert(navigation.locationFor(route).url.endsWith('#'+sectionId));
}
assert.deepEqual(contract.search('no such rule 782963'),[]);
const conceptControls=[['Engagement Range','core-engagement-range'],['Critical Hit','core-critical-hit'],
  ['Wholly Within','core-wholly-within'],['Within','core-within'],['Active Player','core-active-player'],
  ['Objective Control','core-objective-control'],['Attached Unit','core-attached-unit'],['Critical Wound','core-critical-wound']];
for(const [query,canonicalId] of conceptControls){
  const result=contract.search(query).find(entry=>contract.identityFor(entry.targetId)?.canonicalId===canonicalId);
  assert(result,`${query} must remain searchable`);
  const definition=contract.resolve(result.targetId);
  assert(definition.sections.some(section=>section.fields.some(field=>typeof field.value==='string'&&field.value.trim())),`${query} must retain its canonical definition`);
  assert.equal(routes.routeFor(result.targetId),null,`${query} must not acquire an invented Reader placement`);
  const identity=contract.identityFor(result.targetId);
  const fallback=decodeRoute(encodeRoute('https://example.invalid/v2/app.html',{destination:'REFERENCE',...identity}));
  assert.equal(fallback.canonicalId,canonicalId);
  assert.equal(contract.resolve(fallback).targetId,result.targetId,'Glossary fallback must resolve the original qualified identity');
}
assert.equal(routes.routeFor('invented'),null);
for(const id of ['core-active-player','core-critical-hit','core-critical-wound'])assert.equal(routes.routeFor('core::'+id),null,'unplaced concepts must not gain invented anchors');
const membership=corpus.entries.find(entry=>entry.recordType==='CORE_ABILITY_MEMBERSHIP'&&entry.canonicalReferences?.some(ref=>ref.canonicalId==='core-deep-strike'));
assert(membership);assert.equal(routes.routeFor(membership.id).canonicalId,'core-deep-strike');
assert(contract.search('Deep Strike').some(result=>result.targetId===membership.id),'Reference-only data must remain searchable');
const armyLeader=corpus.entries.find(entry=>entry.domain==='ARMY'&&entry.label==='LEADER'&&entry.recordType==='DATASHEET_SECTION');
assert(armyLeader);assert.equal(routes.routeFor(armyLeader.id),null,'same title does not establish identity');
assert.equal(routes.routeFor('core::core-bodyguard').canonicalId,'core-rule-19-01-forming-attached-units');

const core=corpus.entries.filter(entry=>['core-deep-strike','core-leader'].includes(entry.sourceOwner.canonicalId)&&entry.domain==='CORE');
const ref=id=>({domain:'CORE',id:'core::'+id,canonicalId:id,relationType:'CORE ABILITIES'});
const diagnostic={...membership,id:'synthetic-diagnostic',canonicalReferences:[ref('core-deep-strike'),ref('core-leader')]};
assert.equal(createCoreReferenceRoutes({entries:[...core,diagnostic]},navigation).routeFor(diagnostic.id),null,'ambiguous Core recipients must not select the first');
diagnostic.canonicalReferences=[{...ref('core-deep-strike'),canonicalId:'core-leader'}];
assert.equal(createCoreReferenceRoutes({entries:[...core,diagnostic]},navigation).routeFor(diagnostic.id),null,'mismatched canonical identity must fail closed');
diagnostic.canonicalReferences=[{...ref('core-deep-strike'),relationType:'OWNER'}];
assert.equal(createCoreReferenceRoutes({entries:[...core,diagnostic]},navigation).routeFor(diagnostic.id),null,'ancillary relationships do not prove definition ownership');
for(const book of ['death-guard','adeptus-mechanicus','chaos-space-marines','emperors-children','tyranids','tau-empire','space-marines','dark-angels','blood-angels']){
  const allowed=new Set(projection.cards.filter(card=>card.identity.registryId===book).map(card=>card.id));
  assert(allowed.size,book);
  const hits=contract.search('Deep Strike',{allowedIds:allowed});
  assert.equal(contract.identityFor(hits[0].targetId).canonicalId,'core-deep-strike');
  assert.equal(new Set(hits.map(hit=>hit.targetId)).size,hits.length);
}
console.log(JSON.stringify({status:'PASS',controls:controls.length,conceptFallbacks:conceptControls.length,books:9,canonicalCards:cards.size,scopeAndAmbiguityGuards:'PASS'}));
