/** Existing T’au typed schema factory, shared by the offline producer and browser. */
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';
import {createRosterConditionBinding} from '../../shared/roster-v2/condition-binding.mjs';

export function createTauRuleSchema({book,state,inputs=[]}={}){
  const schema=createRuleContractSchema({stateFields:{
    attached:{contextLevel:'ROSTER',valueType:'boolean'},
    equipmentRequirementSatisfied:{contextLevel:'ROSTER',valueType:'boolean'},
    battleConditionSatisfied:{contextLevel:'BATTLE',valueType:'boolean'},
    tauStudentRecipient:{contextLevel:'ROSTER',valueType:'boolean'},
    tauPhysicalUnitInstanceId:{contextLevel:'ROSTER',valueType:'string'},
    tauPhysicalModelScopeId:{contextLevel:'ROSTER',valueType:'string'},
    tauMarkerSelected:{contextLevel:'ROSTER',valueType:'boolean'}
  }});
  return createRosterConditionBinding({book,state,schema,inputs});
}
