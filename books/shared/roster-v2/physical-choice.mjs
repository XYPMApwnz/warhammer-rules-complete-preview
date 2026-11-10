import {resolveExecutionEffect,physicalSelectionOwner} from './recipient-execution.mjs';
import {selections,formRoster} from './context.mjs';
import {epicHeroUnitIds} from './compatibility-context.mjs';
import {getRecordedSourceIdentity,sameSourceEvidence,sourceSnapshot,copySourceEvidence} from '../source-refs-v2/source-refs.mjs';

const requireChoice=(ok,message)=>{if(!ok)throw new TypeError('Physical choice binding: '+message);};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const clone=structuredClone;
export const weaponPartitionKey=(request,role)=>JSON.stringify(['weapon-quantity-portion',request.unitInstanceId,
  request.scopeId,request.selectionKey,request.canonicalProfileId,request.sourceRuleId,role]);

/** Static operations are validated once with the canonical book. Physical IDs
 * are supplied only by the existing saved selection, never stored in clauses. */
export function validatePhysicalChoiceEffect(book,rule,clause,effect){
  const binding=effect.physicalChoice;if(binding===undefined)return;
  requireChoice(binding&&['UNIT_RECIPIENTS','MODEL_WEAPON'].includes(binding.kind)&&rule.kind==='ENHANCEMENT'&&
    rule.ruleContract.kind!=='STRATAGEM'&&getRecordedSourceIdentity(rule,{book}),'unconfirmed choice source');
  const common=['kind','selectionField','selectionKey','canonicalClauseId','clauseIdPrefix','effectIdSuffix'];
  requireChoice(Object.keys(binding).sort().join()===[...common,binding.kind==='UNIT_RECIPIENTS'?'optionId':'optionIds'].sort().join()&&
    common.every(key=>typeof binding[key]==='string'&&binding[key]),'invalid choice descriptor');
  const origin=sourceSnapshot(effect,{book});
  if(binding.kind==='UNIT_RECIPIENTS'){
   const option=book.entities.find(entity=>entity.id===binding.optionId);
   requireChoice(option?.kind==='UPGRADE_OPTION'&&option.parentId===rule.id&&sameSourceEvidence(option,rule,{book})&&
    option.data.selectionRuleId===rule.id&&Number.isSafeInteger(option.data.maximumRecipients)&&option.data.maximumRecipients>0&&
    Array.isArray(option.data.recipientUnitIds)&&option.data.recipientUnitIds.length>0&&
    option.data.recipientUnitIds.every(id=>book.entities.some(entity=>entity.id===id&&entity.kind==='DATASHEET')),'unconfirmed recipient option');
   requireChoice(effect.operation==='GRANT_ABILITY'&&effect.targetBinding==='ROSTER_UNITS'&&effect.targetSubject==='UNIT'&&
     effect.unitScope==='PHYSICAL','unsupported recipient choice operation');
  }else{
   requireChoice(Array.isArray(binding.optionIds)&&binding.optionIds.length>0&&new Set(binding.optionIds).size===binding.optionIds.length&&
     binding.optionIds.every(id=>{const option=book.entities.find(entity=>entity.id===id);return option?.kind==='UPGRADE_OPTION'&&
       option.parentId===rule.id&&option.data.selectionRuleId===rule.id&&sameSourceEvidence(option,rule,{book})&&
       book.entities.some(entity=>entity.id===option.data.weaponProfileId&&entity.kind==='WEAPON_PROFILE')&&effect.weaponIds?.includes(option.data.weaponProfileId);}),
     'unconfirmed weapon options');
   requireChoice(effect.operation==='MODIFY_STAT'&&effect.targetBinding==='SOURCE_MODEL'&&effect.targetSubject==='MODEL'&&
     effect.weaponMode==='ranged','unsupported weapon choice operation');
  }
  requireChoice(rule.ruleContract.clauses.some(item=>item.id===binding.canonicalClauseId&&item!==clause)&&
    origin?.canonicalRuleId===rule.id&&origin.canonicalOwnerId===rule.parentId&&origin.canonicalClauseId===binding.canonicalClauseId&&
    same(origin.sourceEvidence,sourceSnapshot(rule,{book}))&&!origin.physicalSourcePair,'unconfirmed canonical choice origin');
  requireChoice(effect.conditions.length===0&&effect.lifetime==='WHILE_ASSIGNED','unsupported choice lifetime or conditions');
}

function weaponDecision(book,projection,rule,binding,source,decision,model){
  requireChoice(decision.sourceRuleId===rule.id&&same(decision.canonicalProfileIds,[])&&same(decision.canonicalEquipmentIds,[])&&
    decision.physicalQuantity===1&&decision.perModelQuantity===1&&decision.selectionCardinality==='MANY'&&
    sameSourceEvidence(decision,rule,{book,slot:'sourceProvenance',otherSlot:'provenance'}),'invalid weapon choice evidence');
  physicalSelectionOwner(source,model,decision);
  const reference=decision.sourceWeaponReference;
  requireChoice(reference&&Object.keys(reference).sort().join()===['unitInstanceId','scopeId','selectionKey','canonicalProfileId'].sort().join()&&
    reference.unitInstanceId===source.instanceId&&(reference.scopeId===model.scopeId||reference.scopeId===null&&source.startingStrength===1),
    'invalid weapon owner or scope');
  const options=binding.optionIds.map(id=>book.entities.find(entity=>entity.id===id));
  const option=options.find(option=>option.data.weaponProfileId===reference.canonicalProfileId);
  requireChoice(option&&same(decision.canonicalOptionIds,[option.id])&&source[binding.selectionField]?.includes(option.id),'unconfirmed weapon option identity');
  const weaponBindings=rule.ruleContract.clauses.flatMap(clause=>clause.rosterEffects||[]).map(effect=>effect.physicalChoice).filter(binding=>binding?.kind==='MODEL_WEAPON');
  const isChoice=selection=>weaponBindings.some(binding=>selection.selectionField===binding.selectionField||selection.selectionKey===binding.selectionKey);
  const inventory=[...model.selections,...(source.startingStrength===1?source.selections:[])].filter(selection=>!isChoice(selection));
  requireChoice(same(decision.sourceLoadoutEvidence,inventory),'stale weapon loadout evidence');
  const container=reference.scopeId===null?source:model;
  const matches=container.weapons.filter(weapon=>weapon.scopeId===reference.scopeId||reference.scopeId===null&&weapon.scopeId===undefined)
    .filter(weapon=>weapon.selectionKey===reference.selectionKey&&weapon.canonicalProfileId===reference.canonicalProfileId);
  requireChoice(matches.length===1&&[1,2].includes(matches[0].physicalQuantity),'unresolved or aggregate weapon selection');
  const input=container.selections.find(selection=>selection.selectionKey===reference.selectionKey);
  requireChoice(input&&input.canonicalProfileIds.includes(reference.canonicalProfileId),'unrecorded selected weapon');
  const owner=reference.scopeId===null?source:physicalSelectionOwner(source,model,input),proof=input.quantityEvidence;
  requireChoice(proof&&Number.isSafeInteger(proof.selectedQuantity)&&proof.selectedQuantity>0&&
    (reference.scopeId===null?input.physicalQuantity===proof.selectedQuantity:
      proof.modelQuantity===owner.quantity&&input.perModelQuantity===proof.selectedQuantity&&input.physicalQuantity===owner.quantity*proof.selectedQuantity),
    'weapon quantity contradicts original selection owner evidence');
  const aggregate=matches[0].physicalQuantity===2;
  if(aggregate)requireChoice(container.weapons.filter(weapon=>weapon.selectionKey===reference.selectionKey).length===1&&
    input.canonicalProfileIds.length===1&&proof.selectedQuantity===2,'unproven aggregate weapon owner');
  return {reference:clone(reference),aggregate};
}

/** Returns pending operations for the existing interpreter. No book rewriting
 * and no computed choice state: every entry is reconstructed from this roster. */
export function resolvePhysicalChoices(book,projection){
  const entries=[],partitions=[],partitioned=new Set(),epicOwners=epicHeroUnitIds(book);
  for(const rule of book.entities)for(const clause of rule.ruleContract?.clauses||[])for(const declaration of clause.rosterEffects||[]){
    const binding=declaration.physicalChoice;if(!binding)continue;
    const operation=resolveExecutionEffect(rule,clause,declaration);
    validatePhysicalChoiceEffect(book,rule,clause,operation);
    for(const source of projection.units){
      if(rule.ruleContract?.kind==='ENHANCEMENT'&&epicOwners.has(source.canonicalUnitId))continue;
      const decisions=selections(source).filter(selection=>selection.selectionField===binding.selectionField&&selection.selectionKey===binding.selectionKey);
      if(!decisions.length)continue;
      requireChoice(source.enhancementIds.includes(rule.id)&&projection.detachmentIds.includes(rule.parentId)&&decisions.length===1,'unassigned or duplicate choice source');
      const decision=decisions[0],assignment=source.enhancementAssignments?.find(item=>item.enhancementId===rule.id);
      const models=source.profiles.filter(model=>model.scopeId===decision.sourceModelScopeId);
      requireChoice(models.length===1&&models[0].quantity===1&&(!assignment||assignment.modelScopeId===models[0].scopeId)&&
        source.profiles.filter(model=>model.selections.some(row=>row.selectionKey===decision.selectionKey)).length===1&&
        models[0].selections.some(row=>same(row,decision))&&decision.sourceInstanceId===source.instanceId,'invalid physical choice MODEL owner');
      if(binding.kind==='MODEL_WEAPON'){
        const {reference,aggregate}=weaponDecision(book,projection,rule,binding,source,decision,models[0]);
        const clauseId=rule.id+binding.clauseIdPrefix+JSON.stringify(source.instanceId);
        const {physicalChoice,...effect}=operation;
        const selected=clone(reference);
        if(aggregate){
          const request={...reference,sourceRuleId:rule.id},key=JSON.stringify(request);
          if(!partitioned.has(key)){partitions.push(request);partitioned.add(key);}
          selected.selectionKey=weaponPartitionKey(request,'selected');
        }
        entries.push({rule,declarationClause:clause,declaration,clause:{...clause,id:clauseId},source,ownerModel:models[0],
          physicalTarget:{unit:source,model:models[0]},weaponChoice:selected,
          effect:{...effect,id:clauseId+binding.effectIdSuffix,weaponIds:[reference.canonicalProfileId],
            conditions:[{binding:'SOURCE',predicate:{predicate:'FIELD',subject:'UNIT',contextLevel:'ROSTER',
              arguments:{key:'physicalUnitInstanceId',equals:source.instanceId},evidence:clone(operation.evidence)}}]}});
        continue;
      }
      requireChoice(
        decision.physicalQuantity===1&&decision.perModelQuantity===1&&decision.selectionCardinality==='MANY'&&
        same(decision.canonicalOptionIds,[binding.optionId])&&same(decision.canonicalProfileIds,[])&&same(decision.canonicalEquipmentIds,[])&&
        same(decision.sourceChoiceReference,{bookId:book.bookId,entityId:rule.id,path:'/text'})&&
        sameSourceEvidence(decision,rule,{book,slot:'sourceProvenance',otherSlot:'provenance'}),'invalid physical source choice evidence');
      const option=book.entities.find(entity=>entity.id===binding.optionId),ids=decision.recipientInstanceIds;
      requireChoice(Array.isArray(ids)&&ids.length<=option.data.maximumRecipients&&new Set(ids).size===ids.length&&
        ids.every(id=>typeof id==='string'&&option.data.recipientUnitIds.includes(projection.units.find(unit=>unit.instanceId===id)?.canonicalUnitId)),
        'unconfirmed physical recipients');
      for(const id of [...ids].sort()){
        const pair={sourceInstanceId:source.instanceId,recipientInstanceId:id,sourceModelScopeId:decision.sourceModelScopeId};
        const clauseId=rule.id+binding.clauseIdPrefix+JSON.stringify([source.instanceId,id]);
        const conditions=[['SOURCE',source.instanceId],['TARGET',id]].map(([binding,id])=>({binding,
          predicate:{predicate:'FIELD',subject:'UNIT',contextLevel:'ROSTER',arguments:{key:'physicalUnitInstanceId',equals:id},evidence:clone(operation.evidence)}}));
        const {physicalChoice,...effect}=operation;
        entries.push({rule,declarationClause:clause,declaration,clause:{...clause,id:clauseId},source,ownerModel:models[0],
          physicalTarget:{unit:projection.units.find(unit=>unit.instanceId===id)},
          effect:{...effect,id:clauseId+binding.effectIdSuffix,conditions,...copySourceEvidence({provenance:{
            canonicalRuleId:rule.id,canonicalOwnerId:rule.parentId,canonicalClauseId:binding.canonicalClauseId,
            sourceEvidence:sourceSnapshot(rule,{book}),physicalSourcePair:pair}},{book})}});
      }
    }
  }
  return {entries,partitions};
}
export const resolvePhysicalChoiceEffects=(book,projection)=>resolvePhysicalChoices(book,projection).entries;

/** Never trust an applied-row alias without regenerating its exact source and
 * physical recipient from the current validated roster projection. */
export function resolvePhysicalChoiceAttribution(book,projection,row){
  // Restore physical inventory from saved rows before any derived partition or
  // characteristic mutation. Applied rows are never an addressing authority.
  const physical=formRoster(book,{...projection,attachments:[]});
  const matches=resolvePhysicalChoiceEffects(book,physical).filter(entry=>entry.rule.id===row.ruleId&&entry.clause.id===row.clauseId&&
    entry.effect.id===row.effectId&&entry.source.instanceId===row.sourceInstanceId&&entry.physicalTarget.unit.instanceId===row.targetInstanceId&&
    (!entry.weaponChoice||entry.weaponChoice.canonicalProfileId===row.targetWeaponProfileId&&
      entry.weaponChoice.selectionKey===row.targetWeaponSelectionKey&&(entry.weaponChoice.scopeId??null)===(row.targetWeaponScopeId??null)));
  requireChoice(matches.length===1,'unresolved executed choice attribution');return matches[0].effect;
}
