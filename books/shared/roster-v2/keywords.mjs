/** Read keyword facts without changing their source representation or executing
 * grants. Passports choose the native layout; physical projections stay separate. */

import {loadRuntimeJSON} from '../source-refs-v2/source-catalog.mjs';
import {keywordAccess as access} from '../keyword-values.mjs';
const configs=await Promise.all([
  loadRuntimeJSON(new URL('../../space-marines/book.config.json',import.meta.url)),
  loadRuntimeJSON(new URL('../../blood-angels/book.config.json',import.meta.url)),
  loadRuntimeJSON(new URL('../../dark-angels/book.config.json',import.meta.url)),
  loadRuntimeJSON(new URL('../../adeptus-mechanicus/book.config.json',import.meta.url)),
  loadRuntimeJSON(new URL('../../chaos-space-marines/book.config.json',import.meta.url)),
  loadRuntimeJSON(new URL('../../death-guard/book.config.json',import.meta.url)),
  loadRuntimeJSON(new URL('../../tau-empire/book.config.json',import.meta.url)),
  loadRuntimeJSON(new URL('../../tyranids/book.config.json',import.meta.url)),
  loadRuntimeJSON(new URL('../../emperors-children/book.config.json',import.meta.url))
]);
access.registerKeywordPassports(configs);
export const {KEYWORD_FORMATS,createKeywordAccess,keywordField,requiredKeywordField,keywordValues,hasKeyword,keywordGroups,keywordScopeGroups,keywordScopesForUnit,profileKeywordScopeIds}=access;
