/** Read the canonical keyword scopes shared by presentation and physical owners. */
export function keywordScopesForUnit(unit, entities) {
  if (!unit.data.keywordScopesId) return null;
  const scope = entities.get(unit.data.keywordScopesId);
  if (scope?.kind !== 'KEYWORD_SCOPES' || scope.parentId !== unit.id) {
    throw new TypeError('Invalid canonical keyword scope');
  }
  return scope;
}
