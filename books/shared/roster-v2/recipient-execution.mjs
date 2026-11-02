import {resolveRecipient} from '../rule-contract-v2/recipients.mjs';
import {getRecordedSourceIdentity,sameSourceEvidence,sourceSnapshot,copySourceEvidence} from '../source-refs-v2/source-refs.mjs';

const legacyAddressFields=['targetBinding','targetSubject','unitScope','recipientSelectors','containingUnitScope',
  'targetRoleId','recipientRoleId','recipientRoleIds','recipientIds'];
export const executionBindingSubjects=Object.freeze({SOURCE_MODEL:'MODEL',SOURCE_UNIT:'UNIT',SOURCE_UNIT_MODELS:'MODEL',
  SOURCE_FORMED_MODELS:'MODEL',LEADERS_OF_SOURCE:'MODEL',ROSTER_UNITS:'UNIT',ROSTER_MODELS:'MODEL'});
/** Resolve only canonical recipient references. These aliases are a disposable
 * execution view for the existing operations, never a second canonical format.
 * In particular an absent scope stays absent: old unscoped metric projection
 * has observable behaviour distinct from an explicitly scoped UNIT metric. */
export function resolveExecutionEffect(rule,clause,effect) {
  if(clause?.recipientStatus!=='RECORDED'||!effect||typeof effect.recipientId!=='string'||!effect.recipientId||
      legacyAddressFields.some(field=>Object.hasOwn(effect,field)))
    throw new TypeError('Roster effect requires a canonical recipient reference');
  const recipient=resolveRecipient(rule,clause,effect.recipientId);
  if(!recipient||!['MODEL','UNIT'].includes(recipient.who)||executionBindingSubjects[recipient.from]!==recipient.who||
      recipient.side!=='FRIENDLY'||recipient.how!=='ROSTER')
    throw new TypeError('Executable effect requires a friendly roster recipient');
  return {...effect,targetBinding:recipient.from,targetSubject:recipient.who,
    ...(recipient.scope===undefined?{}:{unitScope:recipient.scope}),
    ...(recipient.recipientSelectors===undefined?{}:{recipientSelectors:recipient.recipientSelectors}),
    ...(recipient.containingUnitScope===undefined?{}:{containingUnitScope:recipient.containingUnitScope})};
}

const requirePhysical=(ok,message)=>{if(!ok)throw new TypeError('Physical selection binding: '+message);};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const at=(value,keys)=>keys.reduce((item,key)=>item?.[key],value);

/** formRoster inherits row selections into every LOADOUT/PROFILE group. Their
 * inventory proof still belongs to the original row, while a loadout selection
 * belongs only to that loadout. Resolve recorded owners, never divide inventory
 * or infer ownership from a profile ID or the derived group's model count. */
function physicalSelectionOwner(unit,model,selection){
  const groups=[];
  for(const row of unit.modelRows){
    const allocated=(row.loadouts||[]).reduce((sum,loadout)=>sum+loadout.quantity,0);
    const remaining=row.quantity-allocated;
    if(remaining>0&&model.scopeId===`${unit.instanceId}/${row.rowId}/PROFILE/${row.rowId}`)
      groups.push({row,quantity:remaining,owners:[row]});
    for(const loadout of row.loadouts||[])if(loadout.quantity>0&&model.scopeId===`${unit.instanceId}/${row.rowId}/LOADOUT/${loadout.loadoutId}`)
      groups.push({row,quantity:loadout.quantity,owners:[row,loadout]});
  }
  requirePhysical(groups.length===1&&model.unitInstanceId===unit.instanceId&&model.canonicalUnitId===unit.canonicalUnitId&&
    groups[0].row.canonicalProfileId===model.canonicalProfileId&&model.quantity===groups[0].quantity,
    'unresolved derived physical MODEL group');
  const matches=groups[0].owners.flatMap(owner=>(owner.selections||[]).filter(record=>same(record,selection)).map(()=>owner));
  requirePhysical(matches.length>0,'selection has no recorded physical owner');
  requirePhysical(matches.length===1,'duplicate physical equipment selection');
  return matches[0];
}

/** A producer prepares the operation once. This descriptor only addresses an
 * existing physical equipment occurrence; it never supplies another recipient
 * format, an executable callback, or a saved computed result. */
export function validatePhysicalSelectionEffect(book,rule,clause,effect){
  const binding=effect.physicalSelection;if(binding===undefined)return;
  requirePhysical(rule.kind!=='STRATAGEM'&&rule.ruleContract.kind!=='STRATAGEM','excluded rule kind');
  requirePhysical(binding&&Object.getPrototypeOf(binding)===Object.prototype&&
    Object.keys(binding).sort().join()===['clauseIdPrefix','effectIdSuffix','equipmentId','kind'].sort().join()&&
    binding.kind==='MODEL_EQUIPMENT_QUANTITY','unknown descriptor');
  requirePhysical(typeof binding.equipmentId==='string'&&binding.equipmentId&&
    typeof binding.clauseIdPrefix==='string'&&binding.clauseIdPrefix&&
    typeof binding.effectIdSuffix==='string'&&/^\/[\w-]+$/.test(binding.effectIdSuffix),'missing source/trace identity');
  const root=book.entities.find(entity=>entity.id===binding.equipmentId),proof=effect.sourceRuleEvidence?.evidence;
  requirePhysical(rule.kind==='WARGEAR_OPTION'&&root&&getRecordedSourceIdentity(root,{book})&&getRecordedSourceIdentity(rule,{book})&&
    rule.ruleContract.canonicalRuleReferences?.includes(root.id)&&effect.referencedRuleId===root.id,'missing equipment source reference');
  requirePhysical(proof?.otherEntityId===root.id&&Array.isArray(proof.field)&&typeof proof.quote==='string'&&proof.quote&&
    typeof at(root.data,proof.field)==='string'&&at(root.data,proof.field).includes(proof.quote),'unproven equipment operation');
  requirePhysical(effect.targetBinding==='SOURCE_UNIT_MODELS'&&effect.targetSubject==='MODEL'&&
    effect.operation==='MODIFY_STAT'&&effect.mode==='ADD'&&Number.isSafeInteger(effect.value)&&effect.value>0&&
    effect.lifetime==='WHILE_EQUIPPED'&&effect.conditions.length===0,'unsupported physical operation');
  const origin=sourceSnapshot(effect,{book});
  requirePhysical(origin?.canonicalRuleId===root.id&&origin.canonicalOwnerId===(root.parentId||book.bookId)&&
    typeof origin.canonicalClauseId==='string'&&origin.canonicalClauseId&&same(origin.sourceEvidence,sourceSnapshot(root,{book}))&&
    !Object.hasOwn(origin,'physicalEquipmentReference'),'unproven canonical equipment origin');
}

/** Resolve disposable pending entries, not clauses in a rewritten book. The
 * canonical operation/recipient remain the producer's validated declaration.
 * Physical trace aliases preserve existing saved evidence and presentation. */
export function resolvePhysicalSelectionEffects(book,projection){
  const declarations=[],byEquipment=new Map();
  for(const rule of book.entities)for(const clause of rule.ruleContract?.clauses||[])for(const declaration of clause.rosterEffects||[]){
    if(declaration.physicalSelection===undefined)continue;
    const effect=resolveExecutionEffect(rule,clause,declaration);
    validatePhysicalSelectionEffect(book,rule,clause,effect);
    const item={rule,clause,declaration,effect},id=effect.physicalSelection.equipmentId;
    declarations.push(item);if(!byEquipment.has(id))byEquipment.set(id,[]);byEquipment.get(id).push(item);
  }
  if(!declarations.length)return [];
  const entries=[],seen=new Set();
  for(const unit of projection.units){
    for(const selection of unit.selections)if(byEquipment.has(selection.sourceEquipmentIdentity))
      requirePhysical(selection.sourceModelScopeId===undefined,'UNIT inventory has no confirmed MODEL scope');
    for(const model of unit.profiles)for(const selection of model.selections){
      const candidates=byEquipment.get(selection.sourceEquipmentIdentity);
      if(!candidates||selection.physicalQuantity===0)continue;
      requirePhysical((selection.sourceModelScopeId===undefined||selection.sourceModelScopeId===model.scopeId)&&
        (selection.sourceInstanceId===undefined||selection.sourceInstanceId===unit.instanceId),'foreign or stale physical MODEL scope');
      const quantity=selection.perModelQuantity,root=book.entities.find(entity=>entity.id===selection.sourceEquipmentIdentity);
      requirePhysical(Number.isSafeInteger(quantity)&&quantity>0&&sameSourceEvidence(selection,root,{book,slot:'sourceEquipmentProvenance',otherSlot:'provenance'}),
        'requires confirmed per-MODEL quantity and source evidence');
      const owner=physicalSelectionOwner(unit,model,selection);
      requirePhysical(Number.isSafeInteger(owner.quantity)&&owner.quantity>0&&selection.physicalQuantity===owner.quantity*quantity&&
        selection.quantityEvidence?.selectedQuantity===quantity&&selection.quantityEvidence.modelQuantity===owner.quantity,
        'physical quantity contradicts MODEL selection evidence');
      requirePhysical(selection.canonicalEquipmentIds.length===1,'ambiguous equipment source occurrence');
      const matches=candidates.filter(item=>item.rule.id===selection.canonicalEquipmentIds[0]&&item.rule.parentId===unit.canonicalUnitId);
      requirePhysical(matches.length===1,'missing or duplicate local equipment binding');
      const {rule,clause,declaration,effect}=matches[0],binding=effect.physicalSelection;
      requirePhysical(Number.isSafeInteger(effect.value*quantity),'unsafe physical effect quantity');
      const identity=JSON.stringify([unit.instanceId,model.scopeId,selection.selectionKey]);
      requirePhysical(!seen.has(identity),'duplicate physical equipment selection');seen.add(identity);
      const clauseId=rule.id+binding.clauseIdPrefix+identity;
      const origin=sourceSnapshot(effect,{book}),physicalEquipmentReference={entityId:rule.id,provenance:sourceSnapshot(rule,{book}),
        unitInstanceId:unit.instanceId,modelScopeId:model.scopeId,selectionKey:selection.selectionKey,perModelQuantity:quantity};
      const proof=effect.evidence;
      const conditions=[['SOURCE','UNIT','physicalUnitInstanceId',unit.instanceId],['TARGET','MODEL','physicalModelScopeId',model.scopeId]]
        .map(([binding,subject,key,equals])=>({binding,predicate:{predicate:'FIELD',subject,contextLevel:'ROSTER',arguments:{key,equals},evidence:structuredClone(proof)}}));
      const {physicalSelection,...operation}=effect;
      entries.push({rule,declarationClause:clause,declaration,clause:{...clause,id:clauseId},source:unit,physicalTarget:{unit,model},
        effect:{...operation,id:clauseId+binding.effectIdSuffix,value:effect.value*quantity,conditions,
          ...copySourceEvidence({provenance:{...origin,physicalEquipmentReference}},{book})}});
    }
  }
  return entries;
}

/** Attribution accepts only an alias regenerated from the current physical
 * projection. It never trusts an encoded ID or an applied-row source payload. */
export function resolvePhysicalSelectionAttribution(book,projection,row){
  const matches=resolvePhysicalSelectionEffects(book,projection).filter(entry=>entry.rule.id===row.ruleId&&entry.clause.id===row.clauseId&&
    entry.effect.id===row.effectId&&entry.source.instanceId===row.sourceInstanceId&&entry.physicalTarget.unit.instanceId===row.targetInstanceId&&
    entry.physicalTarget.model.scopeId===row.targetCompositionId&&entry.physicalTarget.model.canonicalProfileId===row.targetProfileId&&
    entry.physicalTarget.model.modelInstanceId===row.targetModelInstanceId);
  requirePhysical(matches.length===1,'unresolved executed MODEL attribution');return matches[0].effect;
}
