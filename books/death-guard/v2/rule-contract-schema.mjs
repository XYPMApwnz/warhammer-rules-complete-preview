/** DG owns its vocabulary; shared code owns the typed validation/evaluation kernel. */
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';
import {stateFields} from './rule-contract-state-fields.mjs';

const schema=createRuleContractSchema({
  stateFields,
  modelAbilities:['Deadly Demise'],
  contractSchema:'death-guard-rule-contract/v2'
});
export const {subjects,levels,publicResult,predicateTypes,
  validatePredicate,validateContracts,evaluatePredicate,evaluateRole}=schema;
