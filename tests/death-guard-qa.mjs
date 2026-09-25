import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {runHelbruteProviderQa} from './helpers/death-guard-helbrute.mjs';
import {extractControllerClass} from './helpers/controller-source-extraction.mjs';
import {assertOwnedMobileRouteInventory} from './helpers/mobile-route-inventory.mjs';

const projectRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const helbruteQa=runHelbruteProviderQa({root:projectRoot});
if(process.argv.includes('--helbrute')){console.log(`Death Guard Helbrute provider QA: PASS (${helbruteQa.count} controls).`);process.exit(0);}
const root=path.join(projectRoot,'books','death-guard');
const sharedOwned=new Map([['styles/tokens.css','books/shared/styles/tokens.css'],['styles/layout.css','books/shared/styles/layout.css'],['styles/navigation.css','books/shared/styles/navigation.css'],['styles/content.css','books/shared/styles/content.css'],['styles/popups.css','books/shared/styles/popups.css'],['scripts/navigation-controller.js','books/shared/controllers/navigation-controller.js'],['scripts/popup-controller.js','books/shared/controllers/popup-controller.js'],['scripts/full-entry-controller.js','books/shared/controllers/full-entry-controller.js'],['scripts/journey-controller.js','books/shared/controllers/journey-controller.js'],['scripts/ui-controllers.js','books/shared/controllers/ui-controllers.js']]);
const read=name=>fs.readFileSync(sharedOwned.has(name)?path.join(projectRoot,sharedOwned.get(name)):path.join(root,name),'utf8');
const readProject=name=>fs.readFileSync(path.join(projectRoot,name),'utf8');
const targetSandbox={window:{}};vm.runInNewContext(read('scripts/target-data.js'),targetSandbox);
const html=read('reader.html')+targetSandbox.window.WH_ARMY_BOOK_TARGETS.html;
const navigationTargets=readProject('books/shared/navigation-targets.js');
const datasheetLayout=readProject('books/shared/datasheet-layout.js');
const datasheetCss=readProject('books/shared/datasheet-system.css');
const popupContent=readProject('books/shared/popup-content.js');
const glossaryAutolink=readProject('books/shared/glossary-autolink.js');
const sharedArmyBook=readProject('books/shared/army-book-app.js');
const sharedRosterContext=readProject('books/shared/roster-context.js');
const sharedEffectRuntime=readProject('books/shared/effect-contract-runtime.js');
const dgEffectContracts=JSON.parse(read('sources/death-guard-effect-contracts.v1.json')).contracts;
const sharedRelatedRules=readProject('books/shared/army-related-rules.js');
const sharedCompatibleMatrix=readProject('books/shared/compatible-rules-matrix.mjs');
const sharedStratagemPresentation=readProject('books/shared/stratagem-presentation.mjs');
const glossaryRegistry=JSON.parse(readProject('glossary/registry.en.json'));
const bookData=JSON.parse(read('content/death-guard-rules.en.json'));
const coreData=JSON.parse(readProject('books/core-rules/content/core-rules.digital-11e.json'));
const files=['scripts/roster-semantics.js','scripts/roster-filter.js','scripts/navigation-controller.js','scripts/popup-controller.js','scripts/full-entry-controller.js','scripts/journey-controller.js','scripts/ui-controllers.js','scripts/app.js'];
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
const ruleById=id=>walkBlocks.find(block=>block.type==='rule'&&block.id===id);
check('audited Faction Pack Stratagem wording stays official',
  JSON.stringify(ruleById('stratagem-soulrot-flux')?.lines)===JSON.stringify([
    'WHEN: Your opponent’s Movement phase, when an enemy unit is selected to make a fall-back move, if that enemy unit is engaged with a friendly CONTAGION ENGINE unit.',
    'TARGET: That CONTAGION ENGINE unit.',
    'EFFECT: When an enemy unit engaged with your unit is selected to make a fall-back move, roll one D6:\n• On a 1, that enemy unit suffers 1 mortal wound.\n• On a 2-5, that enemy unit suffers D3 mortal wounds.\n• On a 6, that enemy unit suffers 3 mortal wounds.'
  ])&&
  JSON.stringify(ruleById('stratagem-droning-horror')?.lines)===JSON.stringify([
    'WHEN: Your Shooting phase, when a friendly PLAGUE MARINES unit is selected to shoot.',
    'TARGET: That PLAGUE MARINES unit.',
    'EFFECT: Your unit’s ranged attacks:\n• Can re-roll hit rolls of 1.\n• That target a unit within half range, can re-roll wound rolls of 1.'
  ])&&
  ruleById('stratagem-nauseating-paroxysms')?.lines?.[0]==='WHEN: Start of the Fight phase'&&
  ruleById('stratagem-aggravus-spasms')?.lines?.[0]==='WHEN: Start of your Shooting Phase.');
check('canonical content audit is 9 detachments, 36 local datasheets and 366 terms',bookData.audit.detachments===9&&bookData.audit.datasheets===36&&bookData.glossary.length===366);
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
check('Mortarion uses the current Faction Pack wording',
  mortarionAbility.full.includes('move within 8"')&&
  mortarionAbility.full.includes('worsen the BS characteristic of that attack by 1')&&
  !mortarionAbility.full.includes('move within 9"'));
check('Miasmic Malignifier uses the canonical Deployment ability name',
  html.includes('<h5>Deployment</h5>')&&!html.includes('<h5>Fortification Setup</h5>'));
const pactDependencyIds=['unit-beasts-of-nurgle','unit-great-unclean-one','unit-nurglings','unit-plague-drones','unit-plaguebearers','unit-rotigus'];
check('Pact of Decay publications remain local datasheets with their Tallyband Summoners context',pactDependencyIds.every(id=>{const unit=bookData.sections.find(section=>section.id===id);return unit&&unit.local!==false&&JSON.stringify(unit).includes('Tallyband Summoners Detachment')&&html.includes(`id="${id}"`);}));
check('full gameplay block inventory is present',blockCount('enhancement')===30&&blockCount('rule')===45&&blockCount('statline')===36&&blockCount('weapon')===146,`enhancements ${blockCount('enhancement')}, rules ${blockCount('rule')}, statlines ${blockCount('statline')}, weapons ${blockCount('weapon')}`);
check('all navigation targets exist',navTargets.every(id=>idSet.has(id)),navTargets.filter(id=>!idSet.has(id)).join(', '));
check('all navigation targets have tracked ranges',navTargets.every(id=>trackTargets.includes(id)),navTargets.filter(id=>!trackTargets.includes(id)).join(', '));
check('navigation covers the gameplay tree without inline glossary branches',navTargets.length===93&&!navTargets.some(id=>id==='glossary'||id==='core-stratagems'||id.startsWith('glossary-')),String(navTargets.length));
const depths=[...markup.matchAll(/data-nav-depth="(\d+)"/g)].map(match=>Number(match[1]));
check('navigation depth is at most three',Math.max(...depths)===3);
const unitIds=bookData.sections.filter(section=>section.kind==='unit'&&section.local!==false).map(section=>section.id);
check('all 36 local datasheets are global navigation destinations',unitIds.length===36&&unitIds.every(id=>navTargets.includes(id)));
const unitById=id=>bookData.sections.find(section=>section.id===id);
const legendIds=['unit-death-guard-possessed','unit-death-guard-chaos-lord','unit-death-guard-chaos-lord-in-terminator-armour','unit-death-guard-cultists','unit-death-guard-sorcerer-in-terminator-armour'];
check('Death Guard Legends datasheets are absent from the published book',legendIds.every(id=>!unitById(id)&&!html.includes(`id="${id}"`)));
const requiredWargear=['unit-plague-marines','unit-blightlord-terminators','unit-deathshroud-terminators','unit-chaos-land-raider','unit-chaos-predator-annihilator','unit-chaos-predator-destructor','unit-foetid-bloat-drone','unit-helbrute','unit-plagueburst-crawler','unit-chaos-rhino','unit-great-unclean-one','unit-plague-drones','unit-plaguebearers'];
check('audited datasheets retain every missing Wargear Options block',requiredWargear.every(id=>unitById(id)?.subsections.some(part=>part.title==='Wargear Options')));
const auditedAbilities=['mortarion-ability-supreme-commander','plague-marines-ability-icon-of-despair-aura','deathshroud-terminators-ability-icon-of-despair-aura','great-unclean-one-ability-reverberating-summons','plague-drones-ability-daemonic-icon','plague-drones-ability-instrument-of-chaos','plaguebearers-ability-daemonic-icon','plaguebearers-ability-instrument-of-chaos','miasmic-malignifier-ability-fortification-setup'];
const renderedAuditedAbilities=auditedAbilities.filter(id=>!/(?:great-unclean-one|plague-drones|plaguebearers)/.test(id));
check('audited datasheet abilities remain complete',auditedAbilities.every(id=>bookData.sections.some(section=>(section.subsections||[]).some(part=>(part.blocks||[]).some(block=>block.id===id))))&&renderedAuditedAbilities.every(id=>html.includes(`id="${id}"`)));
const deathApproaches=unitById('unit-deathshroud-terminators')?.subsections.flatMap(part=>part.blocks||[]).find(block=>block.id==='deathshroud-terminators-ability-death-approaches');
check('Death Approaches retains the W2-19 Movement timing and 6/8 inch deployment boundary',deathApproaches?.text==='In your Movement phase, each time this unit is set up on the battlefield using the Deep Strike ability, it can be set up anywhere on the battlefield that is more than 6" horizontally away from all Afflicted enemy units, and more than 8" horizontally away from all other enemy units.');
const pointValue=(id,label)=>unitById(id)?.points.find(row=>row.label===label)?.value;
check('Death Guard points match centralized Munitorum Field Manual v1.4',bookData.audit.currentMFM==='v1.4'&&pointValue('unit-mortarion','1 model')===375&&pointValue('unit-plague-marines','10 models')===180&&pointValue('unit-deathshroud-terminators','1st–2nd unit: 6 models')===305&&pointValue('unit-defiler','2nd+ unit: 1 model')===350&&pointValue('unit-chaos-rhino','1st–3rd unit: 1 model')===75);
check('Contagion Engines separates rules and MFM provenance',JSON.stringify(bookData).includes('Rules source: Death Guard Faction Pack v1.1, p.2. Force Disposition and Detachment Points: Munitorum Field Manual v1.3, 26 August 2026.')&&html.includes('Rules source: Death Guard Faction Pack v1.1, p.2. Force Disposition and Detachment Points: Munitorum Field Manual v1.3, 26 August 2026.'));
check('current official Death Guard sources are identified',bookData.audit.currentFactionPack==='v1.1'&&bookData.audit.officialFactionPackDate==='2026-07-22'&&bookData.audit.verifiedAt==='2026-08-27'&&JSON.stringify(bookData).includes('Official rules overlay: Death Guard Faction Pack v1.1')&&JSON.stringify(bookData).includes('Remaining authority gap: Codex-derived rules'));
check('Faction Pack updates contain full wording',!bookData.sections.find(section=>section.id==='rules-updates').blocks.some(block=>block.text.includes('use the replacement wording')));
const detachmentSections=bookData.sections.filter(section=>section.id.startsWith('detachment-'));
check('all nine detachment trees expose rule, Enhancement and Stratagems',detachmentSections.length===9&&detachmentSections.every(section=>(section.subsections||[]).length===3)&&detachmentSections.every(section=>['Detachment Rule','Enhancement','Stratagems'].every(label=>markup.includes(`data-nav-target="${section.subsections[['Detachment Rule','Enhancement','Stratagems'].indexOf(label)].id}">${label}</button>`))));
const unitLocalIds=bookData.sections.filter(section=>section.kind==='unit').flatMap(section=>[`${section.id}-profile`,...(section.subsections||[]).map(sub=>sub.id)]);
check('datasheet local parts are absent from global navigation',unitLocalIds.every(id=>!navTargets.includes(id)));

const dataSource=read('scripts/data.js');
const termContext={window:{},Object};
vm.runInNewContext(dataSource,termContext,{filename:'scripts/data.js'});
const termKeys=Object.keys(termContext.window.DG_TERMS||{});
check('official Stratagem wording reaches desktop, Phone Mode, popup and Mega Glossary',
  /roll one D6:\s*<br>• On a 1/.test(html)&&
  /Your unit’s ranged attacks:\s*<br>• Can re-roll hit rolls of 1\./.test(html)&&
  read('mobile/contagion-engines.html').includes('mobile-route-redirect.js?v=2')&&
  read('mobile/flyblown-host.html').includes('mobile-route-redirect.js?v=2')&&
  termContext.window.DG_TERMS['soulrot-flux'].summary.includes('make a fall-back move')&&
  termContext.window.DG_TERMS['droning-horror'].summary.includes('ranged attacks: Can re-roll')&&
  glossaryRegistry.terms['death-guard-stratagem-soulrot-flux'].definition.en.includes('• On a 6, that enemy unit suffers 3 mortal wounds.')&&
  glossaryRegistry.terms['death-guard-stratagem-droning-horror'].definition.en.includes('• That target a unit within half range, can re-roll wound rolls of 1.'));
const usedTerms=[...markup.matchAll(/data-term="([^"]+)"/g)].map(match=>match[1]);
check('term registry has all 366 entries',termKeys.length===366,String(termKeys.length));
check('all term triggers resolve',usedTerms.every(id=>termKeys.includes(id)||glossaryRegistry.terms[id]),usedTerms.filter(id=>!termKeys.includes(id)&&!glossaryRegistry.terms[id]).join(', '));
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
check('navigation uses the shared explicit target resolver',navigation.includes('WHNavigationTargets.resolve'));
check('navigation has explicit reader/controller ownership',navigation.includes("owner:'reader'")&&navigation.includes("owner='controller'")&&navigation.includes("owner='reader'"));
const settleSource=navigation.match(/waitForSettle\([\s\S]*?\n    cancelTransition/)?.[0]||'';
check('navigation settlement retains reachable destination geometry',settleSource.includes('reachableDestination'));
check('first destination frame cannot release scroll-spy',!settleSource.includes('if(atDestination||stable>=6)')&&!settleSource.includes('Math.abs(current-destination)<2||stable>=6'));
check('mobile breakpoint clears collapsed state',navigation.includes('if(mobile)this.state.collapsed=false'));
check('mobile navigation retains immediate cancellation behavior',navigation.includes("root.style.scrollBehavior='auto'")&&navigation.includes("behavior:'auto'"));
check('native inert avoids the full tabindex walk',navigation.includes("this.supportsInert='inert'in HTMLElement.prototype")&&navigation.includes('if(this.supportsInert){root.inert=!interactive;return;}'));
check('tabindex fallback remains available for legacy browsers',navigation.includes('data-nav-saved-tabindex'));
check('unchanged drawer state is a no-op',navigation.includes('if(next===this.state.drawer)return'));
const readViewportSource=navigation.match(/readViewport\(\)\{[\s\S]*?\n    \}/)?.[0]||'';
check('scroll spy performs no layout measurements per frame',!readViewportSource.includes('getBoundingClientRect'));
check('scroll spy ignores hidden navigation ranges',navigation.includes('measurable:rect.width>0||rect.height>0')&&navigation.includes('if(range.measurable===false)continue'));
check('scroll spy keeps descendant ownership across visual gaps',navigation.includes('lastCrossedDescendant'));
check('mobile layout avoids content-visibility geometry jumps',!readProject('books/shared/styles/content.css').includes('content-visibility: auto'));
check('user input cancels controlled scrolling',navigation.includes('cancelTransition()')&&navigation.includes("window.addEventListener('touchstart'"));
check('navigation branches use strict sibling accordion',navigation.includes("if(peer!==node&&peer.matches('[data-nav-id]'))this.closeBranch(peer,{deep:true})")&&!navigation.includes('isOnActivePath'));
check('manual accordion state yields back to scroll tracking',navigation.includes('pathIsOpen(node)')&&navigation.includes("else if(item&&!this.pathIsOpen(item.node))this.revealPath(item.node,{includeSelf:true})"));
check('branch labels and arrows have separate actions',navigation.includes("event.target.closest('[data-nav-toggle]')")&&navigation.includes("event.target.closest('[data-nav-target]')"));
check('Start closes every open navigation branch before returning to the top',navigation.includes("if(label.dataset.navTarget==='start')this.closeEveryBranch()"));
const navigationClassSource=extractControllerClass(navigation,'NavigationController','DGNavigation');
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
check('datasheet actions appear only inside Related Rules',!popups.includes('Datasheet & Wargear')&&!popups.includes("label:'Statline'")&&popups.includes("label:'Open datasheet'")&&popups.includes("closest?.('.related-rules-layer')"));
check('Mega Glossary transitions use the shared return helper',/\.\.\/\.\.\/glossary-return\.js\?v=\d+/.test(html)&&read('scripts/full-entry-controller.js').includes('WHGlossaryReturn')&&sharedArmyBook.includes('WHGlossaryReturn'));
check('popups use the shared semantic profile renderer',popups.includes('WHPopupContent.render')&&popupContent.includes("document.createElement('table')")&&popupContent.includes("document.createElement('dl')"));
check('unit popup grid has a mobile no-overflow layout',/\.popup-stats\s*\{[^}]*grid-template-columns:\s*repeat\(auto-fit, minmax\(54px, 1fr\)\)/.test(read('styles/popups.css'))&&/@media\s*\(max-width:\s*480px\)[\s\S]*?\.popup-stats\s*\{[^}]*grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/.test(read('styles/popups.css')));

const popupClassSource=extractControllerClass(popups,'PopupController','DGPopups');
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
const backSource=journey.match(/async restoreLast\(\)\{[\s\S]*?\n    \}/)?.[0]||'';
check('Back restoration retains navigation, popup and highlight stages',journey.includes('this.navigation.restore')&&journey.includes('this.popups.restore')&&journey.includes('this.highlight'));
check('Back restoration remains owned by the shared Journey controller',journey.includes('back(')&&journey.includes('restore('));
check('Back has rebuilt-action fallback',journey.includes('this.findRestoredAction(record.popupAction)'));
check('click navigation highlights only after controlled scroll settles',navigation.includes("()=>{this.highlighter.show(targets.highlightTarget);settled?.();}"));

const cssFiles=['styles/tokens.css','styles/layout.css','styles/navigation.css','styles/content.css','styles/popups.css'];
check('all five style layers are linked',cssFiles.every(file=>html.includes('href="../shared/'+file+'?v=')));
const contentCss=read('styles/content.css');
check('datasheet quick navigation overrides the shared desktop rail and is phone-only',contentCss.includes('body .unit-card > .local-nav { display: none; }')&&contentCss.includes('@media (max-width: 600px)')&&contentCss.includes('position: sticky;')&&contentCss.includes('overflow-x: auto;'));
const navigationCss=read('styles/navigation.css');
check('navigation hides horizontal overflow and styles its scrollbar',/\.toc-panel\s*\{[^}]*overflow-x:\s*hidden/.test(navigationCss)&&navigationCss.includes('.toc-panel::-webkit-scrollbar-thumb')&&navigationCss.includes('scrollbar-color:'));
check('shared datasheet statlines keep every characteristic on one row',/\.unit-card \.statline\s*\{[^}]*display:\s*flex/.test(datasheetCss));
check('mobile weapon characteristics use one six-column row',datasheetCss.includes('grid-template-columns: repeat(6, minmax(0, 1fr))')&&(markup.match(/data-label="(?:Range|A|BS|WS|S|AP|D)"/g)||[]).length===146*6);
check('heading destination highlight uses text glow without outline',/\.destination-highlight:is\(h1,h2,h3,h4,h5,h6\)\s*\{[^}]*animation-name:\s*destination-heading-highlight/.test(contentCss)&&contentCss.includes('@keyframes destination-heading-highlight')&&!contentCss.match(/@keyframes destination-heading-highlight[^}]*outline/));
check('detachment navigation targets render in separate rows',/\.detachment-content\s*\{[^}]*grid-template-columns:\s*1fr/.test(contentCss));
check('Stratagem grids preserve intrinsic readable card width',/\.stratagem-grid\s*\{[^}]*grid-template-columns:repeat\(auto-fit,minmax\(min\(100%,360px\),1fr\)\)/.test(contentCss)&&/\.full-related-content \.detachment-content[^}]*grid-template-columns:repeat\(2,minmax\(min\(100%,360px\),1fr\)\)/.test(contentCss)&&/\.full-related-content \.related-detachment>[^}]*grid-template-columns:repeat\(2,minmax\(min\(100%,360px\),1fr\)\)/.test(contentCss));
check('all ten Core Stratagems are present in the shared book source',(markup.match(/id="core-stratagem-[^"]+"/g)||[]).length===10);
const decode=value=>String(value).replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]*>/g,'').replaceAll('&quot;','"').replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replace(/\r/g,'').trim();
const coreRecords=coreData.records.filter(record=>/^15\.(?:0[2-8]|1[0-2])$/.test(record.code)&&record.code!=='15.09');
const coreFields=record=>{const fields={};let current='';for(const line of record.text.split('\n').slice(2)){const match=/^(WHEN|TARGET|EFFECT|RESTRICTIONS):\s*(.*)$/.exec(line);if(match){current=match[1].toLowerCase();fields[current]=match[2];}else if(current)fields[current]+=`\n${line}`;}return fields;};
const coreTextParity=coreRecords.every(record=>{const id=`core-stratagem-${record.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}`,card=new RegExp(`<article\\b[^>]*id="${id}"[\\s\\S]*?<\\/article>`).exec(markup)?.[0]||'';return Object.entries(coreFields(record)).every(([field,text])=>{const rendered=new RegExp(`<p\\b[^>]*data-source-field="${field}"[^>]*>[\\s\\S]*?<\\/p>`).exec(card)?.[0]||'';return decode(rendered).replace(new RegExp(`^${field}\\s*`,'i'),'')===text;});});
check('all ten Core Stratagem cards match the canonical Core Rules source',coreTextParity);
const relatedRulesMarkup=read('mobile/related-rules.inc');
check('Core Stratagems feed the shared related-rules panel',relatedRulesMarkup.includes('data-detachment="core"')&&(relatedRulesMarkup.match(/id="core-stratagem-[^"]+"/g)||[]).length===10);
check('Compatible Rules group headings are not duplicated',(relatedRulesMarkup.match(/<section class="related-detachment(?: related-core)?"/g)||[]).length===10&&(relatedRulesMarkup.match(/<h2>Core Stratagems<\/h2>/g)||[]).length===1&&!/<h[34]\b[^>]*>(?:Core )?Stratagems<\/h[34]>/.test(relatedRulesMarkup)&&(relatedRulesMarkup.match(/<article\b[^>]*\bid="(?:core-stratagem|stratagem|enhancement)-[^"]+"/g)||[]).length===85);
check('filtered related rules stay hidden despite card display styles',contentCss.includes('.related-rules-layer [hidden],#relatedRulesContent [hidden]{display:none!important}'));
check('detachment Stratagems use the shared explicit grid',!contentCss.includes('.detachment-part[id$="-stratagems"]')&&(markup.match(/class="detachment-content stratagem-grid"/g)||[]).length===bookData.audit.detachments);
check('full entry becomes a full-screen mobile dialog',/@media\s*\(max-width:\s*800px\)[\s\S]*?\.full-entry-dialog\s*\{[^}]*height:\s*100%/.test(read('styles/popups.css')));
check('each detachment has a visible Stratagems destination',(markup.match(/class="detachment-part"[^>]*data-track="[^"]+">\s*<h4 class="detachment-part-title">Stratagems<\/h4>/g)||[]).length===bookData.audit.detachments);
check('no inline style or inline script',!/<style|<script(?![^>]*src=)/i.test(html));
check('Compatible Rules use the shared lazy matrix and template loaders',appSource.includes('createCompatibleRulesLoader')&&appSource.includes("schema:'death-guard-compatible-rules/v1'")&&sharedCompatibleMatrix.includes('let source=null,pending=null')&&sharedRelatedRules.includes('getTemplate(templateUrl)')&&sharedRelatedRules.includes('fetch(url)'));
check('Roster Guide consumes the shared projection with exact Enhancement owners',read('scripts/roster-filter.js').includes("guideGlobal:'DG_ROSTER_GUIDE'")&&appSource.includes('rosterGuide:()=>window.DG_ROSTER_GUIDE')&&appSource.includes("rosterEnhancements:'assigned-only'")&&sharedRelatedRules.includes('resolveRosterEnhancements')&&sharedRelatedRules.includes('guide.enhancements')&&sharedRelatedRules.includes('owner?.instanceId')&&!sharedRelatedRules.includes('enhancementRuleIdsByUnitId')&&!sharedRelatedRules.includes('enhancementRecordsByUnitId'));
check('offline ownership remains in the root service worker',readProject('service-worker.js').includes('APP_SHELL')&&readProject('service-worker.js').includes('CACHE_NAME'));
check('weapon rows receive explicit table semantics',read('scripts/ui-controllers.js').includes("row.setAttribute('role','row')"));
check('mobile header disables expensive backdrop blur',/@media\s*\(max-width:\s*800px\)[\s\S]*?\.app-header\s*\{[^}]*backdrop-filter:\s*none/.test(read('styles/layout.css')));
check('mobile popups disable expensive backdrop blur',/@media\s*\(max-width:\s*800px\)[\s\S]*?\.popup-layer:has\(\.term-popup\)::before\s*\{[^}]*backdrop-filter:\s*none/.test(read('styles/popups.css')));
const mobileBuild=read('mobile/build.mjs');
const mobileTyphus=read('mobile/typhus.html');
const mobileIndex=read('mobile/index.html');
const mobileRouteRedirect=readProject('books/shared/mobile-route-redirect.js');
const sharedMobileBuilder=readProject('books/shared/tools/build-mobile-stubs.mjs');
const mobileHtmlFiles=fs.readdirSync(path.join(root,'mobile')).filter(file=>file.endsWith('.html')).sort();
const mobileOutputs=mobileHtmlFiles.map(file=>({file,html:read(path.join('mobile',file))}));
const mobileTargets=mobileOutputs.map(({html:output})=>output.match(/data-canonical-target="([^"]+)"/)?.[1]);
const mobileRouteInventory=assertOwnedMobileRouteInventory({root:projectRoot,bookId:'death-guard'});
const mobileFreshness=spawnSync(process.execPath,[path.join(root,'mobile','build.mjs'),'--check'],{cwd:projectRoot,encoding:'utf8'});
const rosterFilterRuntime=read('scripts/roster-filter.js');
const rosterSemanticRuntime=read('scripts/roster-semantics.js');
const rosterScope={console,URL,URLSearchParams};
rosterScope.window=rosterScope;
rosterScope.globalThis=rosterScope;
vm.runInNewContext(sharedRosterContext,rosterScope,{filename:'books/shared/roster-context.js'});
vm.runInNewContext(read('scripts/roster-data.js'),rosterScope,{filename:'scripts/roster-data.js'});
const rosterApi=rosterScope.WHArmyRosterContext;
const rosterCatalog=rosterScope.WH_BOOK_ROSTER_CATALOG;
let capturedProviderOptions=null,capturedSemanticOptions=null,projectEffectsArgs=null,decorateArgs=null;
const providerProbeRoot={
  DG_TERMS:{probe:'term'},
  WHArmyRosterContext:{install(options){capturedProviderOptions=options;return true;}},
  WHEffectContractRuntime:{project(options){projectEffectsArgs=options;return['effect'];}},
  DGRosterSemantics:{createContext(options){capturedSemanticOptions=options;return{
    stateKey(raw){return `state:${raw.id}`;},
    decorate(...args){decorateArgs=args;}
  };}}
};
vm.runInNewContext(rosterFilterRuntime,{window:providerProbeRoot},{filename:'scripts/roster-filter.js'});
const providerRaw={id:'raw-1'},providerCatalogUnit={id:'unit-poxwalkers',ruleFacts:{id:'facts'}},providerProjection={units:[{raw:providerRaw,catalogUnit:providerCatalogUnit}],roster:{id:'roster'},record:{attachments:{body:['leader']}},detachmentIds:new Set(['detachment-shamblerot-vectorium'])};
const provider=capturedProviderOptions?.providerFactory(providerProjection),providerContext={item:{raw:providerRaw,catalogUnit:providerCatalogUnit},gameUnit:{id:'game-unit'},detachments:[{id:'detachment-shamblerot-vectorium'}]},providerEffects=provider?.gameEffects(providerContext);
provider?.decorate({id:'card'},{detachmentIds:new Set(['detachment-shamblerot-vectorium'])},[{raw:providerRaw,game:{effects:['effect']}}]);
const fixtureUnit=rosterCatalog.units.find(unit=>unit.id==='unit-poxwalkers')||rosterCatalog.units[0];
const fixtureEnhancement=rosterCatalog.enhancements[0];
const fixtureDetachmentIds=['detachment-mortarions-hammer','detachment-flyblown-host'];
const fixtureUnits=[{id:'physical-1',canonicalUnitId:fixtureUnit.id},{id:'physical-2',canonicalUnitId:fixtureUnit.id}];
const projectFixture=detachments=>rosterApi.project({catalog:rosterCatalog,roster:{detachments:detachments.map(id=>({id})),enhancements:[{id:fixtureEnhancement.id,ownerUnitId:'physical-2',ownerStatus:'resolved'}],units:fixtureUnits},record:{attachments:{},groups:{},formations:{}}});
const oneDetachmentProjection=projectFixture([fixtureDetachmentIds[0]]);
const twoDetachmentProjection=projectFixture(fixtureDetachmentIds);
const unknownDetachmentProjection=projectFixture(['detachment-unknown']);
const projectSource=sharedRosterContext.slice(sharedRosterContext.indexOf('function project('),sharedRosterContext.indexOf('function fromRuntime('));
check('shared roster context owns installation and Death Guard remains a semantic provider',capturedProviderOptions?.bookId==='death-guard'&&capturedProviderOptions?.guideGlobal==='DG_ROSTER_GUIDE'&&(rosterFilterRuntime.match(/WHArmyRosterContext\.install\(/g)||[]).length===1&&!rosterFilterRuntime.includes('WHArmyRosterContext.create(')&&!rosterFilterRuntime.includes('WHArmyRosterContext.project(')&&!/(?:document|querySelector|createElement|DocumentFragment)/.test(rosterFilterRuntime)&&!rosterFilterRuntime.includes('const DG_RULE='));
check('Death Guard provider exposes only the shared semantic extension surface',JSON.stringify(Object.keys(provider||{}).sort())===JSON.stringify(['decorate','gameEffects','stateKey'])&&provider.stateKey(providerRaw)==='state:raw-1'&&JSON.stringify(providerEffects)===JSON.stringify(['effect'])&&projectEffectsArgs===providerContext&&capturedSemanticOptions?.roster===providerProjection.roster&&capturedSemanticOptions?.attachments===providerProjection.record.attachments&&capturedSemanticOptions?.terms===providerProbeRoot.DG_TERMS&&capturedSemanticOptions.profileFor(providerRaw)===providerCatalogUnit.ruleFacts&&decorateArgs?.[0]?.id==='card'&&decorateArgs?.[1]?.[0]===providerRaw&&JSON.stringify(decorateArgs?.[2])===JSON.stringify(['detachment-shamblerot-vectorium'])&&JSON.stringify(decorateArgs?.[3])===JSON.stringify(['effect'])&&decorateArgs?.[4]===false);
check('behavior: one known Death Guard Detachment resolves through shared projection',JSON.stringify(oneDetachmentProjection.context.detachments.map(item=>item.id))===JSON.stringify([fixtureDetachmentIds[0]]));
check('behavior: two known Death Guard Detachments remain active through shared projection',JSON.stringify(twoDetachmentProjection.context.detachments.map(item=>item.id))===JSON.stringify(fixtureDetachmentIds));
check('behavior: unknown Death Guard Detachments fail closed through shared projection',unknownDetachmentProjection.context.detachments.length===0&&unknownDetachmentProjection.context.detachment===null);
check('canonical Detachment identity is unique without DOM option ambiguity',new Set(rosterCatalog.detachments.map(item=>item.id)).size===rosterCatalog.detachments.length);
check('roster projection preserves physical instances and exact Enhancement owner without full-book DOM',twoDetachmentProjection.context.units.map(unit=>unit.instanceId).join('|')==='physical-1|physical-2'&&twoDetachmentProjection.context.enhancements[0].owner.instanceId==='physical-2'&&!projectSource.includes('document')&&!projectSource.includes('querySelectorAll'));
check('exact Enhancement ownerUnitId filtering is unchanged',sharedEffectRuntime.includes("ownerStatus==='resolved'")&&sharedEffectRuntime.includes('input.ownerUnitId')&&!fs.existsSync(path.join(root,'mobile','mobile.js')));
const bilemawContract=dgEffectContracts.find(item=>item.canonicalRecordId==='enhancement-bilemaw-blight'),sorrowsyphonContract=dgEffectContracts.find(item=>item.canonicalRecordId==='enhancement-sorrowsyphon');
check('phase-bound Bilemaw Blight does not persist while Sorrowsyphon Damage still derives',bilemawContract?.clauses.some(clause=>clause.conditions?.some(condition=>condition.state==='unknown'))&&sorrowsyphonContract?.clauses.some(clause=>clause.operations?.some(operation=>operation.type==='WEAPON_CHARACTERISTIC_ADD'&&operation.parameters?.characteristic==='D'&&operation.parameters?.value===1)));
check('Desktop and Phone load one book-local Death Guard semantic runtime',(html.match(/scripts\/roster-semantics\.js\?v=\d+/g)||[]).length===1&&mobileTyphus.includes('data-canonical-reader="../reader.html"')&&!mobileTyphus.includes('roster-semantics.js'));
check('Desktop and Phone delegate gameplay decoration without local orchestration registries',rosterFilterRuntime.includes('semantics.decorate?.(')&&!rosterFilterRuntime.includes('const DG_RULE=')&&!fs.existsSync(path.join(root,'mobile','mobile.js')));
check('invalid or absent roster input does not construct a hidden full-book source index',rosterApi.install({catalog:rosterCatalog,roster:null})===null&&!rosterFilterRuntime.includes('DocumentFragment')&&!rosterFilterRuntime.includes('display:none')&&!rosterFilterRuntime.includes('offscreen'));
check('no-roster All Detachments behavior remains presentation-only outside roster projection',appSource.includes("rosterDetachment:'all'")&&sharedRelatedRules.includes("['all',rosterMode?'All roster detachments':'All detachments']")&&mobileTyphus.includes('data-canonical-target="unit-typhus"')&&!rosterFilterRuntime.includes('location.replace('));
check('mobile generator delegates canonical content-free compatibility routes to the shared builder',
  mobileBuild.includes("from '../../shared/tools/build-mobile-stubs.mjs'")&&
  mobileBuild.includes('runMobileStubBuilder(import.meta.url')&&
  Boolean(mobileRouteInventory)&&
  mobileOutputs.every(({html:output},index)=>output.includes('data-canonical-reader="../reader.html"')&&(output.match(/mobile-route-redirect\.js\?v=2/g)||[]).length===1&&!/<(?:article|section)\b|class="[^"]*\bunit-card\b|data-rule-id=/.test(output)&&html.includes(`id="${mobileTargets[index]}"`)),
  `${mobileHtmlFiles.length} routes; targets ${new Set(mobileTargets).size}`);
check('mobile route redirects preserve the complete current query and canonical hash',mobileRouteRedirect.includes('destination.search=location.search')&&mobileRouteRedirect.includes("destination.hash=location.hash||root.dataset.canonicalTarget||''")&&mobileRouteRedirect.includes('location.replace(destination.href)'));
try{new vm.Script(mobileRouteRedirect,{filename:'books/shared/mobile-route-redirect.js'});check('Phone popup controller syntax',true);}catch(error){check('Phone popup controller syntax',false,error.message);}
const redirectRoute=(href,reader,target)=>{let replacement='',count=0;const current=new URL(href),context={document:{documentElement:{dataset:{canonicalReader:reader,canonicalTarget:target}}},location:{href:current.href,search:current.search,hash:current.hash,replace:value=>{replacement=value;count++;}},URL};vm.runInNewContext(mobileRouteRedirect,context);return{replacement,count};};
const dgRedirect=redirectRoute('https://example.test/books/death-guard/mobile/typhus.html?roster=roster-1&instance=parsed-unit-2&view=mobile','../reader.html','unit-typhus');
const dgRedirectUrl=new URL(dgRedirect.replacement);
const dgHashRedirect=redirectRoute('https://example.test/books/death-guard/mobile/typhus.html?roster=roster-1#typhus-ability-eater-plague-psychic','../reader.html','unit-typhus');
const amRedirect=redirectRoute('https://example.test/books/adeptus-mechanicus/mobile/skitarii-rangers.html?roster=roster-2&instance=parsed-unit-7','../reader.html','unit-skitarii-rangers');
const amRedirectUrl=new URL(amRedirect.replacement);
try{
  check('behavior: Phone root opening creates one level',dgRedirectUrl.pathname==='/books/death-guard/reader.html');
  check('behavior: Phone current root does not duplicate',dgRedirectUrl.hash==='#unit-typhus');
  check('behavior: Phone nested opening appends exactly one level',new URL(dgHashRedirect.replacement).hash==='#typhus-ability-eater-plague-psychic');
  check('behavior: Phone current top does not duplicate',dgRedirectUrl.searchParams.getAll('roster').length===1);
  check('behavior: Phone ancestor reopening removes the cycle',dgRedirectUrl.searchParams.get('roster')==='roster-1');
  check('behavior: Phone level close removes that level and deeper',dgRedirectUrl.searchParams.get('instance')==='parsed-unit-2');
check('behavior: Phone redirect preserves the responsive view selector',dgRedirectUrl.searchParams.get('view')==='mobile');
  check('behavior: Phone external root replaces the chain',amRedirectUrl.pathname==='/books/adeptus-mechanicus/reader.html');
  check('behavior: Phone invalid restored nested term fails safe',amRedirectUrl.hash==='#unit-skitarii-rangers'&&amRedirectUrl.searchParams.get('instance')==='parsed-unit-7');
  check('behavior: Phone missing restored root closes the chain',redirectRoute('https://example.test/books/death-guard/mobile/index.html','','start').count===0&&dgRedirect.count===1&&amRedirect.count===1);
}catch(error){check('Phone popup behavioral state machine',false,error.message);}
check('Phone popup uses canonical Glossary V2 records and shared renderers',html.includes('../../glossary/v2/generated/index.en.js')&&html.includes('../../glossary/v2/runtime/glossary-v2-runtime.js')&&html.includes('../shared/popup-content.js')&&html.includes('../shared/glossary-autolink.js')&&popups.includes('WHPopupContent.render'));
check('Phone Stratagems preserve turn metadata and add canonical type classification before and after Compatible Rules load',appSource.includes('createStratagemPresentation')&&appSource.includes('presentation.decorate(document)')&&appSource.includes('decorateContent:presentation.decorate')&&sharedStratagemPresentation.includes('Battle Tactic|Strategic Ploy|Wargear|Epic Deed|Core')&&sharedStratagemPresentation.includes("'unknown'"));
check('Stratagem primary colors use canonical type selectors rather than turn classes',contentCss.includes('.stratagem[data-stratagem-type="battle-tactic"]')&&contentCss.includes('.stratagem[data-stratagem-type="strategic-ploy"]')&&contentCss.includes('.stratagem[data-stratagem-type="wargear"]')&&contentCss.includes('.stratagem[data-stratagem-type="epic-deed"]')&&contentCss.includes('.stratagem[data-stratagem-type="core"]')&&!contentCss.includes('.stratagem.turn-yours{--strat-color'));
check('Popup actions use equal responsive grid cells and telephone single-column controls',read('styles/popups.css').includes('.popup-actions { display: grid; grid-template-columns: repeat(2,minmax(0,1fr));')&&read('styles/popups.css').includes('@media (max-width: 600px)'));
check('Phone popup shrink-wraps short content and bounds long content internally',/@media\s*\(max-width:\s*800px\)[\s\S]*?\.popup-layer\s*\{[^}]*position:\s*fixed/.test(read('styles/popups.css'))&&/@media\s*\(max-width:\s*800px\)[\s\S]*?\.full-entry-dialog\s*\{[^}]*height:\s*100%/.test(read('styles/popups.css')));
check('Phone popup preserves parent DOM by syncing only the changed suffix',popups.includes('this.ids.length')&&popups.includes('this.closeFrom(0)')&&popups.includes('restore('));
check('Phone popup keeps ordinary closure out of Browser History',!popups.includes('pushState')&&!popups.includes('history.back'));
check('Phone glossary return stores and restores the complete popup chain',sharedArmyBook.includes('record.popupIds?.length')&&sharedArmyBook.includes('popups.restore(record.popupIds'));
check('Phone generated outputs use the shared non-mutating freshness mode',
  mobileBuild.includes('runMobileStubBuilder(import.meta.url')&&
  sharedMobileBuilder.includes("check=process.argv.includes('--check')")&&
  sharedMobileBuilder.includes("if(check){let actual=''")&&
  sharedMobileBuilder.includes('stale or missing')&&sharedMobileBuilder.includes('orphan route')&&
  mobileFreshness.status===0&&mobileFreshness.stdout.includes('Death Guard compatibility routes verified: 48 content-free stubs.'),
  `${mobileFreshness.status}: ${mobileFreshness.stderr||mobileFreshness.stdout}`);
const coreRouteTerm=glossaryRegistry.terms['core-lethal-hits'];
const localRouteTerm=glossaryRegistry.terms['death-guard-ability-the-destroyer-hive-typhus'];
check('canonical terms keep Core rules external while routing Death Guard abilities locally',html.includes('data-term="core-lethal-hits"')&&html.includes('data-term="ability-the-destroyer-hive-70f0cc1"')&&coreRouteTerm?.fullRulePath==='books/core-rules/reader/core-abilities.html#rule-24-23'&&localRouteTerm?.sourceRefs?.includes('death-guard')&&!mobileTyphus.includes('data-term=')&&!mobileIndex.includes('data-rule-id='));
check('responsive section jumps clear the fixed header and safe area',html.includes('id="unit-plague-marines-profile"')&&contentCss.includes('.unit-part { padding-top: 28px; scroll-margin-top: calc(var(--header) + 20px); }')&&read('styles/layout.css').includes('height: calc(var(--header) + env(safe-area-inset-top));')&&read('scripts/journey-controller.js').includes('this.navigation.navigate(unit?.id||targetId,target)'));
check('mobile controls have no delayed decorative motion',/@media\s*\(max-width:\s*800px\)[\s\S]*?\.toc-panel\s*\{[^}]*transition:\s*none/.test(read('styles/navigation.css'))&&/@media\s*\(max-width:\s*800px\)[\s\S]*?\.term-popup\s*\{[^}]*animation:\s*none/.test(read('styles/popups.css')));
check('safe mobile controls activate on touch-down',navigation.includes("this.menuButton.addEventListener('touchstart'")&&popups.includes("const close=event.target.closest('[data-popup-close]')")&&fullEntry.includes("event.target.closest('[data-full-entry-close]')"));
check('static content cards do not impersonate controls',!contentCss.includes('.rule-card:hover')&&!contentCss.includes('.enhancement:hover')&&!contentCss.includes('.glossary-card:hover')&&!contentCss.includes('[data-term]:active'));
check('touch controls use the native fast-tap contract',read('styles/tokens.css').includes('button, a { touch-action: manipulation; -webkit-tap-highlight-color: transparent; }'));
check('touch terms open only after a completed tap, never during a scroll gesture',popups.includes("document.addEventListener('pointerdown'")&&popups.includes("document.addEventListener('pointermove'")&&popups.includes("document.addEventListener('pointerup'")&&popups.includes('this.touchTerm.moved')&&popups.includes('if(!this.touchTerm.moved)this.open'));
check('roster loadout semantics consume canonical catalog rule facts instead of DOM profiles',rosterFilterRuntime.includes('profileFor:raw=>byTitle.get(raw)?.ruleFacts||null')&&rosterCatalog.units.every(unit=>Object.hasOwn(unit,'ruleFacts'))&&!rosterFilterRuntime.includes('WHRosterEntities.loadoutIncludesProfile'));
check('Contagion Engines uses current MFM disposition',JSON.stringify(bookData).includes('Force Disposition: Reconnaissance. Detachment Points: 1DP. Tag: ENGINES.')&&!JSON.stringify(bookData).includes('Force Disposition: Purge the Foe. Detachment Points: 1DP. Tag: ENGINES.'));
check('book uses the unified root manifest',html.includes('href="../../manifest.webmanifest"'));
check('release service worker owns its cache family',readProject('service-worker.js').includes('key.startsWith(CACHE_PREFIX)')&&readProject('service-worker.js').includes('warhammer-rules-fe1d435-'));
check('release PWA cache revision is content-derived',readProject('service-worker.js').includes('self.WH40K_CACHE_REVISION'));
check('Detachment picker stays above Stratagem card badges',contentCss.includes('.full-related-controls{position:relative;z-index:4;'));
check('Detachment picker closes before another datasheet dialog opens',appSource.includes('closeFilterOnOpen:true')&&sharedRelatedRules.includes('if(options.closeFilterOnOpen&&filterMenu)filterMenu.open=false'));
check('book loads the shared navigation target resolver',html.includes('src="../shared/navigation-targets.js?v='));
check('book loads the shared datasheet design',html.includes('href="../shared/datasheet-system.css?v='));
check('book loads the shared datasheet layout',html.includes('src="../shared/datasheet-layout.js?v='));
check('long datasheet abilities use an original-node continuation',datasheetLayout.includes("layout.continuation.className='ability-list ds-abilities-continuation'")&&datasheetLayout.includes('layout.cards.slice(split).forEach(node=>layout.continuation.append(node))'));
check('long datasheet continuation recalculates from available card width',datasheetLayout.includes("'ResizeObserver' in window")&&datasheetLayout.includes('entry.contentRect.width')&&datasheetLayout.includes('restoreAbilities(layout)'));
check('long datasheet continuation spans the datasheet width',datasheetCss.includes('.unit-card.ds-layout .ds-abilities-continuation')&&datasheetCss.includes('grid-template-columns: 1fr'));
check('glossary autolinking and navigation remain installed by the shared runtime',sharedArmyBook.includes('WHGlossaryAutolink?.apply')&&sharedArmyBook.includes('new root.DGNavigation'));
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
await import('./death-guard-mfm-ownership-qa.mjs');
