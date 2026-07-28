import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const projectRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.join(projectRoot,'books','death-guard');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const readProject=name=>fs.readFileSync(path.join(projectRoot,name),'utf8');
const html=read('reader.html');
const navigationTargets=readProject('books/shared/navigation-targets.js');
const datasheetLayout=readProject('books/shared/datasheet-layout.js');
const datasheetCss=readProject('books/shared/datasheet-system.css');
const popupContent=readProject('books/shared/popup-content.js');
const glossaryAutolink=readProject('books/shared/glossary-autolink.js');
const glossaryRegistry=JSON.parse(readProject('glossary/registry.en.json'));
const bookData=JSON.parse(read('content/death-guard-rules.en.json'));
const files=['scripts/roster-filter.js','scripts/navigation-controller.js','scripts/popup-controller.js','scripts/full-entry-controller.js','scripts/journey-controller.js','scripts/ui-controllers.js','scripts/app.js'];
const results=[];
const check=(name,ok,detail='')=>results.push({name,ok,detail});

for(const file of files){try{new vm.Script(read(file),{filename:file});check(file+' syntax',true);}catch(error){check(file+' syntax',false,error.message);}}
try{new vm.Script(navigationTargets,{filename:'books/shared/navigation-targets.js'});check('shared navigation targets syntax',true);}catch(error){check('shared navigation targets syntax',false,error.message);}
try{new vm.Script(datasheetLayout,{filename:'books/shared/datasheet-layout.js'});check('shared datasheet layout syntax',true);}catch(error){check('shared datasheet layout syntax',false,error.message);}
try{new vm.Script(popupContent,{filename:'books/shared/popup-content.js'});check('shared popup content syntax',true);}catch(error){check('shared popup content syntax',false,error.message);}
try{new vm.Script(glossaryAutolink,{filename:'books/shared/glossary-autolink.js'});check('shared glossary autolink syntax',true);}catch(error){check('shared glossary autolink syntax',false,error.message);}
check('autolinker supports curated labels and typographic punctuation',glossaryAutolink.includes('entry.matchLabels')&&glossaryAutolink.includes("replace(/'/g")&&glossaryAutolink.includes("replace(/-/g"));
check('production validation reuses the apply report',glossaryAutolink.includes('const missing=lastReport.ambiguous')&&!glossaryAutolink.includes('const missing=audit(root)'));

const markup=html.replace(/<script[\s\S]*?<\/script>/gi,'');
const ids=[...markup.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
const duplicateIds=[...new Set(ids.filter((id,index)=>ids.indexOf(id)!==index))];
check('HTML IDs are unique',duplicateIds.length===0,duplicateIds.join(', '));
const idSet=new Set(ids);
const navTargets=[...markup.matchAll(/data-nav-target="([^"]+)"/g)].map(match=>match[1]);
const trackTargets=[...markup.matchAll(/data-track="([^"]+)"/g)].map(match=>match[1]);
const walkBlocks=bookData.sections.flatMap(section=>[...(section.blocks||[]),...(section.subsections||[]).flatMap(sub=>sub.blocks||[])]);
const blockCount=type=>walkBlocks.filter(block=>block.type===type).length;
check('canonical content audit is 9 detachments, 36 datasheets and 366 terms',bookData.audit.detachments===9&&bookData.audit.datasheets===36&&bookData.glossary.length===366);
const plagueEntry=glossaryRegistry.terms['death-guard-plague'];
check('Plague means the chosen Nurgle’s Gift effect',plagueEntry.summary.en.includes('selected during Declare Battle Formations')&&plagueEntry.definition.en.includes('Skullsquirm Blight, Rattlejoint Ague or Scabrous Soulrot')&&plagueEntry.related.length===5);
const plagueCards=['skullsquirm-blight','rattlejoint-ague','scabrous-soulrot'].map(id=>{
  const start=html.indexOf(`<article class="rule-card surface" id="${id}"`),end=html.indexOf('</article>',start);
  return html.slice(start,end);
});
check('Plague cards show each rule name only once',plagueCards.every(card=>(card.match(/<h[1-6][^>]*>/g)||[]).length===1&&!card.includes('<article class="ability">')));
const mortarionAbility=bookData.glossary.find(entry=>entry.id==='ability-lord-of-the-death-guard-90db1c4');
check('Mortarion lists all three Lord of the Death Guard choices',
  ['Diseased Influence','Boon of Death','Inflamed Reprisal'].every(title=>mortarionAbility.full.includes(title)&&html.includes(`<h6>${title}</h6>`))&&
  !mortarionAbility.full.includes('see left')&&!html.includes('Lord of the Death Guard abilities (see left)'));
check('full gameplay block inventory is present',blockCount('enhancement')===30&&blockCount('rule')===45&&blockCount('statline')===36&&blockCount('weapon')===146,`enhancements ${blockCount('enhancement')}, rules ${blockCount('rule')}, statlines ${blockCount('statline')}, weapons ${blockCount('weapon')}`);
check('all navigation targets exist',navTargets.every(id=>idSet.has(id)),navTargets.filter(id=>!idSet.has(id)).join(', '));
check('all navigation targets have tracked ranges',navTargets.every(id=>trackTargets.includes(id)),navTargets.filter(id=>!trackTargets.includes(id)).join(', '));
check('navigation covers the gameplay tree without inline glossary branches',navTargets.length===94&&!navTargets.some(id=>id==='glossary'||id.startsWith('glossary-')),String(navTargets.length));
const depths=[...markup.matchAll(/data-nav-depth="(\d+)"/g)].map(match=>Number(match[1]));
check('navigation depth is at most three',Math.max(...depths)===3);
const unitIds=bookData.sections.filter(section=>section.kind==='unit').map(section=>section.id);
check('all 36 datasheets are global navigation destinations',unitIds.length===36&&unitIds.every(id=>navTargets.includes(id)));
const unitById=id=>bookData.sections.find(section=>section.id===id);
const requiredWargear=['unit-plague-marines','unit-blightlord-terminators','unit-deathshroud-terminators','unit-chaos-land-raider','unit-chaos-predator-annihilator','unit-chaos-predator-destructor','unit-foetid-bloat-drone','unit-helbrute','unit-plagueburst-crawler','unit-chaos-rhino','unit-great-unclean-one','unit-plague-drones','unit-plaguebearers'];
check('audited datasheets retain every missing Wargear Options block',requiredWargear.every(id=>unitById(id)?.subsections.some(part=>part.title==='Wargear Options')));
const auditedAbilities=['mortarion-ability-supreme-commander','plague-marines-ability-icon-of-despair-aura','deathshroud-terminators-ability-icon-of-despair-aura','great-unclean-one-ability-reverberating-summons','plague-drones-ability-daemonic-icon','plague-drones-ability-instrument-of-chaos','plaguebearers-ability-daemonic-icon','plaguebearers-ability-instrument-of-chaos','miasmic-malignifier-ability-fortification-setup'];
check('audited datasheet abilities remain complete',auditedAbilities.every(id=>bookData.sections.some(section=>(section.subsections||[]).some(part=>(part.blocks||[]).some(block=>block.id===id)))&&html.includes(`id="${id}"`)));
const pointValue=(id,label)=>unitById(id)?.points.find(row=>row.label===label)?.value;
check('Death Guard points match Munitorum Field Manual v1.1',bookData.audit.currentMFM==='v1.1'&&pointValue('unit-mortarion','1 model')===390&&pointValue('unit-plague-marines','10 models')===180&&pointValue('unit-deathshroud-terminators','1st–2nd unit: 6 models')===305&&pointValue('unit-defiler','2nd+ unit: 1 model')===340&&pointValue('unit-chaos-rhino','1st–3rd unit: 1 model')===75);
check('Faction Pack updates contain full wording',!bookData.sections.find(section=>section.id==='rules-updates').blocks.some(block=>block.text.includes('use the replacement wording')));
const detachmentSections=bookData.sections.filter(section=>section.id.startsWith('detachment-'));
check('all nine detachment trees expose rule, Enhancement and Stratagems',detachmentSections.length===9&&detachmentSections.every(section=>(section.subsections||[]).length===3)&&detachmentSections.every(section=>['Detachment Rule','Enhancement','Stratagems'].every(label=>markup.includes(`data-nav-target="${section.subsections[['Detachment Rule','Enhancement','Stratagems'].indexOf(label)].id}">${label}</button>`))));
const unitLocalIds=bookData.sections.filter(section=>section.kind==='unit').flatMap(section=>[`${section.id}-profile`,...(section.subsections||[]).map(sub=>sub.id)]);
check('datasheet local parts are absent from global navigation',unitLocalIds.every(id=>!navTargets.includes(id)));

const dataSource=read('scripts/data.js');
const termContext={window:{},Object};
vm.runInNewContext(dataSource,termContext,{filename:'scripts/data.js'});
const termKeys=Object.keys(termContext.window.DG_TERMS||{});
const usedTerms=[...markup.matchAll(/data-term="([^"]+)"/g)].map(match=>match[1]);
check('term registry has all 366 entries',termKeys.length===366,String(termKeys.length));
check('all term triggers resolve',usedTerms.every(id=>termKeys.includes(id)),usedTerms.filter(id=>!termKeys.includes(id)).join(', '));
check('canonical terms remain available to lazy full entries',read('scripts/full-entry-controller.js').includes('const term=this.api.get(id)'));
const journeyTargets=[...markup.matchAll(/data-journey-target="([^"]+)"/g)].map(match=>match[1]);
check('all journey targets exist',journeyTargets.every(id=>idSet.has(id)),journeyTargets.filter(id=>!idSet.has(id)).join(', '));
check('generated document contains no acceptance placeholders',!/(small acceptance set|points not listed|subject to the full rule|qualifying attacks)/i.test(markup));

const navigation=read('scripts/navigation-controller.js');
const popups=read('scripts/popup-controller.js');
const fullEntry=read('scripts/full-entry-controller.js');
const journey=read('scripts/journey-controller.js');
const uiControllers=read('scripts/ui-controllers.js');
const appSource=read('scripts/app.js');
check('inline glossary and its controller are absent',!idSet.has('glossary')&&!html.includes('data-nav-id="glossary"')&&!uiControllers.includes('GlossarySearch'));
check('navigation exposes one standalone Mega Glossary link',html.includes('<a class="toc-label" href="../../glossary/index.html" data-mega-glossary-link>Mega Glossary</a>'));
check('book does not load its duplicate term registry',!html.includes('scripts/data.js')&&!readProject('service-worker.js').includes('books/death-guard/scripts/data.js'));
check('full glossary entry is rendered on demand without runtime fetch',read('scripts/full-entry-controller.js').includes('this.api.get(id)')&&!read('scripts/full-entry-controller.js').includes('fetch('));
check('full entry uses modal history and restores focus',read('scripts/full-entry-controller.js').includes('history.pushState')&&read('scripts/full-entry-controller.js').includes("window.addEventListener('popstate'")&&read('scripts/full-entry-controller.js').includes('this.returnFocus.focus'));
check('full entry cross-references stay inside the full-entry modal',read('scripts/full-entry-controller.js').includes('WHGlossaryAutolink?.apply(this.content)')&&read('scripts/full-entry-controller.js').includes('button.dataset.fullEntry=button.dataset.term')&&read('scripts/full-entry-controller.js').includes('delete button.dataset.term'));
check('full entry is offered only for materially richer records',read('scripts/full-entry-controller.js').includes('isUseful(id)')&&popups.includes("this.fullEntry?.isUseful(term.id)"));
check('related full entries have an internal history stack',read('scripts/full-entry-controller.js').includes('this.stack.push(term.id)')&&read('scripts/full-entry-controller.js').includes('backEntry()')&&read('scripts/full-entry-controller.js').includes('this.stack.pop()'));
check('navigation uses one passive scroll listener',(navigation.match(/addEventListener\('scroll'/g)||[]).length===1&&navigation.includes('{passive:true}'));
check('navigation avoids :scope',!navigation.includes(':scope'));
check('navigation has explicit reader/controller ownership',navigation.includes("owner:'reader'")&&navigation.includes("owner='controller'")&&navigation.includes("owner='reader'"));
const settleSource=navigation.match(/waitForSettle\([\s\S]*?\n    cancelTransition/)?.[0]||'';
check('navigation settles by reachable geometry instead of fixed delay',settleSource.includes('stable=atDestination&&')&&settleSource.includes('if(stable>=6)')&&settleSource.includes('Date.now()-started>2200')&&settleSource.includes("top:this.reachableDestination(destination)")&&!settleSource.includes('setTimeout'));
check('first destination frame cannot release scroll-spy',!settleSource.includes('if(atDestination||stable>=6)')&&!settleSource.includes('Math.abs(current-destination)<2||stable>=6'));
check('mobile breakpoint clears collapsed state',navigation.includes('if(mobile)this.state.collapsed=false'));
check('mobile navigation avoids delayed smooth scrolling',navigation.includes("const behavior=this.mobile||matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'"));
check('native inert avoids the full tabindex walk',navigation.includes("this.supportsInert='inert'in HTMLElement.prototype")&&navigation.includes('if(this.supportsInert){root.inert=!interactive;return;}'));
check('tabindex fallback remains available for legacy browsers',navigation.includes('data-nav-saved-tabindex'));
check('unchanged drawer state is a no-op',navigation.includes('if(next===this.state.drawer)return'));
const readViewportSource=navigation.match(/readViewport\(\)\{[\s\S]*?\n    \}/)?.[0]||'';
check('scroll spy performs no layout measurements per frame',!readViewportSource.includes('getBoundingClientRect'));
check('scroll spy ignores hidden navigation ranges',navigation.includes('measurable:rect.width>0||rect.height>0')&&navigation.includes('if(range.measurable===false)continue'));
check('scroll spy assigns visual gaps to the following tracked card',navigation.includes('rect.top-leadingMargin')&&navigation.includes('getComputedStyle(item.section).marginTop'));
check('mobile layout avoids content-visibility geometry jumps',!readProject('books/death-guard/styles/content.css').includes('content-visibility: auto'));
check('user input cancels controlled scrolling',navigation.includes('cancelTransition()')&&navigation.includes("window.addEventListener('touchstart'"));
check('navigation branches use strict sibling accordion',navigation.includes("if(peer!==node&&peer.matches('[data-nav-id]'))this.closeBranch(peer,{deep:true})")&&!navigation.includes('isOnActivePath'));
check('manual accordion state yields back to scroll tracking',navigation.includes('pathIsOpen(node)')&&navigation.includes("else if(item&&!this.pathIsOpen(item.node))this.revealPath(item.node,{includeSelf:true})"));
check('branch labels and arrows have separate actions',navigation.includes("event.target.closest('[data-nav-toggle]')")&&navigation.includes("event.target.closest('[data-nav-target]')"));
check('Start closes every open navigation branch before returning to the top',navigation.includes("if(label.dataset.navTarget==='start')this.closeEveryBranch()"));
const navigationClassSource=navigation.match(/(class NavigationController\{[\s\S]*?\n  \})\n\n  window\.DGNavigation/)?.[1]||'';
try{
  const NavigationController=Function(`"use strict";return (${navigationClassSource});`)();
  const controller=Object.create(NavigationController.prototype);
  controller.trackingGap=18;
  controller.epsilon=1;
  controller.geometry={headerBottom:72,ranges:[]};
  controller.byId=new Map();
  const previousWindow=globalThis.window,previousDocument=globalThis.document;
  try{
    globalThis.window={scrollY:1000,setTimeout:()=>0};
    globalThis.document={querySelector:()=>null};
    const ordinaryTarget={id:'term',dataset:{},getBoundingClientRect:()=>({top:200})};
    check('behavior: destination uses only header and tracking gap',controller.destination(ordinaryTarget)===1110,String(controller.destination(ordinaryTarget)));
    const targetContext={window:{},Object};vm.runInNewContext(navigationTargets,targetContext,{filename:'books/shared/navigation-targets.js'});
    const resolve=targetContext.window.WHNavigationTargets.resolve;
    const heading={tagName:'H3',matches:selector=>selector.includes('h3')};
    const firstCard={matches:selector=>selector.includes('.stratagem')};
    const section={matches:()=>false,children:[heading,firstCard]};
    const sectionTargets=resolve(section);
    check('behavior: section destination resolves to its direct heading',sectionTargets.scrollTarget===heading&&sectionTargets.highlightTarget===heading&&sectionTargets.kind==='section');
    const enhancement={matches:selector=>selector.includes('.enhancement'),children:[heading]};
    const enhancementTargets=resolve(enhancement);
    check('behavior: concrete Enhancement resolves to its complete card',enhancementTargets.scrollTarget===enhancement&&enhancementTargets.highlightTarget===enhancement&&enhancementTargets.kind==='card');
    check('behavior: section never falls through to its first card',sectionTargets.highlightTarget!==firstCard);
    const parentNode={};
    const childNode={parentElement:{classList:{contains:name=>name==='toc-branch'},parentElement:parentNode}};
    const nextNode={parentElement:{classList:{contains:name=>name==='toc-branch'},parentElement:parentNode}};
    let selected='';globalThis.window.scrollY=0;controller.state={owner:'reader',active:''};controller.items=[{id:'parent',depth:1,node:parentNode},{id:'child',depth:2,node:childNode}];controller.geometry.ranges=[{item:controller.items[0],top:0,bottom:500},{item:controller.items[1],top:120,bottom:300}];controller.activate=id=>{selected=id};controller.readViewport();
    check('behavior: child below tracking line does not pre-activate',selected==='parent',selected);
    selected='';controller.geometry.ranges[1]={item:controller.items[1],top:90.5,bottom:300};controller.readViewport();
    check('behavior: subpixel target at tracking line activates',selected==='child',selected);
    selected='';controller.items=[{id:'datasheets',depth:1,node:parentNode},{id:'epic-heroes',depth:2,node:childNode},{id:'characters',depth:2,node:nextNode}];controller.geometry.ranges=[{item:controller.items[0],top:0,bottom:700},{item:controller.items[1],top:40,bottom:80},{item:controller.items[2],top:130,bottom:320}];controller.readViewport();
    check('behavior: parent does not flash between non-Glossary groups',selected==='epic-heroes',selected);
    let stopped=0,scheduled=0;
    controller.state={owner:'controller',active:'epic-heroes',transition:8};
    controller.panel={contains:target=>target==='toc'};controller.menuButton={contains:()=>false};controller.collapseButton={contains:()=>false};
    controller.stopControlledScroll=()=>{stopped++};controller.scheduleRead=()=>{scheduled++};
    controller.cancelTransition({target:'toc'});
    check('behavior: rapid TOC pointer input keeps controller ownership',controller.state.owner==='controller'&&controller.state.transition===8&&stopped===0&&scheduled===0,`${controller.state.owner} / ${controller.state.transition}`);
    controller.cancelTransition({target:'article'});
    check('behavior: article pointer input cancels controlled navigation',controller.state.owner==='reader'&&controller.state.transition===9&&stopped===1&&scheduled===1,`${controller.state.owner} / ${controller.state.transition}`);
  }finally{
    if(previousWindow===undefined)delete globalThis.window;else globalThis.window=previousWindow;
    if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument;
  }
}catch(error){check('navigation destination geometry',false,error.message);}
check('popup root clicks replace the chain',popups.includes('this.ids=[];this.origins=[]'));
check('nested popups preserve the common DOM prefix',popups.includes('while(prefix<cards.length')&&popups.includes('for(let index=prefix;index<this.ids.length'));
check('adjacent bounce checks only previous level',popups.includes('const previous=this.ids[this.ids.length-2]')&&!popups.includes('lastIndexOf'));
check('popup cards suppress self links',popups.includes('relatedId!==id'));
check('desktop popup coordinates stay viewport-relative',!popups.includes("window.scrollY||0")&&/\.popup-layer\s*\{[^}]*position:\s*fixed/.test(read('styles/popups.css')));
check('mobile popup layer is fixed',/@media\s*\(max-width:\s*800px\)[\s\S]*?\.popup-layer\s*\{[^}]*position:\s*fixed/.test(read('styles/popups.css')));
check('popup cards expose dialog semantics',popups.includes("setAttribute('role','dialog')")&&popups.includes("setAttribute('aria-modal','false')"));
check('outside click closes popups but preserves them behind full entry',popups.includes("this.ids.length&&!event.target.closest('.term-popup,.full-entry-layer')")&&popups.includes('this.closeFrom(0)'));
check('popup actions inherit their originating unit context',popups.includes("contextualUnit(){return this.rootElement()?.closest?.('.unit-card')||null;}")&&popups.includes('contextualStatline'));
check('Mega Glossary transitions use the shared return helper',html.includes('../../glossary-return.js?v=1')&&read('scripts/full-entry-controller.js').includes('WHGlossaryReturn')&&read('scripts/app.js').includes('WHGlossaryReturn'));
check('popups use the shared semantic profile renderer',popups.includes('WHPopupContent.render')&&popupContent.includes("document.createElement('table')")&&popupContent.includes("document.createElement('dl')"));
check('unit popup grid has a mobile no-overflow layout',/\.popup-stats\s*\{[^}]*grid-template-columns:\s*repeat\(auto-fit, minmax\(54px, 1fr\)\)/.test(read('styles/popups.css'))&&/@media\s*\(max-width:\s*480px\)[\s\S]*?\.popup-stats\s*\{[^}]*grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/.test(read('styles/popups.css')));

const popupClassSource=popups.match(/(class PopupController\{[\s\S]*?\n  \})\n\n  window\.DGPopups/)?.[1]||'';
try{
  const PopupController=Function(`"use strict";return (${popupClassSource});`)();
  const controller=Object.create(PopupController.prototype);
  controller.terms=Object.fromEntries(termKeys.map(id=>[id,{}]));controller.ids=[];controller.origins=[];
  controller.captureOrigin=(trigger,id)=>({trigger,id});controller.sync=()=>{};controller.focusTop=()=>{};
  const external={closest:()=>null},nested={closest:selector=>selector==='.term-popup'?{}:null};
  controller.open('core-assault',external);controller.open('core-lethal-hits',nested);
  check('behavior: nested trigger appends a level',controller.ids.join(',')==='core-assault,core-lethal-hits');
  controller.open('core-assault',nested);
  check('behavior: adjacent A-B-A collapses only B',controller.ids.join(',')==='core-assault');
  controller.open('core-lethal-hits',nested);controller.open('core-deadly-demise',nested);controller.open('core-assault',nested);
  check('behavior: distant repeated term creates a new level',controller.ids.join(',')==='core-assault,core-lethal-hits,core-deadly-demise,core-assault');
  controller.open('contagion-range',external);
  check('behavior: external term replaces the complete chain',controller.ids.join(',')==='contagion-range');
  controller.open('contagion-range',external);
  check('behavior: current root term does not duplicate',controller.ids.join(',')==='contagion-range');

  const makeStyle=(left='',top='')=>({left,top,bottom:'',removeProperty(name){this[name]='';}});
  const makeCard=(left='',top='')=>({style:makeStyle(left,top),offsetWidth:300,offsetHeight:180});
  const previousWindow=globalThis.window,previousDocument=globalThis.document;
  try{
    globalThis.document={getElementById:()=>({getBoundingClientRect:()=>({bottom:72})})};
    const desktopCard=makeCard('412px','180px');
    globalThis.window={innerWidth:1200,innerHeight:700,scrollX:0,scrollY:800};
    controller.layer={children:[desktopCard]};controller.origins=[{rect:{left:412,top:-300,bottom:-260}}];controller.resolveOrigin=()=>null;
    controller.reposition();
    check('behavior: offscreen origin preserves viewport popup coordinates',desktopCard.style.left==='412px'&&desktopCard.style.top==='180px',desktopCard.style.left+','+desktopCard.style.top);

    const mobileCards=Array.from({length:5},()=>makeCard());
    globalThis.window={innerWidth:600,innerHeight:700,scrollX:0,scrollY:0};controller.layer={children:mobileCards};controller.origins=[];
    controller.reposition();
    check('behavior: mobile centers the last three visible levels',mobileCards.slice(-3).map(card=>card.style.top).join('|')==='260px|278px|296px',mobileCards.slice(-3).map(card=>card.style.top).join('|'));
  }finally{
    if(previousWindow===undefined)delete globalThis.window;else globalThis.window=previousWindow;
    if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument;
  }
}catch(error){check('popup behavioral state machine',false,error.message);}

check('Journey captures full popup context',journey.includes('popupIds:this.popups.snapshot()')&&journey.includes('popupRootId')&&journey.includes('popupAction'));
check('Journey carries no removed inline glossary state',!journey.includes('this.glossary')&&!journey.includes('glossaryState'));
const backSource=journey.match(/back\(\)\{[\s\S]*?\n    \}/)?.[0]||'';
check('Back restores before highlighting rebuilt action',backSource.indexOf('this.popups.restore(record.popupIds')<backSource.indexOf('this.highlight(restoredPopup||trigger)'));
check('Back restores popups only after navigation settles',backSource.indexOf('this.navigation.restore')<backSource.indexOf('this.popups.restore(record.popupIds'));
check('Back has rebuilt-action fallback',journey.includes('this.findRestoredAction(record.popupAction)'));
check('click navigation highlights only after controlled scroll settles',navigation.includes("()=>{this.highlighter.show(targets.highlightTarget);settled?.();}"));

const cssFiles=['styles/tokens.css','styles/layout.css','styles/navigation.css','styles/content.css','styles/popups.css'];
check('all five style layers are linked',cssFiles.every(file=>html.includes('href="./'+file+(file==='styles/content.css'?'?v=28':file==='styles/popups.css'?'?v=17':file==='styles/navigation.css'?'?v=11':file==='styles/tokens.css'?'?v=10':'?v=9')+'"')));
const contentCss=read('styles/content.css');
check('datasheet quick navigation overrides the shared desktop rail and is phone-only',contentCss.includes('body .unit-card > .local-nav { display: none; }')&&contentCss.includes('@media (max-width: 600px)')&&contentCss.includes('position: sticky;')&&contentCss.includes('overflow-x: auto;'));
const navigationCss=read('styles/navigation.css');
check('navigation hides horizontal overflow and styles its scrollbar',/\.toc-panel\s*\{[^}]*overflow-x:\s*hidden/.test(navigationCss)&&navigationCss.includes('.toc-panel::-webkit-scrollbar-thumb')&&navigationCss.includes('scrollbar-color:'));
check('shared datasheet statlines keep every characteristic on one row',/\.unit-card \.statline\s*\{[^}]*display:\s*flex/.test(datasheetCss));
check('mobile weapon characteristics use one six-column row',datasheetCss.includes('grid-template-columns: repeat(6, minmax(0, 1fr))')&&(markup.match(/data-label="(?:Range|A|BS|WS|S|AP|D)"/g)||[]).length===146*6);
check('heading destination highlight uses text glow without outline',/\.destination-highlight:is\(h1,h2,h3,h4,h5,h6\)\s*\{[^}]*animation-name:\s*destination-heading-highlight/.test(contentCss)&&contentCss.includes('@keyframes destination-heading-highlight')&&!contentCss.match(/@keyframes destination-heading-highlight[^}]*outline/));
check('detachment navigation targets render in separate rows',/\.detachment-content\s*\{[^}]*grid-template-columns:\s*1fr/.test(contentCss));
check('desktop stratagem cards use two columns with a responsive fallback',contentCss.includes('.detachment-part[id$="-stratagems"] > .detachment-content { grid-template-columns: repeat(2, minmax(0, 1fr))')&&/@media\s*\(max-width:\s*1100px\)[\s\S]*?grid-template-columns:\s*1fr/.test(contentCss));
check('all ten Core Stratagems are present in the shared book source',(markup.match(/id="core-stratagem-[^"]+"/g)||[]).length===10);
check('Core Stratagems feed the shared related-rules panel',read('mobile/related-rules.inc').includes('data-detachment="core"')&&(read('mobile/related-rules.inc').match(/id="core-stratagem-[^"]+"/g)||[]).length===10);
check('Core Stratagem eligibility is keyword-aware',read('scripts/related-rules.js').includes("id==='core-stratagem-smokescreen'")&&read('scripts/related-rules.js').includes("id==='core-stratagem-epic-challenge'")&&read('scripts/related-rules.js').includes("id==='core-stratagem-crushing-impact'"));
check('filtered related rules stay hidden despite card display styles',contentCss.includes('.related-rules-layer [hidden],#relatedRulesContent [hidden]{display:none!important}'));
check('detachment Stratagems avoid the harmful outer grid',!contentCss.includes('section[id$="-stratagems"]')&&contentCss.includes('.detachment-part[id$="-stratagems"] > .detachment-content'));
check('full entry becomes a full-screen mobile dialog',/@media\s*\(max-width:\s*800px\)[\s\S]*?\.full-entry-dialog\s*\{[^}]*height:\s*100%/.test(read('styles/popups.css')));
check('each detachment has a visible Stratagems destination',(markup.match(/class="detachment-part"[^>]*data-track="[^"]+">\s*<h4 class="detachment-part-title">Stratagems<\/h4>/g)||[]).length===bookData.audit.detachments);
check('no inline style or inline script',!/<style|<script(?![^>]*src=)/i.test(html));
check('only related rules are fetched at runtime',files.every(file=>file==='scripts/app.js'?((read(file).match(/\bfetch\s*\(/g)||[]).length===1&&read(file).includes("fetch('./mobile/related-rules.inc?v=2')")):!/\bfetch\s*\(/.test(read(file))));
check('Roster Guide passes its detachments to the shared related-rules view',read('scripts/roster-filter.js').includes('window.DG_ROSTER_GUIDE')&&read('scripts/app.js').includes('window.DG_ROSTER_GUIDE?.detachmentIds')&&read('scripts/app.js').includes('rosterDetachments.has(section.dataset.detachment)'));
check('service worker registration is protocol gated',read('scripts/app.js').includes("location.protocol==='http:'||location.protocol==='https:'"));
check('weapon rows receive explicit table semantics',read('scripts/ui-controllers.js').includes("row.setAttribute('role','row')"));
check('mobile header disables expensive backdrop blur',/@media\s*\(max-width:\s*800px\)[\s\S]*?\.app-header\s*\{[^}]*backdrop-filter:\s*none/.test(read('styles/layout.css')));
check('mobile popups disable expensive backdrop blur',/@media\s*\(max-width:\s*800px\)[\s\S]*?\.popup-layer:has\(\.term-popup\)::before\s*\{[^}]*backdrop-filter:\s*none/.test(read('styles/popups.css')));
const mobileCss=read('mobile/mobile.css');
check('mobile section jumps clear the fixed header and safe area',mobileCss.includes('scroll-margin-top: calc(var(--header) + env(safe-area-inset-top) + 10px)')&&!mobileCss.includes('var(--header-height)'));
check('mobile controls have no delayed decorative motion',/@media\s*\(max-width:\s*800px\)[\s\S]*?\.toc-panel\s*\{[^}]*transition:\s*none/.test(read('styles/navigation.css'))&&/@media\s*\(max-width:\s*800px\)[\s\S]*?\.term-popup\s*\{[^}]*animation:\s*none/.test(read('styles/popups.css')));
check('safe mobile controls activate on touch-down',navigation.includes("this.menuButton.addEventListener('touchstart'")&&popups.includes("const close=event.target.closest('[data-popup-close]')")&&fullEntry.includes("event.target.closest('[data-full-entry-close]')"));
check('static content cards do not impersonate controls',!contentCss.includes('.rule-card:hover')&&!contentCss.includes('.enhancement:hover')&&!contentCss.includes('.glossary-card:hover')&&!contentCss.includes('[data-term]:active'));
check('touch controls use the native fast-tap contract',read('styles/tokens.css').includes('button, a { touch-action: manipulation; -webkit-tap-highlight-color: transparent; }'));
check('touch terms open only after a completed tap, never during a scroll gesture',popups.includes("document.addEventListener('pointerdown'")&&popups.includes("document.addEventListener('pointermove'")&&popups.includes("document.addEventListener('pointerup'")&&popups.includes('this.touchTerm.moved')&&popups.includes('if(!this.touchTerm.moved)this.open'));
check('roster loadouts use the shared profile-family matcher',read('scripts/roster-filter.js').includes('WHRosterEntities.loadoutIncludesProfile'));
check('Contagion Engines uses current MFM disposition',JSON.stringify(bookData).includes('Force Disposition: Reconnaissance. Detachment Points: 1DP. Tag: ENGINES.')&&!JSON.stringify(bookData).includes('Force Disposition: Purge the Foe. Detachment Points: 1DP. Tag: ENGINES.'));
check('book uses the unified root manifest',html.includes('href="../../manifest.webmanifest"'));
check('release service worker owns its cache family',readProject('service-worker.js').includes('key.startsWith(CACHE_PREFIX)')&&readProject('service-worker.js').includes('warhammer-rules-fe1d435-'));
check('release PWA cache revision is content-derived',readProject('service-worker.js').includes('self.WH40K_CACHE_REVISION'));
check('book scripts and styles use the current release token',[...cssFiles.filter(file=>!['styles/tokens.css','styles/content.css','styles/navigation.css','styles/popups.css'].includes(file)),...files.filter(file=>!['scripts/roster-filter.js','scripts/navigation-controller.js','scripts/popup-controller.js','scripts/full-entry-controller.js','scripts/journey-controller.js','scripts/ui-controllers.js','scripts/related-rules.js','scripts/app.js'].includes(file))].every(file=>html.includes('./'+file+'?v=9'))&&html.includes('./styles/tokens.css?v=10')&&html.includes('./styles/content.css?v=28')&&html.includes('./styles/navigation.css?v=11')&&html.includes('./styles/popups.css?v=17')&&html.includes('./scripts/roster-filter.js?v=14')&&html.includes('./scripts/navigation-controller.js?v=15')&&html.includes('./scripts/popup-controller.js?v=23')&&html.includes('./scripts/full-entry-controller.js?v=8')&&html.includes('./scripts/journey-controller.js?v=11')&&html.includes('./scripts/ui-controllers.js?v=11')&&html.includes('./scripts/related-rules.js?v=6')&&html.includes('./scripts/app.js?v=28'));
check('book loads the shared navigation target resolver',html.includes('src="../shared/navigation-targets.js?v=1"'));
check('book loads the shared datasheet design',html.includes('href="../shared/datasheet-system.css?v=6"'));
check('book loads the shared datasheet layout',html.includes('src="../shared/datasheet-layout.js?v=2"'));
check('glossary autolinking precedes navigation geometry',read('scripts/app.js').indexOf('WHGlossaryAutolink?.apply')<read('scripts/app.js').indexOf('new window.DGNavigation'));
check('v4 icon is used without legacy v3 PNG references',html.includes('assets/icon-v4.svg')&&!html.includes('icon-180.png'));
check('navigation and popup specifications are present',['docs/SPEC_NAVIGATION.md','docs/SPEC_POPUPS.md'].every(file=>fs.existsSync(path.join(root,file))));
const navigationSpec=read('docs/SPEC_NAVIGATION.md');
check('navigation spec keeps nested-group behavior independent of item count',navigationSpec.includes('The rule does not depend on the number of items in a particular book')&&!navigationSpec.includes('nested Glossary items after a click'));
check('navigation spec delegates concrete inventory to book data',navigationSpec.includes('The number of global targets is not fixed in this specification')&&navigationSpec.includes('expected set from its structured data'));
check('navigation spec treats 2200ms as recovery rather than success',navigationSpec.includes('does not itself count as successful completion')&&navigationSpec.includes('performs final positioning'));
check('navigation spec defines singular label and plural section',navigationSpec.includes('`Enhancement` leads to the shared block with the visible heading `Enhancements`'));

for(const result of results)console.log(`${result.ok?'PASS':'FAIL'}  ${result.name}${result.detail?' — '+result.detail:''}`);
const failed=results.filter(result=>!result.ok);
console.log(`\n${results.length-failed.length}/${results.length} checks passed.`);
if(failed.length)process.exitCode=1;
