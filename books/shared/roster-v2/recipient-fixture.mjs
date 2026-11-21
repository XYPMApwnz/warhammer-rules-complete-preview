/** Test-only producer boundary for synthetic effect declarations. Keep malformed
 * declaration controls on their original guards, then exercise only canonical
 * recipient references in the production executor and presentation consumers. */
import {compileBookRecipients} from '../rule-contract-v2/recipients.mjs';
import {validateRosterEffectDeclarations,validateRosterEffects} from './effects.mjs';

export function compileRecipientFixture(book,evaluator,{validateContracts=true}={}) {
  if(validateContracts)evaluator.validateContractDeclarations(book);
  validateRosterEffectDeclarations(book,evaluator.validatePredicate,evaluator.evaluatePredicate);
  // Native producer artifacts are JSON: an optional declaration property set
  // to undefined is absent in the consumer input. Validate its declaration
  // first, so serialization cannot hide a malformed operation from its guard.
  const canonical=compileBookRecipients(JSON.parse(JSON.stringify(book)));
  if(validateContracts)evaluator.validateContracts(canonical);
  validateRosterEffects(canonical,evaluator.validatePredicate,evaluator.evaluatePredicate);
  return canonical;
}
