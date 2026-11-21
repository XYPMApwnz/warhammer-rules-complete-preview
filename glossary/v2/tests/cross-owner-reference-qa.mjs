/** Root or direct-child admission preserves the exact accepted foreign owner. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseProducerJSON} from '../../../books/shared/source-refs-v2/producer-io.mjs';
import {assertV2CrossOwnerReferenceAdmission} from '../content/army-v2-projection.mjs';
import {adaptGlobalGlossary} from '../../../books/shared/army-book-app-v2/global-glossary.mjs';
import {createReferenceContract} from '../../../books/shared/army-book-app-v2/reference-contract.mjs';
import {createGlobalGlossaryContent} from '../../../books/shared/army-book-app-v2/global-glossary-content.mjs';

const read=file=>parseProducerJSON(fs.readFileSync(new URL('../../../'+file,import.meta.url),'utf8'));
const facts=read('books/space-marines/v2/generated/effective.json');
const cross=read('books/space-marines/v2/generated/cross-owner-references.json');
const source={crossOwnerReferenceIds:facts.crossOwnerReferenceIds,entities:cross.entities};
const roots=new Set(source.crossOwnerReferenceIds);
const references=cross.entities.filter(entity=>roots.has(entity.id)||roots.has(entity.parentId));
const root=references.find(entity=>roots.has(entity.id));
const child=references.find(entity=>!roots.has(entity.id)&&roots.has(entity.parentId));
assert.ok(root&&child,'Source fixture must exercise both root and child admission');
assertV2CrossOwnerReferenceAdmission(references,source);
for(const id of roots)assert.ok(references.some(entity=>entity.id===id),'All declared roots remain admitted');

const controls=[];
function rejected(name,operation,pattern=/Unreviewed cross-owner reference admission/){
  assert.throws(operation,pattern,name);controls.push(name);
}
const unlistedRoot={...structuredClone(root),id:'qa-unlisted-cross-owner-root'};
delete unlistedRoot.parentId;
const badChild={...structuredClone(child),id:'qa-unadmitted-cross-owner-child',parentId:unlistedRoot.id};
rejected('parent-not-in-declared-root-list',()=>assertV2CrossOwnerReferenceAdmission([...references,badChild],{
  ...source,entities:[...source.entities,unlistedRoot,badChild]
}));
const grandchild={...structuredClone(child),id:'qa-cross-owner-grandchild',parentId:child.id};
rejected('admitted-child-does-not-admit-a-grandchild',()=>assertV2CrossOwnerReferenceAdmission([...references,grandchild],{
  ...source,entities:[...source.entities,grandchild]
}));
for(const [name,mutate]of [
  ['changed-canonical-data',entity=>{entity.data.title+=' QA mutation';}],
  ['changed-source-provenance',entity=>{entity.provenance.sourceId='qa-foreign-source';}],
  ['changed-canonical-book-owner',entity=>{entity.bookId='qa-foreign-book';}],
  ['changed-parent',entity=>{entity.parentId='qa-foreign-parent';}]
]){
  const changed=structuredClone(references);mutate(changed.find(entity=>entity.id===child.id));
  rejected(name,()=>assertV2CrossOwnerReferenceAdmission(changed,source));
}
rejected('missing-declared-root',()=>assertV2CrossOwnerReferenceAdmission(references.filter(entity=>entity.id!==root.id),source));
rejected('duplicate-admitted-identity',()=>assertV2CrossOwnerReferenceAdmission([...references,root],source),/Duplicate cross-owner reference identity/);
const publication=JSON.parse(fs.readFileSync(new URL('../generated/index.en.json',import.meta.url),'utf8'));
const projection=adaptGlobalGlossary(publication),display=createGlobalGlossaryContent(publication);
const contract=createReferenceContract({cards:new Map(projection.cards.map(card=>[card.id,card])),index:projection.index});
for(const entity of references){
  const entries=publication.entries.filter(entry=>entry.domain==='ARMY'&&entry.sourceOwner.canonicalId===entity.id&&entry.sourceOwner.bookId===entity.bookId);
  assert.equal(entries.length,1,'One glossary article per admitted canonical owner');
  const entry=entries[0];
  assert.deepEqual(entry.facts.canonicalData,entity.data,'Cross-owner canonical facts changed');
  assert.deepEqual(entry.provenance,entity.provenance,'Cross-owner provenance changed');
  assert.ok(entry.contexts.some(context=>context.effectiveBookId==='space-marines'&&context.sourceBookId===entity.bookId),'Missing consuming book context');
  for(const context of entry.contexts)assert.equal(context.parentUnitId,entity.parentId,'Foreign parent context');
  const identity=contract.identityFor(entry.id);
  assert.equal(identity.registryId,entity.bookId,'Cross-owner identity was reassigned to the consumer');
  assert.equal(identity.canonicalId,entity.id);
  assert.equal(contract.resolve(identity)?.targetId,entry.id,'Cross-owner direct reference must resolve');
  if(entity.data.text)assert.ok(display.project(entry).definition.includes(entity.data.text),'Original cross-owner source text lost');
}
console.log(JSON.stringify({status:'PASS',roots:roots.size,directChildren:references.length-roots.size,admitted:references.length,publishedAndResolved:references.length,negativeControls:controls.length,controls,sourceBytesWritten:false}));
