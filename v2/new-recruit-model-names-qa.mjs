/** Source-backed vocabulary controls; independent owner-authored import cases. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {buildModelNames,deriveModelAliases,exportedModelName,supportedBooks} from '../books/shared/tools/build-new-recruit-model-names.mjs';
const selected=process.argv.find(a=>a.startsWith('--book='))?.slice(7);assert(supportedBooks.includes(selected));
const read=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(url))});globalThis.fetch=read;
const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/new-recruit-model-names.json',import.meta.url)));
const derived=await buildModelNames(selected),data=JSON.parse(fs.readFileSync(new URL(`../books/${selected}/v2/model-name-aliases.json`,import.meta.url)));
assert.deepEqual(data.identityAliases,derived.identityAliases,'All derived aliases and source evidence are deterministic');
let checked=0;
for(const alias of data.identityAliases){
 const proof=alias.bsdataEvidence,bytes=fs.readFileSync(new URL('../'+proof.document,import.meta.url)),source=JSON.parse(bytes);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),proof.sha256,'Pinned vocabulary bytes');
 const occurrence=proof.path.slice(1).split('/').reduce((o,k)=>o?.[k],source);
 assert.equal(occurrence.id,proof.entryId);assert.equal(occurrence.name,proof.name);
 assert.deepEqual(alias.labels,[proof.kind==='MODEL'?exportedModelName(proof.name):proof.name.replace(/^\d+(?:\s*[-–]\s*\d+)?\s+/,'').trim()]);
 assert(derived.census.some(r=>r.after.length===1&&r.after[0]===alias.canonicalId&&r.path===proof.path&&r.label===alias.labels[0]));checked++;
}
const entry=selected==='adeptus-mechanicus'?'roster-runtime':'roster-boot';
const service=await (await import(`../books/${selected}/v2/${entry}.mjs`)).createBrowserRoster({fetch:read});
const cases=fixture.cases.filter(c=>c.bookId===selected);
// The same admitted SM identities must receive the same vocabulary in supplements.
if(['blood-angels','dark-angels'].includes(selected))for(const c of fixture.cases.filter(c=>c.bookId==='space-marines'))cases.push({...c,id:selected+'/'+c.id});
const results=[];
for(const c of cases){
 const result=service.import(c.text,{}, {replaceExisting:true});
 assert.equal(result.status,c.expected,c.id+': '+JSON.stringify(result.needsBindings||result.errors));
 assert.deepEqual(result.errors,[]);
 if(c.expected==='NEEDS_BINDINGS'){
  assert.equal(result.needsBindings.length,1);const need=result.needsBindings[0];
  assert.equal(need.kind,'PROFILE');assert.equal(need.rawLabel,'Company Veteran');
  assert.deepEqual([...need.candidateIds].sort(),['model-sm-58664b5f9e9544e8','model-sm-bc24e416aca24714'].sort());
 }else{
  assert.equal(result.needsBindings.length,0);
  assert.deepEqual(service.state.units[0].modelRows.map(row=>row.canonicalProfileId),c.expectedProfiles,'Exact owner-authored MODEL identities');
  if(c.expectedMembers)assert.deepEqual(service.state.units[0].modelRows.map(row=>row.compositionMemberId),c.expectedMembers,'Exact physical composition member, including shared statlines');
  if(c.noImplicitGear)assert(service.state.units.every(unit=>unit.selections.length===0&&unit.modelRows.every(row=>row.selections.length===0)),'An equipment-named MODEL never selects that equipment');
  const snapshot=JSON.stringify(service.snapshot());service.load(service.snapshot());assert.equal(JSON.stringify(service.snapshot()),snapshot,'Repeated load retains physical identities and choices');
 }
 results.push({id:c.id,status:result.status});
}
if(selected==='chaos-space-marines'){
 const meta=JSON.parse(fs.readFileSync(new URL('./fixtures/new-recruit-model-names-tournament-csm.json',import.meta.url)));
 assert.equal(meta.classification,'DERIVED_FROM_REAL_TOURNAMENT_LIST');
 const bytes=fs.readFileSync(new URL('./fixtures/'+meta.file,import.meta.url));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),meta.sha256);
 const result=service.import(bytes.toString('utf8'),{}, {replaceExisting:true});
 assert.equal(result.status,'READY',JSON.stringify(result.needsBindings||result.errors));assert.deepEqual(result.needsBindings,[]);
 assert.equal(service.state.units.length,13);results.push({id:'derived-tournament-5_13',status:result.status});
}
// A real two-MODEL collision cannot be resolved by trimming the gear suffix.
const book={bookId:'fixture',entities:[
 {id:'unit',kind:'DATASHEET',data:{name:'Test Unit',profileIds:['a','b']}},
 ...['a','b'].map((id,i)=>({id,kind:'PROFILE',parentId:'unit',data:{name:'Veteran with '+['Rifle','Cannon'][i],composition:{name:'Veteran with '+['Rifle','Cannon'][i],quantity:{min:1,max:1}}}}))]};
const source={catalogue:{sharedSelectionEntries:[{id:'source-unit',name:'Test Unit',type:'unit',selectionEntries:[
 {id:'rifle',type:'model',name:'Veteran w/ Rifle'},{id:'cannon',type:'model',name:'Veteran w/ Cannon'}]}]}};
const input={book,identityAliases:[],source,document:'fixture.json',bytes:Buffer.from(JSON.stringify(source))},before=JSON.stringify(input);
const ambiguous=deriveModelAliases(input);assert.deepEqual(ambiguous.identityAliases,[]);assert(ambiguous.census.every(r=>r.status==='AMBIGUOUS'));assert.equal(JSON.stringify(input),before);
const partialSource=structuredClone(source);partialSource.catalogue.sharedSelectionEntries[0].selectionEntries[1].name='Veteran w/ Unrecorded weapon';
assert.deepEqual(deriveModelAliases({...input,source:partialSource,bytes:Buffer.from(JSON.stringify(partialSource))}).identityAliases,[],'One proven source occurrence cannot conceal an unproven same-name MODEL');
assert.throws(()=>deriveModelAliases({...input,source:partialSource}),/Source graph differs/,'Source evidence must match its actual captured bytes');
// Two physical composition members may share ONE statline; that is still not
// proof that a shortened source name identifies one physical MODEL member.
const common=structuredClone(book);common.entities=common.entities.filter(e=>e.id!=='b');common.entities[0].data.profileIds=['a'];
const compositions=['Rifle','Cannon'].map((name,i)=>({id:'member-'+i,ownerId:'unit',profileId:'a',quantity:{min:1,max:1},labels:['Veteran with '+name],evidence:{entityId:'member-'+i,path:'/name'}}));
common.entities.push(...compositions.map(c=>({id:c.id,kind:'COMPOSITION_MEMBER',parentId:'unit',data:{name:c.labels[0],modelProfileId:'a'}})));
const commonResult=deriveModelAliases({...input,book:common,compositions});
assert.deepEqual(commonResult.identityAliases,[],'Shared statline must not merge physical members');
assert(commonResult.census.every(row=>row.status==='AMBIGUOUS'));
const join={sourceId:'rifle',sourceName:'Veteran w/ Rifle',canonicalId:'a',evidence:{entityId:'a',path:'/composition/name'},canonicalName:'Veteran with Rifle'};
for(const change of [j=>{j.sourceId='missing';},j=>{j.sourceName='changed';},j=>{j.canonicalName='changed';},j=>{j.canonicalId='unit';},j=>{j.evidence.entityId='unit';}]){
 const invalid=structuredClone(join);change(invalid);assert.throws(()=>deriveModelAliases({...input,joins:[invalid]}));
}
assert.throws(()=>deriveModelAliases({...input,joins:[join,join]}));
assert.equal(exportedModelName('Veteran w/ Rifle'),'Veteran');assert.equal(exportedModelName('Veteran w/Rifle'),'Veteran');
console.log(JSON.stringify({status:'PASS',bookId:selected,sourceOccurrences:checked,negativeControls:10,cases:results}));
