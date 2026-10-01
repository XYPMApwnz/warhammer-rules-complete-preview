import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {evaluatePredicate,evaluateRole,validatePredicate,publicResult} from './rule-contract-schema.mjs';
import '../../shared/roster-parser.js';
export async function createBrowserRoster() {
  const response=await fetch(new URL('./generated/rule-contract-effective.json',import.meta.url));
  if(!response.ok)throw new Error('Canonical Rule Contract snapshot unavailable');
  return createRosterRuntime(await response.json(),{parse:globalThis.WHRosterParser.parse,evaluatePredicate,evaluateRole,validatePredicate,publicResult});
}
