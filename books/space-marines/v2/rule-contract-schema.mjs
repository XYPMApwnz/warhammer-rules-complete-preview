/** Existing typed V2 applicability vocabulary; no Space Marines operations. */
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';

export function createSpaceMarinesRuleSchema({bindContext=context=>context}={}){
  const schema=createRuleContractSchema({stateFields:{
    attached:{contextLevel:'ROSTER',valueType:'boolean'},
    equipmentRequirementSatisfied:{contextLevel:'ROSTER',valueType:'boolean'},
    smEquipmentBearerSatisfied:{contextLevel:'ROSTER',valueType:'boolean'},
    smPhysicalUnitInstanceId:{contextLevel:'ROSTER',valueType:'string'},
    smPhysicalModelScopeId:{contextLevel:'ROSTER',valueType:'string'},
    battleConditionSatisfied:{contextLevel:'BATTLE',valueType:'boolean'}
  }});
  return {...schema,
    evaluatePredicate:(predicate,context)=>schema.evaluatePredicate(predicate,bindContext(context,predicate)),
    evaluateRole:(role,conditions,context)=>schema.evaluateRole(role,conditions,bindContext(context))};
}
