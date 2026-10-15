import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createEffectiveCoreCatalog} from '../../../books/core-rules/content/effective-core-catalog.mjs';
import {loadV2ArmyModels,assertV2ArmyBookParity,V2_ARMY_BOOK_IDS,V2_FACTUAL_INTERFACES} from './army-v2-projection.mjs';
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';
import {createEffectiveMissionCatalog,MISSION_SCOPES} from '../../../missions/content/effective-mission-catalog.mjs';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const BOOK_IDS=V2_ARMY_BOOK_IDS;
const FACTUAL_INPUTS=Object.freeze([
  'books/core-rules/content/effective-core-catalog.mjs',
  ...Object.values(V2_FACTUAL_INTERFACES),
  'mfm/content/effective-mfm-catalog.mjs',
  'missions/content/effective-mission-catalog.mjs'
]);
const PRESENTATION_INPUTS=Object.freeze(['glossary/editorial-contracts.v1.json','glossary/resolutions.en.json','glossary/supplemental-terms.en.json']);
const MISSION_PARTITIONS=Object.freeze(['forceDispositions','primaryMissions','secondaryMissions','deployments','twists','missionSequenceRules','missionReferenceRules','forceDispositionMatchups','terrainLayouts']);
const CORE_ALIAS_ONLY_ERRATA=new Set(['core-errata-15-05','core-errata-15-06']);

const clone=value=>structuredClone(value);
const readJson=relative=>JSON.parse(fs.readFileSync(path.join(repo,relative),'utf8'));
const sortStrings=values=>[...new Set(values.filter(Boolean))].sort((left,right)=>left.localeCompare(right));
const entryId=(domain,...ids)=>[domain,...ids].join('::');
const deepFreeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const child of Object.values(value))deepFreeze(child);Object.freeze(value);}return value;};

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
  return {id,domain,recordType,label,aliases:sortStrings(aliases),searchableContent:semanticText(facts,{skip:new Set(['id','sourceId','sourceBookId','recordType','sourceArtifact','sourceCaptureSha256','contentHash','canonicalData'])}),parent,canonicalReferences:references,currentness,provenance,sourceOwner,facts,contexts,presentation:{}};
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
    if(!['FULL_CONTENT','SOURCE_CONFLICT'].includes(record.state)||CORE_ALIAS_ONLY_ERRATA.has(record.id))continue;
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


const mfmOwnedKinds=new Set(['POINTS_SCHEDULE_ROW','PAID_WARGEAR_COST','DETACHMENT_ROSTER_METADATA','ENHANCEMENT_COST_QUALIFIERS','ALLIED_POINTS_DEPENDENCY','ATTACHMENT_RELATION']);
const types={DATASHEET:'UNIT',MODEL_PROFILE:'PROFILE',DATASHEET_ABILITY:'ABILITY',EQUIPMENT_ABILITY:'WARGEAR_ABILITY',ERRATA:'ERRATA',FAQ:'FAQ_CLARIFICATION',OFFICIAL_UPDATE:'UPDATE',BOOK_USAGE:'BOOK_USAGE_RULES'};
// These source-owned groups contain named ability fields outside the ordinary
// ABILITIES section. Their container and canonical field identities stay intact.
const namedAbilityGroups=new Map([
  ['datasheet-mortarion:section:1','datasheet-mortarion:section:3'],
  ['datasheet-belisarius-cawl:section:4','datasheet-belisarius-cawl:section:1'],
  ['datasheet-thulia-ghuld:section:4','datasheet-thulia-ghuld:section:1'],
  ['datasheet-fulgrim:section:5','datasheet-fulgrim:section:2']
]);
function abilityPresentation(entity,model) {
  if(entity.kind==='NAMED_RULE_COMPONENT') {
    assert.equal(entity.ownerId,'datasheet-abaddon-the-despoiler:section:5','Unreviewed named ability group');
    return {referenceCategory:'ABILITY',referenceContext:{canonicalId:'datasheet-abaddon-the-despoiler:section:1:block:0:text'}};
  }
  if(entity.kind==='SUPPLEMENTAL_DATASHEET_RULE'&&entity.id==='datasheet-great-unclean-one:raw-dsAbility:1') {
    const weapon=model.entities.find(record=>record.id==='datasheet-great-unclean-one:weapon:6');
    assert.ok(weapon?.parentId===entity.parentId&&weapon.data.abilities.includes('Reverberating summons'),'Supplemental weapon ability lost its source weapon binding');
    assert.ok(entity.data.text.startsWith('Reverberating Summons: '));
    return {referenceCategory:'WARGEAR_ABILITY',referenceLabel:entity.data.text.split(': ')[0]};
  }
  if(entity.kind!=='DATASHEET_SECTION')return {};
  if(model.book.id==='emperors-children'&&entity.id==='datasheet-lord-exultant:section:4')return {referenceCategory:'ABILITY',referenceLabel:entity.data.title};
  const result={referenceCategory:'REFERENCE'};
  if(model.appPayload.datasheetPresentation?.sectionRoles?.[entity.id]!=='abilities'&&!namedAbilityGroups.has(entity.id))return result;
  result.referenceFields=entity.data.blocks.map((block,index)=>{
    const path=`/blocks/${index}/text`,factId=entity.id+'::'+path;
    const fact=model.appPayload.factManifest.find(field=>field.id===factId);
    assert.ok(fact?.ownerType==='CANONICAL_V2'&&fact.entityId===entity.id&&fact.contextId===(entity.parentId||entity.ownerId),'Ability field has no Army Book canonical owner '+factId);
    assert.deepEqual(fact.path,['blocks',index,'text']);assert.equal(fact.value,block.text);
    const separator=block.text.indexOf(': ');
    assert.ok(separator>0&&typeof block.wargearAbility==='boolean','Unnamed/unclassified canonical ability field '+factId);
    return {path,factId,label:block.text.slice(0,separator),category:block.wargearAbility?'WARGEAR_ABILITY':'ABILITY',provenance:clone(entity.fieldProvenance?.[path.slice(1)]||entity.provenance),
      ...(namedAbilityGroups.has(entity.id)?{referenceContext:{canonicalId:namedAbilityGroups.get(entity.id),path:entity.id==='datasheet-fulgrim:section:5'?'/blocks/1/text':'/blocks/0/text'}}:{})};
  });
  return result;
}
function addArmyEntries(entries,models){
  const lookups={unit:new Map(),detachment:new Map(),enhancement:new Map(),armyRule:new Map(),mfm:new Map()};
  for(const model of models){
    if(!BOOK_IDS.includes(model.book.id)||!model.factualInterface||!Array.isArray(model.entities))throw new Error('Non-V2 factual owner');
    const book=model.book.id,records=new Map(model.entities.map(e=>[e.id,e])),ownerOf=e=>e.parentId||e.ownerId;
    const sourceRows=model.entities.filter(e=>!mfmOwnedKinds.has(e.kind));
    const entryByCanonical=new Map();
    const label=e=>e.displayName||e.label||e.data.title||e.data.name||e.data.composition?.name||(types[e.kind]==='PROFILE'||e.kind==='PROFILE'?records.get(ownerOf(e))?.data.title:null)||e.id;
    const children=e=>model.entities.filter(child=>ownerOf(child)===e.id);
    const blockText=(e,seen=new Set())=>{
      if(!e||seen.has(e.id))return'';seen=new Set([...seen,e.id]);
      const data=e.data,parts=data.blocks||data.clauses||data.equipmentAndRules||[];
      return data.text||data.sourceText||parts.map(b=>b.text||b.rows?.map(r=>r.join(' | ')).join('\n')).filter(Boolean).join('\n')||
        (data.componentIds||[]).map(id=>blockText(records.get(id),seen)).filter(Boolean).join('\n');
    };
    const profileStats=e=>{
      const stats=clone(e.data.stats||e.data.statline||Object.fromEntries(Object.entries(e.data).filter(([k])=>['M','T','SV','W','LD','OC','INSV'].includes(k))));
      if(e.data.invulnerableSaveId){const save=records.get(e.data.invulnerableSaveId);if(save?.kind!=='INVULNERABLE_SAVE'||!save.data.profileIds.includes(e.id))throw new Error('Unresolved V2 profile save owner '+e.id);stats.INSV=save.data.value;}
      return stats;
    };
    for(const entity of sourceRows){
      const type=types[entity.kind]||entity.kind,parent=ownerOf(entity),parentId=records.has(parent)?parent:null,data=clone(entity.data);
      const facts={...data,id:entity.id,title:label(entity),canonicalData:clone(entity.data)};
      if(type==='SOURCE_PRESENTATION_NOTE'&&data.semanticTableIds){
        assert.equal(data.classification,'LAYOUT_WRAPPER_REFERENCE','Unreviewed source presentation note');
        for(const targetId of data.semanticTableIds)assert.equal(records.get(targetId)?.kind,'STRUCTURED_RULE_TABLE','Missing semantic table owner');
        facts.componentIds=clone(data.semanticTableIds);
      }
      if(type==='WEAPON_PROFILE')Object.assign(facts,{a:data.attacks??data.a,s:data.strength??data.s,d:data.damage??data.d});
      if(type==='PROFILE')facts.stats=profileStats(entity);
      if(type==='UNIT'){
        const profileIds=data.profileIds||data.modelProfileIds||[];
        facts.profiles=profileIds.map(id=>{const e=records.get(id);if(!e)throw new Error('Unresolved V2 profile '+id);return{canonicalId:id,name:label(e),stats:profileStats(e)};});
        const sectionIds=[...new Set([...(data.sectionIds||[]),...children(entity).filter(e=>['ATTACHMENT_DECLARATION','TRANSPORT_DECLARATION','SPECIAL_DATASHEET_RULE','UPGRADE_DECLARATION'].includes(e.kind)).map(e=>e.id)])],sections=sectionIds.map(id=>records.get(id)).filter(Boolean),roles=model.appPayload.datasheetPresentation?.sectionRoles||{};
        facts.composition=sections.filter(e=>roles[e.id]==='composition').map(e=>[...(e.data.memberIds||[]).map(id=>blockText(records.get(id))),blockText(e)].filter(Boolean).join('\n')).join('\n');
        const composition=children(entity).find(e=>e.kind==='UNIT_COMPOSITION');
        if(composition)facts.composition=[...(composition.data.memberIds||[]).map(id=>blockText(records.get(id))),...(composition.data.equipmentAndRules||[]).map(b=>b.text)].filter(Boolean).join('\n');
        const membership=children(entity).filter(e=>['KEYWORD_MEMBERSHIP','FACTION_KEYWORD'].includes(e.kind));
        facts.keywords=data.keywords||membership.filter(e=>e.kind==='KEYWORD_MEMBERSHIP').map(e=>e.data.keyword);
        facts.factionKeywords=data.factionKeywords||membership.filter(e=>e.kind==='FACTION_KEYWORD').map(e=>e.data.keyword);
        const scopes=records.get(data.keywordScopesId)?.data.scopes||[];
        if(!facts.keywords.length)facts.keywords=[...new Set(scopes.filter(v=>v.label!=='FACTION KEYWORDS').flatMap(v=>v.keywords||[]))];
        if(!facts.factionKeywords.length)facts.factionKeywords=[...new Set(scopes.filter(v=>v.label==='FACTION KEYWORDS').flatMap(v=>v.keywords||[]))];
        const abilities=children(entity).filter(e=>['DATASHEET_ABILITY','EQUIPMENT_ABILITY','SUPPLEMENTAL_DATASHEET_RULE'].includes(e.kind)||e.kind==='DATASHEET_SECTION'&&roles[e.id]==='abilities');
        facts.ruleFacts={abilities:abilities.map(e=>({id:e.id,title:label(e),text:blockText(e)}))};
        facts.referenceSections=sections.filter(e=>roles[e.id]!=='composition'&&roles[e.id]!=='abilities').map(e=>({title:label(e),lines:[blockText(e)].filter(Boolean)}));
      }
      if(type==='DETACHMENT')facts.detachmentRules=children(entity).filter(e=>e.kind==='DETACHMENT_RULE').map(e=>({id:e.id,title:label(e),...clone(e.data)}));
      const id=entryId('army',book,type.toLowerCase(),...(parentId?[parentId]:[]),entity.id);
      const entry=createEntry({id,domain:'ARMY',recordType:type,label:label(entity),canonicalId:entity.id,parent:parentId?{domain:'ARMY',canonicalId:parentId}:null,provenance:clone(entity.provenance),currentness:{publicationState:'CURRENT'},sourceOwner:{domain:'ARMY',bookId:book,canonicalId:entity.id,interface:model.factualInterface},facts});
      Object.assign(entry.presentation,abilityPresentation(entity,model));
      entry.contexts=[{effectiveBookId:book,sourceBookId:book,...(parentId?{parentUnitId:parentId}:{})}];
      upsertEntry(entries,entry);entryByCanonical.set(entity.id,entry);
      if(type==='UNIT')lookups.unit.set(book+'::'+entity.id,entry);
      if(type==='DETACHMENT')lookups.detachment.set(book+'::'+entity.id,entry);
      if(type==='ENHANCEMENT')lookups.enhancement.set(book+'::'+parentId+'::'+entity.id,entry);
      if(type==='ARMY_RULE')lookups.armyRule.set(book+'::'+entity.id,entry);
    }
    for(const entity of sourceRows){
      const entry=entryByCanonical.get(entity.id),refs=[];
      const visit=(value,path=[])=>{if(typeof value==='string'){const own=entryByCanonical.get(value),core=entries.get(entryId('core',value));if(own&&own!==entry)refs.push({domain:'ARMY',id:own.id,canonicalId:value,relationType:path.join('/')});else if(core)refs.push({domain:'CORE',id:core.id,canonicalId:value,relationType:path.join('/')});}else if(Array.isArray(value))value.forEach((v,i)=>visit(v,[...path,i]));else if(value&&typeof value==='object')Object.entries(value).forEach(([k,v])=>visit(v,[...path,k]));};
      visit(entity.data);const parent=entryByCanonical.get(ownerOf(entity));if(parent)refs.push({domain:'ARMY',id:parent.id,canonicalId:ownerOf(entity),relationType:'OWNER'});
      for(const [fieldId,bindings]of Object.entries(model.appPayload.datasheetPresentation?.referenceBindings?.fields||{})){
        if(!fieldId.startsWith(entity.id+'::/'))continue;
        for(const binding of bindings){
          const target=entryByCanonical.get(binding.targetId)||entries.get(entryId('core',binding.targetId))||[...entries.values()].find(candidate=>candidate.domain==='CORE'&&candidate.aliases.includes(binding.targetId));
          if(!target)throw new Error('Unresolved Army Book V2 reference target '+binding.targetId);
          refs.push({domain:target.domain,id:target.id,canonicalId:target.sourceOwner.canonicalId,relationType:binding.group,parameters:clone(binding.parameters||{})});
          if(target.domain==='CORE'){
            const context={effectiveBookId:book,sourceBookId:book,parentUnitId:ownerOf(entity),sourceAbilityId:entity.id,termId:binding.targetId};
            if(!target.contexts.some(existing=>JSON.stringify(existing)===JSON.stringify(context)))target.contexts.push(context);
            if(binding.targetId==='core-support'&&book==='chaos-space-marines')target.aliases=sortStrings([...target.aliases,'chaos-space-marines-ability-support']);
          }
        }
      }
      entry.canonicalReferences=refs;
      if(entity.id==='datasheet-great-unclean-one:raw-dsAbility:1') {
        const weapon=entryByCanonical.get('datasheet-great-unclean-one:weapon:6');
        entry.canonicalReferences.push({domain:'ARMY',id:weapon.id,canonicalId:weapon.sourceOwner.canonicalId,relationType:'WEAPON'});
      }
    }
    for(const [recordId,entityId]of Object.entries(model.mfmIdentityBindings||{})){const entry=entryByCanonical.get(entityId);if(!entry)throw new Error('MFM identity without V2 owner '+entityId);lookups.mfm.set(recordId,entry);}
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
  const dependencyRefs=new Set(mfmCatalog.unitReferences.filter(ref=>BOOK_IDS.includes(ref.crossFactionDependency?.consumerArmyBookId)).map(ref=>ref.id));
  const pointIds=new Set(mfmCatalog.unitPointRecords.filter(record=>BOOK_IDS.includes(record.factionId)||dependencyRefs.has(record.unitReferenceId)).map(record=>record.id));
  mfmCatalog={...mfmCatalog,unitPointRecords:mfmCatalog.unitPointRecords.filter(record=>pointIds.has(record.id)),paidUpgradeRecords:mfmCatalog.paidUpgradeRecords.filter(record=>pointIds.has(record.unitPointRecordId)),leaderEligibilityRecords:mfmCatalog.leaderEligibilityRecords.filter(record=>BOOK_IDS.includes(record.factionId)),supportEligibilityRecords:mfmCatalog.supportEligibilityRecords.filter(record=>BOOK_IDS.includes(record.factionId)),detachments:mfmCatalog.detachments.filter(record=>BOOK_IDS.includes(record.armyBookId)),enhancementCosts:mfmCatalog.enhancementCosts.filter(record=>BOOK_IDS.includes(record.armyBookId)),qualifierRecords:mfmCatalog.qualifierRecords.filter(record=>BOOK_IDS.includes(record.armyBookId))};
  for(const record of mfmCatalog.unitPointRecords.filter(record=>dependencyRefs.has(record.unitReferenceId))){
    const ref=mfmCatalog.unitReferences.find(ref=>ref.id===record.unitReferenceId),consumer=ref.crossFactionDependency.consumerArmyBookId;
    const entry=createEntry({id:entryId('mfm',record.id),domain:'MFM',recordType:'MFM_UNIT_POINTS',label:record.label,canonicalId:record.id,provenance:record.provenance,currentness:{sourceVersion:record.provenance.sourceVersion},sourceOwner:{domain:'MFM',canonicalId:record.id,factionId:record.factionId,interface:'createEffectiveMfmCatalog()'},facts:clone(record),contexts:[{effectiveBookId:consumer,dependencyKind:'POINTS_ONLY'}]});
    upsertEntry(entries,entry);lookups.unit.set(ref.armyBinding.armyBookId+'::'+ref.armyBinding.armyUnitId,entry);
  }
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
  for(const record of mfmCatalog.detachments){const entry=lookups.mfm.get(record.id)||lookups.detachment.get(`${record.armyBookId}::${record.armyDetachmentId}`);if(!entry)throw new Error(`${record.id}: Detachment has no bound Army entry`);contextualMfm(entry,record.factionId).detachment=clone(record);for(const dispositionId of record.missionForceDispositionIds||[record.missionForceDispositionId]){entry.canonicalReferences.push({domain:'MISSIONS',id:entryId('missions',dispositionId),canonicalId:dispositionId,relationType:'FORCE_DISPOSITION'});const mission=entries.get(entryId('missions',dispositionId));if(!mission)throw new Error(record.id+': unknown Mission Force Disposition '+dispositionId);mission.mfm??={};mission.mfm.assignedDetachmentIds??=[];mission.mfm.assignedDetachmentIds.push(entry.id);}augmentation.detachments++;}
  for(const record of mfmCatalog.enhancementCosts){const entry=lookups.mfm.get(record.id)||lookups.enhancement.get(`${record.armyBookId}::${record.armyDetachmentId}::${record.armyEnhancementId}`);if(!entry)throw new Error(`${record.id}: Enhancement cost has no bound Army entry`);entry.mfm??={};entry.mfm.enhancementCost=clone(record);augmentation.enhancementCosts++;}
  for(const record of mfmCatalog.qualifierRecords){let entry=lookups.mfm.get(record.ownerId)||null;if(!entry&&record.ownerKind==='DETACHMENT')entry=lookups.detachment.get(`${record.armyBookId}::${record.armyOwnerId}`);else if(!entry&&record.ownerKind==='UNIT')entry=lookups.unit.get(`${record.armyBookId}::${record.armyOwnerId}`);else if(!entry&&record.ownerKind==='ENHANCEMENT'){for(const [key,candidate] of lookups.enhancement)if(key.startsWith(`${record.armyBookId}::`)&&key.endsWith(`::${record.armyOwnerId}`)){entry=candidate;break;}}if(!entry)throw new Error(`${record.id}: qualifier owner has no bound Army entry`);const mfm=contextualMfm(entry,record.factionId);mfm.qualifiers??=[];mfm.qualifiers.push(clone(record));augmentation.qualifiers++;}
  augmentation.referenceOnlyPointRecords.sort();
  return augmentation;
}

function applyLegacyPresentation(entries,coreCatalog,editorial,resolutions,supplemental){
  const byCanonical=new Map();for(const entry of entries.values()){const key=entry.sourceOwner.canonicalId;if(!byCanonical.has(key))byCanonical.set(key,[]);byCanonical.get(key).push(entry);}
  let editorialMigrated=0,resolutionAliasesMigrated=0,supplementalAliasesMigrated=0,preferredMatchesMigrated=0;const editorialUnresolved=[],preferredMatchesUnresolved=[];
  for(const summary of editorial.summaries||[]){const matches=byCanonical.get(summary.termId)||[];if(matches.length!==1){editorialUnresolved.push(summary.termId);continue;}matches[0].presentation.editorialSummary={text:summary.summary,revision:summary.editorialRevision,contentHash:summary.contentHash};editorialMigrated++;}
  for(const [alias,decision] of Object.entries(resolutions.aliases||{})){const canonical=coreCatalog.resolveId(decision.target),target=entries.get(entryId('core',canonical));if(!target)throw new Error(`Legacy resolution target ${decision.target} is absent from V2`);target.aliases=sortStrings([...target.aliases,alias]);target.presentation.aliasMetadata??=[];target.presentation.aliasMetadata.push({alias,parameters:decision.parameters||null,reason:decision.reason,source:'glossary/resolutions.en.json'});resolutionAliasesMigrated++;}
  const explicitTargets=supplemental.v2Targets||{};

  for(const [alias,id]of Object.entries(explicitTargets))if(!entries.has(id))throw new Error(`${alias} resolves to absent V2 entry ${id}`);
  const resolveSupplementalTarget=value=>{
    if(explicitTargets[value])return entries.get(explicitTargets[value]);
    const core=entries.get(entryId('core',coreCatalog.resolveId(value)));
    if(core)return core;
    const candidates=byCanonical.get(value)||[];
    return candidates.length===1?candidates[0]:null;
  };
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
  const armyModels=loadV2ArmyModels();
  return {coreCatalog,armyModels,mfmCatalog,missionCatalogs,editorial:readJson('glossary/editorial-contracts.v1.json'),resolutions:readJson('glossary/resolutions.en.json'),supplemental:readJson('glossary/supplemental-terms.en.json')};
}

export function createGlossaryV2Index({coreCatalog,armyModels,mfmCatalog,missionCatalogs,editorial,resolutions,supplemental}){
  assertV2ArmyBookParity(armyModels);
  assert.deepEqual(armyModels.map(model=>model.book.id),BOOK_IDS,'Glossary must use exactly the connected V2 books');
  assert.equal(mfmCatalog.sourceVersion,'v1.6-scoped-six','Glossary MFM source is stale');
  const entries=new Map();addCoreEntries(entries,coreCatalog);const armyLookups=addArmyEntries(entries,armyModels);addMissionEntries(entries,missionCatalogs);const mfmAugmentation=attachMfm(entries,armyLookups,mfmCatalog);const legacy=applyLegacyPresentation(entries,coreCatalog,editorial,resolutions,supplemental);
  const ordered=[...entries.values()].map(entry=>{entry.aliases=sortStrings(entry.aliases);entry.contexts.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));entry.canonicalReferences=entry.canonicalReferences.filter(ref=>ref.id).sort((a,b)=>`${a.relationType}:${a.id}`.localeCompare(`${b.relationType}:${b.id}`));if(entry.mfm?.assignedDetachmentIds)entry.mfm.assignedDetachmentIds=sortStrings(entry.mfm.assignedDetachmentIds);for(const context of entry.contexts||[])if(context.mfm?.assignedDetachmentIds)context.mfm.assignedDetachmentIds=sortStrings(context.mfm.assignedDetachmentIds);return entry;}).sort((a,b)=>a.id.localeCompare(b.id));
  const counts={total:ordered.length,standalone:ordered.filter(entry=>!entry.parent).length,scopedChildren:ordered.filter(entry=>entry.parent).length,byDomain:{},byType:{}};for(const entry of ordered){counts.byDomain[entry.domain]=(counts.byDomain[entry.domain]||0)+1;const key=`${entry.domain}:${entry.recordType}`;counts.byType[key]=(counts.byType[key]||0)+1;}
  const index={schema:'wh40k-glossary-v2-index/v1',language:'en',currentnessCutoff:mfmCatalog.currentnessCutoff,factualAuthority:false,factualInputs:[...FACTUAL_INPUTS],presentationInputs:[...PRESENTATION_INPUTS],supportedArmyBooks:[...BOOK_IDS],counts,coverage:{coreEffectiveRecords:coreCatalog.records.length,coreIndexed:counts.byDomain.CORE||0,coreNotIndexed:{identityOnly:coreCatalog.identityOnly.map(record=>record.id).sort(),aliasOnlyErrata:[...CORE_ALIAS_ONLY_ERRATA].sort()},armyEffectiveBooks:armyModels.map(model=>model.book.id),missionsScopes:missionCatalogs.map(catalog=>catalog.scope),mfm:{sourceVersion:mfmCatalog.sourceVersion,scope:mfmCatalog.scope,standaloneArticles:ordered.filter(entry=>entry.domain==='MFM').length,augmentation:mfmAugmentation},legacy},entries:ordered};
  return deepFreeze(JSON.parse(JSON.stringify(index)));
}

export function assertGlossaryV2Parity(publication,inputs){
  assert.deepEqual(publication,createGlossaryV2Index(inputs),'Stale Glossary index or canonical factual mismatch');
  return true;
}
export async function buildGlossaryV2Index(){return createGlossaryV2Index(await loadGlossaryV2Inputs());}

// Scoped publication rebuild: other domains are preserved, never used as Core facts.
// Core entries are reconstructed by the same canonical projection as a full build.
export function rebuildCoreGlossaryProjection(publication,{coreCatalog=createEffectiveCoreCatalog(),editorial=readJson('glossary/editorial-contracts.v1.json'),resolutions=readJson('glossary/resolutions.en.json'),supplemental=readJson('glossary/supplemental-terms.en.json')}={}){
  if(publication.schema!=='wh40k-glossary-v2-index/v1'||publication.factualAuthority!==false)throw new Error('Unsupported Glossary publication');
  const core=new Map();addCoreEntries(core,coreCatalog);
  const previousCore=publication.entries.filter(entry=>entry.domain==='CORE');
  const previousIds=new Set(previousCore.map(entry=>entry.id));
  const additions=[...core.values()].filter(entry=>!previousIds.has(entry.id));
  // An enrolled source-node split may add an owner to an existing source unit.
  // Arbitrary additions/removals still require the full cross-domain producer.
  const isSourceNodeSplit=entry=>{
    const fact=entry.facts,node=fact.sourceNode;
    return node?.sourceUnitId&&node.anchor&&Number.isInteger(node.sourceOrder)&&node.contentHash&&
      previousCore.some(previous=>previous.facts.code===(fact.sourceCode||fact.code)&&
        previous.facts.sourceUnitIds?.includes(node.sourceUnitId)&&core.has(previous.id));
  };
  if([...previousIds].some(id=>!core.has(id))||additions.some(entry=>!isSourceNodeSplit(entry)))throw new Error('Core identity inventory changed; full Glossary rebuild required');
  const entries=new Map(publication.entries.filter(entry=>entry.domain!=='CORE').map(entry=>[entry.id,clone(entry)]));
  for(const [id,entry] of core)entries.set(id,entry);
  applyLegacyPresentation(entries,coreCatalog,editorial,resolutions,supplemental);
  const result=clone(publication);
  result.entries=publication.entries.map(entry=>{
    if(entry.domain!=='CORE')return clone(entry);
    const projected=core.get(entry.id);
    // Existing cross-domain link/search placements belong to the untouched books.
    // They carry identity metadata, never replacement Core text or effective facts.
    if(entry.contexts.some(context=>Object.keys(context).some(key=>!['effectiveBookId','sourceBookId','parentUnitId','sourceAbilityId','termId'].includes(key))))throw new Error('Core context contains factual overrides; full rebuild required');
    projected.contexts=clone(entry.contexts);
    projected.aliases=sortStrings([...projected.aliases,...entry.aliases]);
    projected.canonicalReferences.sort((a,b)=>`${a.relationType}:${a.id}`.localeCompare(`${b.relationType}:${b.id}`));
    return projected;
  });
  for(const entry of additions){
    entry.canonicalReferences.sort((a,b)=>`${a.relationType}:${a.id}`.localeCompare(`${b.relationType}:${b.id}`));
    result.entries.push(entry);
  }
  result.entries.sort((a,b)=>a.id.localeCompare(b.id));
  if(additions.length){
    result.counts.total=result.entries.length;
    result.counts.standalone=result.entries.filter(entry=>!entry.parent).length;
    result.counts.scopedChildren=result.entries.filter(entry=>entry.parent).length;
    result.counts.byDomain.CORE=core.size;
    for(const key of Object.keys(result.counts.byType).filter(key=>key.startsWith('CORE:')))delete result.counts.byType[key];
    for(const entry of result.entries.filter(entry=>entry.domain==='CORE')){
      const key=`CORE:${entry.recordType}`;
      result.counts.byType[key]=(result.counts.byType[key]||0)+1;
    }
  }
  result.coverage.coreEffectiveRecords=coreCatalog.records.length;
  result.coverage.coreIndexed=core.size;
  result.coverage.coreNotIndexed={identityOnly:coreCatalog.identityOnly.map(record=>record.id).sort(),aliasOnlyErrata:[...CORE_ALIAS_ONLY_ERRATA].sort()};
  return deepFreeze(result);
}
export {BOOK_IDS,FACTUAL_INPUTS,PRESENTATION_INPUTS};
