import {normalizeGlossaryQuery} from './glossary.mjs';

// Presentation metadata, never a second registry of definitions or identities.
const categories = Object.freeze({
  CORE_MAIN_RULE:'Main Rule', CORE_CORE_CONCEPT:'Core Concept', CORE_ERRATA:'Errata',
  CORE_FAQ_CLARIFICATION:'FAQ', CORE_UNIVERSAL_RULE_UPDATE:'Rule Update',
  ARMY_RULE:'Army Rule', ARMY_RULE_COMPONENT:'Army Subrule', BOOK_USAGE_RULES:'Book Rules',
  DETACHMENT:'Detachment', DETACHMENT_RULE:'Detachment Rule', ENHANCEMENT:'Enhancement',
  STRATAGEM:'Stratagem', DATASHEET_SECTION:'Datasheet Ability',
  SUPPLEMENTAL_DATASHEET_RULE:'Datasheet Rule', WARGEAR_OPTION:'Wargear',
  WEAPON_PROFILE_SELECTION:'Weapon Profiles', WARGEAR_FOOTNOTE:'Wargear Note',
  SOURCE_ERRATUM:'Errata', SOURCE_UPDATE_REFERENCE:'Rule Update',
  ABILITY:'Ability', UNIT:'Datasheet', UPDATE:'Update', WARGEAR_ABILITY:'Wargear Ability',
  FACTION_TERM:'Faction Term', WEAPON_PROFILE:'Weapon Profile', MAIN_RULE:'Main Rule',
  CORE_CONCEPT:'Core Concept', ERRATA:'Errata', FAQ_CLARIFICATION:'FAQ', UNIVERSAL_RULE_UPDATE:'Rule Update',
  DEPLOYMENT:'Deployment', MISSION_SEQUENCE_RULE:'Mission Sequence', FORCE_DISPOSITION:'Force Disposition',
  FORCE_DISPOSITION_MATCHUP:'Force Disposition Matchup', MISSION_REFERENCE_RULE:'Mission Rule',
  PRIMARY_MISSION:'Primary Mission', SECONDARY_MISSION:'Secondary Mission', TERRAIN_LAYOUT:'Terrain Layout', TWIST:'Twist'
});
const publicText = field => {
  const path=field.presentationPath??field.source?.path??'';
  return field.presentation==='table-cell' || field.presentation==='caption' || field.presentation==='stat' || field.type==='tokens' ||
    /^\/(?:semanticContent|text|sourceStructure\/text|cp|category|sourceTypeLabel)$/.test(path) ||
    /^\/sourceConflict\/(?:notice|occurrences\/\d+\/(?:title|presentationText))$/.test(path) ||
    /^\/(?:blocks|lines|clauses)\/\d+\/(?:text|label)$/.test(path);
};
const byLabel=(a,b)=>a.label.localeCompare(b.label, 'en', {sensitivity:'base'}) || a.targetId.localeCompare(b.targetId);

/** One canonical reference policy. Personal book membership remains external. */
export function createReferenceContract({cards,index,registryId='book',coreRegistryId='core-rules'}) {
  const identityFor=id=>cards.has(id)?Object.freeze(cards.get(id).identity || {registryId:cards.get(id).domain==='CORE'?coreRegistryId:registryId,canonicalId:id}):null;
  const identityKey=identity=>JSON.stringify([identity.registryId,identity.canonicalId,identity.fieldPath||'']);
  const qualified=new Map();
  for(const id of cards.keys()) {
    const key=identityKey(identityFor(id));
    if(qualified.has(key))throw new TypeError('Duplicate qualified reference identity');
    qualified.set(key,id);
  }
  const localId=target=>{
    if(typeof target==='string')return target;
    if(!target)return null;
    const exact=qualified.get(identityKey(target));
    if(exact)return exact;
    // A book article can carry a focus address into one of its canonical fields.
    // That is distinct from an identity-bearing global subentry path.
    const articleId=qualified.get(identityKey({...target,fieldPath:null})),article=cards.get(articleId);
    return article&&!article.identity?.fieldPath&&article.fields?.some(field=>field.source?.path===target.fieldPath)?articleId:null;
  };
  const entries=new Map((index?.entries || []).map(entry=>[entry.targetId,entry]));
  const categoryFor=card=>categories[entries.get(card.id)?.category || card.kind] || 'Reference';
  const dependencies=card=>[...(card.links || []).map(link=>link.targetId),
    ...(card.fields || []).flatMap(field=>field.targetIds || [])];
  const allIds=new Set(cards.keys());
  function scope(allowedIds) {
    if(!allowedIds)return allIds;
    const available=new Set([...allowedIds,...[...cards.values()].filter(card=>card.domain==='CORE').map(card=>card.id)]);
    const pending=[...available];
    for(let i=0;i<pending.length;i++)for(const id of dependencies(cards.get(pending[i]) || {})) {
      if(cards.has(id)&&!available.has(id)){available.add(id);pending.push(id);}
    }
    return available;
  }
  const canResolve=(target,allowedIds=null)=>{const id=localId(target);return cards.has(id)&&scope(allowedIds).has(id);};
  function resolve(target,allowedIds=null) {
    const id=localId(target);
    if(!canResolve(id,allowedIds))return null;
    const card=cards.get(id),entry=entries.get(id),available=scope(allowedIds),sections=[],visited=new Set();
    function definition(owner,trail=new Set()) {
      if(trail.has(owner.id))throw new Error('Cyclic canonical reference definition');
      if(visited.has(owner.id))return;
      visited.add(owner.id);
      const fields=(owner.fields || []).filter(field=>publicText(field)||['PROFILE','WEAPON_PROFILE'].includes(owner.kind)&&(field.type==='heading'||field.presentation==='heading'));
      if(fields.length)sections.push({card:owner,fields});
      const next=new Set([...trail,owner.id]);
      for(const link of owner.links || [])if(link.relation==='sourceRuleId') {
        if(!cards.has(link.targetId))throw new Error('Missing canonical definition owner');
        definition(cards.get(link.targetId),next);
      }
      // Existing canonical content hierarchy, filtered by book/reference scope.
      for(const childId of owner.children || []) {
        const child=cards.get(childId);
        if(available.has(childId)&&child&&(['ARMY_RULE_COMPONENT','DETACHMENT_RULE','ENHANCEMENT','STRATAGEM'].includes(child.kind)||owner.kind==='ENHANCEMENT'&&child.kind==='WEAPON_PROFILE'))definition(child,next);
      }
    }
    definition(card);
    const references=[...new Set(sections.flatMap(section=>dependencies(section.card)).concat(dependencies(card),sections.filter(section=>section.card.kind==='WEAPON_PROFILE').map(section=>section.card.id)))]
      .filter(targetId=>targetId!==id&&available.has(targetId)&&cards.has(targetId))
      .map(targetId=>({targetId,label:cards.get(targetId).title}));
    return {targetId:id,identity:identityFor(id),title:card.title,titleField:card.fields?.find(field=>field.type==='heading'||field.presentation==='heading'),
      category:categoryFor(card),contextLabel:entry?.contextLabel || (card.domain==='CORE'?'Core Rules':'Army Book'),sections,references};
  }
  function search(query,{allowedIds=null,category=''}={}) {
    const normalized=normalizeGlossaryQuery(query),available=scope(allowedIds),results=[];
    for(const entry of entries.values()) {
      if(!available.has(entry.targetId)||(category&&categoryFor(cards.get(entry.targetId))!==(categories[category] || 'Reference')))continue;
      const candidates=[{label:entry.label},...entry.aliases];
      let best=null;
      for(const candidate of candidates) {
        const value=normalizeGlossaryQuery(candidate.label);
        if(normalized&&!value.includes(normalized))continue;
        const score=!normalized?0:value===normalized?0:value.startsWith(normalized)?1:2;
        if(!best||score<best.score)best={...candidate,score};
      }
      if(!best&&normalized) {
        const text=normalizeGlossaryQuery(resolve(entry.targetId,allowedIds).sections.flatMap(section=>section.fields.map(field=>field.value)).join(' '));
        if(text.includes(normalized))best={label:entry.label,score:3};
      }
      if(best)results.push({...entry,categoryLabel:categoryFor(cards.get(entry.targetId)),matchedLabel:best.label,
        ...(best.fieldPath?{matchedFieldPath:best.fieldPath}:{}),score:best.score});
    }
    return results.sort((a,b)=>a.score-b.score || byLabel(a,b)).map(({score,...entry})=>entry);
  }
  function categoryList(allowedIds=null) {
    const available=scope(allowedIds),kinds=new Set([...entries.values()].filter(entry=>available.has(entry.targetId)).map(entry=>entry.category));
    return [...new Map([...kinds].map(id=>[categories[id] || 'Reference',{id,label:categories[id] || 'Reference'}])).values()]
      .sort((a,b)=>a.label.localeCompare(b.label)||a.id.localeCompare(b.id));
  }
  // Explicit identity aliases only. Titles/prose never establish canonical ownership.
  function resolveAlias(label,{registryId:owner=null,parentId=null,recordType=null}={}) {
    if(cards.has(label))return label;
    const token=normalizeGlossaryQuery(label);
    const eligible=[...entries.values()].filter(entry=>{
      const card=cards.get(entry.targetId),identity=identityFor(entry.targetId);
      return (!parentId||card.sourceParentId===parentId||card.contextParentIds?.includes(parentId))&&(!recordType||card.kind===recordType)&&
        (!owner||identity.registryId===owner||card.domain==='CORE'||card.contextRegistryIds?.includes(owner));
    });
    // Exact identity keys may intentionally differ by punctuation/case. Never
    // collapse those keys into search normalization before resolving them.
    const exact=eligible.filter(entry=>identityFor(entry.targetId).canonicalId===label||
      (entry.aliases||[]).some(alias=>alias.match!=='NORMALIZED'&&alias.label===label));
    if(exact.length===1)return exact[0].targetId;
    const candidates=eligible.filter(entry=>(entry.aliases||[]).some(alias=>alias.match!=='EXACT'&&normalizeGlossaryQuery(alias.label)===token));
    return candidates.length===1?candidates[0].targetId:null;
  }
  return Object.freeze({resolve,canResolve,identityFor,resolveAlias,search,categories:categoryList,isEntry:id=>entries.has(id)});
}
