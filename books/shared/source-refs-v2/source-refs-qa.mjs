/** Translate 3: real-data source encoding/inverse checks and strict reader
 * mutations. No ingestion, producers, browser, report writes or network.
 * Run after all nine books have been regenerated: node <this file>. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {SOURCE_SCHEMA,compileBookSourceRefs,registerBookSources,sourceDeclarationView,sourceSnapshot,readSourceRefs} from './source-refs.mjs';
import {loadSourceRegistry} from './source-registry.mjs';
import {checkSourceClosureTree} from './source-closure-qa.mjs';

const root=fileURLToPath(new URL('../../../',import.meta.url)),base='75d322e4e3274f14d7e2a81abace3ba63c784ec5';
assert.equal(checkSourceClosureTree(root).status,'PASS','Serialized closure precedes compiler/reader cache warmup');
const bookIds=['adeptus-mechanicus','blood-angels','chaos-space-marines','dark-angels','death-guard','emperors-children','space-marines','tau-empire','tyranids'];
const registry=loadSourceRegistry(root),cmp=(a,b)=>a<b?-1:a>b?1:0,clone=structuredClone;
assert.deepEqual(readSourceRefs({id:'source-free-record',data:{text:'No source declaration'}}),[],'Source-free records terminate without inventing evidence');
assert.deepEqual(readSourceRefs({sourceBindings:{participant:'source-role'}}),[],'Unrelated binding metadata is not a source declaration');
assert.deepEqual(readSourceRefs(compileBookSourceRefs({provenance:{sourceId:'canonical-identity-without-document'}},{registry})),[],'An unregistered identity alone does not invent an unresolved document');
assert.deepEqual(readSourceRefs({source:{entityId:'canonical-owner',path:'/text'},sourceEvidence:{field:['text'],quote:'Exact quotation'}}),[],'Canonical addresses and quotations remain source-free');
const identityFixture={document:'books/unregistered/corpus.json',sourceId:'captured-entity',sha256:'document-bytes',acceptedHubSha256:'different-hub-bytes'};
const identityCompiled=compileBookSourceRefs(identityFixture,{registry});
assert.deepEqual(sourceDeclarationView(identityCompiled),identityFixture,'Captured identities and purpose-specific hashes retain exact values');
assert.ok(readSourceRefs(identityCompiled).every(ref=>!Object.hasOwn(ref,'recordedSourceId')&&!Object.hasOwn(ref,'acceptedHubSha256')),'Captured entity identity and unpaired hash stay in typed contexts');
const pathAliasFixture={sourceId:'books/source-reference-control/instruction.html',pointer:'/html/body/span',sha256:'fragment-hash'};
const pathAliasCompiled=compileBookSourceRefs({source:pathAliasFixture},{registry:{rows:[{sourceId:'registered-control-document',document:pathAliasFixture.sourceId}]}});
assert.deepEqual(sourceSnapshot(pathAliasCompiled,{slot:'source'}),pathAliasFixture,'A nested source holder decodes its normalized document-path alias');
const pathAliasRefs=readSourceRefs(pathAliasCompiled.source,{book:pathAliasCompiled});
assert.equal(pathAliasRefs[0].sourceId,'registered-control-document');assert.equal(pathAliasRefs[0].document,pathAliasFixture.sourceId);
assert.ok(!Object.hasOwn(pathAliasRefs[0],'sha256'),'A legacy document-path alias does not assert its fragment hash is document bytes');
for(const fixture of [
 {sourceDocument:'books/source-reference-control/document.html',sourceSha256:'document-hash'},
 {sourceDocument:'books/source-reference-control/document.html',sha256:'document-hash',sourceSha256:'different-recorded-hash'}
]){
 const compiled=compileBookSourceRefs(fixture,{registry}),refs=readSourceRefs(compiled);
 assert.deepEqual(sourceDeclarationView(compiled),fixture,'Document hash aliases retain every original value');
 assert.equal(refs.length,1);assert.equal(refs[0].sha256,fixture.sha256??fixture.sourceSha256);
 if(fixture.sha256)assert.equal(refs[0].sourceSha256,fixture.sourceSha256,'Contradictory recorded hash names are preserved without overwriting');
 else assert.ok(!Object.hasOwn(refs[0],'sourceSha256'),'An unambiguous source-document hash uses the common sha256 field');
}
const sha=value=>createHash('sha256').update(value).digest('hex');
const git=(...args)=>execFileSync('git',args,{cwd:root,maxBuffer:128*1024*1024});
const files=git('ls-tree','-r','--name-only',base,'--','books').toString('utf8').trim().split('\n')
 .filter(file=>bookIds.some(book=>file.startsWith(`books/${book}/v2/generated/`))&&file.endsWith('.json')).sort(cmp);
assert.equal(files.length,97,'The accepted base contains exactly 97 generated JSON artifacts in scope');
assert.deepEqual([...new Set(files.map(file=>file.split('/')[1]))].sort(cmp),bookIds.slice().sort(cmp));
const catalogs=new Set(['sourceRefCatalog','sourceLayoutCatalog','sourceContextCatalog']);
const pointerKey=key=>key.replaceAll('~','~0').replaceAll('/','~1');
function walk(value,visit,pointer=''){
 if(!value||typeof value!=='object')return;visit(value,pointer);
 for(const [key,child]of Object.entries(value))if(!catalogs.has(key))walk(child,visit,pointer+'/'+pointerKey(key));
}
const at=(value,pointer)=>pointer.split('/').slice(1).reduce((node,key)=>node?.[key.replaceAll('~1','/').replaceAll('~0','~')],value);
function excludedIds(book){
 const records=[];walk(book,row=>{if(row.id||row.ruleId)records.push(row);});
 const ids=new Set(records.filter(row=>row.kind==='STRATAGEM'||row.ruleContract?.kind==='STRATAGEM').flatMap(row=>[row.id,row.ruleId]).filter(Boolean));
 for(let changed=true;changed;){changed=false;for(const row of records)if([row.parentId,row.ownerId,row.ruleId].some(id=>ids.has(id)))for(const id of [row.id,row.ruleId])if(id&&!ids.has(id)){ids.add(id);changed=true;}}
 return ids;
}
function stratagemSerialization(book,ids){
 const rows=[];function visit(value,pointer='',key=''){
  if(!value||typeof value!=='object')return;
  if(value.kind==='STRATAGEM'||value.ruleContract?.kind==='STRATAGEM'||[value.id,value.ruleId,value.ownerId,key].some(id=>ids.has(id))){rows.push({pointer,bytes:JSON.stringify(value)});return;}
  for(const [name,child]of Object.entries(value))if(!catalogs.has(name))visit(child,pointer+'/'+pointerKey(name),name);
 }visit(book);return rows;
}
function collectStrings(value,result=new Set()){
 if(typeof value==='string')result.add(value);
 else if(value&&typeof value==='object')for(const child of Object.values(value))collectStrings(child,result);
 return result;
}
function assertPairs(original,refs,label){
 walk(original,node=>{
  const documents=Object.keys(node).filter(key=>typeof node[key]==='string'&&(['document','sourcePath','documentPath','sourceDocument','corpusDocument'].includes(key)||key==='path'&&/^(books\/|core\/|mfm\/|https?:)/.test(node[key])));
  const main=documents.find(key=>key!=='corpusDocument')||documents[0];
  for(const [key,hashKey,normalizedHash]of [[main,'sha256','sha256'],['corpusDocument','corpusSha256','sha256'],['sourceDocument','sourceSha256','sourceSha256']]){
   if(!key||typeof node[key]!=='string'||typeof node[hashKey]!=='string')continue;
   assert.ok(refs.some(ref=>ref.document===node[key]&&(hashKey==='sourceSha256'?(ref.sourceSha256??ref.sha256):ref[normalizedHash])===node[hashKey]),label+': document/hash association lost');
  }
  if(Array.isArray(node.sourcePaths)&&Array.isArray(node.sha256s)&&node.sourcePaths.length===node.sha256s.length)
   node.sourcePaths.forEach((document,index)=>assert.ok(refs.some(ref=>ref.document===document&&ref.sha256===node.sha256s[index]),label+': paired sourcePaths/sha256s lost'));
 });
}
const rows=[],examples=new Map(),mutations=[],stats={books:9,artifacts:0,entityOccurrences:0,sourceSlots:0,fieldMaps:0,currentnessSlots:0,stratagemRecords:0,referenceOccurrences:0,unresolvedReferenceOccurrences:0,documentHashAssociations:'PASS'};
const omissionControls={csmCaptureReferences:0,csmDocumentPathAliases:0,ecRecipientReferences:0,ecDocumentEvidence:0,tyranidSuppressionProof:0,deathGuardTableOccurrences:0};
let sourceExample,ownershipExample,fieldMapExample,currentnessExample;
for(const file of files){
 const before=JSON.parse(git('show',`${base}:${file}`)),beforeText=JSON.stringify(before),compiled=compileBookSourceRefs(before,{registry});
 assert.equal(JSON.stringify(before),beforeText,file+': compiler mutated accepted input');
 assert.equal(JSON.stringify(sourceDeclarationView(compiled,{book:compiled})),beforeText,file+': compiler inverse lost field bytes/order');
 const current=JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));registerBookSources(current);
 assert.equal(JSON.stringify(sourceDeclarationView(current,{book:current})),beforeText,file+': generated inverse lost field bytes/order');
 if(compiled.sourceSchema)assert.equal(current.sourceSchema,SOURCE_SCHEMA,file+': not yet regenerated; legacy input fallback is not migration evidence');
 const ids=excludedIds(before),strata=stratagemSerialization(before,ids);
 assert.deepEqual(stratagemSerialization(compiled,ids),strata,file+': compiler touched a stratagem');
 assert.deepEqual(stratagemSerialization(current,ids),strata,file+': generated stratagem serialization changed');
 let entities=0,slots=0;
 walk(compiled,(record,pointer)=>{
  if(record.id&&record.kind)entities++;
  if(record.sourceBindings?.$schema!==SOURCE_SCHEMA)return;
  const original=at(before,pointer),actual=at(current,pointer);
  assert.ok(actual?.sourceBindings,file+pointer+': missing generated source bindings');
  for(const slot of Object.keys(record.sourceBindings).filter(key=>!key.startsWith('$'))){
   slots++;const label=file+pointer+'/'+slot,refs=readSourceRefs(record,{book:compiled,slot}),actualRefs=readSourceRefs(actual,{book:current,slot});
   const expected=slot==='recordReference'?Object.fromEntries(record.sourceBindings[slot].fields.map(field=>[field,original[field]])):original[slot];
   assert.deepEqual(sourceSnapshot(record,{book:compiled,slot}),expected,label+': original slot lost');
   assert.deepEqual(sourceSnapshot(actual,{book:current,slot}),expected,label+': generated slot lost');
   assert.deepEqual(actualRefs,refs,label+': generated and fresh-compiled source bindings differ');
   const strings=collectStrings(expected);
   for(const ref of refs){
    if(ref.document!==undefined)assert.ok(strings.has(ref.document),label+': invented document');
    if(ref.resolution?.status==='UNRESOLVED_SOURCE'){stats.unresolvedReferenceOccurrences++;assert.equal(ref.sourceId,null,label+': unresolved ID must remain null');}
    else if(ref.sourceId!==null)assert.equal(registry.resolve(ref.document,ref.sourceId).sourceId,ref.sourceId,label+': unregistered document identity invented');
   }
   assertPairs(expected,refs,label);stats.referenceOccurrences+=refs.length;
   if(slot==='recordReference'){
    let control;
    if(file==='books/chaos-space-marines/v2/generated/effective.json'&&pointer.includes('/sourceReferences/'))control='csmCaptureReferences';
    if(file==='books/chaos-space-marines/v2/generated/app-presentation.json'&&typeof original.sourceId==='string'&&original.sourceId.startsWith('books/')&&original.pointer&&original.sha256){
     control='csmDocumentPathAliases';assert.ok(refs.every(ref=>!Object.hasOwn(ref,'sha256')),label+': fragment hash is not asserted as document bytes');
     assert.ok(refs.some(ref=>ref.document===original.sourceId&&ref.locators?.some(locator=>locator.value===original.pointer)),label+': document-path alias and locator retained');
    }
    if(file==='books/emperors-children/v2/generated/effective.json'&&pointer.includes('/recipientBindings/')&&pointer.includes('/sourceReferences/'))control='ecRecipientReferences';
    if(file==='books/emperors-children/v2/generated/roster-attachments.json'&&pointer.startsWith('/rosterAttachmentAdjudications/')&&pointer.includes('/evidence/'))control='ecDocumentEvidence';
    if(file==='books/tyranids/v2/generated/effective.json'&&pointer.endsWith('/suppressionProvenance'))control='tyranidSuppressionProof';
    if(file==='books/death-guard/v2/generated/effective.json'&&pointer.includes('/tableSourceOccurrences/'))control='deathGuardTableOccurrences';
    if(control){
     omissionControls[control]++;assert.ok(refs.some(ref=>ref.document),label+': actual omitted document now has a common reference');
     assert.ok(readSourceRefs(actual,{book:current}).some(ref=>ref.document),label+': default reader includes record reference');
     for(const key of ['quote','field','role','factTableIds'])if(Object.hasOwn(original,key))assert.deepEqual(actual[key],original[key],label+': ordinary fact metadata stays inline');
    }
   }
   if(slot==='fieldProvenance'){
    stats.fieldMaps++;assert.deepEqual(Object.keys(record.fieldProvenance),Object.keys(original[slot]),label+': field paths changed');
    for(const fieldPath of Object.keys(original[slot]))assert.deepEqual(readSourceRefs(record,{book:compiled,fieldPath}),readSourceRefs(actual,{book:current,fieldPath}),label+': field reference paths changed');
    if(!fieldMapExample)fieldMapExample={book:compiled,pointer,slot};
   }
   if(slot==='currentness'){stats.currentnessSlots++;currentnessExample||={book:compiled,pointer,slot};}
   if(refs.length&&slot!=='fieldProvenance'&&!sourceExample)sourceExample={book:compiled,pointer,slot};
   if(record.sourceOwnership&&Object.keys(record.sourceOwnership).length&&!ownershipExample)ownershipExample={book:compiled,pointer,slot};
  }
 });
 stats.artifacts++;stats.entityOccurrences+=entities;stats.sourceSlots+=slots;stats.stratagemRecords+=strata.length;
 rows.push({bookId:file.split('/')[1],artifact:file,entities,sourceSlots:slots,stratagemRecords:strata.length,inverseSha256:sha(beforeText)});
 if(['books/chaos-space-marines/v2/generated/roster-runtime.json','books/emperors-children/v2/generated/effective.json'].includes(file))examples.set(file,{before,compiled,current});
}
const csm=examples.get('books/chaos-space-marines/v2/generated/roster-runtime.json'),pactId='detachment-pactbound-zealots:rule';
const oldPact=csm.before.entities.find(entity=>entity.id===pactId),newPact=csm.current.entities.find(entity=>entity.id===pactId),pactRefs=readSourceRefs(newPact,{book:csm.current,slot:'provenance'});
assert.equal(oldPact.provenance.sourceEvidence.length,5);assert.equal(pactRefs.length,5,'All five independent evidence rows remain separate');
assert.equal(new Set(pactRefs.map(ref=>ref.document)).size,2,'CSM HTML and official PDF both retained');
assert.ok(!pactRefs.some(ref=>ref.sourceId===pactId),'Canonical rule identity is not a registered document ID');
oldPact.provenance.sourceEvidence.forEach((evidence,index)=>{
 const ref=pactRefs[index];assert.equal(ref.document,evidence.document);assert.equal(ref.sha256,evidence.sha256);assert.equal(ref.authority,evidence.authority);
 assert.ok(ref.locators.some(locator=>locator.kind==='TEXT_LOCATION'&&locator.value===evidence.location),'Each evidence row retains its exact locator');
});
const ec=examples.get('books/emperors-children/v2/generated/effective.json'),excludedEC=excludedIds(ec.before);
const ecEntities=ec.before.entities.filter(entity=>!excludedEC.has(entity.id)&&entity.provenance?.document&&entity.provenance?.corpusDocument);
assert.equal(ecEntities.length,402,'Actual accepted non-stratagem entity document/corpus pairs at base75');
for(const old of ecEntities){
 const entity=ec.current.entities.find(entity=>entity.id===old.id),refs=readSourceRefs(entity,{book:ec.current,slot:'provenance'});
 const doc=refs.find(ref=>ref.document===old.provenance.document&&ref.documentRole==='DOCUMENT'),corpus=refs.find(ref=>ref.document===old.provenance.corpusDocument&&ref.documentRole==='CORPUS');
 assert.equal(doc?.sha256,old.provenance.sha256,old.id+': EC document hash');assert.equal(corpus?.sha256,old.provenance.corpusSha256,old.id+': EC corpus hash');
 assert.ok(corpus.locators.some(locator=>locator.value===old.provenance.pointer),old.id+': corpus pointer association');
}
function reject(name,example,mutate,{inverse=false}={}){
 assert.ok(example,'Missing actual-data mutation fixture: '+name);const book=clone(example.book),record=at(book,example.pointer);mutate(record,book);
 assert.throws(()=>readSourceRefs(record,{book,slot:example.slot}),undefined,name+': shared reader accepted corruption');
 assert.throws(()=>sourceSnapshot(record,{book,slot:example.slot}),undefined,name+': strict slot inverse accepted corruption');
 if(inverse)assert.throws(()=>sourceDeclarationView(book,{book}),undefined,name+': full inverse accepted corrupted catalog');
 mutations.push({name,status:'REJECTED'});
}
reject('unknown source reference',sourceExample,record=>{record.sourceRefs[0].ref='refs-not-recorded';},{inverse:true});
reject('document hash changed behind content ID',sourceExample,(record,book)=>{const key=record.sourceRefs[0].ref;book.sourceRefCatalog[key].sha256='0'.repeat(64);},{inverse:true});
reject('legacy provenance shadow',sourceExample,record=>{record[sourceExample.slot]={sourceId:'unaccepted-shadow'};});
reject('canonical ownership changed',ownershipExample,record=>{record.sourceOwnership={provenance:{canonicalRuleId:'foreign-rule'}};});
reject('field source map changed',fieldMapExample,record=>{record.fieldProvenance['/not-recorded-field']=[];});
reject('currentness shadow',currentnessExample,record=>{record.currentness={sourceVersion:'unrecorded-version'};});
assert.ok(stats.fieldMaps>0&&stats.currentnessSlots>0&&stats.unresolvedReferenceOccurrences>0,'Real field maps, currentness and unresolved sources must be exercised');
assert.deepEqual(omissionControls,{csmCaptureReferences:681,csmDocumentPathAliases:34,ecRecipientReferences:1,ecDocumentEvidence:2,tyranidSuppressionProof:1,deathGuardTableOccurrences:4},'All actual omitted document forms are exercised');
console.log(JSON.stringify({status:'PASS',base,...stats,csmPactboundEvidence:{references:5,documents:2},ecNonStratagemEntityDocumentCorpusPairs:402,omissionControls,negativeControls:mutations,books:bookIds.map(bookId=>({bookId,artifacts:rows.filter(row=>row.bookId===bookId).length,entities:rows.filter(row=>row.bookId===bookId).reduce((n,row)=>n+row.entities,0),sourceSlots:rows.filter(row=>row.bookId===bookId).reduce((n,row)=>n+row.sourceSlots,0)}))},null,2));
