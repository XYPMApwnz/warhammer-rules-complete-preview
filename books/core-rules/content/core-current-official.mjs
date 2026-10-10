import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const contentRoot=path.dirname(fileURLToPath(import.meta.url));
const requiredProvenance=['sourceClass','sourceId','sourceArtifact','sourceDate','sourceLocator','overrides','confidence'];

export function validateCoreSourceRegistry(registry){
  if(registry.schema!=='wh40k-core-source-registry/v1')throw new Error('Unknown Core source registry schema');
  const sources=new Map();
  for(const item of registry.sources||[]){
    if(!item.sourceId||sources.has(item.sourceId)||!item.title||!item.date||!item.sourceClass||!item.scope||!item.urlOrLocalArtifact||!item.authorityLevel)throw new Error(`Incomplete or duplicate Core source: ${item.sourceId}`);
    sources.set(item.sourceId,item);
  }
  for(const edge of registry.supersessionEdges||[]){
    const older=sources.get(edge.older),newer=sources.get(edge.newer);
    if(!older||!newer||!Array.isArray(edge.ruleIds)||!edge.ruleIds.length||edge.scope!=='GLOBAL_CORE')throw new Error('Invalid Core supersession edge');
    if(older.date>newer.date||!older.supersededBy?.includes(newer.sourceId)||!newer.supersedes?.includes(older.sourceId))throw new Error('Inconsistent Core supersession edge');
    if(newer.scope!=='GLOBAL_CORE'||newer.authorityLevel!=='GLOBAL_OFFICIAL')throw new Error('Non-global source cannot supersede global Core');
  }
  return registry;
}

export function loadCoreSourceRegistry(root=contentRoot){
  return validateCoreSourceRegistry(JSON.parse(fs.readFileSync(path.join(root,'core-official-source-registry.en.json'),'utf8')));
}

export function validateCoreCurrentOfficial(source,registry=loadCoreSourceRegistry()){
  if(source.schema!=='wh40k-core-current-official/v1')throw new Error('Unknown current Core source schema');
  if(source.asOf!==registry.asOf)throw new Error('Current Core source date differs from source registry');
  const registered=new Map(registry.sources.map(item=>[item.sourceId,item]));
  const ids=new Set();
  for(const update of [...source.ruleOverrides,...source.universalRulesUpdates]){
    const id=update.id;
    const supersessionKey=update.code||id;
    if(!id||ids.has(id))throw new Error(`Duplicate or missing current Core identity: ${id}`);
    ids.add(id);
    if(requiredProvenance.some(key=>!update[key]))throw new Error(`Incomplete Core provenance: ${id}`);
    const owner=registered.get(update.sourceId);
    if(!owner||owner.urlOrLocalArtifact!==update.sourceArtifact||owner.date!==update.sourceDate)throw new Error(`Unregistered Core source binding: ${id}`);
    if(update.sourceClass==='GW_CURRENT_OFFICIAL'){
      if(owner.scope!=='GLOBAL_CORE'||owner.authorityLevel!=='GLOBAL_OFFICIAL')throw new Error(`Non-global source cannot own a Core rule: ${id}`);
    }else if(update.sourceClass==='CURRENT_SECONDARY_CORROBORATED'){
      const corroboration=registered.get(update.officialCorroboration);
      if(owner.authorityLevel!=='SECONDARY'||corroboration?.scope!=='GLOBAL_CORE'||corroboration?.authorityLevel!=='GLOBAL_OFFICIAL')throw new Error(`Uncorroborated secondary Core fact: ${id}`);
      if(update.additionalOfficialCorroboration&&!registered.has(update.additionalOfficialCorroboration))throw new Error(`Unknown additional Core corroboration: ${id}`);
      if(registry.supersessionEdges.some(edge=>edge.ruleIds.includes(supersessionKey)&&registered.get(edge.newer)?.authorityLevel==='GLOBAL_OFFICIAL'))throw new Error(`Secondary Core fact cannot displace an applicable official update: ${id}`);
    }else throw new Error(`Unknown Core authority class: ${id}`);
    if(registry.supersessionEdges.some(edge=>edge.older===update.sourceId&&edge.ruleIds.includes(supersessionKey)))throw new Error(`Superseded Core source: ${id}`);
    const url=new URL(update.sourceArtifact);
    if(url.protocol!=='https:'||(update.sourceClass==='GW_CURRENT_OFFICIAL'&&!['www.warhammer-community.com','assets.warhammer-community.com'].includes(url.hostname)))throw new Error(`Unaccepted current Core source: ${id}`);
    if(update.partition!=='ERRATA'&&update.partition!=='UNIVERSAL_RULE_UPDATE')throw new Error(`Unknown Core source partition: ${id}`);
  }
  return source;
}

export function loadCoreCurrentOfficial(root=contentRoot){
  return validateCoreCurrentOfficial(JSON.parse(fs.readFileSync(path.join(root,'core-rules.current-official.en.json'),'utf8')));
}

export function applyCoreCurrentOfficial(base,source=loadCoreCurrentOfficial(),registry=loadCoreSourceRegistry()){
  validateCoreCurrentOfficial(source,registry);
  const registered=new Map(registry.sources.map(item=>[item.sourceId,item]));
  const digital=structuredClone(base);
  const byCode=new Map();
  for(const record of digital.records)byCode.set(record.code,[...(byCode.get(record.code)||[]),record]);
  for(const update of source.ruleOverrides){
    const candidates=byCode.get(update.code)||[];
    if(candidates.length>1)throw new Error(`Ambiguous official override code: ${update.code}`);
    const record=candidates[0];
    if(!record)throw new Error(`Official override has no Core rule: ${update.code}`);
    if(update.operation==='replace-exact-line'){
      if(typeof record.text!=='string'||!update.previousLine||!update.currentLine)throw new Error(`Invalid text override: ${update.code}`);
      const lines=record.text.split('\n');
      const matches=lines.flatMap((line,index)=>line===update.previousLine?[index]:[]);
      if(matches.length===1&&lines.includes(update.currentLine))throw new Error(`Conflicting duplicate official semantic owner: ${update.code}`);
      if(matches.length===1)lines[matches[0]]=update.currentLine;
      else if(!lines.includes(update.currentLine))throw new Error(`Ambiguous or missing official override anchor: ${update.code}`);
      record.text=lines.join('\n');
    }else if(update.operation==='append-line'){
      if(typeof record.text!=='string'||!update.currentLine)throw new Error(`Invalid text override: ${update.code}`);
      const lines=record.text.split('\n');
      if(!lines.includes(update.currentLine))lines.push(update.currentLine);
      record.text=lines.join('\n');
    }else if(update.operation==='compatibility-alias'){
      if(record.title!==update.canonicalTitle||!Array.isArray(update.aliases)||!update.aliases.length)throw new Error(`Incorrect official Core compatibility identity: ${update.code}`);
      record.compatibilityAliases=[...new Set([...(record.compatibilityAliases||[]),...update.aliases])];
    }else throw new Error(`Unknown official Core override operation: ${update.code}`);
    record.currentOfficialOverride={id:update.id,partition:update.partition,operation:update.operation,sourceClass:update.sourceClass,sourceId:update.sourceId,sourceScope:registered.get(update.sourceId).scope,sourceArtifact:update.sourceArtifact,sourceDate:update.sourceDate,sourceLocator:update.sourceLocator,overrides:update.overrides,confidence:update.confidence,...(update.officialCorroboration?{officialCorroboration:update.officialCorroboration}:{}),...(update.additionalOfficialCorroboration?{additionalOfficialCorroboration:update.additionalOfficialCorroboration}:{})};
  }
  digital.universalRulesUpdates=source.universalRulesUpdates.map(update=>({...structuredClone(update),sourceScope:registered.get(update.sourceId).scope}));
  return digital;
}
