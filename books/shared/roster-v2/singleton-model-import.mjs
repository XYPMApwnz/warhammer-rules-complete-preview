/** Physical import proofs, never a rule or condition computer. Only a known
 * single existing MODEL can own inventory exported on its UNIT line. */
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const singleton=(unit,row)=>unit?.startingStrength===1&&unit.modelRows?.length===1&&unit.modelRows[0]===row&&row.quantity===1&&typeof row.canonicalProfileId==='string';

/** Preserve the lexical selection identity and UNIT-origin evidence. Transfer,
 * rather than copy, only source-declared non-weapon equipment that requires a
 * MODEL proof. Already model-scoped items and multi-model units are unchanged. */
export function bindSingletonModelEquipment(roster,equipmentBindings) {
  for(const unit of roster.units){
    const row=unit.modelRows?.[0];if(!singleton(unit,row))continue;
    const keep=[];
    for(const selection of unit.selections){
      const required=selection.canonicalEquipmentIds?.length>0&&!selection.canonicalProfileIds?.length&&selection.physicalQuantity>0&&
        equipmentBindings.some(binding=>binding.ownerId===unit.canonicalUnitId&&binding.modelEffectRequiresConfirmedBearer===true&&
          same(binding.canonicalEquipmentIds,selection.canonicalEquipmentIds)&&same(binding.canonicalFieldPaths,selection.canonicalFieldPaths));
      if(!required){keep.push(selection);continue;}
      const proof=selection.quantityEvidence;
      if(proof?.scope!=='UNIT'||proof.modelQuantity!==null||selection.perModelQuantity!==null||
        !Number.isSafeInteger(proof.selectedQuantity)||proof.selectedQuantity!==selection.physicalQuantity)
        throw new TypeError('Singleton equipment contradicts its original physical quantity proof');
      if(row.selections.some(item=>item.selectionKey===selection.selectionKey)||(row.loadouts||[]).some(loadout=>loadout.selections.some(item=>item.selectionKey===selection.selectionKey)))
        throw new TypeError('Duplicate physical singleton equipment occurrence');
      row.selections.push({...selection,perModelQuantity:selection.physicalQuantity,
        quantityEvidence:{...proof,modelQuantity:1}});
    }
    unit.selections=keep;
  }
  return roster;
}

/** A shared stat profile alone is not a composition identity. The source's
 * unique positive minimum must consume the one existing MODEL; every other
 * member must allow zero. The required member must match the resolved profile. */
export function resolveSingletonCompositionMember(unit,row,members) {
  if(!singleton(unit,row)||!Array.isArray(members)||!members.length)return null;
  if(members.some(member=>member.ownerId!==unit.canonicalUnitId||!Number.isSafeInteger(member.quantity?.min)||member.quantity.min<0||
    !Number.isSafeInteger(member.quantity.max)||member.quantity.max<member.quantity.min))return null;
  const required=members.filter(member=>member.quantity.min>0);
  return required.length===1&&required[0].quantity.min===1&&required[0].profileId===row.canonicalProfileId?required[0]:null;
}
