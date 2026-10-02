// Explicit test-server allowlist. The shared NR parser is lexical only.
export function allowRosterDependencies(allowed) {
  for (const file of ['books/death-guard/v2/roster-boot.mjs','books/death-guard/v2/rule-contract-schema.mjs','books/death-guard/v2/rule-contract-state-fields.mjs',
    'books/shared/roster-v2/runtime.mjs','books/shared/roster-v2/context.mjs','books/shared/roster-v2/effects.mjs','books/shared/roster-v2/import.mjs',
    'books/shared/army-book-app-v2/roster.mjs','books/shared/army-book-app-v2/personal.mjs','books/shared/roster-parser.js']) allowed.set('/'+file,'text/javascript');
  allowed.set('/books/death-guard/v2/generated/rule-contract-effective.json','application/json');
}
