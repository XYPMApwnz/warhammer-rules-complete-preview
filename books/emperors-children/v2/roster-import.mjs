import {createRosterImportService} from '../../shared/roster-v2/import-service.mjs';
import {normalizeImportLabel} from '../../shared/roster-v2/import.mjs';
import {validateRoster,formRoster,selections,predicateContext} from '../../shared/roster-v2/context.mjs';
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';
const clone=structuredClone,bladeId='detachment-carnival-of-excess:enhancement:3';
const reject=(ok,message)=>{if(!ok)throw new TypeError(message);};

/** Share the same source-owned display bindings with a later contract consumer.
 * No rule, operation, factual data or canonical identity is replaced. */
export function withECImportBindings(book,importBook) {
  reject(book.bookId==='emperors-children'&&importBook.bookId===book.bookId,'Foreign import metadata');
  const records=new Map(book.entities.map(e=>[e.id,e])),source=new Map(importBook.entities.map(e=>[e.id,e]));
  for(const binding of importBook.importBindings.equipmentSelections)for(const proof of binding.evidence){
    const current=records.get(proof.entityId),original=source.get(proof.entityId);
    reject(current?.parentId===binding.ownerId&&current.provenance?.sourceId===original?.provenance?.sourceId,'Foreign equipment binding owner');
    const at=e=>proof.path.slice(1).split('/').reduce((v,k)=>v?.[k],e?.data);
    reject(typeof at(current)==='string'&&at(current)===at(original),'Stale import equipment evidence');
  }
  return {...book,rosterEquipmentCaptionBindings:clone(importBook.importBindings.equipmentSelections)};
}

/** Shared parsing/resolution, then EC-owned canonical composition/owner bindings.
 * Explicit modelBearers/weaponChoices are binding API inputs, not invented
 * New Recruit export lines. Missing decisions are never inferred from loadout. */
export function createECRosterImport(book) {
  const metadata=book.importBindings,index=new Map(book.entities.map(e=>[e.id,e]));
  reject(book.bookId==='emperors-children'&&metadata?.schema==='ec-v2/import-bindings/v1','Invalid EC import input');
  const base=()=>createRosterImportService(book,metadata),schema=createRuleContractSchema();let saved=null;
  function bind(roster,{draft,bindings={}}={}) {
    const state=clone(roster),needs=[],errors=[];
    const need=(kind,key,rawLabel,candidates=[])=>needs.push({kind,key,rawLabel,candidateIds:candidates});
    const error=(code,key,message)=>errors.push({code,key,message});
    if(draft){state.importEvidence=clone(draft.metadata);
      if(draft.metadata.faction&&draft.metadata.faction!=='—'&&!['emperors children','chaos emperors children'].includes(normalizeImportLabel(draft.metadata.faction)))
        error('FOREIGN_FACTION_EXPORT','faction','Export identifies another army');}
    const detachmentRecords=state.detachmentIds.map(id=>book.mfmImportReferences.detachmentBindings.find(b=>b.entityId===id)?.mfmRecordId);
    if(state.mfmDetachmentRecordIds&&JSON.stringify(state.mfmDetachmentRecordIds)!==JSON.stringify(detachmentRecords))error('FOREIGN_MFM_OWNER','detachments','Wrong central Detachment references');
    state.mfmDetachmentRecordIds=detachmentRecords;
    for(const name of ['modelBearers','weaponChoices'])if(bindings[name]!==undefined&&(!bindings[name]||typeof bindings[name]!=='object'||Array.isArray(bindings[name])))
      error('INVALID_CANONICAL_BINDING',name,'Binding must be a dictionary of existing physical IDs');
    for(const key of ['modelBearers','weaponChoices'])for(const id of Object.keys(bindings[key]||{}))
      if(!state.units.some(u=>u.instanceId===id))error('FOREIGN_PHYSICAL_BINDING',id,key+' does not identify an imported unit');
    for(const unit of state.units) {
      const modelBindings=bindings.modelBearers?.[unit.instanceId];
      if(modelBindings!==undefined){
        if(!modelBindings||typeof modelBindings!=='object'||Array.isArray(modelBindings))error('INVALID_MODEL_BINDING',unit.instanceId,'MODEL bindings require an Enhancement-to-scope dictionary');
        else for(const [id,scope]of Object.entries(modelBindings))if(!unit.enhancementIds.includes(id)||metadata.enhancements.find(e=>e.id===id)?.scope!=='MODEL'||typeof scope!=='string'||!scope)
          error('INVALID_MODEL_BINDING',unit.instanceId,'Binding must identify a selected MODEL Enhancement and an explicit scope');
      }
      const members=metadata.compositions.filter(c=>c.ownerId===unit.canonicalUnitId),raw=draft?.units.find(u=>u.id===unit.instanceId);
      for(const row of unit.modelRows){
        const rowDraft=raw?.modelRows.find(r=>r.key===row.rowId);
        const matches=draft?(raw.modelRows.length?members.filter(c=>c.labels.some(label=>normalizeImportLabel(label)===normalizeImportLabel(rowDraft?.name))):members):
          members.filter(c=>c.id===row.compositionMemberId);
        if(matches.length!==1){need('COMPOSITION_MEMBER',row.rowId,rowDraft?.name||raw?.name,matches.map(c=>c.id));continue;}
        row.compositionMemberId=matches[0].id;
        if(row.canonicalProfileId!==matches[0].profileId)error('FOREIGN_MODEL_IDENTITY',row.rowId,'Composition and stat-profile owners disagree');
      }
      if(unit.modelRows.every(r=>r.compositionMemberId))for(const member of members){
        const count=unit.modelRows.filter(r=>r.compositionMemberId===member.id).reduce((n,r)=>n+r.quantity,0);
        if(count<member.quantity.min||count>member.quantity.max)error('SOURCE_COMPOSITION_QUANTITY',unit.instanceId,'Count differs from accepted '+member.id);
      }
      const reference=book.mfmImportReferences.unitBindings.find(b=>b.entityId===unit.canonicalUnitId);
      reject(reference,'Missing central MFM unit binding');
      if(unit.mfmUnitRecordId&&unit.mfmUnitRecordId!==reference.mfmRecordId)error('FOREIGN_MFM_OWNER',unit.instanceId,'Wrong central points reference');
      unit.mfmUnitRecordId=reference.mfmRecordId;
      const enhancementRecords=unit.enhancementIds.map(id=>book.mfmImportReferences.enhancementBindings.find(b=>b.entityId===id)?.mfmRecordId);
      const selectedWeaponIds=selections(unit).filter(s=>s.physicalQuantity>0).flatMap(s=>s.canonicalProfileIds);
      const paidRecords=book.mfmImportReferences.paidUpgradeBindings.filter(b=>b.scopeOwnerId===unit.canonicalUnitId&&b.weaponProfileSourceIds.some(id=>selectedWeaponIds.includes(id))).map(b=>b.mfmRecordId);
      for(const [key,value]of [['mfmEnhancementRecordIds',enhancementRecords],['mfmPaidUpgradeRecordIds',paidRecords]]){
        if(unit[key]&&JSON.stringify(unit[key])!==JSON.stringify(value))error('FOREIGN_MFM_OWNER',unit.instanceId,'Wrong central '+key);
        unit[key]=value;
      }
      unit.enhancementAssignments??=[];
      const physical=formRoster(book,state).units.find(u=>u.instanceId===unit.instanceId);
      for(const enhancementId of unit.enhancementIds){
        const binding=metadata.enhancements.find(e=>e.id===enhancementId);reject(binding,'Unbound EC Enhancement');
        if(binding.scope==='UNIT'){
          if(unit.canonicalUnitId!==binding.unitId)error('WRONG_UPGRADE_UNIT',unit.instanceId,'UNIT Upgrade belongs to '+binding.unitId);
          if(unit.enhancementAssignments.some(a=>a.enhancementId===enhancementId))error('WRONG_UPGRADE_SCOPE',unit.instanceId,'UNIT Upgrade cannot have a MODEL assignment');
          continue;
        }
        const explicit=bindings.modelBearers?.[unit.instanceId]?.[enhancementId];
        let assignment=unit.enhancementAssignments.find(a=>a.enhancementId===enhancementId);
        if(explicit){if(assignment&&assignment.modelScopeId!==explicit)error('CONFLICTING_MODEL_OWNER',unit.instanceId,'Contradictory MODEL assignment');
          else if(!assignment){assignment={enhancementId,modelScopeId:explicit};unit.enhancementAssignments.push(assignment);}}
        if(!assignment&&physical.profiles.length===1&&physical.profiles[0].quantity===1){assignment={enhancementId,modelScopeId:physical.profiles[0].scopeId};unit.enhancementAssignments.push(assignment);}
        const owner=physical.profiles.find(m=>m.scopeId===assignment?.modelScopeId);
        if(!owner||owner.quantity!==1){if(explicit)error('FOREIGN_ENHANCEMENT_MODEL',unit.instanceId,'Explicit bearer does not identify one MODEL in this physical unit');
          else need('ENHANCEMENT_MODEL_OWNER',unit.instanceId,enhancementId,physical.profiles.filter(p=>p.quantity===1).map(p=>p.scopeId));continue;}
        const selector=binding.assignmentReference?.selector;
        const leaves=node=>node.op?node.args.flatMap(leaves):[node];
        if(selector&&leaves(selector).every(n=>n.contextLevel==='STATIC')&&schema.evaluatePredicate(selector,predicateContext(state,{units:[physical],formedUnits:[]},unit.instanceId,'MODEL',owner.scopeId))!=='TRUE')
          error('WRONG_ENHANCEMENT_MODEL',unit.instanceId,'MODEL does not satisfy the existing source-owned assignment');
      }
      // Every optional item keeps its imported physical row/loadout. No unit
      // selection is redistributed over model rows to manufacture a bearer.
      const equipmentOwners=new Map();
      for(const selection of selections(unit))for(const equipment of metadata.equipmentSelections){
        const id=equipment.canonicalEquipmentIds[0],pointer=equipment.canonicalFieldPaths[id][0];
        if(!selection.physicalQuantity||!selection.canonicalEquipmentIds.includes(id)||!selection.canonicalFieldPaths?.[id]?.includes(pointer))continue;
        const scopes=physical.profiles.filter(p=>p.quantity===1&&p.selections.some(s=>s.selectionKey===selection.selectionKey));
        const owner=scopes.length===1?scopes[0]:unit.startingStrength===1?physical.profiles[0]:null;
        if(selection.physicalQuantity!==1)error('EQUIPMENT_QUANTITY',selection.selectionKey,'Optional equipment selects exactly one physical model');
        if(!owner){need('EQUIPMENT_MODEL_OWNER',selection.selectionKey,equipment.label);continue;}
        const row=unit.modelRows.find(r=>owner.scopeId.startsWith(unit.instanceId+'/'+r.rowId+'/'));
        if(equipment.eligibleMemberId&&row?.compositionMemberId!==equipment.eligibleMemberId)error('WRONG_EQUIPMENT_MODEL',selection.selectionKey,'Item cannot belong to this composition member');
        if(equipmentOwners.has(id))error('DUPLICATE_EQUIPMENT',selection.selectionKey,'Duplicate selected equipment');
        equipmentOwners.set(id,owner.scopeId);
      }
      for(const restriction of book.rosterEquipmentRestrictions||[])if(restriction.ownerId===unit.canonicalUnitId){
        const a=equipmentOwners.get(restriction.instrumentId),b=equipmentOwners.get(restriction.iconId);
        if(a&&b&&a===b)error('EXCLUSIVE_MODEL_EQUIPMENT',unit.instanceId,'Instrument and Icon cannot share a MODEL');
      }
      if(unit.canonicalUnitId==='unit-keeper-of-secrets'){
        const choices=new Set(selections(unit).filter(s=>s.physicalQuantity>0).flatMap(s=>s.canonicalProfileIds).filter(id=>
          ['datasheet-keeper-of-secrets:weapon:1','datasheet-keeper-of-secrets:weapon:4'].includes(id)));
        if(equipmentOwners.has('datasheet-keeper-of-secrets:section:1'))choices.add('aegis');
        if(choices.size>1)error('EXCLUSIVE_AEGIS_REPLACEMENT',unit.instanceId,'Keeper can select only one of living whip, ritual knife or shining aegis');
      }
      if(unit.enhancementIds.includes(bladeId)){
        const supplied=bindings.weaponChoices?.[unit.instanceId];
        const optionId=supplied||(unit.selectedUpgradeIds||[])[0],option=metadata.weaponChoices.find(o=>o.id===optionId);
        const decisions=selections(unit).flatMap(s=>s.canonicalOptionIds||[]);
        if(unit.selectedUpgradeIds!==undefined&&(!Array.isArray(unit.selectedUpgradeIds)||unit.selectedUpgradeIds.length!==1||
          decisions.length!==1||decisions[0]!==unit.selectedUpgradeIds[0]))
          error('AMBIGUOUS_WEAPON_DECISION',unit.instanceId,'Exactly one canonical option must match exactly one physical decision record');
        const assignment=unit.enhancementAssignments.find(a=>a.enhancementId===bladeId),owner=physical.profiles.find(m=>m.scopeId===assignment?.modelScopeId);
        const decisionRows=selections(unit).filter(s=>s.canonicalOptionIds?.length);
        if(decisionRows.length){const decision=decisionRows[0];
          if(decision.physicalQuantity!==1||decision.canonicalProfileIds.length||decision.canonicalEquipmentIds.length)
            error('INVALID_WEAPON_DECISION_RECORD',unit.instanceId,'A decision selects one option without adding equipment');
          if(owner&&!owner.selections.some(s=>s.selectionKey===decision.selectionKey)&&!(unit.startingStrength===1&&unit.selections.includes(decision)))
            error('FOREIGN_WEAPON_DECISION_MODEL',unit.instanceId,'Decision belongs to another physical MODEL scope');
        }
        if(!optionId)need('POSSESSED_BLADE_WEAPON',unit.instanceId,'At start of battle: exact equipped melee profile',metadata.weaponChoices.filter(o=>o.unitId===unit.canonicalUnitId).map(o=>o.id));
        else if(!option||option.unitId!==unit.canonicalUnitId)error('FOREIGN_WEAPON_CHOICE',unit.instanceId,'Unknown or foreign canonical Possessed Blade option');
        else if(owner){const weapons=[...owner.weapons,...(unit.startingStrength===1?physical.weapons:[])].filter(w=>w.canonicalProfileId===option.weaponProfileId&&w.physicalQuantity===1);
          if(weapons.length!==1)error('UNEQUIPPED_WEAPON_CHOICE',unit.instanceId,'Selected weapon must be equipped by the exact MODEL bearer');
          else if(supplied){
            if(unit.selectedUpgradeIds?.length)error('DUPLICATE_WEAPON_DECISION',unit.instanceId,'A weapon decision is already present');
            else {unit.selectedUpgradeIds=[option.id];const record={selectionKey:'binding/'+bladeId,physicalQuantity:1,canonicalProfileIds:[],canonicalEquipmentIds:[],
              canonicalOptionIds:[option.id],selectionField:'selectedUpgradeIds',selectionCardinality:'MANY',exclusiveGroupId:bladeId,
              bindingEvidence:{origin:'EXPLICIT_CANONICAL_BINDING',weaponProfileId:option.weaponProfileId}};
              const row=unit.modelRows.find(r=>owner.scopeId.startsWith(unit.instanceId+'/'+r.rowId+'/'));
              const loadout=row.loadouts.find(l=>owner.scopeId===unit.instanceId+'/'+row.rowId+'/LOADOUT/'+l.loadoutId);
              (loadout?.selections||row.selections).push(record);}
          }
        }
      }else if(bindings.weaponChoices?.[unit.instanceId]||unit.selectedUpgradeIds?.length)error('UNASSIGNED_WEAPON_CHOICE',unit.instanceId,'Possessed Blade is not assigned');
      if(Object.keys(unit).some(k=>/^selected[A-Z]\w*Ids?$/.test(k)&&k!=='selectedUpgradeIds'))error('UNKNOWN_CANONICAL_OPTION',unit.instanceId,'Unknown EC option state');
    }
    if(!needs.length&&!errors.length){try{validateRoster(book,state,[]);}catch(e){error('INVALID_CANONICAL_STATE','roster',e.message);}}
    return {state,needs,errors};
  }
  const service={get state(){return saved?clone(saved):null;},draft:text=>base().draft(text),
    import(text,bindings={}){
      const result=base().import(text,bindings);if(result.status!=='READY')return result;
      const bound=bind(result.roster,{draft:result.draft,bindings});
      const status=bound.errors.length?'INVALID':bound.needs.length?'NEEDS_BINDINGS':'READY';
      if(status==='READY')saved=bound.state;
      return {...result,status,roster:status==='READY'?clone(bound.state):null,
        ...(status==='READY'?{}:{candidateRoster:clone(bound.state)}),needsBindings:[...result.needsBindings,...bound.needs],errors:[...result.errors,...bound.errors],
        legality:'NOT_ASSESSED',mfmSourceVersion:'v1.6',
        unresolvedEquipmentScopes:bound.state.units.filter(u=>!u.equipmentContextKnown).map(u=>u.instanceId)};
    },load(snapshot){reject(snapshot?.attachments?.length===0,'Import-only snapshot cannot contain attachments');
      const checked=validateRoster(book,snapshot,[]),bound=bind(checked);reject(!bound.needs.length&&!bound.errors.length,JSON.stringify({needs:bound.needs,errors:bound.errors}));saved=bound.state;return clone(saved);},
    snapshot(){reject(saved,'No imported EC roster');return clone(saved);}};
  return service;
}
export async function loadRosterImport({fetch:read=globalThis.fetch}={}){
  const response=await read(new URL('./generated/roster-import.json',import.meta.url));reject(response.ok,'Unable to load EC import input');return createECRosterImport(await response.json());
}
