import {assignCanonicalChildIdentities} from './canonical-join-contract.mjs';

const values=value=>Array.isArray(value)?value:[];
const slug=value=>String(value||'').toLowerCase().replace(/[\u2019']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const statRecord=value=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length?value:null;
const characteristicTypes=new Set(['CHARACTERISTIC_ADD','CHARACTERISTIC_SET']);
const operationTarget=operation=>typeof operation?.canonicalTarget==='string'?operation.canonicalTarget:operation?.canonicalTarget?.id;
const scopedUnitIds=(contract,clause)=>new Set([
  contract?.sourceUnitId,
  ...values(contract?.selector?.sourceUnitIds),...values(contract?.selector?.unitIds),
  ...values(clause?.selector?.sourceUnitIds),...values(clause?.selector?.unitIds)
].filter(Boolean));
const requiredCharacteristicOperations=(unitId,effectContracts)=>values(effectContracts).flatMap(contract=>values(contract?.clauses).flatMap(clause=>{
  if(!scopedUnitIds(contract,clause).has(unitId))return [];
  return values(clause?.operations).filter(operation=>characteristicTypes.has(operation?.type)&&operationTarget(operation));
}));
const sourceStatsFor=unit=>[
  ...values(unit?.profiles).map(profile=>statRecord(profile?.stats)),
  ...values(unit?.blocks).filter(block=>block?.type==='statline').map(block=>statRecord(block?.values))
].filter(Boolean);
const withCanonicalInvulnerable=(unit,stats)=>{
  const value=String(unit?.invulnerable||'').trim();
  if(!value)return stats;
  if(stats.Invulnerable!==undefined&&String(stats.Invulnerable)!==value)throw new Error(`${unit?.id||'unit'}: conflicting canonical Invulnerable characteristic`);
  return {...stats,Invulnerable:value};
};
const deriveRequiredBaseStat=(sources,target,operations)=>{
  const sourceValues=[...new Set(sources.filter(source=>Object.prototype.hasOwnProperty.call(source,target)).map(source=>String(source[target])))];
  if(sourceValues.length===1)return sourceValues[0];
  const setValues=new Set(operations.filter(operation=>operation.type==='CHARACTERISTIC_SET'&&operationTarget(operation)===target).map(operation=>String(operation.parameters?.to??operation.parameters?.value)));
  const baseValues=sourceValues.filter(value=>!setValues.has(value));
  return baseValues.length===1?baseValues[0]:null;
};

export function canonicalBaseStatsForUnit(unit,{effectContracts=[]}={}){
  const explicit=statRecord(unit?.stats);
  const profileSources=values(unit?.profiles).map(profile=>statRecord(profile?.stats)).filter(Boolean);
  if(explicit){
    if(profileSources.length&&!profileSources.some(source=>canonicalStats(source)===canonicalStats(explicit)))throw new Error(`${unit?.id||'unit'}: canonical unit stats do not resolve to one source profile`);
    return withCanonicalInvulnerable(unit,{...explicit});
  }
  const sources=sourceStatsFor(unit);
  if(!sources.length)return withCanonicalInvulnerable(unit,{});
  const keys=[...new Set(sources.flatMap(source=>Object.keys(source)))];
  const stats=Object.fromEntries(keys
    .filter(key=>sources.every(source=>Object.prototype.hasOwnProperty.call(source,key)&&String(source[key])===String(sources[0][key])))
    .map(key=>[key,sources[0][key]]));
  const required=requiredCharacteristicOperations(unit?.id,effectContracts);
  for(const target of [...new Set(required.map(operationTarget))]){
    if(stats[target]!=null)continue;
    const base=deriveRequiredBaseStat(sources,target,required);
    if(base!=null)stats[target]=base;
  }
  return withCanonicalInvulnerable(unit,stats);
}

const canonicalStats=value=>JSON.stringify(Object.entries(value||{}).sort(([left],[right])=>left.localeCompare(right)));
const canonicalFact=value=>Array.isArray(value)?value.map(canonicalFact):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonicalFact(value[key])])):value;

export function canonicalStatProfilesForUnit(unit){
  const sources=values(unit?.profiles).filter(profile=>profile?.name&&statRecord(profile?.stats));
  if(sources.length<2||new Set(sources.map(profile=>canonicalStats(profile.stats))).size<2)return [];
  return assignCanonicalChildIdentities(unit,sources,{kind:'stat-profile',titleOf:profile=>profile.name,semanticOf:profile=>({sourceName:profile.name,stats:profile.stats}),legacyIdOf:profile=>`${unit.id}-stat-profile-${slug(profile.name)}`}).map(profile=>({id:profile.id,title:profile.name,stats:{...profile.stats},...(profile.legacyIds?.length?{legacyIds:profile.legacyIds}:{})}));
}

export function projectRosterBaseStats(units,catalogUnits,{label='roster base-stat projection',effectContracts=[],projectStatProfiles=false}={}){
  if(!Array.isArray(units)||!Array.isArray(catalogUnits))throw new Error(`${label}: units and catalogUnits must be arrays`);
  const sourceById=new Map();
  for(const unit of units){
    if(typeof unit?.id!=='string'||!unit.id)throw new Error(`${label}: canonical unit requires an ID`);
    if(sourceById.has(unit.id))throw new Error(`${label}: duplicate canonical unit identity ${unit.id}`);
    sourceById.set(unit.id,unit);
  }
  const seen=new Set();
  const projected=catalogUnits.map(item=>{
    if(typeof item?.id!=='string'||!item.id||!sourceById.has(item.id))throw new Error(`${label}: unknown canonical stat-profile scope ${item?.id||'<missing>'}`);
    if(seen.has(item.id))throw new Error(`${label}: duplicate roster stat-profile identity ${item.id}`);
    seen.add(item.id);
    return {...item,gameSelections:{...(item.gameSelections||{}),stats:canonicalBaseStatsForUnit(sourceById.get(item.id),{effectContracts}),...(projectStatProfiles?{statProfiles:canonicalStatProfilesForUnit(sourceById.get(item.id))}:{})}};
  });
  if(seen.size!==sourceById.size){
    const missing=[...sourceById.keys()].find(id=>!seen.has(id));
    throw new Error(`${label}: missing roster unit ${missing}`);
  }
  return projected;
}

export function assertRosterBaseStatProjection(units,catalogUnits,{label='roster base-stat projection',effectContracts=[],projectStatProfiles=false}={}){
  const projected=projectRosterBaseStats(units,catalogUnits,{label,effectContracts,projectStatProfiles});
  for(let index=0;index<projected.length;index++){
    const expected=projected[index].gameSelections.stats,actual=catalogUnits[index]?.gameSelections?.stats;
    if(canonicalStats(actual)!==canonicalStats(expected))throw new Error(`${label}: ${projected[index].id} has conflicting canonical base stats`);
    if(projectStatProfiles&&JSON.stringify(canonicalFact(catalogUnits[index]?.gameSelections?.statProfiles||[]))!==JSON.stringify(canonicalFact(projected[index].gameSelections.statProfiles||[])))throw new Error(`${label}: ${projected[index].id} has conflicting canonical stat profiles`);
  }
  return true;
}
