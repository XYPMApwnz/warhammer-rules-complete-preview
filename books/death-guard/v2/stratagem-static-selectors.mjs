/** Build-time classification of source-adjudicated intrinsic exclusions.
 * These operations never become contextual FIELD flags. An attack-target
 * exclusion belongs to the bound enemy UNIT, not the attacking MODEL.
 */
const exclusions = new Map([
  ['EXCLUDES_VEHICLES', {participant:'RECIPIENT', keywords:['VEHICLE']}],
  ['ENEMY_TARGET_EXCLUDES_AIRCRAFT', {participant:'ATTACK_TARGET', keywords:['AIRCRAFT']}],
  ['ENEMY_ATTACK_TARGET_EXCLUDES_MONSTER_AND_VEHICLE', {participant:'ATTACK_TARGET', keywords:['MONSTER','VEHICLE']}]
]);

export function staticExclusionForOperation(operation) {
  const declaration=exclusions.get(operation);
  return declaration ? structuredClone(declaration) : null;
}
