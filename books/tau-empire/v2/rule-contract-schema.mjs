/** Existing T’au typed schema factory, shared by the offline producer and browser. */
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';

export function createTauRuleSchema({bindContext=context=>context}={}){
  const schema=createRuleContractSchema({stateFields:{
    attached:{contextLevel:'ROSTER',valueType:'boolean'},
    equipmentRequirementSatisfied:{contextLevel:'ROSTER',valueType:'boolean'},
    battleConditionSatisfied:{contextLevel:'BATTLE',valueType:'boolean'},
    tauStudentRecipient:{contextLevel:'ROSTER',valueType:'boolean'},
    tauPhysicalUnitInstanceId:{contextLevel:'ROSTER',valueType:'string'},
    tauPhysicalModelScopeId:{contextLevel:'ROSTER',valueType:'string'},
    tauMarkerSelected:{contextLevel:'ROSTER',valueType:'boolean'}
  }});
  return {...schema,evaluatePredicate:(predicate,context)=>schema.evaluatePredicate(predicate,bindContext(context)),
    evaluateRole:(role,conditions,context)=>schema.evaluateRole(role,conditions,bindContext(context))};
}
