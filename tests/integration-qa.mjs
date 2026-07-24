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
const sw=read('service-worker.js');
const books={
  'death-guard':{version:'9',versions:{'styles/navigation.css':'10','styles/content.css':'16','styles/popups.css':'15','scripts/navigation-controller.js':'13','scripts/popup-controller.js':'17','scripts/full-entry-controller.js':'5','scripts/journey-controller.js':'11','scripts/ui-controllers.js':'11','scripts/app.js':'17'},app:'scripts/app.js',usesPopupGlossary:true,files:['assets/icon-v4.svg','styles/tokens.css','styles/layout.css','styles/navigation.css','styles/content.css','styles/popups.css','scripts/navigation-controller.js','scripts/popup-controller.js','scripts/full-entry-controller.js','scripts/journey-controller.js','scripts/ui-controllers.js','scripts/app.js']},
  'core-rules':{version:null,versions:{'app.js':'1'},app:'app.js',usesPopupGlossary:false,files:['styles.css','config.js','basic-content.js','app.js','content/core-rules.source.en.js','content/core-rules.en.js']},
  'adeptus-mechanicus':{version:'13',versions:{'styles/content.css':'14','styles/popups.css':'15','scripts/popup-controller.js':'18','scripts/app.js':'17'},app:'scripts/app.js',usesPopupGlossary:true,files:['assets/mechanicus-logo.png','styles/tokens.css','styles/layout.css','styles/navigation.css','styles/content.css','styles/popups.css','styles/mechanicus.css','scripts/data.js','scripts/navigation-controller.js','scripts/popup-controller.js','scripts/journey-controller.js','scripts/ui-controllers.js','scripts/app.js']}
};

for(const file of ['service-worker.js','books/shared/navigation-targets.js','books/shared/datasheet-layout.js',...Object.entries(books).map(([slug,book])=>`books/${slug}/${book.app}`)]){
  try{new vm.Script(read(file),{filename:file});check(file+' syntax',true);}
  catch(error){check(file+' syntax',false,error.message);}
}

for(const [slug,book] of Object.entries(books)){
  const html=read(`books/${slug}/index.html`);
  const app=read(`books/${slug}/${book.app}`);
  check(`${slug} card opens the real reader`,library.includes(`href="books/${slug}/index.html"`));
  check(`${slug} reader and shell files exist`,exists(`books/${slug}/index.html`)&&book.files.every(file=>exists(`books/${slug}/${file}`)),book.files.filter(file=>!exists(`books/${slug}/${file}`)).join(', '));
  check(`${slug} links to the root manifest`,html.includes('href="../../manifest.webmanifest"'));
  check(`${slug} exposes the shared library link`,html.includes('href="../../index.html"'));
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

check('preview cache namespace is isolated',sw.includes('warhammer-rules-complete-preview-'));
check('preview cache revision is content-derived',exists('glossary/generated/cache-revision.js')&&sw.includes('importScripts("./glossary/generated/cache-revision.js")')&&sw.includes('self.WH40K_CACHE_REVISION'));
check('library header opens the Mega Glossary',library.includes('class="glossary-link"')&&library.includes('href="glossary/index.html"'));
check('Core Rules source pages are cached only on demand',!sw.includes('Array.from({length:88}')&&sw.includes('cached || fetchAndCache(request)'));
check('Core Rules app is cache-busted',read('books/core-rules/index.html').includes('src="app.js?v=1"'));
check('global glossary runtime exists and is precached',exists('glossary/generated/glossary.en.js')&&sw.includes('"./glossary/generated/glossary.en.js?v=2"'));
check('Mega Glossary return UI is versioned and precached',read('glossary/index.html').includes('id="libraryBack"')&&read('glossary/index.html').includes('viewer.js?v=3')&&sw.includes('"./glossary/viewer.js?v=3"'));
check('glossary runtime exposes curated matching labels',read('glossary/generated/glossary.en.js').includes('matchLabels'));
check('shared navigation target resolver is loaded and precached',['death-guard','adeptus-mechanicus'].every(slug=>read(`books/${slug}/index.html`).includes('src="../shared/navigation-targets.js?v=1"'))&&sw.includes('"./books/shared/navigation-targets.js?v=1"'));
check('shared datasheet design is loaded and precached',['death-guard','adeptus-mechanicus'].every(slug=>read(`books/${slug}/index.html`).includes('href="../shared/datasheet-system.css?v=4"'))&&sw.includes('"./books/shared/datasheet-system.css?v=4"'));
check('shared datasheet layout is loaded and precached',['death-guard','adeptus-mechanicus'].every(slug=>read(`books/${slug}/index.html`).includes('src="../shared/datasheet-layout.js?v=2"'))&&sw.includes('"./books/shared/datasheet-layout.js?v=2"'));
check('shared popup profiles are loaded and precached',['death-guard','adeptus-mechanicus'].every(slug=>read(`books/${slug}/index.html`).includes('src="../shared/popup-content.js?v=1"'))&&sw.includes('"./books/shared/popup-content.js?v=1"'));
check('shared glossary autolinker is loaded and precached',['death-guard','adeptus-mechanicus'].every(slug=>read(`books/${slug}/index.html`).includes('src="../shared/glossary-autolink.js?v=8"'))&&sw.includes('"./books/shared/glossary-autolink.js?v=8"'));
check('book navigation measures after glossary autolinking',['death-guard','adeptus-mechanicus'].every(slug=>{const app=read(`books/${slug}/scripts/app.js`);return app.indexOf('WHGlossaryAutolink?.apply')<app.indexOf('new window.DGNavigation');}));
check('Mechanicus offline data and PDF are owned by the root worker',sw.includes('adeptus-mechanicus-faction-pack-v1.0.pdf')&&sw.includes('adeptus-mechanicus-codex-datasheets.en.json'));
check('nested Mechanicus service worker was removed',!exists('books/adeptus-mechanicus/service-worker.js'));
const glossaryRegistry=JSON.parse(read('glossary/registry.en.json')).terms;
for(const id of ['core-characteristic-toughness','core-stratagem-fire-overwatch','death-guard-plague','force-disposition-take-and-hold','adeptus-mechanicus-detachment-cohort-acquisitus','adeptus-mechanicus-unit-skitarii-rangers'])check(`Mega Glossary contains ${id}`,Boolean(glossaryRegistry[id]));
for(const [slug,book] of Object.entries(books)){
  const html=read(`books/${slug}/index.html`);
  const app=read(`books/${slug}/${book.app}`);
  check(`${slug} loads the global glossary`,html.includes('../../glossary/generated/glossary.en.js?v=2'));
  if(book.usesPopupGlossary)check(`${slug} popup uses the global glossary`,
    app.includes("WH40K_GLOSSARY?.forBook('"+slug+"')")||
    app.includes("WH40K_GLOSSARY.forBook('"+slug+"')")
  );
}
check('navigation responses keep their own cache URL',sw.includes('fetchAndCache(request);')&&!sw.includes('fetchAndCache(request, LIBRARY_FALLBACK)'));

for(const result of results)console.log(`${result.ok?'PASS':'FAIL'}  ${result.name}${result.detail?' — '+result.detail:''}`);
const failed=results.filter(result=>!result.ok);
console.log(`\n${results.length-failed.length}/${results.length} integration checks passed.`);
if(failed.length)process.exitCode=1;
