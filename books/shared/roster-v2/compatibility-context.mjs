/** Enhancement eligibility belongs to the physical component, not its formation.
 * Own derived keywords remain available; another member's keywords never do.
 * Roster/battle conditions keep their existing component-relative context.
 */
export function enhancementOwnerContext(contract, context) {
  if (contract.kind !== 'ENHANCEMENT' || !context) return context;
  const owner = context.owner;
  if (!owner?.unitId || !(owner.keywords instanceof Set) || !(owner.unknownKeywords instanceof Set)) {
    throw new TypeError('Unresolved Enhancement owner context');
  }
  return {...context, unitId:owner.unitId, keywords:owner.keywords, unknownKeywords:owner.unknownKeywords};
}
