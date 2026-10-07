import {bindDurationRecipients} from '../../shared/rule-contract-v2/bindings.mjs';

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
    return {id:`${ruleId}:duration:${index + 1}`, endpoint,
      evidence:{field:effect.field, quote}, sourceOccurrence:{start:match.index, end:match.index + quote.length},
      sourceFields:[effect.field]};
  });
  if (!duration.length) duration.push({id:`${ruleId}:duration:source-unspecified`, endpoint:'NOT_EXPLICIT', inferredExpiry:false, sourceFields:[effect.field]});
  return bindDurationRecipients(ruleId,effect,duration,clauses);
}
