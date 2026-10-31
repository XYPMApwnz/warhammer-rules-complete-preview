/** Existing typed V2 applicability vocabulary; no Space Marines operations. */
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';
import {createRosterConditionBinding} from '../../shared/roster-v2/condition-binding.mjs';

export function createSpaceMarinesRuleSchema({book,state,conditionInputs=[]}={}){
  const schema=createRuleContractSchema({stateFields:{
    attached:{contextLevel:'ROSTER',valueType:'boolean'},
    equipmentRequirementSatisfied:{contextLevel:'ROSTER',valueType:'boolean'},
    smEquipmentBearerSatisfied:{contextLevel:'ROSTER',valueType:'boolean'},
    smPhysicalUnitInstanceId:{contextLevel:'ROSTER',valueType:'string'},
    smPhysicalModelScopeId:{contextLevel:'ROSTER',valueType:'string'},
    smPermanentAssaultSource:{contextLevel:'ROSTER',valueType:'boolean'},
    battleConditionSatisfied:{contextLevel:'BATTLE',valueType:'boolean'}
  }});
  return createRosterConditionBinding({book,state,schema,inputs:conditionInputs});
}
