import {allowApplicationTestDependencies} from '../../shared/application-v2/browser-test-dependencies.mjs';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

// Explicit test-server allowlist; New Recruit decoding is owned by Roster V2.
export function allowRosterDependencies(allowed) {
  allowApplicationTestDependencies(allowed);
  allowed.set('/books/death-guard/v2/roster-import-bindings.mjs','text/javascript');
  allowed.set('/books/death-guard/v2/instrument-selections.mjs','text/javascript');
  for (const file of ['books/death-guard/v2/roster-boot.mjs','books/death-guard/v2/rule-contract-schema.mjs','books/death-guard/v2/rule-contract-state-fields.mjs',
    'books/shared/army-book-app-v2/ability-presentation.mjs','books/shared/army-book-app-v2/lifecycle.mjs',
    'books/shared/army-book-app-v2/reference-contract.mjs','books/shared/army-book-app-v2/reference-v1.mjs','books/shared/army-book-app-v2/route-context.mjs',
    'books/shared/rule-contract-v2/schema.mjs',
    'books/shared/roster-v2/runtime.mjs','books/shared/roster-v2/context.mjs','books/shared/roster-v2/effects.mjs','books/shared/roster-v2/import.mjs','books/shared/roster-v2/compatibility-feasibility.mjs','books/shared/roster-v2/compatibility-context.mjs',
    'books/shared/army-book-app-v2/navigation-v1.mjs','books/shared/army-book-app-v2/navigation-v1-controller.mjs','books/shared/army-book-app-v2/navigation-v1-targets.mjs','books/shared/army-book-app-v2/roster.mjs','books/shared/army-book-app-v2/personal.mjs',
    'books/shared/army-book-app-v2/datasheet-v1.mjs','books/shared/army-book-app-v2/normal-datasheet-bindings.mjs','books/shared/army-book-app-v2/datasheet-v1-layout.mjs','books/shared/army-book-app-v2/book-v1.mjs','books/shared/army-book-app-v2/related-v1.mjs','books/shared/army-book-app-v2/popup-v1.mjs','books/shared/roster-v2/parser.mjs']) allowed.set('/'+file,'text/javascript');
  allowed.set('/books/shared/army-book-app-v2/navigation-v1.css','text/css');
  allowed.set('/books/shared/army-book-app-v2/datasheet-v1.css','text/css');
  allowed.set('/books/shared/army-book-app-v2/book-v1.css','text/css');
  allowed.set('/books/shared/army-book-app-v2/popup-v1.css','text/css');
  allowed.set('/books/shared/army-book-app-v2/reference-v1.css','text/css');
  allowed.set('/books/shared/datasheet-system.css','text/css');
  allowed.set('/books/shared/unit-art.css','text/css');
  allowed.set('/assets/death-guard-cover.jpg','image/jpeg');
  const artDirectory=fileURLToPath(new URL('../assets/unit-images/',import.meta.url));
  for(const file of fs.readdirSync(artDirectory))if(/\.(?:png|webp)$/i.test(file))allowed.set('/books/death-guard/assets/unit-images/'+file,file.toLowerCase().endsWith('.png')?'image/png':'image/webp');
  allowed.set('/books/death-guard/v2/generated/rule-contract-effective.json','application/json');
}
