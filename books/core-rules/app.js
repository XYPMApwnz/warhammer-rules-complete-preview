(function () {
  'use strict';

  const model=window.CORE_RULES;
  const pdf=window.CORE_PDF_SOURCE;
  const modules=window.CORE_LEARN_MODULES;
  const basicLayouts=window.CORE_BASIC_LAYOUTS||{};
  const sourceSections=[model.introduction,...model.groups.flatMap((group)=>group.sections)];
  const sectionById=new Map(sourceSections.map((section)=>[section.id,section]));
  const moduleBySection=new Map(modules.flatMap((module)=>module.sections.map((id)=>[id,module])));
  const sequence=modules.flatMap((module)=>module.sections);
  const sourcePdf='https://assets.warhammer-community.com/eng_01-06_warhammer40k_new40k_core_rules-was6fbu1ix-hfewhmxyiy.pdf';

  const elements={
    body:document.body,panel:document.getElementById('studyPanel'),nav:document.getElementById('studyNav'),scrim:document.getElementById('scrim'),menu:document.getElementById('menuButton'),
    home:document.getElementById('homeButton'),start:document.getElementById('startScreen'),lesson:document.getElementById('lesson'),startButton:document.getElementById('startButton'),resumeButton:document.getElementById('resumeButton'),
    module:document.getElementById('lessonModule'),title:document.getElementById('lessonTitle'),source:document.getElementById('lessonSource'),complete:document.getElementById('completeButton'),read:document.getElementById('readView'),sourceView:document.getElementById('sourceView'),
    readTab:document.getElementById('readTab'),sourceTab:document.getElementById('sourceTab'),previous:document.getElementById('previousButton'),next:document.getElementById('nextButton'),progress:document.getElementById('progressLabel'),bar:document.getElementById('progressBar'),
    searchButton:document.getElementById('searchButton'),searchDialog:document.getElementById('searchDialog'),searchClose:document.getElementById('searchClose'),searchInput:document.getElementById('searchInput'),searchResults:document.getElementById('searchResults'),theme:document.getElementById('themeButton')
  };

  const state={current:null,completed:new Set(),last:null,view:'source'};
  const FOCUSABLE='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  let drawerReturnFocus=null,searchReturnFocus=null;
  try{JSON.parse(localStorage.getItem('core-learn-completed')||'[]').forEach((id)=>{if(sequence.includes(id))state.completed.add(id);});state.last=localStorage.getItem('core-learn-last');state.view=localStorage.getItem('core-learn-view')||'source';}catch(_){}

  function node(tag,className,text){const item=document.createElement(tag);if(className)item.className=className;if(text!==undefined)item.textContent=text;return item;}
  function pagesFor(id){return pdf.sections[id]||[];}
  function pageLabel(pages){if(!pages.length)return'PDF source';return pages.length===1?`PDF page ${pages[0]}`:`PDF pages ${pages[0]}-${pages.at(-1)}`;}
  function save(){try{localStorage.setItem('core-learn-completed',JSON.stringify([...state.completed]));if(state.current)localStorage.setItem('core-learn-last',state.current);localStorage.setItem('core-learn-view',state.view);}catch(_){}}
  function setDrawerAccessibility(open){
    const modal=window.matchMedia('(max-width:860px)').matches;
    elements.panel.inert=modal&&!open;
    elements.panel.setAttribute('aria-hidden',String(modal&&!open));
    elements.main.inert=modal&&open;
    for(const control of document.querySelectorAll('.topbar > :not(#menuButton)'))control.inert=modal&&open;
  }
  function closeDrawer({restoreFocus=false}={}){
    const wasOpen=elements.body.classList.contains('drawer-open');
    elements.body.classList.remove('drawer-open');elements.scrim.hidden=true;elements.menu.setAttribute('aria-expanded','false');
    setDrawerAccessibility(false);
    if(wasOpen&&restoreFocus)(drawerReturnFocus||elements.menu).focus({preventScroll:true});
    drawerReturnFocus=null;
  }
  function setPageBlocked(blocked){
    for(const child of document.body.children){
      if(child===elements.searchDialog||child.tagName==='SCRIPT')continue;
      child.inert=blocked;
      if(blocked){
        child.dataset.searchAriaHidden=child.getAttribute('aria-hidden')??'';
        child.setAttribute('aria-hidden','true');
      }else if(Object.hasOwn(child.dataset,'searchAriaHidden')){
        const previous=child.dataset.searchAriaHidden;delete child.dataset.searchAriaHidden;
        previous===''?child.removeAttribute('aria-hidden'):child.setAttribute('aria-hidden',previous);
      }
    }
  }
  function trapFocus(container,event){
    const controls=[...container.querySelectorAll(FOCUSABLE)].filter(control=>control.getClientRects().length);
    if(!controls.length)return;
    const first=controls[0],last=controls.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
  function setView(view){state.view=view==='source'?'source':'read';elements.read.hidden=state.view!=='read';elements.sourceView.hidden=state.view!=='source';elements.readTab.setAttribute('aria-selected',String(state.view==='read'));elements.sourceTab.setAttribute('aria-selected',String(state.view==='source'));save();}

  function renderNavigation(){
    modules.forEach((module)=>{
      const group=node('section','nav-module');group.dataset.module=module.id;
      group.append(node('h2','',module.title));
      module.sections.forEach((id)=>{
        const section=sectionById.get(id);if(!section)return;
        const button=node('button','lesson-link');button.type='button';button.dataset.lesson=id;
        const stateMark=node('span','lesson-state','');stateMark.setAttribute('aria-hidden','true');
        const copy=node('span','lesson-link-copy');copy.append(node('strong','',section.title),node('small','',pageLabel(pagesFor(id))));
        button.append(stateMark,copy);button.addEventListener('click',()=>openLesson(id));group.append(button);
      });
      elements.nav.append(group);
    });
  }

  function renderTranscript(id,pages){
    const details=node('details','transcript');
    details.open=true;
    const summary=node('summary');summary.append(node('span','','TXT'),node('strong','','Searchable page transcript'),node('small','',pageLabel(pages)));details.append(summary);
    const body=node('div','transcript-pages');
    pages.forEach((page)=>{const section=node('section','transcript-page');section.append(node('h3','',`SOURCE PAGE ${page}`),node('pre','',pdf.pages[String(page)]||''));body.append(section);});
    details.append(body);return details;
  }

  function tidySourceText(value){
    return String(value||'')
      .replace(/[\u0008\uFFFD]/g,'')
      .replace(/([A-Za-z])-\s*\n\s*([a-z])/g,'$1$2')
      .replace(/\bEnem\s+y\b/g,'Enemy').replace(/\bt\s+ime\b/g,'time')
      .replace(/\bObject\s+ive\b/g,'Objective').replace(/\bCharact\s+eristic/g,'Characteristic')
      .replace(/\bSELEC\s+T\b/g,'SELECT').replace(/\bRe\s+solve\b/g,'Resolve')
      .replace(/\bMak\s+e\b/g,'Make').replace(/\blowe\s+st\b/g,'lowest');
  }

  function ruleText(layout,rule){
    let text=layout.overrides?.[rule.code]??rule.text;
    const cutoff=layout.cutoff?.[rule.code];
    if(cutoff){const index=text.indexOf(cutoff);if(index>=0)text=text.slice(0,index);}
    for(const replacement of layout.replacements?.[rule.code]||[])text=text.replace(replacement.from,replacement.to);
    return tidySourceText(text).trim();
  }

  function appendSourceBlocks(container,text){
    const lines=text.split(/\r?\n/).map((line)=>line.trim()).filter(Boolean);
    let paragraph=[],list=null;
    const flush=()=>{if(paragraph.length){container.append(node('p','source-paragraph',paragraph.join(' ').replace(/\s+/g,' ')));paragraph=[];}list=null;};
    for(const line of lines){
      const bullet=line.match(/^[▪▫•]\s*(.*)$/);
      const step=line.match(/^(\d+)\.\s*(.*)$/);
      const heading=line.length<72&&/[A-Z]/.test(line)&&line===line.toUpperCase()&&!/[.!?]$/.test(line);
      if(bullet){if(paragraph.length)flush();if(!list){list=node('ul','source-list');container.append(list);}list.append(node('li','',bullet[1]));continue;}
      if(step){flush();const item=node('div','source-step');item.append(node('b','',step[1]),node('p','',step[2]));container.append(item);continue;}
      if(heading){flush();container.append(node('h4','source-subheading',line));continue;}
      if(list&&list.lastElementChild){list.lastElementChild.textContent+=` ${line}`;continue;}
      paragraph.push(line);
    }
    flush();
  }

  function makeFigure(spec){
    const figure=node('figure',`source-figure ${spec.className||''}`.trim());
    const image=document.createElement('img');image.src=spec.src;image.alt=spec.label;image.loading='lazy';image.decoding='async';
    figure.append(image,node('figcaption','',spec.label));return figure;
  }

  function renderIntroduction(layout){
    const article=node('article','designed-lesson layout-introduction');
    const opening=node('section','intro-opening');opening.append(node('span','eyebrow','CORE RULES // INTRODUCTION'),node('p','source-lead',layout.lead));article.append(opening);
    const prose=node('section','prose-panel prose-columns');layout.paragraphs.forEach((paragraph)=>prose.append(node('p','',tidySourceText(paragraph))));article.append(prose);
    const aside=node('aside','app-source-note');aside.append(node('span','eyebrow','OFFICIAL COMPANION'),node('h3','',layout.aside.title));layout.aside.paragraphs.forEach((paragraph,index)=>aside.append(node('p',index===3?'app-reference':'',tidySourceText(paragraph))));article.append(aside);
    return article;
  }

  function renderDatasheetLesson(id,layout){
    const article=node('article','designed-lesson layout-datasheet');
    const opening=node('section','lesson-opening');opening.append(node('span','eyebrow',`${pageLabel(pagesFor(id))} // OFFICIAL TEXT`),node('p','source-lead',layout.lead));article.append(opening);
    const map=node('section','datasheet-map');
    const mapHead=node('header','datasheet-map-head');mapHead.append(node('span','eyebrow','ANNOTATED DATASHEET // KEY 1–7'),node('h3','','How to read a datasheet'),node('p','','Match each green number on the official datasheet to the same number in the key below.'));map.append(mapHead);
    const pictureNav=node('div','datasheet-picture-nav');pictureNav.id='datasheet-picture';const pictureLabel=node('span','','ANNOTATED PICTURE');const backButton=node('button','datasheet-back','BACK ↓');backButton.type='button';backButton.disabled=true;pictureNav.append(pictureLabel,backButton);map.append(pictureNav);
    const visual=layout.visuals?.[0];if(visual)map.append(makeFigure(visual));
    const key=node('div','datasheet-key');
    for(const rule of pdf.rules[id]||[]){
      const number=String(Number(rule.code.split('.')[1]));
      const item=node('section','datasheet-key-item');item.id=`rule-${rule.code.replace('.','-')}`;
      const heading=node('header','datasheet-key-head');heading.append(node('span','datasheet-number',number),node('h3','',rule.title),node('span','rule-page',`PAGE ${rule.page}`));item.append(heading);
      const copy=node('div','rule-copy');appendSourceBlocks(copy,ruleText(layout,rule));item.append(copy);
      const pictureButton=node('button','datasheet-picture-button','PICTURE ↑');pictureButton.type='button';pictureButton.setAttribute('aria-label',`Show picture for ${rule.title}`);pictureButton.addEventListener('click',()=>{map.dataset.returnTarget=item.id;backButton.disabled=false;backButton.textContent=`BACK TO ${number} ↓`;document.getElementById('datasheet-picture')?.scrollIntoView({block:'start',behavior:'auto'});});item.append(pictureButton);key.append(item);
    }
    backButton.addEventListener('click',()=>{const target=map.dataset.returnTarget;if(target)document.getElementById(target)?.scrollIntoView({block:'start',behavior:'auto'});});
    map.append(key);article.append(map);return article;
  }

  function renderBasicLesson(id,layout){
    if(layout.type==='introduction')return renderIntroduction(layout);
    if(layout.type==='datasheet')return renderDatasheetLesson(id,layout);
    const article=node('article',`designed-lesson layout-${layout.type}`);
    const opening=node('section','lesson-opening');opening.append(node('span','eyebrow',`${pageLabel(pagesFor(id))} // OFFICIAL TEXT`),node('p','source-lead',layout.lead));article.append(opening);
    const visualsByRule=new Map();for(const visual of layout.visuals||[]){const list=visualsByRule.get(visual.after)||[];list.push(visual);visualsByRule.set(visual.after,list);}
    const rules=node('div','designed-rules');
    for(const rule of pdf.rules[id]||[]){
      const section=node('section','designed-rule');section.id=`rule-${rule.code.replace('.','-')}`;
      const heading=node('header','designed-rule-head');heading.append(node('span','rule-index',rule.code),node('h3','',rule.title),node('span','rule-page',`PAGE ${rule.page}`));section.append(heading);
      const copy=node('div','rule-copy');appendSourceBlocks(copy,ruleText(layout,rule));section.append(copy);rules.append(section);
      const visuals=visualsByRule.get(rule.code);if(visuals?.length){const gallery=node('div','source-gallery');visuals.forEach((visual)=>gallery.append(makeFigure(visual)));rules.append(gallery);}
    }
    article.append(rules);
    if(layout.aside){const aside=node('aside','concept-aside');aside.append(node('span','eyebrow','CORE CONCEPT'),node('h3','',layout.aside.title),node('p','',tidySourceText(layout.aside.text)));article.append(aside);}
    return article;
  }

  function renderReadView(id){
    elements.read.replaceChildren();const layout=basicLayouts[id];if(layout){elements.read.append(renderBasicLesson(id,layout));return;}const pages=pagesFor(id);
    const notice=node('div','source-only');notice.append(node('span','eyebrow','ACCESSIBILITY AND SEARCH LAYER'),node('p','','Text extraction can contain reading-order and layout artefacts. Use Original pages as the authoritative rules source.'));elements.read.append(notice);
    elements.read.append(renderTranscript(id,pages));
  }

  function renderSourceView(id){
    elements.sourceView.replaceChildren();
    pagesFor(id).forEach((page)=>{const figure=node('figure','pdf-page');figure.id=`page-${page}`;const image=document.createElement('img');image.src=`assets/pages/page-${String(page).padStart(2,'0')}.jpg`;image.alt=`Original Core Rules PDF page ${page}`;image.loading='lazy';image.decoding='async';const caption=node('figcaption');caption.append(node('span','',`ORIGINAL PDF // PAGE ${page}`),node('a','',`Open PDF ↗`));caption.lastElementChild.href=`${sourcePdf}#page=${page}`;caption.lastElementChild.target='_blank';caption.lastElementChild.rel='noreferrer';figure.append(image,caption);elements.sourceView.append(figure);});
  }

  function syncProgress(){
    const count=state.completed.size;elements.progress.textContent=`${count} / ${sequence.length}`;elements.bar.style.width=`${count/sequence.length*100}%`;
    for(const button of elements.nav.querySelectorAll('[data-lesson]')){const id=button.dataset.lesson;button.classList.toggle('is-current',id===state.current);button.classList.toggle('is-complete',state.completed.has(id));if(id===state.current)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');}
    if(state.current){const done=state.completed.has(state.current);elements.complete.classList.toggle('is-complete',done);elements.complete.setAttribute('aria-pressed',String(done));elements.complete.textContent=done?'Completed ✓':'Mark complete';}
  }

  function openLesson(id,{anchor=null}={}){
    const section=sectionById.get(id);if(!section)return;state.current=id;state.last=id;save();closeDrawer();elements.start.hidden=true;elements.lesson.hidden=false;
    const module=moduleBySection.get(id);elements.module.textContent=`STUDY PATH // ${module.title}`;elements.title.textContent=section.title;
    const pages=pagesFor(id);elements.source.replaceChildren(document.createTextNode(`${pageLabel(pages)} · `));const link=node('a','',`Open original PDF ↗`);link.href=`${sourcePdf}#page=${pages[0]||1}`;link.target='_blank';link.rel='noreferrer';elements.source.append(link);
    renderReadView(id);renderSourceView(id);elements.readTab.textContent=basicLayouts[id]?'Designed lesson':'Searchable transcript';if(basicLayouts[id])state.view='read';setView(state.view);const index=sequence.indexOf(id);elements.previous.disabled=index<=0;elements.next.disabled=index>=sequence.length-1;syncProgress();
    document.title=`${section.title} - Core Rules Learn to Play`;window.scrollTo({top:0,behavior:'auto'});
    if(anchor)requestAnimationFrame(()=>document.getElementById(anchor)?.scrollIntoView({block:'start'}));
  }

  function showStart(){state.current=null;closeDrawer();elements.lesson.hidden=true;elements.start.hidden=false;elements.resumeButton.hidden=!state.last||!sequence.includes(state.last);syncProgress();document.title='Core Rules - Learn to Play';window.scrollTo({top:0,behavior:'auto'});}
  function move(direction){const index=sequence.indexOf(state.current),next=sequence[index+direction];if(next)openLesson(next);}

  function buildSearchIndex(){
    const entries=[];
    sequence.forEach((id)=>{
      const section=sectionById.get(id),rules=pdf.rules[id]||[];
      entries.push({type:'SECTION',title:section.title,detail:pageLabel(pagesFor(id)),haystack:section.title.toLocaleLowerCase('en'),id,anchor:`page-${pagesFor(id)[0]}`});
      pagesFor(id).forEach((page)=>entries.push({type:'PAGE',title:`${section.title} - page ${page}`,detail:`Original PDF page ${page}`,haystack:`${section.title} ${pdf.pages[String(page)]||''}`.toLocaleLowerCase('en'),id,anchor:`page-${page}`}));
      rules.forEach((rule)=>entries.push({type:'RULE',title:rule.title,detail:`${rule.code} · PDF page ${rule.page}`,haystack:`${rule.code} ${rule.title} ${rule.text}`.toLocaleLowerCase('en'),id,anchor:`page-${rule.page}`}));
    });return entries;
  }
  const searchIndex=buildSearchIndex();
  function openSearch(){
    searchReturnFocus=document.activeElement;
    closeDrawer();
    elements.searchDialog.hidden=false;elements.body.classList.add('search-open');setPageBlocked(true);
    elements.searchInput.value='';elements.searchResults.replaceChildren(node('p','search-empty','Type at least two characters.'));
    requestAnimationFrame(()=>elements.searchInput.focus());
  }
  function closeSearch(){
    if(elements.searchDialog.hidden)return;
    elements.searchDialog.hidden=true;elements.body.classList.remove('search-open');setPageBlocked(false);
    (searchReturnFocus||elements.searchButton).focus({preventScroll:true});searchReturnFocus=null;
  }
  function search(){
    const query=elements.searchInput.value.trim().toLocaleLowerCase('en');elements.searchResults.replaceChildren();if(query.length<2){elements.searchResults.append(node('p','search-empty','Type at least two characters.'));return;}
    const matches=searchIndex.filter((entry)=>entry.haystack.includes(query)).sort((a,b)=>{const at=a.title.toLocaleLowerCase('en'),bt=b.title.toLocaleLowerCase('en');return Number(!at.startsWith(query))-Number(!bt.startsWith(query))||at.localeCompare(bt);}).slice(0,40);
    matches.forEach((entry)=>{const button=node('button','search-result');button.type='button';const badge=node('b','',entry.type),copy=node('span');copy.append(node('strong','',entry.title),node('small','',entry.detail));button.append(badge,copy,node('i','','→'));button.addEventListener('click',()=>{closeSearch();state.view='source';openLesson(entry.id,{anchor:entry.anchor});});elements.searchResults.append(button);});
    if(!matches.length)elements.searchResults.append(node('p','search-empty','No source matches found.'));
  }

  elements.menu.addEventListener('click',()=>{const open=!elements.body.classList.contains('drawer-open');if(!open){closeDrawer({restoreFocus:true});return;}drawerReturnFocus=document.activeElement;elements.body.classList.add('drawer-open');elements.scrim.hidden=false;elements.menu.setAttribute('aria-expanded','true');setDrawerAccessibility(true);requestAnimationFrame(()=>elements.panel.querySelector(FOCUSABLE)?.focus({preventScroll:true}));});
  elements.scrim.addEventListener('click',()=>closeDrawer({restoreFocus:true}));elements.home.addEventListener('click',showStart);elements.startButton.addEventListener('click',()=>openLesson(sequence[0]));elements.resumeButton.addEventListener('click',()=>openLesson(state.last));
  elements.complete.addEventListener('click',()=>{if(!state.current)return;if(state.completed.has(state.current))state.completed.delete(state.current);else state.completed.add(state.current);save();syncProgress();});
  elements.previous.addEventListener('click',()=>move(-1));elements.next.addEventListener('click',()=>move(1));elements.readTab.addEventListener('click',()=>setView('read'));elements.sourceTab.addEventListener('click',()=>setView('source'));
  elements.searchButton.addEventListener('click',openSearch);elements.searchClose.addEventListener('click',closeSearch);elements.searchInput.addEventListener('input',search);document.addEventListener('keydown',(event)=>{if(event.key==='Tab'&&!elements.searchDialog.hidden)trapFocus(elements.searchDialog,event);if(event.key==='Escape'){if(!elements.searchDialog.hidden)closeSearch();else closeDrawer({restoreFocus:true});}});window.addEventListener('resize',()=>setDrawerAccessibility(elements.body.classList.contains('drawer-open')),{passive:true});
  elements.theme.addEventListener('click',()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;elements.theme.textContent=theme==='dark'?'☼':'◐';try{localStorage.setItem('core-learn-theme',theme);}catch(_){}});
  try{const theme=localStorage.getItem('core-learn-theme');if(theme==='light'){document.documentElement.dataset.theme='light';elements.theme.textContent='◐';}}catch(_){}

  renderNavigation();showStart();setDrawerAccessibility(false);
  window.CORE_LEARN_APP=Object.freeze({openLesson,showStart,sequence:[...sequence]});
  if((location.protocol==='http:'||location.protocol==='https:')&&'serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('../../service-worker.js'));
}());
