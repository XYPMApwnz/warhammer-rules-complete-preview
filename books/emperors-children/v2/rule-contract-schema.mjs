/** Same typed EC schema in Node producers and browser consumers. */
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';
import {permissionStateFields} from './rule-contract-permission-declarations.mjs';
export const bladeId='detachment-carnival-of-excess:enhancement:3';
export const bladeField='selectedUpgrade:'+bladeId;
export const finalStateFields={[bladeField]:{contextLevel:'ROSTER',valueType:'string'},
  possessedBladeFightUse:{contextLevel:'BATTLE',valueType:'boolean'},snapShootingAttack:{contextLevel:'BATTLE',valueType:'boolean'}};
export const formationStateFields={attached:{contextLevel:'ROSTER',valueType:'boolean'},
  equipmentRequirementSatisfied:{contextLevel:'ROSTER',valueType:'boolean'},
  lordOfHostDeclaredBattleline:{contextLevel:'ROSTER',valueType:'boolean'}};
export function createECRuleSchema(){return createRuleContractSchema({stateFields:{meleeAttackTargetsCharacter:{contextLevel:'BATTLE',valueType:'boolean'},...permissionStateFields,...formationStateFields,...finalStateFields}});}
