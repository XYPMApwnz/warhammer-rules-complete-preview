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
assert.equal(digital.records.length,271,'unexpected Wahapedia 11E record count');
assert.equal(new Set(digital.records.map(record=>record.code)).size,digital.records.length,'digital rule codes must be unique');
const recordsByCode=new Map(digital.records.map(record=>[record.code,record]));
for(const record of digital.records){
  const parts=record.code.split('.');
  if(parts.length===3)assert(recordsByCode.has(parts.slice(0,2).join('.')),`${record.code} is not placed under an existing parent rule`);
  const lines=record.text.split('\n').map(line=>line.trim()).filter(Boolean);
  for(let index=1;index<lines.length;index++)assert.notEqual(lines[index].toLowerCase(),lines[index-1].toLowerCase(),`${record.code} repeats the line "${lines[index]}"`);
  for(const other of digital.records){
    if(other===record||!other.text)continue;
    assert(!record.text.includes(`${other.title}\n${other.text}`)&&!record.text.includes(`${other.title.toUpperCase()}\n${other.text}`),`${record.code} embeds the complete ${other.code} rule instead of keeping it in its own place`);
  }
}
assert(recordsByCode.get('04.01.02')?.title==='Sidearms','Sidearms must remain under Select Weapons');
assert(!/SIDEARMS/i.test(recordsByCode.get('04.02')?.text||''),'Sidearms must not leak into Select Targets');
assert(recordsByCode.get('03.04.01')?.title==='What Is Engagement','What Is Engagement must exist under Engagement');
assert(recordsByCode.get('19.04.01')?.title==='Only In Death Does Duty End','Only In Death Does Duty End must exist under Abilities in Attached Units');
assert(!recordsByCode.get('03.04')?.text.includes('WHAT IS ENGAGEMENT?'),'What Is Engagement must not be duplicated in its parent');
assert(!recordsByCode.get('19.04')?.text.includes('ONLY IN DEATH DOES DUTY END'),'Only In Death Does Duty End must not be duplicated in its parent');
assert(recordsByCode.get('02.02.01')?.title==='Modifiers','02.02.01 must remain the complete Modifiers article');
assert(recordsByCode.get('02.02.01')?.text.includes('WHAT ARE MODIFIERS?')&&recordsByCode.get('02.02.01')?.text.includes('When Modifying Characteristics'),'Modifiers must include its introduction and characteristic rules');
assert(recordsByCode.get('24.37.01')?.title==='Torrent Restrictions','24.37.01 needs a semantic title');
for(const artifact of ['STARTING STRENGTH OF 1STARTING STRENGTH','SOURCE OF ABILITY/RULEAPPLIES','INCURSION1000222'])assert(!digital.records.some(record=>record.text.includes(artifact)),`collapsed table leaked into source: ${artifact}`);
const glossary=JSON.parse(fs.readFileSync(path.resolve(root,'..','..','glossary','registry.en.json'),'utf8')).terms;
const glossaryExcludedCodes=new Set(['03.03.01']);
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
    if(glossaryExcludedCodes.has(rule.code)){
      assert(!term,`${rule.code} must remain a reader clarification rather than duplicate Coherency in the glossary`);
      routedRules++;
      continue;
    }
    assert(term,`${rule.code} has no canonical Mega Glossary article`);
    assert(term.summary?.en?.trim(),`${rule.code} has no popup summary`);
    assert(term.definition?.en?.trim(),`${rule.code} has no full glossary article`);
    assert.equal(term.canonicalSource?.locator,rule.code,`${rule.code} glossary article is not aligned with its Core Rules source`);
    assert(term.matchLabels?.includes(rule.code),`${rule.code} is not a hidden glossary match label`);
    routedRules++;
  }
  if(index>0)assert(page.includes(`href="${studyIds[index-1]}.html"`),`${id} is missing previous chapter`);
  if(index<studyIds.length-1)assert(page.includes(`href="${studyIds[index+1]}.html"`),`${id} is missing next chapter`);
  for(const termId of [...page.matchAll(/data-term="([^"]+)"/g)].map(match=>match[1]))assert(glossary[termId],`${id} contains unresolved term ${termId}`);
}
assert.equal(routedRules,271,'routed reader must contain every 11E reference record');
const searchIndex=JSON.parse(fs.readFileSync(path.join(readerRoot,'search-index.json'),'utf8'));
assert.equal(searchIndex.length,271,'search index must contain every 11E reference record');
assert.equal(new Set(searchIndex.map(item=>item.code)).size,271,'search index codes must be unique');
for(const item of searchIndex){
  const [file,anchor]=item.url.split('#');
  const target=fs.readFileSync(path.join(readerRoot,file),'utf8');
  assert(target.includes(`id="${anchor}"`),`search result ${item.code} has a broken destination`);
  assert(item.code&&item.title&&item.chapter&&item.text,`search result ${item.code} is incomplete`);
}
assert(!fs.existsSync(path.join(readerRoot,'rules-appendix.html')),'raw Rules Appendix must not be a primary reader chapter');
const generatedReader=readerFiles.map(file=>fs.readFileSync(path.join(readerRoot,file),'utf8')).join('\n');
assert(!generatedReader.includes('class="rule-code"'),'rule codes must not be visible');
assert(!generatedReader.includes('<h3><button class="term'),'rule titles must not open definitions of themselves');
assert(!generatedReader.includes('Introduction 2')&&!generatedReader.includes('Introduction 7'),'introduction prose must not become fake numbered rules');
const visibleReader=generatedReader.replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<style[\s\S]*?<\/style>/g,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
assert(!/\b\d{2}\.\d{2}(?:\.\d{2})?\b/.test(visibleReader),'technical rule codes must stay out of visible reader text');
assert(!/\((?:03|04|05|15|16|24)\)/.test(visibleReader),'chapter references must use clickable names instead of numeric codes');
assert(generatedReader.includes('<h4 class="see-also">See also</h4>'),'See also index must remain available');
for(const block of generatedReader.matchAll(/<h4 class="see-also">See also<\/h4><ul>([\s\S]*?)<\/ul>/g)){
  for(const item of block[1].matchAll(/<li>([\s\S]*?)<\/li>/g)){
    assert(/^<button class="term rule-reference"/.test(item[1]),'every See also item must be one clickable rule reference');
    assert(!/>[^<]*\]<\/button>/.test(item[1]),'See also labels must not retain a closing source bracket');
  }
}
assert(generatedReader.includes('class="term rule-reference" type="button" data-term="core-rule-02-02-01-modifiers"')&&generatedReader.includes('>Modified Characteristics</button>'),'See also keeps source labels clickable');
const datasheetsReader=fs.readFileSync(path.join(readerRoot,'datasheets.html'),'utf8');
for(const [id,label] of Object.entries({
  'core-characteristic-move':'Move',
  'core-characteristic-toughness':'Toughness',
  'core-characteristic-save':'Save',
  'core-characteristic-invulnerable-save':'Invulnerable Save',
  'core-characteristic-wounds':'Wounds',
  'core-characteristic-leadership':'Leadership',
  'core-objective-control':'Objective Control',
  'core-characteristic-range':'Range',
  'core-characteristic-attacks':'Attacks',
  'core-characteristic-ballistic-skill':'Ballistic Skill',
  'core-characteristic-weapon-skill':'Weapon Skill',
  'core-characteristic-strength':'Strength',
  'core-characteristic-armour-penetration':'Armour Penetration',
  'core-characteristic-damage':'Damage'
}))assert(new RegExp(`data-term="${id}"[^>]*>${label}<\\/button> \\([^)]*\\):`).test(datasheetsReader),`${label} definition must open its glossary article`);
assert(!datasheetsReader.includes('aria-label="Glossary concepts for 02.02"')&&!datasheetsReader.includes('aria-label="Glossary concepts for 02.03"')&&!datasheetsReader.includes('aria-label="Glossary concepts for 02.04"'),'characteristics belong on their inline definitions, not in a detached glossary strip');
const conceptsReader=fs.readFileSync(path.join(readerRoot,'core-concepts.html'),'utf8');
const unitsArticle=conceptsReader.slice(conceptsReader.indexOf('id="rule-01-02"'),conceptsReader.indexOf('id="rule-01-03"'));
for(const child of digital.records.filter(record=>record.code.startsWith('01.02.'))){
  assert(unitsArticle.includes(`>${child.title}</button>`),`Units and Models See also is missing ${child.title}`);
  assert(unitsArticle.includes(`id="rule-${child.code.replaceAll('.','-')}"`),`Units and Models is missing the full ${child.title} subrule`);
}
assert(unitsArticle.includes('>Frame</button>'),'Units and Models See also is missing Frame');
assert.equal(glossary['core-rule-03-03-01-what-is-coherency'],undefined,'What Is Coherency must not duplicate the Coherency glossary article');
assert(!glossary['core-rule-03-03-coherency'].definition.en.includes('WHAT IS COHERENCY'),'Coherency glossary article must contain the rule without the duplicate explainer');
assert(glossary['core-lethal-hits'].summary.en.includes('automatically wounds')&&glossary['core-lethal-hits'].summary.en.includes('No Wound roll'),'Lethal Hits popup must explain the mechanic');
assert(glossary['core-devastating-wounds'].summary.en.includes('mortal wounds equal')&&glossary['core-devastating-wounds'].summary.en.includes('Excess mortal wounds are lost'),'Devastating Wounds popup must explain the mechanic');
assert(!generatedReader.includes('PhaseAbility_'),'decorative phase icons must not render as rule diagrams');
assert(!generatedReader.includes('types are marked with this icon'),'orphaned phase-icon captions must not render');
assert.equal((generatedReader.match(/data-term="core-characteristic-attacks"[^>]*>Attacks<\/button>/g)||[]).length,1,'Attacks is linked only at its characteristic definition');
const ignoredLabels=new Set(['you','within','weapons','destroyed','dice','set up','keywords','shoot','shooting','dense']);
for(const button of generatedReader.matchAll(/<button class="([^"]*\bterm\b[^"]*)"[^>]*>([^<]+)<\/button>/g))if(!button[1].includes('rule-reference'))assert(!ignoredLabels.has(button[2].trim().toLowerCase()),`${button[2]} must not clutter prose`);
for(const artifact of ['ST ARTS','EFFEC T','BLUEBLUE','REDRED','Object ives','Adv ance','Dama ge','Sa ve','W ound','How man y','Each t ime','RULES APPENDIXOBJECTIVES'])assert(!generatedReader.includes(artifact),`PDF extraction artifact leaked into reader: ${artifact}`);
const diagramCount=Object.values(digital.images).flat().length;
assert.equal(diagramCount,42,'unexpected diagram inventory');
const decorativePhaseIcons=new Set(['PhaseAbility_Move.png','PhaseAbility_Shoot.png','PhaseAbility_Fight.png']);
for(const image of Object.values(digital.images).flat()){
  assert(fs.existsSync(path.join(root,'assets','diagrams',image.file)),`missing 11E diagram ${image.file}`);
  const optimizedFile=image.file.replace(/\.png$/i,'.webp');
  assert(fs.existsSync(path.join(root,'assets','diagrams',optimizedFile)),`missing optimized 11E diagram ${optimizedFile}`);
  if(decorativePhaseIcons.has(image.file)){assert(!generatedReader.includes(`assets/diagrams/${optimizedFile}`),`decorative phase icon must stay out of the reader: ${optimizedFile}`);continue;}
  assert(generatedReader.includes(`assets/diagrams/${optimizedFile}`),`reader does not display diagram ${optimizedFile}`);
  assert(new RegExp(`<figure data-visual-rule="[^"]+">[\\s\\S]*?assets/diagrams/${optimizedFile.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`).test(generatedReader),`${optimizedFile} is not attached to a specific rule`);
}
assert(!generatedReader.includes('Examples & diagrams'),'chapter-level diagram dump must not return');
assert(generatedReader.includes('id="imageDialog"'),'rule diagrams use one shared image dialog');
assert(fs.readFileSync(path.join(readerRoot,'app.js'),'utf8').includes("event.target.closest('.rule-visuals a')"),'rule diagram clicks open the shared image dialog');
const readerStyles=fs.readFileSync(path.join(readerRoot,'styles.css'),'utf8');
assert(readerStyles.includes('*::-webkit-scrollbar-thumb'),'reader scrollbars use the shared bronze design');
assert(readerStyles.includes('scroll-margin-top:calc(var(--header) + env(safe-area-inset-top) + 18px)'),'reader anchor jumps must clear the fixed header and safe area');
assert(!readerStyles.includes('.brand small,.current,.library{display:none}'),'mobile header keeps its current chapter and Library action');
const muster=fs.readFileSync(path.join(readerRoot,'muster-armies.html'),'utf8');
for(const value of ['25.01','25.02','25.03','25.04','Incursion','Strike Force','1000','2000'])assert(muster.includes(value),`Muster Armies is missing ${value}`);
const readerIndex=fs.readFileSync(path.join(readerRoot,'index.html'),'utf8');
for(const id of studyIds)assert(readerIndex.includes(`href="${id}.html"`),`reader Start is missing ${id}`);
assert(readerIndex.includes('id="searchDialog"')&&readerIndex.includes('id="searchButton"'),'reader shell must expose local search');
const readerApp=fs.readFileSync(path.join(readerRoot,'app.js'),'utf8');
assert(readerApp.includes("fetch('search-index.json')")&&readerApp.includes("event.key.toLowerCase() === 'k'"),'reader search must load locally and support Ctrl/Cmd+K');
assert(readerIndex.includes('assets.warhammer-community.com')&&readerIndex.includes('Official GW PDF ↗'),'reader Start must promote the official GW PDF');
assert(!readerIndex.includes('Wahapedia 11E ↗'),'reader Start must not promote a secondary source');
const sourcePage=fs.readFileSync(path.join(readerRoot,'movement-phase.html'),'utf8');
assert(sourcePage.indexOf('Official GW PDF ↗')<sourcePage.indexOf('Secondary reference: Wahapedia 11E ↗'),'official source must precede the secondary reference');
const abilitiesPage=fs.readFileSync(path.join(readerRoot,'core-abilities.html'),'utf8');
assert(abilitiesPage.includes('href="#rule-24-38"'),'Core Abilities contents must not truncate later rules');
console.log(`QA passed: ${designedIds.length} designed lessons, ${studyIds.length} reader chapters, ${digital.records.length} Wahapedia 11E records, ${diagramCount} diagrams, 88 official source pages.`);
