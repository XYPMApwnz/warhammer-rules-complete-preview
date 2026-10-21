/** Existing V2 predicates only. Physical presence is derived from actual rows;
 * no Chapter assertion is accepted from book, Detachment, attachment or extras. */
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';
import {physicalPresenceBindings} from './rule-contract-declarations.mjs';
export function createDarkAngelsRuleSchema({state}={}){
 const stateFields={};
 for(const key of ['attached','equipmentRequirementSatisfied','smEquipmentBearerSatisfied','smPermanentAssaultSource','daAncientPresent','daChampionPresent'])stateFields[key]={contextLevel:'ROSTER',valueType:'boolean'};
 for(const key of ['smPhysicalUnitInstanceId','smPhysicalModelScopeId'])stateFields[key]={contextLevel:'ROSTER',valueType:'string'};
 stateFields.battleConditionSatisfied={contextLevel:'BATTLE',valueType:'boolean'};
 const schema=createRuleContractSchema({stateFields,modelAbilities:['Deep Strike']});
 const bind=context=>{
  if(!context)return context;
  const roster={...context.roster};
  // Caller extras cannot substitute for the verified physical source row.
  delete roster.daAncientPresent;delete roster.daChampionPresent;
  if(state){
   const unit=state.units.find(unit=>unit.instanceId===context.instanceId);
   for(const [key,proof]of Object.entries(physicalPresenceBindings))
    roster[key]=Boolean(unit&&unit.canonicalUnitId===proof.unitId&&unit.modelRows.some(row=>row.canonicalProfileId===proof.profileId&&Number.isSafeInteger(row.quantity)&&row.quantity>0));
  }
  return {...context,roster};
 };
 return {...schema,evaluatePredicate:(node,context)=>schema.evaluatePredicate(node,bind(context)),
  evaluateRole:(role,conditions,context)=>schema.evaluateRole(role,conditions,bind(context))};
}
