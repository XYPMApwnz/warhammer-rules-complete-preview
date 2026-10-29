/** Shared physical input computers. Source owners supply verified identities,
 * declarations and mode differences; this module never reads rule prose. */
import {formRoster,selections,predicateContext,validateRoster} from './context.mjs';
import {enhancementOwnerContext} from './compatibility-context.mjs';
import {setConditionValue,findConditionValue,clearConditionValues,translateFieldArguments} from '../rule-contract-v2/conditions.mjs';

const requireValue=(ok,message)=>{if(!ok)throw new TypeError(message);};
const put=(bag,key,value,parameters={})=>setConditionValue(bag,{key,...parameters},value);
const argsFor=(book,node)=>node?.predicate==='FIELD'?translateFieldArguments(node.arguments,{book,node}):null;

/** Positive inventory and a uniform physical group are distinct reviewed
 * ownership proofs. Neither may assign aggregate UNIT equipment to a MODEL. */
export function createPhysicalEquipmentConditionContext(book,state,{equipmentMode='POSITIVE_SELECTION',clearUnrequestedEquipment=true}={}){
 const physical=formRoster(book,state),sources=new Set((book.rosterPermanentDoctrineSources||[]).map(row=>row.unitId)),permanent=new Set();
 for(const unit of physical.units)if(sources.has(unit.canonicalUnitId)){
  const group=physical.formedUnits.find(row=>row.formedUnitId===unit.formedUnitId);
  for(const id of group?.memberInstanceIds||[unit.instanceId])permanent.add(id);
 }
 requireValue(['POSITIVE_SELECTION','UNIFORM_PHYSICAL_GROUP'].includes(equipmentMode),'Unresolved physical equipment proof mode');
 return (context,predicate)=>{
  if(!context)return context;
  const roster={...context.roster};
  put(roster,'physicalUnitInstanceId',context.instanceId||'');
  put(roster,'physicalModelScopeId',context.subject==='MODEL'?context.modelScopeId||'':'');
  put(roster,'permanentDoctrineSourcePresent',permanent.has(context.instanceId));
  const args=argsFor({...book,conditionBindingOptions:{...book.conditionBindingOptions,equipmentBearerMode:equipmentMode}},predicate);
  if(args?.key!=='equipmentBearerSatisfied'){
   if(clearUnrequestedEquipment){
    // A context supplied without a source predicate has no equipment identity.
    // Remove stale keyed values instead of borrowing a previous rule's proof.
    clearConditionValues(roster,'equipmentBearerSatisfied');delete roster.smEquipmentBearerSatisfied;
   }
   return {...context,roster};
  }
  const id=args.equipmentId??predicate.evidence?.otherEntityId,unit=state.units.find(row=>row.instanceId===context.instanceId);let selected=false;
  if(unit&&context.modelScopeId)for(const row of unit.modelRows){
   const allocated=(row.loadouts||[]).reduce((n,loadout)=>n+loadout.quantity,0);
   const groups=[{key:row.rowId,kind:'PROFILE',quantity:row.quantity-allocated,selections:row.selections||[]},
    ...(row.loadouts||[]).map(loadout=>({key:loadout.loadoutId,kind:'LOADOUT',quantity:loadout.quantity,
     selections:equipmentMode==='UNIFORM_PHYSICAL_GROUP'?loadout.selections||[]:[...(row.selections||[]),...(loadout.selections||[])]}))];
   for(const group of groups)if(`${unit.instanceId}/${row.rowId}/${group.kind}/${group.key}`===context.modelScopeId){
    const proof=(selection,count)=>selection.canonicalEquipmentIds?.includes(id)&&selection.canonicalFieldPaths?.[id]?.includes('/text')&&
     (equipmentMode==='POSITIVE_SELECTION'?selection.physicalQuantity>0:count>0&&selection.physicalQuantity===count&&(selection.perModelQuantity===undefined||selection.perModelQuantity===1));
    selected=equipmentMode==='UNIFORM_PHYSICAL_GROUP'?(row.selections||[]).some(selection=>proof(selection,row.quantity))||
     (group.kind==='LOADOUT'?group.selections:[]).some(selection=>proof(selection,group.quantity)):group.selections.some(selection=>proof(selection,group.quantity));
   }
  }
  setConditionValue(roster,{...args,equipmentId:id,quantityProof:equipmentMode},selected);
  return {...context,roster};
 };
}

/** Read source-owned physical presence and previously verified chapter facts.
 * This does not resolve faction/chapter facts or confer a chapter on a model. */
export function createVerifiedPhysicalConditionContext({state,presenceBindings={},chapterFacts=[],
 chapterProvenStatus='CHAPTER_CONTEXT_PROVEN',armyProvenStatus,unknownChapterStatus='CHAPTER_CONTEXT_NOT_PROVEN'}={}){
 return context=>{
  if(!context)return context;
  const roster={...context.roster};
  for(const proof of Object.values(presenceBindings))put(roster,'physicalProfilePresent',undefined,{unitId:proof.unitId,profileId:proof.profileId});
  for(const key of ['physicalChapter','chapterContextStatus','reviewedArmyMembershipProven'])put(roster,key,undefined);
  if(state){
   const unit=state.units.find(row=>row.instanceId===context.instanceId);
   for(const proof of Object.values(presenceBindings))put(roster,'physicalProfilePresent',Boolean(unit&&unit.canonicalUnitId===proof.unitId&&
    unit.modelRows.some(row=>row.canonicalProfileId===proof.profileId&&Number.isSafeInteger(row.quantity)&&row.quantity>0)),{unitId:proof.unitId,profileId:proof.profileId});
   if(context.subject==='UNIT'){
    const fact=chapterFacts.find(row=>row.instanceId===unit?.instanceId&&row.canonicalUnitId===context.owner?.unitId);
    put(roster,'chapterContextStatus',fact?.status||unknownChapterStatus);
    put(roster,'reviewedArmyMembershipProven',fact?.armyApplicability.status===armyProvenStatus);
    if(fact?.status===chapterProvenStatus)put(roster,'physicalChapter',fact.chapter);
   }
  }
  return {...context,roster};
 };
}

/** A validated source-equipment selection is scoped to its physical UNIT. */
export function createSourceEquipmentConditionContext(state,{sourceEquipmentIdentity,physicalIdentity=true}={}){
 const selected=new Set(state.units.filter(unit=>selections(unit).some(selection=>selection.sourceEquipmentIdentity===sourceEquipmentIdentity&&selection.physicalQuantity>0)).map(unit=>unit.instanceId));
 return context=>{
  if(!context)return context;
  const roster={...context.roster};
  if(physicalIdentity){put(roster,'physicalUnitInstanceId',context.instanceId||'');put(roster,'physicalModelScopeId',context.subject==='MODEL'?context.modelScopeId||'':'');}
  put(roster,'sourceEquipmentSelected',selected.has(context.instanceId),{sourceEquipmentIdentity});
  return {...context,roster};
 };
}

/** Absence is an explicitly unselected scalar only for already validated source
 * choices whose existing contract specifies that default. */
export function createSelectedSourceChoiceConditionContext(state,{selectionField,ruleId}){
 const selected=new Map(state.units.map(unit=>[unit.instanceId,unit[selectionField]?.[0]||'']));
 return context=>{
  if(!context)return context;
  const roster={...context.roster};put(roster,'selectedSourceChoice',selected.get(context.instanceId)||'',{ruleId});
  return {...context,roster};
 };
}

export function withDefaultConditionValue(context,args,value){
 if(!context)return context;
 const roster={...context.roster};
 if(!findConditionValue(roster,args).present)setConditionValue(roster,args,value);
 return {...context,roster};
}

/** Validate a source-owned weapon decision without selecting a weapon or
 * transferring a mixed physical component's choice to a neighbouring model. */
export function createEquippedWeaponChoiceConditionContext(book,state,schema,{ruleId,conditionArguments,messages}){
 const assert=(ok,key)=>requireValue(ok,messages[key]);
 const options=new Map((book.rosterSelectionOptions||[]).map(option=>[option.id,option])),chosen=new Map();
 if(!options.size)return context=>context;
 const projection=formRoster(book,state),rule=book.entities.find(entity=>entity.id===ruleId),records=new Map(book.entities.map(entity=>[entity.id,entity]));
 for(const unit of state.units){
  if(unit.selectedUpgradeIds!==undefined)assert(Array.isArray(unit.selectedUpgradeIds),'list');
  const ids=(unit.selectedUpgradeIds||[]).filter(id=>{assert(records.get(id)?.kind==='UPGRADE_OPTION','unknown');return options.has(id);});
  const choiceRecords=selections(unit).filter(selection=>(selection.canonicalOptionIds||[]).some(id=>options.has(id)));
  const selected=choiceRecords.flatMap(selection=>selection.canonicalOptionIds||[]).filter(id=>options.has(id));
  assert(JSON.stringify([...new Set(selected)].sort())===JSON.stringify([...ids].sort()),'agreement');
  assert(ids.length<=1,'one');assert(selected.length<=1,'duplicate');if(!ids.length)continue;
  assert(choiceRecords[0].physicalQuantity===1&&choiceRecords[0].canonicalProfileIds.length===0&&choiceRecords[0].canonicalEquipmentIds.length===0,'equipment');
  const option=options.get(ids[0]);assert(option.data.unitId===unit.canonicalUnitId,'owner');
  if(!unit.enhancementIds.includes(ruleId))continue;
  const physical=projection.units.find(row=>row.instanceId===unit.instanceId),assignment=unit.enhancementAssignments?.find(row=>row.enhancementId===ruleId);
  const eligible=physical.profiles.filter(model=>!assignment||model.scopeId===assignment.modelScopeId).filter(model=>schema.evaluatePredicate(rule.ruleContract.assignment.selector,
   enhancementOwnerContext(rule.ruleContract,predicateContext(state,projection,unit.instanceId,'MODEL',model.scopeId)))==='TRUE');
  assert(eligible.length===1&&eligible[0].quantity===1,'bearer');
  const model=eligible[0],weaponId=option.data.weaponProfileId,localChoices=model.selections.flatMap(selection=>selection.canonicalOptionIds||[]);
  assert(localChoices.includes(option.id)||unit.startingStrength===1,'physical');
  const weapons=[...model.weapons,...(unit.startingStrength===1?physical.weapons:[])];
  const matching=weapons.filter(weapon=>weapon.canonicalProfileId===weaponId&&weapon.physicalQuantity>0&&weapon.data.mode==='melee');
  assert(matching.length===1&&matching[0].physicalQuantity===1,'weapon');chosen.set(unit.instanceId,option.id);
 }
 return context=>{
  if(context?.subject!=='MODEL')return context;
  const roster={...context.roster};setConditionValue(roster,conditionArguments,chosen.get(context.instanceId));return {...context,roster};
 };
}

/** A historical formation must have its original named timing and valid
 * canonical attachment evidence. Current attachment never invents history. */
export function createInitialAttachmentConditionContext(book,state,{binding,conditionArguments,bindContext=context=>context,messages}){
 const assert=(ok,key)=>requireValue(ok,messages[key]);
 const records=new Map(book.entities.map(entity=>[entity.id,entity]));let initial;
 if(state.initialAttachmentStep!==undefined){
  assert(state.initialAttachmentStep===binding?.step,'step');assert(Array.isArray(state.initialAttachments),'missing');
  initial=validateRoster(book,{...state,attachments:structuredClone(state.initialAttachments)},book.rosterAttachmentPolicies).attachments;
 }else if(state.initialAttachments!==undefined)assert(Array.isArray(state.initialAttachments),'malformed');
 return input=>{
  const context=bindContext(input);
  if(!binding||context?.subject!=='MODEL'||context.modelId!==binding.profileId)return context;
  const roster={...context.roster};setConditionValue(roster,conditionArguments,undefined);
  if(initial!==undefined){
   const unit=state.units.find(row=>row.instanceId===context.instanceId),edge=initial.find(row=>row.leaderInstanceId===unit?.instanceId);
   const bodyguard=state.units.find(row=>row.instanceId===edge?.bodyguardInstanceId),data=records.get(bodyguard?.canonicalUnitId)?.data;
   setConditionValue(roster,conditionArguments,unit?.canonicalUnitId===binding.sourceId&&Boolean(data&&binding.bodyguardKeywords.every(keyword=>[...data.keywords,...data.factionKeywords].includes(keyword))));
  }
  return {...context,roster};
 };
}
