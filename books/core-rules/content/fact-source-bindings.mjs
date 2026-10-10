import {createHash} from 'node:crypto';

export const factHash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const bindingKey=entry=>JSON.stringify({target:entry.target,sourceId:entry.source.sourceId,artifact:entry.source.artifact,recordCode:entry.source.recordCode,unitId:entry.source.unitId,path:entry.source.path,page:entry.source.page});

export function factAt(record,address){
  if(!address.path?.startsWith('/'))throw new Error('Fact binding requires an explicit canonical path');
  let value=record;
  for(const key of address.path.slice(1).split('/').map(key=>key.replaceAll('~1','/').replaceAll('~0','~'))){
    if(value===null||typeof value!=='object'||!Object.hasOwn(value,key))throw new Error(`Missing canonical fact: ${address.path}`);
    value=value[key];
  }
  if(address.range){
    const [start,end]=address.range;
    if(typeof value!=='string'||!Number.isInteger(start)||!Number.isInteger(end)||start<0||end<=start||end>value.length)throw new Error('Invalid canonical fact range');
    value=value.slice(start,end);
  }
  return value;
}

function contribution(record,binding,{sources,resolveSource}){
  const registered=sources.find(source=>source.sourceId===binding.source.sourceId);
  if(!registered)throw new Error('Unregistered contributing source');
  const value=factAt(record,binding.target);
  if(factHash(value)!==binding.valueHash)throw new Error(`Changed source-bound fact: ${record.id}${binding.target.path}`);
  const supported=resolveSource(binding.source);
  if(factHash(supported)!==binding.valueHash)throw new Error(`Contributing source does not support fact: ${record.id}`);
  return {target:structuredClone(binding.target),valueHash:binding.valueHash,source:{...structuredClone(binding.source),sourceClass:registered.sourceClass,authorityLevel:registered.authorityLevel,sourceDate:registered.date,sourceArtifact:registered.urlOrLocalArtifact}};
}

// Supporting sources supplement the base occurrence; they never impersonate an erratum.
export function bindFactSources(records,bindings,context){
  const output=structuredClone(records),byId=new Map(output.map(record=>[record.id,record]));
  for(const binding of bindings){
    const record=byId.get(binding.targetRuleId);
    if(!record)throw new Error(`Missing fact owner: ${binding.targetRuleId}`);
    const entry=contribution(record,binding,context);
    record.provenance.factSources??=[];
    if(record.provenance.factSources.some(other=>bindingKey(other)===bindingKey(entry)))throw new Error('Duplicate fact-source binding');
    record.provenance.factSources.push(entry);
  }
  return output;
}

export function validateFactSources(records,bindings,context){
  const byId=new Map(records.map(record=>[record.id,record]));
  const expectedByOwner=new Map();
  for(const binding of bindings){
    const record=byId.get(binding.targetRuleId);
    if(!record)throw new Error(`Missing fact owner: ${binding.targetRuleId}`);
    const expected=contribution(record,binding,context);
    const keys=expectedByOwner.get(record.id)||[];
    if(keys.includes(bindingKey(expected)))throw new Error('Duplicate fact-source binding');
    keys.push(bindingKey(expected));expectedByOwner.set(record.id,keys);
    const actual=(record.provenance?.factSources||[]).filter(entry=>bindingKey(entry)===bindingKey(expected));
    if(actual.length!==1||JSON.stringify(actual[0])!==JSON.stringify(expected))throw new Error(`Missing or false contributing provenance: ${record.id}`);
  }
  for(const record of records)if((record.provenance?.factSources||[]).length!==(expectedByOwner.get(record.id)||[]).length)throw new Error(`Unexpected contributing provenance: ${record.id}`);
}

export function hasFactSource(record,pointer){
  return (record.provenance?.factSources||[]).some(entry=>!entry.target.range&&(pointer===entry.target.path||pointer.startsWith(`${entry.target.path}/`)));
}
