import {createRosterImportService} from '../../shared/roster-v2/import-service.mjs';
import {normalizeImportLabel} from '../../shared/roster-v2/import.mjs';
import {validateRoster,formRoster,selections} from '../../shared/roster-v2/context.mjs';
import {createRosterAttachmentService} from '../../shared/roster-v2/attachment-service.mjs';
import {parse as parseNewRecruit} from '../../shared/roster-v2/parser.mjs';

const copy=structuredClone;
const requireValue=(condition,message)=>{if(!condition)throw new TypeError(message);};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

/** Shared text parsing/resolution with book-owned physical source bindings. */
export function createTyranidsRosterImport(input){
  const book=copy(input),metadata=book.importBindings,index=new Map(book.entities.map(e=>[e.id,e]));
  requireValue(book.bookId==='tyranids'&&metadata?.schema==='tyranids-v2/import-bindings/v1','Invalid Tyranids import domain');
  for(const binding of metadata.compositions){
    const fact=index.get(binding.id);
    requireValue(fact?.kind==='COMPOSITION_MEMBER'&&fact.parentId===binding.ownerId&&fact.data.modelProfileId===binding.profileId&&
      same(fact.data.quantity,binding.quantity),'Foreign composition binding');
  }
  for(const binding of metadata.enhancements){
    const fact=index.get(binding.id);
    requireValue(fact?.kind==='ENHANCEMENT'&&fact.parentId===binding.detachmentId&&fact.data.scope===binding.scope&&
      fact.data.eligibilityText===binding.eligibilityText,'Foreign Enhancement scope binding');
  }
  const active=book.entities.filter(e=>e.kind==='DATASHEET').flatMap(e=>e.data.ruleReferenceIds);
  requireValue(active.length===metadata.nativeReferenceBindings.length&&new Set(metadata.nativeReferenceBindings.map(r=>r.id)).size===active.length,
    'Incomplete native reference bindings');
  for(const ref of metadata.nativeReferenceBindings){
    const fact=index.get(ref.id);
    requireValue(active.includes(ref.id)&&fact?.kind==='RULE_REFERENCE'&&fact.parentId===ref.ownerId&&
      fact.data.label===ref.label&&same(fact.data.recipient,ref.recipient),'Foreign native MODEL reference binding');
  }
  const fnpRefs=metadata.nativeReferenceBindings.filter(ref=>ref.label==='Feel No Pain 5+');
  requireValue(same(Object.keys(book.rosterReferenceSemantics).sort(),fnpRefs.map(ref=>ref.id).sort()),'Unconfirmed native ability bag');
  for(const ref of fnpRefs){
    const native=book.rosterReferenceSemantics[ref.id];
    requireValue(native.scope==='MODEL'&&same(native.abilities,[{name:'Feel No Pain',value:5}])&&
      same(native.modelProfileIds,ref.recipient.modelProfileIds)&&same(native.compositionMemberIds,ref.recipient.compositionMemberIds),
      'Native FNP physical owner/value changed');
  }
  const shared=text=>{
    const extra=[];
    if(text!==undefined){
      const parsed=parseNewRecruit(text);
      for(const compound of metadata.compoundWeaponSelections){
        const gear=parsed.units.filter(u=>normalizeImportLabel(u.name)===normalizeImportLabel(index.get(compound.ownerId).data.title))
          .flatMap(u=>[u.wargear,...u.models.flatMap(m=>[m.wargear,...m.loadouts.map(l=>l.wargear)])]);
        const complete=gear.some(value=>String(value).split(',').some((part,i,all)=>
          normalizeImportLabel(part.replace(/^\d+\s*[x×]?\s*/,''))===normalizeImportLabel(compound.fragments[0])&&
          normalizeImportLabel(all[i+1])===normalizeImportLabel(compound.fragments[1])));
        // Fragment vocabulary is scoped to an actual complete source item in
        // this input; it never makes either fragment a standalone equipment fact.
        if(complete)for(const label of compound.fragments)extra.push({ownerId:compound.ownerId,label,
          canonicalProfileIds:[compound.canonicalProfileId],evidence:compound.evidence});
      }
    }
    return createRosterImportService(book,{...metadata,weaponSelections:[...metadata.weaponSelections,...extra]});
  };
  let saved=null;
  function bind(snapshot,{draft,bindings={}}={}){
    const state=copy(snapshot),needs=[],errors=[];
    const need=(kind,key,rawLabel,candidateIds=[])=>needs.push({kind,key,rawLabel,candidateIds});
    const error=(code,key,message)=>errors.push({code,key,message});
    const assignChecked=(object,key,value)=>{
      if(Object.hasOwn(object,key)&&!same(object[key],value))error('CONFLICTING_CANONICAL_BINDING',key,'Stored canonical source/physical ownership differs');
      else object[key]=copy(value);
    };
    if(draft){
      state.importEvidence=copy(draft.metadata);
      if(draft.metadata.faction&&draft.metadata.faction!=='—'&&normalizeImportLabel(draft.metadata.faction)!=='tyranids')
        error('FOREIGN_FACTION_EXPORT','faction','Export identifies a different faction');
    }
    if(bindings.modelBearers!==undefined&&(!bindings.modelBearers||typeof bindings.modelBearers!=='object'||Array.isArray(bindings.modelBearers)))
      error('INVALID_MODEL_BINDING','modelBearers','Expected physical UNIT/Enhancement/MODEL-scope dictionary');
    for(const id of Object.keys(bindings.modelBearers||{}))if(!state.units.some(u=>u.instanceId===id))
      error('FOREIGN_MODEL_BINDING',id,'Bearer binding does not identify an imported physical UNIT');
    for(const unit of state.units){
      if(new Set(unit.enhancementIds).size!==unit.enhancementIds.length)
        error('DUPLICATE_ENHANCEMENT_SELECTION',unit.instanceId,'A selected Enhancement identity cannot be duplicated');
      const members=metadata.compositions.filter(row=>row.ownerId===unit.canonicalUnitId),raw=draft?.units.find(u=>u.id===unit.instanceId);
      for(const compound of metadata.compoundWeaponSelections.filter(c=>c.ownerId===unit.canonicalUnitId)){
        const containers=[{selections:unit.selections,prefix:unit.instanceId},...unit.modelRows.flatMap(r=>[
          {selections:r.selections,prefix:r.rowId},...r.loadouts.map(l=>({selections:l.selections,prefix:l.loadoutId}))])];
        const lexical=raw?[raw.selections,...raw.modelRows.flatMap(r=>[r.selections,...r.loadouts.map(l=>l.selections)])].flat():[];
        for(const group of containers)for(let i=0;i<group.selections.length;i++){
          const container=group.selections;
          const selection=container[i];
          if(selection.compoundSourceSelections){
            const parts=selection.compoundSourceSelections;
            const ordinal=selection.selectionKey.match(/\/selection\/(\d+)$/)?.[1];
            const expectedKeys=ordinal?[`${group.prefix}/selection/${ordinal}`,`${group.prefix}/selection/${Number(ordinal)+1}`]:[];
            const rawMatches=(part,n)=>{
              const prefix=part.rawText?.match(/^(\d+)\s*(?:[x×]\s*|\s+)(\S.*)$/i);
              const label=prefix?prefix[2].trim():part.rawText;
              return typeof label==='string'&&normalizeImportLabel(label)===normalizeImportLabel(compound.fragments[n])&&
                (prefix?Number(prefix[1]):1)===selection.perModelQuantity;
            };
            if(parts.length!==2||selection.canonicalProfileIds.length!==1||selection.canonicalProfileIds[0]!==compound.canonicalProfileId||
              selection.selectionKey!==parts[0].key||parts.some((p,n)=>p.key!==expectedKeys[n]||!rawMatches(p,n)||
                normalizeImportLabel(p.label)!==normalizeImportLabel(compound.fragments[n])||p.physicalQuantity!==selection.physicalQuantity))
              error('INVALID_COMPOUND_SELECTION',selection.selectionKey,'Combined source item evidence changed');
            continue;
          }
          if(!selection.canonicalProfileIds.includes(compound.canonicalProfileId))continue;
          const first=lexical.find(r=>r.key===selection.selectionKey),next=container[i+1],second=lexical.find(r=>r.key===next?.selectionKey);
          if(!first||!second||normalizeImportLabel(first.label)!==normalizeImportLabel(compound.fragments[0])||
            normalizeImportLabel(second.label)!==normalizeImportLabel(compound.fragments[1])||
            next?.canonicalProfileIds.length!==1||next.canonicalProfileIds[0]!==compound.canonicalProfileId||
            selection.physicalQuantity!==next.physicalQuantity||selection.perModelQuantity!==next.perModelQuantity){
            need('COMPOUND_WEAPON_SOURCE',selection.selectionKey,'Complete combined item required in one physical loadout');continue;
          }
          selection.compoundSourceSelections=[first,second].map(r=>({key:r.key,label:r.label,rawText:r.rawText,physicalQuantity:r.physicalQuantity}));
          container.splice(i+1,1);
        }
      }
      for(const row of unit.modelRows){
        const rawRow=raw?.modelRows.find(r=>r.key===row.rowId);
        const matches=draft?(raw.modelRows.length?members.filter(m=>m.labels.some(label=>normalizeImportLabel(label)===normalizeImportLabel(rawRow?.name))):members):members.filter(m=>m.id===row.compositionMemberId);
        if(matches.length!==1){need('COMPOSITION_MEMBER',row.rowId,rawRow?.name||raw?.name,matches.map(m=>m.id));continue;}
        const member=matches[0];
        assignChecked(row,'compositionMemberId',member.id);
        if(row.canonicalProfileId!==member.profileId)error('FOREIGN_PHYSICAL_PROFILE',row.rowId,'Composition and model profile owners differ');
        const native=metadata.nativeReferenceBindings.filter(ref=>ref.ownerId===unit.canonicalUnitId&&
          ref.recipient.modelProfileIds.includes(row.canonicalProfileId)&&ref.recipient.compositionMemberIds.includes(member.id)).map(ref=>ref.id);
        assignChecked(row,'sourceRuleReferenceIds',native);
        for(const selection of [...row.selections,...row.loadouts.flatMap(l=>l.selections)]){
          if(selection.canonicalProfileIds.some(id=>!member.allowedProfileIds.includes(id)))
            error('WRONG_MODEL_WEAPON',selection.selectionKey,'Weapon is not owned by this source composition member');
        }
      }
      if(unit.modelRows.every(row=>row.compositionMemberId))for(const member of members){
        const count=unit.modelRows.filter(row=>row.compositionMemberId===member.id).reduce((n,row)=>n+row.quantity,0);
        if(count<member.quantity.min||count>member.quantity.max)error('SOURCE_COMPOSITION_QUANTITY',unit.instanceId,'Imported model count differs from '+member.id);
      }
      for(const constraint of metadata.compositionConstraints.filter(row=>row.ownerId===unit.canonicalUnitId)){
        const evidence=index.get(constraint.evidence.entityId)?.data.blocks[0].text;
        requireValue(evidence?.includes(constraint.sourceText),'Unconfirmed composition restriction');
        const count=id=>unit.modelRows.filter(row=>row.compositionMemberId===id).reduce((sum,row)=>sum+row.quantity,0);
        if(count(constraint.memberId)===constraint.selectedQuantity&&count(constraint.requiresMemberId)!==constraint.requiredQuantity)
          error('SOURCE_COMPOSITION_CONDITION',unit.instanceId,constraint.sourceText);
      }
      // Aggregate selected weapons cannot be assigned to an arbitrary physical
      // model. Preserve the import and request a more precise source binding.
      if(unit.startingStrength>1&&unit.selections.some(s=>s.physicalQuantity>0))
        need('WEAPON_MODEL_OWNER',unit.instanceId,'Selected aggregate equipment has no exact physical owner');
      const unitBridge=book.mfmImportReferences.partitions.unitBindings.find(row=>row.entityId===unit.canonicalUnitId);
      requireValue(unitBridge,'Missing central MFM unit bridge');
      assignChecked(unit,'mfmUnitRecordId',unitBridge.mfmRecordId);
      const enhancementRecords=unit.enhancementIds.map(id=>metadata.enhancements.find(row=>row.id===id)?.mfmRecordId);
      assignChecked(unit,'mfmEnhancementRecordIds',enhancementRecords);
      const selectedIds=new Set(selections(unit).filter(s=>s.physicalQuantity>0).flatMap(s=>s.canonicalProfileIds));
      const paid=book.mfmImportReferences.partitions.paidOptionBindings.filter(row=>index.get(row.entityId)?.parentId===unit.canonicalUnitId&&selectedIds.has(row.entityId));
      assignChecked(unit,'mfmPaidUpgradeRecordIds',paid.map(row=>row.mfmRecordId));
      const selectedPaid=selections(unit).filter(s=>s.physicalQuantity>0&&paid.some(p=>s.canonicalProfileIds.includes(p.entityId)));
      if(selectedPaid.some(s=>s.physicalQuantity!==1)||new Set(selectedPaid.flatMap(s=>s.canonicalProfileIds.filter(id=>paid.some(p=>p.entityId===id)))).size!==selectedPaid.length)
        error('DUPLICATE_PAID_OPTION',unit.instanceId,'Paid weapon must identify one physical selection, counted once');
      if(unit.canonicalUnitId==='unit-tyrannofex'){
        const main=book.importBindings.weaponSelections.filter(w=>w.ownerId===unit.canonicalUnitId&&
          ['datasheet-tyrannofex:weapon:1','datasheet-tyrannofex:weapon:2','datasheet-tyrannofex:weapon:3'].some(id=>w.canonicalProfileIds.includes(id)));
        if(main.filter(w=>w.canonicalProfileIds.some(id=>selectedIds.has(id))).length>1)
          error('CONFLICTING_MAIN_WEAPON',unit.instanceId,'Export selects mutually exclusive Tyrannofex replacements');
      }
      if(unit.canonicalUnitId==='unit-hyperadapted-raveners'){
        for(const row of unit.modelRows){
          const allocated=row.loadouts.reduce((sum,l)=>sum+l.quantity,0);
          const groups=[...row.loadouts.map(l=>({count:l.quantity,selections:[...row.selections,...l.selections]})),
            {count:row.quantity-allocated,selections:row.selections}].filter(g=>g.count);
          for(const group of groups)for(const s of group.selections)if(s.physicalQuantity>0&&s.canonicalProfileIds.includes('datasheet-hyperadapted-raveners:weapon:1')&&group.count!==1)
            need('VENOM_BOLT_MODEL_OWNER',s.selectionKey,'Venom bolt requires one explicitly identified Ravener');
        }
        if(selections(unit).filter(s=>s.physicalQuantity>0&&s.canonicalProfileIds.includes('datasheet-hyperadapted-raveners:weapon:1')).reduce((sum,s)=>sum+s.physicalQuantity,0)>1)
          error('SOURCE_VENOM_BOLT_QUANTITY',unit.instanceId,'Accepted composition contains one venom bolt bearer');
      }
      unit.enhancementAssignments??=[];
      const bearerBindings=bindings.modelBearers?.[unit.instanceId];
      if(bearerBindings!==undefined&&(!bearerBindings||typeof bearerBindings!=='object'||Array.isArray(bearerBindings)))
        error('INVALID_MODEL_BINDING',unit.instanceId,'Bearer must identify a selected Enhancement and exact MODEL scope');
      for(const [id,scope] of Object.entries(bearerBindings||{}))if(!unit.enhancementIds.includes(id)||metadata.enhancements.find(e=>e.id===id)?.scope!=='MODEL'||typeof scope!=='string'||!scope)
        error('INVALID_MODEL_BINDING',id,'Foreign or invalid MODEL Enhancement assignment');
      const physical=formRoster(book,state).units.find(u=>u.instanceId===unit.instanceId);
      for(const id of unit.enhancementIds){
        const binding=metadata.enhancements.find(e=>e.id===id);requireValue(binding,'Unknown Enhancement source');
        if(binding.scope==='UNIT'){
          if(!binding.eligibleUnitIds.includes(unit.canonicalUnitId))error('WRONG_UPGRADE_UNIT',unit.instanceId,'UNIT Upgrade has a different source owner');
          if(unit.enhancementAssignments.some(a=>a.enhancementId===id))error('WRONG_UPGRADE_SCOPE',id,'UNIT Upgrade cannot have a MODEL bearer');
          continue;
        }
        let assignment=unit.enhancementAssignments.find(a=>a.enhancementId===id);
        const explicit=bearerBindings?.[id];
        if(explicit){
          if(assignment&&assignment.modelScopeId!==explicit)error('CONFLICTING_MODEL_OWNER',id,'Conflicting physical MODEL assignment');
          else if(!assignment){assignment={enhancementId:id,modelScopeId:explicit};unit.enhancementAssignments.push(assignment);}
        }
        if(!assignment&&physical.profiles.length===1&&physical.profiles[0].quantity===1){
          assignment={enhancementId:id,modelScopeId:physical.profiles[0].scopeId};unit.enhancementAssignments.push(assignment);
        }
        const model=physical.profiles.find(p=>p.scopeId===assignment?.modelScopeId);
        if(!model||model.quantity!==1){
          if(explicit||assignment)error('FOREIGN_ENHANCEMENT_MODEL',id,'Bearer is not one exact MODEL of this physical unit');
          else need('ENHANCEMENT_MODEL_OWNER',unit.instanceId,id,physical.profiles.filter(p=>p.quantity===1).map(p=>p.scopeId));
        }
        if(model&&!binding.requiredKeywordAlternatives.some(keys=>keys.every(key=>model.keywords.includes(key))))
          error('WRONG_ENHANCEMENT_MODEL',id,'MODEL bearer does not match the source-owned identity restriction');
        if(model&&binding.requiredNativeAbility){
          const row=unit.modelRows.find(r=>model.scopeId.startsWith(unit.instanceId+'/'+r.rowId+'/'));
          if(!row?.sourceRuleReferenceIds?.some(ref=>index.get(ref)?.data.label===binding.requiredNativeAbility))
            need('ENHANCEMENT_ELIGIBILITY_NEEDS_BINDINGS',unit.instanceId,binding.eligibilityText);
        }
        if(model&&binding.unresolvedExclusion&&model.keywords.includes('MONSTER'))
          need('UNRESOLVED_SOURCE_RESTRICTION',unit.instanceId,binding.eligibilityText);
      }
      for(const assignment of unit.enhancementAssignments)if(!unit.enhancementIds.includes(assignment.enhancementId)||metadata.enhancements.find(e=>e.id===assignment.enhancementId)?.scope!=='MODEL')
        error('FOREIGN_ENHANCEMENT_ASSIGNMENT',unit.instanceId,'Stored bearer does not own a selected MODEL Enhancement');
    }
    assignChecked(state,'mfmDetachmentRecordIds',state.detachmentIds.map(id=>book.mfmImportReferences.partitions.detachmentBindings.find(row=>row.entityId===id)?.mfmRecordId));
    if(!needs.length&&!errors.length){try{validateRoster(book,state,[]);}catch(e){error('INVALID_CANONICAL_STATE','roster',e.message);}}
    return {state,needs,errors};
  }
    const service={get state(){return saved?copy(saved):null;},draft:text=>shared(text).draft(text),
    import(text,bindings={}){
      const result=shared(text).import(text,bindings);if(result.status!=='READY')return {...result,legality:'NOT_ASSESSED'};
      const checked=bind(result.roster,{draft:result.draft,bindings});
      const status=checked.errors.length?'INVALID':checked.needs.length?'NEEDS_BINDINGS':'READY';
      if(status==='READY')saved=checked.state;
      return {...result,status,roster:status==='READY'?copy(checked.state):null,
        ...(status==='READY'?{}:{candidateRoster:copy(checked.state)}),needsBindings:[...result.needsBindings,...checked.needs],
        errors:[...result.errors,...checked.errors],legality:'NOT_ASSESSED',mfmSourceVersion:'v1.6',
        unresolvedEquipmentScopes:checked.state.units.filter(u=>!u.equipmentContextKnown).map(u=>u.instanceId)};
    },
    load(snapshot){
      requireValue(snapshot?.attachments?.length===0,'Import snapshot cannot contain attachments');
      const verified=validateRoster(book,snapshot,[]),checked=bind(verified);
      requireValue(!checked.needs.length&&!checked.errors.length,JSON.stringify({needs:checked.needs,errors:checked.errors}));
      saved=checked.state;return copy(saved);
    },
    snapshot(){requireValue(saved,'No imported Tyranids roster');return copy(saved);}};
  return service;
}

/** Attachments are an independent existing shared context, never import edits. */
export function createTyranidsImportAttachments(book){
  const expected=book.mfmImportReferences.leaderRelations.map(row=>({sourceId:row.sourceId,targetId:row.targetId,
    role:'LEADER',additionalLeaders:0,sourceIds:[row.declarationId],mfmReferenceId:row.mfmRecordId}));
  requireValue(same(book.rosterAttachmentPolicies,expected)&&expected.length===15,'Unconfirmed Tyranids attachment relation');
  const service=createRosterAttachmentService(book,{importService:createTyranidsRosterImport(book),policies:book.rosterAttachmentPolicies});
  return service;
}
