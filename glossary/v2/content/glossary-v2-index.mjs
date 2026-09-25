import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createEffectiveCoreCatalog} from '../../../books/core-rules/content/effective-core-catalog.mjs';
import {createCanonicalBuildContext} from '../../../books/shared/tools/canonical-build-contract.mjs';
import {buildCanonicalBook} from '../../../books/shared/tools/build-army-book.mjs';
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';
import {createEffectiveMissionCatalog,MISSION_SCOPES} from '../../../missions/content/effective-mission-catalog.mjs';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const BOOK_IDS=Object.freeze(['death-guard','adeptus-mechanicus','tyranids','tau-empire','emperors-children','chaos-space-marines','space-marines','dark-angels','blood-angels']);
const FACTUAL_INPUTS=Object.freeze([
  'books/core-rules/content/effective-core-catalog.mjs',
  'books/shared/tools/build-army-book.mjs#projectionOnly',
  'mfm/content/effective-mfm-catalog.mjs',
  'missions/content/effective-mission-catalog.mjs'
]);
const PRESENTATION_INPUTS=Object.freeze(['glossary/editorial-contracts.v1.json','glossary/resolutions.en.json','glossary/supplemental-terms.en.json']);
const MISSION_PARTITIONS=Object.freeze(['forceDispositions','primaryMissions','secondaryMissions','deployments','twists','missionSequenceRules','missionReferenceRules','forceDispositionMatchups','terrainLayouts']);
const CORE_ALIAS_ONLY_ERRATA=new Set(['core-errata-15-05','core-errata-15-06']);
const REQUIRED_EFFECTIVE_ARMY_GLOSSARY_FACTS=Object.freeze({
  'adeptus-mechanicus':Object.freeze(['recon-augury','data-psalm','halo-override'])
});
const CORE_SUPPORT_OCCURRENCES=Object.freeze(new Map([
  ['chaos-space-marines-ability-support',Object.freeze({bookId:'chaos-space-marines',unitId:'unit-masters-of-the-maelstrom',coreId:'core-rule-19-01-forming-attached-units'})],
  ['space-marines-ability-support-3',Object.freeze({bookId:'space-marines',unitId:'unit-cato-sicarius',coreId:'core-rule-19-01-forming-attached-units'})],
  ['space-marines-ability-support-4',Object.freeze({bookId:'space-marines',unitId:'unit-wardens-of-ultramar',coreId:'core-rule-19-01-forming-attached-units'})]
]));

const clone=value=>structuredClone(value);
const readJson=relative=>JSON.parse(fs.readFileSync(path.join(repo,relative),'utf8'));
const sortStrings=values=>[...new Set(values.filter(Boolean))].sort((left,right)=>left.localeCompare(right));
const entryId=(domain,...ids)=>[domain,...ids].join('::');
const deepFreeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const child of Object.values(value))deepFreeze(child);Object.freeze(value);}return value;};
const sourceBook=(record,fallback)=>record?.sourceBookId||record?.dependencyBook||fallback;

function semanticText(value,{skip=new Set()}={}){
  const strings=[];
  const visit=(item,key='')=>{
    if(skip.has(key)||item===null||item===undefined)return;
    if(typeof item==='string'){if(item.trim())strings.push(item.trim());return;}
    if(typeof item==='number'||typeof item==='boolean')return;
    if(Array.isArray(item)){for(const child of item)visit(child,key);return;}
    if(typeof item==='object')for(const [childKey,child] of Object.entries(item))visit(child,childKey);
  };
  visit(value);
  return sortStrings(strings).join('\n');
}

function factsWithoutPresentation(record){
  const result=clone(record);
  for(const field of ['publicationRecord','compatibilityIdentity','referenceUrl','runtimeTitle'])delete result[field];
  return result;
}

function createEntry({id,domain,recordType,label,aliases=[],canonicalId,parent=null,references=[],provenance=null,currentness=null,sourceOwner,facts,contexts=[]}){
  return {id,domain,recordType,label,aliases:sortStrings(aliases),searchableContent:semanticText(facts,{skip:new Set(['id','sourceId','sourceBookId','recordType','sourceArtifact','sourceCaptureSha256','contentHash'])}),parent,canonicalReferences:references,currentness,provenance,sourceOwner,facts,contexts,presentation:{}};
}

function upsertEntry(entries,entry,context){
  const existing=entries.get(entry.id);
  if(!existing){if(context)entry.contexts=[context];entries.set(entry.id,entry);return entry;}
  if(existing.domain!==entry.domain||existing.recordType!==entry.recordType||existing.sourceOwner.canonicalId!==entry.sourceOwner.canonicalId)throw new Error(`Glossary V2 identity collision: ${entry.id}`);
  if(context&&existing.recordType==='UNIT'&&context.effectiveBookId!==existing.sourceOwner.bookId&&JSON.stringify(existing.facts)!==JSON.stringify(entry.facts)){
    const factOverrides={},omittedFactFields=[];
    for(const field of new Set([...Object.keys(existing.facts||{}),...Object.keys(entry.facts||{})])){
      if(!(field in (entry.facts||{}))){omittedFactFields.push(field);continue;}
      if(JSON.stringify(existing.facts?.[field])!==JSON.stringify(entry.facts[field]))factOverrides[field]=clone(entry.facts[field]);
    }
    context={...context,factOverrides};if(omittedFactFields.length)context.omittedFactFields=omittedFactFields.sort();
  }
  if(context&&!existing.contexts.some(item=>JSON.stringify(item)===JSON.stringify(context)))existing.contexts.push(context);
  existing.aliases=sortStrings([...existing.aliases,...entry.aliases]);
  for(const reference of entry.canonicalReferences)if(!existing.canonicalReferences.some(item=>item.id===reference.id&&item.relationType===reference.relationType))existing.canonicalReferences.push(reference);
  return existing;
}

function normalizeReferences(record,domain){
  const refs=[];
  for(const [kind,value] of Object.entries(record.relationships||{}))for(const id of (Array.isArray(value)?value:[value]).filter(Boolean))refs.push({domain:'CORE',id:entryId('core',id),canonicalId:id,relationType:kind});
  for(const ref of record.references||[])refs.push({domain:ref.relationType==='CORE_RULE'?'CORE':domain,id:ref.relationType==='CORE_RULE'?entryId('core',ref.id):entryId('missions',ref.id),canonicalId:ref.id,relationType:ref.relationType});
  return refs;
}

function addCoreEntries(entries,coreCatalog){
  for(const record of coreCatalog.records){
    if(record.state!=='FULL_CONTENT'||CORE_ALIAS_ONLY_ERRATA.has(record.id))continue;
    upsertEntry(entries,createEntry({
      id:entryId('core',record.id),domain:'CORE',recordType:record.recordType,label:record.title,aliases:record.parameters?.aliases||[],canonicalId:record.id,
      references:normalizeReferences(record,'CORE'),provenance:record.provenance,currentness:{asOf:coreCatalog.asOf,state:record.state},sourceOwner:{domain:'CORE',canonicalId:record.id,interface:'createEffectiveCoreCatalog()'},facts:factsWithoutPresentation(record)
    }));
  }
  for(const record of coreCatalog.errata.filter(item=>CORE_ALIAS_ONLY_ERRATA.has(item.id))){
    const targetId=record.relationships?.targetRuleId,target=entries.get(entryId('core',targetId));
    if(!target)throw new Error(`${record.id}: alias-only Core erratum target ${targetId} is absent`);
    target.aliases=sortStrings([...target.aliases,record.id,...(record.parameters?.aliases||[])]);
    target.presentation.compatibilityRecords??=[];target.presentation.compatibilityRecords.push({id:record.id,recordType:record.recordType,operation:record.operation});
  }
}

function unitContext(model,record){return {effectiveBookId:model.book.id,sourceBookId:sourceBook(record,model.book.id)};}

function addArmyEntry(entries,model,recordType,record,{parentId=null,canonicalId=record.id,label=record.title||record.name,aliases=[],facts=record,references=[],ownerBookId=null,contextData={}}={}){
  if(!canonicalId)throw new Error(`${model.book.id}: ${recordType} has no stable canonical identity`);
  const ownerBook=ownerBookId||sourceBook(record,model.book.id),id=entryId('army',ownerBook,recordType.toLowerCase(),...(parentId?[parentId]:[]),canonicalId),context={...unitContext(model,{...record,sourceBookId:ownerBook}),...contextData};
  return upsertEntry(entries,createEntry({id,domain:'ARMY',recordType,label,aliases,canonicalId,parent:parentId?{domain:'ARMY',canonicalId:parentId}:null,references,provenance:record.provenance||record.source||null,currentness:{publicationState:record.publicationState||record.status||'CURRENT'},sourceOwner:{domain:'ARMY',bookId:ownerBook,canonicalId,interface:'buildCanonicalBook(...,{projectionOnly:true})'},facts:factsWithoutPresentation(facts)}),context);
}

function addGenericUnitChildren(entries,lookups,model,unit){
  const ownerBook=sourceBook(unit,model.book.id),unitEntry=lookups.unit.get(`${model.book.id}::${unit.id}`);
  for(const ability of [...(unit.abilities||[]),...(unit.wargearAbilities||[])]){
    const stableId=ability.termId||ability.id||ability.sourceAbilityId,supportOccurrence=CORE_SUPPORT_OCCURRENCES.get(stableId);
    if(supportOccurrence){
      if(model.book.id!==supportOccurrence.bookId||unit.id!==supportOccurrence.unitId)throw new Error(`${model.book.id}/${unit.id}: conflicting Support occurrence ${stableId}`);
      if(String(ability.text||'').trim())throw new Error(`${model.book.id}/${unit.id}: Support occurrence ${stableId} unexpectedly owns gameplay text`);
      const core=entries.get(entryId('core',supportOccurrence.coreId));
      if(!core)throw new Error(`${model.book.id}/${unit.id}: unknown Core Support owner ${supportOccurrence.coreId}`);
      core.aliases=sortStrings([...core.aliases,stableId]);
      const context={effectiveBookId:model.book.id,sourceBookId:ownerBook,parentUnitId:unit.id,sourceAbilityId:ability.sourceAbilityId||null,termId:stableId};
      if(!core.contexts.some(item=>JSON.stringify(item)===JSON.stringify(context)))core.contexts.push(context);
      continue;
    }
    if(ability.coreAbilityId){const coreId=entryId('core',ability.coreAbilityId),core=entries.get(coreId);if(!core)throw new Error(`${model.book.id}/${unit.id}: unknown Core ability ${ability.coreAbilityId}`);core.contexts.push({effectiveBookId:model.book.id,sourceBookId:ownerBook,parentUnitId:unit.id,sourceAbilityId:ability.sourceAbilityId||null,termId:ability.termId||null});continue;}
    if(!stableId)throw new Error(`${model.book.id}/${unit.id}: local ability ${ability.title} has no stable identity`);
    const armyRule=lookups.armyRule.get(`${model.book.id}::${stableId}`);
    if(armyRule){
      const context={effectiveBookId:model.book.id,sourceBookId:ownerBook,parentUnitId:unit.id,sourceAbilityId:ability.sourceAbilityId||null,termId:stableId};
      if(!armyRule.contexts.some(item=>JSON.stringify(item)===JSON.stringify(context)))armyRule.contexts.push(context);
      continue;
    }
    const wargear=unit.wargearAbilities?.includes(ability);
    addArmyEntry(entries,model,wargear?'WARGEAR_ABILITY':'ABILITY',ability,{parentId:wargear?unit.id:null,canonicalId:stableId,ownerBookId:ownerBook,contextData:{parentUnitId:unit.id},references:[{domain:'ARMY',id:unitEntry.id,canonicalId:unit.id,relationType:'PARENT_UNIT'}]});
  }
  for(const weapon of unit.weapons||[]){
    if(!weapon.id||weapon.sourceUnitId!==unit.id)throw new Error(`${model.book.id}/${unit.id}: weapon profile lacks persistent parent-scoped identity`);
    addArmyEntry(entries,model,'WEAPON_PROFILE',weapon,{parentId:unit.id,canonicalId:weapon.id,label:weapon.name,aliases:weapon.termId?[weapon.termId]:[],ownerBookId:ownerBook,contextData:{parentUnitId:unit.id},references:[{domain:'ARMY',id:unitEntry.id,canonicalId:unit.id,relationType:'PARENT_UNIT'}]});
  }
}

function addStructuredUnitChildren(entries,lookups,model,unit){
  const unitEntry=lookups.unit.get(`${model.book.id}::${unit.id}`),ownerBook=sourceBook(unit,model.book.id);
  const blocks=[...(unit.blocks||[]),...(unit.subsections||[]).flatMap(section=>section.blocks||[])];
  for(const block of blocks){
    if(block.type==='ability'){
      const stableId=block.termId||block.id;
      if(!stableId)throw new Error(`${model.book.id}/${unit.id}: structured ability ${block.title} has no stable identity`);
      const aggregate=['CORE','FACTION'].includes(block.title)&&!block.termId;
      addArmyEntry(entries,model,'ABILITY',block,{parentId:aggregate?unit.id:null,canonicalId:stableId,ownerBookId:ownerBook,contextData:{parentUnitId:unit.id},references:[{domain:'ARMY',id:unitEntry.id,canonicalId:unit.id,relationType:'PARENT_UNIT'}]});
    }
    if(block.type==='weapon')for(const profile of block.profiles?.length?block.profiles:[block]){
      const stableId=profile.id||profile.termId;
      if(!stableId)throw new Error(`${model.book.id}/${unit.id}: structured weapon ${profile.name||block.title} has no stable identity`);
      addArmyEntry(entries,model,'WEAPON_PROFILE',profile,{parentId:unit.id,canonicalId:stableId,label:profile.name||block.title,ownerBookId:ownerBook,contextData:{parentUnitId:unit.id},references:[{domain:'ARMY',id:unitEntry.id,canonicalId:unit.id,relationType:'PARENT_UNIT'}]});
    }
  }
}

function addRequiredEffectiveArmyGlossaryFacts(entries,model){
  const required=REQUIRED_EFFECTIVE_ARMY_GLOSSARY_FACTS[model.book.id]||[];
  if(!required.length)return;
  const byId=new Map((model.glossary||[]).map(record=>[record.id,record]));
  for(const id of required){
    const record=byId.get(id);
    if(!record?.title||!record?.full||!record?.sectionId)throw new Error(`${model.book.id}: required effective Army glossary fact ${id} is incomplete`);
    const owner=[...entries.values()].find(entry=>entry.domain==='ARMY'&&entry.sourceOwner.bookId===model.book.id&&entry.sourceOwner.canonicalId===record.sectionId);
    if(!owner)throw new Error(`${model.book.id}: ${id} references missing canonical Army rule ${record.sectionId}`);
    addArmyEntry(entries,model,'FACTION_TERM',record,{
      canonicalId:record.id,
      aliases:record.aliases||[],
      facts:{id:record.id,title:record.title,summary:record.summary,text:record.full,sectionId:record.sectionId},
      references:[{domain:'ARMY',id:owner.id,canonicalId:record.sectionId,relationType:'DEFINED_BY_RULE'}]
    });
  }
}

function addDeathGuardArmyRuleComponents(entries,model,lookups){
  if(model.book.id!=='death-guard')return;
  const ownerId='army-rule-nurgles-gift',owner=lookups.armyRule.get(`${model.book.id}::${ownerId}`),rule=(model.rules?.armyRules||[]).find(record=>record.id===ownerId)||model.rules?.armyRule;
  if(!owner||rule?.id!==ownerId)throw new Error('death-guard: Nurgle\u2019s Gift factual owner is unavailable');
  const rangeTable=(rule.blocks||[]).find(block=>block.type==='table'&&block.columns?.includes('Contagion Range'));
  const rangeCap=(rule.blocks||[]).find(block=>block.id==='contagion-range-cap');
  if(!rangeTable||!rangeCap)throw new Error('death-guard: Contagion Range structured facts are incomplete');
  const components=[
    {id:'contagion-range',title:'Contagion Range',blocks:[rangeTable,rangeCap]},
    ...['afflicted','skullsquirm-blight','rattlejoint-ague','scabrous-soulrot'].map(id=>{
      const subsection=(rule.subsections||[]).find(record=>record.id===id);
      if(!subsection)throw new Error(`death-guard: Nurgle\u2019s Gift component ${id} is unavailable`);
      return subsection;
    })
  ];
  for(const component of components)addArmyEntry(entries,model,'ARMY_RULE_COMPONENT',component,{
    parentId:ownerId,
    references:[{domain:'ARMY',id:owner.id,canonicalId:ownerId,relationType:'PARENT_ARMY_RULE'}]
  });
}

function deathGuardUnitArticleFacts(unit){
  const statline=(unit.blocks||[]).find(block=>block.type==='statline');
  const composition=(unit.subsections||[]).find(section=>section.title==='Unit Composition');
  if(!statline?.values||!composition)throw new Error(`death-guard/${unit.id}: structured Unit article facts are incomplete`);
  const paragraphText=blocks=>(blocks||[]).filter(block=>block.type==='p'&&String(block.text||'').trim()).map(block=>block.text.trim());
  const notes=paragraphText(unit.blocks);
  const referenceSections=(unit.subsections||[])
    .filter(section=>!['Abilities','Keywords','Unit Composition','Wargear Abilities'].includes(section.title))
    .map(section=>({title:section.title,lines:paragraphText(section.blocks)}))
    .filter(section=>section.lines.length);
  return {
    id:unit.id,title:unit.title,publicationState:unit.publicationState,category:unit.category,
    profiles:[{name:unit.title,stats:clone(statline.values)}],
    composition:paragraphText(composition.blocks).join('\n'),
    keywords:clone(unit.intrinsicKeywords||unit.ruleFacts?.intrinsicKeywords||[]),
    ruleFacts:unit.ruleFacts||null,
    notes,
    referenceSections
  };
}

function detachmentArticleFacts(model,detachment){
  const article={id:detachment.id,title:detachment.title,tagline:detachment.tagline,restrictions:detachment.restrictions,tags:detachment.tags,sourcePages:detachment.sourcePages,provenance:detachment.provenance};
  const canonicalRules=(model.detachmentRules||[]).filter(rule=>rule.detachmentId===detachment.id).map(factsWithoutPresentation);
  if(canonicalRules.length)return {...article,detachmentRules:canonicalRules};
  const structuredRules=(detachment.subsections||[]).flatMap(section=>{
    const blocks=(section.blocks||[]).filter(block=>block.type==='ability'||block.type==='table');
    const owner=blocks.find(block=>block.type==='ability');
    if(!owner)return[];
    return [{id:owner.termId||owner.id,title:owner.title||section.title,blocks:clone(blocks)}];
  });
  const detachmentRules=structuredRules.length?structuredRules:detachment.rule?[factsWithoutPresentation(detachment.rule)]:[];
  if(!detachmentRules.length)throw new Error(`${model.book.id}/${detachment.id}: Detachment has no accepted gameplay rule projection`);
  return {...article,detachmentRules};
}

function updateArticleFacts(model,update){
  if(model.book.id!=='adeptus-mechanicus'||update.id!=='rules-updates')return update;
  const byId=(records,id,kind)=>{const record=records.find(item=>item.id===id);if(!record)throw new Error(`adeptus-mechanicus/${update.id}: missing ${kind} ${id}`);return record;};
  const unit=id=>byId(model.units,id,'unit');
  const detachment=id=>byId(model.detachments,id,'Detachment');
  const ability=(unitId,termId)=>{const record=unit(unitId).abilities?.find(item=>item.termId===termId);if(!record)throw new Error(`adeptus-mechanicus/${update.id}: missing ability ${unitId}/${termId}`);return record;};
  const weapon=(unitId,termId)=>{const record=unit(unitId).weapons?.find(item=>item.termId===termId);if(!record)throw new Error(`adeptus-mechanicus/${update.id}: missing weapon ${unitId}/${termId}`);return record;};
  const weaponText=record=>`${record.name}: Range ${record.range}; A ${record.a}; ${String(record.range).toLowerCase()==='melee'?'WS':'BS'} ${record.skill}; S ${record.s}; AP ${record.ap}; D ${record.d}${record.abilities?`; ${record.abilities}`:''}.`;
  const abilityText=record=>[record.openingText,...(record.options||[]).flatMap(option=>[option.title,...(option.effects||[]),option.text]),record.text].filter(Boolean).join('\n');
  const detachmentRule=id=>{const record=detachment(id).rule;if(!record?.id||!record?.text)throw new Error(`adeptus-mechanicus/${update.id}: incomplete Detachment rule ${id}`);return record;};
  const affectedDoctrinaUnits=['unit-belisarius-cawl','unit-corpuscarii-electro-priests','unit-cybernetica-datasmith','unit-fulgurite-electro-priests','unit-kastelan-robots','unit-tech-priest-dominus','unit-tech-priest-enginseer','unit-tech-priest-manipulus','unit-technoarcheologist'].map(id=>unit(id).title);
  const cawl=unit('unit-belisarius-cawl'),datasmith=unit('unit-cybernetica-datasmith'),fusilave=unit('unit-archaeopter-fusilave'),stratoraptor=unit('unit-archaeopter-stratoraptor'),transvector=unit('unit-archaeopter-transvector');
  const veiledHunter=byId(model.enhancements,'enhancement-veiled-hunter','Enhancement');
  const acceptedResultingSemantics=[
    {sourcePage:17,section:'ARMY RULES',items:[
      {changedRule:'Doctrina Imperatives — Protector and Conqueror Imperatives',resultingEffectiveRule:model.rules.armyRule.options.map(option=>`${option.label.toUpperCase()} IMPERATIVE\n${option.effects.join('\n')}`).join('\n\n')}
    ]},
    {sourcePage:17,section:'DETACHMENT RULES AND ENHANCEMENT',items:[
      {changedRule:`${detachment('detachment-cohort-cybernetica').title} — ${detachmentRule('detachment-cohort-cybernetica').title}`,resultingEffectiveRule:detachmentRule('detachment-cohort-cybernetica').text},
      {changedRule:`${detachment('detachment-rad-zone-corps').title} — ${detachmentRule('detachment-rad-zone-corps').title}`,resultingEffectiveRule:detachmentRule('detachment-rad-zone-corps').text},
      {changedRule:`${detachment('detachment-skitarii-hunter-cohort').title} — ${detachmentRule('detachment-skitarii-hunter-cohort').title}`,resultingEffectiveRule:detachmentRule('detachment-skitarii-hunter-cohort').text},
      {changedRule:`${detachment('detachment-skitarii-hunter-cohort').title} — ${veiledHunter.title}`,resultingEffectiveRule:veiledHunter.text}
    ]},
    {sourcePage:17,section:'DATASHEET UPDATES',items:[
      {changedRule:'Doctrina Imperatives faction ability added',resultingEffectiveRule:affectedDoctrinaUnits.join('; ')},
      {changedRule:fusilave.title,resultingEffectiveRule:[`M ${fusilave.stats.M}; OC ${fusilave.stats.OC}.`,abilityText(ability(fusilave.id,'datasheet-bomb-rack'))].join('\n')},
      {changedRule:stratoraptor.title,resultingEffectiveRule:`M ${stratoraptor.stats.M}; OC ${stratoraptor.stats.OC}.`},
      {changedRule:transvector.title,resultingEffectiveRule:[`M ${transvector.stats.M}; Keywords: ${transvector.intrinsicKeywords.join(', ')}.`,abilityText(ability(transvector.id,'datasheet-aerial-deployment'))].join('\n')}
    ]},
    {sourcePage:18,section:'DATASHEET UPDATES',items:[
      {changedRule:cawl.title,resultingEffectiveRule:[`M ${cawl.stats.M}; Keywords: ${cawl.intrinsicKeywords.join(', ')}.`,abilityText(ability(cawl.id,'datasheet-canticles-of-the-omnissiah')),weaponText(weapon(cawl.id,'weapon-solar-atomiser'))].join('\n')},
      {changedRule:datasmith.title,resultingEffectiveRule:[`Keywords: ${datasmith.intrinsicKeywords.join(', ')}.`,abilityText(ability(datasmith.id,'core-support')),abilityText(ability(datasmith.id,'datasheet-data-severed'))].join('\n')},
      {changedRule:unit('unit-ironstrider-ballistarii').title,resultingEffectiveRule:['weapon-twin-cognis-autocannon','weapon-twin-cognis-lascannon-2'].map(id=>weaponText(weapon('unit-ironstrider-ballistarii',id))).join('\n')},
      {changedRule:`${unit('unit-kastelan-robots').title} — ${ability('unit-kastelan-robots','datasheet-repulsor-grid').title}`,resultingEffectiveRule:abilityText(ability('unit-kastelan-robots','datasheet-repulsor-grid'))},
      {changedRule:unit('unit-onager-dunecrawler').title,resultingEffectiveRule:['weapon-daedalus-missile-launcher','weapon-eradication-beamer-dissipated','weapon-eradication-beamer-focused','weapon-neutron-laser','weapon-twin-onager-heavy-phosphor-blaster'].map(id=>weaponText(weapon('unit-onager-dunecrawler',id))).concat(abilityText(ability('unit-onager-dunecrawler','datasheet-scuttling-walker'))).join('\n')},
      {changedRule:`${unit('unit-serberys-raiders').title} — ${ability('unit-serberys-raiders','datasheet-tactica-obliqua').title}`,resultingEffectiveRule:abilityText(ability('unit-serberys-raiders','datasheet-tactica-obliqua'))},
      {changedRule:unit('unit-sicarian-infiltrators').title,resultingEffectiveRule:['weapon-power-weapon-2','weapon-taser-goad-2'].map(id=>weaponText(weapon('unit-sicarian-infiltrators',id))).join('\n')}
    ]}
  ];
  return {...update,acceptedResultingSemantics};
}

function addArmyEntries(entries,models){
  const lookups={unit:new Map(),detachment:new Map(),enhancement:new Map(),armyRule:new Map()};
  for(const model of models){
    for(const unit of model.units){
      const facts=model.book.id==='death-guard'?deathGuardUnitArticleFacts(unit):{id:unit.id,title:unit.title,publicationState:unit.publicationState,category:unit.category,profiles:unit.profiles||unit.stats||[],composition:unit.composition||unit.compositionText||null,keywords:unit.keywords||unit.intrinsicKeywords||[],ruleFacts:unit.ruleFacts||null};
      const entry=addArmyEntry(entries,model,'UNIT',unit,{facts});
      lookups.unit.set(`${model.book.id}::${unit.id}`,entry);
    }
    for(const detachment of model.detachments){
      const entry=addArmyEntry(entries,model,'DETACHMENT',detachment,{facts:detachmentArticleFacts(model,detachment)});
      lookups.detachment.set(`${model.book.id}::${detachment.id}`,entry);
    }
    for(const enhancement of model.enhancements){
      const enhancementFacts=factsWithoutPresentation(enhancement);for(const field of ['value','points','mfmRecordId','mfmQualifiers'])delete enhancementFacts[field];
      const entry=addArmyEntry(entries,model,'ENHANCEMENT',enhancement,{parentId:enhancement.detachmentId,aliases:enhancement.aliases||[],facts:enhancementFacts,references:[{domain:'ARMY',id:lookups.detachment.get(`${model.book.id}::${enhancement.detachmentId}`)?.id||null,canonicalId:enhancement.detachmentId,relationType:'DETACHMENT'}]});
      lookups.enhancement.set(`${model.book.id}::${enhancement.detachmentId}::${enhancement.id}`,entry);
    }
    for(const rule of model.detachmentRules||[])addArmyEntry(entries,model,'DETACHMENT_RULE',rule,{parentId:rule.detachmentId,references:[{domain:'ARMY',id:lookups.detachment.get(`${model.book.id}::${rule.detachmentId}`)?.id||null,canonicalId:rule.detachmentId,relationType:'DETACHMENT'}]});
    for(const detachment of model.detachments){
      for(const stratagem of detachment.stratagems||[])addArmyEntry(entries,model,'STRATAGEM',stratagem,{parentId:detachment.id,references:[{domain:'ARMY',id:lookups.detachment.get(`${model.book.id}::${detachment.id}`)?.id||null,canonicalId:detachment.id,relationType:'DETACHMENT'}]});
      if(!model.detachmentRules)for(const subsection of detachment.subsections||[])for(const block of subsection.blocks||[]){
        if(block.type==='ability'&&/rule/i.test(subsection.id||''))addArmyEntry(entries,model,'DETACHMENT_RULE',block,{parentId:detachment.id,canonicalId:block.termId||block.id,references:[{domain:'ARMY',id:lookups.detachment.get(`${model.book.id}::${detachment.id}`)?.id||null,canonicalId:detachment.id,relationType:'DETACHMENT'}]});
        if(block.type==='rule'&&String(block.id||'').startsWith('stratagem-'))addArmyEntry(entries,model,'STRATAGEM',block,{parentId:detachment.id,references:[{domain:'ARMY',id:lookups.detachment.get(`${model.book.id}::${detachment.id}`)?.id||null,canonicalId:detachment.id,relationType:'DETACHMENT'}]});
      }
      if(!model.detachmentRules&&detachment.rule?.id)addArmyEntry(entries,model,'DETACHMENT_RULE',detachment.rule,{parentId:detachment.id,ownerBookId:sourceBook(detachment,model.book.id),references:[{domain:'ARMY',id:lookups.detachment.get(`${model.book.id}::${detachment.id}`)?.id||null,canonicalId:detachment.id,relationType:'DETACHMENT'}]});
    }
    for(const rule of model.rules?.armyRules||[]){const entry=addArmyEntry(entries,model,'ARMY_RULE',rule,{ownerBookId:rule.source==='dependency'&&rule.sourceBook?rule.sourceBook:null});for(const id of [rule.id,rule.termId].filter(Boolean))lookups.armyRule.set(`${model.book.id}::${id}`,entry);}
    if(model.rules?.armyRule?.id){const rule=model.rules.armyRule,entry=addArmyEntry(entries,model,'ARMY_RULE',rule,{ownerBookId:rule.source==='dependency'&&rule.sourceBook?rule.sourceBook:null});for(const id of [rule.id,rule.termId].filter(Boolean))lookups.armyRule.set(`${model.book.id}::${id}`,entry);}
    addDeathGuardArmyRuleComponents(entries,model,lookups);
    addRequiredEffectiveArmyGlossaryFacts(entries,model);
    const updates=Array.isArray(model.rules?.updates)?model.rules.updates:model.rules?.updates?[model.rules.updates]:[];
    for(const update of updates)if(update.id)addArmyEntry(entries,model,'UPDATE',update,{facts:updateArticleFacts(model,update)});
    for(const unit of model.units){if(unit.subsections||unit.blocks)addStructuredUnitChildren(entries,lookups,model,unit);else addGenericUnitChildren(entries,lookups,model,unit);}
  }
  return lookups;
}

function addMissionEntries(entries,missionCatalogs){
  for(const missionCatalog of missionCatalogs){
    const scope=missionCatalog.scope;
    for(const partition of MISSION_PARTITIONS)for(const record of missionCatalog[partition]){
      const id=entryId('missions',record.id),context={scope,sourceSelection:missionCatalog.sourceSelection},entry=upsertEntry(entries,createEntry({id,domain:'MISSIONS',recordType:record.recordType,label:record.label||record.title||record.name,aliases:record.aliases||[],canonicalId:record.id,references:normalizeReferences(record,'MISSIONS'),provenance:record.provenance,currentness:{cutoff:missionCatalog.cutoff,scope},sourceOwner:{domain:'MISSIONS',canonicalId:record.id,interface:'createEffectiveMissionCatalog()'},facts:factsWithoutPresentation(record)}),context);
      for(const clarification of record.effectiveClarifications||[]){
        const childId=entryId('missions',record.id,'faq',clarification.overlayId);
        upsertEntry(entries,createEntry({id:childId,domain:'MISSIONS',recordType:'FAQ_CLARIFICATION',label:`${entry.label} clarification`,canonicalId:clarification.overlayId,parent:{domain:'MISSIONS',canonicalId:record.id},references:[{domain:'MISSIONS',id,canonicalId:record.id,relationType:'TARGET'}],provenance:clarification.provenance,currentness:{cutoff:missionCatalog.cutoff,scope},sourceOwner:{domain:'MISSIONS',canonicalId:clarification.overlayId,interface:'createEffectiveMissionCatalog()'},facts:clone(clarification)}),context);
      }
    }
  }
}

function attachMfm(entries,lookups,mfmCatalog){
  const refs=new Map(mfmCatalog.unitReferences.map(record=>[record.id,record])),pointsById=new Map(mfmCatalog.unitPointRecords.map(record=>[record.id,record]));
  const augmentation={pointRecords:0,paidUpgrades:0,leaderRelations:0,supportRelations:0,detachments:0,enhancementCosts:0,qualifiers:0,referenceOnlyPointRecords:[]};
  const unitEntryFor=reference=>reference?.armyBinding?.bindingStatus==='BOUND'?lookups.unit.get(`${reference.armyBinding.armyBookId}::${reference.armyBinding.armyUnitId}`):null;
  const contextualMfm=(entry,bookId)=>{
    const context=(entry.contexts||[]).find(item=>item.effectiveBookId===bookId);
    if(!context)throw new Error(`${entry.id}: MFM faction context ${bookId} is absent`);
    if(bookId===entry.sourceOwner?.bookId){entry.mfm??={};return entry.mfm;}
    context.mfm??={};return context.mfm;
  };
  for(const record of mfmCatalog.unitPointRecords){const ref=refs.get(record.unitReferenceId),entry=unitEntryFor(ref);if(!entry){augmentation.referenceOnlyPointRecords.push(record.id);continue;}entry.mfm??={};entry.mfm.pointRecords??=[];entry.mfm.pointRecords.push(clone(record));augmentation.pointRecords++;}
  for(const record of mfmCatalog.paidUpgradeRecords){const point=pointsById.get(record.unitPointRecordId),ref=refs.get(point?.unitReferenceId),entry=unitEntryFor(ref);if(!entry)throw new Error(`${record.id}: paid upgrade has no bound Army unit`);entry.mfm??={};entry.mfm.paidUpgrades??=[];entry.mfm.paidUpgrades.push(clone(record));augmentation.paidUpgrades++;}
  for(const [partition,key] of [['leaderEligibilityRecords','leaderRelations'],['supportEligibilityRecords','supportRelations']])for(const record of mfmCatalog[partition]){const source=unitEntryFor(refs.get(record.sourceUnitReferenceId));if(!source)throw new Error(`${record.id}: eligibility source has no bound Army unit`);const targets=record.targetUnitReferenceIds.map(id=>unitEntryFor(refs.get(id))).filter(Boolean),referenceOnlyTargetIds=record.targetUnitReferenceIds.filter(id=>!unitEntryFor(refs.get(id)));source.mfm??={};source.mfm[key]??=[];source.mfm[key].push({...clone(record),targetEntryIds:targets.map(item=>item.id),referenceOnlyTargetIds});augmentation[key]+=record.targetUnitReferenceIds.length;}
  for(const record of mfmCatalog.detachments){const entry=lookups.detachment.get(`${record.armyBookId}::${record.armyDetachmentId}`);if(!entry)throw new Error(`${record.id}: Detachment has no bound Army entry`);contextualMfm(entry,record.factionId).detachment=clone(record);entry.canonicalReferences.push({domain:'MISSIONS',id:entryId('missions',record.missionForceDispositionId),canonicalId:record.missionForceDispositionId,relationType:'FORCE_DISPOSITION'});const mission=entries.get(entryId('missions',record.missionForceDispositionId));if(!mission)throw new Error(`${record.id}: unknown Mission Force Disposition ${record.missionForceDispositionId}`);mission.mfm??={};mission.mfm.assignedDetachmentIds??=[];mission.mfm.assignedDetachmentIds.push(entry.id);augmentation.detachments++;}
  for(const record of mfmCatalog.enhancementCosts){const entry=lookups.enhancement.get(`${record.armyBookId}::${record.armyDetachmentId}::${record.armyEnhancementId}`);if(!entry)throw new Error(`${record.id}: Enhancement cost has no bound Army entry`);entry.mfm??={};entry.mfm.enhancementCost=clone(record);augmentation.enhancementCosts++;}
  for(const record of mfmCatalog.qualifierRecords){let entry=null;if(record.ownerKind==='DETACHMENT')entry=lookups.detachment.get(`${record.armyBookId}::${record.armyOwnerId}`);else if(record.ownerKind==='UNIT')entry=lookups.unit.get(`${record.armyBookId}::${record.armyOwnerId}`);else if(record.ownerKind==='ENHANCEMENT'){for(const [key,candidate] of lookups.enhancement)if(key.startsWith(`${record.armyBookId}::`)&&key.endsWith(`::${record.armyOwnerId}`)){entry=candidate;break;}}if(!entry)throw new Error(`${record.id}: qualifier owner has no bound Army entry`);const mfm=contextualMfm(entry,record.factionId);mfm.qualifiers??=[];mfm.qualifiers.push(clone(record));augmentation.qualifiers++;}
  augmentation.referenceOnlyPointRecords.sort();
  return augmentation;
}

function applyLegacyPresentation(entries,coreCatalog,editorial,resolutions,supplemental){
  const byCanonical=new Map();for(const entry of entries.values()){const key=entry.sourceOwner.canonicalId;if(!byCanonical.has(key))byCanonical.set(key,[]);byCanonical.get(key).push(entry);}
  let editorialMigrated=0,resolutionAliasesMigrated=0,supplementalAliasesMigrated=0,preferredMatchesMigrated=0;const editorialUnresolved=[],preferredMatchesUnresolved=[];
  for(const summary of editorial.summaries||[]){const matches=byCanonical.get(summary.termId)||[];if(matches.length!==1){editorialUnresolved.push(summary.termId);continue;}matches[0].presentation.editorialSummary={text:summary.summary,revision:summary.editorialRevision,contentHash:summary.contentHash};editorialMigrated++;}
  for(const [alias,decision] of Object.entries(resolutions.aliases||{})){const canonical=coreCatalog.resolveId(decision.target),target=entries.get(entryId('core',canonical));if(!target)throw new Error(`Legacy resolution target ${decision.target} is absent from V2`);target.aliases=sortStrings([...target.aliases,alias]);target.presentation.aliasMetadata??=[];target.presentation.aliasMetadata.push({alias,parameters:decision.parameters||null,reason:decision.reason,source:'glossary/resolutions.en.json'});resolutionAliasesMigrated++;}
  const explicitTargets=supplemental.v2Targets||{};
  for(const [legacyId,targetId] of Object.entries(explicitTargets))if(!entries.has(targetId))throw new Error(`Legacy presentation target ${legacyId} resolves to absent V2 entry ${targetId}`);
  const resolveSupplementalTarget=value=>entries.get(explicitTargets[value])||entries.get(entryId('core',coreCatalog.resolveId(value)))||byCanonical.get(value)?.[0]||null;
  for(const [alias,targetId] of Object.entries(supplemental.aliases||{})){const target=resolveSupplementalTarget(targetId);if(!target)continue;target.aliases=sortStrings([...target.aliases,alias]);supplementalAliasesMigrated++;}
  for(const [targetId,labels] of Object.entries(supplemental.matchLabels||{})){const target=resolveSupplementalTarget(targetId);if(!target)continue;target.aliases=sortStrings([...target.aliases,...labels]);supplementalAliasesMigrated+=labels.length;}
  for(const [label,targetId] of Object.entries(supplemental.preferredMatches||{})){const target=resolveSupplementalTarget(targetId);if(!target){preferredMatchesUnresolved.push({label,targetId});continue;}target.presentation.preferredMatchLabels??=[];target.presentation.preferredMatchLabels=sortStrings([...target.presentation.preferredMatchLabels,label]);preferredMatchesMigrated++;}
  const unresolvedGameplay=(supplemental.terms||[]).map(term=>({id:term.id,label:term.title,reason:resolveSupplementalTarget(term.id)?'EFFECTIVE_OWNER_SUPERSEDES_LEGACY_BODY':'NO_EFFECTIVE_FACTUAL_OWNER'}));
  const quick=readJson('glossary/core-quick-reference.en.json');
  return {editorialMigrated,editorialUnresolved:editorialUnresolved.sort(),resolutionAliasesMigrated,supplementalAliasesMigrated,supplementalTargetBindings:Object.keys(explicitTargets).length,preferredMatchesMigrated,preferredMatchesUnresolved,legacyGameplayRejected:unresolvedGameplay,quickReferenceGameplayRejected:Array.isArray(quick.terms)?quick.terms.length:Array.isArray(quick.entries)?quick.entries.length:Object.keys(quick).length};
}

export async function loadGlossaryV2Inputs(){
  const coreCatalog=createEffectiveCoreCatalog(),mfmCatalog=createEffectiveMfmCatalog().catalog;
  const missionCatalogs=[MISSION_SCOPES.STANDARD_MATCHED_PLAY,MISSION_SCOPES.EVENT_PLAY].map(scope=>createEffectiveMissionCatalog({scope,coreCatalog}).catalog);
  const armyModels=[];
  for(const bookId of BOOK_IDS){const configPath=path.join(repo,'books',bookId,'book.config.json'),context=createCanonicalBuildContext({args:[],configPath,repo}),{effectiveBookModel}=await buildCanonicalBook(context,{projectionOnly:true});armyModels.push(effectiveBookModel);}
  return {coreCatalog,armyModels,mfmCatalog,missionCatalogs,editorial:readJson('glossary/editorial-contracts.v1.json'),resolutions:readJson('glossary/resolutions.en.json'),supplemental:readJson('glossary/supplemental-terms.en.json')};
}

export function createGlossaryV2Index({coreCatalog,armyModels,mfmCatalog,missionCatalogs,editorial,resolutions,supplemental}){
  const entries=new Map();addCoreEntries(entries,coreCatalog);const armyLookups=addArmyEntries(entries,armyModels);addMissionEntries(entries,missionCatalogs);const mfmAugmentation=attachMfm(entries,armyLookups,mfmCatalog);const legacy=applyLegacyPresentation(entries,coreCatalog,editorial,resolutions,supplemental);
  const ordered=[...entries.values()].map(entry=>{entry.aliases=sortStrings(entry.aliases);entry.contexts.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));entry.canonicalReferences=entry.canonicalReferences.filter(ref=>ref.id).sort((a,b)=>`${a.relationType}:${a.id}`.localeCompare(`${b.relationType}:${b.id}`));if(entry.mfm?.assignedDetachmentIds)entry.mfm.assignedDetachmentIds=sortStrings(entry.mfm.assignedDetachmentIds);for(const context of entry.contexts||[])if(context.mfm?.assignedDetachmentIds)context.mfm.assignedDetachmentIds=sortStrings(context.mfm.assignedDetachmentIds);return entry;}).sort((a,b)=>a.id.localeCompare(b.id));
  const counts={total:ordered.length,standalone:ordered.filter(entry=>!entry.parent).length,scopedChildren:ordered.filter(entry=>entry.parent).length,byDomain:{},byType:{}};for(const entry of ordered){counts.byDomain[entry.domain]=(counts.byDomain[entry.domain]||0)+1;const key=`${entry.domain}:${entry.recordType}`;counts.byType[key]=(counts.byType[key]||0)+1;}
  const index={schema:'wh40k-glossary-v2-index/v1',language:'en',currentnessCutoff:'2026-09-22',factualAuthority:false,factualInputs:[...FACTUAL_INPUTS],presentationInputs:[...PRESENTATION_INPUTS],supportedArmyBooks:[...BOOK_IDS],counts,coverage:{coreEffectiveRecords:coreCatalog.records.length,coreIndexed:counts.byDomain.CORE||0,coreNotIndexed:{identityOnly:coreCatalog.identityOnly.map(record=>record.id).sort(),aliasOnlyErrata:[...CORE_ALIAS_ONLY_ERRATA].sort()},armyEffectiveBooks:armyModels.map(model=>model.book.id),missionsScopes:missionCatalogs.map(catalog=>catalog.scope),mfm:{sourceVersion:mfmCatalog.sourceVersion,scope:mfmCatalog.scope,standaloneArticles:0,augmentation:mfmAugmentation},legacy},entries:ordered};
  return deepFreeze(JSON.parse(JSON.stringify(index)));
}

export async function buildGlossaryV2Index(){return createGlossaryV2Index(await loadGlossaryV2Inputs());}
export {BOOK_IDS,FACTUAL_INPUTS,PRESENTATION_INPUTS};
