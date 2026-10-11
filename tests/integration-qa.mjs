import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseArmyBookTargetCatalog} from '../books/shared/tools/build-army-book-targets.mjs';
import {loadPublicationInventory,selectPublicationBooks} from '../books/shared/tools/publication-inventory.mjs';
import {assertOwnedMobileRouteInventory} from './helpers/mobile-route-inventory.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const exists=file=>fs.existsSync(path.join(root,file));
const runtimeVersions=JSON.parse(read('books/shared/runtime-asset-versions.json'));
const failures=[];
let passed=0;
const check=(name,condition)=>{
  if(condition){passed++;console.log(`PASS  ${name}`);}
  else failures.push(name);
};

const sharedAssets=[
  'books/shared/navigation-targets.js',
  'books/shared/popup-rule-actions.js',
  'books/shared/datasheet-layout.js',
  'books/shared/popup-content.js',
  'books/shared/rule-facts.js',
  'books/shared/roster-entities.js',
  'books/shared/roster-parser.js',
  'books/shared/roster-enhancements.js'
];
for(const asset of sharedAssets)check(`shared asset exists: ${asset}`,exists(asset));

const library=read('index.html');
const books=[
  {id:'death-guard',phone:'chaos-land-raider.html',matrix:null,singleReader:true,semantic:'books/death-guard/scripts/roster-semantics.js'},
  {id:'adeptus-mechanicus',phone:'skitarii-rangers.html',matrix:'books/adeptus-mechanicus/generated/compatible-rules.json',singleReader:true,semantic:'books/adeptus-mechanicus/scripts/roster-enhancements.js'},
  {id:'tyranids',phone:'hive-tyrant.html',matrix:'books/tyranids/generated/compatible-rules.json',singleReader:true,semantic:'books/shared/book-roster-enhancements.js',semanticUrl:'../shared/book-roster-enhancements.js'},
  {id:'tau-empire',phone:'breacher-team.html',matrix:'books/tau-empire/generated/compatible-rules.json',singleReader:true,semantic:'books/tau-empire/scripts/roster-filter.js'},
  {id:'emperors-children',phone:'lord-exultant.html',matrix:'books/emperors-children/generated/compatible-rules.json',singleReader:true,semantic:'books/shared/book-roster-enhancements.js',semanticUrl:'../shared/book-roster-enhancements.js'},
  {id:'chaos-space-marines',phone:'abaddon-the-despoiler.html',matrix:'books/chaos-space-marines/generated/compatible-rules.json',singleReader:true,semantic:'books/shared/book-roster-enhancements.js',semanticUrl:'../shared/book-roster-enhancements.js'},
  {id:'space-marines',phone:'intercessor-squad.html',matrix:'books/space-marines/generated/compatible-rules.json',singleReader:true,semantic:'books/shared/book-roster-enhancements.js',semanticUrl:'../shared/book-roster-enhancements.js'},
  {id:'dark-angels',phone:'belial.html',matrix:null,singleReader:true,semantic:'books/shared/book-roster-enhancements.js',semanticUrl:'../shared/book-roster-enhancements.js'},
  {id:'blood-angels',phone:'commander-dante.html',matrix:'books/blood-angels/generated/compatible-rules.json',singleReader:true,semantic:'books/shared/book-roster-enhancements.js',semanticUrl:'../shared/book-roster-enhancements.js'}
];
check('integration metadata covers the publication inventory',JSON.stringify(books.map(book=>book.id))===JSON.stringify(selectPublicationBooks(loadPublicationInventory({root}),'library').map(book=>book.id)));

for(const book of books){
  const entry=`books/${book.id}/index.html`;
  const reader=`books/${book.id}/reader.html`;
  const phone=`books/${book.id}/mobile/${book.phone}`;
  check(`${book.id} public routes exist`,exists(entry)&&exists(reader)&&exists(phone));
  check(`${book.id} is linked from the Library`,library.includes(`books/${book.id}/`));

  const entryHtml=read(entry);
  const readerHtml=read(reader);
  const contentHtml=parseArmyBookTargetCatalog(read(`books/${book.id}/scripts/target-data.js`)).html;
  const canonicalHtml=readerHtml+contentHtml;
  const phoneHtml=read(phone);
  const phoneRuntime=book.singleReader?phoneHtml.includes('data-canonical-reader="../reader.html"')&&phoneHtml.includes(`../../shared/mobile-route-redirect.js?v=${runtimeVersions.shared.mobileRouteRedirect}`)&&!/<(?:article|section)\b|class="[^"]*\bunit-card\b|data-rule-id=/.test(phoneHtml):/mobile\.js\?v=\d+/.test(phoneHtml);
  const semanticRuntime=!book.semantic||exists(book.semantic)&&readerHtml.includes(`${book.semanticUrl||`./scripts/${path.basename(book.semantic)}`}?v=`);
  check(`${book.id} exposes required production paths`,(book.roster===false||/scripts\/roster-filter\.js\?v=\d+/.test(readerHtml))&&phoneRuntime&&semanticRuntime);
  if(book.matrix)check(`${book.id} Compatible Rules matrix exists`,exists(book.matrix));
  if(book.id==='chaos-space-marines'){
    check('chaos-space-marines entry exposes source-certified status and artwork',entryHtml.includes('Source-certified')&&entryHtml.includes('chaos-space-marines-cover-480.webp')&&!entryHtml.includes('class="entry-mark"'));
    check('chaos-space-marines reader preserves current publication inventory',(canonicalHtml.match(/<article class="unit-card/g)||[]).length===54&&(canonicalHtml.match(/data-nav-id="detachment-[^"]+"/g)||[]).length===17&&canonicalHtml.includes('faction-hero-cover'));
    assertOwnedMobileRouteInventory({root,bookId:book.id});
    check('chaos-space-marines exposes its exact owned compatibility routes',!/<(?:article|section)\b|class="[^"]*\bunit-card\b|data-rule-id=/.test(phoneHtml));
  }
  if(book.id==='blood-angels'){
    check('blood-angels entry exposes source-limited status and artwork',entryHtml.includes('Source-limited preview')&&entryHtml.includes('blood-angels-cover-480.webp')&&!entryHtml.includes('class="entry-mark"'));
    check('blood-angels reader exposes cover artwork',contentHtml.includes('faction-hero-cover')&&fs.readFileSync(path.join(root,'books/blood-angels/styles/book.css'),'utf8').includes('blood-angels-cover-800.webp'));
    assertOwnedMobileRouteInventory({root,bookId:book.id});
    check('blood-angels exposes its exact owned compatibility routes',!/<(?:article|section)\b|class="[^"]*\bunit-card\b|data-rule-id=/.test(phoneHtml));
  }
  if(book.id==='dark-angels'){
    check('dark-angels entry exposes source-limited review status and artwork',entryHtml.includes('Source-limited preview')&&entryHtml.includes('dark-angels-cover-480.webp')&&!entryHtml.includes('class="entry-mark"'));
    check('dark-angels reader exposes one categorized inventory with complete canonical source coverage',(canonicalHtml.match(/<article class="unit-card/g)||[]).length===100&&(canonicalHtml.match(/Space Marines shared datasheet/g)||[]).length===84&&!canonicalHtml.includes('data-nav-id="datasheets-dark-angels"')&&!canonicalHtml.includes('data-nav-id="datasheets-space-marines"')&&canonicalHtml.includes('data-nav-id="datasheets-epic-heroes"')&&canonicalHtml.includes('data-nav-id="datasheets-vehicle"')&&(canonicalHtml.match(/Codex source required/g)||[]).length===0);
    assertOwnedMobileRouteInventory({root,bookId:book.id});
    check('dark-angels exposes its exact owned compatibility routes',!/<(?:article|section)\b|class="[^"]*\bunit-card\b|data-rule-id=/.test(phoneHtml));
  }
}

check('Core Rules route exists and is linked',exists('books/core-rules/index.html')&&library.includes('books/core-rules/'));
check('Roster Guides route exists and is linked',exists('roster-guides/index.html')&&library.includes('roster-guides/'));
check('Mega Glossary route exists and is linked',exists('glossary/index.html')&&library.includes('glossary/'));

const serviceWorker=read('service-worker.js');
const shellUrls=[...serviceWorker.matchAll(/["'](\.\/[^"']+)["']/g)].map(match=>match[1]);
const shellFiles=shellUrls.map(url=>decodeURIComponent(url.split(/[?#]/,1)[0].slice(2)));
check('service worker has a non-empty app shell',shellFiles.length>0);
check('every literal app-shell asset exists',shellFiles.every(exists));
const versionsByFile=new Map();
for(const url of shellUrls){
  const file=url.split(/[?#]/,1)[0];
  if(!versionsByFile.has(file))versionsByFile.set(file,new Set());
  versionsByFile.get(file).add(url);
}
check('app shell has one active URL per asset',[...versionsByFile.values()].every(urls=>urls.size===1));
check('service worker imports the generated cache revision',serviceWorker.includes('./glossary/generated/cache-revision.js'));

assert.equal(failures.length,0,failures.join('\n'));
console.log(`${passed}/${passed} integration checks passed.`);
