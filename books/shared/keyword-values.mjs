/** ESM bridge to the same access implementation used by classic consumers.
 * Computed keyword fields do not require native-book passport initialization. */
import * as factsModule from './rule-facts.js';
export const keywordAccess=(factsModule.default||globalThis.WHRuleFacts).keywordAccess;
export const {keywordField,requiredKeywordField,keywordValues,hasKeyword,keywordGroups,
 keywordScopeGroups,keywordScopesForUnit,profileKeywordScopeIds}=keywordAccess;
