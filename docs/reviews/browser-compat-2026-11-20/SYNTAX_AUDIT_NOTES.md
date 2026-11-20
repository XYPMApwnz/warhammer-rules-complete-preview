# Browser compatibility: independent syntax/API audit

Scope: accepted feature base `9876164de85f1e35aa2cf070a3eb9de662093980`, its exact Pages manifest, before production substitutions. Read-only audit: no old test, source data, generated file or registry was changed by the scan. A single 6.5-second Node pass parsed all **142 published JS/MJS files / 24,812,710 bytes**. It used Node 24's bundled Acorn 8.16.0, without installing dependencies. This diagnostic parser source is a host capability, not a recommended permanent application dependency.

## Grammar results

The exact package contains **12 JSON import-attribute declarations in four files**: nine passport imports in keywords.mjs, one full source-catalog import, and two model-name aliases imports (AM/CSM). ECMA2022 module/script parsing fails only on those four files at their first attribute. Latest parsing succeeds for every file. Grammar-only ECMA2022 parsing does not certify any browser: it accepts lookbehind regex syntax even though Safari 15 does not implement that regex feature.

| Feature in accepted package | Locations/count | Compatibility and bounded action |
| --- | --- | --- |
| JSON import attributes | 12 declarations / four files | Remove every published declaration, preserving values; separate negative guard is needed because a transpiler can silently rewrite/drop syntax. |
| RegExp negative lookbehind | roster-v2/import.mjs:54, one literal | Safari added lookbehind in 16.4. Replace the final-s test with its equivalent capture-group form; normalized labels contain only ASCII letters/digits/spaces. |
| Array.toSorted | army-book-app-v2/reference-v1.mjs:41,59; source-table.mjs:25 | Requires Chrome110 / Safari16 / Firefox115. Use a new array followed by stable sort; preserve original input and sparse-array materialization. |
| Object.hasOwn | 67 calls | Safari15.4 added it. Keep API when documenting runtime minimum15.4; Safari15.0 would need a distinct compatibility change. |
| structuredClone | 41 calls | Safari15.4 added it. Do not substitute JSON serialization, which loses supported object/data semantics. |
| Array/member.at | 20 real member calls | Safari15.4 added it. The broad lexical scan also found16 unrelated local at(...) helpers; those are not browser API calls. |

No other published regex d/v flags, new Set operations, Array.fromAsync, AbortSignal.any/timeout, URL.canParse, RegExp.escape, Intl.Segmenter/DurationFormat or Promise.withResolvers were found in the scoped scan. Three any(...) calls are local application helpers, not Promise.any. Existing replaceAll, matchAll, flat/flatMap and Promise.allSettled are older than the proposed runtime minima.

A sensible documented runtime floor after the simple substitutions is **Safari15.4 / Chrome100 / Firefox102**; the syntax gate can still target Safari15/Chrome100. This is a static compatibility contract, not physical-device/browser certification.

## Accepted live release boundary

The same lightweight scan of release `1fd0b279051d76f1a262f7c8f117e35551b7de39` reads its own manifest (**114 JS/MJS files**). It has **zero** JSON import attributes, confirming the stated regression. It already has39 structuredClone calls,43 Object.hasOwn calls,3 toSorted calls,one lookbehind andfive member-at calls (lexical counts). Thus the JSON module regression is new; the extra API/regex floors are older residual compatibility issues which the new guard should reveal. See RELEASE_API_BOUNDARY.json for file-level counts.

## Nonfatal DOM/CSS notes outside the JS syntax guard

The Army Book navigation controller explicitly detects native inert and supplies a tabindex/focus-trap fallback. Core reader app.js directly assigns inert but also maintains aria-hidden and a keyboard focus trap; unsupported assignments do not throw, but native background accessibility isolation is not certified without real old-browser evidence.

There are18 :has() occurrences across seven published CSS files (11 extracted selector rules), including dialog surfaces, overflow locking and compact points layouts. Safari15.4 supports :has; Chrome100 and Firefox102 do not. CSS_HAS_NOTES.json lists selectors/declarations. These are not JavaScript parser failures, and this scan does not assert pixel-identical CSS on the minimum engines. Parent should retain this boundary in the report rather than silently claim full layout certification.

## Small equivalence changes implemented at parent's request

Only the three assigned production files were edited: final-s lookbehind becomes `/(^|[^sui])s$/` with replacement `$1`; three toSorted calls become nonmutating spread-plus-sort. All old tests remain unchanged. New tests/browser-compat-equivalence-qa.mjs passes in under one second: **1316** public lexical-candidate cases against the exact pre-change expression, **8** dense/sparse ordering/nonmutation cases, and actual reference/source-table renders with Array.prototype.toSorted disabled. The render cases preserve complete remaining prose, exact table-echo suppression, fact IDs, row insertion order for legacy tables, source row/column geometry and header spans.

Evidence: SYNTAX_API_AUDIT.json (pre-change scoped AST scan), RELEASE_API_BOUNDARY.json, CSS_HAS_NOTES.json, EQUIVALENCE_FOCUSED.json and the new unit test. Root owns final current-tree syntax check, full generated/A-B/census/browser/offline/update verification and the sole final pre-FF.

## Primary references

- [Apple Safari15.4 release notes](https://developer.apple.com/documentation/safari-release-notes/safari-15_4-release-notes): Object.hasOwn, structuredClone and at APIs.
- [WebKit Safari16.4 features](https://webkit.org/blog/13966/webkit-features-in-safari-16-4/): regex lookbehind.
- [Mozilla Firefox115 developer release notes](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/115): copying array methods.
- [Official MDN BCD Array data](https://raw.githubusercontent.com/mdn/browser-compat-data/main/javascript/builtins/Array.json): toSorted browser versions.
- [esbuild target documentation](https://esbuild.github.io/api/#target): target transforms concern syntax and do not add API polyfills.
