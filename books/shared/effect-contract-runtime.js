(function(root){
  'use strict';
  const list=value=>Array.isArray(value)?value:[],normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(),scopeKey=value=>normalize(value).replace(/ /g,'-');
  const current=relation=>relation?.certainty==='current'&&relation?.provenance?.kind==='explicit-roster-attachment';
  const canonicalId=unit=>unit?.identity?.canonicalDatasheetId||unit?.item?.catalogUnit?.id||unit?.canonicalUnitId||unit?.datasheetId||'';
  const instanceId=unit=>unit?.identity?.instanceId||unit?.id||'';
  const catalogUnit=unit=>unit?.item?.catalogUnit||list(root.WH_BOOK_ROSTER_CATALOG?.units).find(item=>item.id===canonicalId(unit))||{};
  const keywordValues=unit=>[...list(unit?.rosterState?.keywordProfile?.effective),...list(unit?.rosterState?.keywordProfile?.intrinsic),...list(unit?.rosterState?.keywordProfile?.added),...list(catalogUnit(unit)?.intrinsicKeywords)];
  const keywords=(unit,env)=>new Set([...keywordValues(unit),...(env?.effectiveKeywordGrants?.get(instanceId(unit))||[])].map(normalize));
  const abilityIds=unit=>new Set([...list(catalogUnit(unit)?.gameSelections?.abilities),...list(catalogUnit(unit)?.gameSelections?.wargearAbilities)].flatMap(item=>[item?.id,item?.sectionId]).filter(Boolean));
  const selectedIds=(unit,key)=>new Set(list(unit?.selection?.loadout?.[key]).map(item=>typeof item==='string'?item:item?.id).filter(Boolean));
  const selectedWargearOccurrences=(unit,ids)=>{const wanted=new Set(list(ids));return list(unit?.selection?.loadout?.wargear).filter(item=>item?.state==='resolved'&&list(item.wargearAbilityIds).some(id=>wanted.has(id)));};
  const selectedDetachmentIds=context=>{const unitValues=list(context.gameUnit?.rosterState?.detachments),values=unitValues.length?unitValues:list(context.detachments);return new Set(values.map(item=>item?.id||item).filter(Boolean));};
  const selectedEffectWeapon=(contract,context,env)=>{
    const choice=contract.rosterChoice;if(choice?.kind!=='weapon-profile'||choice.count!==1)return null;
    const ownerId=instanceId(env.owner),rows=list(context.record?.effectChoices?.[contract.canonicalRecordId]).filter(item=>item?.ownerInstanceId===ownerId);
    if(rows.length!==1)return null;
    const profileId=rows[0]?.profileId,selected=selectedIds(env.owner,'selectedProfileIds'),profile=list(catalogUnit(env.owner)?.gameSelections?.weaponProfiles).find(item=>item.id===profileId);
    return profile&&selected.has(profileId)&&profile.mode===choice.weaponMode?profileId:null;
  };
  const selectedEffectOption=(contract,context)=>{
    const choice=contract.rosterChoice;if(choice?.kind!=='option'||choice.count!==1)return null;
    const rows=list(context.record?.effectChoices?.[contract.canonicalRecordId]),ids=rows.map(item=>typeof item==='string'?item:item?.choiceId).filter(Boolean);
    if(ids.length!==1||!list(choice.options).some(item=>item.id===ids[0]))return null;
    return ids[0];
  };
  const attachmentGroup=(draft,byInstance)=>{
    let bodyguard=draft;
    const leading=list(draft?.attachments?.leading).find(current);
    if(leading)bodyguard=byInstance.get(leading.instanceId)||draft;
    const leaderRelations=list(bodyguard?.attachments?.leaders).filter(current);
    if(!leaderRelations.length)return {group:null,bodyguard:null,leaders:[]};
    return {group:[bodyguard,...leaderRelations.map(item=>byInstance.get(item.instanceId)).filter(Boolean)],bodyguard,leaders:leaderRelations.map(item=>byInstance.get(item.instanceId)).filter(Boolean)};
  };
  const compare=(actual,operator,expected)=>operator==='eq'?actual===expected:operator==='neq'?actual!==expected:operator==='gte'?actual>=expected:operator==='gt'?actual>expected:operator==='lte'?actual<=expected:operator==='lt'?actual<expected:false;
  const groupHasAbility=(env,id)=>list(env.group).some(unit=>abilityIds(unit).has(id));
  const physicalEquipmentMatches=(selector,unit)=>{
    const requirement=selector.physicalEquipment;if(!requirement)return true;
    const loadout=unit?.selection?.loadout;
    if(requirement.requireResolvedLoadout&&loadout?.weaponResolution?.state!=='resolved')return false;
    if(requirement.requireResolvedLoadout){
      const selectionIds=new Set(list(catalogUnit(unit)?.gameSelections?.selections).map(item=>item.id));
      if(list(loadout?.weapons).some(item=>item.state!=='resolved'||!selectionIds.has(item.selectionId)))return false;
    }
    const metadata=catalogUnit(unit)?.gameSelections||{},excluded=new Set(list(requirement.excludeProfileIds)),profiles=new Map(list(metadata.weaponProfiles).map(profile=>[profile.id,profile])),selections=new Map(list(metadata.selections).map(item=>[item.id,item]));
    const physical=list(loadout?.weapons).filter(item=>list(item.profileIds).some(id=>!excluded.has(id)&&(!requirement.weaponMode||profiles.get(id)?.mode===requirement.weaponMode)));
    const families=list(metadata.weaponFamilies);const groups=new Map();for(const item of physical){const selection=selections.get(item.selectionId),family=selection?.familyId||families.find(candidate=>list(item.profileIds).every(id=>list(candidate.profileIds).includes(id)))?.id,key=family||item.selectionId,items=groups.get(key)||[];items.push(item);groups.set(key,items);}
    const count=physical.length?[...groups.values()].reduce((sum,items)=>{const selectionIds=new Set(items.map(item=>item.selectionId)),quantities=items.map(item=>Number(item.totalQuantity??item.quantity??1));return sum+(selectionIds.size>1?Math.max(...quantities):quantities.reduce((total,value)=>total+value,0));},0):new Set(list(loadout?.selectedProfileIds).filter(id=>!excluded.has(id)&&(!requirement.weaponMode||profiles.get(id)?.mode===requirement.weaponMode))).size;
    const expected=Number(requirement.equals);return !Number.isFinite(expected)||count===expected;
  };
  function matches(selector,env,defaultUnit=env.draft){
    if(!selector||!Object.keys(selector).length)return true;
    if(selector.all&&!list(selector.all).every(item=>matches(item,env,defaultUnit)))return false;
    if(selector.any&&!list(selector.any).some(item=>matches(item,env,defaultUnit)))return false;
    if(selector.anyOf&&!list(selector.anyOf).some(item=>matches(item,env,defaultUnit)))return false;
    if(selector.not&&matches(selector.not,env,defaultUnit))return false;
    let unit=selector.on==='owner'?env.owner:selector.on==='bodyguard'?env.bodyguard:selector.on==='source'?env.sourceUnit:selector.targetRelation==='owner'?env.owner:selector.targetRelation==='bodyguard'?env.bodyguard:defaultUnit;
    const subject=scopeKey(selector.subject),attached=Boolean(env.group);
    if(subject==='bearer'&&unit!==env.owner)return false;
    if((subject==='attached-character'||subject==='attached-leader')&&(!attached||!env.leaders.includes(unit)))return false;
    if(subject==='bodyguard'&&(!attached||unit!==env.bodyguard))return false;
    if(subject==='attached-unit'&&(!attached||!list(env.group).includes(unit)))return false;
    if(subject==='upgraded-unit'&&unit!==(env.owner||env.sourceUnit))return false;
    const id=canonicalId(unit),keys=keywords(unit),abilities=abilityIds(unit);
    if(selector.unitIds&&!list(selector.unitIds).includes(id))return false;
    if(selector.excludeUnitIds&&list(selector.excludeUnitIds).includes(id))return false;
    if(selector.noneUnitIds&&list(selector.noneUnitIds).includes(id))return false;
    if(selector.sourceUnitId&&canonicalId(env.sourceUnit)!==selector.sourceUnitId)return false;
    if(selector.sourceUnitIds&&!list(selector.sourceUnitIds).includes(canonicalId(env.sourceUnit)))return false;
    if(selector.excludeSourceOwner&&unit===env.owner)return false;
    if(selector.excludeSourceUnit&&unit===env.sourceUnit)return false;
    if(selector.ownerUnitIds&&!list(selector.ownerUnitIds).includes(canonicalId(env.owner)))return false;
    if(selector.bodyguardUnitIds&&!list(selector.bodyguardUnitIds).includes(canonicalId(env.bodyguard)))return false;
    if(selector.allKeywords&&!list(selector.allKeywords).every(key=>keys.has(normalize(key))))return false;
    if(selector.anyKeywords&&!list(selector.anyKeywords).some(key=>keys.has(normalize(key))))return false;
    if(selector.noneKeywords&&list(selector.noneKeywords).some(key=>keys.has(normalize(key))))return false;
    if(selector.abilityId&&!abilities.has(selector.abilityId))return false;
    if(selector.abilityIds&&!list(selector.abilityIds).every(value=>abilities.has(value)))return false;
    if(selector.allAbilities&&!list(selector.allAbilities).every(value=>abilities.has(value)))return false;
    if(selector.groupAbilityIds&&!list(selector.groupAbilityIds).every(value=>groupHasAbility(env,value)))return false;
    if(selector.detachmentId&&!env.detachmentIds.has(selector.detachmentId))return false;
    if(selector.detachmentIds&&!list(selector.detachmentIds).some(value=>env.detachmentIds.has(value)))return false;
    if(selector.groupContainsUnitIds&&!list(selector.groupContainsUnitIds).every(value=>list(env.group).some(member=>canonicalId(member)===value)))return false;
    if(selector.allUnitIds&&!list(selector.allUnitIds).every(value=>list(env.group).some(member=>canonicalId(member)===value)))return false;
    if(selector.attachmentGroup?.allUnitIds&&!list(selector.attachmentGroup.allUnitIds).every(value=>list(env.group).some(member=>canonicalId(member)===value)))return false;
    if(selector.groupExcludesUnitIds&&list(selector.groupExcludesUnitIds).some(value=>list(env.group).some(member=>canonicalId(member)===value)))return false;
    if(selector.groupHasEnhancementIds&&!list(selector.groupHasEnhancementIds).some(value=>env.groupEnhancementIds.has(value)))return false;
    const participatesInLeading=selector.on==='source'
      ?Boolean(env.sourceUnit&&list(env.group).includes(env.sourceUnit))
      :selector.on==='owner'?env.ownerIsLeader
      :unit===env.sourceUnit?env.sourceIsLeader:env.ownerIsLeader;
    if(selector.requiresLeading===true&&!participatesInLeading)return false;
    if(selector.requiresLeading===false&&participatesInLeading)return false;
    if(selector.attachmentState&&selector.attachmentState!==env.attachmentState)return false;
    if(selector.modelCount){
      const state=unit?.selection?.modelCount,actual=Number(state?.value??state),operator=selector.modelCount.operator||'eq',value=selector.modelCount.value??selector.modelCount.equals;
      if(selector.modelCount.requiredState&&state?.state!==selector.modelCount.requiredState)return false;
      if(!Number.isFinite(actual)||!compare(actual,operator,Number(value)))return false;
    }
    if(selector.stat||selector.minCharacteristics){
      const requirement=selector.stat||Object.entries(selector.minCharacteristics||{}).map(([id,value])=>({id,operator:'gte',value}))[0],actual=Number.parseInt(catalogUnit(unit)?.gameSelections?.stats?.[requirement.id],10);
      if(!Number.isFinite(actual)||!compare(actual,requirement.operator||'eq',Number(requirement.value)))return false;
    }
    if(selector.selectedProfileIds&&!list(selector.selectedProfileIds).some(value=>selectedIds(unit,'selectedProfileIds').has(value)))return false;
    if(selector.selectedWargearAbilityIds&&!list(selector.selectedWargearAbilityIds).some(value=>selectedIds(unit,'selectedWargearAbilityIds').has(value)))return false;
    if(selector.canonicalTargetIds&&!list(selector.canonicalTargetIds).some(value=>selectedIds(unit,'selectedWargearAbilityIds').has(value)))return false;
    if(selector.canonicalEquipmentIds&&!list(selector.canonicalEquipmentIds).some(value=>selectedIds(unit,'selectedWargearAbilityIds').has(value)||selectedIds(unit,'selectedProfileIds').has(value)))return false;
    if(!physicalEquipmentMatches(selector,unit))return false;
    return true;
  }
  const scopeMatches=(scope,env)=>{
    const value=scopeKey(scope),draft=env.draft,source=env.sourceUnit||env.owner,group=list(env.group),attached=Boolean(env.group);
    if(['unit','effective-unit','selected-detachment','roster-reference'].includes(value))return true;
    if(['owner','bearer','assigned-enhancement','unit-upgrade','upgraded-unit','source','source-model','physical-support-composition'].includes(value))return draft===(value.startsWith('source')||value==='physical-support-composition'?env.sourceUnit:env.owner||env.sourceUnit);
    if(value==='attached-group'||value==='owner-or-attached-group')return attached?group.includes(draft):draft===source;
    if(['attachment-group','attached-unit','leading'].includes(value))return attached&&group.includes(draft);
    if(['attached-group-excluding-source','attachment-members-excluding-source'].includes(value))return attached&&group.includes(draft)&&draft!==source;
    if(value==='bodyguard'||value==='attached-bodyguard'||value==='bodyguard-members-excluding-source')return attached&&draft===env.bodyguard&&draft!==source;
    if(value==='attached-leaders')return attached&&env.leaders.includes(draft);
    if(value==='attached-selected-wargear')return attached&&group.includes(draft);
    if(value==='bearer-while-attached'||value==='owner-if-leading')return attached&&draft===env.owner&&env.ownerIsLeader;
    if(value==='bearer-aura')return draft===env.owner;
    if(value==='selected-wargear'||value==='selected-physical-loadout')return draft===env.owner||draft===env.sourceUnit;
    if(value==='roster-unit-pair')return true;
    return false;
  };
  const enhancementResolution=(context,id,env)=>{
    const matches=list(context.enhancements).filter(item=>{
      const record=item?.catalog||{},input=item?.input||{};return input.ownerStatus==='resolved'&&input.ownerUnitId&&[record.id,record.ruleId,record.sourceId,record.legacyKey].includes(id);
    }),draftId=instanceId(env.draft),groupIds=new Set(list(env.group).map(instanceId));
    return matches.find(item=>item.input.ownerUnitId===draftId)||matches.find(item=>groupIds.has(item.input.ownerUnitId))||null;
  };
  const declaredSourceUnitIds=contract=>[contract.sourceUnitId,...list(contract.sourceUnitIds),contract.selector?.sourceUnitId,...list(contract.selector?.sourceUnitIds)].filter(Boolean);
  const locateSourceUnit=(contract,env)=>{
    const declared=declaredSourceUnitIds(contract),expected=declared.length?declared:list(contract.selector?.unitIds);
    const rosterWide=['roster-reference','roster-unit-pair'].includes(scopeKey(contract.scope));
    const candidates=[env.draft,...list(env.group),...(rosterWide?list(env.gameUnits):[])].filter((item,index,items)=>item&&items.indexOf(item)===index);
    if(expected.length)return candidates.find(unit=>expected.includes(canonicalId(unit)))||null;
    const selector=contract.selector||{};
    return candidates.find(unit=>{
      const abilities=abilityIds(unit);
      return (!selector.abilityId||abilities.has(selector.abilityId))
        &&(!selector.abilityIds||list(selector.abilityIds).every(value=>abilities.has(value)))
        &&(!selector.allAbilities||list(selector.allAbilities).every(value=>abilities.has(value)));
    })||null;
  };
  function activation(contract,context,base){
    const env={...base,context,owner:null,sourceUnit:null,ownerIsLeader:false,sourceIsLeader:false,attachmentState:base.group?'attached':'unattached'};
    if(contract.detachmentId&&!env.detachmentIds.has(contract.detachmentId))return null;
    if(contract.sourceKind==='enhancement'){
      const resolution=enhancementResolution(context,contract.canonicalRecordId,env),owner=resolution&&env.byInstance.get(resolution.input.ownerUnitId);if(!owner)return null;env.owner=owner;env.sourceUnit=owner;
    }else if(contract.sourceKind==='detachment-rule'){
      const required=contract.detachmentId||contract.selector?.detachmentId;if(required&&!env.detachmentIds.has(required))return null;
    }else if(['selected-wargear','wargear-ability'].includes(contract.sourceKind)){
      const candidates=list(env.group).length?env.group:[env.draft],matched=candidates.find(unit=>matches(contract.selector,{...env,owner:unit,sourceUnit:unit},unit));if(!matched)return null;env.owner=matched;env.sourceUnit=matched;
    }else if(['ability','datasheet-ability','transport'].includes(contract.sourceKind)){
      env.sourceUnit=locateSourceUnit(contract,env);if(!env.sourceUnit)return null;env.owner=env.sourceUnit;
    }
    env.ownerIsLeader=Boolean(env.owner&&env.leaders.includes(env.owner));
    env.sourceIsLeader=Boolean(env.sourceUnit&&env.leaders.includes(env.sourceUnit));
    env.attachmentState=env.ownerIsLeader?'leading':env.owner===env.bodyguard&&env.group?'being-led':env.group?'attached':'unattached';
    const rootUnit=['ability','datasheet-ability','transport'].includes(contract.sourceKind)
      ?env.sourceUnit
      :contract.sourceKind==='enhancement'||['selected-wargear','wargear-ability'].includes(contract.sourceKind)?env.owner:env.draft;
    const declared=declaredSourceUnitIds(contract),targetUnitIds=declared.length?list(contract.selector?.unitIds).filter(id=>!declared.includes(id)):[];
    if(targetUnitIds.length){const sourceSelector={...(contract.selector||{})};delete sourceSelector.unitIds;if(!matches(sourceSelector,env,rootUnit)||!matches({unitIds:targetUnitIds},env,env.draft))return null;return env;}
    return matches(contract.selector,env,rootUnit)?env:null;
  }
  const conditionState=(conditions,env,contract)=>{
    let unknown=false;
    for(const condition of list(conditions)){
      if(condition.selector){if(!matches(condition.selector,env))return {applies:false,unknown:false};continue;}
      if(condition.kind==='attachment-state'){if(condition.value==='attached'&&!env.group)return {applies:false,unknown:false};continue;}
      if(condition.kind==='ROSTER_UNIT_PRESENT'){if(!list(condition.unitIds).some(id=>env.gameUnits.some(unit=>canonicalId(unit)===id)))return {applies:false,unknown:false};continue;}
      if(condition.kind==='ATTACHMENT_MEMBER_PRESENT'||condition.kind==='attachment-group-contains'){const wanted=list(condition.unitIds||[condition.unitId]);if(!wanted.some(id=>list(env.group).some(unit=>canonicalId(unit)===id)))return {applies:false,unknown:false};continue;}
      if(condition.kind==='attachment-group-excludes'){if(list(env.group).some(unit=>canonicalId(unit)===condition.unitId))return {applies:false,unknown:false};continue;}
      if(condition.kind==='source-unit-present'){if(!list(env.group).some(unit=>canonicalId(unit)===condition.unitId))return {applies:false,unknown:false};continue;}
      if(condition.kind==='unit-keyword'){if(!list(env.group||[env.draft]).some(unit=>keywords(unit,env).has(normalize(condition.keyword))))return {applies:false,unknown:false};continue;}
      if(condition.kind==='unit-keyword-absent'){if(list(env.group||[env.draft]).some(unit=>keywords(unit,env).has(normalize(condition.keyword))))return {applies:false,unknown:false};continue;}
      if(condition.kind==='roster-choice'){if(selectedEffectOption(contract,env.context)!==condition.choiceId)return {applies:false,unknown:false};continue;}
      if(condition.state==='unknown'||condition.certainty==='unknown'){unknown=true;continue;}
      unknown=true;
    }
    return {applies:true,unknown};
  };
  const canonicalTarget=operation=>typeof operation.canonicalTarget==='string'?{id:operation.canonicalTarget,kind:operation.parameters?.referenceKind}:operation.canonicalTarget;
  const profileFor=(profileIds,env,contract)=>{
    if(contract&&list(root.WH_BOOK_ROSTER_CATALOG?.enhancements).length){const item=list(root.WH_BOOK_ROSTER_CATALOG.enhancements).find(row=>[row.id,row.ruleId,row.sourceId,row.legacyKey].includes(contract.canonicalRecordId));if(item?.profile)return item.profile;}
    for(const unit of list(root.WH_BOOK_ROSTER_CATALOG?.units))for(const profile of list(unit?.gameSelections?.weaponProfiles))if(list(profileIds).includes(profile.id))return profile;
    return null;
  };
  const existingAbility=(unit,id)=>abilityIds(unit).has(id);
  const canonicalReferenceRecord=(kind,id)=>{
    const catalog=root.WH_BOOK_ROSTER_CATALOG||{};
    if(kind==='enhancement')return list(catalog.enhancements).find(item=>[item.id,item.ruleId,item.sourceId,item.legacyKey].includes(id));
    if(kind==='detachment-rule')return list(catalog.detachmentRules).find(item=>item.id===id);
    if(kind==='ability')for(const unit of list(catalog.units))for(const item of [...list(unit?.gameSelections?.abilities),...list(unit?.gameSelections?.wargearAbilities)])if(item.id===id||item.sectionId===id)return item;
    return null;
  };
  const operationRecord=(operation,contract,env,unknown,selector={})=>{
    const target=canonicalTarget(operation),parameters={...(operation.parameters||{})},map={
      CHARACTERISTIC_ADD:['stat','add'],CHARACTERISTIC_SET:['stat','set'],WEAPON_CHARACTERISTIC_ADD:['weapon','add-stat'],WEAPON_TAG_GRANT:['weapon','grant-tag'],WEAPON_PROFILE_GRANT:['weapon','grant-profile'],ABILITY_GRANT:['ability','grant'],ABILITY_REMOVE:['ability','remove'],ABILITY_RANGE_ADD:['ability','add-range'],KEYWORD_GRANT:['keyword','grant'],KEYWORD_REMOVE:['keyword','remove'],TRANSPORT_CAPACITY_SET:['transport','set-capacity'],TARGETING_RESTRICTION_GRANT:['targeting','grant-restriction'],CANONICAL_REFERENCE:['ability','reference']
    },[component,kind]=map[operation.type]||[];
    if(parameters.characteristic&&!parameters.stat)parameters.stat=parameters.characteristic;if(parameters.value!=null&&parameters.delta==null&&operation.type.endsWith('_ADD'))parameters.delta=parameters.value;if(parameters.value!=null&&parameters.to==null&&operation.type==='CHARACTERISTIC_SET')parameters.to=parameters.value;
    if(operation.type==='ABILITY_GRANT'&&target.id==='core-feel-no-pain'&&parameters.value&&!parameters.title)parameters.title=`Feel No Pain ${parameters.value}`;
    if(operation.type==='ABILITY_RANGE_ADD'&&!parameters.title)parameters.title=canonicalReferenceRecord('ability',target.id)?.title||target.id;
    delete parameters.characteristic;delete parameters.value;
    if(operation.type==='WEAPON_PROFILE_GRANT'&&!parameters.profile){parameters.profile=profileFor(parameters.profileIds,env,contract);if(!parameters.profile)return null;}
    let targetId=target.id;
    if(component==='weapon'&&['weapon-class','weapon-family'].includes(target.kind)){
      const records=list(catalogUnit(env.draft)?.gameSelections?.[target.kind==='weapon-class'?'weaponClasses':'weaponFamilies']),matches=records.filter(record=>record.id===target.id);
      if(matches.length>1)throw new Error(`${contract.canonicalRecordId}: duplicate canonical ${target.kind} ${target.id}`);
      parameters.profileIds=matches.length===1?[...list(matches[0].profileIds)]:[];
    }
    if(targetId==='selected-physical-melee-profiles'){
      const excluded=new Set(list(selector.physicalEquipment?.excludeProfileIds)),selected=selectedIds(env.draft,'selectedProfileIds');
      parameters.profileIds=list(catalogUnit(env.draft)?.gameSelections?.weaponProfiles).filter(profile=>profile.mode==='melee'&&selected.has(profile.id)&&!excluded.has(profile.id)).map(profile=>profile.id);
      targetId='selected-melee';
    }
    if(targetId==='selected-effect-weapon-profile'){
      const profileId=selectedEffectWeapon(contract,env.context,env);if(!profileId)return null;
      parameters.profileIds=[profileId];targetId=profileId;
    }
    const sourceKind=['ability','datasheet-ability','transport'].includes(contract.sourceKind)?(contract.sourceKind==='transport'?'transport':env.sourceUnit&&list(env.group).includes(env.sourceUnit)?'explicit-attachment':contract.sourceKind==='datasheet-ability'?'datasheet':'ability'):contract.sourceKind==='detachment-rule'?'detachment':contract.sourceKind.includes('wargear')?'selected-wargear':contract.sourceKind==='enhancement'&&env.owner&&env.owner!==env.draft&&list(env.group).includes(env.draft)?'explicit-attachment':'enhancement';
    const sourceId=sourceKind==='detachment'?(contract.detachmentId||contract.canonicalRecordId):contract.canonicalRecordId;
    const physicalBearer=parameters.physicalBearer;delete parameters.physicalBearer;let physicalTargets=[];
    if(physicalBearer){const bindings=new Map(list(physicalBearer.modelProfileBindings).map(item=>[item.modelId,item.statProfileId])),grouped=new Map();for(const item of selectedWargearOccurrences(env.owner||env.sourceUnit,contract.selector?.selectedWargearAbilityIds)){const statProfileId=bindings.get(item.canonicalModelId);if(!statProfileId)continue;const key=`${item.cohortId}\0${item.canonicalModelId}\0${statProfileId}`,current=grouped.get(key)||{cohortId:item.cohortId,canonicalModelId:item.canonicalModelId,statProfileId,model:item.model||'',modelQuantity:item.modelQuantity,selectedQuantity:0};current.selectedQuantity+=Number(item.quantity)||1;grouped.set(key,current);}physicalTargets=[...grouped.values()];if(!physicalTargets.length)return null;}
    const effect={id:operation.id,component,targetId,operation:kind,...parameters,...(physicalTargets.length?{physicalTargets}:{}),targetInstanceId:instanceId(env.draft),source:{kind:sourceKind,id:sourceId,ownerInstanceId:instanceId(env.owner||env.sourceUnit)||null},provenance:{rosterFact:'canonical-effect-contract',sourceId:contract.source.sourceId,locator:contract.source.locator,confidence:contract.confidence}};
    delete effect.referenceKind;
    if(operation.type==='CANONICAL_REFERENCE'){const referenceKind=target.kind||operation.parameters?.referenceKind||contract.sourceKind,record=canonicalReferenceRecord(referenceKind,target.id);effect.canonicalReference={kind:referenceKind,id:target.id,...(record?{title:record.title,text:record.text,sectionId:record.sectionId||record.id}:{})};if(referenceKind==='ability')effect.canonicalAbilityId=target.id;effect.state='reference';effect.targetState=record?'resolved':'unresolved';effect.targets=[];}
    if(unknown){effect.state='conditional';effect.certainty='unknown';effect.condition={kind:'accepted-effect-state',state:'unknown'};}
    return effect;
  };
  const operationAllowed=(operation,contract,env)=>{
    const target=canonicalTarget(operation).id,unit=env.draft,loadout=unit?.selection?.loadout;
    if(operation.type==='CHARACTERISTIC_ADD'&&catalogUnit(unit)?.gameSelections?.stats?.[target]==null&&operation.parameters?.modifierOnly!==true)return false;
    if(contract.stackingPolicy==='best-value'&&operation.type==='CHARACTERISTIC_SET'&&operation.parameters?.direction==='lower-is-better'){
      const current=Number.parseInt(catalogUnit(unit)?.gameSelections?.stats?.[target],10),next=Number.parseInt(operation.parameters.to??operation.parameters.value,10);if(Number.isFinite(current)&&current<=next)return false;
    }
    return true;
  };
  function project(context){
    const contracts=list(root.WH_BOOK_ROSTER_CATALOG?.effectContracts),draft=context.gameUnit,byInstance=context.byInstance||new Map(),attachment=attachmentGroup(draft,byInstance),groupEnhancementIds=new Set(list(context.enhancements).filter(item=>item?.input?.ownerStatus==='resolved'&&list(attachment.group).some(unit=>instanceId(unit)===item.input.ownerUnitId)).map(item=>item.catalog?.id).filter(Boolean)),effectiveKeywordGrants=new Map(),base={draft,byInstance,gameUnits:list(context.gameUnits),group:attachment.group,bodyguard:attachment.bodyguard,leaders:attachment.leaders,detachmentIds:selectedDetachmentIds(context),groupEnhancementIds,effectiveKeywordGrants},output=[];
    if(byInstance.size&&byInstance.get(instanceId(draft))!==draft)return [];
    let changed=true,pass=0;
    while(changed&&pass<=contracts.length){
      changed=false;pass++;
      for(const contract of contracts){
        const env=activation(contract,context,base);if(!env||!scopeMatches(contract.scope,env))continue;
        for(const clause of list(contract.clauses)){
          if(clause.selector?.scope&&!scopeMatches(clause.selector.scope,env))continue;
          if(!matches(clause.selector||{},env))continue;
          const state=conditionState(clause.conditions,env,contract),timingUnknown=contract.timingState?.state==='unknown';if(!state.applies)continue;
          for(const operation of list(clause.operations)){
            if(!operationAllowed(operation,contract,env))continue;
            const effect=operationRecord(operation,contract,env,state.unknown||timingUnknown,clause.selector);if(!effect)continue;
            output.push(effect);
            if(effect.component==='keyword'&&effect.operation==='grant'&&effect.state!=='conditional'){
              const id=instanceId(draft),values=effectiveKeywordGrants.get(id)||new Set(),value=normalize(effect.targetId);
              if(value&&!values.has(value)){values.add(value);effectiveKeywordGrants.set(id,values);changed=true;}
            }
          }
        }
      }
    }
    const seen=new Set();return output.filter(effect=>{const key=`${effect.id}\0${effect.source?.ownerInstanceId||''}`;if(seen.has(key))return false;seen.add(key);return true;});
  }
  root.WHEffectContractRuntime=Object.freeze({schema:'wh40k-effect-runtime/v1',project,matches,scopeMatches});
}(typeof window==='undefined'?globalThis:window));
