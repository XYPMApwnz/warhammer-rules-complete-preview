/** Independent QA source view: immutable captured text plus already accepted
 * official text overlays. This does not read generated/application wording. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {applyOverlays} from '../../books/death-guard/v2/overlay-engine.mjs';

const sha=bytes=>createHash('sha256').update(bytes).digest('hex').toUpperCase();
const at=(value,parts)=>parts.reduce((item,key)=>item?.[key],value);

/** The caller names the accepted capture and its native enrollment ledger.
 * Only source sections/Enhancements used as rule-text inputs are projected;
 * Stratagems, normalized army components and runtime entities are untouched. */
export function readAcceptedSourceCorpus(root,corpusPath,enrollmentPath){
  const read=relative=>{
    const resolved=path.resolve(root,relative);
    assert.ok(resolved.startsWith(path.resolve(root)+path.sep),'Source artifact must stay inside the repository');
    return fs.readFileSync(resolved);
  };
  const bytes=read(corpusPath),corpus=JSON.parse(bytes);
  if(!enrollmentPath)return corpus;
  const enrollment=JSON.parse(read(enrollmentPath));
  assert.equal(enrollment.acceptedBase.path,corpusPath,'Accepted corpus identity');
  assert.equal(sha(bytes),enrollment.acceptedBase.sha256.toUpperCase(),'Accepted corpus integrity');
  const result=structuredClone(corpus),targets=new Map();
  const add=(record,kind)=>{
    assert.ok(record.sourceId&&!targets.has(record.sourceId),'Unique independent source text identity');
    targets.set(record.sourceId,{id:record.sourceId,kind,data:record});
  };
  for(const datasheet of result.datasheets)for(const section of datasheet.sections)add(section,'DATASHEET_SECTION');
  for(const detachment of result.detachments)for(const enhancement of detachment.enhancements)add(enhancement,'ENHANCEMENT');
  const operations=enrollment.overlayOperations.filter(operation=>targets.has(operation.targetId)&&
    operation.operation==='REPLACE'&&operation.field.at(-1)==='text');
  const sources=new Map(enrollment.sources.map(source=>[source.id,source]));
  assert.equal(sources.size,enrollment.sources.length,'Unique official source identity');
  const verified=new Set();
  for(const operation of operations){
    const source=sources.get(operation.sourceId);
    assert.ok(source?.authority==='OFFICIAL_GW'&&source.type==='OFFICIAL_PDF','Accepted official text owner');
    assert.equal(operation.provenance.documentPath,source.path,'Official text document identity');
    assert.equal(operation.provenance.sourceLocator,operation.targetId,'Exact source text target');
    assert.ok(Number.isSafeInteger(operation.provenance.page)&&operation.provenance.page>0,'Official text page locator');
    assert.ok(Object.hasOwn(operation,'expectedBefore')&&typeof operation.expectedBefore==='string'&&typeof operation.value==='string','Exact before/after text required');
    assert.equal(typeof at(targets.get(operation.targetId).data,operation.field),'string','Exact captured text field');
    if(!verified.has(source.id)){
      assert.equal(sha(read(source.path)),source.sha256.toUpperCase(),'Official text source integrity');verified.add(source.id);
    }
  }
  // Reuse the producer's exact expectedBefore, field-path, source precedence,
  // duplicate/conflicting write and official-ownership guards unchanged.
  const projected=applyOverlays({entities:[...targets.values()]},enrollment.sources,operations);
  for(const entity of projected.entities){
    const host=targets.get(entity.id).data;
    for(const key of Object.keys(host))delete host[key];Object.assign(host,entity.data);
  }
  return result;
}
