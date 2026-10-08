/** Disposable ability placement over canonical references and effective scopes.
 * No ability/effect is calculated here; the effective bags remain authoritative. */
const clone=value=>structuredClone(value);
const normalized=value=>Array.isArray(value)?value.map(normalized):value&&typeof value==='object'
  ?Object.fromEntries(Object.keys(value).sort().map(key=>[key,normalized(value[key])]))
  :typeof value==='string'&&/^-?\d+(?:\.\d+)?[+"]?$/.test(value)?Number.parseFloat(value):value;
export const abilityParameters=ability=>normalized({...ability.parameters,
  ...(ability.value===undefined?{}:{value:ability.value})});
const factKey=ability=>JSON.stringify([ability.canonicalId,abilityParameters(ability)]);
const scopeKey=(instanceId,profile)=>JSON.stringify([instanceId,profile.id,profile.scopeId||null]);

/** These are existing typed operation semantics, not display-name aliases.
 * GRANT_MODEL_ABILITY is the legacy, validated FNP-only operation. */
const legacyOperations=Object.freeze({GRANT_MODEL_ABILITY:'core-feel-no-pain'});

export function collectAbilityReferences(cards,bindings) {
  return cards.flatMap(card=>card.fields.flatMap(field=>(bindings?.fields?.[field.id]||[]).map(binding=>({
    canonicalId:binding.targetId,parameters:clone(binding.parameters||{}),
    group:binding.group,label:field.value.slice(binding.start,binding.end),
    ...(binding.runtimeEntryId?{runtimeEntryId:binding.runtimeEntryId}:{}),
    ...(binding.legacyValue?{legacyValue:true}:{}),
    fieldId:field.id,start:binding.start,end:binding.end
  }))));
}

export function projectAbilityPresentation({instanceId,profiles,unitAbilities=[],references=[],applied=[]}) {
  const active=profiles.filter(profile=>profile.quantity===undefined||profile.quantity>0);
  const scopes=active.map(profile=>scopeKey(instanceId,profile));
  const intrinsic=new Map(references.filter(ref=>ref.runtimeEntryId).map(ref=>[ref.runtimeEntryId,ref]));
  const coreReferences=references.filter(ref=>ref.group==='CORE ABILITIES');
  const legacyIds=[...new Set(coreReferences.filter(ref=>ref.legacyValue).map(ref=>ref.canonicalId))];
  if(legacyIds.length>1)throw new TypeError('Ambiguous legacy numeric ability presentation');
  const bags=new Map(active.map(profile=>[scopeKey(instanceId,profile),new Map()]));
  for(const profile of active) {
    const bag=bags.get(scopeKey(instanceId,profile));
    // References without a typed runtime occurrence are unchanged static facts.
    for(const ref of coreReferences.filter(ref=>!ref.runtimeEntryId&&!ref.legacyValue))bag.set(factKey(ref),clone(ref));
    for(const ability of profile.abilities||[]) {
      let resolved=ability.canonicalId?{...clone(ability),parameters:abilityParameters(ability)}:intrinsic.get(ability.id);
      if(!resolved&&ability.value!==undefined) {
        const reference=coreReferences.find(ref=>ref.legacyValue);
        const change=applied.find(row=>Object.hasOwn(legacyOperations,row.operation)&&row.targetProfileId===profile.id&&
          (row.targetCompositionId||null)===(profile.scopeId||null));
        const canonicalId=reference?.canonicalId||legacyOperations[change?.operation];
        if(canonicalId)resolved={canonicalId,parameters:abilityParameters(ability),name:ability.name};
      }
      if(!resolved||resolved.group&&resolved.group!=='CORE ABILITIES')continue;
      const matching=coreReferences.find(ref=>factKey(ref)===factKey(resolved));
      const value={...clone(resolved),...(matching?{label:matching.label}:{})};
      bag.set(factKey(value),value);
    }
  }
  const groups=new Map();
  for(const [scope,bag]of bags)for(const [key,ability]of bag){
    if(!groups.has(key))groups.set(key,{...ability,subject:'MODEL',recipientScopes:[]});
    groups.get(key).recipientScopes.push(scope);
  }
  const model=new Map(scopes.map(scope=>[scope,[]])),core=[];
  const identify=ability=>({...ability,parameters:abilityParameters(ability),recipientScopes:[...ability.recipientScopes].sort(),
    identity:JSON.stringify([instanceId,ability.subject,ability.canonicalId,abilityParameters(ability),[...ability.recipientScopes].sort()])});
  for(const ability of groups.values()) {
    if(ability.recipientScopes.length===scopes.length&&scopes.length)core.push(identify(ability));
    else for(const scope of ability.recipientScopes)model.get(scope).push(identify({...ability,recipientScopes:[scope]}));
  }
  const seen=new Set(core.map(ability=>ability.identity));
  for(const ability of unitAbilities){
    const entry=identify({...clone(ability),subject:'UNIT',recipientScopes:[JSON.stringify([instanceId,'UNIT'])]});
    if(!seen.has(entry.identity)){core.push(entry);seen.add(entry.identity);}
  }
  return {core,profiles:active.map(profile=>({id:profile.id,scopeId:profile.scopeId||null,
    abilities:model.get(scopeKey(instanceId,profile))})),
    otherReferences:references.filter(ref=>ref.group!=='CORE ABILITIES')};
}

export function abilityPresentationLabel(ability) {
  if(ability.label)return ability.label;
  const parameters=abilityParameters(ability);
  return (ability.name||ability.title)+Object.entries(parameters).map(([key,value])=>
    ` ${value}${key==='value'?'+':key==='distance'?'"':''}`).join('');
}
