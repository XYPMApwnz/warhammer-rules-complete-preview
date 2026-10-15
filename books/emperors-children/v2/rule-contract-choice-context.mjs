/** Bind the existing canonical option state to existing FIELD predicates.
 * This validates one explicit decision; it never chooses an equipped weapon. */
const assert=(ok,message)=>{if(!ok)throw new TypeError(message);};
import {formRoster,selections,predicateContext} from '../../shared/roster-v2/context.mjs';
import {enhancementOwnerContext} from '../../shared/roster-v2/compatibility-context.mjs';
import {bladeId,bladeField} from './rule-contract-schema.mjs';

export function weaponChoiceContext(book,state,schema) {
  const options=new Map((book.rosterSelectionOptions||[]).map(o=>[o.id,o])),chosen=new Map();
  if(!options.size)return context=>context;
  const projection=formRoster(book,state),rule=book.entities.find(e=>e.id===bladeId),records=new Map(book.entities.map(e=>[e.id,e]));
  for(const unit of state.units) {
    if(unit.selectedUpgradeIds!==undefined)assert(Array.isArray(unit.selectedUpgradeIds),'Malformed canonical choice list');
    const ids=(unit.selectedUpgradeIds||[]).filter(id=>{
      assert(records.get(id)?.kind==='UPGRADE_OPTION','Unknown canonical choice');return options.has(id);
    });
    const choiceRecords=selections(unit).filter(s=>(s.canonicalOptionIds||[]).some(id=>options.has(id)));
    const selected=choiceRecords.flatMap(s=>s.canonicalOptionIds||[]).filter(id=>options.has(id));
    assert(JSON.stringify([...new Set(selected)].sort())===JSON.stringify([...ids].sort()),'Canonical choice state and selection disagree');
    assert(ids.length<=1,'Select exactly one Possessed Blade weapon');
    assert(selected.length<=1,'Duplicate Possessed Blade selection');
    if(!ids.length)continue;
    assert(choiceRecords[0].physicalQuantity===1&&choiceRecords[0].canonicalProfileIds.length===0&&
      choiceRecords[0].canonicalEquipmentIds.length===0,'Weapon decision cannot add equipment or multiple choices');
    const option=options.get(ids[0]);assert(option.data.unitId===unit.canonicalUnitId,'Foreign weapon choice owner');
    if(!unit.enhancementIds.includes(bladeId))continue; // stale input cannot grant an unassigned Enhancement
    const physical=projection.units.find(u=>u.instanceId===unit.instanceId),assignment=unit.enhancementAssignments?.find(a=>a.enhancementId===bladeId);
    const eligible=physical.profiles.filter(model=>!assignment||model.scopeId===assignment.modelScopeId).filter(model=>
      schema.evaluatePredicate(rule.ruleContract.assignment.selector,enhancementOwnerContext(rule.ruleContract,
        predicateContext(state,projection,unit.instanceId,'MODEL',model.scopeId)))==='TRUE');
    assert(eligible.length===1&&eligible[0].quantity===1,'Ambiguous Possessed Blade MODEL bearer');
    const model=eligible[0],weaponId=option.data.weaponProfileId;
    const localChoices=model.selections.flatMap(s=>s.canonicalOptionIds||[]);
    assert(localChoices.includes(option.id)||unit.startingStrength===1,'Weapon choice has no physical bearer binding');
    const weapons=[...model.weapons,...(unit.startingStrength===1?physical.weapons:[])];
    const matching=weapons.filter(w=>w.canonicalProfileId===weaponId&&w.physicalQuantity>0&&w.data.mode==='melee');
    assert(matching.length===1&&matching[0].physicalQuantity===1,
      'Selected Possessed Blade weapon is not equipped by the bearer');
    chosen.set(unit.instanceId,option.id);
  }
  return context=>{
    if(context?.subject!=='MODEL')return context;
    const roster={...context.roster};delete roster[bladeField];
    if(chosen.has(context.instanceId))roster[bladeField]=chosen.get(context.instanceId);
    return {...context,roster};
  };
}
