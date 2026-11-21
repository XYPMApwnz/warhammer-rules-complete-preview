/** Enhancement eligibility belongs to the physical component, not its formation.
 * Own derived keywords remain available; another member's keywords never do.
 * Roster/battle conditions keep their existing component-relative context.
 */
import {createKeywordAccess,keywordField} from './keywords.mjs';
/** Core 25.04 applies to the physical owner, including UNIT Upgrades.
 * Explicit profile bindings belong to this datasheet; attached components do not.
 * No book selector or source keyword is rewritten by this consumer rule. */
export function epicHeroUnitIds(book){
  if(!Array.isArray(book?.entities))throw new TypeError('Missing canonical Enhancement owner book');
  const epic=values=>Array.isArray(values)&&values.some(value=>typeof value==='string'&&value.trim().replace(/\s+/g,' ').toUpperCase()==='EPIC HERO');
  const units=book.entities.filter(entity=>entity.kind==='DATASHEET'),ids=new Set(),access=createKeywordAccess(book,{allowIncompleteFlat:true});
  for(const unit of units){
    if(epic(access.allUnitKeywords(unit))||epic(access.allModelKeywords(unit)))ids.add(unit.id);
  }
  return ids;
}

export function enhancementOwnerContext(contract, context) {
  if (contract.kind !== 'ENHANCEMENT' || !context) return context;
  const owner = context.owner;
  if (!owner?.unitId || !(keywordField(owner) instanceof Set) || !(keywordField(owner,'unknownKeywords') instanceof Set)) {
    throw new TypeError('Unresolved Enhancement owner context');
  }
  return {...context, unitId:owner.unitId, keywords:keywordField(owner), unknownKeywords:keywordField(owner,'unknownKeywords')};
}

/** The general MODEL Enhancement bearer rule, for related queries only. */
export function enhancementBearerEligible(contract,role,context,physicalUnit=null){
 if(contract.kind!=='ENHANCEMENT'||role.id!==contract.roles[0]?.id||role.subject!=='MODEL')return true;
 if(keywordField(context.owner)?.has('CHARACTER'))return true;
 // A confirmed CHARACTER grant to an exact one-MODEL physical UNIT also
 // belongs to that MODEL; never borrow a formation's or sibling MODEL's bag.
 return Boolean(physicalUnit&&physicalUnit.instanceId===context.instanceId&&
  physicalUnit.canonicalUnitId===context.owner?.unitId&&
  physicalUnit.profiles.reduce((count,model)=>count+model.quantity,0)===1&&
  keywordField(physicalUnit).includes('CHARACTER'));
}

/** Core eligibility must preserve malformed evaluations for the existing guards. */
export function enhancementEligibilityState(kind,epicOwner,state){
  return state==='INVALID'?state:kind==='ENHANCEMENT'&&epicOwner?'FALSE':state;
}
