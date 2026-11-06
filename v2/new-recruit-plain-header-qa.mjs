/** Independent owner expectations and baseline-derived header equivalence. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {parse} from '../books/shared/roster-v2/parser.mjs';
import {sourceDeclarationView} from '../books/shared/source-refs-v2/source-refs.mjs';
const fixtures=JSON.parse(fs.readFileSync(new URL('./fixtures/new-recruit-plain-header.json',import.meta.url)));
const ownerBytes=fs.readFileSync(new URL('./fixtures/'+fixtures.owner.file,import.meta.url)),owner=ownerBytes.toString('utf8');
assert.equal(createHash('sha256').update(ownerBytes).digest('hex'),fixtures.owner.sha256,'Exact owner export bytes');
const plus=owner.replace('Death Guard\nContagion Engines and Paragons of Putrescence (2 Detachment Points)',
 '+ FACTION KEYWORD: Chaos - Death Guard\n+ DETACHMENT: Contagion Engines, Paragons of Putrescence');
const selected=process.argv.find(arg=>arg.startsWith('--book='))?.slice(7);
const books=['death-guard',...fixtures.derived.map(row=>row.bookId)];assert(!selected||books.includes(selected));
const read=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(url))});globalThis.fetch=read;
const hash=value=>createHash('sha256').update(JSON.stringify(sourceDeclarationView(value))).digest('hex');
const checks=[];
function observation(service){return sourceDeclarationView({state:service.snapshot(),projection:service.projection,points:service.points});}
function normalizedHeaderObservation(service,{namespace,baselineEvidence=null,plainEvidence=null}){
 const value=observation(service),actualNamespace=service.state.rosterId;
 // Different input text has a deliberately different import namespace. Audit
 // only the roster namespace and its explicit MODEL-instance prefix. Preserve
 // the complete physical suffix, canonical/scope IDs and effect/trace IDs.
 for(const root of [value.state,value.projection,value.points])if(root&&Object.hasOwn(root,'rosterId')){
  assert.equal(root.rosterId,actualNamespace);root.rosterId=namespace;
 }
 function physicalNamespaces(node){
  if(!node||typeof node!=='object')return;
  for(const [key,child]of Object.entries(node)){
   if(['modelInstanceId','targetModelInstanceId'].includes(key)&&typeof child==='string'&&child.startsWith(actualNamespace+'/'))
    node[key]=namespace+child.slice(actualNamespace.length);
   else physicalNamespaces(child);
  }
 }
 physicalNamespaces(value);
 if(baselineEvidence!==null){
  assert.deepEqual(value.state.importEvidence,plainEvidence??baselineEvidence,'Every header metadata field is accounted for');
  value.state.importEvidence=structuredClone(baselineEvidence);
 }else assert.equal(value.state.importEvidence,undefined);
 return value;
}
const ids=['unit-biologus-putrifier','unit-lord-of-contagion','unit-malignant-plaguecaster','unit-plague-marines','unit-chaos-rhino',
 'unit-deathshroud-terminators','unit-foetid-bloat-drone','unit-foetid-bloat-drone-with-heavy-blight-launcher','unit-myphitic-blight-hauler'];
function ownerUnits(service){
 assert.deepEqual(service.state.units.map(unit=>unit.canonicalUnitId),ids);
 assert.deepEqual(service.state.units.map(unit=>unit.startingStrength),[1,1,1,10,1,3,1,1,1]);
 assert.equal(service.state.warlordInstanceId,'parsed-unit-2');assert.equal(service.state.units[1].warlord,true);
 assert.equal(service.state.attachments.length,0);
}
for(const bookId of books.filter(id=>!selected||selected===id)){
 const entry=bookId==='adeptus-mechanicus'?'roster-runtime':'roster-boot';
 const service=await (await import(`../books/${bookId}/v2/${entry}.mjs`)).createBrowserRoster({fetch:read});
 console.log('Plain header checks: '+bookId);
 if(bookId==='death-guard'){
  const draft=service.draft(owner);assert.equal(draft.metadata.faction,'Death Guard');assert.equal(draft.metadata.pointsLimit,950);
  assert.deepEqual(draft.metadata.plainHeader,{listName:'Unnamed list',detachmentPoints:2});
  assert.deepEqual(draft.detachments.map(row=>row.name),['Contagion Engines','Paragons of Putrescence']);
  assert.deepEqual(parse(owner).units,parse(plus).units,'Unit, N with, warlord and equipment decoding stay identical');
  let result=service.import(owner,{}, {replaceExisting:true});assert.equal(result.status,'READY',JSON.stringify(result.needsBindings||result.errors));
  ownerUnits(service);assert.deepEqual(service.state.detachmentIds,['detachment-contagion-engines','detachment-paragons-of-putrescence']);
  assert.equal(hash(normalizedHeaderObservation(service,{namespace:fixtures.owner.expectedBaselinePlusNamespace})),fixtures.owner.expectedBaselinePlusObservationSha256);
  const corrupted=structuredClone(service.projection);
  function corruptModel(node){
   if(!node||typeof node!=='object')return false;
   if(typeof node.modelInstanceId==='string'){node.modelInstanceId+='/unrelated-model';return true;}
   return Object.values(node).some(corruptModel);
  }
  assert(corruptModel(corrupted));
  const broken={state:service.state,snapshot:()=>service.snapshot(),projection:corrupted,points:service.points};
  assert.notEqual(hash(normalizedHeaderObservation(broken,{namespace:fixtures.owner.expectedBaselinePlusNamespace})),fixtures.owner.expectedBaselinePlusObservationSha256,
    'Rebasing the input namespace must still detect a different physical MODEL identity');
  checks.push('literal owner export: nine physical units, two detachments, warlord and no attachments');
  result=service.import(owner.replace('(2 Detachment Points)','(99 Detachment Points)'),{}, {replaceExisting:true});
  assert.equal(result.status,'READY');assert.equal(result.draft.metadata.plainHeader.detachmentPoints,99);
  assert.equal(hash(normalizedHeaderObservation(service,{namespace:fixtures.owner.expectedBaselinePlusNamespace})),fixtures.owner.expectedBaselinePlusObservationSha256,'Declared DP does not change prices, effects or legality');
  checks.push('declared DP count is informational');
  result=service.import(owner.replace('Contagion Engines and Paragons of Putrescence (2 Detachment Points)','Contagion Engines (1 Detachment Point)'),{}, {replaceExisting:true});
  assert.equal(result.status,'READY');ownerUnits(service);assert.deepEqual(service.state.detachmentIds,['detachment-contagion-engines']);
  checks.push('one detachment, singular Detachment Point');
  const before=service.snapshot(),unknown=service.import(owner.replace('Paragons of Putrescence','An Unreviewed Detachment'),{}, {replaceExisting:true});
  assert.equal(unknown.status,'NEEDS_BINDINGS');assert(unknown.needsBindings.some(row=>row.kind==='DETACHMENT'));
  assert.deepEqual(service.snapshot(),before,'Unknown headings cannot replace the saved roster');checks.push('unknown name retained unresolved');
  result=service.import(plus,{}, {replaceExisting:true});assert.equal(result.status,'READY');
  assert.equal(hash(result),fixtures.owner.expectedBaselinePlusImportSha256,'Complete labelled import result matches baseline');
  assert.equal(hash(observation(service)),fixtures.owner.expectedBaselinePlusObservationSha256,'Complete labelled execution matches baseline');
  checks.push('original plus control is unchanged');
 }else{
  const c=fixtures.derived.find(row=>row.bookId===bookId);assert.equal(c.kind,'DERIVED_NOT_REAL_EXPORT');
  const original=service.import(c.plusText,c.bindings,{replaceExisting:true});assert.equal(original.status,'READY');
  assert.equal(hash(original),c.expectedBaselineImportSha256,'Existing labelled import result matches baseline');
  assert.equal(hash(observation(service)),c.expectedBaselineObservationSha256);
  const result=service.import(c.plainText,c.bindings,{replaceExisting:true});assert.equal(result.status,'READY',JSON.stringify(result.needsBindings||result.errors));
  assert.deepEqual(service.state.detachmentIds,c.expectedDetachmentIds);assert.equal(service.state.attachments.length,0);
  assert.deepEqual(parse(c.plainText).units,parse(c.plusText).units,'Identical body decoding');
  const header={listName:c.listName,detachmentPoints:1};
  const expected=c.expectedBaselineImportEvidence===null?null:{...structuredClone(c.expectedBaselineImportEvidence),faction:c.faction,pointsLimit:c.pointsLimit,plainHeader:header};
  assert.equal(hash(normalizedHeaderObservation(service,{namespace:c.expectedBaselineNamespace,baselineEvidence:c.expectedBaselineImportEvidence,plainEvidence:expected})),
    c.expectedBaselineObservationSha256,'Only the exact audited header information and input namespace can differ');
  checks.push(bookId+': existing plus and derived plain input agree');
  if(bookId==='tau-empire'){
   const before=service.snapshot(),foreign=service.import(owner,{}, {replaceExisting:true});
   assert.equal(foreign.status,'INVALID');assert.deepEqual(foreign.errors.map(error=>error.code),['FOREIGN_FACTION_EXPORT']);
   assert.deepEqual(service.snapshot(),before);checks.push('owner DG export in Tau is FOREIGN before any load');
  }
 }
}
console.log(JSON.stringify({status:'PASS',checks:checks.length,results:checks}));
