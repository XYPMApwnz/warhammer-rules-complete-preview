import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot=root;
const read=(file)=>fs.readFileSync(path.join(root,file),'utf8');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(sourceRoot,'content','core-rules.source.en.js'),'utf8'),context);
vm.runInNewContext(fs.readFileSync(path.join(sourceRoot,'content','core-rules.en.js'),'utf8'),context);
vm.runInNewContext(read('config.js'),context);
vm.runInNewContext(read('basic-content.js'),context);

const data=context.window.CORE_RULES,pdf=context.window.CORE_PDF_SOURCE,modules=context.window.CORE_LEARN_MODULES,basic=context.window.CORE_BASIC_LAYOUTS;
const sourceIds=[data.introduction.id,...data.groups.flatMap((group)=>group.sections.map((section)=>section.id))];
const studyIds=modules.flatMap((module)=>module.sections);
assert.deepEqual([...studyIds].sort(),[...sourceIds].sort(),'study path must include every source section exactly once');
assert.equal(new Set(studyIds).size,studyIds.length,'study path contains duplicate sections');
assert.equal(studyIds.length,26,'unexpected lesson count');
for(const id of studyIds.filter(id=>id!=='muster-armies')){assert(pdf.sections[id]?.length,`${id} has no source pages`);assert(Object.hasOwn(pdf.rules,id),`${id} has no source rule collection`);}
assert.equal(Object.values(pdf.rules).flat().length,146,'unexpected structured rule count');
assert.equal(Object.keys(pdf.pages).length,88,'complete page transcript is required');
for(let page=1;page<=88;page++)assert(fs.existsSync(path.join(root,'assets','pages',`page-${String(page).padStart(2,'0')}.jpg`)),`missing rendered source page ${page}`);
const app=read('app.js'),html=read('index.html');
assert(app.includes("main:document.getElementById('main')"),'drawer accessibility must own the main content element');
const designedIds=['introduction','core-concepts','datasheets','moving','making-attacks','attack-sequence','other-concepts'];
assert.deepEqual(Object.keys(basic),designedIds,'only the requested first seven lessons should have designed layouts');
assert(app.includes('CORE_BASIC_LAYOUTS'),'designed lesson data must be rendered');
assert(html.includes('basic-content.js'),'designed lesson content must load before the application');
assert(basic.introduction.paragraphs.length===7,'complete introduction prose is required');
assert(basic.datasheets.visuals.some((item)=>item.src.includes('datasheet-boyz')),'annotated datasheet visual is required');
assert(app.includes('renderDatasheetLesson'),'datasheet must use a dedicated annotated-key layout');
assert(app.includes("datasheet-number',number"),'datasheet text must visibly match markers 1-7');
assert(app.includes("datasheet-picture-button','PICTURE ↑'"),'every datasheet key needs a picture jump');
assert(app.includes('map.dataset.returnTarget=item.id'),'picture back action must remember its originating key');
assert.equal(basic.moving.visuals.length,4,'all requested movement diagrams are required');
assert.equal(basic['attack-sequence'].visuals.length,7,'attack sequence tables and examples are required');
assert(basic['other-concepts'].visuals.some((item)=>item.src.includes('visibility')),'visibility examples are required');
for(const layout of Object.values(basic))for(const visual of layout.visuals||[])assert(fs.existsSync(path.join(root,visual.src)),`missing source crop ${visual.src}`);
assert(app.includes('rule.text'),'source text must remain searchable');
assert(app.includes('pdf.pages[String(page)]'),'complete page transcripts must be rendered');
assert(!app.includes('sourceExcerpt'),'learning version must not truncate source rules');
assert(!app.includes('section.summary'),'learning version must not render authored section summaries');
assert(html.includes('Original pages'),'original PDF page view must be available');
assert(html.includes('Original PDF pages are the authoritative lesson content.'),'source boundary must be explicit');
assert(html.includes('Contents refers to an unavailable page 89.'),'missing source page 89 must be disclosed');
for(const file of ['config.js','basic-content.js','app.js','styles.css'])assert(fs.existsSync(path.join(root,file)),`missing ${file}`);
const readerRoot=path.join(root,'reader');
const readerFiles=fs.readdirSync(readerRoot).filter(file=>file.endsWith('.html'));
assert.equal(readerFiles.length,27,'complete routed reader requires Start plus 26 section pages');
assert(fs.existsSync(path.join(readerRoot,'build.mjs')),'routed reader generator is required');
const digital=JSON.parse(read('content/core-rules.digital-11e.json'));
assert.equal(digital.meta.edition,'11E','reader must use the 11E digital reference');
assert.equal(digital.records.length,269,'unexpected Wahapedia 11E record count');
assert.equal(new Set(digital.records.map(record=>record.code)).size,digital.records.length,'digital rule codes must be unique');
const glossary=JSON.parse(fs.readFileSync(path.resolve(root,'..','..','glossary','registry.en.json'),'utf8')).terms;
const coreTermsByCode=new Map();
for(const term of Object.values(glossary).filter(term=>term.canonicalSource?.documentId==='core-rules'&&term.kind!=='keyword')){
  const code=String(term.canonicalSource.locator||'').match(/^(\d{2}\.\d{2}(?:\.\d{2})?)/)?.[1];
  if(code)coreTermsByCode.set(code,[...(coreTermsByCode.get(code)||[]),term]);
}
let routedRules=0;
for(const [index,id] of studyIds.entries()){
  const file=path.join(readerRoot,`${id}.html`);
  assert(fs.existsSync(file),`missing routed reader page ${id}`);
  const page=fs.readFileSync(file,'utf8');
  assert(page.includes(`href="${id}.html" aria-current="page"`),`${id} must be current in its navigation`);
  for(const target of studyIds)assert(page.includes(`href="${target}.html"`),`${id} navigation is missing ${target}`);
  const sectionNumber=data.groups.flatMap(group=>group.sections).find(section=>section.id===id)?.number;
  const routedRecords=sectionNumber?digital.records.filter(rule=>rule.code.startsWith(`${sectionNumber.padStart(2,'0')}.`)):[];
  for(const rule of routedRecords){
    assert(page.includes(rule.code),`${id} is missing rule ${rule.code}`);
    const encodedTitle=rule.title.replace(/\s+/g,' ').trim().replaceAll('&','&amp;').replaceAll("'",'&#39;');
    assert(page.includes(encodedTitle),`${id} is missing title ${rule.title}`);
    const title=rule.title.replace(/^\d+\.\s*/,'').trim().toLowerCase();
    const term=(coreTermsByCode.get(rule.code)||[]).find(candidate=>candidate.title.en.trim().toLowerCase()===title)||(coreTermsByCode.get(rule.code)||[])[0];
    assert(term,`${rule.code} has no canonical Mega Glossary article`);
    assert(page.includes(`data-term="${term.id}"`),`${rule.code} does not link to ${term.id}`);
    routedRules++;
  }
  if(index>0)assert(page.includes(`href="${studyIds[index-1]}.html"`),`${id} is missing previous chapter`);
  if(index<studyIds.length-1)assert(page.includes(`href="${studyIds[index+1]}.html"`),`${id} is missing next chapter`);
  for(const termId of [...page.matchAll(/data-term="([^"]+)"/g)].map(match=>match[1]))assert(glossary[termId],`${id} contains unresolved term ${termId}`);
}
assert.equal(routedRules,269,'routed reader must contain every 11E reference record');
assert(!fs.existsSync(path.join(readerRoot,'rules-appendix.html')),'raw Rules Appendix must not be a primary reader chapter');
const generatedReader=readerFiles.map(file=>fs.readFileSync(path.join(readerRoot,file),'utf8')).join('\n');
for(const term of Object.values(glossary).filter(term=>term.canonicalSource?.documentId==='core-rules'&&term.kind!=='keyword'))assert(generatedReader.includes(`data-term="${term.id}"`),`${term.id} has no clickable Core Rules equivalent`);
for(const artifact of ['ST ARTS','EFFEC T','BLUEBLUE','REDRED','Object ives','Adv ance','Dama ge','Sa ve','W ound','How man y','Each t ime','RULES APPENDIXOBJECTIVES'])assert(!generatedReader.includes(artifact),`PDF extraction artifact leaked into reader: ${artifact}`);
const diagramCount=Object.values(digital.images).flat().length;
assert.equal(diagramCount,42,'unexpected diagram inventory');
for(const image of Object.values(digital.images).flat()){
  assert(fs.existsSync(path.join(root,'assets','diagrams',image.file)),`missing 11E diagram ${image.file}`);
  assert(generatedReader.includes(`assets/diagrams/${image.file}`),`reader does not display diagram ${image.file}`);
  assert(new RegExp(`<figure data-visual-rule="[^"]+">[\\s\\S]*?assets/diagrams/${image.file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`).test(generatedReader),`${image.file} is not attached to a specific rule`);
}
assert(!generatedReader.includes('Examples & diagrams'),'chapter-level diagram dump must not return');
assert(generatedReader.includes('id="imageDialog"'),'rule diagrams use one shared image dialog');
assert(fs.readFileSync(path.join(readerRoot,'app.js'),'utf8').includes("event.target.closest('.rule-visuals a')"),'rule diagram clicks open the shared image dialog');
const readerStyles=fs.readFileSync(path.join(readerRoot,'styles.css'),'utf8');
assert(readerStyles.includes('*::-webkit-scrollbar-thumb'),'reader scrollbars use the shared bronze design');
assert(!readerStyles.includes('.brand small,.current,.library{display:none}'),'mobile header keeps its current chapter and Library action');
const muster=fs.readFileSync(path.join(readerRoot,'muster-armies.html'),'utf8');
for(const value of ['25.01','25.02','25.03','25.04','Incursion','Strike Force','1000','2000'])assert(muster.includes(value),`Muster Armies is missing ${value}`);
const readerIndex=fs.readFileSync(path.join(readerRoot,'index.html'),'utf8');
for(const id of studyIds)assert(readerIndex.includes(`href="${id}.html"`),`reader Start is missing ${id}`);
console.log(`QA passed: ${designedIds.length} designed lessons, ${studyIds.length} reader chapters, ${digital.records.length} Wahapedia 11E records, ${diagramCount} diagrams, 88 official source pages.`);
