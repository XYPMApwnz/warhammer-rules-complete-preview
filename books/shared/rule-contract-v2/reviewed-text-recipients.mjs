/** Apply reviewed text recipients to the working contract graph before finalization. */
import assert from 'node:assert/strict';

export function recordReviewedTextRecipients(book, declarations) {
  const entities = new Map(book.entities.map(entity => [entity.id, entity]));
  assert.equal(entities.size, book.entities.length, 'Duplicate canonical owner');
  const seen = new Set();
  for (const {ruleId, clauseId, field, quote, subject, binding, scope} of declarations) {
    const key = ruleId + '/' + clauseId;
    assert(!seen.has(key), 'Duplicate reviewed recipient: ' + key);
    seen.add(key);
    const entity = entities.get(ruleId), contract = entity?.ruleContract;
    assert(contract?.ruleId === ruleId && !entity.factOwnerId &&
      (entity.bookId === undefined || entity.bookId === book.bookId) &&
      entity.kind !== 'STRATAGEM' && contract.kind !== 'STRATAGEM', 'Expected book-owned non-Stratagem rule: ' + key);
    const matches = contract.clauses.filter(clause => clause.id === clauseId);
    assert.equal(matches.length, 1, 'Expected one source clause: ' + key);
    const [clause] = matches;
    assert(Array.isArray(field) && field.length && clause.sourceFields.some(source =>
      source.length <= field.length && source.every((part, index) => part === field[index])),
    'Recipient evidence is outside its clause: ' + key);
    const text = field.reduce((node, part) => Object.hasOwn(node ?? {}, part) ? node[part] : undefined, entity.data);
    assert(typeof text === 'string' && typeof quote === 'string' && quote.trim() && text.includes(quote),
      'Reviewed recipient quote changed: ' + key);
    assert(!clause.rosterEffects?.length && !clause.conditionalPolicy && !clause.f1RecipientIds?.length &&
      !clause.recipients?.length && !clause.effectRecipientRoleIds?.length,
    'Reviewed recipient overlaps an existing recipient or execution path: ' + key);
    const roles = [...(contract.roles ?? []), ...clause.roles];
    assert(!roles.some(role => role.id === 'text-recipient') &&
      !clause.roles.some(role => ['EFFECT_RECIPIENT', 'RECIPIENT'].includes(role.purpose)),
    'Reviewed recipient overlaps an existing participant: ' + key);
    assert((subject === 'UNIT' && binding === 'SOURCE_UNIT' && ['FORMED', 'PHYSICAL'].includes(scope)) ||
      (subject === 'MODEL' && ['SOURCE_MODEL', 'SOURCE_UNIT_MODELS', 'SOURCE_FORMED_MODELS'].includes(binding) && scope === undefined),
    'Unsupported reviewed recipient scope: ' + key);
    const evidence = {field: [...field], quote};
    clause.roles.push({id: 'text-recipient', subject, allegiance: 'FRIENDLY', binding,
      ...(scope ? {scope} : {}), purpose: 'EFFECT_RECIPIENT',
      selector: {predicate: 'ALWAYS', subject, contextLevel: 'STATIC', arguments: {}, evidence}, evidence});
  }
}
