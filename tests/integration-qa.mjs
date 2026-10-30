/** Native Unified V2 wiring. Legacy readers/mobile/guide routes are retired. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {armyBooks} from '../v2/army-books.mjs';
import {createBookRegistry} from '../books/shared/application-v2/registry.mjs';
import {loadPublicationInventory,selectPublicationBooks} from '../books/shared/tools/publication-inventory.mjs';
import {readAppShell,resolveAppShellUrl} from '../tools/cache-revision.mjs';
import {validateRuntimeManifest} from '../tools/pages-runtime-package.mjs';
import {checkSourceClosureTree} from '../books/shared/source-refs-v2/source-closure-qa.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),has=p=>fs.existsSync(path.join(root,p));
let passed=0;const check=(name,condition)=>{assert.ok(condition,name);passed++;console.log('PASS  '+name);};
const sourceClosure=checkSourceClosureTree(root);
check('all nine generated source-reference tables close, including nine deletion controls',sourceClosure.status==='PASS'&&sourceClosure.controls.length===9);
const inventory=loadPublicationInventory({root}),published=selectPublicationBooks(inventory,'library').map(b=>b.id),registry=createBookRegistry(armyBooks);
check('native registration matches all published owners',JSON.stringify([...published].sort())===JSON.stringify(armyBooks.map(b=>b.id).sort()));
check('held Orks is not a runtime registration',!registry.has('orks'));
check('root uses the single existing V2 entrypoint',/location\.replace\(new URL\('\.\/v2\/app\.html',location\.href\)\.href\)/.test(read('index.html')));
check('root has no legacy application implementation',!read('index.html').includes('roster-guides')&&!read('index.html').includes('class="book"'));
for(const book of armyBooks){
 check(book.id+' registration has native loaders',typeof book.loadPayload==='function'&&typeof book.createRoster==='function');
 const file=`books/${book.id}/v2/generated/app-presentation.json`,payload=JSON.parse(read(file));
 check(book.id+' native payload owner matches registration',payload.schema==='army-book-app-v2/presentation'&&payload.book.id===book.id);
 check(book.id+' cards and factual manifest are available',payload.cards.length>0&&payload.factManifest.length>0);
 check(book.id+' physical roster factory exists',has(`books/${book.id}/v2/roster-boot.mjs`)||has(`books/${book.id}/v2/roster-runtime.mjs`));
 check(book.id+' published cover exists',has(fileURLToPath(book.home.cover).slice(root.length+1)));
 check(book.id+' legacy UI is absent',!has(`books/${book.id}/reader.html`)&&!has(`books/${book.id}/index.html`)&&!fs.existsSync(path.join(root,`books/${book.id}/mobile/build.mjs`)));
}
for(const file of ['v2/boot.mjs','books/shared/application-v2/runtime.mjs','books/shared/army-book-app-v2/personal.mjs','books/shared/roster-v2/effective-instance.mjs','books/shared/roster-v2/import-service.mjs','books/core-rules/reader/mount.mjs','books/core-rules/reader/index.html','books/core-rules/reader/search-index.json','glossary/v2/generated/index.en.js','glossary/v2/generated/index.en.json'])check('native dependency exists '+file,has(file));
const manifest=JSON.parse(read('tools/pages-runtime-manifest.json')),allowed=validateRuntimeManifest(manifest);for(const file of allowed)check('runtime path exists '+file,has(file));
check('Core definition data is retained',allowed.has('glossary/v2/generated/index.en.js'));
check('legacy guides and held Orks are not published',[...allowed].every(p=>!p.startsWith('roster-guides/')&&!p.startsWith('books/orks/')));
const shell=readAppShell(root);check('mandatory shell is non-empty',shell.urls.length>0);for(const url of shell.urls)resolveAppShellUrl(root,url);check('mandatory shell paths resolve',true);
for(const p of ['books/shared/datasheet-system.css','books/shared/unit-art.css'])check('shared datasheet CSS retained '+p,allowed.has(p));
check('service worker uses generated revision',read('service-worker.js').includes('./glossary/generated/cache-revision.js'));
assert.throws(()=>createBookRegistry([...armyBooks,armyBooks[0]]),/Duplicate/,'duplicate native registration negative control');
console.log(`${passed}/${passed} native V2 integration checks passed.`);
