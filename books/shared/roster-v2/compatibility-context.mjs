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

/** The general MODEL Enhancement bearer rule, for related queries only. */
export function enhancementBearerEligible(contract,role,context,physicalUnit=null){
 if(contract.kind!=='ENHANCEMENT'||role.id!==contract.roles[0]?.id||role.subject!=='MODEL')return true;
 if(context.owner?.keywords?.has('CHARACTER'))return true;
 // A confirmed CHARACTER grant to an exact one-MODEL physical UNIT also
 // belongs to that MODEL; never borrow a formation's or sibling MODEL's bag.
 return Boolean(physicalUnit&&physicalUnit.instanceId===context.instanceId&&
  physicalUnit.canonicalUnitId===context.owner?.unitId&&
  physicalUnit.profiles.reduce((count,model)=>count+model.quantity,0)===1&&
  physicalUnit.keywords.includes('CHARACTER'));
}
