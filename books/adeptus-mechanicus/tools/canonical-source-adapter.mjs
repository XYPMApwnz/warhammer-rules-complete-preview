import {buildRelationGraphs} from '../../shared/tools/build-relation-graph.mjs';
import {bindRowsToCanonicalIds,canonicalTargetsFromProse} from '../../shared/tools/canonical-join-contract.mjs';
import {effectiveEffectContracts,validateEffectContractSet} from '../../shared/tools/effect-contract.mjs';
import {createEffectivePointsProjection} from '../../shared/tools/effective-points-projection.mjs';
import {persistCanonicalWeaponProfileIdentities} from '../../shared/tools/build-roster-catalog.mjs';
import ruleFactsApi from '../../shared/rule-facts.js';
import {createCoreFactProjection} from '../../core-rules/content/core-fact-projection.mjs';
import {createArmyCoreAbilityBindings} from '../../shared/tools/army-core-ability-binding.mjs';
import {createEffectiveMfmArmyProjection} from '../../shared/tools/effective-mfm-army-projection.mjs';
import {validateAttachmentGroupConstraintSet} from '../../shared/tools/attachment-group-constraint.mjs';

const titleKey=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const slugKey=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

export function createAdeptusMechanicusCanonicalModel(context){
  const {config,readJson}=context,sourcePaths=config.sources||{};
  const required=['factionRules','sourceTranscript','codexDetachments','codexParity','codexDatasheets','codexWargear','points','unitImages','manifest'];
  for(const key of required)if(!sourcePaths[key])throw new Error(`adeptus-mechanicus: sources.${key} is required`);
  const factionRules=readJson(sourcePaths.factionRules);
  const source=readJson(sourcePaths.sourceTranscript);
  const codexSource=readJson(sourcePaths.codexDetachments);
  const codexParity=readJson(sourcePaths.codexParity);
  const rawCodexDatasheets=readJson(sourcePaths.codexDatasheets);
  const codexWargear=readJson(sourcePaths.codexWargear);
  const mfmProjection=createEffectiveMfmArmyProjection(config.id),mfmPoints=mfmProjection.pointsForArmyBook(config.id),compatibilityPoints=readJson(sourcePaths.points);
  const compatibilityEnhancements=new Map(compatibilityPoints.enhancements.map(item=>[`${item.canonicalDetachmentId}\0${item.canonicalEnhancementId||item.id}`,item]));
  const pointsCatalog={...mfmPoints,source:{...mfmPoints.source,officialVersion:mfmPoints.source.version,officialUrl:compatibilityPoints.source.officialUrl},units:mfmPoints.units.map(item=>({...item,wargear:item.paidWargear})),enhancements:mfmPoints.enhancements.map(item=>{const compatibility=compatibilityEnhancements.get(`${item.canonicalDetachmentId}\0${item.canonicalEnhancementId}`);return{...item,...(compatibility?.profile?{profile:compatibility.profile}:{}),...(compatibility?.effect?{effect:compatibility.effect}:{})};})};
  const unitImages=readJson(sourcePaths.unitImages).units;
  const coreFactProjection=createCoreFactProjection({repoRoot:context.repo});
  const coreAbilityBindings=createArmyCoreAbilityBindings({repoRoot:context.repo,coreFactProjection});
  const codexDatasheets={...rawCodexDatasheets,datasheets:coreAbilityBindings.bindUnits(rawCodexDatasheets.datasheets)};
  const manifest=readJson(sourcePaths.manifest);
const boundParityDetachments=bindRowsToCanonicalIds(codexParity.detachments,codexSource.detachments,{label:'Adeptus Mechanicus Codex parity Detachment',rowId:item=>item.id||`detachment-${slugKey(item.title)}`});
const parityByDetachmentId=new Map(boundParityDetachments.map(item=>[item.canonicalId,item]));
const codex={...codexSource,detachments:codexSource.detachments.map(detachment=>{
  const parity=parityByDetachmentId.get(detachment.id);
  if(!parity)throw new Error(`Missing Codex parity layer for ${detachment.title}`);
  const enhancements=bindRowsToCanonicalIds(parity.enhancements,detachment.enhancements,{label:`${detachment.id} parity Enhancement`,rowId:item=>item.id||`enhancement-${slugKey(item.title)}`});
  const enhancementById=new Map(enhancements.map(item=>[item.canonicalId,item]));
  return {...detachment,rule:{...detachment.rule,text:parity.rule.text},enhancements:detachment.enhancements.map(item=>({...item,text:enhancementById.get(item.id)?.text||item.text}))};
})};
const withExactWargearSelections=unit=>({...unit,wargearAbilities:(unit.wargearAbilities||[]).map(ability=>{
  const requiredSelections=[...(ability.requiredSelections||[])];
  if(!requiredSelections.some(selection=>titleKey(typeof selection==='string'?selection:selection?.title)===titleKey(ability.title)))requiredSelections.push({title:ability.title,aliases:[ability.title]});
  return {...ability,requiredSelections};
})});
const abilityText=ability=>ability.text||[
  ability.openingText,
  ...(ability.options||[]).map(option=>`${option.title}: ${option.text}`)
].filter(Boolean).join('\n\n');
const enhancementsById=new Map(pointsCatalog.enhancements.map(item=>[item.canonicalEnhancementId||item.id,item]));
const factionDatasheets=new Map(factionRules.datasheets.filter(unit=>unit.status!=='Warhammer Legends').map(unit=>[unit.id,unit]));
const boundCodexWargear=bindRowsToCanonicalIds(codexWargear.units,codexDatasheets.datasheets,{label:'Adeptus Mechanicus wargear owner',rowId:item=>item.unitId||item.id||null});
const codexWargearByUnitId=new Map(boundCodexWargear.map(unit=>[unit.canonicalId,unit]));
const mergedDatasheets=coreAbilityBindings.bindUnits(codexDatasheets.datasheets.map(unit=>{
  const official=factionDatasheets.get(unit.id);
  if(!official){
    const exact=codexWargearByUnitId.get(unit.id);
    return exact?{...unit,wargear:exact.wargear,composition:exact.composition,wargearSource:{label:'Current 11e reference \u00b7 Wahapedia',url:exact.url}}:unit;
  }
  factionDatasheets.delete(unit.id);
  const extractedWargear=new Map((unit.wargearAbilities||[]).map(item=>[titleKey(item.title),item]));
  const officialWargear=(official.abilities||[]).filter(item=>extractedWargear.has(titleKey(item.title)));
  const abilities=(official.abilities||[]).filter(item=>!extractedWargear.has(titleKey(item.title)));
  if(!abilities.some(item=>item.title==='Doctrina Imperatives'))abilities.unshift({title:'Doctrina Imperatives',text:'This unit has the Doctrina Imperatives Faction ability.'});
  const wargearAbilities=[...extractedWargear.values()].map(item=>{
    const canonical=officialWargear.find(candidate=>titleKey(candidate.title)===titleKey(item.title))||item;
    return {...canonical,requiredSelections:[...(canonical.requiredSelections||[]),{title:canonical.title,aliases:[canonical.title]}]};
  });
  return {...unit,...official,abilities,wargearAbilities,category:unit.category,profiles:official.profiles||[{name:official.title,stats:official.stats}]};
}).concat([...factionDatasheets.values()]).map(withExactWargearSelections));
const publishedUnitIds=new Set(mergedDatasheets.map(unit=>unit.id));
const publishedGlossary=factionRules.glossary.filter(term=>term.id!=='warhammer-legends').map(term=>({...term,unitIds:(term.unitIds||[]).filter(unitId=>publishedUnitIds.has(unitId))}));
const rules={...factionRules,datasheets:mergedDatasheets,glossary:publishedGlossary,audit:{...factionRules.audit,datasheets:mergedDatasheets.length,legendsDatasheets:0,glossaryTerms:publishedGlossary.length}};
const boundPointUnits=bindRowsToCanonicalIds(pointsCatalog.units,rules.datasheets,{label:'Adeptus Mechanicus points Datasheet',rowId:item=>item.unitId||item.id||null});
const pointsByUnitId=new Map(boundPointUnits.map(({canonicalId,...unit})=>[canonicalId,unit]));
const attachments=[];
for(const leader of rules.datasheets){
  for(const ability of (leader.abilities||[]).filter(ability=>/^(leader|support)$/i.test(ability.title))){
    const text=abilityText(ability);if(!text)continue;
    for(const targetId of canonicalTargetsFromProse(text,rules.datasheets,{sourceId:leader.id,role:ability.title.toLowerCase(),excludeId:leader.id}))attachments.push({role:ability.title.toLowerCase(),sourceId:leader.id,targetId});
  }
}
for(const bodyguard of rules.datasheets){
  const text=[bodyguard.compositionText||bodyguard.composition||'',...(bodyguard.abilities||[]).filter(ability=>/^attached unit$/i.test(ability.title)).map(ability=>ability.text||'')].join(' ');
  const proxies=canonicalTargetsFromProse(text,rules.datasheets,{sourceId:bodyguard.id,role:'attachment proxy',excludeId:bodyguard.id});
  if(proxies.length>1)throw new Error(`${bodyguard.id}: attachment proxy must resolve at most once; got ${proxies.length}`);
  if(proxies.length===1)for(const edge of [...attachments])if(edge.targetId===proxies[0])attachments.push({...edge,targetId:bodyguard.id});
}
const unitById=new Map(rules.datasheets.map(unit=>[unit.id,unit]));
for(const id of Object.keys(unitImages))if(!unitById.has(id))throw new Error(`Unknown presentation unit image target: ${id}`);
for(const edge of attachments)if(edge.sourceId==='unit-cybernetica-datasmith'&&edge.targetId==='unit-kastelan-robots')Object.assign(edge,{mandatory:true,removeKeywords:['INFANTRY']});
const attachmentById=new Map(attachments.map(edge=>[[edge.role,edge.sourceId,edge.targetId].join('\0'),edge]));
const mfmRelationEdges=mfmProjection.relationEdges({effectiveUnitIds:rules.datasheets.map(unit=>unit.id),armyEdges:attachments});
const attachmentGroupConstraintSet=validateAttachmentGroupConstraintSet(config.sources.attachmentGroupConstraints?context.readJson(config.sources.attachmentGroupConstraints):{schema:'wh40k-attachment-group-constraints/v1',bookId:config.id,constraints:[]},{bookId:config.id,units:rules.datasheets});
const relationGraphs=buildRelationGraphs(rules.datasheets,mfmRelationEdges.map(edge=>({...edge,...attachmentById.get([edge.role,edge.sourceId,edge.targetId].join('\0'))})),{attachmentGroupConstraints:attachmentGroupConstraintSet.constraints});
const officialOrder=config.detachmentOrder;
const detachmentOwners=[...rules.detachments,...codex.detachments];
const mfmDetachments=new Map(pointsCatalog.detachments.map(item=>[item.id,item]));
const allDetachments=[...rules.detachments,...codex.detachments].map(detachment=>{
  const mfm=mfmDetachments.get(detachment.id);
  if(!mfm)throw new Error(`${detachment.title}: official MFM Detachment Points are missing`);
  return {...detachment,dp:mfm.dp,disposition:mfm.disposition,forceDispositions:mfm.forceDispositions,forceDispositionIds:mfm.forceDispositionIds,mfmRecordId:mfm.mfmRecordId,mfmForceDispositionIds:mfm.mfmForceDispositionIds,missionForceDispositionIds:mfm.missionForceDispositionIds,mfmQualifiers:mfm.mfmQualifiers||[]};
}).sort((a,b)=>officialOrder.indexOf(a.id)-officialOrder.indexOf(b.id));
const slugify=value=>String(value).toLowerCase().replaceAll('’','').replaceAll("'",'').replaceAll(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const canonicalCoreTerms=coreFactProjection.coreAbilities.map(term=>({
  id:term.id,
  title:term.title.replace(/^\[|\]$/g,''),
  group:'Core abilities',
  summary:term.summary,
  full:term.definition,
  aliases:term.aliases||[],
  fullRulePath:term.fullRulePath,
  unitIds:[]
}));
const glossaryTerms=[
  ...canonicalCoreTerms,
  ...rules.glossary.filter(term=>term.group!=='Core abilities').map(term=>({...term,group:'Faction & publication',unitIds:[...(term.unitIds||[])]})),
  ...allDetachments.flatMap(detachment=>(detachment.stratagems||[]).map(item=>{
    const text=[item.category,item.when&&`WHEN: ${item.when}`,item.target&&`TARGET: ${item.target}`,item.effect&&`EFFECT: ${item.effect}`,item.restrictions&&`RESTRICTIONS: ${item.restrictions}`].filter(Boolean).join(' ');
    return{id:item.id,title:item.title,summary:text,full:text,group:'Stratagems',rule:item.id,unitIds:[]};
  }))
];
const termKeys=new Map(glossaryTerms.filter(term=>term.group!=='Core abilities').map(term=>[term.title.toLowerCase(),term]));
const coreTermsById=new Map(glossaryTerms.filter(term=>term.group==='Core abilities').map(term=>[term.id,term]));
const coreTermKeys=new Map();
for(const term of glossaryTerms.filter(term=>term.group==='Core abilities'))for(const label of [term.title,...(term.aliases||[])])coreTermKeys.set(titleKey(label.replace(/^core-|^datasheet-/i,'').replace(/^\[|\]$/g,'')),term);
const coreBaseKey=value=>{
  const normalized=titleKey(value).replace(/\s+(?:d\d+|\d+|\d+\+|\d+ inches)$/,'').trim();
  return normalized.startsWith('anti ')?'anti':normalized;
};
const termIds=new Set(glossaryTerms.map(term=>term.id));
const uniqueTermId=base=>{let id=base,index=2;while(termIds.has(id))id=`${base}-${index++}`;termIds.add(id);return id;};
const attachUnit=(term,unitId)=>{if(!term.unitIds.includes(unitId))term.unitIds.push(unitId);};
for(const unit of rules.datasheets){
  for(const ability of [...unit.abilities,...(unit.wargearAbilities||[])]){
    const key=ability.title.toLowerCase();
    let term=ability.coreAbilityId?coreTermsById.get(ability.coreAbilityId):termKeys.get(key);
    if(!term){
    const full=abilityText(ability)||`${ability.title} is listed on the ${unit.title} datasheet.`;
      term={id:uniqueTermId(`datasheet-${slugify(ability.title)}`),title:ability.title,group:'Datasheet abilities',summary:full.split(/(?<=[.!?])\s/)[0],full,sectionId:unit.id,unitIds:[]};
      glossaryTerms.push(term);termKeys.set(key,term);
    }
    attachUnit(term,unit.id);ability.termId=term.id;
  }
  for(const weapon of unit.weapons){
    const profile=`${weapon.mode==='ranged'?'Ranged':'Melee'} · ${weapon.range} · A ${weapon.a} · ${weapon.mode==='ranged'?'BS':'WS'} ${weapon.skill} · S ${weapon.s} · AP ${weapon.ap} · D ${weapon.d}${weapon.abilities?` · ${weapon.abilities}`:''}`;
    const key=`weapon:${weapon.name.toLowerCase()}:${profile}`;
    let term=termKeys.get(key);
    if(!term){
      term={id:uniqueTermId(`weapon-${slugify(weapon.name.replace(/^➤\s*/,''))}`),title:weapon.name.replace(/^➤\s*/,''),group:'Weapon profiles',summary:profile,full:profile,sectionId:unit.id,unitIds:[]};
      glossaryTerms.push(term);termKeys.set(key,term);
    }
    attachUnit(term,unit.id);weapon.termId=term.id;
  }
}
rules.glossary=glossaryTerms;
rules.audit.glossaryTerms=glossaryTerms.length;
  return {factionRules,source,codex,codexDatasheets,pointsCatalog,manifest,boundPointUnits,unitImages,pointsByUnitId,titleKey,slugKey,abilityText,enhancementsById,rules,relationGraphs,allDetachments,slugify,coreTermKeys,coreBaseKey,termIds,canonicalJoinContract:'v1'};
}

const escapeRegExp=value=>String(value).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const normalizeDecoratedTerm=value=>String(value)
  .replace(/^\[/,'')
  .replace(/\]$/,'')
  .replace(/\s+\d+\+$/,'')
  .trim()
  .toLowerCase();

const createTermResolver=glossary=>{
  const termsByKey=new Map();
  for(const term of [...glossary].sort((left,right)=>right.title.length-left.title.length)){
    for(const variant of [term.title,...(term.aliases||[])]){
      const key=normalizeDecoratedTerm(variant);
      if(!key)continue;
      const candidates=termsByKey.get(key)||[];
      if(!candidates.includes(term))candidates.push(term);
      termsByKey.set(key,candidates);
    }
  }
  const alternation=[...termsByKey.keys()].sort((left,right)=>right.length-left.length).map(escapeRegExp).join('|');
  const pattern=alternation?new RegExp(`(^|[^A-Za-z0-9])((?:\\[)?(?:${alternation})(?:\\])?(?:\\s+\\d+\\+)?)(?=$|[^A-Za-z0-9])`,'gi'):null;
  const resolve=(key,unitId)=>{
    const candidates=termsByKey.get(key)||[];
    return candidates.find(term=>term.group==='Core abilities')
      ||candidates.find(term=>unitId&&(term.unitIds||[]).includes(unitId))
      ||candidates[0];
  };
  return (value,unitId='')=>{
    if(!pattern)return [];
    const raw=String(value??'').replace(/[ \t]+\n/g,'\n'),ids=[];
    pattern.lastIndex=0;
    for(let match=pattern.exec(raw);match;match=pattern.exec(raw)){
      const term=resolve(normalizeDecoratedTerm(match[2]),unitId);
      if(term)ids.push(term.id);
    }
    return ids;
  };
};

const ruleFactsFor=(unit,{abilityText,relationGraphs,termIdsInPresentationOrder})=>{
  const sourceAbilities=[...(unit.abilities||[])];
  const abilityNames=sourceAbilities.flatMap(item=>/^core$/i.test(item.title)
    ?abilityText(item).split(',').map(value=>value.trim().replace(/\.$/,'')).filter(Boolean).map(value=>/^deadly demise\b/i.test(value)?'DEADLY DEMISE':value)
    :[/^deadly demise\b/i.test(item.title)?'DEADLY DEMISE':item.title]);
  const relations=relationGraphs.get(unit.id),mandatory=Object.values(relations).flat().some(relation=>relation.mandatory),canAttach=Object.values(relations).some(items=>items.length);
  return {
    id:unit.id,
    unitId:unit.id,
    slug:unit.id.replace(/^unit-/,''),
    keywords:unit.keywords,
    intrinsicKeywords:unit.keywords,
    abilities:[...new Set(abilityNames)],
    termIds:[...new Set(termIdsInPresentationOrder)],
    epic:unit.keywords.includes('Epic Hero'),
    deadlyDemise:sourceAbilities.some(item=>item.coreAbilityId==='core-deadly-demise'),
    attached:mandatory?true:canAttach?null:false,
    attachmentKnown:mandatory||!canAttach,
    formationRequired:mandatory,
    characterCount:unit.keywords.includes('Character')?1:0,
    twoCharacters:null,
    warlord:null,
    relations
  };
};

export function buildAdeptusMechanicusEffectiveModelInput(context,canonicalModel=createAdeptusMechanicusCanonicalModel(context)){
  const {config}=context;
  const {factionRules,source,codex,codexDatasheets,pointsCatalog,manifest,boundPointUnits,unitImages,pointsByUnitId,slugKey,abilityText,rules,relationGraphs,allDetachments}=canonicalModel;
  const decoratedTermIds=createTermResolver(rules.glossary);
  const abilityKind=item=>{
    if(/^doctrina imperatives$/i.test(item.title))return 'faction';
    if(/^(leader|support|attached unit)$/i.test(item.title))return 'relation';
    if(/^damaged:/i.test(item.title))return 'damaged';
    if(/^transport$/i.test(item.title))return 'transport';
    if(/^core$/i.test(item.title)||item.coreAbilityId)return 'core';
    return 'datasheet';
  };
  const visibleTermIds=unit=>{
    const grouped={core:[],faction:[],datasheet:[],relation:[],damaged:[],transport:[]};
    for(const item of unit.abilities||[])(grouped[abilityKind(item)]||grouped.datasheet).push(item);
    const ids=[];
    for(const mode of ['ranged','melee'])for(const weapon of (unit.weapons||[]).filter(item=>item.mode===mode))ids.push(weapon.termId,...decoratedTermIds(weapon.abilities,unit.id));
    for(const item of grouped.core)ids.push(...(/^core$/i.test(item.title)?decoratedTermIds(abilityText(item),unit.id):[item.termId]));
    for(const item of grouped.faction)ids.push(...(/^core$/i.test(item.title)?decoratedTermIds(abilityText(item),unit.id):[item.termId]));
    const abilityTerms=item=>[item.termId,...decoratedTermIds(item.openingText,unit.id),...(item.options||[]).flatMap(option=>decoratedTermIds(option.text,unit.id)),...decoratedTermIds(item.text,unit.id)];
    for(const kind of ['datasheet','relation','transport','damaged'])for(const item of grouped[kind])ids.push(...abilityTerms(item));
    const compositionText=unit.compositionText||(!Array.isArray(unit.composition)?unit.composition:'');
    if(compositionText){
      const normalized=String(compositionText).toLowerCase().replaceAll(' & ',' and ').replaceAll('-', ' ');
      const candidates=new Map();
      for(const weapon of unit.weapons||[]){const key=String(weapon.name).toLowerCase().replaceAll(' & ',' and ').replaceAll('-', ' ');const values=candidates.get(key)||[];if(!values.includes(weapon.termId))values.push(weapon.termId);candidates.set(key,values);}
      for(const [key,values] of candidates)if(values.length===1&&(normalized.includes(key)||normalized.includes(`${key}s`)))ids.push(values[0]);
    }
    for(const item of Array.isArray(unit.wargear)?unit.wargear:[unit.wargear])ids.push(...decoratedTermIds(item,unit.id));
    const wargearAbilities=unit.wargearAbilities||[],gatedTermIds=new Set(wargearAbilities.map(item=>item.termId).filter(Boolean));
    for(const item of wargearAbilities)ids.push(...abilityTerms(item));
    return ids.filter(id=>id&&!gatedTermIds.has(id));
  };
  const compiledRuleFacts=new Map(rules.datasheets.map(unit=>[unit.id,ruleFactsFor(unit,{abilityText,relationGraphs,termIdsInPresentationOrder:visibleTermIds(unit)})]));
  const compiledRuleProfiles=new Map([...compiledRuleFacts].map(([id,facts])=>[id,ruleFactsApi.serializeRuleProfile(ruleFactsApi.profileFromRecord(facts))]));
  const pointsOrderedDatasheets=boundPointUnits.map(publication=>{
    const unit=rules.datasheets.find(candidate=>candidate.id===publication.canonicalId);
    if(!unit)throw new Error(`Adeptus Mechanicus: points unit does not resolve: ${publication.canonicalId}`);
    return unit;
  });
  const sourceEnhancements=new Map();
  for(const detachment of allDetachments)for(const enhancement of detachment.enhancements||[]){
    const key=`${detachment.id}\0${enhancement.id}`;
    if(sourceEnhancements.has(key))throw new Error(`Adeptus Mechanicus: duplicate scoped Enhancement identity ${detachment.id}/${enhancement.id}`);
    sourceEnhancements.set(key,enhancement);
  }
  const pointEnhancementByScope=new Map(pointsCatalog.enhancements.map(publication=>[`${publication.canonicalDetachmentId}\0${publication.canonicalEnhancementId||publication.id}`,publication]));
  const enhancementFor=(publication,detachment,sourceRecord)=>{
    if(publication.canonicalDetachmentId!==detachment.id)throw new Error(`Adeptus Mechanicus: ${publication.id} references unknown Detachment ${publication.canonicalDetachmentId}`);
    const id=publication.canonicalEnhancementId||publication.id;
    const owner=publication.owner||sourceRecord.eligibility?.owner||null;
    const assignment=publication.assignment||sourceRecord.assignment||sourceRecord.eligibility?.assignment||null;
    const tags=[...(publication.tags||sourceRecord.tags||sourceRecord.eligibility?.tags||[])];
    return {
      ...sourceRecord,
      id,
      sourceId:publication.sourceId||sourceRecord.sourceId||sourceRecord.id||null,
      ruleId:sourceRecord.ruleId||id,
      legacyKey:publication.legacyKey||sourceRecord.ruleId||sourceRecord.id||null,
      detachmentId:detachment.id,
      detachmentTitle:detachment.title,
      sourceBookId:config.id,
      title:publication.title||sourceRecord.title,
      runtimeTitle:sourceRecord.title,
      value:Number(publication.value),
      owner,
      assignment,
      tags,
      text:sourceRecord.text||publication.text||'',
      eligibility:{...(sourceRecord.eligibility||{}),v:sourceRecord.eligibility?.v||1,tags,owner,assignment},
      mfmRecordId:publication.mfmRecordId||null,
      mfmQualifiers:publication.mfmQualifiers||[],
      ...(publication.profile?{profile:publication.profile}:{}),
      ...(publication.effect?{legacyEffect:publication.effect}:{}),
      publicationRecord:publication
    };
  };
  const enhancements=allDetachments.flatMap(detachment=>(detachment.enhancements||[]).map(sourceRecord=>{
    const publication=pointEnhancementByScope.get(`${detachment.id}\0${sourceRecord.id}`);
    if(!publication)throw new Error(`Adeptus Mechanicus: ${sourceRecord.id} has no points record in ${detachment.id}`);
    return enhancementFor(publication,detachment,sourceRecord);
  }));
  if(enhancements.length!==sourceEnhancements.size)throw new Error(`Adeptus Mechanicus: effective Enhancement inventory ${enhancements.length} does not cover ${sourceEnhancements.size} canonical rules`);
  const units=rules.datasheets.map(unit=>{
    const publication=pointsByUnitId.get(unit.id),ruleFacts=compiledRuleFacts.get(unit.id),ruleProfile=compiledRuleProfiles.get(unit.id);
    return persistCanonicalWeaponProfileIdentities({...unit,sourceBookId:config.id,publicationState:unit.status==='Warhammer Legends'?'Warhammer Legends':'Current',intrinsicKeywords:[...(unit.keywords||[])],points:publication?.points||[],paidWargear:publication?.wargear||[],ruleFacts,ruleProfile,publicationRecord:publication});
  });
  const detachmentOrder=new Map(pointsCatalog.detachments.map((item,index)=>[item.id,index]));
  const factionDetachmentIds=new Set(factionRules.detachments.map(item=>item.id)),glossarySourceOrder=new Map([...factionRules.detachments,...codex.detachments].map((item,index)=>[item.id,index]));
  const detachmentRecord=item=>{const {dp,disposition,...canonical}=item;return {
    ...canonical,
    enhancements:(canonical.enhancements||[]).map(({text,...enhancement})=>enhancement),
    sourceBookId:config.id,
    detachmentPoints:Number(String(dp||0).match(/\d+/)?.[0]||0),
    forceDispositions:item.forceDispositions||[disposition].filter(Boolean),
    forceDisposition:disposition||'',
    glossarySourceRevision:factionDetachmentIds.has(item.id)?factionRules.version||'Faction Pack v1.0':'Codex carry-forward + Faction Pack v1.1',
    glossarySourceOrder:glossarySourceOrder.get(item.id),
    mfmRecordId:item.mfmRecordId,
    mfmForceDispositionIds:item.mfmForceDispositionIds||[],
    missionForceDispositionIds:item.missionForceDispositionIds||[],
    forceDispositionIds:item.forceDispositionIds||[],
    mfmQualifiers:item.mfmQualifiers||[],
    publicationRecord:{title:item.title,detachmentPoints:dp,forceDispositions:item.forceDispositions||[disposition].filter(Boolean),forceDispositionIds:item.forceDispositionIds||[],mfmForceDispositionIds:item.mfmForceDispositionIds||[],missionForceDispositionIds:item.missionForceDispositionIds||[],forceDisposition:disposition}
  };};
  const detachments=allDetachments.map(detachmentRecord);
  const effectContractSet=config.sources.effectContracts?validateEffectContractSet(context.readJson(config.sources.effectContracts),{expectedBookId:config.id}):{schema:'wh40k-effect-contracts/v1',bookId:config.id,contracts:[]};
  const effectContracts=effectiveEffectContracts([effectContractSet],config.id);
  const effectiveUnits=units;
  const effectiveUnitById=new Map(effectiveUnits.map(unit=>[unit.id,unit])),effectiveDetachmentById=new Map(detachments.map(item=>[item.id,item])),effectiveEnhancementByScope=new Map(enhancements.map(item=>[`${item.detachmentId}\0${item.id}`,item]));
  const effectivePointsProjection=createEffectivePointsProjection({
    book:{id:config.id,title:config.title,parentBookId:null},
    units:pointsOrderedDatasheets.map(unit=>effectiveUnitById.get(unit.id)),
    detachments:[...allDetachments].sort((left,right)=>(detachmentOrder.get(left.id)??Infinity)-(detachmentOrder.get(right.id)??Infinity)).map(item=>effectiveDetachmentById.get(item.id)),
    enhancements:pointsCatalog.enhancements.map(item=>effectiveEnhancementByScope.get(`${item.canonicalDetachmentId}\0${item.canonicalEnhancementId||item.id}`))
  });
  return {
    schema:'wh40k-effective-book-model/v1',
    book:{id:config.id,title:config.title,shortTitle:config.shortTitle||config.title,edition:config.edition||null,factionKeyword:config.factionKeyword||null,parentBookId:null,dependencies:[]},
    units:effectiveUnits,
    detachments,
    enhancements,
    relationGraphs,
    rules:{source:rules.source,armyRule:rules.armyRule,updates:rules.updates,audit:rules.audit},
    effectContractSet,
    effectContracts,
    effectivePointsProjection,
    glossary:structuredClone(rules.glossary),
    sourceMetadata:{manifest,primary:rules.source,transcript:source.meta,codex:codex.source,datasheets:codexDatasheets.source,points:pointsCatalog.source,officialMfm:pointsCatalog.source},
    presentation:{unitImages,sourceTranscript:source,codexSource:codex.source,codexDatasheetsSource:codexDatasheets.source}
  };
}
