/** Compare two spellings of one physical singleton. Keep source, effect and
 * canonical recipient identities; only the lexical MODEL-row address differs.
 * This mapping is not used by baseline/feature comparisons of the same input. */
import {sourceDeclarationView} from '../../books/shared/source-refs-v2/source-refs.mjs';
export function singletonEquipmentGameSignature(view) {
  view=sourceDeclarationView(view);
  if(view.startingStrength!==1||view.profiles.length!==1||view.profiles[0].quantity!==1)
    throw new TypeError('Format-pair comparison requires one proven physical MODEL');
  const scope=view.profiles[0].scopeId;
  const addresses=value=>value===scope?'$SOLE_EXISTING_MODEL':Array.isArray(value)?value.map(addresses):value&&typeof value==='object'?
    Object.fromEntries(Object.entries(value).map(([key,item])=>[key,addresses(item)])):value;
  return addresses({canonicalUnitId:view.canonicalUnitId,startingStrength:view.startingStrength,
    keywords:view.keywords,physicalKeywords:view.physicalKeywords,intrinsicKeywords:view.intrinsicKeywords,
    profiles:view.profiles.map(model=>({id:model.id,quantity:model.quantity,fields:model.fields,keywords:model.keywords,
      intrinsicKeywords:model.intrinsicKeywords,metrics:model.metrics,abilities:model.abilities})),
    weapons:view.weapons.map(weapon=>({id:weapon.id,fields:weapon.fields,abilities:weapon.abilities,metrics:weapon.metrics})),
    abilities:view.abilities,applied:view.applied,conditional:view.conditional});
}
