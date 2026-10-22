/** Ninth-owner glossary enrollment: preserved canonical owners, no inherited copies. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {adaptGlobalGlossary} from '../../shared/army-book-app-v2/global-glossary.mjs';
import {createReferenceContract} from '../../shared/army-book-app-v2/reference-contract.mjs';
import {buildBloodAngelsMixedBook} from './book-build.mjs';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const read=file=>JSON.parse(fs.readFileSync(new URL(file,import.meta.url),'utf8'));
const baseline=JSON.parse(execFileSync('git',['show','30cd85fd2b90dc013a7b4dc1e23a5d4ccc63ef14:glossary/v2/generated/index.en.json'],{cwd:root,encoding:'utf8',maxBuffer:100*1024*1024}));
const published=read('../../../glossary/v2/generated/index.en.json');
// The standard producer owns freshness. This targeted check independently compares
// the published owner inventory with accepted BA facts and the frozen eight-book corpus.
assert.equal(published.schema,'wh40k-glossary-v2-index/v1');
assert.equal(published.supportedArmyBooks.at(-1),'blood-angels');
const byId=new Map(published.entries.map(entry=>[entry.id,entry]));
assert.equal(byId.size,published.entries.length,'Duplicate global identity');
const key=entry=>entry.sourceOwner.bookId+'\0'+entry.sourceOwner.canonicalId;
const army=published.entries.filter(entry=>entry.domain==='ARMY');
assert.equal(new Set(army.map(key)).size,army.length,'Duplicate canonical Army owner');
const baselineFields=['label','facts','provenance','fieldProvenance','sourceOwner','currentness'];
for(const old of baseline.entries){
 const current=byId.get(old.id);assert.ok(current,'Predecessor identity lost '+old.id);
 for(const field of baselineFields)assert.deepEqual(current[field],old[field],'Predecessor canonical fact changed '+old.id+'/'+field);
 for(const context of old.contexts)assert.ok(current.contexts.some(item=>JSON.stringify(item)===JSON.stringify(context)),'Predecessor consumer context lost '+old.id);
 for(const reference of old.canonicalReferences)assert.ok(current.canonicalReferences.some(item=>JSON.stringify(item)===JSON.stringify(reference)),'Predecessor canonical reference lost '+old.id);
 for(const context of current.contexts.filter(context=>!old.contexts.some(prior=>JSON.stringify(prior)===JSON.stringify(context))))assert.equal(context.effectiveBookId,'blood-angels','Unplanned consumer context '+old.id);
 if(old.domain==='ARMY')assert.deepEqual({...current,contexts:old.contexts},old,'Prior Army article changed outside added BA consumer placements '+old.id);
 else{
  const comparable={...current,contexts:old.contexts};
  if(old.domain==='MISSIONS'&&old.mfm?.assignedDetachmentIds){
   const addedAssignments=(current.mfm?.assignedDetachmentIds||[]).filter(id=>!old.mfm.assignedDetachmentIds.includes(id));
   assert.ok(old.mfm.assignedDetachmentIds.every(id=>current.mfm.assignedDetachmentIds.includes(id)),'Old disposition assignment lost');
   assert.ok(addedAssignments.every(id=>byId.get(id)?.sourceOwner.bookId==='blood-angels'&&byId.get(id)?.recordType==='DETACHMENT'),'Unplanned disposition assignment');
   comparable.mfm=old.mfm;
  }
  assert.deepEqual(comparable,old,'Prior non-Army article changed outside BA context/disposition links '+old.id);
 }
}
const facts=read('./generated/effective.json').entities;
const own=army.filter(entry=>entry.sourceOwner.bookId==='blood-angels');
assert.deepEqual(new Set(own.map(entry=>entry.sourceOwner.canonicalId)),new Set(facts.map(entity=>entity.id)),'Only accepted BA owners may be enrolled');
for(const entry of own){
 const source=facts.find(entity=>entity.id===entry.sourceOwner.canonicalId);
 assert.deepEqual(entry.facts.canonicalData,source.data,'BA canonical data changed');
 assert.deepEqual(entry.provenance,source.provenance,'BA source attribution changed');
 assert.deepEqual(entry.fieldProvenance,source.fieldProvenance,'BA field source attribution changed');
 assert.equal(entry.parent?.canonicalId||null,facts.some(entity=>entity.id===(source.parentId||source.ownerId))?(source.parentId||source.ownerId):null,'Wrong canonical owner');
}
const priorIds=new Set(baseline.entries.map(entry=>entry.id));
const added=published.entries.filter(entry=>!priorIds.has(entry.id));
assert.deepEqual(new Set(added.map(key)),new Set(own.map(key)),'Unplanned non-BA canonical addition');
const mixed=buildBloodAngelsMixedBook(),inherited=mixed.canonicalEntities.filter(entity=>entity.bookId==='space-marines');
for(const source of inherited){
 const matches=army.filter(entry=>entry.sourceOwner.bookId==='space-marines'&&entry.sourceOwner.canonicalId===source.id);
 assert.equal(matches.length,1,'Inherited owner duplicated or omitted '+source.id);
 assert.deepEqual(matches[0].facts.canonicalData,source.data,'Inherited facts changed '+source.id);
 assert.ok(matches[0].contexts.some(context=>context.effectiveBookId==='blood-angels'&&context.sourceBookId==='space-marines'),'Inherited membership context absent '+source.id);
 assert.ok(!own.some(entry=>entry.sourceOwner.canonicalId===source.id),'Inherited SM fact copied into BA');
}
const projection=adaptGlobalGlossary(published),contract=createReferenceContract({cards:new Map(projection.cards.map(card=>[card.id,card])),index:projection.index});
for(const entry of own){
 const identity=contract.identityFor(entry.id),resolved=contract.resolve(identity);
 assert.ok(resolved,'BA canonical article inaccessible '+entry.id);
 assert.equal(identity.registryId,'blood-angels');
 const definition=resolved.sections.flatMap(section=>section.fields).map(field=>String(field.value)).join('\n');
 assert.ok(definition.trim(),'Empty BA canonical article '+entry.id);
 if(['DATASHEET_ABILITY','DETACHMENT_RULE','ENHANCEMENT','STRATAGEM'].includes(facts.find(source=>source.id===entry.sourceOwner.canonicalId).kind)&&entry.facts.text)
  assert.ok(definition.includes(entry.facts.text),'Incomplete BA rule text '+entry.id);
}
for(const source of inherited.filter(entity=>entity.kind==='DATASHEET')){
 const owner=army.find(entry=>entry.sourceOwner.bookId==='space-marines'&&entry.sourceOwner.canonicalId===source.id);
 assert.equal(contract.resolveAlias(source.id,{registryId:'blood-angels'}),owner.id,'Inherited direct reference lost original owner');
}
for(const [kind,count]of Object.entries({UNIT:14,PROFILE:14,WEAPON_PROFILE:71,DETACHMENT:3,ENHANCEMENT:8,STRATAGEM:12}))assert.equal(own.filter(entry=>entry.recordType===kind).length,count,'BA factual inventory '+kind);
const mfmUnits=own.filter(entry=>entry.recordType==='UNIT');assert.ok(mfmUnits.every(entry=>entry.mfm?.pointRecords?.length),'BA MFM unit pricing missing');
assert.ok(own.filter(entry=>entry.recordType==='DETACHMENT').every(entry=>entry.mfm?.detachment?.provenance?.sourceVersion==='v1.6'),'BA Detachment source metadata missing');
const hostileCases=[
 ['missing-BA-canonical-owner',entries=>entries.filter(entry=>entry.id!==own.find(entry=>entry.recordType==='WEAPON_PROFILE').id)],
 ['duplicated-SM-canonical-owner',entries=>[...entries,{...structuredClone(entries.find(entry=>entry.sourceOwner.bookId==='space-marines')),id:'diagnostic-duplicate-owner'}]],
 ['inherited-SM-reowned-as-BA',entries=>entries.map(entry=>entry.id===army.find(candidate=>candidate.sourceOwner.bookId==='space-marines').id?{...entry,sourceOwner:{...entry.sourceOwner,bookId:'blood-angels'}}:entry)]
];
const verifyInventory=entries=>{
 assert.equal(new Set(entries.map(key)).size,entries.length,'Duplicate canonical Army owner');
 assert.deepEqual(new Set(entries.filter(entry=>entry.sourceOwner.bookId==='blood-angels').map(entry=>entry.sourceOwner.canonicalId)),new Set(facts.map(entity=>entity.id)),'Missing, extra or reowned BA fact');
};
verifyInventory(army);
for(const [name,mutate]of hostileCases)assert.throws(()=>verifyInventory(mutate(structuredClone(army))),assert.AssertionError,name+' escaped the canonical source inventory');
const result={status:'PASS',precedingCanonicalRecordsPreserved:baseline.entries.length,sourceEntries:published.entries.length,addedBAOwnedRecords:own.length,inheritedReferences:read('./inherited-sm-references.json').references.length,inheritedClosure:inherited.length,inheritedDatasheets:inherited.filter(entity=>entity.kind==='DATASHEET').length,duplicateInheritedOwners:0,sourceOwnedIdentityCoverage:own.length,displayCards:projection.cards.length,pricingUnits:mfmUnits.length,mutationControls:hostileCases.map(([id])=>id)};
console.log(JSON.stringify(result));
