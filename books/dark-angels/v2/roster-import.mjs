/** Native New Recruit boundary over the established shared parser, physical
 * import service, attachment graph and runtime commit. No army legality rules. */
import {createRosterImportService} from '../../shared/roster-v2/import-service.mjs';
import {normalizeImportLabel,importModelLabelCandidates} from '../../shared/roster-v2/import.mjs';
import {formRoster,predicateContext,validateRoster,selections} from '../../shared/roster-v2/context.mjs';
import {enhancementOwnerContext} from '../../shared/roster-v2/compatibility-context.mjs';
import {commitRosterImport} from '../../shared/roster-v2/runtime.mjs';
import {createDarkAngelsRosterRuntime} from './roster-runtime.mjs';
import {createDarkAngelsRuleSchema} from './rule-contract-schema.mjs';
import {projectDarkAngelsPaidOptions} from './roster-paid-options.mjs';
import {sameSourceEvidence,copySourceEvidence,mergeSourceEvidence} from '../../shared/source-refs-v2/source-refs.mjs';

const clone=structuredClone,same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const requireValue=(value,message)=>{if(!value)throw new TypeError(message);};
const ordered=value=>Array.isArray(value)?value.map(ordered):value&&typeof value==='object'
  ?Object.fromEntries(Object.keys(value).sort().map(key=>[key,ordered(value[key])])):value;
const physicalInput=state=>{
  const result=clone(state);delete result.attachments;
  for(const unit of result.units)delete unit.enhancementAssignments;
  return JSON.stringify(ordered(result));
};
const sourcePredicate=(binding,index)=>{
  if(binding.assignmentReference)return binding.assignmentReference.selector;
  requireValue(binding.sourceCorrection&&binding.scope==='UNIT','Unreviewed assignment scope');
  const proof={field:['eligibilityText'],quote:binding.eligibilityText};
  const nodes=binding.eligibility.keywords.map(keyword=>({predicate:'UNIT_KEYWORD',subject:'UNIT',
    arguments:{keyword},contextLevel:'STATIC',evidence:proof}));
  requireValue(index.get(binding.id)&&nodes.length,'Missing source UNIT selector');
  return nodes.length===1?nodes[0]:{op:'ALL',args:nodes};
};

export function createDarkAngelsRosterImport(book){
  const metadata=book.importBindings,index=new Map(book.entities.map(entity=>[entity.id,entity]));
  requireValue(book.bookId==='dark-angels'&&metadata?.schema==='dark-angels-v2/import-bindings/v1','Invalid native DA import domain');
  const shared=()=>createRosterImportService(book,metadata),schema=createDarkAngelsRuleSchema();
  shared();let saved=null;
  function bind(input,{draft,bindings={}}={}){
    let state=clone(input);const needs=[],errors=[];
    const error=(code,key,message)=>errors.push({code,key,message});
    const checked=(object,key,value)=>{
      if(Object.hasOwn(object,key)&&!same(object[key],value))error('CONFLICTING_SOURCE_BINDING',key,'Stored source/physical binding changed');
      else object[key]=clone(value);
    };
    const checkedSource=(object,key,source)=>{
      if((Object.hasOwn(object,key)||object.sourceBindings?.[key])&&!sameSourceEvidence(object,source,{book,slot:key,otherSlot:'provenance'}))
        error('CONFLICTING_SOURCE_BINDING',key,'Stored source/physical binding changed');
      else {
        const prior=Object.keys(object.sourceBindings||{}).filter(slot=>!slot.startsWith('$')).map(slot=>copySourceEvidence(object,{book,slot}));
        delete object[key];Object.assign(object,mergeSourceEvidence(...prior,copySourceEvidence(source,{book,targetSlot:key})));
      }
    };
    try{
      const graph=state.attachments;state=validateRoster(book,{...state,attachments:[]},[]);state.attachments=graph;
      if(draft){
        state.importEvidence=clone(draft.metadata);
        const faction=normalizeImportLabel(draft.metadata.faction);
        const declaredFaction=(metadata.factionIdentityLabels||[]).some(label=>normalizeImportLabel(label)===faction);
        if(faction&&faction!=='dark angels'&&faction!=='space marines'&&faction!=='adeptus astartes'&&!declaredFaction)error('FOREIGN_FACTION_EXPORT','faction','Export identifies a different Army Book');
      }
      if(bindings.modelBearers!==undefined&&(!bindings.modelBearers||typeof bindings.modelBearers!=='object'||Array.isArray(bindings.modelBearers)))
        error('INVALID_MODEL_BINDINGS','modelBearers','Expected physical UNIT/Enhancement/MODEL dictionary');
      for(const id of Object.keys(bindings.modelBearers||{}))if(!state.units.some(unit=>unit.instanceId===id))error('FOREIGN_MODEL_BINDING',id,'Unknown physical UNIT');
      for(const unit of state.units){
        const selectionKeys=new Set();
        const raw=draft?.units.find(row=>row.id===unit.instanceId),members=metadata.compositions.filter(row=>row.ownerId===unit.canonicalUnitId);
        for(const row of unit.modelRows){
          const lexical=raw?.modelRows.find(item=>item.key===row.rowId);
          const candidates=draft&&raw.modelRows.length?importModelLabelCandidates(members,lexical?.name,member=>member.labels):
            members.filter(member=>row.compositionMemberId?member.id===row.compositionMemberId:member.profileId===row.canonicalProfileId);
          if(candidates.length!==1){
            needs.push({kind:'COMPOSITION_MEMBER',key:row.rowId,rawLabel:lexical?.name||raw?.name||row.presentationLabel,
              ownerId:unit.canonicalUnitId,candidateIds:candidates.map(member=>member.id),reason:'SOURCE_MODEL_MAPPING_NOT_PROVEN'});continue;
          }
          const member=candidates[0];
          if(member.profileId!==row.canonicalProfileId)error('WRONG_MODEL_PROFILE',row.rowId,'Physical profile differs from the reviewed composition binding');
          checked(row,'compositionMemberId',member.id);
          checked(row,'sourceRuleReferenceIds',metadata.nativeReferenceBindings.filter(ref=>ref.ownerId===unit.canonicalUnitId).map(ref=>ref.id));
        }
        for(const container of [{rows:unit.selections,count:null},...unit.modelRows.flatMap(row=>[
          {rows:row.selections,count:row.quantity},...(row.loadouts||[]).map(loadout=>({rows:loadout.selections,count:loadout.quantity}))])]){
          for(const selection of container.rows){
            if(!selection.selectionKey||selectionKeys.has(selection.selectionKey))error('DUPLICATE_PHYSICAL_SELECTION',selection.selectionKey,'Physical equipment occurrence must be unique within its UNIT');
            selectionKeys.add(selection.selectionKey);
            const proof=selection.quantityEvidence;
            if(proof){
              const expected=container.count===null?(proof.explicitBinding?selection.physicalQuantity:proof.selectedQuantity):container.count*proof.selectedQuantity;
              if(!Number.isSafeInteger(proof.selectedQuantity)||proof.selectedQuantity<0||selection.physicalQuantity!==expected||
                (container.count!==null&&(proof.modelQuantity!==container.count||selection.perModelQuantity!==proof.selectedQuantity)))
                error('INPUT_QUANTITY_MISMATCH',selection.selectionKey,'Physical quantity contradicts imported evidence');
            }else error('MISSING_QUANTITY_EVIDENCE',selection.selectionKey,'Selected physical inventory requires quantity evidence');
            if(selection.canonicalEquipmentIds.length){
              const matched=metadata.equipmentSelections.filter(binding=>binding.ownerId===unit.canonicalUnitId&&
                same(binding.canonicalEquipmentIds,selection.canonicalEquipmentIds)&&same(binding.canonicalFieldPaths,selection.canonicalFieldPaths));
              if(matched.length===1){
                const source=matched[0],id=source.canonicalEquipmentIds[0];
                if(!same(selection.sourceReferences||[],source.sourceReferences||[]))error('WRONG_EQUIPMENT_REFERENCE',selection.selectionKey,'Source equipment caption differs');
                checked(selection,'sourceEquipmentIdentity',id);checkedSource(selection,'sourceEquipmentProvenance',index.get(id));
              }else if(selection.canonicalEquipmentIds.some(id=>index.get(id)?.kind!=='WARGEAR_OPTION'))
                error('UNREVIEWED_EQUIPMENT_BINDING',selection.selectionKey,'Unknown source equipment occurrence');
            }
          }
        }
        const parts=book.mfmImportReferences.partitions;
        checked(unit,'equipmentContextKnown',selections(unit).some(selection=>selection.canonicalProfileIds.length||selection.canonicalEquipmentIds.length));
        checked(unit,'mfmUnitRecordId',parts.unitBindings.find(row=>row.entityId===unit.canonicalUnitId)?.mfmRecordId);
        checked(unit,'mfmEnhancementRecordIds',unit.enhancementIds.map(id=>parts.enhancementBindings.find(row=>row.entityId===id)?.mfmRecordId));
        unit.enhancementAssignments??=[];
        const eligibilityState=clone(state);
        for(const member of eligibilityState.units){member.enhancementIds=[];member.enhancementAssignments=[];}
        const eligibilityRuntime=createDarkAngelsRosterRuntime(book);eligibilityRuntime.load(eligibilityState);
        const physical=eligibilityRuntime.projection,projected=physical.units.find(row=>row.instanceId===unit.instanceId);
        const choices=bindings.modelBearers?.[unit.instanceId]||{};
        requireValue(choices&&typeof choices==='object'&&!Array.isArray(choices),'Invalid physical MODEL choices');
        for(const [id,scope]of Object.entries(choices)){
          if(!unit.enhancementIds.includes(id)||metadata.enhancements.find(row=>row.id===id)?.scope!=='MODEL'||typeof scope!=='string')
            error('FOREIGN_ENHANCEMENT_BEARER',id,'MODEL binding is not a selected MODEL Enhancement');
          else{
            const old=unit.enhancementAssignments.find(row=>row.enhancementId===id);
            if(old&&old.modelScopeId!==scope)error('CONFLICTING_ENHANCEMENT_BEARER',id,'Stored physical bearer differs');
            else if(!old)unit.enhancementAssignments.push({enhancementId:id,modelScopeId:scope});
          }
        }
        for(const id of unit.enhancementIds){
          const binding=metadata.enhancements.find(row=>row.id===id),contract=index.get(id).ruleContract;
          requireValue(binding&&!binding.unresolved,'Unresolved source assignment scope');
          const predicate=sourcePredicate(binding,index),context=(subject,scope)=>enhancementOwnerContext(contract,predicateContext(state,physical,unit.instanceId,subject,scope));
          if(binding.scope==='UNIT'){
            if(unit.enhancementAssignments.some(row=>row.enhancementId===id))error('WRONG_UPGRADE_SCOPE',id,'UNIT assignment must not fabricate a MODEL bearer');
            if(schema.evaluatePredicate(predicate,context('UNIT'))!=='TRUE')error('WRONG_ENHANCEMENT_UNIT',id,'UNIT does not match source eligibility');
            continue;
          }
          const applicable=projected.profiles.filter(model=>schema.evaluatePredicate(predicate,context('MODEL',model.scopeId))==='TRUE');
          const eligible=applicable.filter(model=>model.quantity===1);
          let assignment=unit.enhancementAssignments.find(row=>row.enhancementId===id);
          if(!assignment&&eligible.length===1){assignment={enhancementId:id,modelScopeId:eligible[0].scopeId};unit.enhancementAssignments.push(assignment);}
          if(assignment&&!eligible.some(model=>model.scopeId===assignment.modelScopeId))error('WRONG_ENHANCEMENT_MODEL',id,'MODEL is not an exact eligible physical bearer');
          else if(!applicable.length)error('WRONG_ENHANCEMENT_MODEL',id,'No physical MODEL matches the source selector');
          else if(!assignment)needs.push({kind:'ENHANCEMENT_BEARER',key:JSON.stringify([unit.instanceId,id]),rawLabel:index.get(id).data.title,
            candidates:eligible.map(model=>({id:model.scopeId,title:index.get(model.canonicalProfileId).data.name})),reason:'EXACT_PHYSICAL_MODEL_REQUIRED'});
        }
      }
      checked(state,'mfmDetachmentRecordIds',state.detachmentIds.map(id=>book.mfmImportReferences.partitions.detachmentBindings.find(row=>row.entityId===id)?.mfmRecordId));
      if(!errors.length&&!needs.length)createDarkAngelsRosterRuntime(book).load(state);
    }catch(caught){error('INVALID_PHYSICAL_STATE','roster',caught.message);}
    return {state,needs,errors};
  }
  return {get state(){return saved?clone(saved):null;},draft:text=>shared().draft(text),
    resolve:bind,
    import(text,bindings={}){
      const unknown=Object.keys(bindings).filter(key=>!['units','profiles','detachments','detachmentId','selections','enhancements','modelBearers'].includes(key));
      if(unknown.length)return {status:'INVALID',roster:null,needsBindings:[],errors:unknown.map(key=>({code:'UNSUPPORTED_BINDING',key,message:'Unsupported physical binding'}))};
      let result;try{result=shared().import(text,bindings);}catch(caught){return {status:'INVALID',roster:null,needsBindings:[],errors:[{code:'INVALID_IMPORT_INPUT',message:caught.message}]};}
      if(result.status!=='READY')return {...result,legality:'NOT_ASSESSED'};
      const bound=bind(result.roster,{draft:result.draft,bindings}),status=bound.errors.length?'INVALID':bound.needs.length?'NEEDS_BINDINGS':'READY';
      if(status==='READY')saved=bound.state;
      return {...result,status,roster:status==='READY'?clone(saved):null,...(status==='READY'?{}:{candidateRoster:bound.state}),
        needsBindings:[...result.needsBindings,...bound.needs],errors:[...result.errors,...bound.errors],legality:'NOT_ASSESSED'};
    },
    load(snapshot){const result=bind(snapshot);requireValue(!result.needs.length&&!result.errors.length,JSON.stringify(result));saved=result.state;return clone(saved);},
    snapshot(){requireValue(saved,'No imported native roster');return clone(saved);}};
}

/** Existing central schedule bounds and physical canonical IDs decide costs.
 * Exported point totals are evidence only, never an authority for the result. */
export function projectDarkAngelsRosterPoints(book,state){
  const central=book.mfmImportReferences,paid=projectDarkAngelsPaidOptions(state,{bindings:book.mfmPhysicalPaidOptions});
  const copyCounts=new Map(),units=[],unresolved=[...paid.unresolved];let knownPoints=0;
  for(const unit of state.units){
    const source=central.nativePoints.units.find(row=>row.id===unit.canonicalUnitId),copy=(copyCounts.get(unit.canonicalUnitId)||0)+1;
    copyCounts.set(unit.canonicalUnitId,copy);
    const tiers=source.points.filter(row=>unit.startingStrength>=row.minModels&&unit.startingStrength<=row.maxModels&&
      (row.minCopies===undefined||copy>=row.minCopies)&&(row.maxCopies===undefined||copy<=row.maxCopies));
    if(tiers.length!==1)unresolved.push({unitInstanceId:unit.instanceId,reason:'MFM_COMPOSITION_TIER_NOT_PROVEN'});
    const enhancements=unit.enhancementIds.map(id=>central.nativePoints.enhancements.find(row=>row.id===id));
    if(enhancements.some(row=>!row))unresolved.push({unitInstanceId:unit.instanceId,reason:'MFM_ENHANCEMENT_COST_NOT_PROVEN'});
    const paidUnit=paid.units.find(row=>row.unitInstanceId===unit.instanceId),base=tiers.length===1?tiers[0].value:null;
    const enhancementPoints=enhancements.filter(Boolean).reduce((sum,row)=>sum+row.value,0),subtotal=(base||0)+enhancementPoints+paidUnit.knownPaidPoints;
    knownPoints+=subtotal;
    units.push({unitInstanceId:unit.instanceId,canonicalUnitId:unit.canonicalUnitId,basePoints:base,
      enhancementPoints,paid:paidUnit,totalPoints:base===null||paidUnit.status!=='RESOLVED'||enhancements.some(row=>!row)?null:subtotal,
      unitPointRecordId:source.mfmRecordId,enhancementCostRecordIds:enhancements.filter(Boolean).map(row=>row.mfmRecordId)});
  }
  return {owner:'CENTRALIZED_MFM',source:central.source,status:unresolved.length?'UNRESOLVED':'RESOLVED',
    totalPoints:unresolved.length?null:knownPoints,knownPoints,units,unresolved,
    detachmentPoints:state.detachments.map(row=>({instanceId:row.instanceId,canonicalDetachmentId:row.canonicalDetachmentId,
      value:central.nativePoints.detachments.find(item=>item.id===row.canonicalDetachmentId)?.detachmentPoints??null}))};
}

export function createDarkAngelsRosterService(book){
  let runtime=createDarkAngelsRosterRuntime(book);const imports=createDarkAngelsRosterImport(book);
  const service={get catalog(){return runtime.catalog;},get state(){return runtime.state;},get projection(){return runtime.projection;},
    get groups(){return runtime.projection?.formedUnits||[];},get points(){return runtime.state?projectDarkAngelsRosterPoints(book,runtime.state):null;},
    get chapterContexts(){return runtime.state?runtime.state.units.map(unit=>runtime.chapterContext(unit.instanceId)):[];},
    draft:imports.draft,
    import(text,choices={},options){
      try{
        const bindings=clone(choices);bindings.modelBearers??={};
        for(const [key,value]of Object.entries(bindings.enhancementBearers||{})){const [unit,id]=JSON.parse(key);(bindings.modelBearers[unit]??={})[id]=value;}
        delete bindings.enhancementBearers;
        let result=createDarkAngelsRosterImport(book).import(text,bindings);
        if(result.status==='NEEDS_BINDINGS'&&result.candidateRoster&&runtime.state&&
          result.needsBindings.every(need=>need.kind==='ENHANCEMENT_BEARER')&&physicalInput(result.candidateRoster)===physicalInput(runtime.state)){
          for(const unit of runtime.state.units)if(unit.enhancementAssignments?.length)bindings.modelBearers[unit.instanceId]=Object.fromEntries(unit.enhancementAssignments.map(row=>[row.enhancementId,row.modelScopeId]));
          result=createDarkAngelsRosterImport(book).import(text,bindings);
        }
        const committed=commitRosterImport(result,runtime.state,service.load,options);
        return {...committed,...(committed.status==='READY'?{points:service.points,chapterContexts:service.chapterContexts}:{})};
      }catch(caught){return {status:'INVALID',roster:null,needsBindings:[],errors:[{code:'INVALID_IMPORT_COMMIT',key:'roster',message:caught.message}],legality:'NOT_ASSESSED'};}
    },
    load(snapshot){const verified=createDarkAngelsRosterImport(book).load(snapshot),next=createDarkAngelsRosterRuntime(book);next.load(verified);
      projectDarkAngelsRosterPoints(book,verified);runtime=next;return service.state;},
    snapshot:()=>runtime.snapshot(),effective:id=>runtime.effective(id),context:(...args)=>runtime.context(...args),
    related:(...args)=>runtime.related(...args),candidates:id=>runtime.candidates(id),chapterContext:id=>runtime.chapterContext(id),
    attach:(...args)=>runtime.attach(...args),detach:id=>runtime.detach(id),reattach:(...args)=>runtime.reattach(...args),
    recompute:()=>service.load(runtime.snapshot())};
  return service;
}
