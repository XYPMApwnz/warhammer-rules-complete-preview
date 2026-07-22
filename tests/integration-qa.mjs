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
  'death-guard':{version:'6',app:'scripts/app.js',usesPopupGlossary:true,files:['assets/icon-v4.svg','styles/tokens.css','styles/layout.css','styles/navigation.css','styles/content.css','styles/popups.css','scripts/data.js','scripts/navigation-controller.js','scripts/popup-controller.js','scripts/journey-controller.js','scripts/ui-controllers.js','scripts/app.js']},
  'core-rules':{version:null,app:'app.js',usesPopupGlossary:false,files:['styles.css','config.js','basic-content.js','app.js','content/core-rules.source.en.js','content/core-rules.en.js']},
  'adeptus-mechanicus':{version:'10',app:'scripts/app.js',usesPopupGlossary:true,files:['assets/mechanicus-logo.png','styles/tokens.css','styles/layout.css','styles/navigation.css','styles/content.css','styles/popups.css','styles/mechanicus.css','scripts/data.js','scripts/navigation-controller.js','scripts/popup-controller.js','scripts/journey-controller.js','scripts/ui-controllers.js','scripts/app.js']}
};

for(const file of ['service-worker.js',...Object.entries(books).map(([slug,book])=>`books/${slug}/${book.app}`)]){
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
    const suffix=book.version&&/\.(css|js)$/.test(file)?`?v=${book.version}`:'';
    return !sw.includes(`"./books/${slug}/${file}${suffix}"`);
  });
  check(`${slug} shell is precached`,missing.length===0,missing.join(', '));
}

check('preview cache namespace is isolated',sw.includes('warhammer-rules-complete-preview-'));
check('preview cache revision is current',sw.includes('`${CACHE_PREFIX}v9`'));
check('library header opens the Mega Glossary',library.includes('class="glossary-link"')&&library.includes('href="glossary/index.html"'));
check('Core Rules source pages are cached only on demand',!sw.includes('Array.from({length:88}')&&sw.includes('cached || fetchAndCache(request)'));
check('global glossary runtime exists and is precached',exists('glossary/generated/glossary.en.js')&&sw.includes('"./glossary/generated/glossary.en.js?v=4"'));
for(const [slug,book] of Object.entries(books)){
  const html=read(`books/${slug}/index.html`);
  const app=read(`books/${slug}/${book.app}`);
  check(`${slug} loads the global glossary`,html.includes('../../glossary/generated/glossary.en.js?v=4'));
  if(book.usesPopupGlossary)check(`${slug} popup uses the global glossary`,app.includes("WH40K_GLOSSARY?.forBook('"+slug+"')"));
}
check('navigation responses keep their own cache URL',sw.includes('fetchAndCache(request);')&&!sw.includes('fetchAndCache(request, LIBRARY_FALLBACK)'));

for(const result of results)console.log(`${result.ok?'PASS':'FAIL'}  ${result.name}${result.detail?' — '+result.detail:''}`);
const failed=results.filter(result=>!result.ok);
console.log(`\n${results.length-failed.length}/${results.length} integration checks passed.`);
if(failed.length)process.exitCode=1;
