/** Core-only publication boundary over the existing lossless source decoder. */
import assert from 'node:assert/strict';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {parseProducerJSON,prepareSourceProducer} from '../../books/shared/source-refs-v2/producer-io.mjs';
import {createEffectiveCoreCatalog} from '../../books/core-rules/content/effective-core-catalog.mjs';
import {buildGlossary} from '../../books/shared/army-book-app-v2/glossary.mjs';
import {readCoreTransitionFile} from './core-transition-history.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url));
const candidateFile='books/core-rules/sources/waha-core-2026-11-11/core-rules.candidate.v1.json';
const candidateSHA='a91415eaf2f67438b6326585752dba4fbd8eee0db52dafe5a7b4abf5347b4109';
const historicalFile='books/core-rules/sources/core-importer-baselines/7b15dc36.v1.json';
const historicalSHA='075d31795979cbe8feb7ac999d013134a4fe09fc40dd4dbddb0d8d97e83196c0';
export const coreBoundaryBaseline='8ab6787ce503171d852a86f52ffb20467b315959';
export const byteHash=bytes=>createHash('sha256').update(bytes).digest('hex');
export const valueHash=value=>byteHash(JSON.stringify(value));
const candidateBytes=readCoreTransitionFile(candidateFile);
assert.equal(byteHash(candidateBytes),candidateSHA,'The reviewed Task A Core identity authority changed');
const candidate=JSON.parse(candidateBytes);
const historicalBytes=readCoreTransitionFile(historicalFile);
assert.equal(byteHash(historicalBytes),historicalSHA,'Historical Core identity authority changed');
const historical=JSON.parse(historicalBytes);
const publicationBaselineBytes=readCoreTransitionFile('tests/fixtures/core-switch-publication-baseline.v1.json');
assert.equal(byteHash(publicationBaselineBytes),'36143cbc5ff526df4191bb11e7c94336a23ecfc6d4ebd264e7bea0706d691008','The immutable non-Core publication baseline changed');
const publicationBaseline=JSON.parse(publicationBaselineBytes);
assert.equal(publicationBaseline.schema,'core-switch-publication-baseline/v1');
assert.equal(publicationBaseline.baseline,coreBoundaryBaseline);assert.equal(publicationBaseline.candidateSha256,candidateSHA);
const records=new Map(candidate.records.map(record=>[record.id,record]));
const oldIds=new Set(historical.view.records.map(record=>record.id));
assert.equal(records.size,385);assert.equal(oldIds.size,371);
for(const id of oldIds)assert(records.has(id),'A previously accepted Core identity was lost: '+id);

/** The codec, not a deletion of provenance fields, defines the comparison view. */
export function decodeSourceJSON(bytes,{sourceRoot=root}={}){
 if(path.resolve(sourceRoot)===path.resolve(root))return parseProducerJSON(bytes);
 const module=pathToFileURL(path.join(sourceRoot,'books/shared/source-refs-v2/producer-io.mjs')).href;
 const worker="import fs from 'node:fs';import {parseProducerJSON} from "+JSON.stringify(module)+";process.stdout.write(JSON.stringify(parseProducerJSON(fs.readFileSync(0,'utf8'))));";
 return JSON.parse(execFileSync(process.execPath,['--input-type=module','-e',worker],{
  cwd:sourceRoot,input:bytes,maxBuffer:128*1024*1024,encoding:'utf8'
 }));
}

let currentCatalog;
const currentCoreCatalog=()=>currentCatalog??=createEffectiveCoreCatalog();
function assertDomain(value,core,label){
 if(value.domain!==undefined)assert.equal(value.domain==='CORE',core,'CORE_DOMAIN_ID_MISMATCH: '+label);
}

export function partitionCorePublication(payload,{stage='active',historical=false,coreCatalog}={}){
 assert(['baseline','active'].includes(stage));
 assert.equal(payload.schema,'army-book-app-v2/presentation');
 assert(Array.isArray(payload.cards)&&Array.isArray(payload.factManifest)&&Array.isArray(payload.glossary?.entries));
 const authority=historical?records:new Map((coreCatalog||currentCoreCatalog()).records.map(record=>[record.id,record]));
 const isCoreId=id=>typeof id==='string'&&authority.has(id);
 const expectedIds=stage==='baseline'?oldIds:new Set(authority.keys()),seen=new Set();
 for(const card of payload.cards){
  const core=isCoreId(card.id);
  assert.equal(card.domain==='CORE',core,'CORE_DOMAIN_ID_MISMATCH: card '+card.id);
  if(core){
   assert(expectedIds.has(card.id),'UNEXPECTED_CORE_CARD: '+card.id);
   assert(!seen.has(card.id),'DUPLICATE_CORE_CARD: '+card.id);seen.add(card.id);
   assert.equal(card.kind,'CORE_'+authority.get(card.id).recordType,'CORE_KIND_ID_MISMATCH: '+card.id);
  }else assert(!String(card.kind).startsWith('CORE_'),'UNRECORDED_CORE_CARD: '+card.id);
 }
 assert.deepEqual([...seen].sort(),[...expectedIds].sort(),'The exact accepted Core card identity set changed');
 const coreCards=payload.cards.filter(card=>isCoreId(card.id)),nonCoreCards=payload.cards.filter(card=>!isCoreId(card.id));
 const coreFacts=[],nonCoreFacts=[];
 for(const fact of payload.factManifest){
  const entityCore=isCoreId(fact.entityId),cardCore=isCoreId(fact.cardId),core=entityCore||cardCore;
  assert.equal(entityCore,cardCore,'CORE_FACT_OWNER_MISMATCH: '+fact.id);
  assertDomain(fact,core,'fact '+fact.id);
  (core?coreFacts:nonCoreFacts).push(fact);
 }
 const coreGlossary=[],nonCoreGlossary=[],glossaryIds=new Set();
 for(const entry of payload.glossary.entries){
  const core=isCoreId(entry.targetId);
  assert.equal(String(entry.category).startsWith('CORE_'),core,'CORE_GLOSSARY_ID_MISMATCH: '+entry.targetId);
  assertDomain(entry,core,'glossary '+entry.targetId);
  if(core){
   assert(expectedIds.has(entry.targetId),'UNEXPECTED_CORE_GLOSSARY_TARGET: '+entry.targetId);
   assert(!glossaryIds.has(entry.targetId),'DUPLICATE_CORE_GLOSSARY_TARGET: '+entry.targetId);glossaryIds.add(entry.targetId);
   assert.equal(entry.category,'CORE_'+authority.get(entry.targetId).recordType,'CORE_GLOSSARY_KIND_MISMATCH: '+entry.targetId);
  }
  (core?coreGlossary:nonCoreGlossary).push(entry);
 }
 assert.deepEqual([...glossaryIds].sort(),[...expectedIds].sort(),'The exact Core glossary target set changed');
 const nonCore=structuredClone(payload);
 nonCore.cards=structuredClone(nonCoreCards);nonCore.factManifest=structuredClone(nonCoreFacts);nonCore.glossary.entries=structuredClone(nonCoreGlossary);
 const rest=structuredClone(payload);
 delete rest.cards;delete rest.factManifest;delete rest.relatedRules;delete rest.glossary.entries;
 return {nonCore,core:{cards:coreCards,factManifest:coreFacts,glossaryEntries:coreGlossary},relatedRules:payload.relatedRules,
  nonCoreCards,nonCoreFactManifest:nonCoreFacts,glossaryOutsideCore:nonCoreGlossary,rest,
  counts:{coreCards:coreCards.length,coreFacts:coreFacts.length,coreGlossary:coreGlossary.length,
   nonCoreCards:nonCoreCards.length,nonCoreFacts:nonCoreFacts.length,nonCoreGlossary:nonCoreGlossary.length}};
}

export function publicationBoundaryHashes(payload,options={}){
 const parts=partitionCorePublication(payload,options);
 return {counts:parts.counts,hashes:Object.fromEntries(['nonCore','core','relatedRules','nonCoreCards','nonCoreFactManifest','glossaryOutsideCore','rest'].map(key=>[key,valueHash(parts[key])]))};
}

/** Frozen transition evidence belongs to its reviewed historical publication. */
export function assertHistoricalCorePublicationSnapshot(payload,expected,{stage='active'}={}){
 assert(expected,'Missing explicit Core/non-Core publication expectation');
 assert.equal(expected.coreAcceptance,'ACCEPTED','The new Core publication must be proven before its exact hash is accepted');
 assert.equal(expected.baseline,coreBoundaryBaseline);
 assert.equal(expected.candidateSha256,candidateSHA);
 assert.equal(expected.bookId,payload.book.id,'The publication expectation belongs to another book');
 const before=publicationBaseline.books[payload.book.id];assert(before,'Missing immutable publication baseline: '+payload.book.id);
 const current=publicationBoundaryHashes(payload,{stage,historical:true});
 for(const part of ['nonCore','relatedRules','nonCoreCards','nonCoreFactManifest','glossaryOutsideCore','rest']){
  assert.equal(expected.hashes[part],before.hashes[part],'The strict non-Core baseline cannot be repinned: '+payload.book.id+' / '+part);
  assert.equal(current.hashes[part],expected.hashes[part],'NON_CORE_PUBLICATION_CHANGED: '+payload.book.id+' / '+part);
 }
 assert.equal(current.hashes.core,expected.hashes.core,'CORE_PUBLICATION_CHANGED_WITHOUT_REVIEW: '+payload.book.id);
 return current;
}

/** Live books may evolve; Core ownership and the current Core authority may not drift. */
export function assertCorePublicationSnapshot(payload,_historicalExpectation,{coreCatalog=currentCoreCatalog()}={}){
 const parts=partitionCorePublication(payload,{coreCatalog});
 const byId=new Map(coreCatalog.records.map(record=>[record.id,record]));
 // Independent source-value checks prevent a shared projector bug from making
 // both the publication and its projected expectation agree on invented text.
 for(const card of parts.core.cards){
  const record=byId.get(card.id),prefix='CORE_PUBLICATION_DOES_NOT_MATCH_CURRENT_CATALOG: '+card.id;
  assert.equal(card.title,record.title,prefix+' / title');
  for(const field of card.fields){
   assert.equal(field.source?.entityId,record.id,prefix+' / field owner');
   assert.equal(typeof field.source?.path,'string',prefix+' / field source path');
   const value=field.source.path.slice(1).split('/').map(part=>part.replaceAll('~1','/').replaceAll('~0','~')).reduce((item,key)=>item?.[key],record);
   assert.deepEqual(field.value,value,prefix+' / '+field.source.path);
  }
  const paths=new Set(card.fields.map(field=>field.source.path));
  assert(paths.has('/title'),prefix+' / missing title');
  if(record.code)assert(paths.has(record.sourceCode&&record.sourceCode!==record.code?'/sourceCode':'/code'),prefix+' / missing source code');
  if(!record.relationships?.sourceRuleId&&record.semanticContent!=null&&record.state!=='SOURCE_CONFLICT')assert(paths.has('/semanticContent'),prefix+' / missing rule text');
 }
 for(const entry of parts.core.glossaryEntries)assert.equal(entry.label,byId.get(entry.targetId).title,'CORE_PUBLICATION_DOES_NOT_MATCH_CURRENT_CATALOG: glossary '+entry.targetId);
 const projected=prepareSourceProducer(buildGlossary({model:{entities:[]},coreCatalog}));
 const message='CORE_PUBLICATION_DOES_NOT_MATCH_CURRENT_CATALOG: '+payload.book.id;
 assert.deepEqual(parts.core.cards,projected.coreCards,message+' / cards');
 assert.deepEqual(parts.core.glossaryEntries,projected.index.entries,message+' / glossary');
 // Existing publishers append Core cards and glossary entries, not the optional
 // Core fact manifest. Any published fact still requires its exact current owner.
 const expectedFacts=new Map(projected.coreFactManifest.map(fact=>[fact.id,fact])),seen=new Set();
 for(const fact of parts.core.factManifest){
  assert(!seen.has(fact.id),'DUPLICATE_CORE_FACT: '+fact.id);seen.add(fact.id);
  assert.deepEqual(fact,expectedFacts.get(fact.id),message+' / fact '+fact.id);
 }
 return publicationBoundaryHashes(payload,{coreCatalog});
}

function firstDifference(before,after,parts=[]){
 if(JSON.stringify(before)===JSON.stringify(after))return null;
 if(!before||!after||typeof before!=='object'||typeof after!=='object')return{path:parts,before,after};
 for(const key of new Set([...Object.keys(before),...Object.keys(after)])){
  const result=firstDifference(before[key],after[key],[...parts,key]);if(result)return result;
 }
 return{path:parts,before,after};
}

export function compareCorePublications(before,after){
 const old=partitionCorePublication(before,{stage:'baseline',historical:true}),current=partitionCorePublication(after,{stage:'active',historical:true});
 const comparisons=[];
 for(const name of ['nonCore','relatedRules','nonCoreCards','nonCoreFactManifest','glossaryOutsideCore','rest']){
  const beforeSha256=valueHash(old[name]),afterSha256=valueHash(current[name]),difference=firstDifference(old[name],current[name]);
  comparisons.push({name,beforeSha256,afterSha256,status:difference?'FAIL':'PASS',...(difference?{difference}:{} )});
 }
 return {status:comparisons.every(row=>row.status==='PASS')?'PASS':'FAIL',beforeCounts:old.counts,afterCounts:current.counts,
  unchangedParts:comparisons,beforeCoreSha256:valueHash(old.core),afterCoreSha256:valueHash(current.core)};
}

export function corePublicationAuthority(){return{baseline:coreBoundaryBaseline,candidateSha256:candidateSHA,oldCoreIds:371,activeCoreIds:385};}
export function publicationBaselineFor(bookId){return structuredClone(publicationBaseline.books[bookId]);}
export function publicationBaselineForFile(file){
 const entry=Object.entries(publicationBaseline.books).find(([,value])=>value.file===file);
 return entry?{bookId:entry[0],...structuredClone(entry[1])}:null;
}
