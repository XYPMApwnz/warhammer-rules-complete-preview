import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const exists=name=>fs.existsSync(path.join(root,name));
const results=[];
const check=(name,ok,detail='')=>results.push({name,ok,detail});

const library=read('index.html');
const rosterGuides=read('roster-guides/index.html');
const rosterGuidesApp=read('roster-guides/app.js');
const sw=read('service-worker.js');
const coreReaderFiles=fs.readdirSync(path.join(root,'books','core-rules','reader')).filter(name=>name.endsWith('.html'));
const books={
  'death-guard':{version:'9',reader:'reader.html',versions:{'styles/tokens.css':'10','styles/navigation.css':'11','styles/content.css':'28','styles/popups.css':'17','scripts/roster-filter.js':'14','scripts/navigation-controller.js':'15','scripts/popup-controller.js':'23','scripts/full-entry-controller.js':'8','scripts/journey-controller.js':'11','scripts/ui-controllers.js':'11','scripts/related-rules.js':'6','scripts/app.js':'28'},app:'scripts/app.js',usesPopupGlossary:true,files:['assets/icon-v4.svg','styles/tokens.css','styles/layout.css','styles/navigation.css','styles/content.css','styles/popups.css','scripts/roster-filter.js','scripts/navigation-controller.js','scripts/popup-controller.js','scripts/full-entry-controller.js','scripts/journey-controller.js','scripts/ui-controllers.js','scripts/related-rules.js','scripts/app.js']},
  'core-rules':{version:null,reader:'reader/index.html',rootPrefix:'../../../',libraryEntry:'reader/index.html',versions:{'app.js':'2','reader/styles.css':'8','reader/app.js':'10'},app:'app.js',usesPopupGlossary:false,files:['styles.css','config.js','basic-content.js','app.js','content/core-rules.source.en.js','content/core-rules.en.js','reader/index.html','reader/search-index.json','reader/styles.css','reader/app.js']},
  'adeptus-mechanicus':{version:'13',versions:{'styles/content.css':'14','styles/popups.css':'16','scripts/popup-controller.js':'20','scripts/ui-controllers.js':'14','scripts/app.js':'19'},app:'scripts/app.js',usesPopupGlossary:true,files:['assets/mechanicus-logo.png','styles/tokens.css','styles/layout.css','styles/navigation.css','styles/content.css','styles/popups.css','styles/mechanicus.css','scripts/data.js','scripts/navigation-controller.js','scripts/popup-controller.js','scripts/journey-controller.js','scripts/ui-controllers.js','scripts/app.js']}
};

for(const file of ['service-worker.js','glossary-return.js','books/shared/navigation-targets.js','books/shared/datasheet-layout.js','books/shared/popup-content.js','books/shared/roster-entities.js','books/shared/roster-parser.js','books/shared/roster-enhancements.js',...Object.entries(books).map(([slug,book])=>`books/${slug}/${book.app}`)]){
  try{new vm.Script(read(file),{filename:file});check(file+' syntax',true);}
  catch(error){check(file+' syntax',false,error.message);}
}

for(const [slug,book] of Object.entries(books)){
  const html=read(`books/${slug}/${book.reader||'index.html'}`);
  const app=read(`books/${slug}/${book.app}`);
  check(`${slug} card opens the real reader`,library.includes(`href="books/${slug}/${book.libraryEntry||'index.html'}"`));
  check(`${slug} reader and shell files exist`,exists(`books/${slug}/index.html`)&&book.files.every(file=>exists(`books/${slug}/${file}`)),book.files.filter(file=>!exists(`books/${slug}/${file}`)).join(', '));
  const rootPrefix=book.rootPrefix||'../../';
  check(`${slug} links to the root manifest`,html.includes(`href="${rootPrefix}manifest.webmanifest"`));
  check(`${slug} exposes the shared library link`,html.includes(`href="${rootPrefix}index.html"`));
  check(`${slug} delegates to the root service worker`,app.includes("register('../../service-worker.js')"));
  check(`${slug} has a dedicated offline fallback`,sw.includes(`${slug.replaceAll('-','_').toUpperCase()}_FALLBACK`)&&sw.includes(`/books/${slug}/`));
  check(`${slug} has no nested PWA ownership`,!app.includes("register('./service-worker.js')"));
  const missing=book.files.filter(file=>{
    const version=book.versions?.[file]||book.version;
    const suffix=version&&/\.(css|js)$/.test(file)?`?v=${version}`:'';
    return !sw.includes(`"./books/${slug}/${file}${suffix}"`);
  });
  check(`${slug} shell is precached`,missing.length===0,missing.join(', '));
}

check('release cache namespace is isolated',sw.includes('warhammer-rules-fe1d435-'));
check('preview cache revision is content-derived',exists('glossary/generated/cache-revision.js')&&sw.includes('importScripts("./glossary/generated/cache-revision.js")')&&sw.includes('self.WH40K_CACHE_REVISION'));
check('library header opens the Mega Glossary',library.includes('glossary-link')&&library.includes('href="glossary/index.html"'));
check('library has no dead book-preview modal',!library.includes('id="overlay"')&&!library.includes('function openBook')&&!library.includes('function closeBook'));
check('Roster Guides have a dedicated public route',exists('roster-guides/index.html')&&exists('roster-guides/app.js'));
check('Roster Guides preserve the storage contract',rosterGuidesApp.includes("const STORAGE_KEY='wh40k-rosters-v1'")&&rosterGuidesApp.includes('function rosterId(text)')&&rosterGuidesApp.includes("'death guard':'../books/death-guard/reader.html'")&&rosterGuides.includes('app.js?v=6')&&sw.includes('./roster-guides/app.js?v=6'));
check('Roster Guides preserve corrupt raw storage before overwrite',rosterGuidesApp.includes("const CORRUPT_BACKUP_KEY='wh40k-rosters-v1-corrupt-backup'")&&rosterGuidesApp.includes('localStorage.getItem(CORRUPT_BACKUP_KEY)===null')&&rosterGuidesApp.includes('localStorage.setItem(CORRUPT_BACKUP_KEY,raw)'));
check('Roster Guides tolerate malformed saved collections',rosterGuidesApp.includes('Array.isArray(records)?records:[]')&&rosterGuidesApp.includes('.filter(isDisplayable)')&&rosterGuidesApp.includes("'date unknown'")&&rosterGuidesApp.includes('Array.isArray(record.roster.detachments)'));
check('Roster Guides keep saved records ahead of creation',rosterGuides.indexOf('id="saved-title"')<rosterGuides.indexOf('id="create-title"'));
check('Roster Guides have a dedicated offline fallback',sw.includes('ROSTER_GUIDES_FALLBACK')&&sw.includes('/roster-guides/'));
check('Library explains the product and separates primary spaces',library.includes('A unified reference for Core Rules')&&library.includes('Army Books')&&library.includes('href="roster-guides/index.html"'));
check('Library describes multi-faction Roster Guides honestly',library.includes('Save supported New Recruit rosters and open personal guides where available.'));
check('Library no longer owns roster storage or import controls',!library.includes('localStorage')&&!library.includes('id="roster-input"'));
check('legacy root roster links keep query and hash',library.includes("new URLSearchParams(location.search).get('roster')")&&library.includes("new URL('roster-guides/index.html',location.href)")&&library.includes('target.search=location.search')&&library.includes('target.hash=location.hash'));
check('empty legacy roster query stays in Library',library.includes("if(new URLSearchParams(location.search).get('roster'))"));
check('Roster Guides recognise two factions but expose only a real reader',rosterGuidesApp.includes("new Set(['death guard','adeptus mechanicus'])")&&rosterGuidesApp.includes("'death guard':'../books/death-guard/reader.html'")&&!rosterGuidesApp.includes('adeptus-mechanicus/reader.html'));
check('Roster Guides use one dash-tolerant faction normaliser',rosterGuidesApp.includes('function normalizeFaction(value)')&&rosterGuidesApp.includes('[-–—]')&&rosterGuidesApp.includes('knownFaction(record.roster.faction)'));
check('unknown roster factions are blocked before save',rosterGuidesApp.indexOf("if(!faction){document.querySelector('#roster-result')")<rosterGuidesApp.indexOf('const record=saveRoster(roster,input.value)'));
check('missing roster and faction states are explicit',rosterGuidesApp.includes("alert('Saved roster not found.')")&&rosterGuidesApp.includes('<h2>Faction not found</h2>')&&read('books/shared/roster-parser.js').includes("value('FACTION KEYWORD')"));
check('backup import validates the v1 record and known faction',rosterGuidesApp.includes('function isImportableRecord(record)')&&rosterGuidesApp.includes('knownFaction(record?.roster?.faction)')&&rosterGuidesApp.includes('if(!isImportableRecord(record))throw new Error()'));
check('Mechanicus records have no fake reader action',rosterGuides.includes('Death Guard and Adeptus Mechanicus exports are recognised.')&&rosterGuidesApp.includes('disabled>Reader unavailable</button>'));
check('roster storage key remains compatible',rosterGuidesApp.includes("const STORAGE_KEY='wh40k-rosters-v1'"));
check('Roster Guides compare current Army Book points without blocking save',rosterGuides.includes('points-data.js?v=3')&&rosterGuides.includes('points-validator.js?v=2')&&rosterGuidesApp.includes('window.WHRosterPoints.check')&&rosterGuidesApp.includes('Points warning:')&&rosterGuidesApp.includes('The roster was still saved.')&&!rosterGuidesApp.includes('Roster is ready to build.'));
check('Roster Guides and Death Guard share one source parser',rosterGuides.includes('roster-parser.js?v=2')&&read('books/death-guard/reader.html').includes('roster-parser.js?v=2')&&read('books/death-guard/scripts/roster-filter.js').includes('WHRosterParser.parse'));
check('owned Enhancements are derived without mutating Army Book data',read('books/death-guard/reader.html').includes('roster-enhancements.js?v=3')&&['furnace','critical-hit-5','melee-a-2','plague-wind-range-12','narthecium-d3','mobile'].every(effect=>read('books/shared/roster-enhancements.js').includes(`item.effect === '${effect}'`)));
check('Enhancement UI reports only failed automatic effects',!read('books/shared/roster-enhancements.js').match(/Profile applied|Melee rule applied|Ability upgraded|Keyword applied/)&&read('books/shared/roster-enhancements.js').includes('Effect could not be applied automatically.')&&read('books/shared/roster-enhancements.js').includes('No matching melee weapon profiles were found.'));
check('Core Rules source pages are cached only on demand',!sw.includes('Array.from({length:88}')&&sw.includes('cached || fetchAndCache(request, event)'));
check('Core Rules routed chapters and search are available offline',coreReaderFiles.length===27&&coreReaderFiles.every(file=>sw.includes(`./books/core-rules/reader/${file}`))&&sw.includes('./books/core-rules/reader/search-index.json'));
check('service worker installs the complete app shell atomically',sw.includes('Promise.all(APP_SHELL.map((url) => cache.add(url)))')&&!sw.includes('Promise.allSettled(APP_SHELL'));
const shellSource=sw.match(/const APP_SHELL = \[([\s\S]*?)\n\];/)?.[1]||'';
const missingShellFiles=[...shellSource.matchAll(/"\.\/([^"?]*)(?:\?[^\"]*)?"/g)].map(match=>match[1]).map(file=>file.endsWith('/')?file+'index.html':file).filter(file=>!exists(file));
check('every literal app-shell asset exists',missingShellFiles.length===0,missingShellFiles.join(', '));
check('Core Rules search shares loading and recovers from failure',read('books/core-rules/reader/app.js').includes('let searchIndexPromise')&&read('books/core-rules/reader/app.js').includes('if (!response.ok)')&&read('books/core-rules/reader/app.js').includes('searchIndexPromise = null')&&read('books/core-rules/reader/app.js').includes('Search unavailable. Close and try again.'));
check('Every result search prioritises title matches',read('books/core-rules/reader/app.js').includes('normalizeSearch(a.title).includes(query)')&&read('books/core-rules/app.js').includes('!at.includes(query)')&&read('glossary/viewer.js').includes('if(title===query)return 0')&&read('books/adeptus-mechanicus/scripts/ui-controllers.js').includes("card.style.order=title.includes(query)?'-1':''")&&read('books/adeptus-mechanicus/scripts/ui-controllers.js').includes('!a.title.toLocaleLowerCase().includes(query)'));
check('Core Rules heavy source images remain cached on demand',!sw.includes('Array.from({length:88}')&&!sw.includes('./books/core-rules/assets/diagrams/BenefitOfCover.png'));
check('Core Rules app is cache-busted',read('books/core-rules/index.html').includes('src="app.js?v=2"'));
check('Core Rules promotes official GW source and labels Wahapedia secondary',read('books/core-rules/reader/index.html').includes('Official GW PDF ↗')&&!read('books/core-rules/reader/index.html').includes('Wahapedia 11E ↗')&&read('books/core-rules/reader/movement-phase.html').includes('Secondary reference: Wahapedia 11E ↗'));
check('global glossary runtime exists but is cached on demand',exists('glossary/generated/glossary.en.js')&&!sw.includes('"./glossary/generated/glossary.en.js?v=3"'));
check('Mega Glossary return UI is shared, versioned and precached',read('glossary/index.html').includes('id="libraryBack"')&&read('glossary/index.html').includes('../glossary-return.js?v=1')&&read('glossary/index.html').includes('viewer.js?v=8')&&sw.includes('"./glossary-return.js?v=1"')&&sw.includes('"./glossary/viewer.js?v=8"')&&sw.includes('"./glossary/viewer-progressive.css?v=2"'));
check('Mega Glossary uses one article-first progressive view',read('glossary/viewer.js').includes("history.pushState(null,'',url)")&&!read('glossary/viewer.js').includes('history.replaceState')&&read('glossary/viewer.js').includes("detailsBlock('Registry details'")&&read('glossary/viewer.js').includes('Explore connections ·')&&read('glossary/viewer.js').includes('Search another term'));
check('Every reader can restore its originating term popup',read('glossary-return.js').includes('pathname === location.pathname && target.search === location.search')&&read('books/core-rules/reader/core-concepts.html').includes('../../../glossary-return.js?v=1')&&read('books/core-rules/reader/app.js').includes('triggerIndex')&&read('books/death-guard/mobile/mortarion.html').includes('../../../glossary-return.js?v=1')&&read('books/death-guard/mobile/mobile.js').includes('triggerIndex'));
check('Open popups lock background scrolling',read('books/core-rules/reader/styles.css').includes('html:has(dialog[open])')&&read('books/death-guard/styles/popups.css').includes('body:has(.popup-layer .term-popup)')&&read('books/adeptus-mechanicus/styles/popups.css').includes('body:has(.popup-layer .term-popup)')&&read('glossary/viewer-progressive.css').includes('body:has(dialog[open])'));
check('book popups stay inside the viewport after glossary return',['death-guard','adeptus-mechanicus'].every(slug=>read(`books/${slug}/styles/popups.css`).includes('.popup-layer { position: fixed')&&!read(`books/${slug}/scripts/popup-controller.js`).includes('window.scrollX||0')));
check('glossary return restores scroll before reopening popups',[read('books/core-rules/reader/app.js'),read('books/death-guard/mobile/mobile.js'),read('books/death-guard/scripts/app.js'),read('books/adeptus-mechanicus/scripts/app.js')].every(source=>source.includes('window.scrollTo')&&source.match(/requestAnimationFrame\(\(\)=>\{(?:if\(trigger\)|if\(returnRecord\.popupIds|popups\.restore)/)));
check('Core Rules popup does not impersonate a term trigger',read('books/core-rules/reader/app.js').includes('dialog.dataset.openTerm')&&!read('books/core-rules/reader/app.js').includes('dialog.dataset.term ='));
check('glossary runtime exposes curated matching labels',read('glossary/generated/glossary.en.js').includes('matchLabels'));
const bookHtml=slug=>read(`books/${slug}/${books[slug].reader||'index.html'}`);
check('shared navigation target resolver is loaded and precached',['death-guard','adeptus-mechanicus'].every(slug=>bookHtml(slug).includes('src="../shared/navigation-targets.js?v=1"'))&&sw.includes('"./books/shared/navigation-targets.js?v=1"'));
check('shared datasheet design is loaded and precached',['death-guard','adeptus-mechanicus'].every(slug=>bookHtml(slug).includes('href="../shared/datasheet-system.css?v=6"'))&&sw.includes('"./books/shared/datasheet-system.css?v=6"'));
check('shared datasheets collapse by available card width',read('books/shared/datasheet-system.css').includes('container-type: inline-size')&&read('books/shared/datasheet-system.css').includes('@container (max-width: 760px)'));
check('shared datasheet layout is loaded and precached',['death-guard','adeptus-mechanicus'].every(slug=>bookHtml(slug).includes('src="../shared/datasheet-layout.js?v=2"'))&&sw.includes('"./books/shared/datasheet-layout.js?v=2"'));
check('shared popup profiles are loaded and precached',['death-guard','adeptus-mechanicus'].every(slug=>bookHtml(slug).includes('src="../shared/popup-content.js?v=2"'))&&sw.includes('"./books/shared/popup-content.js?v=2"'));
check('shared glossary autolinker is loaded and precached',['death-guard','adeptus-mechanicus'].every(slug=>bookHtml(slug).includes('src="../shared/glossary-autolink.js?v=8"'))&&sw.includes('"./books/shared/glossary-autolink.js?v=8"'));
check('Roster Guides use the shared entity contract',bookHtml('death-guard').includes('src="../shared/roster-entities.js?v=1"')&&sw.includes('"./books/shared/roster-entities.js?v=1"')&&read('books/death-guard/scripts/roster-filter.js').includes('WHRosterEntities.loadoutIncludesProfile'));
check('multi-profile roster weapons open one grouped popup',read('books/death-guard/scripts/roster-filter.js').includes('DG_ROSTER_TERMS')&&read('books/death-guard/scripts/roster-filter.js').includes('weaponGroups(canonicalTerms,card.id)')&&read('books/shared/popup-content.js').includes('term.profiles?.length'));
check('book navigation measures after glossary autolinking',['death-guard','adeptus-mechanicus'].every(slug=>{const app=read(`books/${slug}/scripts/app.js`);return app.indexOf('WHGlossaryAutolink?.apply')<app.indexOf('new window.DGNavigation');}));
check('Mechanicus heavy source data and PDF are cached on demand',!sw.includes('adeptus-mechanicus-faction-pack-v1.0.pdf')&&!sw.includes('adeptus-mechanicus-codex-datasheets.en.json'));
check('nested Mechanicus service worker was removed',!exists('books/adeptus-mechanicus/service-worker.js'));
const glossaryRegistry=JSON.parse(read('glossary/registry.en.json')).terms;
for(const id of ['core-characteristic-toughness','core-stratagem-fire-overwatch','death-guard-plague','death-guard-army-rules-pact-of-decay','adeptus-mechanicus-detachment-cohort-acquisitus','adeptus-mechanicus-unit-skitarii-rangers'])check(`Mega Glossary contains ${id}`,Boolean(glossaryRegistry[id]));
for(const [slug,book] of Object.entries(books)){
  const html=read(`books/${slug}/${book.reader||'index.html'}`);
  const app=read(`books/${slug}/${book.app}`);
  check(`${slug} glossary loading matches its runtime`,book.usesPopupGlossary===html.includes('../../glossary/generated/glossary.en.js?v=3'));
  if(book.usesPopupGlossary)check(`${slug} popup uses the global glossary`,
    app.includes("WH40K_GLOSSARY?.forBook('"+slug+"')")||
    app.includes("WH40K_GLOSSARY.forBook('"+slug+"')")
  );
}
check('navigation responses keep their own cache URL',sw.includes('fetchAndCache(request, event);')&&!sw.includes('fetchAndCache(request, event, LIBRARY_FALLBACK)'));
check('Death Guard entry routes phone and full readers',read('books/death-guard/index.html').includes('scripts/view-router.js?v=2')&&read('books/death-guard/scripts/view-router.js').includes('phoneUserAgent')&&read('books/death-guard/scripts/view-router.js').includes('smallTouchScreen'));
const viewRouter=read('books/death-guard/scripts/view-router.js');
check('Death Guard view router preserves public query parameters and anchors',viewRouter.includes("params.delete('view')")&&viewRouter.includes('destination.search = params.toString()')&&viewRouter.includes('destination.hash = location.hash'));
check('Core Learn exposes Reference and Mega Glossary',read('books/core-rules/index.html').includes('href="./reader/index.html"')&&read('books/core-rules/index.html').includes('href="../../glossary/index.html"')&&library.includes('href="books/core-rules/index.html"'));
check('Death Guard preserves roster and rule context across views',read('books/death-guard/scripts/app.js').includes("destination.search=params.toString()")&&read('books/death-guard/scripts/app.js').includes("route=id.slice(5)+'.html'")&&read('books/death-guard/mobile/mobile.js').includes('destination.search = params.toString()')&&read('books/death-guard/mobile/index.html').includes('data-view-switch'));
check('Personal Death Guard readers return to Roster Guides',read('books/death-guard/reader.html').includes('data-roster-guides-link hidden')&&read('books/death-guard/scripts/app.js').includes("rosterGuides.hidden=!params.get('roster')")&&read('books/death-guard/mobile/index.html').includes('data-roster-guides-link hidden'));
check('existing public entry routes remain available',[
  'index.html','glossary/index.html','books/death-guard/index.html','books/death-guard/reader.html','books/death-guard/mobile/index.html',
  'books/core-rules/index.html','books/core-rules/reader/index.html','books/adeptus-mechanicus/index.html'
].every(exists));
check('existing public anchors remain available',read('books/death-guard/reader.html').includes('id="unit-mortarion"')&&read('books/core-rules/reader/movement-phase.html').includes('id="rule-09-07"')&&Boolean(glossaryRegistry['core-lethal-hits']));
check('product UI hides internal implementation names',!read('books/core-rules/reader/index.html').match(/Quick Reader|Classic reader|Complete Reader/)&&!read('books/death-guard/index.html').match(/Phone Mode|Full Reader/)&&!read('books/death-guard/mobile/index.html').match(/Phone Mode|Full Reader/)&&!read('books/death-guard/reader.html').match(/clean room|unified visual/i));
check('Death Guard Phone Mode contains every canonical route',exists('books/death-guard/mobile/index.html')&&fs.readdirSync(path.join(root,'books','death-guard','mobile')).filter(name=>name.endsWith('.html')).length===48);
check('Death Guard Phone Mode embeds only page-local glossary summaries',read('books/death-guard/mobile/mortarion.html').includes('data-term-summary=')&&!read('books/death-guard/mobile/mortarion.html').includes('glossary.en.js')&&read('books/death-guard/mobile/mortarion.html').includes('mobile.js?v='));
check('Death Guard datasheets load one shared related rule panel on demand',read('books/death-guard/mobile/mobile.js').includes("fetch('./related-rules.inc?v=2')")&&exists('books/death-guard/mobile/related-rules.inc'));
check('Death Guard Phone Mode never offers Enhancements to Epic Heroes',!read('books/death-guard/mobile/mortarion.html').includes('data-related-tab="enhancements"')&&!read('books/death-guard/mobile/typhus.html').includes('data-related-tab="enhancements"'));
check('Death Guard related rules render inline instead of opening a modal',read('books/death-guard/mobile/mortarion.html').includes('<section class="related-rules"')&&!read('books/death-guard/mobile/mortarion.html').includes('id="relatedRulesDialog"'));
check('Death Guard Full Reader opens related rules in one fixed modal',read('books/death-guard/scripts/app.js').includes("className='related-rules-layer'")&&read('books/death-guard/styles/content.css').includes('.related-rules-layer{position:fixed'));
check('Death Guard related cards use one shared unit eligibility matcher',read('books/death-guard/reader.html').includes('scripts/related-rules.js?v=6')&&read('books/death-guard/mobile/mortarion.html').includes('../scripts/related-rules.js?v=6')&&read('books/death-guard/scripts/related-rules.js').includes("target.includes('DEATH GUARD INFANTRY')"));
check('filtered related rules cannot be redisplayed by card CSS',read('books/death-guard/styles/content.css').includes('.related-rules-layer [hidden],#relatedRulesContent [hidden]{display:none!important}'));
check('Detachment-granted keywords use one shared resolver',read('books/death-guard/scripts/related-rules.js').includes('grantedKeywords(base.slug,[detachment])')&&read('books/death-guard/scripts/roster-filter.js').includes('DGRelatedRules.grantedKeywords'));
check('Legacy saved rosters recover nested New Recruit loadouts',read('books/death-guard/scripts/roster-filter.js').includes('restoreLegacyLoadouts();')&&read('books/death-guard/scripts/roster-filter.js').includes('model.loadouts.push'));

for(const result of results)console.log(`${result.ok?'PASS':'FAIL'}  ${result.name}${result.detail?' — '+result.detail:''}`);
const failed=results.filter(result=>!result.ok);
console.log(`\n${results.length-failed.length}/${results.length} integration checks passed.`);
if(failed.length)process.exitCode=1;
