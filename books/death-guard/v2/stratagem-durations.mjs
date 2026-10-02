import assert from 'node:assert/strict';

/** Build-time source normalization. Applicability/runtime never parses prose. */
export function normalizeStratagemDurations(ruleId, effect, clauses) {
  const matches = [...effect.quote.matchAll(/\buntil (?:the )?[^.,:;]+|\bin the same phase\b/gi)];
  const duration = matches.map((match, index) => {
    const quote = match[0];
    const endpoint = /start of your next Command phase/i.test(quote) ? 'START_NEXT_FRIENDLY_COMMAND_PHASE'
      : /start of your next turn/i.test(quote) ? 'START_NEXT_FRIENDLY_TURN'
      : /end of the phase|in the same phase/i.test(quote) ? 'END_CURRENT_PHASE'
      : /end of the turn/i.test(quote) ? 'END_CURRENT_TURN'
      : /end of the battle/i.test(quote) ? 'END_BATTLE'
      : /your unit has attacked/i.test(quote) ? 'AFTER_PRIMARY_ATTACKED' : 'EXPLICIT_SOURCE_BOUNDARY';
    const bindings = [];
    for (const clause of clauses.filter(clause => clause.effectRecipientRoleIds?.length)) {
      const scope = clause.lifetimeEvidence?.quote || effect.quote;
      const start = effect.quote.indexOf(scope);
      assert.ok(start >= 0 && effect.quote.indexOf(scope, start + 1) === -1, `${ruleId}: ambiguous lifetime source scope`);
      assert.ok(matches.length <= 1 || clause.lifetimeEvidence, `${ruleId}: multiple lifetimes require clause-specific source scope`);
      if (match.index < start || match.index + quote.length > start + scope.length) continue;
      bindings.push({clauseId:clause.id, roleIds:[...clause.effectRecipientRoleIds],
        ...(clause.lifetimeEvidence ? {scopeEvidence:clause.lifetimeEvidence} : {})});
    }
    assert.ok(bindings.length, `${ruleId}: source lifetime without an effect recipient`);
    return {id:`${ruleId}:duration:${index + 1}`, endpoint,
      roleIds:[...new Set(bindings.flatMap(binding => binding.roleIds))], bindings,
      evidence:{field:effect.field, quote}, sourceOccurrence:{start:match.index, end:match.index + quote.length},
      sourceFields:[effect.field]};
  });
  if (!duration.length) duration.push({id:`${ruleId}:duration:source-unspecified`, endpoint:'NOT_EXPLICIT', inferredExpiry:false, sourceFields:[effect.field]});
  return duration;
}
