# esbuild 0.28.2 Unicode-property isolation

The new target/no-rewrite guard found two remaining source differences: bare General_Category Mark regex literals in normalizeImportLabel and normalizeGlossaryQuery were emitted as RegExp constructors. This is not a newly discovered Safari15/Chrome100 failure to parse Unicode property escapes.

A 48-case isolated transform matrix (six targets and eight equivalent/property forms) shows the rewrite also occurs for Chrome100, Safari15.4 and Safari16, and for bare M/L/N aliases. The one-member character classes remain literals. Official esbuild0.28.2 compatibility data aggregates complete Unicode property support with newer Unicode-database tests: its feature table omits Chrome/Safari because their latest tested versions fail Unicode16/17 cases, and currently lists Firefox147. Its lowering of unsupported regex literals to constructors is documented.

A narrow production option is to use a one-member character class for the two Mark expressions, consistently with the existing Letter/Number classes. This is equivalent: property escapes denote sets of single code points; wrapping that set in one class changes neither its contents nor global replacement. PROPERTY_CLASS_EQUIVALENCE.json compares every1,114,112 code point (including lone UTF16 surrogate values) in the current Node engine: zero differences; NFKD examples including supplementary combining marks are also identical. The diagnostic did not edit production or tests. Root owns any final change/test.

This does not claim that old engines use the latest Unicode17 tables. It records that the application's existing General_Category syntax is older than the target browsers and that the compiler's broad feature flag is stricter than syntax-only compatibility. A transform/no-rewrite check alone is not a proof of complete engine/API compatibility, particularly because the compiler does not identify the same feature inside character classes. Keep the separate import-attribute, regex-lookbehind and runtime-API controls.

Evidence: ESBUILD_PROPERTY_ESCAPE_ISOLATION.json (matrix), PROPERTY_CLASS_EQUIVALENCE.json (semantics), local esbuild-compat.go (official tagged source snapshot).

Primary references:

- [esbuild0.28.2 feature table](https://raw.githubusercontent.com/evanw/esbuild/v0.28.2/internal/compat/js_table.go), RegexpUnicodePropertyEscapes entry.
- [esbuild content-type documentation](https://esbuild.github.io/content-types/): unsupported regex literals may become constructors.
- [V8 6.4 release](https://v8.dev/blog/v8-release-64): Unicode property escapes enabled with Chrome64.
- [V8 Unicode regex explanation](https://v8.dev/features/regexp-v-flag): character-property escapes describe sets of individual code points.
