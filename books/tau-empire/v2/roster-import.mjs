import {createRosterImportService} from '../../shared/roster-v2/import-service.mjs';
import {normalizeImportLabel} from '../../shared/roster-v2/import.mjs';
import {validateRoster,formRoster,selections,changeAttachment} from '../../shared/roster-v2/context.mjs';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {createTauRuleSchema} from './rule-contract-schema.mjs';
import {validateTauSourceChoices,validateTauAttachmentSourceConditions,setTauStudentChoice,
  tauSourceChoiceContext,preserveTauSourceChoices,bindTauStudentPairs,bindTauShieldModels} from './roster-source-choices.mjs';
import {validateTauPrototypeChoices,setTauPrototypeChoice,bindTauPrototypeChoices,tauWeaponSelectionResolver,tauWeaponPartitionResolver} from './roster-weapon-choices.mjs';
import {sameSourceEvidence,copySourceEvidence,mergeSourceEvidence} from '../../shared/source-refs-v2/source-refs.mjs';

const copy=structuredClone,same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const requireValue=(ok,message)=>{if(!ok)throw new TypeError(message);};

/** T’au physical bindings around the existing parser/resolver. No legality
 * caps, weapon replacements, default loadouts or guessed MODEL bearers. */
export function createTauRosterImport(input){
  const book=copy(input),metadata=book.importBindings,index=new Map(book.entities.map(e=>[e.id,e]));
  requireValue(book.bookId==='tau-empire'&&metadata?.schema==='tau-empire-v2/import-bindings/v1','Invalid T’au import domain');
  for(const binding of metadata.compositions){
    const source=index.get(binding.id);
    requireValue(source?.parentId===binding.ownerId&&source.data.modelProfileId===binding.profileId&&
      same(source.data.quantity,binding.quantity),'Foreign source composition binding');
  }
  for(const binding of metadata.enhancements){
    const source=index.get(binding.id);
    requireValue(source?.kind==='ENHANCEMENT'&&source.parentId===binding.detachmentId&&
      source.data.scope===binding.scope&&source.data.eligibilityText===binding.eligibilityText,'Foreign Enhancement source');
  }
  const shared=()=>createRosterImportService(book,metadata);
  // Construct once up front: malformed source mappings are rejected before any
  // input can reach READY. Later attempts use isolated shared import state.
  shared();let saved=null;
  function bind(snapshot,{draft,bindings={}}={}){
    const state=copy(snapshot),needs=[],errors=[];
    const error=(code,key,message)=>errors.push({code,key,message});
    const checked=(object,key,value)=>{
      if(Object.hasOwn(object,key)&&!same(object[key],value))error('CONFLICTING_SOURCE_BINDING',key,'Stored physical/source binding changed');
      else object[key]=copy(value);
    };
    const checkedSource=(object,key,source)=>{
      if((Object.hasOwn(object,key)||object.sourceBindings?.[key])&&!sameSourceEvidence(object,source,{book,slot:key,otherSlot:'provenance'}))
        error('CONFLICTING_SOURCE_BINDING',key,'Stored physical/source binding changed');
      else {
        const prior=Object.keys(object.sourceBindings||{}).filter(slot=>!slot.startsWith('$')).map(slot=>copySourceEvidence(object,{book,slot}));
        delete object[key];Object.assign(object,mergeSourceEvidence(...prior,copySourceEvidence(source,{book,targetSlot:key})));
      }
    };
    if(draft){
      state.importEvidence=copy(draft.metadata);
      if(draft.metadata.faction&&draft.metadata.faction!=='—'&&normalizeImportLabel(draft.metadata.faction)!==normalizeImportLabel('T’au Empire'))
        error('FOREIGN_FACTION_EXPORT','faction','Export names a different faction');
    }
    if(bindings.modelBearers!==undefined&&(!bindings.modelBearers||Array.isArray(bindings.modelBearers)||typeof bindings.modelBearers!=='object'))
      error('INVALID_MODEL_BINDING','modelBearers','Expected physical UNIT/Enhancement/MODEL dictionary');
    for(const id of Object.keys(bindings.modelBearers||{}))if(!state.units.some(unit=>unit.instanceId===id))
      error('FOREIGN_MODEL_BINDING',id,'Bearer does not identify an imported physical UNIT');
    for(const unit of state.units){
      const members=metadata.compositions.filter(row=>row.ownerId===unit.canonicalUnitId),raw=draft?.units.find(row=>row.id===unit.instanceId);
      for(const container of [{selections:unit.selections,count:null},...unit.modelRows.flatMap(row=>[
        {selections:row.selections,count:row.quantity},...(row.loadouts||[]).map(loadout=>({selections:loadout.selections,count:loadout.quantity}))])])
        for(const selection of container.selections){
          if(!selection.canonicalProfileIds.length&&!selection.canonicalEquipmentIds.length)continue;
          const proof=selection.quantityEvidence,expected=container.count===null?proof?.selectedQuantity:container.count*proof?.selectedQuantity;
          if(!proof||!Number.isSafeInteger(proof.selectedQuantity)||proof.selectedQuantity<0||
            selection.physicalQuantity!==expected||
            (container.count!==null&&(proof.modelQuantity!==container.count||selection.perModelQuantity!==proof.selectedQuantity))||
            (container.count===null&&selection.perModelQuantity!==null))
            error('INPUT_QUANTITY_EVIDENCE_MISMATCH',selection.selectionKey,'Physical quantity differs from original selected item count');
        }
      for(const row of unit.modelRows){
        const rawRow=raw?.modelRows.find(item=>item.key===row.rowId);
        const matches=draft?(raw.modelRows.length?members.filter(member=>member.labels.some(label=>
          normalizeImportLabel(label)===normalizeImportLabel(rawRow?.name))):members.filter(member=>member.profileId===row.canonicalProfileId)):
          members.filter(member=>member.id===row.compositionMemberId);
        if(matches.length!==1){needs.push({kind:'COMPOSITION_MEMBER',key:row.rowId,candidateIds:matches.map(m=>m.id)});continue;}
        const member=matches[0];checked(row,'compositionMemberId',member.id);
        if(row.canonicalProfileId!==member.profileId)error('WRONG_MODEL_PROFILE',row.rowId,'Source composition/profile differ');
        const refs=metadata.nativeReferenceBindings.filter(ref=>ref.ownerId===unit.canonicalUnitId&&
          ref.recipient.modelProfileIds.includes(row.canonicalProfileId)&&ref.recipient.compositionMemberIds.includes(member.id)).map(ref=>ref.id);
        checked(row,'sourceRuleReferenceIds',refs);
      }
      // A selected drone is equipment inventory. Its provided weapon remains a
      // reference to the original fact, with the very same physical selection
      // and quantity; no extra weapon selection or MODEL row is fabricated.
      for(const selection of selections(unit))if(selection.canonicalEquipmentIds.length){
        const matches=metadata.equipmentSelections.filter(binding=>binding.ownerId===unit.canonicalUnitId&&
          same(binding.canonicalEquipmentIds,selection.canonicalEquipmentIds)&&
          same(binding.canonicalFieldPaths,selection.canonicalFieldPaths)&&same(binding.sourceReferences,selection.sourceReferences));
        if(matches.length!==1){error('UNKNOWN_EQUIPMENT_SOURCE',selection.selectionKey,'Equipment needs one exact canonical source caption');continue;}
        const binding=matches[0];
        const provided=binding.providedWeaponProfileIds||[];
        if(selection.canonicalProfileIds.length&&!same(selection.canonicalProfileIds,provided))
          error('WRONG_PROVIDED_WEAPON',selection.selectionKey,'Equipment does not provide this canonical weapon');
        else selection.canonicalProfileIds=copy(provided);
        checked(selection,'sourceEquipmentIdentity',binding.genericEquipmentId||binding.canonicalEquipmentIds[0]);
        checkedSource(selection,'sourceEquipmentProvenance',index.get(binding.genericEquipmentId||binding.canonicalEquipmentIds[0]));
      }
      const mfm=book.mfmImportReferences.partitions;
      checked(unit,'mfmUnitRecordId',mfm.unitBindings.find(row=>row.entityId===unit.canonicalUnitId)?.mfmRecordId);
      checked(unit,'mfmEnhancementRecordIds',unit.enhancementIds.map(id=>mfm.enhancementBindings.find(row=>row.entityId===id)?.mfmRecordId));
      unit.enhancementAssignments??=[];
      const physical=formRoster(book,state).units.find(item=>item.instanceId===unit.instanceId);
      for(const [id,scope]of Object.entries(bindings.modelBearers?.[unit.instanceId]||{})){
        if(!unit.enhancementIds.includes(id)||metadata.enhancements.find(e=>e.id===id)?.scope!=='MODEL'){
          error('FOREIGN_MODEL_BINDING',id,'Unselected or UNIT scoped Enhancement');continue;
        }
        const old=unit.enhancementAssignments.find(item=>item.enhancementId===id);
        if(old&&old.modelScopeId!==scope)error('CONFLICTING_MODEL_BINDING',id,'Physical bearer changed');
        else if(!old)unit.enhancementAssignments.push({enhancementId:id,modelScopeId:scope});
      }
      for(const id of unit.enhancementIds){
        const binding=metadata.enhancements.find(row=>row.id===id);
        if(!binding){error('UNKNOWN_ENHANCEMENT',id,'Missing source-owned Enhancement');continue;}
        const eligible=binding.eligibility;
        const accepts=model=>(!eligible.unitIds||eligible.unitIds.includes(unit.canonicalUnitId))&&
          (eligible.keywords||[]).every(keyword=>model.keywords.includes(keyword))&&
          (!eligible.excludeAllKeywords||!eligible.excludeAllKeywords.every(keyword=>model.keywords.includes(keyword)));
        if(binding.scope==='UNIT'){
          const canonical=index.get(unit.canonicalUnitId),model={keywords:[...canonical.data.keywords,...canonical.data.factionKeywords]};
          if(!accepts(model))error('WRONG_UPGRADE_UNIT',id,'Source UNIT recipient differs');
          if(unit.enhancementAssignments.some(a=>a.enhancementId===id))error('WRONG_UPGRADE_SCOPE',id,'UNIT Upgrade has no MODEL bearer');
          continue;
        }
        let assignment=unit.enhancementAssignments.find(item=>item.enhancementId===id);
        if(!assignment&&physical.profiles.length===1&&physical.profiles[0].quantity===1){
          assignment={enhancementId:id,modelScopeId:physical.profiles[0].scopeId};unit.enhancementAssignments.push(assignment);
        }
        const model=physical.profiles.find(item=>item.scopeId===assignment?.modelScopeId);
        if(!model||model.quantity!==1){
          if(assignment)error('WRONG_ENHANCEMENT_MODEL',id,'Bearer is not one exact physical MODEL');
          else needs.push({kind:'ENHANCEMENT_MODEL_OWNER',key:unit.instanceId,rawLabel:id,candidateIds:physical.profiles.filter(p=>p.quantity===1).map(p=>p.scopeId)});
        }else if(!accepts(model))error('WRONG_ENHANCEMENT_MODEL',id,'Source MODEL recipient differs');
      }
      for(const assignment of unit.enhancementAssignments)if(!unit.enhancementIds.includes(assignment.enhancementId))
        error('FOREIGN_ENHANCEMENT_ASSIGNMENT',unit.instanceId,'Bearer assignment has no selected source');
    }
    checked(state,'mfmDetachmentRecordIds',state.detachmentIds.map(id=>book.mfmImportReferences.partitions.detachmentBindings.find(row=>row.entityId===id)?.mfmRecordId));
    if(!errors.length&&!needs.length)try{
      validateRoster(book,state,book.rosterAttachmentPolicies);validateTauSourceChoices(book,state);validateTauAttachmentSourceConditions(book,state);
      validateTauPrototypeChoices(book,state);
    }catch(e){error('INVALID_PHYSICAL_STATE','roster',e.message);}
    return {state,needs,errors};
  }
  return {get state(){return saved?copy(saved):null;},draft:text=>shared().draft(text),
    import(text,bindings={}){
      const unknown=Object.keys(bindings).filter(key=>!['units','profiles','detachments','detachmentId','selections','enhancements','modelBearers'].includes(key));
      if(unknown.length)return {status:'INVALID',roster:null,needsBindings:[],errors:unknown.map(key=>({code:'UNSUPPORTED_SOURCE_BINDING',key,
        message:'No confirmed existing physical source-choice binding for this input'})),legality:'NOT_ASSESSED'};
      let result;
      try{result=shared().import(text,bindings);}catch(error){return {status:'INVALID',roster:null,needsBindings:[],
        errors:[{code:'INVALID_IMPORT_INPUT',key:'roster',message:error.message}],legality:'NOT_ASSESSED'};}
      if(result.status!=='READY')return {...result,legality:'NOT_ASSESSED'};
      const checked=bind(result.roster,{draft:result.draft,bindings});
      const status=checked.errors.length?'INVALID':checked.needs.length?'NEEDS_BINDINGS':'READY';
      if(status==='READY')saved=preserveTauSourceChoices(book,checked.state,saved);
      return {...result,status,roster:status==='READY'?copy(saved):null,...(status==='READY'?{}:{candidateRoster:checked.state}),
        needsBindings:[...result.needsBindings,...checked.needs],errors:[...result.errors,...checked.errors],legality:'NOT_ASSESSED'};
    },
    load(snapshot){
      const checked=bind(validateRoster(book,snapshot,book.rosterAttachmentPolicies));
      requireValue(!checked.errors.length&&!checked.needs.length,JSON.stringify({errors:checked.errors,needs:checked.needs}));
      saved=checked.state;return copy(saved);
    },snapshot(){requireValue(saved,'No imported T’au roster');return copy(saved);}};
}

/** Existing runtime owns execution and projection. This book boundary validates
 * physical source decisions before loading, so a rejected edit is atomic. */
export function createTauRosterRuntime(book){
  let runtime=createRosterRuntime(book,createTauRuleSchema());
  const imports=createTauRosterImport(book);
  const service={get catalog(){return runtime.catalog;},get state(){return runtime.state;},get projection(){return runtime.projection;},
    load(value){
      // Import validation also proves saved physical/source identity bindings.
      const candidate=imports.load(value),boundBook=bindTauShieldModels(bindTauPrototypeChoices(bindTauStudentPairs(book,candidate),candidate),candidate);
      const schema=createTauRuleSchema({bindContext:tauSourceChoiceContext(boundBook,candidate)});
      schema.validateContracts(boundBook);
      const next=createRosterRuntime(boundBook,{...schema,resolveWeaponSelection:tauWeaponSelectionResolver(boundBook,candidate),
        resolveWeaponPartitions:tauWeaponPartitionResolver(boundBook,candidate)});
      const verified=next.load(candidate);runtime=next;return verified;
    },snapshot:()=>runtime.snapshot(),effective:id=>runtime.effective(id),related:(...args)=>runtime.related(...args),
    context:(...args)=>runtime.context(...args),
    attach:(leader,target)=>service.load(changeAttachment(book,runtime.snapshot(),book.rosterAttachmentPolicies,'ATTACH',leader,target)),
    detach:leader=>service.load(changeAttachment(book,runtime.snapshot(),book.rosterAttachmentPolicies,'DETACH',leader)),
    reattach:(leader,target)=>service.load(changeAttachment(book,runtime.snapshot(),book.rosterAttachmentPolicies,'REATTACH',leader,target)),
    setStudentChoice:(source,recipients)=>service.load(setTauStudentChoice(book,runtime.snapshot(),source,recipients)),
    setPrototypeChoice:(source,rule,reference)=>service.load(setTauPrototypeChoice(book,runtime.snapshot(),source,rule,reference))};
  return service;
}
