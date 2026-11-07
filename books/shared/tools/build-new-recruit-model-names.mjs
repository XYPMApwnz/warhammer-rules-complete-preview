/** Offline import vocabulary from pinned BSData; never a factual/gameplay producer. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {parseProducerJSON} from '../source-refs-v2/producer-io.mjs';
import {importModelLabelCandidates,normalizeImportLabel as key} from '../roster-v2/import.mjs';
const root=fileURLToPath(new URL('../../../',import.meta.url));
export const supportedBooks=['adeptus-mechanicus','blood-angels','chaos-space-marines','dark-angels','emperors-children','space-marines','tau-empire','tyranids'];
const read=p=>parseProducerJSON(fs.readFileSync(path.join(root,p),'utf8'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export const exportedModelName=name=>name.split(/\s+w\/\s*/i)[0].trim();
const groupName=name=>name.replace(/^\d+(?:\s*[-–]\s*\d+)?\s+/,'').trim();
const names=e=>[e.data?.title,e.data?.name,...(e.aliases||[])].filter(Boolean);
const at=(o,p)=>p.slice(1).split('/').reduce((v,k)=>v?.[k],o);

function sourceRecords(raw){
 const records=[],byId=new Map();
 function visit(node,pointer,ancestors=[]){
  if(!node||typeof node!=='object')return;
  if(node.id){const r={node,pointer,ancestors};records.push(r);const a=byId.get(node.id)||[];a.push(r);byId.set(node.id,a);ancestors=[...ancestors,r];}
  for(const[k,v]of Object.entries(node))if(v&&typeof v==='object')
   Array.isArray(v)?v.forEach((item,i)=>visit(item,pointer+'/'+k+'/'+i,ancestors)):visit(v,pointer+'/'+k,ancestors);
 }
 visit(raw,'');return {records,byId};
}
export function deriveModelAliases({book,identityAliases,source,document,bytes,joins=[],sourceOwner,compositions=[]}){
 assert.deepEqual(source,JSON.parse(bytes),'Source graph differs from supplied pinned BSData bytes');
 const index=new Map(book.entities.map(e=>[e.id,e])),{records,byId}=sourceRecords(source);
 const profiles=book.entities.filter(e=>['PROFILE','MODEL_PROFILE'].includes(e.kind));
 const base=identityAliases.filter(a=>!a.bsdataEvidence),labels=e=>[...names(e),...base.filter(a=>a.canonicalId===e.id).flatMap(a=>a.labels)];
 const baseCompositions=compositions.map(c=>({...c,labels:c.labels.filter(label=>!c.bsdataModelNameLabels?.includes(label))}));
 const quantity=e=>e.data?.composition?.quantity||book.importBindings?.compositions?.find(c=>c.profileId===e.id)?.quantity||
  book.entities.find(c=>c.kind==='COMPOSITION_MEMBER'&&c.data.modelProfileId===e.id)?.data.quantity;
 const candidates=(unit,label)=>unit.data.profileIds?.length===1?[unit.data.profileIds[0]]:
  importModelLabelCandidates(profiles.filter(p=>p.parentId===unit.id&&unit.data.profileIds?.includes(p.id)),label,labels,quantity).map(p=>p.id);
 // Diagnostic choices offered by the existing importer, never an identity join.
 const offered=(unit,label)=>{
  const exact=candidates(unit,label);if(exact.length)return exact;
  const tokens=key(label).split(' ').filter(w=>!['of','the','a','and','with'].includes(w));
  return profiles.filter(p=>p.parentId===unit.id&&unit.data.profileIds?.includes(p.id)&&labels(p).some(n=>{
   const words=key(n).split(' '),overlap=tokens.filter(t=>words.includes(t)).length;
   return tokens.length&&(overlap===tokens.length||overlap===words.filter(w=>!['of','the','a','and','with'].includes(w)).length||overlap>=2&&overlap>=Math.ceil(tokens.length*.6));
  })).map(p=>p.id);
 };
 const declarations=new Map();
 for(const j of joins){
  assert(!declarations.has(j.sourceId),'Duplicate reviewed source MODEL join');
  const occurrences=byId.get(j.sourceId)||[];assert(occurrences.length,'Missing reviewed BSData record '+j.sourceId);
  assert(occurrences.every(r=>r.node.name===j.sourceName),'Reviewed BSData model/group name changed');
  assert(occurrences.every(r=>r.node.type==='model'||/\/selectionEntryGroups\/\d+$/.test(r.pointer)),'Reviewed join is not a BSData MODEL/group');
  const profile=index.get(j.canonicalId),e=index.get(j.evidence.entityId);
  assert(['PROFILE','MODEL_PROFILE'].includes(profile?.kind),'Reviewed join must target MODEL');
  assert.equal(e?.parentId,profile.parentId,'Foreign reviewed composition evidence');
  assert.equal(at(e.data,j.evidence.path),j.canonicalName,'Reviewed canonical composition changed');
  if(e.kind==='COMPOSITION_MEMBER'){
   const reviewed=compositions.find(c=>c.id===e.id&&c.ownerId===profile.parentId&&c.profileId===profile.id)?.reviewedMapping;
   assert(e.data.modelProfileId===profile.id||reviewed?.memberId===e.id&&reviewed.profileId===profile.id,'Unproven composition/profile join');
  }
  else assert.equal(e.id,profile.id,'Unproven PROFILE evidence');
  declarations.set(j.sourceId,j);
 }
 const census=[],outside=[],proposals=[],seenUnits=new Set();
 // Root selections are the catalogue's units. Imported catalogues may contain
 // identical copies; do not count them as additional physical unit/model kinds.
 const units=records.filter(r=>/\/(?:sharedSelectionEntries|selectionEntries)\/\d+$/.test(r.pointer)&&
  ['unit','model'].includes(r.node.type)&&!r.ancestors.some(a=>['unit','model'].includes(a.node.type))&&r.node.hidden!==true);
 for(const sourceUnit of units){
  if(seenUnits.has(sourceUnit.node.id))continue;seenUnits.add(sourceUnit.node.id);
  const owners=book.entities.filter(e=>e.kind==='DATASHEET'&&[...names(e),...base.filter(a=>a.canonicalId===e.id).flatMap(a=>a.labels)].some(n=>key(n)===key(sourceUnit.node.name)));
  if(owners.length!==1){outside.push({sourceId:sourceUnit.node.id,name:sourceUnit.node.name,reason:owners.length?'AMBIGUOUS_UNIT':'OUTSIDE_ADMITTED_BOOK'});continue;}
  const unit=owners[0];
  if(sourceOwner&&(unit.bookId||unit.ownerId||book.bookId)!==sourceOwner)continue;
  const children=records.filter(r=>r===sourceUnit||r.ancestors.includes(sourceUnit));
  const models=children.filter(r=>r.node.type==='model'),resolved=new Map(),resolvedEvidence=new Map();
  const proofFor=id=>{
   const c=book.entities.find(e=>e.kind==='COMPOSITION_MEMBER'&&e.parentId===unit.id&&e.data.modelProfileId===id);
   const p=index.get(id);return c?{entityId:c.id,path:'/name'}:{entityId:id,path:p.data.composition?'/composition/name':'/name'};
  };
  for(const model of models){
   const lineage=[model,...model.ancestors.slice().reverse().filter(a=>children.includes(a))];
   const declared=lineage.map(r=>declarations.get(r.node.id)).find(Boolean);
   let ids=[],modelEvidence;
   if(declared){assert.equal(index.get(declared.canonicalId).parentId,unit.id,'Foreign BSData source owner');ids=[declared.canonicalId];modelEvidence=declared.evidence;}
   else{
    // Only literal existing identities and already-defined singular inflection.
    // No stats/quantity matching, token overlap or guessed role/name aliases.
    const references=[...model.node.profiles||[],...(model.node.infoLinks||[]).flatMap(l=>(byId.get(l.targetId)||[]).map(r=>r.node))].filter(p=>p.typeName==='Unit');
    for(const label of [model.node.name.replace(/\s+w\/\s*/i,' with '),exportedModelName(model.node.name)]){
     const match=candidates(unit,label);if(match.length===1){ids=match;break;}
    }
    if(!ids.length){const linked=[...new Set(references.flatMap(p=>candidates(unit,p.name)))];if(linked.length===1)ids=linked;}
    if(!ids.length)for(const a of lineage.slice(1)){
     if(!/\/selectionEntryGroups\/\d+$/.test(a.pointer))continue;
     const match=candidates(unit,groupName(a.node.name));if(match.length===1){ids=match;break;}
    }
   }
   if(ids.length===1&&!modelEvidence){
    const members=baseCompositions.filter(c=>c.ownerId===unit.id&&c.profileId===ids[0]);
    if(members.length){
     const sourceLabels=[model.node.name,model.node.name.replace(/\s+w\/\s*/i,' with '),exportedModelName(model.node.name),
      ...lineage.slice(1).filter(r=>/\/selectionEntryGroups\/\d+$/.test(r.pointer)).map(r=>groupName(r.node.name))];
     const proofs=sourceLabels.map(label=>importModelLabelCandidates(members,label,c=>c.labels)).find(a=>a.length===1);
     if(proofs)modelEvidence=proofs[0].evidence;
     else if(members.length===1)modelEvidence=members[0].evidence;
     else ids=[]; // A common statline never proves a physical composition member.
    }else if(compositions.length)ids=[]; // Existing unproven MODEL mappings stay unproven.
    else modelEvidence=proofFor(ids[0]);
   }
   if(ids.length===1)resolvedEvidence.set(model,modelEvidence);
   resolved.set(model,ids);
  }
  const add=(record,label,ids,kind,evidence)=>{
   const before=candidates(unit,label),row={bookId:book.bookId,ownerId:unit.id,unit:unit.data.title||unit.data.name||unit.displayName,
    sourceId:record.node.id,sourceName:record.node.name,path:record.pointer,label,kind,beforeExact:before,before:offered(unit,label),
    beforeComposition:compositions.length?baseCompositions.filter(c=>c.ownerId===unit.id&&c.labels.some(n=>key(n)===key(label))).map(c=>c.id):null,
    candidateIds:ids,memberId:evidence?.entityId||null};census.push(row);
   if(ids.length===1)proposals.push({row,canonicalId:ids[0],evidence,bsdataEvidence:{document,sha256:sha(bytes),path:record.pointer,entryId:record.node.id,name:record.node.name,kind}});
  };
  for(const model of models)add(model,exportedModelName(model.node.name),resolved.get(model),'MODEL',resolvedEvidence.get(model));
  for(const group of children.filter(r=>/\/selectionEntryGroups\/\d+$/.test(r.pointer))){
   // Equipment submenus are not MODEL-composition groups. Require a named
   // source composition (or a reviewed group bridge), never a generic menu.
   if(!declarations.has(group.node.id)&&candidates(unit,groupName(group.node.name)).length!==1&&!/^\d+(?:[-–]\d+)?\s+\p{L}/u.test(group.node.name))continue;
   if(/^(?:up to|selections|special weapon|wargear|unit composition|models?$)/i.test(groupName(group.node.name)))continue;
   const descendants=models.filter(m=>m.ancestors.includes(group));if(!descendants.length)continue;
   const all=descendants.map(m=>resolved.get(m));
   const proofs=descendants.map(m=>resolvedEvidence.get(m)),sameProof=proofs.every(p=>p&&JSON.stringify(p)===JSON.stringify(proofs[0]));
   const ids=all.every(a=>a.length===1)&&sameProof?[...new Set(all.flat())]:[];
   add(group,groupName(group.node.name),ids,'MODEL_GROUP',proofs[0]);
  }
 }
 // A shared shortened label is never forced onto one of several real models.
 const collision=new Map(),physicalTargets=new Map(),unknownModels=new Set();
 for(const row of census){const k=row.ownerId+'\0'+key(row.label),set=collision.get(k)||new Set();for(const id of [...row.beforeExact,...row.candidateIds])set.add(id);collision.set(k,set);
  const members=physicalTargets.get(k)||new Set();if(row.candidateIds.length===1&&row.memberId)members.add(row.candidateIds[0]+'\0'+row.memberId);physicalTargets.set(k,members);
  if(row.kind==='MODEL'&&row.candidateIds.length!==1)unknownModels.add(k);
 }
 const identity=[],seen=new Set();
 for(const p of proposals){const ids=collision.get(p.row.ownerId+'\0'+key(p.row.label));
  if(ids.size!==1||unknownModels.has(p.row.ownerId+'\0'+key(p.row.label))||physicalTargets.get(p.row.ownerId+'\0'+key(p.row.label)).size!==1||p.row.beforeExact.length===1&&(p.row.beforeComposition===null||p.row.beforeComposition.length===1))continue;
  const k=p.canonicalId+'\0'+p.row.label+'\0'+p.bsdataEvidence.path;if(seen.has(k))continue;seen.add(k);
  identity.push({canonicalId:p.canonicalId,labels:[p.row.label],evidence:p.evidence,bsdataEvidence:p.bsdataEvidence});
 }
 for(const row of census){const k=row.ownerId+'\0'+key(row.label),idSet=collision.get(k);
  const added=identity.some(a=>a.canonicalId===[...idSet][0]&&a.labels.some(n=>key(n)===key(row.label)));
  row.after=idSet.size===1&&added?[...idSet]:row.before;
  row.afterComposition=added?[row.memberId]:row.beforeComposition;
  row.status=physicalTargets.get(k).size>1?'AMBIGUOUS':
   (row.beforeExact.length===1||added)&&(row.beforeComposition===null||row.beforeComposition.length===1||added)?'RESOLVED':idSet.size>1?'AMBIGUOUS':'NOT_PROVEN';}
 return {identityAliases:identity,census,outside};
}

export async function buildModelNames(bookId){
 assert(supportedBooks.includes(bookId),'No pinned BSData snapshot for this book');
 const book=read(`books/${bookId}/v2/generated/${bookId==='adeptus-mechanicus'?'roster-runtime':'roster-import'}.json`);
 const metadata=bookId==='adeptus-mechanicus'?{identityAliases:read(`books/${bookId}/v2/roster-import-aliases.json`).aliases}:bookId==='chaos-space-marines'?
  (await import('../../chaos-space-marines/v2/roster-import-bindings.mjs')).buildImportBindings(book,
   {modelNames:{schema:'new-recruit-model-aliases/v1',identityAliases:[]}}):book.importBindings;
 const owners=new Set(book.entities.filter(e=>e.kind==='DATASHEET').map(e=>e.bookId||e.ownerId||book.bookId)),all={identityAliases:[],census:[],outside:[]};
 for(const sourceBook of supportedBooks.filter(b=>owners.has(b))){
  const document=`books/${sourceBook}/sources/bsdata-${sourceBook}-11e.json`,bytes=fs.readFileSync(path.join(root,document));
  const joins=read(`books/${sourceBook}/v2/model-name-source-bindings.json`).joins;
  // Inherited joins apply only if the canonical MODEL is admitted in this book.
  const ids=new Set(book.entities.map(e=>e.id));
  const result=deriveModelAliases({book,identityAliases:metadata.identityAliases,compositions:metadata.compositions||[],source:JSON.parse(bytes),document,bytes,sourceOwner:sourceBook,joins:joins.filter(j=>ids.has(j.canonicalId))});
  // Supplements already inherit the SM import vocabulary through their existing
  // producer. Keep its declarations/data in one owner, while auditing all units.
  all.census.push(...result.census);all.outside.push(...result.outside);
  if(sourceBook===bookId)all.identityAliases.push(...result.identityAliases);
 }
 return {schema:'new-recruit-model-aliases/v1',bookId,identityAliases:all.identityAliases,census:all.census,outside:all.outside};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===fs.realpathSync(process.argv[1])){
 const bookId=process.argv.find(a=>a.startsWith('--book='))?.slice(7);assert(supportedBooks.includes(bookId),'Use --book=<canonical book id>');
 const result=await buildModelNames(bookId),file=path.join(root,`books/${bookId}/v2/model-name-aliases.json`);
 const data=JSON.stringify({schema:result.schema,bookId,identityAliases:result.identityAliases},null,2)+'\n';
 if(process.argv.includes('--check'))assert.equal(fs.readFileSync(file,'utf8'),data,'Stale BSData MODEL import aliases');
 else {assert(process.argv.includes('--write'),'Use --write or --check');fs.writeFileSync(file,data);}
 const out=process.argv.find(a=>a.startsWith('--report='))?.slice(9);if(out)fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({status:'PASS',bookId,aliases:result.identityAliases.length,models:result.census.filter(r=>r.kind==='MODEL').length,ambiguous:result.census.filter(r=>r.status==='AMBIGUOUS').length,outside:result.outside.length}));
}
