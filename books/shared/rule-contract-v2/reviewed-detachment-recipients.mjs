/** Producer-only enrollment of explicitly reviewed Detachment text recipients. */
import assert from 'node:assert/strict';

export function recordReviewedDetachmentRecipients(book, declarations) {
  const index = new Map(book.entities.map(entity => [entity.id, entity])), seen = new Set();
  assert.equal(index.size, book.entities.length, 'Duplicate canonical Detachment owner');
  for (const row of declarations) {
    const {ruleId, clauseId, field, quote, disposition, reason} = row;
    const key = ruleId + '/' + clauseId, entity = index.get(ruleId);
    assert(!seen.has(key), 'Duplicate reviewed Detachment clause: ' + key); seen.add(key);
    assert(entity?.kind === 'DETACHMENT_RULE' && !entity.factOwnerId &&
      (!entity.bookId || entity.bookId === book.bookId), 'Expected book-owned Detachment rule: ' + key);
    const matches = entity.ruleContract?.clauses.filter(clause => clause.id === clauseId) ?? [];
    assert.equal(matches.length, 1, 'Expected one reviewed Detachment clause: ' + key);
    const [clause] = matches;
    assert(Array.isArray(field) && field.length && clause.sourceFields.some(source =>
      source.length <= field.length && source.every((part, i) => part === field[i])),
    'Detachment proof is outside its clause: ' + key);
    const source = field.reduce((value, part) => value?.[part], entity.data);
    assert(typeof source === 'string' && typeof quote === 'string' && quote.trim() && source.includes(quote),
      'Reviewed Detachment quote changed: ' + key);
    assert(typeof reason === 'string' && reason.trim(), 'Missing Detachment review reason: ' + key);
    assert(!clause.rosterEffects?.length && !clause.conditionalPolicy && !clause.f1RecipientIds?.length &&
      !clause.recipients?.length,
    'Detachment review overlaps an existing execution or recipient path: ' + key);
    assert(['RECORD', 'NOT_APPLICABLE'].includes(disposition), 'Unsupported Detachment disposition: ' + key);
    if (disposition === 'NOT_APPLICABLE') {
      assert(!row.selector && !row.subject, 'Army-only clause must not invent a recipient: ' + key);
      assert(!clause.effectRecipientRoleIds?.length &&
        !clause.roles.some(role => ['RECIPIENT', 'EFFECT_RECIPIENT'].includes(role.purpose)),
      'Army-only classification overlaps a recipient: ' + key);
      clause.rosterClassification = 'NOT_AN_EFFECT';
    } else {
      const {subject, selector} = row;
      assert(['MODEL', 'UNIT'].includes(subject), 'Unsupported Detachment recipient subject: ' + key);
      const evidence = {field: structuredClone(field), quote};
      const proof = value => {
        const owner = value?.otherEntityId ? index.get(value.otherEntityId) : entity;
        let parent = entity;
        while (parent && parent !== owner) parent = index.get(parent.parentId);
        assert(parent === owner && Array.isArray(value?.field) && typeof value.quote === 'string' && value.quote.trim(),
          'Recipient proof must belong to this rule or its parent: ' + key);
        const text = value.field.reduce((value, part) => value?.[part], owner.data);
        assert(typeof text === 'string' && text.includes(value.quote), 'Recipient context proof changed: ' + key);
        return structuredClone(value);
      };
      const bind = node => {
        assert(node && typeof node === 'object', 'Missing reviewed selector: ' + key);
        if (node.op) {
          assert(['ALL', 'ANY', 'NOT'].includes(node.op) && Array.isArray(node.args) && node.args.length &&
            (node.op !== 'NOT' || node.args.length === 1), 'Invalid reviewed selector Boolean: ' + key);
          return {op: node.op, args: node.args.map(bind)};
        }
        assert([subject + '_KEYWORD', subject + '_ID'].includes(node.predicate), 'Unsupported recipient selector: ' + key);
        const argument = node.predicate.endsWith('_KEYWORD') ? 'keyword' : 'id';
        assert(Object.keys(node.arguments ?? {}).length === 1 && typeof node.arguments[argument] === 'string' &&
          node.arguments[argument].trim(), 'Missing reviewed recipient address: ' + key);
        if (argument === 'id') assert.equal(index.get(node.arguments.id)?.kind,
          subject === 'UNIT' ? 'DATASHEET' : 'PROFILE', 'Unresolved recipient identity: ' + key);
        return {...structuredClone(node), subject, contextLevel: 'STATIC', evidence: proof(node.evidence ?? evidence)};
      };
      const role = {id: 'detachment-text-recipient', subject, allegiance: 'FRIENDLY', purpose: 'EFFECT_RECIPIENT',
        binding: subject === 'MODEL' ? 'ROSTER_MODELS' : 'ROSTER_UNITS', selector: bind(selector), evidence};
      assert(!(entity.ruleContract.roles ?? []).some(candidate => candidate.id === role.id),
        'Detachment text role collides with a contract participant: ' + key);
      const existing = clause.roles.filter(candidate =>
        candidate.id === role.id || ['RECIPIENT', 'EFFECT_RECIPIENT'].includes(candidate.purpose));
      if (existing.length) {
        // Closure producers may regenerate from a declaration view of their
        // own canonical output. Accept only the exact previously reviewed role.
        assert.equal(existing.length, 1, 'Duplicate Detachment text participant: ' + key);
        assert.deepEqual(existing[0], role, 'Existing recipient differs from its review: ' + key);
        if (Object.hasOwn(clause, 'effectRecipientRoleIds')) assert.deepEqual(clause.effectRecipientRoleIds,
          [role.id], 'Existing recipient admission differs: ' + key);
      } else {
        assert(!clause.effectRecipientRoleIds?.length, 'Existing recipient authority: ' + key);
        clause.roles.push(role);
      }
      if (Object.hasOwn(clause, 'effectRecipientRoleIds')) clause.effectRecipientRoleIds = [role.id];
      clause.rosterClassification = 'BATTLE_ONLY';
    }
    clause.rosterClassificationNote = {...clause.rosterClassificationNote, reason};
  }
}
