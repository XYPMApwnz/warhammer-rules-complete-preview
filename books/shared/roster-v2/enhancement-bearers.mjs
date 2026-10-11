import {formRoster,predicateContext} from './context.mjs';
import {enhancementOwnerContext} from './compatibility-context.mjs';

/** Resolve only explicitly chosen MODEL bearers when imported unit ownership
 * is insufficient. This collects UI choices; it never executes an effect. */
export function bindImportedEnhancementBearers(book,input,{evaluatePredicate},choices={}) {
  const state=structuredClone(input),projection=formRoster(book,state),records=new Map(book.entities.map(entity=>[entity.id,entity])),needs=[];
  for(const unit of state.units)for(const enhancementId of unit.enhancementIds){
    const contract=records.get(enhancementId)?.ruleContract;
    if(!contract?.assignment||contract.roles.find(role=>role.id===contract.assignment.ownerRoleId)?.subject!=='MODEL')continue;
    if(unit.enhancementAssignments?.some(assignment=>assignment.enhancementId===enhancementId))continue;
    const projected=projection.units.find(candidate=>candidate.instanceId===unit.instanceId);
    const eligible=projected.profiles.filter(profile=>evaluatePredicate(contract.assignment.selector,
      enhancementOwnerContext(contract,predicateContext(state,projection,unit.instanceId,'MODEL',profile.scopeId)))==='TRUE');
    if(eligible.length===1&&eligible[0].quantity===1)continue; // Existing runtime already resolves this exact owner.
    if(!eligible.length)continue;
    const key=JSON.stringify([unit.instanceId,enhancementId]),selected=choices[key];
    const candidates=eligible.filter(profile=>profile.quantity===1).map(profile=>({id:profile.scopeId,
      title:records.get(profile.canonicalProfileId)?.data.composition?.name||records.get(profile.canonicalProfileId)?.data.name||records.get(profile.canonicalProfileId)?.displayName}));
    if(selected){
      if(!candidates.some(candidate=>candidate.id===selected))throw new TypeError('Unresolved explicit Enhancement bearer');
      unit.enhancementAssignments||=[];unit.enhancementAssignments.push({enhancementId,modelScopeId:selected});
    }else needs.push({kind:'ENHANCEMENT_BEARER',key,rawLabel:records.get(enhancementId).displayName||records.get(enhancementId).data.title,
      ownerId:unit.canonicalUnitId,candidates});
  }
  return {state,needsBindings:needs};
}
