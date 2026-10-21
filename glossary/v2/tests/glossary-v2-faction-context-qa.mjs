import assert from 'node:assert/strict';
import fs from 'node:fs';
import {adaptGlobalGlossary} from '../../../books/shared/army-book-app-v2/global-glossary.mjs';
import {createGlobalGlossaryContent} from '../../../books/shared/army-book-app-v2/global-glossary-content.mjs';
import {createReferenceContract} from '../../../books/shared/army-book-app-v2/reference-contract.mjs';
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';
import {buildDarkAngelsMixedBook} from '../../../books/dark-angels/v2/book-build.mjs';
import {buildGlossaryV2Index} from '../content/glossary-v2-index.mjs';

const root=new URL('../../../',import.meta.url),read=file=>JSON.parse(fs.readFileSync(new URL(file,root),'utf8'));
const books=['death-guard','adeptus-mechanicus','chaos-space-marines','emperors-children','tyranids','tau-empire','space-marines','dark-angels'];
const excluded=['blood-angels'];
const sources=new Map(books.map(book=>[book,new Map(read(`books/${book}/v2/generated/effective.json`).entities.map(entity=>[entity.id,entity]))]));
const daMembership=new Set(buildDarkAngelsMixedBook().canonicalEntities.filter(entity=>entity.bookId==='space-marines').map(entity=>entity.id));
const index=await buildGlossaryV2Index();
assert.ok(JSON.stringify(index)===JSON.stringify(await buildGlossaryV2Index()),'Connected V2 projection is deterministic');
assert.ok(JSON.stringify(index)===JSON.stringify(read('glossary/v2/generated/index.en.json')),'Published corpus is the current V2 projection');
const mfm=createEffectiveMfmCatalog().catalog;
const dependencies=['mfm-unit-points-a273c224855f8ac1','mfm-unit-points-ae6cc14baed6e18a'];
function verify(candidate){
  assert.deepEqual(candidate.supportedArmyBooks,books,'Exact connected books and order');
  const armies=candidate.entries.filter(entry=>entry.domain==='ARMY');
  assert.deepEqual([...new Set(armies.map(entry=>entry.sourceOwner.bookId))].sort(),[...books].sort(),'No unsupported standalone factual owners');
  assert.equal(armies.filter(entry=>entry.recordType==='UNIT').length,[...sources.values()].reduce((sum,records)=>sum+[...records.values()].filter(entity=>entity.kind==='DATASHEET').length,0),'Complete connected datasheets');
  for(const entry of armies){
    const source=sources.get(entry.sourceOwner.bookId)?.get(entry.sourceOwner.canonicalId);
    assert.ok(source,`${entry.id}: factual owner is a connected canonical V2 entity`);
    assert.deepEqual(entry.facts.canonicalData,source.data,`${entry.id}: another faction did not overwrite canonical facts`);
    const expectedContexts=[entry.sourceOwner.bookId,...(entry.sourceOwner.bookId==='space-marines'&&daMembership.has(entry.sourceOwner.canonicalId)?['dark-angels']:[])].sort();
    assert.deepEqual(entry.contexts.map(context=>context.effectiveBookId).sort(),expectedContexts,`${entry.id}: only source-reviewed consumer membership`);
    assert.ok(entry.contexts.every(context=>!context.factOverrides&&!context.omittedFactFields),`${entry.id}: no legacy faction overlays`);
  }
  const points=candidate.entries.filter(entry=>entry.domain==='MFM');
  assert.deepEqual(points.map(entry=>entry.sourceOwner.canonicalId).sort(),dependencies,'Only two source-owned CSM points dependencies survive');
  for(const entry of points){
    const canonical=mfm.unitPointRecords.find(record=>record.id===entry.sourceOwner.canonicalId);
    assert.deepEqual(entry.facts,canonical,`${entry.id}: exact central MFM dependency`);
    assert.equal(entry.facts.provenance.sourceVersion,'v1.6');
    assert.deepEqual(entry.contexts,[{effectiveBookId:'chaos-space-marines',dependencyKind:'POINTS_ONLY'}]);
    assert.ok(['thousand-sons','world-eaters'].includes(entry.sourceOwner.factionId));
  }
  for(const book of excluded){
    assert.ok(!armies.some(entry=>entry.sourceOwner.bookId===book),`${book}: no standalone book`);
    assert.ok(!candidate.entries.some(entry=>(entry.contexts||[]).some(context=>context.effectiveBookId===book)),`${book}: no residual context`);
  }
}
verify(index);
const projection=adaptGlobalGlossary(index),contract=createReferenceContract({cards:new Map(projection.cards.map(card=>[card.id,card])),index:projection.index});
const core=contract.resolveAlias('core-deep-strike');assert.ok(core,'Shared Core reference remains reachable');
for(const book of books)assert.equal(contract.resolveAlias('core-deep-strike',{registryId:book}),core,`${book}: Core alias retains the single owner`);

// Identical local weapon IDs across actual books remain distinct qualified identities.
const sharedCanonical=index.entries.filter(entry=>entry.domain==='ARMY'&&entry.recordType==='WEAPON_PROFILE')
  .find(entry=>index.entries.some(other=>other.domain==='ARMY'&&other.recordType==='WEAPON_PROFILE'&&other.sourceOwner.canonicalId===entry.sourceOwner.canonicalId&&other.sourceOwner.bookId!==entry.sourceOwner.bookId));
assert.ok(sharedCanonical,'Cross-book canonical-ID collision control must be exercised');
const shared=index.entries.filter(entry=>entry.domain==='ARMY'&&entry.sourceOwner.canonicalId===sharedCanonical.sourceOwner.canonicalId);
assert.ok(shared.length>1);
for(const entry of shared){
  const book=entry.sourceOwner.bookId;
  assert.equal(contract.resolveAlias(entry.sourceOwner.canonicalId,{registryId:book}),entry.id,`${book}: qualified alias ownership`);
  assert.equal(contract.resolve(contract.identityFor(entry.id)).targetId,entry.id);
  for(const requested of books){
    const view=createGlobalGlossaryContent({entries:index.entries,bookId:requested}).project(entry);
    assert.deepEqual(view.entry.facts,entry.facts,`${book}/${requested}: no foreign context rewrites facts`);
  }
}
assert.equal(contract.resolveAlias(sharedCanonical.sourceOwner.canonicalId),null,'Ambiguous unqualified canonical ID fails closed');
const excludedIds={
  'space-marines':'unit-adrax-agatone','dark-angels':'unit-asmodai','blood-angels':'unit-astorath'
};
for(const [book,id] of Object.entries(excludedIds)){
  assert.equal(contract.resolveAlias(`army::${book}::unit::${id}`,{registryId:book}),null,`${book}: old qualified identity unavailable`);
  assert.equal(contract.resolve({registryId:book,canonicalId:id,fieldPath:`/glossary/army::${book}::unit::${id}`}),null,`${book}: excluded direct route unavailable`);
}
let mutations=0;
for(const mutate of [
  value=>{value.supportedArmyBooks.push('tau-empire');},
  value=>{value.entries.find(entry=>entry.domain==='ARMY').sourceOwner.bookId='tau-empire';},
  value=>{value.entries.find(entry=>entry.domain==='ARMY').contexts[0].effectiveBookId='tau-empire';},
  value=>{value.entries.find(entry=>entry.domain==='ARMY').contexts[0].factOverrides={keywords:['DEATHWING']};},
  value=>{value.entries=value.entries.filter(entry=>entry.id!=='mfm::'+dependencies[0]);},
  value=>{value.entries.find(entry=>entry.domain==='MFM').facts.provenance.sourceVersion='v1.5';},
  value=>{value.entries.find(entry=>entry.domain==='MFM').contexts[0].effectiveBookId='tau-empire';}
]){const copy=structuredClone(index);mutate(copy);assert.throws(()=>verify(copy),assert.AssertionError,'Comparator must reject changed faction/dependency input');mutations++;}
console.log(JSON.stringify({status:'PASS',connectedBooks:books,excludedStandaloneBooks:excluded.length,datasheets:index.entries.filter(entry=>entry.recordType==='UNIT').length,pointsDependencies:dependencies.length,sharedLocalIdentities:shared.length,mutations}));
