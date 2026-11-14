(function(root){
  'use strict';

  const apostrophes=/[\u2018\u2019\u02bc\uff07]/g;
  const dashes=/[\u2010\u2011\u2012\u2013\u2014\u2212\ufe58\ufe63\uff0d]/g;
  const list=value=>value instanceof Set?[...value]:Array.isArray(value)?[...value]:null;
  const relationKeys=['canLead','canSupport','canBeLedBy','canBeSupportedBy'];
  const staticRosterConditions=new Set(['attachment-unknown','second-character-unknown','second-unit-unknown','warlord-unknown','detachment-not-selected']);

  function normalizeKeyword(value){
    if(typeof value!=='string')throw new TypeError(`Keyword must be a string, received ${value===null?'null':typeof value}`);
    return value.normalize('NFKC').replace(/\u00a0/g,' ').replace(apostrophes,"'").replace(dashes,'-').replace(/\s+/g,' ').trim().toUpperCase();
  }

  function textFromDomLike(value){
    if(typeof value==='string')return value;
    if(value&&typeof value.textContent==='string')return value.textContent;
    throw new TypeError(`DOM text boundary expected a string or textContent, received ${value===null?'null':typeof value}`);
  }

  function normalizedSet(value,field){
    const entries=list(value);
    if(!entries)throw new TypeError(`${field} must be an array or Set`);
    return new Set(entries.map(normalizeKeyword).filter(Boolean));
  }

  function stringSet(value,field){
    const entries=list(value);
    if(!entries)throw new TypeError(`${field} must be an array or Set`);
    return new Set(entries.map(item=>{
      if(typeof item!=='string')throw new TypeError(`${field} entries must be strings`);
      return item.trim();
    }).filter(Boolean));
  }

  function candidateProfile(candidate,index){
    if(!candidate||typeof candidate!=='object'||Array.isArray(candidate))throw new TypeError(`candidates[${index}] must be a plain object`);
    const keywords=normalizedSet(requiredKeywordField(candidate)||[],`candidates[${index}].keywords`);
    const intrinsicKeywords=normalizedSet(requiredKeywordField(candidate, "intrinsicKeywords")||requiredKeywordField(candidate)||[],`candidates[${index}].intrinsicKeywords`);
    const profile={
      ...candidate,
      unitId:candidate.unitId||candidate.id||'',
      slug:candidate.slug||String(candidate.unitId||candidate.id||'').replace(/^unit-/,''),
      keywords,
      intrinsicKeywords
    };
    if(candidate.abilities!=null)profile.abilities=normalizedSet(candidate.abilities,`candidates[${index}].abilities`);
    if(candidate.termIds!=null||candidate.ids!=null)profile.termIds=stringSet(candidate.termIds||candidate.ids,`candidates[${index}].termIds`);
    return profile;
  }

  function relationProfile(relation,key,index){
    if(!relation||typeof relation!=='object'||Array.isArray(relation))throw new TypeError(`relations.${key}[${index}] must be a plain object`);
    if(typeof relation.unitId!=='string'||!relation.unitId)throw new TypeError(`relations.${key}[${index}] requires a string unitId`);
    return {...relation,keywords:normalizedSet(requiredKeywordField(relation)||[],`relations.${key}[${index}].keywords`),removeKeywords:normalizedSet(relation.removeKeywords||[],`relations.${key}[${index}].removeKeywords`)};
  }

  function relationGraph(value={}){
    if(!value||typeof value!=='object'||Array.isArray(value))throw new TypeError('relations must be a plain object');
    for(const key of Object.keys(value))if(!relationKeys.includes(key))throw new TypeError(`Unsupported relation key: ${key}`);
    return Object.fromEntries(relationKeys.map(key=>{
      const entries=list(value[key]||[]);if(!entries)throw new TypeError(`relations.${key} must be an array or Set`);
      return [key,entries.map((relation,index)=>relationProfile(relation,key,index))];
    }));
  }

  function profileFromRecord(record){
    if(!record||typeof record!=='object'||Array.isArray(record))throw new TypeError('Rule facts record must be a plain object');
    const unitId=record.unitId||record.id||'';
    if(typeof unitId!=='string'||!unitId)throw new TypeError('Rule facts record requires a string unitId');
    const keywords=normalizedSet(requiredKeywordField(record)||[],'keywords');
    const intrinsicKeywords=normalizedSet(requiredKeywordField(record, "intrinsicKeywords")||requiredKeywordField(record)||[],'intrinsicKeywords');
    const termIds=stringSet(record.termIds||record.ids||[],'termIds');
    const candidates=list(record.candidates||[]);
    if(!candidates)throw new TypeError('candidates must be an array or Set');
    const normalizedCandidates=candidates.map(candidateProfile);
    const profile={
      ...record,
      unitId,
      id:record.id||unitId,
      slug:record.slug||unitId.replace(/^unit-/,''),
      keywords,
      intrinsicKeywords,
      abilities:normalizedSet(record.abilities||[],'abilities'),
      termIds,
      ids:new Set(termIds),
      candidates:normalizedCandidates.length?normalizedCandidates:undefined,
      relations:relationGraph(record.relations||{}),
      epic:record.epic==null?intrinsicKeywords.has('EPIC HERO'):Boolean(record.epic),
      deadlyDemise:record.deadlyDemise==null?false:Boolean(record.deadlyDemise),
      attached:record.attached??null,
      attachmentKnown:record.attachmentKnown==null?null:Boolean(record.attachmentKnown),
      formationRequired:Boolean(record.formationRequired),
      characterCount:record.characterCount==null?(intrinsicKeywords.has('CHARACTER')?1:0):Number(record.characterCount),
      twoCharacters:record.twoCharacters??null,
      warlord:record.warlord??null
    };
    profile.has=id=>profile.termIds.has(id);
    return profile;
  }

  function safeFragment(value){return String(value).slice(0,160).replace(/\s+/g,' ');}

  function parseDatasetJson(dataset,field,{required=false,defaultValue,unitId='unknown'}={}){
    if(!dataset||typeof dataset!=='object')throw new TypeError('Dataset must be an object');
    const raw=dataset[field];
    if(raw==null||raw===''){
      if(required)throw new Error(`${unitId}: missing data-${field.replace(/[A-Z]/g,letter=>`-${letter.toLowerCase()}`)}`);
      return defaultValue;
    }
    if(typeof raw!=='string')throw new TypeError(`${unitId}: data-${field} must be a string`);
    try{return JSON.parse(raw);}
    catch(error){throw new Error(`${unitId}: malformed data-${field.replace(/[A-Z]/g,letter=>`-${letter.toLowerCase()}`)} (${safeFragment(raw)}): ${error.message}`);}
  }

  function recordFromDataset(dataset={},identity={}){
    const unitId=identity.unitId||identity.id||dataset.unitId||'unknown';
    const compiled=parseDatasetJson(dataset,'ruleFacts',{required:true,unitId});
    if(!compiled||typeof compiled!=='object'||Array.isArray(compiled))throw new TypeError(`${unitId}: data-rule-facts must contain an object`);
    return {...compiled,...identity,unitId:identity.unitId||identity.id||compiled.unitId||unitId};
  }

  const profileFromDataset=(dataset,identity={},extra={})=>profileFromRecord({...recordFromDataset(dataset,identity),...extra});
  const sorted=value=>[...(value||[])].sort();
  const serializeCandidate=candidate=>({
    unitId:candidate.unitId||'',slug:candidate.slug||'',keywords:sorted(requiredKeywordField(candidate)),intrinsicKeywords:sorted(requiredKeywordField(candidate, "intrinsicKeywords")),
    abilities:sorted(candidate.abilities),termIds:sorted(candidate.termIds),attached:candidate.attached??null,
    attachmentKnown:candidate.attachmentKnown??null,characterCount:candidate.characterCount??null,warlord:candidate.warlord??null
  });
  const serializeRelation=relation=>({unitId:relation.unitId,keywords:sorted(requiredKeywordField(relation)),removeKeywords:sorted(relation.removeKeywords),characterCount:relation.characterCount??null,maxCharacters:relation.maxCharacters??null,mandatory:Boolean(relation.mandatory),...(relation.attachmentGroupConstraint?{attachmentGroupConstraint:structuredClone(relation.attachmentGroupConstraint)}:{})});
  function serializeRuleProfile(profile){
    return {
      id:profile.id||'',unitId:profile.unitId||'',slug:profile.slug||'',keywords:sorted(requiredKeywordField(profile)),intrinsicKeywords:sorted(requiredKeywordField(profile, "intrinsicKeywords")),
      abilities:sorted(profile.abilities),termIds:sorted(profile.termIds||profile.ids),epic:Boolean(profile.epic),deadlyDemise:Boolean(profile.deadlyDemise),
      attached:profile.attached??null,attachmentKnown:profile.attachmentKnown??null,formationRequired:Boolean(profile.formationRequired),characterCount:profile.characterCount??null,twoCharacters:profile.twoCharacters??null,warlord:profile.warlord??null,
      relations:Object.fromEntries(relationKeys.map(key=>[key,[...(profile.relations?.[key]||[])].map(serializeRelation).sort((a,b)=>a.unitId.localeCompare(b.unitId))])),
      candidates:[...(profile.candidates||[])].map(serializeCandidate).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))
    };
  }

  const compatibilityConditions=result=>[...new Set(result?.conditions?.length?result.conditions:result?.condition?[result.condition]:result?.reasons||[])];
  function staticCompatible(result){
    if(result?.state==='match')return true;
    if(result?.state!=='conditional')return false;
    const conditions=compatibilityConditions(result);
    if(conditions.some(condition=>staticRosterConditions.has(condition)))return false;
    return conditions.length>0||Boolean(result.matchedRoleIds?.length);
  }
  const filterStaticCompatible=rules=>(rules||[]).filter(staticCompatible);

  const KEYWORD_FORMATS=Object.freeze(['flat','linked-scopes','composition-memberships','profile-declarations','profile-groups']);
  const keywordPassports=new Map();
  function registerKeywordPassports(configs){
    const ids=new Set();
    for(const config of configs){
      if(!config?.id||ids.has(config.id))throw new TypeError('Duplicate or missing keyword passport identity');
      ids.add(config.id);
    }
    for(const config of configs)keywordPassports.set(config.id,config.passport);
  }
  const unique=values=>[...new Set(values)];
  const scopeName=value=>String(value).trim().replace(/\s+/g,' ').toUpperCase();

  /** These are already computed state/presentation fields, not canonical facts.
   * Keep their array/Set ordering and literal values; do not resolve native scopes. */
  function keywordField(value,field='keywords'){return value?.[field];}
  function requiredKeywordField(value,field='keywords'){return value[field];}
  function keywordValues(value,field='keywords'){
   const values=keywordField(value,field);
   if(values===undefined||values===null)return [];
   if(!Array.isArray(values)&&!(values instanceof Set))throw new TypeError('Keyword field '+field+' must be an array or Set');
   return [...values];
  }
  const hasKeyword=(value,keyword,field='keywords')=>keywordValues(value,field).includes(keyword);
  const keywordGroups=value=>value?.keywordGroups;
  const keywordScopeGroups=value=>value?.data?.scopes||[];

  /** Linked source records keep their exact identity and presentation addresses. */
  function keywordScopesForUnit(unit,entities){
   if(!unit.data.keywordScopesId)return null;
   const scope=entities.get(unit.data.keywordScopesId);
   if(scope?.kind!=='KEYWORD_SCOPES'||scope.parentId!==unit.id)throw new TypeError('Invalid canonical keyword scope');
   return scope;
  }
  const profileKeywordScopeIds=profile=>profile.data.keywordScopeIds;

  /** Generic flat fixtures use the established flat canonical interface. Public
   * book layouts always come from their passport, never a book-name branch. */
  function createKeywordAccess(book,{passport,entities}={}){
   const bookId=book.bookId||book.book?.id||book.id||'<anonymous>';
   const declared=passport||keywordPassports.get(bookId);
   const format=declared?.keywords?.format??(declared?undefined:'flat');
   const fail=(unit,message)=>{throw new TypeError(`Keyword access ${bookId} · ${unit?.id||'<unit>'}: ${message}`);};
   if(!Array.isArray(book.entities))fail(null,'missing keyword entity collection');
   if(!KEYWORD_FORMATS.includes(format))fail(book.entities.find(entity=>entity.kind==='DATASHEET'),'unknown passport.keywords.format '+JSON.stringify(format));
   const index=entities||new Map(book.entities.map(entity=>[entity.id,entity]));
   const strings=(values,unit,field)=>{
    if(!Array.isArray(values)||values.some(value=>typeof value!=='string'||!value))fail(unit,'invalid '+field);
    return [...values];
   };
   const unitFor=value=>{
    const unit=typeof value==='string'?index.get(value):value;
    if(unit?.kind!=='DATASHEET')fail(unit,'unresolved DATASHEET identity');
    const data=unit.data;
    if(!data||typeof data!=='object')fail(unit,'missing keyword owner data');
    const shapes=[data.keywordScopesId&&'linked-scopes',data.keywordScope&&'profile-declarations',data.keywordGroups&&'profile-groups',data.modelGroups?.some(group=>group.modelProfileId&&group.compositionMemberIds)&&'composition-memberships'].filter(Boolean);
    if(shapes.some(shape=>shape!==format))fail(unit,'native layout contradicts passport.keywords.format '+format);
    if(format!=='flat'&&!shapes.includes(format))fail(unit,'missing native layout for passport.keywords.format '+format);
    return unit;
   };
   const records=unit=>book.entities.filter(entity=>(entity.ownerId===unit.id||entity.parentId===unit.id)&&['KEYWORD_MEMBERSHIP','FACTION_KEYWORD'].includes(entity.kind));
   const scopes=unit=>{
    const record=keywordScopesForUnit(unit,index);
    if(!record||!Array.isArray(record.data?.scopes))fail(unit,'missing linked keyword scopes');
    const ids=new Set();
    for(const scope of record.data.scopes){
     if(typeof scope.id!=='string'||ids.has(scope.id))fail(unit,'duplicate or invalid keyword scope identity');
     ids.add(scope.id);strings(scope.keywords,unit,'scope keywords');
    }
    return record.data.scopes;
   };
   const factionKeywords=value=>{
    const unit=unitFor(value);
    if(unit.data.factionKeywords!==undefined)return strings(unit.data.factionKeywords,unit,'factionKeywords');
    if(format==='linked-scopes')return scopes(unit).filter(scope=>scope.label==='FACTION KEYWORDS').flatMap(scope=>scope.keywords);
    if(format==='composition-memberships')return records(unit).filter(record=>record.kind==='FACTION_KEYWORD').map(record=>record.data.keyword);
    fail(unit,'missing factionKeywords');
   };
   const unitKeywords=value=>{
    const unit=unitFor(value);
    // A source's declared UNIT bag and the union of all possible MODELs are
    // different interfaces. Preserve the declared bag, including source tokens.
    if(unit.data.keywords!==undefined)return strings(unit.data.keywords,unit,'keywords');
    if(format==='linked-scopes')return scopes(unit).filter(scope=>scope.label!=='FACTION KEYWORDS').flatMap(scope=>scope.keywords);
    if(format==='composition-memberships')return records(unit).filter(record=>record.kind==='KEYWORD_MEMBERSHIP'&&record.data.unitContribution).map(record=>record.data.keyword);
    fail(unit,'missing keywords');
   };
   const modelIds=value=>{
    const unit=unitFor(value);
    if(format==='composition-memberships'&&!unit.data.profileIds?.length)return (unit.data.modelGroups||[]).flatMap(group=>group.compositionMemberIds);
    return [...(unit.data.profileIds||[])];
   };
   const modelKeywords=(value,modelId,{bindings=book.rosterProfileBindings}={})=>{
    const unit=unitFor(value),profile=index.get(modelId);
    if(!profile||!(modelIds(unit).includes(modelId)||unit.data.modelProfileIds?.includes(modelId)))fail(unit,'unresolved MODEL/profile '+modelId);
    if(bindings){
     const bound=bindings.filter(row=>row.unitId===unit.id&&row.profileId===modelId);
     if(bound.length!==1)fail(unit,'MODEL binding must resolve exactly once: '+modelId);
     return strings(bound[0].intrinsicKeywords,unit,'intrinsicKeywords');
    }
    if(format==='linked-scopes'){
     const ids=profileKeywordScopeIds(profile),groups=scopes(unit);
     if(!Array.isArray(ids)||ids.some(id=>!groups.some(group=>group.id===id)))fail(unit,'unresolved MODEL keyword scope: '+modelId);
     return unique(ids.flatMap(id=>groups.find(group=>group.id===id).keywords));
    }
    if(format==='composition-memberships'){
     const nativeId=profile.sourceEntityId||profile.id;
     const members=book.entities.filter(entity=>(entity.kind==='COMPOSITION_MEMBER'||entity.kind==='PROFILE'&&entity.data.composition)&&entity.ownerId===unit.id);
     const member=members.find(entity=>entity.id===modelId||entity.sourceEntityId===nativeId);
     if(!member){
      const sameProfile=members.filter(entity=>entity.data.composition?.modelProfileSourceId===(profile.sourceEntityId||modelId));
      const sets=sameProfile.map(entity=>modelKeywords(unit,entity.id,{bindings:null}));
      if(!sets.length||sets.some(set=>JSON.stringify([...set].sort())!==JSON.stringify([...sets[0]].sort())))fail(unit,'ambiguous MODEL statline; use composition identity: '+modelId);
      return sets[0];
     }
     const memberId=member.sourceEntityId||member.id;
     return unique(records(unit).filter(record=>record.kind==='FACTION_KEYWORD'||record.data.compositionMemberSourceIds?.includes(memberId)).map(record=>record.data.keyword));
    }
    if(format==='profile-declarations'){
     if(unit.data.keywordScope!=='ALL_SOURCE_MODELS'||!Array.isArray(unit.data.modelKeywordDeclarations))fail(unit,'invalid MODEL declaration layout');
     const declarations=unit.data.modelKeywordDeclarations;
     for(const row of declarations)if(!modelIds(unit).includes(row.sourceProfileId))fail(unit,'unresolved MODEL keyword declaration');
     return unique([...unitKeywords(unit),...factionKeywords(unit),...declarations.filter(row=>row.sourceProfileId===modelId).flatMap(row=>strings(row.keywords,unit,'modelKeywordDeclarations'))]);
    }
    if(format==='profile-groups'){
     const groups=keywordGroups(unit.data);
     if(!Array.isArray(groups))fail(unit,'missing MODEL keyword groups');
     for(const group of groups){
      strings(group.keywords,unit,'keywordGroups');
      if(scopeName(group.scope)!=='ALL MODELS'&&modelIds(unit).filter(id=>scopeName(index.get(id)?.data.name)===scopeName(group.scope)).length!==1)fail(unit,'MODEL keyword group must resolve exactly once');
     }
     return unique([...groups.filter(group=>scopeName(group.scope)==='ALL MODELS'||scopeName(group.scope)===scopeName(profile.data.name)).flatMap(group=>group.keywords),...factionKeywords(unit)]);
    }
    return [...unitKeywords(unit),...factionKeywords(unit)];
   };
   return Object.freeze({format,unitKeywords,factionKeywords,modelIds,modelKeywords,
    allUnitKeywords:value=>[...unitKeywords(value),...factionKeywords(value)],
    hasModelKeyword:(unit,keyword)=>modelIds(unit).some(id=>modelKeywords(unit,id).includes(keyword)),
    allModelKeywords:unit=>unique(modelIds(unit).flatMap(id=>modelKeywords(unit,id)))});
  }

  const api={normalizeKeyword,textFromDomLike,parseDatasetJson,profileFromRecord,recordFromDataset,profileFromDataset,serializeRuleProfile,staticCompatible,filterStaticCompatible};
  Object.defineProperty(api,'keywordAccess',{value:Object.freeze({KEYWORD_FORMATS,registerKeywordPassports,createKeywordAccess,keywordField,requiredKeywordField,keywordValues,hasKeyword,keywordGroups,keywordScopeGroups,keywordScopesForUnit,profileKeywordScopeIds})});
  Object.freeze(api);
  root.WHRuleFacts=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
}(typeof window==='undefined'?globalThis:window));
