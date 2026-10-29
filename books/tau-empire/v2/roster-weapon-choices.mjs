import {finalizeRecipientBook} from '../../shared/rule-contract-v2/finalize-recipients.mjs';
import {recipientDeclarationView} from '../../shared/rule-contract-v2/recipients.mjs';
/** T'au-owned decisions over existing physical selections; no weapon IDs or
 * infantry instances are invented to split aggregate inventory. */
import {formRoster,selections} from '../../shared/roster-v2/context.mjs';
import {weaponPartitionKey} from '../../shared/roster-v2/effects.mjs';
import {pendingPhysicalBindings} from './rule-contract-declarations.mjs';

const clone=structuredClone,assert=(ok,message)=>{if(!ok)throw new TypeError(message);};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export const tauPrototypeField='selectedTauWeaponChoiceIds';
const optionId=(ruleId,weaponId)=>ruleId+'::choice::weapon/'+weaponId;
export const tauPrototypeDecisions=unit=>selections(unit).filter(selection=>selection.selectionField===tauPrototypeField||
  pendingPhysicalBindings.some(spec=>selection.selectionKey==='weapon-choice/'+spec.ruleId));
const loadoutEvidence=(model,unit)=>clone([...model.selections,...(unit.startingStrength===1?unit.selections:[])]
  .filter(selection=>!tauPrototypeDecisions({selections:[selection]}).length));

export function addTauPrototypeChoices(book){
  const records=new Map(book.entities.map(entity=>[entity.id,entity]));
  for(const spec of pendingPhysicalBindings){
    const rule=records.get(spec.ruleId);
    assert(rule?.kind==='ENHANCEMENT'&&rule.parentId===spec.ownerId&&rule.provenance?.sourceId,'Unconfirmed Prototype source');
    for(const weaponId of spec.eligibleWeaponProfileIds){
      assert(records.get(weaponId)?.kind==='WEAPON_PROFILE','Unconfirmed Prototype weapon');
      const option={id:optionId(rule.id,weaponId),kind:'UPGRADE_OPTION',parentId:rule.id,
        authority:'SOURCE_BACKED_SELECTION_BINDING',data:{selectionRuleId:rule.id,weaponProfileId:weaponId},provenance:clone(rule.provenance)};
      assert(!records.has(option.id),'Duplicate Prototype choice');
      book.entities.push(option);book.rosterSelectionOptions.push(option);
    }
  }
  return book;
}

export function validateTauPrototypeChoices(book,state){
  const records=new Map(book.entities.map(entity=>[entity.id,entity])),physical=formRoster(book,state),validated=[];
  for(const unit of state.units){
    const ids=unit[tauPrototypeField]??[],decisions=tauPrototypeDecisions(unit),seen=new Set();
    assert(Array.isArray(ids)&&new Set(ids).size===ids.length&&ids.length===decisions.length,'Prototype choice field/selection mismatch');
    for(const decision of decisions){
      const spec=pendingPhysicalBindings.find(spec=>spec.ruleId===decision.sourceRuleId),rule=records.get(spec?.ruleId);
      assert(spec&&unit.enhancementIds.includes(rule.id)&&state.detachmentIds.includes(rule.parentId)&&!seen.has(rule.id),
        'Prototype requires one assigned physical Enhancement source');seen.add(rule.id);
      const projected=physical.units.find(item=>item.instanceId===unit.instanceId);
      const assignment=unit.enhancementAssignments?.find(item=>item.enhancementId===rule.id);
      const model=projected.profiles.find(model=>model.scopeId===assignment?.modelScopeId);
      assert(model?.quantity===1&&decision.sourceInstanceId===unit.instanceId&&decision.sourceModelScopeId===model.scopeId&&
        projected.profiles.filter(profile=>profile.selections.some(row=>row.selectionKey===decision.selectionKey)).length===1,
        'Invalid Prototype physical MODEL source');
      // Projection clones selections; compare the full persisted decision.
      assert(model.selections.some(row=>same(row,decision)),'Prototype decision has no confirmed MODEL owner');
      assert(same(decision.sourceLoadoutEvidence,loadoutEvidence(model,unit)),
        'Stale Prototype physical loadout evidence; select the weapon again');
      const reference=decision.sourceWeaponReference,selected=reference?.canonicalProfileId;
      const expectedOption=optionId(rule.id,selected),option=records.get(expectedOption);
      assert(reference&&Object.keys(reference).length===4&&reference.unitInstanceId===unit.instanceId&&
        (reference.scopeId===model.scopeId||reference.scopeId===null&&unit.startingStrength===1)&&
        spec.eligibleWeaponProfileIds.includes(selected)&&option?.parentId===rule.id&&ids.includes(expectedOption)&&
        option.data.selectionRuleId===rule.id&&option.data.weaponProfileId===selected&&
        same(option.provenance,rule.provenance)&&same(decision.canonicalOptionIds,[expectedOption])&&
        same(decision.canonicalProfileIds,[])&&same(decision.canonicalEquipmentIds,[])&&
        decision.physicalQuantity===1&&decision.perModelQuantity===1&&decision.selectionField===tauPrototypeField&&
        decision.selectionCardinality==='MANY'&&decision.selectionKey==='weapon-choice/'+rule.id&&
        same(decision.sourceProvenance,rule.provenance),'Invalid Prototype weapon choice evidence');
      const weapons=[...model.weapons,...(unit.startingStrength===1?projected.weapons:[])];
      const matches=weapons.filter(weapon=>(weapon.scopeId??null)===reference.scopeId&&
        weapon.selectionKey===reference.selectionKey&&weapon.canonicalProfileId===selected);
      assert(matches.length===1&&[1,2].includes(matches[0].physicalQuantity),'Prototype needs one exact weapon or confirmed quantity-two aggregate');
      const aggregate=matches[0].physicalQuantity===2;
      const inventory=reference.scopeId===null?projected:model;
      const input=inventory.selections.find(row=>row.selectionKey===reference.selectionKey);
      if(aggregate)assert(inventory.weapons.filter(row=>row.selectionKey===reference.selectionKey).length===1&&
        input?.physicalQuantity===2&&input.canonicalProfileIds.length===1&&input.canonicalProfileIds[0]===selected&&
        input.quantityEvidence?.selectedQuantity===2&&(reference.scopeId===null||input.perModelQuantity===2),
        'Unproven Prototype aggregate quantity/owner');
      validated.push({unitInstanceId:unit.instanceId,ruleId:rule.id,modelScopeId:model.scopeId,reference:clone(reference),spec,aggregate});
    }
  }
  const aggregates=validated.filter(choice=>choice.aggregate).map(choice=>JSON.stringify(choice.reference));
  assert(new Set(aggregates).size===aggregates.length,'Conflicting Prototype aggregate choices');
  return validated;
}

export function setTauPrototypeChoice(book,snapshot,sourceInstanceId,ruleId,reference){
  const state=clone(snapshot),unit=state.units.find(unit=>unit.instanceId===sourceInstanceId);
  const spec=pendingPhysicalBindings.find(spec=>spec.ruleId===ruleId);
  assert(unit&&spec,'Unknown Prototype physical source');
  const old=tauPrototypeDecisions(unit).filter(decision=>decision.sourceRuleId===ruleId);
  unit[tauPrototypeField]=(unit[tauPrototypeField]||[]).filter(id=>!old.some(decision=>decision.canonicalOptionIds.includes(id)));
  for(const container of [unit,...unit.modelRows,...unit.modelRows.flatMap(row=>row.loadouts||[])])
    container.selections=(container.selections||[]).filter(selection=>!old.some(decision=>decision.selectionKey===selection.selectionKey));
  if(reference!==null){
    const assignment=unit.enhancementAssignments?.find(item=>item.enhancementId===ruleId);
    const model=formRoster(book,state).units.find(item=>item.instanceId===sourceInstanceId).profiles.find(model=>model.scopeId===assignment?.modelScopeId);
    assert(model?.quantity===1,'Prototype requires exact Enhancement MODEL assignment');
    const scope=model.scopeId,container=unit.modelRows.flatMap(row=>[{scope:`${unit.instanceId}/${row.rowId}/PROFILE/${row.rowId}`,value:row},
      ...(row.loadouts||[]).map(loadout=>({scope:`${unit.instanceId}/${row.rowId}/LOADOUT/${loadout.loadoutId}`,value:loadout}))]).find(row=>row.scope===scope)?.value;
    assert(container,'Unresolved Prototype physical source container');
    const id=optionId(ruleId,reference?.canonicalProfileId),rule=book.entities.find(entity=>entity.id===ruleId);
    unit[tauPrototypeField].push(id);
    container.selections.push({selectionKey:'weapon-choice/'+ruleId,physicalQuantity:1,perModelQuantity:1,
      canonicalProfileIds:[],canonicalEquipmentIds:[],canonicalOptionIds:[id],selectionField:tauPrototypeField,selectionCardinality:'MANY',
      sourceRuleId:ruleId,sourceInstanceId,sourceModelScopeId:scope,sourceWeaponReference:clone(reference),sourceProvenance:clone(rule.provenance)});
    container.selections.at(-1).sourceLoadoutEvidence=loadoutEvidence(model,unit);
  }
  validateTauPrototypeChoices(book,state);return state;
}

export function bindTauPrototypeChoices(book,state){
  const choices=validateTauPrototypeChoices(book,state),result=recipientDeclarationView(book);
  for(const spec of pendingPhysicalBindings){
    const rule=result.entities.find(entity=>entity.id===spec.ruleId);
    rule.ruleContract.clauses=rule.ruleContract.clauses.filter(clause=>!clause.physicalWeaponSource);
    assert(rule.ruleContract.clauses.every(clause=>clause.rosterEffects.length===0),'Prototype canonical template must remain non-executable');
  }
  for(const choice of choices){
    const rule=result.entities.find(entity=>entity.id===choice.ruleId),template=rule.ruleContract.clauses[0];
    const clause=clone(template),proof={field:['text'],quote:rule.data.text};
    clause.id=rule.id+'::physical-source/'+JSON.stringify(choice.unitInstanceId);clause.rosterClassification='ROSTER_EXECUTABLE';
    clause.physicalWeaponSource=choice.unitInstanceId;
    clause.rosterClassificationNote={reason:'Validated physical weapon choice; quantity-two partition exists only in the effective projection',canonicalClauseId:template.id};
    clause.rosterEffects=choice.spec.operationSpecs.map((operation,index)=>({id:clause.id+'/effect-'+(index+1),...clone(operation),
      targetBinding:'SOURCE_MODEL',targetSubject:'MODEL',weaponIds:[choice.reference.canonicalProfileId],weaponMode:'ranged',
      conditions:[{binding:'SOURCE',predicate:{predicate:'FIELD',subject:'UNIT',contextLevel:'ROSTER',
        arguments:{key:'tauPhysicalUnitInstanceId',equals:choice.unitInstanceId},evidence:clone(proof)}}],
      sourceFields:[['text']],evidence:clone(proof),lifetime:'WHILE_ASSIGNED',
      provenance:{canonicalRuleId:rule.id,canonicalOwnerId:rule.parentId,canonicalClauseId:template.id,sourceEvidence:clone(rule.provenance)}}));
    rule.ruleContract.clauses.push(clause);
  }
  return finalizeRecipientBook(result);
}

export function tauWeaponSelectionResolver(book,state){
  const choices=validateTauPrototypeChoices(book,state);
  return ({rule,source})=>pendingPhysicalBindings.some(spec=>spec.ruleId===rule.id)?
    (()=>{const choice=choices.find(choice=>choice.ruleId===rule.id&&choice.unitInstanceId===source?.instanceId);
      if(!choice)return null;
      const reference=clone(choice.reference);
      if(choice.aggregate)reference.selectionKey=weaponPartitionKey({...reference,sourceRuleId:choice.ruleId},'selected');
      return reference;})():undefined;
}

export function tauWeaponPartitionResolver(book,state){
  const choices=validateTauPrototypeChoices(book,state).filter(choice=>choice.aggregate);
  return ()=>choices.map(choice=>({...clone(choice.reference),sourceRuleId:choice.ruleId}));
}
