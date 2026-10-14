/** Glossary views of the existing Army Book V2 factual owners.
 * No source parsing, rule interpretation or legacy Army Book projection lives here.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {buildFactualV2} from '../../../books/death-guard/v2/build.mjs';
import {buildRuleContractV2} from '../../../books/death-guard/v2/rule-contract-build.mjs';
import {buildApp as buildDGApp,readAppInputs as readDGAppInputs} from '../../../books/death-guard/v2/app-build.mjs';
import {resolveOwnedFact} from '../../../books/death-guard/v2/mfm-boundary.mjs';
import {buildApp as buildAdMechApp,readAppInputs as readAdMechAppInputs} from '../../../books/adeptus-mechanicus/v2/app-build.mjs';
import {buildCSMContracts} from '../../../books/chaos-space-marines/v2/rule-contract-build.mjs';
import {buildApp as buildCSMApp} from '../../../books/chaos-space-marines/v2/app-build.mjs';
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=relative=>JSON.parse(fs.readFileSync(path.join(repo,relative),'utf8'));
const sameProjection=(actual,expected,message)=>assert.ok(JSON.stringify(actual)===JSON.stringify(expected),message);
export const V2_ARMY_BOOK_IDS=Object.freeze(['death-guard','adeptus-mechanicus','chaos-space-marines']);
export const V2_FACTUAL_INTERFACES=Object.freeze({
  'death-guard':'books/death-guard/v2/build.mjs#buildFactualV2().effective',
  'adeptus-mechanicus':'books/adeptus-mechanicus/v2/build.py#build().effective',
  'chaos-space-marines':'books/chaos-space-marines/v2/build.py#build().effective'
});

function pythonRuntime() {
  if(process.env.PYTHON)return process.env.PYTHON;
  const bundled=process.env.USERPROFILE&&path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe');
  return bundled&&fs.existsSync(bundled)?bundled:'python';
}

/** Existing producers check their own accepted inputs and generated effective outputs.
 * A failed/missing Python dependency is a build blocker, never permission to use stale data.
 */
export function assertV2ArmyFactualFreshness({python=pythonRuntime()}={}) {
  const dg=buildFactualV2().effective;
  sameProjection(read('books/death-guard/v2/generated/effective.json'),dg,'Stale Death Guard effective factual output');
  for(const bookId of V2_ARMY_BOOK_IDS.slice(1)) {
    try {
      execFileSync(python,['-B',`books/${bookId}/v2/build.py`,'--check'],{
        cwd:repo,encoding:'utf8',env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',PYTHONIOENCODING:'utf-8'},maxBuffer:16*1024*1024
      });
    } catch(error) {
      throw new Error(`${bookId}: authoritative factual producer check failed: ${error.stderr||error.stdout||error.message}`,{cause:error});
    }
  }
  return dg;
}

/** Compare fresh book views with the deployed Army Book projections, including values,
 * canonical ownership, field addresses and source references. Generated views never own facts.
 */
export function assertV2ArmyBookParity(models,{published=bookId=>read(`books/${bookId}/v2/generated/app-presentation.json`)}={}) {
  assert.deepEqual(models.map(model=>model.book.id),V2_ARMY_BOOK_IDS,'Missing/extra/reordered V2 Army Book owner');
  for(const model of models) {
    const entities=new Map(model.entities.map(entity=>[entity.id,entity]));
    assert.equal(entities.size,model.entities.length,`${model.book.id}: duplicate canonical factual owner`);
    for(const field of model.appPayload.factManifest.filter(field=>field.ownerType==='CANONICAL_V2')) {
      const owner=entities.get(field.entityId);
      assert.ok(owner,`${model.book.id}: Army Book field has no canonical factual owner ${field.entityId}`);
      const physicalOwner=field.path[0]==='displayName'&&owner.ownerId?owner.ownerId:
        owner.parentId||(owner.ownerId!==model.book.id?owner.ownerId:null)||owner.id;
      assert.equal(field.contextId,physicalOwner,`${model.book.id}: Army Book/canonical ownership mismatch ${field.id}`);
      const roots=['displayName','qualifications'].includes(field.path[0])?owner:owner.data;
      const value=field.path.reduce((node,key)=>node?.[key],roots);
      assert.deepEqual(field.value,value,`${model.book.id}: Army Book/canonical factual mismatch ${field.id}`);
    }
    sameProjection(published(model.book.id),model.appPayload,`${model.book.id}: stale Army Book presentation; rebuild its owner before Glossary`);
  }
  return true;
}

function mfmIdentityBindings(model,{factualModel}={}) {
  const catalog=createEffectiveMfmCatalog().catalog,bookId=model.book.id;
  const entities=new Map(model.entities.map(entity=>[entity.id,entity])),bindings={};
  const add=(recordId,entityId)=>{
    assert.ok(entities.has(entityId),`${bookId}: unresolved MFM/Army canonical identity ${entityId}`);
    assert.ok(!bindings[recordId]||bindings[recordId]===entityId,`${bookId}: ambiguous MFM/Army canonical binding ${recordId}`);
    bindings[recordId]=entityId;
  };
  for(const reference of catalog.unitReferences.filter(record=>record.armyBinding?.armyBookId===bookId)) {
    const id=reference.armyBinding.armyUnitId;if(!entities.has(id))continue;
    add(reference.id,id);
    for(const points of catalog.unitPointRecords.filter(record=>record.unitReferenceId===reference.id))add(points.id,id);
    for(const paid of catalog.paidUpgradeRecords.filter(record=>record.unitReferenceId===reference.id))add(paid.id,id);
  }
  if(bookId==='death-guard') {
    for(const key of ['unitBindings','detachmentBindings','enhancementBindings','paidUpgradeBindings'])for(const binding of factualModel.mfm[key])add(binding.mfmRecordId,binding.entityId);
  } else if(bookId==='adeptus-mechanicus') {
    for(const record of catalog.detachments.filter(record=>record.armyBookId===bookId))add(record.id,record.armyDetachmentId);
    for(const binding of read('books/adeptus-mechanicus/v2/app-mfm-bindings.json').enhancementBindings)add(binding.mfmRecordId,binding.entityId);
  } else {
    const capture=read('books/chaos-space-marines/sources/official-mfm-v1.5.json');
    const captured=read('books/chaos-space-marines/v2/capture-bindings.json');
    const identities=new Map(read('books/chaos-space-marines/v2/identity-bindings.json').bindings.map(binding=>[binding.sourceEntityId,binding.id]));
    const locate=record=>{
      const locator=record.provenance.sourceLocator;
      const title=locator.detachmentSourceTitle||locator.sourceTitle;
      const matches=capture.detachments.map((row,index)=>({row,index})).filter(item=>item.row.title===title);
      assert.equal(matches.length,1,'Unresolved exact enrolled MFM source occurrence');
      const {row,index}=matches[0],binding=captured.detachments[index];
      assert.ok(binding,'Missing reviewed source occurrence identity binding');
      if(locator.partition==='detachments')return identities.get(binding.ownerSourceId);
      const occurrences=row.enhancements.map((enhancement,index)=>({enhancement,index})).filter(item=>item.enhancement.title===locator.sourceTitle);
      assert.equal(occurrences.length,1,'Unresolved exact enrolled Enhancement source occurrence');
      return identities.get(binding.enhancementSourceIds[occurrences[0].index]);
    };
    for(const record of [...catalog.detachments,...catalog.enhancementCosts].filter(record=>record.armyBookId===bookId))add(record.id,locate(record));
  }
  return bindings;
}

export function loadV2ArmyModels(options={}) {
  const dg=assertV2ArmyFactualFreshness(options);
  const dgContract=buildRuleContractV2();
  sameProjection(read('books/death-guard/v2/generated/rule-contract-effective.json'),dgContract,'Stale Death Guard contract projection');
  const dgInputs=readDGAppInputs(),ids=new Set();
  for(const key of ['unitBindings','detachmentBindings','enhancementBindings','paidUpgradeBindings'])for(const binding of dgContract.mfm[key])ids.add(binding.mfmRecordId);
  for(const relation of dgContract.mfm.relations)if(relation.mfmRecordId)ids.add(relation.mfmRecordId);
  const records=new Map();
  for(const id of ids){const record=resolveOwnedFact(id);records.set(id,record);for(const child of [...record.qualifierIds||[],...record.enhancementCostIds||[]])ids.add(child);}
  const am=read('books/adeptus-mechanicus/v2/generated/effective.json'),amInputs=readAdMechAppInputs();
  const csm=read('books/chaos-space-marines/v2/generated/effective.json'),csmBuilt=buildCSMContracts({facts:csm});
  const models=[
    {book:{id:'death-guard'},entities:dg.entities,appPayload:buildDGApp({...dgInputs,model:dgContract,records})},
    {book:{id:'adeptus-mechanicus'},entities:am.entities,appPayload:buildAdMechApp(amInputs)},
    {book:{id:'chaos-space-marines'},entities:csm.entities,appPayload:buildCSMApp(csmBuilt,{relatedRules:read('books/chaos-space-marines/v2/generated/app-presentation.json').relatedRules})}
  ].map(model=>({...model,factualInterface:V2_FACTUAL_INTERFACES[model.book.id],mfmIdentityBindings:mfmIdentityBindings(model,{factualModel:dg})}));
  assertV2ArmyBookParity(models);
  return models;
}
