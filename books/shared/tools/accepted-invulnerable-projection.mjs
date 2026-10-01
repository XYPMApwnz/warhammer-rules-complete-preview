import {bindRowsToCanonicalIds,canonicalDisplayKey} from './canonical-join-contract.mjs';

// Source profile scope is resolved by the corpus importer. Bind that accepted
// evidence to canonical owners without replacing profiles or other stats.
export function projectAcceptedInvulnerableSaves(units,corpus){
  const records=(corpus?.datasheets||[]).filter(record=>record.profiles?.some(profile=>profile.stats?.INSV));
  const bound=bindRowsToCanonicalIds(records,units,{label:'accepted Invulnerable Save',rowId:record=>record.sourceId.replace(/^datasheet-/,'unit-')});
  const byId=new Map(bound.map(record=>[record.canonicalId,record]));
  return units.map(unit=>{
    const source=byId.get(unit.id);
    if(!source)return unit;
    const sourceProfiles=source.profiles,values=new Set(sourceProfiles.map(profile=>profile.stats?.INSV));
    const global=values.size===1?[...values][0]:null;
    const profiles=(unit.profiles||[]).map(profile=>{
      const matching=sourceProfiles.filter(item=>canonicalDisplayKey(item.name)===canonicalDisplayKey(profile.name));
      if(!global&&matching.length!==1)throw new Error(`${unit.id}: source Invulnerable profile scope does not resolve for ${profile.name}`);
      const value=global||matching[0].stats?.INSV;
      if(!value)return profile;
      if(!/^[2-6]\+$/.test(value))throw new Error(`${unit.id}: invalid accepted Invulnerable Save ${value}`);
      if(profile.stats?.Invulnerable&&profile.stats.Invulnerable!==value)throw new Error(`${unit.id}: contradictory accepted Invulnerable Save`);
      if(profile.stats?.Invulnerable===value)return profile;
      return {...profile,stats:{...profile.stats,Invulnerable:value},invulnerableSource:{sourceId:source.sourceId,profileSourceIds:sourceProfiles.filter(item=>item.stats?.INSV===value).map(item=>item.sourceId),captureDate:corpus.captureDate}};
    });
    if(!profiles.length)throw new Error(`${unit.id}: missing canonical source profiles`);
    return {...unit,profiles};
  });
}
