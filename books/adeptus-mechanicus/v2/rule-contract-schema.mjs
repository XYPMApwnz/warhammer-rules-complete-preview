import assert from 'node:assert/strict';
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';

/** Book-owned typed field declarations; interpretation remains in reviewed data. */
export function createAdMechSchema(declarations) {
  const stateFields={},modelAbilities=new Set();
  function visit(value) {
    if (!value||typeof value!=='object') return;
    if (value.predicate==='FIELD') {
      const {key,equals}=value.arguments;
      const spec={contextLevel:value.contextLevel,valueType:typeof equals,
        ...(key==='isWarlord'?{intrinsicAllKeywords:['CHARACTER']}:{})};
      if(stateFields[key])assert.deepEqual(stateFields[key],spec,'Book field declaration context/type drift: '+key);
      else stateFields[key]=spec;
    }
    if(value.predicate==='MODEL_ABILITY')modelAbilities.add(value.arguments.ability);
    for(const child of Object.values(value))if(Array.isArray(child))child.forEach(visit);else visit(child);
  }
  for(const declaration of declarations.values())visit(declaration);
  return {stateFields,modelAbilities:[...modelAbilities].sort(),
    evaluator:createRuleContractSchema({stateFields,modelAbilities:[...modelAbilities],contractSchema:'rule-contract/v2'})};
}
