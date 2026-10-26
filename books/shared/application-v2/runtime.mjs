import {createLifecycle} from '../army-book-app-v2/lifecycle.mjs';
import {mount} from '../army-book-app-v2/runtime.mjs';
import {applicationRouteURL,resolveApplicationRoute} from './routes.mjs';
import {createHomePresenter,createHomeBranding} from './home.mjs';
import {mountGlobalGlossary} from './glossary.mjs';

/** Top-level destinations only. ArmyBookApp retains all book/roster/reference logic. */
export function createApplication(document,{registry,entryURL=new URL('../../../v2/app.html',import.meta.url).href,root=document.body}={}) {
  if(!registry?.entries || root.ownerDocument!==document)throw new TypeError('Application registry and mount root required');
  const view=document.defaultView,lifecycle=createLifecycle(view),previousTitle=document.title;
  const hadClass=document.body.hasAttribute('class'),hadApplicationClass=document.body.classList.contains('v2-application');
  const el=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
  const shell=el('div','v2-application-shell');shell.dataset.v2Shell='';
  const header=el('header','v2-primary-header');
  const brand=createHomeBranding(document,applicationRouteURL(entryURL,{destination:'HOME'}));
  const home=createHomePresenter({document,registry,entryURL});
  const primary=el('nav','v2-primary-nav');primary.dataset.v2PrimaryNav='';primary.setAttribute('aria-label','Application navigation');
  const moduleRoot=el('div','v2-module-root');moduleRoot.dataset.v2MountRoot='';
  const style=el('link');style.rel='stylesheet';style.href=new URL('./shell.css',import.meta.url).href;document.head.append(style);
  header.append(brand,primary);shell.append(header,moduleRoot);root.append(shell);document.body.classList.add('v2-application');
  let activeModule=null,activeBookId=null,activeModuleKind=null,generation=0,ready=Promise.resolve(),currentRoute=null;
  let renderedAddress=view.location.href,renderedState=view.history.state;
  const destinations=[['HOME','Home'],['CORE_RULES','Core Rules'],['ARMY_BOOK','Army Books'],['ROSTER','Roster'],['GLOSSARY','Mega Glossary']];
  const routeFor=destination=>destination==='ARMY_BOOK'?{destination:'HOME',sectionId:'army-books'}:
    destination==='CORE_RULES'?{destination,registryId:'core-rules'}:
    destination==='ROSTER'&&registry.get(currentRoute?.bookId)?.createRoster?{destination,bookId:currentRoute.bookId,registryId:currentRoute.bookId}:{destination};
  const navLinks=new Map();
  for(const [destination,label]of destinations){const link=el('a','',label);link.dataset.v2Destination=destination;navLinks.set(destination,link);primary.append(link);}
  function updateNavigation() {
    let route;try{route=resolveApplicationRoute(view.location.href,registry);}catch{route=null;}
    currentRoute=route;
    const selected=activeModuleKind==='GLOSSARY'?'GLOSSARY':route?.module?(route.destination==='ROSTER'?'ROSTER':'ARMY_BOOK'):
      route?.destination==='HOME'&&route.sectionId==='army-books'?'ARMY_BOOK':route?.destination;
    for(const [destination,link]of navLinks) {
      link.href=applicationRouteURL(entryURL,routeFor(destination));
      if(selected===destination)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
    }
  }
  function stopModule(){activeModule?.destroy();activeModule=null;activeBookId=null;activeModuleKind=null;}
  async function versionIsCurrent(startedOnline) {
    const check=view.WHOfflineStatus?.checkRunningVersion;
    if(typeof check!=='function')return true;
    // The update client owns the confirmation UI. An unavailable/failed guard
    // must not destroy the current book or its unfinished import text.
    try{return await check({startedOnline})===true;}catch{return false;}
  }
  function rememberRenderedLocation(){renderedAddress=view.location.href;renderedState=view.history.state;}
  function preserveCurrentAfterLoadFailure() {
    if(!activeModule)return false;
    view.history.replaceState(renderedState,'',renderedAddress);updateNavigation();
    view.WHOfflineStatus?.reportLoadFailure?.();return true;
  }
  async function transitionAllowed(token,startedOnline) {
    const current=await versionIsCurrent(startedOnline);
    if(!lifecycle.active||token!==generation)return false;
    if(current)return true;
    view.history.replaceState(renderedState,'',renderedAddress);updateNavigation();return false;
  }
  function page(title,introduction) {
    document.title=`${title} · Warhammer 40,000`;
    const main=el('main','v2-home');main.tabIndex=-1;
    main.append(el('p','v2-home-kicker','WARHAMMER 40,000'),el('h1','',title));
    if(introduction)main.append(el('p','v2-home-intro',introduction));
    moduleRoot.replaceChildren(main);return main;
  }
  function destinationCard(title,text,route,bookId) {
    const card=el('a','v2-home-card');card.href=applicationRouteURL(entryURL,route);card.dataset.v2ShellLink='';
    if(bookId)card.dataset.v2Book=bookId;
    card.append(el('h3','',title),el('p','',text),el('span','v2-home-action','Open →'));return card;
  }
  function bookChoices(parent,{roster=false}={}) {
    const grid=el('div','v2-home-grid');
    for(const book of registry.entries.filter(book=>!roster||book.createRoster))grid.append(destinationCard(book.title,roster?'Import a roster and open your personal guide.':'Army rules, detachments and datasheets.',
      {destination:roster?'ROSTER':'ARMY_BOOK',bookId:book.id,registryId:book.id},book.id));
    parent.append(grid);
  }
  function renderHome(route) {
    if(route.destination==='ROSTER') {bookChoices(page('Roster','Choose an Army Book to import your New Recruit roster.'),{roster:true});return;}
    moduleRoot.replaceChildren(home.render(route));
  }
  async function dispatch(event) {
    if(!lifecycle.active)return;
    const startedOnline=view.navigator.onLine;
    // Native/direct query-only destinations use the same module aliases as encodeRoute.
    const address=new URL(view.location.href);
    const alias={ROSTER:'view-roster',PERSONAL_GUIDE:'view-roster-guide',GLOSSARY:'view-glossary'}[address.searchParams.get('v2')];
    if(address.searchParams.has('book')&&alias&&!address.hash) {
      address.hash=alias;view.history.replaceState(view.history.state,'',address.href);
    }
    updateNavigation();
    let route;
    try{route=resolveApplicationRoute(view.location.href,registry);}catch{
      ++generation;stopModule();page('Link unavailable','This link has incomplete or unsupported context. Choose an Army Book to continue.');return;
    }
    const sameBook=route.module&&activeBookId===route.bookId;
    const sameCore=!route.module&&route.destination==='CORE_RULES'&&activeModuleKind==='CORE_RULES';
    const sameGlossary=!route.module&&['GLOSSARY','REFERENCE'].includes(route.destination)&&activeModuleKind==='GLOSSARY';
    if(activeModule&&!sameBook&&!sameCore&&!sameGlossary&&
      (route.module||['CORE_RULES','GLOSSARY','REFERENCE'].includes(route.destination))) {
      // The mounted book also listens to history events. It must not consume
      // a foreign destination while the shell awaits its version decision.
      event?.stopImmediatePropagation();
    }
    if(!route.module&&route.destination==='CORE_RULES') {
      const token=++generation;
      let candidate=null;
      try {
        if(!await transitionAllowed(token))return activeModule;
        const guarded=typeof view.WHOfflineStatus?.checkRunningVersion==='function';
        if(activeModuleKind==='CORE_RULES'&&activeModule&&!guarded){await activeModule.sync(route);if(lifecycle.active&&token===generation){rememberRenderedLocation();updateNavigation();}return activeModule;}
        const {mountCoreReader}=await import('../../core-rules/reader/mount.mjs');
        if(!await transitionAllowed(token,startedOnline))return activeModule;
        if(guarded){
          const previousNodes=[...moduleRoot.childNodes];
          candidate=mountCoreReader(document,{root:moduleRoot,entryURL,route,navigate,deferPresentation:true});
          await candidate.ready;
          if(!await transitionAllowed(token,startedOnline)){candidate.destroy();return activeModule;}
          stopModule();for(const node of previousNodes)node.remove();
          activeModule=candidate;activeModuleKind='CORE_RULES';rememberRenderedLocation();
          await candidate.commit();
          if(!lifecycle.active||token!==generation)return;
          updateNavigation();return activeModule;
        }
        stopModule();
        moduleRoot.replaceChildren();
        activeModule=mountCoreReader(document,{root:moduleRoot,entryURL,route,navigate});activeModuleKind='CORE_RULES';
        rememberRenderedLocation();
        await activeModule.ready;
        if(!lifecycle.active||token!==generation)return;
        updateNavigation();return activeModule;
      } catch {
        if(candidate&&candidate!==activeModule)candidate.destroy();
        if(!lifecycle.active||token!==generation)return;
        if(!await transitionAllowed(token,startedOnline))return activeModule;
        if(preserveCurrentAfterLoadFailure())return activeModule;
        stopModule();page('Core Rules unavailable','This chapter or section could not be opened. Return Home and try again.');return;
      }
    }
    if(!route.module&&['GLOSSARY','REFERENCE'].includes(route.destination)) {
      if(activeModuleKind==='GLOSSARY'&&activeModule){++generation;activeModule.sync();rememberRenderedLocation();updateNavigation();return activeModule;}
      const token=++generation;
      try {
        if(!await transitionAllowed(token))return activeModule;
        const response=await view.fetch(new URL('../../../glossary/v2/generated/index.en.json',import.meta.url));
        if(!response.ok)throw new Error('Glossary unavailable');const corpus=await response.json();
        // Core placements enrich navigation; they are not a dependency of the catalog.
        const loadCoreRoutes=async signal=>{
          const {loadReaderNavigation,createCoreReferenceRoutes}=await import('../../core-rules/reader/mount.mjs');
          return createCoreReferenceRoutes(corpus,await loadReaderNavigation(view,{signal}));
        };
        if(!await transitionAllowed(token,startedOnline))return activeModule;
        stopModule();
        moduleRoot.replaceChildren();
        activeModule=mountGlobalGlossary(document,corpus,{root:moduleRoot,entryURL,loadCoreRoutes,registryLabels:Object.fromEntries(registry.entries.map(book=>[book.id,book.title]))});
        activeModuleKind='GLOSSARY';rememberRenderedLocation();updateNavigation();return activeModule;
      } catch {
        if(!lifecycle.active||token!==generation)return;
        if(!await transitionAllowed(token,startedOnline))return activeModule;
        if(preserveCurrentAfterLoadFailure())return activeModule;
        stopModule();page('Glossary unavailable','The Glossary could not be loaded. Return Home and try again.');return;
      }
    }
    if(route.module&&activeBookId===route.bookId&&activeModule){++generation;rememberRenderedLocation();return activeModule;}
    const token=++generation;
    if(!route.module){stopModule();renderHome(route);rememberRenderedLocation();view.scrollTo({top:0,behavior:'instant'});return;}
    const registration=registry.get(route.bookId);
    try {
      if(!await transitionAllowed(token))return activeModule;
      const [payload,roster]=await Promise.all([registration.loadPayload(),registration.createRoster?.()]);
      if(!await transitionAllowed(token,startedOnline))return activeModule;
      if(payload.book?.id!==registration.id)throw new TypeError('Book registry identity mismatch');
      stopModule();
      moduleRoot.replaceChildren();
      activeModule=mount(document,payload,{root:moduleRoot,roster,styles:registration.styles,assetBaseURL:registration.assetBaseURL});
      activeBookId=registration.id;
      rememberRenderedLocation();
      await activeModule.rosterPanel?.ready;
      if(!lifecycle.active||token!==generation)return;
      updateNavigation();return activeModule;
    } catch {
      if(!lifecycle.active||token!==generation)return;
      if(!await transitionAllowed(token,startedOnline))return activeModule;
      if(preserveCurrentAfterLoadFailure())return activeModule;
      stopModule();page('Army Book unavailable','The Army Book could not be loaded. Return Home and try again.');
    }
  }
  function navigate(route) {
    if(!lifecycle.active)return Promise.resolve();
    const url=applicationRouteURL(entryURL,route);
    activeModule?.capture?.();
    if(view.location.href===renderedAddress)renderedState=view.history.state;
    // Top-level entries start a fresh presentation background. Back restores the old entry unchanged.
    view.history.pushState(null,'',url);view.dispatchEvent(new view.PopStateEvent('popstate'));
    return ready;
  }
  const follow=event=>{
    const link=event.target.closest?.('a');
    if(!link||event.button||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||link.target||link.hasAttribute('download'))return;
    if(!header.contains(link)&&!link.hasAttribute('data-v2-shell-link'))return;
    const url=new URL(link.href);
    if(url.origin!==view.location.origin)return;
    event.preventDefault();activeModule?.capture?.();if(view.location.href===renderedAddress)renderedState=view.history.state;view.history.pushState(null,'',url);view.dispatchEvent(new view.PopStateEvent('popstate'));
  };
  lifecycle.listen(shell,'click',follow);
  lifecycle.listen(moduleRoot,'click',()=>queueMicrotask(lifecycle.guard(updateNavigation)));
  lifecycle.listen(view,'popstate',event=>{ready=dispatch(event);});
  lifecycle.listen(view,'hashchange',event=>{ready=dispatch(event);});
  const api=Object.freeze({navigate,destroy:lifecycle.destroy,get destroyed(){return !lifecycle.active;},
    get ready(){return ready;},get activeModule(){return activeModule;},get activeBookId(){return activeBookId;}});
  const previousApi=view.WarhammerAppV2;
  lifecycle.cleanup(()=>{
    ++generation;stopModule();shell.remove();style.remove();
    document.body.classList.toggle('v2-application',hadApplicationClass);
    if(!hadClass&&!document.body.className)document.body.removeAttribute('class');
    document.title=previousTitle;
    if(view.WarhammerAppV2===api){if(previousApi&&!previousApi.destroyed)view.WarhammerAppV2=previousApi;else delete view.WarhammerAppV2;}
  });
  view.WarhammerAppV2=api;ready=dispatch();return api;
}
