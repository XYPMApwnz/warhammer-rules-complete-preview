/** Independent player-fact census over the accepted V2 factual owner records.
 * This module imports neither the application producer nor presentation code.
 * Source evidence/navigation is classified separately from player-facing facts.
 */
export const factPointer=path=>'/'+path.map(key=>String(key).replace(/~/g,'~0').replace(/\//g,'~1')).join('/');
export const factIdentity=(ownerId,path)=>`${ownerId}::${factPointer(path)}`;
const definitions={
  DATASHEET:{visible:['/title'],metadata:['/(?:class|sourceOrder|url|sourceBadges|keywordScopesId|profileIds|weaponIds|sectionIds|wargearOptionIds|ruleReferenceIds)(?:/.*)?']},
  PROFILE:{visible:['/name','/stats/(?:M|T|SV|W|LD|OC)'],metadata:['/(?:keywordScopeIds|invulnerableSaveId)(?:/.*)?']},
  MODEL_BASE:{visible:['/text','/notes/[0-9]+'],metadata:[]},
  INVULNERABLE_SAVE:{visible:['/value'],metadata:['/profileIds(?:/.*)?']},
  WEAPON_PROFILE:{visible:['/(?:name|mode|range|attacks|skill|strength|ap|damage)','/abilities/[0-9]+'],metadata:['/order']},
  WARGEAR_OPTION:{visible:['/text'],metadata:['/order']},
  DATASHEET_SECTION:{visible:['/title','/blocks/[0-9]+/(?:text|wargearAbility)'],metadata:['/order']},
  RULE_REFERENCE:{visible:['/groups/[0-9]+/label','/groups/[0-9]+/entries/[0-9]+/label'],metadata:['/order','/groups/[0-9]+/entries/[0-9]+/(?:id|sourceTooltipIds)(?:/.*)?']},
  KEYWORD_SCOPES:{visible:['/scopes/[0-9]+/label','/scopes/[0-9]+/keywords/[0-9]+'],metadata:['/scopes/[0-9]+/(?:id|xpath)']},
  ATTACHMENT_DECLARATION:{visible:['/roleHeading','/references/[0-9]+/targetId'],metadata:['/sourceSectionId','/references/[0-9]+/(?:sourceHref|externalDomain|excludedScope|label)']},
  WEAPON_PROFILE_SELECTION:{visible:['/text','/groups/[0-9]+/weaponProfileIds/[0-9]+'],metadata:['/groups/[0-9]+/(?:id|sourceProfileLabels)(?:/.*)?']},
  ARMY_RULE:{visible:['/title'],metadata:['/(?:class|componentIds)(?:/.*)?']},
  ARMY_RULE_COMPONENT:{visible:['/(?:title|text)'],metadata:[]},
  DETACHMENT:{visible:['/title'],metadata:['/(?:order|filterId|detachmentCode|class|ruleId|enhancementIds|stratagemIds)(?:/.*)?']},
  DETACHMENT_RULE:{visible:['/(?:title|text)','/tables/[0-9]+/rows/[0-9]+/[0-9]+'],metadata:['/tables/[0-9]+/sourceId','/tableOccurrences(?:/.*)?']},
  ENHANCEMENT:{visible:['/(?:title|text|sourceTypeLabel)'],metadata:['/(?:order|weaponIds)(?:/.*)?']},
  STRATAGEM:{visible:['/(?:title|cp|category)','/lines/[0-9]+/(?:label|text)'],metadata:['/(?:order|flavor)']},
  SOURCE_ERRATUM:{visible:['/(?:title|text)'],metadata:['/class']},
  BOOK_USAGE:{visible:['/text'],metadata:[]},
  SOURCE_UPDATE_REFERENCE:{visible:['/page','/targetIds/[0-9]+'],metadata:['/(?:sourceOccurrenceId|evidenceRole)']}
};
const matches=(path,patterns)=>patterns.some(pattern=>new RegExp(`^(?:${pattern})$`).test(path));
const fail=message=>{throw new Error(`AdMech application source oracle: ${message}`);};
export function enumerateExpectedFacts(book) {
  const facts=[],ids=new Set();
  for(const entity of book.entities) {
    if(ids.has(entity.id))fail(`Duplicate canonical owner ${entity.id}`);
    ids.add(entity.id);
    const shape=definitions[entity.kind];
    if(!shape)fail(`Unclassified canonical kind ${entity.kind}`);
    if(!entity.provenance?.sourceId||!entity.provenance?.sourcePath)fail(`Severed source evidence ${entity.id}`);
    const walk=(value,path)=>{
      if(value&&typeof value==='object') {
        if(Array.isArray(value))value.forEach((child,index)=>walk(child,[...path,index]));
        else Object.entries(value).forEach(([key,child])=>walk(child,[...path,key]));
        return;
      }
      const address=factPointer(path);
      if(matches(address,shape.visible))facts.push({id:factIdentity(entity.id,path),entityId:entity.id,
        cardId:entity.id,path,value:structuredClone(value),contextId:entity.parentId||entity.id,
        provenance:structuredClone(entity.provenance)});
      else if(!matches(address,shape.metadata))fail(`Unclassified canonical data ${entity.id}${address}`);
    };
    walk(entity.data,[]);
  }
  if(new Set(facts.map(fact=>fact.id)).size!==facts.length)fail('Duplicate source fact');
  return facts;
}

export function verifyCanonicalInventory(book) {
  const expected={DATASHEET:34,PROFILE:35,WEAPON_PROFILE:139,ARMY_RULE:1,
    ARMY_RULE_COMPONENT:3,DETACHMENT:10,DETACHMENT_RULE:10,ENHANCEMENT:34,STRATAGEM:51};
  for(const [kind,count]of Object.entries(expected)) {
    const found=book.entities.filter(entity=>entity.kind===kind).length;
    if(found!==count)fail(`${kind} source denominator ${found}/${count}`);
  }
  const index=new Map(book.entities.map(entity=>[entity.id,entity]));
  for(const unit of book.entities.filter(entity=>entity.kind==='DATASHEET'))for(const id of unit.data.profileIds) {
    if(index.get(id)?.kind!=='PROFILE'||index.get(id)?.parentId!==unit.id)fail(`Wrong profile owner ${id}`);
  }
  const mixed=index.get('unit-servitor-battleclade');
  const profiles=mixed.data.profileIds.map(id=>index.get(id));
  if(profiles.length!==2||profiles[0].data.stats.W!=='2'||profiles[1].data.stats.W!=='1')fail('Mixed-profile factual isolation');
  return expected;
}
