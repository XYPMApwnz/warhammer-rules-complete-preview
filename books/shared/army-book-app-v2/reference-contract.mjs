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
  SOURCE_ERRATUM:'Errata', SOURCE_UPDATE_REFERENCE:'Rule Update'
});
const publicText = field => {
  const path=field.source?.path || '';
  return field.presentation==='table-cell' || field.presentation==='caption' || field.presentation==='stat' || field.type==='tokens' ||
    /^\/(?:semanticContent|text|sourceStructure\/text|cp|category|sourceTypeLabel)$/.test(path) ||
    /^\/(?:blocks|lines|clauses)\/\d+\/(?:text|label)$/.test(path);
};
const byLabel=(a,b)=>a.label.localeCompare(b.label, 'en', {sensitivity:'base'}) || a.targetId.localeCompare(b.targetId);

/** One canonical reference policy. Personal book membership remains external. */
export function createReferenceContract({cards,index}) {
  const entries=new Map((index?.entries || []).map(entry=>[entry.targetId,entry]));
  const categoryFor=card=>categories[entries.get(card.id)?.category || card.kind] || 'Reference';
  const dependencies=card=>[...(card.links || []).map(link=>link.targetId),
    ...(card.fields || []).flatMap(field=>field.targetIds || [])];
  function scope(allowedIds) {
    if(!allowedIds)return new Set(cards.keys());
    const available=new Set([...allowedIds,...[...cards.values()].filter(card=>card.domain==='CORE').map(card=>card.id)]);
    const pending=[...available];
    for(let i=0;i<pending.length;i++)for(const id of dependencies(cards.get(pending[i]) || {})) {
      if(cards.has(id)&&!available.has(id)){available.add(id);pending.push(id);}
    }
    return available;
  }
  const canResolve=(id,allowedIds=null)=>cards.has(id)&&scope(allowedIds).has(id);
  function resolve(id,allowedIds=null) {
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
    return {targetId:id,title:card.title,titleField:card.fields?.find(field=>field.type==='heading'||field.presentation==='heading'),
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
  return Object.freeze({resolve,canResolve,search,categories:categoryList,isEntry:id=>entries.has(id)});
}
