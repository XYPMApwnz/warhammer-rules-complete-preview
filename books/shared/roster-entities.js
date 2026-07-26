(function(root){
  'use strict';

  const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const weaponFamily=value=>normalize(String(value||'')
    .replace(/^[^A-Za-z0-9]+/,'')
    .replace(/\s+(?:[-\u2013\u2014])\s+[^-\u2013\u2014]+$/,'')
    .replace(/\s+(?:strike|sweep|standard|supercharge|witchfire|focused witchfire)$/i,''));
  const loadoutIncludesProfile=(loadout,profile)=>{
    const family=weaponFamily(profile);
    return Boolean(family)&&[].concat(loadout||[]).some(label=>normalize(label).includes(family));
  };
  const weaponGroups=(terms,datasheet)=>{
    const groups=new Map();
    Object.entries(terms||{}).forEach(([id,term])=>{
      if(term.datasheet!==datasheet||!term.structured?.weapon)return;
      const family=weaponFamily(term.title),group=groups.get(family)||[];
      group.push({id,...term});groups.set(family,group);
    });
    return groups;
  };

  root.WHRosterEntities=Object.freeze({normalize,weaponFamily,loadoutIncludesProfile,weaponGroups});
}(typeof window==='undefined'?globalThis:window));
