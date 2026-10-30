/** Translate 3: deterministic all-artifact inverse and source-binding evidence.
 * No ingestion or network. --write regenerates the two audit documents;
 * --check compares exact bytes. Optional external --parity/--package JSON
 * measurements are attestations, never a substitute for the static checks. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {SOURCE_SCHEMA,compileBookSourceRefs,registerBookSources,sourceDeclarationView,readSourceRefs,sourceSnapshot,getSourceBindings} from '../../books/shared/source-refs-v2/source-refs.mjs';
import {loadSourceRegistry} from '../../books/shared/source-refs-v2/source-registry.mjs';
import {assertSourceReferenceClosure} from '../../books/shared/source-refs-v2/source-closure.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url)),base='75d322e4e3274f14d7e2a81abace3ba63c784ec5';
const registry=loadSourceRegistry(root);
const sourceCatalog=JSON.parse(fs.readFileSync(path.join(root,'books/shared/source-refs-v2/source-catalog.json'),'utf8'));
const books=['adeptus-mechanicus','blood-angels','chaos-space-marines','dark-angels','death-guard','emperors-children','space-marines','tau-empire','tyranids'];
const args=process.argv.slice(2),mode=args[0],options={};assert.ok(['--write','--check'].includes(mode),'Use --write or --check');
for(let i=1;i<args.length;i+=2){assert.ok(['--package','--parity'].includes(args[i])&&args[i+1]&&!options[args[i]],'Invalid measurement option');options[args[i]]=args[i+1];}
const cmp=(a,b)=>a<b?-1:a>b?1:0,hash=value=>createHash('sha256').update(value).digest('hex');
const fileBytes=file=>fs.readFileSync(path.join(root,file));
const git=(...args)=>execFileSync('git',args,{cwd:root,maxBuffer:128*1024*1024});
const listed=git('ls-tree','-r','--name-only',base,'--','books').toString('utf8').trim().split('\n');
const files=listed.filter(file=>books.some(book=>file.startsWith(`books/${book}/v2/generated/`))&&file.endsWith('.json')).sort(cmp);
const currentFiles=books.flatMap(book=>fs.readdirSync(path.join(root,`books/${book}/v2/generated`),{recursive:true}).filter(file=>file.endsWith('.json')).map(file=>`books/${book}/v2/generated/${file.replaceAll('\\','/')}`)).sort(cmp);
assert.deepEqual(currentFiles,files,'Generated JSON inventory changed');
const plain=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const catalogKeys=new Set(['sourceRefCatalog','sourceLayoutCatalog','sourceContextCatalog']);
function walk(value,visit,pointer='',parentKey=''){
 if(!value||typeof value!=='object')return;visit(value,pointer,parentKey);
 for(const [key,child]of Object.entries(value))if(!catalogKeys.has(key))walk(child,visit,pointer+'/'+key.replaceAll('~','~0').replaceAll('/','~1'),key);
}
const at=(value,pointer)=>pointer.split('/').slice(1).reduce((node,key)=>node?.[key.replaceAll('~1','/').replaceAll('~0','~')],value);
function bindingInventory(document){const result=[];walk(document,(record,pointer)=>{const bindings=getSourceBindings(record);if(bindings)for(const slot of Object.keys(bindings).filter(key=>!key.startsWith('$')))result.push(pointer+'/'+slot);});return result.sort(cmp);}
function assertDocumentHashPairs(value,refs,label){
 walk(value,node=>{
  const docs=Object.keys(node).filter(key=>typeof node[key]==='string'&&(['document','sourcePath','documentPath','sourceDocument','corpusDocument'].includes(key)||key==='path'&&/^(books\/|core\/|mfm\/|https?:)/.test(node[key])));
  const main=docs.find(key=>key!=='corpusDocument')||docs[0];
  for(const [key,hashKey,refKey]of [[main,'sha256','sha256'],[main,'textSha256','textSha256'],['corpusDocument','corpusSha256','sha256'],['sourceDocument','sourceSha256','sourceSha256']]){
   if(!key||typeof node[key]!=='string'||!Object.hasOwn(node,hashKey))continue;
   assert.ok(refs.some(ref=>ref.document===node[key]&&JSON.stringify(hashKey==='sourceSha256'?(ref.sourceSha256??ref.sha256):ref[refKey])===JSON.stringify(node[hashKey])),label+': document/hash tuple lost');
  }
  if(Array.isArray(node.sourcePaths)&&Array.isArray(node.sha256s)&&node.sourcePaths.length===node.sha256s.length)node.sourcePaths.forEach((document,index)=>assert.ok(refs.some(ref=>ref.document===document&&JSON.stringify(ref.sha256)===JSON.stringify(node.sha256s[index])),label+': paired document/hash tuple lost'));
 });
}
function stratagemIds(document){
 const records=[];walk(document,node=>{if(node.id||node.ruleId)records.push(node);});
 const result=new Set(records.filter(node=>node.kind==='STRATAGEM'||node.ruleContract?.kind==='STRATAGEM').flatMap(node=>[node.id,node.ruleId]).filter(Boolean));
 for(let changed=true;changed;){changed=false;for(const node of records)if([node.parentId,node.ownerId,node.ruleId].some(id=>result.has(id)))for(const id of [node.id,node.ruleId])if(id&&!result.has(id)){result.add(id);changed=true;}}
 return result;
}
function stratagemRows(document,ids){
 const result=[];function visit(node,pointer='',key='',excluded=false){
  if(!node||typeof node!=='object')return;
  const isStrat=!excluded&&(node.kind==='STRATAGEM'||node.ruleContract?.kind==='STRATAGEM'||[node.id,node.ruleId,node.ownerId,key].some(id=>ids.has(id)));
  if(isStrat){result.push({pointer,bytes:JSON.stringify(node)});return;}
  for(const [name,child]of Object.entries(node))if(!catalogKeys.has(name))visit(child,pointer+'/'+name,name,excluded||isStrat);
 }visit(document);return result;
}
function reference(file,anchor){const content=fileBytes(file).toString('utf8'),at=content.indexOf(anchor);assert.ok(at>=0,'Missing verified code anchor '+file+': '+anchor);return {path:file,line:content.slice(0,at).split('\n').length,anchor};}
const proofs={compiler:reference('books/shared/source-refs-v2/source-refs.mjs','export function compileBookSourceRefs'),
 recordReference:reference('books/shared/source-refs-v2/source-refs.mjs','function referenceFields'),
 inverse:reference('books/shared/source-refs-v2/source-refs.mjs','export function sourceDeclarationView'),
 reader:reference('books/shared/source-refs-v2/source-refs.mjs','export function readSourceRefs'),
 validation:reference('books/shared/source-refs-v2/source-refs.mjs','function validateBindings'),
 loader:reference('books/shared/army-book-app-v2/personal.mjs','export async function loadDetachmentPresentationSources')};
const bookRows=books.map(bookId=>({bookId,artifacts:0,entityOccurrences:0,sourceSlots:0,translatedSlots:0,stratagemRecords:0,baselineBytes:0,featureBytes:0,referenceOccurrences:0,multiDocumentSlots:0,unresolvedReferences:0}));
const artifacts=[],unresolved=[],multiDocument=[],metadataOnly=[],sourceShapes=new Map(),formCounts=new Map(),multiDocumentRules=new Map();
for(const file of files){
 const bookId=file.split('/')[1],aggregate=bookRows.find(row=>row.bookId===bookId),baseline=git('show',`${base}:${file}`),current=fileBytes(file);
 const before=JSON.parse(baseline),after=JSON.parse(current);
 // Validate actual serialized closure before a fresh compilation can populate
 // reader pools and conceal a missing published reference.
 assertSourceReferenceClosure(after,{catalog:sourceCatalog,bookId,label:file});registerBookSources(after);
 const inverse=sourceDeclarationView(after,{book:after});assert.equal(JSON.stringify(inverse),JSON.stringify(before),'All-entity/all-field inverse mismatch: '+file);
 const compiled=compileBookSourceRefs(before,{registry});
 assert.equal(JSON.stringify(sourceDeclarationView(compiled,{book:compiled})),JSON.stringify(before),'Fresh compiler inverse mismatch: '+file);
 assert.deepEqual(bindingInventory(after),bindingInventory(compiled),'Normalized source binding inventory mismatch: '+file);
 const oldStrata=stratagemRows(before,stratagemIds(before)),newStrata=stratagemRows(after,stratagemIds(before));
 assert.deepEqual(newStrata,oldStrata,'Stratagem serialization changed: '+file);
 assert.deepEqual(stratagemRows(compiled,stratagemIds(before)),oldStrata,'Fresh compiler changed a stratagem: '+file);
 const stats={path:file,baselineSha256:hash(baseline),featureSha256:hash(current),baselineBytes:baseline.length,featureBytes:current.length,
  exactInverse:'PASS',stratagemSerialization:'PASS',sourceSchema:after.sourceSchema||null,entities:0,sourceSlots:0,translatedSlots:0,referenceOccurrences:0,stratagemRecords:oldStrata.length};
 const stratPointers=oldStrata.map(row=>row.pointer);
 walk(compiled,(record,pointer)=>{
  if(stratPointers.some(path=>pointer===path||pointer.startsWith(path+'/')))return;
  if(record.id&&record.kind){stats.entities++;aggregate.entityOccurrences++;}
  if(record.sourceBindings?.$schema!==SOURCE_SCHEMA)return;
  const original=at(before,pointer),currentRecord=at(after,pointer);
  for(const [slot,binding]of Object.entries(record.sourceBindings))if(!slot.startsWith('$')){
   const value=slot==='recordReference'?Object.fromEntries(binding.fields.map(field=>[field,original[field]])):original[slot];
   stats.sourceSlots++;aggregate.sourceSlots++;
   const formKey=bookId+'/'+slot;formCounts.set(formKey,(formCounts.get(formKey)||0)+1);
   const shape=bookId+'/'+slot+'/'+(Array.isArray(value)?'array':plain(value)?Object.keys(value).sort(cmp).join(','):typeof value);sourceShapes.set(shape,(sourceShapes.get(shape)||0)+1);
   assert.ok(getSourceBindings(currentRecord)?.[slot],'Untranslated original source slot: '+file+pointer+'/'+slot);
   if(slot==='recordReference')assert.deepEqual(getSourceBindings(currentRecord)[slot].fields,binding.fields,'Flattened source field inventory mismatch: '+file+pointer);
   stats.translatedSlots++;aggregate.translatedSlots++;
   assert.deepEqual(sourceSnapshot(currentRecord,{book:after,slot}),value,'Slot inverse mismatch: '+file+pointer+'/'+slot);
   const refs=readSourceRefs(currentRecord,{book:after,slot});
   assert.deepEqual(refs,readSourceRefs(record,{book:compiled,slot}),'Source references differ from fresh normalization: '+file+pointer+'/'+slot);
   assertDocumentHashPairs(value,refs,file+pointer+'/'+slot);
   stats.referenceOccurrences+=refs.length;aggregate.referenceOccurrences+=refs.length;
   const documents=[...new Set(refs.map(ref=>ref.document).filter(Boolean))].sort(cmp);
   if(documents.length>1){const row={bookId,path:file,pointer,entityId:record.id||record.ruleId||null,slot,references:refs.length,documents,bindings:refs.map(ref=>({sourceId:ref.sourceId,document:ref.document??null,documentRole:ref.documentRole??null,sha256:ref.sha256??null,textSha256:ref.textSha256??null,sourceSha256:ref.sourceSha256??null})).sort((a,b)=>cmp(JSON.stringify(a),JSON.stringify(b)))};multiDocument.push(row);aggregate.multiDocumentSlots++;}
   if(documents.length>1&&record.id&&record.ruleContract){const key=bookId+'/'+record.id,rule=multiDocumentRules.get(key)||{bookId,entityId:record.id,entityKind:record.kind,ruleContractKind:record.ruleContract.kind,artifacts:[],slots:[]};if(!rule.artifacts.includes(file))rule.artifacts.push(file);if(!rule.slots.includes(slot))rule.slots.push(slot);multiDocumentRules.set(key,rule);}
   if(!refs.length)metadataOnly.push({bookId,path:file,pointer,entityId:record.id||record.ruleId||null,slot,keys:plain(value)?Object.keys(value).sort(cmp):[],reason:'No document reference emitted for this source slot. Its recorded value is preserved by the exact inverse; no document identity is inferred by this report.'});
   refs.forEach((ref,index)=>{if(ref.resolution?.status==='UNRESOLVED_SOURCE'){unresolved.push({bookId,path:file,pointer,entityId:record.id||record.ruleId||null,slot,index,document:ref.document??null,recordedSourceId:ref.recordedSourceId??null,reason:ref.resolution.reason,candidates:ref.resolution.candidates||[]});aggregate.unresolvedReferences++;}});
  }
 });
 aggregate.artifacts++;aggregate.stratagemRecords+=stats.stratagemRecords;aggregate.baselineBytes+=baseline.length;aggregate.featureBytes+=current.length;
 assert.ok(stats.sourceSlots===0||stats.translatedSlots===0||after.sourceSchema===SOURCE_SCHEMA,'Missing source schema: '+file);
 artifacts.push(stats);
 console.error('AUDIT_VERIFIED '+file);
}
assert.deepEqual([...new Set(files.map(file=>file.split('/')[1]))].sort(cmp),books.slice().sort(cmp),'Missing book');
assert.ok(bookRows.every(row=>row.translatedSlots>0),'Every book must contain actual normalized source bindings before publishing the migration report');
const multiDocumentRuleInventory=[...multiDocumentRules.values()].sort((a,b)=>cmp(a.bookId,b.bookId)||cmp(a.entityId,b.entityId)).map(row=>({...row,artifacts:row.artifacts.sort(cmp),slots:row.slots.sort(cmp)}));
const unresolvedDocuments=[...new Map(unresolved.map(row=>{const identity={bookId:row.bookId,document:row.document,reason:row.reason,candidates:row.candidates};return [JSON.stringify(identity),identity];})).values()].sort((a,b)=>cmp(a.bookId,b.bookId)||cmp(JSON.stringify(a),JSON.stringify(b)));
const csmExample=multiDocument.find(row=>row.path==='books/chaos-space-marines/v2/generated/roster-runtime.json'&&row.entityId==='detachment-pactbound-zealots:rule'&&row.slot==='provenance');
const ecExample=multiDocument.find(row=>row.path==='books/emperors-children/v2/generated/effective.json'&&row.entityId&&row.bindings.some(ref=>ref.documentRole==='CORPUS'));
assert.ok(csmExample&&ecExample,'Actual CSM and EC multi-document examples must be present');
const jsonPath=path.join(root,'docs/audit/source-refs-translation-3.json'),mdPath=path.join(root,'docs/audit/source-refs-translation-3.md');
const saved=fs.existsSync(jsonPath)?JSON.parse(fs.readFileSync(jsonPath,'utf8')):{};
function measurement(option,key){
 const raw=options[option]?JSON.parse(fs.readFileSync(options[option],'utf8')):saved[key]||{status:'NOT_MEASURED'};
 // Full browser captures contain exact strings and external screenshots. The
 // tracked report stores their stable content digest/counts, not checkout paths.
 if(raw.schema==='source-refs-browser-parity/v1')return {status:raw.status==='PASS'?'MEASURED':raw.status,scope:raw.scope,selectedBookIds:raw.selectedBookIds||null,counts:raw.counts,zeroDifference:raw.comparison?.zeroDifference??false,observationsSha256:hash(JSON.stringify(raw.observations))};
 assert.ok(!/(?:[A-Z]:[\\/]|\/Users\/|\/home\/|\d{4}-\d\d-\d\dT)/.test(JSON.stringify(raw)),'Measurement must contain no absolute paths or timestamps');return raw;
}
const report={schema:'source-refs-translation-3/v1',base,sourceSchema:SOURCE_SCHEMA,bookIds:books,excludedBookIds:['orks'],excludedEntityKinds:['STRATAGEM'],
 scope:'Lossless source-reference encoding only; canonical identity, recipient/condition/evidence semantics, accepted source facts and stratagems are unchanged.',
 summary:{artifacts:artifacts.length,entities:bookRows.reduce((n,row)=>n+row.entityOccurrences,0),sourceSlots:bookRows.reduce((n,row)=>n+row.sourceSlots,0),translatedSlots:bookRows.reduce((n,row)=>n+row.translatedSlots,0),referenceOccurrences:bookRows.reduce((n,row)=>n+row.referenceOccurrences,0),multiDocumentSlots:multiDocument.length,unresolvedReferences:unresolved.length,metadataOnlySlots:metadataOnly.length,stratagemRecords:bookRows.reduce((n,row)=>n+row.stratagemRecords,0),baselineGeneratedBytes:bookRows.reduce((n,row)=>n+row.baselineBytes,0),featureGeneratedBytes:bookRows.reduce((n,row)=>n+row.featureBytes,0)},
 staticChecks:{serializedReferenceClosure:'PASS',everyEntityAndFieldInverse:'PASS',everyOriginalSourceSlotInverse:'PASS',freshCompilerBindingInventory:'PASS',documentHashAssociations:'PASS',stratagemSerialization:'PASS',verification:'STATIC_DATA_ONLY'},
 books:bookRows,artifacts,oldToNewForms:[...formCounts].sort(([a],[b])=>cmp(a,b)).map(([key,count])=>({bookId:key.split('/')[0],oldSlot:key.split('/')[1],count,newForm:key.endsWith('/recordReference')?'sourceRefs + sourceBindings.recordReference; fields[] restores flat document declarations':'sourceRefs + sourceBindings; fieldProvenance retains its field map'})),sourceShapes:[...sourceShapes].sort(([a],[b])=>cmp(a,b)).map(([shape,count])=>({shape,count})),multiDocument,unresolved,metadataOnly,
 formatRationale:[
  {field:'sourceRefs + shared document tables',reason:'Published references carry documentId, referenceId and literal locators. One table per book in source-catalog.json stores document identity/hash/authority/currentness; the reference content ID protects the complete association. Scratch/unpublished metadata may use inline catalogs.'},
  {field:'documentRole',reason:'Distinguishes an accepted document from its corpus companion; their hashes must not be interchanged.'},
  {field:'sourceBindings.recordReference.fields[]',reason:'Inventories the original source-only fields of a flat document-bearing record. The inverse flattens these fields in original order; ordinary quotation, field, role, recipient and fact metadata remains inline.'},
  {field:'document-path sourceId aliases',reason:'A books/core/mfm/HTTP document path plus a locator resolves as a document, while its original sourceId field is restored by the layout. Its legacy sha256 remains attribute context because this form can hash fragment text rather than document bytes.'},
  {field:'locators[]',reason:'Preserves original literal locators. Opaque selectors and line numbers use TEXT_LOCATION; pages use PDF_PAGE with their original scalar or array values. Explicit xpath and JSON/HTML pointers retain their declared locator kinds.'},
  {field:'resolution',reason:'An unregistered or ambiguous document remains explicit UNRESOLVED_SOURCE. Captured/canonical entity IDs alone are typed identity contexts, not unresolved document references.'},
  {field:'sourceOwnership',reason:'Canonical rule/entity ownership is separate from document identity and source hashes.'},
  {field:'sourceBindings + shared immutable layouts/contexts',reason:'Published binding tuples, value-free layouts and contexts are interned across snapshots. They preserve exact existing structures, captured identities, effectiveFrom and unpaired purpose-specific hashes. Catalog entries are validated before first use and frozen; replacing record metadata invalidates cached reads. Canonical currentness contains only sourceVersion, effectiveDate, observedAt and acceptedBaseHead. No legacy provenance object is duplicated.'}],
 multiDocumentRuleInventory,unresolvedDocuments,multiDocumentExamples:{csm:csmExample,ec:ecExample},
 proofs,packageMeasurements:measurement('--package','packageMeasurements'),browserMeasurements:measurement('--parity','browserMeasurements'),
 baselineSourceChecks:['tests/source-enrollment-qa.mjs','books/shared/tools/source-freshness.mjs','tests/source-ingestion-contract-qa.mjs'].map(test=>({test,status:'PRE_EXISTING_BASELINE_FAIL',error:'death-guard: registered sources are not actively declared: death-guard-mfm-v1.6'})),
 limitations:['Exact inverse is checked for every generated JSON artifact in scope, including every entity and field, rather than a fixed example list. Entity counts are artifact occurrences, not unique gameplay entities.',
  'Static source parity is not a browser execution. Actual card text, Source/Applies to labels and offline Noospheric table equality are reported only through the separate browser measurement.',
  'loadDetachmentPresentationSources algorithm is retained as F2 technical debt. Only the owner-authorized source binding guard/comparison adaptation is in scope.',
  'Registry resolution may be unresolved for historical accepted paths. The migration preserves their recorded locators and hash associations and does not ingest, refetch or relabel source facts.',
  'Baseline source enrollment/freshness/ingestion checks share the historical DG central MFM declaration failure; this report does not claim that gate passes.']};
const lines=['# Source references: Translate 3','','Base: `'+base+'`. Generated from repository files; no live ingestion.','','## Scope and exact inverse','','All nine books are included; Orks and all stratagem subtrees are excluded. Every generated JSON artifact is inverted and compared to the base, including every entity and field. Stratagem objects are compared by their original JSON serialization.','',
 '| Book | Artifacts | Entity occurrences | Source slots | Translated slots | References | Multi-document slots | Unresolved | Bytes before | Bytes after |','| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
 ...bookRows.map(row=>`| ${row.bookId} | ${row.artifacts} | ${row.entityOccurrences} | ${row.sourceSlots} | ${row.translatedSlots} | ${row.referenceOccurrences} | ${row.multiDocumentSlots} | ${row.unresolvedReferences} | ${row.baselineBytes} | ${row.featureBytes} |`),
 '','Static checks: `'+JSON.stringify(report.staticChecks)+'`. Counts include repeated artifact representations. Source slots are inventoried from a fresh compilation of every baseline artifact with the repository registry, then compared to actual generated bindings. Complete per-artifact hashes, shapes, document bindings, metadata-only slots and unresolved document identities are in the companion JSON.','',
 '## Old form to common form','', '| Book | Original slot or flat source subset | Occurrences | New form |','| --- | --- | ---: | --- |',...report.oldToNewForms.map(row=>`| ${row.bookId} | ${row.oldSlot} | ${row.count} | ${row.newForm} |`),'',
 '## Common format and additional fields','',...report.formatRationale.map(row=>'- `'+row.field+'`: '+row.reason),'',
 '## Multi-document evidence','','The `multiDocument[]` inventory records actual references and document/hash pairs for every source slot and flat `recordReference` subset. It includes CSM multi-evidence rules and EC document/corpus pairs; counts are computed from files rather than assumed. Known document/hash pairings are checked independently of the exact inverse. Unpaired purpose-specific hashes and captured entity IDs remain typed contexts and do not increase unresolved document counts.','',
 '## Currentness and source ownership','','Object currentness declarations use the same source binding mechanism. UI currentness strings, canonical `card.fields[].source` ownership pointers, source-free quotations and stratagem declarations retain their meanings. Canonical rule identity is never inferred from a document path.','',
 '## Actual execution measurements','','Browser: `'+JSON.stringify(report.browserMeasurements)+'`.','','Package: `'+JSON.stringify(report.packageMeasurements)+'`.','','These saved measurements are attestations from separate executions. Regeneration recomputes static parity; it does not rerun the browser or packaging checks.','',
 '## Baseline source gates','',...report.baselineSourceChecks.map(row=>'- `'+row.test+'`: '+row.status+' — `'+row.error+'`.'),'',
 '## Verified code references','',...Object.entries(proofs).map(([name,ref])=>'- '+name+': `'+ref.path+':'+ref.line+'` (`'+ref.anchor+'`).'),'',
 '## Limits and technical debt','',...report.limitations.map(value=>'- '+value),'',
 'Regenerate with `node tools/audit/source-refs-translation-report.mjs --write`; verify exact output with `--check`. Optional `--parity FILE` and `--package FILE` attach stable measurements; omitted measurements reuse the saved attestations.',''];
Object.assign(report.summary,{multiDocumentRuleEntities:multiDocumentRuleInventory.length,unresolvedDocumentIdentities:unresolvedDocuments.length});
lines.splice(lines.indexOf('## Multi-document evidence')+2,0,
 `${multiDocumentRuleInventory.length} distinct book/entity identities with a recorded ruleContract have multiple documents; ${multiDocument.length} is the separate count of repeated source slots across artifacts. Rules without a ruleContract are not silently included in that contract-entity count.`,
 '',`CSM: \`${csmExample.entityId}\` in \`${csmExample.path}\` retains ${csmExample.references} evidence references from ${csmExample.documents.length} documents: ${csmExample.documents.map(value=>'\`'+value+'\`').join(', ')}.`,
 '',`EC: \`${ecExample.entityId}\` in \`${ecExample.path}\` retains separate document/corpus bindings: \`${JSON.stringify(ecExample.bindings)}\`.`,
 '',`${unresolved.length} unresolved reference occurrences reduce to ${unresolvedDocuments.length} distinct book/document/reason identities. The companion JSON includes both the deduplicated unresolvedDocuments[] list and every unresolved[] occurrence; no accepted source is relabelled or repaired.`, '');
const outputs=[[jsonPath,JSON.stringify(report,null,2)+'\n'],[mdPath,lines.join('\n')]];
for(const [file,text]of outputs){if(mode==='--write'){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,text);}else assert.equal(fs.readFileSync(file,'utf8'),text,'Regeneration differs: '+path.relative(root,file));}
console.log(JSON.stringify({status:'PASS',...report.summary,staticChecks:report.staticChecks,browserMeasurements:report.browserMeasurements,packageMeasurements:report.packageMeasurements}));
